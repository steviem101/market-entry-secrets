-- Enrich angel investors — batch 02a (records 24-28: Andrew Coley → Ariane Barker)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based angel investor and operator. Director, Program Management Office at Macquarie Group; founder of Beachbells (sand-fillable kettlebells). Startmate pre-accelerator mentor. Affiliated with The Pitch Club (Alan Jones'' Australia-wide startup pitch nights).',
  basic_info = 'Andrew "Andy" Coley is a Sydney-based operator-investor with a corporate-finance day job and an active early-stage angel practice. By day he is a Director in the Program Management Office at Macquarie Group, with prior consulting roles at Seven Consulting and PwC.

Outside Macquarie he is the founder of Beachbells — a portable, sand-fillable kettlebell product launched in Sydney and stocked through Amazon AU and his own e-commerce site. He is also a mentor with Startmate''s pre-accelerator, working with early-stage founders over 8-week cycles.

His angel cheque is small but repeatable ($10k–$20k plus pro-rata follow-on rights), and his point of contact (andy@pitchclub.com.au) reflects his ongoing affiliation with The Pitch Club, the Alan Jones-founded Australia-wide pitch-night network.',
  why_work_with_us = 'Useful for SaaS founders who want a small, friendly first cheque from an investor who can give honest feedback on pitches (via The Pitch Club network) and who has lived the e-commerce/D2C grind via Beachbells. Pro-rata participation means he can support follow-on rounds.',
  sector_focus = ARRAY['SaaS','Consumer','D2C','E-commerce'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 20000,
  linkedin_url = 'https://www.linkedin.com/in/ahcoley/',
  contact_email = 'andy@pitchclub.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Beachbells (founder)'],
  meta_title = 'Andrew Coley — Macquarie, Beachbells | Sydney Angel Investor',
  meta_description = 'Sydney-based SaaS angel and Macquarie PMO Director. Founder of Beachbells. Startmate mentor. $10k–$20k cheque + pro-rata.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Director, Program Management Office, Macquarie Group',
      'Founder, Beachbells',
      'Mentor, Startmate (pre-accelerator)',
      'Trustee, Bukit Lawang Trust (Indonesia)'
    ],
    'prior_roles', ARRAY[
      'Consultant, Seven Consulting (PMO consultancy)',
      'Consultant, PwC'
    ],
    'investment_thesis','Small first cheques into SaaS founders, with pro-rata follow-on. Angle of attack is pitch quality and storytelling via The Pitch Club network.',
    'check_size_note','$10k–$20k initial + pro-rata',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/ahcoley/',
      'crunchbase_person','https://www.crunchbase.com/person/andrew-coley-dc9f',
      'beachbells_amazon_feature','https://www.aboutamazon.com.au/news/small-business/beachbells-if-youve-got-a-beach-youve-got-a-gym',
      'pitch_club','https://pitchclub.au/'
    ),
    'corrections','CSV had Pitch Club founder ambiguity. The Pitch Club was founded by Alan Jones (separate investor record); Andy Coley uses andy@pitchclub.com.au as his contact email and is affiliated with the network as an organiser/MC, not as founder. Sector_focus expanded from "SaaS" to include Consumer/D2C/E-commerce, reflecting his Beachbells operator background.'
  ),
  updated_at = now()
WHERE name = 'Andrew Coley';

UPDATE investors SET
  description = 'Sydney-based angel investor with a stated focus on Defence Tech and Aboriginal/Indigenous-led ventures. Small-cheque investor ($2.5k–$10k). Limited public profile — primary source is the published angel investor list.',
  basic_info = 'Andrew Wilson is listed in the Australian angel investor directory as a small-cheque investor focused on Defence Tech and Aboriginal/Indigenous-led ventures, operating from Sydney. His listed contact is wilkandconsulting@outlook (the "Wilk and Consulting" trading name suggests a personal advisory practice).

His listed portfolio includes Skoutli, the Sydney-headquartered film/photography location-scouting platform founded in 2016 by James Jordan and Caroline Lepron (Wilson is an investor, not a co-founder). Beyond this single portfolio entry, no further publicly-verifiable record of his angel activity has been located. Founders approaching him should expect small initial cheques and should rely on direct contact for due diligence rather than published track record.',
  why_work_with_us = 'Niche thematic interest (Defence Tech, Aboriginal-led ventures) is rare in the broader Australian angel community. Useful as a small early supporter for founders building in those specific verticals, particularly with Sydney commercial relevance.',
  sector_focus = ARRAY['Defence Tech','Indigenous/Aboriginal Tech','Consumer','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 2500,
  check_size_max = 10000,
  contact_email = 'wilkandconsulting@outlook.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Skoutli'],
  meta_title = 'Andrew Wilson — Sydney Angel | Defence Tech, Indigenous-led',
  meta_description = 'Sydney-based small-cheque angel ($2.5k–$10k) focused on Defence Tech and Aboriginal/Indigenous-led ventures. Skoutli investor.',
  details = jsonb_build_object(
    'investment_thesis','Small first cheques in Defence Tech and Aboriginal/Indigenous-led businesses (per published directory listing).',
    'check_size_note','$2.5k–$10k',
    'unverified', ARRAY[
      'No verified LinkedIn profile (multiple Andrew Wilsons in tech).',
      'Sector focus and portfolio drawn solely from published angel-investor list — not independently corroborated.',
      'Trading name "Wilk and Consulting" not located in business registries from public-source search.'
    ],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'skoutli_pitchbook','https://pitchbook.com/profiles/company/481588-48',
      'skoutli_tracxn','https://tracxn.com/d/companies/skoutli/__x81YvS7s_q6b7KRTkzkq5L-nRQW-mxWstrgyYCwVXXs'
    ),
    'corrections','CSV email was truncated ("wilkandconsulting@outlo..."). Inferred outlook.com domain. CSV portfolio of "Skoutli" verified — Skoutli founders are James Jordan and Caroline Lepron, so Wilson is investor, not co-founder. No LinkedIn URL added; Sydney "Andrew Wilson" cannot be uniquely identified from public sources.'
  ),
  updated_at = now()
WHERE name = 'Andrew Wilson';

UPDATE investors SET
  description = 'Sydney-based serial founder and operator-angel. CEO of AccessEAP (mental-health and wellbeing NFP). Founder/CEO of Advisr (insurance broker marketplace). Co-founded Switched on Media (digital marketing, exited via STW majority and full sale to WPP, 2015). Past director of Insurtech Australia.',
  basic_info = 'Andy Jamieson is a Sydney-based serial digital-marketing and fintech operator with one mid-cap exit and an active second venture. He co-founded Switched on Media in 2007 with Scot Ennis — a digital marketing agency serving Westfield, CBA, Canon, Spotify and Vodafone, recognised in BRW Fast 100 and Deloitte Technology Fast 50. STW Group took a majority stake; Andy fully exited via the trade sale to global advertising group WPP in 2015.

In 2016 he founded Advisr, an insurance-broker marketplace connecting SMEs with verified, reviewed brokers. Advisr completed a seed round led by Spacer co-founder Roland Tam and is described as the fastest-growing website for insurance brokers in Australia. He continues as Founder/CEO of Advisr.

He is currently CEO of AccessEAP, an Australian-owned not-for-profit providing employee mental-health and wellbeing services (founded 1989). He also serves as a Non-Executive Board Member at Opportunity International Australia (microfinance, since 2016) and was previously a director of Insurtech Australia (Feb 2020 – Nov 2021) and a mentor at the Tyro Fintech Hub (2016–2018).',
  why_work_with_us = 'Two-time founder with one full WPP exit and direct insurtech-marketplace operating experience. Particularly relevant for fintech, insurtech, martech/adtech and SaaS-marketplace founders. Tyro Fintech Hub and Insurtech Australia history give him reach into the Sydney fintech network.',
  sector_focus = ARRAY['Fintech','Insurtech','MarTech','AdTech','SaaS','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/andyjamieson/',
  contact_email = 'andy.jamieson@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Advisr (founder, CEO)','Switched on Media (co-founder, sold STW/WPP 2015)'],
  meta_title = 'Andy Jamieson — Advisr, ex-Switched on Media | Sydney Fintech Angel',
  meta_description = 'Sydney serial founder/operator-angel. CEO Advisr (insurtech marketplace). Co-founded Switched on Media (WPP exit 2015). CEO AccessEAP. Insurtech Australia alumni.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Advisr (current)','Switched on Media (2007, exited WPP 2015)'],
    'current_roles', ARRAY[
      'Founder & CEO, Advisr',
      'CEO, AccessEAP',
      'Non-Executive Board Member, Opportunity International Australia (since May 2016)'
    ],
    'prior_roles', ARRAY[
      'Co-founder, Switched on Media (2007–2015 exit)',
      'Director, Insurtech Australia (Feb 2020 – Nov 2021)',
      'Mentor, Tyro Fintech Hub (2016–2018)',
      'eBay (pre-Switched on Media)',
      'Fairfax Digital (pre-Switched on Media)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Switched on Media','first_acquirer','STW Group (majority)','final_acquirer','WPP','year',2015)
    ),
    'investment_thesis','Back fintech, insurtech, martech and SaaS-marketplace founders where his exit-tested operator network adds to the cheque.',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/andyjamieson/',
      'crunchbase_person','https://www.crunchbase.com/person/andy-jamieson-2',
      'opportunity_intl_bio','https://opportunity.org.au/what-we-do/about-us/leadership/andrew-jamieson',
      'campaign_brief_stw','https://campaignbrief.com/stw-expands-digital-with-an-in/',
      'itc_asia_speaker','https://asia.insuretechconnect.com/speakers/andy-jamieson',
      'advisr_seed_round','https://www.lifeinsuranceinternational.com/news/insurtech-advisr-completes-seed-investment-round-to-fund-international-growth/',
      'andy_personal','https://www.andyjamieson.com/'
    ),
    'corrections','CSV portfolio was truncated ("Switched on Media, Sprin..."). Could not verify "Sprin..." as a portfolio company; Advisr is his current operating company, not an angel investment. Listed verified roles instead.'
  ),
  updated_at = now()
WHERE name = 'Andy Jamieson';

UPDATE investors SET
  description = 'Sydney-based founder/CEO of CIMET (white-label SaaS comparison platform for energy, telco, internet, solar and finance) — annual revenue ~AU$11M, ~130% YoY growth, AU$26.6M investment from iSelect in 2022. Earlier founder of GMS (600-staff multi-country call centre). Operator-angel writing $100k cheques.',
  basic_info = 'Ankit Jain is a Sydney-based serial entrepreneur and founder/CEO of CIMET, an Australian white-label SaaS comparison-and-sales platform launched in 2017. CIMET supplies the comparison technology behind utility, telco, internet, solar, credit-card and personal-loan offerings for some of Australia''s largest brands. The company reported revenue of AU$11M in 2021–2022 with annual growth of ~130% since 2017. In March 2022 iSelect announced an AU$26.6M investment in the business. CIMET operates from Sydney (Suite 19.02, Level 19, 570 George Street) with a delivery hub in Jaipur, India. Co-founders include Tim Shepherd (CRO), Rubal Jain (Chief of Product) and Raj Jain (COO).

Before CIMET, Ankit was founder and CEO of GMS, a call-centre operation with around 600 staff across three countries and peak revenue around AU$15M. He holds a Master of Commerce in Finance and an FMS qualification from the University of Sydney.

As an angel investor he is listed at a $100k cheque size, leveraging the operating cashflow of CIMET and a deep network across Australian retail-energy, telco and finance verticals.',
  why_work_with_us = 'One of the larger angel cheques in the Sydney SaaS-comparison and consumer-fintech space ($100k). Particularly useful for founders building in white-label SaaS, comparison/marketplace technology, or consumer-finance-adjacent products that benefit from his utility/telco/finance distribution relationships.',
  sector_focus = ARRAY['SaaS','MarketPlace','Consumer Fintech','Energy Tech','Telco','Comparison Tech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 100000,
  check_size_max = 100000,
  website = 'https://www.cimet.com.au',
  linkedin_url = 'https://au.linkedin.com/in/ankit-jain-a62568116',
  contact_email = 'ankit@ankitj.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['CIMET (founder, CEO)','GMS (founder, prior)'],
  meta_title = 'Ankit Jain — CIMET founder | Sydney Operator-Angel',
  meta_description = 'Sydney founder/CEO of CIMET (AU$11M revenue, ~130% YoY, $26.6M iSelect investment). Operator-angel writing $100k cheques across SaaS, comparison and consumer fintech.',
  details = jsonb_build_object(
    'founder_of', ARRAY['CIMET (current)','GMS (prior; 600 staff, AU$15M peak revenue)'],
    'current_roles', ARRAY[
      'Founder & CEO, CIMET'
    ],
    'cimet_stats', jsonb_build_object(
      'founded',2017,
      'hq','Sydney, NSW (Level 19, 570 George Street)',
      'india_office','Jaipur, Rajasthan',
      'revenue_2021_2022_aud','~$11M',
      'annual_growth_rate','~130% since 2017',
      'iselect_investment_aud','$26.6M (March 2022)',
      'co_founders', ARRAY['Tim Shepherd (CRO)','Rubal Jain (Chief of Product)','Raj Jain (COO)']
    ),
    'education', ARRAY['Master of Commerce — Finance, University of Sydney','FMS, University of Sydney'],
    'investment_thesis','Operator-angel cheques into SaaS, white-label comparison/marketplace tech and consumer-fintech-adjacent products that benefit from utility/telco/finance distribution.',
    'check_size_note','$100k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/ankit-jain-a62568116',
      'cimet_about','https://www.cimet.com.au/about',
      'cimet_leadership','https://www.cimet.com.au/board-members',
      'startup_daily','https://www.startupdaily.net/advice/comparison-gap-led-to-cimet/',
      'theorg','https://theorg.com/org/cimet/org-chart/ankit-jain',
      'ceo_insights_profile','https://www.ceoinsightsindia.com/vendor/ankit-jain-an-industry-leader-who-appreciates-the-value-of-satisfied-customers-effective-management-increased-revenue-cid-6368.html'
    ),
    'corrections','CSV had LinkedIn empty, sector_focus empty, portfolio empty. Verified Sydney-based via CIMET HQ and LinkedIn. Sector focus and portfolio populated from CIMET operating profile.'
  ),
  updated_at = now()
WHERE name = 'Ankit Jain';

UPDATE investors SET
  description = 'Melbourne-based career investor and non-executive director. Former CEO/MD of Scale Investors (2017–21) — Australia''s leading angel network for women-led tech startups, with $12M+ invested across 30 deals at 21.5% IRR. Director CSC, IDP Education and St Vincent''s Health Australia. 25+ years international banking (Goldman Sachs, HSBC, JBWere, Merrill Lynch).',
  basic_info = 'Ariane Barker is a Melbourne-based professional investor and non-executive director with 25+ years of international banking experience and a sustained focus on women-led, high-growth Australian technology businesses.

She was CEO and Managing Director of Scale Investors from 2017 until 2021, where she scaled the network to over 200 sophisticated investors (predominantly women) and activated more than AU$12M of private capital across 30 investments into female-led tech startups, generating an IRR of 21.5%. Notable Scale Investors deals during her tenure include Galileo Platforms and a $1.5M seed round into handdii (the InsurTech tech-platform connecting insurers with property-claim contractors).

Her board portfolio includes long-tenured roles at three of Australia''s most significant institutions: Director and Chair of the Audit and Risk Committee at IDP Education (since 2015); Director at the Commonwealth Superannuation Corporation (since September 2016, re-appointed to 2025); Director and Finance & Investment Committee member at St Vincent''s Health Australia. She was previously a Director and Chair of the Audit and Risk Committee at Atlas Arteria (2020–22) and is on the Investment Committee of the Murdoch Children''s Research Institute (since 2011).

Her banking career spans General Manager — Products and Markets at JBWere (2015–17), Director — Equities Division at HSBC (2005–08), Executive Director — Equities Division at Goldman Sachs (Asia) (2000–02) and Associate — Capital Markets at Merrill Lynch International (1994–99). She holds a BA (Economics/Mathematics) plus graduate-level VC and AgTech credentials and is a Fellow of the AICD (FAICD).',
  why_work_with_us = 'Among the most institutionally credentialed angels in the country: Goldman/HSBC/JBWere banking depth, Scale Investors operating track-record, and audit-and-risk governance experience across listed (IDP, ex-Atlas Arteria) and statutory (CSC) boards. Particularly relevant for female-founded fintech, edtech, healthtech and insurtech businesses approaching a Seed-to-Series-A bridge.',
  sector_focus = ARRAY['FinTech','Insurtech','EdTech','HealthTech','Female Founders','SaaS'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://au.linkedin.com/in/ariane-barker-098ba02b',
  contact_email = 'ariane@scaleinvestors.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Galileo Platforms','handdii','Scale Investors (ex-CEO/MD)'],
  meta_title = 'Ariane Barker — ex-CEO Scale Investors | Melbourne Angel & NED',
  meta_description = 'Melbourne professional investor and NED. Former CEO Scale Investors (2017–21, $12M / 30 deals / 21.5% IRR). Directorships at IDP Education, CSC, St Vincent''s Health.',
  details = jsonb_build_object(
    'credentials','BA Economics/Mathematics; graduate-level Venture Capital & AgTech; FAICD',
    'current_board_roles', ARRAY[
      'Director and Chair of Audit & Risk Committee, IDP Education (since 2015)',
      'Director, Commonwealth Superannuation Corporation (since Sept 2016, re-appointed to 2025); Member Board Governance Cttee; Member Remuneration & HR Cttee; Chair ARIA Co Pty Ltd',
      'Director, St Vincent''s Health Australia; Finance & Investment Committee',
      'Investment Committee, Murdoch Children''s Research Institute (since 2011)'
    ],
    'prior_roles', ARRAY[
      'CEO & Managing Director, Scale Investors (2017–2021)',
      'Director and Chair of Audit & Risk Committee, Atlas Arteria (2020–2022)',
      'General Manager — Products and Markets, JBWere (2015–2017)',
      'Director — Equities Division, HSBC (2005–2008)',
      'Executive Director — Equities Division, Goldman Sachs (Asia) (2000–2002)',
      'Associate — Capital Markets, Merrill Lynch International (1994–1999)'
    ],
    'scale_investors_track_record', jsonb_build_object(
      'tenure','2017–2021 (CEO & MD)',
      'capital_deployed_aud','$12M+',
      'deals',30,
      'irr','21.5%',
      'investor_base','200+ sophisticated investors (predominantly women)',
      'thesis','Female-led, high-growth Australian technology startups'
    ),
    'investment_thesis','Back high-growth, female-led Australian technology startups in fintech, insurtech, edtech and healthtech. Hands-on governance support — particularly audit, risk and capital structure.',
    'check_size_note','$25k typical (per published listing)',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/ariane-barker-098ba02b',
      'crunchbase','https://www.crunchbase.com/person/ariane-barker',
      'csc_bio','https://www.csc.gov.au/About-CSC/Directors-and-executive-team/Mrs-Ariane-Barker',
      'industrymoves_csc','https://www.industrymoves.com/moves/ariane-barker-joins-csc-board',
      'idp_board','https://careers.idp.com/who-we-are/our-board-of-directors',
      'startup_daily_co_ceos','https://www.startupdaily.net/topic/funding/angel-investment-network-scale-investors-appoints-two-new-female-ceos/',
      'smartcompany_interview','https://www.smartcompany.com.au/entrepreneurs/scale-investors-ariane-barker-societal-expectations-female-entrepreneurship/',
      'handdii_round','https://scaleinvestors.com.au/handdii',
      'directory_gov_au','https://www.directory.gov.au/people/ariane-barker'
    ),
    'corrections','CSV LinkedIn URL was truncated ("ariane-barker-098ba0..."). Verified to ariane-barker-098ba02b. CSV portfolio was truncated ("Galileo platforms, Handdii..."). Expanded with verified Scale Investors deals (Galileo Platforms, handdii). Email and Melbourne location confirmed.'
  ),
  updated_at = now()
WHERE name = 'Ariane Barker';

COMMIT;
