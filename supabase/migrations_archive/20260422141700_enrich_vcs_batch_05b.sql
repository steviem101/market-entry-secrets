-- Enrich VCs — batch 05b (records 86-90: Mothership VC → Oscar Capital)

BEGIN;

UPDATE investors SET
  basic_info = 'Mothership VC is an **Australian seed-stage venture capital fund and growth accelerator**.

The firm was **founded by post-exit entrepreneurs, marketers, and operators** — bringing operator-aligned founder-support model alongside seed-stage capital. Sector mandate is technology-agnostic.',
  why_work_with_us = 'For Australian seed-stage technology founders looking for operator-led capital plus structured growth-accelerator support — Mothership VC offers a combined fund + accelerator pathway from post-exit founder partners.',
  meta_title = 'Mothership VC — Australian Seed Fund + Growth Accelerator',
  meta_description = 'Australian seed-stage VC fund + growth accelerator. Founded by post-exit entrepreneurs/operators.',
  details = jsonb_build_object(
    'organisation_type','VC fund + growth accelerator',
    'investment_thesis','Sector-agnostic technology — seed stage.',
    'partners','Post-exit entrepreneurs, marketers, operators'
  ),
  updated_at = now()
WHERE name = 'Mothership VC';

UPDATE investors SET
  basic_info = 'NextGen Ventures is a **Melbourne-based angel/pre-seed fund** focused exclusively on **student founders** — making it one of Australia''s most distinctive sector-pure mandates.

**Fund I: AU$4M** raised from **71 LPs** in **2025** — exceeding the AU$2.5M target. Cheque size: **AU$50k–$100k**.

The fund is sector-agnostic across student-founder ventures.',
  why_work_with_us = 'For Australian university-student founders building startups — NextGen Ventures offers a sector-pure student-founder cheque ($50k–$100k) from a fund with 71 LPs and AU$4M Fund I capital. Especially valuable for first-time university founders with limited existing investor networks.',
  meta_title = 'NextGen Ventures — Melbourne Student-Founder Pre-Seed | Fund I AU$4M | $50k–$100k',
  meta_description = 'Melbourne student-founder angel/pre-seed fund. Fund I AU$4M (71 LPs, 2025). $50k–$100k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Student-founder startups — sector-agnostic.',
    'fund_i','AU$4M Fund I (71 LPs; raised 2025; exceeded AU$2.5M target)',
    'check_size_note','AU$50k–$100k'
  ),
  updated_at = now()
WHERE name = 'NextGen Ventures';

UPDATE investors SET
  basic_info = 'NZ Growth Capital Partners is **New Zealand''s government-backed growth-capital fund manager**, operating two distinct vehicles:
- **Aspire Fund** — seed/angel investments in NZ
- **Elevate Fund** — **NZD$300M fund-of-funds** for NZ Series A/B

Headquartered in **Auckland (Level 9, Suite 4, 125 Queen Street)**.

Sector focus: **NZ technology**. Stage focus: **Seed to Series B**.',
  why_work_with_us = 'For New Zealand technology founders at seed through Series B — NZ Growth Capital Partners is the **most-capitalised NZ Government-backed venture vehicle** with NZD$300M Elevate Fund + Aspire Fund seed pipeline. Especially valuable for NZ founders pursuing structured Government-aligned growth capital.',
  meta_title = 'NZ Growth Capital Partners — NZ Government VC | $300M Elevate Fund | Aspire + Elevate',
  meta_description = 'Auckland NZ Government-backed VC. Aspire Fund (seed/angel) + Elevate Fund (NZD$300M Series A/B fund-of-funds).',
  details = jsonb_build_object(
    'organisation_type','NZ Government-backed growth-capital fund manager',
    'funds', jsonb_build_array(
      jsonb_build_object('name','Aspire Fund','focus','Seed/angel NZ'),
      jsonb_build_object('name','Elevate Fund','size','NZD$300M','focus','Series A/B NZ — fund of funds')
    ),
    'investment_thesis','NZ technology — seed to Series B.'
  ),
  updated_at = now()
WHERE name = 'NZ Growth Capital Partners';

UPDATE investors SET
  basic_info = 'OIF Ventures is a **Canberra, ACT-based early-stage venture capital firm** investing in **Australian deep technology, defence, and national-security startups**.

Sector focus: **Data Infrastructure and Analytics, Space Research and Technology** (with broader deep-tech / defence / sovereign-capability bias). Stage focus: **Seed and Series A**. Cheque size: **AU$500k–$5M**.

Notable portfolio includes:
- **DroneShield** (Australian counter-drone defence — ASX-listed)
- **Xailient** (computer-vision AI for edge devices)
- **QuantX Labs** (quantum-tech / atomic clocks)',
  why_work_with_us = 'For Australian deep-tech, defence, national-security, space and sovereign-capability founders at seed through Series A — OIF Ventures offers a Canberra-anchored cheque ($500k–$5M) with deep federal-government and defence-network depth (DroneShield, QuantX Labs portfolio signals).',
  meta_title = 'OIF Ventures — Canberra Deep-Tech / Defence / National Security VC | $500k–$5M',
  meta_description = 'Canberra deep-tech / defence / national-security VC. DroneShield, Xailient, QuantX Labs. $500k–$5M.',
  details = jsonb_build_object(
    'investment_thesis','Australian deep technology, defence, national security — Seed and Series A.',
    'check_size_note','AU$500k–$5M'
  ),
  updated_at = now()
WHERE name = 'OIF Ventures';

UPDATE investors SET
  basic_info = 'Oscar Capital is a **North Sydney-based Australian family office** (100 Mount St). The firm invests across **multi-asset classes** — equities, venture capital, alternatives and private credit.

**IMPORTANT**: Oscar Capital is a **family office** rather than a traditional venture capital fund. Engagement is best treated as a referral-led conversation.',
  why_work_with_us = 'For Australian founders or fund managers pursuing structured family-office-backed capital — Oscar Capital offers diversified multi-asset investing including a venture capital allocation. Note: Not a traditional VC; primary mandate is multi-asset family-office investing.',
  meta_title = 'Oscar Capital — North Sydney Family Office | Multi-Asset (Equities / VC / Alternatives / Credit)',
  meta_description = 'North Sydney family office. Multi-asset class — equities, VC, alternatives, private credit.',
  details = jsonb_build_object(
    'organisation_type','Family office',
    'is_traditional_vc',false,
    'investment_thesis','Multi-asset class — equities, venture capital, alternatives, private credit.'
  ),
  updated_at = now()
WHERE name = 'Oscar Capital';

COMMIT;
