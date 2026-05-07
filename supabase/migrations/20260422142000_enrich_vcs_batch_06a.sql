-- Enrich VCs — batch 06a (records 101-105: QIC Ventures → ReGen Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'QIC Ventures is the **venture-investment arm of Queensland Investment Corporation (QIC)** — Queensland''s state-owned institutional investment manager.

The firm operates two key vehicles:
- **Enterprise Acceleration Fund** — AU$24M; AU$500k–$2.5M per company; QLD-focused
- **Queensland Venture Capital Development Fund (QVCDF)** — AU$130M

**Track record:** **AU$114.8M invested in 65 Queensland businesses**.

Sector focus: Technology — with implicit emphasis on B2B SaaS, space, clean energy, cybersecurity, defence, agrifood and health categories aligned with Queensland''s economic strengths. Stage focus: **Seed to Growth**.',
  why_work_with_us = 'For Queensland-based founders across B2B SaaS, space, clean energy, cybersecurity, defence, agrifood and health categories — QIC Ventures is **Queensland''s most-capitalised state-government VC** with two distinct vehicles totalling AU$154M+ deployable capital and AU$114.8M deployed across 65 QLD businesses. Especially valuable for QLD-based founders pursuing structured Government-aligned commercialisation.',
  meta_title = 'QIC Ventures — QLD Government VC | $24M Enterprise Acceleration + $130M QVCDF',
  meta_description = 'Brisbane QLD Government VC. AU$24M EAF ($500k–$2.5M) + AU$130M QVCDF. AU$114.8M deployed in 65 QLD businesses.',
  details = jsonb_build_object(
    'parent','Queensland Investment Corporation (QIC)',
    'funds', jsonb_build_array(
      jsonb_build_object('name','Enterprise Acceleration Fund','size','AU$24M','check','AU$500k–$2.5M','focus','QLD'),
      jsonb_build_object('name','Queensland Venture Capital Development Fund (QVCDF)','size','AU$130M')
    ),
    'track_record','AU$114.8M invested in 65 QLD businesses',
    'investment_thesis','Technology — QLD-focused; B2B SaaS, space, clean energy, cybersecurity, defence, agrifood, health.'
  ),
  updated_at = now()
WHERE name = 'QIC Ventures';

UPDATE investors SET
  basic_info = 'Qualgro VC is a **Singapore-based venture capital firm** focused on **B2B SaaS, data and AI** at **Series A and Series B** stages. The firm invests across Southeast Asia, Australia and New Zealand.',
  why_work_with_us = 'For Australian and New Zealand B2B SaaS, data and AI founders pursuing **regional Asia-Pacific expansion** at Series A through Series B — Qualgro VC offers a Singapore-based regional growth-capital cheque with structured SE Asia + ANZ deal-flow.',
  meta_title = 'Qualgro VC — Singapore B2B SaaS / Data / AI VC | Series A/B | SE Asia + ANZ',
  meta_description = 'Singapore B2B SaaS, data and AI VC. Series A/B. SE Asia, Australia, New Zealand.',
  details = jsonb_build_object(
    'investment_thesis','B2B SaaS, data and AI — Series A and Series B; SE Asia + ANZ.'
  ),
  updated_at = now()
WHERE name = 'Qualgro VC';

UPDATE investors SET
  basic_info = 'Rampersand is an **ANZ inception-to-seed venture capital firm** that backs founders from the earliest stage using a **community-powered model**. Investment focus: pre-seed and seed Australian and New Zealand technology founders.

**Nicole Kleid Small** (covered in this directory as Melbourne angel; Start Small Ventures founder) was previously **Investment Director at Rampersand for 4 years** — a notable connection across the ANZ early-stage angel/VC community.',
  why_work_with_us = 'For Australian and New Zealand pre-seed and seed-stage technology founders — Rampersand offers one of the most-established ANZ inception-to-seed VCs with a community-powered model and notable alumni network.',
  meta_title = 'Rampersand — ANZ Inception-to-Seed VC | Community-Powered',
  meta_description = 'ANZ inception-to-seed VC. Community-powered. AU/NZ pre-seed/seed.',
  details = jsonb_build_object(
    'investment_thesis','Inception-to-seed ANZ — community-powered model.',
    'related_individuals', ARRAY['Nicole Kleid Small (former Investment Director, 4 years)']
  ),
  updated_at = now()
WHERE name = 'Rampersand';

UPDATE investors SET
  basic_info = 'REACH ANZ is a **PropTech accelerator and investment fund** focused on **Australia and New Zealand real-estate technology**.

Investment is **by application only** — meaning founders apply through a structured intake process for both accelerator participation and investment consideration.',
  why_work_with_us = 'For Australian and New Zealand PropTech / real-estate-technology founders — REACH ANZ offers a sector-pure accelerator + investment pathway with structured by-application intake. Especially valuable for proptech founders pursuing structured industry-aligned commercialisation.',
  meta_title = 'REACH ANZ — Australian PropTech Accelerator + Investment Fund',
  meta_description = 'PropTech accelerator + investment fund. ANZ real-estate technology. By application only.',
  details = jsonb_build_object(
    'organisation_type','PropTech accelerator + investment fund',
    'investment_thesis','ANZ PropTech / real-estate technology.',
    'application_process','By application only.'
  ),
  updated_at = now()
WHERE name = 'REACH ANZ';

UPDATE investors SET
  basic_info = 'ReGen Ventures is an **early-stage cleantech and regenerative-economy venture capital firm**.

The firm invests in technology supporting the transition to a regenerative economy — covering circular-economy, sustainable-agriculture, climate-tech and adjacent categories.',
  why_work_with_us = 'For Australian cleantech and regenerative-economy founders at the early stage — ReGen Ventures offers a sector-pure regenerative-economy thesis covering circular-economy, sustainable-agriculture and climate-aligned categories.',
  meta_title = 'ReGen Ventures — Australian Early-Stage Cleantech / Regenerative Economy VC',
  meta_description = 'Australian early-stage cleantech and regenerative-economy VC.',
  details = jsonb_build_object(
    'investment_thesis','Cleantech and regenerative economy — early stage.'
  ),
  updated_at = now()
WHERE name = 'ReGen Ventures';

COMMIT;
