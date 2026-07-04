
-- Create industry_sectors table to store sector information
CREATE TABLE public.industry_sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  service_keywords TEXT[] NOT NULL DEFAULT '{}',
  event_keywords TEXT[] NOT NULL DEFAULT '{}',
  lead_keywords TEXT[] NOT NULL DEFAULT '{}',
  content_keywords TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.industry_sectors
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert the existing sectors from your config
INSERT INTO public.industry_sectors (
  name, slug, description, hero_title, hero_description, 
  keywords, service_keywords, event_keywords, lead_keywords, content_keywords, industries, featured
) VALUES 
(
  'FinTech',
  'fintech',
  'Financial Technology Market Entry Solutions',
  'FinTech Market Entry Solutions',
  'Connect with specialized service providers, events, and opportunities in Australia''s thriving financial technology ecosystem.',
  ARRAY['fintech', 'financial', 'banking', 'payments', 'cryptocurrency', 'blockchain', 'lending', 'insurtech', 'wealthtech', 'regtech'],
  ARRAY['financial services', 'banking', 'payment', 'fintech', 'regulatory', 'compliance', 'investment', 'trading'],
  ARRAY['fintech', 'financial', 'banking', 'payments', 'blockchain', 'cryptocurrency'],
  ARRAY['financial', 'banking', 'fintech', 'payments'],
  ARRAY['fintech', 'financial technology', 'digital banking', 'payments', 'blockchain', 'cryptocurrency', 'open banking', 'regtech', 'insurtech', 'wealthtech'],
  ARRAY['Financial Services', 'Banking', 'FinTech', 'Insurance', 'Investment'],
  true
),
(
  'MedTech',
  'medtech',
  'Medical Technology Market Entry Solutions',
  'MedTech Market Entry Solutions',
  'Navigate Australia''s medical technology landscape with specialized expertise and regulatory guidance.',
  ARRAY['medtech', 'medical', 'healthcare', 'biotechnology', 'pharmaceutical', 'health tech', 'digital health', 'telemedicine', 'medical devices'],
  ARRAY['medical', 'healthcare', 'biotechnology', 'pharmaceutical', 'regulatory', 'clinical', 'health'],
  ARRAY['medtech', 'medical', 'healthcare', 'biotechnology', 'health'],
  ARRAY['medical', 'healthcare', 'pharmaceutical', 'biotech'],
  ARRAY['medtech', 'medical technology', 'healthcare innovation', 'digital health', 'telemedicine', 'medical devices', 'biotechnology', 'pharmaceutical', 'health tech'],
  ARRAY['Healthcare', 'Medical Technology', 'Biotechnology', 'Pharmaceuticals', 'Digital Health'],
  true
),
(
  'Telecoms',
  'telecoms',
  'Telecommunications Market Entry Solutions',
  'Telecoms Market Entry Solutions',
  'Enter Australia''s telecommunications market with expert guidance on infrastructure, regulation, and partnerships.',
  ARRAY['telecoms', 'telecommunications', 'telco', '5g', 'network', 'connectivity', 'iot', 'satellite', 'wireless', 'broadband'],
  ARRAY['telecommunications', 'network', 'connectivity', 'infrastructure', 'spectrum', 'regulatory'],
  ARRAY['telecoms', 'telecommunications', '5g', 'network', 'connectivity'],
  ARRAY['telecoms', 'telecommunications', 'network', 'infrastructure'],
  ARRAY['telecommunications', '5g', 'network infrastructure', 'connectivity', 'iot', 'satellite communications', 'wireless technology', 'broadband', 'telco'],
  ARRAY['Telecommunications', 'Technology', 'Infrastructure', 'IoT', 'Connectivity'],
  false
);
