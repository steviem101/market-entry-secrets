DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'dext-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug dext-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'How a London accounting startup rode Xero''s wave to become the default pre-accounting tool for a million users',
    tldr = ARRAY['How a London accounting startup rode Xero''s wave to become the default pre-accounting tool for a million users', 'Xero — the New Zealand-founded accounting software giant — commands 70–80% of Australia''s cloud accounting market with 1.77 million subscribers.', 'Dext was founded in London in 2010 by Michael Wood.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "AccountingTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Michael Wood', 'Founder', true);
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
    UPDATE content_bodies SET body_text = '<p>Dext was founded in London in 2010 by Michael Wood. Its product takes a photo of a receipt, extracts supplier, amount, date, and GST data automatically, and pushes it directly into accounting software. Dext rebranded from Receipt Bank in February 2021, simultaneously passing 1 million global users. It now serves 700,000+ users across 40+ countries.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Dext was founded in London in 2010 by Michael Wood. Its product takes a photo of a receipt, extracts supplier, amount, date, and GST data automatically, and pushes it directly into accounting software. Dext rebranded from Receipt Bank in February 2021, simultaneously passing 1 million global users. It now serves 700,000+ users across 40+ countries.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Xero — the New Zealand-founded accounting software giant — commands 70–80% of Australia''s cloud accounting market with 1.77 million subscribers. Any product that deeply integrated with Xero and solved a real problem for accounting and bookkeeping partners would automatically have distribution into hundreds of thousands of Australian small businesses.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Xero — the New Zealand-founded accounting software giant — commands 70–80% of Australia''s cloud accounting market with 1.77 million subscribers. Any product that deeply integrated with Xero and solved a real problem for accounting and bookkeeping partners would automatically have distribution into hundreds of thousands of Australian small businesses.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2015–2016 – Via Xero:</strong> Dext entered Australia through deep Xero integration, with Australian accountants able to add Receipt Bank as a direct extension of Xero workflows. Vicky Skipp was appointed VP of Sales APAC, building a local Sydney-based team.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2015–2016 – Via Xero:</strong> Dext entered Australia through deep Xero integration, with Australian accountants able to add Receipt Bank as a direct extension of Xero workflows. Vicky Skipp was appointed VP of Sales APAC, building a local Sydney-based team.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – Xerocon Brisbane:</strong> The breakthrough moment was sponsoring and hosting a 200-person river cruise at Xerocon Brisbane — 3,500 accountants and bookkeepers from Australia, New Zealand, and Singapore. Hundreds of accounting practices converted to active customers following the event.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – Xerocon Brisbane:</strong> The breakthrough moment was sponsoring and hosting a 200-person river cruise at Xerocon Brisbane — 3,500 accountants and bookkeepers from Australia, New Zealand, and Singapore. Hundreds of accounting practices converted to active customers following the event.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019 – Xavier (Dext Precision) Acquisition:</strong> Dext acquired Xavier Analytics, a popular Australian-facing Xero data quality tool, deepening its position from "receipt capture" to "practice intelligence platform."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019 – Xavier (Dext Precision) Acquisition:</strong> Dext acquired Xavier Analytics, a popular Australian-facing Xero data quality tool, deepening its position from "receipt capture" to "practice intelligence platform."</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2021 – 1 Million Users:</strong> Receipt Bank celebrated 1 million global users and rebranded to Dext, with Australia among its most significant markets.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2021 – 1 Million Users:</strong> Receipt Bank celebrated 1 million global users and rebranded to Dext, with Australia among its most significant markets.</p>', 6, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Global Users</strong>: 1 million+ (February 2021)</li><li><strong>ANZ Distribution</strong>: Deep integration with Xero (1.77M Australian subscribers)</li><li><strong>Xerocon Presence</strong>: Major sponsor, 3,500+ attendees</li><li><strong>Platform Coverage</strong>: Xero, MYOB, QuickBooks Online</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Global Users</strong>: 1 million+ (February 2021)</li><li><strong>ANZ Distribution</strong>: Deep integration with Xero (1.77M Australian subscribers)</li><li><strong>Xerocon Presence</strong>: Major sponsor, 3,500+ attendees</li><li><strong>Platform Coverage</strong>: Xero, MYOB, QuickBooks Online</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Dext''s playbook offers a clear template. The lessons below are drawn from Dext''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Dext''s playbook offers a clear template. The lessons below are drawn from Dext''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Receipt Bank passes 1 million users, reinforces brand', 'https://www.canadian-accountant.com/content/technology/receipt-bank-passes-1-million-users', 40, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Why Xero''s Market Share Benefits Australian Businesses', 'https://www.scalesuite.com.au/resources/xero-market-share-australian-businesses', 41, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Transforming the Accounting Industry: a Xerocon to Remember', 'https://dext.com/en/blog/single/transforming-the-accounting-industry-a-xerocon-to-remember', 42, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
