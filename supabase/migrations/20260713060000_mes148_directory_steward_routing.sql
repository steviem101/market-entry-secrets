-- MES-148 Phase 5 (P5-3b): disabled routing seed for the nightly directory steward.
--
-- Seeds a DISABLED activity_event_routing row so the operator's enable path is a
-- single UPDATE (after setting the DIRECTORY_STEWARD_ENABLED edge secret). Reuses the
-- existing #report-quality channel. Idempotent; no-op on a fresh DB with no
-- 'report.quality' row (the steward self-gates off until a routing row exists AND
-- DIRECTORY_STEWARD_ENABLED=on — belt-and-suspenders because it writes to live rows).
--
--   Enable path (both required):
--     supabase secrets set DIRECTORY_STEWARD_ENABLED=on --project-ref xhziwveaiuhzdoutpgrh
--     update public.activity_event_routing set enabled = true where event_type = 'directory.steward';
--
-- Additive + reversible (delete the routing row). No schema change.

insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'directory.steward', channel_id, ':stethoscope:', 'info', false, false, false
from public.activity_event_routing where event_type = 'report.quality' limit 1
on conflict (event_type) do nothing;
