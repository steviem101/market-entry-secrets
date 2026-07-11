-- Country pages v2: canonical corridor affinity layer + single-fetch RPC.
--
-- Context: country affinity was previously answered six different ways
-- (origin_country text columns, lowercase enums, iso2 + jurisdiction arrays,
-- and runtime ILIKE keyword scans that fetched whole tables client-side).
-- This migration introduces one curated links table as the read path for the
-- /countries/:slug ecosystem sections, plus get_country_page() so the page
-- loads in a single round trip.
--
-- Publishing rule: only status='approved' rows are publicly visible. Rule
-- seeds below land Ireland links as approved (curation reviewed in ticket)
-- and every other country as pending for later review.

----------------------------------------------------------------------
-- 1. Links table
----------------------------------------------------------------------

CREATE TABLE public.country_entity_links (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id    uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  entity_type   text NOT NULL CHECK (entity_type IN
                  ('mentor','agency','service_provider','investor','event','case_study','content_item')),
  entity_id     uuid NOT NULL,
  relationship  text NOT NULL CHECK (relationship IN
                  ('origin_support','landing_support','proof','capital','community','talent')),
  relevance     integer NOT NULL DEFAULT 5 CHECK (relevance BETWEEN 1 AND 10),
  blurb         text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  source        text NOT NULL DEFAULT 'manual' CHECK (source IN ('rule','manual','ai_suggested')),
  is_featured   boolean NOT NULL DEFAULT false,
  sort_order    integer,
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_id, entity_type, entity_id)
);

CREATE INDEX idx_country_entity_links_read
  ON public.country_entity_links (country_id, entity_type, status, relevance DESC);
CREATE INDEX idx_country_entity_links_entity
  ON public.country_entity_links (entity_type, entity_id);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.country_entity_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

----------------------------------------------------------------------
-- 2. RLS: public can read approved links only; admin-only writes.
--    Grant lockdown per SEC-01: client roles get SELECT only.
----------------------------------------------------------------------

ALTER TABLE public.country_entity_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved country_entity_links"
  ON public.country_entity_links FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can read all country_entity_links"
  ON public.country_entity_links FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can insert country_entity_links"
  ON public.country_entity_links FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update country_entity_links"
  ON public.country_entity_links FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete country_entity_links"
  ON public.country_entity_links FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

REVOKE INSERT, UPDATE, DELETE ON TABLE public.country_entity_links FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.country_entity_links FROM authenticated;
GRANT SELECT ON TABLE public.country_entity_links TO anon;
GRANT SELECT ON TABLE public.country_entity_links TO authenticated;

----------------------------------------------------------------------
-- 3. Rule seeds (idempotent; safe on an empty preview DB where the
--    SELECTs simply return zero rows).
--
--    Origin token map mirrors the community_members.origin_country enum:
--    ireland | uk | usa | singapore | canada | japan | korea | france.
----------------------------------------------------------------------

-- 3a. Mentors: origin-country match. Ireland lands approved (relevance by
--     archetype); all other countries land pending for review.
WITH origin_map(slug, token) AS (
  VALUES ('ireland','ireland'), ('united-kingdom','uk'), ('united-states','usa'),
         ('singapore','singapore'), ('canada','canada'), ('japan','japan'),
         ('south-korea','korea'), ('france','france')
)
INSERT INTO public.country_entity_links
  (country_id, entity_type, entity_id, relationship, relevance, status, source)
SELECT c.id, 'mentor', cm.id, 'community',
       CASE WHEN c.slug = 'ireland' AND cm.archetype = 'Trade & Government' THEN 8
            WHEN c.slug = 'ireland' THEN 6
            ELSE 5 END,
       CASE WHEN c.slug = 'ireland' THEN 'approved' ELSE 'pending' END,
       'rule'
FROM origin_map m
JOIN public.countries c ON c.slug = m.slug
JOIN public.community_members cm
  ON cm.is_active AND lower(coalesce(cm.origin_country, '')) = m.token
ON CONFLICT (country_id, entity_type, entity_id) DO NOTHING;

-- 3b. Agencies: structured match on country_iso2 (origin-side agencies) or
--     jurisdiction membership (bilateral / landing-side coverage).
WITH iso_map(slug, iso2) AS (
  VALUES ('ireland','IE'), ('united-kingdom','GB'), ('united-states','US'),
         ('singapore','SG'), ('canada','CA'), ('japan','JP'),
         ('south-korea','KR'), ('france','FR')
)
INSERT INTO public.country_entity_links
  (country_id, entity_type, entity_id, relationship, relevance, status, source)
SELECT c.id, 'agency', t.id,
       CASE WHEN t.country_iso2 = m.iso2 THEN 'origin_support' ELSE 'community' END,
       CASE WHEN c.slug = 'ireland' THEN 8 ELSE 5 END,
       CASE WHEN c.slug = 'ireland' THEN 'approved' ELSE 'pending' END,
       'rule'
FROM iso_map m
JOIN public.countries c ON c.slug = m.slug
JOIN public.trade_investment_agencies t
  ON t.is_active
 AND (t.country_iso2 = m.iso2
      OR EXISTS (
        SELECT 1 FROM unnest(coalesce(t.jurisdiction, '{}')) j
        WHERE lower(j) IN (lower(c.name), lower(replace(c.slug, '-', ' ')), lower(replace(c.slug, '-', '_')))
      ))
ON CONFLICT (country_id, entity_type, entity_id) DO NOTHING;

-- 3c. Ireland manual curation (reviewed in the country-pages-v2 ticket).
--     Invest Northern Ireland carries iso2=GB, so the rule above maps it to
--     the UK; it also serves NI companies entering ANZ, so link it to
--     Ireland explicitly. Austrade and Investment NSW are the landing-side
--     front doors for any inbound founder.
INSERT INTO public.country_entity_links
  (country_id, entity_type, entity_id, relationship, relevance, blurb, status, source, is_featured)
SELECT c.id, 'agency', t.id, v.relationship, v.relevance, v.blurb, 'approved', 'manual', v.is_featured
FROM public.countries c
JOIN (VALUES
  ('enterprise-ireland', 'origin_support', 10,
   'The first phone call for any Irish company selling into ANZ. Runs trade missions, market advisors, and grant support from Sydney.', true),
  ('irish-australian-chamber-of-commerce', 'community', 9,
   'The corridor''s standing network. Chamber events are where Irish founders meet their first Australian customers and hires.', true),
  ('invest-northern-ireland', 'origin_support', 8,
   'Origin-side support for Northern Irish companies expanding into Australia and New Zealand, with an ANZ regional director on the ground.', false),
  ('austrade', 'landing_support', 7,
   'Australia''s federal trade and investment agency. The landing-side counterpart to Enterprise Ireland for inbound market entrants.', false)
) AS v(agency_slug, relationship, relevance, blurb, is_featured) ON true
JOIN public.trade_investment_agencies t ON t.slug = v.agency_slug AND t.is_active
WHERE c.slug = 'ireland'
ON CONFLICT (country_id, entity_type, entity_id) DO UPDATE
SET relationship = EXCLUDED.relationship,
    relevance    = EXCLUDED.relevance,
    blurb        = EXCLUDED.blurb,
    status       = 'approved',
    source       = 'manual',
    is_featured  = EXCLUDED.is_featured;

-- 3d. Ireland featured mentors: the curated top six (official corridor
--     channels first, then operators who have made the move). Matched on
--     slug where stable, name otherwise.
INSERT INTO public.country_entity_links
  (country_id, entity_type, entity_id, relationship, relevance, blurb, status, source, is_featured)
SELECT c.id, 'mentor', cm.id, v.relationship, v.relevance, v.blurb, 'approved', 'manual', true
FROM public.countries c
JOIN (VALUES
  ('Lydia R.', 'origin_support', 10,
   'Director of Enterprise Ireland for Australia and New Zealand. The official channel for Irish exporters entering the corridor.'),
  ('Marko Previšić', 'origin_support', 9,
   'Director, ANZ at IDA Ireland. Knows the corridor in both directions, including ANZ companies setting up European bases in Ireland.'),
  ('Richard Ennis', 'origin_support', 9,
   'Regional Director ANZ at Invest Northern Ireland. First stop for Northern Irish companies landing in Sydney.'),
  ('Olwyn Connolly', 'community', 9,
   'Co-founded Squeeze after making the Ireland to Australia move herself. Deep on accounting tech and SaaS operations for new entrants.'),
  ('Cian Mcloughlin', 'community', 8,
   'Sydney-based Irish founder and recognised SaaS sales leader. Has coached a generation of Irish sellers landing in ANZ.'),
  ('David Whelan', 'community', 8,
   'Founder and CEO of Urban Rest. Scaled an Irish-founded operation across Australian cities and knows the landing playbook first-hand.')
) AS v(mentor_name, relationship, relevance, blurb) ON true
JOIN public.community_members cm ON cm.name = v.mentor_name AND cm.is_active
WHERE c.slug = 'ireland'
ON CONFLICT (country_id, entity_type, entity_id) DO UPDATE
SET relationship = EXCLUDED.relationship,
    relevance    = EXCLUDED.relevance,
    blurb        = EXCLUDED.blurb,
    status       = 'approved',
    source       = 'manual',
    is_featured  = true;

----------------------------------------------------------------------
-- 4. get_country_page(page_slug): the whole country page in one call.
--    SECURITY INVOKER: every source is either public-read or a PII-safe
--    view (community_members_public, investors_public), and the links
--    table RLS already restricts anon to approved rows.
----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_country_page(page_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
WITH country AS (
  SELECT * FROM countries WHERE slug = page_slug LIMIT 1
),
ranked_links AS (
  SELECT l.*,
         row_number() OVER (
           PARTITION BY l.entity_type
           ORDER BY l.is_featured DESC, l.relevance DESC, l.sort_order NULLS LAST, l.created_at
         ) AS rank
  FROM country_entity_links l
  JOIN country c ON c.id = l.country_id
  WHERE l.status = 'approved'
)
SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM country) THEN NULL ELSE jsonb_build_object(
  'country', (SELECT to_jsonb(c) FROM country c),
  'page_content', (
    SELECT to_jsonb(p) FROM country_page_content p
    JOIN country c ON c.id = p.country_id
  ),
  'trade_metrics', COALESCE((
    SELECT jsonb_agg(to_jsonb(m) ORDER BY m.sort_order)
    FROM country_trade_metrics m JOIN country c ON c.id = m.country_id
  ), '[]'::jsonb),
  'case_studies', COALESCE((
    SELECT jsonb_agg(
             to_jsonb(cs) || jsonb_build_object('content_item_slug', ci.slug)
             ORDER BY cs.sort_order)
    FROM country_case_studies cs
    JOIN country c ON c.id = cs.country_id
    LEFT JOIN content_items ci ON ci.id = cs.content_item_id
  ), '[]'::jsonb),
  'playbook', COALESCE((
    SELECT jsonb_agg(to_jsonb(p) ORDER BY p.stage_number)
    FROM country_playbook_stages p JOIN country c ON c.id = p.country_id
  ), '[]'::jsonb),
  'funding', COALESCE((
    SELECT jsonb_agg(to_jsonb(f) ORDER BY f.side, f.sort_order)
    FROM country_funding_instruments f JOIN country c ON c.id = f.country_id
  ), '[]'::jsonb),
  'faqs', COALESCE((
    SELECT jsonb_agg(to_jsonb(q) ORDER BY q.sort_order)
    FROM country_faqs q JOIN country c ON c.id = q.country_id
  ), '[]'::jsonb),
  'mentors', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', cm.id, 'name', cm.name, 'title', cm.title, 'company', cm.company,
      'specialties', cm.specialties, 'location', cm.location,
      'archetype', cm.archetype, 'photo', cm.avatar_url,
      'blurb', l.blurb, 'is_featured', l.is_featured
    ) ORDER BY l.rank)
    FROM ranked_links l
    JOIN community_members_public cm ON cm.id = l.entity_id
    WHERE l.entity_type = 'mentor' AND l.rank <= 6
  ), '[]'::jsonb),
  'agencies', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', t.id, 'name', t.name, 'slug', t.slug, 'description', t.description,
      'location', t.location, 'services', t.services, 'logo', t.logo,
      'role', replace(l.relationship, '_', ' '),
      'blurb', l.blurb, 'is_featured', l.is_featured
    ) ORDER BY l.rank)
    FROM ranked_links l
    JOIN trade_investment_agencies t ON t.id = l.entity_id
    WHERE l.entity_type = 'agency' AND l.rank <= 6
  ), '[]'::jsonb),
  'service_providers', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', sp.id, 'name', sp.name, 'slug', sp.slug, 'description', sp.description,
      'location', sp.location, 'services', sp.services, 'logo', sp.logo,
      'website', sp.website, 'blurb', l.blurb, 'is_featured', l.is_featured
    ) ORDER BY l.rank)
    FROM ranked_links l
    JOIN service_providers sp ON sp.id = l.entity_id
    WHERE l.entity_type = 'service_provider' AND l.rank <= 6
  ), '[]'::jsonb),
  'investors', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', iv.id, 'name', iv.name, 'slug', iv.slug, 'description', iv.description,
      'location', iv.location, 'investor_type', iv.investor_type,
      'sector_focus', iv.sector_focus, 'stage_focus', iv.stage_focus,
      'check_size_min', iv.check_size_min, 'check_size_max', iv.check_size_max,
      'blurb', l.blurb, 'is_featured', l.is_featured
    ) ORDER BY l.rank)
    FROM ranked_links l
    JOIN investors_public iv ON iv.id = l.entity_id
    WHERE l.entity_type = 'investor' AND l.rank <= 6
  ), '[]'::jsonb),
  'events', COALESCE((
    -- Date-filter BEFORE taking the top 6: rank is computed over all event
    -- links, so applying rank <= 6 first could starve upcoming events behind
    -- past ones.
    SELECT jsonb_agg(sub.ev ORDER BY sub.event_date NULLS LAST)
    FROM (
      SELECT e.date AS event_date,
             jsonb_build_object(
               'id', e.id, 'title', e.title, 'slug', e.slug, 'date', e.date,
               'location', e.location, 'description', e.description, 'category', e.category,
               'blurb', l.blurb
             ) AS ev
      FROM ranked_links l
      JOIN events e ON e.id = l.entity_id
      WHERE l.entity_type = 'event'
        AND (e.date IS NULL OR e.date >= CURRENT_DATE)
      ORDER BY e.date NULLS LAST, l.rank
      LIMIT 6
    ) sub
  ), '[]'::jsonb),
  'link_totals', (
    -- Totals across ALL approved links per type, so tab headers and listing
    -- tiles agree even though only the top 6 render as cards.
    SELECT COALESCE(jsonb_object_agg(l.entity_type, l.n), '{}'::jsonb)
    FROM (
      SELECT entity_type, COUNT(*) AS n
      FROM ranked_links GROUP BY entity_type
    ) l
  ),
  'cities', COALESCE((
    SELECT jsonb_agg(to_jsonb(loc) ORDER BY ord.i)
    FROM country_page_content p
    JOIN country c ON c.id = p.country_id
    CROSS JOIN LATERAL unnest(p.featured_city_slugs) WITH ORDINALITY AS ord(city_slug, i)
    JOIN locations loc ON loc.slug = ord.city_slug
  ), '[]'::jsonb)
) END;
$$;

GRANT EXECUTE ON FUNCTION public.get_country_page(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_country_page(text) TO authenticated;
