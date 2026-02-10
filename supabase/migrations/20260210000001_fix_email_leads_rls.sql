-- Fix email_leads RLS: Drop overly-permissive SELECT policy
-- Previously USING (true) allowed anyone (including anon) to read all captured emails
DROP POLICY IF EXISTS "Authenticated users can view email leads" ON public.email_leads;

-- Only admins can view email leads
CREATE POLICY "Only admins can view email leads"
  ON public.email_leads
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
