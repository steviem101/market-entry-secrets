
-- Add 28 new columns to lemlist_contacts for direct n8n mapping

-- Contact enrichment
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_url_sales_nav text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS company_website text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS contact_location text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS personal_email text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS twitter_profile text;

-- LinkedIn intelligence
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_headline text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_description text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_skills text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_job_industry text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_followers integer;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_connection_degree text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_profile_id text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS linkedin_open boolean;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS summary text;

-- CRM / campaign status
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS lead_status text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS email_status text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS priority text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS client text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS hubspot_id text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS lead_notes text;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS last_contacted_date timestamptz;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS first_contacted_date timestamptz;
ALTER TABLE public.lemlist_contacts ADD COLUMN IF NOT EXISTS last_replied_date timestamptz;
