-- Fix directory_submissions: ensure table exists, add missing columns, fix RLS, expand CHECK constraint

-- 0. Ensure the table exists (may be missing on preview branches)
CREATE TABLE IF NOT EXISTS public.directory_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_type TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.directory_submissions ENABLE ROW LEVEL SECURITY;

-- Ensure public insert policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'directory_submissions'
      AND policyname = 'Anyone can submit directory applications'
  ) THEN
    CREATE POLICY "Anyone can submit directory applications"
      ON public.directory_submissions
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure updated_at trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'handle_updated_at'
      AND tgrelid = 'public.directory_submissions'::regclass
  ) THEN
    CREATE TRIGGER handle_updated_at
      BEFORE UPDATE ON public.directory_submissions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 1. Add tracking columns
ALTER TABLE directory_submissions
  ADD COLUMN IF NOT EXISTS submitter_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 2. Fix SELECT RLS policy — currently USING(false), change to admin-only
DROP POLICY IF EXISTS "Only admins can view submissions" ON directory_submissions;
CREATE POLICY "Only admins can view submissions"
  ON directory_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Allow submitters to view their own submissions
DROP POLICY IF EXISTS "Submitters can view own submissions" ON directory_submissions;
CREATE POLICY "Submitters can view own submissions"
  ON directory_submissions FOR SELECT
  USING (submitter_user_id = auth.uid());

-- 4. Expand CHECK constraint to include new submission types
--    Drop both possible constraint names (original and renamed)
ALTER TABLE directory_submissions
  DROP CONSTRAINT IF EXISTS valid_submission_type;
ALTER TABLE directory_submissions
  DROP CONSTRAINT IF EXISTS directory_submissions_submission_type_check;

ALTER TABLE directory_submissions
  ADD CONSTRAINT directory_submissions_submission_type_check
  CHECK (submission_type IN (
    'mentor', 'service_provider', 'trade_agency', 'innovation_organization',
    'investor', 'event', 'content', 'case_study', 'guide', 'data_request',
    'mentor_contact', 'contact_inquiry'
  ));
