-- MES-148 Phase 5 (P5-3a): directory_steward_staging — the review/audit queue for the
-- nightly directory steward (P5-3b).
--
-- The steward re-scrapes each directory row's source URL, diffs against the stored
-- row, and lands the outcome here:
--   • change_class 'A' (safe fields — URL reachability, phone, address): the steward
--     auto-applies to the live row and records the change here as an AUDIT row
--     (status 'applied').
--   • change_class 'B' (substantive — description, tags, status, name/company): NOT
--     applied; recorded as a propose-only 'new' row + a Slack Approve/Dismiss card
--     (rq-slack-actions). A human approves; the apply still ships as a reviewed action.
--
-- Mirrors the eval_runs RLS/grant shape (SEC-01): RLS on, default grants stripped,
-- admin-read, service-role-write. Additive + reversible (drop the table). Inert until
-- the steward function (P5-3b) writes to it.

create table if not exists public.directory_steward_staging (
  id uuid primary key default gen_random_uuid(),
  directory_table text not null,          -- e.g. 'service_providers'
  record_id uuid not null,                -- the directory row's id
  source_url text,                        -- the URL that was re-scraped
  change_class text not null check (change_class in ('A', 'B')),
  field_diffs jsonb not null default '{}'::jsonb,  -- { field: { before, after } }
  computed_health smallint,               -- the data_health the steward scored for this row
  status text not null default 'new' check (status in ('new', 'approved', 'dismissed', 'applied')),
  evidence jsonb not null default '{}'::jsonb,
  run_id uuid,
  reviewed_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.directory_steward_staging is
  'MES-148 Phase 5: nightly directory steward review/audit queue. Class-A auto-applied (status applied); class-B propose-only (new → approved/dismissed), applied via a reviewed action. Never client-writable.';

-- At most one OPEN ('new') class-B proposal per directory row, so a row is not
-- re-proposed every night until the current proposal is resolved. Class-A audit
-- rows ('applied') and resolved rows are unconstrained (history).
create unique index if not exists uq_directory_steward_open_per_record
  on public.directory_steward_staging (directory_table, record_id)
  where status = 'new';

-- Review-queue + per-record lookups.
create index if not exists idx_directory_steward_status on public.directory_steward_staging (status, created_at);
create index if not exists idx_directory_steward_record on public.directory_steward_staging (directory_table, record_id);

alter table public.directory_steward_staging enable row level security;
revoke all on table public.directory_steward_staging from anon, authenticated;
grant select on table public.directory_steward_staging to authenticated;

drop policy if exists "Admins can read directory steward staging" on public.directory_steward_staging;
create policy "Admins can read directory steward staging"
  on public.directory_steward_staging for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
