DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'featurespace-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug featurespace-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'How a Cambridge AI co-founded by an ANU alumnus landed Australia''s national payment infrastructure',
    tldr = ARRAY['How a Cambridge AI co-founded by an ANU alumnus landed Australia''s national payment infrastructure', 'Featurespace was spun out of the University of Cambridge in 2008 by Dave Excell (an Australian National University engineering alumnus) and Professor Bill Fitzgerald.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Dave Excell', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Bill Fitzgerald', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Featurespace was spun out of the University of Cambridge in 2008 by Dave Excell (an Australian National University engineering alumnus) and Professor Bill Fitzgerald. It builds enterprise AI for fraud detection using Adaptive Behavioural Analytics — self-learning AI that models individual behaviour and detects anomalies in real time. In May 2023, HSBC acquired Featurespace.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Featurespace was spun out of the University of Cambridge in 2008 by Dave Excell (an Australian National University engineering alumnus) and Professor Bill Fitzgerald. It builds enterprise AI for fraud detection using Adaptive Behavioural Analytics — self-learning AI that models individual behaviour and detects anomalies in real time. In May 2023, HSBC acquired Featurespace.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>Pre-2021 – Relationship Building:</strong> Excell''s ANU alumni network — strong in Canberra''s government and payments circles — created authentic connections to eftpos, Australia''s sovereign domestic debit payment scheme.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>Pre-2021 – Relationship Building:</strong> Excell''s ANU alumni network — strong in Canberra''s government and payments circles — created authentic connections to eftpos, Australia''s sovereign domestic debit payment scheme.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>August–November 2021 – eftpos Live:</strong> Featurespace was selected to power AI-driven predictive fraud scoring across eftpos''s national online payment network as part of eftpos''s AUD $100 million digital upgrade, available to all Australian financial institutions including the big four banks.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>August–November 2021 – eftpos Live:</strong> Featurespace was selected to power AI-driven predictive fraud scoring across eftpos''s national online payment network as part of eftpos''s AUD $100 million digital upgrade, available to all Australian financial institutions including the big four banks.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022–2024 – VGW and APAC GM:</strong> Featurespace added VGW — the Perth-headquartered social gaming company — as a major ANZ client. In 2024, Phillip Finnegan was appointed APAC General Manager, based in Sydney.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022–2024 – VGW and APAC GM:</strong> Featurespace added VGW — the Perth-headquartered social gaming company — as a major ANZ client. In 2024, Phillip Finnegan was appointed APAC General Manager, based in Sydney.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Anchor Client</strong>: eftpos — Australia''s sovereign debit payment scheme</li><li><strong>Partnership Scope</strong>: AI fraud scoring available to all Australian financial institutions</li><li><strong>Investment Context</strong>: Part of eftpos''s AUD $100 million digital upgrade</li><li><strong>Founder Connection</strong>: Dave Excell — ANU engineering and IT alumni</li><li><strong>Corporate Outcome</strong>: Acquired by HSBC (2023)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Anchor Client</strong>: eftpos — Australia''s sovereign debit payment scheme</li><li><strong>Partnership Scope</strong>: AI fraud scoring available to all Australian financial institutions</li><li><strong>Investment Context</strong>: Part of eftpos''s AUD $100 million digital upgrade</li><li><strong>Founder Connection</strong>: Dave Excell — ANU engineering and IT alumni</li><li><strong>Corporate Outcome</strong>: Acquired by HSBC (2023)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Featurespace''s playbook offers a clear template. The lessons below are drawn from Featurespace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Featurespace''s playbook offers a clear template. The lessons below are drawn from Featurespace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eftpos flicks the switch on world-class AI anti-fraud technology', 'https://www.featurespace.com/newsroom/eftpos-flicks-the-switch-on-world-class-ai-anti-fraud-technology', 21, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AI-driven counter fraud platform utilised by eftpos', 'https://ecommercenews.com.au/story/ai-driven-counter-fraud-platform-utilised-by-eftpos-to-help-prevent-cybercrime', 22, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eftpos Taps into AI Anti-Fraud Technology', 'https://australiancybersecuritymagazine.com.au/eftpos-taps-into-ai-anti-fraud-technology/', 23, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eftpos using AI to fight online shopping fraud', 'https://www.technologydecisions.com.au/content/security/news/eftpos-using-ai-to-fight-online-shopping-fraud-303249929', 24, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FEATURESPACE / VGW partnership (Business Wire via Ritzau)', 'https://via.ritzau.dk/pressemeddelelse/13655463/featurespace?publisherId=90456', 25, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australia''s eftpos boosts online payment security (Finextra)', 'https://www.finextra.com/newsarticle/38599/australias-eftpos-boosts-online-payment-security', 26, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
