-- report_v2 renderer — shortlist stars + request hooks (tickets 13–14).
--
-- One event-log table for the four report_v2 interactions (DECISIONS #5,
-- build-decision 2, owner-approved 2026-07-18): shortlist stars and the
-- scan / brief / lead request hooks, keyed by the report. Event-log model —
-- a star toggle is a NEW row (payload.on true/false); current state is the
-- latest event per entity — so there is no client UPDATE/DELETE path.
--
-- Owner-scoped via the report's owner (no user_id column per the confirmed
-- contract shape; ownership is derived through user_reports). Client-writable
-- INSERT is a deliberate SEC-01 exception, same as the submission funnels.
--
-- Additive + idempotent (CREATE ... IF NOT EXISTS / OR REPLACE / DROP ... IF
-- EXISTS); safe to replay against an empty preview DB. No data rewrite, no
-- destructive op.

create table if not exists public.report_interactions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.user_reports(id) on delete cascade,
  type text not null check (type in ('star','scan_request','brief_request','lead_request')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_report_interactions_report on public.report_interactions(report_id);
-- latest-event-per-entity lookups for the star state.
create index if not exists idx_report_interactions_report_type on public.report_interactions(report_id, type);

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.report_interactions enable row level security;

-- The report owner records interactions on their OWN report (no anon — tied to
-- the signed-in owner; ownership derived via user_reports).
drop policy if exists "owner can insert own report interaction" on public.report_interactions;
create policy "owner can insert own report interaction" on public.report_interactions
  for insert to authenticated
  with check (exists (
    select 1 from public.user_reports r
    where r.id = report_id and r.user_id = (select auth.uid())
  ));

-- Owner sees their own report's interactions (to restore shortlist state);
-- admin sees all.
drop policy if exists "owner or admin can view report interactions" on public.report_interactions;
create policy "owner or admin can view report interactions" on public.report_interactions
  for select to authenticated
  using (exists (
    select 1 from public.user_reports r
    where r.id = report_id and r.user_id = (select auth.uid())
  ) or public.has_role((select auth.uid()), 'admin'::public.app_role));

-- SEC-01 grant lockdown: authenticated only (RLS scopes each op); never anon;
-- no client UPDATE/DELETE (event-log — nothing mutates). Column-level INSERT so
-- the client can only set report_id/type/payload (id/created_at default).
revoke all on public.report_interactions from anon, authenticated;
grant insert (report_id, type, payload) on public.report_interactions to authenticated;
grant select (id, report_id, type, payload, created_at) on public.report_interactions to authenticated;

-- ── Slack producer (activity bus) ──────────────────────────────────────
-- Emit an activity_events row for REQUEST interactions only (stars are too
-- noisy) → dispatch_activity_event → slack-notify. Mirrors
-- emit_lead_list_request_activity. Security definer; PII stays in log_activity's
-- own actor columns; payload is not echoed raw beyond a clipped ICP description.
create or replace function public.emit_report_interaction_activity()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  u_id uuid; u_email text; u_name text; ev text;
begin
  if NEW.type not in ('scan_request','brief_request','lead_request') then
    return NEW;
  end if;
  ev := case NEW.type
    when 'scan_request'  then 'report.scan_requested'
    when 'brief_request' then 'report.brief_requested'
    when 'lead_request'  then 'report.lead_requested'
  end;
  select r.user_id, u.email, u.raw_user_meta_data->>'full_name'
    into u_id, u_email, u_name
  from public.user_reports r join auth.users u on u.id = r.user_id
  where r.id = NEW.report_id;
  perform public.log_activity(
    ev, 'action',
    u_id, u_email, u_name,
    'report_interactions', NEW.id,
    jsonb_build_object(
      'report_id', NEW.report_id,
      'account_name', left(coalesce(NEW.payload->>'accountName', ''), 200),
      'icp', left(coalesce(NEW.payload->>'icpDescription', ''), 500)
    ),
    'ri:' || NEW.id::text);
  return NEW;
exception when others then
  raise log 'emit_report_interaction_activity failed: %', sqlerrm;
  return NEW;
end $$;
drop trigger if exists trg_emit_report_interaction_activity on public.report_interactions;
create trigger trg_emit_report_interaction_activity after insert on public.report_interactions
  for each row execute function public.emit_report_interaction_activity();

-- Routing rows DISABLED pending an ops channel: dispatch_activity_event skips
-- rows where enabled=false, so no Slack traffic until an operator sets
-- channel_id and flips enabled=true. Guarded inserts (no unique-constraint dep).
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select v.event_type, '', v.emoji, 'action', true, false, false
from (values
  ('report.scan_requested',  ':mag:'),
  ('report.brief_requested', ':clipboard:'),
  ('report.lead_requested',  ':inbox_tray:')
) as v(event_type, emoji)
where not exists (
  select 1 from public.activity_event_routing r where r.event_type = v.event_type
);
