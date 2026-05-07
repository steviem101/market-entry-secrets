-- Enrich VCs — batch 01a (records 1-5: 1V (OneVentures) → AgriZeroNZ)

BEGIN;

UPDATE investors SET
  basic_info = '1V (OneVentures) is one of Australia''s most established later-stage venture capital firms — founded 2010 by Michelle Deaker — managing **AU$1B+ total funds under management across 7 funds**.

The firm specialises in **growth-stage (Series B+) investments** in high-growth Australian and US technology and healthcare companies, with notable representation across deep-tech, medical devices, and B2B SaaS.

**Fund VII** launched August 2024 targeting **AU$200M** and is currently raising. Fund I closed in 2024.

The portfolio includes some of Australia''s most notable scale-ups and exits:
- **Vaxxas** (vaccine delivery technology)
- **BiVACOR** (artificial heart)
- **Employment Hero** (HR platform — exited)
- **Shippit** (logistics)
- **Phocas** (analytics — exited Oct 2025)
- **Buildkite** (developer infrastructure)
- **Fleet Space** (satellite networks)
- **HIVERY** (acquired Jan 2025)
- Plus AMP, InDebted, Harmoney, ImmVirX, Zoomo, Blade Therapeutics, Axial Therapeutics, MyPass, Lumary, Kepler Analytics, 6clicks, AmazingCo',
  why_work_with_us = 'For Australian and US-based growth-stage technology and healthcare founders — 1V (OneVentures) offers one of the most established later-stage Australian VC cheques with 7 funds of operating depth, deep-tech and biotech sector specialism, and AU$1B+ FUM scale. Especially valuable for capital-intensive deep-tech and healthcare founders pursuing Series B+ rounds with cross-border US ambition.',
  meta_title = '1V (OneVentures) — AU$1B+ FUM | Australian Growth-Stage VC | Fund VII Raising',
  meta_description = 'Sydney later-stage VC. AU$1B+ FUM across 7 funds since 2010. Tech, healthcare, deep tech. Fund VII targeting AU$200M.',
  details = jsonb_build_object(
    'founded',2010,
    'founder','Michelle Deaker',
    'fum','AU$1B+ total FUM across 7 funds',
    'current_fund','Fund VII (launched Aug 2024; targeting AU$200M; raising)',
    'investment_thesis','Growth-stage (Series B+) Australian and US tech/healthcare.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Employment Hero','context','Exited'),
      jsonb_build_object('company','Phocas','context','Exited Oct 2025'),
      jsonb_build_object('company','HIVERY','context','Acquired Jan 2025'),
      jsonb_build_object('company','BiVACOR','context','Artificial heart'),
      jsonb_build_object('company','Vaxxas','context','Vaccine delivery technology')
    ),
    'sources', jsonb_build_object(
      'website','https://one-ventures.com.au/',
      'portfolio','https://one-ventures.com.au/portfolio/',
      'crunchbase','https://www.cbinsights.com/investor/oneventures',
      'fund_vii_news','https://dynamicbusiness.com/topics/news/oneventures-launches-its-seventh-fund-targeting-200-million.html'
    )
  ),
  updated_at = now()
WHERE name = '1V (OneVentures)';

UPDATE investors SET
  basic_info = '77 Partners is a Brisbane-based **early-stage venture capital firm** backed by Silicon Valley-based **Bee Partners**. The firm runs the **77 Challenge** — an open application program where founders can pitch for an investment of **AU$100k+** with public-facing intake.

The fund focuses on frontier and deep-tech sectors — AI, IoT, advanced manufacturing, robotics, energy and cybersecurity — at the **pre-seed and seed** stages.

Portfolio details and fund size are **not publicly available**, but at least 5 investments have been disclosed to date.',
  why_work_with_us = 'For Australian frontier-tech, AI, IoT, robotics, advanced-manufacturing, energy-tech and cybersecurity founders — especially those at pre-seed/seed stage — 77 Partners offers a rare open-application pathway via the 77 Challenge plus Silicon Valley fund-network access via Bee Partners. Particularly relevant for technically ambitious Brisbane/Queensland-based founders.',
  meta_title = '77 Partners — Brisbane Frontier-Tech VC | 77 Challenge | from AU$100k',
  meta_description = 'Brisbane early-stage VC backed by Bee Partners (Silicon Valley). 77 Challenge open application. From AU$100k.',
  details = jsonb_build_object(
    'investment_thesis','Frontier-tech and deep-tech — AI, IoT, advanced manufacturing, robotics, energy, cybersecurity.',
    'fund_size','Not publicly available',
    'check_size_note','From AU$100k via 77 Challenge; upper bound not disclosed',
    'open_application','77 Challenge — open application for founders',
    'backers', ARRAY['Bee Partners (Silicon Valley)'],
    'sources', jsonb_build_object(
      'website','https://www.77partners.vc/',
      '77_challenge','https://www.77partners.vc/challenge'
    )
  ),
  updated_at = now()
WHERE name = '77 Partners';

UPDATE investors SET
  basic_info = '808 Ventures is a Perth-based (Claremont, WA) **frontier-tech and deep-tech venture capital firm** founded in **2016 by Gary Macbeth and Art Caisse**.

The firm has global deal flow via the **Global Alliance Fund** — a USD$1B+ fund-of-funds across **243 portfolio companies**. The 808 Ventures investment thesis spans **deep tech, space, energy, cleantech, biotech and healthtech** — at early-stage and growth.

The portfolio includes:
- **Space**: Varda Space, Regent, D-Orbit, Armada
- **Energy / Cleantech**: Oklo (nuclear fission), Cemvita, Gold Hydrogen, Infinium, Quaise (geothermal), Exowatt
- **Bio / Health**: Equal1, Atomic Industries, Wellteq, Boundlss
- **Other**: Rentberry, GuestReady, Byte Foods, Inhalio, Mmuze, Partful, StretchSense, Circ',
  why_work_with_us = 'For Australian and especially Perth/Western-Australian frontier-tech, deep-tech, space, energy-transition and cleantech founders — 808 Ventures combines a unique 22-portfolio-company depth with global deal-flow access via the USD$1B+ Global Alliance Fund (243 companies). Especially valuable for capital-intensive deep-tech founders with global ambition.',
  meta_title = '808 Ventures — Perth Deep-Tech / Space / Energy VC | Global Alliance Fund',
  meta_description = 'Perth frontier/deep-tech VC since 2016. Space, energy, cleantech. Global Alliance Fund USD$1B+ / 243 companies.',
  details = jsonb_build_object(
    'founded',2016,
    'founders', ARRAY['Gary Macbeth','Art Caisse'],
    'investment_thesis','Frontier and deep tech — space, energy, cleantech, biotech, healthtech.',
    'global_alliance_fund','USD$1B+ across 243 portfolio companies',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Varda Space','context','Space manufacturing'),
      jsonb_build_object('company','Oklo','context','Nuclear fission'),
      jsonb_build_object('company','Quaise','context','Geothermal energy'),
      jsonb_build_object('company','D-Orbit','context','In-orbit logistics')
    ),
    'sources', jsonb_build_object(
      'website','https://www.808ventures.vc'
    )
  ),
  updated_at = now()
WHERE name = '808 Ventures';

UPDATE investors SET
  basic_info = 'AfterWork Ventures is a Sydney-based **community-powered early-stage venture capital firm** with a network of **100+ tech operators** who actively support portfolio companies.

The firm is **sector-agnostic** with a focus on Australia and New Zealand founders at **pre-seed and seed** stages. **Cheque size: AU$100k–$500k.**

The portfolio is one of the most active and diverse in the ANZ early-stage market — 34+ companies including:
- **Cover Genius** (insurtech)
- **Car Next Door** (mobility marketplace)
- **90 Seconds** (video production marketplace)
- **Onfido** (identity verification)
- **Cake Equity** (cap-table SaaS)
- **OwnHome** (proptech)
- **Lyka** (DTC pet food)
- **OfferFit** (AI marketing)
- **Functionly** (org-design SaaS)
- **GridCognition** (energy)
- **Samphire Neuroscience** (femtech)
- **Everlab** (preventive health)
- Plus 22+ additional active portfolio companies',
  why_work_with_us = 'For Australian and New Zealand pre-seed and seed-stage founders — AfterWork Ventures offers one of the most operator-dense networks in the ANZ market (100+ tech operators) plus an active 34-company portfolio with breakout exposure across consumer, fintech, healthtech, proptech and B2B SaaS. Especially valuable for founders who want hands-on operator advice alongside the cheque.',
  meta_title = 'AfterWork Ventures — Sydney Community-Powered Pre-Seed/Seed VC | $100k–$500k',
  meta_description = 'Sydney community-powered early-stage VC. 100+ tech operators. Sector-agnostic ANZ. $100k–$500k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Community-powered sector-agnostic — Australia and New Zealand pre-seed/seed.',
    'check_size_note','AU$100k–$500k',
    'community','100+ tech operators actively supporting portfolio',
    'portfolio_size','34+ active companies',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Cover Genius','context','Insurtech'),
      jsonb_build_object('company','Car Next Door','context','Mobility marketplace'),
      jsonb_build_object('company','Cake Equity','context','Cap-table SaaS'),
      jsonb_build_object('company','Lyka','context','DTC pet food')
    ),
    'sources', jsonb_build_object(
      'website','https://www.afterwork.vc'
    )
  ),
  updated_at = now()
WHERE name = 'AfterWork Ventures';

UPDATE investors SET
  basic_info = 'AgriZeroNZ is a **New Zealand public-private partnership** dedicated to investing in technologies that reduce **agricultural greenhouse-gas emissions** — particularly methane.

The fund structure is **50% NZ Crown / Ministry for Primary Industries (MPI)** + **50% industry consortium** comprising:
- **a2 Milk Company**
- **ANZ Bank**
- **ASB Bank**
- **BNZ Bank**
- **ANZCO Foods**
- **Fonterra**
- **Rabobank**
- **Ravensdown**
- **Silver Fern Farms**
- **Synlait Milk**

Investment range: **NZD$1M–$10M** across pre-seed, seed, Series A and Series B stages.

Portfolio companies span methane-reducing biotech and ag-tech:
- **Agteria Biotech**
- **ArkeaBio**
- **BiomEdit**
- **Hoofprint Biome**
- **Ruminant BioTech**
- **Bovotica**
- **Rumin8**
- **BioLumic**
- **Nbryo**
- **Agroceuticals Products NZ**',
  why_work_with_us = 'For New Zealand and Australian agri-tech, methane-reduction, livestock-emissions, biotech and climate-aligned founders — AgriZeroNZ is the **largest specialised methane/agricultural emissions VC** in ANZ. The unique 50/50 government + industry-consortium structure provides direct pathway to commercial validation with Fonterra, a2 Milk, ANZCO, Silver Fern Farms and other major NZ ag-industry players.',
  meta_title = 'AgriZeroNZ — NZ Public-Private Methane / Ag-Emissions VC | NZD$1M–$10M',
  meta_description = 'Auckland NZ Crown + industry partnership. Methane reduction. NZD$1M–$10M. a2 Milk, Fonterra, ANZCO consortium.',
  details = jsonb_build_object(
    'organisation_type','Public-private partnership VC',
    'investment_thesis','Agricultural greenhouse-gas emissions reduction — particularly methane.',
    'check_size_note','NZD$1M–$10M',
    'structure','50% NZ Crown/MPI + 50% industry consortium',
    'consortium', ARRAY['a2 Milk','ANZ','ASB','BNZ','ANZCO','Fonterra','Rabobank','Ravensdown','Silver Fern Farms','Synlait'],
    'sources', jsonb_build_object(
      'website','https://www.agrizero.nz'
    )
  ),
  updated_at = now()
WHERE name = 'AgriZeroNZ';

COMMIT;
