-- Phase 6 fan-out (batch 1): 8 structured single-row entities.
-- Same proven pattern as service_providers: PII-stripped upsert + exception-safe generic trigger.
-- Ineligible rows (unapproved events, inactive mentors/agencies, non-active lead DBs) are removed
-- from KB and never embedded. All SECURITY DEFINER / service_role-only.
-- Reversible: supabase/rollback/20260614091000_kb_phase6_fanout_structured_entities_revert.sql

-- ========================= EVENTS (status='approved' only) =========================
create or replace function public.upsert_kb_event(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.events%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.events where id = p_source_id;
  if not found or coalesce(r.status,'') <> 'approved' then
    delete from public.mes_knowledge_base where source_table='events' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.title,
    nullif(btrim(r.description),''),
    case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then 'Sectors: '||array_to_string(r.sector_tags,', ')
         when nullif(btrim(r.sector),'') is not null then 'Sector: '||r.sector end,
    case when nullif(btrim(r.category),'') is not null then 'Category: '||r.category end,
    case when nullif(btrim(r.type),'') is not null then 'Type: '||r.type end,
    'Location: '||nullif(btrim(concat_ws(', ', nullif(btrim(r.venue),''), nullif(btrim(r.location),''), nullif(btrim(r.city),''), nullif(btrim(r.state_region),''), nullif(btrim(r.country),''))),''),
    case when nullif(btrim(r.organizer),'') is not null then 'Organizer: '||r.organizer end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when nullif(btrim(r.sector),'') is not null then jsonb_build_array(r.sector) else '[]'::jsonb end,
    'country', nullif(btrim(r.country),''), 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/events/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('events',r.id,0,'event',r.title,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= MENTORS (community_members, is_active) =========================
create or replace function public.upsert_kb_mentor(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.community_members%rowtype; v_content text; v_meta jsonb; v_hash text; v_title text;
begin
  select * into r from public.community_members where id = p_source_id;
  if not found or coalesce(r.is_active,true)=false then
    delete from public.mes_knowledge_base where source_table='community_members' and source_id=p_source_id; return;
  end if;
  v_title := case when coalesce(r.is_anonymous,false) then coalesce(nullif(btrim(r.archetype),''),nullif(btrim(r.title),''),'Mentor') else r.name end;
  v_content := btrim(concat_ws(E'\n',
    case when coalesce(r.is_anonymous,false) then null else r.name end,
    nullif(btrim(r.title),''),
    case when nullif(btrim(r.company),'') is not null then 'Company: '||r.company end,
    nullif(btrim(r.description),''),
    nullif(btrim(r.experience),''),
    case when r.specialties is not null and array_length(r.specialties,1)>0 then 'Specialties: '||array_to_string(r.specialties,', ') end,
    case when nullif(btrim(r.origin_country),'') is not null then 'Origin country: '||r.origin_country end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags) else '[]'::jsonb end,
    'country', nullif(btrim(r.origin_country),''), 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/mentors', 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('community_members',r.id,0,'mentor',v_title,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= AGENCIES (trade_investment_agencies, is_active) =========================
create or replace function public.upsert_kb_agency(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.trade_investment_agencies%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.trade_investment_agencies where id = p_source_id;
  if not found or coalesce(r.is_active,true)=false then
    delete from public.mes_knowledge_base where source_table='trade_investment_agencies' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.tagline),''),
    nullif(btrim(r.description),''),
    nullif(btrim(r.description_full),''),
    case when r.services is not null and array_length(r.services,1)>0 then 'Services: '||array_to_string(r.services,', ') end,
    case when r.support_types is not null and array_length(r.support_types,1)>0 then 'Support types: '||array_to_string(r.support_types,', ') end,
    case when r.sectors_supported is not null and array_length(r.sectors_supported,1)>0 then 'Sectors: '||array_to_string(r.sectors_supported,', ') end,
    case when nullif(btrim(r.organisation_type),'') is not null then 'Organisation type: '||r.organisation_type end,
    case when nullif(btrim(r.government_level),'') is not null then 'Government level: '||r.government_level end,
    case when nullif(btrim(coalesce(r.location_country,r.country_iso2)),'') is not null then 'Country: '||coalesce(r.location_country,r.country_iso2) end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when r.sectors_supported is not null and array_length(r.sectors_supported,1)>0 then to_jsonb(r.sectors_supported) else '[]'::jsonb end,
    'country', nullif(btrim(coalesce(r.location_country,r.country_iso2)),''), 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/government-support/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('trade_investment_agencies',r.id,0,'agency',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= ECOSYSTEM (innovation_ecosystem; no active flag) =========================
create or replace function public.upsert_kb_ecosystem(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.innovation_ecosystem%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.innovation_ecosystem where id = p_source_id;
  if not found then
    delete from public.mes_knowledge_base where source_table='innovation_ecosystem' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.description),''),
    nullif(btrim(r.basic_info),''),
    nullif(btrim(r.why_work_with_us),''),
    case when r.services is not null and array_length(r.services,1)>0 then 'Services: '||array_to_string(r.services,', ') end,
    case when r.sectors is not null and array_length(r.sectors,1)>0 then 'Sectors: '||array_to_string(r.sectors,', ') end,
    case when nullif(btrim(r.location),'') is not null then 'Location: '||r.location end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when r.sectors is not null and array_length(r.sectors,1)>0 then to_jsonb(r.sectors) else '[]'::jsonb end,
    'country', null, 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/innovation-ecosystem/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('innovation_ecosystem',r.id,0,'ecosystem',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= INVESTORS (no active flag; visibility=member) =========================
create or replace function public.upsert_kb_investor(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.investors%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.investors where id = p_source_id;
  if not found then
    delete from public.mes_knowledge_base where source_table='investors' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.description),''),
    case when nullif(btrim(r.investor_type),'') is not null then 'Investor type: '||r.investor_type end,
    nullif(btrim(r.basic_info),''),
    nullif(btrim(r.why_work_with_us),''),
    case when r.sector_focus is not null and array_length(r.sector_focus,1)>0 then 'Sector focus: '||array_to_string(r.sector_focus,', ') end,
    case when r.stage_focus is not null and array_length(r.stage_focus,1)>0 then 'Stage focus: '||array_to_string(r.stage_focus,', ') end,
    case when nullif(btrim(r.country),'') is not null then 'Country: '||r.country end,
    case when nullif(btrim(r.fund_size),'') is not null then 'Fund size: '||r.fund_size end,
    case when r.portfolio_companies is not null and array_length(r.portfolio_companies,1)>0 then 'Portfolio: '||array_to_string(r.portfolio_companies,', ') end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when r.sector_focus is not null and array_length(r.sector_focus,1)>0 then to_jsonb(r.sector_focus) else '[]'::jsonb end,
    'country', nullif(btrim(r.country),''), 'visibility','member', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/investors/'||coalesce(r.slug,r.id::text), 'plan_tier','growth');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('investors',r.id,0,'investor',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= COUNTRIES =========================
create or replace function public.upsert_kb_country(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.countries%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.countries where id = p_source_id;
  if not found then
    delete from public.mes_knowledge_base where source_table='countries' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.hero_title),''),
    nullif(btrim(r.hero_description),''),
    nullif(btrim(r.description),''),
    case when r.key_industries is not null and array_length(r.key_industries,1)>0 then 'Key industries: '||array_to_string(r.key_industries,', ') end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.key_industries is not null and array_length(r.key_industries,1)>0 then to_jsonb(r.key_industries) else '[]'::jsonb end,
    'country', r.name, 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/countries/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('countries',r.id,0,'country',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= COUNTRY FAQs (joined to country name/slug) =========================
create or replace function public.upsert_kb_country_faq(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.country_faqs%rowtype; v_content text; v_meta jsonb; v_hash text; v_cname text; v_cslug text;
begin
  select * into r from public.country_faqs where id = p_source_id;
  if not found or nullif(btrim(r.question),'') is null then
    delete from public.mes_knowledge_base where source_table='country_faqs' and source_id=p_source_id; return;
  end if;
  select name, slug into v_cname, v_cslug from public.countries where id = r.country_id;
  v_content := btrim(concat_ws(E'\n',
    case when v_cname is not null then v_cname||' — frequently asked question' end,
    'Q: '||r.question,
    case when nullif(btrim(r.answer),'') is not null then 'A: '||r.answer end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector','[]'::jsonb, 'country', v_cname, 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/countries/'||coalesce(v_cslug,r.country_id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('country_faqs',r.id,0,'country_faq',left(r.question,200),v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= LEAD DATABASES (catalog only, NOT records; status='active'; paid) =========================
create or replace function public.upsert_kb_lead_database(p_source_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.lead_databases%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.lead_databases where id = p_source_id;
  if not found or coalesce(r.status,'') <> 'active' then
    delete from public.mes_knowledge_base where source_table='lead_databases' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.title,
    nullif(btrim(r.short_description),''),
    nullif(btrim(r.description),''),
    case when nullif(btrim(r.list_type),'') is not null then 'List type: '||r.list_type end,
    case when nullif(btrim(r.sector),'') is not null then 'Sector: '||r.sector end,
    case when nullif(btrim(r.location),'') is not null then 'Location: '||r.location end,
    case when nullif(btrim(r.provider_name),'') is not null then 'Provider: '||r.provider_name end,
    case when r.record_count is not null then 'Records: '||r.record_count::text end,
    case when r.sample_fields is not null and array_length(r.sample_fields,1)>0 then 'Sample fields: '||array_to_string(r.sample_fields,', ') end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when nullif(btrim(r.sector),'') is not null then jsonb_build_array(r.sector) else '[]'::jsonb end,
    'country', null, 'visibility','paid', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/leads/'||coalesce(r.slug,r.id::text), 'plan_tier','scale');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('lead_databases',r.id,0,'lead_database',r.title,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;

-- ========================= generic exception-safe trigger (dispatch by table) =========================
create or replace function public.trg_kb_generic()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    delete from public.mes_knowledge_base where source_table = tg_table_name and source_id = old.id;
    return old;
  end if;
  case tg_table_name
    when 'events'                     then perform public.upsert_kb_event(new.id);
    when 'community_members'          then perform public.upsert_kb_mentor(new.id);
    when 'trade_investment_agencies'  then perform public.upsert_kb_agency(new.id);
    when 'innovation_ecosystem'       then perform public.upsert_kb_ecosystem(new.id);
    when 'investors'                  then perform public.upsert_kb_investor(new.id);
    when 'countries'                  then perform public.upsert_kb_country(new.id);
    when 'country_faqs'               then perform public.upsert_kb_country_faq(new.id);
    when 'lead_databases'             then perform public.upsert_kb_lead_database(new.id);
  end case;
  return new;
exception when others then
  raise warning 'kb sync failed for % %: %', tg_table_name, coalesce(new.id, old.id), sqlerrm;
  return coalesce(new, old);
end; $$;

drop trigger if exists kb_sync_event on public.events;
create trigger kb_sync_event after insert or update or delete on public.events for each row execute function public.trg_kb_generic();
drop trigger if exists kb_sync_mentor on public.community_members;
create trigger kb_sync_mentor after insert or update or delete on public.community_members for each row execute function public.trg_kb_generic();
drop trigger if exists kb_sync_agency on public.trade_investment_agencies;
create trigger kb_sync_agency after insert or update or delete on public.trade_investment_agencies for each row execute function public.trg_kb_generic();
drop trigger if exists kb_sync_ecosystem on public.innovation_ecosystem;
create trigger kb_sync_ecosystem after insert or update or delete on public.innovation_ecosystem for each row execute function public.trg_kb_generic();
drop trigger if exists kb_sync_investor on public.investors;
create trigger kb_sync_investor after insert or update or delete on public.investors for each row execute function public.trg_kb_generic();
drop trigger if exists kb_sync_country on public.countries;
create trigger kb_sync_country after insert or update or delete on public.countries for each row execute function public.trg_kb_generic();
drop trigger if exists kb_sync_country_faq on public.country_faqs;
create trigger kb_sync_country_faq after insert or update or delete on public.country_faqs for each row execute function public.trg_kb_generic();
drop trigger if exists kb_sync_lead_database on public.lead_databases;
create trigger kb_sync_lead_database after insert or update or delete on public.lead_databases for each row execute function public.trg_kb_generic();

-- ========================= extend backfill dispatcher =========================
create or replace function public.kb_sync_all(p_entity text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer := 0; v_src text;
begin
  case p_entity
    when 'service_provider' then v_src:='service_providers'; perform public.upsert_kb_service_provider(id) from public.service_providers;
    when 'event'            then v_src:='events';                    perform public.upsert_kb_event(id) from public.events;
    when 'mentor'           then v_src:='community_members';         perform public.upsert_kb_mentor(id) from public.community_members;
    when 'agency'           then v_src:='trade_investment_agencies'; perform public.upsert_kb_agency(id) from public.trade_investment_agencies;
    when 'ecosystem'        then v_src:='innovation_ecosystem';      perform public.upsert_kb_ecosystem(id) from public.innovation_ecosystem;
    when 'investor'         then v_src:='investors';                 perform public.upsert_kb_investor(id) from public.investors;
    when 'country'          then v_src:='countries';                 perform public.upsert_kb_country(id) from public.countries;
    when 'country_faq'      then v_src:='country_faqs';              perform public.upsert_kb_country_faq(id) from public.country_faqs;
    when 'lead_database'    then v_src:='lead_databases';            perform public.upsert_kb_lead_database(id) from public.lead_databases;
    else raise exception 'kb_sync_all: unknown entity %', p_entity;
  end case;
  execute format('delete from public.mes_knowledge_base k where k.source_table=%L and not exists (select 1 from public.%I s where s.id=k.source_id)', v_src, v_src);
  select count(*) into v_count from public.mes_knowledge_base where source_table = v_src;
  return v_count;
end; $$;

revoke all on function public.upsert_kb_event(uuid)          from public, anon, authenticated;
revoke all on function public.upsert_kb_mentor(uuid)         from public, anon, authenticated;
revoke all on function public.upsert_kb_agency(uuid)         from public, anon, authenticated;
revoke all on function public.upsert_kb_ecosystem(uuid)      from public, anon, authenticated;
revoke all on function public.upsert_kb_investor(uuid)       from public, anon, authenticated;
revoke all on function public.upsert_kb_country(uuid)        from public, anon, authenticated;
revoke all on function public.upsert_kb_country_faq(uuid)    from public, anon, authenticated;
revoke all on function public.upsert_kb_lead_database(uuid)  from public, anon, authenticated;
revoke all on function public.trg_kb_generic()               from public, anon, authenticated;
grant execute on function public.upsert_kb_event(uuid)         to service_role;
grant execute on function public.upsert_kb_mentor(uuid)        to service_role;
grant execute on function public.upsert_kb_agency(uuid)        to service_role;
grant execute on function public.upsert_kb_ecosystem(uuid)     to service_role;
grant execute on function public.upsert_kb_investor(uuid)      to service_role;
grant execute on function public.upsert_kb_country(uuid)       to service_role;
grant execute on function public.upsert_kb_country_faq(uuid)   to service_role;
grant execute on function public.upsert_kb_lead_database(uuid) to service_role;
