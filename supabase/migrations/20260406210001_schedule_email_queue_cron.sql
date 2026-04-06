-- ============================================================================
-- Schedule the email nurture queue processor to run every 6 hours
-- Requires pg_cron, pg_net extensions and vault secret 'email_internal_secret'
-- Wrapped in exception handler so preview branches (which lack pg_cron) don't fail.
-- ============================================================================

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  CREATE EXTENSION IF NOT EXISTS pg_net;

  -- The secret must be stored in vault with:
  --   SELECT vault.create_secret('<value>', 'email_internal_secret');
  -- and the same value set as EMAIL_INTERNAL_SECRET in edge function env vars.
  PERFORM cron.schedule(
    'process-email-queue',
    '0 */6 * * *',
    $cron$SELECT net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/process-email-queue',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_internal_secret' LIMIT 1)
      ),
      body := '{}'::jsonb
    )$cron$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron scheduling skipped (not available in this environment): %', SQLERRM;
END $$;
