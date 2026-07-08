-- MES-110 cleanup: drop the 14 `_legacy` backup columns from the Phase B step-3 backfill.
--
-- Each column snapshotted a raw sector column's pre-remap value so the backfill
-- (migration 20260707190000) stayed reversible during review — every one carries the
-- comment "MES-110 backup of pre-remap ...; drop after sign-off." MES-110 is now merged
-- and verified in prod:
--   * canonical sector_tags across all 8 content tables carry ZERO off-taxonomy values;
--   * 11 of 14 backfilled display columns are fully populated (no legacy-set/live-empty rows).
-- The original raw values also remain durably preserved outside the DB — in the reviewed
-- mapping CSVs (docs/audits/mes-110/*.csv) and in each column's git history — so the in-DB
-- backup is no longer needed.
--
-- Intentional-empty note: 157 rows across investors.sector_focus (32),
-- innovation_ecosystem.sectors (40) and trade_investment_agencies.sectors_supported (85)
-- have a populated `_legacy` value but a deliberately-empty live column — those raw values
-- were audience/thesis/agency-generic labels that map to no canonical sector (the canonical
-- signal for those rows now lives in `sector_tags`, set in step 4/4d). Dropping `_legacy`
-- discards the in-DB copy of those raw labels; they remain in the repo CSVs above.
--
-- DESTRUCTIVE + APPROVAL-GATED (§10.6/§11): reversal is NOT automatic — restore a column
-- from the corresponding docs/audits/mes-110/*.csv export if ever needed. `if exists`
-- keeps the migration idempotent on replay.

alter table public.content_company_profiles  drop column if exists industry_legacy;
alter table public.countries                  drop column if exists key_industries_legacy;
alter table public.country_case_studies       drop column if exists sector_legacy;
alter table public.events                     drop column if exists category_legacy;
alter table public.events                     drop column if exists sector_legacy;
alter table public.industry_sectors           drop column if exists industries_legacy;
alter table public.innovation_ecosystem       drop column if exists sectors_legacy;
alter table public.investors                  drop column if exists sector_focus_legacy;
alter table public.lead_databases             drop column if exists sector_legacy;
alter table public.lead_submissions           drop column if exists sector_legacy;
alter table public.leads                      drop column if exists category_legacy;
alter table public.leads                      drop column if exists industry_legacy;
alter table public.locations                  drop column if exists key_industries_legacy;
alter table public.trade_investment_agencies  drop column if exists sectors_supported_legacy;
