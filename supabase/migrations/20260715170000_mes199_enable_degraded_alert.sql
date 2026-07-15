-- MES-199 (T17) — enable the DEGRADED report-run Slack alert.
--
-- #456 (migration 20260715150000) seeded the `report.quality.degraded` routing
-- row DISABLED, with the documented enable path: deploy the updated slack-notify
-- (which emits the event for non-test degraded runs) + confirm a forced-degraded
-- run posts, THEN flip. This migration is that flip.
--
-- Idempotent + preview-safe: on a fresh preview DB the #456 seed no-ops (there's
-- no `report.quality` row to copy the channel from), so the `report.quality.degraded`
-- row simply doesn't exist and this UPDATE touches zero rows. On prod the row
-- exists (seeded disabled) and this enables it. Reversible: set enabled = false.
update public.activity_event_routing
  set enabled = true
  where event_type = 'report.quality.degraded';
