-- =============================================================================
-- Phase 5.2 Pilot 2 of 3: Go1 — case study readability backfill
--
-- Populates new Tier B fields on content_items + structured rows in
-- case_study_sources and case_study_quotes for the Go1 pilot.
--
-- Idempotent: re-running this migration produces identical state.
--
-- Source provenance: see .claude/staging/go1-australia-startup.md
-- =============================================================================

DO $$
DECLARE
  v_case_study_id            uuid;
  v_section_entry_strategy   uuid;
  v_section_success_factors  uuid;
  v_section_key_metrics      uuid;
  v_section_challenges_faced uuid;
BEGIN
  SELECT id INTO v_case_study_id
  FROM public.content_items
  WHERE slug = 'go1-australia-startup';

  IF v_case_study_id IS NULL THEN
    RETURN;
  END IF;

  SELECT id INTO v_section_entry_strategy   FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_section_success_factors  FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_section_key_metrics      FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_section_challenges_faced FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'challenges-faced';

  -- ---------------------------------------------------------------------------
  -- 1. Update content_items with hero, TL;DR, quick-facts, byline metadata
  -- ---------------------------------------------------------------------------
  UPDATE public.content_items
  SET
    hero_image_url    = 'https://www.griffith.edu.au/__data/assets/image/0031/2237674/Chris-Eigeland.jpg',
    hero_image_alt    = 'Chris Eigeland, CEO and co-founder of Go1',
    hero_image_credit = 'Griffith University',
    tldr = ARRAY[
      'Four childhood friends reunited via Y Combinator 2015 to launch Go1',
      'Brisbane''s first unicorn at $2B valuation, now reaching $3B',
      '50M users across 10,000+ organisations consume 250+ providers',
      'Acquired Coorpacademy (April 2022) and Blinkist (May 2023)',
      'Sole CEO Chris Eigeland since August 2024 after Andrew Barnes'' transition'
    ],
    quick_facts = '[
      {"label": "Founded",       "value": "2015 (Logan, QLD)",        "icon": "Calendar"},
      {"label": "HQ",            "value": "Brisbane, Australia",      "icon": "MapPin"},
      {"label": "Total Funding", "value": "~$414M USD",               "icon": "DollarSign"},
      {"label": "Valuation",     "value": "$2–3B USD",                "icon": "TrendingUp"},
      {"label": "Users",         "value": "50M registered",           "icon": "Users"},
      {"label": "Team",          "value": "~600 across 19 countries", "icon": "Globe2"}
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
     'Contrary Research — Go1 Business Breakdown & Founding Story',
     'https://research.contrary.com/company/go1',
     '2026-05-04', 'other', 1),
    (v_case_study_id,
     'Startup Daily — Go1 cofounder exits CEO role after 10 years, handing reins to Chris Eigeland',
     'https://www.startupdaily.net/topic/people/go1-cofounder-exits-ceo-role-after-10-years-handing-reins-to-chris-eigeland/',
     '2026-05-04', 'news', 2),
    (v_case_study_id,
     'Crunchbase — Chris Eigeland person profile',
     'https://www.crunchbase.com/person/chris-eigeland',
     '2026-05-04', 'other', 3),
    (v_case_study_id,
     'Go1 Podcast Ep9 — Chris Eigeland on the role of L&D',
     'https://www.go1.com/podcast/ep9-chris-eigeland',
     '2026-05-04', 'podcast', 4),
    (v_case_study_id,
     'Startup Grind Brisbane — Chris Eigeland event page',
     'https://www.startupgrind.com/events/details/startup-grind-brisbane-presents-chris-eigeland-go1/',
     '2026-05-04', 'interview', 5),
    (v_case_study_id,
     'AICC NSW — Boardroom Lunch with Chris Eigeland, Co-Founder of Go1',
     'https://aiccnsw.org.au/boardroom-lunch-with-chris-eigeland-co-founder-go1-brisbane/',
     '2026-05-04', 'interview', 6),
    (v_case_study_id,
     'AICC QLD — Boardroom Lunch with Chris Eigeland, Co-Founder of Go1',
     'https://aiccqld.org.au/2026/03/05/boardroom-lunch-with-chris-eigeland-co-founder-go1-brisbane/',
     '2026-05-04', 'interview', 7),
    (v_case_study_id,
     'EdTechX 2022 Stories — Chris Eigeland',
     'https://impactx2050.com/edtechx-stories-chris-eigeland',
     '2026-05-04', 'interview', 8),
    (v_case_study_id,
     'Anthill — Chris Eigeland 2016 30 Under 30 winner',
     'https://anthillonline.com/chris-eigeland-2016-anthill-30under30-winner/',
     '2026-05-04', 'news', 9),
    (v_case_study_id,
     'Advance Queensland — Igniting Innovation: Go1''s journey from Logan to Brisbane''s first unicorn',
     'https://advance.qld.gov.au/innovation-in-queensland/innovation-stories/igniting-innovation-the-go1-journey-from-logan-startup-to-brisbanes-first-unicorn',
     '2026-05-04', 'government', 10);

  -- ---------------------------------------------------------------------------
  -- 3. Replace quotes (idempotent via DELETE + INSERT)
  -- ---------------------------------------------------------------------------
  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;

  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order)
  VALUES
    (v_case_study_id, v_section_entry_strategy,
     'We''ve been incredibly lucky that our skillsets have been complementary, helping Go1 get to where it is today.',
     'Andrew Barnes', 'Co-founder & former Co-CEO',
     'https://www.startupdaily.net/topic/people/go1-cofounder-exits-ceo-role-after-10-years-handing-reins-to-chris-eigeland/',
     'Startup Daily',
     1),
    (v_case_study_id, v_section_success_factors,
     'If we do something in consumer, we would want to make that a target. It would be quite a different product.',
     'Andrew Barnes', 'Co-founder & former Co-CEO',
     'https://research.contrary.com/company/go1',
     'Contrary Research',
     2),
    (v_case_study_id, v_section_key_metrics,
     'We''re building and running the business at an increasing level of maturity around governance and all the standards that are required to become IPO ready.',
     'Chris Eigeland', 'CEO & Co-Founder',
     'https://research.contrary.com/company/go1',
     'Contrary Research',
     3),
    (v_case_study_id, v_section_challenges_faced,
     'By having a single CEO, we will be able to move faster on the day-to-day decisions.',
     'Andrew Barnes', 'Co-founder & former Co-CEO',
     'https://www.startupdaily.net/topic/people/go1-cofounder-exits-ceo-role-after-10-years-handing-reins-to-chris-eigeland/',
     'Startup Daily',
     4);
END $$;
