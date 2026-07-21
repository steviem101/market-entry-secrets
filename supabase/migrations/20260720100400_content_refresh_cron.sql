-- MES agent loops (Workstream B): pg_cron schedule for loop-content-refresh.
--
-- ⚠️ MERGE THIS LAST in the content-refresh rollout. Merging CREATES the cron job immediately,
-- but the loop SELF-GATES on CONTENT_REFRESH_ENABLED — a job that fires before the function is
-- deployed + enabled simply gets a no-op ({"skipped": ...}) or a 404, never real work.
-- Recommended path: deploy loop-content-refresh, dry-run it, flip CONTENT_REFRESH_ENABLED,
-- validate a manual run, THEN merge this.
--
-- Mirrors 20260713130000_mes148_phase5_loop_crons.sql: guarded to no-op where pg_cron isn't
-- installed (preview branches), idempotent (re-schedules by job name), x-webhook-secret read from
-- Vault (slack_notify_webhook_secret). Reversible: select cron.unschedule('content-refresh');
--
-- Schedule (UTC): weekly, Sunday 04:00 — quiet slot, ahead of the Monday loops; freshness shifts
-- slowly so weekly is enough, and the loop's own batch cap bounds each run.
-- Rollback: supabase/rollback/20260720100400_content_refresh_cron_revert.sql

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping content-refresh cron schedule';
    return;
  end if;

  if exists (select 1 from cron.job where jobname = 'content-refresh') then
    perform cron.unschedule('content-refresh');
  end if;
  perform cron.schedule(
    'content-refresh',
    '0 4 * * 0',
    $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/loop-content-refresh',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 180000
    );
    $cron$
  );
end $$;
