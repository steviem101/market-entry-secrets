
-- Create content categories table
CREATE TABLE public.content_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create main content items table
CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  category_id UUID REFERENCES public.content_categories(id),
  content_type TEXT NOT NULL DEFAULT 'article',
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  read_time INTEGER DEFAULT 5,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  meta_description TEXT,
  meta_keywords TEXT[],
  sector_tags TEXT[],
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company profiles for success stories
CREATE TABLE public.content_company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  website TEXT,
  origin_country TEXT,
  target_market TEXT,
  entry_date TEXT,
  monthly_revenue TEXT,
  annual_revenue TEXT,
  startup_costs TEXT,
  gross_margin TEXT,
  is_profitable BOOLEAN DEFAULT false,
  founder_count INTEGER DEFAULT 1,
  employee_count INTEGER DEFAULT 1,
  industry TEXT,
  business_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create founders table
CREATE TABLE public.content_founders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_instagram TEXT,
  social_youtube TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content sections for navigation
CREATE TABLE public.content_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content bodies for rich text content
CREATE TABLE public.content_bodies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.content_sections(id) ON DELETE CASCADE,
  question TEXT,
  body_text TEXT NOT NULL,
  body_markdown TEXT,
  sort_order INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'paragraph',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_bodies ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (content is publicly viewable)
CREATE POLICY "Public can view content categories" ON public.content_categories FOR SELECT USING (true);
CREATE POLICY "Public can view published content" ON public.content_items FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view company profiles" ON public.content_company_profiles FOR SELECT USING (true);
CREATE POLICY "Public can view founders" ON public.content_founders FOR SELECT USING (true);
CREATE POLICY "Public can view content sections" ON public.content_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view content bodies" ON public.content_bodies FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_content_items_slug ON public.content_items(slug);
CREATE INDEX idx_content_items_category ON public.content_items(category_id);
CREATE INDEX idx_content_items_status ON public.content_items(status);
CREATE INDEX idx_content_items_featured ON public.content_items(featured);
CREATE INDEX idx_content_items_sector_tags ON public.content_items USING GIN(sector_tags);
CREATE INDEX idx_content_company_profiles_content ON public.content_company_profiles(content_id);
CREATE INDEX idx_content_founders_content ON public.content_founders(content_id);
CREATE INDEX idx_content_sections_content ON public.content_sections(content_id);
CREATE INDEX idx_content_bodies_content ON public.content_bodies(content_id);
CREATE INDEX idx_content_bodies_section ON public.content_bodies(section_id);

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_company_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_founders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_sections
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_bodies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert default categories
INSERT INTO public.content_categories (name, description, icon, color, sort_order) VALUES
('Success Stories', 'Real businesses that conquered the Australian market', 'TrendingUp', 'text-green-600', 1),
('Market Entry Guides', 'Step-by-step guides for entering the Australian market', 'BookOpen', 'text-blue-600', 2),
('Expert Interviews', 'Insights from industry leaders and market experts', 'Users', 'text-purple-600', 3),
('Legal & Compliance', 'Essential legal requirements and compliance guides', 'FileText', 'text-red-600', 4),
('Video Tutorials', 'Visual guides and walkthroughs for market entry', 'Play', 'text-orange-600', 5),
('Best Practices', 'Proven strategies and methodologies for success', 'Star', 'text-yellow-600', 6);

-- Insert sample content (Slack story)
INSERT INTO public.content_items (slug, title, subtitle, category_id, content_type, featured, read_time, meta_description, sector_tags) 
VALUES (
  'slack-australian-market-entry',
  'How Slack Successfully Entered the Australian Enterprise Market',
  'A detailed case study of Slack''s strategic approach to conquering the Australian market',
  (SELECT id FROM public.content_categories WHERE name = 'Success Stories'),
  'success_story',
  true,
  8,
  'Learn how Slack successfully entered the Australian enterprise market with strategic partnerships and targeted marketing campaigns.',
  ARRAY['technology', 'enterprise-software', 'saas']
);

-- Insert company profile for Slack
INSERT INTO public.content_company_profiles (content_id, company_name, website, origin_country, target_market, entry_date, monthly_revenue, startup_costs, is_profitable, founder_count, employee_count, industry, business_model)
VALUES (
  (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
  'Slack Technologies',
  'slack.com',
  'United States',
  'Australia',
  'March 2018',
  '$2.4M',
  '$150,000',
  true,
  4,
  45,
  'Enterprise Software',
  'SaaS Subscription'
);

-- Insert founder for Slack
INSERT INTO public.content_founders (content_id, name, title, bio, image, is_primary)
VALUES (
  (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
  'Stewart Butterfield',
  'CEO, Slack Technologies',
  'Stewart Butterfield is the CEO and co-founder of Slack Technologies, a cloud-based collaboration platform that has revolutionized workplace communication.',
  '/placeholder.svg',
  true
);

-- Insert content sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'About The Company', 'company', 1),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'Market Research Strategy', 'market-research', 2),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'Entry Strategy & Execution', 'entry-strategy', 3),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'Key Partnerships', 'partnerships', 4);

-- Insert content bodies
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 
 (SELECT id FROM public.content_sections WHERE slug = 'company' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'Who are you and what business did you start?',
 'Stewart Butterfield is the CEO and co-founder of Slack Technologies, a cloud-based collaboration platform that has revolutionized workplace communication. Slack entered the Australian market in 2018 and quickly became a dominant force in the enterprise collaboration space.',
 1, 'question_answer'),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 
 (SELECT id FROM public.content_sections WHERE slug = 'market-research' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'What''s your backstory and how did you come up with the idea?',
 'Before founding Slack, Stewart had experience building communication tools through his previous company, Tiny Speck. The idea for Slack came from internal communication challenges his team faced while developing games. The decision to enter Australia was strategic - the country represented a mature English-speaking market with high technology adoption rates and a growing startup ecosystem.',
 1, 'question_answer'),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 
 (SELECT id FROM public.content_sections WHERE slug = 'entry-strategy' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'How did you approach the Australian market?',
 'Slack''s Australian market entry strategy focused on three key areas: enterprise partnerships with local consulting firms, integration with popular Australian business tools, and targeted marketing campaigns during major business events like PAUSE Fest and SaaStr conferences.',
 1, 'question_answer');
