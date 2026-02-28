-- Migration: Improve mentors/community schema for SEO-friendly routing and richer profiles
-- Phase 2: Database improvements for the mentors/community section

-- Add missing columns to community_members
ALTER TABLE community_members
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS bio_full TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_state TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'australia',
  ADD COLUMN IF NOT EXISTS years_experience INTEGER,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS engagement_model TEXT[],
  ADD COLUMN IF NOT EXISTS session_rate_aud INTEGER,
  ADD COLUMN IF NOT EXISTS markets_served TEXT[],
  ADD COLUMN IF NOT EXISTS sectors TEXT[],
  ADD COLUMN IF NOT EXISTS persona_fit TEXT[],
  ADD COLUMN IF NOT EXISTS languages TEXT[],
  ADD COLUMN IF NOT EXISTS category_slug TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_request_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT now();

-- Generate slugs from name for existing records
UPDATE community_members
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL AND name IS NOT NULL;

-- Populate persona_fit with 'both' for existing records
UPDATE community_members
SET persona_fit = ARRAY['international_entrant', 'local_startup']
WHERE persona_fit IS NULL;

-- Populate markets_served default for existing records
UPDATE community_members
SET markets_served = ARRAY['australia']
WHERE markets_served IS NULL;

-- Populate is_active for existing records
UPDATE community_members
SET is_active = true
WHERE is_active IS NULL;

-- Create mentor categories table for URL structure
CREATE TABLE IF NOT EXISTS mentor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO mentor_categories (slug, name, description, display_order) VALUES
  ('market-entry-strategy', 'Market Entry Strategy', 'End-to-end market entry planning and execution', 1),
  ('investment-funding', 'Investment & Funding', 'Venture capital, angel investment, grant funding', 2),
  ('legal-regulatory', 'Legal & Regulatory', 'Corporate law, compliance, IP, employment law', 3),
  ('sales-gtm', 'Sales & GTM', 'Go-to-market strategy, B2B sales, channel development', 4),
  ('technology-product', 'Technology & Product', 'Product-market fit, tech stack, software development', 5),
  ('marketing-brand', 'Marketing & Brand', 'Digital marketing, PR, brand localisation', 6),
  ('healthcare-lifesciences', 'Healthcare & Life Sciences', 'TGA, clinical trials, healthcare partnerships', 7),
  ('finance-tax', 'Finance & Tax', 'CFO advisory, tax structure, accounting', 8),
  ('recruitment-hr', 'Recruitment & HR', 'Talent, team building, employment law', 9),
  ('ecommerce-retail', 'E-commerce & Retail', 'Retail distribution, online marketplaces, logistics', 10)
ON CONFLICT (slug) DO NOTHING;

-- Create mentor_experience_with table (replaces broken experience_tiles JSONB)
CREATE TABLE IF NOT EXISTS mentor_experience_with (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES community_members(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  company_website TEXT,
  relationship_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create mentor_testimonials table
CREATE TABLE IF NOT EXISTS mentor_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES community_members(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_title TEXT,
  reviewer_company TEXT,
  reviewer_country TEXT,
  quote TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create mentor_contact_requests table
CREATE TABLE IF NOT EXISTS mentor_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES community_members(id) ON DELETE CASCADE,
  requester_name TEXT,
  requester_email TEXT,
  requester_company TEXT,
  requester_country TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and add policies for new tables
ALTER TABLE mentor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_experience_with ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_contact_requests ENABLE ROW LEVEL SECURITY;

-- Public read access for directory tables
CREATE POLICY "Anyone can view mentor_categories"
  ON mentor_categories FOR SELECT USING (true);

CREATE POLICY "Anyone can view mentor_experience_with"
  ON mentor_experience_with FOR SELECT USING (true);

CREATE POLICY "Anyone can view mentor_testimonials"
  ON mentor_testimonials FOR SELECT USING (true);

-- Public insert for contact requests (anyone can send a contact request)
CREATE POLICY "Anyone can insert mentor_contact_requests"
  ON mentor_contact_requests FOR INSERT WITH CHECK (true);

-- Admin-only select for contact requests
CREATE POLICY "Admins can view mentor_contact_requests"
  ON mentor_contact_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_mentors_slug ON community_members(slug);
CREATE INDEX IF NOT EXISTS idx_mentors_category ON community_members(category_slug);
CREATE INDEX IF NOT EXISTS idx_mentors_verified ON community_members(is_verified);
CREATE INDEX IF NOT EXISTS idx_mentors_featured ON community_members(is_featured);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON community_members(is_active);
CREATE INDEX IF NOT EXISTS idx_mentors_availability ON community_members(availability);
CREATE INDEX IF NOT EXISTS idx_mentors_sectors ON community_members USING gin(sectors);
CREATE INDEX IF NOT EXISTS idx_mentors_markets ON community_members USING gin(markets_served);
CREATE INDEX IF NOT EXISTS idx_mentors_persona ON community_members USING gin(persona_fit);
