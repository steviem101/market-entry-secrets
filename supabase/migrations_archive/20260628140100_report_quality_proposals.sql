-- report_quality_proposals — propose-only review queue for the report-quality loop.
-- Admin-read + admin-update (accept/reject); writes (inserts) are service-role only.
-- No user PII is stored: rows reference report_id + public directory match names + the
-- user's own company name (already shown in #report-quality), never emails/contacts.

create table if not exists public.report_quality_proposals (
  id                 uuid primary key default gen_random_uuid(),
  run_id             uuid references public.automation_runs(id) on delete set null,
  report_id          uuid not null,
  tier_at_generation text,
  category           text not null check (category in (
    'matching/relevance', 'content/prompt-bulk', 'data-coverage-gap',
    'input-not-actioned', 'accuracy/hallucination')),
  title              text not null,
  evidence           jsonb not null default '{}'::jsonb,
  recommended_change text not null,
  impact_estimate    text not null default 'medium' check (impact_estimate in ('high','medium','low')),
  confidence         numeric not null default 0.5,
  risk               text not null default 'low' check (risk in ('low','medium','high')),
  axis_scores        jsonb not null default '{}'::jsonb,  -- { relevance, conciseness, fidelity }
  rank_score         numeric not null default 0,
  rubric_version     text,
  dedup_theme        text,
  status             text not null default 'new' check (status in ('new','accepted','rejected','shipped')),
  reviewed_by        uuid,
  reviewed_at        timestamptz,
  fix_ref            text,                                -- ticket / PR link once accepted
  created_at         timestamptz not null default now()
);
create index if not exists rq_proposals_report_idx on public.report_quality_proposals (report_id);
create index if not exists rq_proposals_status_rank_idx on public.report_quality_proposals (status, rank_score desc);
create index if not exists rq_proposals_theme_idx on public.report_quality_proposals (dedup_theme);

alter table public.report_quality_proposals enable row level security;
revoke all on public.report_quality_proposals from anon, authenticated;
create policy "Admins read report_quality_proposals"
  on public.report_quality_proposals for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
create policy "Admins update report_quality_proposals"
  on public.report_quality_proposals for update
  using (public.has_role((select auth.uid()), 'admin'::public.app_role))
  with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

comment on table public.report_quality_proposals is 'Propose-only review queue from the report-quality loop. Admin read + update (accept/reject); inserts are service-role only. No user PII.';
