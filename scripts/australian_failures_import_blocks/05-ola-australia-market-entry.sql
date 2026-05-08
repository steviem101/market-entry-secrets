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
    'ola-australia-market-entry', 'How Ola Struggled in the Australian Market', 'Ola, India''s dominant rideshare company, entered Australia in 2018 as one of three Uber challengers.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Ola, India''s dominant rideshare company, entered Australia in 2018 as one of three Uber challengers.', 'Ola''s Australian and New Zealand operations closed on 12 April 2024.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "India"}, {"icon": "Briefcase", "label": "Sector", "value": "Rideshare"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Ola', 'https://img.logo.dev/olacabs.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://olacabs.com', 'India', 'Australia',
      '2018-01-01', 'Rideshare', 2, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://olacabs.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/olacabs.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Bhavish Aggarwal', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Ankit Bhati', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Ola, India''s dominant rideshare company, entered Australia in 2018 as one of three Uber challengers. After six years of losses and a strategic pivot ahead of an Indian stock market listing, Ola abruptly ceased Australian operations in April 2024 with just two days'' notice.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Ola, India''s dominant rideshare company, entered Australia in 2018 as one of three Uber challengers. After six years of losses and a strategic pivot ahead of an Indian stock market listing, Ola abruptly ceased Australian operations in April 2024 with just two days'' notice.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Ola launched in Perth in 2018 and expanded to Sydney, Melbourne, Brisbane, the Gold Coast, Adelaide, and Canberra. It used a price-competition strategy common to rideshare challengers globally — subsidised fares to attract drivers and riders — hoping to build enough critical mass to survive as a viable #2 player behind Uber.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Ola launched in Perth in 2018 and expanded to Sydney, Melbourne, Brisbane, the Gold Coast, Adelaide, and Canberra. It used a price-competition strategy common to rideshare challengers globally — subsidised fares to attract drivers and riders — hoping to build enough critical mass to survive as a viable #2 player behind Uber.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Never achieved profitability</strong> — Ola reported no profitable quarter in Australia across its six years of operation.</li><li><strong>Uber''s dominance was unassailable</strong> — Uber had a multi-year head start and strong brand recognition. Ola''s promotional pricing attracted deal-seekers rather than loyal users.</li><li><strong>Scaled back in 2020</strong> — The pandemic caused Ola to dramatically reduce Australian operations in 2020, and the company had not posted on social media since 2021 — a visible signal of declining investment.</li><li><strong>Indian priorities reasserted</strong> — Ola was preparing for an Indian IPO (and had already listed its electric vehicle subsidiary, Ola Electric). International markets became a distraction from the domestic growth story needed for the listing.</li><li><strong>Abrupt exit created reputational damage</strong> — The two-day notice left 1.5 million users and hundreds of drivers with no transition support, drawing criticism from the Transport Workers Union.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Never achieved profitability</strong> — Ola reported no profitable quarter in Australia across its six years of operation.</li><li><strong>Uber''s dominance was unassailable</strong> — Uber had a multi-year head start and strong brand recognition. Ola''s promotional pricing attracted deal-seekers rather than loyal users.</li><li><strong>Scaled back in 2020</strong> — The pandemic caused Ola to dramatically reduce Australian operations in 2020, and the company had not posted on social media since 2021 — a visible signal of declining investment.</li><li><strong>Indian priorities reasserted</strong> — Ola was preparing for an Indian IPO (and had already listed its electric vehicle subsidiary, Ola Electric). International markets became a distraction from the domestic growth story needed for the listing.</li><li><strong>Abrupt exit created reputational damage</strong> — The two-day notice left 1.5 million users and hundreds of drivers with no transition support, drawing criticism from the Transport Workers Union.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Ola''s Australian and New Zealand operations closed on 12 April 2024. The company simultaneously exited the UK, consolidating operations entirely in India. Its exit left the Australian rideshare market as a Uber-dominated duopoly with only DiDi as the remaining challenger.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Ola''s Australian and New Zealand operations closed on 12 April 2024. The company simultaneously exited the UK, consolidating operations entirely in India. Its exit left the Australian rideshare market as a Uber-dominated duopoly with only DiDi as the remaining challenger.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Ola''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Ola''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Subsidised-growth market entry requires commitment to profitability phases</strong> — Entering with price subsidies without a clear path to unit economics is burning money on borrowed time.</li><li><strong>Two-day exit notices are a brand-destroying legacy</strong> — How you exit a market is remembered and affects future re-entry possibilities.</li><li><strong>Be honest about parent company capital allocation priorities</strong> — If the home market demands all capital (as an IPO story), international subsidiaries face existential risk.</li><li><strong>Rideshare and marketplace businesses require critical mass</strong> — Sub-scale position in a network effects business is a structural loss-making position.</li><li><strong>Regulatory risk compounds operational risk</strong> — Australia''s evolving gig economy regulations added cost to a business already losing money.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Subsidised-growth market entry requires commitment to profitability phases</strong> — Entering with price subsidies without a clear path to unit economics is burning money on borrowed time.</li><li><strong>Two-day exit notices are a brand-destroying legacy</strong> — How you exit a market is remembered and affects future re-entry possibilities.</li><li><strong>Be honest about parent company capital allocation priorities</strong> — If the home market demands all capital (as an IPO story), international subsidiaries face existential risk.</li><li><strong>Rideshare and marketplace businesses require critical mass</strong> — Sub-scale position in a network effects business is a structural loss-making position.</li><li><strong>Regulatory risk compounds operational risk</strong> — Australia''s evolving gig economy regulations added cost to a business already losing money.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Information Age / ACS', 'https://ia.acs.org.au/article/2024/uber-competitor-ola-shuts-down-in-australia.html', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'TechCrunch', 'https://techcrunch.com/2024/04/09/india-ola-retreats-from-international-markets-exiting-uk-australia-and-new-zealand/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AAP News', 'https://aapnews.aap.com.au/news/uber-ride-share-rival-ola-hits-the-brakes-in-australia', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Conversation (UQ)', 'https://theconversation.com/rideshare-giant-ola-has-abruptly-exited-the-australian-market-what-does-this-mean-for-the-future-of-ridesharing', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
