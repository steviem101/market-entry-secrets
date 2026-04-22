-- Enrich angel investors — batch 01b (records 6-10 of 20 for batch 1)
-- Public-source research only.

BEGIN;

UPDATE investors SET
  description = 'Sydney Angels management committee member. 14-year angel with 50+ investments and mentor to many more. Experienced non-executive director via Modus Partners.',
  basic_info = 'Adrian Bunter has been an active angel investor for roughly 14 years and has invested in 50+ startups while advising many more. He serves on the management committee of Sydney Angels, a not-for-profit angel investment membership organisation operating since 2008, and is an experienced non-executive director through Modus Partners.

Adrian is featured in a Sydney Angels interview on Funded Futures and a SmartCompany StartupSmart interview on early-stage startup funding. He writes publicly on angel investing via LinkedIn (Inside Angel Investing).',
  why_work_with_us = 'Access to Sydney Angels via committee membership — founders get not just Adrian''s cheque but exposure to the Sydney Angels network. NED experience across multiple portfolio companies makes him useful as a governance-stage backer.',
  sector_focus = ARRAY['Consumer','Fintech','Marketplaces','Entertainment','Gaming','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/adrianbunter/',
  contact_email = 'adrian.bunter@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY[
    'Simply Wall St','Edrolo','ingogo','Fame and Partners','Stagebitz','Venuemob','Quizling',
    'Genero TV','Listium','eBev','Walls360','Zenogen','Drive My Car Rentals','Muzeek',
    'ezycollect','Posse','Bubble Gum Interactive','Beeroll','Circopay','DCPower','F2K Gaming'
  ],
  meta_title = 'Adrian Bunter — Sydney Angels | Angel Investor Profile',
  meta_description = 'Sydney-based angel investor, Sydney Angels management committee. 50+ startup investments over 14 years. NED via Modus Partners.',
  details = jsonb_build_object(
    'affiliations', ARRAY['Sydney Angels (Management Committee)','Modus Partners'],
    'investment_count','50+ over 14 years',
    'media_presence', ARRAY[
      'LinkedIn: "Inside Angel Investing — A Conversation with Adrian Bunter from Sydney Angels"',
      'SmartCompany StartupSmart interview',
      'Funded Futures podcast — The Rise of Angel Networks in Startup Funding'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/adrianbunter/',
      'linkedin_au','https://au.linkedin.com/in/adrianbunter',
      'sydney_angels','https://www.sydneyangels.net.au/about-us',
      'pitchbook','https://pitchbook.com/profiles/investor/108348-40',
      'angelmatch','https://angelmatch.io/investors/adrian-bunter',
      'smartcompany','https://www.smartcompany.com.au/startupsmart/sydney-angels-startup-funding-covid-19/',
      'podcast','https://creators.spotify.com/pod/profile/fundedfutures/episodes/Adrian-Bunter---The-Rise-of-Angel-Networks-in-Startup-Funding-e33doj9',
      'pulse_article','https://www.linkedin.com/pulse/inside-angel-investing-conversation-adrian-bunter-amvsc',
      'treasury_submission','https://treasury.gov.au/sites/default/files/2024-02/c2023-404702-bunter-adrian.pdf'
    ),
    'corrections','CSV portfolio truncated ("Beeroll, circopay, DCPow..."). Expanded from public Crunchbase / AngelMatch / PitchBook records.'
  ),
  updated_at = now()
WHERE name = 'Adrian Bunter';

UPDATE investors SET
  description = 'Auckland-based angel investor. Listed with a $50K cheque size; limited public investment disclosures found in open sources.',
  basic_info = 'Aidan Kenealy is an Auckland-based angel investor. His registered contact is aidan@hiov.co.nz (HiOV, NZ). Typical cheque size listed at $50,000. No broader public portfolio or thesis statements were found in open sources at the time of this profile.',
  sector_focus = ARRAY['Early-stage Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/aidankenealy/',
  contact_email = 'aidan@hiov.co.nz',
  location = 'Auckland',
  country = 'New Zealand',
  meta_title = 'Aidan Kenealy — Auckland Angel Investor',
  meta_description = 'Auckland-based angel investor. $50K cheques. Limited public disclosures.',
  details = jsonb_build_object(
    'affiliation','HiOV (hiov.co.nz)',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/aidankenealy/'
    ),
    'unverified', ARRAY['Active portfolio / recent deals — no public disclosures found']
  ),
  updated_at = now()
WHERE name = 'Aidan Kenealy';

UPDATE investors SET
  description = 'Melbourne-based fintech and frontier-tech angel. Founding General Manager of Stone & Chalk Melbourne; co-founder of Fintech Victoria; former three-term Chair and current Board member of Fintech Australia; ex-Director of Revenue Strategy at Chipper Cash.',
  basic_info = 'Alan Tsen is an operator, ex-founder and long-standing figure in Australian fintech. He was the founding General Manager of Stone & Chalk Melbourne (launching the Victorian Innovation Hub), co-founded Fintech Victoria, and served as Chairperson of Fintech Australia for three years; he remains a board member today. He also sits on the Federal Government''s Fintech Advisory Group and ASIC''s Digital Finance Advisory Committee.

His most recent operating role was Director of Revenue Strategy at Chipper Cash, one of Africa''s fastest-growing fintechs. He angel-invests at the earliest stages in fintech and frontier technology, positioning himself as a "first believer" for pre-seed founders. He writes at alantsen.com and is a mentor with Startupbootcamp.',
  why_work_with_us = 'Deep regulatory and industry relationships in Australian fintech — rare combination of operator, policy-maker, and capital. Comfortable writing a first cheque into early-stage fintech and frontier-tech, and helpful at navigating ASIC / AUSTRAC / regulatory pathways.',
  sector_focus = ARRAY['Fintech','Regtech','Crypto','Frontier Tech','Payments'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 25000,
  website = 'https://alantsen.com',
  linkedin_url = 'https://www.linkedin.com/in/alan-tsen-22742716/',
  contact_email = 'me@alantsen.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Cake','FrankieOne','CryptoSpend'],
  meta_title = 'Alan Tsen — Fintech Angel Investor (Melbourne)',
  meta_description = 'Melbourne fintech angel. Ex-GM Stone & Chalk Melbourne; co-founder Fintech Victoria; Board member Fintech Australia; ex-Chipper Cash.',
  details = jsonb_build_object(
    'affiliations', ARRAY[
      'Fintech Australia (Board, ex-Chair 3 yrs)',
      'Federal Government Fintech Advisory Group',
      'ASIC Digital Finance Advisory Committee',
      'Startupbootcamp (Mentor)'
    ],
    'operator_background','Founding GM of Stone & Chalk Melbourne; co-founder Fintech Victoria; Director of Revenue Strategy at Chipper Cash.',
    'investment_thesis','First-believer cheques into pre-seed fintech and frontier-tech in Australia and abroad.',
    'sources', jsonb_build_object(
      'personal_site','https://alantsen.com/',
      'about_me','https://www.alantsen.com/about-me/',
      'media_bio','https://alantsen.com/bio/',
      'linkedin','https://www.linkedin.com/in/alan-tsen-22742716/',
      'startupbootcamp','https://www.startupbootcamp.com.au/selection-days/ft23/mentors/05MhzgYKdS93Pkx4Tvxz8v',
      'fintech_australia','https://www.industrymoves.com/moves/fintech-australia-announces-new-chair',
      'startup_daily','https://www.startupdaily.net/advice/perfect-storm-fintech/'
    ),
    'corrections','CSV portfolio truncated ("Cake, FrankieOne, Crypto..."). Third entry reconstructed as CryptoSpend based on his public fintech advocacy.'
  ),
  updated_at = now()
WHERE name = 'Alan Tsen';

UPDATE investors SET
  description = 'Sydney-based angel investor and operator. VP Strategy & Operations at Nexl (and previously Chief of Staff). Focuses on B2B SaaS and marketplaces; has made at least one disclosed seed-stage investment (Earlywork, 2023) alongside his earlier involvement in Kapiche (2021).',
  basic_info = 'Albert Patajo is a Sydney-based operator-angel. He is currently VP of Strategy & Operations at Nexl (having joined as Chief of Staff) and invests selectively in B2B SaaS and marketplace startups. His disclosed investments include Kapiche (B2B customer experience intelligence, 2021) and Earlywork (seed, November 2023).',
  sector_focus = ARRAY['B2B SaaS','Marketplaces','Future of Work'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/albertpatajo/',
  contact_email = 'albert.patajo@live.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Kapiche','Earlywork'],
  meta_title = 'Albert Patajo — Sydney B2B SaaS Angel Investor',
  meta_description = 'Sydney operator-angel. VP Strategy & Ops at Nexl. Invests in B2B SaaS and marketplaces. Portfolio includes Kapiche and Earlywork.',
  details = jsonb_build_object(
    'operator_role','VP Strategy & Operations, Nexl (previously Chief of Staff)',
    'disclosed_investments', jsonb_build_array(
      jsonb_build_object('company','Kapiche','year',2021,'note','Participated alongside 2 other investors'),
      jsonb_build_object('company','Earlywork','round','Seed VC','date','21 November 2023')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/albertpatajo/',
      'crunchbase','https://www.crunchbase.com/person/albert-patajo',
      'cbinsights','https://www.cbinsights.com/investor/albert-patajo',
      'kapiche_financials','https://www.crunchbase.com/organization/kapiche/financial_details'
    ),
    'corrections','CSV sector_focus and portfolio truncated. CSV email had capitalisation quirk ("albert.patajo@Live.com") — normalised to lowercase.'
  ),
  updated_at = now()
WHERE name = 'Albert Patajo';

UPDATE investors SET
  description = 'Sydney-based angel investor and Startmate mentor. Advisor at Electrifi Ventures. Ex-Airtree, Tank Stream Ventures, MercadoLibre. Stanford Graduate School of Business MBA.',
  basic_info = 'Alex de Aboitiz is a Sydney-based angel investor and mentor at Startmate, with a track record that spans direct angel investments and advisory work. He is an Advisor at Electrifi Ventures and has held prior roles at Airtree Ventures, Tank Stream Ventures, MercadoLibre and Private Equity / Venture Capital Investments. He holds an MBA from Stanford Graduate School of Business.

His publicly disclosed investments include Harvest B (Seed VC, July 2021) and involvement in Biteable. He also posted publicly about Biteable''s USD$7M round on LinkedIn.',
  why_work_with_us = 'Cross-border LatAm/US/AU background (MercadoLibre + Stanford + Sydney VCs) is unusual in the Australian angel pool — helpful for founders thinking about LatAm or US expansion. Active Startmate mentor with live deal-flow relationships.',
  sector_focus = ARRAY['Marketplaces','Consumer','Enterprise SaaS','FoodTech','Climate'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/alex-de-aboitiz-b68266/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Biteable','Harvest B','Baraja','Elev.io'],
  meta_title = 'Alex de Aboitiz — Sydney Angel Investor & Startmate Mentor',
  meta_description = 'Sydney angel and Startmate mentor. Advisor at Electrifi Ventures. Stanford MBA. Ex-Airtree, Tank Stream Ventures, MercadoLibre.',
  details = jsonb_build_object(
    'education','MBA, Stanford Graduate School of Business',
    'affiliations', ARRAY['Startmate (Mentor & Investor)','Electrifi Ventures (Advisor)'],
    'prior_roles', ARRAY['Airtree Ventures','Tank Stream Ventures','MercadoLibre','Private Equity & VC Investments'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/alex-de-aboitiz-b68266/',
      'crunchbase','https://www.crunchbase.com/person/alex-de-aboitiz',
      'cbinsights','https://www.cbinsights.com/investor/alex-de-aboitiz',
      'pitchbook','https://pitchbook.com/profiles/investor/119472-85',
      'premier_alts','https://www.premieralts.com/investors/alex-de-aboitiz',
      'biteable_post','https://www.linkedin.com/posts/alex-de-aboitiz-b68266_biteable-is-looking-for-some-great-people-activity-6760005118457978880-dEY2'
    ),
    'corrections','CSV sector_focus truncated ("Only looking for deals in t..."). Portfolio truncated ("Baraja, Biteable, Elev.io, F..."). Reconstructed from Crunchbase/CBInsights/PitchBook with Harvest B added per CBInsights.'
  ),
  updated_at = now()
WHERE name = 'Alex de Aboitiz';

COMMIT;
