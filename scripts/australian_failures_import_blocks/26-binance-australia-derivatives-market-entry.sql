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
    'binance-australia-derivatives-market-entry', 'How Binance Australia Derivatives Lost Its AFSL', 'Binance Australia Derivatives — operated by Oztures Trading Pty Ltd as the Australian Financial Services licensee for the Binance global exchange''s derivatives products — had its AFSL cancelled by ASIC in April 2023 after a targeted review found systemic misclassification of retail clients as wholesale clients.',
    'e836d932-ac9d-4333-a1bf-9c05faa12340'::uuid, 'case_study', 'published', false,
    3, ARRAY['Binance Australia Derivatives — operated by Oztures Trading Pty Ltd as the Australian Financial Services licensee for the Binance global exchange''s derivatives products — had its AFSL cancelled by ASIC in April 2023 after a targeted review found systemic misclassification of retail clients as wholesale clients.', 'Binance Australia Derivatives paid approximately A$13.1 million in client compensation during 2023 under an ASIC-supervised remediation programme.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Cayman Islands"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech / Crypto Derivatives"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      content_id, company_name, company_logo, website, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Binance Australia Derivatives', 'https://img.logo.dev/binance.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://binance.com', 'Cayman Islands', 'Australia',
      '2022-01-01', 'Fintech / Crypto Derivatives', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://binance.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/binance.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Changpeng Zhao', 'Founder & former CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>Binance Australia Derivatives — operated by Oztures Trading Pty Ltd as the Australian Financial Services licensee for the Binance global exchange''s derivatives products — had its AFSL cancelled by ASIC in April 2023 after a targeted review found systemic misclassification of retail clients as wholesale clients. The regulator''s subsequent civil penalty proceedings concluded in March 2026 with a A$10 million Federal Court penalty, on top of approximately A$13.1 million in client compensation already paid in 2023. The case is the leading Australian authority on AFS-licensee onboarding obligations for offshore-controlled digital assets businesses.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Binance Australia Derivatives — operated by Oztures Trading Pty Ltd as the Australian Financial Services licensee for the Binance global exchange''s derivatives products — had its AFSL cancelled by ASIC in April 2023 after a targeted review found systemic misclassification of retail clients as wholesale clients. The regulator''s subsequent civil penalty proceedings concluded in March 2026 with a A$10 million Federal Court penalty, on top of approximately A$13.1 million in client compensation already paid in 2023. The case is the leading Australian authority on AFS-licensee onboarding obligations for offshore-controlled digital assets businesses.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Binance entered Australia for derivatives via the Oztures Trading entity, which held an AFS licence permitting issuance of crypto-derivatives products to "wholesale clients" (defined under s761G of the Corporations Act as sophisticated investors meeting wealth, income, or professional tests). The entry was deliberately structured to avoid the more onerous retail-client AFS licensing regime — a common offshore digital-assets entry pattern.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Binance entered Australia for derivatives via the Oztures Trading entity, which held an AFS licence permitting issuance of crypto-derivatives products to "wholesale clients" (defined under s761G of the Corporations Act as sophisticated investors meeting wealth, income, or professional tests). The entry was deliberately structured to avoid the more onerous retail-client AFS licensing regime — a common offshore digital-assets entry pattern.</p>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_entry AND sort_order > 2;

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
    UPDATE content_bodies SET body_text = '<ul><li><strong>524 retail clients misclassified as wholesale (July 2022 – April 2023):</strong> ASIC''s review found that Binance Australia Derivatives had treated 524 retail clients — over 85% of its entire Australian client base — as wholesale clients, stripping them of the consumer protections (PDS disclosure, design and distribution obligations, dispute resolution access) that retail status confers.</li><li><strong>Onboarding system permitted unlimited quiz attempts:</strong> A Statement of Agreed Facts filed in the Federal Court conceded that Binance''s onboarding system allowed clients seeking sophisticated-investor status to take a multiple-choice quiz an unlimited number of times until they achieved a passing score — a process that the Court accepted was inconsistent with the substantive assessment required by the Corporations Act.</li><li><strong>Misclassification breakdown:</strong> Of the 524 misclassified clients, 460 were wrongly classified as meeting the Sophisticated Investor Test, 33 as meeting the Individual Wealth Test, 26 lacked sufficient evidence for the Professional Investor Test, and 5 were misclassified under the Related Body Corporate or Large Business tests.</li><li><strong>Client harm of A$12.55 million:</strong> Affected clients incurred A$8.66 million in trading losses and paid A$3.89 million in fees during the misclassification period — losses that would have been partially mitigated had retail-client design and distribution obligations been triggered.</li><li><strong>AFSL cancellation followed swiftly:</strong> ASIC issued a notice of hearing under s915C of the Corporations Act on 29 March 2023 and cancelled the AFSL on 6 April 2023, effectively terminating Binance''s Australian derivatives business within nine days of the formal notice.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>524 retail clients misclassified as wholesale (July 2022 – April 2023):</strong> ASIC''s review found that Binance Australia Derivatives had treated 524 retail clients — over 85% of its entire Australian client base — as wholesale clients, stripping them of the consumer protections (PDS disclosure, design and distribution obligations, dispute resolution access) that retail status confers.</li><li><strong>Onboarding system permitted unlimited quiz attempts:</strong> A Statement of Agreed Facts filed in the Federal Court conceded that Binance''s onboarding system allowed clients seeking sophisticated-investor status to take a multiple-choice quiz an unlimited number of times until they achieved a passing score — a process that the Court accepted was inconsistent with the substantive assessment required by the Corporations Act.</li><li><strong>Misclassification breakdown:</strong> Of the 524 misclassified clients, 460 were wrongly classified as meeting the Sophisticated Investor Test, 33 as meeting the Individual Wealth Test, 26 lacked sufficient evidence for the Professional Investor Test, and 5 were misclassified under the Related Body Corporate or Large Business tests.</li><li><strong>Client harm of A$12.55 million:</strong> Affected clients incurred A$8.66 million in trading losses and paid A$3.89 million in fees during the misclassification period — losses that would have been partially mitigated had retail-client design and distribution obligations been triggered.</li><li><strong>AFSL cancellation followed swiftly:</strong> ASIC issued a notice of hearing under s915C of the Corporations Act on 29 March 2023 and cancelled the AFSL on 6 April 2023, effectively terminating Binance''s Australian derivatives business within nine days of the formal notice.</li></ul>', 1, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_success AND sort_order > 1;

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
    UPDATE content_bodies SET body_text = '<p>Binance Australia Derivatives paid approximately A$13.1 million in client compensation during 2023 under an ASIC-supervised remediation programme. ASIC then commenced civil penalty proceedings in 2024; the Federal Court handed down a A$10 million penalty on 27 March 2026. Binance continues to operate spot-trading services for Australian users via its global exchange (which does not require an AFS licence), but cannot offer derivatives products to Australian retail clients. The case is now the leading Australian authority on AFS-licensee client-classification obligations.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Binance Australia Derivatives paid approximately A$13.1 million in client compensation during 2023 under an ASIC-supervised remediation programme. ASIC then commenced civil penalty proceedings in 2024; the Federal Court handed down a A$10 million penalty on 27 March 2026. Binance continues to operate spot-trading services for Australian users via its global exchange (which does not require an AFS licence), but cannot offer derivatives products to Australian retail clients. The case is now the leading Australian authority on AFS-licensee client-classification obligations.</p>', 1, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order > 1;

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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Binance Australia Derivatives''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Binance Australia Derivatives''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Wholesale-client classification is not an onboarding checkbox.</strong> ASIC requires substantive assessment, evidence retention, and ongoing monitoring — not a multiple-choice quiz that can be retaken until passed.</li><li><strong>AFS licence cancellation is fast and brand-defining.</strong> From notice of hearing to cancellation took 9 days; the brand impact lasts indefinitely.</li><li><strong>Client compensation is the floor, not the ceiling.</strong> Binance paid A$13.1M in remediation and then a A$10M penalty on top — the regulator''s view is that compensation is restoration, not deterrence.</li><li><strong>Statements of Agreed Facts in Federal Court bind your global narrative.</strong> Binance''s global compliance posture has had to be reconciled against the Australian factual concessions ever since.</li><li><strong>Crypto / digital-asset offshore entry to Australia must be pre-cleared with ASIC, not assumed.</strong> The structural assumption that "wholesale clients only" exempts you from the retail-client regime requires defensible classification practice from day one — and ASIC is now actively reviewing the onboarding flows of crypto operators in particular.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Wholesale-client classification is not an onboarding checkbox.</strong> ASIC requires substantive assessment, evidence retention, and ongoing monitoring — not a multiple-choice quiz that can be retaken until passed.</li><li><strong>AFS licence cancellation is fast and brand-defining.</strong> From notice of hearing to cancellation took 9 days; the brand impact lasts indefinitely.</li><li><strong>Client compensation is the floor, not the ceiling.</strong> Binance paid A$13.1M in remediation and then a A$10M penalty on top — the regulator''s view is that compensation is restoration, not deterrence.</li><li><strong>Statements of Agreed Facts in Federal Court bind your global narrative.</strong> Binance''s global compliance posture has had to be reconciled against the Australian factual concessions ever since.</li><li><strong>Crypto / digital-asset offshore entry to Australia must be pre-cleared with ASIC, not assumed.</strong> The structural assumption that "wholesale clients only" exempts you from the retail-client regime requires defensible classification practice from day one — and ASIC is now actively reviewing the onboarding flows of crypto operators in particular.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ASIC AFSL cancellation (April 2023, 23-092mr)', 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/2023-releases/23-092mr-asic-cancels-binance-australia-derivatives-australian-financial-services-licence/', 1, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ASIC civil penalty proceedings (24-188mr, 2024)', 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/2024-releases/24-188mr-asic-sues-binance-australia-derivatives-for-consumer-protection-failures/', 2, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ASIC A$10M penalty release (26-041mr, 2026)', 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/2026-releases/26-041mr-binance-australia-derivatives-pays-10m-penalty-after-asic-action/', 3, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACS Information Age', 'https://ia.acs.org.au/article/2026/binance-hit-with--10m-fine-over-investor-failures-.html', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Block (penalty coverage)', 'https://www.theblock.co/post/395437/binance-australia-derivatives-fined-6-9-million-over-compliance-and-onboarding-failures', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
