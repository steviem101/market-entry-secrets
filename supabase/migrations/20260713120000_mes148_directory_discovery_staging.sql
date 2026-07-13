-- MES-148 Phase 5 (P5-4): directory_discovery_staging — the review queue for the
-- directory discovery agent.
--
-- The discovery agent reads the top unmet-demand signals (directory_demand_signals,
-- P5-5), web-searches (Firecrawl) for candidate organisations that could fill each
-- gap, dedupes them against the live directory, and lands each candidate here as a
-- propose-only row + a Slack Approve/Dismiss card. It NEVER inserts into a directory
-- table — a human approves, and the import still ships as a reviewed action.
--
-- Mirrors the directory_steward_staging RLS/grant shape (SEC-01): RLS on, default
-- grants stripped, admin-read, service-role-write. Additive + reversible (drop the
-- table). Inert until the discovery function (P5-4) writes to it AND
-- DIRECTORY_DISCOVERY_ENABLED is on.

create table if not exists public.directory_discovery_staging (
  id uuid primary key default gen_random_uuid(),
  directory_table text not null default 'service_providers', -- which directory a candidate would join
  candidate_name text not null,
  candidate_url text,
  candidate_domain text,                   -- normalised host, used to dedupe open candidates
  description text,
  term_slug text,                          -- the demand term this candidate would fill
  demand_signal_id uuid,                    -- directory_demand_signals.id that prompted the search
  source_query text,                        -- the search query that surfaced the candidate
  evidence jsonb not null default '{}'::jsonb, -- raw search snippet / provenance
  status text not null default 'new' check (status in ('new', 'approved', 'dismissed', 'imported')),
  run_id uuid,
  reviewed_at timestamptz,
  imported_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.directory_discovery_staging is
  'MES-148 Phase 5: discovery-agent review queue. Propose-only candidate directory rows sourced from web search against unmet-demand signals; approved → imported via a reviewed action. Never client-writable, never auto-inserted into a directory.';

-- At most one OPEN candidate per (directory, domain) — covers 'new' (awaiting review)
-- and 'approved' (awaiting the reviewed import) — so a re-run can't stage a duplicate
-- for a domain already queued. Rows with a null domain are exempt (no dedupe key);
-- 'dismissed'/'imported' rows are unconstrained (history).
create unique index if not exists uq_directory_discovery_open_per_domain
  on public.directory_discovery_staging (directory_table, candidate_domain)
  where status in ('new', 'approved') and candidate_domain is not null;

-- Review-queue + per-term lookups.
create index if not exists idx_directory_discovery_status on public.directory_discovery_staging (status, created_at);
create index if not exists idx_directory_discovery_term on public.directory_discovery_staging (term_slug);

alter table public.directory_discovery_staging enable row level security;
revoke all on table public.directory_discovery_staging from anon, authenticated;
grant select on table public.directory_discovery_staging to authenticated;

drop policy if exists "Admins can read directory discovery staging" on public.directory_discovery_staging;
create policy "Admins can read directory discovery staging"
  on public.directory_discovery_staging for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- ── Disabled routing seed ─────────────────────────────────────────────────────
-- Seeds a DISABLED activity_event_routing row so the operator's enable path is a
-- single UPDATE (after setting DIRECTORY_DISCOVERY_ENABLED). Reuses the
-- #report-quality channel. Idempotent; no-op if no 'report.quality' row exists (the
-- agent self-gates off until a routing row exists AND DIRECTORY_DISCOVERY_ENABLED=on).
--
--   Enable path (both required):
--     supabase secrets set DIRECTORY_DISCOVERY_ENABLED=on --project-ref xhziwveaiuhzdoutpgrh
--     update public.activity_event_routing set enabled = true where event_type = 'directory.discovery';
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'directory.discovery', channel_id, ':satellite_antenna:', 'info', false, false, false
from public.activity_event_routing where event_type = 'report.quality' limit 1
on conflict (event_type) do nothing;
