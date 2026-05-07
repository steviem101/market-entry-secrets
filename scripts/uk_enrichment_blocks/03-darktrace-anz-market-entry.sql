DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'darktrace-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug darktrace-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The Cambridge AI that made Australian cybersecurity self-learning',
    tldr = ARRAY['The Cambridge AI that made Australian cybersecurity self-learning', 'Australia faces high rates of cyber incidents — the government''s ASD Cyber Threat Report consistently lists Australian organisations among the most targeted globally.', 'Darktrace was founded in Cambridge in 2013 by mathematicians and former intelligence officers from GCHQ and MI5.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

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
    UPDATE content_bodies SET body_text = '<p>Darktrace was founded in Cambridge in 2013 by mathematicians and former intelligence officers from GCHQ and MI5. Its AI learns the normal "pattern of life" of every user, device, and connection in an organisation''s network, then autonomously detects and responds to anomalies in real time. The company listed on the London Stock Exchange in 2021 at £1.7 billion and was taken private by Thoma Bravo in 2024.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Darktrace was founded in Cambridge in 2013 by mathematicians and former intelligence officers from GCHQ and MI5. Its AI learns the normal "pattern of life" of every user, device, and connection in an organisation''s network, then autonomously detects and responds to anomalies in real time. The company listed on the London Stock Exchange in 2021 at £1.7 billion and was taken private by Thoma Bravo in 2024.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia faces high rates of cyber incidents — the government''s ASD Cyber Threat Report consistently lists Australian organisations among the most targeted globally. The English-language market, common legal system with the UK, and strong enterprise software spending made Australia a natural priority.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia faces high rates of cyber incidents — the government''s ASD Cyber Threat Report consistently lists Australian organisations among the most targeted globally. The English-language market, common legal system with the UK, and strong enterprise software spending made Australia a natural priority.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2018 – First Australian Footprint:</strong> Darktrace established a team in Sydney, targeting enterprise clients in financial services and government.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2018 – First Australian Footprint:</strong> Darktrace established a team in Sydney, targeting enterprise clients in financial services and government.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2021 – The 60% Growth Year:</strong> Darktrace''s Australian customer base grew by over 60% in 12 months, with headcount doubling across Sydney, Melbourne, and Perth. ANZ customers won in this period included Steadfast Group, WIN Corporation, Chemist Warehouse Australia, Girton Grammar School, Holman Webb Lawyers, and North Sydney Council.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2021 – The 60% Growth Year:</strong> Darktrace''s Australian customer base grew by over 60% in 12 months, with headcount doubling across Sydney, Melbourne, and Perth. ANZ customers won in this period included Steadfast Group, WIN Corporation, Chemist Warehouse Australia, Girton Grammar School, Holman Webb Lawyers, and North Sydney Council.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022–2023 – Deeper Enterprise:</strong> New wins included City Tattersalls Club, Victorian Aboriginal Child Care Agency, Grant Thornton Australia, and Lockyer Valley Regional Council. Strategic ANZ partnerships were formalised with Telstra and Tesserant.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022–2023 – Deeper Enterprise:</strong> New wins included City Tattersalls Club, Victorian Aboriginal Child Care Agency, Grant Thornton Australia, and Lockyer Valley Regional Council. Strategic ANZ partnerships were formalised with Telstra and Tesserant.</p>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Customer Growth</strong>: 60%+ YoY in Australia (2020–2021)</li><li><strong>Headcount</strong>: Doubled across Sydney, Melbourne, Perth</li><li><strong>Cross-sector Clients</strong>: Insurance, TV, retail, legal, education, local government, professional services</li><li><strong>Strategic Partners</strong>: Telstra, Tesserant</li><li><strong>Global Valuation</strong>: £1.7 billion IPO (2021); taken private by Thoma Bravo (2024)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Customer Growth</strong>: 60%+ YoY in Australia (2020–2021)</li><li><strong>Headcount</strong>: Doubled across Sydney, Melbourne, Perth</li><li><strong>Cross-sector Clients</strong>: Insurance, TV, retail, legal, education, local government, professional services</li><li><strong>Strategic Partners</strong>: Telstra, Tesserant</li><li><strong>Global Valuation</strong>: £1.7 billion IPO (2021); taken private by Thoma Bravo (2024)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Darktrace''s playbook offers a clear template. The lessons below are drawn from Darktrace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Darktrace''s playbook offers a clear template. The lessons below are drawn from Darktrace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace Expands in Australia as Demand for Self-Learning AI Surges', 'https://www.darktrace.com/news/darktrace-expands-in-australia-as-demand-for-self-learning-ai-surges', 11, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace expands Aussie presence following 60% YoY growth (Technology Decisions)', 'https://www.technologydecisions.com.au/content/security/news/darktrace-expands-aussie-presence-following-60-yoy-growth-1528659210', 12, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace Expands in Australia as Customer Demand Soars', 'https://www.darktrace.com/news/darktrace-expands-in-australia-as-customer-demand-soars', 13, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
