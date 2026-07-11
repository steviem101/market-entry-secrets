-- MES-148 Phase 1a: claims registry.
--
-- Every research/extraction pass in generate-report now emits structured claims
-- ({claim_id, statement, value, source_url, confidence, as_of, stage}) that are
-- persisted here per report. The blocking verifier (shadow mode first) checks
-- draft numerals/entities against this registry + the research corpus, and the
-- renderer can later map claim_id -> citation.
--
-- Access model (SEC-01 house pattern):
--   * writes: service-role ONLY (no anon/authenticated write grants or policies;
--     rows are inserted by the generate-report edge function).
--   * reads: report owner + admin via RLS policy below.
-- Additive only; no existing table is touched.

create table if not exists public.report_claims (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.user_reports(id) on delete cascade,
  claim_id text not null,
  statement text not null,
  value text,
  unit text,
  source_url text,
  confidence text not null default 'medium'
    check (confidence in ('high', 'medium', 'low')),
  as_of text,
  stage text not null
    check (stage in ('research', 'metrics', 'directory', 'extraction')),
  created_at timestamptz not null default now(),
  unique (report_id, claim_id)
);

create index if not exists idx_report_claims_report_id
  on public.report_claims (report_id);

alter table public.report_claims enable row level security;

-- Strip the broad default grants, then re-grant SELECT only (the RLS policy
-- below scopes which rows an authenticated user can actually read). No INSERT/
-- UPDATE/DELETE grant or policy for client roles => service-role-write only.
revoke all on table public.report_claims from anon, authenticated;
grant select on table public.report_claims to authenticated;

create policy "Owners and admins can read report claims"
  on public.report_claims
  for select
  using (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    or exists (
      select 1
      from public.user_reports r
      where r.id = report_claims.report_id
        and r.user_id = (select auth.uid())
    )
  );
