DO $do_block$
DECLARE
  v_id uuid;
  v_sec_entry uuid;
  v_sec_success uuid;
  v_sec_metrics uuid;
  v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'wise-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'content_items row missing for slug wise-anz-market-entry';
  END IF;

  UPDATE content_items SET
    subtitle = 'The transparent FX challenger that turned one million Australians into global citizens',
    tldr = ARRAY['The transparent FX challenger that turned one million Australians into global citizens', 'Australia has one of the highest rates of international money movement globally: a large British-Australian diaspora, 900,000+ UK tourists annually, and big-four banks notorious for adding 2–3% FX mark-ups.', 'Wise was co-founded in London in 2011 by Kristo Käärmann and Taavet Hinrikus — two Estonian tech professionals in the UK who both faced expensive international money transfers.']::text[],
    quick_facts = '[{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, {"icon": "Briefcase", "label": "Sector", "value": "Fintech"}, {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"}]'::jsonb,
    status = 'published',
    read_time = 3,
    style_version = 2
  WHERE id = v_id;

  UPDATE content_company_profiles
    SET founder_count = 2
    WHERE content_id = v_id;

  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Kristo Käärmann', 'Co-founder & CEO', true);
    INSERT INTO content_founders (content_id, name, title, is_primary)
    VALUES (v_id, 'Taavet Hinrikus', 'Co-founder', false);
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
    UPDATE content_bodies SET body_text = '<p>Wise was co-founded in London in 2011 by Kristo Käärmann and Taavet Hinrikus — two Estonian tech professionals in the UK who both faced expensive international money transfers. Their product matched people making transfers in opposite directions and swapped at the real mid-market exchange rate with a transparent fee shown upfront — something virtually no bank offered. Today Wise serves 16+ million customers globally and is listed on the London Stock Exchange.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Wise was co-founded in London in 2011 by Kristo Käärmann and Taavet Hinrikus — two Estonian tech professionals in the UK who both faced expensive international money transfers. Their product matched people making transfers in opposite directions and swapped at the real mid-market exchange rate with a transparent fee shown upfront — something virtually no bank offered. Today Wise serves 16+ million customers globally and is listed on the London Stock Exchange.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<p>Australia has one of the highest rates of international money movement globally: a large British-Australian diaspora, 900,000+ UK tourists annually, and big-four banks notorious for adding 2–3% FX mark-ups. Wise''s transparent, low-fee model was structurally disruptive in this environment.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p>Australia has one of the highest rates of international money movement globally: a large British-Australian diaspora, 900,000+ UK tourists annually, and big-four banks notorious for adding 2–3% FX mark-ups. Wise''s transparent, low-fee model was structurally disruptive in this environment.</p>', 2, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 3) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2016 – Australian Launch:</strong> Wise launched in Australia, initially targeting UK-Australia money transfer corridors. Regulatory compliance was built from the start — AUSTRAC registration as a remittance provider under the AML/CTF Act.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 3;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2016 – Australian Launch:</strong> Wise launched in Australia, initially targeting UK-Australia money transfer corridors. Regulatory compliance was built from the start — AUSTRAC registration as a remittance provider under the AML/CTF Act.</p>', 3, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 4) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2021–2023 – Infrastructure Investment:</strong> Wise became the first fintech to connect directly to Australia''s New Payments Platform (NPP) — giving it real-time domestic clearing speed, not just international transfer capability.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 4;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2021–2023 – Infrastructure Investment:</strong> Wise became the first fintech to connect directly to Australia''s New Payments Platform (NPP) — giving it real-time domestic clearing speed, not just international transfer capability.</p>', 4, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 5) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2024 – 1 Million Customers and New AFSL:</strong> Wise surpassed 1 million active customers in Australia, holding A$1 billion+ in total balances. Household deposits doubled in a year, making Wise the fastest-growing financial entity in Australia by this measure. In September 2024, ASIC granted Wise an AFSL for Investments.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 5;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2024 – 1 Million Customers and New AFSL:</strong> Wise surpassed 1 million active customers in Australia, holding A$1 billion+ in total balances. Household deposits doubled in a year, making Wise the fastest-growing financial entity in Australia by this measure. In September 2024, ASIC granted Wise an AFSL for Investments.</p>', 5, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_entry AND sort_order = 6) THEN
    UPDATE content_bodies SET body_text = '<p><strong>2025 – Australia''s First Multi-Currency Investment Product:</strong> Wise launched Interest in Australia in April 2025 — the country''s first multi-currency investment product for both individuals and businesses. Beta customers invested A$30 million before official launch.</p>', updated_at = now()
      WHERE section_id = v_sec_entry AND sort_order = 6;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_entry, '<p><strong>2025 – Australia''s First Multi-Currency Investment Product:</strong> Wise launched Interest in Australia in April 2025 — the country''s first multi-currency investment product for both individuals and businesses. Beta customers invested A$30 million before official launch.</p>', 6, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_success AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_success, '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<ul><li><strong>Active Customers</strong>: 1 million+ in Australia (2024)</li><li><strong>Balances Held</strong>: A$1 billion+ held on Wise by Australian customers</li><li><strong>Business Deposits</strong>: A$211 million, up 60% in one year</li><li><strong>Interest Beta</strong>: A$30 million invested before formal launch (2025)</li><li><strong>Infrastructure</strong>: First fintech to connect directly to NPP</li><li><strong>Regulatory</strong>: AUSTRAC registration + AFSL for Investments (2024)</li></ul>', updated_at = now()
      WHERE section_id = v_sec_metrics AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_metrics, '<ul><li><strong>Active Customers</strong>: 1 million+ in Australia (2024)</li><li><strong>Balances Held</strong>: A$1 billion+ held on Wise by Australian customers</li><li><strong>Business Deposits</strong>: A$211 million, up 60% in one year</li><li><strong>Interest Beta</strong>: A$30 million invested before formal launch (2025)</li><li><strong>Infrastructure</strong>: First fintech to connect directly to NPP</li><li><strong>Regulatory</strong>: AUSTRAC registration + AFSL for Investments (2024)</li></ul>', 1, 'case_study');
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
    UPDATE content_bodies SET body_text = '<p>For UK operators considering ANZ entry, Wise''s playbook offers a clear template. The lessons below are drawn from Wise''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 1;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<p>For UK operators considering ANZ entry, Wise''s playbook offers a clear template. The lessons below are drawn from Wise''s entry decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>', 1, 'case_study');
  END IF;
  IF EXISTS (SELECT 1 FROM content_bodies WHERE section_id = v_sec_lessons AND sort_order = 2) THEN
    UPDATE content_bodies SET body_text = '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', updated_at = now()
      WHERE section_id = v_sec_lessons AND sort_order = 2;
  ELSE
    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type)
    VALUES (v_id, v_sec_lessons, '<ul><li><strong>Build on a genuine consumer pain point</strong> — Find the equivalent "hidden tax" in ANZ <em>(Hidden bank FX fees)</em></li><li><strong>Build into national infrastructure</strong> — Seek to become part of the infrastructure, not just a user of it <em>(First non-bank on NPP)</em></li><li><strong>Use transparency as marketing</strong> — Make your pricing model the clearest in your category <em>(Show fees upfront — make the comparison obvious)</em></li><li><strong>Expand through adjacent product need</strong> — Map the adjacent financial needs of your first customers <em>(FX → Multi-currency → Business → Investments)</em></li></ul>', 2, 'case_study');
  END IF;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise unveils new look as it reaches 16 million customers (Wise newsroom)', 'https://newsroom.wise.com/en-CAS/223579-wise-unveils-new-look-as-it-reaches-16-million-customers-served-worldwide-and-continues-global-expansion/', 6, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'The Story of Wise', 'https://wise.com/au/about/our-story', 7, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise Granted AFSL for Investments & Surpasses One Million Active Customers', 'https://smbtech.au/news/wise-granted-afsl-for-investments-surpasses-one-million-active-customers/', 8, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Wise hits the accelerator (Banking Day)', 'https://www.bankingday.com/wise-hits-the-accelerator', 9, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'A$30 Million Already Invested: Wise Launches Interest in Australia', 'https://newsroom.wise.com/en-CAS/249592-a-30-million-already-invested-wise-launches-interest-in-australia/', 10, 'company_blog')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
