-- MES agent loops (Workstream D): pg_cron schedule for agent-notifier (daily Slack digest).
--
-- Merging CREATES the cron job immediately, but agent-notifier SELF-SKIPS until
-- SLACK_AGENTS_DIGEST_CHANNEL is set (returns {"skipped": ...}), so it is safe to schedule before
-- the #mes-agents-* channels exist. Recommended path: create the channels, set
-- SLACK_AGENTS_DIGEST_CHANNEL / SLACK_AGENTS_ALERTS_CHANNEL (and AGENT_ACTIONS_SECRET for the
-- buttons), deploy agent-notifier, dry-run it, THEN merge.
--
-- Mirrors 20260713130000_mes148_phase5_loop_crons.sql: guarded for preview branches, idempotent by
-- job name, x-webhook-secret from Vault (slack_notify_webhook_secret). Reversible:
-- select cron.unschedule('agent-notifier');
--
-- Schedule (UTC): daily 08:15 — just after the Monday doc-freshness slot, a quiet morning window.
-- Rollback: supabase/rollback/20260720100500_agent_notifier_cron_revert.sql

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping agent-notifier cron schedule';
    return;
  end if;

  if exists (select 1 from cron.job where jobname = 'agent-notifier') then
    perform cron.unschedule('agent-notifier');
  end if;
  perform cron.schedule(
    'agent-notifier',
    '15 8 * * *',
    $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/agent-notifier',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
    $cron$
  );
end $$;
