-- ============================================================================
-- KB Phase 3 (master-spec): extend mes_knowledge_base for the cross-project
-- LinkedIn source (Content Creator -> MES). Additive + reversible.
-- Scope: xhziwveaiuhzdoutpgrh (MES Platform) ONLY.
-- ============================================================================
-- DRAFTED at Hard Stop 1 per user direction; review before `supabase db push`.
-- This migration deliberately does NOT touch source_id (stays uuid), the
-- (source_table, source_id, chunk_index) unique key, match_knowledge, or any
-- existing upsert_kb_* function — so live retrieval is unchanged.
--
-- Why this shape:
--   * Existing KB key is (source_table, source_id uuid, chunk_index). Content
--     Creator post ids are a different id space, so we map them to a stable
--     surrogate uuid via md5(source_project || ':' || source_ref)::uuid and keep
--     the raw ref in metadata.source_ref. No extension dependency.
--   * source_project disambiguates provenance ('mes_platform' vs 'content_creator').
--   * LinkedIn posts are scraped third-party content: visibility forced to
--     'internal' so default (anon/public) search never returns them. The report
--     generator (Phase 5) widens allowed_visibility to use them as SYNTHESIS
--     SIGNAL ONLY (never reproduced verbatim / never attributed).
--   * Embeddings are COPIED from Content Creator (same text-embedding-3-small,
--     1536 dims): we set embedded_hash = content_hash so the embed-knowledge
--     cron treats them as already-embedded and never re-embeds (zero cost).
-- ============================================================================

begin;

-- 1) Provenance column. NOT NULL DEFAULT backfills the existing ~2,844 rows to
--    'mes_platform' instantly (constant default, no table rewrite in PG17).
alter table public.mes_knowledge_base
  add column if not exists source_project text not null default 'mes_platform';

-- 2) Cheap partial index for filtering/auditing the cross-project rows.
create index if not exists mes_kb_source_project_idx
  on public.mes_knowledge_base (source_project)
  where source_project <> 'mes_platform';

-- 3) Deterministic surrogate id for external refs (idempotent upserts).
create or replace function public.kb_external_source_id(
  p_source_project text,
  p_source_ref     text
) returns uuid
  language sql
  immutable
  set search_path to 'public'
as $$
  select md5(coalesce(p_source_project,'') || ':' || coalesce(p_source_ref,''))::uuid;
$$;

-- 4) Write path for the Phase 4 kb-sync. Takes the post data as ARGUMENTS
--    (the source row lives in another project, so there is no local table to
--    read from). COALESCE-protected; embedding copied, not regenerated.
create or replace function public.upsert_kb_linkedin_post(
  p_source_ref      text,
  p_content         text,
  p_embedding       vector default null,
  p_title           text   default null,
  p_metadata        jsonb  default '{}'::jsonb,
  p_embedding_model text   default 'text-embedding-3-small'
) returns uuid
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  c_source_project constant text := 'content_creator';
  c_source_table   constant text := 'linkedin_post';
  v_source_id      uuid;
  v_content_hash   text;
  v_meta           jsonb;
  v_id             uuid;
begin
  if p_content is null or length(btrim(p_content)) = 0 then
    raise exception 'upsert_kb_linkedin_post: empty content for source_ref %', p_source_ref;
  end if;

  v_source_id    := public.kb_external_source_id(c_source_project, p_source_ref);
  v_content_hash := md5(p_content);

  -- Enforce the provenance + visibility contract regardless of caller input.
  v_meta := coalesce(p_metadata, '{}'::jsonb)
            || jsonb_build_object(
                 'visibility',     'internal',  -- never surfaced to anon/public
                 'is_active',      true,
                 'source_ref',     p_source_ref,
                 'source_project', c_source_project
               );

  insert into public.mes_knowledge_base as kb (
    source_table, source_id, source_project, chunk_index, entity_type,
    title, content, metadata, content_hash,
    embedding, embedded_hash, embedding_model, updated_at
  ) values (
    c_source_table, v_source_id, c_source_project, 0, 'linkedin_post',
    p_title, p_content, v_meta, v_content_hash,
    p_embedding,
    case when p_embedding is not null then v_content_hash else null end,  -- copied => already embedded
    p_embedding_model, now()
  )
  on conflict (source_table, source_id, chunk_index) do update set
    -- Never overwrite curated text with an empty incoming value (hard rule #6).
    title         = coalesce(nullif(excluded.title, ''), kb.title),
    content       = coalesce(nullif(excluded.content, ''), kb.content),
    content_hash  = case when nullif(excluded.content, '') is not null
                         then excluded.content_hash else kb.content_hash end,
    -- Merge metadata so engagement/quality refresh on each sync; enforced keys win.
    metadata      = kb.metadata || excluded.metadata,
    -- Refresh the copied embedding ONLY when the underlying content changed.
    embedding     = case when excluded.content_hash is distinct from kb.content_hash
                          and excluded.embedding is not null
                         then excluded.embedding else kb.embedding end,
    embedded_hash = case when excluded.content_hash is distinct from kb.content_hash
                          and excluded.embedding is not null
                         then excluded.content_hash else kb.embedded_hash end,
    embedding_model = coalesce(excluded.embedding_model, kb.embedding_model),
    source_project  = excluded.source_project,
    updated_at      = now()
  returning kb.id into v_id;

  return v_id;
end;
$$;

comment on function public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text)
  is 'Phase 4 kb-sync write path: upserts a Content Creator LinkedIn post into mes_knowledge_base as an internal, synthesis-only source. Embedding is copied (embedded_hash=content_hash) so embed-knowledge never re-embeds it.';

-- 5) Lock down the SECURITY DEFINER write path: it bypasses RLS, so it must NOT
--    be callable by anon/authenticated. service_role only (the kb-sync caller).
revoke all on function public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text) from public;
grant execute on function public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text) to service_role;

commit;
