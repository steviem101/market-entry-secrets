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
