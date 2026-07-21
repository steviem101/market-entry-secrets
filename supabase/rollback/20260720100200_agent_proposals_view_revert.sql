-- Revert 20260720100200_agent_proposals_view.sql
drop view if exists public.agent_proposals;
drop policy if exists "Admins read trade_agencies_enrichment_staging" on public.trade_agencies_enrichment_staging;
-- The authenticated SELECT grants below were added to make the security_invoker view readable;
-- revoke them to restore the prior service-role-read-only posture (RLS admin-read policies remain).
revoke select on public.report_quality_proposals from authenticated;
revoke select on public.ecosystem_import_candidates from authenticated;
