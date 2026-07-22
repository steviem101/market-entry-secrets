-- Revert 20260722140000_automation_runs_authenticated_select.sql
revoke select on public.automation_runs from authenticated;
