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
    'secretlab-anz-market-entry', 'How Secretlab Entered the ANZ Market', 'Premium gaming chair brand from Singapore that used direct-to-consumer international shipping and global brand-building to enter Australia early, without the usual distributor-first playbook.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Premium gaming chair brand from Singapore that used direct-to-consumer international shipping and global brand-building to enter Australia early, without the usual distributor-first playbook.', 'Secretlab is one of the clearest examples of a Singapore company entering Australia with a brand-led, e-commerce-first model rather than through local distributors.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "Consumer Hardware / Gaming"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Secretlab', 'Singapore', 'Australia & New Zealand',
      '2016-01-01', 'Consumer Hardware / Gaming', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Ian Ang', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alaric Choo', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Secretlab is one of the clearest examples of a Singapore company entering Australia with a brand-led, e-commerce-first model rather than through local distributors. For MES, it is useful because it shows that premium price points can work in Australia when product quality, community positioning, and global social proof are strong enough.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Secretlab is one of the clearest examples of a Singapore company entering Australia with a brand-led, e-commerce-first model rather than through local distributors. For MES, it is useful because it shows that premium price points can work in Australia when product quality, community positioning, and global social proof are strong enough.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>Secretlab was founded by Ian Ang and Alaric Choo after their own dissatisfaction with existing gaming chairs and launched its first products in 2015.</li><li>The company''s own timeline states it went to Australia in June 2016 with the OMEGA Stealth, making ANZ one of its early international markets.</li><li>Rather than build out physical retail stores, Secretlab expanded through its own online storefront, global shipping, community marketing, esports credibility, and premium ergonomics positioning.</li><li>The company kept strengthening brand status globally through licensed collaborations, creator ecosystems, and premium product lines, which supported continued demand in Australia.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>Secretlab was founded by Ian Ang and Alaric Choo after their own dissatisfaction with existing gaming chairs and launched its first products in 2015.</li><li>The company''s own timeline states it went to Australia in June 2016 with the OMEGA Stealth, making ANZ one of its early international markets.</li><li>Rather than build out physical retail stores, Secretlab expanded through its own online storefront, global shipping, community marketing, esports credibility, and premium ergonomics positioning.</li><li>The company kept strengthening brand status globally through licensed collaborations, creator ecosystems, and premium product lines, which supported continued demand in Australia.</li></ol>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Early ANZ entry</strong> — Australia appeared in Secretlab''s official historical timeline as an expansion market in 2016.</li><li><strong>Model</strong> — Direct-to-consumer rollout reduced distributor dependence and preserved brand control.</li><li><strong>Brand scale</strong> — Australia became part of a much broader global market footprint across many countries.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Early ANZ entry</strong> — Australia appeared in Secretlab''s official historical timeline as an expansion market in 2016.</li><li><strong>Model</strong> — Direct-to-consumer rollout reduced distributor dependence and preserved brand control.</li><li><strong>Brand scale</strong> — Australia became part of a much broader global market footprint across many countries.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, Secretlab''s playbook offers a clear template. The lessons below distil Secretlab''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, Secretlab''s playbook offers a clear template. The lessons below distil Secretlab''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Secretlab Australia About Us timeline', 'https://secretlabchairs.com.au/pages/about-us', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Secretlab regions page', 'https://secretlabchairs.com.au/pages/regions', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Secretlab official site', 'https://secretlab.co', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
