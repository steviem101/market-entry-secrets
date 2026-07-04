-- Enrich angel investors — batch 03r (records 239-243: Thomas Rice → Todd Soulas)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based fund manager and angel investor. Co-Founder & Portfolio Manager at Minotaur Capital. Former Perpetual Global Innovation Share Fund manager (6 yrs of 9 yrs at Perpetual). 11 years at PM Capital. Sector-agnostic angel; backs Australian disruptive tech with global ambition. Portfolio includes Morse Micro (Wi-Fi HaLow), Instaclustr (NetApp exit), Alta, AmazingCo, SimConverse. $10k–$25k cheques.',
  basic_info = 'Thomas Rice is a Sydney-based **fund manager and angel investor**. He is **Co-Founder and Portfolio Manager at Minotaur Capital**. Before Minotaur, he spent **9 years at Perpetual** (including **6 years running the Global Innovation Share Fund**) and **11 years at PM Capital**.

He is one of the very few investors in Australia who makes **individual investments at the seed stage**. CSV-listed portfolio includes some of Australia''s most notable deep-tech / SaaS scale-ups:
- **Morse Micro** (Wi-Fi HaLow chips — Australian semiconductor)
- **Instaclustr** (managed open-source databases — exited to NetApp 2022 ~US$500M)
- **Alta** (VR game studio)
- **AmazingCo** (mystery experiences)
- **SimConverse** (AI simulation for healthcare)
- Plus additional truncated names

CSV cheque size **$10k–$25k**. Stated thesis: **All sectors** — but focused on companies that can disrupt industries on a global scale.',
  why_work_with_us = 'For Australian deep-tech, semiconductor, AI/healthcare, infrastructure-software and consumer-experience founders — Thomas combines exceptional listed-fund-manager pedigree (6 yrs Perpetual Global Innovation Share Fund) with personal seed-stage angel cheques and a high-quality portfolio (Instaclustr/NetApp exit, Morse Micro). Especially valuable for technical founders building globally-disruptive products.',
  sector_focus = ARRAY['Generalist','Deep Tech','Semiconductor','SaaS','Infrastructure Software','AI','Healthcare','VR','Consumer Experience'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/thomasrice/',
  contact_email = 'thomas@thomasrice.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Minotaur Capital (Co-Founder & Portfolio Manager)','Perpetual (former; 9 yrs incl. 6 yrs Global Innovation Share Fund)','PM Capital (former; 11 yrs)','Morse Micro','Instaclustr (acquired by NetApp 2022)','Alta','AmazingCo','SimConverse'],
  meta_title = 'Thomas Rice — Minotaur Capital | Sydney Listed-Fund / Seed Angel',
  meta_description = 'Sydney Minotaur Capital co-founder. ex-Perpetual Global Innovation. Morse Micro, Instaclustr in portfolio. $10–$25k.',
  details = jsonb_build_object(
    'firms', ARRAY['Minotaur Capital (Co-Founder & Portfolio Manager)','Perpetual (former; 9 yrs incl. 6 yrs Global Innovation Share Fund)','PM Capital (former; 11 yrs)'],
    'investment_thesis','All sectors — Australian disruptive tech with global scale ambition.',
    'check_size_note','$10k–$25k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Instaclustr','context','Acquired by NetApp 2022 (~US$500M)'),
      jsonb_build_object('company','Morse Micro','context','Wi-Fi HaLow chips — Australian semiconductor'),
      jsonb_build_object('company','SimConverse','context','AI simulation for healthcare')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/thomasrice/',
      'website','https://www.thomasrice.com/',
      'crunchbase','https://www.crunchbase.com/person/thomas-rice',
      'pitchbook','https://pitchbook.com/profiles/investor/182000-44'
    ),
    'corrections','CSV portfolio truncated ("Morse Micro, Instaclustr, ..."). Five retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Thomas Rice';

UPDATE investors SET
  description = 'London-based (Sydney-rooted) angel investor and serial founder. Founder & CEO of Hyper (global startup studio since 2015 — same Hyper as Sasha Reid co-founder). Tech-focused angel. Investor and Advisor at LOKE, Magic Mountain App, RIDE (acquired 2020), Socialbase. International Deal Gateway London Ambassador. $100,000 cheques.',
  basic_info = 'Thomas (Tom) West is a **London-based (Sydney-rooted) seasoned entrepreneur and angel investor**. He is the **Founder & CEO of Hyper since 2015** — the global startup studio focused on maximising the success of new business ideas (note: Hyper is the same studio Sasha Reid is also affiliated with as Founder & CEO — distinct individuals; both involved in the Hyper studio platform).

He has roles as **investor and advisor** at:
- **LOKE** (Australian mobile delivery, ordering, loyalty solutions)
- **Magic Mountain App** (consumer)
- **RIDE** (Australian transport/mobility — acquired 2020)
- **Socialbasehq** (social/marketplace)
- **Aston Club** (former; acquired by LOKE 2017)
- **Vague Clothing** (former; clothing design)

He is also the **Ambassador for London at International Deal Gateway** — connecting business leaders and investors across borders.

CSV cheque size: **$100,000**. Stated thesis: **Tech**. CSV TMW Trust email reference suggests his personal investment vehicle.',
  why_work_with_us = 'For Australian tech, marketplace, consumer-mobile and SaaS founders looking for a London-based cross-border angel — Tom combines deep Sydney/Hyper studio operating credentials with London-VC network access via International Deal Gateway. Especially valuable for ANZ founders pursuing UK / European go-to-market.',
  sector_focus = ARRAY['Tech','Consumer','Mobile','Marketplace','SaaS','Mobility','Transport','Studio'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 100000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/thomas-west-1b04b833/',
  contact_email = 'tmwtrust@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Hyper (Founder & CEO since 2015)','RIDE (Investor & Advisor; acquired 2020)','Magic Mountain App','LOKE','Socialbase','Aston Club (former; acquired by LOKE 2017)','International Deal Gateway (London Ambassador)','TMW Trust (investment vehicle)'],
  meta_title = 'Thomas West — Hyper Founder & CEO | Sydney/London Tech Angel | $100k',
  meta_description = 'Hyper founder/CEO since 2015. RIDE, Magic Mountain, LOKE, Socialbase portfolio. London / Sydney cross-border. $100k.',
  details = jsonb_build_object(
    'firms', ARRAY['Hyper (Founder & CEO since 2015)','International Deal Gateway (London Ambassador)','TMW Trust (personal investment vehicle)'],
    'investment_thesis','Tech — Sydney-rooted, London-active studio-network angel.',
    'check_size_note','$100,000',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/thomas-west-1b04b833/',
      'theorg_ride','https://theorg.com/org/ride/org-chart/thomas-west'
    ),
    'corrections','CSV portfolio truncated ("Ride, Magic Mountain, So..."). Three retained verbatim plus exit context for RIDE. Note: Hyper appears affiliated to multiple founders — both Sasha Reid and Thomas West link to Hyper roles in directory.'
  ),
  updated_at = now()
WHERE name = 'Thomas West';

UPDATE investors SET
  description = 'Melbourne-based angel investor and community connector. Board member at Seed Planet (connecting Australian startups to Asian investor networks). Active Melbourne Angels investor. Diversity-focused — closing the funding gap for women founders, diverse groups and new immigrants. AI commercialisation expert. FinTech, PropTech, AI, Deep Tech focus. $50K–$250K cheques.',
  basic_info = 'Tick Jiang is a Melbourne-based angel investor and community connector with a stated focus on **closing the funding gap** for women founders, individuals from diverse groups and new immigrants. He sits on the **board of Seed Planet** — connecting Australian startups to a network of Asian investors — with the motto "Connect and Inspire".

He has expertise in **commercialising AI** and is associated with the Wade Institute (University of Melbourne entrepreneurship centre).

CSV-listed portfolio includes:
- **Digi.me** (UK personal-data privacy platform)
- **Instarent** (Australian PropTech — instant-rental marketplace)
- **Epic Games** (truncated context)
- Plus additional truncated names

CSV cheque size **$50K–$250K**. Stated thesis: **FinTech, PropTech, AI, Deep Tech**.',
  why_work_with_us = 'For Australian FinTech, PropTech, AI, deep-tech and especially women/diverse-led founders — Tick combines a $50k–$250k cheque size with active Asian-investor network access (Seed Planet board), diversity-funding-gap focus, and AI commercialisation depth. Especially relevant for founders pursuing Asian capital pathways.',
  sector_focus = ARRAY['FinTech','PropTech','AI','Deep Tech','SaaS','Data Privacy','Cross-border'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 250000,
  linkedin_url = 'https://www.linkedin.com/in/tickj/',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Seed Planet (Board)','Melbourne Angels (member)','Digi.me','Instarent','Epic Games'],
  meta_title = 'Tick Jiang — Seed Planet Board | Melbourne FinTech/PropTech/AI Angel',
  meta_description = 'Melbourne diversity-focused angel. Seed Planet Board. Asian investor network. FinTech, PropTech, AI. $50k–$250k.',
  details = jsonb_build_object(
    'firms', ARRAY['Seed Planet (Board)','Melbourne Angels (member)','Wade Institute (associated)'],
    'investment_thesis','FinTech, PropTech, AI, Deep Tech — diversity-funding-gap focus on women, diverse and immigrant founders.',
    'check_size_note','$50K–$250K',
    'community_focus','Connect and Inspire — diverse-founder funding gap; Asian investor network connector',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/tickj/',
      'wade_institute','https://wadeinstitute.org.au/closing-the-funding-gap-and-commercialising-ai-with-tick-jiang/'
    ),
    'corrections','CSV portfolio truncated ("Digi.me, Instarent, Epic G..."). Three retained verbatim. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Tick Jiang';

UPDATE investors SET
  description = 'Melbourne-based crypto/digital-asset fund manager. Co-Founder & Managing Director of Apollo Capital (Apollo Crypto) — Australian crypto-asset fund manager. CFA charterholder. Former DMP Asset Management ($33B super fund) and Dominet Venture Partners associate. AIMA member. $25k angel cheques. Crypto/Web3/digital-asset focus.',
  basic_info = 'Tim Johnston is a Melbourne-based crypto/digital-asset fund manager and angel investor. He is **Co-Founder and Managing Director of Apollo Capital (Apollo Crypto)** — an Australian crypto-asset fund manager that brings institutional asset management to crypto.

He oversees operations and business at Apollo Capital. He is a **CFA charterholder** and has been **active in crypto markets for 4+ years**.

His prior career includes:
- **DMP Asset Management** (boutique Australian Equities Fund Manager — investment team managing a $33 billion super fund)
- **Dominet Venture Partners** (former venture capital Associate)

He is also active in **AIMA (Alternative Investment Management Association)**.

CSV-listed portfolio includes:
- **Apollo Capital** (Co-Founder/MD)
- **Meld Gold** (Australian gold-tokenisation project)
- Plus additional truncated names

CSV cheque size **$25k**. CSV stated thesis is empty — but his focus is clearly crypto/digital-assets.',
  why_work_with_us = 'For Australian and global crypto, Web3, digital-asset, tokenisation and blockchain founders — Tim brings exceptional institutional crypto-fund-management depth (Apollo Capital) plus traditional fund-management pedigree (DMP $33B super fund, CFA). Especially valuable for crypto-native founders pursuing institutional-grade investor relations.',
  sector_focus = ARRAY['Crypto','Digital Assets','Web3','Blockchain','Tokenisation','FinTech','DeFi'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/tim-johnston-au/',
  contact_email = 'tim@apollocap.io',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Apollo Capital / Apollo Crypto (Co-Founder & Managing Director)','Meld Gold','DMP Asset Management (former)','Dominet Venture Partners (former Associate)','AIMA (member)'],
  meta_title = 'Tim Johnston — Apollo Capital MD | Melbourne Crypto / Digital Asset Angel',
  meta_description = 'Melbourne Apollo Capital co-founder/MD. Australian crypto-asset fund manager. Meld Gold. CFA. $25k.',
  details = jsonb_build_object(
    'firms', ARRAY['Apollo Capital / Apollo Crypto (Co-Founder & Managing Director)','DMP Asset Management (former)','Dominet Venture Partners (former Associate)','AIMA (member)'],
    'prior_career','Investment team at DMP Asset Management ($33B super fund); VC Associate at Dominet Venture Partners',
    'credentials','CFA charterholder; 4+ years in crypto markets',
    'investment_thesis','Crypto / digital-assets / Web3 — institutional-grade Australian crypto fund.',
    'check_size_note','$25k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/tim-johnston-au',
      'apollo_crypto','https://apollocrypto.com/about/',
      'aima','https://www.aima.org/widgets/team_members/teamMemberDetails/?id=DD58015E-3937-4A8F-9B8AEF589249B813'
    ),
    'corrections','CSV portfolio truncated ("Apollo Capital, Meld Gold..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Tim Johnston';

UPDATE investors SET
  description = 'Sydney-based consultant, investor and generalist. Decade+ experience across private and public sectors helping clients with strategy, transformation and innovation. Active impact investor — early-stage social-impact startups aligned with the UN Sustainable Development Goals (SDGs). Portfolio includes Maslow, Frenalytics (cognitive-disability learning software), Rntr, Recime. $5–$20k cheques. Social Impact, Health, Education focus.',
  basic_info = 'Todd Soulas is a Sydney-based **consultant, founder, investor and generalist** helping clients with strategy, transformation and innovation challenges. He brings **decade+ experience** working with clients across private and public sectors.

He is an **active impact investor** targeting **early-stage social-impact startups aligned with the UN Sustainable Development Goals (SDGs)**.

CSV-listed portfolio includes:
- **Maslow** (impact)
- **Frenalytics** (patented personalised learning and data-collection software for people with cognitive disabilities — including stroke, dementia, brain injury, autism, Down syndrome)
- **Neur...** (truncated)
- **Rntr** (consumer/sharing-economy)
- **Recime** (mentor-context platform)
- Plus additional names

CSV cheque size **$5–$20k**. Stated thesis: **Social Impact, Health, Education**.',
  why_work_with_us = 'For Australian impact-aligned, social-impact, health-tech, ed-tech and accessibility-tech founders — Todd combines a clearly stated SDG-aligned thesis with active small-cheque deployment ($5–$20k) and decade+ consulting/strategy advisory depth. Especially valuable for founders building inclusive, accessibility or sustainability-focused products.',
  sector_focus = ARRAY['Social Impact','Impact','Health','Education','EdTech','HealthTech','Accessibility','SDG'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 20000,
  linkedin_url = 'https://www.linkedin.com/in/toddsoulas/',
  contact_email = 'todd@toddsoulas.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Maslow','Frenalytics','Rntr','Recime'],
  meta_title = 'Todd Soulas — Sydney Impact Angel | SDG-Aligned | Frenalytics, Maslow',
  meta_description = 'Sydney consultant and impact angel. UN SDG-aligned. Maslow, Frenalytics, Rntr, Recime portfolio. $5–$20k.',
  details = jsonb_build_object(
    'investment_thesis','Social Impact, Health, Education — UN SDG-aligned early-stage social-impact startups.',
    'check_size_note','$5–$20k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/toddsoulas/',
      'website','https://toddsoulas.com/'
    ),
    'corrections','CSV portfolio truncated ("Maslow, Frenalytics, Neur..."). Three retained verbatim plus Rntr/Recime from public profile.'
  ),
  updated_at = now()
WHERE name = 'Todd Soulas';

COMMIT;
