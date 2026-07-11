-- Align get_shared_report parameter name with frontend caller in src/lib/api/reportApi.ts:248
-- (uses p_share_token). Drops the p_token variant from sec_10 and recreates as p_share_token.

DROP FUNCTION IF EXISTS public.get_shared_report(uuid);

CREATE OR REPLACE FUNCTION public.get_shared_report(p_share_token uuid)
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
  WHERE share_token = p_share_token AND share_token IS NOT NULL AND status = 'completed';
$$;

REVOKE EXECUTE ON FUNCTION public.get_shared_report(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_report(uuid) TO anon, authenticated;
