-- Phase 1 (Pass 1) schema columns on trade_investment_agencies.
-- These columns were originally added directly to the live MES Supabase
-- project during the Pass 1 deterministic cleanup before the Phase 3
-- enrichment cycle. The Pass 1 ALTER was never captured as a checked-in
-- migration, which broke replay on Supabase Preview branches.
--
-- This migration is idempotent (IF NOT EXISTS) so it's a no-op on the live
-- DB where these columns already exist, and fills the gap on preview and
-- any fresh environment.

ALTER TABLE trade_investment_agencies
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS country_iso2 TEXT,
  ADD COLUMN IF NOT EXISTS needs_re_research BOOLEAN DEFAULT false;

COMMENT ON COLUMN trade_investment_agencies.domain IS
  'Canonical organisation domain, e.g. "austrade.gov.au". Used to derive logo.dev URL on read.';
COMMENT ON COLUMN trade_investment_agencies.country_iso2 IS
  'ISO-3166-1 alpha-2 country code, normalised by Pass 1 from the legacy country_origin text field.';
COMMENT ON COLUMN trade_investment_agencies.needs_re_research IS
  'Flag set true by Pass 1 for records whose description was truncated or whose website_url was hallucinated and needs verification.';

CREATE INDEX IF NOT EXISTS idx_trade_investment_agencies_domain
  ON trade_investment_agencies(domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trade_investment_agencies_country_iso2
  ON trade_investment_agencies(country_iso2) WHERE country_iso2 IS NOT NULL;
