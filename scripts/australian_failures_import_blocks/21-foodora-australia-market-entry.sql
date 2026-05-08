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
    'foodora-australia-market-entry', 'How Foodora Exited the Australian Market', 'Foodora was a Berlin-founded food delivery platform owned by Delivery Hero that operated in Australia from 2015 to 2018.',
    'e836d932-ac9d-4333-a1bf-9c05faa12340'::uuid, 'case_study', 'published', false,
    3, ARRAY['Foodora was a Berlin-founded food delivery platform owned by Delivery Hero that operated in Australia from 2015 to 2018.', 'In August 2018, Foodora announced an orderly Australian exit and entered voluntary administration.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Germany"}, {"icon": "Briefcase", "label": "Sector", "value": "Food Delivery / Marketplace"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Foodora', 'https://img.logo.dev/foodora.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://foodora.com', 'Germany', 'Australia',
      '2015-01-01', 'Food Delivery / Marketplace', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://foodora.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/foodora.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
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
    UPDATE content_bodies SET body_text = '<p>Foodora was a Berlin-founded food delivery platform owned by Delivery Hero that operated in Australia from 2015 to 2018. Its Australian story is the cleanest example in the MES library of a foreign platform brought to a stop by Australia''s worker-classification enforcement: the Fair Work Ombudsman commenced sham-contracting proceedings in June 2018, and Foodora announced its Australian exit and entered voluntary administration two months later.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Foodora was a Berlin-founded food delivery platform owned by Delivery Hero that operated in Australia from 2015 to 2018. Its Australian story is the cleanest example in the MES library of a foreign platform brought to a stop by Australia''s worker-classification enforcement: the Fair Work Ombudsman commenced sham-contracting proceedings in June 2018, and Foodora announced its Australian exit and entered voluntary administration two months later.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Foodora launched in Australia in 2015 as part of Delivery Hero''s global rollout, competing with Deliveroo (which arrived the same year) and the existing Menulog network. Like its peers, Foodora ran a courier-on-demand marketplace, contracting with bicycle riders and motorbike drivers as independent contractors rather than employees — a model imported wholesale from Europe.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Foodora launched in Australia in 2015 as part of Delivery Hero''s global rollout, competing with Deliveroo (which arrived the same year) and the existing Menulog network. Like its peers, Foodora ran a courier-on-demand marketplace, contracting with bicycle riders and motorbike drivers as independent contractors rather than employees — a model imported wholesale from Europe.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Fair Work Ombudsman litigation (June 2018):</strong> The FWO filed Federal Court proceedings alleging Foodora engaged in sham contracting in respect of three workers (two Melbourne bicycle riders and one Sydney motorbike driver). The agency alleged the workers had been misrepresented as independent contractors when they were in fact employees, with at least A$1,620.74 in underpayments over a four-week period and zero superannuation paid.</li><li><strong>Worker-classification was the load-bearing assumption of the entire model:</strong> Reclassifying riders as employees would have triggered the Fast Food Industry Award, payroll tax, superannuation, leave entitlements, and workers'' compensation obligations across the whole rider base — not just the three workers in the FWO action.</li><li><strong>Administrators concurred with the FWO''s view:</strong> When Foodora subsequently entered voluntary administration, its administrators reported to creditors that it was "more likely than not that the majority of Foodora''s delivery workers should have been engaged as casual employees rather than independent contractors" and that the Fast Food Industry Award applied to them — effectively confirming the regulator''s case from the inside.</li><li><strong>Capital allocation pressure from Delivery Hero:</strong> Foodora was already loss-making globally; the regulatory exposure made the Australian P&amp;L untenable in any reasonable scenario.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Fair Work Ombudsman litigation (June 2018):</strong> The FWO filed Federal Court proceedings alleging Foodora engaged in sham contracting in respect of three workers (two Melbourne bicycle riders and one Sydney motorbike driver). The agency alleged the workers had been misrepresented as independent contractors when they were in fact employees, with at least A$1,620.74 in underpayments over a four-week period and zero superannuation paid.</li><li><strong>Worker-classification was the load-bearing assumption of the entire model:</strong> Reclassifying riders as employees would have triggered the Fast Food Industry Award, payroll tax, superannuation, leave entitlements, and workers'' compensation obligations across the whole rider base — not just the three workers in the FWO action.</li><li><strong>Administrators concurred with the FWO''s view:</strong> When Foodora subsequently entered voluntary administration, its administrators reported to creditors that it was "more likely than not that the majority of Foodora''s delivery workers should have been engaged as casual employees rather than independent contractors" and that the Fast Food Industry Award applied to them — effectively confirming the regulator''s case from the inside.</li><li><strong>Capital allocation pressure from Delivery Hero:</strong> Foodora was already loss-making globally; the regulatory exposure made the Australian P&amp;L untenable in any reasonable scenario.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>In August 2018, Foodora announced an orderly Australian exit and entered voluntary administration. The administrators sold the assets, and more than 1,000 Foodora delivery workers received approximately 31% of the entitlements owed to them, including the three workers named in the FWO proceedings. The Fair Work Ombudsman discontinued the legal action in June 2019 because the administrators'' own assessment had effectively conceded the sham-contracting position; the agency described the outcome as having "achieved a positive enforcement result". Foodora''s exit, alongside the same year''s contractor-classification debate sparked by Deliveroo and Uber Eats, became a foundational case in Australia''s gig-economy regulatory trajectory.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>In August 2018, Foodora announced an orderly Australian exit and entered voluntary administration. The administrators sold the assets, and more than 1,000 Foodora delivery workers received approximately 31% of the entitlements owed to them, including the three workers named in the FWO proceedings. The Fair Work Ombudsman discontinued the legal action in June 2019 because the administrators'' own assessment had effectively conceded the sham-contracting position; the agency described the outcome as having "achieved a positive enforcement result". Foodora''s exit, alongside the same year''s contractor-classification debate sparked by Deliveroo and Uber Eats, became a foundational case in Australia''s gig-economy regulatory trajectory.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Foodora''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Foodora''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Worker classification in Australia is not a paperwork detail — it is a load-bearing structural assumption.</strong> If the FWO disagrees with how you classify riders, drivers, or contractors, it can re-cost the entire business overnight.</li><li><strong>The Fast Food Industry Award and superannuation guarantee are the two most expensive triggers for marketplace operators.</strong> Model both at full cost before launch, not as a contingency.</li><li><strong>Voluntary administration is not a discharge of regulatory exposure.</strong> Administrators independently assess the position; if they agree with the regulator, the case writes itself.</li><li><strong>A platform can be globally profitable and still have an unviable Australian unit when local enforcement asymmetry kicks in.</strong> Don''t assume the global P&amp;L will subsidise compliance retrofits.</li><li><strong>Exit timing matters.</strong> Foodora''s August 2018 exit gave workers a partial recovery via the administration estate; later exits in the sector (Deliveroo 2022) left riders worse off.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Worker classification in Australia is not a paperwork detail — it is a load-bearing structural assumption.</strong> If the FWO disagrees with how you classify riders, drivers, or contractors, it can re-cost the entire business overnight.</li><li><strong>The Fast Food Industry Award and superannuation guarantee are the two most expensive triggers for marketplace operators.</strong> Model both at full cost before launch, not as a contingency.</li><li><strong>Voluntary administration is not a discharge of regulatory exposure.</strong> Administrators independently assess the position; if they agree with the regulator, the case writes itself.</li><li><strong>A platform can be globally profitable and still have an unviable Australian unit when local enforcement asymmetry kicks in.</strong> Don''t assume the global P&amp;L will subsidise compliance retrofits.</li><li><strong>Exit timing matters.</strong> Foodora''s August 2018 exit gave workers a partial recovery via the administration estate; later exits in the sector (Deliveroo 2022) left riders worse off.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fair Work Ombudsman (June 2018)', 'https://www.fairwork.gov.au/newsroom/media-releases/2018-media-releases/june-2018/20180612-foodora-litigation', 1, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fair Work Ombudsman (June 2019, discontinuation)', 'https://www.fairwork.gov.au/newsroom/media-releases/2019-media-releases/june-2019/20190621-foodora-media-release', 2, 'government')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News (Aug 2018, A$28M Delivery Hero loan)', 'https://www.abc.net.au/news/2018-08-29/foodora-unable-pay-australian-debt-owe-28m-loan-to-delivery-hero/10179184', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Worrells (administrator — rider entitlements analysis)', 'https://worrells.net.au/resources/news/foodora-riders-employee-entitlement-underpayment', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Business & Human Rights Resource Centre', 'https://www.business-humanrights.org/en/latest-news/australia-delivery-firm-foodora-faces-legal-action-for-underpayment-sham-contracting/', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
