# Runbook: Stripe sandbox → live cutover (MES-STRIPE-PROD)

> Phase 2 plan. Decision gate answered 2026-07-09: **NOT GST-registered at launch** — no Stripe
> Tax, no `automatic_tax`, prices are plain $99/$999 AUD. **Revisit GST at ~$60k trailing
> revenue** (AU registration threshold is $75k projected/actual turnover).
> Evidence base: `docs/audits/mes-stripe-prod-cutover-phase1-audit.md`.
> Branch: `claude/stripe-sandbox-production-kuut8i`. Nothing below executes until Phase 3 approval.

## Sequencing (why this order)

The code changes are backwards-compatible with the sandbox, so code ships and is smoke-tested
against sandbox **first**; the live cutover is then a pure secret swap with no simultaneous
code+account change to untangle if something breaks.

1. Code changes → PR → review → merge (§1).
2. Manual deploy of the three Stripe functions to prod, still on **sandbox** secrets (§2) —
   the auto-deploy Action does not cover them.
3. Sandbox smoke test of the new behaviour ($0 promo path end-to-end in test mode) (§4A).
4. Human Dashboard setup in the live account (§3).
5. Secret swap to live values (§2) — functions restart with live keys.
6. Live smoke tests (§4B/C) + security invariant re-verification (§5).

## 1. Code changes (all on the branch; no schema change → no migration)

### 1.1 `supabase/functions/create-checkout/index.ts` — enable promo codes on tier sessions

In the `stripe.checkout.sessions.create` call (currently L204-219), add:

```ts
allow_promotion_codes: !isLeadPurchase,
```

- Before: no `allow_promotion_codes` → Stripe checkout never shows the code box.
- After: tier checkouts (growth/scale) show the promotion-code field; the dormant
  lead-purchase branch keeps it off (ticket scope: tier checkouts only).
- `isLeadPurchase` (L45) already distinguishes the two flows; any session reaching the create
  call with `isLeadPurchase === false` has passed the server-side tier/price validation.
- **No `automatic_tax`** (GST gate = No).

### 1.2 `supabase/functions/_shared/stripeEvents.ts` — $0 grant marker + observability

Add a small exported pure helper (unit-testable under `node --test`):

```ts
/** Summary of a checkout session for the payment_webhook_logs.parsed column. */
export function parseSessionSummary(dataObj: Record<string, any> | null, eventType: string) {
  const amount = typeof dataObj?.amount_total === "number" ? dataObj.amount_total : null;
  return {
    metadata: dataObj?.metadata ?? {},
    clientReferenceId: dataObj?.client_reference_id ?? null,
    paymentIntentId: dataObj?.payment_intent ? String(dataObj.payment_intent) : null,
    amount,
    currency: dataObj?.currency ?? null,          // fixes the $0→currency:null quirk
    eventType,
    // Distinguishable $0 marker (ticket requirement): a completed session with
    // amount_total === 0 is a promotional/free grant — auditable via
    // parsed->>'zero_amount_grant' = 'true'.
    zero_amount_grant: amount === 0,
    amount_discount: dataObj?.total_details?.amount_discount ?? null,
  };
}
```

And in `processStripeEvent`, log loudly when a tier is granted at $0 (after the successful
upsert): `log("Tier granted at $0 (promotional checkout)", { supabaseUserId, tier })`.
Granting logic itself is **unchanged** — Phase 1 verified it already handles
`amount_total = 0` / `payment_intent = null` correctly.

### 1.3 `supabase/functions/stripe-webhook/index.ts` — use the helper

Replace the inline `parsed = {...}` block (L187-194) with
`const parsed = parseSessionSummary(dataObj, event.type)`. Behaviour identical except the two
$0-path fixes above. (`stripe-webhook-reconcile` replays stored rows and builds no `parsed` —
no change there.)

### 1.4 `supabase/functions/_shared/stripeEvents.test.ts` — $0-path unit tests

New cases (the module is dependency-injected, so these run under `npm test`):
- $0 growth session (`amount_total: 0`, `payment_intent: null`, valid metadata) →
  `{ ok: true, action: "tier_upgraded" }`, `user_subscriptions` upsert called with
  `tier: "growth"`, `retrievePaymentIntent` **never called**.
- Same session → confirmation email dispatched with `amount: 0` treated as no-amount (matches
  template behaviour).
- `parseSessionSummary`: $0 session → `zero_amount_grant: true`, `currency` preserved;
  paid session → `zero_amount_grant: false`, `paymentIntentId` string; null dataObj safe.

### 1.5 Not changing (deliberate)

- No paid-amount↔tier validation (AUD-009): a $0 session for a paid tier is now *legitimate by
  design* (100% promo). Any future amount validation must allow `amount_total === 0` when
  `total_details.amount_discount` covers the full price. Left out of this cutover to keep the
  diff minimal; carry AUD-009 as its own follow-up.
- No refund auto-revoke, no subscription logic, no lead-purchase changes, no frontend changes
  (display prices already $99/$999; `useCheckout` sends no price data).

**Verification before PR:** `npm test`, `npx tsc -p tsconfig.app.json --noEmit`,
`npm run build`, no new lint errors in touched files.

## 2. Secrets & deploy commands (exact; live values pasted by the human at runtime)

⚠️ The real secret names are `STRIPE_SECRET` (not `STRIPE_SECRET_KEY`) plus the two price-ID
secrets — the ticket's original rollback commands would have been a silent no-op.

Sandbox values stay retrievable from the sandbox Stripe Dashboard
(acct_1RniS8Q9GOAfpuzq) — nothing is deleted; "retention" is automatic.

```bash
# Cutover (after Dashboard setup §3; each set triggers a function restart):
supabase secrets set STRIPE_SECRET=<live_restricted_key>        --project-ref xhziwveaiuhzdoutpgrh
supabase secrets set STRIPE_WEBHOOK_SECRET=<live_whsec>         --project-ref xhziwveaiuhzdoutpgrh
supabase secrets set STRIPE_GROWTH_PRICE_ID=<live_growth_price> --project-ref xhziwveaiuhzdoutpgrh
supabase secrets set STRIPE_SCALE_PRICE_ID=<live_scale_price>   --project-ref xhziwveaiuhzdoutpgrh
```

Manual function deploy (the GitHub Action only auto-deploys the report-pipeline functions;
these three are NOT in it — deploy after merge, before the sandbox smoke test):

```bash
supabase functions deploy create-checkout          --project-ref xhziwveaiuhzdoutpgrh
supabase functions deploy stripe-webhook           --project-ref xhziwveaiuhzdoutpgrh
supabase functions deploy stripe-webhook-reconcile --project-ref xhziwveaiuhzdoutpgrh
```

(`supabase/config.toml` supplies `verify_jwt` per function on deploy — no config change needed.)

## 3. Human Dashboard checklist (live mode — acct is NOT acct_1RniS8Q9GOAfpuzq)

1. **Activate account:** business details, ID verification, **AUD bank account**, statement
   descriptor (shows on card statements — e.g. `MARKETENTRYSECRETS`), support email,
   customer receipt emails **on** (Settings → Emails).
2. **Products & prices** (one-time, AUD, tax behaviour left default/unspecified — no GST):
   - Growth Tier — **A$99.00** one-time → note the `price_…` ID → `STRIPE_GROWTH_PRICE_ID`.
   - Scale Tier — **A$999.00** one-time → note the `price_…` ID → `STRIPE_SCALE_PRICE_ID`.
   - **No Enterprise product/price** (no self-serve checkout; `create-checkout` has no
     enterprise mapping). Do not recreate the sandbox's stray USD "myproduct" entries.
3. **Webhook endpoint:** `https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/stripe-webhook`,
   subscribed to **`checkout.session.completed` only**. Copy the signing secret (`whsec_…`) →
   `STRIPE_WEBHOOK_SECRET`.
4. **Restricted API key** → `STRIPE_SECRET`. Scopes the code actually uses (Phase 1-verified —
   note this corrects the ticket's draft list):
   - Checkout Sessions: **write** (`checkout.sessions.create`)
   - Customers: **write** (`customers.create` on first purchase)
   - PaymentIntents: **read** (webhook email amounts, best-effort)
   - Everything else: none.
5. **Coupon:** 100% off, one-time, **restricted to the Growth and Scale products** (a leaked
   code can then never discount anything else).
6. **Promotion codes** off that coupon: **one per beta tester**, `max_redemptions: 1`, expiry
   set (suggest 30–60 days). NEVER a shared multi-use code.
7. **GST:** nothing (gate = No). Diarise: revisit registration + Stripe Tax at ~$60k trailing
   revenue; when registering, live prices must be recreated/updated with
   `tax_behavior: inclusive` and `automatic_tax` wired in `create-checkout`.

## 4. Smoke tests

Run the mes-context canary check before and after each deploy step.

### A. Sandbox rehearsal (post-merge, pre-cutover — same code path as beta testers)

1. Create a sandbox 100% coupon + single-use promo code (mirroring §3.5-6).
2. Fresh test user → `/pricing` → Growth checkout → enter code → **no card prompt** →
   completes at A$0.00.
3. Verify: `payment_webhook_logs` row `processing_status = 'processed'`,
   `parsed->>'zero_amount_grant' = 'true'`, `parsed->>'amount' = '0'`;
   `user_subscriptions.tier = 'growth'`; gated report sections unlock **without
   regeneration**; confirmation email arrives (no amount line).

### B. Live $0 promo test (after secret swap — acceptance-criteria path)

Repeat A with a live single-use code and a real (beta) account. Same assertions. This is
smoke test A from the ticket and doubles as the beta-tester flow rehearsal.

### C. Live $99 real purchase + refund (human executes card step)

1. Real card, Growth, **no** promo code → A$99.00 charge.
2. Verify webhook row (`zero_amount_grant = 'false'`), tier granted, receipt email, and the
   payment appears in the live Balance with an expected payout date.
3. Refund immediately from the Dashboard. **Known behaviour: refunds do NOT auto-revoke the
   tier** — manually reset the test user's tier afterwards (service-role SQL) and note it.

Pass/fail is reported per step in the Phase 3 summary.

## 5. Security invariant re-verification (Phase 3, post-deploy)

Attempt direct writes as both client roles; each must fail (RLS: only a SELECT-own policy
exists; grants: anon/authenticated are SELECT-only — verified in Phase 1, re-verify after):

```sql
-- as anon and as authenticated (e.g. via PostgREST with the anon key / a user JWT):
update user_subscriptions set tier = 'enterprise' where user_id = '<test-user>';
-- expected: 0 rows / permission denied — both roles.
insert into user_subscriptions (user_id, tier) values ('<test-user>', 'scale');
-- expected: permission denied — both roles.
```

## 6. Rollback (< 2 minutes)

```bash
supabase secrets set STRIPE_SECRET=<sandbox_key>            --project-ref xhziwveaiuhzdoutpgrh
supabase secrets set STRIPE_WEBHOOK_SECRET=<sandbox_whsec>  --project-ref xhziwveaiuhzdoutpgrh
supabase secrets set STRIPE_GROWTH_PRICE_ID=<sandbox_growth_price> --project-ref xhziwveaiuhzdoutpgrh
supabase secrets set STRIPE_SCALE_PRICE_ID=<sandbox_scale_price>   --project-ref xhziwveaiuhzdoutpgrh
```

- Sandbox values: from the sandbox Dashboard (keys/prices are listed in the Phase 1 audit).
- If the code itself must roll back: `git revert` the PR merge commit, redeploy the three
  functions (§2). The code changes are sandbox-compatible, so secret rollback alone is the
  normal path.
- Disable (don't delete) the live webhook endpoint in the Dashboard if events must stop.

## 7. Down migration

None — no schema changes. The $0 marker lives in the existing `payment_webhook_logs.parsed`
jsonb column.
