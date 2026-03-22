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
