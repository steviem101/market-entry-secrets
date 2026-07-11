-- ============================================================================
-- Phase 2 / step 8: DROP Irish Insights (ii_*) objects from MES Platform
-- Scope: xhziwveaiuhzdoutpgrh ONLY.
-- ============================================================================
-- DO NOT RUN until ALL of the following are true:
--   1. Irish Insights project verified fully operational (Hard Stop 2 approved).
--   2. The byte-exact down migration has been captured AND restore-tested:
--        supabase/rollback/<ts>_ii_extraction_drop_from_mes_revert.sql
--        (pg_dump --schema-only -t 'public.ii_*' + the 11 fns + 4 triggers).
--   3. mes-context canary baseline exists (audit §8) and will be re-run after.
-- This file is staged OUTSIDE supabase/migrations/ so it cannot auto-apply.
-- At execution time, copy it to:
--   supabase/migrations/<ts>_ii_extraction_drop_from_mes.sql
-- ============================================================================

begin;

-- Observability checkpoint — NOT a hard stop, and it does NOT refuse to run.
-- At drop time every ii_* table is still FULL: they are the copied backup being
-- removed, so a non-zero total is EXPECTED, not a stop condition. This block
-- PRINTS the row count of ALL 9 ii_* tables so the operator can eyeball them
-- against the Hard-Stop-2-verified Irish Insights counts immediately before
-- COMMIT. It cannot itself verify the copy (MES cannot see Irish Insights), so
-- it deliberately does not raise. The real gate is the human Hard Stop 2
-- approval + the row-count match already recorded in the runbook.
do $$
declare rec record; msg text := '';
begin
  for rec in
    select 'ii_content'                 as t, count(*) c from public.ii_content
    union all select 'ii_curations',                count(*) from public.ii_curations
    union all select 'ii_curated_log',              count(*) from public.ii_curated_log
    union all select 'ii_experiment_outputs',       count(*) from public.ii_experiment_outputs
    union all select 'ii_reddit_signals',           count(*) from public.ii_reddit_signals
    union all select 'ii_published_archive',        count(*) from public.ii_published_archive
    union all select 'ii_personal_linkedin_posts',  count(*) from public.ii_personal_linkedin_posts
    union all select 'ii_prefilter_log',            count(*) from public.ii_prefilter_log
    union all select 'ii_intro_archive',            count(*) from public.ii_intro_archive
    order by 1
  loop
    msg := msg || format('    %-28s %s', rec.t, rec.c) || E'\n';
  end loop;
  raise notice E'Pre-drop ii_* row counts (all 9 tables) — compare against the Hard-Stop-2-verified Irish Insights counts before COMMIT:\n%', msg;
end $$;

-- 1) Tables — children before parents; CASCADE covers the internal FK graph,
--    the 4 BEFORE UPDATE triggers, indexes, the ii_content RLS policy, and the
--    ii_personal_linkedin_posts identity sequence.
drop table if exists public.ii_curated_log          cascade;
drop table if exists public.ii_curations            cascade;
drop table if exists public.ii_experiment_outputs   cascade;
drop table if exists public.ii_reddit_signals       cascade;
drop table if exists public.ii_published_archive    cascade;
drop table if exists public.ii_personal_linkedin_posts cascade;
drop table if exists public.ii_prefilter_log        cascade;
drop table if exists public.ii_intro_archive        cascade;
drop table if exists public.ii_content              cascade;  -- parent last

-- 2) Functions (11 total; names are unique in public → no arg-type signature needed).
--    RPCs (6):
drop function if exists public.match_content;
drop function if exists public.match_archive;
drop function if exists public.match_emails;
drop function if exists public.recent_ii_content;
drop function if exists public.recent_ii_emails;
drop function if exists public.upsert_ii_linkedin_posts;
--    Trigger functions (5) — triggers themselves dropped with their tables above:
drop function if exists public.update_ii_content_updated_at;
drop function if exists public.ii_curations_set_updated_at;
drop function if exists public.update_ii_published_archive_updated_at;
drop function if exists public.ii_reddit_signals_set_updated_at;
--    Orphaned legacy trigger fn (no trigger references it; from when ii_content
--    was ii_emails). Live introspection 2026-06-23 found it; the original runbook
--    §1 list of 10 missed it. Dropped here so no ii_-named function is left behind.
drop function if exists public.update_ii_emails_updated_at;

commit;

-- POST-DROP (outside this transaction, per runbook step 8):
--   * Delete edge functions apify-webhook + notion-research-trigger from MES.
--   * Re-run mes-context canary (must match Phase-1 baseline).
--   * get_advisors(security) + get_advisors(performance) on MES.
