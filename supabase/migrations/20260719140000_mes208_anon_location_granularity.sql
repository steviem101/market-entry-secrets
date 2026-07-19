-- MES-208 follow-up: show anonymous mentors' city/region location.
--
-- An anonymous profile only converts to a concierge intro if it's specific
-- enough to pick. City/region location ("Melbourne, Victoria, Australia",
-- "Greater Sydney Area") is a genuine pickability signal and is identity-SAFE:
-- a metro area holds thousands of senior operators, so it resolves to no one.
-- The prior mask collapsed location to the coarse origin_country, throwing that
-- signal away.
--
-- This recreates community_members_public changing ONLY the anonymous `location`
-- expression — from origin_country to the mentor's real (metro-level) location,
-- falling back to origin_country then 'Undisclosed'. Every other mask is
-- preserved byte-for-byte (name, title, description, company, image, avatar_url,
-- experience, experience_tiles, slug), including the avatar_url anonymity guard.
-- The location column is city/region text platform-wide (no street addresses),
-- so this exposes nothing more precise than a metro.
--
-- Additive/reversible: re-running 20260709120000's definition restores the
-- coarse-origin mask. No grants, RLS, or security_invoker change.

CREATE OR REPLACE VIEW public.community_members_public AS
SELECT
  id,
  CASE WHEN is_anonymous
       THEN COALESCE(anonymous_alias, archetype, 'Verified Expert')
       ELSE name END                                                              AS name,
  CASE WHEN is_anonymous
       THEN COALESCE(anonymous_headline, archetype, 'Verified Expert')
       ELSE title END                                                             AS title,
  CASE WHEN is_anonymous
       THEN COALESCE(
              anonymous_bio,
              -- Composed from structured/public fields only. Never free text.
              'Senior ' || COALESCE(archetype, 'operator')
              || COALESCE(' with ' || substring(experience from '[0-9]+\+?\s*[Yy]ears')
                          || ' of experience', '')
              || CASE WHEN sector_tags IS NOT NULL AND sector_tags <> '{}'
                      THEN ' across '
                           || initcap(replace(array_to_string(sector_tags, ', '), '-', ' '))
                      ELSE '' END
              || '.'
              || CASE WHEN specialties IS NOT NULL AND specialties <> '{}'
                      THEN ' Specialises in ' || array_to_string(specialties, ', ') || '.'
                      ELSE '' END)
       ELSE description END                                                       AS description,
  -- Anonymous: show the real city/region base (metro-level, identity-safe),
  -- falling back to origin_country then 'Undisclosed'. (Was: origin_country.)
  CASE WHEN is_anonymous
       THEN COALESCE(NULLIF(btrim(location), ''), origin_country, 'Undisclosed')
       ELSE location END                                                          AS location,
  CASE WHEN is_anonymous
       THEN substring(experience from '[0-9]+\+?\s*[Yy]ears')
       ELSE experience END                                                        AS experience,
  specialties,
  CASE WHEN is_anonymous THEN NULL ELSE image END                                AS image,
  CASE WHEN is_anonymous THEN COALESCE(anonymous_company_label, 'Undisclosed')
       ELSE company END                                                          AS company,
  is_anonymous,
  CASE WHEN is_anonymous THEN '[]'::jsonb ELSE experience_tiles END              AS experience_tiles,
  created_at,
  updated_at,
  origin_country,
  associated_countries,
  location_id,
  CASE WHEN is_anonymous THEN 'anon-' || left(id::text, 8) ELSE slug END         AS slug,
  archetype,
  persona_fit,
  is_active,
  is_featured,
  market_corridors,
  sector_tags,
  sector_agnostic,
  -- MES-123: masked exactly like `image` — anonymous mentors never expose a real photo.
  CASE WHEN is_anonymous THEN NULL ELSE avatar_url END                           AS avatar_url
FROM public.community_members;

ALTER VIEW public.community_members_public SET (security_invoker = false);

-- Regression guards. The view has been recreated several times; fail any future
-- apply that unmasks a PII field for anonymous members.
DO $$
DECLARE v text := pg_get_viewdef('public.community_members_public'::regclass, true);
BEGIN
  IF position('avatar_url' IN v) = 0 THEN
    RAISE EXCEPTION 'community_members_public must expose avatar_url';
  END IF;
  IF v !~ 'WHEN is_anonymous THEN NULL::text[[:space:]]+ELSE avatar_url' THEN
    RAISE EXCEPTION 'community_members_public.avatar_url must be masked to NULL for anonymous members';
  END IF;
  -- name/image/slug masks must survive this recreate.
  IF v !~ 'anonymous_alias' THEN
    RAISE EXCEPTION 'community_members_public.name must stay masked to anonymous_alias';
  END IF;
  IF v !~ 'WHEN is_anonymous THEN NULL::text[[:space:]]+ELSE image' THEN
    RAISE EXCEPTION 'community_members_public.image must be masked to NULL for anonymous members';
  END IF;
END $$;
