DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'deliveroo-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug deliveroo-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The fastest food delivery launch in ANZ history — and the exit that every marketplace founder should study',
    tldr = ARRAY['The fastest food delivery launch in ANZ history — and the exit that every marketplace founder should study', 'Deliveroo was founded in London in 2013 by Will Shu and Greg Orlowski.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Marketplace"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Will Shu', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Greg Orlowski', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Deliveroo was founded in London in 2013 by Will Shu and Greg Orlowski. It raised $140M in a Series D in 2016, listed on the London Stock Exchange in 2021, and was acquired by DoorDash in 2025 for £2.9 billion (excluding Australian operations).</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Deliveroo was founded in London in 2013 by Will Shu and Greg Orlowski. It raised $140M in a Series D in 2016, listed on the London Stock Exchange in 2021, and was acquired by DoorDash in 2025 for £2.9 billion (excluding Australian operations).</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2015 – Melbourne and Sydney Launch:</strong> Deliveroo launched in Melbourne in late 2015, establishing its Australian HQ before expanding to Sydney — ahead of Uber Eats and DoorDash in the market.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2015 – Melbourne and Sydney Launch:</strong> Deliveroo launched in Melbourne in late 2015, establishing its Australian HQ before expanding to Sydney — ahead of Uber Eats and DoorDash in the market.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2015–2022 – Growth and Competitive Collapse:</strong> At its peak, Deliveroo serviced 12,000+ restaurants, employed 120 staff, and had 15,000 delivery partners. It expanded into grocery and liquor delivery. However, the arrival of Uber Eats, DoorDash, and a revitalised Menulog created an environment where achieving profitable scale would require "disproportionate investment" with uncertain returns.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2015–2022 – Growth and Competitive Collapse:</strong> At its peak, Deliveroo serviced 12,000+ restaurants, employed 120 staff, and had 15,000 delivery partners. It expanded into grocery and liquor delivery. However, the arrival of Uber Eats, DoorDash, and a revitalised Menulog created an environment where achieving profitable scale would require "disproportionate investment" with uncertain returns.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>November 2022 – Exit:</strong> Deliveroo announced it was ending Australian operations, placing its subsidiary into voluntary administration through KordaMentha. The company''s H1 2022 Australian business represented ~3% of global GTV while negatively impacting EBITDA margins by ~30 basis points.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>November 2022 – Exit:</strong> Deliveroo announced it was ending Australian operations, placing its subsidiary into voluntary administration through KordaMentha. The company''s H1 2022 Australian business represented ~3% of global GTV while negatively impacting EBITDA margins by ~30 basis points.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Launch Year</strong>: 2015 (Melbourne first)</li><li><strong>Peak Scale</strong>: 12,000 restaurants, 15,000 delivery partners, 120 staff</li><li><strong>Exit Year</strong>: November 2022</li><li><strong>Exit Reason</strong>: Unviable to achieve market leadership without disproportionate investment</li><li><strong>Corporate Outcome</strong>: Parent acquired by DoorDash (2025) for £2.9B — ex-Australia</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Launch Year</strong>: 2015 (Melbourne first)</li><li><strong>Peak Scale</strong>: 12,000 restaurants, 15,000 delivery partners, 120 staff</li><li><strong>Exit Year</strong>: November 2022</li><li><strong>Exit Reason</strong>: Unviable to achieve market leadership without disproportionate investment</li><li><strong>Corporate Outcome</strong>: Parent acquired by DoorDash (2025) for £2.9B — ex-Australia</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Deliveroo''s playbook offers a clear template. The lessons below are drawn from Deliveroo''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Deliveroo''s playbook offers a clear template. The lessons below are drawn from Deliveroo''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo (Wikipedia)', 'https://en.wikipedia.org/wiki/Deliveroo', 56, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Thousands out of work as delivery pioneer folds its tent and closes', 'https://www.indailyqld.com.au/news/archive/2022/11/17/thousands-out-of-work-as-delivery-pioneer-folds-its-tent-and-closes', 57, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo shuts down in Australia (ACS Information Age)', 'https://ia.acs.org.au/article/2022/deliveroo-shuts-down-in-australia.html', 58, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo announces decision to end operations in Australia', 'https://corporate.deliveroo.co.uk/investors/news/deliveroo-announces-decision-end-operations-australia/', 59, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
