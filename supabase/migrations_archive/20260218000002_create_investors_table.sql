-- Create investors directory table for Australian startup investor database
-- Modelled on AirTree Open Source VC investor categories

----------------------------------------------------------------------
-- 1. Table creation
----------------------------------------------------------------------

CREATE TABLE public.investors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text NOT NULL,
  investor_type   text NOT NULL,        -- 'vc' | 'angel' | 'venture_debt' | 'accelerator' | 'grant' | 'other'
  location        text NOT NULL,
  website         text,
  logo            text,

  -- Investment profile
  sector_focus    text[],               -- e.g. ["SaaS","FinTech","HealthTech"]
  stage_focus     text[],               -- e.g. ["Pre-Seed","Seed","Series A"]
  check_size_min  integer,              -- in AUD (null = undisclosed)
  check_size_max  integer,              -- in AUD (null = undisclosed)

  -- Contact / social
  contact_email   text,
  contact_name    text,
  linkedin_url    text,

  -- Flexible per-type fields
  details         jsonb,

  -- AI enrichment (same pattern as innovation_ecosystem)
  basic_info       text,
  why_work_with_us text,

  -- Metadata
  is_featured     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

----------------------------------------------------------------------
-- 2. Indexes
----------------------------------------------------------------------

CREATE INDEX idx_investors_type ON public.investors(investor_type);
CREATE INDEX idx_investors_sector ON public.investors USING gin(sector_focus);
CREATE INDEX idx_investors_stage ON public.investors USING gin(stage_focus);

----------------------------------------------------------------------
-- 3. Triggers
----------------------------------------------------------------------

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 4. RLS (public read, admin write — same as other directory tables)
----------------------------------------------------------------------

ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read investors"
  ON public.investors FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert investors"
  ON public.investors FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update investors"
  ON public.investors FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete investors"
  ON public.investors FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

----------------------------------------------------------------------
-- 5. Seed data — well-known Australian investors
----------------------------------------------------------------------

INSERT INTO public.investors (name, description, investor_type, location, website, sector_focus, stage_focus, check_size_min, check_size_max, is_featured, details) VALUES

-- VCs
('AirTree Ventures', 'One of Australia''s leading venture capital firms, backing ambitious founders building technology companies with the potential to reshape industries.', 'vc', 'Sydney, NSW', 'https://www.airtree.vc', ARRAY['SaaS','FinTech','HealthTech','DeepTech','Marketplace'], ARRAY['Seed','Series A','Series B'], 500000, 20000000, true, '{"fund_size": "$1B+ AUM", "portfolio_companies": ["Canva","Go1","Pet Circle","Prospa"]}'::jsonb),

('Blackbird Ventures', 'Australia''s largest venture capital fund, investing in the most ambitious founders from Australia and New Zealand building technology companies that can become global leaders.', 'vc', 'Sydney, NSW', 'https://www.blackbird.vc', ARRAY['SaaS','AI','FinTech','HealthTech','Climate'], ARRAY['Pre-Seed','Seed','Series A','Series B','Growth'], 100000, 50000000, true, '{"fund_size": "$2B+ AUM", "portfolio_companies": ["Canva","SafetyCulture","Culture Amp","Zoox"]}'::jsonb),

('Square Peg Capital', 'A global venture capital firm investing in transformative technology companies across Australia, Israel, and Southeast Asia.', 'vc', 'Melbourne, VIC', 'https://www.squarepegcap.com', ARRAY['FinTech','EdTech','Enterprise SaaS','Marketplace'], ARRAY['Series A','Series B','Growth'], 5000000, 50000000, true, '{"fund_size": "$1B+ AUM", "portfolio_companies": ["Fiverr","Stripe (AU)","Rokt","Airwallex"]}'::jsonb),

('Main Sequence', 'Australia''s deep tech venture fund backed by CSIRO, investing in startups commercialising world-class science and technology.', 'vc', 'Sydney, NSW', 'https://www.mseq.vc', ARRAY['DeepTech','AI','HealthTech','AgTech','Climate'], ARRAY['Pre-Seed','Seed','Series A'], 500000, 10000000, false, '{"fund_size": "$500M+ AUM", "portfolio_companies": ["Gilmour Space","Morse Micro","Baraja","Q-CTRL"]}'::jsonb),

('OIF Ventures', 'Early-stage venture capital firm investing in Australian deep technology, defence, and national security startups.', 'vc', 'Canberra, ACT', 'https://oifventures.com.au', ARRAY['Defence','DeepTech','Cybersecurity','Space'], ARRAY['Seed','Series A'], 500000, 5000000, false, '{"fund_size": "$150M+", "portfolio_companies": ["DroneShield","Xailient","QuantX Labs"]}'::jsonb),

('Folklore Ventures', 'Australian venture capital firm focused on partnering with visionary founders building technology companies for the long term.', 'vc', 'Sydney, NSW', 'https://www.folklore.vc', ARRAY['SaaS','FinTech','Marketplace','Consumer'], ARRAY['Seed','Series A'], 1000000, 10000000, false, '{"fund_size": "$200M+", "portfolio_companies": ["Employment Hero","Eucalyptus","Roller"]}'::jsonb),

-- Angels / Syndicates
('Sydney Angels', 'Australia''s oldest and largest angel investor group, connecting high-net-worth investors with promising early-stage startups.', 'angel', 'Sydney, NSW', 'https://www.sydneyangels.net.au', ARRAY['SaaS','FinTech','HealthTech','Consumer','DeepTech'], ARRAY['Pre-Seed','Seed'], 25000, 500000, true, '{"investments_per_year": 10, "members": "100+"}'::jsonb),

('Melbourne Angels', 'A leading angel network connecting early-stage companies with private investors who provide capital, mentoring, and networks.', 'angel', 'Melbourne, VIC', 'https://www.melbourneangels.net', ARRAY['SaaS','HealthTech','AgTech','FinTech'], ARRAY['Pre-Seed','Seed'], 25000, 500000, false, '{"investments_per_year": 8, "members": "80+"}'::jsonb),

('Scale Investors', 'An angel investor group focused on startups with female founders or diverse leadership teams.', 'angel', 'Sydney, NSW', 'https://www.scaleinvestors.com.au', ARRAY['SaaS','HealthTech','EdTech','Impact'], ARRAY['Pre-Seed','Seed'], 25000, 250000, false, '{"investments_per_year": 6, "focus": "Female and diverse founders"}'::jsonb),

-- Accelerators
('Startmate', 'Australia and New Zealand''s most active startup accelerator and fellowship program, backing early-stage founders with funding, mentorship, and a lifelong community.', 'accelerator', 'Sydney, NSW', 'https://www.startmate.com', ARRAY['SaaS','AI','FinTech','HealthTech','Climate'], ARRAY['Pre-Seed','Seed'], 75000, 120000, true, '{"cohort_size": 15, "program_length": "12 weeks", "equity": "7.5%"}'::jsonb),

('Cicada Innovations', 'Australia''s leading deep-tech incubator, helping science and engineering startups commercialise breakthrough technologies.', 'accelerator', 'Sydney, NSW', 'https://www.cicadainnovations.com', ARRAY['DeepTech','MedTech','CleanTech','Engineering'], ARRAY['Pre-Seed','Seed'], null, null, false, '{"program_length": "Ongoing", "focus": "Deep tech commercialisation"}'::jsonb),

('Stone & Chalk', 'Australia''s largest innovation community and startup hub, supporting founders in FinTech, cybersecurity, and emerging technology.', 'accelerator', 'Sydney, NSW', 'https://www.stoneandchalk.com.au', ARRAY['FinTech','Cybersecurity','AI','RegTech'], ARRAY['Pre-Seed','Seed','Series A'], null, null, false, '{"locations": ["Sydney","Melbourne","Adelaide"], "focus": "FinTech and emerging tech"}'::jsonb),

-- Venture Debt
('Partners for Growth', 'Venture debt provider offering flexible growth capital solutions to technology and life science companies.', 'venture_debt', 'Sydney, NSW', 'https://www.pfgrowth.com', ARRAY['SaaS','HealthTech','FinTech'], ARRAY['Series A','Series B','Growth'], 2000000, 20000000, false, '{"investment_criteria": "Revenue-generating tech companies with strong VC backing"}'::jsonb),

-- Grants
('R&D Tax Incentive', 'Australian Government program providing tax offsets for eligible R&D activities to encourage innovation and investment in Australia.', 'grant', 'National', 'https://www.business.gov.au/grants-and-programs/research-and-development-tax-incentive', ARRAY['All Sectors'], ARRAY['Startup/Seed','Series A-B','Growth','Enterprise'], null, null, true, '{"eligibility": "Australian registered company conducting eligible R&D activities", "benefit": "43.5% refundable tax offset for <$20M turnover, 38.5% non-refundable for larger companies"}'::jsonb),

('Export Market Development Grant (EMDG)', 'Australian Government grant for SMEs to develop export markets, covering up to 50% of eligible promotional expenses.', 'grant', 'National', 'https://www.austrade.gov.au/australian/export/export-grants', ARRAY['All Sectors'], ARRAY['Startup/Seed','Series A-B','Growth'], null, null, false, '{"eligibility": "Australian SME with turnover <$50M", "benefit": "Up to $150K per year in reimbursement for export marketing expenses"}');

----------------------------------------------------------------------
-- 6. Report template for investor_recommendations section
----------------------------------------------------------------------

INSERT INTO public.report_templates (section_name, prompt_body, visibility_tier, variables, version)
VALUES (
  'investor_recommendations',
  'You are recommending Australian investors for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market.

Company profile:
{{enriched_company_profile}}

Their primary goals: {{primary_goals}}
Budget level: {{budget_level}}
Timeline: {{timeline}}

Here are VERIFIED investors from our directory that match this company''s profile:
{{matched_investors_json}}

INSTRUCTIONS:
1. Only recommend investors from the list above. Do NOT invent or hallucinate investor names.
2. Group recommendations by investor type (VCs, Angels/Syndicates, Accelerators, Grants, Venture Debt).
3. For each investor, explain WHY they are a good fit for this specific company (stage alignment, sector overlap, check size match).
4. Suggest a recommended approach order — which investors to contact first based on the company''s current stage and needs.
5. If the company is very early-stage, prioritise grants, accelerators and angels. If growth-stage, prioritise VCs and venture debt.
6. Include any relevant tips about the Australian fundraising landscape.

Format as clean markdown with:
- H3 headers for each investor type group
- Bullet points for each investor with name, why they are a fit, and suggested check size range
- A "Recommended Approach Order" section at the end with numbered steps',
  'growth',
  ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'enriched_company_profile', 'primary_goals', 'budget_level', 'timeline', 'matched_investors_json'],
  1
);
