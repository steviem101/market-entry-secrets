# Runbook — processing a refund (MES-195 / T8)

> **Why this is manual.** The Stripe webhook only handles `checkout.session.completed`
> (CLAUDE.md §8) — there is **no** `charge.refunded` handler, so a refund in Stripe does
> **not** revoke the tier or the entitlements. Refunds are low-volume and policy-nuanced
> (see [`docs/refund-policy.md`](../refund-policy.md), D5), so they are handled by hand
> until volume justifies automation.

## When
A customer is approved for a refund under the [refund policy](../refund-policy.md):
- Report/lead list: within 14 days AND paid sections not substantially accessed.
- Human deliverables: refund the **undelivered** portion (call not held / intro not made).

## Steps
1. **Refund in Stripe.** Dashboard → the customer's payment → Refund (full or the
   undelivered-portion amount per the policy). Note the reason.
2. **Downgrade the tier** (service role — never a client path). In the Supabase SQL editor:
   ```sql
   -- Replace <user_id>. Set the tier they should hold AFTER the refund (usually 'free',
   -- or the lower paid tier if they keep part of the purchase).
   update public.user_subscriptions
     set tier = 'free', updated_at = now()
     where user_id = '<user_id>';
   ```
3. **Void unconsumed entitlements** from that purchase (keep consumed ones — the service
   was delivered). `<stripe_session_id>` is the `source_purchase` on the rows:
   ```sql
   update public.service_entitlements
     set granted_count = consumed_count          -- zero out the remaining balance
     where source_purchase = '<stripe_session_id>'
       and consumed_count < granted_count;
   ```
   (Delete the rows only if none were consumed and you want a clean ledger; otherwise the
   above preserves the audit trail.)
4. **Confirm the report re-gates.** `get_tier_gated_report` derives from the caller's live
   tier, so the downgrade re-locks paid sections immediately on next load — no cache bust
   needed beyond the client's normal refetch.
5. **Log it.** Note the refund + downgrade against the customer (support tool / Notion) so
   the refund-rate guardrail stays accurate.

## Notes
- **ACL still applies.** A major-failure refund is granted regardless of the 14-day window.
- **Do not** grant refunds by editing `user_subscriptions` upward or minting entitlements —
  those tables are service-role-write only by design (SEC-01).
- If refund volume grows, promote this to a `charge.refunded` webhook handler + a small
  admin action (follow-up ticket) rather than scaling the manual steps.
