
-- Create a table for market entry reports
CREATE TABLE public.market_entry_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL DEFAULT 'market_analysis', -- 'market_analysis', 'competitor_research', 'regulatory_guide', 'opportunity_assessment'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'in_progress', 'completed', 'delivered'
  created_by_team_member TEXT, -- Name of team member who created it
  file_url TEXT, -- URL to the report file if available
  metadata JSONB DEFAULT '{}', -- Store additional data like market focus, sectors, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security (RLS)
ALTER TABLE public.market_entry_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for market entry reports
CREATE POLICY "Users can view their own reports" 
  ON public.market_entry_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow team members (admins/moderators) to create reports for users
CREATE POLICY "Team members can create reports for users" 
  ON public.market_entry_reports 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Allow team members to update reports
CREATE POLICY "Team members can update reports" 
  ON public.market_entry_reports 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Create an index for faster queries
CREATE INDEX idx_market_entry_reports_user_status ON public.market_entry_reports (user_id, status);

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.market_entry_reports 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
