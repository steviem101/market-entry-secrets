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
    'fineos-anz-market-entry', 'How FINEOS Entered the ANZ Market: Category Dominance Through Vertical Focus — How FINEOS Became the Standard for ANZ Insurance', 'Category Dominance Through Vertical Focus — How FINEOS Became the Standard for ANZ Insurance',
    '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'case_study', 'published', false,
    2, ARRAY['Landmark 2005 ACC New Zealand contract', 'Strong presence across ANZ public-sector compensation and life insurance', 'More than 70% of Australian life premiums represented on FINEOS Claims', '13 ANZ insurance clients live in production', 'ASX listing in 2019 raised A$211 million']::text[], '[{"icon": "Calendar", "label": "Founded", "value": "1993"}, {"icon": "MapPin", "label": "HQ", "value": "Dublin, Ireland"}, {"icon": "Globe", "label": "ANZ Entry", "value": "Early 2000s; landmark NZ deal in 2005"}, {"icon": "Briefcase", "label": "Sector", "value": "Insurance Software"}]'::jsonb, 'Stephen Browne', 2
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
      content_id, company_name, origin_country, target_market,
      entry_date, industry, founder_count
    ) VALUES (
      v_id, 'FINEOS', 'Ireland', 'Australia & New Zealand',
      'Early 2000s; landmark NZ deal in 2005', 'Insurance Software', 1
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (
      v_id, 'Michael Kelly', 'Founder', true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Entry Strategy', 'entry-strategy', 1, true)
    RETURNING id INTO v_sec_0;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>FINEOS was founded in Dublin in 1993 by Michael Kelly to build specialist software for life, accident, and health insurers. The company focused on replacing legacy insurance systems with a modern platform spanning claims, policy, billing, and administration.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_0, '<p>ANZ offered a structurally attractive insurance market. New Zealand''s national accident compensation framework created a unique government-scale claims environment, while Australia''s life insurance sector — including insurance linked to superannuation — created a large and specialised market for claims and policy administration technology.</p>', 2, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Success Factors', 'success-factors', 2, true)
    RETURNING id INTO v_sec_1;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>The defining early ANZ win came in 2005 when New Zealand''s Accident Compensation Corporation selected FINEOS to replace its legacy claims management platform in a contract valued at NZ$39 million. The system later supported over 2 million claims annually across 48 locations, making it one of New Zealand''s largest public sector IT programs at the time.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>That ACC credibility opened the door to other government and quasi-government clients in the region, including the NZ Defence Force, Victoria''s TAC, WorkSafe Victoria, and NSW''s icare group. FINEOS also won major Australian private-sector insurance share, with FINEOS Claims adopted by carriers representing over 70% of Australian life premiums and 13 ANZ insurance clients live in production.</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_1, '<p>The company deepened execution capacity through a strategic ANZ partnership with Sequential in 2017, combining FINEOS software with local consulting, change management, and optimisation support. In 2019, FINEOS listed on the ASX, raising A$211 million in the largest IPO on the exchange that year, underscoring how central Australia and New Zealand had become to its growth story.</p>', 3, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Key Metrics & Performance', 'key-metrics', 3, true)
    RETURNING id INTO v_sec_2;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Key results from this market entry include the following milestones.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Landmark 2005 ACC New Zealand contract</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>Strong presence across ANZ public-sector compensation and life insurance</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>More than 70% of Australian life premiums represented on FINEOS Claims</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>13 ANZ insurance clients live in production</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_2, '<p>ASX listing in 2019 raised A$211 million</p>', 6, 'case_study');
    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)
    VALUES (v_id, 'Lessons Learned', 'lessons-learned', 4, true)
    RETURNING id INTO v_sec_3;
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p>Several repeatable plays stand out from FINEOS''s ANZ entry.</p>', 1, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Go deep into one regulated vertical.</strong> FINEOS focused on insurance and built category authority</p>', 2, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Land a government-scale proof point.</strong> ACC validated the platform at national scale</p>', 3, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Use public-sector credibility to win private-sector accounts.</strong> Government trust helped unlock insurer adoption</p>', 4, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Support software with local consulting partners.</strong> Sequential improved delivery confidence and outcomes</p>', 5, 'case_study');
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) VALUES (v_id, v_sec_3, '<p><strong>Treat ANZ as a strategic capital market too.</strong> The ASX listing reinforced long-term commitment and visibility</p>', 6, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'An Industry Leader Driven by Innovation - FINEOS', 'https://www.fineos.com/2020/01/09/fineos-an-industry-leader-driven-by-innovation/', 1, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'What is Brief History of FINEOS Company?', 'https://matrixbcg.com/blogs/brief-history/fineos', 2, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'What is Growth Strategy and Future Prospects of FINEOS Company?', 'https://matrixbcg.com/blogs/growth-strategy/fineos', 3, 'other')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ACC - FINEOS client page', 'https://www.fineos.com/clients/acc-3/', 4, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The top 5 life insurance companies in Australia', 'https://www.insurancebusinessmag.com/au/guides/the-top-5-life-insurance-companies-in-australia-440994.aspx', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fineos wins NZ$39m Accident Compensation Corporation contract', 'https://www.finextra.com/pressarticle/3144/fineos-wins-nz39m-accident-compensation-corporation-contract', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Fineos streamlines claims management for ACC', 'https://www.techmonitor.ai/technology/fineos_streamlines_claims_management_for_acc', 7, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Further expansion in ANZ: FINEOS sponsors the Salesforce World Tour', 'https://www.fineos.com/blog/expansion-anz-fineos-sponsors-salesforce-world-tour/', 8, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FINEOS and Sequential announce Strategic Partnership in ANZ', 'https://www.fineos.com/2017/03/16/fineos-sequential-announce-strategic-partnership-anz/', 9, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'FINEOS lists on the Australian Securities Exchange', 'https://www.fineos.com/2019/08/16/fineos-lists-on-the-australian-securities-exchange/', 10, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Irish fintech FINEOS, ASX''s biggest IPO this year, opens higher on debut', 'https://www.reuters.com/article/business/irish-fintech-fineos-asxs-biggest-ipo-this-year-opens-higher-on-debut-idUSKCN1V6075/', 11, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
