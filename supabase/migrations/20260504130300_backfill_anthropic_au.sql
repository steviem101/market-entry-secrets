-- Phase 5.3 Batch 1 (1/10): Anthropic AU market entry backfill
-- Idempotent. Hero left NULL pending verifiable brand asset.
-- Source provenance: .claude/staging/anthropic-australia-market-entry.md

DO $$
DECLARE
  v_case_study_id      uuid;
  v_sec_entry          uuid;
  v_sec_success        uuid;
  v_sec_metrics        uuid;
  v_sec_lessons        uuid;
BEGIN
  SELECT id INTO v_case_study_id
  FROM public.content_items
  WHERE slug = 'anthropic-australia-market-entry';
  IF v_case_study_id IS NULL THEN
    RAISE EXCEPTION 'anthropic-australia-market-entry not found';
  END IF;

  SELECT id INTO v_sec_entry   FROM public.content_sections
   WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections
   WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections
   WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections
   WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'Sydney office officially opened 28 April 2026',
      'Theo Hourmouzis named GM ANZ from Snowflake',
      'Customers include Commonwealth Bank, Quantium, Canva, Xero',
      'Claude 3.5 Sonnet live in AWS Sydney region',
      'Federal MOU signed for AI safety collaboration'
    ],
    quick_facts = '[
      {"label": "ANZ Office Launch", "value": "28 April 2026",                    "icon": "Calendar"},
      {"label": "GM ANZ",            "value": "Theo Hourmouzis (ex-Snowflake)",   "icon": "User"},
      {"label": "AU HQ",             "value": "Sydney, NSW",                      "icon": "MapPin"},
      {"label": "AU Customers",      "value": "CommBank, Quantium, Canva, Xero",  "icon": "Building"},
      {"label": "Data Residency",    "value": "Claude on AWS Sydney",             "icon": "Shield"},
      {"label": "Origin",            "value": "San Francisco, USA",               "icon": "Globe2"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Anthropic — Sydney will become Anthropic''s fourth office in Asia-Pacific', 'https://www.anthropic.com/news/sydney-fourth-office-asia-pacific', '2026-05-04', 'company_blog', 1),
    (v_case_study_id, 'Anthropic — Theo Hourmouzis to lead Anthropic in Australia and New Zealand', 'https://www.anthropic.com/news/theo-hourmouzis-general-manager-australia-new-zealand', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'Anthropic — Australian Government and Anthropic sign MOU', 'https://www.anthropic.com/news/australia-MOU', '2026-05-04', 'press_release', 3),
    (v_case_study_id, 'Department of Industry, Science and Resources — MOU with Anthropic', 'https://www.industry.gov.au/news/australian-government-has-signed-memorandum-understanding-mou-global-ai-innovator-anthropic', '2026-05-04', 'government', 4),
    (v_case_study_id, 'ITBrief AU — Anthropic opens Sydney office, names NZ & Australia chief', 'https://itbrief.com.au/story/anthropic-opens-sydney-office-names-nz-australia-chief', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Marketing-Interactive — Anthropic appoints Hourmouzis as Sydney office officially opens', 'https://www.marketing-interactive.com/anthropic-appoints-theo-hourmouzis-to-lead-anz-as-sydney-office-officially-opens', '2026-05-04', 'news', 6),
    (v_case_study_id, 'Mumbrella — Anthropic appoints GM for ANZ and opens Sydney office', 'https://mumbrella.com.au/anthropic-appoints-gm-for-anz-and-opens-sydney-office-921617', '2026-05-04', 'news', 7),
    (v_case_study_id, 'EdTech Innovation Hub — Anthropic touches down in Sydney with Hourmouzis', 'https://www.edtechinnovationhub.com/news/anthropic-touches-down-in-sydney-with-former-snowflake-vp-theo-hourmouzis-at-the-helm', '2026-05-04', 'news', 8),
    (v_case_study_id, 'AWS — Claude 3.5 Sonnet now available in AWS Sydney Region', 'https://aws.amazon.com/about-aws/whats-new/2025/02/anthropics-upgraded-claude-3-5-sonnet-sydney-region/', '2026-05-04', 'press_release', 9),
    (v_case_study_id, 'ARN — Anthropic opens in Sydney with Hourmouzis at the helm', 'https://www.arnnet.com.au/article/4163981/anthropic-opens-in-sydney-with-theo-hourmouzis-at-the-helm.html', '2026-05-04', 'news', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry,
     'Organisations across Australia and New Zealand are thinking carefully about how to adopt AI and they want partners who take safety and rigor as seriously as they take the opportunity. That''s what drew me to Anthropic.',
     'Theo Hourmouzis', 'General Manager, Australia and New Zealand, Anthropic',
     'https://www.marketing-interactive.com/anthropic-appoints-theo-hourmouzis-to-lead-anz-as-sydney-office-officially-opens',
     'Marketing-Interactive', 1),
    (v_case_study_id, v_sec_success,
     'Theo''s appointment reflects the conviction we share with the Australian government that AI can drive economic growth when it''s developed and deployed responsibly.',
     'Chris Ciauri', 'Managing Director of International, Anthropic',
     'https://itbrief.com.au/story/anthropic-opens-sydney-office-names-nz-australia-chief',
     'ITBrief AU', 2),
    (v_case_study_id, v_sec_entry,
     'Establishing a local presence will help us to develop strong partnerships in ANZ and ensure Claude is built with respect for the unique goals, opportunities, and challenges of the region.',
     'Chris Ciauri', 'Managing Director of International, Anthropic',
     'https://www.anthropic.com/news/sydney-fourth-office-asia-pacific',
     'Anthropic', 3),
    (v_case_study_id, v_sec_lessons,
     'Australia''s investment in AI safety makes it a natural partner for responsible AI development. This MOU gives our collaboration a formal foundation.',
     'Dario Amodei', 'CEO, Anthropic',
     'https://www.anthropic.com/news/australia-MOU',
     'Anthropic', 4),
    (v_case_study_id, v_sec_metrics,
     'The future for us is about Claude becoming embedded infrastructure, a core part of how we run the organisation.',
     'Devan Seamans', 'Head of Marketing & Technology, YMCA South Australia',
     'https://itbrief.com.au/story/anthropic-opens-sydney-office-names-nz-australia-chief',
     'ITBrief AU', 5);
END $$;
