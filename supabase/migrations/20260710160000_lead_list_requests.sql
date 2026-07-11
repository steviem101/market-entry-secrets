-- P1-D: custom lead-list request box (Floats feedback).
--
-- When the ICP gate (P1-C/#351/#352) leaves few or no relevant lead lists, the
-- member can describe the list they need; we build it and deliver it to their
-- dashboard. Owner-scoped (tied to a logged-in user + their report) so the
-- member can see their own requests + the delivered dataset — stricter than the
-- public mentor_contact_requests funnel. Approval-gated (new table + RLS) —
-- design signed off 2026-07-09.
--
-- Additive + idempotent: CREATE ... IF NOT EXISTS / OR REPLACE / DROP ... IF
-- EXISTS throughout; safe to replay against an empty preview DB. No data
-- rewrite, no destructive op.

create table if not exists public.lead_list_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid references public.user_reports(id) on delete set null,
  request_text text not null,
  status text not null default 'new' check (status in ('new','in_progress','delivered','declined')),
  delivered_database_id uuid references public.lead_databases(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lead_list_requests_user on public.lead_list_requests(user_id);
-- admin queue: open (not yet delivered/declined) requests.
create index if not exists idx_lead_list_requests_open on public.lead_list_requests(status)
  where status in ('new','in_progress');

-- updated_at maintenance (dedicated fn; mirrors the per-table pattern used across
-- this schema, e.g. update_mentor_contact_requests_updated_at).
create or replace function public.update_lead_list_requests_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists tr_lead_list_requests_updated_at on public.lead_list_requests;
create trigger tr_lead_list_requests_updated_at before update on public.lead_list_requests
  for each row execute function public.update_lead_list_requests_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.lead_list_requests enable row level security;

-- Owner files their OWN request (no anon — requests are tied to a signed-in user).
drop policy if exists "owner can create own lead list request" on public.lead_list_requests;
create policy "owner can create own lead list request" on public.lead_list_requests
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Owner sees their own (+ the delivered dataset on their dashboard); admin sees all.
drop policy if exists "owner or admin can view lead list requests" on public.lead_list_requests;
create policy "owner or admin can view lead list requests" on public.lead_list_requests
  for select to authenticated
  using ((select auth.uid()) = user_id
         or public.has_role((select auth.uid()), 'admin'::public.app_role));

-- Only admins fulfil (set status / delivered_database_id / admin_notes).
drop policy if exists "admin can update lead list requests" on public.lead_list_requests;
create policy "admin can update lead list requests" on public.lead_list_requests
  for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'::public.app_role))
  with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- SEC-01 grant lockdown: authenticated only (RLS scopes each op); never anon; no
-- client DELETE (admin removes via service role). COLUMN-LEVEL grants harden two
-- things a table-level grant would leave open:
--   * INSERT only the request fields — the owner can't self-set status /
--     delivered_database_id / admin_notes on insert (they default: status 'new',
--     the rest null); fulfilment is admin-only via the UPDATE policy.
--   * SELECT everything EXCEPT admin_notes — that column is internal admin triage;
--     RLS is row-level, so without this the owner would read their own row's
--     admin_notes. It's now service-role-only (no client read path, incl. admins;
--     a future admin queue UI reads it via a requireAdmin edge function).
revoke all on public.lead_list_requests from anon, authenticated;
grant insert (user_id, report_id, request_text) on public.lead_list_requests to authenticated;
grant select (id, user_id, report_id, request_text, status, delivered_database_id, created_at, updated_at)
  on public.lead_list_requests to authenticated;
grant update on public.lead_list_requests to authenticated;

-- ── Slack producer (activity bus) ──────────────────────────────────────
-- Emit an activity_events row on each new request → dispatch_activity_event →
-- slack-notify. Mirrors emit_mentor_intro_activity. PII-safe: request text is
-- clipped and no raw email is placed in the metadata body (log_activity records
-- actor_email in its own column, consistent with other producers).
create or replace function public.emit_lead_list_request_activity()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare u_email text; u_name text;
begin
  select email, raw_user_meta_data->>'full_name' into u_email, u_name
  from auth.users where id = NEW.user_id;
  perform public.log_activity(
    'lead_list.requested', 'action',
    NEW.user_id, u_email, u_name,
    'lead_list_requests', NEW.id,
    jsonb_build_object('report_id', NEW.report_id, 'request_text', left(NEW.request_text, 500)),
    'llr:' || NEW.id::text);
  return NEW;
exception when others then
  raise log 'emit_lead_list_request_activity failed: %', sqlerrm;
  return NEW;
end $$;
drop trigger if exists trg_emit_lead_list_request_activity on public.lead_list_requests;
create trigger trg_emit_lead_list_request_activity after insert on public.lead_list_requests
  for each row execute function public.emit_lead_list_request_activity();

-- Routing row DISABLED pending an ops channel: dispatch_activity_event skips
-- rows where enabled=false, so no Slack traffic until an operator sets channel_id
-- and flips enabled=true. Guarded insert (no dependency on a unique constraint).
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'lead_list.requested', '', ':inbox_tray:', 'action', true, false, false
where not exists (select 1 from public.activity_event_routing where event_type = 'lead_list.requested');
