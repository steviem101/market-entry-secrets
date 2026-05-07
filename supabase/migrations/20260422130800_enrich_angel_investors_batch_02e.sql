-- Enrich angel investors — batch 02e (records 44-48: Byron Bay Angels → Charlene Liu)

BEGIN;

UPDATE investors SET
  description = 'Northern Rivers (NSW) regional angel investment group, established 2018. ~43 members. Focus on purposeful, mission-driven early-stage companies. $100,000–$500,000 cheque band. Portfolio includes Ping (telco), Humble Bee (biotech materials) and Vaulta (battery technology).',
  basic_info = 'Byron Bay Angels (also known as Byron Angels and originally Northern Rivers Angels) is a regional angel investment group based in Byron Bay, NSW, established in 2018. With approximately 43 members across the Northern Rivers region, the group has positioned itself as the angel network for purposeful, mission-driven early-stage Australian companies — emphasising businesses with measurable social, environmental or community impact in addition to commercial returns.

The group runs an active monthly cadence of pitch nights and member events, and is registered as an accredited angel group on Gust. They also list a connected investing vehicle through AngelList syndicates. Verified portfolio companies drawn from public listings include Ping (telco), Humble Bee (sustainable biotech materials) and Vaulta (battery technology / energy storage).

The group operates with a $100,000–$500,000 syndicate-cheque band, with individual members each writing tickets within that envelope.',
  why_work_with_us = 'Best for purposeful and impact-led founders raising $100k–$500k seed cheques who can articulate clear social or environmental benefit alongside commercial returns. Northern Rivers regional concentration means a tight-knit operator network and a high signal/noise ratio in the room.',
  sector_focus = ARRAY['Climate','Biotech','EnergyTech','Telco','Impact','Consumer','Regional Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 100000,
  check_size_max = 500000,
  website = 'https://www.byronbayangels.com',
  linkedin_url = 'https://www.linkedin.com/company/byron-angels/',
  location = 'Byron Bay, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Ping','Humble Bee','Vaulta'],
  meta_title = 'Byron Bay Angels — Northern Rivers Impact Angel Group',
  meta_description = 'Byron Bay Angels (est. 2018). ~43 members. Purposeful, mission-driven AU early-stage companies. $100k–$500k cheques. Portfolio: Ping, Humble Bee, Vaulta.',
  details = jsonb_build_object(
    'founded',2018,
    'hq','Byron Bay, NSW (Northern Rivers)',
    'aka', ARRAY['Byron Angels','Northern Rivers Angels'],
    'members','~43',
    'angellist_syndicate','https://venture.angellist.com/marc-sofer/syndicate',
    'investment_thesis','Purposeful, mission-driven Australian early-stage companies with measurable impact alongside commercial returns. Particularly active in climate, biotech, energy storage and regional tech.',
    'check_size_note','$100,000 – $500,000 (syndicate band)',
    'sources', jsonb_build_object(
      'website','https://www.byronbayangels.com',
      'byronangels_org','https://www.byronangels.org/',
      'pitchbook','https://pitchbook.com/profiles/investor/530680-69',
      'gust','https://gust.com/organizations/northern-rivers-angels',
      'angelmatch','https://angelmatch.io/investors/by-location/byron-bay',
      'angellist_marc_sofer','https://venture.angellist.com/marc-sofer/syndicate',
      'linkedin','https://www.linkedin.com/company/byron-angels/',
      'founders_northern_rivers','http://foundersnorthernrivers.com/'
    ),
    'corrections','CSV portfolio truncated ("Ping, Humble Bee, Vaulta,..."). Three names retained as verified Byron Bay Angels portfolio entries; trailing item could not be uniquely identified. CSV cheque band ("$100,000 - $500,0...") completed to $100,000 – $500,000.'
  ),
  updated_at = now()
WHERE name = 'Byron Bay Angels';

UPDATE investors SET
  description = 'Sydney-based former founder turned full-time investor. Chartered Accountant (CA(SA)). Principal — Mergers, Acquisitions & Venture Capital at Backbone Partners (Sydney VC + advisory firm, since May 2023). Sector-agnostic with deepest experience in fintech. $5k–$100k cheques. Trades and writes publicly via byrongoldberg.com.',
  basic_info = 'Byron Goldberg ("BIG") is a Sydney-based investor with a Chartered Accountant background (CA(SA)) and a former-founder operating story. Since May 2023 he has been Principal — Mergers, Acquisitions & Venture Capital at Backbone Partners, a Sydney-based venture-capital and technology-advisory firm founded in 2022 that bridges advisory and investment for technology companies, founders, VC funds and investors.

He maintains an active personal site at byrongoldberg.com where he writes about M&A, product, technology, AI, crypto and behavioural psychology — and where he publishes his current investment thesis. He has contributed bylines to FS Private Wealth on financial-services and venture topics.

His angel posture is sector-agnostic but with the deepest accumulated experience in fintech (a function of his CA training and earlier founder/operating roles). The CSV directory lists him at $5k–$100k — a wide elastic band consistent with someone who calibrates his cheque to the deal stage, founder relationship and conviction level.',
  why_work_with_us = 'For founders running a structured fundraise, Byron offers a dual-track path: a personal angel cheque ($5k–$100k) plus, where the deal fits Backbone Partners'' technology-investment thesis, a potential institutional pathway. CA-trained financial diligence is unusual on the Sydney angel scene and useful for founders who want a sharp eye on cap-table mechanics and deal structure.',
  sector_focus = ARRAY['FinTech','SaaS','M&A','AI','Crypto','Technology'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 5000,
  check_size_max = 100000,
  website = 'https://byrongoldberg.com/',
  linkedin_url = 'https://www.linkedin.com/in/byrongoldberg/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Backbone Partners (Principal — M&A and VC)'],
  meta_title = 'Byron Goldberg (BIG) — Backbone Partners | Sydney Angel & VC',
  meta_description = 'Sydney CA-trained ex-founder. Principal M&A/VC, Backbone Partners (since May 2023). Sector-agnostic, fintech-deepest. $5k–$100k cheques. byrongoldberg.com.',
  details = jsonb_build_object(
    'credentials','CA(SA) — Chartered Accountant (South African Institute)',
    'firm','Backbone Partners (Sydney VC + technology advisory; founded 2022)',
    'role','Principal — Mergers, Acquisitions & Venture Capital (since May 2023)',
    'personal_site','https://byrongoldberg.com/',
    'public_writing_topics', ARRAY['M&A','Product','Technology','AI','Crypto','Behavioural Psychology'],
    'media_presence', ARRAY['FS Private Wealth bylines'],
    'investment_thesis','Sector-agnostic angel cheques with fintech depth. Cheques calibrated to deal stage and conviction. Where deal fits Backbone Partners'' tech-investment thesis, optional institutional pathway.',
    'check_size_note','$5k–$100k (elastic, conviction-calibrated)',
    'sources', jsonb_build_object(
      'website','https://byrongoldberg.com/',
      'about','https://byrongoldberg.com/about',
      'linkedin','https://www.linkedin.com/in/byrongoldberg/',
      'backbone_partners','https://www.backbonepartners.com.au/',
      'backbone_pitchbook','https://pitchbook.com/profiles/investor/529211-71',
      'fs_private_wealth','https://www.fsprivatewealth.com.au/author/byron-goldberg-177270264',
      'clay_earth','https://clay.earth/profile/byron-goldberg'
    ),
    'corrections','CSV LinkedIn URL verified. CSV email field showed only "Email" placeholder — left contact_email NULL. CSV portfolio empty; populated with verified firm affiliation (Backbone Partners) rather than fabricating individual portfolio companies.'
  ),
  updated_at = now()
WHERE name = 'Byron Goldberg (BIG)';

UPDATE investors SET
  description = 'Australia''s first formally-incorporated angel investment group. Established by lunch-table conversation and incorporated as a Company Limited by Guarantee in 2005, headquartered in Canberra. Each member makes their own decision and writes their own cheque (no group-investment vehicle). Sector breadth reflects the Capital Region economy: financial, life-science/biotech, software, IT, technical services, internet, gaming and consumer. Notable past investment: Instaclustr.',
  basic_info = 'Capital Angels was the first formally-incorporated angel investment group in Australia — set up over lunch by a small group of Canberra-based investors and incorporated as a Company Limited by Guarantee in 2005. Headquartered in Canberra, the network supports Capital Region (ACT and surrounding NSW) entrepreneurs through both investment and direct-activity support of portfolio companies.

A defining feature of Capital Angels is that the group does **not** invest as a fund. Each member proactively decides whether to participate in a deal and writes their own cheque directly to the company; the group provides the deal-flow filter, due-diligence cadence, member-network introductions and post-investment governance support.

Sector coverage reflects the Capital Region economy — heavily weighted to high-technology and government/professional services — but the membership''s individual interests span financial services, life science and biotech, software of all kinds, technical services, IT, transportation services, gaming, retail, internet and consumer products. The group has facilitated numerous investments in ACT and Capital Region companies, with Instaclustr (open-source data-platform-as-a-service) being among its most-cited successes.',
  why_work_with_us = 'For Canberra and Capital Region founders, this is the most established and longest-running angel network in Australia (20+ years of continuous operation). Member-by-member decision-making means deal velocity depends on individual conviction rather than committee consensus, which can be faster for compelling deals. Particularly relevant for ACT-based deeptech, defence-adjacent, govtech, fintech and software founders.',
  sector_focus = ARRAY['Government Tech','DeepTech','Software','SaaS','HealthTech','Biotech','Defence','FinTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.capitalangels.com.au',
  linkedin_url = 'https://au.linkedin.com/company/capital-angels-pty-ltd',
  location = 'Canberra, ACT',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Instaclustr'],
  meta_title = 'Capital Angels — Australia''s First Angel Investment Group',
  meta_description = 'Canberra. Australia''s first incorporated angel group (2005). Members invest individually. Capital Region focus. Notable: Instaclustr.',
  details = jsonb_build_object(
    'founded',2005,
    'incorporation','Company Limited by Guarantee',
    'first_in_australia',true,
    'hq','Canberra, ACT',
    'structure','Members invest individually — group does not pool capital. Group provides deal flow, due diligence, member intros and governance support.',
    'sector_coverage', ARRAY[
      'Financial services',
      'Media',
      'Life science and biotech',
      'Software (all kinds)',
      'Technical services',
      'IT',
      'Transportation services',
      'Games',
      'Retail',
      'Internet',
      'Consumer products and technology'
    ],
    'notable_investments', ARRAY['Instaclustr'],
    'investment_thesis','Member-driven deal flow into ACT and Capital Region high-technology, services and software businesses. Tier reflects member individual conviction.',
    'sources', jsonb_build_object(
      'website','https://www.capitalangels.com.au/',
      'message_chair','https://www.capitalangels.com.au/message-chair.html',
      'linkedin','https://au.linkedin.com/company/capital-angels-pty-ltd',
      'tracxn','https://tracxn.com/d/angel-network/capital-angels-network/__IVb_0E6NQsotffcwmAnOXEyotRgsexDgMUzk3Bel3oo',
      'crunchbase','https://www.crunchbase.com/organization/capital-angels-australia'
    ),
    'corrections','CSV portfolio listed as "lots, been active since 20..." — interpreted as a stylistic placeholder rather than literal portfolio data. Replaced with verified notable investment (Instaclustr) and noted member-individual investment structure to set founder expectations correctly.'
  ),
  updated_at = now()
WHERE name = 'Capital Angels';

UPDATE investors SET
  description = 'Melbourne-based serial founder turned 100+ portfolio angel investor. Co-founder 1Form (REA Group exit, 2014), Fillr (Rakuten exit, 2020) and Inhouse Ventures (Scalare Partners exit, early 2025). Three exits, three companies. Sector-agnostic. $10k–$50k cheques. Active mentor on MentorCruise and Intro.co.',
  basic_info = 'Chad Stephens is a Melbourne-based serial founder turned full-time angel investor with one of Australia''s longest individual angel-portfolio track records — 100+ angel investments across Australia and the United States.

His three exits are unusually concentrated for an Australian operator-angel:
- Co-founded **1Form** (online tenancy application platform), grew it to 90%+ of the Australian rental market, exited to ASX-listed REA Group in 2014.
- Co-founded **Fillr** (autofill-as-a-service tech embedded into Klarna, Afterpay and Zip), raised $5M from SoftBank and Reinventure, exited to Rakuten in 2020.
- Co-founded **Inhouse Ventures** in July 2022 with Elliot Spiegel and Mark Cameron — a marketplace connecting founders, investors and ecosystem leaders that grew to 10,000+ users before exiting to ASX-listed Scalare Partners in early 2025.

His verified angel portfolio includes Designerex, Vitadrop, Recime, EdTripper, Aussie Angels, Birchal, Cloutly, Threadicated, Skoutli, ListSocial, Loop, Loop Fans, TRENDii and Living Legacy Forest. He works as a fractional COO, advisor and mentor — bookable via Intro.co and MentorCruise — and writes $10k–$50k cheques.',
  why_work_with_us = 'Among the highest-leverage Australian angel relationships available: three exits across consumer-marketplace (REA), fintech-embedded SaaS (Rakuten) and ecosystem-marketplace (Scalare). 100+ portfolio gives Chad pattern recognition that few angels in Australia can match. Particularly useful for marketplace, B2B SaaS, fintech-adjacent and consumer founders looking for a fractional-COO style hands-on cheque.',
  sector_focus = ARRAY['Marketplace','SaaS','FinTech','Consumer','PropTech','EdTech','HealthTech','SaaS Marketplaces'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://au.linkedin.com/in/chadstephens1',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['1Form (co-founder; REA Group exit 2014)','Fillr (co-founder; Rakuten exit 2020)','Inhouse Ventures (co-founder; Scalare Partners exit 2025)','Designerex','Vitadrop','Recime','EdTripper','Aussie Angels','Birchal','Cloutly','Threadicated','Skoutli','ListSocial','Loop','Loop Fans','TRENDii','Living Legacy Forest'],
  meta_title = 'Chad Stephens — 1Form, Fillr, Inhouse | Melbourne Operator-Angel',
  meta_description = 'Melbourne 100+ angel portfolio. Three exits: 1Form (REA 2014), Fillr (Rakuten 2020), Inhouse Ventures (Scalare 2025). $10k–$50k cheques.',
  details = jsonb_build_object(
    'founder_of', ARRAY['1Form (co-founder; REA Group exit 2014)','Fillr (co-founder; Rakuten exit 2020)','Inhouse Ventures (co-founder; Scalare Partners exit 2025)'],
    'exits', jsonb_build_array(
      jsonb_build_object('company','1Form','category','Online tenancy applications (90%+ AU rental market)','acquirer','REA Group (ASX)','year',2014),
      jsonb_build_object('company','Fillr','category','Autofill-as-a-Service (Klarna/Afterpay/Zip)','funding_aud','$5M from SoftBank + Reinventure','acquirer','Rakuten Inc.','year',2020),
      jsonb_build_object('company','Inhouse Ventures','category','Founder-investor marketplace (10,000+ users)','co_founders',ARRAY['Elliot Spiegel','Mark Cameron'],'acquirer','Scalare Partners (ASX)','year',2025)
    ),
    'angel_portfolio_count','100+ across Australia and the US',
    'current_roles', ARRAY[
      'Active angel investor',
      'Fractional COO, advisor and mentor',
      'Bookable via Intro.co and MentorCruise'
    ],
    'investment_thesis','Sector-agnostic, with strong pattern recognition in marketplaces, SaaS, fintech-embedded SaaS, consumer and ecosystem businesses. Operator-grade hands-on support post-investment.',
    'check_size_note','$10k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/chadstephens1',
      'crunchbase','https://www.crunchbase.com/person/chad-stephens',
      'intro_co','https://intro.co/ChadStephens',
      'mentorcruise','https://mentorcruise.com/mentor/chadstephens/',
      'kenobe_ventures','https://www.kenobe.com/chad-stephens',
      'inhouse_ventures_event','https://events.humanitix.com/from-startup-to-exit',
      'enterprise_angel_list','https://shizune.co/investors/enterprise-angel-investors-australia'
    ),
    'corrections','CSV portfolio empty — populated with 14 verified angel investments plus three founder/exit companies. CSV had email field empty; left contact_email NULL pending direct contact (Intro.co/MentorCruise are public booking channels).'
  ),
  updated_at = now()
WHERE name = 'Chad Stephens';

UPDATE investors SET
  description = 'Shenzhen-based Investment Manager at AUKEY (Chinese consumer-electronics group, AuGroup). Sequoia Fellow alumna (Sequoia Capital). Cross-border investor with Australian educational and professional background — Master of Commerce (Excellence) from UNSW; Bachelor of Business from Monash. DTC consumer-electronics and cross-border logistics focus. Portfolio includes Navitas and J&T Express.',
  basic_info = 'Charlene (Qianyu) Liu is a Shenzhen-based investment professional with strong Australian academic and operating ties. She is a Manager — Investment at AUKEY (parent group AuGroup), a major Chinese consumer-electronics brand operating multiple D2C/marketplace channels including Amazon US/EU. AUKEY''s investment arm makes both strategic and financial early-stage investments in consumer-electronics, e-commerce infrastructure and logistics-tech.

She is a Sequoia Fellow alumna (Sequoia Capital fellowship program) and has held prior roles at Cloud Joy Capital, CITIC Securities, LW Asset Management Advisors, Convoy Financial Services, Baby Direct and Accenture. Her academic credentials are unusually deep for an Australian-Asian cross-border investor: Master of Commerce (With Excellence) from UNSW Sydney and Bachelor of Business from Monash University in Melbourne.

Her CSV-listed portfolio includes Navitas (Australian education-services group, ASX-listed before privatisation) and J&T Express (Indonesian-founded global delivery company, founded August 2015 in Jakarta, now one of South-East Asia''s largest courier brands). Her cheque-size ceiling is unusually high (CSV: <USD$8M) — consistent with deploying balance-sheet rather than personal-angel capital, likely on behalf of AUKEY/AuGroup investment vehicles.',
  why_work_with_us = 'For Australian DTC, consumer-electronics and cross-border-logistics founders looking to scale into China and South-East Asia, Charlene is one of the more institutional Shenzhen-side relationships available. Her Australian academic and professional background means quicker context-establishment than typical China-based investors. Particularly relevant for hardware, smart-home, e-commerce-infrastructure and logistics-tech founders.',
  sector_focus = ARRAY['DTC','Consumer Electronics','Hardware','E-commerce','Logistics','Cross-border'],
  stage_focus = ARRAY['Seed','Series A','Series B','Growth'],
  check_size_min = NULL,
  check_size_max = 12000000,
  linkedin_url = 'https://www.linkedin.com/in/qianyuliu00/',
  location = 'Shenzhen, China',
  country = 'China',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Navitas','J&T Express'],
  meta_title = 'Charlene Liu — AUKEY Investment | Shenzhen DTC + Cross-Border',
  meta_description = 'Shenzhen Investment Manager at AUKEY (AuGroup). Sequoia Fellow. UNSW + Monash educated. DTC, consumer electronics, cross-border logistics. Portfolio: Navitas, J&T Express.',
  details = jsonb_build_object(
    'firm','AUKEY (AuGroup) — Investment Management',
    'role','Manager, Investment',
    'sequoia_fellowship',true,
    'prior_employers', ARRAY[
      'Sequoia Capital (Sequoia Fellow)',
      'Cloud Joy Capital',
      'CITIC Securities',
      'LW Asset Management Advisors',
      'Convoy Financial Services',
      'Baby Direct',
      'Accenture'
    ],
    'education', ARRAY[
      'Master of Commerce (With Excellence), UNSW Sydney',
      'Bachelor of Business, Monash University, Melbourne'
    ],
    'australia_link','Studied at Monash and UNSW; meaningful Australian academic and operating context for cross-border deals.',
    'investment_thesis','Strategic and financial early-stage and growth investments into DTC consumer-electronics, hardware, e-commerce-infrastructure and cross-border logistics — particularly companies with China/SE Asia scale ambitions.',
    'check_size_note','Cheque ceiling listed at <USD$8M; consistent with corporate-balance-sheet deployment rather than personal angel capital',
    'sources', jsonb_build_object(
      'linkedin_au','https://www.linkedin.com/in/qianyuliu00/',
      'linkedin_cn','https://cn.linkedin.com/in/qianyuliu00/en',
      'aukey','https://www.zoominfo.com/p/Charlene-Liu/5467906147',
      'rocketreach','https://rocketreach.co/charlene-liu-email_307741741',
      'jt_express_wikipedia','https://en.wikipedia.org/wiki/J%26T_Express',
      'shenzhen_angel_pitchbook','https://pitchbook.com/profiles/investor/343104-49'
    ),
    'corrections','CSV portfolio truncated ("Navitas, J&T Express, Sur..."). Resolved to two confirmed names; "Sur..." could not be uniquely identified. CSV cheque ceiling "<USD$8m" stored as $12M AUD upper bound (rough USD→AUD conversion at 0.67 USD/AUD; check_size_min left NULL since CSV did not specify a floor).'
  ),
  updated_at = now()
WHERE name = 'Charlene Liu';

COMMIT;
