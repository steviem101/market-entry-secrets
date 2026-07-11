-- MES-123 — Contact profile images (part 1): avatar columns.
--
-- NOTE: the community_members_public view is extended to expose avatar_url in a LATER
-- migration (20260708140000), on top of the mentor-anonymization "richer view" (20260708120000)
-- that landed on main in parallel. Adding the view column here would make that later
-- CREATE OR REPLACE fail ("cannot drop columns from view"), so the view change is deferred.
--
-- Additive, reversible. Adds a consistent nullable avatar_url to the contact-bearing
-- tables that lack one, plus a linkedin_url join key where missing. The two normalised
-- contact tables (agency_contacts, service_provider_contacts) already carry avatar_url +
-- linkedin_url from the baseline, so they are untouched here. JSONB contact_persons
-- surfaces (service_providers, innovation_ecosystem) already carry a per-contact `image`
-- key + stable `id`, so they need no column change — the importer writes into that key.
--
-- Rollback: nulling avatar_url on any/all rows restores the placeholder tiles; the columns
-- are nullable and read by nothing except the avatar render path.

-- Mentors (read through community_members_public — the view exposes avatar_url from 20260708140000).
ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS avatar_url  text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;

COMMENT ON COLUMN public.community_members.avatar_url IS
  'MES-123: permanent Supabase Storage URL for the mentor profile photo (avatars bucket). Never a raw media.licdn.com URL (those expire). Masked to NULL for anonymous mentors by community_members_public.';
COMMENT ON COLUMN public.community_members.linkedin_url IS
  'MES-123: canonical LinkedIn profile URL — stable join key for contact-image imports and future enrichment. Base-table only; deliberately NOT exposed through community_members_public.';

-- Investors carry a single contact person (contact_name / contact_email / linkedin_url).
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.investors.avatar_url IS
  'MES-123: permanent Supabase Storage URL for the investor contact person''s profile photo (avatars bucket). Never a raw media.licdn.com URL.';
