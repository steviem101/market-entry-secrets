-- MES-38 (audit R1 / backlog T1): enforce report content gating server-side.
--
-- Problem: user_reports.report_json stores ALL generated sections (premium
-- prose included, just marked visible:false), and the owner-scoped SELECT
-- policy plus the broad `authenticated` SELECT grant let a free-tier owner
-- read it wholesale from DevTools, bypassing the get_tier_gated_report RPC.
-- The RPC was a convention, not a boundary.
--
-- Fix: column-level lockdown. Revoke SELECT on user_reports from client
-- roles, then re-grant every column EXCEPT report_json to `authenticated`.
-- The SECURITY DEFINER RPCs (get_tier_gated_report, get_shared_report) run
-- as the table owner and are unaffected, making them the only read paths
-- for report content. RLS policies are unchanged (owner/admin row scoping
-- still applies on top of these grants).
--
-- APPROVAL-GATED (RLS/grants, prod migration): prepared in the MES-38 PR;
-- a human applies it per docs/migrations.md and re-runs the Supabase
-- security advisors afterwards.
--
-- Post-apply verification:
--   1. As a free-tier owner in DevTools:
--      supabase.from('user_reports').select('report_json') -> permission error.
--   2. /my-reports network tab carries no report_json.
--   3. Owner report view still renders (RPC path) and tier upgrade unlocks
--      sections without re-generation.
--   4. Shared view via get_shared_report unaffected.

-- 1) Drop broad client SELECT grants. anon was already blocked by RLS
--    (owner-scoped policy) but held a default SELECT grant; remove it too.
REVOKE SELECT ON TABLE public.user_reports FROM anon;
REVOKE SELECT ON TABLE public.user_reports FROM authenticated;

-- 2) Re-grant column-level SELECT on everything except report_json.
--    Column list mirrors 20260704095538_remote_baseline.sql; if a later
--    migration adds a client-visible column, grant it there explicitly.
GRANT SELECT (
  id,
  user_id,
  intake_form_id,
  tier_at_generation,
  sections_generated,
  status,
  feedback_score,
  feedback_notes,
  created_at,
  updated_at,
  share_token,
  generation_time_ms,
  total_matches,
  firecrawl_ops,
  firecrawl_scrape_ok,
  perplexity_ok,
  polish_applied
) ON public.user_reports TO authenticated;
