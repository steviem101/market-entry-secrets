-- Enrich VCs — batch 05d (records 96-100: Polipo Ventures → Purpose Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Polipo Ventures is a **Sydney-based growth-stage venture capital firm** focused on **technology companies scaling globally**.

Stage focus: **Growth**.',
  why_work_with_us = 'For Australian growth-stage technology founders pursuing **global scaling** — Polipo Ventures offers Sydney-based growth capital with a clear thesis on globally-ambitious technology companies. Best treated as a referral-led conversation given limited public information.',
  meta_title = 'Polipo Ventures — Sydney Growth-Stage Tech VC | Global Scale',
  meta_description = 'Sydney growth-stage VC. Technology companies scaling globally.',
  details = jsonb_build_object(
    'investment_thesis','Technology — growth stage; global scale.'
  ),
  updated_at = now()
WHERE name = 'Polipo Ventures';

UPDATE investors SET
  basic_info = 'Possible Ventures is a **global pre-seed/seed deep-tech venture capital firm** with **200+ investments** to date. The firm is **founded by Chris Hitchen** and has European + Australian operating presence.

Sector focus: **Deep tech, life sciences, climate / energy / health / society**. Stage focus: **Pre-Seed and Seed**.

The breadth of the 200+ portfolio makes Possible Ventures one of the most-active early-stage deep-tech VCs globally.',
  why_work_with_us = 'For Australian and global deep-tech, life-sciences, climate, energy, health and society founders at pre-seed through seed — Possible Ventures offers global multi-continent reach plus 200+ portfolio depth. Especially valuable for technically ambitious founders pursuing structured European or global capital.',
  meta_title = 'Possible Ventures — Global Pre-Seed / Seed Deep-Tech VC | 200+ Investments',
  meta_description = 'Global pre-seed/seed deep-tech VC. 200+ investments. Climate, energy, health, society. Founded by Chris Hitchen.',
  details = jsonb_build_object(
    'founder','Chris Hitchen',
    'investment_thesis','Deep tech, life sciences, climate / energy / health / society — pre-seed and seed.',
    'portfolio_size','200+ investments'
  ),
  updated_at = now()
WHERE name = 'Possible Ventures';

UPDATE investors SET
  basic_info = 'Prosus Ventures is the **global venture capital arm of Prosus** (controlled by **Naspers** — the South African media/tech conglomerate).

The **SE Asia / ANZ team** is led by **Sachin Bhanot**.

**FY25 deployment: US$400M+ across 40+ transactions** — making Prosus Ventures one of the most-active global VCs with a strong AI and technology thesis.

Stage focus: **early stage to growth**.',
  why_work_with_us = 'For Australian and Asia-Pacific AI and technology founders pursuing global Series-stage capital — Prosus Ventures offers exceptional global VC reach with US$400M+ FY25 deployment scale. Especially valuable for AI-native and globally-scaling technology founders pursuing institutional-grade global capital.',
  meta_title = 'Prosus Ventures — Naspers Global VC | US$400M+ FY25 | 40+ Transactions',
  meta_description = 'Global VC arm of Prosus (Naspers). SE Asia/ANZ led by Sachin Bhanot. FY25: US$400M+, 40+ transactions. AI focus.',
  details = jsonb_build_object(
    'parent','Prosus / Naspers',
    'sea_anz_lead','Sachin Bhanot',
    'fy25_deployment','US$400M+ across 40+ transactions',
    'investment_thesis','AI and technology — early stage to growth.'
  ),
  updated_at = now()
WHERE name = 'Prosus Ventures';

UPDATE investors SET
  basic_info = 'Proto Axiom is an **Australian biotech company-creation platform** with **AU$45M AUM**.

The firm operates a hybrid model — **combining incubation and later-stage investment** for biotech ventures from concept through to commercial-trial stages. Stage focus: **Pre-Seed to Late stage**.',
  why_work_with_us = 'For Australian biotech and life-sciences founders pursuing structured company-creation partnerships — Proto Axiom offers AU$45M AUM with an integrated incubation + later-stage investment model. Especially valuable for early-concept biotech founders looking for both technical incubation and follow-on capital.',
  meta_title = 'Proto Axiom — Australian Biotech Company-Creation Platform | AU$45M AUM',
  meta_description = 'Australian biotech company-creation platform. AU$45M AUM. Incubation + later-stage investment.',
  details = jsonb_build_object(
    'organisation_type','Biotech company-creation platform',
    'aum','AU$45M',
    'investment_thesis','Biotech — pre-seed to late stage; combines incubation + later-stage investment.'
  ),
  updated_at = now()
WHERE name = 'Proto Axiom';

UPDATE investors SET
  basic_info = 'Purpose Ventures is a **Perth-based venture capital firm** (Subiaco, WA — Level 1, 131-135 Rokeby Rd). The firm operates an **AU$55M fund** with a **strong WA focus (70-80% capital deployed in Western Australia)** while remaining open to national deals.

Stage focus: **Pre-Seed to Series B**. Industry mandate is **agnostic** with implicit focus on **healthcare, education, cleantech, agriculture and mining-aligned tech** (categories aligned with WA''s economic strengths).',
  why_work_with_us = 'For Western Australian — and especially Perth-based — founders across healthcare, education, cleantech, agriculture and mining-tech categories — Purpose Ventures is one of the most-capitalised WA-anchored VCs. AU$55M fund with 70-80% WA-focused deployment makes Purpose particularly valuable for WA-rooted founders pursuing structured pre-seed through Series B capital.',
  meta_title = 'Purpose Ventures — Perth WA VC | AU$55M Fund | 70-80% WA Focus | Pre-Seed to Series B',
  meta_description = 'Perth WA VC. AU$55M fund. 70-80% WA focus (also national). Industry-agnostic. Pre-Seed to Series B.',
  details = jsonb_build_object(
    'fund_size','AU$55M',
    'investment_thesis','Industry-agnostic — healthcare, education, cleantech, agriculture, mining bias.',
    'stages','Pre-Seed to Series B',
    'wa_focus','70-80% capital deployed in WA'
  ),
  updated_at = now()
WHERE name = 'Purpose Ventures';

COMMIT;
