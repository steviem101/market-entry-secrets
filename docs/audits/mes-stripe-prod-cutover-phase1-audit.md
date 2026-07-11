# MES-STRIPE-PROD — Phase 1 read-only audit

> Stripe sandbox → live production cutover (AUD pricing, $0 promo-code path, audit trail).
> Ticket: MES-STRIPE-PROD (Billing). Branch: `claude/stripe-sandbox-production-kuut8i`
> (harness-assigned; maps to the ticket's `mes-stripe-prod-cutover`).
> Audited 2026-07-09. Read-only: no code, schema, secret, or Stripe changes were made.

## Scope inspected

- `supabase/functions/create-checkout/index.ts` (checkout session creation)
- `supabase/functions/stripe-webhook/index.ts` (webhook receiver)
- `supabase/functions/stripe-webhook-reconcile/index.ts` (cron replay — shares the processor)
- `supabase/functions/_shared/stripeEvents.ts` (+ `stripeEvents.test.ts`) — shared event processor
- `supabase/config.toml`, `src/` grep for Stripe IDs/keys, frontend checkout surfaces
- Live DB (`xhziwveaiuhzdoutpgrh`, read-only `information_schema`/`pg_policies` queries)
- Sandbox Stripe account via read-only MCP (`acct_1RniS8Q9GOAfpuzq`, "Market Entry Secrets sandbox")

## Answers to the audit questions

### a. How are tier prices resolved?

Env secrets, not hardcoded. `create-checkout/index.ts:12-15` builds
`PRICE_IDS = { growth: STRIPE_GROWTH_PRICE_ID, scale: STRIPE_SCALE_PRICE_ID }` from
`Deno.env.get`, looked up by tier at `index.ts:40`. **Enterprise is deliberately absent** — no
self-serve enterprise checkout exists today, matching the desired end state. No `price_data`
inline pricing anywhere. **Cutover = swap two secrets; no code change strictly required.**

### b. How are lead-list purchases priced?

Client sends `price_id`, validated against `lead_databases.stripe_price_id`
(`create-checkout/index.ts:53-70`). **However, the `stripe_price_id` column does not exist in
the live DB** (verified via `information_schema`; live columns end at `price_aud`, `is_free`, …).
The frontend guard `useLeadCheckout.ts:28` (`if (!lead.stripe_price_id)`) means the field is
always undefined and checkout is never attempted — **the lead-purchase branch is dormant in
prod**. No live-mode lead price migration is needed for this cutover (lead promos are out of
scope anyway), but any future lead-purchase launch must add the column *and* live price IDs.

### c. Is webhook signature verification enforced?

Yes. `stripe-webhook/index.ts:168-182`: raw body via `req.arrayBuffer()` → `TextDecoder` →
`stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET)`. Missing
`stripe-signature` header → 400 (L172-174); failed verification → 400 (L179-182).
`verify_jwt = false` for this function in `supabase/config.toml:109-110` (correct — Stripe
can't send a JWT; the signature is the auth).

### d. Does the webhook write `user_subscriptions` with the service role?

Yes. `stripe-webhook/index.ts:43` creates `supabaseAdmin` with `SUPABASE_SERVICE_ROLE_KEY`;
the tier upsert is `_shared/stripeEvents.ts:199-208` through that client. Same for the
reconcile function.

### e. ZERO-DOLLAR PATH (amount_total = 0, payment_intent = null)

**Tier granting works.** Verified line-by-line in `_shared/stripeEvents.ts`:

- Tier and user come **only** from session metadata (`stripeEvents.ts:96-98`); there is **no
  `amount > 0` guard anywhere** on the granting path.
- `payment_intent` is dereferenced only best-effort for the confirmation-email amount, behind
  `if (paymentIntentId && deps.retrievePaymentIntent)` (`stripeEvents.ts:240-249`) — a null
  payment_intent skips it cleanly. Nothing on the critical path touches it.
- Metadata validation (`stripeEvents.ts:108-121`) rejects missing/invalid tier or user id with
  `needs_attention` + Slack alert — no fail-open default (SECURITY_AUDIT §7.5 fix intact).
- Downgrade guard (`stripeEvents.ts:162-197`) applies equally to $0 sessions.

Cosmetic quirks on the $0 path (no functional breakage):
1. `stripe-webhook/index.ts:192` — `currency: dataObj?.amount_total ? … : null`: `0` is falsy,
   so the `parsed` log column records `currency: null` for $0 sessions (`amount: 0` is recorded
   correctly via `?? null`).
2. `stripe-webhook/index.ts:64` — `amount ? (amount/100).toFixed(2) : null`: a $0 amount renders
   as no amount line in the confirmation email (template treats null as "—").

**Gaps against the ticket's desired state:**
- **No distinguishable $0/promo marker** in `payment_webhook_logs` — a $0 grant is only
  inferable from `parsed->>'amount' = '0'`. Ticket requires an explicit marker.
- **No unit test covers the $0 path.** `stripeEvents.test.ts` never exercises
  `amount_total: 0` / `payment_intent: null` (the module is dependency-injected and
  node-testable, so this is cheap to add).

### f. Is `allow_promotion_codes` set on tier sessions?

**No.** The session create call (`create-checkout/index.ts:204-219`) sets neither
`allow_promotion_codes` nor `discounts`. The promo-code box will not render — **beta testers
cannot redeem codes today.** Required change (tier sessions only; the dormant lead branch must
not get it).

### g. success_url / cancel_url

Production-safe by construction. Client `return_url` is validated against
`ALLOWED_ORIGINS = [FRONTEND_URL, marketentrysecrets.com, www.marketentrysecrets.com]`
(`create-checkout/index.ts:171-202`); anything else falls back to `${FRONTEND_URL}/pricing`.
Correctness therefore hinges on the **live value of the `FRONTEND_URL` secret** — unverifiable
from the repo; confirm it is `https://marketentrysecrets.com` before cutover (human step).

### h. Stripe-related secrets (names only)

`supabase secrets list` is not runnable from this environment (CLI unauthenticated) — live
enumeration is a human/Phase 3 step. Names referenced by code/config:

| Secret | Read by |
|---|---|
| `STRIPE_SECRET` | create-checkout:7, stripe-webhook:35, reconcile |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook:36 |
| `STRIPE_GROWTH_PRICE_ID`, `STRIPE_SCALE_PRICE_ID` | create-checkout:13-14 |
| `STRIPE_RECONCILE_SECRET` (+ Vault `stripe_reconcile_secret`, fallback `EMAIL_INTERNAL_SECRET`) | stripe-webhook-reconcile |
| `FRONTEND_URL` | create-checkout:10 (redirects + CORS) |
| `PAYMENTS_ALERT_SLACK_CHANNEL`, `SLACK_BOT_TOKEN`, `EMAIL_INTERNAL_SECRET` | webhook alerts/email |

⚠️ The ticket's rollback commands say `STRIPE_SECRET_KEY` — **the actual env var is
`STRIPE_SECRET`**. Cutover/rollback commands must use `STRIPE_SECRET` (and per-tier price ID
secrets), or the swap silently does nothing.

### i. Hardcoded Stripe IDs/keys in `src/`

None. Grep for `pk_test|pk_live|sk_test|sk_live|price_1|prod_|STRIPE` across `src/` and
`supabase/functions/` found **zero hardcoded keys or price/product IDs**. Frontend Stripe
references are display-only: `src/lib/tierPricing.ts:17-20` (`$99`/`$999`) and
`src/config/personaContent.ts` pricing blocks (`$0`/`$99`/`$999`) — **already showing the
intended live prices**, so no frontend price change is needed.

### j. Currency assumptions

None beyond AUD. Currency is carried by the Stripe price objects; code references are
display fallbacks only (`stripe-webhook/index.ts:65`, `_shared/email/templates/
paymentConfirmation.ts:22` default `"AUD"`). Sandbox contains two stray Stripe-CLI test
products in USD ("myproduct", $15) — unreferenced junk; do not recreate in live.

## Live DB verification (read-only, project `xhziwveaiuhzdoutpgrh`)

- **`user_subscriptions`** — `id, user_id, tier (enum subscription_tier: free, premium,
  concierge, growth, scale, enterprise), created_at, updated_at`. RLS **enabled**; the only
  policy is SELECT-own; table grants: anon/authenticated **SELECT only**, all writes
  service_role. **Security invariant holds today.** (Legacy `premium`/`concierge` enum values
  still exist; webhook + `useSubscription` normalise them.)
- **`payment_webhook_logs`** — has the MES-39 state columns (`event_type, processing_status,
  attempts, processed_at, last_error, email_sent`) → migration `20260706101500` is applied;
  the webhook runs the claim/retry flow, not legacy mode. RLS enabled, admin-SELECT policy only.
  (Grant note: anon has a SELECT *grant* and authenticated SELECT/UPDATE/DELETE grants, but RLS
  policies expose nothing to them — tighten someday under SEC-01 hygiene, not a cutover blocker.)
- **`lead_database_purchases`** — **exists in prod** (AUD-006 resolved): `id, user_id,
  lead_database_id, stripe_session_id, purchased_at`; RLS enabled (admin ALL, own SELECT).
- **`lead_databases`** — **no `stripe_price_id` column** (see item b).

## Sandbox Stripe account state (read-only)

`acct_1RniS8Q9GOAfpuzq`, livemode=false. Tier prices confirmed as **AUD $1.00 placeholders**
(`unit_amount: 100`), all `one_time`, `tax_behavior: "unspecified"`:

| Product | Sandbox price ID | Amount |
|---|---|---|
| Growth Tier (`prod_SrkHhiVQ4s76Vs`) | `price_1Rw0moQ9GOAfpuzq0ZZsIngz` | A$1.00 |
| Scale Tier (`prod_SrkHITP3RhMFmR`) | `price_1Rw0nLQ9GOAfpuzqpfUoaWdx` | A$1.00 |
| Enterprise and Bespoke Tier (`prod_SrkJlusgBtSzb8`) | `price_1Rw0ovQ9GOAfpuzqxwbMvihI` | A$1.00 |

Webhook endpoints could not be listed through the restricted MCP key — human verifies the
sandbox endpoint config in the Dashboard when creating the live one. Note: the Stripe MCP
connector itself is bound to the **sandbox** account; after cutover it will still point at
sandbox unless reconnected (fine for testing, but don't use it to "verify live").

## Audit report table

| # | Item | Current state | Prod risk | Required change |
|---|---|---|---|---|
| 1 | Tier price resolution | Env secrets (`STRIPE_GROWTH/SCALE_PRICE_ID`), no hardcoding | Low | None in code — swap secret values to live IDs |
| 2 | `allow_promotion_codes` | **Not set** — promo box never shown | **High** (blocks beta testers) | Set `allow_promotion_codes: true` on tier sessions only |
| 3 | $0 / null-payment_intent granting | Works — metadata-driven, no amount guard, PI only best-effort | Low | None to grant; add explicit $0 marker + unit tests |
| 4 | $0 audit marker in `payment_webhook_logs` | Only inferable from `parsed.amount = 0`; `currency` logged null on $0 | Med | Add distinguishable marker (e.g. `parsed.zero_amount: true` / `promotion_code` capture) |
| 5 | Webhook signature verification | Enforced on raw body, 400 on failure | Low | None |
| 6 | `user_subscriptions.tier` write path | Service-role only (RLS + grants verified live) | Low | None — re-verify post-deploy (Phase 3) |
| 7 | Webhook reliability (MES-39) | State columns live; claim→process→mark; retries + escalation + Slack alert | Low | None |
| 8 | Downgrade guard | Replayed lower-tier events skipped | Low | None |
| 9 | success/cancel URLs | Allowlist-validated; depends on `FRONTEND_URL` secret value | Med | Human: confirm `FRONTEND_URL` = production domain |
| 10 | Secret naming in ticket | Ticket says `STRIPE_SECRET_KEY`; real var is `STRIPE_SECRET` | Med | Use correct names in cutover/rollback commands |
| 11 | Lead purchases | Dormant: `lead_databases.stripe_price_id` column absent in prod | Low (out of scope) | None now; note for future lead launch |
| 12 | GST / `automatic_tax` | Absent everywhere; sandbox prices `tax_behavior: unspecified` | Med | Phase 2 decision gate |
| 13 | Enterprise checkout | No `PRICE_IDS` entry → already no self-serve | Low | None |
| 14 | Frontend display prices | Already $99/$999 (`tierPricing.ts`, `personaContent.ts`) | Low | None |
| 15 | Currency assumptions | AUD display fallback only; price objects own currency | Low | Create live prices in AUD |
| 16 | Content Studio (`rcgaviwbsudouvfwzydq`) | **No references found** in payment path | — | Hard-halt condition not triggered |

## Surprises worth flagging

1. **`lead_databases.stripe_price_id` doesn't exist in prod** — the lead-purchase checkout
   branch is unreachable. Not a cutover blocker, but the code reads as if it works.
2. **Ticket's secret name is wrong** (`STRIPE_SECRET_KEY` vs actual `STRIPE_SECRET`) — would
   have made the rollback plan a no-op.
3. **AUD-005/006/007 from the skill docs are fixed in current code** (tier forced to
   `lead_purchase` on lead buys; purchases table exists; dedupe is claim-then-process).
   AUD-009 (paid-amount↔tier validation) remains absent — deliberately compatible with $0
   promo sessions, but Phase 2 should decide whether to validate `amount_total ∈ {0, expected}`.
