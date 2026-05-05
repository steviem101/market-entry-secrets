-- Phase 5.3 Batch 2 (11/11): Xero Australia market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'xero-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'xero-australia-market-entry not found'; END IF;
  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY[
      'Founded 2006 in Wellington by Rod Drury and Hamish Edwards as cloud-native rival to desktop incumbents',
      'Launched Australia in 2008 alongside the UK; ANZ now Xero''s biggest region with 2.7M of 4.59M global subs',
      'Listed NZX 2007, dual-listed ASX 2012, then delisted NZX in Feb 2018 to consolidate on ASX',
      'Won Australia by partnering with accountants, integrating with the ATO for STP, and hosting Xerocon',
      'Under CEO Sukhinder Singh Cassidy (Feb 2023-), pursuing 3x3 focus across ANZ, UK, US'
    ],
    quick_facts = '[
      {"label":"Founded","value":"2006, Wellington, New Zealand","icon":"Calendar"},
      {"label":"Founders","value":"Rod Drury & Hamish Edwards","icon":"User"},
      {"label":"Australia launch","value":"2008 (alongside UK)","icon":"MapPin"},
      {"label":"Current CEO","value":"Sukhinder Singh Cassidy (Feb 2023-)","icon":"Building"},
      {"label":"Global subscribers","value":"4.59M (H1 FY26, Sep 2025)","icon":"Users"},
      {"label":"H1 FY26 revenue","value":"NZ$1.19B, +20% YoY","icon":"DollarSign"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by = 'Stephen Browne',
    style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Xero H1 FY26 Interim Results Investor Presentation (ASX release)', 'https://www.listcorp.com/asx/xro/xero-limited/news/fy26-interim-results-investor-presentation-3275274.html', '2026-05-04', 'company_blog', 1),
    (v_case_study_id, 'Xero AU Media Factsheet', 'https://www.xero.com/au/media/factsheet/', '2026-05-04', 'company_blog', 2),
    (v_case_study_id, 'Accounting Today — Xero announces NZ$1.2B in revenue (H1 FY26)', 'https://www.accountingtoday.com/news/xero-announces-1-2-billion-in-revenue', '2026-05-04', 'news', 3),
    (v_case_study_id, 'Xero Blog — CEO succession, Sukhinder Singh Cassidy appointed (Nov 2022)', 'https://blog.xero.com/news-events/xero-announces-ceo-succession/', '2026-05-04', 'press_release', 4),
    (v_case_study_id, 'NZ Herald — Rod Drury: Why Xero is leaving the NZX (Nov 2017)', 'https://www.nzherald.co.nz/business/markets/shares/rod-drury-why-xero-is-leaving-the-nzx/TB44XCK6O5JJT5BKA5GAI2NDRI/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Stuff.co.nz — Xero shares fall after surprise NZX delisting', 'https://www.stuff.co.nz/business/industries/98702227/xero-to-delist-from-nzx', '2026-05-04', 'news', 6),
    (v_case_study_id, 'Xero Blog — Xero to acquire Planday (Mar 2021)', 'https://www.xero.com/blog/2021/03/xero-to-acquire-planday/', '2026-05-04', 'press_release', 7),
    (v_case_study_id, 'Xero Blog — Xero to acquire Melio (Jun 2025)', 'https://blog.xero.com/news-events/xero-to-acquire-melio/', '2026-05-04', 'press_release', 8),
    (v_case_study_id, 'Accounting Today — Xero focus on accounting, payroll, payments in US/UK/AU (3x3)', 'https://www.accountingtoday.com/news/xero-to-focus-on-accounting-payroll-payments-in-us-uk-and-australia-says-ceo', '2026-05-04', 'news', 9),
    (v_case_study_id, 'Xero Media Release — Xerocon returns to Australia with Brisbane event (2025)', 'https://www.xero.com/au/media-releases/xerocon-returns-australia-supercharged-brisbane-event/', '2026-05-04', 'press_release', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, 'Around 80% of our revenue now comes from outside New Zealand. Our 1.2 million subscribers are from 180 countries.', 'Rod Drury', 'Founder & then-CEO, Xero', 'https://www.nzherald.co.nz/business/markets/shares/rod-drury-why-xero-is-leaving-the-nzx/TB44XCK6O5JJT5BKA5GAI2NDRI/', 'NZ Herald', 1),
    (v_case_study_id, v_sec_entry, 'Our decision to consolidate the two listings onto the ASX and delist from NZX sets a new platform to support the next phase of our long term future growth.', 'Rod Drury', 'Founder & then-CEO, Xero', 'https://www.nzherald.co.nz/business/markets/shares/rod-drury-why-xero-is-leaving-the-nzx/TB44XCK6O5JJT5BKA5GAI2NDRI/', 'NZ Herald', 2),
    (v_case_study_id, v_sec_success, 'Our purpose is to have a positive impact on the world by helping small businesses grow. Cloud technology has revolutionised the way small businesses operate.', 'Craig Hudson', 'Managing Director NZ & Pacific Islands, Xero', 'https://www.crowdfundinsider.com/2018/12/142204-xero-milestone-1-million-australia-new-zealand-users-sign-up/', 'Crowdfund Insider', 3),
    (v_case_study_id, v_sec_success, 'Xerocon Brisbane is all about bringing our incredible accounting and bookkeeping community together — not just to celebrate, but to empower them.', 'Angad Soin', 'Managing Director ANZ & Global Chief Strategy Officer, Xero', 'https://www.xero.com/au/media-releases/xerocon-returns-australia-supercharged-brisbane-event/', 'Xero Media Release', 4),
    (v_case_study_id, v_sec_metrics, 'In Australia and New Zealand the penetration of cloud accounting sits around 40 percent, more than double what it is worldwide, which shows clear leadership and uptake.', 'Craig Hudson', 'Managing Director NZ & Pacific Islands, Xero', 'https://www.crowdfundinsider.com/2018/12/142204-xero-milestone-1-million-australia-new-zealand-users-sign-up/', 'Crowdfund Insider', 5),
    (v_case_study_id, v_sec_lessons, 'These are the jobs that you and your small businesses have told us are critically important, and we need to invest deeper in making them truly magical.', 'Sukhinder Singh Cassidy', 'CEO, Xero', 'https://www.accountingtoday.com/news/xero-to-focus-on-accounting-payroll-payments-in-us-uk-and-australia-says-ceo', 'Accounting Today', 6);
END $$;
