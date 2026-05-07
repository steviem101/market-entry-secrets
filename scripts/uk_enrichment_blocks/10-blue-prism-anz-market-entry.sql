DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'blue-prism-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug blue-prism-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The RPA pioneer that put 20,000 hours back into Telstra — and sparked a $130M UK tech investment wave',
    tldr = ARRAY['The RPA pioneer that put 20,000 hours back into Telstra — and sparked a $130M UK tech investment wave', 'Blue Prism was founded in Warrington, England in 2001 by Alastair Bathgate and David Moss — two former accountants who believed repetitive back-office processes could be automated by software robots.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Automation"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alastair Bathgate', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'David Moss', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Blue Prism was founded in Warrington, England in 2001 by Alastair Bathgate and David Moss — two former accountants who believed repetitive back-office processes could be automated by software robots. The company coined the term "Robotic Process Automation" (RPA), listed on AIM in 2016, grew to a £2.5 billion valuation, and was acquired by SS&C Technologies for £1.27 billion in 2022.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Blue Prism was founded in Warrington, England in 2001 by Alastair Bathgate and David Moss — two former accountants who believed repetitive back-office processes could be automated by software robots. The company coined the term "Robotic Process Automation" (RPA), listed on AIM in 2016, grew to a £2.5 billion valuation, and was acquired by SS&C Technologies for £1.27 billion in 2022.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – The $130 Million UK Tech Wave:</strong> Blue Prism was one of five UK technology companies that collectively invested $130 million into Australia in 2017, creating 155 jobs, in a coordinated announcement supported by the Australian Trade and Investment Commission and the UK Department for International Trade.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – The $130 Million UK Tech Wave:</strong> Blue Prism was one of five UK technology companies that collectively invested $130 million into Australia in 2017, creating 155 jobs, in a coordinated announcement supported by the Australian Trade and Investment Commission and the UK Department for International Trade.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – SI Alliance Strategy:</strong> Blue Prism''s go-to-market in Australia was built on Systems Integrator alliances — particularly Infosys, which attained gold-level Blue Prism certification in 2017.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – SI Alliance Strategy:</strong> Blue Prism''s go-to-market in Australia was built on Systems Integrator alliances — particularly Infosys, which attained gold-level Blue Prism certification in 2017.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2021 – Telstra T22: The Landmark Win:</strong> Infosys used Blue Prism to automate complex processes as part of Telstra''s T22 transformation strategy, returning over 20,000 man-hours to Telstra''s business over 12–18 months. Infosys won both the APAC and Global Telecommunications Blue Prism Partner Excellence Awards for this work.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2021 – Telstra T22: The Landmark Win:</strong> Infosys used Blue Prism to automate complex processes as part of Telstra''s T22 transformation strategy, returning over 20,000 man-hours to Telstra''s business over 12–18 months. Infosys won both the APAC and Global Telecommunications Blue Prism Partner Excellence Awards for this work.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Investment</strong>: Part of $130M UK tech wave; 155 jobs created (2017)</li><li><strong>Landmark ANZ Client</strong>: Telstra (T22 transformation)</li><li><strong>Telstra Impact</strong>: 20,000+ man-hours returned to business over 12–18 months</li><li><strong>Corporate Outcome</strong>: Acquired by SS&C Technologies for £1.27 billion (2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Investment</strong>: Part of $130M UK tech wave; 155 jobs created (2017)</li><li><strong>Landmark ANZ Client</strong>: Telstra (T22 transformation)</li><li><strong>Telstra Impact</strong>: 20,000+ man-hours returned to business over 12–18 months</li><li><strong>Corporate Outcome</strong>: Acquired by SS&C Technologies for £1.27 billion (2022)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Blue Prism''s playbook offers a clear template. The lessons below are drawn from Blue Prism''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Blue Prism''s playbook offers a clear template. The lessons below are drawn from Blue Prism''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infosys wins global award for CX automation project with Telstra', 'https://www.consultancy.com.au/news/3833/infosys-wins-global-award-for-cx-automation-project-with-telstra', 36, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, '5 UK tech providers ploughed $130M into Australia during 2017', 'https://www.arnnet.com.au/article/1265281/5-uk-tech-providers-ploughed-130m-into-australia-during-2017.html', 37, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Blue Prism alliance (Infosys)', 'https://www.infosys.com/about/alliances/blue-prism.html', 38, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infosys Wins Two Awards at Blue Prism World 2021', 'https://www.infosys.com/newsroom/press-releases/2021/delivering-intelligent-automation-based-solutions-awards2021.html', 39, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
