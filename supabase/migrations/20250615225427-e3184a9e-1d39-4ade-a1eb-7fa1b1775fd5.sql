
-- Insert additional content categories for better organization
INSERT INTO public.content_categories (name, description, icon, color, sort_order) VALUES
('Fintech Success', 'Financial technology companies that conquered Australia', 'TrendingUp', 'text-emerald-600', 7),
('E-commerce Giants', 'Online retail success stories in the Australian market', 'TrendingUp', 'text-blue-600', 8),
('Healthcare Innovation', 'Medical and health tech companies in Australia', 'TrendingUp', 'text-red-600', 9);

-- Insert Stripe success story
INSERT INTO public.content_items (slug, title, subtitle, category_id, content_type, featured, read_time, meta_description, sector_tags) 
VALUES (
  'stripe-australia-fintech-expansion',
  'Stripe''s Strategic Expansion into the Australian Fintech Market',
  'How the payment giant built trust with Australian businesses and navigated complex financial regulations',
  (SELECT id FROM public.content_categories WHERE name = 'Fintech Success'),
  'success_story',
  true,
  12,
  'Learn how Stripe successfully entered Australia by partnering with local banks and adapting to unique payment preferences.',
  ARRAY['fintech', 'payments', 'financial-services', 'technology']
);

-- Insert Airbnb success story
INSERT INTO public.content_items (slug, title, subtitle, category_id, content_type, featured, read_time, meta_description, sector_tags) 
VALUES (
  'airbnb-australia-market-entry',
  'Airbnb''s Journey to Becoming Australia''s Leading Short-Term Rental Platform',
  'From regulatory challenges to cultural adaptation - how Airbnb won over Australian hosts and travelers',
  (SELECT id FROM public.content_categories WHERE name = 'Success Stories'),
  'success_story',
  true,
  10,
  'Discover how Airbnb navigated Australian regulations and built a thriving marketplace Down Under.',
  ARRAY['sharing-economy', 'travel', 'technology', 'marketplace']
);

-- Insert Canva success story (Australian company expanding within Australia)
INSERT INTO public.content_items (slug, title, subtitle, category_id, content_type, featured, read_time, meta_description, sector_tags) 
VALUES (
  'canva-australian-design-dominance',
  'How Canva Became Australia''s Design Unicorn and Global Success Story',
  'The inside story of how an Australian startup grew to dominate the global design market',
  (SELECT id FROM public.content_categories WHERE name = 'Success Stories'),
  'success_story',
  false,
  8,
  'See how Canva leveraged Australian talent and innovation to become a global design platform leader.',
  ARRAY['design', 'saas', 'technology', 'startup']
);

-- Insert Afterpay success story
INSERT INTO public.content_items (slug, title, subtitle, category_id, content_type, featured, read_time, meta_description, sector_tags) 
VALUES (
  'afterpay-buy-now-pay-later-revolution',
  'Afterpay''s Revolutionary Approach to Australian Consumer Finance',
  'How a simple "buy now, pay later" concept transformed Australian retail forever',
  (SELECT id FROM public.content_categories WHERE name = 'Fintech Success'),
  'success_story',
  false,
  9,
  'Learn how Afterpay created an entirely new category in Australian fintech and changed shopping habits.',
  ARRAY['fintech', 'retail', 'payments', 'consumer-finance']
);

-- Insert Netflix success story
INSERT INTO public.content_items (slug, title, subtitle, category_id, content_type, featured, read_time, meta_description, sector_tags) 
VALUES (
  'netflix-streaming-australia-launch',
  'Netflix''s Strategic Launch in the Australian Streaming Market',
  'Competing with established players and creating a content strategy for Australian audiences',
  (SELECT id FROM public.content_categories WHERE name = 'Success Stories'),
  'success_story',
  false,
  11,
  'Discover how Netflix entered Australia''s competitive streaming market and built a loyal subscriber base.',
  ARRAY['media', 'streaming', 'entertainment', 'subscription']
);

-- Insert company profiles for each story
INSERT INTO public.content_company_profiles (content_id, company_name, website, origin_country, target_market, entry_date, monthly_revenue, startup_costs, is_profitable, founder_count, employee_count, industry, business_model)
VALUES 
-- Stripe
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Stripe', 'stripe.com', 'United States', 'Australia', 'June 2019', '$12.8M', '$250,000', true, 2, 120, 'Financial Technology', 'Payment Processing'),
-- Airbnb
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Airbnb', 'airbnb.com.au', 'United States', 'Australia', 'July 2012', '$45.2M', '$180,000', true, 3, 250, 'Travel & Hospitality', 'Marketplace Platform'),
-- Canva
((SELECT id FROM public.content_items WHERE slug = 'canva-australian-design-dominance'), 'Canva', 'canva.com', 'Australia', 'Global', 'August 2013', '$85.7M', '$3,000', true, 3, 4000, 'Design Technology', 'SaaS Subscription'),
-- Afterpay
((SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution'), 'Afterpay', 'afterpay.com', 'Australia', 'Australia & Global', 'March 2015', '$78.4M', '$50,000', true, 2, 1200, 'Financial Technology', 'Buy Now Pay Later'),
-- Netflix
((SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch'), 'Netflix', 'netflix.com.au', 'United States', 'Australia', 'March 2015', '$167.3M', '$500,000', true, 2, 450, 'Media & Entertainment', 'Subscription Streaming');

-- Insert primary founders for each company
INSERT INTO public.content_founders (content_id, name, title, bio, is_primary)
VALUES 
-- Stripe - Patrick Collison
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Patrick Collison', 'CEO & Co-founder, Stripe', 'Patrick Collison is the CEO and co-founder of Stripe, leading the company''s global expansion including the successful Australian market entry.', true),
-- Airbnb - Brian Chesky
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Brian Chesky', 'CEO & Co-founder, Airbnb', 'Brian Chesky co-founded Airbnb and led its international expansion, including the challenging but successful entry into the Australian market.', true),
-- Canva - Melanie Perkins
((SELECT id FROM public.content_items WHERE slug = 'canva-australian-design-dominance'), 'Melanie Perkins', 'CEO & Co-founder, Canva', 'Melanie Perkins founded Canva in Australia with a vision to democratize design, building one of Australia''s most successful tech companies.', true),
-- Afterpay - Nick Molnar
((SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution'), 'Nick Molnar', 'Co-founder & CEO, Afterpay', 'Nick Molnar co-founded Afterpay and revolutionized the Australian retail payments landscape with the buy now, pay later model.', true),
-- Netflix - Reed Hastings
((SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch'), 'Reed Hastings', 'CEO & Co-founder, Netflix', 'Reed Hastings led Netflix''s global expansion strategy, including the competitive launch into the Australian streaming market.', true);

-- Insert content sections for Stripe story
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Market Research & Strategy', 'market-strategy', 1),
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Regulatory Compliance', 'regulatory-compliance', 2),
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Local Partnerships', 'partnerships', 3),
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 'Results & Growth', 'results', 4);

-- Insert content sections for Airbnb story
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Initial Market Assessment', 'market-assessment', 1),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Regulatory Challenges', 'regulatory-challenges', 2),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Community Building', 'community-building', 3),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Marketing Strategy', 'marketing-strategy', 4);

-- Insert content bodies for Stripe story
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES
((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 
 (SELECT id FROM public.content_sections WHERE slug = 'market-strategy' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'What was Stripe''s approach to entering the Australian market?',
 'Stripe spent 18 months researching the Australian fintech landscape before launch. They identified that Australian businesses were frustrated with legacy payment systems that were expensive and difficult to integrate. The team conducted over 200 interviews with potential customers, from small startups to large enterprises, to understand the unique payment challenges in the Australian market.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 
 (SELECT id FROM public.content_sections WHERE slug = 'regulatory-compliance' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'How did Stripe navigate Australian financial regulations?',
 'Stripe worked closely with AUSTRAC and ASIC to ensure full compliance with Australian financial regulations. They obtained an Australian Financial Services License (AFSL) and implemented robust AML/CTF procedures. The company also partnered with local banks including Westpac to ensure seamless fund settlement and regulatory compliance.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion'), 
 (SELECT id FROM public.content_sections WHERE slug = 'partnerships' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'stripe-australia-fintech-expansion')),
 'What partnerships were crucial to Stripe''s success?',
 'Stripe formed strategic partnerships with major Australian e-commerce platforms like Shopify Plus, WooCommerce, and local providers. They also partnered with accounting software companies like Xero and MYOB to provide seamless financial integrations for Australian businesses.',
 1, 'question_answer');

-- Insert content bodies for Airbnb story
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 
 (SELECT id FROM public.content_sections WHERE slug = 'market-assessment' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry')),
 'Why did Airbnb see Australia as an attractive market?',
 'Australia presented a perfect storm of opportunity for Airbnb: high tourism numbers, expensive hotel rates, a tech-savvy population, and a culture of travel. With over 8 million international visitors annually and domestic tourism worth $50 billion, the market size was substantial. Additionally, Australian property prices meant many homeowners were looking for additional income streams.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 
 (SELECT id FROM public.content_sections WHERE slug = 'regulatory-challenges' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry')),
 'What regulatory hurdles did Airbnb face in Australia?',
 'Airbnb faced significant regulatory challenges across different states and councils. Sydney and Melbourne had strict short-term rental laws, with Sydney limiting rentals to 180 days per year. The company had to work with local governments to establish clear guidelines and ensure hosts understood their tax obligations, including GST registration requirements.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 
 (SELECT id FROM public.content_sections WHERE slug = 'community-building' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry')),
 'How did Airbnb build its host community in Australia?',
 'Airbnb focused heavily on community building through local meetups, host workshops, and partnerships with tourism boards. They created Australia-specific host resources and established a local customer support team. The company also launched targeted marketing campaigns during major events like the Australian Open and Melbourne Cup to attract both hosts and guests.',
 1, 'question_answer');
