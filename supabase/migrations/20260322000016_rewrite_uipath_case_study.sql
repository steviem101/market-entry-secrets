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
