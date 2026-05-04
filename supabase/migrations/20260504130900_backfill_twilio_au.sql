-- Phase 5.3 Batch 1 (7/10): Twilio AU market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry     uuid;
  v_sec_success   uuid;
  v_sec_lessons   uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'twilio-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'twilio-australia-market-entry not found'; END IF;

  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'Twilio opened first Australian offices in April 2018',
      'Sydney HQ plus Melbourne office launched simultaneously',
      'Richard Watson appointed first AU country director',
      'Early AU customers: Atlassian, Domino''s, Airtasker, zipMoney',
      'SIGNAL Sydney 2025 marked sold-out APJ debut event'
    ],
    quick_facts = '[
      {"label": "ANZ Entry Year",       "value": "April 2018",                       "icon": "Calendar"},
      {"label": "First AU Country Dir", "value": "Richard Watson",                   "icon": "User"},
      {"label": "AU Offices",           "value": "Sydney and Melbourne",             "icon": "MapPin"},
      {"label": "AU Customers",         "value": "Atlassian, Domino''s, Airtasker",  "icon": "Building"},
      {"label": "International Office", "value": "11th outside the US",              "icon": "Globe2"},
      {"label": "Origin",               "value": "San Francisco, USA",               "icon": "Briefcase"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Twilio Press Release — Twilio Establishes Presence in Australia', 'https://www.twilio.com/en-us/press/releases/cloud-communications-platform-twilio-establishes-presence-in-australia-and-appoints-new-regional-director', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'SmartCompany — Silicon Valley giant Twilio opens two offices in Australia', 'https://www.smartcompany.com.au/startupsmart/news/cloud-communications-giant-twilio-opens-two-offices-in-australia/', '2026-05-04', 'news', 2),
    (v_case_study_id, 'ChannelLife AU — Twilio boosts local presence with first Aussie office', 'https://channellife.com.au/story/twilio-boosts-local-presence-first-aussie-office', '2026-05-04', 'news', 3),
    (v_case_study_id, 'Startup Daily — Twilio opens Australian office to push growth', 'https://www.startupdaily.net/topic/cloud-communications-provider-twilio-opens-australian-office-push-growth/', '2026-05-04', 'news', 4),
    (v_case_study_id, 'ARN — Twilio makes Aussie push with former Symantec channel talent', 'https://www.arnnet.com.au/article/1265899/twilio-makes-aussie-push-with-former-symantec-channel-talent.html', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Twilio Blog — SIGNAL Sydney 2025: A Sold-out Debut on the Harbour', 'https://www.twilio.com/en-us/blog/events/signal-sydney-2025-recap', '2026-05-04', 'company_blog', 6),
    (v_case_study_id, 'Twilio Blog — Welcome to the Builder''s Arcade at SIGNAL Sydney 2025', 'https://www.twilio.com/en-us/blog/events/twilio-builders-arcade-syd25', '2026-05-04', 'company_blog', 7),
    (v_case_study_id, 'SIGNAL Sydney 2025 Event Page', 'https://signal.twilio.com/sydney2025', '2026-05-04', 'company_blog', 8),
    (v_case_study_id, 'M Moser Associates — Twilio Sydney Office Project', 'https://www.mmoser.com/projects/twilio-sydney/', '2026-05-04', 'other', 9);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'We have had a fantastic amount of organic traction here in Australia, with leading companies including Atlassian, zipMoney, Domino''s and Airtasker already building and scaling their applications using the Twilio platform.',
     'Richard Watson', 'Country Director, Australia, Twilio',
     'https://channellife.com.au/story/twilio-boosts-local-presence-first-aussie-office',
     'ChannelLife Australia', 1),
    (v_case_study_id, v_sec_success,
     'This is a testament to the quality of Twilio''s product offering and also to the maturity of the Australian market.',
     'Richard Watson', 'Country Director, Australia, Twilio',
     'https://channellife.com.au/story/twilio-boosts-local-presence-first-aussie-office',
     'ChannelLife Australia', 2),
    (v_case_study_id, v_sec_lessons,
     'Engagement between businesses and their customers continues to be a pain point and I believe Twilio will go a long way to help solve this problem.',
     'Richard Watson', 'Country Director, Australia, Twilio',
     'https://channellife.com.au/story/twilio-boosts-local-presence-first-aussie-office',
     'ChannelLife Australia', 3),
    (v_case_study_id, v_sec_entry,
     'International expansion represents a significant long-term growth opportunity for Twilio. This move builds on our existing customer and developer momentum in Australia.',
     'George Hu', 'Chief Operating Officer, Twilio',
     'https://www.arnnet.com.au/article/1265899/twilio-makes-aussie-push-with-former-symantec-channel-talent.html',
     'ARN Australia', 4);
END $$;
