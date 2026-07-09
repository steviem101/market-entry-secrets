-- Enable Slack routing for lead-list requests (P1-D follow-up).
--
-- The lead_list_requests migration (20260710160000) seeded the
-- activity_event_routing row DISABLED with an empty channel_id, pending an ops
-- channel. dispatch_activity_event() skips rows where enabled=false, so no Slack
-- traffic fired. This sets the destination channel and flips enabled=true so a
-- new custom lead-list request posts to Slack in realtime.
--
-- Idempotent: a plain UPDATE keyed on event_type; re-running is a no-op once the
-- values match. Only touches the single routing row — no schema change.
update public.activity_event_routing
set channel_id = 'C0BACH1NR2S',
    enabled    = true
where event_type = 'lead_list.requested';
