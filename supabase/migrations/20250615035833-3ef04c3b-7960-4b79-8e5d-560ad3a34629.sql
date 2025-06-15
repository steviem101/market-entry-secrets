
-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  founded TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  experience_tiles JSONB DEFAULT '[]',
  contact_persons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create innovation_ecosystem table
CREATE TABLE public.innovation_ecosystem (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  founded TEXT NOT NULL,
  employees TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact TEXT,
  logo TEXT,
  basic_info TEXT,
  why_work_with_us TEXT,
  experience_tiles JSONB DEFAULT '[]',
  contact_persons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add triggers to update the updated_at column
CREATE OR REPLACE TRIGGER handle_updated_at_service_providers
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER handle_updated_at_innovation_ecosystem
  BEFORE UPDATE ON public.innovation_ecosystem
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert sample data for service providers
INSERT INTO public.service_providers (name, description, location, founded, employees, services, website, contact, experience_tiles, contact_persons) VALUES
('Accenture Australia', 'Global management consulting and professional services company helping businesses transform through technology and innovation. We provide strategy, digital, and operational services.', 'Sydney, NSW', '1989', '10000+', '{"Strategy Consulting", "Digital Transformation", "Technology Implementation", "Change Management", "Innovation Labs"}', 'https://accenture.com/au', 'australia@accenture.com', '[{"id": "1", "name": "Commonwealth Bank", "logo": "/placeholder.svg"}, {"id": "2", "name": "Telstra", "logo": "/placeholder.svg"}, {"id": "3", "name": "Woolworths", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Sarah Mitchell", "role": "Managing Director", "image": "/placeholder.svg"}, {"id": "2", "name": "James Wilson", "role": "Innovation Lead", "image": "/placeholder.svg"}]'),
('PwC Australia', 'Leading professional services firm providing audit, tax, and advisory services. We help businesses solve complex problems and achieve sustainable growth.', 'Melbourne, VIC', '1991', '8000+', '{"Audit & Assurance", "Tax Services", "Advisory", "Strategy Consulting", "Digital Services"}', 'https://pwc.com.au', 'info@pwc.com', '[{"id": "1", "name": "ANZ Bank", "logo": "/placeholder.svg"}, {"id": "2", "name": "BHP", "logo": "/placeholder.svg"}, {"id": "3", "name": "Qantas", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Emma Thompson", "role": "Partner", "image": "/placeholder.svg"}, {"id": "2", "name": "David Chen", "role": "Director", "image": "/placeholder.svg"}]'),
('McKinsey & Company', 'Global management consulting firm serving leading businesses, governments, and institutions. We help unlock value through strategic transformation.', 'Sydney, NSW', '1963', '500-1000', '{"Strategy Development", "Organizational Design", "Digital McKinsey", "Operations", "Implementation"}', 'https://mckinsey.com', 'sydney@mckinsey.com', '[{"id": "1", "name": "Westpac", "logo": "/placeholder.svg"}, {"id": "2", "name": "Rio Tinto", "logo": "/placeholder.svg"}, {"id": "3", "name": "CSIRO", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Michael Roberts", "role": "Senior Partner", "image": "/placeholder.svg"}, {"id": "2", "name": "Lisa Park", "role": "Associate Partner", "image": "/placeholder.svg"}]');

-- Insert sample data for innovation ecosystem
INSERT INTO public.innovation_ecosystem (name, description, location, founded, employees, services, website, contact, experience_tiles, contact_persons) VALUES
('Techstars Sydney', 'Leading global accelerator program helping early-stage startups scale rapidly in the Australian market. We provide mentorship, funding, and access to a global network of entrepreneurs and investors.', 'Sydney, NSW', '2015', '25-50', '{"Startup Acceleration", "Mentorship", "Seed Funding", "Network Access", "Demo Day"}', 'https://techstars.com/sydney', 'sydney@techstars.com', '[{"id": "1", "name": "Atlassian", "logo": "/placeholder.svg"}, {"id": "2", "name": "Canva", "logo": "/placeholder.svg"}, {"id": "3", "name": "Afterpay", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Sarah Chen", "role": "Managing Director", "image": "/placeholder.svg"}, {"id": "2", "name": "Michael Torres", "role": "Program Manager", "image": "/placeholder.svg"}]'),
('CSIRO Innovation Centre', 'Australia''s national science agency fostering innovation through research collaboration and technology transfer. We connect researchers with industry to drive breakthrough innovations.', 'Multiple Locations', '1916', '5000+', '{"Research Collaboration", "Technology Transfer", "IP Licensing", "Innovation Consulting", "Startup Incubation"}', 'https://csiro.au', 'innovation@csiro.au', '[{"id": "1", "name": "BHP", "logo": "/placeholder.svg"}, {"id": "2", "name": "Woolworths", "logo": "/placeholder.svg"}, {"id": "3", "name": "QANTAS", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Dr. Emma Watson", "role": "Innovation Director", "image": "/placeholder.svg"}, {"id": "2", "name": "James Mitchell", "role": "Technology Transfer Manager", "image": "/placeholder.svg"}]'),
('Blackbird Ventures', 'Australia''s largest venture capital fund investing in exceptional founders building global companies. We provide seed to growth stage funding and strategic support.', 'Sydney, NSW', '2012', '50-100', '{"Venture Capital", "Seed Funding", "Growth Capital", "Strategic Advisory", "Portfolio Support"}', 'https://blackbird.vc', 'hello@blackbird.vc', '[{"id": "1", "name": "Canva", "logo": "/placeholder.svg"}, {"id": "2", "name": "SafetyCulture", "logo": "/placeholder.svg"}, {"id": "3", "name": "Culture Amp", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Niki Scevak", "role": "Co-founder & Partner", "image": "/placeholder.svg"}, {"id": "2", "name": "Rick Baker", "role": "Co-founder & Partner", "image": "/placeholder.svg"}]'),
('Melbourne Innovation District', 'World-class innovation precinct connecting startups, corporates, and research institutions. We create collaborative spaces and programs to drive innovation in health and life sciences.', 'Melbourne, VIC', '2017', '100-200', '{"Innovation Hub", "Coworking Spaces", "Corporate Innovation", "Research Partnerships", "Event Hosting"}', 'https://mid.org.au', 'connect@mid.org.au', '[{"id": "1", "name": "CSL", "logo": "/placeholder.svg"}, {"id": "2", "name": "NAB", "logo": "/placeholder.svg"}, {"id": "3", "name": "University of Melbourne", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Dr. Lisa Park", "role": "CEO", "image": "/placeholder.svg"}, {"id": "2", "name": "David Kim", "role": "Head of Partnerships", "image": "/placeholder.svg"}]'),
('BlueChilli', 'Corporate venture studio and accelerator building and scaling tech startups across Australia. We partner with corporates to create new ventures and accelerate existing startups.', 'Sydney, NSW', '2011', '50-100', '{"Venture Studio", "Corporate Acceleration", "Startup Development", "Digital Transformation", "Innovation Strategy"}', 'https://bluechilli.com', 'hello@bluechilli.com', '[{"id": "1", "name": "Westpac", "logo": "/placeholder.svg"}, {"id": "2", "name": "Telstra", "logo": "/placeholder.svg"}, {"id": "3", "name": "RACV", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Sebastien Eckersley-Maslin", "role": "CEO", "image": "/placeholder.svg"}, {"id": "2", "name": "Annie Parker", "role": "Head of Programs", "image": "/placeholder.svg"}]'),
('University of Sydney Innovation Hub', 'Connecting academic research with industry to drive innovation and entrepreneurship. We support student startups, research commercialization, and industry partnerships.', 'Sydney, NSW', '2018', '25-50', '{"Research Commercialization", "Student Startups", "Industry Partnerships", "IP Management", "Entrepreneur Education"}', 'https://sydney.edu.au/innovation', 'innovation@sydney.edu.au', '[{"id": "1", "name": "Google", "logo": "/placeholder.svg"}, {"id": "2", "name": "Microsoft", "logo": "/placeholder.svg"}, {"id": "3", "name": "Johnson & Johnson", "logo": "/placeholder.svg"}]', '[{"id": "1", "name": "Prof. Rachel Thompson", "role": "Director", "image": "/placeholder.svg"}, {"id": "2", "name": "Mark Stevens", "role": "Commercialization Manager", "image": "/placeholder.svg"}]');
