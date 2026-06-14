-- Phase 5: canonical hybrid retrieval RPC for MCPs / AI agents.
-- SECURITY DEFINER, but visibility is enforced INSIDE the function and never assumed from the
-- caller. allowed_visibility defaults to {public}, so a forgetful caller still leaks nothing.
-- query_text is an addition to the prompt's signature: required to compute the ts_rank + trigram
-- (keyword) half of the hybrid score so exact-name queries work, not just pure vector.
-- Reversible: supabase/rollback/20260614090300_kb_phase5_search_revert.sql
-- vector/pg_trgm are in `public` on the source project but `extensions` on a fresh branch;
-- search both so the vector(1536) param type + <=> operator + similarity() resolve either way.
set search_path = public, extensions;

create or replace function public.match_knowledge(
  query_embedding    vector(1536),
  query_text         text    default null,
  match_count        int     default 10,
  match_threshold    float   default 0.5,
  filter             jsonb   default '{}'::jsonb,
  allowed_visibility text[]  default array['public']
)
returns table (
  id           uuid,
  source_table text,
  source_id    uuid,
  entity_type  text,
  title        text,
  content      text,
  metadata     jsonb,
  source_url   text,
  similarity   float,
  score        float
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  with params as (
    select case
             when query_text is not null and length(btrim(query_text)) > 0
             then websearch_to_tsquery('english', query_text)
           end as tsq
  ),
  candidates as (
    select
      k.id, k.source_table, k.source_id, k.entity_type, k.title, k.content, k.metadata,
      (1 - (k.embedding <=> query_embedding))::float as vec_sim,
      case when (select tsq from params) is not null
           then ts_rank(to_tsvector('english', coalesce(k.title,'') || ' ' || k.content),
                        (select tsq from params))
           else 0 end::float as kw_rank,
      case when query_text is not null and length(btrim(query_text)) > 0
           then similarity(coalesce(k.title,''), query_text)
           else 0 end::float as name_sim
    from public.mes_knowledge_base k
    where k.embedding is not null
      and k.metadata @> filter
      and (k.metadata->>'visibility') = any(allowed_visibility)
      and coalesce((k.metadata->>'is_active')::boolean, true) is not false
  )
  select
    id, source_table, source_id, entity_type, title, content, metadata,
    metadata->>'source_url' as source_url,
    vec_sim as similarity,
    (0.6 * vec_sim + 0.25 * least(kw_rank, 1.0) + 0.15 * name_sim)::float as score
  from candidates
  where vec_sim >= match_threshold
     or kw_rank > 0
     or name_sim >= 0.3
  order by score desc
  limit greatest(match_count, 1);
$$;

-- Canonical agent/MCP entry point: intentionally callable by anon (public-only by default).
revoke all on function public.match_knowledge(vector,text,int,float,jsonb,text[]) from public;
grant execute on function public.match_knowledge(vector,text,int,float,jsonb,text[]) to anon, authenticated, service_role;

comment on function public.match_knowledge(vector,text,int,float,jsonb,text[]) is
  'Canonical hybrid (vector + tsvector + trigram) retrieval over mes_knowledge_base for MCPs/agents. Visibility enforced internally; allowed_visibility defaults to {public}. Call via the knowledge-search edge function, which sets allowed_visibility from caller auth/plan.';
