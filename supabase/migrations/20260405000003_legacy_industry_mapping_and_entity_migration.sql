-- Migration: Legacy industry value mapping + entity table vocabulary alignment
--
-- This migration:
-- 1. Creates a legacy_industry_mapping table to translate old values → LinkedIn industry_groups
-- 2. Updates the intake form trigger to accept both legacy and new values
-- 3. Migrates existing user_intake_forms data to LinkedIn vocabulary
-- 4. Migrates entity table data (events, lead_databases, content_items, investors)

-- ============================================================================
-- 1. LEGACY INDUSTRY MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.legacy_industry_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_value text NOT NULL UNIQUE,
  linkedin_industry_group text NOT NULL,
  linkedin_sector text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legacy_industry_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read legacy_industry_mapping"
  ON public.legacy_industry_mapping FOR SELECT USING (true);

-- Seed the mapping: old INDUSTRY_OPTIONS (149 values) → LinkedIn industry_group
-- Where multiple mappings are possible, we pick the closest match.
INSERT INTO public.legacy_industry_mapping (legacy_value, linkedin_industry_group, linkedin_sector) VALUES
  -- Accommodation / Food
  ('Dairy', 'Food and Beverage Manufacturing', 'Manufacturing'),
  ('Food & Beverages', 'Food and Beverage Services', 'Accommodation and Food Services'),
  ('Food Production', 'Food and Beverage Manufacturing', 'Manufacturing'),
  ('Hospitality', 'Hospitality', 'Accommodation and Food Services'),
  ('Restaurants', 'Food and Beverage Services', 'Accommodation and Food Services'),
  ('Wine & Spirits', 'Food and Beverage Manufacturing', 'Manufacturing'),

  -- Administrative and Support Services
  ('Events Services', 'Events Services', 'Administrative and Support Services'),
  ('Facilities Services', 'Facilities Services', 'Administrative and Support Services'),
  ('Fundraising', 'Fundraising', 'Administrative and Support Services'),
  ('Human Resources', 'Staffing and Recruiting', 'Administrative and Support Services'),
  ('Outsourcing/Offshoring', 'Office Administration', 'Administrative and Support Services'),
  ('Security & Investigations', 'Security and Investigations', 'Administrative and Support Services'),
  ('Staffing & Recruiting', 'Staffing and Recruiting', 'Administrative and Support Services'),
  ('Translation & Localization', 'Translation and Localization', 'Administrative and Support Services'),
  ('Writing & Editing', 'Writing and Editing', 'Administrative and Support Services'),
  ('Leisure, Travel & Tourism', 'Travel Arrangements', 'Administrative and Support Services'),

  -- Construction
  ('Building Materials', 'Building Construction', 'Construction'),
  ('Civil Engineering', 'Civil Engineering', 'Construction'),
  ('Construction', 'Building Construction', 'Construction'),

  -- Consumer Services
  ('Civic & Social Organization', 'Civic and Social Organizations', 'Consumer Services'),
  ('Consumer Services', 'Household Services', 'Consumer Services'),
  ('Individual & Family Services', 'Household Services', 'Consumer Services'),
  ('Non-profit Organization Management', 'Non-profit Organizations', 'Consumer Services'),
  ('Philanthropy', 'Philanthropic Fundraising Services', 'Consumer Services'),
  ('Religious Institutions', 'Religious Institutions', 'Consumer Services'),

  -- Education
  ('E-learning', 'E-Learning Providers', 'Education'),
  ('Education Management', 'Higher Education', 'Education'),
  ('Higher Education', 'Higher Education', 'Education'),
  ('Primary/Secondary Education', 'Primary and Secondary Education', 'Education'),
  ('Professional Training & Coaching', 'Professional Training and Coaching', 'Education'),

  -- Entertainment Providers
  ('Animation', 'Artists and Writers', 'Entertainment Providers'),
  ('Arts & Crafts', 'Artists and Writers', 'Entertainment Providers'),
  ('Entertainment', 'Performing Arts and Spectator Sports', 'Entertainment Providers'),
  ('Fine Art', 'Artists and Writers', 'Entertainment Providers'),
  ('Gambling & Casinos', 'Recreational Facilities', 'Entertainment Providers'),
  ('Motion Pictures & Film', 'Performing Arts and Spectator Sports', 'Entertainment Providers'),
  ('Museums & Institutions', 'Museums, Historical Sites, and Zoos', 'Entertainment Providers'),
  ('Music', 'Musicians', 'Entertainment Providers'),
  ('Performing Arts', 'Performing Arts and Spectator Sports', 'Entertainment Providers'),
  ('Recreational Facilities & Services', 'Recreational Facilities', 'Entertainment Providers'),
  ('Sports', 'Spectator Sports', 'Entertainment Providers'),

  -- Farming, Ranching, Forestry
  ('Farming', 'Farming', 'Farming, Ranching, Forestry'),
  ('Fishery', 'Ranching and Fisheries', 'Farming, Ranching, Forestry'),
  ('Ranching', 'Ranching and Fisheries', 'Farming, Ranching, Forestry'),
  ('Paper & Forest Products', 'Forestry and Logging', 'Farming, Ranching, Forestry'),

  -- Financial Services
  ('Banking', 'Credit Intermediation', 'Financial Services'),
  ('Capital Markets', 'Capital Markets', 'Financial Services'),
  ('Financial Services', 'Capital Markets', 'Financial Services'),
  ('Insurance', 'Insurance', 'Financial Services'),
  ('Investment Banking', 'Capital Markets', 'Financial Services'),
  ('Investment Management', 'Funds and Trusts', 'Financial Services'),
  ('Venture Capital & Private Equity', 'Capital Markets', 'Financial Services'),

  -- Government Administration
  ('Executive Office', 'Public Policy Offices', 'Government Administration'),
  ('Government Administration', 'Public Policy', 'Government Administration'),
  ('Government Relations', 'Public Policy', 'Government Administration'),
  ('International Affairs', 'Military and International Affairs', 'Government Administration'),
  ('Judiciary', 'Administration of Justice', 'Government Administration'),
  ('Law Enforcement', 'Administration of Justice', 'Government Administration'),
  ('Military', 'Military and International Affairs', 'Government Administration'),
  ('Political Organization', 'Public Policy', 'Government Administration'),
  ('Public Policy', 'Public Policy', 'Government Administration'),
  ('Public Safety', 'Administration of Justice', 'Government Administration'),
  ('Think Tanks', 'Public Policy Offices', 'Government Administration'),
  ('Defense & Space', 'Space Research and Technology', 'Government Administration'),
  ('International Trade & Development', 'Economic Programs', 'Government Administration'),

  -- Hospitals and Health Care
  ('Health, Wellness & Fitness', 'Community Services', 'Hospitals and Health Care'),
  ('Hospital & Health Care', 'Hospitals, Individual and Family Services', 'Hospitals and Health Care'),
  ('Medical Practice', 'Medical Practices', 'Hospitals and Health Care'),
  ('Mental Health Care', 'Community Services', 'Hospitals and Health Care'),

  -- Manufacturing
  ('Apparel & Fashion', 'Apparel Manufacturing', 'Manufacturing'),
  ('Automotive', 'Transportation Equipment Manufacturing', 'Manufacturing'),
  ('Chemicals', 'Chemical Manufacturing', 'Manufacturing'),
  ('Computer Hardware', 'Computers and Electronics Manufacturing', 'Manufacturing'),
  ('Consumer Electronics', 'Computers and Electronics Manufacturing', 'Manufacturing'),
  ('Consumer Goods', 'Appliances, Electrical, and Electronics Manufacturing', 'Manufacturing'),
  ('Cosmetics', 'Chemical Manufacturing', 'Manufacturing'),
  ('Electrical & Electronic Manufacturing', 'Appliances, Electrical, and Electronics Manufacturing', 'Manufacturing'),
  ('Furniture', 'Furniture and Home Furnishings Manufacturing', 'Manufacturing'),
  ('Glass, Ceramics & Concrete', 'Glass, Ceramics and Concrete Manufacturing', 'Manufacturing'),
  ('Industrial Automation', 'Machinery Manufacturing', 'Manufacturing'),
  ('Machinery', 'Machinery Manufacturing', 'Manufacturing'),
  ('Medical Devices', 'Medical Equipment Manufacturing', 'Manufacturing'),
  ('Nanotechnology', 'Computers and Electronics Manufacturing', 'Manufacturing'),
  ('Packaging & Containers', 'Plastics and Rubber Product Manufacturing', 'Manufacturing'),
  ('Plastics', 'Plastics and Rubber Product Manufacturing', 'Manufacturing'),
  ('Printing', 'Printing Services', 'Manufacturing'),
  ('Railroad Manufacture', 'Transportation Equipment Manufacturing', 'Manufacturing'),
  ('Semiconductors', 'Computers and Electronics Manufacturing', 'Manufacturing'),
  ('Shipbuilding', 'Transportation Equipment Manufacturing', 'Manufacturing'),
  ('Sporting Goods', 'Sporting Goods Manufacturing', 'Manufacturing'),
  ('Textiles', 'Textile Manufacturing', 'Manufacturing'),
  ('Tobacco', 'Tobacco Manufacturing', 'Manufacturing'),
  ('Business Supplies & Equipment', 'Machinery Manufacturing', 'Manufacturing'),

  -- Oil, Gas, and Mining
  ('Mining & Metals', 'Mining', 'Oil, Gas, and Mining'),
  ('Oil & Energy', 'Oil and Gas', 'Oil, Gas, and Mining'),

  -- Professional Services
  ('Accounting', 'Accounting', 'Professional Services'),
  ('Alternative Dispute Resolution', 'Legal Services', 'Professional Services'),
  ('Architecture & Planning', 'Architecture and Planning', 'Professional Services'),
  ('Design', 'Design Services', 'Professional Services'),
  ('Environmental Services', 'Services for Renewable Energy', 'Professional Services'),
  ('Graphic Design', 'Design Services', 'Professional Services'),
  ('Law Practice', 'Legal Services', 'Professional Services'),
  ('Legal Services', 'Legal Services', 'Professional Services'),
  ('Management Consulting', 'Business Consulting and Services', 'Professional Services'),
  ('Market Research', 'Research Services', 'Professional Services'),
  ('Marketing & Advertising', 'Advertising Services', 'Professional Services'),
  ('Mechanical or Industrial Engineering', 'Engineering Services', 'Professional Services'),
  ('Photography', 'Design Services', 'Professional Services'),
  ('Program Development', 'Business Consulting and Services', 'Professional Services'),
  ('Public Relations & Communications', 'Advertising Services', 'Professional Services'),
  ('Renewables & Environment', 'Services for Renewable Energy', 'Professional Services'),
  ('Research', 'Research Services', 'Professional Services'),
  ('Veterinary', 'Veterinary Services', 'Professional Services'),
  ('Information Technology & Services', 'IT Services and IT Consulting', 'Professional Services'),

  -- Real Estate
  ('Commercial Real Estate', 'Real Estate', 'Real Estate and Equipment Rental Services'),
  ('Real Estate', 'Real Estate', 'Real Estate and Equipment Rental Services'),

  -- Retail
  ('Import & Export', 'Online and Mail Order Retail', 'Retail'),
  ('Luxury Goods & Jewelry', 'Retail Luxury Goods and Jewelry', 'Retail'),
  ('Retail', 'Online and Mail Order Retail', 'Retail'),
  ('Supermarkets', 'Food and Beverage Retail', 'Retail'),

  -- Technology, Information and Media
  ('AI', 'Software Development', 'Technology, Information and Media'),
  ('Broadcast Media', 'Broadcast Media Production and Distribution', 'Technology, Information and Media'),
  ('Computer & Network Security', 'Data Infrastructure and Analytics', 'Technology, Information and Media'),
  ('Computer Games', 'Software Development', 'Technology, Information and Media'),
  ('Computer Networking', 'Data Infrastructure and Analytics', 'Technology, Information and Media'),
  ('Computer Software', 'Software Development', 'Technology, Information and Media'),
  ('Information Services', 'Information Services', 'Technology, Information and Media'),
  ('Internet', 'Internet Marketplace Platforms', 'Technology, Information and Media'),
  ('Libraries', 'Information Services', 'Technology, Information and Media'),
  ('Media Production', 'Movies, Videos, and Sound', 'Technology, Information and Media'),
  ('Newspapers', 'Book and Periodical Publishing', 'Technology, Information and Media'),
  ('Online Media', 'Social Networking Platforms', 'Technology, Information and Media'),
  ('Publishing', 'Book and Periodical Publishing', 'Technology, Information and Media'),
  ('SaaS', 'Software Development', 'Technology, Information and Media'),
  ('Telecommunications', 'Telecommunications', 'Technology, Information and Media'),
  ('Wireless', 'Telecommunications', 'Technology, Information and Media'),

  -- Transportation, Logistics
  ('Airlines/Aviation', 'Airlines and Aviation', 'Transportation, Logistics, Supply Chain and Storage'),
  ('Aviation & Aerospace', 'Airlines and Aviation', 'Transportation, Logistics, Supply Chain and Storage'),
  ('Logistics & Supply Chain', 'Freight and Package Transportation', 'Transportation, Logistics, Supply Chain and Storage'),
  ('Maritime', 'Maritime Transportation', 'Transportation, Logistics, Supply Chain and Storage'),
  ('Package/Freight Delivery', 'Freight and Package Transportation', 'Transportation, Logistics, Supply Chain and Storage'),
  ('Transportation/Trucking/Railroad', 'Truck Transportation', 'Transportation, Logistics, Supply Chain and Storage'),
  ('Warehousing', 'Warehousing and Storage', 'Transportation, Logistics, Supply Chain and Storage'),

  -- Utilities
  ('Utilities', 'Electric Power Generation', 'Utilities'),

  -- Wholesale
  ('Wholesale', 'Wholesale Import and Export', 'Wholesale'),

  -- Alternative Medicine → closest LinkedIn match
  ('Alternative Medicine', 'Medical Practices', 'Hospitals and Health Care'),
  ('Biotechnology', 'Medical Equipment Manufacturing', 'Manufacturing'),
  ('Pharmaceuticals', 'Chemical Manufacturing', 'Manufacturing'),

  -- Catch-all for "Other"
  ('Other', 'Business Consulting and Services', 'Professional Services')

ON CONFLICT (legacy_value) DO NOTHING;


-- ============================================================================
-- 2. UPDATE THE TRIGGER TO ACCEPT BOTH LEGACY AND NEW VALUES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_industry_sector_values(industries text[])
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF industries IS NULL OR array_length(industries, 1) IS NULL THEN
    RETURN true;
  END IF;
  -- Accept values that are either:
  -- (a) a valid LinkedIn industry_group, OR
  -- (b) a known legacy value in the mapping table
  RETURN NOT EXISTS (
    SELECT 1 FROM unnest(industries) AS val
    WHERE val NOT IN (
      SELECT DISTINCT industry_group FROM public.linkedin_industries WHERE is_active = true
    )
    AND val NOT IN (
      SELECT DISTINCT legacy_value FROM public.legacy_industry_mapping
    )
  );
END;
$$;


-- ============================================================================
-- 3. MIGRATE EXISTING user_intake_forms.industry_sector VALUES
-- ============================================================================
-- Replace each legacy value with its LinkedIn industry_group equivalent.
-- This uses array manipulation: unnest, map, re-aggregate.

UPDATE public.user_intake_forms AS uif
SET industry_sector = mapped.new_industries
FROM (
  SELECT
    uif2.id,
    array_agg(DISTINCT COALESCE(lim.linkedin_industry_group, val)) AS new_industries
  FROM public.user_intake_forms uif2,
    LATERAL unnest(uif2.industry_sector) AS val
  LEFT JOIN public.legacy_industry_mapping lim ON lim.legacy_value = val
  WHERE uif2.industry_sector IS NOT NULL
    AND array_length(uif2.industry_sector, 1) > 0
  GROUP BY uif2.id
) AS mapped
WHERE uif.id = mapped.id
  AND uif.industry_sector IS DISTINCT FROM mapped.new_industries;


-- ============================================================================
-- 4. MIGRATE ENTITY TABLE DATA
-- ============================================================================

-- 4a. events.sector — free text field, map known values
UPDATE public.events SET sector = lim.linkedin_industry_group
FROM public.legacy_industry_mapping lim
WHERE events.sector IS NOT NULL
  AND events.sector = lim.legacy_value;

-- Also map the 11 STANDARD_SECTORS values used by sectorMapping.ts
UPDATE public.events SET sector = 'Technology, Information and Media' WHERE sector = 'Technology';
UPDATE public.events SET sector = 'Hospitals and Health Care' WHERE sector = 'Healthcare';
UPDATE public.events SET sector = 'Financial Services' WHERE sector = 'Finance';
UPDATE public.events SET sector = 'Manufacturing' WHERE sector = 'Manufacturing'; -- same name
UPDATE public.events SET sector = 'Education' WHERE sector = 'Education'; -- same name
UPDATE public.events SET sector = 'Government Administration' WHERE sector = 'Government';
UPDATE public.events SET sector = 'Retail' WHERE sector = 'Retail'; -- same name
UPDATE public.events SET sector = 'Farming, Ranching, Forestry' WHERE sector = 'Agriculture';
UPDATE public.events SET sector = 'Utilities' WHERE sector = 'Energy';
UPDATE public.events SET sector = 'Accommodation and Food Services' WHERE sector = 'Tourism';

-- Also map the sector config values (FinTech, MedTech, Telecoms)
UPDATE public.events SET sector = 'Financial Services' WHERE sector ILIKE '%fintech%';
UPDATE public.events SET sector = 'Hospitals and Health Care' WHERE sector ILIKE '%medtech%';
UPDATE public.events SET sector = 'Telecommunications' WHERE sector ILIKE '%telecom%';

-- 4b. lead_databases.sector — free text field
UPDATE public.lead_databases SET sector = lim.linkedin_industry_group
FROM public.legacy_industry_mapping lim
WHERE lead_databases.sector IS NOT NULL
  AND lead_databases.sector = lim.legacy_value;

-- Map STANDARD_SECTORS values in lead_databases
UPDATE public.lead_databases SET sector = 'Technology, Information and Media' WHERE sector = 'Technology';
UPDATE public.lead_databases SET sector = 'Hospitals and Health Care' WHERE sector = 'Healthcare';
UPDATE public.lead_databases SET sector = 'Financial Services' WHERE sector IN ('Finance', 'Financial Technology');
UPDATE public.lead_databases SET sector = 'Government Administration' WHERE sector = 'Government';
UPDATE public.lead_databases SET sector = 'Farming, Ranching, Forestry' WHERE sector = 'Agriculture';
UPDATE public.lead_databases SET sector = 'Utilities' WHERE sector = 'Energy';
UPDATE public.lead_databases SET sector = 'Accommodation and Food Services' WHERE sector = 'Tourism';
UPDATE public.lead_databases SET sector = 'Professional Services' WHERE sector = 'Professional Services'; -- same
UPDATE public.lead_databases SET sector = 'Retail' WHERE sector = 'Retail & E-commerce';
UPDATE public.lead_databases SET sector = 'Hospitals and Health Care' WHERE sector = 'Healthcare Technology';

-- 4c. content_items.sector_tags — text[] array, map each element
UPDATE public.content_items AS ci
SET sector_tags = mapped.new_tags
FROM (
  SELECT
    ci2.id,
    array_agg(DISTINCT COALESCE(lim.linkedin_industry_group, val)) AS new_tags
  FROM public.content_items ci2,
    LATERAL unnest(ci2.sector_tags) AS val
  LEFT JOIN public.legacy_industry_mapping lim ON lim.legacy_value = val
  WHERE ci2.sector_tags IS NOT NULL
    AND array_length(ci2.sector_tags, 1) > 0
  GROUP BY ci2.id
) AS mapped
WHERE ci.id = mapped.id
  AND ci.sector_tags IS DISTINCT FROM mapped.new_tags;

-- 4d. investors.sector_focus — text[] array, map known startup/VC shorthand values
-- These use shorthand like 'SaaS', 'FinTech', 'HealthTech' etc.
-- Create additional mappings for investor-specific shorthand
INSERT INTO public.legacy_industry_mapping (legacy_value, linkedin_industry_group, linkedin_sector) VALUES
  ('FinTech', 'Capital Markets', 'Financial Services'),
  ('HealthTech', 'Medical Practices', 'Hospitals and Health Care'),
  ('DeepTech', 'Data Infrastructure and Analytics', 'Technology, Information and Media'),
  ('Marketplace', 'Internet Marketplace Platforms', 'Technology, Information and Media'),
  ('EdTech', 'E-Learning Providers', 'Education'),
  ('Cybersecurity', 'Data Infrastructure and Analytics', 'Technology, Information and Media'),
  ('Enterprise SaaS', 'Software Development', 'Technology, Information and Media'),
  ('Climate', 'Services for Renewable Energy', 'Professional Services'),
  ('Consumer', 'Online and Mail Order Retail', 'Retail'),
  ('Defence', 'Space Research and Technology', 'Government Administration'),
  ('Space', 'Space Research and Technology', 'Government Administration'),
  ('AgTech', 'Farming', 'Farming, Ranching, Forestry'),
  ('PropTech', 'Real Estate', 'Real Estate and Equipment Rental Services'),
  ('LegalTech', 'Legal Services', 'Professional Services'),
  ('InsurTech', 'Insurance', 'Financial Services'),
  ('RegTech', 'Capital Markets', 'Financial Services'),
  ('FoodTech', 'Food and Beverage Manufacturing', 'Manufacturing'),
  ('CleanTech', 'Services for Renewable Energy', 'Professional Services'),
  ('BioTech', 'Medical Equipment Manufacturing', 'Manufacturing'),
  ('MedTech', 'Medical Equipment Manufacturing', 'Manufacturing'),
  ('GovTech', 'Public Policy', 'Government Administration'),
  ('ConstructionTech', 'Building Construction', 'Construction'),
  ('LogisticsTech', 'Freight and Package Transportation', 'Transportation, Logistics, Supply Chain and Storage')
ON CONFLICT (legacy_value) DO NOTHING;

-- Now map investors.sector_focus
UPDATE public.investors AS inv
SET sector_focus = mapped.new_focus
FROM (
  SELECT
    inv2.id,
    array_agg(DISTINCT COALESCE(lim.linkedin_industry_group, val)) AS new_focus
  FROM public.investors inv2,
    LATERAL unnest(inv2.sector_focus) AS val
  LEFT JOIN public.legacy_industry_mapping lim ON lim.legacy_value = val
  WHERE inv2.sector_focus IS NOT NULL
    AND array_length(inv2.sector_focus, 1) > 0
  GROUP BY inv2.id
) AS mapped
WHERE inv.id = mapped.id
  AND inv.sector_focus IS DISTINCT FROM mapped.new_focus;


-- ============================================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.legacy_industry_mapping IS
  'Maps pre-LinkedIn-taxonomy industry values to LinkedIn industry_group values. Used by the intake form trigger for backward compatibility and for the one-time data migration.';
