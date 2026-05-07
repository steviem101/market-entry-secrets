-- Phase 5.3 Batch 1 (5/10): ServiceNow AU market entry backfill

DO $$
DECLARE
  v_case_study_id  uuid;
  v_sec_entry      uuid;
  v_sec_success    uuid;
  v_sec_metrics    uuid;
  v_sec_challenges uuid;
  v_sec_lessons    uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry';
  IF v_case_study_id IS NULL THEN RETURN; END IF;

  SELECT id INTO v_sec_entry      FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_challenges FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'challenges-faced';
  SELECT id INTO v_sec_lessons    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'ServiceNow opened APAC support centre in Sydney, March 2014',
      'David Oakley led ANZ ~8 years until 2019; Eric Swift succeeded',
      'Major AU customers include Telstra, NAB, and the DTA',
      'Offices now in Sydney, Melbourne, Canberra, Brisbane, Perth',
      'Founded Santa Clara, USA; ANZ HQ at 680 George St Sydney'
    ],
    quick_facts = '[
      {"label": "ANZ Entry",        "value": "March 2014 (Sydney centre)",        "icon": "Calendar"},
      {"label": "AU MD",            "value": "David Oakley (~8 yrs to 2019)",     "icon": "User"},
      {"label": "AU HQ",            "value": "Sydney, 680 George St",             "icon": "MapPin"},
      {"label": "Other AU Offices", "value": "Melbourne, Canberra, Brisbane, Perth","icon": "Building"},
      {"label": "AU Customers",     "value": "Telstra, NAB, DTA, ACT Health",     "icon": "Users"},
      {"label": "Origin",           "value": "Santa Clara, USA",                  "icon": "Globe2"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'ARN — ServiceNow to open APAC support centre in Sydney', 'https://www.arnnet.com.au/article/533070/servicenow_open_apac_support_centre_sydney/', '2026-05-04', 'news', 1),
    (v_case_study_id, 'ChannelLife AU — ServiceNow holds ANZ Partner Summit in newly opened Sydney office', 'https://channellife.com.au/story/servicenow-holds-nz-partner-summit-newly-opened-sydney-office', '2026-05-04', 'news', 2),
    (v_case_study_id, 'ARN — ServiceNow appoints Microsoft veteran Eric Swift to lead A/NZ', 'https://www.arnnet.com.au/article/687849/servicenow-appoints-microsoft-veteran-eric-swift-lead-nz/', '2026-05-04', 'news', 3),
    (v_case_study_id, 'CIO — Doing business with David Oakley of ServiceNow', 'https://www.cio.com/article/3509002/doing-business-with-david-oakley-of-servicenow-digital-disruption-is-a-silicon-valley-term-for-final.html', '2026-05-04', 'interview', 4),
    (v_case_study_id, 'ChannelLife NZ — ServiceNow ramps up Kiwi focus with first local country manager', 'https://channellife.co.nz/story/servicenow-ramps-kiwi-focus-first-local-country-manager', '2026-05-04', 'news', 5),
    (v_case_study_id, 'ServiceNow — DTA customer story (BuyICT)', 'https://www.servicenow.com/customers/dta.html', '2026-05-04', 'company_blog', 6),
    (v_case_study_id, 'ServiceNow — National Australia Bank customer story', 'https://www.servicenow.com/customers/nab.html', '2026-05-04', 'company_blog', 7),
    (v_case_study_id, 'iTnews — Inside Telstra''s effort to slash NBN complaint wait times', 'https://www.itnews.com.au/news/inside-telstras-effort-to-slash-nbn-complaint-wait-times-481205', '2026-05-04', 'news', 8),
    (v_case_study_id, 'ServiceNow — Office Locations (Australia)', 'https://www.servicenow.com/au/company/locations.html', '2026-05-04', 'company_blog', 9);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'We save organisations time and money by automating their essential tasks and processes to reduce human intervention, eliminating bottlenecks and delivering better service experiences.',
     'David Oakley', 'Managing Director, ANZ, ServiceNow',
     'https://www.cio.com/article/3509002/doing-business-with-david-oakley-of-servicenow-digital-disruption-is-a-silicon-valley-term-for-final.html',
     'CIO', 1),
    (v_case_study_id, v_sec_success,
     'ServiceNow has a strong and loyal customer base in New Zealand and with our growing success in this market the timing is right to double down and accelerate the journey.',
     'David Oakley', 'Managing Director, ANZ, ServiceNow',
     'https://channellife.co.nz/story/servicenow-ramps-kiwi-focus-first-local-country-manager',
     'ChannelLife NZ', 2),
    (v_case_study_id, v_sec_lessons,
     'Get out and engage with the market – visit other organisations to see and touch what they''re doing.',
     'David Oakley', 'Managing Director, ANZ, ServiceNow',
     'https://www.cio.com/article/3509002/doing-business-with-david-oakley-of-servicenow-digital-disruption-is-a-silicon-valley-term-for-final.html',
     'CIO', 3),
    (v_case_study_id, v_sec_challenges,
     'For one of our staff to interact with an NBN fixed line customer, historically they would have to interact with nine different systems.',
     'John Romano', 'CIO, Telstra',
     'https://www.itnews.com.au/news/inside-telstras-effort-to-slash-nbn-complaint-wait-times-481205',
     'iTnews', 4),
    (v_case_study_id, v_sec_metrics,
     'The government procurement space is complex. ServiceNow helps us build a platform that is simple, fair, and fast to manage buying and selling, and also comply with rules and legislation.',
     'Anthony Conway', 'Product Manager and Director, Digital Sourcing Platforms, DTA',
     'https://www.servicenow.com/customers/dta.html',
     'ServiceNow Customer Story', 5),
    (v_case_study_id, v_sec_metrics,
     'We have seen an 82% increase in contract value, from AUD700 million to almost AUD3.9 billion in 2021.',
     'Anthony Conway', 'Product Manager and Director, Digital Sourcing Platforms, DTA',
     'https://www.servicenow.com/customers/dta.html',
     'ServiceNow Customer Story', 6);
END $$;
