-- MES-177 Phase C1: bring lead_databases onto the canonical MES-110 sector vocabulary.
-- Adds a nullable sector_tags column and backfills it from the reviewed free-text->canonical
-- crosswalk (docs/audits/mes-177/C1-leads-sector-crosswalk-proposal.csv). "Sector Agnostic"
-- (23 DBs) and "Non-Profit" (1) are intentionally left untagged — they surface under
-- "All Sectors" and never become a facet value. Owner-approved 2026-07-14.
--
-- Properties: additive column · guarded (fill-only-empty) · idempotent · sector-value-keyed
-- (a value-based crosswalk, not per-id) · preview-safe (0 rows on empty DB) · reversible.
-- Side-effect (documented): the UPDATE fires the kb_sync_lead_database trigger, re-embedding the
-- tagged lead databases in mes_knowledge_base (~42 OpenAI embeds via the embed-knowledge cron) —
-- harmless (rebuildable index, exception-guarded, re-runs match 0 rows). No RLS/policy/grant change.

alter table public.lead_databases
  add column if not exists sector_tags text[];

update public.lead_databases ld
   set sector_tags = m.tags
  from (values
  ('Technology',           array['technology-information-and-media']::text[]),
  ('Telecommunications',   array['technology-information-and-media']::text[]),
  ('Financial Services',   array['financial-services']::text[]),
  ('Banking',              array['financial-services']::text[]),
  ('Insurance',            array['financial-services']::text[]),
  ('Venture Capital',      array['financial-services']::text[]),
  ('Government',           array['government-administration']::text[]),
  ('Professional Services',array['professional-services']::text[]),
  ('Retail',               array['retail']::text[]),
  ('E-commerce',           array['retail']::text[]),
  ('Agriculture',          array['farming-ranching-forestry']::text[]),
  ('Construction',         array['construction']::text[]),
  ('Defence & Space',      array['manufacturing']::text[]),
  ('Manufacturing',        array['manufacturing']::text[]),
  ('Education',            array['education']::text[]),
  ('Entertainment',        array['entertainment-providers']::text[]),
  ('Healthcare',           array['hospitals-and-health-care']::text[]),
  ('Pharmaceuticals',      array['hospitals-and-health-care']::text[]),
  ('Hospitality',          array['accommodation-and-food-services']::text[]),
  ('Logistics',            array['transportation-logistics-supply-chain-and-storage']::text[]),
  ('Mining & Metals',      array['oil-gas-and-mining']::text[]),
  ('Real Estate',          array['real-estate-and-equipment-rental-services']::text[]),
  ('Utilities',            array['utilities']::text[]),
  ('Wholesale',            array['wholesale']::text[])
  ) as m(sector_raw, tags)
 where ld.sector = m.sector_raw
   and coalesce(cardinality(ld.sector_tags), 0) = 0;

-- Expected at apply (verified live 2026-07-14): 41 rows tagged; "Sector Agnostic" (23) and
-- "Non-Profit" (1) left untagged (24 total); every free-text sector value is covered by the
-- crosswalk (0 unmapped). Preview branch: 0 rows (empty DB), a no-op.

-- Reverse (supabase/rollback/): drop the column (the tags are wholly derived from the crosswalk,
-- so a column drop is a clean, lossless revert of this migration).
