-- MES-199 (T17) — Slack alert routing for DEGRADED report runs.
--
-- Investigation (2026-07-15): ~20% of completed reports are flagged
-- report_quality.degraded, and 30 of 33 are driven SOLELY by a failed company
-- website scrape (Firecrawl); tables_hit / Perplexity / utilization are healthy.
-- This wires a real-time, cause-labelled Slack ALERT for degraded runs so live
-- degradations page ops. The edge function (slack-notify/reportQuality.ts) emits
-- a `report.quality.degraded` activity_event ONLY for non-test users (MES-190
-- is_test) so founder/no-website test runs never fire; this migration just seeds
-- its routing.
--
-- Seeds a DISABLED routing row (operator flips it on after a forced-degraded
-- verification), reusing the #report-quality channel from the existing
-- `report.quality` card row. realtime + mention = true so a genuine live
-- degradation pings the channel — the per-report `report.quality` card stays
-- mention=false; this is the page. Idempotent; no-op on a fresh DB with no
-- `report.quality` row (preview replay).
--
--   Enable path (after `supabase functions deploy slack-notify` + a forced
--   degraded run confirms the alert posts):
--     update public.activity_event_routing set enabled = true where event_type = 'report.quality.degraded';
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'report.quality.degraded', channel_id, ':warning:', 'error', true, true, false
from public.activity_event_routing where event_type = 'report.quality' limit 1
on conflict (event_type) do nothing;
