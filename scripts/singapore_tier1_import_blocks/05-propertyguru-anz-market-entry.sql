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
    'propertyguru-anz-market-entry', 'How PropertyGuru Entered the ANZ Market', 'A more nuanced MES case: not a classic full Australia market entry, but a strong Singapore company whose strategic relationship with Australia''s REA Group created a meaningful ANZ-linked expansion and ownership story.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['A more nuanced MES case: not a classic full Australia market entry, but a strong Singapore company whose strategic relationship with Australia''s REA Group created a meaningful ANZ-linked expansion and ownership story.', 'PropertyGuru is not a pure Singapore-to-Australia operating rollout case, so it should be tagged carefully in MES.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "PropTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'PropertyGuru', 'Singapore', 'Australia & New Zealand',
      '2021-01-01', 'PropTech', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Steve Melhuish', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Jani Rautiainen', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>PropertyGuru is not a pure Singapore-to-Australia operating rollout case, so it should be tagged carefully in MES. Its value lies in showing how an Australian strategic shareholder, REA Group, can become part of a Singapore company''s scaling and capital-market story through asset combinations and ownership ties.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>PropertyGuru is not a pure Singapore-to-Australia operating rollout case, so it should be tagged carefully in MES. Its value lies in showing how an Australian strategic shareholder, REA Group, can become part of a Singapore company''s scaling and capital-market story through asset combinations and ownership ties.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>PropertyGuru grew into a leading Southeast Asian proptech platform from Singapore.</li><li>In 2021, it completed the acquisition of REA Group''s Southeast Asian assets in exchange for REA taking an 18 percent stake, creating a meaningful Australian ownership link.</li><li>That relationship made PropertyGuru relevant to ANZ audiences even though the company itself remained primarily Southeast Asia-focused.</li><li>The company was later taken private in a deal that led REA to divest its stake, closing an important chapter in the Singapore-Australia strategic relationship.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>PropertyGuru grew into a leading Southeast Asian proptech platform from Singapore.</li><li>In 2021, it completed the acquisition of REA Group''s Southeast Asian assets in exchange for REA taking an 18 percent stake, creating a meaningful Australian ownership link.</li><li>That relationship made PropertyGuru relevant to ANZ audiences even though the company itself remained primarily Southeast Asia-focused.</li><li>The company was later taken private in a deal that led REA to divest its stake, closing an important chapter in the Singapore-Australia strategic relationship.</li></ol>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><em>MES note: this should be labelled as a <strong>strategic ANZ linkage case</strong> rather than a straightforward market-entry case, unless additional evidence of direct Australian operating expansion is added later.</em></p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><em>MES note: this should be labelled as a <strong>strategic ANZ linkage case</strong> rather than a straightforward market-entry case, unless additional evidence of direct Australian operating expansion is added later.</em></p>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use strategic ownership as an alternative to operating expansion</strong> — REA Group''s 18% PropertyGuru stake gave both sides ANZ-Southeast Asia exposure without either company building greenfield operations in the other''s market.</li><li><strong>Sequence regional M&amp;A around capital-market milestones</strong> — The 2021 iProperty acquisition was timed to PropertyGuru''s pre-IPO scale-up, which combined two regional businesses into a single ASX-adjacent narrative.</li><li><strong>Read divestments as strategic transitions, not failures</strong> — REA Group''s 2024 stake divestment came alongside PropertyGuru being taken private, completing a cleanly bookended four-year strategic relationship.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Use strategic ownership as an alternative to operating expansion</strong> — REA Group''s 18% PropertyGuru stake gave both sides ANZ-Southeast Asia exposure without either company building greenfield operations in the other''s market.</li><li><strong>Sequence regional M&amp;A around capital-market milestones</strong> — The 2021 iProperty acquisition was timed to PropertyGuru''s pre-IPO scale-up, which combined two regional businesses into a single ASX-adjacent narrative.</li><li><strong>Read divestments as strategic transitions, not failures</strong> — REA Group''s 2024 stake divestment came alongside PropertyGuru being taken private, completing a cleanly bookended four-year strategic relationship.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>This case is treated as a <strong>strategic-link</strong> MES entry rather than a classic operating rollout. Key facts:</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>This case is treated as a <strong>strategic-link</strong> MES entry rather than a classic operating rollout. Key facts:</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, PropertyGuru''s playbook offers a clear template. The lessons below distil PropertyGuru''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, PropertyGuru''s playbook offers a clear template. The lessons below distil PropertyGuru''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Asset swap can be the entry mechanism</strong> — PropertyGuru gained iProperty Malaysia and Thailand; REA Group gained an 18% stake — neither company opened greenfield operations to access the other''s region.</li><li><strong>Strategic shareholder access is itself an ANZ market signal</strong> — REA''s board seat and equity made PropertyGuru visible to ANZ institutional investors and proptech press long before any operating expansion.</li><li><strong>Plan the unwind as carefully as the entry</strong> — When PropertyGuru went private, REA divested cleanly. Have a clear thesis for what the strategic link is meant to achieve before you sign.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Asset swap can be the entry mechanism</strong> — PropertyGuru gained iProperty Malaysia and Thailand; REA Group gained an 18% stake — neither company opened greenfield operations to access the other''s region.</li><li><strong>Strategic shareholder access is itself an ANZ market signal</strong> — REA''s board seat and equity made PropertyGuru visible to ANZ institutional investors and proptech press long before any operating expansion.</li><li><strong>Plan the unwind as carefully as the entry</strong> — When PropertyGuru went private, REA divested cleanly. Have a clear thesis for what the strategic link is meant to achieve before you sign.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'PropertyGuru completes iProperty / REA deal', 'https://www.onlinemarketplaces.com/articles/propertyguru-completes-iproperty-deal/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'REA Group to divest its stake in PropertyGuru', 'https://announcements.asx.com.au/asxpdf/20240816/pdf/066psw9tn13xtw.pdf', 2, 'sec_filing')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'REA Group background page for transaction chronology cross-check', 'https://en.wikipedia.org/wiki/REA_Group', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
