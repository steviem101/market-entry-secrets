-- Weekly full "reconcile" of the Content Creator -> KB sync (Sub-ticket 1B backstop).
--
-- The incremental cron ('kb-sync-incremental', every 3 days) keys on created_at, so it
-- CANNOT see in-place source edits that don't change created_at: a call recording
-- consented after its chunks were created, or re-extracted chunk_text/research_text.
-- This weekly job runs kb-sync in full mode (mode='reconcile' => keyset-drain every row,
-- idempotent re-upsert) to catch those. It is a BACKSTOP, not the primary path.
--
-- Safe if it doesn't finish within the timeout: kb-sync's watermark discipline never
-- regresses the incremental frontier and re-upserts are idempotent, so a partial
-- reconcile simply re-syncs a prefix and the next run tries again. If the corpus grows
-- enough that source='all' approaches the 120s compute limit, split this into staggered
-- per-source jobs (source='document_chunk' / 'research_cache' / 'linkedin') on different
-- days — the function already accepts a `source` param.
--
-- Mirrors 20260621060400_kb_sync_incremental_cron.sql: reads the guard secret from Vault
-- ('kb_sync_secret'), pg_cron-guarded (no-op on preview branches), idempotent by jobname.
-- Scheduled Sundays 04:47 UTC, offset from the 03:17 incremental slot to avoid overlap.
-- Rollback: supabase/rollback/20260718140000_..._revert.sql (unschedules the job).
-- (Renumbered from 20260718120000 to resolve a version collision with an unrelated
--  migration that merged to main first; this cron never applied before the rename.)
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping kb-sync-reconcile cron schedule';
    return;
  end if;
  if exists (select 1 from cron.job where jobname = 'kb-sync-reconcile') then
    perform cron.unschedule('kb-sync-reconcile');
  end if;
  perform cron.schedule(
    'kb-sync-reconcile',
    '47 4 * * 0',
    $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/kb-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'kb_sync_secret' limit 1)
      ),
      body := jsonb_build_object('mode', 'reconcile', 'source', 'all', 'batch_size', 100, 'max_batches', 1000),
      timeout_milliseconds := 120000
    );
    $cron$
  );
end $$;
