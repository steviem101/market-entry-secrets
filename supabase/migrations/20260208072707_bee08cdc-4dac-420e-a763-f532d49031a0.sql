
-- Add end buyer columns to user_intake_forms
ALTER TABLE public.user_intake_forms
ADD COLUMN end_buyer_industries text[] DEFAULT '{}'::text[],
ADD COLUMN end_buyers jsonb DEFAULT '[]'::jsonb;
