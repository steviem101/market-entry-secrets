-- Enrich angel investors — batch 02u (records 124-128: Josh Masters → Justin Dry)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based wine importer (Vino Cammino) turned startup advisor and climate-tech angel investor. Particular interest in companies solving the climate crisis. CSV-listed portfolio: Carbonaught (enhanced rock weathering carbon removal), Zoshon and others. $10k–$50k cheques.',
  basic_info = 'Josh Masters is a Sydney/Darlinghurst-based wine importer and startup advisor/investor. He runs **Vino Cammino Pty Ltd** as his primary operating business and invests in and advises a small number of Australian-based technology businesses with particular interest in companies solving the climate crisis.

His CSV-listed portfolio includes **Carbonaught** (enhanced rock-weathering carbon-removal company; backed by Antler Australia early), Zoshon and additional truncated names.',
  why_work_with_us = 'For Australian climate-tech and consumer-tech founders looking for a small-to-mid cheque from an investor with consumer-products operating context (Vino Cammino) plus climate-tech thesis alignment.',
  sector_focus = ARRAY['Climate','Climate Tech','Carbon Removal','Consumer','SaaS','Wine/FoodTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/josh-masters/',
  contact_email = 'masters.jd@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Vino Cammino (operating)','Carbonaught','Zoshon'],
  meta_title = 'Josh Masters — Vino Cammino | Sydney Climate-Tech Angel',
  meta_description = 'Sydney wine importer + startup advisor + climate-tech angel. Carbonaught, Zoshon. $10k–$50k.',
  details = jsonb_build_object(
    'operating_role','Wine Importer, Vino Cammino Pty Ltd',
    'investment_thesis','Climate-tech and consumer-tech with bias toward climate-crisis solutions.',
    'check_size_note','$10k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/josh-masters',
      'climate_salad_investors','https://www.climatesalad.com/resources/climate-tech-investor-list'
    ),
    'corrections','CSV portfolio truncated. Two retained as listed.'
  ),
  updated_at = now()
WHERE name = 'Josh Masters';

UPDATE investors SET
  description = 'Sydney-based management consultant (ex-Kearney) and climate-and-impact angel investor. TEDxDarlinghurst organiser. 10+ years strategy/operations consulting. Cleantech, SaaS and Impact focus. $10k–$25k cheques.',
  basic_info = 'Juan Bejjani is a Sydney-based management consultant (ex-Kearney) with 10+ years of experience providing strategy/operations advice to organisations. He runs **TEDxDarlinghurst** to bring the TED CountDown format to Sydney and help Australia accelerate solutions to the climate crisis.

He helps early-stage entrepreneurs with market research, strategy, operations and sales. His direct cleantech operating role: he developed corporate strategy, structured the business plan and raised the seed round for a cleantech CEO, including business development of government grants, strategic partners and product pipeline.

His CSV cheque size $10k–$25k. Sector focus: Cleantech, SaaS, Impact.',
  why_work_with_us = 'For Australian cleantech, climate-tech, SaaS and impact-led founders, Juan offers Kearney-level strategy advisory plus TEDxDarlinghurst climate-community visibility on a small first cheque.',
  sector_focus = ARRAY['Clean Tech','SaaS','Impact','Climate','Sustainability','Strategy Consulting'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/juanbejjani/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['TEDxDarlinghurst (Organiser)','Kearney (ex-Management Consultant)'],
  meta_title = 'Juan Bejjani — Sydney Cleantech/Impact Angel | TEDx Darlinghurst',
  meta_description = 'Sydney management consultant (ex-Kearney). TEDxDarlinghurst organiser. Cleantech/SaaS/Impact angel. $10k–$25k.',
  details = jsonb_build_object(
    'current_roles', ARRAY['Management Consultant (ex-Kearney)','TEDxDarlinghurst Organiser','Entrepreneur Mentor','Angel Investor'],
    'experience_years','10+ years strategy/operations consulting',
    'check_size_note','$10k–$25k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/juanbejjani/'
    ),
    'corrections','CSV LinkedIn URL had typo (juanbeijjani). Resolved to juanbejjani.'
  ),
  updated_at = now()
WHERE name = 'Juan Bejjani';

UPDATE investors SET
  description = 'Melbourne-based Managing Director of Valyrian Private Wealth (specialist HNW + family-office wealth and lending advisor). 20+ years across HSBC, RBS, CBA, Alpha Fund Managers, Bank of America Merrill Lynch and ANZ. CPA. Pre-seed to Series B sector-agnostic angel investing. $25k–$100k cheques.',
  basic_info = 'Julien Brodie CPA is a Melbourne-based wealth-management Managing Director and angel investor. He is **Managing Director of Valyrian Private Wealth** — a specialist provider of wealth advice and lending solutions for high-net-worth individuals and family offices.

His pre-Valyrian career spans 20 years across institutions including **HSBC, RBS, CBA, Alpha Fund Managers, Bank of America Merrill Lynch and ANZ**. He holds a CPA qualification.

His angel posture per CSV is generalist pre-seed to Series B with $25k–$100k cheques.',
  why_work_with_us = 'For Australian founders raising structured rounds from pre-seed through Series B, Julien offers Valyrian Private Wealth HNW network reach plus 20-year multi-bank wealth-management institutional context.',
  sector_focus = ARRAY['FinTech','SaaS','Wealth Management','Generalist','Consumer','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A','Series B'],
  check_size_min = 25000,
  check_size_max = 100000,
  website = 'https://vpwealth.com.au',
  linkedin_url = 'https://www.linkedin.com/in/julienbrodie/',
  contact_email = 'julien@vpwealth.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Valyrian Private Wealth (Managing Director)','HSBC (ex)','RBS (ex)','CBA (ex)','Alpha Fund Managers (ex)','Bank of America Merrill Lynch (ex)','ANZ (ex)'],
  meta_title = 'Julien Brodie — Valyrian Private Wealth MD | Melbourne Generalist Angel',
  meta_description = 'Melbourne MD Valyrian Private Wealth. 20+ years HSBC/RBS/CBA/BAML. CPA. Pre-seed to Series B. $25k–$100k.',
  details = jsonb_build_object(
    'firm','Valyrian Private Wealth (HNW + family-office wealth advisor)',
    'role','Managing Director',
    'experience_years','20+ years across major banking and asset-management institutions',
    'credentials', ARRAY['CPA'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/julienbrodie/',
      'valyrian_team','https://vpwealth.com.au/team/',
      'valyrian_about','https://vpwealth.com.au/about/'
    ),
    'corrections','CSV portfolio empty — populated with verified institutional employer affiliations.'
  ),
  updated_at = now()
WHERE name = 'Julien Brodie';

UPDATE investors SET
  description = 'Sydney-based serial founder and angel investor. Founder & CEO of Snug.com (rental platform). Founded Stayz online holiday rental marketplace 1999, sold to Stayz/Fairfax 2011 for $29M. Ex-HomeAway senior management. Sydney Angels member. 12+ angel investments across marketplace, SaaS, fintech, property, IoT and labour.',
  basic_info = 'Justin Butterworth is a Sydney-based serial founder, NED, active angel investor and Australian property-tech innovator.

His operating story: self-funded and launched Australia''s first online holiday-rental e-commerce marketplace in 1999, sold to **Stayz/Fairfax in 2011 for $29M**. Then held senior management positions at **HomeAway.com (NASDAQ: AWAY)** for 2 years post-acquisition.

He sold his house and took 16 months off to build **Snug.com (Snug Technologies)** — an online platform that streamlines the rental process for renters and property managers — where he is Founder & Chief Executive Officer.

His angel-investment activity is via **Sydney Angels** and personal direct investments. He has 12+ investments across marketplace, platform, SaaS, fintech, property, IoT and labour categories. CSV-listed portfolio includes **Snug.com** (his own founder company), **Jayride** (airport-transfer marketplace, ASX-listed) and **Instacart**.',
  why_work_with_us = 'For Australian marketplace, platform, SaaS, fintech, property and IoT founders, Justin offers an exit-tested marketplace operator''s pattern recognition plus Sydney Angels community visibility.',
  sector_focus = ARRAY['Marketplace','Platform','SaaS','FinTech','PropTech','IoT','Labour','Social Impact'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://snug.com',
  linkedin_url = 'https://linkedin.com/in/justin-butterworth/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Snug.com (Founder & CEO)','Stayz (founder; Fairfax exit 2011, $29M)','HomeAway/Vrbo (ex-senior management)','Sydney Angels','Jayride','Instacart'],
  meta_title = 'Justin Butterworth — Snug.com / ex-Stayz | Sydney Marketplace Angel',
  meta_description = 'Sydney founder Snug.com. Founded Stayz (Fairfax $29M exit 2011). Ex-HomeAway. Sydney Angels. 12+ marketplace/SaaS investments.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Snug.com (Snug Technologies; current)','Stayz (1999 founder; Fairfax exit 2011, $29M)'],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Stayz','category','Online holiday rental marketplace','acquirer','Stayz/Fairfax','year',2011,'value_aud','$29M')
    ),
    'prior_roles', ARRAY['HomeAway.com / NASDAQ: AWAY (senior management)','Sydney Angels member'],
    'angel_portfolio_count','12+ marketplace/platform/SaaS/fintech investments',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/justin-butterworth/',
      'rocketreach','https://rocketreach.co/justin-butterworth-email_135949869',
      'smartcompany','https://www.smartcompany.com.au/property/why-entrepreneur-justin-butterworth-sold-his-house-and-took-16-months-off-to-fix-australias-broken-rental-market/',
      'startcon','https://www.startcon.com/events/startup-sessions-with-justin-butterworth/'
    ),
    'corrections','CSV portfolio truncated. Snug.com is his founder company; retained. Jayride and Instacart kept as listed (cap-table participation per CSV).'
  ),
  updated_at = now()
WHERE name = 'Justin Butterworth';

UPDATE investors SET
  description = 'Melbourne-based Co-Founder & Joint CEO of Vinomofo (online wine retailer; AU/NZ/Singapore). Spotify Young Entrepreneur of the Year (Australian Startup Awards). Top 50 People in E-Commerce 2016-2020 (Internet Retailing). Angel investor for 3-4 years personally and via Blackbird Venture''s Startmate program. Notable investments: Oddup, Clover (fintech robo-advice).',
  basic_info = 'Justin Dry is a Melbourne-based serial entrepreneur and Co-Founder/Joint CEO of **Vinomofo** — Australia''s most successful online wine retailer. Vinomofo was launched in April 2011 from a garage in Adelaide and now operates across Australia, NZ and Singapore. The company was started with co-founder Andre Eikmeier under the motto "no bowties and bullshit."

He has been awarded **Spotify Young Entrepreneur of the Year** at the Australian Startup Awards and named one of the Top 50 People in E-Commerce 2016, 2017, 2018, 2019 and 2020 by Internet Retailing.

His angel investing has been done over 3-4 years both personally and through **Blackbird Venture''s Startmate program**, looking for disruptive businesses. Notable investments: **Oddup** (data/research) and **Clover** (fintech robo-advice).',
  why_work_with_us = 'For Australian consumer, e-commerce, marketplace and fintech founders, Justin offers Vinomofo''s consumer-internet operating credibility plus Blackbird/Startmate co-investment exposure.',
  sector_focus = ARRAY['Consumer','E-commerce','FinTech','Marketplace','Wine/FoodTech','Disruptive Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/justindry/',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Vinomofo (Co-Founder & Joint CEO; founded 2011)','Oddup','Clover (fintech robo-advice)','Startmate (mentor + co-investor via Blackbird Venture)'],
  meta_title = 'Justin Dry — Vinomofo Co-Founder | Melbourne Consumer Angel',
  meta_description = 'Melbourne Co-Founder/Joint CEO Vinomofo. Spotify Young Entrepreneur of the Year. Oddup, Clover. Startmate co-investor.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Vinomofo (Co-Founder, Joint CEO; founded April 2011 with Andre Eikmeier)'],
    'recognition', ARRAY['Spotify Young Entrepreneur of the Year (Australian Startup Awards)','Top 50 People in E-Commerce 2016/2017/2018/2019/2020 (Internet Retailing)'],
    'angel_portfolio_count','2 verified investments via personal and Blackbird/Startmate co-investment',
    'verified_investments', ARRAY['Oddup','Clover (fintech robo-advice)'],
    'sources', jsonb_build_object(
      'crunchbase','https://www.crunchbase.com/person/justin-dry',
      'pitchbook','https://pitchbook.com/profiles/investor/119877-85',
      'wellfound','https://wellfound.com/p/justin-dry',
      'smartcompany_clover','https://www.smartcompany.com.au/startupsmart/news/vinomofo-justin-dry-backs-fintech-robo-advice-startup-clover/',
      'lawson_media','https://lawson.media/episodes/the-road-to-vino-with-justin-dry-ceo-of-vinomofo'
    ),
    'corrections','CSV portfolio empty — populated with Vinomofo (founder company), Oddup and Clover (verified angel investments).'
  ),
  updated_at = now()
WHERE name = 'Justin Dry';

COMMIT;
