-- Phase 4a: embedding-pipeline DB helpers + internal cron secret.
-- Reversible: supabase/rollback/20260614090200_kb_phase4_embedding_pipeline_revert.sql

-- Vault secret for cron -> embed-knowledge auth (mirrors the email_internal_secret pattern).
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'knowledge_internal_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'knowledge_internal_secret',
      'Internal secret: pg_cron -> embed-knowledge edge function auth'
    );
  end if;
end $$;

-- Verify a presented internal secret WITHOUT ever returning the secret itself.
create or replace function public.kb_check_secret(p_candidate text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'knowledge_internal_secret' and decrypted_secret = p_candidate
  );
$$;

-- Fetch the OpenAI key from Vault (service-role only). The edge fn prefers its OPENAI_API_KEY
-- env var and only falls back to this, so the key can be provisioned without a redeploy.
create or replace function public.kb_get_openai_key()
returns text language sql stable security definer set search_path = public as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'openai_api_key' limit 1;
$$;

-- Stale rows needing (re)embedding, hard-capped at 100/call (runaway guard lives here too).
create or replace function public.kb_stale_rows(p_limit int default 100)
returns table(id uuid, content text, content_hash text)
language sql stable security definer set search_path = public as $$
  select id, content, content_hash
  from public.mes_knowledge_base
  where (embedding is null or embedded_hash is distinct from content_hash)
    and length(btrim(content)) > 0
  order by updated_at asc
  limit greatest(least(p_limit, 100), 1);
$$;

-- Write back one embedding. embedded_hash is the content_hash captured at fetch time.
create or replace function public.kb_set_embedding(
  p_id uuid, p_embedding text, p_embedded_hash text, p_model text default 'text-embedding-3-small')
returns void language sql security definer set search_path = public as $$
  update public.mes_knowledge_base
     set embedding       = p_embedding::vector,
         embedded_hash   = p_embedded_hash,
         embedding_model = p_model,
         updated_at      = now()
   where id = p_id;
$$;

revoke all on function public.kb_check_secret(text)                      from public, anon, authenticated;
revoke all on function public.kb_get_openai_key()                        from public, anon, authenticated;
revoke all on function public.kb_stale_rows(int)                         from public, anon, authenticated;
revoke all on function public.kb_set_embedding(uuid,text,text,text)      from public, anon, authenticated;
grant execute on function public.kb_check_secret(text)                   to service_role;
grant execute on function public.kb_get_openai_key()                     to service_role;
grant execute on function public.kb_stale_rows(int)                      to service_role;
grant execute on function public.kb_set_embedding(uuid,text,text,text)   to service_role;
