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
