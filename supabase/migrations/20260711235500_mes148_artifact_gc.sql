-- MES-148 Phase 1b follow-up (code-review): retention for report_run_artifacts.
--
-- The artifacts table (20260711230000) had no cleanup path: the 24h resume TTL
-- was read-side only, so every report's research_bundle snapshot (raw Firecrawl/
-- Perplexity content + full match set) persisted forever, growing unbounded and
-- retaining third-party scrape content long past its 24h usefulness.
--
-- Fold the purge into the existing reaper (already scheduled every 5 min): delete
-- artifacts older than the resume TTL each sweep. CREATE OR REPLACE keeps the
-- same function/signature and the existing cron job keeps calling it — no new
-- schedule. Additive; the reaper's stuck-run behaviour is unchanged.

create or replace function public.reap_stuck_reports()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reaped integer := 0;
begin
  with stuck as (
    update public.user_reports
       set status = 'failed',
           report_json = case
             when report_json is null or report_json = '{}'::jsonb then
               jsonb_build_object(
                 'error',
                 'Report generation stalled and was marked failed. Retry to resume from the last completed stage.',
                 'reaped_at', now()
               )
             else report_json
           end
     where status = 'processing'
       and updated_at < now() - interval '15 minutes'
     returning id
  )
  select count(*) into v_reaped from stuck;

  update public.user_intake_forms
     set status = 'failed'
   where status = 'processing'
     and updated_at < now() - interval '15 minutes';

  -- Retention: resume only ever reads artifacts < 24h old, so anything older is
  -- dead weight. Delete it here so the table can't grow without bound.
  delete from public.report_run_artifacts
   where created_at < now() - interval '24 hours';

  return v_reaped;
end;
$$;

revoke execute on function public.reap_stuck_reports() from public, anon, authenticated;
