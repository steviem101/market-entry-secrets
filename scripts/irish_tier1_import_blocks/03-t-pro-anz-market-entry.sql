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
    't-pro-anz-market-entry', 'How T-Pro Entered the ANZ Market', 'How a Dublin-founded healthcare speech and documentation company expanded across Australia and New Zealand through three targeted acquisitions — buying local customer relationships and clinical workflow knowledge faster than any organic sales team could build them.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['How a Dublin-founded healthcare speech and documentation company expanded across Australia and New Zealand through three targeted acquisitions — buying local customer relationships and clinical workflow knowledge faster than any organic sales team could build them.', 'T-Pro is an Irish healthcare technology company specialising in speech recognition, clinical documentation and AI-enabled workflow tools for healthcare providers.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Healthcare AI"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'T-Pro', 'Ireland', 'Australia & New Zealand',
      NULL, 'Healthcare AI', NULL, NULL, NULL
    );
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
    UPDATE content_bodies SET body_text = '<p>T-Pro is an Irish healthcare technology company specialising in speech recognition, clinical documentation and AI-enabled workflow tools for healthcare providers. Its technology reduces the administrative burden on clinicians by automating documentation tasks from dictation to structured clinical notes.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>T-Pro is an Irish healthcare technology company specialising in speech recognition, clinical documentation and AI-enabled workflow tools for healthcare providers. Its technology reduces the administrative burden on clinicians by automating documentation tasks from dictation to structured clinical notes.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>T-Pro''s ANZ expansion strategy was acquisition-led from the outset. Rather than entering with its own sales team or a channel partner, it identified established local documentation and transcription businesses that already had deep relationships with hospitals, clinics and healthcare networks — then acquired them and layered its AI documentation platform over the existing operations.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>T-Pro''s ANZ expansion strategy was acquisition-led from the outset. Rather than entering with its own sales team or a channel partner, it identified established local documentation and transcription businesses that already had deep relationships with hospitals, clinics and healthcare networks — then acquired them and layered its AI documentation platform over the existing operations.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>2022</strong> — SyberScribe <em>(Melbourne, Australia)</em></li><li><strong>2022</strong> — Livingbridge investment <em>(UK PE backing)</em></li><li><strong>2023</strong> — NTS Transcriptions <em>(Australia)</em></li><li><strong>2025</strong> — Sound Business Systems (SBS) <em>(New Zealand + Australia)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ul><li><strong>2022</strong> — SyberScribe <em>(Melbourne, Australia)</em></li><li><strong>2022</strong> — Livingbridge investment <em>(UK PE backing)</em></li><li><strong>2023</strong> — NTS Transcriptions <em>(Australia)</em></li><li><strong>2025</strong> — Sound Business Systems (SBS) <em>(New Zealand + Australia)</em></li></ul>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Healthcare documentation sits at the intersection of clinician behaviour, data compliance and hospital IT infrastructure. Local relationships matter enormously because switching documentation tools requires clinical workflow change management — something hospitals only do when they trust the vendor deeply. T-Pro''s acquisition strategy meant it inherited trusted local operators rather than asking customers to take a risk on a remote Irish startup.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>Healthcare documentation sits at the intersection of clinician behaviour, data compliance and hospital IT infrastructure. Local relationships matter enormously because switching documentation tools requires clinical workflow change management — something hospitals only do when they trust the vendor deeply. T-Pro''s acquisition strategy meant it inherited trusted local operators rather than asking customers to take a risk on a remote Irish startup.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>By acquiring three ANZ businesses rather than one, T-Pro built a narrative of regional commitment and demonstrated to healthcare networks that it was building a long-term APAC presence rather than testing the market opportunistically.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>By acquiring three ANZ businesses rather than one, T-Pro built a narrative of regional commitment and demonstrated to healthcare networks that it was building a long-term APAC presence rather than testing the market opportunistically.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><em>T-Pro''s ANZ story shows that in specialist enterprise categories, acquisitions function simultaneously as distribution, localisation and trust-building — compressing years of relationship development into a single transaction.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>T-Pro''s ANZ story shows that in specialist enterprise categories, acquisitions function simultaneously as distribution, localisation and trust-building — compressing years of relationship development into a single transaction.</em></p>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Founded</strong>: Ireland</li><li><strong>Entry mode</strong>: Serial acquisition</li><li><strong>Acquisition 1</strong>: SyberScribe, Melbourne (2022)</li><li><strong>Acquisition 2</strong>: NTS Transcriptions, AU (2023)</li><li><strong>Acquisition 3</strong>: Sound Business Systems, NZ/AU (2025)</li><li><strong>PE backing</strong>: Livingbridge (2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Founded</strong>: Ireland</li><li><strong>Entry mode</strong>: Serial acquisition</li><li><strong>Acquisition 1</strong>: SyberScribe, Melbourne (2022)</li><li><strong>Acquisition 2</strong>: NTS Transcriptions, AU (2023)</li><li><strong>Acquisition 3</strong>: Sound Business Systems, NZ/AU (2025)</li><li><strong>PE backing</strong>: Livingbridge (2022)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, T-Pro''s playbook offers a clear template. The lessons below distil T-Pro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, T-Pro''s playbook offers a clear template. The lessons below distil T-Pro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let acquisitions replace the sales team</strong> — Each acquired business brought its own hospital and clinic relationships. <em>(In enterprise healthcare, distribution IS the product. Buying an established operator often beats hiring a country manager and starting from zero.)</em></li><li><strong>Layer technology over trusted operations</strong> — T-Pro applied its AI documentation platform over acquired businesses rather than replacing them. <em>(Don''t replace what works locally. Add your IP on top of existing customer trust.)</em></li><li><strong>Build a serial acquisition narrative</strong> — Three acquisitions created a regional expansion story that one deal could not. <em>(Announcing a second and third acquisition compounds the credibility signal from the first. You stop looking like an experiment and start looking like a regional player.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Let acquisitions replace the sales team</strong> — Each acquired business brought its own hospital and clinic relationships. <em>(In enterprise healthcare, distribution IS the product. Buying an established operator often beats hiring a country manager and starting from zero.)</em></li><li><strong>Layer technology over trusted operations</strong> — T-Pro applied its AI documentation platform over acquired businesses rather than replacing them. <em>(Don''t replace what works locally. Add your IP on top of existing customer trust.)</em></li><li><strong>Build a serial acquisition narrative</strong> — Three acquisitions created a regional expansion story that one deal could not. <em>(Announcing a second and third acquisition compounds the credibility signal from the first. You stop looking like an experiment and start looking like a regional player.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Silicon Republic — T-Pro acquires SyberScribe (2022)', 'https://www.siliconrepublic.com/business/t-pro-syberscribe-acquisition-australia-speech-transcription-technology', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ThinkBusiness — T-Pro voice AI and NTS (2024 profile)', 'https://www.thinkbusiness.ie/articles/tpro-voice-ai-speech-technology/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'T-Pro blog — Sound Business Systems joins the group', 'https://blog.tpro.io/sbs-part-of-tpro', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Livingbridge — T-Pro acquires SBS (PE announcement)', 'https://www.livingbridge.com/livingroom/t-pro-acquires-sound-business-systems-expanding-global-healthcare-ai-reach', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Sound Business Systems — corporate site', 'https://soundbusiness.co.nz', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
