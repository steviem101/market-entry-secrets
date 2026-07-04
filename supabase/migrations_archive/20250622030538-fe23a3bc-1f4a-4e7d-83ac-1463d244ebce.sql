
-- Create locations table to store geographical market entry data
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('state', 'city', 'region')),
  parent_location TEXT,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  government_agency_name TEXT,
  government_agency_contact TEXT,
  government_agency_website TEXT,
  business_environment_score INTEGER CHECK (business_environment_score >= 0 AND business_environment_score <= 100),
  startup_ecosystem_strength TEXT CHECK (startup_ecosystem_strength IN ('Strong', 'Growing', 'Emerging')),
  key_industries TEXT[] NOT NULL DEFAULT '{}',
  population INTEGER,
  economic_indicators JSONB DEFAULT '{}',
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

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add indexes for better query performance
CREATE INDEX idx_locations_slug ON public.locations(slug);
CREATE INDEX idx_locations_featured ON public.locations(featured);
CREATE INDEX idx_locations_location_type ON public.locations(location_type);
CREATE INDEX idx_locations_sort_order ON public.locations(sort_order);

-- Insert sample locations data
INSERT INTO public.locations (
  name, slug, description, location_type, hero_title, hero_description,
  government_agency_name, government_agency_website, business_environment_score,
  startup_ecosystem_strength, key_industries, population,
  keywords, content_keywords, service_keywords, event_keywords, lead_keywords, featured
) VALUES 
(
  'New South Wales',
  'new-south-wales',
  'Australia''s most populous state and economic powerhouse',
  'state',
  'New South Wales Market Entry',
  'Australia''s largest economy with world-class infrastructure and diverse business opportunities across Sydney and regional NSW.',
  'Invest NSW',
  'https://www.investnsw.com.au',
  92,
  'Strong',
  ARRAY['Financial Services', 'Technology', 'Healthcare', 'Tourism', 'Agriculture', 'Mining'],
  8200000,
  ARRAY['nsw', 'new south wales', 'sydney', 'newcastle', 'wollongong'],
  ARRAY['nsw', 'new south wales', 'sydney', 'financial services', 'technology'],
  ARRAY['nsw', 'new south wales', 'sydney', 'financial', 'tech'],
  ARRAY['nsw', 'new south wales', 'sydney', 'fintech', 'startup'],
  ARRAY['nsw', 'new south wales', 'sydney', 'investment'],
  true
),
(
  'Victoria',
  'victoria',
  'Australia''s cultural and innovation hub centered around Melbourne',
  'state',
  'Victoria Market Entry',
  'Home to Australia''s cultural capital Melbourne, with strong manufacturing, education, and startup ecosystems.',
  'Invest Victoria',
  'https://www.invest.vic.gov.au',
  89,
  'Strong',
  ARRAY['Manufacturing', 'Education', 'Healthcare', 'Technology', 'Food & Beverage', 'Creative Industries'],
  6700000,
  ARRAY['victoria', 'melbourne', 'geelong', 'ballarat'],
  ARRAY['victoria', 'melbourne', 'manufacturing', 'education', 'healthcare'],
  ARRAY['victoria', 'melbourne', 'manufacturing', 'education'],
  ARRAY['victoria', 'melbourne', 'startup', 'innovation'],
  ARRAY['victoria', 'melbourne', 'manufacturing', 'investment'],
  true
),
(
  'Queensland',
  'queensland',
  'The Sunshine State with growing tech and resources sectors',
  'state',
  'Queensland Market Entry',
  'Tropical business environment with strong mining, agriculture, tourism, and emerging technology sectors across Brisbane and regional Queensland.',
  'Trade and Investment Queensland',
  'https://www.tiq.qld.gov.au',
  85,
  'Growing',
  ARRAY['Mining', 'Agriculture', 'Tourism', 'Technology', 'Renewable Energy', 'Aerospace'],
  5200000,
  ARRAY['queensland', 'brisbane', 'gold coast', 'sunshine coast', 'cairns'],
  ARRAY['queensland', 'brisbane', 'mining', 'agriculture', 'tourism'],
  ARRAY['queensland', 'brisbane', 'mining', 'agriculture'],
  ARRAY['queensland', 'brisbane', 'mining', 'startup'],
  ARRAY['queensland', 'brisbane', 'mining', 'investment'],
  true
),
(
  'Sydney',
  'sydney',
  'Australia''s largest city and financial capital',
  'city',
  'Sydney Market Entry',
  'Global financial center with the largest concentration of multinational headquarters in Australia and world-class business infrastructure.',
  'City of Sydney',
  'https://www.cityofsydney.nsw.gov.au',
  95,
  'Strong',
  ARRAY['Financial Services', 'Technology', 'Professional Services', 'Tourism', 'Real Estate', 'Media'],
  5300000,
  ARRAY['sydney', 'nsw', 'harbour city', 'cbd'],
  ARRAY['sydney', 'financial services', 'technology', 'fintech'],
  ARRAY['sydney', 'financial', 'tech', 'professional'],
  ARRAY['sydney', 'fintech', 'startup', 'innovation'],
  ARRAY['sydney', 'financial', 'investment', 'headquarters'],
  true
),
(
  'Melbourne',
  'melbourne',
  'Australia''s cultural and startup capital',
  'city',
  'Melbourne Market Entry',
  'Consistently ranked as one of the world''s most liveable cities with a thriving startup ecosystem and strong manufacturing base.',
  'City of Melbourne',
  'https://www.melbourne.vic.gov.au',
  91,
  'Strong',
  ARRAY['Manufacturing', 'Education', 'Healthcare', 'Creative Industries', 'Food & Beverage', 'Technology'],
  5100000,
  ARRAY['melbourne', 'victoria', 'cultural capital'],
  ARRAY['melbourne', 'manufacturing', 'education', 'startup'],
  ARRAY['melbourne', 'manufacturing', 'education', 'creative'],
  ARRAY['melbourne', 'startup', 'innovation', 'creative'],
  ARRAY['melbourne', 'manufacturing', 'education', 'investment'],
  false
);
