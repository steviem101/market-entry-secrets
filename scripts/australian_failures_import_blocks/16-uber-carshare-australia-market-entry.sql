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
    'uber-carshare-australia-market-entry', 'How Uber Carshare Struggled in the Australian Market', 'Uber Carshare (formerly Car Next Door), a peer-to-peer car sharing platform that Uber acquired to build a mobility ecosystem in Australia, quietly exited the Australian market in late 2025 — leaving thousands of users without a platform.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Uber Carshare (formerly Car Next Door), a peer-to-peer car sharing platform that Uber acquired to build a mobility ecosystem in Australia, quietly exited the Australian market in late 2025 — leaving thousands of users without a platform.', 'Uber Carshare exited the Australian market in late 2025, leaving a gap in the car-sharing ecosystem that competitors moved to fill.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Mobility / Car Sharing"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Uber Carshare', 'https://img.logo.dev/uber.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://uber.com', 'United States', 'Australia',
      '2022-01-01', 'Mobility / Car Sharing', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://uber.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/uber.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>Uber Carshare (formerly Car Next Door), a peer-to-peer car sharing platform that Uber acquired to build a mobility ecosystem in Australia, quietly exited the Australian market in late 2025 — leaving thousands of users without a platform.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Uber Carshare (formerly Car Next Door), a peer-to-peer car sharing platform that Uber acquired to build a mobility ecosystem in Australia, quietly exited the Australian market in late 2025 — leaving thousands of users without a platform.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Car Next Door was an Australian startup that built a P2P car-sharing marketplace. Uber acquired it as part of its strategy to diversify beyond rideshare into a full mobility platform in Australia. The rebranded "Uber Carshare" benefited from Uber''s brand recognition and app distribution.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Car Next Door was an Australian startup that built a P2P car-sharing marketplace. Uber acquired it as part of its strategy to diversify beyond rideshare into a full mobility platform in Australia. The rebranded "Uber Carshare" benefited from Uber''s brand recognition and app distribution.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Core Uber product cannibalised demand</strong> — For many use cases, Uber rides were simply more convenient than renting a car from a neighbour — limiting Uber Carshare''s addressable market.</li><li><strong>Competitive P2P market</strong> — Established players including GoGet and Flexicar (Hertz) had already entrenched corporate and individual subscribers.</li><li><strong>Unit economics were challenging</strong> — P2P car sharing requires dense supply (many cars listed in each suburb) to serve demand efficiently — building this supply takes years and sustained marketing investment.</li><li><strong>Strategic deprioritisation within Uber</strong> — As Uber globally sought profitability, non-core business lines in individual markets became early casualties.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Core Uber product cannibalised demand</strong> — For many use cases, Uber rides were simply more convenient than renting a car from a neighbour — limiting Uber Carshare''s addressable market.</li><li><strong>Competitive P2P market</strong> — Established players including GoGet and Flexicar (Hertz) had already entrenched corporate and individual subscribers.</li><li><strong>Unit economics were challenging</strong> — P2P car sharing requires dense supply (many cars listed in each suburb) to serve demand efficiently — building this supply takes years and sustained marketing investment.</li><li><strong>Strategic deprioritisation within Uber</strong> — As Uber globally sought profitability, non-core business lines in individual markets became early casualties.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Uber Carshare exited the Australian market in late 2025, leaving a gap in the car-sharing ecosystem that competitors moved to fill. The exit was described as leaving "an undeniable gap" for thousands of Australians who relied on the service.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Uber Carshare exited the Australian market in late 2025, leaving a gap in the car-sharing ecosystem that competitors moved to fill. The exit was described as leaving "an undeniable gap" for thousands of Australians who relied on the service.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Uber Carshare''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Uber Carshare''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Platform adjacency strategies require independent viability assessment</strong> — Adding a service to an app doesn''t guarantee it is strategically or economically viable on its own.</li><li><strong>P2P marketplace density is a precondition for service quality</strong> — Without sufficient supply density, customer experience degrades and churn accelerates.</li><li><strong>Corporate parent profitability focus is a constant threat to subsidiary investment</strong> — When Uber needed to cut, non-core Australian services were first.</li><li><strong>Acquisition for strategic optionality is expensive</strong> — Paying an acquisition premium for a startup that ultimately can''t survive within the parent''s portfolio is costly.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Platform adjacency strategies require independent viability assessment</strong> — Adding a service to an app doesn''t guarantee it is strategically or economically viable on its own.</li><li><strong>P2P marketplace density is a precondition for service quality</strong> — Without sufficient supply density, customer experience degrades and churn accelerates.</li><li><strong>Corporate parent profitability focus is a constant threat to subsidiary investment</strong> — When Uber needed to cut, non-core Australian services were first.</li><li><strong>Acquisition for strategic optionality is expensive</strong> — Paying an acquisition premium for a startup that ultimately can''t survive within the parent''s portfolio is costly.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LinkedIn / Paul Ingersole', 'https://www.linkedin.com/posts/ingersolepaul_uber-carshare-alternatives-australia-smarter-activity-7448528054957645824-81Sl', 1, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
