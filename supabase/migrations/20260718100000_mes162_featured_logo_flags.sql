-- MES-162 — homepage hero credibility: featured-logo flags.
--
-- The homepage LogoCloud shows 8-12 real, recognisable organisation logos
-- pulled from live records flagged as featured. trade_investment_agencies and
-- community_members already carry an is_featured column; this adds the same
-- (additive, default false) column to the two remaining source tables so an
-- admin can curate the strip with a direct DB flag.
--
-- Deliberately ships with NO rows flagged: a record may only be featured once
-- its logo usage rights are confirmed (MES-162 risk register). The LogoCloud
-- renders nothing until enough records are flagged, so this is safe to apply
-- ahead of curation.
--
-- No RLS/grant changes: both tables are public-read directories and writes
-- remain service-role/admin-only per the SEC-01 grant lockdown. Additive and
-- reversible; idempotent for preview-branch replays.

alter table public.service_providers
  add column if not exists is_featured boolean not null default false;

alter table public.innovation_ecosystem
  add column if not exists is_featured boolean not null default false;

comment on column public.service_providers.is_featured is
  'Curated homepage logo-strip flag (MES-162). Only set true for records with confirmed logo usage rights.';

comment on column public.innovation_ecosystem.is_featured is
  'Curated homepage logo-strip flag (MES-162). Only set true for records with confirmed logo usage rights.';
