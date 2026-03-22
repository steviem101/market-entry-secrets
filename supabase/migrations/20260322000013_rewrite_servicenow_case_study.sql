-- ============================================================================
-- SERVICENOW CASE STUDY DEEP REWRITE
-- ============================================================================

UPDATE public.content_items SET
  title = 'How ServiceNow Entered the Australian Market',
  subtitle = 'Growing faster in Australia than its 23% global rate: how ServiceNow built a booming partner ecosystem with Accenture, Deloitte, and 1,000+ new skilled professionals',
  read_time = 10,
  meta_description = 'Deep-dive case study on how ServiceNow grew faster in Australia than globally, built a partner ecosystem across 28 providers, and empowered enterprise IT transformation.',
  sector_tags = ARRAY['cloud-computing', 'enterprise-software', 'it-service-management', 'technology', 'saas', 'automation'],
  updated_at = NOW()
WHERE slug = 'servicenow-australia-market-entry';

UPDATE public.content_company_profiles SET
  industry = 'Cloud IT Service Management and Enterprise Automation',
  business_model = 'B2B SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'servicenow-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>ServiceNow built its Australian presence through a partner-led ecosystem strategy rather than a heavy direct sales approach. The company cultivated relationships with global consulting firms and local specialists to create a dense implementation network. Matt Bolton, ServiceNow''s senior channel director ANZ, described the regional operation as "an incredible success story," noting that partners impact more than 90% of the business on an annual basis. Due to Australia''s smaller market size, the ANZ channel strategy focuses on "quality, deep relationships with partners" across four categories: sales, service, technology, and service providers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.crn.com.au/news/servicenow-talks-2023-channel-strategy-amidst-search-for-aussie-partners-593188" target="_blank" rel="noopener noreferrer">CRN Australia</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>ServiceNow invested in talent development from the outset. In early 2022, the company committed to adding 1,000 new skilled professionals to the ANZ ecosystem and exceeded that target. The NextGen Professionals Programme makes training materials and curriculum available through institutions like NSW TAFE, developing certified talent for both customers and partners. This workforce investment created a pipeline of implementation professionals that enabled partner firms to scale their ServiceNow practices — a prerequisite for enterprise adoption across government, financial services, and healthcare.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>ServiceNow''s flexibility, scalability, and ease of use by non-technical employees became major differentiators. The platform''s power to accelerate automation across IT, HR, customer support, security, and compliance enabled transformative change in enterprise operations. The ISG Provider Lens 2023 report found ServiceNow "one of the biggest enterprise technology success stories of the past few years." The Australian ecosystem grew even faster than the global rate — with global revenue growing 23% in fiscal 2022, anecdotal evidence indicates the local ecosystem outpaced that growth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://ir.isg-one.com/news-market-information/press-releases/news-details/2023/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises/default.aspx" target="_blank" rel="noopener noreferrer">ISG</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The partner ecosystem is deep and diverse. Accenture, Capgemini, Deloitte, Enable, and Infosys were named Leaders across all three ISG quadrants. Accenture holds Global Elite status with over 23,000 ServiceNow certifications and 18,000 dedicated professionals globally, winning APJ Partner of the Year in 2023. Deloitte''s 2022 acquisition of Entrago — an Australian ServiceNow elite partner focused on health, government, and financial services — deepened its local capability. HCLTech, Kinetic IT, KPMG, and Wipro were Leaders in two quadrants each.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.accenture.com/au-en/services/ecosystem-partners/servicenow" target="_blank" rel="noopener noreferrer">Accenture</a>, <a href="https://www.deloitte.com/au/en/alliances/servicenow/about/turn-possibilities-progress-transformational-outcomes.html" target="_blank" rel="noopener noreferrer">Deloitte</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>ServiceNow''s global revenue grew 23% in fiscal 2022 (25.5% adjusted for constant currency), with the Australian market growing faster than the global rate. The 2023 ISG report evaluated 28 providers across three quadrants in Australia. Partners impact over 90% of ServiceNow''s ANZ business annually. The company exceeded its target of adding 1,000 new skilled professionals to the ANZ ecosystem. By 2025, ServiceNow evolved from ITSM into customer operations, global business services, and AI-powered workflow automation, with Accenture and other partners investing ahead of the market into these new spaces.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a>, <a href="https://www.crn.com.au/news/servicenow-talks-2023-channel-strategy-amidst-search-for-aussie-partners-593188" target="_blank" rel="noopener noreferrer">CRN Australia</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Rapid expansion caused partners to scramble to build resources to meet demand. Companies shifted from buying single ServiceNow modules to requiring integration across security, processes, IT service management, and operations management — increasing implementation complexity. Mergers and acquisitions among partners (such as Deloitte acquiring Entrago) signalled a maturing but consolidating ecosystem. The skills shortage meant experienced ServiceNow professionals commanded premium salaries, straining partner profitability.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition from Microsoft (Power Platform, Dynamics 365), Atlassian (Jira Service Management), and Freshworks created pressure at different market segments. The evolution from point solutions to integrated platforms meant ServiceNow needed to compete not just on ITSM but across HR, security, and customer service — areas where established competitors had deep expertise. The smaller Australian market size compared to the US also meant ServiceNow had to be selective about partner investments and direct coverage.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>A partner-led model scales faster in mid-sized markets.</strong> With partners impacting 90%+ of business, ServiceNow proved that investing in partner quality and depth rather than direct sales headcount is more effective in Australia''s smaller market. The 1,000+ new professionals added through training programmes created implementation capacity that direct hiring alone could not match.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Platform evolution must stay ahead of customer ambition.</strong> Australian enterprises moved from single-module purchases to cross-domain integration faster than expected. Companies entering Australia with platform products should anticipate that successful customers will demand broader capabilities quickly — and have the roadmap ready to deliver.</p>', 2, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'servicenow-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Invest in workforce development to create your own talent pipeline.</strong> ServiceNow''s NextGen programme with NSW TAFE created certified professionals who joined both the company and its partner ecosystem. In a market with acute technology skills shortages, creating your own talent pipeline through vocational training partnerships is a strategic investment, not a cost centre.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.businesswire.com/news/home/20230330005821/en/ServiceNows-Rapid-Rise-Empowers-Australian-Enterprises" target="_blank" rel="noopener noreferrer">BusinessWire</a>, <a href="https://www.crn.com.au/news/servicenow-talks-2023-channel-strategy-amidst-search-for-aussie-partners-593188" target="_blank" rel="noopener noreferrer">CRN Australia</a></em></p>', 3, 'paragraph');
