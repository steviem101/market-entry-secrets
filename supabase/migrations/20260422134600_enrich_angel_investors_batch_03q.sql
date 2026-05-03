-- Enrich angel investors — batch 03q (records 234-238: SunCoast Angels → The Saljar Group)

BEGIN;

UPDATE investors SET
  description = 'Sunshine Coast (Queensland) angel investor group. Founded early 2017. 31 members. Sector-agnostic across aerospace, agriculture, biotechnology, business services. Monthly pitch meetings. Round sizes typically $50k–$500k from multiple member angels ($5k–$200k individual cheques).',
  basic_info = 'SunCoast Angels is a Sunshine Coast, Queensland-based **angel investor group** founded in **early 2017**. The group provides emerging companies with seed and start-up capital through direct, private investments and facilitates connections between entrepreneurs and investors via regular **monthly pitch meetings** (3rd Monday of each month).

The group has **31 members** and invests in companies across various sectors including:
- **Aerospace**
- **Agriculture / AgriTech**
- **Biotechnology**
- **Business Services**
- **Plus general tech / SaaS**

**Investment range:** typically **$50,000 to $500,000 round-coordinated** from multiple member angels — each member typically investing **$5,000 to $200,000** individually.

**Leadership:** current President is **Mike (since April 2023)** — replaced **Steve Barnes (former President)**.

CSV stated mandate: **All sectors**. Cheque size and CSV portfolio: not specified beyond directory listing.',
  why_work_with_us = 'For Sunshine Coast, Queensland and Australian regional / SE-QLD-based founders — SunCoast Angels offers a coordinated $50k–$500k angel-round entry-point combined with monthly pitch-meeting cadence and 31-member-deep network access. Especially valuable for aerospace, agritech and biotech founders given the group''s sector spread.',
  sector_focus = ARRAY['Generalist','Aerospace','Agriculture','AgriTech','Biotechnology','Business Services','SaaS','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 500000,
  website = 'https://www.suncoastangels.com.au/',
  linkedin_url = 'https://www.linkedin.com/company/suncoast-angels',
  contact_email = 'admin@suncoastangels.com.au',
  location = 'Sunshine Coast, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  meta_title = 'SunCoast Angels — Sunshine Coast Angel Group | $50k–$500k | Since 2017',
  meta_description = 'Sunshine Coast QLD angel group since 2017. 31 members. Aerospace, AgriTech, Biotech focus. $50k–$500k.',
  details = jsonb_build_object(
    'organisation_type','Angel investor group',
    'founded',2017,
    'investment_thesis','Sector-agnostic with aerospace, agriculture, biotechnology, business-services emphasis — Sunshine Coast / SE Queensland focus.',
    'check_size_note','$50k–$500k round; $5k–$200k individual member cheques',
    'membership','31 members',
    'meetings','Monthly pitch meetings (3rd Monday of each month)',
    'leadership', jsonb_build_array(
      jsonb_build_object('name','Mike','role','President since April 2023'),
      jsonb_build_object('name','Steve Barnes','role','Former President')
    ),
    'sources', jsonb_build_object(
      'website','https://www.suncoastangels.com.au/',
      'linkedin','https://au.linkedin.com/company/suncoast-angels',
      'gust','https://gust.com/organizations/suncoast-angels',
      'startup_galaxy','https://startupgalaxy.com.au/investors/suncoast-angels'
    ),
    'corrections','CSV email truncated ("admin@suncoastangels.c...") resolved.'
  ),
  updated_at = now()
WHERE name = 'SunCoast Angels';

UPDATE investors SET
  description = 'Sydney-based founder, investor and entrepreneur. Founder of Aurelix Bio. Previously founded Rosemary Health (now RoseRx — Australian DTC men''s health platform). Sector-agnostic with technology, renewables and healthcare bias.',
  basic_info = 'Sunil Parmar is a Sydney-based **founder, investor and entrepreneur**. He is the **Founder of Aurelix Bio** — a science-and-biotech investment platform — and previously **Founded Rosemary Health (now RoseRx)** — an Australian DTC men''s health and wellness telehealth platform.

He is also associated with **Enercarbon** (per LinkedIn). His investment focus spans **technology, renewables and healthcare** — across founder-and-investor roles.

CSV-listed portfolio:
- **Rosemary Health** (Founder; now RoseRx)
- Plus additional names

CSV cheque size and stated thesis: **Agnostic** (sector-agnostic with renewables/healthcare bias from operating background).',
  why_work_with_us = 'For Australian healthtech, DTC men''s/women''s health, renewable-energy and biotech founders — Sunil brings rare combination of DTC health-platform operator credentials (Rosemary Health/RoseRx), biotech investment platform (Aurelix Bio) and renewable-energy operator context (Enercarbon). Especially valuable for telehealth/DTC-health and clean-energy founders.',
  sector_focus = ARRAY['Generalist','Health Tech','BioTech','Renewable Energy','Telehealth','DTC Health','Tech','Energy'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/sunil-parmar-49266222/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Aurelix Bio (Founder)','Rosemary Health / RoseRx (Founder)','Enercarbon (associated)'],
  meta_title = 'Sunil Parmar — Aurelix Bio / Rosemary Health Founder | Sydney Angel',
  meta_description = 'Sydney angel. Aurelix Bio founder. Rosemary Health (RoseRx) founder. Tech, renewables, healthcare.',
  details = jsonb_build_object(
    'firms', ARRAY['Aurelix Bio (Founder)','Rosemary Health / RoseRx (Founder)','Enercarbon (associated)'],
    'investment_thesis','Sector-agnostic with technology, renewables, healthcare bias.',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/sunil-parmar-49266222/',
      'aurelix_bio','https://www.aurelixbio.com.au/'
    ),
    'corrections','CSV portfolio listed only "Rosemary Health" — supplemented with founder-of context. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Sunil Parmar';

UPDATE investors SET
  description = 'Sydney-based not-for-profit angel investor association. Founded 2008. 100 members investing as syndicates. 100+ investments since inception. AUD $193M total funding deployed across 50+ startups. Sector-agnostic. Backed by $10M Sydney Angels Sidecar Fund.',
  basic_info = 'Sydney Angels is a **not-for-profit association for angel investors** established in **2008** — one of Australia''s longest-running and most credentialed angel networks. The objective is to provide a network for members to collaborate, share knowledge, experiences and insights, and learn from and co-invest with experienced and active angels.

**Membership and structure:**
- **~100 members** who are angel investors
- Members work together as **teams (syndicates)** to invest their own money in early-stage startups
- Members are backed by the **$10M Sydney Angels Sidecar Fund** — invests solely in early-stage business ventures alongside member rounds

**Track record (per public sources):**
- **100+ investments made since inception**
- **50+ startups funded**
- **AUD $193M total funding deployed**

The group screens hundreds of investment opportunities every year so members only see the best. Notable historic portfolio names span Medical Supplies, Business/Productivity Software and broader Australian tech (e.g. iiShield, Keeyu, Mary Technology).

Stated thesis: **All sectors**. CSV cheque size and individual portfolio not specified.

Operates as an **NSW Incorporated Association** (registered 9896613).',
  why_work_with_us = 'For Australian and especially NSW/Sydney-based early-stage founders — Sydney Angels is the most credentialed entry-point to the NSW angel community. Combining 16+ years of operating history (since 2008), 100-member syndicate depth, $10M Sidecar Fund-backed cheque amplification and AUD$193M deployed across 50+ startups, Sydney Angels offers structured pitch-screening + coordinated capital.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','Health Tech','MedTech','B2B','FinTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.sydneyangels.net.au/',
  linkedin_url = 'https://www.linkedin.com/company/sydney-angels/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['100+ Australian early-stage startups (50+ companies)','iiShield','Keeyu','Mary Technology','Sydney Angels Sidecar Fund ($10M)'],
  meta_title = 'Sydney Angels — NSW''s Premier Angel Group | Since 2008 | 100+ Investments',
  meta_description = 'Sydney NSW angel network. Founded 2008. 100 members. $10M Sidecar Fund. AUD $193M deployed across 50+ startups.',
  details = jsonb_build_object(
    'organisation_type','Angel investor association (NSW Incorporated Association 9896613) / not-for-profit',
    'founded',2008,
    'investment_thesis','Sector-agnostic — Sydney/NSW-focused early-stage Australian startups.',
    'membership','~100 members',
    'track_record', jsonb_build_object(
      'investments','100+',
      'companies_funded','50+',
      'total_deployed','AUD $193M'
    ),
    'sidecar_fund','Sydney Angels Sidecar Fund ($10M)',
    'sources', jsonb_build_object(
      'website','https://www.sydneyangels.net.au/',
      'linkedin','https://www.linkedin.com/company/sydney-angels/',
      'gust','https://gust.com/organizations/sydney-angels',
      'pitchbook','https://pitchbook.com/profiles/investor/55878-49',
      'cb_insights','https://www.cbinsights.com/investor/sydney-angels',
      'treasury','https://treasury.gov.au/sites/default/files/2024-02/c2023-404702-sydney-angels.pdf'
    ),
    'corrections','CSV portfolio empty.'
  ),
  updated_at = now()
WHERE name = 'Sydney Angels';

UPDATE investors SET
  description = 'Sydney-based angel investor and software developer/engineering manager. Founder of Code Purple Consulting. Sydney Angels member. Active syndicate participant. Portfolio includes FuturePass, CP Fund 1 and additional Australian startups.',
  basic_info = 'Ted Tencza is a Sydney-based **software developer, engineering manager and angel investor**. He is the **Founder of Code Purple Consulting** and an active **Sydney Angels member**.

His CSV-listed portfolio includes:
- **FuturePass** (Web3 / digital identity)
- **CP Fund 1** (likely "Code Purple Fund 1" — own investment vehicle)
- **St...** (truncated)
- Plus additional names

CSV cheque size and stated sector mandate: not specified.

He has spoken at the **YOW! Tech Leaders Summit Sydney 2023** and contributes as an author at **Startup Daily**, suggesting active community engagement in the Sydney tech ecosystem.',
  why_work_with_us = 'For Australian developer-tools, Web3, fintech and engineering-led SaaS founders — Ted combines technical operator credentials (engineering manager + software developer), Sydney Angels syndicate access, and a personal investment vehicle (CP Fund 1) plus active community presence (YOW! speaker, Startup Daily author).',
  sector_focus = ARRAY['Tech','SaaS','Web3','DevTools','Engineering','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/ttencza/',
  contact_email = 'darthted@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Code Purple Consulting (Founder)','CP Fund 1 (own investment vehicle)','Sydney Angels (member)','FuturePass'],
  meta_title = 'Ted Tencza — Code Purple Consulting | Sydney Tech Angel',
  meta_description = 'Sydney engineering manager and angel. Code Purple Consulting founder. Sydney Angels member. FuturePass.',
  details = jsonb_build_object(
    'firms', ARRAY['Code Purple Consulting (Founder)','Sydney Angels (member)','CP Fund 1 (own vehicle)'],
    'community_roles', ARRAY['YOW! Tech Leaders Summit Sydney 2023 (speaker)','Startup Daily (author)'],
    'investment_thesis','Tech / engineering-led generalist Sydney angel.',
    'unverified', ARRAY[
      'CSV portfolio truncated ("FuturePass, CP Fund 1, St..."). Two retained verbatim.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/ttencza/',
      'yow','https://yowcon.com/tech-leaders-sydney-2023/speakers/2992/ted-tencza',
      'startup_daily','https://www.startupdaily.net/author/ted-tenzca/'
    ),
    'corrections','CSV portfolio truncated. CP Fund 1 interpreted as Code Purple Fund 1.'
  ),
  updated_at = now()
WHERE name = 'Ted Tencza';

UPDATE investors SET
  description = 'Sydney-based investment vehicle / family office. Limited public investor profile beyond Australian angel directory listing. Operating contact: investment@saljar.com.',
  basic_info = 'The Saljar Group is a Sydney-based investment vehicle / family office. Beyond the CSV directory entry, formal organisational details, member structure, individual portfolio companies, sector mandate and cheque sizes could not be uniquely corroborated from public-source search.

CSV contact email: investment@saljar.com — single email contact suggesting a private family-office-style operation.',
  why_work_with_us = 'For Australian founders looking for a discreet Sydney-based family-office angel cheque, The Saljar Group is best treated as a referral- or warm-intro-led conversation given limited public profile. The "investment@saljar.com" email suggests structured private investment-evaluation process rather than open deal flow.',
  sector_focus = ARRAY['Generalist'],
  stage_focus = ARRAY['Seed','Series A'],
  contact_email = 'investment@saljar.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'The Saljar Group — Sydney Family Office',
  meta_description = 'Sydney private investment vehicle / family office. Limited public profile.',
  details = jsonb_build_object(
    'organisation_type','Investment vehicle / family office',
    'unverified', ARRAY[
      'Beyond CSV directory listing, no public organisational details or portfolio companies could be uniquely corroborated.'
    ],
    'corrections','CSV name truncated ("The Saljar Group" retained as-is). CSV LinkedIn, sectors, portfolio and cheque size all empty.'
  ),
  updated_at = now()
WHERE name = 'The Saljar Group';

COMMIT;
