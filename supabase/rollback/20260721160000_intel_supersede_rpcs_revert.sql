-- Revert of 20260721160000_intel_supersede_rpcs.sql
-- Drops the supersede/dedup RPCs. Card metadata (cluster_id/is_canonical) already written by
-- a prior run is left as-is — this only removes the functions, not the data. To also clear
-- assignments, run separately:
--   update public.mes_knowledge_base
--     set metadata = metadata || jsonb_build_object('cluster_id', null, 'is_canonical', true)
--     where entity_type = 'knowledge_insight' and metadata ? 'cluster_id';

drop function if exists public.kb_apply_insight_clusters(jsonb);
drop function if exists public.kb_insight_cluster_fields(text);
drop function if exists public.kb_insight_neighbors(text, double precision, integer);
