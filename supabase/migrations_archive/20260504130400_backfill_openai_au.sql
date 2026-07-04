-- Phase 5.3 Batch 1 (2/10): OpenAI AU market entry backfill
-- Idempotent. Hero left NULL pending verifiable brand asset.

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry     uuid;
  v_sec_success   uuid;
  v_sec_metrics   uuid;
  v_sec_lessons   uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items
   WHERE slug = 'openai-australia-market-entry';
  IF v_case_study_id IS NULL THEN RETURN; END IF;

  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'Sydney office announced August 28, 2025; opened December 2025',
      'COO Brad Lightcap led announcement; no AU country manager named publicly',
      'Customers: CommBank, Canva, Atlassian, Coles, Wesfarmers, Fortescue',
      'A$7B NEXTDC sovereign AI campus partnership at Eastern Creek',
      'ChatGPT weekly active users in Australia grew 2.5x year-on-year'
    ],
    quick_facts = '[
      {"label": "ANZ Entry Date",   "value": "28 August 2025 (announced)",         "icon": "Calendar"},
      {"label": "AU Public Policy", "value": "Brent Thomas (ex-Tech Council)",     "icon": "User"},
      {"label": "AU HQ City",       "value": "Sydney",                             "icon": "MapPin"},
      {"label": "AU Customers",     "value": "CommBank, Canva, Atlassian, Coles",  "icon": "Building"},
      {"label": "Infra Partner",    "value": "NEXTDC – A$7B Eastern Creek campus", "icon": "Network"},
      {"label": "Origin",           "value": "San Francisco, USA",                 "icon": "Globe2"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'OpenAI — Introducing OpenAI for Australia', 'https://openai.com/global-affairs/openai-for-australia/', '2026-05-04', 'company_blog', 1),
    (v_case_study_id, 'B&T — OpenAI Opens First Australian Office', 'https://www.bandt.com.au/openai-opens-first-australian-office/', '2026-05-04', 'news', 2),
    (v_case_study_id, 'Marketing-Interactive — OpenAI to open Sydney office as ChatGPT adoption surges', 'https://www.marketing-interactive.com/openai-to-open-sydney-office-as-chatgpt-adoption-surges', '2026-05-04', 'news', 3),
    (v_case_study_id, 'Marketing-Interactive — OpenAI opens first Australian office, local leadership details under wraps', 'https://www.marketing-interactive.com/openai-opens-first-australian-office-local-leadership-details-under-wraps', '2026-05-04', 'news', 4),
    (v_case_study_id, 'SmartCompany — OpenAI courts Australian startups alongside Sydney office debut', 'https://www.smartcompany.com.au/artificial-intelligence/openai-australia-startup-program-sydney-office/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'CommBank Newsroom — CommBank and OpenAI Australia-First Strategic Partnership', 'https://www.commbank.com.au/articles/newsroom/2025/08/tech-ai-partnership.html', '2026-05-04', 'press_release', 6),
    (v_case_study_id, 'NSW Government — Minns Labor Government welcomes OpenAI''s investment to NSW', 'https://www.nsw.gov.au/ministerial-releases/minns-labor-government-welcomes-openais-investment-to-nsw', '2026-05-04', 'government', 7),
    (v_case_study_id, 'NEXTDC — Building the Next Generation of Sovereign AI Infrastructure in Australia', 'https://www.nextdc.com/news/building-the-next-generation-of-sovereign-ai-infrastructure-in-australia', '2026-05-04', 'press_release', 8),
    (v_case_study_id, 'Information Age (ACS) — OpenAI, NEXTDC ink $7B Australian data centre deal', 'https://ia.acs.org.au/article/2025/openai--nextdc-ink--7b-australian-data-centre-deal.html', '2026-05-04', 'news', 9),
    (v_case_study_id, 'ChannelLife — OpenAI hires Brent Thomas to lead public policy in ANZ', 'https://channellife.com.au/story/openai-hires-brent-thomas-to-lead-public-policy-in-anz', '2026-05-04', 'news', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'Australia''s government, businesses and world-class developer ecosystem are already shaping the future of AI.',
     'Brad Lightcap', 'Chief Operating Officer, OpenAI',
     'https://www.marketing-interactive.com/openai-to-open-sydney-office-as-chatgpt-adoption-surges',
     'Marketing-Interactive', 1),
    (v_case_study_id, v_sec_entry,
     'We''re excited to expand our presence in Australia and build a local team to work closely with partners, customers and the millions of Australians who use ChatGPT daily.',
     'Brad Lightcap', 'Chief Operating Officer, OpenAI',
     'https://www.marketing-interactive.com/openai-to-open-sydney-office-as-chatgpt-adoption-surges',
     'Marketing-Interactive', 2),
    (v_case_study_id, v_sec_success,
     'Australia is well-placed to lead the world in AI. It has a history of early technology adoption, a world-class developer community, and a clear ambition to lift productivity.',
     'Jason Kwon', 'Chief Strategy Officer, OpenAI',
     'https://www.bandt.com.au/openai-opens-first-australian-office/',
     'B&T', 3),
    (v_case_study_id, v_sec_success,
     'Sydney is Australia''s digital capital, backed by world-class talent and strong government investment – and OpenAI''s arrival here takes that even further.',
     'Daniel Mookhey', 'NSW Treasurer',
     'https://www.bandt.com.au/openai-opens-first-australian-office/',
     'B&T', 4),
    (v_case_study_id, v_sec_metrics,
     'Our strategic partnership with OpenAI reflects our commitment to bringing world class capabilities to Australia.',
     'Matt Comyn', 'CEO, Commonwealth Bank of Australia',
     'https://www.commbank.com.au/articles/newsroom/2025/08/tech-ai-partnership.html',
     'CommBank Newsroom', 5),
    (v_case_study_id, v_sec_lessons,
     'To be globally competitive, Australia must embrace this new era of rapid technological change.',
     'Matt Comyn', 'CEO, Commonwealth Bank of Australia',
     'https://www.commbank.com.au/articles/newsroom/2025/08/tech-ai-partnership.html',
     'CommBank Newsroom', 6);
END $$;
