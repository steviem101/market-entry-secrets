-- MES agent loops (Workstream A): content_link_checks — the consecutive-failure tracker that
-- lets loop-content-refresh apply the "2 consecutive weekly failures before proposing" rule for
-- dead directory links (the Phase 1 audit found HEAD-only checks yield false positives, e.g. a
-- 415 from a live host, so a single failure must never propose flag_dead_link).
--
-- One row per (directory_table, record_id, url). The loop re-checks each URL with a GET, updates
-- last_status + consecutive_failures, and only emits a flag_dead_link proposal when
-- consecutive_failures >= 2. A success resets the counter to 0. Rebuildable telemetry, not
-- curated data. RLS on, admin-read, service-role-write. Additive + reversible.
-- Rollback: supabase/rollback/20260720100100_content_link_checks_revert.sql

create table if not exists public.content_link_checks (
  id uuid primary key default gen_random_uuid(),
  directory_table text not null,                  -- e.g. 'service_providers'
  record_id uuid not null,                         -- the directory row's id
  url text not null,                               -- the URL that was checked
  last_status integer,                             -- last HTTP status (null = network error / no response)
  last_ok boolean,                                 -- true when last check was 2xx/3xx (GET)
  consecutive_failures integer not null default 0, -- reset to 0 on success; >= 2 gates flag_dead_link
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.content_link_checks is
  'MES agent loops: per-URL dead-link failure counter for loop-content-refresh. flag_dead_link is '
  'only proposed at consecutive_failures >= 2 to survive transient outages. Rebuildable telemetry.';

-- One tracker row per checked URL of a directory record.
create unique index if not exists uq_content_link_checks_target
  on public.content_link_checks (directory_table, record_id, url);

-- The loop scans "due for re-check, currently failing" cheaply.
create index if not exists idx_content_link_checks_due
  on public.content_link_checks (last_checked_at);

alter table public.content_link_checks enable row level security;
revoke all on table public.content_link_checks from anon, authenticated;
grant select on table public.content_link_checks to authenticated;

drop policy if exists "Admins read content_link_checks" on public.content_link_checks;
create policy "Admins read content_link_checks"
  on public.content_link_checks for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
