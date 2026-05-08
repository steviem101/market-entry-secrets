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
    'catch-australia-market-entry', 'How Catch.com.au Struggled in the Australian Market', 'Catch.com.au was Australia''s original daily deals and online marketplace pioneer. Acquired by Wesfarmers in 2019 for A$230 million, the platform accumulated nearly A$450 million in trading losses under Wesfarmers'' ownership before being wound down in January 2025.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Catch.com.au was Australia''s original daily deals and online marketplace pioneer.', 'Wesfarmers announced Catch''s wind-down in January 2025, with final closure by June 2025 (Q4 FY2025).']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Australia"}, {"icon": "Briefcase", "label": "Sector", "value": "E-commerce / Marketplace"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Catch.com.au', 'https://img.logo.dev/catch.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://catch.com.au', 'Australia', 'Australia',
      '2006-01-01', 'E-commerce / Marketplace', 2, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://catch.com.au'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/catch.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Gabby Leibovich', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Hezi Leibovich', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Catch.com.au was Australia''s original daily deals and online marketplace pioneer. Acquired by Wesfarmers in 2019 for A$230 million, the platform accumulated nearly A$450 million in trading losses under Wesfarmers'' ownership before being wound down in January 2025.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Catch.com.au was Australia''s original daily deals and online marketplace pioneer. Acquired by Wesfarmers in 2019 for A$230 million, the platform accumulated nearly A$450 million in trading losses under Wesfarmers'' ownership before being wound down in January 2025.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>This case is instructive not as a foreign company entering Australia, but as an example of a strategic acquirer failing to integrate or protect a digital native from incoming international competition. Wesfarmers bought Catch to build e-commerce capabilities, but left it operating largely independently.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>This case is instructive not as a foreign company entering Australia, but as an example of a strategic acquirer failing to integrate or protect a digital native from incoming international competition. Wesfarmers bought Catch to build e-commerce capabilities, but left it operating largely independently.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Amazon''s scale overwhelmed Catch''s position</strong> — When Wesfarmers bought Catch in 2019, Amazon had been in Australia for less than two years. By 2025, Amazon had 10% of online shopping spend, Temu had 20% — together dismantling Catch''s competitive position.</li><li><strong>Marketplace economics require massive scale</strong> — As Wesfarmers CEO Rob Scott acknowledged, "standalone, broad-based marketplaces require significant scale and traffic to achieve profitability. International players are better able to leverage their global scale."</li><li><strong>Synergies never materialised</strong> — Despite the stated goal of building e-commerce expertise across Kmart and Target, Catch was never integrated into Wesfarmers'' ecosystem in a way that created competitive advantage.</li><li><strong>Product range differentiation lost</strong> — Under Wesfarmers, Catch lost the sharp buying and own-product capabilities that had made its original founders (Gabby and Hezi Leibovich) successful.</li><li><strong>Fulfilment centres operating at <50% capacity</strong> — A signal of structural over-investment in fixed costs relative to achievable volume.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Amazon''s scale overwhelmed Catch''s position</strong> — When Wesfarmers bought Catch in 2019, Amazon had been in Australia for less than two years. By 2025, Amazon had 10% of online shopping spend, Temu had 20% — together dismantling Catch''s competitive position.</li><li><strong>Marketplace economics require massive scale</strong> — As Wesfarmers CEO Rob Scott acknowledged, "standalone, broad-based marketplaces require significant scale and traffic to achieve profitability. International players are better able to leverage their global scale."</li><li><strong>Synergies never materialised</strong> — Despite the stated goal of building e-commerce expertise across Kmart and Target, Catch was never integrated into Wesfarmers'' ecosystem in a way that created competitive advantage.</li><li><strong>Product range differentiation lost</strong> — Under Wesfarmers, Catch lost the sharp buying and own-product capabilities that had made its original founders (Gabby and Hezi Leibovich) successful.</li><li><strong>Fulfilment centres operating at <50% capacity</strong> — A signal of structural over-investment in fixed costs relative to achievable volume.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Wesfarmers announced Catch''s wind-down in January 2025, with final closure by June 2025 (Q4 FY2025). Approximately 200 jobs were lost. The fulfilment centres were transferred to Kmart Group, which operates them more cost-effectively. Cumulative losses under Wesfarmers approached A$450M.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Wesfarmers announced Catch''s wind-down in January 2025, with final closure by June 2025 (Q4 FY2025). Approximately 200 jobs were lost. The fulfilment centres were transferred to Kmart Group, which operates them more cost-effectively. Cumulative losses under Wesfarmers approached A$450M.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Catch.com.au''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Catch.com.au''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Acquisition of a local digital player buys time, not immunity</strong> — Foreign competition (Amazon, Temu) will eventually outscale any locally owned marketplace without continuous capital investment.</li><li><strong>Marketplace integration must be deep and immediate</strong> — Half-measures that leave an acquired business "operating independently" without the full benefit of group resources create the worst of both worlds.</li><li><strong>Digital platforms have scale thresholds, not gradual curves</strong> — Below a certain transaction volume, a marketplace becomes structurally unprofitable regardless of management quality.</li><li><strong>Assess acquisition rationale carefully</strong> — Wesfarmers admitted it bought Catch for capability, not for Catch itself — a rationale that rarely justifies the acquisition price.</li><li><strong>Competitive due diligence must include forthcoming entrants, not just current players</strong> — Amazon was "new" in 2019; Temu didn''t exist. Strategic planning must scenario-model for new entrants.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Acquisition of a local digital player buys time, not immunity</strong> — Foreign competition (Amazon, Temu) will eventually outscale any locally owned marketplace without continuous capital investment.</li><li><strong>Marketplace integration must be deep and immediate</strong> — Half-measures that leave an acquired business "operating independently" without the full benefit of group resources create the worst of both worlds.</li><li><strong>Digital platforms have scale thresholds, not gradual curves</strong> — Below a certain transaction volume, a marketplace becomes structurally unprofitable regardless of management quality.</li><li><strong>Assess acquisition rationale carefully</strong> — Wesfarmers admitted it bought Catch for capability, not for Catch itself — a rationale that rarely justifies the acquisition price.</li><li><strong>Competitive due diligence must include forthcoming entrants, not just current players</strong> — Amazon was "new" in 2019; Temu didn''t exist. Strategic planning must scenario-model for new entrants.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wesfarmers (official)', 'https://www.wesfarmers.com.au/util/news-media/article/2025/05/29/catch-wind-down-and-onedigital-update', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The West Australian', 'https://thewest.com.au/business/retail/wesfarmers-pulls-pin-on-loss-making-online-retailer--c-17453936', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Capital Brief', 'https://www.capitalbrief.com/article/the-untold-story-of-how-wesfarmers-killed-catchcomau-ce74981e-eb68-4329-ab3b-f185f89ca565/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Inside Retail', 'https://insideretail.com.au/business/a-catch-22-experts-weigh-in-on-the-wind-down-of-the-e-commerce-disruptor-202501', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
