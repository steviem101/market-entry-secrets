-- Fix lead_submissions: Enable RLS (was never enabled — table fully open)
-- Contains sensitive PII: email, phone, sector, target_market, company_website
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

-- Keep public INSERT (form submission still needs to work)
CREATE POLICY "Anyone can submit lead data"
  ON public.lead_submissions
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "Only admins can view lead submissions"
  ON public.lead_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
