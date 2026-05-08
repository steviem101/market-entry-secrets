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
    'milkrun-australia-market-entry', 'How MilkRun Collapsed in the Australian Market', 'MilkRun was a Sydney-founded rapid-grocery delivery startup that promised 10-minute delivery and reached A$86 million in venture funding from investors including Tiger Global before collapsing in April 2023 — 19 months after launch.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    3, ARRAY['MilkRun was a Sydney-founded rapid-grocery delivery startup that promised 10-minute delivery and reached A$86 million in venture funding from investors including Tiger Global before collapsing in April 2023 — 19 months after launch.', 'MilkRun ceased trading on Friday 14 April 2023, with more than 400 staff made redundant.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Australia"}, {"icon": "Briefcase", "label": "Sector", "value": "Rapid Grocery Delivery"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'MilkRun', 'https://img.logo.dev/milkrun.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://milkrun.com', 'Australia', 'Australia',
      '2021-01-01', 'Rapid Grocery Delivery', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://milkrun.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/milkrun.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Dany Milham', 'Co-founder & CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>MilkRun was a Sydney-founded rapid-grocery delivery startup that promised 10-minute delivery and reached A$86 million in venture funding from investors including Tiger Global before collapsing in April 2023 — 19 months after launch. It is the most prominent Australian-native MES failure case in the rapid-delivery cohort, and a structural counterpart to international entries that struggled with Australian unit economics.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>MilkRun was a Sydney-founded rapid-grocery delivery startup that promised 10-minute delivery and reached A$86 million in venture funding from investors including Tiger Global before collapsing in April 2023 — 19 months after launch. It is the most prominent Australian-native MES failure case in the rapid-delivery cohort, and a structural counterpart to international entries that struggled with Australian unit economics.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>MilkRun was founded by Dany Milham (former co-founder of Koala mattresses) and launched in Sydney in September 2021 with the aspiration of building a category-defining rapid-grocery delivery service. The model — small "dark stores" stocked with limited SKUs, salaried riders, 10-minute delivery, premium positioning — was lifted from European players like Gorillas and Getir. MilkRun raised A$11M in seed funding in June 2021, then A$75M in a Series A from Tiger Global in early 2022.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>MilkRun was founded by Dany Milham (former co-founder of Koala mattresses) and launched in Sydney in September 2021 with the aspiration of building a category-defining rapid-grocery delivery service. The model — small "dark stores" stocked with limited SKUs, salaried riders, 10-minute delivery, premium positioning — was lifted from European players like Gorillas and Getir. MilkRun raised A$11M in seed funding in June 2021, then A$75M in a Series A from Tiger Global in early 2022.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Unit economics never closed:</strong> MilkRun was reportedly losing approximately A$10 per delivery at its peak. The 10-minute delivery promise required dense dark-store networks and salaried riders, neither of which Australian population density supports outside inner-Sydney and inner-Melbourne.</li><li><strong>No structural moat against incumbents:</strong> The sector lacked any real barriers to entry for Coles and Woolworths, both of which already had nationwide store and warehouse networks that could be repurposed for fast delivery at marginal cost. MilkRun could not match the supermarket duopoly''s range, and the supermarkets could match MilkRun''s speed in any geography that mattered.</li><li><strong>Capital market conditions deteriorated through 2022–23:</strong> Tiger Global''s Series A in early 2022 was at the peak of the global rapid-delivery valuation cycle. By April 2023, the funding environment for unprofitable consumer-tech startups had collapsed. MilkRun could not raise the next round.</li><li><strong>Structural changes did not save the business:</strong> The company announced cost reductions and the relaxation of the 10-minute delivery rule in February 2023 but found that "while the business continued to perform well, the decision was made [to wind down] in the current environment".</li><li><strong>400 redundancies in two days'' notice:</strong> Cofounder Dany Milham emailed staff after the Easter break announcing a wind-down by Friday — a closure pattern that mirrors the abrupt-exit reputational damage seen in Ola (Case 5) and Foodora (Case 21).</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Unit economics never closed:</strong> MilkRun was reportedly losing approximately A$10 per delivery at its peak. The 10-minute delivery promise required dense dark-store networks and salaried riders, neither of which Australian population density supports outside inner-Sydney and inner-Melbourne.</li><li><strong>No structural moat against incumbents:</strong> The sector lacked any real barriers to entry for Coles and Woolworths, both of which already had nationwide store and warehouse networks that could be repurposed for fast delivery at marginal cost. MilkRun could not match the supermarket duopoly''s range, and the supermarkets could match MilkRun''s speed in any geography that mattered.</li><li><strong>Capital market conditions deteriorated through 2022–23:</strong> Tiger Global''s Series A in early 2022 was at the peak of the global rapid-delivery valuation cycle. By April 2023, the funding environment for unprofitable consumer-tech startups had collapsed. MilkRun could not raise the next round.</li><li><strong>Structural changes did not save the business:</strong> The company announced cost reductions and the relaxation of the 10-minute delivery rule in February 2023 but found that "while the business continued to perform well, the decision was made [to wind down] in the current environment".</li><li><strong>400 redundancies in two days'' notice:</strong> Cofounder Dany Milham emailed staff after the Easter break announcing a wind-down by Friday — a closure pattern that mirrors the abrupt-exit reputational damage seen in Ola (Case 5) and Foodora (Case 21).</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>MilkRun ceased trading on Friday 14 April 2023, with more than 400 staff made redundant. Three months later, Woolworths acquired the MilkRun brand and core operating entity for approximately A$10 million — a fraction of the A$86 million raised. Woolworths used the brand and rider network to bolster its existing Metro60 fast-delivery service. The MES significance is that Australia''s grocery duopoly absorbed the most well-funded rapid-delivery insurgent at salvage prices, in line with the Catch.com.au playbook (Case 14) where local incumbents bought the digital pioneer at the bottom of the cycle.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>MilkRun ceased trading on Friday 14 April 2023, with more than 400 staff made redundant. Three months later, Woolworths acquired the MilkRun brand and core operating entity for approximately A$10 million — a fraction of the A$86 million raised. Woolworths used the brand and rider network to bolster its existing Metro60 fast-delivery service. The MES significance is that Australia''s grocery duopoly absorbed the most well-funded rapid-delivery insurgent at salvage prices, in line with the Catch.com.au playbook (Case 14) where local incumbents bought the digital pioneer at the bottom of the cycle.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, MilkRun''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, MilkRun''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Rapid-delivery dark-store models do not work at Australian density.</strong> The combination of moderate population density, high suburban land prices, and low average order values means the unit economics are structurally unfavourable outside a few inner-city postcodes.</li><li><strong>A funding round at the peak of a global hype cycle is a strategic risk, not a reward.</strong> Tiger Global''s Series A in early 2022 effectively committed MilkRun to a pace of growth that was incompatible with the post-rate-hike capital environment.</li><li><strong>Coles and Woolworths can match any insurgent''s speed within months.</strong> Any Australian grocery insurgent must have a structural moat that the duopoly cannot replicate at marginal cost — MilkRun didn''t.</li><li><strong>Australian-native context cases sharpen MES lessons for foreign entrants.</strong> MilkRun''s collapse foreshadowed the structural reasons Deliveroo (Case 3) and Menulog (Case 4) ultimately exited.</li><li><strong>Acquisition by an incumbent at salvage prices is the most common exit for failed Australian challengers.</strong> Woolworths buying MilkRun for A$10M follows the same pattern as Wesfarmers buying Catch (Case 14) and Klarna buying Laybuy''s customer base (Case 7) — Australian incumbents systematically buy distressed insurgent assets cheaply rather than competing them off the field.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Rapid-delivery dark-store models do not work at Australian density.</strong> The combination of moderate population density, high suburban land prices, and low average order values means the unit economics are structurally unfavourable outside a few inner-city postcodes.</li><li><strong>A funding round at the peak of a global hype cycle is a strategic risk, not a reward.</strong> Tiger Global''s Series A in early 2022 effectively committed MilkRun to a pace of growth that was incompatible with the post-rate-hike capital environment.</li><li><strong>Coles and Woolworths can match any insurgent''s speed within months.</strong> Any Australian grocery insurgent must have a structural moat that the duopoly cannot replicate at marginal cost — MilkRun didn''t.</li><li><strong>Australian-native context cases sharpen MES lessons for foreign entrants.</strong> MilkRun''s collapse foreshadowed the structural reasons Deliveroo (Case 3) and Menulog (Case 4) ultimately exited.</li><li><strong>Acquisition by an incumbent at salvage prices is the most common exit for failed Australian challengers.</strong> Woolworths buying MilkRun for A$10M follows the same pattern as Wesfarmers buying Catch (Case 14) and Klarna buying Laybuy''s customer base (Case 7) — Australian incumbents systematically buy distressed insurgent assets cheaply rather than competing them off the field.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AFR (Woolworths buys MilkRun brand for A$10M)', 'https://www.afr.com/companies/retail/woolworths-buys-milkrun-brand-for-about-10m-20230504-p5d5j2', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACS Information Age (administration + 400 jobs lost)', 'https://www.acs.org.au/insightsandpublications/newsroom/newsroom-articles/2023/milkrun-voluntary-administration-400-jobs-lost.html', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Startup Daily (Series A funding coverage)', 'https://www.startupdaily.net/topic/funding/milkrun-raises-75-million-series-a/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'UNSW academic analysis', 'https://www.unsw.edu.au/newsroom/news/2023/04/milkrun_s-demise-is-another-nail-in-the-10-minute-grocery-delive', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Marketing Mag (last delivery)', 'https://www.marketingmag.com.au/featured/milkrun-does-its-last-delivery/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
