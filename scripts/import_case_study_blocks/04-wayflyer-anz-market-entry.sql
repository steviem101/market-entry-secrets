DO $do_block$
DECLARE
  v_id uuid;
  v_sec_0 uuid;
  v_sec_1 uuid;
  v_sec_2 uuid;
  v_sec_3 uuid;
BEGIN
  INSERT INTO content_items (
    slug, title, subtitle, category_id, content_type, status, featured,
    read_time, tldr, quick_facts, researched_by, style_version
  ) VALUES (
    'wayflyer-anz-market-entry', 'How Wayflyer Entered the ANZ Market: Funding Growth at the Speed of E-Commerce — Wayflyer''s Australian Playbook', 'Funding Growth at the Speed of E-Commerce — Wayflyer''s Australian Playbook',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Sydney office established in 2021', 'AUD$60 million deployed to 150+ Australian brands by early 2022', 'Strong set of Australian customer examples and success stories', 'Global scale of $5 billion deployed across 5,000+ brands in 11 countries', 'Institutional capital support from major global lenders']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "2019"}, {"icon": "MapPin", "label": "HQ", "value": "Dublin, Ireland"}, {"icon": "Globe", "label": "ANZ Entry", "value": "2021 (Sydney)"}, {"icon": "Briefcase", "label": "Sector", "value": "Revenue-Based Financing / E-Commerce Growth Capital"}]'::jsonb, 'Stephen Browne', 2
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
    -- explicit NULLs for is_profitable and employee_count to override misleading column defaults
    INSERT INTO content_company_profiles (
      content_id, company_name, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Wayflyer', 'Ireland', 'Australia & New Zealand',
      '2021 (Sydney)', 'Revenue-Based Financing / E-Commerce Growth Capital', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Aidan Corbett', 'Founder', true
    );
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Jack Pierse', 'Founder', false
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Wayflyer was founded in Dublin in 2019 to provide non-dilutive growth capital to e-commerce brands, using sales performance data to underwrite advances for inventory and marketing. The company scaled quickly, reaching unicorn status in 2022 and later reporting €95.2 million in FY2024 revenue.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia was identified early as a high-priority expansion market because e-commerce brands there faced the same working-capital gaps as sellers in larger markets, but had fewer tailored funding options. The local market was digitally mature and full of growing direct-to-consumer brands that needed fast access to inventory and marketing capital.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Wayflyer launched in Australia in 2021 and established a Sydney office at 100 Market Street, giving it a true local operating base rather than just offshore support. By early 2022, it had already deployed AUD$60 million to more than 150 Australian e-commerce brands. Named Australian customers and examples from Wayflyer-linked storytelling include AMR Hair & Beauty, Bhumi Organic Cotton, Petz Park, Stax, King Kong Apparel, Black Swallow, and Bohemian Traders.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Wayflyer''s advantage was not only product design but capital access. Its large debt facilities, including funding from J.P. Morgan and later ATLAS SP Partners, helped it compete more effectively on speed and scale in markets like Australia. Its infrastructure partnerships also helped it deploy capital efficiently across markets.</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>By 2025, Wayflyer had deployed $5 billion to more than 5,000 brands across 11 countries, showing that its operating model could scale globally while continuing to support ANZ growth.</p>', 3, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Key results from this market entry include the following milestones.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Sydney office established in 2021</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>AUD$60 million deployed to 150+ Australian brands by early 2022</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Strong set of Australian customer examples and success stories</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Global scale of $5 billion deployed across 5,000+ brands in 11 countries</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Institutional capital support from major global lenders</p>', 6, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Several repeatable plays stand out from Wayflyer''s ANZ entry.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Enter ANZ early in the company journey.</strong> Wayflyer treated Australia as a core growth market, not a late add-on</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Put a real team on the ground.</strong> A Sydney office improved trust, responsiveness, and customer acquisition</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Lead with outcome stories from local brands.</strong> Australian merchant stories made the model tangible</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Bring global capital into local SME gaps.</strong> Large facilities helped Wayflyer compete where banks were underserving the market</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Position ANZ merchants as part of a global commerce network.</strong> Cross-border relevance strengthened the value proposition</p>', 6, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'What is Brief History of Wayflyer Company?', 'https://canvasbusinessmodel.com/blogs/brief-history/wayflyer-brief-history', 1, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'How Wayflyer can help your eCommerce brand reach new heights', 'https://wayflyer.com/au/blog/with-successful-seed-funding-round-wayflyer-is-growing-to-meet-brands-needs-and-global-demand', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Ireland fintech firm Wayflyer eyes up Aussie eCommerce market boom', 'https://ecommercenews.com.au/story/ireland-fintech-firm-wayflyer-eyes-up-aussie-ecommerce-market-boom', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'About Wayflyer | Purpose-Built Financing for Consumer Brands', 'https://wayflyer.com/au/about-us', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eCommerce Financing | Customer Stories | Bohemian Traders', 'https://wayflyer.com/our-customers/bohemian-traders', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Funding Ecommerce Freedom: The Wayflyer Story | Add To Cart Podcast', 'https://www.youtube.com/watch?v=fZgvRXpII-k', 6, 'podcast')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wayflyer secures $300m in debt financing from J.P. Morgan', 'https://wayflyer.com/au/press-releases/j-p-morgan', 7, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Irish unicorn Wayflyer lands new $250m credit facility agreement', 'https://www.fintechfutures.com/commercial-sme-lending/irish-unicorn-wayflyer-lands-new-250m-credit-facility-agreement', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wayflyer case study - Stripe', 'https://stripe.com/customers/wayflyer', 9, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wayflyer marks fifth anniversary after deploying $5 Billion to 5000+ businesses', 'https://wayflyer.com/press-releases/fifth-anniversary', 10, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
