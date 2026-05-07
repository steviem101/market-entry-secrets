-- =============================================================================
-- One-time data fix: scrub doubled apostrophes ('') in Go1 case study bodies.
--
-- Phase 1 audit found 11/11 Go1 content_bodies contain literal '' (double
-- single-quote) where ' should be — almost certainly an ingest path that fed
-- SQL-escaped strings into a non-SQL code path.
--
-- Buildkite (0/16) and Zoom (0/17) are clean, so the fix is targeted to Go1.
-- The DO block raises if any '' pairs remain after the UPDATE.
-- =============================================================================

UPDATE public.content_bodies cb
SET body_text = REPLACE(cb.body_text, '''''', '''')
FROM public.content_sections cs
JOIN public.content_items ci ON cs.content_id = ci.id
WHERE cb.section_id = cs.id
  AND ci.slug = 'go1-australia-startup'
  AND cb.body_text LIKE '%''''%';

DO $$
DECLARE
  remaining int;
BEGIN
  SELECT COUNT(*) INTO remaining
  FROM public.content_bodies cb
  JOIN public.content_sections cs ON cb.section_id = cs.id
  JOIN public.content_items ci ON cs.content_id = ci.id
  WHERE ci.slug = 'go1-australia-startup'
    AND cb.body_text LIKE '%''''%';

  IF remaining > 0 THEN
    RAISE EXCEPTION
      'Go1 encoding fix incomplete: % bodies still contain doubled apostrophes',
      remaining;
  END IF;
END $$;

-- =============================================================================
-- Down-migration: NOT REVERSIBLE.
--
-- The doubled-apostrophe state was incorrect data. Re-introducing it via
-- REPLACE(body_text, '''', '''''') would also corrupt any single apostrophes
-- that were originally correct (the in-prose Coorpacademy/Blinkist phrases),
-- because the original double-apostrophe positions cannot be recovered.
-- If a rollback is needed, restore from PITR / backup.
-- =============================================================================
