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
    INSERT INTO content_company_profiles (
      content_id, company_name, origin_country, target_market,
      entry_date, industry, founder_count
    ) VALUES (
      v_id, 'Daon', 'Ireland', 'Australia & New Zealand',
      'Mid-2000s (New Zealand); formalised with Canberra office', 'Digital Identity & Biometrics', 1
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
