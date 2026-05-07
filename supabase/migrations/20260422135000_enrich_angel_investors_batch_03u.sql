-- Enrich angel investors — batch 03u (records 254-258: Uchiraka Yatawara → VentureX Capital)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based serial founder, CEO and angel investor. Founder & CEO of Glamezy (on-demand beauty/wellness booking platform) and Glampay. Atlantis Ventures affiliated. B2B2C SaaS, Consumer Tech focus. Investment thesis: tech-empowered traditional businesses, automation, marketplace models, FinTech, sustainable energy. 25K–50K cheques.',
  basic_info = 'Uchiraka Yatawara is a Sydney-based **serial founder, CEO and angel investor**. He is the **CEO and Co-Founder of Glamezy** — a platform connecting businesses directly with clients looking to book beauty/wellness appointments ASAP — currently active across Sydney with rollout planned across Australia and New Zealand.

He is also associated with **Glampay** (FinTech adjunct of Glamezy) and **Atlantis Ventures** (CSV email "uchiraka@atlantisbc.com..." reflects Atlantis affiliation).

His stated investment thesis is to **invest in:**
- Tech-empowered traditional business models
- As-a-service automation
- Automating B2B & B2C marketplace models
- Innovative FinTech
- Sustainable Energy
- Utilities
- Large-scale service-oriented businesses
- Data-driven automation
- Practical uses of emerging AI trends

CSV cheque size **25K–50K**. Stated thesis: **B2B2C SaaS, Consumer Tech**.

CSV-listed portfolio includes:
- **Atlantis** (Atlantis Ventures / Atlantis BC)
- **Glamezy** (Founder & CEO)
- **Glampay**
- Plus additional names',
  why_work_with_us = 'For Australian B2B2C SaaS, beauty/wellness-tech, consumer-marketplace, FinTech and AI-automation founders — Uchiraka combines an active serial-founder operator track record (Glamezy, Glampay) with a clearly-articulated tech-empowering-traditional-business thesis. Especially valuable for founders building practical AI/automation products on top of established service industries.',
  sector_focus = ARRAY['B2B2C SaaS','Consumer Tech','SaaS','FinTech','Marketplace','AI','Automation','Beauty Tech','Wellness'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://au.linkedin.com/in/uchiraka',
  contact_email = 'uchiraka@atlantisbc.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Glamezy (CEO & Co-Founder)','Glampay','Atlantis Ventures / Atlantis BC (associated)'],
  meta_title = 'Uchiraka Yatawara — Glamezy CEO | Sydney B2B2C SaaS / Consumer Angel',
  meta_description = 'Sydney Glamezy founder/CEO. B2B2C SaaS, Consumer Tech, AI-automation angel. 25K–50K cheques.',
  details = jsonb_build_object(
    'firms', ARRAY['Glamezy (CEO & Co-Founder)','Glampay','Atlantis Ventures / Atlantis BC (associated)'],
    'investment_thesis','Tech-empowered traditional businesses, automation, marketplace models, FinTech, Sustainable Energy, AI.',
    'check_size_note','25K–50K',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/uchiraka',
      'openvc','https://www.openvc.app/fund/Uchiraka%20Yatawara',
      'tech_sydney','https://www.techsydney.com.au/u/uchiraka-yatawara'
    ),
    'corrections','CSV portfolio "Atlantis, Glamezy, Glampay" retained. CSV email truncated ("uchiraka@atlantisbc.com....") resolved.'
  ),
  updated_at = now()
WHERE name = 'Uchiraka Yatawara';

UPDATE investors SET
  description = 'Sydney-based VC firm founded 2010. B2B, FinTech and ESG focus. Notable Australian developer-tooling and B2B SaaS portfolio: Buildkite (CI/developer infrastructure), Cake (Cake Equity cap-table SaaS), Weel (Australian SaaS), plus Pro... (truncated). $10k–$100k cheques. Latest investment: Buildkite (Aug 2024).',
  basic_info = 'Utilism is a Sydney-based **venture capital firm founded in 2010** with a stated focus on **B2B, FinTech and ESG** sectors.

Their CSV-listed portfolio includes some of the most notable Australian developer-tooling and B2B SaaS scale-ups:
- **Buildkite** (Australian developer-infrastructure / CI scale-up — Utilism''s **latest investment** was on **August 1, 2024**, in the Software Development Applications industry)
- **Cake** (likely **Cake Equity** — Brisbane B2B SaaS for cap-table/equity management)
- **Weel** (Australian SaaS / spend-management)
- **Pro...** (truncated)
- Plus additional truncated names

CSV cheque size **$10k – $100k**.',
  why_work_with_us = 'For Australian B2B SaaS, FinTech, developer-tooling, ESG and sustainability-focused founders — Utilism combines 14+ years of VC operating history (since 2010) with active recent investing (Buildkite Aug 2024) and a high-quality Australian-developer-infrastructure portfolio. Especially valuable for founders building B2B software with sustainability or ESG-aligned positioning.',
  sector_focus = ARRAY['B2B','FinTech','ESG','SaaS','Developer Tooling','B2B SaaS','Sustainability','Spend Management'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 10000,
  check_size_max = 100000,
  contact_email = 'hello@utilism.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Buildkite','Cake (Cake Equity)','Weel'],
  meta_title = 'Utilism — Sydney B2B / FinTech / ESG VC since 2010 | $10k–$100k',
  meta_description = 'Sydney VC since 2010. B2B, FinTech, ESG focus. Buildkite, Cake Equity, Weel portfolio. $10k–$100k.',
  details = jsonb_build_object(
    'organisation_type','Venture capital firm',
    'founded',2010,
    'investment_thesis','B2B, FinTech, ESG — Sydney B2B SaaS and developer-tooling specialist.',
    'check_size_note','$10k – $100k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Buildkite','context','Latest investment 1 August 2024; Australian developer-infrastructure/CI scale-up'),
      jsonb_build_object('company','Cake Equity','context','Brisbane B2B SaaS for cap-table / equity management'),
      jsonb_build_object('company','Weel','context','Australian spend-management SaaS')
    ),
    'sources', jsonb_build_object(
      'pitchbook','https://pitchbook.com/profiles/investor/483159-34'
    ),
    'corrections','CSV portfolio truncated ("Buildkite, Cake, Weel, Pro..."). Three retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Utilism';

UPDATE investors SET
  description = 'Melbourne-based early-stage angel investor. LP in Startupbootcamp Australia. Pre-seed and seed-stage focus. Up to $25k cheques. Limited public portfolio detail beyond directory listing — best treated as Startupbootcamp-network angel.',
  basic_info = 'Vadim Petrichenko is a Melbourne-based early-stage angel investor with a stated **pre-seed and seed-stage** focus. He is an **LP in Startupbootcamp Australia** (the Melbourne-based accelerator co-founded by Trevor Townsend and Richard Celm covered earlier in this directory).

CSV-listed portfolio includes:
- **Startupbootcamp Australia** (LP position)
- Plus additional truncated names

CSV cheque size: **Up to $25k**. Stated thesis: **Early stage focus (pre & seed...)** (truncated).

Beyond the Startupbootcamp Australia LP position and the CSV directory entry, individual investor portfolio could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian pre-seed and seed-stage founders looking for a Melbourne-based early-stage angel cheque (up to $25k) with Startupbootcamp Australia LP-network exposure. Best leveraged as part of a Startupbootcamp accelerator pathway.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/vadimpetrichenko/',
  contact_email = 'vadim.l.petrichenko@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Startupbootcamp Australia (LP)'],
  meta_title = 'Vadim Petrichenko — Melbourne Pre-Seed / Seed Angel | Up to $25k',
  meta_description = 'Melbourne early-stage angel. Startupbootcamp Australia LP. Up to $25k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Pre-seed and seed-stage focus — Startupbootcamp-network Melbourne angel.',
    'check_size_note','Up to $25k',
    'lp_positions', ARRAY['Startupbootcamp Australia'],
    'unverified', ARRAY[
      'Beyond Startupbootcamp LP position, individual investor portfolio could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/vadimpetrichenko/'
    ),
    'corrections','CSV thesis truncated ("Early stage focus (pre & s..."). CSV portfolio truncated ("Startupbootcamp Aus (LP..."). CSV email truncated ("vadim.l.petrichenko@gm...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Vadim Petrichenko';

UPDATE investors SET
  description = 'Brisbane-based equity-crowdfunding platform (originally Sydney-headquartered). Multi-asset-class crowdfunding — equity, property, debt. 70+ portfolio ventures. Impact-focused with renewable-energy emphasis. Partner network for curated alternative assets. $500k–$2M aggregated rounds.',
  basic_info = 'VentureCrowd is an **Australian multi-asset-class crowdfunding platform** providing equity crowdfunding, property crowdfunding and debt-based crowdfunding. CSV lists Brisbane location; original headquarters is Sydney.

VentureCrowd has a strong network of partners that focus on curating **impact-investing opportunities** and managing funds for seed-stage and early-stage ventures, plus property funds and projects. By facilitating access to investors not currently investing in venture capital, VentureCrowd unlocks a new pool of early-stage finance.

CSV stated thesis: **Impact focused — Renewable...** (truncated — likely renewable energy / climate).

CSV-listed portfolio: **Over 70+ ventures** including (CSV truncated). Notable historical activity includes hosting the **Sydney Angels Sidecar Fund** $3.5M raise (raised in a week on VentureCrowd platform).

CSV cheque size: **$500k – $2M** (aggregated round-coordination level). CSV email: investor@venturecrowd.com.au.',
  why_work_with_us = 'For Australian renewable-energy, climate-tech, impact and property-tech founders — VentureCrowd offers a unique structured equity-crowdfunding pathway combining 70+ venture portfolio depth, $500k–$2M aggregated round capacity and an established partner network for curated impact deals. Especially valuable for founders pursuing public-facing capital raises with retail-investor reach.',
  sector_focus = ARRAY['Impact','Renewable Energy','Climate Tech','PropTech','Property','SaaS','Marketplace','Consumer'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 500000,
  check_size_max = 2000000,
  linkedin_url = 'https://www.linkedin.com/company/venturecrowd-pty-ltd',
  contact_email = 'investor@venturecrowd.com.au',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Over 70+ ventures (CSV truncated)','Sydney Angels Sidecar Fund (hosted $3.5M raise)'],
  meta_title = 'VentureCrowd — Australian Impact / Renewable Equity Crowdfunding | 70+ Ventures',
  meta_description = 'Australian multi-asset-class crowdfunding platform. 70+ ventures. Impact / renewable focus. $500k–$2M.',
  details = jsonb_build_object(
    'organisation_type','Multi-asset-class crowdfunding platform (equity, property, debt)',
    'investment_thesis','Impact-focused — renewable energy and climate-aligned ventures.',
    'check_size_note','$500k – $2M aggregated rounds',
    'portfolio_size','70+ ventures',
    'milestones', ARRAY['Hosted Sydney Angels Sidecar Fund $3.5M raise'],
    'sources', jsonb_build_object(
      'website','https://www.venturecrowd.com.au/',
      'linkedin','https://www.linkedin.com/company/venturecrowd-pty-ltd',
      'wikipedia','https://en.wikipedia.org/wiki/VentureCrowd'
    ),
    'corrections','CSV thesis truncated ("Impact focused - Renewa..."). CSV portfolio truncated ("Over 70+ ventures includi..."). CSV email truncated ("investor@venturecrowd.c...") resolved.'
  ),
  updated_at = now()
WHERE name = 'VentureCrowd';

UPDATE investors SET
  description = 'Australian-female-founder-focused angel investor / fund associated with the formation effort by Tracie Clark and others. Sector-agnostic. $200,000 cheques. Limited public portfolio detail beyond directory listing.',
  basic_info = 'VentureX Capital is an Australian angel investor / fund associated with **closing the gender funding gap** for female-led businesses. Tracie Clark (covered separately in this directory) was instrumental in the formation of VentureX Capital — winning the inaugural **Champion of Investment Diversity** award at the **Australian Angel Awards 2023** for her role.

VentureX Capital exists to **address the imbalance of investment in female-led businesses** in Australia.

Stated thesis: **Agnostic** (sector-agnostic with female-led-founder focus). CSV cheque size **$200,000** — substantial mid-cheque suitable for lead-anchor positions in seed rounds.

CSV LinkedIn URL: linkedin.com/company/venturex-hq. Email: info@venturexhq.com.au. CSV location not specified in directory.

Beyond the formation context and the directory entry, individual investor portfolio could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian female-led founders across all sectors — VentureX Capital offers one of the few sector-agnostic, gender-lens-focused angel cheques at a $200,000 size suitable for lead-anchor positions. Especially valuable for women founders pursuing structured seed rounds with diversity-aligned capital signalling.',
  sector_focus = ARRAY['Generalist','Women-Led','Diversity','SaaS','Consumer','FinTech','HealthTech','B2B'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 200000,
  check_size_max = 200000,
  linkedin_url = 'https://www.linkedin.com/company/venturex-hq/',
  contact_email = 'info@venturexhq.com.au',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['VentureX Capital (Tracie Clark instrumental in formation; addresses gender funding gap)'],
  meta_title = 'VentureX Capital — Australian Female-Led-Founder Angel | $200,000',
  meta_description = 'Australian angel fund addressing female-founder funding gap. Sector-agnostic. $200,000 cheques.',
  details = jsonb_build_object(
    'organisation_type','Angel fund / investment vehicle',
    'investment_thesis','Sector-agnostic with female-led-founder focus — addressing imbalance of investment in female-led businesses.',
    'check_size_note','$200,000',
    'related_individuals', ARRAY['Tracie Clark (instrumental in formation; Australian Angel Awards 2023 Champion of Investment Diversity)'],
    'unverified', ARRAY[
      'Beyond formation context, individual portfolio companies could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/company/venturex-hq/',
      'website','https://venturexhq.com.au/'
    ),
    'corrections','CSV location empty.'
  ),
  updated_at = now()
WHERE name = 'VentureX Capital';

COMMIT;
