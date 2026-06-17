-- Revert Phase 6c: drop the content_items chunking sync layer.
drop trigger if exists kb_sync_content_item on public.content_items;
drop trigger if exists kb_sync_content_body on public.content_bodies;
drop trigger if exists kb_sync_content_section on public.content_sections;
drop function if exists public.trg_kb_content();
drop function if exists public.upsert_kb_content_item(uuid);
-- kb_sync_all returns to its batch-1 form if that migration replays.
-- Purge derived rows: delete from public.mes_knowledge_base where source_table='content_items';
