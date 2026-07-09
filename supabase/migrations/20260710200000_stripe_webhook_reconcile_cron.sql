-- MES-39 follow-up: schedule the stripe-webhook-reconcile loop every 15 minutes.
-- Replays unprocessed payment_webhook_logs rows ('received'/'failed' older than
-- 10 min) through the shared Stripe processing logic and Slack-alerts anything
-- stuck or escalated — the charged-but-never-upgraded safety net.
--
-- Reads the guard secret from Vault (name 'stripe_reconcile_secret', created
-- out-of-band in the dashboard; never committed) and sends it as
-- x-internal-secret, which the function checks against STRIPE_RECONCILE_SECRET.
-- Guarded to no-op where pg_cron isn't installed (preview branches), mirroring
-- kb_sync_incremental_cron.sql. Idempotent: re-schedules by job name.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping stripe-webhook-reconcile cron schedule';
    return;
  end if;
  if exists (select 1 from cron.job where jobname = 'stripe-webhook-reconcile') then
    perform cron.unschedule('stripe-webhook-reconcile');
  end if;
  perform cron.schedule(
    'stripe-webhook-reconcile',
    '4-59/15 * * * *',
    $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/stripe-webhook-reconcile',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'stripe_reconcile_secret' limit 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
    $cron$
  );
end $$;
