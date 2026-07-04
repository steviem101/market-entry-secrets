-- ============================================================================
-- DATABRICKS CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Databricks Entered the Australian Market',
  subtitle = 'From UC Berkeley research lab to 200-person ANZ operation: how the data lakehouse pioneer built a $134 billion business with 70%+ annual growth in Australia',
  read_time = 12,
  meta_description = 'Deep-dive case study on how Databricks entered Australia with a partner-led ecosystem strategy, hired ex-AWS leadership, won NAB and Atlassian as flagship customers, and achieved 70%+ annual growth in ANZ.',
  sector_tags = ARRAY['data-analytics', 'ai', 'technology', 'enterprise-software', 'cloud-computing', 'machine-learning'],
  updated_at = NOW()
WHERE slug = 'databricks-australia-market-entry';

-- 2. Update company profile with richer metadata
UPDATE public.content_company_profiles
SET
  industry = 'Data and AI Analytics Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2017',
  outcome = 'successful',
  employee_count = 200,
  is_profitable = false,
  business_model = 'B2B SaaS / Consumption-based Cloud Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry');

-- 3. Delete existing sections (CASCADE deletes content_bodies)
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'databricks-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Databricks was founded in 2013 by seven UC Berkeley researchers — including CEO Ali Ghodsi and CTO Matei Zaharia — who created Apache Spark, the open-source distributed computing framework. By the time the company turned its attention to Australia, it had already established its Asia Pacific and Japan headquarters in Singapore in December 2018. Australia became a natural next step: a mature enterprise market with strong cloud adoption, significant financial services and mining sectors generating massive data volumes, and a growing appetite for AI capabilities.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Databricks'' Australian entry followed a deliberate playbook: build the partner ecosystem first, then invest in local headcount. Rather than opening with a large direct sales team, the company initially worked through consulting and systems integration partners to establish product-market fit across Australian industries. The strategy proved effective — by the time Databricks doubled down on direct presence, it already had over 100 local customers including major names like Atlassian and Tabcorp using the platform.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-doubles-anz-headcount-signalling-growing-demand" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a>, <a href="https://www.itnews.com.au/news/databricks-appoints-adam-beavis-as-anz-vp-and-country-manager-598743" target="_blank" rel="noopener noreferrer">iTnews</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The pivotal moment came in August 2023, when Databricks appointed Adam Beavis as Vice President and Country Manager for Australia and New Zealand. Beavis brought over 20 years of enterprise technology experience, including eight years at Amazon Web Services where he held roles spanning Director of Enterprise, Managing Director of ANZ, and Managing Director of ISV and Digital Native Businesses for Asia Pacific and Japan. His most recent role before Databricks was as Managing Director of Stax, an AWS cloud management platform. The hire signalled serious intent: Beavis was tasked with driving data lakehouse adoption across retail, financial services, government, resources, mining, and utilities sectors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-announces-appointment-adam-beavis-head-australia-and-new" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a>, <a href="https://www.crn.com.au/news/databricks-names-new-anz-vp-and-country-manager-598735" target="_blank" rel="noopener noreferrer">CRN Australia</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Databricks established its Australian office at 161 Collins Street in Melbourne''s CBD — a deliberate choice reflecting Melbourne''s strength as a technology hub and its proximity to major customers in financial services and retail. The company complemented its direct presence with an aggressive event strategy, launching Data Intelligence Days roadshows across Perth, Melbourne, Auckland, and Brisbane, and hosting the Data + AI World Tour at Sydney''s Hilton Hotel in August 2024. These events brought together enterprise AI leaders from organisations like Bupa, the Victorian Department of Transport and Planning, and Seven West Media to share transformation stories and build community.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.databricks.com/company/contact/office-locations" target="_blank" rel="noopener noreferrer">Databricks Office Locations</a>, <a href="https://community.databricks.com/t5/sydney/data-ai-world-tour-sydney/ev-p/82515" target="_blank" rel="noopener noreferrer">Databricks Community</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Databricks'' success in Australia rests on three pillars: hiring the right local leadership, building a dense partner ecosystem, and arriving at the right moment in the market cycle. The appointment of Beavis — with deep AWS relationships and an established network across Australian enterprise IT — gave Databricks instant credibility and access. His ability to recruit experienced field engineers and solution architects who understood local industry requirements accelerated customer onboarding significantly.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The partner ecosystem became a force multiplier. Databricks grew its ANZ partner network from a handful to over 250 partners, including Mantel Group (named Databricks'' Regional Partner of the Year), Accenture, Deloitte, NCS Australia, and Ippon Technologies. Mantel Group, an Australian-founded consultancy, became the only Elite Databricks Partner in Australia and New Zealand — a status requiring deep technical certification and demonstrated customer outcomes. James Hayes, Mantel Group''s Data Partner, noted the "high demand from clients across ANZ" for Databricks implementations. This partner-led approach meant Databricks could scale its reach without proportional headcount investment, while partners handled implementation complexity across diverse industries.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://mantelgroup.com.au/partners/databricks/" target="_blank" rel="noopener noreferrer">Mantel Group</a>, <a href="https://www.crn.com.au/news/2025/big-data-and-analytics/databricks-overhauls-partner-program-with-tight-focus-on-customer-value" target="_blank" rel="noopener noreferrer">CRN Australia</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Timing also played a crucial role. Databricks'' Australian expansion accelerated just as generative AI moved from experimentation to enterprise adoption. Australian organisations were suddenly dealing with massive unstructured data sets and needed platforms that could handle both traditional analytics and AI model training. Databricks'' unified Data Intelligence Platform — combining data engineering, data science, machine learning, and SQL analytics on a single lakehouse architecture — offered exactly what enterprises needed as they moved beyond proof-of-concept AI projects toward production deployment.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The company also invested heavily in public sector engagement, establishing Data and AI Academy programmes with both the Queensland and NSW State Governments. These programmes committed to upskilling more than 100 staff in each government on data analytics and AI — a move that simultaneously built government capability, created future demand for the platform, and demonstrated Databricks'' commitment to the Australian market beyond purely commercial interests.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-momentum-continues-anz-organisations-demand-more-ai-data" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a>, <a href="https://www.mi-3.com.au/31-03-2025/databricks-eyes-anz-expansion-demand-ai-and-data-intelligence-grows" target="_blank" rel="noopener noreferrer">Mi3</a></em></p>', 4, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Databricks'' ANZ numbers tell a story of rapid acceleration. For the fiscal year ending January 2024, the company reported over 70% year-over-year growth in ANZ — outpacing its global growth rate of approximately 50%. By 2025, ANZ growth remained above 60% year-over-year, with Beavis noting that ANZ organisations are now bringing AI projects that are "globally best in class." The company more than doubled its ANZ headcount over 2021-2023, reaching over 150 employees by September 2023, and announced plans to grow to more than 200 employees by end of 2025 — including an expansion of the field engineering team with solution architects to implement and support customer data and AI projects.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a>, <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-doubles-anz-headcount-signalling-growing-demand" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Customer wins have been substantial and span multiple industries. National Australia Bank (NAB) undertook a greenfield migration called Project Ada, building an entirely new cloud-based data and AI platform on Databricks and AWS. The two-year project ingested 16 data sources, transferred 456 use cases, and onboarded hundreds of users across 12 business units. NAB reported a 50% reduction in ingestion costs within the first year and a 30% increase in machine learning model performance. NAB subsequently won the Databricks GenAI Innovation Award for pioneering a generative AI-driven Personal Banker Assistant. Atlassian, another marquee customer, won the Data + AI Democratisation Award after using Databricks to enable 70% of its business users to access analytics and insights autonomously — replacing a system that was "complex, slow and expensive."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.fivetran.com/case-studies/national-australia-bank-enhances-customer-experiences-and-powers-genai" target="_blank" rel="noopener noreferrer">Fivetran / NAB Case Study</a>, <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-sees-over-70-annual-growth-anz-market-enterprise-ai" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Sportsbet, one of Australia''s largest online betting platforms, provides perhaps the most dramatic customer success story. Processing over 1.2 million customers making 25,000 bets every minute, Sportsbet built a real-time personalisation engine on Databricks and AWS that delivered 60% faster delivery times and a 30% productivity increase. The platform powers over 20 machine learning-driven applications, including the world''s first real-time intervention system for safer gambling. Between 2019 and 2021, Sportsbet grew its market share by more than seven points to above 50%, processing over one billion bets in 2021 with a peak of 65,000 bets per minute on Melbourne Cup Day.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.databricks.com/customers/sportsbet" target="_blank" rel="noopener noreferrer">Databricks Customer Story: Sportsbet</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Globally, Databricks has grown from US$1.6 billion in revenue (fiscal year ending January 2024) to a US$5.4 billion run-rate by early 2026, with AI workloads alone generating US$1.4 billion in annualised revenue. The company''s Series J funding in December 2024 raised US$10 billion in equity at a US$62 billion valuation, with Australia''s own Macquarie Capital among the investors — a significant endorsement from one of the country''s most prominent financial institutions. Subsequent rounds have pushed the valuation to US$134 billion, making Databricks one of the world''s most valuable private technology companies.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.prnewswire.com/news-releases/databricks-announces-15b-in-financing-to-attract-top-ai-talent-and-accelerate-global-expansion-302356888.html" target="_blank" rel="noopener noreferrer">PR Newswire</a>, <a href="https://sacra.com/c/databricks/" target="_blank" rel="noopener noreferrer">Sacra</a></em></p>', 4, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Databricks'' Australian expansion has not been without significant headwinds. Adam Beavis acknowledged publicly that "there was a learning curve with data intelligence when AI burst into the scene" — Australian enterprises were enthusiastic about AI but often lacked the foundational data architecture to support it. According to ADAPT''s 2025 research, Australian organisations are investing an average of AU$28 million per year in data and AI, yet only 24% have AI-ready data architectures. This gap between ambition and readiness meant Databricks'' sales cycles were often longer than expected, as customers needed to address foundational data quality and governance issues before they could effectively deploy AI workloads.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.mi-3.com.au/31-03-2025/databricks-eyes-anz-expansion-demand-ai-and-data-intelligence-grows" target="_blank" rel="noopener noreferrer">Mi3</a>, <a href="https://www.computerweekly.com/news/366635236/Databricks-predicts-AI-tipping-point-as-ANZ-firms-fix-data-issues" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>The skills shortage presents an ongoing constraint. The Governance Institute of Australia found that 93% of local organisations cannot effectively measure AI return on investment, and 88% struggle to integrate AI into legacy systems. For Databricks, this translated into a need to invest heavily in training — both for its own partner ecosystem and for customer organisations. The Data and AI Academy programmes with state governments are as much about creating future demand as they are about goodwill: without trained practitioners, even the best platform sits underutilised.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Data sovereignty has been a persistent concern for Australian enterprises evaluating cloud-based analytics platforms. With 78% of Australian CIOs listing regulatory compliance and data sovereignty among their top three board concerns (according to ADAPT''s 2025 CIO Edge Survey), Databricks has had to work within the constraints of its cloud provider partners — AWS, Azure, and Google Cloud — to ensure data remains within Australian jurisdictions. The Australian Bureau of Statistics makes Databricks available within its Secure Environment for Analysing Data (SEAD), but with strict controls: partners have no administrative access, and all administration is exclusively managed by the ABS. This level of caution reflects the broader market reality that Databricks must navigate.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.abs.gov.au/about/data-services/secure-environment-analysing-data-sead/user-guide/databricks" target="_blank" rel="noopener noreferrer">Australian Bureau of Statistics</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition for talent in the ANZ market has also been fierce. Scaling from a small team to over 200 employees required competing against well-resourced incumbents like AWS, Microsoft, Google, and Snowflake for experienced data engineers, solution architects, and enterprise sales professionals. The rapid pace of Databricks'' own product innovation created an additional challenge for partners: keeping up with constant platform updates and new capabilities required sustained enablement investment, and some partners struggled to maintain certified expertise as the product evolved.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.crn.com.au/news/2025/big-data-and-analytics/databricks-overhauls-partner-program-with-tight-focus-on-customer-value" target="_blank" rel="noopener noreferrer">CRN Australia</a></em></p>', 4, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Hire a country manager with deep local networks.</strong> Databricks'' appointment of Adam Beavis — with eight years at AWS and extensive relationships across Australian enterprise IT — gave the company immediate credibility and access that would have taken years to build organically. For any international company entering Australia, the single most impactful hire is a country leader who already has the trust of CIOs and CTOs in your target industries.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Build the partner ecosystem before scaling direct.</strong> Databricks'' approach of establishing consulting and integration partners before investing heavily in direct sales allowed it to validate product-market fit across Australian industries without the overhead of a large local team. By the time they scaled to 200+ employees, partners like Mantel Group were already delivering implementations and generating referrals. The 250-partner ANZ ecosystem now functions as a self-reinforcing growth engine.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Invest in community and events from day one.</strong> The Data Intelligence Days roadshows, the Data + AI World Tour Sydney, and the inaugural ANZ Data + AI Awards created a community around the Databricks platform that competitors found difficult to replicate. Customer award programmes — recognising NAB, Atlassian, and others — turned satisfied customers into public advocates, generating credibility that no marketing campaign could match.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Government engagement creates long-term market positioning.</strong> The Data and AI Academy programmes with Queensland and NSW State Governments may not generate immediate revenue, but they build platform familiarity among public sector decision-makers and create a pipeline of trained practitioners who will carry Databricks expertise into future roles. This is a patient, strategic play that pays dividends over years rather than quarters.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'databricks-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Address data readiness, not just data tools.</strong> The biggest lesson from Databricks'' ANZ experience is that selling a data platform into a market where 76% of organisations lack AI-ready data architectures requires a consultative approach. Success comes not from pushing product features but from helping customers build the foundational data governance and engineering capabilities they need before they can extract value from AI. Companies entering the Australian market with data or AI products should plan for longer sales cycles and invest in customer education as a core go-to-market activity.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.databricks.com/company/newsroom/press-releases/databricks-momentum-continues-anz-organisations-demand-more-ai-data" target="_blank" rel="noopener noreferrer">Databricks Newsroom</a>, <a href="https://www.mi-3.com.au/31-03-2025/databricks-eyes-anz-expansion-demand-ai-and-data-intelligence-grows" target="_blank" rel="noopener noreferrer">Mi3</a>, <a href="https://www.computerweekly.com/news/366635236/Databricks-predicts-AI-tipping-point-as-ANZ-firms-fix-data-issues" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 5, 'paragraph');
