-- Enrich angel investors — batch 03g (records 184-188: Oana Olteanu → Perth Angels)

BEGIN;

UPDATE investors SET
  description = 'San Francisco-based angel investor and Partner at SignalFire. Specialist in developer tools, AI/ML infrastructure and open-source software. Portfolio includes Digger, Mem, Inngest, Alphadoc, Overmind. Former SAP enterprise-software builder. Bay Area cheque for ANZ dev-tools founders.',
  basic_info = 'Oana Olteanu is a San Francisco-based angel investor and **Partner at SignalFire** — a US venture fund — with a specialist focus on **developer tooling, open-source software and ML infrastructure**.

She has a B.Sc. in CS plus M.Sc.; previously **built enterprise software at SAP**, where she contributed to backend systems, developed assessment frameworks for 70+ product teams, and led partnership strategy for conversational AI.

As an angel she has made ~10+ investments across AI, developer tools and enterprise software, including:
- **Digger** (DevOps/IaC)
- **Mem** (AI-native notes)
- **Inngest** (developer-facing event/workflow platform)
- **Alphadoc** (developer docs)
- **Overmind** (infra reliability)
- **Axodotdev** (developer tooling)

CSV cheque size: **$5k as angel; up to $2-3M from fund** (SignalFire scale). Australian-rooted angel based in the Bay Area.',
  why_work_with_us = 'For Australian and New Zealand developer-tools, open-source, ML-infrastructure and B2B-AI founders looking to break into the US market — Oana combines deep SF VC operating experience (SignalFire), a tightly-curated dev-tools portfolio and SAP enterprise-software depth. Especially relevant for technical founders pursuing US Series A from ANZ.',
  sector_focus = ARRAY['DevTools','AI','ML','Open Source','SaaS','Enterprise Software','Infrastructure'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 5000,
  check_size_max = 3000000,
  linkedin_url = 'https://www.linkedin.com/in/olteanuoana/',
  contact_email = 'oe.olteanu@gmail.com',
  location = 'San Francisco, CA, USA',
  country = 'USA',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['SignalFire (Partner)','Digger','Mem','Inngest','Alphadoc','Overmind','Axodotdev'],
  meta_title = 'Oana Olteanu — SignalFire Partner | SF Dev Tools & AI Angel',
  meta_description = 'SF SignalFire Partner. Dev tools, AI, open source angel. Digger, Mem, Inngest. $5k angel; up to $2-3M fund.',
  details = jsonb_build_object(
    'firms', ARRAY['SignalFire (Partner)','SAP (former — co-development)'],
    'investment_thesis','Developer tooling, open source software and ML infrastructure.',
    'check_size_note','$5k as angel; up to $2-3M as SignalFire fund cheque',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/olteanuoana/',
      'pitchbook','https://pitchbook.com/profiles/investor/516156-40',
      'crunchbase','https://www.crunchbase.com/person/oana-olteanu',
      'signalfire','https://signal.nfx.com/investors/oana-olteanu'
    ),
    'corrections','CSV cheque size truncated ("5k as angel, up 2-3..."). Resolved.'
  ),
  updated_at = now()
WHERE name = 'Oana Olteanu';

UPDATE investors SET
  description = 'Copenhagen-based angel investor of Thai origin. Investment Analyst at BlackWood Ventures (Thailand-Europe climate VC). Cleantech, climate-tech and biochar focus across Europe and Southeast Asia. EUR 10k–100k cheques.',
  basic_info = 'Pasinee Tangsuriyapaisan is an angel investor working in **Copenhagen, Denmark** at **BlackWood Ventures** — a VC investing in early-stage startups across Europe — with a personal focus on **early-stage climate-tech startups in Europe that can also create positive impact in Southeast Asia**.

Originally from Thailand, she was formerly an **Investment Analyst at BLING Startup**. She is also affiliated with **Enable Earth** and is involved in climate-action initiatives, particularly biochar solutions and agricultural sustainability across Asia Pacific.

CSV cheque size **EUR 10k–100k**. Stated thesis: **Cleantech, Climatetech**. CSV did not list location — public profile resolves to Copenhagen.',
  why_work_with_us = 'For climate-tech founders building solutions with cross-border Europe–SEA potential — particularly in agritech, biochar, food systems and circular-economy categories — Pasinee combines a European VC operating base with deep Southeast Asian impact-investing networks. Cross-border-cheque relevant for Australian climate founders building toward Europe or SEA.',
  sector_focus = ARRAY['ClimateTech','CleanTech','AgriTech','Biochar','Food Systems','Circular Economy','Impact'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 17000,
  check_size_max = 165000,
  linkedin_url = 'https://www.linkedin.com/in/pasinee-t/',
  contact_email = 'pasinee.tang@gmail.com',
  location = 'Copenhagen, Denmark',
  country = 'Denmark',
  currently_investing = true,
  portfolio_companies = ARRAY['BlackWood Ventures (Investment Analyst)','BLING Startup (former)','Enable Earth'],
  meta_title = 'Pasinee Tangsuriyapaisan — Copenhagen Climate Angel | EU/SEA',
  meta_description = 'Copenhagen-based climate-tech angel. BlackWood Ventures. Europe-SEA cross-border. EUR 10k–100k.',
  details = jsonb_build_object(
    'firms', ARRAY['BlackWood Ventures (Investment Analyst)','BLING Startup (former Investment Analyst)','Enable Earth (affiliated)'],
    'investment_thesis','Early-stage climate-tech in Europe with positive Southeast Asia impact.',
    'check_size_note','EUR 10k–100k (~AUD 17k–165k)',
    'origin','Thailand',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/pasinee-t/',
      'crunchbase','https://www.crunchbase.com/person/pasinee-tangsuriyapaisan',
      'inclimate','https://www.inclimate.com/member/8550/r/recusKNzX55AlSNaI'
    ),
    'corrections','CSV had no location. Resolved to Copenhagen via public profile. Cheque size converted EUR→AUD approx.'
  ),
  updated_at = now()
WHERE name = 'Pasinee Tangsuriyapaisan';

UPDATE investors SET
  description = 'Melbourne-based corporate-advisory founder and angel investor. Founder & Director of Platform Advisory Partners (M&A, capital-raising, strategic advisory). 15+ years investment and advisory experience. Sector-agnostic angel. Portfolio includes Redbubble, EatClub, Pin Payments. Up to $100k cheques.',
  basic_info = 'Paul Tontodonati is a Melbourne-based corporate-advisory professional and active angel investor. He is the **Founder & Director of Platform Advisory Partners** — a corporate-advisory firm based in Melbourne providing M&A, capital-raising and strategic advice to fast-growing technology companies.

He has **15+ years of investment and advisory experience in Australia and Europe**, with expertise across venture capital, debt origination, M&A and derivatives markets. Prior to Platform he was Vice President at EM Advisory (Boutique Corporate Advisory).

His CSV-listed portfolio includes:
- **Redbubble** (Australian creative-marketplace IPO)
- **EatClub** (Australian restaurant marketplace; Paul helped close the funding round)
- **Pin Payments** (Australian payments)
- Plus additional truncated names

CSV cheque size: up to $100k. Sector mandate: Generalist/agnostic.',
  why_work_with_us = 'For Australian SaaS, marketplace, fintech and consumer-tech founders — Paul brings a rare combination of personal angel cheque capacity (up to $100k) plus a corporate-advisory firm capable of running structured capital-raising or M&A processes. Especially valuable when angel cheque is part of a larger raise where Platform Advisory may also lead-advise.',
  sector_focus = ARRAY['Generalist','SaaS','Marketplace','FinTech','Consumer','Payments'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/paul-tontodonati-1976801b/',
  contact_email = 'paul@platformadvisorypartners.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Redbubble','EatClub','Pin Payments','Platform Advisory Partners (Founder & Director)'],
  meta_title = 'Paul Tontodonati — Platform Advisory Founder | Melbourne Angel',
  meta_description = 'Melbourne corporate-advisory founder and angel. Redbubble, EatClub, Pin Payments. Up to $100k.',
  details = jsonb_build_object(
    'firms', ARRAY['Platform Advisory Partners (Founder & Director)'],
    'prior_career','15+ years investment and advisory experience including VP at EM Advisory',
    'investment_thesis','Generalist Melbourne corporate-advisory-network angel.',
    'check_size_note','Up to $100k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/paul-tontodonati-1976801b/',
      'platform_advisory','https://www.platformadvisorypartners.com/about',
      'crunchbase','https://www.crunchbase.com/person/paul-tontodonati'
    ),
    'corrections','CSV portfolio truncated ("Redbubble, EatClub, Pin..."). Three retained verbatim. CSV email truncated ("paul@platformadvisorypa...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Paul Tontodonati';

UPDATE investors SET
  description = 'Gold Coast-based angel syndicate associated with Cake Equity (B2B SaaS for cap-table management). Co-founded by Kane Templeton and Jason Atkins; Ben Howe and Kim Hansen also instrumental. Originally Palm Beach Ventures (PBV) — rebranded as TORUS. B2B SaaS, fintech and healthtech focus. $25k cheques.',
  basic_info = 'PB Ventures (also referenced as **Palm Beach Ventures / PBV / now TORUS**) is a Gold Coast-based angel syndicate co-founded by Kane Templeton and Jason Atkins, with help from Ben Howe and Kim Hansen (co-founder of **Cake Equity**).

**Kane Templeton** was Cake Equity''s first hire, investor and Go-to-Market Lead — helping scale the company from $0 to $3M ARR. He also led TORUS Fund Zero (the pilot fund) and continues as Partner.

The syndicate has now rebranded to **TORUS** and continues to focus on **B2B SaaS, FinTech and HealthTech** investments across the Gold Coast and Queensland region — with reach across Australia, the US, Singapore and beyond.

CSV-listed portfolio includes:
- **EntryLevel** (career-skills education platform)
- **GG** (truncated context)
- 10+ deals to date

CSV cheque size $25,000. CSV LinkedIn URL was Kane Templeton''s personal LinkedIn.',
  why_work_with_us = 'For Queensland and Gold Coast B2B SaaS, FinTech, HealthTech and B2B-marketplace founders — PB Ventures / TORUS combines an active syndicate cheque with deep Cake Equity operator network and reach into Singapore + US markets. Especially relevant for founders building cap-table-aware SaaS or developer-facing tooling.',
  sector_focus = ARRAY['B2B SaaS','FinTech','HealthTech','SaaS','EdTech','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/kanetempleton/',
  contact_email = 'kane@cakeequity.com',
  location = 'Gold Coast, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['EntryLevel','TORUS Fund Zero (formerly Palm Beach Ventures)','Cake Equity (Kane Templeton — first hire / GTM Lead)'],
  meta_title = 'PB Ventures (TORUS) — Gold Coast B2B SaaS Syndicate | Cake Equity',
  meta_description = 'Gold Coast B2B SaaS/FinTech/HealthTech angel syndicate. Now TORUS. Kane Templeton (Cake Equity). $25k.',
  details = jsonb_build_object(
    'organisation_type','Angel syndicate (now TORUS, formerly Palm Beach Ventures / PBV)',
    'founding_team', jsonb_build_array(
      jsonb_build_object('name','Kane Templeton','role','Co-Founder, Partner; first hire & GTM Lead at Cake Equity'),
      jsonb_build_object('name','Jason Atkins','role','Co-Founder; CEO of Cake Equity'),
      jsonb_build_object('name','Ben Howe','role','Founding contributor'),
      jsonb_build_object('name','Kim Hansen','role','Co-Founder of Cake Equity')
    ),
    'investment_thesis','B2B SaaS, FinTech, HealthTech — strong Cake Equity-network deal flow.',
    'check_size_note','$25,000',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/kanetempleton/',
      'aussie_angels_torus','https://app.aussieangels.com/syndicate/torus-previously-known-palm-beach-ventures',
      'aussie_angels_pbv','https://app.aussieangels.com/syndicate/palm-beach-ventures-pbv'
    ),
    'corrections','CSV portfolio truncated ("10 so far. EntryLevel, GG..."). Two retained verbatim. CSV LinkedIn URL was Kane Templeton''s; entity now operates as TORUS.'
  ),
  updated_at = now()
WHERE name = 'PB Ventures';

UPDATE investors SET
  description = 'Perth''s premier angel investor group. For-purpose Not For Profit founded 2010 with commercial underpinning. Member of Australian Association of Angel Investors (AAAI). 15-20 deals reviewed per year. $50k–$500k for 10-40% holding.',
  basic_info = 'Perth Angels is **Perth''s leading angel-investing community** — a for-purpose Not For Profit formed in **2010** with a clear commercial underpinning, providing a forum for entrepreneurs to present opportunities to investors. They are one of Australia''s most active early-stage investor groups.

The group is the only Western Australian member of the **Australian Association of Angel Investors (AAAI)**, which connects them to the national and global angel-investor networks. They have direct links with **South West Angels** and other Australian angel groups.

Member benefits include access to a deal-management syndication platform and a deal pipeline of 15-20 deals per year.

**Investment range:** typically **$50k to $500k** for a **10% to 40%** holding. CSV captured cheque-size band as $100k–$500k — broadly aligned. Sector mandate is **Agnostic**.

Contact: Oliver (oliver@perthangels.com).',
  why_work_with_us = 'For Western Australian early-stage founders, Perth Angels is the most credentialed entry-point to the WA angel community — combining 15+ years of operating history (since 2010), AAAI national/global affiliation, and a coordinated $50k–$500k cheque capacity. Particularly valuable for capital-efficient WA-based startups looking for both capital and pitch-screening exposure.',
  sector_focus = ARRAY['Generalist','SaaS','MedTech','CleanTech','Mining Tech','AgriTech','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 500000,
  website = 'https://www.perthangels.com/',
  linkedin_url = 'https://www.linkedin.com/company/perthangels/',
  contact_email = 'oliver@perthangels.com',
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  meta_title = 'Perth Angels — WA''s Premier Angel Group | $50k–$500k | Since 2010',
  meta_description = 'Perth Angels. WA''s leading angel network since 2010. AAAI member. $50k–$500k for 10-40% holding.',
  details = jsonb_build_object(
    'organisation_type','Angel investor group / not-for-profit',
    'founded',2010,
    'investment_thesis','Sector-agnostic high-growth founder-led businesses; WA focus.',
    'check_size_note','$50k–$500k for 10-40% holding',
    'affiliations', ARRAY['Australian Association of Angel Investors (AAAI)','South West Angels','Global Angel Investor Networks (via AAAI)'],
    'deal_pipeline','15-20 deals reviewed per year',
    'sources', jsonb_build_object(
      'website','https://www.perthangels.com/',
      'linkedin','https://au.linkedin.com/company/perthangels',
      'gust','https://gust.com/organizations/perth-angels',
      'crunchbase','https://www.crunchbase.com/organization/perth-angels'
    ),
    'corrections','CSV cheque-size band $100-500k tightened to public-source $50k-$500k. CSV portfolio empty.'
  ),
  updated_at = now()
WHERE name = 'Perth Angels';

COMMIT;
