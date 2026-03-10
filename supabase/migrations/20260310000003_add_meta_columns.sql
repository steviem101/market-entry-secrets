-- DB-004: Add meta columns for SEO to tables that are missing them

ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS meta_description text;

ALTER TABLE community_members ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE community_members ADD COLUMN IF NOT EXISTS meta_description text;

ALTER TABLE innovation_ecosystem ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE innovation_ecosystem ADD COLUMN IF NOT EXISTS meta_description text;

ALTER TABLE investors ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS meta_description text;
