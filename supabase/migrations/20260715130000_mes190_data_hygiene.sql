-- MES-190 (T12) — Pre-launch data hygiene: flag founder/test data so day-1
-- metrics, the quality loop, and any "X reports generated" proof start clean.
--
-- MES is pre-launch: every existing account and row is founder/test data
-- (MES-188 charter). This is a DURABLE test/real boundary, not a one-off scrub.
-- Owner-approved strategy (2026-07-15, MES-190 questions A–E):
--   A  flag-over-purge — keep reports/intakes/payments (cheap test fixtures +
--      financial audit); exclude via a flag, not deletion. Reversible.
--   B  TRUNCATE user_usage (the single destructive op — approved).
--   C  flag email_leads (don't delete).
--   D  the eval user (0f2b21b9-…, eval@marketentrysecrets.com) is founder/test
--      → flagged is_test, hence excluded like any other test user.
--   E  the 3 external pre-launch testers are flagged is_test too.
--
-- profiles.is_test is the single user-level source of truth. User-linked tables
-- inherit exclusion via is_test_user() + the *_clean metric views. New (real)
-- accounts default is_test = false; future founder/test accounts are created
-- is_test = true via the admin-confirm-via-service-role path (is_test only) —
-- see docs/runbooks/mes-190-test-account-policy.md.
--
-- Additive + reversible, except the one approved TRUNCATE. Idempotent and
-- self-sufficient: on an empty preview DB the ADD COLUMN IF NOT EXISTS applies,
-- the backfills touch zero rows, and TRUNCATE on an empty table is a no-op.

-- 1. is_test flags (additive; default false = real user) --------------------
alter table public.profiles             add column if not exists is_test boolean not null default false;
alter table public.payment_webhook_logs add column if not exists is_test boolean not null default false;
alter table public.email_leads          add column if not exists is_test boolean not null default false;

comment on column public.profiles.is_test is
  'Founder/test account — excluded from funnel & quality metrics (MES-190). New real accounts default false; the pre-launch cohort, stephen+090* test accounts and the eval user are true.';
comment on column public.payment_webhook_logs.is_test is
  'Test/pre-launch or $0 promo-grant payment log — flagged, never deleted (financial audit). MES-190.';
comment on column public.email_leads.is_test is
  'Founder/test lead-capture row — excluded from lead metrics (MES-190).';

-- 2. Backfill: everything that exists pre-launch is founder/test -------------
-- Blanket by design (charter): the eval user (D) and the 3 external testers (E)
-- are part of the pre-launch cohort and are covered here. Idempotent.
update public.profiles             set is_test = true where is_test = false;
update public.payment_webhook_logs set is_test = true where is_test = false;
update public.email_leads          set is_test = true where is_test = false;

-- 3. Purge anonymous view-counter noise (B, approved destructive op) ---------
-- user_usage is the anonymous freemium view counter (session_id/content_type/
-- item_id, no user_id): ~11k founder browsing rows with no test-fixture or audit
-- value that would otherwise inflate any "views" metric. Regenerates naturally.
truncate table public.user_usage;

-- 4. Canonical exclusion helper ---------------------------------------------
-- SECURITY DEFINER so it can read the is_test flag regardless of the caller's
-- RLS; returns only a boolean (never profile data). Not executable by clients.
create or replace function public.is_test_user(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select p.is_test from public.profiles p where p.id = uid), false);
$$;

comment on function public.is_test_user(uuid) is
  'True if the user is a flagged founder/test account (profiles.is_test). Canonical exclusion predicate for funnel/quality metrics (MES-190); reused by the T5a dashboard pack.';

-- Revoke from the named roles too: Supabase's default privileges explicitly
-- grant EXECUTE on new public functions to anon + authenticated, and
-- REVOKE ... FROM public does NOT strip those named grants. Without this a
-- client could call is_test_user() over PostgREST and enumerate which accounts
-- are flagged test (SECURITY DEFINER reads profiles past RLS).
revoke all on function public.is_test_user(uuid) from public, anon, authenticated;
grant execute on function public.is_test_user(uuid) to service_role;

-- 5. Clean metric views (exclude test users; keep anonymous rows) ------------
-- security_invoker = on: the view runs with the CALLER's RLS, so it can never
-- become a cross-user leak. Metrics are read via service_role (RLS-exempt),
-- which sees all rows filtered down to real users only. Never granted to
-- anon/authenticated. These are the "documented, repeatable exclusion".
create or replace view public.user_subscriptions_clean
  with (security_invoker = on) as
  select s.* from public.user_subscriptions s
  where not public.is_test_user(s.user_id);

create or replace view public.user_reports_clean
  with (security_invoker = on) as
  select r.* from public.user_reports r
  where not public.is_test_user(r.user_id);

create or replace view public.user_intake_forms_clean
  with (security_invoker = on) as
  select f.* from public.user_intake_forms f
  where not public.is_test_user(f.user_id);

create or replace view public.report_quality_clean
  with (security_invoker = on) as
  select q.* from public.report_quality q
  where not public.is_test_user(q.user_id);

create or replace view public.intake_form_events_clean
  with (security_invoker = on) as
  select e.* from public.intake_form_events e
  where e.user_id is null or not public.is_test_user(e.user_id);

comment on view public.user_reports_clean is
  'user_reports excluding founder/test accounts (MES-190). Real-user baseline for day-1 metrics.';
comment on view public.report_quality_clean is
  'report_quality excluding founder/test accounts (MES-190). Feeds the degraded-run rate on real runs (T17/MES-199).';
comment on view public.intake_form_events_clean is
  'intake_form_events excluding test-user events; anonymous (null user_id) events are kept as real top-of-funnel signal (MES-190).';

revoke all on public.user_subscriptions_clean  from anon, authenticated;
revoke all on public.user_reports_clean        from anon, authenticated;
revoke all on public.user_intake_forms_clean   from anon, authenticated;
revoke all on public.report_quality_clean      from anon, authenticated;
revoke all on public.intake_form_events_clean  from anon, authenticated;

-- Explicit service_role SELECT so the metric surface doesn't silently depend on
-- inherited default privileges (durable if those are ever tightened).
grant select on public.user_subscriptions_clean to service_role;
grant select on public.user_reports_clean       to service_role;
grant select on public.user_intake_forms_clean  to service_role;
grant select on public.report_quality_clean     to service_role;
grant select on public.intake_form_events_clean to service_role;
