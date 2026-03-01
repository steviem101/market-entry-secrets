-- CRITICAL FIX: Replace overly-permissive share token RLS policy.
--
-- The old policy "Anyone can view reports with share token" allowed anon users
-- to read ALL reports that have a non-null share_token, regardless of whether
-- the caller actually knows the token. An attacker could enumerate report IDs.
--
-- Fix: Create a SECURITY DEFINER function that takes a token as parameter and
-- returns only the matching report. Remove the open anon SELECT policy.

-- 1. Drop the overly-permissive anon SELECT policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view reports with share token" ON public.user_reports;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 2. Create a secure function to fetch a report by share token.
--    SECURITY DEFINER runs as the function owner (postgres), bypassing RLS.
--    This is safe because it only returns the single row matching the token.
CREATE OR REPLACE FUNCTION public.get_shared_report(p_share_token TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  intake_form_id UUID,
  tier_at_generation TEXT,
  report_json JSONB,
  sections_generated TEXT[],
  status TEXT,
  feedback_score INTEGER,
  feedback_notes TEXT,
  share_token TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    r.id, r.user_id, r.intake_form_id,
    r.tier_at_generation, r.report_json, r.sections_generated,
    r.status, r.feedback_score, r.feedback_notes,
    r.share_token, r.created_at, r.updated_at
  FROM public.user_reports r
  WHERE r.share_token = p_share_token
  LIMIT 1;
$$;

-- Grant anon + authenticated access to the function
GRANT EXECUTE ON FUNCTION public.get_shared_report(TEXT) TO anon, authenticated;
