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
    'topshop-australia-market-entry', 'How Topshop Struggled in the Australian Market', 'British fashion giant Topshop entered Australia in 2011 via a local franchise/licence arrangement with Austradia Pty Ltd.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['British fashion giant Topshop entered Australia in 2011 via a local franchise/licence arrangement with Austradia Pty Ltd.', 'Austradia entered voluntary administration in May 2017, with administrator Ferrier Hodgson managing the process.']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fashion Retail"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Topshop', 'https://img.logo.dev/topshop.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://topshop.com', 'United Kingdom', 'Australia',
      '2011-01-01', 'Fashion Retail', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://topshop.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/topshop.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>British fashion giant Topshop entered Australia in 2011 via a local franchise/licence arrangement with Austradia Pty Ltd. The franchise collapsed into voluntary administration in May 2017 — and the sole surviving Sydney store eventually closed in 2020 when COVID hit.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>British fashion giant Topshop entered Australia in 2011 via a local franchise/licence arrangement with Austradia Pty Ltd. The franchise collapsed into voluntary administration in May 2017 — and the sole surviving Sydney store eventually closed in 2020 when COVID hit.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Unlike Uniqlo and H&amp;M — which entered Australia as fully owned subsidiaries — Topshop operated through an independent Australian franchisee, Austradia, which paid a licence fee to Topshop UK and purchased stock from the UK parent. At its peak, Topshop/Topman operated nine standalone stores, 17 concessions within Myer, and an online business.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Unlike Uniqlo and H&amp;M — which entered Australia as fully owned subsidiaries — Topshop operated through an independent Australian franchisee, Austradia, which paid a licence fee to Topshop UK and purchased stock from the UK parent. At its peak, Topshop/Topman operated nine standalone stores, 17 concessions within Myer, and an online business.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Franchise fee structure inflated costs</strong> — The licence fees paid to Topshop UK, combined with the cost of importing goods from the UK, made Austradia''s effective cost structure significantly higher than vertically integrated competitors like H&amp;M and Uniqlo.</li><li><strong>Vertical competitors undercut</strong> — H&amp;M and Zara owned their supply chains end-to-end, enabling lower prices. Topshop could not match them while paying franchise fees.</li><li><strong>Currency risk</strong> — The weak Australian dollar against the pound in 2015–17 made UK-sourced goods materially more expensive.</li><li><strong>High mall rents</strong> — Austradia had taken on premium mall locations with high per-square-metre rent commitments, requiring unrealistic sales targets to break even.</li><li><strong>Myer partnership added complexity</strong> — The concession model within Myer (in which Myer held a 20% interest in Austradia) added a layer of governance complexity without solving the underlying cost problems.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Franchise fee structure inflated costs</strong> — The licence fees paid to Topshop UK, combined with the cost of importing goods from the UK, made Austradia''s effective cost structure significantly higher than vertically integrated competitors like H&amp;M and Uniqlo.</li><li><strong>Vertical competitors undercut</strong> — H&amp;M and Zara owned their supply chains end-to-end, enabling lower prices. Topshop could not match them while paying franchise fees.</li><li><strong>Currency risk</strong> — The weak Australian dollar against the pound in 2015–17 made UK-sourced goods materially more expensive.</li><li><strong>High mall rents</strong> — Austradia had taken on premium mall locations with high per-square-metre rent commitments, requiring unrealistic sales targets to break even.</li><li><strong>Myer partnership added complexity</strong> — The concession model within Myer (in which Myer held a 20% interest in Austradia) added a layer of governance complexity without solving the underlying cost problems.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>Austradia entered voluntary administration in May 2017, with administrator Ferrier Hodgson managing the process. Topshop UK worked with the administrator to attempt restructuring. A single Sydney store remained open into 2020 before finally closing during COVID. Topshop UK itself later collapsed globally in 2020 due to Arcadia Group''s bankruptcy.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>Austradia entered voluntary administration in May 2017, with administrator Ferrier Hodgson managing the process. Topshop UK worked with the administrator to attempt restructuring. A single Sydney store remained open into 2020 before finally closing during COVID. Topshop UK itself later collapsed globally in 2020 due to Arcadia Group''s bankruptcy.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Topshop''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Topshop''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Franchise/licence structures are cost disadvantages vs. owned operations</strong> — A middleman layer between brand owner and consumer always inflates the cost stack.</li><li><strong>Study vertically integrated competitors before entering</strong> — If your direct competitors own their supply chains and you don''t, your pricing will always be disadvantaged.</li><li><strong>Mall rent is a fixed commitment regardless of performance</strong> — High base rents require high sustained revenue — a bet that rarely pays off in fashion.</li><li><strong>JV with local retailer does not solve structural problems</strong> — Myer''s stake in Austradia created governance complexity without solving the economics.</li><li><strong>Assess parent company health as a dependency</strong> — Topshop Australia''s model was entirely dependent on UK Topshop — which itself was in structural decline.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Franchise/licence structures are cost disadvantages vs. owned operations</strong> — A middleman layer between brand owner and consumer always inflates the cost stack.</li><li><strong>Study vertically integrated competitors before entering</strong> — If your direct competitors own their supply chains and you don''t, your pricing will always be disadvantaged.</li><li><strong>Mall rent is a fixed commitment regardless of performance</strong> — High base rents require high sustained revenue — a bet that rarely pays off in fashion.</li><li><strong>JV with local retailer does not solve structural problems</strong> — Myer''s stake in Austradia created governance complexity without solving the economics.</li><li><strong>Assess parent company health as a dependency</strong> — Topshop Australia''s model was entirely dependent on UK Topshop — which itself was in structural decline.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News', 'https://www.abc.net.au/news/2017-05-25/topshop-goes-into-voluntary-administration/8557044', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Urban.com.au', 'https://www.urban.com.au/news/topshop-franchise-fees-may-have-triggered-local-downfall', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Link Business', 'https://linkbusiness.com.au/topshop-collapse-what-does-it-mean-for-australian-retailers/', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
