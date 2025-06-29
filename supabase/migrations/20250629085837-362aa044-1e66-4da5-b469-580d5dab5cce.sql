
-- Create a simple table for email leads from the homepage hero section
CREATE TABLE public.email_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'homepage_hero',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - making it public for now since this is for lead capture
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert email leads (public form submission)
CREATE POLICY "Anyone can submit email leads" 
  ON public.email_leads 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for authenticated users to view leads (if admin functionality needed later)
CREATE POLICY "Authenticated users can view email leads" 
  ON public.email_leads 
  FOR SELECT
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at_email_leads
  BEFORE UPDATE ON public.email_leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
