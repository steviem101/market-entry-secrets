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
    'viagogo-australia-market-entry', 'How Viagogo Was Penalised by the ACCC in the Australian Market', 'Viagogo is a Switzerland-headquartered global ticket-resale marketplace that has operated in Australia for years through its `viagogo.com` site, marketed heavily via search-engine ads.',
    'e836d932-ac9d-4333-a1bf-9c05faa12340'::uuid, 'case_study', 'published', false,
    3, ARRAY['Viagogo is a Switzerland-headquartered global ticket-resale marketplace that has operated in Australia for years through its `viagogo.com` site, marketed heavily via search-engine ads.', 'In April 2019, the Federal Court found Viagogo had misled consumers.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Switzerland"}, {"icon": "Briefcase", "label": "Sector", "value": "Marketplace / Tickets"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Viagogo', 'https://img.logo.dev/viagogo.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://viagogo.com', 'Switzerland', 'Australia',
      '2010-01-01', 'Marketplace / Tickets', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://viagogo.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/viagogo.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Eric Baker', 'Founder & CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>Viagogo is a Switzerland-headquartered global ticket-resale marketplace that has operated in Australia for years through its `viagogo.com` site, marketed heavily via search-engine ads. The ACCC sued Viagogo in 2017 for misleading ticket pricing and false "official seller" claims. After an "industrial scale" finding by the Federal Court and an unsuccessful appeal, Viagogo was ordered in October 2020 to pay a A$7 million penalty — making it one of the cleanest examples of Australian Consumer Law (ACL) enforcement against an offshore digital business.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Viagogo is a Switzerland-headquartered global ticket-resale marketplace that has operated in Australia for years through its `viagogo.com` site, marketed heavily via search-engine ads. The ACCC sued Viagogo in 2017 for misleading ticket pricing and false "official seller" claims. After an "industrial scale" finding by the Federal Court and an unsuccessful appeal, Viagogo was ordered in October 2020 to pay a A$7 million penalty — making it one of the cleanest examples of Australian Consumer Law (ACL) enforcement against an offshore digital business.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Viagogo entered Australia as a fully online operation, with no Australian office — relying on search-engine bidding (heavily on event names like "Ashes cricket tickets" and "Book of Mormon tickets") to capture intent traffic, then routing buyers through a checkout that disclosed booking and handling fees only at the final step. The "lean digital entry" model was the same one Viagogo used in the UK, US and Europe.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Viagogo entered Australia as a fully online operation, with no Australian office — relying on search-engine bidding (heavily on event names like "Ashes cricket tickets" and "Book of Mormon tickets") to capture intent traffic, then routing buyers through a checkout that disclosed booking and handling fees only at the final step. The "lean digital entry" model was the same one Viagogo used in the UK, US and Europe.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>"Official seller" representations:</strong> Viagogo''s site implied it was an authorised reseller for events when it was a secondary marketplace. Australian consumers booking through Viagogo regularly discovered they had paid above-face-value prices for tickets they could have bought directly.</li><li><strong>Drip-pricing through hidden booking fees:</strong> During the 1 May 2017 to 26 June 2017 sample period the ACCC examined, Viagogo advertised headline prices that excluded a 27.6% booking fee disclosed only at checkout. Examples cited at trial included a Book of Mormon ticket advertised at A$135 but charged at A$177.45, and an Ashes cricket ticket advertised at A$330.15 sold for A$426.81.</li><li><strong>Scarcity messaging:</strong> Statements that "only X tickets left" combined with countdown timers were found by Justice Burley to make false or misleading representations of scarcity that Viagogo could not substantiate.</li><li><strong>"Industrial scale":</strong> The Federal Court explicitly described one category of representation as having been made "on an industrial scale" — language that drove the size of the eventual penalty.</li><li><strong>The "we operate from overseas" defence failed:</strong> Viagogo argued that its Swiss base limited its ACL exposure. The Federal Court and Full Federal Court both rejected this, confirming that operating from overseas does not defeat Australian Consumer Law jurisdiction over conduct directed at Australian consumers.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>"Official seller" representations:</strong> Viagogo''s site implied it was an authorised reseller for events when it was a secondary marketplace. Australian consumers booking through Viagogo regularly discovered they had paid above-face-value prices for tickets they could have bought directly.</li><li><strong>Drip-pricing through hidden booking fees:</strong> During the 1 May 2017 to 26 June 2017 sample period the ACCC examined, Viagogo advertised headline prices that excluded a 27.6% booking fee disclosed only at checkout. Examples cited at trial included a Book of Mormon ticket advertised at A$135 but charged at A$177.45, and an Ashes cricket ticket advertised at A$330.15 sold for A$426.81.</li><li><strong>Scarcity messaging:</strong> Statements that "only X tickets left" combined with countdown timers were found by Justice Burley to make false or misleading representations of scarcity that Viagogo could not substantiate.</li><li><strong>"Industrial scale":</strong> The Federal Court explicitly described one category of representation as having been made "on an industrial scale" — language that drove the size of the eventual penalty.</li><li><strong>The "we operate from overseas" defence failed:</strong> Viagogo argued that its Swiss base limited its ACL exposure. The Federal Court and Full Federal Court both rejected this, confirming that operating from overseas does not defeat Australian Consumer Law jurisdiction over conduct directed at Australian consumers.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>In April 2019, the Federal Court found Viagogo had misled consumers. In October 2020, the Court imposed a A$7 million penalty. Viagogo appealed; the Full Federal Court dismissed the appeal in 2021, upholding both the liability findings and the A$7M penalty. The Court additionally ordered Viagogo to display ACL-compliant pricing and to implement a consumer-compliance programme. Viagogo continues to operate in Australia, but has restructured its checkout to display total prices upfront — a behavioural change driven entirely by the enforcement outcome.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>In April 2019, the Federal Court found Viagogo had misled consumers. In October 2020, the Court imposed a A$7 million penalty. Viagogo appealed; the Full Federal Court dismissed the appeal in 2021, upholding both the liability findings and the A$7M penalty. The Court additionally ordered Viagogo to display ACL-compliant pricing and to implement a consumer-compliance programme. Viagogo continues to operate in Australia, but has restructured its checkout to display total prices upfront — a behavioural change driven entirely by the enforcement outcome.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Viagogo''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Viagogo''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Operating from overseas does not defeat ACL jurisdiction.</strong> If your site sells to Australians, you are an Australian Consumer Law duty-bearer. The Viagogo case is now the leading authority on this point.</li><li><strong>Drip pricing is enforceable misconduct in Australia.</strong> Booking fees, handling fees, and platform fees that are revealed late in checkout are routinely treated by the ACCC as misleading conduct under s18 ACL.</li><li><strong>Scarcity messaging must be substantiated.</strong> "Only 2 tickets left" claims that are not literally true are misleading; the ACCC actively monitors these.</li><li><strong>"Industrial scale" language is a sentencing multiplier.</strong> When a Federal Court judge writes that conduct was at "industrial scale", the penalty will be calibrated to deter the global operator, not just the local subsidiary.</li><li><strong>Compliance programmes are an ongoing remedy, not a one-off cost.</strong> Viagogo''s ACCC outcome included multi-year compliance and disclosure obligations on top of the cash penalty.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Operating from overseas does not defeat ACL jurisdiction.</strong> If your site sells to Australians, you are an Australian Consumer Law duty-bearer. The Viagogo case is now the leading authority on this point.</li><li><strong>Drip pricing is enforceable misconduct in Australia.</strong> Booking fees, handling fees, and platform fees that are revealed late in checkout are routinely treated by the ACCC as misleading conduct under s18 ACL.</li><li><strong>Scarcity messaging must be substantiated.</strong> "Only 2 tickets left" claims that are not literally true are misleading; the ACCC actively monitors these.</li><li><strong>"Industrial scale" language is a sentencing multiplier.</strong> When a Federal Court judge writes that conduct was at "industrial scale", the penalty will be calibrated to deter the global operator, not just the local subsidiary.</li><li><strong>Compliance programmes are an ongoing remedy, not a one-off cost.</strong> Viagogo''s ACCC outcome included multi-year compliance and disclosure obligations on top of the cash penalty.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACCC penalty announcement (Oct 2020)', 'https://www.accc.gov.au/media-release/viagogo-to-pay-7-million-for-misleading-consumers', 1, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACCC liability finding (April 2019)', 'https://www.accc.gov.au/media-release/court-finds-ticket-reseller-viagogo-misled-consumers', 2, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACCC appeal dismissed', 'https://www.accc.gov.au/media-release/court-dismisses-viagogos-appeal-on-misleading-representations-and-penalty', 3, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Full Federal Court appeal judgment (2022 FCAFC 87)', 'https://www.fedcourt.gov.au/file-store/Judgments/Federal%20Court/Full%20Court/2022/2022FCAFC0087/2022FCAFC0087.docx', 4, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News (A$7M penalty)', 'https://www.abc.net.au/news/2020-10-02/viagogo-fined-$7-million-for-misleading-consumers/12725434', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Lexology – industrial scale finding', 'https://www.lexology.com/library/detail.aspx?g=c58fd59a-a1c4-4bf5-b03b-096440e4c90d', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
