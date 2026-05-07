DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'thought-machine-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug thought-machine-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The cloud-native core banking company that freed Australia''s challenger banks from their legacy systems',
    tldr = ARRAY['The cloud-native core banking company that freed Australia''s challenger banks from their legacy systems', 'Thought Machine was founded in London in 2014 by Paul Taylor — a former Google engineering lead — with a vision to replace the world''s ageing bank mainframes with cloud-native technology.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 2,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 1
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Paul Taylor', 'Founder & CEO', true);
  END IF;

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
    UPDATE content_bodies SET body_text = '<p>Thought Machine was founded in London in 2014 by Paul Taylor — a former Google engineering lead — with a vision to replace the world''s ageing bank mainframes with cloud-native technology. Its Vault Core platform uses smart contracts to define any financial product programmatically and executes migrations in months rather than years. The company raised $160M in a Series D in 2022 at a $2.7 billion valuation, backed by Lloyds Banking Group, JPMorgan Chase Strategic Investments, and Temasek.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Thought Machine was founded in London in 2014 by Paul Taylor — a former Google engineering lead — with a vision to replace the world''s ageing bank mainframes with cloud-native technology. Its Vault Core platform uses smart contracts to define any financial product programmatically and executes migrations in months rather than years. The company raised $160M in a Series D in 2022 at a $2.7 billion valuation, backed by Lloyds Banking Group, JPMorgan Chase Strategic Investments, and Temasek.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p><strong>~2020–2021 – Kiwibank, New Zealand:</strong> Thought Machine''s first ANZ client was Kiwibank — New Zealand''s government-owned challenger bank. The win established the ANZ reference and operational experience needed for Australian engagements.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>~2020–2021 – Kiwibank, New Zealand:</strong> Thought Machine''s first ANZ client was Kiwibank — New Zealand''s government-owned challenger bank. The win established the ANZ reference and operational experience needed for Australian engagements.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2022 – Sydney and Melbourne Offices:</strong> Thought Machine opened offices in both Sydney and Melbourne, stating explicitly: "Thought Machine is committed to the ANZ market."</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2022 – Sydney and Melbourne Offices:</strong> Thought Machine opened offices in both Sydney and Melbourne, stating explicitly: "Thought Machine is committed to the ANZ market."</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2023–2024 – Judo Bank Goes Live:</strong> Australia''s Judo Bank — the first purpose-built SME challenger bank — selected Vault Core and went live just nine months after project initiation, cutting product development time by 50%.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2023–2024 – Judo Bank Goes Live:</strong> Australia''s Judo Bank — the first purpose-built SME challenger bank — selected Vault Core and went live just nine months after project initiation, cutting product development time by 50%.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>June 2025 – Full Platform Consolidation:</strong> Synpulse completed Phase 2, migrating 63,000 Judo Bank term deposit accounts onto Vault Core and enabling Judo to retire its last legacy platform.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>June 2025 – Full Platform Consolidation:</strong> Synpulse completed Phase 2, migrating 63,000 Judo Bank term deposit accounts onto Vault Core and enabling Judo to retire its last legacy platform.</p>', 5, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>ANZ Clients</strong>: Kiwibank (NZ), Judo Bank (AU)</li><li><strong>Migration Speed</strong>: Judo Bank lending live in 9 months</li><li><strong>Product Development Impact</strong>: 50% reduction in time-to-market at Judo</li><li><strong>Term Deposits Migrated</strong>: 63,000 accounts in Phase 2</li><li><strong>Global Valuation</strong>: $2.7 billion (Series D, 2022)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>ANZ Clients</strong>: Kiwibank (NZ), Judo Bank (AU)</li><li><strong>Migration Speed</strong>: Judo Bank lending live in 9 months</li><li><strong>Product Development Impact</strong>: 50% reduction in time-to-market at Judo</li><li><strong>Term Deposits Migrated</strong>: 63,000 accounts in Phase 2</li><li><strong>Global Valuation</strong>: $2.7 billion (Series D, 2022)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Thought Machine''s playbook offers a clear template. The lessons below are drawn from Thought Machine''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Thought Machine''s playbook offers a clear template. The lessons below are drawn from Thought Machine''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Win the challenger before the incumbent</strong> — Target the most forward-thinking buyer in your sector first <em>(Judo Bank and Kiwibank first — then use them as references)</em></li><li><strong>Compress delivery timelines</strong> — Make your delivery speed a competitive differentiator <em>(9-month migration — half the expected industry norm)</em></li><li><strong>Use NZ as a test bed before AU</strong> — A NZ win gives market validation before the larger AU market <em>(Kiwibank before Judo Bank)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Judo Bank case study (Thought Machine)', 'https://www.thoughtmachine.net/case-studies/judo-bank', 17, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Judo Bank upgrades its lending business banking platform (Thought Machine)', 'https://www.thoughtmachine.net/press-releases/judo-bank', 18, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Judo Bank Upgrades Its Lending Business Banking Platform (Financial IT)', 'https://financialit.net/news/banking/judo-bank-upgrades-its-lending-business-banking-platform-thought-machine-technology', 19, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Synpulse partners with Judo Bank to complete Core Banking transformation', 'https://www.synpulse.com/en/insights/synpulse-successfully-partners-with-judo-bank-to-complete-its-core-banking-transformation', 20, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
