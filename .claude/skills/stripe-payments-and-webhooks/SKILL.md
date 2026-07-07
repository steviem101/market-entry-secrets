---
name: stripe-payments-and-webhooks
description: MES Stripe checkout/webhook conventions and the entitlement invariants (OWNED here — other skills link). Use before touching create-checkout, stripe-webhook, user_subscriptions, lead purchases, or any payment/entitlement flow.
---

Last verified: 2026-07-07

# Stripe Payments & Webhooks

## Purpose
Keep the money path correct: one-time payments that reliably grant exactly the entitlement paid
for — with retries that work, no fail-open defaults, and no client-side write path.

## When to trigger / when NOT to
- **Trigger:** anything in `supabase/functions/create-checkout/` or `stripe-webhook/`,
  `user_subscriptions`, `lead_database_purchases`, `payment_webhook_logs`, pricing surfaces.
- **Don't trigger:** post-redirect *UX* polling (Wave 2 `post-payment-activation-and-entitlements-ux`;
  interim facts: `ReportView.tsx:40-106` polls every 2s ×15, `Pricing.tsx:15-34` shows a status modal).

## Preconditions — inspect first
`supabase/functions/stripe-webhook/index.ts`, `supabase/functions/create-checkout/index.ts`,
live `pg_policies` on `user_subscriptions`, and recent `payment_webhook_logs` rows if debugging.

## The billing model (verified — do not assume subscriptions)
One-time payments: `mode: "payment"` (`create-checkout/index.ts:194-207`). No Stripe Subscription
objects, no renewals, no `customer.subscription.*` events. Only `checkout.session.completed` is
handled (`stripe-webhook/index.ts:86`). Refunds/chargebacks do **not** auto-revoke (manual).
Two purchase kinds: tier upgrade → `user_subscriptions`; `tier === "lead_purchase"` +
`metadata.lead_database_id` → `lead_database_purchases` upsert (L115-140).

## Entitlement invariants (source of truth — link here, don't restate)
1. `user_subscriptions` writes are **service-role only** (verified live: only a SELECT-own policy
   exists). The sole legitimate tier-granting path is the verified Stripe webhook.
2. `user_subscriptions` stores only `(user_id, tier, ...)` — no Stripe subscription id/status.
   `profiles.stripe_customer_id` holds the customer mapping and is **not client-writable**
   (SEC-05 trigger; `docs/audits/AUTH-JOURNEY-AUDIT.md` §8.2).
3. Missing/invalid `metadata.tier` or `metadata.supabase_user_id` must **reject, never default** —
   invalid tier → 400 against `VALID_TIERS` (`stripe-webhook/index.ts:104-111`). The old code
   defaulted to `"growth"`, granting a paid tier for free (`docs/audits/SECURITY_AUDIT.md` §7.5).
4. Entitlement writes must be idempotent per `stripe_event_id` and **retryable**: upsert failure
   returns 500 so Stripe retries (`stripe-webhook/index.ts:158-164`).
5. Unknown tier at read time = `free` (`mapDatabaseTier`), never an upgrade.

## Playbook
1. **Webhook changes:** raw body (`arrayBuffer` → `TextDecoder`) →
   `constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET)` → dedupe pre-check on
   `payment_webhook_logs.stripe_event_id` (duplicate → 200) → validate metadata → process
   (L21-164). Any body-parsing middleware breaks signature verification. **Known open defect
   (AUD-007, `docs/prelaunch-audit.md`):** the log row is inserted *before* the upsert, so a
   transient upsert failure returns 500 but the retry hits the dedupe check and is skipped
   forever. The correct design (mark dedupe only after processing succeeds) is not yet shipped —
   don't copy the current ordering into new handlers.
2. **Checkout changes:** price IDs come from server env (`STRIPE_GROWTH_PRICE_ID`/
   `STRIPE_SCALE_PRICE_ID`, L12-15); client-supplied `price_id` is accepted only if it matches a
   `lead_databases.stripe_price_id` or the server-side tier price (L43-73). **Known open P1
   (AUD-005):** that tier↔price guard is *skipped* when `lead_database_id` is present, and the
   client's `tier` survives into metadata (L65,202) — pay a lead-DB price, receive `enterprise`.
   Any checkout change must force `tier="lead_purchase"` in the direct-price branch and validate
   paid amount↔tier in the webhook (AUD-009). Redirect URLs validated against `ALLOWED_ORIGINS`
   by origin; relative paths must not start `http`/`//`, fallback `/pricing` (L161-192).
3. **Testing:** use Stripe test mode + Stripe CLI (`stripe listen --forward-to`) against a dev
   function; replay `checkout.session.completed` twice to prove dedupe; send one with a bad
   signature (expect 400) and one with missing metadata (expect logged-and-rejected, not silently
   upgraded).
4. **Failure visibility:** webhook failures must be loud — 500s surface in Stripe's dashboard
   retry queue; check `payment_webhook_logs` when a user reports "paid but not upgraded".

## Red flags / approval gates
Everything here is payment-path — treat ANY change to these two functions, prices, tiers, or
entitlement tables as approval-gated (MES Ticket Writing Context risk flags). Extra stops:
- Adding an event type without idempotency for it.
- Any code path that writes `user_subscriptions` outside the webhook.
- Returning 200 for a failure you want retried (200 = Stripe never retries).

## Good / bad examples
- ✅ Reject-and-log: unknown tier → 400 + `payment_webhook_logs` row (current code).
- ❌ Dedupe row inserted **before** processing — first-attempt upsert failure short-circuits
  Stripe's retry: user charged, never upgraded (MES-35 R2; **still open as AUD-007**). Dedupe
  must mark *completed* work, not *attempted* work.
- ❌ Swallowing a purchase-write failure and returning 200 — the lead-purchase branch does this
  today against a table that doesn't even exist in prod (AUD-006/AUD-008): buyers charged,
  entitlement silently lost, Stripe never retries.
- ❌ `onConflict: "user_id"` upsert with no current-tier comparison — a `scale` user buying
  `growth` gets silently downgraded (MES-35 R8, open risk: compare tiers before overwrite).

## Self-check rubric (pass/fail)
- [ ] Signature verified on raw body; no reformatting before `constructEventAsync`.
- [ ] Replayed event is a no-op; failed processing returns 5xx (retryable), not 200.
- [ ] Missing/invalid metadata rejects; no fail-open tier default anywhere.
- [ ] No new write path to `user_subscriptions`/`stripe_customer_id` outside the webhook.
- [ ] Redirect URLs allowlisted; prices resolved server-side; tested with Stripe CLI replay.

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` (AUD-### findings folded in 2026-07-07).
Inspected 2026-07-07: `supabase/functions/stripe-webhook/index.ts` (L21-223),
`supabase/functions/create-checkout/index.ts` (L12-207), `src/hooks/useCheckout.ts`,
live `pg_policies` on `user_subscriptions` (SELECT-own only). Audits:
`docs/audits/MES-35-platform-readiness-scan.md` R2/R7/R8, `docs/audits/SECURITY_AUDIT.md`
§1.1/§7.5, `docs/audits/AUTH-JOURNEY-AUDIT.md` §8.2. Secrets (names only): `STRIPE_SECRET`,
`STRIPE_WEBHOOK_SECRET`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_SCALE_PRICE_ID`, `FRONTEND_URL` —
handling rules in `secrets-and-env-management`.

## Common MES pitfalls (real — AUD refs are MES-111, `docs/prelaunch-audit.md`)
1. **Client `tier` trusted in the lead-purchase branch** — P1 paywall bypass: lead-DB price buys
   `enterprise` (AUD-005; escalate any similar guard-skip you find).
2. **Entitlement table lost in the re-baseline** — `lead_database_purchases` exists only in
   `migrations_archive/`; the live webhook upserts a missing table and swallows the error
   (AUD-006/008). Verify tables exist in the *live* DB, not in archived migrations.
3. **Dedupe-before-processing** kills Stripe retries (MES-35 R2; still open as AUD-007).
4. **Fail-open tier default / silent 200 on bad metadata** granted or lost paid tiers
   (`SECURITY_AUDIT.md` §7.5; MES-35 R7) — and paid amount is still never validated against the
   granted tier (AUD-009).
5. **Upsert downgrades + no refund path** — no current-tier check; manual revoke only
   (MES-35 R8/§5).
