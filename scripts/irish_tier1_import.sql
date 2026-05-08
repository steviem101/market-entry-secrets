-- Case 1/6: Clanwilliam (clanwilliam-anz-market-entry)
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
    'clanwilliam-anz-market-entry', 'How Clanwilliam Entered the ANZ Market', 'How a Dublin-founded healthtech group turned a series of ANZ acquisitions into a dominant clinical communications and connected-care platform spanning Australia and New Zealand.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    3, ARRAY['How a Dublin-founded healthtech group turned a series of ANZ acquisitions into a dominant clinical communications and connected-care platform spanning Australia and New Zealand.', 'Clanwilliam is an Irish healthcare technology group founded in 1996 by Howard Beggs.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Healthtech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Clanwilliam', 'Ireland', 'Australia & New Zealand',
      '2017-01-01', 'Healthtech', 1, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Howard Beggs', 'Founder', true);
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
    UPDATE content_bodies SET body_text = '<p>Clanwilliam is an Irish healthcare technology group founded in 1996 by Howard Beggs. Its ANZ story is one of the clearest examples in the MES library of a company using acquisition to buy embedded market trust rather than attempting to build it from scratch against entrenched local competitors.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Clanwilliam is an Irish healthcare technology group founded in 1996 by Howard Beggs. Its ANZ story is one of the clearest examples in the MES library of a company using acquisition to buy embedded market trust rather than attempting to build it from scratch against entrenched local competitors.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Rather than launch a sales operation into an unfamiliar healthcare system, Clanwilliam acquired businesses that were already woven into clinical workflows across Australian and New Zealand healthcare. That strategy gave it immediate network effects, customer relationships, and regulatory familiarity that would have taken years to replicate organically.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Rather than launch a sales operation into an unfamiliar healthcare system, Clanwilliam acquired businesses that were already woven into clinical workflows across Australian and New Zealand healthcare. That strategy gave it immediate network effects, customer relationships, and regulatory familiarity that would have taken years to replicate organically.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>Australian and New Zealand healthcare offered a compelling structural opportunity: both markets were digitising clinical communications but remained fragmented, with legacy secure messaging providers sitting alongside newer referral and data-exchange tools. Clanwilliam identified that connecting these silos was a solvable problem — but only if you owned or operated key pieces of the exchange infrastructure.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australian and New Zealand healthcare offered a compelling structural opportunity: both markets were digitising clinical communications but remained fragmented, with legacy secure messaging providers sitting alongside newer referral and data-exchange tools. Clanwilliam identified that connecting these silos was a solvable problem — but only if you owned or operated key pieces of the exchange infrastructure.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p>The English-language operating environment, a shared regulatory philosophy with Ireland, and strong government investment in digital health infrastructure made ANZ particularly accessible for an Irish company with deep healthcare workflow expertise.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>The English-language operating environment, a shared regulatory philosophy with Ireland, and strong government investment in digital health infrastructure made ANZ particularly accessible for an Irish company with deep healthcare workflow expertise.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>2017</strong> — Acquired HealthLink (NZ-founded, ANZ coverage) <em>(Gained an established health messaging network across ANZ, including 15,000+ connected medical organisations.)</em></li><li><strong>2017–18</strong> — Acquired Konnect NET <em>(Added pharmacy connectivity and additional healthcare workflow capability in Australia.)</em></li><li><strong>Dec 2020</strong> — Merged HealthLink and Konnect NET <em>(Reduced regional operational fragmentation and created a cleaner ANZ platform structure ahead of further growth.)</em></li><li><strong>Mar 2024</strong> — Launched formal ANZ Division <em>(Formalised regional leadership (David Young as MD Australia, Mike Weiss as MD NZ) with four products: HealthLink, Konnect NET, Toniq, MBS.)</em></li><li><strong>Jan 2024</strong> — HealthLink acquired Telstra Health''s Argus, Connecting Care and eReferrals assets <em>(Consolidated a major competitor/complementary player; deepened secure messaging and e-referral market share across Australian healthcare.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ul><li><strong>2017</strong> — Acquired HealthLink (NZ-founded, ANZ coverage) <em>(Gained an established health messaging network across ANZ, including 15,000+ connected medical organisations.)</em></li><li><strong>2017–18</strong> — Acquired Konnect NET <em>(Added pharmacy connectivity and additional healthcare workflow capability in Australia.)</em></li><li><strong>Dec 2020</strong> — Merged HealthLink and Konnect NET <em>(Reduced regional operational fragmentation and created a cleaner ANZ platform structure ahead of further growth.)</em></li><li><strong>Mar 2024</strong> — Launched formal ANZ Division <em>(Formalised regional leadership (David Young as MD Australia, Mike Weiss as MD NZ) with four products: HealthLink, Konnect NET, Toniq, MBS.)</em></li><li><strong>Jan 2024</strong> — HealthLink acquired Telstra Health''s Argus, Connecting Care and eReferrals assets <em>(Consolidated a major competitor/complementary player; deepened secure messaging and e-referral market share across Australian healthcare.)</em></li></ul>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p><em>In regulated health markets, the fastest route to credibility is to buy trust that is already embedded in the workflow — then consolidate around interoperability.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>In regulated health markets, the fastest route to credibility is to buy trust that is already embedded in the workflow — then consolidate around interoperability.</em></p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Medical organisations connected</strong> — 15,000+ across Australasia <em>(HealthLink network data (healthlink.com.au))</em></li><li><strong>Clinical messages per year</strong> — 100 million+ <em>(HealthLink network data)</em></li><li><strong>ANZ Division product count</strong> — 4 (HealthLink, Konnect NET, Toniq, MBS) <em>(ANZ Division launch announcement, March 2024)</em></li><li><strong>Telstra Health assets acquired</strong> — Argus, Connecting Care, eReferrals <em>(MinterEllison deal announcement, Jan 2024)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Medical organisations connected</strong> — 15,000+ across Australasia <em>(HealthLink network data (healthlink.com.au))</em></li><li><strong>Clinical messages per year</strong> — 100 million+ <em>(HealthLink network data)</em></li><li><strong>ANZ Division product count</strong> — 4 (HealthLink, Konnect NET, Toniq, MBS) <em>(ANZ Division launch announcement, March 2024)</em></li><li><strong>Telstra Health assets acquired</strong> — Argus, Connecting Care, eReferrals <em>(MinterEllison deal announcement, Jan 2024)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, Clanwilliam''s playbook offers a clear template. The lessons below distil Clanwilliam''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, Clanwilliam''s playbook offers a clear template. The lessons below distil Clanwilliam''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Buy installed trust</strong> — Acquired HealthLink''s embedded clinical messaging network rather than building one. <em>(In complex systems, distribution is often acquired, not invented. Look for businesses with workflow lock-in.)</em></li><li><strong>Integrate before scaling</strong> — Merged HealthLink and Konnect NET before launching a formal ANZ division. <em>(Operational coherence should precede expansion messaging. Don''t promote fragmented assets.)</em></li><li><strong>Consolidate adjacencies</strong> — Acquired Telstra Health''s overlapping secure messaging and e-referrals footprint. <em>(Once inside a workflow category, strengthen the moat by absorbing complementary infrastructure before a competitor does.)</em></li><li><strong>Formalise with leadership</strong> — Appointed dedicated MD for Australia and MD for NZ as part of division launch. <em>(A named regional leader signals permanence to customers, partners and regulators more than any press release.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Buy installed trust</strong> — Acquired HealthLink''s embedded clinical messaging network rather than building one. <em>(In complex systems, distribution is often acquired, not invented. Look for businesses with workflow lock-in.)</em></li><li><strong>Integrate before scaling</strong> — Merged HealthLink and Konnect NET before launching a formal ANZ division. <em>(Operational coherence should precede expansion messaging. Don''t promote fragmented assets.)</em></li><li><strong>Consolidate adjacencies</strong> — Acquired Telstra Health''s overlapping secure messaging and e-referrals footprint. <em>(Once inside a workflow category, strengthen the moat by absorbing complementary infrastructure before a competitor does.)</em></li><li><strong>Formalise with leadership</strong> — Appointed dedicated MD for Australia and MD for NZ as part of division launch. <em>(A named regional leader signals permanence to customers, partners and regulators more than any press release.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ANZ Division launch announcement', 'https://insurtechnz.org.nz/2024/03/12/clanwilliam-launches-anz-division-in-a-commitment-to-the-future-of-healthcare-across-australia-and-new-zealand/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'MinterEllison on Telstra Health acquisition', 'https://www.minterellison.com/articles/minterellison-advises-clanwilliam-on-telstra-health-acquisition', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Telstra Health sale announcement', 'https://www.telstrahealth.com/healthlink-acquires-telstra-health-argus-connecting-care-and-ereferrals-business/', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'HealthLink acquisition background (Waterman)', 'https://www.waterman.co.nz/news/healthlink-acquired-by-global-healthcare-technology-specialist/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Pulse IT on Telstra Health Argus deal', 'https://www.pulseit.news/australian-digital-health/healthlink-swoops-on-telstra-healths-secure-messaging-and-ereferrals-business/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'HealthLink network scale (corporate site)', 'https://www.healthlink.com.au/clanwilliams-healthlink-acquires-telstra-healths-argus-connecting-care-and-ereferrals-business/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 2/6: Spectrum.Life (spectrum-life-anz-market-entry)
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
    'spectrum-life-anz-market-entry', 'How Spectrum.Life Entered the ANZ Market', 'How a Dublin-founded digital wellbeing platform skipped the greenfield build and entered Australia simultaneously across three complementary verticals — workplace mental health, EAP, and specialist virtual care — by acquiring three local businesses on the same day.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    4, ARRAY['How a Dublin-founded digital wellbeing platform skipped the greenfield build and entered Australia simultaneously across three complementary verticals — workplace mental health, EAP, and specialist virtual care — by acquiring three local businesses on the same day.', 'Spectrum.Life was founded in Dublin in 2018 by Stuart McGoldrick and Stephen Costello.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Insurtech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Spectrum.Life', 'Ireland', 'Australia & New Zealand',
      '2026-01-01', 'Insurtech', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Stuart McGoldrick', 'Co-founder', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Stephen Costello', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Spectrum.Life was founded in Dublin in 2018 by Stuart McGoldrick and Stephen Costello. It operates a digital-first mental health and wellbeing platform serving employers, insurers and universities. The platform covers proactive wellbeing tools, digital therapy, EAP, and clinical triage through a single access point — making it well positioned to replace the fragmented point-solutions most employers and insurers were managing.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Spectrum.Life was founded in Dublin in 2018 by Stuart McGoldrick and Stephen Costello. It operates a digital-first mental health and wellbeing platform serving employers, insurers and universities. The platform covers proactive wellbeing tools, digital therapy, EAP, and clinical triage through a single access point — making it well positioned to replace the fragmented point-solutions most employers and insurers were managing.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>By 2024, the company served more than 4,000 corporate clients and 7.5 million insurance members. It raised a €17 million Series B round in May 2024 from Act Venture Capital and existing investors to fund international expansion — naming Australia as a target. In October 2024, it crossed 300 staff globally, and publicly targeted 500 by end of 2025 and revenue of €100 million by 2028.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>By 2024, the company served more than 4,000 corporate clients and 7.5 million insurance members. It raised a €17 million Series B round in May 2024 from Act Venture Capital and existing investors to fund international expansion — naming Australia as a target. In October 2024, it crossed 300 staff globally, and publicly targeted 500 by end of 2025 and revenue of €100 million by 2028.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>Australia presented a near-perfect storm of demand drivers. Mental health-related workers'' compensation claims had risen 37 percent since 2017–18. Life insurance TPD claims for mental health among people in their 30s had risen by 732 percent over a decade. Employers were under pressure from new psychosocial safety obligations introduced in Australian WHS laws. And the EAP provider market remained fragmented, largely phone-based, and resistant to digital change.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia presented a near-perfect storm of demand drivers. Mental health-related workers'' compensation claims had risen 37 percent since 2017–18. Life insurance TPD claims for mental health among people in their 30s had risen by 732 percent over a decade. Employers were under pressure from new psychosocial safety obligations introduced in Australian WHS laws. And the EAP provider market remained fragmented, largely phone-based, and resistant to digital change.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p>Spectrum.Life had already demonstrated in Ireland and the UK that a digitally-led, outcomes-focused model could win enterprise clients quickly. Australia replicated those macro conditions — regulatory tailwind, insurer pressure, employer demand — and offered a large enough addressable market to justify major investment.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Spectrum.Life had already demonstrated in Ireland and the UK that a digitally-led, outcomes-focused model could win enterprise clients quickly. Australia replicated those macro conditions — regulatory tailwind, insurer pressure, employer demand — and offered a large enough addressable market to justify major investment.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p>On 17 March 2026, Spectrum.Life announced the simultaneous acquisition of three Australian businesses: MindFit at Work (Melbourne), We Lysn (Sydney) and Valion Health (Sydney). The company was explicit that it chose not to enter organically — it wanted immediate clinical depth, local regulatory familiarity and customer relationships that only established local operators could provide.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>On 17 March 2026, Spectrum.Life announced the simultaneous acquisition of three Australian businesses: MindFit at Work (Melbourne), We Lysn (Sydney) and Valion Health (Sydney). The company was explicit that it chose not to enter organically — it wanted immediate clinical depth, local regulatory familiarity and customer relationships that only established local operators could provide.</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>MindFit at Work</strong> — Melbourne <em>(Evidence-based workplace mental health and psychosocial risk programmes; APAC coverage including Singapore)</em></li><li><strong>We Lysn</strong> — Sydney <em>(Digital mental health, EAP, telehealth counselling (same/next-day access))</em></li><li><strong>Valion Health</strong> — Sydney <em>(ACHS-accredited specialist virtual care (cancer, metabolic, chronic conditions))</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ul><li><strong>MindFit at Work</strong> — Melbourne <em>(Evidence-based workplace mental health and psychosocial risk programmes; APAC coverage including Singapore)</em></li><li><strong>We Lysn</strong> — Sydney <em>(Digital mental health, EAP, telehealth counselling (same/next-day access))</em></li><li><strong>Valion Health</strong> — Sydney <em>(ACHS-accredited specialist virtual care (cancer, metabolic, chronic conditions))</em></li></ul>', 6, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 7) THEN
    UPDATE content_bodies SET body_text = '<p>The three businesses were highly complementary. Together they gave Spectrum.Life an employer-facing prevention product, a frontline digital counselling service, and a specialist insurer pathway — covering the full spectrum from early intervention to complex case management.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 7;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>The three businesses were highly complementary. Together they gave Spectrum.Life an employer-facing prevention product, a frontline digital counselling service, and a specialist insurer pathway — covering the full spectrum from early intervention to complex case management.</p>', 7, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p><em>&ldquo;We chose to make a long-term strategic commitment to Australia. One platform. One clinical pathway. 24/7 clinical access. Measurable outcomes.&rdquo; <span style="color: var(--muted);">— Stephen Costello, CEO, Spectrum.Life (March 2026)</span></em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>&ldquo;We chose to make a long-term strategic commitment to Australia. One platform. One clinical pathway. 24/7 clinical access. Measurable outcomes.&rdquo; <span style="color: var(--muted);">— Stephen Costello, CEO, Spectrum.Life (March 2026)</span></em></p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Australian employees at launch</strong> — 35 <em>(Healthcare & Protection, March 2026)</em></li><li><strong>New AU roles planned (12 months)</strong> — 100+ <em>(CFO Tech / Spectrum.Life press release)</em></li><li><strong>Global members at entry</strong> — 15 million+ <em>(Spectrum.Life funding announcement 2024)</em></li><li><strong>Global corporate clients</strong> — 4,000+ corporate / 7.5M insurance members <em>(InsurTech Insights interview, Nov 2024)</em></li><li><strong>Deloitte Fast 50 Ireland 2024 rank</strong> — 41st <em>(WireNews, November 2024)</em></li><li><strong>Revenue target</strong> — €100M by 2028 <em>(Business & Finance Q&A, June 2025)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Australian employees at launch</strong> — 35 <em>(Healthcare & Protection, March 2026)</em></li><li><strong>New AU roles planned (12 months)</strong> — 100+ <em>(CFO Tech / Spectrum.Life press release)</em></li><li><strong>Global members at entry</strong> — 15 million+ <em>(Spectrum.Life funding announcement 2024)</em></li><li><strong>Global corporate clients</strong> — 4,000+ corporate / 7.5M insurance members <em>(InsurTech Insights interview, Nov 2024)</em></li><li><strong>Deloitte Fast 50 Ireland 2024 rank</strong> — 41st <em>(WireNews, November 2024)</em></li><li><strong>Revenue target</strong> — €100M by 2028 <em>(Business & Finance Q&A, June 2025)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, Spectrum.Life''s playbook offers a clear template. The lessons below distil Spectrum.Life''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, Spectrum.Life''s playbook offers a clear template. The lessons below distil Spectrum.Life''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Use one expansion market to validate the next</strong> — Built UK scale and proof points before targeting Australia. UK became the case study that made the Australia investment case. <em>(Sequence markets deliberately. Your second market is easier to enter if your first market has already proved the model works internationally.)</em></li><li><strong>Bundle complementary acquisitions</strong> — Bought three firms covering different parts of the care pathway simultaneously — employer prevention, frontline access, specialist care. <em>(When a category is fragmented, acquire breadth rather than build each component. Speed and coverage compound faster than organic build.)</em></li><li><strong>Use market data to justify the entry</strong> — Cited the 37% rise in AU mental health claims to underpin the commercial rationale in media and to prospects. <em>(Lead with the market problem, not the company. Local data makes your entry story immediately relevant to customers, partners and press.)</em></li><li><strong>Announce jobs alongside acquisitions</strong> — Committed to 100+ new roles within 12 months at the time of the acquisition announcement. <em>(Hiring commitments signal permanence to customers, regulators and local government. They also generate media coverage beyond the deal itself.)</em></li><li><strong>Lead with outcomes language</strong> — Positioned the combined platform around measurable outcomes and 24/7 clinical access — not features. <em>(In health and insurance, procurement teams respond to outcome architecture and accountability language, not feature lists.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Use one expansion market to validate the next</strong> — Built UK scale and proof points before targeting Australia. UK became the case study that made the Australia investment case. <em>(Sequence markets deliberately. Your second market is easier to enter if your first market has already proved the model works internationally.)</em></li><li><strong>Bundle complementary acquisitions</strong> — Bought three firms covering different parts of the care pathway simultaneously — employer prevention, frontline access, specialist care. <em>(When a category is fragmented, acquire breadth rather than build each component. Speed and coverage compound faster than organic build.)</em></li><li><strong>Use market data to justify the entry</strong> — Cited the 37% rise in AU mental health claims to underpin the commercial rationale in media and to prospects. <em>(Lead with the market problem, not the company. Local data makes your entry story immediately relevant to customers, partners and press.)</em></li><li><strong>Announce jobs alongside acquisitions</strong> — Committed to 100+ new roles within 12 months at the time of the acquisition announcement. <em>(Hiring commitments signal permanence to customers, regulators and local government. They also generate media coverage beyond the deal itself.)</em></li><li><strong>Lead with outcomes language</strong> — Positioned the combined platform around measurable outcomes and 24/7 clinical access — not features. <em>(In health and insurance, procurement teams respond to outcome architecture and accountability language, not feature lists.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Healthcare & Protection — triple acquisition announcement', 'https://healthcareandprotection.com/spectrum-life-expands-into-australia-through-mindfit-we-lysn-and-valion-acquisitions/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Spectrum.Life official press release', 'https://www.spectrum.life/resources/press-releases/spectrum-life-expands-into-australia-with-long-term-strategic-commitment/', 2, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'CFO Tech Australia — triple acquisition coverage', 'https://cfotech.com.au/story/spectrum-life-buys-three-aussie-digital-health-firms', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Melbourne Insider — Australia expansion story', 'https://melbourne-insider.au/spectrum-life-australia-expansion/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Silicon Republic — Series B funding announcement', 'https://www.siliconrepublic.com/start-ups/spectrum-life-funding-digital-health-ireland-uk', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Spectrum.Life €17M funding announcement (official)', 'https://www.spectrum.life/resources/spectrum-life-funding-announcement-may-2024/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'EIN Presswire — €17M round details and international growth plans', 'https://www.einpresswire.com/article/714935154/spectrum-life-closes-17m-investment-round-to-accelerate-international-growth', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'InsurTech Insights — CEO Stephen Costello interview', 'https://www.insurtechinsights.com/startup-story-spectrum-life-ceo-and-co-founder-stephen-costello-talks-technology-and-wellbeing/', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'TechBuzz Ireland — 300 staff milestone', 'https://techbuzzireland.com/2024/10/09/spectrum-life-surpasses-300-employees-and-eyes-growth-to-500-by-end-of-2025/', 9, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'WireNews — Deloitte Fast 50 Ireland 2024 ranking', 'https://www.wirenn.com/post/spectrum-life-ranked-41st-in-the-deloitte-ireland-2024-technology-fast-50-awards', 10, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Business & Finance Q&A — Stephen Costello on mission and €100M target', 'https://businessandfinance.com/news/my-primary-focus-is-delivering-on-our-mission-to-save-and-change-as-many-lives-as-possible-qanda-with-stephen-costello/', 11, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AIHS.org.au — 37% mental health claims rise in Australian workers'' compensation', 'https://aihs.org.au/Web/Web/Advocacy-Media/All-News/2024/03-March/Mental-health-conditions-jump-37-per-cent-in-workers-compensation-claims.aspx', 12, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Valion Health — about page (founded by Michael Marthick)', 'https://valionhealth.com.au/about-valion/', 13, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'SBS News — We Lysn founding story', 'https://www.sbs.com.au/news/small-business-secrets/article/how-start-up-lysn-is-removing-the-stigma-surrounding-seeking-mental-health-support/0x1cd1dtu', 14, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 3/6: T-Pro (t-pro-anz-market-entry)
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
    't-pro-anz-market-entry', 'How T-Pro Entered the ANZ Market', 'How a Dublin-founded healthcare speech and documentation company expanded across Australia and New Zealand through three targeted acquisitions — buying local customer relationships and clinical workflow knowledge faster than any organic sales team could build them.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['How a Dublin-founded healthcare speech and documentation company expanded across Australia and New Zealand through three targeted acquisitions — buying local customer relationships and clinical workflow knowledge faster than any organic sales team could build them.', 'T-Pro is an Irish healthcare technology company specialising in speech recognition, clinical documentation and AI-enabled workflow tools for healthcare providers.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Healthcare AI"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'T-Pro', 'Ireland', 'Australia & New Zealand',
      NULL, 'Healthcare AI', NULL, NULL, NULL
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
    UPDATE content_bodies SET body_text = '<p>T-Pro is an Irish healthcare technology company specialising in speech recognition, clinical documentation and AI-enabled workflow tools for healthcare providers. Its technology reduces the administrative burden on clinicians by automating documentation tasks from dictation to structured clinical notes.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>T-Pro is an Irish healthcare technology company specialising in speech recognition, clinical documentation and AI-enabled workflow tools for healthcare providers. Its technology reduces the administrative burden on clinicians by automating documentation tasks from dictation to structured clinical notes.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>T-Pro''s ANZ expansion strategy was acquisition-led from the outset. Rather than entering with its own sales team or a channel partner, it identified established local documentation and transcription businesses that already had deep relationships with hospitals, clinics and healthcare networks — then acquired them and layered its AI documentation platform over the existing operations.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>T-Pro''s ANZ expansion strategy was acquisition-led from the outset. Rather than entering with its own sales team or a channel partner, it identified established local documentation and transcription businesses that already had deep relationships with hospitals, clinics and healthcare networks — then acquired them and layered its AI documentation platform over the existing operations.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>2022</strong> — SyberScribe <em>(Melbourne, Australia)</em></li><li><strong>2022</strong> — Livingbridge investment <em>(UK PE backing)</em></li><li><strong>2023</strong> — NTS Transcriptions <em>(Australia)</em></li><li><strong>2025</strong> — Sound Business Systems (SBS) <em>(New Zealand + Australia)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<ul><li><strong>2022</strong> — SyberScribe <em>(Melbourne, Australia)</em></li><li><strong>2022</strong> — Livingbridge investment <em>(UK PE backing)</em></li><li><strong>2023</strong> — NTS Transcriptions <em>(Australia)</em></li><li><strong>2025</strong> — Sound Business Systems (SBS) <em>(New Zealand + Australia)</em></li></ul>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Healthcare documentation sits at the intersection of clinician behaviour, data compliance and hospital IT infrastructure. Local relationships matter enormously because switching documentation tools requires clinical workflow change management — something hospitals only do when they trust the vendor deeply. T-Pro''s acquisition strategy meant it inherited trusted local operators rather than asking customers to take a risk on a remote Irish startup.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>Healthcare documentation sits at the intersection of clinician behaviour, data compliance and hospital IT infrastructure. Local relationships matter enormously because switching documentation tools requires clinical workflow change management — something hospitals only do when they trust the vendor deeply. T-Pro''s acquisition strategy meant it inherited trusted local operators rather than asking customers to take a risk on a remote Irish startup.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>By acquiring three ANZ businesses rather than one, T-Pro built a narrative of regional commitment and demonstrated to healthcare networks that it was building a long-term APAC presence rather than testing the market opportunistically.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>By acquiring three ANZ businesses rather than one, T-Pro built a narrative of regional commitment and demonstrated to healthcare networks that it was building a long-term APAC presence rather than testing the market opportunistically.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><em>T-Pro''s ANZ story shows that in specialist enterprise categories, acquisitions function simultaneously as distribution, localisation and trust-building — compressing years of relationship development into a single transaction.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>T-Pro''s ANZ story shows that in specialist enterprise categories, acquisitions function simultaneously as distribution, localisation and trust-building — compressing years of relationship development into a single transaction.</em></p>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Founded</strong>: Ireland</li><li><strong>Entry mode</strong>: Serial acquisition</li><li><strong>Acquisition 1</strong>: SyberScribe, Melbourne (2022)</li><li><strong>Acquisition 2</strong>: NTS Transcriptions, AU (2023)</li><li><strong>Acquisition 3</strong>: Sound Business Systems, NZ/AU (2025)</li><li><strong>PE backing</strong>: Livingbridge (2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Founded</strong>: Ireland</li><li><strong>Entry mode</strong>: Serial acquisition</li><li><strong>Acquisition 1</strong>: SyberScribe, Melbourne (2022)</li><li><strong>Acquisition 2</strong>: NTS Transcriptions, AU (2023)</li><li><strong>Acquisition 3</strong>: Sound Business Systems, NZ/AU (2025)</li><li><strong>PE backing</strong>: Livingbridge (2022)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, T-Pro''s playbook offers a clear template. The lessons below distil T-Pro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, T-Pro''s playbook offers a clear template. The lessons below distil T-Pro''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let acquisitions replace the sales team</strong> — Each acquired business brought its own hospital and clinic relationships. <em>(In enterprise healthcare, distribution IS the product. Buying an established operator often beats hiring a country manager and starting from zero.)</em></li><li><strong>Layer technology over trusted operations</strong> — T-Pro applied its AI documentation platform over acquired businesses rather than replacing them. <em>(Don''t replace what works locally. Add your IP on top of existing customer trust.)</em></li><li><strong>Build a serial acquisition narrative</strong> — Three acquisitions created a regional expansion story that one deal could not. <em>(Announcing a second and third acquisition compounds the credibility signal from the first. You stop looking like an experiment and start looking like a regional player.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Let acquisitions replace the sales team</strong> — Each acquired business brought its own hospital and clinic relationships. <em>(In enterprise healthcare, distribution IS the product. Buying an established operator often beats hiring a country manager and starting from zero.)</em></li><li><strong>Layer technology over trusted operations</strong> — T-Pro applied its AI documentation platform over acquired businesses rather than replacing them. <em>(Don''t replace what works locally. Add your IP on top of existing customer trust.)</em></li><li><strong>Build a serial acquisition narrative</strong> — Three acquisitions created a regional expansion story that one deal could not. <em>(Announcing a second and third acquisition compounds the credibility signal from the first. You stop looking like an experiment and start looking like a regional player.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Silicon Republic — T-Pro acquires SyberScribe (2022)', 'https://www.siliconrepublic.com/business/t-pro-syberscribe-acquisition-australia-speech-transcription-technology', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ThinkBusiness — T-Pro voice AI and NTS (2024 profile)', 'https://www.thinkbusiness.ie/articles/tpro-voice-ai-speech-technology/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'T-Pro blog — Sound Business Systems joins the group', 'https://blog.tpro.io/sbs-part-of-tpro', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Livingbridge — T-Pro acquires SBS (PE announcement)', 'https://www.livingbridge.com/livingroom/t-pro-acquires-sound-business-systems-expanding-global-healthcare-ai-reach', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Sound Business Systems — corporate site', 'https://soundbusiness.co.nz', 5, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 4/6: Fexco (fexco-anz-market-entry)
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
    'fexco-anz-market-entry', 'How Fexco Entered the ANZ Market', 'How a Kerry-founded payments and FX group used New Zealand as its Pacific base for over a decade, built a 400-person regional operation, and then used that platform to launch into Australian retail with hard numbers behind the expansion story.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    3, ARRAY['How a Kerry-founded payments and FX group used New Zealand as its Pacific base for over a decade, built a 400-person regional operation, and then used that platform to launch into Australian retail with hard numbers behind the expansion story.', 'Fexco is one of Ireland''s largest private companies, founded in 1981 in Killorglin, County Kerry by Brian McCarthy.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Fexco', 'Ireland', 'Australia & New Zealand',
      '2009-01-01', 'Fintech', 1, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Brian McCarthy', 'Founder', true);
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
    UPDATE content_bodies SET body_text = '<p>Fexco is one of Ireland''s largest private companies, founded in 1981 in Killorglin, County Kerry by Brian McCarthy. It operates across payments, foreign exchange, financial services and business outsourcing. In the Pacific, its brand is anchored around currency exchange and remittance services under the No1 Currency banner, operating as a major Western Union master agent across the region.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Fexco is one of Ireland''s largest private companies, founded in 1981 in Killorglin, County Kerry by Brian McCarthy. It operates across payments, foreign exchange, financial services and business outsourcing. In the Pacific, its brand is anchored around currency exchange and remittance services under the No1 Currency banner, operating as a major Western Union master agent across the region.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Fexco''s ANZ story begins in New Zealand. In 2009 it acquired Federal Pacific in Auckland, which it later renamed Fexco Pacific. From that base it expanded across New Zealand and Pacific island markets — building a network of 24 stores in New Zealand, over 100 offices and outlets across the Pacific, and a team of more than 400 staff. With more than two million transactions per year, Fexco Pacific became a significant financial services operation in its own right.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Fexco''s ANZ story begins in New Zealand. In 2009 it acquired Federal Pacific in Auckland, which it later renamed Fexco Pacific. From that base it expanded across New Zealand and Pacific island markets — building a network of 24 stores in New Zealand, over 100 offices and outlets across the Pacific, and a team of more than 400 staff. With more than two million transactions per year, Fexco Pacific became a significant financial services operation in its own right.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>In September 2024, Fexco took the next logical step and opened two No1 Currency stores in Sydney — at Westfield Hurstville and Westfield Liverpool. The company explicitly framed this as the start of a broader Australian rollout, with plans for more than 20 outlets and 80-plus local jobs.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In September 2024, Fexco took the next logical step and opened two No1 Currency stores in Sydney — at Westfield Hurstville and Westfield Liverpool. The company explicitly framed this as the start of a broader Australian rollout, with plans for more than 20 outlets and 80-plus local jobs.</p>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Most market-entry advice assumes Australia is the primary target and New Zealand is an afterthought. Fexco inverts this entirely. It built 15 years of Pacific operating experience before entering Australian retail — and when it did, it arrived with proven unit economics, brand recognition among Pacific diaspora communities, and a credible expansion narrative backed by real numbers.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>Most market-entry advice assumes Australia is the primary target and New Zealand is an afterthought. Fexco inverts this entirely. It built 15 years of Pacific operating experience before entering Australian retail — and when it did, it arrived with proven unit economics, brand recognition among Pacific diaspora communities, and a credible expansion narrative backed by real numbers.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Fexco also had an indirect Australian connection through its co-ownership of PICA Group, one of Australia''s largest strata property services companies. This gave the Fexco leadership team long-running familiarity with the Australian operating and regulatory environment before the currency retail rollout.</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>Fexco also had an indirect Australian connection through its co-ownership of PICA Group, one of Australia''s largest strata property services companies. This gave the Fexco leadership team long-running familiarity with the Australian operating and regulatory environment before the currency retail rollout.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><em>New Zealand doesn''t have to be a test market or a secondary afterthought. For the right business, it can be the foundation of a decade-long Pacific operation that makes Australia a more confident expansion, not a speculative one.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>New Zealand doesn''t have to be a test market or a secondary afterthought. For the right business, it can be the foundation of a decade-long Pacific operation that makes Australia a more confident expansion, not a speculative one.</em></p>', 3, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Founded</strong>: 1981, Killorglin, Kerry</li><li><strong>NZ entry</strong>: 2009 (Federal Pacific acquisition)</li><li><strong>Pacific staff</strong>: 400+</li><li><strong>NZ stores</strong>: 24</li><li><strong>AU entry</strong>: Sept 2024 (2 Sydney stores)</li><li><strong>AU plan</strong>: 20+ outlets, 80+ jobs</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Founded</strong>: 1981, Killorglin, Kerry</li><li><strong>NZ entry</strong>: 2009 (Federal Pacific acquisition)</li><li><strong>Pacific staff</strong>: 400+</li><li><strong>NZ stores</strong>: 24</li><li><strong>AU entry</strong>: Sept 2024 (2 Sydney stores)</li><li><strong>AU plan</strong>: 20+ outlets, 80+ jobs</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, Fexco''s playbook offers a clear template. The lessons below distil Fexco''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, Fexco''s playbook offers a clear template. The lessons below distil Fexco''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>NZ as a genuine operating base</strong> — Built 400+ staff, 24 stores and 2M+ annual transactions before moving into Australia. <em>(NZ is a real market, not a stepping stone. The operating depth you build there is real credibility when you want to expand.)</em></li><li><strong>Pacific network as a moat</strong> — Became the largest Western Union master agent in the Pacific — hard to replicate quickly. <em>(In financial services and adjacent sectors, network infrastructure is a durable moat. Build the network before expanding the brand.)</em></li><li><strong>Lead the Australia announcement with jobs and footprint</strong> — Announced exact store locations, job creation numbers and a multi-year rollout plan. <em>(Specific commitments — named locations, headcount, timelines — earn media and government goodwill. Vague expansion plans do not.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>NZ as a genuine operating base</strong> — Built 400+ staff, 24 stores and 2M+ annual transactions before moving into Australia. <em>(NZ is a real market, not a stepping stone. The operating depth you build there is real credibility when you want to expand.)</em></li><li><strong>Pacific network as a moat</strong> — Became the largest Western Union master agent in the Pacific — hard to replicate quickly. <em>(In financial services and adjacent sectors, network infrastructure is a durable moat. Build the network before expanding the brand.)</em></li><li><strong>Lead the Australia announcement with jobs and footprint</strong> — Announced exact store locations, job creation numbers and a multi-year rollout plan. <em>(Specific commitments — named locations, headcount, timelines — earn media and government goodwill. Vague expansion plans do not.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fexco — Sydney store launch announcement (Oct 2024)', 'https://www.fexco.com/news-and-insights/fexco-expands-global-presence-with-launch-of-two-new-no1-currency-stores-in-sydney-australia/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fexco Pacific LinkedIn — network size and description', 'https://nz.linkedin.com/company/fexco-pacific-ltd', 2, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fexco corporate homepage', 'https://www.fexco.com', 3, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 5/6: LearnUpon (learnupon-anz-market-entry)
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
    'learnupon-anz-market-entry', 'How LearnUpon Entered the ANZ Market', 'How a Dublin-founded learning management system company grew to 100+ APAC enterprise customers, 80% headcount growth in two years, and a bigger Sydney HQ — by proving demand first globally and then investing in regional density when the customer base justified it.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['How a Dublin-founded learning management system company grew to 100+ APAC enterprise customers, 80% headcount growth in two years, and a bigger Sydney HQ — by proving demand first globally and then investing in regional density when the customer base justified it.', 'LearnUpon was founded in June 2012 by Brendan Noud (CEO) and Des Anderson (CTO) in Dublin.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Ireland"}, {"icon": "Briefcase", "label": "Sector", "value": "Edtech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'LearnUpon', 'Ireland', 'Australia & New Zealand',
      NULL, 'Edtech', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Brendan Noud', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Des Anderson', 'Co-founder & CTO', false);
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
    UPDATE content_bodies SET body_text = '<p>LearnUpon was founded in June 2012 by Brendan Noud (CEO) and Des Anderson (CTO) in Dublin. It builds learning management software that companies use to train employees, customers and partners at scale. By 2026 it served more than 1,500 global customers across 40+ countries, with over 20 million active users and 150 million completed courses on the platform.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>LearnUpon was founded in June 2012 by Brendan Noud (CEO) and Des Anderson (CTO) in Dublin. It builds learning management software that companies use to train employees, customers and partners at scale. By 2026 it served more than 1,500 global customers across 40+ countries, with over 20 million active users and 150 million completed courses on the platform.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>In October 2020, LearnUpon raised a $56 million Series A from Summit Partners — one of Ireland''s largest edtech funding rounds — which accelerated product investment and international hiring. Australia and the broader APAC region were priorities in that growth plan.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In October 2020, LearnUpon raised a $56 million Series A from Summit Partners — one of Ireland''s largest edtech funding rounds — which accelerated product investment and international hiring. Australia and the broader APAC region were priorities in that growth plan.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p>LearnUpon''s Sydney office had been operational for more than six years by early 2026. Rather than a dramatic launch, its ANZ presence was built incrementally — winning enterprise customers, building a local support function and growing the team as APAC revenue justified investment. In June 2024, it appointed Fiona Sweeney as APAC Director, signalling stronger regional leadership commitment.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>LearnUpon''s Sydney office had been operational for more than six years by early 2026. Rather than a dramatic launch, its ANZ presence was built incrementally — winning enterprise customers, building a local support function and growing the team as APAC revenue justified investment. In June 2024, it appointed Fiona Sweeney as APAC Director, signalling stronger regional leadership commitment.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p>In March 2026, LearnUpon announced it was accelerating APAC expansion through a larger Sydney headquarters at JustCo, deeper regional investment and the integration of Courseau — an AI-native course creation platform it had recently acquired. The announcement confirmed 100+ customers in the APAC region and said local headcount had grown 80% over two years.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>In March 2026, LearnUpon announced it was accelerating APAC expansion through a larger Sydney headquarters at JustCo, deeper regional investment and the integration of Courseau — an AI-native course creation platform it had recently acquired. The announcement confirmed 100+ customers in the APAC region and said local headcount had grown 80% over two years.</p>', 4, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p><em>LearnUpon''s APAC story is a counterpoint to acquisition-led entries. Sometimes the right move is not to buy — it''s to serve the customers who find you, then invest in local density once the concentration justifies it.</em></p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p><em>LearnUpon''s APAC story is a counterpoint to acquisition-led entries. Sometimes the right move is not to buy — it''s to serve the customers who find you, then invest in local density once the concentration justifies it.</em></p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Healthcare Australia</strong> — Healthcare / Staffing <em>(Workforce learning and compliance training)</em></li><li><strong>WorkPac</strong> — Labour hire <em>(Onboarding and skills training at scale)</em></li><li><strong>Jetpilot</strong> — Consumer goods <em>(Product knowledge and dealer training)</em></li><li><strong>Montu</strong> — Pharmaceutical <em>(Regulatory and clinical learning)</em></li><li><strong>Morningstar</strong> — Financial services <em>(Professional development)</em></li><li><strong>ACSO</strong> — Corrections/Justice <em>(Staff training and compliance)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Healthcare Australia</strong> — Healthcare / Staffing <em>(Workforce learning and compliance training)</em></li><li><strong>WorkPac</strong> — Labour hire <em>(Onboarding and skills training at scale)</em></li><li><strong>Jetpilot</strong> — Consumer goods <em>(Product knowledge and dealer training)</em></li><li><strong>Montu</strong> — Pharmaceutical <em>(Regulatory and clinical learning)</em></li><li><strong>Morningstar</strong> — Financial services <em>(Professional development)</em></li><li><strong>ACSO</strong> — Corrections/Justice <em>(Staff training and compliance)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For Irish operators considering ANZ entry, LearnUpon''s playbook offers a clear template. The lessons below distil LearnUpon''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For Irish operators considering ANZ entry, LearnUpon''s playbook offers a clear template. The lessons below distil LearnUpon''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Let customer pull justify local investment</strong> — Grew APAC organically for six-plus years before making a bigger local commitment. <em>(Don''t invest in regional office and leadership before the customer demand exists. Let inbound traction tell you when the market is ready for more investment.)</em></li><li><strong>Add AI to accelerate regional relevance</strong> — Used the Courseau acquisition to offer AI course creation as a local differentiator. <em>(An AI acquisition can refresh the expansion story in a region that already knows your product.)</em></li><li><strong>Name the local headcount growth</strong> — Cited 80% headcount growth in two years as a proof point in expansion announcement. <em>(Percentage headcount growth is a powerful signal — it shows the region is a real business unit, not a satellite sales office.)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Let customer pull justify local investment</strong> — Grew APAC organically for six-plus years before making a bigger local commitment. <em>(Don''t invest in regional office and leadership before the customer demand exists. Let inbound traction tell you when the market is ready for more investment.)</em></li><li><strong>Add AI to accelerate regional relevance</strong> — Used the Courseau acquisition to offer AI course creation as a local differentiator. <em>(An AI acquisition can refresh the expansion story in a region that already knows your product.)</em></li><li><strong>Name the local headcount growth</strong> — Cited 80% headcount growth in two years as a proof point in expansion announcement. <em>(Percentage headcount growth is a powerful signal — it shows the region is a real business unit, not a satellite sales office.)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'LearnUpon — APAC expansion announcement (newsroom)', 'https://www.learnupon.com/newsroom/learnupon-accelerates-apac-expansion/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'IT Brief Australia — APAC growth and Courseau', 'https://itbrief.com.au/story/learnupon-boosts-apac-growth-with-ai-course-platform', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Medianet — Sydney HQ and Courseau acquisition', 'https://newshub.medianet.com.au/2026/03/learnupon-accelerates-apac-expansion-with-new-sydney-headquarters-and-ai-native-courseau/144128/', 3, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Mirage News — APAC Sydney HQ update', 'https://www.miragenews.com/learnupon-expands-apac-with-sydney-hq-ai-1637940/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'BusinessWire — 2025 year-end performance and global recognition', 'https://www.businesswire.com/news/home/20260129847362/en/LearnUpon-Ends-2025-With-Breakthrough-Growth-Product-Innovation-and-Global-Recognition', 5, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;

-- Case 6/6: Kyckr (kyckr-anz-market-entry)
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
