-- Enrich angel investors — batch 03v (records 259-263: Vibs Wardhen → Vincent Turner)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based (UK-affiliated) angel investor and family-office operator. Lakshya Capital affiliated (Australia/global investment platform spanning fintech and proptech). Enterprise software, consumer focus. Portfolio includes Lynda.com (acquired by LinkedIn 2015 for $1.5B) and Noodle.ai (industrial AI). $25k–$500k cheques.',
  basic_info = 'Vaibhav ("Vibs") Wardhen is a Melbourne-based (UK-affiliated) angel investor and family-office operator associated with **Lakshya Capital** — an Australia/global investment platform with fintech and proptech focus.

His CSV-listed portfolio includes some genuinely high-profile global tech names:
- **Lynda.com** (online learning platform — **acquired by LinkedIn in 2015 for ~$1.5B**)
- **Noodle.ai** (industrial AI / supply-chain analytics — World Economic Forum partner)
- **Vic...** (truncated)
- Plus additional truncated names

Stated thesis: **Enterprise software, Consumer Tech**. CSV cheque size **$25k–$500k** — wide-range, indicating both small-position entry and potential lead-anchor capacity. CSV email "Vibs@lakshyacapital.com..." reflects Lakshya Capital affiliation.',
  why_work_with_us = 'For Australian and global enterprise-software, AI/industrial-analytics, EdTech and consumer-tech founders — Vibs combines exceptional global-tech-investing pedigree (Lynda/LinkedIn $1.5B exit, Noodle.ai industrial AI) with Lakshya Capital family-office structuring depth and a wide $25k–$500k cheque range. Especially valuable for founders pursuing global enterprise sales motions.',
  sector_focus = ARRAY['Enterprise Software','SaaS','Consumer','Consumer Tech','AI','Industrial AI','EdTech','FinTech','PropTech'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  check_size_min = 25000,
  check_size_max = 500000,
  linkedin_url = 'https://linkedin.com/in/vaibhavwardhen',
  contact_email = 'Vibs@lakshyacapital.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Lakshya Capital (affiliated)','Lynda.com (acquired by LinkedIn 2015 ~$1.5B)','Noodle.ai (industrial AI)'],
  meta_title = 'Vibs Wardhen — Lakshya Capital | Melbourne Enterprise / AI Angel | $25k–$500k',
  meta_description = 'Melbourne enterprise software / consumer angel. Lakshya Capital. Lynda.com (LinkedIn $1.5B), Noodle.ai. $25k–$500k.',
  details = jsonb_build_object(
    'firms', ARRAY['Lakshya Capital (affiliated)'],
    'investment_thesis','Enterprise software, consumer tech — wide cheque range with global enterprise track record.',
    'check_size_note','$25k–$500k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Lynda.com','context','Acquired by LinkedIn 2015 for ~$1.5B'),
      jsonb_build_object('company','Noodle.ai','context','Industrial AI / supply-chain analytics; WEF partner')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://uk.linkedin.com/in/vaibhavwardhen',
      'lakshya','https://www.lakshyacapital.com.au/'
    ),
    'corrections','CSV thesis truncated ("Enterprise software, cons..."). CSV portfolio truncated ("Lynda.com, Noodle.ai, Vic..."). CSV email truncated ("Vibs@lakshyacapital.com...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Vibs Wardhen';

UPDATE investors SET
  description = 'Sydney-based angel investor with sector-spread thesis: Energy, Education, Aged Care. Limited public investor profile beyond Australian angel directory listing.',
  basic_info = 'Victoria Lee is a Sydney-based angel investor with a stated **multi-sector** thesis spanning **Energy, Education and Aged Care** — three categories representing significant Australian demographic and policy themes (energy transition, lifelong learning, ageing population).

CSV cheque size and CSV portfolio: not specified. Beyond the CSV directory listing, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian energy-tech, ed-tech, aged-care-tech and adjacent founders — Victoria''s sector mix uniquely combines three of Australia''s most demographically and policy-relevant categories. Best treated as a referral- or warm-intro-led conversation given limited public investment history.',
  sector_focus = ARRAY['Energy','Education','EdTech','Aged Care','HealthTech','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  contact_email = 'Viclee288@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Victoria Lee — Sydney Energy / Education / Aged Care Angel',
  meta_description = 'Sydney-based angel investor. Energy, Education, Aged Care focus.',
  details = jsonb_build_object(
    'investment_thesis','Energy, Education, Aged Care — Sydney sector-spread angel.',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'corrections','CSV LinkedIn empty. CSV portfolio empty. CSV cheque size empty.'
  ),
  updated_at = now()
WHERE name = 'Victoria Lee';

UPDATE investors SET
  description = 'Sydney-based founder, podcast host and angel investor. Founder & CEO of Curiosity Centre (insight/intelligence platform — customers include Australian Government, Google, KPMG, Macquarie Capital, Allens, Vanta, University of Melbourne). Host of The High Flyers Podcast (200+ episodes; global top-10). Co-Founder & Investor at FB10x. Sector-agnostic across Seed/Series A. $20k–$50k cheques.',
  basic_info = 'Vidit Agarwal is a Sydney-based **founder, podcast host and angel investor**. He is the **Founder & CEO of Curiosity Centre** — an insight and intelligence platform founded in 2020 — operating across Australia, USA, India and New Zealand.

Curiosity Centre''s customers and partners include some of the most credentialed institutions in Australia and globally:
- **Australian Government**
- **Google**
- **KPMG**
- **Macquarie Capital**
- **Allens**
- **Vanta**
- **University of Melbourne**

Beyond Curiosity Centre, he hosts **The High Flyers Podcast** — one of CC''s flagship products with **200+ episodes** and a **global top-10 ranking** — featuring guests including former PM Malcolm Turnbull, Bunnings CEO Michael Schneider and Google VP Anil Sabharwal.

His investment activity is via **FB10x** — Co-Founder and Investor — with **13+ tech investments since 2022**.

CSV-listed portfolio includes:
- **InsightWise** (likely Curiosity Centre product or related)
- **Heatseeker** (Australian B2B SaaS — sales/marketing intelligence)
- Plus additional truncated names

CSV cheque size **$20k–$50k**. Stated thesis: **Agnostic; Seed, Series A**.',
  why_work_with_us = 'For Australian B2B SaaS, AI, government-tech and enterprise-tech founders — Vidit combines exceptional enterprise-network access (Australian Gov, Google, KPMG, Macquarie via Curiosity Centre customers) with active media-platform amplification (200+-episode globally-top-10-ranked podcast) and FB10x investment vehicle. Especially valuable for founders pursuing enterprise / government sales motions.',
  sector_focus = ARRAY['Generalist','Tech','SaaS','B2B SaaS','AI','Enterprise','Government','InsightTech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 20000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/viditag/',
  contact_email = 'vidit@curiositycentre.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Curiosity Centre (Founder & CEO; founded 2020)','The High Flyers Podcast (Host; 200+ episodes; global top-10)','FB10x (Co-Founder & Investor; 13+ tech investments since 2022)','InsightWise','Heatseeker'],
  meta_title = 'Vidit Agarwal — Curiosity Centre Founder | Sydney Tech Angel | $20k–$50k',
  meta_description = 'Sydney Curiosity Centre founder/CEO. High Flyers Podcast host. FB10x. Sector-agnostic seed/Series A. $20k–$50k.',
  details = jsonb_build_object(
    'firms', ARRAY['Curiosity Centre (Founder & CEO; founded 2020)','FB10x (Co-Founder & Investor; 13+ tech investments since 2022)'],
    'investment_thesis','Agnostic — Seed and Series A; enterprise-network deal flow.',
    'check_size_note','$20k–$50k',
    'media','The High Flyers Podcast — host; 200+ episodes; global top-10 ranking',
    'enterprise_customers', ARRAY['Australian Government','Google','KPMG','Macquarie Capital','Allens','Vanta','University of Melbourne'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/viditag/',
      'website','https://curiositycentre.com/',
      'tracxn','https://tracxn.com/d/people/vidit-agarwal/__2XT1i5OSN2oNBkdLgCbOQJ-LFAsSrW1gCommc9Mzv-g'
    ),
    'corrections','CSV portfolio truncated ("InsightWise, Heatseeker, ..."). Two retained verbatim plus FB10x context.'
  ),
  updated_at = now()
WHERE name = 'Vidit Agarwal';

UPDATE investors SET
  description = 'Sydney-based engineer, technologist and angel investor. CDO/CTO and AI/ML executive at multiple companies. MIT lecturer (postgraduate data science). Founder, technologist and angel mentoring AI startups. Two decades across Asia Pacific and US. CSV portfolio includes Revolut, Venrex Fund, Freerunning. Deep Tech, Consumer Products focus.',
  basic_info = 'Vincent Koc, JP FIML is a Sydney-based **engineer, technologist, executive and angel investor** with **nearly two decades of experience** across top companies in Asia Pacific and the US. He has held senior data/technology roles including **CDO and CTO** positions and is recognised as an **Executive AI and ML Engineer**.

He currently:
- **Lectures postgraduate data science at MIT**
- Mentors cutting-edge AI startups
- Speaks at leading global events (e.g. SXSW Sydney)
- Founder, contributor to multiple AI projects

CSV-listed portfolio includes:
- **Revolut** (UK fintech unicorn — global neo-bank)
- **Venrex Fund** (UK consumer venture-fund LP position)
- **Freerunning** (truncated context)
- Plus additional truncated names

Stated thesis: **Deep Tech, Consumer Products**. CSV cheque size: not specified.',
  why_work_with_us = 'For Australian and global deep-tech, AI, ML, data-science and consumer-product founders — Vincent combines exceptional technical credentials (CDO/CTO; MIT postgraduate lecturer in data science) with active angel mentoring across AI startups and unique global-fintech LP positions (Revolut, Venrex). Especially valuable for technical founders building AI-native products with global ambition.',
  sector_focus = ARRAY['Deep Tech','AI','ML','Data Science','Consumer Products','SaaS','FinTech','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/koconder/',
  contact_email = 'vincentkoc@ieee.org',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['MIT (lecturer; postgraduate data science)','Revolut','Venrex Fund (LP)','Freerunning'],
  meta_title = 'Vincent Koc — MIT Lecturer / CDO-CTO | Sydney Deep Tech / AI Angel',
  meta_description = 'Sydney engineer, MIT lecturer, AI mentor. Two decades APAC/US. Revolut, Venrex Fund. Deep Tech, Consumer.',
  details = jsonb_build_object(
    'prior_career','Two decades across top companies in APAC and US; CDO/CTO; AI/ML Executive Engineer',
    'investment_thesis','Deep Tech, Consumer Products — technical-engineer-led pattern recognition.',
    'community_roles', ARRAY['MIT lecturer (postgraduate data science)','AI startup mentor','Global tech speaker (SXSW Sydney)'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/koconder/',
      'medium','https://medium.com/@vkoc',
      'crunchbase','https://www.crunchbase.com/person/onder-vincent-koc'
    ),
    'corrections','CSV portfolio truncated ("Revolut, Venrex Fund, Fre..."). Three retained verbatim. CSV thesis truncated ("Deep Tech, Consumer Pr...").'
  ),
  updated_at = now()
WHERE name = 'Vincent Koc';

UPDATE investors SET
  description = 'Sydney-based serial fintech founder and angel investor. Founder of Planwise (US fintech). Active angel in Australian fintech: portfolio includes Frollo (PFM SaaS to Australian banks), CarClarity ($1M+ Sydney car-finance) and Valiant Finance (SME finance marketplace). $25,000 cheques. Energy, FinTech, Sustainability focus.',
  basic_info = 'Vincent Turner is a Sydney-based **serial fintech founder and angel investor**. He is the **Founder of Planwise** (US-based fintech).

His CSV-listed angel portfolio includes some of the most active Australian fintech scale-ups:
- **Frollo** (Australian Personal Finance Management — leading PFM technology provider to Australian banks)
- **CarClarity** (Sydney startup — banked $1M+ investment to fuel innovation in car financing)
- **Valiant Finance** (rethinking customer experience for SME finance — marketplace for SME owners to find, secure and manage funding)
- Plus additional truncated names

CSV cheque size **$25,000**. Stated thesis: **Energy, Fintech, Sustainability** (truncated).',
  why_work_with_us = 'For Australian fintech, energy-fintech, SME-finance, sustainability-finance and PFM founders — Vincent brings rare combination of serial-fintech-founder credentials (Planwise) with active Australian-fintech angel portfolio (Frollo, CarClarity, Valiant). Especially valuable for fintech founders pursuing structured product strategy and bank-partnership pathways.',
  sector_focus = ARRAY['FinTech','Energy','Sustainability','PFM','SME Finance','SaaS','Banking Tech','Auto Finance'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/vhturner/',
  contact_email = 'vinaevinae@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Planwise (Founder; US fintech)','Frollo','CarClarity','Valiant Finance'],
  meta_title = 'Vincent Turner — Planwise Founder | Sydney FinTech / Energy Angel | $25k',
  meta_description = 'Sydney Planwise founder. FinTech, Energy, Sustainability angel. Frollo, CarClarity, Valiant. $25,000.',
  details = jsonb_build_object(
    'firms', ARRAY['Planwise (Founder; US fintech)'],
    'investment_thesis','Energy, FinTech, Sustainability — serial-fintech-founder-led portfolio.',
    'check_size_note','$25,000',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/vhturner/',
      'website','https://www.vincent-turner.com/investments/',
      'about_me','https://about.me/vincentturner'
    ),
    'corrections','CSV portfolio truncated ("Frollo, CarClarity, Valiant..."). Three retained verbatim. CSV thesis truncated ("Energy, Fintech, Sustaina...").'
  ),
  updated_at = now()
WHERE name = 'Vincent Turner';

COMMIT;
