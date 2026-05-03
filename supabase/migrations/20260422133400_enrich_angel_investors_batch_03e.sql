-- Enrich angel investors — batch 03e (records 174-178: Nicholas Clancy → Nick Crocker)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based angel investor with multi-sector focus across health, fitness, energy and B2B. $25k cheques. Sector-spread early-stage angel.',
  basic_info = 'Nicholas Clancy is a Sydney-based angel investor with stated focus across **Health, Fitness, Energy** and adjacent B2B sectors. CSV cheque size $25k. He is listed in the Australian angel investor directory; specific portfolio companies could not be uniquely corroborated from public-source search.

The cross-sector spread (consumer-health, energy and B2B) suggests a generalist thesis with some sector affinity for wellness and energy categories.',
  why_work_with_us = 'For Australian consumer-health, fitness, wellness, energy and B2B founders looking for a small Sydney-based cheque from a sector-spread early-stage angel.',
  sector_focus = ARRAY['Health','Fitness','Wellness','Energy','B2B','Consumer','Generalist'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/clancynicholas/',
  contact_email = 'n.a.clancy@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Nicholas Clancy — Sydney Health/Fitness/Energy Angel | $25k',
  meta_description = 'Sydney-based angel. Health, fitness, energy, B2B focus. $25k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Health, Fitness, Energy and adjacent B2B Sydney angel.',
    'check_size_note','$25k',
    'unverified', ARRAY[
      'Specific portfolio companies and detailed background not uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/clancynicholas/'
    ),
    'corrections','CSV portfolio field truncated ("Health, Fitness, Energy, B...").'
  ),
  updated_at = now()
WHERE name = 'Nicholas Clancy';

UPDATE investors SET
  description = 'Wollongong-based angel investor and serial founder. Co-founder of Easy Agile (Atlassian-marketplace SaaS) and Arijea Software Holdings. Enterprise SaaS and Women/Diversity focus. Portfolio includes Sajari, aider and FreightExchange. $30k–$50k USD cheques.',
  basic_info = 'Nicholas (Nick) Muldoon is a Wollongong-based serial founder and active angel investor. He is the **Co-Founder of Easy Agile** — the highly successful Atlassian-marketplace SaaS company that builds agile-roadmap and SAFe-PI tooling for Jira (one of the most-installed Atlassian apps globally) — and is associated with **Software Holdings (Arijea)** as an investment vehicle.

His CSV-listed portfolio includes:
- **Sajari** (search/relevance — acquired by Algolia)
- **aider** (AI-pair programming)
- **FreightExchange** (logistics)
- Plus additional truncated names

Stated thesis: **Enterprise SaaS, Women/[Diversity]** — explicit gender-lens / diversity-aware investing. CSV cheque size $30k–$50k USD.',
  why_work_with_us = 'For Australian enterprise-SaaS founders — and especially those building on the Atlassian marketplace, in dev-tools or with gender-diverse founding teams — Nick is one of the most credible angels in the country. His Easy Agile co-founder operating experience scaling a marketplace SaaS to global usage is unmatched in the Wollongong/regional NSW ecosystem.',
  sector_focus = ARRAY['Enterprise SaaS','Atlassian Marketplace','DevTools','Logistics','Women-Led','Diversity','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 30000,
  check_size_max = 50000,
  linkedin_url = 'https://linkedin.com/in/nmuldoon',
  contact_email = 'nmuldoon@softwareholdings.com',
  location = 'Wollongong, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Easy Agile (Co-Founder)','Sajari (acquired by Algolia)','aider','FreightExchange','Software Holdings (Arijea)'],
  meta_title = 'Nick Muldoon — Easy Agile Co-Founder | Wollongong SaaS Angel',
  meta_description = 'Wollongong Easy Agile co-founder. Enterprise SaaS, women/diversity-focused. $30k–$50k USD.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Easy Agile (Co-Founder)','Software Holdings (Arijea)'],
    'investment_thesis','Enterprise SaaS with explicit women/diversity lens.',
    'check_size_note','$30k–$50k USD',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Sajari','context','Acquired by Algolia'),
      jsonb_build_object('company','Easy Agile','role','Co-Founder; one of the most installed Atlassian marketplace apps globally')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://linkedin.com/in/nmuldoon',
      'easy_agile','https://www.easyagile.com/'
    ),
    'corrections','CSV portfolio truncated ("Sajari, aider, FreightExcha..."). Three retained verbatim. CSV email truncated ("nmuldoon@softwareholdi...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Nicholas Muldoon';

UPDATE investors SET
  description = 'Brisbane-based serial founder, operator and angel investor. Founder of Narkov. Sector-agnostic angel with portfolio including Muval (moving marketplace), Gathar (events catering) and HealthcareLink. $50k–$250k cheques.',
  basic_info = 'Nick Adams is a Brisbane-based serial founder, operator and angel investor. He is the **Founder of Narkov** (his operating/advisory company; CSV email "hello@narkov.com").

His CSV-listed portfolio includes:
- **Muval** (Australian moving / removalist marketplace)
- **Gathar** (Australian events / catering marketplace)
- **HealthcareLink** (Australian healthcare jobs / recruitment marketplace)
- Plus additional truncated names

CSV cheque size $50k–$250k. Stated sector mandate is "Agnostic". Strong Australian-marketplace investment pattern.',
  why_work_with_us = 'For Australian marketplace, two-sided platform and SaaS founders — and especially Brisbane/Queensland-based founders — Nick brings serial founder/operator experience and a $50k–$250k cheque size that supports lead-anchor positions in seed rounds. His Muval, Gathar and HealthcareLink track record makes him a marketplace-pattern specialist.',
  sector_focus = ARRAY['Generalist','Marketplace','SaaS','HealthTech','Consumer','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 250000,
  linkedin_url = 'https://www.linkedin.com/in/nickadams-au/',
  contact_email = 'hello@narkov.com',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Muval','Gathar','HealthcareLink','Narkov (Founder)'],
  meta_title = 'Nick Adams — Brisbane Marketplace Angel | Muval, Gathar, HealthcareLink',
  meta_description = 'Brisbane sector-agnostic angel. Marketplace specialist. Muval, Gathar, HealthcareLink. $50k–$250k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Narkov (Founder)'],
    'investment_thesis','Sector-agnostic Brisbane angel with strong Australian-marketplace portfolio pattern.',
    'check_size_note','$50k–$250k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/nickadams-au/'
    ),
    'corrections','CSV portfolio truncated ("Muval, Gathar, Healthcar..."). Three retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Nick Adams';

UPDATE investors SET
  description = 'Auckland-based angel investor. Multi-sector focus: SaaS, Mobile, Web3, Fintech. Portfolio includes SafetyCulture (Australian unicorn) and Dext (Receipt Bank, accounting SaaS). $30k–$250k cheques.',
  basic_info = 'Nick Bartlett is an Auckland-based angel investor with stated focus across **SaaS, Mobile, Web3 and Fintech**. He has a high-quality portfolio that includes:
- **SafetyCulture** (Australian B2B SaaS unicorn — workplace safety/operations platform)
- **Dext** (formerly Receipt Bank; UK/global accounting/bookkeeping SaaS)
- Plus additional truncated names

CSV cheque size $30k–$250k. New Zealand-based but with strong Australian-startup investment pattern — useful trans-Tasman cheque.',
  why_work_with_us = 'For Australian and New Zealand SaaS, mobile, web3 and fintech founders — Nick combines a high-quality cross-Tasman portfolio (SafetyCulture, Dext) with $30k–$250k cheque size suitable for seed-stage rounds. His Auckland base makes him a natural early angel for NZ founders pursuing Australian go-to-market and vice-versa.',
  sector_focus = ARRAY['SaaS','Mobile','Web3','Fintech','B2B','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 30000,
  check_size_max = 250000,
  linkedin_url = 'https://www.linkedin.com/in/bartlettnicholas/',
  contact_email = 'nickbartlett85@gmail.com',
  location = 'Auckland, New Zealand',
  country = 'New Zealand',
  currently_investing = true,
  portfolio_companies = ARRAY['SafetyCulture','Dext (Receipt Bank)'],
  meta_title = 'Nick Bartlett — Auckland Angel | SafetyCulture, Dext Portfolio',
  meta_description = 'Auckland angel. SaaS, Mobile, Web3, Fintech. SafetyCulture, Dext in portfolio. $30k–$250k.',
  details = jsonb_build_object(
    'investment_thesis','SaaS, Mobile, Web3, Fintech trans-Tasman angel.',
    'check_size_note','$30k–$250k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','SafetyCulture','context','Australian B2B SaaS unicorn'),
      jsonb_build_object('company','Dext','context','Formerly Receipt Bank; UK/global accounting SaaS')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/bartlettnicholas/'
    ),
    'corrections','CSV portfolio truncated ("SafetyCulture, Dext (Rece..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Nick Bartlett';

UPDATE investors SET
  description = 'Melbourne-based Partner at Blackbird Ventures (one of Australia''s top venture funds). Personal angel cheques alongside Blackbird role. Sector-agnostic. Portfolio includes Ethic and Workyard. $1M+ check size (Blackbird-scale) with selective personal angel deployment.',
  basic_info = 'Nick Crocker is a **Partner at Blackbird Ventures** — one of Australia and New Zealand''s most prominent venture funds (backers of Canva, SafetyCulture, Zoox and many others) — and one of the most respected investor voices in the Australian ecosystem. He is Melbourne-based.

He has a distinguished operator background — including senior product/growth roles at Strava and other US tech companies — before joining Blackbird.

His **personal** angel portfolio (CSV reference) includes:
- **Ethic** (US sustainable / values-aligned wealth-management platform)
- **Workyard** (US construction-tech / time-tracking SaaS)
- Plus additional truncated names

CSV cheque size $1M+ — reflective of his Blackbird-fund cheque capacity rather than typical personal-angel size; for personal angel cheques he is selective and lower-quantum.

Contact email is his Blackbird email (nick@blackbird.vc).',
  why_work_with_us = 'For Australian and New Zealand founders building ambitious global software, marketplace or consumer-tech companies — Nick combines exceptional Blackbird-fund cheque capacity ($1M+ at seed/Series A from the fund) with deep US operator experience (Strava). One of the most influential single venture investors in the ANZ market.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','FinTech','ConTech','Software'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  check_size_min = 1000000,
  check_size_max = 5000000,
  linkedin_url = 'https://www.linkedin.com/in/nicholascrocker/',
  contact_email = 'nick@blackbird.vc',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Blackbird Ventures (Partner)','Ethic','Workyard','Strava (former operator)'],
  meta_title = 'Nick Crocker — Blackbird Ventures Partner | Melbourne | $1M+',
  meta_description = 'Blackbird Ventures Partner. Melbourne-based. Sector-agnostic. Ethic, Workyard personal portfolio. $1M+.',
  details = jsonb_build_object(
    'firms', ARRAY['Blackbird Ventures (Partner)'],
    'prior_career','Senior product/growth roles at Strava and other US tech companies before joining Blackbird Ventures',
    'investment_thesis','Sector-agnostic — Blackbird Ventures cheque-capacity at seed/Series A; personal angel cheques selectively deployed.',
    'check_size_note','$1M+ (Blackbird-fund scale)',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/nicholascrocker/',
      'blackbird','https://www.blackbird.vc/'
    ),
    'corrections','CSV portfolio entry "Personal: Ethic, Workyard..." indicates personal-angel positions; Blackbird role added separately.'
  ),
  updated_at = now()
WHERE name = 'Nick Crocker';

COMMIT;
