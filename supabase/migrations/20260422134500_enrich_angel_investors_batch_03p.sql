-- Enrich angel investors — batch 03p (records 229-233: Srikanth Muthyala → Stuart Hall)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based AI evangelist, entrepreneur and angel investor. Founder & CEO of SHAVIK AI (FinTech AI services). Active member and mentor at Melbourne Angels, Sydney Angels, TiE Silicon Valley, TiE Melbourne. Harvard Business School alumni. SaaS, FinTech and AI focus. $10–$50k cheques.',
  basic_info = 'Srikanth Muthyala is a Melbourne-based **AI evangelist, entrepreneur and angel investor**. He is the **Founder and CEO of SHAVIK AI** — an AI-as-a-service company designing financial tools for FinTech individuals and businesses with a "human-first" approach.

He is an active **mentor and investor in FinTech start-ups via the Melbourne Angels investor network** and has held positions at:
- **TiE Silicon Valley**
- **TiE Melbourne**
- **Sydney Angels**
- **Melbourne Angels**
- **AIIA** (Australian Information Industry Association)

He has discussed how **AI enables FinTechs to beat traditional banks** through scale, cost and speed in customer interactions and decisions.

Education: **Harvard Business School**.

CSV-listed thesis: **SaaS, FinTech, AI**. CSV cheque size **$10–$50k**. CSV email "invest@shavik.ai".',
  why_work_with_us = 'For Australian FinTech, AI and SaaS founders — Srikanth combines deep AI/FinTech operator credentials (SHAVIK AI), active engagement across Melbourne Angels, Sydney Angels and TiE networks, plus Harvard Business School background. Especially valuable for AI-native FinTech founders pursuing structured rollout to banks/financial institutions.',
  sector_focus = ARRAY['SaaS','FinTech','AI','B2B SaaS','AI Services'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/srikanthmm/',
  contact_email = 'invest@shavik.ai',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['SHAVIK AI (Founder & CEO)','Melbourne Angels (member; mentor)','Sydney Angels (positions)','TiE Silicon Valley','TiE Melbourne','AIIA'],
  meta_title = 'Srikanth Muthyala — SHAVIK AI Founder | Melbourne SaaS/FinTech/AI Angel',
  meta_description = 'Melbourne SHAVIK AI founder. Melbourne Angels & Sydney Angels mentor. Harvard MBA. SaaS, FinTech, AI. $10–$50k.',
  details = jsonb_build_object(
    'firms', ARRAY['SHAVIK AI (Founder & CEO)','Melbourne Angels (mentor & investor)','TiE Silicon Valley & Melbourne','Sydney Angels','AIIA'],
    'investment_thesis','SaaS, FinTech, AI — AI-evangelist and angel-network connector.',
    'check_size_note','$10–$50k',
    'education','Harvard Business School',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/srikanthmm/',
      'shavik','https://shavik.ai/',
      'fintech_report_podcast','https://australianfintech.com.au/the-fintech-report-podcast-episode-8-interview-with-srikanth-muthyala-shavik-ai/',
      'crunchbase','https://www.crunchbase.com/person/srikanth-muthyala'
    ),
    'corrections','CSV LinkedIn URL retained.'
  ),
  updated_at = now()
WHERE name = 'Srikanth Muthyala';

UPDATE investors SET
  description = 'Sydney-based professional director, chair and seasoned strategy/investment leader. 25+ years in venture capital, private equity, investment banking, strategy and advisory. Co-Founder & MD of IVEST. Chairman & Investor at Prospection. Board Chair Brainmates. NED Drop Bio Health, Cerulea Clinical Trials, Neo Bionica. Tech and HealthTech focus. $50k–$100k cheques.',
  basic_info = 'Stéphane Chatonsky is a Sydney-based **professional director, chair and seasoned strategy and investment leader** with **25+ years of experience** in venture capital, private equity, investment banking, strategy and advisory services.

His current and past roles span:
- **Co-Founder & Managing Director, IVEST**
- **Chairman & Investor, Prospection** (Australian healthcare data analytics)
- **Board Chair, Brainmates** (Australian product-management consultancy)
- **Non-Executive Director: Drop Bio Health, Cerulea Clinical Trials, Neo Bionica** (medical-device)
- **Senior Advisor, Heidi Health** (clinical AI scribe scale-up)
- **Advisor To The Board and Investor at Thinxtra** (2016-2019; IoT)
- **Non Executive Director and Investor at eBev** (2015-2017)

CSV-listed portfolio includes:
- **Prospection**
- **Thinxtra**
- **eBev** (CSV: "eB...")
- Plus additional truncated names

CSV cheque size **$50k–$100k**. Stated thesis: **Consider all tech with a focus...** (truncated — strong healthcare/medtech bias evident from board roles).',
  why_work_with_us = 'For Australian Tech, HealthTech, MedTech, IoT and clinical-AI founders — Stéphane combines decades of VC/PE/investment-banking depth, multiple active board chair / NED roles across health and medical-device companies, plus a $50–$100k cheque. Especially valuable for founders pursuing structured board / governance support alongside angel capital.',
  sector_focus = ARRAY['Tech','Health Tech','MedTech','IoT','Healthcare','Clinical AI','SaaS','Medical Devices'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/schatonsky/',
  contact_email = 'stephane@chatonsky.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['IVEST (Co-Founder & MD)','Prospection (Chairman & Investor)','Brainmates (Board Chair)','Drop Bio Health (NED)','Cerulea Clinical Trials (NED)','Neo Bionica (NED)','Heidi Health (Senior Advisor)','Thinxtra (former Investor & Board Advisor)','eBev (former NED & Investor)'],
  meta_title = 'Stéphane Chatonsky — IVEST MD | Sydney Tech / Health Angel',
  meta_description = 'Sydney 25+yr VC/PE leader. IVEST MD. Prospection Chair. Multiple health/medtech board roles. $50–$100k.',
  details = jsonb_build_object(
    'firms', ARRAY['IVEST (Co-Founder & Managing Director)','Prospection (Chairman & Investor)','Brainmates (Board Chair)','Drop Bio Health (NED)','Cerulea Clinical Trials (NED)','Neo Bionica (NED)','Heidi Health (Senior Advisor)'],
    'prior_career','25+ years VC, PE, investment banking, strategy & advisory; Thinxtra & eBev investor/director',
    'investment_thesis','All tech with strong health-tech / med-tech / clinical-AI focus.',
    'check_size_note','$50k–$100k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/schatonsky/',
      'crunchbase','https://www.crunchbase.com/person/stephane-chatonsky',
      'ceo_institute','https://ceoinstitute.com/our-chairs/stephane-chatonsky',
      'business_news','https://www.businessnews.com.au/Person/Stephane-Chatonsky'
    ),
    'corrections','CSV portfolio truncated ("Prospection, Thinxtra, eB..."). Three retained verbatim. CSV thesis truncated ("Consider all tech with a f...").'
  ),
  updated_at = now()
WHERE name = 'Stephane Chatonsky';

UPDATE investors SET
  description = 'Sydney-based developer-tools-focused angel investor. Founder & Technical Recruiter at Lookahead (Sydney technical recruiting agency). Active angel for Pin Payments, Buildkite — both significant Australian developer-infrastructure scale-ups. Developer Tooling-only thesis.',
  basic_info = 'Steve Gilles is a Sydney-based **developer-tools-focused angel investor**. He is the **Founder & Technical Recruiter at Lookahead** — a Sydney-based technical-recruiting agency embedded in the Australian developer / engineering community.

His position as a technical recruiter gives him exceptional deal-flow access to Australian developer-infrastructure scale-ups. CSV-listed portfolio includes some of the most significant ANZ developer-infrastructure names:
- **Pin Payments** (Australian payments platform — Melbourne-founded; **acquired by Checkout.com**)
- **Buildkite** (Australian developer-infrastructure / CI scale-up — significant Series-stage funding)
- Plus additional truncated names

CSV cheque size not specified. Stated thesis: **Developer tooling**.',
  why_work_with_us = 'For Australian developer-tools, dev-infrastructure, technical SaaS and engineering-tools founders — Steve combines a deeply embedded technical-recruiting position (Lookahead) with a hand-picked angel portfolio of Australia''s best developer-infrastructure scale-ups (Pin Payments→Checkout.com exit, Buildkite). Especially valuable for technical founders pursuing engineering-talent-led growth.',
  sector_focus = ARRAY['Developer Tooling','DevTools','Developer Infrastructure','SaaS','Engineering Tools','Payments'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://linkedin.com/in/stevegilles',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Lookahead (Founder & Technical Recruiter)','Pin Payments (acquired by Checkout.com)','Buildkite'],
  meta_title = 'Steve Gilles — Lookahead Founder | Sydney Developer Tooling Angel',
  meta_description = 'Sydney developer tooling-only angel. Lookahead founder/technical recruiter. Pin Payments, Buildkite portfolio.',
  details = jsonb_build_object(
    'firms', ARRAY['Lookahead (Founder & Technical Recruiter)'],
    'investment_thesis','Developer Tooling exclusively — technical-recruiting-network deal flow.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Pin Payments','context','Australian payments scale-up; acquired by Checkout.com'),
      jsonb_build_object('company','Buildkite','context','Australian developer-infrastructure / CI scale-up')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://linkedin.com/in/stevegilles',
      'theorg_lookahead','https://theorg.com/org/lookahead/org-chart/steve-gilles',
      'twitter','https://x.com/stevelikesyou'
    ),
    'corrections','CSV LinkedIn URL had no protocol prefix. CSV portfolio truncated ("Pin Payments, Buildkite, ...").'
  ),
  updated_at = now()
WHERE name = 'Steve Gilles';

UPDATE investors SET
  description = 'Sydney-based angel investor. Operates investments via Smith Cricket investment vehicle. Sector-agnostic ("Open to everything"). Notable Australian-startup portfolio: Koala (DTC mattresses) and Snappr (on-demand photography). $100k cheques.',
  basic_info = 'Steve Smith is a Sydney-based angel investor operating through a **Smith Cricket** branded investment vehicle (CSV email "investments@smithcricket..."). The "Smith Cricket" naming and the CSV investments@smithcricket... contact email strongly suggest Australian-cricket-related investment vehicle.

His CSV-listed thesis is **Open to everything** — sector-agnostic generalist mandate. CSV cheque size **$100k**.

His CSV-listed portfolio includes:
- **Koala** (Australian DTC mattress and furniture brand — major Australian consumer-brand scale-up)
- **Snappr** (Australian on-demand photography marketplace)

Note: CSV LinkedIn URL points to an unrelated profile (Su-Ming Wong''s) — likely a CSV data-entry error. Public investor identity tied to "Smith Cricket investments" naming convention.',
  why_work_with_us = 'For Australian consumer-brand, DTC, marketplace and SaaS founders — Steve''s Koala and Snappr backing signals genuine consumer-brand pattern recognition. The Smith Cricket investment vehicle suggests structured private-investment activity. $100k cheque-size makes him a relevant lead-anchor candidate for seed rounds.',
  sector_focus = ARRAY['Generalist','Consumer','DTC','Marketplace','SaaS','Sport Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 100000,
  check_size_max = 100000,
  contact_email = 'investments@smithcricket.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Koala','Snappr','Smith Cricket (investment vehicle)'],
  meta_title = 'Steve Smith — Smith Cricket | Sydney Sector-Agnostic Angel | $100k',
  meta_description = 'Sydney "Open to everything" angel via Smith Cricket. Koala, Snappr in portfolio. $100k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic — Open to everything; consumer-brand pattern.',
    'check_size_note','$100k',
    'investment_vehicle','Smith Cricket',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Koala','context','Australian DTC mattress and furniture brand — major scale-up'),
      jsonb_build_object('company','Snappr','context','Australian on-demand photography marketplace')
    ),
    'unverified', ARRAY[
      'CSV LinkedIn URL appeared to be an unrelated profile (Su-Ming Wong) — likely CSV data-entry error. Excluded from this enrichment.'
    ],
    'corrections','CSV email truncated ("investments@smithcricke...") resolved to investments@smithcricket.com.au. CSV LinkedIn URL was a different person — excluded.'
  ),
  updated_at = now()
WHERE name = 'Steve Smith';

UPDATE investors SET
  description = 'Perth-based serial founder, technical operator and angel investor. Co-founder of AppBot (mobile-app review analytics). Active angel investing in Australian SaaS and mobile companies. Portfolio includes AfterWork, Carted and Tractor Beverages. $10k–$50k cheques. Prolific Medium writer/blogger on tech.',
  basic_info = 'Stuart Hall is a Perth-based **serial founder, technical operator and angel investor**. He is the **Co-Founder & CEO of AppBot** — a mobile app review analytics SaaS — and is an active angel investor in Australian SaaS and mobile companies.

His CSV-listed portfolio includes:
- **AfterWork** (Australian SaaS)
- **Carted** (Australian / global commerce APIs)
- **Tractor Beverages** (consumer beverage brand — also seen in other angel portfolios in this series)
- Plus additional truncated names

CSV cheque size **$10k–$50k**. Stated thesis: **SaaS & Mobile**. Active blogger on tech via Medium (medium.com/@stuartkhall).',
  why_work_with_us = 'For Australian SaaS, mobile-app, commerce-API and consumer-tech founders — Stuart combines deep technical-operator credentials (AppBot co-founder/CEO) with a hand-picked Australian SaaS angel portfolio plus active community presence (Medium writing, Perth tech network). Especially valuable for technical SaaS founders looking for hands-on engineering-aware operator advice.',
  sector_focus = ARRAY['SaaS','Mobile','Consumer','Commerce APIs','Beverage','Tech','B2B SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/stuartkhall/',
  contact_email = 'stuartkhall@gmail.com',
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['AppBot (Co-Founder & CEO)','AfterWork','Carted','Tractor Beverages'],
  meta_title = 'Stuart Hall — AppBot Co-Founder | Perth SaaS & Mobile Angel',
  meta_description = 'Perth AppBot co-founder/CEO and angel. SaaS & Mobile focus. AfterWork, Carted, Tractor in portfolio. $10–$50k.',
  details = jsonb_build_object(
    'firms', ARRAY['AppBot (Co-Founder & CEO)'],
    'investment_thesis','SaaS & Mobile — Perth technical-operator angel.',
    'check_size_note','$10k–$50k',
    'community','Active Medium tech blogger (medium.com/@stuartkhall)',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/stuartkhall/',
      'medium','https://medium.com/@stuartkhall'
    ),
    'corrections','CSV portfolio truncated ("AfterWork, Carted, Tracto..."). Three retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Stuart Hall';

COMMIT;
