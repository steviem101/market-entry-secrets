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
    'pizza-hut-australia-franchise-class-action', 'How Pizza Hut Australia Faced a Franchisee Class Action', 'Pizza Hut Australia is operated under franchise from Yum! Restaurants Australia Pty Ltd — the local subsidiary of US-based Yum! Restaurants International — which became the defendant in a 190-franchisee class action over a value-pricing strategy that triggered 32 franchisee insolvencies.',
    'e836d932-ac9d-4333-a1bf-9c05faa12340'::uuid, 'case_study', 'published', false,
    3, ARRAY['Pizza Hut Australia is operated under franchise from Yum!', 'Justice Wigney dismissed the franchisee class action in February 2016.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "QSR / Food"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Pizza Hut Australia (Yum! Restaurants)', 'https://img.logo.dev/pizzahut.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://pizzahut.com.au', 'United States', 'Australia',
      '2014-01-01', 'QSR / Food', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://pizzahut.com.au'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/pizzahut.com.au?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>Pizza Hut Australia is operated under franchise from Yum! Restaurants Australia Pty Ltd, the local subsidiary of US-based Yum! Brands. In 2014 Yum responded to Domino''s Australian price aggression by mandating a A$4.95 price floor for one tier of pizzas and A$8.50 for another — prices that 190 Pizza Hut franchisees said were below their own cost of production. The franchisees brought a class action in 2014 alleging unconscionable conduct and breach of duties. The Federal Court dismissed the claim in 2016 and the Full Federal Court dismissed the franchisee appeal — but 32 franchisee businesses had already collapsed, and the case is now the leading Australian authority on whether a master franchisor can lawfully dictate pricing that destroys franchisee profitability.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Pizza Hut Australia is operated under franchise from Yum! Restaurants Australia Pty Ltd, the local subsidiary of US-based Yum! Brands. In 2014 Yum responded to Domino''s Australian price aggression by mandating a A$4.95 price floor for one tier of pizzas and A$8.50 for another — prices that 190 Pizza Hut franchisees said were below their own cost of production. The franchisees brought a class action in 2014 alleging unconscionable conduct and breach of duties. The Federal Court dismissed the claim in 2016 and the Full Federal Court dismissed the franchisee appeal — but 32 franchisee businesses had already collapsed, and the case is now the leading Australian authority on whether a master franchisor can lawfully dictate pricing that destroys franchisee profitability.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Pizza Hut entered Australia decades ago and operates almost entirely through Australian-based franchisees buying area licences from Yum! Restaurants Australia. The "Value Strategy" was a unilateral pricing policy imposed by the franchisor in 2014 — not a market entry move per se, but a policy decision that operated as a forced re-entry into the value tier of the Australian QSR market against Domino''s.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Pizza Hut entered Australia decades ago and operates almost entirely through Australian-based franchisees buying area licences from Yum! Restaurants Australia. The "Value Strategy" was a unilateral pricing policy imposed by the franchisor in 2014 — not a market entry move per se, but a policy decision that operated as a forced re-entry into the value tier of the Australian QSR market against Domino''s.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>"Value Strategy" mandated below-cost pricing:</strong> Yum! Restaurants Australia reduced pizza prices from A$9.95 to A$4.95 for one tier and from A$11.95 to A$8.50 for another, simultaneously cutting the range from four pizza tiers to two. Franchisees argued (and presented evidence) that A$4.95 was below their fully loaded cost of production, particularly in regional locations.</li><li><strong>Domino''s was the structural cause:</strong> Domino''s Australian arm had launched aggressive value pricing first, and Yum''s response was reactive. The franchisee economics that had sustained Pizza Hut at A$9.95 simply could not sustain A$4.95.</li><li><strong>Franchisor power to set price was absolute under the franchise agreement:</strong> The class action alleged Yum had implied duties of good faith and an obligation to set profitable prices. The Federal Court (Diab v Yum! Restaurants Australia) rejected both arguments — the franchise agreement gave Yum the express right to set prices, and the implied duty did not override that express term.</li><li><strong>32 franchisee insolvencies:</strong> During the period of the Value Strategy, 32 Pizza Hut franchisees lost their businesses. The class action funder was, in some cases, the liquidator of those franchise companies — a sign of how deep the franchisee distress went.</li><li><strong>The franchisor was profitable while the franchisees collapsed:</strong> Because Yum collected fees on gross store revenue regardless of franchisee profitability, the value strategy was rational for Yum and lethal for franchisees — the textbook misalignment that the class action sought (and failed) to redress.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>"Value Strategy" mandated below-cost pricing:</strong> Yum! Restaurants Australia reduced pizza prices from A$9.95 to A$4.95 for one tier and from A$11.95 to A$8.50 for another, simultaneously cutting the range from four pizza tiers to two. Franchisees argued (and presented evidence) that A$4.95 was below their fully loaded cost of production, particularly in regional locations.</li><li><strong>Domino''s was the structural cause:</strong> Domino''s Australian arm had launched aggressive value pricing first, and Yum''s response was reactive. The franchisee economics that had sustained Pizza Hut at A$9.95 simply could not sustain A$4.95.</li><li><strong>Franchisor power to set price was absolute under the franchise agreement:</strong> The class action alleged Yum had implied duties of good faith and an obligation to set profitable prices. The Federal Court (Diab v Yum! Restaurants Australia) rejected both arguments — the franchise agreement gave Yum the express right to set prices, and the implied duty did not override that express term.</li><li><strong>32 franchisee insolvencies:</strong> During the period of the Value Strategy, 32 Pizza Hut franchisees lost their businesses. The class action funder was, in some cases, the liquidator of those franchise companies — a sign of how deep the franchisee distress went.</li><li><strong>The franchisor was profitable while the franchisees collapsed:</strong> Because Yum collected fees on gross store revenue regardless of franchisee profitability, the value strategy was rational for Yum and lethal for franchisees — the textbook misalignment that the class action sought (and failed) to redress.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Justice Wigney dismissed the franchisee class action in February 2016. The franchisees appealed; the Full Federal Court dismissed the appeal in 2017. The case is now widely cited in Australian franchising literature as the leading authority that a franchisor can require franchisees to sell at unprofitable prices, provided the franchise agreement contains an express price-setting clause and the franchisor does not act dishonestly or in bad faith. The case directly informed the 2019 Australian Government Inquiry into Franchising and the resulting reforms to the Franchising Code.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Justice Wigney dismissed the franchisee class action in February 2016. The franchisees appealed; the Full Federal Court dismissed the appeal in 2017. The case is now widely cited in Australian franchising literature as the leading authority that a franchisor can require franchisees to sell at unprofitable prices, provided the franchise agreement contains an express price-setting clause and the franchisor does not act dishonestly or in bad faith. The case directly informed the 2019 Australian Government Inquiry into Franchising and the resulting reforms to the Franchising Code.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Pizza Hut Australia (Yum! Restaurants)''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Pizza Hut Australia (Yum! Restaurants)''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Master-franchise pricing power can override unit economics.</strong> If your Australian entry strategy depends on franchising, the franchise agreement''s pricing-control clause is the single most important paragraph — read it as if you were the franchisee.</li><li><strong>Domino''s-style value-tier pricing is contagious.</strong> A QSR entrant launching at premium prices in Australia must model the scenario where a competitor forces a A$4.95 floor and you have to follow.</li><li><strong>Implied duties of good faith do not protect franchisees from express terms.</strong> Australian courts will not rewrite a clear franchise agreement on equitable grounds; the protection has to be drafted into the contract.</li><li><strong>The 2019 Franchising Code reforms are a regulatory tailwind for franchisor scrutiny.</strong> Future cases of this type will be litigated against a more prescriptive disclosure regime, but the underlying contract law remains.</li><li><strong>Channel structure is a strategic decision with multi-decade consequences.</strong> A franchisee network built on thin margins is a fragile operating asset that can fracture during any pricing-led strategic response.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Master-franchise pricing power can override unit economics.</strong> If your Australian entry strategy depends on franchising, the franchise agreement''s pricing-control clause is the single most important paragraph — read it as if you were the franchisee.</li><li><strong>Domino''s-style value-tier pricing is contagious.</strong> A QSR entrant launching at premium prices in Australia must model the scenario where a competitor forces a A$4.95 floor and you have to follow.</li><li><strong>Implied duties of good faith do not protect franchisees from express terms.</strong> Australian courts will not rewrite a clear franchise agreement on equitable grounds; the protection has to be drafted into the contract.</li><li><strong>The 2019 Franchising Code reforms are a regulatory tailwind for franchisor scrutiny.</strong> Future cases of this type will be litigated against a more prescriptive disclosure regime, but the underlying contract law remains.</li><li><strong>Channel structure is a strategic decision with multi-decade consequences.</strong> A franchisee network built on thin margins is a fragile operating asset that can fracture during any pricing-led strategic response.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Full Federal Court appeal judgment (FCAFC 190, 2017)', 'https://static1.squarespace.com/static/538e6312e4b03cefc2a8a0c3/t/60581b61ebd7307ae712c03c/1616386915854/2017_FCAFC_190.pdf', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LegalVision (franchisor pricing win)', 'https://legalvision.com.au/you-wanna-piece-of-me-pizza-hut-franchisors-pricing-win/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'QSR Media (court delivers good news)', 'https://qsrmedia.com.au/legal/commentary/federal-court-delivers-pizza-hut-good-news', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Allens (Yum sale of Pizza Hut Australia assets, 2016)', 'https://www.allens.com.au/insights-news/news/2016/09/allens-advises-yum-on-pizza-hut-sale-in-australia/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'SmartCompany (filing)', 'https://www.smartcompany.com.au/business-advice/it-s-a-financial-nightmare-pizza-hut-franchisees-launch-class-action-over-price-war-with-domino-s/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
