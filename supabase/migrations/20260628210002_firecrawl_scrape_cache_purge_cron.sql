-- Daily purge of stale firecrawl_scrape_cache rows (Stage 1 Firecrawl audit
-- follow-up). The cache (migration 20260628210001) enforces a read-time TTL
-- (14d usable / 1d negative) but never deletes expired rows, so without this the
-- table would grow by every distinct URL ever scraped. This schedules a daily
-- DELETE of rows older than 30 days — well past the 14d positive TTL, so nothing
-- still servable is removed (uses the fetched_at index).
--
-- pg_cron-guarded: raise notice + return when the extension is absent, so the
-- migration is a no-op on environments without pg_cron (keeps Supabase Preview CI
-- green) — mirrors the existing embed-knowledge / report-quality cron migrations.
-- Idempotent: unschedules any prior job of the same name first.
-- Reversible: select cron.unschedule('firecrawl-scrape-cache-purge');
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping firecrawl-scrape-cache-purge schedule';
    return;
  end if;
  if exists (select 1 from cron.job where jobname = 'firecrawl-scrape-cache-purge') then
    perform cron.unschedule('firecrawl-scrape-cache-purge');
  end if;
  perform cron.schedule('firecrawl-scrape-cache-purge', '17 3 * * *', $cron$
    delete from public.firecrawl_scrape_cache where fetched_at < now() - interval '30 days';
  $cron$);
end $$;
