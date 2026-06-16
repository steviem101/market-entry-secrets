-- Revert Phase 6b: drop the PII scrub guard. (Existing scrubbed content is left as-is.)
drop trigger if exists kb_scrub_pii on public.mes_knowledge_base;
drop function if exists public.trg_kb_scrub_pii();
drop function if exists public.kb_strip_pii(text);
