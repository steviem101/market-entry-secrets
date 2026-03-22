-- Fix directory_submissions: add missing columns, fix RLS, expand CHECK constraint

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
CREATE POLICY "Submitters can view own submissions"
  ON directory_submissions FOR SELECT
  USING (submitter_user_id = auth.uid());

-- 4. Expand CHECK constraint to include new submission types
ALTER TABLE directory_submissions
  DROP CONSTRAINT IF EXISTS directory_submissions_submission_type_check;

ALTER TABLE directory_submissions
  ADD CONSTRAINT directory_submissions_submission_type_check
  CHECK (submission_type IN (
    'mentor', 'service_provider', 'trade_agency', 'innovation_organization',
    'investor', 'event', 'content', 'case_study', 'guide', 'data_request',
    'mentor_contact', 'contact_inquiry'
  ));
