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
