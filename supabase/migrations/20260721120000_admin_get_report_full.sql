-- Admin-only full-report read path for the Admin Reports console (quality review).
--
-- Context: report content (user_reports.report_json) is locked at the DB level
-- by MES-38 — SELECT on the column is revoked from `authenticated`, and the two
-- read RPCs (get_tier_gated_report, get_shared_report) hard-check ownership /
-- share_token and return NULL to everyone else. That is the customer paywall
-- boundary (#38) and is deliberately NOT touched here.
--
-- This adds a SEPARATE SECURITY DEFINER function that returns the FULL, ungated
-- report_json ONLY to admins, so quality reviewers see exactly what was
-- generated (every section, no tier stripping) without weakening the
-- owner-scoped gating path. Admins already have row-level SELECT on user_reports
-- (baseline policy "Users can view own reports" branches on has_role(...,'admin'))
-- but cannot read report_json off the table — this closes that read gap for the
-- admin surface without a broad column grant.
--
-- Self-guarding: the function checks has_role(auth.uid(),'admin') itself, so the
-- grant to `authenticated` cannot leak content to a non-admin caller.

CREATE OR REPLACE FUNCTION public.get_report_admin(p_report_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report_json jsonb;
BEGIN
  -- Admin-only. Non-admins (including the report owner) get NULL here and must
  -- use the tier-gated owner path instead.
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NULL;
  END IF;

  SELECT report_json INTO v_report_json
  FROM public.user_reports
  WHERE id = p_report_id;

  RETURN v_report_json;
END;
$function$;

-- Never anon/PUBLIC; authenticated is fine because the body self-guards on admin.
REVOKE EXECUTE ON FUNCTION public.get_report_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_report_admin(uuid) TO authenticated, service_role;
