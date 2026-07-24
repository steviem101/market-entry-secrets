-- Rollback for 20260724100000_agent_proposals_stale_expiry.sql (MES-223 E3).
-- Unschedule the sweep and drop the function. Already-expired rows are NOT restored (they were
-- reversible individually by resetting status, but this revert does not attempt a blanket undo —
-- the cutoff is unknown at revert time). Re-open specific rows manually if needed.

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from cron.job where jobname = 'expire-stale-agent-proposals') then
    perform cron.unschedule('expire-stale-agent-proposals');
  end if;
end $$;

drop function if exists public.expire_stale_agent_proposals(integer);
