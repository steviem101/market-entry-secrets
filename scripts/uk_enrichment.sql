-- Case 1/20: Revolut
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'revolut-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug revolut-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'Three staff, a travel card, and a plan to own Australian finance',
    tldr = ARRAY['Three staff, a travel card, and a plan to own Australian finance', 'Australia ticked every box for a digital challenger bank''s international debut: English-speaking, high smartphone penetration, a large population of international travellers and expats, a notoriously expensive big-four banking oligopoly, and a regulatory environment made recently more accessible to non-banks.', 'Revolut was founded in London in 2015 by Nikolay Storonsky and Vlad Yatsenko — a former Credit Suisse trader and a Deutsche Bank software engineer frustrated by the cost of international money transfers.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 3,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Nikolay Storonsky', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Vlad Yatsenko', 'Co-founder & CTO', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Revolut was founded in London in 2015 by Nikolay Storonsky and Vlad Yatsenko — a former Credit Suisse trader and a Deutsche Bank software engineer frustrated by the cost of international money transfers. Their first product was a prepaid Visa card with interbank exchange rates and a spending-tracking app. Within three years Revolut had become the fastest-growing fintech in Europe, raising $340M in a Series C from DST Global, and in 2019 selected Australia as its first non-European expansion.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Revolut was founded in London in 2015 by Nikolay Storonsky and Vlad Yatsenko — a former Credit Suisse trader and a Deutsche Bank software engineer frustrated by the cost of international money transfers. Their first product was a prepaid Visa card with interbank exchange rates and a spending-tracking app. Within three years Revolut had become the fastest-growing fintech in Europe, raising $340M in a Series C from DST Global, and in 2019 selected Australia as its first non-European expansion.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia ticked every box for a digital challenger bank''s international debut: English-speaking, high smartphone penetration, a large population of international travellers and expats, a notoriously expensive big-four banking oligopoly, and a regulatory environment made recently more accessible to non-banks. Invest Victoria — the state government''s business attraction agency — made early contact with Revolut''s leadership and offered practical support that significantly reduced entry cost and complexity.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia ticked every box for a digital challenger bank''s international debut: English-speaking, high smartphone penetration, a large population of international travellers and expats, a notoriously expensive big-four banking oligopoly, and a regulatory environment made recently more accessible to non-banks. Invest Victoria — the state government''s business attraction agency — made early contact with Revolut''s leadership and offered practical support that significantly reduced entry cost and complexity.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019 – The Quiet Start:</strong> Revolut established its Australian headquarters in Melbourne in mid-2019 with a small founding team. Invest Victoria helped with business case development, introductions to potential business partners and service providers, ministerial meetings, and access to Intersekt — Australia''s largest fintech festival.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019 – The Quiet Start:</strong> Revolut established its Australian headquarters in Melbourne in mid-2019 with a small founding team. Invest Victoria helped with business case development, introductions to potential business partners and service providers, ministerial meetings, and access to Intersekt — Australia''s largest fintech festival.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>May–August 2020 – Regulatory Foundation:</strong> Revolut received its AFSL in May 2020, authorised by ASIC, and launched publicly in August 2020 with three employees. The AFSL application was accelerated through early ASIC engagement guided by Invest Victoria''s introductions.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>May–August 2020 – Regulatory Foundation:</strong> Revolut received its AFSL in May 2020, authorised by ASIC, and launched publicly in August 2020 with three employees. The AFSL application was accelerated through early ASIC engagement guided by Invest Victoria''s introductions.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2022 – Building the Product Suite:</strong> Starting with a digital travel card and FX offering, Revolut systematically added cryptocurrency, commission-free stock trading, commodities, customer rewards, and donation funds. It became the first financial institution in Australia to launch eSIMs.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2022 – Building the Product Suite:</strong> Starting with a digital travel card and FX offering, Revolut systematically added cryptocurrency, commission-free stock trading, commodities, customer rewards, and donation funds. It became the first financial institution in Australia to launch eSIMs.</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2025–2026 – Market Leader Ambitions:</strong> In 2025, Revolut launched RevPoints — Australia''s first loyalty programme embedded in a challenger financial app. In early 2026, Revolut Business launched what it described as Australia''s first "360° in-person, account-to-account and online merchant acquiring platform."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2025–2026 – Market Leader Ambitions:</strong> In 2025, Revolut launched RevPoints — Australia''s first loyalty programme embedded in a challenger financial app. In early 2026, Revolut Business launched what it described as Australia''s first "360° in-person, account-to-account and online merchant acquiring platform."</p>', 6, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use government support actively</strong> — Contact Invest Victoria or your state''s equivalent before you arrive <em>(Engaged Invest Victoria for regulatory introductions and ministerial access)</em></li><li><strong>Start with a single wedge product</strong> — Launch your simplest, most universally useful product first <em>(Travel card and FX — not a full bank)</em></li><li><strong>Regulatory first, product second</strong> — Don''t soft-launch without your core licence in hand <em>(AFSL before public launch)</em></li><li><strong>Layer products to deepen engagement</strong> — Map your second and third product additions before you launch the first <em>(Travel card → Crypto → Stocks → Lending → Merchant acquiring)</em></li><li><strong>Pick the right city for substantive reasons</strong> — Research what each city actually offers your specific business model <em>(Melbourne for talent, government, fintech ecosystem)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Use government support actively</strong> — Contact Invest Victoria or your state''s equivalent before you arrive <em>(Engaged Invest Victoria for regulatory introductions and ministerial access)</em></li><li><strong>Start with a single wedge product</strong> — Launch your simplest, most universally useful product first <em>(Travel card and FX — not a full bank)</em></li><li><strong>Regulatory first, product second</strong> — Don''t soft-launch without your core licence in hand <em>(AFSL before public launch)</em></li><li><strong>Layer products to deepen engagement</strong> — Map your second and third product additions before you launch the first <em>(Travel card → Crypto → Stocks → Lending → Merchant acquiring)</em></li><li><strong>Pick the right city for substantive reasons</strong> — Research what each city actually offers your specific business model <em>(Melbourne for talent, government, fintech ecosystem)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Customers</strong>: 1 million Australian retail customers (February 2026)</li><li><strong>Headcount</strong>: 100+ Australian staff (vs. 3 at launch)</li><li><strong>FX Savings</strong>: AUD $250 million saved for Australian customers since 2020</li><li><strong>Transaction Growth</strong>: 74% YoY between 2023 and 2024</li><li><strong>Investment Commitment</strong>: AUD $400 million over next five years</li><li><strong>Products Shipped</strong>: 30+ products delivered to Australian market</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Customers</strong>: 1 million Australian retail customers (February 2026)</li><li><strong>Headcount</strong>: 100+ Australian staff (vs. 3 at launch)</li><li><strong>FX Savings</strong>: AUD $250 million saved for Australian customers since 2020</li><li><strong>Transaction Growth</strong>: 74% YoY between 2023 and 2024</li><li><strong>Investment Commitment</strong>: AUD $400 million over next five years</li><li><strong>Products Shipped</strong>: 30+ products delivered to Australian market</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Revolut''s playbook offers a clear template. The lessons below are drawn from Revolut''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Revolut''s playbook offers a clear template. The lessons below are drawn from Revolut''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use government support actively</strong> — Contact Invest Victoria or your state''s equivalent before you arrive <em>(Engaged Invest Victoria for regulatory introductions and ministerial access)</em></li><li><strong>Start with a single wedge product</strong> — Launch your simplest, most universally useful product first <em>(Travel card and FX — not a full bank)</em></li><li><strong>Regulatory first, product second</strong> — Don''t soft-launch without your core licence in hand <em>(AFSL before public launch)</em></li><li><strong>Layer products to deepen engagement</strong> — Map your second and third product additions before you launch the first <em>(Travel card → Crypto → Stocks → Lending → Merchant acquiring)</em></li><li><strong>Pick the right city for substantive reasons</strong> — Research what each city actually offers your specific business model <em>(Melbourne for talent, government, fintech ecosystem)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Use government support actively</strong> — Contact Invest Victoria or your state''s equivalent before you arrive <em>(Engaged Invest Victoria for regulatory introductions and ministerial access)</em></li><li><strong>Start with a single wedge product</strong> — Launch your simplest, most universally useful product first <em>(Travel card and FX — not a full bank)</em></li><li><strong>Regulatory first, product second</strong> — Don''t soft-launch without your core licence in hand <em>(AFSL before public launch)</em></li><li><strong>Layer products to deepen engagement</strong> — Map your second and third product additions before you launch the first <em>(Travel card → Crypto → Stocks → Lending → Merchant acquiring)</em></li><li><strong>Pick the right city for substantive reasons</strong> — Research what each city actually offers your specific business model <em>(Melbourne for talent, government, fintech ecosystem)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut Australia - Submission in response to: Licensing of payment platforms', 'https://treasury.gov.au/sites/default/files/2023-12/c2023-403207-revolutaustralia.pdf', 1, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Global fintech giant finds a new gear in Victoria (Invest Victoria)', 'https://www.invest.vic.gov.au/news-and-events/news/2020/august/global-fintech-giant-finds-a-new-gear-in-victoria', 2, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut hits 1m Aussie users, plans AUD $400m push (CFOtech)', 'https://cfotech.com.au/story/revolut-hits-1m-aussie-users-plans-aud-400m-push', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut Australia - Screen scraping (Treasury)', 'https://treasury.gov.au/sites/default/files/2024-04/c2023-436961-revolut-australia.pdf', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut Expands in Australia to 1 Million Customers (LinkedIn)', 'https://www.linkedin.com/posts/revolut_1-million-revolut-customers-now-in-australia-activity-7427000964706140162-dIJ8', 5, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 2/20: Wise
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'wise-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug wise-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The transparent FX challenger that turned one million Australians into global citizens',
    tldr = ARRAY['The transparent FX challenger that turned one million Australians into global citizens', 'Australia has one of the highest rates of international money movement globally: a large British-Australian diaspora, 900,000+ UK tourists annually, and big-four banks notorious for adding 2–3% FX mark-ups.', 'Wise was co-founded in London in 2011 by Kristo Käärmann and Taavet Hinrikus — two Estonian tech professionals in the UK who both faced expensive international money transfers.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 3,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Kristo Käärmann', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Taavet Hinrikus', 'Co-founder', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Wise was co-founded in London in 2011 by Kristo Käärmann and Taavet Hinrikus — two Estonian tech professionals in the UK who both faced expensive international money transfers. Their product matched people making transfers in opposite directions and swapped at the real mid-market exchange rate with a transparent fee shown upfront — something virtually no bank offered. Today Wise serves 16+ million customers globally and is listed on the London Stock Exchange.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Wise was co-founded in London in 2011 by Kristo Käärmann and Taavet Hinrikus — two Estonian tech professionals in the UK who both faced expensive international money transfers. Their product matched people making transfers in opposite directions and swapped at the real mid-market exchange rate with a transparent fee shown upfront — something virtually no bank offered. Today Wise serves 16+ million customers globally and is listed on the London Stock Exchange.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia has one of the highest rates of international money movement globally: a large British-Australian diaspora, 900,000+ UK tourists annually, and big-four banks notorious for adding 2–3% FX mark-ups. Wise''s transparent, low-fee model was structurally disruptive in this environment.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia has one of the highest rates of international money movement globally: a large British-Australian diaspora, 900,000+ UK tourists annually, and big-four banks notorious for adding 2–3% FX mark-ups. Wise''s transparent, low-fee model was structurally disruptive in this environment.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2016 – Australian Launch:</strong> Wise launched in Australia, initially targeting UK-Australia money transfer corridors. Regulatory compliance was built from the start — AUSTRAC registration as a remittance provider under the AML/CTF Act.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2016 – Australian Launch:</strong> Wise launched in Australia, initially targeting UK-Australia money transfer corridors. Regulatory compliance was built from the start — AUSTRAC registration as a remittance provider under the AML/CTF Act.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2021–2023 – Infrastructure Investment:</strong> Wise became the first fintech to connect directly to Australia''s New Payments Platform (NPP) — giving it real-time domestic clearing speed, not just international transfer capability.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2021–2023 – Infrastructure Investment:</strong> Wise became the first fintech to connect directly to Australia''s New Payments Platform (NPP) — giving it real-time domestic clearing speed, not just international transfer capability.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024 – 1 Million Customers and New AFSL:</strong> Wise surpassed 1 million active customers in Australia, holding A$1 billion+ in total balances. Household deposits doubled in a year, making Wise the fastest-growing financial entity in Australia by this measure. In September 2024, ASIC granted Wise an AFSL for Investments.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024 – 1 Million Customers and New AFSL:</strong> Wise surpassed 1 million active customers in Australia, holding A$1 billion+ in total balances. Household deposits doubled in a year, making Wise the fastest-growing financial entity in Australia by this measure. In September 2024, ASIC granted Wise an AFSL for Investments.</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2025 – Australia''s First Multi-Currency Investment Product:</strong> Wise launched Interest in Australia in April 2025 — the country''s first multi-currency investment product for both individuals and businesses. Beta customers invested A$30 million before official launch.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2025 – Australia''s First Multi-Currency Investment Product:</strong> Wise launched Interest in Australia in April 2025 — the country''s first multi-currency investment product for both individuals and businesses. Beta customers invested A$30 million before official launch.</p>', 6, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Active Customers</strong>: 1 million+ in Australia (2024)</li><li><strong>Balances Held</strong>: A$1 billion+ held on Wise by Australian customers</li><li><strong>Business Deposits</strong>: A$211 million, up 60% in one year</li><li><strong>Interest Beta</strong>: A$30 million invested before formal launch (2025)</li><li><strong>Infrastructure</strong>: First fintech to connect directly to NPP</li><li><strong>Regulatory</strong>: AUSTRAC registration + AFSL for Investments (2024)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Active Customers</strong>: 1 million+ in Australia (2024)</li><li><strong>Balances Held</strong>: A$1 billion+ held on Wise by Australian customers</li><li><strong>Business Deposits</strong>: A$211 million, up 60% in one year</li><li><strong>Interest Beta</strong>: A$30 million invested before formal launch (2025)</li><li><strong>Infrastructure</strong>: First fintech to connect directly to NPP</li><li><strong>Regulatory</strong>: AUSTRAC registration + AFSL for Investments (2024)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Wise''s playbook offers a clear template. The lessons below are drawn from Wise''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Wise''s playbook offers a clear template. The lessons below are drawn from Wise''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise unveils new look as it reaches 16 million customers (Wise newsroom)', 'https://newsroom.wise.com/en-CAS/223579-wise-unveils-new-look-as-it-reaches-16-million-customers-served-worldwide-and-continues-global-expansion/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Story of Wise', 'https://wise.com/au/about/our-story', 7, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise Granted AFSL for Investments & Surpasses One Million Active Customers', 'https://smbtech.au/news/wise-granted-afsl-for-investments-surpasses-one-million-active-customers/', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise hits the accelerator (Banking Day)', 'https://www.bankingday.com/wise-hits-the-accelerator', 9, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'A$30 Million Already Invested: Wise Launches Interest in Australia', 'https://newsroom.wise.com/en-CAS/249592-a-30-million-already-invested-wise-launches-interest-in-australia/', 10, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 3/20: Darktrace
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'darktrace-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug darktrace-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The Cambridge AI that made Australian cybersecurity self-learning',
    tldr = ARRAY['The Cambridge AI that made Australian cybersecurity self-learning', 'Australia faces high rates of cyber incidents — the government''s ASD Cyber Threat Report consistently lists Australian organisations among the most targeted globally.', 'Darktrace was founded in Cambridge in 2013 by mathematicians and former intelligence officers from GCHQ and MI5.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Darktrace was founded in Cambridge in 2013 by mathematicians and former intelligence officers from GCHQ and MI5. Its AI learns the normal "pattern of life" of every user, device, and connection in an organisation''s network, then autonomously detects and responds to anomalies in real time. The company listed on the London Stock Exchange in 2021 at £1.7 billion and was taken private by Thoma Bravo in 2024.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Darktrace was founded in Cambridge in 2013 by mathematicians and former intelligence officers from GCHQ and MI5. Its AI learns the normal "pattern of life" of every user, device, and connection in an organisation''s network, then autonomously detects and responds to anomalies in real time. The company listed on the London Stock Exchange in 2021 at £1.7 billion and was taken private by Thoma Bravo in 2024.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia faces high rates of cyber incidents — the government''s ASD Cyber Threat Report consistently lists Australian organisations among the most targeted globally. The English-language market, common legal system with the UK, and strong enterprise software spending made Australia a natural priority.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia faces high rates of cyber incidents — the government''s ASD Cyber Threat Report consistently lists Australian organisations among the most targeted globally. The English-language market, common legal system with the UK, and strong enterprise software spending made Australia a natural priority.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2018 – First Australian Footprint:</strong> Darktrace established a team in Sydney, targeting enterprise clients in financial services and government.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2018 – First Australian Footprint:</strong> Darktrace established a team in Sydney, targeting enterprise clients in financial services and government.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2021 – The 60% Growth Year:</strong> Darktrace''s Australian customer base grew by over 60% in 12 months, with headcount doubling across Sydney, Melbourne, and Perth. ANZ customers won in this period included Steadfast Group, WIN Corporation, Chemist Warehouse Australia, Girton Grammar School, Holman Webb Lawyers, and North Sydney Council.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2021 – The 60% Growth Year:</strong> Darktrace''s Australian customer base grew by over 60% in 12 months, with headcount doubling across Sydney, Melbourne, and Perth. ANZ customers won in this period included Steadfast Group, WIN Corporation, Chemist Warehouse Australia, Girton Grammar School, Holman Webb Lawyers, and North Sydney Council.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022–2023 – Deeper Enterprise:</strong> New wins included City Tattersalls Club, Victorian Aboriginal Child Care Agency, Grant Thornton Australia, and Lockyer Valley Regional Council. Strategic ANZ partnerships were formalised with Telstra and Tesserant.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022–2023 – Deeper Enterprise:</strong> New wins included City Tattersalls Club, Victorian Aboriginal Child Care Agency, Grant Thornton Australia, and Lockyer Valley Regional Council. Strategic ANZ partnerships were formalised with Telstra and Tesserant.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Customer Growth</strong>: 60%+ YoY in Australia (2020–2021)</li><li><strong>Headcount</strong>: Doubled across Sydney, Melbourne, Perth</li><li><strong>Cross-sector Clients</strong>: Insurance, TV, retail, legal, education, local government, professional services</li><li><strong>Strategic Partners</strong>: Telstra, Tesserant</li><li><strong>Global Valuation</strong>: £1.7 billion IPO (2021); taken private by Thoma Bravo (2024)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Customer Growth</strong>: 60%+ YoY in Australia (2020–2021)</li><li><strong>Headcount</strong>: Doubled across Sydney, Melbourne, Perth</li><li><strong>Cross-sector Clients</strong>: Insurance, TV, retail, legal, education, local government, professional services</li><li><strong>Strategic Partners</strong>: Telstra, Tesserant</li><li><strong>Global Valuation</strong>: £1.7 billion IPO (2021); taken private by Thoma Bravo (2024)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Darktrace''s playbook offers a clear template. The lessons below are drawn from Darktrace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Darktrace''s playbook offers a clear template. The lessons below are drawn from Darktrace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Cover all sectors from day one</strong> — Don''t specialise too early; let your product''s natural breadth show <em>(Clients in insurance, retail, legal, education, government, media)</em></li><li><strong>Three-city presence signals commitment</strong> — Include Perth in your ANZ plan for resource sector and government clients <em>(Sydney + Melbourne + Perth)</em></li><li><strong>Partner with national IT distributors</strong> — Identify the 1–2 national channel partners who reach your buyer persona <em>(Telstra + Tesserant)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace Expands in Australia as Demand for Self-Learning AI Surges', 'https://www.darktrace.com/news/darktrace-expands-in-australia-as-demand-for-self-learning-ai-surges', 11, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace expands Aussie presence following 60% YoY growth (Technology Decisions)', 'https://www.technologydecisions.com.au/content/security/news/darktrace-expands-aussie-presence-following-60-yoy-growth-1528659210', 12, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace Expands in Australia as Customer Demand Soars', 'https://www.darktrace.com/news/darktrace-expands-in-australia-as-customer-demand-soars', 13, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 4/20: Quantexa
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'quantexa-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug quantexa-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The big-data financial crime platform that made 7 of 10 Australian banks its customers',
    tldr = ARRAY['The big-data financial crime platform that made 7 of 10 Australian banks its customers', 'Australia and the UK share common financial crime regulatory frameworks.', 'Quantexa was founded in London in 2016 by Vishal Marria, a former HSBC head of financial crime intelligence.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Vishal Marria', 'Founder & CEO', true);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Quantexa was founded in London in 2016 by Vishal Marria, a former HSBC head of financial crime intelligence. Its Contextual Decision Intelligence (CDI) platform resolves entities across massive datasets, builds network graphs connecting customers and counterparties, and uses AI to surface criminal relationships invisible to traditional rules-based AML systems. It became a unicorn in 2022 after raising $129 million in a Series E, reaching a $1.8 billion valuation in 2023.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Quantexa was founded in London in 2016 by Vishal Marria, a former HSBC head of financial crime intelligence. Its Contextual Decision Intelligence (CDI) platform resolves entities across massive datasets, builds network graphs connecting customers and counterparties, and uses AI to surface criminal relationships invisible to traditional rules-based AML systems. It became a unicorn in 2022 after raising $129 million in a Series E, reaching a $1.8 billion valuation in 2023.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia and the UK share common financial crime regulatory frameworks. AUSTRAC''s record $1.3 billion enforcement action against Westpac in 2020 — the world''s largest-ever AML penalty — created critical urgency for banks to upgrade financial crime detection capabilities.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia and the UK share common financial crime regulatory frameworks. AUSTRAC''s record $1.3 billion enforcement action against Westpac in 2020 — the world''s largest-ever AML penalty — created critical urgency for banks to upgrade financial crime detection capabilities.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>June 2017 – Sydney APAC HQ:</strong> Quantexa opened its Sydney office as its first Asia-Pacific location, led by Shaun Mathieson — a former senior leader at BAE Systems, SAS Institute, and Gresham Technologies. The founding strategy: Quantexa''s UK bank clients (HSBC, Standard Chartered) had ANZ operations, and the Sydney team''s first calls were to those existing clients'' Australian operations.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>June 2017 – Sydney APAC HQ:</strong> Quantexa opened its Sydney office as its first Asia-Pacific location, led by Shaun Mathieson — a former senior leader at BAE Systems, SAS Institute, and Gresham Technologies. The founding strategy: Quantexa''s UK bank clients (HSBC, Standard Chartered) had ANZ operations, and the Sydney team''s first calls were to those existing clients'' Australian operations.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017–2020 – Building the Big-Four Roster:</strong> By 2021, Quantexa was in use at 7 of the top 10 banks in both the UK and Australia — a benchmark the company used publicly to establish sector authority.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017–2020 – Building the Big-Four Roster:</strong> By 2021, Quantexa was in use at 7 of the top 10 banks in both the UK and Australia — a benchmark the company used publicly to establish sector authority.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2021 – 108% Revenue Growth:</strong> Revenues more than doubled in FY2020, with 67% from new client wins. AML sales rose 80%; growth outside core financial crime expanded 280%.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2021 – 108% Revenue Growth:</strong> Revenues more than doubled in FY2020, with 67% from new client wins. AML sales rose 80%; growth outside core financial crime expanded 280%.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Market Penetration</strong>: 7 of top 10 UK and Australian banks (2021)</li><li><strong>Revenue Growth</strong>: 108% in FY2020; 67% from new client wins</li><li><strong>Unicorn</strong>: $1.8B valuation (2023) following $129M Series E</li><li><strong>ANZ Offices</strong>: Sydney APAC HQ (2017), Melbourne (2018)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Market Penetration</strong>: 7 of top 10 UK and Australian banks (2021)</li><li><strong>Revenue Growth</strong>: 108% in FY2020; 67% from new client wins</li><li><strong>Unicorn</strong>: $1.8B valuation (2023) following $129M Series E</li><li><strong>ANZ Offices</strong>: Sydney APAC HQ (2017), Melbourne (2018)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Quantexa''s playbook offers a clear template. The lessons below are drawn from Quantexa''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Quantexa''s playbook offers a clear template. The lessons below are drawn from Quantexa''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Use existing UK clients to get ANZ</strong> — Map your existing customers'' ANZ footprints before you arrive <em>(UK bank clients with ANZ operations became first local references)</em></li><li><strong>Hire an industry-fluent first employee</strong> — Your first ANZ hire should have existing relationships with your target buyers <em>(Former BAE/SAS/Gresham leader with deep bank relationships)</em></li><li><strong>Time entry to regulatory tailwinds</strong> — Understand the regulatory calendar in your target ANZ sector <em>(AUSTRAC enforcement wave dramatically accelerated demand)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Global rising tech star Quantexa grows 108% and expands new products', 'https://pressreleases.responsesource.com/news/101315/global-rising-tech-star-quantexa-grows-and-expands-new-products/', 14, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AML/Fraud Solution of the Year: Quantexa Asia Risk Awards 2021', 'https://www.biia.com/aml-fraud-solution-of-the-year-quantexa-asia-risk-awards-2021/', 15, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Big data scale-up Quantexa formally recognised (FF News)', 'https://ffnews.com/newsarticle/big-data-scale-up-quantexa-formally-recognised-for-its-commitment-to-financial-crime-detection-for-the-worlds-biggest-banks/', 16, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 5/20: Thought Machine
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'thought-machine-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug thought-machine-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The cloud-native core banking company that freed Australia''s challenger banks from their legacy systems',
    tldr = ARRAY['The cloud-native core banking company that freed Australia''s challenger banks from their legacy systems', 'Thought Machine was founded in London in 2014 by Paul Taylor — a former Google engineering lead — with a vision to replace the world''s ageing bank mainframes with cloud-native technology.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Paul Taylor', 'Founder & CEO', true);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Thought Machine was founded in London in 2014 by Paul Taylor — a former Google engineering lead — with a vision to replace the world''s ageing bank mainframes with cloud-native technology. Its Vault Core platform uses smart contracts to define any financial product programmatically and executes migrations in months rather than years. The company raised $160M in a Series D in 2022 at a $2.7 billion valuation, backed by Lloyds Banking Group, JPMorgan Chase Strategic Investments, and Temasek.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Thought Machine was founded in London in 2014 by Paul Taylor — a former Google engineering lead — with a vision to replace the world''s ageing bank mainframes with cloud-native technology. Its Vault Core platform uses smart contracts to define any financial product programmatically and executes migrations in months rather than years. The company raised $160M in a Series D in 2022 at a $2.7 billion valuation, backed by Lloyds Banking Group, JPMorgan Chase Strategic Investments, and Temasek.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2020–2021 – Kiwibank, New Zealand:</strong> Thought Machine''s first ANZ client was Kiwibank — New Zealand''s government-owned challenger bank. The win established the ANZ reference and operational experience needed for Australian engagements.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2020–2021 – Kiwibank, New Zealand:</strong> Thought Machine''s first ANZ client was Kiwibank — New Zealand''s government-owned challenger bank. The win established the ANZ reference and operational experience needed for Australian engagements.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022 – Sydney and Melbourne Offices:</strong> Thought Machine opened offices in both Sydney and Melbourne, stating explicitly: "Thought Machine is committed to the ANZ market."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022 – Sydney and Melbourne Offices:</strong> Thought Machine opened offices in both Sydney and Melbourne, stating explicitly: "Thought Machine is committed to the ANZ market."</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2023–2024 – Judo Bank Goes Live:</strong> Australia''s Judo Bank — the first purpose-built SME challenger bank — selected Vault Core and went live just nine months after project initiation, cutting product development time by 50%.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2023–2024 – Judo Bank Goes Live:</strong> Australia''s Judo Bank — the first purpose-built SME challenger bank — selected Vault Core and went live just nine months after project initiation, cutting product development time by 50%.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>June 2025 – Full Platform Consolidation:</strong> Synpulse completed Phase 2, migrating 63,000 Judo Bank term deposit accounts onto Vault Core and enabling Judo to retire its last legacy platform.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>June 2025 – Full Platform Consolidation:</strong> Synpulse completed Phase 2, migrating 63,000 Judo Bank term deposit accounts onto Vault Core and enabling Judo to retire its last legacy platform.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Clients</strong>: Kiwibank (NZ), Judo Bank (AU)</li><li><strong>Migration Speed</strong>: Judo Bank lending live in 9 months</li><li><strong>Product Development Impact</strong>: 50% reduction in time-to-market at Judo</li><li><strong>Term Deposits Migrated</strong>: 63,000 accounts in Phase 2</li><li><strong>Global Valuation</strong>: $2.7 billion (Series D, 2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Clients</strong>: Kiwibank (NZ), Judo Bank (AU)</li><li><strong>Migration Speed</strong>: Judo Bank lending live in 9 months</li><li><strong>Product Development Impact</strong>: 50% reduction in time-to-market at Judo</li><li><strong>Term Deposits Migrated</strong>: 63,000 accounts in Phase 2</li><li><strong>Global Valuation</strong>: $2.7 billion (Series D, 2022)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Thought Machine''s playbook offers a clear template. The lessons below are drawn from Thought Machine''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Thought Machine''s playbook offers a clear template. The lessons below are drawn from Thought Machine''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Judo Bank case study (Thought Machine)', 'https://www.thoughtmachine.net/case-studies/judo-bank', 17, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Judo Bank upgrades its lending business banking platform (Thought Machine)', 'https://www.thoughtmachine.net/press-releases/judo-bank', 18, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Judo Bank Upgrades Its Lending Business Banking Platform (Financial IT)', 'https://financialit.net/news/banking/judo-bank-upgrades-its-lending-business-banking-platform-thought-machine-technology', 19, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Synpulse partners with Judo Bank to complete Core Banking transformation', 'https://www.synpulse.com/en/insights/synpulse-successfully-partners-with-judo-bank-to-complete-its-core-banking-transformation', 20, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 6/20: Featurespace
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'featurespace-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug featurespace-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'How a Cambridge AI co-founded by an ANU alumnus landed Australia''s national payment infrastructure',
    tldr = ARRAY['How a Cambridge AI co-founded by an ANU alumnus landed Australia''s national payment infrastructure', 'Featurespace was spun out of the University of Cambridge in 2008 by Dave Excell (an Australian National University engineering alumnus) and Professor Bill Fitzgerald.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Dave Excell', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Bill Fitzgerald', 'Co-founder', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Featurespace was spun out of the University of Cambridge in 2008 by Dave Excell (an Australian National University engineering alumnus) and Professor Bill Fitzgerald. It builds enterprise AI for fraud detection using Adaptive Behavioural Analytics — self-learning AI that models individual behaviour and detects anomalies in real time. In May 2023, HSBC acquired Featurespace.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Featurespace was spun out of the University of Cambridge in 2008 by Dave Excell (an Australian National University engineering alumnus) and Professor Bill Fitzgerald. It builds enterprise AI for fraud detection using Adaptive Behavioural Analytics — self-learning AI that models individual behaviour and detects anomalies in real time. In May 2023, HSBC acquired Featurespace.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>Pre-2021 – Relationship Building:</strong> Excell''s ANU alumni network — strong in Canberra''s government and payments circles — created authentic connections to eftpos, Australia''s sovereign domestic debit payment scheme.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>Pre-2021 – Relationship Building:</strong> Excell''s ANU alumni network — strong in Canberra''s government and payments circles — created authentic connections to eftpos, Australia''s sovereign domestic debit payment scheme.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>August–November 2021 – eftpos Live:</strong> Featurespace was selected to power AI-driven predictive fraud scoring across eftpos''s national online payment network as part of eftpos''s AUD $100 million digital upgrade, available to all Australian financial institutions including the big four banks.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>August–November 2021 – eftpos Live:</strong> Featurespace was selected to power AI-driven predictive fraud scoring across eftpos''s national online payment network as part of eftpos''s AUD $100 million digital upgrade, available to all Australian financial institutions including the big four banks.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022–2024 – VGW and APAC GM:</strong> Featurespace added VGW — the Perth-headquartered social gaming company — as a major ANZ client. In 2024, Phillip Finnegan was appointed APAC General Manager, based in Sydney.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022–2024 – VGW and APAC GM:</strong> Featurespace added VGW — the Perth-headquartered social gaming company — as a major ANZ client. In 2024, Phillip Finnegan was appointed APAC General Manager, based in Sydney.</p>', 4, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Anchor Client</strong>: eftpos — Australia''s sovereign debit payment scheme</li><li><strong>Partnership Scope</strong>: AI fraud scoring available to all Australian financial institutions</li><li><strong>Investment Context</strong>: Part of eftpos''s AUD $100 million digital upgrade</li><li><strong>Founder Connection</strong>: Dave Excell — ANU engineering and IT alumni</li><li><strong>Corporate Outcome</strong>: Acquired by HSBC (2023)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Anchor Client</strong>: eftpos — Australia''s sovereign debit payment scheme</li><li><strong>Partnership Scope</strong>: AI fraud scoring available to all Australian financial institutions</li><li><strong>Investment Context</strong>: Part of eftpos''s AUD $100 million digital upgrade</li><li><strong>Founder Connection</strong>: Dave Excell — ANU engineering and IT alumni</li><li><strong>Corporate Outcome</strong>: Acquired by HSBC (2023)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Featurespace''s playbook offers a clear template. The lessons below are drawn from Featurespace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Featurespace''s playbook offers a clear template. The lessons below are drawn from Featurespace''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Your founder''s network opens market-defining doors</strong> — Map every personal ANZ connection your founding team has before engaging formally <em>(ANU alumni network led to eftpos relationship)</em></li><li><strong>Land the infrastructure, not the individual player</strong> — Look for the platform or intermediary that reaches your entire target market <em>(eftpos gives access to ALL Australian banks, not just one)</em></li><li><strong>Formalise regional leadership at the right time</strong> — Once you have two or more significant ANZ clients, hire a dedicated APAC leader <em>(APAC GM appointed after two significant ANZ clients)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eftpos flicks the switch on world-class AI anti-fraud technology', 'https://www.featurespace.com/newsroom/eftpos-flicks-the-switch-on-world-class-ai-anti-fraud-technology', 21, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AI-driven counter fraud platform utilised by eftpos', 'https://ecommercenews.com.au/story/ai-driven-counter-fraud-platform-utilised-by-eftpos-to-help-prevent-cybercrime', 22, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eftpos Taps into AI Anti-Fraud Technology', 'https://australiancybersecuritymagazine.com.au/eftpos-taps-into-ai-anti-fraud-technology/', 23, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eftpos using AI to fight online shopping fraud', 'https://www.technologydecisions.com.au/content/security/news/eftpos-using-ai-to-fight-online-shopping-fraud-303249929', 24, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FEATURESPACE / VGW partnership (Business Wire via Ritzau)', 'https://via.ritzau.dk/pressemeddelelse/13655463/featurespace?publisherId=90456', 25, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australia''s eftpos boosts online payment security (Finextra)', 'https://www.finextra.com/newsarticle/38599/australias-eftpos-boosts-online-payment-security', 26, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 7/20: Mimecast
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'mimecast-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug mimecast-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = '120 partners, five cities, one channel-led playbook — the ANZ cyber resilience blueprint',
    tldr = ARRAY['120 partners, five cities, one channel-led playbook — the ANZ cyber resilience blueprint', 'Mimecast was founded in London in 2003 by Peter Bauer and Neil Murray.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Peter Bauer', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Neil Murray', 'Co-founder & CTO', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Mimecast was founded in London in 2003 by Peter Bauer and Neil Murray. It built a cloud-based email security and cyber resilience platform. It listed on NASDAQ in 2015 and was acquired by Permira for $5.8 billion in 2022. Today it protects 42,000+ organisations globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Mimecast was founded in London in 2003 by Peter Bauer and Neil Murray. It built a cloud-based email security and cyber resilience platform. It listed on NASDAQ in 2015 and was acquired by Permira for $5.8 billion in 2022. Today it protects 42,000+ organisations globally.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2013 – Australian Launch:</strong> Mimecast officially launched in Australia in 2013, establishing offices in Melbourne and Sydney, with a channel-first go-to-market from day one.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2013 – Australian Launch:</strong> Mimecast officially launched in Australia in 2013, establishing offices in Melbourne and Sydney, with a channel-first go-to-market from day one.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2018 – Channel Milestone:</strong> In 12 months Mimecast doubled its Australian headcount, signed 40 new ANZ reseller partners, and appointed Rema Lolas as ANZ Channel Director. The annual Mimecast ANZ Partner Awards were launched in Sydney, celebrating channel partner performance across eight categories.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2018 – Channel Milestone:</strong> In 12 months Mimecast doubled its Australian headcount, signed 40 new ANZ reseller partners, and appointed Rema Lolas as ANZ Channel Director. The annual Mimecast ANZ Partner Awards were launched in Sydney, celebrating channel partner performance across eight categories.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019 – 120+ Partners:</strong> By 2019, Mimecast''s ANZ partner count reached 120+, with Nick Lennon cited as ANZ Country Manager leading the ecosystem.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019 – 120+ Partners:</strong> By 2019, Mimecast''s ANZ partner count reached 120+, with Nick Lennon cited as ANZ Country Manager leading the ecosystem.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2022 – Five-City Presence:</strong> Mimecast expanded to Sydney, Melbourne, Brisbane, Perth, and Auckland. Nick Lennon was appointed VP of Mimecast APAC. Channel team grew 20% in 2022.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2022 – Five-City Presence:</strong> Mimecast expanded to Sydney, Melbourne, Brisbane, Perth, and Auckland. Nick Lennon was appointed VP of Mimecast APAC. Channel team grew 20% in 2022.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Customer Base</strong>: 1,200+ customers across Australia and New Zealand</li><li><strong>Partner Ecosystem</strong>: 120+ ANZ channel partners</li><li><strong>City Presence</strong>: Sydney, Melbourne, Brisbane, Perth, Auckland</li><li><strong>Corporate Outcome</strong>: Acquired by Permira for $5.8 billion (2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Customer Base</strong>: 1,200+ customers across Australia and New Zealand</li><li><strong>Partner Ecosystem</strong>: 120+ ANZ channel partners</li><li><strong>City Presence</strong>: Sydney, Melbourne, Brisbane, Perth, Auckland</li><li><strong>Corporate Outcome</strong>: Acquired by Permira for $5.8 billion (2022)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Mimecast''s playbook offers a clear template. The lessons below are drawn from Mimecast''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Mimecast''s playbook offers a clear template. The lessons below are drawn from Mimecast''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Build channel first, direct second</strong> — Map the ANZ reseller/MSP ecosystem before opening an office <em>(120 partners serve customers Mimecast could never reach direct)</em></li><li><strong>Create a partner aspiration ladder</strong> — Give your partners a visible progression path with commercial incentives <em>(Elite, Certified, Rising Star, Customer Excellence tiers)</em></li><li><strong>Formalise community through annual events</strong> — Host annual events that celebrate your channel <em>(ANZ Partner Awards created loyalty and competition)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast takes leap into ANZ with local channel hires', 'https://channellife.com.au/story/mimecast-takes-leap-nz-five-local-hires', 27, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast ANZ names top partners at second partner awards', 'https://channellife.com.au/story/mimecast-nz-names-top-partners-second-partner-awards', 28, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast''s top ANZ channel partners of 2019', 'https://channellife.co.nz/story/mimecast-s-top-a-nz-channel-partners-of-2019', 29, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast honours A/NZ partners as channel investment rises (ARN)', 'https://www.arnnet.com.au/article/1261864/mimecast-honours-a-nz-partners-as-channel-investment-rises.html', 30, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 8/20: ComplyAdvantage
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'complyadvantage-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug complyadvantage-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'Entering ANZ ahead of the regulatory wave — the AML compliance play that knew what was coming',
    tldr = ARRAY['Entering ANZ ahead of the regulatory wave — the AML compliance play that knew what was coming', 'Australia''s Tranche 2 AML reforms — extending AML obligations to approximately 90,000 new entities including lawyers, accountants, and real estate agents — had been discussed since 2007 and commenced 1 July 2026.', 'ComplyAdvantage was founded in London in 2014 by Charles Delingpole.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Charles Delingpole', 'Founder & CEO', true);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>ComplyAdvantage was founded in London in 2014 by Charles Delingpole. It provides AI-driven financial crime risk intelligence for AML, sanctions, and fraud risk screening, serving 1,000+ clients in 75+ countries including HSBC, Santander, Starling Bank, and Wise.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>ComplyAdvantage was founded in London in 2014 by Charles Delingpole. It provides AI-driven financial crime risk intelligence for AML, sanctions, and fraud risk screening, serving 1,000+ clients in 75+ countries including HSBC, Santander, Starling Bank, and Wise.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia''s Tranche 2 AML reforms — extending AML obligations to approximately 90,000 new entities including lawyers, accountants, and real estate agents — had been discussed since 2007 and commenced 1 July 2026. ComplyAdvantage entered precisely to be positioned ahead of this demand explosion.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia''s Tranche 2 AML reforms — extending AML obligations to approximately 90,000 new entities including lawyers, accountants, and real estate agents — had been discussed since 2007 and commenced 1 July 2026. ComplyAdvantage entered precisely to be positioned ahead of this demand explosion.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2019 – APAC MD Appointed:</strong> Jaede Tan was appointed Managing Director, Asia-Pacific, based in Sydney — committed to local leadership rather than remote management from London.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2019 – APAC MD Appointed:</strong> Jaede Tan was appointed Managing Director, Asia-Pacific, based in Sydney — committed to local leadership rather than remote management from London.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019–2021 – FinTech Australia Membership:</strong> ComplyAdvantage joined FinTech Australia, positioning itself as the compliance infrastructure layer for Australian fintechs and neobanks building AML-regulated products.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019–2021 – FinTech Australia Membership:</strong> ComplyAdvantage joined FinTech Australia, positioning itself as the compliance infrastructure layer for Australian fintechs and neobanks building AML-regulated products.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2020–2022 – Content Authority:</strong> The company invested in ANZ-specific regulatory content — AUSTRAC guides, AML framework analyses, Tranche 2 reform timelines — establishing thought leadership that drove inbound leads from compliance officers and CTOs.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2020–2022 – Content Authority:</strong> The company invested in ANZ-specific regulatory content — AUSTRAC guides, AML framework analyses, Tranche 2 reform timelines — establishing thought leadership that drove inbound leads from compliance officers and CTOs.</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024–2026 – Tranche 2 Demand Wave:</strong> As Tranche 2 legislation passed with a 1 July 2026 commencement date, ComplyAdvantage''s ANZ pipeline expanded significantly.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024–2026 – Tranche 2 Demand Wave:</strong> As Tranche 2 legislation passed with a 1 July 2026 commencement date, ComplyAdvantage''s ANZ pipeline expanded significantly.</p>', 6, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>APAC Leadership</strong>: Jaede Tan, MD Asia-Pacific, Sydney-based</li><li><strong>Community Presence</strong>: FinTech Australia member</li><li><strong>Regulatory Tailwind</strong>: Tranche 2 reforms bring 90,000 new regulated entities into scope by July 2026</li><li><strong>Global Scale</strong>: 1,000+ clients, 75+ countries, $100M+ raised</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>APAC Leadership</strong>: Jaede Tan, MD Asia-Pacific, Sydney-based</li><li><strong>Community Presence</strong>: FinTech Australia member</li><li><strong>Regulatory Tailwind</strong>: Tranche 2 reforms bring 90,000 new regulated entities into scope by July 2026</li><li><strong>Global Scale</strong>: 1,000+ clients, 75+ countries, $100M+ raised</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, ComplyAdvantage''s playbook offers a clear template. The lessons below are drawn from ComplyAdvantage''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, ComplyAdvantage''s playbook offers a clear template. The lessons below are drawn from ComplyAdvantage''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter ahead of the regulatory wave</strong> — Study the Australian regulatory calendar in your sector <em>(Arrived before Tranche 2 created mass demand)</em></li><li><strong>Create ANZ-specific content that earns trust</strong> — Build the educational content that helps your buyers do their jobs better <em>(AUSTRAC guides and AML framework resources)</em></li><li><strong>Let regulation be your sales team</strong> — Map regulatory mandates as demand catalysts <em>(Tranche 2 drives demand without you creating it)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tranche 2 reforms 2026: A complete guide for DNFBPs', 'https://complyadvantage.com/insights/tranche-2-aml-reforms/', 31, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tranche 2 AML/CFT reforms land 1 July 2026 (LinkedIn)', 'https://www.linkedin.com/posts/complyadvantage_tranche-2-amlcft-reforms-land-1-activity-7430431069931200512-jpNF', 32, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Australian AML/CFT Regulatory Framework', 'https://complyadvantage.com/insights/australian-aml-cft-regulatory-framework/', 33, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 9/20: Onfido
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'onfido-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug onfido-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The invisible identity engine that powers Australia''s fintech onboarding',
    tldr = ARRAY['The invisible identity engine that powers Australia''s fintech onboarding', 'Onfido was founded in Oxford in 2012 by three Oxford University computer scientists.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Onfido was founded in Oxford in 2012 by three Oxford University computer scientists. Its AI identity verification platform analyses identity documents and biometric checks from 195 countries to confirm identity in seconds. The platform processed 200M+ identity checks before being acquired by Entrust in 2024 (with $130M+ ARR at acquisition). It serves 1,200+ businesses including HSBC, Toyota, Bitstamp, and Revolut globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Onfido was founded in Oxford in 2012 by three Oxford University computer scientists. Its AI identity verification platform analyses identity documents and biometric checks from 195 countries to confirm identity in seconds. The platform processed 200M+ identity checks before being acquired by Entrust in 2024 (with $130M+ ARR at acquisition). It serves 1,200+ businesses including HSBC, Toyota, Bitstamp, and Revolut globally.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2018–2019 – UK Client Pull-Through:</strong> Onfido''s ANZ market entry was primarily pull-through: UK clients expanding to Australia — most notably Revolut — needed Onfido''s integration to cover Australian documents and AUSTRAC-compliant KYC flows. Onfido invested in adding all Australian state driver''s licences, Medicare card support, and AUSTRAC-compliant liveness detection.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2018–2019 – UK Client Pull-Through:</strong> Onfido''s ANZ market entry was primarily pull-through: UK clients expanding to Australia — most notably Revolut — needed Onfido''s integration to cover Australian documents and AUSTRAC-compliant KYC flows. Onfido invested in adding all Australian state driver''s licences, Medicare card support, and AUSTRAC-compliant liveness detection.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>The Revolut Australia Effect:</strong> When Revolut launched in Australia in 2020, every customer was verified through an Onfido identity check. As Revolut grew to 1 million Australian users, Onfido''s ANZ transaction volume grew proportionately — a significant revenue stream with no dedicated ANZ sales team.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>The Revolut Australia Effect:</strong> When Revolut launched in Australia in 2020, every customer was verified through an Onfido identity check. As Revolut grew to 1 million Australian users, Onfido''s ANZ transaction volume grew proportionately — a significant revenue stream with no dedicated ANZ sales team.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019–2023 – Platform-Level ANZ Presence:</strong> Onfido became the go-to identity verification infrastructure for Australian fintechs, neobanks, BNPL providers, and crypto exchanges emerging in this period.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019–2023 – Platform-Level ANZ Presence:</strong> Onfido became the go-to identity verification infrastructure for Australian fintechs, neobanks, BNPL providers, and crypto exchanges emerging in this period.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024 – Entrust Acquisition:</strong> Onfido was acquired by Entrust, integrating its AI into Entrust''s broader global identity security portfolio.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024 – Entrust Acquisition:</strong> Onfido was acquired by Entrust, integrating its AI into Entrust''s broader global identity security portfolio.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Model</strong>: B2B2C — UK clients expanding to ANZ pulled Onfido with them</li><li><strong>Notable ANZ Client</strong>: Revolut Australia (powers onboarding for 1M+ Australians)</li><li><strong>Global Scale</strong>: 200M+ identity checks; 1,200+ clients; 195 countries</li><li><strong>Corporate Outcome</strong>: Acquired by Entrust (2024) at $130M+ ARR</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Model</strong>: B2B2C — UK clients expanding to ANZ pulled Onfido with them</li><li><strong>Notable ANZ Client</strong>: Revolut Australia (powers onboarding for 1M+ Australians)</li><li><strong>Global Scale</strong>: 200M+ identity checks; 1,200+ clients; 195 countries</li><li><strong>Corporate Outcome</strong>: Acquired by Entrust (2024) at $130M+ ARR</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Onfido''s playbook offers a clear template. The lessons below are drawn from Onfido''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Onfido''s playbook offers a clear template. The lessons below are drawn from Onfido''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Let UK clients'' global expansion be your market entry</strong> — Map which existing clients are planning ANZ expansion; follow them <em>(Revolut UK → Revolut AU = Onfido UK → Onfido AU)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure plays don''t need consumer brand recognition in ANZ <em>(Every Revolut AU customer verified by Onfido; most didn''t know)</em></li><li><strong>Build ANZ document coverage before ANZ sales</strong> — Technical investment in local document coverage unlocks ANZ revenue <em>(Australian driver''s licences and AUSTRAC support came first)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut hits 1m Aussie users, plans AUD $400m push (CFOtech)', 'https://cfotech.com.au/story/revolut-hits-1m-aussie-users-plans-aud-400m-push', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Onfido: A Global Leader in Automated ID Verification', 'https://fintechmagazine.com/fraud-id-verification/onfido-global-leader-in-id-verification', 34, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Onfido Alternative: VOVE ID vs Onfido (Entrust acquisition context)', 'https://blog.voveid.com/onfido-alternative-vove-id-vs-onfido-for-emerging-market-fintechs/', 35, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 10/20: Blue Prism
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'blue-prism-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug blue-prism-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The RPA pioneer that put 20,000 hours back into Telstra — and sparked a $130M UK tech investment wave',
    tldr = ARRAY['The RPA pioneer that put 20,000 hours back into Telstra — and sparked a $130M UK tech investment wave', 'Blue Prism was founded in Warrington, England in 2001 by Alastair Bathgate and David Moss — two former accountants who believed repetitive back-office processes could be automated by software robots.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Automation"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alastair Bathgate', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'David Moss', 'Co-founder', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Blue Prism was founded in Warrington, England in 2001 by Alastair Bathgate and David Moss — two former accountants who believed repetitive back-office processes could be automated by software robots. The company coined the term "Robotic Process Automation" (RPA), listed on AIM in 2016, grew to a £2.5 billion valuation, and was acquired by SS&C Technologies for £1.27 billion in 2022.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Blue Prism was founded in Warrington, England in 2001 by Alastair Bathgate and David Moss — two former accountants who believed repetitive back-office processes could be automated by software robots. The company coined the term "Robotic Process Automation" (RPA), listed on AIM in 2016, grew to a £2.5 billion valuation, and was acquired by SS&C Technologies for £1.27 billion in 2022.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – The $130 Million UK Tech Wave:</strong> Blue Prism was one of five UK technology companies that collectively invested $130 million into Australia in 2017, creating 155 jobs, in a coordinated announcement supported by the Australian Trade and Investment Commission and the UK Department for International Trade.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – The $130 Million UK Tech Wave:</strong> Blue Prism was one of five UK technology companies that collectively invested $130 million into Australia in 2017, creating 155 jobs, in a coordinated announcement supported by the Australian Trade and Investment Commission and the UK Department for International Trade.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – SI Alliance Strategy:</strong> Blue Prism''s go-to-market in Australia was built on Systems Integrator alliances — particularly Infosys, which attained gold-level Blue Prism certification in 2017.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – SI Alliance Strategy:</strong> Blue Prism''s go-to-market in Australia was built on Systems Integrator alliances — particularly Infosys, which attained gold-level Blue Prism certification in 2017.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2021 – Telstra T22: The Landmark Win:</strong> Infosys used Blue Prism to automate complex processes as part of Telstra''s T22 transformation strategy, returning over 20,000 man-hours to Telstra''s business over 12–18 months. Infosys won both the APAC and Global Telecommunications Blue Prism Partner Excellence Awards for this work.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2021 – Telstra T22: The Landmark Win:</strong> Infosys used Blue Prism to automate complex processes as part of Telstra''s T22 transformation strategy, returning over 20,000 man-hours to Telstra''s business over 12–18 months. Infosys won both the APAC and Global Telecommunications Blue Prism Partner Excellence Awards for this work.</p>', 4, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Investment</strong>: Part of $130M UK tech wave; 155 jobs created (2017)</li><li><strong>Landmark ANZ Client</strong>: Telstra (T22 transformation)</li><li><strong>Telstra Impact</strong>: 20,000+ man-hours returned to business over 12–18 months</li><li><strong>Corporate Outcome</strong>: Acquired by SS&C Technologies for £1.27 billion (2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Investment</strong>: Part of $130M UK tech wave; 155 jobs created (2017)</li><li><strong>Landmark ANZ Client</strong>: Telstra (T22 transformation)</li><li><strong>Telstra Impact</strong>: 20,000+ man-hours returned to business over 12–18 months</li><li><strong>Corporate Outcome</strong>: Acquired by SS&C Technologies for £1.27 billion (2022)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Blue Prism''s playbook offers a clear template. The lessons below are drawn from Blue Prism''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Blue Prism''s playbook offers a clear template. The lessons below are drawn from Blue Prism''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter with government support and peer companies</strong> — Reach out to Austrade and DIT — they can coordinate multi-company launches <em>(Coordinated $130M UK tech wave)</em></li><li><strong>Build an SI channel before a direct sales team</strong> — In enterprise tech, SI relationships are more valuable than your own sales team <em>(Infosys, Deloitte, Accenture certified as delivery partners)</em></li><li><strong>Target transformation programmes, not product replacements</strong> — Position as a transformation enabler, not a cost line <em>(Telstra T22 was a strategic transformation)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infosys wins global award for CX automation project with Telstra', 'https://www.consultancy.com.au/news/3833/infosys-wins-global-award-for-cx-automation-project-with-telstra', 36, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, '5 UK tech providers ploughed $130M into Australia during 2017', 'https://www.arnnet.com.au/article/1265281/5-uk-tech-providers-ploughed-130m-into-australia-during-2017.html', 37, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Blue Prism alliance (Infosys)', 'https://www.infosys.com/about/alliances/blue-prism.html', 38, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infosys Wins Two Awards at Blue Prism World 2021', 'https://www.infosys.com/newsroom/press-releases/2021/delivering-intelligent-automation-based-solutions-awards2021.html', 39, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 11/20: Dext
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'dext-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug dext-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'How a London accounting startup rode Xero''s wave to become the default pre-accounting tool for a million users',
    tldr = ARRAY['How a London accounting startup rode Xero''s wave to become the default pre-accounting tool for a million users', 'Xero — the New Zealand-founded accounting software giant — commands 70–80% of Australia''s cloud accounting market with 1.77 million subscribers.', 'Dext was founded in London in 2010 by Michael Wood.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "AccountingTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Michael Wood', 'Founder', true);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Dext was founded in London in 2010 by Michael Wood. Its product takes a photo of a receipt, extracts supplier, amount, date, and GST data automatically, and pushes it directly into accounting software. Dext rebranded from Receipt Bank in February 2021, simultaneously passing 1 million global users. It now serves 700,000+ users across 40+ countries.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Dext was founded in London in 2010 by Michael Wood. Its product takes a photo of a receipt, extracts supplier, amount, date, and GST data automatically, and pushes it directly into accounting software. Dext rebranded from Receipt Bank in February 2021, simultaneously passing 1 million global users. It now serves 700,000+ users across 40+ countries.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Xero — the New Zealand-founded accounting software giant — commands 70–80% of Australia''s cloud accounting market with 1.77 million subscribers. Any product that deeply integrated with Xero and solved a real problem for accounting and bookkeeping partners would automatically have distribution into hundreds of thousands of Australian small businesses.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Xero — the New Zealand-founded accounting software giant — commands 70–80% of Australia''s cloud accounting market with 1.77 million subscribers. Any product that deeply integrated with Xero and solved a real problem for accounting and bookkeeping partners would automatically have distribution into hundreds of thousands of Australian small businesses.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2015–2016 – Via Xero:</strong> Dext entered Australia through deep Xero integration, with Australian accountants able to add Receipt Bank as a direct extension of Xero workflows. Vicky Skipp was appointed VP of Sales APAC, building a local Sydney-based team.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2015–2016 – Via Xero:</strong> Dext entered Australia through deep Xero integration, with Australian accountants able to add Receipt Bank as a direct extension of Xero workflows. Vicky Skipp was appointed VP of Sales APAC, building a local Sydney-based team.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – Xerocon Brisbane:</strong> The breakthrough moment was sponsoring and hosting a 200-person river cruise at Xerocon Brisbane — 3,500 accountants and bookkeepers from Australia, New Zealand, and Singapore. Hundreds of accounting practices converted to active customers following the event.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – Xerocon Brisbane:</strong> The breakthrough moment was sponsoring and hosting a 200-person river cruise at Xerocon Brisbane — 3,500 accountants and bookkeepers from Australia, New Zealand, and Singapore. Hundreds of accounting practices converted to active customers following the event.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019 – Xavier (Dext Precision) Acquisition:</strong> Dext acquired Xavier Analytics, a popular Australian-facing Xero data quality tool, deepening its position from "receipt capture" to "practice intelligence platform."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019 – Xavier (Dext Precision) Acquisition:</strong> Dext acquired Xavier Analytics, a popular Australian-facing Xero data quality tool, deepening its position from "receipt capture" to "practice intelligence platform."</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2021 – 1 Million Users:</strong> Receipt Bank celebrated 1 million global users and rebranded to Dext, with Australia among its most significant markets.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2021 – 1 Million Users:</strong> Receipt Bank celebrated 1 million global users and rebranded to Dext, with Australia among its most significant markets.</p>', 6, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Global Users</strong>: 1 million+ (February 2021)</li><li><strong>ANZ Distribution</strong>: Deep integration with Xero (1.77M Australian subscribers)</li><li><strong>Xerocon Presence</strong>: Major sponsor, 3,500+ attendees</li><li><strong>Platform Coverage</strong>: Xero, MYOB, QuickBooks Online</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Global Users</strong>: 1 million+ (February 2021)</li><li><strong>ANZ Distribution</strong>: Deep integration with Xero (1.77M Australian subscribers)</li><li><strong>Xerocon Presence</strong>: Major sponsor, 3,500+ attendees</li><li><strong>Platform Coverage</strong>: Xero, MYOB, QuickBooks Online</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Dext''s playbook offers a clear template. The lessons below are drawn from Dext''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Dext''s playbook offers a clear template. The lessons below are drawn from Dext''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter via platform, not sales team</strong> — Identify the dominant ANZ platform in your sector; build a deep integration first <em>(Xero integration = distribution to all Xero users)</em></li><li><strong>Sponsor the ecosystem''s annual gathering</strong> — Find the ANZ equivalent of your sector''s annual conference and be a major presence <em>(Xerocon was the single most important ANZ event)</em></li><li><strong>Buy deeper into the ecosystem</strong> — Acquiring a complementary ANZ-focused product can be faster than building <em>(Xavier/Dext Precision acquisition deepened the Xero partnership)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Receipt Bank passes 1 million users, reinforces brand', 'https://www.canadian-accountant.com/content/technology/receipt-bank-passes-1-million-users', 40, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Why Xero''s Market Share Benefits Australian Businesses', 'https://www.scalesuite.com.au/resources/xero-market-share-australian-businesses', 41, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Transforming the Accounting Industry: a Xerocon to Remember', 'https://dext.com/en/blog/single/transforming-the-accounting-industry-a-xerocon-to-remember', 42, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 12/20: nPlan
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'nplan-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug nplan-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The UK AI company that trained on 750,000 projects — and landed Australia''s biggest road project in 2025',
    tldr = ARRAY['The UK AI company that trained on 750,000 projects — and landed Australia''s biggest road project in 2025', 'nPlan was founded in London in 2017 by Dev Amratia and Tom Bower.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Dev Amratia', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Tom Bower', 'Co-founder & CTO', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>nPlan was founded in London in 2017 by Dev Amratia and Tom Bower. It built a deep learning AI platform trained on 750,000+ past construction project schedules representing $2.5 trillion in capital expenditure — the world''s largest such dataset — to predict where a project will struggle before it happens. The company raised a $16 million Series B in October 2025.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>nPlan was founded in London in 2017 by Dev Amratia and Tom Bower. It built a deep learning AI platform trained on 750,000+ past construction project schedules representing $2.5 trillion in capital expenditure — the world''s largest such dataset — to predict where a project will struggle before it happens. The company raised a $16 million Series B in October 2025.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>October 2025 – Series B with Mott MacDonald:</strong> nPlan raised $16M with Mott MacDonald — one of the world''s largest engineering consultancies — as both an investor and a strategic channel partner, opening doors to major infrastructure clients globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>October 2025 – Series B with Mott MacDonald:</strong> nPlan raised $16M with Mott MacDonald — one of the world''s largest engineering consultancies — as both an investor and a strategic channel partner, opening doors to major infrastructure clients globally.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>December 2025 – Spark NEL: The A$11 Billion North East Link:</strong> Spark NEL — the consortium delivering Victoria''s A$11 billion North East Link (Melbourne''s largest-ever road project; 6.5km twin tunnels, due 2028) — selected nPlan''s Insights Pro platform for AI-led risk assurance and project delivery management as the project entered its final phases.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>December 2025 – Spark NEL: The A$11 Billion North East Link:</strong> Spark NEL — the consortium delivering Victoria''s A$11 billion North East Link (Melbourne''s largest-ever road project; 6.5km twin tunnels, due 2028) — selected nPlan''s Insights Pro platform for AI-led risk assurance and project delivery management as the project entered its final phases.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p>This win marked nPlan''s first highways sector client globally, extending its proven capability from rail and energy into roads.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>This win marked nPlan''s first highways sector client globally, extending its proven capability from rail and energy into roads.</p>', 4, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Anchor Client</strong>: Spark NEL D&C — North East Link, Melbourne</li><li><strong>Project Scale</strong>: A$11 billion, 6.5km twin tunnels, due 2028</li><li><strong>Sector Milestone</strong>: First highways client globally for nPlan</li><li><strong>Dataset</strong>: 750,000+ past project schedules; $2.5T in capex</li><li><strong>Series B</strong>: $16M (October 2025); investors include Mott MacDonald</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Anchor Client</strong>: Spark NEL D&C — North East Link, Melbourne</li><li><strong>Project Scale</strong>: A$11 billion, 6.5km twin tunnels, due 2028</li><li><strong>Sector Milestone</strong>: First highways client globally for nPlan</li><li><strong>Dataset</strong>: 750,000+ past project schedules; $2.5T in capex</li><li><strong>Series B</strong>: $16M (October 2025); investors include Mott MacDonald</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, nPlan''s playbook offers a clear template. The lessons below are drawn from nPlan''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, nPlan''s playbook offers a clear template. The lessons below are drawn from nPlan''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Make your dataset the moat</strong> — Identify your proprietary data asset; make it the centrepiece of your ANZ pitch <em>(750,000 project schedules — impossible to replicate)</em></li><li><strong>Land the megaproject, not the mid-market</strong> — In Australia''s infrastructure sector, one megaproject reference is worth 100 smaller wins <em>(A$11B project over many smaller ones)</em></li><li><strong>Get an industry leader as both investor and partner</strong> — Your ANZ round should include a strategic investor who will also bring you customers <em>(Mott MacDonald invested AND channels clients)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'nPlan raises $16M Series B', 'https://www.nplan.io/press-releases/nplan-raises-16m-series-b-to-scale-its-ai-led-transformation-of-capital-project-delivery', 43, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Spark NEL ignites AI partnership with nPlan', 'https://www.nplan.io/press-releases/spark-nel-ignites-ai-partnership-with-nplan-to-assure-and-de-risk-victorias-largest-highways-project', 44, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Melbourne''s $11bn North East Link project adopts nPlan''s AI planning tools', 'https://www.globalconstructionreview.com/melbournes-11bn-north-east-link-project-adopts-nplans-ai-planning-tools/', 45, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 13/20: DaXtra Technologies
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'daxtra-technologies-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug daxtra-technologies-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The Edinburgh AI that''s been powering Australian recruitment for 15 years',
    tldr = ARRAY['The Edinburgh AI that''s been powering Australian recruitment for 15 years', 'DaXtra Technologies was founded in Edinburgh, Scotland in the early 2000s.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "HRTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>DaXtra Technologies was founded in Edinburgh, Scotland in the early 2000s. It builds CV parsing (extracting structured data from unstructured resumes), semantic candidate matching, and multi-source search software for the global recruitment industry. DaXtra processes 100M+ resumes monthly and was recognised as an Accelerator in Nucleus Research''s 2024 Standalone Talent Acquisition Technology Value Matrix.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>DaXtra Technologies was founded in Edinburgh, Scotland in the early 2000s. It builds CV parsing (extracting structured data from unstructured resumes), semantic candidate matching, and multi-source search software for the global recruitment industry. DaXtra processes 100M+ resumes monthly and was recognised as an Accelerator in Nucleus Research''s 2024 Standalone Talent Acquisition Technology Value Matrix.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2010 – Peoplebank Australia:</strong> DaXtra''s Australian story began when Peoplebank Australia — then Australia''s largest IT and technology recruitment company — signed an agreement to deploy DaXtra''s CandidateCapture parsing software. Processing time reduced by approximately 80%; accuracy above 90% for Australian CV formats.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2010 – Peoplebank Australia:</strong> DaXtra''s Australian story began when Peoplebank Australia — then Australia''s largest IT and technology recruitment company — signed an agreement to deploy DaXtra''s CandidateCapture parsing software. Processing time reduced by approximately 80%; accuracy above 90% for Australian CV formats.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2010–2024 – 15 Years of Steady Compounding:</strong> DaXtra expanded its ANZ client base steadily, building integrations to every major Australian recruitment CRM (Bullhorn, JobAdder, Vincere, PageUp). The company grew from parsing into multi-source search and semantic matching, becoming the de facto CV processing infrastructure for Australia''s recruitment industry.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2010–2024 – 15 Years of Steady Compounding:</strong> DaXtra expanded its ANZ client base steadily, building integrations to every major Australian recruitment CRM (Bullhorn, JobAdder, Vincere, PageUp). The company grew from parsing into multi-source search and semantic matching, becoming the de facto CV processing infrastructure for Australia''s recruitment industry.</p>', 3, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>First ANZ Client</strong>: Peoplebank Australia (2010) — then Australia''s largest IT recruiter</li><li><strong>Process Improvement</strong>: ~80% reduction in CV processing time at Peoplebank</li><li><strong>ANZ Timeline</strong>: 15+ years of continuous ANZ presence (2010–2026)</li><li><strong>Global Scale</strong>: 100M+ resumes processed monthly</li><li><strong>Analyst Recognition</strong>: Nucleus Research Accelerator (2024)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>First ANZ Client</strong>: Peoplebank Australia (2010) — then Australia''s largest IT recruiter</li><li><strong>Process Improvement</strong>: ~80% reduction in CV processing time at Peoplebank</li><li><strong>ANZ Timeline</strong>: 15+ years of continuous ANZ presence (2010–2026)</li><li><strong>Global Scale</strong>: 100M+ resumes processed monthly</li><li><strong>Analyst Recognition</strong>: Nucleus Research Accelerator (2024)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, DaXtra Technologies''s playbook offers a clear template. The lessons below are drawn from DaXtra Technologies''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, DaXtra Technologies''s playbook offers a clear template. The lessons below are drawn from DaXtra Technologies''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daxtra Named an Accelerator (Nucleus Research)', 'https://www.benzinga.com/pressreleases/24/10/g41569699/daxtra-named-an-accelerator-in-nucleus-researchs-2024-standalone-talent-acquisition-technology-val', 46, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australia Now Benefits From DaXtra''s Parsing', 'https://info.daxtra.com/blog/2010/06/20/australia-now-benefits-from-daxtra-parsing', 47, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daxtra Testimonials', 'https://www.daxtra.com/testimonials/', 48, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 14/20: ANNA Money
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'anna-money-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug anna-money-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The UK SME bank that entered Australia by buying rather than building — in its first-ever acquisition',
    tldr = ARRAY['The UK SME bank that entered Australia by buying rather than building — in its first-ever acquisition', 'ANNA Money was founded in London in 2017 by Eduard Panteleev and Alexei Grachev.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Eduard Panteleev', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alexei Grachev', 'Co-founder', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>ANNA Money was founded in London in 2017 by Eduard Panteleev and Alexei Grachev. It built a business current account, corporate card, invoicing, bookkeeping, and tax platform for the 1–19 employee micro-business segment. ANNA serves 70,000+ small businesses in the UK.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>ANNA Money was founded in London in 2017 by Eduard Panteleev and Alexei Grachev. It built a business current account, corporate card, invoicing, bookkeeping, and tax platform for the 1–19 employee micro-business segment. ANNA serves 70,000+ small businesses in the UK.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>March 2024 – Strategic Acquisition of GetCape:</strong> ANNA made its first-ever acquisition and its first international market entry simultaneously, by purchasing Sydney-based GetCape — a business spend management platform and corporate card issuer.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>March 2024 – Strategic Acquisition of GetCape:</strong> ANNA made its first-ever acquisition and its first international market entry simultaneously, by purchasing Sydney-based GetCape — a business spend management platform and corporate card issuer.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>The acquisition gave ANNA: an Australian-regulated entity with licences and infrastructure; a team of Australian fintech experts; an existing customer base; and GetCape founder Ryan Edwards-Pritchard, who stayed on to lead the Australian business under the ANNA brand.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>The acquisition gave ANNA: an Australian-regulated entity with licences and infrastructure; a team of Australian fintech experts; an existing customer base; and GetCape founder Ryan Edwards-Pritchard, who stayed on to lead the Australian business under the ANNA brand.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024–2025 – Building the Combined Product:</strong> ANNA combined its UK capabilities with GetCape''s Australian foundation, building a smart business current account and debit card, followed by invoicing, bookkeeping, GST/BAS-compliant tax calculations, and tax filings — positioning against Australia''s 2.5 million small businesses underserved by the big four banks.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024–2025 – Building the Combined Product:</strong> ANNA combined its UK capabilities with GetCape''s Australian foundation, building a smart business current account and debit card, followed by invoicing, bookkeeping, GST/BAS-compliant tax calculations, and tax filings — positioning against Australia''s 2.5 million small businesses underserved by the big four banks.</p>', 4, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Method</strong>: First-ever acquisition and first international expansion (March 2024)</li><li><strong>Acquired Company</strong>: GetCape, Sydney — business spend management and corporate cards</li><li><strong>ANZ Market Size</strong>: 2.5 million small businesses (1–19 employees)</li><li><strong>Market Growth</strong>: Business spend management: $21B+ globally, growing 11.9% per year</li><li><strong>Retained Leadership</strong>: GetCape founder Ryan Edwards-Pritchard retained as ANZ lead</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Method</strong>: First-ever acquisition and first international expansion (March 2024)</li><li><strong>Acquired Company</strong>: GetCape, Sydney — business spend management and corporate cards</li><li><strong>ANZ Market Size</strong>: 2.5 million small businesses (1–19 employees)</li><li><strong>Market Growth</strong>: Business spend management: $21B+ globally, growing 11.9% per year</li><li><strong>Retained Leadership</strong>: GetCape founder Ryan Edwards-Pritchard retained as ANZ lead</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, ANNA Money''s playbook offers a clear template. The lessons below are drawn from ANNA Money''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, ANNA Money''s playbook offers a clear template. The lessons below are drawn from ANNA Money''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Acquire local knowledge rather than building it</strong> — Look for acqui-hire opportunities in ANZ before deciding to build <em>(GetCape gave ANNA licences, team, customers, expertise in one deal)</em></li><li><strong>Retain the acquired founder</strong> — Local founders bring irreplaceable network and credibility <em>(Ryan Edwards-Pritchard stayed as ANZ lead)</em></li><li><strong>Choose ANZ-specific target markets</strong> — Identify the exact ANZ customer segment your UK model serves best <em>(2.5 million micro-businesses — specifically underserved by big banks)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'UK Fintech Anna.Money expands into Australia with acquisition of GetCape', 'https://newshub.medianet.com.au/2024/03/uk-fintech-anna-money-expands-into-australia-with-acquisition-of-getcape/41061/', 49, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'UK fintech Anna Money acquires Sydney-based GetCape', 'https://www.finextra.com/pressarticle/100024/uk-fintech-anna-money-acquires-sydney-based-getcape', 50, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANNA acquires GetCape in Australia (ANNA blog)', 'https://anna.money/blog/updates/anna-acquires-getcape-in-australia/', 51, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 15/20: Tractable
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'tractable-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug tractable-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The AI that accelerates insurance claims — and found one of its biggest wins at Australia''s largest insurer',
    tldr = ARRAY['The AI that accelerates insurance claims — and found one of its biggest wins at Australia''s largest insurer', 'Tractable was founded in London in 2014 by Alex Dalyac and Razvan Ranca.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "InsurTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Alex Dalyac', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Razvan Ranca', 'Co-founder & CTO', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Tractable was founded in London in 2014 by Alex Dalyac and Razvan Ranca. Its AI analyses photos of damaged cars and properties and recommends whether to write off, repair, or cash-settle, with estimates generated automatically. The company became a unicorn in 2021 after raising $65 million in a Series E led by SoftBank Vision Fund 2, serving 25+ major P&C insurers globally.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Tractable was founded in London in 2014 by Alex Dalyac and Razvan Ranca. Its AI analyses photos of damaged cars and properties and recommends whether to write off, repair, or cash-settle, with estimates generated automatically. The company became a unicorn in 2021 after raising $65 million in a Series E led by SoftBank Vision Fund 2, serving 25+ major P&C insurers globally.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2021 – IAG Australia Partnership:</strong> Tractable''s most significant ANZ milestone was a partnership with Insurance Australia Group (IAG) — Australia''s largest general insurer, covering approximately 70% of the domestic insurance market through NRMA Insurance, CGU, Swann, and WFI.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2021 – IAG Australia Partnership:</strong> Tractable''s most significant ANZ milestone was a partnership with Insurance Australia Group (IAG) — Australia''s largest general insurer, covering approximately 70% of the domestic insurance market through NRMA Insurance, CGU, Swann, and WFI.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>IAG''s COO Neil Morgan explicitly cited AI for claims assessment as a core strategy pillar, using it across direct and intermediated divisions. IAG consolidated its claims handling from 16 platforms to a single Enterprise Platform by 2024, with AI-powered damage assessment as a central design element.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>IAG''s COO Neil Morgan explicitly cited AI for claims assessment as a core strategy pillar, using it across direct and intermediated divisions. IAG consolidated its claims handling from 16 platforms to a single Enterprise Platform by 2024, with AI-powered damage assessment as a central design element.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>Tractable''s Published Performance Benchmarks:</strong> 8-day reduction in cycle times with FNOL Triage; 50% reduction in estimate writing time; 70% of claims reviewed without human involvement; 50% reduction in subrogation report time.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>Tractable''s Published Performance Benchmarks:</strong> 8-day reduction in cycle times with FNOL Triage; 50% reduction in estimate writing time; 70% of claims reviewed without human involvement; 50% reduction in subrogation report time.</p>', 4, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Anchor Client</strong>: IAG — Australia''s largest general insurer</li><li><strong>IAG Market Position</strong>: ~70% of Australian domestic insurance market</li><li><strong>AI Benchmarks</strong>: 8 days cycle time reduction; 50% estimate time saving; 70% touchless review</li><li><strong>Unicorn Status</strong>: $1 billion+ valuation (Series E, 2021)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Anchor Client</strong>: IAG — Australia''s largest general insurer</li><li><strong>IAG Market Position</strong>: ~70% of Australian domestic insurance market</li><li><strong>AI Benchmarks</strong>: 8 days cycle time reduction; 50% estimate time saving; 70% touchless review</li><li><strong>Unicorn Status</strong>: $1 billion+ valuation (Series E, 2021)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Tractable''s playbook offers a clear template. The lessons below are drawn from Tractable''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Tractable''s playbook offers a clear template. The lessons below are drawn from Tractable''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Win the dominant player in the category</strong> — In concentrated industries, the top 1–2 players are worth more than the entire rest <em>(IAG at ~70% of Australian insurance market — not a niche insurer)</em></li><li><strong>Lead with quantified outcomes</strong> — Develop your own outcome benchmarks from global client data <em>(8 days, 50%, 70% — all specific and comparable across insurers)</em></li><li><strong>Target consolidation programmes</strong> — Find ANZ enterprises undergoing platform consolidation <em>(IAG consolidating from 16 to 1 claims platform was the entry point)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tractable: AI Revolutionising Insurance Claims (InsurTech Digital)', 'https://insurtechdigital.com/articles/insurance-claims-ai-unicorn-tractable-closes-65m-series-e', 52, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AI: Extinction or better motor claims? (Insurance Business)', 'https://www.insurancebusinessmag.com/au/news/technology/ai-extinction-or-better-motor-claims-449654.aspx', 53, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IAG lifts lid on CASI, a new AI claims assistant', 'https://www.insurancebusinessmag.com/au/news/claims/iag-lifts-lid-on-casi-a-new-ai-claims-assistant-522369.aspx', 54, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Solutions - Insurers (Tractable)', 'https://tractable.ai/insurers/', 55, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 16/20: Deliveroo
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'deliveroo-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug deliveroo-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The fastest food delivery launch in ANZ history — and the exit that every marketplace founder should study',
    tldr = ARRAY['The fastest food delivery launch in ANZ history — and the exit that every marketplace founder should study', 'Deliveroo was founded in London in 2013 by Will Shu and Greg Orlowski.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Marketplace"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Will Shu', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Greg Orlowski', 'Co-founder', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Deliveroo was founded in London in 2013 by Will Shu and Greg Orlowski. It raised $140M in a Series D in 2016, listed on the London Stock Exchange in 2021, and was acquired by DoorDash in 2025 for £2.9 billion (excluding Australian operations).</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Deliveroo was founded in London in 2013 by Will Shu and Greg Orlowski. It raised $140M in a Series D in 2016, listed on the London Stock Exchange in 2021, and was acquired by DoorDash in 2025 for £2.9 billion (excluding Australian operations).</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2015 – Melbourne and Sydney Launch:</strong> Deliveroo launched in Melbourne in late 2015, establishing its Australian HQ before expanding to Sydney — ahead of Uber Eats and DoorDash in the market.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2015 – Melbourne and Sydney Launch:</strong> Deliveroo launched in Melbourne in late 2015, establishing its Australian HQ before expanding to Sydney — ahead of Uber Eats and DoorDash in the market.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2015–2022 – Growth and Competitive Collapse:</strong> At its peak, Deliveroo serviced 12,000+ restaurants, employed 120 staff, and had 15,000 delivery partners. It expanded into grocery and liquor delivery. However, the arrival of Uber Eats, DoorDash, and a revitalised Menulog created an environment where achieving profitable scale would require "disproportionate investment" with uncertain returns.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2015–2022 – Growth and Competitive Collapse:</strong> At its peak, Deliveroo serviced 12,000+ restaurants, employed 120 staff, and had 15,000 delivery partners. It expanded into grocery and liquor delivery. However, the arrival of Uber Eats, DoorDash, and a revitalised Menulog created an environment where achieving profitable scale would require "disproportionate investment" with uncertain returns.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>November 2022 – Exit:</strong> Deliveroo announced it was ending Australian operations, placing its subsidiary into voluntary administration through KordaMentha. The company''s H1 2022 Australian business represented ~3% of global GTV while negatively impacting EBITDA margins by ~30 basis points.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>November 2022 – Exit:</strong> Deliveroo announced it was ending Australian operations, placing its subsidiary into voluntary administration through KordaMentha. The company''s H1 2022 Australian business represented ~3% of global GTV while negatively impacting EBITDA margins by ~30 basis points.</p>', 4, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Launch Year</strong>: 2015 (Melbourne first)</li><li><strong>Peak Scale</strong>: 12,000 restaurants, 15,000 delivery partners, 120 staff</li><li><strong>Exit Year</strong>: November 2022</li><li><strong>Exit Reason</strong>: Unviable to achieve market leadership without disproportionate investment</li><li><strong>Corporate Outcome</strong>: Parent acquired by DoorDash (2025) for £2.9B — ex-Australia</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Launch Year</strong>: 2015 (Melbourne first)</li><li><strong>Peak Scale</strong>: 12,000 restaurants, 15,000 delivery partners, 120 staff</li><li><strong>Exit Year</strong>: November 2022</li><li><strong>Exit Reason</strong>: Unviable to achieve market leadership without disproportionate investment</li><li><strong>Corporate Outcome</strong>: Parent acquired by DoorDash (2025) for £2.9B — ex-Australia</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Deliveroo''s playbook offers a clear template. The lessons below are drawn from Deliveroo''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Deliveroo''s playbook offers a clear template. The lessons below are drawn from Deliveroo''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>DO: Move fast in first-mover windows</strong> — In platform markets, speed of launch is a competitive weapon <em>(Launched before Uber Eats — captured premium restaurant segment early)</em></li><li><strong>DO: Brand around quality, not price</strong> — A quality positioning creates a defensible niche against price-subsidising rivals <em>(Positioned as premium restaurant delivery)</em></li><li><strong>DON''T: Confuse market share with leadership</strong> — Define leadership before you commit to a market — share alone is not a viable goal <em>(3% GTV at negative EBITDA)</em></li><li><strong>DON''T: Underestimate platform capital requirements</strong> — In two-sided markets, calculate the capital required to win, not just to enter <em>(Needed "disproportionate investment" to win against four global players)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo (Wikipedia)', 'https://en.wikipedia.org/wiki/Deliveroo', 56, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Thousands out of work as delivery pioneer folds its tent and closes', 'https://www.indailyqld.com.au/news/archive/2022/11/17/thousands-out-of-work-as-delivery-pioneer-folds-its-tent-and-closes', 57, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo shuts down in Australia (ACS Information Age)', 'https://ia.acs.org.au/article/2022/deliveroo-shuts-down-in-australia.html', 58, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo announces decision to end operations in Australia', 'https://corporate.deliveroo.co.uk/investors/news/deliveroo-announces-decision-end-operations-australia/', 59, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 17/20: Banked
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'banked-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug banked-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'How a London payments startup partnered with NAB to become the engine behind Australia''s Pay by Bank revolution',
    tldr = ARRAY['How a London payments startup partnered with NAB to become the engine behind Australia''s Pay by Bank revolution', 'Australia''s New Payments Platform (NPP, launched 2018) and Australian Payments Plus (AP+) PayTo scheme provide the national real-time payment infrastructure that makes A2A payments viable at scale.', 'Banked was founded in London in 2018 by Brad Goodall, a former Goldman Sachs and Visa executive.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Brad Goodall', 'Founder & CEO', true);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Banked was founded in London in 2018 by Brad Goodall, a former Goldman Sachs and Visa executive. It built an account-to-account (A2A) payments network — technology that allows consumers and businesses to pay directly from their bank account to a merchant, bypassing card networks and their 1–3% interchange fees. Investors include NAB Ventures, Citi Ventures, and Insight Partners.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Banked was founded in London in 2018 by Brad Goodall, a former Goldman Sachs and Visa executive. It built an account-to-account (A2A) payments network — technology that allows consumers and businesses to pay directly from their bank account to a merchant, bypassing card networks and their 1–3% interchange fees. Investors include NAB Ventures, Citi Ventures, and Insight Partners.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia''s New Payments Platform (NPP, launched 2018) and Australian Payments Plus (AP+) PayTo scheme provide the national real-time payment infrastructure that makes A2A payments viable at scale. NAB processes around 40% of all A2A payments via NPP — making it the dominant A2A bank in Australia.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia''s New Payments Platform (NPP, launched 2018) and Australian Payments Plus (AP+) PayTo scheme provide the national real-time payment infrastructure that makes A2A payments viable at scale. NAB processes around 40% of all A2A payments via NPP — making it the dominant A2A bank in Australia.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022 – NAB Ventures Investment:</strong> NAB Ventures participated in Banked''s $15M Series A extension alongside Citi Ventures and Insight Partners — a strategic investment to build out NAB''s PayTo merchant capability.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022 – NAB Ventures Investment:</strong> NAB Ventures participated in Banked''s $15M Series A extension alongside Citi Ventures and Insight Partners — a strategic investment to build out NAB''s PayTo merchant capability.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>May 2024 – Pay by Bank Commercial Launch:</strong> Banked and NAB launched Pay by Bank commercially for Australian merchants, using AP+''s PayTo services. The first cohort of NAB business customers went live in H1 2024 across e-commerce, retail, and non-bank lenders.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>May 2024 – Pay by Bank Commercial Launch:</strong> Banked and NAB launched Pay by Bank commercially for Australian merchants, using AP+''s PayTo services. The first cohort of NAB business customers went live in H1 2024 across e-commerce, retail, and non-bank lenders.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p>Brad Goodall cited Australia''s "well-constructed regulatory mandates and industry primed for innovation" as the foundation for rapid A2A growth.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Brad Goodall cited Australia''s "well-constructed regulatory mandates and industry primed for innovation" as the foundation for rapid A2A growth.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Partner</strong>: National Australia Bank (NAB)</li><li><strong>NAB''s A2A Position</strong>: 40% of all NPP payments in Australia</li><li><strong>Investment</strong>: NAB Ventures invested in $15M Series A extension (2022)</li><li><strong>Commercial Launch</strong>: H1 2024 — NAB merchant customers live with Pay by Bank</li><li><strong>Investor Base</strong>: NAB Ventures, Citi Ventures, Insight Partners</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Partner</strong>: National Australia Bank (NAB)</li><li><strong>NAB''s A2A Position</strong>: 40% of all NPP payments in Australia</li><li><strong>Investment</strong>: NAB Ventures invested in $15M Series A extension (2022)</li><li><strong>Commercial Launch</strong>: H1 2024 — NAB merchant customers live with Pay by Bank</li><li><strong>Investor Base</strong>: NAB Ventures, Citi Ventures, Insight Partners</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Banked''s playbook offers a clear template. The lessons below are drawn from Banked''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Banked''s playbook offers a clear template. The lessons below are drawn from Banked''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Take strategic investment from your target partner</strong> — In ANZ financial services, take investment from the bank you most want to partner with <em>(NAB Ventures → NAB commercial partnership)</em></li><li><strong>Enter via national infrastructure, not a single use case</strong> — Embed in national infrastructure first; use cases follow <em>(PayTo/NPP gives access to the whole Australian payments system)</em></li><li><strong>Let the bank''s customers be your distribution</strong> — Your ANZ partner''s customers should be your first customers <em>(NAB''s 7M+ PayTo-enabled accounts are Banked''s addressable market)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Banked and NAB join hands to accelerate Pay by Bank adoption', 'https://thedigitalbanker.com/banked-and-nab-join-hands-to-accelerate-pay-by-bank-adoption-in-australia/', 60, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NAB aims to fast-track merchant payments (iTnews)', 'https://www.itnews.com.au/news/nab-aims-to-fast-track-merchant-payments-607764', 61, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NAB launch Pay by Bank in Australia', 'https://paymentsindustryintelligence.com/nab-launch-pay-by-bank-in-australia/', 62, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 18/20: NCC Group
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'ncc-group-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug ncc-group-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The Manchester cybersecurity firm that planted its flag in Australia as part of a $130M UK tech wave',
    tldr = ARRAY['The Manchester cybersecurity firm that planted its flag in Australia as part of a $130M UK tech wave', 'NCC Group is a global information assurance company headquartered in Manchester, founded in 1999.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>NCC Group is a global information assurance company headquartered in Manchester, founded in 1999. It provides cybersecurity consulting, penetration testing, software escrow, and cyber incident response services to government, critical infrastructure, and large enterprise clients. It employs 2,000+ staff across UK, North America, APAC, and Europe, and is listed on the London Stock Exchange.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>NCC Group is a global information assurance company headquartered in Manchester, founded in 1999. It provides cybersecurity consulting, penetration testing, software escrow, and cyber incident response services to government, critical infrastructure, and large enterprise clients. It employs 2,000+ staff across UK, North America, APAC, and Europe, and is listed on the London Stock Exchange.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017 – Coordinated UK Tech Entry:</strong> NCC Group established Australian operations in 2017 as part of the coordinated $130 million UK tech wave with Blue Prism, Contino, and two other companies, supported by the Australian Trade and Investment Commission and the UK DIT. The coordinated announcement generated significant government visibility.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017 – Coordinated UK Tech Entry:</strong> NCC Group established Australian operations in 2017 as part of the coordinated $130 million UK tech wave with Blue Prism, Contino, and two other companies, supported by the Australian Trade and Investment Commission and the UK DIT. The coordinated announcement generated significant government visibility.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2017–2024 – Government and Critical Infrastructure Focus:</strong> NCC Group built its Australian practice around government, critical infrastructure (energy, water, transport, financial systems), and large enterprise — the segments where its global expertise is most directly applicable.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2017–2024 – Government and Critical Infrastructure Focus:</strong> NCC Group built its Australian practice around government, critical infrastructure (energy, water, transport, financial systems), and large enterprise — the segments where its global expertise is most directly applicable.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>September 2025 – Contributing to Australian Cyber Strategy:</strong> NCC Group formally submitted to the Australian Government''s Horizon 2 Cyber Security Strategy consultation, advocating for an AI Act for Australia, post-quantum cryptography roadmaps, extended Cyber Trust Mark requirements, and a national cyber skills strategy. This positions NCC Group as a strategic advisor to Australian government, not merely a vendor.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>September 2025 – Contributing to Australian Cyber Strategy:</strong> NCC Group formally submitted to the Australian Government''s Horizon 2 Cyber Security Strategy consultation, advocating for an AI Act for Australia, post-quantum cryptography roadmaps, extended Cyber Trust Mark requirements, and a national cyber skills strategy. This positions NCC Group as a strategic advisor to Australian government, not merely a vendor.</p>', 4, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Year</strong>: 2017 (coordinated UK tech wave)</li><li><strong>ANZ Focus</strong>: Government, critical infrastructure, large enterprise</li><li><strong>Policy Engagement</strong>: Submitted to 2025 Australian Cyber Security Strategy consultation</li><li><strong>Global Scale</strong>: 2,000+ staff; UK, North America, APAC, Europe</li><li><strong>LSE Listed</strong>: Yes</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Year</strong>: 2017 (coordinated UK tech wave)</li><li><strong>ANZ Focus</strong>: Government, critical infrastructure, large enterprise</li><li><strong>Policy Engagement</strong>: Submitted to 2025 Australian Cyber Security Strategy consultation</li><li><strong>Global Scale</strong>: 2,000+ staff; UK, North America, APAC, Europe</li><li><strong>LSE Listed</strong>: Yes</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, NCC Group''s playbook offers a clear template. The lessons below are drawn from NCC Group''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, NCC Group''s playbook offers a clear template. The lessons below are drawn from NCC Group''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Enter with government support and peer companies</strong> — Approach Austrade and DIT about coordinated multi-company entry <em>($130M UK tech wave gave NCC Group credibility with media and government)</em></li><li><strong>Build government credibility through policy engagement</strong> — Submit to government consultations in your sector; become a recognised policy voice <em>(Contributing to Australia''s Cyber Security Strategy consultation)</em></li><li><strong>Align to national strategic frameworks</strong> — Read government strategies in your sector — they are procurement roadmaps <em>(Australia''s 2023–2030 Cyber Security Strategy is a demand roadmap)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, '5 UK tech providers ploughed $130M into Australia during 2017', 'https://www.arnnet.com.au/article/1265281/5-uk-tech-providers-ploughed-130m-into-australia-during-2017.html', 37, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NCC Group (Wikipedia)', 'https://en.wikipedia.org/wiki/NCC_Group', 63, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NCC Group inputs into next phase of Australia''s Cyber Security Strategy', 'https://www.nccgroup.com/newsroom/ncc-group-inputs-into-next-phase-of-australia-s-cyber-security-strategy/', 64, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 19/20: Contino
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'contino-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug contino-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The DevOps consultancy that opened in Melbourne in January 2017, acquired an Australian company in April 2018, and sold to IBM''s Cognizant in 2019',
    tldr = ARRAY['The DevOps consultancy that opened in Melbourne in January 2017, acquired an Australian company in April 2018, and sold to IBM''s Cognizant in 2019', 'Contino was founded in London in 2014 by Matt Farmer and William Martin — former investment banking tech executives.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cloud / DevOps"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 3,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Matt Farmer', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'William Martin', 'Co-founder', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Contino was founded in London in 2014 by Matt Farmer and William Martin — former investment banking tech executives. It built a cloud and DevOps transformation consultancy, helping large enterprises adopt continuous deployment, cloud-native architecture, and automated testing. Contino was acquired by Cognizant in 2019 — just two years after entering Australia.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Contino was founded in London in 2014 by Matt Farmer and William Martin — former investment banking tech executives. It built a cloud and DevOps transformation consultancy, helping large enterprises adopt continuous deployment, cloud-native architecture, and automated testing. Contino was acquired by Cognizant in 2019 — just two years after entering Australia.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>January 2017 – Melbourne First Office:</strong> Contino first established operations in Australia in early 2017, opening its first trans-Tasman office in Melbourne. Its UK-based DevOps principal consultant Daniel Williams was appointed APAC Director of Engineering and relocated to Melbourne. This was part of the broader $130M UK tech investment wave.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>January 2017 – Melbourne First Office:</strong> Contino first established operations in Australia in early 2017, opening its first trans-Tasman office in Melbourne. Its UK-based DevOps principal consultant Daniel Williams was appointed APAC Director of Engineering and relocated to Melbourne. This was part of the broader $130M UK tech investment wave.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>April 2018 – Nebulr Acquisition:</strong> Just 15 months after opening in Melbourne, Contino acquired Nebulr — a 50-person Australian DevOps and cloud consultancy in Melbourne and Sydney with three of Australia''s largest banks as clients. Nebulr CEO Craig Howe became APAC Managing Director. The merged APAC team totalled 65 staff.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>April 2018 – Nebulr Acquisition:</strong> Just 15 months after opening in Melbourne, Contino acquired Nebulr — a 50-person Australian DevOps and cloud consultancy in Melbourne and Sydney with three of Australia''s largest banks as clients. Nebulr CEO Craig Howe became APAC Managing Director. The merged APAC team totalled 65 staff.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2018–2019 – ANZ Client Portfolio:</strong> Following the acquisition, Contino built a portfolio including NAB, UBank, Bendigo Bank, and one of Australia''s largest universities, delivering cloud transformation, data analytics, and Consumer Data Right implementation programs.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2018–2019 – ANZ Client Portfolio:</strong> Following the acquisition, Contino built a portfolio including NAB, UBank, Bendigo Bank, and one of Australia''s largest universities, delivering cloud transformation, data analytics, and Consumer Data Right implementation programs.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2019 – Cognizant Acquisition:</strong> Contino was acquired by Cognizant — one of the world''s largest IT services firms. The ANZ client base — three of Australia''s largest banks — was central to the acquisition rationale.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2019 – Cognizant Acquisition:</strong> Contino was acquired by Cognizant — one of the world''s largest IT services firms. The ANZ client base — three of Australia''s largest banks — was central to the acquisition rationale.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Date</strong>: January 2017 (Melbourne)</li><li><strong>First Acquisition</strong>: Nebulr (50-person Australian DevOps firm, April 2018)</li><li><strong>ANZ Bank Clients</strong>: Three of Australia''s largest banks post-Nebulr</li><li><strong>Notable Clients</strong>: NAB, UBank, Bendigo Bank</li><li><strong>Time Entry → Exit</strong>: ~2 years (entry Jan 2017; sold to Cognizant 2019)</li><li><strong>Acquirer</strong>: Cognizant</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Date</strong>: January 2017 (Melbourne)</li><li><strong>First Acquisition</strong>: Nebulr (50-person Australian DevOps firm, April 2018)</li><li><strong>ANZ Bank Clients</strong>: Three of Australia''s largest banks post-Nebulr</li><li><strong>Notable Clients</strong>: NAB, UBank, Bendigo Bank</li><li><strong>Time Entry → Exit</strong>: ~2 years (entry Jan 2017; sold to Cognizant 2019)</li><li><strong>Acquirer</strong>: Cognizant</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Contino''s playbook offers a clear template. The lessons below are drawn from Contino''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Contino''s playbook offers a clear template. The lessons below are drawn from Contino''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Accelerate through acquisition</strong> — If organic growth is too slow, find the ANZ company that already has your ideal client base <em>(Nebulr gave 50 staff, 3 banks, 2 cities in one deal)</em></li><li><strong>Hire local leadership, not expats</strong> — Local professional services leadership with local relationships is non-negotiable <em>(Daniel Williams relocated; Craig Howe (Nebulr CEO) became APAC MD)</em></li><li><strong>Make your ANZ story an exit catalyst</strong> — A credible ANZ enterprise client base can accelerate your exit by demonstrating global market appeal <em>(Three Australian big banks → Cognizant acquisition in 2 years)</em></li><li><strong>Open Melbourne before Sydney</strong> — Don''t default to Sydney; Melbourne is Australia''s technology and financial services capital <em>(Financial services, government — Melbourne is the equal of Sydney)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Contino steps up Australian play with Nebulr acquisition (ARN)', 'https://www.arnnet.com.au/article/1266156/contino-steps-up-australian-play-with-nebulr-acquisition.html', 65, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Contino Acquires Australian DevOps Leaders Nebulr', 'https://www.contino.io/insights/contino-acquires-australian-devops-leaders-nebulr-to-accelerate-growth-in-apac-region', 66, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Case Studies (Contino)', 'https://www.contino.io/case-studies', 67, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 20/20: Sensat
DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'sensat-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug sensat-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The UK construction digital twin startup that came to Sydney with government support — and became Australia''s infrastructure visualisation platform',
    tldr = ARRAY['The UK construction digital twin startup that came to Sydney with government support — and became Australia''s infrastructure visualisation platform', 'Australia is in a generational infrastructure boom — hundreds of billions in committed government infrastructure investment — with project delivery that involves large, geographically distributed consortia who need current, accurate project data.', 'Sensat was founded in London in 2017 by Rob Bhatt and James Dean.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 3,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Rob Bhatt', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'James Dean', 'Co-founder', false);
  END IF;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>Sensat was founded in London in 2017 by Rob Bhatt and James Dean. It built a digital twin and spatial data visualisation platform (Mapp) for infrastructure projects, allowing construction teams to interact with a unified digital replica of their project site integrating BIM, GIS, reality capture data, and project management in one cloud platform. Sensat was recognised as the UK''s #2 startup by Tech Nation in 2023.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Sensat was founded in London in 2017 by Rob Bhatt and James Dean. It built a digital twin and spatial data visualisation platform (Mapp) for infrastructure projects, allowing construction teams to interact with a unified digital replica of their project site integrating BIM, GIS, reality capture data, and project management in one cloud platform. Sensat was recognised as the UK''s #2 startup by Tech Nation in 2023.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia is in a generational infrastructure boom — hundreds of billions in committed government infrastructure investment — with project delivery that involves large, geographically distributed consortia who need current, accurate project data. Australia''s existing spatial and infrastructure management tools are fragmented.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia is in a generational infrastructure boom — hundreds of billions in committed government infrastructure investment — with project delivery that involves large, geographically distributed consortia who need current, accurate project data. Australia''s existing spatial and infrastructure management tools are fragmented.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2021 – Tech Nation Digital Trade Network:</strong> Sensat entered Australia through the UK Government''s Tech Nation Digital Trade Network — a programme that arranged market introductions and removed cold-start friction before Sensat arrived in Sydney.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2021 – Tech Nation Digital Trade Network:</strong> Sensat entered Australia through the UK Government''s Tech Nation Digital Trade Network — a programme that arranged market introductions and removed cold-start friction before Sensat arrived in Sydney.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022–2023 – Sydney Office and ANZ GM:</strong> Sensat established a Sydney office as its first international location. In May 2023, Andy Lake was hired as General Manager Australia and New Zealand, with an explicit mandate to "establish all GTM capabilities for the ANZ market."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022–2023 – Sydney Office and ANZ GM:</strong> Sensat established a Sydney office as its first international location. In May 2023, Andy Lake was hired as General Manager Australia and New Zealand, with an explicit mandate to "establish all GTM capabilities for the ANZ market."</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2023 – UK''s #2 Startup:</strong> Tech Nation recognised Sensat as the UK''s #2 startup in 2023, amplifying its brand in ANZ enterprise sales conversations.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2023 – UK''s #2 Startup:</strong> Tech Nation recognised Sensat as the UK''s #2 startup in 2023, amplifying its brand in ANZ enterprise sales conversations.</p>', 5, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Entry Vehicle</strong>: Tech Nation Digital Trade Network (UK Government-backed)</li><li><strong>ANZ Office</strong>: Sydney (first international location)</li><li><strong>ANZ GM</strong>: Andy Lake appointed May 2023</li><li><strong>UK Recognition</strong>: UK''s #2 startup (Tech Nation, 2023)</li><li><strong>Market Focus</strong>: Construction, transport, infrastructure, utilities</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Entry Vehicle</strong>: Tech Nation Digital Trade Network (UK Government-backed)</li><li><strong>ANZ Office</strong>: Sydney (first international location)</li><li><strong>ANZ GM</strong>: Andy Lake appointed May 2023</li><li><strong>UK Recognition</strong>: UK''s #2 startup (Tech Nation, 2023)</li><li><strong>Market Focus</strong>: Construction, transport, infrastructure, utilities</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Sensat''s playbook offers a clear template. The lessons below are drawn from Sensat''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Sensat''s playbook offers a clear template. The lessons below are drawn from Sensat''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Use government-backed trade programmes</strong> — Apply for Austrade/DIT trade delegation programmes — introductions are worth months of cold outreach <em>(Tech Nation Digital Trade Network provided market introductions)</em></li><li><strong>Hire an ANZ GM before you have clients</strong> — The ANZ GM should build the market before being expected to revenue-produce <em>(Andy Lake appointed to "establish GTM capabilities" — not just close deals)</em></li><li><strong>Use tech recognition as a sales tool</strong> — Submit to Tech Nation, Deloitte Fast 50, KPMG Tech Innovator and other recognised rankings <em>("UK''s #2 startup" carries weight in ANZ enterprise)</em></li><li><strong>Open platform beats walled garden</strong> — In enterprise B2B, reduce integration friction by connecting to existing workflows <em>(Sensat integrates with existing tools rather than replacing them)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Andy Lake (LinkedIn) — ANZ GM appointment for Sensat', 'https://www.linkedin.com/in/andylake1', 68, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'North East Link - Victoria''s Big Build', 'https://bigbuild.vic.gov.au/projects/north-east-link', 69, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
