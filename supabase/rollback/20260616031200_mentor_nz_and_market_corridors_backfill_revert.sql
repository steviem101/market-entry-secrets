-- Revert Mentors remediation WS-B2 + WS-B3.
-- Clears the derived corridors (all rows were NULL before WS-B3) and removes the
-- 'new_zealand' association added by WS-B2 (no row legitimately held it before).
UPDATE public.community_members
SET market_corridors = NULL;

UPDATE public.community_members
SET associated_countries = array_remove(associated_countries, 'new_zealand')
WHERE location ILIKE '%new zealand%'
  AND COALESCE(associated_countries, '{}') @> ARRAY['new_zealand'];
