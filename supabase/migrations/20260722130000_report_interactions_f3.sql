-- report_v2 advisor loop (F3 / MES-218): two new report_interaction types.
--
--   'checkbox'     — action-plan step ticked/unticked (advisor progress view).
--                    SILENT: no Slack (like 'star'); persisted for the admin queue.
--   'book_request' — customer clicked "Book your advisory session" — the primary
--                    conversion action. Emits an activity event so the advisor is
--                    notified (routing ships DISABLED, per the existing pattern).
--
-- Additive + idempotent: the type CHECK is WIDENED (every existing row still
-- satisfies it — safe on live data, not destructive), the emit trigger is
-- CREATE OR REPLACE, and the routing row is a guarded insert. No data rewrite.

-- ── Widen the type CHECK (drop the auto-named inline constraint, re-add) ──────
alter table public.report_interactions drop constraint if exists report_interactions_type_check;
alter table public.report_interactions add constraint report_interactions_type_check
  check (type in ('star','scan_request','brief_request','lead_request','checkbox','book_request'));

-- ── Emit trigger: add book_request → report.session_requested ────────────────
-- checkbox is deliberately NOT emitted (silent, like star). Mirrors the original
-- emit_report_interaction_activity; security definer; PII stays in log_activity's
-- actor columns; payload is not echoed raw beyond clipped, safe fields.
create or replace function public.emit_report_interaction_activity()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  u_id uuid; u_email text; u_name text; ev text;
begin
  if NEW.type not in ('scan_request','brief_request','lead_request','book_request') then
    return NEW;
  end if;
  ev := case NEW.type
    when 'scan_request'  then 'report.scan_requested'
    when 'brief_request' then 'report.brief_requested'
    when 'lead_request'  then 'report.lead_requested'
    when 'book_request'  then 'report.session_requested'
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
      'icp', left(coalesce(NEW.payload->>'icpDescription', ''), 500),
      -- book_request carries how many items the customer shortlisted before
      -- booking (accountName/icp are empty for bookings). Kept as a jsonb number;
      -- '->' avoids a text→int cast that would fail the emit on a bad value.
      'starred_count', coalesce(NEW.payload->'starredCount', '0'::jsonb)
    ),
    'ri:' || NEW.id::text);
  return NEW;
exception when others then
  raise log 'emit_report_interaction_activity failed: %', sqlerrm;
  return NEW;
end $$;
-- trigger itself is unchanged (already AFTER INSERT FOR EACH ROW) — no re-create needed.

-- ── Routing row for the booking event (DISABLED, like the request rows) ──────
-- dispatch_activity_event skips rows where enabled=false, so no Slack traffic
-- until an operator sets channel_id (#advisor-requests) and flips enabled=true.
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'report.session_requested', '', ':calendar:', 'action', true, false, false
where not exists (
  select 1 from public.activity_event_routing r where r.event_type = 'report.session_requested'
);
