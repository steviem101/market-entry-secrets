-- MES-148 Phase 4 (PR-A): prompt_versions registry — CANDIDATE prompt bodies for
-- the live A/B flywheel.
--
-- report_templates.prompt_body stays the ACTIVE source of truth for every
-- section. This table stages CANDIDATE bodies (and retains RETIRED history).
-- generate-report swaps a candidate in only for reports that hash into the
-- PROMPT_AB_PERCENT bucket (default 0 = off), and records the choice in
-- report_json.metadata.prompt_ab so the nightly quality loop can attribute
-- scores. Promotion of a winning candidate ships as a normal migration/PR that
-- copies the body into report_templates and flips the row to 'retired' — the
-- loop stays propose-only, never auto-writing the active prompt.
--
-- Inert until BOTH a candidate row exists AND the flag is raised. Additive +
-- reversible (drop the table). Mirrors the eval_runs RLS/grant shape (SEC-01):
-- RLS on, default grants stripped, admin-read, service-role-write only.

create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  section_name text not null,
  version integer not null default 1,
  body text not null,
  status text not null default 'candidate' check (status in ('candidate', 'active', 'retired')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.prompt_versions is
  'MES-148 Phase 4: candidate/retired prompt bodies for the live A/B flywheel. Active prompt truth stays in report_templates.prompt_body.';

-- At most one live CANDIDATE per section — the A/B picks "the" candidate to run
-- against the active prompt. Retired rows are unconstrained (history).
create unique index if not exists uq_prompt_versions_one_candidate_per_section
  on public.prompt_versions (section_name)
  where status = 'candidate';

-- Candidate lookup by section in generate-report (only queried for bucketed runs).
create index if not exists idx_prompt_versions_section_status
  on public.prompt_versions (section_name, status);

-- RLS: admin-read, service-role-write (the edge function reads via service role,
-- which bypasses RLS). No anon/authenticated writes; non-admin authenticated
-- reads are denied by the absence of a matching policy.
alter table public.prompt_versions enable row level security;
revoke all on table public.prompt_versions from anon, authenticated;
grant select on table public.prompt_versions to authenticated;

drop policy if exists "Admins can read prompt versions" on public.prompt_versions;
create policy "Admins can read prompt versions"
  on public.prompt_versions for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
