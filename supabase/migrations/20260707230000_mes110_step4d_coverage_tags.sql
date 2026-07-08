-- MES-110 Phase B step 4d: apply reviewed sector tags to the coverage-gap rows
-- on events, innovation_ecosystem and investors.
--
-- Source: docs/audits/mes-110/step4d-decisions.csv — the propose-only CSVs (PR #326)
-- as amended by the human/reviewer decisions (see that file's tag_source column:
-- stored_label | web_verified | operator_review). Two generator defaults corrected on
-- review (Greenhouse = climate-tech -> utilities; CICALab = health incubator ->
-- hospitals-and-health-care); investor label trims and the Kilara Food&Ag swap applied
-- per operator sign-off; founder-audience VC/marketing events flipped to agnostic.
--
-- Keyed by immutable row id (not name). Safety properties mirror step 4b:
--   * Per-table completeness assertion: if the live table is non-empty and any decision
--     id no longer matches a row (deleted since review), the migration ABORTS loudly.
--     Empty preview databases skip the assertion; the update is a no-op there.
--   * Guarded to rows still in their audited original state (sector_tags empty AND
--     sector_agnostic = false) AND only when a value actually changes, so re-runs never
--     clobber later manual edits and no-op rows are not rewritten (no updated_at /
--     sitemap-lastmod churn, no needless mes_knowledge_base re-embeds). Tagged rows
--     latch via non-empty tags; agnostic rows latch via sector_agnostic = true.
--   * Invariant enforced by construction: tagged => sector_agnostic = false;
--     agnostic decision => sector_tags = '{}' AND sector_agnostic = true.
--   * Reversal (scoped): re-create each temp table from this file and
--       update public.<table> t set sector_tags='{}', sector_agnostic=false
--         from <tmp> m where m.id=t.id;
--
-- NOTE (follow-up, not blocking): the agnostic rows become eligible for every report via
-- the matcher's sector_agnostic clause; the events candidate fetch orders only by date
-- with a row cap, so a large agnostic pool can crowd sector-tagged events. Tracked as a
-- generate-report ordering fix (pre-existing PLAUSIBLE finding), independent of this data.

-- ---- public.events (108 rows: 41 tagged, 67 agnostic) ----
drop table if exists mes110_4d_events;
create temporary table mes110_4d_events (id uuid primary key, tags text[] not null, agnostic boolean not null);
insert into mes110_4d_events (id, tags, agnostic) values
  ('026986da-33e0-47cc-8dfa-8639d9fc8d3e', '{}'::text[], true),
  ('042d8667-b82d-4b60-be12-7014334d76bb', array['technology-information-and-media']::text[], false),
  ('0498e14d-9056-400a-ad7e-beef227c96f7', '{}'::text[], true),
  ('0c335544-8bf1-421c-b969-17fbb111b24c', '{}'::text[], true),
  ('0db92c85-5b5d-4f7e-94ce-4fd7c65cb70c', '{}'::text[], true),
  ('0e906482-bc7a-4534-a7ef-02ea1d1276d5', '{}'::text[], true),
  ('10e88def-1db2-4a17-9318-6550a2d6c769', array['technology-information-and-media']::text[], false),
  ('116384ed-d7f0-4bcb-ae20-b46f02ea52d6', array['professional-services']::text[], false),
  ('16205f42-53ed-43c2-8649-3cf154936e87', array['technology-information-and-media']::text[], false),
  ('164d53ef-0dd9-491b-a6a9-592e5b6c33dc', array['hospitals-and-health-care', 'technology-information-and-media']::text[], false),
  ('1729a3ea-da9a-4d35-9643-034e0e065427', '{}'::text[], true),
  ('187e1c09-a7ec-4114-9194-57d9a25d11a7', array['professional-services']::text[], false),
  ('18d3e547-d9a8-4864-8c16-1fea88cf7727', '{}'::text[], true),
  ('1d465834-fc0c-4563-81bb-dace6c931937', '{}'::text[], true),
  ('2543c3ec-5cfd-4e8e-b430-fc94070d145d', '{}'::text[], true),
  ('27407b96-d4fa-48dd-a469-61ba16f2c9f7', '{}'::text[], true),
  ('29734d01-1629-4542-ad4e-7dc2b57063d9', '{}'::text[], true),
  ('29bbadbc-a705-4e8a-8e60-cc5433fe843e', '{}'::text[], true),
  ('33c6461a-4086-4318-835b-433fff91e7e0', array['technology-information-and-media']::text[], false),
  ('36406e2a-6754-4ceb-bf7e-c25ac0ace0e1', '{}'::text[], true),
  ('374d2e68-4dac-4caf-9179-34e2b1766a26', array['transportation-logistics-supply-chain-and-storage']::text[], false),
  ('3a6d047c-3af8-4ac5-92f7-3e0e6c5c5b32', '{}'::text[], true),
  ('3c97b3cf-5615-40a8-b882-9ec3e10aed65', '{}'::text[], true),
  ('3d391d91-c2b0-4f9e-8373-669a4e2de6e1', '{}'::text[], true),
  ('4372142c-27a6-4af0-a139-280f7c0c2354', array['technology-information-and-media']::text[], false),
  ('46327a8e-8dd5-4f34-beba-fac8a152d7bf', array['technology-information-and-media']::text[], false),
  ('472d7ed2-3633-43f0-b11d-edd3bdf0aa1c', '{}'::text[], true),
  ('4804a3cb-cfe1-4f10-b3cb-79c63c54be7e', '{}'::text[], true),
  ('48ce632c-7751-47e3-be97-bcc68b10b4cc', array['technology-information-and-media']::text[], false),
  ('50e2542d-c4e5-41b4-8caf-db2a0e9492c3', '{}'::text[], true),
  ('517023e2-cf59-44df-a052-e218538c7c13', array['financial-services', 'technology-information-and-media']::text[], false),
  ('53102c37-05cf-45c0-b1d3-a6f198a6e341', array['professional-services']::text[], false),
  ('58672850-8fb9-45f1-9958-4edc69f7373a', '{}'::text[], true),
  ('587be116-6c51-4a86-a1df-8a592c967fd4', '{}'::text[], true),
  ('5b5a5eec-96b1-473e-a524-e0510377d376', array['technology-information-and-media']::text[], false),
  ('5f4b8064-ed36-441b-adf7-9ed18055f0ac', '{}'::text[], true),
  ('609a982b-56d8-45a1-8eab-f0c73d729589', '{}'::text[], true),
  ('61310b3d-7d3b-4518-a04f-9230659ffeb9', '{}'::text[], true),
  ('625cacc0-a06d-4dab-b92d-9b60a1b5692b', array['professional-services']::text[], false),
  ('64294455-793e-49d9-9530-5402e1c1da45', array['technology-information-and-media']::text[], false),
  ('66a5485c-08a0-4275-b7d9-c3ba3bc4168e', '{}'::text[], true),
  ('677acec6-0f8d-4d7a-a8ff-f1412e73bcc6', '{}'::text[], true),
  ('69bd17da-1507-484a-be42-d7d73eeafc51', '{}'::text[], true),
  ('6aa7254b-2ea5-40e0-a2e5-02a0f073ef41', '{}'::text[], true),
  ('6d369364-7bb8-4d1a-beb0-2957cbb5dc6e', '{}'::text[], true),
  ('7025395d-eab1-49d4-a0b9-ba59a2d06e34', '{}'::text[], true),
  ('70d157c6-2cc2-4b0c-b574-ed25db7283eb', array['technology-information-and-media']::text[], false),
  ('74074eea-38b6-4866-9408-083b58de87e3', '{}'::text[], true),
  ('7629dcd3-dc5c-4642-8fde-3b5a9dee4774', '{}'::text[], true),
  ('7716e2c7-9c50-4021-ba34-defaffc6e663', array['technology-information-and-media']::text[], false),
  ('7a95e785-99b2-4ae9-8ffc-03745a2a6fa6', array['manufacturing']::text[], false),
  ('7bcebf4f-f840-42fb-b226-52aa68fb0dde', array['professional-services']::text[], false),
  ('7c31b20c-84a4-422c-8756-dde2c262617a', '{}'::text[], true),
  ('7d545f5b-7c33-4b3c-a7b8-eeeffeaf0b91', '{}'::text[], true),
  ('7f56c78a-1f93-4445-b4db-df6bb88ea4d8', '{}'::text[], true),
  ('8068b1f4-1c10-4ae9-bd41-1f63bdc73140', '{}'::text[], true),
  ('81ab286c-05fb-45e5-b75f-6f3d77cea34c', '{}'::text[], true),
  ('8811982b-7c60-410a-913d-ce3c59287ea5', '{}'::text[], true),
  ('89b1524c-4f70-4573-ba5e-04a42ad83419', '{}'::text[], true),
  ('8ba35c1f-cd1c-412c-8930-698f46e93f90', '{}'::text[], true),
  ('8e1f89b7-19a1-4717-a80a-5b85da7059cb', array['technology-information-and-media']::text[], false),
  ('95e3ef58-c916-4185-b4fa-c328584f8fd9', array['technology-information-and-media']::text[], false),
  ('97637738-60b9-44d2-ba02-216467d8fa4a', '{}'::text[], true),
  ('99800416-5ce1-4f0a-9bb0-b255e0c99be2', '{}'::text[], true),
  ('9e526ca7-087f-44db-a45b-9a500c504ef2', '{}'::text[], true),
  ('a1aef113-feff-4d7e-8680-9c893f865bed', '{}'::text[], true),
  ('a35815a2-a624-46a5-bc17-8966e3f981de', '{}'::text[], true),
  ('a84210aa-3e9c-4807-ae8f-14a8d8e8c7ff', array['technology-information-and-media']::text[], false),
  ('a9c7cfa2-b234-49ed-a87e-8f95eb8c63b1', array['technology-information-and-media']::text[], false),
  ('a9d746a8-ab7a-4bf5-bffc-2265dffdd951', '{}'::text[], true),
  ('aac93e6e-f821-47ee-b7cd-dd2f705a74b3', array['technology-information-and-media']::text[], false),
  ('ac777f0e-d24d-4d5d-b197-0b79295517f0', '{}'::text[], true),
  ('ad31153c-7a82-461d-9b93-06f253b89cb1', '{}'::text[], true),
  ('ae01e49b-108b-4761-9bf6-9a34f1484e87', array['technology-information-and-media']::text[], false),
  ('af1073c5-3144-449c-be02-804a63e0e55f', array['professional-services']::text[], false),
  ('b0db0ea3-891c-4c87-87c5-7f62d61fd795', array['technology-information-and-media']::text[], false),
  ('b16da01f-984b-4f4c-8028-e98cf6691b79', array['professional-services']::text[], false),
  ('b5485ae2-4087-4355-9844-77639552fd4d', array['technology-information-and-media']::text[], false),
  ('ba60f440-e141-4ea6-9612-cca7e53fc02d', array['transportation-logistics-supply-chain-and-storage']::text[], false),
  ('bb3dc0fd-4fb8-4a08-b98e-00effacc23fd', '{}'::text[], true),
  ('bed15654-3d17-4d6c-9a52-4327341b1e52', array['financial-services']::text[], false),
  ('c02bd2f7-af37-4984-b0bc-0e19f128fc0f', array['technology-information-and-media']::text[], false),
  ('c63641a6-bcef-434d-acc4-0db2e70ecfb0', '{}'::text[], true),
  ('c986fc06-88da-4ed5-952a-29e8068bc6af', '{}'::text[], true),
  ('cbe36f5a-c96f-47aa-b1fb-cc981892c524', '{}'::text[], true),
  ('cf7bafd0-0263-4816-adf1-303c0ef35782', '{}'::text[], true),
  ('d14507dd-6f35-4e9a-996d-11a3c712dcec', '{}'::text[], true),
  ('d6d10547-8b4f-4527-a89e-637970b61183', array['professional-services']::text[], false),
  ('d8794c33-5f42-4a2e-b8ac-977e8a4931ef', array['technology-information-and-media']::text[], false),
  ('e11f6964-505d-4f16-93db-51b3734b49d4', '{}'::text[], true),
  ('e164a48e-26ed-4153-a266-3865d012afb3', '{}'::text[], true),
  ('e1c65a00-42ae-410f-ae69-d8f90189a6f2', '{}'::text[], true),
  ('e2448e43-449c-4918-bdc9-52545c50585a', '{}'::text[], true),
  ('e25aa25d-a5db-4825-a17d-79f63ba8c1cf', '{}'::text[], true),
  ('e5597720-b2c4-4449-a057-71bb7ce12205', '{}'::text[], true),
  ('e600ace8-a621-4bd5-8ff8-442a410acb47', '{}'::text[], true),
  ('e68b037f-acc8-4bb3-b591-4cd1d7530d8a', array['technology-information-and-media']::text[], false),
  ('e76d5d10-7577-4f55-9a7b-ab36417b51a7', '{}'::text[], true),
  ('e8697349-2af4-4a81-b116-92a5a2709f6d', '{}'::text[], true),
  ('ebe80a24-dc97-490d-8d1c-8d86ddebf398', array['professional-services']::text[], false),
  ('ee382dd6-0bad-43bb-b50f-1d46bdcadab1', '{}'::text[], true),
  ('f3335a0d-476d-40bf-acdb-7adb32240c0e', '{}'::text[], true),
  ('f4a4652b-9695-45b6-a354-9f2f68947323', array['technology-information-and-media']::text[], false),
  ('f76cef33-f45d-4e4d-8e2d-8c7b74b527ac', array['technology-information-and-media']::text[], false),
  ('f8492c29-eec4-4f8b-92d8-3009147be8a2', '{}'::text[], true),
  ('fdbe3273-9209-4ffb-9420-2eb9165b06b6', array['technology-information-and-media']::text[], false),
  ('fe18b708-5c28-42a5-ab14-2c3dbd4c5c7e', array['technology-information-and-media']::text[], false),
  ('ffcadfb9-4738-4d7f-80de-6e4b6d944728', '{}'::text[], true);

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
      sector_agnostic = m.agnostic
  from mes110_4d_events m
  where m.id = t.id
    and (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
    and t.sector_agnostic = false
    and (t.sector_tags is distinct from m.tags or t.sector_agnostic is distinct from m.agnostic);

drop table if exists mes110_4d_events;

-- ---- public.innovation_ecosystem (44 rows: 16 tagged, 28 agnostic) ----
drop table if exists mes110_4d_innovation_ecosystem;
create temporary table mes110_4d_innovation_ecosystem (id uuid primary key, tags text[] not null, agnostic boolean not null);
insert into mes110_4d_innovation_ecosystem (id, tags, agnostic) values
  ('08e9b69a-abf3-4065-ba31-819350cf4924', '{}'::text[], true),
  ('134aaa02-792e-4464-abbd-be5c518f83a1', '{}'::text[], true),
  ('188bfdb3-14e1-44ea-b1d9-49d6fc6bf424', array['technology-information-and-media', 'professional-services', 'manufacturing']::text[], false),
  ('1a118575-435f-4876-8c3d-f19bc909706f', '{}'::text[], true),
  ('1ac27f4d-e2ea-48c0-a04b-98305c1b5f96', '{}'::text[], true),
  ('1b998fc2-4ce0-404c-8f46-48dbe584f4be', '{}'::text[], true),
  ('3276af0f-4174-402e-a931-b1d82b644a81', array['utilities', 'manufacturing', 'professional-services']::text[], false),
  ('3d2a02ca-a9c4-4bf3-8289-cab56b09cda4', '{}'::text[], true),
  ('44ec2a34-c432-4200-904d-f9dbbd5f9dfb', '{}'::text[], true),
  ('5413c39a-b921-4635-aa13-ccbd2391eeba', '{}'::text[], true),
  ('5810ade5-ae0d-43a3-8982-4100fedd642e', '{}'::text[], true),
  ('5b1f62ca-b39c-4715-aa67-71671ac7e22a', array['hospitals-and-health-care']::text[], false),
  ('5fc93ee5-69a4-4733-b21a-bc8b55553aab', '{}'::text[], true),
  ('62a5d233-cca5-40f3-9e0c-82301bbed3fc', '{}'::text[], true),
  ('66545b8a-e626-4e1d-92c7-07f0caec46ff', '{}'::text[], true),
  ('69b5776b-51ed-456c-940b-5ba77abbb31e', '{}'::text[], true),
  ('7abf5c61-c3ce-4d26-8959-d6fd8c85f3bf', '{}'::text[], true),
  ('800576bf-d691-4158-8df3-78d636e3d7f3', array['farming-ranching-forestry', 'technology-information-and-media']::text[], false),
  ('80e28efc-1e44-4e5b-83fa-c6a39b1fb1b7', '{}'::text[], true),
  ('81a3dcb2-b8cb-4eff-a72c-5d39338d61d5', '{}'::text[], true),
  ('9c85c47a-1169-48fd-8ec1-f0e474044168', array['utilities']::text[], false),
  ('b0573410-db1a-4b74-aa58-d8396436fff4', array['technology-information-and-media']::text[], false),
  ('b3f864db-8648-4b6d-b383-6dc052f22899', '{}'::text[], true),
  ('b613bd2e-0096-4b71-aa99-5df35ea5aedb', array['hospitals-and-health-care', 'manufacturing']::text[], false),
  ('c070fe03-7b67-43d9-b7ec-60c2938f4e40', array['hospitals-and-health-care']::text[], false),
  ('c1ab9efe-105b-4332-908e-76c01df2f800', '{}'::text[], true),
  ('c32cc3da-107f-422c-ad6e-35650f2e74ad', '{}'::text[], true),
  ('ca3b0fb6-e1dd-49e0-b141-5e32a9ff080d', '{}'::text[], true),
  ('cd9c566f-67e0-4840-986f-37a9ba6c0e8a', '{}'::text[], true),
  ('d541370b-0357-4a59-b3e7-cbb384c61611', array['government-administration', 'manufacturing']::text[], false),
  ('e0fee71c-2465-4078-a98d-221925e87cf1', '{}'::text[], true),
  ('e432da5c-1d8d-4919-890f-fe80acf28c15', array['hospitals-and-health-care']::text[], false),
  ('e6071edd-f223-4f33-af3b-6d8e931f4ddf', array['utilities']::text[], false),
  ('e9ba4073-fdd6-42b4-abc3-ad265abaf147', array['oil-gas-and-mining', 'utilities', 'technology-information-and-media']::text[], false),
  ('f6fcc286-ca0c-4097-b1ad-410e328a4ddd', '{}'::text[], true),
  ('faaf35b1-c37f-424b-9432-cfb596be45b6', array['hospitals-and-health-care']::text[], false),
  ('27a28ee2-0080-496b-b853-d33f46a0e034', '{}'::text[], true),
  ('4516f8e6-7dae-4511-a609-f29838932571', array['government-administration']::text[], false),
  ('6b578305-c7c4-4b26-aa6e-9fd01d424723', '{}'::text[], true),
  ('75ae3dfb-1e2a-4433-bc2f-fc7d4462207d', '{}'::text[], true),
  ('8e95ecc0-c5e5-4cf2-9675-d98718308bb9', array['utilities']::text[], false),
  ('9d71aa30-9fe5-4b8f-bc86-6183fc79fcee', array['government-administration', 'manufacturing']::text[], false),
  ('bb6e71ca-0946-4268-a025-e7280a4d6697', '{}'::text[], true),
  ('e0bc60e7-2d49-4950-8613-015c31f85b38', '{}'::text[], true);

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
      sector_agnostic = m.agnostic
  from mes110_4d_innovation_ecosystem m
  where m.id = t.id
    and (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
    and t.sector_agnostic = false
    and (t.sector_tags is distinct from m.tags or t.sector_agnostic is distinct from m.agnostic);

drop table if exists mes110_4d_innovation_ecosystem;

-- ---- public.investors (14 rows: 9 tagged, 5 agnostic) ----
drop table if exists mes110_4d_investors;
create temporary table mes110_4d_investors (id uuid primary key, tags text[] not null, agnostic boolean not null);
insert into mes110_4d_investors (id, tags, agnostic) values
  ('20d6e883-273c-4093-ae46-1b1fcb72e84a', '{}'::text[], true),
  ('34a5058a-94a6-48c8-8052-8260daff845a', array['utilities', 'manufacturing', 'farming-ranching-forestry']::text[], false),
  ('3ac1aa3b-e29e-479d-b77f-875e31b1f32c', array['technology-information-and-media']::text[], false),
  ('81b45638-4659-4114-ad28-a96d848a7412', array['technology-information-and-media', 'manufacturing']::text[], false),
  ('9108766f-f587-4f44-abb8-a3ce2983b541', array['hospitals-and-health-care', 'manufacturing']::text[], false),
  ('f33de277-3c4e-4424-8bca-ee96697dd4a9', array['entertainment-providers', 'technology-information-and-media']::text[], false),
  ('012b27c7-a93d-4b14-af08-5ed4ffdc4570', '{}'::text[], true),
  ('09c3e678-7026-4b52-adc5-dafb48017b21', array['technology-information-and-media']::text[], false),
  ('139060fd-c555-4eaf-b05b-f0cb7a8965fd', '{}'::text[], true),
  ('54b590d6-3b13-4e33-b901-92b71d8303fb', array['hospitals-and-health-care', 'education', 'technology-information-and-media']::text[], false),
  ('946dfa3a-aa8e-4827-b88b-556fe86c62d6', array['manufacturing', 'technology-information-and-media', 'utilities']::text[], false),
  ('af373908-2e76-471e-a8af-7a31a7f7ea1a', '{}'::text[], true),
  ('af83be3e-8a26-4e19-934a-c411595507a9', '{}'::text[], true),
  ('e075317f-7e60-41bb-8e90-a6a39c8b97ad', array['financial-services', 'technology-information-and-media']::text[], false);

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
      sector_agnostic = m.agnostic
  from mes110_4d_investors m
  where m.id = t.id
    and (t.sector_tags is null or array_length(t.sector_tags, 1) is null)
    and t.sector_agnostic = false
    and (t.sector_tags is distinct from m.tags or t.sector_agnostic is distinct from m.agnostic);

drop table if exists mes110_4d_investors;
