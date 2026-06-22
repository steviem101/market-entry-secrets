-- ============================================================================
-- DOWN migration for 20260621060000_kb_extend_cross_project_linkedin_source.sql
-- Scope: xhziwveaiuhzdoutpgrh (MES Platform) ONLY.
-- Fully reverses the cross-project LinkedIn KB extension.
-- ============================================================================
-- Safe to run any time. In Phase 3 there are no cross-project rows yet, so the
-- delete is a no-op; after a Phase 4 backfill it removes the synced LinkedIn
-- rows before the column is dropped.
-- ============================================================================

begin;

-- 1) Remove any cross-project rows first (idempotent; none exist pre-Phase 4).
delete from public.mes_knowledge_base
  where source_project is distinct from 'mes_platform';

-- 2) Drop the write path + surrogate-id helper.
drop function if exists public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text);
drop function if exists public.kb_external_source_id(text, text);

-- 3) Drop the partial index.
drop index if exists public.mes_kb_source_project_idx;

-- 4) Drop the provenance column (this also discards its data).
alter table public.mes_knowledge_base
  drop column if exists source_project;

commit;
