-- Add known_competitors column to user_intake_forms
-- Wrapped in DO/EXCEPTION for Preview safety (column may already exist from repair migration)
DO $$ BEGIN
  ALTER TABLE public.user_intake_forms
    ADD COLUMN known_competitors jsonb DEFAULT '[]'::jsonb;
EXCEPTION
  WHEN duplicate_column THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- Add a comment for documentation
DO $$ BEGIN
  COMMENT ON COLUMN public.user_intake_forms.known_competitors IS 'Array of competitor objects: [{ "name": "...", "website": "https://..." }]';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
