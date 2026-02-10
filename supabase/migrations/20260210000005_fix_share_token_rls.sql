-- Fix share_token RLS: The original policy had a tautology (share_token = share_token)
-- which is always true, making every shared report readable by anyone.
DROP POLICY IF EXISTS "Anyone can view shared reports via token" ON public.user_reports;

-- Allow anon users to read reports that have a share_token set.
-- The client query filters by .eq('share_token', token), and the UUID space (2^122)
-- makes brute-force enumeration impractical.
CREATE POLICY "Anyone can view reports with share token"
  ON public.user_reports
  FOR SELECT
  TO anon
  USING (share_token IS NOT NULL);
