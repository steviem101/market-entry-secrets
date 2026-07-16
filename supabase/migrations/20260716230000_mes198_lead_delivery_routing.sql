-- MES-198 (T7) — activity routing seed for automatic Scale lead delivery.
--
-- On Scale report completion, generate-report (flag LEAD_DELIVERY_ENABLED)
-- grants the report-matched lead_databases to the buyer via lead_database_purchases
-- (existing buyer-scoped RLS then serves the records) and surfaces them in the
-- member hub as delivered lead_list_requests rows. It also emits a
-- 'lead_list.delivered' activity event for ops visibility.
--
-- This migration ONLY seeds the routing row for that event — additive, idempotent,
-- and DISABLED by default (dispatch_activity_event skips enabled=false), exactly
-- like the 'lead_list.requested' seed in 20260710160000. No schema/RLS/grant
-- change: the delivery reuses lead_database_purchases (owner-scoped SELECT, def
-- 20260710130000) and lead_list_requests (owner-scoped, def 20260710160000);
-- delivered datasets are the existing public catalog rows (no private copies),
-- so there is no new read surface to gate.
--
-- Safe on an empty preview replay (guarded insert, no unique-constraint dependency).

insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'lead_list.delivered', '', ':package:', 'action', true, false, false
where not exists (
  select 1 from public.activity_event_routing where event_type = 'lead_list.delivered'
);
