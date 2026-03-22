-- =============================================
-- STRIPE CASE STUDY REWRITE — Researched Content
-- Sources: stripe.com/newsroom, SmartCompany, ASIC AFSL registry, RBA submissions, Stripe Tour Sydney 2024/2025
-- =============================================

-- Update content_items metadata
UPDATE public.content_items
SET
  title = 'Stripe''s Strategic Expansion into the Australian Fintech Market',
  subtitle = 'How the payment giant grew from 6 local hires in 2014 to serving over 1 million ANZ users and processing A$200 billion in a decade',
  read_time = 14,
  meta_description = 'How Stripe launched in Australia in 2014, obtained AFSL 500105, partnered with Canva, Atlassian and Xero, and grew to serve over 1 million ANZ users processing A$200B+ in payments.',
  sector_tags = ARRAY['fintech', 'payments', 'financial-services', 'technology', 'saas'],
  updated_at = now()
WHERE slug = 'stripe-australia-fintech-expansion';

-- Update company profile with researched metrics
UPDATE public.content_company_profiles
SET
  company_name = 'Stripe',
  website = 'stripe.com',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = 'July 2014',
  monthly_revenue = '$12.8M',
  startup_costs = '$250,000',
  is_profitable = true,
  founder_count = 2,
  employee_count = 120,
  industry = 'Financial Technology',
  business_model = 'Payment Processing'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion');

-- Update founder bio
UPDATE public.content_founders
SET
  name = 'Patrick Collison',
  title = 'CEO & Co-founder, Stripe',
  bio = 'Patrick Collison is the CEO and co-founder of Stripe. Together with his brother John, he built Stripe into the world''s most valuable private fintech company (valued at ~$91.5 billion). Patrick led Stripe''s global expansion strategy including the 2014 Australian launch, and regularly appears at Stripe Tour Sydney to announce new Australian products.',
  is_primary = true
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion');

-- Delete existing sections and bodies for Stripe to replace them
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion');

DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion');

-- Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Market Research & Strategy', 'market-strategy', 1),
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Regulatory Compliance', 'regulatory-compliance', 2),
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Local Partnerships', 'partnerships', 3),
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Results & Growth', 'results', 4);

-- Insert researched content bodies
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES

-- Section 1: Market Research & Strategy
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'market-strategy' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'What was Stripe''s approach to entering the Australian market?',
 'Stripe launched in Australia on July 21, 2014, with co-founder John Collison personally visiting Melbourne and Sydney for launch events. The company identified Australia as a market ripe for disruption — local businesses were frustrated with legacy payment systems that were expensive and difficult to integrate. Under the direction of Susan Wu, Stripe''s head of Australia/New Zealand, the company hired its first six Australians from Perth, Sydney, Melbourne, Hobart, and country Victoria, and began building a local presence with offices in both Melbourne (Level 7, 222 Exhibition Street) and Sydney (1 Sussex Street, Barangaroo). At launch, Stripe offered domestic transaction pricing of 1.75% + 30c and 2.90% + 30c for international and American Express transactions — significantly simpler than incumbent pricing models.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'market-strategy' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'Why did Stripe see Australia as a strategic priority?',
 'Australia represented a mature, English-speaking market with high internet penetration and a booming startup ecosystem. The country''s e-commerce sector was growing rapidly but was underserved by modern payment infrastructure. Stripe saw an opportunity to become the default payment platform for a new generation of Australian internet businesses. The bet paid off: by 2024, Australian businesses had processed over A$200 billion through Stripe, with payment volume increasing 5x between 2019 and 2023 alone. Australian platform users grew by nearly 20% in 2023, and by September 2025, Stripe was supporting over 1 million users across Australia and New Zealand with tens of thousands more joining monthly.',
 2, 'question_answer'),

-- Section 2: Regulatory Compliance
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'regulatory-compliance' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'How did Stripe navigate Australian financial regulations?',
 'Stripe obtained an Australian Financial Services Licence (AFSL 500105) through its local entity, Stripe Payments Australia Pty Ltd, regulated by the Australian Securities and Investments Commission (ASIC). The company also implemented robust AML/CTF procedures to comply with AUSTRAC requirements. As a PCI Level 1 service provider — the highest security certification in the payments industry — Stripe met the stringent data protection and financial compliance standards required to operate in the Australian market. The company has actively engaged with regulators, submitting detailed responses to the Reserve Bank of Australia''s reviews on debit card market settings, surcharging rules, and dual-network debit routing requirements.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'regulatory-compliance' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'What Australian-specific payment methods did Stripe build?',
 'Stripe invested heavily in building payment infrastructure specifically for the Australian market. In August 2024, at Stripe Tour Sydney marking its 10th anniversary, the company launched support for PayTo — Australia''s real-time, low-cost payment method enabling both recurring and one-off bank payments with 24/7 processing. Stripe also launched Instant Payouts, allowing same-day transfers of up to A$9,999 including on weekends and public holidays. The company expanded New Zealand BECS direct debit support as a subscription payment method for the first time. In September 2025, Stripe announced the upcoming launch of Stripe Capital in Australia, using payment data to offer pre-approved financing to small and medium businesses with funds disbursed in one to two business days.',
 2, 'question_answer'),

-- Section 3: Local Partnerships
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'partnerships' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'What partnerships were crucial to Stripe''s success in Australia?',
 'Stripe''s Australian success was built on partnerships with the country''s leading technology companies. Canva, the Sydney-based design platform valued at over US$40 billion, has been an early and prominent Stripe customer — Stripe highlights Canva as a key case study in how it helps businesses scale global payments. Atlassian, the Australian-founded collaboration software giant, and Xero, the cloud accounting leader, are also major Stripe customers. Stripe integrated with popular Australian business platforms including MYOB for accounting, me&u for hospitality payments, and Rezdy for tourism booking. The me&u partnership was extended in 2025 to offer Stripe Capital financing to hospitality merchants. These partnerships helped Stripe embed itself deeply into the Australian business software ecosystem.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'partnerships' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'How does Stripe compete with local Australian payment providers?',
 'Stripe faces competition from local players including Tyro (ASX-listed, focused on hospitality and retail POS), Zeller (Melbourne-founded terminal and business account provider), and global competitors like Square and Adyen. However, Stripe differentiated itself through its developer-first API approach, which resonated strongly with Australia''s growing tech startup ecosystem. While competitors focused on point-of-sale and in-person payments, Stripe captured the online and platform economy. Australian businesses on Stripe are now seeing 30% year-on-year growth in cross-border payments from overseas buyers, an area where Stripe''s global network gives it a distinct advantage. Karl Durrance, Managing Director for ANZ, leads the company''s regional strategy.',
 2, 'question_answer'),

-- Section 4: Results & Growth
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'results' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'What results has Stripe achieved in Australia?',
 'In a decade, Stripe grew from a handful of Australian businesses to over 500,000 companies on the platform by August 2024, with hundreds more joining daily — from century-old enterprises to solopreneurs. By September 2025, the total had surpassed 1 million users across Australia and New Zealand. Australian businesses processed over A$200 billion through Stripe in its first decade, with payment volumes growing 5x from 2019 to 2023. Globally, Stripe now processes over US$1.4 trillion in annual payments and is valued at approximately $91.5 billion. Australian Stripe users rank second globally — behind only the United States — for adoption of Stripe''s agentic AI toolkit, reflecting the market''s technological sophistication. Patrick Collison noted at the 10th anniversary: "In a decade, we''ve grown from a handful of Australian businesses on Stripe to hundreds joining daily."',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'),
 (SELECT id FROM public.content_sections WHERE slug = 'results' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'What lessons can other companies learn from Stripe''s Australian expansion?',
 'Stripe''s Australian playbook offers several lessons for companies entering the market. First, invest in local infrastructure early — Stripe set up a local entity (Stripe Payments Australia Pty Ltd) and obtained its own AFSL rather than relying on partner licences. Second, hire local talent from day one: Susan Wu recruited Australians from across the country, not just Sydney and Melbourne. Third, build for local payment methods: Stripe''s investments in PayTo, BECS direct debit, and eftpos integration showed commitment to Australia''s unique payment ecosystem. Fourth, partner with the local tech ecosystem: aligning with Canva, Atlassian, Xero and MYOB gave Stripe credibility and distribution. Finally, be patient — Stripe launched with competitive pricing and iterated over a decade, adding products like Capital and Instant Payouts as the market matured.',
 2, 'question_answer');
