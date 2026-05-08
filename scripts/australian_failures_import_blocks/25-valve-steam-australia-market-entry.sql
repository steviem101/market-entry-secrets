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
    'valve-steam-australia-market-entry', 'How Valve / Steam Was Penalised by the ACCC in Australia', 'Valve Corporation is the US-based operator of the Steam digital game distribution platform. In a March 2016 judgment that became the leading Australian authority on consumer guarantees for digital goods, the Federal Court found Valve had breached the Australian Consumer Law by representing in its Steam subscriber agreements and refund policies that consumers had no right to a refund.',
    'e836d932-ac9d-4333-a1bf-9c05faa12340'::uuid, 'case_study', 'published', false,
    3, ARRAY['Valve Corporation is the US-based operator of the Steam digital game distribution platform.', 'Valve paid the A$3 million penalty in 2018.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Digital Distribution / Gaming"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Valve / Steam', 'https://img.logo.dev/valvesoftware.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://valvesoftware.com', 'United States', 'Australia',
      '2003-01-01', 'Digital Distribution / Gaming', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://valvesoftware.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/valvesoftware.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Gabe Newell', 'Co-founder', true);
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
    UPDATE content_bodies SET body_text = '<p>Valve Corporation is the US-based operator of the Steam digital game distribution platform. In a March 2016 judgment that became the leading Australian authority on consumer guarantees for digital goods, the Federal Court found Valve had breached the Australian Consumer Law by representing in its Steam subscriber agreements and refund policies that consumers had no right to a refund. The Court ordered Valve to pay A$3 million in penalties in December 2016. Valve appealed, lost in the Full Federal Court (December 2017), and was denied special leave to appeal by the High Court (April 2018).</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Valve Corporation is the US-based operator of the Steam digital game distribution platform. In a March 2016 judgment that became the leading Australian authority on consumer guarantees for digital goods, the Federal Court found Valve had breached the Australian Consumer Law by representing in its Steam subscriber agreements and refund policies that consumers had no right to a refund. The Court ordered Valve to pay A$3 million in penalties in December 2016. Valve appealed, lost in the Full Federal Court (December 2017), and was denied special leave to appeal by the High Court (April 2018).</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Valve operated Steam as a pure cross-border digital platform — no Australian office, no Australian subsidiary, no local servers — relying on its US terms of service to govern transactions with Australian users. This "lean entry" model was the same one used by Viagogo (Case 22) and a common pattern for software-as-a-service and digital-marketplace operators entering smaller markets opportunistically.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Valve operated Steam as a pure cross-border digital platform — no Australian office, no Australian subsidiary, no local servers — relying on its US terms of service to govern transactions with Australian users. This "lean entry" model was the same one used by Viagogo (Case 22) and a common pattern for software-as-a-service and digital-marketplace operators entering smaller markets opportunistically.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Refund clauses contradicted s54 of the ACL:</strong> The Steam subscriber agreement stated that Valve was not under any obligation to provide refunds for video games, and Steam''s published refund policy reinforced this. Section 54 of the Australian Consumer Law guarantees that goods (which the Court held includes digital goods) be of acceptable quality, and that breach of guarantee gives consumers an entitlement to refund — non-waiveable, regardless of what the contract says.</li><li><strong>"Goods" includes digital downloads:</strong> Justice Edelman explicitly held that video games delivered via Steam were "goods" within the meaning of s54, despite Valve''s argument that digital downloads were a service. This finding remains foundational to all subsequent ACL enforcement against digital platforms.</li><li><strong>"We are not subject to Australian law" was a culture problem, not just a legal position:</strong> Justice Edelman wrote that "Valve''s culture of compliance was, and is, very poor", noting that internal Valve evidence showed the company "formed a view that it was not subject to Australian law" — a finding that drove the size of the penalty.</li><li><strong>The conduct affected over 2 million Australian Steam users</strong> during the relevant period. The breadth of the affected user base contributed to the A$3 million penalty (then the largest ACL penalty against a digital platform).</li><li><strong>Three appeals failed:</strong> Valve lost the original 2016 case, the 2017 Full Federal Court appeal, and the 2018 High Court special leave application — across three Federal Court judges, three Full Federal Court judges, and the High Court bench.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Refund clauses contradicted s54 of the ACL:</strong> The Steam subscriber agreement stated that Valve was not under any obligation to provide refunds for video games, and Steam''s published refund policy reinforced this. Section 54 of the Australian Consumer Law guarantees that goods (which the Court held includes digital goods) be of acceptable quality, and that breach of guarantee gives consumers an entitlement to refund — non-waiveable, regardless of what the contract says.</li><li><strong>"Goods" includes digital downloads:</strong> Justice Edelman explicitly held that video games delivered via Steam were "goods" within the meaning of s54, despite Valve''s argument that digital downloads were a service. This finding remains foundational to all subsequent ACL enforcement against digital platforms.</li><li><strong>"We are not subject to Australian law" was a culture problem, not just a legal position:</strong> Justice Edelman wrote that "Valve''s culture of compliance was, and is, very poor", noting that internal Valve evidence showed the company "formed a view that it was not subject to Australian law" — a finding that drove the size of the penalty.</li><li><strong>The conduct affected over 2 million Australian Steam users</strong> during the relevant period. The breadth of the affected user base contributed to the A$3 million penalty (then the largest ACL penalty against a digital platform).</li><li><strong>Three appeals failed:</strong> Valve lost the original 2016 case, the 2017 Full Federal Court appeal, and the 2018 High Court special leave application — across three Federal Court judges, three Full Federal Court judges, and the High Court bench.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Valve paid the A$3 million penalty in 2018. The Court additionally ordered: a 3-year restraint on representing that Valve was not subject to ACL or could decline refunds, a 12-month obligation to publish ACL-rights notices on its website, and an obligation to implement a multi-year consumer-compliance programme for staff. Steam continues to operate in Australia today and now offers ACL-compliant refunds, but the Valve case is now the most-cited Australian authority for the proposition that foreign digital platforms cannot contract out of Australian Consumer Law.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Valve paid the A$3 million penalty in 2018. The Court additionally ordered: a 3-year restraint on representing that Valve was not subject to ACL or could decline refunds, a 12-month obligation to publish ACL-rights notices on its website, and an obligation to implement a multi-year consumer-compliance programme for staff. Steam continues to operate in Australia today and now offers ACL-compliant refunds, but the Valve case is now the most-cited Australian authority for the proposition that foreign digital platforms cannot contract out of Australian Consumer Law.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Valve / Steam''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Valve / Steam''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>The ACL applies to digital goods, not just physical goods.</strong> Software, games, courses, NFTs, and SaaS subscriptions are all "goods" or "services" within the meaning of the ACL.</li><li><strong>You cannot contract out of consumer guarantees.</strong> A clause in your terms saying "no refunds" is not just unenforceable in Australia — it is itself a misleading representation that triggers s18 ACL liability.</li><li><strong>Cross-border digital platforms are within ACL jurisdiction.</strong> Operating from the US (Valve) or Switzerland (Viagogo) does not exclude you from Australian consumer law.</li><li><strong>Compliance culture is admissible evidence.</strong> Justice Edelman''s finding that Valve''s compliance culture was "very poor" was based on internal Valve emails — meaning your engineering, support, and policy team''s internal communications can be discoverable in ACL litigation.</li><li><strong>Compliance programmes are part of the remedy.</strong> The Valve order required Valve to implement and document an ACL-compliance training programme for staff — a multi-year operational cost layered on top of the cash penalty.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>The ACL applies to digital goods, not just physical goods.</strong> Software, games, courses, NFTs, and SaaS subscriptions are all "goods" or "services" within the meaning of the ACL.</li><li><strong>You cannot contract out of consumer guarantees.</strong> A clause in your terms saying "no refunds" is not just unenforceable in Australia — it is itself a misleading representation that triggers s18 ACL liability.</li><li><strong>Cross-border digital platforms are within ACL jurisdiction.</strong> Operating from the US (Valve) or Switzerland (Viagogo) does not exclude you from Australian consumer law.</li><li><strong>Compliance culture is admissible evidence.</strong> Justice Edelman''s finding that Valve''s compliance culture was "very poor" was based on internal Valve emails — meaning your engineering, support, and policy team''s internal communications can be discoverable in ACL litigation.</li><li><strong>Compliance programmes are part of the remedy.</strong> The Valve order required Valve to implement and document an ACL-compliance training programme for staff — a multi-year operational cost layered on top of the cash penalty.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACCC (High Court dismisses Valve special leave)', 'https://www.accc.gov.au/media-release/high-court-dismisses-valves-special-leave-to-appeal-application', 1, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACCC (A$3M penalty)', 'https://www.accc.gov.au/media-release/valve-to-pay-3-million-penalty-for-misleading-gamers', 2, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACCC Full Court ruling', 'https://www.accc.gov.au/media-release/full-federal-court-confirms-that-valve-misled-gamers', 3, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Jones Day (ACCC uses Valve as ACL precedent, 2025)', 'https://www.jonesday.com/en/insights/2025/04/accc-conducts-sweep-of-online-statements-for-compliance-with-australian-consumer-law', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Gadens (legal analysis)', 'https://www.gadens.com/legal-insights/court-orders-american-online-video-game-distributor-to-pay-3-million-for-breach-of-the-australian-consumer-law/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
