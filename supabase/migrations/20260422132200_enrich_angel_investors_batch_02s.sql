-- Enrich angel investors — batch 02s (records 114-118: Jayden Basha → John Ferlito)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based VC investment professional and operator-angel. Investment Principal at Investible (since July 2021) — covers origination, screening, due diligence and closing. Co-founded Verified Caller (phone-fraud prevention SaaS). Legal Practitioner + Chartered Accountant. UNSW Bachelor of Commerce + Bachelor of Laws. Ex-EY Associate Director Transactions/Corporate Finance. B2B SaaS focus.',
  basic_info = 'Jayden Basha is a Sydney-based investment professional and operator-angel. He is **Investment Principal at Investible** — one of Australia''s longest-running early-stage VC firms — where he has been since July 2021. He covers the entire investment lifecycle: origination, screening, due diligence and closing.

His background combines transactional finance, legal qualifications and operating experience:
- **Co-Founder, Verified Caller** — phone-fraud prevention SaaS platform (Australian start-up).
- **Ex-Associate Director, Transactions and Corporate Finance, EY** — 4+ years at Ernst & Young in transaction advisory.
- **Legal Practitioner** + **Chartered Accountant**.
- Director and Investment Committee Member at the **Count Charitable Foundation** and the **James & Cordelia Thiele Trust Fund** — supporting vulnerable communities.

He holds a Bachelor of Commerce and Bachelor of Laws from the University of Sydney, with additional international legal education from the University of Oslo.

His CSV cheque size is unspecified, with a stated B2B SaaS focus.',
  why_work_with_us = 'For Australian B2B SaaS founders raising structured pre-seed/seed rounds, Jayden offers a rare combination of CA-trained financial diligence, legal-practitioner cap-table judgment and Investible institutional pathway. Particularly useful for founders who want sharp commercial-and-legal due diligence alongside the cheque.',
  sector_focus = ARRAY['B2B SaaS','SaaS','FinTech','RegTech','Enterprise Software','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/jayden-basha-164624159/',
  contact_email = 'jaydenpbasha@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Investible (Investment Principal since July 2021)','Verified Caller (co-founder)','Count Charitable Foundation (Director + Investment Committee)','James & Cordelia Thiele Trust Fund (Director + Investment Committee)'],
  meta_title = 'Jayden Basha — Investible Investment Principal | Sydney B2B SaaS Angel',
  meta_description = 'Sydney Investment Principal Investible. Co-founder Verified Caller. Legal Practitioner + CA. Ex-EY Associate Director Transactions. B2B SaaS focus.',
  details = jsonb_build_object(
    'firm','Investible (Investment Principal since July 2021)',
    'founder_of', ARRAY['Verified Caller (phone-fraud prevention SaaS, co-founder)'],
    'prior_roles', ARRAY[
      'Associate Director, Transactions and Corporate Finance, EY (4+ years)'
    ],
    'credentials', ARRAY[
      'Legal Practitioner',
      'Chartered Accountant',
      'Bachelor of Commerce, University of Sydney',
      'Bachelor of Laws, University of Sydney',
      'International legal education, University of Oslo'
    ],
    'governance_roles', ARRAY[
      'Director and Investment Committee Member, Count Charitable Foundation',
      'Director and Investment Committee Member, James & Cordelia Thiele Trust Fund'
    ],
    'investment_thesis','B2B SaaS Australian founders with CA/legal-grade due diligence overlay.',
    'sources', jsonb_build_object(
      'investible_team','https://www.investible.com/team/jayden-basha',
      'investible_intro','https://www.investible.com/blog/welcome-jayden-basha-investible',
      'linkedin','https://www.linkedin.com/in/jayden-basha-164624159/',
      'crunchbase','https://www.crunchbase.com/person/jayden-basha-bf2b',
      'theorg','https://theorg.com/org/investible/org-chart/jayden-basha'
    ),
    'corrections','CSV LinkedIn URL empty — populated from public profile. CSV portfolio empty — populated with verified Investible role and founder/governance affiliations.'
  ),
  updated_at = now()
WHERE name = 'Jayden Basha';

UPDATE investors SET
  description = 'Sydney-based PropTech founder/CEO and angel investor. Founder & CEO of RentBetter (self-management property platform; founded 2016; raised $1.9M Series A). Ex-ANZ Bank Wealth Strategist. Ex-BCG, Capgemini, Blackdot, IBM Management Consultant. Sector-agnostic with explicit PropTech experience.',
  basic_info = 'Jeremy Goldschmidt is a Sydney-based PropTech founder, CEO and angel investor. He is the **Founder and CEO of RentBetter** — a Sydney-headquartered self-management property platform he founded in 2016 that helps landlords find tenants and manage properties at a fraction of the cost of traditional agents. RentBetter raised $1.9M Series A from Australian high-net-worth individuals and industry partners.

His RentBetter board includes Tony Breuer (30+ years investment-banking experience at Gresham) and Ata Gokyildirim (Israeli startup growth executive — Sedric, Difftone).

Prior to founding RentBetter he worked as:
- **Wealth Strategist, ANZ Bank**
- **Management Consultant** at **Boston Consulting Group**, **Capgemini**, **Blackdot** and **IBM**

His angel posture per CSV directory is "All — experience with PropTech." He is a regular contributor to Your Money & Your Life and has appeared on multiple raising-capital and property-investing podcasts.',
  why_work_with_us = 'For Australian PropTech, FinTech and SaaS-marketplace founders, Jeremy combines RentBetter operating credentials, BCG/IBM strategy depth and ANZ Bank wealth-management background. Particularly useful for founders selling into Australian property and finance verticals.',
  sector_focus = ARRAY['PropTech','FinTech','SaaS','Marketplace','Consumer','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://rentbetter.com.au',
  linkedin_url = 'https://www.linkedin.com/in/jeremy-goldschmidt-6406ba2/',
  contact_email = 'jeremy.g@rentbetter.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['RentBetter (Founder & CEO; founded 2016; $1.9M Series A)'],
  meta_title = 'Jeremy Goldschmidt — RentBetter founder | Sydney PropTech Angel',
  meta_description = 'Sydney founder/CEO RentBetter (PropTech, $1.9M Series A). Ex-ANZ Wealth Strategist, BCG, Capgemini, Blackdot, IBM consultant.',
  details = jsonb_build_object(
    'founder_of', ARRAY['RentBetter (2016 founder & CEO; $1.9M Series A; Sydney PropTech)'],
    'prior_roles', ARRAY[
      'Wealth Strategist, ANZ Bank',
      'Management Consultant, Boston Consulting Group',
      'Management Consultant, Capgemini',
      'Management Consultant, Blackdot',
      'Management Consultant, IBM'
    ],
    'rentbetter_board', ARRAY[
      'Tony Breuer (30+ years investment banking, Gresham)',
      'Ata Gokyildirim (Israeli startup growth executive — Sedric, Difftone)'
    ],
    'investment_thesis','Sector-agnostic with PropTech bias from RentBetter operator background.',
    'check_size_note','Undisclosed in CSV',
    'sources', jsonb_build_object(
      'rentbetter','https://rentbetter.com.au/',
      'linkedin','https://www.linkedin.com/in/jeremy-goldschmidt-6406ba2/',
      'tracxn_rentbetter','https://tracxn.com/d/companies/rentbetter/__OZy-IdWrv0ExbmT-6wzPMO0Z3ZoJ8IPd5dTp_UdMbQc',
      'smartcompany_press','https://www.smartcompany.com.au/startupsmart/news/rentbetter-property-management-tech/',
      'proptech_news','https://proptechnews.com.au/self-management-rental-platform-scores-1-9m-series-a-to-help-aussies-manage-their-own-property/',
      'ymyl','https://www.ymyl.com.au/author/jeremy-goldshmidt/',
      'nudge_group_interview','https://thenudgegroup.com/blog/interviews/startup-stories-jeremy-goldschmidt-founder-ceo-of-rentbetter'
    ),
    'corrections','CSV LinkedIn URL truncated ("...goldschmidt-6..."). Resolved to full URL. CSV portfolio empty — populated with founder company. CSV email truncated.'
  ),
  updated_at = now()
WHERE name = 'Jeremy Goldschmidt';

UPDATE investors SET
  description = 'Sydney-based serial entrepreneur and angel investor. Founder of Inspiring Rare Birds (women''s entrepreneurship movement, since 2014). Founder & MD of Job Capital ($40M+ turnover in 5 years). Top 30 Australian female entrepreneurs since 2013. YPO member. Up to $50K cheques across technology, e-gaming and consumer. CSV portfolio: GGWP.',
  basic_info = 'Jo Burston is one of Australia''s most successful female entrepreneurs and a Sydney-based angel investor. Her operating track record includes:
- **Job Capital** (founded 2006) — recruitment business that grew from $0 to $40+ million turnover in 5 years. She is Founder and Managing Director.
- **Inspiring Rare Birds** (since 2014) — global movement and platform challenging the view of what is possible for women in entrepreneurship and leadership. She is Founder and CEO. Inspiring Rare Birds also acts as a gateway to funding and investment for startups, with access to a diverse pool of angel and VC investors.

She has been on the list of Australia''s top 30 female entrepreneurs every year since 2013, is a YPO (Young Presidents'' Organization) member, and is a regular speaker at Startup Grind Sydney.

Her angel cheques (up to $50K) skew to technology, e-gaming and consumer-tech. CSV-listed portfolio includes **GGWP** (gaming-community moderation/AI-driven safety).',
  why_work_with_us = 'For Australian female-founded technology, e-gaming and consumer founders, Jo offers high-leverage relationships through Inspiring Rare Birds — its angel/VC investor network plus YPO and Top-30-Female-Entrepreneurs visibility provide unusually deep warm-intro density. Best treated as both a cheque and a community-distribution play.',
  sector_focus = ARRAY['Technology','E-Gaming','Consumer','Female Founders','SaaS','Recruitment'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 0,
  check_size_max = 50000,
  website = 'https://joburston.com',
  linkedin_url = 'https://www.linkedin.com/in/joburston/',
  contact_email = 'jo.burston@inspiringrarebirds.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Inspiring Rare Birds (Founder & CEO since 2014)','Job Capital (Founder & MD; $40M+ turnover in 5 years)','GGWP'],
  meta_title = 'Jo Burston — Inspiring Rare Birds founder | Sydney Female-Founder Angel',
  meta_description = 'Sydney serial founder. Founder Inspiring Rare Birds (women''s entrepreneurship). Founder Job Capital ($40M+ turnover). YPO. Up to $50K. GGWP portfolio.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Job Capital (2006 founder & MD; $0 → $40M+ turnover in 5 years)',
      'Inspiring Rare Birds (2014 founder & CEO; women''s entrepreneurship movement)'
    ],
    'recognition', ARRAY[
      'Top 30 Australian Female Entrepreneurs (every year since 2013)',
      'YPO (Young Presidents'' Organization) member'
    ],
    'investment_thesis','Female-led technology, e-gaming and consumer-tech founders with Inspiring Rare Birds community-distribution overlay.',
    'check_size_note','Up to $50K',
    'sources', jsonb_build_object(
      'website','https://joburston.com/',
      'linkedin','https://au.linkedin.com/in/joburston',
      'crunchbase','https://www.crunchbase.com/person/jo-burston-2',
      'inspiring_rare_birds','https://www.inspiringrarebirds.com/blog/author/jo-burston/',
      'startup_grind','https://www.startupgrind.com/events/details/startup-grind-sydney-presents-jo-burston-inspiring-rare-birds-job-capital/',
      'ypo_profile','https://www.ypo.org/2021/04/leading-an-entrepreneurial-movement-jo-burston-challenges-the-view-of-whats-possible-for-women/',
      'startup_daily','https://www.startupdaily.net/advice/jo-burston-rare-birds-just-business-global-movement/'
    ),
    'corrections','CSV portfolio "GGWP" retained verbatim. Added Inspiring Rare Birds and Job Capital as founder companies. CSV email truncated ("jo.burston@inspiringareb..."). Resolved to jo.burston@inspiringrarebirds.com.'
  ),
  updated_at = now()
WHERE name = 'Jo Burston';

UPDATE investors SET
  description = 'Brisbane-based serial entrepreneur and angel investor. Owner of Little Tokyo Two (Brisbane co-working space). 18+ years entrepreneurial experience. Sector mandate "Anything except deep tech". CSV-listed portfolio: Sharesies (NZ retail-investing platform), Zeroco (impact-tech). $25k cheques.',
  basic_info = 'Jock Fairweather is a Brisbane-based serial entrepreneur and angel investor with 18+ years of entrepreneurial experience across multiple industries. He is the owner of **Little Tokyo Two** — a well-known Brisbane co-working space that doubles as a Queensland startup-community hub.

His angel cheques skew to early-stage AU/NZ technology, with explicit exclusion of deep-tech (per CSV directory). Notable CSV-listed portfolio:
- **Sharesies** — NZ-headquartered retail-investing platform (Australian active).
- **Zeroco** — impact-tech.

He runs the **Iceberg Nurturing Software** project alongside his angel and operator activity, and has been a regular SmartCompany columnist on early-stage entrepreneurship.',
  why_work_with_us = 'For Brisbane and Queensland founders building in consumer, marketplace, fintech, edtech or impact-tech (excluding deep tech), Jock combines Little Tokyo Two community visibility with 18+ years of operator pattern recognition.',
  sector_focus = ARRAY['Consumer','SaaS','Marketplace','FinTech','EdTech','Impact','Co-working / PropTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/jockfairweather/',
  contact_email = 'jockfairweather@gmail.com',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Little Tokyo Two (owner; Brisbane co-working)','Iceberg Nurturing Software','Sharesies','Zeroco'],
  meta_title = 'Jock Fairweather — Little Tokyo Two | Brisbane Generalist Angel',
  meta_description = 'Brisbane owner of Little Tokyo Two co-working. 18+ years entrepreneurship. Portfolio: Sharesies, Zeroco. $25k. Anything except deep tech.',
  details = jsonb_build_object(
    'experience_years','18+ years entrepreneurship',
    'current_roles', ARRAY[
      'Owner, Little Tokyo Two (Brisbane co-working space)',
      'Iceberg Nurturing Software',
      'SmartCompany columnist'
    ],
    'investment_thesis','Anything except deep tech. Bias to consumer, marketplace, fintech, edtech and impact-tech. Brisbane / Queensland community focus.',
    'check_size_note','$25k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/jockfairweather/',
      'openvc','https://www.openvc.app/fund/Jock%20Fairweather',
      'clay_earth','https://clay.earth/profile/jock-fairweather',
      'smartcompany_author','https://www.smartcompany.com.au/author/jock-fairweather/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV portfolio truncated ("Sharesies (A), Zeroco (A..."). Resolved (A) annotations as part of standard portfolio listing. CSV sector_focus "Anything except deep tec..." resolved to "Anything except deep tech".'
  ),
  updated_at = now()
WHERE name = 'Jock Fairweather';

UPDATE investors SET
  description = 'Sydney-based technical operator-angel and Inodes director. UNSW Founders mentor. 20+ year track record helping start-ups, scale-ups and mature businesses as Board Advisor, Non-Executive Director and Mentor. Diverse $10k–$50k portfolio: StorReduce, Josef Legal, Atolio, Bright OS, Thanks.dev, Onqlave, Section, Rookout, VirtualPlatform, Uliaa, Bloody Good Tests.',
  basic_info = 'John Ferlito is a Sydney-based technical operator-angel and infrastructure-engineering veteran. He is **Director at Inodes** (Australian managed-hosting and infrastructure consultancy) and a **Mentor at UNSW Founders** — UNSW''s startup-and-scale-up program.

He has 20+ years of track record helping start-ups, scale-ups and mature businesses as **Board Advisor, Non-Executive Director and Mentor**, with a particular bias toward technical infrastructure and developer-tools companies.

His verified angel-investment portfolio is unusually diverse for a $10k–$50k cheque size:
- **StorReduce** — cloud storage deduplication (acquired by Pure Storage 2018)
- **Josef Legal** — legal-tech automation
- **Atolio** — enterprise search (invested 2022)
- **Bright OS**, **Thanks.dev**, **Onqlave**
- **Section**, **Rookout**
- **VirtualPlatform**, **Uliaa**, **Bloody Good Tests**

He is a long-standing open-source contributor (github.com/johnf) and active across the Australian developer-tools community.',
  why_work_with_us = 'For Australian developer-tools, infrastructure, legal-tech, observability and B2B-SaaS founders, John offers technical-operator credibility from Inodes plus UNSW Founders mentor visibility plus a 11+-name verified angel portfolio across the developer-tools stack.',
  sector_focus = ARRAY['Developer Tools','Infrastructure','Cloud Storage','LegalTech','Enterprise Search','B2B SaaS','Open Source'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://inodes.org',
  linkedin_url = 'https://linkedin.com/in/johnf',
  contact_email = 'johnf@inodes.org',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Inodes (Director)','UNSW Founders (Mentor)','StorReduce','Josef Legal','Atolio','Bright OS','Thanks.dev','Onqlave','Section','Rookout','VirtualPlatform','Uliaa','Bloody Good Tests'],
  meta_title = 'John Ferlito — Inodes / UNSW Founders Mentor | Sydney DevTools Angel',
  meta_description = 'Sydney Director Inodes. UNSW Founders Mentor. 20+ yr advisor. Portfolio: StorReduce, Josef Legal, Atolio, Section, Rookout. $10k–$50k.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Director, Inodes (Australian managed-hosting / infrastructure consultancy)',
      'Mentor, UNSW Founders'
    ],
    'experience_years','20+ years',
    'verified_portfolio', ARRAY['StorReduce','Josef Legal','Atolio','Bright OS','Thanks.dev','Onqlave','Section','Rookout','VirtualPlatform','Uliaa','Bloody Good Tests'],
    'investment_thesis','Developer-tools, infrastructure, legal-tech and B2B SaaS where his Inodes operating-engineering background is value-add.',
    'check_size_note','$10k–$50k',
    'sources', jsonb_build_object(
      'inodes_about','https://inodes.org/about-me/',
      'linkedin','https://www.linkedin.com/in/johnf/',
      'crunchbase','https://www.crunchbase.com/person/john-ferlito',
      'github','https://github.com/johnf',
      'twitter_x','https://x.com/johnf',
      'dealroom','https://app.dealroom.co/investors/john_ferlito_1',
      'unsw_founders_zoominfo','https://www.zoominfo.com/p/John-Ferlito/43824335'
    ),
    'corrections','CSV portfolio truncated ("StorReduce, Josef, Atolio,..."). Expanded with verified Dealroom positions: Bright OS, Thanks.dev, Onqlave, Section, Rookout, VirtualPlatform, Uliaa, Bloody Good Tests. Josef resolved to Josef Legal.'
  ),
  updated_at = now()
WHERE name = 'John Ferlito';

COMMIT;
