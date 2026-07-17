-- MES-188 T14 — concierge refinement boxes: the report_section_feedback data path.
--
-- Owner-approved (charter hold on T14/T15 lifted by the owner 2026-07-17). A
-- member can refine a matched section ("show me more early-stage investors") via
-- structured reasons + free text; we act on it. This is the ONE feedback data
-- path the charter calls for. Owner-scoped, mirroring lead_list_requests exactly
-- (P1-D) — the well-established owner-insert / owner+admin-read / admin-fulfil
-- funnel. Additive + idempotent; no data rewrite, no destructive op.
--
-- v1 scope note: this adds the refinement surface on the mentor/investor matched
-- sections and its unified table. The existing LeadListRequestCard keeps writing
-- lead_list_requests (the T7 auto-delivery + manual-fulfilment ops read it), so
-- that path is deliberately NOT re-routed here — folding it in waits until the
-- ops side reads report_section_feedback (charter "one data path", staged).

create table if not exists public.report_section_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid references public.user_reports(id) on delete set null,
  section_key text not null,
  reason_tags text[] not null default '{}',
  note text,
  status text not null default 'new' check (status in ('new','reviewed','actioned','closed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_report_section_feedback_user on public.report_section_feedback(user_id);
create index if not exists idx_report_section_feedback_open on public.report_section_feedback(status)
  where status in ('new','reviewed');

-- updated_at maintenance (per-table pattern, mirrors update_lead_list_requests_updated_at).
create or replace function public.update_report_section_feedback_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists tr_report_section_feedback_updated_at on public.report_section_feedback;
create trigger tr_report_section_feedback_updated_at before update on public.report_section_feedback
  for each row execute function public.update_report_section_feedback_updated_at();

-- ── RLS (mirrors lead_list_requests) ───────────────────────────────────
alter table public.report_section_feedback enable row level security;

drop policy if exists "owner can create own section feedback" on public.report_section_feedback;
create policy "owner can create own section feedback" on public.report_section_feedback
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner or admin can view section feedback" on public.report_section_feedback;
create policy "owner or admin can view section feedback" on public.report_section_feedback
  for select to authenticated
  using ((select auth.uid()) = user_id
         or public.has_role((select auth.uid()), 'admin'::public.app_role));

drop policy if exists "admin can update section feedback" on public.report_section_feedback;
create policy "admin can update section feedback" on public.report_section_feedback
  for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'::public.app_role))
  with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- SEC-01 grant lockdown: authenticated only; never anon; no client DELETE.
-- Column-level grants, exactly like lead_list_requests:
--   * INSERT only the member's own content fields — status/admin_notes can't be
--     self-set (they default: status 'new', admin_notes null).
--   * SELECT everything EXCEPT admin_notes (internal admin triage; service-role /
--     requireAdmin edge function only — RLS is row-level so this hides the column).
revoke all on public.report_section_feedback from anon, authenticated;
grant insert (user_id, report_id, section_key, reason_tags, note) on public.report_section_feedback to authenticated;
grant select (id, user_id, report_id, section_key, reason_tags, note, status, created_at, updated_at)
  on public.report_section_feedback to authenticated;
grant update on public.report_section_feedback to authenticated;
