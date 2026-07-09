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

// Subscription tier ordering (legacy premium/concierge normalized in), used to
// prevent a stale/replayed lower-tier event from DOWNGRADING a paying customer
// who has since bought a higher tier (MES-39 review #1).
export const TIER_RANK: Record<string, number> = { free: 0, growth: 1, scale: 2, enterprise: 3 };
export function normalizeTier(t: string | null | undefined): string {
  if (t === "premium") return "growth";
  if (t === "concierge") return "enterprise";
  return t ?? "free";
}
// Returns the rank, or null when the tier is a non-empty value we don't
// recognize (so callers can fail safe instead of treating it as rank 0 — see
// the downgrade guard, MES-39 review #4).
function tierRankOrNull(t: string | null | undefined): number | null {
  if (!t) return null;
  const rank = TIER_RANK[normalizeTier(t)];
  return rank === undefined ? null : rank;
}

// After this many failed processing attempts a "retriable" failure is treated
// as permanent (needs_attention) instead of looping forever (MES-39 review #2).
export const MAX_PROCESS_ATTEMPTS = 5;

export type ProcessOutcome =
  | {
      ok: true;
      action: "tier_upgraded" | "lead_purchase_recorded" | "ignored" | "skipped_downgrade";
      /** True when a confirmation email was actually dispatched this run, so the
       *  caller can persist email_sent and avoid re-sending on replay (review #6). */
      emailed?: boolean;
    }
  | { ok: false; retriable: boolean; reason: string };

export interface ProcessOpts {
  /** Skip the confirmation email — set when the row already has email_sent=true
   *  so a reprocess/reconcile replay doesn't send a duplicate (review #6). */
  suppressConfirmationEmail?: boolean;
}

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

/**
 * Summary of a checkout session for the payment_webhook_logs.parsed column.
 * A 100% promotion code produces amount_total = 0 and payment_intent = null
 * (Stripe creates no PaymentIntent for $0 payment-mode sessions), which is a
 * legitimate tier grant — `zero_amount_grant` makes those free grants
 * auditable (MES-STRIPE-PROD), and currency is recorded even when the amount
 * is 0 (`amount_total && …` would drop it).
 */
export function parseSessionSummary(
  dataObj: Record<string, unknown> | null,
  eventType: string,
): Record<string, unknown> {
  const obj = dataObj ?? {};
  const amount = typeof obj.amount_total === "number" ? obj.amount_total : null;
  const totalDetails = (obj.total_details ?? {}) as Record<string, unknown>;
  return {
    metadata: obj.metadata ?? {},
    clientReferenceId: obj.client_reference_id ?? null,
    paymentIntentId: obj.payment_intent ? String(obj.payment_intent) : null,
    amount,
    currency: obj.currency ?? null,
    eventType,
    zero_amount_grant: amount === 0,
    amount_discount: totalDetails.amount_discount ?? null,
  };
}

export async function processStripeEvent(
  evt: StripeEventLike,
  deps: ProcessDeps,
  opts: ProcessOpts = {},
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

  // Fail loud on missing/invalid metadata: this app creates checkouts ONLY via
  // create-checkout, which always sets tier + supabase_user_id, so a checkout
  // lacking them means either that path regressed or a foreign (non-app)
  // checkout exists. Page a human rather than silently ignoring — a charged-but-
  // never-upgraded customer with no signal is the failure MES-39 exists to catch.
  // NOTE: if Stripe Payment Links / dashboard payments are ever introduced (they
  // legitimately lack our metadata), filter them here by a positive marker
  // (e.g. a dedicated metadata flag) instead of loosening this to a silent ignore.
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

  // Subscription tier upgrade. Never downgrade: a replayed/stale lower-tier
  // event must not overwrite a customer who already holds a higher tier
  // (MES-39 review #1). Best-effort — a read failure falls through to the
  // upsert rather than blocking a legitimate upgrade.
  const { data: currentSub, error: currentErr } = await deps.supabase
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", supabaseUserId)
    .maybeSingle();
  if (currentErr) {
    log("Could not read current tier before upsert (proceeding)", { error: currentErr.message ?? currentErr });
  } else if (currentSub?.tier) {
    const currentRank = tierRankOrNull(currentSub.tier);
    // Fail safe: an unrecognized current tier (rank null — e.g. a newer paid
    // tier added to the enum without updating TIER_RANK) must NOT be treated as
    // rank 0 and silently overwritten. We also can't tell if the event is an
    // up- or down-grade, so DON'T write and page a human (needs_attention) —
    // returning ok here would mark the row processed with no alert and could
    // leave a paying customer un-upgraded (review #4 / delta A-2).
    if (currentRank === null) {
      logError("Unknown current subscription tier — needs manual review", {
        supabaseUserId,
        currentTier: currentSub.tier,
        eventTier: tier,
      });
      return {
        ok: false,
        retriable: false,
        reason: "unrecognized current subscription tier; not writing to avoid a possible downgrade",
      };
    }
    if (currentRank > (tierRankOrNull(tier) ?? 0)) {
      log("Skipping tier downgrade", {
        supabaseUserId,
        currentTier: currentSub.tier,
        eventTier: tier,
      });
      return { ok: true, action: "skipped_downgrade" };
    }
  }

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
  if (dataObj.amount_total === 0) {
    // Promotional (100%-code) grant — loud in logs so free grants are easy to
    // audit alongside the zero_amount_grant marker in payment_webhook_logs.
    log("Tier granted at $0 (promotional checkout)", { supabaseUserId, tier });
  }

  // Keep report badges consistent with the new plan. BEST-EFFORT: the tier is
  // already applied (the upsert above is the entitlement of record), so a
  // failure on this cosmetic display-only update must NOT fail the event —
  // otherwise a transient error here blocks the confirmation email and pages a
  // human for an already-charged-and-upgraded customer (review #1). This is
  // fire-and-forget: the row is still marked processed, so a persistently-
  // failing badge write is NOT retried by reconcile and surfaces only in logs
  // (acceptable — the badge is display-only, not the entitlement of record).
  const { error: reportsErr } = await deps.supabase
    .from("user_reports")
    .update({ tier_at_generation: tier })
    .eq("user_id", supabaseUserId);

  if (reportsErr) {
    logError("Error updating user_reports tier_at_generation (non-blocking)", reportsErr);
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

  // Confirmation email — suppressed when the caller says it was already sent
  // (row.email_sent), so a reprocess/reconcile replay doesn't duplicate it
  // (review #6). `emailed` is returned so the caller can persist email_sent.
  let emailed = false;
  const userEmail: string | null =
    dataObj.customer_details?.email || dataObj.customer_email || null;
  if (userEmail && deps.sendConfirmationEmail && !opts.suppressConfirmationEmail) {
    try {
      await deps.sendConfirmationEmail({
        email: userEmail,
        userId: supabaseUserId,
        tier,
        amount,
        currency,
        eventId: evt.id,
      });
      emailed = true;
    } catch (emailErr) {
      log("Failed to send payment confirmation email (non-blocking)", {
        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
    }
  }

  return { ok: true, action: "tier_upgraded", emailed };
}

/** Map a process outcome to the payment_webhook_logs processing_status value. */
export function statusForOutcome(outcome: ProcessOutcome): string {
  if (outcome.ok) return outcome.action === "ignored" ? "ignored" : "processed";
  return outcome.retriable ? "failed" : "needs_attention";
}

/**
 * Terminal status accounting for retry exhaustion. A retriable failure that has
 * already used MAX_PROCESS_ATTEMPTS is escalated to needs_attention so it stops
 * being retried/replayed forever and instead pages a human (MES-39 review #2).
 * `escalated` tells the caller to alert + return 200 instead of 500.
 */
export function resolveStatus(
  outcome: ProcessOutcome,
  attempts: number,
): { status: string; escalated: boolean } {
  const base = statusForOutcome(outcome);
  if (base === "failed" && attempts >= MAX_PROCESS_ATTEMPTS) {
    return { status: "needs_attention", escalated: true };
  }
  return { status: base, escalated: false };
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
