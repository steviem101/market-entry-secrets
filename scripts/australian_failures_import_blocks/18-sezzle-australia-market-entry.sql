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
    'sezzle-australia-market-entry', 'How Sezzle Struggled in the Australian Market', 'US-based BNPL company Sezzle listed on the ASX in 2019 to expand into the Australian market but found itself in an existential crisis by 2022.',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['US-based BNPL company Sezzle listed on the ASX in 2019 to expand into the Australian market but found itself in an existential crisis by 2022.', 'Sezzle scaled back to a minimal Australian presence following the Zip merger collapse, refocusing on its US operations and path to profitability.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech / BNPL"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Sezzle', 'https://img.logo.dev/sezzle.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://sezzle.com', 'United States', 'Australia',
      '2019-01-01', 'Fintech / BNPL', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://sezzle.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/sezzle.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Charlie Youakim', 'Co-founder & CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>US-based BNPL company Sezzle listed on the ASX in 2019 to expand into the Australian market but found itself in an existential crisis by 2022. A planned merger with Australian BNPL player Zip Co — which would have given it scale — collapsed in July 2022 due to macro conditions, leaving Sezzle in limbo in the Australian market.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>US-based BNPL company Sezzle listed on the ASX in 2019 to expand into the Australian market but found itself in an existential crisis by 2022. A planned merger with Australian BNPL player Zip Co — which would have given it scale — collapsed in July 2022 due to macro conditions, leaving Sezzle in limbo in the Australian market.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Sezzle chose an ASX listing as its route to Australian market entry and capital, positioning itself as a challenger in the crowded BNPL space alongside Afterpay, Zip, Klarna, Laybuy, and others.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Sezzle chose an ASX listing as its route to Australian market entry and capital, positioning itself as a challenger in the crowded BNPL space alongside Afterpay, Zip, Klarna, Laybuy, and others.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Listed into a saturated market</strong> — The Australian BNPL market was already among the most competitive in the world when Sezzle listed in 2019. It had no differentiated product or merchant relationship strategy.</li><li><strong>Zip merger failure</strong> — The planned acquisition by Zip would have given Sezzle''s US operations scale, but the deal was terminated in July 2022 after macro deterioration made the terms untenable. Sezzle''s share price fell 35% on the announcement and ultimately lost ~82% of the value ascribed at the merger announcement.</li><li><strong>Rising rates broke the model</strong> — Like all BNPL pure plays, Sezzle''s model was structurally sensitive to interest rates — funding interest-free credit at rising borrowing costs destroyed unit economics.</li><li><strong>No path to Australian profitability</strong> — Sezzle''s core market was always the US, where it had stronger merchant relationships. Australia was an opportunistic capital-raising vehicle rather than a core market.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Listed into a saturated market</strong> — The Australian BNPL market was already among the most competitive in the world when Sezzle listed in 2019. It had no differentiated product or merchant relationship strategy.</li><li><strong>Zip merger failure</strong> — The planned acquisition by Zip would have given Sezzle''s US operations scale, but the deal was terminated in July 2022 after macro deterioration made the terms untenable. Sezzle''s share price fell 35% on the announcement and ultimately lost ~82% of the value ascribed at the merger announcement.</li><li><strong>Rising rates broke the model</strong> — Like all BNPL pure plays, Sezzle''s model was structurally sensitive to interest rates — funding interest-free credit at rising borrowing costs destroyed unit economics.</li><li><strong>No path to Australian profitability</strong> — Sezzle''s core market was always the US, where it had stronger merchant relationships. Australia was an opportunistic capital-raising vehicle rather than a core market.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Sezzle scaled back to a minimal Australian presence following the Zip merger collapse, refocusing on its US operations and path to profitability. It was delisted from the ASX, eliminating its Australian capital base.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Sezzle scaled back to a minimal Australian presence following the Zip merger collapse, refocusing on its US operations and path to profitability. It was delisted from the ASX, eliminating its Australian capital base.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Sezzle''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Sezzle''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>ASX listing is not a market entry strategy</strong> — Access to Australian capital markets does not guarantee access to Australian customers.</li><li><strong>M&amp;A-dependent entry strategies are fragile</strong> — If your Australian expansion thesis depends on completing a merger, you need a standalone Plan B.</li><li><strong>Be honest about strategic intent in the market</strong> — Sezzle was raising capital in Australia, not building a dominant BNPL business there.</li><li><strong>Rising interest rates are an existential risk for credit-funded, interest-free businesses</strong> — Always model the impact of a 300–500 bps rate increase on unit economics before launch.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>ASX listing is not a market entry strategy</strong> — Access to Australian capital markets does not guarantee access to Australian customers.</li><li><strong>M&amp;A-dependent entry strategies are fragile</strong> — If your Australian expansion thesis depends on completing a merger, you need a standalone Plan B.</li><li><strong>Be honest about strategic intent in the market</strong> — Sezzle was raising capital in Australia, not building a dominant BNPL business there.</li><li><strong>Rising interest rates are an existential risk for credit-funded, interest-free businesses</strong> — Always model the impact of a 300–500 bps rate increase on unit economics before launch.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Adviser', 'https://www.theadviser.com.au/tech/43172-zip-sezzle-merger-abandoned', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Payments Dive', 'https://www.paymentsdive.com/news/zip-ditches-sezzle-bnpl-buyout/627060/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Motley Fool Australia', 'https://www.fool.com.au/2022/07/12/sezzle-share-price-plunges-35-as-zip-merger-scrapped/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
