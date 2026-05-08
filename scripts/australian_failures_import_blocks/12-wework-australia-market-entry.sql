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
    'wework-australia-market-entry', 'How WeWork Collapsed in the Australian Market', 'WeWork expanded aggressively into Australia during 2018–2020, signing long leases at peak market rates across Sydney, Melbourne, Brisbane, and Perth.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['WeWork expanded aggressively into Australia during 2018–2020, signing long leases at peak market rates across Sydney, Melbourne, Brisbane, and Perth.', 'WeWork completed lease renegotiations in July 2024, retaining 15 "highest quality and best-performing" locations across four cities.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Proptech / Coworking"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'WeWork', 'https://img.logo.dev/wework.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://wework.com', 'United States', 'Australia',
      '2018-01-01', 'Proptech / Coworking', 2, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://wework.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/wework.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Adam Neumann', 'Co-founder & former CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Miguel McKelvey', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>WeWork expanded aggressively into Australia during 2018–2020, signing long leases at peak market rates across Sydney, Melbourne, Brisbane, and Perth. Its global bankruptcy in November 2023 sent shockwaves through the Australian commercial property market, with the company ultimately handing back keys to at least four Australian sites and renegotiating all 15 remaining leases.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>WeWork expanded aggressively into Australia during 2018–2020, signing long leases at peak market rates across Sydney, Melbourne, Brisbane, and Perth. Its global bankruptcy in November 2023 sent shockwaves through the Australian commercial property market, with the company ultimately handing back keys to at least four Australian sites and renegotiating all 15 remaining leases.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>WeWork entered Australia by signing long-term leases (some up to 15 years) on premium CBD office space across four cities, subletting to startups, SMEs, and enterprise clients on flexible terms. At its peak in Australia, WeWork held approximately 100,000 sqm across 15 locations, with estimated future lease liabilities of A$900 million.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>WeWork entered Australia by signing long-term leases (some up to 15 years) on premium CBD office space across four cities, subletting to startups, SMEs, and enterprise clients on flexible terms. At its peak in Australia, WeWork held approximately 100,000 sqm across 15 locations, with estimated future lease liabilities of A$900 million.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Long-term leases at peak market rates</strong> — WeWork locked in expensive, decade-long lease commitments at a market peak, then tried to sublet at prices that couldn''t justify the base cost.</li><li><strong>The model was real estate arbitrage dressed as tech</strong> — Once investors recognised WeWork was a leveraged property play — not a tech company — its US$47B valuation collapsed, killing the capital-raising machine that funded losses.</li><li><strong>COVID destroyed demand</strong> — The shift to remote work in 2020–21 emptied coworking spaces globally. WeWork''s Australian occupancy never fully recovered.</li><li><strong>Chapter 11 spillover</strong> — While Australian subsidiaries were not formally included in the US Chapter 11 filing, landlords and tenants were deeply uncertain about the entity''s stability. WeWork Australia posted a loss and carried A$930.4M in lease liabilities for the next five years.</li><li><strong>Negotiated exits were necessary but costly</strong> — WeWork had to renegotiate multiple Australian leases in late 2023–early 2024, closing sites in Sydney, Melbourne, Brisbane, and Perth.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Long-term leases at peak market rates</strong> — WeWork locked in expensive, decade-long lease commitments at a market peak, then tried to sublet at prices that couldn''t justify the base cost.</li><li><strong>The model was real estate arbitrage dressed as tech</strong> — Once investors recognised WeWork was a leveraged property play — not a tech company — its US$47B valuation collapsed, killing the capital-raising machine that funded losses.</li><li><strong>COVID destroyed demand</strong> — The shift to remote work in 2020–21 emptied coworking spaces globally. WeWork''s Australian occupancy never fully recovered.</li><li><strong>Chapter 11 spillover</strong> — While Australian subsidiaries were not formally included in the US Chapter 11 filing, landlords and tenants were deeply uncertain about the entity''s stability. WeWork Australia posted a loss and carried A$930.4M in lease liabilities for the next five years.</li><li><strong>Negotiated exits were necessary but costly</strong> — WeWork had to renegotiate multiple Australian leases in late 2023–early 2024, closing sites in Sydney, Melbourne, Brisbane, and Perth.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>WeWork completed lease renegotiations in July 2024, retaining 15 "highest quality and best-performing" locations across four cities. The outcome represents a dramatic downsizing — from a $900M liability footprint to a smaller, sustainable portfolio. WeWork emerged from global Chapter 11 in June 2024 and continues operating in Australia, though as a shadow of its original ambition.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>WeWork completed lease renegotiations in July 2024, retaining 15 "highest quality and best-performing" locations across four cities. The outcome represents a dramatic downsizing — from a $900M liability footprint to a smaller, sustainable portfolio. WeWork emerged from global Chapter 11 in June 2024 and continues operating in Australia, though as a shadow of its original ambition.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, WeWork''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, WeWork''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Avoid long-term lease commitments in early-stage market entry</strong> — Flexible, shorter-term lease structures reduce fixed cost exposure during market validation.</li><li><strong>Proptech/SaaS company valuations need scrutiny</strong> — WeWork''s "tech premium" disguised a highly leveraged property business. Understand what you''re actually paying for when acquiring or partnering.</li><li><strong>Macro shocks (COVID, rate rises) can destroy coworking demand overnight</strong> — Model catastrophic scenarios for demand-dependent businesses.</li><li><strong>Australian landlords are sophisticated counterparties</strong> — Long commercial lease negotiations in Australia carry material obligations — legal advice before signing is mandatory.</li><li><strong>Parent company health directly impacts subsidiary stability</strong> — WeWork Australia had no independent capital structure — entirely at the mercy of its US parent.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Avoid long-term lease commitments in early-stage market entry</strong> — Flexible, shorter-term lease structures reduce fixed cost exposure during market validation.</li><li><strong>Proptech/SaaS company valuations need scrutiny</strong> — WeWork''s "tech premium" disguised a highly leveraged property business. Understand what you''re actually paying for when acquiring or partnering.</li><li><strong>Macro shocks (COVID, rate rises) can destroy coworking demand overnight</strong> — Model catastrophic scenarios for demand-dependent businesses.</li><li><strong>Australian landlords are sophisticated counterparties</strong> — Long commercial lease negotiations in Australia carry material obligations — legal advice before signing is mandatory.</li><li><strong>Parent company health directly impacts subsidiary stability</strong> — WeWork Australia had no independent capital structure — entirely at the mercy of its US parent.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Capital Brief', 'https://www.capitalbrief.com/article/wework-tremors-are-starting-to-reach-australia-3ab6641d-bfb4-43b1-938e-3c36a3941f42/preview', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Capital Brief (restructuring)', 'https://www.capitalbrief.com/article/restructuring-firms-circle-wework-australia-amid-us-parents-bankruptcy-e3397461-2ef9-425a-b', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Urban Developer', 'https://www.theurbandeveloper.com/articles/landlords-wait-as-wework-founder-eyes-buyback', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'AllWork.Space', 'https://allwork.space/2023/09/weworks-collapse-will-cause-massive-losses-in-the-u-k-and-australia-too/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'WeWork Newsroom', 'https://www.wework.com/newsroom/wework-successfully-completes-lease-negotiations-and-real-estate-rationalization-in-australia', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
