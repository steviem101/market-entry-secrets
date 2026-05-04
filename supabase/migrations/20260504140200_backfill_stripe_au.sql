-- Phase 5.3 Batch 2 (3/9): Stripe AU fintech expansion backfill
-- NON-STANDARD section slugs: market-strategy, regulatory-compliance, partnerships, results

DO $$
DECLARE
  v_case_study_id uuid;
  v_sec_strategy uuid; v_sec_reg uuid; v_sec_partners uuid; v_sec_results uuid;
BEGIN
  SELECT id INTO v_case_study_id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion';
  IF v_case_study_id IS NULL THEN RAISE EXCEPTION 'stripe-australia-fintech-expansion not found'; END IF;
  SELECT id INTO v_sec_strategy FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'market-strategy';
  SELECT id INTO v_sec_reg      FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'regulatory-compliance';
  SELECT id INTO v_sec_partners FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'partnerships';
  SELECT id INTO v_sec_results  FROM public.content_sections WHERE content_id = v_case_study_id AND slug = 'results';

  UPDATE public.content_items SET
    tldr = ARRAY['Stripe launched in Australia in 2014, now decade-strong','Karl Durrance leads as MD Australia and New Zealand','Top customers include Atlassian, Canva, Xero, me&u','Supports BPAY, PayID, Osko, BECS, PayTo locally','Surpassed 1M ANZ users; A$200B+ processed cumulatively'],
    quick_facts = '[{"label":"AU Launch Year","value":"2014","icon":"Calendar"},{"label":"AU Country Manager","value":"Karl Durrance","icon":"User"},{"label":"ANZ Users Milestone","value":"1,000,000+","icon":"Users"},{"label":"Cumulative AU Processing","value":"A$200B+","icon":"DollarSign"},{"label":"Featured AU Customers","value":"Atlassian, Canva, Xero, me&u","icon":"Building"},{"label":"Local Payment Methods","value":"BPAY, PayID, Osko, BECS, PayTo","icon":"Network"}]'::jsonb,
    last_verified_at = '2026-05-04T00:00:00Z'::timestamptz, researched_by = 'Stephen Browne', style_version = 2
  WHERE id = v_case_study_id;

  DELETE FROM public.case_study_sources WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_sources (case_study_id, label, url, accessed_at, source_type, citation_number) VALUES
    (v_case_study_id, 'Stripe Newsroom — Stripe to launch Capital in Australia as it passes 1 million users', 'https://stripe.com/newsroom/news/tour-sydney-2025', '2026-05-04', 'press_release', 1),
    (v_case_study_id, 'Stripe Newsroom — Stripe deepens product investment in Australia', 'https://stripe.com/newsroom/news/au-product-momentum', '2026-05-04', 'press_release', 2),
    (v_case_study_id, 'LinkedIn — Karl Durrance: Ten years ago, Stripe launched in Australia', 'https://www.linkedin.com/posts/karldurrance_ten-years-ago-stripe-launched-in-australia-activity-7221314310612926464-PPqn', '2026-05-04', 'linkedin', 3),
    (v_case_study_id, 'LinkedIn — Karl Durrance: What a day at Stripe Tour Sydney', 'https://www.linkedin.com/posts/karldurrance_what-a-day-at-stripe-tour-sydney-we-welcomed-activity-7372155702984798208-28tM', '2026-05-04', 'linkedin', 4),
    (v_case_study_id, 'SmartCompany — Stripe to launch quick lending for small businesses in Australia', 'https://www.smartcompany.com.au/finance/stripe-capital-quick-lending-small-businesses-australia/', '2026-05-04', 'news', 5),
    (v_case_study_id, 'Startup Daily — 10 takeouts from Stripe''s World Tour landing in Sydney', 'https://www.startupdaily.net/topic/fintech/10-takeouts-from-the-stripes-sydney-tour/', '2026-05-04', 'news', 6),
    (v_case_study_id, 'Financial IT — Stripe Capital to Launch in Australia', 'https://financialit.net/news/infrastructure/stripe-capital-launch-australia-stripe-celebrates-1-million-users-across', '2026-05-04', 'news', 7),
    (v_case_study_id, 'Stripe Resources — Payment Processing in Australia: Methods and Rules', 'https://stripe.com/resources/more/payment-processing-in-australia', '2026-05-04', 'company_blog', 8),
    (v_case_study_id, 'Stripe Resources — A guide to PayTo payments in Australia', 'https://stripe.com/resources/more/payto-an-in-depth-guide', '2026-05-04', 'company_blog', 9);

  DELETE FROM public.case_study_quotes WHERE case_study_id = v_case_study_id;
  INSERT INTO public.case_study_quotes (case_study_id, section_id, quote, attributed_to, role, source_url, source_label, display_order) VALUES
    (v_case_study_id, v_sec_strategy, 'Ten years ago, Stripe launched in Australia. Today, we are proud to power over half a million Aussie businesses.', 'Karl Durrance', 'Managing Director, Australia and New Zealand, Stripe', 'https://www.linkedin.com/posts/karldurrance_ten-years-ago-stripe-launched-in-australia-activity-7221314310612926464-PPqn', 'LinkedIn', 1),
    (v_case_study_id, v_sec_results, 'Australia is one of our fastest-growing markets in Asia Pacific, with over half a million businesses in the country building on Stripe.', 'Karl Durrance', 'Managing Director, Australia and New Zealand, Stripe', 'https://stripe.com/newsroom/news/au-product-momentum', 'Stripe Newsroom', 2),
    (v_case_study_id, v_sec_reg, 'SMBs are the backbone of the Australian economy, but the cost of doing business has risen sharply and around half report difficulty securing funding. Stripe Capital is designed to tackle their challenges head-on.', 'Karl Durrance', 'Managing Director, Australia and New Zealand, Stripe', 'https://www.smartcompany.com.au/finance/stripe-capital-quick-lending-small-businesses-australia/', 'SmartCompany', 3),
    (v_case_study_id, v_sec_partners, 'We''re proud to be pioneering mobile ordering and payments in Australia for thousands of businesses and have partnered with Stripe since day one.', 'Kim Teo', 'CEO, Mr Yum', 'https://stripe.com/newsroom/news/au-product-momentum', 'Stripe Newsroom', 4),
    (v_case_study_id, v_sec_partners, 'Our customers are at the heart of everything we do, and Stripe shares our commitment to customer-centricity.', 'Shay Hamama', 'Chief Product and Technology Officer, Lux Group', 'https://stripe.com/newsroom/news/au-product-momentum', 'Stripe Newsroom', 5);
END $$;
