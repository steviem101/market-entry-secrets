-- Phase 4b: schedule embed-knowledge every 2 minutes (gradually drains the queue; the 100-row
-- hard cap lives in kb_stale_rows so a bulk hash-flip is throttled, never a cost spike).
-- Mirrors the process-email-queue cron: net.http_post + x-internal-secret from Vault.
-- NOTE: deploy the embed-knowledge edge function (supabase functions deploy embed-knowledge)
-- before/with this migration so the first cron tick has a target.
-- Reversible: supabase/rollback/20260614090200_kb_phase4_embedding_pipeline_revert.sql
do $$
begin
  if exists (select 1 from cron.job where jobname = 'embed-knowledge') then
    perform cron.unschedule('embed-knowledge');
  end if;
  perform cron.schedule('embed-knowledge', '*/2 * * * *', $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/embed-knowledge',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'knowledge_internal_secret' limit 1)
      ),
      body := '{"batch_size":100}'::jsonb
    );
  $cron$);
end $$;
