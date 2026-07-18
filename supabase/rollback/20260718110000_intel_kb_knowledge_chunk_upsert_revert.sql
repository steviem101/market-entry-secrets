-- Rollback for 20260718110000_intel_kb_knowledge_chunk_upsert.sql
-- Drops the upsert function and removes the two watermark rows. Note: any
-- knowledge_chunk rows already synced into mes_knowledge_base are left in place
-- (rollback removes the ingest mechanism, not the data). To also purge synced data:
--   delete from public.mes_knowledge_base where entity_type = 'knowledge_chunk';

drop function if exists public.upsert_kb_knowledge_chunks(jsonb);

delete from public.kb_sync_state
where source in ('content_creator_document_chunk', 'content_creator_research_cache');
