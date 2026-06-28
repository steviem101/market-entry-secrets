-- Hoist key report metadata out of report_json (jsonb) into queryable columns
-- (Stage 1 Firecrawl audit follow-up). Diagnostic queries — "reports with a
-- failed company scrape", "reports where Perplexity returned nothing", "slow
-- generations", "low match counts" — currently require scanning the report_json
-- blob. These scalar columns make them filterable/indexable.
--
-- Additive and non-destructive: every column is nullable with NO backfill, so
-- existing rows simply read NULL (their values still live in report_json.metadata)
-- and live writes are unaffected. generate-report populates them best-effort on
-- save, in an update decoupled from the critical report write, so a lagging
-- deploy (columns not yet present) can never fail report generation.
--
-- RLS on user_reports (owner SELECT + admin) is unchanged; these are benign
-- operational fields, readable by the report owner alongside the rest of the row.
-- Reversible: ALTER TABLE public.user_reports DROP COLUMN ... for each.
ALTER TABLE public.user_reports
  ADD COLUMN IF NOT EXISTS generation_time_ms  integer,
  ADD COLUMN IF NOT EXISTS total_matches       integer,
  ADD COLUMN IF NOT EXISTS firecrawl_ops       integer,
  ADD COLUMN IF NOT EXISTS firecrawl_scrape_ok boolean,
  ADD COLUMN IF NOT EXISTS perplexity_ok       boolean,
  ADD COLUMN IF NOT EXISTS polish_applied      boolean;

COMMENT ON COLUMN public.user_reports.generation_time_ms  IS 'Mirror of report_json.metadata.generation_time_ms (queryable).';
COMMENT ON COLUMN public.user_reports.firecrawl_scrape_ok IS 'True only when the company deep-scrape produced usable content (not a fallback).';
COMMENT ON COLUMN public.user_reports.perplexity_ok       IS 'True when at least one Perplexity query returned HTTP 200.';
