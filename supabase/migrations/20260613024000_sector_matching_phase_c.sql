-- =====================================================================
-- Sector-relevance matching — Phase C: tag the remaining tables
--
-- Derives sector_tags from each table's richest existing text signal via the
-- map_sector_value/map_sector_values helpers from Phase A+B. No AI/API cost.
--
--   service_providers  → ALL sector_agnostic (horizontal market-entry services;
--                        verified BDO/Accenture/OFX/NZTE serve every sector).
--                        Providers match on SERVICE TYPE (goal tags) + location,
--                        not sector — so they stay universally eligible.
--   community_members  → sector_tags from specialties[]; agnostic when no
--                        vertical OR when a cross-border/trade/corridor role
--                        (those mentors are relevant to every sector).
--   content_items      → sector_tags from title + meta_description; agnostic
--                        when no vertical (general market-entry guides).
--   innovation_ecosystem (rows with no source sectors[]) → from description;
--                        agnostic fallback (most accelerators are sector-agnostic).
-- =====================================================================

-- ── service_providers: horizontal → all eligible for every sector ──────────
UPDATE public.service_providers
SET sector_agnostic = true
WHERE sector_agnostic IS DISTINCT FROM true;

-- ── community_members (mentors): served-sector from specialties ────────────
UPDATE public.community_members
SET sector_tags = public.map_sector_values(specialties),
    sector_agnostic = (
      public.map_sector_values(specialties) = '{}'
      OR array_to_string(specialties, ' ') ~* 'cross.?border|corridor|trade & gov|trade and gov|global expansion|global mobility|bilateral|\mfdi\M|soft landing|market entry|international founder|scaled founder|trade & invest'
    )
WHERE array_length(specialties,1) > 0;
-- Mentors with no specialties at all → agnostic (generalist).
UPDATE public.community_members
SET sector_agnostic = true
WHERE COALESCE(array_length(specialties,1),0) = 0;

-- ── content_items: topic from title + meta_description ─────────────────────
UPDATE public.content_items
SET sector_tags = public.map_sector_value(coalesce(title,'') || ' ' || coalesce(meta_description,'')),
    sector_agnostic = (public.map_sector_value(coalesce(title,'') || ' ' || coalesce(meta_description,'')) = '{}');

-- ── innovation_ecosystem: fill the rows that had no source sectors[] ───────
UPDATE public.innovation_ecosystem
SET sector_tags = public.map_sector_value(coalesce(description,''))
WHERE COALESCE(array_length(sector_tags,1),0) = 0 AND NOT sector_agnostic;
-- Anything still empty → agnostic (sector-agnostic accelerator/hub).
UPDATE public.innovation_ecosystem
SET sector_agnostic = true
WHERE COALESCE(array_length(sector_tags,1),0) = 0;
