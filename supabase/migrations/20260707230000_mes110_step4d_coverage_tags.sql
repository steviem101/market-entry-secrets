-- MES-110 Phase B step 4d: apply reviewed sector tags to the coverage-gap rows
-- on events, innovation_ecosystem and investors.
--
-- TAG-ONLY: this migration writes only the 66 sector-tagged rows
-- (events 41, innovation 16, investors 9). The 100 generic/agnostic
-- decisions are deliberately LEFT UNTOUCHED (location-gated): they already reach reports
-- via the matcher's location clause, and flipping them to sector_agnostic=true would make
-- them eligible for every report regardless of target region, crowding the row-capped,
-- relevance-unordered events fetch (generate-report/index.ts:1289). The full 166-row
-- review outcome incl. these agnostic decisions is recorded in step4d-decisions.csv
-- (migration_action = tag | leave-location-gated) for the audit trail.
--
-- Source: docs/audits/mes-110/step4d-decisions.csv — the propose-only CSVs (PR #326)
-- as amended by the human/reviewer decisions (see that file's tag_source column:
-- stored_label | web_verified | operator_review). Two generator defaults corrected on
-- review (Greenhouse = climate-tech -> utilities; CICALab = health incubator ->
-- hospitals-and-health-care); investor label trims and the Kilara Food&Ag swap applied
-- per operator sign-off.
--
-- Keyed by immutable row id (not name). Safety properties mirror step 4b:
--   * Two per-table assertions (both skip empty preview DBs): a PRE-update check that
--     every tagged-decision id still exists (aborts naming any deleted since review), and
--     a POST-update check that every tagged-decision row now carries tags (aborts if the
--     guard silently skipped any row, e.g. a NULL sector_agnostic or state drift).
--   * Guarded to rows still in their audited original state (sector_tags empty AND
--     coalesce(sector_agnostic,false) = false) AND only when tags actually change, so
--     re-runs never clobber later manual edits and no-op rows are not rewritten (no
--     updated_at / sitemap-lastmod churn, no needless mes_knowledge_base re-embeds).
--     Tagged rows latch via non-empty tags on re-run.
--   * Sets sector_agnostic = false on tagged rows (already false; keeps the invariant
--     tagged => not agnostic explicit).
--   * Reversal (scoped to the tagged ids): re-create each temp table from this file and
--       update public.<table> t set sector_tags='{}'
--         from <tmp> m where m.id=t.id;  -- sector_agnostic was already false
--
-- Mechanism: applied via a reviewed id-keyed CSV + guarded migration rather than a
-- persistent *_enrichment_staging table (directory-data-enrichment skill) — deliberate
-- for a one-shot reviewed coverage pass; the audit trail lives in step4d-decisions.csv
-- (tag_source + migration_action per row) and the in-DB 'applied' latch is the guard above.

-- ---- public.events (41 sector-tagged rows applied; 67 generic rows left location-gated) ----
drop table if exists mes110_4d_events;
create temporary table mes110_4d_events (id uuid primary key, tags text[] not null);
insert into mes110_4d_events (id, tags) values
  ('042d8667-b82d-4b60-be12-7014334d76bb', array['technology-information-and-media']::text[]),
  ('10e88def-1db2-4a17-9318-6550a2d6c769', array['technology-information-and-media']::text[]),
  ('116384ed-d7f0-4bcb-ae20-b46f02ea52d6', array['professional-services']::text[]),
  ('16205f42-53ed-43c2-8649-3cf154936e87', array['technology-information-and-media']::text[]),
  ('164d53ef-0dd9-491b-a6a9-592e5b6c33dc', array['hospitals-and-health-care', 'technology-information-and-media']::text[]),
  ('187e1c09-a7ec-4114-9194-57d9a25d11a7', array['professional-services']::text[]),
  ('33c6461a-4086-4318-835b-433fff91e7e0', array['technology-information-and-media']::text[]),
  ('374d2e68-4dac-4caf-9179-34e2b1766a26', array['transportation-logistics-supply-chain-and-storage']::text[]),
  ('4372142c-27a6-4af0-a139-280f7c0c2354', array['technology-information-and-media']::text[]),
  ('46327a8e-8dd5-4f34-beba-fac8a152d7bf', array['technology-information-and-media']::text[]),
  ('48ce632c-7751-47e3-be97-bcc68b10b4cc', array['technology-information-and-media']::text[]),
  ('517023e2-cf59-44df-a052-e218538c7c13', array['financial-services', 'technology-information-and-media']::text[]),
  ('53102c37-05cf-45c0-b1d3-a6f198a6e341', array['professional-services']::text[]),
  ('5b5a5eec-96b1-473e-a524-e0510377d376', array['technology-information-and-media']::text[]),
  ('625cacc0-a06d-4dab-b92d-9b60a1b5692b', array['professional-services']::text[]),
  ('64294455-793e-49d9-9530-5402e1c1da45', array['technology-information-and-media']::text[]),
  ('70d157c6-2cc2-4b0c-b574-ed25db7283eb', array['technology-information-and-media']::text[]),
  ('7716e2c7-9c50-4021-ba34-defaffc6e663', array['technology-information-and-media']::text[]),
  ('7a95e785-99b2-4ae9-8ffc-03745a2a6fa6', array['manufacturing']::text[]),
  ('7bcebf4f-f840-42fb-b226-52aa68fb0dde', array['professional-services']::text[]),
  ('8e1f89b7-19a1-4717-a80a-5b85da7059cb', array['technology-information-and-media']::text[]),
  ('95e3ef58-c916-4185-b4fa-c328584f8fd9', array['technology-information-and-media']::text[]),
  ('a84210aa-3e9c-4807-ae8f-14a8d8e8c7ff', array['technology-information-and-media']::text[]),
  ('a9c7cfa2-b234-49ed-a87e-8f95eb8c63b1', array['technology-information-and-media']::text[]),
  ('aac93e6e-f821-47ee-b7cd-dd2f705a74b3', array['technology-information-and-media']::text[]),
  ('ae01e49b-108b-4761-9bf6-9a34f1484e87', array['technology-information-and-media']::text[]),
  ('af1073c5-3144-449c-be02-804a63e0e55f', array['professional-services']::text[]),
  ('b0db0ea3-891c-4c87-87c5-7f62d61fd795', array['technology-information-and-media']::text[]),
  ('b16da01f-984b-4f4c-8028-e98cf6691b79', array['professional-services']::text[]),
  ('b5485ae2-4087-4355-9844-77639552fd4d', array['technology-information-and-media']::text[]),
  ('ba60f440-e141-4ea6-9612-cca7e53fc02d', array['transportation-logistics-supply-chain-and-storage']::text[]),
  ('bed15654-3d17-4d6c-9a52-4327341b1e52', array['financial-services']::text[]),
  ('c02bd2f7-af37-4984-b0bc-0e19f128fc0f', array['technology-information-and-media']::text[]),
  ('d6d10547-8b4f-4527-a89e-637970b61183', array['professional-services']::text[]),
  ('d8794c33-5f42-4a2e-b8ac-977e8a4931ef', array['technology-information-and-media']::text[]),
  ('e68b037f-acc8-4bb3-b591-4cd1d7530d8a', array['technology-information-and-media']::text[]),
  ('ebe80a24-dc97-490d-8d1c-8d86ddebf398', array['professional-services']::text[]),
  ('f4a4652b-9695-45b6-a354-9f2f68947323', array['technology-information-and-media']::text[]),
  ('f76cef33-f45d-4e4d-8e2d-8c7b74b527ac', array['technology-information-and-media']::text[]),
  ('fdbe3273-9209-4ffb-9420-2eb9165b06b6', array['technology-information-and-media']::text[]),
  ('fe18b708-5c28-42a5-ab14-2c3dbd4c5c7e', array['technology-information-and-media']::text[]);

do $$
declare total int; missing int; miss text;
begin
  select count(*) into total from public.events;
  if total > 0 then
    select count(*), string_agg(m.id::text, '; ') into missing, miss
      from mes110_4d_events m where not exists (select 1 from public.events t where t.id = m.id);
    if missing > 0 then
      raise exception 'MES-110 4d events: % proposal id(s) not found (deleted since review?): %. Aborting.', missing, miss;
    end if;
  end if;
end $$;

update public.events t
  set sector_tags = m.tags,
      sector_agnostic = false
  from mes110_4d_events m
  where m.id = t.id
    and (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
    and coalesce(t.sector_agnostic, false) = false
    and t.sector_tags is distinct from m.tags;

-- Post-update completeness assertion: every sector-tagged decision row must now carry
-- tags. A row still in original-gap state (empty tags AND not agnostic) means the guard
-- silently skipped it — e.g. a NULL sector_agnostic, or unexpected state drift. Rows an
-- operator legitimately tagged after review are excluded (non-empty tags) and correctly
-- not re-touched. Skips empty preview DBs.
do $$
declare total int; unapplied int; ids text;
begin
  select count(*) into total from public.events;
  if total > 0 then
    select count(*), string_agg(m.id::text, '; ') into unapplied, ids
      from mes110_4d_events m
      join public.events t on t.id = m.id
      where (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
        and coalesce(t.sector_agnostic, false) = false;
    if unapplied > 0 then
      raise exception 'MES-110 4d events: % row(s) not applied (guard-skipped, state drift?): %. Aborting.', unapplied, ids;
    end if;
  end if;
end $$;

drop table if exists mes110_4d_events;

-- ---- public.innovation_ecosystem (16 sector-tagged rows applied; 28 generic rows left location-gated) ----
drop table if exists mes110_4d_innovation_ecosystem;
create temporary table mes110_4d_innovation_ecosystem (id uuid primary key, tags text[] not null);
insert into mes110_4d_innovation_ecosystem (id, tags) values
  ('188bfdb3-14e1-44ea-b1d9-49d6fc6bf424', array['technology-information-and-media', 'professional-services', 'manufacturing']::text[]),
  ('3276af0f-4174-402e-a931-b1d82b644a81', array['utilities', 'manufacturing', 'professional-services']::text[]),
  ('5b1f62ca-b39c-4715-aa67-71671ac7e22a', array['hospitals-and-health-care']::text[]),
  ('800576bf-d691-4158-8df3-78d636e3d7f3', array['farming-ranching-forestry', 'technology-information-and-media']::text[]),
  ('9c85c47a-1169-48fd-8ec1-f0e474044168', array['utilities']::text[]),
  ('b0573410-db1a-4b74-aa58-d8396436fff4', array['technology-information-and-media']::text[]),
  ('b613bd2e-0096-4b71-aa99-5df35ea5aedb', array['hospitals-and-health-care', 'manufacturing']::text[]),
  ('c070fe03-7b67-43d9-b7ec-60c2938f4e40', array['hospitals-and-health-care']::text[]),
  ('d541370b-0357-4a59-b3e7-cbb384c61611', array['government-administration', 'manufacturing']::text[]),
  ('e432da5c-1d8d-4919-890f-fe80acf28c15', array['hospitals-and-health-care']::text[]),
  ('e6071edd-f223-4f33-af3b-6d8e931f4ddf', array['utilities']::text[]),
  ('e9ba4073-fdd6-42b4-abc3-ad265abaf147', array['oil-gas-and-mining', 'utilities', 'technology-information-and-media']::text[]),
  ('faaf35b1-c37f-424b-9432-cfb596be45b6', array['hospitals-and-health-care']::text[]),
  ('4516f8e6-7dae-4511-a609-f29838932571', array['government-administration']::text[]),
  ('8e95ecc0-c5e5-4cf2-9675-d98718308bb9', array['utilities']::text[]),
  ('9d71aa30-9fe5-4b8f-bc86-6183fc79fcee', array['government-administration', 'manufacturing']::text[]);

do $$
declare total int; missing int; miss text;
begin
  select count(*) into total from public.innovation_ecosystem;
  if total > 0 then
    select count(*), string_agg(m.id::text, '; ') into missing, miss
      from mes110_4d_innovation_ecosystem m where not exists (select 1 from public.innovation_ecosystem t where t.id = m.id);
    if missing > 0 then
      raise exception 'MES-110 4d innovation_ecosystem: % proposal id(s) not found (deleted since review?): %. Aborting.', missing, miss;
    end if;
  end if;
end $$;

update public.innovation_ecosystem t
  set sector_tags = m.tags,
      sector_agnostic = false
  from mes110_4d_innovation_ecosystem m
  where m.id = t.id
    and (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
    and coalesce(t.sector_agnostic, false) = false
    and t.sector_tags is distinct from m.tags;

-- Post-update completeness assertion: every sector-tagged decision row must now carry
-- tags. A row still in original-gap state (empty tags AND not agnostic) means the guard
-- silently skipped it — e.g. a NULL sector_agnostic, or unexpected state drift. Rows an
-- operator legitimately tagged after review are excluded (non-empty tags) and correctly
-- not re-touched. Skips empty preview DBs.
do $$
declare total int; unapplied int; ids text;
begin
  select count(*) into total from public.innovation_ecosystem;
  if total > 0 then
    select count(*), string_agg(m.id::text, '; ') into unapplied, ids
      from mes110_4d_innovation_ecosystem m
      join public.innovation_ecosystem t on t.id = m.id
      where (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
        and coalesce(t.sector_agnostic, false) = false;
    if unapplied > 0 then
      raise exception 'MES-110 4d innovation_ecosystem: % row(s) not applied (guard-skipped, state drift?): %. Aborting.', unapplied, ids;
    end if;
  end if;
end $$;

drop table if exists mes110_4d_innovation_ecosystem;

-- ---- public.investors (9 sector-tagged rows applied; 5 generic rows left location-gated) ----
drop table if exists mes110_4d_investors;
create temporary table mes110_4d_investors (id uuid primary key, tags text[] not null);
insert into mes110_4d_investors (id, tags) values
  ('34a5058a-94a6-48c8-8052-8260daff845a', array['utilities', 'manufacturing', 'farming-ranching-forestry']::text[]),
  ('3ac1aa3b-e29e-479d-b77f-875e31b1f32c', array['technology-information-and-media']::text[]),
  ('81b45638-4659-4114-ad28-a96d848a7412', array['technology-information-and-media', 'manufacturing']::text[]),
  ('9108766f-f587-4f44-abb8-a3ce2983b541', array['hospitals-and-health-care', 'manufacturing']::text[]),
  ('f33de277-3c4e-4424-8bca-ee96697dd4a9', array['entertainment-providers', 'technology-information-and-media']::text[]),
  ('09c3e678-7026-4b52-adc5-dafb48017b21', array['technology-information-and-media']::text[]),
  ('54b590d6-3b13-4e33-b901-92b71d8303fb', array['hospitals-and-health-care', 'education', 'technology-information-and-media']::text[]),
  ('946dfa3a-aa8e-4827-b88b-556fe86c62d6', array['manufacturing', 'technology-information-and-media', 'utilities']::text[]),
  ('e075317f-7e60-41bb-8e90-a6a39c8b97ad', array['financial-services', 'technology-information-and-media']::text[]);

do $$
declare total int; missing int; miss text;
begin
  select count(*) into total from public.investors;
  if total > 0 then
    select count(*), string_agg(m.id::text, '; ') into missing, miss
      from mes110_4d_investors m where not exists (select 1 from public.investors t where t.id = m.id);
    if missing > 0 then
      raise exception 'MES-110 4d investors: % proposal id(s) not found (deleted since review?): %. Aborting.', missing, miss;
    end if;
  end if;
end $$;

update public.investors t
  set sector_tags = m.tags,
      sector_agnostic = false
  from mes110_4d_investors m
  where m.id = t.id
    and (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
    and coalesce(t.sector_agnostic, false) = false
    and t.sector_tags is distinct from m.tags;

-- Post-update completeness assertion: every sector-tagged decision row must now carry
-- tags. A row still in original-gap state (empty tags AND not agnostic) means the guard
-- silently skipped it — e.g. a NULL sector_agnostic, or unexpected state drift. Rows an
-- operator legitimately tagged after review are excluded (non-empty tags) and correctly
-- not re-touched. Skips empty preview DBs.
do $$
declare total int; unapplied int; ids text;
begin
  select count(*) into total from public.investors;
  if total > 0 then
    select count(*), string_agg(m.id::text, '; ') into unapplied, ids
      from mes110_4d_investors m
      join public.investors t on t.id = m.id
      where (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
        and coalesce(t.sector_agnostic, false) = false;
    if unapplied > 0 then
      raise exception 'MES-110 4d investors: % row(s) not applied (guard-skipped, state drift?): %. Aborting.', unapplied, ids;
    end if;
  end if;
end $$;

drop table if exists mes110_4d_investors;
