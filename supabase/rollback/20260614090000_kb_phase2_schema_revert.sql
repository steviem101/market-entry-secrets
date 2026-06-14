-- Revert Phase 2: drop the KB schema. Safe — derived layer only; source tables untouched.
drop index if exists public.mes_kb_source_idx;
drop index if exists public.mes_kb_stale_idx;
drop index if exists public.mes_kb_fts_idx;
drop index if exists public.mes_kb_metadata_idx;
drop index if exists public.mes_kb_embedding_idx;
drop table if exists public.knowledge_embed_log;
drop table if exists public.mes_knowledge_base;
