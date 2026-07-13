-- MES-148 Phase 5 (P5-5): directory_demand_signals — the unmet-demand queue.
--
-- The nightly demand-mining loop reads recent report intake (user_intake_forms:
-- services_needed / industry_sector / target_regions) and cross-references it against
-- directory SUPPLY (service_providers matching each canonical service term's synonyms
-- from service_terms, P5-1). Where users repeatedly ask for a service the directory
-- can't serve well, it lands an unmet-demand signal here — a ranked gap the discovery
-- agent (P5-4) targets and a human triages via Slack.
--
-- Propose-only + read-only upstream: the loop only READS intake/supply and WRITES its
-- own signal rows. It never touches a directory row. Mirrors the eval_runs /
-- directory_steward_staging RLS+grant shape (SEC-01): RLS on, default grants stripped,
-- admin-read, service-role-write. Additive + reversible (drop the table). Inert until
-- the demand-mining function (P5-5) writes to it AND DEMAND_MINING_ENABLED is on.

create table if not exists public.directory_demand_signals (
  id uuid primary key default gen_random_uuid(),
  signal_type text not null default 'service' check (signal_type in ('service')),
  term_slug text not null,                 -- canonical service_terms.slug the demand maps to
  term_label text not null,                -- display form at mining time
  demand_count integer not null default 0, -- distinct intake forms in the window wanting this term
  supply_count integer not null default 0, -- directory rows that match the term's synonyms
  gap_score numeric not null default 0,    -- demand-weighted shortfall; higher = more underserved
  window_days integer not null,            -- lookback window the counts were computed over
  sample_regions text[] not null default '{}', -- top target_regions demanding this term (discovery hint)
  sample_sectors text[] not null default '{}', -- top industry_sectors demanding this term (discovery hint)
  status text not null default 'new' check (status in ('new', 'ack', 'actioned', 'dismissed')),
  evidence jsonb not null default '{}'::jsonb,
  run_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.directory_demand_signals is
  'MES-148 Phase 5: unmet-demand signals mined from report intake vs directory supply. Propose-only; the discovery agent (P5-4) targets the ranked gaps. Never client-writable.';

-- At most one OPEN signal per service term (covers 'new' awaiting triage and 'ack'
-- acknowledged-but-not-yet-actioned), so a nightly re-run refreshes the open row
-- rather than stacking duplicates. 'actioned'/'dismissed' rows are unconstrained (history).
create unique index if not exists uq_directory_demand_open_per_term
  on public.directory_demand_signals (signal_type, term_slug)
  where status in ('new', 'ack');

-- Triage-queue lookups (most-underserved first).
create index if not exists idx_directory_demand_status on public.directory_demand_signals (status, gap_score desc);

alter table public.directory_demand_signals enable row level security;
revoke all on table public.directory_demand_signals from anon, authenticated;
grant select on table public.directory_demand_signals to authenticated;

drop policy if exists "Admins can read directory demand signals" on public.directory_demand_signals;
create policy "Admins can read directory demand signals"
  on public.directory_demand_signals for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- ── Disabled routing seed ─────────────────────────────────────────────────────
-- Seeds a DISABLED activity_event_routing row so the operator's enable path is a
-- single UPDATE (after setting DEMAND_MINING_ENABLED). Reuses the #report-quality
-- channel. Idempotent; no-op if no 'report.quality' row exists (the loop self-gates
-- off until a routing row exists AND DEMAND_MINING_ENABLED=on).
--
--   Enable path (both required):
--     supabase secrets set DEMAND_MINING_ENABLED=on --project-ref xhziwveaiuhzdoutpgrh
--     update public.activity_event_routing set enabled = true where event_type = 'directory.demand';
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'directory.demand', channel_id, ':chart_with_upwards_trend:', 'info', false, false, false
from public.activity_event_routing where event_type = 'report.quality' limit 1
on conflict (event_type) do nothing;
