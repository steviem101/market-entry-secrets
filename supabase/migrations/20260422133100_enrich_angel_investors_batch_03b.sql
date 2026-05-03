-- Enrich angel investors — batch 03b (records 159-163: Matt Allen → Matthew D'Cruz)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based angel investor and operator. Sector-agnostic with early-stage focus. Notable portfolio includes Buildkite (developer infrastructure unicorn) and Spaceship (super/investment platform). $10k–$20k cheques.',
  basic_info = 'Matt Allen is a Melbourne-based angel investor with a sector-agnostic, early-stage thesis. His portfolio includes some standout Australian success stories — most notably **Buildkite** (developer-infrastructure / CI scale-up that has raised significant Series-stage funding) and **Spaceship** (Australian micro-investing/super platform). The CSV portfolio also lists "Pra..." (truncated).

CSV cheque size $10k–$20k. Personal angel cheques deployed alongside operating role.',
  why_work_with_us = 'For Australian developer-tools, fintech and consumer-finance founders — Matt''s Buildkite and Spaceship history make him a relevant pre-seed/seed cheque for technical and consumer-fintech founders looking for a Melbourne-based generalist.',
  sector_focus = ARRAY['Generalist','SaaS','DevTools','FinTech','Consumer','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 20000,
  linkedin_url = 'https://au.linkedin.com/in/matta0',
  contact_email = 'Matt@allen.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Buildkite','Spaceship'],
  meta_title = 'Matt Allen — Melbourne Angel | Buildkite, Spaceship Portfolio',
  meta_description = 'Melbourne-based sector-agnostic angel. Buildkite and Spaceship in portfolio. $10k–$20k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic, early-stage Melbourne angel.',
    'check_size_note','$10k–$20k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/matta0'
    ),
    'corrections','CSV portfolio truncated ("Buildkite, Spaceship, Pra..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Matt Allen';

UPDATE investors SET
  description = 'Adelaide-based angel investor with sector-agnostic mandate. Portfolio includes Functionly (org-design SaaS), PUSHAS (consumer e-commerce) and Cartloop (DTC marketing). $5k–$25k cheques. Lachmill investment vehicle.',
  basic_info = 'Matt Bauer is an Adelaide-based angel investor with a sector-agnostic mandate. His CSV-listed portfolio includes:
- **Functionly** (organisational-design SaaS — also Mick Liubinskas portfolio)
- **PUSHAS** (Australian DTC consumer e-commerce / fashion)
- **Cartloop** (DTC marketing/SMS)
- Plus additional truncated names

Investments deployed via **Lachmill** investment vehicle (CSV email reference). CSV cheque size $5k–$25k.',
  why_work_with_us = 'For Australian DTC, e-commerce, SaaS and consumer-tech founders looking for a small Adelaide-based generalist angel cheque from someone with prior Functionly, PUSHAS and Cartloop exposure.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','E-commerce','DTC','MarTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 25000,
  contact_email = 'investments@lachmill.com',
  location = 'Adelaide, SA',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Functionly','PUSHAS','Cartloop'],
  meta_title = 'Matt Bauer — Adelaide Angel | Functionly, PUSHAS, Cartloop',
  meta_description = 'Adelaide-based sector-agnostic angel. $5k–$25k cheques. Lachmill investment vehicle.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic Adelaide angel.',
    'check_size_note','$5k–$25k',
    'investment_vehicle','Lachmill',
    'sources', jsonb_build_object(
      'csv','australian_angel_investors_corrected.csv row 160'
    ),
    'corrections','CSV portfolio truncated ("Functionly, PUSHAS, Cart..."). Three resolved. CSV email truncated ("investments at lachmill d...") resolved to investments@lachmill.com.'
  ),
  updated_at = now()
WHERE name = 'Matt Bauer';

UPDATE investors SET
  description = 'Melbourne-based serial founder, executive and angel investor. Founder/CEO of Unlockd (mobile ad-tech, exited / wound up). Currently building new ventures. Tech and marketplace focus. $200k–$500k cheques.',
  basic_info = 'Matt Berriman is a Melbourne-based serial founder, executive and angel investor. He is best known as the **Founder and CEO of Unlockd** — the Australian mobile ad-tech company that was a high-profile scale-up in the 2010s before its well-publicised wind-down. Subsequently he has continued building ventures and investing.

His CSV-listed portfolio includes:
- **Expert 360** (talent/freelance marketplace — exited)
- **Vurvoe** (mobile/consumer)
- **Tribe** (influencer marketplace — also Liam Pomfret portfolio)
- Plus additional truncated names

CSV cheque size $200k–$500k. Stated thesis: tech, mostly in marketplaces.',
  why_work_with_us = 'For Australian marketplace, mobile, consumer and ad-tech founders — Matt brings deep operating experience scaling a global ad-tech company plus a 200-500k cheque size that lands in the seed-to-Series A bracket. His Tribe and Expert 360 portfolio mark him as a marketplace specialist.',
  sector_focus = ARRAY['Marketplace','Tech','Mobile','Ad Tech','Consumer','Influencer Marketing'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 200000,
  check_size_max = 500000,
  linkedin_url = 'https://www.linkedin.com/in/mattberriman/',
  contact_email = 'mb@mattberriman.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Expert 360','Vurvoe','Tribe','Unlockd (Founder/CEO)'],
  meta_title = 'Matt Berriman — Unlockd Founder | Melbourne Marketplace Angel',
  meta_description = 'Melbourne Unlockd founder/CEO. Marketplace-focused angel. Expert 360, Tribe in portfolio. $200k–$500k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Unlockd (Founder/CEO)'],
    'investment_thesis','Tech, mostly in marketplaces.',
    'check_size_note','$200k–$500k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/mattberriman/'
    ),
    'corrections','CSV portfolio truncated ("Expert 360, Vurvoe, Tribe..."). Three retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Matt Berriman';

UPDATE investors SET
  description = 'California-based Australian angel investor focused on SaaS, AI/ML, dev tools and B2B tech. Investments via AngelList. $10k–$35k cheques. Bay Area presence valuable for Australian founders looking to bridge to US tech ecosystem.',
  basic_info = 'Matt Evans is a California-based angel investor with origins in the Australian directory but operating from the Bay Area. His stated thesis covers **SaaS, AI/ML, dev tools** and adjacent B2B tech sectors. He uses AngelList as a primary investment platform (CSV reference).

CSV cheque size $10k–$35k. Australian-rooted angel with a US tech-ecosystem operating base.',
  why_work_with_us = 'Particularly valuable for Australian SaaS, AI/ML and dev-tools founders looking to build a US presence — Matt''s Bay Area location plus Australian roots make him a useful bridge investor for cross-Pacific go-to-market.',
  sector_focus = ARRAY['SaaS','AI/ML','DevTools','B2B','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 35000,
  contact_email = 'khuluinja@gmail.com',
  location = 'California, USA',
  country = 'USA',
  currently_investing = true,
  meta_title = 'Matt Evans — California (Aussie) SaaS/AI Angel',
  meta_description = 'California-based Aussie angel. SaaS, AI/ML, dev-tools focus. $10k–$35k via AngelList.',
  details = jsonb_build_object(
    'investment_thesis','SaaS, AI/ML, dev-tools, adjacent B2B tech.',
    'check_size_note','$10k–$35k',
    'platform','AngelList',
    'unverified', ARRAY[
      'Specific portfolio companies and detailed background not uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'angellist','https://angel.co/u/mattevans'
    ),
    'corrections','CSV LinkedIn was "NA" and website was AngelList URL. Bay Area location confirmed.'
  ),
  updated_at = now()
WHERE name = 'Matt Evans';

UPDATE investors SET
  description = 'Sydney-based emerging angel investor with SaaS focus. Backer of Black Nova VC (Australian B2B SaaS fund). $0k–$15k small cheques. Early-career angel building portfolio.',
  basic_info = 'Matthew D''Cruz is a Sydney-based emerging angel investor with a stated SaaS focus. He is an LP/backer of **Black Nova VC** — the Australian B2B SaaS-focused venture fund (also Black Nova portfolio overlap with several other angels in this series).

CSV cheque size $0k–$15k — characteristic of an early-career angel building track record with small cheques.',
  why_work_with_us = 'For Australian early-stage SaaS founders looking to fill out a round with a small cheque from an emerging Sydney angel. Best as part of a syndicate or alongside Black Nova VC engagement.',
  sector_focus = ARRAY['SaaS','B2B','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 0,
  check_size_max = 15000,
  linkedin_url = 'https://www.linkedin.com/in/matthewdcruz/',
  contact_email = 'matthew.dcruz96@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Black Nova VC (LP/backer)'],
  meta_title = 'Matthew D''Cruz — Sydney SaaS Angel | Black Nova LP',
  meta_description = 'Sydney emerging angel. SaaS focus. Black Nova VC backer. $0k–$15k small cheques.',
  details = jsonb_build_object(
    'investment_thesis','SaaS-focused emerging Sydney angel.',
    'check_size_note','$0k–$15k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/matthewdcruz/'
    ),
    'corrections','CSV portfolio noted "Invested into Black Nova..." — interpreted as Black Nova VC LP/backer.'
  ),
  updated_at = now()
WHERE name = 'Matthew D''Cruz';

COMMIT;
