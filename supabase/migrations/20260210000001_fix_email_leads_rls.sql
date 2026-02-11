-- Fix email_leads RLS: Drop overly-permissive SELECT policy
-- Previously USING (true) allowed anyone (including anon) to read all captured emails
-- Wrapped in DO block: safe if email_leads table doesn't exist in Preview
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view email leads" ON public.email_leads;
  CREATE POLICY "Only admins can view email leads"
    ON public.email_leads
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table OR undefined_function THEN NULL;
END $$;
