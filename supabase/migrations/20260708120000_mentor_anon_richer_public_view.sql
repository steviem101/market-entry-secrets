-- Mentor anonymization, richer public presentation.
--
-- Problem: the anonymity mask in community_members_public was a blunt instrument.
-- It correctly hides identity-revealing FREE TEXT (real description names the
-- company; experience_tiles are company logos) and PII (image, website, contact),
-- but the replacement was a single thin line ("Senior Active Advisor with
-- experience across Financial Services.") and it also threw away genuinely
-- identity-SAFE signal — the mentor's seniority.
--
-- This migration enriches ONLY two masked-for-anonymous fields, using structured /
-- sanitised data that cannot reveal identity. Every other mask is preserved byte
-- for byte (name, title, company, location, image, experience_tiles, slug — all
-- unchanged). No new columns; no change to grants, RLS, or security_invoker.
--
--   1. experience  → a SANITISED seniority phrase extracted from the real
--      experience text with a strict regex that captures only a "<n>+ years"
--      token (digits + the word "years") and nothing else. A number is not
--      identifying. NULL when no such token exists. (Was: always NULL.)
--
--   2. description → when the admin has NOT authored an anonymous_bio, compose a
--      richer paragraph from structured, already-public fields (archetype,
--      sanitised seniority, sector_tags, specialties). anonymous_bio still takes
--      precedence, so bespoke admin copy is unchanged. (Was: archetype + sectors
--      only.) specialties and sector_tags are already exposed publicly as chips,
--      so naming them in prose leaks nothing new.
--
-- Reversible: supabase/rollback/20260708120000_mentor_anon_richer_public_view_revert.sql
-- restores the prior definition.

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
  -- Sanitised seniority: only a "<n>+ years" token, or NULL. Never the full text.
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
  sector_agnostic
FROM public.community_members;

-- Owner-executed so it can serve masked rows after anon lost base-table read.
ALTER VIEW public.community_members_public SET (security_invoker = false);
