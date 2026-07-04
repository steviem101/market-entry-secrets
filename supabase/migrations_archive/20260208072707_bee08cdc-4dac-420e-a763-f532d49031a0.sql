-- Add end buyer columns to user_intake_forms
-- Wrapped in DO/EXCEPTION for Preview safety (columns may already exist from repair migration)
DO $$ BEGIN
  ALTER TABLE public.user_intake_forms
    ADD COLUMN end_buyer_industries text[] DEFAULT '{}'::text[],
    ADD COLUMN end_buyers jsonb DEFAULT '[]'::jsonb;
EXCEPTION
  WHEN duplicate_column THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;
