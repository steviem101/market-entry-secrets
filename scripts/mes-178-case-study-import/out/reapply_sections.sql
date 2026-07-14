-- MES-178 W1 fix: re-apply corrected subsection structure to the
-- already-imported drafts that used the two-level heading shape.
-- Scoped to status='draft'; each target is its own transaction.

-- how-ocado-entered-australia-as-a-technology-partner-not-a-retailer (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer' AND status = 'draft' AND content_type = 'case_study'), '<p>Ocado entered Australia without selling a single grocery. In March 2019, the UK online grocer signed an <strong>exclusive services agreement with Coles</strong> — its fifth major overseas licensing deal in under 18 months — to deploy its Smart Platform and robotic fulfilment centres in Sydney and Melbourne. By 2026, Coles'' ecommerce was growing at <strong>13%+</strong> on Ocado''s technology, and Ocado had rolled off exclusivity, freeing it to sell to the rest of the Australian grocery market.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Ocado Group plc (UK)</td>
</tr>
<tr>
<td>Sector</td>
<td>Grocery technology / ecommerce fulfilment</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (agreement signed; facilities live by ~2024)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Exclusive B2B technology licensing partnership with Coles</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — platform live, partner ecommerce growing 13%+, exclusivity now ended</td>
</tr>
</table>', 'Ocado entered Australia without selling a single grocery. In March 2019, the UK online grocer signed an **exclusive services agreement with Coles** — its fifth major overseas licensing deal in under 18 months — to deploy its Smart Platform and robotic fulfilment centres in Sydney and Melbourne. By 2026, Coles'' ecommerce was growing at **13%+** on Ocado''s technology, and Ocado had rolled off exclusivity, freeing it to sell to the rest of the Australian grocery market.
<table header-column="true">
<tr>
<td>Company</td>
<td>Ocado Group plc (UK)</td>
</tr>
<tr>
<td>Sector</td>
<td>Grocery technology / ecommerce fulfilment</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (agreement signed; facilities live by \~2024)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Exclusive B2B technology licensing partnership with Coles</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — platform live, partner ecommerce growing 13%+, exclusivity now ended</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & footprint', 'people-and-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Ocado built its reputation as the UK''s online grocery pioneer, spending 15+ years developing automated "customer fulfilment centres" (CFCs) where robots pick orders on giant grids. Rather than exporting its retail brand, Ocado productised this capability as the <strong>Ocado Smart Platform (OSP)</strong> and began licensing it to incumbent grocers worldwide — including Kroger in the US and Casino in France. Australia''s $100B+ grocery market was a duopoly (Woolworths and Coles) with historically low online penetration. Coles was losing ground to Woolworths in ecommerce and needed a step-change, not an incremental fix.</p>', 'Ocado built its reputation as the UK''s online grocery pioneer, spending 15+ years developing automated "customer fulfilment centres" (CFCs) where robots pick orders on giant grids. Rather than exporting its retail brand, Ocado productised this capability as the **Ocado Smart Platform (OSP)** and began licensing it to incumbent grocers worldwide — including Kroger in the US and Casino in France.
Australia''s \$100B+ grocery market was a duopoly (Woolworths and Coles) with historically low online penetration. Coles was losing ground to Woolworths in ecommerce and needed a step-change, not an incremental fix.', 1),
      ('entry-strategy', 'License to the incumbent, don''t fight it', '<p>Ocado entered by making the local number two its exclusive customer. Under the March 2019 agreement, Ocado partnered with Coles (ASX: COL) to deliver an end-to-end online grocery solution — webshop, robotic single-pick fulfilment, and last-mile delivery software — before the end of FY2023.</p>', 'Ocado entered by making the local number two its exclusive customer. Under the March 2019 agreement, Ocado partnered with Coles (ASX: COL) to deliver an end-to-end online grocery solution — webshop, robotic single-pick fulfilment, and last-mile delivery software — before the end of FY2023.', 2),
      ('entry-strategy', 'Anchor infrastructure in the two biggest cities', '<p>The deal committed both parties to two robotic CFCs, one in Sydney and one in Melbourne, serving Australia''s largest urban catchments, while customers in less populated areas were served through Ocado''s store-pick software — a pragmatic hybrid for Australia''s dispersed geography.</p>', 'The deal committed both parties to two robotic CFCs, one in Sydney and one in Melbourne, serving Australia''s largest urban catchments, while customers in less populated areas were served through Ocado''s store-pick software — a pragmatic hybrid for Australia''s dispersed geography.', 3),
      ('entry-strategy', 'Exclusivity as the entry wedge, optionality as the endgame', '<p>Exclusivity gave Coles confidence to commit capital and gave Ocado a flagship reference customer. By early 2026, mutual exclusivity had ended in most live markets including Australia — positioning Ocado to sell its automation to other Australian retailers now that the technology is locally proven.</p>', 'Exclusivity gave Coles confidence to commit capital and gave Ocado a flagship reference customer. By early 2026, mutual exclusivity had ended in most live markets including Australia — positioning Ocado to sell its automation to other Australian retailers now that the technology is locally proven.', 4),
      ('people-and-footprint', NULL::text, '<ul>
<li><strong>Signed at the top.</strong> The 2019 deal was the centrepiece of Coles'' ecommerce strategy, with Ocado Solutions CEO Luke Jensen leading the vendor side; Ocado Group CEO Tim Steiner and Coles CEO Leah Weckert fronted the eventual CFC openings.</li>
<li><strong>Two mega-sites, around 1,000 robots each.</strong> The CFCs were built at Truganina in Melbourne''s west and a 30,000-square-metre site at Wetherill Park in Sydney''s west (opened October 2024), each using roughly 1,000 grid robots to pick and pack orders.</li>
<li><strong>Local jobs as the licence to operate.</strong> Construction and fit-out supported more than 600 jobs, with roughly 600 ongoing roles — including skilled technology positions — once the centres commenced operation.</li>
<li><strong>One customer is the whole market.</strong> Ocado''s Australian ''customer base'' was a single logo: Coles. Its local headcount and engineering presence exist to serve that account — the defining trait of infrastructure-licensing entries.</li>
</ul>', '- **Signed at the top.** The 2019 deal was the centrepiece of Coles'' ecommerce strategy, with Ocado Solutions CEO Luke Jensen leading the vendor side; Ocado Group CEO Tim Steiner and Coles CEO Leah Weckert fronted the eventual CFC openings.
- **Two mega-sites, around 1,000 robots each.** The CFCs were built at Truganina in Melbourne''s west and a 30,000-square-metre site at Wetherill Park in Sydney''s west (opened October 2024), each using roughly 1,000 grid robots to pick and pack orders.
- **Local jobs as the licence to operate.** Construction and fit-out supported more than 600 jobs, with roughly 600 ongoing roles — including skilled technology positions — once the centres commenced operation.
- **One customer is the whole market.** Ocado''s Australian ''customer base'' was a single logo: Coles. Its local headcount and engineering presence exist to serve that account — the defining trait of infrastructure-licensing entries.', 5),
      ('success-factors', NULL::text, '<ul>
<li><strong>Asset-light brand entry</strong>: Ocado carried no consumer acquisition costs, no retail licences, and no local brand-building spend — the partner brought the customers.</li>
<li><strong>Aligned incentives</strong>: Coles funded facilities and migration; Ocado earned platform fees tied to capacity — both sides needed the rollout to work.</li>
<li><strong>Proven playbook</strong>: Australia was one of several near-simultaneous international OSP deals, letting Ocado apply lessons from Kroger and others.</li>
<li><strong>Patience on timelines</strong>: robotic CFCs took years to go live, but the multi-year contract structure absorbed delays without killing the deal.</li>
</ul>', '- **Asset-light brand entry**: Ocado carried no consumer acquisition costs, no retail licences, and no local brand-building spend — the partner brought the customers.
- **Aligned incentives**: Coles funded facilities and migration; Ocado earned platform fees tied to capacity — both sides needed the rollout to work.
- **Proven playbook**: Australia was one of several near-simultaneous international OSP deals, letting Ocado apply lessons from Kroger and others.
- **Patience on timelines**: robotic CFCs took years to go live, but the multi-year contract structure absorbed delays without killing the deal.', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>March 2019: exclusive agreement signed; two CFCs committed (Sydney, Melbourne), live within ~4 years.</li>
<li>Coles transitioned its store-pick operations onto the Ocado Smart Platform in parallel.</li>
<li>By early 2026: Coles ecommerce growth surpassed <strong>13%</strong> on the platform.</li>
<li>Late 2025 – early 2026: mutual exclusivity ended, opening the rest of the Australian market to Ocado.</li>
</ul>', '- March 2019: exclusive agreement signed; two CFCs committed (Sydney, Melbourne), live within \~4 years.
- Coles transitioned its store-pick operations onto the Ocado Smart Platform in parallel.
- By early 2026: Coles ecommerce growth surpassed **13%** on the platform.
- Late 2025 – early 2026: mutual exclusivity ended, opening the rest of the Australian market to Ocado.', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>You can enter a duopoly by powering one side of it.</strong> Selling technology to an incumbent converts the market''s biggest obstacle into your distribution channel.</li>
<li><strong>Exclusivity is a pricing lever, not a permanent state.</strong> Trade it for commitment early, then reclaim optionality once the market is proven.</li>
<li><strong>B2B licensing de-risks distant markets.</strong> For capital-intensive models, a local partner''s balance sheet and brand beat a greenfield launch.</li>
<li><strong>Structure for long infrastructure timelines.</strong> Multi-year milestones kept the partnership intact through construction delays.</li>
</ol>', '1. **You can enter a duopoly by powering one side of it.** Selling technology to an incumbent converts the market''s biggest obstacle into your distribution channel.
2. **Exclusivity is a pricing lever, not a permanent state.** Trade it for commitment early, then reclaim optionality once the market is proven.
3. **B2B licensing de-risks distant markets.** For capital-intensive models, a local partner''s balance sheet and brand beat a greenfield launch.
4. **Structure for long infrastructure timelines.** Multi-year milestones kept the partnership intact through construction delays.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-lightspeed-acquired-its-way-into-australian-hospitality-pos (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos' AND status = 'draft' AND content_type = 'case_study'), '<p>Canada''s Lightspeed didn''t launch in Australia — it bought its way to market leadership on both sides of the Tasman. In October 2019 it acquired Sydney hospitality POS company <strong>Kounta</strong> (~7,000 customer locations) for roughly <strong>US$43 million</strong>, and in 2021 it followed with Auckland retail POS leader <strong>Vend</strong> for about <strong>US$350 million</strong> — instantly becoming a dominant cloud point-of-sale player across Australia and New Zealand.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Lightspeed Commerce, formerly Lightspeed POS (Canada)</td>
</tr>
<tr>
<td>Sector</td>
<td>Cloud point-of-sale and commerce software</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (Kounta), deepened 2021 (Vend)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Serial acquisition of local category leaders</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — instant APAC scale, 10,000+ hospitality venues under the brand</td>
</tr>
</table>', 'Canada''s Lightspeed didn''t launch in Australia — it bought its way to market leadership on both sides of the Tasman. In October 2019 it acquired Sydney hospitality POS company **Kounta** (\~7,000 customer locations) for roughly **US\$43 million**, and in 2021 it followed with Auckland retail POS leader **Vend** for about **US\$350 million** — instantly becoming a dominant cloud point-of-sale player across Australia and New Zealand.
<table header-column="true">
<tr>
<td>Company</td>
<td>Lightspeed Commerce, formerly Lightspeed POS (Canada)</td>
</tr>
<tr>
<td>Sector</td>
<td>Cloud point-of-sale and commerce software</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (Kounta), deepened 2021 (Vend)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Serial acquisition of local category leaders</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — instant APAC scale, 10,000+ hospitality venues under the brand</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & continuity', 'people-and-continuity', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Montreal-based Lightspeed, founded by Dax Dasilva, listed on the TSX in March 2019 with an explicit strategy of consolidating the fragmented global POS market. Australia and New Zealand were attractive: high card-payment penetration, dense café and hospitality culture, and two strong home-grown cloud POS players — <strong>Kounta</strong> (Sydney, founded 2012 by Nick Cloete, backed by MYOB from 2014 and partnered with CBA from 2016) in hospitality, and <strong>Vend</strong> (Auckland, founded 2010 by Vaughan Rowsell) in retail.</p>', 'Montreal-based Lightspeed, founded by Dax Dasilva, listed on the TSX in March 2019 with an explicit strategy of consolidating the fragmented global POS market. Australia and New Zealand were attractive: high card-payment penetration, dense café and hospitality culture, and two strong home-grown cloud POS players — **Kounta** (Sydney, founded 2012 by Nick Cloete, backed by MYOB from 2014 and partnered with CBA from 2016) in hospitality, and **Vend** (Auckland, founded 2010 by Vaughan Rowsell) in retail.', 1),
      ('entry-strategy', 'Buy the local leader instead of fighting it', '<p>Greenfield entry would have meant years competing against entrenched local products with deep bank and accounting integrations. Lightspeed instead acquired Kounta — already integrated with MYOB and Commonwealth Bank, serving 7,000+ customer locations across AU/NZ — gaining a local team, brand trust, and distribution overnight.</p>', 'Greenfield entry would have meant years competing against entrenched local products with deep bank and accounting integrations. Lightspeed instead acquired Kounta — already integrated with MYOB and Commonwealth Bank, serving 7,000+ customer locations across AU/NZ — gaining a local team, brand trust, and distribution overnight.', 2),
      ('entry-strategy', 'Structure the deal to keep the team', '<p>Of the ~US$43M consideration, US$7.5M in deferred cash plus additional shares were payable to Kounta employees through October 2021, contingent on milestones and continued employment — locking in the local operators who understood the market.</p>', 'Of the \~US\$43M consideration, US\$7.5M in deferred cash plus additional shares were payable to Kounta employees through October 2021, contingent on milestones and continued employment — locking in the local operators who understood the market.', 3),
      ('entry-strategy', 'Repeat on the other side of the market', '<p>In March 2021, Lightspeed acquired Vend (~US$350M; revenue ~US$34M TTM, US$7B+ in gross transaction volume), adding the region''s retail POS leader to its hospitality base and consolidating APAC in a second stroke. Both products were folded into the Lightspeed brand.</p>', 'In March 2021, Lightspeed acquired Vend (\~US\$350M; revenue \~US\$34M TTM, US\$7B+ in gross transaction volume), adding the region''s retail POS leader to its hospitality base and consolidating APAC in a second stroke. Both products were folded into the Lightspeed brand.', 4),
      ('people-and-continuity', NULL::text, '<ul>
<li><strong>Founder retention as integration strategy.</strong> Kounta founder and CEO Nick Cloete — who had grown the Sydney company from 2012 through MYOB''s 2014 investment and a 2016 Commonwealth Bank partnership — publicly championed the deal ("joining Lightspeed, a recognized global leader, is a testament to our hard work"), and the employment-linked earn-out held key staff through October 2021.</li>
<li><strong>The acquired brand kept selling.</strong> The product ran as "Kounta powered by Lightspeed" before fully rebranding, keeping the trusted local name in front of its 7,000+ venues while the base grew past 10,000 venues across Australia and New Zealand.</li>
</ul>', '- **Founder retention as integration strategy.** Kounta founder and CEO Nick Cloete — who had grown the Sydney company from 2012 through MYOB''s 2014 investment and a 2016 Commonwealth Bank partnership — publicly championed the deal ("joining Lightspeed, a recognized global leader, is a testament to our hard work"), and the employment-linked earn-out held key staff through October 2021.
- **The acquired brand kept selling.** The product ran as "Kounta powered by Lightspeed" before fully rebranding, keeping the trusted local name in front of its 7,000+ venues while the base grew past 10,000 venues across Australia and New Zealand.', 5),
      ('success-factors', NULL::text, '<ul>
<li><strong>Instant local legitimacy</strong>: Kounta and Vend were beloved local brands; customers migrated to "Kounta powered by Lightspeed" rather than to a foreign unknown.</li>
<li><strong>Complementary verticals</strong>: hospitality (Kounta) + retail (Vend) with minimal overlap — two acquisitions covered the whole SMB commerce market.</li>
<li><strong>Public-market currency</strong>: TSX-listed shares funded acquisitions that private competitors couldn''t match.</li>
<li><strong>Existing integrations as moats acquired</strong>: MYOB, CBA and Xero ecosystem ties came with the deals.</li>
</ul>', '- **Instant local legitimacy**: Kounta and Vend were beloved local brands; customers migrated to "Kounta powered by Lightspeed" rather than to a foreign unknown.
- **Complementary verticals**: hospitality (Kounta) + retail (Vend) with minimal overlap — two acquisitions covered the whole SMB commerce market.
- **Public-market currency**: TSX-listed shares funded acquisitions that private competitors couldn''t match.
- **Existing integrations as moats acquired**: MYOB, CBA and Xero ecosystem ties came with the deals.', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>October 2019: Kounta acquired — ~US$35.3M cash on closing plus shares (total ~US$43M; enterprise value ~A$84M); 7,000+ customer locations; revenue ~US$6.4M FY19.</li>
<li>March 2021: Vend acquired for ~US$350M (~NZ$450M reported locally) — ~US$192.5M cash, ~US$157.5M in shares.</li>
<li>Post-acquisition: 10,000+ venues across AU/NZ on the hospitality product alone; Lightspeed positioned as a top cloud POS provider in APAC.</li>
</ul>', '- October 2019: Kounta acquired — \~US\$35.3M cash on closing plus shares (total \~US\$43M; enterprise value \~A\$84M); 7,000+ customer locations; revenue \~US\$6.4M FY19.
- March 2021: Vend acquired for \~US\$350M (\~NZ\$450M reported locally) — \~US\$192.5M cash, \~US\$157.5M in shares.
- Post-acquisition: 10,000+ venues across AU/NZ on the hospitality product alone; Lightspeed positioned as a top cloud POS provider in APAC.', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>In sticky-product categories, acquisition beats organic entry.</strong> POS churn is low; buying the installed base is often the only fast path to share.</li>
<li><strong>Earn-outs keep the local knowledge you just paid for.</strong> Deferred, employment-linked consideration held the Kounta team through integration.</li>
<li><strong>Map the market by vertical and buy one leader per vertical.</strong> Two targeted deals delivered full SMB coverage with little cannibalisation.</li>
<li><strong>A listed acquirer''s shares are an entry weapon.</strong> Part-scrip deals stretched Lightspeed''s capital across multiple markets simultaneously.</li>
</ol>', '1. **In sticky-product categories, acquisition beats organic entry.** POS churn is low; buying the installed base is often the only fast path to share.
2. **Earn-outs keep the local knowledge you just paid for.** Deferred, employment-linked consideration held the Kounta team through integration.
3. **Map the market by vertical and buy one leader per vertical.** Two targeted deals delivered full SMB coverage with little cannibalisation.
4. **A listed acquirer''s shares are an entry weapon.** Part-scrip deals stretched Lightspeed''s capital across multiple markets simultaneously.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-starlings-engine-entered-australia-selling-bank-tech-not-banking (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking' AND status = 'draft' AND content_type = 'case_study'), '<p>UK neobank Starling never applied for an Australian banking licence — yet its technology now runs one of Australia''s newest digital banks. Through its SaaS subsidiary <strong>Engine by Starling</strong>, it partnered with AMP in November 2023, and just <strong>12 months from kick-off</strong>, AMP Bank GO launched in February 2025, targeting Australia''s <strong>2.4 million</strong> self-employed and micro businesses with the country''s first numberless debit cards.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Engine by Starling — subsidiary of Starling Bank (UK)</td>
</tr>
<tr>
<td>Sector</td>
<td>Banking technology (SaaS core banking platform)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2023 (partnership signed); live February 2025</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Technology licensing to a licensed local incumbent (AMP)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — AMP Bank GO live, award-winning in year one</td>
</tr>
</table>', 'UK neobank Starling never applied for an Australian banking licence — yet its technology now runs one of Australia''s newest digital banks. Through its SaaS subsidiary **Engine by Starling**, it partnered with AMP in November 2023, and just **12 months from kick-off**, AMP Bank GO launched in February 2025, targeting Australia''s **2.4 million** self-employed and micro businesses with the country''s first numberless debit cards.
<table header-column="true">
<tr>
<td>Company</td>
<td>Engine by Starling — subsidiary of Starling Bank (UK)</td>
</tr>
<tr>
<td>Sector</td>
<td>Banking technology (SaaS core banking platform)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2023 (partnership signed); live February 2025</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Technology licensing to a licensed local incumbent (AMP)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — AMP Bank GO live, award-winning in year one</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('First customer & delivery', 'first-customer-and-delivery', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Starling Bank proved the digital-first model in the UK, then spun its core technology into <strong>Engine</strong>, a platform other banks can license to run modern digital propositions. Australia looked like hostile territory for foreign neobanks: the local neobank wave had already collapsed (Xinja handed back its licence in 2020; 86 400 and Up were absorbed by majors). But that collapse left a gap — roughly 2.4 million Australian businesses are self-employed or employ 1–4 people, most turning over under $200k a year, and they remained badly served by the big four''s tooling. AMP, a 175-year-old wealth manager rebuilding after the Royal Commission, had a banking licence and a distribution brand but legacy technology.</p>', 'Starling Bank proved the digital-first model in the UK, then spun its core technology into **Engine**, a platform other banks can license to run modern digital propositions. Australia looked like hostile territory for foreign neobanks: the local neobank wave had already collapsed (Xinja handed back its licence in 2020; 86 400 and Up were absorbed by majors). But that collapse left a gap — roughly 2.4 million Australian businesses are self-employed or employ 1–4 people, most turning over under \$200k a year, and they remained badly served by the big four''s tooling.
AMP, a 175-year-old wealth manager rebuilding after the Royal Commission, had a banking licence and a distribution brand but legacy technology.', 1),
      ('entry-strategy', 'Sell the engine, not the bank', '<p>Instead of repeating the failed foreign-neobank playbook (get licensed, burn capital acquiring deposits), Starling entered as a vendor. AMP kept the licence, capital, and regulatory burden; Engine supplied the proven core platform. Starling monetises Australia with SaaS economics and near-zero regulatory risk.</p>', 'Instead of repeating the failed foreign-neobank playbook (get licensed, burn capital acquiring deposits), Starling entered as a vendor. AMP kept the licence, capital, and regulatory burden; Engine supplied the proven core platform. Starling monetises Australia with SaaS economics and near-zero regulatory risk.', 2),
      ('entry-strategy', 'Speed as proof of value', '<p>From project kick-off in October 2023, AMP Bank GO was built in 12 months — going live to AMP staff first, then publicly in February 2025. In a market where core-banking replacements routinely take five+ years, the delivery speed was itself the marketing.</p>', 'From project kick-off in October 2023, AMP Bank GO was built in 12 months — going live to AMP staff first, then publicly in February 2025. In a market where core-banking replacements routinely take five+ years, the delivery speed was itself the marketing.', 3),
      ('entry-strategy', 'Target the segment the majors ignore', '<p>AMP Bank GO launched mobile-only, aimed at solopreneurs, side hustlers and micro businesses — with differentiated features: Australia''s first numberless-facing debit cards, Qantas Points on balances, Xero integration, and $0 monthly account fees.</p>', 'AMP Bank GO launched mobile-only, aimed at solopreneurs, side hustlers and micro businesses — with differentiated features: Australia''s first numberless-facing debit cards, Qantas Points on balances, Xero integration, and \$0 monthly account fees.', 4),
      ('first-customer-and-delivery', NULL::text, '<ul>
<li><strong>First Australian customer: AMP Bank.</strong> The launch client was Sydney-based AMP — its bank led by Sean O''Malley, with group CEO Alexis George sponsoring the digital bank as part of AMP''s post-Royal-Commission reinvention. Engine announced AMP alongside Salt Bank (Romania) in November 2023 as its first two clients beyond the UK.</li>
<li><strong>Delivery with a big-four consultancy.</strong> PwC worked alongside Engine and AMP to stand up the entirely new banking division in roughly fifteen months from agreement to public launch — on time, on budget, and with regulatory and open-banking approvals secured.</li>
<li><strong>Early traction.</strong> AMP Bank GO went live with 11,600 pre-release customers, targeting 24,000 personal and 58,000 business customers by the end of 2026.</li>
</ul>', '- **First Australian customer: AMP Bank.** The launch client was Sydney-based AMP — its bank led by Sean O''Malley, with group CEO Alexis George sponsoring the digital bank as part of AMP''s post-Royal-Commission reinvention. Engine announced AMP alongside Salt Bank (Romania) in November 2023 as its first two clients beyond the UK.
- **Delivery with a big-four consultancy.** PwC worked alongside Engine and AMP to stand up the entirely new banking division in roughly fifteen months from agreement to public launch — on time, on budget, and with regulatory and open-banking approvals secured.
- **Early traction.** AMP Bank GO went live with 11,600 pre-release customers, targeting 24,000 personal and 58,000 business customers by the end of 2026.', 5),
      ('success-factors', NULL::text, '<ul>
<li><strong>Regulatory arbitrage by design</strong>: the local partner holds the licence; the entrant supplies technology — the model Xinja needed but never had the option to use.</li>
<li><strong>Reference-customer flywheel</strong>: AMP joins Salt Bank (Romania) as an Engine showcase, and its success is now marketing collateral for Engine''s US ambitions.</li>
<li><strong>Aligned economics</strong>: AMP needed a growth story and cost reset; Engine needed an APAC flagship. Both got it.</li>
<li><strong>Segment focus</strong>: launching for micro business avoided head-on deposit wars with CBA/NAB.</li>
</ul>', '- **Regulatory arbitrage by design**: the local partner holds the licence; the entrant supplies technology — the model Xinja needed but never had the option to use.
- **Reference-customer flywheel**: AMP joins Salt Bank (Romania) as an Engine showcase, and its success is now marketing collateral for Engine''s US ambitions.
- **Aligned economics**: AMP needed a growth story and cost reset; Engine needed an APAC flagship. Both got it.
- **Segment focus**: launching for micro business avoided head-on deposit wars with CBA/NAB.', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>November 2023: AMP–Engine partnership announced.</li>
<li>October 2023 → October 2024: bank built in ~12 months on Engine''s SaaS platform.</li>
<li>10 February 2025: public launch of AMP Bank GO (personal + business).</li>
<li>Year one: award-winning launch; partnerships with Xero and Qantas; 50K+ app downloads on Google Play.</li>
</ul>', '- November 2023: AMP–Engine partnership announced.
- October 2023 → October 2024: bank built in \~12 months on Engine''s SaaS platform.
- 10 February 2025: public launch of AMP Bank GO (personal + business).
- Year one: award-winning launch; partnerships with Xero and Qantas; 50K+ app downloads on Google Play.', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>If the licence is the barrier, don''t be the licensee.</strong> Powering a local incumbent converts a multi-year regulatory slog into a commercial contract.</li>
<li><strong>A graveyard of failed entrants signals opportunity, not just risk.</strong> Australia''s neobank collapse discredited one entry mode while validating the demand it had exposed.</li>
<li><strong>Delivery speed is a differentiator you can sell.</strong> "Bank in 12 months" became the story that carried the launch.</li>
<li><strong>Pick a wedge segment.</strong> Micro businesses were underserved enough to switch and small enough not to provoke an incumbent response.</li>
</ol>', '1. **If the licence is the barrier, don''t be the licensee.** Powering a local incumbent converts a multi-year regulatory slog into a commercial contract.
2. **A graveyard of failed entrants signals opportunity, not just risk.** Australia''s neobank collapse discredited one entry mode while validating the demand it had exposed.
3. **Delivery speed is a differentiator you can sell.** "Bank in 12 months" became the story that carried the launch.
4. **Pick a wedge segment.** Micro businesses were underserved enough to switch and small enough not to provoke an incumbent response.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-sharesies-took-kiwi-micro-investing-across-the-tasman (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-sharesies-took-kiwi-micro-investing-across-the-tasman' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-sharesies-took-kiwi-micro-investing-across-the-tasman' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-sharesies-took-kiwi-micro-investing-across-the-tasman' AND status = 'draft' AND content_type = 'case_study'), '<p>Wellington fintech Sharesies took the classic trans-Tasman path — but ran it deliberately in stages. After <strong>soft-launching in Australia in April 2021</strong>, it waited until late August to switch on marketing, then raised <strong>NZ$50 million</strong> (doubling its valuation trajectory) explicitly to fund the expansion. Today the platform serves <strong>over 1 million customers</strong> across New Zealand and Australia with more than <strong>$12 billion</strong> invested.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Sharesies (New Zealand)</td>
</tr>
<tr>
<td>Sector</td>
<td>Fintech — retail investing platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2021 (soft launch April; marketing push from late August)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Staged direct launch, funded by a dedicated expansion raise</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 1M+ customers across NZ + AU, $12B+ on platform</td>
</tr>
</table>', 'Wellington fintech Sharesies took the classic trans-Tasman path — but ran it deliberately in stages. After **soft-launching in Australia in April 2021**, it waited until late August to switch on marketing, then raised **NZ\$50 million** (doubling its valuation trajectory) explicitly to fund the expansion. Today the platform serves **over 1 million customers** across New Zealand and Australia with more than **\$12 billion** invested.
<table header-column="true">
<tr>
<td>Company</td>
<td>Sharesies (New Zealand)</td>
</tr>
<tr>
<td>Sector</td>
<td>Fintech — retail investing platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2021 (soft launch April; marketing push from late August)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Staged direct launch, funded by a dedicated expansion raise</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 1M+ customers across NZ + AU, \$12B+ on platform</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-sharesies-took-kiwi-micro-investing-across-the-tasman' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & launch playbook', 'team-and-launch-playbook', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Founded in Wellington in 2017, Sharesies set out to give "someone with $5 the same investment opportunities as someone with $5 million" — fractional investing, no minimums, and a deliberately friendly brand aimed at first-time investors. By late 2020 it dominated NZ retail investing. Crucially, Sharesies had already offered its NZ users access to <strong>ASX-listed shares</strong> before entering Australia — so the product knew the Australian market before Australians knew the product. Australia offered a 5x population, a strong retail-investing boom (post-COVID), and incumbents (CommSec, big-broker apps) that felt institutional rather than welcoming to beginners.</p>', 'Founded in Wellington in 2017, Sharesies set out to give "someone with \$5 the same investment opportunities as someone with \$5 million" — fractional investing, no minimums, and a deliberately friendly brand aimed at first-time investors. By late 2020 it dominated NZ retail investing. Crucially, Sharesies had already offered its NZ users access to **ASX-listed shares** before entering Australia — so the product knew the Australian market before Australians knew the product.
Australia offered a 5x population, a strong retail-investing boom (post-COVID), and incumbents (CommSec, big-broker apps) that felt institutional rather than welcoming to beginners.', 1),
      ('entry-strategy', 'Soft launch first, market later', '<p>Sharesies went live to Australian customers in April 2021 with no fanfare — using the quiet period to test onboarding, compliance (AFSL arrangements), tax handling and support with real customers. The public marketing push began only in late August 2021, once the operational kinks were worked out.</p>', 'Sharesies went live to Australian customers in April 2021 with no fanfare — using the quiet period to test onboarding, compliance (AFSL arrangements), tax handling and support with real customers. The public marketing push began only in late August 2021, once the operational kinks were worked out.', 2),
      ('entry-strategy', 'Raise specifically for the expansion', '<p>In 2021 Sharesies raised NZ$50 million — double its December 2020 round of NZ$25 million — valuing the company around NZ$500 million, with the proceeds explicitly earmarked for the Australian build-out and product depth (funds came when the platform had ~450,000 investors and ~NZ$1.8B invested).</p>', 'In 2021 Sharesies raised NZ\$50 million — double its December 2020 round of NZ\$25 million — valuing the company around NZ\$500 million, with the proceeds explicitly earmarked for the Australian build-out and product depth (funds came when the platform had \~450,000 investors and \~NZ\$1.8B invested).', 3),
      ('entry-strategy', 'Keep the wedge identical', '<p>Rather than reposition for Australia, Sharesies exported the same wedge that won NZ: fractional shares from $0.01, no account minimums, plain-language education, and access to NZ, US and Australian markets in one app — plus later features like Kids Accounts extending the "investing for everyone" brand.</p>', 'Rather than reposition for Australia, Sharesies exported the same wedge that won NZ: fractional shares from \$0.01, no account minimums, plain-language education, and access to NZ, US and Australian markets in one app — plus later features like Kids Accounts extending the "investing for everyone" brand.', 4),
      ('team-and-launch-playbook', NULL::text, '<ul>
<li><strong>A big-bank operator as country manager.</strong> Sharesies appointed Brendan Doggett — former Westpac Chief Product Officer, with earlier senior roles at BT, Citi and Macquarie Group — as Australian Country Manager in August 2021, timing his arrival with the marketing switch-on.</li>
<li><strong>NZ founders stayed close.</strong> Co-founder Brooke Roberts fronted the Australian launch alongside Doggett and local marketing manager Adrien Jarvis.</li>
<li><strong>Brand-led acquisition.</strong> The public launch ran on a purpose-built brand platform, "Let''s Get Growing", created with Australian agency BMF — investing in warmth and accessibility rather than brokerage-fee price wars.</li>
<li><strong>Named backers for the expansion raise.</strong> The 2021 Series C (about A$48 million) was led by US fund Amplo, with DST Global''s Rahul Mehta, Benton Group, Icehouse Ventures and Even Capital participating — announced from Sydney with funds earmarked for the Australian build-out.</li>
</ul>', '- **A big-bank operator as country manager.** Sharesies appointed Brendan Doggett — former Westpac Chief Product Officer, with earlier senior roles at BT, Citi and Macquarie Group — as Australian Country Manager in August 2021, timing his arrival with the marketing switch-on.
- **NZ founders stayed close.** Co-founder Brooke Roberts fronted the Australian launch alongside Doggett and local marketing manager Adrien Jarvis.
- **Brand-led acquisition.** The public launch ran on a purpose-built brand platform, "Let''s Get Growing", created with Australian agency BMF — investing in warmth and accessibility rather than brokerage-fee price wars.
- **Named backers for the expansion raise.** The 2021 Series C (about A\$48 million) was led by US fund Amplo, with DST Global''s Rahul Mehta, Benton Group, Icehouse Ventures and Even Capital participating — announced from Sydney with funds earmarked for the Australian build-out.', 5),
      ('success-factors', NULL::text, '<ul>
<li><strong>Pre-existing product familiarity</strong>: ASX trading was already live for NZ users, so the Australian offering launched mature, not minimal.</li>
<li><strong>Sequencing discipline</strong>: operations proven before marketing dollars were spent — the opposite of the blitz launches that burned other entrants.</li>
<li><strong>Brand differentiation</strong>: a warm, first-investor brand in a market of intimidating broker interfaces.</li>
<li><strong>Capital raised with a purpose</strong>: the expansion was funded before it was needed, avoiding mid-entry funding crunches.</li>
</ul>', '- **Pre-existing product familiarity**: ASX trading was already live for NZ users, so the Australian offering launched mature, not minimal.
- **Sequencing discipline**: operations proven before marketing dollars were spent — the opposite of the blitz launches that burned other entrants.
- **Brand differentiation**: a warm, first-investor brand in a market of intimidating broker interfaces.
- **Capital raised with a purpose**: the expansion was funded before it was needed, avoiding mid-entry funding crunches.', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>April 2021: Australian soft launch; late August 2021: marketing campaign begins.</li>
<li>2021 raise: NZ$50M (after NZ$25M in Dec 2020), valuation ~NZ$500M; ~450,000 investors and ~NZ$1.8B on platform at the time.</li>
<li>Today: 1M+ customers across NZ and Australia; $12B+ invested; 10,000+ companies and ETFs available across NZ, AU and US markets.</li>
</ul>', '- April 2021: Australian soft launch; late August 2021: marketing campaign begins.
- 2021 raise: NZ\$50M (after NZ\$25M in Dec 2020), valuation \~NZ\$500M; \~450,000 investors and \~NZ\$1.8B on platform at the time.
- Today: 1M+ customers across NZ and Australia; \$12B+ invested; 10,000+ companies and ETFs available across NZ, AU and US markets.', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Soft launch is cheap insurance.</strong> Months of quiet operation surfaced problems while the audience was small and forgiving.</li>
<li><strong>Serve the new market from home before entering it.</strong> Offering ASX access to NZ users first built product readiness and demand signals pre-entry.</li>
<li><strong>Raise for the expansion, not during it.</strong> A dedicated war chest meant the entry was never hostage to the next funding round.</li>
<li><strong>A beginner-friendly brand travels.</strong> Positioning against category intimidation — not against a specific incumbent — worked identically on both sides of the Tasman.</li>
</ol>', '1. **Soft launch is cheap insurance.** Months of quiet operation surfaced problems while the audience was small and forgiving.
2. **Serve the new market from home before entering it.** Offering ASX access to NZ users first built product readiness and demand signals pre-entry.
3. **Raise for the expansion, not during it.** A dedicated war chest meant the entry was never hostage to the next funding round.
4. **A beginner-friendly brand travels.** Positioning against category intimidation — not against a specific incumbent — worked identically on both sides of the Tasman.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-sharesies-took-kiwi-micro-investing-across-the-tasman' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-sharesies-took-kiwi-micro-investing-across-the-tasman' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-serko-won-australian-corporate-travel-before-going-global (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-serko-won-australian-corporate-travel-before-going-global' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-serko-won-australian-corporate-travel-before-going-global' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-serko-won-australian-corporate-travel-before-going-global' AND status = 'draft' AND content_type = 'case_study'), '<p>Auckland''s Serko conquered the Australian corporate travel market so thoroughly that by 2018 its CEO could state plainly: "the bulk of Serko''s revenue comes from Australia." The travel-tech company got there without a consumer brand or a big-bang launch — it rode <strong>travel management company (TMC) distribution</strong>, a <strong>Qantas technology partnership</strong> (first corporate platform globally with IATA Level 3 NDC certification, 2018), and an <strong>ASX listing</strong> to become the default booking engine of Australasian business travel.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Serko Limited (New Zealand; NZX/ASX: SKO)</td>
</tr>
<tr>
<td>Sector</td>
<td>Corporate travel and expense technology</td>
</tr>
<tr>
<td>Entry year</td>
<td>2000s — channel-led expansion; NZX IPO 2014; ASX listing 2018</td>
</tr>
<tr>
<td>Entry mode</td>
<td>B2B2B channel distribution via TMCs + airline partnerships + dual listing</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia became Serko''s largest revenue market</td>
</tr>
</table>', 'Auckland''s Serko conquered the Australian corporate travel market so thoroughly that by 2018 its CEO could state plainly: "the bulk of Serko''s revenue comes from Australia." The travel-tech company got there without a consumer brand or a big-bang launch — it rode **travel management company (TMC) distribution**, a **Qantas technology partnership** (first corporate platform globally with IATA Level 3 NDC certification, 2018), and an **ASX listing** to become the default booking engine of Australasian business travel.
<table header-column="true">
<tr>
<td>Company</td>
<td>Serko Limited (New Zealand; NZX/ASX: SKO)</td>
</tr>
<tr>
<td>Sector</td>
<td>Corporate travel and expense technology</td>
</tr>
<tr>
<td>Entry year</td>
<td>2000s — channel-led expansion; NZX IPO 2014; ASX listing 2018</td>
</tr>
<tr>
<td>Entry mode</td>
<td>B2B2B channel distribution via TMCs + airline partnerships + dual listing</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia became Serko''s largest revenue market</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-serko-won-australian-corporate-travel-before-going-global' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & anchor customers', 'people-and-anchor-customers', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Serko''s roots go back to 1994, when Darrin Grafton and Bob Shaw founded Interactive Technologies Limited to solve travel agents'' mid- and back-office problems. After selling ITL, they founded Serko in May 2007 around Serko Online — an online booking tool for corporate travel — later succeeded by the AI-driven Zeno platform. Australia and New Zealand function as one corporate travel region: the same TMCs (travel management companies), the same dominant carrier relationships (Qantas, Air New Zealand), and heavy trans-Tasman business traffic. For a Kiwi booking-tool vendor, Australia wasn''t a foreign market so much as the larger half of the home market.</p>', 'Serko''s roots go back to 1994, when Darrin Grafton and Bob Shaw founded Interactive Technologies Limited to solve travel agents'' mid- and back-office problems. After selling ITL, they founded Serko in May 2007 around Serko Online — an online booking tool for corporate travel — later succeeded by the AI-driven Zeno platform.
Australia and New Zealand function as one corporate travel region: the same TMCs (travel management companies), the same dominant carrier relationships (Qantas, Air New Zealand), and heavy trans-Tasman business traffic. For a Kiwi booking-tool vendor, Australia wasn''t a foreign market so much as the larger half of the home market.', 1),
      ('entry-strategy', 'Distribute through the channel, not to the end customer', '<p>Serko sold through TMCs — the agencies that manage corporate travel programs — rather than selling directly to thousands of corporates. Each TMC win brought a portfolio of corporate customers with it, letting a small Auckland company scale across Australia with minimal local salesforce.</p>', 'Serko sold through TMCs — the agencies that manage corporate travel programs — rather than selling directly to thousands of corporates. Each TMC win brought a portfolio of corporate customers with it, letting a small Auckland company scale across Australia with minimal local salesforce.', 2),
      ('entry-strategy', 'Partner with the airline that owns the market', '<p>Serko aligned early with Qantas on NDC (New Distribution Capability), the airline industry''s direct-content standard. Through that partnership, Serko''s Zeno became the <strong>first corporate travel platform to achieve IATA Level 3 NDC certification in 2018</strong> — giving Serko-powered bookings access to Qantas content and pricing others couldn''t match, in exactly the market where Qantas dominates corporate share.</p>', 'Serko aligned early with Qantas on NDC (New Distribution Capability), the airline industry''s direct-content standard. Through that partnership, Serko''s Zeno became the **first corporate travel platform to achieve IATA Level 3 NDC certification in 2018** — giving Serko-powered bookings access to Qantas content and pricing others couldn''t match, in exactly the market where Qantas dominates corporate share.', 3),
      ('entry-strategy', 'Use capital markets as an entry tool', '<p>Serko listed on the NZX in June 2014 (raising ~NZ$22M at $1.10/share), then added an ASX foreign-exempt listing in June 2018 — explicitly to access Australian institutional and retail investors in the country generating most of its revenue. Later, a 2019 partnership investment by Booking Holdings (4.7%) and the 2024 acquisition of Sabre''s GetThere extended the playbook globally.</p>', 'Serko listed on the NZX in June 2014 (raising \~NZ\$22M at \$1.10/share), then added an ASX foreign-exempt listing in June 2018 — explicitly to access Australian institutional and retail investors in the country generating most of its revenue. Later, a 2019 partnership investment by Booking Holdings (4.7%) and the 2024 acquisition of Sabre''s GetThere extended the playbook globally.', 4),
      ('people-and-anchor-customers', NULL::text, '<ul>
<li><strong>Founder-led for three decades.</strong> Co-founders Darrin Grafton (CEO) and Bob Shaw (CSO) have run Serko since 2007 from the Saatchi &amp; Saatchi building in Parnell, Auckland, growing to roughly 380 staff with offices across Australia, the US, India and China.</li>
<li><strong>Flight Centre as the anchor channel.</strong> Flight Centre Travel Group — whose corporate brands market and distribute Serko-powered booking tools — accounts for a significant share of Serko''s AU/NZ booking volume; the partnership has been renewed and expanded repeatedly, including a 2018 extension to at least 2022 and an ongoing co-development fund for FCTG-specific features.</li>
<li><strong>Qantas as the technology partner.</strong> The NDC partnership gave Zeno first-mover access to Qantas direct content and pricing — with the airline that owns Australian corporate travel share.</li>
</ul>', '- **Founder-led for three decades.** Co-founders Darrin Grafton (CEO) and Bob Shaw (CSO) have run Serko since 2007 from the Saatchi & Saatchi building in Parnell, Auckland, growing to roughly 380 staff with offices across Australia, the US, India and China.
- **Flight Centre as the anchor channel.** Flight Centre Travel Group — whose corporate brands market and distribute Serko-powered booking tools — accounts for a significant share of Serko''s AU/NZ booking volume; the partnership has been renewed and expanded repeatedly, including a 2018 extension to at least 2022 and an ongoing co-development fund for FCTG-specific features.
- **Qantas as the technology partner.** The NDC partnership gave Zeno first-mover access to Qantas direct content and pricing — with the airline that owns Australian corporate travel share.', 5),
      ('success-factors', NULL::text, '<ul>
<li><strong>Channel leverage</strong>: TMC distribution multiplied every sales win into dozens of corporate accounts.</li>
<li><strong>Deep integration moat</strong>: booking tools embed into TMC workflows, expense systems and airline content pipes — switching costs are high.</li>
<li><strong>Airline content advantage</strong>: NDC-first status with Qantas made Serko the technically superior choice in the Qantas-dominated corporate market.</li>
<li><strong>Trans-Tasman adjacency</strong>: shared language, carriers and TMCs made Australia a low-friction first international market — the classic NZ scale-up path.</li>
</ul>', '- **Channel leverage**: TMC distribution multiplied every sales win into dozens of corporate accounts.
- **Deep integration moat**: booking tools embed into TMC workflows, expense systems and airline content pipes — switching costs are high.
- **Airline content advantage**: NDC-first status with Qantas made Serko the technically superior choice in the Qantas-dominated corporate market.
- **Trans-Tasman adjacency**: shared language, carriers and TMCs made Australia a low-friction first international market — the classic NZ scale-up path.', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>June 2014: NZX IPO (~NZ$22M raise).</li>
<li>June 2018: ASX foreign-exempt listing; CEO confirms the bulk of revenue comes from Australia.</li>
<li>2018: Zeno becomes first corporate travel platform with IATA Level 3 NDC certification (Qantas partnership).</li>
<li>October 2019: Booking Holdings takes 4.7% stake in partnership deal.</li>
<li>FY23 revenue NZ$48M, with FY24 guidance of NZ$63–70M; 6,000+ corporate customers across 35+ countries.</li>
</ul>', '- June 2014: NZX IPO (\~NZ\$22M raise).
- June 2018: ASX foreign-exempt listing; CEO confirms the bulk of revenue comes from Australia.
- 2018: Zeno becomes first corporate travel platform with IATA Level 3 NDC certification (Qantas partnership).
- October 2019: Booking Holdings takes 4.7% stake in partnership deal.
- FY23 revenue NZ\$48M, with FY24 guidance of NZ\$63–70M; 6,000+ corporate customers across 35+ countries.', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>B2B2B channels are the cheapest market entry there is.</strong> Selling through intermediaries who already own the customer relationships converts their distribution into yours.</li>
<li><strong>Certify into the incumbent''s ecosystem.</strong> Being first to meet Qantas''s technical standard made Serko the path of least resistance for the whole market.</li>
<li><strong>List where your revenue lives.</strong> The ASX listing aligned Serko''s capital base with its customer base and raised its profile with Australian corporates.</li>
<li><strong>Treat adjacency as a launchpad, not a destination.</strong> Australian dominance funded and de-risked the later push into North America and Europe.</li>
</ol>', '1. **B2B2B channels are the cheapest market entry there is.** Selling through intermediaries who already own the customer relationships converts their distribution into yours.
2. **Certify into the incumbent''s ecosystem.** Being first to meet Qantas''s technical standard made Serko the path of least resistance for the whole market.
3. **List where your revenue lives.** The ASX listing aligned Serko''s capital base with its customer base and raised its profile with Australian corporates.
4. **Treat adjacency as a launchpad, not a destination.** Australian dominance funded and de-risked the later push into North America and Europe.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-serko-won-australian-corporate-travel-before-going-global' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-serko-won-australian-corporate-travel-before-going-global' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry' AND status = 'draft' AND content_type = 'case_study'), '<p>OVO Energy arrived in Australia in 2019 promising to disrupt electricity retailing the way it had in the UK. The consumer brand never got past roughly <strong>80,000 customers</strong> — but the entry still paid off spectacularly, just not as planned. OVO''s real Australian business turned out to be its <strong>Kaluza</strong> software platform: AGL took a majority stake in OVO Energy Australia in 2021, fully acquired it by 2024, and then invested <strong>~A$150 million for 20% of Kaluza itself</strong>, committing to run its ~4 million customer services on OVO''s technology.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>OVO Energy / OVO Group (UK)</td>
</tr>
<tr>
<td>Sector</td>
<td>Energy retail → energy software (Kaluza)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (AER retail authorisation approved 22 October 2019)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct retail entry → pivot to JV and technology licensing with AGL</td>
</tr>
<tr>
<td>Outcome</td>
<td>Mixed — retail brand sub-scale and absorbed by AGL; technology platform won the market</td>
</tr>
</table>', 'OVO Energy arrived in Australia in 2019 promising to disrupt electricity retailing the way it had in the UK. The consumer brand never got past roughly **80,000 customers** — but the entry still paid off spectacularly, just not as planned. OVO''s real Australian business turned out to be its **Kaluza** software platform: AGL took a majority stake in OVO Energy Australia in 2021, fully acquired it by 2024, and then invested **\~A\$150 million for 20% of Kaluza itself**, committing to run its \~4 million customer services on OVO''s technology.
<table header-column="true">
<tr>
<td>Company</td>
<td>OVO Energy / OVO Group (UK)</td>
</tr>
<tr>
<td>Sector</td>
<td>Energy retail → energy software (Kaluza)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (AER retail authorisation approved 22 October 2019)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct retail entry → pivot to JV and technology licensing with AGL</td>
</tr>
<tr>
<td>Outcome</td>
<td>Mixed — retail brand sub-scale and absorbed by AGL; technology platform won the market</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & local footprint', 'team-and-local-footprint', 3),
      ('Success and failure factors', 'success-and-failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Founded in Bristol in 2009 by Stephen Fitzpatrick, OVO grew from challenger to the UK''s third-largest domestic supplier (after acquiring SSE''s retail arm in 2020). Its differentiators were digital-first service and <strong>Kaluza</strong>, its in-house platform for billing, smart devices and grid flexibility. Australia looked attractive — high retail energy prices, low customer satisfaction with the big three (AGL, Origin, EnergyAustralia), and the world''s highest rooftop-solar penetration, ideal for Kaluza''s smart-energy technology. OVO applied to the AER in August 2019 and was authorised as an electricity retailer on 22 October 2019, launching with a Melbourne-based team across NSW, VIC, SA and QLD.</p>', 'Founded in Bristol in 2009 by Stephen Fitzpatrick, OVO grew from challenger to the UK''s third-largest domestic supplier (after acquiring SSE''s retail arm in 2020). Its differentiators were digital-first service and **Kaluza**, its in-house platform for billing, smart devices and grid flexibility.
Australia looked attractive — high retail energy prices, low customer satisfaction with the big three (AGL, Origin, EnergyAustralia), and the world''s highest rooftop-solar penetration, ideal for Kaluza''s smart-energy technology. OVO applied to the AER in August 2019 and was authorised as an electricity retailer on 22 October 2019, launching with a Melbourne-based team across NSW, VIC, SA and QLD.', 1),
      ('entry-strategy', 'Phase 1: challenger retail brand (2019–2021)', '<p>OVO launched with UK-style propositions — flat monthly payments (bill smoothing), 3% interest paid on credit balances, no exit fees, and optional GreenPower. The AFR covered its promise of "more disruption in electricity retailing". But customer acquisition in Australian energy is brutal: comparison-site economics, thin margins under the Default Market Offer, and incumbents with massive retention budgets.</p>', 'OVO launched with UK-style propositions — flat monthly payments (bill smoothing), 3% interest paid on credit balances, no exit fees, and optional GreenPower. The AFR covered its promise of "more disruption in electricity retailing". But customer acquisition in Australian energy is brutal: comparison-site economics, thin margins under the Default Market Offer, and incumbents with massive retention budgets.', 2),
      ('entry-strategy', 'Phase 2: partner with the incumbent instead (2021)', '<p>In March 2021, OVO signed a joint venture with AGL — Australia''s largest energy retailer — under which AGL took a majority (51%) stake in OVO Energy Australia and licensed the Kaluza platform, with AGL investing to adapt Kaluza for the Australian market. The consumer brand became, in effect, a pilot vehicle for the software.</p>', 'In March 2021, OVO signed a joint venture with AGL — Australia''s largest energy retailer — under which AGL took a majority (51%) stake in OVO Energy Australia and licensed the Kaluza platform, with AGL investing to adapt Kaluza for the Australian market. The consumer brand became, in effect, a pilot vehicle for the software.', 3),
      ('entry-strategy', 'Phase 3: the technology becomes the business (2023–2024)', '<p>All OVO Energy Australia customers (~80,000) were migrated onto Kaluza by 2023, achieving an NPS of 40+ — a live, local proof point. In April 2024, AGL took full ownership of OVO Energy Australia; in June 2024, AGL invested ~A$150M (US$100M) for a 20% stake in Kaluza (valuing it at ~US$500M) and committed to migrating its entire consumer business — ~4 million services — onto the platform by ~2028, targeting US$46–60M in annual savings.</p>', 'All OVO Energy Australia customers (\~80,000) were migrated onto Kaluza by 2023, achieving an NPS of 40+ — a live, local proof point. In April 2024, AGL took full ownership of OVO Energy Australia; in June 2024, AGL invested \~A\$150M (US\$100M) for a 20% stake in Kaluza (valuing it at \~US\$500M) and committed to migrating its entire consumer business — \~4 million services — onto the platform by \~2028, targeting US\$46–60M in annual savings.', 4),
      ('team-and-local-footprint', NULL::text, '<ul>
<li><strong>Melbourne base, Australian service.</strong> OVO Energy Australia launched with a Melbourne-based team and Australian-based customer service — a deliberate contrast with offshore-call-centre incumbents.</li>
<li><strong>UK operators seeded the launch.</strong> OVO''s regulatory application shows the core launch team was drawn from experienced UK operators — including the executive who had run the launch of OVO''s UK digital-only retailer — supplemented by personnel with direct experience selling retail energy to Victorian customers.</li>
<li><strong>Customers as the proof point.</strong> The roughly 80,000-customer base that team built became the live migration sandbox that ultimately sold Kaluza to AGL.</li>
</ul>', '- **Melbourne base, Australian service.** OVO Energy Australia launched with a Melbourne-based team and Australian-based customer service — a deliberate contrast with offshore-call-centre incumbents.
- **UK operators seeded the launch.** OVO''s regulatory application shows the core launch team was drawn from experienced UK operators — including the executive who had run the launch of OVO''s UK digital-only retailer — supplemented by personnel with direct experience selling retail energy to Victorian customers.
- **Customers as the proof point.** The roughly 80,000-customer base that team built became the live migration sandbox that ultimately sold Kaluza to AGL.', 5),
      ('success-and-failure-factors', NULL::text, '<ul>
<li><strong>Failure (retail)</strong>: sub-scale customer base in a saturated, price-driven retail market; no structural cost advantage as a small player.</li>
<li><strong>Success (pivot)</strong>: the OVO Australia customer base became a controlled sandbox proving Kaluza locally — de-risking the platform for AGL''s board.</li>
<li><strong>Right partner</strong>: AGL faced a costly legacy-SAP transformation; Kaluza offered a proven alternative with a local reference site already running.</li>
<li><strong>Solar-rich grid fit</strong>: Australia''s rooftop solar and EV growth made Kaluza''s flexibility software strategically valuable beyond billing.</li>
</ul>', '- **Failure (retail)**: sub-scale customer base in a saturated, price-driven retail market; no structural cost advantage as a small player.
- **Success (pivot)**: the OVO Australia customer base became a controlled sandbox proving Kaluza locally — de-risking the platform for AGL''s board.
- **Right partner**: AGL faced a costly legacy-SAP transformation; Kaluza offered a proven alternative with a local reference site already running.
- **Solar-rich grid fit**: Australia''s rooftop solar and EV growth made Kaluza''s flexibility software strategically valuable beyond billing.', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>22 October 2019: AER electricity retail authorisation approved.</li>
<li>March 2021: AGL joint venture; AGL majority stake in OVO Energy Australia; Kaluza licensed.</li>
<li>2023: ~80,000 OVO AU customers fully migrated to Kaluza; NPS 40+.</li>
<li>April 2024: AGL takes full ownership of OVO Energy Australia.</li>
<li>June 2024: AGL invests ~A$150M for 20% of Kaluza; ~4M customer services to migrate by ~2028; US$46–60M annual pre-tax savings targeted.</li>
</ul>', '- 22 October 2019: AER electricity retail authorisation approved.
- March 2021: AGL joint venture; AGL majority stake in OVO Energy Australia; Kaluza licensed.
- 2023: \~80,000 OVO AU customers fully migrated to Kaluza; NPS 40+.
- April 2024: AGL takes full ownership of OVO Energy Australia.
- June 2024: AGL invests \~A\$150M for 20% of Kaluza; \~4M customer services to migrate by \~2028; US\$46–60M annual pre-tax savings targeted.', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Know which asset you''re really exporting.</strong> OVO''s retail brand didn''t travel; its software did. The entry that failed revealed the entry that worked.</li>
<li><strong>A small customer base can still be a strategic asset.</strong> 80,000 customers weren''t a business — they were a local proof-of-concept that closed a nine-figure platform deal.</li>
<li><strong>Selling to the incumbent can beat competing with it.</strong> The pivot from AGL competitor to AGL vendor turned Australia''s market structure from obstacle into revenue.</li>
<li><strong>Sequence brand → proof → platform.</strong> Each phase created the credibility the next one needed.</li>
</ol>', '1. **Know which asset you''re really exporting.** OVO''s retail brand didn''t travel; its software did. The entry that failed revealed the entry that worked.
2. **A small customer base can still be a strategic asset.** 80,000 customers weren''t a business — they were a local proof-of-concept that closed a nine-figure platform deal.
3. **Selling to the incumbent can beat competing with it.** The pivot from AGL competitor to AGL vendor turned Australia''s market structure from obstacle into revenue.
4. **Sequence brand → proof → platform.** Each phase created the credibility the next one needed.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-shopify-won-australian-merchants-with-partner-led-growth (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-shopify-won-australian-merchants-with-partner-led-growth' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-shopify-won-australian-merchants-with-partner-led-growth' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-shopify-won-australian-merchants-with-partner-led-growth' AND status = 'draft' AND content_type = 'case_study'), '<p>Shopify never held an Australian launch event — yet Australia became one of its highest-penetration markets in the world, with roughly <strong>131,000 live Shopify stores</strong> by 2026. The Canadian commerce platform entered through developers, agencies and local payment integrations rather than marketing spend, and Australian brands like Who Gives A Crap, Frank Body and Culture Kings grew up "Shopify-native".</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Shopify Inc. (Canada)</td>
</tr>
<tr>
<td>Sector</td>
<td>Ecommerce platform (SaaS)</td>
</tr>
<tr>
<td>Entry year</td>
<td>Gradual — organic adoption from the early 2010s, formal local investment through the late 2010s–2020s</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic, ecosystem-led entry (partners, payments, product localisation)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — ~131,000 live AU stores; category-default platform for DTC brands</td>
</tr>
</table>', 'Shopify never held an Australian launch event — yet Australia became one of its highest-penetration markets in the world, with roughly **131,000 live Shopify stores** by 2026. The Canadian commerce platform entered through developers, agencies and local payment integrations rather than marketing spend, and Australian brands like Who Gives A Crap, Frank Body and Culture Kings grew up "Shopify-native".
<table header-column="true">
<tr>
<td>Company</td>
<td>Shopify Inc. (Canada)</td>
</tr>
<tr>
<td>Sector</td>
<td>Ecommerce platform (SaaS)</td>
</tr>
<tr>
<td>Entry year</td>
<td>Gradual — organic adoption from the early 2010s, formal local investment through the late 2010s–2020s</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic, ecosystem-led entry (partners, payments, product localisation)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — \~131,000 live AU stores; category-default platform for DTC brands</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-shopify-won-australian-merchants-with-partner-led-growth' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & flagship merchants', 'team-and-flagship-merchants', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Ottawa-based Shopify built a self-serve platform any merchant could adopt with a credit card — which meant international expansion could happen without international operations. Australia was fertile ground: high ecommerce growth off a low base, a strong DTC startup culture, English-speaking, and underserved by clunky local ecommerce software. Australian merchants simply started signing up. Editorial note: unlike most cases in this batch, there is no single "launch moment" — this case is best framed around tactics and ecosystem mechanics rather than a dated entry event.</p>', 'Ottawa-based Shopify built a self-serve platform any merchant could adopt with a credit card — which meant international expansion could happen without international operations. Australia was fertile ground: high ecommerce growth off a low base, a strong DTC startup culture, English-speaking, and underserved by clunky local ecommerce software. Australian merchants simply started signing up.
Editorial note: unlike most cases in this batch, there is no single "launch moment" — this case is best framed around tactics and ecosystem mechanics rather than a dated entry event.', 1),
      ('entry-strategy', 'Let the product cross the border first', '<p>Shopify''s self-serve, credit-card-onboarding model meant Australian adoption preceded any Australian presence. The company effectively observed where organic demand clustered, then invested behind it — the opposite of the build-it-first retail entries (Masters, Kaufland) in this series.</p>', 'Shopify''s self-serve, credit-card-onboarding model meant Australian adoption preceded any Australian presence. The company effectively observed where organic demand clustered, then invested behind it — the opposite of the build-it-first retail entries (Masters, Kaufland) in this series.', 2),
      ('entry-strategy', 'Localise the money, not just the language', '<p>The decisive localisation was payments and commerce plumbing: Shopify Payments for AUD, integrations with local favourites like Afterpay (BNPL) and eWay, local shipping apps, and GST-aware tooling. Later, <strong>Shopify Capital launched in Australia</strong> offering merchants funding from A$200 up to A$2.5 million — deepening lock-in.</p>', 'The decisive localisation was payments and commerce plumbing: Shopify Payments for AUD, integrations with local favourites like Afterpay (BNPL) and eWay, local shipping apps, and GST-aware tooling. Later, **Shopify Capital launched in Australia** offering merchants funding from A\$200 up to A\$2.5 million — deepening lock-in.', 3),
      ('entry-strategy', 'Grow an ecosystem that sells for you', '<p>Shopify cultivated a local partner economy — agencies, theme and app developers, and "Shopify Experts" — who acquired merchants on Shopify''s behalf. Flagship Australian success stories (Who Gives A Crap, Frank Body, Culture Kings, July) became the platform''s local marketing.</p>', 'Shopify cultivated a local partner economy — agencies, theme and app developers, and "Shopify Experts" — who acquired merchants on Shopify''s behalf. Flagship Australian success stories (Who Gives A Crap, Frank Body, Culture Kings, July) became the platform''s local marketing.', 4),
      ('team-and-flagship-merchants', NULL::text, '<ul>
<li><strong>Regional leadership landed late, in Sydney.</strong> Shopify ran Australia remotely for most of its rise; Shaun Broughton was appointed Managing Director APAC &amp; Japan in November 2020, based in Sydney, with a brief covering go-to-market, partnerships, marketing and launch engineering across ANZ, Japan, China, SEA and India.</li>
<li><strong>The enterprise flagship: JB Hi-Fi.</strong> Australia''s biggest Shopify Plus reference is JB Hi-Fi, which replatformed in 2019 and grew online sales from around A$200 million to more than A$1 billion in five years — proof the platform could carry one of the country''s largest retailers, not just DTC startups.</li>
<li><strong>Lean headcount, partner leverage.</strong> Even at global scale (about 7,600 employees in 2025), Shopify''s Australian model stayed partner-heavy: agencies and app developers in Sydney and Melbourne did much of the selling.</li>
</ul>', '- **Regional leadership landed late, in Sydney.** Shopify ran Australia remotely for most of its rise; Shaun Broughton was appointed Managing Director APAC & Japan in November 2020, based in Sydney, with a brief covering go-to-market, partnerships, marketing and launch engineering across ANZ, Japan, China, SEA and India.
- **The enterprise flagship: JB Hi-Fi.** Australia''s biggest Shopify Plus reference is JB Hi-Fi, which replatformed in 2019 and grew online sales from around A\$200 million to more than A\$1 billion in five years — proof the platform could carry one of the country''s largest retailers, not just DTC startups.
- **Lean headcount, partner leverage.** Even at global scale (about 7,600 employees in 2025), Shopify''s Australian model stayed partner-heavy: agencies and app developers in Sydney and Melbourne did much of the selling.', 5),
      ('success-factors', NULL::text, '<ul>
<li><strong>Zero-friction distribution</strong>: no sales force needed; the free trial was the market entry vehicle.</li>
<li><strong>Ecosystem incentives</strong>: agencies and developers earned revenue on Shopify, making them motivated local champions.</li>
<li><strong>Payments localisation</strong>: supporting how Australians actually pay (BNPL heavily among them) removed the biggest conversion barrier.</li>
<li><strong>Merchant success flywheel</strong>: visible local DTC winners recruited the next generation of founders to the platform by default.</li>
</ul>', '- **Zero-friction distribution**: no sales force needed; the free trial was the market entry vehicle.
- **Ecosystem incentives**: agencies and developers earned revenue on Shopify, making them motivated local champions.
- **Payments localisation**: supporting how Australians actually pay (BNPL heavily among them) removed the biggest conversion barrier.
- **Merchant success flywheel**: visible local DTC winners recruited the next generation of founders to the platform by default.', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>~131,291 live Shopify stores in Australia (Store Leads, June 2026) — among the top Shopify countries globally.</li>
<li>Shopify Capital Australia: merchant funding from A$200 to A$2.5M, launched ahead of peak sales season.</li>
<li>Australia consistently cited as one of Shopify''s most "Shopify-native" markets, with a mature agency ecosystem in Sydney and Melbourne.</li>
</ul>', '- \~131,291 live Shopify stores in Australia (Store Leads, June 2026) — among the top Shopify countries globally.
- Shopify Capital Australia: merchant funding from A\$200 to A\$2.5M, launched ahead of peak sales season.
- Australia consistently cited as one of Shopify''s most "Shopify-native" markets, with a mature agency ecosystem in Sydney and Melbourne.', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Product-led entry beats launch-led entry for SaaS.</strong> If customers can self-serve, demand data tells you where to invest — after revenue has already started.</li>
<li><strong>Localise payments before anything else.</strong> Money movement is where global products feel foreign; fixing it converts existing intent.</li>
<li><strong>Build an ecosystem with skin in the game.</strong> Local partners who profit from your growth are a distribution channel that compounds.</li>
<li><strong>Your customers'' success stories are your market entry campaign.</strong> Local hero brands did more for Shopify''s Australian credibility than advertising could.</li>
</ol>', '1. **Product-led entry beats launch-led entry for SaaS.** If customers can self-serve, demand data tells you where to invest — after revenue has already started.
2. **Localise payments before anything else.** Money movement is where global products feel foreign; fixing it converts existing intent.
3. **Build an ecosystem with skin in the game.** Local partners who profit from your growth are a distribution channel that compounds.
4. **Your customers'' success stories are your market entry campaign.** Local hero brands did more for Shopify''s Australian credibility than advertising could.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-shopify-won-australian-merchants-with-partner-led-growth' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-shopify-won-australian-merchants-with-partner-led-growth' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno' AND status = 'draft' AND content_type = 'case_study'), '<p>When Singapore''s <a href="http://Circles.Life">Circles.Life</a> launched in Australia on <strong>12 September 2019</strong>, its opening move was audacious: it offered to pay new customers'' phone bills for the <strong>first four months</strong> — a 20GB, unlimited-calls plan normally priced at <strong>$28 a month</strong>, free. The digital telco went on to win national customer-satisfaction awards, then executed something rarer still: a deliberate, orderly exit that transferred its customer base to Amaysim.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>[Circles.Life](http://Circles.Life)</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore</td>
</tr>
<tr>
<td>Sector</td>
<td>Digital telco (MVNO)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019</td>
</tr>
<tr>
<td>Entry mode</td>
<td>MVNO partnership on the Optus network</td>
</tr>
<tr>
<td>Outcome</td>
<td>Mixed — award-winning brand, later transferred its customer base to Amaysim in a planned build-operate-transfer exit</td>
</tr>
</table>', 'When Singapore''s [Circles.Life](http://Circles.Life) launched in Australia on **12 September 2019**, its opening move was audacious: it offered to pay new customers'' phone bills for the **first four months** — a 20GB, unlimited-calls plan normally priced at **\$28 a month**, free. The digital telco went on to win national customer-satisfaction awards, then executed something rarer still: a deliberate, orderly exit that transferred its customer base to Amaysim.
<table header-column="true">
<tr>
<td>Company</td>
<td>[Circles.Life](http://Circles.Life)</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore</td>
</tr>
<tr>
<td>Sector</td>
<td>Digital telco (MVNO)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019</td>
</tr>
<tr>
<td>Entry mode</td>
<td>MVNO partnership on the Optus network</td>
</tr>
<tr>
<td>Outcome</td>
<td>Mixed — award-winning brand, later transferred its customer base to Amaysim in a planned build-operate-transfer exit</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & endgame', 'team-and-endgame', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p><a href="http://Circles.Life">Circles.Life</a> was Singapore''s first full-service digital telco — an MVNO that buys wholesale network capacity and replaces physical stores with an app. In Singapore it captured over 5% of the mobile market and posted a sector-leading NPS above 50. After a Series C round led by Sequoia India, it announced plans to launch in more than five countries within 18 months, investing over <strong>$50 million per market</strong> — Taiwan and Australia first, both in 2019.</p>', '[Circles.Life](http://Circles.Life) was Singapore''s first full-service digital telco — an MVNO that buys wholesale network capacity and replaces physical stores with an app. In Singapore it captured over 5% of the mobile market and posted a sector-leading NPS above 50. After a Series C round led by Sequoia India, it announced plans to launch in more than five countries within 18 months, investing over **\$50 million per market** — Taiwan and Australia first, both in 2019.', 1),
      ('entry-strategy', 'Ride on incumbent infrastructure', '<p><a href="http://Circles.Life">Circles.Life</a> entered as an MVNO on the Optus network — notably owned by fellow Singaporean company Singtel — avoiding network capex entirely and going to market in months, not years.</p>', '[Circles.Life](http://Circles.Life) entered as an MVNO on the Optus network — notably owned by fellow Singaporean company Singtel — avoiding network capex entirely and going to market in months, not years.', 2),
      ('entry-strategy', 'Buy attention with an outrageous offer', '<p>The four-months-free launch promotion generated national press coverage on day one and gave the unknown brand an acquisition engine no ad campaign could match.</p>', 'The four-months-free launch promotion generated national press coverage on day one and gave the unknown brand an acquisition engine no ad campaign could match.', 3),
      ('entry-strategy', 'Stage the geographic rollout', '<p>Services launched first in NSW, Victoria, Queensland, Tasmania and the ACT, with Western Australia and South Australia following — matching support capacity to demand.</p>', 'Services launched first in NSW, Victoria, Queensland, Tasmania and the ACT, with Western Australia and South Australia following — matching support capacity to demand.', 4),
      ('entry-strategy', 'Digital-only distribution', '<p>No stores, no dealers: SIMs delivered to the door, everything else in-app — a structural cost advantage over incumbents and a differentiated customer experience.</p>', 'No stores, no dealers: SIMs delivered to the door, everything else in-app — a structural cost advantage over incumbents and a differentiated customer experience.', 5),
      ('team-and-endgame', NULL::text, '<ul>
<li><strong>Founder-fronted launch.</strong> Co-founder Rameez Ansar personally fronted the Australian announcement, positioning the entry around research showing Australians were "unhappy" with their telcos — the same dissatisfaction wedge used in Singapore.</li>
<li><strong>Local leadership from the local industry.</strong> The launch was run under Australia GM Ben Murray (through December 2020); in June 2021 the company appointed Sydney-based Maik Retzlaff — a former amaysim director of business development and commercial director (2012–2019) — as its Australian lead, buying deep local MVNO experience.</li>
<li><strong>The exit closed the loop.</strong> In January 2025 the Australian customer base was acquired by amaysim — the Optus-network rival Retzlaff had come from — with customers transferred to the same underlying network for a seamless migration.</li>
</ul>', '- **Founder-fronted launch.** Co-founder Rameez Ansar personally fronted the Australian announcement, positioning the entry around research showing Australians were "unhappy" with their telcos — the same dissatisfaction wedge used in Singapore.
- **Local leadership from the local industry.** The launch was run under Australia GM Ben Murray (through December 2020); in June 2021 the company appointed Sydney-based Maik Retzlaff — a former amaysim director of business development and commercial director (2012–2019) — as its Australian lead, buying deep local MVNO experience.
- **The exit closed the loop.** In January 2025 the Australian customer base was acquired by amaysim — the Optus-network rival Retzlaff had come from — with customers transferred to the same underlying network for a seamless migration.', 6),
      ('success-factors', NULL::text, '<ul>
<li>Zero-capex network model made a $50M war chest go a long way</li>
<li>Preserved its playbook from Singapore: attack customer dissatisfaction with incumbents</li>
<li>Customer experience delivered on the promise — Canstar''s "Most Trusted" award (2023) and Finder''s "Best Postpaid Provider for Value" (2023)</li>
<li>Knew its endgame: when scale economics favoured consolidation, it sold the base to Amaysim and reframed the exit as proof of its build-operate-transfer model for telco software</li>
</ul>', '- Zero-capex network model made a \$50M war chest go a long way
- Preserved its playbook from Singapore: attack customer dissatisfaction with incumbents
- Customer experience delivered on the promise — Canstar''s "Most Trusted" award (2023) and Finder''s "Best Postpaid Provider for Value" (2023)
- Knew its endgame: when scale economics favoured consolidation, it sold the base to Amaysim and reframed the exit as proof of its build-operate-transfer model for telco software', 7),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>Launched 12 September 2019 with a 20GB $28/month headline plan</li>
<li>Over <strong>$50 million</strong> committed to the Australian launch</li>
<li>Canstar Most Trusted 2023; Finder Best Postpaid Provider for Value 2023</li>
<li>Customer base transferred to Amaysim, completing the entry-to-exit arc</li>
</ul>', '- Launched 12 September 2019 with a 20GB \$28/month headline plan
- Over **\$50 million** committed to the Australian launch
- Canstar Most Trusted 2023; Finder Best Postpaid Provider for Value 2023
- Customer base transferred to Amaysim, completing the entry-to-exit arc', 8),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>The MVNO model is the classic low-capex beachhead</strong> — rent infrastructure, own the customer relationship.</li>
<li><strong>A shocking launch offer can substitute for years of brand-building</strong> if the underlying product retains the customers it attracts.</li>
<li><strong>Digital-only operations can out-satisfy incumbents</strong>, not just undercut them.</li>
<li><strong>Exit can be strategy.</strong> A well-executed transfer of the customer base converted a sub-scale retail position into a credential for the company''s software business.</li>
</ol>', '1. **The MVNO model is the classic low-capex beachhead** — rent infrastructure, own the customer relationship.
2. **A shocking launch offer can substitute for years of brand-building** if the underlying product retains the customers it attracts.
3. **Digital-only operations can out-satisfy incumbents**, not just undercut them.
4. **Exit can be strategy.** A well-executed transfer of the customer base converted a sub-scale retail position into a credential for the company''s software business.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down' AND status = 'draft' AND content_type = 'case_study'), '<p>In February 2015, Japan Post Holdings agreed to buy Australia''s biggest logistics company, Toll Holdings, for <strong>A$6.5 billion</strong> — a <strong>49% premium</strong> to the last closing price, unanimously recommended by Toll''s board. Barely two years later, Japan Post wrote down the investment by <strong>A$4.9 billion</strong> and its leadership publicly expressed regret for a "rushed" takeover. It stands as one of the most value-destructive inbound acquisitions in Australian corporate history.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Japan Post Holdings</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Logistics and freight</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Acquisition — A$6.5B takeover of Toll Holdings</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — A$4.9B write-down within two years</td>
</tr>
</table>', 'In February 2015, Japan Post Holdings agreed to buy Australia''s biggest logistics company, Toll Holdings, for **A\$6.5 billion** — a **49% premium** to the last closing price, unanimously recommended by Toll''s board. Barely two years later, Japan Post wrote down the investment by **A\$4.9 billion** and its leadership publicly expressed regret for a "rushed" takeover. It stands as one of the most value-destructive inbound acquisitions in Australian corporate history.
<table header-column="true">
<tr>
<td>Company</td>
<td>Japan Post Holdings</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Logistics and freight</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Acquisition — A\$6.5B takeover of Toll Holdings</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — A\$4.9B write-down within two years</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('What Japan Post did', 'what-japan-post-did', 2),
      ('Deal mechanics & aftermath', 'deal-mechanics-and-aftermath', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Toll was an Australian success story: Paul Little bought a five-depot, 125-truck trucking firm for $1.5 million in 1986 and built it into Australia''s largest freight and logistics group through a long web of acquisitions. Japan Post, a state-owned financial and postal giant, was preparing for its stockmarket listing and wanted a global logistics growth story to sell to IPO investors. Toll — with operations spanning 55 countries — looked like a shortcut.</p>', 'Toll was an Australian success story: Paul Little bought a five-depot, 125-truck trucking firm for \$1.5 million in 1986 and built it into Australia''s largest freight and logistics group through a long web of acquisitions. Japan Post, a state-owned financial and postal giant, was preparing for its stockmarket listing and wanted a global logistics growth story to sell to IPO investors. Toll — with operations spanning 55 countries — looked like a shortcut.', 1),
      ('what-japan-post-did', 'Paid a knockout premium for speed', '<p>The 49% premium ended any auction before it began and secured a unanimous board recommendation — but priced Toll''s cyclical earnings at the top.</p>', 'The 49% premium ended any auction before it began and secured a unanimous board recommendation — but priced Toll''s cyclical earnings at the top.', 2),
      ('what-japan-post-did', 'Bought a deal to dress an IPO', '<p>The acquisition was announced months before Japan Post''s own listing, and the timetable drove the diligence, not the other way around. Its own IPO documents warned that managing Toll''s web of acquisitions could be difficult.</p>', 'The acquisition was announced months before Japan Post''s own listing, and the timetable drove the diligence, not the other way around. Its own IPO documents warned that managing Toll''s web of acquisitions could be difficult.', 3),
      ('what-japan-post-did', 'Left management in place, hands-off from Tokyo', '<p>Around 80 Toll managers became millionaires when their options vested. Oversight from Tokyo was light; costly decisions continued — including <strong>A$170 million</strong> spent on two new Tasmanian ships that were too long for Toll''s own dock.</p>', 'Around 80 Toll managers became millionaires when their options vested. Oversight from Tokyo was light; costly decisions continued — including **A\$170 million** spent on two new Tasmanian ships that were too long for Toll''s own dock.', 4),
      ('deal-mechanics-and-aftermath', NULL::text, '<ul>
<li><strong>Scheme, not hostile.</strong> The takeover was structured as a scheme of arrangement at A$9.04 per share plus a A$0.13 fully franked interim dividend — an implied enterprise value of about A$8.0 billion — with Toll chairman Ray Horsburgh hailing "one of the world''s top five logistics companies" and the board unanimous in support.</li>
<li><strong>Even the advisers were blindsided.</strong> Japan Post''s own IPO underwriters learned of the multi-billion-dollar deal only when it was announced — a measure of how compressed and secretive the process was.</li>
<li><strong>The unwinding.</strong> After the April 2017 write-down (about US$3.6 billion), Japan Post progressively shrank Toll, selling major divisions including its US warehousing and trucking operations.</li>
</ul>', '- **Scheme, not hostile.** The takeover was structured as a scheme of arrangement at A\$9.04 per share plus a A\$0.13 fully franked interim dividend — an implied enterprise value of about A\$8.0 billion — with Toll chairman Ray Horsburgh hailing "one of the world''s top five logistics companies" and the board unanimous in support.
- **Even the advisers were blindsided.** Japan Post''s own IPO underwriters learned of the multi-billion-dollar deal only when it was announced — a measure of how compressed and secretive the process was.
- **The unwinding.** After the April 2017 write-down (about US\$3.6 billion), Japan Post progressively shrank Toll, selling major divisions including its US warehousing and trucking operations.', 5),
      ('failure-factors', NULL::text, '<ul>
<li>Overpayment against peak-cycle earnings, exposed when resources-driven freight volumes fell</li>
<li>Toll''s high fixed cost base eroded profits as conditions tightened</li>
<li>Weak post-acquisition integration and governance — awareness of the earnings slide without effective intervention</li>
<li>Deal logic anchored to Japan Post''s IPO narrative rather than logistics fundamentals</li>
</ul>', '- Overpayment against peak-cycle earnings, exposed when resources-driven freight volumes fell
- Toll''s high fixed cost base eroded profits as conditions tightened
- Weak post-acquisition integration and governance — awareness of the earnings slide without effective intervention
- Deal logic anchored to Japan Post''s IPO narrative rather than logistics fundamentals', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li><strong>A$6.5 billion</strong> purchase price (February 2015), a 49% premium</li>
<li><strong>A$4.9 billion</strong> write-down announced April 2017</li>
<li>Japan Post publicly expressed "regret" for the rushed takeover</li>
<li>Toll was subsequently restructured, with major divestments in later years</li>
</ul>', '- **A\$6.5 billion** purchase price (February 2015), a 49% premium
- **A\$4.9 billion** write-down announced April 2017
- Japan Post publicly expressed "regret" for the rushed takeover
- Toll was subsequently restructured, with major divestments in later years', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Never let your own corporate timetable price someone else''s business.</strong> The IPO deadline, not Toll''s fundamentals, set the premium.</li>
<li><strong>Hands-off is not the same as respectful.</strong> Local autonomy without governance let known problems compound.</li>
<li><strong>A cyclical business bought at the top punishes twice</strong> — earnings fall and the write-down follows.</li>
<li><strong>Scale in a market is not capability in a market.</strong> Owning Australia''s biggest logistics firm did not make Japan Post a capable logistics operator in Australia.</li>
</ol>', '1. **Never let your own corporate timetable price someone else''s business.** The IPO deadline, not Toll''s fundamentals, set the premium.
2. **Hands-off is not the same as respectful.** Local autonomy without governance let known problems compound.
3. **A cyclical business bought at the top punishes twice** — earnings fall and the write-down follows.
4. **Scale in a market is not capability in a market.** Owning Australia''s biggest logistics firm did not make Japan Post a capable logistics operator in Australia.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-singtel-bought-optus-to-enter-australia-at-full-scale (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-singtel-bought-optus-to-enter-australia-at-full-scale' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-singtel-bought-optus-to-enter-australia-at-full-scale' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-singtel-bought-optus-to-enter-australia-at-full-scale' AND status = 'draft' AND content_type = 'case_study'), '<p>In March 2001, Singapore Telecommunications won the contest for Cable &amp; Wireless Optus with a <strong>S$13.6 billion</strong> offer — at the time the largest Asian corporate acquisition of an Australian company ever. The deal completed on <strong>23 October 2001</strong>, and a quarter of a century later Optus remains Australia''s clear number-two carrier and Singtel''s largest single asset.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Singtel (Singapore Telecommunications)</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore</td>
</tr>
<tr>
<td>Sector</td>
<td>Telecommunications</td>
</tr>
<tr>
<td>Entry year</td>
<td>2001</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Acquisition — 100% takeover of Cable & Wireless Optus</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Optus is still Australia''s #2 telco under Singtel ownership</td>
</tr>
</table>', 'In March 2001, Singapore Telecommunications won the contest for Cable & Wireless Optus with a **S\$13.6 billion** offer — at the time the largest Asian corporate acquisition of an Australian company ever. The deal completed on **23 October 2001**, and a quarter of a century later Optus remains Australia''s clear number-two carrier and Singtel''s largest single asset.
<table header-column="true">
<tr>
<td>Company</td>
<td>Singtel (Singapore Telecommunications)</td>
</tr>
<tr>
<td>Origin</td>
<td>Singapore</td>
</tr>
<tr>
<td>Sector</td>
<td>Telecommunications</td>
</tr>
<tr>
<td>Entry year</td>
<td>2001</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Acquisition — 100% takeover of Cable & Wireless Optus</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Optus is still Australia''s #2 telco under Singtel ownership</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-singtel-bought-optus-to-enter-australia-at-full-scale' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Deal mechanics & people', 'deal-mechanics-and-people', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Optus was founded in 1992 as Australia''s second full-service carrier, built to challenge Telstra''s monopoly. By 2001 it had 3.4 million mobile subscribers and was 52.5% owned by the UK''s Cable &amp; Wireless, which wanted out. Singtel, dominant in a small home market and flush with capital, was hunting for regional scale — and the Singapore government signalled it would loosen its grip on the company to support overseas expansion.</p>', 'Optus was founded in 1992 as Australia''s second full-service carrier, built to challenge Telstra''s monopoly. By 2001 it had 3.4 million mobile subscribers and was 52.5% owned by the UK''s Cable & Wireless, which wanted out. Singtel, dominant in a small home market and flush with capital, was hunting for regional scale — and the Singapore government signalled it would loosen its grip on the company to support overseas expansion.', 1),
      ('entry-strategy', 'Buy the established challenger, don''t build', '<p>Rather than bidding for spectrum and building a greenfield network, Singtel bought the #2 player outright — instantly acquiring licences, infrastructure, retail distribution and millions of customers.</p>', 'Rather than bidding for spectrum and building a greenfield network, Singtel bought the #2 player outright — instantly acquiring licences, infrastructure, retail distribution and millions of customers.', 2),
      ('entry-strategy', 'Keep the local brand', '<p>The company was renamed SingTel Optus, but the consumer-facing Optus brand was retained in full. Australian customers noticed almost no change of ownership.</p>', 'The company was renamed SingTel Optus, but the consumer-facing Optus brand was retained in full. Australian customers noticed almost no change of ownership.', 3),
      ('entry-strategy', 'List locally', '<p>Singtel floated on the Australian Securities Exchange in September 2001, giving Australian institutions a way to hold the stock and anchoring the company in the local capital market.</p>', 'Singtel floated on the Australian Securities Exchange in September 2001, giving Australian institutions a way to hold the stock and anchoring the company in the local capital market.', 4),
      ('entry-strategy', 'Ignore the sceptics', '<p>Analysts at the time argued Australia did little for Singtel''s pan-Asian ambitions — Singtel shares fell almost 9% on the news. Singtel bet instead on a durable, cash-generative #2 position in a rational two-and-a-half player market.</p>', 'Analysts at the time argued Australia did little for Singtel''s pan-Asian ambitions — Singtel shares fell almost 9% on the news. Singtel bet instead on a durable, cash-generative #2 position in a rational two-and-a-half player market.', 5),
      ('deal-mechanics-and-people', NULL::text, '<ul>
<li><strong>A two-horse race.</strong> Singtel beat Vodafone Pacific to the controlling stake held by the UK''s Cable &amp; Wireless, which had been openly seeking an exit.</li>
<li><strong>Flexible consideration to get the register over the line.</strong> The bid offered three alternatives — all-share (valuing Optus at A$4.57 per share, a 20.1% premium to the undisturbed price), share-plus-cash, and a share-cash-bond mix — letting different shareholder types choose their own exit.</li>
<li><strong>All the way to 100%.</strong> Rather than settling for control, Singtel completed compulsory acquisition of every outstanding share by 23 October 2001, taking full ownership and avoiding a minority-shareholder overhang.</li>
</ul>', '- **A two-horse race.** Singtel beat Vodafone Pacific to the controlling stake held by the UK''s Cable & Wireless, which had been openly seeking an exit.
- **Flexible consideration to get the register over the line.** The bid offered three alternatives — all-share (valuing Optus at A\$4.57 per share, a 20.1% premium to the undisturbed price), share-plus-cash, and a share-cash-bond mix — letting different shareholder types choose their own exit.
- **All the way to 100%.** Rather than settling for control, Singtel completed compulsory acquisition of every outstanding share by 23 October 2001, taking full ownership and avoiding a minority-shareholder overhang.', 6),
      ('success-factors', NULL::text, '<ul>
<li>Acquired a challenger with real network assets and brand equity, not a marginal player</li>
<li>Retained local brand, management and market positioning</li>
<li>Post-acquisition focus on integration synergies and cost discipline — operational EBITDA grew 23% in the first year</li>
<li>Patient ownership through market cycles rather than a quick flip</li>
</ul>', '- Acquired a challenger with real network assets and brand equity, not a marginal player
- Retained local brand, management and market positioning
- Post-acquisition focus on integration synergies and cost discipline — operational EBITDA grew 23% in the first year
- Patient ownership through market cycles rather than a quick flip', 7),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li><strong>S$13.6 billion</strong> acquisition completed October 2001</li>
<li>Optus Mobile revenue grew <strong>14%</strong> in the first year under Singtel</li>
<li>By December 2004, overseas operations accounted for <strong>75%</strong> of Singtel''s total revenue</li>
<li>Optus remains Australia''s second-largest telco today</li>
</ul>', '- **S\$13.6 billion** acquisition completed October 2001
- Optus Mobile revenue grew **14%** in the first year under Singtel
- By December 2004, overseas operations accounted for **75%** of Singtel''s total revenue
- Optus remains Australia''s second-largest telco today', 8),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Acquisition buys what greenfield can''t</strong> — licences, spectrum, distribution and a customer base arrive on day one.</li>
<li><strong>Keep the local brand if it has equity.</strong> Ownership changed; the Optus brand and its challenger identity did not.</li>
<li><strong>A strong #2 in a rational market is a prize</strong>, even when strategists say the geography is wrong.</li>
<li><strong>Local capital-market presence builds legitimacy</strong> with institutions, regulators and talent.</li>
</ol>', '1. **Acquisition buys what greenfield can''t** — licences, spectrum, distribution and a customer base arrive on day one.
2. **Keep the local brand if it has equity.** Ownership changed; the Optus brand and its challenger identity did not.
3. **A strong #2 in a rational market is a prize**, even when strategists say the geography is wrong.
4. **Local capital-market presence builds legitimacy** with institutions, regulators and talent.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-singtel-bought-optus-to-enter-australia-at-full-scale' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-singtel-bought-optus-to-enter-australia-at-full-scale' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-minor-international-bought-oaks-hotels-to-enter-australia-overnight (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight' AND status = 'draft' AND content_type = 'case_study'), '<p>In 2011, Bangkok-based Minor International pulled off one of the sharpest inbound plays in Australian hospitality: it took control of ASX-listed Oaks Hotels &amp; Resorts through a takeover valuing the company''s equity at roughly <strong>A$90 million</strong> — against the recommendation of the Oaks board. Under Thai ownership, Oaks has grown into a network of well over 50 Australian properties, and Minor is now bringing its global luxury flagship Anantara to Perth.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Minor International</td>
</tr>
<tr>
<td>Origin</td>
<td>Thailand</td>
</tr>
<tr>
<td>Sector</td>
<td>Hotels and hospitality</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Contested takeover of ASX-listed Oaks Hotels & Resorts</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Oaks expanded across Australia; Anantara luxury brand now entering</td>
</tr>
</table>', 'In 2011, Bangkok-based Minor International pulled off one of the sharpest inbound plays in Australian hospitality: it took control of ASX-listed Oaks Hotels & Resorts through a takeover valuing the company''s equity at roughly **A\$90 million** — against the recommendation of the Oaks board. Under Thai ownership, Oaks has grown into a network of well over 50 Australian properties, and Minor is now bringing its global luxury flagship Anantara to Perth.
<table header-column="true">
<tr>
<td>Company</td>
<td>Minor International</td>
</tr>
<tr>
<td>Origin</td>
<td>Thailand</td>
</tr>
<tr>
<td>Sector</td>
<td>Hotels and hospitality</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Contested takeover of ASX-listed Oaks Hotels & Resorts</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Oaks expanded across Australia; Anantara luxury brand now entering</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & platform', 'people-and-platform', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Oaks was founded in 1991 on Queensland''s Sunshine Coast and built a distinctive serviced-apartment model — managing apartment inventory owned by individual investors. By 2011 it operated 38 properties across Australia, New Zealand and Dubai, but shareholder distress had left a 34.4% block of the register in the hands of receivers. Minor International — owner of the Anantara luxury brand — had been looking for a platform in the Pacific.</p>', 'Oaks was founded in 1991 on Queensland''s Sunshine Coast and built a distinctive serviced-apartment model — managing apartment inventory owned by individual investors. By 2011 it operated 38 properties across Australia, New Zealand and Dubai, but shareholder distress had left a 34.4% block of the register in the hands of receivers. Minor International — owner of the Anantara luxury brand — had been looking for a platform in the Pacific.', 1),
      ('entry-strategy', 'Buy distress, not trophies', '<p>Minor started with a 19.96% stake for just <strong>A$12 million</strong> in March 2011, then acquired the 34.4% block held by PricewaterhouseCoopers as receivers — vaulting to 54.3% control before most of the market had reacted.</p>', 'Minor started with a 19.96% stake for just **A\$12 million** in March 2011, then acquired the 34.4% block held by PricewaterhouseCoopers as receivers — vaulting to 54.3% control before most of the market had reacted.', 2),
      ('entry-strategy', 'Persist through board opposition', '<p>Oaks'' directors formally urged shareholders to <strong>reject</strong> Minor''s A$0.52-per-share offer. Minor held its price, completed the takeover by late 2011, and moved to compulsory acquisition.</p>', 'Oaks'' directors formally urged shareholders to **reject** Minor''s A\$0.52-per-share offer. Minor held its price, completed the takeover by late 2011, and moved to compulsory acquisition.', 3),
      ('entry-strategy', 'Keep the local brand and let it run', '<p>Rather than rebadging, Minor kept the Oaks brand, management model and Australian identity — then funded expansion, including the <strong>A$57.1 million</strong> acquisition of Oaks Elan Darwin in 2015, its 52nd property and sixth state or territory.</p>', 'Rather than rebadging, Minor kept the Oaks brand, management model and Australian identity — then funded expansion, including the **A\$57.1 million** acquisition of Oaks Elan Darwin in 2015, its 52nd property and sixth state or territory.', 4),
      ('entry-strategy', 'Use the platform as a beachhead for the brand ladder', '<p>With Oaks as the operating base, Minor announced Anantara''s Australian debut — a 150-room Perth hotel anchoring the A$3.8 billion Burswood Point development, opening 2032.</p>', 'With Oaks as the operating base, Minor announced Anantara''s Australian debut — a 150-room Perth hotel anchoring the A\$3.8 billion Burswood Point development, opening 2032.', 5),
      ('people-and-platform', NULL::text, '<ul>
<li><strong>A founder-chairman''s long game.</strong> Minor International is the vehicle of American-born Thai billionaire William E. Heinecke, its founder and chairman; the Oaks bid ran through Minor''s Singapore subsidiary, Delicious Food Holding.</li>
<li><strong>Local leadership retained.</strong> Oaks founder and CEO Brett Pointon continued to lead the brand''s expansion after the takeover — fronting acquisitions such as Cypress Lakes Resort in the Hunter Valley (2013) as the network grew nationally.</li>
<li><strong>From platform to portfolio.</strong> Under Minor, Oaks added openings including Oaks Oasis on the Sunshine Coast (2011), Oaks Grand Gladstone (2014) and Oaks Elan Darwin (2015), and Minor later layered its global brands on top — NH Collection Sydney (announced 2023), a franchising push under a dedicated Director of Franchising, and Anantara Perth to come.</li>
</ul>', '- **A founder-chairman''s long game.** Minor International is the vehicle of American-born Thai billionaire William E. Heinecke, its founder and chairman; the Oaks bid ran through Minor''s Singapore subsidiary, Delicious Food Holding.
- **Local leadership retained.** Oaks founder and CEO Brett Pointon continued to lead the brand''s expansion after the takeover — fronting acquisitions such as Cypress Lakes Resort in the Hunter Valley (2013) as the network grew nationally.
- **From platform to portfolio.** Under Minor, Oaks added openings including Oaks Oasis on the Sunshine Coast (2011), Oaks Grand Gladstone (2014) and Oaks Elan Darwin (2015), and Minor later layered its global brands on top — NH Collection Sydney (announced 2023), a franchising push under a dedicated Director of Franchising, and Anantara Perth to come.', 6),
      ('success-factors', NULL::text, '<ul>
<li>Counter-cyclical timing: bought control from receivers at a distressed price</li>
<li>Conviction to proceed against a hostile board recommendation</li>
<li>Preserved the asset-light serviced-apartment model that made Oaks attractive</li>
<li>Long-horizon ownership building from mid-market to luxury</li>
</ul>', '- Counter-cyclical timing: bought control from receivers at a distressed price
- Conviction to proceed against a hostile board recommendation
- Preserved the asset-light serviced-apartment model that made Oaks attractive
- Long-horizon ownership building from mid-market to luxury', 7),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>Control acquired 2011 at about A$90 million equity valuation</li>
<li>Oaks grew from 38 properties (2011) to 68 hotels across 5 countries today</li>
<li>Anantara Perth announced for the A$3.8B Burswood Point precinct, opening 2032</li>
</ul>', '- Control acquired 2011 at about A\$90 million equity valuation
- Oaks grew from 38 properties (2011) to 68 hotels across 5 countries today
- Anantara Perth announced for the A\$3.8B Burswood Point precinct, opening 2032', 8),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Distressed share registers are entry discounts.</strong> The receivers'' block was the whole game.</li>
<li><strong>A board''s ''reject'' is a negotiating position, not a wall.</strong></li>
<li><strong>Keep the local brand where it carries the trust</strong> — and layer your global brands on top later.</li>
<li><strong>Mid-market platforms can carry luxury ambitions</strong> into a new market decades later.</li>
</ol>', '1. **Distressed share registers are entry discounts.** The receivers'' block was the whole game.
2. **A board''s ''reject'' is a negotiating position, not a wall.**
3. **Keep the local brand where it carries the trust** — and layer your global brands on top later.
4. **Mid-market platforms can carry luxury ambitions** into a new market decades later.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia' AND status = 'draft' AND content_type = 'case_study'), '<p>Kia''s Australian story is the longest of long games. The Korean carmaker entered in <strong>1988</strong> with the Rocsta and spent three decades as a budget also-ran — taking until <strong>2018</strong> to reach 500,000 cumulative sales. Then the flywheel caught: it sold its <strong>second half-million in just seven years</strong>, passing <strong>1 million cumulative Australian sales in 2025</strong> and establishing itself as one of the country''s top-selling brands.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Kia</td>
</tr>
<tr>
<td>Origin</td>
<td>South Korea</td>
</tr>
<tr>
<td>Sector</td>
<td>Automotive</td>
</tr>
<tr>
<td>Entry year</td>
<td>1988</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Vehicle imports, later a full local subsidiary</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 1 million cumulative sales (2025), top-tier brand, now defending against Chinese entrants</td>
</tr>
</table>', 'Kia''s Australian story is the longest of long games. The Korean carmaker entered in **1988** with the Rocsta and spent three decades as a budget also-ran — taking until **2018** to reach 500,000 cumulative sales. Then the flywheel caught: it sold its **second half-million in just seven years**, passing **1 million cumulative Australian sales in 2025** and establishing itself as one of the country''s top-selling brands.
<table header-column="true">
<tr>
<td>Company</td>
<td>Kia</td>
</tr>
<tr>
<td>Origin</td>
<td>South Korea</td>
</tr>
<tr>
<td>Sector</td>
<td>Automotive</td>
</tr>
<tr>
<td>Entry year</td>
<td>1988</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Vehicle imports, later a full local subsidiary</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 1 million cumulative sales (2025), top-tier brand, now defending against Chinese entrants</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry and growth strategy', 'entry-and-growth-strategy', 2),
      ('Success factors', 'success-factors', 3),
      ('Key metrics & performance', 'key-metrics-and-performance', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Like its early years in the US, Kia arrived in Australia as a low-cost value brand with a reputation for unremarkable quality. The transformation that followed mirrored the group''s global turnaround — design-led product, quality investment and aggressive warranty — but Australia added its own local ingredients.</p>', 'Like its early years in the US, Kia arrived in Australia as a low-cost value brand with a reputation for unremarkable quality. The transformation that followed mirrored the group''s global turnaround — design-led product, quality investment and aggressive warranty — but Australia added its own local ingredients.', 1),
      ('entry-and-growth-strategy', 'The 7-year warranty as a trust shortcut', '<p>Introduced on 1 October 2014, Kia''s seven-year unlimited-kilometre warranty was the longest new-car warranty in Australia at the time — bundled with seven years of capped-price servicing and roadside assistance. It converted sceptical buyers by pricing the company''s own confidence into the product; more than 366,000 Australians bought a new Kia under the programme in its first seven years, and Kia''s sales trajectory visibly steepened from its introduction.</p>', 'Introduced on 1 October 2014, Kia''s seven-year unlimited-kilometre warranty was the longest new-car warranty in Australia at the time — bundled with seven years of capped-price servicing and roadside assistance. It converted sceptical buyers by pricing the company''s own confidence into the product; more than 366,000 Australians bought a new Kia under the programme in its first seven years, and Kia''s sales trajectory visibly steepened from its introduction.', 2),
      ('entry-and-growth-strategy', 'Local ride and handling tuning', '<p>Kia Australia runs a dedicated local suspension tuning programme led by its Chief Ride and Handling Engineer, Graeme Gambold, re-engineering spring, damper and steering settings for Australian roads on locally sold models. It became a signature differentiator in Australian motoring reviews.</p>', 'Kia Australia runs a dedicated local suspension tuning programme led by its Chief Ride and Handling Engineer, Graeme Gambold, re-engineering spring, damper and steering settings for Australian roads on locally sold models. It became a signature differentiator in Australian motoring reviews.', 3),
      ('entry-and-growth-strategy', 'Market-specific product', '<p>The Tasman ute — launched mid-2025 with Australia as a lead market — was Kia''s first serious swing at the ute segment, which accounts for about 20% of national new-vehicle sales.</p>', 'The Tasman ute — launched mid-2025 with Australia as a lead market — was Kia''s first serious swing at the ute segment, which accounts for about 20% of national new-vehicle sales.', 4),
      ('entry-and-growth-strategy', 'Mainstream visibility through sport', '<p>Long-running major sponsorships — most famously as major partner of the Australian Open tennis since 2002 — kept the brand in front of mainstream Australia for decades, normalising Kia as a household name rather than an import curiosity.</p>', 'Long-running major sponsorships — most famously as major partner of the Australian Open tennis since 2002 — kept the brand in front of mainstream Australia for decades, normalising Kia as a household name rather than an import curiosity.', 5),
      ('success-factors', NULL::text, '<ul>
<li>Patience: brand repair measured in decades, not campaign cycles</li>
<li>Product quality caught up to, then supported, the marketing promise</li>
<li>Local engineering investment signalled genuine commitment</li>
<li>Warranty leadership reframed the value conversation away from price alone</li>
</ul>', '- Patience: brand repair measured in decades, not campaign cycles
- Product quality caught up to, then supported, the marketing promise
- Local engineering investment signalled genuine commitment
- Warranty leadership reframed the value conversation away from price alone', 6),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>500,000 cumulative sales by 2018 (30 years); 1,000,000 by 2025 (7 more years)</li>
<li>Consistently among Australia''s top-selling brands in recent years</li>
<li>Headwinds emerging: Australian earnings fell 37% in 2025 amid intense competition from Chinese brands, and the Tasman''s launch campaign underperformed expectations</li>
</ul>', '- 500,000 cumulative sales by 2018 (30 years); 1,000,000 by 2025 (7 more years)
- Consistently among Australia''s top-selling brands in recent years
- Headwinds emerging: Australian earnings fell 37% in 2025 amid intense competition from Chinese brands, and the Tasman''s launch campaign underperformed expectations', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Warranty is a challenger''s trust weapon.</strong> It converts quality claims into contractual promises.</li>
<li><strong>Visible local engineering buys credibility</strong> that no advertising spend can.</li>
<li><strong>Brand turnarounds compound slowly, then suddenly</strong> — 30 years to the first half-million, 7 to the second.</li>
<li><strong>No position is permanent.</strong> The value territory Kia conquered is exactly where Chinese entrants are now attacking.</li>
</ol>', '1. **Warranty is a challenger''s trust weapon.** It converts quality claims into contractual promises.
2. **Visible local engineering buys credibility** that no advertising spend can.
3. **Brand turnarounds compound slowly, then suddenly** — 30 years to the first half-million, 7 to the second.
4. **No position is permanent.** The value territory Kia conquered is exactly where Chinese entrants are now attacking.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-daiso-translated-japans-fixed-price-retail-model-for-australia (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-daiso-translated-japans-fixed-price-retail-model-for-australia' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-daiso-translated-japans-fixed-price-retail-model-for-australia' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-daiso-translated-japans-fixed-price-retail-model-for-australia' AND status = 'draft' AND content_type = 'case_study'), '<p>In 2010, Japan''s Daiso — the company that built a retail empire on the 100-yen price point — opened its first Australian store in Richmond, Melbourne. The format captured Australian shoppers almost immediately: the network grew to as many as <strong>46 stores across five states</strong>, and Daiso remains a fixture of Australian shopping centres today with stores in <strong>six states and the ACT</strong>.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Daiso Industries</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Value / variety retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2010</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Retail store rollout, first store in Richmond, Victoria</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — enduring national footprint across six states and the ACT</td>
</tr>
</table>', 'In 2010, Japan''s Daiso — the company that built a retail empire on the 100-yen price point — opened its first Australian store in Richmond, Melbourne. The format captured Australian shoppers almost immediately: the network grew to as many as **46 stores across five states**, and Daiso remains a fixture of Australian shopping centres today with stores in **six states and the ACT**.
<table header-column="true">
<tr>
<td>Company</td>
<td>Daiso Industries</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Value / variety retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2010</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Retail store rollout, first store in Richmond, Victoria</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — enduring national footprint across six states and the ACT</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-daiso-translated-japans-fixed-price-retail-model-for-australia' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Local structure & footprint', 'local-structure-and-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Daiso traces back to 1972, when founder Hirotake Yano began street-vending household goods, formalising the company in 1977. Its 100-yen shops — everything in the store at one low fixed price — grew to more than 65% of Japan''s domestic market in the category and thousands of stores across 25 countries and regions. Australia, with high retail prices and an appetite for Japanese design, was fertile ground.</p>', 'Daiso traces back to 1972, when founder Hirotake Yano began street-vending household goods, formalising the company in 1977. Its 100-yen shops — everything in the store at one low fixed price — grew to more than 65% of Japan''s domestic market in the category and thousands of stores across 25 countries and regions. Australia, with high retail prices and an appetite for Japanese design, was fertile ground.', 1),
      ('entry-strategy', 'Transplant the fixed-price format', '<p>Daiso brought its defining mechanic — a single low price across (almost) the whole store — to a market where variety retail was dominated by discount chains with cluttered, inconsistent pricing. The simplicity itself was the marketing.</p>', 'Daiso brought its defining mechanic — a single low price across (almost) the whole store — to a market where variety retail was dominated by discount chains with cluttered, inconsistent pricing. The simplicity itself was the marketing.', 2),
      ('entry-strategy', 'Treasure-hunt merchandising', '<p>Thousands of Japanese-designed SKUs across kitchenware, stationery, storage, beauty and snacks, refreshed constantly. The browse-and-discover experience drove repeat visits that conventional discounters couldn''t match.</p>', 'Thousands of Japanese-designed SKUs across kitchenware, stationery, storage, beauty and snacks, refreshed constantly. The browse-and-discover experience drove repeat visits that conventional discounters couldn''t match.', 3),
      ('entry-strategy', 'Quality-for-price positioning', '<p>Daiso''s products carried Japanese design and quality cues at a price point shoppers associated with far inferior goods — a differentiation no local competitor could easily copy.</p>', 'Daiso''s products carried Japanese design and quality cues at a price point shoppers associated with far inferior goods — a differentiation no local competitor could easily copy.', 4),
      ('entry-strategy', 'Shopping-centre clustering', '<p>Stores rolled out through major centres state by state, concentrating in Victoria, NSW and Queensland before extending to smaller markets.</p>', 'Stores rolled out through major centres state by state, concentrating in Victoria, NSW and Queensland before extending to smaller markets.', 5),
      ('local-structure-and-footprint', NULL::text, '<ul>
<li><strong>A wholly owned local subsidiary.</strong> The Australian business is run by Daiso Industries (Australia) Pty Ltd rather than a franchise partner — keeping format, merchandising and pricing control in-house.</li>
<li><strong>The A$2.80 price point.</strong> Daiso translated the 100-yen mechanic into a flat A$2.80 per item in its early Australian years; by late 2013 demand was strong enough that it planned 20 new stores for the following year.</li>
<li><strong>Today''s network.</strong> As of 2026: 32 stores across six states and the ACT — 11 in NSW, 8 in Queensland, 8 in Victoria, 3 in WA, 1 in SA and 1 in the ACT — after rationalising from the mid-40s peak.</li>
<li><strong>The second brand has landed.</strong> Daiso''s design-led sister chain Standard Products opened in Sydney and then Melbourne''s Midtown Plaza (November 2025), including dual-brand stores — a second format riding the infrastructure the first one built.</li>
</ul>', '- **A wholly owned local subsidiary.** The Australian business is run by Daiso Industries (Australia) Pty Ltd rather than a franchise partner — keeping format, merchandising and pricing control in-house.
- **The A\$2.80 price point.** Daiso translated the 100-yen mechanic into a flat A\$2.80 per item in its early Australian years; by late 2013 demand was strong enough that it planned 20 new stores for the following year.
- **Today''s network.** As of 2026: 32 stores across six states and the ACT — 11 in NSW, 8 in Queensland, 8 in Victoria, 3 in WA, 1 in SA and 1 in the ACT — after rationalising from the mid-40s peak.
- **The second brand has landed.** Daiso''s design-led sister chain Standard Products opened in Sydney and then Melbourne''s Midtown Plaza (November 2025), including dual-brand stores — a second format riding the infrastructure the first one built.', 6),
      ('success-factors', NULL::text, '<ul>
<li>A genuinely differentiated format rather than a me-too discounter</li>
<li>Product range with cultural novelty and consistent quality</li>
<li>Fixed pricing simplified operations, marketing and the customer decision</li>
<li>Measured expansion paced to demand — including later rationalisation of the network</li>
</ul>', '- A genuinely differentiated format rather than a me-too discounter
- Product range with cultural novelty and consistent quality
- Fixed pricing simplified operations, marketing and the customer decision
- Measured expansion paced to demand — including later rationalisation of the network', 7),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>First Australian store opened 2010 in Richmond, Victoria</li>
<li>Grew to as many as <strong>46 stores across five states</strong></li>
<li>Network today spans <strong>six states and the ACT</strong></li>
<li>Globally: 5,500+ stores across 25 countries and regions</li>
</ul>', '- First Australian store opened 2010 in Richmond, Victoria
- Grew to as many as **46 stores across five states**
- Network today spans **six states and the ACT**
- Globally: 5,500+ stores across 25 countries and regions', 8),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>A format can be the moat.</strong> Daiso exported a retail mechanic, not just products.</li>
<li><strong>Cultural novelty plus consistent quality beats price alone</strong> in value retail.</li>
<li><strong>Simplicity scales.</strong> One price point simplifies everything from supply chain to store labour.</li>
<li><strong>Right-sizing is not retreat.</strong> Trimming the network after rapid growth kept the business sustainable.</li>
</ol>', '1. **A format can be the moat.** Daiso exported a retail mechanic, not just products.
2. **Cultural novelty plus consistent quality beats price alone** in value retail.
3. **Simplicity scales.** One price point simplifies everything from supply chain to store labour.
4. **Right-sizing is not retreat.** Trimming the network after rapid growth kept the business sustainable.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-daiso-translated-japans-fixed-price-retail-model-for-australia' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-daiso-translated-japans-fixed-price-retail-model-for-australia' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-hellofresh-built-australias-meal-kit-category-from-scratch (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-hellofresh-built-australias-meal-kit-category-from-scratch' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-hellofresh-built-australias-meal-kit-category-from-scratch' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-hellofresh-built-australias-meal-kit-category-from-scratch' AND status = 'draft' AND content_type = 'case_study'), '<p>HelloFresh was barely a year old when it landed in Australia in 2012 — one of four international markets it entered in a single expansion wave — and it went on to make the country part of a global meal-kit business commanding roughly 75% of the category worldwide.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>HelloFresh</td>
</tr>
<tr>
<td>Origin</td>
<td>Germany (Berlin, founded 2011)</td>
</tr>
<tr>
<td>Sector</td>
<td>Meal-kit subscription e-commerce</td>
</tr>
<tr>
<td>Entry year</td>
<td>2012 (alongside the Netherlands, UK and Austria)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch — rapid multi-market replication of the home playbook</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — category leadership in Australia within a globally dominant business</td>
</tr>
</table>', 'HelloFresh was barely a year old when it landed in Australia in 2012 — one of four international markets it entered in a single expansion wave — and it went on to make the country part of a global meal-kit business commanding roughly 75% of the category worldwide.
<table header-column="true">
<tr>
<td>Company</td>
<td>HelloFresh</td>
</tr>
<tr>
<td>Origin</td>
<td>Germany (Berlin, founded 2011)</td>
</tr>
<tr>
<td>Sector</td>
<td>Meal-kit subscription e-commerce</td>
</tr>
<tr>
<td>Entry year</td>
<td>2012 (alongside the Netherlands, UK and Austria)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch — rapid multi-market replication of the home playbook</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — category leadership in Australia within a globally dominant business</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-hellofresh-built-australias-meal-kit-category-from-scratch' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & local build-out', 'team-and-local-build-out', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Founded in Berlin in 2011 by a trio hand-packing ten grocery bags for friends, HelloFresh bet that time-poor households would subscribe to pre-portioned ingredients and recipes rather than plan and shop themselves. It was one of the first companies of its kind — which made speed, not perfection, the core of its international strategy.</p>', 'Founded in Berlin in 2011 by a trio hand-packing ten grocery bags for friends, HelloFresh bet that time-poor households would subscribe to pre-portioned ingredients and recipes rather than plan and shop themselves. It was one of the first companies of its kind — which made speed, not perfection, the core of its international strategy.', 1),
      ('entry-strategy', 'Expand before competitors exist', '<p>HelloFresh entered Australia in 2012, only a year after founding, deliberately arriving before a strong local incumbent could emerge. Its stated approach across markets was rapid expansion combined with high marketing expenditure to fend off local competitors — in Australia most notably fellow German-born rival Marley Spoon.</p>', 'HelloFresh entered Australia in 2012, only a year after founding, deliberately arriving before a strong local incumbent could emerge. Its stated approach across markets was rapid expansion combined with high marketing expenditure to fend off local competitors — in Australia most notably fellow German-born rival Marley Spoon.', 2),
      ('entry-strategy', 'Replicate a data-driven playbook', '<p>Rather than reinventing the model per market, HelloFresh transplanted the same subscription mechanics, menu engineering and performance-marketing engine it was refining in Europe, backed by data-driven scaling that eventually reached 18 countries.</p>', 'Rather than reinventing the model per market, HelloFresh transplanted the same subscription mechanics, menu engineering and performance-marketing engine it was refining in Europe, backed by data-driven scaling that eventually reached 18 countries.', 3),
      ('entry-strategy', 'Outspend to defend', '<p>High customer-acquisition spend is usually a weakness; HelloFresh made it a moat. Sustained marketing pressure kept its brand synonymous with the category while smaller local rivals struggled to match burn.</p>', 'High customer-acquisition spend is usually a weakness; HelloFresh made it a moat. Sustained marketing pressure kept its brand synonymous with the category while smaller local rivals struggled to match burn.', 4),
      ('entry-strategy', 'Deepen monetisation once entrenched', '<p>With leadership secured, growth shifted to the group''s three levers: deeper penetration of existing markets, expanding the brand portfolio, and monetising the base with new categories and meal occasions.</p>', 'With leadership secured, growth shifted to the group''s three levers: deeper penetration of existing markets, expanding the brand portfolio, and monetising the base with new categories and meal occasions.', 5),
      ('team-and-local-build-out', NULL::text, '<ul>
<li><strong>A local founder-operator, not an expat rotation.</strong> The Australian business was launched and is still led by Tom Rutledge — a Sydney University economics graduate and former MasterChef contestant — who built HelloFresh ANZ from scratch and carries the title Founder &amp; CEO, HelloFresh Australia &amp; New Zealand. A decade-plus of leadership continuity is rare among the inbound entrants in this library.</li>
<li><strong>Sydney as the ANZ hub.</strong> Australia is run from Sydney, and the New Zealand launch was executed from the Australian base under Rutledge rather than as a separate entry.</li>
<li><strong>Local M&amp;A to deepen the moat.</strong> In 2021 HelloFresh agreed to acquire Brisbane-based ready-meal maker Youfoodz for A$125 million (about US$93 million) — buying Australian manufacturing capability, a known local brand and a second product line (prepared meals) to serve more meal occasions.</li>
</ul>', '- **A local founder-operator, not an expat rotation.** The Australian business was launched and is still led by Tom Rutledge — a Sydney University economics graduate and former MasterChef contestant — who built HelloFresh ANZ from scratch and carries the title Founder & CEO, HelloFresh Australia & New Zealand. A decade-plus of leadership continuity is rare among the inbound entrants in this library.
- **Sydney as the ANZ hub.** Australia is run from Sydney, and the New Zealand launch was executed from the Australian base under Rutledge rather than as a separate entry.
- **Local M&A to deepen the moat.** In 2021 HelloFresh agreed to acquire Brisbane-based ready-meal maker Youfoodz for A\$125 million (about US\$93 million) — buying Australian manufacturing capability, a known local brand and a second product line (prepared meals) to serve more meal occasions.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>First-mover speed</strong> — arriving in year one meant Australia never had an entrenched local leader to displace.</li>
<li><strong>A repeatable playbook</strong> transplanted with minimal localisation cost.</li>
<li><strong>Marketing spend as a competitive weapon</strong>, sustained until rivals capitulated.</li>
<li><strong>Operational rigour</strong> — the only meal-kit player to reach profitability at scale globally.</li>
</ul>', '- **First-mover speed** — arriving in year one meant Australia never had an entrenched local leader to displace.
- **A repeatable playbook** transplanted with minimal localisation cost.
- **Marketing spend as a competitive weapon**, sustained until rivals capitulated.
- **Operational rigour** — the only meal-kit player to reach profitability at scale globally.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>Entered Australia in 2012, one year after founding</li>
<li>~75% share of the global meal-kit market at peak dominance</li>
<li>Operations across 18 countries</li>
<li>Consistently ranked one of the two dominant meal-kit brands in Australian category reviews</li>
</ul>', '- Entered Australia in 2012, one year after founding
- \~75% share of the global meal-kit market at peak dominance
- Operations across 18 countries
- Consistently ranked one of the two dominant meal-kit brands in Australian category reviews', 8),
      ('lessons', NULL::text, '<ol>
<li>In new categories, the entry window matters more than entry polish — land before a local champion exists.</li>
<li>A proven home-market playbook can be exported almost unchanged when the consumer problem is universal.</li>
<li>Marketing spend can function as a barrier to entry if sustained longer than competitors can fund.</li>
<li>Win the land-grab first; monetise the base second.</li>
</ol>', '1. In new categories, the entry window matters more than entry polish — land before a local champion exists.
2. A proven home-market playbook can be exported almost unchanged when the consumer problem is universal.
3. Marketing spend can function as a barrier to entry if sustained longer than competitors can fund.
4. Win the land-grab first; monetise the base second.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-hellofresh-built-australias-meal-kit-category-from-scratch' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-hellofresh-built-australias-meal-kit-category-from-scratch' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-doordash-made-a-late-entry-work-in-australian-food-delivery (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-doordash-made-a-late-entry-work-in-australian-food-delivery' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-doordash-made-a-late-entry-work-in-australian-food-delivery' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-doordash-made-a-late-entry-work-in-australian-food-delivery' AND status = 'draft' AND content_type = 'case_study'), '<p>When DoorDash switched on in Melbourne on 4 September 2019, it was the company''s first launch outside North America after six years at home — and it arrived with thousands of restaurants already signed and a $30 delivery guarantee designed to make Melburnians try it once.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>DoorDash</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (San Francisco)</td>
</tr>
<tr>
<td>Sector</td>
<td>On-demand food delivery</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (Melbourne — first market outside North America)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch with local HQ and pre-signed restaurant partnerships</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — outlasted Foodora, Deliveroo and Menulog to become Uber Eats'' main challenger</td>
</tr>
</table>', 'When DoorDash switched on in Melbourne on 4 September 2019, it was the company''s first launch outside North America after six years at home — and it arrived with thousands of restaurants already signed and a \$30 delivery guarantee designed to make Melburnians try it once.
<table header-column="true">
<tr>
<td>Company</td>
<td>DoorDash</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (San Francisco)</td>
</tr>
<tr>
<td>Sector</td>
<td>On-demand food delivery</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (Melbourne — first market outside North America)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch with local HQ and pre-signed restaurant partnerships</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — outlasted Foodora, Deliveroo and Menulog to become Uber Eats'' main challenger</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-doordash-made-a-late-entry-work-in-australian-food-delivery' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & scale-up', 'team-and-scale-up', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>By 2019 DoorDash had become the largest on-demand food delivery platform in the US, but it had never operated outside North America. Australia''s delivery market was already crowded — Uber Eats, Deliveroo and Menulog were entrenched, and Foodora had exited the year before amid gig-economy legal battles. DoorDash chose Melbourne, "the most livable city in the world", as its first offshore beachhead, drawn by the density and diversity of its food scene.</p>', 'By 2019 DoorDash had become the largest on-demand food delivery platform in the US, but it had never operated outside North America. Australia''s delivery market was already crowded — Uber Eats, Deliveroo and Menulog were entrenched, and Foodora had exited the year before amid gig-economy legal battles. DoorDash chose Melbourne, "the most livable city in the world", as its first offshore beachhead, drawn by the density and diversity of its food scene.', 1),
      ('entry-strategy', 'Launch with supply already on the shelf', '<p>Rather than launching thin, DoorDash signed thousands of Melbourne restaurants before day one — national chains like Nando''s, Salsa''s, Boost Juice and Betty''s Burgers alongside local favourites — so the app felt full from the first open.</p>', 'Rather than launching thin, DoorDash signed thousands of Melbourne restaurants before day one — national chains like Nando''s, Salsa''s, Boost Juice and Betty''s Burgers alongside local favourites — so the app felt full from the first open.', 2),
      ('entry-strategy', 'Buy trial with aggressive launch promotions', '<p>The launch offer was free delivery on all orders over $10 for the first 30 days, plus a "30 or $30" promotion guaranteeing delivery within 30 minutes or a $30 credit — a direct attack on the incumbents'' weakest point, delivery reliability.</p>', 'The launch offer was free delivery on all orders over \$10 for the first 30 days, plus a "30 or \$30" promotion guaranteeing delivery within 30 minutes or a \$30 credit — a direct attack on the incumbents'' weakest point, delivery reliability.', 3),
      ('entry-strategy', 'Commit locally, not remotely', '<p>DoorDash established its Australian head office in Melbourne with around 50 direct jobs, courted by Invest Victoria, and framed the entry around supporting local restaurant operations rather than just aggregating them. It flagged expansion through Melbourne''s suburbs, surrounding regional cities and "Australia broadly" through 2019–2020.</p>', 'DoorDash established its Australian head office in Melbourne with around 50 direct jobs, courted by Invest Victoria, and framed the entry around supporting local restaurant operations rather than just aggregating them. It flagged expansion through Melbourne''s suburbs, surrounding regional cities and "Australia broadly" through 2019–2020.', 4),
      ('entry-strategy', 'Outlast the shakeout', '<p>DoorDash entered late and priced patiently while competitors fell: Foodora (2018), Deliveroo (2022) and eventually Menulog all exited, leaving DoorDash as the main medium-term threat to Uber Eats — later differentiating through unique partnerships such as its tie-up with Aldi.</p>', 'DoorDash entered late and priced patiently while competitors fell: Foodora (2018), Deliveroo (2022) and eventually Menulog all exited, leaving DoorDash as the main medium-term threat to Uber Eats — later differentiating through unique partnerships such as its tie-up with Aldi.', 5),
      ('team-and-scale-up', NULL::text, '<ul>
<li><strong>A local GM at launch, an agency for the noise.</strong> The Melbourne launch was fronted by DoorDash Australia general manager Thomas Stephens, with PR, social and influencer work run by Australian agency Haystac (BWM Dentsu) — DoorDash''s first brand launch outside North America.</li>
<li><strong>The founding GM built a $1B business.</strong> Rebecca Burrows, DoorDash Australia''s founding general manager, scaled the business from a team of about 15 to 220 employees and beyond $1 billion in topline revenue, reaching profitability ahead of schedule — launching Australia''s first third-party grocery delivery, the DashPass subscription and a white-label delivery offering, plus the New Zealand expansion.</li>
<li><strong>Local leaders got exported.</strong> Burrows relocated to San Francisco in 2022 to run DoorDash''s international operations across Canada, Australia and New Zealand — succeeded locally by Melbourne-based GM Puji Fernando (2022–2024). Australia became a leadership farm, not just a market.</li>
</ul>', '- **A local GM at launch, an agency for the noise.** The Melbourne launch was fronted by DoorDash Australia general manager Thomas Stephens, with PR, social and influencer work run by Australian agency Haystac (BWM Dentsu) — DoorDash''s first brand launch outside North America.
- **The founding GM built a \$1B business.** Rebecca Burrows, DoorDash Australia''s founding general manager, scaled the business from a team of about 15 to 220 employees and beyond \$1 billion in topline revenue, reaching profitability ahead of schedule — launching Australia''s first third-party grocery delivery, the DashPass subscription and a white-label delivery offering, plus the New Zealand expansion.
- **Local leaders got exported.** Burrows relocated to San Francisco in 2022 to run DoorDash''s international operations across Canada, Australia and New Zealand — succeeded locally by Melbourne-based GM Puji Fernando (2022–2024). Australia became a leadership farm, not just a market.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Full marketplace at launch</strong> — pre-signed chains meant no empty-app problem.</li>
<li><strong>Promotions targeted at switching behaviour</strong>, not just awareness.</li>
<li><strong>A real local HQ</strong> gave credibility with restaurants, regulators and government.</li>
<li><strong>Late-mover discipline</strong> — let better-funded rivals exhaust themselves, then consolidated share as they exited.</li>
</ul>', '- **Full marketplace at launch** — pre-signed chains meant no empty-app problem.
- **Promotions targeted at switching behaviour**, not just awareness.
- **A real local HQ** gave credibility with restaurants, regulators and government.
- **Late-mover discipline** — let better-funded rivals exhaust themselves, then consolidated share as they exited.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>First market outside North America (September 2019)</li>
<li>~50 direct jobs created at the Melbourne head office at launch</li>
<li>Thousands of restaurants live on the platform from day one</li>
<li>One of only two major platforms still standing as Menulog wound down</li>
</ul>', '- First market outside North America (September 2019)
- \~50 direct jobs created at the Melbourne head office at launch
- Thousands of restaurants live on the platform from day one
- One of only two major platforms still standing as Menulog wound down', 8),
      ('lessons', NULL::text, '<ol>
<li>Enter a saturated market only with a sharp, operational point of difference — DoorDash chose delivery-time reliability.</li>
<li>Pre-signing supply before launch beats spending the same money on ads after launch.</li>
<li>A local HQ and government relationship (Invest Victoria) smooths entry into a market wary of gig-economy operators.</li>
<li>In shakeout markets, survival is a strategy: the last well-capitalised challenger inherits the exiters'' share.</li>
</ol>', '1. Enter a saturated market only with a sharp, operational point of difference — DoorDash chose delivery-time reliability.
2. Pre-signing supply before launch beats spending the same money on ads after launch.
3. A local HQ and government relationship (Invest Victoria) smooths entry into a market wary of gig-economy operators.
4. In shakeout markets, survival is a strategy: the last well-capitalised challenger inherits the exiters'' share.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-doordash-made-a-late-entry-work-in-australian-food-delivery' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-doordash-made-a-late-entry-work-in-australian-food-delivery' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-didi-tested-geelong-before-undercutting-uber-across-australia (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-didi-tested-geelong-before-undercutting-uber-across-australia' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-didi-tested-geelong-before-undercutting-uber-across-australia' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-didi-tested-geelong-before-undercutting-uber-across-australia' AND status = 'draft' AND content_type = 'case_study'), '<p>When the world''s most valuable startup wanted to prove it could compete in a Western market, it didn''t pick London or Los Angeles — it picked Geelong. DiDi Chuxing ran a month-long trial in the Victorian regional city before launching DiDi Express in Melbourne on 25 June 2018, its first foray into a Western-style market.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>DiDi (Didi Chuxing)</td>
</tr>
<tr>
<td>Origin</td>
<td>China (Beijing, founded 2012)</td>
</tr>
<tr>
<td>Sector</td>
<td>Ride-hailing</td>
</tr>
<tr>
<td>Entry year</td>
<td>2018 (Geelong trial, then Melbourne)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch — regional test market before a major-city rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — still operating across Australia and New Zealand</td>
</tr>
</table>', 'When the world''s most valuable startup wanted to prove it could compete in a Western market, it didn''t pick London or Los Angeles — it picked Geelong. DiDi Chuxing ran a month-long trial in the Victorian regional city before launching DiDi Express in Melbourne on 25 June 2018, its first foray into a Western-style market.
<table header-column="true">
<tr>
<td>Company</td>
<td>DiDi (Didi Chuxing)</td>
</tr>
<tr>
<td>Origin</td>
<td>China (Beijing, founded 2012)</td>
</tr>
<tr>
<td>Sector</td>
<td>Ride-hailing</td>
</tr>
<tr>
<td>Entry year</td>
<td>2018 (Geelong trial, then Melbourne)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic launch — regional test market before a major-city rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — still operating across Australia and New Zealand</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-didi-tested-geelong-before-undercutting-uber-across-australia' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Rollout & local team', 'rollout-and-local-team', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>DiDi was the world''s largest ride-hailing app and, at roughly US$56 billion, the world''s most valuable startup at the time of its Australian entry. It was best known for defeating Uber in China — buying Uber''s mainland operations in 2016 in exchange for a stake. Having begun international expansion in Toluca, Mexico earlier in 2018, DiDi declared globalisation a core strategy. Australia would be its test of whether the model travelled to Western-style markets that skew toward US brands — and it meant a direct rematch with Uber, plus recent entrants Ola and Taxify.</p>', 'DiDi was the world''s largest ride-hailing app and, at roughly US\$56 billion, the world''s most valuable startup at the time of its Australian entry. It was best known for defeating Uber in China — buying Uber''s mainland operations in 2016 in exchange for a stake. Having begun international expansion in Toluca, Mexico earlier in 2018, DiDi declared globalisation a core strategy. Australia would be its test of whether the model travelled to Western-style markets that skew toward US brands — and it meant a direct rematch with Uber, plus recent entrants Ola and Taxify.', 1),
      ('entry-strategy', 'Test in a small market first', '<p>Before touching Melbourne, DiDi ran a month-long trial in nearby Geelong — large enough to generate real data on drivers, riders and pricing, small enough to contain mistakes and stay under competitors'' radar.</p>', 'Before touching Melbourne, DiDi ran a month-long trial in nearby Geelong — large enough to generate real data on drivers, riders and pricing, small enough to contain mistakes and stay under competitors'' radar.', 2),
      ('entry-strategy', 'Pick the second city, not the first', '<p>Melbourne — Australia''s second-biggest city and its most contested rideshare market — became the launch pad on 25 June 2018, chosen deliberately as DiDi''s first Western battleground against Uber, Ola and Taxify.</p>', 'Melbourne — Australia''s second-biggest city and its most contested rideshare market — became the launch pad on 25 June 2018, chosen deliberately as DiDi''s first Western battleground against Uber, Ola and Taxify.', 3),
      ('entry-strategy', 'Compete on price in a commodity market', '<p>DiDi positioned Express as the affordable option in a market where riders multi-home across apps, using its scale economics to sustain lower fares while smaller challengers burned out.</p>', 'DiDi positioned Express as the affordable option in a market where riders multi-home across apps, using its scale economics to sustain lower fares while smaller challengers burned out.', 4),
      ('entry-strategy', 'Expand methodically', '<p>From the Melbourne beachhead, DiDi extended city by city across Australia and into New Zealand, both of which remain on its active market list today — outlasting Ola and Bolt/Taxify, which had entered around the same time and exited by 2020–2024.</p>', 'From the Melbourne beachhead, DiDi extended city by city across Australia and into New Zealand, both of which remain on its active market list today — outlasting Ola and Bolt/Taxify, which had entered around the same time and exited by 2020–2024.', 5),
      ('rollout-and-local-team', NULL::text, '<ul>
<li><strong>Melbourne HQ, government affairs from the start.</strong> DiDi Australia is headquartered in Melbourne, and the company stood up a dedicated ANZ communications and government-affairs function within its first year — an acknowledgement that rideshare is a regulated, politically watched category.</li>
<li><strong>A deliberately slow burn.</strong> The rollout ran city by city over two years: Geelong (May 2018), Melbourne (June 2018), Newcastle (March 2019), Brisbane (July 2019), then Perth and the Gold and Sunshine Coasts — with Sydney, the biggest prize, left until 16 March 2020, nearly two years after first landing.</li>
<li><strong>Then the regional blitz.</strong> In August 2020 DiDi switched on 20 more locations in one push — Adelaide, Cairns, Canberra, Ballarat and regional centres like Wagga Wagga, Rockhampton, Mackay and Hervey Bay — taking the network well beyond the capitals.</li>
<li><strong>Two million riders</strong> had used DiDi in Australia by the time Sydney launched.</li>
</ul>', '- **Melbourne HQ, government affairs from the start.** DiDi Australia is headquartered in Melbourne, and the company stood up a dedicated ANZ communications and government-affairs function within its first year — an acknowledgement that rideshare is a regulated, politically watched category.
- **A deliberately slow burn.** The rollout ran city by city over two years: Geelong (May 2018), Melbourne (June 2018), Newcastle (March 2019), Brisbane (July 2019), then Perth and the Gold and Sunshine Coasts — with Sydney, the biggest prize, left until 16 March 2020, nearly two years after first landing.
- **Then the regional blitz.** In August 2020 DiDi switched on 20 more locations in one push — Adelaide, Cairns, Canberra, Ballarat and regional centres like Wagga Wagga, Rockhampton, Mackay and Hervey Bay — taking the network well beyond the capitals.
- **Two million riders** had used DiDi in Australia by the time Sydney launched.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>The Geelong trial de-risked the launch</strong> — a genuine test market, rare in rideshare entries.</li>
<li><strong>Patience and capital</strong> — DiDi could sustain price competition longer than fellow challengers.</li>
<li><strong>Battle-tested playbook</strong> — it had already beaten Uber once at home.</li>
<li><strong>Multi-homing dynamics</strong> — drivers and riders happily added a second app, so incumbency was rentable, not owned.</li>
</ul>', '- **The Geelong trial de-risked the launch** — a genuine test market, rare in rideshare entries.
- **Patience and capital** — DiDi could sustain price competition longer than fellow challengers.
- **Battle-tested playbook** — it had already beaten Uber once at home.
- **Multi-homing dynamics** — drivers and riders happily added a second app, so incumbency was rentable, not owned.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>~US$56 billion valuation at entry — then the world''s most valuable startup</li>
<li>First Western-style market; second direct international expansion after Mexico</li>
<li>Month-long Geelong trial before the 25 June 2018 Melbourne launch</li>
<li>Among the last challengers standing: Ola and Bolt both exited, DiDi remains in AU and NZ</li>
</ul>', '- \~US\$56 billion valuation at entry — then the world''s most valuable startup
- First Western-style market; second direct international expansion after Mexico
- Month-long Geelong trial before the 25 June 2018 Melbourne launch
- Among the last challengers standing: Ola and Bolt both exited, DiDi remains in AU and NZ', 8),
      ('lessons', NULL::text, '<ol>
<li>A regional test market can de-risk even a mega-funded entry — data beats bravado.</li>
<li>Enter where you have a proven playbook against the incumbent, not just where the market is largest.</li>
<li>In multi-homing markets, you don''t need to displace the leader — you need to be worth a second app icon.</li>
<li>Challenger shakeouts reward the deepest balance sheet, not the earliest arrival.</li>
</ol>', '1. A regional test market can de-risk even a mega-funded entry — data beats bravado.
2. Enter where you have a proven playbook against the incumbent, not just where the market is largest.
3. In multi-homing markets, you don''t need to displace the leader — you need to be worth a second app icon.
4. Challenger shakeouts reward the deepest balance sheet, not the earliest arrival.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-didi-tested-geelong-before-undercutting-uber-across-australia' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-didi-tested-geelong-before-undercutting-uber-across-australia' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly' AND status = 'draft' AND content_type = 'case_study'), '<p>Bolt''s Australian story ended at midnight on a Saturday. On 28 March 2020, the Estonian rideshare challenger — which had entered as Taxify two and a half years earlier — terminated its business effective immediately, telling drivers to peel the stickers off their cars.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Bolt (formerly Taxify)</td>
</tr>
<tr>
<td>Origin</td>
<td>Estonia (Tallinn, founded by Markus Villig)</td>
</tr>
<tr>
<td>Sector</td>
<td>Ride-hailing</td>
</tr>
<tr>
<td>Entry year</td>
<td>2017 (Sydney, as Taxify)</td>
</tr>
<tr>
<td>Exit</td>
<td>28 March 2020 — immediate termination</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — first rideshare casualty of the COVID demand collapse</td>
</tr>
</table>', 'Bolt''s Australian story ended at midnight on a Saturday. On 28 March 2020, the Estonian rideshare challenger — which had entered as Taxify two and a half years earlier — terminated its business effective immediately, telling drivers to peel the stickers off their cars.
<table header-column="true">
<tr>
<td>Company</td>
<td>Bolt (formerly Taxify)</td>
</tr>
<tr>
<td>Origin</td>
<td>Estonia (Tallinn, founded by Markus Villig)</td>
</tr>
<tr>
<td>Sector</td>
<td>Ride-hailing</td>
</tr>
<tr>
<td>Entry year</td>
<td>2017 (Sydney, as Taxify)</td>
</tr>
<tr>
<td>Exit</td>
<td>28 March 2020 — immediate termination</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — first rideshare casualty of the COVID demand collapse</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('What went wrong', 'what-went-wrong', 2),
      ('Footprint & the second act', 'footprint-and-the-second-act', 3),
      ('Why it failed', 'why-it-failed', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Taxify arrived in Sydney in late 2017 during a wave of challenger entries against Uber — alongside India''s Ola and, soon after, China''s DiDi. The Estonian company''s global model was lean: lower commissions for drivers, cheaper fares for riders, minimal local overhead. It rebranded to Bolt globally in March 2019. In Australia it remained a distant challenger in a market where Uber''s brand and liquidity dominated.</p>', 'Taxify arrived in Sydney in late 2017 during a wave of challenger entries against Uber — alongside India''s Ola and, soon after, China''s DiDi. The Estonian company''s global model was lean: lower commissions for drivers, cheaper fares for riders, minimal local overhead. It rebranded to Bolt globally in March 2019. In Australia it remained a distant challenger in a market where Uber''s brand and liquidity dominated.', 1),
      ('what-went-wrong', 'Challenger economics with no buffer', '<p>Bolt''s lean-entry model kept costs down but also meant thin local roots: no deep driver loyalty, no differentiated rider proposition beyond price, and no adjacent revenue lines in Australia to smooth shocks.</p>', 'Bolt''s lean-entry model kept costs down but also meant thin local roots: no deep driver loyalty, no differentiated rider proposition beyond price, and no adjacent revenue lines in Australia to smooth shocks.', 2),
      ('what-went-wrong', 'A four-way war for the same riders', '<p>By 2019 Sydney and Melbourne riders could choose between Uber, Ola, DiDi and Bolt. Every challenger was competing on the same axis — price — against rivals (DiDi especially) with far deeper capital reserves.</p>', 'By 2019 Sydney and Melbourne riders could choose between Uber, Ola, DiDi and Bolt. Every challenger was competing on the same axis — price — against rivals (DiDi especially) with far deeper capital reserves.', 3),
      ('what-went-wrong', 'COVID as the margin call', '<p>When the pandemic hit, rideshare demand collapsed. Bolt terminated its Australian ride-hailing business effective midnight, Saturday 28 March 2020, telling drivers they were no longer authorised to carry passengers. AFR framed it as the first exit of a broader "ride-sharing shakeout"; the company had lasted almost exactly two and a half years.</p>', 'When the pandemic hit, rideshare demand collapsed. Bolt terminated its Australian ride-hailing business effective midnight, Saturday 28 March 2020, telling drivers they were no longer authorised to carry passengers. AFR framed it as the first exit of a broader "ride-sharing shakeout"; the company had lasted almost exactly two and a half years.', 4),
      ('footprint-and-the-second-act', NULL::text, '<ul>
<li><strong>A teenage founder''s lean empire.</strong> Bolt was founded in Tallinn by Markus Villig — who started the company at 19 — and its capital-light, low-overhead model was the whole strategy: enter cheaply, undercut, and rely on drivers and riders switching for price.</li>
<li><strong>Melbourne arrived weeks before the end.</strong> Bolt spent most of its Australian life as a Sydney-only operator; it had only recently arrived in Melbourne in early 2020 — where consumer guides were still recommending it as the newest, cheapest option — when COVID forced the overnight shutdown.</li>
<li><strong>The region wasn''t abandoned forever.</strong> Bolt later re-entered Australasia via Auckland, launching against Uber and DiDi with a dedicated New Zealand country manager — while Australia remains absent from its 850+-city global map, a measure of how thoroughly the 2020 exit closed the door.</li>
</ul>', '- **A teenage founder''s lean empire.** Bolt was founded in Tallinn by Markus Villig — who started the company at 19 — and its capital-light, low-overhead model was the whole strategy: enter cheaply, undercut, and rely on drivers and riders switching for price.
- **Melbourne arrived weeks before the end.** Bolt spent most of its Australian life as a Sydney-only operator; it had only recently arrived in Melbourne in early 2020 — where consumer guides were still recommending it as the newest, cheapest option — when COVID forced the overnight shutdown.
- **The region wasn''t abandoned forever.** Bolt later re-entered Australasia via Auckland, launching against Uber and DiDi with a dedicated New Zealand country manager — while Australia remains absent from its 850+-city global map, a measure of how thoroughly the 2020 exit closed the door.', 5),
      ('why-it-failed', NULL::text, '<ul>
<li><strong>Price-only positioning</strong> — nothing retained riders when subsidies stopped or demand vanished.</li>
<li><strong>Fourth player in a two-player economy</strong> — rideshare liquidity concentrates fast; sub-scale players carry all the costs with none of the density.</li>
<li><strong>No local shock absorbers</strong> — unlike Uber (Eats) or DiDi (global scale), Bolt Australia had a single revenue line.</li>
<li><strong>Global triage</strong> — Australia was a marginal experiment for a company whose strongholds were Europe and Africa; when capital tightened, it was cut first.</li>
</ul>', '- **Price-only positioning** — nothing retained riders when subsidies stopped or demand vanished.
- **Fourth player in a two-player economy** — rideshare liquidity concentrates fast; sub-scale players carry all the costs with none of the density.
- **No local shock absorbers** — unlike Uber (Eats) or DiDi (global scale), Bolt Australia had a single revenue line.
- **Global triage** — Australia was a marginal experiment for a company whose strongholds were Europe and Africa; when capital tightened, it was cut first.', 6),
      ('key-metrics', NULL::text, '<ul>
<li>~2.5 years in market (late 2017 – March 2020)</li>
<li>4th major rideshare player in a market Uber dominated</li>
<li>0 days'' operational wind-down — termination effective at midnight</li>
</ul>', '- \~2.5 years in market (late 2017 – March 2020)
- 4th major rideshare player in a market Uber dominated
- 0 days'' operational wind-down — termination effective at midnight', 7),
      ('lessons', NULL::text, '<ol>
<li>Entering on price alone builds usage, not loyalty — the first shock reveals the difference.</li>
<li>Network-effect markets punish the smallest player disproportionately: density is the product.</li>
<li>A market that is peripheral to your global strategy will be the first abandoned in a crisis — partners and drivers price that risk in.</li>
<li>Exit manner matters: overnight terminations become the story competitors tell about you in every future market.</li>
</ol>', '1. Entering on price alone builds usage, not loyalty — the first shock reveals the difference.
2. Network-effect markets punish the smallest player disproportionately: density is the product.
3. A market that is peripheral to your global strategy will be the first abandoned in a crisis — partners and drivers price that risk in.
4. Exit manner matters: overnight terminations become the story competitors tell about you in every future market.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition' AND status = 'draft' AND content_type = 'case_study'), '<p>Fujitsu had been in Australia for decades — but by 2021 it was a legacy infrastructure provider watching the market move to cloud, data and cybersecurity. Its answer was a five-acquisition sprint across ANZ that ended a decade-long deal drought and culminated in a $300 million cybersecurity push.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Fujitsu</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Enterprise IT services and consulting</td>
</tr>
<tr>
<td>Key period</td>
<td>2021–2024 acquisition-led repositioning</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Serial bolt-on acquisitions of specialist local firms</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — repositioned from legacy infrastructure to high-growth consulting and cyber</td>
</tr>
</table>', 'Fujitsu had been in Australia for decades — but by 2021 it was a legacy infrastructure provider watching the market move to cloud, data and cybersecurity. Its answer was a five-acquisition sprint across ANZ that ended a decade-long deal drought and culminated in a \$300 million cybersecurity push.
<table header-column="true">
<tr>
<td>Company</td>
<td>Fujitsu</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Enterprise IT services and consulting</td>
</tr>
<tr>
<td>Key period</td>
<td>2021–2024 acquisition-led repositioning</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Serial bolt-on acquisitions of specialist local firms</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — repositioned from legacy infrastructure to high-growth consulting and cyber</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & deal craft', 'people-and-deal-craft', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Fujitsu''s ANZ business had scale and government relationships but skewed toward traditional managed infrastructure — a shrinking pool — while demand shifted to data analytics, cloud transformation and cybersecurity. Rather than retraining its way into these markets organically, Fujitsu bought its way in, acquiring capability, clients and — critically — cleared, credentialed people.</p>', 'Fujitsu''s ANZ business had scale and government relationships but skewed toward traditional managed infrastructure — a shrinking pool — while demand shifted to data analytics, cloud transformation and cybersecurity. Rather than retraining its way into these markets organically, Fujitsu bought its way in, acquiring capability, clients and — critically — cleared, credentialed people.', 1),
      ('entry-strategy', 'Break the drought with data', '<p>The April 2021 acquisition of Melbourne data and analytics consultancy Versor ended what commentators called a decade-long acquisition dry spell for Fujitsu in the region, and signalled the new strategy: buy specialist capability at the top of the demand curve.</p>', 'The April 2021 acquisition of Melbourne data and analytics consultancy Versor ended what commentators called a decade-long acquisition dry spell for Fujitsu in the region, and signalled the new strategy: buy specialist capability at the top of the demand curve.', 2),
      ('entry-strategy', 'Assemble a capability portfolio, deal by deal', '<p>Fujitsu followed with Enable Professional Services (Melbourne-based ServiceNow specialist, July 2022), oobe (Canberra Microsoft/Azure specialist), InPhySec (Wellington cybersecurity firm) and MF &amp; Associates (Canberra digital transformation and cyber consultancy, September 2023) — its fifth ANZ acquisition since 2021. Each deal bought a distinct platform partnership, security clearances or sector depth, especially in the government heartland of Canberra and Wellington.</p>', 'Fujitsu followed with Enable Professional Services (Melbourne-based ServiceNow specialist, July 2022), oobe (Canberra Microsoft/Azure specialist), InPhySec (Wellington cybersecurity firm) and MF & Associates (Canberra digital transformation and cyber consultancy, September 2023) — its fifth ANZ acquisition since 2021. Each deal bought a distinct platform partnership, security clearances or sector depth, especially in the government heartland of Canberra and Wellington.', 3),
      ('entry-strategy', 'Consolidate into a flagship bet', '<p>In June 2024 Fujitsu announced a $300 million, three-year investment to build a 300-specialist Cyber Security Services unit — led by oobe co-founder Stuart Kilduff — aimed at an Australian cyber consulting market worth around $8 billion. Acquired founders weren''t just retained; they were promoted to run the strategy.</p>', 'In June 2024 Fujitsu announced a \$300 million, three-year investment to build a 300-specialist Cyber Security Services unit — led by oobe co-founder Stuart Kilduff — aimed at an Australian cyber consulting market worth around \$8 billion. Acquired founders weren''t just retained; they were promoted to run the strategy.', 4),
      ('people-and-deal-craft', NULL::text, '<ul>
<li><strong>A local CEO fronting the thesis.</strong> Fujitsu Australia chief executive Graeme Beardsell publicly framed each deal — calling Versor a "strategic acquisition" that "positions Fujitsu as a leader in the advanced data consulting industry" — and stressed cultural alignment and career paths for acquired teams, not just capability transfer.</li>
<li><strong>Diligence built for cross-border trust.</strong> The MF &amp; Associates acquisition (a Canberra consultancy founded only in 2019) ran through a managed due-diligence process involving more than 50 internal and external stakeholders across Australia and Japan — the machinery required when a Tokyo parent buys public-sector-facing boutiques.</li>
</ul>', '- **A local CEO fronting the thesis.** Fujitsu Australia chief executive Graeme Beardsell publicly framed each deal — calling Versor a "strategic acquisition" that "positions Fujitsu as a leader in the advanced data consulting industry" — and stressed cultural alignment and career paths for acquired teams, not just capability transfer.
- **Diligence built for cross-border trust.** The MF & Associates acquisition (a Canberra consultancy founded only in 2019) ran through a managed due-diligence process involving more than 50 internal and external stakeholders across Australia and Japan — the machinery required when a Tokyo parent buys public-sector-facing boutiques.', 5),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Buying revealed demand</strong> — each target sat squarely in a segment customers were already funding.</li>
<li><strong>Government-grade assets</strong> — clearances, panel positions and Canberra presence are near-impossible to build organically as a foreign-owned firm.</li>
<li><strong>Founder retention</strong> — putting acquired leaders in charge preserved the entrepreneurial capability being bought.</li>
<li><strong>Portfolio logic</strong> — five complementary deals compounded into a credible transformation story no single acquisition could tell.</li>
</ul>', '- **Buying revealed demand** — each target sat squarely in a segment customers were already funding.
- **Government-grade assets** — clearances, panel positions and Canberra presence are near-impossible to build organically as a foreign-owned firm.
- **Founder retention** — putting acquired leaders in charge preserved the entrepreneurial capability being bought.
- **Portfolio logic** — five complementary deals compounded into a credible transformation story no single acquisition could tell.', 6),
      ('key-metrics', NULL::text, '<ul>
<li>5 ANZ acquisitions between April 2021 and September 2023</li>
<li>$300M three-year cybersecurity investment announced June 2024</li>
<li>300-specialist dedicated cyber unit</li>
<li>~$8B addressable Australian cyber consulting market</li>
</ul>', '- 5 ANZ acquisitions between April 2021 and September 2023
- \$300M three-year cybersecurity investment announced June 2024
- 300-specialist dedicated cyber unit
- \~\$8B addressable Australian cyber consulting market', 7),
      ('lessons', NULL::text, '<ol>
<li>For incumbents whose market has moved, serial bolt-on M&amp;A is a re-entry strategy — buying tomorrow''s revenue mix rather than defending yesterday''s.</li>
<li>In government-heavy markets, acquisitions buy trust artefacts (clearances, panels, local leadership) money can''t otherwise access.</li>
<li>Keeping and elevating acquired founders determines whether you bought a capability or just a client list.</li>
<li>A sequence of small, thematic deals de-risks transformation better than one transformational bet.</li>
</ol>', '1. For incumbents whose market has moved, serial bolt-on M&A is a re-entry strategy — buying tomorrow''s revenue mix rather than defending yesterday''s.
2. In government-heavy markets, acquisitions buy trust artefacts (clearances, panels, local leadership) money can''t otherwise access.
3. Keeping and elevating acquired founders determines whether you bought a capability or just a client list.
4. A sequence of small, thematic deals de-risks transformation better than one transformational bet.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-agoda-carved-out-an-australian-niche-in-asia-bound-travel (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel' AND status = 'draft' AND content_type = 'case_study'), '<p>Agoda — the online travel agency born in Phuket, Thailand — didn''t win Australian travellers with advertising. It won Australian <em>hotels</em> first, surveying around 7,000 local accommodation partners and making Australia the first market in the world to get its 24/7 localised partner support.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Agoda</td>
</tr>
<tr>
<td>Origin</td>
<td>Thailand (Phuket); part of Booking Holdings since 2007</td>
</tr>
<tr>
<td>Sector</td>
<td>Online travel booking (OTA)</td>
</tr>
<tr>
<td>Key entry moves</td>
<td>Virgin Australia Velocity partnership (2013); supply-side localisation</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic expansion with local partnerships and dedicated Oceania operations</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — established OTA presence in an Expedia/[Booking.com](http://Booking.com)-dominated market</td>
</tr>
</table>', 'Agoda — the online travel agency born in Phuket, Thailand — didn''t win Australian travellers with advertising. It won Australian *hotels* first, surveying around 7,000 local accommodation partners and making Australia the first market in the world to get its 24/7 localised partner support.
<table header-column="true">
<tr>
<td>Company</td>
<td>Agoda</td>
</tr>
<tr>
<td>Origin</td>
<td>Thailand (Phuket); part of Booking Holdings since 2007</td>
</tr>
<tr>
<td>Sector</td>
<td>Online travel booking (OTA)</td>
</tr>
<tr>
<td>Key entry moves</td>
<td>Virgin Australia Velocity partnership (2013); supply-side localisation</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic expansion with local partnerships and dedicated Oceania operations</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — established OTA presence in an Expedia/[Booking.com](http://Booking.com)-dominated market</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Local footprint', 'local-footprint', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Agoda was founded in Phuket, Thailand, and acquired by Priceline (now Booking Holdings) in November 2007 — giving a Southeast Asian OTA global capital while it retained its Asia-Pacific identity and hotel network. Australia mattered twice over: as a large outbound market of travellers heading to Asia (Agoda''s supply stronghold), and as a domestic accommodation market in its own right.</p>', 'Agoda was founded in Phuket, Thailand, and acquired by Priceline (now Booking Holdings) in November 2007 — giving a Southeast Asian OTA global capital while it retained its Asia-Pacific identity and hotel network. Australia mattered twice over: as a large outbound market of travellers heading to Asia (Agoda''s supply stronghold), and as a domestic accommodation market in its own right.', 1),
      ('entry-strategy', 'Borrow a loyalty program', '<p>On 29 October 2013, Agoda partnered with Virgin Australia''s Velocity Frequent Flyer program, letting members earn points on hotel bookings. Rather than building loyalty infrastructure from scratch, Agoda plugged into one of Australia''s two dominant airline programs — instant access to millions of engaged, travel-active consumers.</p>', 'On 29 October 2013, Agoda partnered with Virgin Australia''s Velocity Frequent Flyer program, letting members earn points on hotel bookings. Rather than building loyalty infrastructure from scratch, Agoda plugged into one of Australia''s two dominant airline programs — instant access to millions of engaged, travel-active consumers.', 2),
      ('entry-strategy', 'Win the supply side with service', '<p>Agoda launched 24/7 partner-services support for Australian hoteliers — the first market globally to receive it — alongside deeper localisation, informed by a survey of roughly 7,000 Australian hotel and accommodation owners. Better-supported hotels list better inventory and rates, which strengthens the consumer offer in turn.</p>', 'Agoda launched 24/7 partner-services support for Australian hoteliers — the first market globally to receive it — alongside deeper localisation, informed by a survey of roughly 7,000 Australian hotel and accommodation owners. Better-supported hotels list better inventory and rates, which strengthens the consumer offer in turn.', 3),
      ('entry-strategy', 'Put leadership in the region', '<p>A dedicated Oceania operation under a named local director (Zsuzsanna Janos) signalled to partners that Australia was a managed market, not a long-tail territory run from Bangkok or Singapore.</p>', 'A dedicated Oceania operation under a named local director (Zsuzsanna Janos) signalled to partners that Australia was a managed market, not a long-tail territory run from Bangkok or Singapore.', 4),
      ('entry-strategy', 'Leverage the Asia corridor', '<p>For Australian travellers, Agoda''s unmatched depth in Asian hotel supply gave it a genuine wedge against <a href="http://Booking.com">Booking.com</a> and Expedia: the OTA you use for Bali, Bangkok and Tokyo becomes the OTA you try at home.</p>', 'For Australian travellers, Agoda''s unmatched depth in Asian hotel supply gave it a genuine wedge against [Booking.com](http://Booking.com) and Expedia: the OTA you use for Bali, Bangkok and Tokyo becomes the OTA you try at home.', 5),
      ('local-footprint', NULL::text, '<ul>
<li><strong>A Sydney base inside a global machine.</strong> Agoda maintains a Sydney office at 50 Bridge Street in the CBD, housing market-management and partner-facing roles for Oceania, while technology and operations remain concentrated in its Bangkok and Singapore hubs — more than 7,000 employees of 90 nationalities globally.</li>
<li><strong>Founder continuity.</strong> Agoda was founded in Thailand in 2005 by two lifelong friends; co-founder Robert Rosenstein led it as president and CEO for more than a decade (now chairman), preserving the Asia-first identity that gives the Australian offer its corridor advantage.</li>
</ul>', '- **A Sydney base inside a global machine.** Agoda maintains a Sydney office at 50 Bridge Street in the CBD, housing market-management and partner-facing roles for Oceania, while technology and operations remain concentrated in its Bangkok and Singapore hubs — more than 7,000 employees of 90 nationalities globally.
- **Founder continuity.** Agoda was founded in Thailand in 2005 by two lifelong friends; co-founder Robert Rosenstein led it as president and CEO for more than a decade (now chairman), preserving the Asia-first identity that gives the Australian offer its corridor advantage.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Partnership over acquisition</strong> — the Velocity tie-up bought reach at a fraction of the cost of building a brand.</li>
<li><strong>Supply-side-first thinking</strong> — hotels are the scarce side of the marketplace; serving them first improved the whole flywheel.</li>
<li><strong>Credible localisation</strong> — surveys, local support and local leadership rather than a translated website.</li>
<li><strong>A defensible wedge</strong> — Asia-corridor strength that global rivals couldn''t easily match.</li>
</ul>', '- **Partnership over acquisition** — the Velocity tie-up bought reach at a fraction of the cost of building a brand.
- **Supply-side-first thinking** — hotels are the scarce side of the marketplace; serving them first improved the whole flywheel.
- **Credible localisation** — surveys, local support and local leadership rather than a translated website.
- **A defensible wedge** — Asia-corridor strength that global rivals couldn''t easily match.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>Acquired by Priceline in November 2007 — capital for global expansion</li>
<li>Velocity partnership live from 29 October 2013</li>
<li>~7,000 Australian accommodation partners surveyed to shape localisation</li>
<li>First market worldwide to receive Agoda''s 24/7 partner support</li>
</ul>', '- Acquired by Priceline in November 2007 — capital for global expansion
- Velocity partnership live from 29 October 2013
- \~7,000 Australian accommodation partners surveyed to shape localisation
- First market worldwide to receive Agoda''s 24/7 partner support', 8),
      ('lessons', NULL::text, '<ol>
<li>In two-sided markets, entering through the supply side builds durable advantage the demand side can''t see but always feels.</li>
<li>Partnering with a national loyalty program is one of the cheapest ways to buy mainstream trust.</li>
<li>"First market globally" treatment tells local partners they matter — and they reciprocate with better inventory.</li>
<li>Lead with the corridor you dominate; adjacency will carry you into the domestic market.</li>
</ol>', '1. In two-sided markets, entering through the supply side builds durable advantage the demand side can''t see but always feels.
2. Partnering with a national loyalty program is one of the cheapest ways to buy mainstream trust.
3. "First market globally" treatment tells local partners they matter — and they reciprocate with better inventory.
4. Lead with the corridor you dominate; adjacency will carry you into the domestic market.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading' AND status = 'draft' AND content_type = 'case_study'), '<p>Rakuten Kobo cracked the Amazon-dominated Australian e-reading market without opening a single store or spending big on brand — it borrowed the trust of Booktopia, Australia''s number-one online bookseller, and built its subscription business on top.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Rakuten Kobo</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan (Rakuten; Kobo founded Toronto 2009, acquired 2012)</td>
</tr>
<tr>
<td>Sector</td>
<td>E-readers, e-books and audiobook subscriptions</td>
</tr>
<tr>
<td>Key entry move</td>
<td>Strategic partnership with Booktopia (March 2020)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Partnership-led distribution, then subscription and retail expansion</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia became an early Kobo Plus market with growing retail reach</td>
</tr>
</table>', 'Rakuten Kobo cracked the Amazon-dominated Australian e-reading market without opening a single store or spending big on brand — it borrowed the trust of Booktopia, Australia''s number-one online bookseller, and built its subscription business on top.
<table header-column="true">
<tr>
<td>Company</td>
<td>Rakuten Kobo</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan (Rakuten; Kobo founded Toronto 2009, acquired 2012)</td>
</tr>
<tr>
<td>Sector</td>
<td>E-readers, e-books and audiobook subscriptions</td>
</tr>
<tr>
<td>Key entry move</td>
<td>Strategic partnership with Booktopia (March 2020)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Partnership-led distribution, then subscription and retail expansion</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Australia became an early Kobo Plus market with growing retail reach</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Partners & people', 'partners-and-people', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Kobo, founded in Toronto in 2009 and acquired by Japan''s Rakuten in 2012 for US$315 million, is the world''s principal challenger to Amazon''s Kindle. Its global playbook is consistent: rather than fighting Amazon head-on, it allies with each country''s leading local bookseller. In Australia, that meant Booktopia.</p>', 'Kobo, founded in Toronto in 2009 and acquired by Japan''s Rakuten in 2012 for US\$315 million, is the world''s principal challenger to Amazon''s Kindle. Its global playbook is consistent: rather than fighting Amazon head-on, it allies with each country''s leading local bookseller. In Australia, that meant Booktopia.', 1),
      ('entry-strategy', 'Partner with the local champion', '<p>On 31 March 2020, Kobo announced a strategic partnership with Booktopia, Australia''s biggest online book retailer — putting Kobo devices and its e-book ecosystem in front of Booktopia''s customer base and aligning with local book-buying loyalty instead of competing with it.</p>', 'On 31 March 2020, Kobo announced a strategic partnership with Booktopia, Australia''s biggest online book retailer — putting Kobo devices and its e-book ecosystem in front of Booktopia''s customer base and aligning with local book-buying loyalty instead of competing with it.', 2),
      ('entry-strategy', 'Introduce subscription once the base existed', '<p>On 2 November 2021, Kobo Plus — its all-you-can-read subscription with 580,000+ titles — launched in Australia via Booktopia, making Australia one of its first markets after the Netherlands, Belgium, Canada and Portugal.</p>', 'On 2 November 2021, Kobo Plus — its all-you-can-read subscription with 580,000+ titles — launched in Australia via Booktopia, making Australia one of its first markets after the Netherlands, Belgium, Canada and Portugal.', 3),
      ('entry-strategy', 'Widen the offer', '<p>On 17 August 2023 Kobo Plus added audiobooks in Australia, with tiered pricing (A$13.99/month to read <em>or</em> listen, A$16.99 for both, 30-day free trial) — matching global streaming-era expectations while undercutting per-title audiobook pricing.</p>', 'On 17 August 2023 Kobo Plus added audiobooks in Australia, with tiered pricing (A\$13.99/month to read *or* listen, A\$16.99 for both, 30-day free trial) — matching global streaming-era expectations while undercutting per-title audiobook pricing.', 4),
      ('entry-strategy', 'Add physical retail reach', '<p>From June 2026, Kobo devices reach mainstream physical retail through Officeworks — extending distribution beyond the online channel as the partnership-led beachhead matured.</p>', 'From June 2026, Kobo devices reach mainstream physical retail through Officeworks — extending distribution beyond the online channel as the partnership-led beachhead matured.', 5),
      ('partners-and-people', NULL::text, '<ul>
<li><strong>A joint venture, not just a listing deal.</strong> The Booktopia alliance was structured as "Booktopia by Rakuten Kobo", making Kobo the retailer''s exclusive digital reading partner and putting more than five million eBooks and audiobooks in front of its customers.</li>
<li><strong>The CEO fronted the market.</strong> Rakuten Kobo chief executive Michael Tamblyn personally announced the Australian subscription launch ("Our mission is straightforward: make a reader''s life better"), signalling Australia''s priority within the global business.</li>
<li><strong>Bookseller channel consolidated.</strong> Distribution runs through Booktopia and its subsidiary Angus &amp; Robertson — Kobo''s only Australian retail partners — replacing an earlier local arrangement, with announcements issued from Sydney.</li>
</ul>', '- **A joint venture, not just a listing deal.** The Booktopia alliance was structured as "Booktopia by Rakuten Kobo", making Kobo the retailer''s exclusive digital reading partner and putting more than five million eBooks and audiobooks in front of its customers.
- **The CEO fronted the market.** Rakuten Kobo chief executive Michael Tamblyn personally announced the Australian subscription launch ("Our mission is straightforward: make a reader''s life better"), signalling Australia''s priority within the global business.
- **Bookseller channel consolidated.** Distribution runs through Booktopia and its subsidiary Angus & Robertson — Kobo''s only Australian retail partners — replacing an earlier local arrangement, with announcements issued from Sydney.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Trust transfer</strong> — Booktopia''s local credibility neutralised the disadvantage of being a foreign challenger to Kindle.</li>
<li><strong>Sequenced entry</strong> — devices first, subscription second, audiobooks third, mass retail fourth; each step built on proven demand.</li>
<li><strong>A repeatable global playbook</strong> — the local-bookseller alliance model had already worked in Canada, France and elsewhere.</li>
<li><strong>Subscription economics</strong> — Kobo Plus locked in readers Amazon would otherwise own by default.</li>
</ul>', '- **Trust transfer** — Booktopia''s local credibility neutralised the disadvantage of being a foreign challenger to Kindle.
- **Sequenced entry** — devices first, subscription second, audiobooks third, mass retail fourth; each step built on proven demand.
- **A repeatable global playbook** — the local-bookseller alliance model had already worked in Canada, France and elsewhere.
- **Subscription economics** — Kobo Plus locked in readers Amazon would otherwise own by default.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>Partnership with Australia''s #1 online bookseller announced 31 March 2020</li>
<li>Kobo Plus launched in Australia 2 November 2021 — among its first five markets</li>
<li>580,000+ titles in the subscription catalogue at AU launch</li>
<li>Audiobooks added 17 August 2023 (A$13.99–A$16.99/month); Officeworks retail from June 2026</li>
</ul>', '- Partnership with Australia''s #1 online bookseller announced 31 March 2020
- Kobo Plus launched in Australia 2 November 2021 — among its first five markets
- 580,000+ titles in the subscription catalogue at AU launch
- Audiobooks added 17 August 2023 (A\$13.99–A\$16.99/month); Officeworks retail from June 2026', 8),
      ('lessons', NULL::text, '<ol>
<li>Against a dominant global incumbent, allying with the local category leader beats building brand from zero.</li>
<li>Sequencing (hardware → subscription → new formats → mass retail) lets each stage fund confidence in the next.</li>
<li>A partnership model turns the incumbent''s biggest local rival into your sales force.</li>
<li>Subscription pricing localised to market norms converts casual buyers into locked-in ecosystems.</li>
</ol>', '1. Against a dominant global incumbent, allying with the local category leader beats building brand from zero.
2. Sequencing (hardware → subscription → new formats → mass retail) lets each stage fund confidence in the next.
3. A partnership model turns the incumbent''s biggest local rival into your sales force.
4. Subscription pricing localised to market norms converts casual buyers into locked-in ecosystems.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-nec-anchored-its-australian-entry-in-government-contracts (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-nec-anchored-its-australian-entry-in-government-contracts' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-nec-anchored-its-australian-entry-in-government-contracts' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-nec-anchored-its-australian-entry-in-government-contracts' AND status = 'draft' AND content_type = 'case_study'), '<p>NEC arrived in Australia in 1969 with five staff — one of the earliest Japanese technology companies to set up locally, decades before "Asian tech entry" became a category. More than half a century later, it remains a fixture of Australian government and enterprise technology.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>NEC</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan (Tokyo)</td>
</tr>
<tr>
<td>Sector</td>
<td>Telecommunications, ICT and biometrics</td>
</tr>
<tr>
<td>Entry year</td>
<td>1969</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned local subsidiary, grown organically over decades</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 55+ years of continuous operation and 1,400+ staff at scale</td>
</tr>
</table>', 'NEC arrived in Australia in 1969 with five staff — one of the earliest Japanese technology companies to set up locally, decades before "Asian tech entry" became a category. More than half a century later, it remains a fixture of Australian government and enterprise technology.
<table header-column="true">
<tr>
<td>Company</td>
<td>NEC</td>
</tr>
<tr>
<td>Origin</td>
<td>Japan (Tokyo)</td>
</tr>
<tr>
<td>Sector</td>
<td>Telecommunications, ICT and biometrics</td>
</tr>
<tr>
<td>Entry year</td>
<td>1969</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned local subsidiary, grown organically over decades</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 55+ years of continuous operation and 1,400+ staff at scale</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-nec-anchored-its-australian-entry-in-government-contracts' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Footprint & flagship contracts', 'footprint-and-flagship-contracts', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>In the late 1960s NEC began building an international subsidiary network, establishing NEC Australia in 1969 — among its early overseas outposts alongside Mexico and Brazil. Australia''s expanding telecommunications infrastructure and government procurement market made it a logical, if unglamorous, long-term bet.</p>', 'In the late 1960s NEC began building an international subsidiary network, establishing NEC Australia in 1969 — among its early overseas outposts alongside Mexico and Brazil. Australia''s expanding telecommunications infrastructure and government procurement market made it a logical, if unglamorous, long-term bet.', 1),
      ('entry-strategy', 'Start small, stay permanent', '<p>NEC Australia opened with just five staff. The entry wasn''t a splash but a stake in the ground: a wholly owned subsidiary structured for decades of patient growth rather than a distributor arrangement that could be unwound.</p>', 'NEC Australia opened with just five staff. The entry wasn''t a splash but a stake in the ground: a wholly owned subsidiary structured for decades of patient growth rather than a distributor arrangement that could be unwound.', 2),
      ('entry-strategy', 'Grow with national infrastructure', '<p>NEC built its Australian business by supplying the technology underneath the country''s communications build-out — telecommunications equipment first, then ICT systems and services as the market evolved. By 2001 the subsidiary employed more than 1,400 people.</p>', 'NEC built its Australian business by supplying the technology underneath the country''s communications build-out — telecommunications equipment first, then ICT systems and services as the market evolved. By 2001 the subsidiary employed more than 1,400 people.', 3),
      ('entry-strategy', 'Become a government-grade incumbent', '<p>Over decades, NEC embedded itself in government and enterprise contracts — the slowest customers to win and the slowest to leave — later extending into specialised strengths like biometrics and identity systems.</p>', 'Over decades, NEC embedded itself in government and enterprise contracts — the slowest customers to win and the slowest to leave — later extending into specialised strengths like biometrics and identity systems.', 4),
      ('entry-strategy', 'Compound trust as the moat', '<p>Fifty-five years of continuous local operation, local employment and delivery history became NEC''s core differentiator against newer entrants: in public-sector technology, longevity itself is a credential.</p>', 'Fifty-five years of continuous local operation, local employment and delivery history became NEC''s core differentiator against newer entrants: in public-sector technology, longevity itself is a credential.', 5),
      ('footprint-and-flagship-contracts', NULL::text, '<ul>
<li><strong>A Melbourne home base.</strong> NEC Australia''s national head office sits in Glen Waverley in Melbourne''s south-east — a permanent suburban campus rather than a serviced CBD floor, consistent with its manufacturing-era roots.</li>
<li><strong>Whole-of-government wins.</strong> Flagship deals include the Northern Territory Government''s end-user computing contract (A$55 million over an initial three years, supporting 20,000 public-sector users, awarded 2014) and the 2016 CrimTrac selection to build Australia''s national facial recognition and fingerprint matching capability.</li>
<li><strong>The cautionary counterweight.</strong> That biometrics flagship also shows incumbency''s limits: the ACIC terminated the Biometric Identification Services project (worth up to A$52 million) in June 2018 over delays, and NEC took the agency to court — proof that even a 50-year government incumbent can lose a marquee project.</li>
</ul>', '- **A Melbourne home base.** NEC Australia''s national head office sits in Glen Waverley in Melbourne''s south-east — a permanent suburban campus rather than a serviced CBD floor, consistent with its manufacturing-era roots.
- **Whole-of-government wins.** Flagship deals include the Northern Territory Government''s end-user computing contract (A\$55 million over an initial three years, supporting 20,000 public-sector users, awarded 2014) and the 2016 CrimTrac selection to build Australia''s national facial recognition and fingerprint matching capability.
- **The cautionary counterweight.** That biometrics flagship also shows incumbency''s limits: the ACIC terminated the Biometric Identification Services project (worth up to A\$52 million) in June 2018 over delays, and NEC took the agency to court — proof that even a 50-year government incumbent can lose a marquee project.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Permanence signalling</strong> — a subsidiary, local hiring and continuous presence outlasted competitors'' in-and-out cycles.</li>
<li><strong>Infrastructure alignment</strong> — revenue tracked national investment in telecoms and ICT for decades.</li>
<li><strong>Government-market patience</strong> — NEC accepted long sales cycles in exchange for long contract lives.</li>
<li><strong>Evolution without exit</strong> — the business repeatedly shifted portfolio (telecoms → ICT → biometrics) without ever leaving.</li>
</ul>', '- **Permanence signalling** — a subsidiary, local hiring and continuous presence outlasted competitors'' in-and-out cycles.
- **Infrastructure alignment** — revenue tracked national investment in telecoms and ICT for decades.
- **Government-market patience** — NEC accepted long sales cycles in exchange for long contract lives.
- **Evolution without exit** — the business repeatedly shifted portfolio (telecoms → ICT → biometrics) without ever leaving.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>Established 1969 with 5 staff</li>
<li>1,400+ employees by 2001</li>
<li>55+ years of continuous Australian operation</li>
<li>One of the first Japanese technology subsidiaries in the country</li>
</ul>', '- Established 1969 with 5 staff
- 1,400+ employees by 2001
- 55+ years of continuous Australian operation
- One of the first Japanese technology subsidiaries in the country', 8),
      ('lessons', NULL::text, '<ol>
<li>Entry mode is a statement: a wholly owned subsidiary tells the market — and government buyers — you intend to stay.</li>
<li>Aligning with national infrastructure spending gives foreign entrants decades of demand visibility.</li>
<li>In public-sector markets, tenure compounds: every year in-country makes the next contract easier to win.</li>
<li>Long-lived entrants survive by migrating their portfolio, not their postcode.</li>
</ol>', '1. Entry mode is a statement: a wholly owned subsidiary tells the market — and government buyers — you intend to stay.
2. Aligning with national infrastructure spending gives foreign entrants decades of demand visibility.
3. In public-sector markets, tenure compounds: every year in-country makes the next contract easier to win.
4. Long-lived entrants survive by migrating their portfolio, not their postcode.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-nec-anchored-its-australian-entry-in-government-contracts' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-nec-anchored-its-australian-entry-in-government-contracts' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-monday-com-scaled-australia-remotely-before-landing-onshore (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-monday-com-scaled-australia-remotely-before-landing-onshore' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-monday-com-scaled-australia-remotely-before-landing-onshore' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-monday-com-scaled-australia-remotely-before-landing-onshore' AND status = 'draft' AND content_type = 'case_study'), '<p><a href="http://monday.com">monday.com</a> launched in Australia in June 2020 — in the middle of a pandemic, with offices closed and the world working from home. Five years later, its regional ARR had grown from $7 million to over $120 million, its brand had climbed from sixth to first in its category locally, and Sydney hosted its official APAC headquarters. It is one of the fastest and best-documented SaaS scale-ups in Australian market-entry history.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>[monday.com](http://monday.com)</td>
</tr>
<tr>
<td>Origin</td>
<td>Israel (Tel Aviv)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — work management / work OS platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2020</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — local team launched mid-COVID, scaled into an APAC HQ</td>
</tr>
<tr>
<td>Outcome</td>
<td>Strong success — regional ARR $7M to $120M+ in five years; #1 brand in category</td>
</tr>
</table>', '[monday.com](http://monday.com) launched in Australia in June 2020 — in the middle of a pandemic, with offices closed and the world working from home. Five years later, its regional ARR had grown from \$7 million to over \$120 million, its brand had climbed from sixth to first in its category locally, and Sydney hosted its official APAC headquarters. It is one of the fastest and best-documented SaaS scale-ups in Australian market-entry history.
<table header-column="true">
<tr>
<td>Company</td>
<td>[monday.com](http://monday.com)</td>
</tr>
<tr>
<td>Origin</td>
<td>Israel (Tel Aviv)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — work management / work OS platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2020</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — local team launched mid-COVID, scaled into an APAC HQ</td>
</tr>
<tr>
<td>Outcome</td>
<td>Strong success — regional ARR \$7M to \$120M+ in five years; #1 brand in category</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-monday-com-scaled-australia-remotely-before-landing-onshore' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p><a href="http://monday.com">monday.com</a>, the Tel Aviv-founded work management platform, was preparing for its 2021 IPO when it launched its Australian operation in June 2020. Australia was already showing strong self-serve adoption of work management tools, and COVID-era remote work was accelerating demand for exactly what <a href="http://monday.com">monday.com</a> sold. Rather than wait out the pandemic, the company treated the disruption as a tailwind and entered anyway.</p>', '[monday.com](http://monday.com), the Tel Aviv-founded work management platform, was preparing for its 2021 IPO when it launched its Australian operation in June 2020. Australia was already showing strong self-serve adoption of work management tools, and COVID-era remote work was accelerating demand for exactly what [monday.com](http://monday.com) sold. Rather than wait out the pandemic, the company treated the disruption as a tailwind and entered anyway.', 1),
      ('entry-strategy', 'Launch into the tailwind', '<p>Entering in June 2020 meant launching without offices, events or in-person sales — but into the single biggest demand spike the work-management category had ever seen. <a href="http://monday.com">monday.com</a> built its initial Australian team remotely and captured COVID-driven adoption while competitors hesitated.</p>', 'Entering in June 2020 meant launching without offices, events or in-person sales — but into the single biggest demand spike the work-management category had ever seen. [monday.com](http://monday.com) built its initial Australian team remotely and captured COVID-driven adoption while competitors hesitated.', 2),
      ('entry-strategy', 'Hire a regional builder, not a country manager', '<p>The regional operation was built under Dean Swan — <a href="http://monday.com">monday.com</a>''s employee number one in APAC — who joined at launch in 2020 after 11 years at Microsoft and a stint as Dropbox''s ANZ country manager. Swan set himself a goal of $100M in regional ARR within five years, at a time when the entire company was valued at around $120M, and his mandate was regional from the start: over five years the company opened offices in Sydney, Melbourne, Singapore and Tokyo, scaling the team more than 20x to 140+ people. Structuring APJ as one build — with Australia as the anchor — meant wins in each market compounded across the region.</p>', 'The regional operation was built under Dean Swan — [monday.com](http://monday.com)''s employee number one in APAC — who joined at launch in 2020 after 11 years at Microsoft and a stint as Dropbox''s ANZ country manager. Swan set himself a goal of \$100M in regional ARR within five years, at a time when the entire company was valued at around \$120M, and his mandate was regional from the start: over five years the company opened offices in Sydney, Melbourne, Singapore and Tokyo, scaling the team more than 20x to 140+ people. Structuring APJ as one build — with Australia as the anchor — meant wins in each market compounded across the region.', 3),
      ('entry-strategy', 'Land marquee local logos', '<p>By the time <a href="http://monday.com">monday.com</a> opened its official APAC headquarters, its Australian customer base of 13,000+ included Canva, Tourism Australia, Officeworks and Kmart, with enterprise wins later extending to Westpac, Qantas, Bunnings and Hitachi. Flagship local logos in tech, government-adjacent tourism and retail gave the brand mainstream credibility well beyond the startup ecosystem.</p>', 'By the time [monday.com](http://monday.com) opened its official APAC headquarters, its Australian customer base of 13,000+ included Canva, Tourism Australia, Officeworks and Kmart, with enterprise wins later extending to Westpac, Qantas, Bunnings and Hitachi. Flagship local logos in tech, government-adjacent tourism and retail gave the brand mainstream credibility well beyond the startup ecosystem.', 4),
      ('entry-strategy', 'Make the HQ a statement', '<p>On 1 March 2023, <a href="http://monday.com">monday.com</a> officially opened its APAC headquarters at 55 Market Street in Sydney''s CBD — more than 1,000 square metres, announced with an investor-relations press release and covered by TechCrunch. The office signalled permanence to enterprise buyers and gave the region hiring capacity: Australian headcount grew 76% year-on-year around the opening, with ANZ customer numbers up 122% year-on-year.</p>', 'On 1 March 2023, [monday.com](http://monday.com) officially opened its APAC headquarters at 55 Market Street in Sydney''s CBD — more than 1,000 square metres, announced with an investor-relations press release and covered by TechCrunch. The office signalled permanence to enterprise buyers and gave the region hiring capacity: Australian headcount grew 76% year-on-year around the opening, with ANZ customer numbers up 122% year-on-year.', 5),
      ('entry-strategy', 'Win the brand war', '<p><a href="http://monday.com">monday.com</a> invested heavily in brand marketing — a core part of its global GTM — and in Australia the results were measurable: the company rose from #6 to <strong>#1 brand in the work management category</strong> locally. Brand-led demand generation, layered on top of self-serve product adoption and an enterprise sales motion, delivered the region''s largest-ever deal: a $2.2M total-contract-value agreement, the biggest land deal in company history. The local operation also won recognition as an AFR Best Place to Work (2025), reinforcing the hiring flywheel.</p>', '[monday.com](http://monday.com) invested heavily in brand marketing — a core part of its global GTM — and in Australia the results were measurable: the company rose from #6 to **#1 brand in the work management category** locally. Brand-led demand generation, layered on top of self-serve product adoption and an enterprise sales motion, delivered the region''s largest-ever deal: a \$2.2M total-contract-value agreement, the biggest land deal in company history. The local operation also won recognition as an AFR Best Place to Work (2025), reinforcing the hiring flywheel.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Counter-cyclical timing.</strong> Launching mid-COVID captured the remote-work demand spike while rivals paused.</li>
<li><strong>Regional structure with a local anchor.</strong> One APJ build across four offices compounded faster than four separate country plays.</li>
<li><strong>Brand as GTM.</strong> Sustained brand investment moved <a href="http://monday.com">monday.com</a> from #6 to #1 locally and fed both self-serve and enterprise pipelines.</li>
<li><strong>Visible commitment.</strong> A 1,000+ sqm CBD headquarters and marquee logos converted momentum into enterprise trust.</li>
</ul>', '- **Counter-cyclical timing.** Launching mid-COVID captured the remote-work demand spike while rivals paused.
- **Regional structure with a local anchor.** One APJ build across four offices compounded faster than four separate country plays.
- **Brand as GTM.** Sustained brand investment moved [monday.com](http://monday.com) from #6 to #1 locally and fed both self-serve and enterprise pipelines.
- **Visible commitment.** A 1,000+ sqm CBD headquarters and marquee logos converted momentum into enterprise trust.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>June 2020: Australian launch; 1 March 2023: APAC HQ opens at 55 Market St, Sydney (1,000+ sqm)</li>
<li>Regional ARR: <strong>$7M (2020) to $120M+ (2025)</strong></li>
<li><strong>13,000+ Australian customers</strong> at HQ opening, incl. Canva, Tourism Australia, Officeworks, Kmart</li>
<li>July 2023: <strong>AWS Sydney data region</strong> launches — <a href="http://monday.com">monday.com</a>''s first in APAC — serving 18,000+ AU customers</li>
<li>ANZ customers <strong>+122% YoY</strong>; Australian headcount <strong>+76% YoY</strong>; AU revenue growth ~50% vs 68% globally</li>
<li>Brand rank in category: <strong>#6 to #1</strong>; largest land deal in company history: <strong>$2.2M TCV</strong>; AFR Best Place to Work 2025</li>
</ul>', '- June 2020: Australian launch; 1 March 2023: APAC HQ opens at 55 Market St, Sydney (1,000+ sqm)
- Regional ARR: **\$7M (2020) to \$120M+ (2025)**
- **13,000+ Australian customers** at HQ opening, incl. Canva, Tourism Australia, Officeworks, Kmart
- July 2023: **AWS Sydney data region** launches — [monday.com](http://monday.com)''s first in APAC — serving 18,000+ AU customers
- ANZ customers **+122% YoY**; Australian headcount **+76% YoY**; AU revenue growth \~50% vs 68% globally
- Brand rank in category: **#6 to #1**; largest land deal in company history: **\$2.2M TCV**; AFR Best Place to Work 2025', 8),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>A crisis can be the best entry window — if the disruption accelerates your category, enter while competitors wait.</li>
<li>Hire a regional builder with a multi-market mandate rather than a single-country manager; the economics compound.</li>
<li>Brand investment is a market-entry weapon in SaaS, not a luxury — category brand rank translated directly into pipeline.</li>
<li>Sequence: remote launch to capture demand, then a statement HQ to convert enterprise trust. Physical presence can follow traction.</li>
</ol>', '1. A crisis can be the best entry window — if the disruption accelerates your category, enter while competitors wait.
2. Hire a regional builder with a multi-market mandate rather than a single-country manager; the economics compound.
3. Brand investment is a market-entry weapon in SaaS, not a luxury — category brand rank translated directly into pipeline.
4. Sequence: remote launch to capture demand, then a statement HQ to convert enterprise trust. Physical presence can follow traction.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-monday-com-scaled-australia-remotely-before-landing-onshore' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 5 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-monday-com-scaled-australia-remotely-before-landing-onshore' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-zendesk-made-melbourne-its-asia-pacific-launchpad (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-zendesk-made-melbourne-its-asia-pacific-launchpad' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-zendesk-made-melbourne-its-asia-pacific-launchpad' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-zendesk-made-melbourne-its-asia-pacific-launchpad' AND status = 'draft' AND content_type = 'case_study'), '<p>In September 2011, Zendesk arrived in Melbourne with a team of five and an ambition that went well beyond sales coverage. Within seven years, the Australian operation had beaten San Francisco and Dublin in an internal contest to host one of the company''s most strategic engineering hubs — making Melbourne not just a regional beachhead, but part of Zendesk''s global product engine.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Zendesk</td>
</tr>
<tr>
<td>Origin</td>
<td>Denmark (founded Copenhagen, 2007); HQ San Francisco</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — customer service and support software</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — APAC regional HQ plus a local product development centre</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Melbourne became a global engineering hub; Zendesk was acquired for $10.2B in 2022</td>
</tr>
</table>', 'In September 2011, Zendesk arrived in Melbourne with a team of five and an ambition that went well beyond sales coverage. Within seven years, the Australian operation had beaten San Francisco and Dublin in an internal contest to host one of the company''s most strategic engineering hubs — making Melbourne not just a regional beachhead, but part of Zendesk''s global product engine.
<table header-column="true">
<tr>
<td>Company</td>
<td>Zendesk</td>
</tr>
<tr>
<td>Origin</td>
<td>Denmark (founded Copenhagen, 2007); HQ San Francisco</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — customer service and support software</td>
</tr>
<tr>
<td>Entry year</td>
<td>2011</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — APAC regional HQ plus a local product development centre</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Melbourne became a global engineering hub; Zendesk was acquired for \$10.2B in 2022</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-zendesk-made-melbourne-its-asia-pacific-launchpad' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Zendesk was founded in Copenhagen in 2007 and relocated its headquarters to San Francisco as it scaled. By 2011 it was one of the fastest-growing SaaS companies in the world, and Australia was already generating meaningful organic demand: Australian businesses were early, enthusiastic adopters of cloud software, and the ANZ market offered English-language customers in a timezone that could anchor an entire Asia-Pacific operation. Rather than servicing that demand remotely from California, Zendesk made Australia its first major commitment outside the US and Europe.</p>', 'Zendesk was founded in Copenhagen in 2007 and relocated its headquarters to San Francisco as it scaled. By 2011 it was one of the fastest-growing SaaS companies in the world, and Australia was already generating meaningful organic demand: Australian businesses were early, enthusiastic adopters of cloud software, and the ANZ market offered English-language customers in a timezone that could anchor an entire Asia-Pacific operation.
Rather than servicing that demand remotely from California, Zendesk made Australia its first major commitment outside the US and Europe.', 1),
      ('entry-strategy', 'A regional HQ, not a sales outpost', '<p>In September 2011 Zendesk opened its Asia-Pacific headquarters at Level 1, 482 Bourke Street, Melbourne, with an initial team of five and plans to double headcount by year end. Positioning the office as the APAC headquarters — rather than an "Australian sales office" — mattered: it gave the local team a regional mandate, budget and seniority from day one. The office was led by Michael Folmer Hansen — Zendesk''s first-ever employee — who took the role of vice president and managing director for Asia-Pacific, giving the new market a leader with founder-level product knowledge and a direct line to HQ. And Zendesk wasn''t starting cold: at launch it already had about 1,200 APAC customers — roughly 700 in Australia and 200 in New Zealand — including Lonely Planet, REA Group and New Zealand Post.</p>', 'In September 2011 Zendesk opened its Asia-Pacific headquarters at Level 1, 482 Bourke Street, Melbourne, with an initial team of five and plans to double headcount by year end. Positioning the office as the APAC headquarters — rather than an "Australian sales office" — mattered: it gave the local team a regional mandate, budget and seniority from day one. The office was led by Michael Folmer Hansen — Zendesk''s first-ever employee — who took the role of vice president and managing director for Asia-Pacific, giving the new market a leader with founder-level product knowledge and a direct line to HQ. And Zendesk wasn''t starting cold: at launch it already had about 1,200 APAC customers — roughly 700 in Australia and 200 in New Zealand — including Lonely Planet, REA Group and New Zealand Post.', 2),
      ('entry-strategy', 'Product development from day one', '<p>The same month, Zendesk announced an Australian Development Centre in Melbourne, committing to hire around 20 developers by September 2013. This was the tactical masterstroke of the entry: by building product locally rather than just selling locally, Zendesk tapped Melbourne''s engineering talent pool, gave the office strategic weight inside the company, and made the Australian operation progressively harder to deprioritise or shut down.</p>', 'The same month, Zendesk announced an Australian Development Centre in Melbourne, committing to hire around 20 developers by September 2013. This was the tactical masterstroke of the entry: by building product locally rather than just selling locally, Zendesk tapped Melbourne''s engineering talent pool, gave the office strategic weight inside the company, and made the Australian operation progressively harder to deprioritise or shut down.', 3),
      ('entry-strategy', 'Partnering with the Victorian Government', '<p>Zendesk worked closely with the Victorian Government as it scaled. When the company moved into a much larger office at 395 Collins Street in November 2015 — with capacity for 200 staff against a local team of about 70 at the time — the opening featured Victoria''s Minister for Small Business, Innovation and Trade, Philip Dalidakis, and a formal partnership with the state government. CEO and co-founder Mikkel Svane publicly credited Melbourne''s technology talent as the reason for the commitment. Government partnership delivered credibility, talent-pipeline support and expansion assistance that money couldn''t easily buy.</p>', 'Zendesk worked closely with the Victorian Government as it scaled. When the company moved into a much larger office at 395 Collins Street in November 2015 — with capacity for 200 staff against a local team of about 70 at the time — the opening featured Victoria''s Minister for Small Business, Innovation and Trade, Philip Dalidakis, and a formal partnership with the state government. CEO and co-founder Mikkel Svane publicly credited Melbourne''s technology talent as the reason for the commitment. Government partnership delivered credibility, talent-pipeline support and expansion assistance that money couldn''t easily buy.', 4),
      ('entry-strategy', 'Build a senior local bench early', '<p>Zendesk staffed the region with senior operators quickly: in July 2013 it appointed Amy Foo as APAC finance director (covering finance and HR) and Daniel Scheltinga as APAC support and services director, running support teams across Melbourne, Tokyo and Manila, while returned-expat engineer Jason Smale led APAC engineering. By late 2013 the business was adding about 10 new Australian customers a day — growth driven almost entirely by word-of-mouth referrals and self-serve trials converting to paid.</p>', 'Zendesk staffed the region with senior operators quickly: in July 2013 it appointed Amy Foo as APAC finance director (covering finance and HR) and Daniel Scheltinga as APAC support and services director, running support teams across Melbourne, Tokyo and Manila, while returned-expat engineer Jason Smale led APAC engineering. By late 2013 the business was adding about 10 new Australian customers a day — growth driven almost entirely by word-of-mouth referrals and self-serve trials converting to paid.', 5),
      ('entry-strategy', 'Winning internal investment', '<p>In 2018 the strategy compounded: Melbourne was selected — over San Francisco and Dublin — as the site of Zendesk''s Platform Development Centre, creating 72 new engineering jobs over three years, a win documented by Invest Victoria as a flagship foreign-investment case study.</p>', 'In 2018 the strategy compounded: Melbourne was selected — over San Francisco and Dublin — as the site of Zendesk''s Platform Development Centre, creating 72 new engineering jobs over three years, a win documented by Invest Victoria as a flagship foreign-investment case study.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Regional mandate from day one.</strong> The Melbourne office owned APAC, not just Australia, which justified senior hires and real investment early.</li>
<li><strong>Engineering, not just sales.</strong> Building product locally anchored the operation and created a virtuous cycle of internal investment.</li>
<li><strong>Government as a growth partner.</strong> The Victorian Government relationship supported each expansion phase and generated sustained local goodwill and press.</li>
<li><strong>Riding organic demand.</strong> Australian businesses were already adopting Zendesk; the local presence converted grassroots adoption into enterprise relationships.</li>
</ul>', '- **Regional mandate from day one.** The Melbourne office owned APAC, not just Australia, which justified senior hires and real investment early.
- **Engineering, not just sales.** Building product locally anchored the operation and created a virtuous cycle of internal investment.
- **Government as a growth partner.** The Victorian Government relationship supported each expansion phase and generated sustained local goodwill and press.
- **Riding organic demand.** Australian businesses were already adopting Zendesk; the local presence converted grassroots adoption into enterprise relationships.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>2011: APAC HQ opens with a team of <strong>5</strong>; Australian Development Centre announced with ~20 developer roles committed by 2013</li>
<li>2011 launch: about <strong>1,200 APAC customers</strong> — roughly 700 AU and 200 NZ — incl. Lonely Planet, REA Group, New Zealand Post</li>
<li>2013: about <strong>10 new Australian customers a day</strong>, largely word-of-mouth; ANZ customer base reaches <strong>3,500</strong> by 2015</li>
<li>2015: local team of ~<strong>70</strong>, new 395 Collins Street office with capacity for <strong>200</strong></li>
<li>2018: Platform Development Centre creates <strong>72 engineering jobs</strong> over three years — won against San Francisco and Dublin</li>
<li>2022: Zendesk acquired by Hellman &amp; Friedman and Permira for <strong>$10.2B</strong></li>
<li>2024: Zendesk Pty Ltd generates <strong>A$133M</strong> in local revenue with <strong>346 employees</strong></li>
</ul>', '- 2011: APAC HQ opens with a team of **5**; Australian Development Centre announced with \~20 developer roles committed by 2013
- 2011 launch: about **1,200 APAC customers** — roughly 700 AU and 200 NZ — incl. Lonely Planet, REA Group, New Zealand Post
- 2013: about **10 new Australian customers a day**, largely word-of-mouth; ANZ customer base reaches **3,500** by 2015
- 2015: local team of \~**70**, new 395 Collins Street office with capacity for **200**
- 2018: Platform Development Centre creates **72 engineering jobs** over three years — won against San Francisco and Dublin
- 2022: Zendesk acquired by Hellman & Friedman and Permira for **\$10.2B**
- 2024: Zendesk Pty Ltd generates **A\$133M** in local revenue with **346 employees**', 8),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>Give the first local office a regional mandate — an "APAC HQ" attracts better talent and bigger budgets than a "country sales office".</li>
<li>Put product development in-market early. Engineering roots make a local operation strategically indispensable to HQ.</li>
<li>Treat state governments as genuine partners: talent pipelines, expansion support and credibility all flow from the relationship.</li>
<li>Start small and compound. Five people in 2011 became a global product hub by 2018 because each phase earned the next.</li>
</ol>', '1. Give the first local office a regional mandate — an "APAC HQ" attracts better talent and bigger budgets than a "country sales office".
2. Put product development in-market early. Engineering roots make a local operation strategically indispensable to HQ.
3. Treat state governments as genuine partners: talent pipelines, expansion support and credibility all flow from the relationship.
4. Start small and compound. Five people in 2011 became a global product hub by 2018 because each phase earned the next.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-zendesk-made-melbourne-its-asia-pacific-launchpad' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 5 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-zendesk-made-melbourne-its-asia-pacific-launchpad' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-hubspot-grew-australia-using-its-own-inbound-playbook (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-hubspot-grew-australia-using-its-own-inbound-playbook' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-hubspot-grew-australia-using-its-own-inbound-playbook' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-hubspot-grew-australia-using-its-own-inbound-playbook' AND status = 'draft' AND content_type = 'case_study'), '<p>When HubSpot chose the location for its first office outside the US and Ireland, it didn''t pick London, Singapore or Tokyo. It picked Sydney. In Q3 2014, seven people in a single serviced-office room at 1 O''Connell Street became HubSpot''s Asia-Pacific base — and within a year the team had outgrown four rooms.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>HubSpot</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (Cambridge, Massachusetts)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — inbound marketing, sales and CRM software</td>
</tr>
<tr>
<td>Entry year</td>
<td>2014</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — lean serviced-office launch, scaled with a partner-agency channel</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Sydney became HubSpot''s APAC anchor covering AU, NZ, Japan and Singapore</td>
</tr>
</table>', 'When HubSpot chose the location for its first office outside the US and Ireland, it didn''t pick London, Singapore or Tokyo. It picked Sydney. In Q3 2014, seven people in a single serviced-office room at 1 O''Connell Street became HubSpot''s Asia-Pacific base — and within a year the team had outgrown four rooms.
<table header-column="true">
<tr>
<td>Company</td>
<td>HubSpot</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (Cambridge, Massachusetts)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — inbound marketing, sales and CRM software</td>
</tr>
<tr>
<td>Entry year</td>
<td>2014</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — lean serviced-office launch, scaled with a partner-agency channel</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Sydney became HubSpot''s APAC anchor covering AU, NZ, Japan and Singapore</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-hubspot-grew-australia-using-its-own-inbound-playbook' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>By 2014 HubSpot had built a category — "inbound marketing" — around the idea that businesses should attract customers with content rather than interrupt them with ads. The company had its Cambridge, Massachusetts headquarters and an international office in Dublin. For office number three, HubSpot announced in April 2014 that it would open in Sydney in Q3 2014 — its first Asia-Pacific location, chosen ahead of every other market in the region. The logic: Australia had a large, English-speaking base of small and mid-sized businesses, strong existing adoption of HubSpot''s software and methodology, and an active community of marketing agencies — the backbone of HubSpot''s partner-driven go-to-market.</p>', 'By 2014 HubSpot had built a category — "inbound marketing" — around the idea that businesses should attract customers with content rather than interrupt them with ads. The company had its Cambridge, Massachusetts headquarters and an international office in Dublin. For office number three, HubSpot announced in April 2014 that it would open in Sydney in Q3 2014 — its first Asia-Pacific location, chosen ahead of every other market in the region.
The logic: Australia had a large, English-speaking base of small and mid-sized businesses, strong existing adoption of HubSpot''s software and methodology, and an active community of marketing agencies — the backbone of HubSpot''s partner-driven go-to-market.', 1),
      ('entry-strategy', 'Start lean: seven people, one serviced office', '<p>HubSpot launched with an "initial seven" staff on level 19 of 1 O''Connell Street in Sydney''s CBD, using flexible serviced-office space from Compass Offices rather than signing a long lease. The lean footprint kept the risk low while the company validated demand — and the flexibility paid off immediately: the team expanded from one room to four separate spaces within its first year as headcount grew ahead of plan. By its first anniversary the Sydney team numbered 25 — a sales team that initially "flew solo", progressively backed by services and marketing functions, and seeded with experienced transfers from the Dublin office who carried HubSpot''s culture and playbook with them.</p>', 'HubSpot launched with an "initial seven" staff on level 19 of 1 O''Connell Street in Sydney''s CBD, using flexible serviced-office space from Compass Offices rather than signing a long lease. The lean footprint kept the risk low while the company validated demand — and the flexibility paid off immediately: the team expanded from one room to four separate spaces within its first year as headcount grew ahead of plan. By its first anniversary the Sydney team numbered 25 — a sales team that initially "flew solo", progressively backed by services and marketing functions, and seeded with experienced transfers from the Dublin office who carried HubSpot''s culture and playbook with them.', 2),
      ('entry-strategy', 'A regional remit from day one', '<p>The Sydney office wasn''t scoped as an Australian sales office. Under Jeetu Mahtani, HubSpot''s managing director of international operations, its remit covered Australia, New Zealand, Japan and Singapore — making Sydney the operational anchor for the entire region and justifying investment in sales, services and support roles locally.</p>', 'The Sydney office wasn''t scoped as an Australian sales office. Under Jeetu Mahtani, HubSpot''s managing director of international operations, its remit covered Australia, New Zealand, Japan and Singapore — making Sydney the operational anchor for the entire region and justifying investment in sales, services and support roles locally.', 3),
      ('entry-strategy', 'Partner-agency channel as the GTM engine', '<p>HubSpot''s international playbook leaned heavily on its agency partner program: local marketing agencies resell HubSpot, implement it for clients, and evangelise the inbound methodology. In Australia this meant HubSpot could scale reach through dozens of partner agencies without hiring a large direct salesforce — and the agencies themselves had strong incentives to grow the category. Existing Australian customers and partners had been asking for local presence, so the office opened into warm demand rather than cold territory.</p>', 'HubSpot''s international playbook leaned heavily on its agency partner program: local marketing agencies resell HubSpot, implement it for clients, and evangelise the inbound methodology. In Australia this meant HubSpot could scale reach through dozens of partner agencies without hiring a large direct salesforce — and the agencies themselves had strong incentives to grow the category. Existing Australian customers and partners had been asking for local presence, so the office opened into warm demand rather than cold territory.', 4),
      ('entry-strategy', 'Sell the methodology, not just the software', '<p>HubSpot''s content-led GTM — free tools, blogs, certifications and the inbound methodology itself — was already generating Australian leads before a single local hire. The Sydney office converted that inbound demand with local salespeople, local customer success and regional events.</p>', 'HubSpot''s content-led GTM — free tools, blogs, certifications and the inbound methodology itself — was already generating Australian leads before a single local hire. The Sydney office converted that inbound demand with local salespeople, local customer success and regional events.', 5),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Demand preceded presence.</strong> HubSpot entered to serve existing Australian customers and partners, not to create a market from scratch.</li>
<li><strong>Low-risk footprint, fast scaling.</strong> Serviced offices meant expansion was a phone call, not a property negotiation.</li>
<li><strong>Channel leverage.</strong> The partner-agency model multiplied local reach far beyond the initial seven hires.</li>
<li><strong>Regional mandate.</strong> Covering ANZ, Japan and Singapore from Sydney gave the office scale economics a single-country office wouldn''t have had.</li>
</ul>', '- **Demand preceded presence.** HubSpot entered to serve existing Australian customers and partners, not to create a market from scratch.
- **Low-risk footprint, fast scaling.** Serviced offices meant expansion was a phone call, not a property negotiation.
- **Channel leverage.** The partner-agency model multiplied local reach far beyond the initial seven hires.
- **Regional mandate.** Covering ANZ, Japan and Singapore from Sydney gave the office scale economics a single-country office wouldn''t have had.', 6),
      ('key-metrics', NULL::text, '<ul>
<li>April 2014: Sydney office announced — HubSpot''s <strong>third location worldwide</strong> and first in APAC</li>
<li>Q3 2014: opens with an <strong>initial team of seven</strong> at 1 O''Connell Street</li>
<li>Year one: expands from <strong>1 room to 4 spaces</strong>; headcount reaches <strong>25</strong>, spanning sales, services and marketing</li>
<li>Remit: Australia, New Zealand, Japan and Singapore</li>
</ul>', '- April 2014: Sydney office announced — HubSpot''s **third location worldwide** and first in APAC
- Q3 2014: opens with an **initial team of seven** at 1 O''Connell Street
- Year one: expands from **1 room to 4 spaces**; headcount reaches **25**, spanning sales, services and marketing
- Remit: Australia, New Zealand, Japan and Singapore', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>Follow your existing customers: entering a market where users are already asking for you dramatically de-risks the launch.</li>
<li>Use serviced/flexible office space for year one — the option value of instant expansion beats a prestigious lease.</li>
<li>A partner channel can outscale a direct salesforce in a new market, and partners carry your category evangelism for you.</li>
<li>Scope the first office regionally. Sydney-as-APAC-anchor created a far stronger business case than Sydney-as-Australia-office.</li>
</ol>', '1. Follow your existing customers: entering a market where users are already asking for you dramatically de-risks the launch.
2. Use serviced/flexible office space for year one — the option value of instant expansion beats a prestigious lease.
3. A partner channel can outscale a direct salesforce in a new market, and partners carry your category evangelism for you.
4. Scope the first office regionally. Sydney-as-APAC-anchor created a far stronger business case than Sydney-as-Australia-office.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-hubspot-grew-australia-using-its-own-inbound-playbook' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-hubspot-grew-australia-using-its-own-inbound-playbook' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-intercom-served-australia-product-first-presence-later (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-intercom-served-australia-product-first-presence-later' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-intercom-served-australia-product-first-presence-later' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-intercom-served-australia-product-first-presence-later' AND status = 'draft' AND content_type = 'case_study'), '<p>Intercom''s Australian entry inverted the standard playbook: no office, no country manager, no launch event. Instead, the Irish customer-messaging company hired a single remote support employee in Sydney in 2016, built a distributed APAC support team, and only opened a physical office in 2018 — after APAC customer numbers had already grown 900%.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Intercom (now Fin)</td>
</tr>
<tr>
<td>Origin</td>
<td>Ireland (founded Dublin; HQ San Francisco)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — customer messaging and AI customer service</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016 (first remote hire); 2018 (Sydney office)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Remote-first support team, then a direct office; later localised data hosting</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Sydney became Intercom''s fifth global office and APAC anchor</td>
</tr>
</table>', 'Intercom''s Australian entry inverted the standard playbook: no office, no country manager, no launch event. Instead, the Irish customer-messaging company hired a single remote support employee in Sydney in 2016, built a distributed APAC support team, and only opened a physical office in 2018 — after APAC customer numbers had already grown 900%.
<table header-column="true">
<tr>
<td>Company</td>
<td>Intercom (now Fin)</td>
</tr>
<tr>
<td>Origin</td>
<td>Ireland (founded Dublin; HQ San Francisco)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — customer messaging and AI customer service</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016 (first remote hire); 2018 (Sydney office)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Remote-first support team, then a direct office; later localised data hosting</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — Sydney became Intercom''s fifth global office and APAC anchor</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-intercom-served-australia-product-first-presence-later' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Intercom, founded by four Irish engineers and headquartered in San Francisco, sells customer messaging software — the chat widget and support platform used by thousands of internet businesses. Like Slack, its adoption was heavily product-led: startups and scale-ups worldwide installed Intercom without ever speaking to a salesperson. By the mid-2010s, Asia-Pacific customers were multiplying, and they shared a common complaint: support responses arrived on San Francisco time.</p>', 'Intercom, founded by four Irish engineers and headquartered in San Francisco, sells customer messaging software — the chat widget and support platform used by thousands of internet businesses. Like Slack, its adoption was heavily product-led: startups and scale-ups worldwide installed Intercom without ever speaking to a salesperson. By the mid-2010s, Asia-Pacific customers were multiplying, and they shared a common complaint: support responses arrived on San Francisco time.', 1),
      ('entry-strategy', 'Hire people, not offices', '<p>Intercom''s first Australian presence was a single remote customer support engineer hired in Sydney in 2016. From there it built a distributed APAC support team of roughly 20 people across four countries — solving the timezone problem years before committing to real estate. The approach cost a fraction of a traditional country launch and generated direct, daily contact with the region''s customers.</p>', 'Intercom''s first Australian presence was a single remote customer support engineer hired in Sydney in 2016. From there it built a distributed APAC support team of roughly 20 people across four countries — solving the timezone problem years before committing to real estate. The approach cost a fraction of a traditional country launch and generated direct, daily contact with the region''s customers.', 2),
      ('entry-strategy', 'Open the office only when the data demands it', '<p>By 2018, APAC customer numbers had grown about <strong>900%</strong>, and the region accounted for roughly 10–12% of Intercom''s revenue. Only then did Intercom open a physical office — in Surry Hills, Sydney, in July 2018, its <strong>fifth office globally</strong> and, as the company noted, 12,000 km from its San Francisco headquarters. The office consolidated the remote team and added customer-facing roles, growing to 30+ customer-facing staff.</p>', 'By 2018, APAC customer numbers had grown about **900%**, and the region accounted for roughly 10–12% of Intercom''s revenue. Only then did Intercom open a physical office — in Surry Hills, Sydney, in July 2018, its **fifth office globally** and, as the company noted, 12,000 km from its San Francisco headquarters. The office consolidated the remote team and added customer-facing roles, growing to 30+ customer-facing staff.', 3),
      ('entry-strategy', 'Localise the product for regulated buyers', '<p>The second wave of the strategy targeted Australia''s compliance-sensitive mid-market and enterprise. On 3 May 2022, Intercom launched <strong>Australian data hosting</strong>, letting customers keep their data onshore — announced with then-CEO Karen Peacock and validated by marquee Australian customers including Atlassian, Appliances Online and Sidekicker. Data residency converted a whole segment of buyers for whom offshore hosting had been a dealbreaker.</p>', 'The second wave of the strategy targeted Australia''s compliance-sensitive mid-market and enterprise. On 3 May 2022, Intercom launched **Australian data hosting**, letting customers keep their data onshore — announced with then-CEO Karen Peacock and validated by marquee Australian customers including Atlassian, Appliances Online and Sidekicker. Data residency converted a whole segment of buyers for whom offshore hosting had been a dealbreaker.', 4),
      ('entry-strategy', 'Keep compounding', '<p>The company (renamed Fin in 2026, now at $400M+ ARR) still lists its Sydney office at 285A Crown Street, Surry Hills — a decade-long presence built from one remote hire.</p>', 'The company (renamed Fin in 2026, now at \$400M+ ARR) still lists its Sydney office at 285A Crown Street, Surry Hills — a decade-long presence built from one remote hire.', 5),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Cheapest possible validation.</strong> Remote support hires proved regional demand without any fixed-cost commitment.</li>
<li><strong>Timezone service as the wedge.</strong> Solving support latency was more valuable to APAC customers than local sales coverage.</li>
<li><strong>Data thresholds, not gut feel.</strong> The office opened when customer growth (+900%) and revenue share (~10–12%) justified it.</li>
<li><strong>Localisation unlocked the enterprise.</strong> Australian data hosting turned compliance objections into wins — with Atlassian as the proof point.</li>
</ul>', '- **Cheapest possible validation.** Remote support hires proved regional demand without any fixed-cost commitment.
- **Timezone service as the wedge.** Solving support latency was more valuable to APAC customers than local sales coverage.
- **Data thresholds, not gut feel.** The office opened when customer growth (+900%) and revenue share (\~10–12%) justified it.
- **Localisation unlocked the enterprise.** Australian data hosting turned compliance objections into wins — with Atlassian as the proof point.', 6),
      ('key-metrics', NULL::text, '<ul>
<li>2016: first Sydney remote hire; APAC support team grows to ~20 across 4 countries</li>
<li>APAC customers <strong>+900%</strong>; region reaches ~<strong>10–12% of revenue</strong> by 2018</li>
<li>July 2018: Surry Hills office opens — Intercom''s <strong>fifth globally</strong>; 30+ customer-facing Sydney staff</li>
<li>May 2022: Australian data hosting launches; local customers include <strong>Atlassian</strong>, Appliances Online, Sidekicker</li>
<li>2026: rebranded Fin; <strong>$400M+ ARR</strong> globally</li>
<li>March 2026: <strong>$250M debt raise</strong>; 650 new hires planned globally across six offices, including Sydney</li>
</ul>', '- 2016: first Sydney remote hire; APAC support team grows to \~20 across 4 countries
- APAC customers **+900%**; region reaches \~**10–12% of revenue** by 2018
- July 2018: Surry Hills office opens — Intercom''s **fifth globally**; 30+ customer-facing Sydney staff
- May 2022: Australian data hosting launches; local customers include **Atlassian**, Appliances Online, Sidekicker
- 2026: rebranded Fin; **\$400M+ ARR** globally
- March 2026: **\$250M debt raise**; 650 new hires planned globally across six offices, including Sydney', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>Remote hires are the lowest-risk market entry instrument in SaaS — validate demand with people before property.</li>
<li>Enter through service quality. Timezone-local support is a differentiator customers feel every day.</li>
<li>Set explicit data thresholds for each escalation of commitment (hires, office, localisation) and hold to them.</li>
<li>Data residency is a genuine GTM unlock in Australia — compliance features open segments marketing can''t reach.</li>
</ol>', '1. Remote hires are the lowest-risk market entry instrument in SaaS — validate demand with people before property.
2. Enter through service quality. Timezone-local support is a differentiator customers feel every day.
3. Set explicit data thresholds for each escalation of commitment (hires, office, localisation) and hold to them.
4. Data residency is a genuine GTM unlock in Australia — compliance features open segments marketing can''t reach.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-intercom-served-australia-product-first-presence-later' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 3 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-intercom-served-australia-product-first-presence-later' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-intuit-quickbooks-took-the-fight-to-xero-in-australia (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia' AND status = 'draft' AND content_type = 'case_study'), '<p>Intuit entered Australia the low-risk way: license the QuickBooks brand to a scrappy local distributor and collect royalties. For nearly two decades it worked — until the cloud arrived, the partnership collapsed, and Intuit had to re-enter its "own" market from scratch. By then a New Zealand startup called Xero had taken the country, and QuickBooks has been chasing it ever since.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Intuit (QuickBooks)</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (Mountain View, California)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — small business accounting software</td>
</tr>
<tr>
<td>Entry year</td>
<td>1993–94 (via Reckon licence); ~2012 (direct re-entry)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Brand licensing to a local distributor, then direct re-entry with QuickBooks Online</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure to win — outflanked by Xero; a distant third in its core market</td>
</tr>
</table>', 'Intuit entered Australia the low-risk way: license the QuickBooks brand to a scrappy local distributor and collect royalties. For nearly two decades it worked — until the cloud arrived, the partnership collapsed, and Intuit had to re-enter its "own" market from scratch. By then a New Zealand startup called Xero had taken the country, and QuickBooks has been chasing it ever since.
<table header-column="true">
<tr>
<td>Company</td>
<td>Intuit (QuickBooks)</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (Mountain View, California)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — small business accounting software</td>
</tr>
<tr>
<td>Entry year</td>
<td>1993–94 (via Reckon licence); \~2012 (direct re-entry)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Brand licensing to a local distributor, then direct re-entry with QuickBooks Online</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure to win — outflanked by Xero; a distant third in its core market</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('What went wrong', 'what-went-wrong', 2),
      ('Why it failed', 'why-it-failed', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>In the early 1990s, Intuit''s QuickBooks was becoming the default small-business accounting software in the United States. For Australia, Intuit chose an arms-length entry: it licensed the QuickBooks brand and products to <strong>Reckon</strong>, a local distributor founded in 1987 by Greg Wilkinson — famously started with $2,000 on a credit card. From 1993–94, Reckon built the QuickBooks business in Australia: localising the product for Australian tax and payroll, building the accountant and retail channels, and growing it into one of the market''s leading SME accounting brands. The licensing model gave Intuit royalty income with minimal risk — and gave Reckon two decades of a world-class brand. But it also meant Intuit owned no customer relationships, no channel and no local capability in one of the world''s most attractive English-speaking SaaS markets.</p>', 'In the early 1990s, Intuit''s QuickBooks was becoming the default small-business accounting software in the United States. For Australia, Intuit chose an arms-length entry: it licensed the QuickBooks brand and products to **Reckon**, a local distributor founded in 1987 by Greg Wilkinson — famously started with \$2,000 on a credit card. From 1993–94, Reckon built the QuickBooks business in Australia: localising the product for Australian tax and payroll, building the accountant and retail channels, and growing it into one of the market''s leading SME accounting brands.
The licensing model gave Intuit royalty income with minimal risk — and gave Reckon two decades of a world-class brand. But it also meant Intuit owned no customer relationships, no channel and no local capability in one of the world''s most attractive English-speaking SaaS markets.', 1),
      ('what-went-wrong', 'The cloud broke the partnership', '<p>As cloud accounting emerged in the late 2000s, Intuit and Reckon''s ambitions diverged: Intuit wanted QuickBooks Online, its global cloud product, to win everywhere; Reckon had built its business on locally developed desktop software under the QuickBooks name. In 2012 the split was announced — Reckon would give up the QuickBooks brand (the licence formally terminated on 10 February 2014, with Reckon shares falling 9.7% on the news) and rebranded its products under its own name.</p>', 'As cloud accounting emerged in the late 2000s, Intuit and Reckon''s ambitions diverged: Intuit wanted QuickBooks Online, its global cloud product, to win everywhere; Reckon had built its business on locally developed desktop software under the QuickBooks name. In 2012 the split was announced — Reckon would give up the QuickBooks brand (the licence formally terminated on 10 February 2014, with Reckon shares falling 9.7% on the news) and rebranded its products under its own name.', 2),
      ('what-went-wrong', 'Re-entering your own market', '<p>Intuit re-entered Australia directly with QuickBooks Online in 2012, then spent 12 months quietly observing Australian businesses and localising the product before mounting a serious push. In August 2013 it appointed Brad Paterson — an Australian payments executive who had run PayPal''s APAC merchant services and Visa''s ANZ consumer products — as vice president and managing director for Asia-Pacific, based in Singapore, to lead the rebuild. It was effectively starting over: the first Australia-based employee was hired around mid-2014, local headcount reached about 30 within a year, and some 60 Sydney staff moved into a new CBD office in April 2015. The go-to-market centred on winning back accountants and bookkeepers through a business-development team that treated advisors as "partners, not a sales channel", backed by an aggressive marketing push from 2015 and the acquisition of an Australian startup. But two decades of licensing had produced brand recognition and zero owned infrastructure — new team, new accountant relationships, new brand-building for a name Australians associated with a product now owned by someone else.</p>', 'Intuit re-entered Australia directly with QuickBooks Online in 2012, then spent 12 months quietly observing Australian businesses and localising the product before mounting a serious push. In August 2013 it appointed Brad Paterson — an Australian payments executive who had run PayPal''s APAC merchant services and Visa''s ANZ consumer products — as vice president and managing director for Asia-Pacific, based in Singapore, to lead the rebuild. It was effectively starting over: the first Australia-based employee was hired around mid-2014, local headcount reached about 30 within a year, and some 60 Sydney staff moved into a new CBD office in April 2015. The go-to-market centred on winning back accountants and bookkeepers through a business-development team that treated advisors as "partners, not a sales channel", backed by an aggressive marketing push from 2015 and the acquisition of an Australian startup. But two decades of licensing had produced brand recognition and zero owned infrastructure — new team, new accountant relationships, new brand-building for a name Australians associated with a product now owned by someone else.', 3),
      ('what-went-wrong', 'Xero had already won the shift', '<p>While Intuit and Reckon were untangling their partnership, Xero — cloud-native, ANZ-born, and laser-focused on winning accountants and bookkeepers as its distribution channel — swept the Australian market. Xero built the advisor channel loyalty that QuickBooks once enjoyed in the US. Today Xero holds a dominant share of the Australian market (60%+ among advisors by some measures), with QuickBooks a distant third (~8% by click-share measures) behind MYOB.</p>', 'While Intuit and Reckon were untangling their partnership, Xero — cloud-native, ANZ-born, and laser-focused on winning accountants and bookkeepers as its distribution channel — swept the Australian market. Xero built the advisor channel loyalty that QuickBooks once enjoyed in the US. Today Xero holds a dominant share of the Australian market (60%+ among advisors by some measures), with QuickBooks a distant third (\~8% by click-share measures) behind MYOB.', 4),
      ('why-it-failed', NULL::text, '<ul>
<li><strong>Licensing traded the future for royalties.</strong> Intuit captured income but built no channel, customer base or local muscle — the assets that decide platform shifts.</li>
<li><strong>The partnership couldn''t survive a technology transition.</strong> Licensor and licensee had structurally opposed interests once the cloud arrived.</li>
<li><strong>Timing compounding.</strong> Intuit re-entered exactly as Xero was locking up the accountant channel — the single most important distribution asset in SME accounting.</li>
<li><strong>Brand confusion.</strong> Decades of "QuickBooks = Reckon''s desktop product" muddied Intuit''s cloud relaunch.</li>
</ul>', '- **Licensing traded the future for royalties.** Intuit captured income but built no channel, customer base or local muscle — the assets that decide platform shifts.
- **The partnership couldn''t survive a technology transition.** Licensor and licensee had structurally opposed interests once the cloud arrived.
- **Timing compounding.** Intuit re-entered exactly as Xero was locking up the accountant channel — the single most important distribution asset in SME accounting.
- **Brand confusion.** Decades of "QuickBooks = Reckon''s desktop product" muddied Intuit''s cloud relaunch.', 5),
      ('key-metrics', NULL::text, '<ul>
<li>1987: Reckon founded by Greg Wilkinson with <strong>$2,000</strong>; 1993–94: QuickBooks licence begins</li>
<li>2012: split announced; licence formally ends <strong>10 February 2014</strong>; Reckon shares fall <strong>9.7%</strong></li>
<li>2012: Intuit re-enters directly with QuickBooks Online; August 2013: Brad Paterson appointed VP &amp; MD Asia-Pacific</li>
<li>~2014: first Australia-based employee hired; ~<strong>30 AU staff</strong> within a year; <strong>60 Sydney employees</strong> move into new CBD office (April 2015)</li>
<li>Today: Xero holds <strong>60%+ advisor share</strong> in Australia; QuickBooks a distant third (<strong>~8%</strong> click share)</li>
</ul>', '- 1987: Reckon founded by Greg Wilkinson with **\$2,000**; 1993–94: QuickBooks licence begins
- 2012: split announced; licence formally ends **10 February 2014**; Reckon shares fall **9.7%**
- 2012: Intuit re-enters directly with QuickBooks Online; August 2013: Brad Paterson appointed VP & MD Asia-Pacific
- \~2014: first Australia-based employee hired; \~**30 AU staff** within a year; **60 Sydney employees** move into new CBD office (April 2015)
- Today: Xero holds **60%+ advisor share** in Australia; QuickBooks a distant third (**\~8%** click share)', 6),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>Licensing is a fast, low-risk entry — and a slow, expensive exit. You rent revenue but never own the market.</li>
<li>Partnerships rarely survive platform shifts; when the technology changes, licensor and licensee interests diverge fast.</li>
<li>In channel-driven categories, whoever owns the advisor/partner channel owns the market — Xero won Australia by winning accountants, not end users.</li>
<li>Re-entry is harder than entry: you carry brand baggage, face an entrenched winner, and start behind challengers you once outranked.</li>
</ol>', '1. Licensing is a fast, low-risk entry — and a slow, expensive exit. You rent revenue but never own the market.
2. Partnerships rarely survive platform shifts; when the technology changes, licensor and licensee interests diverge fast.
3. In channel-driven categories, whoever owns the advisor/partner channel owns the market — Xero won Australia by winning accountants, not end users.
4. Re-entry is harder than entry: you carry brand baggage, face an entrenched winner, and start behind challengers you once outranked.', 7)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-rippling-localised-payroll-to-enter-compliance-heavy-australia (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia' AND status = 'draft' AND content_type = 'case_study'), '<p>When Rippling — the $11.25B US workforce-management platform — announced Sydney as its APAC headquarters in February 2024, it wasn''t entering an empty market. It was landing directly on the turf of Employment Hero, an Australian unicorn claiming more than 20% of the country''s private-sector businesses. What followed is one of the most openly hostile incumbent-vs-entrant battles in Australian SaaS.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Rippling</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (San Francisco)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — HR, payroll, IT and workforce management</td>
</tr>
<tr>
<td>Entry year</td>
<td>2024</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — APAC HQ in Sydney, localised payroll product for Australian employers</td>
</tr>
<tr>
<td>Outcome</td>
<td>Ongoing — contested entry against an entrenched local incumbent</td>
</tr>
</table>', 'When Rippling — the \$11.25B US workforce-management platform — announced Sydney as its APAC headquarters in February 2024, it wasn''t entering an empty market. It was landing directly on the turf of Employment Hero, an Australian unicorn claiming more than 20% of the country''s private-sector businesses. What followed is one of the most openly hostile incumbent-vs-entrant battles in Australian SaaS.
<table header-column="true">
<tr>
<td>Company</td>
<td>Rippling</td>
</tr>
<tr>
<td>Origin</td>
<td>United States (San Francisco)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — HR, payroll, IT and workforce management</td>
</tr>
<tr>
<td>Entry year</td>
<td>2024</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — APAC HQ in Sydney, localised payroll product for Australian employers</td>
</tr>
<tr>
<td>Outcome</td>
<td>Ongoing — contested entry against an entrenched local incumbent</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it''s contested', 'why-it-s-contested', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Rippling, founded by Parker Conrad, built one of the fastest-growing platforms in B2B software by unifying HR, payroll, IT and device management into a single employee-record system. By early 2024 it had around 15,000 customers globally and a $11.25B valuation. Australia was a logical expansion market: English-speaking, SME-dense, high SaaS adoption — but also home to a formidable local incumbent, Employment Hero, plus established players in payroll and HR.</p>', 'Rippling, founded by Parker Conrad, built one of the fastest-growing platforms in B2B software by unifying HR, payroll, IT and device management into a single employee-record system. By early 2024 it had around 15,000 customers globally and a \$11.25B valuation. Australia was a logical expansion market: English-speaking, SME-dense, high SaaS adoption — but also home to a formidable local incumbent, Employment Hero, plus established players in payroll and HR.', 1),
      ('entry-strategy', 'An APAC HQ with product localisation', '<p>Rippling announced its Sydney APAC headquarters on 12 February 2024, launching a payroll product built for Australian employers — not a thin re-skin of its US offering. Payroll is brutally jurisdiction-specific (awards, superannuation, leave loading), so genuine localisation was table stakes for credibility, and Rippling led its launch messaging with it.</p>', 'Rippling announced its Sydney APAC headquarters on 12 February 2024, launching a payroll product built for Australian employers — not a thin re-skin of its US offering. Payroll is brutally jurisdiction-specific (awards, superannuation, leave loading), so genuine localisation was table stakes for credibility, and Rippling led its launch messaging with it.', 2),
      ('entry-strategy', 'Team and investment upfront', '<p>Rippling hired its regional leader seven months before launch: Matt Loop joined in July 2023 as VP and Head of Asia. Loop was a deliberate "been there" hire — he had opened Salesforce''s first Australian office from his Bondi apartment, helped scale LinkedIn across Asia, and led Slack''s 200-plus-person APAC business through COVID. The company then launched with around 30 people in its Sydney office at 135 King Street and committed millions of dollars to the APAC business — signalling to customers and the market that Australia was a build, not an experiment. The Sydney office was scoped as the regional headquarters, giving the local operation an expansion mandate beyond Australia.</p>', 'Rippling hired its regional leader seven months before launch: Matt Loop joined in July 2023 as VP and Head of Asia. Loop was a deliberate "been there" hire — he had opened Salesforce''s first Australian office from his Bondi apartment, helped scale LinkedIn across Asia, and led Slack''s 200-plus-person APAC business through COVID. The company then launched with around 30 people in its Sydney office at 135 King Street and committed millions of dollars to the APAC business — signalling to customers and the market that Australia was a build, not an experiment. The Sydney office was scoped as the regional headquarters, giving the local operation an expansion mandate beyond Australia.', 3),
      ('entry-strategy', 'Global platform vs local specialist', '<p>Rippling''s GTM pitch against local incumbents: one unified platform for HR, payroll, IT and spend, versus point solutions — aimed at Australian companies with global workforces and at SMEs consolidating tooling. Its US brand, capital and engineering depth are its weapons; the incumbents'' local relationships, compliance track record and installed base are theirs. And Rippling didn''t launch cold: it already had Australian customers on the books — construction-software startup SiteMate, hospitality platform Liven and med-tech Omniscient Neurotechnology — alongside global customers such as Notion, Anduril and Anthropic with Australian employees to pay.</p>', 'Rippling''s GTM pitch against local incumbents: one unified platform for HR, payroll, IT and spend, versus point solutions — aimed at Australian companies with global workforces and at SMEs consolidating tooling. Its US brand, capital and engineering depth are its weapons; the incumbents'' local relationships, compliance track record and installed base are theirs. And Rippling didn''t launch cold: it already had Australian customers on the books — construction-software startup SiteMate, hospitality platform Liven and med-tech Omniscient Neurotechnology — alongside global customers such as Notion, Anduril and Anthropic with Australian employees to pay.', 4),
      ('entry-strategy', 'Entering hostile territory', '<p>The entry triggered an aggressive incumbent response: former Employment Hero staff later alleged the local unicorn ran unorthodox, "aggressive intelligence gathering" on Rippling as it prepared its Australian launch (reported by Capital Brief in March 2025). Whatever the truth of the claims, the episode illustrates a reality of entering concentrated markets: a well-resourced incumbent will fight, and the entrant''s plans may be studied closely before day one.</p>', 'The entry triggered an aggressive incumbent response: former Employment Hero staff later alleged the local unicorn ran unorthodox, "aggressive intelligence gathering" on Rippling as it prepared its Australian launch (reported by Capital Brief in March 2025). Whatever the truth of the claims, the episode illustrates a reality of entering concentrated markets: a well-resourced incumbent will fight, and the entrant''s plans may be studied closely before day one.', 5),
      ('why-it-s-contested', NULL::text, '<ul>
<li><strong>The incumbent is genuinely strong.</strong> Employment Hero claims 300,000+ businesses — distribution Rippling cannot quickly replicate.</li>
<li><strong>Payroll switching costs are high.</strong> Ripping out a payroll system mid-year is painful, slowing displacement sales.</li>
<li><strong>But the platform pitch is real.</strong> For multinationals and consolidators, Rippling''s unified system is a differentiated wedge no local player fully matches.</li>
</ul>', '- **The incumbent is genuinely strong.** Employment Hero claims 300,000+ businesses — distribution Rippling cannot quickly replicate.
- **Payroll switching costs are high.** Ripping out a payroll system mid-year is painful, slowing displacement sales.
- **But the platform pitch is real.** For multinationals and consolidators, Rippling''s unified system is a differentiated wedge no local player fully matches.', 6),
      ('key-metrics', NULL::text, '<ul>
<li>12 February 2024: Sydney APAC HQ announced; localised Australian payroll launched</li>
<li>~<strong>30 staff</strong> in Sydney at launch; <strong>millions</strong> committed to APAC investment</li>
<li>Rippling globally: ~<strong>15,000 customers</strong>, <strong>$11.25B valuation</strong> at entry</li>
<li>First local customers at launch: SiteMate, Liven, Omniscient Neurotechnology; global logos with AU staff: Notion, Anduril, Anthropic</li>
<li>November 2025: Australian team grows from 1 to <strong>100+</strong>; headcount tripled in the final year; new Barangaroo office opens (capacity ~100)</li>
<li>Key local hires: Kellie Clenton (ANZ product lead), Dan Shaw (APAC sales director, global solutions), Andrew Rae (head of SMB sales)</li>
<li>Outcome: ongoing — scaling fast, but the incumbent remains entrenched</li>
</ul>', '- 12 February 2024: Sydney APAC HQ announced; localised Australian payroll launched
- \~**30 staff** in Sydney at launch; **millions** committed to APAC investment
- Rippling globally: \~**15,000 customers**, **\$11.25B valuation** at entry
- First local customers at launch: SiteMate, Liven, Omniscient Neurotechnology; global logos with AU staff: Notion, Anduril, Anthropic
- November 2025: Australian team grows from 1 to **100+**; headcount tripled in the final year; new Barangaroo office opens (capacity \~100)
- Key local hires: Kellie Clenton (ANZ product lead), Dan Shaw (APAC sales director, global solutions), Andrew Rae (head of SMB sales)
- Outcome: ongoing — scaling fast, but the incumbent remains entrenched', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>In compliance-heavy categories like payroll, deep product localisation is the entry ticket — lead your launch with it.</li>
<li>Expect the incumbent to fight, and assume your entry plans are being watched; competitive counter-intelligence is part of entering concentrated markets.</li>
<li>Position where the incumbent can''t follow: Rippling''s global unified platform targets a need local specialists structurally can''t serve.</li>
<li>Scope the first office as a regional HQ — it attracts stronger leadership hires and justifies bigger launch investment.</li>
</ol>', '1. In compliance-heavy categories like payroll, deep product localisation is the entry ticket — lead your launch with it.
2. Expect the incumbent to fight, and assume your entry plans are being watched; competitive counter-intelligence is part of entering concentrated markets.
3. Position where the incumbent can''t follow: Rippling''s global unified platform targets a need local specialists structurally can''t serve.
4. Scope the first office as a regional HQ — it attracts stronger leadership hires and justifies bigger launch investment.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-zoho-played-the-long-game-in-australia-with-local-data-centres (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-zoho-played-the-long-game-in-australia-with-local-data-centres' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-zoho-played-the-long-game-in-australia-with-local-data-centres' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-zoho-played-the-long-game-in-australia-with-local-data-centres' AND status = 'draft' AND content_type = 'case_study'), '<p>Every global SaaS company that enters Australia opens in Sydney or Melbourne — except Zoho. The Indian software giant anchored its Australian operation in Adelaide, a deliberate expression of its global "transnational localism" philosophy: put offices where talent is loyal, costs are lower and communities are underserved. The contrarian bet has quietly compounded.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Zoho</td>
</tr>
<tr>
<td>Origin</td>
<td>India (Chennai)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — business software suite (CRM, finance, productivity, 55+ apps)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (Sydney presence); Adelaide HQ established March 2024</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — regional-first: Adelaide HQ, later a second office in Parramatta</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — growing AU operation with 60%+ of local staff in Adelaide</td>
</tr>
</table>', 'Every global SaaS company that enters Australia opens in Sydney or Melbourne — except Zoho. The Indian software giant anchored its Australian operation in Adelaide, a deliberate expression of its global "transnational localism" philosophy: put offices where talent is loyal, costs are lower and communities are underserved. The contrarian bet has quietly compounded.
<table header-column="true">
<tr>
<td>Company</td>
<td>Zoho</td>
</tr>
<tr>
<td>Origin</td>
<td>India (Chennai)</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — business software suite (CRM, finance, productivity, 55+ apps)</td>
</tr>
<tr>
<td>Entry year</td>
<td>2019 (Sydney presence); Adelaide HQ established March 2024</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — regional-first: Adelaide HQ, later a second office in Parramatta</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — growing AU operation with 60%+ of local staff in Adelaide</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-zoho-played-the-long-game-in-australia-with-local-data-centres' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Zoho is one of the world''s largest privately held software companies, selling a suite of 55+ business applications with a famously frugal, bootstrapped culture — no outside investors, no debt, and a preference for building offices in smaller cities rather than expensive tech hubs. Globally the company calls this "transnational localism": hiring and investing in secondary cities where it can be a big fish, talent churn is low, and cost structures support its value pricing. Australia — a mature, high-adoption SaaS market — was identified by Zoho as a key market in its global expansion. The question wasn''t whether to enter, but how to enter differently.</p>', 'Zoho is one of the world''s largest privately held software companies, selling a suite of 55+ business applications with a famously frugal, bootstrapped culture — no outside investors, no debt, and a preference for building offices in smaller cities rather than expensive tech hubs. Globally the company calls this "transnational localism": hiring and investing in secondary cities where it can be a big fish, talent churn is low, and cost structures support its value pricing.
Australia — a mature, high-adoption SaaS market — was identified by Zoho as a key market in its global expansion. The question wasn''t whether to enter, but how to enter differently.', 1),
      ('entry-strategy', 'Skip the obvious cities', '<p>Zoho opened its first Australian office in Sydney in 2019 (following its 2018 Singapore APAC HQ), but in March 2024 named <strong>Adelaide</strong> its Australian headquarters — making it one of the only global SaaS companies headquartered in South Australia. The company moved into new Currie Street premises with 12 employees plus six working remotely across solution engineering, account management, marketing and business development, committing to around 50 new local positions over three years. The South Australian Department for Trade and Investment had spent the prior two years providing in-market support to court the company. The move mirrored Zoho''s global playbook: lower operating costs, less competition for talent, strong staff retention, and outsized goodwill from a state government eager to attract technology employers.</p>', 'Zoho opened its first Australian office in Sydney in 2019 (following its 2018 Singapore APAC HQ), but in March 2024 named **Adelaide** its Australian headquarters — making it one of the only global SaaS companies headquartered in South Australia. The company moved into new Currie Street premises with 12 employees plus six working remotely across solution engineering, account management, marketing and business development, committing to around 50 new local positions over three years. The South Australian Department for Trade and Investment had spent the prior two years providing in-market support to court the company. The move mirrored Zoho''s global playbook: lower operating costs, less competition for talent, strong staff retention, and outsized goodwill from a state government eager to attract technology employers.', 2),
      ('entry-strategy', 'Grow where you''re wanted', '<p>The Adelaide bet deepened over time: Zoho later doubled its Adelaide headcount and opened an expanded office — launched with South Australian government minister Chris Picton — with roughly 25 of its ~40 Australian staff (60%+) based in the city. State-government visibility gave Zoho promotional and credibility support in a market where it lacked the brand recognition of Salesforce or HubSpot. Early South Australian customers spanned wineries, healthcare and NDIS providers, sporting clubs and energy companies — the unglamorous SME economy Zoho targets everywhere. Momentum followed: ANZ revenue grew 23% year-on-year (nearly five times the forecast growth rate of the broader Australian software industry), customer numbers rose 29%, and Zoho hired its first New Zealand employees.</p>', 'The Adelaide bet deepened over time: Zoho later doubled its Adelaide headcount and opened an expanded office — launched with South Australian government minister Chris Picton — with roughly 25 of its \~40 Australian staff (60%+) based in the city. State-government visibility gave Zoho promotional and credibility support in a market where it lacked the brand recognition of Salesforce or HubSpot. Early South Australian customers spanned wineries, healthcare and NDIS providers, sporting clubs and energy companies — the unglamorous SME economy Zoho targets everywhere. Momentum followed: ANZ revenue grew 23% year-on-year (nearly five times the forecast growth rate of the broader Australian software industry), customer numbers rose 29%, and Zoho hired its first New Zealand employees.', 3),
      ('entry-strategy', 'Add coverage, keep the anchor', '<p>In March 2026 Zoho opened a second Australian office in <strong>Parramatta</strong>, Western Sydney — again avoiding the premium CBD postcode — giving it east-coast sales coverage while keeping Adelaide as the operational anchor.</p>', 'In March 2026 Zoho opened a second Australian office in **Parramatta**, Western Sydney — again avoiding the premium CBD postcode — giving it east-coast sales coverage while keeping Adelaide as the operational anchor.', 4),
      ('entry-strategy', 'Value pricing for the SME long tail', '<p>Zoho''s Australian GTM matches its global one: a broad, aggressively priced suite targeting small and mid-sized businesses, sold through self-serve, inside sales and a local partner network — a segment underserved by enterprise-priced rivals.</p>', 'Zoho''s Australian GTM matches its global one: a broad, aggressively priced suite targeting small and mid-sized businesses, sold through self-serve, inside sales and a local partner network — a segment underserved by enterprise-priced rivals.', 5),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Contrarian location as strategy, not accident.</strong> Adelaide delivered cost advantages, loyal talent and a government ally — assets unavailable in Sydney''s crowded market.</li>
<li><strong>Consistency with global identity.</strong> The regional-first entry was credible because it''s how Zoho operates everywhere.</li>
<li><strong>Underserved segment focus.</strong> SME-first pricing avoided head-on collision with enterprise incumbents.</li>
</ul>', '- **Contrarian location as strategy, not accident.** Adelaide delivered cost advantages, loyal talent and a government ally — assets unavailable in Sydney''s crowded market.
- **Consistency with global identity.** The regional-first entry was credible because it''s how Zoho operates everywhere.
- **Underserved segment focus.** SME-first pricing avoided head-on collision with enterprise incumbents.', 6),
      ('key-metrics', NULL::text, '<ul>
<li>2019: first Australian office opens in Sydney; APAC HQ in Singapore since 2018</li>
<li>March 2024: Adelaide named Australian HQ (Currie Street) — <strong>12 staff + 6 remote</strong> at opening; ~<strong>50 new positions</strong> committed over three years</li>
<li>Adelaide headcount <strong>doubled</strong>; ~<strong>60%+ of ~40 AU staff</strong> based in Adelaide</li>
<li>ANZ revenue <strong>+23% YoY</strong> (~5x industry growth forecast); customers <strong>+29% YoY</strong></li>
<li>March 2026: second office opens in Parramatta, Western Sydney</li>
</ul>', '- 2019: first Australian office opens in Sydney; APAC HQ in Singapore since 2018
- March 2024: Adelaide named Australian HQ (Currie Street) — **12 staff + 6 remote** at opening; \~**50 new positions** committed over three years
- Adelaide headcount **doubled**; \~**60%+ of \~40 AU staff** based in Adelaide
- ANZ revenue **+23% YoY** (\~5x industry growth forecast); customers **+29% YoY**
- March 2026: second office opens in Parramatta, Western Sydney', 7),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>The "default" entry city isn''t always right — a secondary city can offer cheaper talent, better retention and a government that actively champions you.</li>
<li>Match your entry model to your company identity; a frugal challenger opening a Sydney CBD flagship would ring false and burn cash.</li>
<li>State governments compete for tech investment — choosing the underserved state converts your arrival into their win, and their platform into your PR.</li>
<li>Serving the SME long tail is a viable wedge in a market where incumbents chase enterprise logos.</li>
</ol>', '1. The "default" entry city isn''t always right — a secondary city can offer cheaper talent, better retention and a government that actively champions you.
2. Match your entry model to your company identity; a frugal challenger opening a Sydney CBD flagship would ring false and burn cash.
3. State governments compete for tech investment — choosing the underserved state converts your arrival into their win, and their platform into your PR.
4. Serving the SME long tail is a viable wedge in a market where incumbents chase enterprise logos.', 8)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-zoho-played-the-long-game-in-australia-with-local-data-centres' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-zoho-played-the-long-game-in-australia-with-local-data-centres' AND status = 'draft' AND content_type = 'case_study');
COMMIT;

-- how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs (reapply corrected structure)
BEGIN;
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs' AND status = 'draft' AND content_type = 'case_study') AND section_id IS NULL;
DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs' AND status = 'draft' AND content_type = 'case_study');
  -- ^ cascades section-level bodies (these fresh drafts carry no sources/quotes)
INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs' AND status = 'draft' AND content_type = 'case_study'), '<p>Freshworks — the Indian-founded challenger to Zendesk and Salesforce — entered Australia in 2015 with a Sydney office and a value-for-money pitch aimed at the mid-market. Four years and 5x ARR growth later, it doubled down with a second office in Melbourne, serving more than 2,000 paying ANZ customers.</p>
<table header-column="true">
<tr>
<td>Company</td>
<td>Freshworks</td>
</tr>
<tr>
<td>Origin</td>
<td>India (Chennai); HQ San Mateo, California</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — customer support, IT service management and CRM</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — Sydney office, expanded to Melbourne on ARR milestones</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 5x ARR growth between offices; 2,000+ paying ANZ customers by 2019</td>
</tr>
</table>', 'Freshworks — the Indian-founded challenger to Zendesk and Salesforce — entered Australia in 2015 with a Sydney office and a value-for-money pitch aimed at the mid-market. Four years and 5x ARR growth later, it doubled down with a second office in Melbourne, serving more than 2,000 paying ANZ customers.
<table header-column="true">
<tr>
<td>Company</td>
<td>Freshworks</td>
</tr>
<tr>
<td>Origin</td>
<td>India (Chennai); HQ San Mateo, California</td>
</tr>
<tr>
<td>Sector</td>
<td>SaaS — customer support, IT service management and CRM</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct — Sydney office, expanded to Melbourne on ARR milestones</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — 5x ARR growth between offices; 2,000+ paying ANZ customers by 2019</td>
</tr>
</table>', 0, 'case_study';
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
SELECT (SELECT id FROM public.content_items WHERE slug = 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs' AND status = 'draft' AND content_type = 'case_study'), v.title, v.slug, v.ord, true
FROM (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
) AS v(title, slug, ord);
INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
FROM public.content_sections s
JOIN (VALUES
      ('background', NULL::text, '<p>Freshworks (originally Freshdesk) was founded in Chennai in 2010 as a lower-cost, easier-to-deploy alternative to incumbent customer-support and CRM suites. Its global playbook was consistent: win the mid-market with transparent pricing, fast onboarding and a product-led funnel, then move upmarket. Australia — with its dense SME and mid-market base and high cloud adoption — was a natural expansion target, and by 2015 the company was ready to service its growing ANZ customer base locally.</p>', 'Freshworks (originally Freshdesk) was founded in Chennai in 2010 as a lower-cost, easier-to-deploy alternative to incumbent customer-support and CRM suites. Its global playbook was consistent: win the mid-market with transparent pricing, fast onboarding and a product-led funnel, then move upmarket. Australia — with its dense SME and mid-market base and high cloud adoption — was a natural expansion target, and by 2015 the company was ready to service its growing ANZ customer base locally.', 1),
      ('entry-strategy', 'A beachhead in Sydney', '<p>Freshworks opened its Sydney office in September 2015, giving it local sales, support and partner coverage in the region''s largest commercial centre. The subsidiary was built by Sreelesh Pillai — Freshworks'' first go-to-market hire globally — who relocated from Chennai in April 2015 to establish Freshworks Australia Pty Ltd as general manager, and stayed through to the company''s IPO. The market carried symbolic weight too: Freshworks'' first-ever paying customer had come from Australia, years before the company had any local presence. The office anchored ANZ operations and let the company compete for deals where a purely offshore vendor would have been screened out.</p>', 'Freshworks opened its Sydney office in September 2015, giving it local sales, support and partner coverage in the region''s largest commercial centre. The subsidiary was built by Sreelesh Pillai — Freshworks'' first go-to-market hire globally — who relocated from Chennai in April 2015 to establish Freshworks Australia Pty Ltd as general manager, and stayed through to the company''s IPO. The market carried symbolic weight too: Freshworks'' first-ever paying customer had come from Australia, years before the company had any local presence. The office anchored ANZ operations and let the company compete for deals where a purely offshore vendor would have been screened out.', 2),
      ('entry-strategy', 'Challenger economics as the GTM', '<p>Freshworks'' Australian go-to-market leaned on its global positioning: comparable capability to Zendesk or Salesforce at materially lower cost and complexity. Self-serve trials and transparent pricing generated mid-market pipeline, while the local team converted and expanded accounts — a land-and-expand motion well suited to Australia''s SME-heavy economy.</p>', 'Freshworks'' Australian go-to-market leaned on its global positioning: comparable capability to Zendesk or Salesforce at materially lower cost and complexity. Self-serve trials and transparent pricing generated mid-market pipeline, while the local team converted and expanded accounts — a land-and-expand motion well suited to Australia''s SME-heavy economy.', 3),
      ('entry-strategy', 'Expand on milestones, not ambition', '<p>The second office followed the numbers: after growing ANZ ARR <strong>5x</strong> from the Sydney launch, Freshworks opened a Melbourne office on 2 May 2019 — its second in the region — by which point it served <strong>more than 2,000 paying ANZ customers</strong>. Tying geographic expansion to revenue milestones kept the cost base aligned with traction.</p>', 'The second office followed the numbers: after growing ANZ ARR **5x** from the Sydney launch, Freshworks opened a Melbourne office on 2 May 2019 — its second in the region — by which point it served **more than 2,000 paying ANZ customers**. Tying geographic expansion to revenue milestones kept the cost base aligned with traction.', 4),
      ('entry-strategy', 'Localise the infrastructure', '<p>In January 2018 Freshworks launched an Australian data centre in Sydney hosting Freshdesk and Freshservice, then expanded it in July 2019 to cover Freshsales, Freshchat and Freshcaller. Onshore hosting unlocked data-sovereignty-sensitive buyers in health, government and financial services — segments that would otherwise screen out an offshore SaaS vendor.</p>', 'In January 2018 Freshworks launched an Australian data centre in Sydney hosting Freshdesk and Freshservice, then expanded it in July 2019 to cover Freshsales, Freshchat and Freshcaller. Onshore hosting unlocked data-sovereignty-sensitive buyers in health, government and financial services — segments that would otherwise screen out an offshore SaaS vendor.', 5),
      ('entry-strategy', 'Anchor the brand in local culture', '<p>Freshworks later signed one of its most visible ANZ customers, the NRL, rolling out Freshservice across all 17 clubs and 1,200 staff — sports-led proof that a Chennai-born challenger had gone mainstream in Australia. In May 2024 the company appointed ex-AWS executive Andrew Phillips as ANZ country manager and VP to lead the next phase.</p>', 'Freshworks later signed one of its most visible ANZ customers, the NRL, rolling out Freshservice across all 17 clubs and 1,200 staff — sports-led proof that a Chennai-born challenger had gone mainstream in Australia. In May 2024 the company appointed ex-AWS executive Andrew Phillips as ANZ country manager and VP to lead the next phase.', 6),
      ('why-it-worked', NULL::text, '<ul>
<li><strong>Clear challenger positioning.</strong> Value-for-money resonated in a market dominated by pricier incumbents.</li>
<li><strong>Milestone-gated expansion.</strong> Melbourne came after 5x ARR growth, not before it.</li>
<li><strong>Local presence where it counts.</strong> Sydney and Melbourne cover the large majority of Australian enterprise and mid-market buyers.</li>
</ul>', '- **Clear challenger positioning.** Value-for-money resonated in a market dominated by pricier incumbents.
- **Milestone-gated expansion.** Melbourne came after 5x ARR growth, not before it.
- **Local presence where it counts.** Sydney and Melbourne cover the large majority of Australian enterprise and mid-market buyers.', 7),
      ('key-metrics', NULL::text, '<ul>
<li>September 2015: Sydney office opens</li>
<li>2015–2019: ANZ ARR grows <strong>5x</strong></li>
<li>2 May 2019: Melbourne office opens — second ANZ office</li>
<li>2019: <strong>2,200+ paying ANZ customers</strong>; plans to double regional headcount within six months</li>
<li>January 2018: Sydney data centre launches (Freshdesk, Freshservice); expanded July 2019 (Freshsales, Freshchat, Freshcaller)</li>
<li>Later: NRL rolls out Freshservice across <strong>all 17 clubs and 1,200 staff</strong>; May 2024: Andrew Phillips (ex-AWS) appointed ANZ country manager &amp; VP</li>
</ul>', '- September 2015: Sydney office opens
- 2015–2019: ANZ ARR grows **5x**
- 2 May 2019: Melbourne office opens — second ANZ office
- 2019: **2,200+ paying ANZ customers**; plans to double regional headcount within six months
- January 2018: Sydney data centre launches (Freshdesk, Freshservice); expanded July 2019 (Freshsales, Freshchat, Freshcaller)
- Later: NRL rolls out Freshservice across **all 17 clubs and 1,200 staff**; May 2024: Andrew Phillips (ex-AWS) appointed ANZ country manager & VP', 8),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li>A challenger brand can enter against entrenched incumbents by competing on price-to-value, not feature parity.</li>
<li>Gate each expansion step to a revenue milestone — it disciplines the build and makes the internal business case unarguable.</li>
<li>In Australia, a two-city presence (Sydney + Melbourne) is the practical definition of "national coverage" for B2B SaaS.</li>
</ol>', '1. A challenger brand can enter against entrenched incumbents by competing on price-to-value, not feature parity.
2. Gate each expansion step to a revenue milestone — it disciplines the build and makes the internal business case unarguable.
3. In Australia, a two-city presence (Sydney + Melbourne) is the practical definition of "national coverage" for B2B SaaS.', 9)
) AS v(slug, question, html, md, ord) ON v.slug = s.slug AND s.content_id = (SELECT id FROM public.content_items WHERE slug = 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs' AND status = 'draft' AND content_type = 'case_study');
UPDATE public.content_items SET read_time = 4 WHERE id = (SELECT id FROM public.content_items WHERE slug = 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs' AND status = 'draft' AND content_type = 'case_study');
COMMIT;
