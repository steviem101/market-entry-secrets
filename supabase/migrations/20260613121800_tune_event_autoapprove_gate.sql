-- ============================================================
-- Tune the events auto-approve gate: relevance_score >= 85 -> >= 70
-- Target: MES Platform (xhziwveaiuhzdoutpgrh) ONLY
-- The pilot showed the Apify actor scores most genuinely relevant founder
-- events at 70, so the >= 85 gate held the majority in review. Lowering the
-- score floor to 70 (confidence floor unchanged at 0.85) pushes the confident
-- majority live automatically. Duplicates, non-ANZ, and unparseable-date
-- events are still held back regardless of score.
-- Only the auto-approve branch changes; everything else is identical to the
-- original unified_events_pipeline definition.
-- ============================================================

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
      WHEN coalesce((e->>'relevance_score')::int, 0) >= 70
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

REVOKE EXECUTE ON FUNCTION upsert_normalized_event(jsonb) FROM public, anon, authenticated;
