-- ============================================================
-- Migration: Improve Trade & Investment Agencies
-- Expands scope to "Government & Industry Support"
-- Adds new columns, creates supporting tables, seeds data
-- ============================================================

-- 1a. Add new columns to trade_investment_agencies
ALTER TABLE trade_investment_agencies
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS description_full TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_state TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'australia',
  ADD COLUMN IF NOT EXISTS has_multiple_locations BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS category_slug TEXT,
  ADD COLUMN IF NOT EXISTS organisation_type TEXT,
  ADD COLUMN IF NOT EXISTS government_level TEXT,
  ADD COLUMN IF NOT EXISTS jurisdiction TEXT[],
  ADD COLUMN IF NOT EXISTS sectors_supported TEXT[],
  ADD COLUMN IF NOT EXISTS support_types TEXT[],
  ADD COLUMN IF NOT EXISTS target_company_stage TEXT[],
  ADD COLUMN IF NOT EXISTS target_company_origin TEXT[],
  ADD COLUMN IF NOT EXISTS is_free_to_access BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_government_funded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS membership_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS membership_fee_aud INTEGER,
  ADD COLUMN IF NOT EXISTS grants_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_grant_aud INTEGER,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS founded_year TEXT;

-- 1b. Generate slugs for existing rows
UPDATE trade_investment_agencies
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

-- 1c. Create organisation_categories table
CREATE TABLE IF NOT EXISTS organisation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  colour TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO organisation_categories (slug, name, description, icon, colour, display_order) VALUES
  ('federal-agencies', 'Federal Trade Agencies', 'Australian and NZ national government trade and investment bodies', 'building-2', '#1B6CA8', 1),
  ('state-investment-bodies', 'State & Territory Bodies', 'State government investment attraction and export support agencies', 'map-pin', '#2B7A8C', 2),
  ('nz-government', 'New Zealand Government', 'NZ government agencies supporting international business', 'globe', '#0D7A5F', 3),
  ('industry-associations', 'Industry Associations', 'Peak bodies and industry groups representing key sectors', 'users', '#7C3AED', 4),
  ('chambers-of-commerce', 'Chambers of Commerce', 'Australian, bilateral and international chambers of commerce', 'briefcase', '#D97706', 5),
  ('bilateral-organisations', 'Bilateral Trade Organisations', 'Country-to-country trade and investment councils', 'handshake', '#DC2626', 6),
  ('accelerators-programs', 'Landing Programs & Accelerators', 'Government-funded soft landing and accelerator programs', 'rocket', '#059669', 7)
ON CONFLICT (slug) DO NOTHING;

-- 1d. Create agency_contacts table
CREATE TABLE IF NOT EXISTS agency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES trade_investment_agencies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1e. Create agency_resources table
CREATE TABLE IF NOT EXISTS agency_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES trade_investment_agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT,
  url TEXT,
  max_value_aud INTEGER,
  deadline_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1f. Create indexes
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON trade_investment_agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_category ON trade_investment_agencies(category_slug);
CREATE INDEX IF NOT EXISTS idx_agencies_org_type ON trade_investment_agencies(organisation_type);
CREATE INDEX IF NOT EXISTS idx_agencies_verified ON trade_investment_agencies(is_verified);
CREATE INDEX IF NOT EXISTS idx_agencies_featured ON trade_investment_agencies(is_featured);
CREATE INDEX IF NOT EXISTS idx_agencies_active ON trade_investment_agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_agencies_grants ON trade_investment_agencies(grants_available);
CREATE INDEX IF NOT EXISTS idx_agencies_sectors ON trade_investment_agencies USING gin(sectors_supported);
CREATE INDEX IF NOT EXISTS idx_agencies_support ON trade_investment_agencies USING gin(support_types);
CREATE INDEX IF NOT EXISTS idx_agencies_jurisdiction ON trade_investment_agencies USING gin(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_agencies_origin ON trade_investment_agencies USING gin(target_company_origin);

CREATE INDEX IF NOT EXISTS idx_agency_contacts_agency ON agency_contacts(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_resources_agency ON agency_resources(agency_id);

-- 1g. Seed organisations
-- Use ON CONFLICT (slug) to avoid duplicating if migration re-runs

INSERT INTO trade_investment_agencies (
  name, slug, tagline, description, description_full, website_url,
  organisation_type, government_level, category_slug,
  jurisdiction, sectors_supported, support_types,
  target_company_origin, is_government_funded, is_free_to_access,
  grants_available, is_verified, is_active,
  location, location_city, has_multiple_locations, founded, employees
) VALUES
(
  'Austrade',
  'austrade',
  'Australia''s national trade and investment promotion agency',
  'The Australian Trade and Investment Commission helps Australian businesses succeed in international markets and promotes Australia as a destination for productive foreign investment.',
  'Austrade is the Australian Government''s trade and investment promotion agency. Operating from over 70 locations worldwide, Austrade delivers programs and services that help Australian businesses develop their exports, attract foreign direct investment into Australia, promote Australia''s education sector internationally, and strengthen Australian tourism. Key programs include the Landing Pads program, the Export Market Development Grants (EMDG) scheme, and the Global Business and Talent Attraction Taskforce.',
  'https://www.austrade.gov.au',
  'federal_agency', 'federal', 'federal-agencies',
  ARRAY['australia', 'global'],
  ARRAY['all'],
  ARRAY['grants', 'export_finance', 'market_intelligence', 'trade_missions', 'landing_program', 'matchmaking'],
  ARRAY['australian_exporter', 'international_entrant'],
  true, true, true, true, true,
  'Sydney, Australia', 'Sydney', true, '1985', '1000+'
),
(
  'NZTE - New Zealand Trade and Enterprise',
  'nzte',
  'New Zealand''s international business development agency',
  'NZTE helps New Zealand businesses grow internationally by connecting them with international markets, customers, and investment opportunities.',
  'New Zealand Trade and Enterprise (NZTE) is the government agency charged with helping New Zealand businesses grow internationally. NZTE provides advice, connections, and support to help businesses become more internationally competitive and to attract quality investment into New Zealand.',
  'https://www.nzte.govt.nz',
  'nz_government', 'federal', 'nz-government',
  ARRAY['new_zealand', 'global'],
  ARRAY['all'],
  ARRAY['market_intelligence', 'matchmaking', 'landing_program', 'trade_missions'],
  ARRAY['australian_exporter', 'international_entrant'],
  true, true, false, true, true,
  'Auckland, New Zealand', 'Auckland', true, '2003', '500+'
),
(
  'Invest Victoria',
  'invest-victoria',
  'Victoria''s dedicated foreign investment attraction agency',
  'Invest Victoria helps international companies establish and expand in Victoria by providing tailored support, connections to local networks, and market intelligence.',
  'Invest Victoria is the Victorian Government''s dedicated investment promotion agency. It works with international companies looking to establish or expand their operations in Victoria by providing market intelligence, site selection assistance, business matchmaking, and connections to government programs. Priority sectors include life sciences and health, food and fibre, professional services, advanced manufacturing, and the digital economy.',
  'https://www.invest.vic.gov.au',
  'state_body', 'state', 'state-investment-bodies',
  ARRAY['victoria', 'australia'],
  ARRAY['healthtech', 'agritech', 'manufacturing', 'professional_services', 'technology'],
  ARRAY['market_intelligence', 'matchmaking', 'landing_program'],
  ARRAY['international_entrant'],
  true, true, false, true, true,
  'Melbourne, Australia', 'Melbourne', false, '2000', '100-200'
),
(
  'Investment NSW',
  'investment-nsw',
  'NSW Government''s agency for attracting international investment',
  'Investment NSW leads the NSW Government''s efforts to attract and retain investment into New South Wales, positioning NSW as Australia''s leading destination for international business.',
  'Investment NSW is the NSW Government''s dedicated investment attraction agency. Working across priority sectors including financial services, tech and innovation, defence industries, and professional services, Investment NSW provides site selection support, government liaison, market intelligence, and connections to NSW business networks for international companies establishing in NSW.',
  'https://www.investment.nsw.gov.au',
  'state_body', 'state', 'state-investment-bodies',
  ARRAY['nsw', 'australia'],
  ARRAY['fintech', 'technology', 'defence', 'professional_services'],
  ARRAY['market_intelligence', 'matchmaking'],
  ARRAY['international_entrant'],
  true, true, false, true, true,
  'Sydney, Australia', 'Sydney', false, '2019', '50-100'
),
(
  'Trade and Investment Queensland',
  'trade-investment-queensland',
  'Queensland''s trade and investment promotion agency',
  'Trade and Investment Queensland helps Queensland businesses grow internationally and attracts foreign investment to support Queensland''s economic development priorities.',
  'Trade and Investment Queensland (TIQ) is the Queensland Government''s dedicated trade and investment agency. It supports Queensland exporters to grow internationally through market insights, export programs, and business connections, while attracting international companies to establish in Queensland.',
  'https://www.tiq.qld.gov.au',
  'state_body', 'state', 'state-investment-bodies',
  ARRAY['queensland', 'australia'],
  ARRAY['agritech', 'tourism', 'resources', 'energy', 'technology'],
  ARRAY['market_intelligence', 'trade_missions', 'matchmaking'],
  ARRAY['australian_exporter', 'international_entrant'],
  true, true, false, true, true,
  'Brisbane, Australia', 'Brisbane', false, '2014', '100-200'
),
(
  'Export Finance Australia',
  'export-finance-australia',
  'Australia''s official export credit agency',
  'Export Finance Australia provides financial solutions to help Australian businesses win and deliver international contracts, supporting exports that benefit Australia.',
  'Export Finance Australia is Australia''s export credit agency, providing financial solutions to support Australian businesses in winning and delivering international contracts. Products include loans, guarantees, bonds, and insurance to help businesses access finance for their export activities.',
  'https://www.exportfinance.gov.au',
  'federal_agency', 'federal', 'federal-agencies',
  ARRAY['australia', 'global'],
  ARRAY['all'],
  ARRAY['export_finance', 'grants'],
  ARRAY['australian_exporter'],
  true, true, true, true, true,
  'Sydney, Australia', 'Sydney', false, '1991', '200-500'
),
(
  'FinTech Australia',
  'fintech-australia',
  'Australia''s peak body for the fintech industry',
  'FinTech Australia is the peak industry body for Australian fintech companies, advocating for a regulatory environment that enables innovation and growth.',
  'FinTech Australia is the peak body representing Australia''s fintech sector. It advocates for regulatory reform, promotes Australian fintech internationally through programs like Intersekt, and connects members with government, investors, and international partners.',
  'https://www.fintechaustralia.org.au',
  'industry_association', 'industry', 'industry-associations',
  ARRAY['australia'],
  ARRAY['fintech'],
  ARRAY['networking', 'advocacy', 'market_intelligence'],
  ARRAY['australian_exporter', 'international_entrant'],
  false, false, false, true, true,
  'Sydney, Australia', 'Sydney', false, '2016', '10-50'
),
(
  'AiGroup - Australian Industry Group',
  'aigroup',
  'Australia''s peak industry employer organisation',
  'Ai Group represents businesses across the manufacturing, construction, ICT, transport, defence, and labour hire industries, advocating on policy and providing member services.',
  'The Australian Industry Group (Ai Group) is one of Australia''s leading industry employer organisations, representing the interests of business in manufacturing, construction, ICT, transport, and related industries. Membership provides access to Ai Group''s extensive network of 60,000+ businesses.',
  'https://www.aigroup.com.au',
  'industry_association', 'industry', 'industry-associations',
  ARRAY['australia'],
  ARRAY['manufacturing', 'technology', 'construction', 'transport'],
  ARRAY['advocacy', 'networking', 'market_intelligence'],
  ARRAY['australian_exporter', 'international_entrant'],
  false, false, false, true, true,
  'Sydney, Australia', 'Sydney', true, '1873', '500+'
),
(
  'Australia-United Kingdom Chamber of Commerce',
  'aukcc',
  'Bilateral chamber promoting AU-UK trade and investment',
  'The Australia-United Kingdom Chamber of Commerce facilitates business connections, trade missions, and knowledge sharing between Australian and British business communities.',
  'The Australia-United Kingdom Chamber of Commerce (AUKCC) promotes bilateral trade and investment between Australia and the United Kingdom. With the signing of the Australia-UK Free Trade Agreement, the AUKCC plays an increasingly important role in connecting businesses seeking to take advantage of new market opportunities.',
  'https://aukcc.org',
  'bilateral', 'international', 'bilateral-organisations',
  ARRAY['australia', 'united_kingdom'],
  ARRAY['all'],
  ARRAY['networking', 'trade_missions', 'matchmaking', 'market_intelligence'],
  ARRAY['australian_exporter', 'international_entrant'],
  false, false, false, true, true,
  'Sydney, Australia', 'Sydney', false, '2000', '10-50'
),
(
  'Callaghan Innovation',
  'callaghan-innovation',
  'New Zealand''s innovation agency accelerating tech commercialisation',
  'Callaghan Innovation accelerates the commercialisation of innovation by providing R&D grants, expert advice, and connections to help NZ businesses innovate and grow.',
  'Callaghan Innovation is New Zealand''s innovation agency, helping businesses innovate and grow. For international companies entering NZ, Callaghan provides access to the NZ innovation ecosystem, R&D co-funding opportunities, connections to research institutions, and technical expertise.',
  'https://www.callaghaninnovation.govt.nz',
  'nz_government', 'federal', 'nz-government',
  ARRAY['new_zealand'],
  ARRAY['technology', 'deeptech', 'manufacturing'],
  ARRAY['grants', 'market_intelligence', 'matchmaking'],
  ARRAY['international_entrant'],
  true, true, true, true, true,
  'Wellington, New Zealand', 'Wellington', false, '2013', '200-500'
)
ON CONFLICT (slug) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  description_full = EXCLUDED.description_full,
  website_url = EXCLUDED.website_url,
  organisation_type = EXCLUDED.organisation_type,
  government_level = EXCLUDED.government_level,
  category_slug = EXCLUDED.category_slug,
  jurisdiction = EXCLUDED.jurisdiction,
  sectors_supported = EXCLUDED.sectors_supported,
  support_types = EXCLUDED.support_types,
  target_company_origin = EXCLUDED.target_company_origin,
  is_government_funded = EXCLUDED.is_government_funded,
  is_free_to_access = EXCLUDED.is_free_to_access,
  grants_available = EXCLUDED.grants_available,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  location = EXCLUDED.location,
  location_city = EXCLUDED.location_city,
  has_multiple_locations = EXCLUDED.has_multiple_locations;

-- Update existing rows that may not have the new fields set
UPDATE trade_investment_agencies
SET
  is_active = COALESCE(is_active, true),
  is_verified = COALESCE(is_verified, false),
  organisation_type = COALESCE(organisation_type, 'federal_agency'),
  government_level = COALESCE(government_level, 'federal'),
  category_slug = COALESCE(category_slug, 'federal-agencies')
WHERE organisation_type IS NULL;

-- 1h. Create agencies_report_view
CREATE OR REPLACE VIEW agencies_report_view AS
SELECT
  tia.id,
  tia.name,
  tia.slug,
  tia.tagline,
  tia.description,
  tia.description_full,
  tia.logo,
  tia.website_url,
  tia.website,
  tia.email,
  tia.organisation_type,
  tia.government_level,
  tia.category_slug,
  oc.name as category_name,
  oc.icon as category_icon,
  oc.colour as category_colour,
  tia.jurisdiction,
  tia.sectors_supported,
  tia.support_types,
  tia.target_company_origin,
  tia.is_government_funded,
  tia.is_free_to_access,
  tia.membership_required,
  tia.membership_fee_aud,
  tia.grants_available,
  tia.max_grant_aud,
  tia.location,
  tia.location_city,
  tia.location_country,
  tia.founded,
  tia.employees,
  tia.is_verified,
  tia.is_featured,
  tia.view_count,
  tia.services,
  tia.basic_info,
  tia.why_work_with_us,
  tia.contact,
  tia.contact_persons,
  tia.experience_tiles,
  (SELECT json_agg(json_build_object(
    'name', ac.full_name, 'title', ac.title, 'email', ac.email, 'linkedin_url', ac.linkedin_url
  ) ORDER BY ac.display_order)
  FROM agency_contacts ac WHERE ac.agency_id = tia.id AND ac.is_primary = true) as primary_contacts,
  (SELECT json_agg(json_build_object(
    'title', ar.title, 'type', ar.resource_type, 'value', ar.max_value_aud, 'url', ar.url
  ))
  FROM agency_resources ar WHERE ar.agency_id = tia.id AND ar.is_active = true) as resources
FROM trade_investment_agencies tia
LEFT JOIN organisation_categories oc ON oc.slug = tia.category_slug
WHERE tia.is_active = true;

-- 1i. RLS policies

-- organisation_categories: public read
ALTER TABLE organisation_categories ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organisation_categories' AND policyname = 'Anyone can view organisation categories'
  ) THEN
    CREATE POLICY "Anyone can view organisation categories"
      ON organisation_categories FOR SELECT USING (true);
  END IF;
END $$;

-- agency_contacts: public read
ALTER TABLE agency_contacts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agency_contacts' AND policyname = 'Anyone can view agency contacts'
  ) THEN
    CREATE POLICY "Anyone can view agency contacts"
      ON agency_contacts FOR SELECT USING (true);
  END IF;
END $$;

-- agency_resources: public read
ALTER TABLE agency_resources ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agency_resources' AND policyname = 'Anyone can view agency resources'
  ) THEN
    CREATE POLICY "Anyone can view agency resources"
      ON agency_resources FOR SELECT USING (true);
  END IF;
END $$;
