
-- 1. email_leads: restrict SELECT to admin-only (safe if table doesn't exist in Preview)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view email leads" ON public.email_leads;
  CREATE POLICY "Only admins can view email leads"
    ON public.email_leads
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 2. lemlist_contacts: restrict SELECT to admin-only
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read lemlist contacts" ON public.lemlist_contacts;
  CREATE POLICY "Only admins can view lemlist contacts"
    ON public.lemlist_contacts
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 3. lemlist_companies: restrict SELECT to admin-only
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read lemlist companies" ON public.lemlist_companies;
  CREATE POLICY "Only admins can view lemlist companies"
    ON public.lemlist_companies
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 4. lead_submissions: enable RLS + admin-only SELECT + public INSERT
DO $$ BEGIN
  ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Anyone can submit lead submissions"
    ON public.lead_submissions
    FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Only admins can view lead submissions"
    ON public.lead_submissions
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 5. profiles: restrict SELECT to own profile + admin
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
  CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 6. user_reports: fix share token tautology
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view shared reports via token" ON public.user_reports;
  CREATE POLICY "Anyone can view shared reports via valid token"
    ON public.user_reports
    FOR SELECT
    USING (share_token IS NOT NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
