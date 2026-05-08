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
    'nium-anz-market-entry', 'How Nium Entered the ANZ Market', 'Singapore B2B payments infrastructure company that expanded into Australia first and then deepened its Oceania footprint through New Zealand registration and real-time payout capabilities.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Singapore B2B payments infrastructure company that expanded into Australia first and then deepened its Oceania footprint through New Zealand registration and real-time payout capabilities.', 'Nium is relevant to MES because it demonstrates a classic infrastructure expansion model: build relevance with Australian business customers first, then use licensing and network depth to broaden the regional moat.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech Infrastructure"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Nium', 'Singapore', 'Australia & New Zealand',
      '2018-01-01', 'Fintech Infrastructure', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Prajit Nanu', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Michael Bermingham', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Nium is relevant to MES because it demonstrates a classic infrastructure expansion model: build relevance with Australian business customers first, then use licensing and network depth to broaden the regional moat. It is particularly useful for companies in embedded finance, B2B SaaS, cross-border payments, and regulated fintech.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Nium is relevant to MES because it demonstrates a classic infrastructure expansion model: build relevance with Australian business customers first, then use licensing and network depth to broaden the regional moat. It is particularly useful for companies in embedded finance, B2B SaaS, cross-border payments, and regulated fintech.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>Nium originated as Instarem in Singapore and evolved from consumer remittance into broader B2B payments infrastructure.</li><li>The company built an established Oceania footprint, including Australia, before announcing that two of the three largest spend-management platforms in Australia were using its network.</li><li>In April 2024, Nium announced registration as a Financial Service Provider in New Zealand, describing it as a first step toward offering a wider service stack locally.</li><li>In 2025, Nium expanded real-time payouts into Australia through the New Payments Platform, reinforcing the practical value of its ANZ network.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>Nium originated as Instarem in Singapore and evolved from consumer remittance into broader B2B payments infrastructure.</li><li>The company built an established Oceania footprint, including Australia, before announcing that two of the three largest spend-management platforms in Australia were using its network.</li><li>In April 2024, Nium announced registration as a Financial Service Provider in New Zealand, describing it as a first step toward offering a wider service stack locally.</li><li>In 2025, Nium expanded real-time payouts into Australia through the New Payments Platform, reinforcing the practical value of its ANZ network.</li></ol>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Regulatory progression</strong> — Nium secured New Zealand FSPR registration in 2024.</li><li><strong>Customer traction</strong> — Nium said leading Australian spend platforms already used its network.</li><li><strong>Capability depth</strong> — Real-time Australia payouts via NPP strengthened the local product proposition.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Regulatory progression</strong> — Nium secured New Zealand FSPR registration in 2024.</li><li><strong>Customer traction</strong> — Nium said leading Australian spend platforms already used its network.</li><li><strong>Capability depth</strong> — Real-time Australia payouts via NPP strengthened the local product proposition.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, Nium''s playbook offers a clear template. The lessons below distil Nium''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, Nium''s playbook offers a clear template. The lessons below distil Nium''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Nium approved as a registered financial service provider in New Zealand', 'https://www.nium.com/newsroom/nium-registered-financial-service-provider-in-new-zealand', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'PR Newswire version of Nium NZ registration', 'https://www.prnewswire.com/news-releases/nium-approved-as-a-registered-financial-service-provider-in-new-zealand-302117055.html', 2, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IBS Intelligence coverage of Nium NZ registration', 'https://ibsintelligence.com/ibsi-news/nium-approved-as-a-registered-financial-service-provider-in-new-zealand/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
