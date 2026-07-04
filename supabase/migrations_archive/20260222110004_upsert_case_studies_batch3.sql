-- ============================================================================
-- IDEMPOTENT CASE STUDIES UPSERT PART 4: Databricks, Snowflake, ServiceNow, Palantir, Xero, UiPath
-- ============================================================================

-- ===================== DATABRICKS =====================
DELETE FROM public.content_items WHERE slug = 'databricks-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'databricks-australia-market-entry',
  'How Databricks Entered the Australian Market',
  'Building a strong ecosystem of customers and partners with over 70% year-over-year growth in ANZ',
  'case_study', 'published', false, 8,
  'Discover how Databricks achieved 70%+ annual growth in Australia through local teams, partner ecosystems, and roadshow events.',
  ARRAY['data-analytics', 'ai', 'technology', 'enterprise-software', 'cloud-computing'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Databricks', 'Data and AI Analytics', 'United States', 'Australia', '2017', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Ali Ghodsi', 'CEO & Co-founder, Databricks', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Databricks built a strong ecosystem of customers and partners in ANZ, positioning as a platform for generative AI through strategic acquisitions and investments. They utilized event roadshows called Data Intelligence Days across major cities (Perth, Melbourne, Auckland, Brisbane) to bring together AI leaders and share transformation stories.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Success was driven by a surge in demand for data and AI capabilities among Australian enterprises, rapid product innovation, and diligent work of the local team on the ground in Australia and New Zealand. The inaugural Databricks ANZ Data + AI Awards 2024 in Sydney helped recognize and celebrate local teams.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Over 70% year-over-year growth for the ANZ business. More than doubled partners in the ANZ region. Sportsbet achieved 60% faster delivery times and 30% productivity increase. Atlassian reported 70% of business users can now access Databricks autonomously for analytics and insights.</p>
<p>Globally reached over US$1.6 billion in revenue for the fiscal year ending January 31, representing over 50% year-over-year growth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Databricks needed to build awareness and trust in a market where many enterprises were still early in their data and AI maturity journeys. Competing for talent and mindshare in the Australian tech ecosystem required sustained investment in local community building and events.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Enterprise AI adoption requires a strong local ecosystem of customers and partners. Customer success stories and awards programs build community and credibility. Roadshow events across major cities enable relationship building and knowledge sharing. Local leadership (Adam Beavis as VP and Country Manager) is critical for regional growth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a></em></p>', 1, 'paragraph');


-- ===================== SNOWFLAKE =====================
DELETE FROM public.content_items WHERE slug = 'snowflake-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'snowflake-australia-market-entry',
  'How Snowflake Entered the Australian Market',
  'Cloud data warehouse deployment via AWS Sydney with local office and rapid enterprise customer acquisition',
  'case_study', 'published', false, 8,
  'Learn how Snowflake signed 20 Australian enterprises within ten months of opening a local office in 2017.',
  ARRAY['data-analytics', 'cloud-computing', 'data-warehousing', 'technology', 'enterprise-software'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Snowflake', 'Cloud Data Warehousing', 'United States', 'Australia', '2017', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Sridhar Ramaswamy', 'CEO, Snowflake', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Snowflake opened a local office and partnered with Amazon Web Services (AWS) to utilize Sydney datacentres for cloud storage and compute. The cloud deployment in the Asia Pacific Sydney region via AWS marked their fourth global deployment. They planned to launch a locally based Azure service in 2019.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.prnewswire.com/news-releases/snowflake-continues-global-expansion-with-australian-data-center-deployment-300518145.html" target="_blank" rel="noopener noreferrer">PR Newswire</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Snowflake offered infinite concurrency with effectively unlimited data at a fraction of the cost compared to on-premise solutions. Increased maturity of public cloud computing helped adoption. The ability to handle both structured and semi-structured data without limitations, plus fast low-latency access and data sovereignty meeting regional data protection regulations, were key advantages.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Signed up 20 Australian enterprises within ten months after opening a local office. Another 20 were in the pipeline. Half a dozen proofs of concept were underway in New Zealand. A Forrester Research report indicated potential 600% return on investment. These customers contributed to a global base of 1,000 customers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Local concerns about data sovereignty and latency were significant barriers. Customers should not necessarily expect a reduction in data warehousing costs because the system often triggers an increase in demand for analytics. Many enterprises struggled with data strewn across various sources. The technology was also unable to tackle unstructured data such as video at the time.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Data sovereignty is a critical consideration for the Australian market. Local office and partnerships with cloud providers (AWS, Azure) enable rapid customer acquisition. Australian spending on hardware maintenance was forecast to decrease 6% in 2018, creating opportunity for cloud migration. Helping organizations move past the barrier of geography while transitioning from traditional solutions is essential.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.prnewswire.com/news-releases/snowflake-continues-global-expansion-with-australian-data-center-deployment-300518145.html" target="_blank" rel="noopener noreferrer">PR Newswire</a></em></p>', 1, 'paragraph');


-- ===================== SERVICENOW =====================
DELETE FROM public.content_items WHERE slug = 'servicenow-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'servicenow-australia-market-entry',
  'How ServiceNow Entered the Australian Market',
  'Rapid rise empowering Australian enterprises with flexibility, scalability, and ease of use across IT, HR, and security',
  'case_study', 'published', false, 7,
  'Discover how ServiceNow grew faster in Australia than its 23% global rate, building a strong ecosystem of implementation partners.',
  ARRAY['cloud-computing', 'enterprise-software', 'it-service-management', 'technology', 'saas'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'ServiceNow', 'Cloud IT Service Management', 'United States', 'Australia', '2022', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Bill McDermott', 'Chair & CEO, ServiceNow', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>ServiceNow built an ecosystem of service providers and partners to meet rising demand in Australia. Companies identified as Leaders included Accenture, Capgemini, Deloitte, Enable and Infosys across three service quadrants, creating a robust implementation network.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>ServiceNow succeeded through flexibility, scalability, and relative ease of use. Relatively easy configuration and ease of use by non-technical employees was a major differentiator. The platform''s power to accelerate automation of IT, HR, customer support, security and compliance enabled transformative change in enterprise IT.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Global revenue grew by 23% in fiscal 2022. The ISG report evaluated 28 providers across three quadrants. Anecdotal evidence suggests the Australian ecosystem was booming more than the global rate.</p>
<p>In 2022, the ServiceNow market appeared to have grown even faster in Australia than globally (faster than the 23% global growth rate).</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Rapid expansion caused providers to scramble and compete to build out resources to meet rising demand. Companies shifted from buying single ServiceNow modules to requiring integration across areas such as security, processes and IT service and operations management, increasing implementation complexity.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Rapid market growth requires a strong ecosystem of implementation partners to meet demand. The Australian market can grow faster than global averages when timing and product-market fit align. Increasing mergers and acquisitions signal a maturing market. Evolution from point solutions to integrated platforms drives enterprise adoption.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a></em></p>', 1, 'paragraph');


-- ===================== PALANTIR =====================
DELETE FROM public.content_items WHERE slug = 'palantir-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'palantir-australia-market-entry',
  'How Palantir Technologies Entered the Australian Market',
  'Advanced cloud services for government and commercial customers with IRAP PROTECTED certification',
  'case_study', 'published', false, 8,
  'Learn how Palantir built a dual government-commercial strategy in Australia since 2013, achieving IRAP PROTECTED certification.',
  ARRAY['data-analytics', 'ai', 'defense', 'technology', 'government'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Palantir Technologies', 'Data Analytics and AI', 'United States', 'Australia', '2013', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Alex Karp', 'CEO & Co-founder, Palantir', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Palantir deployed the Palantir Platform Australia (PPA) to deliver advanced cloud services including Foundry and AIP hosted in Australian AWS regions. They targeted both government and commercial customers. In November 2025, they achieved IRAP PROTECTED level certification, enabling work with Australian government agencies meeting stringent national security and privacy standards.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.businesswire.com/news/home/20251120911748/en/Palantir-Achieves-Information-Security-Registered-Assessors-Program-IRAP-PROTECTED-Level-Unlocking-New-Opportunities-in-Australia" target="_blank" rel="noopener noreferrer">BusinessWire</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Palantir provided highly specialized tools and surveillance and data-gathering technology to handle massive data sets. They created systems where clients became increasingly dependent on the company to make sense of their data. Rapid adoption of AI drove strong returns, and IRAP PROTECTED certification enabled access to the lucrative government sector.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://honisoit.com/2026/02/australias-100-million-investment-in-palantir-technology-giant-and-partner-of-us-and-israeli-defence-forces/" target="_blank" rel="noopener noreferrer">Honi Soit</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Australia''s Future Fund owns 498,339 shares of Palantir valued at $103,649,987 according to the June 30, 2025 report. The investment ballooned by nearly 100 times since February 2023 when shares were worth around $1.6 million. The Australian Department of Defence signed a $7.15 million contract for the Foundry platform.</p>
<p>A three-year deal with Coles (2024) to optimize workforce by analyzing over 10 billion rows of data demonstrates significant commercial market potential.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://honisoit.com/2026/02/australias-100-million-investment-in-palantir-technology-giant-and-partner-of-us-and-israeli-defence-forces/" target="_blank" rel="noopener noreferrer">Honi Soit</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Palantir faced concerns regarding vendor lock-in from both government and commercial customers. Critics raised issues about the company''s human rights record regarding international operations. Balancing commercial expansion with government security requirements presented an ongoing challenge.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://honisoit.com/2026/02/australias-100-million-investment-in-palantir-technology-giant-and-partner-of-us-and-israeli-defence-forces/" target="_blank" rel="noopener noreferrer">Honi Soit</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Security clearances and compliance certifications (IRAP PROTECTED) are essential for government market access in defense and national security sectors. A dual-track strategy serving both government and commercial customers enables diversified growth. Long-term relationship building with government clients creates sustainable revenue streams.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://honisoit.com/2026/02/australias-100-million-investment-in-palantir-technology-giant-and-partner-of-us-and-israeli-defence-forces/" target="_blank" rel="noopener noreferrer">Honi Soit</a></em></p>', 1, 'paragraph');


-- ===================== XERO =====================
DELETE FROM public.content_items WHERE slug = 'xero-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'xero-australia-market-entry',
  'How Xero Entered the Australian Market',
  'Partner-led strategy targeting accountants and bookkeepers rather than end users to revolutionize cloud accounting',
  'case_study', 'published', false, 8,
  'Discover how New Zealand-based Xero captured the Australian cloud accounting market with 90% of subscriptions via partners.',
  ARRAY['fintech', 'cloud-computing', 'accounting', 'saas', 'technology'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Xero', 'Cloud Accounting Software', 'New Zealand', 'Australia', '2009', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Sukhinder Singh Cassidy', 'CEO, Xero', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Xero pursued a partner-led strategy targeting financial intermediaries (accountants and bookkeepers) rather than end users. They provided an extensive partner program, exclusive events and awards to provide value to partners. Their cloud-based solution aimed to disrupt and revolutionize the accounting industry.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Xero''s success was driven by cloud disruption revolutionizing the accounting industry, seamless integration with thousands of banks for real-time data, commitment to customer-centricity with their "Beautiful business" tagline, social proof from winning Canstar Blue award for four years in a row for most satisfied customers, direct human connection through face-to-face events, and product integrations enabling a rich ecosystem.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>More than 1.3 million subscribers as of 2018. Market capitalization approximately $6 billion. Added 351,000 subscribers in the past 12 months (30% growth). In Australia and New Zealand, more than 90% of paid subscriptions came from accounting partners. Ranks #2 for the top keyword phrase ''accounting software'' in Australia. Holds top 5 organic search positions for nearly 1,500 brand keywords.</p>
<p>Market leader in cloud accounting software in Australia and New Zealand.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Xero needed to convince traditional accountants and bookkeepers to move from established desktop accounting software (primarily MYOB) to a cloud-based solution. Building trust in the security and reliability of cloud-based financial data management was a significant barrier in the early years.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Partner-led B2B2C strategy is more effective than direct-to-consumer for professional software. Financial intermediaries (accountants, bookkeepers) as channel partners accelerate growth — 90% of Australian paid subscriptions came from partners. Event marketing at scale (Xerocon with 3,000+ attendees rotating across Australian cities) builds community. Australia as the most developed market demonstrates the importance of geographic proximity to the home market (New Zealand) for initial international expansion.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 1, 'paragraph');


-- ===================== UIPATH =====================
DELETE FROM public.content_items WHERE slug = 'uipath-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'uipath-australia-market-entry',
  'How UiPath Entered the Australian Market',
  'Next-generation enterprise automation platform with agentic AI capabilities launched across Sydney and Melbourne',
  'case_study', 'published', false, 7,
  'Learn how UiPath launched its agentic automation platform in Australia with 75,000+ agent runs and 450+ trained partners.',
  ARRAY['rpa', 'ai', 'automation', 'enterprise-software', 'technology'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'UiPath', 'Robotic Process Automation (RPA) and AI', 'United States', 'Australia', '2018', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Daniel Dines', 'CEO & Co-founder, UiPath', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>UiPath launched its next-generation enterprise automation platform in Australia in June 2025 with events in Sydney and Melbourne. Their strategy focuses on agentic automation using a controlled agency model with operational guardrails. They maintained a partnership with Ashling Partners Australia for more than eight years and collaborated with Google Cloud for the Agent2Agent (A2A) protocol.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>UiPath addressed Australian barriers to AI adoption including security and compliance risks, reliability issues, and vendor lock-in concerns. UiPath Maestro provided orchestration capabilities. Strong partnerships with local implementation partners and a focus on highly regulated industries like insurance, finance, and healthcare for applications like claims adjudication and loan origination drove adoption.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Since the private preview began in January 2025: creation of thousands of semi-autonomous and autonomous agents, more than 75,000 agent runs, over 450 partners engaged in agentic automation training. Hundreds of customer scenarios are now in operation.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Key barriers to AI adoption in Australia included security and compliance risks, reliability issues, halted pilot programmes, and concerns over vendor dependency. These challenges required UiPath to build trust through controlled automation approaches with operational guardrails.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Long-term local partnerships (8+ years with Ashling Partners) build a strong foundation for market entry. Addressing specific regional barriers to adoption (security, compliance, vendor lock-in) is critical for enterprise software. Private preview programs enable customer validation before full launch. Partner training programs (450+ partners) create an ecosystem that enables scale.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph');
