-- report-quality-loop feature flag + weekly schedule.
-- The loop self-gates on this activity_event_routing row: enabled=false by default, so
-- the cron fires but the function returns immediately (no reads, no AI, no writes).
-- To turn the loop ON in one change:
--   update public.activity_event_routing set enabled = true where event_type = 'report.quality.loop';
-- To turn it OFF: set enabled = false (or unschedule the cron job below).
--
-- Reuses the #report-quality channel (same channel_id as the report.quality card).

insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
values ('report.quality.loop', 'C0BB2PH60K0', ':repeat:', 'info', false, false, false)
on conflict (event_type) do nothing;

-- Weekly schedule: Tuesdays 09:00 UTC (a day after the Monday rollup). The function URL
-- is derived from the slack_notify_url vault secret (no hardcoded URL); guarded on pg_cron
-- so a from-scratch rebuild is safe. Inert until the routing flag above is enabled.
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('report-quality-loop', '0 9 * * 2', $job$
      select net.http_post(
        url := replace((select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_url' limit 1), 'slack-notify', 'report-quality-loop'),
        headers := jsonb_build_object('Content-Type','application/json',
          'x-webhook-secret',(select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)),
        body := '{}'::jsonb,
        timeout_milliseconds := 280000);
    $job$);
  end if;
end
$cron$;
