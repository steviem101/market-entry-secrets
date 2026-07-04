-- Add CHECK constraint for submission status lifecycle
ALTER TABLE directory_submissions
  DROP CONSTRAINT IF EXISTS directory_submissions_status_check;

ALTER TABLE directory_submissions
  ADD CONSTRAINT directory_submissions_status_check
  CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'published'));
