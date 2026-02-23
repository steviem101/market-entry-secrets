-- ============================================================================
-- IDEMPOTENT CASE STUDIES UPSERT PART 2: OpenAI, Anthropic, AWS, Salesforce, Amazon
-- ============================================================================

-- ===================== OPENAI =====================
DELETE FROM public.content_items WHERE slug = 'openai-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'openai-australia-market-entry',
  'How OpenAI Entered the Australian Market',
  'Full-scale market push with local headquarters, free ChatGPT access for thousands of start-ups, and major enterprise partnerships',
  'case_study', 'published', true, 8,
  'Learn how OpenAI launched its Australian expansion in 2025 with local HQ, VC partnerships, and a strategy to secure distribution, talent and infrastructure.',
  ARRAY['ai', 'technology', 'artificial-intelligence', 'saas'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'OpenAI', 'AI', 'United States', 'Australia', '2025', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Sam Altman', 'CEO, OpenAI', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'openai-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>OpenAI executed a full-scale market push with local headquarters in Australia, offering free access to ChatGPT for thousands of Australian start-ups backed by the country''s three largest venture capital firms, and securing major enterprise partnerships. Their strategy focused on securing distribution, talent and infrastructure.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://theinvestorstandard.com.au/2025/12/03/openai-australia-expansion-marks-a-new-phase-in-the-countrys-ai-race/" target="_blank" rel="noopener noreferrer">The Investor Standard</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>OpenAI leveraged first-mover advantage as a pioneer of artificial intelligence and the world''s most valuable private company valued at US$500 billion. They achieved rapid market penetration through partnerships with venture capital firms and government organizations.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://theinvestorstandard.com.au/2025/12/03/openai-australia-expansion-marks-a-new-phase-in-the-countrys-ai-race/" target="_blank" rel="noopener noreferrer">The Investor Standard</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Valued at US$500 billion as the world''s most valuable private company. Providing free services to thousands of Australian start-ups through partnerships with Australia''s three largest venture capital firms.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://theinvestorstandard.com.au/2025/12/03/openai-australia-expansion-marks-a-new-phase-in-the-countrys-ai-race/" target="_blank" rel="noopener noreferrer">The Investor Standard</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>OpenAI faced challenges navigating an uncertain policy landscape as Australia positions itself in the global AI economy. They also faced competition from rivals like Google, Anthropic, and DeepSeek in the rapidly evolving AI market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://theinvestorstandard.com.au/2025/12/03/openai-australia-expansion-marks-a-new-phase-in-the-countrys-ai-race/" target="_blank" rel="noopener noreferrer">The Investor Standard</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'openai-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>OpenAI''s Australian expansion highlights the importance of securing local presence early to establish distribution channels, talent pipelines, and infrastructure before competitors gain deeper market roots.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://theinvestorstandard.com.au/2025/12/03/openai-australia-expansion-marks-a-new-phase-in-the-countrys-ai-race/" target="_blank" rel="noopener noreferrer">The Investor Standard</a></em></p>', 1, 'paragraph');


-- ===================== ANTHROPIC =====================
DELETE FROM public.content_items WHERE slug = 'anthropic-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'anthropic-australia-market-entry',
  'How Anthropic Entered the Australian Market',
  'Low-key, strategic approach focused on building relationships behind the scenes with the local tech ecosystem',
  'case_study', 'published', true, 8,
  'Discover how Anthropic quietly began its Australian charm offensive in 2026, sponsoring major conferences and building developer relationships.',
  ARRAY['ai', 'technology', 'artificial-intelligence', 'saas'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Anthropic', 'AI', 'United States', 'Australia', '2026', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Dario Amodei', 'CEO & Co-founder, Anthropic', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'anthropic-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Anthropic took a low-key, strategic approach focused on building relationships behind the scenes with the local tech ecosystem. Their major sponsorship of Blackbird''s annual Sunrise conference enabled engagement with VCs and ecosystem figures. This approach contrasts sharply with OpenAI''s splashy launch strategy.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.capitalbrief.com/article/anthropic-quietly-begins-its-australian-charm-offensive-398a6aaf-680f-4026-b222-ac32c6d3d066/" target="_blank" rel="noopener noreferrer">Capital Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Anthropic''s Claude AI model outperformed OpenAI''s GPT-5.2 on key benchmarks and became the preferred tool among many developers. The company maintained a strong global funding position with USD$30 billion raised at a USD$380 billion valuation.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.capitalbrief.com/article/anthropic-quietly-begins-its-australian-charm-offensive-398a6aaf-680f-4026-b222-ac32c6d3d066/" target="_blank" rel="noopener noreferrer">Capital Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Global valuation of USD$380 billion with USD$30 billion in funding raised. Claude Code revenue surging globally, positioning Anthropic as a formidable competitor in the AI space.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.capitalbrief.com/article/anthropic-quietly-begins-its-australian-charm-offensive-398a6aaf-680f-4026-b222-ac32c6d3d066/" target="_blank" rel="noopener noreferrer">Capital Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Anthropic faced the challenge of following competitor OpenAI''s high-profile Australian launch while maintaining a lower-profile approach. As of early 2026, no local hires had been announced and no physical office opening was on the immediate horizon.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.capitalbrief.com/article/anthropic-quietly-begins-its-australian-charm-offensive-398a6aaf-680f-4026-b222-ac32c6d3d066/" target="_blank" rel="noopener noreferrer">Capital Brief</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'anthropic-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Different market entry approaches can be effective — quiet relationship building versus high-profile launches. Technical superiority (Claude outperforming competitors on key benchmarks) can drive adoption without aggressive marketing, demonstrating that product quality remains the strongest go-to-market strategy.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.capitalbrief.com/article/anthropic-quietly-begins-its-australian-charm-offensive-398a6aaf-680f-4026-b222-ac32c6d3d066/" target="_blank" rel="noopener noreferrer">Capital Brief</a></em></p>', 1, 'paragraph');


-- ===================== AWS =====================
DELETE FROM public.content_items WHERE slug = 'aws-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'aws-australia-market-entry',
  'How Amazon Web Services (AWS) Entered the Australian Market',
  'Multi-region infrastructure strategy with AU$20 billion investment commitment for data centers and AI capabilities',
  'case_study', 'published', false, 8,
  'Learn how AWS built deep Australian market presence since 2012 with multiple regions, government partnerships, and a AU$20 billion investment plan.',
  ARRAY['cloud-computing', 'technology', 'infrastructure', 'ai'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Amazon Web Services (AWS)', 'Cloud Computing', 'United States', 'Australia', '2012', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Matt Garman', 'CEO, Amazon Web Services', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>AWS pursued a multi-region infrastructure strategy starting with the Asia Pacific Sydney Region in 2012, expanded with Melbourne Region (2023), Perth Local Zones (2023), and a Top Secret AWS Cloud partnership with the Australian Government for national security and defense. They committed AU$20 billion in investment (2025-2029) for data center infrastructure and AI capabilities.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Key success factors included meeting local data residency and regulatory requirements, large-scale digital skills training (400,000+ people trained since 2017), commitment to sustainability with 11 renewable energy projects, and deep integration with both public and private sectors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>AU$20 billion planned investment 2025-2029; AU$467 million invested in renewable energy 2020-2022; 400,000+ people trained in digital skills since 2017; 11 renewable energy projects (8 current, 3 planned); 170-megawatts combined capacity across three new solar farms; 1.4 million megawatt hours of carbon-free energy estimated annually.</p>
<p>Strong growth in customer demand for cloud computing and artificial intelligence driving the AU$20 billion expansion investment. Used by hundreds of thousands of organizations in Australia including major entities like ANZ Bank, Canva, and Telstra. AWS accounts for approximately 30% of the global cloud infrastructure market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>AWS needed to address Australian data sovereignty requirements and build local infrastructure to meet regulatory demands. Balancing rapid expansion with sustainability commitments and managing the complexity of government-grade security (Top Secret Cloud) presented ongoing challenges.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Long-term commitment to local infrastructure, data sovereignty, and sustainability initiatives drives deep market penetration. Skills training and ecosystem development create lasting competitive advantages that are difficult for competitors to replicate.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a></em></p>', 1, 'paragraph');


-- ===================== SALESFORCE =====================
DELETE FROM public.content_items WHERE slug = 'salesforce-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'salesforce-australia-market-entry',
  'How Salesforce Entered the Australian Market',
  'Strategic expansion through $2.5 billion investment focused on AI innovation, workforce upskilling, and sustainability programs',
  'case_study', 'published', false, 8,
  'Discover how Salesforce built a 2,400+ employee Australian operation since 2004, projecting 245,000 ecosystem jobs by 2028.',
  ARRAY['cloud-computing', 'crm', 'ai', 'enterprise-software', 'saas'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Salesforce', 'Cloud CRM and AI', 'United States', 'Australia', '2004', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Marc Benioff', 'Chair & CEO, Salesforce', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'salesforce-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Salesforce pursued strategic expansion through a $2.5 billion investment over five years focused on AI innovation, launching Agentforce AI-powered customer management software, workforce upskilling initiatives, and sustainability programs aligned with Australia''s National AI Capability Plan.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.eweek.com/news/ai-australia-salesforce-agentforce/" target="_blank" rel="noopener noreferrer">eWeek</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Salesforce established a strong local presence with over 2,400 employees and a large partner network. The platform was adopted by major Australian brands including Telstra, Flight Centre, Canva, Scape, and hipages, solidifying its leadership position in the CRM software market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.eweek.com/news/ai-australia-salesforce-agentforce/" target="_blank" rel="noopener noreferrer">eWeek</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Over 2,400 employees in Australia. Expected to generate over 245,000 jobs by 2028 (Salesforce and partner network). Ecosystem projected to generate $46 billion in business revenue by 2028. Local CRM software market projected to hit $1.67 billion by 2025.</p>
<p>$2.5 billion planned investment over five years. Ecosystem projected to generate $46 billion in business revenue by 2028. Leading position in CRM software market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.eweek.com/news/ai-australia-salesforce-agentforce/" target="_blank" rel="noopener noreferrer">eWeek</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Salesforce faced direct competition from Microsoft, Google, and AWS. Additional challenges included low productivity growth, a tight labour market, and higher than ever customer expectations in the Australian enterprise software market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.eweek.com/news/ai-australia-salesforce-agentforce/" target="_blank" rel="noopener noreferrer">eWeek</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'salesforce-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Long-term presence since 2004 enables deep market penetration. AI-powered automation addresses key market challenges like labor shortages. Australia''s generative AI market could contribute up to $115 billion annually to the national economy by 2030, creating significant opportunities for established players.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.eweek.com/news/ai-australia-salesforce-agentforce/" target="_blank" rel="noopener noreferrer">eWeek</a></em></p>', 1, 'paragraph');


-- ===================== AMAZON.COM =====================
DELETE FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'amazon-australia-ecommerce-entry',
  'How Amazon.com Entered the Australian E-commerce Market',
  'Launching Amazon Marketplace as a sales and logistics platform with fulfillment centers and thousands of new jobs',
  'case_study', 'published', false, 8,
  'Learn how Amazon disrupted Australia''s $300 billion retail market in 2017 with its Marketplace platform, logistics network, and catalog of 370 million items.',
  ARRAY['e-commerce', 'retail', 'technology', 'logistics', 'marketplace'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Amazon.com', 'E-commerce and Retail Technology', 'United States', 'Australia', '2017', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Andy Jassy', 'CEO, Amazon', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'amazon-australia-ecommerce-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'entry-strategy'),
'<p>Amazon launched its Marketplace as a sales and logistics platform for third-party retailers in Australia in 2017. Plans included setting up fulfillment centers in Brisbane, Sydney and Melbourne, creating thousands of new jobs, and investing millions in the country.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.thecasecentre.org/products/view?id=147199" target="_blank" rel="noopener noreferrer">The Case Centre</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'success-factors'),
'<p>Amazon brought more than two decades of experience in online business, a digital catalog of nearly 370 million items, and advanced logistics capabilities that gave it a significant competitive edge in the Australian retail market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.thecasecentre.org/products/view?id=147199" target="_blank" rel="noopener noreferrer">The Case Centre</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'key-metrics'),
'<p>Amazon entered a retail services market valued at almost USD$300 billion (as of 2017), bringing an inventory of nearly 370 million items to Australian consumers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.thecasecentre.org/products/view?id=147199" target="_blank" rel="noopener noreferrer">The Case Centre</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'challenges-faced'),
'<p>The key challenge was high distribution costs in the Australian market. There was also potential negative pressure on the retail employment sector of the Australian economy. Amazon''s entry was expected to reduce margins of traditional retailers like Woolworths, ALDI, and Wesfarmers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.thecasecentre.org/products/view?id=147199" target="_blank" rel="noopener noreferrer">The Case Centre</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'amazon-australia-ecommerce-entry' AND cs.slug = 'lessons-learned'),
'<p>Market entry by a major international player can disrupt established retailers and potentially reduce the consumer price index through competitive pressure. Traditional retailers were forced to improve their offerings and digital capabilities to compete with Amazon''s scale and efficiency.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.thecasecentre.org/products/view?id=147199" target="_blank" rel="noopener noreferrer">The Case Centre</a></em></p>', 1, 'paragraph');
