DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'sensat-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug sensat-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The UK construction digital twin startup that came to Sydney with government support — and became Australia''s infrastructure visualisation platform',
    tldr = ARRAY['The UK construction digital twin startup that came to Sydney with government support — and became Australia''s infrastructure visualisation platform', 'Australia is in a generational infrastructure boom — hundreds of billions in committed government infrastructure investment — with project delivery that involves large, geographically distributed consortia who need current, accurate project data.', 'Sensat was founded in London in 2017 by Rob Bhatt and James Dean.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 3,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Rob Bhatt', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'James Dean', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Sensat was founded in London in 2017 by Rob Bhatt and James Dean. It built a digital twin and spatial data visualisation platform (Mapp) for infrastructure projects, allowing construction teams to interact with a unified digital replica of their project site integrating BIM, GIS, reality capture data, and project management in one cloud platform. Sensat was recognised as the UK''s #2 startup by Tech Nation in 2023.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Sensat was founded in London in 2017 by Rob Bhatt and James Dean. It built a digital twin and spatial data visualisation platform (Mapp) for infrastructure projects, allowing construction teams to interact with a unified digital replica of their project site integrating BIM, GIS, reality capture data, and project management in one cloud platform. Sensat was recognised as the UK''s #2 startup by Tech Nation in 2023.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia is in a generational infrastructure boom — hundreds of billions in committed government infrastructure investment — with project delivery that involves large, geographically distributed consortia who need current, accurate project data. Australia''s existing spatial and infrastructure management tools are fragmented.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia is in a generational infrastructure boom — hundreds of billions in committed government infrastructure investment — with project delivery that involves large, geographically distributed consortia who need current, accurate project data. Australia''s existing spatial and infrastructure management tools are fragmented.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2021 – Tech Nation Digital Trade Network:</strong> Sensat entered Australia through the UK Government''s Tech Nation Digital Trade Network — a programme that arranged market introductions and removed cold-start friction before Sensat arrived in Sydney.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2021 – Tech Nation Digital Trade Network:</strong> Sensat entered Australia through the UK Government''s Tech Nation Digital Trade Network — a programme that arranged market introductions and removed cold-start friction before Sensat arrived in Sydney.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022–2023 – Sydney Office and ANZ GM:</strong> Sensat established a Sydney office as its first international location. In May 2023, Andy Lake was hired as General Manager Australia and New Zealand, with an explicit mandate to "establish all GTM capabilities for the ANZ market."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022–2023 – Sydney Office and ANZ GM:</strong> Sensat established a Sydney office as its first international location. In May 2023, Andy Lake was hired as General Manager Australia and New Zealand, with an explicit mandate to "establish all GTM capabilities for the ANZ market."</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2023 – UK''s #2 Startup:</strong> Tech Nation recognised Sensat as the UK''s #2 startup in 2023, amplifying its brand in ANZ enterprise sales conversations.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2023 – UK''s #2 Startup:</strong> Tech Nation recognised Sensat as the UK''s #2 startup in 2023, amplifying its brand in ANZ enterprise sales conversations.</p>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Vehicle</strong>: Tech Nation Digital Trade Network (UK Government-backed)</li><li><strong>ANZ Office</strong>: Sydney (first international location)</li><li><strong>ANZ GM</strong>: Andy Lake appointed May 2023</li><li><strong>UK Recognition</strong>: UK''s #2 startup (Tech Nation, 2023)</li><li><strong>Market Focus</strong>: Construction, transport, infrastructure, utilities</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Vehicle</strong>: Tech Nation Digital Trade Network (UK Government-backed)</li><li><strong>ANZ Office</strong>: Sydney (first international location)</li><li><strong>ANZ GM</strong>: Andy Lake appointed May 2023</li><li><strong>UK Recognition</strong>: UK''s #2 startup (Tech Nation, 2023)</li><li><strong>Market Focus</strong>: Construction, transport, infrastructure, utilities</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Sensat''s playbook offers a clear template. The lessons below are drawn from Sensat''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Sensat''s playbook offers a clear template. The lessons below are drawn from Sensat''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Andy Lake (LinkedIn) — ANZ GM appointment for Sensat', 'https://www.linkedin.com/in/andylake1', 68, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'North East Link - Victoria''s Big Build', 'https://bigbuild.vic.gov.au/projects/north-east-link', 69, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
