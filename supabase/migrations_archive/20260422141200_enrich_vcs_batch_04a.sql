-- Enrich VCs — batch 04a (records 61-65: INP Capital → January Capital)

BEGIN;

UPDATE investors SET
  basic_info = 'INP Capital is a **global venture capital firm** investing from **early-stage through to pre-IPO** stages. Headquartered in Canada with an Australian office in **North Sydney (L32, 101 Miller St)**.

The fund has **22+ portfolio companies including 3 unicorns**, demonstrating strong cross-border deal-flow and exit performance.',
  why_work_with_us = 'For Australian and global technology founders pursuing growth-stage capital from a multi-stage fund — INP Capital offers Canadian-rooted multi-continent VC reach with active Australian deal-flow participation. Especially valuable for founders pursuing US/Canadian market expansion or pre-IPO rounds.',
  meta_title = 'INP Capital — Global VC | Canada/AU | Early-Stage to Pre-IPO | 3 Unicorns',
  meta_description = 'Global VC. Canada HQ + AU office (North Sydney). Early-stage to pre-IPO. 22+ portfolio incl. 3 unicorns.',
  details = jsonb_build_object(
    'organisation_type','Global venture capital firm',
    'investment_thesis','Technology — early-stage through to pre-IPO; multi-continent.',
    'global_offices', ARRAY['Canada (HQ)','North Sydney NSW (AU office)'],
    'portfolio_size','22+ companies including 3 unicorns'
  ),
  updated_at = now()
WHERE name = 'INP Capital';

UPDATE investors SET
  basic_info = 'Intervalley Ventures is an **Australian ESVCLP fund** focused on **early-stage Australian technology companies with bridges to the Japanese market**.

The firm operates an **AI^Human LP fund** model with **80%+ of capital deployed in Australia** and a focus on cross-border AU-Japan opportunities.',
  why_work_with_us = 'For Australian early-stage technology founders pursuing **Japanese market expansion** or with Japan-relevant business models — Intervalley Ventures offers ESVCLP-structured AU-Japan bridge capital. Especially valuable for founders with Japanese co-founders, customers, or supply-chain partners.',
  meta_title = 'Intervalley Ventures — AU ESVCLP | Australia–Japan Bridge | AI^Human LP',
  meta_description = 'Australian ESVCLP fund. Early-stage AU tech with Japan bridge. AI^Human LP model. 80%+ capital in AU.',
  details = jsonb_build_object(
    'organisation_type','ESVCLP fund',
    'investment_thesis','Early-stage AU tech with bridge to Japanese market.',
    'fund_model','AI^Human LP fund',
    'capital_allocation','80%+ in Australia'
  ),
  updated_at = now()
WHERE name = 'Intervalley Ventures';

UPDATE investors SET
  basic_info = 'Investible is an **early-stage Asia-Pacific venture capital firm** with offices in **Sydney (Level 3, 180 George St) and Singapore**. Founded by **Trevor Folsom** (covered separately as legendary Sydney mega-angel) and **Creel Price**.

The firm is **ESVCLP-registered** with **Fund 3 registered July 2025**. **53+ investments** to date.

Investible''s history traces back to Blueprint Management Group (1998-2008; nine-figure exit) — Trevor and Creel''s prior business — and the firm now operates as one of the most-active early-stage VCs in the ANZ-SE-Asia corridor.

Stage focus: **Pre-Seed to Series A**.',
  why_work_with_us = 'For Australian and Asia-Pacific technology founders at pre-seed through Series A — Investible combines Trevor Folsom''s legendary 100+ direct angel-investment track record (incl. seed-stage Canva, Ipsy) with structured ESVCLP-fund deployment, Singapore SE Asia reach, and 53+ portfolio depth.',
  meta_title = 'Investible — Trevor Folsom''s Asia-Pacific VC | ESVCLP | 53+ Investments',
  meta_description = 'Sydney/Singapore Asia-Pacific early-stage VC. Trevor Folsom + Creel Price. ESVCLP Fund 3 (Jul 2025). 53+ investments.',
  details = jsonb_build_object(
    'organisation_type','ESVCLP-registered VC',
    'co_founders', ARRAY['Trevor Folsom (legendary Sydney mega-angel; 100+ direct investments incl. Canva seed)','Creel Price'],
    'global_offices', ARRAY['Sydney (HQ)','Singapore'],
    'fund_3','Registered July 2025',
    'portfolio_size','53+ investments',
    'investment_thesis','Asia-Pacific technology — Pre-Seed to Series A.'
  ),
  updated_at = now()
WHERE name = 'Investible';

UPDATE investors SET
  basic_info = 'IP Group ANZ runs the **Climate Catalyst Fund** — a **growth-stage climate-tech venture capital fund** targeting **AU$150M**, **launched March 2026** with the **Clean Energy Finance Corporation (CEFC)**.

The fund focuses on **hard-to-abate industry decarbonisation** — a critical category for global climate transition (steel, cement, aviation, shipping, heavy industry).

Notable investment: **MGA Thermal** (March 2026) — Australian thermal energy storage scale-up.',
  why_work_with_us = 'For Australian and global climate-tech founders building **hard-to-abate industry decarbonisation** solutions — IP Group ANZ''s CEFC-backed Climate Catalyst Fund offers AU$150M growth-capital pool dedicated specifically to industrial decarbonisation. Especially valuable for capital-intensive industrial-tech ventures (steel, cement, aviation, heavy industry).',
  meta_title = 'IP Group ANZ — Climate Catalyst Fund | AU$150M | CEFC-backed | Industrial Decarbonisation',
  meta_description = 'AU$150M Climate Catalyst Fund (Mar 2026). CEFC-backed. Hard-to-abate industrial decarbonisation. MGA Thermal portfolio.',
  details = jsonb_build_object(
    'fund_size','AU$150M target',
    'launched','March 2026',
    'lp_anchor','Clean Energy Finance Corporation (CEFC)',
    'investment_thesis','Hard-to-abate industry decarbonisation — growth stage.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','MGA Thermal','context','Australian thermal energy storage; March 2026')
    )
  ),
  updated_at = now()
WHERE name = 'IP Group ANZ';

UPDATE investors SET
  basic_info = 'January Capital is an **Asia-Pacific thematic early-stage venture capital firm** with **growth credit** capability.

The firm targets technology investments across **Australia, New Zealand and Southeast Asia** with a thematic-investment approach — taking concentrated positions around specific market themes.

New website launched January 2025 — signalling renewed market positioning.',
  why_work_with_us = 'For Asia-Pacific technology founders pursuing thematic-aligned early-stage capital with growth-credit follow-on capacity — January Capital offers a regional APAC VC cheque with both equity and credit instruments. Especially valuable for founders building category-defining APAC tech platforms.',
  meta_title = 'January Capital — APAC Thematic Early-Stage VC | Equity + Growth Credit',
  meta_description = 'APAC thematic early-stage VC with growth credit. AU, NZ, SE Asia. New website launched Jan 2025.',
  details = jsonb_build_object(
    'investment_thesis','Asia-Pacific thematic technology — early-stage equity + growth credit.',
    'regions', ARRAY['Australia','New Zealand','Southeast Asia']
  ),
  updated_at = now()
WHERE name = 'January Capital';

COMMIT;
