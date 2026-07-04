-- ============================================================
-- Show the real local start time for scraped events
-- Target: MES Platform (xhziwveaiuhzdoutpgrh) ONLY
-- event_date carries the precise start (with offset), but the free-text
-- `time` column was left at its 'See website' default, so the UI never showed
-- a time. This derives a clean local time label ("7:20 PM") from event_date in
-- the event's city timezone, via a trigger (future rows) and a one-off backfill.
-- Only touches apify_events_finder rows whose time is still empty/placeholder,
-- so curated rows and any hand-edited time are left alone.
-- ============================================================

CREATE OR REPLACE FUNCTION event_local_time_label(p_ts timestamptz, p_city text)
RETURNS text LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT CASE WHEN p_ts IS NULL THEN NULL ELSE
    to_char(
      p_ts AT TIME ZONE (
        CASE
          WHEN lower(coalesce(p_city,'')) LIKE '%perth%'      THEN 'Australia/Perth'
          WHEN lower(coalesce(p_city,'')) LIKE '%adelaide%'   THEN 'Australia/Adelaide'
          WHEN lower(coalesce(p_city,'')) LIKE '%brisbane%'   THEN 'Australia/Brisbane'
          WHEN lower(coalesce(p_city,'')) LIKE '%gold coast%' THEN 'Australia/Brisbane'
          WHEN lower(coalesce(p_city,'')) LIKE '%hobart%'     THEN 'Australia/Hobart'
          WHEN lower(coalesce(p_city,'')) LIKE '%darwin%'     THEN 'Australia/Darwin'
          WHEN lower(coalesce(p_city,'')) LIKE '%auckland%'   THEN 'Pacific/Auckland'
          WHEN lower(coalesce(p_city,'')) LIKE '%wellington%' THEN 'Pacific/Auckland'
          WHEN lower(coalesce(p_city,'')) LIKE '%christchurch%' THEN 'Pacific/Auckland'
          ELSE 'Australia/Sydney'
        END
      ),
      'FMHH12:MI AM'
    )
  END
$$;

CREATE OR REPLACE FUNCTION set_event_time_label()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.source = 'apify_events_finder'
     AND NEW.event_date IS NOT NULL
     AND (NEW.time IS NULL OR NEW.time IN ('', 'See website')) THEN
    NEW.time := event_local_time_label(NEW.event_date, NEW.city);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_event_time_label ON events;
CREATE TRIGGER trg_set_event_time_label
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_event_time_label();

-- Backfill existing scraped rows.
UPDATE events
SET time = event_local_time_label(event_date, city)
WHERE source = 'apify_events_finder'
  AND event_date IS NOT NULL
  AND (time IS NULL OR time IN ('', 'See website'));
