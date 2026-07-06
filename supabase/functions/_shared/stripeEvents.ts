// supabase/functions/_shared/stripeEvents.ts
//
// Stripe webhook event processing, shared by `stripe-webhook` (live deliveries)
// and `stripe-webhook-reconcile` (replay of unprocessed payment_webhook_logs
// rows). Dependency-injected and Deno-API-free so the decision logic is unit
// testable under `node --test` (MES-39).
//
// Outcome semantics drive the webhook's HTTP response and the log row state:
//   ok                     -> mark row 'processed' (or 'ignored'), return 200
//   !ok && retriable       -> mark row 'failed', return 500 so Stripe retries
//   !ok && !retriable      -> mark row 'needs_attention' + alert, return 200
//                             (a retry can never fix missing/invalid metadata)

export const VALID_TIERS = ["free", "growth", "scale", "enterprise", "lead_purchase"];

export type ProcessOutcome =
  | { ok: true; action: "tier_upgraded" | "lead_purchase_recorded" | "ignored" }
  | { ok: false; retriable: boolean; reason: string };

export interface StripeEventLike {
  id: string;
  type: string;
  /** event.data.object — a Checkout Session for the events we act on. */
  dataObj: Record<string, unknown> | null;
}

export interface ProcessDeps {
  /** Service-role Supabase client (or a test stub with the same shape). */
  supabase: {
    from: (table: string) => any;
  };
  /** Best-effort payment-intent lookup for email amounts. Optional. */
  retrievePaymentIntent?: (
    id: string,
  ) => Promise<{ amount: number | null; currency: string | null }>;
  /** Best-effort payment confirmation email. Optional; never blocks the outcome. */
  sendConfirmationEmail?: (args: {
    email: string;
    userId: string;
    tier: string;
    amount: number | null;
    currency: string | null;
    eventId: string;
  }) => Promise<void>;
  log?: (message: string, data?: unknown) => void;
  logError?: (message: string, err?: unknown) => void;
}

export async function processStripeEvent(
  evt: StripeEventLike,
  deps: ProcessDeps,
): Promise<ProcessOutcome> {
  const log = deps.log ?? (() => {});
  const logError = deps.logError ?? (() => {});

  if (evt.type !== "checkout.session.completed") {
    return { ok: true, action: "ignored" };
  }

  const dataObj = (evt.dataObj ?? {}) as Record<string, any>;
  const metadata = (dataObj.metadata ?? {}) as Record<string, string>;
  const tier: string | null = metadata.tier ?? null;
  const supabaseUserId: string | null = metadata.supabase_user_id ?? null;

  if (!tier || !VALID_TIERS.includes(tier)) {
    return {
      ok: false,
      retriable: false,
      reason: `invalid or missing tier in checkout metadata: '${tier}'`,
    };
  }
  if (!supabaseUserId) {
    return {
      ok: false,
      retriable: false,
      reason: "checkout completed but no supabase_user_id in metadata",
    };
  }

  // Lead database purchase (individual product checkout).
  if (tier === "lead_purchase") {
    const leadDatabaseId = metadata.lead_database_id ?? null;
    if (!leadDatabaseId) {
      return {
        ok: false,
        retriable: false,
        reason: "lead_purchase checkout without lead_database_id in metadata",
      };
    }

    const { error: purchaseErr } = await deps.supabase
      .from("lead_database_purchases")
      .upsert(
        {
          user_id: supabaseUserId,
          lead_database_id: leadDatabaseId,
          stripe_session_id: dataObj.id ?? null,
        },
        { onConflict: "user_id,lead_database_id" },
      );

    if (purchaseErr) {
      // DB write failure: a retry CAN fix this — surface it so Stripe redelivers.
      logError("Error recording lead database purchase", purchaseErr);
      return {
        ok: false,
        retriable: true,
        reason: `lead_database_purchases upsert failed: ${purchaseErr.message ?? purchaseErr}`,
      };
    }
    log("Recorded lead database purchase", { supabaseUserId, leadDatabaseId });
    return { ok: true, action: "lead_purchase_recorded" };
  }

  // Subscription tier upgrade.
  const { error: upsertErr } = await deps.supabase
    .from("user_subscriptions")
    .upsert(
      {
        user_id: supabaseUserId,
        tier,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (upsertErr) {
    logError("Error upserting user_subscriptions", upsertErr);
    return {
      ok: false,
      retriable: true,
      reason: `user_subscriptions upsert failed: ${upsertErr.message ?? upsertErr}`,
    };
  }
  log("Upserted user_subscriptions", { supabaseUserId, tier });

  // Keep report badges consistent with the new plan. Failing here fails the
  // whole event: the replay is idempotent (same-tier upsert + same update),
  // so it is safe for Stripe/reconciliation to run it again.
  const { error: reportsErr } = await deps.supabase
    .from("user_reports")
    .update({ tier_at_generation: tier })
    .eq("user_id", supabaseUserId);

  if (reportsErr) {
    logError("Error updating user_reports tier_at_generation", reportsErr);
    return {
      ok: false,
      retriable: true,
      reason: `user_reports tier update failed: ${reportsErr.message ?? reportsErr}`,
    };
  }

  // Best-effort extras: never change the outcome.
  let amount: number | null = typeof dataObj.amount_total === "number" ? dataObj.amount_total : null;
  let currency: string | null = (dataObj.currency as string) ?? null;
  const paymentIntentId = dataObj.payment_intent ? String(dataObj.payment_intent) : null;
  if (paymentIntentId && deps.retrievePaymentIntent) {
    try {
      const pi = await deps.retrievePaymentIntent(paymentIntentId);
      amount = pi.amount ?? amount;
      currency = pi.currency ?? currency;
    } catch (e) {
      log("Could not retrieve payment intent (non-blocking)", { paymentIntentId, error: String(e) });
    }
  }

  const userEmail: string | null =
    dataObj.customer_details?.email || dataObj.customer_email || null;
  if (userEmail && deps.sendConfirmationEmail) {
    try {
      await deps.sendConfirmationEmail({
        email: userEmail,
        userId: supabaseUserId,
        tier,
        amount,
        currency,
        eventId: evt.id,
      });
    } catch (emailErr) {
      log("Failed to send payment confirmation email (non-blocking)", {
        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
    }
  }

  return { ok: true, action: "tier_upgraded" };
}

/** Map a process outcome to the payment_webhook_logs processing_status value. */
export function statusForOutcome(outcome: ProcessOutcome): string {
  if (outcome.ok) return outcome.action === "ignored" ? "ignored" : "processed";
  return outcome.retriable ? "failed" : "needs_attention";
}

/**
 * PII-free payments alert to Slack (chat.postMessage). Uses the existing
 * SLACK_BOT_TOKEN; the target channel comes from PAYMENTS_ALERT_SLACK_CHANNEL.
 * Returns false (and logs) when not configured — alerting must never take the
 * webhook down. Never include customer emails/names in `text`.
 */
export async function postPaymentsAlert(
  text: string,
  env: { botToken?: string; channel?: string },
  logError: (message: string, err?: unknown) => void,
): Promise<boolean> {
  if (!env.botToken || !env.channel) {
    logError(`payments alert not delivered (Slack not configured): ${text}`);
    return false;
  }
  try {
    const resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${env.botToken}`,
      },
      body: JSON.stringify({ channel: env.channel, text }),
    });
    const body = await resp.json();
    if (!body.ok) {
      logError("payments alert Slack post failed", body.error);
      return false;
    }
    return true;
  } catch (err) {
    logError("payments alert Slack post threw", err);
    return false;
  }
}

/** True when a PostgREST/Postgres error means the MES-39 state columns don't exist yet. */
export function isMissingColumnError(err: unknown): boolean {
  const message = String((err as { message?: string })?.message ?? err ?? "");
  const code = String((err as { code?: string })?.code ?? "");
  return (
    code === "42703" ||
    code === "PGRST204" ||
    /column .* does not exist/i.test(message) ||
    /processing_status.*schema cache/i.test(message) ||
    /could not find .*processing_status/i.test(message)
  );
}
