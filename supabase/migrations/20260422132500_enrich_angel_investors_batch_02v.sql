-- Enrich angel investors — batch 02v (records 129-133: Justus Hammer → Kenny Wong)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based serial entrepreneur and prolific angel investor. CEO and Co-founder of Mad Paws (pet-care marketplace). Founded Spreets in 2011 (Yahoo!7 $40M exit, 10 months). Founding investor and advisor at VICE Golf and Airtasker. Founder of Sellable (real-estate-tech). 45+ angel investments. Born Munich; M.IT Macquarie University.',
  basic_info = 'Justus Hammer is a Sydney-based serial founder and one of the most prolific Australian angel investors. He is CEO and Co-founder of **Mad Paws** — Australia''s leading pet-services marketplace.

His operating story is unusually condensed: he founded **Spreets** in 2011 and grew it to be Australia''s leading group-buying company with 1.5M+ members and 100+ employees in less than 12 months, exiting to Yahoo!7 for ~$40M just 10 months after founding. He is a founding investor and advisor at **VICE Golf** (golf D2C brand) and **Airtasker** (marketplace, ASX-listed).

His latest venture is **Sellable** — Australian real-estate-tech aiming to make residential property buying easier.

Born in Munich, Germany; played professional basketball before completing a Masters in Economics. Holds a Master of Information Technology from Macquarie University. 45+ angel investments over the past several years.',
  why_work_with_us = 'For Australian marketplace, consumer, retail and real-estate-tech founders, Justus combines exit-tested founder credentials (Spreets 10-month $40M exit) with active marketplace operator role at Mad Paws and 45+ portfolio pattern recognition.',
  sector_focus = ARRAY['Marketplace','Retail','Tech','Real Estate','Consumer','SaaS','PropTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 50000,
  linkedin_url = 'https://linkedin.com/in/justus-hammer-6a871b8',
  contact_email = 'justus.hammer@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Mad Paws (CEO, Co-founder)','Spreets (founder; Yahoo!7 $40M exit 2011)','VICE Golf (founding investor + advisor)','Airtasker (early investor + advisor)','Sellable (founder)'],
  meta_title = 'Justus Hammer — Mad Paws CEO / ex-Spreets | Sydney Marketplace Angel',
  meta_description = 'Sydney CEO/Co-founder Mad Paws. Founded Spreets (Yahoo!7 $40M exit 10 months). Airtasker, VICE Golf early investor. 45+ investments. $50k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Mad Paws (current; CEO + Co-founder)','Spreets (2011 founder; Yahoo!7 $40M exit, 10 months)','Sellable (real-estate-tech)'],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Spreets','category','Group buying','members','1.5M+','employees','100+','acquirer','Yahoo!7','year',2011,'value_aud','~$40M','time_to_exit','10 months')
    ),
    'highlight_investments', ARRAY['VICE Golf (founding investor + advisor)','Airtasker (early investor + advisor)'],
    'angel_portfolio_count','45+ over recent years',
    'background','Born Munich; ex-professional basketball; Masters in Economics; Master of Information Technology, Macquarie University',
    'check_size_note','$50k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/justus-hammer-6a871b8',
      'crunchbase','https://www.crunchbase.com/person/justus-hammer',
      'pitchbook','https://pitchbook.com/profiles/investor/160885-99',
      'theorg_mad_paws','https://theorg.com/org/mad-paws/org-chart/justus-hammer',
      'b2b_expo','https://b2bexpo.com.au/speakers/justus-hammer/'
    ),
    'corrections','CSV portfolio truncated ("Airtasker, Vice Golf, Spre..."). Three retained verbatim. Added Mad Paws (current) and Sellable (latest founder venture).'
  ),
  updated_at = now()
WHERE name = 'Justus Hammer';

UPDATE investors SET
  description = 'Melbourne-based serial entrepreneur and angel investor. CEO at DARE Venture Group. Founder/owner of KDR Private Office. 15+ years entrepreneurship, investment strategy, marketing and branding. Ex-Managing Partner K&K Ventures, ex-Principal Rainmaking ($5B+ equity value across 1389 ventures). Consumer Technology, Health focus. $50k–$150k cheques. Portfolio: WalkSafe, DryGo, LandEx.',
  basic_info = 'Kane Daniel Ricca is a Melbourne-based serial entrepreneur with 15+ years experience in entrepreneurship, investment strategy, marketing and branding. He is currently CEO of **DARE Venture Group** and operates **KDR Private Office** as his investment vehicle.

His operating background includes:
- Founded and exited a marketing agency after 10 years, with clients including **Harrods, Qatar Airways, FIFA, Mercedes Benz, Formula 1, AVIVA** and Her Majesty''s Palace and Fortress.
- **Managing Partner at K&K Ventures**.
- **Principal at Rainmaking** — corporate venture studio that created $5B+ equity value across 1389 ventures.

His CSV cheque size is $50k–$150k. Sector focus is Consumer Technology and Health. Notable CSV-listed portfolio: **WalkSafe** (consumer safety app), **DryGo** and **LandEx**.',
  why_work_with_us = 'For Australian consumer-tech, health and brand-led founders, Kane combines exit-tested marketing-agency operator credentials, K&K Ventures + Rainmaking corporate-venture-studio scale exposure, and DARE Venture Group + KDR Private Office cheque capacity.',
  sector_focus = ARRAY['Consumer Technology','Health','Marketing','Branding','SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.kdr.vision',
  linkedin_url = 'https://www.linkedin.com/in/kanedanielricca/',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['DARE Venture Group (CEO)','KDR Private Office','K&K Ventures (ex-Managing Partner)','Rainmaking (ex-Principal)','WalkSafe','DryGo','LandEx'],
  meta_title = 'Kane Daniel Ricca — DARE Venture Group / KDR Private Office | Melbourne Angel',
  meta_description = 'Melbourne CEO DARE Venture Group. Ex-K&K Ventures MP, Rainmaking Principal ($5B+, 1389 ventures). $50k–$150k.',
  details = jsonb_build_object(
    'current_roles', ARRAY['CEO, DARE Venture Group','Founder/Owner, KDR Private Office'],
    'prior_roles', ARRAY['Managing Partner, K&K Ventures','Principal, Rainmaking ($5B+ value, 1389 ventures)','Founder/exited marketing agency (10 years; Harrods, Qatar Airways, FIFA, Mercedes Benz, Formula 1, AVIVA clients)'],
    'experience_years','15+ years',
    'check_size_note','$50k–$150k',
    'sources', jsonb_build_object(
      'kdr','https://www.kdr.vision/',
      'linkedin','https://www.linkedin.com/in/kanedanielricca/',
      'pitchbook','https://pitchbook.com/profiles/person/380589-49P',
      'helpbnk','https://helpbnk.com/@kanedanielricca'
    ),
    'corrections','CSV portfolio truncated ("WalkSafe, DryGo, LandEx..."). Three retained as listed.'
  ),
  updated_at = now()
WHERE name = 'Kane Daniel Ricca';

UPDATE investors SET
  description = 'Melbourne-based Co-Founder & Managing Partner of Protagonist Capital (pre-revenue and early-revenue Australian startup fund). Co-founder of Character + Distinction (Melbourne PR agency). VP Brand & Communications at Culture Amp. Mentor + Investor at Startmate since March 2018. $25k cheques into enterprise software, consumer SaaS. Notable: Milkdrop, Who Gives a Crap.',
  basic_info = 'Kate Dinon is a Melbourne-based Co-Founder & Managing Partner of **Protagonist Capital** — an Australian pre-revenue and early-revenue startup fund focused on consumer and B2B SaaS. The fund emerged from her Melbourne PR/comms agency **Character + Distinction**, which she co-founded.

Her primary day role is VP Brand & Communications at **Culture Amp** (one of Australia''s largest tech employers and a Blackbird Ventures portfolio company).

She has been a **Mentor + Investor at Startmate since March 2018**, and her CSV-listed portfolio includes **Milkdrop** and **Who Gives a Crap** (toilet-paper subscription with 50% donation to clean-water charities; one of Australia''s most-cited social-impact consumer brands).

CSV cheque size: $25k.',
  why_work_with_us = 'For Australian consumer and B2B SaaS founders looking for an angel cheque alongside hands-on PR and brand-comms operator support, Kate is one of the more distinctive cheques on the Melbourne scene — Protagonist Capital fund-level + Character + Distinction agency advisory + Culture Amp + Startmate networks.',
  sector_focus = ARRAY['Consumer','B2B SaaS','Enterprise Software','PR/Comms','Social Impact','Sustainability'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/katedinon/',
  contact_email = 'kate@protagonistcapital.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Protagonist Capital (Co-Founder & Managing Partner)','Character + Distinction (Co-Founder; Melbourne PR agency)','Culture Amp (VP Brand & Communications)','Startmate (Mentor + Investor since March 2018)','Milkdrop','Who Gives a Crap'],
  meta_title = 'Kate Dinon — Protagonist Capital MP | Melbourne Consumer + B2B SaaS Angel',
  meta_description = 'Melbourne Co-Founder/MP Protagonist Capital. Co-founder Character + Distinction PR. VP Brand Culture Amp. Startmate Mentor. $25k.',
  details = jsonb_build_object(
    'firm','Protagonist Capital (pre-revenue + early-revenue startup fund; consumer + B2B SaaS)',
    'role','Co-Founder & Managing Partner',
    'co_founder_of', ARRAY['Character + Distinction (Melbourne PR/comms agency)'],
    'current_roles', ARRAY['VP Brand & Communications, Culture Amp','Mentor + Investor, Startmate (since March 2018)'],
    'verified_portfolio', ARRAY['Milkdrop','Who Gives a Crap'],
    'check_size_note','$25k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/katedinon/',
      'smartcompany_seed_fund','https://www.smartcompany.com.au/startupsmart/news/kate-dinon-pr-agency-seed-fund-startup-investment/',
      'character_distinction','https://www.ofcharacter.com',
      'theorg_culture_amp','https://theorg.com/org/culture-amp/org-chart/kate-dinon',
      'crunchbase','https://www.crunchbase.com/person/kate-dinon-5337'
    ),
    'corrections','CSV portfolio truncated ("Milkdrop, Who Gives a Cr..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Kate Dinon';

UPDATE investors SET
  description = 'Sydney-based serial entrepreneur and prolific angel investor. 50+ company portfolio incl. Cloudflare, Zoom, Afterpay, Airtasker, Zip, Slack, Monash IVF, Alibaba, Treasury Wines, Fastly, Oatly. Founded Le Black Book at age 21. CEO Her Fashion Box. Retail tech, e-commerce focus. $50K cheques.',
  basic_info = 'Kath Purkis is a Sydney-based entrepreneur and prolific angel investor. She founded her first online retail company **Le Black Book** at age 21, and has been CEO of **Her Fashion Box**.

Her angel portfolio is unusually broad and high-profile — **50+ companies invested in across Australia and overseas**. Notable holdings include **Cloudflare, Zoom, Afterpay, Airtasker, Zip, Slack, Monash IVF, Alibaba, Treasury Wines, Fastly** and **Oatly**.

She brings 15+ years of entrepreneurial experience plus deep expertise in China manufacturing, scalable e-commerce solutions, customised software solutions, scaling globally and brand building. Sector focus: Retail technology, e-commerce, fintech, software, agriculture, food & beverage, sustainability and communications.',
  why_work_with_us = 'For Australian retail-tech, e-commerce, consumer and fashion founders, Kath offers one of the broadest 50+ company angel portfolios in the country plus deep China-manufacturing and scalable-e-commerce operator credentials.',
  sector_focus = ARRAY['Retail Tech','E-commerce','Fashion','Consumer','SaaS','FinTech','AgTech','FoodTech','Sustainability'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  check_size_min = 50000,
  check_size_max = 50000,
  website = 'https://www.kathpurkis.com',
  linkedin_url = 'https://au.linkedin.com/in/kathpurkis',
  contact_email = 'kp@kathpurkis.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Le Black Book (founder; age 21)','Her Fashion Box (CEO)','Cloudflare','Zoom','Afterpay','Airtasker','Zip','Slack','Monash IVF','Alibaba','Treasury Wines','Fastly','Oatly'],
  meta_title = 'Kath Purkis — Le Black Book founder | Sydney Retail Tech Angel',
  meta_description = 'Sydney 50+ portfolio. Cloudflare, Zoom, Afterpay, Airtasker, Slack, Alibaba, Oatly. Founded Le Black Book at 21. $50K.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Le Black Book (online retail; founded at age 21)'],
    'current_roles', ARRAY['CEO, Her Fashion Box'],
    'angel_portfolio_count','50+ companies in Australia and overseas',
    'highlight_investments', ARRAY['Cloudflare','Zoom','Afterpay','Airtasker','Zip','Slack','Monash IVF','Alibaba','Treasury Wines','Fastly','Oatly'],
    'experience_years','15+ years entrepreneurship',
    'expertise', ARRAY['China manufacturing','Scalable e-commerce solutions','Customised software solutions','Scaling globally','Brand building'],
    'check_size_note','$50K',
    'sources', jsonb_build_object(
      'website','https://www.kathpurkis.com',
      'about','https://www.kathpurkis.com/about-kath-purkis',
      'crunchbase','https://www.crunchbase.com/person/kath-purkis',
      'angellist','https://angel.co/kath-purkis',
      'clarity','https://clarity.fm/kathpurkis',
      'medium','https://medium.com/@kathpurkis/about',
      'f6s','https://www.f6s.com/kathpurkis'
    ),
    'corrections','CSV portfolio empty — populated with 11 verified portfolio names from public sources plus founder/CEO companies.'
  ),
  updated_at = now()
WHERE name = 'Kath Purkis';

UPDATE investors SET
  description = 'Sydney-based deep-tech-and-healthtech-focused angel investor. CSV-listed portfolio includes Quantum Brilliance (ANU diamond-quantum-computer spinoff) and Baymax. Sector focus: Healthtech, Deeptech, B2B.',
  basic_info = 'Kenny Wong is a Sydney-based angel investor with a stated sector focus on **HealthTech, DeepTech and B2B** per the Australian angel directory. CSV-listed portfolio:
- **Quantum Brilliance** — Australian-German diamond-quantum-computing spinoff from ANU; ~$77.7M raised.
- **Baymax** — could not be uniquely corroborated.

The directory listing has not been uniquely corroborated to a single LinkedIn or Crunchbase profile from public-source search alone (multiple "Kenny Wong" individuals exist). Founders should validate the connection via the listed email when they make contact.',
  why_work_with_us = 'For Australian deep-tech, healthtech and B2B founders, Kenny''s Quantum Brilliance position signals appetite for ambitious technical bets.',
  sector_focus = ARRAY['HealthTech','DeepTech','B2B','Quantum','MedTech','SaaS'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://au.linkedin.com/in/kennyvhkwong',
  contact_email = 'kenny.ho.wong@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Quantum Brilliance','Baymax'],
  meta_title = 'Kenny Wong — Sydney Healthtech/Deeptech Angel | Quantum Brilliance',
  meta_description = 'Sydney-based deep-tech and healthtech angel. CSV portfolio: Quantum Brilliance, Baymax.',
  details = jsonb_build_object(
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single public investor profile (multiple Kenny Wong individuals).',
      'Baymax could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://au.linkedin.com/in/kennyvhkwong',
      'quantum_brilliance_crunchbase','https://www.crunchbase.com/organization/quantum-brilliance'
    ),
    'corrections','CSV portfolio retained as listed. Common-name caveat noted.'
  ),
  updated_at = now()
WHERE name = 'Kenny Wong';

COMMIT;
