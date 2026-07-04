
-- ============================================
-- Table: lemlist_companies
-- ============================================
CREATE TABLE public.lemlist_companies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lemlist_id text NOT NULL UNIQUE,
  name text NOT NULL,
  domain text,
  industry text,
  size text,
  location text,
  linkedin_url text,
  fields jsonb DEFAULT '{}'::jsonb,
  owner_id text,
  lemlist_created_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for lemlist_companies
CREATE INDEX idx_lemlist_companies_industry ON public.lemlist_companies (industry);
CREATE INDEX idx_lemlist_companies_location ON public.lemlist_companies (location);
CREATE INDEX idx_lemlist_companies_domain ON public.lemlist_companies (domain);

-- Enable RLS
ALTER TABLE public.lemlist_companies ENABLE ROW LEVEL SECURITY;

-- Public read-only access (needed by report generator edge function)
CREATE POLICY "Public can read lemlist companies"
  ON public.lemlist_companies
  FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_lemlist_companies_updated_at
  BEFORE UPDATE ON public.lemlist_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Table: lemlist_contacts
-- ============================================
CREATE TABLE public.lemlist_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lemlist_id text NOT NULL UNIQUE,
  company_id uuid REFERENCES public.lemlist_companies(id) ON DELETE SET NULL,
  full_name text,
  first_name text,
  last_name text,
  email text,
  job_title text,
  phone text,
  linkedin_url text,
  industry text,
  lifecycle_status text,
  campaigns jsonb DEFAULT '[]'::jsonb,
  fields jsonb DEFAULT '{}'::jsonb,
  owner_id text,
  lemlist_created_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for lemlist_contacts
CREATE INDEX idx_lemlist_contacts_company_id ON public.lemlist_contacts (company_id);
CREATE INDEX idx_lemlist_contacts_industry ON public.lemlist_contacts (industry);
CREATE INDEX idx_lemlist_contacts_email ON public.lemlist_contacts (email);
CREATE INDEX idx_lemlist_contacts_lifecycle ON public.lemlist_contacts (lifecycle_status);

-- Enable RLS
ALTER TABLE public.lemlist_contacts ENABLE ROW LEVEL SECURITY;

-- Public read-only access (needed by report generator edge function)
CREATE POLICY "Public can read lemlist contacts"
  ON public.lemlist_contacts
  FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_lemlist_contacts_updated_at
  BEFORE UPDATE ON public.lemlist_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
