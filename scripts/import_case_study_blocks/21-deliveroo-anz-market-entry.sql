DO $do_block$
DECLARE
  v_id uuid;
  v_sec_0 uuid;
  v_sec_1 uuid;
  v_sec_2 uuid;
  v_sec_3 uuid;
  v_sec_4 uuid;
BEGIN
  INSERT INTO content_items (
    slug, title, subtitle, category_id, content_type, status, featured,
    read_time, tldr, quick_facts, researched_by, style_version
  ) VALUES (
    'deliveroo-anz-market-entry', 'How Deliveroo Entered the ANZ Market', 'Deliveroo is a UK-founded food delivery marketplace that expanded aggressively internationally before later exiting Australia and then being acquired by DoorDash globally.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is a valuable MES case not because it succeeded long term in ANZ, but because it shows how even strong UK startups can misread capital requirements in a two-sided platform market.', 'Deliveroo launched early, scaled across major cities, but eventually concluded that the market structure made profitable leadership too capital intensive.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Marketplace"}]'::jsonb, 'Stephen Browne', 2
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
    -- explicit NULLs for is_profitable and employee_count to override misleading column defaults
    INSERT INTO content_company_profiles (
      content_id, company_name, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Deliveroo', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Marketplace', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Deliveroo is a UK-founded food delivery marketplace that expanded aggressively internationally before later exiting Australia and then being acquired by DoorDash globally.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia initially looked highly attractive because of urban density, restaurant culture, and mobile adoption, but the same conditions also attracted aggressive global competition.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Deliveroo launched early, scaled across major cities, but eventually concluded that the market structure made profitable leadership too capital intensive.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is a valuable MES case not because it succeeded long term in ANZ, but because it shows how even strong UK startups can misread capital requirements in a two-sided platform market.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Deliveroo''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, Deliveroo''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The Deliveroo story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo corporate newsroom', 'https://corporate.deliveroo.co.uk/media-centre/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'DoorDash acquisition coverage', 'https://about.doordash.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LSE / corporate history references', 'https://corporate.deliveroo.co.uk/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian food delivery market coverage', 'https://www.afr.com/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Competition and consumer market reporting', 'https://www.smartcompany.com.au/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Administrator / KordaMentha information', 'https://kordamentha.com/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian business coverage', 'https://www.abc.net.au/news', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
