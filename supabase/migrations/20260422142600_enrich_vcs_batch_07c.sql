-- Enrich VCs — batch 07c (records 131-135: TEN13 → Tin Alley Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'TEN13 is a **syndicated investment platform** by **Steve Baxter and Stew Glynn** — two of Australia''s most prominent angel investors and tech operators.

The platform has **invested AU$110M+ since 2019** with cheques of **AU$300k–$2M** at **Pre-Seed to Series A** stages.

TEN13 was the **first mandate under the AU$130M QVCDF (Queensland Venture Capital Development Fund)** — managed by QIC Ventures (covered separately).

Notable portfolio: Appetise (Atrium pre-seed) — plus extensive syndicate participation across the ANZ early-stage ecosystem (e.g. Mr Yum, where Stew Glynn at TEN13 led a round that Tom Richardson and others joined).',
  why_work_with_us = 'For Australian — and especially Queensland-based — pre-seed through Series A founders — TEN13 offers structured syndicated capital with AU$110M+ deployment track record, $300k–$2M cheques and QVCDF anchor LP. Especially valuable for founders pursuing Steve Baxter / Stew Glynn-network deal flow.',
  meta_title = 'TEN13 — Steve Baxter + Stew Glynn Syndicate | $110M+ Since 2019 | $300k–$2M',
  meta_description = 'AU syndicated investment platform. Steve Baxter + Stew Glynn. AU$110M+ since 2019. $300k–$2M. Pre-Seed to Series A.',
  details = jsonb_build_object(
    'organisation_type','Syndicated investment platform',
    'principals', ARRAY['Steve Baxter','Stew Glynn'],
    'track_record','AU$110M+ invested since 2019',
    'check_size_note','AU$300k–$2M',
    'qvcdf_anchor','First mandate under AU$130M QVCDF (managed by QIC Ventures)'
  ),
  updated_at = now()
WHERE name = 'TEN13';

UPDATE investors SET
  basic_info = 'Tenacious Ventures is an **early-stage Australian venture capital firm** focused **exclusively on agri-food innovation and climate tech** at the intersection of **digitally native agriculture**.

The portfolio is one of the deepest sector-pure agri-food-tech portfolios in Australia:
- **Agovor**, **Azaneo**, **Cecil**, **Earthodic**, **Geora**, **Goterra**, **Jupiter Ionics**, **Nbryo**, **Phyllome**, **RapidAIM**, **Regrow**, **SwarmFarm Robotics**, **Vow Food**',
  why_work_with_us = 'For Australian agri-food and climate-tech founders building digitally-native agriculture products — Tenacious Ventures is **the most credentialed sector-pure agri-food-tech VC in Australia** with a deep 13-company portfolio. Especially valuable for founders pursuing structured agri-tech commercialisation.',
  meta_title = 'Tenacious Ventures — Australia''s Specialist Agri-Food / Climate Tech VC | Digitally Native Agriculture',
  meta_description = 'AU early-stage VC. Exclusive focus on agri-food innovation + climate tech. Digitally native agriculture.',
  details = jsonb_build_object(
    'investment_thesis','Agri-food innovation + climate tech — digitally native agriculture; early stage.'
  ),
  updated_at = now()
WHERE name = 'Tenacious Ventures';

UPDATE investors SET
  basic_info = 'Teoh Capital is the **family office of David Teoh** — founder of **TPG Telecom** (one of Australia''s largest telecommunications companies). The firm operates as an **Australian PE/VC firm** investing in **software, brands and enduring businesses**.',
  why_work_with_us = 'For Australian founders pursuing structured family-office-backed capital — Teoh Capital offers David Teoh''s telecommunications-industry-leader operator depth (TPG Telecom founder) plus PE/VC investment capability across software, brands and enduring-businesses categories.',
  meta_title = 'Teoh Capital — David Teoh (TPG Telecom Founder) Family Office | Software / Brands / Enduring Businesses',
  meta_description = 'David Teoh (TPG Telecom founder) family office. Australian PE/VC. Software, brands, enduring businesses.',
  details = jsonb_build_object(
    'organisation_type','Family office (PE/VC)',
    'principal','David Teoh (TPG Telecom founder)',
    'investment_thesis','Software, brands, enduring businesses.'
  ),
  updated_at = now()
WHERE name = 'Teoh Capital';

UPDATE investors SET
  basic_info = 'Tidal Ventures is an **Australian seed-stage venture capital firm** — **founder-led**. **Tidal Seed Fund III** is currently active.

The firm invests in **technology with global potential**.

Notable portfolio includes:
- **Search.io** (AI search)
- **TheLoops** (customer-experience analytics)
- **Shippit** (Australian e-commerce shipping/logistics)
- **SecurePII** (data protection)
- **Vinyl**
- **Refold** (translation tech)',
  why_work_with_us = 'For Australian seed-stage founders building technology with global potential — Tidal Ventures offers a founder-led seed cheque with high-quality global-tech portfolio (Search.io, Shippit, TheLoops, Refold) and active Fund III deployment.',
  meta_title = 'Tidal Ventures — AU Founder-Led Seed VC | Tidal Seed Fund III | Search.io, Shippit',
  meta_description = 'AU seed-stage VC. Founder-led. Tidal Seed Fund III active. Search.io, Shippit, SecurePII, Vinyl, Refold portfolio.',
  details = jsonb_build_object(
    'organisation_type','Founder-led seed VC',
    'fund_iii','Tidal Seed Fund III (active)',
    'investment_thesis','Technology with global potential — seed.'
  ),
  updated_at = now()
WHERE name = 'Tidal Ventures';

UPDATE investors SET
  basic_info = 'Tin Alley Ventures is the **University of Melbourne / Tanarra Capital partnership venture capital firm** with **AU$125M FUM**.

The firm primarily focuses on **University of Melbourne spinouts** in **life sciences and physical sciences**, also extending to broader technology investments. Stage focus: **Seed to Pre-IPO**. Cheque size: **from AU$500k**.

**9 investments** to date (not named publicly).',
  why_work_with_us = 'For University of Melbourne researchers and spinout-founders — and broader Australian life-sciences and physical-sciences founders — Tin Alley Ventures offers AU$125M FUM partnership-backed capital with explicit university-spinout commercialisation focus.',
  meta_title = 'Tin Alley Ventures — University of Melbourne / Tanarra Capital Partnership | $125M FUM',
  meta_description = 'University of Melbourne / Tanarra Capital partnership VC. AU$125M FUM. Seed to Pre-IPO. UoM spinouts focus.',
  details = jsonb_build_object(
    'partnership','University of Melbourne + Tanarra Capital',
    'fum','AU$125M',
    'investment_thesis','UoM spinouts in life sciences and physical sciences; broader technology — Seed to Pre-IPO.',
    'check_size_note','From AU$500k',
    'portfolio_size','9 investments'
  ),
  updated_at = now()
WHERE name = 'Tin Alley Ventures';

COMMIT;
