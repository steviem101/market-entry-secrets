-- Enrich VCs — batch 04c (records 71-75: Landran Ventures → Mai Capital)

BEGIN;

UPDATE investors SET
  basic_info = 'Landran Ventures is a **Queensland-based venture capital firm** focused on **healthcare, sports tech, hospitality tech and DTC brands**. The fund has a stated **focus on female-led businesses**.

Stage focus: **Seed to Series A**. Cheque size: **AU$500k–$3M**.',
  why_work_with_us = 'For Queensland and Australian founders — and especially **female-led founders** — building healthcare, sports-tech, hospitality-tech or DTC consumer brands at seed through Series A — Landran Ventures offers a $500k–$3M cheque with explicit gender-lens / diversity-aligned thesis.',
  meta_title = 'Landran Ventures — QLD Healthcare / Sports / Hospitality / DTC VC | Female-Led Focus | $500k–$3M',
  meta_description = 'QLD VC. Healthcare, sports tech, hospitality tech, DTC brands. Female-led focus. Seed to Series A. $500k–$3M.',
  details = jsonb_build_object(
    'investment_thesis','Healthcare, Sports Tech, Hospitality Tech, DTC Brands — female-led focus.',
    'check_size_note','AU$500k–$3M'
  ),
  updated_at = now()
WHERE name = 'Landran Ventures';

UPDATE investors SET
  basic_info = 'Light Warrior Group is the **Sali family office** — Australian private investment group operating across **public and private markets, property, and operating businesses**.

**IMPORTANT**: Light Warrior Group is a **family office** rather than a traditional venture capital fund. Engagement is best treated as a referral-led conversation.',
  why_work_with_us = 'For Australian founders pursuing structured family-office-backed capital — Light Warrior Group (the Sali family office) offers diversified multi-asset investing across public, private, property and operating-business positions. **Note**: Not a traditional VC; long-horizon family-office investing approach.',
  meta_title = 'Light Warrior Group — Sali Family Office | Multi-Asset | NOT Traditional VC',
  meta_description = 'Sali family office. Public/private markets, property, operating businesses. Not a traditional VC.',
  details = jsonb_build_object(
    'organisation_type','Family office',
    'family','Sali family',
    'is_traditional_vc',false,
    'investment_thesis','Multi-asset — public/private markets, property, operating businesses.'
  ),
  updated_at = now()
WHERE name = 'Light Warrior Group';

UPDATE investors SET
  basic_info = 'Macdoch Ventures is a **Sydney-based venture capital firm** founded **2011** investing in **SaaS, marketplaces and tech infrastructure** at **Pre-Seed, Seed and Series A** stages with **ANZ focus**.

**Sweetspot cheque size: AU$500k.** Cheque size minimum: AU$150k.

The firm has been operating across the ANZ early-stage ecosystem for 14+ years.',
  why_work_with_us = 'For Australian and New Zealand technology founders building SaaS, marketplaces or tech infrastructure at pre-seed through Series A — Macdoch Ventures offers 14+ years of operating depth with a clear $500k sweetspot cheque and ANZ-focused thesis.',
  meta_title = 'Macdoch Ventures — Sydney ANZ SaaS / Marketplace / Infra VC since 2011 | $500k Sweetspot',
  meta_description = 'Sydney VC since 2011. SaaS, marketplaces, tech infrastructure. ANZ. Pre-Seed to Series A. $500k sweetspot.',
  details = jsonb_build_object(
    'founded',2011,
    'investment_thesis','SaaS, marketplaces, tech infrastructure — Pre-Seed to Series A; ANZ focus.',
    'check_size_note','$500k sweetspot; from $150k'
  ),
  updated_at = now()
WHERE name = 'Macdoch Ventures';

UPDATE investors SET
  basic_info = 'Macquarie Group operates the **Macquarie Capital Venture Studio** — the venture-investment arm of one of Australia''s largest financial-services groups. The studio has made **53 total investments (36 realised, 17 current)**.

Sector focus: **Cybersecurity, Compliance, RegTech, AI and Food Tech** — categories aligned with Macquarie''s broader institutional and infrastructure-investment thesis.

The studio operates across stages and is **not a traditional fixed-fund-cycle VC** — investments are made on a deal-by-deal basis from Macquarie''s balance sheet and selected vehicles.',
  why_work_with_us = 'For Australian founders building **cybersecurity, compliance, RegTech, AI or food-tech** products that align with Macquarie Group''s institutional / infrastructure thesis — the Macquarie Capital Venture Studio offers strategic-investor cheques with deep institutional-financial-services network access.',
  meta_title = 'Macquarie Group — Capital Venture Studio | Cybersecurity / RegTech / AI / Food Tech',
  meta_description = 'Macquarie Capital Venture Studio. 53 total investments. Cybersecurity, Compliance, RegTech, AI, Food Tech.',
  details = jsonb_build_object(
    'organisation_type','Strategic-investor / corporate venture studio',
    'parent','Macquarie Group',
    'investment_thesis','Cybersecurity, Compliance, RegTech, AI, Food Tech.',
    'portfolio_size','53 total (36 realised, 17 current)'
  ),
  updated_at = now()
WHERE name = 'Macquarie Group';

UPDATE investors SET
  basic_info = 'Mai Capital is a **Melbourne-based boutique fund-management firm** established **2015**. The firm offers **real-estate managed pooled funds, corporate advisory and high-net-worth services** with **AU$298M FUM**.

Sector focus: **Real estate and diversified investments**. Stage focus: **Growth**.

**IMPORTANT**: Mai Capital is **primarily a real-estate-and-diversified-fund manager** — venture-style early-stage investment is not its primary mandate.',
  why_work_with_us = 'For founders or partners pursuing real-estate-aligned diversified growth-capital partnerships — Mai Capital offers AU$298M FUM scale with corporate-advisory and HNW-services capability. **Note**: Mai is primarily a real-estate / diversified-fund manager rather than a tech-VC; engagement is best treated as a structured-fund or advisory conversation.',
  meta_title = 'Mai Capital — Melbourne Boutique Fund Manager | $298M FUM | Real-Estate / Diversified',
  meta_description = 'Melbourne boutique fund manager since 2015. $298M FUM. Real-estate pooled funds, advisory, HNW services.',
  details = jsonb_build_object(
    'founded',2015,
    'fum','AU$298M',
    'investment_thesis','Real estate and diversified investments — growth stage.',
    'note','Primarily a real-estate / diversified-fund manager rather than a tech-VC.'
  ),
  updated_at = now()
WHERE name = 'Mai Capital';

COMMIT;
