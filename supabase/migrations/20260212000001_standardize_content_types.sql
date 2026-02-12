-- Standardize content types: separate case studies from guides
-- Add outcome field for case study success/failure tracking
-- Update directory_submissions constraint for new submission types

-- 1. Add outcome column to content_company_profiles for case study results
ALTER TABLE public.content_company_profiles
ADD COLUMN IF NOT EXISTS outcome TEXT CHECK (outcome IN ('successful', 'unsuccessful'));

-- 2. Add index on content_type for efficient filtered queries
CREATE INDEX IF NOT EXISTS idx_content_items_content_type ON public.content_items(content_type);

-- 3. Update directory_submissions CHECK constraint to allow case_study and guide types
ALTER TABLE public.directory_submissions DROP CONSTRAINT IF EXISTS directory_submissions_submission_type_check;
ALTER TABLE public.directory_submissions ADD CONSTRAINT directory_submissions_submission_type_check
CHECK (submission_type IN ('mentor', 'service_provider', 'trade_agency', 'innovation_organization', 'event', 'content', 'case_study', 'guide', 'data_request'));
