-- Phase 4.1: extend agency_contacts with PIT-CRM scoring fields preserved
-- from the contact_persons jsonb migration in Phase 4.2.

ALTER TABLE agency_contacts
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mes_relevance_score INT,
  ADD COLUMN IF NOT EXISTS tier TEXT;

COMMENT ON COLUMN agency_contacts.is_archived IS
  'True for contacts marked hidden in original contact_persons jsonb (e.g. former staff).';
COMMENT ON COLUMN agency_contacts.mes_relevance_score IS
  'MES platform relevance score (0-100) from PIT CRM contact research.';
COMMENT ON COLUMN agency_contacts.tier IS
  'Tier classification (A - High, B - Medium, C - Low, D - Skip) from PIT CRM scoring.';

CREATE INDEX IF NOT EXISTS idx_agency_contacts_agency_id
  ON agency_contacts(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_contacts_agency_primary
  ON agency_contacts(agency_id, is_primary)
  WHERE is_primary = true;
