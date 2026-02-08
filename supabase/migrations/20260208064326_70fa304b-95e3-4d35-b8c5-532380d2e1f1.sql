-- Add known_competitors column to user_intake_forms
ALTER TABLE public.user_intake_forms
ADD COLUMN known_competitors jsonb DEFAULT '[]'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN public.user_intake_forms.known_competitors IS 'Array of competitor objects: [{ "name": "...", "website": "https://..." }]';