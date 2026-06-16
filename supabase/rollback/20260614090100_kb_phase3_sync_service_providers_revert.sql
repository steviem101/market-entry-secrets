-- Revert Phase 3: drop the service_providers sync layer.
drop trigger if exists kb_sync_service_provider on public.service_providers;
drop function if exists public.trg_kb_service_provider();
drop function if exists public.upsert_kb_service_provider(uuid);
drop function if exists public.kb_sync_all(text);
-- Derived rows are left intact; to also purge them:
--   delete from public.mes_knowledge_base where source_table = 'service_providers';
