-- MES-198 (T7 follow-up) — stop auto-delivered rows firing a phantom
-- `lead_list.requested` activity event.
--
-- Wave-1 code-review finding #3. T7 auto-delivery inserts a lead_list_requests
-- row with status='delivered' (generate-report). That INSERT trips
-- trg_emit_lead_list_request_activity (20260710160000) → emit_lead_list_request_
-- activity() → log_activity('lead_list.requested', …). That event's Slack routing
-- is ENABLED on prod while the intended `lead_list.delivered` routing is disabled,
-- so once LEAD_DELIVERY_ENABLED flips, every delivered dataset would post a
-- phantom "new custom lead-list request" ping to ops — and the real delivery
-- event would be silent.
--
-- Fix: guard the emit INSIDE the trigger function with an early return for
-- delivered rows, so only genuine NEW requests emit. This is a pure
-- CREATE OR REPLACE FUNCTION — the trigger itself is untouched (no DROP), the
-- signature/attributes (returns trigger, security definer, search_path=public)
-- are preserved verbatim from 20260710160000, and it is idempotent + fully
-- reversible (revert = drop the guard). Non-destructive: no schema/data change.
--
-- `status` defaults to 'new' (verified on prod) and the user-facing request path
-- inserts 'new', so real requests still emit. `NEW.status = 'delivered'` is NULL-
-- safe here: a NULL status (shouldn't happen given the default) is not equal to
-- 'delivered', so it does NOT early-return and still emits — matching new-request
-- semantics.
--
-- NOTE: this only suppresses the WRONG event. If ops later wants a Slack ping ON
-- delivery, enable the `lead_list.delivered` routing row separately (set a
-- channel_id + enabled=true in activity_event_routing) — that is an ops decision,
-- not part of this fix.

create or replace function public.emit_lead_list_request_activity()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare u_email text; u_name text;
begin
  -- Finding #3: auto-delivered rows (T7) must not emit `lead_list.requested`.
  if NEW.status = 'delivered' then
    return NEW;
  end if;
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
