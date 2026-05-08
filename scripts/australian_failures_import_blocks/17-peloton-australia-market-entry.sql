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
    'peloton-australia-market-entry', 'How Peloton Struggled in the Australian Market', 'Peloton launched in Australia in July 2021, at the tail end of the pandemic fitness boom. Its financing partner Affirm exited Australia in February 2023.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Peloton launched in Australia in July 2021, at the tail end of the pandemic fitness boom.', 'Peloton remains nominally present in Australia but is significantly sub-scale.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Consumer Tech / Fitness"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Peloton', 'https://img.logo.dev/onepeloton.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://onepeloton.com', 'United States', 'Australia',
      '2021-01-01', 'Consumer Tech / Fitness', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://onepeloton.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/onepeloton.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'John Foley', 'Co-founder & former CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>Peloton launched in Australia in July 2021, at the tail end of the pandemic fitness boom. Its financing partner Affirm exited Australia in February 2023. Peloton faces ongoing challenges around its price point, market size, and recurring ACCC consumer law obligations that make the Australian market structurally difficult.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Peloton launched in Australia in July 2021, at the tail end of the pandemic fitness boom. Its financing partner Affirm exited Australia in February 2023. Peloton faces ongoing challenges around its price point, market size, and recurring ACCC consumer law obligations that make the Australian market structurally difficult.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Peloton entered Australia as a premium connected fitness brand — selling bikes and treadmills at A$2,000–$5,000+ paired with a monthly subscription. It partnered with Affirm for BNPL financing to lower the upfront cost barrier.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Peloton entered Australia as a premium connected fitness brand — selling bikes and treadmills at A$2,000–$5,000+ paired with a monthly subscription. It partnered with Affirm for BNPL financing to lower the upfront cost barrier.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Post-COVID demand collapse was global, and Australia was most exposed</strong> — Australia has one of the highest gym penetration rates in the world. As gyms reopened, Peloton''s value proposition (premium home gym) weakened faster than in markets like the US.</li><li><strong>BNPL partner collapse</strong> — When Affirm exited Australia in early 2023, Peloton lost its financing partner — a critical enabler of purchase conversion at its price point. Peloton moved to Zip, but the disruption was real.</li><li><strong>Consumer law obligations</strong> — Australia''s ACL gives consumers rights for goods not "fit for purpose" or not matching descriptions. Peloton''s decision to restrict use of the treadmill without a subscription triggered ACL implications — something Peloton''s US legal team was not set up to manage.</li><li><strong>Price point vs. market size</strong> — At A$2,000–$5,000 per unit, Peloton needed significant volume to justify Australian operations. The market of 26 million people — with existing gym culture — was never large enough.</li><li><strong>Apparel line paused</strong> — In February 2025, Peloton paused apparel sales in Australia — a signal of continued operational difficulties.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Post-COVID demand collapse was global, and Australia was most exposed</strong> — Australia has one of the highest gym penetration rates in the world. As gyms reopened, Peloton''s value proposition (premium home gym) weakened faster than in markets like the US.</li><li><strong>BNPL partner collapse</strong> — When Affirm exited Australia in early 2023, Peloton lost its financing partner — a critical enabler of purchase conversion at its price point. Peloton moved to Zip, but the disruption was real.</li><li><strong>Consumer law obligations</strong> — Australia''s ACL gives consumers rights for goods not "fit for purpose" or not matching descriptions. Peloton''s decision to restrict use of the treadmill without a subscription triggered ACL implications — something Peloton''s US legal team was not set up to manage.</li><li><strong>Price point vs. market size</strong> — At A$2,000–$5,000 per unit, Peloton needed significant volume to justify Australian operations. The market of 26 million people — with existing gym culture — was never large enough.</li><li><strong>Apparel line paused</strong> — In February 2025, Peloton paused apparel sales in Australia — a signal of continued operational difficulties.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Peloton remains nominally present in Australia but is significantly sub-scale. It has not achieved the market position it holds in the US or UK. Its Australian operations are characterised by minimal investment, a reduced product range, and ongoing uncertainty.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Peloton remains nominally present in Australia but is significantly sub-scale. It has not achieved the market position it holds in the US or UK. Its Australian operations are characterised by minimal investment, a reduced product range, and ongoing uncertainty.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Peloton''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Peloton''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Consumer law in Australia creates obligations that US companies underestimate</strong> — ACL rights are non-waiveable and apply even when a company restricts product functionality after purchase.</li><li><strong>Premium price points in moderate-income, gym-rich markets face structural headwinds</strong> — Australians have world-class publicly accessible fitness infrastructure; premium home gym is a harder sell.</li><li><strong>Financing partnerships must be validated as durable commitments</strong> — A BNPL partnership that exits is a customer conversion crisis.</li><li><strong>Hardware + subscription models carry complex ongoing consumer obligations</strong> — If you restrict a physical product''s functionality via software after sale, Australian consumer law may entitle consumers to full refunds.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Consumer law in Australia creates obligations that US companies underestimate</strong> — ACL rights are non-waiveable and apply even when a company restricts product functionality after purchase.</li><li><strong>Premium price points in moderate-income, gym-rich markets face structural headwinds</strong> — Australians have world-class publicly accessible fitness infrastructure; premium home gym is a harder sell.</li><li><strong>Financing partnerships must be validated as durable commitments</strong> — A BNPL partnership that exits is a customer conversion crisis.</li><li><strong>Hardware + subscription models carry complex ongoing consumer obligations</strong> — If you restrict a physical product''s functionality via software after sale, Australian consumer law may entitle consumers to full refunds.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Business Insider', 'https://www.businessinsider.com/peloton-owners-in-australia-will-have-loans-forgiven-from-affirm-2023-3', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Pelo Buddy', 'https://www.pelobuddy.com/apparel-pause-australia/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Reddit (ACL discussion)', 'https://www.reddit.com/r/stocks/comments/o5vt01/big_change_for_peloton-will-no-longer-allow-use/', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
