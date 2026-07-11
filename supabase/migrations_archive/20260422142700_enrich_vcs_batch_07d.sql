-- Enrich VCs — batch 07d (records 136-140: Tin Men Capital → UniQuest Extension Fund)

BEGIN;

UPDATE investors SET
  basic_info = 'Tin Men Capital is a **Singapore-based venture capital firm** (193 Jalan Besar Rd) focused **exclusively on B2B technology in Southeast Asia**.

**IMPORTANT**: Tin Men Capital is **NOT ANZ-focused**.

Stage focus: **Series A and Series B**.

Notable portfolio includes:
- **Ailytics** (exited)
- **Hubble** (exited)
- **Globaltix** (Series B; S$6.5M)
- **Ai Palette**
- **Manuva**',
  why_work_with_us = 'For Australian founders pursuing **Southeast Asia B2B-tech market expansion** — Tin Men Capital is a major Singapore regional B2B-tech VC. **Note**: Tin Men is not ANZ-focused, so engagement is best for AU founders explicitly building SEA B2B-tech operations.',
  meta_title = 'Tin Men Capital — Singapore B2B Tech SE Asia VC | Series A/B | NOT ANZ-Focused',
  meta_description = 'Singapore B2B tech VC. SE Asia focus only. Series A/B. Not ANZ-focused.',
  details = jsonb_build_object(
    'investment_thesis','B2B technology — SE Asia only (not ANZ-focused).',
    'note','For AU founders, only relevant if explicitly expanding to SE Asia.'
  ),
  updated_at = now()
WHERE name = 'Tin Men Capital';

UPDATE investors SET
  basic_info = 'TORUS is a **global early-stage investment community** with **300+ accelerators and VCs in its network**. The team is **behind Cake** (equity-management software with 10,000+ customers — also covered separately as Cake Equity-network).

**20+ startup investments to date** alongside major ANZ VCs including **Blackbird, Airtree and TEN13**.

Stage focus: **early stage**. Sector mandate: agnostic technology.

Note: This entry represents the global TORUS investment community — separately from PB Ventures / TORUS Fund Zero (Gold Coast B2B SaaS syndicate, also covered).',
  why_work_with_us = 'For global early-stage founders looking for community-network access to 300+ accelerators and VCs — TORUS offers a unique investment-community structure with cross-investment alongside Blackbird, Airtree and TEN13. Especially valuable for cap-table-aware founders given the Cake Equity origin.',
  meta_title = 'TORUS — Global Early-Stage Investment Community | 300+ VCs | Cake Equity Origin',
  meta_description = 'Global early-stage investment community. 300+ accelerators/VCs in network. Cake Equity team. 20+ investments alongside Blackbird, Airtree, TEN13.',
  details = jsonb_build_object(
    'organisation_type','Global early-stage investment community',
    'network','300+ accelerators / VCs',
    'origin','Team behind Cake (equity management; 10,000+ customers)',
    'co_investors', ARRAY['Blackbird','Airtree','TEN13']
  ),
  updated_at = now()
WHERE name = 'TORUS';

UPDATE investors SET
  basic_info = 'Touch Ventures is the **investment holding company of Afterpay** (now part of **Block**, formerly Square — acquired Afterpay 2022 for ~US$29B).

The firm provides **growth capital to high-growth scalable businesses benefiting from Afterpay''s ecosystem** — making Touch Ventures a strategic-investor cheque for fintech, e-commerce and consumer-tech companies aligned with the BNPL/payments value chain.

Stage focus: **Growth**.',
  why_work_with_us = 'For Australian and global high-growth scalable businesses — particularly in fintech, e-commerce, BNPL-adjacent and consumer-tech categories — Touch Ventures offers strategic-investor capital with deep Afterpay/Block ecosystem alignment. Especially valuable for founders building products that complement BNPL or consumer-payments value chains.',
  meta_title = 'Touch Ventures — Afterpay (Block) Investment Holding Company | Growth Capital',
  meta_description = 'Investment holding company of Afterpay (now Block). Growth capital. High-growth scalable businesses with Afterpay ecosystem fit.',
  details = jsonb_build_object(
    'parent','Afterpay / Block (acquired 2022 ~US$29B)',
    'investment_thesis','Growth capital — high-growth scalable businesses benefiting from Afterpay/Block ecosystem.'
  ),
  updated_at = now()
WHERE name = 'Touch Ventures';

UPDATE investors SET
  basic_info = 'Tripple is an **Australian 100% impact-portfolio fund** — meaning every dollar deployed targets measurable real-world impact rather than blended returns.

The fund operates across both **investments and grants** to solve real-world problems including:
- **Climate justice**
- **Housing**
- **Tax reform**
- **Migration**',
  why_work_with_us = 'For Australian founders building businesses with explicit measurable impact in climate justice, housing, tax reform or migration categories — Tripple offers a 100% impact-portfolio fund with both investment and grant capability. Especially valuable for impact-aligned founders pursuing structured systemic-change capital.',
  meta_title = 'Tripple — Australian 100% Impact Portfolio Fund | Climate / Housing / Tax / Migration',
  meta_description = 'Australian 100% impact portfolio fund. Investments + grants. Climate justice, housing, tax reform, migration.',
  details = jsonb_build_object(
    'distinction','100% impact portfolio fund',
    'instruments', ARRAY['Investments','Grants'],
    'investment_thesis','Climate justice, housing, tax reform, migration.'
  ),
  updated_at = now()
WHERE name = 'Tripple';

UPDATE investors SET
  basic_info = 'UniQuest Extension Fund (UEF) is the **University of Queensland-affiliated AU$32M venture capital fund** — operating from Brisbane, QLD via **UniQuest Pty Ltd** (UQ''s commercialisation company).

The fund focuses on **Pre-Seed, Seed and Follow-on investments** with **20 portfolio companies and 30 total investments**. Sector focus: **Technology — UQ research commercialisation, with AI emphasis**.

**Eligibility requirement**: portfolio companies must have a **UQ Founder link**.',
  why_work_with_us = 'For University of Queensland researchers, alumni or spinout-founders — UniQuest Extension Fund offers AU$32M dedicated UQ-spinout capital across Pre-Seed, Seed and Follow-on rounds. Best leveraged by founders with existing UQ Founder links pursuing structured university-commercialisation pathways.',
  meta_title = 'UniQuest Extension Fund — UQ-Affiliated $32M VC | UQ Founder Link Required',
  meta_description = 'University of Queensland AU$32M fund. UQ research commercialisation. Pre-Seed, Seed, Follow-on. 20 companies / 30 investments.',
  details = jsonb_build_object(
    'parent','UniQuest Pty Ltd (University of Queensland commercialisation company)',
    'fund_size','AU$32M',
    'investment_thesis','UQ research commercialisation; AI emphasis — Pre-Seed, Seed, Follow-on.',
    'eligibility','Requires UQ Founder link',
    'portfolio_size','20 companies; 30 investments'
  ),
  updated_at = now()
WHERE name = 'UniQuest Extension Fund (UEF)';

COMMIT;
