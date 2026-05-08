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
    'laybuy-australia-market-entry', 'How Laybuy Struggled in the Australian Market', 'Laybuy was a New Zealand-founded BNPL company that ASX-listed in September 2020 to fund UK and Australian expansion.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Laybuy was a New Zealand-founded BNPL company that ASX-listed in September 2020 to fund UK and Australian expansion.', 'Laybuy Group Holdings, Laybuy Holdings, and Laybuy Australia Pty Ltd were all placed into receivership on 17 June 2024 by Deloitte.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "New Zealand"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech / BNPL"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Laybuy', 'https://img.logo.dev/laybuy.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://laybuy.com', 'New Zealand', 'Australia',
      '2017-01-01', 'Fintech / BNPL', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://laybuy.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/laybuy.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Gary Rohloff', 'Co-founder & CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>Laybuy was a New Zealand-founded BNPL company that ASX-listed in September 2020 to fund UK and Australian expansion. After a brutal combination of post-COVID retail decline, rising defaults, cyberattacks, and a failed sale process, it entered receivership in June 2024.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Laybuy was a New Zealand-founded BNPL company that ASX-listed in September 2020 to fund UK and Australian expansion. After a brutal combination of post-COVID retail decline, rising defaults, cyberattacks, and a failed sale process, it entered receivership in June 2024.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Founded in Auckland in 2017, Laybuy expanded into Australia and the UK, building a base of approximately 766,000 customers and 10,500 merchants globally. It listed on the ASX in 2020 specifically to access capital for this international expansion, raising funds from retail investors who were enthusiastic about the BNPL sector''s pandemic-era boom.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Founded in Auckland in 2017, Laybuy expanded into Australia and the UK, building a base of approximately 766,000 customers and 10,500 merchants globally. It listed on the ASX in 2020 specifically to access capital for this international expansion, raising funds from retail investors who were enthusiastic about the BNPL sector''s pandemic-era boom.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Listed at the peak of BNPL mania</strong> — The ASX IPO occurred at the exact top of the BNPL valuation cycle. Rising interest rates in 2022–23 fundamentally broke the model — Laybuy funded interest-free credit via loans, and rising borrowing costs destroyed unit economics.</li><li><strong>Credit losses accelerated</strong> — Consumer spending downturn increased defaults and fraud, particularly in UK operations, further draining capital.</li><li><strong>Failed sale process</strong> — Between December 2023 and April 2024, directors sought a buyer or new investment. A deal fell through at the last minute.</li><li><strong>Delisted in 2023</strong> — Laybuy was delisted from the ASX in March 2023 — before its collapse — eliminating its ability to raise equity capital.</li><li><strong>Market concentration</strong> — Afterpay and Zip dominated Australian BNPL, leaving no space for a smaller, less well-capitalised regional player.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Listed at the peak of BNPL mania</strong> — The ASX IPO occurred at the exact top of the BNPL valuation cycle. Rising interest rates in 2022–23 fundamentally broke the model — Laybuy funded interest-free credit via loans, and rising borrowing costs destroyed unit economics.</li><li><strong>Credit losses accelerated</strong> — Consumer spending downturn increased defaults and fraud, particularly in UK operations, further draining capital.</li><li><strong>Failed sale process</strong> — Between December 2023 and April 2024, directors sought a buyer or new investment. A deal fell through at the last minute.</li><li><strong>Delisted in 2023</strong> — Laybuy was delisted from the ASX in March 2023 — before its collapse — eliminating its ability to raise equity capital.</li><li><strong>Market concentration</strong> — Afterpay and Zip dominated Australian BNPL, leaving no space for a smaller, less well-capitalised regional player.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Laybuy Group Holdings, Laybuy Holdings, and Laybuy Australia Pty Ltd were all placed into receivership on 17 June 2024 by Deloitte. Klarna acquired Laybuy''s customer base and technology platform from the receivers.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Laybuy Group Holdings, Laybuy Holdings, and Laybuy Australia Pty Ltd were all placed into receivership on 17 June 2024 by Deloitte. Klarna acquired Laybuy''s customer base and technology platform from the receivers.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Laybuy''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Laybuy''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Timing market entry around funding cycles matters</strong> — IPOing a capital-hungry fintech at the top of a sector bubble creates fragility when conditions change.</li><li><strong>Interest rate sensitivity must be modelled for BNPL</strong> — A model that funds interest-free credit through debt is existentially vulnerable to rate hikes.</li><li><strong>Niche BNPL players need a defensible vertical or geography</strong> — Without a protected niche, smaller players are outspent and outcompeted by global and local giants.</li><li><strong>Cross-border operations amplify risk</strong> — Simultaneous Australia, NZ, and UK expansion tripled complexity and cost without tripling revenue.</li><li><strong>Have a secondary capital source</strong> — Sole reliance on public markets for a loss-making startup is extremely fragile.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Timing market entry around funding cycles matters</strong> — IPOing a capital-hungry fintech at the top of a sector bubble creates fragility when conditions change.</li><li><strong>Interest rate sensitivity must be modelled for BNPL</strong> — A model that funds interest-free credit through debt is existentially vulnerable to rate hikes.</li><li><strong>Niche BNPL players need a defensible vertical or geography</strong> — Without a protected niche, smaller players are outspent and outcompeted by global and local giants.</li><li><strong>Cross-border operations amplify risk</strong> — Simultaneous Australia, NZ, and UK expansion tripled complexity and cost without tripling revenue.</li><li><strong>Have a secondary capital source</strong> — Sole reliance on public markets for a loss-making startup is extremely fragile.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deloitte NZ', 'https://www.deloitte.com/nz/en/about/media-room/laybuy-receivership-media-statement-17-june-2024.html', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, '1News', 'https://www.1news.co.nz/2024/06/17/heartbroken-laybuy-companies-placed-into-receivership/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Chris Lynch Media', 'https://www.chrislynchmedia.com/news-items/laybuy-liquidators-reveal-details-of-companys-collapse-and-creditor-claims/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
