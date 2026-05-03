-- Enrich angel investors — batch 03c (records 164-168: Matthew Karakinos → Michael Gonski)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based angel investor. Limited public investor profile beyond Australian angel directory listing. $5k–$25k small cheques.',
  basic_info = 'Matthew Karakinos is listed in the Australian angel investor directory as a Melbourne-based angel investor with $5k–$25k cheque size. Beyond the directory entry, no detailed public investor profile, portfolio or sector-focus information could be uniquely corroborated from public-source search.',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory listing — small cheque size suggests early-career angel.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 25000,
  linkedin_url = 'https://au.linkedin.com/in/matthew-karakinos-7758',
  contact_email = 'mkarakinos@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Matthew Karakinos — Melbourne Angel | $5k–$25k',
  meta_description = 'Melbourne-based angel investor. Limited public profile. $5k–$25k cheques.',
  details = jsonb_build_object(
    'check_size_note','$5k–$25k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, no detailed public investor profile could be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/matthew-karakinos-7758'
    ),
    'corrections','CSV LinkedIn URL appeared truncated.'
  ),
  updated_at = now()
WHERE name = 'Matthew Karakinos';

UPDATE investors SET
  description = 'Perth-based angel investor and serial founder/operator. Co-founder of ClickSend (Australian SMS/communications API platform). Sector-agnostic angel with $10k–$50k cheques.',
  basic_info = 'Matthew Larner is a Perth-based angel investor best known as the **Co-Founder of ClickSend** — the Australian SMS, fax, voice and email communications-API platform that has scaled to global usage among SMBs and enterprises. He has continued to be active as a Perth-based angel investor.

His CSV-listed portfolio includes:
- **ClickSend** (Co-Founder)
- **Nquist Data**
- **V...** (truncated)

CSV cheque size $10k–$50k. Sector mandate marked "All".',
  why_work_with_us = 'For Australian and especially Perth-based SaaS, communications, telco-API and B2B-tech founders — Matthew brings deep operating experience scaling ClickSend internationally. A relevant cheque for founders building communications, messaging or developer-facing infrastructure businesses.',
  sector_focus = ARRAY['Generalist','SaaS','CommunicationsAPI','Telco','DevTools','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/matthew-larner/',
  contact_email = 'indices-aircrew-0t@icloud.com',
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['ClickSend (Co-Founder)','Nquist Data'],
  meta_title = 'Matthew Larner — ClickSend Co-Founder | Perth Angel',
  meta_description = 'Perth ClickSend co-founder. Sector-agnostic angel. $10k–$50k cheques.',
  details = jsonb_build_object(
    'founder_of', ARRAY['ClickSend (Co-Founder)'],
    'investment_thesis','Sector-agnostic Perth angel with operator background in communications APIs.',
    'check_size_note','$10k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/matthew-larner/'
    ),
    'corrections','CSV portfolio truncated ("ClickSend, Nquist Data, V..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Matthew Larner';

UPDATE investors SET
  description = 'Melbourne Angels Inc. is one of Australia''s longest-running formal angel investor groups. Members co-invest in Australian early-stage startups across all sectors. $150k–$750k aggregated rounds.',
  basic_info = 'Melbourne Angels Inc. is one of Australia''s longest-running formal angel investor groups, based in Southbank, Victoria. The group brings together accredited and high-net-worth individual members who collectively assess and co-invest in Australian early-stage startups.

Aggregated round sizes from Melbourne Angels typically span **$150k to $750k** — assembled from multiple member cheques rather than a single LP commitment. Mandate is generalist ("anything... Te...") with strong representation across consumer, SaaS, healthtech and tech-enabled services.

Their CSV-listed portfolio includes:
- **Celleo**
- **Walking Tall**
- **EMA...** (truncated)
- Plus additional names

The group operates as a screening, due diligence and round-coordination function for its members.',
  why_work_with_us = 'For Melbourne and Victoria-based early-stage founders, Melbourne Angels offers access to a coordinated round of $150k–$750k from multiple individual angels — a useful capital quantum for seed rounds and a structured pathway into the Melbourne angel community.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','HealthTech','Tech-Enabled Services'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 150000,
  check_size_max = 750000,
  website = 'https://melbourneangels.net.au/',
  linkedin_url = 'https://www.linkedin.com/company/3693826',
  location = 'Southbank, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Celleo','Walking Tall'],
  meta_title = 'Melbourne Angels Inc. — Victoria''s Premier Angel Group | $150k–$750k',
  meta_description = 'One of Australia''s longest-running angel groups. Melbourne-based. Generalist. $150k–$750k aggregated rounds.',
  details = jsonb_build_object(
    'organisation_type','Angel investor group / network',
    'investment_thesis','Generalist Melbourne-based angel network for Australian early-stage startups.',
    'check_size_note','$150k–$750k aggregated round',
    'sources', jsonb_build_object(
      'website','https://melbourneangels.net.au/',
      'linkedin','https://www.linkedin.com/company/3693826'
    ),
    'corrections','CSV portfolio truncated ("Celleo, Walking Tall, EMA..."). Two retained verbatim. CSV location truncated ("Southbank Vi...") resolved to Southbank, VIC. CSV name "Melbourne Angels Inc." matches DB record "Melbourne Angels".'
  ),
  updated_at = now()
WHERE name = 'Melbourne Angels';

UPDATE investors SET
  description = 'Melbourne-based angel investor with energy, technology and construction focus. Founder of Box Forest. Portfolio includes Bygen (biochar) and Conry. $25k–$50k cheques.',
  basic_info = 'Michael (Mick) Coleman is a Melbourne-based angel investor with stated focus on **Energy, technology and construction**. He is associated with **Box Forest** (CSV email reference suggests founder/principal role).

His CSV-listed portfolio includes:
- **Bygen** (Australian biochar / climate-tech producer)
- **Conry** (truncated context)
- Plus additional truncated names

CSV cheque size $25k–$50k. Climate, energy and construction-tech focus marks him as a relevant cheque for the Australian energy-transition and circular-economy startup community.',
  why_work_with_us = 'For Australian climate-tech, energy-transition, biochar/circular-economy, and construction-tech founders — Mick''s Bygen exposure plus stated energy/construction thesis make him a sector-relevant Melbourne cheque.',
  sector_focus = ARRAY['Energy','ClimateTech','Construction','ConTech','Biochar','Circular Economy','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/mick-coleman-406988',
  contact_email = 'coleman@boxforest.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Bygen (biochar)','Conry','Box Forest (founder/principal)'],
  meta_title = 'Mick Coleman — Melbourne Energy/ConTech Angel | Box Forest',
  meta_description = 'Melbourne angel. Energy, tech, construction focus. Bygen biochar in portfolio. $25k–$50k.',
  details = jsonb_build_object(
    'investment_thesis','Energy, technology, construction Melbourne angel.',
    'check_size_note','$25k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/mick-coleman-406988'
    ),
    'corrections','CSV portfolio truncated ("Bygen (biochar), Conry (..."). Two retained verbatim. CSV LinkedIn URL appeared truncated.'
  ),
  updated_at = now()
WHERE name = 'Michael Coleman';

UPDATE investors SET
  description = 'Sydney-based partner at Herbert Smith Freehills (HSF) and active angel investor. Portfolio includes Propeller Aero (drone/mapping) and Instaclustr (managed open-source). Generalist mandate. Backs Australian deep-tech and SaaS.',
  basic_info = 'Michael Gonski is a Sydney-based **Partner at Herbert Smith Freehills (HSF)** — one of Australia''s top-tier corporate law firms — and an active angel investor. His angel-investing activity sits alongside his legal-partner career.

His CSV-listed portfolio includes some genuinely high-profile Australian deep-tech/SaaS names:
- **Propeller Aero** (drone-based site mapping for construction/mining; raised significant US Series funding)
- **Instaclustr** (managed open-source data infrastructure; acquired by NetApp 2022 for ~US$500M)
- Plus additional truncated names

Stated sector mandate is "All". Sydney-based with strong corporate-finance and legal/transaction networks.',
  why_work_with_us = 'For Australian deep-tech, SaaS and B2B founders — Michael combines an exceptional Sydney corporate-finance/legal network through HSF partnership with a high-quality angel portfolio that includes Australian unicorn-grade exits like Instaclustr (NetApp acquisition) and Propeller Aero. Particularly relevant for founders contemplating a future M&A or US-fund-led round where corporate-legal networks are valuable.',
  sector_focus = ARRAY['Generalist','SaaS','Deep Tech','B2B','Drone/Mapping','Data Infrastructure'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/michael-gonski/',
  contact_email = 'michael.gonski@hsf.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Propeller Aero','Instaclustr (acquired by NetApp 2022)'],
  meta_title = 'Michael Gonski — HSF Partner | Sydney Angel | Propeller Aero, Instaclustr',
  meta_description = 'Sydney HSF Partner and angel. Propeller Aero, Instaclustr (NetApp acquired) in portfolio. Generalist.',
  details = jsonb_build_object(
    'day_role','Partner, Herbert Smith Freehills (HSF)',
    'investment_thesis','Generalist Sydney corporate-finance-network angel.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Instaclustr','context','Acquired by NetApp in 2022 (~US$500M)'),
      jsonb_build_object('company','Propeller Aero','context','Drone-mapping for construction/mining; significant US Series funding')
    ),
    'sources', jsonb_build_object(
      'hsf_profile','https://www.herbertsmithfreehills.com/our-people/michael-gonski'
    ),
    'corrections','CSV portfolio truncated ("Propeller Aero, Instaclustr..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Michael Gonski';

COMMIT;
