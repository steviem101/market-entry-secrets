DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'complyadvantage-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug complyadvantage-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'Entering ANZ ahead of the regulatory wave — the AML compliance play that knew what was coming',
    tldr = ARRAY['Entering ANZ ahead of the regulatory wave — the AML compliance play that knew what was coming', 'Australia''s Tranche 2 AML reforms — extending AML obligations to approximately 90,000 new entities including lawyers, accountants, and real estate agents — had been discussed since 2007 and commenced 1 July 2026.', 'ComplyAdvantage was founded in London in 2014 by Charles Delingpole.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Charles Delingpole', 'Founder & CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>ComplyAdvantage was founded in London in 2014 by Charles Delingpole. It provides AI-driven financial crime risk intelligence for AML, sanctions, and fraud risk screening, serving 1,000+ clients in 75+ countries including HSBC, Santander, Starling Bank, and Wise.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>ComplyAdvantage was founded in London in 2014 by Charles Delingpole. It provides AI-driven financial crime risk intelligence for AML, sanctions, and fraud risk screening, serving 1,000+ clients in 75+ countries including HSBC, Santander, Starling Bank, and Wise.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia''s Tranche 2 AML reforms — extending AML obligations to approximately 90,000 new entities including lawyers, accountants, and real estate agents — had been discussed since 2007 and commenced 1 July 2026. ComplyAdvantage entered precisely to be positioned ahead of this demand explosion.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia''s Tranche 2 AML reforms — extending AML obligations to approximately 90,000 new entities including lawyers, accountants, and real estate agents — had been discussed since 2007 and commenced 1 July 2026. ComplyAdvantage entered precisely to be positioned ahead of this demand explosion.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2019 – APAC MD Appointed:</strong> Jaede Tan was appointed Managing Director, Asia-Pacific, based in Sydney — committed to local leadership rather than remote management from London.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2019 – APAC MD Appointed:</strong> Jaede Tan was appointed Managing Director, Asia-Pacific, based in Sydney — committed to local leadership rather than remote management from London.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019–2021 – FinTech Australia Membership:</strong> ComplyAdvantage joined FinTech Australia, positioning itself as the compliance infrastructure layer for Australian fintechs and neobanks building AML-regulated products.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019–2021 – FinTech Australia Membership:</strong> ComplyAdvantage joined FinTech Australia, positioning itself as the compliance infrastructure layer for Australian fintechs and neobanks building AML-regulated products.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2022 – Content Authority:</strong> The company invested in ANZ-specific regulatory content — AUSTRAC guides, AML framework analyses, Tranche 2 reform timelines — establishing thought leadership that drove inbound leads from compliance officers and CTOs.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2022 – Content Authority:</strong> The company invested in ANZ-specific regulatory content — AUSTRAC guides, AML framework analyses, Tranche 2 reform timelines — establishing thought leadership that drove inbound leads from compliance officers and CTOs.</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024–2026 – Tranche 2 Demand Wave:</strong> As Tranche 2 legislation passed with a 1 July 2026 commencement date, ComplyAdvantage''s ANZ pipeline expanded significantly.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024–2026 – Tranche 2 Demand Wave:</strong> As Tranche 2 legislation passed with a 1 July 2026 commencement date, ComplyAdvantage''s ANZ pipeline expanded significantly.</p>', 6, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>APAC Leadership</strong>: Jaede Tan, MD Asia-Pacific, Sydney-based</li><li><strong>Community Presence</strong>: FinTech Australia member</li><li><strong>Regulatory Tailwind</strong>: Tranche 2 reforms bring 90,000 new regulated entities into scope by July 2026</li><li><strong>Global Scale</strong>: 1,000+ clients, 75+ countries, $100M+ raised</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>APAC Leadership</strong>: Jaede Tan, MD Asia-Pacific, Sydney-based</li><li><strong>Community Presence</strong>: FinTech Australia member</li><li><strong>Regulatory Tailwind</strong>: Tranche 2 reforms bring 90,000 new regulated entities into scope by July 2026</li><li><strong>Global Scale</strong>: 1,000+ clients, 75+ countries, $100M+ raised</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, ComplyAdvantage''s playbook offers a clear template. The lessons below are drawn from ComplyAdvantage''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, ComplyAdvantage''s playbook offers a clear template. The lessons below are drawn from ComplyAdvantage''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tranche 2 reforms 2026: A complete guide for DNFBPs', 'https://complyadvantage.com/insights/tranche-2-aml-reforms/', 31, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tranche 2 AML/CFT reforms land 1 July 2026 (LinkedIn)', 'https://www.linkedin.com/posts/complyadvantage_tranche-2-amlcft-reforms-land-1-activity-7430431069931200512-jpNF', 32, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Australian AML/CFT Regulatory Framework', 'https://complyadvantage.com/insights/australian-aml-cft-regulatory-framework/', 33, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
