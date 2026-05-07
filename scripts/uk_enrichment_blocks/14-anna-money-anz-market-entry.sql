DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'anna-money-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug anna-money-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The UK SME bank that entered Australia by buying rather than building — in its first-ever acquisition',
    tldr = ARRAY['The UK SME bank that entered Australia by buying rather than building — in its first-ever acquisition', 'ANNA Money was founded in London in 2017 by Eduard Panteleev and Alexei Grachev.']::text[],
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
    VALUES (v_id, 'Eduard Panteleev', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alexei Grachev', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>ANNA Money was founded in London in 2017 by Eduard Panteleev and Alexei Grachev. It built a business current account, corporate card, invoicing, bookkeeping, and tax platform for the 1–19 employee micro-business segment. ANNA serves 70,000+ small businesses in the UK.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>ANNA Money was founded in London in 2017 by Eduard Panteleev and Alexei Grachev. It built a business current account, corporate card, invoicing, bookkeeping, and tax platform for the 1–19 employee micro-business segment. ANNA serves 70,000+ small businesses in the UK.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>March 2024 – Strategic Acquisition of GetCape:</strong> ANNA made its first-ever acquisition and its first international market entry simultaneously, by purchasing Sydney-based GetCape — a business spend management platform and corporate card issuer.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>March 2024 – Strategic Acquisition of GetCape:</strong> ANNA made its first-ever acquisition and its first international market entry simultaneously, by purchasing Sydney-based GetCape — a business spend management platform and corporate card issuer.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>The acquisition gave ANNA: an Australian-regulated entity with licences and infrastructure; a team of Australian fintech experts; an existing customer base; and GetCape founder Ryan Edwards-Pritchard, who stayed on to lead the Australian business under the ANNA brand.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>The acquisition gave ANNA: an Australian-regulated entity with licences and infrastructure; a team of Australian fintech experts; an existing customer base; and GetCape founder Ryan Edwards-Pritchard, who stayed on to lead the Australian business under the ANNA brand.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024–2025 – Building the Combined Product:</strong> ANNA combined its UK capabilities with GetCape''s Australian foundation, building a smart business current account and debit card, followed by invoicing, bookkeeping, GST/BAS-compliant tax calculations, and tax filings — positioning against Australia''s 2.5 million small businesses underserved by the big four banks.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024–2025 – Building the Combined Product:</strong> ANNA combined its UK capabilities with GetCape''s Australian foundation, building a smart business current account and debit card, followed by invoicing, bookkeeping, GST/BAS-compliant tax calculations, and tax filings — positioning against Australia''s 2.5 million small businesses underserved by the big four banks.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Method</strong>: First-ever acquisition and first international expansion (March 2024)</li><li><strong>Acquired Company</strong>: GetCape, Sydney — business spend management and corporate cards</li><li><strong>ANZ Market Size</strong>: 2.5 million small businesses (1–19 employees)</li><li><strong>Market Growth</strong>: Business spend management: $21B+ globally, growing 11.9% per year</li><li><strong>Retained Leadership</strong>: GetCape founder Ryan Edwards-Pritchard retained as ANZ lead</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Method</strong>: First-ever acquisition and first international expansion (March 2024)</li><li><strong>Acquired Company</strong>: GetCape, Sydney — business spend management and corporate cards</li><li><strong>ANZ Market Size</strong>: 2.5 million small businesses (1–19 employees)</li><li><strong>Market Growth</strong>: Business spend management: $21B+ globally, growing 11.9% per year</li><li><strong>Retained Leadership</strong>: GetCape founder Ryan Edwards-Pritchard retained as ANZ lead</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, ANNA Money''s playbook offers a clear template. The lessons below are drawn from ANNA Money''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, ANNA Money''s playbook offers a clear template. The lessons below are drawn from ANNA Money''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'UK Fintech Anna.Money expands into Australia with acquisition of GetCape', 'https://newshub.medianet.com.au/2024/03/uk-fintech-anna-money-expands-into-australia-with-acquisition-of-getcape/41061/', 49, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'UK fintech Anna Money acquires Sydney-based GetCape', 'https://www.finextra.com/pressarticle/100024/uk-fintech-anna-money-acquires-sydney-based-getcape', 50, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANNA acquires GetCape in Australia (ANNA blog)', 'https://anna.money/blog/updates/anna-acquires-getcape-in-australia/', 51, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
