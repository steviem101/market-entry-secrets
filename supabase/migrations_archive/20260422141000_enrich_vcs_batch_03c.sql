-- Enrich VCs — batch 03c (records 51-55: Gea Ventures → Gravel Road Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Gea Ventures is an **Australian family-office venture capital vehicle** with an **early-stage sustainability focus**. Limited public information available.',
  why_work_with_us = 'For Australian sustainability-aligned founders at the early stage — Gea Ventures offers family-office-backed capital with a clear sustainability thesis. Best treated as a referral- or warm-intro-led conversation given limited public investor profile.',
  meta_title = 'Gea Ventures — Australian Family Office | Early-Stage Sustainability',
  meta_description = 'Australian family-office VC. Early-stage sustainability focus.',
  details = jsonb_build_object(
    'organisation_type','Family-office VC',
    'investment_thesis','Sustainability — early stage.',
    'unverified', ARRAY['Limited public information available.']
  ),
  updated_at = now()
WHERE name = 'Gea Ventures';

UPDATE investors SET
  basic_info = 'Giant Leap Fund is **Australia''s first venture capital fund dedicated to impact businesses**, founded as part of Impact Investment Group (IIG).

**Fund II** closed at **AU$45M+** in **May 2023** — three times the size of Fund I, making Giant Leap one of the most-active impact-aligned VCs in Australia.

Sweetspot cheque size: **AU$500k**. Stage focus: **Pre-Seed and Seed**. Sector focus: **Impact across Climate, Health and People**.

Portfolio includes:
- **Clean Slate** (climate)
- **FlyORO** (sustainable aviation fuel)
- **Foremind** (mental-health tech)

**Pete Cameron** (covered separately) was a **Venture Partner at Giant Leap Fund I**.',
  why_work_with_us = 'For Australian impact-aligned founders building businesses with measurable social or environmental impact — across climate, health and people categories — Giant Leap Fund is **Australia''s premier impact VC**. AU$45M+ Fund II (3× Fund I) plus 10+ years of operating depth make Giant Leap especially valuable for founders pursuing structured impact-aligned capital.',
  meta_title = 'Giant Leap Fund — Australia''s First Impact VC | $45M+ Fund II | $500k Sweetspot',
  meta_description = 'Australia''s first dedicated impact VC. Fund II AU$45M+ (May 2023). Climate, Health, People. $500k sweetspot.',
  details = jsonb_build_object(
    'distinction','Australia''s first venture capital fund dedicated to impact businesses',
    'investment_thesis','Impact — Climate, Health, People; pre-seed and seed.',
    'check_size_note','AU$500k sweetspot',
    'fund_ii','Fund II AU$45M+ closed May 2023 (3× Fund I)',
    'related_individuals', ARRAY['Pete Cameron (Venture Partner Giant Leap Fund I)']
  ),
  updated_at = now()
WHERE name = 'Giant Leap Fund';

UPDATE investors SET
  basic_info = 'Glitch Capital is **ANZ''s first founders fund** — launched in **June 2025** at **AU$50M**.

The fund is **backed by 70%+ unicorn founders and operators** as LPs — meaning Glitch is among the most operator-dense capital pools in the ANZ market. Co-founded with **Rob Phillpot** (also at Gravel Road Ventures and ex-Aconex co-founder).

Sector focus: **high-growth global tech (agnostic)**. Stage focus: **Seed and Series A**. Cheque size: **AU$1M–$3M**.

Portfolio is not yet publicly listed (fund launched 2025).',
  why_work_with_us = 'For Australian and New Zealand high-growth global-tech founders at seed and Series A — Glitch Capital offers a $1M–$3M cheque from ANZ''s first founders-fund (launched Jun 2025), with 70%+ unicorn-founder/operator LP base. Especially valuable for founders looking for operator-network deal-flow and post-investment scaling support.',
  meta_title = 'Glitch Capital — ANZ''s First Founders Fund | $50M | 70%+ Unicorn LPs | $1M–$3M',
  meta_description = 'ANZ''s first founders fund. AU$50M launched Jun 2025. 70%+ unicorn founders/operators LPs. $1M–$3M.',
  details = jsonb_build_object(
    'distinction','ANZ''s first founders fund',
    'fund_size','AU$50M',
    'launched','June 2025',
    'lp_base','70%+ unicorn founders and operators',
    'co_founder','Rob Phillpot (also Gravel Road Ventures; ex-Aconex co-founder)',
    'investment_thesis','High-growth global tech — sector-agnostic.',
    'check_size_note','AU$1M–$3M'
  ),
  updated_at = now()
WHERE name = 'Glitch Capital';

UPDATE investors SET
  basic_info = 'Global Investors is a **Sydney-based Australian special-situations and early-stage investor**. Focuses on **carve-outs, founder successions and early-stage opportunities** — operating across **special-situations, carve-out and early-stage** mandates.

Limited public information on portfolio and fund structure.',
  why_work_with_us = 'For Australian founders pursuing **carve-outs, founder-succession transactions or special-situations capital** — Global Investors is a focused specialist. Best treated as a referral-led conversation for transaction-driven situations rather than primary VC pitches.',
  meta_title = 'Global Investors — Sydney Special-Situations / Carve-Outs / Early-Stage',
  meta_description = 'Sydney special-situations and early-stage investor. Carve-outs, founder successions, early-stage.',
  details = jsonb_build_object(
    'investment_thesis','Special situations, carve-outs, founder successions, early-stage opportunities.'
  ),
  updated_at = now()
WHERE name = 'Global Investors';

UPDATE investors SET
  basic_info = 'Gravel Road Ventures is a **Melbourne-based seed and Series A venture capital firm** co-founded by **Rob Phillpot** (also at Glitch Capital; ex-Aconex co-founder). Founded **2018**.

Headquartered at **Level 2, 39 Little Collins St, Melbourne**.

Sector focus: **Tech — AI, FinTech, Healthcare, Biotech, EdTech, CleanTech** with notable **sustainability** emphasis. Stage focus: **Seed and Series A**.',
  why_work_with_us = 'For Australian seed and Series A founders across AI, FinTech, healthcare, biotech, EdTech and CleanTech — Gravel Road Ventures offers a Melbourne-anchored cheque with Rob Phillpot''s ex-Aconex co-founder operator depth and sustainability-aligned thesis.',
  meta_title = 'Gravel Road Ventures — Melbourne Seed/Series A Tech VC | Rob Phillpot | since 2018',
  meta_description = 'Melbourne seed/Series A VC since 2018. AI, FinTech, healthcare, biotech, EdTech, CleanTech. Rob Phillpot co-founder.',
  details = jsonb_build_object(
    'founded',2018,
    'co_founder','Rob Phillpot (also Glitch Capital; ex-Aconex co-founder)',
    'investment_thesis','Tech — AI, FinTech, healthcare, biotech, EdTech, CleanTech with sustainability focus.'
  ),
  updated_at = now()
WHERE name = 'Gravel Road Ventures';

COMMIT;
