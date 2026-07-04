-- Enrich angel investors — batch 03t (records 249-253: Tribe Global Ventures → Tyler Martin)

BEGIN;

UPDATE investors SET
  description = 'Brisbane-based B2B-focused VC firm founded 2021. Invests in world-class Australian & New Zealand B2B tech-enabled companies expanding to UK and USA. Pre-Series A to Series A focus. Global Growth Accelerator programme for Queensland B2B founders with 7-day UK/US immersions. $200k–$1.5M cheques.',
  basic_info = 'Tribe Global Ventures is a Brisbane-based **venture capital firm founded in 2021** focused on world-class Australian & New Zealand **B2B tech-enabled companies** that are solving real business problems — primarily at **Pre-Series A to Series A stage** with strong traction and happy customers.

The firm positions itself as a **B2B VC that helps ANZ tech companies scale to the UK and USA**. Their distinctive offering is the **Global Growth Accelerator** programme — designed for **Queensland-founded B2B tech ventures at Seed to Series A stages** — combining structured workshops with **7-day intensive immersions in the UK or US markets**.

CSV cheque size: **$200k – $1.5M** — Series-stage investing capacity. Stated thesis: **B2B ventures expanding to global markets** (truncated).

Don McKenzie is a key figure on the Tribe Global Ventures team.',
  why_work_with_us = 'For Australian and especially Queensland/Brisbane-based B2B SaaS, B2B tech and B2B-enabled-services founders pursuing UK or US market expansion — Tribe Global Ventures is one of the most globally-oriented VCs in regional Australia. Their Global Growth Accelerator with on-the-ground UK/US immersions is genuinely unique among ANZ funds.',
  sector_focus = ARRAY['B2B','B2B SaaS','SaaS','Tech-Enabled Services','Cross-border','Global Expansion','Enterprise Software'],
  stage_focus = ARRAY['Pre-Series A','Series A'],
  check_size_min = 200000,
  check_size_max = 1500000,
  website = 'https://tribeglobal.vc/',
  linkedin_url = 'https://au.linkedin.com/company/tribe-global-ventures',
  contact_email = 'hello@tribeglobal.vc',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Tribe Global Ventures (founded 2021)','Global Growth Accelerator (Queensland B2B founders; UK/US immersions)'],
  meta_title = 'Tribe Global Ventures — Brisbane B2B Cross-Border VC | $200k–$1.5M',
  meta_description = 'Brisbane B2B VC since 2021. ANZ→UK/US scaling. Global Growth Accelerator. $200k–$1.5M cheques.',
  details = jsonb_build_object(
    'organisation_type','Venture capital firm',
    'founded',2021,
    'investment_thesis','B2B tech-enabled ANZ companies scaling to UK and USA.',
    'check_size_note','$200k – $1.5M',
    'team', jsonb_build_array(
      jsonb_build_object('name','Don McKenzie','role','Team member')
    ),
    'programme','Global Growth Accelerator — 7-day UK/US immersions for Queensland B2B founders',
    'sources', jsonb_build_object(
      'website','https://tribeglobal.vc/',
      'linkedin','https://au.linkedin.com/company/tribe-global-ventures',
      'pitchbook','https://pitchbook.com/profiles/investor/518003-29',
      'crunchbase','https://www.crunchbase.com/organization/tribe-global-ventures'
    ),
    'corrections','CSV thesis truncated ("B2B ventures expanding t..."). Resolved.'
  ),
  updated_at = now()
WHERE name = 'Tribe Global Ventures';

UPDATE investors SET
  description = 'Brisbane-based mining-and-energy industry consultant and angel investor. Principal Consultant at Siecap (industrial advisory). Former Principal Consultant and Director at Tragal Advisory. Mining, technology and energy sector focus. Portfolio includes Cafe X, Neybourly, Adyto. $50k cheques.',
  basic_info = 'Troy Harper is a Brisbane-based industrial consultant and angel investor. He is **Principal Consultant at Siecap** — an Australian industrial / mining advisory firm — and was previously **Principal Consultant and Director at Tragal Advisory** (CSV email "troy@tragal.co" reflects Tragal context).

His CSV-listed sector mandate spans **Mining, Technology and Energy** — leveraging his industrial-advisory background.

CSV-listed portfolio includes:
- **Cafe X** (robotic coffee — US/global)
- **Neybourly** (Australian community/social platform)
- **Adyto** (truncated context)
- Plus additional truncated names

CSV cheque size: **$50k**.',
  why_work_with_us = 'For Australian mining-tech, industrial-tech, energy-tech and consumer-robotics founders — and especially Brisbane/Queensland-based founders — Troy combines deep industrial-advisory operator credentials (Siecap, Tragal Advisory) with a $50k personal cheque. Especially relevant for founders pursuing structured industrial / mining / energy commercialisation paths.',
  sector_focus = ARRAY['Mining','Technology','Energy','Industrial','Mining Tech','Robotics','Consumer','EnergyTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 50000,
  contact_email = 'troy@tragal.co',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Siecap (Principal Consultant)','Tragal Advisory (former Principal Consultant & Director)','Cafe X','Neybourly','Adyto'],
  meta_title = 'Troy Harper — Siecap / Tragal | Brisbane Mining/Energy/Tech Angel',
  meta_description = 'Brisbane Siecap Principal Consultant. Mining, Technology, Energy. Cafe X, Neybourly. $50k.',
  details = jsonb_build_object(
    'firms', ARRAY['Siecap (Principal Consultant)','Tragal Advisory (former Principal Consultant & Director)'],
    'investment_thesis','Mining, Technology, Energy — Brisbane industrial-advisory-network angel.',
    'check_size_note','$50k',
    'sources', jsonb_build_object(
      'siecap','https://www.zoominfo.com/p/Troy-Harper/1516514444'
    ),
    'corrections','CSV portfolio truncated ("Cafe X, Neybourly, Adyto..."). Three retained verbatim. CSV LinkedIn empty.'
  ),
  updated_at = now()
WHERE name = 'Troy Harper';

UPDATE investors SET
  description = 'Melbourne-based angel investor. Sector-agnostic with a "wants good ideas" thesis. $5,000–$15,000 small cheques. Limited public investor profile beyond Australian angel directory listing.',
  basic_info = 'Troy Mclean is a Melbourne-based angel investor with a stated **sector-agnostic, "wants good ideas"** thesis. CSV cheque size **$5,000–$15,000** — characteristic of a small-cheque early-career angel.

Beyond the CSV directory entry and his LinkedIn profile, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian early-stage founders looking for a small-cheque generalist Melbourne angel — Troy is best treated as a referral- or warm-intro-led conversation given limited public investor signal. His "wants good ideas" thesis and small cheque size suggests low-ceremony angel positions for promising early teams.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 15000,
  linkedin_url = 'https://www.linkedin.com/in/troy-mclean-8265043',
  contact_email = 'troymcleanns@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Troy Mclean — Melbourne Sector-Agnostic Angel | $5–$15k',
  meta_description = 'Melbourne sector-agnostic small-cheque angel. "Wants good ideas". $5,000–$15,000 cheques.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic — wants good ideas; small-cheque generalist.',
    'check_size_note','$5,000–$15,000',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'corrections','CSV LinkedIn URL appeared truncated.'
  ),
  updated_at = now()
WHERE name = 'Troy Mclean';

UPDATE investors SET
  description = 'Sydney-based angel investor with cross-border industrial / climate-tech focus. Stated thesis: Food + Agri, Energy, Industrial. CSV email "tuananh.tran@oxon.org" suggests Oxford alumni / Oxon network affiliation. Limited public portfolio detail beyond directory listing.',
  basic_info = 'Tuan-Anh Tran is a Sydney-based angel investor with a stated thesis spanning **Food + Agri, Energy and Industrial** sectors. CSV email "tuananh.tran@oxon.org" suggests **Oxford University alumni network** affiliation (Oxon = Oxonian / Oxford alumni).

The food-agri + energy + industrial sector mix suggests an industrial-decarbonization / agritech climate-aligned thesis. Beyond the CSV directory listing and Oxford-alumni context, individual investor portfolio details could not be uniquely corroborated from public-source search.

CSV cheque size and CSV portfolio: not specified.',
  why_work_with_us = 'For Australian agri-tech, food-tech, energy-tech, industrial-decarbonization and circular-economy founders looking for a Sydney-based cross-border-Oxford-alumni-network angel — best treated as a referral-led conversation given limited public investment history.',
  sector_focus = ARRAY['Food','AgriTech','Agri','Energy','Industrial','Climate Tech','Decarbonization','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/tuananhoxon/',
  contact_email = 'tuananh.tran@oxon.org',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Tuan-Anh Tran — Sydney Food/Agri/Energy/Industrial Angel',
  meta_description = 'Sydney Food + Agri, Energy, Industrial angel. Oxford alumni network.',
  details = jsonb_build_object(
    'investment_thesis','Food + Agri, Energy, Industrial — climate-aligned cross-border angel.',
    'community','Oxford University alumni (Oxon) — LinkedIn handle "tuananhoxon"',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor portfolio could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/tuananhoxon/'
    ),
    'corrections','CSV thesis truncated ("Food + Agri, Energy, Indu..."). Three retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Tuan-Anh Tran';

UPDATE investors SET
  description = 'Sydney-based angel investor. MartinVest investment vehicle. Sector-agnostic. Portfolio includes Newie (Newcastle-based fintech), HNRY (NZ/AU sole-trader fintech) and Pet... (truncated — likely Pet Circle or similar consumer tech). $25,000 cheques.',
  basic_info = 'Tyler Martin is a Sydney-based angel investor operating through a **MartinVest** branded investment vehicle (CSV email "tyler@martinvest.co"). Stated thesis: **Agnostic**.

CSV-listed portfolio includes:
- **Newie** (Newcastle/Australian fintech)
- **HNRY** (New Zealand/Australian sole-trader fintech — Airtree-backed Series B 2022)
- **Pet...** (truncated context — likely Pet Circle or pet-care tech)
- Plus additional truncated names

CSV cheque size **$25,000**. Beyond the CSV directory entry and MartinVest investment-vehicle name, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian and New Zealand fintech, sole-trader-tech, consumer-tech and pet-tech founders — Tyler''s HNRY backing signals genuine ANZ trans-Tasman fintech pattern recognition. His $25k cheque size with MartinVest investment-vehicle suggests structured private-investment activity.',
  sector_focus = ARRAY['Generalist','FinTech','Consumer','Pet Tech','SaaS','B2B','Sole-Trader Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/tyler-martin-3b09ba46/',
  contact_email = 'tyler@martinvest.co',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['MartinVest (investment vehicle)','Newie','HNRY (Airtree-backed Series B 2022)'],
  meta_title = 'Tyler Martin — MartinVest | Sydney Sector-Agnostic Angel | $25k',
  meta_description = 'Sydney MartinVest angel. Sector-agnostic. Newie, HNRY in portfolio. $25,000 cheques.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic — MartinVest investment vehicle.',
    'check_size_note','$25,000',
    'investment_vehicle','MartinVest',
    'unverified', ARRAY[
      'Beyond MartinVest naming and HNRY/Newie portfolio entries, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/tyler-martin-3b09ba46/'
    ),
    'corrections','CSV portfolio truncated ("Angel: Newie, HNRY, Pet..."). Two retained verbatim plus HNRY context.'
  ),
  updated_at = now()
WHERE name = 'Tyler Martin';

COMMIT;
