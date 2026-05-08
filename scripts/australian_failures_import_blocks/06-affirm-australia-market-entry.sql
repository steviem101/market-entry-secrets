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
    'affirm-australia-market-entry', 'How Affirm Withdrew from the Australian Market', 'US-based buy now, pay later (BNPL) platform Affirm entered Australia in late 2021 via a single merchant partnership with Peloton.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['US-based buy now, pay later (BNPL) platform Affirm entered Australia in late 2021 via a single merchant partnership with Peloton.', 'Affirm began winding down Australian operations from 28 February 2023 and exited fully shortly thereafter.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech / BNPL"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Affirm', 'https://img.logo.dev/affirm.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://affirm.com', 'United States', 'Australia',
      '2021-01-01', 'Fintech / BNPL', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://affirm.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/affirm.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Max Levchin', 'Founder & CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>US-based buy now, pay later (BNPL) platform Affirm entered Australia in late 2021 via a single merchant partnership with Peloton. Less than 18 months later, it exited — the first country Affirm had ever left.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>US-based buy now, pay later (BNPL) platform Affirm entered Australia in late 2021 via a single merchant partnership with Peloton. Less than 18 months later, it exited — the first country Affirm had ever left.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Affirm''s Australian entry was piggyback: it partnered exclusively with Peloton Australia to finance the purchase of exercise bikes and treadmills via instalment payments. This was a "single merchant" model, meaning Affirm had no independent Australian merchant base or consumer brand.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Affirm''s Australian entry was piggyback: it partnered exclusively with Peloton Australia to finance the purchase of exercise bikes and treadmills via instalment payments. This was a "single merchant" model, meaning Affirm had no independent Australian merchant base or consumer brand.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Single-merchant dependency</strong> — Affirm''s entire Australian business was built on Peloton — when Peloton struggled globally (post-COVID fitness decline, treadmill recalls), Affirm''s Australian revenue collapsed simultaneously.</li><li><strong>Saturated, mature BNPL market</strong> — Australia already had the world''s most developed BNPL ecosystem, with Afterpay (Block-owned), Zip, Klarna, and PayPal all established before Affirm arrived.</li><li><strong>No path to merchant diversification</strong> — Affirm noted in its annual filings that Australian operations remained "on a more limited basis" — a red flag that was never addressed before exit.</li><li><strong>Global macro pressure</strong> — In early 2023, Affirm laid off 19% of its global workforce. Australia — representing negligible revenue — was an easy cut.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Single-merchant dependency</strong> — Affirm''s entire Australian business was built on Peloton — when Peloton struggled globally (post-COVID fitness decline, treadmill recalls), Affirm''s Australian revenue collapsed simultaneously.</li><li><strong>Saturated, mature BNPL market</strong> — Australia already had the world''s most developed BNPL ecosystem, with Afterpay (Block-owned), Zip, Klarna, and PayPal all established before Affirm arrived.</li><li><strong>No path to merchant diversification</strong> — Affirm noted in its annual filings that Australian operations remained "on a more limited basis" — a red flag that was never addressed before exit.</li><li><strong>Global macro pressure</strong> — In early 2023, Affirm laid off 19% of its global workforce. Australia — representing negligible revenue — was an easy cut.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Affirm began winding down Australian operations from 28 February 2023 and exited fully shortly thereafter. It was the first country Affirm had ever closed. Peloton Australia moved its financing to rival Zip. Affirm redirected investment to North American and UK markets.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Affirm began winding down Australian operations from 28 February 2023 and exited fully shortly thereafter. It was the first country Affirm had ever closed. Peloton Australia moved its financing to rival Zip. Affirm redirected investment to North American and UK markets.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Affirm''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Affirm''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Never enter a market on the back of a single commercial partner</strong> — One merchant = one point of failure.</li><li><strong>Assess market maturity before entry</strong> — Australia''s BNPL market was already crowded with well-funded local incumbents. Late entry with less capital is a structural disadvantage.</li><li><strong>BNPL requires regulatory runway</strong> — Australia''s evolving BNPL regulation (consumer credit obligations, ASIC scrutiny) adds compliance cost that smaller international players cannot absorb.</li><li><strong>Align international entry with global strategic trajectory</strong> — If profitability focus is in core markets, international ventures become the first casualties.</li><li><strong>Size the market opportunity honestly</strong> — Australia''s 26 million population means even #1 BNPL market share is modest for a company with US-sized cost structures.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Never enter a market on the back of a single commercial partner</strong> — One merchant = one point of failure.</li><li><strong>Assess market maturity before entry</strong> — Australia''s BNPL market was already crowded with well-funded local incumbents. Late entry with less capital is a structural disadvantage.</li><li><strong>BNPL requires regulatory runway</strong> — Australia''s evolving BNPL regulation (consumer credit obligations, ASIC scrutiny) adds compliance cost that smaller international players cannot absorb.</li><li><strong>Align international entry with global strategic trajectory</strong> — If profitability focus is in core markets, international ventures become the first casualties.</li><li><strong>Size the market opportunity honestly</strong> — Australia''s 26 million population means even #1 BNPL market share is modest for a company with US-sized cost structures.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Payments Dive', 'https://www.paymentsdive.com/news/affirm-exits-australia-payments-buy-now-pay-later-bnpl/644288/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Finextra', 'https://www.finextra.com/newsarticle/41931/bnpl-platform-affirm-quits-australia', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'VIXIO', 'https://www.vixio.com/regulatory-news/pc-affirm-quits-australia-focus-us-uk-expansion', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'eMarketer', 'https://www.emarketer.com/content/affirm-bids-farewell-australia-hone-on-us-canada-business', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
