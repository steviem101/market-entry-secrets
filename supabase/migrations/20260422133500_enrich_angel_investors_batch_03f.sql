-- Enrich angel investors — batch 03f (records 179-183: Nick Moutzouris → Nullarbor Ventures)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based angel investor. Active on Australian Childcare Alliance (Victoria) executive board. Limited public investor profile beyond Australian angel directory listing.',
  basic_info = 'Nick Moutzouris is a Melbourne-based angel investor listed in the Australian angel investor directory. Public profile shows board involvement with the **Australian Childcare Alliance (Victoria) Executive Board**, suggesting potential affinity with childcare, early-education and family-services categories. Beyond the directory listing, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory listing — childcare/early-education board role suggests possible sector affinity for those founders.',
  sector_focus = ARRAY['Generalist','Childcare','Early Education','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/nick-moutzouris-821a3b129/',
  contact_email = 'nickmoutzouris1@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Nick Moutzouris — Melbourne Angel | Childcare/Edu Affinity',
  meta_description = 'Melbourne-based angel investor. Australian Childcare Alliance Victoria board.',
  details = jsonb_build_object(
    'board_roles', ARRAY['Australian Childcare Alliance (Victoria) — Executive Board'],
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/nick-moutzouris-821a3b129/'
    ),
    'corrections','CSV LinkedIn URL appeared truncated.'
  ),
  updated_at = now()
WHERE name = 'Nick Moutzouris';

UPDATE investors SET
  description = 'Geelong-based serial founder, executive and angel investor. Former CEO of Sky Software (Australian education-management SaaS, sold to UK-listed company for ~$21M). Active in Geelong Angel Investment Group. EdTech specialist angel.',
  basic_info = 'Nick Stanley is a Geelong-based serial founder, executive and angel investor. He is best known as the **former CEO of Sky Software** — the Geelong-headquartered education-management SaaS that was acquired by a UK-listed company for approximately AUD$21M, marking one of regional Victoria''s most successful tech exits.

He is active in the **Geelong Angel Investment Group**, which focuses on backing high-growth startups and early-stage commercial opportunities in the Geelong region. His CSV-listed portfolio includes:
- **Sky Software** (former CEO; exited)
- **Localised** (cross-border SaaS)
- Plus additional truncated names

Stated thesis: **EdTech**. CSV cheque size not specified.',
  why_work_with_us = 'For Australian EdTech founders — particularly those with a regional Victorian footprint or interest in the Geelong startup community — Nick brings sector-relevant operating depth (Sky Software exit) and access to the regional angel community. Especially valuable for SaaS founders selling into education or training markets.',
  sector_focus = ARRAY['EdTech','SaaS','B2B','Education','Cross-border'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/nickstanleyceo',
  location = 'Geelong, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Sky Software (former CEO; exited)','Localised','Geelong Angel Investment Group (member)'],
  meta_title = 'Nick Stanley — Sky Software ex-CEO | Geelong EdTech Angel',
  meta_description = 'Geelong-based EdTech angel. Former Sky Software CEO (exited to UK). Geelong Angel Investment Group.',
  details = jsonb_build_object(
    'prior_career','CEO, Sky Software — Geelong-based education-management SaaS acquired by UK-listed company for ~$21M',
    'investment_thesis','EdTech specialist; regional Victoria focus.',
    'community_roles', ARRAY['Geelong Angel Investment Group (member)'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/nickstanleyceo',
      'geelong_indy','https://geelongindy.com.au/indy/07-03-2014/sky-software-sale-nets-21-million/'
    ),
    'corrections','CSV portfolio truncated ("Sky Software, Localised, ..."). Two retained verbatim plus former-CEO context.'
  ),
  updated_at = now()
WHERE name = 'Nick Stanley';

UPDATE investors SET
  description = 'Melbourne-based angel investor and former Investment Director at Rampersand VC. Currently runs Start Small Ventures (family-office angel access vehicle). ClimateTech, HealthTech and women-founder focus. Portfolio includes Cake Equity and Muso. $5k–$20k personal cheques.',
  basic_info = 'Nicole Kleid Small is a Melbourne-based angel investor with 15+ years of experience across venture capital, investment banking and strategy consulting. She was the **Investment Director at Rampersand** — one of Australia''s top early-stage VCs — for 4 years, where she assessed thousands of startups and invested into Australian startups across sectors.

Prior to VC, she worked in the **Product Strategy team at SEEK** and as a management consultant and investment banker.

Currently she runs **Start Small Ventures** — helping family offices and individual investors access and invest directly in early-stage Australian startups. She is a vocal **ClimateTech** advocate (published essays for Climate Salad) and a notable backer of **women-led** founders.

Her CSV-listed portfolio includes:
- **Cake Equity** (Brisbane B2B SaaS for cap-table/equity management — also Kane Templeton/PB Ventures/Torus connection)
- **Muso** (consumer-tech)
- Plus additional truncated names

CSV cheque size $5k–$20k for personal angel cheques. Larger Start Small Ventures-coordinated allocations possible.',
  why_work_with_us = 'For Australian climate-tech, health-tech and women-founder companies — Nicole brings a rare combination of institutional VC experience (4 years Rampersand Investment Director), family-office access (Start Small Ventures), and a strong personal climate/health thesis. Especially valuable for founders looking to build a syndicated angel round through family-office capital.',
  sector_focus = ARRAY['ClimateTech','HealthTech','SaaS','Women-Led','Impact','Energy Transition'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 20000,
  linkedin_url = 'https://www.linkedin.com/in/nicolekleid/',
  contact_email = 'nicole@startsmallventures.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Cake Equity','Muso','Start Small Ventures (Founder)','Rampersand (former Investment Director)'],
  meta_title = 'Nicole Kleid Small — ex-Rampersand | Start Small Ventures | Melbourne',
  meta_description = 'Melbourne ClimateTech/HealthTech angel. ex-Rampersand Investment Director. Start Small Ventures. $5k–$20k.',
  details = jsonb_build_object(
    'firms', ARRAY['Start Small Ventures (Founder)','Rampersand (former Investment Director, 4 years)'],
    'prior_career','SEEK Product Strategy; management consultant; investment banker',
    'investment_thesis','ClimateTech, HealthTech and women-founder focused — combines personal angel cheques with family-office syndication via Start Small Ventures.',
    'check_size_note','$5k–$20k personal',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/nicolekleid',
      'start_small_ventures','https://startsmallventures.com/about-us',
      'climate_salad_essay','https://www.climatesalad.com/posts/nicole-kleid-small-im-no-greenie-but-now-is-the-time-to-invest-in-climatetech'
    ),
    'corrections','CSV portfolio truncated ("Cake Equity, Muso, Mass..."). Two retained verbatim. CSV email truncated ("nicole@startsmallventure...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Nicole Kleid Small';

UPDATE investors SET
  description = 'Sydney-based angel investor. $20k cheques. Limited public investor profile beyond Australian angel directory listing.',
  basic_info = 'Nikky Tejas is listed in the Australian angel investor directory as a Sydney-based angel investor with $20k cheque size. Beyond the directory entry, no detailed public investor profile, portfolio or sector-focus information could be uniquely corroborated from public-source search.',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory listing.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 20000,
  check_size_max = 20000,
  contact_email = 'Nikkyp1089@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Nikky Tejas — Sydney Angel | $20k',
  meta_description = 'Sydney-based angel investor. Limited public profile. $20k cheques.',
  details = jsonb_build_object(
    'check_size_note','$20k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, no detailed public investor profile could be uniquely corroborated.'
    ],
    'corrections','CSV had only name, $20k, Sydney and email.'
  ),
  updated_at = now()
WHERE name = 'Nikky Tejas';

UPDATE investors SET
  description = 'Sydney-based nano-VC fund and angel syndicate investing in ANZ early-stage startups. Founded by Tim Rossanis (Turo Australia MD), Ariel Hersh (Seek Investments) and Michael Schwartz (Maxfine GM). Portfolio includes Mr Yum, Superhero, Komodo, Birdi. $10k–$20k cheque ranges (syndicate scale).',
  basic_info = 'Nullarbor Ventures is a Sydney-based **nano-VC fund and angel syndicate** investing in the best early-stage startups in Australia and New Zealand — both directly and through top-tier and emerging fund LP positions.

The founding team:
- **Tim Rossanis** — Managing Director, Turo Australia
- **Ariel Hersh** — Investment Director, Seek Investments
- **Michael Schwartz** — General Manager, Maxfine; Chartered Accountant

Their portfolio includes high-quality Australian and ANZ scale-ups:
- **Mr Yum** (hospitality QR-ordering platform — large 2022 Series funding)
- **Superhero** (Australian retail-investing platform)
- **Komodo** (Australian student wellbeing SaaS)
- **Birdi** (drone analytics)
- **Swing**
- **Adatree**
- **Steppen**
- **Landlord Studio**

CSV cheque size $10k–$20k. Active syndicate via Aussie Angels platform.',
  why_work_with_us = 'For Australian and New Zealand early-stage founders — especially in consumer marketplaces, fintech, prop-tech and SaaS — Nullarbor combines a high-quality founder base (Turo, Seek Investments, Maxfine operators) with a sharply curated portfolio that includes some of ANZ''s breakout consumer-tech names. The syndicate model means access to multiple LPs in a single conversation.',
  sector_focus = ARRAY['Generalist','Consumer','SaaS','Marketplace','FinTech','PropTech','HealthTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 20000,
  contact_email = 'nullarborventures@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Mr Yum','Superhero','Komodo','Birdi','Swing','Adatree','Steppen','Landlord Studio'],
  meta_title = 'Nullarbor Ventures — Sydney Nano-VC Syndicate | Mr Yum, Superhero',
  meta_description = 'Sydney nano-VC syndicate. Mr Yum, Superhero, Komodo, Birdi portfolio. $10k–$20k via Aussie Angels.',
  details = jsonb_build_object(
    'organisation_type','Nano-VC fund / angel syndicate',
    'founding_team', jsonb_build_array(
      jsonb_build_object('name','Tim Rossanis','role','Managing Director, Turo Australia'),
      jsonb_build_object('name','Ariel Hersh','role','Investment Director, Seek Investments'),
      jsonb_build_object('name','Michael Schwartz','role','General Manager, Maxfine; Chartered Accountant')
    ),
    'investment_thesis','Sector-agnostic ANZ early-stage; direct + fund-of-funds.',
    'check_size_note','$10k–$20k via syndicate',
    'sources', jsonb_build_object(
      'aussie_angels','https://app.aussieangels.com/syndicate/nullarbor-ventures',
      'linkedin','https://au.linkedin.com/company/nullarborventures'
    ),
    'corrections','CSV portfolio truncated ("Mr Yum, Superhero, Kom..."). Eight portfolio companies confirmed via public sources.'
  ),
  updated_at = now()
WHERE name = 'Nullarbor Ventures';

COMMIT;
