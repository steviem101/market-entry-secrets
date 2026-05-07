-- Enrich VCs — batch 02c (records 31-35: Carthona Capital → Common Sense Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Carthona Capital is a **Sydney-based thematic early-stage venture capital firm** founded in **2014**. Headquartered in The Rocks, Sydney.

The firm invests in **highly thematic technology** — taking strong sector views and concentrating capital around specific market themes. Now on its **third fund** with **AU$360M FUM**.

Stage focus: **Pre-Seed, Seed and Series A** with strong follow-on capability into Series B/C from balance-sheet capital. Cheque size: from **AU$1M+**.

Carthona is a **UNPRI signatory** — meaning the firm is committed to UN Principles for Responsible Investment.',
  why_work_with_us = 'For Australian and New Zealand technology founders building category-defining companies aligned with strong sector themes — Carthona Capital offers AU$360M FUM scale, three-fund operating depth (since 2014), and UN PRI-aligned responsible investment positioning. Especially valuable for founders pursuing thematic / sector-specific category leadership with strong follow-on support.',
  meta_title = 'Carthona Capital — Sydney Thematic Tech VC | AU$360M FUM | from $1M',
  meta_description = 'Sydney thematic early-stage VC since 2014. AU$360M FUM. Pre-Seed to Series A. UNPRI signatory.',
  details = jsonb_build_object(
    'founded',2014,
    'fum','AU$360M',
    'investment_thesis','Highly thematic technology — Pre-Seed, Seed and Series A with strong follow-on.',
    'check_size_note','From AU$1M',
    'fund_count','3 funds',
    'esg','UNPRI signatory',
    'sources', jsonb_build_object(
      'website','https://carthona.com/'
    )
  ),
  updated_at = now()
WHERE name = 'Carthona Capital';

UPDATE investors SET
  basic_info = 'Clean Energy Finance Corporation (CEFC) is **Australia''s specialist climate investor** — established by the **Australian Government in 2012** with a total investment mandate of **AU$32.5B**.

The CEFC operates multiple sub-funds and programmes:
- **Clean Energy Innovation Fund** — AU$200M dedicated venture-capital pool for early-stage clean-energy companies
- **Rewiring the Nation Fund** — AU$19B dedicated to grid transformation
- Plus broader debt, equity and fund-of-funds mandates

The CEFC invests across **all stages from VC innovation through to large-scale infrastructure** — minimum cheque typically **AU$3M+**.

Sector focus: **clean energy, climate tech, energy transition, decarbonisation**.

Notable portfolio includes:
- **RayGen** (solar+storage)
- **Hysata** (next-generation electrolyser — green hydrogen)
- **Australian Ethical Growth Fund** (LP position)
- **IP Group Climate Catalyst Fund** (LP position)',
  why_work_with_us = 'For Australian clean-energy, climate-tech, energy-transition and decarbonisation founders — CEFC is the **largest single climate-aligned investor in Australia** with AU$32.5B mandate. Especially valuable for capital-intensive infrastructure-aligned ventures (Hysata, RayGen examples), grid-transformation projects, and founders pursuing structured Government-backed climate capital.',
  meta_title = 'Clean Energy Finance Corporation (CEFC) — Australian Government Climate VC | AU$32.5B',
  meta_description = 'Australian Government climate investor since 2012. AU$32.5B mandate. $200M Innovation Fund. $19B Rewiring the Nation.',
  details = jsonb_build_object(
    'organisation_type','Australian Government specialist climate investor',
    'founded',2012,
    'mandate','AU$32.5B',
    'investment_thesis','Clean energy, climate tech, energy transition, decarbonisation — all stages.',
    'sub_funds', jsonb_build_array(
      jsonb_build_object('name','Clean Energy Innovation Fund','size','AU$200M','focus','Early-stage VC'),
      jsonb_build_object('name','Rewiring the Nation Fund','size','AU$19B','focus','Grid transformation')
    ),
    'check_size_note','From AU$3M',
    'sources', jsonb_build_object(
      'website','https://www.cefc.com.au/'
    )
  ),
  updated_at = now()
WHERE name = 'Clean Energy Finance Corporation (CEFC)';

UPDATE investors SET
  basic_info = 'Climate Tech Partners is a **Sydney-based Series A climate-tech venture capital firm**. **Fund I reached AU$50M+ first close in June 2025**, anchored by:
- **Clean Energy Finance Corporation (CEFC)** — AU$15M
- **Australian Ethical** — AU$15M

The firm also operates a **separate AU$15M Sustainable Aviation Fuel (SAF) vehicle** in partnership with **Qantas and Airbus** — a globally-significant SAF-aligned investment platform.

Sector focus: **climate tech — energy, transport, logistics, mining and sustainable aviation fuel**.

Stage focus: **Series A**. Cheque size: **AU$1M–$5M**.

Notable portfolio includes:
- **Hullbot** (marine robotics — AU$16M Series A)',
  why_work_with_us = 'For Australian climate-tech founders at Series A across energy, transport, logistics, mining or sustainable aviation fuel — Climate Tech Partners offers a **CEFC + Australian Ethical-anchored Series A cheque ($1M–$5M)** plus the unique Qantas/Airbus SAF vehicle. Especially valuable for SAF-adjacent founders or founders pursuing structured Australian climate-aligned institutional capital.',
  meta_title = 'Climate Tech Partners — Sydney Series A Climate VC | $50M+ Fund I | CEFC/Australian Ethical-anchored',
  meta_description = 'Sydney Series A climate VC. Fund I AU$50M+ first close. CEFC + Australian Ethical anchored. SAF vehicle with Qantas/Airbus.',
  details = jsonb_build_object(
    'investment_thesis','Climate tech — energy, transport, logistics, mining, sustainable aviation fuel.',
    'check_size_note','AU$1M–$5M',
    'fund_i','AU$50M+ first close (June 2025)',
    'fund_i_anchors', jsonb_build_array(
      jsonb_build_object('lp','CEFC','amount','AU$15M'),
      jsonb_build_object('lp','Australian Ethical','amount','AU$15M')
    ),
    'saf_vehicle','AU$15M separate vehicle in partnership with Qantas and Airbus',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Hullbot','context','Marine robotics — AU$16M Series A')
    )
  ),
  updated_at = now()
WHERE name = 'Climate Tech Partners';

UPDATE investors SET
  basic_info = 'Clinton Capital Partners is a **Sydney-based VC advisory and investment firm** founded in **2015**. The firm operates a distinctive **success-fee capital-raising model** alongside proprietary investments — raising capital via a **5,000+ active investor network**.

Track record: **90+ transactions over 10+ years**.

Investment thesis is **sector-agnostic** at **Seed, Series A and Series B** stages. Notable Australian-startup transactions include:
- **Alex Bank** (Australian neobank)
- **OpusXenta** (cemetery software SaaS)
- **Lumitron** (truncated)
- **PaidRight** (payroll compliance)
- **MyEmergencyDr** (telehealth)
- **WithYouWithMe** (Australian veteran-skills platform)
- **AgriWebb** (agritech)',
  why_work_with_us = 'For Australian seed, Series A and Series B founders — Clinton Capital Partners offers a unique combination of **success-fee capital-raising advisory** plus direct proprietary investing. Their 5,000+ active investor network makes them especially valuable for founders looking to coordinate large syndicate-style rounds with structured-process capital-raising support.',
  meta_title = 'Clinton Capital Partners — Sydney VC Advisory & Investment | 5,000+ Investor Network',
  meta_description = 'Sydney VC advisory + investment since 2015. 5,000+ investor network. 90+ transactions. Sector-agnostic. Alex Bank, AgriWebb.',
  details = jsonb_build_object(
    'organisation_type','VC advisory and investment firm',
    'founded',2015,
    'model','Success-fee capital-raising via 5,000+ active investor network + proprietary investments',
    'investment_thesis','Sector-agnostic — Seed, Series A, Series B.',
    'transactions','90+ over 10 years',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Alex Bank','context','Australian neobank'),
      jsonb_build_object('company','AgriWebb','context','Australian agritech'),
      jsonb_build_object('company','WithYouWithMe','context','Australian veteran-skills platform')
    )
  ),
  updated_at = now()
WHERE name = 'Clinton Capital Partners';

UPDATE investors SET
  basic_info = 'Common Sense Ventures is an **Australian family office** investing at **Seed and Series A** stages across multiple sectors — **AgTech, Food, Sustainability, eCommerce/DTC and B2B SaaS**.

The firm was **founded by past entrepreneurs** — bringing operator-aligned investing perspective.

Cheque size: **AU$100k–$1M**.',
  why_work_with_us = 'For Australian agtech, food-tech, sustainability, eCommerce/DTC and B2B SaaS founders at seed or Series A — Common Sense Ventures offers a $100k–$1M cheque from a family office with founder-operator perspective. Especially valuable for founders looking for low-ceremony private-capital partners with sector-thesis alignment in agriculture, food and sustainability.',
  meta_title = 'Common Sense Ventures — Australian Family Office | AgTech / Food / DTC / B2B SaaS | $100k–$1M',
  meta_description = 'Australian family-office VC. AgTech, Food, Sustainability, eCommerce/DTC, B2B SaaS. Seed–Series A. $100k–$1M.',
  details = jsonb_build_object(
    'organisation_type','Australian family office',
    'investment_thesis','AgTech, Food, Sustainability, eCommerce/DTC, B2B SaaS — Seed and Series A.',
    'check_size_note','AU$100k–$1M',
    'partners','Past entrepreneurs (founder-operator perspective)'
  ),
  updated_at = now()
WHERE name = 'Common Sense Ventures';

COMMIT;
