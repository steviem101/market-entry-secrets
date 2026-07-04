-- Phase 6b: centralized PII scrub guard. Defense-in-depth so emails/phones can never land in
-- mes_knowledge_base.content regardless of which upsert path wrote it (a leak surfaced where a
-- source description contained the entity's own contact_email). BEFORE ... UPDATE OF content so
-- it fires on content rewrites but NOT on embedding writebacks (which never touch content).
-- Reversible: supabase/rollback/20260614091500_kb_phase6b_pii_scrub_guard_revert.sql

create or replace function public.kb_strip_pii(p text)
returns text language sql immutable set search_path = public as $$
  select btrim(regexp_replace(
    regexp_replace(
      regexp_replace(coalesce(p, ''),
        '[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}', ' ', 'g'),  -- email addresses
      '\+\d[\d\s\-().]{6,}\d', ' ', 'g'),                                -- intl-format phone numbers
    '[ \t]{2,}', ' ', 'g'));                                            -- collapse whitespace
$$;

create or replace function public.trg_kb_scrub_pii()
returns trigger language plpgsql set search_path = public as $$
begin
  new.content := public.kb_strip_pii(new.content);
  new.content_hash := md5(new.content);  -- hash always reflects the stored (scrubbed) content
  return new;
end; $$;

drop trigger if exists kb_scrub_pii on public.mes_knowledge_base;
create trigger kb_scrub_pii before insert or update of content on public.mes_knowledge_base
  for each row execute function public.trg_kb_scrub_pii();

revoke all on function public.kb_strip_pii(text) from public, anon, authenticated;
revoke all on function public.trg_kb_scrub_pii() from public, anon, authenticated;
grant execute on function public.kb_strip_pii(text) to service_role;
