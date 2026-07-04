-- Enrich angel investors — batch 03l (records 209-213: Rui Rodrigues → Sam Kothari)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based angel investor and former Managing Partner at Tank Stream Ventures. Two-time Formula 1 World Champion (Team Manager). London Business School MBA. Tech, deep tech and self-driving focus. Brings F1 strategy/process discipline to early-stage investing.',
  basic_info = 'Rui Rodrigues is a Sydney-based angel investor with one of the most distinctive backgrounds in the Australian VC ecosystem. He is the **former Managing Partner at Tank Stream Ventures** — a Sydney-based venture firm — where he brought **Formula 1''s strategy, processes and attention to detail** to early-stage investing.

Prior to investing, he spent **7 years in Formula 1 as a Team Manager** and **won two Formula 1 World Championships** with his team. He subsequently worked at a **London-based VC fund** before continuing as an Angel Investor and venture consultant in Europe and Australia.

He is also **Non-Executive Director at Biteable** (Australian video-creation platform).

Education: **London Business School MBA** plus **two engineering degrees**.

CSV-listed thesis: **Tech, deep tech, self-driving** (autonomous vehicles, robotics, complex systems). CSV cheque size not specified.',
  why_work_with_us = 'For Australian deep-tech, autonomous-vehicle, robotics and complex-engineering founders — Rui''s combination of Formula 1 operations + engineering background + venture-fund operating experience (Tank Stream Ventures, London VC) is genuinely unique. Especially valuable for technical founders building structurally hard products where engineering rigour and process discipline matter.',
  sector_focus = ARRAY['Deep Tech','Tech','Autonomous Vehicles','Self-Driving','Robotics','SaaS','Engineering Tech','Complex Systems'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/ruirodriguesf1/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Tank Stream Ventures (former Managing Partner)','Biteable (Non-Executive Director)','Formula 1 (former Team Manager; 2x F1 World Champion team)'],
  meta_title = 'Rui Rodrigues — ex-Tank Stream Ventures | Sydney Deep-Tech Angel | F1 Champion',
  meta_description = 'Sydney deep-tech / self-driving angel. ex-Tank Stream Ventures Managing Partner. 2x F1 World Champion team manager.',
  details = jsonb_build_object(
    'firms', ARRAY['Tank Stream Ventures (former Managing Partner)','Biteable (Non-Executive Director)'],
    'prior_career','7 years Formula 1 as Team Manager (2x F1 World Championship); London-based VC fund',
    'education','London Business School MBA; two engineering degrees',
    'investment_thesis','Tech, deep tech, self-driving — F1-strategy-discipline applied to early-stage investing.',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/ruirodriguesf1',
      'crunchbase','https://www.crunchbase.com/person/rui-rodrigues',
      'about_me','https://about.me/ruirodriguesf1'
    ),
    'corrections','CSV portfolio empty; populated with role context. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Rui Rodrigues';

UPDATE investors SET
  description = 'Sydney-based cybersecurity-specialist angel investor. Founder & CEO of Ensignia (security infrastructure). Former security infrastructure roles at Brex, Cruise, CultureAmp. AirTree Explorer. Repeat startup founder with prior exit. Cybersecurity-only focus. $25k cheques. Active angel for Cipherstash, AuthSignal.',
  basic_info = 'Sam "Frenchie" Stewart is a Sydney-based **cybersecurity-specialist angel investor**. He is the **Founder & CEO of Ensignia** (since January 2023) — a security infrastructure venture — and is an **active angel investor specifically focused on cybersecurity and security categories**.

His operator background includes building **infrastructure security systems and teams** for companies including:
- **Brex** (US fintech unicorn)
- **Cruise** (autonomous-vehicle company)
- **CultureAmp** (Australian HR-tech unicorn)

He is a **repeat startup founder with a prior exit**. He also serves as an **Explorer at AirTree Ventures** — meaning his angel deal-flow benefits from AirTree''s top-tier ANZ cybersecurity deal stream.

His CSV-listed angel portfolio includes:
- **Cipherstash** (Australian cryptography/encryption-as-a-service)
- **AuthSignal** (passwordless authentication / fraud-prevention)
- Plus additional truncated names

CSV cheque size $25k. Stated thesis: **Cybersecurity, Security**.',
  why_work_with_us = 'For Australian and global cybersecurity, infrastructure-security and zero-trust founders — Frenchie is one of the very few Australia-based angels with a pure cybersecurity-only thesis combined with deep operator credentials at Brex, Cruise and CultureAmp. Especially valuable for technical founders pursuing structured cybersecurity sales motions.',
  sector_focus = ARRAY['Cybersecurity','Security','Infrastructure','DevTools','Authentication','Cryptography'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/sampstewart/',
  contact_email = 'sam@frenchie.com.au',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Ensignia (Founder & CEO since Jan 2023)','Cipherstash','AuthSignal','AirTree Ventures (Explorer)','Brex (former)','Cruise (former)','CultureAmp (former)'],
  meta_title = 'Sam "Frenchie" Stewart — Ensignia Founder | Cybersecurity Angel',
  meta_description = 'Cybersecurity-only angel. Ensignia founder. ex-Brex, Cruise, CultureAmp. AirTree Explorer. Cipherstash, AuthSignal.',
  details = jsonb_build_object(
    'firms', ARRAY['Ensignia (Founder & CEO; since January 2023)','AirTree Ventures (Explorer)'],
    'prior_career','Infrastructure security systems and teams at Brex, Cruise, CultureAmp; repeat startup founder with prior exit',
    'investment_thesis','Cybersecurity and Security only — focused-vertical angel.',
    'check_size_note','$25k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/sampstewart/',
      'theorg_cipherstash','https://theorg.com/org/cipherstash/org-chart/sam-s',
      'hardly_strictly_security','https://hardlystrictlysecurity.io/speaker/sam-frenchie-stewart'
    ),
    'corrections','CSV portfolio truncated ("Cipherstash, AuthSignal, ..."). Two retained verbatim. CSV location empty.'
  ),
  updated_at = now()
WHERE name = 'Sam "Frenchie" Stewart';

UPDATE investors SET
  description = 'Sydney-based angel investor. Sector-agnostic ("All"). Notable backer of Spriggy (Australian children''s pocket-money/banking app). $100K+ cheques.',
  basic_info = 'Sam Bird is a Sydney-based angel investor with stated **All-sector** thesis. CSV cheque size **>$100K**.

His CSV-listed portfolio includes:
- **Spriggy** (Australian children''s pocket-money / banking / financial-literacy app — significant Australian fintech-consumer scale-up)

Beyond Spriggy and the directory listing, individual investor portfolio details could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian consumer, fintech, education and family-tech founders — Sam''s Spriggy backing signals genuine consumer-fintech pattern recognition and his $100K+ cheque-size makes him a candidate for lead-anchor positions in seed rounds.',
  sector_focus = ARRAY['Generalist','Consumer','FinTech','EdTech','Family Tech','SaaS'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 100000,
  check_size_max = 250000,
  contact_email = 'samuelj.bird@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Spriggy'],
  meta_title = 'Sam Bird — Sydney Sector-Agnostic Angel | Spriggy Backer',
  meta_description = 'Sydney sector-agnostic angel. Spriggy in portfolio. >$100K cheques.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic with consumer/fintech bias — Spriggy backer.',
    'check_size_note','>$100K',
    'unverified', ARRAY[
      'Beyond Spriggy and directory listing, individual investor portfolio could not be uniquely corroborated from public-source search.'
    ],
    'corrections','CSV LinkedIn empty. CSV portfolio listed only "Spriggy".'
  ),
  updated_at = now()
WHERE name = 'Sam Bird';

UPDATE investors SET
  description = 'Sydney-based startup-studio operator and angel investor. Director at Hyper (Sydney startup studio). Founding team member at LOKE (mobile loyalty/ordering — Aston Club acquired by LOKE 2017). Tech focus. Active board director at Empiraa, advisor at OneAnother and Happly.',
  basic_info = 'Sam Cust is a Sydney-based startup-studio operator and angel investor. He is **Director at Hyper** (Sydney-based startup studio led by Sasha Reid — also covered separately in this directory) since March 2020.

Earlier he was **Founding Team Member and Head of New Business at LOKE** (Australian mobile delivery, ordering and loyalty solutions) from January 2012 to January 2016 — and was a fundamental asset to LOKE''s founding team. He also served as Investor and Advisor at **Aston Club** (acquired by LOKE in 2017).

Current investor and advisory roles:
- **Investor at Pacific Pickleball**
- **Advisory Board at OneAnother**
- **Advisory Board at Happly**
- **Board Member at Empiraa.com**

Education: Bachelor of Commerce (Deakin University). CSV cheque size not specified. Stated thesis: **Tech**.',
  why_work_with_us = 'For Australian SaaS, marketplace, hospitality-tech and consumer-mobile founders — Sam combines deep startup-studio operating experience (Hyper, LOKE founding team) with multiple active board/advisor roles. Especially valuable for founders looking for hands-on operator support alongside an angel cheque.',
  sector_focus = ARRAY['Tech','SaaS','Marketplace','Hospitality Tech','Mobile','Consumer','Loyalty','Sport Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/samcust/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Hyper (Director since March 2020)','LOKE (Founding Team Member; Head of New Business 2012-2016)','Aston Club (Investor & Advisor; acquired by LOKE 2017)','Pacific Pickleball','OneAnother (Advisory Board)','Happly (Advisory Board)','Empiraa (Board Member)'],
  meta_title = 'Sam Cust — Hyper Director | Sydney Startup-Studio Angel',
  meta_description = 'Sydney Hyper Director. ex-LOKE founding team. Empiraa Board. Tech-focused angel.',
  details = jsonb_build_object(
    'firms', ARRAY['Hyper (Director since March 2020)','LOKE (Founding Team Member 2012-2016)'],
    'prior_career','LOKE Group founding team and Head of New Business; Aston Club Investor and Advisor (acquired by LOKE 2017)',
    'education','Bachelor of Commerce (Deakin University)',
    'investment_thesis','Tech-focused — startup-studio-network angel.',
    'board_roles', ARRAY['Empiraa (Board Member)','OneAnother (Advisory Board)','Happly (Advisory Board)','Pacific Pickleball (Investor)'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/samcust/',
      'theorg_empiraa','https://theorg.com/org/empiraa/org-chart/sam-cust',
      'theorg_happly','https://theorg.com/org/happly-1/org-chart/sam-cust'
    ),
    'corrections','CSV portfolio truncated ("LOKE payments, see my..."). LOKE founding-team context retained.'
  ),
  updated_at = now()
WHERE name = 'Sam Cust';

UPDATE investors SET
  description = 'Melbourne-based serial founder, operator and angel investor. Co-founder of Pokéd (8-location Australian QSR chain, Melbourne+Sydney). Former Head of Growth ANZ at Airwallex. Former SEEK strategy team. Currently at Everlab. B2B SaaS, e-commerce and FinTech focus. $10–$50k cheques.',
  basic_info = 'Sam Kothari is a Melbourne-based serial founder, operator and angel investor. He is currently associated with **Everlab** (Australian preventive health-tech) and has a distinguished operator background:
- **Co-Founder of Pokéd** (during his time at Kearney) — grew to **8 locations across Melbourne and Sydney**
- **Head of Growth ANZ at Airwallex** (Australian global payments unicorn) — managed the P&L for the ANZ region
- **SEEK Strategy Team** (former)
- **Kearney** (consulting; featured alumni)

His CSV-listed portfolio includes:
- **Jarvis** (Australian B2B SaaS — likely Jarvis ML)
- **Resi Body Corporate** (Melbourne owners-corporation management for townhouses)
- Plus additional truncated names

CSV cheque size $10–$50k. Stated thesis: **B2B SaaS, Ecommerce, FinTech**.',
  why_work_with_us = 'For Australian B2B SaaS, e-commerce, fintech and consumer-services founders — Sam combines high-quality operator credentials at Airwallex (one of Australia''s most successful fintech unicorns) plus serial-founder experience scaling Pokéd to 8 locations. Especially valuable for founders looking for hands-on growth-operator advice alongside an angel cheque.',
  sector_focus = ARRAY['B2B SaaS','E-commerce','FinTech','SaaS','Health Tech','Consumer','Hospitality'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/kotharisam/',
  contact_email = 'sam.kothari399@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Everlab (current)','Pokéd (Co-Founder; 8 locations Melbourne+Sydney)','Airwallex (former Head of Growth ANZ)','SEEK (former Strategy Team)','Kearney (former)','Jarvis','Resi Body Corporate'],
  meta_title = 'Sam Kothari — ex-Airwallex / Pokéd | Melbourne B2B SaaS Angel',
  meta_description = 'Melbourne B2B SaaS / e-commerce angel. ex-Airwallex Head of Growth ANZ. Pokéd co-founder. Jarvis, Resi Body Corp.',
  details = jsonb_build_object(
    'firms', ARRAY['Everlab (current)','Pokéd (Co-Founder)','Airwallex (former Head of Growth ANZ)','SEEK (former Strategy Team)','Kearney (former)'],
    'prior_career','Pokéd co-founder (8 locations); Airwallex Head of Growth ANZ; SEEK strategy; Kearney consulting',
    'investment_thesis','B2B SaaS, Ecommerce, FinTech — Melbourne operator-network angel.',
    'check_size_note','$10–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/kotharisam/',
      'omny_podcast','https://omny.fm/shows/hard-yards-in-leadership/1-sam-kothari-from-pok-d-to-airwallex-and-airtree',
      'kearney_alumni','https://www.kearney.com/about/alumni/alumni-profiles/article/-/insights/kothari-sam-featured-alum-1'
    ),
    'corrections','CSV portfolio truncated ("Jarvis, Resi Body Corpora..."). Two retained verbatim. CSV email truncated ("sam.kothari399@gmail.c...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Sam Kothari';

COMMIT;
