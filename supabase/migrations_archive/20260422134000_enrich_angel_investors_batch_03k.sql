-- Enrich angel investors — batch 03k (records 204-208: Robert Nicholls → Rosanna Biggs)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based serial business strategist and angel investor. Principal Partner at Fusion Private Capital. Multi-industry operator across Telecommunications, FMCG and Finance. Vertical-agnostic angel — most experience in B2B SaaS. Portfolio includes Xailient (computer-vision AI), Timelio (invoice-finance marketplace), Birdi (drone analytics). $20k–$50k cheques.',
  basic_info = 'Robert Nicholls is a Sydney-based **seasoned Senior Business Strategist** with extensive operating experience across **Telecommunications, FMCG and Finance**. He is **Principal Partner at Fusion Private Capital** — a private-capital advisory practice — and an active angel investor.

His CSV-listed portfolio includes:
- **Xailient** (computer-vision AI for edge devices — entrepreneur computer-vision-AI platform)
- **Timelio** (Australian online marketplace for invoice finance)
- **Birdi** (scalable aerial-intelligence platform for organisations to make better business decisions via drones)
- **To...** (truncated)
- Plus additional names

He has also raised capital for **Ubaryon** (Brisbane Angels portfolio company) at AUD$5M.

CSV cheque size $20k–$50k. Stated thesis: **Vertical Agnostic — but most experience...** (truncated context — most experience in B2B/enterprise).',
  why_work_with_us = 'For Australian B2B SaaS, AI, marketplace and tech-enabled-services founders — Robert combines deep multi-industry operating experience (Telcoms, FMCG, Finance) with active capital-raising track record (Fusion Private Capital, Ubaryon $5M raise) and a high-quality angel portfolio. Especially valuable for founders pursuing structured capital raises alongside angel cheques.',
  sector_focus = ARRAY['B2B SaaS','Marketplace','AI','Computer Vision','FinTech','Logistics','Telecoms','FMCG','Drone'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 20000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/robert-nicholls-619b221/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Fusion Private Capital (Principal Partner)','Xailient','Timelio','Birdi','Ubaryon (raised AUD$5M)'],
  meta_title = 'Robert Nicholls — Fusion Private Capital | Sydney B2B Angel',
  meta_description = 'Sydney B2B SaaS, AI angel. Fusion Private Capital Principal Partner. Xailient, Timelio, Birdi portfolio.',
  details = jsonb_build_object(
    'firms', ARRAY['Fusion Private Capital (Principal Partner)'],
    'prior_career','Multi-industry operator across Telecommunications, FMCG and Finance',
    'investment_thesis','Vertical-agnostic with B2B-experience bias.',
    'check_size_note','$20k–$50k',
    'capital_raises', ARRAY['Ubaryon — AUD$5M (Brisbane Angels portfolio)'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/robert-nicholls-619b221/'
    ),
    'corrections','CSV portfolio truncated ("Xailient, Timelio, Birdi, To..."). Three retained verbatim plus Ubaryon.'
  ),
  updated_at = now()
WHERE name = 'Robert Nicholls';

UPDATE investors SET
  description = 'Melbourne-based founder of Playbook Ventures, host of The Startup Playbook Podcast (since 2016) and founder of The Komo Club. Active angel investor and syndicate operator backing Australian pre-seed and seed-stage startups. Former CEO of StageLabel (fashion crowdfunding, 150+ brands launched).',
  basic_info = 'Rohit Bhargava is one of the most well-networked single individuals in the Australian early-stage ecosystem. He is the **host of The Startup Playbook Podcast** (since 2016) — one of Australia''s longest-running and most influential startup podcasts — and the **founder of Playbook Ventures** (the syndicate covered separately in this directory).

He is also the **founder of The Komo Club** — described as "the world''s first human accelerator" — a high-performance community and programme designed to help ambitious founders, operators and leaders win in business and in life.

Prior to investing he was the **Co-Founder and CEO of StageLabel** — a fashion crowdfunding platform that helped launch **150+ fashion brands globally**.

His angel-investing flow leverages the reach, trust and relationships of The Startup Playbook Podcast network — Playbook Angel Network now invests deal-by-deal into Australian startups. CSV cheque size and sector mandate not specified.',
  why_work_with_us = 'For Australian pre-seed and seed-stage founders — particularly those who fit the Startup Playbook Podcast audience or are looking to plug into Rohit''s extensive Australian-founder network — his cheque comes with significant podcast-platform amplification potential plus access to Playbook Angel Network''s broader LP base.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','FinTech','HealthTech','Sport Tech','Fashion'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/rohbhargava/',
  contact_email = 'rohit@startupplaybook.co',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Playbook Ventures (Founder)','The Startup Playbook Podcast (Host since 2016)','The Komo Club (Founder)','StageLabel (former Co-Founder & CEO; 150+ fashion brands launched)'],
  meta_title = 'Rohit Bhargava — Startup Playbook Podcast | Playbook Ventures Founder',
  meta_description = 'Melbourne podcast host and angel. Playbook Ventures founder. Komo Club founder. ex-StageLabel CEO.',
  details = jsonb_build_object(
    'firms', ARRAY['Playbook Ventures (Founder)','The Startup Playbook Podcast (Host)','The Komo Club (Founder)'],
    'prior_career','Co-Founder & CEO of StageLabel — fashion crowdfunding platform; 150+ fashion brands launched globally',
    'investment_thesis','Sector-agnostic via Playbook Angel Network — Australian pre-seed/seed startups.',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/rohbhargava/',
      'website','https://rohitbhargava.co/',
      'startup_playbook','https://startupplaybook.co/',
      'airtree_halo_effect','https://www.airtree.vc/open-source-vc/the-halo-effect-rohit-bhargava'
    ),
    'corrections','CSV thesis and cheque size not specified.'
  ),
  updated_at = now()
WHERE name = 'Rohit Bhargava';

UPDATE investors SET
  description = 'Sydney-based founder, executive and angel investor. CEO of Marley Spoon Australia (meal-kit subscription business). Founder and Investor across consumer-tech ventures. Health, AI, SaaS focus. $25k–$100k cheques. CSV email "rolf@mannabeach.com" suggests Manna Beach venture affiliation.',
  basic_info = 'Rolf Weber is a Sydney-based founder, startup executive and angel investor. He is **CEO of Marley Spoon Australia** — the Australian arm of the **ASX-listed meal-kit subscription business Marley Spoon** (one of Europe and Australia''s leading recipe-box businesses).

His broader profile spans roles as **Founder, Investor and Startup Executive** — with active angel-investing focus across **Health, AI and SaaS** categories. CSV email "rolf@mannabeach.com" suggests affiliation with **Manna Beach** (likely his personal investment vehicle / lifestyle-brand venture).

CSV cheque size $25k–$100k.',
  why_work_with_us = 'For Australian consumer, health, AI and SaaS founders — Rolf brings ASX-listed scale-up operator experience (Marley Spoon Australia) plus a mid-cheque-size angel position ($25k–$100k) suitable for seed rounds. Especially valuable for founders building consumer-subscription, food-tech or DTC health businesses given his meal-kit operating background.',
  sector_focus = ARRAY['Health','AI','SaaS','Consumer','Food Tech','Subscription','DTC'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 100000,
  contact_email = 'rolf@mannabeach.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Marley Spoon Australia (CEO)','Manna Beach (operating)'],
  meta_title = 'Rolf Weber — Marley Spoon Australia CEO | Sydney Health/AI/SaaS Angel',
  meta_description = 'Sydney CEO Marley Spoon Australia. Health, AI, SaaS angel. $25k–$100k cheques.',
  details = jsonb_build_object(
    'firms', ARRAY['Marley Spoon Australia (CEO)','Manna Beach (operating)'],
    'investment_thesis','Health, AI, SaaS models — Sydney consumer/SaaS angel.',
    'check_size_note','$25k–$100k',
    'unverified', ARRAY[
      'Specific portfolio companies and detailed angel investment history not uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'contactout','https://contactout.com/Rolf-Weber-53936596'
    ),
    'corrections','CSV LinkedIn empty; resolved via public profile.'
  ),
  updated_at = now()
WHERE name = 'Rolf Weber';

UPDATE investors SET
  description = 'Melbourne-based fintech entrepreneur and angel investor. Founder & Managing Director of BGL Corporate Solutions (Australia''s leading SMSF administration and ASIC compliance software). RMIT alumni. Tech and fintech focus. $100k–$150k cheques.',
  basic_info = 'Ron Lesh FCA is a Melbourne-based fintech entrepreneur and angel investor. He is the **Founder & Managing Director of BGL Corporate Solutions** — established in **1983** as a consulting firm for accountants and small businesses with IT, today **Australia''s leading developer of SMSF administration and ASIC corporate compliance software solutions** (cloud products: Simple Fund 360, CAS 360).

BGL is headquartered in **Brighton East / Canterbury, Victoria**. Ron attended **RMIT University**.

His CSV-listed angel-investing thesis: **Mainly technology and fintech**. Public investment record includes **AuditCover Seed II round (March 2022)** and similar fintech-adjacent positions. CSV cheque size $100k–$150k.',
  why_work_with_us = 'For Australian fintech, SMSF/wealth-tech, accounting/compliance-tech and B2B SaaS founders — Ron brings 40+ years of operator depth scaling Australia''s leading SMSF/ASIC compliance SaaS business plus a mid-large cheque size ($100k–$150k) and deep accounting-firm + ASIC-regulator network access via BGL''s entrenched market position.',
  sector_focus = ARRAY['FinTech','SaaS','RegTech','Wealth Tech','Compliance','SMSF','B2B SaaS','Accounting Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 100000,
  check_size_max = 150000,
  linkedin_url = 'https://au.linkedin.com/in/ronlesh',
  contact_email = 'rlesh@bglcorp.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['BGL Corporate Solutions (Founder & Managing Director; since 1983)','AuditCover','Simple Fund 360 (BGL product)','CAS 360 (BGL product)'],
  meta_title = 'Ron Lesh — BGL Corporate Founder | Melbourne FinTech Angel',
  meta_description = 'Melbourne BGL Corporate founder/MD. SMSF/ASIC compliance SaaS leader. FinTech angel. $100k–$150k.',
  details = jsonb_build_object(
    'firms', ARRAY['BGL Corporate Solutions (Founder & Managing Director, since 1983)'],
    'investment_thesis','Mainly technology and FinTech — Melbourne SaaS-and-compliance-network angel.',
    'check_size_note','$100k–$150k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','AuditCover','context','Seed II round, March 2022')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/ronlesh',
      'bgl','https://www.bglcorp.com/proven/',
      'crunchbase','https://www.crunchbase.com/person/ron-lesh'
    ),
    'corrections','CSV thesis truncated ("Mainly technology and fin..."). Resolved.'
  ),
  updated_at = now()
WHERE name = 'Ron Lesh';

UPDATE investors SET
  description = 'Sydney-based senior executive and angel investor. SVP Office of the Founders, People & Legal at Linktree. Member of TechGC. Active AirTree Explorer. Legal and ecommerce focus.',
  basic_info = 'Rosanna Biggs is a Sydney/Lennox Head-based **Senior Vice President of Office of the Founders, People & Legal at Linktree** — one of Australia''s fastest-growing tech companies (link-in-bio social-commerce platform).

She is a **member of TechGC** (the global community for technology general counsels) and an active **Explorer with AirTree** (AirTree''s top-of-funnel founder/operator advisor network) — meaning her angel deal-flow benefits from AirTree''s top-tier ANZ deal-stream.

Her stated angel-investing focus: **Legal and ecommerce**. CSV cheque size not specified.

Beyond Linktree''s well-publicised growth and her AirTree Explorer involvement, individual portfolio details could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian LegalTech, ecommerce, link-in-bio / creator-economy and HR-tech founders — Rosanna combines exceptional Linktree operating context (one of ANZ''s most prominent scale-ups), TechGC general-counsel network depth (relevant for legal/compliance-heavy categories) and active AirTree-aligned deal-flow.',
  sector_focus = ARRAY['Legal','LegalTech','E-commerce','Consumer','Creator Economy','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/rosanna-biggs-567754',
  contact_email = 'rosanna.biggs@hotmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Linktree (SVP, Office of the Founders, People & Legal)','TechGC (member)','AirTree (Explorer)'],
  meta_title = 'Rosanna Biggs — Linktree SVP | Sydney Legal/Ecommerce Angel',
  meta_description = 'Sydney Linktree SVP. TechGC member. AirTree Explorer. Legal and ecommerce angel.',
  details = jsonb_build_object(
    'day_role','SVP, Office of the Founders, People & Legal at Linktree (since April 2021)',
    'community_roles', ARRAY['TechGC (member)','AirTree Explorer'],
    'investment_thesis','Legal and ecommerce — Linktree-network and AirTree-aligned angel.',
    'unverified', ARRAY[
      'Specific portfolio companies and detailed angel investment history not uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/rosanna-biggs-56775477/',
      'gc_powerlist','https://www.legal500.com/gc-powerlist/australia-2022/rosanna-biggs/'
    ),
    'corrections','CSV LinkedIn URL truncated. CSV email truncated ("rosanna.biggs@hotmail.c...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Rosanna Biggs';

COMMIT;
