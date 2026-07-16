// supabase/functions/stripe-webhook-reconcile/index.ts
//
// MES-39 reconciliation loop over payment_webhook_logs. Even with the
// received/processed split in `stripe-webhook`, an isolate can die between
// claiming an event and marking it processed, and Stripe's retry window is
// finite. This function replays anything left unprocessed and pages a human
// (Slack, no PII) about rows a replay cannot fix.
//
// - Rows with processing_status IN ('received','failed') older than
//   REPLAY_AFTER_MINUTES are re-run through the same processStripeEvent logic
//   the webhook uses (idempotent: same-tier upsert + same update).
// - Rows still unprocessed or 'needs_attention' older than ALERT_AFTER_MINUTES
//   are summarised into a Slack alert.
//
// Auth: `x-internal-secret` must equal STRIPE_RECONCILE_SECRET (falls back to
// EMAIL_INTERNAL_SECRET so no new secret is strictly required) — same pattern
// as process-email-queue. verify_jwt=false in config.toml so pg_cron or an
// admin curl can invoke it. Suggested cron: every 15 minutes (see the MES-39
// PR for the pg_cron snippet; scheduling is a human-applied prod change).

import Stripe from "https://esm.sh/stripe@12?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import {
  isMissingColumnError,
  postPaymentsAlert,
  processStripeEvent,
  resolveStatus,
  type ProcessDeps,
} from "../_shared/stripeEvents.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET")!;
const INTERNAL_SECRET = Deno.env.get("STRIPE_RECONCILE_SECRET") ??
  Deno.env.get("EMAIL_INTERNAL_SECRET") ?? "";
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const PAYMENTS_ALERT_SLACK_CHANNEL = Deno.env.get("PAYMENTS_ALERT_SLACK_CHANNEL") ?? "";

const REPLAY_AFTER_MINUTES = 10;
const ALERT_AFTER_MINUTES = 60;
const BATCH_LIMIT = 50;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2022-11-15" });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const processDeps: ProcessDeps = {
  supabase: supabaseAdmin,
  // MES-195 (T8): a reconcile-replayed event must grant entitlements too (idempotent
  // on (source_purchase, kind)); mirror the webhook's ENTITLEMENTS_ENABLED flag.
  entitlementsEnabled: Deno.env.get("ENTITLEMENTS_ENABLED") === "true",
  retrievePaymentIntent: async (id: string) => {
    const pi = await stripe.paymentIntents.retrieve(id);
    return { amount: pi.amount ?? null, currency: pi.currency ?? null };
  },
  sendConfirmationEmail: async ({ email, userId, tier, amount, currency, eventId }) => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
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
    // Throw on non-2xx so a failed send is not latched as email_sent (review B-Q5).
    if (!resp.ok) {
      throw new Error(`send-email returned ${resp.status}`);
    }
  },
  log: (message, data) => log("stripe-webhook-reconcile", message, data),
  logError: (message, err) => logError("stripe-webhook-reconcile", message, err),
};

interface LogRow {
  stripe_event_id: string;
  stripe_payload: Record<string, unknown> | null;
  parsed: Record<string, unknown> | null;
  event_type: string | null;
  processing_status: string;
  attempts: number | null;
  created_at: string;
  email_sent: boolean | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  if (!INTERNAL_SECRET || req.headers.get("x-internal-secret") !== INTERNAL_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const replayCutoff = new Date(Date.now() - REPLAY_AFTER_MINUTES * 60_000).toISOString();

    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from("payment_webhook_logs")
      .select("stripe_event_id, stripe_payload, parsed, event_type, processing_status, attempts, created_at, email_sent")
      .in("processing_status", ["received", "failed"])
      .lt("created_at", replayCutoff)
      .order("created_at", { ascending: true })
      .limit(BATCH_LIMIT);

    if (fetchErr) {
      // Pre-migration: the processing-state columns don't exist yet. No-op
      // cleanly instead of 500ing every run until a human applies the
      // migration and schedules this (review #8).
      if (isMissingColumnError(fetchErr)) {
        log("stripe-webhook-reconcile", "State columns absent (migration not applied) — nothing to reconcile", {});
        return new Response(JSON.stringify({ skipped: "migration_not_applied" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw fetchErr;
    }

    let replayed = 0;
    let stillFailing = 0;
    let escalatedNow = 0;
    for (const row of (rows ?? []) as LogRow[]) {
      const attempts = (row.attempts ?? 0) + 1;
      const eventType = row.event_type ?? (row.parsed?.eventType as string | undefined) ?? null;

      // Unresolvable event type: do NOT hand it to processStripeEvent, which
      // would treat a non-'checkout.session.completed' type as 'ignored' and
      // mark the row processed — silently dropping a possibly-real payment.
      // Flag for a human instead (review #9).
      if (!eventType) {
        await supabaseAdmin
          .from("payment_webhook_logs")
          .update({ processing_status: "needs_attention", last_error: "unresolved event_type", attempts })
          .eq("stripe_event_id", row.stripe_event_id);
        stillFailing++;
        escalatedNow++;
        logError("stripe-webhook-reconcile", "Row has unresolvable event_type — needs_attention", {
          eventId: row.stripe_event_id,
        });
        continue;
      }

      const outcome = await processStripeEvent(
        { id: row.stripe_event_id, type: eventType, dataObj: row.stripe_payload ?? null },
        processDeps,
        { suppressConfirmationEmail: row.email_sent ?? false },
      );
      // A retriable failure that has exhausted its retries flips to
      // needs_attention so it drops out of the replay set (review #2) — the
      // 'received'/'failed' query above no longer picks it up.
      const { status, escalated } = resolveStatus(outcome, attempts);
      const { error: markErr } = await supabaseAdmin
        .from("payment_webhook_logs")
        .update({
          processing_status: status,
          processed_at: outcome.ok ? new Date().toISOString() : null,
          last_error: outcome.ok ? null : outcome.reason,
          attempts,
          ...(outcome.ok && outcome.emailed ? { email_sent: true } : {}),
        })
        .eq("stripe_event_id", row.stripe_event_id);
      if (markErr) logError("stripe-webhook-reconcile", "Failed to mark replayed row", markErr);
      if (outcome.ok) replayed++;
      else stillFailing++;
      if (escalated) escalatedNow++;
      log("stripe-webhook-reconcile", "Replayed event", {
        eventId: row.stripe_event_id,
        eventType,
        outcome: status,
      });
    }

    // Alert immediately when this run escalated any row to needs_attention, so
    // a human is paged now rather than waiting up to ALERT_AFTER_MINUTES for
    // the stale-sweep below (review #3). Event ids are surfaced by the sweep;
    // here we only signal that escalations happened this run.
    if (escalatedNow > 0) {
      await postPaymentsAlert(
        `:rotating_light: stripe-webhook-reconcile: ${escalatedNow} payment webhook event(s) escalated to needs_attention this run (retries exhausted or unresolvable). Check payment_webhook_logs.`,
        { botToken: SLACK_BOT_TOKEN, channel: PAYMENTS_ALERT_SLACK_CHANNEL },
        (message, err) => logError("stripe-webhook-reconcile", message, err),
      );
    }

    // Alert on anything old and still unresolved (replay-resistant failures
    // and needs_attention rows a human must handle). Event ids only — no PII.
    const alertCutoff = new Date(Date.now() - ALERT_AFTER_MINUTES * 60_000).toISOString();
    const { data: stuck, error: stuckErr } = await supabaseAdmin
      .from("payment_webhook_logs")
      .select("stripe_event_id, event_type, processing_status, created_at")
      .in("processing_status", ["received", "failed", "needs_attention"])
      .lt("created_at", alertCutoff)
      .order("created_at", { ascending: true })
      .limit(20);

    if (stuckErr) throw stuckErr;

    if ((stuck ?? []).length > 0) {
      // Event id + status + age only. The raw last_error stays in the
      // admin-only payment_webhook_logs table, never in Slack, so a future
      // schema change can't leak a row value into the alert (review #6).
      const lines = (stuck as Array<LogRow>).map((r) =>
        `• \`${r.stripe_event_id}\` (${r.event_type ?? "?"}) ${r.processing_status} since ${r.created_at}`
      );
      await postPaymentsAlert(
        `:warning: stripe-webhook-reconcile: ${stuck!.length} payment webhook event(s) unprocessed for >${ALERT_AFTER_MINUTES}m:\n${lines.join("\n")}`,
        { botToken: SLACK_BOT_TOKEN, channel: PAYMENTS_ALERT_SLACK_CHANNEL },
        (message, err) => logError("stripe-webhook-reconcile", message, err),
      );
    }

    const summary = { replayed, still_failing: stillFailing, escalated: escalatedNow, alerted: (stuck ?? []).length };
    log("stripe-webhook-reconcile", "Run complete", summary);
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logError("stripe-webhook-reconcile", "reconcile run failed", err);
    return new Response(JSON.stringify({ error: "internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
