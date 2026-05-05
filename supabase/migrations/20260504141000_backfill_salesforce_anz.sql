-- Phase 5.3 Batch 2 (7/11): Salesforce ANZ market entry backfill

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_entry uuid; v_sec_success uuid; v_sec_metrics uuid; v_sec_lessons uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'salesforce-australia-market-entry not found'; END IF;
  SELECT id INTO v_sec_entry   FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'entry-strategy';
  SELECT id INTO v_sec_success FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'success-factors';
  SELECT id INTO v_sec_metrics FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'key-metrics';
  SELECT id INTO v_sec_lessons FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'lessons-learned';

  UPDATE public.content_items SET
    tldr = ARRAY[
      'Salesforce entered Australia in 2004 post-IPO; first office in Sydney',
      'Salesforce Tower Sydney (180 George St, 53 floors) opened late 2022 as ANZ HQ',
      'Pip Marlow inaugural ANZ CEO (Oct 2019 - Aug 2023); Frank Fillmann now EVP & GM',
      'Auckland office opened March 2024, marking 18 years operating in NZ',
      'Feb 2025: Salesforce committed AU$2.5B over 5 years to AI, workforce, sustainability'
    ],
    quick_facts = '[
      {"label":"ANZ Entry Year","value":"2004 (Sydney office post-IPO)","icon":"Calendar"},
      {"label":"AU HQ","value":"Salesforce Tower Sydney, 180 George St","icon":"MapPin"},
      {"label":"ANZ Leader","value":"Frank Fillmann, EVP & GM ANZ","icon":"User"},
      {"label":"Major AU Customers","value":"Telstra, NAB, ANZ Bank, Fisher & Paykel","icon":"Building"},
      {"label":"AU Investment","value":"A$2.5B committed over 5 years (Feb 2025)","icon":"DollarSign"},
      {"label":"Origin","value":"San Francisco, USA","icon":"Globe2"}
    ]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz,
    researched_by = 'Stephen Browne',
    style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Salesforce Press Release — Salesforce Tower Sydney announcement', 'https://www.salesforce.com/news/press-releases/2019/10/01/salesforce-announces-salesforce-tower-sydney-commits-to-adding-1000-new-local-jobs/', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'Salesforce Press Release — A$2.5B AU investment over 5 years', 'https://www.salesforce.com/au/news/press-releases/2025/02/26/salesforce-australia-investment-2025/', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'Salesforce Newsroom — Auckland office opening', 'https://www.salesforce.com/news/stories/salesforce-auckland-office/', '2026-05-04', 'press_release', 3),
    (v_case_study_id, 'Salesforce ANZ Blog — Agentforce World Tour Sydney', 'https://www.salesforce.com/au/blog/agentforce-world-tour-sydney-what-if-your-workforce-had-no-limits/', '2026-05-04', 'company_blog', 4),
    (v_case_study_id, 'Salesforce Customer Story — Telstra transformation', 'https://www.salesforce.com/au/customer-stories/telstra/', '2026-05-04', 'company_blog', 5),
    (v_case_study_id, 'iTnews — Salesforce ANZ CEO Pip Marlow to leave', 'https://www.itnews.com.au/news/salesforce-anz-ceo-pip-marlow-to-leave-598755', '2026-05-04', 'news', 6),
    (v_case_study_id, 'iTnews — How NAB is transforming the world''s most complex Salesforce structure', 'https://www.itnews.com.au/news/how-nab-is-transforming-the-worlds-most-complex-salesforce-structure-520421', '2026-05-04', 'news', 7),
    (v_case_study_id, 'ANZ Bank Newsroom — Agentic AI-powered CRM launch', 'https://www.anz.com.au/newsroom/media/2026/february/anz-launches-agentic-ai-powered-crm-to-transform-business-banking/', '2026-05-04', 'press_release', 8),
    (v_case_study_id, 'Foster + Partners — Salesforce Tower Sydney project page', 'https://www.fosterandpartners.com/projects/salesforce-tower-sydney/', '2026-05-04', 'other', 9),
    (v_case_study_id, 'Salesforce ANZ Blog — IDC Salesforce Economy study (104,400 AU jobs by 2026)', 'https://www.salesforce.com/au/blog/salesforce-economy-set-to-generate-1-6t-usd-in-new-revenue-and-over-9m-new-jobs-by-2026-study-reveals/', '2026-05-04', 'other', 10);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_entry, 'Salesforce Tower Sydney is taking that commitment to a new level and will allow us to have an even greater impact on our people, our customers, and most importantly our community.', 'Pip Marlow', 'CEO Salesforce Australia and New Zealand (2019-2023)', 'https://www.salesforce.com/news/press-releases/2019/10/01/salesforce-announces-salesforce-tower-sydney-commits-to-adding-1000-new-local-jobs/', 'Salesforce Press Release', 1),
    (v_case_study_id, v_sec_entry, 'When we say that every company must become an Agentforce company, what do we mean? Your customers demand it. Your employees deserve it.', 'Frank Fillmann', 'EVP & General Manager, Salesforce Australia and New Zealand', 'https://www.salesforce.com/au/blog/agentforce-world-tour-sydney-what-if-your-workforce-had-no-limits/', 'Salesforce ANZ Blog', 2),
    (v_case_study_id, v_sec_success, 'Salesforce has really enabled us to put the customer first in everything that we do.', 'Michael Ackland', 'Group Executive Consumer & Small Business, Telstra', 'https://www.salesforce.com/au/customer-stories/telstra/', 'Salesforce Customer Story', 3),
    (v_case_study_id, v_sec_metrics, 'For the first time, we have everybody collaborating on the same platform for the benefit of our customers.', 'Mirko Gropp', 'Digital Adoption Principal, Telstra Enterprise', 'https://www.salesforce.com/au/customer-stories/telstra/', 'Salesforce Customer Story', 4),
    (v_case_study_id, v_sec_metrics, 'Our new platform is a game changer — simplifying systems, saving time, and helping bankers focus on what matters most: building strong relationships and helping customers run and grow their businesses.', 'Clare Morgan', 'Group Executive Business & Private Bank, ANZ', 'https://www.anz.com.au/newsroom/media/2026/february/anz-launches-agentic-ai-powered-crm-to-transform-business-banking/', 'ANZ Bank Newsroom', 5),
    (v_case_study_id, v_sec_lessons, 'We in fact have the most complex Salesforce structure in the world, and it''s folklore.', 'Dan McCoy', 'Podium Digital Product Manager, NAB', 'https://www.itnews.com.au/news/how-nab-is-transforming-the-worlds-most-complex-salesforce-structure-520421', 'iTnews', 6);
END $$;
