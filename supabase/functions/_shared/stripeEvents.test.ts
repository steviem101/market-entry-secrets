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
  statusForOutcome,
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
  assert.deepEqual(tables, ["user_subscriptions:upsert", "user_reports:update"]);
  assert.equal((supabase.calls[0].payload as { tier: string }).tier, "growth");
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
    healthy.calls.filter((c) => c.table === "user_subscriptions").length,
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

test("isMissingColumnError recognises pre-migration schemas only", () => {
  assert.ok(isMissingColumnError({ code: "42703", message: "column \"processing_status\" does not exist" }));
  assert.ok(isMissingColumnError({ code: "PGRST204", message: "Could not find the 'processing_status' column of 'payment_webhook_logs' in the schema cache" }));
  assert.ok(!isMissingColumnError({ code: "23505", message: "duplicate key value violates unique constraint" }));
  assert.ok(!isMissingColumnError(null));
});
