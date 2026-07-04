-- Fix lemlist tables RLS: Drop public SELECT policies
-- These were marked "needed by report generator edge function" but generate-report
-- uses the service role key which bypasses RLS entirely. Public access is unnecessary
-- and exposes emails, phone numbers, names, and LinkedIn profiles.
-- Wrapped in DO blocks: safe if tables don't exist in Preview

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read lemlist contacts" ON public.lemlist_contacts;
  CREATE POLICY "Only admins can read lemlist contacts"
    ON public.lemlist_contacts
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table OR undefined_function THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read lemlist companies" ON public.lemlist_companies;
  CREATE POLICY "Only admins can read lemlist companies"
    ON public.lemlist_companies
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table OR undefined_function THEN NULL;
END $$;
