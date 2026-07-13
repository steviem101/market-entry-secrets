-- MES-148 Phase 4 (PR-B): prompt_ab_proposals — propose-only promote/retire
-- recommendations for the prompt A/B flywheel.
--
-- The nightly prompt-ab-rollup function compares each live CANDIDATE prompt
-- (prompt_versions.status='candidate') against the ACTIVE prompt using report-
-- level report_quality.report_score, attributing each report to its arm via
-- report_json.metadata.prompt_ab. When a candidate clears the lift/min-sample
-- bar it writes a 'promote' (or 'retire') recommendation here and posts a Slack
-- card with Accept/Dismiss buttons (rq-slack-actions). Accepting only flips the
-- row's status — the actual promotion (copy the candidate body into
-- report_templates + retire the prompt_versions row) still ships as a human
-- migration/PR. The loop never writes the active prompt.
--
-- Additive + reversible (drop the table). Mirrors the eval_runs RLS/grant shape
-- (SEC-01): RLS on, default grants stripped, admin-read, service-role-write.

create table if not exists public.prompt_ab_proposals (
  id uuid primary key default gen_random_uuid(),
  section_name text not null,
  candidate_version integer not null,
  verdict text not null check (verdict in ('promote', 'retire')),
  candidate_n integer not null,
  control_n integer not null,
  candidate_mean numeric,
  control_mean numeric,
  lift numeric,
  grounding_lift numeric,
  status text not null default 'new' check (status in ('new', 'accepted', 'dismissed', 'shipped')),
  evidence jsonb not null default '{}'::jsonb,
  run_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.prompt_ab_proposals is
  'MES-148 Phase 4: propose-only prompt A/B promote/retire recommendations. Accepting flips status only; promotion ships via a human migration/PR.';

-- At most one OPEN ('new') proposal per candidate (section + version), so the
-- nightly loop does not re-propose the same recommendation every run.
create unique index if not exists uq_prompt_ab_proposals_open
  on public.prompt_ab_proposals (section_name, candidate_version)
  where status = 'new';

-- RLS: admin-read, service-role-write (edge functions use the service role, which
-- bypasses RLS). No anon/authenticated writes; non-admin authenticated reads are
-- denied by the absence of a matching policy.
alter table public.prompt_ab_proposals enable row level security;
revoke all on table public.prompt_ab_proposals from anon, authenticated;
grant select on table public.prompt_ab_proposals to authenticated;

drop policy if exists "Admins can read prompt ab proposals" on public.prompt_ab_proposals;
create policy "Admins can read prompt ab proposals"
  on public.prompt_ab_proposals for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- Seed a DISABLED routing row for the nightly rollup, reusing the existing
-- #report-quality channel, so the operator's enable path is a single UPDATE:
--   update public.activity_event_routing set enabled = true where event_type = 'prompt.ab.rollup';
-- Idempotent; no-op on a fresh DB with no 'report.quality' row (channel_id is
-- NOT NULL, so we can only seed once a source channel exists — the function
-- simply skips until a routing row is present).
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'prompt.ab.rollup', channel_id, ':test_tube:', 'info', false, false, false
from public.activity_event_routing where event_type = 'report.quality' limit 1
on conflict (event_type) do nothing;
