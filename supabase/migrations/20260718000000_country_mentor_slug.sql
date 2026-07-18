-- SEO: return the mentor slug from get_country_page so country pages can link
-- to the mentor detail page (/mentors/experts/<slug>).
--
-- Background: the country-page audit (Finding #4) found mentor detail pages had
-- no crawlable inbound link from country pages. Agencies/providers/investors
-- already carry `slug` in this RPC's output (so their cards render real links),
-- but the mentor block did not, so the country MentorCard could only button-gate
-- the warm-intro CTA. This adds `slug` to the mentor JSON (additive, non-breaking).
--
-- `slug` is public (it is already emitted in the DB-driven sitemap and on the
-- mentors directory). It is read from community_members_public — the anon-safe,
-- PII-masked view the RPC already uses — so no new data is exposed. The function
-- stays a plain STABLE (SECURITY INVOKER) SQL function; RLS still governs reads.
--
-- Faithful CREATE OR REPLACE of the live definition (as of migration
-- 20260711220000_country_review_fixes) with the single mentor `slug` addition.

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
      'id', cm.id, 'slug', cm.slug, 'name', cm.name, 'title', cm.title, 'company', cm.company,
      'specialties', cm.specialties, 'location', cm.location,
      'archetype', cm.archetype, 'photo', cm.avatar_url,
      -- Anonymised mentors: drop the curated blurb, which names their real
      -- role/employer and would otherwise defeat the public-view masking.
      'blurb', CASE WHEN cm.is_anonymous THEN NULL ELSE l.blurb END,
      'is_featured', l.is_featured
    ) ORDER BY l.rank)
    FROM ranked_links l
    JOIN community_members_public cm ON cm.id = l.entity_id
    WHERE l.entity_type = 'mentor' AND cm.is_active AND l.rank <= 6
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
    WHERE l.entity_type = 'agency' AND t.is_active AND l.rank <= 6
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
  'link_totals', jsonb_build_object(
    -- Counted over the SAME filtered joins the card blocks use, so the tab
    -- headers and the "top N of M" line never over-count deactivated entities.
    'mentor', (SELECT COUNT(*) FROM ranked_links l
               JOIN community_members_public cm ON cm.id = l.entity_id
               WHERE l.entity_type = 'mentor' AND cm.is_active),
    'agency', (SELECT COUNT(*) FROM ranked_links l
               JOIN trade_investment_agencies t ON t.id = l.entity_id
               WHERE l.entity_type = 'agency' AND t.is_active),
    'service_provider', (SELECT COUNT(*) FROM ranked_links l
               JOIN service_providers sp ON sp.id = l.entity_id
               WHERE l.entity_type = 'service_provider'),
    'investor', (SELECT COUNT(*) FROM ranked_links l
               JOIN investors_public iv ON iv.id = l.entity_id
               WHERE l.entity_type = 'investor')
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
