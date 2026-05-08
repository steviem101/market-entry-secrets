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
