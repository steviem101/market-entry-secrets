-- MES-178 follow-up: STAGED case-study enrichment proposal.
-- NOT APPLIED. Review out/enrichment/enrichment-review.md, then run against
-- project xhziwveaiuhzdoutpgrh via the reviewed service-role path.
-- Each target is its own transaction; safe to apply selectively.

-- netflix-streaming-australia-launch  (fill; live body was 0 chars) <- how-netflix-localised-its-way-to-australian-streaming-dominance
BEGIN;
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study'), '<p>When Netflix switched on its Australian service on 24 March 2015, it already had an estimated 200,000–350,000 paying local subscribers — Australians who had spent years accessing the US catalogue through VPNs. Australia was the 50th country in Netflix''s global rollout, and the company arrived with an aggressive $8.99 entry price that undercut every local rival. Within two years, one incumbent was in administration, another had shut down, and Netflix was the country''s dominant streaming service.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Streaming video / SVOD</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct digital launch (50th country in global rollout)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — market leader within about two years</td>
</tr>
</table>', 'When Netflix switched on its Australian service on 24 March 2015, it already had an estimated 200,000–350,000 paying local subscribers — Australians who had spent years accessing the US catalogue through VPNs. Australia was the 50th country in Netflix''s global rollout, and the company arrived with an aggressive \$8.99 entry price that undercut every local rival. Within two years, one incumbent was in administration, another had shut down, and Netflix was the country''s dominant streaming service.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Streaming video / SVOD</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct digital launch (50th country in global rollout)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — market leader within about two years</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & local footprint', 'team-and-local-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>Before 2015, Australian television was dominated by the free-to-air networks and Foxtel''s pay-TV near-monopoly, and the country had some of the highest content piracy rates in the developed world. Local pioneer Quickflix had streamed since 2011, and incumbents scrambled ahead of Netflix''s announced arrival: Nine and Fairfax launched Stan on Australia Day 2015 at $10 a month, while Foxtel and Seven backed Presto. Netflix confirmed its March 2015 launch in November 2014 — by which point hundreds of thousands of Australians were already paying for the US service via VPNs.</p>', 'Before 2015, Australian television was dominated by the free-to-air networks and Foxtel''s pay-TV near-monopoly, and the country had some of the highest content piracy rates in the developed world. Local pioneer Quickflix had streamed since 2011, and incumbents scrambled ahead of Netflix''s announced arrival: Nine and Fairfax launched Stan on Australia Day 2015 at \$10 a month, while Foxtel and Seven backed Presto. Netflix confirmed its March 2015 launch in November 2014 — by which point hundreds of thousands of Australians were already paying for the US service via VPNs.', 1),
      ('entry-strategy', '<ul>
<li><strong>Enter a market you''ve already infiltrated.</strong> The VPN grey market functioned as a multi-year free beta. Brand awareness was near-universal and an estimated 200,000–350,000 Australians were already paying customers before launch day.</li>
<li><strong>Undercut the locals on price.</strong> Netflix launched at $8.99 a month for its entry tier, deliberately below Stan''s $10 — forcing incumbents to compete on price against a company with global scale economics.</li>
<li><strong>Lead with a global library and originals.</strong> House of Cards and Orange Is the New Black were marquee draws that local rivals could not match without expensive licensing.</li>
<li><strong>Partner away local friction.</strong> Launch deals with ISPs such as iiNet offered unmetered Netflix data, neutralising Australia''s then-restrictive broadband caps.</li>
<li><strong>Exploit regulatory asymmetry.</strong> As an over-the-top service, Netflix faced none of the local content quotas or licensing obligations imposed on free-to-air and pay-TV broadcasters.</li>
</ul>', '- **Enter a market you''ve already infiltrated.** The VPN grey market functioned as a multi-year free beta. Brand awareness was near-universal and an estimated 200,000–350,000 Australians were already paying customers before launch day.
- **Undercut the locals on price.** Netflix launched at \$8.99 a month for its entry tier, deliberately below Stan''s \$10 — forcing incumbents to compete on price against a company with global scale economics.
- **Lead with a global library and originals.** House of Cards and Orange Is the New Black were marquee draws that local rivals could not match without expensive licensing.
- **Partner away local friction.** Launch deals with ISPs such as iiNet offered unmetered Netflix data, neutralising Australia''s then-restrictive broadband caps.
- **Exploit regulatory asymmetry.** As an over-the-top service, Netflix faced none of the local content quotas or licensing obligations imposed on free-to-air and pay-TV broadcasters.', 2),
      ('team-and-local-footprint', '<ul>
<li><strong>A launch with no local employees.</strong> Netflix ran Australia remotely for its first four years — marketing, PR and content licensing were handled from the US and Singapore. Co-founder Reed Hastings and content chief Ted Sarandos flew in for a single day of publicity and an evening launch party in March 2015, then left the market to run itself.</li>
<li><strong>Content was the only local investment.</strong> Netflix commissioned its first local series, Mako Mermaids, in 2014 — before the consumer launch — and premiered its first Australian original, Tidelands, in December 2018.</li>
<li><strong>A local office only after victory.</strong> Netflix resisted a formal Australian presence until 2019, when it began hiring staff for a small Sydney office to support more local originals; a larger Sydney office followed in October 2024, nearly a decade after launch.</li>
</ul>', '- **A launch with no local employees.** Netflix ran Australia remotely for its first four years — marketing, PR and content licensing were handled from the US and Singapore. Co-founder Reed Hastings and content chief Ted Sarandos flew in for a single day of publicity and an evening launch party in March 2015, then left the market to run itself.
- **Content was the only local investment.** Netflix commissioned its first local series, Mako Mermaids, in 2014 — before the consumer launch — and premiered its first Australian original, Tidelands, in December 2018.
- **A local office only after victory.** Netflix resisted a formal Australian presence until 2019, when it began hiring staff for a small Sydney office to support more local originals; a larger Sydney office followed in October 2024, nearly a decade after launch.', 3),
      ('success-factors', '<ul>
<li><strong>Pre-built demand</strong>: Netflix launched into pent-up, proven willingness to pay rather than having to create a new behaviour</li>
<li><strong>A refined playbook</strong>: Australia was country number 50 — pricing, catalogue sequencing and launch marketing had been tested dozens of times</li>
<li><strong>Scale economics in content</strong>: amortising a global content budget across tens of millions of subscribers let Netflix sustain a price point local players lost money matching</li>
<li><strong>Speed against a disorganised field</strong>: Stan''s pre-emptive launch saved it; slower incumbents Presto and Quickflix were eliminated within two years</li>
</ul>', '- **Pre-built demand**: Netflix launched into pent-up, proven willingness to pay rather than having to create a new behaviour
- **A refined playbook**: Australia was country number 50 — pricing, catalogue sequencing and launch marketing had been tested dozens of times
- **Scale economics in content**: amortising a global content budget across tens of millions of subscribers let Netflix sustain a price point local players lost money matching
- **Speed against a disorganised field**: Stan''s pre-emptive launch saved it; slower incumbents Presto and Quickflix were eliminated within two years', 4),
      ('key-metrics-and-performance', '<ul>
<li>Estimated 200,000–350,000 Australian VPN subscribers before official launch</li>
<li>Launch pricing: $8.99 (SD entry tier) vs Stan at $10</li>
<li>Quickflix — the local first mover with 182,000 subscribers in 2014 — entered voluntary administration in April 2016, 13 months after Netflix''s launch</li>
<li>Presto shut down in January 2017; Stan survived as the strongest local challenger</li>
<li>Netflix became Australia''s largest SVOD service, with local subscriptions in the millions and Australia among its fastest-adopting markets</li>
</ul>', '- Estimated 200,000–350,000 Australian VPN subscribers before official launch
- Launch pricing: \$8.99 (SD entry tier) vs Stan at \$10
- Quickflix — the local first mover with 182,000 subscribers in 2014 — entered voluntary administration in April 2016, 13 months after Netflix''s launch
- Presto shut down in January 2017; Stan survived as the strongest local challenger
- Netflix became Australia''s largest SVOD service, with local subscriptions in the millions and Australia among its fastest-adopting markets', 5),
      ('lessons-for-market-entrants', '<ol>
<li><strong>Latent demand is the cheapest market research.</strong> A grey market of determined users is the strongest possible signal to enter — and a ready-made customer base.</li>
<li><strong>Price aggressively when your cost base is global.</strong> Incumbents forced to match your price on local economics bleed out first.</li>
<li><strong>Regulatory asymmetry can be a genuine entry advantage.</strong> Netflix competed unburdened by the quotas its broadcast rivals carried.</li>
<li><strong>Move before incumbents finish organising.</strong> The pre-launch scramble showed the market expected disruption — those who launched earliest survived.</li>
</ol>', '1. **Latent demand is the cheapest market research.** A grey market of determined users is the strongest possible signal to enter — and a ready-made customer base.
2. **Price aggressively when your cost base is global.** Incumbents forced to match your price on local economics bleed out first.
3. **Regulatory asymmetry can be a genuine entry advantage.** Netflix competed unburdened by the quotas its broadcast rivals carried.
4. **Move before incumbents finish organising.** The pre-launch scramble showed the market expected disruption — those who launched earliest survived.', 6)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  origin_country = COALESCE(NULLIF(origin_country, ''), 'United States'),
  industry = COALESCE(NULLIF(industry, ''), 'Streaming video / SVOD'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2015'),
  outcome = COALESCE(NULLIF(outcome, ''), 'successful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study');
COMMIT;

-- afterpay-buy-now-pay-later-revolution  (fill; live body was 0 chars) <- how-afterpay-invented-buy-now-pay-later-from-its-australian-home-market
BEGIN;
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study'), '<p>Founded in Sydney in 2014 by neighbours Nick Molnar and Anthony Eisen, Afterpay invented the modern buy-now-pay-later category in its home market: ASX-listed by 2016, one million Australian customers by 2017, and ultimately acquired by Square (Block) for A$39 billion — the largest deal in Australian corporate history.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia (Sydney)</td>
</tr>
<tr>
<td>Sector</td>
<td>Fintech / buy now, pay later</td>
</tr>
<tr>
<td>Entry year</td>
<td>2014 (ASX 2016)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic launch, merchant-led rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — A$39B acquisition by Block</td>
</tr>
</table>', 'Founded in Sydney in 2014 by neighbours Nick Molnar and Anthony Eisen, Afterpay invented the modern buy-now-pay-later category in its home market: ASX-listed by 2016, one million Australian customers by 2017, and ultimately acquired by Square (Block) for A\$39 billion — the largest deal in Australian corporate history.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia (Sydney)</td>
</tr>
<tr>
<td>Sector</td>
<td>Fintech / buy now, pay later</td>
</tr>
<tr>
<td>Entry year</td>
<td>2014 (ASX 2016)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic launch, merchant-led rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — A\$39B acquisition by Block</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Founding & GTM strategy', 'founding-and-gtm-strategy', 2),
      ('Founders & first flywheel', 'founders-and-first-flywheel', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>Molnar was selling jewellery online and watching young customers abandon carts rather than use credit cards; Eisen, a career financier, lived across the street. Their insight: millennials wanted credit-card convenience without credit-card debt — four interest-free instalments, with the merchant paying the fee.</p>', 'Molnar was selling jewellery online and watching young customers abandon carts rather than use credit cards; Eisen, a career financier, lived across the street. Their insight: millennials wanted credit-card convenience without credit-card debt — four interest-free instalments, with the merchant paying the fee.', 1),
      ('founding-and-gtm-strategy', '<p>Afterpay grew merchant-first in its home market: sign retailers, who then market Afterpay to their own customers at checkout. Early wins with youth fashion retailers created a flywheel — shoppers began choosing stores because they offered Afterpay, forcing competitors to follow. The ASX listing in 2016 provided growth capital and local credibility years before US venture money would have. Australia became the proving ground for the playbook later exported to the US (2018) and UK as Clearpay (2019).</p>', 'Afterpay grew merchant-first in its home market: sign retailers, who then market Afterpay to their own customers at checkout. Early wins with youth fashion retailers created a flywheel — shoppers began choosing stores because they offered Afterpay, forcing competitors to follow. The ASX listing in 2016 provided growth capital and local credibility years before US venture money would have. Australia became the proving ground for the playbook later exported to the US (2018) and UK as Clearpay (2019).', 2),
      ('founders-and-first-flywheel', '<ul>
<li><strong>A teenage eBay merchant met a career financier — across the street.</strong> Molnar had become Australia''s top eBay jewellery seller while still at school, then built US jeweller Ice''s local site (<a href="http://iceonline.com.au">iceonline.com.au</a>) to A$2 million in annual revenue; Eisen, his Sydney neighbour with 25+ years in investing, noticed the lights on late and asked what he was working on.</li>
<li><strong>Incorporated as "Innovative Payments".</strong> The pair registered the company on 1 November 2014 and launched with youth-fashion retailers whose customers were exactly the card-averse millennials the product was built for.</li>
<li><strong>The listing did the fundraising.</strong> The 2016 ASX float gave Afterpay growth capital and credibility from a home-market exchange — by H1 FY21 the machine was compounding at $9.8 billion in half-year underlying sales, 13.1 million active customers and 74,700 merchants globally.</li>
</ul>', '- **A teenage eBay merchant met a career financier — across the street.** Molnar had become Australia''s top eBay jewellery seller while still at school, then built US jeweller Ice''s local site ([iceonline.com.au](http://iceonline.com.au)) to A\$2 million in annual revenue; Eisen, his Sydney neighbour with 25+ years in investing, noticed the lights on late and asked what he was working on.
- **Incorporated as "Innovative Payments".** The pair registered the company on 1 November 2014 and launched with youth-fashion retailers whose customers were exactly the card-averse millennials the product was built for.
- **The listing did the fundraising.** The 2016 ASX float gave Afterpay growth capital and credibility from a home-market exchange — by H1 FY21 the machine was compounding at \$9.8 billion in half-year underlying sales, 13.1 million active customers and 74,700 merchants globally.', 3),
      ('success-factors', '<ul>
<li><strong>Category invention with aligned incentives</strong>: free to consumers, paid by merchants who got higher conversion and basket sizes</li>
<li><strong>Merchant-led distribution</strong>: every retailer became an acquisition channel</li>
<li><strong>Generational timing</strong>: rode millennial/Gen Z aversion to credit cards</li>
<li><strong>Home-market proof before export</strong>: Australian unit economics validated the model before the US launch</li>
</ul>', '- **Category invention with aligned incentives**: free to consumers, paid by merchants who got higher conversion and basket sizes
- **Merchant-led distribution**: every retailer became an acquisition channel
- **Generational timing**: rode millennial/Gen Z aversion to credit cards
- **Home-market proof before export**: Australian unit economics validated the model before the US launch', 4),
      ('key-metrics-and-performance', '<ul>
<li>1 million Australian customers by 2017; 3.5 million active AU customers and 129,000 merchants at maturity</li>
<li>$13.4 billion in Australian sales (2023)</li>
<li>ASX debut 2016; US launch 2018; UK (Clearpay) 2019</li>
<li>Acquired by Square/Block for A$39 billion (announced 2021, completed 2022)</li>
</ul>', '- 1 million Australian customers by 2017; 3.5 million active AU customers and 129,000 merchants at maturity
- \$13.4 billion in Australian sales (2023)
- ASX debut 2016; US launch 2018; UK (Clearpay) 2019
- Acquired by Square/Block for A\$39 billion (announced 2021, completed 2022)', 5),
      ('lessons-for-market-entrants', '<p>Afterpay demonstrates the value of dominating the home market first: Australia''s contained retail ecosystem let a two-sided network reach critical mass fast, creating the template — and the balance sheet — for international expansion.</p>', 'Afterpay demonstrates the value of dominating the home market first: Australia''s contained retail ecosystem let a two-sided network reach critical mass fast, creating the template — and the balance sheet — for international expansion.', 6)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  origin_country = COALESCE(NULLIF(origin_country, ''), 'Australia'),
  industry = COALESCE(NULLIF(industry, ''), 'Fintech / buy now, pay later'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2014'),
  outcome = COALESCE(NULLIF(outcome, ''), 'successful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study');
COMMIT;

-- secretlab-anz-market-entry  (replace; live body was 2373 chars) <- how-secretlab-sold-australia-gaming-chairs-without-a-single-store
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study');
  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study'), '<p>Secretlab was founded in Singapore in 2014 by two former professional gamers with <strong>S$50,000</strong> of their own money — and was profitable within its first year. By 2016 it had chosen Australia (alongside the US) as one of its first Western markets, entering with no stores, no distributors and no local partners. Today the company sells in about 50 countries, has shipped over <strong>1 million chairs</strong>, and generates around <strong>S$350 million</strong> in revenue.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Secretlab</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore</td>
</tr>
<tr>
<td>Sector</td>
<td>Gaming furniture / direct-to-consumer e-commerce</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct-to-consumer online entry with a localised Australian webstore</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia remains one of its core international markets with a dedicated local storefront</td>
</tr>
</table>', 'Secretlab was founded in Singapore in 2014 by two former professional gamers with **S\$50,000** of their own money — and was profitable within its first year. By 2016 it had chosen Australia (alongside the US) as one of its first Western markets, entering with no stores, no distributors and no local partners. Today the company sells in about 50 countries, has shipped over **1 million chairs**, and generates around **S\$350 million** in revenue.
<table header-column="true">
<tr>
<td>Company</td>
<td>Secretlab</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore</td>
</tr>
<tr>
<td>Sector</td>
<td>Gaming furniture / direct-to-consumer e-commerce</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct-to-consumer online entry with a localised Australian webstore</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia remains one of its core international markets with a dedicated local storefront</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Engineer the product for the market', 'engineer-the-product-for-the-market', 3),
      ('Pure direct-to-consumer', 'pure-direct-to-consumer', 4),
      ('Community-led credibility', 'community-led-credibility', 5),
      ('Sequence markets by demand signal', 'sequence-markets-by-demand-signal', 6),
      ('Founders & local operations', 'founders-and-local-operations', 7),
      ('Success factors', 'success-factors', 8),
      ('Key metrics & performance', 'key-metrics-and-performance', 9),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 10)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>Founders Ian Ang and Alaric Choo set out to engineer "the perfect gaming chair" for gamers and desk workers. Demand was strong enough to fund expansion into Malaysia in the founding year, then Australia and the US in 2016, followed by the UK, Europe and Canada in 2017 — an unusually fast international sequence for a bootstrapped furniture company.</p>', 'Founders Ian Ang and Alaric Choo set out to engineer "the perfect gaming chair" for gamers and desk workers. Demand was strong enough to fund expansion into Malaysia in the founding year, then Australia and the US in 2016, followed by the UK, Europe and Canada in 2017 — an unusually fast international sequence for a bootstrapped furniture company.', 1),
      ('entry-strategy', '', '', 2),
      ('engineer-the-product-for-the-market', '<p>Expansion into markets like Australia directly shaped the product line: the TITAN model — a larger chair with built-in adjustable lumbar support — was developed partly because Australian customers needed bigger sizing than the original OMEGA.</p>', 'Expansion into markets like Australia directly shaped the product line: the TITAN model — a larger chair with built-in adjustable lumbar support — was developed partly because Australian customers needed bigger sizing than the original OMEGA.', 3),
      ('pure-direct-to-consumer', '<p>Secretlab entered with a localised Australian webstore (<a href="http://secretlabchairs.com.au">secretlabchairs.com.au</a>), local pricing and delivery — capturing full margin and owning the customer relationship without retail middlemen or distribution partners.</p>', 'Secretlab entered with a localised Australian webstore ([secretlabchairs.com.au](http://secretlabchairs.com.au)), local pricing and delivery — capturing full margin and owning the customer relationship without retail middlemen or distribution partners.', 4),
      ('community-led-credibility', '<p>Rather than mass advertising, Secretlab built authority through the gaming and esports community — sponsorships and endorsements from championship teams, tournaments and high-profile personalities that translated globally, including in Australia.</p>', 'Rather than mass advertising, Secretlab built authority through the gaming and esports community — sponsorships and endorsements from championship teams, tournaments and high-profile personalities that translated globally, including in Australia.', 5),
      ('sequence-markets-by-demand-signal', '<p>The company let organic international orders reveal where to localise next, entering Australia early because demand was already visible.</p>', 'The company let organic international orders reveal where to localise next, entering Australia early because demand was already visible.', 6),
      ('founders-and-local-operations', '<ul>
<li><strong>Two ex-pro gamers, no outside capital.</strong> Ian Ang (CEO) and Alaric Choo founded Secretlab in Singapore in 2014 after competitive gaming careers — and funded the Australian entry from operating profits rather than venture money.</li>
<li><strong>Australia as the proving ground for going West.</strong> The company''s own history marks "Secretlab goes to Australia" as a milestone chapter, with the gold-on-black OMEGA Stealth its first product on sale locally — and Australian demand directly prompting the larger TITAN model.</li>
<li><strong>Local stock, no local office.</strong> Fulfilment runs through Australian warehouses and third-party delivery partners, keeping the entry asset-light: inventory and logistics localised, everything else (design, engineering, marketing, support) run from Singapore.</li>
</ul>', '- **Two ex-pro gamers, no outside capital.** Ian Ang (CEO) and Alaric Choo founded Secretlab in Singapore in 2014 after competitive gaming careers — and funded the Australian entry from operating profits rather than venture money.
- **Australia as the proving ground for going West.** The company''s own history marks "Secretlab goes to Australia" as a milestone chapter, with the gold-on-black OMEGA Stealth its first product on sale locally — and Australian demand directly prompting the larger TITAN model.
- **Local stock, no local office.** Fulfilment runs through Australian warehouses and third-party delivery partners, keeping the entry asset-light: inventory and logistics localised, everything else (design, engineering, marketing, support) run from Singapore.', 7),
      ('success-factors', '<ul>
<li>Product quality strong enough to sell itself in review-driven categories</li>
<li>DTC economics preserved margin to fund rapid multi-market expansion without external capital</li>
<li>Esports credibility transferred across borders at near-zero marginal cost</li>
<li>Willingness to adapt the physical product (sizing, ergonomics) per market</li>
</ul>', '- Product quality strong enough to sell itself in review-driven categories
- DTC economics preserved margin to fund rapid multi-market expansion without external capital
- Esports credibility transferred across borders at near-zero marginal cost
- Willingness to adapt the physical product (sizing, ergonomics) per market', 8),
      ('key-metrics-and-performance', '<ul>
<li>Founded 2014 with S$50,000; profitable in year one</li>
<li>Entered Australia and the US in 2016, two years after founding</li>
<li>Now sells in about 50 countries; over 1 million chairs produced</li>
<li>Revenue around <strong>S$350 million</strong></li>
</ul>', '- Founded 2014 with S\$50,000; profitable in year one
- Entered Australia and the US in 2016, two years after founding
- Now sells in about 50 countries; over 1 million chairs produced
- Revenue around **S\$350 million**', 9),
      ('lessons-for-market-entrants', '<ol>
<li><strong>DTC removes the traditional gatekeepers of market entry</strong> — no distributor negotiations, no retail listings, no local JV.</li>
<li><strong>Product localisation isn''t just for software.</strong> A physically larger chair was a market-entry decision.</li>
<li><strong>Community authority travels.</strong> Esports credibility built in one market converted customers in every market.</li>
<li><strong>Let demand pull you in.</strong> Organic orders are the cheapest market-research programme available.</li>
</ol>', '1. **DTC removes the traditional gatekeepers of market entry** — no distributor negotiations, no retail listings, no local JV.
2. **Product localisation isn''t just for software.** A physically larger chair was a market-entry decision.
3. **Community authority travels.** Esports credibility built in one market converted customers in every market.
4. **Let demand pull you in.** Organic orders are the cheapest market-research programme available.', 10)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  company_name = COALESCE(NULLIF(company_name, ''), 'Secretlab'),
  origin_country = COALESCE(NULLIF(origin_country, ''), 'Singapore'),
  industry = COALESCE(NULLIF(industry, ''), 'Gaming furniture / direct-to-consumer e-commerce'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2016'),
  outcome = COALESCE(NULLIF(outcome, ''), 'successful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study');
COMMIT;

-- shopback-anz-market-entry  (replace; live body was 2598 chars) <- how-shopback-used-cashback-to-break-into-australian-loyalty
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study');
  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study'), '<p>Before ShopBack launched a single Australian campaign, it did something smarter: it put an Australian investor on its cap table. The Singaporean cashback platform''s $32 million raise in November 2017 was backed by Brisbane''s Blue Sky — announced explicitly as the war chest for its Australian launch.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>ShopBack</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore (founded August 2014)</td>
</tr>
<tr>
<td>Sector</td>
<td>Cashback / shopping rewards platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2018</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch funded by a raise with Australian VC participation</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia became a core market, later extended into ShopBack Pay</td>
</tr>
</table>', 'Before ShopBack launched a single Australian campaign, it did something smarter: it put an Australian investor on its cap table. The Singaporean cashback platform''s \$32 million raise in November 2017 was backed by Brisbane''s Blue Sky — announced explicitly as the war chest for its Australian launch.
<table header-column="true">
<tr>
<td>Company</td>
<td>ShopBack</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore (founded August 2014)</td>
</tr>
<tr>
<td>Sector</td>
<td>Cashback / shopping rewards platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2018</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch funded by a raise with Australian VC participation</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia became a core market, later extended into ShopBack Pay</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Raise locally to land locally', 'raise-locally-to-land-locally', 3),
      ('Lead with familiar merchants', 'lead-with-familiar-merchants', 4),
      ('Ride the rails of the affiliate economy', 'ride-the-rails-of-the-affiliate-economy', 5),
      ('Deepen into payments', 'deepen-into-payments', 6),
      ('Launch & local iteration', 'launch-and-local-iteration', 7),
      ('Why it worked', 'why-it-worked', 8),
      ('Key metrics', 'key-metrics', 9),
      ('Lessons', 'lessons', 10)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>Founded in Singapore in August 2014 by Henry Chan, Joel Leong and co-founders, ShopBack built a simple flywheel: retailers pay it a commission for referred sales, and it shares part of that commission back with shoppers as cashback. After winning across Southeast Asia, it targeted Australia — a market with high e-commerce growth, established loyalty habits, and only weak local cashback incumbents.</p>', 'Founded in Singapore in August 2014 by Henry Chan, Joel Leong and co-founders, ShopBack built a simple flywheel: retailers pay it a commission for referred sales, and it shares part of that commission back with shoppers as cashback. After winning across Southeast Asia, it targeted Australia — a market with high e-commerce growth, established loyalty habits, and only weak local cashback incumbents.', 1),
      ('entry-strategy', '', '', 2),
      ('raise-locally-to-land-locally', '<p>ShopBack''s November 2017 round — $32 million, backed by Australian venture investor Blue Sky — was framed to Australian media as the funding for its Australian launch. The local backer brought market knowledge, retailer introductions and domestic credibility that a purely foreign entrant would lack.</p>', 'ShopBack''s November 2017 round — \$32 million, backed by Australian venture investor Blue Sky — was framed to Australian media as the funding for its Australian launch. The local backer brought market knowledge, retailer introductions and domestic credibility that a purely foreign entrant would lack.', 3),
      ('lead-with-familiar-merchants', '<p>The platform launched with mainstream Australian and global retailers shoppers already used, making cashback an overlay on existing behaviour rather than a new habit — the same low-friction model proven across its Asian markets.</p>', 'The platform launched with mainstream Australian and global retailers shoppers already used, making cashback an overlay on existing behaviour rather than a new habit — the same low-friction model proven across its Asian markets.', 4),
      ('ride-the-rails-of-the-affiliate-economy', '<p>As an affiliate-commission business, ShopBack could scale merchant coverage through networks rather than one-by-one enterprise sales, keeping entry costs low relative to loyalty-program competitors.</p>', 'As an affiliate-commission business, ShopBack could scale merchant coverage through networks rather than one-by-one enterprise sales, keeping entry costs low relative to loyalty-program competitors.', 5),
      ('deepen-into-payments', '<p>Once entrenched, ShopBack expanded beyond cashback into in-store financial services, launching ShopBack Pay in Australia alongside Singapore and Malaysia — converting a marketing utility into a payments relationship.</p>', 'Once entrenched, ShopBack expanded beyond cashback into in-store financial services, launching ShopBack Pay in Australia alongside Singapore and Malaysia — converting a marketing utility into a payments relationship.', 6),
      ('launch-and-local-iteration', '<ul>
<li><strong>A head-to-head from day one.</strong> ShopBack switched on in Australia in April 2018, framed by the AFR as the start of a "battle for online cashback deals" against entrenched local incumbent Cashrewards.</li>
<li><strong>In-store experiments run from Australia.</strong> The company used Australia as a payments testbed: ShopBack Pay launched in Melbourne in May 2023 to mark the group''s fifth anniversary, and in April 2025 it partnered with Banked and Chemist Warehouse on Australia''s first in-store Pay by Bank with rewards.</li>
<li><strong>Kill what doesn''t compound.</strong> ShopBack Pay was retired in Australia in March 2026, with in-store investment redirected to the receipt-based ShopBack Receipts programme — a reminder that mature entrants keep pruning the local product line.</li>
</ul>', '- **A head-to-head from day one.** ShopBack switched on in Australia in April 2018, framed by the AFR as the start of a "battle for online cashback deals" against entrenched local incumbent Cashrewards.
- **In-store experiments run from Australia.** The company used Australia as a payments testbed: ShopBack Pay launched in Melbourne in May 2023 to mark the group''s fifth anniversary, and in April 2025 it partnered with Banked and Chemist Warehouse on Australia''s first in-store Pay by Bank with rewards.
- **Kill what doesn''t compound.** ShopBack Pay was retired in Australia in March 2026, with in-store investment redirected to the receipt-based ShopBack Receipts programme — a reminder that mature entrants keep pruning the local product line.', 7),
      ('why-it-worked', '<ul>
<li><strong>Local capital as a Trojan horse</strong> — Blue Sky''s involvement converted an Asian startup into a semi-local story from day one.</li>
<li><strong>A model with built-in unit economics</strong> — cashback is funded by merchant commissions, not investor subsidies.</li>
<li><strong>Behavioural overlay, not behavioural change</strong> — shoppers kept shopping where they already shopped.</li>
<li><strong>Regional scale advantages</strong> — technology, merchant tooling and playbooks amortised across 13 markets.</li>
</ul>', '- **Local capital as a Trojan horse** — Blue Sky''s involvement converted an Asian startup into a semi-local story from day one.
- **A model with built-in unit economics** — cashback is funded by merchant commissions, not investor subsidies.
- **Behavioural overlay, not behavioural change** — shoppers kept shopping where they already shopped.
- **Regional scale advantages** — technology, merchant tooling and playbooks amortised across 13 markets.', 8),
      ('key-metrics', '<ul>
<li>$32M raised (November 2017) ahead of the Australian launch</li>
<li>20 million+ active members across 13 markets</li>
<li>~US$900M in cashback awarded to members globally</li>
<li>~US$5.5B in annual gross merchandise value</li>
</ul>', '- \$32M raised (November 2017) ahead of the Australian launch
- 20 million+ active members across 13 markets
- \~US\$900M in cashback awarded to members globally
- \~US\$5.5B in annual gross merchandise value', 9),
      ('lessons', '<ol>
<li>Raising from investors <em>in your target market</em> is an entry tactic, not just a funding event.</li>
<li>Products that overlay existing consumer behaviour scale across borders far faster than products requiring new habits.</li>
<li>Commission-funded rewards beat subsidy-funded rewards for sustainable entry economics.</li>
<li>A utility that earns daily engagement can later carry higher-value services (payments) into the market.</li>
</ol>', '1. Raising from investors *in your target market* is an entry tactic, not just a funding event.
2. Products that overlay existing consumer behaviour scale across borders far faster than products requiring new habits.
3. Commission-funded rewards beat subsidy-funded rewards for sustainable entry economics.
4. A utility that earns daily engagement can later carry higher-value services (payments) into the market.', 10)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  company_name = COALESCE(NULLIF(company_name, ''), 'ShopBack'),
  origin_country = COALESCE(NULLIF(origin_country, ''), 'Singapore'),
  industry = COALESCE(NULLIF(industry, ''), 'Cashback / shopping rewards platform'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2018'),
  outcome = COALESCE(NULLIF(outcome, ''), 'successful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study');
COMMIT;

-- starbucks-australia-market-entry  (replace; live body was 3048 chars) <- how-starbucks-misread-australias-coffee-culture-and-closed-61-stores
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study');
  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study'), '<p>Starbucks entered Sydney in 2000 and expanded to 87 stores by 2007 — then, in July 2008, closed 61 of its 84 stores in a single announcement, cutting 685 jobs after racking up $143 million in accumulated losses. It remains the most-cited case study of a global brand misreading Australian consumer culture.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Coffee / hospitality</td>
</tr>
<tr>
<td>Entry year</td>
<td>2000</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned, rapid company-store rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — 73% of stores closed in 2008</td>
</tr>
</table>', 'Starbucks entered Sydney in 2000 and expanded to 87 stores by 2007 — then, in July 2008, closed 61 of its 84 stores in a single announcement, cutting 685 jobs after racking up \$143 million in accumulated losses. It remains the most-cited case study of a global brand misreading Australian consumer culture.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Coffee / hospitality</td>
</tr>
<tr>
<td>Entry year</td>
<td>2000</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned, rapid company-store rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — 73% of stores closed in 2008</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('The retreat & second act', 'the-retreat-and-second-act', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>By 2000, Australia already had one of the world''s most sophisticated café cultures, built over decades by Italian and Greek immigrant communities. Espresso was the default, independent cafés were everywhere, and coffee was a relationship business — locals had "their" barista. Starbucks arrived selling a discovery experience to a market that had already discovered better coffee.</p>', 'By 2000, Australia already had one of the world''s most sophisticated café cultures, built over decades by Italian and Greek immigrant communities. Espresso was the default, independent cafés were everywhere, and coffee was a relationship business — locals had "their" barista. Starbucks arrived selling a discovery experience to a market that had already discovered better coffee.', 1),
      ('entry-strategy', '<p>Starbucks transplanted its US playbook: rapid saturation-style rollout in CBD and suburban locations, standardised sweet milk-heavy menu, premium pricing, and minimal adaptation to local tastes. Expansion ran ahead of demand — 87 stores in seven years — on the assumption that ubiquity itself would build the habit, as it had in the US.</p>', 'Starbucks transplanted its US playbook: rapid saturation-style rollout in CBD and suburban locations, standardised sweet milk-heavy menu, premium pricing, and minimal adaptation to local tastes. Expansion ran ahead of demand — 87 stores in seven years — on the assumption that ubiquity itself would build the habit, as it had in the US.', 2),
      ('the-retreat-and-second-act', '<ul>
<li><strong>One announcement, 700 jobs.</strong> The July 2008 cull closed 61 of 84 stores across six states in a single stroke, cutting around 700 jobs and leaving just 23 stores nationally — the company said simply that the stores were "under-performing".</li>
<li><strong>A repositioned remnant.</strong> The surviving footprint was concentrated in CBD and tourist-heavy locations, and the brand''s slow later re-expansion deliberately targeted tourists and international students already loyal to Starbucks from home — conceding the local-coffee-drinker market it had failed to win.</li>
</ul>', '- **One announcement, 700 jobs.** The July 2008 cull closed 61 of 84 stores across six states in a single stroke, cutting around 700 jobs and leaving just 23 stores nationally — the company said simply that the stores were "under-performing".
- **A repositioned remnant.** The surviving footprint was concentrated in CBD and tourist-heavy locations, and the brand''s slow later re-expansion deliberately targeted tourists and international students already loyal to Starbucks from home — conceding the local-coffee-drinker market it had failed to win.', 3),
      ('failure-factors', '<ul>
<li><strong>No differentiation in a superior incumbent market</strong>: Australians could get better espresso, cheaper, from the café next door</li>
<li><strong>Un-localised menu and experience</strong>: sweeter, larger, milkier drinks pitched at a palate Australia didn''t have</li>
<li><strong>Expansion outpacing demand</strong>: store count grew while same-store economics never worked, compounding losses</li>
<li><strong>Late timing</strong>: entering after the local café culture matured, rather than shaping an immature one (as it had in Asia)</li>
</ul>', '- **No differentiation in a superior incumbent market**: Australians could get better espresso, cheaper, from the café next door
- **Un-localised menu and experience**: sweeter, larger, milkier drinks pitched at a palate Australia didn''t have
- **Expansion outpacing demand**: store count grew while same-store economics never worked, compounding losses
- **Late timing**: entering after the local café culture matured, rather than shaping an immature one (as it had in Asia)', 4),
      ('key-metrics-and-performance', '<ul>
<li>87 stores at peak (2007)</li>
<li>$143 million accumulated losses by late 2007</li>
<li>July 2008: 61 of 84 stores closed (73%), 685 jobs lost</li>
<li>Later relaunched under licensee ownership with a smaller, tourist-focused footprint</li>
</ul>', '- 87 stores at peak (2007)
- \$143 million accumulated losses by late 2007
- July 2008: 61 of 84 stores closed (73%), 685 jobs lost
- Later relaunched under licensee ownership with a smaller, tourist-focused footprint', 5),
      ('lessons-for-market-entrants', '<p>Brand strength elsewhere counts for little against an entrenched local culture. The Australian coffee market punished a value proposition that was merely equal — entrants must be demonstrably better or different on the incumbent''s home turf.</p>', 'Brand strength elsewhere counts for little against an entrenched local culture. The Australian coffee market punished a value proposition that was merely equal — entrants must be demonstrably better or different on the incumbent''s home turf.', 6)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 2 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  origin_country = COALESCE(NULLIF(origin_country, ''), 'United States'),
  industry = COALESCE(NULLIF(industry, ''), 'Coffee / hospitality'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2000'),
  outcome = COALESCE(NULLIF(outcome, ''), 'unsuccessful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study');
COMMIT;

-- masters-australia-market-entry  (replace; live body was 3054 chars) <- how-masters-lowes-lost-billions-challenging-bunnings
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study');
  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study'), '<p>Masters Home Improvement — the joint venture between Woolworths (~67%) and US home-improvement giant Lowe''s (~33%) — accumulated $3.2 billion in losses over seven years before its December 2016 exit. It remains Australia''s most expensive market entry failure, contributing to Woolworths'' record A$1.2 billion FY2016 loss.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States (JV with Australia''s Woolworths)</td>
</tr>
<tr>
<td>Sector</td>
<td>Home improvement retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011 (JV signed 2009)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Joint venture, greenfield big-box rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — exit December 2016</td>
</tr>
</table>', 'Masters Home Improvement — the joint venture between Woolworths (\~67%) and US home-improvement giant Lowe''s (\~33%) — accumulated \$3.2 billion in losses over seven years before its December 2016 exit. It remains Australia''s most expensive market entry failure, contributing to Woolworths'' record A\$1.2 billion FY2016 loss.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States (JV with Australia''s Woolworths)</td>
</tr>
<tr>
<td>Sector</td>
<td>Home improvement retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011 (JV signed 2009)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Joint venture, greenfield big-box rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — exit December 2016</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & governance', 'people-and-governance', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>Bunnings'' dominance of the $45+ billion home improvement market made it a tempting target. Woolworths supplied local retail muscle and sites; Lowe''s supplied category expertise and ~US$930 million in capital. The JV signed in 2009 and opened its first stores in late 2011, ultimately reaching 60+ stores.</p>', 'Bunnings'' dominance of the \$45+ billion home improvement market made it a tempting target. Woolworths supplied local retail muscle and sites; Lowe''s supplied category expertise and \~US\$930 million in capital. The JV signed in 2009 and opened its first stores in late 2011, ultimately reaching 60+ stores.', 1),
      ('entry-strategy', '<p>Masters attempted a frontal assault: full-size big-box warehouses opened at speed, often on secondary sites (Bunnings had locked up the best locations), stocked substantially to Lowe''s US planograms and product schedules.</p>', 'Masters attempted a frontal assault: full-size big-box warehouses opened at speed, often on secondary sites (Bunnings had locked up the best locations), stocked substantially to Lowe''s US planograms and product schedules.', 2),
      ('people-and-governance', '<ul>
<li><strong>An American import ran the launch.</strong> Masters'' first managing director was Don Stallings, a career Lowe''s home-improvement executive relocated from the US — he returned home in 2013, after which chief operating officer turned director Melinda Smith (COO 2009–2012, director from July 2013) took over as co-architect of the rollout.</li>
<li><strong>Leadership left before the verdict.</strong> Smith resigned in November 2015, just months before the Woolworths board decided the business''s fate — leadership churn bracketing the venture''s entire life.</li>
<li><strong>The warnings were early and public.</strong> Merrill Lynch told Woolworths shareholders in 2009 — two years before the first store opened at Braybrook, Victoria — that hardware entry would dilute returns and "not provide the company with the growth platform" management craved.</li>
<li><strong>The exit turned litigious.</strong> Lowe''s took court action against Woolworths in August 2016 over the wind-up and the value of its stake — JV friction persisting to the very end.</li>
</ul>', '- **An American import ran the launch.** Masters'' first managing director was Don Stallings, a career Lowe''s home-improvement executive relocated from the US — he returned home in 2013, after which chief operating officer turned director Melinda Smith (COO 2009–2012, director from July 2013) took over as co-architect of the rollout.
- **Leadership left before the verdict.** Smith resigned in November 2015, just months before the Woolworths board decided the business''s fate — leadership churn bracketing the venture''s entire life.
- **The warnings were early and public.** Merrill Lynch told Woolworths shareholders in 2009 — two years before the first store opened at Braybrook, Victoria — that hardware entry would dilute returns and "not provide the company with the growth platform" management craved.
- **The exit turned litigious.** Lowe''s took court action against Woolworths in August 2016 over the wind-up and the value of its stake — JV friction persisting to the very end.', 3),
      ('failure-factors', '<ul>
<li><strong>Un-localised range</strong>: US Northern Hemisphere product schedules shipped to Australia — famously, heaters arriving for the Australian summer — and an over-weighting to appliances and homewares that Australian trade and DIY customers didn''t want from a hardware store</li>
<li><strong>Frontal attack on an entrenched incumbent</strong>: matching Bunnings'' format without matching its site quality, supplier terms or brand trust</li>
<li><strong>Scaling before proving</strong>: 60+ stores rolled out while the unit economics of the first stores were still deeply negative</li>
<li><strong>JV friction</strong>: split ownership complicated decisions, and the exit itself triggered a dispute over the value of Lowe''s stake</li>
</ul>', '- **Un-localised range**: US Northern Hemisphere product schedules shipped to Australia — famously, heaters arriving for the Australian summer — and an over-weighting to appliances and homewares that Australian trade and DIY customers didn''t want from a hardware store
- **Frontal attack on an entrenched incumbent**: matching Bunnings'' format without matching its site quality, supplier terms or brand trust
- **Scaling before proving**: 60+ stores rolled out while the unit economics of the first stores were still deeply negative
- **JV friction**: split ownership complicated decisions, and the exit itself triggered a dispute over the value of Lowe''s stake', 4),
      ('key-metrics-and-performance', '<ul>
<li>$3.2 billion in accumulated losses over seven years</li>
<li>Lowe''s invested ~US$930 million</li>
<li>Woolworths'' FY2016 result: record A$1.2 billion loss including a $1.8 billion writedown</li>
<li>Exit completed December 2016; assets sold to GA Australia, Metcash and Home Consortium for ~$500 million net</li>
</ul>', '- \$3.2 billion in accumulated losses over seven years
- Lowe''s invested \~US\$930 million
- Woolworths'' FY2016 result: record A\$1.2 billion loss including a \$1.8 billion writedown
- Exit completed December 2016; assets sold to GA Australia, Metcash and Home Consortium for \~\$500 million net', 5),
      ('lessons-for-market-entrants', '<p>Masters is the definitive warning against attacking a category-killing incumbent head-on with an un-localised offer — and against scaling a format nationally before a single store has proven it works.</p>', 'Masters is the definitive warning against attacking a category-killing incumbent head-on with an un-localised offer — and against scaling a format nationally before a single store has proven it works.', 6)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  origin_country = COALESCE(NULLIF(origin_country, ''), 'United States'),
  industry = COALESCE(NULLIF(industry, ''), 'Home improvement retail'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2011'),
  outcome = COALESCE(NULLIF(outcome, ''), 'unsuccessful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study');
COMMIT;

-- ola-australia-market-entry  (replace; live body was 3060 chars) <- how-ola-won-australian-drivers-but-never-won-the-riders
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'ola-australia-market-entry' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'ola-australia-market-entry' AND content_type = 'case_study');
  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'ola-australia-market-entry' AND content_type = 'case_study'), '<p>Indian ride-hailing giant Ola chose Australia as its first overseas market in January 2018, launching with lower driver commissions to lure Uber''s fleet. Six years later, on 12 April 2024, it shut down Australian operations with just two days'' notice to drivers and riders, retreating — along with its NZ and UK exits — to refocus on India.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>India</td>
</tr>
<tr>
<td>Sector</td>
<td>Ride-hailing / mobility</td>
</tr>
<tr>
<td>Entry year</td>
<td>2018</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, driver-incentive-led launch</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — abrupt exit April 2024</td>
</tr>
</table>', 'Indian ride-hailing giant Ola chose Australia as its first overseas market in January 2018, launching with lower driver commissions to lure Uber''s fleet. Six years later, on 12 April 2024, it shut down Australian operations with just two days'' notice to drivers and riders, retreating — along with its NZ and UK exits — to refocus on India.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>India</td>
</tr>
<tr>
<td>Sector</td>
<td>Ride-hailing / mobility</td>
</tr>
<tr>
<td>Entry year</td>
<td>2018</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, driver-incentive-led launch</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — abrupt exit April 2024</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'ola-australia-market-entry' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Footprint & endgame', 'footprint-and-endgame', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>In 2018 Uber dominated Australian ride-hailing but was globally unpopular with drivers over commission rates. Ola — India''s homegrown Uber rival — saw an opening: enter English-speaking, regulation-friendly Australia as its first international market and win the supply side with better driver economics.</p>', 'In 2018 Uber dominated Australian ride-hailing but was globally unpopular with drivers over commission rates. Ola — India''s homegrown Uber rival — saw an opening: enter English-speaking, regulation-friendly Australia as its first international market and win the supply side with better driver economics.', 1),
      ('entry-strategy', '<p>Ola launched in Sydney, Melbourne and Perth with headline commissions well below Uber''s, signing up tens of thousands of drivers quickly. The strategy was supply-first: win drivers, and riders would follow. But rider demand never reached critical mass — without passengers, drivers multi-homed or drifted back to Uber, and Ola settled into a distant-third position behind Uber and DiDi.</p>', 'Ola launched in Sydney, Melbourne and Perth with headline commissions well below Uber''s, signing up tens of thousands of drivers quickly. The strategy was supply-first: win drivers, and riders would follow. But rider demand never reached critical mass — without passengers, drivers multi-homed or drifted back to Uber, and Ola settled into a distant-third position behind Uber and DiDi.', 2),
      ('footprint-and-endgame', '<ul>
<li><strong>Seven cities, six years.</strong> Ola served most major Australian cities — Sydney, Melbourne, Brisbane, the Gold Coast, Adelaide, Canberra and Perth — without ever threatening the top two positions.</li>
<li><strong>The ending was an email.</strong> Drivers learned of the closure via an email forbidding them from carrying passengers after 12 April 2024; rider accounts stayed accessible only until 11 May. The UK and New Zealand were cut the same day.</li>
<li><strong>The parent had moved on.</strong> Founder Bhavish Aggarwal''s group was refocusing on India and its EV business ahead of an IPO — months earlier, Vanguard had cut Ola''s valuation by 30% to under US$2 billion, sealing the case for retrenchment.</li>
</ul>', '- **Seven cities, six years.** Ola served most major Australian cities — Sydney, Melbourne, Brisbane, the Gold Coast, Adelaide, Canberra and Perth — without ever threatening the top two positions.
- **The ending was an email.** Drivers learned of the closure via an email forbidding them from carrying passengers after 12 April 2024; rider accounts stayed accessible only until 11 May. The UK and New Zealand were cut the same day.
- **The parent had moved on.** Founder Bhavish Aggarwal''s group was refocusing on India and its EV business ahead of an IPO — months earlier, Vanguard had cut Ola''s valuation by 30% to under US\$2 billion, sealing the case for retrenchment.', 3),
      ('failure-factors', '<ul>
<li><strong>Supply-side wins don''t create demand</strong>: cheaper commissions attracted drivers, but Ola never built a consumer reason to switch</li>
<li><strong>Multi-homing neutralised incentives</strong>: drivers ran Uber, DiDi and Ola simultaneously, so Ola subsidised supply without gaining loyalty</li>
<li><strong>Sub-scale economics in a network business</strong>: third place in ride-hailing is structurally unprofitable</li>
<li><strong>Parent strategy shift</strong>: Ola''s pivot to Indian EV manufacturing made loss-making offshore markets expendable</li>
<li><strong>Exit execution</strong>: two days'' notice damaged trust and became the story of the entry</li>
</ul>', '- **Supply-side wins don''t create demand**: cheaper commissions attracted drivers, but Ola never built a consumer reason to switch
- **Multi-homing neutralised incentives**: drivers ran Uber, DiDi and Ola simultaneously, so Ola subsidised supply without gaining loyalty
- **Sub-scale economics in a network business**: third place in ride-hailing is structurally unprofitable
- **Parent strategy shift**: Ola''s pivot to Indian EV manufacturing made loss-making offshore markets expendable
- **Exit execution**: two days'' notice damaged trust and became the story of the entry', 4),
      ('key-metrics-and-performance', '<ul>
<li>Launched January 2018 (first overseas market); exited 12 April 2024</li>
<li>Simultaneous exits from New Zealand and the UK</li>
<li>Never displaced Uber or DiDi from the top two positions</li>
</ul>', '- Launched January 2018 (first overseas market); exited 12 April 2024
- Simultaneous exits from New Zealand and the UK
- Never displaced Uber or DiDi from the top two positions', 5),
      ('lessons-for-market-entrants', '<p>In network-effect businesses, subsidising one side of the market is not a strategy — entrants need a demand-side wedge. And when an offshore market is discretionary to the parent''s core strategy, it will be cut the moment priorities change.</p>', 'In network-effect businesses, subsidising one side of the market is not a strategy — entrants need a demand-side wedge. And when an offshore market is discretionary to the parent''s core strategy, it will be cut the moment priorities change.', 6)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'ola-australia-market-entry' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 2 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'ola-australia-market-entry' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  origin_country = COALESCE(NULLIF(origin_country, ''), 'India'),
  industry = COALESCE(NULLIF(industry, ''), 'Ride-hailing / mobility'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2018'),
  outcome = COALESCE(NULLIF(outcome, ''), 'unsuccessful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'ola-australia-market-entry' AND content_type = 'case_study');
COMMIT;

-- topshop-australia-market-entry  (replace; live body was 3156 chars) <- how-topshops-australian-franchise-collapsed-under-its-own-economics
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study');
  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study'), '<p>UK fashion icon Topshop entered Australia in 2011 to queues around the block — and collapsed into voluntary administration in May 2017 with around $90 million in annual sales, nine standalone stores, 17 Myer concessions and 760 jobs at risk. Its last Australian store closed in March 2020.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United Kingdom</td>
</tr>
<tr>
<td>Sector</td>
<td>Fast fashion retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Local franchise partner</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — administration May 2017</td>
</tr>
</table>', 'UK fashion icon Topshop entered Australia in 2011 to queues around the block — and collapsed into voluntary administration in May 2017 with around \$90 million in annual sales, nine standalone stores, 17 Myer concessions and 760 jobs at risk. Its last Australian store closed in March 2020.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United Kingdom</td>
</tr>
<tr>
<td>Sector</td>
<td>Fast fashion retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Local franchise partner</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — administration May 2017</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Deal structure & unwind', 'deal-structure-and-unwind', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>Topshop rode the same fast-fashion wave as Zara and Uniqlo, launching via a local franchise partner rather than a wholly owned subsidiary. Early signs were strong: hyped launches, celebrity association, prime sites, and a concession partnership that put the brand inside Myer department stores nationally.</p>', 'Topshop rode the same fast-fashion wave as Zara and Uniqlo, launching via a local franchise partner rather than a wholly owned subsidiary. Early signs were strong: hyped launches, celebrity association, prime sites, and a concession partnership that put the brand inside Myer department stores nationally.', 1),
      ('entry-strategy', '<p>The franchise model meant the local operator carried the capital burden and inventory risk while the UK parent collected royalties. Range came from the UK on Northern Hemisphere timelines; pricing landed well above UK levels once freight and margin stacking were added. Expansion pushed into standalone flagships and 17 Myer concessions simultaneously.</p>', 'The franchise model meant the local operator carried the capital burden and inventory risk while the UK parent collected royalties. Range came from the UK on Northern Hemisphere timelines; pricing landed well above UK levels once freight and margin stacking were added. Expansion pushed into standalone flagships and 17 Myer concessions simultaneously.', 2),
      ('deal-structure-and-unwind', '<ul>
<li><strong>The franchisee had a name — and a department-store shareholder.</strong> The local operator was Austradia, in which Myer bought a 20% stake specifically to ensure it was the only department store chain carrying Topshop, adding 17 in-store concessions to the standalone network.</li>
<li><strong>The unwind was fast and total.</strong> Administrators Ferrier Hodgson were appointed in May 2017 with debts of roughly $35–37 million; five of the nine standalone stores closed within weeks, and Myer erased all 17 concessions from its floors within two months while negotiations continued.</li>
<li><strong>The parent salvaged a remnant.</strong> UK owner Arcadia stepped in to rescue four Australian stores from closure in August 2017 and took over management directly — but the reprieve only delayed the final store closure to March 2020, and Arcadia itself collapsed soon after. The New Zealand franchise went into receivership the same year (September 2017).</li>
</ul>', '- **The franchisee had a name — and a department-store shareholder.** The local operator was Austradia, in which Myer bought a 20% stake specifically to ensure it was the only department store chain carrying Topshop, adding 17 in-store concessions to the standalone network.
- **The unwind was fast and total.** Administrators Ferrier Hodgson were appointed in May 2017 with debts of roughly \$35–37 million; five of the nine standalone stores closed within weeks, and Myer erased all 17 concessions from its floors within two months while negotiations continued.
- **The parent salvaged a remnant.** UK owner Arcadia stepped in to rescue four Australian stores from closure in August 2017 and took over management directly — but the reprieve only delayed the final store closure to March 2020, and Arcadia itself collapsed soon after. The New Zealand franchise went into receivership the same year (September 2017).', 3),
      ('failure-factors', '<ul>
<li><strong>Franchise economics</strong>: an undercapitalised local operator squeezed between UK supply terms and Australian retail costs</li>
<li><strong>Price premium without a supply-chain edge</strong>: unlike Zara''s twice-weekly drops, stock was slower and dearer than the same items online</li>
<li><strong>Channel conflict</strong>: Topshop''s own UK website shipped to Australia at lower prices, undercutting the local stores</li>
<li><strong>Competitive squeeze</strong>: caught between Zara/Uniqlo/H&amp;M''s superior economics and the online pure-plays (ASOS, The Iconic)</li>
<li><strong>Parent-brand decay</strong>: Arcadia''s global decline left no rescue capital — the UK parent itself later collapsed</li>
</ul>', '- **Franchise economics**: an undercapitalised local operator squeezed between UK supply terms and Australian retail costs
- **Price premium without a supply-chain edge**: unlike Zara''s twice-weekly drops, stock was slower and dearer than the same items online
- **Channel conflict**: Topshop''s own UK website shipped to Australia at lower prices, undercutting the local stores
- **Competitive squeeze**: caught between Zara/Uniqlo/H&M''s superior economics and the online pure-plays (ASOS, The Iconic)
- **Parent-brand decay**: Arcadia''s global decline left no rescue capital — the UK parent itself later collapsed', 4),
      ('key-metrics-and-performance', '<ul>
<li>9 standalone stores + 17 Myer concessions at administration</li>
<li>~$90 million annual sales; 760 jobs affected</li>
<li>Voluntary administration May 2017; final store closed March 2020</li>
</ul>', '- 9 standalone stores + 17 Myer concessions at administration
- \~\$90 million annual sales; 760 jobs affected
- Voluntary administration May 2017; final store closed March 2020', 5),
      ('lessons-for-market-entrants', '<p>Topshop shows the franchise shortcut can become a trap: if the local partner''s economics don''t work, the brand fails regardless of consumer love — and a global e-commerce site that undercuts your own local stores is self-inflicted channel conflict.</p>', 'Topshop shows the franchise shortcut can become a trap: if the local partner''s economics don''t work, the brand fails regardless of consumer love — and a global e-commerce site that undercuts your own local stores is self-inflicted channel conflict.', 6)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  origin_country = COALESCE(NULLIF(origin_country, ''), 'United Kingdom'),
  industry = COALESCE(NULLIF(industry, ''), 'Fast fashion retail'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2011'),
  outcome = COALESCE(NULLIF(outcome, ''), 'unsuccessful')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study');
COMMIT;

-- wework-australia-market-entry  (replace; live body was 3449 chars) <- how-weworks-australian-business-outlived-its-parents-bankruptcy
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study');
  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)
-- intro (with quick-facts table)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study'), '<p>WeWork opened its first Australian doors at Martin Place, Sydney in October 2016, selling desks from $850 a month with a US$16 billion valuation behind it. The Australian expansion largely worked — it was the parent company that nearly didn''t survive.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>WeWork</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (New York)</td>
</tr>
<tr>
<td>Sector</td>
<td>Coworking / flexible office space</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016 (Martin Place, Sydney)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic — flagship CBD leases, then multi-city rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Mixed — durable local network despite the parent''s global implosion</td>
</tr>
</table>', 'WeWork opened its first Australian doors at Martin Place, Sydney in October 2016, selling desks from \$850 a month with a US\$16 billion valuation behind it. The Australian expansion largely worked — it was the parent company that nearly didn''t survive.
<table header-column="true">
<tr>
<td>Company</td>
<td>WeWork</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (New York)</td>
</tr>
<tr>
<td>Sector</td>
<td>Coworking / flexible office space</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016 (Martin Place, Sydney)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic — flagship CBD leases, then multi-city rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Mixed — durable local network despite the parent''s global implosion</td>
</tr>
</table>', 0, 'case_study';
-- sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Land a trophy address', 'land-a-trophy-address', 3),
      ('Densify the eastern seaboard', 'densify-the-eastern-seaboard', 4),
      ('Sell an experience premium in a commodity market', 'sell-an-experience-premium-in-a-commodity-market', 5),
      ('Survive the parent''s crisis', 'survive-the-parent-s-crisis', 6),
      ('People & places', 'people-and-places', 7),
      ('Why it (mostly) worked', 'why-it-mostly-worked', 8),
      ('Key metrics', 'key-metrics', 9),
      ('Lessons', 'lessons', 10)
) AS v(title, slug, ord);
-- section bodies
INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', '<p>Australia adopted coworking early — local spaces existed from 2006 — and by 2016 Sydney''s flexible-office market was growing fast, with WeWork the global category champion after raising US$800 million that year for international expansion. Australia was a natural target: expensive CBD space, a booming startup scene, and corporates experimenting with flexible workspace.</p>', 'Australia adopted coworking early — local spaces existed from 2006 — and by 2016 Sydney''s flexible-office market was growing fast, with WeWork the global category champion after raising US\$800 million that year for international expansion. Australia was a natural target: expensive CBD space, a booming startup scene, and corporates experimenting with flexible workspace.', 1),
      ('entry-strategy', '', '', 2),
      ('land-a-trophy-address', '<p>WeWork''s first Australian site opened on 4 October 2016 in Martin Place — the symbolic heart of Sydney''s financial district — with desks from $850 a month. The address itself was the marketing: startups could buy a blue-chip postcode by the desk.</p>', 'WeWork''s first Australian site opened on 4 October 2016 in Martin Place — the symbolic heart of Sydney''s financial district — with desks from \$850 a month. The address itself was the marketing: startups could buy a blue-chip postcode by the desk.', 3),
      ('densify-the-eastern-seaboard', '<p>From the Sydney flagship, WeWork added multiple Sydney sites (5 Martin Place, 333 George Street, 100 Harris Street) and expanded into Melbourne and Brisbane, before eyeing Perth with a planned ~8,000 sqm space at Central Park Tower — chasing national coverage for enterprise clients.</p>', 'From the Sydney flagship, WeWork added multiple Sydney sites (5 Martin Place, 333 George Street, 100 Harris Street) and expanded into Melbourne and Brisbane, before eyeing Perth with a planned \~8,000 sqm space at Central Park Tower — chasing national coverage for enterprise clients.', 4),
      ('sell-an-experience-premium-in-a-commodity-market', '<p>Against established local operators, WeWork differentiated on design, community programming and a global membership network — renting identity, not just square metres.</p>', 'Against established local operators, WeWork differentiated on design, community programming and a global membership network — renting identity, not just square metres.', 5),
      ('survive-the-parent-s-crisis', '<p>WeWork''s global overexpansion culminated in its notorious valuation collapse and restructuring. Yet the Australian sites remained open and continue trading today — the local business''s fundamentals (prime locations, real occupancy) outlived the parent''s balance sheet drama.</p>', 'WeWork''s global overexpansion culminated in its notorious valuation collapse and restructuring. Yet the Australian sites remained open and continue trading today — the local business''s fundamentals (prime locations, real occupancy) outlived the parent''s balance sheet drama.', 6),
      ('people-and-places', '<ul>
<li><strong>One local hire became the whole franchise.</strong> Balder Tol joined as WeWork''s first Australian employee in 2016 as director of community, rose to general manager Australia by 2018, added Southeast Asia to his remit in 2021, and led the combined business until departing in early 2025 after nearly nine years — growing Australian membership to more than 12,000 along the way.</li>
<li><strong>The flagship had a story.</strong> The Martin Place site occupies three floors of the renovated 1916 "Money Box Building" — the Commonwealth Bank landmark once depicted on children''s coin banks — surrounded by Australia''s financial institutions, giving startups a blue-chip address by the desk.</li>
</ul>', '- **One local hire became the whole franchise.** Balder Tol joined as WeWork''s first Australian employee in 2016 as director of community, rose to general manager Australia by 2018, added Southeast Asia to his remit in 2021, and led the combined business until departing in early 2025 after nearly nine years — growing Australian membership to more than 12,000 along the way.
- **The flagship had a story.** The Martin Place site occupies three floors of the renovated 1916 "Money Box Building" — the Commonwealth Bank landmark once depicted on children''s coin banks — surrounded by Australia''s financial institutions, giving startups a blue-chip address by the desk.', 7),
      ('why-it-mostly-worked', '<ul>
<li><strong>Flagship-first entry</strong> created instant brand gravity in a market that respects addresses.</li>
<li><strong>Genuine local demand</strong> — Sydney''s coworking boom predated WeWork; it surfed a wave rather than creating one.</li>
<li><strong>Enterprise mix</strong> insulated Australian sites when startup demand wobbled.</li>
<li><strong>But</strong>: the same growth-at-all-costs lease model that built the network nearly destroyed it globally — Australia inherited the parent''s risk without controlling it.</li>
</ul>', '- **Flagship-first entry** created instant brand gravity in a market that respects addresses.
- **Genuine local demand** — Sydney''s coworking boom predated WeWork; it surfed a wave rather than creating one.
- **Enterprise mix** insulated Australian sites when startup demand wobbled.
- **But**: the same growth-at-all-costs lease model that built the network nearly destroyed it globally — Australia inherited the parent''s risk without controlling it.', 8),
      ('key-metrics', '<ul>
<li>First site: Martin Place, Sydney — opened 4 October 2016</li>
<li>Desks from $850/month at launch</li>
<li>Expansion across Sydney, Melbourne, Brisbane and Perth</li>
<li>US$16B parent valuation at entry; US$800M raised in 2016 for global expansion</li>
</ul>', '- First site: Martin Place, Sydney — opened 4 October 2016
- Desks from \$850/month at launch
- Expansion across Sydney, Melbourne, Brisbane and Perth
- US\$16B parent valuation at entry; US\$800M raised in 2016 for global expansion', 9),
      ('lessons', '<ol>
<li>In real-estate-anchored businesses, the first address is a brand decision, not a cost decision.</li>
<li>Entering on the back of an existing local trend beats evangelising a new behaviour.</li>
<li>A subsidiary can execute well and still be hostage to the parent''s capital structure — local partners and landlords will price that risk.</li>
<li>Premium positioning survives downturns only when paired with genuinely defensible locations.</li>
</ol>', '1. In real-estate-anchored businesses, the first address is a brand decision, not a cost decision.
2. Entering on the back of an existing local trend beats evangelising a new behaviour.
3. A subsidiary can execute well and still be hostage to the parent''s capital structure — local partners and landlords will price that risk.
4. Premium positioning survives downturns only when paired with genuinely defensible locations.', 10)
) AS v(slug, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study');
-- read time
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study');
-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)
UPDATE public.content_company_profiles SET
  company_name = COALESCE(NULLIF(company_name, ''), 'WeWork'),
  origin_country = COALESCE(NULLIF(origin_country, ''), 'United States'),
  industry = COALESCE(NULLIF(industry, ''), 'Coworking / flexible office space'),
  entry_date = COALESCE(NULLIF(entry_date, ''), '2016')
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study');
COMMIT;
