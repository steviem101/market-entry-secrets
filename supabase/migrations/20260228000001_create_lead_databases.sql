-- Create lead_databases and lead_database_records tables
-- Replaces the old `leads` table with a richer schema for the Leads marketplace

----------------------------------------------------------------------
-- 1. Create lead_databases table
----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lead_databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  short_description text,
  list_type text,
  record_count integer,
  sector text,
  location text,
  quality_score integer,
  price_aud numeric,
  is_free boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  preview_available boolean DEFAULT false,
  tags text[],
  provider_name text,
  provider_logo_url text,
  last_updated date,
  sample_fields text[],
  cover_image_url text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------------------------
-- 2. Create lead_database_records table
----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lead_database_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_database_id uuid REFERENCES public.lead_databases(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  job_title text,
  company_description text,
  sector text,
  location text,
  city text,
  state text,
  country text DEFAULT 'Australia',
  linkedin_url text,
  website_url text,
  email text,
  phone text,
  revenue_range text,
  employee_count_range text,
  founded_year integer,
  buying_signals text[],
  technologies_used text[],
  notes text,
  is_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

----------------------------------------------------------------------
-- 3. Indexes
----------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_lead_databases_slug ON public.lead_databases(slug);
CREATE INDEX IF NOT EXISTS idx_lead_databases_list_type ON public.lead_databases(list_type);
CREATE INDEX IF NOT EXISTS idx_lead_databases_sector ON public.lead_databases(sector);
CREATE INDEX IF NOT EXISTS idx_lead_databases_location ON public.lead_databases(location);
CREATE INDEX IF NOT EXISTS idx_lead_databases_status ON public.lead_databases(status);
CREATE INDEX IF NOT EXISTS idx_lead_databases_tags ON public.lead_databases USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_lead_database_records_db_id ON public.lead_database_records(lead_database_id);
CREATE INDEX IF NOT EXISTS idx_lead_database_records_preview ON public.lead_database_records(is_preview);

----------------------------------------------------------------------
-- 4. Triggers (reuse existing handle_updated_at function)
----------------------------------------------------------------------

DO $$ BEGIN
  CREATE TRIGGER set_lead_databases_updated_at
    BEFORE UPDATE ON public.lead_databases
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_lead_database_records_updated_at
    BEFORE UPDATE ON public.lead_database_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

----------------------------------------------------------------------
-- 5. RLS Policies
----------------------------------------------------------------------

ALTER TABLE public.lead_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_database_records ENABLE ROW LEVEL SECURITY;

-- lead_databases: public read
CREATE POLICY "Anyone can view lead databases"
  ON public.lead_databases
  FOR SELECT
  USING (true);

-- lead_databases: admin write
CREATE POLICY "Admins can manage lead databases"
  ON public.lead_databases
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- lead_database_records: public read
-- TODO: restrict non-preview records to premium users when billing is wired up
CREATE POLICY "Anyone can view lead database records"
  ON public.lead_database_records
  FOR SELECT
  USING (true);

-- lead_database_records: admin write
CREATE POLICY "Admins can manage lead database records"
  ON public.lead_database_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

----------------------------------------------------------------------
-- 6. Seed 20 lead databases
----------------------------------------------------------------------

INSERT INTO public.lead_databases (slug, title, short_description, description, list_type, record_count, sector, location, quality_score, price_aud, is_free, is_featured, preview_available, tags, sample_fields, provider_name, last_updated, status) VALUES

-- 1. FinTech
('australian-fintech-decision-makers',
 '500 Australian FinTech Decision Makers',
 'Verified contacts at payments, lending, and WealthTech companies across Australia.',
 'Comprehensive database of 500 decision makers across Australia''s thriving FinTech ecosystem. Covers payments, digital lending, WealthTech, InsurTech, and neobanking verticals. Each contact is verified with direct email, LinkedIn profile, and current role — ideal for B2B sales teams targeting financial technology buyers.',
 'Lead Database', 500, 'Finance', 'Australia', 92, 1490, false, true, true,
 ARRAY['FinTech', 'Payments', 'WealthTech', 'Digital Banking', 'Lending'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'LinkedIn URL', 'Sub-Sector', 'HQ Location', 'Employee Count'],
 'MES Research Team', '2026-02-15', 'active'),

-- 2. Construction & Infrastructure
('top-200-construction-infrastructure-companies',
 'Top 200 Construction & Infrastructure Companies',
 'Revenue-ranked construction and infrastructure firms with procurement contacts.',
 'Australia''s top 200 construction and infrastructure companies ranked by annual revenue. Includes detailed procurement and technology buyer contacts for each firm, covering commercial building, civil infrastructure, residential development, and engineering services. Sourced from ASIC filings and verified against LinkedIn.',
 'Lead Database', 200, 'Manufacturing', 'Australia', 88, 1290, false, true, true,
 ARRAY['Construction', 'Infrastructure', 'Procurement', 'Engineering', 'Building'],
 ARRAY['Company Name', 'Revenue Range', 'Contact Name', 'Job Title', 'Email', 'HQ City', 'Sub-Sector', 'Project Types'],
 'ASIC Registry + MES Research', '2026-01-20', 'active'),

-- 3. Healthcare & MedTech
('healthcare-medtech-decision-makers',
 'Healthcare & MedTech Decision Makers',
 'C-suite and procurement contacts at hospitals, clinics, and MedTech companies.',
 'Targeted database of healthcare and medical technology decision makers including hospital CIOs, clinic directors, and MedTech procurement leads. Covers public health networks, private hospital groups, diagnostic labs, telehealth platforms, and medical device companies across every Australian state.',
 'Lead Database', 380, 'Healthcare', 'Australia', 90, 1390, false, true, true,
 ARRAY['Healthcare', 'MedTech', 'Digital Health', 'Hospitals', 'Telehealth'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'LinkedIn URL', 'Organisation Type', 'State', 'Specialisation'],
 'MES Research Team', '2026-02-01', 'active'),

-- 4. Retail & E-Commerce
('australian-retail-ecommerce-companies',
 'Australian Retail & E-Commerce Companies ($1M+ Revenue)',
 'Mid-market and enterprise retail and e-commerce operators with verified contacts.',
 'Database of Australian retail and e-commerce companies generating $1M+ in annual revenue. Covers online-first brands, omnichannel retailers, marketplace sellers, and D2C brands. Includes technology, marketing, and operations decision makers — perfect for SaaS vendors and service providers targeting the retail vertical.',
 'Lead Database', 450, 'Retail', 'Australia', 85, 1190, false, false, true,
 ARRAY['Retail', 'E-Commerce', 'D2C', 'Omnichannel', 'Marketplace'],
 ARRAY['Company Name', 'Website', 'Contact Name', 'Job Title', 'Email', 'Revenue Range', 'E-Commerce Platform', 'HQ Location'],
 'MES Research Team', '2026-01-10', 'active'),

-- 5. ASX-Listed Procurement
('asx-listed-company-procurement-contacts',
 'ASX-Listed Company Procurement Contacts',
 'Procurement and vendor management contacts at ASX 300 companies.',
 'Direct access to procurement, vendor management, and strategic sourcing contacts at ASX-listed companies. Covers ASX 300 with detailed org charts showing CPOs, procurement managers, and category leads. Essential for any B2B company seeking enterprise contracts with Australia''s largest publicly-listed organisations.',
 'Lead Database', 620, 'Finance', 'Australia', 94, 1890, false, true, false,
 ARRAY['ASX', 'Enterprise', 'Procurement', 'Vendor Management', 'Corporate'],
 ARRAY['Company Name', 'ASX Code', 'Contact Name', 'Job Title', 'Email', 'LinkedIn URL', 'Market Cap Range', 'Industry Sector'],
 'MES Research Team', '2026-02-10', 'active'),

-- 6. Government & Public Sector Tech
('government-public-sector-tech-buyers',
 'Government & Public Sector Technology Buyers',
 'Technology procurement contacts across federal, state, and local government.',
 'Comprehensive mapping of government technology buying centres across all three tiers of Australian government. Covers federal departments, state agencies, and progressive local councils. Includes CIOs, CTOs, digital transformation leads, and procurement officers. Cross-referenced with recent AusTender activity for buying signal enrichment.',
 'Market Data', 340, 'Government', 'Australia', 87, 1590, false, true, true,
 ARRAY['Government', 'GovTech', 'Public Sector', 'AusTender', 'Digital Transformation'],
 ARRAY['Agency Name', 'Contact Name', 'Job Title', 'Email', 'Government Tier', 'Department', 'State', 'Recent Tender Activity'],
 'MES Research Team', '2026-02-20', 'active'),

-- 7. Professional Services
('professional-services-firms-directory',
 'Professional Services Firms Directory',
 'Top legal, accounting, and consulting firms with partner and practice lead contacts.',
 'Directory of Australia''s leading professional services firms spanning legal, accounting, management consulting, and advisory. Covers Big 4, mid-tier, and specialist boutique firms with partner-level contacts. Invaluable for technology vendors, recruiters, and complementary service providers seeking channel partnerships.',
 'Lead Database', 520, 'Other', 'Australia', 83, 990, false, false, true,
 ARRAY['Legal', 'Accounting', 'Consulting', 'Advisory', 'Professional Services'],
 ARRAY['Firm Name', 'Practice Area', 'Contact Name', 'Partner/Director', 'Email', 'Office Location', 'Firm Size', 'Specialisation'],
 'LinkedIn Data + MES Research', '2025-12-15', 'active'),

-- 8. VC & PE Firms
('australian-vc-pe-firms',
 'Australian Venture Capital & Private Equity Firms',
 'Complete list of active VC and PE firms with investment team contacts.',
 'Every active venture capital and private equity firm operating in Australia, including fund size, investment thesis, portfolio companies, and direct contacts for partners and associates. Covers seed to growth-stage VC, buyout PE, and venture debt providers. Essential for startups seeking investment or service providers targeting the investor community.',
 'Lead Database', 180, 'Finance', 'Australia', 91, 890, false, true, true,
 ARRAY['Venture Capital', 'Private Equity', 'Investors', 'Startups', 'Funding'],
 ARRAY['Firm Name', 'Fund Size', 'Investment Stage', 'Contact Name', 'Job Title', 'Email', 'LinkedIn URL', 'Portfolio Count'],
 'MES Research Team', '2026-02-05', 'active'),

-- 9. CyberSecurity & IT
('cybersecurity-it-decision-makers',
 'CyberSecurity & IT Decision Makers',
 'CISOs, IT Directors, and security buyers at mid-market and enterprise companies.',
 'Targeted database of cybersecurity and IT decision makers at Australian companies with 200+ employees. Covers CISOs, IT Directors, Security Architects, and infrastructure leads. Enriched with technology stack data and recent cybersecurity spending signals — ideal for security vendors and MSPs entering the Australian market.',
 'Lead Database', 410, 'Technology', 'Australia', 89, 1490, false, false, true,
 ARRAY['CyberSecurity', 'IT', 'CISO', 'InfoSec', 'Cloud Security'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'LinkedIn URL', 'Company Size', 'Tech Stack', 'Industry'],
 'MES Research Team', '2026-01-25', 'active'),

-- 10. PropTech & Real Estate
('proptech-real-estate-technology-buyers',
 'PropTech & Real Estate Technology Buyers',
 'Technology decision makers at property groups, REITs, and real estate agencies.',
 'Database covering the intersection of property and technology in Australia. Includes PropTech startups, commercial property groups, REITs, residential agencies, and property management firms. Contacts include CTOs, innovation managers, and digital leads actively evaluating technology solutions for property management, transactions, and analytics.',
 'Lead Database', 290, 'Technology', 'Australia', 84, 1190, false, false, true,
 ARRAY['PropTech', 'Real Estate', 'Property Management', 'REIT', 'Construction Tech'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'Property Type', 'HQ City', 'Portfolio Size', 'Tech Focus'],
 'MES Research Team', '2026-01-05', 'active'),

-- 11. Mining & Resources
('mining-resources-companies',
 'Mining & Resources Companies',
 'Operations and technology contacts at Australia''s mining and resources companies.',
 'Australia''s mining and resources sector mapped with technology and operations decision makers. Covers iron ore, gold, lithium, coal, gas, and emerging critical minerals. Includes contacts at major miners, mid-tier producers, and mining services companies. Enriched with production data and technology adoption signals.',
 'Lead Database', 350, 'Energy', 'Australia', 86, 1390, false, true, false,
 ARRAY['Mining', 'Resources', 'Critical Minerals', 'Energy', 'METS'],
 ARRAY['Company Name', 'ASX Code', 'Contact Name', 'Job Title', 'Email', 'Commodity', 'HQ State', 'Revenue Range'],
 'ASIC Registry + MES Research', '2026-02-12', 'active'),

-- 12. AgriTech & Food Production
('agritech-food-production-companies',
 'AgriTech & Food Production Companies',
 'Technology and innovation contacts across Australian agriculture and food production.',
 'Database of agricultural technology companies and food production businesses across Australia. Covers precision agriculture, farm management software, food processing, supply chain tech, and ag-biotech. Includes innovation managers, operations directors, and technology buyers actively seeking new solutions to modernise Australian agriculture.',
 'Lead Database', 260, 'Agriculture', 'Australia', 82, 990, false, false, true,
 ARRAY['AgriTech', 'Agriculture', 'Food Production', 'Precision Farming', 'Supply Chain'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'Sub-Sector', 'State', 'Farm/Production Type', 'Employee Count'],
 'MES Research Team', '2025-12-20', 'active'),

-- 13. Education Technology
('education-technology-buyers',
 'Education Technology Buyers',
 'EdTech procurement contacts at universities, TAFEs, and K-12 school groups.',
 'Comprehensive database of education technology buyers across Australian universities, TAFEs, K-12 school groups, and EdTech companies. Covers CIOs, learning technology managers, and digital education leads. Includes institution size, technology budgets, and current LMS/platform data. Perfect for EdTech vendors targeting the $40B+ Australian education sector.',
 'Lead Database', 310, 'Education', 'Australia', 85, 1090, false, false, true,
 ARRAY['EdTech', 'Education', 'Universities', 'E-Learning', 'LMS'],
 ARRAY['Institution Name', 'Contact Name', 'Job Title', 'Email', 'Institution Type', 'Student Count', 'State', 'Current LMS'],
 'MES Research Team', '2026-01-15', 'active'),

-- 14. Logistics & Supply Chain
('logistics-supply-chain-decision-makers',
 'Logistics & Supply Chain Decision Makers',
 'Operations and technology buyers at freight, warehousing, and 3PL companies.',
 'Decision makers across Australia''s logistics and supply chain sector including freight companies, 3PLs, warehousing operators, last-mile delivery, and supply chain technology providers. Contacts include COOs, logistics managers, and technology directors. Enriched with fleet size, warehouse locations, and technology adoption data.',
 'Lead Database', 280, 'Manufacturing', 'Australia', 83, 1090, false, false, false,
 ARRAY['Logistics', 'Supply Chain', '3PL', 'Freight', 'Warehousing'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'Service Type', 'HQ City', 'Fleet Size', 'Warehouse Locations'],
 'MES Research Team', '2025-12-10', 'active'),

-- 15. SaaS & Technology (TAM Map)
('australian-saas-technology-tam-map',
 'Australian SaaS & Technology Companies TAM Map',
 'Total Addressable Market analysis of 800+ Australian SaaS and technology companies.',
 'Interactive Total Addressable Market map covering 800+ Australian SaaS and technology companies. Segmented by vertical (HR Tech, FinTech, MarTech, HealthTech, EdTech), stage (seed to IPO), revenue band, and employee count. Includes market sizing data, growth trajectories, and competitive clustering. The definitive resource for understanding the Australian tech landscape.',
 'TAM Map', 800, 'Technology', 'Australia', 93, 2490, false, true, true,
 ARRAY['SaaS', 'Technology', 'TAM', 'Market Sizing', 'Startups'],
 ARRAY['Company Name', 'Website', 'Vertical', 'Stage', 'Revenue Band', 'Employee Count', 'HQ City', 'Founded Year'],
 'MES Research Team', '2026-02-25', 'active'),

-- 16. Hospitality & Tourism
('hospitality-tourism-operators',
 'Hospitality & Tourism Operators',
 'General managers and technology contacts at hotels, resorts, and tour operators.',
 'Database of hospitality and tourism operators across Australia including hotel groups, boutique accommodations, tour operators, travel agencies, and experience platforms. Covers general managers, revenue managers, and technology decision makers. Enriched with property data, booking platform information, and technology readiness scores.',
 'Lead Database', 360, 'Tourism', 'Australia', 81, 890, false, false, true,
 ARRAY['Hospitality', 'Tourism', 'Hotels', 'Travel', 'Accommodation'],
 ARRAY['Business Name', 'Contact Name', 'Job Title', 'Email', 'Property Type', 'Location', 'Room Count', 'Booking Platform'],
 'MES Research Team', '2025-11-30', 'active'),

-- 17. Manufacturing & Industrial
('manufacturing-industrial-companies',
 'Manufacturing & Industrial Companies',
 'Operations and technology decision makers at Australian manufacturers.',
 'Australian manufacturing and industrial companies with a focus on operations, technology, and digital transformation contacts. Covers advanced manufacturing, food & beverage production, chemicals, metals, and industrial automation. Includes plant managers, operations directors, and innovation leads actively investing in Industry 4.0 solutions.',
 'Lead Database', 320, 'Manufacturing', 'Australia', 84, 1190, false, false, false,
 ARRAY['Manufacturing', 'Industrial', 'Industry 4.0', 'Automation', 'Production'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'Manufacturing Type', 'HQ State', 'Employee Count', 'Revenue Range'],
 'ASIC Registry + MES Research', '2026-01-30', 'active'),

-- 18. Insurance & Risk Management
('insurance-risk-management-buyers',
 'Insurance & Risk Management Buyers',
 'Technology and innovation contacts across insurers, brokers, and InsurTech.',
 'Market intelligence covering Australia''s insurance and risk management sector. Includes traditional insurers, insurance brokers, InsurTech startups, and reinsurers. Maps technology decision makers, innovation leads, and digital transformation officers. Enriched with technology stack data, claims volume indicators, and digital maturity scoring for each organisation.',
 'Market Data', 240, 'Finance', 'Australia', 87, 1390, false, false, true,
 ARRAY['Insurance', 'InsurTech', 'Risk Management', 'Brokers', 'Claims'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'Insurance Type', 'HQ City', 'Digital Maturity Score', 'Tech Stack'],
 'MES Research Team', '2026-02-08', 'active'),

-- 19. Legal Technology
('legal-technology-buyers',
 'Legal Technology Buyers',
 'Innovation and technology contacts at law firms and in-house legal teams.',
 'Targeted market data covering legal technology buyers across Australia. Includes top-tier, mid-tier, and boutique law firms plus in-house legal teams at ASX 200 companies. Maps innovation partners, legal operations managers, and IT directors responsible for practice management, document automation, AI, and legal analytics purchasing decisions.',
 'Market Data', 270, 'Other', 'Australia', 86, 1190, false, false, true,
 ARRAY['LegalTech', 'Law Firms', 'Legal Operations', 'Practice Management', 'Legal AI'],
 ARRAY['Firm/Company Name', 'Contact Name', 'Job Title', 'Email', 'Organisation Type', 'Practice Size', 'City', 'Current Tech Stack'],
 'LinkedIn Data + MES Research', '2026-01-20', 'active'),

-- 20. Recruitment & HR Technology
('recruitment-hr-technology-buyers',
 'Recruitment & HR Technology Buyers',
 'HR directors and talent leaders at companies actively evaluating HR tech solutions.',
 'Database of HR and recruitment technology decision makers at Australian companies with 100+ employees. Covers CHROs, HR Directors, Talent Acquisition leads, and People & Culture managers. Enriched with current HRIS/ATS platform data, headcount growth signals, and recent job posting activity — ideal for HR Tech vendors and recruitment platforms entering Australia.',
 'Lead Database', 440, 'Technology', 'Australia', 88, 1290, false, false, true,
 ARRAY['HR Tech', 'Recruitment', 'Talent', 'HRIS', 'People Analytics'],
 ARRAY['Company Name', 'Contact Name', 'Job Title', 'Email', 'LinkedIn URL', 'Company Size', 'Current HRIS', 'Industry'],
 'MES Research Team', '2026-02-18', 'active');
