-- Enrich angel investors — batch 02t (records 119-123: John Henderson → Josh Best)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based General Partner at AirTree Ventures (Australia''s largest VC, $1B+ AUM). 6 years prior in London/NYC: Facebook, COO of Summly (Yahoo $30M exit 2013), Principal at White Star Capital. Ex-BCG. Co-founder of London.ai (Europe''s leading AI practitioner event). Cheque range $100K–$5M.',
  basic_info = 'John Henderson is a full-time General Partner at AirTree Ventures, focusing on early-stage Australian and NZ technology companies.

His pre-AirTree career: 6 years across London and New York at Facebook, then as COO of Summly (acquired by Yahoo for $30M in 2013), and most recently as Principal at White Star Capital. He started his career at Boston Consulting Group, after a first venture (Bush Campus) that failed.

His personal angel/AirTree investment range is $100K–$5M with a sweet spot of $1.5M. Current AirTree fund $60M+. He co-founded London.ai — Europe''s leading event for AI practitioners.',
  why_work_with_us = 'For Australian and NZ founders raising $500K–$5M seed/Series A rounds with global ambition, John combines AirTree institutional pathway with cross-Atlantic operator credentials.',
  sector_focus = ARRAY['SaaS','AI','Marketplace','Consumer','FinTech','HealthTech','Generalist'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.airtree.vc',
  linkedin_url = 'https://www.linkedin.com/in/johnhenderson/',
  contact_email = 'john@airtree.vc',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['AirTree Ventures (General Partner)','Summly (ex-COO; Yahoo $30M exit 2013)','White Star Capital (ex-Principal)','Facebook (ex)','London.ai (co-founder)','Boston Consulting Group (ex)'],
  meta_title = 'John Henderson — AirTree Ventures GP | Sydney Generalist',
  meta_description = 'Sydney AirTree Ventures GP. Ex-Facebook, COO Summly (Yahoo $30M), White Star Capital. London.ai co-founder. $100K–$5M.',
  details = jsonb_build_object(
    'firm','AirTree Ventures',
    'role','General Partner',
    'investment_range_aud','$100K–$5M (sweet spot $1.5M)',
    'fund_size_aud','$60M+',
    'prior_roles', ARRAY['Facebook','COO Summly (Yahoo $30M exit 2013)','Principal White Star Capital','Boston Consulting Group','Founder Bush Campus'],
    'co_founder_of', ARRAY['London.ai (Europe leading AI practitioner event)'],
    'sources', jsonb_build_object(
      'airtree_team','https://www.airtree.vc/team/john-henderson',
      'linkedin','https://au.linkedin.com/in/johnhenderson',
      'crunchbase','https://www.crunchbase.com/person/john-henderson-2',
      'signal_nfx','https://signal.nfx.com/investors/john-henderson',
      'inquisitive_vc','https://theinquisitivevc.substack.com/p/john-henderson-airtree'
    ),
    'corrections','CSV email "john at airtree dot vc" decoded to john@airtree.vc.'
  ),
  updated_at = now()
WHERE name = 'John Henderson';

UPDATE investors SET
  description = 'Sydney-based angel investor and Chairman at Atomo Diagnostics. Managing Director at BNP Paribas. Sector focus: Fintech, Health, EdTech, E-commerce. $10k cheques. Notable portfolio: Atomo Diagnostics (rapid blood-based diagnostics), Clipboard.',
  basic_info = 'John Keith is a Sydney-based angel investor whose primary public role is Chairman of the Board of Directors at Atomo Diagnostics — Australian-listed (ASX:AT1) developer of integrated rapid diagnostic test devices including Galileo lateral flow blood-based diagnostics for HIV, hepatitis and other applications.

He is also Managing Director at BNP Paribas. His angel cheques ($10k) skew to fintech, health, edtech and e-commerce ventures.',
  why_work_with_us = 'For Australian healthtech, fintech, edtech and e-commerce founders raising small seed cheques, John offers BNP Paribas institutional context plus board-level diagnostics-industry exposure via Atomo.',
  sector_focus = ARRAY['FinTech','HealthTech','EdTech','E-commerce','Diagnostics','MedTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 10000,
  linkedin_url = 'https://www.linkedin.com/in/john-keith-3030241b/',
  contact_email = 'john.keith@mac.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Atomo Diagnostics (Chairman)','BNP Paribas (Managing Director)','Clipboard'],
  meta_title = 'John Keith — Atomo Diagnostics Chairman | Sydney Angel',
  meta_description = 'Sydney Chairman Atomo Diagnostics. MD BNP Paribas. $10k cheques. Fintech, health, edtech, e-commerce.',
  details = jsonb_build_object(
    'current_roles', ARRAY['Chairman, Atomo Diagnostics','Managing Director, BNP Paribas'],
    'check_size_note','$10k',
    'sources', jsonb_build_object(
      'atomo_governance','https://atomodiagnostics.com/governance/',
      'atomo_board','https://atomodiagnostics.com/board-of-directors/',
      'linkedin','https://www.linkedin.com/in/john-keith-3030241b/'
    ),
    'corrections','CSV portfolio truncated. Two retained as verified.'
  ),
  updated_at = now()
WHERE name = 'John Keith';

UPDATE investors SET
  description = 'Sydney-based Macquarie Group executive and institutional-cheque-size investor. Sector focus: B2B SaaS, enterprise software. $5M–$25M cheques (institutional scale, not personal angel).',
  basic_info = 'Jonathan Lay is a Sydney-based investor at Macquarie Group with a B2B SaaS and enterprise-software focus. His CSV-listed cheque band of $5M–$25M places him in institutional Series-B and growth-equity territory rather than personal-angel cheques.

Founders should approach Jonathan as a Macquarie Group institutional contact rather than a typical small-cheque angel — his cheque scale is appropriate for late-Series A through Series B rounds.',
  why_work_with_us = 'For Australian B2B SaaS and enterprise-software founders raising Series A+ rounds with institutional cheque participation, Jonathan offers Macquarie Group-level capital and institutional pathway.',
  sector_focus = ARRAY['B2B SaaS','Enterprise Software','SaaS','FinTech'],
  stage_focus = ARRAY['Series A','Series B','Growth'],
  check_size_min = 5000000,
  check_size_max = 25000000,
  contact_email = 'jonathan.lay@macquarie.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Macquarie Group'],
  meta_title = 'Jonathan Lay — Macquarie Group | Sydney B2B SaaS Institutional',
  meta_description = 'Sydney Macquarie Group institutional investor. B2B SaaS, enterprise software. $5M–$25M cheques.',
  details = jsonb_build_object(
    'firm','Macquarie Group',
    'check_size_note','$5M–$25M (institutional Series A+)',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record and specific portfolio companies could not be uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV email truncated ("jonathan.lay@macquarie...."). Resolved to jonathan.lay@macquarie.com. CSV LinkedIn empty.'
  ),
  updated_at = now()
WHERE name = 'Jonathan Lay';

UPDATE investors SET
  description = 'Byron Bay-based founder, operator and sustainability-focused angel investor. Founder of Planet Earth Ventures (consultancy and angel platform supporting eco-conscious businesses). Ex-Director/Owner of Colorific for 13 years (consumer-products business; sold 25M+ products, $300M+ revenue; acquired 2022). EnergyLab Angel Network member. Startmate First Believer Cohort 5. Blackbird Giants Mentor.',
  basic_info = 'Jonny Levi is a Byron Bay-based business owner-operator turned consultant, mentor and angel investor focused on businesses supporting the planet.

His operating story: 13 years at Colorific (consumer products), 10 of those as Director and Owner. The business sold 25M+ products with $300M+ revenue under his tenure and was acquired in 2022 by one of the largest privately-owned global toy companies.

He now runs **Planet Earth Ventures** — a consultancy and angel platform offering Mastermind Groups, 1:1 Advisory and curated Tools & Resources for eco-conscious businesses.

His angel-network affiliations:
- **EnergyLab Angel Network** (Mentor + Member; see record #80)
- **Startmate First Believer Cohort 5**
- **Blackbird Giants Mentor**
- **Pause Awards Judge**',
  why_work_with_us = 'For Australian sustainability, climate-tech, consumer-goods and eco-conscious founders, Jonny offers a small first cheque alongside Planet Earth Ventures advisory plus EnergyLab/Startmate/Blackbird mentor-network reach.',
  sector_focus = ARRAY['Sustainability','Climate','Consumer','Consumer Goods','EcoTech','Impact'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 0,
  check_size_max = 15000,
  website = 'https://www.planetearthventures.co',
  linkedin_url = 'https://www.linkedin.com/in/jonnylevi/',
  contact_email = 'jonny@planetearthventures.co',
  location = 'Byron Bay, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Planet Earth Ventures (Founder)','Colorific (ex-Director/Owner; sold 2022)','EnergyLab Angel Network (Mentor)','Startmate First Believer Cohort 5','Blackbird Giants Mentor','Lucent Globe (Chief Commercial and Sustainability Officer)'],
  meta_title = 'Jonny Levi — Planet Earth Ventures | Byron Bay Sustainability Angel',
  meta_description = 'Byron Bay founder Planet Earth Ventures. Ex-Colorific (13 years, $300M+, sold 2022). EnergyLab + Startmate + Blackbird mentor. Up to $15k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Planet Earth Ventures (consultancy + angel platform)'],
    'prior_roles', ARRAY['Director/Owner Colorific (13 years; $300M+ revenue; sold 2022)'],
    'angel_network_affiliations', ARRAY['EnergyLab Angel Network','Startmate First Believer Cohort 5','Blackbird Giants Mentor','Pause Awards Judge'],
    'check_size_note','Up to $15k',
    'sources', jsonb_build_object(
      'planet_earth_ventures','https://www.planetearthventures.co/',
      'linkedin','https://www.linkedin.com/in/jonnylevi/',
      'pause_awards','https://pauseawards.com/judges/jonny-levi/',
      'balance_grind','https://balancethegrind.co/interviews/jonny-levi-founder-at-planet-earth-ventures/'
    ),
    'corrections','CSV email truncated ("jonny@planetearthventur..."). Resolved to jonny@planetearthventures.co.'
  ),
  updated_at = now()
WHERE name = 'Jonny Levi';

UPDATE investors SET
  description = 'Sydney-based generalist angel investor. CSV-listed portfolio includes Canva (early/historical), Kelly Partners and additional truncated companies. Limited public investor profile.',
  basic_info = 'Josh Best is a Sydney-based angel investor listed in the Australian angel directory with a generalist mandate. CSV-listed portfolio names include **Canva** and **Kelly Partners** — two of Australia''s most-cited tech and accounting/professional-services scale-ups respectively. Beyond the directory entry, detailed individual investor track record could not be uniquely corroborated from public-source search.

Founders should expect to validate the connection directly through warm introduction or referral.',
  why_work_with_us = 'For Australian early-stage founders looking for a generalist Sydney angel cheque with apparent Canva and Kelly Partners track record. Best treated as a referral-led conversation given limited public profile.',
  sector_focus = ARRAY['SaaS','Consumer','Marketplace','FinTech','Generalist','Accounting Tech','Design'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/joshuabest/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Canva','Kelly Partners'],
  meta_title = 'Josh Best — Sydney Generalist Angel | Canva, Kelly Partners',
  meta_description = 'Sydney generalist angel investor. CSV portfolio: Canva, Kelly Partners.',
  details = jsonb_build_object(
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single public investor profile.',
      'CSV portfolio entries verified as real Australian companies but cap-table participation not independently corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/joshuabest/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV portfolio truncated. Common-name caveat applies.'
  ),
  updated_at = now()
WHERE name = 'Josh Best';

COMMIT;
