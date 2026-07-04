-- Set-based bulk variant of upsert_kb_linkedin_post for the kb-sync backfill:
-- one RPC per batch instead of one per row (the per-row loop hit the edge
-- function's 150s compute limit). Same contract: internal visibility, copied
-- embedding (embedded_hash=content_hash), COALESCE-protected. service_role only.
--
-- NOTE: the kb_scrub_pii BEFORE-INSERT/UPDATE trigger rewrites content_hash from
-- the PII-scrubbed content, so posts containing PII land "stale" and the
-- embed-knowledge cron correctly re-embeds them over the scrubbed text. PII-free
-- posts keep their copied embedding (zero re-embed cost).
create or replace function public.upsert_kb_linkedin_posts(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $fn$
declare
  v_count integer;
begin
  insert into public.mes_knowledge_base as kb (
    source_table, source_id, source_project, chunk_index, entity_type,
    title, content, metadata, content_hash,
    embedding, embedded_hash, embedding_model, updated_at
  )
  select
    'linkedin_post',
    public.kb_external_source_id('content_creator', r.source_ref),
    'content_creator',
    0,
    'linkedin_post',
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
    embedding text, metadata jsonb, embedding_model text
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
$fn$;

revoke all on function public.upsert_kb_linkedin_posts(jsonb) from anon;
revoke all on function public.upsert_kb_linkedin_posts(jsonb) from authenticated;
revoke all on function public.upsert_kb_linkedin_posts(jsonb) from public;
grant execute on function public.upsert_kb_linkedin_posts(jsonb) to service_role;
