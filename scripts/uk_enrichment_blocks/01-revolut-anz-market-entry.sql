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
