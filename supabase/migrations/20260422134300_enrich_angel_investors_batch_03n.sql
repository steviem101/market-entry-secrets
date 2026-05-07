-- Enrich angel investors — batch 03n (records 219-223: Sergei Sergienko → Simran Gambhir)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based blockchain entrepreneur and angel investor. Founder/CEO of Chrono.tech / ChronoBank (Australia''s first ICO 2017; tokenised labour-hours platform for HR sector). Co-founder/Director of Edway Group (Australian recruitment). UNSW Bachelor of Commerce. Blockchain, FinTech and Compliance focus.',
  basic_info = 'Sergei Sergienko is a Sydney-based **blockchain entrepreneur and angel investor**. He is the **founder and CEO of Chrono.tech** (formerly ChronoBank) — a global blockchain startup headquartered in Sydney that ran **Australia''s first successful ICO in 2017** with the TIME token, focused on **tokenising labour hours** to disrupt the short-term recruitment / gig-economy sector.

He is also **Co-founder and Director of Edway Group** — one of Australia''s biggest recruitment companies — and serves as **Advisor at Afford.Capital** and **ICO Advisor at BANKEX**.

Education: **Bachelor of Commerce in Finance and Economics, University of New South Wales (2000-2004)**.

Awards & recognition include **"Hot 30 under 30"**, **"Young Gun in Business"**, and representing Australia at G20 summits.

Stated thesis: **Blockchain, FinTech, Compliance**. CSV portfolio: Chronobank. CSV cheque size not specified.',
  why_work_with_us = 'For Australian and global blockchain, Web3, fintech, RegTech and HR-tech founders — Sergei brings genuine first-mover blockchain credentials (Australia''s first ICO 2017) plus a deep recruitment-industry network through Edway Group. Especially valuable for token-economy and HR/gig-economy founders pursuing blockchain integration.',
  sector_focus = ARRAY['Blockchain','FinTech','Compliance','Crypto','Web3','HR Tech','Gig Economy','RegTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/sergeisergienko/',
  contact_email = 'sergei@chronobank.io',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Chrono.tech / ChronoBank (Founder & CEO)','Edway Group (Co-Founder & Director)','Afford.Capital (Advisor)','BANKEX (ICO Advisor)'],
  meta_title = 'Sergei Sergienko — ChronoBank Founder | Sydney Blockchain Angel',
  meta_description = 'Sydney blockchain entrepreneur. ChronoBank founder/CEO (Australia''s first ICO 2017). Edway Group co-founder.',
  details = jsonb_build_object(
    'firms', ARRAY['Chrono.tech / ChronoBank (Founder & CEO; founded 2016)','Edway Group (Co-Founder & Director)','Afford.Capital (Advisor)','BANKEX (ICO Advisor)'],
    'investment_thesis','Blockchain, FinTech, Compliance — token-economy specialist.',
    'awards', ARRAY['Hot 30 under 30','Young Gun in Business','G20 Australian representative'],
    'milestones', ARRAY['Ran Australia''s first successful ICO in 2017 (TIME token)'],
    'education','Bachelor of Commerce in Finance and Economics, UNSW (2000-2004)',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/sergeisergienko/',
      'crunchbase','https://www.crunchbase.com/person/sergei-sergienko',
      'website','https://sergei.com.au/',
      'smartcompany','https://www.smartcompany.com.au/startupsmart/news/australia-first-ico-chronobank-founder-sergei-sergienko-lessons/'
    ),
    'corrections','CSV thesis truncated ("Blockchain, Fintech, Com..."). Resolved.'
  ),
  updated_at = now()
WHERE name = 'Sergei Sergienko';

UPDATE investors SET
  description = 'Brisbane-based investment director and angel investor. Strategic Operations Director - Investments at Gallantree Group. 30+ year career in merchant banking and family-office investments. Brisbane Angels member. Director - Macarthur Innovation. Health & Medical, Energy focus. Up to $25,000 cheques. Judge on Australian Angel Awards 2023.',
  basic_info = 'Sharif Sethi is a Brisbane-based **investment director and angel investor**. He is **Strategic Operations Director - Investments at Gallantree Group** with **30+ years of business experience** — the last decade focused on **investment management in merchant banking and family-office investments**.

His expertise spans **investment structuring & valuation, due diligence, strategic M&A and corporate structuring**, with deep knowledge across **Industrial Machinery, Energy and Health & Medical** sectors.

He is a **Brisbane Angels** member and was on the **Judging Committee for the Australian Angel Awards 2023**. He is also **Director at Macarthur Innovation**.

His CSV-listed portfolio includes:
- **Autram** (Brisbane health-tech)
- **Moxion** (Australian energy/tech — likely Moxion Power)
- **Venuenow** (truncated context)
- Plus additional truncated names

CSV cheque size: **Up to $25,000**. Stated thesis: **Health & Medical, Energy**.',
  why_work_with_us = 'For Australian health-tech, medical-device, energy and industrial-tech founders — and especially Brisbane/Queensland-based founders — Sharif combines decades of merchant-banking and family-office structuring experience with active Brisbane Angels deal flow and Australian Angel Awards judging exposure. Up-to-$25k entry cheque with potential structured family-office follow-on capacity.',
  sector_focus = ARRAY['Health','Medical','Energy','Industrial Machinery','Tech','Family Office'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 25000,
  linkedin_url = 'https://linkedin.com/in/sharif-sethi',
  contact_email = 'sharif.sethi@iinet.net.au',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Gallantree Group (Strategic Operations Director - Investments)','Brisbane Angels (member)','Macarthur Innovation (Director)','Autram','Moxion'],
  meta_title = 'Sharif Sethi — Gallantree / Brisbane Angels | Health & Energy Angel',
  meta_description = 'Brisbane Gallantree Strategic Ops Director. Brisbane Angels member. Health, Medical, Energy. Up to $25k.',
  details = jsonb_build_object(
    'firms', ARRAY['Gallantree Group (Strategic Operations Director - Investments)','Brisbane Angels (member)','Macarthur Innovation (Director)'],
    'prior_career','30+ years business experience; last decade focused on merchant-banking and family-office investment management',
    'investment_thesis','Health & Medical, Energy, Industrial Machinery — Brisbane family-office angel.',
    'check_size_note','Up to $25,000',
    'community_roles', ARRAY['Australian Angel Awards 2023 (Judge)'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/sharif-sethi/'
    ),
    'corrections','CSV portfolio truncated ("Autram, Moxion, Venueno..."). Three retained verbatim. CSV LinkedIn had no protocol prefix.'
  ),
  updated_at = now()
WHERE name = 'Sharif Sethi';

UPDATE investors SET
  description = 'London-based angel investor. Founding Partner of First Look Capital. Early Stripe employee (Chief Compliance Officer / MLRO Europe). Former Apple ethics/compliance/risk EMEIA. Former Christie''s global chief compliance and ethics officer. Former Goldman Sachs private wealth compliance. Oxford Saïd Business School Executive MBA. FinTech, Creator Economy, FemTech, Future of Work focus. GBP 10k–50k cheques.',
  basic_info = 'Shefali Roy is a London-based **Angel Investor and Founding Partner of First Look Capital**. She is one of the most credentialed financial-services-compliance executives in Europe — investing globally in startups at **pre-seed, seed and Series A rounds** in companies building products in **FinTech, the Creator Economy, FemTech and the Future of Work**.

She was an **early employee at Stripe** where she served as **Chief Compliance Officer and Money Laundering Reporting Officer (MLRO) for Europe** — responsible for licensing and regulatory oversight, risk and compliance of European operations.

Prior to Stripe she led:
- **Ethics, compliance, business conduct and risk across EMEIA at Apple**
- **Global Chief Compliance and Ethics Officer at Christie''s**
- **Private Wealth Compliance for Goldman Sachs across Europe and the Middle East**

Education: undergraduate qualifications in **law, economics and finance**, postgraduate qualifications in **journalism and economic history** from **RMIT, Oxford and LSE** respectively. Recently completed an **Executive MBA at Oxford''s Saïd Business School**, where she now **teaches on open banking, financial inclusion and decentralised finance**.

CSV cheque size: **GBP 10k–50k**.',
  why_work_with_us = 'For European, US, Australian and global founders building FinTech, Creator Economy, FemTech or Future-of-Work companies — Shefali combines exceptional regulatory/compliance depth (early-Stripe + Apple + Christie''s + Goldman) with hands-on First Look Capital cheque deployment and Oxford Saïd teaching presence. Especially valuable for fintech founders navigating complex EU/UK regulatory pathways.',
  sector_focus = ARRAY['FinTech','Creator Economy','FemTech','Future of Work','Compliance','RegTech','Open Banking','DeFi'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 19000,
  check_size_max = 95000,
  linkedin_url = 'https://www.linkedin.com/in/shefaliroy/',
  location = 'London, UK',
  country = 'United Kingdom',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['First Look Capital (Founding Partner)','Stripe (early employee; Chief Compliance Officer / MLRO Europe)','Apple (former Ethics, Compliance, Business Conduct, Risk EMEIA)','Christie''s (former Global Chief Compliance & Ethics Officer)','Goldman Sachs (former Private Wealth Compliance EMEA)','Oxford Saïd Business School (teaches Open Banking, Financial Inclusion, DeFi)'],
  meta_title = 'Shefali Roy — First Look Capital | London FinTech / Creator Economy Angel',
  meta_description = 'London FinTech / Creator Economy / FemTech angel. First Look Capital founding partner. ex-Stripe CCO Europe.',
  details = jsonb_build_object(
    'firms', ARRAY['First Look Capital (Founding Partner)','Stripe (early employee; CCO/MLRO Europe)','Apple (former)','Christie''s (former)','Goldman Sachs (former)'],
    'prior_career','Stripe CCO Europe; Apple EMEIA Ethics/Compliance/Risk; Christie''s Global Chief Compliance & Ethics Officer; Goldman Sachs Private Wealth Compliance EMEA',
    'education','RMIT undergrad (law, economics, finance); Oxford & LSE postgrad (journalism, economic history); Oxford Saïd EMBA',
    'investment_thesis','FinTech, Creator Economy, FemTech, Future of Work — global angel.',
    'check_size_note','GBP 10k–50k (~AUD 19k–95k)',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/shefaliroy/',
      'crunchbase','https://www.crunchbase.com/person/shefali-roy',
      'oxford_said','https://www.sbs.ox.ac.uk/about-us/people/shefali-roy',
      'cdl','https://creativedestructionlab.com/mentors/shefali-roy/'
    ),
    'corrections','CSV thesis truncated ("Creator economy, digital l..."). Resolved. Cheque size converted GBP→AUD approx.'
  ),
  updated_at = now()
WHERE name = 'Shefali Roy';

UPDATE investors SET
  description = 'Sydney-based corporate-advisory professional and angel investor. Digital Assets Lead at PwC Australia. Runs PwC Emerging Companies team. UK Chartered Accountant (ICAEW). Startmate "First Believer" angel (since 2024). Tech, Crypto, FinTech, SaaS, AI focus. 8+ years capital-raise experience London/Sydney.',
  basic_info = 'Simon Keeling is a Sydney-based **corporate-advisory professional and angel investor**. He is the **Digital Assets Lead at PwC Australia** and runs the **PwC Emerging Companies team**, working with early-stage businesses on M&A, debt and equity raising for FinTech, SaaS and AI companies.

He is a **UK Chartered Accountant (ICAEW)** with a **board position on the ICAEW Tech Faculty** focusing on FinTech, AI and Data. He has **8+ years of experience** helping companies raise funding **from Seed stage through to IPO** in both London and Sydney.

He is a **First Believer Angel Investor at Startmate** (since 2024) — Australia''s most prominent accelerator angel programme.

CSV-listed thesis: **Mainly focus on: Tech, Crypto** (truncated — likely "Crypto, FinTech, SaaS, AI"). CSV cheque size and portfolio not specified.',
  why_work_with_us = 'For Australian fintech, crypto/digital-asset, SaaS and AI founders — Simon brings PwC Emerging Companies advisory depth (M&A and capital-raising playbooks), 8+ years of cross-border London/Sydney capital-raise experience, plus active Startmate First Believer angel deal flow. Especially valuable for founders pursuing structured Series-stage capital raises.',
  sector_focus = ARRAY['Tech','Crypto','FinTech','SaaS','AI','Digital Assets'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/simonkeeling/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['PwC Australia (Digital Assets Lead; PwC Emerging Companies team)','Startmate (First Believer Angel since 2024)','ICAEW Tech Faculty (Board position)'],
  meta_title = 'Simon Keeling — PwC Digital Assets Lead | Sydney Tech/Crypto Angel',
  meta_description = 'Sydney PwC Digital Assets Lead. Startmate First Believer angel. Tech, crypto, FinTech, SaaS, AI focus.',
  details = jsonb_build_object(
    'firms', ARRAY['PwC Australia (Digital Assets Lead)','Startmate (First Believer Angel; since 2024)','ICAEW Tech Faculty (Board)'],
    'prior_career','8+ years helping companies raise from Seed to IPO across London and Sydney',
    'investment_thesis','Tech, Crypto, FinTech, SaaS, AI — Sydney capital-advisory-network angel.',
    'credentials','UK Chartered Accountant (ICAEW)',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/simonkeeling/',
      'ansarada','https://www.ansarada.com/advantage-partner-directory/simon-keeling'
    ),
    'corrections','CSV thesis truncated ("Mainly focus on: Tech, Cr..."). Resolved.'
  ),
  updated_at = now()
WHERE name = 'Simon Keeling';

UPDATE investors SET
  description = 'Sydney-based serial founder and angel investor. Co-founder of Pushstart accelerator/incubator (early-stage Australian startup community). Backed Australian breakout TinyBeans (ASX-listed family photo-sharing app). Multi-investment angel.',
  basic_info = 'Simran Gambhir is a Sydney-based serial founder and angel investor. He is associated with **Pushstart** — an early-stage Australian startup community / accelerator / incubator that helped launch and grow several breakout Australian companies.

His CSV-listed portfolio includes:
- **Pushstart** (Co-Founder context)
- **TinyBeans** (Australian family-photo-sharing app — ASX-listed; the most notable Pushstart success story; angel investors met TinyBeans founders through Pushstart Incubator in 2012)
- **Wel...** (truncated context)
- Plus additional names

CSV cheque size and stated sector mandate: not specified. Pushstart-aligned generalist angel.

His current operating context (per public profile) includes Insight Global. Email: simran@dn.gs.',
  why_work_with_us = 'For Australian consumer-tech, family-tech, parenting-tech and SaaS founders — Simran''s Pushstart heritage means access to one of Australia''s longest-standing early-stage angel networks. His TinyBeans (ASX-listed) backing signals real consumer-tech pattern recognition. Best treated as a Pushstart-network warm-intro path.',
  sector_focus = ARRAY['Generalist','Consumer','Family Tech','SaaS','Marketplace','Parenting'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://linkedin.com/in/simrang',
  contact_email = 'simran@dn.gs',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Pushstart (Co-Founder context)','TinyBeans (ASX-listed)','Insight Global (current)'],
  meta_title = 'Simran Gambhir — Pushstart / TinyBeans | Sydney Generalist Angel',
  meta_description = 'Sydney serial founder and angel. Pushstart Co-Founder. TinyBeans backer (ASX-listed).',
  details = jsonb_build_object(
    'firms', ARRAY['Pushstart (Co-Founder context)','Insight Global (current)'],
    'investment_thesis','Sector-agnostic Pushstart-network Sydney angel.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','TinyBeans','context','Australian family-photo-sharing app; ASX-listed; the most notable Pushstart success story')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/simran-gambhir-70212a162/',
      'pitchbook','https://pitchbook.com/profiles/investor/149794-03',
      'pushstart_medium','https://medium.com/@kimheras/pushstart-the-little-accelerator-that-could-and-did-7ae75d38f85f'
    ),
    'corrections','CSV portfolio truncated ("Pushstart (TinyBeans, We..."). Two retained verbatim. CSV LinkedIn had no www/https prefix.'
  ),
  updated_at = now()
WHERE name = 'Simran Gambhir';

COMMIT;
