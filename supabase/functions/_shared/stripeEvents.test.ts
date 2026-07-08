/**
 * MES-39 tests for the shared Stripe webhook processing logic (pure, DI'd).
 * Run: `npm test`.
 *
 * The outcome contract is what makes the webhook reliable:
 *   ok               -> row 'processed'/'ignored', 200
 *   retriable fail   -> row 'failed', 500 (Stripe redelivers and reprocesses)
 *   unfixable fail   -> row 'needs_attention', alert, 200
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isMissingColumnError,
  processStripeEvent,
  resolveStatus,
  statusForOutcome,
  MAX_PROCESS_ATTEMPTS,
} from "./stripeEvents.ts";

interface Call {
  table: string;
  op: string;
  payload?: unknown;
}

function makeSupabaseStub(opts: {
  subscriptionUpsertError?: { message: string } | null;
  reportsUpdateError?: { message: string } | null;
  leadUpsertError?: { message: string } | null;
  // Current user_subscriptions.tier the downgrade-guard read returns (null = no row).
  currentTier?: string | null;
  currentTierError?: { message: string } | null;
} = {}) {
  const calls: Call[] = [];
  return {
    calls,
    from(table: string) {
      return {
        upsert(payload: unknown) {
          calls.push({ table, op: "upsert", payload });
          const error = table === "user_subscriptions"
            ? opts.subscriptionUpsertError ?? null
            : opts.leadUpsertError ?? null;
          return Promise.resolve({ error });
        },
        update(payload: unknown) {
          calls.push({ table, op: "update", payload });
          return {
            eq: () => Promise.resolve({ error: opts.reportsUpdateError ?? null }),
          };
        },
        // Downgrade-guard read: from('user_subscriptions').select('tier').eq().maybeSingle()
        select(_cols: string) {
          calls.push({ table, op: "select" });
          return {
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: opts.currentTier !== undefined ? { tier: opts.currentTier } : null,
                  error: opts.currentTierError ?? null,
                }),
            }),
          };
        },
      };
    },
  };
}

function checkoutEvent(metadata: Record<string, string>, extra: Record<string, unknown> = {}) {
  return {
    id: "evt_test_1",
    type: "checkout.session.completed",
    dataObj: { id: "cs_test_1", metadata, ...extra },
  };
}

test("non-checkout events are ignored (ok) and marked 'ignored'", async () => {
  const supabase = makeSupabaseStub();
  const outcome = await processStripeEvent(
    { id: "evt_x", type: "payment_intent.succeeded", dataObj: {} },
    { supabase },
  );
  assert.deepEqual(outcome, { ok: true, action: "ignored" });
  assert.equal(statusForOutcome(outcome), "ignored");
  assert.equal(supabase.calls.length, 0);
});

test("happy path: tier upsert + report badge update, marked 'processed'", async () => {
  const supabase = makeSupabaseStub();
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "growth", supabase_user_id: "user-1" }),
    { supabase },
  );
  assert.deepEqual(outcome, { ok: true, action: "tier_upgraded" });
  assert.equal(statusForOutcome(outcome), "processed");
  const tables = supabase.calls.map((c) => `${c.table}:${c.op}`);
  // downgrade-guard read, then upsert, then report-badge update
  assert.deepEqual(tables, [
    "user_subscriptions:select",
    "user_subscriptions:upsert",
    "user_reports:update",
  ]);
  const upsertCall = supabase.calls.find((c) => c.op === "upsert")!;
  assert.equal((upsertCall.payload as { tier: string }).tier, "growth");
});

test("subscription upsert failure is RETRIABLE -> 'failed' (Stripe retry reprocesses)", async () => {
  const supabase = makeSupabaseStub({ subscriptionUpsertError: { message: "db down" } });
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "scale", supabase_user_id: "user-1" }),
    { supabase },
  );
  assert.equal(outcome.ok, false);
  assert.ok(!outcome.ok && outcome.retriable, "must be retriable");
  assert.match(!outcome.ok ? outcome.reason : "", /user_subscriptions upsert failed/);
  assert.equal(statusForOutcome(outcome), "failed");
});

test("retry after transient failure succeeds (same event replayed)", async () => {
  // First attempt fails...
  const failing = makeSupabaseStub({ subscriptionUpsertError: { message: "boom" } });
  const evt = checkoutEvent({ tier: "growth", supabase_user_id: "user-1" });
  const first = await processStripeEvent(evt, { supabase: failing });
  assert.equal(first.ok, false);
  // ...the redelivered event processes cleanly and exactly once applies the tier.
  const healthy = makeSupabaseStub();
  const second = await processStripeEvent(evt, { supabase: healthy });
  assert.deepEqual(second, { ok: true, action: "tier_upgraded" });
  assert.equal(
    healthy.calls.filter((c) => c.table === "user_subscriptions" && c.op === "upsert").length,
    1,
  );
});

test("missing supabase_user_id is NOT retriable -> 'needs_attention'", async () => {
  const supabase = makeSupabaseStub();
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "growth" }),
    { supabase },
  );
  assert.equal(outcome.ok, false);
  assert.ok(!outcome.ok && !outcome.retriable, "retry cannot fix missing metadata");
  assert.match(!outcome.ok ? outcome.reason : "", /supabase_user_id/);
  assert.equal(statusForOutcome(outcome), "needs_attention");
  assert.equal(supabase.calls.length, 0, "no writes on bad metadata");
});

test("invalid tier is NOT retriable -> 'needs_attention'", async () => {
  const supabase = makeSupabaseStub();
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "platinum", supabase_user_id: "user-1" }),
    { supabase },
  );
  assert.equal(outcome.ok, false);
  assert.ok(!outcome.ok && !outcome.retriable);
  assert.equal(statusForOutcome(outcome), "needs_attention");
});

test("lead purchase: happy path and missing lead_database_id", async () => {
  const supabase = makeSupabaseStub();
  const ok = await processStripeEvent(
    checkoutEvent({ tier: "lead_purchase", supabase_user_id: "u1", lead_database_id: "db1" }),
    { supabase },
  );
  assert.deepEqual(ok, { ok: true, action: "lead_purchase_recorded" });
  assert.deepEqual(supabase.calls.map((c) => c.table), ["lead_database_purchases"]);

  const bad = await processStripeEvent(
    checkoutEvent({ tier: "lead_purchase", supabase_user_id: "u1" }),
    { supabase: makeSupabaseStub() },
  );
  assert.equal(bad.ok, false);
  assert.ok(!bad.ok && !bad.retriable);
});

test("lead purchase upsert failure is retriable", async () => {
  const supabase = makeSupabaseStub({ leadUpsertError: { message: "conflict" } });
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "lead_purchase", supabase_user_id: "u1", lead_database_id: "db1" }),
    { supabase },
  );
  assert.equal(outcome.ok, false);
  assert.ok(!outcome.ok && outcome.retriable);
});

test("confirmation email failure never changes a successful outcome", async () => {
  const supabase = makeSupabaseStub();
  const outcome = await processStripeEvent(
    checkoutEvent(
      { tier: "growth", supabase_user_id: "user-1" },
      { customer_details: { email: "buyer@example.com" } },
    ),
    {
      supabase,
      sendConfirmationEmail: async () => {
        throw new Error("resend down");
      },
    },
  );
  assert.deepEqual(outcome, { ok: true, action: "tier_upgraded" });
});

// --- MES-39 review #1: never downgrade a paying customer -----------------------------

test("stale lower-tier event does NOT downgrade a higher current tier", async () => {
  // User already holds 'scale'; a replayed 'growth' checkout must be a no-op.
  const supabase = makeSupabaseStub({ currentTier: "scale" });
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "growth", supabase_user_id: "user-1" }),
    { supabase },
  );
  assert.deepEqual(outcome, { ok: true, action: "skipped_downgrade" });
  assert.equal(statusForOutcome(outcome), "processed");
  // read happened, but NO upsert/update wrote the lower tier
  assert.ok(supabase.calls.every((c) => c.op !== "upsert" && c.op !== "update"));
});

test("legacy tier aliases are normalized (concierge outranks scale)", async () => {
  const supabase = makeSupabaseStub({ currentTier: "concierge" }); // == enterprise
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "scale", supabase_user_id: "user-1" }),
    { supabase },
  );
  assert.deepEqual(outcome, { ok: true, action: "skipped_downgrade" });
});

test("equal or higher new tier still applies (not a downgrade)", async () => {
  const supabase = makeSupabaseStub({ currentTier: "growth" });
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "scale", supabase_user_id: "user-1" }),
    { supabase },
  );
  assert.deepEqual(outcome, { ok: true, action: "tier_upgraded" });
  assert.ok(supabase.calls.some((c) => c.op === "upsert"));
});

test("downgrade-guard read failure falls through to the upsert (upgrade not blocked)", async () => {
  const supabase = makeSupabaseStub({ currentTierError: { message: "read timeout" } });
  const outcome = await processStripeEvent(
    checkoutEvent({ tier: "growth", supabase_user_id: "user-1" }),
    { supabase },
  );
  assert.deepEqual(outcome, { ok: true, action: "tier_upgraded" });
  assert.ok(supabase.calls.some((c) => c.op === "upsert"));
});

// --- MES-39 review #2: retriable failures escalate after MAX_PROCESS_ATTEMPTS --------

test("resolveStatus: retriable failure escalates to needs_attention at the cap", () => {
  const retriable = { ok: false as const, retriable: true, reason: "db down" };
  assert.deepEqual(resolveStatus(retriable, 1), { status: "failed", escalated: false });
  assert.deepEqual(resolveStatus(retriable, MAX_PROCESS_ATTEMPTS - 1), { status: "failed", escalated: false });
  assert.deepEqual(resolveStatus(retriable, MAX_PROCESS_ATTEMPTS), { status: "needs_attention", escalated: true });
  // non-retriable is already terminal; attempts don't matter
  const nonRetriable = { ok: false as const, retriable: false, reason: "bad metadata" };
  assert.deepEqual(resolveStatus(nonRetriable, 1), { status: "needs_attention", escalated: false });
  // success is never escalated
  assert.deepEqual(resolveStatus({ ok: true, action: "tier_upgraded" }, 99), { status: "processed", escalated: false });
});

test("isMissingColumnError recognises pre-migration schemas only", () => {
  assert.ok(isMissingColumnError({ code: "42703", message: "column \"processing_status\" does not exist" }));
  assert.ok(isMissingColumnError({ code: "PGRST204", message: "Could not find the 'processing_status' column of 'payment_webhook_logs' in the schema cache" }));
  assert.ok(!isMissingColumnError({ code: "23505", message: "duplicate key value violates unique constraint" }));
  assert.ok(!isMissingColumnError(null));
});
