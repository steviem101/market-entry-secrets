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
