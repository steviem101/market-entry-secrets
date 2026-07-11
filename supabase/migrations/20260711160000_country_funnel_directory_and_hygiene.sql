-- Country pages v2, part 2: funnel telemetry, listing-page directory RPC,
-- RLS hygiene for the public directory tables, and a nightly orphan sweep
-- for country_entity_links.

----------------------------------------------------------------------
-- 1. Funnel telemetry (mirrors intake_form_events: anyone can insert,
--    admins read, client roles get INSERT only).
----------------------------------------------------------------------

CREATE TABLE public.country_page_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL,
  country_slug  text NOT NULL,
  event_type    text NOT NULL CHECK (event_type IN
                  ('page_view','report_creator_click','intro_request_click','lead_capture_submit')),
  section       text,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_country_page_events_slug_type
  ON public.country_page_events (country_slug, event_type, created_at);

ALTER TABLE public.country_page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert country_page_events"
  ON public.country_page_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can read country_page_events"
  ON public.country_page_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON TABLE public.country_page_events FROM anon;
REVOKE ALL ON TABLE public.country_page_events FROM authenticated;
GRANT INSERT ON TABLE public.country_page_events TO anon;
GRANT INSERT ON TABLE public.country_page_events TO authenticated;
GRANT SELECT ON TABLE public.country_page_events TO authenticated;

----------------------------------------------------------------------
-- 2. Listing-page directory RPC: every country with true data-density
--    signals (approved links + editorial coverage) in one call.
----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_country_directory()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
SELECT COALESCE(jsonb_agg(jsonb_build_object(
  'id', c.id,
  'name', c.name,
  'slug', c.slug,
  'description', c.description,
  'featured', c.featured,
  'sort_order', c.sort_order,
  'key_industries', c.key_industries,
  'trade_relationship_strength', c.trade_relationship_strength,
  'economic_indicators', c.economic_indicators,
  'has_page_content', EXISTS (
    SELECT 1 FROM country_page_content p WHERE p.country_id = c.id),
  'case_study_count', (
    SELECT COUNT(*) FROM country_case_studies cs WHERE cs.country_id = c.id),
  'mentor_count', (
    SELECT COUNT(*) FROM country_entity_links l
    WHERE l.country_id = c.id AND l.entity_type = 'mentor' AND l.status = 'approved'),
  'agency_count', (
    SELECT COUNT(*) FROM country_entity_links l
    WHERE l.country_id = c.id AND l.entity_type = 'agency' AND l.status = 'approved'),
  'investor_count', (
    SELECT COUNT(*) FROM country_entity_links l
    WHERE l.country_id = c.id AND l.entity_type = 'investor' AND l.status = 'approved'),
  'provider_count', (
    SELECT COUNT(*) FROM country_entity_links l
    WHERE l.country_id = c.id AND l.entity_type = 'service_provider' AND l.status = 'approved')
) ORDER BY c.featured DESC, c.sort_order NULLS LAST, c.name), '[]'::jsonb)
FROM countries c;
$$;

GRANT EXECUTE ON FUNCTION public.get_country_directory() TO anon;
GRANT EXECUTE ON FUNCTION public.get_country_directory() TO authenticated;

----------------------------------------------------------------------
-- 3. RLS hygiene: the six public directory tables ran with RLS disabled
--    (reads were already safe because anon/authenticated hold SELECT-only
--    grants, but the house invariant is RLS everywhere). Enabling RLS with
--    an explicit public-read policy preserves behaviour exactly: client
--    writes stay blocked at the grant layer and the service role bypasses
--    RLS for enrichment jobs.
----------------------------------------------------------------------

ALTER TABLE public.countries                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_sectors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_ecosystem      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_investment_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read countries"
  ON public.countries FOR SELECT USING (true);
CREATE POLICY "Anyone can read locations"
  ON public.locations FOR SELECT USING (true);
CREATE POLICY "Anyone can read industry_sectors"
  ON public.industry_sectors FOR SELECT USING (true);
CREATE POLICY "Anyone can read service_providers"
  ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Anyone can read innovation_ecosystem"
  ON public.innovation_ecosystem FOR SELECT USING (true);
CREATE POLICY "Anyone can read trade_investment_agencies"
  ON public.trade_investment_agencies FOR SELECT USING (true);

----------------------------------------------------------------------
-- 4. Nightly orphan sweep: country_entity_links carries a polymorphic
--    entity_id (no hard FK), so a scheduled job removes links whose
--    entity row no longer exists. Guarded to no-op where pg_cron is not
--    installed (preview branches), mirroring stripe-webhook-reconcile.
----------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron not installed; skipping country-links-orphan-sweep schedule';
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'country-links-orphan-sweep') THEN
    PERFORM cron.unschedule('country-links-orphan-sweep');
  END IF;
  PERFORM cron.schedule(
    'country-links-orphan-sweep',
    '10 17 * * *',
    $cron$
    DELETE FROM public.country_entity_links l
    WHERE (l.entity_type = 'mentor'
           AND NOT EXISTS (SELECT 1 FROM public.community_members e WHERE e.id = l.entity_id))
       OR (l.entity_type = 'agency'
           AND NOT EXISTS (SELECT 1 FROM public.trade_investment_agencies e WHERE e.id = l.entity_id))
       OR (l.entity_type = 'service_provider'
           AND NOT EXISTS (SELECT 1 FROM public.service_providers e WHERE e.id = l.entity_id))
       OR (l.entity_type = 'investor'
           AND NOT EXISTS (SELECT 1 FROM public.investors e WHERE e.id = l.entity_id))
       OR (l.entity_type = 'event'
           AND NOT EXISTS (SELECT 1 FROM public.events e WHERE e.id = l.entity_id))
       OR (l.entity_type IN ('case_study', 'content_item')
           AND NOT EXISTS (SELECT 1 FROM public.content_items e WHERE e.id = l.entity_id));
    $cron$
  );
END $$;
