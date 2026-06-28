-- Cross-report Firecrawl scrape cache (Stage 1 Firecrawl audit, P1 — biggest
-- credit saver). generate-report re-scrapes the company site, every matched
-- service provider, competitors and end buyers on essentially every report,
-- even though those pages rarely change. This table memoises firecrawlScrape()
-- results keyed by normalised URL, with a read-time TTL enforced in the edge
-- function (14 days for usable content, 1 day for negative results so a
-- transiently-down site retries soon).
--
-- Service-role only: the generate-report edge function (service role) is the
-- sole reader/writer. RLS is enabled with NO anon/authenticated policies and the
-- default broad client grants are revoked, consistent with the SEC-01 client
-- write lockdown — clients never touch this table. The service role bypasses RLS.
--
-- Additive, reversible, and inert until enabled: rollback = DROP TABLE, and the
-- function only reads/writes it when FIRECRAWL_CACHE_ENABLED is set (default off).

CREATE TABLE IF NOT EXISTS public.firecrawl_scrape_cache (
  url_key    text PRIMARY KEY,
  content    text,
  ok         boolean NOT NULL DEFAULT false,
  status     integer,
  byte_len   integer,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.firecrawl_scrape_cache IS
  'Memoised Firecrawl scrape results keyed by normalised URL. Service-role only; TTL enforced at read in generate-report.';

-- Cleanup support: purge stale rows by age (optional pg_cron follow-up).
CREATE INDEX IF NOT EXISTS firecrawl_scrape_cache_fetched_at_idx
  ON public.firecrawl_scrape_cache (fetched_at);

-- Enable RLS and add NO policies, so anon/authenticated have no row access.
ALTER TABLE public.firecrawl_scrape_cache ENABLE ROW LEVEL SECURITY;

-- Revoke the Supabase-default broad grants from the API roles (defence-in-depth;
-- new tables otherwise inherit broad client grants — see SEC-01).
REVOKE ALL ON public.firecrawl_scrape_cache FROM anon, authenticated;
