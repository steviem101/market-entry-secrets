DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'mimecast-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug mimecast-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = '120 partners, five cities, one channel-led playbook — the ANZ cyber resilience blueprint',
    tldr = ARRAY['120 partners, five cities, one channel-led playbook — the ANZ cyber resilience blueprint', 'Mimecast was founded in London in 2003 by Peter Bauer and Neil Murray.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Peter Bauer', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Neil Murray', 'Co-founder & CTO', false);
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
    UPDATE content_bodies SET body_text = '<p>Mimecast was founded in London in 2003 by Peter Bauer and Neil Murray. It built a cloud-based email security and cyber resilience platform. It listed on NASDAQ in 2015 and was acquired by Permira for $5.8 billion in 2022. Today it protects 42,000+ organisations globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Mimecast was founded in London in 2003 by Peter Bauer and Neil Murray. It built a cloud-based email security and cyber resilience platform. It listed on NASDAQ in 2015 and was acquired by Permira for $5.8 billion in 2022. Today it protects 42,000+ organisations globally.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2013 – Australian Launch:</strong> Mimecast officially launched in Australia in 2013, establishing offices in Melbourne and Sydney, with a channel-first go-to-market from day one.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2013 – Australian Launch:</strong> Mimecast officially launched in Australia in 2013, establishing offices in Melbourne and Sydney, with a channel-first go-to-market from day one.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2018 – Channel Milestone:</strong> In 12 months Mimecast doubled its Australian headcount, signed 40 new ANZ reseller partners, and appointed Rema Lolas as ANZ Channel Director. The annual Mimecast ANZ Partner Awards were launched in Sydney, celebrating channel partner performance across eight categories.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2018 – Channel Milestone:</strong> In 12 months Mimecast doubled its Australian headcount, signed 40 new ANZ reseller partners, and appointed Rema Lolas as ANZ Channel Director. The annual Mimecast ANZ Partner Awards were launched in Sydney, celebrating channel partner performance across eight categories.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019 – 120+ Partners:</strong> By 2019, Mimecast''s ANZ partner count reached 120+, with Nick Lennon cited as ANZ Country Manager leading the ecosystem.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019 – 120+ Partners:</strong> By 2019, Mimecast''s ANZ partner count reached 120+, with Nick Lennon cited as ANZ Country Manager leading the ecosystem.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2022 – Five-City Presence:</strong> Mimecast expanded to Sydney, Melbourne, Brisbane, Perth, and Auckland. Nick Lennon was appointed VP of Mimecast APAC. Channel team grew 20% in 2022.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2022 – Five-City Presence:</strong> Mimecast expanded to Sydney, Melbourne, Brisbane, Perth, and Auckland. Nick Lennon was appointed VP of Mimecast APAC. Channel team grew 20% in 2022.</p>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Customer Base</strong>: 1,200+ customers across Australia and New Zealand</li><li><strong>Partner Ecosystem</strong>: 120+ ANZ channel partners</li><li><strong>City Presence</strong>: Sydney, Melbourne, Brisbane, Perth, Auckland</li><li><strong>Corporate Outcome</strong>: Acquired by Permira for $5.8 billion (2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Customer Base</strong>: 1,200+ customers across Australia and New Zealand</li><li><strong>Partner Ecosystem</strong>: 120+ ANZ channel partners</li><li><strong>City Presence</strong>: Sydney, Melbourne, Brisbane, Perth, Auckland</li><li><strong>Corporate Outcome</strong>: Acquired by Permira for $5.8 billion (2022)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Mimecast''s playbook offers a clear template. The lessons below are drawn from Mimecast''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Mimecast''s playbook offers a clear template. The lessons below are drawn from Mimecast''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast takes leap into ANZ with local channel hires', 'https://channellife.com.au/story/mimecast-takes-leap-nz-five-local-hires', 27, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast ANZ names top partners at second partner awards', 'https://channellife.com.au/story/mimecast-nz-names-top-partners-second-partner-awards', 28, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast''s top ANZ channel partners of 2019', 'https://channellife.co.nz/story/mimecast-s-top-a-nz-channel-partners-of-2019', 29, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast honours A/NZ partners as channel investment rises (ARN)', 'https://www.arnnet.com.au/article/1261864/mimecast-honours-a-nz-partners-as-channel-investment-rises.html', 30, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
