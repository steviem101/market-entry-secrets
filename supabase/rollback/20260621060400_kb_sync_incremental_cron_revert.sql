-- DOWN for 20260621060400_kb_sync_incremental_cron.sql
-- Scope: xhziwveaiuhzdoutpgrh (MES - Australia) ONLY.
-- Guarded so it no-ops where pg_cron isn't installed or the job was never scheduled.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from cron.job where jobname = 'kb-sync-incremental') then
    perform cron.unschedule('kb-sync-incremental');
  end if;
end $$;
