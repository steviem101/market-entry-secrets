-- Revert of 20260722160000_intel_report_insights_rpc.sql — drops the report insight retriever.
-- Read-only function, no data written; safe to drop. generate-report tolerates its absence only
-- when REPORT_INSIGHTS_ENABLED is off, so disable that flag before reverting on a live deploy.
drop function if exists public.match_report_insights(text[], text[], text, text, text, integer);
