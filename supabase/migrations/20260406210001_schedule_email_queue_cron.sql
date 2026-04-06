-- ============================================================================
-- Schedule the email nurture queue processor to run every 6 hours
-- Requires pg_cron and pg_net extensions (enabled by default on Supabase)
-- ============================================================================

-- Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job.
-- process-email-queue has verify_jwt=false; it authenticates internally
-- using EMAIL_INTERNAL_SECRET when calling send-email.
SELECT cron.schedule(
  'process-email-queue',
  '0 */6 * * *',
  $$SELECT net.http_post(
    url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  )$$
);
