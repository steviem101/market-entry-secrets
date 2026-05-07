DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'nplan-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug nplan-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The UK AI company that trained on 750,000 projects — and landed Australia''s biggest road project in 2025',
    tldr = ARRAY['The UK AI company that trained on 750,000 projects — and landed Australia''s biggest road project in 2025', 'nPlan was founded in London in 2017 by Dev Amratia and Tom Bower.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Dev Amratia', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Tom Bower', 'Co-founder & CTO', false);
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
    UPDATE content_bodies SET body_text = '<p>nPlan was founded in London in 2017 by Dev Amratia and Tom Bower. It built a deep learning AI platform trained on 750,000+ past construction project schedules representing $2.5 trillion in capital expenditure — the world''s largest such dataset — to predict where a project will struggle before it happens. The company raised a $16 million Series B in October 2025.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>nPlan was founded in London in 2017 by Dev Amratia and Tom Bower. It built a deep learning AI platform trained on 750,000+ past construction project schedules representing $2.5 trillion in capital expenditure — the world''s largest such dataset — to predict where a project will struggle before it happens. The company raised a $16 million Series B in October 2025.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>October 2025 – Series B with Mott MacDonald:</strong> nPlan raised $16M with Mott MacDonald — one of the world''s largest engineering consultancies — as both an investor and a strategic channel partner, opening doors to major infrastructure clients globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>October 2025 – Series B with Mott MacDonald:</strong> nPlan raised $16M with Mott MacDonald — one of the world''s largest engineering consultancies — as both an investor and a strategic channel partner, opening doors to major infrastructure clients globally.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>December 2025 – Spark NEL: The A$11 Billion North East Link:</strong> Spark NEL — the consortium delivering Victoria''s A$11 billion North East Link (Melbourne''s largest-ever road project; 6.5km twin tunnels, due 2028) — selected nPlan''s Insights Pro platform for AI-led risk assurance and project delivery management as the project entered its final phases.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>December 2025 – Spark NEL: The A$11 Billion North East Link:</strong> Spark NEL — the consortium delivering Victoria''s A$11 billion North East Link (Melbourne''s largest-ever road project; 6.5km twin tunnels, due 2028) — selected nPlan''s Insights Pro platform for AI-led risk assurance and project delivery management as the project entered its final phases.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p>This win marked nPlan''s first highways sector client globally, extending its proven capability from rail and energy into roads.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>This win marked nPlan''s first highways sector client globally, extending its proven capability from rail and energy into roads.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Anchor Client</strong>: Spark NEL D&C — North East Link, Melbourne</li><li><strong>Project Scale</strong>: A$11 billion, 6.5km twin tunnels, due 2028</li><li><strong>Sector Milestone</strong>: First highways client globally for nPlan</li><li><strong>Dataset</strong>: 750,000+ past project schedules; $2.5T in capex</li><li><strong>Series B</strong>: $16M (October 2025); investors include Mott MacDonald</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Anchor Client</strong>: Spark NEL D&C — North East Link, Melbourne</li><li><strong>Project Scale</strong>: A$11 billion, 6.5km twin tunnels, due 2028</li><li><strong>Sector Milestone</strong>: First highways client globally for nPlan</li><li><strong>Dataset</strong>: 750,000+ past project schedules; $2.5T in capex</li><li><strong>Series B</strong>: $16M (October 2025); investors include Mott MacDonald</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, nPlan''s playbook offers a clear template. The lessons below are drawn from nPlan''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, nPlan''s playbook offers a clear template. The lessons below are drawn from nPlan''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'nPlan raises $16M Series B', 'https://www.nplan.io/press-releases/nplan-raises-16m-series-b-to-scale-its-ai-led-transformation-of-capital-project-delivery', 43, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Spark NEL ignites AI partnership with nPlan', 'https://www.nplan.io/press-releases/spark-nel-ignites-ai-partnership-with-nplan-to-assure-and-de-risk-victorias-largest-highways-project', 44, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Melbourne''s $11bn North East Link project adopts nPlan''s AI planning tools', 'https://www.globalconstructionreview.com/melbournes-11bn-north-east-link-project-adopts-nplans-ai-planning-tools/', 45, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
