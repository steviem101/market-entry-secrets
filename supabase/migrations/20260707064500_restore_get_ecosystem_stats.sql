-- Restore public.get_ecosystem_stats() — lost in the 2026-07-04 re-baseline.
--
-- The function was originally created by 20260624120000_get_ecosystem_stats.sql
-- (now in supabase/migrations_archive/), but it does not exist in production:
-- the remote baseline snapshot did not include it, so every homepage stats call
-- errors and the ProofStrip renders its hardcoded fallback counts instead of
-- live numbers (e.g. "30+ Mentors" when there are 132).
--
-- Definition is identical to the archived original. See that file for the full
-- rationale; summary of the public filters baked in:
--   * events       -> only `approved`
--   * guides       -> only `published`
--   * mentors      -> only `is_active`
--   * lead lists   -> only `active`
--   * accelerators -> innovation_ecosystem rows tagged Accelerator/Pre-accelerator
-- SECURITY DEFINER + STABLE, read-only, granted to anon + authenticated so the
-- public homepage can call it without exposing the PII-bearing base tables.

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
    'accelerators',     (select count(*) from innovation_ecosystem
                          where services && array['Accelerator','Pre-accelerator']),
    'leadDatabases',    (select count(*) from lead_databases where status = 'active'),
    'events',           (select count(*) from events where status = 'approved'),
    'guides',           (select count(*) from content_items
                          where content_type = 'guide' and status = 'published')
  );
$$;

comment on function public.get_ecosystem_stats() is
  'Read-only homepage ecosystem counters (providers, mentors, investors, accelerators, lead databases, events, guides). Single source of truth for the homepage proof strip. SECURITY DEFINER + STABLE; safe for anon.';

revoke all on function public.get_ecosystem_stats() from public;
grant execute on function public.get_ecosystem_stats() to anon, authenticated;
