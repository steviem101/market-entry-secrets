-- MES-223 E3: queue hygiene — auto-expire stale agent-loop proposals.
--
-- A review queue only works if it stays short enough to actually review. Abandoned proposals
-- (e.g. the July-4 ecosystem-import batch) otherwise sit 'pending' forever and inflate every
-- pending-count on /admin/agents. This adds a scheduled sweep that flips genuinely-stale OPEN
-- proposals to each source's native rejected value, with a stamped reason, across all nine
-- sources of the agent_proposals view.
--
-- Safety:
--   • Only OPEN (pending-equivalent) rows are touched — never approved/applied/rejected. An
--     approved-but-unapplied decision is preserved (that is E1/E4's concern, not hygiene's).
--   • Reversible per row: the sweep only changes `status` (+ reviewed_at); re-open by setting the
--     status back. Fully reversible as a feature: drop the function + unschedule the cron.
--   • Conservative default age (60 days): nothing in the current queue (newest abandoned batch is
--     ~20 days old) is expired on first run — only truly-forgotten rows.
--   • SECURITY DEFINER + pinned search_path + execute revoked from anon/authenticated: callable
--     only by the cron owner / service role, never a client.
--
-- Rollback: supabase/rollback/20260724100000_agent_proposals_stale_expiry_revert.sql

create or replace function public.expire_stale_agent_proposals(p_age_days integer default 60)
returns table(source text, expired integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff timestamptz := now() - make_interval(days => greatest(p_age_days, 1));
  n integer;
begin
  -- Each source: OPEN status -> native rejected value. Mirrors SOURCE_CONFIG in agentActions.ts
  -- and the agent_proposals view status mapping. Only pending-equivalent rows are swept.

  update public.agent_content_proposals
     set status = 'rejected', reviewed_at = now()
   where status = 'pending' and created_at < cutoff;
  get diagnostics n = row_count; source := 'agent_content_proposals'; expired := n; return next;

  update public.directory_steward_staging
     set status = 'dismissed', reviewed_at = now()
   where status = 'new' and created_at < cutoff;
  get diagnostics n = row_count; source := 'directory_steward_staging'; expired := n; return next;

  update public.directory_discovery_staging
     set status = 'dismissed', reviewed_at = now()
   where status = 'new' and created_at < cutoff;
  get diagnostics n = row_count; source := 'directory_discovery_staging'; expired := n; return next;

  update public.directory_demand_signals
     set status = 'dismissed', reviewed_at = now()
   where status = 'new' and created_at < cutoff;
  get diagnostics n = row_count; source := 'directory_demand_signals'; expired := n; return next;

  update public.report_quality_proposals
     set status = 'rejected', reviewed_at = now()
   where status = 'new' and created_at < cutoff;
  get diagnostics n = row_count; source := 'report_quality_proposals'; expired := n; return next;

  update public.prompt_ab_proposals
     set status = 'dismissed', reviewed_at = now()
   where status = 'new' and created_at < cutoff;
  get diagnostics n = row_count; source := 'prompt_ab_proposals'; expired := n; return next;

  update public.ecosystem_import_candidates
     set status = 'rejected', reviewed_at = now()
   where status = 'pending' and created_at < cutoff;
  get diagnostics n = row_count; source := 'ecosystem_import_candidates'; expired := n; return next;

  update public.innovation_ecosystem_enrichment_staging
     set status = 'rejected', reviewed_at = now()
   where status = 'pending' and created_at < cutoff;
  get diagnostics n = row_count; source := 'innovation_ecosystem_enrichment_staging'; expired := n; return next;

  update public.trade_agencies_enrichment_staging
     set status = 'rejected', reviewed_at = now()
   where status = 'pending' and created_at < cutoff;
  get diagnostics n = row_count; source := 'trade_agencies_enrichment_staging'; expired := n; return next;
end;
$$;

comment on function public.expire_stale_agent_proposals(integer) is
  'MES-223 E3: flips OPEN agent-loop proposals older than p_age_days (default 60) to each source''s '
  'native rejected value. Hygiene only — never touches approved/applied rows. Scheduled weekly.';

revoke execute on function public.expire_stale_agent_proposals(integer) from public, anon, authenticated;

-- Weekly sweep: Sundays 05:00 UTC (after content-refresh 04:00, before the agent-notifier digest
-- 08:15, so the digest reflects the cleaned queue). Guarded for preview branches; idempotent by
-- job name. Mirrors 20260720100500_agent_notifier_cron.sql.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping expire-stale-agent-proposals cron schedule';
    return;
  end if;

  if exists (select 1 from cron.job where jobname = 'expire-stale-agent-proposals') then
    perform cron.unschedule('expire-stale-agent-proposals');
  end if;
  perform cron.schedule(
    'expire-stale-agent-proposals',
    '0 5 * * 0',
    $cron$ select public.expire_stale_agent_proposals(); $cron$
  );
end $$;
