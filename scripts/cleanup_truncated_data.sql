-- Cleanup truncated data from Airtable CSV import
-- Run against Supabase project: xhziwveaiuhzdoutpgrh

BEGIN;

-- 1. Null out 62 truncated/invalid emails (ending in "...")
UPDATE investors
SET contact_email = NULL
WHERE contact_email LIKE '%...';

-- 2. Remove truncated sector_focus entries (ending in "...")
-- Replace sector_focus array with only non-truncated values
UPDATE investors
SET sector_focus = (
  SELECT COALESCE(array_agg(s), '{}')
  FROM unnest(sector_focus) AS s
  WHERE s NOT LIKE '%...'
)
WHERE EXISTS (
  SELECT 1 FROM unnest(sector_focus) AS s WHERE s LIKE '%...'
);

-- 3. Null out 2 truncated LinkedIn URLs
UPDATE investors
SET linkedin_url = NULL
WHERE linkedin_url LIKE '%...';

COMMIT;

-- Verify results
SELECT 'truncated_emails' AS check, COUNT(*) FROM investors WHERE contact_email LIKE '%...';
SELECT 'truncated_sectors' AS check, (SELECT COUNT(*) FROM investors, unnest(sector_focus) s WHERE s LIKE '%...') AS count;
SELECT 'truncated_linkedin' AS check, COUNT(*) FROM investors WHERE linkedin_url LIKE '%...';
