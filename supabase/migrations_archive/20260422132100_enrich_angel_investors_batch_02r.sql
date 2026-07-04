-- Enrich angel investors — batch 02r (records 109-113: James Crowley → Jason Serda)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based deep-tech founder, CTO and climate-tech angel investor. Venture Partner at Satgana (pre-seed climate fund supporting Europe and Africa). Mentor at Creative Destruction Lab (CDL). Atomitz operating company. Sub-$10k cheques into climate tech and impact founders.',
  basic_info = 'James Crowley is a Sydney-based entrepreneurial founder, CTO and angel investor with a deep-tech operating background and an explicit climate-tech-and-impact thesis. He acts as a technical advisor to impact-driven founders, scaling start-ups and technology across diverse sectors — energy, agriculture, finance and health.

His current roles:
- **Venture Partner, Satgana** — pre-seed climate-tech fund supporting founders across Europe and Africa.
- **Mentor, Creative Destruction Lab (CDL)** — global deep-tech accelerator program.
- **Atomitz** — operating company (per his LinkedIn).

His CSV-listed personal angel portfolio includes:
- **UNDO** — UK carbon-removal company (enhanced rock weathering for atmospheric carbon removal).
- **Dandelion Energy** — US geothermal-heating residential climate-tech company (founded by ex-Google X / Alphabet team).

His CSV cheque size of "up to $10k" reflects small first-cheque participation typical of operator-angels making early bets in climate-tech.',
  why_work_with_us = 'For Australian climate-tech, geothermal, carbon-removal and impact-tech founders thinking about Europe/Africa expansion or US scale, James offers a small early cheque alongside Satgana fund-level visibility into European climate deal flow and CDL deep-tech acceleration network access.',
  sector_focus = ARRAY['Climate Tech','Impact','Geothermal','Carbon Removal','Energy','Agriculture','HealthTech','DeepTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 0,
  check_size_max = 10000,
  linkedin_url = 'https://linkedin.com/in/jamescrowley',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['UNDO (UK enhanced rock weathering carbon removal)','Dandelion Energy (US geothermal residential heating)','Satgana (Venture Partner)','Atomitz','Creative Destruction Lab (Mentor)'],
  meta_title = 'James Crowley — Satgana / CDL | Sydney Climate-Tech Angel',
  meta_description = 'Sydney deep-tech founder/CTO. VP Satgana (pre-seed climate fund EU/Africa). CDL Mentor. UNDO, Dandelion Energy portfolio. Up to $10k.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Venture Partner, Satgana (pre-seed climate-tech fund — Europe + Africa)',
      'Mentor, Creative Destruction Lab',
      'Atomitz'
    ],
    'investment_thesis','Climate tech and impact founders across energy, agriculture, finance and health.',
    'check_size_note','Up to $10k',
    'verified_portfolio', ARRAY[
      'UNDO (enhanced rock weathering carbon removal, UK)',
      'Dandelion Energy (geothermal residential heating, US — Alphabet X spinout)'
    ],
    'sources', jsonb_build_object(
      'cdl_mentor','https://creativedestructionlab.com/mentors/james-crowley/',
      'linkedin','https://www.linkedin.com/in/jamescrowley/',
      'dandelion_energy','https://www.ourcrowd.com/companies/dandelion-energy'
    ),
    'corrections','CSV portfolio truncated ("UNDO, Dandelion Energy,..."). Two retained verbatim with clarifying context. CSV LinkedIn URL had no protocol — resolved to https.'
  ),
  updated_at = now()
WHERE name = 'James Crowley';

UPDATE investors SET
  description = 'Sydney-based VC and angel investor with deep-tech, IoT, robotics and national-security thesis. Partner at BOKA Group Holdings I LP (deep-tech-funding firm with national-security focus). Director at Balmoral Industries. Senior Partner at Gilmour Space Technologies. Investment Director at Leap Capital. Fellow at Australian Strategic Policy Institute (ASPI). 10+ years VC + investment banking.',
  basic_info = 'James J. Tennant is a Sydney-based experienced VC and investment-banker with 10+ years experience across the United States and Australia in financial services. His current portfolio of roles spans deep-tech, defence-adjacent and space-tech investing:
- **Partner, BOKA Group Holdings I LP** — deep-tech funding firm with explicit focus on supporting companies aligned with national-security interests.
- **Director, Balmoral Industries**
- **Senior Partner, Gilmour Space Technologies** — Australian space-launch company.
- **Investment Director, Leap Capital**
- **Fellow, Australian Strategic Policy Institute (ASPI)** — Australia''s premier defence and strategic-policy think tank.

CSV-listed portfolio includes **WithYouWithMe** (workforce-tech, especially veterans-into-tech) and **TRIBE Global Ventures** (CSV: "TRIBE G..."). Cheque size $25k–$50k.',
  why_work_with_us = 'For Australian deep-tech, defence, IoT, robotics and space-tech founders, James is among the highest-leverage relationships in the Sydney scene — combining BOKA Group national-security investment thesis, Balmoral Industries directorship, Gilmour Space senior partnership and ASPI fellowship for defence-aligned policy reach.',
  sector_focus = ARRAY['DeepTech','IoT','Robotics','Defence','National Security','Space','Aerospace','Workforce Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/jamesjtennant',
  contact_email = 'james@balmoral.vc',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['BOKA Group Holdings I LP (Partner)','Balmoral Industries (Director)','Gilmour Space Technologies (Senior Partner)','Leap Capital (Investment Director)','Australian Strategic Policy Institute (Fellow)','WithYouWithMe','TRIBE Global Ventures'],
  meta_title = 'James J. Tennant — BOKA / Balmoral / Gilmour Space | Sydney DeepTech Angel',
  meta_description = 'Sydney VC + investment banker. Partner BOKA Group Holdings. Director Balmoral Industries. Senior Partner Gilmour Space. ASPI Fellow. $25–$50k.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Partner, BOKA Group Holdings I LP',
      'Director, Balmoral Industries',
      'Senior Partner, Gilmour Space Technologies',
      'Investment Director, Leap Capital',
      'Fellow, Australian Strategic Policy Institute (ASPI)'
    ],
    'experience_years','10+ years VC and investment banking (US + Australia)',
    'investment_thesis','Deep tech, IoT, robotics, defence and space technology with national-security alignment.',
    'check_size_note','$25k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://uk.linkedin.com/in/jamesjtennant',
      'crunchbase','https://www.crunchbase.com/person/james-tennant',
      'aspi_fellow','https://theorg.com/org/australian-strategic-policy-institute/org-chart/james-tennant',
      'wywm_speakers','https://events.withyouwithme.com/speakers/james-tennant',
      'littlesis','https://littlesis.org/entities/428477-James_J_Tennant'
    ),
    'corrections','CSV LinkedIn URL had no protocol — resolved to https. CSV portfolio truncated ("WithYouWithMe, TRIBE G..."). Resolved to TRIBE Global Ventures.'
  ),
  updated_at = now()
WHERE name = 'James J. Tennant';

UPDATE investors SET
  description = 'Sydney-based angel investor with marketplace and SaaS portfolio. CSV-listed portfolio includes Sendle (logistics marketplace), CoverGenius (insurtech) and Scape... (truncated). $50k–$100k cheques. Limited public investor profile — common-name caveat applies.',
  basic_info = 'Jamess Forrest (per CSV spelling) is a Sydney-based angel investor listed in the Australian angel directory at $50k–$100k cheque size. His CSV-listed portfolio reflects two of the most-cited Australian marketplace and insurtech success stories of the past decade:
- **Sendle** — Australian carbon-neutral parcel-delivery marketplace.
- **CoverGenius** — Australian-headquartered global insurtech ($300M+ raised, US scale-up).
- Additional name **Scape...** truncated in CSV — likely Scape Ventures or Scape Australia (could not be uniquely corroborated).

The directory listing has not been uniquely corroborated to a single LinkedIn or Crunchbase profile from public-source search alone (multiple "James Forrest" individuals exist in Australian and global business circles). Founders should expect to validate his profile and thesis directly via the listed email when they make contact.',
  why_work_with_us = 'For Australian marketplace, logistics-tech and insurtech founders raising $50k–$100k upper-mid cheques, Jamess''s CSV-listed portfolio (Sendle, CoverGenius) suggests he picks high-quality scaleable bets in those categories.',
  sector_focus = ARRAY['Marketplace','Logistics','InsurTech','SaaS','Consumer','PropTech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/jamess-forrest-753922/',
  contact_email = 'jamessforrest@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Sendle','CoverGenius'],
  meta_title = 'Jamess Forrest — Sydney Marketplace/InsurTech Angel | $50k–$100k',
  meta_description = 'Sydney angel investor. CSV portfolio: Sendle (carbon-neutral parcel delivery), CoverGenius (insurtech). $50k–$100k.',
  details = jsonb_build_object(
    'investment_thesis','Marketplace, logistics-tech and insurtech with bias toward scaleable Australian-origin companies.',
    'check_size_note','$50k–$100k',
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single LinkedIn/Crunchbase profile (multiple James Forrest individuals).',
      'CSV portfolio "Scape..." was truncated and could not be uniquely identified.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/jamess-forrest-753922/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'covergenius_bloomberg','https://www.bloomberg.com/profile/company/1703072D:AU'
    ),
    'corrections','CSV portfolio truncated. Two retained verbatim. Common-name caveat noted.'
  ),
  updated_at = now()
WHERE name = 'Jamess Forrest';

UPDATE investors SET
  description = 'Sydney-based angel investor with PropTech, HealthTech, MarTech and consumer-tech focus. $5k–$25k cheques. CSV-listed portfolio includes KindiCare (childcare comparison), ReciMe (recipe AI) and Flourish (truncated).',
  basic_info = 'Jason Chuck is a Sydney-based angel investor with a sector focus per CSV directory listing of **PropTech, HealthTech and MarTech** and a $5k–$25k cheque band — typical operator-angel small-cheque participation across multiple sectors.

His CSV-listed portfolio:
- **KindiCare** — Australian childcare-comparison and -booking platform.
- **ReciMe** — Australian recipe-AI consumer app (also in Henry Innis''s portfolio at record #100).
- **Flourish...** — truncated; could not be uniquely identified.

Beyond the CSV directory listing, detailed individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian proptech, healthtech and martech founders looking for a small first cheque from a Sydney-based generalist with operator-angel sensibilities, Jason offers a $5k–$25k entry. Best treated as a referral-led conversation given limited public profile.',
  sector_focus = ARRAY['PropTech','HealthTech','MarTech','SaaS','Consumer','EdTech','FoodTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/jasonchuck/',
  contact_email = 'jchuck@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['KindiCare','ReciMe'],
  meta_title = 'Jason Chuck — Sydney PropTech/HealthTech/MarTech Angel | $5–$25k',
  meta_description = 'Sydney angel investor. PropTech, HealthTech, MarTech focus. Portfolio: KindiCare, ReciMe. $5k–$25k cheques.',
  details = jsonb_build_object(
    'investment_thesis','PropTech, HealthTech and MarTech early-stage founders. Small first cheques.',
    'check_size_note','$5k–$25k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated from public-source search.',
      'CSV portfolio "Flourish..." was truncated and could not be uniquely identified.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/jasonchuck/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV portfolio truncated ("KindiCare, ReciMe, Flouri..."). Two verified names retained; trailing item flagged as unverified. CSV sector_focus "Protech, Healthtec, Mark..." resolved to PropTech, HealthTech, MarTech (corrected typos).'
  ),
  updated_at = now()
WHERE name = 'Jason Chuck';

UPDATE investors SET
  description = 'Sydney-based serial founder, fund manager and big-cheque angel investor. Founder & Managing Partner of Utiliti Group (global investor network with offices in Sydney + New York). Founded Parc Utiliti Venture Fund and 1in100 Ventures. Active investor since 2008 — 45+ startups with 11+ exits. Raised $100M+ in last year. $250k cheques.',
  basic_info = 'Jason Serda is a Sydney-based serial founder, fund manager and one of the most prolific big-cheque angel investors in Australia. He is **Founder and Managing Partner of Utiliti Group** — the global investor and operator network that operates from Sydney and New York.

He has been an active investor since 2008. His track record under the Utiliti brand:
- **45+ startups** invested in
- **11+ exits** to date
- **$100M+** raised across funds
- **8 investments** in the most recent year alone

He has founded multiple investment funds:
- **Parc Utiliti Venture Fund**
- **1in100 Ventures**

Recent portfolio additions include **Outstaffer**, **Citadel**, **Azura Fashion Group** (sustainable fashion), **DNX**, **CodeSource**, **Packaged**, **Mosh** (men''s health), **Yellow Canary** (regulatory tech) and **Terem**. He serves as Strategic Advisor and Board Observer at **Five Faces** (Brisbane Angels portfolio company).

CSV-listed cheque size is $250,000 — among the larger personal cheques in the Australian angel scene.',
  why_work_with_us = 'For Australian and US-based founders raising $250k+ angel cheques, Jason offers (a) Utiliti Group fund-level participation, (b) 1in100 Ventures + Parc Utiliti exposure, (c) cross-Pacific Sydney + New York investor-network reach, and (d) a 17-year investing track record with 11+ exits.',
  sector_focus = ARRAY['SaaS','Consumer','Fashion','Health','Regulatory Tech','Workforce Tech','Tech Enabled','DeepTech'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  check_size_min = 250000,
  check_size_max = 250000,
  website = 'https://www.utiliti.com',
  linkedin_url = 'https://www.linkedin.com/in/jserda',
  contact_email = 'jason.serda@utiliti.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Utiliti Group (Founder & Managing Partner)','Parc Utiliti Venture Fund (founder)','1in100 Ventures (founder)','Outstaffer','Citadel','Azura Fashion Group','DNX','CodeSource','Packaged','Mosh','Yellow Canary','Terem','Five Faces (Strategic Advisor + Board Observer)'],
  meta_title = 'Jason Serda — Utiliti Group MP | Sydney Big-Cheque Angel ($250k)',
  meta_description = 'Sydney founder/MP Utiliti Group + Parc Utiliti + 1in100 Ventures. 45+ investments since 2008, 11+ exits. $250k cheques. AU + NY.',
  details = jsonb_build_object(
    'firm','Utiliti Group (global investor + operator network; Sydney + NY)',
    'role','Founder & Managing Partner',
    'funds_founded', ARRAY['Parc Utiliti Venture Fund','1in100 Ventures'],
    'utiliti_stats', jsonb_build_object(
      'investing_since',2008,
      'startups_invested','45+',
      'exits','11+',
      'capital_raised_aud','$100M+',
      'recent_year_investments',8
    ),
    'verified_portfolio', ARRAY['Outstaffer','Citadel','Azura Fashion Group','DNX','CodeSource','Packaged','Mosh','Yellow Canary','Terem','Five Faces (advisor)'],
    'investment_thesis','Tech-enabled and deep-tech businesses across Australia and US with strong scale economics.',
    'check_size_note','$250,000',
    'sources', jsonb_build_object(
      'utiliti_team','https://www.utiliti.com/team/jason-serda',
      'linkedin','https://au.linkedin.com/in/jserda',
      'crunchbase','https://www.crunchbase.com/person/jason-serda',
      'crunchbase_utiliti','https://www.crunchbase.com/organization/utiliti-ventures',
      'theorg','https://theorg.com/org/utiliti-group/org-chart/jason-serda',
      '1in100_ventures','https://www.1in100ventures.com/our-team',
      'azura_press','https://tz.linkedin.com/posts/jserda_fashion-tech-azura-raises-2m-to-drive-circular-activity-6999137992283996161-HEi-',
      'azura_cb_insights','https://www.cbinsights.com/company/azura-fashion-group'
    ),
    'corrections','CSV portfolio truncated ("Azura Fashion Group, Mer..."). Expanded with verified Utiliti recent investments (Outstaffer, Citadel, DNX, CodeSource, Packaged, Mosh, Yellow Canary, Terem) and Five Faces advisor role. CSV LinkedIn URL had no protocol — resolved.'
  ),
  updated_at = now()
WHERE name = 'Jason Serda';

COMMIT;
