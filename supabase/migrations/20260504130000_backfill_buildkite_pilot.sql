-- =============================================================================
-- Phase 5.2 Pilot 1 of 3: Buildkite — case study readability backfill
--
-- Populates new Tier B fields on content_items + structured rows in
-- case_study_sources and case_study_quotes for the Buildkite pilot.
--
-- Idempotent: re-running this migration produces identical state. Sources and
-- quotes are deleted-then-reinserted to handle row drift. content_items uses
-- a single UPDATE.
--
-- Source provenance: see .claude/staging/buildkite-australia-startup.md
-- =============================================================================

DO $$
DECLARE
  v_case_study_id           uuid;
  v_section_entry_strategy  uuid;
  v_section_success_factors uuid;
  v_section_key_metrics     uuid;
BEGIN
  SELECT id INTO v_case_study_id
  FROM public.content_items
  WHERE slug = 'buildkite-australia-startup';

  IF v_case_study_id IS NULL THEN
    RAISE EXCEPTION 'buildkite-australia-startup case study not found';
  END IF;

  SELECT id INTO v_section_entry_strategy
  FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'entry-strategy';

  SELECT id INTO v_section_success_factors
  FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'success-factors';

  SELECT id INTO v_section_key_metrics
  FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'key-metrics';

  -- ---------------------------------------------------------------------------
  -- 1. Update content_items with hero, TL;DR, quick-facts, byline metadata
  -- ---------------------------------------------------------------------------
  UPDATE public.content_items
  SET
    hero_image_url    = 'https://www.businessdailymedia.com/images/0c/Keith_Pitt_founder_and_CEO_Buildkite.jpeg',
    hero_image_alt    = 'Keith Pitt, founder of Buildkite',
    hero_image_credit = 'Business Daily Media',
    tldr = ARRAY[
      'Bootstrapped seven years to profitability before raising venture capital',
      '$28M AUD Series A in 2020 led by OpenView at $200M+ valuation',
      'Hybrid CI/CD architecture keeps customer code on customer infrastructure',
      'Trusted by Shopify, Uber, Slack, Canva, OpenAI, and Anthropic',
      'Founded in Melbourne 2013 by Keith Pitt and Tim Lucas'
    ],
    quick_facts = '[
      {"label": "Founded",      "value": "2013",                          "icon": "Calendar"},
      {"label": "HQ",           "value": "Melbourne, Australia",          "icon": "MapPin"},
      {"label": "Series A",     "value": "$28M AUD (Aug 2020)",           "icon": "TrendingUp"},
      {"label": "Valuation",    "value": "$200M+ AUD",                    "icon": "DollarSign"},
      {"label": "Users",        "value": "60,000+",                       "icon": "Users"},
      {"label": "Investors",    "value": "OpenView, General Catalyst",    "icon": "Briefcase"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  -- ---------------------------------------------------------------------------
  -- 2. Replace sources (idempotent via DELETE + INSERT)
  -- ---------------------------------------------------------------------------
  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;

  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number)
  VALUES
    (v_case_study_id,
     'TechCrunch — Melbourne-based CI/CD platform Buildkite gets $28 million AUD Series A led by OpenView',
     'https://techcrunch.com/2020/08/18/melbourne-based-ci-cd-platform-buildkite-gets-28-million-aud-series-a-led-by-openview/',
     '2026-05-04', 'news', 1),
    (v_case_study_id,
     'Authority Magazine — Keith Pitt: 5 Things I Wish Someone Told Me Before I Became Co-Founder of Buildkite',
     'https://medium.com/authority-magazine/keith-pitt-5-things-i-wish-someone-told-me-before-i-became-the-ceo-of-buildkite-8f67f3a539e5',
     '2026-05-04', 'interview', 2),
    (v_case_study_id,
     'Startup Daily — Buildkite, "the best-kept secret in DevOps", raises $28 million for $200 million valuation',
     'https://www.startupdaily.net/topic/buildkite-the-best-kept-secret-in-devops-raises-28-million-for-200-million-valuation/',
     '2026-05-04', 'news', 3),
    (v_case_study_id,
     'Buildkite — About Company page',
     'https://buildkite.com/about/company/',
     '2026-05-04', 'company_blog', 4),
    (v_case_study_id,
     'General Catalyst — Buildkite portfolio entry',
     'https://www.generalcatalyst.com/portfolio/buildkite',
     '2026-05-04', 'company_blog', 5),
    (v_case_study_id,
     'Euphemia — Buildkite awesome stories',
     'https://euphemia.com/awesome-stories/buildkite/',
     '2026-05-04', 'interview', 6),
    (v_case_study_id,
     'Startup Playbook Ep127 — Lachlan Donald on equity over ego (YouTube)',
     'https://www.youtube.com/watch?v=4_QEE3UHS1U',
     '2026-05-04', 'podcast', 7),
    (v_case_study_id,
     'Apple Podcasts — Startup Playbook Ep127 with Lachlan Donald',
     'https://podcasts.apple.com/us/podcast/ep127-lachlan-donald-co-founder-ceo-buildkite-on-equity/id1135431502?i=1000489927740',
     '2026-05-04', 'podcast', 8),
    (v_case_study_id,
     'VentureBeat — Keith Pitt DataDecisionMakers author profile',
     'https://venturebeat.com/author/keith-pitt-buildkite/',
     '2026-05-04', 'interview', 9),
    (v_case_study_id,
     'The Org — Keith Pitt at Buildkite',
     'https://theorg.com/org/buildkite/org-chart/keith-pitt',
     '2026-05-04', 'linkedin', 10);

  -- ---------------------------------------------------------------------------
  -- 3. Replace quotes (idempotent via DELETE + INSERT)
  --
  -- display_order is global per case_study and ascending in render order.
  -- Quotes are grouped by section_id at render time (ContentBodyRenderer).
  -- ---------------------------------------------------------------------------
  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;

  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order)
  VALUES
    (v_case_study_id, v_section_entry_strategy,
     'All of the self-hosted options were incredibly outdated, given I was accustomed to using modern development workflows.',
     'Keith Pitt', 'Founder & former CEO',
     'https://medium.com/authority-magazine/keith-pitt-5-things-i-wish-someone-told-me-before-i-became-the-ceo-of-buildkite-8f67f3a539e5',
     'Authority Magazine',
     1),
    (v_case_study_id, v_section_entry_strategy,
     'My priority from day one as founder of Buildkite was to end this compromise.',
     'Keith Pitt', 'Founder & former CEO',
     'https://www.startupdaily.net/topic/buildkite-the-best-kept-secret-in-devops-raises-28-million-for-200-million-valuation/',
     'Startup Daily',
     2),
    (v_case_study_id, v_section_success_factors,
     'I never treated Buildkite as a startup, but rather as a business.',
     'Keith Pitt', 'Founder & former CEO',
     'https://medium.com/authority-magazine/keith-pitt-5-things-i-wish-someone-told-me-before-i-became-the-ceo-of-buildkite-8f67f3a539e5',
     'Authority Magazine',
     3),
    (v_case_study_id, v_section_success_factors,
     'We wanted to focus on sustainable growth and maintain control of our destiny.',
     'Lachlan Donald', 'Co-founder & CEO',
     'https://techcrunch.com/2020/08/18/melbourne-based-ci-cd-platform-buildkite-gets-28-million-aud-series-a-led-by-openview/',
     'TechCrunch',
     4),
    (v_case_study_id, v_section_key_metrics,
     'When CI/CD doesn''t work, it shows throughout the entire organisation – teams slow down, products are delayed and customers turn elsewhere.',
     'Lachlan Donald', 'Co-founder & CEO',
     'https://www.startupdaily.net/topic/buildkite-the-best-kept-secret-in-devops-raises-28-million-for-200-million-valuation/',
     'Startup Daily',
     5);
END $$;
