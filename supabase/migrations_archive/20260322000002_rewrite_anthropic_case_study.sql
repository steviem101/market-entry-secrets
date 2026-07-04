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
