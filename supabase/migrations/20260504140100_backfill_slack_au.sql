-- Phase 5.3 Batch 2 (2/9): Slack AU market entry backfill
-- NON-STANDARD section slugs: company, market-research, entry-strategy, partnerships

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_company uuid; v_sec_market uuid; v_sec_entry uuid; v_sec_partners uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'slack-australian-market-entry';
  IF v_case_study_id IS NULL THEN RETURN; END IF;
  SELECT id INTO v_sec_company  FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'company';
  SELECT id INTO v_sec_market   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'market-research';
  SELECT id INTO v_sec_entry    FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_partners FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'partnerships';

  UPDATE public.content_items SET
    tldr = ARRAY['Opened Melbourne APAC HQ on 31 March 2016','Stewart Butterfield chose Melbourne over Sydney, Singapore','Matt Loop appointed Head of APAC March 2020','Sydney data region launched 2020 for ANZ enterprise','Salesforce acquired Slack July 2021 for $27.7B'],
    quick_facts = '[{"label":"AU Entry Year","value":"2016 (Melbourne APAC HQ)","icon":"Calendar"},{"label":"APAC HQ City","value":"Melbourne (Carlton Brewery)","icon":"MapPin"},{"label":"APAC Lead","value":"Matt Loop, Head of Asia Pacific","icon":"User"},{"label":"Named AU Customers","value":"Telstra, REA, SEEK, AFL, RMIT","icon":"Building"},{"label":"Acquisition","value":"Salesforce, $27.7B (Jul 2021)","icon":"DollarSign"},{"label":"Origin","value":"Vancouver/San Francisco","icon":"Globe2"}]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz, researched_by = 'Stephen Browne', style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Slack Blog — Slack''s Growth in Asia', 'https://slack.com/blog/news/slacks-growth-in-asia', '2026-05-04', 'company_blog', 1),
    (v_case_study_id, 'Slack Blog — Supporting Business Resiliency in Australia and Asia Pacific', 'https://slack.com/intl/en-au/blog/news/supporting-business-resiliency-in-australia-and-asia-pacific', '2026-05-04', 'company_blog', 2),
    (v_case_study_id, 'Slack Blog — Salesforce Completes Acquisition of Slack', 'https://slack.com/blog/news/salesforce-completes-acquisition-of-slack', '2026-05-04', 'company_blog', 3),
    (v_case_study_id, 'Slack Customer Stories — Canva Scale Global Design Platform', 'https://slack.com/customer-stories/canva-scale-global-design-platform', '2026-05-04', 'company_blog', 4),
    (v_case_study_id, 'SmartCompany — Slack opens Asia-Pacific HQ in Melbourne', 'https://www.smartcompany.com.au/startupsmart/advice/startupsmart-growth/slack-opens-asia-pacific-hq-in-melbourne-in-an-important-milestone-for-the-3-billion-startup/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Technology Decisions — Slack establishes APAC HQ in Melbourne', 'https://www.technologydecisions.com.au/content/convergence/article/slack-establishes-apac-headquarters-in-melbourne-223491771', '2026-05-04', 'news', 6),
    (v_case_study_id, 'Premier of Victoria — Global Tech Leader Sets APAC HQ in Melbourne', 'https://www.premier.vic.gov.au/global-tech-leader-sets-asia-pacific-hq-melbourne', '2026-05-04', 'government', 7),
    (v_case_study_id, 'ITBrief NZ — Slack hires new head of APAC', 'https://itbrief.co.nz/story/slack-hires-new-head-of-apac-as-remote-working-business-booms', '2026-05-04', 'news', 8),
    (v_case_study_id, 'ArchDaily — Slack Asia Pacific Headquarters / Breathe Architecture', 'https://www.archdaily.com/921285/slack-asia-pacific-headquarters-breathe-architecture', '2026-05-04', 'other', 9),
    (v_case_study_id, 'Salesforce Press — Salesforce Completes Acquisition of Slack', 'https://www.salesforce.com/news/press-releases/2021/07/21/salesforce-slack-deal-close/', '2026-05-04', 'press_release', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_company, 'Opening an office in Australia marks an important milestone in Slack''s growth and will allow us to better serve our customers all around the world.', 'Stewart Butterfield', 'CEO and Co-Founder, Slack', 'https://www.premier.vic.gov.au/global-tech-leader-sets-asia-pacific-hq-melbourne', 'Premier of Victoria', 1),
    (v_case_study_id, v_sec_market, 'We chose Melbourne because the temperament, diversity and creativity makes us feel very much at home.', 'Stewart Butterfield', 'CEO and Co-Founder, Slack', 'https://www.smartcompany.com.au/startupsmart/advice/startupsmart-growth/slack-opens-asia-pacific-hq-in-melbourne-in-an-important-milestone-for-the-3-billion-startup/', 'SmartCompany', 2),
    (v_case_study_id, v_sec_entry, 'We''re making a big investment here in Australia to grow our Slack team, but more importantly to help teams of all sizes be happier and more productive.', 'Stewart Butterfield', 'CEO and Co-Founder, Slack', 'https://www.technologydecisions.com.au/content/convergence/article/slack-establishes-apac-headquarters-in-melbourne-223491771', 'Technology Decisions', 3),
    (v_case_study_id, v_sec_partners, 'We couldn''t be more excited to have Slack as part of the Salesforce family, combining the #1 CRM and the trailblazing digital platform for the work anywhere world.', 'Marc Benioff', 'Chair and CEO, Salesforce', 'https://slack.com/blog/news/salesforce-completes-acquisition-of-slack', 'Slack Blog', 4),
    (v_case_study_id, v_sec_partners, 'Canva is all about collaboration and empowering teams. And I think it''s natural to us that we would also steer toward a communication tool like Slack that facilitates teamwork.', 'Liz McKenzie', 'Global Head of PR and Communications, Canva', 'https://slack.com/customer-stories/canva-scale-global-design-platform', 'Slack Customer Stories', 5);
END $$;
