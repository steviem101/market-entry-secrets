-- Enrich VCs — batch 02b (records 26-30: Brandon Capital Partners → Cardinia Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Brandon Capital Partners is **Australasia''s leading life-science venture capital firm**, headquartered in Melbourne with a strong global presence supported by team members and partnerships across the **United States and United Kingdom**.

Founded **2007**, Brandon has raised **over AU$1B+ across six funds** and completed **60+ investments** in new therapeutic, medical-device and health-tech companies.

**Fund VI (BB6)** had a **A$439M final close in July 2025** — the firm''s largest fund yet, supporting growth of Australian and New Zealand life-sciences startups, scale-ups and Brandon''s expansion into the UK, Europe and US.

The firm operates the **Brandon BioCatalyst** programme (Australasian life-science collaboration; CUREator incubator) and the **Medical Research Commercialisation Fund**.

Active portfolio: **30+ companies** with **17 in clinical trials**. Notable investments:
- **AdvanCell** (radiopharma — US$112M Series C)
- **Myricx Bio** (ADC-focused; US$114M Series A)
- **CatalYm** (German oncology — US$150M Series D)
- **PolyActiva** (drug delivery)
- **ENA Respiratory** (clinical-stage drug development)
- **Currus Biologics** (Peter MacCallum Cancer Centre spin-out — $10M MRCF-led seed)
- **Azura Ophthalmics**
- **Certa Therapeutics**
- **EBR Systems**
- **George Medicines**',
  why_work_with_us = 'For Australian and New Zealand life-sciences, biotech, medical-device and pharmaceutical founders — Brandon Capital Partners is the **most credentialed and best-resourced life-science VC in the ANZ market**. With AU$1B+ across 6 funds, A$439M Fund VI, 60+ investments and 17 portfolio companies in clinical trials, Brandon is the go-to fund for capital-intensive life-science ventures pursuing global commercialisation.',
  meta_title = 'Brandon Capital Partners — Australasia''s Largest Life-Science VC | AU$1B+ FUM',
  meta_description = 'Melbourne life-science VC since 2007. AU$1B+ across 6 funds. Fund VI A$439M (Jul 2025). 60+ investments.',
  details = jsonb_build_object(
    'founded',2007,
    'fum','AU$1B+ across 6 funds',
    'investment_thesis','Life sciences — therapeutics, medical devices, health-tech.',
    'fund_vi','Fund VI (BB6) A$439M final close July 2025',
    'portfolio_size','30+ active; 60+ total; 17 in clinical trials',
    'programmes', ARRAY['Brandon BioCatalyst (CUREator incubator; Australasian life-science collaboration)','Medical Research Commercialisation Fund (MRCF)'],
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','AdvanCell','context','Radiopharma — US$112M Series C'),
      jsonb_build_object('company','Myricx Bio','context','ADC-focused — US$114M Series A'),
      jsonb_build_object('company','CatalYm','context','German oncology — US$150M Series D')
    ),
    'sources', jsonb_build_object(
      'website','https://brandoncapital.vc/',
      'biocatalyst','https://brandonbiocatalyst.com/'
    )
  ),
  updated_at = now()
WHERE name = 'Brandon Capital Partners';

UPDATE investors SET
  basic_info = 'Breakthrough Victoria is the **Victorian Government''s private investment company** — established **2021** with a **AU$2B mandate** to invest in **breakthrough technologies and ideas** that will create high-paying Victorian jobs and economic growth.

The firm invests across **all stages from research translation through to growth** in five priority sectors:
- **Advanced Manufacturing**
- **Agri-Food**
- **Clean Economy**
- **Digital Technologies**
- **Health & Life Sciences**

Notable portfolio includes:
- **Kite Magnetics** (deep-tech magnets)
- **Seer Medical** (medical devices)
- **RayGen** (solar+storage — also CEFC-backed)
- **Remagine Labs**
- **Myostellar**
- **FytonBio**',
  why_work_with_us = 'For Victorian-based or Victorian-relevant founders in advanced manufacturing, agri-food, clean economy, digital technologies and health & life sciences — Breakthrough Victoria offers a Government-backed cheque with stages from research translation through to growth. Especially valuable for founders pursuing Victorian state-based commercialisation pathways and capital-intensive deep-tech development.',
  meta_title = 'Breakthrough Victoria — Victorian Government VC | AU$2B Mandate | All Stages',
  meta_description = 'Melbourne Victorian Government investment company. AU$2B mandate. Advanced manufacturing, agri-food, clean economy, digital, health.',
  details = jsonb_build_object(
    'founded',2021,
    'organisation_type','Victorian Government private investment company',
    'mandate','AU$2B',
    'investment_thesis','Advanced Manufacturing, Agri-Food, Clean Economy, Digital Technologies, Health & Life Sciences.',
    'stages','Research translation through to growth.',
    'sources', jsonb_build_object(
      'website','https://breakthroughvictoria.com/'
    )
  ),
  updated_at = now()
WHERE name = 'Breakthrough Victoria';

UPDATE investors SET
  basic_info = 'Breyer Capital is a **global venture capital and private-equity firm** founded **2006 by Jim Breyer** — best known as one of the **earliest investors in Facebook** (Accel''s lead investor when Facebook was still a startup).

The firm is headquartered in **Austin, Texas** and invests **globally** across **AI/ML, healthcare, vertical AI, FinTech and sustainability**.

Stage focus: **Seed, Series A, Series B and Series C**.

Notable historic investments:
- **Facebook** (early — landmark Accel investment by Jim Breyer)
- **Etsy**
- **Legendary Entertainment**

Jim Breyer is widely recognised as one of the most successful and prolific venture capitalists globally.',
  why_work_with_us = 'For globally-ambitious AI, ML, healthcare, vertical-AI, FinTech and sustainability founders — Breyer Capital offers one of the most credentialed venture cheques in the world. Jim Breyer''s Facebook seed-investor track record signals exceptional pattern recognition for category-defining companies. Best leveraged by ANZ founders pursuing US Series A/B/C with global ambition.',
  meta_title = 'Breyer Capital — Jim Breyer''s Global VC/PE Firm | AI / Healthcare | Austin TX',
  meta_description = 'Austin global VC/PE since 2006. Jim Breyer (Facebook early investor). AI/ML, healthcare, vertical AI, FinTech.',
  details = jsonb_build_object(
    'founded',2006,
    'founder','Jim Breyer',
    'investment_thesis','AI/ML, healthcare, vertical AI, FinTech, sustainability — Seed through Series C.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Facebook','context','Early — landmark Accel investment by Jim Breyer'),
      jsonb_build_object('company','Etsy','context','Early-stage'),
      jsonb_build_object('company','Legendary Entertainment','context','Media/entertainment')
    ),
    'sources', jsonb_build_object(
      'website','https://www.breyercapital.com/'
    )
  ),
  updated_at = now()
WHERE name = 'Breyer Capital';

UPDATE investors SET
  basic_info = 'BridgeLane Group is the **private family office of Markus Kahlbetzer**. Activities span **agriculture, real estate, and historically venture capital**.

The firm is **NOT currently active as a VC investor** — Markus has moved focus to **Side Stage Ventures** for his current venture investing activity.

**Historic VC portfolio** (under previous active VC mandate):
- **Amaysim** (Australian mobile telco — ASX-listed)
- **Airtasker** (Australian gig-economy marketplace — ASX-listed)
- **BrickX** (proptech)',
  why_work_with_us = 'For Australian founders looking for family-office-backed capital, BridgeLane Group is **NOT currently active as a venture investor**. Markus Kahlbetzer''s current venture activity is via **Side Stage Ventures** — founders should approach Side Stage directly for venture investment conversations.',
  meta_title = 'BridgeLane Group — Markus Kahlbetzer Family Office | NOT Currently VC Active',
  meta_description = 'Sydney Markus Kahlbetzer family office. Agriculture, real estate, historic VC. Not currently VC active — see Side Stage.',
  details = jsonb_build_object(
    'organisation_type','Private family office',
    'principal','Markus Kahlbetzer',
    'currently_vc_active',false,
    'current_venture_vehicle','Side Stage Ventures (Markus''s current venture vehicle)',
    'historic_portfolio', ARRAY['Amaysim','Airtasker','BrickX']
  ),
  updated_at = now()
WHERE name = 'BridgeLane Group';

UPDATE investors SET
  basic_info = 'Cardinia Ventures is a **Melbourne-based venture capital firm** investing across **Australia and the United States** in software and hardware companies at **Pre-Seed to Series A** stages.

Sector mandate is broad — software and hardware companies across diverse sectors.

The firm has invested in **at least 6 SaaS companies and 13 enterprise (B2B) companies**, with **3 portfolio acquisitions** to date — most notably **Chronosphere** (acquired by **Palo Alto Networks for US$3.35B in November 2025**).

Portfolio includes:
- **AdRoll** (digital marketing)
- **Alariss**
- **Cadmus** (assessment SaaS)
- **Chronosphere** (acquired by Palo Alto Networks Nov 2025 — US$3.35B)
- **Cognian** (smart-building IoT)
- **Drop Water**
- **Edrolo** (Australian EdTech)',
  why_work_with_us = 'For Australian and US-based software and hardware founders at pre-seed through Series A — Cardinia Ventures offers a Melbourne-anchored VC cheque with proven cross-border deal flow and exit performance (Chronosphere/Palo Alto US$3.35B acquisition Nov 2025). Especially valuable for founders pursuing US market entry with Australian roots.',
  meta_title = 'Cardinia Ventures — Melbourne AU/US Pre-Seed–Series A | Chronosphere ($3.35B exit)',
  meta_description = 'Melbourne VC. AU/US software & hardware. Pre-Seed–Series A. Chronosphere (Palo Alto $3.35B acquisition).',
  details = jsonb_build_object(
    'investment_thesis','Software and hardware companies across Australia and US — Pre-Seed to Series A.',
    'portfolio_size','15+ companies; 3 acquisitions; 2 seed-stage investments',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Chronosphere','context','Acquired by Palo Alto Networks Nov 2025 for US$3.35B'),
      jsonb_build_object('company','AdRoll','context','Digital marketing'),
      jsonb_build_object('company','Edrolo','context','Australian EdTech')
    ),
    'sources', jsonb_build_object(
      'website','https://www.cardiniaventures.com/'
    )
  ),
  updated_at = now()
WHERE name = 'Cardinia Ventures';

COMMIT;
