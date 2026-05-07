-- Enrich VCs — batch 03b (records 46-50: Follow [the] Seed → GBS Venture Partners)

BEGIN;

UPDATE investors SET
  basic_info = 'Follow [the] Seed is a **global multi-continent post-seed venture capital firm** with offices in **Australia, USA and Israel**. The firm operates a **data-driven investment approach** and is **ESVCLP-registered in Australia**.

Sector focus: **B2B, B2C and Blockchain** at **Post-Seed and Series A** stages. Australian office in Turramurra, NSW.',
  why_work_with_us = 'For B2B, B2C and blockchain founders at post-seed through Series A — Follow [the] Seed offers a global multi-continent footprint (AU/US/Israel) plus a data-driven investment approach. Especially valuable for Australian founders pursuing US or Israeli market expansion.',
  meta_title = 'Follow [the] Seed — Global Post-Seed VC | AU/US/Israel | Data-Driven',
  meta_description = 'Global post-seed VC. Australia, USA, Israel offices. B2B, B2C, blockchain. ESVCLP-registered AU. Data-driven approach.',
  details = jsonb_build_object(
    'organisation_type','ESVCLP-registered Australian arm of global VC',
    'investment_thesis','B2B, B2C, Blockchain — post-seed and Series A.',
    'global_offices', ARRAY['Australia (Turramurra NSW)','USA','Israel'],
    'approach','Data-driven investment'
  ),
  updated_at = now()
WHERE name = 'Follow [the] Seed';

UPDATE investors SET
  basic_info = 'Full Circle Venture Capital is a **Brisbane-based Series A venture capital firm** focused on **SaaS, eCommerce and FinTech**.

Founded by **Daniel Gavel and Rowan** — Daniel is also founder of **Black Sheep Capital** (covered separately).

Portfolio includes:
- **Sendle** (Australian delivery / parcel-tech)',
  why_work_with_us = 'For Australian SaaS, eCommerce and FinTech founders at Series A — and especially Brisbane/Queensland-based founders — Full Circle Venture Capital offers a focused Series A cheque from Brisbane operators with deep early-stage angel-network depth (Daniel Gavel''s Black Sheep Capital connection).',
  meta_title = 'Full Circle Venture Capital — Brisbane Series A | SaaS / eCommerce / FinTech',
  meta_description = 'Brisbane Series A VC. SaaS, eCommerce, FinTech. Daniel Gavel co-founder. Sendle in portfolio.',
  details = jsonb_build_object(
    'investment_thesis','SaaS, eCommerce, FinTech — Series A.',
    'co_founders', ARRAY['Daniel Gavel (also founder of Black Sheep Capital)','Rowan']
  ),
  updated_at = now()
WHERE name = 'Full Circle Venture Capital';

UPDATE investors SET
  basic_info = 'Galileo Ventures is an **Australian pre-seed and seed venture capital firm** backing **AI, software, hardware and deeptech** founders.

The firm has a distinctive **open-application, no-referral-needed** approach — providing feedback to applicant founders **within a week**. Cheque size: **AU$200k–$500k**.

Portfolio: **20+ investments** to date.',
  why_work_with_us = 'For Australian AI, software, hardware and deeptech founders at pre-seed and seed — Galileo Ventures offers a unique open-application pathway (no warm intro required, decisions within a week) and $200k–$500k cheques. Especially valuable for technical founders without existing VC networks.',
  meta_title = 'Galileo Ventures — Australian Open-Application Pre-Seed/Seed VC | $200k–$500k',
  meta_description = 'Australian pre-seed/seed VC. AI, software, hardware, deeptech. Open applications, no referral needed. Feedback within a week.',
  details = jsonb_build_object(
    'investment_thesis','AI, software, hardware, deeptech — pre-seed and seed.',
    'check_size_note','AU$200k–$500k',
    'application_process','Open applications, no referral needed; feedback within a week.',
    'portfolio_size','20+ investments'
  ),
  updated_at = now()
WHERE name = 'Galileo Ventures';

UPDATE investors SET
  basic_info = 'Gandel Invest is the **Melbourne-based family office of the Gandel family** — **one of Australia''s wealthiest families** (founders of Chadstone Shopping Centre and Gandel Group property/retail empire).

The firm invests **globally in growth-stage and established businesses** with a **diversified investment thesis** — covering technology, real estate, financial services and other categories.',
  why_work_with_us = 'For founders at growth-stage or beyond — across diversified sectors and globally — Gandel Invest offers family-office-backed capital from one of Australia''s most successful retail/property dynasties. Especially valuable for founders pursuing structured private-capital partnerships at scale.',
  meta_title = 'Gandel Invest — Gandel Family Office | Melbourne | Global Growth Diversified',
  meta_description = 'Melbourne Gandel family office (Chadstone, Gandel Group). Global growth-stage diversified investments.',
  details = jsonb_build_object(
    'organisation_type','Family office',
    'family','Gandel family — one of Australia''s wealthiest (Chadstone Shopping Centre, Gandel Group)',
    'investment_thesis','Global diversified — growth-stage and established businesses.'
  ),
  updated_at = now()
WHERE name = 'Gandel Invest';

UPDATE investors SET
  basic_info = 'GBS Venture Partners is a **Melbourne-based life-sciences venture capital firm** founded in **1996** — making it one of Australia''s longest-running specialist life-science funds. Manages **AU$400M+ FUM across 5 funds**.

Specialises in **biotech, medical devices and pharmaceuticals** at **Seed through Series B** stages. Cheque size: **~AU$3.8M typical**.

Portfolio includes notable Australian and global life-sciences companies:
- **Ivantis** (medical devices — glaucoma)
- **Elastagen** (Australian biotech — exited)
- **Moximed** (medical devices)
- **Hatchtech**
- **Spinifex Pharmaceuticals**
- **Peplin** (acquired by LEO Pharma)',
  why_work_with_us = 'For Australian and ANZ life-sciences, biotech, medical-device and pharmaceutical founders at seed through Series B — GBS Venture Partners is one of the longest-running specialist life-science VCs in Australia (since 1996). The AU$400M+ across 5 funds and exit track record (Peplin/LEO Pharma, Elastagen) make GBS especially valuable for founders pursuing structured drug-development or device-commercialisation pathways.',
  meta_title = 'GBS Venture Partners — Melbourne Life-Sciences VC since 1996 | AU$400M+ FUM',
  meta_description = 'Melbourne life-sciences VC since 1996. AU$400M+ across 5 funds. Biotech, medical devices, pharma. Seed–Series B.',
  details = jsonb_build_object(
    'founded',1996,
    'fum','AU$400M+ across 5 funds',
    'investment_thesis','Life sciences — biotech, medical devices, pharmaceuticals.',
    'check_size_note','AU$3.8M typical',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Peplin','context','Acquired by LEO Pharma'),
      jsonb_build_object('company','Elastagen','context','Australian biotech exit')
    )
  ),
  updated_at = now()
WHERE name = 'GBS Venture Partners';

COMMIT;
