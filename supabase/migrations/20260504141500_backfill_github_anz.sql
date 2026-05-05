-- Phase 5.3 Batch 2 (8/11): GitHub ANZ market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'github-australia-market-entry';
  IF v_case_study_id IS NULL THEN RETURN; END IF;
  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY[
      'Sydney regional hub launched March 2017 under APAC director Sam Hunt',
      'GitHub Enterprise Cloud data residency in Australia went GA on 5 February 2025',
      'ANZ Bank deployed GitHub Copilot to 3,000 engineers; trial showed 42.36% faster task completion',
      'Anthony Borton (Brisbane) leads APAC East Field Services post-Microsoft consolidation',
      'AU customers include ANZ Bank, CBA, REA Group, Telstra Purple, Xero and DTA (govau)'
    ],
    quick_facts = '[
      {"label":"ANZ Hub Launch","value":"March 2017 (Sydney)","icon":"Calendar"},
      {"label":"AU HQ","value":"Sydney NSW (co-located with Microsoft)","icon":"MapPin"},
      {"label":"APAC East Director","value":"Anthony Borton (Brisbane)","icon":"User"},
      {"label":"AU Customers","value":"ANZ, CBA, REA Group, Telstra Purple, Xero, DTA","icon":"Building"},
      {"label":"Data Residency GA","value":"5 February 2025 (Azure-hosted in AU)","icon":"Globe2"},
      {"label":"ANZ Bank Copilot","value":"3,000 engineers, 42.36% faster","icon":"TrendingUp"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by = 'Stephen Browne',
    style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'GitHub Newsroom — Data Residency to Australia (5 Feb 2025)', 'https://github.com/newsroom/press-releases/data-residency-in-australia', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'GitHub Changelog — Enterprise Cloud Data Residency in Australia GA', 'https://github.blog/changelog/2025-02-04-github-enterprise-cloud-data-residency-in-australia-is-generally-available/', '2026-05-04', 'company_blog', 2),
    (v_case_study_id, 'iTnews — ANZ targets 3000 engineers to use GitHub Copilot', 'https://www.itnews.com.au/news/anz-targets-3000-engineers-to-use-github-copilot-601195', '2026-05-04', 'news', 3),
    (v_case_study_id, 'The Register — ANZ Bank finds GitHub Copilot makes coders more productive', 'https://www.theregister.com/2024/02/10/anz_bank_github_copilot/', '2026-05-04', 'news', 4),
    (v_case_study_id, 'arXiv — Impact of AI Tool on Engineering at ANZ Bank: Empirical Study on GitHub Copilot', 'https://arxiv.org/abs/2402.05636', '2026-05-04', 'academic', 5),
    (v_case_study_id, 'ITBrief AU — Australia 13th largest user of open source in the world', 'https://itbrief.com.au/story/australia-13th-largest-user-of-open-source-in-the-world', '2026-05-04', 'news', 6),
    (v_case_study_id, 'GitHub Customer Stories — REA Group', 'https://github.com/customer-stories/rea-group', '2026-05-04', 'company_blog', 7),
    (v_case_study_id, 'Digital Transformation Agency on GitHub (govau)', 'https://github.com/govau', '2026-05-04', 'government', 8),
    (v_case_study_id, 'University of Sydney — First AU university to offer GitHub Enterprise', 'https://www.sydney.edu.au/news-opinion/news/2017/10/20/first-university-in-australia-to-offer-code-development-software.html', '2026-05-04', 'press_release', 9),
    (v_case_study_id, 'Microsoft Reactor — GitHub Universe ''25 Recap, Sydney (Anthony Borton)', 'https://developer.microsoft.com/en-us/reactor/events/21150/', '2026-05-04', 'company_blog', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, 'Data residency is a vital strand to the DNA of digital transformation – creating a localised pathway for organisations in highly regulated industries to store their code in region and move to the cloud.', 'Thomas Dohmke', 'CEO, GitHub', 'https://github.com/newsroom/press-releases/data-residency-in-australia', 'GitHub Newsroom', 1),
    (v_case_study_id, v_sec_entry, 'We''re seeing an exponential uptake and constant growth of open source projects across ANZ organisations, which shows the level of developer contribution and open source demand in our local market.', 'Sam Hunt', 'VP APAC, GitHub (2017-2022)', 'https://itbrief.com.au/story/australia-13th-largest-user-of-open-source-in-the-world', 'ITBrief AU', 2),
    (v_case_study_id, v_sec_success, 'We got a large pool of engineers and we basically cut them into two halves and gave them a bunch of artificial programming problems, with and without using GitHub Copilot.', 'Tim Hogarth', 'Chief Technology Officer, ANZ Bank', 'https://www.itnews.com.au/news/anz-targets-3000-engineers-to-use-github-copilot-601195', 'iTnews', 3),
    (v_case_study_id, v_sec_metrics, 'So, instead of spending six minutes on a task, you can probably spend as little as 60 seconds.', 'Tim Hogarth', 'Chief Technology Officer, ANZ Bank', 'https://www.itnews.com.au/news/anz-targets-3000-engineers-to-use-github-copilot-601195', 'iTnews', 4),
    (v_case_study_id, v_sec_success, 'We needed a version control system that could scale and help us work as small, autonomous teams — GitHub is great for that.', 'Mike Rowe', 'Tech Lead, REA Group', 'https://github.com/customer-stories/rea-group', 'GitHub Customer Stories', 5),
    (v_case_study_id, v_sec_lessons, 'We''ve changed the way we work both technically and organizationally. It would have been much harder to do without GitHub.', 'Mike Rowe', 'Tech Lead, REA Group', 'https://github.com/customer-stories/rea-group', 'GitHub Customer Stories', 6);
END $$;
