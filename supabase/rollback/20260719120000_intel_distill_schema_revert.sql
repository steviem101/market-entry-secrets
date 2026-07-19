-- Rollback for 20260719120000_intel_distill_schema.sql
-- Drops the distillation RPCs and the state log. Any knowledge_insight rows already
-- written to mes_knowledge_base are left in place (this removes the mechanism, not the
-- data). To also purge distilled insights:
--   delete from public.mes_knowledge_base where entity_type = 'knowledge_insight';

drop function if exists public.log_knowledge_distill(jsonb);
drop function if exists public.kb_undistilled_chunks(text, integer);
drop function if exists public.upsert_kb_knowledge_insights(jsonb);
drop table if exists public.knowledge_distill_log;
