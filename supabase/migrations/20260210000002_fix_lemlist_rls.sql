-- Fix lemlist tables RLS: Drop public SELECT policies
-- These were marked "needed by report generator edge function" but generate-report
-- uses the service role key which bypasses RLS entirely. Public access is unnecessary
-- and exposes emails, phone numbers, names, and LinkedIn profiles.

DROP POLICY IF EXISTS "Public can read lemlist contacts" ON public.lemlist_contacts;
DROP POLICY IF EXISTS "Public can read lemlist companies" ON public.lemlist_companies;

-- Admin-only read access for dashboard use
CREATE POLICY "Only admins can read lemlist contacts"
  ON public.lemlist_contacts
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can read lemlist companies"
  ON public.lemlist_companies
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
