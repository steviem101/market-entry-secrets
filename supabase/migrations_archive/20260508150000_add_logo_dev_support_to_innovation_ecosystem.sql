-- Add domain + sectors columns to innovation_ecosystem.
-- domain is the canonical organisation domain (e.g. "blackbird.vc"), used to
-- derive logo.dev image URLs on read. sectors holds industry classifications
-- (Fintech, Agritech, etc.) — distinct from the existing services array which
-- describes what an organisation does.
--
-- The existing logo column is preserved as a manual override / fallback.

ALTER TABLE innovation_ecosystem
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS sectors TEXT[] DEFAULT '{}'::text[];

COMMENT ON COLUMN innovation_ecosystem.domain IS
  'Canonical organisation domain, e.g. "blackbird.vc". Used to derive logo.dev URL on read.';
COMMENT ON COLUMN innovation_ecosystem.sectors IS
  'Industry sectors served (Fintech, Agritech, etc.). Distinct from services (what they do).';

CREATE INDEX IF NOT EXISTS idx_innovation_ecosystem_domain
  ON innovation_ecosystem(domain) WHERE domain IS NOT NULL;

-- Backfill domain from website for the 118 records that have one.
-- Strips protocol (http/https), leading www., and any path/query/fragment.
UPDATE innovation_ecosystem
SET domain = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(website, '^https?://(www\.)?', ''),
    '/.*$', ''
  )
)
WHERE website IS NOT NULL AND website != '' AND domain IS NULL;
