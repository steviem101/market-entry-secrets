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
    'esprit-australia-market-entry', 'How Esprit Struggled in the Australian Market', 'Esprit, the German-headquartered but Hong Kong-listed fashion brand, had operated in Australia since the 1980s — making its exit in 2018 a three-decade relationship gone sour.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Esprit, the German-headquartered but Hong Kong-listed fashion brand, had operated in Australia since the 1980s — making its exit in 2018 a three-decade relationship gone sour.', 'In May 2018, Esprit announced closure of all 67 ANZ stores by year end, with 350 staff losing jobs.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Germany / Hong Kong"}, {"icon": "Briefcase", "label": "Sector", "value": "Fashion Retail"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Esprit', 'https://img.logo.dev/esprit.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://esprit.com', 'Germany / Hong Kong', 'Australia',
      '1989-01-01', 'Fashion Retail', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://esprit.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/esprit.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>Esprit, the German-headquartered but Hong Kong-listed fashion brand, had operated in Australia since the 1980s — making its exit in 2018 a three-decade relationship gone sour. Despite multiple turnaround attempts, ANZ operations were loss-making for years before the plug was pulled.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Esprit, the German-headquartered but Hong Kong-listed fashion brand, had operated in Australia since the 1980s — making its exit in 2018 a three-decade relationship gone sour. Despite multiple turnaround attempts, ANZ operations were loss-making for years before the plug was pulled.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Esprit entered Australia decades before the current fast-fashion era, establishing a strong department store concession model (particularly through Myer) and standalone retail stores. At the time of exit, it had 16 retail stores, 38 Myer concessions, and 13 factory outlets — 67 directly managed points of sale across ANZ.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Esprit entered Australia decades before the current fast-fashion era, establishing a strong department store concession model (particularly through Myer) and standalone retail stores. At the time of exit, it had 16 retail stores, 38 Myer concessions, and 13 factory outlets — 67 directly managed points of sale across ANZ.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Fast fashion disruption</strong> — The arrival of H&amp;M, Zara, Uniqlo, and others from the mid-2000s onwards commoditised the fashion segment Esprit occupied — mid-market, casual basics — at significantly lower price points.</li><li><strong>Cost structure could not absorb the competition</strong> — Despite "intensive efforts" to turn around the business, the cost of running 67 stores made profitability impossible once the competitive intensity increased.</li><li><strong>Global brand dilution</strong> — Esprit''s global design vision had lost relevance — Australian consumers who once aspired to the brand found international competitors offered more trend-forward designs at lower prices.</li><li><strong>Revenue scale too small to justify maintenance</strong> — ANZ contributed HK$297 million (approximately US$38M) in FY2017 — less than 2% of global revenue. The economics of maintaining ANZ could never justify the management bandwidth.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Fast fashion disruption</strong> — The arrival of H&amp;M, Zara, Uniqlo, and others from the mid-2000s onwards commoditised the fashion segment Esprit occupied — mid-market, casual basics — at significantly lower price points.</li><li><strong>Cost structure could not absorb the competition</strong> — Despite "intensive efforts" to turn around the business, the cost of running 67 stores made profitability impossible once the competitive intensity increased.</li><li><strong>Global brand dilution</strong> — Esprit''s global design vision had lost relevance — Australian consumers who once aspired to the brand found international competitors offered more trend-forward designs at lower prices.</li><li><strong>Revenue scale too small to justify maintenance</strong> — ANZ contributed HK$297 million (approximately US$38M) in FY2017 — less than 2% of global revenue. The economics of maintaining ANZ could never justify the management bandwidth.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>In May 2018, Esprit announced closure of all 67 ANZ stores by year end, with 350 staff losing jobs. The one-off exit costs were estimated at HK$150–200 million (approximately A$25–33M). The company redirected resources to China, Hong Kong, Taiwan, Singapore, and Malaysia.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>In May 2018, Esprit announced closure of all 67 ANZ stores by year end, with 350 staff losing jobs. The one-off exit costs were estimated at HK$150–200 million (approximately A$25–33M). The company redirected resources to China, Hong Kong, Taiwan, Singapore, and Malaysia.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Esprit''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Esprit''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ market tenure does not insulate against structural shifts</strong> — Being established for 30+ years provides no protection when the competitive landscape fundamentally changes.</li><li><strong>Revenue contribution of <2% of global revenue signals strategic expendability</strong> — If Australia is too small to matter on a global P&amp;L, it will be cut in a downturn.</li><li><strong>Department store concession models amplify vulnerability</strong> — Esprit''s reliance on Myer as a channel meant its fate was tied to Myer''s declining traffic and footfall.</li><li><strong>Fast-fashion disruption arrives slowly, then all at once</strong> — The erosion of Esprit''s position took years; the exit happened fast.</li><li><strong>Exit costs must be budgeted before entry</strong> — The A$25–33M exit bill was a material cost on a business generating A$50M in revenue.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>ANZ market tenure does not insulate against structural shifts</strong> — Being established for 30+ years provides no protection when the competitive landscape fundamentally changes.</li><li><strong>Revenue contribution of <2% of global revenue signals strategic expendability</strong> — If Australia is too small to matter on a global P&amp;L, it will be cut in a downturn.</li><li><strong>Department store concession models amplify vulnerability</strong> — Esprit''s reliance on Myer as a channel meant its fate was tied to Myer''s declining traffic and footfall.</li><li><strong>Fast-fashion disruption arrives slowly, then all at once</strong> — The erosion of Esprit''s position took years; the exit happened fast.</li><li><strong>Exit costs must be budgeted before entry</strong> — The A$25–33M exit bill was a material cost on a business generating A$50M in revenue.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Inside Retail Asia', 'https://insideretail.asia/2018/05/03/end-days-for-esprit-australia-and-new-zealand-stores/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Inside Retail NZ', 'https://insideretail.co.nz/2018/05/03/esprit-to-exit-new-zealand-australia/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FashionUnited', 'https://fashionunited.com/news/retail/esprit-decides-to-stop-operations-in-australia-and-new-zealand/2018050320978', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
