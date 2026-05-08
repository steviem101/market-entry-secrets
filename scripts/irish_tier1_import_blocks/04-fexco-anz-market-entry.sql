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
    'fexco-anz-market-entry', 'How Fexco Entered the ANZ Market', 'How a Kerry-founded payments and FX group used New Zealand as its Pacific base for over a decade, built a 400-person regional operation, and then used that platform to launch into Australian retail with hard numbers behind the expansion story.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    3, ARRAY['How a Kerry-founded payments and FX group used New Zealand as its Pacific base for over a decade, built a 400-person regional operation, and then used that platform to launch into Australian retail with hard numbers behind the expansion story.', 'Fexco is one of Ireland''s largest private companies, founded in 1981 in Killorglin, County Kerry by Brian McCarthy.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Fexco', 'Ireland', 'Australia & New Zealand',
      '2009-01-01', 'Fintech', 1, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Brian McCarthy', 'Founder', true);
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
    UPDATE content_bodies SET body_text = '<p>Fexco is one of Ireland''s largest private companies, founded in 1981 in Killorglin, County Kerry by Brian McCarthy. It operates across payments, foreign exchange, financial services and business outsourcing. In the Pacific, its brand is anchored around currency exchange and remittance services under the No1 Currency banner, operating as a major Western Union master agent across the region.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Fexco is one of Ireland''s largest private companies, founded in 1981 in Killorglin, County Kerry by Brian McCarthy. It operates across payments, foreign exchange, financial services and business outsourcing. In the Pacific, its brand is anchored around currency exchange and remittance services under the No1 Currency banner, operating as a major Western Union master agent across the region.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Fexco''s ANZ story begins in New Zealand. In 2009 it acquired Federal Pacific in Auckland, which it later renamed Fexco Pacific. From that base it expanded across New Zealand and Pacific island markets — building a network of 24 stores in New Zealand, over 100 offices and outlets across the Pacific, and a team of more than 400 staff. With more than two million transactions per year, Fexco Pacific became a significant financial services operation in its own right.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Fexco''s ANZ story begins in New Zealand. In 2009 it acquired Federal Pacific in Auckland, which it later renamed Fexco Pacific. From that base it expanded across New Zealand and Pacific island markets — building a network of 24 stores in New Zealand, over 100 offices and outlets across the Pacific, and a team of more than 400 staff. With more than two million transactions per year, Fexco Pacific became a significant financial services operation in its own right.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>In September 2024, Fexco took the next logical step and opened two No1 Currency stores in Sydney — at Westfield Hurstville and Westfield Liverpool. The company explicitly framed this as the start of a broader Australian rollout, with plans for more than 20 outlets and 80-plus local jobs.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In September 2024, Fexco took the next logical step and opened two No1 Currency stores in Sydney — at Westfield Hurstville and Westfield Liverpool. The company explicitly framed this as the start of a broader Australian rollout, with plans for more than 20 outlets and 80-plus local jobs.</p>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Most market-entry advice assumes Australia is the primary target and New Zealand is an afterthought. Fexco inverts this entirely. It built 15 years of Pacific operating experience before entering Australian retail — and when it did, it arrived with proven unit economics, brand recognition among Pacific diaspora communities, and a credible expansion narrative backed by real numbers.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>Most market-entry advice assumes Australia is the primary target and New Zealand is an afterthought. Fexco inverts this entirely. It built 15 years of Pacific operating experience before entering Australian retail — and when it did, it arrived with proven unit economics, brand recognition among Pacific diaspora communities, and a credible expansion narrative backed by real numbers.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Fexco also had an indirect Australian connection through its co-ownership of PICA Group, one of Australia''s largest strata property services companies. This gave the Fexco leadership team long-running familiarity with the Australian operating and regulatory environment before the currency retail rollout.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>Fexco also had an indirect Australian connection through its co-ownership of PICA Group, one of Australia''s largest strata property services companies. This gave the Fexco leadership team long-running familiarity with the Australian operating and regulatory environment before the currency retail rollout.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><em>New Zealand doesn''t have to be a test market or a secondary afterthought. For the right business, it can be the foundation of a decade-long Pacific operation that makes Australia a more confident expansion, not a speculative one.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>New Zealand doesn''t have to be a test market or a secondary afterthought. For the right business, it can be the foundation of a decade-long Pacific operation that makes Australia a more confident expansion, not a speculative one.</em></p>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Founded</strong>: 1981, Killorglin, Kerry</li><li><strong>NZ entry</strong>: 2009 (Federal Pacific acquisition)</li><li><strong>Pacific staff</strong>: 400+</li><li><strong>NZ stores</strong>: 24</li><li><strong>AU entry</strong>: Sept 2024 (2 Sydney stores)</li><li><strong>AU plan</strong>: 20+ outlets, 80+ jobs</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Founded</strong>: 1981, Killorglin, Kerry</li><li><strong>NZ entry</strong>: 2009 (Federal Pacific acquisition)</li><li><strong>Pacific staff</strong>: 400+</li><li><strong>NZ stores</strong>: 24</li><li><strong>AU entry</strong>: Sept 2024 (2 Sydney stores)</li><li><strong>AU plan</strong>: 20+ outlets, 80+ jobs</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, Fexco''s playbook offers a clear template. The lessons below distil Fexco''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, Fexco''s playbook offers a clear template. The lessons below distil Fexco''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>NZ as a genuine operating base</strong> — Built 400+ staff, 24 stores and 2M+ annual transactions before moving into Australia. <em>(NZ is a real market, not a stepping stone. The operating depth you build there is real credibility when you want to expand.)</em></li><li><strong>Pacific network as a moat</strong> — Became the largest Western Union master agent in the Pacific — hard to replicate quickly. <em>(In financial services and adjacent sectors, network infrastructure is a durable moat. Build the network before expanding the brand.)</em></li><li><strong>Lead the Australia announcement with jobs and footprint</strong> — Announced exact store locations, job creation numbers and a multi-year rollout plan. <em>(Specific commitments — named locations, headcount, timelines — earn media and government goodwill. Vague expansion plans do not.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>NZ as a genuine operating base</strong> — Built 400+ staff, 24 stores and 2M+ annual transactions before moving into Australia. <em>(NZ is a real market, not a stepping stone. The operating depth you build there is real credibility when you want to expand.)</em></li><li><strong>Pacific network as a moat</strong> — Became the largest Western Union master agent in the Pacific — hard to replicate quickly. <em>(In financial services and adjacent sectors, network infrastructure is a durable moat. Build the network before expanding the brand.)</em></li><li><strong>Lead the Australia announcement with jobs and footprint</strong> — Announced exact store locations, job creation numbers and a multi-year rollout plan. <em>(Specific commitments — named locations, headcount, timelines — earn media and government goodwill. Vague expansion plans do not.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fexco — Sydney store launch announcement (Oct 2024)', 'https://www.fexco.com/news-and-insights/fexco-expands-global-presence-with-launch-of-two-new-no1-currency-stores-in-sydney-australia/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fexco Pacific LinkedIn — network size and description', 'https://nz.linkedin.com/company/fexco-pacific-ltd', 2, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fexco corporate homepage', 'https://www.fexco.com', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
