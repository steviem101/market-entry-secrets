-- DOWN for 20260621060400_kb_sync_incremental_cron.sql
-- Scope: xhziwveaiuhzdoutpgrh (MES - Australia) ONLY.
select cron.unschedule('kb-sync-incremental');
