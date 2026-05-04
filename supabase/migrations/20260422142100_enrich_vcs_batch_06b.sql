-- Enrich VCs — batch 06b (records 106-110: Right Click Capital → SecondQuarter Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Right Click Capital is a **Sydney-based ANZ pre-seed/seed venture capital firm**. The firm also manages the **Sydney Seed Fund** — an additional vehicle providing early-stage capital to NSW founders.

Investment focus: **Pre-Seed and Seed** technology across Australia and New Zealand.

Notable portfolio includes:
- **black.ai** (AI / computer vision)
- **Tability** (OKR / goal-tracking SaaS)
- **Nomad Atomics** (quantum sensors / atomic devices)',
  why_work_with_us = 'For Australian and New Zealand pre-seed and seed-stage technology founders — Right Click Capital offers two distinct vehicles (Right Click + Sydney Seed Fund) plus a high-quality early-stage portfolio (black.ai, Tability, Nomad Atomics quantum sensors).',
  meta_title = 'Right Click Capital — Sydney ANZ Pre-Seed/Seed VC | Sydney Seed Fund',
  meta_description = 'ANZ pre-seed/seed VC. Sydney Seed Fund. black.ai, Tability, Nomad Atomics portfolio.',
  details = jsonb_build_object(
    'investment_thesis','ANZ pre-seed/seed technology.',
    'manages', ARRAY['Sydney Seed Fund']
  ),
  updated_at = now()
WHERE name = 'Right Click Capital';

UPDATE investors SET
  basic_info = 'Salus Ventures is a **mission-driven venture capital firm at the intersection of enterprise and national security**, based in Australia.

Sector focus spans **Aerospace/Autonomy, AI/ML, Automation/Advanced Manufacturing, Cybersecurity/Enterprise Software, Defence/National Security and Supply Chain**. Stage focus: **Seed**.

Notable portfolio activity:
- **Biosecurity threat-management platform** (Pre-Seed 2023)
- **Quantum-control software** (Series B 2024)
- **Optics/autonomy decision platform** (Seed 2023)',
  why_work_with_us = 'For Australian dual-use technology founders building products across aerospace/autonomy, AI/ML, advanced manufacturing, cybersecurity, defence, national security and supply chain — Salus Ventures offers a mission-driven, sector-aligned seed cheque with explicit enterprise + national-security thesis.',
  meta_title = 'Salus Ventures — Australian Defence / National Security / Enterprise VC | Seed',
  meta_description = 'AU mission-driven VC. Aerospace, AI/ML, Adv Manufacturing, Cybersecurity, Defence, Supply Chain. Seed.',
  details = jsonb_build_object(
    'investment_thesis','Enterprise + national-security technology — Seed stage.',
    'sectors', ARRAY['Aerospace/Autonomy','AI/ML','Advanced Manufacturing','Cybersecurity/Enterprise Software','Defence/National Security','Supply Chain']
  ),
  updated_at = now()
WHERE name = 'Salus Ventures';

UPDATE investors SET
  basic_info = 'Sapien Ventures is an **Australian venture capital firm** (ABN 1260606938; Authorised Rep of AFSL 238128). The firm focuses on investing in **unicorn-stage companies**.

Limited public information available beyond the directory listing.',
  why_work_with_us = 'For Australian founders pursuing unicorn-stage capital — Sapien Ventures offers a focused unicorn-stage cheque. Best treated as a referral-led conversation given limited public information.',
  meta_title = 'Sapien Ventures — Australian Unicorn-Stage VC',
  meta_description = 'Australian VC. AFSL 238128 authorised rep. Focus on unicorn-stage companies.',
  details = jsonb_build_object(
    'organisation_type','VC (Authorised Rep of AFSL 238128)',
    'abn','1260606938',
    'investment_thesis','Unicorn-stage companies.',
    'unverified', ARRAY['Limited public information available.']
  ),
  updated_at = now()
WHERE name = 'Sapien Ventures';

UPDATE investors SET
  basic_info = 'Scalare Partners is an **Australian early-stage venture capital firm** that also gives **everyday investors access to early-stage startups** — a distinctive retail-investor-aligned approach.

Partners have **built, scaled and sold startups** themselves, bringing operator-aligned investing experience.',
  why_work_with_us = 'For Australian early-stage founders looking for capital with retail-investor accessibility — Scalare Partners offers a structured pathway combining traditional VC investment with retail-investor co-investment opportunity. Especially valuable for founders pursuing community-powered capital narratives.',
  meta_title = 'Scalare Partners — Australian Early-Stage VC | Retail-Investor Accessible',
  meta_description = 'Australian early-stage VC with retail-investor access. Partner-led; built/scaled/sold startups.',
  details = jsonb_build_object(
    'investment_thesis','Early-stage Australian technology.',
    'distinctive','Provides everyday-investor access to early-stage startups.'
  ),
  updated_at = now()
WHERE name = 'Scalare Partners';

UPDATE investors SET
  basic_info = 'SecondQuarter Ventures is **Australia''s first specialist venture capital secondaries fund**. Sydney-based.

The firm provides **liquidity for founders, employees, and investors in growth-stage technology companies** — meaning SecondQuarter buys equity from existing shareholders rather than participating in primary fundraising rounds.

Notable secondary transactions:
- **Canva** (Australian design unicorn)
- **Fleet Space** (Australian satellite networks)
- **Cover Genius** (insurtech)
- **Go1** (corporate learning unicorn)
- **Bare**',
  why_work_with_us = 'For founders, employees and early investors in Australian growth-stage technology companies looking to **realise partial liquidity** — SecondQuarter Ventures is **Australia''s first specialist secondaries fund**, with notable transactions including Canva, Fleet Space, Cover Genius and Go1. Especially valuable for unicorn-grade ANZ scale-ups managing pre-IPO liquidity.',
  meta_title = 'SecondQuarter Ventures — Australia''s First VC Secondaries Fund | Canva / Go1 Liquidity',
  meta_description = 'Sydney Australia''s first VC secondaries fund. Liquidity for growth-tech shareholders. Canva, Fleet Space, Cover Genius, Go1.',
  details = jsonb_build_object(
    'distinction','Australia''s first specialist VC secondaries fund',
    'investment_thesis','Secondary transactions — liquidity for growth-stage tech shareholders.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Canva','context','Design unicorn'),
      jsonb_build_object('company','Go1','context','Corporate learning unicorn'),
      jsonb_build_object('company','Fleet Space','context','Satellite networks'),
      jsonb_build_object('company','Cover Genius','context','Insurtech')
    )
  ),
  updated_at = now()
WHERE name = 'SecondQuarter Ventures';

COMMIT;
