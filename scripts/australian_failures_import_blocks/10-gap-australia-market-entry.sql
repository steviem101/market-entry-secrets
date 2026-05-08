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
    'gap-australia-market-entry', 'How Gap Struggled in the Australian Market', 'Gap''s Australian franchise was operated by OrotonGroup — a struggling listed Australian luxury retailer — rather than by Gap itself.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Gap''s Australian franchise was operated by OrotonGroup — a struggling listed Australian luxury retailer — rather than by Gap itself.', 'In August 2017, OrotonGroup announced it would discontinue the Gap franchise.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Fashion Retail"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Gap', 'https://img.logo.dev/gap.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://gap.com', 'United States', 'Australia',
      '2014-01-01', 'Fashion Retail', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://gap.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/gap.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>Gap''s Australian franchise was operated by OrotonGroup — a struggling listed Australian luxury retailer — rather than by Gap itself. When OrotonGroup''s financial performance deteriorated, the Gap franchise was the first thing to be cut, resulting in the closure of all six Australian stores by January 2018.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Gap''s Australian franchise was operated by OrotonGroup — a struggling listed Australian luxury retailer — rather than by Gap itself. When OrotonGroup''s financial performance deteriorated, the Gap franchise was the first thing to be cut, resulting in the closure of all six Australian stores by January 2018.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Gap entered Australia through an exclusive franchise arrangement with OrotonGroup, which held the licence to operate Gap stores in the country. This gave Gap market access without direct capital investment — but transferred the execution risk to a franchise partner that was simultaneously managing its own struggling core brand.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Gap entered Australia through an exclusive franchise arrangement with OrotonGroup, which held the licence to operate Gap stores in the country. This gave Gap market access without direct capital investment — but transferred the execution risk to a franchise partner that was simultaneously managing its own struggling core brand.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Wrong partner selection</strong> — OrotonGroup was undergoing a strategic crisis of its own — CEO churn, declining core sales, and weak trading conditions. Entrusting Gap''s growth in Australia to a distressed partner was structurally risky.</li><li><strong>Franchise model divorced execution from brand standards</strong> — When OrotonGroup''s financial performance deteriorated, there was no incentive or capital to invest in the Gap stores.</li><li><strong>Soft Australian retail demand</strong> — The Australian fashion market in 2015–18 was experiencing intense competitive pressure from H&amp;M, Zara, and Uniqlo, which had entered on a fully owned basis with lower cost structures.</li><li><strong>Limited scale</strong> — Six stores was never sufficient to build brand awareness or achieve supply chain economies.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Wrong partner selection</strong> — OrotonGroup was undergoing a strategic crisis of its own — CEO churn, declining core sales, and weak trading conditions. Entrusting Gap''s growth in Australia to a distressed partner was structurally risky.</li><li><strong>Franchise model divorced execution from brand standards</strong> — When OrotonGroup''s financial performance deteriorated, there was no incentive or capital to invest in the Gap stores.</li><li><strong>Soft Australian retail demand</strong> — The Australian fashion market in 2015–18 was experiencing intense competitive pressure from H&amp;M, Zara, and Uniqlo, which had entered on a fully owned basis with lower cost structures.</li><li><strong>Limited scale</strong> — Six stores was never sufficient to build brand awareness or achieve supply chain economies.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>In August 2017, OrotonGroup announced it would discontinue the Gap franchise. All six stores closed by end of January 2018. Gap had no direct Australian operation and simply ceased to have a physical presence.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>In August 2017, OrotonGroup announced it would discontinue the Gap franchise. All six stores closed by end of January 2018. Gap had no direct Australian operation and simply ceased to have a physical presence.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Gap''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Gap''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Partner selection is a strategic decision, not a convenience</strong> — Franchising to a distressed local partner transfers entry risk without transferring execution capability.</li><li><strong>Small-scale pilots under a franchisee are rarely recoverable</strong> — Six stores was insufficient to learn, adapt, and compete in Australian fashion retail.</li><li><strong>The franchise model suits strong brands with strong partners</strong> — Pairing a mid-strength brand (Gap''s declining global position by 2017) with a financially distressed franchisee is a recipe for exit.</li><li><strong>Direct ownership of critical international operations may be necessary</strong> — In markets where brand standards are critical, a fully owned operation gives more control than a franchise.</li><li><strong>Local competitive conditions matter more than global brand equity</strong> — Gap''s global name offered little protection against locally owned H&amp;M and Zara with lower cost bases.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Partner selection is a strategic decision, not a convenience</strong> — Franchising to a distressed local partner transfers entry risk without transferring execution capability.</li><li><strong>Small-scale pilots under a franchisee are rarely recoverable</strong> — Six stores was insufficient to learn, adapt, and compete in Australian fashion retail.</li><li><strong>The franchise model suits strong brands with strong partners</strong> — Pairing a mid-strength brand (Gap''s declining global position by 2017) with a financially distressed franchisee is a recipe for exit.</li><li><strong>Direct ownership of critical international operations may be necessary</strong> — In markets where brand standards are critical, a fully owned operation gives more control than a franchise.</li><li><strong>Local competitive conditions matter more than global brand equity</strong> — Gap''s global name offered little protection against locally owned H&amp;M and Zara with lower cost bases.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Business Insider', 'https://www.businessinsider.com/gap-stores-are-closing-in-australia-2017-8', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Inside Retail Australia', 'https://insideretail.com.au/news/gap-looking-to-close-hundreds-of-stores-201811', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News (retail context)', 'https://www.abc.net.au/news/2019-02-21/australian-retailers-shut-down-by-foreign-competition/10832062', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
