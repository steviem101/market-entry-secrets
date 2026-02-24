-- ============================================================================
-- IDEMPOTENT CASE STUDIES UPSERT PART 1: Preamble + Airbnb
-- Uses DELETE CASCADE + re-INSERT for clean idempotent behavior
-- ============================================================================

-- 1. Add "Technology Market Entry" content category (safe re-run)
INSERT INTO public.content_categories (name, description, icon, color, sort_order)
SELECT 'Technology Market Entry', 'International technology companies entering the Australian market', 'Globe', 'text-violet-600', 10
WHERE NOT EXISTS (SELECT 1 FROM public.content_categories WHERE name = 'Technology Market Entry');

-- 2. Fix legacy content_type: success_story → case_study
UPDATE public.content_items
SET content_type = 'case_study'
WHERE content_type = 'success_story';

-- 3. Set outcome = 'successful' on existing company profiles that lack it
UPDATE public.content_company_profiles
SET outcome = 'successful'
WHERE outcome IS NULL
  AND content_id IN (SELECT id FROM public.content_items WHERE content_type = 'case_study');

-- ===================== AIRBNB =====================
-- Delete existing (CASCADE removes sections, bodies, profiles, founders)
DELETE FROM public.content_items WHERE slug = 'airbnb-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'airbnb-australia-market-entry',
  'How Airbnb Entered the Australian Market',
  'Peer-to-peer sharing economy platform connecting hosts and guests, creating significant economic value across Australia',
  'case_study', 'published', true, 8,
  'Discover how Airbnb entered Australia in 2012 with its sharing economy platform, contributing $1.6 billion to GDP and supporting over 14,000 jobs.',
  ARRAY['sharing-economy', 'travel', 'technology', 'marketplace', 'hospitality'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES (
  (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'),
  'Airbnb', 'Technology / Sharing Economy Platform', 'United States', 'Australia', '2012', 'successful'
);

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES (
  (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'),
  'Brian Chesky', 'CEO & Co-founder, Airbnb', true
);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Airbnb entered Australia in 2012 with a peer-to-peer sharing economy platform connecting hosts and guests without owning property. Their innovative market offering allowed ordinary people to host tourists, focusing on adding volume and variety to guest accommodation outside the traditional hotel sector.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Airbnb''s success in Australia was driven by lower cost options (rooms on average $88 cheaper per night compared to traditional accommodation in central Sydney), unique locations (three-quarters of properties in major markets located outside traditional tourist areas), home-like facilities (kitchens and laundries), and a bidirectional ratings system ensuring quality (average rating 4.7 out of 5).</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>In 2015-16: 2.1 million guests for 3.7 million nights; guest spending totaled over $2 billion; contributed $1.6 billion to Australia''s GDP; supported 14,409 full-time equivalent jobs; Australian hosts earned median income of $4,920. 51% of bookings in Australia made by domestic guests.</p>
<p>Since the 2012 launch, Airbnb facilitated over 1.3 million short stays in Australia. In 2015-16 alone, 800,000 stays were booked, demonstrating rapid growth from the early launch period.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Airbnb faced community issues relating to noise levels and strata issues. Amenity issues associated with short-term letting included anti-social behaviour, increases in building wear and tear, and degrading of amenities. There were also potential impacts on existing operators in the traditional hotel market due to increased competition.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Platform business models can create significant economic value without owning physical assets. Balancing rapid growth with community concerns and regulatory compliance is critical. Domestic market adoption (51% of bookings) demonstrates the importance of building a local user base alongside international visitors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph');
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
-- ============================================================================
-- IDEMPOTENT CASE STUDIES UPSERT PART 3: GitHub, Zoom, Tesla, Twilio, DocuSign
-- ============================================================================

-- ===================== GITHUB =====================
DELETE FROM public.content_items WHERE slug = 'github-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'github-australia-market-entry',
  'How GitHub Entered the Australian Market',
  'First Asia Pacific market for Enterprise Cloud data residency, targeting highly regulated industries requiring local data storage',
  'case_study', 'published', false, 8,
  'Learn how GitHub launched Enterprise Cloud with data residency in Australia in 2025, becoming the first APAC market for this offering.',
  ARRAY['technology', 'software-development', 'developer-tools', 'cloud-computing'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'GitHub', 'Technology / Software Development Platform', 'United States', 'Australia', '2025', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Thomas Dohmke', 'CEO, GitHub', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub launched Enterprise Cloud with data residency leveraging Microsoft Azure''s infrastructure and security to provide a reliable cloud-based solution. Australia was the first market in Asia Pacific and second globally to receive this deployment option, targeting highly regulated industries requiring local data storage.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>GitHub succeeded by providing greater transparency, control, and security while removing complexities of self-hosted infrastructure. Their offering included access to familiar GitHub Enterprise functionality including GitHub Copilot and GitHub Advanced Security, meeting compliance requirements for highly regulated sectors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Australia became the first market in Asia Pacific and second globally for this offering. IDC predicts 70% of developers will leverage cloud-native developer portals and cloud developer environments to improve work efficiency by 2027.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Organizations in highly regulated sectors in Australia were previously unable to use cloud-based DevOps due to data control needs, often limiting them to costly and complex self-hosted solutions. Meeting compliance requirements became increasingly challenging for enterprises with a global presence.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Data sovereignty and local storage requirements are critical for market entry in regulated industries. Combining cloud benefits with local data residency addresses the key barrier to adoption. Being first-to-market in a region creates a significant competitive advantage.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph');


-- ===================== ZOOM =====================
DELETE FROM public.content_items WHERE slug = 'zoom-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'zoom-australia-market-entry',
  'How Zoom Entered the Australian Market',
  'Cloud phone system launch with native PSTN service and flexible deployment options for Australian businesses',
  'case_study', 'published', false, 7,
  'Discover how Zoom launched Zoom Phone in Australia in 2019 with native PSTN and bring-your-own-carrier options.',
  ARRAY['technology', 'communications', 'video-conferencing', 'saas', 'cloud-computing'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Zoom Video Communications', 'Technology / Video Communications', 'United States', 'Australia', '2019', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Eric Yuan', 'CEO & Founder, Zoom', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Zoom launched Zoom Phone as a cloud phone system available as an add-on to its platform in Australia. The strategy included native Zoom Phone PSTN service with Metered and Unlimited Calling Plans, plus a Bring Your Own Carrier option allowing customers to bring existing PSTN SIP trunks to the Zoom platform.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Zoom''s success was attributed to product reliability and integration. The platform was described as easy to deploy, straightforward to use, and rock-solid from a reliability standpoint. Success came through rapid launch of important new features, deep integrations, and flexible deployment options.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Australia was among the first international markets to receive Zoom Phone with native PSTN service. The platform offered both Metered and Unlimited Calling Plans alongside a BYOC option, providing multiple adoption pathways for Australian businesses of all sizes.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Zoom needed to compete in an established communications market with incumbent telcos and enterprise providers. Integrating with existing Australian telecommunications infrastructure and meeting local regulatory requirements for voice services presented additional complexities.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Flexibility in deployment options (native PSTN or bring your own carrier) enables broader market adoption by reducing switching costs. Product reliability and ease of use are critical success factors in the communications technology market, often outweighing feature breadth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph');


-- ===================== TESLA =====================
DELETE FROM public.content_items WHERE slug = 'tesla-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'tesla-australia-market-entry',
  'How Tesla Entered the Australian Market',
  'Premium market entry with first showroom in Sydney and proprietary supercharger network to address range anxiety',
  'case_study', 'published', false, 8,
  'Learn how Tesla entered Australia in 2014 with its first showroom, supercharger network, and premium Model S starting at $117,000.',
  ARRAY['electric-vehicles', 'clean-technology', 'automotive', 'energy', 'sustainability'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Tesla', 'Electric Vehicles / Clean Technology', 'United States', 'Australia', '2014', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Elon Musk', 'CEO, Tesla', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Tesla opened its first Australian showroom in north Sydney with plans to expand to Melbourne the following year. They launched the Model S four-door sedan with simultaneous unveiling of the first two supercharger stations to establish dedicated charging infrastructure. The strategy focused on the premium market segment initially with plans for more affordable models later.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Tesla positioned itself as an aspirational vehicle and lifestyle statement. High-performance metrics rivaled similarly priced high-performance vehicles (the fastest accelerating four-door sedan ever built). Their proprietary supercharger network was capable of half-charge in 20 minutes, and the 500km range effectively addressed range anxiety.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Price range from about $117,000 for the standard model to more than $200,000 for premium versions. 500km range. Acceleration: zero to 100km/h in 3.4 seconds. Superchargers fill entire battery in about one hour. Plans for eight superchargers between Melbourne, Canberra and Sydney in 2015.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Tesla faced the fundamental challenge of establishing a new vehicle category in a market with limited EV infrastructure. High initial pricing limited the addressable market, and the lack of an existing charging network required significant upfront investment before vehicles could be practically used for long-distance travel.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Infrastructure development (charging network) is a critical enabler for electric vehicle adoption. Premium market entry allows establishment of a brand before a mass market push. Proprietary infrastructure creates competitive advantage and customer lock-in that is difficult for competitors to replicate.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph');


-- ===================== TWILIO =====================
DELETE FROM public.content_items WHERE slug = 'twilio-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'twilio-australia-market-entry',
  'How Twilio Entered the Australian Market',
  'Developer-first company transitioning to go-to-market with local sales teams in Sydney and Melbourne',
  'case_study', 'published', false, 7,
  'Discover how Twilio opened offices in Sydney and Melbourne in 2018, leveraging an existing developer community to plan 100%+ growth.',
  ARRAY['cloud-computing', 'communications', 'developer-tools', 'technology', 'saas'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Twilio', 'Cloud Communications Technology', 'United States', 'Australia', '2018', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Jeff Lawson', 'Co-founder, Twilio', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Twilio opened offices in Sydney and Melbourne in 2018, transitioning from a developer-first company to implementing a specific go-to-market strategy with a local sales team. Australia was identified as one of six global growth focus markets for 2018. They hired experienced leadership to meet inbound demand.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Twilio already had strong developer and partner communities in the region prior to formal entry. Having feet on the ground helped businesses improve consumer communications. Hiring experienced local leadership including a country director with regional expertise was crucial to success.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Planned to grow by more than 100% in region in 2018. 100 local customers at launch including Atlassian, zipMoney, Dominos, and Airtasker. Australia was the 11th country outside the US for business. Started with eight people employed in region. Global company valued at US$3.49 billion with more than two million developers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Twilio needed to transition from a self-serve, developer-driven model to a structured enterprise go-to-market approach suitable for the Australian market. Scaling from eight employees while managing rapid growth targets of 100%+ required careful hiring and operational planning.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>A developer community can be established remotely before formal market entry. Local presence accelerates growth when a strong developer base already exists. Australia is well positioned as a hub for broader APAC region expansion. Twilio''s goal for Australia to become the fastest growing region outside North America demonstrates the strategic importance of the market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph');


-- ===================== DOCUSIGN =====================
DELETE FROM public.content_items WHERE slug = 'docusign-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'docusign-australia-market-entry',
  'How DocuSign Entered the Australian Market',
  'Supporting public sector digital transformation with local data centres and strategic Telstra partnership',
  'case_study', 'published', false, 7,
  'Learn how DocuSign launched Australian data centres in 2018, partnered with Telstra, and established Sydney as its Asia Pacific HQ.',
  ARRAY['technology', 'digital-signature', 'enterprise-software', 'saas', 'public-sector'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'DocuSign', 'Digital Signature Technology', 'United States', 'Australia', '2018', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Allan Thygesen', 'CEO, DocuSign', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>DocuSign focused on supporting public sector digital transformation by launching two data centres across Australia to offer data residency and privacy. They established Sydney as their Asia Pacific headquarters. A strategic partnership with Telstra, which acted as partner, customer, and strategic investor through Telstra Ventures, was central to their approach.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>DocuSign achieved compliance with rigorous security standards and government frameworks including ISO27001 and FedRAMP Certification. Their alignment with the Australian Digital Transformation Agency''s Secure Cloud Strategy and strong partnership with Telstra for local presence and market access were critical success factors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>61% of Australian citizens still print or scan to transact with government, revealing a massive digitization opportunity. Automation allows organizations to measure turnaround time in minutes rather than days. Hundreds of millions of users leverage the cloud platform globally.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>DocuSign needed to overcome public sector resistance to cloud-based solutions and meet stringent government security and data residency requirements. Convincing government agencies to shift from traditional paper-based processes to digital solutions required significant trust-building and compliance work.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Public sector digital transformation creates significant market opportunity. Data sovereignty and local infrastructure are critical for government adoption. Strategic local partnerships (Telstra) accelerate market penetration. Using Sydney as a regional headquarters enables broader Asia Pacific expansion.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph');
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
