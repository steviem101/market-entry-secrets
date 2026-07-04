-- ============================================================================
-- SALESFORCE CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Salesforce Entered the Australian Market',
  subtitle = 'From a 2004 Sydney office to Salesforce Tower, a $2.5 billion investment, and an ecosystem projected to create 245,000 jobs by 2028',
  read_time = 12,
  meta_description = 'Deep-dive case study on how Salesforce built a 2,400+ employee Australian operation since 2004, launched Agentforce AI, and invested $2.5B in the market.',
  sector_tags = ARRAY['cloud-computing', 'crm', 'ai', 'enterprise-software', 'saas', 'technology'],
  updated_at = NOW()
WHERE slug = 'salesforce-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Cloud CRM and Enterprise AI Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2004',
  outcome = 'successful',
  employee_count = 2400,
  business_model = 'B2B SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry');

-- 3. Delete existing sections
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Salesforce established its first Australian office in Sydney in 2004, just five years after being founded in San Francisco. It was one of the company''s earliest international offices, reflecting the strategic importance of the Australian enterprise market. The early entry — well before cloud CRM was mainstream — gave Salesforce two decades to build relationships, train the ecosystem, and establish market leadership before the current wave of AI competition.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://invest.nsw.gov.au/news/2019/case-study-salesforce" target="_blank" rel="noopener noreferrer">Invest NSW</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Salesforce''s physical commitment to Australia escalated dramatically in 2022 with the opening of Salesforce Tower Sydney — a 55-storey, 263-metre skyscraper at 180 George Street, Circular Quay, designed by Foster + Partners. It is Sydney''s tallest office tower. Salesforce moved into 13 floors in mid-2023, making it both a practical headquarters and a symbolic anchor with a customer Innovation Center and an Ohana Floor for community nonprofits. The company also operates offices in Melbourne and Brisbane.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.salesforce.com/au/blog/announcing-salesforce-tower-sydney-doors-open-in-2022/" target="_blank" rel="noopener noreferrer">Salesforce Blog</a>, <a href="https://www.lendlease.com/au/media-centre/media-releases/sydneys-tallest-office-tower-marks-official-completion/" target="_blank" rel="noopener noreferrer">Lendlease</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>In February 2025, Salesforce announced a US$2.5 billion (approximately AU$3.9 billion) investment over five years at the Agentforce World Tour Sydney. The investment covers AI innovation, workforce development, and sustainability aligned with Australia''s National AI Capability Plan. Part of the investment flows through Salesforce Ventures, which has backed Australian startups including Airwallex, GO1, Culture Amp, Reejig, and Q-CTRL — a combined portfolio market capitalisation exceeding AU$12 billion. ANZ leadership is headed by Frank Fillmann, EVP and General Manager, who oversees a business unit generating over US$500 million annually.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.salesforce.com/au/news/press-releases/2025/02/26/salesforce-australia-investment-2025/" target="_blank" rel="noopener noreferrer">Salesforce Press</a>, <a href="https://www.mi-3.com.au/26-02-2025/salesforce-commits-us25-billion-ai-and-sustainability-australia" target="_blank" rel="noopener noreferrer">Mi3</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The Agentforce AI platform — unveiled globally at Dreamforce 2024 — was brought to Australia via roadshows in Sydney (October 2024) and Melbourne (November 2024) with hands-on prototyping sessions. A permanent AI training centre in Sydney was announced for 2025. Salesforce localises its global playbook through events including Salesforce Live: Australia, Agentforce Summit Sydney, Learning Days and Hackathons across three cities, and "Dreamforce Decoded: For Aussies & Kiwis" virtual sessions — rather than expecting customers to travel to San Francisco.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.smartcompany.com.au/technology/artificial-intelligence/salesforce-sydney-melbourne-ai-roadshow/" target="_blank" rel="noopener noreferrer">SmartCompany</a>, <a href="https://8squad.com.au/insight/dreamforce-2024-agentforce-is-here/" target="_blank" rel="noopener noreferrer">8Squad</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Salesforce''s 2,400+ Australian employees and extensive partner ecosystem have created deep market penetration across industries. Key customer wins include Telstra — which migrated 20,000+ frontline agents onto Salesforce, replacing its legacy Siebel CRM — Flight Centre, Canva, hipages (now using Agentforce to reshape operations), Scape, and the NRL. With 19.5% global CRM market share as of 2020 — more than SAP, Oracle, Microsoft, and Adobe combined — Salesforce entered the AI era from a position of dominance in Australia''s CRM software market, projected at AU$1.67 billion by 2025.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.salesforce.com/au/customer-success-stories/telstra/" target="_blank" rel="noopener noreferrer">Salesforce Telstra</a>, <a href="https://www.itnews.com.au/news/telstra-expands-its-use-of-salesforce-529673" target="_blank" rel="noopener noreferrer">iTnews</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The Agentforce launch addressed a specific Australian pain point. A YouGov poll of 300 Australian C-suite executives found 81% said generative AI integration is critical and 38% identified it as their top priority. Frank Fillmann cited "low productivity growth, a tight labour market and higher than ever customer expectations" as key challenges. Agentforce — positioned as "the Third Wave of AI" beyond copilots — directly addresses Australia''s labour shortage by automating customer service, sales, and operations workflows. Over 270 Australian companies are already using Salesforce AI products.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.eweek.com/news/ai-australia-salesforce-agentforce/" target="_blank" rel="noopener noreferrer">eWeek</a>, <a href="https://www.mi-3.com.au/10-10-2024/under-pressure-ai-all-sides-70-ceos-tell-salesforces-anz-boss-what-they-need-greenlight" target="_blank" rel="noopener noreferrer">Mi3</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Venture capital investments have deepened Salesforce''s roots in the Australian tech ecosystem beyond its core CRM product. Salesforce Ventures has backed companies including Airwallex (cross-border payments), Culture Amp (employee experience), GO1 (corporate learning), Reejig (workforce intelligence), and Q-CTRL (quantum computing). This strategy creates ecosystem lock-in and goodwill — backed companies become Salesforce customers and advocates, and their success reinforces the narrative that Salesforce supports Australian innovation.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.salesforce.com/au/news/press-releases/2025/02/26/salesforce-australia-investment-2025/" target="_blank" rel="noopener noreferrer">Salesforce Press</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Salesforce''s Australian operation generates approximately US$500 million annually and employs over 2,400 people. The US$2.5 billion five-year investment commitment covers AI innovation, workforce development, and sustainability programmes. An IDC study projects the broader Salesforce ecosystem in Australia will create over 245,000 jobs and generate AU$46 billion in business revenue by 2028. Globally, the Salesforce economy is projected to produce US$2.02 trillion in revenue and 11.6 million jobs between 2022 and 2028.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.salesforce.com/au/news/stories/ai-jobs-revenue/" target="_blank" rel="noopener noreferrer">Salesforce / IDC</a>, <a href="https://www.mi-3.com.au/26-02-2025/salesforce-commits-us25-billion-ai-and-sustainability-australia" target="_blank" rel="noopener noreferrer">Mi3</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Fillmann set a target of meeting 100 Australian CEOs in 2024 and reached 70 in six months, reflecting the company''s enterprise-first approach. Anne Templeman-Jones was appointed as the first Australian member of Salesforce''s Global Advisory Board. Over 270 Australian companies use Salesforce AI products, and 21 years of workforce development through the free Trailhead learning platform, university partnerships, and vocational training collaborations have built a deep pool of certified professionals across the country.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.mi-3.com.au/10-10-2024/under-pressure-ai-all-sides-70-ceos-tell-salesforces-anz-boss-what-they-need-greenlight" target="_blank" rel="noopener noreferrer">Mi3</a>, <a href="https://crm.consulting/blog/salesforce-ecosystem-australia-new-zealand" target="_blank" rel="noopener noreferrer">CRM Consulting</a></em></p>', 2, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Microsoft represents the most significant competitive threat. Microsoft committed AU$5 billion to Australian AI and cloud infrastructure in 2023 — its largest investment in 40 years — and Dynamics 365 offers lower pricing at scale with combined CRM/ERP capabilities. Azure''s OpenAI partnership gives Microsoft a compelling AI narrative that challenges Salesforce''s Agentforce positioning. Google is also expanding its Australian enterprise presence aggressively.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>At the other end of the market, HubSpot and Zoho are encroaching on Salesforce''s dominance. HubSpot holds 24.2% share of voice in AI-powered CRM search results versus Salesforce''s 31.4%, growing strongly among SMBs. Zoho has 21% share of voice. Some Australian companies have switched away from Salesforce citing cost and complexity — the platform''s high licensing and customisation costs strain budgets, and the steep learning curve makes onboarding difficult. Among Australian C-suite executives, 31% cite implementation cost, 29% lack of technical expertise, and 27% security concerns as barriers to AI adoption.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.athenahq.ai/blog/salesforce-vs-hubspot-whos-dominating-crm-ai-search-athenahq-breakdown" target="_blank" rel="noopener noreferrer">AthenaHQ</a>, <a href="https://www.eweek.com/news/ai-australia-salesforce-agentforce/" target="_blank" rel="noopener noreferrer">eWeek</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Australia''s tight labour market compounds the challenge. Fillmann noted that CEOs face pressure from four sides simultaneously — boards, customers, competitors, and employees — all demanding AI transformation. The skilled workforce needed to implement and maintain Salesforce deployments is in high demand across the technology sector, creating retention challenges and project delays for both Salesforce and its partners.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.mi-3.com.au/10-10-2024/under-pressure-ai-all-sides-70-ceos-tell-salesforces-anz-boss-what-they-need-greenlight" target="_blank" rel="noopener noreferrer">Mi3</a></em></p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Twenty years of presence creates insurmountable trust.</strong> Salesforce''s 2004 entry — two decades before the current AI race — gave it time to build deep relationships, train the ecosystem, and establish market leadership. When Agentforce launched, Salesforce wasn''t introducing itself to Australian enterprises; it was extending an existing trusted relationship. Companies entering Australia should think in decades, not quarters.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Ecosystem jobs matter more than your own headcount.</strong> Salesforce''s 2,400 employees are dwarfed by the 245,000 ecosystem jobs projected by 2028. The partner network of consulting firms, system integrators, and ISVs creates a self-reinforcing growth engine. For companies entering Australia, building an ecosystem of certified partners is more scalable than hiring a large direct team.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Iconic physical presence signals long-term commitment.</strong> Salesforce Tower Sydney is both a practical headquarters and a statement of intent. Housing an Innovation Center and community Ohana Floor, it signals that Salesforce is not just selling software but investing in the Australian business community. For companies entering Australia, a visible physical presence — particularly in premium locations — communicates commitment that remote operations cannot match.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Frame AI as a solution to local pain points, not a global product launch.</strong> Agentforce was positioned specifically to address Australia''s productivity crisis and labour shortage — leading with customer experience improvements rather than pure cost-cutting. Fillmann''s 70 CEO meetings in six months ensured the product message was shaped by local needs. Companies launching AI products in Australia should lead with the problem being solved, not the technology being deployed.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Venture investments create ecosystem lock-in beyond the core product.</strong> Backing Australian startups like Airwallex, Culture Amp, and GO1 through Salesforce Ventures creates goodwill, deal flow, and platform adoption that extends far beyond CRM. Companies with corporate venture arms should actively invest in Australian startups to deepen their market roots and create advocates across the technology ecosystem.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.salesforce.com/au/news/press-releases/2025/02/26/salesforce-australia-investment-2025/" target="_blank" rel="noopener noreferrer">Salesforce Press</a>, <a href="https://www.mi-3.com.au/26-02-2025/salesforce-commits-us25-billion-ai-and-sustainability-australia" target="_blank" rel="noopener noreferrer">Mi3</a></em></p>', 5, 'paragraph');
