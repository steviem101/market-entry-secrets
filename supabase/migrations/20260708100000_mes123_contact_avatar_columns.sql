-- MES-123 — Contact profile images (part 1/3): avatar columns + masked mentor view.
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

-- Mentors (read through community_members_public — see view recreate below).
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

-- Recreate the anonymity view to expose avatar_url with the SAME mask as `image`:
-- anonymous mentors must never leak a real face. CREATE OR REPLACE requires the exact
-- existing column list/order (verified live 2026-07-08) with the new column appended last.
CREATE OR REPLACE VIEW public.community_members_public WITH (security_invoker = false) AS
 SELECT id,
        CASE
            WHEN is_anonymous THEN COALESCE(anonymous_alias, archetype, 'Verified Expert'::text)
            ELSE name
        END AS name,
        CASE
            WHEN is_anonymous THEN COALESCE(anonymous_headline, archetype, 'Verified Expert'::text)
            ELSE title
        END AS title,
        CASE
            WHEN is_anonymous THEN COALESCE(anonymous_bio, (('Senior '::text || COALESCE(archetype, 'operator'::text)) ||
            CASE
                WHEN sector_tags IS NOT NULL AND sector_tags <> '{}'::text[] THEN ' with experience across '::text || initcap(replace(array_to_string(sector_tags, ', '::text), '-'::text, ' '::text))
                ELSE ''::text
            END) || '.'::text)
            ELSE description
        END AS description,
        CASE
            WHEN is_anonymous THEN COALESCE(origin_country, NULLIF(btrim(split_part(location, ','::text, '-1'::integer)), ''::text), 'Undisclosed'::text)
            ELSE location
        END AS location,
        CASE
            WHEN is_anonymous THEN NULL::text
            ELSE experience
        END AS experience,
    specialties,
        CASE
            WHEN is_anonymous THEN NULL::text
            ELSE image
        END AS image,
        CASE
            WHEN is_anonymous THEN COALESCE(anonymous_company_label, 'Undisclosed'::text)
            ELSE company
        END AS company,
    is_anonymous,
        CASE
            WHEN is_anonymous THEN '[]'::jsonb
            ELSE experience_tiles
        END AS experience_tiles,
    created_at,
    updated_at,
    origin_country,
    associated_countries,
    location_id,
        CASE
            WHEN is_anonymous THEN 'anon-'::text || "left"(id::text, 8)
            ELSE slug
        END AS slug,
    archetype,
    persona_fit,
    is_active,
    is_featured,
    market_corridors,
    sector_tags,
    sector_agnostic,
        CASE
            WHEN is_anonymous THEN NULL::text
            ELSE avatar_url
        END AS avatar_url
   FROM public.community_members;

-- Regression guard for the anonymity chokepoint (this view has now been re-created twice).
-- Fails the migration on any future edit that drops avatar_url or unmasks it for anonymous
-- members. Runs on every apply — preview branches and prod.
DO $$
DECLARE v text := pg_get_viewdef('public.community_members_public'::regclass, true);
BEGIN
  IF position('avatar_url' IN v) = 0 THEN
    RAISE EXCEPTION 'community_members_public must expose avatar_url';
  END IF;
  IF v !~ 'WHEN is_anonymous THEN NULL::text[[:space:]]+ELSE avatar_url' THEN
    RAISE EXCEPTION 'community_members_public.avatar_url must be masked to NULL for anonymous members';
  END IF;
END $$;
