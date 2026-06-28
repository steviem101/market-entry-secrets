-- automation_runs — shared run log for scheduled MES loops (report-quality-loop first).
-- Additive + reversible. Admin-read only; writes are service-role only (loops run server-side).

create table if not exists public.automation_runs (
  id          uuid primary key default gen_random_uuid(),
  loop        text not null,                 -- e.g. 'report-quality-loop'
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  status      text not null default 'running',  -- running | success | error | skipped
  reviewed    integer not null default 0,    -- items examined
  proposed    integer not null default 0,    -- proposals written
  accepted    integer not null default 0,    -- proposals later accepted (back-filled by review)
  tokens_used integer,                        -- LLM tokens (in+out) for the run
  cost        jsonb,                          -- { input_tokens, output_tokens, usd }
  error       text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists automation_runs_loop_started_idx on public.automation_runs (loop, started_at desc);

alter table public.automation_runs enable row level security;
revoke all on public.automation_runs from anon, authenticated;
create policy "Admins read automation_runs"
  on public.automation_runs for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

comment on table public.automation_runs is 'Run log for scheduled MES automation loops. Admin-read only; writes are service-role only.';
