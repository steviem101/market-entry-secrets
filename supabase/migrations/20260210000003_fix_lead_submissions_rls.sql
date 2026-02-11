-- Fix lead_submissions: Enable RLS (was never enabled — table fully open)
-- Contains sensitive PII: email, phone, sector, target_market, company_website
-- Wrapped in DO block: safe if table doesn't exist in Preview

DO $$ BEGIN
  ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Anyone can submit lead data"
    ON public.lead_submissions
    FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Only admins can view lead submissions"
    ON public.lead_submissions
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table OR undefined_function THEN NULL;
END $$;
