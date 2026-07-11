-- MES-148 Phase 1c: golden-set eval telemetry.
--
-- One row per golden per harness run: the judge's per-section rubric scores
-- (grounding/specificity/personalisation/duplication, 1-5) plus the verifier
-- totals for the generated report. Written by eval/run-goldens.ts with the
-- service-role key; baseline rows are flagged so score history and the
-- committed eval/baselines.json can be reconciled.
--
-- Access model (SEC-01 house pattern): service-role write only; admin read.
-- Additive only.

create table if not exists public.eval_runs (
  id uuid primary key default gen_random_uuid(),
  run_label text not null,
  golden_id text not null,
  report_id uuid references public.user_reports(id) on delete set null,
  judge_model text not null,
  rubric_version text not null default 'golden-judge-v1',
  sections jsonb not null default '{}'::jsonb,
  overall numeric,
  verification jsonb,
  baseline boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_eval_runs_golden
  on public.eval_runs (golden_id, created_at desc);

alter table public.eval_runs enable row level security;

revoke all on table public.eval_runs from anon, authenticated;
grant select on table public.eval_runs to authenticated;

create policy "Admins can read eval runs"
  on public.eval_runs
  for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
