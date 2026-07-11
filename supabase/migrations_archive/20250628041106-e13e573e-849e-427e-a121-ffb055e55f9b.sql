
-- Update the submission types constraint to include new types
ALTER TABLE public.directory_submissions 
DROP CONSTRAINT IF EXISTS valid_submission_type;

ALTER TABLE public.directory_submissions 
ADD CONSTRAINT valid_submission_type 
CHECK (submission_type IN ('mentor', 'service_provider', 'trade_agency', 'innovation_organization', 'event', 'content', 'data_request'));
