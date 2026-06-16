-- Revert Phase 4: embedding pipeline (cron + helper fns + internal secret).
do $$
begin
  if exists (select 1 from cron.job where jobname = 'embed-knowledge') then
    perform cron.unschedule('embed-knowledge');
  end if;
end $$;

drop function if exists public.kb_set_embedding(uuid,text,text,text);
drop function if exists public.kb_stale_rows(int);
drop function if exists public.kb_get_openai_key();
drop function if exists public.kb_check_secret(text);

-- Internal cron secret (only used by embed-knowledge). Uncomment to also remove it:
-- delete from vault.secrets where name = 'knowledge_internal_secret';

-- The edge function itself is undeployed out-of-band:
--   supabase functions delete embed-knowledge
