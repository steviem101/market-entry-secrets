-- MES-148 Phase 5: pg_cron schedules for the three data-stewardship loops
-- (directory-steward P5-3, demand-mining P5-5, directory-discovery P5-4).
--
-- ⚠️ MERGE THIS LAST in the Phase 5 rollout (see docs/runbooks/mes-148-phase5-rollout.md).
-- Merging it CREATES the cron jobs immediately, but each loop SELF-GATES on its env flag
-- (DIRECTORY_STEWARD_ENABLED / DEMAND_MINING_ENABLED / DIRECTORY_DISCOVERY_ENABLED) AND an
-- enabled activity_event_routing row — so a job that fires before its loop is deployed +
-- enabled simply gets a no-op ({"skipped": ...}) or a 404, never real work. Recommended
-- path: deploy each function, flip its flag + routing, validate a manual run, THEN merge.
--
-- Each job POSTs to the function with x-webhook-secret read from Vault
-- (slack_notify_webhook_secret — the same secret the report-quality/slack-notify path
-- uses; must exist in Vault). Mirrors 20260710200000_stripe_webhook_reconcile_cron.sql:
-- guarded to no-op where pg_cron isn't installed (preview branches), idempotent
-- (re-schedules by job name). Reversible: `select cron.unschedule('<jobname>');` or revert
-- this migration.
--
-- Schedules (UTC): steward every 6h (churns through the stalest rows); demand-mining
-- weekly (Mon 02:30, demand shifts slowly); discovery weekly (Mon 03:30 — AFTER demand
-- so the week's signals exist), default max_signals to bound Firecrawl spend.

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping Phase 5 loop cron schedules';
    return;
  end if;

  -- ── directory-steward — every 6 hours at :15 ────────────────────────────────
  if exists (select 1 from cron.job where jobname = 'directory-steward') then
    perform cron.unschedule('directory-steward');
  end if;
  perform cron.schedule(
    'directory-steward',
    '15 */6 * * *',
    $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/directory-steward',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 130000
    );
    $cron$
  );

  -- ── demand-mining — weekly, Monday 02:30 ────────────────────────────────────
  if exists (select 1 from cron.job where jobname = 'demand-mining') then
    perform cron.unschedule('demand-mining');
  end if;
  perform cron.schedule(
    'demand-mining',
    '30 2 * * 1',
    $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/demand-mining',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
    $cron$
  );

  -- ── directory-discovery — weekly, Monday 03:30 (after demand-mining) ─────────
  -- Spends Firecrawl credits when enabled; body left empty so the function's default
  -- max_signals (3) bounds per-run spend. Raise cadence/max_signals only deliberately.
  if exists (select 1 from cron.job where jobname = 'directory-discovery') then
    perform cron.unschedule('directory-discovery');
  end if;
  perform cron.schedule(
    'directory-discovery',
    '30 3 * * 1',
    $cron$
    select net.http_post(
      url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/directory-discovery',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 180000
    );
    $cron$
  );
end $$;
