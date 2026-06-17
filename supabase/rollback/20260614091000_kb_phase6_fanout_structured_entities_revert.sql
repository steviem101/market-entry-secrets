-- Revert Phase 6 fan-out (batch 1): drop the 8 entity sync layers.
drop trigger if exists kb_sync_event on public.events;
drop trigger if exists kb_sync_mentor on public.community_members;
drop trigger if exists kb_sync_agency on public.trade_investment_agencies;
drop trigger if exists kb_sync_ecosystem on public.innovation_ecosystem;
drop trigger if exists kb_sync_investor on public.investors;
drop trigger if exists kb_sync_country on public.countries;
drop trigger if exists kb_sync_country_faq on public.country_faqs;
drop trigger if exists kb_sync_lead_database on public.lead_databases;

drop function if exists public.trg_kb_generic();
drop function if exists public.upsert_kb_event(uuid);
drop function if exists public.upsert_kb_mentor(uuid);
drop function if exists public.upsert_kb_agency(uuid);
drop function if exists public.upsert_kb_ecosystem(uuid);
drop function if exists public.upsert_kb_investor(uuid);
drop function if exists public.upsert_kb_country(uuid);
drop function if exists public.upsert_kb_country_faq(uuid);
drop function if exists public.upsert_kb_lead_database(uuid);

-- kb_sync_all returns to its Phase 3 (service_provider-only) form if that migration is replayed.
-- To purge the derived rows for these entities:
-- delete from public.mes_knowledge_base where source_table in
--   ('events','community_members','trade_investment_agencies','innovation_ecosystem',
--    'investors','countries','country_faqs','lead_databases');
