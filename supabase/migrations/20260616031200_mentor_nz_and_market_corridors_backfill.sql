-- Mentors remediation WS-B2 + WS-B3: append 'new_zealand' to associated_countries
-- for NZ-located mentors, then derive market_corridors as {origin}-to-{destination}
-- for each non-ANZ origin paired with each ANZ destination. Both steps are
-- idempotent / recomputable. (Applied to prod 2026-06-14 via data backfill.)

-- WS-B2: add NZ association where the location indicates New Zealand (append-only).
UPDATE public.community_members
SET associated_countries = array_append(COALESCE(associated_countries, '{}'), 'new_zealand')
WHERE location ILIKE '%new zealand%'
  AND NOT (COALESCE(associated_countries, '{}') @> ARRAY['new_zealand']);

-- WS-B3: derive corridors for every member (ANZ-only members get an empty array).
UPDATE public.community_members cm
SET market_corridors = sub.corridors
FROM (
  SELECT id, ARRAY(
    SELECT DISTINCT o || '-to-' || d
    FROM unnest(associated_countries) o
    CROSS JOIN unnest(associated_countries) d
    WHERE o NOT IN ('australia', 'new_zealand')
      AND d IN ('australia', 'new_zealand')
  ) AS corridors
  FROM public.community_members
) sub
WHERE cm.id = sub.id;
