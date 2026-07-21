-- Intelligence layer (Sub-ticket 2) — supersede / dedup RPCs.
--
-- The distiller (distill-v2) writes one insight card per atomic claim, but the source
-- corpus spans overlapping vintage guides (2016/2020/2021), so several cards can restate
-- the same fact. This layer lets the supersede-insights edge function cluster near-duplicate
-- cards by embedding cosine similarity and mark ONE canonical card per cluster, so retrieval
-- (Sub-ticket 3) returns one strong card instead of three stale echoes.
--
-- No schema change: the distiller already seeds metadata.cluster_id (null) and
-- metadata.is_canonical (true) on every card. These RPCs only POPULATE those two fields.
-- All additive + reversible. SECURITY DEFINER, service-role only (mirrors the distill RPCs).
--
-- Rollback: supabase/rollback/20260721160000_intel_supersede_rpcs_revert.sql

-- 1. Candidate near-duplicate edges. For each embedded knowledge_insight of the given
--    version, return its k nearest neighbours whose cosine similarity clears the threshold,
--    restricted to the SAME topic_lane (a regulatory card never merges with a funding card).
--    Uses the hnsw cosine index (mes_kb_embedding_idx) via the ORDER BY ... LIMIT lateral.
--    Symmetric pairs are collapsed with least()/greatest()+distinct; direction is irrelevant
--    to the edge function's union-find.
create or replace function public.kb_insight_neighbors(
  p_distiller_version text,
  p_threshold double precision default 0.92,
  p_k integer default 8
)
returns table (id_a uuid, id_b uuid, sim real)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select distinct
    least(a.id, n.id)                          as id_a,
    greatest(a.id, n.id)                       as id_b,
    (1 - (a.embedding <=> n.embedding))::real  as sim
  from public.mes_knowledge_base a
  cross join lateral (
    select b.id, b.embedding
    from public.mes_knowledge_base b
    where b.entity_type = 'knowledge_insight'
      and b.embedding is not null
      and b.metadata->>'distiller_version' = p_distiller_version
      and b.metadata->>'topic_lane' is not distinct from a.metadata->>'topic_lane'
      and b.id <> a.id
    order by b.embedding <=> a.embedding
    limit greatest(p_k, 1)
  ) n
  where a.entity_type = 'knowledge_insight'
    and a.embedding is not null
    and a.metadata->>'distiller_version' = p_distiller_version
    and (1 - (a.embedding <=> n.embedding)) >= p_threshold;
$function$;

revoke all on function public.kb_insight_neighbors(text, double precision, integer) from public, anon, authenticated;
grant execute on function public.kb_insight_neighbors(text, double precision, integer) to service_role;

comment on function public.kb_insight_neighbors(text, double precision, integer) is
  'Near-duplicate insight-card edges (same topic_lane, cosine sim >= threshold) for the '
  'supersede-insights clustering pass. Read-only, service-role only (Sub-ticket 2).';

-- 2. Per-card inputs for canonical selection + current cluster state, for EVERY card of the
--    version (not just clustered ones) so the edge function can also reset a card that has
--    dropped out of a cluster. No embeddings are returned (kept small).
create or replace function public.kb_insight_cluster_fields(p_distiller_version text)
returns table (id uuid, publication_date text, claim_len integer, cluster_id text, is_canonical boolean)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    k.id,
    k.metadata->>'publication_date',
    char_length(coalesce(k.content, '')),
    k.metadata->>'cluster_id',
    coalesce((k.metadata->>'is_canonical')::boolean, true)
  from public.mes_knowledge_base k
  where k.entity_type = 'knowledge_insight'
    and k.metadata->>'distiller_version' = p_distiller_version;
$function$;

revoke all on function public.kb_insight_cluster_fields(text) from public, anon, authenticated;
grant execute on function public.kb_insight_cluster_fields(text) to service_role;

comment on function public.kb_insight_cluster_fields(text) is
  'Per-insight canonical-selection inputs (publication_date, claim length) + current '
  'cluster_id/is_canonical, for the supersede-insights pass. Read-only, service-role only.';

-- 3. Apply cluster assignments. Merges cluster_id + is_canonical into each card's metadata.
--    Touches ONLY metadata (not content/content_hash/embedding), so it never invalidates an
--    embedding or fires the content-scoped kb_scrub_pii trigger — no re-embed churn.
create or replace function public.kb_apply_insight_clusters(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_count integer;
begin
  update public.mes_knowledge_base kb
  set metadata = kb.metadata
                 || jsonb_build_object('cluster_id', r.cluster_id, 'is_canonical', r.is_canonical),
      updated_at = now()
  from jsonb_to_recordset(p_rows) as r(id text, cluster_id text, is_canonical boolean)
  where kb.id = r.id::uuid
    and kb.entity_type = 'knowledge_insight';
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

revoke all on function public.kb_apply_insight_clusters(jsonb) from public, anon, authenticated;
grant execute on function public.kb_apply_insight_clusters(jsonb) to service_role;

comment on function public.kb_apply_insight_clusters(jsonb) is
  'Set-based writer of cluster_id + is_canonical onto knowledge_insight metadata (metadata-only, '
  'no embedding invalidation). Written by the supersede-insights edge function (Sub-ticket 2).';
