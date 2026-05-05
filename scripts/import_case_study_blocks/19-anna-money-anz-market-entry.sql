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
    'anna-money-anz-market-entry', 'How ANNA Money Entered the ANZ Market', 'ANNA Money is a UK SME financial admin and business banking platform combining payments, cards, bookkeeping, invoicing, and tax support.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is one of the clearest MES examples of acquisition as a market entry shortcut for a UK startup entering Australia.', 'ANNA chose acquisition over greenfield build by buying Sydney-based GetCape, instantly gaining local infrastructure, customers, and leadership instead of spending years assembling them.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'ANNA Money', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Fintech', NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ANNA Money is a UK SME financial admin and business banking platform combining payments, cards, bookkeeping, invoicing, and tax support.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s very large micro-business segment and frustration with traditional bank admin experiences make it fertile ground for digitally native SME finance products.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>ANNA chose acquisition over greenfield build by buying Sydney-based GetCape, instantly gaining local infrastructure, customers, and leadership instead of spending years assembling them.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is one of the clearest MES examples of acquisition as a market entry shortcut for a UK startup entering Australia.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, ANNA Money''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The ANNA Money story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANNA Money company pages', 'https://anna.money/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANNA newsroom or blog', 'https://anna.money/blog/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Founding and growth coverage', 'https://techcrunch.com/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian small business statistics', 'https://www.abs.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian SME banking market coverage', 'https://www.afr.com/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'GetCape company or acquisition coverage', 'https://www.getcape.com/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian fintech media coverage', 'https://www.fintechfutures.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Acquisition coverage', 'https://www.finextra.com/', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
