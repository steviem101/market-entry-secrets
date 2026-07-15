-- Extend public.get_ecosystem_stats() so the homepage ProofStrip can show a live
-- counter for every main MES directory (MES: proofstrip-all-directories).
--
-- Additive only — every existing key keeps its name, filter and value, so the
-- current ProofStrip consumers are untouched. Three new keys are appended:
--   * innovationEcosystem -> full innovation_ecosystem directory count. The
--       ProofStrip counter links to /innovation-ecosystem, which lists ALL rows
--       (no accelerator filter), so the truthful count is the whole directory,
--       not the pre-existing `accelerators` subset (Accelerator/Pre-accelerator).
--       `accelerators` is retained unchanged for back-compat.
--   * caseStudies        -> content_items case studies (content_type='case_study'),
--       only `published` — matches the /case-studies directory (useCaseStudies).
--   * governmentAgencies -> trade_investment_agencies, only `is_active` — matches
--       the /government-support directory (useTradeAgencies).
--
-- Same posture as before: SECURITY DEFINER + STABLE, read-only, execute granted
-- to anon + authenticated so the public homepage can call it without exposing the
-- PII-bearing base tables.

create or replace function public.get_ecosystem_stats()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'serviceProviders',    (select count(*) from service_providers),
    'mentors',             (select count(*) from community_members where is_active = true),
    'investors',           (select count(*) from investors),
    'accelerators',        (select count(*) from innovation_ecosystem
                             where services && array['Accelerator','Pre-accelerator']),
    'innovationEcosystem', (select count(*) from innovation_ecosystem),
    'leadDatabases',       (select count(*) from lead_databases where status = 'active'),
    'events',              (select count(*) from events where status = 'approved'),
    'guides',              (select count(*) from content_items
                             where content_type = 'guide' and status = 'published'),
    'caseStudies',         (select count(*) from content_items
                             where content_type = 'case_study' and status = 'published'),
    'governmentAgencies',  (select count(*) from trade_investment_agencies
                             where is_active = true)
  );
$$;

comment on function public.get_ecosystem_stats() is
  'Read-only homepage ecosystem counters (providers, mentors, investors, accelerators, innovation ecosystem, lead databases, events, guides, case studies, government/trade agencies). Single source of truth for the homepage proof strip. SECURITY DEFINER + STABLE; safe for anon.';

revoke all on function public.get_ecosystem_stats() from public;
grant execute on function public.get_ecosystem_stats() to anon, authenticated;
