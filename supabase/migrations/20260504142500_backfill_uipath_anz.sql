-- Phase 5.3 Batch 2 (10/11): UiPath ANZ market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'uipath-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'uipath-australia-market-entry not found'; END IF;
  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY[
      'UiPath entered ANZ in 2018 via APAC sales push from Hong Kong; opened Sydney office at 1 York St',
      'Australian Unity 2018 win: 42,000 transactions, 22,493 hours saved at 94% success rate by Feb 2019',
      'Optus avoided 20% FTE growth and added $9M annual revenue in six weeks via UiPath',
      'Healthcare and energy lead ANZ growth — Gold Coast Health saved 40,000 patient-care hours',
      'UiPath Cloud achieved IRAP Protected certification on 7 May 2025, unlocking AU federal workloads'
    ],
    quick_facts = '[
      {"label":"ANZ entry","value":"2018 (Sydney office)","icon":"Calendar"},
      {"label":"ANZ HQ","value":"1 York St Sydney + 222 Exhibition St Melbourne","icon":"MapPin"},
      {"label":"ANZ leader","value":"Peter Graves, Area VP ANZ","icon":"User"},
      {"label":"APJ leader","value":"Lee Hawksley, SVP & MD APJ (Sydney, Nov 2022)","icon":"Users"},
      {"label":"Founded","value":"2005, Bucharest, Romania","icon":"Building"},
      {"label":"Listed","value":"NYSE:PATH, Apr 2021, $1.34B IPO","icon":"DollarSign"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by = 'Stephen Browne',
    style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'UiPath — Australian Unity case study', 'https://www.uipath.com/resources/automation-case-studies/australian-unity', '2026-05-04', 'company_blog', 1),
    (v_case_study_id, 'UiPath — Heritage Bank case study', 'https://www.uipath.com/resources/automation-case-studies/heritage-bank-banking-rpa', '2026-05-04', 'company_blog', 2),
    (v_case_study_id, 'UiPath — Gold Coast Health case study', 'https://www.uipath.com/resources/automation-case-studies/gold-coast-health-uses-automation-to-deliver-real-time-patient-care', '2026-05-04', 'company_blog', 3),
    (v_case_study_id, 'UiPath blog — UiPathTogether Sydney 2019 (Optus, Suncorp, Heritage)', 'https://www.uipath.com/blog/rpa/together-sydney-event-2019', '2026-05-04', 'company_blog', 4),
    (v_case_study_id, 'iTnews — Optus uses internal academy to scale up automation', 'https://www.itnews.com.au/news/optus-uses-internal-academy-to-scale-up-automation-531428', '2026-05-04', 'news', 5),
    (v_case_study_id, 'iTnews — UiPath appoints Lee Hawksley as SVP & MD APJ', 'https://www.itnews.com.au/news/uipath-appoints-twillios-lee-hawksley-as-svp-and-managing-director-apj-586142', '2026-05-04', 'news', 6),
    (v_case_study_id, 'ChannelLife AU — UiPath sees ROI pressure in ANZ AI shift (Peter Graves)', 'https://channellife.com.au/story/exclusive-uipath-sees-roi-pressure-in-anz-ai-shift', '2026-05-04', 'news', 7),
    (v_case_study_id, 'iTBrief AU — Gold Coast Health boosts patient care with UiPath', 'https://itbrief.com.au/story/gold-coast-health-boosts-patient-care-with-uipath-automation', '2026-05-04', 'news', 8),
    (v_case_study_id, 'UiPath Trust Centre — IRAP Protected certification (7 May 2025)', 'https://www.uipath.com/legal/trust-and-security/irap', '2026-05-04', 'company_blog', 9),
    (v_case_study_id, 'UiPath IR — IPO pricing announcement (NYSE:PATH, Apr 2021)', 'https://www.uipath.com/newsroom/uipath-announces-ipo-pricing', '2026-05-04', 'press_release', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, 'Companies in Australia and New Zealand are early adopters of new technology — many ANZ organisations are deploying UiPath''s new technologies first.', 'Andrew Phillips', 'ANZ VP & Managing Director, UiPath', 'https://itbrief.com.au/story/q-a-uipath-s-andrew-phillips-decodes-rpa-for-the-modern-business', 'iTBrief AU', 1),
    (v_case_study_id, v_sec_entry, 'Asia Pacific and Japan represents one of the most diverse and exciting business communities on the planet and, in turn, one of the biggest opportunities for UiPath.', 'Lee Hawksley', 'SVP & MD APJ, UiPath', 'https://www.itnews.com.au/news/uipath-appoints-twillios-lee-hawksley-as-svp-and-managing-director-apj-586142', 'iTnews', 2),
    (v_case_study_id, v_sec_success, 'We didn''t involve IT at all from the start — we just empowered people from the business.', 'Michael Raines', 'Senior Manager Digital Innovation & Automation, Optus', 'https://www.itnews.com.au/news/optus-uses-internal-academy-to-scale-up-automation-531428', 'iTnews', 3),
    (v_case_study_id, v_sec_success, 'Heritage is transforming from a physical bank with a digital presence to a digital bank with a physical presence.', 'David Johnston', 'Intelligent Automation & Process Excellence Manager, Heritage Bank', 'https://www.uipath.com/resources/automation-case-studies/heritage-bank-banking-rpa', 'UiPath Customer Story', 4),
    (v_case_study_id, v_sec_metrics, 'Our partnership with UiPath has been instrumental in driving our digital transformation journey. By automating time-consuming administrative tasks, we can redirect valuable resources towards enhancing the quality of patient care.', 'Kirsten Hinze', 'Senior Director Digital Experience, Gold Coast Health', 'https://itbrief.com.au/story/gold-coast-health-boosts-patient-care-with-uipath-automation', 'iTBrief AU', 5),
    (v_case_study_id, v_sec_lessons, 'Executives need to see real ROI from their investments. They''ve been happy to put money into pilots and experiments. But now they''re asking — where''s the ROI?', 'Peter Graves', 'Area Vice President ANZ, UiPath', 'https://channellife.com.au/story/exclusive-uipath-sees-roi-pressure-in-anz-ai-shift', 'ChannelLife AU', 6);
END $$;
