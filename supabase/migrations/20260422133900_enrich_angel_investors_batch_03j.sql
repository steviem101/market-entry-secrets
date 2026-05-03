-- Enrich angel investors — batch 03j (records 199-203: Rebecca Ren → Robert Lederer)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based Web3 / AI angel investor, LP, startup advisor, entrepreneur and speaker. Tech and Web3 focus. Active in Sydney Web3 community.',
  basic_info = 'Rebecca Ren is a Sydney-based **Web3 / AI Angel Investor, LP Investor, Startup Advisor, Entrepreneur and Speaker** with active involvement in the Web3, AI and venture-capital communities. Stated thesis: **Tech, Web3**.

Beyond the directory listing and her LinkedIn presence as a Web3 community speaker, individual investment portfolio details could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian Web3, blockchain, crypto and AI founders looking for a Sydney-based angel cheque from someone with active Web3 community involvement. Best treated as a referral/introduction-led conversation given limited public investment history.',
  sector_focus = ARRAY['Tech','Web3','Blockchain','Crypto','AI','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://linkedin.com/in/rebeccaren',
  contact_email = 'yren8742@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Rebecca Ren — Sydney Web3 / AI Angel',
  meta_description = 'Sydney Web3 and AI angel investor. LP investor, startup advisor.',
  details = jsonb_build_object(
    'investment_thesis','Tech and Web3 — Sydney Web3/AI angel and LP.',
    'community_roles', ARRAY['Web3 / AI speaker','Startup advisor'],
    'unverified', ARRAY[
      'Specific portfolio companies and detailed investment history not uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://linkedin.com/in/rebeccaren'
    ),
    'corrections','CSV LinkedIn URL had no protocol prefix.'
  ),
  updated_at = now()
WHERE name = 'Rebecca Ren';

UPDATE investors SET
  description = 'Melbourne-based serial founder, accelerator operator and angel investor. Co-founder of Startupbootcamp Australia (with Trevor Townsend). Former Head of Accelerator London at Tech City; helped 100+ London startups raise funding. Former Fund Manager Emerald Investment Fund. Angel since 2001. $25k–$50k cheques.',
  basic_info = 'Richard Celm is a Melbourne-based serial founder, accelerator operator and angel investor — **active as a founder, investor and mentor since 2001**. He is the **Co-Founder & Executive Program Director of Startupbootcamp Australia** (with Trevor Townsend) — a leading Australian accelerator running programmes including SBC EnergyAus, SBC Sport & EventTech.

He has deep accelerator-operator credentials — having spent **10 years delivering startup programmes in London** as Head of Accelerator London in Tech City, working with corporates, government and universities. He helped **100+ London startups raise money** working with **Angels Den** and **Crowdcube**, and was the **Fund Manager of the Emerald Investment Fund**.

He has been involved with **Startupbootcamp** since 2013 as a mentor and investment advisor on the Copenhagen mobility programme and subsequently in London and Barcelona prior to co-founding the Australian operations.

His CSV-listed portfolio includes:
- **Crowdcube** (UK equity-crowdfunding platform — Advisor)
- **LexX Technologies** (Australian aviation maintenance AI — SBC EnergyAus role)
- Plus additional truncated names

Stated thesis: **Energy, FinTech, FoodTech**. CSV cheque size $25k–$50k.',
  why_work_with_us = 'For Australian energy, fintech and foodtech founders — and especially those exploring accelerator pathways — Richard combines exceptional global accelerator-operating depth (10 years London Tech City, SBC across multiple cities) with active Melbourne angel cheques and Australian deep deal-flow access via Startupbootcamp.',
  sector_focus = ARRAY['Energy','FinTech','FoodTech','SaaS','EnergyTech','Mobility','SportTech','EventTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/richardcelm/',
  contact_email = 'richard@startupbootcamp.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Startupbootcamp Australia (Co-Founder, Executive Program Director)','Crowdcube (Advisor)','LexX Technologies','Emerald Investment Fund (former Fund Manager)','Accelerator London / Tech City (former Head)'],
  meta_title = 'Richard Celm — Startupbootcamp Co-Founder | Melbourne Angel',
  meta_description = 'Melbourne accelerator operator and angel since 2001. SBC Australia co-founder. London Tech City / Crowdcube. $25k–$50k.',
  details = jsonb_build_object(
    'firms', ARRAY['Startupbootcamp Australia (Co-Founder, Executive Program Director, with Trevor Townsend)','Crowdcube (Advisor)','LexX Technologies (SBC EnergyAus role)'],
    'prior_career','10 years Head of Accelerator London at Tech City; Fund Manager Emerald Investment Fund; SBC mentor Copenhagen, London, Barcelona since 2013',
    'investment_thesis','Energy, FinTech, FoodTech — accelerator-deal-flow leveraged.',
    'angel_investing_since',2001,
    'check_size_note','$25k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/richardcelm/',
      'sbc_australia','https://www.startupbootcamp.com.au/',
      'monash','https://www.monash.edu/business/future-students/entrepreneurship/assets/profiles/richard-celm',
      'f6s','https://www.f6s.com/richardcelm'
    ),
    'corrections','CSV portfolio truncated ("Crowdcube, LexX Techno..."). Two retained verbatim plus founder/role context. CSV email truncated ("richard@startupbootcam...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Richard Celm';

UPDATE investors SET
  description = 'Brisbane-based veteran angel investor with 70+ angel investments. Founder of MooCoo Ventures. Brisbane Angels member. Non-Executive Director at UniQuest. Former ASX-listed CEO (Dark Blue Sea, sold for 8x). 35+ year career across investment banking, funds management, early-stage tech. Awarded "Most Active Angel Investor in Australia" three times. $5–$10k cheques + larger.',
  basic_info = 'Richard Moore is one of Australia''s most prolific angel investors — a Brisbane-based veteran with **70+ angel investments to date** and a continuing pace of **10-15 new deals per year**. He is the **Founder of MooCoo Ventures** and a **Brisbane Angels** member, plus **Non-Executive Director at UniQuest** (University of Queensland''s commercialisation company).

He has a **35+ year career** spanning investment banking, funds management, early-stage technology and internet ventures — including being **CEO of ASX-listed Dark Blue Sea** (acquired by Photon for 8x return).

Notable angel highlight investments include:
- **Arkose Labs** (US fraud-prevention; SoftBank Series C — partial liquidity 50x return)
- **Clipchamp** (acquired by Microsoft — 40x return)
- **Cake Equity** (Brisbane B2B SaaS for cap-table management)
- **Ubaryon**
- Plus 65+ additional positions

He has been awarded **"Most Active Angel Investor in Australia" three times**. CSV cheque size $5–$10k (entry positions; larger follow-ons typical). Sector mandate: technology, software, internet, mobile, SaaS, cloud and blockchain.',
  why_work_with_us = 'For Australian and especially Brisbane/Queensland-based founders — Richard is among the most-credentialed and most-active single angels in the country. His Clipchamp (Microsoft) and Arkose Labs (50x partial) outcomes signal real pattern recognition. The MooCoo Ventures + Brisbane Angels + UniQuest network means his cheque often comes with deep introductions across the Queensland ecosystem.',
  sector_focus = ARRAY['Generalist','Tech','Software','SaaS','Cloud','Mobile','Blockchain','Internet','Patents'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 10000,
  linkedin_url = 'https://linkedin.com/in/richardmoore',
  contact_email = 'richard@richardmoore.com.au',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['MooCoo Ventures (Founder)','Brisbane Angels (member)','UniQuest (Non-Executive Director)','Arkose Labs','Clipchamp (acquired by Microsoft)','Cake Equity','Ubaryon','Dark Blue Sea (former CEO; ASX-listed; acquired by Photon)'],
  meta_title = 'Richard Moore — MooCoo Ventures | Brisbane Mega-Angel | 70+ Investments',
  meta_description = 'Brisbane veteran angel. 70+ investments. Arkose Labs, Clipchamp portfolio. 3x Most Active Angel in Australia.',
  details = jsonb_build_object(
    'firms', ARRAY['MooCoo Ventures (Founder)','Brisbane Angels (member)','UniQuest (Non-Executive Director)','Dark Blue Sea (former CEO; ASX-listed)'],
    'prior_career','35+ year career across investment banking, funds management, early-stage tech, internet ventures',
    'investment_thesis','Tech, software, internet, mobile, SaaS, cloud, blockchain — financial-rigour-led pattern recognition.',
    'check_size_note','$5–$10k entry; larger follow-ons typical',
    'awards', ARRAY['Most Active Angel Investor in Australia (x3)'],
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Arkose Labs','context','SoftBank Series C; partial liquidity 50x return'),
      jsonb_build_object('company','Clipchamp','context','Acquired by Microsoft 2021; 40x return'),
      jsonb_build_object('company','Dark Blue Sea','context','ASX-listed; sold to Photon for 8x return; was CEO'),
      jsonb_build_object('company','Cake Equity','context','Brisbane B2B SaaS for cap-table management'),
      jsonb_build_object('company','Ubaryon','context','Brisbane Angels portfolio')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/richardmoore/',
      'angel_portfolio','https://angelportfolio.com.au/about-me/',
      'website','https://www.richardmoore.com.au/about',
      'crunchbase','https://www.crunchbase.com/person/richard-moore-5'
    ),
    'corrections','CSV stated "80+ investments"; public sources confirm "70+" — adjusted. CSV email truncated ("richard@richardmoore.co...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Richard Moore';

UPDATE investors SET
  description = 'Melbourne-based B2B SaaS operator, advisor and angel investor. Founder of Track Record (B2B SaaS news service for VCs and angels). Helped build 4 B2B SaaS startups. RegTech, LegalTech and B2B SaaS focus.',
  basic_info = 'Robbie Sita is a Melbourne-based **B2B SaaS operator, advisor and angel investor**. He is the **Founder of Track Record** — a curated entrepreneur news service for VCs, angel investors, institutional and private investors, corporate advisors and journalists.

He has helped build **4 B2B SaaS startups** as an operator and continues to publish detailed B2B SaaS strategy, unit economics and operational metrics benchmarking on his personal site (robbiesita.com).

Stated thesis: **B2B SaaS, RegTech, LegalTech**. CSV cheque size not specified.

Beyond the operator profile and Track Record platform, individual portfolio companies could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian B2B SaaS, RegTech and LegalTech founders looking for a Melbourne-based operator-angel with deep SaaS unit-economics expertise. Particularly relevant for founders looking for hands-on benchmarking and operating advice alongside an angel cheque.',
  sector_focus = ARRAY['B2B SaaS','RegTech','LegalTech','SaaS','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/robbiesita/',
  contact_email = 'robsita91@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Track Record (Founder)','4 B2B SaaS startups (operator)'],
  meta_title = 'Robbie Sita — Track Record Founder | Melbourne B2B SaaS Angel',
  meta_description = 'Melbourne B2B SaaS operator and angel. Track Record founder. RegTech, LegalTech focus.',
  details = jsonb_build_object(
    'firms', ARRAY['Track Record (Founder)'],
    'investment_thesis','B2B SaaS with RegTech and LegalTech bias.',
    'unverified', ARRAY[
      'Specific portfolio companies could not be uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/robbiesita/',
      'website','https://robbiesita.com/'
    ),
    'corrections','CSV portfolio empty.'
  ),
  updated_at = now()
WHERE name = 'Robbie Sita';

UPDATE investors SET
  description = 'Sydney-based serial angel investor, director and advisor. CEO of RTL Group Investments / Lederer Group. 40+ startup investments across Australia, USA, Israel, Canada. Notable Shippit Series A investor (2017). B2B SaaS, marketplace and FinTech focus. Former family-business operator (one of Australia''s largest food manufacturers).',
  basic_info = 'Robert Lederer is a Sydney-based **seasoned angel investor, director and advisor** with an impressive track record of involvement in **40+ startups** across **Australia, USA, Israel and Canada**. He is **CEO of RTL Group Investments** (his personal investment vehicle) and operates the **Lederer Group**.

His sector experience spans **traveltech, fintech, online marketplaces, alternative proteins, AI, recruitment / gig-economy, BNPL, e-commerce logistics and proptech** — but he describes his core thesis as **B2B SaaS, Marketplace, FinTech**.

His CSV-listed portfolio includes:
- **Shippit** (Australian e-commerce shipping/logistics — RTL Group participated in **2017 Series A** funding round)
- **Manettas** (online seafood marketplace)
- **Inspaca** (truncated context)
- Plus additional truncated names

His career arc: stockbroker → mortgage-broking founder (sold) → 14 years in family food-manufacturing business (one of Australia''s largest) → angel investor. Holds a Graduate Diploma of Applied Finance (Kaplan Professional) and Bachelor of Commerce (Macquarie University, Economics & Marketing).',
  why_work_with_us = 'For Australian B2B SaaS, marketplace, FinTech, e-commerce-logistics and PropTech founders — Robert combines significant personal-investment cheque capacity (40+ deals across 4 countries), deep family-business operator background (one of Australia''s largest food manufacturers) and strong cross-border deal-flow into Israel and the USA via Lederer Group networks.',
  sector_focus = ARRAY['B2B SaaS','Marketplace','FinTech','E-commerce','Logistics','PropTech','TravelTech','AI','BNPL','Alt Proteins'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/robert-lederer',
  contact_email = 'rlederer@lederergroup.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['RTL Group Investments (CEO)','Lederer Group','Shippit','Manettas','40+ angel investments across AU, US, Israel, Canada'],
  meta_title = 'Robert Lederer — RTL/Lederer Group | Sydney B2B SaaS / Marketplace Angel',
  meta_description = 'Sydney 40+ deal angel. RTL Group / Lederer Group CEO. Shippit Series A (2017). B2B SaaS, marketplace, FinTech.',
  details = jsonb_build_object(
    'firms', ARRAY['RTL Group Investments (CEO)','Lederer Group'],
    'prior_career','Stockbroker; mortgage-broking founder (sold); 14 years family food-manufacturing business (one of Australia''s largest)',
    'education','Graduate Diploma of Applied Finance (Kaplan Professional); Bachelor of Commerce (Macquarie University, Economics & Marketing)',
    'investment_thesis','B2B SaaS, Marketplace, FinTech — global deal-flow across AU, US, Israel, Canada.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Shippit','context','RTL Group participated in 2017 Series A funding round')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/robert-lederer',
      'pitchbook','https://pitchbook.com/profiles/investor/303648-22',
      'crunchbase','https://www.crunchbase.com/person/rob-lederer'
    ),
    'corrections','CSV portfolio truncated ("Shippit, Manettas, Inspac..."). Three retained verbatim. CSV email truncated ("rlederer@lederergroup.co...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Robert Lederer';

COMMIT;
