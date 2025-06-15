
-- Create a table for leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'csv_list' or 'tam_map'
  category TEXT NOT NULL, -- e.g., 'banking', 'e-commerce', 'cybersecurity'
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  record_count INTEGER, -- for CSV lists (e.g., 500 banking leaders)
  file_url TEXT, -- URL to the CSV file or TAM map
  preview_url TEXT, -- URL to preview/sample data
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'AUD',
  data_quality_score INTEGER DEFAULT 85, -- out of 100
  last_updated DATE DEFAULT CURRENT_DATE,
  contact_email TEXT,
  provider_name TEXT,
  tags TEXT[], -- array of tags for filtering
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - making it public for now since leads are for browsing
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view leads (public browsing)
CREATE POLICY "Anyone can view leads" 
  ON public.leads 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy for authenticated users to manage leads (if admin functionality needed later)
CREATE POLICY "Authenticated users can manage leads" 
  ON public.leads 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at_leads
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
INSERT INTO public.leads (name, description, type, category, industry, location, record_count, file_url, preview_url, price, data_quality_score, provider_name, tags) VALUES
('500 Banking Leaders Database', 'Comprehensive list of C-level executives and decision makers from top 500 banking institutions across Australia', 'csv_list', 'banking', 'Financial Services', 'Australia', 500, '/sample-data/banking-leaders.csv', '/previews/banking-leaders-sample', 2499.00, 92, 'Financial Data Solutions', ARRAY['executives', 'banking', 'finance', 'c-level']),
('250 E-commerce Companies', 'Verified contact database of e-commerce companies with revenue over $1M annually', 'csv_list', 'ecommerce', 'Retail & E-commerce', 'Australia', 250, '/sample-data/ecommerce-companies.csv', '/previews/ecommerce-sample', 1799.00, 88, 'Commerce Insights', ARRAY['ecommerce', 'retail', 'online-business', 'startups']),
('100 Cyber Security Partners', 'Premium list of cybersecurity firms and partners across APAC region', 'csv_list', 'cybersecurity', 'Technology', 'APAC', 100, '/sample-data/cybersecurity-partners.csv', '/previews/cybersecurity-sample', 1299.00, 95, 'SecureData Corp', ARRAY['cybersecurity', 'technology', 'partners', 'b2b']),
('Forensic Services TAM Map', 'Total Addressable Market mapping for forensic accounting services in Australia', 'tam_map', 'forensic', 'Professional Services', 'Australia', NULL, 'https://smiling-diamond-207.notion.site/Sample-Forensic-Total-Addressable-Market-TAM-Mapping-1c13eb360776806d927fd0a9be9c4334', NULL, 899.00, 90, 'Market Intelligence Pro', ARRAY['forensic', 'accounting', 'tam', 'market-analysis']),
('FinTech Startup Ecosystem', 'Complete mapping of Australian FinTech landscape with 180+ companies', 'csv_list', 'fintech', 'Financial Technology', 'Australia', 180, '/sample-data/fintech-ecosystem.csv', '/previews/fintech-sample', 2199.00, 89, 'FinTech Research Group', ARRAY['fintech', 'startups', 'financial-technology', 'innovation']),
('Healthcare IT Decision Makers', 'Database of IT decision makers in healthcare organizations', 'csv_list', 'healthcare', 'Healthcare Technology', 'Australia', 320, '/sample-data/healthcare-it.csv', '/previews/healthcare-sample', 2799.00, 93, 'HealthTech Data', ARRAY['healthcare', 'it-decision-makers', 'technology', 'medical']);
