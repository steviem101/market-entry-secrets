-- Enrich VCs — batch 04d (records 76-80: Main Sequence → MassMutual Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Main Sequence is **Australia''s deep-tech venture fund** — backed by **CSIRO** (the Commonwealth Scientific and Industrial Research Organisation, Australia''s national science agency).

The firm invests in startups **commercialising world-class science and technology** — across **Data Infrastructure and Analytics, Farming, Medical Practices, Services for Renewable Energy and Software Development**. Stage focus: **Pre-Seed, Seed and Series A**. Cheque size: **AU$500k–$10M**.

Notable Australian deep-tech portfolio includes:
- **Gilmour Space** (Australian launch vehicles / orbital rockets)
- **Morse Micro** (Wi-Fi HaLow chipset semiconductor)
- **Baraja** (LiDAR for autonomous vehicles)
- **Q-CTRL** (quantum-computing software / control)',
  why_work_with_us = 'For Australian deep-tech founders commercialising world-class science — particularly in space, semiconductor, LiDAR, quantum, biotech, agtech, climate-tech and data-infrastructure categories — Main Sequence is **the most credentialed deep-tech VC in Australia**. CSIRO backing plus AU$500k–$10M cheque flexibility plus high-quality portfolio (Gilmour Space, Morse Micro, Baraja, Q-CTRL) make Main Sequence the go-to partner for hard-tech founders.',
  meta_title = 'Main Sequence — Australia''s Deep-Tech VC | CSIRO-backed | $500k–$10M',
  meta_description = 'Australia''s deep-tech VC backed by CSIRO. Gilmour Space, Morse Micro, Baraja, Q-CTRL. Pre-Seed to Series A. $500k–$10M.',
  details = jsonb_build_object(
    'distinction','Australia''s deep-tech venture fund',
    'lp_anchor','CSIRO (Commonwealth Scientific and Industrial Research Organisation)',
    'investment_thesis','Commercialising world-class science — data infra, farming, medical, renewable energy services, software.',
    'check_size_note','AU$500k–$10M',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Gilmour Space','context','Australian orbital rockets / launch vehicles'),
      jsonb_build_object('company','Morse Micro','context','Wi-Fi HaLow chipset — semiconductor'),
      jsonb_build_object('company','Baraja','context','LiDAR for autonomous vehicles'),
      jsonb_build_object('company','Q-CTRL','context','Quantum-computing software / control')
    )
  ),
  updated_at = now()
WHERE name = 'Main Sequence';

UPDATE investors SET
  basic_info = 'Mandalay Venture Partners is a **Queensland-based agri-food tech venture capital firm** founded in **2021**. The firm invests at **Seed to Series A** stages with backing from **QIC (Queensland Investment Corporation) and NRMA**.

The fund has a **Queensland Venture Capital Development Fund (QVCDF) allocation up to AU$20M** — providing structured early-stage capital for agri-food-tech founders in Queensland.',
  why_work_with_us = 'For Australian — and especially Queensland-based — agri-food tech founders at seed through Series A — Mandalay Venture Partners offers QIC + NRMA-backed capital with up to AU$20M QVCDF allocation. Especially valuable for AgTech founders pursuing structured Queensland-government-aligned commercialisation.',
  meta_title = 'Mandalay Venture Partners — QLD Agri-Food Tech VC since 2021 | QIC + NRMA-Backed | up to $20M',
  meta_description = 'QLD agri-food tech VC since 2021. QIC + NRMA investors. QVCDF allocation up to $20M. Seed to Series A.',
  details = jsonb_build_object(
    'founded',2021,
    'investment_thesis','Agri-food tech — Seed to Series A; Queensland focus.',
    'lp_base', ARRAY['QIC (Queensland Investment Corporation)','NRMA'],
    'qvcdf_allocation','Up to AU$20M'
  ),
  updated_at = now()
WHERE name = 'Mandalay Venture Partners';

UPDATE investors SET
  basic_info = 'Marbruck Investments is a **Darlinghurst, Sydney-based open-ended venture capital fund** (137-153 Crown St). The firm has historic ties to the **online casino industry** and operates a relatively secretive investment programme.

Investment focus: **Technology and growth-stage companies** — specific portfolio not publicly disclosed in detail.',
  why_work_with_us = 'For Australian founders looking for structured private-capital partnerships — Marbruck Investments offers an open-ended fund structure (no fixed term) for technology and growth-stage companies. **Note**: Limited public visibility means engagement is best treated as a referral-led conversation through warm intros.',
  meta_title = 'Marbruck Investments — Darlinghurst Sydney Open-Ended VC | Tech / Growth',
  meta_description = 'Darlinghurst Sydney open-ended VC. Technology and growth-stage. Limited public profile.',
  details = jsonb_build_object(
    'organisation_type','Open-ended venture capital fund',
    'investment_thesis','Technology and growth-stage companies.',
    'note','Open-ended structure; ties to online casino industry; limited public visibility on portfolio.'
  ),
  updated_at = now()
WHERE name = 'Marbruck Investments';

UPDATE investors SET
  basic_info = 'Marshall Investments is a **Sydney-based growth-capital and venture-debt provider**.

**IMPORTANT**: Marshall Investments is **NOT pure VC** — the firm provides **loans of AU$2M–$20M** for **revenue-generating businesses with revenue >AU$5M per annum**.

This makes Marshall a structured non-dilutive capital alternative to traditional venture equity for late-stage growth founders.',
  why_work_with_us = 'For Australian late-stage growth founders with **revenue >AU$5M per annum** seeking **non-dilutive growth capital** rather than equity — Marshall Investments offers AU$2M–$20M loan instruments with venture-debt structuring. Especially valuable for capital-efficient SaaS or marketplace founders looking to extend runway without equity dilution.',
  meta_title = 'Marshall Investments — Sydney Growth Capital + Venture Debt | $2M–$20M | Revenue >$5M',
  meta_description = 'Sydney growth capital + venture debt provider. Loans $2M–$20M. Revenue >$5M pa. Not pure VC.',
  details = jsonb_build_object(
    'organisation_type','Growth capital + venture debt provider',
    'investment_thesis','Loans for revenue-generating businesses (>$5M pa revenue).',
    'check_size_note','AU$2M–$20M loans',
    'note','Non-dilutive venture-debt instrument rather than traditional VC equity.'
  ),
  updated_at = now()
WHERE name = 'Marshall Investments';

UPDATE investors SET
  basic_info = 'MassMutual Ventures is a **US-based venture capital firm** with offices in **Boston (USA) and Singapore**. The firm invests in Australia and New Zealand from its global Asia-focused fund.

**Fund III: US$300M (2022)** — focused on Asia and Europe.

Sector focus: **Digital health, FinTech, enterprise SaaS and cybersecurity**. Stage focus: **Series A, Series B and Series C**.

Backed by Massachusetts Mutual Life Insurance Company (MassMutual) — one of the largest life-insurance companies in the United States.',
  why_work_with_us = 'For Australian and New Zealand digital-health, FinTech, enterprise-SaaS and cybersecurity founders at Series A through Series C — MassMutual Ventures offers structured US-institutional VC capital with global Asia-Europe deployment thesis. Especially valuable for ANZ founders pursuing US/global Series-stage capital with insurance-industry strategic LP signalling.',
  meta_title = 'MassMutual Ventures — US-based VC | Boston/Singapore | $300M Fund III | Series A/B/C',
  meta_description = 'US-based VC (Boston + Singapore). Fund III $300M (2022, Asia+Europe). Digital health, FinTech, SaaS, cybersecurity.',
  details = jsonb_build_object(
    'parent','Massachusetts Mutual Life Insurance Company',
    'fund_iii','US$300M (2022)',
    'global_offices', ARRAY['Boston USA','Singapore'],
    'investment_thesis','Digital health, FinTech, enterprise SaaS, cybersecurity — Series A, B, C.'
  ),
  updated_at = now()
WHERE name = 'MassMutual Ventures';

COMMIT;
