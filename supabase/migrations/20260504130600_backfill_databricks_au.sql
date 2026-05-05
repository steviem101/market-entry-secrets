-- Phase 5.3 Batch 1 (4/10): Databricks AU market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry     uuid;
  v_sec_success   uuid;
  v_sec_metrics   uuid;
  v_sec_lessons   uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'databricks-australia-market-entry';
  IF v_case_study_id IS NULL THEN RETURN; END IF;

  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'Sydney office opened June 2020, ANZ country manager November 2019',
      'Bede Hackney named inaugural ANZ Country Manager, succeeded by Adam Beavis (2023)',
      'AU customers include Atlassian, Tabcorp, NAB, Sportsbet, Healthdirect',
      'Lakehouse runs on AWS Sydney region (ap-southeast-2)',
      'Doubled ANZ headcount to 150+; 70% annual ANZ growth'
    ],
    quick_facts = '[
      {"label": "ANZ Entry Year",  "value": "2019 (CM); 2020 (Sydney office)",     "icon": "Calendar"},
      {"label": "AU HQ City",      "value": "Sydney, NSW",                         "icon": "MapPin"},
      {"label": "Country Manager", "value": "Adam Beavis, VP & CM ANZ",            "icon": "User"},
      {"label": "AU Customers",    "value": "Atlassian, Tabcorp, NAB, Sportsbet",  "icon": "Building"},
      {"label": "ANZ Growth",      "value": "Doubled to 150+ in 2 years",          "icon": "TrendingUp"},
      {"label": "Origin",          "value": "San Francisco, USA",                  "icon": "Globe2"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Databricks Newsroom — Adam Beavis Appointment as Head of ANZ', 'https://www.databricks.com/company/newsroom/press-releases/databricks-announces-appointment-adam-beavis-head-australia-and-new', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'Databricks Newsroom — Databricks Doubles ANZ Headcount', 'https://www.databricks.com/company/newsroom/press-releases/databricks-doubles-anz-headcount-signalling-growing-demand', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'Databricks Newsroom — 70% Annual Growth in ANZ Market', 'https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai', '2026-05-04', 'press_release', 3),
    (v_case_study_id, 'Databricks Newsroom — Deepens APJ Leadership Bench (Mar 2020)', 'https://www.databricks.com/company/newsroom/press-releases/databricks-deepens-leadership-bench-across-asia-pacific-and-japan', '2026-05-04', 'press_release', 4),
    (v_case_study_id, 'Databricks Newsroom — Momentum Continues in ANZ', 'https://www.databricks.com/company/newsroom/press-releases/databricks-momentum-continues-anz-organisations-demand-more-ai-data', '2026-05-04', 'press_release', 5),
    (v_case_study_id, 'ARN — Databricks Hires Tenable''s Bede Hackney as A/NZ Leader', 'https://www.arnnet.com.au/article/668514/databricks-hires-tenable-bede-hackney-new-nz-leader/', '2026-05-04', 'news', 6),
    (v_case_study_id, 'ITBrief AU — Databricks Accelerates APJ Expansion After $250M Round', 'https://itbrief.com.au/story/databricks-accelerates-apj-expansion-following-250-million-funding-round', '2026-05-04', 'news', 7),
    (v_case_study_id, 'Databricks Customers — Tabcorp Case Study', 'https://www.databricks.com/customers/tabcorp', '2026-05-04', 'company_blog', 8),
    (v_case_study_id, 'Databricks Customers — Atlassian Security Lakehouse', 'https://www.databricks.com/customers/atlassian/security-lakehouse', '2026-05-04', 'company_blog', 9),
    (v_case_study_id, 'Databricks Docs — AWS Supported Regions (ap-southeast-2 Sydney)', 'https://docs.databricks.com/aws/en/resources/supported-regions', '2026-05-04', 'other', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'Databricks is at the centre of all things data. Our customer use cases speak for themselves – from credit card fraud detection to personalised healthcare, we are helping data teams solve the world''s toughest problems.',
     'Bede Hackney', 'A/NZ Country Manager, Databricks',
     'https://www.arnnet.com.au/article/668514/databricks-hires-tenable-bede-hackney-new-nz-leader/',
     'ARN', 1),
    (v_case_study_id, v_sec_entry,
     'We''re in a pivotal moment in time where data and AI technologies are evolving rapidly. The companies who succeed in the next five to 10 years will be those who can harness the power of their data and keep up with the pace of innovation.',
     'Adam Beavis', 'Vice President and Country Manager, Databricks ANZ',
     'https://www.databricks.com/company/newsroom/press-releases/databricks-announces-appointment-adam-beavis-head-australia-and-new',
     'Databricks Newsroom', 2),
    (v_case_study_id, v_sec_success,
     'As businesses of all sizes look to drive greater insights by leveraging their data, Databricks wants to ensure that they are supported by teams that understand their local needs and requirements.',
     'Adam Beavis', 'Vice President and Country Manager, Databricks ANZ',
     'https://www.databricks.com/company/newsroom/press-releases/databricks-doubles-anz-headcount-signalling-growing-demand',
     'Databricks Newsroom', 3),
    (v_case_study_id, v_sec_metrics,
     'Data is a massive enabler for Tabcorp as we raise the game to create more personalised and responsible gambling experiences for our customers.',
     'Matt McKenzie', 'GM Technology - Strategy, Architecture, Data & Engineering, Tabcorp',
     'https://www.databricks.com/company/newsroom/press-releases/databricks-doubles-anz-headcount-signalling-growing-demand',
     'Databricks Newsroom', 4),
    (v_case_study_id, v_sec_success,
     'We have worked with Databricks for a number of years to build foundational capabilities for Atlassian''s platform that help us handle data securely.',
     'Sherif Mansour', 'Head of Product for Atlassian Intelligence',
     'https://www.databricks.com/company/newsroom/press-releases/databricks-doubles-anz-headcount-signalling-growing-demand',
     'Databricks Newsroom', 5),
    (v_case_study_id, v_sec_lessons,
     'We are powering our data strategy with Databricks'' Lakehouse, driving business-critical use cases including customer 360, fraud detection, and digital personalisation.',
     'Joanna Gurry', 'Executive, Data Delivery, NAB',
     'https://www.databricks.com/company/newsroom/press-releases/databricks-doubles-anz-headcount-signalling-growing-demand',
     'Databricks Newsroom', 6);
END $$;
