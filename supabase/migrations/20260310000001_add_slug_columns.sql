-- DB-001: Add slug columns to 5 tables that are missing them
-- DB-002: Make trade_investment_agencies.slug NOT NULL

-- Slug generation function
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
DECLARE
  base_slug text;
BEGIN
  base_slug := lower(regexp_replace(trim(input_text), '[^a-z0-9]+', '-', 'gi'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 80);
  RETURN base_slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add slug columns
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE community_members ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE innovation_ecosystem ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE country_trade_organizations ADD COLUMN IF NOT EXISTS slug text;

-- Backfill slugs from name
UPDATE service_providers SET slug = generate_slug(name) WHERE slug IS NULL;
UPDATE community_members SET slug = generate_slug(name) WHERE slug IS NULL;
UPDATE innovation_ecosystem SET slug = generate_slug(name) WHERE slug IS NULL;
UPDATE investors SET slug = generate_slug(name) WHERE slug IS NULL;
UPDATE country_trade_organizations SET slug = generate_slug(name) WHERE slug IS NULL;

-- Handle duplicates by appending row number
WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM service_providers WHERE slug IS NOT NULL
)
UPDATE service_providers SET slug = dupes.slug || '-' || dupes.rn
FROM dupes WHERE service_providers.id = dupes.id AND dupes.rn > 1;

WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM community_members WHERE slug IS NOT NULL
)
UPDATE community_members SET slug = dupes.slug || '-' || dupes.rn
FROM dupes WHERE community_members.id = dupes.id AND dupes.rn > 1;

WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM innovation_ecosystem WHERE slug IS NOT NULL
)
UPDATE innovation_ecosystem SET slug = dupes.slug || '-' || dupes.rn
FROM dupes WHERE innovation_ecosystem.id = dupes.id AND dupes.rn > 1;

WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM investors WHERE slug IS NOT NULL
)
UPDATE investors SET slug = dupes.slug || '-' || dupes.rn
FROM dupes WHERE investors.id = dupes.id AND dupes.rn > 1;

WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM country_trade_organizations WHERE slug IS NOT NULL
)
UPDATE country_trade_organizations SET slug = dupes.slug || '-' || dupes.rn
FROM dupes WHERE country_trade_organizations.id = dupes.id AND dupes.rn > 1;

-- Now set NOT NULL and UNIQUE constraints
ALTER TABLE service_providers ALTER COLUMN slug SET NOT NULL;
ALTER TABLE service_providers ADD CONSTRAINT service_providers_slug_unique UNIQUE (slug);

ALTER TABLE community_members ALTER COLUMN slug SET NOT NULL;
ALTER TABLE community_members ADD CONSTRAINT community_members_slug_unique UNIQUE (slug);

ALTER TABLE innovation_ecosystem ALTER COLUMN slug SET NOT NULL;
ALTER TABLE innovation_ecosystem ADD CONSTRAINT innovation_ecosystem_slug_unique UNIQUE (slug);

ALTER TABLE investors ALTER COLUMN slug SET NOT NULL;
ALTER TABLE investors ADD CONSTRAINT investors_slug_unique UNIQUE (slug);

ALTER TABLE country_trade_organizations ALTER COLUMN slug SET NOT NULL;
ALTER TABLE country_trade_organizations ADD CONSTRAINT country_trade_organizations_slug_unique UNIQUE (slug);

-- DB-002: Make trade_investment_agencies.slug NOT NULL
UPDATE trade_investment_agencies SET slug = generate_slug(name) WHERE slug IS NULL;
ALTER TABLE trade_investment_agencies ALTER COLUMN slug SET NOT NULL;

-- Auto-generate slugs on insert via trigger
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_providers_slug BEFORE INSERT ON service_providers
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

CREATE TRIGGER trg_community_members_slug BEFORE INSERT ON community_members
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

CREATE TRIGGER trg_innovation_ecosystem_slug BEFORE INSERT ON innovation_ecosystem
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

CREATE TRIGGER trg_investors_slug BEFORE INSERT ON investors
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

CREATE TRIGGER trg_country_trade_organizations_slug BEFORE INSERT ON country_trade_organizations
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();
