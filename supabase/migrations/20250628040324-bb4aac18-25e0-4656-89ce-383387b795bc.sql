
-- Create table for directory submissions
CREATE TABLE public.directory_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_type TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.directory_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for public submissions (anyone can submit)
CREATE POLICY "Anyone can submit directory applications" 
  ON public.directory_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for viewing submissions (admin only for now)
CREATE POLICY "Only admins can view submissions" 
  ON public.directory_submissions 
  FOR SELECT 
  USING (false); -- Will be updated when admin roles are implemented

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.directory_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add check constraint for submission types
ALTER TABLE public.directory_submissions 
ADD CONSTRAINT valid_submission_type 
CHECK (submission_type IN ('mentor', 'service_provider', 'trade_agency', 'innovation_organization'));
