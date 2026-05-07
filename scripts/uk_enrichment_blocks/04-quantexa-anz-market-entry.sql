DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'quantexa-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug quantexa-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The big-data financial crime platform that made 7 of 10 Australian banks its customers',
    tldr = ARRAY['The big-data financial crime platform that made 7 of 10 Australian banks its customers', 'Australia and the UK share common financial crime regulatory frameworks.', 'Quantexa was founded in London in 2016 by Vishal Marria, a former HSBC head of financial crime intelligence.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Vishal Marria', 'Founder & CEO', true);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Quantexa was founded in London in 2016 by Vishal Marria, a former HSBC head of financial crime intelligence. Its Contextual Decision Intelligence (CDI) platform resolves entities across massive datasets, builds network graphs connecting customers and counterparties, and uses AI to surface criminal relationships invisible to traditional rules-based AML systems. It became a unicorn in 2022 after raising $129 million in a Series E, reaching a $1.8 billion valuation in 2023.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Quantexa was founded in London in 2016 by Vishal Marria, a former HSBC head of financial crime intelligence. Its Contextual Decision Intelligence (CDI) platform resolves entities across massive datasets, builds network graphs connecting customers and counterparties, and uses AI to surface criminal relationships invisible to traditional rules-based AML systems. It became a unicorn in 2022 after raising $129 million in a Series E, reaching a $1.8 billion valuation in 2023.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia and the UK share common financial crime regulatory frameworks. AUSTRAC''s record $1.3 billion enforcement action against Westpac in 2020 — the world''s largest-ever AML penalty — created critical urgency for banks to upgrade financial crime detection capabilities.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia and the UK share common financial crime regulatory frameworks. AUSTRAC''s record $1.3 billion enforcement action against Westpac in 2020 — the world''s largest-ever AML penalty — created critical urgency for banks to upgrade financial crime detection capabilities.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>June 2017 – Sydney APAC HQ:</strong> Quantexa opened its Sydney office as its first Asia-Pacific location, led by Shaun Mathieson — a former senior leader at BAE Systems, SAS Institute, and Gresham Technologies. The founding strategy: Quantexa''s UK bank clients (HSBC, Standard Chartered) had ANZ operations, and the Sydney team''s first calls were to those existing clients'' Australian operations.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>June 2017 – Sydney APAC HQ:</strong> Quantexa opened its Sydney office as its first Asia-Pacific location, led by Shaun Mathieson — a former senior leader at BAE Systems, SAS Institute, and Gresham Technologies. The founding strategy: Quantexa''s UK bank clients (HSBC, Standard Chartered) had ANZ operations, and the Sydney team''s first calls were to those existing clients'' Australian operations.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017–2020 – Building the Big-Four Roster:</strong> By 2021, Quantexa was in use at 7 of the top 10 banks in both the UK and Australia — a benchmark the company used publicly to establish sector authority.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017–2020 – Building the Big-Four Roster:</strong> By 2021, Quantexa was in use at 7 of the top 10 banks in both the UK and Australia — a benchmark the company used publicly to establish sector authority.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2021 – 108% Revenue Growth:</strong> Revenues more than doubled in FY2020, with 67% from new client wins. AML sales rose 80%; growth outside core financial crime expanded 280%.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2021 – 108% Revenue Growth:</strong> Revenues more than doubled in FY2020, with 67% from new client wins. AML sales rose 80%; growth outside core financial crime expanded 280%.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Market Penetration</strong>: 7 of top 10 UK and Australian banks (2021)</li><li><strong>Revenue Growth</strong>: 108% in FY2020; 67% from new client wins</li><li><strong>Unicorn</strong>: $1.8B valuation (2023) following $129M Series E</li><li><strong>ANZ Offices</strong>: Sydney APAC HQ (2017), Melbourne (2018)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Market Penetration</strong>: 7 of top 10 UK and Australian banks (2021)</li><li><strong>Revenue Growth</strong>: 108% in FY2020; 67% from new client wins</li><li><strong>Unicorn</strong>: $1.8B valuation (2023) following $129M Series E</li><li><strong>ANZ Offices</strong>: Sydney APAC HQ (2017), Melbourne (2018)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Quantexa''s playbook offers a clear template. The lessons below are drawn from Quantexa''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Quantexa''s playbook offers a clear template. The lessons below are drawn from Quantexa''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Global rising tech star Quantexa grows 108% and expands new products', 'https://pressreleases.responsesource.com/news/101315/global-rising-tech-star-quantexa-grows-and-expands-new-products/', 14, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AML/Fraud Solution of the Year: Quantexa Asia Risk Awards 2021', 'https://www.biia.com/aml-fraud-solution-of-the-year-quantexa-asia-risk-awards-2021/', 15, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Big data scale-up Quantexa formally recognised (FF News)', 'https://ffnews.com/newsarticle/big-data-scale-up-quantexa-formally-recognised-for-its-commitment-to-financial-crime-detection-for-the-worlds-biggest-banks/', 16, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
