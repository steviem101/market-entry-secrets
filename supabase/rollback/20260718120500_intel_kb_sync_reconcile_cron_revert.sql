-- Rollback for 20260718120500_intel_kb_sync_reconcile_cron.sql
-- Unschedules the weekly reconcile job (pg_cron-guarded so it no-ops where pg_cron
-- isn't installed or the job was never scheduled).
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; nothing to unschedule';
    return;
  end if;
  if exists (select 1 from cron.job where jobname = 'kb-sync-reconcile') then
    perform cron.unschedule('kb-sync-reconcile');
  end if;
end $$;
