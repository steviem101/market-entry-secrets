-- Phase 5.3 Batch 1 (3/10): Snowflake AU market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry     uuid;
  v_sec_success   uuid;
  v_sec_challenges uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'snowflake-australia-market-entry not found'; END IF;

  SELECT id INTO v_sec_entry      FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_challenges FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'challenges-faced';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'Snowflake opened Sydney/Melbourne offices in February 2018',
      'Peter O''Connor became APAC VP Sales, first APJ hire (2017)',
      'AWS Sydney deployment announced September 2017, live early 2018',
      'Aussie customers: Carsales, Domain, Bunnings, Judo Bank, Coles',
      'Distinguishing move: data sovereignty plus partner-led ANZ ecosystem'
    ],
    quick_facts = '[
      {"label": "ANZ Entry Year",        "value": "2017–2018",                        "icon": "Calendar"},
      {"label": "APAC VP / Country Lead","value": "Peter O''Connor",                  "icon": "User"},
      {"label": "AU HQ City",            "value": "Sydney (plus Melbourne)",          "icon": "MapPin"},
      {"label": "AU Customers",          "value": "Carsales, Domain, Bunnings, Judo", "icon": "Building"},
      {"label": "AWS Sydney Deployment", "value": "Sept 2017 announced",              "icon": "Globe2"},
      {"label": "Origin",                "value": "San Mateo, USA",                   "icon": "Briefcase"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'ComputerWeekly — Snowflake making headway in Australia', 'https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia', '2026-05-04', 'news', 1),
    (v_case_study_id, 'PR Wire — Snowflake Computing Accelerates APJ Expansion with Sydney and Melbourne Office Launch', 'https://prwire.com.au/pr/75557/snowflake-computing-accelerates-apj-expansion-with-sydney-and-melbourne-office-launch-and-two-senior-executive-appointments', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'Intelligent CIO APAC — Get to Know: Peter O''Connor of Snowflake', 'https://www.intelligentcio.com/apac/2020/07/31/get-to-know-peter-oconnor-of-snowflake/', '2026-05-04', 'interview', 3),
    (v_case_study_id, 'ChannelLife — Snowflake honours top tier Aussie partners', 'https://channellife.com.au/story/snowflake-honours-top-tier-aussie-partners', '2026-05-04', 'news', 4),
    (v_case_study_id, 'ChannelLife — 10 Minute IT Jams: Who is Snowflake?', 'https://channellife.com.au/story/video-10-minute-it-jams-who-is-snowflake', '2026-05-04', 'interview', 5),
    (v_case_study_id, 'PR Newswire — Snowflake Continues Global Expansion With Australian Data Center Deployment', 'https://www.prnewswire.com/news-releases/snowflake-continues-global-expansion-with-australian-data-center-deployment-300518145.html', '2026-05-04', 'press_release', 6),
    (v_case_study_id, 'iTnews — Carsales drives real time data', 'https://www.itnews.com.au/news/carsales-drives-real-time-data-599862', '2026-05-04', 'news', 7),
    (v_case_study_id, 'ComputerWeekly — Snowflake brings AI to data for Australian businesses', 'https://www.computerweekly.com/news/366615242/Snowflake-brings-AI-to-data-for-Australian-businesses', '2026-05-04', 'news', 8),
    (v_case_study_id, 'GovTechReview — Interview: Peter O''Connor, Snowflake', 'https://www.govtechreview.com.au/content/gov-digital/article/interview-peter-o-connor-snowflake-764003577', '2026-05-04', 'interview', 9);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'When I joined Snowflake in 2017, I had the great fortune of being its first employee in Asia Pacific.',
     'Peter O''Connor', 'Vice President of Sales, Asia Pacific, Snowflake',
     'https://www.intelligentcio.com/apac/2020/07/31/get-to-know-peter-oconnor-of-snowflake/',
     'Intelligent CIO APAC', 1),
    (v_case_study_id, v_sec_challenges,
     'Changing rules around data sovereignty is also a big issue. Most governments these days are wanting data that''s generated in-country to stay in-country.',
     'Peter O''Connor', 'Vice President of Sales, Asia Pacific, Snowflake',
     'https://www.intelligentcio.com/apac/2020/07/31/get-to-know-peter-oconnor-of-snowflake/',
     'Intelligent CIO APAC', 2),
    (v_case_study_id, v_sec_success,
     'Snowflake today runs on both AWS and Azure in Australia, which obviously covers the Australia and New Zealand market.',
     'Peter O''Connor', 'Vice President of Sales, Asia Pacific, Snowflake',
     'https://channellife.com.au/story/video-10-minute-it-jams-who-is-snowflake',
     'ChannelLife Australia', 3),
    (v_case_study_id, v_sec_success,
     'This past year has been a particularly successful one for Snowflake in ANZ and we recognise the role our partners have played in achieving market momentum.',
     'Peter O''Connor', 'APAC Sales Vice President, Snowflake',
     'https://channellife.com.au/story/snowflake-honours-top-tier-aussie-partners',
     'ChannelLife Australia', 4),
    (v_case_study_id, v_sec_entry,
     'By providing an Australian deployment, Snowflake enables customers with Australian data to keep that information close to home.',
     'Bob Muglia', 'CEO, Snowflake Computing',
     'https://www.prnewswire.com/news-releases/snowflake-continues-global-expansion-with-australian-data-center-deployment-300518145.html',
     'PR Newswire', 5),
    (v_case_study_id, v_sec_entry,
     'The combined experience which Peter and Alan bring to Snowflake in the Asia Pacific region will be crucial to accelerating our market presence in the data sharing economy.',
     'Chris Degnan', 'Chief Revenue Officer, Snowflake',
     'https://prwire.com.au/pr/75557/snowflake-computing-accelerates-apj-expansion-with-sydney-and-melbourne-office-launch-and-two-senior-executive-appointments',
     'PR Wire Australia', 6);
END $$;
