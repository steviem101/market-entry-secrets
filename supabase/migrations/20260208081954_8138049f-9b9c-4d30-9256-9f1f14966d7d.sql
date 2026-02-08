-- Add share_token column to user_reports
ALTER TABLE public.user_reports
ADD COLUMN share_token uuid DEFAULT NULL;

-- Create unique index on share_token (only for non-null values)
CREATE UNIQUE INDEX idx_user_reports_share_token ON public.user_reports (share_token) WHERE share_token IS NOT NULL;

-- RLS policy: Anyone can view shared reports via token (no auth required)
CREATE POLICY "Anyone can view shared reports via token"
ON public.user_reports
FOR SELECT
USING (share_token IS NOT NULL AND share_token = share_token);