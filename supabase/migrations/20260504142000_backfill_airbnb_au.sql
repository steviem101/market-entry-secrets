-- Phase 5.3 Batch 2 (9/11): Airbnb Australia market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry';
  IF v_case_study_id IS NULL THEN RETURN; END IF;
  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY[
      'Opened Sydney office Nov 2012 as 11th global hub; ~1,000 AU nights/night up from ~150 a year prior',
      'Sam McDonagh became first AU/NZ Country Manager Aug 2014; Susan Wheeldon took over in Oct 2019',
      'NSW set Australia''s first statewide cap in Jun 2018: 180 unhosted nights/year in Greater Sydney',
      'Victoria''s 7.5% Short Stay Levy started 1 Jan 2025 — Australia''s first dedicated short-stay tax',
      'Oxford Economics: Airbnb drove A$20.3B of activity, 107,000 jobs and ~7% of AU tourism GDP in 2024'
    ],
    quick_facts = '[
      {"label":"Sydney office opened","value":"November 2012 (11th global office)","icon":"Calendar"},
      {"label":"Active AU listings (2024-25)","value":"161,296 (+5.6% YoY)","icon":"Building"},
      {"label":"Country Manager","value":"Susan Wheeldon (since Oct 2019)","icon":"User"},
      {"label":"Avg host earnings","value":"A$62,388 / listing / year","icon":"DollarSign"},
      {"label":"Economic impact (2024)","value":"A$20.3B; 107,000 jobs","icon":"TrendingUp"},
      {"label":"AU regulatory milestones","value":"NSW 180-day cap (2018); Vic 7.5% levy (2025); Byron 60-day cap (2024)","icon":"MapPin"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by = 'Stephen Browne',
    style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Airbnb News AU — New Country Manager Susan Wheeldon (Oct 2019)', 'https://news.airbnb.com/en-au/new-country-manager-to-lead-airbnbs-australia-new-zealand-team/', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'Airbnb Press AU — Sam McDonagh appointed Country Manager (Aug 2014)', 'https://www.airbnb.com.au/press/news/airbnb-appoints-sam-mcdonagh-as-country-manager-for-australia-and-new-zealand', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'Airbnb News AU — Oxford Economics A$20.3B AU economic impact (Aug 2025)', 'https://news.airbnb.com/en-au/oxford-economics-report-reveals-airbnbs-20-3-billion-impact-in-australia/', '2026-05-04', 'company_blog', 3),
    (v_case_study_id, 'NSW Planning — Short-term holiday letting plan a win-win (Jun 2018)', 'https://www.planning.nsw.gov.au/News/2018/Short-term-holiday-letting-plan-a-win-win', '2026-05-04', 'government', 4),
    (v_case_study_id, 'Hotel Management AU — NSW imposes 180-night cap on STR (6 Jun 2018)', 'https://www.hotelmanagement.com.au/2018/06/06/nsw-government-imposes-180-night-cap-on-short-term-letting-in-sydney/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Parliament of Victoria — Short Stay Levy explainer', 'https://www.parliament.vic.gov.au/news/economy/short-stay-levy/', '2026-05-04', 'government', 6),
    (v_case_study_id, 'Vic State Revenue Office — Understanding the Short Stay Levy', 'https://www.sro.vic.gov.au/owning-property/short-stay-levy/understanding-short-stay-levy', '2026-05-04', 'government', 7),
    (v_case_study_id, 'NSW Government — Byron Bay short-term rental rules (60-day cap, Sep 2024)', 'https://www.nsw.gov.au/media-releases/changes-to-byron-bay-short-term-rental-rules', '2026-05-04', 'government', 8),
    (v_case_study_id, 'ATO — Sharing Economy Reporting Regime (in force 1 Jul 2023)', 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/third-party-reporting/sharing-economy-reporting-regime', '2026-05-04', 'government', 9),
    (v_case_study_id, 'Deloitte Access Economics — Economic effects of Airbnb in Australia (Jul 2017)', 'https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf', '2026-05-04', 'other', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, '1,000 people are sleeping in this country from around the world on Airbnb tonight — up from around 150 a year earlier.', 'Brian Chesky', 'Co-founder & CEO, Airbnb', 'https://www.smartcompany.com.au/startupsmart/airbnb-sinks-its-teeth-into-local-market-after-opening-sydney-office/', 'SmartCompany', 1),
    (v_case_study_id, v_sec_entry, 'Airbnb is an incredible company that is quite simply changing the way people travel. This role presents a brilliant opportunity to work with one of the most dynamic communities of passionate hosts and travellers in the world today.', 'Sam McDonagh', 'Inaugural Country Manager, Airbnb Australia & New Zealand (2014-2019)', 'https://www.airbnb.com.au/press/news/airbnb-appoints-sam-mcdonagh-as-country-manager-for-australia-and-new-zealand', 'Airbnb Press AU', 2),
    (v_case_study_id, v_sec_success, 'It''s incredibly rewarding to see the ripple effect and know that Airbnb is helping local businesses thrive, creating jobs, and spreading economic benefits across every corner of Australia.', 'Susan Wheeldon', 'Country Manager, Airbnb Australia & New Zealand', 'https://news.airbnb.com/en-au/oxford-economics-report-reveals-airbnbs-20-3-billion-impact-in-australia/', 'Airbnb News AU', 3),
    (v_case_study_id, v_sec_metrics, 'This new data confirms Airbnb is not just vital for tourism in Australia, but vital for the entire economy. In stark contrast to the big hotel lobby''s trickle-down approach, Airbnb drives bottom-up growth.', 'Sam McDonagh', 'Country Manager, Airbnb Australia & New Zealand', 'https://news.airbnb.com/en-au/airbnb-triggers-a-jobs-boom-throughout-australia/', 'Airbnb News AU', 4),
    (v_case_study_id, v_sec_lessons, 'The 180 days a year limit approximately equates to weekends, school holidays and public holidays so we felt this was a fair and balanced approach.', 'Anthony Roberts', 'NSW Minister for Planning and Housing', 'https://www.hotelmanagement.com.au/2018/06/06/nsw-government-imposes-180-night-cap-on-short-term-letting-in-sydney/', 'Hotel Management AU', 5),
    (v_case_study_id, v_sec_lessons, 'It is important we recognise and give a signal to the market that our priority is to get people into homes and long-term, secure rental accommodation is important.', 'Tim Pallas', 'Treasurer of Victoria', 'https://www.parliament.vic.gov.au/news/economy/short-stay-levy/', 'Parliament of Victoria', 6);
END $$;
