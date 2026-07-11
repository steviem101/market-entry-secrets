-- MES-148 Phase 1b: stage persistence + stuck-run reaper.
--
-- 1) report_run_artifacts — per-stage JSONB snapshots of the generate-report
--    pipeline (research_bundle after the expensive research/matching phase,
--    drafts after section generation). A retry of the same intake resumes from
--    the freshest artifact instead of re-paying Firecrawl/Perplexity/LLM spend.
--    Keyed by intake_form_id (research is intake-derived, so a new report row
--    for the same intake can safely reuse it); report_id records provenance.
--
--    Access model: service-role ONLY. RLS enabled with no policies and no
--    client grants — artifacts embed raw research/scrape content that must not
--    be readable below the tier-gated report RPCs.
--
-- 2) reap_stuck_reports() + pg_cron schedule — closes the known gap (MES-35 R3
--    / MES-111 AUD-027): an isolate death left user_reports rows 'processing'
--    forever AND the duplicate guard then blocked that intake from ever
--    regenerating. Rows processing > 15 minutes are marked failed (generation
--    telemetry shows healthy runs complete in 2-5 minutes; the edge runtime
--    hard-caps wall clock well below 15). The retry path then resumes from the
--    persisted artifacts.
--
-- Additive only; no existing table is touched.

create table if not exists public.report_run_artifacts (
  id uuid primary key default gen_random_uuid(),
  intake_form_id uuid not null references public.user_intake_forms(id) on delete cascade,
  report_id uuid not null references public.user_reports(id) on delete cascade,
  stage text not null check (stage in ('research_bundle', 'match_set', 'briefs', 'drafts')),
  artifact jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_report_run_artifacts_intake_stage
  on public.report_run_artifacts (intake_form_id, stage, created_at desc);

alter table public.report_run_artifacts enable row level security;

-- Service-role only: no policies, and strip the broad default grants.
revoke all on table public.report_run_artifacts from anon, authenticated;

-- ── Reaper ────────────────────────────────────────────────────────────────
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

  -- Matching intake rows: a stuck-processing intake also blocks the creator UI.
  update public.user_intake_forms
     set status = 'failed'
   where status = 'processing'
     and updated_at < now() - interval '15 minutes';

  return v_reaped;
end;
$$;

-- Internal maintenance function — not callable by client roles.
revoke execute on function public.reap_stuck_reports() from public, anon, authenticated;

-- ── Cron schedule (every 5 minutes) ──────────────────────────────────────
-- Plain SQL via pg_cron — no edge function, no secret. Guarded to no-op where
-- pg_cron isn't installed (preview branches), mirroring the
-- stripe-webhook-reconcile cron migration. Idempotent: re-schedules by name.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping reap-stuck-reports cron schedule';
    return;
  end if;
  if exists (select 1 from cron.job where jobname = 'reap-stuck-reports') then
    perform cron.unschedule('reap-stuck-reports');
  end if;
  perform cron.schedule(
    'reap-stuck-reports',
    '*/5 * * * *',
    $cron$ select public.reap_stuck_reports(); $cron$
  );
end $$;
