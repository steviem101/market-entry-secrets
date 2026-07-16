# Runbook — T8 paid-service go-live (MES-195)

The cutover that turns on the $199 Growth price + human-service entitlements +
fulfilment. Do the steps **in order** — several are not auto-deployed.

## Prerequisites (done)
- `service_entitlements` table + grant path merged (PR-A, dormant behind `ENTITLEMENTS_ENABLED`).
- New Stripe price created (livemode): **`price_1TteiCLuVcXeglZnVzSYqJMb`** — Growth, AUD $199,
  one-time, on product `prod_UrFyarySFnBG1S`. Old $99 price `price_1TrXSALuVcXeglZntvODD3j2`
  is still **active** (do not archive until step 2).
- Display copy flipped to $199 (this PR: `tierPricing.ts`, `personaContent.ts` ×3,
  `PricingSection.tsx`).
- Fulfilment email block added (this PR: `paymentConfirmation.ts` — Calendly + what's-coming).

## Cutover (in order)
1. **Merge this PR.** Lovable auto-publishes the $199 display copy.
2. **Repoint the price secret.** Set Supabase edge secret
   `STRIPE_GROWTH_PRICE_ID = price_1TteiCLuVcXeglZnVzSYqJMb`. Now checkout charges $199,
   matching the display. **Then archive the old price** in Stripe
   (`price_1TrXSALuVcXeglZntvODD3j2` → set inactive; never delete).
3. **Enable entitlements.** Set edge secret `ENTITLEMENTS_ENABLED = true`.
4. **Deploy the edge functions** (NOT auto-deployed — CLAUDE.md §2). From the repo root:
   ```bash
   supabase functions deploy stripe-webhook          # grant path (PR-A) goes live
   supabase functions deploy stripe-webhook-reconcile # replay path also grants
   supabase functions deploy send-email               # fulfilment email block
   ```
   Until this step the merged grant/email code is NOT running in prod.
5. **Verify** with a $0-promo (`MESBETA-TEST100`) checkout as a flagged `is_test` account:
   - Growth → tier upgraded + 3 `service_entitlements` rows (walkthrough_call ×1,
     mentor_intro ×1, ecosystem_intro ×3), 30-day `expires_at`.
   - The confirmation email shows the "What happens next" block with the Calendly link.
   - Replay the webhook event → no duplicate tier grant, no duplicate entitlement rows.
   - As a non-admin: cannot INSERT/UPDATE `service_entitlements` (RLS denies).

## Rollback
- Set `ENTITLEMENTS_ENABLED = false` (stops new grants).
- Repoint `STRIPE_GROWTH_PRICE_ID` back to `price_1TrXSALuVcXeglZntvODD3j2` (re-activate it first).
- Revert this PR to restore $99 display + drop the fulfilment email block.
- Existing entitlement rows are additive/harmless; drop the table only via a reversal migration.

## Notes
- Pre-launch, all accounts are founder/test (MES-190), so a brief display/price mismatch
  window between steps 1 and 2 has no real-customer impact — but keep the order.
- Refund handling: [`refunds.md`](refunds.md) (manual — refunds don't auto-revoke).
