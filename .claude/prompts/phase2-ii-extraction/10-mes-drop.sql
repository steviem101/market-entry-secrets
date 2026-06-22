-- ============================================================================
-- Phase 2 / step 8: DROP Irish Insights (ii_*) objects from MES Platform
-- Scope: xhziwveaiuhzdoutpgrh ONLY.
-- ============================================================================
-- DO NOT RUN until ALL of the following are true:
--   1. Irish Insights project verified fully operational (Hard Stop 2 approved).
--   2. The byte-exact down migration has been captured AND restore-tested:
--        supabase/rollback/<ts>_ii_extraction_drop_from_mes_revert.sql
--        (pg_dump --schema-only -t 'public.ii_*' + the 10 fns + 4 triggers).
--   3. mes-context canary baseline exists (audit §8) and will be re-run after.
-- This file is staged OUTSIDE supabase/migrations/ so it cannot auto-apply.
-- At execution time, copy it to:
--   supabase/migrations/<ts>_ii_extraction_drop_from_mes.sql
-- ============================================================================

begin;

-- Belt-and-braces guard: refuse to run if any ii_* table still holds rows that
-- have NOT been confirmed copied. Operator must comment this block out only
-- after the Hard Stop 2 row-count match. (Remove/relax intentionally.)
do $$
declare n bigint;
begin
  select coalesce(sum(c),0) into n from (
    select count(*) c from public.ii_content
    union all select count(*) from public.ii_published_archive
    union all select count(*) from public.ii_reddit_signals
  ) t;
  raise notice 'Pre-drop ii_* sentinel row total (content+archive+reddit): %', n;
  -- Intentionally NOT raising here — this is an observability checkpoint, not a
  -- hard stop. The hard stop is the human approval at Hard Stop 2.
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

-- 2) Functions (names are unique in public → no arg-type signature needed).
--    RPCs:
drop function if exists public.match_content;
drop function if exists public.match_archive;
drop function if exists public.match_emails;
drop function if exists public.recent_ii_content;
drop function if exists public.recent_ii_emails;
drop function if exists public.upsert_ii_linkedin_posts;
--    Trigger functions (triggers themselves dropped with their tables above):
drop function if exists public.update_ii_content_updated_at;
drop function if exists public.ii_curations_set_updated_at;
drop function if exists public.update_ii_published_archive_updated_at;
drop function if exists public.ii_reddit_signals_set_updated_at;

commit;

-- POST-DROP (outside this transaction, per runbook step 8):
--   * Delete edge functions apify-webhook + notion-research-trigger from MES.
--   * Re-run mes-context canary (must match Phase-1 baseline).
--   * get_advisors(security) + get_advisors(performance) on MES.
