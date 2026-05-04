-- =============================================================================
-- Phase 5.2 Pilot 3 of 3: Zoom AU — case study readability backfill
--
-- Populates new Tier B fields on content_items + structured rows in
-- case_study_sources and case_study_quotes for the Zoom pilot, AND scrubs
-- inline <p><em>Sources: ...</em></p> HTML blocks from content_bodies because
-- the structured case_study_sources table now replaces them.
--
-- Idempotent: re-running this migration produces identical state. The scrub
-- regex is non-greedy (.*?) and case-insensitive ('i' flag) and matches only
-- inline blocks containing "Sources:" inside <em>, so re-running has no effect
-- once the blocks are gone.
--
-- Hero image is intentionally left NULL pending a verifiable brand asset URL.
-- The HeroImage component renders nothing when url is null.
--
-- Source provenance: see .claude/staging/zoom-australia-market-entry.md
-- =============================================================================

DO $$
DECLARE
  v_case_study_id            uuid;
  v_section_entry_strategy   uuid;
  v_section_success_factors  uuid;
  v_section_key_metrics      uuid;
  v_scrub_count              int;
BEGIN
  SELECT id INTO v_case_study_id
  FROM public.content_items
  WHERE slug = 'zoom-australia-market-entry';

  IF v_case_study_id IS NULL THEN
    RAISE EXCEPTION 'zoom-australia-market-entry case study not found';
  END IF;

  SELECT id INTO v_section_entry_strategy  FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_section_success_factors FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_section_key_metrics     FROM public.content_sections
  WHERE content_id = v_case_study_id AND slug = 'key-metrics';

  -- ---------------------------------------------------------------------------
  -- 1. Update content_items with TL;DR, quick-facts, byline metadata
  --    (hero image deliberately left NULL pending brand asset)
  -- ---------------------------------------------------------------------------
  UPDATE public.content_items
  SET
    tldr = ARRAY[
      'Michael Chetner became Zoom''s first ANZ employee in April 2017',
      'AARNet partnership (since 2014) reached 60+ Australian institutions by end-2017',
      '134% revenue growth and 105% customer growth announced December 2017',
      'Australian customers: REA Group, SEEK, Movember, Western Sydney University',
      'Zoom Phone launched in Australia July 2019, Zoom Contact Center 2023'
    ],
    quick_facts = '[
      {"label": "ANZ Entry",            "value": "April 2017",          "icon": "Calendar"},
      {"label": "First Hire",           "value": "Michael Chetner",     "icon": "User"},
      {"label": "Channel Partner",      "value": "AARNet (since 2014)", "icon": "Network"},
      {"label": "ANZ Revenue Growth",   "value": "134% YoY (2017)",     "icon": "TrendingUp"},
      {"label": "ANZ Customer Growth",  "value": "105% YoY (2017)",     "icon": "Users"},
      {"label": "Origin",               "value": "San Jose, USA",       "icon": "MapPin"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by    = 'Stephen Browne',
    style_version    = 2
  WHERE id = v_case_study_id;

  -- ---------------------------------------------------------------------------
  -- 2. Scrub inline source-list HTML from content_bodies.
  --
  -- The current Zoom body_text fields contain ad-hoc inline source lists like
  --   <p class="text-sm text-muted-foreground mt-4"><em>Sources: ...</em></p>
  -- We replace these with empty strings because the structured
  -- case_study_sources table now provides the canonical citation list rendered
  -- by the SourcesSection component at the bottom of the page.
  --
  -- Pattern is permissive on class attribute and whitespace.
  -- ---------------------------------------------------------------------------
  WITH scrubbed AS (
    UPDATE public.content_bodies cb
    SET body_text = regexp_replace(
      cb.body_text,
      '<p[^>]*>\s*<em[^>]*>\s*Sources:.*?</em>\s*</p>',
      '',
      'gi'
    )
    FROM public.content_sections cs
    WHERE cb.section_id = cs.id
      AND cs.content_id = v_case_study_id
      AND cb.body_text ~* '<p[^>]*>\s*<em[^>]*>\s*Sources:'
    RETURNING cb.id
  )
  SELECT count(*) INTO v_scrub_count FROM scrubbed;

  RAISE NOTICE 'Zoom scrub: removed inline source blocks from % body rows', v_scrub_count;

  -- ---------------------------------------------------------------------------
  -- 3. Replace structured sources (idempotent via DELETE + INSERT)
  -- ---------------------------------------------------------------------------
  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;

  INSERT INTO public.case_study_sources
    (case_study_id, label, url, accessed_at, source_type, citation_number)
  VALUES
    (v_case_study_id, 'Zoom Blog — Zoom Announces 134% Revenue Growth in Australia and New Zealand', 'https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'ITBrief — Video communication service Zoom posts 134% revenue growth in ANZ', 'https://itbrief.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz', '2026-05-04', 'news', 2),
    (v_case_study_id, 'ChannelLife — Zoom posts 134% revenue growth in ANZ', 'https://channellife.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz', '2026-05-04', 'news', 3),
    (v_case_study_id, 'ChannelLife — Exclusive interview: Targeting the university sector with AARNet and Zoom', 'https://channellife.com.au/story/exclusive-interview-targeting-university-sector-aarnet-and-zoom', '2026-05-04', 'interview', 4),
    (v_case_study_id, 'AARNet — Transforming online collaboration for Australian universities', 'https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities', '2026-05-04', 'other', 5),
    (v_case_study_id, 'AARNet — Zoom Video Communications for Research & Education', 'https://www.aarnet.edu.au/zoom', '2026-05-04', 'other', 6),
    (v_case_study_id, 'Zoom Blog — Zoom To Reach Over 1 Million in Australia Via AARNet', 'https://blog.zoom.us/zoom-reaches-1-million-australia-via-aarnet/', '2026-05-04', 'press_release', 7),
    (v_case_study_id, 'ARN — Zoom A/NZ head Michael Chetner resigns', 'https://www.arnnet.com.au/article/705793/zoom-anz-head-michael-chetner-resigns/', '2026-05-04', 'news', 8),
    (v_case_study_id, 'The Org — Michael Chetner, Head of Australia and Asia Pacific at Zoom', 'https://theorg.com/org/zoom/org-chart/michael-chetner', '2026-05-04', 'linkedin', 9),
    (v_case_study_id, 'ITBrief — Zoom Virtual Agent launch promises big things for ANZ businesses', 'https://itbrief.com.au/story/zoom-virtual-agent-launch-promises-big-things-for-anz-businesses', '2026-05-04', 'news', 10),
    (v_case_study_id, 'Atlassian — Zoom surpasses growth goals with Atlassian cloud products case study', 'https://www.atlassian.com/customers/zoom', '2026-05-04', 'company_blog', 11);

  -- ---------------------------------------------------------------------------
  -- 4. Replace quotes (idempotent via DELETE + INSERT)
  --
  -- 6 quotes total: 3 from inside Zoom (Chetner ×2, Yuan ×1) plus 3 from
  -- AARNet university-customer voices that triangulate the channel-led
  -- market-entry narrative.
  -- ---------------------------------------------------------------------------
  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;

  INSERT INTO public.case_study_quotes
    (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order)
  VALUES
    (v_case_study_id, v_section_entry_strategy,
     'They''ve bundled the value up really nicely. If I was to compare their offering with any other service provider, it''s very easy to have the pipes but you need to have relevant applications.',
     'Michael Chetner', 'Head of A/NZ, Zoom',
     'https://channellife.com.au/story/exclusive-interview-targeting-university-sector-aarnet-and-zoom',
     'ChannelLife', 1),
    (v_case_study_id, v_section_success_factors,
     'In today''s hyper-connected world, Zoom has cut through the noise, answering the call for simplified communications.',
     'Michael Chetner', 'Head of A/NZ, Zoom',
     'https://channellife.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz',
     'ChannelLife', 2),
    (v_case_study_id, v_section_success_factors,
     'There has been an amazing turn-around on our functionality requests.',
     'Geoff Lambert', 'Western Sydney University',
     'https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities',
     'AARNet', 3),
    (v_case_study_id, v_section_success_factors,
     'Zoom bridges the gap between on-campus and off-campus students for tutorials.',
     'Troy Down', 'University of Southern Queensland',
     'https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities',
     'AARNet', 4),
    (v_case_study_id, v_section_success_factors,
     'The reliability and ease of the AARNet Zoom service increased the use of desktop and mobile video conferencing.',
     'Ben Loveridge', 'University of Melbourne',
     'https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities',
     'AARNet', 5),
    (v_case_study_id, v_section_key_metrics,
     'Zoom''s rapid expansion into the ANZ region has been fuelled by a demand for easy and secure meeting experiences.',
     'Eric S. Yuan', 'Founder & CEO, Zoom',
     'https://channellife.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz',
     'ChannelLife', 6);
END $$;
