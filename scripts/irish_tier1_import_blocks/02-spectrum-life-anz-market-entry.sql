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
