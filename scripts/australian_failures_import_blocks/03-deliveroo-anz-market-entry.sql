DO $do_block$
DECLARE
  v_id uuid;
  v_next_cn int;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'deliveroo-anz-market-entry';
  IF v_id IS NULL THEN
    RAISE NOTICE 'Skipping source-only enrichment — slug deliveroo-anz-market-entry not found';
    RETURN;
  END IF;
  SELECT COALESCE(MAX(citation_number), 0) + 1 INTO v_next_cn FROM case_study_sources WHERE case_study_id = v_id;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News', 'https://www.abc.net.au/news/2022-11-17/deliveroo-uber-doordash-menulog-takeaway-delivery-apps/101664354', v_next_cn + 0, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Marketing Mag', 'https://www.marketingmag.com.au/news/deliveroo-the-failure-behind-the-food-delivery-giant/', v_next_cn + 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'University of Sydney / The Conversation', 'https://www.sydney.edu.au/news-opinion/news/2022/11/17/deliveroo-exit-shows-why-gig-workers-need-more-protection.html', v_next_cn + 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Euronews', 'https://www.euronews.com/next/2022/11/16/deliveroo-australia', v_next_cn + 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
