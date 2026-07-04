
-- Create lead_submissions table to store lead generation form data
CREATE TABLE public.lead_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  sector TEXT NOT NULL,
  target_market TEXT NOT NULL,
  company_website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'new',
  notes TEXT
);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lead_submissions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add indexes for better query performance
CREATE INDEX idx_lead_submissions_email ON public.lead_submissions(email);
CREATE INDEX idx_lead_submissions_created_at ON public.lead_submissions(created_at);
CREATE INDEX idx_lead_submissions_status ON public.lead_submissions(status);
