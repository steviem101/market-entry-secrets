DO $do_block$
DECLARE
  v_id uuid;
  v_sec_0 uuid;
  v_sec_1 uuid;
  v_sec_2 uuid;
  v_sec_3 uuid;
  v_sec_4 uuid;
BEGIN
  INSERT INTO content_items (
    slug, title, subtitle, category_id, content_type, status, featured,
    read_time, tldr, quick_facts, researched_by, style_version
  ) VALUES (
    'fenergo-anz-market-entry', 'How Fenergo Entered the ANZ Market: Regulatory Urgency as a Wedge — How Fenergo Won Four of Australia''s Biggest Banks', 'Regulatory Urgency as a Wedge — How Fenergo Won Four of Australia''s Biggest Banks',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Formal APAC entry via Sydney in 2014', 'Four of Australia''s top five banks selected Fenergo by 2017', 'Sydney used as the foundation for wider APAC expansion', 'Strong financial performance and ongoing global expansion']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "2009"}, {"icon": "MapPin", "label": "HQ", "value": "Dublin, Ireland"}, {"icon": "Globe", "label": "ANZ Entry", "value": "September 2014 (Sydney)"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech / Client Lifecycle Management"}]'::jsonb, 'Stephen Browne', 2
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
      entry_date, industry, founder_count
    ) VALUES (
      v_id, 'Fenergo', 'Ireland', 'Australia & New Zealand',
      'September 2014 (Sydney)', 'RegTech / Client Lifecycle Management', 3
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Marc Murphy', 'Founder', true
    );
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Philip Burke', 'Founder', false
    );
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Cian Kinsella', 'Founder', false
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Fenergo was founded in Dublin in 2009 to help financial institutions digitise client lifecycle management, including onboarding, KYC, AML, and ongoing regulatory compliance. Its growth has been driven by increasing compliance complexity across global financial markets, and by FY2025 it reported €149.4 million in revenue and €21.1 million in profit before tax.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia offered concentrated demand because its major banks faced escalating AML, KYC, and regulatory scrutiny, especially in the broader context of AUSTRAC enforcement and the Royal Commission era. A small number of top-tier banking wins in Australia could create outsized regional credibility because the market is dominated by a few large institutions.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Fenergo formally entered APAC in September 2014 by setting up a local team in Sydney during an Enterprise Ireland trade mission to Australia. The company hired Brett Hodge as Head of Sales for APAC, bringing years of regional financial services experience into the business from the start.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Its pitch to Australian banks centred on solving urgent compliance pain: automating onboarding, reducing KYC and AML friction, and helping institutions cope with growing regulatory change. By October 2017, Fenergo had been selected by four of Australia''s top five banks, including institutions such as Westpac, Macquarie, ANZ Bank, Commonwealth Bank, and NAB in its APAC customer story.</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Fenergo also used a “community approach” in Australia, bringing banks together to shape regulatory rule interpretations and product evolution, which increased buy-in and created higher switching costs. Sydney then became the base for broader APAC expansion, with Singapore opening in 2016 and additional expansion into Japan following later.</p>', 3, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Key results from this market entry include the following milestones.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Formal APAC entry via Sydney in 2014</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Four of Australia''s top five banks selected Fenergo by 2017</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Sydney used as the foundation for wider APAC expansion</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Strong financial performance and ongoing global expansion</p>', 5, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Fenergo''s ANZ market entry was not without friction. The journey involved navigating regulatory pressure, competitive dynamics, or capital and resourcing constraints typical of cross-border expansion.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those headwinds required disciplined execution: aligning local hires with regulatory expectations, validating the proposition with anchor customers, and committing capital to in-market presence rather than relying on remote sales support.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>Several repeatable plays stand out from Fenergo''s ANZ entry.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Enter when pain is urgent, not abstract.</strong> Regulatory pressure made the purchase non-optional for banks</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Use trade-mission momentum.</strong> Enterprise Ireland support improved market access and credibility</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Hire a senior local first employee.</strong> Deep local market knowledge accelerated enterprise sales</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Turn customers into a compliance community.</strong> Shared rule-building created loyalty and product depth</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Use Sydney as an APAC launchpad.</strong> A strong Australian base enabled further regional expansion</p>', 6, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'What is Brief History of Fenergo Company?', 'https://canvasbusinessmodel.com/blogs/brief-history/fenergo-brief-history', 1, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fenergo''s profits almost double as Irish fintech continues to expand', 'https://resources.fenergo.com/newsroom/fenergo-profits-almost-double-as-irish-fintech-continues-to-expand', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Regulatory compliance in a modern digital landscape', 'https://www.digital-first.com.au/insights/regulatory-compliance-in-a-modern-digital-landscape-the-challenges-and-the-solutions/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Compare the big 4 banks in Australia | Canstar', 'https://www.canstar.com.au/home-loans/compare-the-big-four-banks-in-australia/', 4, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fenergo expands operations to APAC to solve regulatory pressures', 'https://resources.fenergo.com/newsroom/fenergo-expands-operations-to-apac-to-solve-regulatory-pressures', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fenergo Selected by 4 of the Largest Australian Banks', 'https://resources.fenergo.com/newsroom/fenergo-selected-by-4-of-the-largest-australian-banks', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fenergo selected by four of Australia''s top five banks', 'https://www.finextra.com/pressarticle/71063/fenergo-selected-by-four-of-australias-top-five-banks', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fenergo Boosts APAC Presence Amid Growing RegTech Demand', 'https://www.finews.asia/finance/33874-fenergo-boosts-apac-presence-amid-growing-regtech-demand', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fenergo Sydney Office: Careers, Perks + Culture', 'https://builtinsydney.au/company/fenergo', 9, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
