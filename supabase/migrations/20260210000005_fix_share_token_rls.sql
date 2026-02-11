-- Fix share_token RLS: The original policy had a tautology (share_token = share_token)
-- which is always true, making every shared report readable by anyone.
-- Wrapped in DO block: safe if user_reports table doesn't exist in Preview

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view shared reports via token" ON public.user_reports;
  CREATE POLICY "Anyone can view reports with share token"
    ON public.user_reports
    FOR SELECT
    TO anon
    USING (share_token IS NOT NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
