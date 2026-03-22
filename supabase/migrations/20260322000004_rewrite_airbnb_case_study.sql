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
