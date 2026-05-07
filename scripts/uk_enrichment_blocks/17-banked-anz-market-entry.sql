DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'banked-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug banked-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'How a London payments startup partnered with NAB to become the engine behind Australia''s Pay by Bank revolution',
    tldr = ARRAY['How a London payments startup partnered with NAB to become the engine behind Australia''s Pay by Bank revolution', 'Australia''s New Payments Platform (NPP, launched 2018) and Australian Payments Plus (AP+) PayTo scheme provide the national real-time payment infrastructure that makes A2A payments viable at scale.', 'Banked was founded in London in 2018 by Brad Goodall, a former Goldman Sachs and Visa executive.']::text[],
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
    VALUES (v_id, 'Brad Goodall', 'Founder & CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>Banked was founded in London in 2018 by Brad Goodall, a former Goldman Sachs and Visa executive. It built an account-to-account (A2A) payments network — technology that allows consumers and businesses to pay directly from their bank account to a merchant, bypassing card networks and their 1–3% interchange fees. Investors include NAB Ventures, Citi Ventures, and Insight Partners.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Banked was founded in London in 2018 by Brad Goodall, a former Goldman Sachs and Visa executive. It built an account-to-account (A2A) payments network — technology that allows consumers and businesses to pay directly from their bank account to a merchant, bypassing card networks and their 1–3% interchange fees. Investors include NAB Ventures, Citi Ventures, and Insight Partners.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia''s New Payments Platform (NPP, launched 2018) and Australian Payments Plus (AP+) PayTo scheme provide the national real-time payment infrastructure that makes A2A payments viable at scale. NAB processes around 40% of all A2A payments via NPP — making it the dominant A2A bank in Australia.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia''s New Payments Platform (NPP, launched 2018) and Australian Payments Plus (AP+) PayTo scheme provide the national real-time payment infrastructure that makes A2A payments viable at scale. NAB processes around 40% of all A2A payments via NPP — making it the dominant A2A bank in Australia.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022 – NAB Ventures Investment:</strong> NAB Ventures participated in Banked''s $15M Series A extension alongside Citi Ventures and Insight Partners — a strategic investment to build out NAB''s PayTo merchant capability.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022 – NAB Ventures Investment:</strong> NAB Ventures participated in Banked''s $15M Series A extension alongside Citi Ventures and Insight Partners — a strategic investment to build out NAB''s PayTo merchant capability.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>May 2024 – Pay by Bank Commercial Launch:</strong> Banked and NAB launched Pay by Bank commercially for Australian merchants, using AP+''s PayTo services. The first cohort of NAB business customers went live in H1 2024 across e-commerce, retail, and non-bank lenders.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>May 2024 – Pay by Bank Commercial Launch:</strong> Banked and NAB launched Pay by Bank commercially for Australian merchants, using AP+''s PayTo services. The first cohort of NAB business customers went live in H1 2024 across e-commerce, retail, and non-bank lenders.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p>Brad Goodall cited Australia''s "well-constructed regulatory mandates and industry primed for innovation" as the foundation for rapid A2A growth.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Brad Goodall cited Australia''s "well-constructed regulatory mandates and industry primed for innovation" as the foundation for rapid A2A growth.</p>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Partner</strong>: National Australia Bank (NAB)</li><li><strong>NAB''s A2A Position</strong>: 40% of all NPP payments in Australia</li><li><strong>Investment</strong>: NAB Ventures invested in $15M Series A extension (2022)</li><li><strong>Commercial Launch</strong>: H1 2024 — NAB merchant customers live with Pay by Bank</li><li><strong>Investor Base</strong>: NAB Ventures, Citi Ventures, Insight Partners</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Partner</strong>: National Australia Bank (NAB)</li><li><strong>NAB''s A2A Position</strong>: 40% of all NPP payments in Australia</li><li><strong>Investment</strong>: NAB Ventures invested in $15M Series A extension (2022)</li><li><strong>Commercial Launch</strong>: H1 2024 — NAB merchant customers live with Pay by Bank</li><li><strong>Investor Base</strong>: NAB Ventures, Citi Ventures, Insight Partners</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Banked''s playbook offers a clear template. The lessons below are drawn from Banked''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Banked''s playbook offers a clear template. The lessons below are drawn from Banked''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Banked and NAB join hands to accelerate Pay by Bank adoption', 'https://thedigitalbanker.com/banked-and-nab-join-hands-to-accelerate-pay-by-bank-adoption-in-australia/', 60, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NAB aims to fast-track merchant payments (iTnews)', 'https://www.itnews.com.au/news/nab-aims-to-fast-track-merchant-payments-607764', 61, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NAB launch Pay by Bank in Australia', 'https://paymentsindustryintelligence.com/nab-launch-pay-by-bank-in-australia/', 62, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
