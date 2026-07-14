-- Reverse of 20260714120000_mes177_lead_databases_sector_tags.sql (MES-177 C1). Reference only.
-- The sector_tags column is wholly derived from the reviewed crosswalk, so dropping it is a
-- clean, lossless revert (the free-text `sector` column is untouched and remains the source).
alter table public.lead_databases
  drop column if exists sector_tags;
