-- MES-193 re-gate verification — READ-ONLY, no auth, no service-role writes.
--
-- Part A (runnable anywhere, anytime): simulates the get_tier_gated_report /
-- get_shared_report strip DECISION (map membership + tier-index comparison) using
-- the exact same expressions the RPCs use, against all 11 sections at each tier.
-- Confirms the gating map produces the approved matrix without touching any report.
--
-- Expected result:
--   free   -> stripped: first_customers, lead_list, mentor_recommendations
--   growth -> stripped: first_customers, lead_list
--   scale  -> stripped: (none)
-- i.e. free sees 8/11 (incl. swot_analysis, competitor_landscape,
-- investor_recommendations); growth sees 10/11; scale sees all.
with map as (
  select '{"mentor_recommendations":"growth","first_customers":"scale","lead_list":"scale"}'::jsonb m
),
hier as (select array['free','growth','scale','enterprise'] h),
sections as (
  select unnest(array[
    'executive_summary','swot_analysis','competitor_landscape','first_customers','service_providers',
    'mentor_recommendations','investor_recommendations','events_resources','action_plan','setup_compliance','lead_list'
  ]) sk
),
tiers as (select unnest(array['free','growth','scale']) t)
select t.t as tier,
  coalesce(string_agg(case when (m.m ? s.sk)
        and array_position(h.h, t.t) < array_position(h.h, m.m->>s.sk) then s.sk end,
      ', ' order by s.sk), '(none)') as stripped
from tiers t cross join sections s cross join map m cross join hier h
group by t.t
order by array_position(array['free','growth','scale'], t.t);

-- Part B (POST-DEPLOY acceptance — run manually as authenticated test accounts,
-- user JWT only, never service-role). For a report you own, assert the payload:
--   As FREE:   get_tier_gated_report(<report_id>) -> sections.first_customers,
--              .lead_list, .mentor_recommendations have visible:false and NO content;
--              swot_analysis / competitor_landscape / investor_recommendations
--              have content (visible).
--   As GROWTH: only first_customers + lead_list stripped.
--   As SCALE:  nothing stripped.
--   Public share: get_shared_report(<share_token>) matches the FREE payload.
-- (Run these in the app's network panel or via supabase-js with each test account's
-- JWT — they are RLS/ownership-scoped and must not use the service role.)
