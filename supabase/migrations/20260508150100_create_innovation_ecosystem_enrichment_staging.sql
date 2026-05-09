-- Staging tables for Phase 3 research enrichment.
--
-- innovation_ecosystem_enrichment_staging: holds AI-researched enrichments
-- for sparse innovation_ecosystem records before they are applied. Lets us
-- review and approve a diff before overwriting production data.
--
-- partner_domain_lookup: cache of partner-name -> canonical-domain
-- resolutions, used to populate the `domain` field on each entry in the
-- innovation_ecosystem.experience_tiles JSONB array. Cached so re-runs are
-- free.

CREATE TABLE IF NOT EXISTS innovation_ecosystem_enrichment_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES innovation_ecosystem(id) ON DELETE CASCADE,
  enrichment JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT enrichment_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'applied'))
);

CREATE INDEX IF NOT EXISTS idx_innovation_ecosystem_enrichment_source
  ON innovation_ecosystem_enrichment_staging(source_id);
CREATE INDEX IF NOT EXISTS idx_innovation_ecosystem_enrichment_status
  ON innovation_ecosystem_enrichment_staging(status);

ALTER TABLE innovation_ecosystem_enrichment_staging ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage enrichment staging"
  ON innovation_ecosystem_enrichment_staging;
CREATE POLICY "Admins manage enrichment staging"
  ON innovation_ecosystem_enrichment_staging
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE innovation_ecosystem_enrichment_staging IS
  'Staging area for AI-researched enrichment data before applying to innovation_ecosystem.';

CREATE TABLE IF NOT EXISTS partner_domain_lookup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_normalized TEXT GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED,
  domain TEXT,
  source TEXT NOT NULL DEFAULT 'claude_research',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_domain_lookup_name_normalized
  ON partner_domain_lookup(name_normalized);

ALTER TABLE partner_domain_lookup ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage partner domain lookup"
  ON partner_domain_lookup;
CREATE POLICY "Admins manage partner domain lookup"
  ON partner_domain_lookup
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE partner_domain_lookup IS
  'Cache of partner-name to canonical-domain resolutions, populated by Claude research.';
