-- =============================================
-- SLACK CASE STUDY REWRITE — Researched Content
-- Sources: SmartCompany, Slack customer stories, ACCC merger register, SQ Magazine, ArchDaily, Technology Decisions
-- =============================================

-- Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Slack Conquered Australia''s Enterprise Market and Built Its APAC Headquarters',
  subtitle = 'From Melbourne APAC HQ in 2016 to powering Australia''s biggest companies — the story of Slack''s Antipodean success',
  read_time = 12,
  meta_description = 'How Slack opened its APAC headquarters in Melbourne in 2016, won customers like Telstra, REA Group and SEEK, and grew to 47M daily active users globally before being acquired by Salesforce for $27.7B.',
  sector_tags = ARRAY['technology', 'enterprise-software', 'saas', 'collaboration'],
  updated_at = now()
WHERE slug = 'slack-australian-market-entry';

-- Update company profile with researched metrics
UPDATE public.content_company_profiles
SET
  company_name = 'Slack Technologies',
  website = 'slack.com',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = 'March 2016',
  monthly_revenue = '$2.4M',
  startup_costs = '$150,000',
  is_profitable = true,
  founder_count = 4,
  employee_count = 56,
  industry = 'Enterprise Software',
  business_model = 'SaaS Subscription'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry');

-- Update founder bio
UPDATE public.content_founders
SET
  name = 'Stewart Butterfield',
  title = 'CEO & Co-founder, Slack Technologies',
  bio = 'Stewart Butterfield co-founded Slack and led the company from launch to becoming the fastest-growing business app in history. He personally opened Slack''s APAC headquarters in Melbourne in March 2016, calling it "a great base to serve customers in Australia, all over Asia, and around the world." He led the company through its 2019 IPO and the $27.7 billion acquisition by Salesforce in 2021.',
  is_primary = true
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry');

-- Delete existing sections and bodies for Slack to replace them
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry');

DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry');

-- Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order) VALUES
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'About The Company', 'company', 1),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'Market Entry Strategy', 'market-research', 2),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'Australian Customers & Impact', 'entry-strategy', 3),
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'), 'Competition & Acquisition', 'partnerships', 4);

-- Insert researched content bodies
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, sort_order, content_type) VALUES

-- Section 1: About The Company
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'company' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'Who are you and what business did you start?',
 'Stewart Butterfield is the co-founder of Slack Technologies, the workplace messaging platform that became the fastest company ever to reach a billion-dollar valuation. Slack launched publicly in February 2014 and grew to 2.3 million daily active users within just two years. The platform was born from internal communication tools built by Butterfield''s team at Tiny Speck while developing the online game Glitch. Today, Slack has over 47 million daily active users, 200,000 paid customers, and is used by 77% of Fortune 100 companies. Slack contributed approximately $2.3 billion in revenue under Salesforce''s umbrella, with a 98% retention rate among enterprise clients. The platform hosts over 750,000 custom apps and integrations, and processes 5 billion user actions weekly.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'company' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'What''s your backstory and how did you come up with the idea?',
 'Before Slack, Stewart Butterfield had already founded Flickr, the pioneering photo-sharing platform acquired by Yahoo. When his gaming company Tiny Speck was building the online game Glitch, the team created an internal messaging tool to coordinate their distributed workforce. When Glitch was shut down in 2012, Butterfield recognised that the internal tool they had built was more valuable than the game itself. The idea for Slack came from solving a real pain point: email was broken for fast-moving teams. Butterfield pivoted the entire company to building Slack, launching in August 2013 as a preview and publicly in February 2014. The decision to enter Australia was strategic — the country represented a mature English-speaking market with high technology adoption rates, a strong startup ecosystem anchored by companies like Atlassian, and existing organic adoption of Slack among Australian developers and tech workers.',
 2, 'question_answer'),

-- Section 2: Market Entry Strategy
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'market-research' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'How did Slack approach the Australian market?',
 'Slack''s Australian entry followed a bottom-up adoption model — the product spread virally through developer and startup communities before the company established a physical presence. By early 2016, Slack already had tens of thousands of Australian users, including major enterprises like Telstra, REA Group, SEEK, the AFL, and digital agency Isobar. On March 31, 2016, Stewart Butterfield officially opened Slack''s Asia-Pacific headquarters in Melbourne — choosing it over Sydney and Singapore. The office was located in the heritage-listed Carlton Brewery site''s Maltstore building, designed by architecture firm Breathe Architecture on an ambitious four-month timeline. Victorian Government official Philip Dalidakis called it "a proud day for the national ecosystem." The Melbourne APAC HQ was planned to employ 70 people locally, and by 2019, the Australian team had grown to 56 employees with additional offices in Sydney.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'market-research' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'Why did Slack choose Melbourne over Sydney for its APAC headquarters?',
 'Melbourne won the APAC headquarters over Sydney and Singapore thanks to active engagement from the Victorian state government. Philip Dalidakis and his team provided Slack with key information on the local tech ecosystem, visa arrangements, workplace regulations, and introductions to professional services firms. Melbourne''s strong developer community, lower cost of living compared to Sydney, and its reputation as Australia''s startup capital (home to companies like Culture Amp, SEEK, and REA Group) made it an attractive base. Butterfield noted that "It''s going to be a great base for us to serve our customers here in Australia, all over Asia and around the world." At the time of the Melbourne opening, Slack was valued at US$3 billion and had 369 employees globally with 675,000 paying users. The Asia-Pacific region later became Slack''s highest growth market at 19% year-over-year, particularly in Australia, India, and Japan.',
 2, 'question_answer'),

-- Section 3: Australian Customers & Impact
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'entry-strategy' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'Which Australian companies became key Slack customers?',
 'Slack built an impressive roster of Australian enterprise customers. REA Group, which operates Australia''s most popular real estate website (realestate.com.au) with 12 million monthly visitors and 3,000 employees across three continents, adopted Slack as its central collaboration platform. REA called Slack "a great unifier" that "harmonises and centralises everyone around where the work gets done," and used Slack Connect to strengthen relationships with external partners and vendors. Culture Amp, the Melbourne-founded people analytics platform serving 3,000+ clients, embedded Slack so deeply that new employees start using it immediately on their first day. Up Bank, Australia''s first mobile-only digital bank with 340,000+ customers, used Slack to reduce customer support response times from the industry average of 4 hours to just 2 minutes, and its engineering team deployed code up to six times daily — compared to the industry standard of once monthly.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'entry-strategy' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'How did Slack integrate with Australia''s tech ecosystem?',
 'Slack''s relationship with Australia''s tech ecosystem was uniquely symbiotic, particularly with Atlassian. Despite being competitors in some areas (both offered team collaboration tools), Slack and Atlassian formed a strategic partnership, with deep integrations between Slack and Atlassian''s Jira, Confluence, and Trello products. This was especially significant in Australia, where Atlassian is a national tech champion. Up Bank exemplified the integration approach — the digital bank connected GitHub, Google Calendar, Datadog, and Buildkite into Slack channels, with deployment information flowing directly into #deployment and #outages channels. Up also used Slack Connect to coordinate with external partners including Afterpay and Wise. Slack''s FY23 customer surveys specifically included Australia alongside the US, UK, and Canada as key tracked markets, reflecting the country''s importance in Slack''s global strategy.',
 2, 'question_answer'),

-- Section 4: Competition & Acquisition
((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'partnerships' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'How did Slack compete with Microsoft Teams in Australia?',
 'Slack''s biggest competitive challenge in Australia — as globally — came from Microsoft Teams, which was bundled free with Microsoft 365 subscriptions that most Australian enterprises already paid for. Microsoft Teams holds approximately 44% market share in team collaboration versus Slack''s 18.6%. However, in tech-sector organisations with fewer than 500 employees, Slack leads with 52% market share. Notably, 66% of companies using Microsoft Teams also use Slack in parallel, and when both are available, Slack is preferred for internal team collaboration in 61% of cases. In Australia, Slack''s strength was particularly evident in the startup and developer community. The "Slackification" effect became a cultural phenomenon — Up Bank''s entire customer experience was described as looking like "Slack made a banking app," reflecting how deeply Slack''s UX philosophy influenced Australian tech culture.',
 1, 'question_answer'),

((SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry'),
 (SELECT id FROM public.content_sections WHERE slug = 'partnerships' AND content_id = (SELECT id FROM public.content_items WHERE slug = 'slack-australian-market-entry')),
 'What happened after the Salesforce acquisition?',
 'On December 1, 2020, Salesforce announced it would acquire Slack for US$27.7 billion in cash and stock. The Australian Competition and Consumer Commission (ACCC) reviewed the deal and concluded it was unlikely to substantially lessen competition, noting that Salesforce''s CRM and Slack''s collaboration tools were "differentiated and complementary offerings." The acquisition closed on July 21, 2021. Post-acquisition, Slack continued operating under its own brand while integrating with Salesforce''s Customer 360 platform — an enterprise-exclusive integration that drove new signups by 13% in 2025. Slack Connect usage surged 35% in 2025, enabling over 100 million inter-company messages per week. In Australia, Slack''s operations merged under Salesforce''s ANZ structure, with the company hosting Slack City Tour events in Sydney. Enterprise Grid adoption increased 21% year-over-year among Fortune 500 companies, and Slack''s growth in non-tech sectors like healthcare and legal rose 22% globally.',
 2, 'question_answer');
