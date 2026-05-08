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
    'masters-australia-market-entry', 'How Masters Home Improvement Collapsed in the Australian Market', 'The joint venture between US hardware giant Lowe''s and Australian retail conglomerate Woolworths is widely regarded as the most catastrophic retail failure in Australian business history, accumulating more than A$3.2 billion in losses over seven years.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['The joint venture between US hardware giant Lowe''s and Australian retail conglomerate Woolworths is widely regarded as the most catastrophic retail failure in Australian business history, accumulating more than A$3.2 billion in losses over seven years.', 'In January 2016, Lowe''s announced the venture was unprofitable and requested an exit.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Home Improvement / Retail"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      content_id, company_name, company_logo, website, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Masters Home Improvement', 'https://img.logo.dev/lowes.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://lowes.com', 'United States', 'Australia',
      '2009-01-01', 'Home Improvement / Retail', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://lowes.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/lowes.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
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
    UPDATE content_bodies SET body_text = '<p>The joint venture between US hardware giant Lowe''s and Australian retail conglomerate Woolworths is widely regarded as the most catastrophic retail failure in Australian business history, accumulating more than A$3.2 billion in losses over seven years.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>The joint venture between US hardware giant Lowe''s and Australian retail conglomerate Woolworths is widely regarded as the most catastrophic retail failure in Australian business history, accumulating more than A$3.2 billion in losses over seven years.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>In August 2009, Woolworths announced a joint venture with Lowe''s to enter the home improvement market, targeting Bunnings Warehouse (owned by rival Wesfarmers). The plan called for 150 stores within five years. The venture was internally dubbed "Project Oxygen" — designed to "suck the oxygen" out of Bunnings. The first Masters store opened in September 2011.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In August 2009, Woolworths announced a joint venture with Lowe''s to enter the home improvement market, targeting Bunnings Warehouse (owned by rival Wesfarmers). The plan called for 150 stores within five years. The venture was internally dubbed "Project Oxygen" — designed to "suck the oxygen" out of Bunnings. The first Masters store opened in September 2011.</p>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_entry AND sort_order > 2;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Wrong partner dynamics</strong> — Lowe''s brought its US Northern Hemisphere seasonal product schedules to an Australian market with opposite seasons, creating systematic misalignment in garden and hardware ranging.</li><li><strong>Location errors</strong> — Bunnings had already secured the best large-format hardware sites. Masters was forced into secondary locations.</li><li><strong>Supplier coercion</strong> — Bunnings reportedly threatened to delist suppliers who also stocked Masters, starving the new entrant of key brands.</li><li><strong>No clear value proposition</strong> — Masters charged higher prices than Bunnings and offered an inferior product range, failing to give Australian DIY shoppers a compelling reason to switch.</li><li><strong>Strategic distraction</strong> — The hardware venture diverted Woolworths'' attention from its core grocery business, which lost ground to Coles during the same period.</li><li><strong>JV governance failure</strong> — The two partners had fundamentally different views on strategy, leading to costly court battles during the wind-down.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Wrong partner dynamics</strong> — Lowe''s brought its US Northern Hemisphere seasonal product schedules to an Australian market with opposite seasons, creating systematic misalignment in garden and hardware ranging.</li><li><strong>Location errors</strong> — Bunnings had already secured the best large-format hardware sites. Masters was forced into secondary locations.</li><li><strong>Supplier coercion</strong> — Bunnings reportedly threatened to delist suppliers who also stocked Masters, starving the new entrant of key brands.</li><li><strong>No clear value proposition</strong> — Masters charged higher prices than Bunnings and offered an inferior product range, failing to give Australian DIY shoppers a compelling reason to switch.</li><li><strong>Strategic distraction</strong> — The hardware venture diverted Woolworths'' attention from its core grocery business, which lost ground to Coles during the same period.</li><li><strong>JV governance failure</strong> — The two partners had fundamentally different views on strategy, leading to costly court battles during the wind-down.</li></ul>', 1, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_success AND sort_order > 1;

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
    UPDATE content_bodies SET body_text = '<p>In January 2016, Lowe''s announced the venture was unprofitable and requested an exit. All 63 Masters stores were closed by 11 December 2016. Woolworths exited hardware entirely and Bunnings was left with near-monopoly control of the market.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>In January 2016, Lowe''s announced the venture was unprofitable and requested an exit. All 63 Masters stores were closed by 11 December 2016. Woolworths exited hardware entirely and Bunnings was left with near-monopoly control of the market.</p>', 1, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order > 1;

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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Masters Home Improvement''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Masters Home Improvement''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>JV structures require aligned incentives</strong> — Mismatched strategic goals between JV partners are fatal, especially in asset-heavy retail.</li><li><strong>Incumbent entrenchment is a real barrier</strong> — Bunnings'' supplier relationships and site control created structural moats that capital alone cannot overcome.</li><li><strong>Seasonal and operational localisation is non-negotiable</strong> — Product ranging, seasonal campaigns, and even shelf layouts must reflect local conditions.</li><li><strong>Test before scaling</strong> — An 80-store rollout without a validated pilot in Australian conditions was an enormous risk.</li><li><strong>Distraction costs are real</strong> — Entering a new vertical while the core business is under competitive pressure compounds risk catastrophically.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>JV structures require aligned incentives</strong> — Mismatched strategic goals between JV partners are fatal, especially in asset-heavy retail.</li><li><strong>Incumbent entrenchment is a real barrier</strong> — Bunnings'' supplier relationships and site control created structural moats that capital alone cannot overcome.</li><li><strong>Seasonal and operational localisation is non-negotiable</strong> — Product ranging, seasonal campaigns, and even shelf layouts must reflect local conditions.</li><li><strong>Test before scaling</strong> — An 80-store rollout without a validated pilot in Australian conditions was an enormous risk.</li><li><strong>Distraction costs are real</strong> — Entering a new vertical while the core business is under competitive pressure compounds risk catastrophically.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wikipedia – Masters Home Improvement', 'https://en.wikipedia.org/wiki/Masters_Home_Improvement', 1, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News', 'https://www.abc.net.au/news/2015-05-06/five-reasons-woolworths-is-being-hammered-on-hardware/6450364', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Hardware Retailing', 'https://hardwareretailing.com/lowes-failed-australian-business-closes/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Girt By blog (timeline)', 'https://www.girtby.com/blog/2019/8/28/masters-timeline-of-a-failed-hardware-endeavour', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
