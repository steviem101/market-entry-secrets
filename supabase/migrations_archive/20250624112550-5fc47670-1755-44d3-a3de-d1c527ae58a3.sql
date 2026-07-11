
-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  country_flag TEXT NOT NULL,
  country_name TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  outcome TEXT NOT NULL,
  avatar TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (making it public for now since testimonials are public content)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Public can view testimonials" ON public.testimonials
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to manage testimonials (for admin)
CREATE POLICY "Authenticated users can manage testimonials" ON public.testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert the existing testimonials data
INSERT INTO public.testimonials (name, title, company, country_flag, country_name, testimonial, outcome, avatar, is_featured, sort_order) VALUES
('Sarah Chen', 'CEO', 'TechFlow Solutions', '🇸🇬', 'Singapore', 'The market entry secrets revealed exactly which regulatory hurdles we''d face and connected us with the right legal partners. What would have taken us 18 months took just 6 months.', 'Reduced market entry time by 12 months, saved $200K in consulting fees', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', true, 1),
('Marcus Weber', 'Founder', 'GreenTech Industries', '🇩🇪', 'Germany', 'The insider knowledge about Australian energy regulations and the vetted supplier network was game-changing. We avoided costly mistakes and found our key partners within weeks.', 'Secured 3 major partnerships, achieved 40% faster revenue growth', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', true, 2),
('Priya Sharma', 'International Director', 'DataBridge Analytics', '🇮🇳', 'India', 'The hidden strategies for navigating Australian procurement processes were invaluable. We won our first government contract within 4 months of entering the market.', 'Won $2.3M government contract, established market presence 60% faster', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', true, 3),
('James Mitchell', 'VP of Expansion', 'FinanceFlow', '🇺🇸', 'United States', 'The exclusive access to Australian banking relationships and compliance shortcuts saved us months of research. The ROI on this knowledge was immediate.', 'Launched operations 8 months ahead of schedule, 25% under budget', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', true, 4),
('Emma Thompson', 'Co-founder', 'EcoPackaging Solutions', '🇬🇧', 'United Kingdom', 'The sustainability sector insights and pre-vetted manufacturing contacts were exactly what we needed. We went from zero to profitable in our first year in Australia.', 'Achieved profitability in year 1, built distribution network 3x faster', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face', true, 5),
('Hiroshi Tanaka', 'Managing Director', 'Precision Robotics', '🇯🇵', 'Japan', 'The manufacturing sector secrets and supplier verification process helped us avoid unreliable partners. Our Australian operations now generate 30% of our global revenue.', '30% of global revenue from Australia, zero supplier failures', null, true, 6);
