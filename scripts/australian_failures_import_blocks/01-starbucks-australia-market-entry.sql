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
    'starbucks-australia-market-entry', 'How Starbucks Struggled in the Australian Market', 'Starbucks is one of the most-cited examples of a global brand misjudging Australian consumers. The US coffee giant entered Australia in 2000 with the same playbook that had worked in markets without an established café culture — only to find Australia had one of the world''s most sophisticated and fiercely local espresso traditions.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Starbucks is one of the most-cited examples of a global brand misjudging Australian consumers.', 'On 29 July 2008, Starbucks announced the closure of 61 of its 84 stores, with 640 jobs lost.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "F&B / Retail"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Starbucks', 'https://img.logo.dev/starbucks.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://starbucks.com', 'United States', 'Australia',
      '2000-01-01', 'F&B / Retail', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://starbucks.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/starbucks.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Howard Schultz', 'Former CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>Starbucks is one of the most-cited examples of a global brand misjudging Australian consumers. The US coffee giant entered Australia in 2000 with the same playbook that had worked in markets without an established café culture — only to find Australia had one of the world''s most sophisticated and fiercely local espresso traditions.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Starbucks is one of the most-cited examples of a global brand misjudging Australian consumers. The US coffee giant entered Australia in 2000 with the same playbook that had worked in markets without an established café culture — only to find Australia had one of the world''s most sophisticated and fiercely local espresso traditions.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Starbucks launched in Sydney in 2000 and rapidly expanded to 84 stores across New South Wales, Victoria, Queensland, ACT, South Australia and Tasmania. The strategy was a direct copy-paste of the US model: large-format stores, sweetened signature drinks, and rapid suburban expansion. No adjustment was made for local tastes, existing price norms, or the deeply personal relationship Australians had with their local barista.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Starbucks launched in Sydney in 2000 and rapidly expanded to 84 stores across New South Wales, Victoria, Queensland, ACT, South Australia and Tasmania. The strategy was a direct copy-paste of the US model: large-format stores, sweetened signature drinks, and rapid suburban expansion. No adjustment was made for local tastes, existing price norms, or the deeply personal relationship Australians had with their local barista.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>In its first seven years, Starbucks accumulated A$105 million in losses. The company took on A$54 million in loans from the US parent just to stay solvent by 2007. The core problems were:</p>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<p>In its first seven years, Starbucks accumulated A$105 million in losses. The company took on A$54 million in loans from the US parent just to stay solvent by 2007. The core problems were:</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Misread culture</strong> — Australians already had a rich espresso culture characterised by personalised service, strong flat whites, and affordable pricing at independent cafés. Starbucks'' sweeter, more commercialised drinks felt alien.</li><li><strong>Overexpansion without earned trust</strong> — Starbucks opened stores before Australian consumers had chosen to adopt the brand, artificially forcing coverage rather than growing organically from urban hubs where the tourist and student population was higher.</li><li><strong>Pricing</strong> — Starbucks was significantly more expensive than local alternatives, without offering a quality differential that Australians could perceive.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Misread culture</strong> — Australians already had a rich espresso culture characterised by personalised service, strong flat whites, and affordable pricing at independent cafés. Starbucks'' sweeter, more commercialised drinks felt alien.</li><li><strong>Overexpansion without earned trust</strong> — Starbucks opened stores before Australian consumers had chosen to adopt the brand, artificially forcing coverage rather than growing organically from urban hubs where the tourist and student population was higher.</li><li><strong>Pricing</strong> — Starbucks was significantly more expensive than local alternatives, without offering a quality differential that Australians could perceive.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_success AND sort_order > 2;

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
    UPDATE content_bodies SET body_text = '<p>On 29 July 2008, Starbucks announced the closure of 61 of its 84 stores, with 640 jobs lost. In 2014, the company handed over the remaining 24 stores to the Withers Group, which operates 7-Eleven in Australia. Today, ~61 stores remain — primarily in CBD tourist zones and international airports — serving largely foreign visitors rather than locals.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>On 29 July 2008, Starbucks announced the closure of 61 of its 84 stores, with 640 jobs lost. In 2014, the company handed over the remaining 24 stores to the Withers Group, which operates 7-Eleven in Australia. Today, ~61 stores remain — primarily in CBD tourist zones and international airports — serving largely foreign visitors rather than locals.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Starbucks''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Starbucks''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Do not assume brand equity travels</strong> — Global recognition does not substitute for earned local trust.</li><li><strong>Established local cultures are moats</strong> — Markets with deep existing preferences (coffee, food, sport) require category re-definition, not replication.</li><li><strong>Start urban and organic, not suburban and forced</strong> — Rapid coverage expansion before consumer adoption locks in fixed costs against weak revenue.</li><li><strong>Adapt the product to the market</strong> — Starbucks'' core beverage range was too sweet and too generic for Australian coffee drinkers.</li><li><strong>Study the competitive set honestly</strong> — The threat was not other chains but 60,000+ independent cafés with established customer loyalty.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Do not assume brand equity travels</strong> — Global recognition does not substitute for earned local trust.</li><li><strong>Established local cultures are moats</strong> — Markets with deep existing preferences (coffee, food, sport) require category re-definition, not replication.</li><li><strong>Start urban and organic, not suburban and forced</strong> — Rapid coverage expansion before consumer adoption locks in fixed costs against weak revenue.</li><li><strong>Adapt the product to the market</strong> — Starbucks'' core beverage range was too sweet and too generic for Australian coffee drinkers.</li><li><strong>Study the competitive set honestly</strong> — The threat was not other chains but 60,000+ independent cafés with established customer loyalty.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News (2008)', 'https://www.abc.net.au/news/2008-07-31/starbucks-announces-locations-of-closing-stores/459456', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ICMR India case study', 'https://www.icmrindia.org/casestudies/catalogue/Business%20Strategy/starbucks-australian-experience-case.htm', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'GlobalDeal', 'https://www.globaldeal.io/blog/examples-of-international-expansion-failures', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'CASTUS Global', 'https://www.castusglobal.com/insights/how-starbucks-missed-the-mark-in-australia', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
