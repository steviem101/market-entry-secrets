-- Enrich VCs — batch 07b (records 126-130: Stoic VC → Taronga Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Stoic VC is a **Sydney-based venture capital firm** at the **intersection of research and commercialisation** — investing when startups have demonstrated proof of concept. Headquartered at 1 Macquarie Place, Sydney.

The firm partners with **Uniseed** (Australia''s longest-running university VC fund — covered separately) for university-spinout deal flow.

Sector focus across three thematic categories:
- **Human Health**
- **Advanced Computing**
- **Physical World** (climate / environment)

Stage focus: **Seed to Series A**. Cheque size: **AU$100k–$1M**.

Notable portfolio includes:
- **Kinoxis** (drug development)
- **Neurode** (medical-device / neurology)
- **BioScout** (agricultural pathogen surveillance)',
  why_work_with_us = 'For Australian founders building research-and-commercialisation-aligned products in Human Health, Advanced Computing or Physical World (climate/environment) categories — Stoic VC offers a focused $100k–$1M cheque with deep university-spinout partnership network (via Uniseed).',
  meta_title = 'Stoic VC — Sydney Research / Commercialisation VC | Uniseed Partner | $100k–$1M',
  meta_description = 'Sydney VC at intersection of research and commercialisation. Uniseed partnership. Seed–Series A. $100k–$1M.',
  details = jsonb_build_object(
    'partnership','Uniseed',
    'investment_thesis','Human Health, Advanced Computing, Physical World — Seed to Series A; proof-of-concept stage.',
    'check_size_note','AU$100k–$1M'
  ),
  updated_at = now()
WHERE name = 'Stoic VC';

UPDATE investors SET
  basic_info = 'Strata Vision Fund is an **Australian fund** investing in **high-potential startups bringing innovation to strata/apartment communities** with a **long-term perspective**.

Sector focus: **PropTech — strata and apartment-community innovation**.',
  why_work_with_us = 'For Australian PropTech founders specifically building products for **strata/apartment-community management, services or technology** — Strata Vision Fund offers a sector-pure focused cheque with long-term-horizon investment perspective.',
  meta_title = 'Strata Vision Fund — Australian Strata / Apartment-Community PropTech',
  meta_description = 'Australian PropTech fund. Strata/apartment-community innovation. Long-term perspective.',
  details = jsonb_build_object(
    'investment_thesis','PropTech — strata/apartment-community innovation; long-term perspective.'
  ),
  updated_at = now()
WHERE name = 'Strata Vision Fund';

UPDATE investors SET
  basic_info = 'Tank Stream Ventures is a **Sydney-based early-stage venture capital firm** (Level 10, 17-19 Bridge St). The firm operates an **AU$20M fund (fully deployed)** with **30+ investments** across Pre-Seed, Seed and Series A stages. Cheque size: **AU$200k–$1M**.

The firm is **part of BridgeLane Group** (Markus Kahlbetzer family office — covered separately; though Markus has now moved focus to Side Stage Ventures).

Sector focus: **SaaS, eCommerce, Social Media, Online Marketplaces**.

**Rui Rodrigues** (covered as Sydney angel / 2× F1 World Champion team manager) was a **former Managing Partner** at Tank Stream Ventures.',
  why_work_with_us = 'For Australian SaaS, eCommerce, social-media and online-marketplace founders at pre-seed through Series A — Tank Stream Ventures offers AU$200k–$1M cheques from a Sydney-based fund with 30+ investments and BridgeLane Group network connections.',
  meta_title = 'Tank Stream Ventures — Sydney Early-Stage VC | $20M Fund | 30+ Investments | $200k–$1M',
  meta_description = 'Sydney early-stage VC. AU$20M fund (fully deployed). 30+ investments. SaaS, eCommerce. $200k–$1M.',
  details = jsonb_build_object(
    'fund_size','AU$20M (fully deployed)',
    'parent','Part of BridgeLane Group',
    'investment_thesis','SaaS, eCommerce, Social Media, Online Marketplaces — Pre-Seed to Series A.',
    'check_size_note','AU$200k–$1M',
    'related_individuals', ARRAY['Rui Rodrigues (former Managing Partner)']
  ),
  updated_at = now()
WHERE name = 'Tank Stream Ventures';

UPDATE investors SET
  basic_info = 'Tarnagulla Ventures is a **Melbourne-based family-owned life-sciences venture capital firm** with a focus on **seed and venture-capital investments**.

The firm specialises in **small-molecule, protein and cell-based therapeutics** and brings medical-technology companies to **Australian and US markets**.

Sector focus: **Life Sciences — therapeutics and medical technology**. Stage focus: **Seed and Venture**.',
  why_work_with_us = 'For Australian life-sciences founders building small-molecule, protein or cell-based therapeutics — Tarnagulla Ventures offers a Melbourne-based family-owned specialist cheque with explicit AU + US-market commercialisation thesis.',
  meta_title = 'Tarnagulla Ventures — Melbourne Family-Owned Life-Sciences VC | Therapeutics + MedTech',
  meta_description = 'Melbourne family-owned life-sciences VC. Small molecule, protein, cell-based therapeutics. AU + US markets.',
  details = jsonb_build_object(
    'organisation_type','Family-owned life-sciences VC',
    'investment_thesis','Life sciences — small-molecule, protein, cell-based therapeutics.'
  ),
  updated_at = now()
WHERE name = 'Tarnagulla Ventures';

UPDATE investors SET
  basic_info = 'Taronga Ventures is a **global RealTech (real-estate technology) venture capital firm and accelerator** with **global institutional partners**.

Sector focus spans **real estate, built environment, smart cities, ESG and energy transition** — making Taronga one of the most credentialed sector-pure RealTech investors globally.

Notable portfolio includes:
- **Rebound Technologies** (industrial cooling)
- **Ailytics** (computer vision for built environment)
- **Enteligent** (energy management)
- **Diraq** (quantum-tech for built-environment applications)
- **OpenSpace** (construction reality-capture)',
  why_work_with_us = 'For global PropTech / RealTech founders building products for real estate, built environment, smart cities, ESG or energy-transition categories — Taronga Ventures offers a sector-pure global RealTech VC + accelerator pathway with institutional-grade LP base.',
  meta_title = 'Taronga Ventures — Global RealTech VC | Real Estate / Built Environment / Smart Cities / ESG',
  meta_description = 'Global RealTech VC + accelerator. Real estate, built environment, smart cities, ESG, energy transition.',
  details = jsonb_build_object(
    'organisation_type','VC + accelerator',
    'investment_thesis','RealTech — real estate, built environment, smart cities, ESG, energy transition.'
  ),
  updated_at = now()
WHERE name = 'Taronga Ventures';

COMMIT;
