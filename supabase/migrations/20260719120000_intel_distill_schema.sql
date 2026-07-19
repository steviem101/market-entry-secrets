-- Intelligence layer (Sub-ticket 2B) — distillation schema.
--
-- Adds the storage + state layer for the distill-knowledge loop, which turns embedded
-- knowledge_chunk rows into atomic insight cards (entity_type='knowledge_insight' in
-- mes_knowledge_base — the same retrieval surface Sub-ticket 3 reads). Mirrors the
-- Sub-ticket 1B chunk-upsert pattern (SECURITY DEFINER, service-role only, md5 hash,
-- kb_external_source_id namespacing, embedding left null for the embed-knowledge cron)
-- and the Irish Insights ii_prefilter_log pattern (a keep/skip log so nothing is
-- silently dropped). All additive + reversible. Distillation is gated OFF by default
-- (DISTILL_KNOWLEDGE_ENABLED env flag, read in the edge function); no cron is scheduled
-- here — it is added at enable time, after the pilot review.
--
-- Rollback: supabase/rollback/20260719120000_intel_distill_schema_revert.sql

-- 1. Insight-card upsert (mirror of upsert_kb_knowledge_chunks). insight_ref is a stable
--    per-insight key (e.g. "<chunk_kb_id>:<n>") so re-distillation upserts, not duplicates.
create or replace function public.upsert_kb_knowledge_insights(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_count integer;
begin
  insert into public.mes_knowledge_base as kb (
    source_table, source_id, source_project, chunk_index, entity_type,
    title, content, metadata, content_hash,
    embedding, embedded_hash, embedding_model, updated_at
  )
  select
    'knowledge_insight',
    public.kb_external_source_id('content_creator', r.insight_ref),
    'content_creator',
    0,
    'knowledge_insight',
    r.title,
    r.claim,
    coalesce(r.metadata, '{}'::jsonb) || jsonb_build_object(
      'visibility', 'internal', 'is_active', true,
      'source_ref', r.insight_ref, 'source_project', 'content_creator'),
    md5(r.claim),
    null,                              -- embedding always null; embed-knowledge fills it
    null,
    'text-embedding-3-small',
    now()
  from jsonb_to_recordset(p_rows) as r(
    insight_ref text, claim text, title text, metadata jsonb
  )
  where r.claim is not null and length(btrim(r.claim)) > 0
  on conflict (source_table, source_id, chunk_index) do update set
    title           = coalesce(nullif(excluded.title, ''), kb.title),
    content         = coalesce(nullif(excluded.content, ''), kb.content),
    content_hash    = case when nullif(excluded.content, '') is not null then excluded.content_hash else kb.content_hash end,
    metadata        = kb.metadata || excluded.metadata,
    -- claim text changed => drop the embedding so embed-knowledge re-embeds it; else keep.
    embedding       = case when excluded.content_hash is distinct from kb.content_hash then null else kb.embedding end,
    embedded_hash   = case when excluded.content_hash is distinct from kb.content_hash then null else kb.embedded_hash end,
    source_project  = excluded.source_project,
    updated_at      = now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

revoke all on function public.upsert_kb_knowledge_insights(jsonb) from public, anon, authenticated;
grant execute on function public.upsert_kb_knowledge_insights(jsonb) to service_role;

comment on function public.upsert_kb_knowledge_insights(jsonb) is
  'Set-based upsert of distilled insight cards into mes_knowledge_base as '
  'entity_type=knowledge_insight, visibility=internal. Embedding left null for embed-knowledge. '
  'Service-role only. Written by the distill-knowledge edge function (Sub-ticket 2).';

-- 2. Keep/skip state log (mirror of ii_prefilter_log). One row per (chunk, distiller_version):
--    a version bump re-distills; same-version is idempotent. skip_reason is a closed enum so
--    nothing is dropped without a recorded reason.
create table if not exists public.knowledge_distill_log (
  id                uuid primary key default gen_random_uuid(),
  chunk_kb_id       uuid not null,                 -- source knowledge_chunk mes_knowledge_base.id
  distiller_version text not null,
  distilled         boolean not null default false,
  skip_reason       text,                          -- null when distilled = true
  insight_count     integer not null default 0,
  insight_refs      text[] not null default '{}',
  run_id            uuid,
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  constraint knowledge_distill_log_skip_reason_chk
    check (skip_reason is null or skip_reason in ('too_thin','duplicate','off_topic','no_durable_claim','error')),
  constraint knowledge_distill_log_uniq unique (chunk_kb_id, distiller_version)
);

alter table public.knowledge_distill_log enable row level security;
-- No policies => deny-all for anon/authenticated; service_role bypasses RLS (SEC-01).
revoke all on table public.knowledge_distill_log from anon, authenticated;

comment on table public.knowledge_distill_log is
  'Distillation keep/skip state, one row per (knowledge_chunk, distiller_version). '
  'Service-role only. Skip reasons are logged (never silent). Written by distill-knowledge.';

-- 3. Queue selector: embedded knowledge_chunk rows with no distill-log row for this version.
create or replace function public.kb_undistilled_chunks(p_distiller_version text, p_limit integer default 50)
returns table (id uuid, content text, metadata jsonb, source_id uuid, chunk_index integer)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select k.id, k.content, k.metadata, k.source_id, k.chunk_index
  from public.mes_knowledge_base k
  where k.entity_type = 'knowledge_chunk'
    and k.embedding is not null
    and coalesce((k.metadata->>'is_active')::boolean, true) is not false
    and not exists (
      -- A prior SUCCESS/skip excludes the chunk; a transient 'error' row does NOT, so
      -- rate-limited / timed-out chunks are retried on the next run (the log upserts).
      select 1 from public.knowledge_distill_log d
      where d.chunk_kb_id = k.id and d.distiller_version = p_distiller_version
        and d.skip_reason is distinct from 'error'
    )
  order by k.updated_at asc
  limit greatest(p_limit, 1);
$function$;

revoke all on function public.kb_undistilled_chunks(text, integer) from public, anon, authenticated;
grant execute on function public.kb_undistilled_chunks(text, integer) to service_role;

-- 4. Set-based writer for the state log.
create or replace function public.log_knowledge_distill(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_count integer;
begin
  insert into public.knowledge_distill_log as d (
    chunk_kb_id, distiller_version, distilled, skip_reason, insight_count, insight_refs, run_id, metadata
  )
  select
    (r.chunk_kb_id)::uuid, r.distiller_version, coalesce(r.distilled, false), r.skip_reason,
    coalesce(r.insight_count, 0), coalesce(r.insight_refs, '{}'::text[]),
    nullif(r.run_id, '')::uuid, coalesce(r.metadata, '{}'::jsonb)
  from jsonb_to_recordset(p_rows) as r(
    chunk_kb_id text, distiller_version text, distilled boolean, skip_reason text,
    insight_count integer, insight_refs text[], run_id text, metadata jsonb
  )
  where r.chunk_kb_id is not null and r.distiller_version is not null
  on conflict (chunk_kb_id, distiller_version) do update set
    distilled     = excluded.distilled,
    skip_reason   = excluded.skip_reason,
    insight_count = excluded.insight_count,
    insight_refs  = excluded.insight_refs,
    run_id        = excluded.run_id,
    metadata      = excluded.metadata,
    created_at    = now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

revoke all on function public.log_knowledge_distill(jsonb) from public, anon, authenticated;
grant execute on function public.log_knowledge_distill(jsonb) to service_role;

-- 5. Prune stale insight cards for re-distilled chunks. insight_ref is '<chunk_kb_id>:<n>';
--    when a re-distill (version bump / force run) yields fewer or reordered cards for a
--    chunk, delete that chunk's knowledge_insight rows whose source_ref is no longer in the
--    produced keep_refs — preventing orphaned/duplicate "canonical" insights. Called by the
--    distiller after upsert, once per processed chunk (keep_refs=[] when it produced none).
create or replace function public.prune_chunk_insights(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_total integer := 0;
  v_del   integer;
  r       record;
begin
  for r in
    select x.chunk_kb_id as chunk_kb_id, coalesce(x.keep_refs, '{}'::text[]) as keep_refs
    from jsonb_to_recordset(p_rows) as x(chunk_kb_id text, keep_refs text[])
    where x.chunk_kb_id is not null
  loop
    delete from public.mes_knowledge_base kb
    where kb.entity_type = 'knowledge_insight'
      and kb.metadata->>'source_ref' like (r.chunk_kb_id || ':%')
      and not ((kb.metadata->>'source_ref') = any(r.keep_refs));
    get diagnostics v_del = row_count;
    v_total := v_total + v_del;
  end loop;
  return v_total;
end;
$function$;

revoke all on function public.prune_chunk_insights(jsonb) from public, anon, authenticated;
grant execute on function public.prune_chunk_insights(jsonb) to service_role;
