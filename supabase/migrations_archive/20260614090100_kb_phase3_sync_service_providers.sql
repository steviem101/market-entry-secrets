-- Phase 3: sync layer for the service_providers pilot.
-- upsert fn (PII-stripped content + metadata) + exception-safe trigger + kb_sync_all dispatcher.
-- All SECURITY DEFINER with fixed search_path; EXECUTE revoked from clients (service_role only).
-- Reversible: supabase/rollback/20260614090100_kb_phase3_sync_service_providers_revert.sql

create or replace function public.upsert_kb_service_provider(p_source_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.service_providers%rowtype;
  v_content text;
  v_meta    jsonb;
  v_hash    text;
begin
  select * into r from public.service_providers where id = p_source_id;
  if not found then
    -- source gone => remove derived rows
    delete from public.mes_knowledge_base
      where source_table = 'service_providers' and source_id = p_source_id;
    return;
  end if;

  -- PII-stripped embeddable content. Deliberately excludes contact, contact_persons,
  -- experience_tiles (may contain client/personal names) and raw website URL.
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.description), ''),
    nullif(btrim(r.basic_info), ''),
    nullif(btrim(r.why_work_with_us), ''),
    case when r.services is not null and array_length(r.services, 1) > 0
         then 'Services: ' || array_to_string(r.services, ', ') end,
    case when r.sector_tags is not null and array_length(r.sector_tags, 1) > 0
         then 'Sectors: ' || array_to_string(r.sector_tags, ', ') end,
    case when nullif(btrim(r.location), '') is not null
         then 'Location: ' || r.location end
  ));
  v_hash := md5(v_content);

  -- service_providers has no is_active/status column => always active, public.
  v_meta := jsonb_build_object(
    'sector',     coalesce(to_jsonb(r.sector_tags), '[]'::jsonb),
    'country',    null,
    'visibility', 'public',
    'is_active',  true,
    'source_url', 'https://market-entry-secrets.lovable.app/service-providers/' || coalesce(r.slug, r.id::text),
    'plan_tier',  'free'
  );

  insert into public.mes_knowledge_base
    (source_table, source_id, chunk_index, entity_type, title, content, metadata, content_hash)
  values
    ('service_providers', r.id, 0, 'service_provider', r.name, v_content, v_meta, v_hash)
  on conflict (source_table, source_id, chunk_index) do update
    set content      = excluded.content,
        content_hash = excluded.content_hash,
        metadata     = excluded.metadata,
        title        = excluded.title,
        entity_type  = excluded.entity_type,
        updated_at   = now()
    -- skip no-op writes so embedding/embedded_hash and updated_at don't churn
    where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
       or public.mes_knowledge_base.metadata     is distinct from excluded.metadata
       or public.mes_knowledge_base.title        is distinct from excluded.title;
end;
$$;

create or replace function public.trg_kb_service_provider()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.mes_knowledge_base
      where source_table = 'service_providers' and source_id = old.id;
    return old;
  else
    perform public.upsert_kb_service_provider(new.id);
    return new;
  end if;
exception when others then
  -- KB sync must NEVER block a write to the source table.
  raise warning 'kb sync failed for service_providers %: %', coalesce(new.id, old.id), sqlerrm;
  return coalesce(new, old);
end;
$$;

drop trigger if exists kb_sync_service_provider on public.service_providers;
create trigger kb_sync_service_provider
  after insert or update or delete on public.service_providers
  for each row execute function public.trg_kb_service_provider();

-- Idempotent backfill dispatcher (initial population + post-taxonomy rebuilds).
create or replace function public.kb_sync_all(p_entity text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer := 0;
begin
  case p_entity
    when 'service_provider' then
      perform public.upsert_kb_service_provider(id) from public.service_providers;
      delete from public.mes_knowledge_base k
        where k.source_table = 'service_providers'
          and not exists (select 1 from public.service_providers s where s.id = k.source_id);
      select count(*) into v_count
        from public.mes_knowledge_base where source_table = 'service_providers';
    else
      raise exception 'kb_sync_all: unknown entity %', p_entity;
  end case;
  return v_count;
end;
$$;

-- Lock down: these are internal write helpers, never client-callable.
revoke all on function public.upsert_kb_service_provider(uuid) from public, anon, authenticated;
revoke all on function public.trg_kb_service_provider() from public, anon, authenticated;
revoke all on function public.kb_sync_all(text) from public, anon, authenticated;
grant execute on function public.upsert_kb_service_provider(uuid) to service_role;
grant execute on function public.kb_sync_all(text) to service_role;
