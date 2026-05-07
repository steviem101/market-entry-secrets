-- Enrich VCs — batch 07a (records 121-125: Southern Cross Venture Partners → Steamworks Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Southern Cross Venture Partners is a **Sydney-based venture capital firm** established in **2006**. Sector focus: **Technology** with a notable specialisation in **renewable energy** via the **REVC Fund**.

**REVC Fund**: AU$120M renewable-energy fund backed by **ARENA (Australian Renewable Energy Agency) and SoftBank China**. The firm also operates the **IIF Fund**.

**Team**: Bob Christiansen, John Scull, Mark Bonnar, Jonathan Whitehouse — bringing decades of Australian VC operating experience.

Stage focus: **Early Growth stage**.',
  why_work_with_us = 'For Australian renewable-energy and growth-stage technology founders — Southern Cross Venture Partners offers AU$120M REVC Fund (ARENA + SoftBank China backed) plus 18+ years of operating depth (since 2006). Especially valuable for renewable-energy founders pursuing structured growth-stage capital with cross-border China LP exposure.',
  meta_title = 'Southern Cross Venture Partners — Sydney Tech / Renewable Energy VC since 2006 | $120M REVC Fund',
  meta_description = 'Sydney VC since 2006. AU$120M REVC Fund (ARENA + SoftBank China). Tech + renewable energy. Early growth.',
  details = jsonb_build_object(
    'founded',2006,
    'team', ARRAY['Bob Christiansen','John Scull','Mark Bonnar','Jonathan Whitehouse'],
    'funds', jsonb_build_array(
      jsonb_build_object('name','REVC Fund','size','AU$120M','backers', ARRAY['ARENA','SoftBank China']),
      jsonb_build_object('name','IIF Fund','focus','Innovation Investment Fund')
    ),
    'investment_thesis','Technology + renewable energy — early growth stage.'
  ),
  updated_at = now()
WHERE name = 'Southern Cross Venture Partners';

UPDATE investors SET
  basic_info = 'Sprint Ventures is a **multi-city venture capital firm** with offices in **Brisbane (primary), Sydney and Melbourne**. The firm invests at **early and growth stages**.

**Sprint Fund III** focuses on **AI, Health, Aged Care, Climate, Infrastructure and Water** — a thematic sector mix aligned with Australia''s critical-infrastructure and demographic-trend categories. The fund operates in **partnership with QIC (Queensland Investment Corporation)**.',
  why_work_with_us = 'For Australian founders building AI, health, aged-care, climate, infrastructure or water-tech products — Sprint Ventures offers a multi-city VC presence (Brisbane, Sydney, Melbourne) plus QIC partnership for institutional-grade capital. Especially valuable for QLD-based founders or those pursuing structured Government-aligned thematic capital.',
  meta_title = 'Sprint Ventures — Brisbane/Sydney/Melbourne VC | Fund III | AI / Health / Climate / Infrastructure',
  meta_description = 'Brisbane, Sydney, Melbourne VC. Sprint Fund III. AI, Health, Aged Care, Climate, Infrastructure, Water. QIC partnership.',
  details = jsonb_build_object(
    'investment_thesis','AI, Health, Aged Care, Climate, Infrastructure, Water.',
    'fund_iii','Sprint Fund III with QIC partnership',
    'global_offices', ARRAY['Brisbane (primary)','Sydney','Melbourne']
  ),
  updated_at = now()
WHERE name = 'Sprint Ventures';

UPDATE investors SET
  basic_info = 'Square Peg Capital is **one of Australia''s most prominent global venture capital firms** investing in **transformative technology companies across Australia, Israel and Southeast Asia**.

Headquartered in Melbourne, Square Peg operates Series A through Growth-stage investments with cheques of **AU$5M–$50M**.

The firm''s portfolio reads as a who''s-who of globally-significant tech companies:
- **Fiverr** (NYSE: FVRR — global freelancer marketplace)
- **Stripe (AU)** (Australian ops of global payments giant)
- **Rokt** (e-commerce / advertising)
- **Airwallex** (Australian global payments unicorn)

Sector focus: **Capital Markets, E-Learning Providers, Internet Marketplace Platforms and Software Development**. Stage focus: **Series A, Series B and Growth**.',
  why_work_with_us = 'For Australian, Israeli and Southeast Asian technology founders building globally-transformative companies — Square Peg Capital is one of the most-credentialed global VCs in the ANZ market. AU$5M–$50M cheques + Fiverr/Stripe/Rokt/Airwallex portfolio + multi-continent reach (AU/Israel/SEA) make Square Peg a top-tier Series A through Growth partner.',
  meta_title = 'Square Peg Capital — Melbourne Global VC | $5M–$50M | Fiverr, Stripe, Rokt, Airwallex',
  meta_description = 'Melbourne global VC. AU/Israel/SE Asia. Fiverr, Stripe, Rokt, Airwallex. Series A to Growth. $5M–$50M.',
  details = jsonb_build_object(
    'investment_thesis','Transformative technology companies — AU, Israel, SE Asia.',
    'check_size_note','AU$5M–$50M',
    'global_offices', ARRAY['Melbourne (HQ)','Israel','Southeast Asia'],
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Fiverr','context','NYSE: FVRR — global freelancer marketplace'),
      jsonb_build_object('company','Stripe (AU)','context','Australian ops of global payments giant'),
      jsonb_build_object('company','Rokt','context','E-commerce / advertising'),
      jsonb_build_object('company','Airwallex','context','Australian global payments unicorn')
    )
  ),
  updated_at = now()
WHERE name = 'Square Peg Capital';

UPDATE investors SET
  basic_info = 'Starfish Ventures is a **Melbourne-based venture capital firm** managing **AU$400M+ across IT, life sciences and cleantech** — three sectors where Starfish has built deep specialisation.

The firm operates **three principal funds**:
- **Fund I**: AU$138M
- **Fund II**: AU$185M
- **Fund III**: (active fund)

Stage focus: **Series A through Series C**.

Notable portfolio includes:
- **Aktana** (life sciences AI / pharma commercial intelligence)',
  why_work_with_us = 'For Australian IT, life-sciences and cleantech founders at Series A through Series C — Starfish Ventures offers AU$400M+ FUM across three principal funds plus multi-decade operating depth. Especially valuable for sector-specialist founders (life sciences, cleantech) pursuing structured Series-stage capital.',
  meta_title = 'Starfish Ventures — Melbourne IT / Life Sciences / Cleantech VC | $400M+ FUM',
  meta_description = 'Melbourne VC. AU$400M+ across IT, life sciences, cleantech. Fund I $138M, Fund II $185M, Fund III. Series A–C.',
  details = jsonb_build_object(
    'fum','AU$400M+',
    'funds', jsonb_build_array(
      jsonb_build_object('name','Fund I','size','AU$138M'),
      jsonb_build_object('name','Fund II','size','AU$185M'),
      jsonb_build_object('name','Fund III')
    ),
    'investment_thesis','IT, life sciences, cleantech — Series A through Series C.'
  ),
  updated_at = now()
WHERE name = 'Starfish Ventures';

UPDATE investors SET
  basic_info = 'Steamworks Ventures is an **Australian venture capital fund**. Limited public information available — the firm''s website is currently unavailable.',
  why_work_with_us = 'For Australian founders looking for structured private-capital partnerships — Steamworks Ventures is best treated as a referral-led conversation given limited public visibility.',
  meta_title = 'Steamworks Ventures — Australian VC Fund | Limited Public Information',
  meta_description = 'Australian VC fund. Website unavailable. Limited public information.',
  details = jsonb_build_object(
    'unverified', ARRAY['Website unavailable; limited public information.']
  ),
  updated_at = now()
WHERE name = 'Steamworks Ventures';

COMMIT;
