DO $do_block$
DECLARE
  v_id uuid;
  v_sec_0 uuid;
  v_sec_1 uuid;
  v_sec_2 uuid;
  v_sec_3 uuid;
BEGIN
  INSERT INTO content_items (
    slug, title, subtitle, category_id, content_type, status, featured,
    read_time, tldr, quick_facts, researched_by, style_version
  ) VALUES (
    'sensat-anz-market-entry', 'How Sensat Entered the ANZ Market', 'Sensat is a UK construction technology company focused on digital twins, spatial data, and visualisation for complex infrastructure projects.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is a strong MES example of a government-supported, infrastructure-focused UK startup using a credibility-heavy entry route rather than a high-volume sales approach.', 'Sensat used the Tech Nation Digital Trade Network and then a Sydney office with local go-to-market leadership to establish an ANZ foothold in infrastructure and utilities.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Sensat', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Construction Tech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Sensat is a UK construction technology company focused on digital twins, spatial data, and visualisation for complex infrastructure projects.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s infrastructure pipeline and growing digital twin sophistication make it a strong market for infrastructure visualisation and collaboration software.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Sensat used the Tech Nation Digital Trade Network and then a Sydney office with local go-to-market leadership to establish an ANZ foothold in infrastructure and utilities.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is a strong MES example of a government-supported, infrastructure-focused UK startup using a credibility-heavy entry route rather than a high-volume sales approach.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Sensat''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Sensat story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Sensat newsroom', 'https://www.sensat.co/news', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Sensat company pages', 'https://www.sensat.co/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tech Nation / Founders Forum references', 'https://technation.io/', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infrastructure Australia', 'https://www.infrastructureaustralia.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NSW Spatial Digital Twin context', 'https://www.nsw.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LinkedIn company updates for ANZ leadership', 'https://www.linkedin.com/company/sensat/', 6, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infrastructure sector coverage', 'https://www.theurbandeveloper.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
