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
    'comfortdelgro-anz-market-entry', 'How ComfortDelGro Entered the ANZ Market', 'Singapore transport giant whose Australia strategy was built through successive acquisitions, culminating in the A2B Australia deal that created the country''s largest combined taxi network.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Singapore transport giant whose Australia strategy was built through successive acquisitions, culminating in the A2B Australia deal that created the country''s largest combined taxi network.', 'ComfortDelGro is a top-tier MES acquisition case because it shows how a Singapore incumbent can build real Australian scale over time through multiple targeted purchases instead of one headline launch.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "Mobility & Transport"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      content_id, company_name, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'ComfortDelGro', 'Singapore', 'Australia & New Zealand',
      '2005-01-01', 'Mobility & Transport', NULL, NULL, NULL
    );
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
    UPDATE content_bodies SET body_text = '<p>ComfortDelGro is a top-tier MES acquisition case because it shows how a Singapore incumbent can build real Australian scale over time through multiple targeted purchases instead of one headline launch. It also illustrates how Australia can be approached as a fragmented operating market where scale is created through local asset consolidation.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>ComfortDelGro is a top-tier MES acquisition case because it shows how a Singapore incumbent can build real Australian scale over time through multiple targeted purchases instead of one headline launch. It also illustrates how Australia can be approached as a fragmented operating market where scale is created through local asset consolidation.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>ComfortDelGro entered Australia through transport operations years ago and steadily expanded in bus and point-to-point mobility.</li><li>It strengthened its position through a string of bus operator acquisitions, including Forest Coach Lines, Buslink, and B&E Blanch.</li><li>In December 2023, it announced a deal to acquire A2B Australia, owner of brands including 13cabs, Silver Service, and Cabcharge.</li><li>By April 2024, ComfortDelGro Australia said the deal had completed and that the combined network would total around 9,000 taxis, creating the largest combined taxi network in Australia.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>ComfortDelGro entered Australia through transport operations years ago and steadily expanded in bus and point-to-point mobility.</li><li>It strengthened its position through a string of bus operator acquisitions, including Forest Coach Lines, Buslink, and B&E Blanch.</li><li>In December 2023, it announced a deal to acquire A2B Australia, owner of brands including 13cabs, Silver Service, and Cabcharge.</li><li>By April 2024, ComfortDelGro Australia said the deal had completed and that the combined network would total around 9,000 taxis, creating the largest combined taxi network in Australia.</li></ol>', 2, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Scale</strong> — A2B added an 8,000-vehicle network into the group''s broader Australian mobility platform.</li><li><strong>Positioning</strong> — The combined operation was described by ComfortDelGro as the largest combined taxi network in Australia.</li><li><strong>Strategy</strong> — The company explicitly framed the transaction as part of a multi-modal scaling strategy in Australia.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Scale</strong> — A2B added an 8,000-vehicle network into the group''s broader Australian mobility platform.</li><li><strong>Positioning</strong> — The combined operation was described by ComfortDelGro as the largest combined taxi network in Australia.</li><li><strong>Strategy</strong> — The company explicitly framed the transaction as part of a multi-modal scaling strategy in Australia.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, ComfortDelGro''s playbook offers a clear template. The lessons below distil ComfortDelGro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, ComfortDelGro''s playbook offers a clear template. The lessons below distil ComfortDelGro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ComfortDelGro: A2B Australia shareholders approve acquisition proposal', 'https://www.comfortdelgro.com/news/a2b-australia-shareholders-approve-comfortdelgros-acquisition-proposal/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ComfortDelGro Australia completes A2B Australia acquisition', 'https://www.comfortdelgro.com/wp-content/uploads/2024/04/Media-Release-ComfortDelGro-Australia-completes-A2B-Australia-Acquisition.pdf', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Straits Times on ComfortDelGro''s A2B transaction', 'https://www.straitstimes.com/business/companies-markets/comfortdelgro-to-fully-acquire-taxi-network-operator-a2b-australia-for-1', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
