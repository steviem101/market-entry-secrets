-- ============================================================================
-- Schedule the email nurture queue processor to run every 6 hours
-- Requires pg_cron, pg_net extensions and vault secret 'email_internal_secret'
-- Each step is individually guarded so preview branches don't fail.
-- ============================================================================

-- Try to enable extensions (no-op on production, may fail on preview)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron extension not available: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net extension not available: %', SQLERRM;
END $$;

-- Only schedule if pg_cron is actually installed
-- The secret must be stored in vault with:
--   SELECT vault.create_secret('<value>', 'email_internal_secret');
-- and the same value set as EMAIL_INTERNAL_SECRET in edge function env vars.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'process-email-queue',
      '0 */6 * * *',
      E'SELECT net.http_post(\n'
      || E'  url := ''https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/process-email-queue'',\n'
      || E'  headers := jsonb_build_object(\n'
      || E'    ''Content-Type'', ''application/json'',\n'
      || E'    ''x-internal-secret'', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = ''email_internal_secret'' LIMIT 1)\n'
      || E'  ),\n'
      || E'  body := ''{}''::jsonb\n'
      || E')'
    );
    RAISE NOTICE 'pg_cron job scheduled: process-email-queue every 6 hours';
  ELSE
    RAISE NOTICE 'pg_cron not installed, skipping cron job setup';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Cron scheduling failed (non-fatal): %', SQLERRM;
END $$;
