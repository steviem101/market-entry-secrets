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
    'complyadvantage-anz-market-entry', 'How ComplyAdvantage Entered the ANZ Market', 'ComplyAdvantage is a UK RegTech company focused on AML, sanctions screening, and financial crime risk intelligence.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is a strong MES example of pre-positioning for a regulatory wave rather than reacting after the market gets crowded.', 'ComplyAdvantage combined a Sydney-based APAC leadership model with local compliance content and ecosystem participation to build trust ahead of the Tranche 2 regulatory expansion.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech"}]'::jsonb, 'Stephen Browne', 2
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
      entry_date, industry, founder_count
    ) VALUES (
      v_id, 'ComplyAdvantage', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'RegTech', NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ComplyAdvantage is a UK RegTech company focused on AML, sanctions screening, and financial crime risk intelligence.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s AML reform cycle and expanding compliance burden made ANZ a strong market for a company willing to enter before demand peaked.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>ComplyAdvantage combined a Sydney-based APAC leadership model with local compliance content and ecosystem participation to build trust ahead of the Tranche 2 regulatory expansion.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is a strong MES example of pre-positioning for a regulatory wave rather than reacting after the market gets crowded.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>ComplyAdvantage''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, ComplyAdvantage''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The ComplyAdvantage story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ComplyAdvantage newsroom', 'https://complyadvantage.com/insights/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Company pages', 'https://complyadvantage.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Funding and growth coverage', 'https://techcrunch.com/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AUSTRAC reform updates', 'https://www.austrac.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian Government AML reform materials', 'https://www.ag.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FinTech Australia member ecosystem', 'https://www.fintechaustralia.org.au/', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANZ compliance media coverage', 'https://www.afr.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
