-- Case 1/5: ShopBack (shopback-anz-market-entry)
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
    'shopback-anz-market-entry', 'How ShopBack Entered the ANZ Market', 'Singapore-founded shopping, rewards, and affiliate commerce platform that used Australia as a major developed-market expansion play and later deepened credibility through a strategic Westpac investment.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Singapore-founded shopping, rewards, and affiliate commerce platform that used Australia as a major developed-market expansion play and later deepened credibility through a strategic Westpac investment.', 'ShopBack is a strong MES case because it shows how a Singapore consumer internet company can enter Australia by localising a proven APAC model, then accelerate trust through a domestic bank partnership instead of relying only on venture capital.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "Consumer Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'ShopBack', 'Singapore', 'Australia & New Zealand',
      '2018-01-01', 'Consumer Fintech', 4, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Henry Chan', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Joel Leong', 'Co-founder', false);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Lai Shanru', 'Co-founder', false);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Josephine Chow', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>ShopBack is a strong MES case because it shows how a Singapore consumer internet company can enter Australia by localising a proven APAC model, then accelerate trust through a domestic bank partnership instead of relying only on venture capital. It also demonstrates how affiliate commerce, payments, and strategic channel partnerships can work together in a mature market.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>ShopBack is a strong MES case because it shows how a Singapore consumer internet company can enter Australia by localising a proven APAC model, then accelerate trust through a domestic bank partnership instead of relying only on venture capital. It also demonstrates how affiliate commerce, payments, and strategic channel partnerships can work together in a mature market.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>ShopBack launched in Singapore in 2014 and expanded across Asia before entering Australia around the end of 2018, positioning the country as a major non-Southeast Asian growth market.</li><li>It built local merchant density and consumer awareness through cashback relationships with major retailers, then used Australian media and consumer-tech coverage to reinforce legitimacy.</li><li>In December 2022, Westpac invested US$30 million and partnered with ShopBack to offer bonus cashback opportunities to more than five million Westpac debit and credit customers.</li><li>By 2025–2026, ShopBack was still broadening the Australian proposition through partnerships such as CIMET in utilities and telco comparison, although it also rationalised parts of the product stack such as ShopBack Pay.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>ShopBack launched in Singapore in 2014 and expanded across Asia before entering Australia around the end of 2018, positioning the country as a major non-Southeast Asian growth market.</li><li>It built local merchant density and consumer awareness through cashback relationships with major retailers, then used Australian media and consumer-tech coverage to reinforce legitimacy.</li><li>In December 2022, Westpac invested US$30 million and partnered with ShopBack to offer bonus cashback opportunities to more than five million Westpac debit and credit customers.</li><li>By 2025–2026, ShopBack was still broadening the Australian proposition through partnerships such as CIMET in utilities and telco comparison, although it also rationalised parts of the product stack such as ShopBack Pay.</li></ol>', 2, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li>Enter Australia only after proving the core model in multiple regional markets.</li><li>Use a household-name local partner to compress trust-building time.</li><li>Build a merchant network first, then monetise with finance and adjacent services.</li><li>Treat Australia as both a revenue market and a credibility market for global investors and enterprise partners.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li>Enter Australia only after proving the core model in multiple regional markets.</li><li>Use a household-name local partner to compress trust-building time.</li><li>Build a merchant network first, then monetise with finance and adjacent services.</li><li>Treat Australia as both a revenue market and a credibility market for global investors and enterprise partners.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Strategic capital</strong> — Westpac invested US$30 million in 2022 and tied the investment to a distribution partnership.</li><li><strong>Customer access</strong> — Westpac said the deal gave more than five million customers access to offers through ShopBack.</li><li><strong>Australian scale</strong> — ShopBack Australia was cited by the company as a major brand-establishment success in the market.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Strategic capital</strong> — Westpac invested US$30 million in 2022 and tied the investment to a distribution partnership.</li><li><strong>Customer access</strong> — Westpac said the deal gave more than five million customers access to offers through ShopBack.</li><li><strong>Australian scale</strong> — ShopBack Australia was cited by the company as a major brand-establishment success in the market.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, ShopBack''s playbook offers a clear template. The lessons below distil ShopBack''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, ShopBack''s playbook offers a clear template. The lessons below distil ShopBack''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li>Enter Australia only after proving the core model in multiple regional markets.</li><li>Use a household-name local partner to compress trust-building time.</li><li>Build a merchant network first, then monetise with finance and adjacent services.</li><li>Treat Australia as both a revenue market and a credibility market for global investors and enterprise partners.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li>Enter Australia only after proving the core model in multiple regional markets.</li><li>Use a household-name local partner to compress trust-building time.</li><li>Build a merchant network first, then monetise with finance and adjacent services.</li><li>Treat Australia as both a revenue market and a credibility market for global investors and enterprise partners.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Westpac dives into online shopping with ShopBack deal', 'https://www.westpac.com.au/news/making-news/2022/12/westpac-dives-into-online-shopping-with-shopback-deal/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Westpac media release: Shoppers to reap rewards from ShopBack partnership', 'https://www.westpac.com.au/about-westpac/media/media-releases/2022/8-december/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ShopBack corporate press page', 'https://corporate.shopback.com/press/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, '65 Equity Partners on ShopBack''s US$30m Westpac investment', 'https://www.65equitypartners.com/rewards-platform-shopback-bags-30m-from-westpac-to-close-series-f/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 2/5: Secretlab (secretlab-anz-market-entry)
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
    'secretlab-anz-market-entry', 'How Secretlab Entered the ANZ Market', 'Premium gaming chair brand from Singapore that used direct-to-consumer international shipping and global brand-building to enter Australia early, without the usual distributor-first playbook.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Premium gaming chair brand from Singapore that used direct-to-consumer international shipping and global brand-building to enter Australia early, without the usual distributor-first playbook.', 'Secretlab is one of the clearest examples of a Singapore company entering Australia with a brand-led, e-commerce-first model rather than through local distributors.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "Consumer Hardware / Gaming"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Secretlab', 'Singapore', 'Australia & New Zealand',
      '2016-01-01', 'Consumer Hardware / Gaming', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Ian Ang', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alaric Choo', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Secretlab is one of the clearest examples of a Singapore company entering Australia with a brand-led, e-commerce-first model rather than through local distributors. For MES, it is useful because it shows that premium price points can work in Australia when product quality, community positioning, and global social proof are strong enough.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Secretlab is one of the clearest examples of a Singapore company entering Australia with a brand-led, e-commerce-first model rather than through local distributors. For MES, it is useful because it shows that premium price points can work in Australia when product quality, community positioning, and global social proof are strong enough.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>Secretlab was founded by Ian Ang and Alaric Choo after their own dissatisfaction with existing gaming chairs and launched its first products in 2015.</li><li>The company''s own timeline states it went to Australia in June 2016 with the OMEGA Stealth, making ANZ one of its early international markets.</li><li>Rather than build out physical retail stores, Secretlab expanded through its own online storefront, global shipping, community marketing, esports credibility, and premium ergonomics positioning.</li><li>The company kept strengthening brand status globally through licensed collaborations, creator ecosystems, and premium product lines, which supported continued demand in Australia.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>Secretlab was founded by Ian Ang and Alaric Choo after their own dissatisfaction with existing gaming chairs and launched its first products in 2015.</li><li>The company''s own timeline states it went to Australia in June 2016 with the OMEGA Stealth, making ANZ one of its early international markets.</li><li>Rather than build out physical retail stores, Secretlab expanded through its own online storefront, global shipping, community marketing, esports credibility, and premium ergonomics positioning.</li><li>The company kept strengthening brand status globally through licensed collaborations, creator ecosystems, and premium product lines, which supported continued demand in Australia.</li></ol>', 2, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Early ANZ entry</strong> — Australia appeared in Secretlab''s official historical timeline as an expansion market in 2016.</li><li><strong>Model</strong> — Direct-to-consumer rollout reduced distributor dependence and preserved brand control.</li><li><strong>Brand scale</strong> — Australia became part of a much broader global market footprint across many countries.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Early ANZ entry</strong> — Australia appeared in Secretlab''s official historical timeline as an expansion market in 2016.</li><li><strong>Model</strong> — Direct-to-consumer rollout reduced distributor dependence and preserved brand control.</li><li><strong>Brand scale</strong> — Australia became part of a much broader global market footprint across many countries.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, Secretlab''s playbook offers a clear template. The lessons below distil Secretlab''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, Secretlab''s playbook offers a clear template. The lessons below distil Secretlab''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li>Use Australia as an early test of whether a premium consumer brand can travel beyond Southeast Asia.</li><li>Lead with strong product differentiation, not discounting.</li><li>Control the online storefront and customer experience where possible.</li><li>Turn global fandom, creator ecosystems, and community validation into local trust.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Secretlab Australia About Us timeline', 'https://secretlabchairs.com.au/pages/about-us', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Secretlab regions page', 'https://secretlabchairs.com.au/pages/regions', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Secretlab official site', 'https://secretlab.co', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 3/5: ComfortDelGro (comfortdelgro-anz-market-entry)
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
    'comfortdelgro-anz-market-entry', 'How ComfortDelGro Entered the ANZ Market', 'Singapore transport giant whose Australia strategy was built through successive acquisitions, culminating in the A2B Australia deal that created the country''s largest combined taxi network.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Singapore transport giant whose Australia strategy was built through successive acquisitions, culminating in the A2B Australia deal that created the country''s largest combined taxi network.', 'ComfortDelGro is a top-tier MES acquisition case because it shows how a Singapore incumbent can build real Australian scale over time through multiple targeted purchases instead of one headline launch.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "Mobility & Transport"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'ComfortDelGro', 'Singapore', 'Australia & New Zealand',
      '2005-01-01', 'Mobility & Transport', NULL, NULL, NULL
    );
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
    UPDATE content_bodies SET body_text = '<p>ComfortDelGro is a top-tier MES acquisition case because it shows how a Singapore incumbent can build real Australian scale over time through multiple targeted purchases instead of one headline launch. It also illustrates how Australia can be approached as a fragmented operating market where scale is created through local asset consolidation.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>ComfortDelGro is a top-tier MES acquisition case because it shows how a Singapore incumbent can build real Australian scale over time through multiple targeted purchases instead of one headline launch. It also illustrates how Australia can be approached as a fragmented operating market where scale is created through local asset consolidation.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>ComfortDelGro entered Australia through transport operations years ago and steadily expanded in bus and point-to-point mobility.</li><li>It strengthened its position through a string of bus operator acquisitions, including Forest Coach Lines, Buslink, and B&E Blanch.</li><li>In December 2023, it announced a deal to acquire A2B Australia, owner of brands including 13cabs, Silver Service, and Cabcharge.</li><li>By April 2024, ComfortDelGro Australia said the deal had completed and that the combined network would total around 9,000 taxis, creating the largest combined taxi network in Australia.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>ComfortDelGro entered Australia through transport operations years ago and steadily expanded in bus and point-to-point mobility.</li><li>It strengthened its position through a string of bus operator acquisitions, including Forest Coach Lines, Buslink, and B&E Blanch.</li><li>In December 2023, it announced a deal to acquire A2B Australia, owner of brands including 13cabs, Silver Service, and Cabcharge.</li><li>By April 2024, ComfortDelGro Australia said the deal had completed and that the combined network would total around 9,000 taxis, creating the largest combined taxi network in Australia.</li></ol>', 2, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Scale</strong> — A2B added an 8,000-vehicle network into the group''s broader Australian mobility platform.</li><li><strong>Positioning</strong> — The combined operation was described by ComfortDelGro as the largest combined taxi network in Australia.</li><li><strong>Strategy</strong> — The company explicitly framed the transaction as part of a multi-modal scaling strategy in Australia.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Scale</strong> — A2B added an 8,000-vehicle network into the group''s broader Australian mobility platform.</li><li><strong>Positioning</strong> — The combined operation was described by ComfortDelGro as the largest combined taxi network in Australia.</li><li><strong>Strategy</strong> — The company explicitly framed the transaction as part of a multi-modal scaling strategy in Australia.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, ComfortDelGro''s playbook offers a clear template. The lessons below distil ComfortDelGro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, ComfortDelGro''s playbook offers a clear template. The lessons below distil ComfortDelGro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li>Do not assume ANZ entry has to be greenfield; buying local assets can be faster and safer.</li><li>Use each acquisition to widen capability, not just market share.</li><li>Build a platform thesis first, then sequence acquisitions against that thesis.</li><li>Communicate the strategic logic clearly to investors, regulators, and local operators.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ComfortDelGro: A2B Australia shareholders approve acquisition proposal', 'https://www.comfortdelgro.com/news/a2b-australia-shareholders-approve-comfortdelgros-acquisition-proposal/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ComfortDelGro Australia completes A2B Australia acquisition', 'https://www.comfortdelgro.com/wp-content/uploads/2024/04/Media-Release-ComfortDelGro-Australia-completes-A2B-Australia-Acquisition.pdf', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Straits Times on ComfortDelGro''s A2B transaction', 'https://www.straitstimes.com/business/companies-markets/comfortdelgro-to-fully-acquire-taxi-network-operator-a2b-australia-for-1', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 4/5: Nium (nium-anz-market-entry)
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
    'nium-anz-market-entry', 'How Nium Entered the ANZ Market', 'Singapore B2B payments infrastructure company that expanded into Australia first and then deepened its Oceania footprint through New Zealand registration and real-time payout capabilities.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Singapore B2B payments infrastructure company that expanded into Australia first and then deepened its Oceania footprint through New Zealand registration and real-time payout capabilities.', 'Nium is relevant to MES because it demonstrates a classic infrastructure expansion model: build relevance with Australian business customers first, then use licensing and network depth to broaden the regional moat.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech Infrastructure"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Nium', 'Singapore', 'Australia & New Zealand',
      '2018-01-01', 'Fintech Infrastructure', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Prajit Nanu', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Michael Bermingham', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Nium is relevant to MES because it demonstrates a classic infrastructure expansion model: build relevance with Australian business customers first, then use licensing and network depth to broaden the regional moat. It is particularly useful for companies in embedded finance, B2B SaaS, cross-border payments, and regulated fintech.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Nium is relevant to MES because it demonstrates a classic infrastructure expansion model: build relevance with Australian business customers first, then use licensing and network depth to broaden the regional moat. It is particularly useful for companies in embedded finance, B2B SaaS, cross-border payments, and regulated fintech.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>Nium originated as Instarem in Singapore and evolved from consumer remittance into broader B2B payments infrastructure.</li><li>The company built an established Oceania footprint, including Australia, before announcing that two of the three largest spend-management platforms in Australia were using its network.</li><li>In April 2024, Nium announced registration as a Financial Service Provider in New Zealand, describing it as a first step toward offering a wider service stack locally.</li><li>In 2025, Nium expanded real-time payouts into Australia through the New Payments Platform, reinforcing the practical value of its ANZ network.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>Nium originated as Instarem in Singapore and evolved from consumer remittance into broader B2B payments infrastructure.</li><li>The company built an established Oceania footprint, including Australia, before announcing that two of the three largest spend-management platforms in Australia were using its network.</li><li>In April 2024, Nium announced registration as a Financial Service Provider in New Zealand, describing it as a first step toward offering a wider service stack locally.</li><li>In 2025, Nium expanded real-time payouts into Australia through the New Payments Platform, reinforcing the practical value of its ANZ network.</li></ol>', 2, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Regulatory progression</strong> — Nium secured New Zealand FSPR registration in 2024.</li><li><strong>Customer traction</strong> — Nium said leading Australian spend platforms already used its network.</li><li><strong>Capability depth</strong> — Real-time Australia payouts via NPP strengthened the local product proposition.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Regulatory progression</strong> — Nium secured New Zealand FSPR registration in 2024.</li><li><strong>Customer traction</strong> — Nium said leading Australian spend platforms already used its network.</li><li><strong>Capability depth</strong> — Real-time Australia payouts via NPP strengthened the local product proposition.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, Nium''s playbook offers a clear template. The lessons below distil Nium''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, Nium''s playbook offers a clear template. The lessons below distil Nium''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li>Enter with one clear problem first, then widen the regulated product stack later.</li><li>Use Australia as the revenue engine and New Zealand as a second regulated foothold.</li><li>Translate network scale into a trust signal for enterprise buyers.</li><li>Make regulatory milestones part of the growth narrative, not a back-office detail.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Nium approved as a registered financial service provider in New Zealand', 'https://www.nium.com/newsroom/nium-registered-financial-service-provider-in-new-zealand', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'PR Newswire version of Nium NZ registration', 'https://www.prnewswire.com/news-releases/nium-approved-as-a-registered-financial-service-provider-in-new-zealand-302117055.html', 2, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IBS Intelligence coverage of Nium NZ registration', 'https://ibsintelligence.com/ibsi-news/nium-approved-as-a-registered-financial-service-provider-in-new-zealand/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 5/5: PropertyGuru (propertyguru-anz-market-entry)
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
    'propertyguru-anz-market-entry', 'How PropertyGuru Entered the ANZ Market', 'A more nuanced MES case: not a classic full Australia market entry, but a strong Singapore company whose strategic relationship with Australia''s REA Group created a meaningful ANZ-linked expansion and ownership story.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['A more nuanced MES case: not a classic full Australia market entry, but a strong Singapore company whose strategic relationship with Australia''s REA Group created a meaningful ANZ-linked expansion and ownership story.', 'PropertyGuru is not a pure Singapore-to-Australia operating rollout case, so it should be tagged carefully in MES.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Singapore"}, {"icon": "Briefcase", "label": "Sector", "value": "PropTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'PropertyGuru', 'Singapore', 'Australia & New Zealand',
      '2021-01-01', 'PropTech', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Steve Melhuish', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Jani Rautiainen', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>PropertyGuru is not a pure Singapore-to-Australia operating rollout case, so it should be tagged carefully in MES. Its value lies in showing how an Australian strategic shareholder, REA Group, can become part of a Singapore company''s scaling and capital-market story through asset combinations and ownership ties.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>PropertyGuru is not a pure Singapore-to-Australia operating rollout case, so it should be tagged carefully in MES. Its value lies in showing how an Australian strategic shareholder, REA Group, can become part of a Singapore company''s scaling and capital-market story through asset combinations and ownership ties.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ol><li>PropertyGuru grew into a leading Southeast Asian proptech platform from Singapore.</li><li>In 2021, it completed the acquisition of REA Group''s Southeast Asian assets in exchange for REA taking an 18 percent stake, creating a meaningful Australian ownership link.</li><li>That relationship made PropertyGuru relevant to ANZ audiences even though the company itself remained primarily Southeast Asia-focused.</li><li>The company was later taken private in a deal that led REA to divest its stake, closing an important chapter in the Singapore-Australia strategic relationship.</li></ol>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ol><li>PropertyGuru grew into a leading Southeast Asian proptech platform from Singapore.</li><li>In 2021, it completed the acquisition of REA Group''s Southeast Asian assets in exchange for REA taking an 18 percent stake, creating a meaningful Australian ownership link.</li><li>That relationship made PropertyGuru relevant to ANZ audiences even though the company itself remained primarily Southeast Asia-focused.</li><li>The company was later taken private in a deal that led REA to divest its stake, closing an important chapter in the Singapore-Australia strategic relationship.</li></ol>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><em>MES note: this should be labelled as a <strong>strategic ANZ linkage case</strong> rather than a straightforward market-entry case, unless additional evidence of direct Australian operating expansion is added later.</em></p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><em>MES note: this should be labelled as a <strong>strategic ANZ linkage case</strong> rather than a straightforward market-entry case, unless additional evidence of direct Australian operating expansion is added later.</em></p>', 3, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use strategic ownership as an alternative to operating expansion</strong> — REA Group''s 18% PropertyGuru stake gave both sides ANZ-Southeast Asia exposure without either company building greenfield operations in the other''s market.</li><li><strong>Sequence regional M&amp;A around capital-market milestones</strong> — The 2021 iProperty acquisition was timed to PropertyGuru''s pre-IPO scale-up, which combined two regional businesses into a single ASX-adjacent narrative.</li><li><strong>Read divestments as strategic transitions, not failures</strong> — REA Group''s 2024 stake divestment came alongside PropertyGuru being taken private, completing a cleanly bookended four-year strategic relationship.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Use strategic ownership as an alternative to operating expansion</strong> — REA Group''s 18% PropertyGuru stake gave both sides ANZ-Southeast Asia exposure without either company building greenfield operations in the other''s market.</li><li><strong>Sequence regional M&amp;A around capital-market milestones</strong> — The 2021 iProperty acquisition was timed to PropertyGuru''s pre-IPO scale-up, which combined two regional businesses into a single ASX-adjacent narrative.</li><li><strong>Read divestments as strategic transitions, not failures</strong> — REA Group''s 2024 stake divestment came alongside PropertyGuru being taken private, completing a cleanly bookended four-year strategic relationship.</li></ul>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>This case is treated as a <strong>strategic-link</strong> MES entry rather than a classic operating rollout. Key facts:</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>This case is treated as a <strong>strategic-link</strong> MES entry rather than a classic operating rollout. Key facts:</p>', 1, 'case_study');
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>For Singapore operators considering ANZ entry, PropertyGuru''s playbook offers a clear template. The lessons below distil PropertyGuru''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Singapore operators considering ANZ entry, PropertyGuru''s playbook offers a clear template. The lessons below distil PropertyGuru''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Asset swap can be the entry mechanism</strong> — PropertyGuru gained iProperty Malaysia and Thailand; REA Group gained an 18% stake — neither company opened greenfield operations to access the other''s region.</li><li><strong>Strategic shareholder access is itself an ANZ market signal</strong> — REA''s board seat and equity made PropertyGuru visible to ANZ institutional investors and proptech press long before any operating expansion.</li><li><strong>Plan the unwind as carefully as the entry</strong> — When PropertyGuru went private, REA divested cleanly. Have a clear thesis for what the strategic link is meant to achieve before you sign.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Asset swap can be the entry mechanism</strong> — PropertyGuru gained iProperty Malaysia and Thailand; REA Group gained an 18% stake — neither company opened greenfield operations to access the other''s region.</li><li><strong>Strategic shareholder access is itself an ANZ market signal</strong> — REA''s board seat and equity made PropertyGuru visible to ANZ institutional investors and proptech press long before any operating expansion.</li><li><strong>Plan the unwind as carefully as the entry</strong> — When PropertyGuru went private, REA divested cleanly. Have a clear thesis for what the strategic link is meant to achieve before you sign.</li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'PropertyGuru completes iProperty / REA deal', 'https://www.onlinemarketplaces.com/articles/propertyguru-completes-iproperty-deal/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'REA Group to divest its stake in PropertyGuru', 'https://announcements.asx.com.au/asxpdf/20240816/pdf/066psw9tn13xtw.pdf', 2, 'sec_filing')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'REA Group background page for transaction chronology cross-check', 'https://en.wikipedia.org/wiki/REA_Group', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
