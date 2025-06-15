
-- Insert sample content for Market Entry Guides
INSERT INTO public.content_items (slug, title, subtitle, category_id, content_type, featured, read_time, meta_description, sector_tags) 
VALUES 
-- Market Entry Guides
('australian-business-registration-guide', 'Complete Guide to Australian Business Registration', 'Step-by-step process for registering your business in Australia', (SELECT id FROM public.content_categories WHERE name = 'Market Entry Guides'), 'guide', false, 15, 'Complete guide to registering your business in Australia including ABN, company registration, and licensing requirements.', ARRAY['business-registration', 'legal', 'compliance']),

('australian-tax-obligations-guide', 'Understanding Australian Tax Obligations for Foreign Companies', 'Navigate GST, corporate tax, and reporting requirements', (SELECT id FROM public.content_categories WHERE name = 'Market Entry Guides'), 'guide', true, 12, 'Comprehensive guide to Australian tax obligations for international companies entering the market.', ARRAY['taxation', 'gst', 'compliance']),

-- Expert Interviews
('banking-expert-interview-westpac', 'Banking in Australia: Insights from Westpac Executive', 'How international companies can establish banking relationships in Australia', (SELECT id FROM public.content_categories WHERE name = 'Expert Interviews'), 'interview', true, 8, 'Expert insights on establishing banking relationships and understanding Australian financial systems.', ARRAY['banking', 'finance', 'expert-advice']),

('regulatory-expert-asic-interview', 'Navigating ASIC Regulations: Expert Interview', 'Understanding Australian Securities and Investment Commission requirements', (SELECT id FROM public.content_categories WHERE name = 'Expert Interviews'), 'interview', false, 10, 'Expert interview on ASIC regulations and compliance requirements for international businesses.', ARRAY['regulations', 'asic', 'compliance']),

-- Legal & Compliance
('firb-foreign-investment-guide', 'FIRB Approval Process for Foreign Investment', 'Navigate the Foreign Investment Review Board requirements', (SELECT id FROM public.content_categories WHERE name = 'Legal & Compliance'), 'compliance', false, 18, 'Complete guide to FIRB approval process for foreign investors and businesses entering Australia.', ARRAY['firb', 'foreign-investment', 'legal']),

('employment-law-australia-guide', 'Australian Employment Law for International Employers', 'Hiring, contracts, and workplace regulations in Australia', (SELECT id FROM public.content_categories WHERE name = 'Legal & Compliance'), 'compliance', true, 14, 'Essential guide to Australian employment law for international companies hiring local talent.', ARRAY['employment-law', 'hr', 'workplace']),

-- Best Practices
('market-research-best-practices', 'Best Practices for Australian Market Research', 'Proven methodologies for understanding the Australian market', (SELECT id FROM public.content_categories WHERE name = 'Best Practices'), 'best_practice', false, 9, 'Best practices and methodologies for conducting effective market research in Australia.', ARRAY['market-research', 'strategy', 'methodology']),

('distribution-strategy-australia', 'Distribution Strategy Best Practices for Australia', 'Building effective distribution networks across Australian states', (SELECT id FROM public.content_categories WHERE name = 'Best Practices'), 'best_practice', true, 11, 'Best practices for establishing distribution networks and supply chains in Australia.', ARRAY['distribution', 'logistics', 'supply-chain']);

-- Insert content sections for the tax guide
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide'), 'GST Registration Requirements', 'gst-registration', 1),
((SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide'), 'Corporate Tax Structure', 'corporate-tax', 2),
((SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide'), 'Reporting Obligations', 'reporting', 3),
((SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide'), 'Tax Planning Strategies', 'tax-planning', 4);

-- Insert content sections for the banking interview
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 'About Our Expert', 'expert-background', 1),
((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 'Banking Requirements', 'banking-requirements', 2),
((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 'Common Challenges', 'challenges', 3),
((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 'Expert Recommendations', 'recommendations', 4);

-- Insert content sections for FIRB guide
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide'), 'What is FIRB?', 'what-is-firb', 1),
((SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide'), 'Application Process', 'application-process', 2),
((SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide'), 'Required Documentation', 'documentation', 3),
((SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide'), 'Timeline and Costs', 'timeline-costs', 4);

-- Insert content bodies for tax guide
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES
((SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide'), 
 (SELECT id FROM public.content_sections WHERE slug = 'gst-registration' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide')),
 'When do I need to register for GST in Australia?',
 'Foreign companies must register for GST if their Australian turnover reaches $75,000 or more in a 12-month period. For non-profit organizations, the threshold is $150,000. Registration is also required if you operate a taxi or limousine service regardless of turnover. You can voluntarily register for GST even if you don''t meet these thresholds, which may be beneficial if you make creditable purchases.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide'), 
 (SELECT id FROM public.content_sections WHERE slug = 'corporate-tax' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide')),
 'What is the corporate tax rate in Australia?',
 'Australia''s corporate tax rate is 30% for companies with aggregated turnover of $50 million or more. Small companies (under $50 million turnover) pay 25%. Foreign companies are subject to the same rates on their Australian-sourced income. There are also special rules for foreign-controlled companies and thin capitalization provisions that may affect your tax liability.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide'), 
 (SELECT id FROM public.content_sections WHERE slug = 'reporting' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'australian-tax-obligations-guide')),
 'What are the key reporting obligations?',
 'Companies must lodge annual tax returns by the 28th day of the month after your tax agent''s lodgment program due date, or by 28 February if self-preparing. GST returns are typically due monthly or quarterly. You must also lodge Business Activity Statements (BAS) which report GST, PAYG withholding, and other taxes. International related party dealings may require additional documentation under transfer pricing rules.',
 1, 'question_answer');

-- Insert content bodies for banking interview
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES
((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 
 (SELECT id FROM public.content_sections WHERE slug = 'expert-background' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac')),
 'Tell us about your background in international banking',
 'I''ve been with Westpac for over 15 years, specializing in international business banking. I''ve helped hundreds of foreign companies establish their banking relationships in Australia, from tech startups to multinational corporations. My team focuses specifically on understanding the unique challenges international businesses face when entering the Australian market.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 
 (SELECT id FROM public.content_sections WHERE slug = 'banking-requirements' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac')),
 'What documents do international companies need to open business accounts?',
 'International companies need their Certificate of Incorporation, company constitution, board resolutions authorizing account opening, and identification for all directors and authorized signatories. For foreign companies, we also require ASIC registration documents, proof of Australian address, and sometimes additional due diligence depending on the country of origin. The process typically takes 2-3 weeks once all documentation is complete.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 
 (SELECT id FROM public.content_sections WHERE slug = 'challenges' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac')),
 'What are the most common challenges you see?',
 'The biggest challenge is usually the documentation requirements. Many international companies underestimate the compliance requirements in Australia. Another common issue is establishing credit history - we often recommend starting with secured facilities or guarantees from the parent company. Currency hedging is also frequently overlooked but crucial for companies with international revenue streams.',
 1, 'question_answer');

-- Insert content bodies for FIRB guide
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES
((SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide'), 
 (SELECT id FROM public.content_sections WHERE slug = 'what-is-firb' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide')),
 'What is the Foreign Investment Review Board?',
 'The Foreign Investment Review Board (FIRB) is an independent advisory body that reviews foreign investment proposals and advises the Australian Government on foreign investment policy. FIRB examines foreign investments to ensure they are not contrary to Australia''s national interest. Most significant foreign investments require FIRB approval before proceeding.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide'), 
 (SELECT id FROM public.content_sections WHERE slug = 'application-process' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide')),
 'How does the FIRB application process work?',
 'The process begins with determining if your investment requires FIRB approval based on thresholds and investment type. Applications are submitted online through the FIRB website with required documentation and fees. The standard assessment period is 30 days, but can be extended. FIRB may approve unconditionally, approve with conditions, or in rare cases, reject the proposal.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide'), 
 (SELECT id FROM public.content_sections WHERE slug = 'documentation' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'firb-foreign-investment-guide')),
 'What documentation is required?',
 'Required documents include completed application forms, corporate structure charts, details of the proposed investment, financial statements, business plans, and information about ultimate beneficial owners. For real estate investments, you''ll need property details and purchase contracts. The specific requirements vary depending on the type and value of investment.',
 1, 'question_answer');

-- Insert expert profiles for the interviews
INSERT INTO public.content_founders (content_id, name, title, bio, is_primary)
VALUES 
((SELECT id FROM public.content_items WHERE slug = 'banking-expert-interview-westpac'), 'Sarah Mitchell', 'Senior Manager, International Business Banking, Westpac', 'Sarah Mitchell leads Westpac''s international business banking team and has extensive experience helping foreign companies establish their Australian operations. She holds a Masters in International Finance and is a CPA.', true),

((SELECT id FROM public.content_items WHERE slug = 'regulatory-expert-asic-interview'), 'Dr. Robert Chen', 'Former ASIC Senior Advisor, Chen Regulatory Consulting', 'Dr. Robert Chen spent 12 years at ASIC before founding his regulatory consulting firm. He specializes in helping international financial services companies navigate Australian regulatory requirements.', true);
