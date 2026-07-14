-- how-uniqlo-tested-australia-with-a-pop-up-before-its-flagship-bet
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-uniqlo-tested-australia-with-a-pop-up-before-its-flagship-bet', 'How Uniqlo Tested Australia With a Pop-Up Before Its Flagship Bet', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Uniqlo announced its Australian entry in September 2013 and opened its first store at Melbourne''s Emporium in 2014. Within two years, Australian sales…', 2, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-uniqlo-tested-australia-with-a-pop-up-before-its-flagship-bet')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Uniqlo announced its Australian entry in September 2013 and opened its first store at Melbourne''s Emporium in 2014. Within two years, Australian sales jumped 47% to $174.5 million across just 12 stores — and Australia has since become one of Fast Retailing''s stronger international markets.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Apparel retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2014</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, flagship-first rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 'Uniqlo announced its Australian entry in September 2013 and opened its first store at Melbourne''s Emporium in 2014. Within two years, Australian sales jumped 47% to \$174.5 million across just 12 stores — and Australia has since become one of Fast Retailing''s stronger international markets.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Japan</td>
</tr>
<tr>
<td>Sector</td>
<td>Apparel retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2014</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, flagship-first rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Launch team & sequencing', 'launch-team-and-sequencing', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Uniqlo arrived during the "fast fashion invasion" wave alongside Zara, Topshop and H&amp;M, when premium CBD retail space was opening up to international entrants and Australian consumers were hungry for global brands. Unlike trend-driven rivals, Uniqlo positioned around "LifeWear" — high-quality everyday basics and technical fabrics like HEATTECH and AIRism.</p>', 'Uniqlo arrived during the "fast fashion invasion" wave alongside Zara, Topshop and H&M, when premium CBD retail space was opening up to international entrants and Australian consumers were hungry for global brands. Unlike trend-driven rivals, Uniqlo positioned around "LifeWear" — high-quality everyday basics and technical fabrics like HEATTECH and AIRism.', 1),
      ('entry-strategy', NULL::text, '<p>Uniqlo followed a flagship-first strategy: large-format stores in premium CBD centres (Emporium Melbourne, then Sydney), building brand authority before spreading to suburban malls. It ran the market as a wholly owned subsidiary, keeping control of pricing, store experience and supply chain, and adapted its range to Southern Hemisphere seasons — a discipline that tripped up other Northern Hemisphere entrants.</p>', 'Uniqlo followed a flagship-first strategy: large-format stores in premium CBD centres (Emporium Melbourne, then Sydney), building brand authority before spreading to suburban malls. It ran the market as a wholly owned subsidiary, keeping control of pricing, store experience and supply chain, and adapted its range to Southern Hemisphere seasons — a discipline that tripped up other Northern Hemisphere entrants.', 2),
      ('launch-team-and-sequencing', NULL::text, '<ul>
<li><strong>A named local CEO from announcement day.</strong> The entry was announced on 30 September 2013 with Shoichi Miyasaka — a Fast Retailing group executive — as CEO of Uniqlo Australia, giving the market a accountable local leader a full six months before the first store traded.</li>
<li><strong>A pop-up before the flagship.</strong> Uniqlo announced a Melbourne CBD pop-up in December 2013, trading on Swanston Street from late January to March 2014, to seed the brand and test the market ahead of the Emporium flagship''s April 2014 opening — low-cost demand validation before the big-format commitment.</li>
<li><strong>The site did the signalling.</strong> Choosing Emporium Melbourne, a brand-new premium complex in the heart of the CBD, positioned Uniqlo alongside global flagships rather than discount fashion from day one.</li>
</ul>', '- **A named local CEO from announcement day.** The entry was announced on 30 September 2013 with Shoichi Miyasaka — a Fast Retailing group executive — as CEO of Uniqlo Australia, giving the market a accountable local leader a full six months before the first store traded.
- **A pop-up before the flagship.** Uniqlo announced a Melbourne CBD pop-up in December 2013, trading on Swanston Street from late January to March 2014, to seed the brand and test the market ahead of the Emporium flagship''s April 2014 opening — low-cost demand validation before the big-format commitment.
- **The site did the signalling.** Choosing Emporium Melbourne, a brand-new premium complex in the heart of the CBD, positioned Uniqlo alongside global flagships rather than discount fashion from day one.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Differentiated positioning</strong>: basics and fabric technology rather than disposable trend fashion, insulating it from the fast-fashion shakeout that later claimed Topshop</li>
<li><strong>Flagship-first credibility</strong> in premium centres before broader rollout</li>
<li><strong>Seasonal localisation</strong> of buying and stock for the Australian calendar</li>
<li><strong>Measured expansion</strong>: store count grew only as sales density proved out</li>
</ul>', '- **Differentiated positioning**: basics and fabric technology rather than disposable trend fashion, insulating it from the fast-fashion shakeout that later claimed Topshop
- **Flagship-first credibility** in premium centres before broader rollout
- **Seasonal localisation** of buying and stock for the Australian calendar
- **Measured expansion**: store count grew only as sales density proved out', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>FY2016: sales up 47% to $174.5 million with 12 stores</li>
<li>FY2019: sales up 25% to $306 million</li>
<li>Australia now ranks among Fast Retailing''s better-performing international operations</li>
</ul>', '- FY2016: sales up 47% to \$174.5 million with 12 stores
- FY2019: sales up 25% to \$306 million
- Australia now ranks among Fast Retailing''s better-performing international operations', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Uniqlo shows the value of entering a crowded wave with a distinct proposition and adapting operational details (seasonality, store economics) while protecting the global brand formula.</p>', 'Uniqlo shows the value of entering a crowded wave with a distinct proposition and adapting operational details (seasonality, store economics) while protecting the global brand formula.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Uniqlo', 'Japan', 'Australia',
       'Apparel retail', '2014', 'successful'
FROM item
WHERE 'Uniqlo' IS NOT NULL;

-- how-ing-built-australias-biggest-branchless-bank-from-one-savings-product
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-ing-built-australias-biggest-branchless-bank-from-one-savings-product', 'How ING Built Australia''s Biggest Branchless Bank From One Savings Product', 'draft', 'case_study',
         '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'In 1999, Dutch banking group ING launched ING Direct — Australia''s first branchless, direct-to-consumer bank. Two decades later it counts 2.6 million…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-ing-built-australias-biggest-branchless-bank-from-one-savings-product')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>In 1999, Dutch banking group ING launched ING Direct — Australia''s first branchless, direct-to-consumer bank. Two decades later it counts 2.6 million customers, posted $440 million in net profit in 2019, and became the largest home lender outside the Big Four, with the highest NPS of any major Australian financial institution.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Netherlands</td>
</tr>
<tr>
<td>Sector</td>
<td>Banking / financial services</td>
</tr>
<tr>
<td>Entry year</td>
<td>1999</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, branchless direct model</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 'In 1999, Dutch banking group ING launched ING Direct — Australia''s first branchless, direct-to-consumer bank. Two decades later it counts 2.6 million customers, posted \$440 million in net profit in 2019, and became the largest home lender outside the Big Four, with the highest NPS of any major Australian financial institution.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Netherlands</td>
</tr>
<tr>
<td>Sector</td>
<td>Banking / financial services</td>
</tr>
<tr>
<td>Entry year</td>
<td>1999</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, branchless direct model</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & first product', 'people-and-first-product', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Australian banking in the late 1990s was a comfortable oligopoly: branch networks, low deposit rates, high fees. ING saw that a bank with no branches could pass its cost advantage straight to customers — and that Australians would bank by phone and internet if the rate was right.</p>', 'Australian banking in the late 1990s was a comfortable oligopoly: branch networks, low deposit rates, high fees. ING saw that a bank with no branches could pass its cost advantage straight to customers — and that Australians would bank by phone and internet if the rate was right.', 1),
      ('entry-strategy', NULL::text, '<p>ING Direct launched with a single hero product: the Savings Maximiser, a high-interest online savings account with no fees and no branch requirement. The simple, transparent offer did the marketing — the rate differential versus the Big Four was the acquisition engine. Deposits funded a gradual, disciplined expansion into home loans, and much later into transaction accounts, always keeping the product set narrow.</p>', 'ING Direct launched with a single hero product: the Savings Maximiser, a high-interest online savings account with no fees and no branch requirement. The simple, transparent offer did the marketing — the rate differential versus the Big Four was the acquisition engine. Deposits funded a gradual, disciplined expansion into home loans, and much later into transaction accounts, always keeping the product set narrow.', 2),
      ('people-and-first-product', NULL::text, '<ul>
<li><strong>A four-year advance party.</strong> Founding CEO Vaughn Richtor — who had joined ING in London in 1991 and set up its Dublin branch — was sent to Australia in 1995 to establish the banking operations that became ING Direct, four years before launch. He led the bank until January 2006, and returned to run it again from 2012 to 2016.</li>
<li><strong>One hero product at launch.</strong> The Savings Maximiser, launched in August 1999 as Australia''s first high-interest, fee-free online savings account, was the entire consumer proposition — and Richtor''s flagship from day one.</li>
<li><strong>Borrowed offices, then a building.</strong> The bank launched out of sister company ING Australia''s offices at 347 Kent Street, Sydney, before leasing floors at 140 Sussex Street in 2001 — growth eventually saw it take the entire 14-storey building.</li>
<li><strong>Local leadership as the maturity marker.</strong> In November 2020 Melanie Evans became the first female and first Australian CEO of the subsidiary.</li>
</ul>', '- **A four-year advance party.** Founding CEO Vaughn Richtor — who had joined ING in London in 1991 and set up its Dublin branch — was sent to Australia in 1995 to establish the banking operations that became ING Direct, four years before launch. He led the bank until January 2006, and returned to run it again from 2012 to 2016.
- **One hero product at launch.** The Savings Maximiser, launched in August 1999 as Australia''s first high-interest, fee-free online savings account, was the entire consumer proposition — and Richtor''s flagship from day one.
- **Borrowed offices, then a building.** The bank launched out of sister company ING Australia''s offices at 347 Kent Street, Sydney, before leasing floors at 140 Sussex Street in 2001 — growth eventually saw it take the entire 14-storey building.
- **Local leadership as the maturity marker.** In November 2020 Melanie Evans became the first female and first Australian CEO of the subsidiary.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Structural cost advantage</strong>: no branch network meant permanently better rates, not a promotional gimmick</li>
<li><strong>One-product wedge</strong>: a single unmistakably better product built trust before cross-selling</li>
<li><strong>Patience</strong>: two decades of gradual product expansion rather than a full-service assault on the Big Four</li>
<li><strong>Challenger brand identity</strong> maintained even at scale — "the bank that isn''t like the banks"</li>
</ul>', '- **Structural cost advantage**: no branch network meant permanently better rates, not a promotional gimmick
- **One-product wedge**: a single unmistakably better product built trust before cross-selling
- **Patience**: two decades of gradual product expansion rather than a full-service assault on the Big Four
- **Challenger brand identity** maintained even at scale — "the bank that isn''t like the banks"', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>Australia''s first branchless direct bank (1999)</li>
<li>2.6 million customers</li>
<li>2019 net profit after tax of $440 million</li>
<li>Largest mortgage lender outside the Big Four</li>
<li>Highest NPS of any major Australian financial institution</li>
</ul>', '- Australia''s first branchless direct bank (1999)
- 2.6 million customers
- 2019 net profit after tax of \$440 million
- Largest mortgage lender outside the Big Four
- Highest NPS of any major Australian financial institution', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>ING shows that in regulated, incumbent-dominated markets, the winning entry is often a single structurally advantaged product — not a full-service replica of the incumbents — scaled patiently over decades.</p>', 'ING shows that in regulated, incumbent-dominated markets, the winning entry is often a single structurally advantaged product — not a full-service replica of the incumbents — scaled patiently over decades.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'ING', 'Netherlands', 'Australia',
       'Banking / financial services', '1999', 'successful'
FROM item
WHERE 'ING' IS NOT NULL;

-- how-zara-turned-day-one-sydney-queues-into-a-national-foothold
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-zara-turned-day-one-sydney-queues-into-a-national-foothold', 'How Zara Turned Day-One Sydney Queues Into a National Foothold', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When Zara opened its first Australian store at Westfield Sydney on Pitt Street Mall on 20 April 2011, an estimated 22,000 shoppers passed through the…', 2, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-zara-turned-day-one-sydney-queues-into-a-national-foothold')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When Zara opened its first Australian store at Westfield Sydney on Pitt Street Mall on 20 April 2011, an estimated 22,000 shoppers passed through the 1,400sqm, three-level store on day one. Inditex''s Australian arm grew revenue to $311.8 million by FY2019 — one of the most successful launches of the fast-fashion wave.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Spain</td>
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
<td>Local launch partnership (Inditex-controlled)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 'When Zara opened its first Australian store at Westfield Sydney on Pitt Street Mall on 20 April 2011, an estimated 22,000 shoppers passed through the 1,400sqm, three-level store on day one. Inditex''s Australian arm grew revenue to \$311.8 million by FY2019 — one of the most successful launches of the fast-fashion wave.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Spain</td>
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
<td>Local launch partnership (Inditex-controlled)</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Launch mechanics', 'launch-mechanics', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Zara was among the first of the global fast-fashion giants to land in Australia, entering while local mid-market apparel chains were slow-moving and department stores dominated. Pent-up demand was extreme — Australians already knew the brand from overseas travel.</p>', 'Zara was among the first of the global fast-fashion giants to land in Australia, entering while local mid-market apparel chains were slow-moving and department stores dominated. Pent-up demand was extreme — Australians already knew the brand from overseas travel.', 1),
      ('entry-strategy', NULL::text, '<p>Zara launched with a high-impact flagship in Australia''s premier retail strip, partnering with local retail interests for the launch while Inditex retained control of the operating model. Crucially, it imported the machine that makes Zara work globally: twice-weekly stock drops flown in from Spain, keeping ranges scarce, fresh and full-price. Expansion followed the flagship playbook into premium centres in Melbourne, Brisbane, Adelaide and Perth.</p>', 'Zara launched with a high-impact flagship in Australia''s premier retail strip, partnering with local retail interests for the launch while Inditex retained control of the operating model. Crucially, it imported the machine that makes Zara work globally: twice-weekly stock drops flown in from Spain, keeping ranges scarce, fresh and full-price. Expansion followed the flagship playbook into premium centres in Melbourne, Brisbane, Adelaide and Perth.', 2),
      ('launch-mechanics', NULL::text, '<ul>
<li><strong>A launch agency turned opening day into an event.</strong> Australian agency TORSTAR ran the launch of what it called the first high-street retailer into Australia — the Pitt Street opening "literally stopped traffic" as 22,000 shoppers came through the doors.</li>
<li><strong>Security-managed queues became the story.</strong> Security staff were needed to control the crowds at the 77 Pitt Street store — imagery that ran nationally and did the brand''s advertising for it.</li>
<li><strong>Adjacent formats followed the beachhead.</strong> Zara Home arrived years later — first at Melbourne''s Highpoint, then Pitt Street Mall — with national online shipping switched on to coincide with the Sydney store, extending the flagship playbook into homewares.</li>
</ul>', '- **A launch agency turned opening day into an event.** Australian agency TORSTAR ran the launch of what it called the first high-street retailer into Australia — the Pitt Street opening "literally stopped traffic" as 22,000 shoppers came through the doors.
- **Security-managed queues became the story.** Security staff were needed to control the crowds at the 77 Pitt Street store — imagery that ran nationally and did the brand''s advertising for it.
- **Adjacent formats followed the beachhead.** Zara Home arrived years later — first at Melbourne''s Highpoint, then Pitt Street Mall — with national online shipping switched on to coincide with the Sydney store, extending the flagship playbook into homewares.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Scarcity-driven supply chain</strong>: twice-weekly deliveries meant fresh stock and minimal markdowns, unlike locally warehoused competitors</li>
<li><strong>Pent-up brand demand</strong> converted into a launch-day event that generated national media coverage for free</li>
<li><strong>Premium-location discipline</strong>: fewer, larger stores in the best centres rather than a broad footprint</li>
<li><strong>Global model, local calendar</strong>: range adjusted to Southern Hemisphere seasons</li>
</ul>', '- **Scarcity-driven supply chain**: twice-weekly deliveries meant fresh stock and minimal markdowns, unlike locally warehoused competitors
- **Pent-up brand demand** converted into a launch-day event that generated national media coverage for free
- **Premium-location discipline**: fewer, larger stores in the best centres rather than a broad footprint
- **Global model, local calendar**: range adjusted to Southern Hemisphere seasons', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>22,000 shoppers through the doors on day one</li>
<li>FY2014: revenue $141 million, up 32%</li>
<li>FY2017: 18 stores and ~1,700 staff</li>
<li>FY2019: revenue $311.8 million, up 10.5%</li>
</ul>', '- 22,000 shoppers through the doors on day one
- FY2014: revenue \$141 million, up 32%
- FY2017: 18 stores and \~1,700 staff
- FY2019: revenue \$311.8 million, up 10.5%', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Zara''s Australian entry shows how existing global brand awareness can be converted into launch momentum — and that a supply-chain advantage, not just brand, is what sustains a premium-priced fast-fashion position at distance.</p>', 'Zara''s Australian entry shows how existing global brand awareness can be converted into launch momentum — and that a supply-chain advantage, not just brand, is what sustains a premium-priced fast-fashion position at distance.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Zara', 'Spain', 'Australia',
       'Fast fashion retail', '2011', 'successful'
FROM item
WHERE 'Zara' IS NOT NULL;

-- how-aldi-cracked-australias-grocery-duopoly-with-a-no-frills-playbook
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-aldi-cracked-australias-grocery-duopoly-with-a-no-frills-playbook', 'How Aldi Cracked Australia''s Grocery Duopoly With a No-Frills Playbook', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When Aldi opened its first Australian store in Sydney in 2001, analysts doubted a no-frills German discounter could crack a grocery duopoly. Two decades…', 2, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-aldi-cracked-australias-grocery-duopoly-with-a-no-frills-playbook')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When Aldi opened its first Australian store in Sydney in 2001, analysts doubted a no-frills German discounter could crack a grocery duopoly. Two decades later, Aldi operates roughly 540+ stores, holds around 11–12% of the grocery market, and posted $13.94 billion in FY2025 sales — permanently resetting how Australians shop for groceries.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Germany</td>
</tr>
<tr>
<td>Sector</td>
<td>Grocery retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2001</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic greenfield rollout, self-funded</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 'When Aldi opened its first Australian store in Sydney in 2001, analysts doubted a no-frills German discounter could crack a grocery duopoly. Two decades later, Aldi operates roughly 540+ stores, holds around 11–12% of the grocery market, and posted \$13.94 billion in FY2025 sales — permanently resetting how Australians shop for groceries.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Germany</td>
</tr>
<tr>
<td>Sector</td>
<td>Grocery retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2001</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Organic greenfield rollout, self-funded</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Launch & footprint', 'launch-and-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Aldi arrived as the Australian grocery landscape was consolidating: Franklins was collapsing and Bi-Lo was in decline, leaving a vacuum at the discount end of the market that Coles and Woolworths were happy to vacate. Aldi moved straight into that gap.</p>', 'Aldi arrived as the Australian grocery landscape was consolidating: Franklins was collapsing and Bi-Lo was in decline, leaving a vacuum at the discount end of the market that Coles and Woolworths were happy to vacate. Aldi moved straight into that gap.', 1),
      ('entry-strategy', NULL::text, '<p>Aldi began on the east coast and expanded deliberately — store by store, funded from its own balance sheet rather than debt or franchising. It kept its proven limited-range formula largely intact: ~1,500 SKUs versus ~25,000 in a full-line supermarket, around 90% private label, small-format stores with minimal labour and quarter-sized footprints.</p>', 'Aldi began on the east coast and expanded deliberately — store by store, funded from its own balance sheet rather than debt or franchising. It kept its proven limited-range formula largely intact: \~1,500 SKUs versus \~25,000 in a full-line supermarket, around 90% private label, small-format stores with minimal labour and quarter-sized footprints.', 2),
      ('launch-and-footprint', NULL::text, '<ul>
<li><strong>Two stores on Australia Day weekend.</strong> Aldi opened its first two Australian stores simultaneously at Bankstown Airport and Marrickville in Sydney on 25 January 2001, with queues stretching around the buildings and through the car parks. By the end of 2001 it had 22 stores across NSW.</li>
<li><strong>A western Sydney nerve centre.</strong> The national head office sits at Minchinbury in Sydney''s west, co-located with its first distribution region — Aldi runs Australia through regional distribution centres rather than a CBD corporate tower.</li>
<li><strong>Scale today.</strong> More than 570 stores and around 7,600 employees nationally, still without presence in Tasmania or the Northern Territory.</li>
</ul>', '- **Two stores on Australia Day weekend.** Aldi opened its first two Australian stores simultaneously at Bankstown Airport and Marrickville in Sydney on 25 January 2001, with queues stretching around the buildings and through the car parks. By the end of 2001 it had 22 stores across NSW.
- **A western Sydney nerve centre.** The national head office sits at Minchinbury in Sydney''s west, co-located with its first distribution region — Aldi runs Australia through regional distribution centres rather than a CBD corporate tower.
- **Scale today.** More than 570 stores and around 7,600 employees nationally, still without presence in Tasmania or the Northern Territory.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Timing</strong>: entered as Franklins and Bi-Lo exited, inheriting the value-shopper segment</li>
<li><strong>Format discipline</strong>: never chased the majors on range; competed only on price and quality</li>
<li><strong>Patient capital</strong>: private ownership allowed a slow, profitable rollout over 20+ years rather than a land grab</li>
<li><strong>Localisation where it mattered</strong>: heavily Australian-sourced products under private labels, adapting buying without abandoning the model</li>
</ul>', '- **Timing**: entered as Franklins and Bi-Lo exited, inheriting the value-shopper segment
- **Format discipline**: never chased the majors on range; competed only on price and quality
- **Patient capital**: private ownership allowed a slow, profitable rollout over 20+ years rather than a land grab
- **Localisation where it mattered**: heavily Australian-sourced products under private labels, adapting buying without abandoning the model', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>~540 stores by August 2019, still no presence in Tasmania or the Northern Territory</li>
<li>~11–12.6% national grocery market share</li>
<li>FY2025 sales of $13.94 billion, up 4.8%</li>
<li>Profit fell ~20% in the 2026 supermarket price war — evidence that even the disruptor now shapes, and pays for, industry-wide price competition</li>
</ul>', '- \~540 stores by August 2019, still no presence in Tasmania or the Northern Territory
- \~11–12.6% national grocery market share
- FY2025 sales of \$13.94 billion, up 4.8%
- Profit fell \~20% in the 2026 supermarket price war — evidence that even the disruptor now shapes, and pays for, industry-wide price competition', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Aldi shows that a foreign format can win in Australia without heavy localisation — if the entrant picks its moment, funds a patient rollout, and refuses to drift toward incumbents'' playbooks.</p>', 'Aldi shows that a foreign format can win in Australia without heavy localisation — if the entrant picks its moment, funds a patient rollout, and refuses to drift toward incumbents'' playbooks.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Aldi', 'Germany', 'Australia',
       'Grocery retail', '2001', 'successful'
FROM item
WHERE 'Aldi' IS NOT NULL;

-- how-costco-pre-sold-australia-on-the-membership-warehouse-model
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-costco-pre-sold-australia-on-the-membership-warehouse-model', 'How Costco Pre-Sold Australia on the Membership Warehouse Model', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Costco opened its first Australian warehouse at Melbourne''s Docklands on 17 August 2009 — a single site testing whether Australians would pay an annual fee…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-costco-pre-sold-australia-on-the-membership-warehouse-model')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Costco opened its first Australian warehouse at Melbourne''s Docklands on 17 August 2009 — a single site testing whether Australians would pay an annual fee just to shop. Sixteen years on, 15 warehouses generate $12.6 billion in annual sales, and the Australian arm paid a ~$300 million dividend back to its US parent.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Membership warehouse retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2009</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, organic rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 'Costco opened its first Australian warehouse at Melbourne''s Docklands on 17 August 2009 — a single site testing whether Australians would pay an annual fee just to shop. Sixteen years on, 15 warehouses generate \$12.6 billion in annual sales, and the Australian arm paid a \~\$300 million dividend back to its US parent.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Membership warehouse retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2009</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, organic rollout</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & first customers', 'people-and-first-customers', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>The paid-membership warehouse model was unknown in Australia, and sceptics argued Australians would never pay to enter a shop. Costco bet that its global playbook — extreme bulk value, a treasure-hunt product mix, and a loyal fee-paying member base — would translate.</p>', 'The paid-membership warehouse model was unknown in Australia, and sceptics argued Australians would never pay to enter a shop. Costco bet that its global playbook — extreme bulk value, a treasure-hunt product mix, and a loyal fee-paying member base — would translate.', 1),
      ('entry-strategy', NULL::text, '<p>Costco entered with a single proof-of-concept warehouse in Melbourne, followed by Auburn (Sydney) and Canberra in 2011 once the model was validated. Expansion has been deliberately slow — 15 warehouses in 16 years — constrained by the large-format sites the model requires and Costco''s insistence on owning its economics rather than rushing scale. The core model was left untouched: annual membership, limited SKUs in bulk, and famously thin margins where the membership fee is effectively the profit line.</p>', 'Costco entered with a single proof-of-concept warehouse in Melbourne, followed by Auburn (Sydney) and Canberra in 2011 once the model was validated. Expansion has been deliberately slow — 15 warehouses in 16 years — constrained by the large-format sites the model requires and Costco''s insistence on owning its economics rather than rushing scale. The core model was left untouched: annual membership, limited SKUs in bulk, and famously thin margins where the membership fee is effectively the profit line.', 2),
      ('people-and-first-customers', NULL::text, '<ul>
<li><strong>A returning local ran the entry.</strong> Managing director Patrick Noone was Melbourne-born, started in retail with Woolworths supermarkets in 1978, moved to Canada in 1985 and helped launch the Price Club membership-warehouse concept there before its 1993 merger with Costco. He came home to open the first Australian warehouse and led the country business until retiring after 33 years with the company.</li>
<li><strong>Members signed up sight unseen.</strong> Before Docklands opened, memberships "in the thousands" had been sold at $60 for individuals and $55 for businesses — Australians paying to shop at a store they had never entered. Noone''s read: "Most have been to the US or the UK so they know of Costco. They just get it."</li>
<li><strong>Site selection as strategy.</strong> Docklands was chosen for freeway and CityLink access: "We''re not a suburban shopping centre, we''re a regional drawcard," Noone said — the catchment logic that still governs Costco''s 15-site network.</li>
</ul>', '- **A returning local ran the entry.** Managing director Patrick Noone was Melbourne-born, started in retail with Woolworths supermarkets in 1978, moved to Canada in 1985 and helped launch the Price Club membership-warehouse concept there before its 1993 merger with Costco. He came home to open the first Australian warehouse and led the country business until retiring after 33 years with the company.
- **Members signed up sight unseen.** Before Docklands opened, memberships "in the thousands" had been sold at \$60 for individuals and \$55 for businesses — Australians paying to shop at a store they had never entered. Noone''s read: "Most have been to the US or the UK so they know of Costco. They just get it."
- **Site selection as strategy.** Docklands was chosen for freeway and CityLink access: "We''re not a suburban shopping centre, we''re a regional drawcard," Noone said — the catchment logic that still governs Costco''s 15-site network.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Model integrity</strong>: the membership fee, Kirkland private label, and bulk-value proposition were imported intact</li>
<li><strong>Destination economics</strong>: each warehouse draws from a huge catchment, so 15 sites cover much of the population</li>
<li><strong>Membership loyalty</strong>: prepaid membership creates switching costs and industry-leading renewal behaviour</li>
<li><strong>Price authority</strong>: uncontested positioning on bulk value that neither Coles, Woolworths nor Aldi directly contest</li>
</ul>', '- **Model integrity**: the membership fee, Kirkland private label, and bulk-value proposition were imported intact
- **Destination economics**: each warehouse draws from a huge catchment, so 15 sites cover much of the population
- **Membership loyalty**: prepaid membership creates switching costs and industry-leading renewal behaviour
- **Price authority**: uncontested positioning on bulk value that neither Coles, Woolworths nor Aldi directly contest', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>15 warehouses nationally</li>
<li>$12.6 billion in sales in the year to August 2025</li>
<li>~$300 million dividend paid to the US parent — a marker of a mature, cash-generative subsidiary</li>
<li>The Australian entry has been studied academically (QUT) as a successful format transplant</li>
</ul>', '- 15 warehouses nationally
- \$12.6 billion in sales in the year to August 2025
- \~\$300 million dividend paid to the US parent — a marker of a mature, cash-generative subsidiary
- The Australian entry has been studied academically (QUT) as a successful format transplant', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Costco proves a genuinely novel retail format can be exported to Australia without dilution — provided the entrant accepts a slow, capital-heavy rollout and lets unit economics, not store count, define success.</p>', 'Costco proves a genuinely novel retail format can be exported to Australia without dilution — provided the entrant accepts a slow, capital-heavy rollout and lets unit economics, not store count, define success.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Costco', 'United States', 'Australia',
       'Membership warehouse retail', '2009', 'successful'
FROM item
WHERE 'Costco' IS NOT NULL;

-- how-byd-rode-a-local-distributor-into-australias-top-car-brands
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-byd-rode-a-local-distributor-into-australias-top-car-brands', 'How BYD Rode a Local Distributor Into Australia''s Top Car Brands', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Chinese EV giant BYD entered Australia not with a wholly owned subsidiary but through an exclusive local distributor, EVDirect. The bet paid off: BYD''s…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-byd-rode-a-local-distributor-into-australias-top-car-brands')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Chinese EV giant BYD entered Australia not with a wholly owned subsidiary but through an exclusive local distributor, EVDirect. The bet paid off: BYD''s battery-electric sales jumped 58% to 21,174 vehicles in January–November 2025, and the brand is now targeting a top-three position in the Australian market in 2026.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>China</td>
</tr>
<tr>
<td>Sector</td>
<td>Automotive / electric vehicles</td>
</tr>
<tr>
<td>Entry year</td>
<td>2022 (Atto 3 launch)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Exclusive local distributor, later direct control</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 'Chinese EV giant BYD entered Australia not with a wholly owned subsidiary but through an exclusive local distributor, EVDirect. The bet paid off: BYD''s battery-electric sales jumped 58% to 21,174 vehicles in January–November 2025, and the brand is now targeting a top-three position in the Australian market in 2026.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>China</td>
</tr>
<tr>
<td>Sector</td>
<td>Automotive / electric vehicles</td>
</tr>
<tr>
<td>Entry year</td>
<td>2022 (Atto 3 launch)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Exclusive local distributor, later direct control</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & proving ground', 'people-and-proving-ground', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Australian buyers had little awareness of Chinese car brands, and EV adoption was just beginning to accelerate. Rather than build a local organisation from scratch, BYD appointed EVDirect — led by Australian entrepreneur Luke Todd — as its exclusive distributor, borrowing local credibility, regulatory knowledge and retail relationships.</p>', 'Australian buyers had little awareness of Chinese car brands, and EV adoption was just beginning to accelerate. Rather than build a local organisation from scratch, BYD appointed EVDirect — led by Australian entrepreneur Luke Todd — as its exclusive distributor, borrowing local credibility, regulatory knowledge and retail relationships.', 1),
      ('entry-strategy', NULL::text, '<p>EVDirect launched the Atto 3 as an affordable, well-specified EV squarely aimed at the gap below Tesla''s price points, distributing through a dealer joint venture (EVDealer Group) with listed dealer giant Eagers Automotive. As volumes scaled, BYD followed the classic distributor-to-direct playbook: in July 2025 it took direct control of the Australian operation, with EVDirect retaining 20% of the EVDealer Group JV alongside Eagers (80%).</p>', 'EVDirect launched the Atto 3 as an affordable, well-specified EV squarely aimed at the gap below Tesla''s price points, distributing through a dealer joint venture (EVDealer Group) with listed dealer giant Eagers Automotive. As volumes scaled, BYD followed the classic distributor-to-direct playbook: in July 2025 it took direct control of the Australian operation, with EVDirect retaining 20% of the EVDealer Group JV alongside Eagers (80%).', 2),
      ('people-and-proving-ground', NULL::text, '<ul>
<li><strong>A founder with transport in the blood.</strong> EVDirect chairman and managing director Luke Todd came from a family transport business background and fronted the entire entry — from opening pre-sales in July 2021 through the Atto 3 launch — publicly targeting the number-one automotive brand position in Australia by 2027.</li>
<li><strong>Australia as BYD''s global test bed.</strong> BYD''s assembly line builds a car for the Australian market every 52 seconds, and the AFR reports the company treats Australia as a key proving ground for its push into advanced Western markets.</li>
<li><strong>Top-10 status reached.</strong> By August 2025 BYD was Australia''s sixth-best-selling car brand, delivering close to 5,000 vehicles in a single month — before the full factory-backed structure had even bedded in.</li>
</ul>', '- **A founder with transport in the blood.** EVDirect chairman and managing director Luke Todd came from a family transport business background and fronted the entire entry — from opening pre-sales in July 2021 through the Atto 3 launch — publicly targeting the number-one automotive brand position in Australia by 2027.
- **Australia as BYD''s global test bed.** BYD''s assembly line builds a car for the Australian market every 52 seconds, and the AFR reports the company treats Australia as a key proving ground for its push into advanced Western markets.
- **Top-10 status reached.** By August 2025 BYD was Australia''s sixth-best-selling car brand, delivering close to 5,000 vehicles in a single month — before the full factory-backed structure had even bedded in.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Borrowed local credibility</strong>: a local distributor and a major dealer group de-risked an unknown Chinese brand for Australian buyers</li>
<li><strong>Price-to-value disruption</strong>: undercut Tesla while offering strong specification</li>
<li><strong>Speed to market</strong>: distribution partnership put cars on the road years faster than a greenfield subsidiary</li>
<li><strong>Staged control</strong>: distributor for entry, direct ownership once scale justified it</li>
</ul>', '- **Borrowed local credibility**: a local distributor and a major dealer group de-risked an unknown Chinese brand for Australian buyers
- **Price-to-value disruption**: undercut Tesla while offering strong specification
- **Speed to market**: distribution partnership put cars on the road years faster than a greenfield subsidiary
- **Staged control**: distributor for entry, direct ownership once scale justified it', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>BEV sales up 58% to 21,174 vehicles (Jan–Nov 2025), plus strong plug-in hybrid volume</li>
<li>BYD took direct control of distribution in July 2025</li>
<li>Targeting a top-three overall sales position in Australia in 2026</li>
</ul>', '- BEV sales up 58% to 21,174 vehicles (Jan–Nov 2025), plus strong plug-in hybrid volume
- BYD took direct control of distribution in July 2025
- Targeting a top-three overall sales position in Australia in 2026', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>BYD''s entry is the textbook case for the distributor-first model: use a local partner to buy speed and trust, structure the deal so you can take direct control later, and let product value do the brand-building.</p>', 'BYD''s entry is the textbook case for the distributor-first model: use a local partner to buy speed and trust, structure the deal so you can take direct control later, and let product value do the brand-building.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'BYD', 'China', 'Australia',
       'Automotive / electric vehicles', '2022', 'successful'
FROM item
WHERE 'BYD' IS NOT NULL;

-- how-purplebricks-flat-fee-failed-australias-no-sale-no-fee-culture
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-purplebricks-flat-fee-failed-australias-no-sale-no-fee-culture', 'How Purplebricks'' Flat Fee Failed Australia''s No-Sale-No-Fee Culture', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'UK online estate agency Purplebricks launched in Australia in September 2016 promising to disrupt real estate commissions with a flat fee. Less than three…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-purplebricks-flat-fee-failed-australias-no-sale-no-fee-culture')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>UK online estate agency Purplebricks launched in Australia in September 2016 promising to disrupt real estate commissions with a flat fee. Less than three years later, in May 2019, it quit the market after an $18 million half-year loss — having been forced to nearly double its flat fee from $4,500 to $8,800 along the way.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United Kingdom</td>
</tr>
<tr>
<td>Sector</td>
<td>Real estate / proptech</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, national launch</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — exit May 2019</td>
</tr>
</table>', 'UK online estate agency Purplebricks launched in Australia in September 2016 promising to disrupt real estate commissions with a flat fee. Less than three years later, in May 2019, it quit the market after an \$18 million half-year loss — having been forced to nearly double its flat fee from \$4,500 to \$8,800 along the way.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United Kingdom</td>
</tr>
<tr>
<td>Sector</td>
<td>Real estate / proptech</td>
</tr>
<tr>
<td>Entry year</td>
<td>2016</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Wholly owned subsidiary, national launch</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — exit May 2019</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & unravelling', 'people-and-unravelling', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Purplebricks'' UK model — salaried "local property experts," a flat fee paid regardless of sale outcome, and heavy TV advertising — had made it a stock-market darling, with the parent peaking at a £1.3 billion valuation. Australia, with commissions around 2–2.5%, looked like an obvious next market.</p>', 'Purplebricks'' UK model — salaried "local property experts," a flat fee paid regardless of sale outcome, and heavy TV advertising — had made it a stock-market darling, with the parent peaking at a £1.3 billion valuation. Australia, with commissions around 2–2.5%, looked like an obvious next market.', 1),
      ('entry-strategy', NULL::text, '<p>Purplebricks launched nationally with saturation advertising attacking agent commissions. But the model transplanted poorly: the pay-anyway flat fee clashed with Australia''s no-sale-no-fee culture, and its salaried-agent structure collided with a commission-driven local industry — while its low fee couldn''t fund the vendor-paid marketing campaigns (portals, photography, auctions) that Australian sellers expect.</p>', 'Purplebricks launched nationally with saturation advertising attacking agent commissions. But the model transplanted poorly: the pay-anyway flat fee clashed with Australia''s no-sale-no-fee culture, and its salaried-agent structure collided with a commission-driven local industry — while its low fee couldn''t fund the vendor-paid marketing campaigns (portals, photography, auctions) that Australian sellers expect.', 2),
      ('people-and-unravelling', NULL::text, '<ul>
<li><strong>105 agents at an average $5,300 fee.</strong> Purplebricks recruited around 105 Australian "local property experts" charging an average $5,300 fixed fee — but as the housing market slowed, salaried agents struggled, and the model was reworked into a split fee ($4,400 upfront, $4,400 at settlement) to stem departures. Sixteen agents left in the final months alone.</li>
<li><strong>Leadership churn at both levels.</strong> Local CEO Ryan Dinsdale stepped down in early 2019, replaced by Neil Tavender just months before the exit; in the same week Australia was abandoned, global founder-CEO Michael Bruce was fired by chairman Paul Pindar, who admitted the company had "expanded too quickly".</li>
<li><strong>The competition celebrated openly.</strong> "Crisis over," said one rival operator on exit day — the entrant had united the fragmented local industry against it without converting consumers.</li>
</ul>', '- **105 agents at an average \$5,300 fee.** Purplebricks recruited around 105 Australian "local property experts" charging an average \$5,300 fixed fee — but as the housing market slowed, salaried agents struggled, and the model was reworked into a split fee (\$4,400 upfront, \$4,400 at settlement) to stem departures. Sixteen agents left in the final months alone.
- **Leadership churn at both levels.** Local CEO Ryan Dinsdale stepped down in early 2019, replaced by Neil Tavender just months before the exit; in the same week Australia was abandoned, global founder-CEO Michael Bruce was fired by chairman Paul Pindar, who admitted the company had "expanded too quickly".
- **The competition celebrated openly.** "Crisis over," said one rival operator on exit day — the entrant had united the fragmented local industry against it without converting consumers.', 3),
      ('failure-factors', NULL::text, '<ul>
<li><strong>Model-market mismatch</strong>: Australians resisted paying a fee even if the home didn''t sell — the inverse of local no-sale-no-fee norms</li>
<li><strong>Broken unit economics</strong>: the fee nearly doubled ($4,500 → $8,800), destroying the disruption story without reaching profitability</li>
<li><strong>Agent recruitment and churn</strong>: top local agents wouldn''t swap commission upside for a salary</li>
<li><strong>Simultaneous multi-market expansion</strong>: Australia and the US were launched in parallel, stretching management and capital as UK growth stalled</li>
</ul>', '- **Model-market mismatch**: Australians resisted paying a fee even if the home didn''t sell — the inverse of local no-sale-no-fee norms
- **Broken unit economics**: the fee nearly doubled (\$4,500 → \$8,800), destroying the disruption story without reaching profitability
- **Agent recruitment and churn**: top local agents wouldn''t swap commission upside for a salary
- **Simultaneous multi-market expansion**: Australia and the US were launched in parallel, stretching management and capital as UK growth stalled', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>Launched September 2016; exited May 2019 — under three years</li>
<li>$18 million loss in its final half-year</li>
<li>Flat fee rose from $4,500 to $8,800</li>
<li>UK parent later sold for a nominal £1 after its £1.3 billion peak</li>
</ul>', '- Launched September 2016; exited May 2019 — under three years
- \$18 million loss in its final half-year
- Flat fee rose from \$4,500 to \$8,800
- UK parent later sold for a nominal £1 after its £1.3 billion peak', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Pricing models are cultural, not just mathematical. Purplebricks exported a fee structure that violated local norms and had no economic headroom to adapt — disruptors must validate willingness-to-pay mechanics, not just the headline saving.</p>', 'Pricing models are cultural, not just mathematical. Purplebricks exported a fee structure that violated local norms and had no economic headroom to adapt — disruptors must validate willingness-to-pay mechanics, not just the headline saving.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Purplebricks', 'United Kingdom', 'Australia',
       'Real estate / proptech', '2016', 'unsuccessful'
FROM item
WHERE 'Purplebricks' IS NOT NULL;

-- how-krispy-kreme-over-expanded-its-way-into-administration-in-australia
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-krispy-kreme-over-expanded-its-way-into-administration-in-australia', 'How Krispy Kreme Over-Expanded Its Way Into Administration in Australia', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Krispy Kreme opened its first store outside North America in Penrith, Sydney on 19 June 2003, to scenes of cars queued down the street and interstate…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-krispy-kreme-over-expanded-its-way-into-administration-in-australia')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Krispy Kreme opened its first store outside North America in Penrith, Sydney on 19 June 2003, to scenes of cars queued down the street and interstate travellers flying doughnuts home. Seven years and 40+ stores later, the Australian business collapsed into voluntary administration on 29 October 2010 — a cautionary tale of scaling a destination treat into an everyday commodity.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>QSR / food retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2003</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Franchise — first international market</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure via over-expansion — administration 2010, later stabilised smaller</td>
</tr>
</table>', 'Krispy Kreme opened its first store outside North America in Penrith, Sydney on 19 June 2003, to scenes of cars queued down the street and interstate travellers flying doughnuts home. Seven years and 40+ stores later, the Australian business collapsed into voluntary administration on 29 October 2010 — a cautionary tale of scaling a destination treat into an everyday commodity.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>QSR / food retail</td>
</tr>
<tr>
<td>Entry year</td>
<td>2003</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Franchise — first international market</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure via over-expansion — administration 2010, later stabilised smaller</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & the balance sheet', 'people-and-the-balance-sheet', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Australia was Krispy Kreme''s first market outside North America, and the launch was a phenomenon: the Penrith store became a destination, with customers travelling hundreds of kilometres and Melburnians carrying boxes home on flights. Scarcity was doing the marketing.</p>', 'Australia was Krispy Kreme''s first market outside North America, and the launch was a phenomenon: the Penrith store became a destination, with customers travelling hundreds of kilometres and Melburnians carrying boxes home on flights. Scarcity was doing the marketing.', 1),
      ('entry-strategy', NULL::text, '<p>Management read the launch frenzy as mass-market demand and expanded aggressively — more than 40 stores by 2010, plus wholesale distribution through petrol stations and convenience channels. Ubiquity destroyed the scarcity that made the brand special, while an expensive store network and long distribution runs pushed up fixed costs.</p>', 'Management read the launch frenzy as mass-market demand and expanded aggressively — more than 40 stores by 2010, plus wholesale distribution through petrol stations and convenience channels. Ubiquity destroyed the scarcity that made the brand special, while an expensive store network and long distribution runs pushed up fixed costs.', 2),
      ('people-and-the-balance-sheet', NULL::text, '<ul>
<li><strong>A lawyer-turned-doughnut-baron ran the entry.</strong> Krispy Kreme Australia was led by chief executive (later chairman) John McGuigan, who went from "an office and no employees" to a Huntingwood factory with 120 staff within a year of launch — and personally negotiated store sites against sceptical landlords.</li>
<li><strong>The debt had a famous name on it.</strong> At administration the company owed $15 million to John Kinghorn, the RAMS Home Loans co-founder and a major investor — the business had posted a $12 million loss in 2008 and recovered almost nothing since.</li>
<li><strong>Administration was surgical, not terminal.</strong> Administrators from Smith Hancock were appointed with secured-creditor support; the company emerged in December 2010 with nearly half its underperforming stores closed and, per McGuigan, "much more financially" sound.</li>
</ul>', '- **A lawyer-turned-doughnut-baron ran the entry.** Krispy Kreme Australia was led by chief executive (later chairman) John McGuigan, who went from "an office and no employees" to a Huntingwood factory with 120 staff within a year of launch — and personally negotiated store sites against sceptical landlords.
- **The debt had a famous name on it.** At administration the company owed \$15 million to John Kinghorn, the RAMS Home Loans co-founder and a major investor — the business had posted a \$12 million loss in 2008 and recovered almost nothing since.
- **Administration was surgical, not terminal.** Administrators from Smith Hancock were appointed with secured-creditor support; the company emerged in December 2010 with nearly half its underperforming stores closed and, per McGuigan, "much more financially" sound.', 3),
      ('failure-factors', NULL::text, '<ul>
<li><strong>Misreading novelty as durable demand</strong>: launch queues were an event, not a run-rate</li>
<li><strong>Ubiquity killed the brand</strong>: once doughnuts were in every servo, the destination pull — and pricing power — evaporated</li>
<li><strong>Cost structure</strong>: pricey retail rents and high distribution costs across Australia''s geography outran falling sales</li>
<li><strong>Specialty vs volume confusion</strong>: analysts noted it needed to operate as a specialty retailer, but opened ~50 stores in a few years</li>
</ul>', '- **Misreading novelty as durable demand**: launch queues were an event, not a run-rate
- **Ubiquity killed the brand**: once doughnuts were in every servo, the destination pull — and pricing power — evaporated
- **Cost structure**: pricey retail rents and high distribution costs across Australia''s geography outran falling sales
- **Specialty vs volume confusion**: analysts noted it needed to operate as a specialty retailer, but opened \~50 stores in a few years', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>First store: Penrith, 19 June 2003 — Krispy Kreme''s first outside North America</li>
<li>40+ stores by 2010</li>
<li>Voluntary administration 29 October 2010; multiple store closures that November; SA assets sold to Peregrine Group</li>
<li>Exited administration December 2010 and rebuilt profitably with a smaller footprint, resuming expansion from 2014</li>
</ul>', '- First store: Penrith, 19 June 2003 — Krispy Kreme''s first outside North America
- 40+ stores by 2010
- Voluntary administration 29 October 2010; multiple store closures that November; SA assets sold to Peregrine Group
- Exited administration December 2010 and rebuilt profitably with a smaller footprint, resuming expansion from 2014', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Krispy Kreme''s Australian arc is the over-expansion classic: treat launch euphoria as a marketing asset to be rationed, not a demand curve to be extrapolated. The post-administration recovery shows the model worked — at a third of the footprint.</p>', 'Krispy Kreme''s Australian arc is the over-expansion classic: treat launch euphoria as a marketing asset to be rationed, not a demand curve to be extrapolated. The post-administration recovery shows the model worked — at a third of the footprint.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Krispy Kreme', 'United States', 'Australia',
       'QSR / food retail', '2003', 'unsuccessful'
FROM item
WHERE 'Krispy Kreme' IS NOT NULL;

-- how-guzman-y-gomez-filled-australias-mexican-fast-food-gap-and-hit-the-asx
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-guzman-y-gomez-filled-australias-mexican-fast-food-gap-and-hit-the-asx', 'How Guzman y Gomez Filled Australia''s Mexican Fast-Food Gap and Hit the ASX', 'draft', 'case_study',
         'e1b408ed-bf02-4b29-b63b-a9a417616513'::uuid, 'Founded in Sydney in 2006 by New Yorkers Steven Marks and Robert Hazan, Guzman y Gomez built Mexican fast food into an Australian institution — culminating…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-guzman-y-gomez-filled-australias-mexican-fast-food-gap-and-hit-the-asx')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Founded in Sydney in 2006 by New Yorkers Steven Marks and Robert Hazan, Guzman y Gomez built Mexican fast food into an Australian institution — culminating in the ASX''s biggest IPO since 2021. Shares priced at A$22 surged 36% to close at A$30 on debut day (20 June 2024), valuing GYG at $3 billion.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia (Sydney; US-born founders)</td>
</tr>
<tr>
<td>Sector</td>
<td>QSR / fast food</td>
</tr>
<tr>
<td>Entry year</td>
<td>2006 (ASX IPO 2024)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic launch, company + franchise stores</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success (with US expansion caveats)</td>
</tr>
</table>', 'Founded in Sydney in 2006 by New Yorkers Steven Marks and Robert Hazan, Guzman y Gomez built Mexican fast food into an Australian institution — culminating in the ASX''s biggest IPO since 2021. Shares priced at A\$22 surged 36% to close at A\$30 on debut day (20 June 2024), valuing GYG at \$3 billion.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia (Sydney; US-born founders)</td>
</tr>
<tr>
<td>Sector</td>
<td>QSR / fast food</td>
</tr>
<tr>
<td>Entry year</td>
<td>2006 (ASX IPO 2024)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic launch, company + franchise stores</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success (with US expansion caveats)</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Founding & GTM strategy', 'founding-and-gtm-strategy', 2),
      ('Founders & early build', 'founders-and-early-build', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Marks, a former hedge-fund trader, and Hazan saw a gap in Australia: no credible Mexican fast-food player, and a QSR market dominated by legacy burger and chicken chains. Rather than import a US franchise, they built a local brand from scratch — named after childhood friends — and positioned it against "fake fast food" with fresh-made, clean-ingredient positioning.</p>', 'Marks, a former hedge-fund trader, and Hazan saw a gap in Australia: no credible Mexican fast-food player, and a QSR market dominated by legacy burger and chicken chains. Rather than import a US franchise, they built a local brand from scratch — named after childhood friends — and positioned it against "fake fast food" with fresh-made, clean-ingredient positioning.', 1),
      ('founding-and-gtm-strategy', NULL::text, '<p>GYG opened its first restaurant in Newtown, Sydney, and grew deliberately: prove the menu and unit economics in company-owned stores, then scale through franchising, drive-thrus and 24/7 formats. The brand invested heavily in speed of service and breakfast to lift restaurant productivity toward McDonald''s-style economics — while marketing itself as the anti-establishment challenger.</p>', 'GYG opened its first restaurant in Newtown, Sydney, and grew deliberately: prove the menu and unit economics in company-owned stores, then scale through franchising, drive-thrus and 24/7 formats. The brand invested heavily in speed of service and breakfast to lift restaurant productivity toward McDonald''s-style economics — while marketing itself as the anti-establishment challenger.', 2),
      ('founders-and-early-build', NULL::text, '<ul>
<li><strong>Two New Yorkers homesick for Mexican food.</strong> Steven Marks (ex-hedge fund) and Robert Hazan (fashion wholesale and retail) were childhood best friends from New York who both landed in Sydney and missed the fresh Mexican flavours of home — the brand name honours two other childhood friends, Guzman and Gomez.</li>
<li><strong>King Street, Newtown, 2006 — still trading.</strong> The first restaurant opened in Newtown, with Bondi Junction and Kings Cross following within a year, 12 stores by April 2012 and 100 Australian stores within 12 years.</li>
<li><strong>Authenticity was hired, speed was engineered.</strong> Marks recruited chefs from Mexico to set the food standard, while the founders designed a bespoke operating platform and sticker system — among the fastest fresh-food operating systems in QSR — and grew many early team members into today''s franchisees.</li>
<li><strong>International came early.</strong> Singapore opened at the end of 2013 and Tokyo in April 2015 — years before the US attempt — giving GYG offshore reps long before its IPO.</li>
</ul>', '- **Two New Yorkers homesick for Mexican food.** Steven Marks (ex-hedge fund) and Robert Hazan (fashion wholesale and retail) were childhood best friends from New York who both landed in Sydney and missed the fresh Mexican flavours of home — the brand name honours two other childhood friends, Guzman and Gomez.
- **King Street, Newtown, 2006 — still trading.** The first restaurant opened in Newtown, with Bondi Junction and Kings Cross following within a year, 12 stores by April 2012 and 100 Australian stores within 12 years.
- **Authenticity was hired, speed was engineered.** Marks recruited chefs from Mexico to set the food standard, while the founders designed a bespoke operating platform and sticker system — among the fastest fresh-food operating systems in QSR — and grew many early team members into today''s franchisees.
- **International came early.** Singapore opened at the end of 2013 and Tokyo in April 2015 — years before the US attempt — giving GYG offshore reps long before its IPO.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Category white space</strong>: first scaled Mexican QSR brand in Australia, with no incumbent to displace</li>
<li><strong>Unit-economics obsession</strong>: drive-thru formats and daypart expansion drove sales per store to industry-leading levels</li>
<li><strong>Brand authenticity</strong>: challenger positioning against processed fast food resonated with younger consumers</li>
<li><strong>Patient scaling</strong>: 18 years from first store to IPO</li>
</ul>', '- **Category white space**: first scaled Mexican QSR brand in Australia, with no incumbent to displace
- **Unit-economics obsession**: drive-thru formats and daypart expansion drove sales per store to industry-leading levels
- **Brand authenticity**: challenger positioning against processed fast food resonated with younger consumers
- **Patient scaling**: 18 years from first store to IPO', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>IPO 20 June 2024 at A$22; closed day one at A$30 (+36%), $3 billion valuation — biggest ASX IPO since 2021</li>
<li>Caveat for the case study: by May 2026 GYG''s US expansion was struggling, with store closures and a shareholder class action within six months — a reminder that home-market dominance doesn''t guarantee export success</li>
</ul>', '- IPO 20 June 2024 at A\$22; closed day one at A\$30 (+36%), \$3 billion valuation — biggest ASX IPO since 2021
- Caveat for the case study: by May 2026 GYG''s US expansion was struggling, with store closures and a shareholder class action within six months — a reminder that home-market dominance doesn''t guarantee export success', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>GYG is the inverse of most failed inbound QSR stories: it won by building a local brand for a genuine category gap and refining unit economics for nearly two decades before seeking public capital.</p>', 'GYG is the inverse of most failed inbound QSR stories: it won by building a local brand for a genuine category gap and refining unit economics for nearly two decades before seeking public capital.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Guzman y Gomez', 'Australia', 'Australia',
       'QSR / fast food', '2006', 'successful'
FROM item
WHERE 'Guzman y Gomez' IS NOT NULL;

-- how-xinja-grew-deposits-it-couldnt-afford-and-handed-back-its-banking-licence
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-xinja-grew-deposits-it-couldnt-afford-and-handed-back-its-banking-licence', 'How Xinja Grew Deposits It Couldn''t Afford and Handed Back Its Banking Licence', 'draft', 'case_study',
         '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'Xinja was only the second Australian neobank to win a full banking licence (2019) — and the first to hand it back, exiting banking in December 2020. It had…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-xinja-grew-deposits-it-couldnt-afford-and-handed-back-its-banking-licence')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Xinja was only the second Australian neobank to win a full banking licence (2019) — and the first to hand it back, exiting banking in December 2020. It had gathered $457 million in deposits paying market-leading interest, with no lending product generating a cent of income, while betting its survival on a $430 million Dubai investment that never arrived.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia</td>
</tr>
<tr>
<td>Sector</td>
<td>Banking / neobank fintech</td>
</tr>
<tr>
<td>Entry year</td>
<td>2017 (full ADI licence 2019)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic greenfield neobank</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — returned banking licence December 2020</td>
</tr>
</table>', 'Xinja was only the second Australian neobank to win a full banking licence (2019) — and the first to hand it back, exiting banking in December 2020. It had gathered \$457 million in deposits paying market-leading interest, with no lending product generating a cent of income, while betting its survival on a \$430 million Dubai investment that never arrived.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia</td>
</tr>
<tr>
<td>Sector</td>
<td>Banking / neobank fintech</td>
</tr>
<tr>
<td>Entry year</td>
<td>2017 (full ADI licence 2019)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic greenfield neobank</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — returned banking licence December 2020</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('What happened', 'what-happened', 2),
      ('People & the runaway launch', 'people-and-the-runaway-launch', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>The 2018 Banking Royal Commission created a regulatory window for challenger banks, and APRA began granting new licences for the first time in years. Xinja positioned itself as the rebellious, customer-first neobank, raising via crowdfunding and venture rounds and winning its full authorised deposit-taking institution (ADI) licence in 2019.</p>', 'The 2018 Banking Royal Commission created a regulatory window for challenger banks, and APRA began granting new licences for the first time in years. Xinja positioned itself as the rebellious, customer-first neobank, raising via crowdfunding and venture rounds and winning its full authorised deposit-taking institution (ADI) licence in 2019.', 1),
      ('what-happened', NULL::text, '<p>Xinja launched its "Stash" savings account with one of the market''s highest interest rates — before it had any lending products to earn revenue against those deposits. Deposits flooded in ($457 million), each dollar adding to the interest bill of a bank with no income. The plan to bridge the gap — a $430 million injection from Dubai-based World Investments — never materialised, and a $9 million emergency raise couldn''t close the hole. In December 2020 Xinja returned its licence and gave back all deposits; in October 2025 APRA disqualified two former directors over the collapse.</p>', 'Xinja launched its "Stash" savings account with one of the market''s highest interest rates — before it had any lending products to earn revenue against those deposits. Deposits flooded in (\$457 million), each dollar adding to the interest bill of a bank with no income. The plan to bridge the gap — a \$430 million injection from Dubai-based World Investments — never materialised, and a \$9 million emergency raise couldn''t close the hole. In December 2020 Xinja returned its licence and gave back all deposits; in October 2025 APRA disqualified two former directors over the collapse.', 2),
      ('people-and-the-runaway-launch', NULL::text, '<ul>
<li><strong>Founded and fronted by Eric Wilson.</strong> Wilson founded Xinja in 2017, took it through crowdfunding raises in 2018, a restricted licence in December 2018 and the full ADI licence on 9 September 2019, launching accounts on 15 January 2020 under its own BSB (775-775).</li>
<li><strong>Growth arrived 19 days into the plan.</strong> The 2.5% Stash account hit $100 million in deposits within 19 days of launch — "we expected to do about $120 million in deposits in a year," Wilson said — and quickly passed $300 million from 25,000 customers, each dollar deepening the losses.</li>
<li><strong>The retreat was public and painful.</strong> Xinja cut the rate to 1.8% and closed the account to new customers after the RBA''s March 2020 rate cuts — and when the end came, APRA''s investigation into investor "side agreements" led to the first disqualifications under the Financial Accountability Regime: Wilson for eight years, non-executive director Craig Swanger for ten.</li>
</ul>', '- **Founded and fronted by Eric Wilson.** Wilson founded Xinja in 2017, took it through crowdfunding raises in 2018, a restricted licence in December 2018 and the full ADI licence on 9 September 2019, launching accounts on 15 January 2020 under its own BSB (775-775).
- **Growth arrived 19 days into the plan.** The 2.5% Stash account hit \$100 million in deposits within 19 days of launch — "we expected to do about \$120 million in deposits in a year," Wilson said — and quickly passed \$300 million from 25,000 customers, each dollar deepening the losses.
- **The retreat was public and painful.** Xinja cut the rate to 1.8% and closed the account to new customers after the RBA''s March 2020 rate cuts — and when the end came, APRA''s investigation into investor "side agreements" led to the first disqualifications under the Financial Accountability Regime: Wilson for eight years, non-executive director Craig Swanger for ten.', 3),
      ('failure-factors', NULL::text, '<ul>
<li><strong>Balance-sheet sequencing backwards</strong>: paying top-of-market interest on deposits with no lending revenue is a business model that loses money faster as it grows</li>
<li><strong>Funding dependency on a single speculative investor</strong>: the Dubai lifeline was announced before it was secured, and never arrived</li>
<li><strong>Growth marketing ahead of unit economics</strong>: customer acquisition succeeded brilliantly at delivering losses</li>
<li><strong>Regulatory capital pressure</strong>: APRA''s requirements left no runway once funding fell through</li>
</ul>', '- **Balance-sheet sequencing backwards**: paying top-of-market interest on deposits with no lending revenue is a business model that loses money faster as it grows
- **Funding dependency on a single speculative investor**: the Dubai lifeline was announced before it was secured, and never arrived
- **Growth marketing ahead of unit economics**: customer acquisition succeeded brilliantly at delivering losses
- **Regulatory capital pressure**: APRA''s requirements left no runway once funding fell through', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>Second Australian neobank to receive a full ADI licence (2019)</li>
<li>$457 million in deposits; zero lending income</li>
<li>Failed $430 million World Investments (Dubai) deal; $9 million emergency raise</li>
<li>Licence returned December 2020; two directors disqualified by APRA in October 2025</li>
</ul>', '- Second Australian neobank to receive a full ADI licence (2019)
- \$457 million in deposits; zero lending income
- Failed \$430 million World Investments (Dubai) deal; \$9 million emergency raise
- Licence returned December 2020; two directors disqualified by APRA in October 2025', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Xinja is the definitive sequencing failure: in banking, revenue products must precede (or accompany) deposit growth. Growth that amplifies losses is not traction — and a market entry strategy that depends on one unsecured funding promise is a countdown clock.</p>', 'Xinja is the definitive sequencing failure: in banking, revenue products must precede (or accompany) deposit growth. Growth that amplifies losses is not traction — and a market entry strategy that depends on one unsecured funding promise is a countdown clock.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Xinja', 'Australia', 'Australia',
       'Banking / neobank fintech', '2017', 'unsuccessful'
FROM item
WHERE 'Xinja' IS NOT NULL;

-- how-koala-won-australian-mattresses-with-four-hour-delivery-and-a-120-night-trial
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-koala-won-australian-mattresses-with-four-hour-delivery-and-a-120-night-trial', 'How Koala Won Australian Mattresses With Four-Hour Delivery and a 120-Night Trial', 'draft', 'case_study',
         'e1b408ed-bf02-4b29-b63b-a9a417616513'::uuid, 'Koala launched in November 2015 with less than $2,000 of founders'' capital — and sold $1 million of mattresses in its first 80 days. Founders Dany Milham…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-koala-won-australian-mattresses-with-four-hour-delivery-and-a-120-night-trial')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Koala launched in November 2015 with less than $2,000 of founders'' capital — and sold $1 million of mattresses in its first 80 days. Founders Dany Milham and Mitch Taylor turned over $13 million in year one, built revenue to ~$197.9 million by FY2025, and took the company to a ~$300 million ASX IPO in March 2026.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia</td>
</tr>
<tr>
<td>Sector</td>
<td>D2C e-commerce / furniture</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic direct-to-consumer launch</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — ASX IPO March 2026</td>
</tr>
</table>', 'Koala launched in November 2015 with less than \$2,000 of founders'' capital — and sold \$1 million of mattresses in its first 80 days. Founders Dany Milham and Mitch Taylor turned over \$13 million in year one, built revenue to \~\$197.9 million by FY2025, and took the company to a \~\$300 million ASX IPO in March 2026.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia</td>
</tr>
<tr>
<td>Sector</td>
<td>D2C e-commerce / furniture</td>
</tr>
<tr>
<td>Entry year</td>
<td>2015</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic direct-to-consumer launch</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — ASX IPO March 2026</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Founding & GTM strategy', 'founding-and-gtm-strategy', 2),
      ('Founders & brand mechanics', 'founders-and-brand-mechanics', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Mattress retail in 2015 Australia meant showrooms, commissioned salespeople and opaque pricing. The US bed-in-a-box wave (Casper) had proven the D2C model overseas but no one had localised it. Milham and Taylor bet that a single excellent mattress, sold online with risk reversal, could take the category.</p>', 'Mattress retail in 2015 Australia meant showrooms, commissioned salespeople and opaque pricing. The US bed-in-a-box wave (Casper) had proven the D2C model overseas but no one had localised it. Milham and Taylor bet that a single excellent mattress, sold online with risk reversal, could take the category.', 1),
      ('founding-and-gtm-strategy', NULL::text, '<p>Koala launched with one product and two killer offers: a 120-night free trial and four-hour delivery in Sydney — attacking the two biggest objections to buying a mattress online (can''t try it; can''t wait for it). Social-first marketing, an unmistakably Australian brand (koala adoption with every purchase), and aggressive customer-experience benchmarks did the rest. The range later expanded across furniture, and the company exported the playbook to Japan, the US and UK.</p>', 'Koala launched with one product and two killer offers: a 120-night free trial and four-hour delivery in Sydney — attacking the two biggest objections to buying a mattress online (can''t try it; can''t wait for it). Social-first marketing, an unmistakably Australian brand (koala adoption with every purchase), and aggressive customer-experience benchmarks did the rest. The range later expanded across furniture, and the company exported the playbook to Japan, the US and UK.', 2),
      ('founders-and-brand-mechanics', NULL::text, '<ul>
<li><strong>Childhood mates from Byron Bay.</strong> Dany Milham and Mitch Taylor founded Koala in November 2015 and ran everything themselves in the early days, headquartering the company in Sydney.</li>
<li><strong>The pitch was an attack on markup.</strong> Milham''s founding argument: mattresses cost a few hundred dollars to make but carried up to 1,000% markup through showroom overheads and distribution — Koala''s four-hour delivery in Sydney, Melbourne and Brisbane offered the product at a fraction of the price of mattresses that took weeks to arrive.</li>
<li><strong>The koala wasn''t just a logo.</strong> Every purchase funded a koala adoption — first with Port Macquarie''s Koala Hospital, later expanding into a global WWF partnership — hard-wiring the conservation story into the unit economics of every sale.</li>
</ul>', '- **Childhood mates from Byron Bay.** Dany Milham and Mitch Taylor founded Koala in November 2015 and ran everything themselves in the early days, headquartering the company in Sydney.
- **The pitch was an attack on markup.** Milham''s founding argument: mattresses cost a few hundred dollars to make but carried up to 1,000% markup through showroom overheads and distribution — Koala''s four-hour delivery in Sydney, Melbourne and Brisbane offered the product at a fraction of the price of mattresses that took weeks to arrive.
- **The koala wasn''t just a logo.** Every purchase funded a koala adoption — first with Port Macquarie''s Koala Hospital, later expanding into a global WWF partnership — hard-wiring the conservation story into the unit economics of every sale.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Risk reversal as the core offer</strong>: the 120-night trial made the online purchase safer than in-store</li>
<li><strong>Logistics as marketing</strong>: four-hour delivery was a headline-grabbing operational feat competitors couldn''t match</li>
<li><strong>Brand nationalism done well</strong>: authentic Australian identity plus conservation partnerships built fast affinity</li>
<li><strong>Extreme capital efficiency</strong>: sub-$2,000 founding capital to $13 million year-one turnover</li>
</ul>', '- **Risk reversal as the core offer**: the 120-night trial made the online purchase safer than in-store
- **Logistics as marketing**: four-hour delivery was a headline-grabbing operational feat competitors couldn''t match
- **Brand nationalism done well**: authentic Australian identity plus conservation partnerships built fast affinity
- **Extreme capital efficiency**: sub-\$2,000 founding capital to \$13 million year-one turnover', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>$1 million in sales in the first 80 days; $13 million turnover in year one</li>
<li>FY2025 revenue ~$197.9 million</li>
<li>March 2026 ASX IPO at ~$300 million; founders'' stakes worth $63.3 million and $54 million</li>
<li>International expansion into Japan, the US and UK</li>
</ul>', '- \$1 million in sales in the first 80 days; \$13 million turnover in year one
- FY2025 revenue \~\$197.9 million
- March 2026 ASX IPO at \~\$300 million; founders'' stakes worth \$63.3 million and \$54 million
- International expansion into Japan, the US and UK', 5),
      ('lessons-for-market-entrants', NULL::text, '<p>Koala shows how a proven overseas model can be won locally by whoever localises it hardest: the trial, the delivery promise and the brand were all engineered specifically for Australian buyers.</p>', 'Koala shows how a proven overseas model can be won locally by whoever localises it hardest: the trial, the delivery promise and the brand were all engineered specifically for Australian buyers.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Koala', 'Australia', 'Australia',
       'D2C e-commerce / furniture', '2015', 'successful'
FROM item
WHERE 'Koala' IS NOT NULL;

-- how-spotify-converted-australias-music-pirates-into-paying-subscribers
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-spotify-converted-australias-music-pirates-into-paying-subscribers', 'How Spotify Converted Australia''s Music Pirates Into Paying Subscribers', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When Spotify launched in Australia on 22 May 2012, it arrived more than six months later than planned — a delay it chose deliberately, refusing to go live…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-spotify-converted-australias-music-pirates-into-paying-subscribers')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When Spotify launched in Australia on 22 May 2012, it arrived more than six months later than planned — a delay it chose deliberately, refusing to go live until it had signed deals with every major record label and could offer its full catalogue of more than 16 million tracks from day one. The licensing-first entry, paired with a freemium model positioned squarely against piracy, made Australia one of Spotify''s strongest markets.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Sweden</td>
</tr>
<tr>
<td>Sector</td>
<td>Music streaming</td>
</tr>
<tr>
<td>Entry year</td>
<td>2012</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct digital launch, delayed until full local licensing was secured</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — category leader; Australia became a top per-capita market</td>
</tr>
</table>', 'When Spotify launched in Australia on 22 May 2012, it arrived more than six months later than planned — a delay it chose deliberately, refusing to go live until it had signed deals with every major record label and could offer its full catalogue of more than 16 million tracks from day one. The licensing-first entry, paired with a freemium model positioned squarely against piracy, made Australia one of Spotify''s strongest markets.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Sweden</td>
</tr>
<tr>
<td>Sector</td>
<td>Music streaming</td>
</tr>
<tr>
<td>Entry year</td>
<td>2012</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct digital launch, delayed until full local licensing was secured</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — category leader; Australia became a top per-capita market</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & local footprint', 'team-and-local-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>By 2012 the Australian recorded music market had endured a decade of piracy-driven decline, and legal digital music largely meant iTunes downloads. A handful of sub-scale local streaming services (Songl, JB Hi-Fi Now, MOG, Rdio) had partial catalogues and little traction. Spotify, founded in Sweden and live since 2008, had grown to roughly 10 million users across 16 countries and was expanding market by market — with Australia among its first launches beyond Europe and the US.</p>', 'By 2012 the Australian recorded music market had endured a decade of piracy-driven decline, and legal digital music largely meant iTunes downloads. A handful of sub-scale local streaming services (Songl, JB Hi-Fi Now, MOG, Rdio) had partial catalogues and little traction. Spotify, founded in Sweden and live since 2008, had grown to roughly 10 million users across 16 countries and was expanding market by market — with Australia among its first launches beyond Europe and the US.', 1),
      ('entry-strategy', NULL::text, '<ul>
<li><strong>Licensing before launch.</strong> Spotify delayed its Australian launch by more than six months to complete negotiations with all the major record labels, arriving with a complete catalogue rather than the partial libraries that hobbled local rivals.</li>
<li><strong>Freemium as an anti-piracy wedge.</strong> A free, ad-supported tier (30-day unlimited trial, then 10 hours of streaming per month) was pitched as the legal alternative to piracy — competing with ''free'' rather than asking pirates to jump straight to paying.</li>
<li><strong>Premium conversion funnel.</strong> Offline listening, mobile access and ad-free playback at $11.99 a month gave free users a clear upgrade path.</li>
<li><strong>Local partners and social distribution.</strong> Spotify launched with local marketing partners and deep Facebook integration, letting playlist sharing do the customer acquisition.</li>
<li><strong>Bring the industry along.</strong> Per-stream royalties plus a share of subscription revenue gave labels a stake in Spotify''s growth — even as some local artists publicly questioned payout rates at launch.</li>
</ul>', '- **Licensing before launch.** Spotify delayed its Australian launch by more than six months to complete negotiations with all the major record labels, arriving with a complete catalogue rather than the partial libraries that hobbled local rivals.
- **Freemium as an anti-piracy wedge.** A free, ad-supported tier (30-day unlimited trial, then 10 hours of streaming per month) was pitched as the legal alternative to piracy — competing with ''free'' rather than asking pirates to jump straight to paying.
- **Premium conversion funnel.** Offline listening, mobile access and ad-free playback at \$11.99 a month gave free users a clear upgrade path.
- **Local partners and social distribution.** Spotify launched with local marketing partners and deep Facebook integration, letting playlist sharing do the customer acquisition.
- **Bring the industry along.** Per-stream royalties plus a share of subscription revenue gave labels a stake in Spotify''s growth — even as some local artists publicly questioned payout rates at launch.', 2),
      ('team-and-local-footprint', NULL::text, '<ul>
<li><strong>Hire a proven local launcher first.</strong> Spotify''s first Australian employee was Kate Vale, hired in November 2011 as Managing Director ANZ — six months before launch. Vale had been Google''s first in-region hire in 2002, building its ANZ sales operation from her lounge room to the country''s largest digital ad business, and then ran YouTube ANZ from 2009 — a launch-from-zero résumé matched exactly to the job.</li>
<li><strong>Small local team, global product.</strong> Vale built the Sydney-based team from scratch, running label relations, advertising sales and launch marketing locally (with Renee Chambers on the launch marketing side) while product and engineering stayed global. Sydney grew into Spotify''s largest Australian office and a springboard for its Asian expansion.</li>
<li><strong>Continuity through scale-up.</strong> Vale led ANZ for five years until her 2017 departure, by which time Australia was one of Spotify''s strongest per-capita markets and a favoured test market for new features.</li>
</ul>', '- **Hire a proven local launcher first.** Spotify''s first Australian employee was Kate Vale, hired in November 2011 as Managing Director ANZ — six months before launch. Vale had been Google''s first in-region hire in 2002, building its ANZ sales operation from her lounge room to the country''s largest digital ad business, and then ran YouTube ANZ from 2009 — a launch-from-zero résumé matched exactly to the job.
- **Small local team, global product.** Vale built the Sydney-based team from scratch, running label relations, advertising sales and launch marketing locally (with Renee Chambers on the launch marketing side) while product and engineering stayed global. Sydney grew into Spotify''s largest Australian office and a springboard for its Asian expansion.
- **Continuity through scale-up.** Vale led ANZ for five years until her 2017 departure, by which time Australia was one of Spotify''s strongest per-capita markets and a favoured test market for new features.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Complete catalogue at launch</strong>: in licensed-content businesses the catalogue is the product; Spotify never gave users a reason to look elsewhere</li>
<li><strong>The free tier competed with piracy, not with premium</strong>: usage caps and feature gaps kept the upgrade incentive intact</li>
<li><strong>Social features as organic growth</strong>: shared playlists and Facebook integration made adoption viral among exactly the young, piracy-prone demographic that mattered</li>
<li><strong>First scaled mover</strong>: no local rival had the capital or label relationships to match the offer</li>
</ul>', '- **Complete catalogue at launch**: in licensed-content businesses the catalogue is the product; Spotify never gave users a reason to look elsewhere
- **The free tier competed with piracy, not with premium**: usage caps and feature gaps kept the upgrade incentive intact
- **Social features as organic growth**: shared playlists and Facebook integration made adoption viral among exactly the young, piracy-prone demographic that mattered
- **First scaled mover**: no local rival had the capital or label relationships to match the offer', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>16+ million licensed tracks available at Australian launch</li>
<li>Roughly 10 million global users across 16 countries at time of entry</li>
<li>Free tier: 30-day unlimited trial, then 10 hours per month; Premium at $11.99 per month</li>
<li>Australia became one of Spotify''s strongest per-capita markets and a favoured test market for new features</li>
<li>Streaming led the Australian recorded music industry back to sustained revenue growth from the mid-2010s after a decade of decline</li>
</ul>', '- 16+ million licensed tracks available at Australian launch
- Roughly 10 million global users across 16 countries at time of entry
- Free tier: 30-day unlimited trial, then 10 hours per month; Premium at \$11.99 per month
- Australia became one of Spotify''s strongest per-capita markets and a favoured test market for new features
- Streaming led the Australian recorded music industry back to sustained revenue growth from the mid-2010s after a decade of decline', 5),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>A deliberate delay beats a broken launch.</strong> Spotify sacrificed six months to guarantee the product was whole on day one.</li>
<li><strong>In licensed-content markets, supply-side deals are the real entry barrier.</strong> Winning the labels first made the consumer launch almost inevitable.</li>
<li><strong>Price against the real competitor.</strong> Spotify''s true rival was piracy at $0, so the entry product had to be free.</li>
<li><strong>Give incumbent gatekeepers economics in your success.</strong> The labels that could have blocked Spotify became its content partners.</li>
</ol>', '1. **A deliberate delay beats a broken launch.** Spotify sacrificed six months to guarantee the product was whole on day one.
2. **In licensed-content markets, supply-side deals are the real entry barrier.** Winning the labels first made the consumer launch almost inevitable.
3. **Price against the real competitor.** Spotify''s true rival was piracy at \$0, so the entry product had to be free.
4. **Give incumbent gatekeepers economics in your success.** The labels that could have blocked Spotify became its content partners.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Spotify', 'Sweden', 'Australia',
       'Music streaming', '2012', 'successful'
FROM item
WHERE 'Spotify' IS NOT NULL;

-- how-uber-outran-australian-regulators-and-legalised-ride-sharing
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-uber-outran-australian-regulators-and-legalised-ride-sharing', 'How Uber Outran Australian Regulators and Legalised Ride-Sharing', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Leaked internal documents — the 2022 ''Uber Files'' — confirmed what Australia''s taxi industry had long alleged: Uber knew it was operating illegally when it…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-uber-outran-australian-regulators-and-legalised-ride-sharing')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Leaked internal documents — the 2022 ''Uber Files'' — confirmed what Australia''s taxi industry had long alleged: Uber knew it was operating illegally when it launched here in 2012, and treated legality as a lobbying problem to be solved after reaching scale. The gamble worked. Within four years of UberX''s arrival, every Australian state and territory had rewritten its transport laws, and Uber was the entrenched market leader.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Ridesharing / mobility platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2012</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct launch without regulatory approval — ''launch first, legalise later''</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — laws changed in every state; dominant market position</td>
</tr>
</table>', 'Leaked internal documents — the 2022 ''Uber Files'' — confirmed what Australia''s taxi industry had long alleged: Uber knew it was operating illegally when it launched here in 2012, and treated legality as a lobbying problem to be solved after reaching scale. The gamble worked. Within four years of UberX''s arrival, every Australian state and territory had rewritten its transport laws, and Uber was the entrenched market leader.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>United States</td>
</tr>
<tr>
<td>Sector</td>
<td>Ridesharing / mobility platform</td>
</tr>
<tr>
<td>Entry year</td>
<td>2012</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Direct launch without regulatory approval — ''launch first, legalise later''</td>
</tr>
<tr>
<td>Outcome</td>
<td>Success — laws changed in every state; dominant market position</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & local footprint', 'team-and-local-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Australian point-to-point transport was regulated state by state, built around scarce taxi licences that traded for hundreds of thousands of dollars, plus costly hire-car licences (around $40,000 in Victoria) with luxury-vehicle requirements. That regime made ridesharing — ordinary people driving ordinary cars for money — simply illegal everywhere in Australia when Uber arrived.</p>', 'Australian point-to-point transport was regulated state by state, built around scarce taxi licences that traded for hundreds of thousands of dollars, plus costly hire-car licences (around \$40,000 in Victoria) with luxury-vehicle requirements. That regime made ridesharing — ordinary people driving ordinary cars for money — simply illegal everywhere in Australia when Uber arrived.', 1),
      ('entry-strategy', NULL::text, '<ul>
<li><strong>Land quietly with the compliant-ish product.</strong> Uber launched in Sydney in 2012 with its premium black-car service using licensed hire cars — a defensible beachhead that built the brand and operational muscle.</li>
<li><strong>Then launch the illegal one.</strong> UberX — unlicensed drivers in private cars — rolled out from 2014 in breach of every state''s transport laws. The leaked documents show the company understood this clearly.</li>
<li><strong>Absorb enforcement as a customer-acquisition cost.</strong> Uber paid or indemnified drivers'' fines, treating penalties as marketing spend while regulators struggled to enforce at scale.</li>
<li><strong>Weaponise the user base.</strong> Riders and drivers were mobilised to petition politicians. By the time governments moved, hundreds of thousands of voters were habitual users — the documented playbook: launch first, build a loyal base, then lobby aggressively for the law to change.</li>
<li><strong>Pick off fragmented regulators one by one.</strong> The ACT legalised ridesharing first (October 2015), NSW followed in December 2015 with an industry compensation package of around $250 million funded by a per-trip levy, and the remaining states fell into line by 2017–18.</li>
</ul>', '- **Land quietly with the compliant-ish product.** Uber launched in Sydney in 2012 with its premium black-car service using licensed hire cars — a defensible beachhead that built the brand and operational muscle.
- **Then launch the illegal one.** UberX — unlicensed drivers in private cars — rolled out from 2014 in breach of every state''s transport laws. The leaked documents show the company understood this clearly.
- **Absorb enforcement as a customer-acquisition cost.** Uber paid or indemnified drivers'' fines, treating penalties as marketing spend while regulators struggled to enforce at scale.
- **Weaponise the user base.** Riders and drivers were mobilised to petition politicians. By the time governments moved, hundreds of thousands of voters were habitual users — the documented playbook: launch first, build a loyal base, then lobby aggressively for the law to change.
- **Pick off fragmented regulators one by one.** The ACT legalised ridesharing first (October 2015), NSW followed in December 2015 with an industry compensation package of around \$250 million funded by a per-trip levy, and the remaining states fell into line by 2017–18.', 2),
      ('team-and-local-footprint', NULL::text, '<ul>
<li><strong>One founding hire, Silicon Valley-vetted.</strong> Uber''s Australian business began with a single person: David Rohrsheim, an Adelaide-born Stanford MBA and former Draper Fisher Jurvetson venture analyst (and ex-Bain consultant) who pitched CEO Travis Kalanick on Australia''s potential. He launched Sydney in late 2012 as the founding member of the local team and became General Manager for Australia &amp; New Zealand.</li>
<li><strong>Lean city-launch teams.</strong> The early Sydney operation was small and young — the launch team often worked until midnight clearing customer support tickets — replicating Uber''s global playbook of a city GM plus a handful of operations and driver-supply hires per market.</li>
<li><strong>Scale followed legalisation.</strong> As states legalised ridesharing from 2015, Rohrsheim''s team grew to more than 200 people across Australia and New Zealand, expanding city by city into every capital.</li>
</ul>', '- **One founding hire, Silicon Valley-vetted.** Uber''s Australian business began with a single person: David Rohrsheim, an Adelaide-born Stanford MBA and former Draper Fisher Jurvetson venture analyst (and ex-Bain consultant) who pitched CEO Travis Kalanick on Australia''s potential. He launched Sydney in late 2012 as the founding member of the local team and became General Manager for Australia & New Zealand.
- **Lean city-launch teams.** The early Sydney operation was small and young — the launch team often worked until midnight clearing customer support tickets — replicating Uber''s global playbook of a city GM plus a handful of operations and driver-supply hires per market.
- **Scale followed legalisation.** As states legalised ridesharing from 2015, Rohrsheim''s team grew to more than 200 people across Australia and New Zealand, expanding city by city into every capital.', 3),
      ('success-factors', NULL::text, '<ul>
<li><strong>Speed to habit formation</strong>: the service was dramatically better and cheaper than taxis; consumer loyalty formed faster than enforcement could respond</li>
<li><strong>Deep capital</strong>: absorbing fines, subsidising fares and funding a multi-year, multi-state lobbying campaign required a war chest no local rival had</li>
<li><strong>Structural power</strong>: Uber positioned itself as jobs, innovation and consumer choice — politically costly to ban outright</li>
<li><strong>Federation as a feature</strong>: eight separate regulatory battles meant one early win (ACT) created a domino template for the rest</li>
</ul>', '- **Speed to habit formation**: the service was dramatically better and cheaper than taxis; consumer loyalty formed faster than enforcement could respond
- **Deep capital**: absorbing fines, subsidising fares and funding a multi-year, multi-state lobbying campaign required a war chest no local rival had
- **Structural power**: Uber positioned itself as jobs, innovation and consumer choice — politically costly to ban outright
- **Federation as a feature**: eight separate regulatory battles meant one early win (ACT) created a domino template for the rest', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>2012: Sydney launch with licensed hire cars; UberX ridesharing from 2014</li>
<li>October 2015: ACT becomes the first Australian jurisdiction to legalise ridesharing; NSW follows within months with an industry compensation package of around $250 million</li>
<li>By 2017–18: ridesharing legalised in every state and territory</li>
<li>Taxi licence values collapsed from peaks in the hundreds of thousands of dollars; Uber became Australia''s dominant rideshare platform with millions of active users</li>
</ul>', '- 2012: Sydney launch with licensed hire cars; UberX ridesharing from 2014
- October 2015: ACT becomes the first Australian jurisdiction to legalise ridesharing; NSW follows within months with an industry compensation package of around \$250 million
- By 2017–18: ridesharing legalised in every state and territory
- Taxi licence values collapsed from peaks in the hundreds of thousands of dollars; Uber became Australia''s dominant rideshare platform with millions of active users', 5),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>''Launch first, legalise later'' is a capital-intensive strategy.</strong> It only works with deep pockets and a product loved enough to create a political constituency.</li>
<li><strong>Stage the risk.</strong> The compliant black-car beachhead built brand and infrastructure before the contested UberX launch.</li>
<li><strong>Fragmented regulation favours the entrant.</strong> One sympathetic jurisdiction becomes the template that isolates the holdouts.</li>
<li><strong>Count the reputational bill.</strong> The same playbook triggered the global Uber Files backlash — most entrants could not survive that scrutiny, and regulators now watch for it.</li>
</ol>', '1. **''Launch first, legalise later'' is a capital-intensive strategy.** It only works with deep pockets and a product loved enough to create a political constituency.
2. **Stage the risk.** The compliant black-car beachhead built brand and infrastructure before the contested UberX launch.
3. **Fragmented regulation favours the entrant.** One sympathetic jurisdiction becomes the template that isolates the holdouts.
4. **Count the reputational bill.** The same playbook triggered the global Uber Files backlash — most entrants could not survive that scrutiny, and regulators now watch for it.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Uber', 'United States', 'Australia',
       'Ridesharing / mobility platform', '2012', 'successful'
FROM item
WHERE 'Uber' IS NOT NULL;

-- how-quickflix-lost-its-home-market-when-netflix-arrived
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-quickflix-lost-its-home-market-when-netflix-arrived', 'How Quickflix Lost Its Home Market When Netflix Arrived', 'draft', 'case_study',
         'e1b408ed-bf02-4b29-b63b-a9a417616513'::uuid, 'Quickflix beat Netflix to Australian streaming by four years — and was in voluntary administration 13 months after Netflix arrived. Founded in Perth in 2003…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-quickflix-lost-its-home-market-when-netflix-arrived')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Quickflix beat Netflix to Australian streaming by four years — and was in voluntary administration 13 months after Netflix arrived. Founded in Perth in 2003 as Australia''s answer to Netflix''s DVD-by-mail model, it built more than 182,000 subscribers, an ASX listing and an HBO investment. None of it survived contact with the company it had copied.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia (domestic)</td>
</tr>
<tr>
<td>Sector</td>
<td>Streaming video / DVD subscription</td>
</tr>
<tr>
<td>Entry year</td>
<td>2003 (streaming from 2011)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic launch — DVD-by-mail, then first-mover streaming pivot</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — voluntary administration April 2016; wound up 2021</td>
</tr>
</table>', 'Quickflix beat Netflix to Australian streaming by four years — and was in voluntary administration 13 months after Netflix arrived. Founded in Perth in 2003 as Australia''s answer to Netflix''s DVD-by-mail model, it built more than 182,000 subscribers, an ASX listing and an HBO investment. None of it survived contact with the company it had copied.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Australia (domestic)</td>
</tr>
<tr>
<td>Sector</td>
<td>Streaming video / DVD subscription</td>
</tr>
<tr>
<td>Entry year</td>
<td>2003 (streaming from 2011)</td>
</tr>
<tr>
<td>Entry mode</td>
<td>Domestic launch — DVD-by-mail, then first-mover streaming pivot</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — voluntary administration April 2016; wound up 2021</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Founding & GTM strategy', 'founding-and-gtm-strategy', 2),
      ('Founders & base', 'founders-and-base', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Stephen Langsford founded Quickflix in Perth in 2003, importing the DVD-by-mail subscription model Netflix had proven in the US. It listed on the ASX, launched online movie downloads in 2006 and began streaming in 2011 — making it the first major streaming service to operate in Australia. By June 2014 it had more than 182,000 subscribers and had attracted an investment of $10 million from HBO. Then the market it pioneered arrived all at once: Stan launched in January 2015, Netflix in March, and Foxtel''s Presto scaled up — all backed by content budgets and balance sheets Quickflix could not approach.</p>', 'Stephen Langsford founded Quickflix in Perth in 2003, importing the DVD-by-mail subscription model Netflix had proven in the US. It listed on the ASX, launched online movie downloads in 2006 and began streaming in 2011 — making it the first major streaming service to operate in Australia. By June 2014 it had more than 182,000 subscribers and had attracted an investment of \$10 million from HBO. Then the market it pioneered arrived all at once: Stan launched in January 2015, Netflix in March, and Foxtel''s Presto scaled up — all backed by content budgets and balance sheets Quickflix could not approach.', 1),
      ('founding-and-gtm-strategy', NULL::text, '<ul>
<li><strong>Copy a proven overseas model early.</strong> DVD-by-mail subscription modelled directly on Netflix US, localised for Australia years before the original could arrive.</li>
<li><strong>Pivot to streaming ahead of the giants.</strong> Streaming from 2011 gave Quickflix a four-year head start on Netflix''s local launch.</li>
<li><strong>Borrow credibility from a content major.</strong> HBO''s 2013 investment brought marquee association — and redeemable preference shares that would later prove fatal.</li>
<li><strong>Fund growth from the ASX drip.</strong> Repeated small capital raisings rather than a large war chest — workable in a quiet market, ruinous in a land war.</li>
</ul>', '- **Copy a proven overseas model early.** DVD-by-mail subscription modelled directly on Netflix US, localised for Australia years before the original could arrive.
- **Pivot to streaming ahead of the giants.** Streaming from 2011 gave Quickflix a four-year head start on Netflix''s local launch.
- **Borrow credibility from a content major.** HBO''s 2013 investment brought marquee association — and redeemable preference shares that would later prove fatal.
- **Fund growth from the ASX drip.** Repeated small capital raisings rather than a large war chest — workable in a quiet market, ruinous in a land war.', 2),
      ('founders-and-base', NULL::text, '<ul>
<li><strong>A serial Perth founder.</strong> Stephen Langsford co-founded Quickflix with Simon Hodge after two prior exits — internet pioneer Method + Madness (founded 1998, acquired by ASX-listed Sausage Software) and consulting group Change Corporation (acquired by CSG Limited in 2007). Quickflix listed on the ASX in 2005, roughly two years after founding.</li>
<li><strong>Headquartered in Perth for its entire life</strong> — a continent away from the Sydney media establishment that controlled the content deals, capital and partnerships it ultimately needed.</li>
<li><strong>Firsts that didn''t compound.</strong> Quickflix was first in Australia to stream to smart TVs, game consoles and mobile devices, and an early mover in securing Hollywood studio content locally — pioneering work that built the market Netflix later harvested.</li>
</ul>', '- **A serial Perth founder.** Stephen Langsford co-founded Quickflix with Simon Hodge after two prior exits — internet pioneer Method + Madness (founded 1998, acquired by ASX-listed Sausage Software) and consulting group Change Corporation (acquired by CSG Limited in 2007). Quickflix listed on the ASX in 2005, roughly two years after founding.
- **Headquartered in Perth for its entire life** — a continent away from the Sydney media establishment that controlled the content deals, capital and partnerships it ultimately needed.
- **Firsts that didn''t compound.** Quickflix was first in Australia to stream to smart TVs, game consoles and mobile devices, and an early mover in securing Hollywood studio content locally — pioneering work that built the market Netflix later harvested.', 3),
      ('failure-factors', NULL::text, '<ul>
<li><strong>Sub-scale content economics.</strong> Global streamers amortise content across tens of millions of subscribers; Quickflix''s per-subscriber licensing costs were unsustainable against rivals priced at $8.99–$10.</li>
<li><strong>The 2015 pincer.</strong> Netflix, Stan and Presto all launched or scaled within months, resetting price and catalogue expectations overnight; against them Quickflix was widely seen as sluggish and limited.</li>
<li><strong>A poisoned capital structure.</strong> HBO''s redeemable preference shares — later sold to Nine Entertainment, co-owner of rival Stan — sat ahead of ordinary equity and deterred the recapitalisation Quickflix desperately needed.</li>
<li><strong>Legacy cost base.</strong> DVD logistics kept dragging margins while the fight moved to streaming.</li>
</ul>', '- **Sub-scale content economics.** Global streamers amortise content across tens of millions of subscribers; Quickflix''s per-subscriber licensing costs were unsustainable against rivals priced at \$8.99–\$10.
- **The 2015 pincer.** Netflix, Stan and Presto all launched or scaled within months, resetting price and catalogue expectations overnight; against them Quickflix was widely seen as sluggish and limited.
- **A poisoned capital structure.** HBO''s redeemable preference shares — later sold to Nine Entertainment, co-owner of rival Stan — sat ahead of ordinary equity and deterred the recapitalisation Quickflix desperately needed.
- **Legacy cost base.** DVD logistics kept dragging margins while the fight moved to streaming.', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>182,000+ subscribers at peak (June 2014) — the largest local streaming base before Netflix''s arrival</li>
<li>HBO investment of $10 million (2013) for a 15.7% stake; the preference-share stake later passed to Nine Entertainment</li>
<li>Voluntary administration announced 26 April 2016 — 13 months after Netflix''s Australian launch</li>
<li>Relaunched under new owners in late 2016; wound up September 2021</li>
</ul>', '- 182,000+ subscribers at peak (June 2014) — the largest local streaming base before Netflix''s arrival
- HBO investment of \$10 million (2013) for a 15.7% stake; the preference-share stake later passed to Nine Entertainment
- Voluntary administration announced 26 April 2016 — 13 months after Netflix''s Australian launch
- Relaunched under new owners in late 2016; wound up September 2021', 5),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>First-mover advantage without capital scale is a countdown clock.</strong> Quickflix''s four-year head start bought it nothing once global-scale competitors landed.</li>
<li><strong>In content businesses, the moat is the content budget.</strong> Local pioneers cannot out-license a player amortising costs across 50 countries.</li>
<li><strong>Strategic investors can become strategic blockers.</strong> Instrument terms (redeemable preference shares) mattered more than the marquee name attached to them — especially once that stake reached a competitor''s owner.</li>
<li><strong>When a category-defining global brand announces entry, the window to sell or consolidate is before it lands.</strong> Quickflix''s enterprise value peaked the day Netflix confirmed its launch date.</li>
</ol>', '1. **First-mover advantage without capital scale is a countdown clock.** Quickflix''s four-year head start bought it nothing once global-scale competitors landed.
2. **In content businesses, the moat is the content budget.** Local pioneers cannot out-license a player amortising costs across 50 countries.
3. **Strategic investors can become strategic blockers.** Instrument terms (redeemable preference shares) mattered more than the marquee name attached to them — especially once that stake reached a competitor''s owner.
4. **When a category-defining global brand announces entry, the window to sell or consolidate is before it lands.** Quickflix''s enterprise value peaked the day Netflix confirmed its launch date.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Quickflix', 'Australia', 'Australia',
       'Streaming video / DVD subscription', '2003', 'unsuccessful'
FROM item
WHERE 'Quickflix' IS NOT NULL;

-- how-klarna-entered-afterpays-home-turf-with-a-big-bank-alliance
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-klarna-entered-afterpays-home-turf-with-a-big-bank-alliance', 'How Klarna Entered Afterpay''s Home Turf With a Big-Bank Alliance', 'draft', 'case_study',
         '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'Klarna entered Australia in January 2020 holding what looked like an unbeatable hand: a 50:50 joint venture with Commonwealth Bank, more than US$300 million…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-klarna-entered-afterpays-home-turf-with-a-big-bank-alliance')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Klarna entered Australia in January 2020 holding what looked like an unbeatable hand: a 50:50 joint venture with Commonwealth Bank, more than US$300 million of CBA investment, and distribution through the CommBank app''s 7 million digitally active customers. It still couldn''t dent Afterpay and Zip in the country that invented buy-now-pay-later. Local losses hit $56 million in 2021 and the Australian push was wound back — even as CBA''s investment stake soared in value.</p>
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Sweden</td>
</tr>
<tr>
<td>Sector</td>
<td>Fintech — buy now, pay later</td>
</tr>
<tr>
<td>Entry year</td>
<td>2020</td>
</tr>
<tr>
<td>Entry mode</td>
<td>50:50 joint venture with Commonwealth Bank; distribution via CommBank app</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — could not displace incumbents; local push wound back (service continues at reduced scale)</td>
</tr>
</table>', 'Klarna entered Australia in January 2020 holding what looked like an unbeatable hand: a 50:50 joint venture with Commonwealth Bank, more than US\$300 million of CBA investment, and distribution through the CommBank app''s 7 million digitally active customers. It still couldn''t dent Afterpay and Zip in the country that invented buy-now-pay-later. Local losses hit \$56 million in 2021 and the Australian push was wound back — even as CBA''s investment stake soared in value.
<table header-column="true">
<tr>
<td>Origin country</td>
<td>Sweden</td>
</tr>
<tr>
<td>Sector</td>
<td>Fintech — buy now, pay later</td>
</tr>
<tr>
<td>Entry year</td>
<td>2020</td>
</tr>
<tr>
<td>Entry mode</td>
<td>50:50 joint venture with Commonwealth Bank; distribution via CommBank app</td>
</tr>
<tr>
<td>Outcome</td>
<td>Failure — could not displace incumbents; local push wound back (service continues at reduced scale)</td>
</tr>
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & first partners', 'team-and-first-partners', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      ('background', NULL::text, '<p>Buy-now-pay-later was born in Australia. By 2020 Afterpay — founded in Sydney in 2014 — had millions of local customers and near-default presence at fashion and beauty checkouts, with Zip a strong second. BNPL wasn''t a new behaviour Klarna could introduce; it was an entrenched habit attached to local brands. Klarna, Europe''s BNPL giant with 85 million customers and 200,000 merchants globally, was entering the one market where its category was already someone else''s home turf.</p>', 'Buy-now-pay-later was born in Australia. By 2020 Afterpay — founded in Sydney in 2014 — had millions of local customers and near-default presence at fashion and beauty checkouts, with Zip a strong second. BNPL wasn''t a new behaviour Klarna could introduce; it was an entrenched habit attached to local brands. Klarna, Europe''s BNPL giant with 85 million customers and 200,000 merchants globally, was entering the one market where its category was already someone else''s home turf.', 1),
      ('entry-strategy', NULL::text, '<ul>
<li><strong>Buy distribution through an incumbent.</strong> CBA invested US$100 million in Klarna''s August 2019 funding round, lifting its total investment to US$300 million and a 5.5% stake, with 50:50 ownership rights over Klarna''s Australian and New Zealand business.</li>
<li><strong>Launch inside the bank''s app.</strong> From January 2020, CBA customers could register for Klarna directly through the CommBank app — instant access to the country''s largest digital banking base and its data.</li>
<li><strong>Differentiate on model.</strong> Klarna led with a shopping-app approach — shop at any online store via one-time virtual cards, price-drop alerts, wish lists — rather than Afterpay''s merchant-integrated checkout button.</li>
</ul>', '- **Buy distribution through an incumbent.** CBA invested US\$100 million in Klarna''s August 2019 funding round, lifting its total investment to US\$300 million and a 5.5% stake, with 50:50 ownership rights over Klarna''s Australian and New Zealand business.
- **Launch inside the bank''s app.** From January 2020, CBA customers could register for Klarna directly through the CommBank app — instant access to the country''s largest digital banking base and its data.
- **Differentiate on model.** Klarna led with a shopping-app approach — shop at any online store via one-time virtual cards, price-drop alerts, wish lists — rather than Afterpay''s merchant-integrated checkout button.', 2),
      ('team-and-first-partners', NULL::text, '<ul>
<li><strong>Poach the country head from a local rival.</strong> Klarna appointed Francine (Fran) Ereira as General Manager ANZ in January 2020 — a senior executive hired directly from local BNPL incumbent Zip Co, with 20+ years across The Walt Disney Company, Sheridan, eWave and Temando. She started on 3 February, days after the 29 January consumer launch.</li>
<li><strong>Sydney base, bank-side distribution.</strong> The local entity, Klarna Australia Pty Ltd, operated independently from Sydney while leaning on the CommBank app — and CBA''s 7 million digitally active customers — for consumer acquisition rather than building its own acquisition engine.</li>
<li><strong>First merchant logos.</strong> Early direct retail partnerships included Australia Post and Appliances Online, but checkout integrations never approached Afterpay''s near-universal merchant coverage in fashion and beauty.</li>
<li><strong>Early traction undershot.</strong> 160,000 app downloads by May 2020 — a take-up Ereira publicly described as "slightly behind" expectations — rising to about 250,000 users by July 2020.</li>
</ul>', '- **Poach the country head from a local rival.** Klarna appointed Francine (Fran) Ereira as General Manager ANZ in January 2020 — a senior executive hired directly from local BNPL incumbent Zip Co, with 20+ years across The Walt Disney Company, Sheridan, eWave and Temando. She started on 3 February, days after the 29 January consumer launch.
- **Sydney base, bank-side distribution.** The local entity, Klarna Australia Pty Ltd, operated independently from Sydney while leaning on the CommBank app — and CBA''s 7 million digitally active customers — for consumer acquisition rather than building its own acquisition engine.
- **First merchant logos.** Early direct retail partnerships included Australia Post and Appliances Online, but checkout integrations never approached Afterpay''s near-universal merchant coverage in fashion and beauty.
- **Early traction undershot.** 160,000 app downloads by May 2020 — a take-up Ereira publicly described as "slightly behind" expectations — rising to about 250,000 users by July 2020.', 3),
      ('failure-factors', NULL::text, '<ul>
<li><strong>The moat was at the merchant checkout, not in a consumer app.</strong> Afterpay''s button on virtually every relevant checkout was simultaneously a payment option and a free lead-generation channel merchants valued; Klarna''s shop-anywhere model had weaker merchant pull and more consumer friction.</li>
<li><strong>Habit incumbency.</strong> BNPL behaviour was already formed around local brands — Klarna''s global scale meant little to a shopper whose checkout already offered Afterpay and Zip.</li>
<li><strong>Growth without momentum.</strong> Around 250,000 users after five months looked respectable but was a rounding error against Afterpay''s millions — and the gap never closed.</li>
<li><strong>Losses compounding.</strong> Klarna Australia posted a net loss of $56 million in 2021, roughly four times its launch-year loss.</li>
<li><strong>Global retrenchment.</strong> Klarna''s 2022 valuation crash forced worldwide cost-cutting; the sub-scale Australian operation was an obvious casualty and local marketing was slashed.</li>
</ul>', '- **The moat was at the merchant checkout, not in a consumer app.** Afterpay''s button on virtually every relevant checkout was simultaneously a payment option and a free lead-generation channel merchants valued; Klarna''s shop-anywhere model had weaker merchant pull and more consumer friction.
- **Habit incumbency.** BNPL behaviour was already formed around local brands — Klarna''s global scale meant little to a shopper whose checkout already offered Afterpay and Zip.
- **Growth without momentum.** Around 250,000 users after five months looked respectable but was a rounding error against Afterpay''s millions — and the gap never closed.
- **Losses compounding.** Klarna Australia posted a net loss of \$56 million in 2021, roughly four times its launch-year loss.
- **Global retrenchment.** Klarna''s 2022 valuation crash forced worldwide cost-cutting; the sub-scale Australian operation was an obvious casualty and local marketing was slashed.', 4),
      ('key-metrics-and-performance', NULL::text, '<ul>
<li>Launch: January 2020, jointly announced with CBA</li>
<li>CBA investment: US$100 million (August 2019) on top of US$200 million, for a 5.5% stake and 50:50 AU/NZ ownership rights</li>
<li>Around 250,000 Australian users by mid-2020 (roughly 50,000 a month) — against Afterpay''s multi-million local base</li>
<li>Klarna Australia net loss: $56 million in 2021, about four times the prior year</li>
<li>The postscript: Afterpay sold to Block in a deal announced at around A$39 billion (2021), while CBA''s Klarna stake was valued near A$1.2 billion at Klarna''s 2025 US IPO — the investment succeeded even as the market entry failed</li>
</ul>', '- Launch: January 2020, jointly announced with CBA
- CBA investment: US\$100 million (August 2019) on top of US\$200 million, for a 5.5% stake and 50:50 AU/NZ ownership rights
- Around 250,000 Australian users by mid-2020 (roughly 50,000 a month) — against Afterpay''s multi-million local base
- Klarna Australia net loss: \$56 million in 2021, about four times the prior year
- The postscript: Afterpay sold to Block in a deal announced at around A\$39 billion (2021), while CBA''s Klarna stake was valued near A\$1.2 billion at Klarna''s 2025 US IPO — the investment succeeded even as the market entry failed', 5),
      ('lessons-for-market-entrants', NULL::text, '<ol>
<li><strong>Distribution partnerships don''t transfer network effects.</strong> CBA could hand Klarna consumers, but the merchant-side moat had to be rebuilt from scratch — and never was.</li>
<li><strong>Attacking a category in its country of origin means fighting habit, not awareness.</strong> Every BNPL user Klarna wanted already had two local apps and no reason to switch.</li>
<li><strong>A global brand is worth little where local brands defined the category.</strong> Category invention confers a home-ground advantage money struggles to buy.</li>
<li><strong>Structure for optionality.</strong> CBA''s equity upside paid off despite the JV''s market failure — partnership economics can outlive the partnership''s strategic purpose.</li>
</ol>', '1. **Distribution partnerships don''t transfer network effects.** CBA could hand Klarna consumers, but the merchant-side moat had to be rebuilt from scratch — and never was.
2. **Attacking a category in its country of origin means fighting habit, not awareness.** Every BNPL user Klarna wanted already had two local apps and no reason to switch.
3. **A global brand is worth little where local brands defined the category.** Category invention confers a home-ground advantage money struggles to buy.
4. **Structure for optionality.** CBA''s equity upside paid off despite the JV''s market failure — partnership economics can outlive the partnership''s strategic purpose.', 6)
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Klarna', 'Sweden', 'Australia',
       'Fintech — buy now, pay later', '2020', 'unsuccessful'
FROM item
WHERE 'Klarna' IS NOT NULL;

-- how-ocado-entered-australia-as-a-technology-partner-not-a-retailer
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer', 'How Ocado Entered Australia as a Technology Partner, Not a Retailer', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Ocado entered Australia without selling a single grocery. In March 2019, the UK online grocer signed an exclusive services agreement with Coles — its fifth…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-ocado-entered-australia-as-a-technology-partner-not-a-retailer')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Ocado entered Australia without selling a single grocery. In March 2019, the UK online grocer signed an <strong>exclusive services agreement with Coles</strong> — its fifth major overseas licensing deal in under 18 months — to deploy its Smart Platform and robotic fulfilment centres in Sydney and Melbourne. By 2026, Coles'' ecommerce was growing at <strong>13%+</strong> on Ocado''s technology, and Ocado had rolled off exclusivity, freeing it to sell to the rest of the Australian grocery market.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & footprint', 'people-and-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Ocado', 'United Kingdom', 'Australia',
       'Grocery technology / ecommerce fulfilment', '2019', 'successful'
FROM item
WHERE 'Ocado' IS NOT NULL;

-- how-lightspeed-acquired-its-way-into-australian-hospitality-pos
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos', 'How Lightspeed Acquired Its Way Into Australian Hospitality POS', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Canada''s Lightspeed didn''t launch in Australia — it bought its way to market leadership on both sides of the Tasman. In October 2019 it acquired Sydney…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-lightspeed-acquired-its-way-into-australian-hospitality-pos')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Canada''s Lightspeed didn''t launch in Australia — it bought its way to market leadership on both sides of the Tasman. In October 2019 it acquired Sydney hospitality POS company <strong>Kounta</strong> (~7,000 customer locations) for roughly <strong>US$43 million</strong>, and in 2021 it followed with Auckland retail POS leader <strong>Vend</strong> for about <strong>US$350 million</strong> — instantly becoming a dominant cloud point-of-sale player across Australia and New Zealand.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & continuity', 'people-and-continuity', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Lightspeed', 'Canada', 'Australia',
       'Cloud point-of-sale and commerce software', '2019', 'successful'
FROM item
WHERE 'Lightspeed' IS NOT NULL;

-- how-starlings-engine-entered-australia-selling-bank-tech-not-banking
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking', 'How Starling''s Engine Entered Australia Selling Bank Tech, Not Banking', 'draft', 'case_study',
         '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'UK neobank Starling never applied for an Australian banking licence — yet its technology now runs one of Australia''s newest digital banks. Through its SaaS…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-starlings-engine-entered-australia-selling-bank-tech-not-banking')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>UK neobank Starling never applied for an Australian banking licence — yet its technology now runs one of Australia''s newest digital banks. Through its SaaS subsidiary <strong>Engine by Starling</strong>, it partnered with AMP in November 2023, and just <strong>12 months from kick-off</strong>, AMP Bank GO launched in February 2025, targeting Australia''s <strong>2.4 million</strong> self-employed and micro businesses with the country''s first numberless debit cards.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('First customer & delivery', 'first-customer-and-delivery', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Engine by Starling', 'United Kingdom', 'Australia',
       'Banking technology (SaaS core banking platform)', '2023', 'successful'
FROM item
WHERE 'Engine by Starling' IS NOT NULL;

-- how-sharesies-took-kiwi-micro-investing-across-the-tasman
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-sharesies-took-kiwi-micro-investing-across-the-tasman', 'How Sharesies Took Kiwi Micro-Investing Across the Tasman', 'draft', 'case_study',
         '0563b826-2123-4627-b912-14f63e9fbfb6'::uuid, 'Wellington fintech Sharesies took the classic trans-Tasman path — but ran it deliberately in stages. After soft-launching in Australia in April 2021, it…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-sharesies-took-kiwi-micro-investing-across-the-tasman')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Wellington fintech Sharesies took the classic trans-Tasman path — but ran it deliberately in stages. After <strong>soft-launching in Australia in April 2021</strong>, it waited until late August to switch on marketing, then raised <strong>NZ$50 million</strong> (doubling its valuation trajectory) explicitly to fund the expansion. Today the platform serves <strong>over 1 million customers</strong> across New Zealand and Australia with more than <strong>$12 billion</strong> invested.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & launch playbook', 'team-and-launch-playbook', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Sharesies', 'New Zealand', 'Australia',
       'Fintech — retail investing platform', '2021', 'successful'
FROM item
WHERE 'Sharesies' IS NOT NULL;

-- how-serko-won-australian-corporate-travel-before-going-global
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-serko-won-australian-corporate-travel-before-going-global', 'How Serko Won Australian Corporate Travel Before Going Global', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Auckland''s Serko conquered the Australian corporate travel market so thoroughly that by 2018 its CEO could state plainly: "the bulk of Serko''s revenue comes…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-serko-won-australian-corporate-travel-before-going-global')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Auckland''s Serko conquered the Australian corporate travel market so thoroughly that by 2018 its CEO could state plainly: "the bulk of Serko''s revenue comes from Australia." The travel-tech company got there without a consumer brand or a big-bang launch — it rode <strong>travel management company (TMC) distribution</strong>, a <strong>Qantas technology partnership</strong> (first corporate platform globally with IATA Level 3 NDC certification, 2018), and an <strong>ASX listing</strong> to become the default booking engine of Australasian business travel.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & anchor customers', 'people-and-anchor-customers', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Serko', 'New Zealand', 'Australia',
       'Corporate travel and expense technology', '2000', 'successful'
FROM item
WHERE 'Serko' IS NOT NULL;

-- how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry', 'How OVO Energy Pivoted From Licensing to Owning Its Australian Entry', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'OVO Energy arrived in Australia in 2019 promising to disrupt electricity retailing the way it had in the UK. The consumer brand never got past roughly…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>OVO Energy arrived in Australia in 2019 promising to disrupt electricity retailing the way it had in the UK. The consumer brand never got past roughly <strong>80,000 customers</strong> — but the entry still paid off spectacularly, just not as planned. OVO''s real Australian business turned out to be its <strong>Kaluza</strong> software platform: AGL took a majority stake in OVO Energy Australia in 2021, fully acquired it by 2024, and then invested <strong>~A$150 million for 20% of Kaluza itself</strong>, committing to run its ~4 million customer services on OVO''s technology.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & local footprint', 'team-and-local-footprint', 3),
      ('Success and failure factors', 'success-and-failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'OVO Energy', 'United Kingdom', 'Australia',
       'Energy retail → energy software (Kaluza)', '2019', NULL
FROM item
WHERE 'OVO Energy' IS NOT NULL;

-- how-shopify-won-australian-merchants-with-partner-led-growth
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-shopify-won-australian-merchants-with-partner-led-growth', 'How Shopify Won Australian Merchants With Partner-Led Growth', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Shopify never held an Australian launch event — yet Australia became one of its highest-penetration markets in the world, with roughly 131,000 live Shopify…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-shopify-won-australian-merchants-with-partner-led-growth')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Shopify never held an Australian launch event — yet Australia became one of its highest-penetration markets in the world, with roughly <strong>131,000 live Shopify stores</strong> by 2026. The Canadian commerce platform entered through developers, agencies and local payment integrations rather than marketing spend, and Australian brands like Who Gives A Crap, Frank Body and Culture Kings grew up "Shopify-native".</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & flagship merchants', 'team-and-flagship-merchants', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Shopify', 'Canada', 'Australia',
       'Ecommerce platform (SaaS)', '2010', 'successful'
FROM item
WHERE 'Shopify' IS NOT NULL;

-- how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno', 'How Circles.Life Attacked Australian Telco Pricing as a Digital MVNO', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When Singapore''s [Circles.Life](http://Circles.Life) launched in Australia on 12 September 2019, its opening move was audacious: it offered to pay new…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When Singapore''s <a href="http://Circles.Life">Circles.Life</a> launched in Australia on <strong>12 September 2019</strong>, its opening move was audacious: it offered to pay new customers'' phone bills for the <strong>first four months</strong> — a 20GB, unlimited-calls plan normally priced at <strong>$28 a month</strong>, free. The digital telco went on to win national customer-satisfaction awards, then executed something rarer still: a deliberate, orderly exit that transferred its customer base to Amaysim.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & endgame', 'team-and-endgame', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Circles.Life', 'Singapore', 'Australia',
       'Digital telco (MVNO)', '2019', NULL
FROM item
WHERE 'Circles.Life' IS NOT NULL;

-- how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down', 'How Japan Post''s Toll Takeover Became a Multi-Billion-Dollar Write-Down', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'In February 2015, Japan Post Holdings agreed to buy Australia''s biggest logistics company, Toll Holdings, for A$6.5 billion — a 49% premium to the last…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>In February 2015, Japan Post Holdings agreed to buy Australia''s biggest logistics company, Toll Holdings, for <strong>A$6.5 billion</strong> — a <strong>49% premium</strong> to the last closing price, unanimously recommended by Toll''s board. Barely two years later, Japan Post wrote down the investment by <strong>A$4.9 billion</strong> and its leadership publicly expressed regret for a "rushed" takeover. It stands as one of the most value-destructive inbound acquisitions in Australian corporate history.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('What Japan Post did', 'what-japan-post-did', 2),
      ('Deal mechanics & aftermath', 'deal-mechanics-and-aftermath', 3),
      ('Failure factors', 'failure-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Japan Post', 'Japan', 'Australia',
       'Logistics and freight', '2015', 'unsuccessful'
FROM item
WHERE 'Japan Post' IS NOT NULL;

-- how-singtel-bought-optus-to-enter-australia-at-full-scale
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-singtel-bought-optus-to-enter-australia-at-full-scale', 'How Singtel Bought Optus to Enter Australia at Full Scale', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'In March 2001, Singapore Telecommunications won the contest for Cable & Wireless Optus with a S$13.6 billion offer — at the time the largest Asian corporate…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-singtel-bought-optus-to-enter-australia-at-full-scale')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>In March 2001, Singapore Telecommunications won the contest for Cable &amp; Wireless Optus with a <strong>S$13.6 billion</strong> offer — at the time the largest Asian corporate acquisition of an Australian company ever. The deal completed on <strong>23 October 2001</strong>, and a quarter of a century later Optus remains Australia''s clear number-two carrier and Singtel''s largest single asset.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Deal mechanics & people', 'deal-mechanics-and-people', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Singtel', 'Singapore', 'Australia',
       'Telecommunications', '2001', 'successful'
FROM item
WHERE 'Singtel' IS NOT NULL;

-- how-minor-international-bought-oaks-hotels-to-enter-australia-overnight
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight', 'How Minor International Bought Oaks Hotels to Enter Australia Overnight', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'In 2011, Bangkok-based Minor International pulled off one of the sharpest inbound plays in Australian hospitality: it took control of ASX-listed Oaks Hotels…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-minor-international-bought-oaks-hotels-to-enter-australia-overnight')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>In 2011, Bangkok-based Minor International pulled off one of the sharpest inbound plays in Australian hospitality: it took control of ASX-listed Oaks Hotels &amp; Resorts through a takeover valuing the company''s equity at roughly <strong>A$90 million</strong> — against the recommendation of the Oaks board. Under Thai ownership, Oaks has grown into a network of well over 50 Australian properties, and Minor is now bringing its global luxury flagship Anantara to Perth.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & platform', 'people-and-platform', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Minor International', 'Thailand', 'Australia',
       'Hotels and hospitality', '2011', 'successful'
FROM item
WHERE 'Minor International' IS NOT NULL;

-- how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia', 'How Kia Used Local Tuning and a Seven-Year Warranty to Crack Australia', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Kia''s Australian story is the longest of long games. The Korean carmaker entered in 1988 with the Rocsta and spent three decades as a budget also-ran —…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Kia''s Australian story is the longest of long games. The Korean carmaker entered in <strong>1988</strong> with the Rocsta and spent three decades as a budget also-ran — taking until <strong>2018</strong> to reach 500,000 cumulative sales. Then the flywheel caught: it sold its <strong>second half-million in just seven years</strong>, passing <strong>1 million cumulative Australian sales in 2025</strong> and establishing itself as one of the country''s top-selling brands.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry and growth strategy', 'entry-and-growth-strategy', 2),
      ('Success factors', 'success-factors', 3),
      ('Key metrics & performance', 'key-metrics-and-performance', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Kia', 'South Korea', 'Australia',
       'Automotive', '1988', 'successful'
FROM item
WHERE 'Kia' IS NOT NULL;

-- how-daiso-translated-japans-fixed-price-retail-model-for-australia
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-daiso-translated-japans-fixed-price-retail-model-for-australia', 'How Daiso Translated Japan''s Fixed-Price Retail Model for Australia', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'In 2010, Japan''s Daiso — the company that built a retail empire on the 100-yen price point — opened its first Australian store in Richmond, Melbourne. The…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-daiso-translated-japans-fixed-price-retail-model-for-australia')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>In 2010, Japan''s Daiso — the company that built a retail empire on the 100-yen price point — opened its first Australian store in Richmond, Melbourne. The format captured Australian shoppers almost immediately: the network grew to as many as <strong>46 stores across five states</strong>, and Daiso remains a fixture of Australian shopping centres today with stores in <strong>six states and the ACT</strong>.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Local structure & footprint', 'local-structure-and-footprint', 3),
      ('Success factors', 'success-factors', 4),
      ('Key metrics & performance', 'key-metrics-and-performance', 5),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Daiso', 'Japan', 'Australia',
       'Value / variety retail', '2010', 'successful'
FROM item
WHERE 'Daiso' IS NOT NULL;

-- how-hellofresh-built-australias-meal-kit-category-from-scratch
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-hellofresh-built-australias-meal-kit-category-from-scratch', 'How HelloFresh Built Australia''s Meal-Kit Category From Scratch', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'HelloFresh was barely a year old when it landed in Australia in 2012 — one of four international markets it entered in a single expansion wave — and it went…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-hellofresh-built-australias-meal-kit-category-from-scratch')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>HelloFresh was barely a year old when it landed in Australia in 2012 — one of four international markets it entered in a single expansion wave — and it went on to make the country part of a global meal-kit business commanding roughly 75% of the category worldwide.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & local build-out', 'team-and-local-build-out', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'HelloFresh', 'Germany', 'Australia',
       'Meal-kit subscription e-commerce', '2012', 'successful'
FROM item
WHERE 'HelloFresh' IS NOT NULL;

-- how-doordash-made-a-late-entry-work-in-australian-food-delivery
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-doordash-made-a-late-entry-work-in-australian-food-delivery', 'How DoorDash Made a Late Entry Work in Australian Food Delivery', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When DoorDash switched on in Melbourne on 4 September 2019, it was the company''s first launch outside North America after six years at home — and it arrived…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-doordash-made-a-late-entry-work-in-australian-food-delivery')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When DoorDash switched on in Melbourne on 4 September 2019, it was the company''s first launch outside North America after six years at home — and it arrived with thousands of restaurants already signed and a $30 delivery guarantee designed to make Melburnians try it once.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Team & scale-up', 'team-and-scale-up', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'DoorDash', 'United States', 'Australia',
       'On-demand food delivery', '2019', 'successful'
FROM item
WHERE 'DoorDash' IS NOT NULL;

-- how-didi-tested-geelong-before-undercutting-uber-across-australia
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-didi-tested-geelong-before-undercutting-uber-across-australia', 'How DiDi Tested Geelong Before Undercutting Uber Across Australia', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When the world''s most valuable startup wanted to prove it could compete in a Western market, it didn''t pick London or Los Angeles — it picked Geelong. DiDi…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-didi-tested-geelong-before-undercutting-uber-across-australia')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When the world''s most valuable startup wanted to prove it could compete in a Western market, it didn''t pick London or Los Angeles — it picked Geelong. DiDi Chuxing ran a month-long trial in the Victorian regional city before launching DiDi Express in Melbourne on 25 June 2018, its first foray into a Western-style market.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Rollout & local team', 'rollout-and-local-team', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'DiDi', 'China', 'Australia',
       'Ride-hailing', '2018', 'successful'
FROM item
WHERE 'DiDi' IS NOT NULL;

-- how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly', 'How Bolt Took a Second Run at Australia''s Ride-Hailing Duopoly', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Bolt''s Australian story ended at midnight on a Saturday. On 28 March 2020, the Estonian rideshare challenger — which had entered as Taxify two and a half…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Bolt''s Australian story ended at midnight on a Saturday. On 28 March 2020, the Estonian rideshare challenger — which had entered as Taxify two and a half years earlier — terminated its business effective immediately, telling drivers to peel the stickers off their cars.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('What went wrong', 'what-went-wrong', 2),
      ('Footprint & the second act', 'footprint-and-the-second-act', 3),
      ('Why it failed', 'why-it-failed', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Bolt', 'Estonia', 'Australia',
       'Ride-hailing', '2017', 'unsuccessful'
FROM item
WHERE 'Bolt' IS NOT NULL;

-- how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition', 'How Fujitsu Rebuilt Its Australian Business Through Serial Acquisition', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Fujitsu had been in Australia for decades — but by 2021 it was a legacy infrastructure provider watching the market move to cloud, data and cybersecurity.…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Fujitsu had been in Australia for decades — but by 2021 it was a legacy infrastructure provider watching the market move to cloud, data and cybersecurity. Its answer was a five-acquisition sprint across ANZ that ended a decade-long deal drought and culminated in a $300 million cybersecurity push.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('People & deal craft', 'people-and-deal-craft', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Fujitsu', 'Japan', 'Australia',
       'Enterprise IT services and consulting', '2021', 'successful'
FROM item
WHERE 'Fujitsu' IS NOT NULL;

-- how-agoda-carved-out-an-australian-niche-in-asia-bound-travel
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel', 'How Agoda Carved Out an Australian Niche in Asia-Bound Travel', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Agoda — the online travel agency born in Phuket, Thailand — didn''t win Australian travellers with advertising. It won Australian *hotels* first, surveying…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-agoda-carved-out-an-australian-niche-in-asia-bound-travel')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Agoda — the online travel agency born in Phuket, Thailand — didn''t win Australian travellers with advertising. It won Australian <em>hotels</em> first, surveying around 7,000 local accommodation partners and making Australia the first market in the world to get its 24/7 localised partner support.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Local footprint', 'local-footprint', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Agoda', 'Thailand', 'Australia',
       'Online travel booking (OTA)', NULL, 'successful'
FROM item
WHERE 'Agoda' IS NOT NULL;

-- how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading', 'How Rakuten Kobo Rode Bookseller Partnerships Into Australian E-Reading', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Rakuten Kobo cracked the Amazon-dominated Australian e-reading market without opening a single store or spending big on brand — it borrowed the trust of…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Rakuten Kobo cracked the Amazon-dominated Australian e-reading market without opening a single store or spending big on brand — it borrowed the trust of Booktopia, Australia''s number-one online bookseller, and built its subscription business on top.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Partners & people', 'partners-and-people', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Rakuten Kobo', 'Japan', 'Australia',
       'E-readers, e-books and audiobook subscriptions', NULL, 'successful'
FROM item
WHERE 'Rakuten Kobo' IS NOT NULL;

-- how-nec-anchored-its-australian-entry-in-government-contracts
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-nec-anchored-its-australian-entry-in-government-contracts', 'How NEC Anchored Its Australian Entry in Government Contracts', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'NEC arrived in Australia in 1969 with five staff — one of the earliest Japanese technology companies to set up locally, decades before "Asian tech entry"…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-nec-anchored-its-australian-entry-in-government-contracts')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>NEC arrived in Australia in 1969 with five staff — one of the earliest Japanese technology companies to set up locally, decades before "Asian tech entry" became a category. More than half a century later, it remains a fixture of Australian government and enterprise technology.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Footprint & flagship contracts', 'footprint-and-flagship-contracts', 3),
      ('Why it worked', 'why-it-worked', 4),
      ('Key metrics', 'key-metrics', 5),
      ('Lessons', 'lessons', 6)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'NEC', 'Japan', 'Australia',
       'Telecommunications, ICT and biometrics', '1969', 'successful'
FROM item
WHERE 'NEC' IS NOT NULL;

-- how-monday-com-scaled-australia-remotely-before-landing-onshore
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-monday-com-scaled-australia-remotely-before-landing-onshore', 'How monday.com Scaled Australia Remotely Before Landing Onshore', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, '[monday.com](http://monday.com) launched in Australia in June 2020 — in the middle of a pandemic, with offices closed and the world working from home. Five…', 5, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-monday-com-scaled-australia-remotely-before-landing-onshore')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p><a href="http://monday.com">monday.com</a> launched in Australia in June 2020 — in the middle of a pandemic, with offices closed and the world working from home. Five years later, its regional ARR had grown from $7 million to over $120 million, its brand had climbed from sixth to first in its category locally, and Sydney hosted its official APAC headquarters. It is one of the fastest and best-documented SaaS scale-ups in Australian market-entry history.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'monday.com', 'Israel', 'Australia',
       'SaaS — work management / work OS platform', '2020', 'successful'
FROM item
WHERE 'monday.com' IS NOT NULL;

-- how-zendesk-made-melbourne-its-asia-pacific-launchpad
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-zendesk-made-melbourne-its-asia-pacific-launchpad', 'How Zendesk Made Melbourne Its Asia-Pacific Launchpad', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'In September 2011, Zendesk arrived in Melbourne with a team of five and an ambition that went well beyond sales coverage. Within seven years, the Australian…', 5, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-zendesk-made-melbourne-its-asia-pacific-launchpad')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>In September 2011, Zendesk arrived in Melbourne with a team of five and an ambition that went well beyond sales coverage. Within seven years, the Australian operation had beaten San Francisco and Dublin in an internal contest to host one of the company''s most strategic engineering hubs — making Melbourne not just a regional beachhead, but part of Zendesk''s global product engine.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Zendesk', 'Denmark', 'Australia',
       'SaaS — customer service and support software', '2011', 'successful'
FROM item
WHERE 'Zendesk' IS NOT NULL;

-- how-hubspot-grew-australia-using-its-own-inbound-playbook
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-hubspot-grew-australia-using-its-own-inbound-playbook', 'How HubSpot Grew Australia Using Its Own Inbound Playbook', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When HubSpot chose the location for its first office outside the US and Ireland, it didn''t pick London, Singapore or Tokyo. It picked Sydney. In Q3 2014,…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-hubspot-grew-australia-using-its-own-inbound-playbook')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When HubSpot chose the location for its first office outside the US and Ireland, it didn''t pick London, Singapore or Tokyo. It picked Sydney. In Q3 2014, seven people in a single serviced-office room at 1 O''Connell Street became HubSpot''s Asia-Pacific base — and within a year the team had outgrown four rooms.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'HubSpot', 'United States', 'Australia',
       'SaaS — inbound marketing, sales and CRM software', '2014', 'successful'
FROM item
WHERE 'HubSpot' IS NOT NULL;

-- how-intercom-served-australia-product-first-presence-later
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-intercom-served-australia-product-first-presence-later', 'How Intercom Served Australia Product-First, Presence-Later', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Intercom''s Australian entry inverted the standard playbook: no office, no country manager, no launch event. Instead, the Irish customer-messaging company…', 3, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-intercom-served-australia-product-first-presence-later')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Intercom''s Australian entry inverted the standard playbook: no office, no country manager, no launch event. Instead, the Irish customer-messaging company hired a single remote support employee in Sydney in 2016, built a distributed APAC support team, and only opened a physical office in 2018 — after APAC customer numbers had already grown 900%.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Intercom', 'Ireland', 'Australia',
       'SaaS — customer messaging and AI customer service', '2016', 'successful'
FROM item
WHERE 'Intercom' IS NOT NULL;

-- how-intuit-quickbooks-took-the-fight-to-xero-in-australia
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia', 'How Intuit QuickBooks Took the Fight to Xero in Australia', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Intuit entered Australia the low-risk way: license the QuickBooks brand to a scrappy local distributor and collect royalties. For nearly two decades it…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-intuit-quickbooks-took-the-fight-to-xero-in-australia')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Intuit entered Australia the low-risk way: license the QuickBooks brand to a scrappy local distributor and collect royalties. For nearly two decades it worked — until the cloud arrived, the partnership collapsed, and Intuit had to re-enter its "own" market from scratch. By then a New Zealand startup called Xero had taken the country, and QuickBooks has been chasing it ever since.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('What went wrong', 'what-went-wrong', 2),
      ('Why it failed', 'why-it-failed', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Intuit QuickBooks', 'United States', 'Australia',
       'SaaS — small business accounting software', '1993', 'unsuccessful'
FROM item
WHERE 'Intuit QuickBooks' IS NOT NULL;

-- how-rippling-localised-payroll-to-enter-compliance-heavy-australia
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia', 'How Rippling Localised Payroll to Enter Compliance-Heavy Australia', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'When Rippling — the $11.25B US workforce-management platform — announced Sydney as its APAC headquarters in February 2024, it wasn''t entering an empty…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-rippling-localised-payroll-to-enter-compliance-heavy-australia')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>When Rippling — the $11.25B US workforce-management platform — announced Sydney as its APAC headquarters in February 2024, it wasn''t entering an empty market. It was landing directly on the turf of Employment Hero, an Australian unicorn claiming more than 20% of the country''s private-sector businesses. What followed is one of the most openly hostile incumbent-vs-entrant battles in Australian SaaS.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it''s contested', 'why-it-s-contested', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Rippling', 'United States', 'Australia',
       'SaaS — HR, payroll, IT and workforce management', '2024', NULL
FROM item
WHERE 'Rippling' IS NOT NULL;

-- how-zoho-played-the-long-game-in-australia-with-local-data-centres
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-zoho-played-the-long-game-in-australia-with-local-data-centres', 'How Zoho Played the Long Game in Australia With Local Data Centres', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Every global SaaS company that enters Australia opens in Sydney or Melbourne — except Zoho. The Indian software giant anchored its Australian operation in…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-zoho-played-the-long-game-in-australia-with-local-data-centres')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Every global SaaS company that enters Australia opens in Sydney or Melbourne — except Zoho. The Indian software giant anchored its Australian operation in Adelaide, a deliberate expression of its global "transnational localism" philosophy: put offices where talent is loyal, costs are lower and communities are underserved. The contrarian bet has quietly compounded.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Zoho', 'India', 'Australia',
       'SaaS — business software suite (CRM, finance, productivity, 55+ apps)', '2019', 'successful'
FROM item
WHERE 'Zoho' IS NOT NULL;

-- how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs', 'How Freshworks Undercut Enterprise Incumbents to Win Australian SMBs', 'draft', 'case_study',
         '6a837ef6-c7b5-457c-8069-2b8da9c85716'::uuid, 'Freshworks — the Indian-founded challenger to Zendesk and Salesforce — entered Australia in 2015 with a Sydney office and a value-for-money pitch aimed at…', 4, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = 'how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs')
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, '<p>Freshworks — the Indian-founded challenger to Zendesk and Salesforce — entered Australia in 2015 with a Sydney office and a value-for-money pitch aimed at the mid-market. Four years and 5x ARR growth later, it doubled down with a second office in Melbourne, serving more than 2,000 paying ANZ customers.</p>
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
</table>', 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      ('Background', 'background', 1),
      ('Entry strategy', 'entry-strategy', 2),
      ('Why it worked', 'why-it-worked', 3),
      ('Key metrics', 'key-metrics', 4),
      ('Lessons for market entrants', 'lessons-for-market-entrants', 5)
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, question, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.question, v.html, v.md, v.ord, 'case_study'
  FROM secs s
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
  ) AS v(slug, question, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, 'Freshworks', 'India', 'Australia',
       'SaaS — customer support, IT service management and CRM', '2015', 'successful'
FROM item
WHERE 'Freshworks' IS NOT NULL;
