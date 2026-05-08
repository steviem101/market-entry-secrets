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
    'volt-bank-australia-market-entry', 'How Volt Bank Collapsed in the Australian Market', 'Volt Bank was Australia''s first purely digital bank to receive a banking licence from APRA (2019), surfing the government''s post-Royal Commission push for neobank competition.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Volt Bank was Australia''s first purely digital bank to receive a banking licence from APRA (2019), surfing the government''s post-Royal Commission push for neobank competition.', 'In June 2022, Volt surrendered its banking licence, returned approximately A$113 million in deposits, and sold its mortgage portfolio.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Australia"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech / Neobank"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Volt Bank', 'https://img.logo.dev/voltbank.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://voltbank.com.au', 'Australia', 'Australia',
      '2019-01-01', 'Fintech / Neobank', 2, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://voltbank.com.au'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/voltbank.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Steve Weston', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Luke Bunbury', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Volt Bank was Australia''s first purely digital bank to receive a banking licence from APRA (2019), surfing the government''s post-Royal Commission push for neobank competition. Three years later, it surrendered its licence and returned deposits — becoming the first Australian neobank to fail.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Volt Bank was Australia''s first purely digital bank to receive a banking licence from APRA (2019), surfing the government''s post-Royal Commission push for neobank competition. Three years later, it surrendered its licence and returned deposits — becoming the first Australian neobank to fail.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Volt entered with the backing of APRA''s new restricted banking licence framework introduced in 2018 following the Royal Commission into banking misconduct. It launched a consumer savings product in 2019 with over 40,000 early-access users and planned to expand into loans and mortgages — the key revenue driver.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Volt entered with the backing of APRA''s new restricted banking licence framework introduced in 2018 following the Royal Commission into banking misconduct. It launched a consumer savings product in 2019 with over 40,000 early-access users and planned to expand into loans and mortgages — the key revenue driver.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Pandemic timing destroyed the expansion plan</strong> — COVID-19 hit in March 2020 — just as Volt was preparing to launch mortgages, its path to profitability. The Australian government imposed rate suppression policies and uncertainty that made the business case for neobank mortgage origination untenable.</li><li><strong>Funding could not be secured</strong> — Volt raised capital in multiple rounds but was unable to close the final funding needed to sustain operations while awaiting profitability.</li><li><strong>B2C banking economics are brutal</strong> — Volt offered a high-interest savings account (funded by the spread), but with near-zero official interest rates, the spread disappeared.</li><li><strong>Scale was insufficient</strong> — By April 2022, Volt had only A$113 million in deposits and A$80 million in home loans — a fraction of the scale needed for viability in Australian retail banking.</li><li><strong>Regulator-created expectations vs. market reality</strong> — APRA''s new restricted licence framework encouraged neobank formation, but the regulatory framework still required full prudential compliance — creating a capital intensity that was incompatible with startup funding.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Pandemic timing destroyed the expansion plan</strong> — COVID-19 hit in March 2020 — just as Volt was preparing to launch mortgages, its path to profitability. The Australian government imposed rate suppression policies and uncertainty that made the business case for neobank mortgage origination untenable.</li><li><strong>Funding could not be secured</strong> — Volt raised capital in multiple rounds but was unable to close the final funding needed to sustain operations while awaiting profitability.</li><li><strong>B2C banking economics are brutal</strong> — Volt offered a high-interest savings account (funded by the spread), but with near-zero official interest rates, the spread disappeared.</li><li><strong>Scale was insufficient</strong> — By April 2022, Volt had only A$113 million in deposits and A$80 million in home loans — a fraction of the scale needed for viability in Australian retail banking.</li><li><strong>Regulator-created expectations vs. market reality</strong> — APRA''s new restricted licence framework encouraged neobank formation, but the regulatory framework still required full prudential compliance — creating a capital intensity that was incompatible with startup funding.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>In June 2022, Volt surrendered its banking licence, returned approximately A$113 million in deposits, and sold its mortgage portfolio. It was the first of four Australian neobanks to exit the market, joining Xinja (returned licence 2020), 86 400 (acquired by NAB), and leaving only Judo Bank as a survivor.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>In June 2022, Volt surrendered its banking licence, returned approximately A$113 million in deposits, and sold its mortgage portfolio. It was the first of four Australian neobanks to exit the market, joining Xinja (returned licence 2020), 86 400 (acquired by NAB), and leaving only Judo Bank as a survivor.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Volt Bank''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Volt Bank''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Regulatory encouragement is not the same as a viable business model</strong> — APRA actively encouraged neobank formation — but the market dynamics (rates, scale requirements, incumbent dominance) were unchanged.</li><li><strong>Time-to-profitability must be stress-tested against catastrophic scenarios</strong> — Volt''s business case assumed conditions that changed within 12 months of launch.</li><li><strong>B2C banking requires substantial scale to absorb regulatory compliance costs</strong> — Australia''s banking regulatory environment is among the most demanding globally.</li><li><strong>Fintech founders should assess the "profitability cliff"</strong> — The point at which a fintech must transition from subsidised growth to sustainable revenue often arrives before funding can bridge the gap.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Regulatory encouragement is not the same as a viable business model</strong> — APRA actively encouraged neobank formation — but the market dynamics (rates, scale requirements, incumbent dominance) were unchanged.</li><li><strong>Time-to-profitability must be stress-tested against catastrophic scenarios</strong> — Volt''s business case assumed conditions that changed within 12 months of launch.</li><li><strong>B2C banking requires substantial scale to absorb regulatory compliance costs</strong> — Australia''s banking regulatory environment is among the most demanding globally.</li><li><strong>Fintech founders should assess the "profitability cliff"</strong> — The point at which a fintech must transition from subsidised growth to sustainable revenue often arrives before funding can bridge the gap.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Reuters', 'https://www.reuters.com/business/finance/australias-first-neobank-volt-shut-deposit-taking-business-return-licence-2022-06-29/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Hello Zai / Fintech', 'https://www.hellozai.com/blog/volt-australia-what-are-your-options', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
