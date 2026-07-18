-- MES-162 — homepage hero credibility: add a reports-generated counter to
-- public.get_ecosystem_stats().
--
-- The hero's unverifiable floating badges ("97% match", "4.9/5") are being
-- replaced with data-backed stats. "Reports generated" is the one number the
-- ticket calls for that the RPC doesn't already expose. Count only completed
-- reports — a processing/failed row isn't a delivered report, so the public
-- claim stays truthful.
--
-- Additive only: every existing key keeps its name, filter and value, so the
-- ProofStrip and useEcosystemStats consumers are untouched (same posture as
-- 20260715120000). Aggregate count only — nothing row-level from user_reports
-- is exposed, so SECURITY DEFINER remains safe for anon.

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
                             where is_active = true),
    'reportsGenerated',    (select count(*) from user_reports where status = 'completed')
  );
$$;

comment on function public.get_ecosystem_stats() is
  'Read-only homepage ecosystem counters (providers, mentors, investors, accelerators, innovation ecosystem, lead databases, events, guides, case studies, government/trade agencies, completed reports). Single source of truth for the homepage proof strip and hero credibility badges. SECURITY DEFINER + STABLE; safe for anon.';

revoke all on function public.get_ecosystem_stats() from public;
grant execute on function public.get_ecosystem_stats() to anon, authenticated;
