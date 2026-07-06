// supabase/functions/stripe-webhook/index.ts
//
// MES-39: reliable webhook processing. The old flow wrote the dedup row BEFORE
// processing, so a first-attempt failure returned 500, Stripe retried, and the
// retry hit the dedup check and no-oped — charged-but-never-upgraded. Missing
// metadata was swallowed with a silent 200.
//
// New flow (payment_webhook_logs carries processing state — see migration
// 20260706101500_mes39_payment_webhook_logs_processing_state.sql):
//   1. verify signature
//   2. claim: existing row 'processed'/'ignored' -> duplicate no-op 200;
//      existing unprocessed row -> retry (attempts+1); else insert 'received'
//   3. process (shared with stripe-webhook-reconcile)
//   4. ok               -> mark 'processed'/'ignored', 200
//      retriable fail   -> mark 'failed', 500 (Stripe redelivers and REPROCESSES)
//      unfixable fail   -> mark 'needs_attention', Slack alert, 200
//
// Until the migration is applied the state columns don't exist; the handler
// falls back to legacy-mode: process FIRST, log only after success, so a
// failure leaves no dedup row and Stripe's retry still reprocesses.

import Stripe from "https://esm.sh/stripe@12?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";
import {
  isMissingColumnError,
  postPaymentsAlert,
  processStripeEvent,
  statusForOutcome,
  type ProcessDeps,
} from "../_shared/stripeEvents.ts";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const PAYMENTS_ALERT_SLACK_CHANNEL = Deno.env.get("PAYMENTS_ALERT_SLACK_CHANNEL") ?? "";

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2022-11-15" });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const processDeps: ProcessDeps = {
  supabase: supabaseAdmin,
  retrievePaymentIntent: async (id: string) => {
    const pi = await stripe.paymentIntents.retrieve(id);
    return { amount: pi.amount ?? null, currency: pi.currency ?? null };
  },
  sendConfirmationEmail: async ({ email, userId, tier, amount, currency, eventId }) => {
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": Deno.env.get("EMAIL_INTERNAL_SECRET")!,
      },
      body: JSON.stringify({
        email_type: "payment_confirmation",
        recipient_email: email,
        user_id: userId,
        data: {
          tier,
          amount: amount ? (amount / 100).toFixed(2) : null,
          currency: currency?.toUpperCase() || "AUD",
          stripe_event_id: eventId,
        },
      }),
    });
  },
  log: (message, data) => log("stripe-webhook", message, data),
  logError: (message, err) => logError("stripe-webhook", message, err),
};

async function alert(text: string): Promise<void> {
  await postPaymentsAlert(
    text,
    { botToken: SLACK_BOT_TOKEN, channel: PAYMENTS_ALERT_SLACK_CHANNEL },
    (message, err) => logError("stripe-webhook", message, err),
  );
}

async function markLog(eventId: string, fields: Record<string, unknown>): Promise<void> {
  const { error } = await supabaseAdmin
    .from("payment_webhook_logs")
    .update(fields)
    .eq("stripe_event_id", eventId);
  if (error) logError("stripe-webhook", "Failed to update payment_webhook_logs state", error);
}

type Claim =
  | { kind: "duplicate" }
  | { kind: "claimed" } // state row exists with processing_status='received'/'failed'
  | { kind: "legacy" }; // state columns absent (migration not applied yet)

async function claimEvent(
  event: Stripe.Event,
  parsed: Record<string, unknown>,
): Promise<Claim> {
  const { data: existing, error: selectErr } = await supabaseAdmin
    .from("payment_webhook_logs")
    .select("stripe_event_id, processing_status, attempts")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (selectErr) {
    if (isMissingColumnError(selectErr)) {
      // Pre-migration schema: dedup on bare row existence (legacy rows are
      // only written after successful processing, so existence == processed).
      const { data: legacyRow, error: legacyErr } = await supabaseAdmin
        .from("payment_webhook_logs")
        .select("stripe_event_id")
        .eq("stripe_event_id", event.id)
        .maybeSingle();
      if (legacyErr) throw legacyErr;
      return legacyRow ? { kind: "duplicate" } : { kind: "legacy" };
    }
    throw selectErr;
  }

  if (existing) {
    if (existing.processing_status === "processed" || existing.processing_status === "ignored") {
      return { kind: "duplicate" };
    }
    // Unprocessed row: this is a Stripe retry (or a crashed first attempt) —
    // reprocess instead of short-circuiting.
    await markLog(event.id, { attempts: (existing.attempts ?? 0) + 1 });
    return { kind: "claimed" };
  }

  const { error: insertErr } = await supabaseAdmin.from("payment_webhook_logs").insert({
    stripe_event_id: event.id,
    stripe_payload: event.data?.object ?? {},
    parsed,
    event_type: event.type,
    processing_status: "received",
    attempts: 1,
  });

  if (insertErr) {
    if (isMissingColumnError(insertErr)) return { kind: "legacy" };
    // Unique violation = a concurrent delivery of the same event already
    // claimed it; let that in-flight attempt own the outcome.
    if (String((insertErr as { code?: string }).code) === "23505") {
      return { kind: "duplicate" };
    }
    throw insertErr;
  }
  return { kind: "claimed" };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
  try {
    if (req.method !== "POST") {
      return new Response("method not allowed", { status: 405, headers: corsHeaders });
    }

    // Grab raw body as ArrayBuffer to preserve exact bytes for signature check
    const body = await req.arrayBuffer();
    const rawBody = new TextDecoder("utf-8").decode(body);

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return new Response("Missing stripe-signature header", { status: 400, headers: corsHeaders });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: Error | any) {
      logError("stripe-webhook", "Webhook signature verification failed", err);
      return new Response("Webhook signature verification failed", { status: 400, headers: corsHeaders });
    }

    log("stripe-webhook", "Received Stripe event", { eventId: event.id, type: event.type });

    const dataObj = (event.data && event.data.object) ? (event.data.object as any) : null;
    const parsed = {
      metadata: dataObj?.metadata ?? {},
      clientReferenceId: dataObj?.client_reference_id ?? null,
      paymentIntentId: dataObj?.payment_intent ? String(dataObj.payment_intent) : null,
      amount: dataObj?.amount_total ?? null,
      currency: dataObj?.amount_total ? dataObj?.currency ?? null : null,
      eventType: event.type,
    };

    const claim = await claimEvent(event, parsed);

    if (claim.kind === "duplicate") {
      log("stripe-webhook", "Duplicate Stripe event detected, skipping", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    const outcome = await processStripeEvent(
      { id: event.id, type: event.type, dataObj },
      processDeps,
    );

    if (claim.kind === "legacy") {
      // Pre-migration: no state columns. Log AFTER the outcome is known so a
      // retriable failure leaves no dedup row and Stripe's retry reprocesses.
      if (outcome.ok || !outcome.retriable) {
        const { error: insertErr } = await supabaseAdmin.from("payment_webhook_logs").insert({
          stripe_event_id: event.id,
          stripe_payload: event.data?.object ?? {},
          parsed,
        });
        if (insertErr) logError("stripe-webhook", "Legacy-mode log insert failed", insertErr);
      }
    } else {
      await markLog(event.id, {
        processing_status: statusForOutcome(outcome),
        processed_at: outcome.ok ? new Date().toISOString() : null,
        last_error: outcome.ok ? null : outcome.reason,
      });
    }

    if (!outcome.ok) {
      if (outcome.retriable) {
        logError("stripe-webhook", "Processing failed; returning 500 so Stripe retries", {
          eventId: event.id,
          reason: outcome.reason,
        });
        return new Response(
          JSON.stringify({ error: "Failed to process event" }),
          { status: 500, headers: jsonHeaders },
        );
      }
      // Unfixable by retry (bad/missing metadata): keep the replayable log row,
      // page a human, and 200 so Stripe stops hammering us. No PII in the alert.
      logError("stripe-webhook", "Event needs attention (not retriable)", {
        eventId: event.id,
        reason: outcome.reason,
      });
      await alert(
        `:rotating_light: stripe-webhook: event \`${event.id}\` (${event.type}) needs attention — ${outcome.reason}. Row kept in payment_webhook_logs for replay/manual fix.`,
      );
      return new Response(
        JSON.stringify({ received: true, needs_attention: true }),
        { status: 200, headers: jsonHeaders },
      );
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err) {
    logError("stripe-webhook", "webhook handler error", err);
    return new Response("internal error", { status: 500, headers: corsHeaders });
  }
});
