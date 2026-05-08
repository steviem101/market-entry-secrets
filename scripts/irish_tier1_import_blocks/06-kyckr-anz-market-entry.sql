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
    'kyckr-anz-market-entry', 'How Kyckr Entered the ANZ Market', 'How a Waterford-founded company registry intelligence startup used the Australian Securities Exchange not just as a capital-raising tool but as a market-entry strategy — gaining Australian institutional credibility, local investor visibility, and a listed-company governance structure that resonated with its compliance-focused customers.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['How a Waterford-founded company registry intelligence startup used the Australian Securities Exchange not just as a capital-raising tool but as a market-entry strategy — gaining Australian institutional credibility, local investor visibility, and a listed-company governance structure that resonated with its compliance-focused customers.', 'Kyckr was founded in Waterford in March 2007 by Ben Cronin, Rob Leslie, John Murray and Richard Wood.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Kyckr', 'Ireland', 'Australia & New Zealand',
      '2016-01-01', 'RegTech', 4, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Ben Cronin', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Rob Leslie', 'Co-founder', false);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'John Murray', 'Co-founder', false);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Richard Wood', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Kyckr was founded in Waterford in March 2007 by Ben Cronin, Rob Leslie, John Murray and Richard Wood. The company built a real-time registry intelligence platform that gave compliance teams at banks, financial institutions and corporates direct access to official company registry data across 300+ jurisdictions — removing the need to manually check registries or rely on outdated static databases.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Kyckr was founded in Waterford in March 2007 by Ben Cronin, Rob Leslie, John Murray and Richard Wood. The company built a real-time registry intelligence platform that gave compliance teams at banks, financial institutions and corporates direct access to official company registry data across 300+ jurisdictions — removing the need to manually check registries or rely on outdated static databases.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Its core product addressed a genuine compliance burden: banks performing KYC, AML and onboarding checks needed accurate, current company ownership and incorporation data at speed. Kyckr automated this by connecting directly to primary regulatory sources.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Its core product addressed a genuine compliance burden: banks performing KYC, AML and onboarding checks needed accurate, current company ownership and incorporation data at speed. Kyckr automated this by connecting directly to primary regulatory sources.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>In September 2016, Kyckr listed on the Australian Securities Exchange under the ticker KYK, raising A$5 million with a fully diluted market capitalisation of approximately A$26 million. Enterprise Ireland had backed the company with a €250,000 investment ahead of the listing.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In September 2016, Kyckr listed on the Australian Securities Exchange under the ticker KYK, raising A$5 million with a fully diluted market capitalisation of approximately A$26 million. Enterprise Ireland had backed the company with a €250,000 investment ahead of the listing.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p>This was not a conventional market-entry play. Kyckr was not simply raising capital on a convenient exchange. It was choosing to make Australia its listed domicile — which gave it Australian institutional shareholder support, regular ASX reporting obligations, and a profile in the Australian financial services sector precisely where its target customers operated. For a compliance-focused product, being a listed entity with transparent public reporting was itself a trust signal.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>This was not a conventional market-entry play. Kyckr was not simply raising capital on a convenient exchange. It was choosing to make Australia its listed domicile — which gave it Australian institutional shareholder support, regular ASX reporting obligations, and a profile in the Australian financial services sector precisely where its target customers operated. For a compliance-focused product, being a listed entity with transparent public reporting was itself a trust signal.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p><em>A public listing is not just a capital event. For a compliance-first product, it can be a trust signal, a market-entry mechanism and a talent-attraction tool — all at the same time.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>A public listing is not just a capital event. For a compliance-first product, it can be a trust signal, a market-entry mechanism and a talent-attraction tool — all at the same time.</em></p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>After listing, Kyckr grew its product to cover more than 120 million businesses from 300-plus primary regulatory sources across more than 100 countries. In FY2017 it reported $1.54 million in revenue, up 34%. By FY2019 revenue had reached $2.14 million, representing growth of more than 25%. Clients included Citi Commercial Bank and Commerzbank.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>After listing, Kyckr grew its product to cover more than 120 million businesses from 300-plus primary regulatory sources across more than 100 countries. In FY2017 it reported $1.54 million in revenue, up 34%. By FY2019 revenue had reached $2.14 million, representing growth of more than 25%. Clients included Citi Commercial Bank and Commerzbank.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>In November 2022, Richard White — the founder of WiseTech Global, one of Australia''s most successful technology companies — completed the acquisition of the remaining 77.24% stake in Kyckr he did not already own and delisted the company. The acquisition validated Kyckr''s technology and validated the ANZ market-entry approach by attracting strategic attention from one of Australia''s most respected technology founders.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>In November 2022, Richard White — the founder of WiseTech Global, one of Australia''s most successful technology companies — completed the acquisition of the remaining 77.24% stake in Kyckr he did not already own and delisted the company. The acquisition validated Kyckr''s technology and validated the ANZ market-entry approach by attracting strategic attention from one of Australia''s most respected technology founders.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, Kyckr''s playbook offers a clear template. The lessons below distil Kyckr''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, Kyckr''s playbook offers a clear template. The lessons below distil Kyckr''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use capital markets as an entry mechanism</strong> — Listed on ASX to gain Australian institutional credibility alongside capital. <em>(In regulated B2B sectors, a public listing can be more effective than a sales office. It makes trust transparent and permanent.)</em></li><li><strong>Match the entry mechanism to the product''s trust requirements</strong> — A compliance product for banks needed to demonstrate governance. A listed company structure did exactly that. <em>(Think about what signal your customers need most and choose an entry mechanism that delivers it.)</em></li><li><strong>Build toward strategic acquirers</strong> — Kyckr''s data infrastructure attracted WiseTech founder Richard White as a personal acquirer. <em>(If your product is genuinely valuable infrastructure, ANZ exits to global tech leaders are achievable.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Use capital markets as an entry mechanism</strong> — Listed on ASX to gain Australian institutional credibility alongside capital. <em>(In regulated B2B sectors, a public listing can be more effective than a sales office. It makes trust transparent and permanent.)</em></li><li><strong>Match the entry mechanism to the product''s trust requirements</strong> — A compliance product for banks needed to demonstrate governance. A listed company structure did exactly that. <em>(Think about what signal your customers need most and choose an entry mechanism that delivers it.)</em></li><li><strong>Build toward strategic acquirers</strong> — Kyckr''s data infrastructure attracted WiseTech founder Richard White as a personal acquirer. <em>(If your product is genuinely valuable infrastructure, ANZ exits to global tech leaders are achievable.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fora.ie — Kyckr ASX IPO announcement (Sept 2016)', 'https://fora.ie/kyckr-waterford-ipo-2968390-Sep2016/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'MarketScreener — Richard White acquires remaining Kyckr stake (Nov 2022)', 'https://in.marketscreener.com/quote/stock/KYCKR-LIMITED-27546659/news/Richard-White-completed-the-acquisition-of-the-remaining-77.24-stake-in-Kyckr-Limited-42171348/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Addisons — Kyckr ASX KYK acquisition by RealWise (legal announcement)', 'https://addisons.com/announcement/addisons-advises-kyckr-asx-kyk-on-its-acquisition-by-realwise/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wikipedia — Kyckr company article', 'https://en.wikipedia.org/wiki/Kyckr', 4, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Finovate — Kyckr archive (product and financial service context)', 'https://finovate.com/category/kyckr/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
