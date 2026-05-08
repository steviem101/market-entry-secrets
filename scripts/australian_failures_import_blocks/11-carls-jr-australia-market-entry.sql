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
    'carls-jr-australia-market-entry', 'How Carl''s Jr. Struggled in the Australian Market', 'The US burger chain Carl''s Jr. stormed into Australia in 2016 promising hundreds of stores and a bold challenge to McDonald''s and KFC.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['The US burger chain Carl''s Jr.', 'CJ''s Group entered voluntary administration in July 2024 with KPMG as administrators.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "QSR / Food"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Carl''s Jr.', 'https://img.logo.dev/carlsjr.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://carlsjr.com', 'United States', 'Australia',
      '2016-01-01', 'QSR / Food', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://carlsjr.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/carlsjr.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>The US burger chain Carl''s Jr. stormed into Australia in 2016 promising hundreds of stores and a bold challenge to McDonald''s and KFC. By July 2024, its master franchisee CJ''s Group had entered voluntary administration with 24 stores affected and 20 immediately closed.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>The US burger chain Carl''s Jr. stormed into Australia in 2016 promising hundreds of stores and a bold challenge to McDonald''s and KFC. By July 2024, its master franchisee CJ''s Group had entered voluntary administration with 24 stores affected and 20 immediately closed.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Carl''s Jr. used a master franchisee model, with CJ''s Group Pty Ltd independently owning and operating 24 restaurants and holding a master licence over another 25 sub-franchised locations. The chain expanded aggressively, targeting regional NSW, Queensland, and Victoria.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Carl''s Jr. used a master franchisee model, with CJ''s Group Pty Ltd independently owning and operating 24 restaurants and holding a master licence over another 25 sub-franchised locations. The chain expanded aggressively, targeting regional NSW, Queensland, and Victoria.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Over-expansion into regional/low-density locations</strong> — The brand placed a significant number of stores in regional areas described as "the middle of nowhere" — locations with insufficient foot traffic to sustain QSR economics.</li><li><strong>Reduced discretionary spending</strong> — The cost-of-living pressures of 2023–24 hit fast-casual spending hard, particularly in regional and suburban markets.</li><li><strong>Master franchise model created a capital mismatch</strong> — CJ''s Group was simultaneously responsible for building a store network and managing day-to-day operations without the capital base of a corporate operator.</li><li><strong>Marketing never connected with locals</strong> — Unlike McDonald''s and KFC, which had decades of Australian brand equity, Carl''s Jr. never established a distinctive local identity.</li><li><strong>Fierce competition</strong> — Entering an already crowded QSR market dominated by entrenched global brands with massive marketing and loyalty programme advantages was extremely difficult without clear product differentiation.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Over-expansion into regional/low-density locations</strong> — The brand placed a significant number of stores in regional areas described as "the middle of nowhere" — locations with insufficient foot traffic to sustain QSR economics.</li><li><strong>Reduced discretionary spending</strong> — The cost-of-living pressures of 2023–24 hit fast-casual spending hard, particularly in regional and suburban markets.</li><li><strong>Master franchise model created a capital mismatch</strong> — CJ''s Group was simultaneously responsible for building a store network and managing day-to-day operations without the capital base of a corporate operator.</li><li><strong>Marketing never connected with locals</strong> — Unlike McDonald''s and KFC, which had decades of Australian brand equity, Carl''s Jr. never established a distinctive local identity.</li><li><strong>Fierce competition</strong> — Entering an already crowded QSR market dominated by entrenched global brands with massive marketing and loyalty programme advantages was extremely difficult without clear product differentiation.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>CJ''s Group entered voluntary administration in July 2024 with KPMG as administrators. Creditors elected to liquidate the operator in November 2024. Twenty stores closed immediately; approximately 29 sub-franchised and independently operated stores survived and have been absorbed under a direct franchise model. Carl''s Jr.''s parent CKE has confirmed plans to continue in Australia with five new direct-franchise stores.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>CJ''s Group entered voluntary administration in July 2024 with KPMG as administrators. Creditors elected to liquidate the operator in November 2024. Twenty stores closed immediately; approximately 29 sub-franchised and independently operated stores survived and have been absorbed under a direct franchise model. Carl''s Jr.''s parent CKE has confirmed plans to continue in Australia with five new direct-franchise stores.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Carl''s Jr.''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Carl''s Jr.''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>QSR expansion into regional markets requires verified population density and foot traffic data</strong> — Not all Australian cities and regions support international QSR economics.</li><li><strong>Master franchise capital structures need scrutiny</strong> — A master franchisee is only as stable as its own balance sheet.</li><li><strong>Brand differentiation is existential in crowded QSR markets</strong> — Without a compelling reason to choose Carl''s Jr. over McDonald''s, KFC, or Hungry Jack''s, Australians defaulted to the familiar.</li><li><strong>Price sensitivity in cost-of-living downturns hits QSR hard</strong> — Discretionary food spend is the first to compress — model downside scenarios explicitly.</li><li><strong>Sub-franchise survival after master franchise collapse is instructive</strong> — The 25 independently operated stores survived while the directly owned stores failed — sub-franchisees had stronger local skin in the game.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>QSR expansion into regional markets requires verified population density and foot traffic data</strong> — Not all Australian cities and regions support international QSR economics.</li><li><strong>Master franchise capital structures need scrutiny</strong> — A master franchisee is only as stable as its own balance sheet.</li><li><strong>Brand differentiation is existential in crowded QSR markets</strong> — Without a compelling reason to choose Carl''s Jr. over McDonald''s, KFC, or Hungry Jack''s, Australians defaulted to the familiar.</li><li><strong>Price sensitivity in cost-of-living downturns hits QSR hard</strong> — Discretionary food spend is the first to compress — model downside scenarios explicitly.</li><li><strong>Sub-franchise survival after master franchise collapse is instructive</strong> — The 25 independently operated stores survived while the directly owned stores failed — sub-franchisees had stronger local skin in the game.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, '10Play/The Project', 'https://10play.com.au/theproject/articles/carls-jr-to-shut-aussie-stores-after-going-into-voluntary-administration/tpa240730yint', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wikipedia – Carl''s Jr.', 'https://en.wikipedia.org/wiki/Carl%27s_Jr', 2, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'QSR Media', 'https://qsrmedia.com.au/executive-insights/exclusive/carls-jr-eyes-aussie-expansion-after-master-franchise-setback', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
