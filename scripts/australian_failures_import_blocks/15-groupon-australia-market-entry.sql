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
    'groupon-australia-market-entry', 'How Groupon Struggled in the Australian Market', 'Groupon''s entry into Australia was one of the messiest of any tech company — it arrived to find its own brand name, domain (groupon.com.au), and trademark already registered by a local competitor, Scoopon, forcing the American coupon giant to launch under the brand "Stardeals."',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Groupon''s entry into Australia was one of the messiest of any tech company — it arrived to find its own brand name, domain (groupon.com.au), and trademark already registered by a local competitor, Scoopon, forcing the American coupon giant to launch under the brand "Stardeals."', 'Groupon eventually obtained its brand name in Australia after litigation, but never achieved the dominant market position it held in the US or Europe.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United States"}, {"icon": "Briefcase", "label": "Sector", "value": "Marketplace / Deals"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Groupon', 'https://img.logo.dev/groupon.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://groupon.com', 'United States', 'Australia',
      '2011-01-01', 'Marketplace / Deals', 1, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://groupon.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/groupon.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
      WHERE content_id = v_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Andrew Mason', 'Founder & former CEO', true);
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
    UPDATE content_bodies SET body_text = '<p>Groupon''s entry into Australia was one of the messiest of any tech company — it arrived to find its own brand name, domain (groupon.com.au), and trademark already registered by a local competitor, Scoopon, forcing the American coupon giant to launch under the brand "Stardeals."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Groupon''s entry into Australia was one of the messiest of any tech company — it arrived to find its own brand name, domain (groupon.com.au), and trademark already registered by a local competitor, Scoopon, forcing the American coupon giant to launch under the brand "Stardeals."</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Groupon entered Australia around 2010–11, intending to replicate its global group-buying model. The core strategy was daily deal emails offering heavily discounted products and services from local merchants.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Groupon entered Australia around 2010–11, intending to replicate its global group-buying model. The core strategy was daily deal emails offering heavily discounted products and services from local merchants.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Trademark and domain squatting</strong> — Australian competitor Scoopon (owned by CatchOfTheDay founders Gabby and Hezi Leibovich) had pre-registered "Groupon Pty Limited" as a company name, registered the Groupon.com.au domain, and filed for the Groupon trademark in Australia — just seven days before Groupon''s own filing. Groupon was forced to launch as "Stardeals" while fighting multiple legal battles simultaneously.</li><li><strong>Late to a crowded market</strong> — By the time Groupon entered Australia, Scoopon, LivingSocial, and local variants were already established. Groupon''s offer letter to buy Scoopon''s assets was initially accepted (at A$286,000) and then rejected — a classic IP exploitation play.</li><li><strong>Merchant model didn''t suit the market</strong> — Groupon''s model (heavily discounted deals that attracted deal-seekers who rarely became loyal customers) drew sustained criticism from Australian merchants, many of whom found the economics destructive.</li><li><strong>Fading global model</strong> — Groupon''s business model began showing structural cracks globally around 2012–13, undermining its value proposition before it had established itself locally.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Trademark and domain squatting</strong> — Australian competitor Scoopon (owned by CatchOfTheDay founders Gabby and Hezi Leibovich) had pre-registered "Groupon Pty Limited" as a company name, registered the Groupon.com.au domain, and filed for the Groupon trademark in Australia — just seven days before Groupon''s own filing. Groupon was forced to launch as "Stardeals" while fighting multiple legal battles simultaneously.</li><li><strong>Late to a crowded market</strong> — By the time Groupon entered Australia, Scoopon, LivingSocial, and local variants were already established. Groupon''s offer letter to buy Scoopon''s assets was initially accepted (at A$286,000) and then rejected — a classic IP exploitation play.</li><li><strong>Merchant model didn''t suit the market</strong> — Groupon''s model (heavily discounted deals that attracted deal-seekers who rarely became loyal customers) drew sustained criticism from Australian merchants, many of whom found the economics destructive.</li><li><strong>Fading global model</strong> — Groupon''s business model began showing structural cracks globally around 2012–13, undermining its value proposition before it had established itself locally.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Groupon eventually obtained its brand name in Australia after litigation, but never achieved the dominant market position it held in the US or Europe. The Australian group-buying market ultimately consolidated and declined, with Groupon''s Australian operation becoming a marginal, low-investment presence. The platform continues to operate in Australia but with far less relevance than intended.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Groupon eventually obtained its brand name in Australia after litigation, but never achieved the dominant market position it held in the US or Europe. The Australian group-buying market ultimately consolidated and declined, with Groupon''s Australian operation becoming a marginal, low-investment presence. The platform continues to operate in Australia but with far less relevance than intended.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Groupon''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Groupon''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Trademark and domain registration is a Day-1 entry task</strong> — Register your brand name, domain, and trademark in Australia before announcing your entry publicly.</li><li><strong>IP protection failures cause multi-year competitive disadvantages</strong> — Years spent as "Stardeals" while fighting legal battles is market share lost.</li><li><strong>Understand local competitor preparedness</strong> — Scoopon''s founders were sophisticated operators who anticipated Groupon''s entry and pre-empted it deliberately.</li><li><strong>Late entry to a crowded two-sided marketplace is structurally disadvantaged</strong> — The merchant side and consumer side were already matched by local incumbents.</li><li><strong>Business model validation in the local market must precede scale</strong> — Groupon never resolved whether its merchant model worked in Australia before investing in the brand dispute.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Trademark and domain registration is a Day-1 entry task</strong> — Register your brand name, domain, and trademark in Australia before announcing your entry publicly.</li><li><strong>IP protection failures cause multi-year competitive disadvantages</strong> — Years spent as "Stardeals" while fighting legal battles is market share lost.</li><li><strong>Understand local competitor preparedness</strong> — Scoopon''s founders were sophisticated operators who anticipated Groupon''s entry and pre-empted it deliberately.</li><li><strong>Late entry to a crowded two-sided marketplace is structurally disadvantaged</strong> — The merchant side and consumer side were already matched by local incumbents.</li><li><strong>Business model validation in the local market must precede scale</strong> — Groupon never resolved whether its merchant model worked in Australia before investing in the brand dispute.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'WebProNews', 'https://www.webpronews.com/groupon-sues-groupon-to-get-groupon-name-in-australia/', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'TechCrunch', 'https://techcrunch.com/2011/01/04/groupon-files-lawsuit-against-australian-clone-scoopon/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Marketing Mag', 'https://www.marketingmag.com.au/news/geo-location-deals-fail-to-take-off-for-groupon-infographic/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'CSC Digital Brand Services', 'https://www.cscdbs.com/blog/groupon-trademark-case-will-be-interesting/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
