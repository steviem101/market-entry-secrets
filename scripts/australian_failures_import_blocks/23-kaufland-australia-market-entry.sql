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
    'kaufland-australia-market-entry', 'How Kaufland Cancelled Its Australian Launch', 'Germany''s Schwarz Group spent A$523 million scouting sites and building infrastructure for an Australian Kaufland chain — then cancelled the launch entirely in January 2020 before opening a single store.',
    '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'case_study', 'published', false,
    3, ARRAY['Kaufland is the supermarket arm of Germany''s Schwarz Group (which also owns Lidl).', 'On 22 January 2020, Schwarz Group announced "an orderly withdrawal from the Australian market".']::text[], '[{"icon": "MapPin", "label": "HQ", "value": "Germany"}, {"icon": "Briefcase", "label": "Sector", "value": "Supermarket / Retail"}, {"icon": "Globe", "label": "Target Market", "value": "Australia"}]'::jsonb, 'Stephen Browne', 2
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
      v_id, 'Kaufland (Schwarz Group)', 'https://img.logo.dev/kaufland.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png', 'https://kaufland.com', 'Germany', 'Australia',
      '2017-01-01', 'Supermarket / Retail', NULL, NULL, NULL
    );
  ELSE
    -- Backfill logo + website on existing rows that are still missing them.
    UPDATE content_company_profiles
      SET website = COALESCE(website, 'https://kaufland.com'),
          company_logo = COALESCE(company_logo, 'https://img.logo.dev/kaufland.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png')
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
    UPDATE content_bodies SET body_text = '<p>Kaufland is the supermarket arm of Germany''s Schwarz Group (which also owns Lidl). After more than two years of Australian build-up — A$523 million in committed paid capital, a 100,000 sqm Melbourne distribution centre under construction, approvals for 20 stores across Victoria, Queensland, South Australia and NSW, and 200 Australian staff hired — Kaufland announced in January 2020 that it was abandoning the Australian market without opening a single store. It is the largest cancelled greenfield retail entry in Australian history.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Kaufland is the supermarket arm of Germany''s Schwarz Group (which also owns Lidl). After more than two years of Australian build-up — A$523 million in committed paid capital, a 100,000 sqm Melbourne distribution centre under construction, approvals for 20 stores across Victoria, Queensland, South Australia and NSW, and 200 Australian staff hired — Kaufland announced in January 2020 that it was abandoning the Australian market without opening a single store. It is the largest cancelled greenfield retail entry in Australian history.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Kaufland''s entry plan was the model "Lidl-style" big-box discount supermarket rollout that had worked in Germany, Poland, the Czech Republic and Romania: 20 large-format stores supported by a single high-volume distribution centre, anchored by a deep private-label range. The first store was scheduled to open in 2020, with an aggressive multi-year ramp to follow.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Kaufland''s entry plan was the model "Lidl-style" big-box discount supermarket rollout that had worked in Germany, Poland, the Czech Republic and Romania: 20 large-format stores supported by a single high-volume distribution centre, anchored by a deep private-label range. The first store was scheduled to open in 2020, with an aggressive multi-year ramp to follow.</p>', 2, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Coles and Woolworths'' supplier discipline:</strong> Suppliers reported being discouraged from supporting a third major banner; Coles/Woolworths control approximately 65% of Australian grocery and have historically prevented entrants from securing range parity. This is the same pattern that killed Masters Home Improvement against Bunnings (Case 2 in the original library).</li><li><strong>Site assembly problems:</strong> Kaufland required sites of 6,000–10,000 sqm with very specific access requirements. Securing 20 such sites simultaneously triggered planning resistance from local councils, opposition campaigns, and bidding wars. Reports surfaced of ratepayer pushback, traffic-impact litigation, and slowed approvals.</li><li><strong>Talent and supply chain capacity constraints:</strong> The 2019 drought and 2019–20 bushfires materially compressed Australian grocery supply chains and made retail management talent scarcer at exactly the wrong time. Kaufland would have been hiring its first cohort of store managers into a market with collapsing fresh-produce reliability.</li><li><strong>Schwarz Group strategic refocus:</strong> Internal Schwarz reporting concluded that the capital required to reach Australian profitability was disproportionately large relative to investing the same money in growing Lidl in continental Europe. The decision was framed publicly as a "concentrated focus on European core markets".</li><li><strong>No public launch ever occurred:</strong> Unlike Masters or Esprit, there was no public store, no transactions, and no consumer brand to defend — making the decision to abandon dramatically cheaper than the alternative of a partial launch followed by retreat.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Coles and Woolworths'' supplier discipline:</strong> Suppliers reported being discouraged from supporting a third major banner; Coles/Woolworths control approximately 65% of Australian grocery and have historically prevented entrants from securing range parity. This is the same pattern that killed Masters Home Improvement against Bunnings (Case 2 in the original library).</li><li><strong>Site assembly problems:</strong> Kaufland required sites of 6,000–10,000 sqm with very specific access requirements. Securing 20 such sites simultaneously triggered planning resistance from local councils, opposition campaigns, and bidding wars. Reports surfaced of ratepayer pushback, traffic-impact litigation, and slowed approvals.</li><li><strong>Talent and supply chain capacity constraints:</strong> The 2019 drought and 2019–20 bushfires materially compressed Australian grocery supply chains and made retail management talent scarcer at exactly the wrong time. Kaufland would have been hiring its first cohort of store managers into a market with collapsing fresh-produce reliability.</li><li><strong>Schwarz Group strategic refocus:</strong> Internal Schwarz reporting concluded that the capital required to reach Australian profitability was disproportionately large relative to investing the same money in growing Lidl in continental Europe. The decision was framed publicly as a "concentrated focus on European core markets".</li><li><strong>No public launch ever occurred:</strong> Unlike Masters or Esprit, there was no public store, no transactions, and no consumer brand to defend — making the decision to abandon dramatically cheaper than the alternative of a partial launch followed by retreat.</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>On 22 January 2020, Schwarz Group announced "an orderly withdrawal from the Australian market". Approximately 200 Australian staff were affected; the Melbourne distribution centre and 20 store sites went on the secondary market. The ACCC subsequently noted that Kaufland''s withdrawal had a measurable adverse impact on supermarket competition, citing it in submissions about the structural difficulty of new entry against the major chains. Schwarz Group reportedly absorbed approximately A$523 million in pre-launch costs.</p>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<p>On 22 January 2020, Schwarz Group announced "an orderly withdrawal from the Australian market". Approximately 200 Australian staff were affected; the Melbourne distribution centre and 20 store sites went on the secondary market. The ACCC subsequently noted that Kaufland''s withdrawal had a measurable adverse impact on supermarket competition, citing it in submissions about the structural difficulty of new entry against the major chains. Schwarz Group reportedly absorbed approximately A$523 million in pre-launch costs.</p>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For operators considering Australian entry, Kaufland (Schwarz Group)''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For operators considering Australian entry, Kaufland (Schwarz Group)''s experience offers a sharp cautionary template. The lessons below distil what went wrong and what foreign and domestic operators can learn from the failure mode.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Cancelled entries can be more instructive than collapsed ones.</strong> Kaufland is a forensic case study in pre-launch failure — every constraint that caused the decision was visible inside the Australian market before any consumer saw a Kaufland store.</li><li><strong>Supplier access is a structural pre-condition, not a procurement task.</strong> Australia''s grocery duopoly creates a supplier loyalty effect that no amount of capital can outbid in the short term.</li><li><strong>Site assembly is a multi-year project that must run in parallel with regulatory and community engagement.</strong> Twenty large-format sites simultaneously is operationally aggressive even for a well-funded entrant.</li><li><strong>A$523M in sunk cost is an expensive lesson, but cheaper than launching and retreating.</strong> A public launch with 20 stores would have multiplied the loss by 3–5x.</li><li><strong>The ACCC''s competition concerns about supermarket concentration are now part of the public record.</strong> Future entrants can use Kaufland''s exit and ACCC supermarket inquiry findings as a strategic risk-mapping tool.</li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Cancelled entries can be more instructive than collapsed ones.</strong> Kaufland is a forensic case study in pre-launch failure — every constraint that caused the decision was visible inside the Australian market before any consumer saw a Kaufland store.</li><li><strong>Supplier access is a structural pre-condition, not a procurement task.</strong> Australia''s grocery duopoly creates a supplier loyalty effect that no amount of capital can outbid in the short term.</li><li><strong>Site assembly is a multi-year project that must run in parallel with regulatory and community engagement.</strong> Twenty large-format sites simultaneously is operationally aggressive even for a well-funded entrant.</li><li><strong>A$523M in sunk cost is an expensive lesson, but cheaper than launching and retreating.</strong> A public launch with 20 stores would have multiplied the loss by 3–5x.</li><li><strong>The ACCC''s competition concerns about supermarket concentration are now part of the public record.</strong> Future entrants can use Kaufland''s exit and ACCC supermarket inquiry findings as a strategic risk-mapping tool.</li></ul>', 2, 'case_study');
  END IF;
  DELETE FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order > 2;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The New Daily (timeline + reasons)', 'https://www.thenewdaily.com.au/finance/consumer/2020/01/22/kaufland-australia-2', 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'SmartCompany (full chronology + cost)', 'https://www.smartcompany.com.au/retail/kaufland-schwarz-group-australia/', 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'BusinessNewsAustralia (surprise exit)', 'https://www.businessnewsaustralia.com/articles/surprise-exit-for-kaufland-from-australia.html', 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Commercial Real Estate (portfolio sale)', 'https://www.commercialrealestate.com.au/news/kaufland-hastens-exit-with-portfolio-sale-2-934602/', 4, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Shop! ANZ', 'https://www.shopassociation.org.au/news/kaufland-quits-australia', 5, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Inside Retail (where it went wrong)', 'https://insideretail.com.au/news/where-did-it-all-go-wrong-for-kaufland-202001', 6, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
