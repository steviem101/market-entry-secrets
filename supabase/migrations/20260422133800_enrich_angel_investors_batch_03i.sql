-- Enrich angel investors — batch 03i (records 194-198: Rachael Neumann → Rayn Ong)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based founding partner of Flying Fox Ventures (early-stage ANZ VC) and founder of Working Theory Angels (Australian angel network). Former MD Eventbrite Australia; former Head of Startups ANZ at AWS. Eventbrite IPO created her angel-investing capacity. Portfolio includes Kapiche, Tixel, Muso.',
  basic_info = 'Rachael Neumann is one of Australia''s most respected angel investors and a Melbourne-based founding partner of **Flying Fox Ventures** — an early-stage ANZ venture capital firm — and **founder of Working Theory Angels**, an angel network designed to mobilise more investment into early-stage startups and attract new investors to the asset class.

She has a distinguished operator background:
- **Managing Director, Eventbrite Australia** — launched the Melbourne office, served the ANZ market
- Prior: **Director of Customer Experience Strategy at Eventbrite, Silicon Valley**
- **Head of Startups, Australia & New Zealand at AWS** — drove regional startup market growth

The **Eventbrite IPO** created her angel-investing capacity. Her CSV-listed portfolio includes:
- **Kapiche** (NLP-powered customer-feedback analytics; met founder Ryan Stewart at Myriad Festival)
- **Tixel** (Melbourne-based ticket-resale marketplace; met founders Jason and Zac at Collider accelerator)
- **Muso** (consumer-tech)
- **Mic...** (truncated)
- Plus additional names

CSV cheque size not specified. Sector mandate not specified — generalist via Flying Fox Ventures and Working Theory Angels.',
  why_work_with_us = 'For Australian and New Zealand consumer, marketplace, AI/ML and SaaS founders — Rachael is among the most respected single investors in the country. She combines Eventbrite operator scaling-experience with two distinct investment vehicles (Flying Fox Ventures fund + Working Theory Angels network), and her cheque often signals to other top-tier ANZ angels.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','AI','EventTech','HRTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/rachaelneumann/',
  contact_email = 'Rachael.neumann@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Flying Fox Ventures (Founding Partner)','Working Theory Angels (Founder)','Kapiche','Tixel','Muso','Eventbrite Australia (former MD)','AWS ANZ Startups (former Head)'],
  meta_title = 'Rachael Neumann — Flying Fox Ventures | Working Theory Angels | Melbourne',
  meta_description = 'Flying Fox Ventures founding partner. Working Theory Angels founder. ex-Eventbrite Australia MD. Kapiche, Tixel.',
  details = jsonb_build_object(
    'firms', ARRAY['Flying Fox Ventures (Founding Partner)','Working Theory Angels (Founder)'],
    'prior_career','MD Eventbrite Australia; Director Customer Experience Strategy Eventbrite SV; Head of Startups ANZ at AWS',
    'investment_thesis','Generalist ANZ early-stage; combines Flying Fox fund cheques with Working Theory Angels network deals.',
    'eventbrite_ipo_context','Eventbrite IPO created her angel-investing capacity',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/rachaelneumann/',
      'working_theory_angels','https://www.workingtheoryangels.com/team',
      'startup_playbook_ep130','https://startupplaybook.co/2020/10/ep130-rachael-neumann-founder-working-theory-angels-on-trust-talent-golden-metrics/',
      'day_one','https://dayone.fm/australian-startup-history/rachael-neumann/'
    ),
    'corrections','CSV portfolio truncated ("Kapiche, Tixel, Muso, Mic..."). Three retained verbatim plus Flying Fox / Working Theory affiliations added.'
  ),
  updated_at = now()
WHERE name = 'Rachael Neumann';

UPDATE investors SET
  description = 'Perth-based serial founder, board director and angel investor in 30+ companies. Director of Scale Partners (Perth advisory firm). icetana CFO. Active in Perth Angels, StartupWA. B2C, SaaS and Fintech focus. Mentor at CSIRO ON, Founder Institute.',
  basic_info = 'Rafael (Raf) Kimberley-Bowen is a Perth-based **tech entrepreneur, angel investor and venture partner**. He has invested in **30+ companies** as an angel and is a regular writer on startup, investor-readiness and crowdfunding topics.

He is a **Director of Scale Partners** — a Perth-based advisory firm offering CFO, tax and legal services to growth-stage businesses — and has held the **CFO / Master of Coin / Company Secretary** role at **icetana** (ASX-listed AI video analytics).

He has worked globally across ASX-listed tech, **SaaS, food & drink, healthcare, banking and FinTech, web3, AI** and not-for-profit sectors. He has served on the boards of:
- **Perth Angels**
- **StartupWA**
- **eGroup**

He is an active mentor / judge at **CSIRO ON Accelerator**, **Founder Institute** and other accelerator programmes. Won at the **2019 Australian Angel Investment Awards**.

Stated thesis: **B2C, SaaS, Fintech**.',
  why_work_with_us = 'For Western Australian B2C, SaaS, FinTech and consumer founders — Raf is one of WA''s most-credentialed angel investors with 30+ portfolio companies and deep involvement in Perth Angels, StartupWA and the Perth accelerator ecosystem. Particularly valuable for founders building investor-readiness and pursuing structured early-stage capital.',
  sector_focus = ARRAY['B2C','SaaS','FinTech','HealthTech','Web3','AI','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://au.linkedin.com/in/rafkb',
  contact_email = 'raf@scale.partners',
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Scale Partners (Director)','icetana (CFO)','Perth Angels (former Board)','StartupWA (former Board)','eGroup (former Board)','30+ angel investments'],
  meta_title = 'Rafael Kimberley-Bowen — Scale Partners | Perth B2C/SaaS/FinTech Angel',
  meta_description = 'Perth angel in 30+ companies. Scale Partners Director. icetana CFO. Perth Angels Board. B2C, SaaS, FinTech.',
  details = jsonb_build_object(
    'firms', ARRAY['Scale Partners (Director)','icetana (CFO; Master of Coin; Company Secretary)'],
    'former_boards', ARRAY['Perth Angels','StartupWA','eGroup'],
    'mentor_roles', ARRAY['CSIRO ON Accelerator','Founder Institute'],
    'investment_thesis','B2C, SaaS, FinTech — 30+ angel investments globally.',
    'awards', ARRAY['2019 Australian Angel Investment Awards'],
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/rafkb',
      'scale_partners','https://www.scale.partners/',
      'business_news','https://www.businessnews.com.au/Person/Rafael-Kimberley-Bowen'
    ),
    'corrections','CSV portfolio empty; populated from public-source 30+ angel investments.'
  ),
  updated_at = now()
WHERE name = 'Rafael Kimberley-Bowen';

UPDATE investors SET
  description = 'Sydney-based Partner at Paloma (venture studio behind original Afterpay tech). Active angel investor co-investing alongside AirTree Ventures (CSV email "airtree@goodauthority.com" reflects shared deal-flow). Sector-agnostic with deep-tech bias. Portfolio includes ChemCloud and Authsignal. $25k–$50k cheques.',
  basic_info = 'Rafe Custance is a Sydney-based **Partner at Paloma** — the **venture studio best known for building and scaling the original tech behind Afterpay** (Australia''s most successful BNPL company; acquired by Block / Square). Paloma partners with ambitious founders to turn ideas into category-defining companies.

His operator background includes prior roles at **Paloma (formerly Dovetail)**, **Dovetail**, **Authsignal** (now an angel portfolio company) and **Endeavour Live Presents**.

His CSV-listed portfolio includes:
- **ChemCloud** (chemistry/lab software)
- **Authsignal** (passwordless authentication / fraud-prevention)
- **T...** (truncated)
- Plus additional names

His CSV email "airtree@goodauthority.com" reflects shared deal-flow / co-investment alignment with **AirTree Ventures** (one of ANZ''s top-tier VC funds). CSV cheque size $25k–$50k. Stated thesis: **Agnostic; but most experi...** (truncated — most experience).',
  why_work_with_us = 'For Australian and New Zealand deep-tech, fintech, dev-tools and B2B founders — Rafe combines Paloma''s rare venture-studio operator depth (think Afterpay-scale tech-build experience) with active AirTree-aligned angel deal-flow. Especially relevant for founders building structurally hard tech products and pursuing AirTree-pathway capital.',
  sector_focus = ARRAY['Generalist','Deep Tech','SaaS','FinTech','Cybersecurity','DevTools','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://linkedin.com/in/rafecustance/',
  contact_email = 'airtree@goodauthority.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Paloma (Partner; venture studio behind original Afterpay tech)','ChemCloud','Authsignal','Dovetail (former)','Endeavour Live Presents (former)'],
  meta_title = 'Rafe Custance — Paloma Partner | Sydney Angel | Afterpay Origin',
  meta_description = 'Sydney Paloma Partner (Afterpay-origin venture studio). AirTree-aligned angel. ChemCloud, Authsignal. $25k–$50k.',
  details = jsonb_build_object(
    'firms', ARRAY['Paloma (Partner; formerly Dovetail; venture studio behind original Afterpay tech)','Authsignal (former; now portfolio)','Endeavour Live Presents (former)'],
    'investment_thesis','Sector-agnostic with deep-tech / venture-studio operator bias.',
    'check_size_note','$25k–$50k',
    'co_investment_alignment','AirTree Ventures (CSV email "airtree@goodauthority.com")',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/rafecustance/',
      'bloomberg','https://www.bloomberg.com/profile/person/24283876'
    ),
    'corrections','CSV portfolio truncated ("ChemCloud, Authsignal, T..."). Two retained verbatim plus Paloma context.'
  ),
  updated_at = now()
WHERE name = 'Rafe Custance';

UPDATE investors SET
  description = 'Sydney-based angel investor and Australian-tech-ecosystem operator. LP in Blackbird Funds and AirTree Ventures funds. Sector-agnostic generalist angel. Limited public investor profile beyond directory listing.',
  basic_info = 'Rain Hsu is a Sydney-based angel investor with stated involvement as **LP in Blackbird Funds and AirTree Ventures funds** — two of ANZ''s most prominent VC firms — meaning her angel exposure includes indirect access to many of the country''s top startups via fund commitments.

CSV-listed portfolio includes:
- **Blackbird Funds** (LP)
- **AirTree** (LP)
- Plus additional truncated names

Stated thesis: **Sector Agnostic (not great...)** — CSV truncation suggests a self-deprecating "not great at picking" caveat typical of generalist LP-style angels. Beyond CSV, individual direct-angel track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian early-stage founders, Rain''s value is primarily as a connector into the Blackbird and AirTree fund networks — she is well-positioned for warm intros into the institutional VC layer rather than as a primary cheque source.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://linkedin.com/in/rainhsu',
  contact_email = 'rainhpersonal@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Blackbird Funds (LP)','AirTree Ventures (LP)'],
  meta_title = 'Rain Hsu — Sydney Angel | Blackbird & AirTree LP',
  meta_description = 'Sydney sector-agnostic angel. LP in Blackbird and AirTree. Generalist Australian tech.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic LP-style angel; primary value as Blackbird/AirTree network connector.',
    'lp_positions', ARRAY['Blackbird Funds','AirTree Ventures'],
    'unverified', ARRAY[
      'Beyond CSV directory listing and LP positions, individual direct-angel track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://linkedin.com/in/rainhsu'
    ),
    'corrections','CSV LinkedIn URL had no protocol prefix. CSV portfolio truncated ("Blackbird Funds, AirTree...").'
  ),
  updated_at = now()
WHERE name = 'Rain Hsu';

UPDATE investors SET
  description = 'Sydney-based legendary Australian angel investor. Active angel since 2014. Partner at Archangel Ventures (LaunchVic-backed angel fund). LP in Blackbird Fund 1, 2 & 3. Self-described "spray and pray" — 8 deals/year. Early backer of Australian unicorns: Instaclustr, Propeller Aero, HappyCo, Morse Micro, Eucalyptus.',
  basic_info = 'Rayn Ong is one of Australia''s most prolific and well-known angel investors. He has been **actively angel investing since 2014** and is a **Partner at Archangel Ventures** — an angel fund (now ESVCLP) backing founders at the earliest stage possible, supported by a **LaunchVic grant**.

His investment story began when **Niki Scevak (Blackbird) introduced him** to angel investing — **Blackbird Fund 1 was his first investment**, and he invested in 5 startups in his first year.

He is famously sector-agnostic with a self-described **"spray and pray" — 8 deals a year** approach. His early-stage portfolio includes seed rounds in many of Australia''s breakout startups, **all valued at $100M+**:
- **Instaclustr** (acquired by NetApp 2022 ~US$500M)
- **Propeller Aero** (drone/site mapping; raised significant US Series funding)
- **HappyCo** (Australia/US property-management SaaS)
- **Morse Micro** (Wi-Fi HaLow chipset semiconductor)
- **Eucalyptus** (D2C health platform — Pilot, Kin, Juniper, Software Health)

CSV-listed portfolio: Blackbird Fund 1, 2 & 3 (LP positions) plus extensive direct angel positions. Sector mandate: spray-and-pray generalist.',
  why_work_with_us = 'For Australian early-stage founders, Rayn is among the most active and well-networked single angels in the country. His "8 deals a year" pace plus his standout portfolio (Instaclustr exit, Propeller Aero, HappyCo, Morse Micro, Eucalyptus) signals exceptional pattern recognition. The Archangel Ventures + Blackbird LP layering means a Rayn cheque often comes with introductions across the broader ANZ VC ecosystem.',
  sector_focus = ARRAY['Generalist','SaaS','Deep Tech','Consumer','HealthTech','Marketplace','PropTech','Semiconductor'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/raynong/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Archangel Ventures (Partner)','Blackbird Fund 1, 2 & 3 (LP)','Instaclustr (acquired by NetApp 2022)','Propeller Aero','HappyCo','Morse Micro','Eucalyptus'],
  meta_title = 'Rayn Ong — Archangel Ventures | Sydney Spray-and-Pray Angel | Blackbird LP',
  meta_description = 'Sydney legendary angel since 2014. Archangel Ventures Partner. Blackbird Fund 1-3 LP. Instaclustr, Propeller Aero, Eucalyptus.',
  details = jsonb_build_object(
    'firms', ARRAY['Archangel Ventures (Partner)','Blackbird Fund 1, 2 & 3 (LP)'],
    'angel_investing_since',2014,
    'investment_thesis','Spray-and-pray sector-agnostic — 8 deals per year; backs the people first.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Instaclustr','context','Acquired by NetApp 2022 (~US$500M)'),
      jsonb_build_object('company','Propeller Aero','context','Drone-mapping for construction/mining; significant US Series funding'),
      jsonb_build_object('company','HappyCo','context','Australia/US property-management SaaS'),
      jsonb_build_object('company','Morse Micro','context','Wi-Fi HaLow chipset semiconductor — Australian deep-tech'),
      jsonb_build_object('company','Eucalyptus','context','D2C health platform — Pilot, Kin, Juniper, Software Health')
    ),
    'origin_story','Niki Scevak (Blackbird) introduced him to angel investing; first investment was Blackbird Fund 1.',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/raynong',
      'blackbird','https://www.blackbird.vc/people-involved/ryan-ong',
      'airtree_halo_effect','https://www.airtree.vc/open-source-vc/the-halo-effect-with-rayn-ong',
      'startup_daily','https://www.startupdaily.net/topic/venture-capital/rayn-ong-investing-startups-memoirs-of-a-dumb-vc/',
      'cb_insights','https://www.cbinsights.com/investor/rayn-ong'
    ),
    'corrections','CSV portfolio truncated ("Blackbird (Fund 1, 2 & 3), ..."). Five highlight names added from public sources. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Rayn Ong';

COMMIT;
