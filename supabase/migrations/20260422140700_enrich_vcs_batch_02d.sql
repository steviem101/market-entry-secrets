-- Enrich VCs — batch 02d (records 36-40: CP Ventures → Eaton Square)

BEGIN;

UPDATE investors SET
  basic_info = 'CP Ventures is a **Sydney-based micro-VC** managing **two funds with AU$16M total** investing **globally** in highly scalable breakthrough technology companies.

Stage focus: **Pre-Seed and Seed**. Cheque size: **AU$500k** standard.

The firm''s thesis is **"highly scalable breakthrough technology"** — meaning concentrated capital around technically ambitious, globally-scalable founders.',
  why_work_with_us = 'For globally-ambitious founders building **breakthrough technology** at pre-seed and seed — CP Ventures offers a focused $500k cheque from a micro-VC operating two AU$16M funds. Especially valuable for technically ambitious founders pursuing global category leadership at the earliest stage.',
  meta_title = 'CP Ventures — Sydney Micro-VC | AU$16M Total | Breakthrough Tech | $500k',
  meta_description = 'Sydney micro-VC. Two funds AU$16M total. Breakthrough technology. Global. Pre-Seed/Seed. $500k.',
  details = jsonb_build_object(
    'organisation_type','Micro-VC',
    'fum','AU$16M across two funds',
    'investment_thesis','Highly scalable breakthrough technology — global.',
    'check_size_note','AU$500k standard'
  ),
  updated_at = now()
WHERE name = 'CP Ventures';

UPDATE investors SET
  basic_info = 'Darcy Naunton is an **individual Partner entry** — Darcy is **Partner & General Partner at Black Nova Venture Capital** (covered separately in this directory).

He co-founded **Black Nova VC** with Matthew Browne in 2020 — the Sydney-based early-stage B2B SaaS specialist that closed Fund II exceeding AU$35M target in December 2025.

For full investment thesis, fund details, portfolio and engagement pathway, see the **Black Nova VC** entry. This individual record represents Darcy as a person rather than a separate fund.',
  why_work_with_us = 'For Australian B2B SaaS founders building mission-critical, workflow-led software in regulated industries — Darcy Naunton is one of the General Partners at Black Nova VC and a primary point-of-contact for Black Nova investment conversations. Approach via Black Nova VC for fund cheques.',
  meta_title = 'Darcy Naunton — Black Nova VC General Partner | Sydney B2B SaaS',
  meta_description = 'Sydney Black Nova VC General Partner. Co-founder. B2B SaaS specialist. Fund II AU$35M+.',
  details = jsonb_build_object(
    'role','Individual Partner entry — Partner & General Partner at Black Nova Venture Capital',
    'see_also','Black Nova VC (primary fund record)',
    'co_founders', ARRAY['Matthew Browne (Black Nova VC co-founder)'],
    'note','This entry represents Darcy Naunton as an individual; investment activity is via Black Nova VC.'
  ),
  updated_at = now()
WHERE name = 'Darcy Naunton';

UPDATE investors SET
  basic_info = 'Devika Ventures is a **Wollongong-based AI-first, operator-led venture capital firm** investing at **Pre-Seed, Seed and Series A** stages.

The firm specifically focuses on **AI-first technology companies** with a strong operator-led pattern recognition. **Cheque size up to AU$1.5M.** Makes **3-6 investments per year**.

**Portfolio value: AU$50M+** across active companies.

Notable portfolio includes:
- **ClevaQ**
- **Hopstep**
- **CONDITN**
- **Social Kung Fu**

Wollongong-based positioning makes Devika one of the few credentialed regional-NSW-based VCs in the Australian ecosystem.',
  why_work_with_us = 'For Australian AI-first technology founders at pre-seed through Series A — Devika Ventures offers an operator-led specialist cheque (up to AU$1.5M) with active 3-6 deals/year deal flow. Especially valuable for Wollongong/regional-NSW-based founders or those building AI-native products who want hands-on operator advice.',
  meta_title = 'Devika Ventures — Wollongong AI-First Operator VC | up to $1.5M | 3-6 deals/year',
  meta_description = 'Wollongong AI-first operator-led VC. Pre-Seed–Series A. Up to AU$1.5M. 3-6 deals/year. AU$50M+ portfolio.',
  details = jsonb_build_object(
    'investment_thesis','AI-first technology — operator-led; pre-seed through Series A.',
    'check_size_note','Up to AU$1.5M',
    'pace','3-6 investments per year',
    'portfolio_value','AU$50M+'
  ),
  updated_at = now()
WHERE name = 'Devika Ventures';

UPDATE investors SET
  basic_info = 'Dragonfly Enviro Capital is a **Sydney-based environmental impact venture capital firm** founded in **2017 by Nigel Sharp**.

The firm''s **Impact Growth Fund (established 2022)** is targeting **AU$50M**, with **AU$7.5M raised and deployed to date** across **13 portfolio companies**.

Sector focus: **environmental impact — circular economy, cleantech, sustainable agriculture, carbon markets**. Stage focus: **Seed and Series A**.

Notable portfolio includes:
- **Pacific Bio** (sustainable aquaculture)
- **Downforce** (carbon-negative concrete additives)
- **Our Trace** (carbon traceability)
- **Water** (water-tech)
- **Carbon Group** (carbon markets)
- **Red Earth Energy Storage** (battery storage)',
  why_work_with_us = 'For Australian environmental-impact founders building circular-economy, cleantech, sustainable-agriculture or carbon-market businesses — Dragonfly Enviro Capital offers seed/Series A capital from a sector-pure impact-aligned VC. Especially valuable for founders pursuing measurable environmental-impact business models with structured ESG-aligned capital.',
  meta_title = 'Dragonfly Enviro Capital — Sydney Environmental Impact VC since 2017 | $50M Fund Target',
  meta_description = 'Sydney impact VC since 2017. Circular economy, cleantech, sustainable agriculture, carbon markets. AU$7.5M deployed.',
  details = jsonb_build_object(
    'founded',2017,
    'founder','Nigel Sharp',
    'investment_thesis','Environmental impact — circular economy, cleantech, sustainable agriculture, carbon markets.',
    'impact_growth_fund','Targeting AU$50M; AU$7.5M raised/deployed to date',
    'portfolio_size','13 companies'
  ),
  updated_at = now()
WHERE name = 'Dragonfly Enviro Capital';

UPDATE investors SET
  basic_info = 'Eaton Square is a **cross-border M&A advisory and capital-raising firm** with **100+ senior professionals globally**.

**IMPORTANT:** Eaton Square is **NOT a traditional VC fund** — the firm does **NOT make direct investments**. Eaton Square specialises in **ANZ-to-global cross-border M&A and capital-raising transactions**.

Sector focus: **Technology, SaaS and services M&A** — typically advising founders/sellers on cross-border exit transactions or capital raises.',
  why_work_with_us = 'For Australian and New Zealand technology, SaaS and services-business founders pursuing **cross-border M&A exit transactions or institutional capital raises** — Eaton Square offers professional advisory services from 100+ senior professionals globally. **Note**: Eaton Square does not make direct VC investments; engagement is for advisory/transaction services rather than venture capital.',
  meta_title = 'Eaton Square — Cross-Border M&A & Capital Raising Advisory | NOT a VC Fund',
  meta_description = 'Sydney cross-border M&A and capital-raising advisory. 100+ senior professionals globally. NOT a direct VC investor.',
  details = jsonb_build_object(
    'organisation_type','Cross-border M&A and capital-raising advisory firm',
    'is_direct_investor',false,
    'investment_thesis','NOT a direct VC — advisory only. Tech, SaaS and services M&A; cross-border ANZ to global.',
    'team','100+ senior professionals globally',
    'note','This is an advisory firm, not a venture capital fund. Founders should engage Eaton Square for M&A or capital-raising advisory services.'
  ),
  updated_at = now()
WHERE name = 'Eaton Square';

COMMIT;
