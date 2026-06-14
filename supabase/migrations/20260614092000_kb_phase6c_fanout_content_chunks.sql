-- Phase 6c fan-out (batch 2): long-form content_items chunked by section.
-- chunk_index 0 = summary (title+subtitle+tldr+meta_description); chunk_index >=1 = one row per
-- content_bodies row (section-bounded; bodies already avg ~270 / max ~1230 tokens, so no further
-- sub-splitting needed). entity_type = content_type (case_study | guide | best_practice | ...).
-- These are public website articles, so visibility=public for summary AND body (reconciles the
-- prompt's "full body paid" guess: the bodies are served publicly on /content + /case-studies).
-- Re-syncs on content_items, content_bodies and content_sections changes.
-- Reversible: supabase/rollback/20260614092000_kb_phase6c_fanout_content_chunks_revert.sql

create or replace function public.upsert_kb_content_item(p_content_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  ci public.content_items%rowtype;
  v_etype text; v_summary text; v_meta jsonb; rec record; v_body text;
  v_idx int := 0; v_maxidx int := 0; v_src_url text;
begin
  select * into ci from public.content_items where id = p_content_id;
  if not found or coalesce(ci.status,'') <> 'published' then
    delete from public.mes_knowledge_base where source_table='content_items' and source_id=p_content_id; return;
  end if;

  v_etype := ci.content_type;
  v_src_url := 'https://market-entry-secrets.lovable.app/'
             || case when ci.content_type='case_study' then 'case-studies/' else 'content/' end
             || coalesce(ci.slug, ci.id::text);
  v_meta := jsonb_build_object(
    'sector', case when ci.sector_tags is not null and array_length(ci.sector_tags,1)>0 then to_jsonb(ci.sector_tags) else '[]'::jsonb end,
    'country', null, 'visibility','public', 'is_active',true, 'source_url', v_src_url, 'plan_tier','free');

  -- chunk 0: summary
  v_summary := btrim(concat_ws(E'\n',
    ci.title,
    nullif(btrim(ci.subtitle),''),
    case when ci.tldr is not null and array_length(ci.tldr,1)>0 then array_to_string(ci.tldr, E'\n') end,
    nullif(btrim(ci.meta_description),'')));
  if nullif(v_summary,'') is null then v_summary := ci.title; end if;
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('content_items', ci.id, 0, v_etype, ci.title, v_summary, v_meta, md5(v_summary))
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;

  -- body chunks: one per content_body row in active sections, stable ordering
  for rec in
    select cs.title as section_title,
           coalesce(nullif(btrim(cb.body_text),''), nullif(btrim(cb.body_markdown),''), cb.question) as body,
           row_number() over (order by coalesce(cs.sort_order, 2147483647), cb.sort_order, cb.id) as idx
    from public.content_bodies cb
    left join public.content_sections cs on cs.id = cb.section_id
    where cb.content_id = p_content_id
      and coalesce(cs.is_active, true) = true
      and coalesce(nullif(btrim(cb.body_text),''), nullif(btrim(cb.body_markdown),''), cb.question) is not null
  loop
    v_idx := rec.idx;
    v_body := btrim(concat_ws(E'\n', ci.title, nullif(btrim(rec.section_title),''), rec.body));
    insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
    values('content_items', ci.id, v_idx, v_etype, coalesce(nullif(btrim(rec.section_title),''), ci.title), v_body, v_meta, md5(v_body))
    on conflict (source_table,source_id,chunk_index) do update set
      content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
    where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
       or public.mes_knowledge_base.metadata is distinct from excluded.metadata
       or public.mes_knowledge_base.title is distinct from excluded.title;
    if v_idx > v_maxidx then v_maxidx := v_idx; end if;
  end loop;

  -- drop trailing chunks left over from removed/shrunk sections
  delete from public.mes_knowledge_base
   where source_table='content_items' and source_id=p_content_id and chunk_index > v_maxidx and chunk_index > 0;
end; $$;

create or replace function public.trg_kb_content()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_cid uuid;
begin
  if tg_table_name = 'content_items' then
    if tg_op = 'DELETE' then
      delete from public.mes_knowledge_base where source_table='content_items' and source_id=old.id;
      return old;
    end if;
    perform public.upsert_kb_content_item(new.id);
    return new;
  else
    v_cid := coalesce(new.content_id, old.content_id);
    if v_cid is not null then perform public.upsert_kb_content_item(v_cid); end if;
    return coalesce(new, old);
  end if;
exception when others then
  raise warning 'kb content sync failed for % %: %', tg_table_name, coalesce(new.id, old.id), sqlerrm;
  return coalesce(new, old);
end; $$;

drop trigger if exists kb_sync_content_item on public.content_items;
create trigger kb_sync_content_item after insert or update or delete on public.content_items for each row execute function public.trg_kb_content();
drop trigger if exists kb_sync_content_body on public.content_bodies;
create trigger kb_sync_content_body after insert or update or delete on public.content_bodies for each row execute function public.trg_kb_content();
drop trigger if exists kb_sync_content_section on public.content_sections;
create trigger kb_sync_content_section after insert or update or delete on public.content_sections for each row execute function public.trg_kb_content();

-- extend backfill dispatcher with content_item (full redefine, all 10 entities)
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
    when 'content_item'     then v_src:='content_items';             perform public.upsert_kb_content_item(id) from public.content_items;
    else raise exception 'kb_sync_all: unknown entity %', p_entity;
  end case;
  execute format('delete from public.mes_knowledge_base k where k.source_table=%L and not exists (select 1 from public.%I s where s.id=k.source_id)', v_src, v_src);
  select count(*) into v_count from public.mes_knowledge_base where source_table = v_src;
  return v_count;
end; $$;

revoke all on function public.upsert_kb_content_item(uuid) from public, anon, authenticated;
revoke all on function public.trg_kb_content()             from public, anon, authenticated;
grant execute on function public.upsert_kb_content_item(uuid) to service_role;
