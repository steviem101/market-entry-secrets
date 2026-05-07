-- Enrich angel investors — batch 03s (records 244-248: Tom Humphrey → Trevor Folsom)

BEGIN;

UPDATE investors SET
  description = 'Denver-based (USA) Australian VC and angel investor. Partner at Blackbird Ventures (top-tier ANZ VC). Former Partner at Access Ventures (Denver). Founder of Kanopy (B2B video streaming, exited to private equity). Former OurDeal (DTC ecommerce, exited to News Corp). Backed Forage (formerly InsideSherpa) — Y Combinator graduate. Tech focus.',
  basic_info = 'Tom Humphrey is a Denver, USA-based Australian VC and angel investor. He is **Partner at Blackbird Ventures** — one of Australia and New Zealand''s top-tier venture funds — and was previously **Partner at Access Ventures** in Denver, Colorado.

He has a distinguished operator background — **8 years operating** including:
- **Founder of Kanopy** (B2B video streaming SaaS — exited to private equity)
- **OurDeal** (DTC ecommerce — exited to News Corp; first operating role)

As a Blackbird Ventures partner, he joined the **board of Forage** (formerly InsideSherpa) — a Y Combinator graduate that partners with employers to create open-access online training courses ("Virtual Experience Programs") for college students. Blackbird-backed Forage exited via US merger.

CSV-listed portfolio includes:
- **InsideSherpa / Forage** (Y Combinator; exited)
- **Flu...** (truncated)
- Plus additional truncated names

CSV cheque size: not specified. Stated thesis: **Tech**.',
  why_work_with_us = 'For Australian and especially US-bound tech founders — Tom combines exceptional Blackbird Ventures fund-cheque capacity with a Denver-USA operating base, giving him a unique cross-Pacific bridge position. His Kanopy and OurDeal exits signal real founder credibility, and his Blackbird Forage board role demonstrates active US-market scaling support.',
  sector_focus = ARRAY['Tech','SaaS','EdTech','Virtual Experience','Consumer','B2B','DTC','Streaming'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  linkedin_url = 'https://www.linkedin.com/in/tomhumphrey1/',
  location = 'Denver, USA',
  country = 'USA',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Blackbird Ventures (Partner)','Access Ventures (former Partner; Denver)','Kanopy (Founder; exited to private equity)','OurDeal (former; exited to News Corp)','Forage / InsideSherpa (Blackbird board)'],
  meta_title = 'Tom Humphrey — Blackbird Partner | Denver Cross-Pacific Aussie Angel',
  meta_description = 'Denver-based Blackbird Ventures Partner. Kanopy founder (PE exit). OurDeal exited News Corp. Forage board.',
  details = jsonb_build_object(
    'firms', ARRAY['Blackbird Ventures (Partner)','Access Ventures (former Partner)','Kanopy (Founder)','OurDeal (former)'],
    'prior_career','8 years operating — founded Kanopy (B2B video streaming, PE exit) and OurDeal (DTC ecommerce, News Corp exit)',
    'investment_thesis','Tech — cross-Pacific Denver/Blackbird angel with US-scaling expertise.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Forage / InsideSherpa','context','Y Combinator graduate; Blackbird-backed; exited via US merger; virtual experience programs for college students')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/tomhumphrey1/',
      'blackbird','https://www.blackbird.vc/team/tom-humphrey',
      'crunchbase','https://www.crunchbase.com/person/tom-humphrey'
    ),
    'corrections','CSV portfolio truncated ("InsideSherpa/Forage, Flu..."). One retained plus exit context. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Tom Humphrey';

UPDATE investors SET
  description = 'Sydney-based angel investor. Startmate First Believer programme graduate (2020 cohort). Former Acquia (US tech). Australian-investment portfolio includes Mr Yum and Startmate. $10–$20k cheques. Most experience in FinTech.',
  basic_info = 'Tom Richardson is a Sydney-based angel investor with a distinctive globe-spanning career arc — born in the UK, lived in Japan after university, then 7 years in the USA at **Acquia** (US tech / open-source CMS company), before returning to Sydney.

His angel-investing journey began through the **Startmate First Believers programme** — Australia''s most prominent accelerator angel programme — which gave him the confidence and knowledge to make his first angel investment.

His CSV-listed portfolio includes:
- **Mr Yum** (Australian QR-code food-ordering — Tom contributed $20,000 to Mr Yum''s $11M post-seed round; reached out to Stew Glynn at TEN13 about Mr Yum and learned they were closing a TEN13-led round)
- **Startmate** (Australia''s premier accelerator)
- Plus additional names

He is also listed as **MD APAC at Invision** among Mr Yum investors. His goal is to **reinvest income beyond daily expenses over the next decade — making 2-3 investments per year**.

CSV cheque size **$10–$20k**. Stated thesis: **All — most experience in FinTech**.',
  why_work_with_us = 'For Australian and global FinTech, marketplace, hospitality-tech and consumer-tech founders — Tom combines US-tech operator credentials (7 yrs at Acquia) with active Sydney-Startmate-network deal flow and a clearly disciplined annual investment pace. Especially valuable for founders pursuing structured Startmate-graduate-network introductions.',
  sector_focus = ARRAY['Generalist','FinTech','Marketplace','Hospitality Tech','Consumer','SaaS','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 20000,
  linkedin_url = 'https://www.linkedin.com/in/tomrichardsonuk/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Mr Yum (post-seed; $20k cheque)','Startmate First Believer','Invision (MD APAC; among Mr Yum investors)','Acquia (former; 7 yrs US)'],
  meta_title = 'Tom Richardson — Startmate First Believer | Sydney FinTech Angel',
  meta_description = 'Sydney Startmate First Believer angel. ex-Acquia (US 7yrs). Mr Yum backer. FinTech focus. $10–$20k.',
  details = jsonb_build_object(
    'prior_career','7 years at Acquia (US tech / open-source CMS); UK-born; Japan post-university',
    'investment_thesis','All sectors with FinTech experience bias — disciplined 2-3 investments/year pace.',
    'check_size_note','$10–$20k',
    'community_roles', ARRAY['Startmate First Believer programme graduate'],
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/tomcrichardson',
      'startmate_writeup','https://www.startmate.com/writing/tom-richardson-unconventional-path-to-angel-investor'
    ),
    'corrections','CSV portfolio truncated ("Mr Yum, Startmate"). Both retained. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Tom Richardson';

UPDATE investors SET
  description = 'Gold Coast-based B2B SaaS angel syndicate. Now operating as TORUS (formerly Palm Beach Ventures / PBV). Co-founded by Kane Templeton (Cake Equity first hire/GTM Lead, $0–$3M ARR), Jason Atkins (Cake Equity CEO), Ben Howe and Kim Hansen (Cake Equity co-founder). 20+ deals to date. Sector-agnostic with B2B SaaS, FinTech, HealthTech experience. $25K–$100K cheques.',
  basic_info = 'TORUS (previously **Palm Beach Ventures / PBV**) is a Gold Coast-based **B2B SaaS-focused angel syndicate** with active deal flow across **Australia, US, Singapore and beyond**.

**Founding team:**
- **Kane Templeton** (Co-Founder, Partner) — Cake Equity''s **first hire, investor and Go-to-Market Lead**; helped scale Cake from $0 to $3M ARR
- **Jason Atkins** (Co-Founder; CEO of Cake Equity)
- **Ben Howe** (founding contributor)
- **Kim Hansen** (Cake Equity Co-Founder)

The syndicate has now rebranded to **TORUS** and continues to focus on **B2B SaaS, FinTech and HealthTech** investments. **20+ deals to date**.

CSV-listed portfolio includes:
- **Aussie Angels** (Australian angel-investor platform — TORUS is active in deals there)
- Plus 19 additional deals (truncated)

CSV cheque size **$25K–$100K**. Stated thesis: **Agnostic. Experienced in B2B SaaS, FinTech, HealthTech**.

(Note: this is the same syndicate as PB Ventures listed earlier in this directory — TORUS is the rebrand.)',
  why_work_with_us = 'For Queensland and Gold Coast B2B SaaS, FinTech, HealthTech and B2B-marketplace founders — TORUS combines an active syndicate cheque ($25k–$100k) with deep Cake Equity operator network and reach into Singapore + US markets. Especially relevant for cap-table-aware SaaS founders.',
  sector_focus = ARRAY['B2B SaaS','FinTech','HealthTech','SaaS','EdTech','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/kanetempleton/',
  contact_email = 'kane@toruscap.vc',
  location = 'Gold Coast, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Cake Equity (Kane Templeton — first hire/GTM Lead)','Aussie Angels','20+ deals to date'],
  meta_title = 'TORUS (formerly Palm Beach Ventures) — Gold Coast B2B SaaS Syndicate',
  meta_description = 'Gold Coast B2B SaaS syndicate. Now TORUS. Kane Templeton (Cake Equity). Sector-agnostic. $25K–$100K.',
  details = jsonb_build_object(
    'organisation_type','Angel syndicate (now TORUS, formerly Palm Beach Ventures / PBV)',
    'founding_team', jsonb_build_array(
      jsonb_build_object('name','Kane Templeton','role','Co-Founder & Partner; Cake Equity first hire/GTM Lead'),
      jsonb_build_object('name','Jason Atkins','role','Co-Founder; Cake Equity CEO'),
      jsonb_build_object('name','Ben Howe','role','Founding contributor'),
      jsonb_build_object('name','Kim Hansen','role','Cake Equity Co-Founder')
    ),
    'investment_thesis','Sector-agnostic with B2B SaaS, FinTech, HealthTech experience — Cake Equity-network deal flow.',
    'check_size_note','$25K–$100K',
    'deals_to_date','20+',
    'reach','Australia, US, Singapore',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/kanetempleton/',
      'aussie_angels','https://app.aussieangels.com/syndicate/torus-previously-known-palm-beach-ventures'
    ),
    'corrections','CSV name was truncated ("TORUS (previously Palm ..."); full name resolved. CSV portfolio truncated ("20 so far. Aussie Angels, ..."). CSV email truncated ("kane@toruscap.vc").'
  ),
  updated_at = now()
WHERE name = 'TORUS (previously Palm Beach Ventures)';

UPDATE investors SET
  description = 'Perth-based 30+ year investment-management, financial-services, accounting and business-strategy executive. Former Vice Chair of Perth Angels. Member of Scale Investors. Inaugural winner of "Champion of Investment Diversity" award 2023. Instrumental in formation of VentureX Capital (addressing imbalance of investment in female-led businesses). $25k–$100k cheques.',
  basic_info = 'Tracie Clark is a Perth-based active angel investor and investment professional with **30+ years of experience** in investment management, financial services, accounting and business strategy. She is a:
- **Former Vice Chair of Perth Angels**
- **Member of Scale Investors**
- **Inaugural winner of "Champion of Investment Diversity" award 2023** — recognised for her long history of supporting **women entrepreneurs** and her instrumental role in the formation of **VentureX Capital** to address the imbalance of investment in female-led businesses
- Currently associated with **Skalata** and **WaveX** (Wave-Powered Generators)

Her CSV-listed portfolio includes:
- **The Volte** (Australian fashion / dress-rental marketplace)
- **Handii** (Australian construction/services marketplace)
- **Picture...** (truncated)
- Plus additional truncated names

CSV cheque size **$25k–$100k**. CSV email: tracie@plansmartfinancial...

She is also Director at WaveX: Wave-Powered Generators (renewable-energy hardware).',
  why_work_with_us = 'For Australian — and especially Western Australian — women-led founders in fashion-tech, marketplace, fintech, renewable-energy and SaaS categories — Tracie is one of the most credentialed female-led-investing advocates in the country. Her Champion of Investment Diversity award and VentureX Capital formation role signal a deep commitment to closing the gender funding gap.',
  sector_focus = ARRAY['Generalist','Fashion','Marketplace','FinTech','SaaS','Renewable Energy','Women-Led','Diversity'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/tracie-clark-26263b53/',
  contact_email = 'tracie@plansmartfinancial.com.au',
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['VentureX Capital (instrumental in formation; supports female-led businesses)','Perth Angels (former Vice Chair)','Scale Investors (member)','Skalata (associated)','WaveX: Wave-Powered Generators (Director)','The Volte','Handii'],
  meta_title = 'Tracie Clark — Perth Angels Vice Chair | Champion of Investment Diversity 2023',
  meta_description = 'Perth 30+yr investment professional. Champion of Investment Diversity 2023. VentureX Capital. $25k–$100k.',
  details = jsonb_build_object(
    'firms', ARRAY['Perth Angels (former Vice Chair)','Scale Investors (member)','VentureX Capital (instrumental in formation)','Skalata (associated)','WaveX (Director)'],
    'prior_career','30+ years investment management, financial services, accounting, business strategy',
    'investment_thesis','Diversity-focused — female-led, women-entrepreneur backing.',
    'check_size_note','$25k–$100k',
    'awards', ARRAY['Champion of Investment Diversity 2023 (inaugural winner; Australian Angel Awards)'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/tracie-clark-26263b53/',
      'skalata','https://www.skalata.vc/team/tracie-clark',
      'venturex','https://venturexhq.com.au/team/tracie-clark/'
    ),
    'corrections','CSV portfolio truncated ("The Volte, Handii, Picture..."). Two retained verbatim. CSV email truncated ("tracie@plansmartfinancia...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Tracie Clark';

UPDATE investors SET
  description = 'Sydney-based legendary serial founder, mega-angel and investor. Co-Founder & Chairman of Investible (Australian early-stage investment group; 100+ direct investments incl. seed-stage Canva, Ipsy, Car Next Door). Co-founded Blueprint Management Group with Creel Price (1998-2008; nine-figure exit). Chair Car Next Door. Board Kip McGrath. UNSW Entrepreneur in Residence. Variety / generalist mandate. $100–$250k cheques.',
  basic_info = 'Trevor Folsom is one of Australia''s most respected and influential angel investors and the **Co-Founder and Chairman of Investible** — a leading early-stage investment group providing high-potential founders with financial, human and intellectual capital to scale.

He has made **more than 100 direct investments** across diverse industries and geographies — including as a **seed-stage investor in Canva, Car Next Door** and other prominent brands. He earned a reputation as a **hands-on early investor** providing pre-seed capital and support to several startups including future unicorns **Canva and Ipsy**.

His **entrepreneurial origins** trace to **1998** when he and **Creel Price** co-founded **Blueprint Management Group**. Over **10 years**, the pair scaled the business head-on, **successfully exiting for nine figures in 2008**.

**Current board / leadership roles:**
- **Co-Founder & Chairman, Investible**
- **Chair, Car Next Door** (Australian car-sharing network)
- **Board, Kip McGrath** (ASX-listed education provider)
- **Entrepreneur-in-Residence, UNSW**

CSV-listed portfolio includes:
- **Canva** (Australian design unicorn — seed-stage investor)
- **Ipsy** (US beauty-subscription unicorn)
- **Car Next Door** (Chair)
- Plus additional truncated names

CSV cheque size **$100–$250k**. Stated thesis: **Variety**.',
  why_work_with_us = 'For Australian founders building globally-ambitious tech, marketplace, consumer or B2B products — Trevor is among the most credentialed angels in the country. His Canva and Ipsy seed-stage backings, 100+ direct investments and Blueprint nine-figure exit signal exceptional pattern recognition. Investible''s structured platform plus his $100–$250k personal cheque make him a high-conviction lead-anchor candidate.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','EdTech','Beauty','Mobility','B2B','Design'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 100000,
  check_size_max = 250000,
  website = 'https://trevor.folsom',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Investible (Co-Founder & Chairman)','Blueprint Management Group (Co-Founder; nine-figure exit 2008)','Canva (seed-stage investor)','Ipsy (early investor)','Car Next Door (Chair)','Kip McGrath (Board; ASX-listed)','UNSW Founders (Entrepreneur in Residence)','100+ direct investments globally'],
  meta_title = 'Trevor Folsom — Investible Co-Founder & Chairman | Sydney Mega-Angel',
  meta_description = 'Sydney Investible co-founder/chairman. 100+ direct investments. Canva, Ipsy seed. Car Next Door Chair. $100–$250k.',
  details = jsonb_build_object(
    'firms', ARRAY['Investible (Co-Founder & Chairman)','Blueprint Management Group (Co-Founder; 1998-2008; nine-figure exit)'],
    'investment_thesis','Variety / generalist — globally-ambitious Australian and international tech founders.',
    'check_size_note','$100–$250k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Canva','context','Seed-stage investor in Australian design unicorn'),
      jsonb_build_object('company','Ipsy','context','Early backer of US beauty-subscription unicorn'),
      jsonb_build_object('company','Car Next Door','context','Chair of Australian car-sharing network')
    ),
    'community_roles', ARRAY['UNSW Founders Entrepreneur in Residence','Kip McGrath Board (ASX-listed)','Car Next Door Chair'],
    'sources', jsonb_build_object(
      'investible','https://www.investible.com/blog/our-story',
      'unsw','https://www.founders.unsw.edu.au/news/investible-co-founder-join-unsw-founders-entrepreneur-residence',
      'pitchbook','https://pitchbook.com/profiles/investor/266230-27'
    ),
    'corrections','CSV website "https://trevor.folsom" retained as-is.  CSV portfolio truncated ("Canva, Ipsy, Car Next Do..."). Three retained verbatim. CSV LinkedIn URL field had personal website. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Trevor Folsom';

COMMIT;
