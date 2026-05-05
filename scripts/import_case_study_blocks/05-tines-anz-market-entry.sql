DO $do_block$
DECLARE
  v_id uuid;
  v_sec_0 uuid;
  v_sec_1 uuid;
  v_sec_2 uuid;
  v_sec_3 uuid;
BEGIN
  INSERT INTO content_items (
    slug, title, subtitle, category_id, content_type, status, featured,
    read_time, tldr, quick_facts, researched_by, style_version
  ) VALUES (
    'tines-anz-market-entry', 'How Tines Entered the ANZ Market: From Security Automation to AI Workflows — Tines'' APAC Beachhead Strategy', 'From Security Automation to AI Workflows — Tines'' APAC Beachhead Strategy',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    2, ARRAY['Marquee ANZ customers including Canva, REA Group, ANU, and nib Health Funds', 'Formal APAC hub expansion in Australia announced in 2026', 'Australian headcount growth and local data residency support', 'High pilot-to-production conversion and broad cross-team expansion model']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "2018"}, {"icon": "MapPin", "label": "HQ", "value": "Dublin, Ireland"}, {"icon": "Globe", "label": "ANZ Entry", "value": "Customer-led traction before formal hub expansion; APAC hub formalised in 2026"}, {"icon": "Briefcase", "label": "Sector", "value": "Workflow Automation / Security Automation"}]'::jsonb, 'Stephen Browne', 2
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
    -- explicit NULLs for is_profitable and employee_count to override misleading column defaults
    INSERT INTO content_company_profiles (
      content_id, company_name, origin_country, target_market,
      entry_date, industry, founder_count, employee_count, is_profitable
    ) VALUES (
      v_id, 'Tines', 'Ireland', 'Australia & New Zealand',
      'Customer-led traction before formal hub expansion; APAC hub formalised in 2026', 'Workflow Automation / Security Automation', 2, NULL, NULL
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Eoin Hinchy', 'Founder', true
    );
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Thomas Kinsella', 'Founder', false
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>Tines was founded in Dublin in 2018 by Eoin Hinchy and Thomas Kinsella to eliminate manual, repetitive work in security and operations through no-code workflow automation. The company later reached unicorn status in 2025 after a $125 million Series C round that valued it at $1.125 billion.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ANZ became attractive because enterprise teams in Australia and New Zealand faced the same automation and security pressures as US firms, but often operated with leaner teams. Early customer traction with marquee Australian names gave Tines a credible base for wider growth.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>Canva became one of Tines'' most important reference customers in ANZ, helping the company prove that its no-code automation platform could scale security detections and responses inside a globally recognised Australian technology company. That kind of flagship validation mattered because it created peer credibility before Tines had fully formalised its local footprint.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>As local demand grew, Tines built out dedicated ANZ capacity. In 2026 it announced plans to double Australian headcount and launch an APAC hub in Australia, naming customers such as Canva, REA Group, Australian National University, and nib Health Funds as evidence of momentum. Tines also leaned on local ecosystem relationships, including a partnership with Restack Technology, and supported enterprise buying requirements such as AWS-based local data residency.</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>The company now positions itself beyond only security use cases. It reports that 75% of active customers use the platform across multiple teams and that 94% of pilots move into production, showing a strong land-and-expand motion that is relevant to ANZ organisations pursuing practical automation and AI deployment.</p>', 3, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Key results from this market entry include the following milestones.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Marquee ANZ customers including Canva, REA Group, ANU, and nib Health Funds</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Formal APAC hub expansion in Australia announced in 2026</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Australian headcount growth and local data residency support</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>High pilot-to-production conversion and broad cross-team expansion model</p>', 5, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Several repeatable plays stand out from Tines''s ANZ entry.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Let a marquee customer validate the category.</strong> Canva gave Tines immediate local credibility</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Formalise the hub after demand is proven.</strong> Tines turned customer-led traction into an official APAC footprint</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Solve procurement blockers early.</strong> Local data residency matters in ANZ enterprise buying</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Use local partners for delivery depth.</strong> Restack strengthened local ecosystem fit</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Expand from one team into many.</strong> The platform''s land-and-expand motion suits lean ANZ organisations</p>', 6, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines Business Breakdown & Founding Story - Contrary Research', 'https://research.contrary.com/company/tines', 1, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines joins the unicorn league after latest funding round', 'https://www.siliconrepublic.com/start-ups/tines-unicorn-series-c-funding', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines Secures $125M in Series C Financing, Bringing Total Valuation to $1.125B', 'https://www.prnewswire.com/news-releases/tines-secures-125m-in-series-c-financing-bringing-total-valuation-to-1-125b-302372726.html', 3, 'press_release')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines to double Australia headcount as APAC hub opens', 'https://itbrief.com.au/story/tines-to-double-australia-headcount-as-apac-hub-opens', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines B2B Case Studies & Customer Successes', 'https://www.casestudies.com/company/tines', 5, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines on LinkedIn: How Canva Secures Employee Identities with SpyCloud and Tines', 'https://www.linkedin.com/posts/tines-io_how-canva-secures-employee-identities-with-activity-7184600792568340480-iPGg', 6, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'How Tines is helping Canva to improve its security detections and responses', 'https://www.tines.com/case-studies/canva/', 7, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Tines Assembles ANZ Team for Intelligent Workflows with Restack Technology', 'https://www.linkedin.com/posts/trevor-van-essen-411ab758_2026-is-going-to-be-a-big-year-for-tines-activity-7416309943269507072--cSP', 8, 'linkedin')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Irish unicorn Tines to double headcount in Australia as organisations embrace intelligent workflows', 'https://newshub.medianet.com.au/2026/04/irish-unicorn-tines-to-double-headcount-in-australia-as-organisations-embrace-intelligent-workflows/144557/', 9, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
