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
    'menulog-australia-market-entry', 'How Menulog Struggled in the Australian Market', 'Menulog was founded in Australia in 2006 as one of the country''s first online food ordering platforms.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Menulog was founded in Australia in 2006 as one of the country''s first online food ordering platforms.', 'Menulog ceased operations on 26 November 2025, with approximately 120 staff made redundant and tens of thousands of restaurant partners and couriers losing the platform as a revenue channel.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Netherlands (via UK)"}, {"icon": "Briefcase", "label": "Sector", "value": "Food Delivery / Marketplace"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Menulog', 'https://img.logo.dev/menulog.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://menulog.com.au', 'Netherlands (via UK)', 'Australia',
      '2015-01-01', 'Food Delivery / Marketplace', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://menulog.com.au'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/menulog.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>Menulog was founded in Australia in 2006 as one of the country''s first online food ordering platforms. After a 2015 acquisition by UK-based Just Eat (later Just Eat Takeaway.com), it became a foreign-owned operation and ultimately failed to maintain relevance. It ceased operations on 26 November 2025 after nearly 20 years.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Menulog was founded in Australia in 2006 as one of the country''s first online food ordering platforms. After a 2015 acquisition by UK-based Just Eat (later Just Eat Takeaway.com), it became a foreign-owned operation and ultimately failed to maintain relevance. It ceased operations on 26 November 2025 after nearly 20 years.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Menulog was originally a domestic startup and was therefore an acquisition-led "entry" by Just Eat in 2015. Just Eat Takeaway.com retained the Menulog brand and invested heavily in marketing, most famously signing global celebrity ambassadors including Snoop Dogg, Katy Perry, and Christina Aguilera.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Menulog was originally a domestic startup and was therefore an acquisition-led "entry" by Just Eat in 2015. Just Eat Takeaway.com retained the Menulog brand and invested heavily in marketing, most famously signing global celebrity ambassadors including Snoop Dogg, Katy Perry, and Christina Aguilera.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>High-profile marketing did not translate to market share</strong> — Despite extraordinary celebrity campaigns, Menulog''s share remained 5–10% while Uber Eats commanded 85–90% of the food delivery market.</li><li><strong>Failed to invest in logistics infrastructure</strong> — Unlike Uber Eats and DoorDash, Menulog was slow to build its own delivery fleet, relying on restaurants to self-deliver for much of its history — a structural disadvantage as consumers valued speed and reliability.</li><li><strong>Deliveroo''s collapse gave DoorDash the opportunity</strong> — After Deliveroo exited in 2022, DoorDash absorbed most of its market share, not Menulog — indicating brand weakness in Australian consumer minds.</li><li><strong>Consecutive years of significant operating losses</strong> — The business was structurally unprofitable in a market dominated by a competitor with massive cross-sell advantages (Uber''s rideshare user base feeding Uber Eats).</li><li><strong>International strategic misalignment</strong> — Parent company Just Eat Takeaway was under significant financial pressure globally and ultimately chose to "focus on accelerating growth in other markets."</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>High-profile marketing did not translate to market share</strong> — Despite extraordinary celebrity campaigns, Menulog''s share remained 5–10% while Uber Eats commanded 85–90% of the food delivery market.</li><li><strong>Failed to invest in logistics infrastructure</strong> — Unlike Uber Eats and DoorDash, Menulog was slow to build its own delivery fleet, relying on restaurants to self-deliver for much of its history — a structural disadvantage as consumers valued speed and reliability.</li><li><strong>Deliveroo''s collapse gave DoorDash the opportunity</strong> — After Deliveroo exited in 2022, DoorDash absorbed most of its market share, not Menulog — indicating brand weakness in Australian consumer minds.</li><li><strong>Consecutive years of significant operating losses</strong> — The business was structurally unprofitable in a market dominated by a competitor with massive cross-sell advantages (Uber''s rideshare user base feeding Uber Eats).</li><li><strong>International strategic misalignment</strong> — Parent company Just Eat Takeaway was under significant financial pressure globally and ultimately chose to "focus on accelerating growth in other markets."</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Menulog ceased operations on 26 November 2025, with approximately 120 staff made redundant and tens of thousands of restaurant partners and couriers losing the platform as a revenue channel. The closure left Uber Eats and DoorDash as the only two major players, raising duopoly concerns.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Menulog ceased operations on 26 November 2025, with approximately 120 staff made redundant and tens of thousands of restaurant partners and couriers losing the platform as a revenue channel. The closure left Uber Eats and DoorDash as the only two major players, raising duopoly concerns.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Menulog''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Menulog''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Marketing spend without product parity is wasted capital</strong> — Celebrity campaigns cannot substitute for structural platform superiority.</li><li><strong>Acquisition of a local player does not guarantee market leadership</strong> — Just Eat bought market entry, not market leadership.</li><li><strong>Delivery logistics infrastructure is a durable competitive moat</strong> — In food delivery, owning the rider network beats marketplace-only models.</li><li><strong>Understand parent company global priorities</strong> — When a subsidiary''s home country conflicts with the parent''s global investment thesis, the subsidiary is vulnerable.</li><li><strong>Two-player markets emerge quickly in on-demand delivery</strong> — Enter with a funded plan to be #1 or #2, or don''t enter at all.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Marketing spend without product parity is wasted capital</strong> — Celebrity campaigns cannot substitute for structural platform superiority.</li><li><strong>Acquisition of a local player does not guarantee market leadership</strong> — Just Eat bought market entry, not market leadership.</li><li><strong>Delivery logistics infrastructure is a durable competitive moat</strong> — In food delivery, owning the rider network beats marketplace-only models.</li><li><strong>Understand parent company global priorities</strong> — When a subsidiary''s home country conflicts with the parent''s global investment thesis, the subsidiary is vulnerable.</li><li><strong>Two-player markets emerge quickly in on-demand delivery</strong> — Enter with a funded plan to be #1 or #2, or don''t enter at all.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'QSR Media', 'https://qsrmedia.com.au/food-services/exclusive/menulog-exits-australia-after-20-years-uber-doordash-dominate', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News', 'https://www.abc.net.au/news/2025-11-13/menulog-is-closing-down-in-australia-here-s-what-we-know/106002740', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Retail Gazette', 'https://www.retailgazette.co.uk/blog/2025/11/just-eat-takeaway-to-exit/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mediaweek', 'https://www.mediaweek.com.au/they-missed-the-mark-why-menulog-failed-in-australia/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
