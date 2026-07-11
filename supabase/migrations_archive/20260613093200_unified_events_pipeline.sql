-- ============================================================
-- Migration: unified_events_pipeline
-- Target: MES Platform (xhziwveaiuhzdoutpgrh) ONLY
-- Builds the schema for the unified events pipeline: scraped events
-- (source = 'apify_events_finder') and curated events (source = 'manual')
-- live in the same table, separated by source and status.
-- ============================================================

-- 4.1  New columns only. city/sector/image_url/tags already exist; the
-- pipeline reuses the existing `venue` column rather than adding venue_name.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_date            timestamptz,
  ADD COLUMN IF NOT EXISTS source_url            text,
  ADD COLUMN IF NOT EXISTS source_platform       text,
  ADD COLUMN IF NOT EXISTS source                text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS status                text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS country               text DEFAULT 'AU',
  ADD COLUMN IF NOT EXISTS event_format          text DEFAULT 'in_person',
  ADD COLUMN IF NOT EXISTS persona               text,
  ADD COLUMN IF NOT EXISTS relevance_score       int,
  ADD COLUMN IF NOT EXISTS match_reasons         text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS data_quality_flags    text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS confidence            numeric,
  ADD COLUMN IF NOT EXISTS possible_duplicate_of uuid REFERENCES events(id),
  ADD COLUMN IF NOT EXISTS ingested_at           timestamptz,
  ADD COLUMN IF NOT EXISTS normalized_at         timestamptz;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_status_check') THEN
    ALTER TABLE events ADD CONSTRAINT events_status_check
      CHECK (status IN ('pending','approved','rejected','needs_review'));
  END IF;
END $$;

-- 4.2  Backfill. Set all pre-existing curated rows live (status was just
-- added defaulting to 'pending'), and seed event_date from the legacy date.
UPDATE events
SET status = 'approved',
    source = COALESCE(source, 'manual')
WHERE source IS DISTINCT FROM 'apify_events_finder';

UPDATE events
SET event_date = date::timestamptz
WHERE event_date IS NULL AND date IS NOT NULL;

-- 4.3  Dedup key (partial unique index; NULL source_url rows unaffected),
-- plus supporting indexes for the public page and tab filters.
CREATE UNIQUE INDEX IF NOT EXISTS events_source_url_uniq
  ON events (source_url) WHERE source_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_status_event_date ON events (status, event_date);
CREATE INDEX IF NOT EXISTS idx_events_source ON events (source);

-- 4.4  Staging table (service-role only; RLS on, no anon/authenticated policies).
CREATE TABLE IF NOT EXISTS events_staging (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url      text UNIQUE,
  run_id          text,
  raw             jsonb NOT NULL,
  processed       boolean NOT NULL DEFAULT false,
  processed_at    timestamptz,
  target_event_id uuid REFERENCES events(id),
  ingested_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE events_staging ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON events_staging FROM anon, authenticated;

-- 4.5  Fuzzy dedup helper. Ensure pg_trgm exists (it pre-exists in public on the
-- live project, but a fresh database needs it installed) and keep it on the
-- function search_path so similarity() resolves whether it lives in public or extensions.
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE OR REPLACE FUNCTION find_duplicate_event(
  p_title text, p_event_date timestamptz, p_city text
) RETURNS uuid LANGUAGE sql STABLE
SET search_path = public, extensions
AS $$
  SELECT id FROM events
  WHERE event_date::date = p_event_date::date
    AND lower(coalesce(city,'')) = lower(coalesce(p_city,''))
    AND similarity(lower(title), lower(p_title)) > 0.55
  ORDER BY similarity(lower(title), lower(p_title)) DESC
  LIMIT 1;
$$;

-- 4.6  COALESCE-protected upsert. Idempotent on source_url. Protects
-- human-editable fields; refreshes volatile scraped facts; never overwrites status.
CREATE OR REPLACE FUNCTION upsert_normalized_event(e jsonb)
RETURNS uuid LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_dup  uuid;
  v_id   uuid;
  v_date timestamptz := nullif(e->>'event_date','')::timestamptz;
  v_slug text;
BEGIN
  v_dup := find_duplicate_event(e->>'title', v_date, e->>'city');
  -- deterministic unique slug (slug is UNIQUE-indexed); same URL yields same slug
  v_slug := left(regexp_replace(lower(coalesce(e->>'title','event')), '[^a-z0-9]+', '-', 'g'), 60)
            || '-' || left(md5(coalesce(e->>'source_url', e->>'title')), 6);

  INSERT INTO events (
    source_url, source, source_platform, status,
    title, description, slug, type, category,
    event_date, date, location, venue,
    city, state_region, country, event_format, sector, persona, image_url,
    relevance_score, match_reasons, tags, data_quality_flags,
    confidence, possible_duplicate_of, date_precision, ingested_at, normalized_at
  ) VALUES (
    e->>'source_url', 'apify_events_finder', e->>'source_platform',
    CASE
      WHEN (e->>'is_anz')::boolean IS FALSE                                THEN 'rejected'
      WHEN e->>'flags' LIKE '%date_unparseable%'                           THEN 'rejected'
      WHEN v_dup IS NOT NULL                                               THEN 'needs_review'
      WHEN coalesce((e->>'confidence')::numeric, 0) < 0.6                  THEN 'needs_review'
      WHEN coalesce((e->>'relevance_score')::int, 0) >= 85
           AND coalesce((e->>'confidence')::numeric, 0) >= 0.85           THEN 'approved'
      ELSE 'needs_review'
    END,
    e->>'title',
    COALESCE(NULLIF(e->>'editorial_description',''), e->>'title'),
    v_slug,
    COALESCE(NULLIF(e->>'event_type',''), 'Networking'),
    COALESCE(NULLIF(e->>'sector',''), 'Founders & Startups'),
    v_date,
    v_date::date,
    COALESCE(NULLIF(e->>'location',''),
             NULLIF(concat_ws(', ', nullif(e->>'venue',''), e->>'city'),''),
             e->>'city', 'Australia'),
    NULLIF(e->>'venue',''),
    e->>'city', e->>'state_region',
    COALESCE(NULLIF(e->>'country',''),'AU'),
    CASE WHEN (e->>'is_online')::boolean THEN 'virtual' ELSE 'in_person' END,
    NULLIF(e->>'sector',''), NULLIF(e->>'persona',''), NULLIF(e->>'image_url',''),
    nullif(e->>'relevance_score','')::int,
    string_to_array(nullif(e->>'match_reasons',''), '||'),
    string_to_array(nullif(e->>'tags',''), '||'),
    string_to_array(nullif(e->>'flags',''), ','),
    nullif(e->>'confidence','')::numeric, v_dup, 'exact', now(), now()
  )
  ON CONFLICT (source_url) WHERE source_url IS NOT NULL DO UPDATE SET
    title       = COALESCE(NULLIF(events.title, ''), EXCLUDED.title),
    description = COALESCE(NULLIF(events.description, ''), EXCLUDED.description),
    venue       = COALESCE(NULLIF(events.venue, ''), EXCLUDED.venue),
    image_url   = COALESCE(NULLIF(events.image_url, ''), EXCLUDED.image_url),
    sector      = COALESCE(NULLIF(events.sector, ''), EXCLUDED.sector),
    event_date      = EXCLUDED.event_date,
    date            = EXCLUDED.date,
    relevance_score = EXCLUDED.relevance_score,
    match_reasons   = CASE WHEN events.match_reasons IS NULL OR events.match_reasons = '{}'::text[]
                           THEN EXCLUDED.match_reasons ELSE events.match_reasons END,
    normalized_at   = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

REVOKE EXECUTE ON FUNCTION find_duplicate_event(text, timestamptz, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION upsert_normalized_event(jsonb) FROM public, anon, authenticated;

-- 4.7  Replace the blanket public-read policy with a status gate.
-- RLS is already enabled. Existing admin INSERT/UPDATE/DELETE policies are kept.
DROP POLICY IF EXISTS "Events are publicly readable" ON events;
CREATE POLICY events_public_read ON events
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');
