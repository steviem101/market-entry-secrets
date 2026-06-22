-- Incremental Content Creator -> KB sync, every 3 days (aligned to the Apify
-- scrape cadence). Reads the guard secret from Vault (name 'kb_sync_secret',
-- created out-of-band; never committed). Pulls only posts with
-- synced_at > the stored watermark in kb_sync_state.
select cron.schedule(
  'kb-sync-incremental',
  '17 3 */3 * *',
  $cron$
  select net.http_post(
    url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/kb-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'kb_sync_secret' limit 1)
    ),
    body := jsonb_build_object('mode', 'incremental', 'batch_size', 100, 'max_batches', 100),
    timeout_milliseconds := 120000
  );
  $cron$
);
