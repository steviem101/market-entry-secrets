-- Workstream A4: replace broken "Anyone can view shared reports via valid token" policy
-- (USING share_token IS NOT NULL exposed ALL shared reports to enumeration) with a
-- SECURITY DEFINER RPC that requires the caller to supply a token.
-- Parameter renamed to p_share_token in 20260607233304_sec_11 to match frontend caller.

CREATE OR REPLACE FUNCTION public.get_shared_report(p_token uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  intake_form_id uuid,
  tier_at_generation text,
  report_json jsonb,
  sections_generated text[],
  status text,
  feedback_score integer,
  feedback_notes text,
  created_at timestamptz,
  updated_at timestamptz,
  share_token uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, intake_form_id, tier_at_generation, report_json,
         sections_generated, status, feedback_score, feedback_notes,
         created_at, updated_at, share_token
  FROM public.user_reports
  WHERE share_token = p_token AND share_token IS NOT NULL AND status = 'completed';
$$;

REVOKE EXECUTE ON FUNCTION public.get_shared_report(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_report(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view shared reports via valid token" ON public.user_reports;
