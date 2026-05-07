DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'onfido-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug onfido-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The invisible identity engine that powers Australia''s fintech onboarding',
    tldr = ARRAY['The invisible identity engine that powers Australia''s fintech onboarding', 'Onfido was founded in Oxford in 2012 by three Oxford University computer scientists.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
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
    UPDATE content_bodies SET body_text = '<p>Onfido was founded in Oxford in 2012 by three Oxford University computer scientists. Its AI identity verification platform analyses identity documents and biometric checks from 195 countries to confirm identity in seconds. The platform processed 200M+ identity checks before being acquired by Entrust in 2024 (with $130M+ ARR at acquisition). It serves 1,200+ businesses including HSBC, Toyota, Bitstamp, and Revolut globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Onfido was founded in Oxford in 2012 by three Oxford University computer scientists. Its AI identity verification platform analyses identity documents and biometric checks from 195 countries to confirm identity in seconds. The platform processed 200M+ identity checks before being acquired by Entrust in 2024 (with $130M+ ARR at acquisition). It serves 1,200+ businesses including HSBC, Toyota, Bitstamp, and Revolut globally.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2018–2019 – UK Client Pull-Through:</strong> Onfido''s ANZ market entry was primarily pull-through: UK clients expanding to Australia — most notably Revolut — needed Onfido''s integration to cover Australian documents and AUSTRAC-compliant KYC flows. Onfido invested in adding all Australian state driver''s licences, Medicare card support, and AUSTRAC-compliant liveness detection.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2018–2019 – UK Client Pull-Through:</strong> Onfido''s ANZ market entry was primarily pull-through: UK clients expanding to Australia — most notably Revolut — needed Onfido''s integration to cover Australian documents and AUSTRAC-compliant KYC flows. Onfido invested in adding all Australian state driver''s licences, Medicare card support, and AUSTRAC-compliant liveness detection.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>The Revolut Australia Effect:</strong> When Revolut launched in Australia in 2020, every customer was verified through an Onfido identity check. As Revolut grew to 1 million Australian users, Onfido''s ANZ transaction volume grew proportionately — a significant revenue stream with no dedicated ANZ sales team.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>The Revolut Australia Effect:</strong> When Revolut launched in Australia in 2020, every customer was verified through an Onfido identity check. As Revolut grew to 1 million Australian users, Onfido''s ANZ transaction volume grew proportionately — a significant revenue stream with no dedicated ANZ sales team.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019–2023 – Platform-Level ANZ Presence:</strong> Onfido became the go-to identity verification infrastructure for Australian fintechs, neobanks, BNPL providers, and crypto exchanges emerging in this period.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019–2023 – Platform-Level ANZ Presence:</strong> Onfido became the go-to identity verification infrastructure for Australian fintechs, neobanks, BNPL providers, and crypto exchanges emerging in this period.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024 – Entrust Acquisition:</strong> Onfido was acquired by Entrust, integrating its AI into Entrust''s broader global identity security portfolio.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024 – Entrust Acquisition:</strong> Onfido was acquired by Entrust, integrating its AI into Entrust''s broader global identity security portfolio.</p>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Model</strong>: B2B2C — UK clients expanding to ANZ pulled Onfido with them</li><li><strong>Notable ANZ Client</strong>: Revolut Australia (powers onboarding for 1M+ Australians)</li><li><strong>Global Scale</strong>: 200M+ identity checks; 1,200+ clients; 195 countries</li><li><strong>Corporate Outcome</strong>: Acquired by Entrust (2024) at $130M+ ARR</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Model</strong>: B2B2C — UK clients expanding to ANZ pulled Onfido with them</li><li><strong>Notable ANZ Client</strong>: Revolut Australia (powers onboarding for 1M+ Australians)</li><li><strong>Global Scale</strong>: 200M+ identity checks; 1,200+ clients; 195 countries</li><li><strong>Corporate Outcome</strong>: Acquired by Entrust (2024) at $130M+ ARR</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Onfido''s playbook offers a clear template. The lessons below are drawn from Onfido''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Onfido''s playbook offers a clear template. The lessons below are drawn from Onfido''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut hits 1m Aussie users, plans AUD $400m push (CFOtech)', 'https://cfotech.com.au/story/revolut-hits-1m-aussie-users-plans-aud-400m-push', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Onfido: A Global Leader in Automated ID Verification', 'https://fintechmagazine.com/fraud-id-verification/onfido-global-leader-in-id-verification', 34, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Onfido Alternative: VOVE ID vs Onfido (Entrust acquisition context)', 'https://blog.voveid.com/onfido-alternative-vove-id-vs-onfido-for-emerging-market-fintechs/', 35, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
