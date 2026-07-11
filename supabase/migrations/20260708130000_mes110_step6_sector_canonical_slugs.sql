-- MES-110 Phase B step 6: give the curated /sectors landing pages a canonical
-- V2 sector slug to filter content on.
--
-- Bug this fixes: useSectorContent built `content_items.sector_tags.cs.{<page slug>}`
-- using the thematic page slug (fintech / medtech / telecoms). But content_items are
-- tagged with the 20 canonical V2 sector slugs (financial-services,
-- hospitals-and-health-care, technology-information-and-media, ...), so that clause
-- matched NOTHING and only the keyword ilike fallback ever worked.
--
-- Fix: a canonical_sector_slugs[] column the hook filters on instead of the page slug.
-- Populated only where the coarse 20-sector tag is precise enough for the page:
--   * fintech  -> financial-services            (20 tagged items, on-topic)
--   * medtech  -> hospitals-and-health-care      (small, precise; keyword fallback covers health-tech)
--   * telecoms -> left NULL on purpose: its canonical sector is
--     technology-information-and-media, which also holds all software/AI/data content
--     (51 items) — far too broad for a telecoms sub-vertical. Keyword-only matching
--     (5g, network, connectivity, ...) is more precise there, so the hook drops the
--     sector_tags clause entirely when this column is NULL/empty.
--
-- Additive + idempotent: new nullable column; the guarded UPDATEs only set a row still
-- at NULL, so re-runs and later manual edits are preserved. Reversal: drop the column
-- (or null the three rows).

alter table public.industry_sectors
  add column if not exists canonical_sector_slugs text[];

update public.industry_sectors
  set canonical_sector_slugs = array['financial-services']::text[]
  where slug = 'fintech' and canonical_sector_slugs is null;

update public.industry_sectors
  set canonical_sector_slugs = array['hospitals-and-health-care']::text[]
  where slug = 'medtech' and canonical_sector_slugs is null;

-- telecoms intentionally left NULL (see header): technology-information-and-media is
-- too broad for the page; keyword matching is more precise.
