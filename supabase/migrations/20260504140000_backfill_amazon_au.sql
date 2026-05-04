-- Phase 5.3 Batch 2 (1/9): Amazon AU ecommerce entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'amazon-australia-ecommerce-entry not found'; END IF;
  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY['Amazon Australia launched amazon.com.au on December 5, 2017','Rocco Braeuniger led launch; Janet Menzies steered next five years','Fulfilment centres opened in Melbourne, Sydney, Perth and Brisbane','Amazon Prime Australia launched June 19, 2018','Matt Benham named new Country Manager in early 2026'],
    quick_facts = '[{"label":"AU Launch","value":"December 2017","icon":"Calendar"},{"label":"Country Manager (Launch)","value":"Rocco Braeuniger","icon":"User"},{"label":"AU HQ","value":"Sydney","icon":"MapPin"},{"label":"Fulfilment Centres","value":"Dandenong, Moorebank, Perth, Brisbane","icon":"Building"},{"label":"2024 Revenue","value":"A$1.936 billion","icon":"DollarSign"},{"label":"Origin","value":"Seattle, USA","icon":"Globe2"}]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz, researched_by = 'Stephen Browne', style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Amazon AU Launch Press Release', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-launches-its-retail-offering-australia-fast-convenient/', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'Amazon AU — Prime Launch', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-launches-prime-australia-offering-free-delivery-fast-two/', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'About Amazon AU — Matt Benham as new Country Manager', 'https://www.aboutamazon.com.au/news/company-news/amazon-australia-announces-matt-benham-as-new-country-manager', '2026-05-04', 'company_blog', 3),
    (v_case_study_id, 'Amazon AU — First Robotics Fulfilment Centre Western Sydney', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-australias-first-robotics-fulfilment-centre-western/', '2026-05-04', 'press_release', 4),
    (v_case_study_id, 'Amazon AU — New Fulfilment Centre in Brisbane', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-australia-announces-new-fulfilment-centre-brisbane-enable', '2026-05-04', 'press_release', 5),
    (v_case_study_id, 'CNBC — Amazon finally launched in Australia', 'https://www.cnbc.com/2017/12/05/amazon-finally-launched-in-australia--and-other-retailers-immediately-rallied.html', '2026-05-04', 'news', 6),
    (v_case_study_id, 'Inside Retail — Rocco Braeuniger to depart', 'https://insideretail.com.au/news/amazon-country-manager-rocco-braeuniger-to-depart-201908', '2026-05-04', 'news', 7),
    (v_case_study_id, 'About Amazon AU — Facilities', 'https://www.aboutamazon.com.au/workplace/facilities', '2026-05-04', 'company_blog', 8),
    (v_case_study_id, 'Inside Retail — Janet Menzies interview', 'https://insideretail.com.au/business/this-cant-just-be-womens-work-amazon-australia-boss-janet-menzies-202303', '2026-05-04', 'interview', 9);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, 'Focusing on customers and the long-term are key principles in Amazon''s approach to retailing.', 'Rocco Braeuniger', 'Country Manager, Amazon Australia', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-launches-its-retail-offering-australia-fast-convenient/', 'Amazon AU Press Release', 1),
    (v_case_study_id, v_sec_success, 'By concentrating on providing a great shopping experience and by constantly innovating on behalf of customers, we hope to earn the trust and the custom of Australian shoppers in the years to come.', 'Rocco Braeuniger', 'Country Manager, Amazon Australia', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-launches-its-retail-offering-australia-fast-convenient/', 'Amazon AU Press Release', 2),
    (v_case_study_id, v_sec_metrics, 'Over time, we will create thousands of new jobs and invest hundreds of millions of dollars in Australia.', 'Rocco Braeuniger', 'Country Manager, Amazon Australia', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-launches-its-retail-offering-australia-fast-convenient/', 'Amazon AU Press Release', 3),
    (v_case_study_id, v_sec_entry, 'We are thrilled to bring Prime, our premium membership program and its many benefits, to Australia, little more than six months after the launch of our Marketplace and Retail offering.', 'Rocco Braeuniger', 'Country Manager, Amazon Australia', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-launches-prime-australia-offering-free-delivery-fast-two/', 'Amazon AU Press Release', 4),
    (v_case_study_id, v_sec_success, 'The opening of our first robotics fulfilment centre is a huge milestone for Amazon Australia, marking our continuous growth.', 'Craig Fuller', 'Director of Operations, Amazon Australia', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-australias-first-robotics-fulfilment-centre-western/', 'Amazon AU Press Release', 5),
    (v_case_study_id, v_sec_lessons, 'Brisbane is a key strategic location to meet customer demand in Queensland.', 'Craig Fuller', 'Director of Operations, Amazon Australia', 'https://amazonau.gcs-web.com/news-releases/news-release-details/amazon-australia-announces-new-fulfilment-centre-brisbane-enable', 'Amazon AU Press Release', 6);
END $$;
