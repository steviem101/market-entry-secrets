DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'ncc-group-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug ncc-group-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The Manchester cybersecurity firm that planted its flag in Australia as part of a $130M UK tech wave',
    tldr = ARRAY['The Manchester cybersecurity firm that planted its flag in Australia as part of a $130M UK tech wave', 'NCC Group is a global information assurance company headquartered in Manchester, founded in 1999.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
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
    UPDATE content_bodies SET body_text = '<p>NCC Group is a global information assurance company headquartered in Manchester, founded in 1999. It provides cybersecurity consulting, penetration testing, software escrow, and cyber incident response services to government, critical infrastructure, and large enterprise clients. It employs 2,000+ staff across UK, North America, APAC, and Europe, and is listed on the London Stock Exchange.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>NCC Group is a global information assurance company headquartered in Manchester, founded in 1999. It provides cybersecurity consulting, penetration testing, software escrow, and cyber incident response services to government, critical infrastructure, and large enterprise clients. It employs 2,000+ staff across UK, North America, APAC, and Europe, and is listed on the London Stock Exchange.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – Coordinated UK Tech Entry:</strong> NCC Group established Australian operations in 2017 as part of the coordinated $130 million UK tech wave with Blue Prism, Contino, and two other companies, supported by the Australian Trade and Investment Commission and the UK DIT. The coordinated announcement generated significant government visibility.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – Coordinated UK Tech Entry:</strong> NCC Group established Australian operations in 2017 as part of the coordinated $130 million UK tech wave with Blue Prism, Contino, and two other companies, supported by the Australian Trade and Investment Commission and the UK DIT. The coordinated announcement generated significant government visibility.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017–2024 – Government and Critical Infrastructure Focus:</strong> NCC Group built its Australian practice around government, critical infrastructure (energy, water, transport, financial systems), and large enterprise — the segments where its global expertise is most directly applicable.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017–2024 – Government and Critical Infrastructure Focus:</strong> NCC Group built its Australian practice around government, critical infrastructure (energy, water, transport, financial systems), and large enterprise — the segments where its global expertise is most directly applicable.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>September 2025 – Contributing to Australian Cyber Strategy:</strong> NCC Group formally submitted to the Australian Government''s Horizon 2 Cyber Security Strategy consultation, advocating for an AI Act for Australia, post-quantum cryptography roadmaps, extended Cyber Trust Mark requirements, and a national cyber skills strategy. This positions NCC Group as a strategic advisor to Australian government, not merely a vendor.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>September 2025 – Contributing to Australian Cyber Strategy:</strong> NCC Group formally submitted to the Australian Government''s Horizon 2 Cyber Security Strategy consultation, advocating for an AI Act for Australia, post-quantum cryptography roadmaps, extended Cyber Trust Mark requirements, and a national cyber skills strategy. This positions NCC Group as a strategic advisor to Australian government, not merely a vendor.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Year</strong>: 2017 (coordinated UK tech wave)</li><li><strong>ANZ Focus</strong>: Government, critical infrastructure, large enterprise</li><li><strong>Policy Engagement</strong>: Submitted to 2025 Australian Cyber Security Strategy consultation</li><li><strong>Global Scale</strong>: 2,000+ staff; UK, North America, APAC, Europe</li><li><strong>LSE Listed</strong>: Yes</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Year</strong>: 2017 (coordinated UK tech wave)</li><li><strong>ANZ Focus</strong>: Government, critical infrastructure, large enterprise</li><li><strong>Policy Engagement</strong>: Submitted to 2025 Australian Cyber Security Strategy consultation</li><li><strong>Global Scale</strong>: 2,000+ staff; UK, North America, APAC, Europe</li><li><strong>LSE Listed</strong>: Yes</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, NCC Group''s playbook offers a clear template. The lessons below are drawn from NCC Group''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, NCC Group''s playbook offers a clear template. The lessons below are drawn from NCC Group''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, '5 UK tech providers ploughed $130M into Australia during 2017', 'https://www.arnnet.com.au/article/1265281/5-uk-tech-providers-ploughed-130m-into-australia-during-2017.html', 37, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NCC Group (Wikipedia)', 'https://en.wikipedia.org/wiki/NCC_Group', 63, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NCC Group inputs into next phase of Australia''s Cyber Security Strategy', 'https://www.nccgroup.com/newsroom/ncc-group-inputs-into-next-phase-of-australia-s-cyber-security-strategy/', 64, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
