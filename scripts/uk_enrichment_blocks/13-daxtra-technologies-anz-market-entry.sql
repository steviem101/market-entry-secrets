DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'daxtra-technologies-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug daxtra-technologies-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The Edinburgh AI that''s been powering Australian recruitment for 15 years',
    tldr = ARRAY['The Edinburgh AI that''s been powering Australian recruitment for 15 years', 'DaXtra Technologies was founded in Edinburgh, Scotland in the early 2000s.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "HRTech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  -- Section: entry-strategy
  SELECT id INTO v_sec_entry FROM content_sections
   WHERE content_id = v_id AND slug = 'entry-strategy';
  IF v_sec_entry IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_entry;
  ELSE
    UPDATE content_sections
      SET title = 'Entry Strategy', is_active = true
      WHERE id = v_sec_entry;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>DaXtra Technologies was founded in Edinburgh, Scotland in the early 2000s. It builds CV parsing (extracting structured data from unstructured resumes), semantic candidate matching, and multi-source search software for the global recruitment industry. DaXtra processes 100M+ resumes monthly and was recognised as an Accelerator in Nucleus Research''s 2024 Standalone Talent Acquisition Technology Value Matrix.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>DaXtra Technologies was founded in Edinburgh, Scotland in the early 2000s. It builds CV parsing (extracting structured data from unstructured resumes), semantic candidate matching, and multi-source search software for the global recruitment industry. DaXtra processes 100M+ resumes monthly and was recognised as an Accelerator in Nucleus Research''s 2024 Standalone Talent Acquisition Technology Value Matrix.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2010 – Peoplebank Australia:</strong> DaXtra''s Australian story began when Peoplebank Australia — then Australia''s largest IT and technology recruitment company — signed an agreement to deploy DaXtra''s CandidateCapture parsing software. Processing time reduced by approximately 80%; accuracy above 90% for Australian CV formats.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2010 – Peoplebank Australia:</strong> DaXtra''s Australian story began when Peoplebank Australia — then Australia''s largest IT and technology recruitment company — signed an agreement to deploy DaXtra''s CandidateCapture parsing software. Processing time reduced by approximately 80%; accuracy above 90% for Australian CV formats.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2010–2024 – 15 Years of Steady Compounding:</strong> DaXtra expanded its ANZ client base steadily, building integrations to every major Australian recruitment CRM (Bullhorn, JobAdder, Vincere, PageUp). The company grew from parsing into multi-source search and semantic matching, becoming the de facto CV processing infrastructure for Australia''s recruitment industry.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2010–2024 – 15 Years of Steady Compounding:</strong> DaXtra expanded its ANZ client base steadily, building integrations to every major Australian recruitment CRM (Bullhorn, JobAdder, Vincere, PageUp). The company grew from parsing into multi-source search and semantic matching, becoming the de facto CV processing infrastructure for Australia''s recruitment industry.</p>', 3, 'case_study');
  END IF;

  -- Section: success-factors
  SELECT id INTO v_sec_success FROM content_sections
   WHERE content_id = v_id AND slug = 'success-factors';
  IF v_sec_success IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_success;
  ELSE
    UPDATE content_sections
      SET title = 'Success Factors', is_active = true
      WHERE id = v_sec_success;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_success AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', 1, 'case_study');
  END IF;

  -- Section: key-metrics
  SELECT id INTO v_sec_metrics FROM content_sections
   WHERE content_id = v_id AND slug = 'key-metrics';
  IF v_sec_metrics IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_metrics;
  ELSE
    UPDATE content_sections
      SET title = 'Key Metrics & Performance', is_active = true
      WHERE id = v_sec_metrics;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_metrics AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>First ANZ Client</strong>: Peoplebank Australia (2010) — then Australia''s largest IT recruiter</li><li><strong>Process Improvement</strong>: ~80% reduction in CV processing time at Peoplebank</li><li><strong>ANZ Timeline</strong>: 15+ years of continuous ANZ presence (2010–2026)</li><li><strong>Global Scale</strong>: 100M+ resumes processed monthly</li><li><strong>Analyst Recognition</strong>: Nucleus Research Accelerator (2024)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>First ANZ Client</strong>: Peoplebank Australia (2010) — then Australia''s largest IT recruiter</li><li><strong>Process Improvement</strong>: ~80% reduction in CV processing time at Peoplebank</li><li><strong>ANZ Timeline</strong>: 15+ years of continuous ANZ presence (2010–2026)</li><li><strong>Global Scale</strong>: 100M+ resumes processed monthly</li><li><strong>Analyst Recognition</strong>: Nucleus Research Accelerator (2024)</li></ul>', 1, 'case_study');
  END IF;

  -- Section: lessons-learned
  SELECT id INTO v_sec_lessons FROM content_sections
   WHERE content_id = v_id AND slug = 'lessons-learned';
  IF v_sec_lessons IS NULL THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)
    RETURNING id INTO v_sec_lessons;
  ELSE
    UPDATE content_sections
      SET title = 'Lessons Learned', is_active = true
      WHERE id = v_sec_lessons;
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 1) THEN
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, DaXtra Technologies''s playbook offers a clear template. The lessons below are drawn from DaXtra Technologies''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, DaXtra Technologies''s playbook offers a clear template. The lessons below are drawn from DaXtra Technologies''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Solve a quantifiable pain point</strong> — Lead with a specific, quantifiable outcome metric <em>(80% reduction in processing time — measurable on day one)</em></li><li><strong>Be invisible infrastructure</strong> — B2B infrastructure companies don''t need brand visibility — they need to be impossible to remove <em>(Most recruiters never know DaXtra''s name)</em></li><li><strong>One anchor client opens the whole market</strong> — Win the market leader in your category first; others will follow <em>(Peoplebank opened Australian recruitment)</em></li><li><strong>Patience compounds in ANZ</strong> — Not every ANZ story is a rocket ship; patient platform plays are highly durable <em>(15 years of steady market position)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daxtra Named an Accelerator (Nucleus Research)', 'https://www.benzinga.com/pressreleases/24/10/g41569699/daxtra-named-an-accelerator-in-nucleus-researchs-2024-standalone-talent-acquisition-technology-val', 46, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Australia Now Benefits From DaXtra''s Parsing', 'https://info.daxtra.com/blog/2010/06/20/australia-now-benefits-from-daxtra-parsing', 47, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Daxtra Testimonials', 'https://www.daxtra.com/testimonials/', 48, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
