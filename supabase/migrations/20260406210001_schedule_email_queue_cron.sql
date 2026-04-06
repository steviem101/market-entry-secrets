-- ============================================================================
-- Schedule the email nurture queue processor to run every 6 hours
-- Requires pg_cron and pg_net extensions (enabled by default on Supabase)
-- ============================================================================

-- Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job
SELECT cron.schedule(
  'process-email-queue',
  '0 */6 * * *',
  $$SELECT net.http_post(
    url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', current_setting('app.settings.email_internal_secret', true)
    ),
    body := '{}'::jsonb
  )$$
);
