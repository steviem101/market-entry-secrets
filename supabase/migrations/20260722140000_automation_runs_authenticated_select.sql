-- MES-206 dashboard hotfix: grant authenticated SELECT on automation_runs.
--
-- /admin/agents' loop-health hook queries automation_runs DIRECTLY (not via the agent_proposals
-- view). The table has the "Admins read automation_runs" RLS policy, but authenticated was never
-- granted SELECT (SEC-01 default lockdown), so the grant layer denies the query before RLS runs —
-- admins saw "Could not load loop health" while the proposals queue (whose sources were granted in
-- 20260720100200) loaded fine. Grant SELECT; the RLS policy still restricts rows to admins, so
-- non-admin authenticated users continue to see zero rows. Same pattern as the staging-table
-- grants in 20260720100200. Additive + reversible.
-- Rollback: supabase/rollback/20260722140000_automation_runs_authenticated_select_revert.sql

grant select on public.automation_runs to authenticated;
