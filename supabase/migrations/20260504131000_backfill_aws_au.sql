-- Phase 5.3 Batch 1 (8/10): AWS AU market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry     uuid;
  v_sec_success   uuid;
  v_sec_metrics   uuid;
  v_sec_lessons   uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'aws-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'aws-australia-market-entry not found'; END IF;

  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'AWS launched Sydney region in November 2012, Melbourne January 2023',
      'Iain Rouse leads ANZ Public Sector; Rianne Van Veldhuizen is ANZ MD',
      'Customers include CBA, NAB, ANZ, Telstra, Atlassian, Canva',
      'AU$20B investment announced for 2025–2029 data centre expansion',
      'Dual-region strategy delivered data sovereignty plus disaster recovery'
    ],
    quick_facts = '[
      {"label": "ANZ Entry Year",          "value": "2012 (Sydney region)",                  "icon": "Calendar"},
      {"label": "Sydney Region Launch",    "value": "12 November 2012",                      "icon": "MapPin"},
      {"label": "Melbourne Region Launch", "value": "23 January 2023",                       "icon": "Building"},
      {"label": "ANZ Leadership",          "value": "Iain Rouse (Public); Van Veldhuizen (MD)","icon": "User"},
      {"label": "AU Customers",            "value": "CBA, NAB, ANZ, Telstra, Atlassian, Canva","icon": "Users"},
      {"label": "Investment",              "value": "AU$20B by 2029",                        "icon": "DollarSign"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'AWS Blog — Now Open AWS Asia Pacific (Melbourne) Region', 'https://aws.amazon.com/blogs/aws/now-open-aws-asia-pacific-melbourne-region-in-australia/', '2026-05-04', 'company_blog', 1),
    (v_case_study_id, 'Amazon Press — AWS Launches Second Infrastructure Region in Australia', 'https://press.aboutamazon.com/2023/1/aws-launches-second-infrastructure-region-in-australia', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'About Amazon AU — AWS Launches Region in Melbourne, Invests $6.8B by 2037', 'https://www.aboutamazon.com.au/aws-launches-aws-region-in-melbourne-invests-6-8-billion-by-2037', '2026-05-04', 'press_release', 3),
    (v_case_study_id, 'About Amazon — Amazon Investing AU$20B in Australian Data Centres', 'https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia', '2026-05-04', 'press_release', 4),
    (v_case_study_id, 'Austrade — AWS to Invest A$13.2B in Cloud Infrastructure in Australia', 'https://international.austrade.gov.au/en/news-and-analysis/news/aws-to-invest-13-2-billion-aud-in-cloud-infrastructure-in-australia', '2026-05-04', 'government', 5),
    (v_case_study_id, 'AWS — Announcing the Asia Pacific (Sydney) Region (2012)', 'https://aws.amazon.com/about-aws/whats-new/2012/11/12/announcing-the-aws-asia-pacific-sydney-region/', '2026-05-04', 'company_blog', 6),
    (v_case_study_id, 'All Things Distributed — Expanding the Cloud: Sydney Region', 'https://www.allthingsdistributed.com/2012/11/asia-pacifc-sydney-region.html', '2026-05-04', 'company_blog', 7),
    (v_case_study_id, 'Breaking Defense — A$2B Top Secret Aussie Cloud Deal with AWS', 'https://breakingdefense.com/2024/07/2-billion-aud-deal-for-top-secret-aussie-cloud-with-aws/', '2026-05-04', 'news', 8),
    (v_case_study_id, 'AWS Local — AWS in Australia', 'https://aws.amazon.com/local/australia/', '2026-05-04', 'company_blog', 9);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'This planned investment deepens our long-term commitment to supporting the growth and development of Australian organizations of all sizes.',
     'Matt Garman', 'CEO, AWS',
     'https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia',
     'About Amazon', 1),
    (v_case_study_id, v_sec_metrics,
     'This is the largest investment our country has seen from a global technology provider, and is an exciting opportunity for Australia to build AI capability.',
     'Anthony Albanese', 'Prime Minister of Australia',
     'https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia',
     'About Amazon', 2),
    (v_case_study_id, v_sec_success,
     'Customers around the world are using AWS Regions to leverage advanced technologies, save costs, accelerate innovation, increase speed to market of new products and services, and expand their geographic infrastructure footprint in minutes.',
     'Rianne Van Veldhuizen', 'Managing Director, AWS Australia and New Zealand',
     'https://www.aboutamazon.com.au/aws-launches-aws-region-in-melbourne-invests-6-8-billion-by-2037',
     'About Amazon Australia', 3),
    (v_case_study_id, v_sec_entry,
     'Australian citizens expect seamless and personalized access to government services anywhere and anytime. Today''s launch of an AWS Region in Melbourne will be a key enabler for the Victorian government and other public sector customers to help meet this demand.',
     'Iain Rouse', 'Country Director for Worldwide Public Sector, AWS ANZ',
     'https://www.aboutamazon.com.au/aws-launches-aws-region-in-melbourne-invests-6-8-billion-by-2037',
     'About Amazon Australia', 4),
    (v_case_study_id, v_sec_success,
     'Locating key banking applications and critical workloads geographically close to our mainframe compute platform will provide lower latency benefits, streamline our disaster recovery procedures, and further increase our resilience.',
     'Steve Day', 'Chief Technology Officer, NAB',
     'https://www.aboutamazon.com.au/aws-launches-aws-region-in-melbourne-invests-6-8-billion-by-2037',
     'About Amazon Australia', 5),
    (v_case_study_id, v_sec_lessons,
     'The launch of a second AWS Region in Australia provides even greater resilience and enables more customers to develop cloud-based applications that help fuel economic development across the country.',
     'Prasad Kalyanaraman', 'Vice President of Infrastructure Services, AWS',
     'https://international.austrade.gov.au/en/news-and-analysis/news/aws-to-invest-13-2-billion-aud-in-cloud-infrastructure-in-australia',
     'Austrade', 6);
END $$;
