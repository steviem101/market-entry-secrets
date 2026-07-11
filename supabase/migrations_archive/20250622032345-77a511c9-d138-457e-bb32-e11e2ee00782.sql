
-- Create countries table
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'country',
  trade_relationship_strength TEXT CHECK (trade_relationship_strength IN ('Strong', 'Growing', 'Emerging')) DEFAULT 'Growing',
  economic_indicators JSONB DEFAULT '{}',
  key_industries TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  content_keywords TEXT[] NOT NULL DEFAULT '{}',
  service_keywords TEXT[] NOT NULL DEFAULT '{}',
  event_keywords TEXT[] NOT NULL DEFAULT '{}',
  lead_keywords TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create country trade organizations table
CREATE TABLE public.country_trade_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'trade_agency',
  founded TEXT NOT NULL,
  location TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  contact_persons JSONB DEFAULT '[]',
  experience_tiles JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add origin_country and associated_countries to community_members
ALTER TABLE public.community_members 
ADD COLUMN origin_country TEXT,
ADD COLUMN associated_countries TEXT[] DEFAULT '{}';

-- Add origin_country to content_company_profiles for success story filtering
ALTER TABLE public.content_company_profiles 
ADD COLUMN IF NOT EXISTS origin_country TEXT;

-- Create trigger for updated_at on countries
CREATE TRIGGER handle_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create trigger for updated_at on country_trade_organizations
CREATE TRIGGER handle_country_trade_organizations_updated_at
  BEFORE UPDATE ON public.country_trade_organizations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert sample countries data
INSERT INTO public.countries (name, slug, description, hero_title, hero_description, key_industries, keywords, content_keywords, service_keywords, event_keywords, lead_keywords, featured, sort_order, economic_indicators, trade_relationship_strength) VALUES
('Ireland', 'ireland', 'Ireland has a strong trade relationship with Australia, with many Irish companies successfully expanding into the Australian market through government support and trade initiatives.', 'Irish Companies in Australia', 'Discover how Irish businesses are thriving in Australia with support from Enterprise Ireland and strong bilateral trade relationships.', 
 ARRAY['Technology', 'Pharmaceuticals', 'Financial Services', 'Agriculture', 'Manufacturing'], 
 ARRAY['ireland', 'irish', 'dublin', 'cork', 'enterprise ireland', 'celtic'], 
 ARRAY['ireland', 'irish', 'dublin', 'enterprise ireland'],
 ARRAY['ireland', 'irish', 'dublin', 'enterprise ireland', 'celtic'],
 ARRAY['ireland', 'irish', 'dublin', 'enterprise ireland'],
 ARRAY['ireland', 'irish', 'dublin', 'enterprise ireland'],
 true, 1, 
 '{"gdp": "$498B", "population": "5.0M", "trade_volume_aud": "$3.2B", "major_exports": ["Technology", "Pharmaceuticals", "Food Products"]}', 
 'Strong'),

('United Kingdom', 'united-kingdom', 'The UK maintains one of the strongest trade relationships with Australia, with extensive business networks and chambers of commerce facilitating market entry.', 'British Companies in Australia', 'Explore how UK businesses leverage historical ties and modern trade partnerships to succeed in the Australian market.', 
 ARRAY['Financial Services', 'Technology', 'Manufacturing', 'Mining', 'Professional Services'], 
 ARRAY['uk', 'britain', 'british', 'london', 'england', 'scotland', 'wales', 'british chamber'], 
 ARRAY['uk', 'britain', 'british', 'london', 'british chamber'],
 ARRAY['uk', 'britain', 'british', 'london', 'british chamber'],
 ARRAY['uk', 'britain', 'british', 'london', 'british chamber'],
 ARRAY['uk', 'britain', 'british', 'london', 'british chamber'],
 true, 2, 
 '{"gdp": "$3.1T", "population": "67.5M", "trade_volume_aud": "$18.9B", "major_exports": ["Financial Services", "Technology", "Machinery"]}', 
 'Strong'),

('United States', 'united-states', 'The United States is the largest source of foreign investment for Australia, with American companies playing a major role in the Australian economy across multiple sectors.', 'American Companies in Australia', 'Learn how US businesses capitalize on the strong ANZUS alliance and trade partnerships to expand into Australia.', 
 ARRAY['Technology', 'Financial Services', 'Healthcare', 'Energy', 'Retail'], 
 ARRAY['usa', 'america', 'american', 'us', 'united states', 'amcham'], 
 ARRAY['usa', 'america', 'american', 'us', 'united states'],
 ARRAY['usa', 'america', 'american', 'us', 'united states', 'amcham'],
 ARRAY['usa', 'america', 'american', 'us', 'united states'],
 ARRAY['usa', 'america', 'american', 'us', 'united states'],
 true, 3, 
 '{"gdp": "$26.9T", "population": "331M", "trade_volume_aud": "$45.2B", "major_exports": ["Technology", "Machinery", "Agricultural Products"]}', 
 'Strong'),

('Singapore', 'singapore', 'Singapore serves as a key gateway for Asian companies entering Australia, with strong government support through Enterprise Singapore and established trade networks.', 'Singaporean Companies in Australia', 'Discover how Singaporean businesses use their strategic location and government support to succeed in Australia.', 
 ARRAY['Financial Services', 'Technology', 'Logistics', 'Manufacturing', 'Trade'], 
 ARRAY['singapore', 'singaporean', 'enterprise singapore', 'asia pacific'], 
 ARRAY['singapore', 'singaporean', 'enterprise singapore'],
 ARRAY['singapore', 'singaporean', 'enterprise singapore'],
 ARRAY['singapore', 'singaporean', 'enterprise singapore'],
 ARRAY['singapore', 'singaporean', 'enterprise singapore'],
 true, 4, 
 '{"gdp": "$397B", "population": "5.9M", "trade_volume_aud": "$19.8B", "major_exports": ["Electronics", "Chemicals", "Financial Services"]}', 
 'Strong'),

('Canada', 'canada', 'Canada and Australia share strong Commonwealth ties and similar business cultures, making it easier for Canadian companies to establish operations in Australia.', 'Canadian Companies in Australia', 'See how Canadian businesses leverage Commonwealth connections and cultural similarities for Australian market success.', 
 ARRAY['Mining', 'Technology', 'Financial Services', 'Agriculture', 'Energy'], 
 ARRAY['canada', 'canadian', 'toronto', 'vancouver', 'montreal', 'commonwealth'], 
 ARRAY['canada', 'canadian', 'toronto', 'vancouver'],
 ARRAY['canada', 'canadian', 'toronto', 'vancouver'],
 ARRAY['canada', 'canadian', 'toronto', 'vancouver'],
 ARRAY['canada', 'canadian', 'toronto', 'vancouver'],
 false, 5, 
 '{"gdp": "$2.1T", "population": "38.2M", "trade_volume_aud": "$8.7B", "major_exports": ["Natural Resources", "Technology", "Agricultural Products"]}', 
 'Growing');

-- Insert sample trade organizations
INSERT INTO public.country_trade_organizations (country_id, name, description, organization_type, founded, location, employees, services, website, contact, basic_info, why_work_with_us) VALUES
((SELECT id FROM public.countries WHERE slug = 'ireland'), 'Enterprise Ireland', 'Enterprise Ireland is the government organisation responsible for the development and growth of Irish enterprises in world markets.', 'government_agency', '1998', 'Dublin, Ireland', '800+', 
 ARRAY['Market Research', 'Business Development', 'Financial Support', 'Networking', 'Trade Missions'], 
 'https://www.enterprise-ireland.com', 'info@enterprise-ireland.com', 
 'Enterprise Ireland works with Irish companies to help them start, grow, innovate and win export sales on global markets.',
 'We provide funding, mentoring, and market access support specifically designed to help Irish companies succeed internationally.'),

((SELECT id FROM public.countries WHERE slug = 'united-kingdom'), 'British Australian Chamber of Commerce', 'The British Australian Chamber of Commerce promotes trade and investment between Britain and Australia.', 'chamber_of_commerce', '1965', 'Sydney, Australia', '50-100', 
 ARRAY['Networking Events', 'Trade Missions', 'Business Introductions', 'Market Intelligence', 'Government Relations'], 
 'https://www.britchamaus.com', 'info@britchamaus.com', 
 'We are the peak body representing British business interests in Australia and Australian business interests in Britain.',
 'Our extensive network and deep understanding of both markets makes us the ideal partner for cross-border business development.'),

((SELECT id FROM public.countries WHERE slug = 'singapore'), 'Enterprise Singapore', 'Enterprise Singapore champions the growth of Singapore enterprises and promotes trade and investment.', 'government_agency', '2018', 'Singapore', '1000+', 
 ARRAY['Market Access', 'Financial Assistance', 'Capability Development', 'Innovation Support', 'Overseas Market Development'], 
 'https://www.enterprisesg.gov.sg', 'info@enterprisesg.gov.sg', 
 'We help Singapore companies grow and build capabilities to compete globally, including in the Australian market.',
 'Our comprehensive support ecosystem and strategic partnerships provide unmatched market entry assistance.'),

((SELECT id FROM public.countries WHERE slug = 'united-states'), 'American Chamber of Commerce Australia', 'AmCham Australia promotes trade and investment between the United States and Australia.', 'chamber_of_commerce', '1961', 'Sydney, Australia', '20-50', 
 ARRAY['Business Networking', 'Policy Advocacy', 'Trade Facilitation', 'Market Entry Support', 'Executive Programs'], 
 'https://www.amcham.com.au', 'info@amcham.com.au', 
 'We are the voice of American business in Australia and the leading advocate for US-Australia commercial relations.',
 'Our strong relationships with government and business leaders on both sides of the Pacific provide unique market access opportunities.');
