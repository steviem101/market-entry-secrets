# Test-account policy & clean-metrics exclusion (MES-190)

> Owned by MES-190 (T12, MES-188 epic). Migration: `supabase/migrations/20260715130000_mes190_data_hygiene.sql`.
> MES is pre-launch — every account that existed at migration time is founder/test data.

## The boundary

`profiles.is_test` is the **single source of truth** for "is this a founder/test account".

- **Real users** (post-launch signups) default to `is_test = false`.
- **Founder/test accounts** are `is_test = true`. The migration flagged the entire
  pre-launch cohort (all accounts at 2026-07-15), including the eval user
  (`eval@marketentrysecrets.com`) and the three external pre-launch testers.

All funnel/quality metrics MUST exclude test accounts. Two equivalent tools:

- **Predicate:** `NOT public.is_test_user(<user_id>)` — canonical, reused by the
  T5a (MES-191) dashboard pack.
- **Clean views** (service-role read only, never granted to anon/authenticated):
  `user_subscriptions_clean`, `user_reports_clean`, `user_intake_forms_clean`,
  `report_quality_clean`, `intake_form_events_clean`. Anonymous
  `intake_form_events` (null `user_id`) are kept — post-launch they are real
  top-of-funnel signal.

Row-level flags on non-user-linked tables:
- `payment_webhook_logs.is_test` — flagged, **never deleted** (financial audit).
  Future $0 promo-grant / test checkouts should be marked `is_test = true`.
- `email_leads.is_test` — founder/test lead-capture rows.

`user_usage` (anonymous view counter, no user link) was **truncated** — it
regenerates naturally and carried no audit or test-fixture value.

## Creating a test account (so it never pollutes metrics)

Test accounts use the pattern `stephen+090*@marketentrysecrets.com` and are made
through the **real signup flow**, then finalised via the **service role**:

1. Sign up via the normal flow (creates `profiles` with `is_test = false`).
2. Admin-confirm via the service role — **is_test accounts ONLY** — and in the
   same step set the flag:
   ```sql
   -- service role, is_test accounts only
   update auth.users set email_confirmed_at = now() where email = 'stephen+090x@marketentrysecrets.com';
   update public.profiles set is_test = true
     where id = (select id from auth.users where email = 'stephen+090x@marketentrysecrets.com');
   ```
3. Reach paid-tier state through the **real checkout with the 100% promo code**
   (`MESBETA-TEST100`) — never write `user_subscriptions.tier` directly.

Never admin-confirm or force `is_test` on a real user's account.

## Verifying clean (post-merge, read-only)

```sql
select count(*) from public.user_reports_clean;        -- 0 while all data is pre-launch test
select count(*) from public.report_quality_clean;      -- 0 (real runs only)
select count(*) from public.user_subscriptions_clean;  -- 0
-- raw tables unchanged (flagged, not purged), except user_usage (0 after truncate):
select count(*) from public.user_reports;               -- retained
select count(*) from public.user_usage;                 -- 0
```

## ⚠️ Do not manually re-run the migration against prod

The backfill (`update profiles set is_test = true where is_test = false`) blanket-flags
**every** current row — correct exactly once, pre-launch. Under the ledger model each
migration applies once, so this is safe. **Never** re-run this file by hand against a
populated prod database after real users exist — it would flag real accounts as test.
To flag a specific new test account, use the targeted `update` in the section above.

## Rollback

All flags are reversible (`update … set is_test = false`). Columns, the helper,
and the views are additive (drop to revert). The only irreversible step is the
`user_usage` truncate (anonymous counters; no audit value).
