-- Homepage ecosystem stat counters: single authoritative source of truth.
--
-- Background: the hero stat row previously issued 7 separate client-side
-- count() queries against base tables/PII-safe views. Counts that read from a
-- `security_invoker` view or rely on RLS to status-filter were fragile, and a
-- failed/blocked query surfaced as a literal "0" (credibility leak).
--
-- This SECURITY DEFINER function computes every homepage counter server-side in
-- one round-trip, with the correct public filters baked in:
--   * events   -> only `approved`  (excludes needs_review / rejected)
--   * guides   -> only `published`
--   * mentors  -> only `is_active`
--   * leads    -> only `active`
-- It is STABLE and read-only. Granted to anon + authenticated so the public
-- homepage can call it without exposing the underlying PII-bearing base tables.

create or replace function public.get_ecosystem_stats()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'serviceProviders', (select count(*) from service_providers),
    'mentors',          (select count(*) from community_members where is_active = true),
    'investors',        (select count(*) from investors),
    'accelerators',     (select count(*) from investors where investor_type = 'accelerator'),
    'leadDatabases',    (select count(*) from lead_databases where status = 'active'),
    'events',           (select count(*) from events where status = 'approved'),
    'guides',           (select count(*) from content_items
                          where content_type = 'guide' and status = 'published')
  );
$$;

comment on function public.get_ecosystem_stats() is
  'Read-only homepage ecosystem counters (providers, mentors, investors, accelerators, lead databases, events, guides). Single source of truth for the hero substantiation line. SECURITY DEFINER + STABLE; safe for anon.';

-- Lock down then grant execute explicitly (anon role is intentionally allowed).
revoke all on function public.get_ecosystem_stats() from public;
grant execute on function public.get_ecosystem_stats() to anon, authenticated;
