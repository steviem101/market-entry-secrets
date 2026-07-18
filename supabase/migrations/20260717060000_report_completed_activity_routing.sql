-- Founder follow-up loop (conversion plan step 3, 2026-07-17): route a
-- `report.completed` activity event to Slack so every finished report can get a
-- personal founder follow-up (see docs/runbooks/founder-followup-loop.md).
--
-- The producer is generate-report (log_activity after the completion email —
-- deployed with this change via the edge-functions workflow). This migration
-- only seeds the routing row, DISABLED and with no channel: dispatch_activity_event
-- skips disabled rows, so no Slack traffic occurs until an operator sets
-- channel_id and flips enabled=true (runbook step 1). Mirrors the guarded-insert
-- pattern of lead_list.requested / concierge_intro.requested.
--
-- Additive + idempotent; no schema change, no destructive op.

insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'report.completed', '', ':page_facing_up:', 'action', true, false, false
where not exists (select 1 from public.activity_event_routing where event_type = 'report.completed');
