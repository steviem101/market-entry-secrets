-- Weekly cross-report rollup -> #report-quality (Mondays 09:00 UTC).
-- Calls the report-quality-rollup edge function; URL derived from the slack_notify_url vault
-- secret (no hardcoded URL); guarded on pg_cron so it's safe on a from-scratch rebuild.
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('report-quality-rollup', '0 9 * * 1', $job$
      select net.http_post(
        url := replace((select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_url' limit 1), 'slack-notify', 'report-quality-rollup'),
        headers := jsonb_build_object('Content-Type','application/json',
          'x-webhook-secret',(select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)),
        body := '{}'::jsonb);
    $job$);
  end if;
end
$cron$;
