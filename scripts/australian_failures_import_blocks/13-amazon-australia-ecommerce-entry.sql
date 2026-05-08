DO $do_block$
DECLARE
  v_id uuid;
  v_next_cn int;
BEGIN
  SELECT id INTO v_id FROM content_items WHERE slug = 'amazon-australia-ecommerce-entry';
  IF v_id IS NULL THEN
    RAISE NOTICE 'Skipping source-only enrichment — slug amazon-australia-ecommerce-entry not found';
    RETURN;
  END IF;
  SELECT COALESCE(MAX(citation_number), 0) + 1 INTO v_next_cn FROM case_study_sources WHERE case_study_id = v_id;

  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'ABC News', 'https://www.abc.net.au/news/2018-12-26/amazon-dominate-retail-within-years-slow-start/10667884', v_next_cn + 0, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Forbes (GST block)', 'https://www.forbes.com/sites/kirimasters/2018/05/31/why-amazon-is-forcing-australian-users-to-its-underwhelming-local-site/', v_next_cn + 1, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'TechCrunch (GST reversal)', 'https://techcrunch.com/2018/11/22/amazon-reverses-tax-triggered-block-on-us-shop-in-australia/', v_next_cn + 2, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)
  VALUES (v_id, 'Pattern Australia', 'https://au.pattern.com/blog/australian-marketplace-shake-up-amazon-thrives-catch-closes-and-chinese-platforms-face-challenges/', v_next_cn + 3, 'news')
  ON CONFLICT (case_study_id, url) DO NOTHING;
END
$do_block$;
