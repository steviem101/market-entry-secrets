-- Events legacy cleanup: drop dead one-off meetups and convert legacy conferences to
-- month-precision so they auto-roll-forward like the rest until research confirms a real date.

-- 10 stale one-off meetups (past dates, no recurrence pattern, no enrichment) - delete
DELETE FROM public.events
WHERE date_precision = 'exact'
  AND date < CURRENT_DATE
  AND type = 'Meetup';

-- The remaining past exact-date events are real annual conferences with stale years.
-- Convert to month-precision until research agents confirm a real next-instance date.
UPDATE public.events
SET typical_month = to_char(date, 'FMMonth'),
    date_precision = 'month',
    date = CASE
      WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1) >= CURRENT_DATE
        THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1)
      ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, EXTRACT(MONTH FROM date)::int, 1)
    END,
    time = NULL
WHERE date_precision = 'exact'
  AND date < CURRENT_DATE;
