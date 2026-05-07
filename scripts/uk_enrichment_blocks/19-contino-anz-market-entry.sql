DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'contino-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug contino-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The DevOps consultancy that opened in Melbourne in January 2017, acquired an Australian company in April 2018, and sold to IBM''s Cognizant in 2019',
    tldr = ARRAY['The DevOps consultancy that opened in Melbourne in January 2017, acquired an Australian company in April 2018, and sold to IBM''s Cognizant in 2019', 'Contino was founded in London in 2014 by Matt Farmer and William Martin — former investment banking tech executives.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cloud / DevOps"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 3,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Matt Farmer', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'William Martin', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Contino was founded in London in 2014 by Matt Farmer and William Martin — former investment banking tech executives. It built a cloud and DevOps transformation consultancy, helping large enterprises adopt continuous deployment, cloud-native architecture, and automated testing. Contino was acquired by Cognizant in 2019 — just two years after entering Australia.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Contino was founded in London in 2014 by Matt Farmer and William Martin — former investment banking tech executives. It built a cloud and DevOps transformation consultancy, helping large enterprises adopt continuous deployment, cloud-native architecture, and automated testing. Contino was acquired by Cognizant in 2019 — just two years after entering Australia.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>January 2017 – Melbourne First Office:</strong> Contino first established operations in Australia in early 2017, opening its first trans-Tasman office in Melbourne. Its UK-based DevOps principal consultant Daniel Williams was appointed APAC Director of Engineering and relocated to Melbourne. This was part of the broader $130M UK tech investment wave.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>January 2017 – Melbourne First Office:</strong> Contino first established operations in Australia in early 2017, opening its first trans-Tasman office in Melbourne. Its UK-based DevOps principal consultant Daniel Williams was appointed APAC Director of Engineering and relocated to Melbourne. This was part of the broader $130M UK tech investment wave.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>April 2018 – Nebulr Acquisition:</strong> Just 15 months after opening in Melbourne, Contino acquired Nebulr — a 50-person Australian DevOps and cloud consultancy in Melbourne and Sydney with three of Australia''s largest banks as clients. Nebulr CEO Craig Howe became APAC Managing Director. The merged APAC team totalled 65 staff.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>April 2018 – Nebulr Acquisition:</strong> Just 15 months after opening in Melbourne, Contino acquired Nebulr — a 50-person Australian DevOps and cloud consultancy in Melbourne and Sydney with three of Australia''s largest banks as clients. Nebulr CEO Craig Howe became APAC Managing Director. The merged APAC team totalled 65 staff.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2018–2019 – ANZ Client Portfolio:</strong> Following the acquisition, Contino built a portfolio including NAB, UBank, Bendigo Bank, and one of Australia''s largest universities, delivering cloud transformation, data analytics, and Consumer Data Right implementation programs.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2018–2019 – ANZ Client Portfolio:</strong> Following the acquisition, Contino built a portfolio including NAB, UBank, Bendigo Bank, and one of Australia''s largest universities, delivering cloud transformation, data analytics, and Consumer Data Right implementation programs.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019 – Cognizant Acquisition:</strong> Contino was acquired by Cognizant — one of the world''s largest IT services firms. The ANZ client base — three of Australia''s largest banks — was central to the acquisition rationale.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019 – Cognizant Acquisition:</strong> Contino was acquired by Cognizant — one of the world''s largest IT services firms. The ANZ client base — three of Australia''s largest banks — was central to the acquisition rationale.</p>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Date</strong>: January 2017 (Melbourne)</li><li><strong>First Acquisition</strong>: Nebulr (50-person Australian DevOps firm, April 2018)</li><li><strong>ANZ Bank Clients</strong>: Three of Australia''s largest banks post-Nebulr</li><li><strong>Notable Clients</strong>: NAB, UBank, Bendigo Bank</li><li><strong>Time Entry → Exit</strong>: ~2 years (entry Jan 2017; sold to Cognizant 2019)</li><li><strong>Acquirer</strong>: Cognizant</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Date</strong>: January 2017 (Melbourne)</li><li><strong>First Acquisition</strong>: Nebulr (50-person Australian DevOps firm, April 2018)</li><li><strong>ANZ Bank Clients</strong>: Three of Australia''s largest banks post-Nebulr</li><li><strong>Notable Clients</strong>: NAB, UBank, Bendigo Bank</li><li><strong>Time Entry → Exit</strong>: ~2 years (entry Jan 2017; sold to Cognizant 2019)</li><li><strong>Acquirer</strong>: Cognizant</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Contino''s playbook offers a clear template. The lessons below are drawn from Contino''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Contino''s playbook offers a clear template. The lessons below are drawn from Contino''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Contino steps up Australian play with Nebulr acquisition (ARN)', 'https://www.arnnet.com.au/article/1266156/contino-steps-up-australian-play-with-nebulr-acquisition.html', 65, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Contino Acquires Australian DevOps Leaders Nebulr', 'https://www.contino.io/insights/contino-acquires-australian-devops-leaders-nebulr-to-accelerate-growth-in-apac-region', 66, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Case Studies (Contino)', 'https://www.contino.io/case-studies', 67, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
