-- Revert 20260708120000_mentor_anon_richer_public_view.sql.
-- Restores the prior community_members_public definition (experience → NULL for
-- anonymous, and the archetype+sectors-only description fallback).

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
       THEN COALESCE(anonymous_bio,
                     ('Senior ' || COALESCE(archetype, 'operator')
                      || CASE WHEN sector_tags IS NOT NULL AND sector_tags <> '{}'
                              THEN ' with experience across '
                                   || initcap(replace(array_to_string(sector_tags, ', '), '-', ' '))
                              ELSE '' END) || '.')
       ELSE description END                                                       AS description,
  CASE WHEN is_anonymous
       THEN COALESCE(origin_country,
                     NULLIF(btrim(split_part(location, ',', -1)), ''),
                     'Undisclosed')
       ELSE location END                                                          AS location,
  CASE WHEN is_anonymous THEN NULL ELSE experience END                           AS experience,
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
  sector_agnostic
FROM public.community_members;

ALTER VIEW public.community_members_public SET (security_invoker = false);
