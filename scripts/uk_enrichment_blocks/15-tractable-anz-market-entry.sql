DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'tractable-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug tractable-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The AI that accelerates insurance claims — and found one of its biggest wins at Australia''s largest insurer',
    tldr = ARRAY['The AI that accelerates insurance claims — and found one of its biggest wins at Australia''s largest insurer', 'Tractable was founded in London in 2014 by Alex Dalyac and Razvan Ranca.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "InsurTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alex Dalyac', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Razvan Ranca', 'Co-founder & CTO', false);
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
    UPDATE content_bodies SET body_text = '<p>Tractable was founded in London in 2014 by Alex Dalyac and Razvan Ranca. Its AI analyses photos of damaged cars and properties and recommends whether to write off, repair, or cash-settle, with estimates generated automatically. The company became a unicorn in 2021 after raising $65 million in a Series E led by SoftBank Vision Fund 2, serving 25+ major P&C insurers globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Tractable was founded in London in 2014 by Alex Dalyac and Razvan Ranca. Its AI analyses photos of damaged cars and properties and recommends whether to write off, repair, or cash-settle, with estimates generated automatically. The company became a unicorn in 2021 after raising $65 million in a Series E led by SoftBank Vision Fund 2, serving 25+ major P&C insurers globally.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2021 – IAG Australia Partnership:</strong> Tractable''s most significant ANZ milestone was a partnership with Insurance Australia Group (IAG) — Australia''s largest general insurer, covering approximately 70% of the domestic insurance market through NRMA Insurance, CGU, Swann, and WFI.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2021 – IAG Australia Partnership:</strong> Tractable''s most significant ANZ milestone was a partnership with Insurance Australia Group (IAG) — Australia''s largest general insurer, covering approximately 70% of the domestic insurance market through NRMA Insurance, CGU, Swann, and WFI.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>IAG''s COO Neil Morgan explicitly cited AI for claims assessment as a core strategy pillar, using it across direct and intermediated divisions. IAG consolidated its claims handling from 16 platforms to a single Enterprise Platform by 2024, with AI-powered damage assessment as a central design element.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>IAG''s COO Neil Morgan explicitly cited AI for claims assessment as a core strategy pillar, using it across direct and intermediated divisions. IAG consolidated its claims handling from 16 platforms to a single Enterprise Platform by 2024, with AI-powered damage assessment as a central design element.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>Tractable''s Published Performance Benchmarks:</strong> 8-day reduction in cycle times with FNOL Triage; 50% reduction in estimate writing time; 70% of claims reviewed without human involvement; 50% reduction in subrogation report time.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>Tractable''s Published Performance Benchmarks:</strong> 8-day reduction in cycle times with FNOL Triage; 50% reduction in estimate writing time; 70% of claims reviewed without human involvement; 50% reduction in subrogation report time.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Anchor Client</strong>: IAG — Australia''s largest general insurer</li><li><strong>IAG Market Position</strong>: ~70% of Australian domestic insurance market</li><li><strong>AI Benchmarks</strong>: 8 days cycle time reduction; 50% estimate time saving; 70% touchless review</li><li><strong>Unicorn Status</strong>: $1 billion+ valuation (Series E, 2021)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Anchor Client</strong>: IAG — Australia''s largest general insurer</li><li><strong>IAG Market Position</strong>: ~70% of Australian domestic insurance market</li><li><strong>AI Benchmarks</strong>: 8 days cycle time reduction; 50% estimate time saving; 70% touchless review</li><li><strong>Unicorn Status</strong>: $1 billion+ valuation (Series E, 2021)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Tractable''s playbook offers a clear template. The lessons below are drawn from Tractable''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Tractable''s playbook offers a clear template. The lessons below are drawn from Tractable''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tractable: AI Revolutionising Insurance Claims (InsurTech Digital)', 'https://insurtechdigital.com/articles/insurance-claims-ai-unicorn-tractable-closes-65m-series-e', 52, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AI: Extinction or better motor claims? (Insurance Business)', 'https://www.insurancebusinessmag.com/au/news/technology/ai-extinction-or-better-motor-claims-449654.aspx', 53, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IAG lifts lid on CASI, a new AI claims assistant', 'https://www.insurancebusinessmag.com/au/news/claims/iag-lifts-lid-on-casi-a-new-ai-claims-assistant-522369.aspx', 54, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Solutions - Insurers (Tractable)', 'https://tractable.ai/insurers/', 55, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
