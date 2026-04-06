-- Phase 1: Add columns to investors table for richer VC data
-- These columns benefit all investor types, not just VCs
-- Date: 2026-04-07

----------------------------------------------------------------------
-- 1. Schema additions
----------------------------------------------------------------------

ALTER TABLE investors
  ADD COLUMN IF NOT EXISTS currently_investing boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS leads_deals boolean,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Australia',
  ADD COLUMN IF NOT EXISTS application_url text,
  ADD COLUMN IF NOT EXISTS fund_size text,
  ADD COLUMN IF NOT EXISTS year_fund_closed text,
  ADD COLUMN IF NOT EXISTS portfolio_companies text[];

----------------------------------------------------------------------
-- 2. Indexes for new filterable columns
----------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_investors_country ON investors(country);
CREATE INDEX IF NOT EXISTS idx_investors_currently_investing ON investors(currently_investing);
CREATE INDEX IF NOT EXISTS idx_investors_portfolio ON investors USING gin(portfolio_companies);
