DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  INSERT INTO content_items (
    slug, title, subtitle, category_id, content_type, status, featured,
    read_time, tldr, quick_facts, researched_by, style_version
  ) VALUES (
    'debenhams-australia-market-entry', 'How Debenhams Struggled in the Australian Market', 'British department store Debenhams — a 240+ year-old retail institution — entered Australia with bold ambitions for 10 stores.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['British department store Debenhams — a 240+ year-old retail institution — entered Australia with bold ambitions for 10 stores.', 'The single Melbourne store closed in the late 2010s.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Department Store Retail"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category_id = EXCLUDED.category_id,
    status = EXCLUDED.status,
    read_time = EXCLUDED.read_time,
    tldr = EXCLUDED.tldr,
    quick_facts = EXCLUDED.quick_facts,
    researched_by = EXCLUDED.researched_by,
    style_version = EXCLUDED.style_version
  RETURNING id INTO v_id;

  IF NOT EXISTS (SELECT 1 FROM content_company_profiles WHERE content_id = v_id) THEN
    INSERT INTO content_company_profiles (
      content_id, company_name, company_logo, website, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Debenhams', 'https://img.logo.dev/debenhams.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://debenhams.com', 'United Kingdom', 'Australia',
      '2017-01-01', 'Department Store Retail', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://debenhams.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/debenhams.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', sort_order = 1, is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>British department store Debenhams — a 240+ year-old retail institution — entered Australia with bold ambitions for 10 stores. It opened exactly one, on Collins Street in Melbourne, and quietly shut it in the late 2010s without ever expanding beyond that single footprint.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>British department store Debenhams — a 240+ year-old retail institution — entered Australia with bold ambitions for 10 stores. It opened exactly one, on Collins Street in Melbourne, and quietly shut it in the late 2010s without ever expanding beyond that single footprint.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Debenhams planned a 10-store rollout across Australia, entering a market where Myer and David Jones — two entrenched, Australian-native department stores with strong brand loyalty, prime locations, and extensive supplier relationships — dominated the department store sector.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Debenhams planned a 10-store rollout across Australia, entering a market where Myer and David Jones — two entrenched, Australian-native department stores with strong brand loyalty, prime locations, and extensive supplier relationships — dominated the department store sector.</p>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_entry AND sort_order > 2;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', sort_order = 2, is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Department store market was already served by entrenched incumbents</strong> — Myer and David Jones had decades of brand equity, loyalty programs, and access to premium store sites. Debenhams offered nothing differentiated enough to displace them.</li><li><strong>One store was never a viable market entry</strong> — A single Collins Street store could not build the supply chain efficiency, brand awareness, or customer data that department store economics require.</li><li><strong>No clear differentiation</strong> — The Debenhams model — fashion, beauty, homeware — was indistinguishable from what Myer and David Jones already offered.</li><li><strong>UK brand not well-known in Australia</strong> — Unlike in the UK, where Debenhams had 240 years of heritage, Australian consumers had no existing loyalty or emotional connection to the brand.</li><li><strong>Timing</strong> — The late 2000s–early 2010s entry coincided with the beginning of the Australian department store sector''s decline, driven by online retail and international fast fashion.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Department store market was already served by entrenched incumbents</strong> — Myer and David Jones had decades of brand equity, loyalty programs, and access to premium store sites. Debenhams offered nothing differentiated enough to displace them.</li><li><strong>One store was never a viable market entry</strong> — A single Collins Street store could not build the supply chain efficiency, brand awareness, or customer data that department store economics require.</li><li><strong>No clear differentiation</strong> — The Debenhams model — fashion, beauty, homeware — was indistinguishable from what Myer and David Jones already offered.</li><li><strong>UK brand not well-known in Australia</strong> — Unlike in the UK, where Debenhams had 240 years of heritage, Australian consumers had no existing loyalty or emotional connection to the brand.</li><li><strong>Timing</strong> — The late 2000s–early 2010s entry coincided with the beginning of the Australian department store sector''s decline, driven by online retail and international fast fashion.</li></ul>', 1, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_success AND sort_order > 1;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', sort_order = 3, is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>The single Melbourne store closed in the late 2010s. Debenhams today has an online presence in Australia but no physical retail operation. It serves as an example of an underfunded, under-researched market entry into a structurally challenged sector.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>The single Melbourne store closed in the late 2010s. Debenhams today has an online presence in Australia but no physical retail operation. It serves as an example of an underfunded, under-researched market entry into a structurally challenged sector.</p>', 1, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order > 1;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', sort_order = 4, is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Debenhams''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Debenhams''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>A single-store pilot in a capital city is not a market test</strong> — Department store economics require multiple locations to validate supply chain efficiency and marketing return.</li><li><strong>Assess structural sector health before entering</strong> — The Australian department store sector was entering a cyclical and structural decline at the time Debenhams arrived.</li><li><strong>Brand heritage does not translate across geographies</strong> — UK brand equity means nothing to Australian consumers who have never experienced the brand.</li><li><strong>Differentiation is mandatory in mature retail sectors</strong> — "We also sell fashion, beauty, and homeware" is not a market entry thesis when Myer and David Jones already do.</li><li><strong>Underfunded pilots produce underfunded results</strong> — A commitment to 10 stores that becomes one is not a pilot — it is a half-decision that produces a half-outcome.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>A single-store pilot in a capital city is not a market test</strong> — Department store economics require multiple locations to validate supply chain efficiency and marketing return.</li><li><strong>Assess structural sector health before entering</strong> — The Australian department store sector was entering a cyclical and structural decline at the time Debenhams arrived.</li><li><strong>Brand heritage does not translate across geographies</strong> — UK brand equity means nothing to Australian consumers who have never experienced the brand.</li><li><strong>Differentiation is mandatory in mature retail sectors</strong> — "We also sell fashion, beauty, and homeware" is not a market entry thesis when Myer and David Jones already do.</li><li><strong>Underfunded pilots produce underfunded results</strong> — A commitment to 10 stores that becomes one is not a pilot — it is a half-decision that produces a half-outcome.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'YouTube documentary (global brand failures)', 'https://www.youtube.com/watch?v=VwRjyoezAYk', 1, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Inside Retail Asia', 'https://insideretail.asia/2023/02/22/why-so-many-global-brands-fail-in-australia/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'BBC – Australian retail failures', 'https://www.bbc.co.uk/news/world-australia-47450073', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
