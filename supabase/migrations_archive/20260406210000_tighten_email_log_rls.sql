-- Tighten email_log INSERT policy: only service role can insert (not any authenticated user)
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_log;

CREATE POLICY "System can insert email logs"
  ON public.email_log
  FOR INSERT
  WITH CHECK (false);
