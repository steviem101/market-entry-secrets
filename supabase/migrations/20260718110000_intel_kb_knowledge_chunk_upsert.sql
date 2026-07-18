-- Intelligence layer (Sub-ticket 1B) — set-based upsert for Content Studio
-- knowledge chunks (document/YouTube/Reddit) + research_cache into mes_knowledge_base.
--
-- Mirrors upsert_kb_linkedin_posts (set-based, SECURITY DEFINER, service-role only,
-- md5 content_hash, kb_external_source_id namespacing, embedding copied when present
-- else left null so the embed-knowledge cron fills it). New rows land as
-- entity_type='knowledge_chunk', visibility='internal', source_project='content_creator'.
-- The existing kb_strip_pii BEFORE-trigger on mes_knowledge_base scrubs content on
-- write, so no PII handling is duplicated here.
--
-- Uniqueness: (source_table='knowledge_chunk', source_id, chunk_index). source_id is
-- derived from the chunk's OWN uuid via kb_external_source_id (collision-proof), and
-- chunk_index is preserved from the source row for ordering/provenance.
--
-- Grants: service_role only (kb-sync calls with the service role). anon/authenticated
-- get nothing (SEC-01), consistent with upsert_kb_linkedin_posts.
--
-- Rollback: supabase/rollback/20260718110000_..._revert.sql. Applies via PR/merge only.

create or replace function public.upsert_kb_knowledge_chunks(p_rows jsonb)
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
    'knowledge_chunk',
    public.kb_external_source_id('content_creator', r.source_ref),
    'content_creator',
    coalesce(r.chunk_index, 0),
    'knowledge_chunk',
    r.title,
    r.content,
    coalesce(r.metadata, '{}'::jsonb) || jsonb_build_object(
      'visibility', 'internal', 'is_active', true,
      'source_ref', r.source_ref, 'source_project', 'content_creator'),
    md5(r.content),
    case when nullif(r.embedding, '') is null then null else r.embedding::vector end,
    case when nullif(r.embedding, '') is null then null else md5(r.content) end,
    coalesce(nullif(r.embedding_model, ''), 'text-embedding-3-small'),
    now()
  from jsonb_to_recordset(p_rows) as r(
    source_ref text, content text, title text,
    embedding text, metadata jsonb, embedding_model text, chunk_index integer
  )
  where r.content is not null and length(btrim(r.content)) > 0
  on conflict (source_table, source_id, chunk_index) do update set
    title           = coalesce(nullif(excluded.title, ''), kb.title),
    content         = coalesce(nullif(excluded.content, ''), kb.content),
    content_hash    = case when nullif(excluded.content, '') is not null then excluded.content_hash else kb.content_hash end,
    metadata        = kb.metadata || excluded.metadata,
    embedding       = case when excluded.content_hash is distinct from kb.content_hash and excluded.embedding is not null then excluded.embedding else kb.embedding end,
    embedded_hash   = case when excluded.content_hash is distinct from kb.content_hash and excluded.embedding is not null then excluded.content_hash else kb.embedded_hash end,
    embedding_model = coalesce(excluded.embedding_model, kb.embedding_model),
    source_project  = excluded.source_project,
    updated_at      = now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

revoke all on function public.upsert_kb_knowledge_chunks(jsonb) from public, anon, authenticated;
grant execute on function public.upsert_kb_knowledge_chunks(jsonb) to service_role;

comment on function public.upsert_kb_knowledge_chunks(jsonb) is
  'Set-based upsert of Content Studio knowledge chunks (documents/YouTube/Reddit) and '
  'research_cache into mes_knowledge_base as entity_type=knowledge_chunk, visibility=internal, '
  'source_project=content_creator. Embedding copied when present, else left null for the '
  'embed-knowledge cron. Service-role only. Written by the kb-sync edge function (Sub-ticket 1B).';

-- Watermark rows for the new incremental sources (kb-sync upserts these; seed so the
-- first incremental run starts from epoch and the row exists for status reads).
insert into public.kb_sync_state (source, last_synced_at, last_run_at, last_rows_synced)
values
  ('content_creator_document_chunk', '1970-01-01T00:00:00Z', null, 0),
  ('content_creator_research_cache', '1970-01-01T00:00:00Z', null, 0)
on conflict (source) do nothing;
