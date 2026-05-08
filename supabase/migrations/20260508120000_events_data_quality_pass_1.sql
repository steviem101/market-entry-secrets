-- Events data quality pass 1: introduce date_precision and stop displaying placeholder values.
--
-- Before this migration the events table had two cohorts: 22 legacy rows with real exact
-- dates (mostly past) and 83 imported rows where date was synthetically set to the 1st of
-- the typical month, time was "See website", organizer was "TBC" and price was "Varies".
-- Cards rendered those placeholders as if they were real schedule information, and the
-- upcoming/past split treated the synthetic 1st-of-month date as a real one.

-- 0. Schema repair for Preview Branches. These columns exist in production but were
--    added via Supabase Studio without migration files, so a fresh Preview DB is missing
--    them. ADD COLUMN IF NOT EXISTS is a no-op in production.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS typical_month text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees_label text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS frequency text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS exhibitors integer;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS exhibitors_label text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS state_region text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location_id uuid;

-- 1. date_precision column: 'exact' | 'month' | 'tbc'
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS date_precision text NOT NULL DEFAULT 'exact'
    CHECK (date_precision IN ('exact', 'month', 'tbc'));

COMMENT ON COLUMN public.events.date_precision IS
  'Precision of the date field. exact = real scheduled date; month = approximate (typical_month); tbc = unknown.';

-- 2. Backfill: rows whose date is the 1st of the month AND have typical_month set AND time
--    is the placeholder are month-precision.
UPDATE public.events
SET date_precision = 'month'
WHERE typical_month IS NOT NULL
  AND EXTRACT(DAY FROM date)::int = 1
  AND (time = 'See website' OR time IS NULL);

-- 3. Roll placeholder month-precision dates forward to the next future occurrence of their
--    month so they sort sensibly and never appear past.
UPDATE public.events
SET date = CASE
  WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1) >= CURRENT_DATE
    THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1)
  ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, EXTRACT(MONTH FROM date)::int, 1)
END
WHERE date_precision = 'month';

-- 4. Nullify placeholder strings so completeness queries are honest.
UPDATE public.events SET time = NULL WHERE time = 'See website';
UPDATE public.events SET organizer = NULL WHERE organizer = 'TBC';
UPDATE public.events SET price = NULL WHERE price = 'Varies';
