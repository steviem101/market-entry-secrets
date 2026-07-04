-- ============================================================================
-- OPENAI CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How OpenAI Entered the Australian Market',
  subtitle = 'From Sam Altman''s 2023 Melbourne visit to a Sydney headquarters, A$7 billion data centre deal, and partnerships training 1.2 million Australian workers',
  read_time = 12,
  meta_description = 'Deep-dive case study on how OpenAI entered Australia with a Sydney office, NextDC sovereign AI data centre, VC startup programs, and enterprise partnerships with CommBank, Coles, and Wesfarmers.',
  sector_tags = ARRAY['ai', 'technology', 'artificial-intelligence', 'saas', 'enterprise-software', 'machine-learning'],
  updated_at = NOW()
WHERE slug = 'openai-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Artificial Intelligence Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2025',
  outcome = 'successful',
  business_model = 'B2B SaaS / API Platform / Subscription'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry');

-- 3. Delete existing sections (CASCADE deletes content_bodies)
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>OpenAI''s Australian story began on 16 June 2023, when CEO Sam Altman visited Melbourne as the final stop on a 22-country world tour. "A Conversation With Sam Altman," presented by The Startup Network at the Melbourne Convention and Exhibition Centre, sold out all 2,200 tickets. During the visit, Altman met then-Minister for Industry and Science Ed Husic and signalled that OpenAI planned to "provide more support for startups via early access to models" and "do more in Australia." The personal connection ran deep — Altman''s husband, Oliver Mulherin, is an Australian and former University of Melbourne computer science student.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://thechainsaw.com/artificial-intelligence/chatgpt-sam-altman-melbourne-australia-openai/" target="_blank" rel="noopener noreferrer">The Chainsaw</a>, <a href="https://www.propelventures.com.au/insights/sam-altman-melbourne" target="_blank" rel="noopener noreferrer">Propel Ventures</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Before opening an office, OpenAI laid extensive groundwork through 2025. Senior executives spent several days in Canberra meeting government ministers and the broader tech and university community. The company hired Will Snell, a former Google executive, as its ANZ go-to-market lead in February 2025, and engaged Kate Pounder — founding CEO of the Tech Council of Australia and co-founder of consulting firm AlphaBeta — as its Australian policy liaison. In July 2025, OpenAI released an "Economic Blueprint for Australia" with Mandala Partners (AlphaBeta''s successor), claiming AI could deliver A$115 billion in annual economic gains by 2030. The report recommended tax breaks for AI adopters, a national upskilling programme, and treating data centres as critical infrastructure.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.capitalbrief.com/article/openai-taps-former-tech-council-ceo-kate-pounder-as-lobbying-machine-takes-shape-aff6b138-feb9-4590-b39d-59ca18edc25d/" target="_blank" rel="noopener noreferrer">Capital Brief</a>, <a href="https://openai.com/global-affairs/openais-australia-economic-blueprint/" target="_blank" rel="noopener noreferrer">OpenAI</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The formal Sydney office announcement came in August 2025, following discussions between OpenAI executives, Australia''s US Ambassador Kevin Rudd, and Assistant Minister Andrew Charlton in San Francisco. The office opened in December 2025 with a launch event at Sydney''s Museum of Contemporary Art, attended by NSW Treasurer Daniel Mookhey. Chief Strategy Officer Jason Kwon described the office as demonstrating "the company''s long-term commitment." Simultaneously, OpenAI announced "OpenAI for Australia" — the first OpenAI for Countries programme in the Asia-Pacific region — joining existing offices in Singapore and Tokyo across the APAC region.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://openai.com/global-affairs/openai-for-australia/" target="_blank" rel="noopener noreferrer">OpenAI</a>, <a href="https://www.bandt.com.au/openai-opens-first-australian-office/" target="_blank" rel="noopener noreferrer">B&T</a>, <a href="https://www.smartcompany.com.au/artificial-intelligence/openai-australia-startup-program-sydney-office/" target="_blank" rel="noopener noreferrer">SmartCompany</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>OpenAI complemented its direct presence with a startup programme in partnership with six Australian venture capital firms: Blackbird, Square Peg, AirTree, January Capital, NextGen Ventures, and Boab AI. Participating founders receive up to USD $15,000 in API credits, technical mentorship from OpenAI engineers, and workshops on scaling, compliance, and safety. The company also launched an annual "Founder Day" in Australia. Jason Kwon cited Canva and Atlassian as evidence that Australia is "home to some of the world''s most successful tech companies."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.smartcompany.com.au/artificial-intelligence/openai-australia-startup-program-sydney-office/" target="_blank" rel="noopener noreferrer">SmartCompany</a>, <a href="https://www.capitalbrief.com/briefing/openai-launches-startup-program-with-six-vcs-d921b1ac-8833-44c1-a4b4-51104074aa10/" target="_blank" rel="noopener noreferrer">Capital Brief</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Australia punches well above its weight in AI adoption. Around 45% of Australians have tried generative AI, with 22% using ChatGPT regularly. Australia accounts for roughly 2% of ChatGPT''s global traffic despite representing only 0.33% of the world''s population — a 6x overrepresentation. Active Australian users more than doubled in one year, and the country ranks among the top ten markets globally for both paid ChatGPT users and developers. This organic demand gave OpenAI a strong foundation before any formal market entry.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.pathfindermarketing.com.au/chatgpt-statistics/" target="_blank" rel="noopener noreferrer">Pathfinder Marketing</a>, <a href="https://roi.com.au/blog/stats/chatgpt-in-australia-2026-usage-context-and-practical-impact" target="_blank" rel="noopener noreferrer">ROI.com.au</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>OpenAI secured partnerships with some of Australia''s largest companies immediately upon launch. Commonwealth Bank signed a multi-year strategic partnership, rolling out ChatGPT Enterprise to its 52,000 workforce — one of the largest deployments in global financial services. CBA''s engineering teams are collaborating with OpenAI on fraud detection, and CommBank will make OpenAI Academy training available to one million small business customers. Coles and Wesfarmers — each employing over 100,000 Australians — signed up for tailored AI training programmes. Other early adopters include Virgin Australia, Fortescue, REA Group, and La Trobe University.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.commbank.com.au/articles/newsroom/2025/08/tech-ai-partnership.html" target="_blank" rel="noopener noreferrer">CommBank Newsroom</a>, <a href="https://openai.com/index/commonwealth-bank-of-australia/" target="_blank" rel="noopener noreferrer">OpenAI</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The A$7 billion memorandum of understanding with NextDC for a sovereign AI data centre at Eastern Creek in Western Sydney was a landmark infrastructure commitment. The 550MW facility — potentially the most powerful in the southern hemisphere — is engineered to Australia''s Security of Critical Infrastructure (SOCI) framework. Phase one is targeted for the second half of 2027. Treasurer Jim Chalmers called it "a terrific outcome for our economy." The deal directly addressed the single biggest enterprise and government objection to cloud AI: data leaving Australia.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://ia.acs.org.au/article/2025/openai--nextdc-ink--7b-australian-data-centre-deal.html" target="_blank" rel="noopener noreferrer">Information Age</a>, <a href="https://datacentremagazine.com/news/how-will-nextdc-ai-campus-drive-openai-for-australia" target="_blank" rel="noopener noreferrer">Data Centre Magazine</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>OpenAI also invested in government relationships from the outset. The company won its first federal government contract — a $50,000 deal with Treasury — followed by a $25,000 contract with the Commonwealth Grants Commission, both under the $80,000 threshold requiring competitive tender. Senior executives met with the Office of National Intelligence for a two-hour briefing. By partnering with six VC firms, OpenAI ensured the next generation of Australian startups would build on its platform by default, creating long-term ecosystem lock-in.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.startupdaily.net/topic/politics-news-analysis/openai-lobbied-canberra-before-landing-in-australia-and-had-some-wins-especially-on-guardrails/" target="_blank" rel="noopener noreferrer">Startup Daily</a></em></p>', 4, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>OpenAI''s global scale provides formidable momentum for its Australian operation. As of early 2026, the company has 910 million weekly active users (up from 500 million in April 2025), over 9 million paying business users, and annualised revenue of approximately US$25 billion — up from US$3.7 billion in 2024. A February 2026 funding round of US$110 billion from SoftBank, Nvidia, and Amazon valued the company at US$730 billion pre-money. 92% of Fortune 500 companies use ChatGPT products.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://sacra.com/c/openai/" target="_blank" rel="noopener noreferrer">Sacra</a>, <a href="https://www.feedough.com/openai-statistics/" target="_blank" rel="noopener noreferrer">Feedough</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>In Australia specifically, OpenAI is a top-ten market globally for both paid users and developers. Active users more than doubled year-over-year, and enterprise adoption surged 143% across international markets including Australia. The Australian government''s AI Adoption Tracker reports over one-third of Australian businesses are now using or trialling AI. Australia''s 2% share of global ChatGPT traffic — six times its population share — reflects unusually strong organic demand.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://openai.com/global-affairs/openai-for-australia/" target="_blank" rel="noopener noreferrer">OpenAI</a>, <a href="https://www.industry.gov.au/news/ai-adoption-australian-businesses-2025-q1" target="_blank" rel="noopener noreferrer">Australian Government</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>The combined workforce training initiative with CommBank, Coles, and Wesfarmers aims to upskill 1.2 million Australian workers starting in 2026 — one of the largest coordinated AI-skills programmes in the country''s history. This addresses a real gap: the COSBOA Small Business Perspectives Report found 48% of Australian businesses are not currently using AI, while Deloitte''s 2026 State of AI in the Enterprise report found only 28% of Australian companies have moved more than 40% of AI pilots into production.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itbrief.com.au/story/openai-unveils-nationwide-ai-push-skills-drive-for-australia" target="_blank" rel="noopener noreferrer">IT Brief</a>, <a href="https://www.deloitte.com/au/en/issues/generative-ai/state-of-ai-in-enterprise.html" target="_blank" rel="noopener noreferrer">Deloitte Australia</a></em></p>', 3, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Australia has no dedicated AI legislation, and the regulatory landscape has been shifting. Former Minister Ed Husic proposed 10 mandatory guardrails for high-risk AI in September 2024, but by December 2025 the National AI Plan had abandoned them entirely in favour of a "technology-neutral" approach relying on existing laws. Privacy Act reforms with automated decision-making transparency obligations passed in 2024 but don''t take effect until December 2026. The government allocated AUD $29.9 million for an AI Safety Institute in early 2026, but the regulatory environment remains uncertain for companies seeking clear compliance frameworks.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://iapp.org/resources/article/global-ai-governance-australia" target="_blank" rel="noopener noreferrer">IAPP</a>, <a href="https://www.kwm.com/global/en/insights/latest-thinking/ai-regulation-is-coming-to-australia-what-you-need-to-know.html" target="_blank" rel="noopener noreferrer">King & Wood Mallesons</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition in Australia is fierce. Google''s Gemini app has 650 million monthly active users globally, and Anthropic has captured 40% of enterprise LLM spending — up from 12% in 2023 — while OpenAI''s enterprise market share declined from 50% to 34% over the same period. In coding use cases specifically, Anthropic leads with 54% market share versus OpenAI''s 21%. Sam Altman issued an internal "code red" memo refocusing the company on ChatGPT in response to competitive pressure. Both Anthropic and Google are actively pursuing Australian enterprise customers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.cnbc.com/2025/12/02/open-ai-code-red-google-anthropic.html" target="_blank" rel="noopener noreferrer">CNBC</a>, <a href="https://www.marketingaiinstitute.com/blog/openai-code-red" target="_blank" rel="noopener noreferrer">Marketing AI Institute</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Public trust remains a significant headwind. Only 30% of Australians believe the benefits of AI outweigh its risks, and 78% express concern about negative outcomes. Leading Australian AI expert Professor Toby Walsh has been publicly critical, noting that OpenAI deployed "weaker, not stronger, guardrails" and citing safety incidents. Walsh also highlighted that Canada has invested six times more than Australia in AI over the past five years, and Singapore — with less than a quarter of Australia''s population — has invested fifteen times more, suggesting Australia risks falling behind as a market for advanced AI deployment.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://newshub.medianet.com.au/2026/02/dangerously-unprepared-australias-leading-ai-expert-delivers-urgent-warning/141289/" target="_blank" rel="noopener noreferrer">News Hub</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>OpenAI''s lobbying activities attracted scrutiny. FOI documents revealed the company''s engagement with government was more extensive than publicly known, with briefings warning OpenAI "may seek Australia''s co-investment in US-based infrastructure and press Australia to walk back certain proposed regulatory settings, including on copyright, privacy law and accountability." The A$115 billion economic claim was challenged by University of Sydney researchers who noted US studies found generative AI translates to less than 5% of work hours and under 1% labour productivity increase. Treasury briefings were "much less confident" than OpenAI''s projections.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.crikey.com.au/2026/02/19/openai-lobbied-change-australias-laws/" target="_blank" rel="noopener noreferrer">Crikey</a>, <a href="https://theconversation.com/big-tech-says-ai-could-boost-australias-economy-by-115-billion-a-year-does-the-evidence-stack-up-260705" target="_blank" rel="noopener noreferrer">The Conversation</a></em></p>', 4, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Lead with an economic narrative before arriving.</strong> OpenAI''s Economic Blueprint — released months before the office opened — framed AI as a A$115 billion opportunity and set the terms of public debate. Commissioning a local consulting firm gave the narrative Australian credibility. For any company entering Australia, establishing an economic case through local voices before formal launch creates momentum and political goodwill.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Anchor to flagship enterprise customers immediately.</strong> Partnering with CommBank (52,000 employees, 17 million customers), Coles, and Wesfarmers gave OpenAI instant credibility and created a cascading training programme reaching 1.2 million workers. These aren''t just customers — they''re distribution channels for adoption. Companies entering Australia should secure two or three household-name partnerships before or at launch to establish trust across the market.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Address data sovereignty with concrete infrastructure commitments.</strong> The A$7 billion NextDC data centre MoU addressed the single biggest enterprise and government objection — data leaving Australia — while aligning with the government''s critical infrastructure agenda. Abstract commitments to "local data residency" are insufficient; Australian enterprises and government agencies expect specific, verifiable infrastructure investments before they will move sensitive workloads onto a platform.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Engage VCs to create an ecosystem moat.</strong> Partnering with Blackbird, AirTree, Square Peg, and three other VC firms means the next generation of Australian startups builds on OpenAI''s platform by default. This strategy creates long-term lock-in at the ecosystem level — a more durable competitive advantage than any individual enterprise deal.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Expect and prepare for backlash.</strong> OpenAI faced criticism on lobbying transparency, inflated economic claims, copyright concerns, health data sovereignty, and AI safety. FOI requests and investigative journalism exposed the full extent of government engagement. Companies entering Australia should anticipate scrutiny from investigative outlets and academic critics, and ensure their public claims can withstand independent analysis. Hiring politically connected lobbyists opens doors but also creates perception risks that will be made public.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.crikey.com.au/2026/02/19/openai-lobbied-change-australias-laws/" target="_blank" rel="noopener noreferrer">Crikey</a>, <a href="https://www.startupdaily.net/topic/politics-news-analysis/openai-lobbied-canberra-before-landing-in-australia-and-had-some-wins-especially-on-guardrails/" target="_blank" rel="noopener noreferrer">Startup Daily</a></em></p>', 5, 'paragraph');
-- ============================================================================
-- ANTHROPIC CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Anthropic Entered the Australian Market',
  subtitle = 'From quiet charm offensive to Sydney office: how the safety-focused AI lab captured 40% of enterprise LLM spending and made Australia its 4th-ranked global market',
  read_time = 12,
  meta_description = 'Deep-dive case study on how Anthropic entered Australia through relationship-first strategy, cloud partnerships with AWS and Google, and enterprise wins with CBA and Canva.',
  sector_tags = ARRAY['ai', 'technology', 'artificial-intelligence', 'saas', 'enterprise-software', 'machine-learning'],
  updated_at = NOW()
WHERE slug = 'anthropic-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'AI Safety and Enterprise AI Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2026',
  outcome = 'successful',
  business_model = 'B2B SaaS / API Platform / Subscription'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry');

-- 3. Delete existing sections (CASCADE deletes content_bodies)
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>While OpenAI launched its Sydney office in December 2025 with a high-profile event at the Museum of Contemporary Art, Anthropic took a markedly different approach. Capital Brief described it as a "quiet charm offensive" — for months, the company wooed VCs and ecosystem figures, flew executives in to meet founders, filed subsidiary paperwork through Baker McKenzie''s Barangaroo offices, and posted Sydney job advertisements starting November 2025. The contrast with OpenAI''s splashy launch was deliberate: Anthropic prioritised building deep relationships before making any public announcement.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.capitalbrief.com/article/anthropic-quietly-begins-its-australian-charm-offensive-398a6aaf-680f-4026-b222-ac32c6d3d066/" target="_blank" rel="noopener noreferrer">Capital Brief</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>A key strategic move was securing former US Ambassador to Australia Jeffrey Bleich as a director of the Australian subsidiary. Bleich served as ambassador from 2009 to 2013 under President Obama and now serves as Anthropic''s General Counsel. His deep ties to Australian political, business, and diplomatic circles gave Anthropic an immediate bridge to the market. Anthropic also became a major sponsor of Blackbird''s Sunrise 2026 conference — Australia''s premier startup festival — with product team members speaking on stage, embedding the company in the local startup ecosystem without the overhead of a standalone launch event.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.innovationaus.com/former-us-ambassador-fronts-anthropic-aussie-push/" target="_blank" rel="noopener noreferrer">InnovationAus</a>, <a href="https://www.thesunrise.live/" target="_blank" rel="noopener noreferrer">Sunrise</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>On 10 March 2026, Anthropic formally announced its Sydney office — its fourth in Asia-Pacific alongside Tokyo, Bengaluru, and Seoul. The company is hiring a local team, seeking a country manager for ANZ, and posted a Public Policy role for Australia. Rather than building its own Australian infrastructure immediately, Anthropic leveraged cloud partnerships as distribution channels. Over two-thirds of Anthropic''s global revenue flows through Amazon Web Services, where Claude is available on Bedrock within existing AWS accounts, VPCs, and IAM controls. Claude is also available on Google Cloud Vertex AI, and is the only frontier AI model available on all three major clouds (AWS, Google Cloud, and Microsoft Azure).</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.anthropic.com/news/sydney-fourth-office-asia-pacific" target="_blank" rel="noopener noreferrer">Anthropic</a>, <a href="https://www.bloomberg.com/news/articles/2026-03-10/anthropic-expands-into-australia-new-zealand-with-sydney-office" target="_blank" rel="noopener noreferrer">Bloomberg</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Anthropic is also exploring adding local compute capacity through third-party partners in Australia, citing demand from enterprises and government agencies with data residency requirements. While this lags OpenAI''s concrete A$7 billion NextDC commitment, it reflects a pragmatic approach — using existing cloud infrastructure to serve the market now while evaluating the right long-term infrastructure investment.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://seekingalpha.com/news/4563040-anthropic-to-open-office-in-sydney-mulls-boosting-compute-capacity-in-australia" target="_blank" rel="noopener noreferrer">Seeking Alpha</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Claude''s technical performance has been a primary driver of adoption. Claude Opus 4.6, released in March 2026, scored 80.8% on SWE-Bench Verified for coding — narrowly leading Gemini 3.1 Pro (80.6%) and GPT-5.2 (80.0%). On the GDPval-AA human preference leaderboard for expert-level office work, Claude leads with 1,606 Elo versus Gemini''s 1,317 — a 144-point advantage over GPT-5.2. On LM Council, Opus 4.6 leads at 78.7% overall and 90.5% on reasoning tasks. In Australia specifically, developer adoption has been exceptionally strong.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://evolink.ai/blog/gpt-5-4-vs-claude-opus-4-6-vs-gemini-3-1-pro-2026" target="_blank" rel="noopener noreferrer">Evolink</a>, <a href="https://lmcouncil.ai/benchmarks" target="_blank" rel="noopener noreferrer">LM Council</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Claude Code has been a breakout product. In the Pragmatic Engineer Survey of 15,000 developers in February 2026, 46% named Claude Code their "most loved" coding tool — more than double Cursor (19%) and five times GitHub Copilot (9%). 73% of engineering teams now use AI coding tools daily, up from 41% in 2025. Claude Code went from zero to US$2.5 billion in annualised revenue in approximately nine months, reaching US$1 billion in run-rate faster than any AI coding tool in history. Microsoft has widely adopted Claude Code internally, even for non-developer roles.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.gradually.ai/en/claude-code-statistics/" target="_blank" rel="noopener noreferrer">Gradually.ai</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Australia ranks 4th globally — and New Zealand 8th — in Claude.ai usage relative to population, according to Anthropic''s Economic Index. Both countries show particularly strong use for computer and coding tasks, educational instruction, and research. Key Australian enterprise customers include Canva, Quantium, and Commonwealth Bank of Australia, with growing adoption among startups in AgTech, physical AI, and climate tech. CBA''s CTO Rodrigo Castillo noted that "Claude''s advanced capabilities, combined with Anthropic''s commitment to safety, are central to our purpose of harnessing AI responsibly."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.anthropic.com/news/sydney-fourth-office-asia-pacific" target="_blank" rel="noopener noreferrer">Anthropic</a>, <a href="https://www.smartcompany.com.au/artificial-intelligence/anthropic-launches-financial-services-claude-model-commonwealth-bank/" target="_blank" rel="noopener noreferrer">SmartCompany</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Anthropic now commands 40% of enterprise LLM spending globally (per Menlo Ventures, December 2025), up from 12% in 2023, while OpenAI declined from 50% to 27% over the same period. Eight of the Fortune 10 are Claude customers, and over 500 customers spend US$1 million or more annually. The US$100 million Claude Partner Network — including Accenture, Deloitte, McKinsey, BCG, Bain, PwC, and WPP — provides implementation capacity that extends Anthropic''s reach without proportional headcount investment.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.androidheadlines.com/2026/03/anthropic-vs-openai-businesses-market-share-2026-analysis.html" target="_blank" rel="noopener noreferrer">Android Headlines</a>, <a href="https://www.anthropic.com/news/claude-partner-network" target="_blank" rel="noopener noreferrer">Anthropic</a></em></p>', 4, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Anthropic''s growth trajectory has been extraordinary. The company closed a US$30 billion Series G in February 2026 at a US$380 billion post-money valuation — the second-largest venture capital deal ever. Total funding raised exceeds US$64 billion. The valuation trajectory — US$61.5 billion in March 2025, US$183 billion in September 2025, US$380 billion in February 2026 — reflects the speed at which enterprise AI adoption has accelerated globally and in markets like Australia.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.anthropic.com/news/anthropic-raises-30-billion-series-g-funding-380-billion-post-money-valuation" target="_blank" rel="noopener noreferrer">Anthropic</a>, <a href="https://www.cnbc.com/2026/02/12/anthropic-closes-30-billion-funding-round-at-380-billion-valuation.html" target="_blank" rel="noopener noreferrer">CNBC</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Revenue has grown 10x annually for three consecutive years: US$1 billion annualised in December 2024, US$4 billion in July 2025, US$9 billion in December 2025, and approximately US$19 billion by March 2026. Internal projections target a US$26 billion run-rate by the end of 2026. Over 300,000 business customers generate 85% of revenue, with customers spending US$100,000 or more annually growing 7x year-over-year. Anthropic generates approximately US$211 per monthly user versus OpenAI''s approximately US$25 per weekly user — an 8x monetisation advantage reflecting its enterprise focus.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://sacra.com/c/anthropic/" target="_blank" rel="noopener noreferrer">Sacra</a>, <a href="https://www.theregister.com/2026/03/19/anthropic_claude_market_share/" target="_blank" rel="noopener noreferrer">The Register</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Business adoption data from Ramp (February 2026) shows 24.4% of businesses on the platform now pay for Anthropic, up from approximately 4% a year ago. Anthropic''s adoption grew 4.9% month-over-month — its largest monthly gain ever. In Australia specifically, the company''s 4th-place global ranking for Claude.ai usage relative to population demonstrates organic demand that preceded any formal market presence, validating the decision to invest in a physical office.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://ramp.com/velocity/ai-index-march-2026" target="_blank" rel="noopener noreferrer">Ramp AI Index</a></em></p>', 3, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Arriving three months after OpenAI''s high-profile December 2025 launch meant Anthropic lost first-mover advantage for headlines. OpenAI had already secured named partnerships with CBA, Coles, Wesfarmers, Virgin Australia, Fortescue, and REA Group, launched a formal "OpenAI for Australia" country programme, and committed A$7 billion for a sovereign AI data centre with NextDC. Both companies share CBA and Canva as customers, demonstrating the intense competition for Australia''s biggest enterprise accounts.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.smartcompany.com.au/artificial-intelligence/anthropic-sydney-office-claude-australia/" target="_blank" rel="noopener noreferrer">SmartCompany</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>The infrastructure gap versus OpenAI remains significant. While OpenAI committed to a concrete A$7 billion data centre, Anthropic is only "exploring" third-party compute capacity in Australia — a meaningful difference for government and enterprise customers with strict data sovereignty requirements. Australia''s regulatory environment adds complexity: the country abandoned its original September 2024 proposal for mandatory AI guardrails in favour of a technology-neutral approach, but the regulatory landscape remains uncertain with no AI-specific legislation.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://seekingalpha.com/news/4563040-anthropic-to-open-office-in-sydney-mulls-boosting-compute-capacity-in-australia" target="_blank" rel="noopener noreferrer">Seeking Alpha</a>, <a href="https://www.softwareseni.com/why-australia-abandoned-mandatory-ai-guardrails-for-technology-neutral-regulation-and-what-it-means/" target="_blank" rel="noopener noreferrer">SoftwareSeni</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Anthropic''s safety-first brand — a key differentiator in the Australian market — faced a credibility challenge in February 2026 when the company scrapped its flagship safety pledge, which had promised to never train a model without guaranteed safety mitigations. The company cited competitive pressures. This move risks undermining the very positioning that attracted safety-conscious Australian enterprises. Separately, a high-profile dispute following the termination of Anthropic''s Pentagon contract by Defense Secretary Pete Hegseth created both distraction and, paradoxically, reinforced the company''s image as principled in its approach to government AI deployment.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://time.com/7380854/exclusive-anthropic-drops-flagship-safety-pledge/" target="_blank" rel="noopener noreferrer">TIME</a>, <a href="https://qz.com/anthropic-claude-ai-business-revenue-pentagon-openai-chatgpt" target="_blank" rel="noopener noreferrer">Quartz</a></em></p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Let the product lead, then formalise the presence.</strong> Australia''s 4th-place global ranking for Claude usage — achieved entirely without a local office — validated demand before Anthropic invested in physical presence. For companies entering Australia, strong organic adoption is the most powerful signal that a market is ready. Anthropic entered knowing its product was already winning, reducing the risk of the expansion.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Cloud partnerships can substitute for local infrastructure — initially.</strong> Rather than building Australian data centres from day one, Anthropic leveraged AWS Bedrock and Google Cloud Vertex AI as distribution channels. This let enterprises adopt Claude through platforms they already use, removing procurement friction. However, the gap with OpenAI''s concrete infrastructure commitment shows this strategy has limits — government and highly regulated enterprises will eventually demand sovereign compute.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>A well-connected local figure accelerates everything.</strong> Naming Jeffrey Bleich — former US Ambassador to Australia — as a director of the Australian subsidiary leveraged existing diplomatic and business relationships that would take years to build organically. For any company entering Australia, securing a locally respected figure with genuine government and business networks can compress the relationship-building timeline dramatically.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Enterprise-first monetisation beats consumer volume.</strong> Anthropic''s 8x monetisation advantage per user over OpenAI (US$211 versus US$25) demonstrates that targeting enterprise customers with high-value contracts can be more capital-efficient than chasing consumer scale. For B2B companies entering Australia, focusing on fewer, larger customers — particularly in financial services, resources, and government — often yields faster returns than broad consumer acquisition.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Being second can be strategic.</strong> Arriving three months after OpenAI cost Anthropic some headlines, but it gained time to observe, learn from OpenAI''s approach, and enter with a more targeted strategy. The fact that both companies share CBA and Canva as customers suggests the Australian AI market is large enough for multiple entrants. Sometimes, watching a competitor''s launch — including the backlash they attract — before making your move is the smarter play.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.capitalbrief.com/article/anthropic-quietly-begins-its-australian-charm-offensive-398a6aaf-680f-4026-b222-ac32c6d3d066/" target="_blank" rel="noopener noreferrer">Capital Brief</a>, <a href="https://www.anthropic.com/news/sydney-fourth-office-asia-pacific" target="_blank" rel="noopener noreferrer">Anthropic</a></em></p>', 5, 'paragraph');
-- ============================================================================
-- AWS CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Amazon Web Services (AWS) Entered the Australian Market',
  subtitle = 'From the 2012 Sydney Region to a AU$20 billion infrastructure commitment: how AWS became Australia''s dominant cloud provider with 400,000+ people trained and Top Secret Cloud clearance',
  read_time = 12,
  meta_description = 'Deep-dive case study on how AWS entered Australia with the Sydney Region in 2012, expanded to Melbourne and Perth, secured a $2B Top Secret Cloud contract, and committed AU$20B in investment.',
  sector_tags = ARRAY['cloud-computing', 'technology', 'infrastructure', 'ai', 'enterprise-software', 'government'],
  updated_at = NOW()
WHERE slug = 'aws-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Cloud Computing and AI Infrastructure',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2012',
  outcome = 'successful',
  employee_count = 11000,
  business_model = 'B2B IaaS / PaaS / Consumption-based Cloud'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry');

-- 3. Delete existing sections (CASCADE deletes content_bodies)
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>AWS launched the Asia Pacific (Sydney) Region in November 2012 with two Availability Zones — its first infrastructure in Australia and one of its most globally requested regions. The timing was strategic: both Australian companies and international firms wanted to serve the ANZ market without routing data through overseas hosting providers. AWS had identified Australia as a mature enterprise market with strong financial services, government, and resources sectors generating massive demand for scalable computing. The Sydney Region was headquartered at Level 37, 26 Park Street, Sydney.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://aws.amazon.com/about-aws/whats-new/2012/11/12/announcing-the-aws-asia-pacific-sydney-region/" target="_blank" rel="noopener noreferrer">AWS Announcement</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>AWS expanded progressively across Australia over the next decade: Direct Connect locations in Sydney (2014), Melbourne (2016), and Canberra and Perth (2017) extended low-latency connectivity. In January 2023, AWS launched two major milestones simultaneously — the Asia Pacific (Melbourne) Region with three Availability Zones and Australia''s first Local Zone in Perth. The Melbourne region represented an estimated A$6.8 billion investment through 2037. By 2026, AWS operates 10 Direct Connect locations across Sydney, Melbourne, Canberra, and Perth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://press.aboutamazon.com/2023/1/aws-launches-second-infrastructure-region-in-australia" target="_blank" rel="noopener noreferrer">Amazon Press</a>, <a href="https://aws.amazon.com/local/australia/" target="_blank" rel="noopener noreferrer">AWS Australia</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The government cloud strategy became AWS''s most powerful competitive moat in Australia. AWS achieved PROTECTED-level IRAP assessment — the highest classification attainable for public cloud — now covering 164 services including the Melbourne Region. In July 2024, the Australian Government announced a landmark AU$2 billion strategic partnership with AWS to deliver a sovereign Top Secret Cloud, managed through ASD''s REDSPICE programme. This purpose-built capability mirrors the classified cloud AWS provides to the CIA and US Intelligence Community, serving Australia''s Defence and National Intelligence Community across 10 agencies and supporting AUKUS interoperability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://ia.acs.org.au/article/2024/govt-inks--2bn-deal-with-aws-for-top-secret-cloud.html" target="_blank" rel="noopener noreferrer">Information Age</a>, <a href="https://www.minister.defence.gov.au/media-releases/2024-07-04/australian-government-partners-amazon-web-services-bolster-national-defence-security" target="_blank" rel="noopener noreferrer">Defence Minister</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Leadership evolved as the market matured. Paul Migliorini served as the first ANZ Managing Director for approximately five years from the 2012 launch. Adam Beavis succeeded him, later moving to an APAC-wide ISV role before joining Databricks as ANZ VP. Rianne Van Veldhuizen is the current VP and Managing Director ANZ, previously spending 15 years at IBM as Asia Pacific chief digital officer. In June 2025, Amazon announced AU$20 billion in investment from 2025 to 2029 — the largest publicly announced global technology investment in Australia''s history.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.arnnet.com.au/article/690319/aws-appoints-rianne-van-veldhuizen-new-nz-leader/" target="_blank" rel="noopener noreferrer">ARN</a>, <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Data residency and sovereignty compliance have been the bedrock of AWS''s Australian success. With two full regions (Sydney and Melbourne) plus a Perth Local Zone, Australian data stays onshore. 164 services are assessed at PROTECTED level, and Strategic Hosting Provider certification under the government''s Hosting Certification Framework unlocked the entire public sector. For highly regulated industries — banking, healthcare, government — this compliance infrastructure made AWS the default choice, as competitors struggled to match the breadth of certified services.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://aws.amazon.com/compliance/australia-new-zealand/" target="_blank" rel="noopener noreferrer">AWS Compliance</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>AWS''s training programmes created a self-reinforcing cycle of adoption. Since 2017, AWS has trained more than 400,000 people across Australia in cloud and digital skills through programmes including AWS re/Start (a free 400-hour cohort programme), AWS Skills Guild, AWS Educate, and Work-Based Learning (a 12-month data centre operations training programme). NAB alone trained 7,000 employees through AWS Skills Guild, with 1,300 gaining certification — reducing staff attrition from 20% to 8%. More skilled workers meant more enterprises could adopt AWS, which drove more demand for training.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com.au/bridging-the-cloud-skills-gap-across-australia-and-new-zealand" target="_blank" rel="noopener noreferrer">About Amazon AU</a>, <a href="https://aws.amazon.com/solutions/case-studies/national-australia-bank-digital-transformation-case-study/" target="_blank" rel="noopener noreferrer">AWS NAB Case Study</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Customer wins span every sector of the Australian economy. The Big Four banks are all on AWS: Commonwealth Bank has been on the platform since 2012, NAB since 2013 (migrating 65 contact centres to Amazon Connect). Born-on-cloud companies like Canva (160M+ monthly active users, reduced compute costs by 46%), Atlassian, Afterpay, Airtasker, PEXA, and SEEK built their businesses entirely on AWS. Enterprise customers include Telstra, Qantas, Kmart, Woodside Energy, Cochlear, Optus, Origin Energy, and Myer. In the public sector, the ABS, CSIRO, University of Melbourne, RMIT, and Swimming Australia all run on AWS.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://aws.amazon.com/solutions/case-studies/innovators/canva/" target="_blank" rel="noopener noreferrer">AWS Canva Case Study</a>, <a href="https://press.aboutamazon.com/2023/1/aws-launches-second-infrastructure-region-in-australia" target="_blank" rel="noopener noreferrer">Amazon Press</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Renewable energy investment provided both environmental credibility and political cover. AWS has 11 solar and wind projects across NSW, Queensland, and Victoria, expected to generate over 1.4 million megawatt-hours of clean energy annually — enough to power nearly 290,000 Australian homes. The Hawkesdale Wind Farm in Victoria alone produces 337,000 MWh annually across 23 turbines. In 2024, Amazon ranked as the third-largest corporate buyer of renewable energy in Australia. Three new solar farms totalling 170+ MW were announced in 2025 with European Energy.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://international.austrade.gov.au/en/news-and-analysis/success-stories/aws-plans-to-invest-a20-billion-to-expand-digital-infrastructure-in-australia-by-2029" target="_blank" rel="noopener noreferrer">Austrade</a>, <a href="https://amazonau.gcs-web.com/news-releases/news-release-details/operations-begin-wind-farm-hawkesdale-victoria-backed-amazon" target="_blank" rel="noopener noreferrer">Amazon AU</a></em></p>', 4, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>The investment numbers tell the story of AWS''s deepening commitment. Total investment from 2012 to 2023 reached AU$9.1 billion. The AU$20 billion commitment for 2025-2029 — the largest publicly announced global technology investment in Australia — will fund new data centres in Sydney and Melbourne plus renewable energy projects. The Melbourne Region alone is estimated to contribute A$15.9 billion to Australia''s GDP by 2037. The AU$2 billion Top Secret Cloud contract extends over a decade and positions AWS as the sovereign cloud provider for national security.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a>, <a href="https://ia.acs.org.au/article/2024/govt-inks--2bn-deal-with-aws-for-top-secret-cloud.html" target="_blank" rel="noopener noreferrer">Information Age</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>The planned investment supports an estimated average of 11,000 full-time jobs nationally, including 2,500 direct roles in construction and operations with the remainder through supply chain and household income effects. The Top Secret Cloud partnership alone will generate up to 2,000 Australian jobs. The Melbourne Region supports over 2,500 full-time equivalent jobs annually at external businesses. Over 400,000 people have been trained in cloud and digital skills since 2017, creating a workforce pipeline that sustains adoption growth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a>, <a href="https://www.minister.defence.gov.au/media-releases/2024-07-04/australian-government-partners-amazon-web-services-bolster-national-defence-security" target="_blank" rel="noopener noreferrer">Defence Minister</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Globally, AWS holds approximately 28-31% of cloud infrastructure market share as of late 2025, slowly declining from approximately 33% in 2021 as Azure (20-25%) grows faster in absolute revenue terms driven by its OpenAI partnership. Google Cloud holds 11-13%. In Australia specifically, AWS''s dominance is more pronounced due to its early entry, two full regions, government certifications, and the depth of its enterprise customer base across financial services, resources, and the public sector.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.statista.com/chart/18819/worldwide-market-share-of-leading-cloud-infrastructure-service-providers/" target="_blank" rel="noopener noreferrer">Statista</a></em></p>', 3, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Microsoft Azure''s growth, accelerated by its exclusive OpenAI partnership, represents the most significant competitive threat. Microsoft committed AU$5 billion in October 2023 to expand to 29 centres across Sydney, Melbourne, and Canberra. Azure''s growth rate has consistently exceeded AWS''s, narrowing the market share gap. Google Cloud, while smaller, is also expanding aggressively in Australia. The AI era has shifted the competitive dynamics — enterprises increasingly evaluate cloud providers based on their AI model partnerships, not just infrastructure reliability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://stansberryresearch.com/stock-market-trends/azure-vs-aws-vs-google-cloud-whos-winning-the-cloud-ai-war-in-2025" target="_blank" rel="noopener noreferrer">Stansberry Research</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Community opposition to data centres has become a growing challenge. A Melbourne petition opposed new data centre construction, citing energy consumption, carbon emissions, and insufficient community consultation. Melbourne''s lord mayor warned data centres could "cook the planet." NSW parliament established a formal inquiry into data centre development. In Western Sydney, at least 89 data centres draw from public drinking water supply. AEMO estimates data centres will consume 6% of Australia''s grid-supplied electricity by 2030, with demand projected to surge from 3 TWh to 30 TWh by 2035.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://theconversation.com/power-hungry-data-centres-threaten-australias-energy-grid-here-are-3-steps-to-make-them-more-efficient-266992" target="_blank" rel="noopener noreferrer">The Conversation</a>, <a href="https://www.pv-tech.org/social-backlash-inevitable-industry-demands-data-centres-stop-freeloading-on-australias-clean-energy/" target="_blank" rel="noopener noreferrer">PV Tech</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>The talent shortage has been persistent. AWS job postings in Australia increased 153% between 2014 and 2017, with postings consistently 6-12 times the supply of qualified job seekers. Over 54% of organisations reported challenges with AWS implementation due to internal skills gaps. Australia Post and RMIT developed new upskilling approaches as public sector cloud migration was slowed by the shortage. The Perth Local Zone also presented pricing challenges — up to 50% more expensive than Sydney with a limited service catalogue, mainly compute and block storage.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itbrief.com.au/story/aws-skills-shortage-anz-opportunity-it-students-pros" target="_blank" rel="noopener noreferrer">IT Brief</a>, <a href="https://www.ac3.com.au/resources/the-user-experience-and-aws-local-zones-within-australia" target="_blank" rel="noopener noreferrer">AC3</a></em></p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Infrastructure first, then services.</strong> AWS planted a flag with the Sydney Region in 2012 before aggressively pursuing enterprise and government customers. Data residency was the prerequisite — without local infrastructure, government and regulated-industry customers in banking and healthcare could not adopt the platform. For any technology company entering Australia, demonstrating local infrastructure commitment unlocks the regulated sectors that drive enterprise adoption.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Government compliance creates an almost insurmountable moat.</strong> Achieving IRAP PROTECTED assessment across 164 services and Strategic Hosting Provider status unlocked the entire public sector. The AU$2 billion Top Secret Cloud contract cemented AWS as the sovereign cloud provider for national security — a position competitors will struggle to replicate. For companies entering regulated Australian markets, compliance certifications should be pursued early and broadly, as they compound into a durable competitive advantage.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Train the ecosystem to create demand.</strong> Training 400,000+ Australians created a self-reinforcing cycle: more skilled workers meant more enterprises could adopt AWS, which drove more demand for training. NAB''s example — 7,000 trained, attrition dropping from 20% to 8% — shows that training programmes serve as both a market development tool and a customer retention mechanism. Companies entering Australia should view skills development as a go-to-market investment, not a philanthropic expense.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Anchor tenants validate the market for everyone else.</strong> Early wins with the Big Four banks (CBA from 2012, NAB from 2013), plus born-on-cloud companies like Canva and Atlassian, created credibility that attracted the broader market. Australian enterprises look to their peers for technology validation — landing two or three blue-chip customers in the first year establishes trust that marketing alone cannot achieve.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Address energy and sustainability proactively.</strong> With 11 renewable energy projects generating 1.4 million MWh annually, AWS pre-emptively addressed the energy criticism that now threatens data centre approvals across Australia. Being the third-largest corporate renewable energy buyer in the country provides political cover during planning approvals and community opposition. Companies planning large-scale infrastructure in Australia should lead with sustainability commitments, not treat them as afterthoughts.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a>, <a href="https://international.austrade.gov.au/en/news-and-analysis/success-stories/aws-plans-to-invest-a20-billion-to-expand-digital-infrastructure-in-australia-by-2029" target="_blank" rel="noopener noreferrer">Austrade</a></em></p>', 5, 'paragraph');
-- ============================================================================
-- AIRBNB CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Airbnb Entered the Australian Market',
  subtitle = 'From a Sydney office in 2012 to a $20.3 billion economic contribution: how the sharing economy platform navigated state-by-state regulation and reshaped Australian tourism',
  read_time = 12,
  meta_description = 'Deep-dive case study on how Airbnb entered Australia in 2012, grew to 161,000+ listings supporting 107,000 jobs, and navigated complex state-by-state regulation.',
  sector_tags = ARRAY['sharing-economy', 'travel', 'technology', 'marketplace', 'hospitality', 'tourism'],
  updated_at = NOW()
WHERE slug = 'airbnb-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Technology / Sharing Economy Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2012',
  outcome = 'successful',
  employee_count = 250,
  business_model = 'Two-sided Marketplace / Commission-based Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry');

-- 3. Delete existing sections (CASCADE deletes content_bodies)
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Airbnb entered Australia in November 2012, opening a Sydney office — its 11th globally — as part of a broader international expansion wave that included Paris, Milan, Barcelona, Copenhagen, Moscow, and Sao Paulo. By mid-2012 the platform had surpassed 10 million nights booked globally, and Australia was identified as a high-priority market due to its strong domestic tourism culture, high internet penetration, and a large stock of underutilised residential property suited to short-term letting.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://timeline.vg/timelines/330" target="_blank" rel="noopener noreferrer">History of Airbnb Timeline</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>In August 2014, Airbnb appointed Sam McDonagh as Country Manager for Australia and New Zealand. McDonagh was a Perth native with over 20 years of senior management experience, including roles as Finance Director of eBay Australia at launch, Director of Category Management for eBay in the US, GM of eBay Southeast Asia, and co-founder of Quickflix. His most recent role was as GM and investor in Dollar Shave Club''s Australian business. Varsha Rao, Airbnb''s Head of Global Operations, said at the time: "Australia and New Zealand are incredibly important markets for Airbnb both in terms of domestic and international travel." McDonagh served from 2014 to 2019.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.airbnb.com.au/press/news/airbnb-appoints-sam-mcdonagh-as-country-manager-for-australia-and-new-zealand" target="_blank" rel="noopener noreferrer">Airbnb Press</a>, <a href="https://www.smartcompany.com.au/startupsmart/advice/leadership-advice/airbnb-appoints-country-manager-for-australia-and-new-zealand/" target="_blank" rel="noopener noreferrer">SmartCompany</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The initial strategy focused on three pillars: pricing differentiation (listings in central Sydney were on average $88 cheaper per night than hotels), domestic tourism capture (51% of bookings came from Australian guests in 2015-16), and rapid host acquisition through trust-building mechanisms including host protection insurance, a bidirectional ratings system, and "Made Possible by Hosts" marketing that positioned hosting as supplementary income rather than a business operation. Australian listings more than doubled in the year before McDonagh''s appointment.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Deloitte - Economic Effects of Airbnb in Australia</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The pricing advantage over traditional accommodation was a major adoption driver. Deloitte Access Economics data showed Airbnb listings were cheaper per room per night on average, with the differential most pronounced in central city areas during peak seasons. Beyond price, three-quarters of Airbnb properties in major Australian markets were located outside traditional tourist areas, offering guests access to local neighbourhoods with home-like facilities including kitchens and laundries. The platform maintained an average guest rating of 4.7 out of 5, reflecting a quality standard that competed effectively with hotels.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Deloitte - Economic Effects of Airbnb in Australia</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Regional expansion became both commercially smart and politically strategic. By 2024, 33% of Airbnb guest accommodation spending occurred outside major cities — up 4 percentage points from 2019. Over 92,000 guest arrivals occurred in communities with Airbnb listings but no hotels in 2022, generating nearly AUD $27 million in host earnings. Airbnb partnered with Australian Regional Tourism (ART), providing $70,000 in funding for a toolkit helping rural landowners create farm-stay accommodation. Additional partnerships with peak farmer organisations across multiple states boosted tourism infrastructure in regional areas.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.airbnb.com/en-au/airbnb-partners-with-australian-regional-tourism/" target="_blank" rel="noopener noreferrer">Airbnb Newsroom</a>, <a href="https://news.airbnb.com/en-au/airbnb-enables-communities-with-no-hotels-to-share-the-benefits-of-tourism/" target="_blank" rel="noopener noreferrer">Airbnb Newsroom</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Host acquisition succeeded through supplementary-income positioning during Australia''s cost-of-living crisis. The typical Australian host earns around $3,000 per month, and 40% of hosts say Airbnb income helped them stay in their homes. The flexibility model — about 75% of Sydney listings in 2018 were booked for only 1-3 months — attracted a predominantly part-time, seasonal hosting base rather than professional operators. COVID-19 accelerated a pivot to domestic travel that proved lasting: domestic guests now account for 84% of stays (up from 74% pre-pandemic), demonstrating resilience against external shocks.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.airbnb.com/en-au/oxford-economics-report-reveals-airbnbs-20-3-billion-impact-in-australia/" target="_blank" rel="noopener noreferrer">Oxford Economics / Airbnb</a>, <a href="https://blog.madecomfy.com.au/blog/how-much-do-hosts-make-on-airbnb" target="_blank" rel="noopener noreferrer">MadeComfy</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>An August 2025 Oxford Economics report quantified Airbnb''s 2024 economic contribution at $20.3 billion — approximately 7% of Australia''s tourism GDP. This comprised $7.2 billion in direct impact and $13.1 billion in flow-on effects. The platform supported 107,000 jobs and $7 billion in wage income. Guest spending in Australia totalled $16 billion across accommodation and non-accommodation categories, with average guest daily non-accommodation spending of $320 over an average stay of 3 days.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/en-au/oxford-economics-report-reveals-airbnbs-20-3-billion-impact-in-australia/" target="_blank" rel="noopener noreferrer">Oxford Economics / Airbnb</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>The state-by-state economic impact in 2024 shows NSW leading with $6.6 billion in GSP contribution and 32,200 jobs, followed by Victoria ($5.4 billion, 30,900 jobs), Queensland ($4.8 billion, 25,600 jobs), Western Australia ($1.8 billion, 8,600 jobs), South Australia ($900 million, 4,700 jobs), and Tasmania ($500 million, 3,300 jobs). Active listings reached 161,296 in 2024-25, up 5.6% year-over-year, with Melbourne leading at 19,847 listings and Sydney at 12,527.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.airbnb.com/en-au/oxford-economics-report-reveals-airbnbs-20-3-billion-impact-in-australia/" target="_blank" rel="noopener noreferrer">Oxford Economics / Airbnb</a>, <a href="https://hello.pricelabs.co/australia-airbnb-market-trends/" target="_blank" rel="noopener noreferrer">PriceLabs</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Growth from the platform''s early days has been dramatic. In its first three years (2012-2015), Airbnb accommodated 2.1 million guests across 800,000 stays. The 2015-16 Deloitte report recorded $1.6 billion in GDP contribution and 14,409 jobs. By 2024, those figures had grown to $20.3 billion and 107,000 jobs — a 12x increase in GDP contribution over eight years. Host earnings reflect the market maturity: top markets like Sydney and Perth now generate average annual revenue of approximately $70,000, up significantly from the $4,920 national median host income reported in 2015-16.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Deloitte</a>, <a href="https://hello.pricelabs.co/australia-airbnb-market-trends/" target="_blank" rel="noopener noreferrer">PriceLabs</a></em></p>', 3, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Australia''s federal system created a patchwork of state-by-state regulation that Airbnb has had to navigate differently in each jurisdiction. NSW introduced mandatory registration and a 180-day annual cap on unhosted rentals in Greater Sydney. Byron Shire imposed Australia''s strictest limit — a 60-day cap effective September 2024. Victoria introduced a 7.5% Short Stay Levy from January 2025 on all bookings under 28 days, funding social and affordable housing. The ACT added a 5% levy from July 2025. Western Australia launched a statewide registration scheme from January 2025. Queensland left regulation to local councils, with Brisbane announcing plans for a permit system.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.hostaway.com/blog/airbnb-rules-in-australia/" target="_blank" rel="noopener noreferrer">Hostaway</a>, <a href="https://www.apimagazine.com.au/news/article/airbnb-crackdown-in-full-swing-but-varies-widely-between-states" target="_blank" rel="noopener noreferrer">API Magazine</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Housing affordability became Airbnb''s biggest reputational challenge in Australia. In towns like Apollo Bay, childcare centres closed due to staff unable to afford nearby housing. In Hobart, long-term rental availability fell by more than 50%. Research using hedonic property models found a 1% increase in Airbnb density in Sydney is associated with approximately a 2% increase in property sales prices. During COVID, when Airbnb activity declined, rental prices in Sydney''s most active Airbnb neighbourhoods fell up to 7.1%. Airbnb''s defence, citing an Urbis study, argues STRAs make up only 1-2% of total housing stock nationally with no consistent relationship between STR density and vacancy rates.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://thegoodbuilder.com.au/we-looked-into-airbnb-and-the-housing-crisis-heres-what-we-found/" target="_blank" rel="noopener noreferrer">The Good Builder</a>, <a href="https://newsroom.unsw.edu.au/news/social-affairs/disrupting-disruption-covid-19-reverses-airbnb-effect" target="_blank" rel="noopener noreferrer">UNSW</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Strata and body corporate conflicts have been an ongoing battleground. Noise, security concerns, wear and tear on common property, and fire safety issues drove widespread pushback. Key court cases — including Watergate v Balcombe in Victoria and Estens v Owners Corporation in NSW — initially found that owners corporations lacked the power to ban short-term letting. Legislative responses have since given bodies corporate more authority: NSW allowed strata bans from 2020 with a 75% special resolution, and Victoria followed from January 2025. The hotel and accommodation industry has lobbied aggressively, arguing Airbnb operates on an uneven playing field by avoiding the same planning, safety, and tax obligations as registered hotels.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.stratadata.com.au/news/can-you-airbnb-strata-property/" target="_blank" rel="noopener noreferrer">Strata Data</a>, <a href="https://www.parliament.vic.gov.au/news/economy/short-stay-levy/" target="_blank" rel="noopener noreferrer">Parliament of Victoria</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>COVID-19 devastated international tourism-dependent Airbnb markets. Australia''s strict border closures (March 2020 to late 2021) eliminated international guests overnight. Domestic visitor numbers recovered to approximately 80% of pre-pandemic levels by summer 2020-21, dropped again to approximately 40% during Delta lockdowns, then recovered to approximately 85% by Easter 2022. Average short-stay prices jumped 37% between 2019 and 2022 due to pent-up domestic demand. Tax compliance has also intensified: under the ATO''s Sharing Economy Reporting Regime, platforms now report all Australian host transaction data directly to the ATO.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.rba.gov.au/publications/bulletin/2022/dec/the-recovery-in-the-australian-tourism-industry.html" target="_blank" rel="noopener noreferrer">Reserve Bank of Australia</a>, <a href="https://assets.airbnb.com/help/Airbnb-Tax-Guide-2023-Australia.pdf" target="_blank" rel="noopener noreferrer">Airbnb Tax Guide</a></em></p>', 4, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Prepare for a state-by-state regulatory patchwork.</strong> Australia''s federal system means regulation is fragmented across states, territories, and local councils. Airbnb navigates different rules in NSW (night caps plus registration), Victoria (levies plus owners corporation powers), Queensland (council-level permits), Tasmania (permit requirements), and Western Australia (statewide registration). Any company entering the Australian market must invest in state-by-state regulatory mapping and dedicated government relations in each jurisdiction.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Invest in regional expansion, not just capital cities.</strong> Airbnb''s regional strategy — partnering with Australian Regional Tourism and farmer organisations — was commercially smart and politically strategic. With 33% of guest spending now outside major cities and 92,000 arrivals in communities with no hotels, the regional data countered regulatory criticism. Companies should demonstrate value beyond Sydney and Melbourne to build political goodwill across state and local government.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Commission independent economic impact research early.</strong> Airbnb''s partnerships with Deloitte Access Economics (2017) and Oxford Economics (2025) produced headline figures — $20.3 billion economic contribution, 107,000 jobs — that have been instrumental in policy debates. Proactive economic impact studies give companies ammunition against regulatory overreach and help frame the narrative before opponents do.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Build domestic market resilience alongside international growth.</strong> Airbnb''s COVID-era pivot to domestic travel — with domestic guests rising from 74% to 84% of stays — proved the importance of not over-indexing on international customers. Building a strong domestic use case provides resilience against pandemics, geopolitical disruptions, and exchange rate shifts. For marketplace businesses, the Australian domestic market is large enough to sustain significant scale on its own.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Get ahead of the housing affordability narrative.</strong> Airbnb was somewhat reactive on housing affordability, which allowed critics and hotel industry lobbyists to shape the public debate. The result was an escalating series of levies and night caps across multiple states. Companies operating in sectors that intersect with housing, urban planning, or public infrastructure should engage proactively with transparent data, voluntary commitments, and stakeholder engagement well before regulation is drafted.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.airbnb.com/en-au/byron-bay-one-year-later-higher-rents-and-no-impact-housing-affordability/" target="_blank" rel="noopener noreferrer">Airbnb Newsroom</a>, <a href="https://www.unisa.edu.au/media-centre/Releases/2025/strict-rules-for-short-term-rentals-and-airbnbs-no-solution-to-our-housing-crisis/" target="_blank" rel="noopener noreferrer">University of South Australia</a></em></p>', 5, 'paragraph');
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
-- ============================================================================
-- AMAZON E-COMMERCE CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Amazon Entered the Australian E-commerce Market',
  subtitle = 'From a bumpy 2017 launch to Australia''s fastest-growing marketplace: robotics fulfillment centres, Prime membership, and a 1,500% revenue surge in two years',
  read_time = 12,
  meta_description = 'Deep-dive case study on how Amazon entered Australia in 2017, built a network of fulfillment centres, launched Prime, and grew to 67.9 million monthly visitors.',
  sector_tags = ARRAY['e-commerce', 'retail', 'technology', 'logistics', 'marketplace', 'consumer'],
  updated_at = NOW()
WHERE slug = 'amazon-australia-ecommerce-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'E-commerce and Retail Technology',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2017',
  outcome = 'successful',
  business_model = 'Marketplace / E-commerce / Subscription (Prime)'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry');

-- 3. Delete existing sections
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'entry-strategy'),
'<p>Amazon launched a dedicated Australian marketplace in December 2017, entering a retail market valued at almost USD $300 billion. While Amazon had been active in Australia prior — selling Kindle e-readers and allowing Australians to purchase from its US site — the trade volume was greatly limited by the lack of local fulfillment infrastructure, which resulted in long delivery times and high shipping costs. The dedicated marketplace was designed to offer the full Amazon experience with local inventory, competitive pricing, and fast delivery.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.amzadvisers.com/the-rapid-growth-of-amazon-australia/" target="_blank" rel="noopener noreferrer">AMZ Advisers</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'entry-strategy'),
'<p>The logistics-first approach defined Amazon''s Australian entry. The company opened its first fulfillment centre in Dandenong South, Victoria, before expanding to Sydney (Moorebank), Brisbane, and Perth. Fulfillment by Amazon (FBA) was introduced in late February 2019, allowing third-party sellers to ship products to Amazon''s Melbourne fulfilment centre and pay Amazon to store, pick, pack, and deliver orders. Amazon Prime launched in mid-2018, initially offering free two-day delivery on eligible items alongside access to Prime Video — establishing the subscription ecosystem that drives customer loyalty globally.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://inforoc.com/amazon-in-australia/" target="_blank" rel="noopener noreferrer">Inforoc</a>, <a href="https://www.amzadvisers.com/the-rapid-growth-of-amazon-australia/" target="_blank" rel="noopener noreferrer">AMZ Advisers</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'entry-strategy'),
'<p>Amazon scaled its fulfilment infrastructure dramatically from 2022 onwards. In 2022, it launched its largest Australian warehouse — a 200,000-square-metre robotics fulfilment centre at Kemps Creek in western Sydney, reportedly costing approximately A$500 million. A second robotics fulfilment centre in Melbourne, spanning 209,000 square metres across four levels, was announced and set for completion by 2025. In November 2024, Amazon opened a US$90 million fulfilment centre in Western Sydney, adding 360 jobs and expanding capacity for oversized goods. The company also has plans to enter big-box retail — furniture and large electronics — via additional Sydney warehouse capacity.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://inforoc.com/amazon-in-australia/" target="_blank" rel="noopener noreferrer">Inforoc</a>, <a href="https://www.xsellco.com/resources/amazon-australia-e-commerce-growth/" target="_blank" rel="noopener noreferrer">xSellco</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'success-factors'),
'<p>Despite a bumpy start — the initial launch disappointed on product selection and delivery speed — Amazon Australia rose to become the company''s fastest-growing marketplace globally. The key driver was relentless logistics investment: building robotics fulfilment centres that enabled same-day and next-day delivery for Prime members in major cities. Free and faster delivery options raised consumer expectations across the entire Australian e-commerce market, forcing competitors to match or lose share.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.euromonitor.com/article/digital-disruption-amazon-is-reshaping-australian-retail-e-commerce" target="_blank" rel="noopener noreferrer">Euromonitor</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'success-factors'),
'<p>Prime membership became the ecosystem lock-in mechanism. Australian Prime subscriptions grew 39% in 2024, driven by high-income households earning $200,000+ and younger shoppers aged 18-24. More than 60% of Prime members globally spend over $100 per month shopping on Amazon. The combination of free delivery, Prime Video, Prime Reading, and Prime Day sales events created a subscription flywheel where members increase purchase frequency to maximise their membership value.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.yaguara.co/amazon-statistics/" target="_blank" rel="noopener noreferrer">Yaguara</a>, <a href="https://www.podbase.com/blogs/amazon-statistics" target="_blank" rel="noopener noreferrer">Podbase</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'success-factors'),
'<p>Amazon steadily eroded the dominance of Australian supermarket giants in the digital FMCG space by capturing repeat, need-based purchases. Amazon Fresh expanded grocery delivery in major cities, while the advertising platform gave Australian brands a new high-intent marketing channel. The marketplace model attracted thousands of third-party sellers — with approximately 82% of active marketplace sellers globally using Fulfillment by Amazon — creating a self-reinforcing cycle of selection, traffic, and seller participation.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.euromonitor.com/article/digital-disruption-amazon-is-reshaping-australian-retail-e-commerce" target="_blank" rel="noopener noreferrer">Euromonitor</a>, <a href="https://thunderbit.com/blog/amazon-fba-stats" target="_blank" rel="noopener noreferrer">Thunderbit</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'key-metrics'),
'<p>Amazon Australia''s growth trajectory has been extraordinary. From 2017 to 2019, the company achieved a staggering 1,500% revenue increase, reaching $292.3 million. By 2025, Amazon.com.au attracts approximately 67.9 million monthly visitors, making it one of Australia''s most popular e-commerce websites alongside eBay and Gumtree. The broader Australian e-commerce market reached US$42.2 billion in 2025, growing at 8.3% CAGR toward a projected US$58 billion by 2029, with Amazon capturing an increasing share.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.amzadvisers.com/the-rapid-growth-of-amazon-australia/" target="_blank" rel="noopener noreferrer">AMZ Advisers</a>, <a href="https://www.statista.com/forecasts/289742/e-commerce-revenue-forecast-in-australia" target="_blank" rel="noopener noreferrer">Statista</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'key-metrics'),
'<p>Australian Prime subscriptions grew 39% in 2024, with record Prime Day sales accelerating adoption. Globally, Amazon Prime exceeds 240 million members generating over US$11.7 billion in quarterly subscription revenue. The fulfilment network in Australia now spans multiple robotics centres across Sydney, Melbourne, Brisbane, and Perth, with the two largest facilities (Kemps Creek and the Melbourne robotics centre) each exceeding 200,000 square metres. The November 2024 Western Sydney expansion alone added 360 jobs and US$90 million in investment.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.yaguara.co/amazon-statistics/" target="_blank" rel="noopener noreferrer">Yaguara</a>, <a href="https://inforoc.com/amazon-in-australia/" target="_blank" rel="noopener noreferrer">Inforoc</a></em></p>', 2, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'challenges-faced'),
'<p>Amazon''s initial Australian launch was widely considered underwhelming. The product catalogue was thin compared to the US site, delivery times were slower than promised, and prices were not always competitive with established retailers. Australian consumers who had high expectations from Amazon''s US reputation were disappointed. This "expectation gap" required years of logistics investment and catalogue expansion to close, and gave competitors like Kogan, Catch, and the supermarket giants time to strengthen their own e-commerce capabilities.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'challenges-faced'),
'<p>Australia''s geography creates inherently high distribution costs. The country''s vast distances, dispersed population, and relatively small market size compared to the US make last-mile delivery expensive. Building the fulfilment network required billions in capital expenditure across multiple states before the economics could work. The July 2018 introduction of GST on low-value imported goods (the "Amazon tax") also increased costs for cross-border sellers and required platform compliance changes.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://inforoc.com/amazon-in-australia/" target="_blank" rel="noopener noreferrer">Inforoc</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition from entrenched Australian retailers — particularly Woolworths, Coles, and Wesfarmers — has been fierce. These incumbents responded to Amazon''s entry by accelerating their own e-commerce investments, launching rapid delivery services, and leveraging their extensive physical store networks for click-and-collect. Woolworths'' partnership with Uber for grocery delivery and Coles'' investment in automated fulfilment demonstrated that Australian retailers would not cede digital ground without a fight. The retail employment sector also raised concerns about job displacement.</p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Logistics infrastructure must precede the customer promise.</strong> Amazon''s initial disappointment in Australia stemmed from launching before its fulfilment network could deliver the experience consumers expected. The subsequent investment in robotics fulfilment centres across four states was the turning point. For any e-commerce company entering Australia, the logistics network must be in place before marketing creates expectations that cannot be met.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Subscription ecosystems create durable competitive advantage.</strong> Prime membership — combining free delivery, video streaming, and exclusive deals — created a loyalty mechanism that incumbent Australian retailers have struggled to replicate. The 39% growth in Australian Prime subscriptions in 2024 shows the flywheel is accelerating. Companies entering Australia should consider subscription models that increase switching costs and purchase frequency simultaneously.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Patience is required in a market dominated by strong incumbents.</strong> Amazon''s 1,500% revenue growth from 2017 to 2019 was impressive in percentage terms but started from a low base. Building genuine market share against Woolworths, Coles, and Wesfarmers — companies with decades of Australian consumer trust and extensive physical infrastructure — required years of sustained investment. Companies entering Australia should plan for a multi-year ramp rather than expecting immediate market disruption.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Australia''s geography demands localised logistics strategy.</strong> The vast distances between Australian cities and the dispersed population make a single-warehouse model unworkable. Amazon''s expansion to fulfilment centres in Melbourne, Sydney, Brisbane, and Perth reflects the reality that fast delivery in Australia requires distributed infrastructure. Companies entering with physical product delivery should plan for multi-city logistics from the outset, not as an afterthought.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.amzadvisers.com/the-rapid-growth-of-amazon-australia/" target="_blank" rel="noopener noreferrer">AMZ Advisers</a>, <a href="https://www.euromonitor.com/article/digital-disruption-amazon-is-reshaping-australian-retail-e-commerce" target="_blank" rel="noopener noreferrer">Euromonitor</a></em></p>', 4, 'paragraph');
-- ============================================================================
-- GITHUB CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How GitHub Entered the Australian Market',
  subtitle = 'From 2+ million Australian developers to data residency for regulated enterprises: how GitHub leveraged Microsoft''s AU$5 billion infrastructure and Copilot AI to unlock the APAC market',
  read_time = 12,
  meta_description = 'Deep-dive case study on how GitHub launched Enterprise Cloud data residency in Australia in 2025, deployed Copilot to ANZ Bank''s 3,000 engineers, and grew to 2+ million Australian developers.',
  sector_tags = ARRAY['technology', 'software-development', 'ai', 'cloud-computing', 'developer-tools', 'saas'],
  updated_at = NOW()
WHERE slug = 'github-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Software Development Platform and AI-Powered Developer Tools',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2025',
  outcome = 'successful',
  business_model = 'B2B SaaS / Subscription Platform (Freemium)'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

-- 3. Delete existing sections
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub had been used by Australian developers since its founding in 2008, but its formal enterprise market entry came on February 5, 2025, when it launched GitHub Enterprise Cloud with data residency in Australia. This made Australia the first market in Asia Pacific — and only the second globally after the European Union — to receive this deployment option. CEO Thomas Dohmke announced the launch in Sydney, calling data residency "a vital strand to the DNA of digital transformation." The move directly addressed years of demand from regulated Australian enterprises in financial services, government, defence, and telecommunications that could not adopt cloud-based DevOps due to data sovereignty requirements, often limiting them to costly self-hosted GitHub Enterprise Server deployments.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub''s Australian entry is inseparable from Microsoft''s broader AU$5 billion investment in Australian AI and cloud infrastructure — announced in October 2024, the largest Microsoft investment in its 40-year Australian history. The investment expanded Azure data centre capacity from 20 to 29 sites across Sydney, Melbourne, and Canberra, increasing computing capacity by approximately 250%. GitHub Enterprise Cloud with data residency runs on this Azure infrastructure, with data encrypted in transit and at rest. Enterprises are hosted on a dedicated subdomain of GHE.com, separating open source and enterprise work. GitHub did not need to build its own infrastructure — the 2018 acquisition by Microsoft for US$7.5 billion gave it an enterprise distribution channel, compliance certifications (including IRAP for government), and a data centre footprint that an independent company could not have replicated.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.microsoft.com/en-au/features/microsoft-announces-a5-billion-investment-in-computing-capacity-and-capability-to-help-australia-seize-the-ai-era/" target="_blank" rel="noopener noreferrer">Microsoft News</a>, <a href="https://cfotech.com.au/story/github-launches-enterprise-cloud-with-data-residency-in-oz" target="_blank" rel="noopener noreferrer">CFOtech</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Regional leadership was established in February 2022 when Sharryn Napier was appointed VP of Sales for APAC (India, Japan, China, Asia Pacific), based in Sydney. Napier — previously Regional Managing Director and VP for ANZ at New Relic — brought deep local networks as a member of the Australian Institute of Company Directors and the National Board of the AIIA. GitHub built an Australian channel partner ecosystem including Arkahna (a GitHub Verified Partner specialising in DevSecOps), Versent/Telstra, Mantel Group, Arinco, Furo, and Galah Cyber — extending its reach without requiring a large direct sales team.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.arnnet.com.au/article/695576/github-nabs-new-relic-nz-head-drive-apac/" target="_blank" rel="noopener noreferrer">ARN</a>, <a href="https://arkahna.com.au/partners/github" target="_blank" rel="noopener noreferrer">Arkahna</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub localised its global event strategy for the Australian market. In November 2025, it hosted GitHub Universe ''25 Recap Sydney — a free, full-day event with sessions on AI, security, and developer experience — rather than expecting Australian customers to travel to San Francisco for the main Universe conference. Additional in-market activities included participation in the Microsoft AI Tour Sydney in April 2026 and informal GitHub Social Club developer gatherings. By May 2025, data residency was expanded to a self-service trial model, allowing mid-market organisations to initiate a 30-day free trial without requiring sales engagement — removing friction for companies that didn''t warrant a dedicated enterprise sales cycle.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://github.blog/changelog/2025-05-16-github-enterprise-cloud-with-data-residency-now-available-for-self-service-trial/" target="_blank" rel="noopener noreferrer">GitHub Changelog</a>, <a href="https://eventbrowse.com/event/github-universe25-recap-sydney/" target="_blank" rel="noopener noreferrer">EventBrowse</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>GitHub''s dominant position among individual developers created a powerful bottom-up adoption dynamic. With over 2 million Australian developers on the platform and 367,000 new accounts added in the past year alone — a record 21.6% year-over-year growth — GitHub was already the de facto standard for version control and collaboration. Australian developers contributed 10.7 million open-source contributions annually, ranking 19th globally by developer community size and 17th by AI-repository contributions. Developers were already using GitHub for open source, personal projects, and in many cases unauthorised work use, creating organic demand for an enterprise offering that formalised what was already happening.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://securitybrief.com.au/story/australian-developers-embrace-ai-boost-productivity-on-github" target="_blank" rel="noopener noreferrer">SecurityBrief</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>ANZ Bank became GitHub''s flagship Australian enterprise customer, deploying GitHub Copilot to 3,000 software developers and engineers. An internal trial of 100 engineers — published as an academic paper — found that tasks were completed 42.36% faster with Copilot. CTO Tim Hogarth led the adoption, and ANZ launched an AI Immersion Centre at its Melbourne headquarters in partnership with Microsoft — a first for banking in Australia. This published, peer-reviewed productivity data became a powerful proof point for the entire Australian market, far more persuasive than any marketing campaign.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.itnews.com.au/news/anz-targets-3000-engineers-to-use-github-copilot-601195" target="_blank" rel="noopener noreferrer">iTnews</a>, <a href="https://www.theregister.com/2024/02/10/anz_bank_github_copilot/" target="_blank" rel="noopener noreferrer">The Register</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>GitHub Copilot became the trojan horse for enterprise adoption across the Australian public sector. Over 60 APS (Australian Public Service) agencies participated in a Microsoft 365 Copilot trial involving 7,600 users between January and June 2024, and a whole-of-government Microsoft deal was announced in February 2026 with a $1.55 million training fund. The Australian Government''s $460 million National AI Plan (2025-2026) created additional tailwinds for AI developer tool adoption. GitHub positioned Copilot — with over 20 million users and 42% market share of the US$7.37 billion AI coding tools market by 2025 — as the centrepiece of this AI-powered government digital transformation.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itbrief.com.au/story/github-tips-ai-agents-to-surge-in-australia-s-public-sector" target="_blank" rel="noopener noreferrer">IT Brief</a>, <a href="https://news.microsoft.com/source/asia/2026/02/26/enabling-the-next-phase-of-digital-government-in-australia/" target="_blank" rel="noopener noreferrer">Microsoft</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Australia hosts over 2 million GitHub developers — ranking 19th globally — with 367,000 new accounts created in the past year, representing a record 21.6% year-over-year growth. Australian developers made 10.7 million open-source contributions annually and ranked 17th globally for AI-repository contributions. Globally, GitHub hosts over 180 million developers and 420 million repositories and is used by over 90% of Fortune 100 companies. GitHub''s annual revenue crossed US$2 billion in 2024 as part of Microsoft''s Intelligent Cloud segment, with Copilot driving over 40% of revenue growth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://securitybrief.com.au/story/australian-developers-embrace-ai-boost-productivity-on-github" target="_blank" rel="noopener noreferrer">SecurityBrief</a>, <a href="https://getlatka.com/blog/github-revenue/" target="_blank" rel="noopener noreferrer">Latka</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>GitHub Copilot surpassed 20 million users globally by mid-2025, holding 42% market share of the AI coding tools market. ANZ Bank deployed Copilot to 3,000 engineers with a measured 42.36% productivity gain. The Australian Government''s Copilot trial reached 7,600 users across 60+ agencies. Microsoft''s AU$5 billion infrastructure investment — expanding Azure capacity by 250% across 29 data centre sites — underpins GitHub''s data residency offering. Data residency expanded to four global regions (EU, Australia, US, Japan) with self-service trials available from May 2025. Six Australian channel partners (Arkahna, Versent/Telstra, Mantel Group, Arinco, Furo, Galah Cyber) extend GitHub''s market reach.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://mlq.ai/news/github-copilot-surpasses-20-million-all-time-users-accelerates-enterprise-adoption/" target="_blank" rel="noopener noreferrer">MLQ</a>, <a href="https://www.microsoft.com/investor/reports/ar24/" target="_blank" rel="noopener noreferrer">Microsoft Annual Report</a></em></p>', 2, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>GitHub''s most significant competitive challenge in Australia comes from Atlassian — an Australian-founded company headquartered in Sydney since 2002. Atlassian''s Bitbucket, with over 10 million registered users and 60 of the Fortune 100, offers an integrated development lifecycle when combined with Jira and Confluence. Atlassian has deep relationships with Australian enterprises, government agencies, and the defence sector, and its products are deeply embedded in project management and documentation workflows. For many Australian organisations, switching from Bitbucket to GitHub involves migrating not just repositories but entire tool ecosystems. However, Bitbucket lacks equivalents to GitHub Copilot or Codespaces, giving GitHub a significant AI advantage that is shifting the competitive dynamic.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.upguard.com/blog/bitbucket-vs-github" target="_blank" rel="noopener noreferrer">UpGuard</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>GitLab — which leads in the Gartner Magic Quadrant for DevOps Platforms — has established a strong Australian presence, particularly among organisations preferring a single-application model with built-in CI/CD that reduces tool sprawl. Nearly 60% of ANZ organisations planned to adopt agile project management software, with over one-third investing in DevOps tools, creating a contested market. Azure DevOps, also owned by Microsoft, creates internal competitive tension — some Australian enterprises already use it for repositories and CI/CD, causing confusion about which Microsoft-owned platform to standardise on.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.computerweekly.com/news/252481620/GitLab-expands-into-Australia-as-DevOps-tooling-market-heats-up" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>In September 2025, Australia''s eSafety Commissioner investigated whether GitHub should be classified as an "age-restricted social media platform" under the Online Safety Amendment Act 2024, which bans social media for under-16s. The investigation drew global ridicule from the developer community. GitHub was ultimately exempted in December 2025, but the episode — with potential fines of AU$49.5 million for non-compliance — highlighted the regulatory risk of operating in a market where technology legislation can be unpredictably broad. The Australian Government''s own Copilot trial also identified cultural barriers to AI adoption including negative stigma around generative AI, lack of trust, and challenges integrating with non-Microsoft products.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.theregister.com/2025/09/25/australia_social_media_ban_github/" target="_blank" rel="noopener noreferrer">The Register</a>, <a href="https://www.digital.gov.au/initiatives/copilot-trial/microsoft-365-copilot-evaluation-report-full/whole-government-adoption-generative-ai" target="_blank" rel="noopener noreferrer">Digital.gov.au</a></em></p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Data sovereignty is the unlock for regulated markets, not a roadmap item.</strong> GitHub had over 2 million Australian users but could not penetrate regulated enterprise sectors — banking, government, defence, telecommunications — until it offered local data residency in February 2025. The launch immediately opened doors that had been closed for years. Companies targeting regulated industries in Australia should treat data residency as a market entry prerequisite, not a future enhancement.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Let flagship customers publish the proof.</strong> ANZ Bank''s peer-reviewed academic paper demonstrating 42.36% productivity gains with GitHub Copilot was more persuasive than any marketing campaign GitHub could have run. The published data gave CIOs and CTOs across Australian enterprises a credible, quantified business case to present to their boards. Companies entering Australia should invest in enabling early customers to publish measurable outcomes — third-party validation carries far more weight than vendor claims.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>AI features create competitive urgency that infrastructure products cannot.</strong> GitHub Copilot transformed the enterprise sales conversation from "should we standardise on GitHub?" to "we need GitHub to access the leading AI coding assistant before competitors do." The 42% market share in AI coding tools created time-sensitive pressure — organisations that delayed risked falling behind peers whose developers were shipping code faster. Companies entering Australia with developer tools should lead with AI-powered capabilities that create competitive urgency, not rely solely on infrastructure improvements.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Hire regional leadership with local credibility, not expatriates.</strong> Appointing Sharryn Napier — Sydney-based, AIIA board member, former New Relic ANZ head — as APAC VP gave GitHub executive presence with deep local networks and industry credibility. Combined with six Australian channel partners, this local leadership approach extended GitHub''s reach without requiring a large direct sales force. Companies entering Australia should prioritise hiring leaders who are already embedded in the local technology community.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Bottom-up developer adoption creates enterprise demand that top-down sales cannot replicate.</strong> With 2+ million Australian developers and 21.6% annual growth, GitHub''s community created internal demand within enterprises long before the sales team arrived. Developers who used GitHub personally pushed their organisations to adopt it formally. This bottom-up dynamic — amplified by 10.7 million annual open-source contributions — is far more powerful than traditional enterprise sales in developer tools. Companies entering Australia with developer-focused products should invest heavily in community and free tiers before attempting enterprise sales.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a>, <a href="https://itwire.com/it-people-news/cio-trends/two-years-later-github-vp-sees-continued-growth-simplification-ai-explosion.html" target="_blank" rel="noopener noreferrer">iTWire</a></em></p>', 5, 'paragraph');
-- ============================================================================
-- ZOOM CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Zoom Entered the Australian Market',
  subtitle = 'From Australia''s first employee in 2017 to 134% ANZ revenue growth: how Zoom rode a pandemic adoption surge, built a 10-year education partnership, and pivoted to an AI-first platform to survive the post-lockdown slowdown',
  read_time = 14,
  meta_description = 'Deep-dive case study on how Zoom grew 134% in ANZ revenue, partnered with AARNet to reach two-thirds of Australian universities, survived Zoombombing and post-pandemic layoffs, and pivoted to AI Companion and Zoom Workplace.',
  sector_tags = ARRAY['technology', 'communications', 'video-conferencing', 'saas', 'cloud-computing', 'remote-work', 'education', 'unified-communications'],
  updated_at = NOW()
WHERE slug = 'zoom-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Unified Communications and AI-First Collaboration Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2017',
  outcome = 'successful',
  business_model = 'B2B/B2C SaaS / Subscription Platform (Freemium)'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry');

-- 3. Delete existing sections and bodies
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry');

DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry');

-- 4. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 5. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Zoom''s Australian presence began in April 2017 when Michael Chetner joined as the company''s first employee in the region, taking the role of Head of Australia and New Zealand. Chetner — previously at Cisco — built a sales and support office in Sydney and established a local data centre through Equinix facilities in both Sydney and Melbourne, ensuring low-latency performance and data residency for Australian customers. Australia was designated as its own distinct data centre region within Zoom''s global infrastructure, allowing paying customers to select Australia for data processing and storage — a critical requirement for enterprise and government accounts operating under the Privacy Act 1988 and Australian Privacy Principles.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.arnnet.com.au/article/705793/zoom-anz-head-michael-chetner-resigns/" target="_blank" rel="noopener noreferrer">ARN</a>, <a href="https://datacenterlocations.com/zoom/" target="_blank" rel="noopener noreferrer">Data Center Locations</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Zoom''s initial go-to-market strategy targeted organisations contending with Australia''s dispersed population and connectivity challenges — positioning video communications as a solution to the geographic barriers that had long constrained collaboration across the country''s vast distances. In its first 18 months, Zoom built strategic partnerships with Slack, Box, and Okta in Australia to provide integrated collaboration and security, and partnered with Workplace by Facebook and Crestron for hardware integration in meeting rooms. Chetner was promoted to Head of Australia and Asia Pacific in November 2018, overseeing expansion across the broader APAC region from Sydney.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>On July 23, 2019, Zoom launched Zoom Phone in Australia — its cloud phone service offering native PSTN access with local phone numbers, Metered and Unlimited Calling Plans, and a Bring Your Own Carrier (BYOC) option allowing organisations to retain existing SIP trunks while migrating to the Zoom platform. Frost &amp; Sullivan analyst Elka Popova called it "a bold foray into the UCaaS market." This flexible deployment model was critical for the Australian market, where enterprises had deep existing relationships with incumbent telcos (Telstra, Optus) and were reluctant to rip and replace established telephony infrastructure. In May 2021, Zoom appointed Dicker Data as its first distributor in Australia and New Zealand, giving its channel partners access to the full product range alongside competing Microsoft Teams and Cisco Webex offerings already in Dicker Data''s portfolio.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.globenewswire.com/news-release/2019/07/23/1886725/0/en/Zoom-Announces-Zoom-Phone-Launch-in-Australia-and-the-United-Kingdom.html" target="_blank" rel="noopener noreferrer">GlobeNewsWire</a>, <a href="https://www.arnnet.com.au/article/688298/dicker-data-inks-nz-distie-deal-zoom/" target="_blank" rel="noopener noreferrer">ARN</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Zoom''s most significant Australian channel partnership preceded its own office. In 2014 — three years before Chetner''s hire — AARNet (Australia''s Academic and Research Network) visited Zoom''s San Jose headquarters to investigate its then-new video conferencing technology and subsequently became the first organisation in Australia to provide licensing and support for Zoom. AARNet, whose shareholders are 38 Australian universities and the CSIRO, provided Zoom with immediate access to over two million end users across Australia''s research and education sector. By hosting Zoom servers on its own network, AARNet delivered a high-bandwidth, high-quality experience with local support and cloud recording integration — effectively giving Zoom an enterprise-grade Australian distribution channel before it had a single employee in the country.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.aarnet.edu.au/aarnet-and-zoom-mark-10-years-transforming-communication-and-collaboration-in-education" target="_blank" rel="noopener noreferrer">AARNet</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>COVID-19 transformed Zoom from a business communications tool into essential infrastructure for work, education, and social connection across Australia. During lockdowns, Zoom usage across AARNet''s education network peaked at 70 times higher than 2019 levels, exceeding 1.2 billion meeting minutes in a single month at the height of eastern states lockdowns. Virtually every Australian organisation — from government departments to schools to aged care facilities — became a Zoom user almost overnight. The platform''s reputation for being easy to deploy, straightforward to use without training, and reliable under extreme demand loads cemented its position as the default video conferencing platform during the most critical adoption window in the history of remote work.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.aarnet.edu.au/zooming-beyond-covid-did-the-pace-of-learning-really-zoom-or-just-the-tools" target="_blank" rel="noopener noreferrer">AARNet</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The AARNet partnership proved transformative for education adoption. By 2024 — the 10-year anniversary of the partnership, celebrated at Zoom''s San Jose headquarters during an Australian American Leadership Dialogue event — AARNet served around two-thirds of Australia''s universities, over 100 K-12 schools, and numerous research institutions as a Zoom reseller. AARNet became Zoom''s first Platinum Partner in Australia. Western Sydney University reported over 10,000 staff and student Zoom users with monthly meeting minutes peaking at over 850,000 minutes. Central Queensland University adopted Zoom for distance education, and the University of Tasmania used it to rethink hybrid learning during and after COVID. Even post-pandemic, education usage remained 10 to 15 times higher than pre-COVID levels.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aarnet.edu.au/aarnet-and-zoom-mark-10-years-transforming-communication-and-collaboration-in-education" target="_blank" rel="noopener noreferrer">AARNet</a>, <a href="https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities" target="_blank" rel="noopener noreferrer">AARNet</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Chetner''s go-to-market strategy targeted Australian tech startups first — winning Canva, Atlassian, and Safety Culture as early customers — before moving upmarket. Winning National Australia Bank (NAB) as an early enterprise adopter provided critical credibility in financial services. Key enterprise customers grew to include REA Group (1,100 regular users, 20 Zoom Rooms, over 6,000 meetings logged), SEEK, The Movember Foundation, and Planet Innovation. Zoom rapidly expanded from pure video conferencing into a unified communications platform encompassing Zoom Phone, Zoom Rooms, Zoom Webinars, and Zoom Contact Center — which launched across ANZ in 2023, entering the contact centre as a service (CCaaS) market with Phil Zammit appointed as Head of Zoom Customer Experience for Asia Pacific and Japan. Zoom Virtual Agent, an AI-powered conversational chatbot, launched alongside. For Australian enterprises, the ability to consolidate multiple communication tools onto a single platform — replacing legacy PBX phone systems, separate webinar tools, and standalone contact centre software — created significant operational savings.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a>, <a href="https://itbrief.com.au/story/zoom-virtual-agent-launch-promises-big-things-for-anz-businesses" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Zoom achieved 134% revenue growth and a 105% increase in its customer base across Australia and New Zealand following its Australian launch, fuelled by what CEO Eric Yuan described as "a demand for easy and secure meeting experiences." Under Chetner''s leadership (2017-2023), the APAC business grew from approximately US$200,000 to triple-digit millions in annual recurring revenue — over 500x growth. APAC accounted for 13% of Zoom''s global revenue at US$140.9 million in FY2023. The Sydney office grew to over 150 employees. During the pandemic peak, AARNet''s education network alone recorded 1.2 billion Zoom meeting minutes in a single month — 70 times the pre-COVID baseline — with post-pandemic usage stabilising at 10-15x pre-COVID levels. Zoom held approximately 56% of the global video conferencing market share in 2025, compared to Microsoft Teams'' 32%, though Teams leads in daily active users (320 million vs 300 million) due to its Microsoft 365 bundling.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a>, <a href="https://electroiq.com/stats/zoom-vs-microsoft-teams-statistics/" target="_blank" rel="noopener noreferrer">ElectroIQ</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Globally, Zoom''s annual revenue reached US$4.665 billion in FY2025 (ending January 2025), with Q3 FY2026 revenue of US$1.23 billion (up 4.4% year-over-year) and enterprise revenue of US$741.4 million. The company reported 4,363 customers contributing more than US$100,000 in trailing 12-month revenue — a 9.2% increase year-over-year — and over 504,900 business customers worldwide. However, total business customers declined from 220,000 in 2023 to 192,600 in late 2024, reflecting the post-pandemic churn of smaller accounts. Zoom''s stock trajectory told the full story: from a US$36 IPO in April 2019 to a US$568 pandemic peak in October 2020 (US$139 billion market cap), then a 90% decline to US$55 in August 2024 (US$18 billion) before recovering to US$77 by March 2026. The product portfolio expanded to include Zoom Workplace, Zoom Phone (native PSTN in 49+ countries), Zoom Contact Center, Zoom Rooms, Zoom Events, and AI Companion — included at no additional cost for paid users, with a Custom AI Add-on at US$12/user/month.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.globenewswire.com/news-release/2025/02/24/3031536/0/en/Zoom-Communications-Reports-Fourth-Quarter-and-Fiscal-Year-2025-Financial-Results.html" target="_blank" rel="noopener noreferrer">GlobeNewsWire</a>, <a href="https://www.macrotrends.net/stocks/charts/ZM/zoom-communications/revenue" target="_blank" rel="noopener noreferrer">MacroTrends</a></em></p>', 2, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Microsoft Teams — bundled at no additional cost with Microsoft 365 — represented Zoom''s most formidable competitive threat in Australia. Many organisations defaulted to Teams simply because they already paid for it, and with 93% of Fortune 100 companies using Teams and strong Australian enterprise adoption, Zoom faced a structural pricing disadvantage in every account where Microsoft 365 was already deployed. Australian Parliamentary Services explicitly banned Zoom and adopted Microsoft Office 365 as its "collaborative platform that has conference facilities." Cisco Webex maintained deep relationships with Australian enterprises, and incumbent telcos (Telstra, Optus) offered their own managed video conferencing solutions with existing billing relationships and local support. As Bede Hackney, who succeeded Chetner as ANZ head in June 2023, acknowledged: "Everyone associates Zoom with just meetings. One of our challenges is to help people see that we''re just so much more than that today."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.arnnet.com.au/article/1253750/zoom-a-nz-lead-video-conferencing-is-our-greatest-strength-and-greatest-challenge.html" target="_blank" rel="noopener noreferrer">ARN</a>, <a href="https://www.demandsage.com/microsoft-teams-statistics/" target="_blank" rel="noopener noreferrer">DemandSage</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Security concerns erupted in early 2020 when rapid consumer adoption outpaced security controls, leading to "Zoombombing" incidents in Australian schools and organisations — uninvited attendees hijacking sessions with offensive material. The Australian Defence Force banned Zoom entirely. AARNet published guidance for Australian education institutions, noting that all customers on their hosted Zoom platform had encryption keys maintained within Australia on AARNet infrastructure. The University of Toronto''s Citizen Lab raised questions about server routing, though Zoom''s infrastructure maintained geo-fencing around China — using a facility owned by Telstra. Zoom responded with 100 new safety features in 90 days, including default meeting passwords, waiting rooms, and enhanced encryption, but the reputational damage required sustained effort to overcome in security-conscious enterprise and government accounts.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.aarnet.edu.au/aarnet-response-to-zoom-security-issues/" target="_blank" rel="noopener noreferrer">AARNet</a>, <a href="https://en.wikipedia.org/wiki/Zoombombing" target="_blank" rel="noopener noreferrer">Wikipedia</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>The post-pandemic correction hit Zoom hard. In February 2023, the company cut 1,300 employees globally — 15% of its workforce — after tripling headcount during the pandemic without, as CEO Yuan admitted, taking "as much time as we should have to thoroughly analyse our teams." Yuan took a 98% salary cut and forfeited his bonus; the executive team took 20% cuts. In Australia, ANZ head Michael Chetner resigned during the same period, and NZ regional sales manager Jaron Burbidge was among those made redundant. Ricky Kapur (APAC head) managed the ANZ region until Bede Hackney — previously Regional VP ANZ at Databricks — was appointed in June 2023. Hackney subsequently expanded the team beyond Sydney to Melbourne and Brisbane, appointed Mike Johnson as Head of Channel for ANZ, and refocused on enterprise upsell and AI-powered platform differentiation. Hackney himself later departed for Sigma Computing, underscoring the leadership instability that characterised Zoom''s post-pandemic transition.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.crn.com.au/news/zoom-australia-and-new-zealand-boss-quits-591268" target="_blank" rel="noopener noreferrer">CRN Australia</a>, <a href="https://www.crn.com.au/news/zoom-names-bede-hackney-as-anz-chief-596488" target="_blank" rel="noopener noreferrer">CRN Australia</a>, <a href="https://fortune.com/2023/02/07/zoom-layoffs-1300-jobs-cut-pandemic-hiring-spree/" target="_blank" rel="noopener noreferrer">Fortune</a></em></p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>A channel partner can build your market before you arrive.</strong> AARNet''s 2014 partnership gave Zoom access to over two million Australian education users three years before it hired its first local employee. By the time Zoom established its Sydney office in 2017, it had an established, paying customer base across two-thirds of Australian universities with locally hosted infrastructure and support. Companies entering Australia should identify sector-specific distributors — like AARNet for education or Telstra for enterprise — who can provide licensing, support, and infrastructure before committing to a local office.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Product simplicity creates adoption velocity that feature breadth cannot replicate.</strong> Zoom''s core advantage — being genuinely easy to use without training — enabled viral adoption during COVID-19 that competitors with more complex products could not match. Usage across AARNet''s network grew 3,000% in a single month. Microsoft Teams had more features and was bundled free with Office 365, but Zoom''s simplicity won the adoption race when speed mattered most. For companies entering Australia, optimising for immediate usability creates adoption velocity that no amount of feature engineering can replicate — especially in crisis-driven adoption scenarios.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Expand the platform before the growth wave crests, not after.</strong> Zoom''s expansion into Phone, Contact Center, Virtual Agent, and AI Companion ensured that pandemic-driven customers had reasons to stay and spend more as initial video conferencing demand normalised. The BYOC option for Zoom Phone — allowing organisations to retain existing SIP trunks — removed the biggest barrier to platform consolidation in risk-averse Australian enterprises. Companies entering Australia should plan their product expansion roadmap before the initial growth wave plateaus, and always offer gradual migration paths rather than requiring rip-and-replace.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Pandemic-scale growth requires pandemic-scale discipline — or the correction will be brutal.</strong> Zoom tripled its workforce during COVID without adequate workforce planning, then cut 15% globally in February 2023. In Australia, the ANZ head resigned, staff were made redundant, and leadership turned over twice in two years. CEO Yuan''s candid admission — "we didn''t take as much time as we should have to thoroughly analyse our teams" — is a cautionary tale for any company experiencing hypergrowth in Australia. Scaling hiring to match demand is essential, but building sustainable team structures matters more than speed. Companies that over-hire during a demand spike will face painful, reputation-damaging layoffs when conditions normalise.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Security incidents in one market become global reputation events — prepare defences before you scale.</strong> Zoombombing incidents in Australian schools and the Australian Defence Force''s ban on Zoom created reputational damage that required sustained effort to overcome in security-conscious enterprise and government accounts. Zoom shipped 100 security fixes in 90 days, but the damage was already done. Companies entering Australia — particularly those serving education and government — should anticipate that security incidents will be amplified by media coverage and regulatory scrutiny, and should invest in security defaults (not just security features) before rapid adoption exposes vulnerabilities at scale.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a>, <a href="https://www.aarnet.edu.au/aarnet-and-zoom-mark-10-years-transforming-communication-and-collaboration-in-education" target="_blank" rel="noopener noreferrer">AARNet</a>, <a href="https://www.arnnet.com.au/article/1253750/zoom-a-nz-lead-video-conferencing-is-our-greatest-strength-and-greatest-challenge.html" target="_blank" rel="noopener noreferrer">ARN</a>, <a href="https://fortune.com/2023/02/07/zoom-layoffs-1300-jobs-cut-pandemic-hiring-spree/" target="_blank" rel="noopener noreferrer">Fortune</a></em></p>', 5, 'paragraph');
-- ============================================================================
-- TESLA CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

UPDATE public.content_items
SET
  title = 'How Tesla Entered the Australian Market',
  subtitle = 'From first Model S deliveries in 2014 to 148 Supercharger sites and 80,000+ cars on the road: how Tesla built Australia''s EV market from scratch — and then faced a wave of competition',
  read_time = 12,
  meta_description = 'Deep-dive case study on how Tesla entered Australia in 2014, built a 148-site Supercharger network, sold 80,000+ vehicles, and navigated rising competition from BYD.',
  sector_tags = ARRAY['electric-vehicles', 'clean-technology', 'automotive', 'energy', 'sustainability', 'infrastructure'],
  updated_at = NOW()
WHERE slug = 'tesla-australia-market-entry';

UPDATE public.content_company_profiles
SET
  industry = 'Electric Vehicles and Clean Energy',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2014',
  outcome = 'successful',
  business_model = 'Direct-to-Consumer / Automotive / Energy'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Tesla delivered its first Model S vehicles in Australia on 9 December 2014, with the first 65 registrations appearing in NSW that quarter. The company opened its first showroom in North Sydney, with plans to expand to Melbourne. The entry strategy focused on the premium market segment — the Model S four-door sedan started at approximately $117,000 for the standard model and exceeded $200,000 for premium versions. Tesla simultaneously unveiled its first two Supercharger stations to establish dedicated charging infrastructure before broader vehicle availability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.teslaowners.org.au/blog/the-first-teslas-in-australia" target="_blank" rel="noopener noreferrer">Tesla Owners Australia</a>, <a href="https://reneweconomy.com.au/tesla-to-launch-in-australia-in-early-december-34518/" target="_blank" rel="noopener noreferrer">RenewEconomy</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Tesla bypassed the traditional dealership model entirely, selling direct-to-consumer through its own showrooms and online platform. This was a deliberate strategic choice that eliminated dealer markups, controlled the customer experience, and gave Tesla direct relationships with every buyer. The approach was controversial in an Australian market dominated by franchise dealer networks, but it allowed Tesla to maintain brand consistency and gather customer data that informed product and service improvements. Showrooms expanded to Melbourne, Brisbane, Perth, and Adelaide over subsequent years.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The Supercharger network buildout defined Tesla''s infrastructure strategy. Starting from two stations in 2014 with plans for eight between Melbourne, Canberra, and Sydney, the network grew to 100 sites by 2024, 148 active sites with over 740 stalls by late 2025, and continues expanding. Tesla opened the network to non-Tesla EVs at 80 locations, transitioning from a proprietary competitive advantage to an industry-wide infrastructure play. The planned 20-stall Goulburn site will be the largest Supercharger in Australia, positioned strategically between Sydney and Canberra.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://thedriven.io/2025/06/30/tesla-surpasses-70000-chargers-globally-as-more-sites-open-in-australia/" target="_blank" rel="noopener noreferrer">The Driven</a>, <a href="https://www.teslarati.com/tesla-plans-largest-australian-supercharger-yet/" target="_blank" rel="noopener noreferrer">Teslarati</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Tesla positioned itself as an aspirational vehicle and lifestyle statement, rivalling luxury performance cars rather than competing on environmental grounds alone. The Model S was marketed as "the fastest accelerating four-door sedan ever built" with zero-to-100km/h in 3.4 seconds and a 500km range. This performance positioning attracted early adopters who might otherwise have purchased BMW, Mercedes, or Porsche vehicles, creating a premium brand halo that later transferred to the more affordable Model 3 and Model Y.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The proprietary Supercharger network was the single most important competitive moat. With 99.5% uptime across the Australian network and repairs completed in days rather than months, Tesla offered charging reliability that no competitor could match. Tesla owners pay $0.61/kWh versus up to $0.85/kWh for non-Tesla EVs using the same chargers — a 39% premium that incentivises buying a Tesla. By building the network before competitors could, Tesla made "range anxiety" largely a non-issue for its customers while it remained a real concern for other EV brands.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://zecar.com/reviews/tesla-supercharger-network-open-all-evs-australia-pricing-access" target="_blank" rel="noopener noreferrer">Zecar</a>, <a href="https://www.tesla.com/en_au/support/charging/supercharging-other-evs" target="_blank" rel="noopener noreferrer">Tesla Australia</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Tesla effectively created the Australian EV market. When it launched in 2014, there were virtually no other electric vehicles available in Australia. By building demand, infrastructure, and public awareness of EVs, Tesla laid the groundwork for the broader market that now has over 100 different EV models available. The South Australia Hornsdale Power Reserve — the world''s largest lithium-ion battery at the time — further cemented Tesla''s brand as a clean energy leader in Australia.</p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Tesla''s Australian delivery milestones illustrate rapid scaling: 10,000th car in 2020, 20,000th in 2021, 40,000th in 2022, and 80,000th in 2023. In 2023, Tesla sold 46,116 vehicles in Australia. Sales declined 17% in 2024 to 38,347 units but Tesla maintained a 42% share of the BEV market. In 2025, deliveries fell further to 28,856 units — a 24.8% decline — though the Model Y remained Australia''s best-selling EV with 22,239 units (up 4.6%). Australia''s total EV market grew to 103,355 BEVs in 2025, surpassing 13% of total car sales for the first time.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://evcentral.com.au/2024-ev-sales-in-australia-a-deep-dive-into-the-electric-car-market-that-saw-tesla-drop-byd-grow-and-10-new-brands-enter-the-market/" target="_blank" rel="noopener noreferrer">EV Central</a>, <a href="https://zecar.com/reviews/australia-ev-sales-2025-complete-year-review" target="_blank" rel="noopener noreferrer">Zecar</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Tesla''s EV market share trajectory tells a story of dominance followed by normalisation. In early 2023, Tesla held over 68% of Australian EV sales. By March 2024, this had declined to 57%. By late 2024, it was approximately 40%. In April 2025, Tesla hit a record low of 8.32% monthly share before refreshed Model Y deliveries provided a rebound. For the full year 2025, Tesla captured roughly 28% of the BEV market. The Supercharger network reached 148 active sites with over 740 stalls, with 80 locations accessible to non-Tesla vehicles.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://thedriven.io/2025/05/12/how-tesla-surrendered-its-dominance-of-australias-ev-market/" target="_blank" rel="noopener noreferrer">The Driven</a>, <a href="https://thedriven.io/2025/06/02/tesla-opens-multiple-new-supercharger-sites-in-past-month-including-for-non-tesla-evs/" target="_blank" rel="noopener noreferrer">The Driven</a></em></p>', 2, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition has intensified dramatically. BYD emerged as the strongest challenger, selling approximately 24,303 units in 2025 and capturing about 24% of the BEV market. Australian consumers now choose from over 100 different EV models compared to just six seven years ago. MG, BMW, Volvo, and Hyundai/Kia have all established strong EV offerings. It is considered unlikely Tesla''s market share will return to previous levels — the era of Tesla as the only credible EV choice in Australia is over.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://thedriven.io/2025/05/12/how-tesla-surrendered-its-dominance-of-australias-ev-market/" target="_blank" rel="noopener noreferrer">The Driven</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>High initial pricing limited the addressable market. At $117,000+, the Model S was accessible only to affluent early adopters. Even the more affordable Model 3 (from approximately $60,000) and Model Y remain above the average Australian new car price. The lack of a sub-$40,000 Tesla gives Chinese competitors like BYD and MG a significant price advantage in the mass market. Australia''s lack of federal EV purchase incentives (unlike many European and Asian markets) further constrained adoption rates, though some state-level stamp duty exemptions and registration discounts have helped.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Brand perception challenges emerged from CEO Elon Musk''s increasingly polarising public profile. While Tesla''s early brand was associated with innovation and sustainability, political controversies have led some Australian consumers to consider alternatives. Service centre availability has also been a persistent concern — with limited service locations compared to traditional dealer networks, wait times for repairs can be longer than Australian consumers expect from premium vehicles.</p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Build the infrastructure before selling the product.</strong> Tesla''s Supercharger network — 148 sites, 740+ stalls, 99.5% uptime — eliminated range anxiety and created a proprietary competitive advantage that took competitors years to approach. For any company entering Australia with a product that requires supporting infrastructure, investing in that infrastructure first (or simultaneously) is essential.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Premium entry creates a brand halo for mass-market expansion.</strong> Starting with the $117,000+ Model S established Tesla as an aspirational brand. When the more affordable Model 3 and Model Y launched, they inherited premium brand equity that Chinese competitors must build from scratch. Companies entering Australia should consider whether a premium launch creates long-term brand value even if it limits initial volume.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Market creation leadership does not guarantee permanent dominance.</strong> Tesla single-handedly created the Australian EV market, but its share dropped from 68% to 28% as competitors entered. The lesson for first movers is that market creation builds brand value but does not prevent competition — especially when lower-cost alternatives arrive. Sustaining leadership requires continuous product innovation and competitive pricing, not just first-mover status.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Direct-to-consumer models work in Australia but require service investment.</strong> Bypassing dealerships gave Tesla brand control and customer data, but limited service centre availability created friction. Companies considering direct-to-consumer models in Australia should plan for service infrastructure commensurate with their sales volume — Australian consumers expect accessible after-sales support regardless of the sales channel.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://evcentral.com.au/2024-ev-sales-in-australia-a-deep-dive-into-the-electric-car-market-that-saw-tesla-drop-byd-grow-and-10-new-brands-enter-the-market/" target="_blank" rel="noopener noreferrer">EV Central</a>, <a href="https://zecar.com/reviews/australia-ev-sales-2025-complete-year-review" target="_blank" rel="noopener noreferrer">Zecar</a></em></p>', 4, 'paragraph');
-- ============================================================================
-- TWILIO CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

UPDATE public.content_items
SET
  title = 'How Twilio Entered the Australian Market',
  subtitle = 'From developer-first platform to enterprise communications backbone: how Twilio opened Sydney and Melbourne offices, won ANZ Bank, and became essential infrastructure for Australian businesses',
  read_time = 10,
  meta_description = 'Deep-dive case study on how Twilio entered Australia in 2018 with offices in Sydney and Melbourne, winning customers including ANZ Bank, Westpac, and Woolworths.',
  sector_tags = ARRAY['cloud-computing', 'communications', 'developer-tools', 'technology', 'saas', 'enterprise-software'],
  updated_at = NOW()
WHERE slug = 'twilio-australia-market-entry';

UPDATE public.content_company_profiles
SET
  industry = 'Cloud Communications Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2018',
  outcome = 'successful',
  business_model = 'B2B SaaS / Usage-based API Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Twilio opened offices in Sydney and Melbourne in 2018, making Australia its 11th country outside the United States and one of six global growth focus markets for the year. The company appointed Richard Watson — a former Oracle and Symantec executive — as its first regional Country Director. COO George Hu framed the expansion: "International expansion represents a significant long-term growth opportunity for Twilio. This move builds on our existing customer and developer momentum in Australia and lays the foundation for building a significant long-term business in Australia and across the APAC Region."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.twilio.com/en-us/press/releases/cloud-communications-platform-twilio-establishes-presence-in-australia-and-appoints-new-regional-director" target="_blank" rel="noopener noreferrer">Twilio Press</a>, <a href="https://www.smartcompany.com.au/startupsmart/news-analysis/cloud-communications-giant-twilio-opens-two-offices-in-australia/" target="_blank" rel="noopener noreferrer">SmartCompany</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Critically, Twilio already had strong developer and partner communities in Australia before opening offices. Over 100 customers including Atlassian, ZipMoney, Domino''s, and Airtasker were using the platform. The formal entry was about adding "feet on the ground" — sales, customer success, service, and support staff — to accelerate growth that was already happening organically. This developer-first model meant Twilio entered Australia with proven product-market fit and existing revenue, reducing the risk of the expansion significantly.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.startupdaily.net/topic/cloud-communications-provider-twilio-opens-australian-office-push-growth/" target="_blank" rel="noopener noreferrer">Startup Daily</a>, <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Watson noted: "This is a testament to the quality of Twilio''s product offering and also to the maturity of the Australian market. There is a strong culture of innovation here and IT leaders in Aussie enterprises recognise the opportunities that new technologies can offer their business." Australia was planned to become Twilio''s fastest-growing region outside North America, with targets of 100%+ growth in the region during 2018. The company started with eight employees and grew rapidly from that base.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://channellife.com.au/story/twilio-boosts-local-presence-first-aussie-office" target="_blank" rel="noopener noreferrer">ChannelLife</a>, <a href="https://which-50.com/twilio-opens-australian-office-to-drive-growth/" target="_blank" rel="noopener noreferrer">Which-50</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Twilio''s developer-first model created organic adoption that enterprise sales teams could then expand. Developers at Australian companies adopted Twilio APIs for specific use cases — SMS notifications, voice calls, video — and usage grew organically until it became strategically important enough to warrant formal enterprise contracts. This bottom-up adoption reduced sales cycle length and provided proof of value before procurement negotiations began.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Major enterprise wins validated Twilio''s transition from developer tool to enterprise infrastructure. ANZ Bank built its ANZ+ app — an innovative home loan origination application — with all communications powered by Twilio, including voice, video, and text. Built by approximately five engineers in Melbourne, it reimagined what banking could look like. Macquarie Bank went live with Twilio Flex for 1,500 users, completing migration in under 12 months. Westpac, Woolworths, and Morgan Stanley also became customers, demonstrating Twilio''s ability to serve highly regulated industries.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itwire.com/business-it-news/enterprise-solutions/twilio-hits-new-highs-in-contact-centre-recognition-while-advocating-for-ai-transparency.html" target="_blank" rel="noopener noreferrer">iTWire</a>, <a href="https://cxdirectory.com.au/technology/call-centre-technology/twilio" target="_blank" rel="noopener noreferrer">CX Directory</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The platform''s breadth became a key differentiator. Twilio evolved from programmable telephony to a comprehensive communications platform: Twilio SendGrid handles approximately a third of the world''s email, Twilio Flex replaced legacy contact centres for companies like Electrolux, and Twilio Segment provides customer data infrastructure. For Australian enterprises, the ability to consolidate voice, SMS, email, video, and contact centre onto a single API-driven platform simplified their communications stack significantly.</p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Twilio entered Australia with 100+ existing customers and targeted 100%+ growth in the region during 2018. Key enterprise wins include ANZ Bank (ANZ+ app built entirely on Twilio), Macquarie Bank (1,500 Flex users migrated in under 12 months), Westpac, Woolworths, Atlassian, Deliveroo, GoGet, Airtasker, and Domino''s. Globally, Twilio powers communications for millions of developers and hundreds of thousands of businesses across 180 countries. Starting from eight employees in 2018, the Australian team grew to support enterprise accounts across financial services, retail, healthcare, and technology.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a>, <a href="https://cxdirectory.com.au/technology/call-centre-technology/twilio" target="_blank" rel="noopener noreferrer">CX Directory</a></em></p>', 1, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Twilio''s primary challenge was transitioning from a self-serve, developer-driven model to a structured enterprise go-to-market approach. Developers could adopt Twilio without procurement approval, but scaling to enterprise contracts required sales processes, security reviews, and compliance certifications that a developer-tools company was not originally built to support. Hiring experienced enterprise sales leadership — like Watson from Oracle/Symantec — was essential to bridge this gap.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Scaling from eight employees while managing 100%+ growth targets required careful prioritisation. The Australian telecommunications regulatory environment added complexity for voice services, and competing with established telcos (Telstra, Optus) for enterprise communications contracts meant overcoming deep incumbent relationships. Usage-based pricing — while attractive for startups — created revenue unpredictability that enterprise CFOs found challenging to budget for compared to fixed-fee alternatives.</p>', 2, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>A developer community can be established remotely before formal entry.</strong> Twilio had 100+ Australian customers before opening an office. The developer-first model proved product-market fit and generated revenue before committing to local infrastructure. Companies with API or developer-facing products should build an Australian developer community before investing in physical presence.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Local presence accelerates growth when organic demand already exists.</strong> Adding sales, success, and support teams in Sydney and Melbourne converted existing developer usage into enterprise contracts with ANZ Bank, Macquarie, Westpac, and Woolworths. The office investment was not speculative — it was capitalising on proven demand. For developer-tools companies, the optimal time to open an Australian office is when organic adoption reaches a threshold that justifies enterprise sales investment.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Hire enterprise sales leadership from adjacent industries.</strong> Appointing Watson from Oracle and Symantec gave Twilio immediate credibility and process maturity in enterprise sales. Developers get you in the door; enterprise sales leaders get you the contract. Companies transitioning from developer-first to enterprise go-to-market in Australia should hire leaders who understand Australian procurement, security requirements, and the relationship-driven nature of enterprise sales.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.twilio.com/en-us/press/releases/cloud-communications-platform-twilio-establishes-presence-in-australia-and-appoints-new-regional-director" target="_blank" rel="noopener noreferrer">Twilio Press</a>, <a href="https://www.arnnet.com.au/article/1265899/twilio-makes-aussie-push-with-former-symantec-channel-talent.html" target="_blank" rel="noopener noreferrer">ARN</a></em></p>', 3, 'paragraph');
-- ============================================================================
-- DOCUSIGN CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

UPDATE public.content_items
SET
  title = 'How DocuSign Entered the Australian Market',
  subtitle = 'From Telstra partnership to APAC headquarters in Sydney: how DocuSign built three data centres, won government contracts, and launched AI contract agents for Australian businesses',
  read_time = 10,
  meta_description = 'Deep-dive case study on how DocuSign established Sydney as its APAC HQ, launched Australian data centres, partnered with Telstra, and targeted public sector digitisation.',
  sector_tags = ARRAY['technology', 'digital-signature', 'enterprise-software', 'saas', 'public-sector', 'legaltech'],
  updated_at = NOW()
WHERE slug = 'docusign-australia-market-entry';

UPDATE public.content_company_profiles
SET
  industry = 'Digital Agreement and Contract Management',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2018',
  outcome = 'successful',
  business_model = 'B2B SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>DocuSign deepened its Australian commitment in 2018 by launching three data centre locations across Sydney, Melbourne, and Canberra, operating as one region servicing the wider APAC area. Microsoft Azure was selected as the data centre provider. The company simultaneously named Sydney as the location for its Asia Pacific headquarters. Brad Newton, then DocuSign''s regional head, explained the move was driven by "the commitment of the Federal Government to digital transformation, and the work that the Digital Transformation Agency has been doing in digitising the citizen experience."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a>, <a href="http://telecomtimes.com.au/files/2018/06/17/docusign-steps-up-australian-market-play-flags-first-local-dcs-confirms-sydney-as-apac-hq/" target="_blank" rel="noopener noreferrer">Telecom Times</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The Telstra partnership was central to DocuSign''s Australian strategy. Telstra acted as partner, customer, and strategic investor through Telstra Ventures, which had invested in DocuSign in 2014. Telstra planned to use DocuSign''s expanded presence to provide customised digital solutions incorporating DocuSign to help federal government departments replace paperwork with secure digital documents. Matthew Koertge, Managing Director at Telstra Ventures, highlighted "strong potential for collaboration between DocuSign and our other portfolio companies such as Whispir, especially in the Government sector."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>In August 2025, DocuSign announced a new local data centre for Q4 2025, expanding capacity to host its Intelligent Agreement Management (IAM) platform. This enables Australian customers to store and process agreement data within Australia under local privacy laws. DocuSign also unveiled AI contract agents — described as the industry''s first purpose-built AI contract agent — designed to accelerate workflows, reduce risk, and improve outcomes across the entire agreement lifecycle. The continued investment reflects DocuSign''s evolution from e-signature tool to comprehensive agreement intelligence platform.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.prnewswire.com/apac/news-releases/docusign-plans-australian-data-centre-answering-national-push-for-digital-sovereignty-and-data-security-302528681.html" target="_blank" rel="noopener noreferrer">PR Newswire</a>, <a href="https://finance.yahoo.com/news/docusign-plans-australian-data-centre-055300321.html" target="_blank" rel="noopener noreferrer">Yahoo Finance</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>DocuSign achieved compliance with rigorous security standards and government frameworks including ISO 27001 and FedRAMP Certification, aligned with the Australian Digital Transformation Agency''s Secure Cloud Strategy. This compliance positioning was critical for government adoption. Federal Government Minister Michael Keenan confirmed trials were already in place, noting that "the Defence Department has a keen interest in this technology as well." For public sector customers, DocuSign''s local data centres addressed data sovereignty requirements that had previously blocked cloud adoption.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.govtechreview.com.au/content/gov-datacentre/news/docusign-launches-australian-data-centres-730674429" target="_blank" rel="noopener noreferrer">GovTech Review</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The Telstra relationship created a triple advantage: distribution (Telstra selling DocuSign to its enterprise customers), validation (Telstra as a customer using the product internally), and investment (Telstra Ventures as a strategic investor providing capital and market intelligence). This partner-customer-investor model gave DocuSign immediate scale and credibility that would have taken years to build through direct sales alone. Having Australia''s largest telco endorse your product eliminates the "unknown American vendor" risk perception that many international companies face.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The public sector digitisation opportunity in Australia was immense. At the time of launch, 61% of Australian citizens still printed or scanned documents to transact with government. DocuSign''s automation allowed organisations to measure turnaround time in minutes rather than days. The COVID-19 pandemic subsequently accelerated digital agreement adoption across both public and private sectors, as remote work made physical document signing impractical. DocuSign was perfectly positioned to capture this demand with local infrastructure already in place.</p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>DocuSign operates three data centre locations across Sydney, Melbourne, and Canberra (with a fourth planned for Q4 2025). Sydney serves as the APAC headquarters. The platform has hundreds of millions of users globally and achieved compliance with ISO 27001, FedRAMP, and alignment with the DTA''s Secure Cloud Strategy. Key Australian customers include government departments, Telstra, and enterprises across financial services, legal, and real estate. The 2025 expansion includes the Intelligent Agreement Management (IAM) platform and AI contract agents, representing DocuSign''s evolution beyond e-signatures.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itbrief.com.au/story/docusign-launches-three-new-data-centre-locations-australia" target="_blank" rel="noopener noreferrer">IT Brief</a>, <a href="https://www.prnewswire.com/apac/news-releases/docusign-plans-australian-data-centre-answering-national-push-for-digital-sovereignty-and-data-security-302528681.html" target="_blank" rel="noopener noreferrer">PR Newswire</a></em></p>', 1, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Overcoming public sector resistance to cloud-based solutions was DocuSign''s primary challenge. Government agencies had deeply embedded paper-based processes and a cultural reluctance to adopt digital agreements — particularly for legally binding documents. Building trust required not just technical compliance certifications but extensive stakeholder engagement, proof-of-concept trials, and patience with lengthy government procurement cycles. The Defence Department''s interest demonstrated demand but also highlighted the stringent security requirements that had to be met.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition from Adobe Sign (integrated with the Adobe Creative Cloud ecosystem), local competitors, and free alternatives like HelloSign created pricing pressure, particularly for small and medium businesses. The evolution from e-signatures to agreement management (IAM) represented both an opportunity and a risk — existing customers needed to be convinced that the expanded platform was worth higher licensing costs, while new competitors emerged in the AI-powered contract analysis space.</p>', 2, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>A partner who is also a customer and investor creates unmatched market access.</strong> Telstra''s triple role — distribution partner, product customer, and strategic investor through Telstra Ventures — gave DocuSign immediate scale, credibility, and market intelligence. Companies entering Australia should seek partners who can serve multiple roles simultaneously, as this alignment of incentives accelerates market penetration far faster than any single relationship type.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Public sector digital transformation creates massive opportunity for prepared entrants.</strong> Australia''s government digitisation agenda created demand for cloud-based solutions, but only vendors with local data centres, security certifications, and patience for procurement cycles could capture it. Companies targeting Australian government contracts should invest in compliance infrastructure well before bidding on contracts.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Using Sydney as an APAC headquarters enables regional expansion.</strong> DocuSign''s decision to base its Asia Pacific headquarters in Sydney — rather than Singapore or Tokyo — reflected the strength of Australia''s regulatory environment, timezone advantages for APAC coverage, and the presence of Telstra as a strategic partner. For companies seeking an APAC hub, Sydney offers a mature market, strong rule of law, and cultural alignment with Western business practices that simplifies regional operations.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a>, <a href="http://telecomtimes.com.au/files/2018/06/17/docusign-steps-up-australian-market-play-flags-first-local-dcs-confirms-sydney-as-apac-hq/" target="_blank" rel="noopener noreferrer">Telecom Times</a></em></p>', 3, 'paragraph');
-- ============================================================================
-- SNOWFLAKE CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

UPDATE public.content_items
SET
  title = 'How Snowflake Entered the Australian Market',
  subtitle = 'From 20 enterprise customers in 10 months to an AI data cloud with 590+ Australian users: how Snowflake built a cloud data platform business through AWS Sydney and Azure expansion',
  read_time = 10,
  meta_description = 'Deep-dive case study on how Snowflake entered Australia in 2017 via AWS Sydney, signed 20 enterprises in 10 months, and evolved into an AI data cloud platform.',
  sector_tags = ARRAY['data-analytics', 'cloud-computing', 'data-warehousing', 'technology', 'enterprise-software', 'ai'],
  updated_at = NOW()
WHERE slug = 'snowflake-australia-market-entry';

UPDATE public.content_company_profiles
SET
  industry = 'Cloud Data Platform and AI',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2017',
  outcome = 'successful',
  business_model = 'B2B SaaS / Consumption-based Cloud Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'snowflake-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Snowflake deployed its cloud data warehouse in the Asia Pacific (Sydney) region via AWS in September 2017 — its fourth global deployment following Oregon, Northern Virginia, and Frankfurt. The Sydney deployment addressed multinational customers with Australian operations and local companies wanting data sovereignty. Simultaneously, Snowflake opened offices in Sydney and Melbourne, appointing Peter O''Connor as Vice President of Sales for Asia Pacific with over 20 years of sales and regional business development experience.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.prnewswire.com/news-releases/snowflake-continues-global-expansion-with-australian-data-center-deployment-300518145.html" target="_blank" rel="noopener noreferrer">PR Newswire</a>, <a href="https://channellife.com.au/story/snowflake-computing-drifts-oz-new-offices-execs" target="_blank" rel="noopener noreferrer">ChannelLife</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The initial go-to-market focused on building a strong ANZ partner ecosystem. Guy Baldwin, Snowflake''s ANZ alliances director, stated that "2018 is all about putting in a strong Australia and New Zealand partner ecosystem to support our key customer use cases." Snowflake subsequently expanded to Azure availability in ANZ, recognising that large numbers of Australian organisations wanted Snowflake on Azure — not just AWS. This multi-cloud strategy removed a significant adoption barrier for enterprises committed to Microsoft''s cloud platform.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia" target="_blank" rel="noopener noreferrer">Computer Weekly</a>, <a href="https://itbrief.co.nz/story/snowflake-available-on-microsoft-azure-for-a-nz-customers" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>By 2025, Snowflake had evolved from a cloud data warehouse into a self-described "AI data cloud" — enabling customers to bring AI to their data rather than moving data to AI models. The Sydney leg of the Snowflake World Tour showcased this transformation. CEO Sridhar Ramaswamy positioned the platform as "an efficient platform for all workloads that helps to reduce complexity," reflecting the shift from pure analytics to AI-powered data infrastructure.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.computerweekly.com/news/366615242/Snowflake-brings-AI-to-data-for-Australian-businesses" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Snowflake''s core proposition — infinite concurrency with effectively unlimited data at a fraction of on-premises costs — resonated strongly in Australia, where enterprises were spending heavily on hardware maintenance for legacy data warehouses. Forrester analyst Tim Sheedy noted that Australian "spending on hardware maintenance is forecast to decrease by 6% in 2018 as more Australian businesses leave their own data centres to embrace public cloud." Snowflake''s separation of storage and compute was a fundamental architectural advantage.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/cloud-based-data-warehousing-at-the-heart-of-today-s-enterprise-snowflake" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The ability to handle both structured and semi-structured data without limitations, combined with fast low-latency access and data sovereignty compliance through the Sydney deployment, addressed the key technical and regulatory barriers to cloud analytics adoption. Local early adopters including Infotrack, Red Balloon, and Fitness and Lifestyle Group demonstrated product-market fit across diverse industries. A Forrester Research report indicated potential 600% return on investment for Snowflake customers — a compelling economic argument for CFOs evaluating cloud data platform investments.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Multi-cloud availability — spanning AWS, Azure, and Google Cloud — became a critical success factor as Australian enterprises adopted hybrid cloud strategies. Rather than forcing customers to choose a specific cloud provider, Snowflake worked across all three, reducing lock-in concerns and expanding the addressable market. The partner ecosystem further amplified reach, with consulting firms and system integrators building practices around Snowflake implementation and migration.</p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Snowflake signed 20 Australian enterprises within ten months of opening a local office, with another 20 in the pipeline and half a dozen proofs of concept underway in New Zealand. By 2025, approximately 590 companies use Snowflake in Australia. Globally, the platform serves over 10,000 customers and 10,000 partners running more than five billion jobs daily. Snowflake is available across AWS, Azure, and Google Cloud in Australia, with offices in Sydney and Melbourne supporting the ANZ customer base.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia" target="_blank" rel="noopener noreferrer">Computer Weekly</a>, <a href="https://theirstack.com/en/technology/snowflake/au" target="_blank" rel="noopener noreferrer">TheirStack</a></em></p>', 1, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Data sovereignty and latency were significant initial barriers. Australian enterprises with strict data residency requirements needed assurance that their data would remain within Australian borders. The Sydney AWS deployment addressed this, but customers on Azure had to wait longer for local availability. Snowflake''s consumption-based pricing model — while attractive for variable workloads — meant customers who increased their analytics usage often saw higher-than-expected bills, creating a different kind of cost concern from the fixed-cost legacy systems they were replacing.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition from Databricks — offering a unified analytics and AI platform — Google BigQuery, and AWS Redshift created pressure from multiple directions. Each competitor offered different pricing models and architectural approaches. The evolution from data warehousing to AI workloads required Snowflake to expand its capabilities rapidly, competing against Databricks'' established strengths in machine learning and model training. Many Australian enterprises also struggled with fragmented data across multiple sources, requiring extensive data engineering before Snowflake could deliver value.</p>', 2, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Local cloud deployment is the prerequisite for enterprise adoption.</strong> Snowflake''s Sydney AWS deployment was the enabling move — without local data residency, Australian enterprises in regulated industries could not evaluate the platform. Companies entering Australia with cloud-based products should deploy locally before investing in sales teams.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Multi-cloud strategy removes adoption barriers.</strong> Supporting AWS, Azure, and Google Cloud meant Snowflake never lost a deal because the customer was committed to a different cloud provider. In Australia, where enterprises increasingly adopt multi-cloud strategies, single-cloud dependency is a competitive disadvantage for data platform vendors.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'snowflake-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Partner ecosystem development must start immediately.</strong> Snowflake dedicated 2018 to building ANZ partners because enterprise data platform deployments require consulting and integration expertise. The 590+ Australian customers by 2025 were largely acquired and supported through partners. Companies entering Australia with complex enterprise products should invest in partner enablement from day one — without implementation partners, even the best product remains undeployed.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.prnewswire.com/news-releases/snowflake-continues-global-expansion-with-australian-data-center-deployment-300518145.html" target="_blank" rel="noopener noreferrer">PR Newswire</a>, <a href="https://www.computerweekly.com/news/252448438/Snowflake-making-headway-in-Australia" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 3, 'paragraph');
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
-- ============================================================================
-- PALANTIR CASE STUDY DEEP REWRITE
-- ============================================================================

UPDATE public.content_items SET
  title = 'How Palantir Technologies Entered the Australian Market',
  subtitle = 'From $7.1 million Defence contracts to IRAP PROTECTED certification and a $100 million Future Fund stake: how the controversial data analytics firm embedded itself in Australian government and enterprise',
  read_time = 12,
  meta_description = 'Deep-dive case study on how Palantir entered Australia with Defence contracts, achieved IRAP PROTECTED certification, signed Coles, and navigated political scrutiny.',
  sector_tags = ARRAY['data-analytics', 'ai', 'defense', 'technology', 'government', 'national-security'],
  updated_at = NOW()
WHERE slug = 'palantir-australia-market-entry';

UPDATE public.content_company_profiles SET
  industry = 'Data Analytics, AI, and National Security',
  business_model = 'B2B/B2G Enterprise Software / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'palantir-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Palantir has been working with Australian government agencies since 2013, accumulating over $50 million in government contracts largely across defence and national security agencies. The company deployed the Palantir Platform Australia (PPA) to deliver advanced cloud services including Foundry and AIP, hosted in Australian AWS regions. The initial entry was through defence and intelligence — the most difficult but most lucrative government sector — establishing Palantir as a trusted provider of data analytics for national security applications. Mike Kelly leads Palantir''s Australian operations.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.defenceconnect.com.au/industry/17697-palantir-secures-7-6-million-defence-contract-to-supply-ict-system-platform" target="_blank" rel="noopener noreferrer">Defence Connect</a>, <a href="https://honisoit.com/2026/02/australias-100-million-investment-in-palantir-technology-giant-and-partner-of-us-and-israeli-defence-forces/" target="_blank" rel="noopener noreferrer">Honi Soit</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The pivotal milestone came in November 2025, when Palantir achieved IRAP PROTECTED level certification — a key requirement for handling sensitive government information. The assessment was conducted by an independent third-party assessor in line with Australian Signals Directorate (ASD) requirements. Kelly described it as "a key milestone for Palantir in Australia and a testament to our deep and ongoing commitment to security." The certification unlocked a broader range of Australian government agencies and commercial organisations as potential customers for the Foundry and AIP platforms.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://investors.palantir.com/news-details/2025/Palantir-Achieves-Information-Security-Registered-Assessors-Program-IRAP-PROTECTED-Level-Unlocking-New-Opportunities-in-Australia/" target="_blank" rel="noopener noreferrer">Palantir Investors</a></em></p>', 2, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Palantir pursued a dual-track strategy serving both government and commercial customers. In October 2024, it secured a new three-year contract with the Department of Defence valued at AUD $7.15 million, covering data analytics and services through December 2027. Simultaneously, the company expanded into commercial enterprise — most notably signing a three-year deal with Coles in 2024 to optimise workforce management across 840+ supermarkets using Foundry to analyse over 10 billion rows of operational data.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.canberratimes.com.au/story/9178631/defence-awards-palantir-76m-defence-contract/" target="_blank" rel="noopener noreferrer">Canberra Times</a>, <a href="https://www.crikey.com.au/2026/03/09/palantir-defence-contract-australia-embedding-staff-data-mining/" target="_blank" rel="noopener noreferrer">Crikey</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Palantir''s success in Australia rests on its ability to handle massive, complex datasets that traditional analytics tools cannot manage. The Coles deployment — analysing 10 billion rows of data across 840+ stores for workforce optimisation, cost reduction, and merchandising — demonstrates the platform''s scalability for commercial use cases. The IRAP PROTECTED certification, while primarily enabling government work, also provides commercial customers with assurance about the platform''s security posture.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The rapid adoption of AI drove strong returns for investors. The 2024 financial report of Palantir Technologies Australia Pty Ltd shows $25.5 million in revenue from customer contracts. Australia''s Future Fund — the sovereign wealth fund — held 498,339 shares of Palantir valued at $103.6 million as of June 2025, having grown nearly 100 times from approximately $1.6 million in February 2023. This institutional endorsement from Australia''s own sovereign fund created a powerful credibility signal.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://honisoit.com/2026/02/australias-100-million-investment-in-palantir-technology-giant-and-partner-of-us-and-israeli-defence-forces/" target="_blank" rel="noopener noreferrer">Honi Soit</a>, <a href="https://ryxel.ai/news/technology/2025/11/20/palantir-stock-gains-australian-irap-security-approval" target="_blank" rel="noopener noreferrer">Ryxel</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Palantir has secured over $50 million in Australian government contracts since 2013. The Australian subsidiary reported $25.5 million in revenue from customer contracts in 2024. Australia''s Future Fund holds $103.6 million in Palantir shares (June 2025). Key contracts include a $7.15 million three-year Defence deal (2024-2027), a three-year Coles partnership covering 840+ stores and 10 billion data rows, and IRAP PROTECTED certification achieved November 2025. Palantir''s stock surged 4.6% on the IRAP news, reflecting market recognition of the Australian opportunity.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://investors.palantir.com/news-details/2025/Palantir-Achieves-Information-Security-Registered-Assessors-Program-IRAP-PROTECTED-Level-Unlocking-New-Opportunities-in-Australia/" target="_blank" rel="noopener noreferrer">Palantir Investors</a>, <a href="https://www.defenceconnect.com.au/industry/17697-palantir-secures-7-6-million-defence-contract-to-supply-ict-system-platform" target="_blank" rel="noopener noreferrer">Defence Connect</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Palantir faces intense political scrutiny in Australia. The Greens called for an immediate freeze on government contracts with the company, citing its international operations and relationships with US and Israeli defence forces. Crikey reported that Palantir embeds staff within Defence and mines Australian data under its contracts. In July 2025, the company hired lobbying firm CMAX Advisory — founded by a former chief of staff to Labor Defence Minister Joel Fitzgibbon — to manage political relationships. Defence skipped competitive tender processes for some Palantir contracts, drawing additional criticism.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://michaelwest.com.au/we-kill-enemies-spy-firm-palantir-secures-top-australian-security-clearance/" target="_blank" rel="noopener noreferrer">Michael West Media</a>, <a href="https://www.crikey.com.au/2026/03/09/palantir-defence-contract-australia-embedding-staff-data-mining/" target="_blank" rel="noopener noreferrer">Crikey</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Vendor lock-in concerns are a persistent challenge for both government and commercial customers. Once an organisation builds operational processes around Palantir''s Foundry platform, switching costs become substantial. Critics argue this dependency creates an unhealthy reliance on a single vendor for critical data infrastructure. The company''s opaque pricing model and the fact that its Australian financial reports are not audited add to transparency concerns. Balancing commercial expansion (Coles) with government security requirements also creates reputational complexity.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Security certifications are the gateway to government revenue.</strong> IRAP PROTECTED certification unlocked an entire tier of Australian government agencies. The 13-year journey from first Defence contract to PROTECTED certification shows that government trust is earned incrementally. Companies targeting Australian government work should begin the compliance journey years before they expect to bid on contracts.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>A dual government-commercial strategy diversifies risk.</strong> Palantir''s expansion from Defence contracts to the Coles partnership demonstrates that government credibility can be leveraged for commercial customer acquisition. The security standards required for government work provide assurance that commercial customers value — Coles chose a platform trusted by Defence to handle its own sensitive operational data.</p>', 2, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'palantir-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Prepare for political and media scrutiny proportional to your government exposure.</strong> Palantir''s government contracts attracted Greens opposition, investigative journalism, and public debate about data sovereignty and vendor dependency. Companies entering the Australian government market should invest in government relations, transparent reporting, and proactive stakeholder engagement — the political scrutiny is a feature of the market, not a bug.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://michaelwest.com.au/we-kill-enemies-spy-firm-palantir-secures-top-australian-security-clearance/" target="_blank" rel="noopener noreferrer">Michael West Media</a>, <a href="https://investors.palantir.com/news-details/2025/Palantir-Achieves-Information-Security-Registered-Assessors-Program-IRAP-PROTECTED-Level-Unlocking-New-Opportunities-in-Australia/" target="_blank" rel="noopener noreferrer">Palantir Investors</a></em></p>', 3, 'paragraph');
-- ============================================================================
-- XERO CASE STUDY DEEP REWRITE
-- ============================================================================

UPDATE public.content_items SET
  title = 'How Xero Entered the Australian Market',
  subtitle = 'From New Zealand startup to Australia''s cloud accounting leader: how a partner-led B2B2C strategy captured 90% of subscriptions through accountants and built a 4.2 million subscriber platform',
  read_time = 10,
  meta_description = 'Deep-dive case study on how New Zealand-based Xero captured the Australian cloud accounting market with 90% of subscriptions via accounting partners and 4.2M subscribers.',
  sector_tags = ARRAY['fintech', 'cloud-computing', 'accounting', 'saas', 'technology', 'small-business'],
  updated_at = NOW()
WHERE slug = 'xero-australia-market-entry';

UPDATE public.content_company_profiles SET
  industry = 'Cloud Accounting Software',
  origin_country = 'New Zealand',
  entry_date = '2009',
  business_model = 'B2B2C SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'xero-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Xero pursued a partner-led strategy targeting financial intermediaries — accountants and bookkeepers — rather than selling directly to small business end users. Founded in New Zealand in 2006, Xero entered the Australian market in 2009, leveraging the geographic and cultural proximity of its home market to expand across the Tasman. The company provided an extensive partner programme, exclusive events, awards, and direct human connection through face-to-face engagement to build trust with the accounting profession.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The B2B2C model was deliberate: accountants recommend accounting software to their small business clients, effectively becoming a sales force for Xero without Xero needing to acquire each small business individually. This channel strategy proved remarkably efficient — in Australia and New Zealand, more than 90% of paid subscriptions came from accounting partners. Xero invested heavily in Xerocon, its annual partner conference, which grew to 3,000+ attendees rotating across Australian cities, creating a community that competitors found difficult to replicate.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 2, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Xero''s cloud-first approach disrupted a market dominated by MYOB''s desktop accounting software. By offering real-time bank feeds, seamless integration with thousands of Australian banks, and a mobile-first experience, Xero made cloud accounting accessible to small businesses and their advisers who were accustomed to desktop-era software. The "Beautiful business" tagline positioned Xero as a lifestyle brand, not just an accounting tool — an unusual but effective positioning in a traditionally dry software category.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Cloud disruption timing was Xero''s biggest advantage. Australia''s small business sector was ready for cloud accounting but lacked a compelling alternative to desktop-installed software. Xero filled this gap with a product that offered real-time data, automatic bank reconciliation, and integrations with hundreds of third-party apps. Social proof compounded — Xero won the Canstar Blue award for most satisfied customers four years in a row, building trust in a market where financial software reliability is non-negotiable.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The ecosystem strategy extended beyond accounting partners. Xero built an app marketplace with over 1,000 integrations — from point-of-sale systems to payroll to inventory management — making it the centre of small business operations rather than just an accounting ledger. Each integration increased switching costs for customers and created revenue opportunities for partners. The platform became sticky because replacing Xero meant replacing an entire ecosystem of connected tools.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Xero grew from 1.3 million subscribers in 2018 to over 4.2 million globally by 2025, with Australia and New Zealand as its largest and most mature market. The company added 351,000 subscribers in the year to March 2018 alone — 30% growth. More than 90% of ANZ paid subscriptions came through accounting partners. Xero held the #2 organic search ranking for "accounting software" in Australia and top-5 positions for nearly 1,500 brand keywords. Market capitalisation exceeded NZ$20 billion. Australia became the company''s proof-of-concept market before expanding to the UK, US, and Asia.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Convincing traditional accountants to move from established desktop software — primarily MYOB, which had dominated Australian accounting for decades — required overcoming deep-seated habits and concerns about cloud security for financial data. Many accounting practices had built their entire workflow around MYOB and were reluctant to retrain staff and migrate client data. Xero had to demonstrate that cloud-based financial data was as secure as locally stored data, and that the benefits of real-time access and automatic updates justified the disruption of switching.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition intensified as MYOB launched its own cloud products and Intuit brought QuickBooks Online to Australia. Price competition squeezed margins, and the need to continuously invest in product development — particularly AI-powered features, payroll compliance, and tax reporting — required sustained R&D investment. The Australian regulatory environment for payroll (Single Touch Payroll) and tax reporting created compliance complexity that Xero had to solve ahead of competitors to maintain its market leadership.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>B2B2C through professional intermediaries scales faster than direct-to-consumer.</strong> Targeting accountants rather than small businesses directly gave Xero a leveraged distribution channel — each accounting practice brought dozens or hundreds of small business clients. This model achieved 90%+ partner-sourced subscriptions in ANZ, demonstrating that for professional software, the adviser is the customer to win.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Event marketing builds community that competitors cannot replicate.</strong> Xerocon — with 3,000+ attendees rotating across Australian cities — created a community of accounting professionals who identified with the Xero brand. This emotional connection, built through in-person events over years, is a competitive moat that no amount of feature parity can overcome.</p>', 2, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'xero-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Geographic proximity accelerates cross-border expansion.</strong> New Zealand to Australia was Xero''s first international expansion — a market with similar regulatory frameworks, cultural alignment, and timezone compatibility. For companies from New Zealand, Singapore, or other APAC nations, Australia offers a natural first international market with lower cultural and regulatory barriers than more distant geographies.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.webprofits.com.au/blog/xero-growth-strategy" target="_blank" rel="noopener noreferrer">Web Profits</a></em></p>', 3, 'paragraph');
-- ============================================================================
-- UIPATH CASE STUDY DEEP REWRITE
-- ============================================================================

UPDATE public.content_items SET
  title = 'How UiPath Entered the Australian Market',
  subtitle = 'From robotic process automation to agentic AI: how UiPath launched its next-generation platform in Australia with 75,000+ agent runs and an 8-year partner ecosystem',
  read_time = 10,
  meta_description = 'Deep-dive case study on how UiPath entered Australia with its automation platform, partnered with Ashling Partners for 8+ years, and launched agentic AI capabilities.',
  sector_tags = ARRAY['rpa', 'ai', 'automation', 'enterprise-software', 'technology', 'agentic-ai'],
  updated_at = NOW()
WHERE slug = 'uipath-australia-market-entry';

UPDATE public.content_company_profiles SET
  industry = 'Enterprise Automation and AI',
  origin_country = 'Romania',
  entry_date = '2018',
  business_model = 'B2B SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'uipath-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>UiPath launched its next-generation enterprise automation platform in Australia in June 2025 with events in Sydney and Melbourne. Founded in Romania in 2005, UiPath had built a presence in Australia through implementation partners over several years before this formal platform launch. The company''s strategy focused on agentic automation — using a controlled agency model with operational guardrails that addressed Australian enterprises'' concerns about AI reliability and governance. The partnership with Google Cloud for the Agent2Agent (A2A) protocol positioned UiPath at the forefront of AI agent interoperability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The eight-year partnership with Ashling Partners Australia provided a foundation for the formal launch. Ashling Partners — a specialist automation consultancy — brought deep implementation experience across Australian industries and demonstrated that long-term local partnerships could substitute for extensive direct presence during the early market development phase. UiPath complemented this with broader partner training, equipping over 450 partners for agentic automation implementation before the platform''s general availability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>UiPath addressed specific Australian barriers to AI adoption that other vendors glossed over. Security and compliance risks, reliability issues, halted pilot programmes, and concerns over vendor dependency were explicitly addressed through the controlled agency model. UiPath Maestro provided orchestration capabilities that gave enterprises visibility into and control over AI agent behaviour — a critical differentiator in highly regulated industries like insurance, finance, and healthcare where automation of claims adjudication, loan origination, and patient record management requires auditability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The evolution from traditional RPA (robotic process automation) to agentic AI represented a significant positioning shift. While early UiPath adoption in Australia focused on automating repetitive, rule-based tasks — data entry, invoice processing, report generation — the agentic platform enables semi-autonomous and autonomous agents that can handle complex, multi-step workflows requiring judgment. This evolution matched the growing sophistication of Australian enterprise automation ambitions, moving beyond simple task automation to business process transformation.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Since the private preview began in January 2025, UiPath has seen the creation of thousands of semi-autonomous and autonomous agents, more than 75,000 agent runs, and over 450 partners engaged in agentic automation training. Hundreds of customer scenarios are now in operation globally. The eight-year partnership with Ashling Partners demonstrates sustained commitment to the Australian market. UiPath targets highly regulated industries — insurance, finance, healthcare, and government — where automation delivers the highest ROI due to the volume and complexity of repetitive processes.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>The primary barriers to AI and automation adoption in Australia include security and compliance risks (cited by the majority of enterprises), reliability issues that have halted pilot programmes, and deep concerns over vendor dependency. Many Australian enterprises began automation projects with enthusiasm but stalled at the proof-of-concept stage when the complexity of integrating with legacy systems became apparent. UiPath''s controlled agency model with operational guardrails directly addresses these concerns, but changing the perception that automation pilots frequently fail requires sustained customer education.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition in the Australian automation market is intense. Microsoft Power Automate — bundled with Microsoft 365 — offers a free or low-cost entry point for basic automation. Automation Anywhere and other RPA vendors compete directly for enterprise contracts. The emergence of AI coding assistants and large language models that can generate automation scripts threatens the traditional RPA value proposition. UiPath must continually demonstrate that its agentic platform offers governance, orchestration, and enterprise-grade reliability that general-purpose AI tools cannot match.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Long-term local partnerships build a foundation before formal launch.</strong> UiPath''s 8-year partnership with Ashling Partners created implementation capability, customer references, and market understanding before the company invested in a formal Australian platform launch. Companies entering Australia — particularly those from smaller origin markets — can use specialist partners to validate demand and build credibility before committing to direct presence.</p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Address adoption barriers explicitly, not just product features.</strong> UiPath''s controlled agency model with operational guardrails directly addresses the security, reliability, and vendor dependency concerns that have stalled automation projects across Australian enterprises. Rather than leading with capabilities, the company leads with risk mitigation — a positioning that resonates strongly in risk-averse Australian enterprise and government procurement environments.</p>', 2, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'uipath-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Partner training at scale creates ecosystem readiness.</strong> Training 450+ partners before launch ensured that when enterprises were ready to adopt agentic automation, there were qualified implementation partners available. Private preview programmes — allowing early customers to validate the platform — provide proof points that reduce risk for subsequent adopters. Companies launching complex enterprise products in Australia should invest in partner enablement and early customer validation before general availability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://itbrief.com.au/story/uipath-launches-next-generation-automation-platform-in-australia" target="_blank" rel="noopener noreferrer">IT Brief</a></em></p>', 3, 'paragraph');
