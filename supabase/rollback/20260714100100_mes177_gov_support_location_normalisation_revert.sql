-- Reverse of 20260714100100_mes177_gov_support_location_normalisation.sql (MES-177 B1). Reference only.
-- Restores every location from the location_raw snapshot (populated for all rows at apply time),
-- then drops the snapshot column. location is NOT NULL and location_raw was copied from the
-- pre-migration location for every row, so the restore never writes a null.

update public.trade_investment_agencies
   set location = location_raw
 where location_raw is not null;

alter table public.trade_investment_agencies
  drop column if exists location_raw;
