-- Phase 3.2: Staging table for trade-investment-agencies research enrichment.
-- One row per source agency. Pass 3 sub-agents write here; a manual diff
-- review gate (Phase 3.5) precedes the apply step (Phase 3.6).

CREATE TABLE IF NOT EXISTS trade_agencies_enrichment_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES trade_investment_agencies(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  enrichment JSONB NOT NULL,
  research_notes TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT trade_agencies_enrichment_staging_status_check
    CHECK (status IN ('pending','approved','rejected','applied','invalid')),
  CONSTRAINT trade_agencies_enrichment_staging_source_id_unique
    UNIQUE (source_id)
);

CREATE INDEX IF NOT EXISTS idx_trade_agencies_enrichment_staging_status
  ON trade_agencies_enrichment_staging(status);

COMMENT ON TABLE trade_agencies_enrichment_staging IS
  'Staging table for Phase 3 research enrichment of trade_investment_agencies. One row per source agency. Reviewed manually before applying via Phase 3.6.';
COMMENT ON COLUMN trade_agencies_enrichment_staging.enrichment IS
  'Structured JSON returned by the per-agency research sub-agent. Validated against the Phase 3.3 schema before insertion.';
COMMENT ON COLUMN trade_agencies_enrichment_staging.status IS
  'pending = awaiting review, approved = approved by reviewer, rejected = will not apply, applied = written to trade_investment_agencies, invalid = JSON failed validation.';
