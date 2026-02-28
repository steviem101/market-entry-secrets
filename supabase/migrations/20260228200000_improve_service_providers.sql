-- ============================================================
-- Migration: Improve Service Providers
-- Adds rich profile data, SEO slugs, filtering columns,
-- categories table, reviews table, contacts table,
-- indexes, and a report-builder view.
-- ============================================================

-- ============================================================
-- Part 1: Add columns to service_providers
-- ============================================================

-- Slug for URL routing
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Structured data columns (new, alongside existing logo/website/contact/founded/employees)
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS team_size_range TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Structured location
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_state TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'Australia';

-- Classification & status
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS category_slug TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Array columns for enhanced filtering
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS markets_served TEXT[],
  ADD COLUMN IF NOT EXISTS support_types TEXT[],
  ADD COLUMN IF NOT EXISTS sectors TEXT[],
  ADD COLUMN IF NOT EXISTS engagement_model TEXT[],
  ADD COLUMN IF NOT EXISTS company_size_focus TEXT[];

-- Pricing indicator
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS price_range TEXT;

-- SEO fields
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Analytics
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- Part 2: Backfill slug from name
-- ============================================================

UPDATE public.service_providers
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM(name),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL AND name IS NOT NULL;

-- Handle duplicate slugs by appending a suffix
DO $$
DECLARE
  rec RECORD;
  new_slug TEXT;
  counter INTEGER;
BEGIN
  FOR rec IN
    SELECT id, slug
    FROM public.service_providers
    WHERE slug IN (
      SELECT slug FROM public.service_providers
      GROUP BY slug HAVING COUNT(*) > 1
    )
    ORDER BY created_at ASC
  LOOP
    -- Check if this slug is already unique (first occurrence keeps the original)
    IF (SELECT COUNT(*) FROM public.service_providers WHERE slug = rec.slug AND id != rec.id AND created_at < (SELECT created_at FROM public.service_providers WHERE id = rec.id)) > 0 THEN
      counter := 2;
      LOOP
        new_slug := rec.slug || '-' || counter;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.service_providers WHERE slug = new_slug);
        counter := counter + 1;
      END LOOP;
      UPDATE public.service_providers SET slug = new_slug WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- Part 3: Backfill new columns from existing data
-- ============================================================

UPDATE public.service_providers
SET
  logo_url = COALESCE(logo_url, logo),
  website_url = COALESCE(website_url, website),
  contact_email = CASE
    WHEN contact_email IS NOT NULL THEN contact_email
    WHEN contact IS NOT NULL AND contact LIKE '%@%' THEN contact
    ELSE NULL
  END,
  contact_phone = CASE
    WHEN contact_phone IS NOT NULL THEN contact_phone
    WHEN contact IS NOT NULL AND contact ~ '^\+?[0-9\s\-\(\)]+$' THEN contact
    ELSE NULL
  END,
  founded_year = CASE
    WHEN founded_year IS NOT NULL THEN founded_year
    WHEN founded ~ '^\d{4}$' THEN CAST(founded AS INTEGER)
    ELSE NULL
  END,
  team_size_range = COALESCE(team_size_range, employees);

-- Parse location into structured parts (best effort: "City, State" or "City, State, Country")
UPDATE public.service_providers
SET
  location_city = CASE
    WHEN location_city IS NULL AND location IS NOT NULL
    THEN TRIM(split_part(location, ',', 1))
    ELSE location_city
  END,
  location_state = CASE
    WHEN location_state IS NULL AND location IS NOT NULL AND position(',' IN location) > 0
    THEN TRIM(split_part(location, ',', 2))
    ELSE location_state
  END;

-- Default markets_served to Australia if empty
UPDATE public.service_providers
SET markets_served = ARRAY['australia']
WHERE markets_served IS NULL OR array_length(markets_served, 1) IS NULL;

-- ============================================================
-- Part 4: Create service_provider_categories table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.service_provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed categories
INSERT INTO public.service_provider_categories (slug, name, description, icon, display_order) VALUES
  ('legal-services', 'Legal Services', 'Corporate law, employment, IP, compliance', 'Scale', 1),
  ('accounting-tax', 'Accounting & Tax', 'Tax advisory, bookkeeping, CFO services', 'Calculator', 2),
  ('recruitment-hr', 'Recruitment & HR', 'Talent acquisition, HR consulting, payroll', 'Users', 3),
  ('strategy-consulting', 'Strategy Consulting', 'Market entry strategy, business development', 'Lightbulb', 4),
  ('technology-it', 'Technology & IT', 'Software development, IT infrastructure, cloud', 'Code', 5),
  ('marketing-pr', 'Marketing & PR', 'Digital marketing, brand, communications', 'Megaphone', 6),
  ('finance-investment', 'Finance & Investment', 'Venture capital, banking, funding advisory', 'Landmark', 7),
  ('real-estate-workspace', 'Real Estate & Workspace', 'Office space, coworking, property', 'Building', 8),
  ('trade-logistics', 'Trade & Logistics', 'Import/export, supply chain, customs', 'Truck', 9),
  ('government-trade-bodies', 'Government & Trade Bodies', 'Trade agencies, chambers of commerce', 'Building2', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Part 5: Create service_provider_reviews table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.service_provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_company TEXT,
  reviewer_country TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_provider_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
  ON public.service_provider_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage reviews"
  ON public.service_provider_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- Part 6: Create service_provider_contacts junction table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.service_provider_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_provider_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read provider contacts"
  ON public.service_provider_contacts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage provider contacts"
  ON public.service_provider_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- Part 7: Indexes
-- ============================================================

-- Slug lookup
CREATE INDEX IF NOT EXISTS idx_sp_slug ON public.service_providers(slug);

-- Category filter
CREATE INDEX IF NOT EXISTS idx_sp_category_slug ON public.service_providers(category_slug);

-- Boolean filters
CREATE INDEX IF NOT EXISTS idx_sp_is_verified ON public.service_providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_sp_is_featured ON public.service_providers(is_featured);
CREATE INDEX IF NOT EXISTS idx_sp_is_active ON public.service_providers(is_active);

-- Array columns (GIN)
CREATE INDEX IF NOT EXISTS idx_sp_markets_served ON public.service_providers USING GIN (markets_served);
CREATE INDEX IF NOT EXISTS idx_sp_support_types ON public.service_providers USING GIN (support_types);
CREATE INDEX IF NOT EXISTS idx_sp_sectors ON public.service_providers USING GIN (sectors);
CREATE INDEX IF NOT EXISTS idx_sp_engagement_model ON public.service_providers USING GIN (engagement_model);
CREATE INDEX IF NOT EXISTS idx_sp_company_size_focus ON public.service_providers USING GIN (company_size_focus);

-- Full-text search: wrap to_tsvector in an IMMUTABLE function so it can be used in an index expression
CREATE OR REPLACE FUNCTION public.sp_search_text(
  p_name TEXT, p_description TEXT, p_tagline TEXT, p_services TEXT[]
) RETURNS tsvector
LANGUAGE sql IMMUTABLE AS $$
  SELECT to_tsvector('english',
    COALESCE(p_name, '') || ' ' ||
    COALESCE(p_description, '') || ' ' ||
    COALESCE(p_tagline, '') || ' ' ||
    COALESCE(array_to_string(p_services, ' '), '')
  );
$$;

CREATE INDEX IF NOT EXISTS idx_sp_fts ON public.service_providers
  USING GIN (
    public.sp_search_text(name, description, tagline, services)
  );

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_sp_reviews_provider ON public.service_provider_reviews(provider_id);

-- Contacts index
CREATE INDEX IF NOT EXISTS idx_sp_contacts_provider ON public.service_provider_contacts(provider_id);

-- ============================================================
-- Part 8: Report view
-- ============================================================

CREATE OR REPLACE VIEW public.service_providers_report_view AS
SELECT
  sp.id,
  sp.name,
  sp.slug,
  sp.tagline,
  sp.description,
  sp.logo_url,
  sp.website_url,
  sp.contact_email,
  sp.location,
  sp.location_city,
  sp.location_state,
  sp.location_country,
  sp.founded_year,
  sp.team_size_range,
  sp.is_verified,
  sp.is_featured,
  sp.services,
  sp.markets_served,
  sp.sectors,
  sp.support_types,
  sp.engagement_model,
  sp.company_size_focus,
  sp.price_range,
  sp.category_slug,
  spc.name AS category_name,
  sp.view_count,
  sp.last_updated_at,
  (SELECT json_agg(json_build_object('name', c.full_name, 'role', c.role, 'email', c.email))
   FROM public.service_provider_contacts c WHERE c.provider_id = sp.id) AS contacts,
  (SELECT ROUND(AVG(r.rating)::numeric, 1)
   FROM public.service_provider_reviews r WHERE r.provider_id = sp.id AND r.is_approved = true) AS avg_rating,
  (SELECT COUNT(*)
   FROM public.service_provider_reviews r WHERE r.provider_id = sp.id AND r.is_approved = true) AS review_count
FROM public.service_providers sp
LEFT JOIN public.service_provider_categories spc ON spc.slug = sp.category_slug
WHERE sp.is_active = true;
