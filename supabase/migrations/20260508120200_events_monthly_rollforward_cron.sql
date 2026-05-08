-- Schedules a monthly pg_cron job that rolls month-precision events forward to their
-- next future occurrence. Idempotent: it only touches rows whose stored date is past.

CREATE OR REPLACE FUNCTION public.roll_forward_month_precision_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE public.events
  SET date = CASE
    WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1) >= CURRENT_DATE
      THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1)
    ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, EXTRACT(MONTH FROM date)::int, 1)
  END,
  updated_at = now()
  WHERE date_precision = 'month'
    AND date < CURRENT_DATE;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

COMMENT ON FUNCTION public.roll_forward_month_precision_events() IS
  'Rolls month-precision event dates forward to their next future occurrence. Run monthly via pg_cron.';

-- Schedule the monthly cron job. Wrapped in a DO block so the migration is a no-op on
-- Preview branches that don't have pg_cron enabled (the function itself is still created,
-- which is the only piece prod really needs to apply).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Drop any existing schedule with the same name so this migration is re-runnable
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'roll-forward-month-precision-events';

    -- Schedule: 02:00 UTC on the 1st of every month
    PERFORM cron.schedule(
      'roll-forward-month-precision-events',
      '0 2 1 * *',
      'SELECT public.roll_forward_month_precision_events();'
    );
  ELSE
    RAISE NOTICE 'pg_cron extension is not enabled - skipping cron schedule. Enable pg_cron in the Supabase dashboard if you want monthly auto-rollforward.';
  END IF;
END $$;
