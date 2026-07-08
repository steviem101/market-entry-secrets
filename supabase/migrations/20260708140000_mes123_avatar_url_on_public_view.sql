-- MES-123 — Contact profile images (view, part 5): expose avatar_url through the mentor view.
--
-- Ordered AFTER main's mentor-anonymization "richer view" (20260708120000). That migration
-- recreates community_members_public with 24 columns; adding avatar_url earlier would make its
-- CREATE OR REPLACE fail ("cannot drop columns from view"). So we take main's richer definition
-- verbatim and append avatar_url as the final column, masked to NULL for anonymous mentors
-- (their photo must never leak) — the same mask main applies to `image`.
--
-- Rollback: nulling community_members.avatar_url restores placeholder tiles; to drop the column
-- from the view, re-run main's 20260708120000 definition.

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
  CASE WHEN is_anonymous
       THEN COALESCE(origin_country,
                     NULLIF(btrim(split_part(location, ',', -1)), ''),
                     'Undisclosed')
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

-- Anonymity-mask regression guard for avatar_url (the view has now been re-created several times
-- across MES-123 + the mentor-anonymization work). Fails any future apply that drops or unmasks it.
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
