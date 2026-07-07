-- MES-110 Phase B step 4b: apply the reviewed provider sector tags.
--
-- Source: docs/audits/mes-110/proposed-provider-sector-tags.csv — proposed in PR #324,
-- then corrected by the hallucination audit in commit 67cf252 (13 rows demoted to
-- pure-agnostic; reviewed together with this migration in PR #326). The VALUES below
-- embed the CORRECTED artifact: 17 specialists / 18 tagged-agnostic / 60 pure-agnostic.
--
-- Safety properties:
--   * Completeness is asserted at APPLY time: if the live table is non-empty and any
--     proposal name no longer matches a row (renamed since review), the migration
--     ABORTS loudly instead of silently part-applying. Empty preview databases skip
--     the assertion and the update is a no-op there.
--   * The update only touches rows still in their audited original state
--     (sector_tags empty AND sector_agnostic = true), and only when it would actually
--     change something — so re-runs never clobber manual tag OR flag edits, and no-op
--     rows are not rewritten (no updated_at/sitemap-lastmod churn, no needless
--     mes_knowledge_base re-embeds).
--   * Reversal (scoped to exactly these 95 rows — do NOT run an unscoped update):
--       re-create mes110_provider_tags from this file's VALUES, then
--       update public.service_providers sp
--         set sector_tags = '{}', sector_agnostic = true
--         from mes110_provider_tags m where m.name = sp.name;

drop table if exists mes110_provider_tags;
create temporary table mes110_provider_tags (
  name text primary key,
  tags text[] not null,
  agnostic boolean not null
);

insert into mes110_provider_tags (name, tags, agnostic) values
  ('Absolute Immigration', '{}'::text[], true),
  ('Accenture Australia', array['technology-information-and-media']::text[], true),
  ('Acclime', '{}'::text[], true),
  ('ADAPT', array['technology-information-and-media']::text[], false),
  ('Addisons', array['entertainment-providers', 'real-estate-and-equipment-rental-services']::text[], true),
  ('Airwallex', '{}'::text[], true),
  ('Allens', array['financial-services']::text[], true),
  ('Altios International', '{}'::text[], true),
  ('American Chamber of Commerce in Australia (AmCham Australia)', '{}'::text[], true),
  ('Australian British Chamber of Commerce (ABCC)', '{}'::text[], true),
  ('Australian Multilingual Services (AMLS)', '{}'::text[], true),
  ('Australian Trade and Investment Commission (Austrade)', '{}'::text[], true),
  ('B2B International (a dentsu company)', '{}'::text[], true),
  ('BDO Australia', '{}'::text[], true),
  ('BENCH PR', array['technology-information-and-media']::text[], false),
  ('Bolter', '{}'::text[], true),
  ('Cloud Recruit', array['technology-information-and-media']::text[], false),
  ('Convera', '{}'::text[], true),
  ('Counsel House (Counsel House Pty Ltd)', array['government-administration']::text[], true),
  ('Deloitte Australia', '{}'::text[], true),
  ('Dentons Australia', array['utilities', 'hospitals-and-health-care', 'real-estate-and-equipment-rental-services', 'financial-services']::text[], true),
  ('DLA Piper Australia', '{}'::text[], true),
  ('Ellis Jones', '{}'::text[], true),
  ('Emergo by UL', array['hospitals-and-health-care', 'manufacturing']::text[], false),
  ('Employment Hero', '{}'::text[], true),
  ('EWR (Elite Woodhams Relocation)', '{}'::text[], true),
  ('EY Australia', '{}'::text[], true),
  ('Freyr Solutions', array['hospitals-and-health-care']::text[], false),
  ('Fullstack Advisory', array['technology-information-and-media']::text[], false),
  ('Gadens', array['financial-services']::text[], true),
  ('Gilbert + Tobin (G+T Ventures)', '{}'::text[], true),
  ('GRACosway', array['government-administration']::text[], true),
  ('Grant Thornton Australia', '{}'::text[], true),
  ('Granton', array['technology-information-and-media']::text[], true),
  ('Gridware', '{}'::text[], true),
  ('Halcyon Knights', array['technology-information-and-media']::text[], false),
  ('Hall & Wilcox', '{}'::text[], true),
  ('Hatch Quarter', array['technology-information-and-media']::text[], false),
  ('Hawker Britton (Hawker Britton Group Pty Ltd)', array['government-administration']::text[], true),
  ('Hays Recruitment', '{}'::text[], true),
  ('ICS Global Logistics', array['manufacturing', 'retail', 'wholesale']::text[], true),
  ('Industry 4.01', '{}'::text[], true),
  ('Invest Victoria', '{}'::text[], true),
  ('Jaywing (officially Jaywing Pty Ltd in Australia)', '{}'::text[], true),
  ('Judo Bank', '{}'::text[], true),
  ('K&L Gates LLP', '{}'::text[], true),
  ('KPMG Australia', '{}'::text[], true),
  ('LandedFlow', array['manufacturing', 'retail', 'wholesale']::text[], true),
  ('Lander & Rogers', array['financial-services', 'real-estate-and-equipment-rental-services', 'technology-information-and-media']::text[], true),
  ('LegalVision', '{}'::text[], true),
  ('Liquid Digital', '{}'::text[], true),
  ('LUNA Startup Studio', '{}'::text[], true),
  ('Lunik', array['government-administration']::text[], true),
  ('Marsh Australia', '{}'::text[], true),
  ('McKinsey & Company', '{}'::text[], true),
  ('MinterEllison', '{}'::text[], true),
  ('MinterEllisonRuddWatts', '{}'::text[], true),
  ('NAB (National Australia Bank)', '{}'::text[], true),
  ('New Zealand Trade and Enterprise (NZTE)', '{}'::text[], true),
  ('NEXTGEN Group (NEXTGEN Distribution)', array['technology-information-and-media']::text[], false),
  ('NOW Digital', '{}'::text[], true),
  ('OFX', '{}'::text[], true),
  ('oSpace (NEXTGEN)', array['technology-information-and-media']::text[], false),
  ('Pendlebury Immigration', '{}'::text[], true),
  ('PharmOut', array['hospitals-and-health-care', 'manufacturing']::text[], false),
  ('Pinsent Masons LLP', array['construction', 'real-estate-and-equipment-rental-services']::text[], true),
  ('Pitcher Partners', '{}'::text[], true),
  ('PwC Australia', '{}'::text[], true),
  ('R2 Pharma Solutions', array['hospitals-and-health-care']::text[], false),
  ('Radium Capital', '{}'::text[], true),
  ('Redhill Communications', '{}'::text[], true),
  ('Rippling Australia', '{}'::text[], true),
  ('SalesTribe', '{}'::text[], true),
  ('SGS Australia', array['manufacturing']::text[], true),
  ('SIS International Research', '{}'::text[], true),
  ('Sleek', '{}'::text[], true),
  ('Sodali & Co', '{}'::text[], true),
  ('Speak Your Language', '{}'::text[], true),
  ('Standard Ledger', array['technology-information-and-media']::text[], false),
  ('Standards Australia Limited', '{}'::text[], true),
  ('Stockwells', array['manufacturing', 'retail', 'wholesale']::text[], true),
  ('Stone & Chalk', array['technology-information-and-media']::text[], false),
  ('TechVisa', array['technology-information-and-media']::text[], false),
  ('TG Public Affairs', array['government-administration']::text[], true),
  ('The Adjutor Group (comprising Adjutor Healthcare Pty Ltd and Adjutor Clinical)', array['hospitals-and-health-care']::text[], false),
  ('The Instant Group', '{}'::text[], true),
  ('The Polyglot Group', '{}'::text[], true),
  ('Think & Grow', array['technology-information-and-media']::text[], false),
  ('Think Global Logistics (TGL)', array['manufacturing', 'retail', 'wholesale']::text[], true),
  ('Thrive PR + Communications', '{}'::text[], true),
  ('TRANSEARCH International Australia', '{}'::text[], true),
  ('Treadstone', '{}'::text[], true),
  ('Vialto Partners', '{}'::text[], true),
  ('Visa Executive', '{}'::text[], true),
  ('Zeller', '{}'::text[], true);

-- Apply-time completeness assertion (see header). Names were validated 95/95 against
-- prod at review time; this re-checks at the moment the update actually runs.
do $$
declare
  total integer;
  unmatched integer;
  missing text;
begin
  select count(*) into total from public.service_providers;
  if total > 0 then
    select count(*), string_agg(m.name, '; ')
      into unmatched, missing
      from mes110_provider_tags m
      where not exists (
        select 1 from public.service_providers sp where sp.name = m.name
      );
    if unmatched > 0 then
      raise exception
        'MES-110 provider tag apply: % proposal name(s) no longer match a service_providers row (renamed since review?): %. Aborting so the miss is loud — re-key the affected rows and re-run.',
        unmatched, missing;
    end if;
  end if;
end $$;

update public.service_providers sp
  set sector_tags = m.tags,
      sector_agnostic = m.agnostic
  from mes110_provider_tags m
  where m.name = sp.name
    and (sp.sector_tags is null or array_length(sp.sector_tags, 1) is null)
    and sp.sector_agnostic
    and (sp.sector_tags is distinct from m.tags
         or sp.sector_agnostic is distinct from m.agnostic);

drop table if exists mes110_provider_tags;
