-- Country case-study cards were never clickable: every country_case_studies
-- row shipped with content_item_id = NULL (all 59 rows, all 5 countries),
-- so the "Read the playbook" link never rendered even though 36 of the
-- companies have published long-form case studies in content_items.
--
-- Backfill by exact case-insensitive company-name match through
-- content_company_profiles, only where the match is unambiguous (exactly one
-- published case_study content item). Idempotent: only touches NULL rows, so
-- replays and preview branches are no-ops once linked. Rows with no written
-- case study stay NULL and render as plain cards by design.

UPDATE public.country_case_studies cs
SET content_item_id = m.content_id
FROM (
  SELECT lower(ccp.company_name) AS name_key,
         MIN(ci.id::text)::uuid AS content_id
  FROM public.content_company_profiles ccp
  JOIN public.content_items ci
    ON ci.id = ccp.content_id
   AND ci.content_type = 'case_study'
   AND ci.status = 'published'
  GROUP BY lower(ccp.company_name)
  HAVING COUNT(DISTINCT ci.id) = 1
) m
WHERE cs.content_item_id IS NULL
  AND lower(cs.company_name) = m.name_key;
