-- Case 1/25: Daon
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
    'daon-anz-market-entry', 'How Daon Entered the ANZ Market: Winning Government Trust with Biometrics — From Border Crossings to Banking', 'Winning Government Trust with Biometrics — From Border Crossings to Banking',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['New Zealand government partner for passport facial recognition, RealMe identity infrastructure, and MSD benefit access', 'Canberra presence serving Australian and New Zealand government and critical infrastructure needs', 'Dedicated ANZ regional leadership at senior executive level', 'Expanded relevance in ANZ banking, telco, and fraud prevention workflows']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "2000"}, {"icon": "MapPin", "label": "HQ", "value": "Dublin, Ireland"}, {"icon": "Globe", "label": "ANZ Entry", "value": "Mid-2000s (New Zealand); formalised with Canberra office"}, {"icon": "Briefcase", "label": "Sector", "value": "Digital Identity & Biometrics"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Daon', 'Ireland', 'Australia & New Zealand',
      'Mid-2000s (New Zealand); formalised with Canberra office', 'Digital Identity & Biometrics', 1, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Dermot Desmond', 'Founder', true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Daon is a biometrics and identity assurance software company founded in Dublin in 2000 by Irish entrepreneur Dermot Desmond. The company builds software that verifies and authenticates people across the identity lifecycle using facial recognition, voice recognition, fingerprints, and other biometric factors. Its platform, IdentityX, serves clients across banking, telecoms, government, and critical infrastructure in over 80 countries.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>The ANZ region offered Daon a strong fit because New Zealand government agencies were early adopters of national digital identity infrastructure, while Australia had rising demand for secure digital onboarding and fraud prevention in financial services. These are trust-sensitive sectors where biometric identity assurance creates outsized value.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Daon''s ANZ expansion began through New Zealand government use cases. New Zealand passports used Daon''s facial recognition technology, and in 2018 the Department of Internal Affairs integrated Daon''s IdentityX into the RealMe Now mobile app so citizens could create a verified digital identity remotely using facial recognition. In 2023, New Zealand''s Ministry of Social Development selected Daon to provide face biometrics for identity verification for financial support programs, extending Daon''s government credibility into another high-trust public service.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Daon later reinforced its regional commitment with a dedicated office in Canberra, chosen to serve government and critical infrastructure customers in Australia and New Zealand. It also invested in senior local leadership through roles such as SVP, ANZ & Southeast Asia and Regional Director, Australia & New Zealand, which gave customers access to long-tenured executives rather than only remote sales support.</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>In Australia, Daon''s positioning broadened into banking, telecoms, and customer authentication. Its biometric onboarding, authentication, and deepfake detection capabilities address fraud, contact-centre risk, and digital identity verification challenges relevant to ANZ institutions.</p>', 3, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Key results from this market entry include the following milestones.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>New Zealand government partner for passport facial recognition, RealMe identity infrastructure, and MSD benefit access</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Canberra presence serving Australian and New Zealand government and critical infrastructure needs</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Dedicated ANZ regional leadership at senior executive level</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Expanded relevance in ANZ banking, telco, and fraud prevention workflows</p>', 5, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Daon''s ANZ market entry was not without friction. The journey involved navigating regulatory pressure, competitive dynamics, or capital and resourcing constraints typical of cross-border expansion.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those headwinds required disciplined execution: aligning local hires with regulatory expectations, validating the proposition with anchor customers, and committing capital to in-market presence rather than relying on remote sales support.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>Several repeatable plays stand out from Daon''s ANZ entry.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Use government as the anchor customer.</strong> New Zealand public-sector wins created trust that private-sector buyers could recognise</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Base near the buyer.</strong> Canberra positioned Daon close to government and critical infrastructure buyers</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Invest in executive-grade local leadership.</strong> Trust-heavy markets reward senior local decision-makers and continuity</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p><strong>Expand from one proof point into adjacent sectors.</strong> Government credibility helped Daon address banking and telecom identity needs</p>', 5, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon, Inc. - Wikiwand', 'https://www.wikiwand.com/en/articles/Daon,_Inc.', 1, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon, Inc. - Alchetron', 'https://alchetron.com/Daon,-Inc.', 2, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon, Inc. - Wikipedia', 'https://en.wikipedia.org/wiki/Daon,_Inc.', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Innovate While You Authenticate – Daon Inc.', 'https://ciobulletin.com/magazine/profile/innovate-while-you-authenticate-daon-inc', 4, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Regulatory system information: Identity and Passports', 'https://www.dia.govt.nz/Regulatory-Stewardship---Identity-and-Passports', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Digital Identity Solutions for Public Sector', 'https://www.daon.com/industry/public-sector/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon provides biometric onboarding for New Zealand government-backed mobile credential', 'https://www.biometricupdate.com/201808/daon-provides-biometric-onboarding-for-new-zealand-government-backed-mobile-credential', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon chosen for NZ govt’s RealMe Now App', 'https://identityweek.net/daon-chosen-for-nz-govts-realme-now-app/', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon wins contract to provide face biometrics for NZ social benefits', 'https://www.biometricupdate.com/202311/daon-wins-contract-to-provide-face-biometrics-for-nz-social-benefits', 9, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Where is Daon Located? HQ & Global Offices (2025)', 'https://www.highperformr.ai/company/daon', 10, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon, Inc.', 'http://www.staroceans.org/wiki/A/Daon,_Inc.', 11, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'John Duggan - SVP, ANZ & SE Asia at Daon | The Org', 'https://theorg.com/org/daon/org-chart/john-duggan', 12, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Craig Katz - Regional Director Australia & NZ at Daon | The Org', 'https://theorg.com/org/daon/org-chart/craig-katz', 13, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daon''s xSentinel tackles synthetic audio threats through real-time detection', 'https://securitybrief.com.au/story/daon-s-xsentinel-tackles-synthetic-audio-threats-through-real-time-detection', 14, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 2/25: Fenergo
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
    -- explicit NULLs for is_profitable and employee_count to override misleading column defaults
    INSERT INTO content_company_profiles (
      content_id, company_name, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Fenergo', 'Ireland', 'Australia & New Zealand',
      'September 2014 (Sydney)', 'RegTech / Client Lifecycle Management', 3, NULL, NULL
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

-- Case 3/25: FINEOS
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
    'fineos-anz-market-entry', 'How FINEOS Entered the ANZ Market: Category Dominance Through Vertical Focus — How FINEOS Became the Standard for ANZ Insurance', 'Category Dominance Through Vertical Focus — How FINEOS Became the Standard for ANZ Insurance',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Landmark 2005 ACC New Zealand contract', 'Strong presence across ANZ public-sector compensation and life insurance', 'More than 70% of Australian life premiums represented on FINEOS Claims', '13 ANZ insurance clients live in production', 'ASX listing in 2019 raised A$211 million']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "1993"}, {"icon": "MapPin", "label": "HQ", "value": "Dublin, Ireland"}, {"icon": "Globe", "label": "ANZ Entry", "value": "Early 2000s; landmark NZ deal in 2005"}, {"icon": "Briefcase", "label": "Sector", "value": "Insurance Software"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'FINEOS', 'Ireland', 'Australia & New Zealand',
      'Early 2000s; landmark NZ deal in 2005', 'Insurance Software', 1, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Michael Kelly', 'Founder', true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>FINEOS was founded in Dublin in 1993 by Michael Kelly to build specialist software for life, accident, and health insurers. The company focused on replacing legacy insurance systems with a modern platform spanning claims, policy, billing, and administration.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ANZ offered a structurally attractive insurance market. New Zealand''s national accident compensation framework created a unique government-scale claims environment, while Australia''s life insurance sector — including insurance linked to superannuation — created a large and specialised market for claims and policy administration technology.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>The defining early ANZ win came in 2005 when New Zealand''s Accident Compensation Corporation selected FINEOS to replace its legacy claims management platform in a contract valued at NZ$39 million. The system later supported over 2 million claims annually across 48 locations, making it one of New Zealand''s largest public sector IT programs at the time.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>That ACC credibility opened the door to other government and quasi-government clients in the region, including the NZ Defence Force, Victoria''s TAC, WorkSafe Victoria, and NSW''s icare group. FINEOS also won major Australian private-sector insurance share, with FINEOS Claims adopted by carriers representing over 70% of Australian life premiums and 13 ANZ insurance clients live in production.</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>The company deepened execution capacity through a strategic ANZ partnership with Sequential in 2017, combining FINEOS software with local consulting, change management, and optimisation support. In 2019, FINEOS listed on the ASX, raising A$211 million in the largest IPO on the exchange that year, underscoring how central Australia and New Zealand had become to its growth story.</p>', 3, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Key results from this market entry include the following milestones.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Landmark 2005 ACC New Zealand contract</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Strong presence across ANZ public-sector compensation and life insurance</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>More than 70% of Australian life premiums represented on FINEOS Claims</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>13 ANZ insurance clients live in production</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>ASX listing in 2019 raised A$211 million</p>', 6, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Several repeatable plays stand out from FINEOS''s ANZ entry.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Go deep into one regulated vertical.</strong> FINEOS focused on insurance and built category authority</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Land a government-scale proof point.</strong> ACC validated the platform at national scale</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Use public-sector credibility to win private-sector accounts.</strong> Government trust helped unlock insurer adoption</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Support software with local consulting partners.</strong> Sequential improved delivery confidence and outcomes</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Treat ANZ as a strategic capital market too.</strong> The ASX listing reinforced long-term commitment and visibility</p>', 6, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'An Industry Leader Driven by Innovation - FINEOS', 'https://www.fineos.com/2020/01/09/fineos-an-industry-leader-driven-by-innovation/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'What is Brief History of FINEOS Company?', 'https://matrixbcg.com/blogs/brief-history/fineos', 2, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'What is Growth Strategy and Future Prospects of FINEOS Company?', 'https://matrixbcg.com/blogs/growth-strategy/fineos', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACC - FINEOS client page', 'https://www.fineos.com/clients/acc-3/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The top 5 life insurance companies in Australia', 'https://www.insurancebusinessmag.com/au/guides/the-top-5-life-insurance-companies-in-australia-440994.aspx', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fineos wins NZ$39m Accident Compensation Corporation contract', 'https://www.finextra.com/pressarticle/3144/fineos-wins-nz39m-accident-compensation-corporation-contract', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fineos streamlines claims management for ACC', 'https://www.techmonitor.ai/technology/fineos_streamlines_claims_management_for_acc', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Further expansion in ANZ: FINEOS sponsors the Salesforce World Tour', 'https://www.fineos.com/blog/expansion-anz-fineos-sponsors-salesforce-world-tour/', 8, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FINEOS and Sequential announce Strategic Partnership in ANZ', 'https://www.fineos.com/2017/03/16/fineos-sequential-announce-strategic-partnership-anz/', 9, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FINEOS lists on the Australian Securities Exchange', 'https://www.fineos.com/2019/08/16/fineos-lists-on-the-australian-securities-exchange/', 10, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Irish fintech FINEOS, ASX''s biggest IPO this year, opens higher on debut', 'https://www.reuters.com/article/business/irish-fintech-fineos-asxs-biggest-ipo-this-year-opens-higher-on-debut-idUSKCN1V6075/', 11, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 4/25: Wayflyer
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

-- Case 5/25: Tines
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
    'tines-anz-market-entry', 'How Tines Entered the ANZ Market: From Security Automation to AI Workflows — Tines'' APAC Beachhead Strategy', 'From Security Automation to AI Workflows — Tines'' APAC Beachhead Strategy',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Marquee ANZ customers including Canva, REA Group, ANU, and nib Health Funds', 'Formal APAC hub expansion in Australia announced in 2026', 'Australian headcount growth and local data residency support', 'High pilot-to-production conversion and broad cross-team expansion model']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "2018"}, {"icon": "MapPin", "label": "HQ", "value": "Dublin, Ireland"}, {"icon": "Globe", "label": "ANZ Entry", "value": "Customer-led traction before formal hub expansion; APAC hub formalised in 2026"}, {"icon": "Briefcase", "label": "Sector", "value": "Workflow Automation / Security Automation"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Tines', 'Ireland', 'Australia & New Zealand',
      'Customer-led traction before formal hub expansion; APAC hub formalised in 2026', 'Workflow Automation / Security Automation', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Eoin Hinchy', 'Founder', true
    );
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Thomas Kinsella', 'Founder', false
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Tines was founded in Dublin in 2018 by Eoin Hinchy and Thomas Kinsella to eliminate manual, repetitive work in security and operations through no-code workflow automation. The company later reached unicorn status in 2025 after a $125 million Series C round that valued it at $1.125 billion.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ANZ became attractive because enterprise teams in Australia and New Zealand faced the same automation and security pressures as US firms, but often operated with leaner teams. Early customer traction with marquee Australian names gave Tines a credible base for wider growth.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Canva became one of Tines'' most important reference customers in ANZ, helping the company prove that its no-code automation platform could scale security detections and responses inside a globally recognised Australian technology company. That kind of flagship validation mattered because it created peer credibility before Tines had fully formalised its local footprint.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>As local demand grew, Tines built out dedicated ANZ capacity. In 2026 it announced plans to double Australian headcount and launch an APAC hub in Australia, naming customers such as Canva, REA Group, Australian National University, and nib Health Funds as evidence of momentum. Tines also leaned on local ecosystem relationships, including a partnership with Restack Technology, and supported enterprise buying requirements such as AWS-based local data residency.</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>The company now positions itself beyond only security use cases. It reports that 75% of active customers use the platform across multiple teams and that 94% of pilots move into production, showing a strong land-and-expand motion that is relevant to ANZ organisations pursuing practical automation and AI deployment.</p>', 3, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Key results from this market entry include the following milestones.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Marquee ANZ customers including Canva, REA Group, ANU, and nib Health Funds</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Formal APAC hub expansion in Australia announced in 2026</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Australian headcount growth and local data residency support</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>High pilot-to-production conversion and broad cross-team expansion model</p>', 5, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Several repeatable plays stand out from Tines''s ANZ entry.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Let a marquee customer validate the category.</strong> Canva gave Tines immediate local credibility</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Formalise the hub after demand is proven.</strong> Tines turned customer-led traction into an official APAC footprint</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Solve procurement blockers early.</strong> Local data residency matters in ANZ enterprise buying</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Use local partners for delivery depth.</strong> Restack strengthened local ecosystem fit</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Expand from one team into many.</strong> The platform''s land-and-expand motion suits lean ANZ organisations</p>', 6, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines Business Breakdown & Founding Story - Contrary Research', 'https://research.contrary.com/company/tines', 1, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines joins the unicorn league after latest funding round', 'https://www.siliconrepublic.com/start-ups/tines-unicorn-series-c-funding', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines Secures $125M in Series C Financing, Bringing Total Valuation to $1.125B', 'https://www.prnewswire.com/news-releases/tines-secures-125m-in-series-c-financing-bringing-total-valuation-to-1-125b-302372726.html', 3, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines to double Australia headcount as APAC hub opens', 'https://itbrief.com.au/story/tines-to-double-australia-headcount-as-apac-hub-opens', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines B2B Case Studies & Customer Successes', 'https://www.casestudies.com/company/tines', 5, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines on LinkedIn: How Canva Secures Employee Identities with SpyCloud and Tines', 'https://www.linkedin.com/posts/tines-io_how-canva-secures-employee-identities-with-activity-7184600792568340480-iPGg', 6, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'How Tines is helping Canva to improve its security detections and responses', 'https://www.tines.com/case-studies/canva/', 7, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines Assembles ANZ Team for Intelligent Workflows with Restack Technology', 'https://www.linkedin.com/posts/trevor-van-essen-411ab758_2026-is-going-to-be-a-big-year-for-tines-activity-7416309943269507072--cSP', 8, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Irish unicorn Tines to double headcount in Australia as organisations embrace intelligent workflows', 'https://newshub.medianet.com.au/2026/04/irish-unicorn-tines-to-double-headcount-in-australia-as-organisations-embrace-intelligent-workflows/144557/', 9, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 6/25: Revolut
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
    'revolut-anz-market-entry', 'How Revolut Entered the ANZ Market', 'Revolut was founded in London in 2015 by Nikolay Storonsky and Vlad Yatsenko to reduce the cost and friction of international spending and money movement, beginning with a prepaid travel card and interbank FX model before expanding into broader financial services.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['Revolut has grown from a very small founding team in Australia into a scaled local operation with a seven-figure customer base and a much broader product suite, making it one of the clearest UK fintech expansion stories for MES.', 'Revolut established its Australian base in Melbourne, secured regulatory approval before public launch, then expanded from travel and FX into crypto, equity trading, rewards, and business products as it deepened local market fit.']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "2015"}, {"icon": "MapPin", "label": "HQ", "value": "London, United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Revolut', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Fintech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Revolut was founded in London in 2015 by Nikolay Storonsky and Vlad Yatsenko to reduce the cost and friction of international spending and money movement, beginning with a prepaid travel card and interbank FX model before expanding into broader financial services.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia offered Revolut an English-speaking market with high smartphone adoption, frequent international travel and remittance use, and a concentrated banking sector where pricing opacity created room for a challenger proposition.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Revolut established its Australian base in Melbourne, secured regulatory approval before public launch, then expanded from travel and FX into crypto, equity trading, rewards, and business products as it deepened local market fit.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Revolut has grown from a very small founding team in Australia into a scaled local operation with a seven-figure customer base and a much broader product suite, making it one of the clearest UK fintech expansion stories for MES.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Revolut''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, Revolut''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The Revolut story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut Australia newsroom and milestones', 'https://www.revolut.com/en-AU/news/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Invest Victoria on Revolut choosing Melbourne', 'https://www.invest.vic.gov.au/news-events/news/2020/revolut-launches-in-australia', 2, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ASIC professional registers / AFSL search', 'https://connectonline.asic.gov.au/', 3, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'RFI Global / Australian banking and digital adoption coverage', 'https://www.rfigroup.com/', 4, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Reserve Bank of Australia payments statistics', 'https://www.rba.gov.au/statistics/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Industry coverage on Australian growth', 'https://www.afr.com/companies/financial-services', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 7/25: Wise
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
    'wise-anz-market-entry', 'How Wise Entered the ANZ Market', 'Wise, originally TransferWise, was founded in London in 2011 to offer transparent international transfers at the mid-market rate and has since evolved into a multi-currency consumer and business financial platform.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['Wise''s Australian business is one of the strongest proofs that a UK fintech can move from narrow corridor-led use cases into mainstream adoption in ANZ.', 'Wise entered Australia through remittances, built local compliance and payment infrastructure, then expanded into broader balance, business, and investment-style products as the brand became established.']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "2011"}, {"icon": "MapPin", "label": "HQ", "value": "London, United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Wise', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Fintech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Wise, originally TransferWise, was founded in London in 2011 to offer transparent international transfers at the mid-market rate and has since evolved into a multi-currency consumer and business financial platform.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia is a natural fit for Wise because of its large migrant and expat flows, strong SME trade connections, and longstanding dissatisfaction with opaque bank foreign exchange fees.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Wise entered Australia through remittances, built local compliance and payment infrastructure, then expanded into broader balance, business, and investment-style products as the brand became established.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Wise''s Australian business is one of the strongest proofs that a UK fintech can move from narrow corridor-led use cases into mainstream adoption in ANZ.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Wise''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Wise story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise company newsroom', 'https://wise.com/gb/blog', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise annual reports and investor updates', 'https://wise.com/gb/investors/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LSE company profile for Wise', 'https://www.londonstockexchange.com/', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise Australia news and product updates', 'https://wise.com/au/blog', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian Bureau of Statistics migration data', 'https://www.abs.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Reserve Bank of Australia payments data', 'https://www.rba.gov.au/statistics/', 6, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AUSTRAC remittance registration information', 'https://www.austrac.gov.au/', 7, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ASIC registers', 'https://connectonline.asic.gov.au/', 8, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Financial press coverage', 'https://www.afr.com/companies/financial-services', 9, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 8/25: Darktrace
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
    'darktrace-anz-market-entry', 'How Darktrace Entered the ANZ Market', 'Darktrace is a UK-founded cybersecurity company built around self-learning AI for threat detection and response across enterprise environments.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['The company''s ANZ growth, customer mix, and partnerships make it one of the better-known UK cybersecurity market entry examples for enterprise-led expansion.', 'Darktrace built a direct presence in Australia, expanded into multiple cities, and combined enterprise sales with regional partnerships to create broad market coverage.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Darktrace', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Cybersecurity', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Darktrace is a UK-founded cybersecurity company built around self-learning AI for threat detection and response across enterprise environments.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s elevated cyber risk environment and growing board-level concern after major breaches make it a strong market for premium cyber platforms with enterprise credibility.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Darktrace built a direct presence in Australia, expanded into multiple cities, and combined enterprise sales with regional partnerships to create broad market coverage.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>The company''s ANZ growth, customer mix, and partnerships make it one of the better-known UK cybersecurity market entry examples for enterprise-led expansion.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Darktrace''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, Darktrace''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The Darktrace story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace company newsroom', 'https://darktrace.com/news', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Darktrace investor relations', 'https://darktrace.com/company/investors', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Customer stories', 'https://darktrace.com/customers', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian Signals Directorate annual cyber threat reports', 'https://www.cyber.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Office of the Australian Information Commissioner breach reporting resources', 'https://www.oaic.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Channel and partner coverage', 'https://www.crn.com.au/', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Industry press coverage', 'https://www.itnews.com.au/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 9/25: Quantexa
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
    'quantexa-anz-market-entry', 'How Quantexa Entered the ANZ Market', 'Quantexa is a London-founded decision intelligence company focused on entity resolution, graph analytics, and financial crime detection for banks, insurers, and public sector clients.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['The company established itself as a serious ANZ banking technology player by winning share among major local institutions rather than trying to scale through lower-value segments first.', 'Quantexa used Sydney as its APAC beachhead, leveraged existing relationships with global banking clients, and rode a wave of compliance transformation among Australian banks.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "London, United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Technology"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Quantexa', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Technology', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Quantexa is a London-founded decision intelligence company focused on entity resolution, graph analytics, and financial crime detection for banks, insurers, and public sector clients.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s heavily regulated banking environment and heightened AML scrutiny created ideal conditions for Quantexa''s financial crime and contextual intelligence proposition.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Quantexa used Sydney as its APAC beachhead, leveraged existing relationships with global banking clients, and rode a wave of compliance transformation among Australian banks.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>The company established itself as a serious ANZ banking technology player by winning share among major local institutions rather than trying to scale through lower-value segments first.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Quantexa''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, Quantexa''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The Quantexa story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Quantexa newsroom', 'https://www.quantexa.com/newsroom/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Quantexa customer stories', 'https://www.quantexa.com/customers/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AUSTRAC enforcement and guidance', 'https://www.austrac.gov.au/', 3, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Quantexa banking sector materials', 'https://www.quantexa.com/solutions/financial-crime/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian banking regulatory context via APRA', 'https://www.apra.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Financial crime and AML media coverage', 'https://www.afr.com/companies/financial-services', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Independent business coverage', 'https://www.finextra.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 10/25: Thought Machine
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
    'thought-machine-anz-market-entry', 'How Thought Machine Entered the ANZ Market', 'Thought Machine is a London-founded cloud core banking software company replacing legacy banking systems with programmable cloud-native infrastructure.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['The Kiwibank and Judo Bank wins give MES a strong case study in using challenger institutions as proof points for broader market trust.', 'Thought Machine used landmark anchor clients in New Zealand and Australia to prove delivery capability, then added a physical ANZ presence to support enterprise execution.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "London, United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Thought Machine', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Fintech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Thought Machine is a London-founded cloud core banking software company replacing legacy banking systems with programmable cloud-native infrastructure.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia and New Zealand have both challenger-bank momentum and incumbent modernisation demand, making ANZ a highly relevant region for next-generation core banking software.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Thought Machine used landmark anchor clients in New Zealand and Australia to prove delivery capability, then added a physical ANZ presence to support enterprise execution.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>The Kiwibank and Judo Bank wins give MES a strong case study in using challenger institutions as proof points for broader market trust.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Thought Machine''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Thought Machine story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Thought Machine newsroom', 'https://www.thoughtmachine.net/news', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Thought Machine customers', 'https://www.thoughtmachine.net/customers', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'APRA and RBNZ banking regulatory materials', 'https://www.apra.gov.au/', 3, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Kiwibank / Judo Bank transformation coverage', 'https://www.kiwibank.co.nz/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Judo Bank announcements', 'https://www.judo.bank/', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Synpulse implementation coverage', 'https://www.synpulse.com/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 11/25: Featurespace
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
    'featurespace-anz-market-entry', 'How Featurespace Entered the ANZ Market', 'Featurespace is a Cambridge fraud and financial crime AI company known for behavioural analytics and real-time transaction monitoring.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['An infrastructure-grade payments client and later APAC leadership hires make this one of the strongest MES examples of how a single strategic ANZ deal can reshape regional presence.', 'Featurespace''s ANZ path was shaped by founder-market connection and a nationally important anchor deal through eftpos, which provided credibility that far exceeded a typical first customer logo.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Cambridge, United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Technology"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Featurespace', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Technology', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Featurespace is a Cambridge fraud and financial crime AI company known for behavioural analytics and real-time transaction monitoring.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s payments ecosystem and bank fraud environment created a clear need for advanced behavioural fraud analytics, especially at infrastructure level rather than only at individual bank level.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Featurespace''s ANZ path was shaped by founder-market connection and a nationally important anchor deal through eftpos, which provided credibility that far exceeded a typical first customer logo.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>An infrastructure-grade payments client and later APAC leadership hires make this one of the strongest MES examples of how a single strategic ANZ deal can reshape regional presence.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Featurespace''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Featurespace story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Featurespace newsroom', 'https://www.featurespace.com/newsroom/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Featurespace customer stories', 'https://www.featurespace.com/customers/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'HSBC acquisition coverage', 'https://www.hsbc.com/news-and-media', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eftpos / Australian Payments Plus announcements', 'https://www.auspayplus.com.au/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Featurespace fraud solution pages', 'https://www.featurespace.com/', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Payments market coverage', 'https://www.paymentscardsandmobile.com/', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANU alumni references or founder profiles', 'https://www.anu.edu.au/', 7, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'APAC leadership updates', 'https://www.linkedin.com/company/featurespace/', 8, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 12/25: Mimecast
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
    'mimecast-anz-market-entry', 'How Mimecast Entered the ANZ Market', 'Mimecast is a UK-founded cloud email security and cyber resilience company that scaled globally through a strong channel-led distribution model.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['Its partner count, customer footprint, and multi-city presence make Mimecast one of the best ANZ channel-play case studies for MES.', 'Mimecast launched in Australia, expanded city coverage, and built a large partner ecosystem before attempting to dominate through direct sales alone.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Mimecast', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Cybersecurity', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Mimecast is a UK-founded cloud email security and cyber resilience company that scaled globally through a strong channel-led distribution model.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>The ANZ market has a mature MSP, reseller, and enterprise IT channel ecosystem, making it well suited to Mimecast''s partner-first growth model.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Mimecast launched in Australia, expanded city coverage, and built a large partner ecosystem before attempting to dominate through direct sales alone.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Its partner count, customer footprint, and multi-city presence make Mimecast one of the best ANZ channel-play case studies for MES.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Mimecast''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Mimecast story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast newsroom', 'https://www.mimecast.com/company/news/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mimecast partner pages', 'https://www.mimecast.com/partners/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Permira acquisition coverage', 'https://www.permira.com/news-and-insights/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'CRN Australia channel coverage', 'https://www.crn.com.au/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ARN channel market news', 'https://www.arnnet.com.au/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Company overview', 'https://www.mimecast.com/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 13/25: ComplyAdvantage
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
    'complyadvantage-anz-market-entry', 'How ComplyAdvantage Entered the ANZ Market', 'ComplyAdvantage is a UK RegTech company focused on AML, sanctions screening, and financial crime risk intelligence.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is a strong MES example of pre-positioning for a regulatory wave rather than reacting after the market gets crowded.', 'ComplyAdvantage combined a Sydney-based APAC leadership model with local compliance content and ecosystem participation to build trust ahead of the Tranche 2 regulatory expansion.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "RegTech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'ComplyAdvantage', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'RegTech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ComplyAdvantage is a UK RegTech company focused on AML, sanctions screening, and financial crime risk intelligence.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s AML reform cycle and expanding compliance burden made ANZ a strong market for a company willing to enter before demand peaked.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>ComplyAdvantage combined a Sydney-based APAC leadership model with local compliance content and ecosystem participation to build trust ahead of the Tranche 2 regulatory expansion.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is a strong MES example of pre-positioning for a regulatory wave rather than reacting after the market gets crowded.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>ComplyAdvantage''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, ComplyAdvantage''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The ComplyAdvantage story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ComplyAdvantage newsroom', 'https://complyadvantage.com/insights/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Company pages', 'https://complyadvantage.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Funding and growth coverage', 'https://techcrunch.com/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AUSTRAC reform updates', 'https://www.austrac.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian Government AML reform materials', 'https://www.ag.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FinTech Australia member ecosystem', 'https://www.fintechaustralia.org.au/', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANZ compliance media coverage', 'https://www.afr.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 14/25: Onfido
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
    'onfido-anz-market-entry', 'How Onfido Entered the ANZ Market', 'Onfido is a UK identity verification company that uses AI and biometrics to verify users across digital onboarding flows.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This makes Onfido an MES-relevant infrastructure case study showing how following existing clients into ANZ can create significant volume without a classic local go-to-market motion.', 'Onfido''s ANZ story is primarily a client pull-through model, with global customers like Revolut bringing Onfido into Australian onboarding journeys as they expanded.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Identity Verification"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Onfido', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Identity Verification', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Onfido is a UK identity verification company that uses AI and biometrics to verify users across digital onboarding flows.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s regulated fintech, payments, and digital onboarding environment created strong demand for identity verification infrastructure that could localise to Australian documents and compliance rules.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Onfido''s ANZ story is primarily a client pull-through model, with global customers like Revolut bringing Onfido into Australian onboarding journeys as they expanded.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This makes Onfido an MES-relevant infrastructure case study showing how following existing clients into ANZ can create significant volume without a classic local go-to-market motion.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Onfido''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Onfido story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Onfido newsroom', 'https://onfido.com/resources/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Onfido company pages', 'https://onfido.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Entrust acquisition coverage', 'https://www.entrust.com/company/newsroom', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AUSTRAC KYC / AML materials', 'https://www.austrac.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ASIC guidance for financial onboarding', 'https://asic.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Onfido customer stories', 'https://onfido.com/customers/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Revolut Australia newsroom', 'https://www.revolut.com/en-AU/news/', 7, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 15/25: Blue Prism
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
    'blue-prism-anz-market-entry', 'How Blue Prism Entered the ANZ Market', 'Blue Prism is the UK company most associated with inventing and commercialising robotic process automation for enterprise back-office workflows.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['The Telstra automation work remains one of the best-known proof points for UK enterprise software translating into clear operational value in Australia.', 'Blue Prism''s ANZ trajectory was amplified by a coordinated UK tech investment announcement and then scaled through systems integrator partners rather than purely direct sales.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Automation"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Blue Prism', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Automation', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Blue Prism is the UK company most associated with inventing and commercialising robotic process automation for enterprise back-office workflows.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s large enterprises and public institutions have long invested in transformation programs where automation can deliver measurable labour and process efficiency gains.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Blue Prism''s ANZ trajectory was amplified by a coordinated UK tech investment announcement and then scaled through systems integrator partners rather than purely direct sales.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>The Telstra automation work remains one of the best-known proof points for UK enterprise software translating into clear operational value in Australia.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Blue Prism''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Blue Prism story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'SS&C Blue Prism newsroom', 'https://www.blueprism.com/resources/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Company history pages', 'https://www.blueprism.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'SS&C acquisition materials', 'https://www.ssctech.com/about/news', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian enterprise transformation coverage', 'https://www.itnews.com.au/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Telstra transformation materials', 'https://www.telstra.com.au/', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Austrade / DIT coordinated investment coverage', 'https://www.austrade.gov.au/', 6, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infosys partner coverage', 'https://www.infosys.com/', 7, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 16/25: Dext
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
    'dext-anz-market-entry', 'How Dext Entered the ANZ Market', 'Dext, formerly Receipt Bank, is a UK accounting automation company built around extracting financial data from receipts and invoices and feeding it into accounting software workflows.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['Dext is one of the strongest MES examples of using an existing ANZ software ecosystem to scale without needing a heavy direct sales footprint first.', 'Dext entered via Xero integration, leaned into Xerocon and accountant community distribution, then broadened its proposition through adjacent practice intelligence tools.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Automation"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Dext', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Automation', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Dext, formerly Receipt Bank, is a UK accounting automation company built around extracting financial data from receipts and invoices and feeding it into accounting software workflows.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Because Xero is so deeply embedded in the Australian and New Zealand accounting ecosystem, Dext had a natural route into the market through platform integration and accountant channel relationships.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Dext entered via Xero integration, leaned into Xerocon and accountant community distribution, then broadened its proposition through adjacent practice intelligence tools.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Dext is one of the strongest MES examples of using an existing ANZ software ecosystem to scale without needing a heavy direct sales footprint first.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Dext''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Dext story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Dext newsroom', 'https://dext.com/en/news/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Dext company pages', 'https://dext.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Xero app marketplace profile', 'https://apps.xero.com/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Xero investor or company updates', 'https://www.xero.com/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Xerocon event information', 'https://www.xero.com/events/', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 17/25: nPlan
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
    'nplan-anz-market-entry', 'How nPlan Entered the ANZ Market', 'nPlan is a UK construction AI company that uses a very large historical project schedule dataset to predict delivery risk on major infrastructure projects.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['For MES, this is a model case of winning a strategic anchor project in Australia to validate a category that still feels emerging to many buyers.', 'nPlan''s ANZ story centres on a high-profile megaproject reference rather than a broad SME rollout, giving it outsized credibility for future infrastructure pursuits.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'nPlan', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Construction Tech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>nPlan is a UK construction AI company that uses a very large historical project schedule dataset to predict delivery risk on major infrastructure projects.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s multi-year infrastructure boom and reliance on large project consortia make it a highly attractive market for schedule risk intelligence and project controls technology.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>nPlan''s ANZ story centres on a high-profile megaproject reference rather than a broad SME rollout, giving it outsized credibility for future infrastructure pursuits.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>For MES, this is a model case of winning a strategic anchor project in Australia to validate a category that still feels emerging to many buyers.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, nPlan''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The nPlan story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'nPlan newsroom', 'https://www.nplan.io/news', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'nPlan company pages', 'https://www.nplan.io/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infrastructure Australia publications', 'https://www.infrastructureaustralia.gov.au/', 3, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Victorian major projects information', 'https://bigbuild.vic.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'North East Link project information', 'https://bigbuild.vic.gov.au/projects/north-east-link-program', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 18/25: DaXtra Technologies
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
    'daxtra-technologies-anz-market-entry', 'How DaXtra Technologies Entered the ANZ Market', 'DaXtra is a UK recruitment technology company specialising in CV parsing, candidate matching, and recruitment search infrastructure.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This case is especially useful for MES because it shows how a patient, infrastructure-style expansion can become deeply embedded in ANZ without loud consumer visibility.', 'DaXtra''s Australian expansion began with a major staffing firm and then compounded steadily over many years as integrations and background workflow infrastructure locked in value.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'DaXtra Technologies', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Construction Tech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>DaXtra is a UK recruitment technology company specialising in CV parsing, candidate matching, and recruitment search infrastructure.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s well-developed recruitment sector, especially in technology and professional services, gave DaXtra a strong environment for automation-led operational improvement.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>DaXtra''s Australian expansion began with a major staffing firm and then compounded steadily over many years as integrations and background workflow infrastructure locked in value.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This case is especially useful for MES because it shows how a patient, infrastructure-style expansion can become deeply embedded in ANZ without loud consumer visibility.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, DaXtra Technologies''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The DaXtra Technologies story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'DaXtra company website', 'https://www.daxtra.com/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'DaXtra newsroom', 'https://www.daxtra.com/news/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Nucleus Research coverage or matrix references', 'https://nucleusresearch.com/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian recruitment industry coverage', 'https://www.recruitmentnews.com.au/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Peoplebank company information', 'https://www.peoplebank.com.au/', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Recruitment CRM ecosystem pages', 'https://www.jobadder.com/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 19/25: ANNA Money
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
    'anna-money-anz-market-entry', 'How ANNA Money Entered the ANZ Market', 'ANNA Money is a UK SME financial admin and business banking platform combining payments, cards, bookkeeping, invoicing, and tax support.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is one of the clearest MES examples of acquisition as a market entry shortcut for a UK startup entering Australia.', 'ANNA chose acquisition over greenfield build by buying Sydney-based GetCape, instantly gaining local infrastructure, customers, and leadership instead of spending years assembling them.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'ANNA Money', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Fintech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ANNA Money is a UK SME financial admin and business banking platform combining payments, cards, bookkeeping, invoicing, and tax support.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s very large micro-business segment and frustration with traditional bank admin experiences make it fertile ground for digitally native SME finance products.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>ANNA chose acquisition over greenfield build by buying Sydney-based GetCape, instantly gaining local infrastructure, customers, and leadership instead of spending years assembling them.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is one of the clearest MES examples of acquisition as a market entry shortcut for a UK startup entering Australia.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, ANNA Money''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The ANNA Money story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANNA Money company pages', 'https://anna.money/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANNA newsroom or blog', 'https://anna.money/blog/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Founding and growth coverage', 'https://techcrunch.com/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian small business statistics', 'https://www.abs.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian SME banking market coverage', 'https://www.afr.com/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'GetCape company or acquisition coverage', 'https://www.getcape.com/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian fintech media coverage', 'https://www.fintechfutures.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Acquisition coverage', 'https://www.finextra.com/', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 20/25: Tractable
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
    'tractable-anz-market-entry', 'How Tractable Entered the ANZ Market', 'Tractable is a UK AI company using computer vision to assess motor and property damage for insurers and claims workflows.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['For MES, this case shows the value of securing a dominant national insurer rather than spending years chasing smaller logos first.', 'Tractable used a partnership with IAG, the region''s most important insurance group, as a category-defining proof point in ANZ.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "InsurTech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Tractable', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'InsurTech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Tractable is a UK AI company using computer vision to assess motor and property damage for insurers and claims workflows.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s large motor insurance market and recurring extreme weather claims spikes create strong demand for claims automation and scalable triage technology.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Tractable used a partnership with IAG, the region''s most important insurance group, as a category-defining proof point in ANZ.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>For MES, this case shows the value of securing a dominant national insurer rather than spending years chasing smaller logos first.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Tractable''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Tractable story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tractable newsroom', 'https://tractable.ai/news/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tractable company pages', 'https://tractable.ai/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IAG newsroom', 'https://www.iag.com.au/newsroom', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian insurance market coverage', 'https://www.ibisworld.com/au/', 4, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Insurance technology coverage', 'https://www.insurtechinsights.com/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IAG transformation materials', 'https://www.iag.com.au/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Insurance media coverage', 'https://www.insurancebusinessmag.com/au/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 21/25: Deliveroo
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
    'deliveroo-anz-market-entry', 'How Deliveroo Entered the ANZ Market', 'Deliveroo is a UK-founded food delivery marketplace that expanded aggressively internationally before later exiting Australia and then being acquired by DoorDash globally.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is a valuable MES case not because it succeeded long term in ANZ, but because it shows how even strong UK startups can misread capital requirements in a two-sided platform market.', 'Deliveroo launched early, scaled across major cities, but eventually concluded that the market structure made profitable leadership too capital intensive.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Marketplace"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Deliveroo', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Marketplace', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Deliveroo is a UK-founded food delivery marketplace that expanded aggressively internationally before later exiting Australia and then being acquired by DoorDash globally.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia initially looked highly attractive because of urban density, restaurant culture, and mobile adoption, but the same conditions also attracted aggressive global competition.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Deliveroo launched early, scaled across major cities, but eventually concluded that the market structure made profitable leadership too capital intensive.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is a valuable MES case not because it succeeded long term in ANZ, but because it shows how even strong UK startups can misread capital requirements in a two-sided platform market.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Deliveroo''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, Deliveroo''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The Deliveroo story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Deliveroo corporate newsroom', 'https://corporate.deliveroo.co.uk/media-centre/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'DoorDash acquisition coverage', 'https://about.doordash.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LSE / corporate history references', 'https://corporate.deliveroo.co.uk/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian food delivery market coverage', 'https://www.afr.com/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Competition and consumer market reporting', 'https://www.smartcompany.com.au/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Administrator / KordaMentha information', 'https://kordamentha.com/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian business coverage', 'https://www.abc.net.au/news', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 22/25: Banked
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
    'banked-anz-market-entry', 'How Banked Entered the ANZ Market', 'Banked is a UK account-to-account payments company helping merchants and financial institutions move transactions directly over bank rails rather than card networks.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'draft', false,
    1, ARRAY['For MES, Banked is a strong template for how UK fintech infrastructure companies can use a strategic investor-partner to enter ANZ with distribution built in.', 'Banked first aligned with NAB strategically through investment and then commercially through a Pay by Bank rollout, using the bank''s reach to scale faster than a standalone merchant acquisition strategy would allow.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Banked', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Fintech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Banked is a UK account-to-account payments company helping merchants and financial institutions move transactions directly over bank rails rather than card networks.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s NPP and PayTo infrastructure make it one of the best-developed A2A payments environments globally, particularly when paired with a major bank partner.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Banked first aligned with NAB strategically through investment and then commercially through a Pay by Bank rollout, using the bank''s reach to scale faster than a standalone merchant acquisition strategy would allow.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>For MES, Banked is a strong template for how UK fintech infrastructure companies can use a strategic investor-partner to enter ANZ with distribution built in.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Banked''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Banked story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Banked newsroom', 'https://banked.com/news/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Banked company pages', 'https://banked.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Funding coverage', 'https://www.finextra.com/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian Payments Plus / PayTo', 'https://www.auspayplus.com.au/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NAB newsroom', 'https://news.nab.com.au/', 5, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Reserve Bank payments infrastructure materials', 'https://www.rba.gov.au/', 6, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Payments industry coverage', 'https://www.paymentscardsandmobile.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 23/25: NCC Group
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
    'ncc-group-anz-market-entry', 'How NCC Group Entered the ANZ Market', 'NCC Group is a UK cybersecurity and information assurance company with deep capabilities in penetration testing, incident response, and software assurance.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['The case is especially useful for MES because it shows how a mature UK technology firm can enter ANZ by aligning tightly with public policy, regulation, and national strategic priorities.', 'NCC Group used the coordinated UK tech investment wave to establish presence, then aligned itself with government and critical infrastructure demand rather than diffuse SME demand.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cybersecurity"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'NCC Group', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Cybersecurity', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>NCC Group is a UK cybersecurity and information assurance company with deep capabilities in penetration testing, incident response, and software assurance.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s post-breach cyber environment and expanding critical infrastructure obligations make it a strong market for advanced assurance and advisory providers.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>NCC Group used the coordinated UK tech investment wave to establish presence, then aligned itself with government and critical infrastructure demand rather than diffuse SME demand.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>The case is especially useful for MES because it shows how a mature UK technology firm can enter ANZ by aligning tightly with public policy, regulation, and national strategic priorities.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Challenges Faced', 'challenges-faced', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>NCC Group''s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 5, true)
    RETURNING id INTO v_sec_4;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>For UK operators considering ANZ entry, NCC Group''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_4, '<p>The NCC Group story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NCC Group newsroom', 'https://www.nccgroup.com/us/newsroom/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NCC Group company pages', 'https://www.nccgroup.com/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LSE profile', 'https://www.londonstockexchange.com/', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian Cyber Security Strategy', 'https://www.homeaffairs.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Cyber.gov.au resources', 'https://www.cyber.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Austrade materials', 'https://www.austrade.gov.au/', 6, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 24/25: Contino
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
    'contino-anz-market-entry', 'How Contino Entered the ANZ Market', 'Contino was a UK cloud and DevOps transformation consultancy serving enterprise clients with high-end engineering and platform modernisation services.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is one of the best MES examples of how a UK consultancy can use ANZ expansion not only for revenue growth but also as a strategic asset in an eventual exit.', 'Contino opened first in Melbourne, then accelerated through the acquisition of Nebulr to obtain local scale, banking clients, and execution capacity much faster than organic hiring would have allowed.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Cloud Services"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Contino', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Cloud Services', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Contino was a UK cloud and DevOps transformation consultancy serving enterprise clients with high-end engineering and platform modernisation services.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s major banks, insurers, and large enterprises were in the middle of cloud and DevOps transformation cycles, creating demand for premium specialist execution support.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Contino opened first in Melbourne, then accelerated through the acquisition of Nebulr to obtain local scale, banking clients, and execution capacity much faster than organic hiring would have allowed.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is one of the best MES examples of how a UK consultancy can use ANZ expansion not only for revenue growth but also as a strategic asset in an eventual exit.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Contino''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Contino story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Cognizant acquisition coverage', 'https://news.cognizant.com/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Archived Contino materials via press releases', 'https://www.businesswire.com/', 2, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Nebulr company references', 'https://www.nebulr.com.au/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australian banking and cloud transformation coverage', 'https://www.itnews.com.au/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AWS partner or cloud market reporting', 'https://aws.amazon.com/partners/', 5, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 25/25: Sensat
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
    'sensat-anz-market-entry', 'How Sensat Entered the ANZ Market', 'Sensat is a UK construction technology company focused on digital twins, spatial data, and visualisation for complex infrastructure projects.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'draft', false,
    1, ARRAY['This is a strong MES example of a government-supported, infrastructure-focused UK startup using a credibility-heavy entry route rather than a high-volume sales approach.', 'Sensat used the Tech Nation Digital Trade Network and then a Sydney office with local go-to-market leadership to establish an ANZ foothold in infrastructure and utilities.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Construction Tech"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Sensat', 'United Kingdom', 'Australia & New Zealand',
      NULL, 'Construction Tech', NULL, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Sensat is a UK construction technology company focused on digital twins, spatial data, and visualisation for complex infrastructure projects.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Australia''s infrastructure pipeline and growing digital twin sophistication make it a strong market for infrastructure visualisation and collaboration software.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Sensat used the Tech Nation Digital Trade Network and then a Sydney office with local go-to-market leadership to establish an ANZ foothold in infrastructure and utilities.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>This is a strong MES example of a government-supported, infrastructure-focused UK startup using a credibility-heavy entry route rather than a high-volume sales approach.</p>', 1, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>For UK operators considering ANZ entry, Sensat''s playbook offers a clear template: identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, and treat the market as worth in-region investment rather than satellite coverage.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>The Sensat story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, whether that''s bank partnerships, channel networks, or vertical-specific buyer cycles.</p>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Sensat newsroom', 'https://www.sensat.co/news', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Sensat company pages', 'https://www.sensat.co/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tech Nation / Founders Forum references', 'https://technation.io/', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infrastructure Australia', 'https://www.infrastructureaustralia.gov.au/', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'NSW Spatial Digital Twin context', 'https://www.nsw.gov.au/', 5, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LinkedIn company updates for ANZ leadership', 'https://www.linkedin.com/company/sensat/', 6, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Infrastructure sector coverage', 'https://www.theurbandeveloper.com/', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
