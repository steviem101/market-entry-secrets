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
    'learnupon-anz-market-entry', 'How LearnUpon Entered the ANZ Market', 'How a Dublin-founded learning management system company grew to 100+ APAC enterprise customers, 80% headcount growth in two years, and a bigger Sydney HQ — by proving demand first globally and then investing in regional density when the customer base justified it.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['How a Dublin-founded learning management system company grew to 100+ APAC enterprise customers, 80% headcount growth in two years, and a bigger Sydney HQ — by proving demand first globally and then investing in regional density when the customer base justified it.', 'LearnUpon was founded in June 2012 by Brendan Noud (CEO) and Des Anderson (CTO) in Dublin.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Edtech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'LearnUpon', 'Ireland', 'Australia & New Zealand',
      NULL, 'Edtech', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Brendan Noud', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Des Anderson', 'Co-founder & CTO', false);
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
    UPDATE content_bodies SET body_text = '<p>LearnUpon was founded in June 2012 by Brendan Noud (CEO) and Des Anderson (CTO) in Dublin. It builds learning management software that companies use to train employees, customers and partners at scale. By 2026 it served more than 1,500 global customers across 40+ countries, with over 20 million active users and 150 million completed courses on the platform.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>LearnUpon was founded in June 2012 by Brendan Noud (CEO) and Des Anderson (CTO) in Dublin. It builds learning management software that companies use to train employees, customers and partners at scale. By 2026 it served more than 1,500 global customers across 40+ countries, with over 20 million active users and 150 million completed courses on the platform.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>In October 2020, LearnUpon raised a $56 million Series A from Summit Partners — one of Ireland''s largest edtech funding rounds — which accelerated product investment and international hiring. Australia and the broader APAC region were priorities in that growth plan.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In October 2020, LearnUpon raised a $56 million Series A from Summit Partners — one of Ireland''s largest edtech funding rounds — which accelerated product investment and international hiring. Australia and the broader APAC region were priorities in that growth plan.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>LearnUpon''s Sydney office had been operational for more than six years by early 2026. Rather than a dramatic launch, its ANZ presence was built incrementally — winning enterprise customers, building a local support function and growing the team as APAC revenue justified investment. In June 2024, it appointed Fiona Sweeney as APAC Director, signalling stronger regional leadership commitment.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>LearnUpon''s Sydney office had been operational for more than six years by early 2026. Rather than a dramatic launch, its ANZ presence was built incrementally — winning enterprise customers, building a local support function and growing the team as APAC revenue justified investment. In June 2024, it appointed Fiona Sweeney as APAC Director, signalling stronger regional leadership commitment.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p>In March 2026, LearnUpon announced it was accelerating APAC expansion through a larger Sydney headquarters at JustCo, deeper regional investment and the integration of Courseau — an AI-native course creation platform it had recently acquired. The announcement confirmed 100+ customers in the APAC region and said local headcount had grown 80% over two years.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In March 2026, LearnUpon announced it was accelerating APAC expansion through a larger Sydney headquarters at JustCo, deeper regional investment and the integration of Courseau — an AI-native course creation platform it had recently acquired. The announcement confirmed 100+ customers in the APAC region and said local headcount had grown 80% over two years.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p><em>LearnUpon''s APAC story is a counterpoint to acquisition-led entries. Sometimes the right move is not to buy — it''s to serve the customers who find you, then invest in local density once the concentration justifies it.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>LearnUpon''s APAC story is a counterpoint to acquisition-led entries. Sometimes the right move is not to buy — it''s to serve the customers who find you, then invest in local density once the concentration justifies it.</em></p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Healthcare Australia</strong> — Healthcare / Staffing <em>(Workforce learning and compliance training)</em></li><li><strong>WorkPac</strong> — Labour hire <em>(Onboarding and skills training at scale)</em></li><li><strong>Jetpilot</strong> — Consumer goods <em>(Product knowledge and dealer training)</em></li><li><strong>Montu</strong> — Pharmaceutical <em>(Regulatory and clinical learning)</em></li><li><strong>Morningstar</strong> — Financial services <em>(Professional development)</em></li><li><strong>ACSO</strong> — Corrections/Justice <em>(Staff training and compliance)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Healthcare Australia</strong> — Healthcare / Staffing <em>(Workforce learning and compliance training)</em></li><li><strong>WorkPac</strong> — Labour hire <em>(Onboarding and skills training at scale)</em></li><li><strong>Jetpilot</strong> — Consumer goods <em>(Product knowledge and dealer training)</em></li><li><strong>Montu</strong> — Pharmaceutical <em>(Regulatory and clinical learning)</em></li><li><strong>Morningstar</strong> — Financial services <em>(Professional development)</em></li><li><strong>ACSO</strong> — Corrections/Justice <em>(Staff training and compliance)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, LearnUpon''s playbook offers a clear template. The lessons below distil LearnUpon''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, LearnUpon''s playbook offers a clear template. The lessons below distil LearnUpon''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let customer pull justify local investment</strong> — Grew APAC organically for six-plus years before making a bigger local commitment. <em>(Don''t invest in regional office and leadership before the customer demand exists. Let inbound traction tell you when the market is ready for more investment.)</em></li><li><strong>Add AI to accelerate regional relevance</strong> — Used the Courseau acquisition to offer AI course creation as a local differentiator. <em>(An AI acquisition can refresh the expansion story in a region that already knows your product.)</em></li><li><strong>Name the local headcount growth</strong> — Cited 80% headcount growth in two years as a proof point in expansion announcement. <em>(Percentage headcount growth is a powerful signal — it shows the region is a real business unit, not a satellite sales office.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Let customer pull justify local investment</strong> — Grew APAC organically for six-plus years before making a bigger local commitment. <em>(Don''t invest in regional office and leadership before the customer demand exists. Let inbound traction tell you when the market is ready for more investment.)</em></li><li><strong>Add AI to accelerate regional relevance</strong> — Used the Courseau acquisition to offer AI course creation as a local differentiator. <em>(An AI acquisition can refresh the expansion story in a region that already knows your product.)</em></li><li><strong>Name the local headcount growth</strong> — Cited 80% headcount growth in two years as a proof point in expansion announcement. <em>(Percentage headcount growth is a powerful signal — it shows the region is a real business unit, not a satellite sales office.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LearnUpon — APAC expansion announcement (newsroom)', 'https://www.learnupon.com/newsroom/learnupon-accelerates-apac-expansion/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IT Brief Australia — APAC growth and Courseau', 'https://itbrief.com.au/story/learnupon-boosts-apac-growth-with-ai-course-platform', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Medianet — Sydney HQ and Courseau acquisition', 'https://newshub.medianet.com.au/2026/03/learnupon-accelerates-apac-expansion-with-new-sydney-headquarters-and-ai-native-courseau/144128/', 3, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mirage News — APAC Sydney HQ update', 'https://www.miragenews.com/learnupon-expands-apac-with-sydney-hq-ai-1637940/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'BusinessWire — 2025 year-end performance and global recognition', 'https://www.businesswire.com/news/home/20260129847362/en/LearnUpon-Ends-2025-With-Breakthrough-Growth-Product-Innovation-and-Global-Recognition', 5, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
