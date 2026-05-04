-- Phase 5.3 Batch 1 (6/10): DocuSign AU market entry backfill

DO $$
DECLARE
  v_case_study_id  uuid;
  v_sec_entry      uuid;
  v_sec_success    uuid;
  v_sec_metrics    uuid;
  v_sec_challenges uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'docusign-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'docusign-australia-market-entry not found'; END IF;

  SELECT id INTO v_sec_entry      FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_challenges FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'challenges-faced';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'DocuSign opened Sydney APAC office in September 2013',
      'Brad Newton served six years as APAC Vice President',
      'CBA, AIA Australia, Adecco named DocuSign customers',
      'InfoTrack SignIT integration powered Australian e-conveyancing contracts',
      'Onshore data centres followed IRAP assessment for government compliance'
    ],
    quick_facts = '[
      {"label": "ANZ Entry Year", "value": "2013 (Sydney APAC office)",          "icon": "Calendar"},
      {"label": "APAC VP",        "value": "Brad Newton (~2015–2021)",            "icon": "User"},
      {"label": "AU/APAC HQ",     "value": "Sydney, NSW",                         "icon": "MapPin"},
      {"label": "AU Customers",   "value": "CBA, AIA Australia, Adecco, InfoTrack","icon": "Building"},
      {"label": "Regulatory",     "value": "IRAP + DTA Cloud Services Panel",     "icon": "Shield"},
      {"label": "Origin",         "value": "San Francisco, USA",                  "icon": "Globe2"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'IDM Magazine — DocuSign heads downunder', 'https://idm.net.au/article/009760-docusign-heads-downunder', '2026-05-04', 'news', 1),
    (v_case_study_id, 'Telecom Times — DocuSign ups Australian market play with local DCs, Sydney as APAC HQ', 'http://telecomtimes.com.au/files/2018/06/17/docusign-steps-up-australian-market-play-flags-first-local-dcs-confirms-sydney-as-apac-hq/', '2026-05-04', 'news', 2),
    (v_case_study_id, 'ITnews — CBA targets DocuSign for all its commercial loans', 'https://www.itnews.com.au/news/cba-targets-docusign-for-all-its-commercial-loans-578621', '2026-05-04', 'news', 3),
    (v_case_study_id, 'DocuSign Customer Story — DocuSign helps CBA accelerate its digital strategy', 'https://www.docusign.com/en-au/customer-stories/docusign-helps-cba-accelerate-its-digital-strategy', '2026-05-04', 'company_blog', 4),
    (v_case_study_id, 'ARN — DocuSign''s Brad Newton takes over as head of Cohesity A/NZ', 'https://www.arnnet.com.au/article/686528/docusign-brad-newton-takes-over-head-cohesity-nz/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Cohesity — Cohesity Appoints Brad Newton as Head of ANZ', 'https://www.cohesity.com/newsroom/press/cohesity-appoints-brad-newton-as-head-of-australia-and-new-zealand/', '2026-05-04', 'press_release', 6),
    (v_case_study_id, 'DocuSign AU Blog — eSignatures a compelling opportunity for the Australian government', 'https://www.docusign.com/en-au/blog/esignatures-a-compelling-opportunity-for-the-australian-government', '2026-05-04', 'company_blog', 7),
    (v_case_study_id, 'PR Newswire APAC — Docusign plans Australian data centre', 'https://www.prnewswire.com/apac/news-releases/docusign-plans-australian-data-centre-answering-national-push-for-digital-sovereignty-and-data-security-302528681.html', '2026-05-04', 'press_release', 8),
    (v_case_study_id, 'GovTechReview — DocuSign launches Australian data centres', 'https://www.govtechreview.com.au/content/gov-datacentre/news/docusign-launches-australian-data-centres-730674429', '2026-05-04', 'news', 9),
    (v_case_study_id, 'IT Brief Australia — DocuSign launches three new data centre locations', 'https://itbrief.com.au/story/docusign-launches-three-new-data-centre-locations-australia', '2026-05-04', 'news', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'After seeing eleven of the top fifteen insurance companies, ten of the top fifteen wealth management companies, and high tech companies like salesforce.com, Microsoft, HP, NetSuite, and LinkedIn all standardise on DocuSign in hundreds of departments and use cases, I had to join the industry leader.',
     'Eitan Saban', 'APAC General Manager, DocuSign',
     'https://idm.net.au/article/009760-docusign-heads-downunder',
     'IDM Magazine', 1),
    (v_case_study_id, v_sec_challenges,
     'A lot of our customers - at the moment - have been running off our European data centers, mainly because the patriot act in the US doesn''t make sense for our Australian customers.',
     'Brad Newton', 'APAC Vice President, DocuSign',
     'https://itbrief.com.au/story/docusign-launches-three-new-data-centre-locations-australia',
     'IT Brief Australia', 2),
    (v_case_study_id, v_sec_success,
     'The fantastic news now is that any new customer that buys DocuSign in Australia is established onshore, which will be a great thing for both parties.',
     'Brad Newton', 'APAC Vice President, DocuSign',
     'https://itbrief.com.au/story/docusign-launches-three-new-data-centre-locations-australia',
     'IT Brief Australia', 3),
    (v_case_study_id, v_sec_entry,
     'The Federal Government is focused on delivering data accessibility and unmatched privacy to its internal and external stakeholders—and we believe that preparing, sharing, signing and managing agreements is a key part of this.',
     'Brad Newton', 'Vice President, ANZ, DocuSign',
     'https://www.govtechreview.com.au/content/gov-datacentre/news/docusign-launches-australian-data-centres-730674429',
     'GovTechReview', 4),
    (v_case_study_id, v_sec_metrics,
     'We now use Docusign for over 95% of loans.',
     'Tim Roberts', 'Executive Manager, Digitisation, Commonwealth Bank of Australia',
     'https://www.docusign.com/en-au/customer-stories/docusign-helps-cba-accelerate-its-digital-strategy',
     'DocuSign Customer Stories', 5),
    (v_case_study_id, v_sec_success,
     'Some of our commercial lending deals involve 20 different documents. There might be five or six different envelopes that need sending to different combinations of borrowers and guarantors. It''s a complex process that could take considerable time, now it takes just hours with Docusign.',
     'Tim Roberts', 'Executive Manager, Digitisation, Commonwealth Bank of Australia',
     'https://www.docusign.com/en-au/customer-stories/docusign-helps-cba-accelerate-its-digital-strategy',
     'DocuSign Customer Stories', 6);
END $$;
