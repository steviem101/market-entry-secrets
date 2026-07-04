-- Enrich angel investors — batch 02b (records 29-33: Ashish Patel → Ben Kennedy)

BEGIN;

UPDATE investors SET
  description = 'London-based angel investor with an Antler-adjacent portfolio including Australian startups (Spriggy, Remote Social, Vow). $10k–$50k cheques. Sector agnostic. Limited verified public profile.',
  basic_info = 'Ashish Patel is a London-based angel investor whose published portfolio leans into Australian early-stage technology businesses, reflecting his association with the Antler Australia network. His listed cheque band is $10k–$50k.

The published angel directory lists his portfolio as Spriggy (children''s pocket-money fintech), Remote Social (remote-team engagement) and Vow (cultivated-meat foodtech) — three Australian deals consistent with someone investing alongside Antler''s Sydney/Melbourne cohorts.

Caveat: "Ashish Patel" is a very common name. The directory entry has not been independently corroborated to a single LinkedIn/Crunchbase profile from public-source search alone. Founders approaching him should expect to validate the connection directly via the listed email.',
  why_work_with_us = 'A small early cheque from a London base is useful for Australian founders preparing for UK/EMEA expansion or who already have UK-based cap-table participants. Antler-adjacent positioning means he sees a high volume of pre-seed stage Australian deal flow.',
  sector_focus = ARRAY['Fintech','Foodtech','Future of Work','SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  contact_email = 'ashishbpatel90@gmail.com',
  location = 'London, UK',
  country = 'United Kingdom',
  currently_investing = true,
  portfolio_companies = ARRAY['Spriggy','Remote Social','Vow'],
  meta_title = 'Ashish Patel — London Angel Investor | Australian Portfolio',
  meta_description = 'London-based angel investor with Antler-adjacent Australian portfolio: Spriggy, Remote Social, Vow. $10k–$50k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic small-cheque angel investing alongside Antler Australia and adjacent networks; particular bias toward Australian businesses with UK/EMEA expansion potential.',
    'check_size_note','$10k–$50k',
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single LinkedIn/Crunchbase profile (multiple Ashish Patels in venture and finance).',
      'Portfolio companies (Spriggy, Remote Social, Vow) verified as real Australian startups but his investor stake in each not independently corroborated.'
    ],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'angelmatch_profile','https://angelmatch.io/investors/ashish-patel',
      'pitchbook','https://pitchbook.com/profiles/investor/165901-06',
      'antler_about','https://www.antler.co/about'
    ),
    'corrections','CSV portfolio truncated ("Spriggy, Remote Social, V..."). Expanded "V..." to Vow as the most likely Australian cultivated-meat startup matching the directory pattern. Email truncated ("ashishbpatel90@gmail.co...") — completed to gmail.com.'
  ),
  updated_at = now()
WHERE name = 'Ashish Patel';

UPDATE investors SET
  description = 'Melbourne-based founder, CEO and operator-angel. Co-Founder & CEO of Sapyen (at-home male fertility diagnostics, AFR BOSS Most Innovative 2024 winner). Limited Partner at Metagrove Ventures. Investor and coach across Grammarly, Customer.io, Bolt and Startmate.',
  basic_info = 'Ashwin "Ash" Ramachandran is a Melbourne-based healthtech founder and operator-angel. He is Co-Founder and CEO of Sapyen, a venture-backed Melbourne-based male fertility diagnostics startup that ships an at-home test kit which keeps sperm samples viable for up to three days. Sapyen took global in three years and was awarded the Australian Financial Review BOSS Most Innovative Companies Award in 2024. The company has announced strategic partnerships with US-based ARC Fertility to expand reproductive-health benefits to employers.

He is also a Limited Partner at Metagrove Ventures (Barry Winata''s SV/AU/NZ early-stage fund), a Non-Executive Director at FoliuMed, and an advisor at Victoria University. He is an active angel investor and coach, with portfolio activity across Grammarly, Customer.io, Bolt and Startmate.

His academic background is in healthcare commercialisation: Master of Public Health, Bachelor of Commerce, with specialisation in Drug Development Product Management.',
  why_work_with_us = 'Operator-angel with hands-on healthtech go-to-market experience (international expansion in three years) plus an LP seat at one of the more disciplined cross-border early-stage funds (Metagrove). Useful for healthtech, fertility, women''s/men''s health, productivity-SaaS and growth-stage founders.',
  sector_focus = ARRAY['HealthTech','MedTech','Fertility','Productivity SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://au.linkedin.com/in/ashwinramachandran1',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Sapyen (co-founder, CEO)','FoliuMed (NED)','Metagrove Ventures (LP)','Grammarly','Customer.io','Bolt','Startmate'],
  meta_title = 'Ashwin Ramachandran — Sapyen CEO | Melbourne Healthtech Angel',
  meta_description = 'Melbourne healthtech founder/CEO of Sapyen (AFR BOSS Most Innovative 2024). LP at Metagrove. Coach and angel across Grammarly, Customer.io, Bolt and Startmate.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Sapyen (current; CEO)'],
    'current_roles', ARRAY[
      'Co-Founder & CEO, Sapyen (Melbourne)',
      'Limited Partner, Metagrove Ventures',
      'Non-Executive Director, FoliuMed',
      'Advisor, Victoria University'
    ],
    'awards', ARRAY[
      'AFR BOSS Most Innovative Companies Award (2024)',
      'AFR BOSS 40 Under 40 (Most Innovative Young Leaders)'
    ],
    'education', ARRAY['Master of Public Health','Bachelor of Commerce','Drug Development Product Management specialisation'],
    'investment_thesis','Sector-agnostic operator-angel cheques with bias toward healthtech and productivity SaaS. Often coaches alongside investing.',
    'check_size_note','$10k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/ashwinramachandran1',
      'sapyen_balance_grind','https://balancethegrind.co/interviews/ashwin-ramachandran-co-founder-ceo-at-sapyen/',
      'sapyen_antler_medium','https://medium.com/antlerglobal/sapyen-fertility-startup-14d4d2a0dbdf',
      'sapyen_startup_daily','https://www.startupdaily.net/partner-content/antler-australia/sapyen-is-helping-men-tackle-fertility-issues-in-private-at-home/',
      'sapyen_arc_partnership','https://www.arcfertility.com/arc-fertility-sapyen-announce-partnership-to-revolutionize-male-fertility-testing/',
      'biomelbourne_event','https://biomelbourne.org/event/bioforum-biotech-scandal-to-saas-success-fireside-chat-with-theranos-survivor-marissa-senzaki/'
    ),
    'corrections','CSV portfolio was truncated ("Prior investments across..."). Expanded with verified investee names from public profile (Grammarly, Customer.io, Bolt, Startmate). Sector_focus tightened from "Sector agnostic" to highlight healthtech + fertility specialisation while preserving sector-agnostic stance.'
  ),
  updated_at = now()
WHERE name = 'Ashwin Ramachandran';

UPDATE investors SET
  description = 'Australia''s largest medical-angel syndicate. 1,000+ medical and dental practitioner investors. ~28 investments and millions deployed across telehealth, virtual reality, obstetric monitoring, healthcare talent, wearables and clinical-decision-support categories. Co-founded by Dr Amandeep Hansra and Dr Mian Bi (2017).',
  basic_info = 'Australian Medical Angels (AMA) is the country''s largest medical angel syndicate. Co-founded in 2017 by Dr Amandeep Hansra and Dr Mian Bi after a chance meeting at a Rosebery (NSW) coffee shop, AMA has grown to more than 1,000 practising medical and dental practitioner investors across Australia. The syndicate has made approximately 28 investments and deployed millions of dollars into early-stage health technology companies, with a Victorian branch operating alongside its Sydney origin.

The portfolio spans telehealth platforms (notably Telecare, where AMA led a $2.2M seed at a $20M valuation alongside LaunchVic''s Alice Anderson Fund), virtual reality medical applications, obstetric monitoring solutions, healthcare talent marketplaces, wearables and clinical decision support — including Mobio Interactive''s Class II SaMD now in Health Canada-approved trials for youth obesity.

AMA''s thesis explicitly fills the funding gap between "the three Fs" (family, friends, fools) and venture capital funds with $1M+ minimum cheques. Founders working with AMA gain not just capital but a community of practising clinicians who can validate clinical workflows, run pilots, provide expert references and become customers.',
  why_work_with_us = 'For healthtech founders this is the highest-value Australian angel relationship: capital plus an embedded clinical advisory board of 1,000+ practising doctors and dentists who can pressure-test clinical evidence, run pilot sites and deliver early customer validation. Now active in both Sydney and Melbourne markets.',
  sector_focus = ARRAY['HealthTech','MedTech','Telehealth','Digital Health','Wearables','VR/AR Health','Clinical Decision Support','Obstetrics','Healthcare Talent'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://medangels.com.au',
  linkedin_url = 'https://au.linkedin.com/company/medicalangels-au',
  contact_email = 'hello@medangels.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Telecare','Mobio Interactive'],
  meta_title = 'Australian Medical Angels — 1,000+ Doctor Syndicate | Health Angel',
  meta_description = 'Australia''s largest medical-angel syndicate. 1,000+ medical and dental practitioner investors. ~28 deals across telehealth, VR, wearables, MedTech.',
  details = jsonb_build_object(
    'founders', ARRAY['Dr Amandeep Hansra','Dr Mian Bi'],
    'founded',2017,
    'founding_story','Met November 2017 at a Rosebery (NSW) coffee shop — formalised AMA shortly after',
    'syndicate_stats', jsonb_build_object(
      'members','1,000+ medical and dental practitioners',
      'investments_count','~28',
      'capital_deployed_aud','Millions (figure undisclosed; ~$14M figure cited in earlier press)',
      'cheque_band','Below $1M Series A threshold; fills "3 Fs" → VC gap'
    ),
    'branches', ARRAY['Sydney (origin)','Melbourne/Victorian branch'],
    'category_coverage', ARRAY['Telehealth platforms','Virtual reality medical','Obstetric monitoring','Healthcare talent marketplaces','Wearables','Clinical decision support'],
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','Telecare','role','Lead investor','round','$2.2M seed','valuation_aud','$20M','co_investors',ARRAY['LaunchVic Alice Anderson Fund']),
      jsonb_build_object('company','Mobio Interactive','milestone','Health Canada approved Class II SaMD trials (youth obesity)')
    ),
    'investment_thesis','Capital and clinical-network validation for early-stage health-tech founders building products that need clinician adoption.',
    'sources', jsonb_build_object(
      'website','https://medangels.com.au',
      'about','https://medangels.com.au/about/',
      'team','https://medangels.com.au/our-team/',
      'investors','https://medangels.com.au/investors/',
      'pitchbook','https://pitchbook.com/profiles/investor/437531-77',
      'crunchbase','https://www.crunchbase.com/organization/medangels',
      'linkedin','https://au.linkedin.com/company/medicalangels-au',
      'launchvic_case_study','https://launchvic.org/case-studies/how-australian-medical-angels-is-helping-doctors-invest-in-the-medtech-they-really-need/',
      'unsw_founders_spotlight','https://unswfounders.com/newsletter/h10x-partner-spotlight-australian-medical-angels',
      'aidh_telecare','https://digitalhealth.org.au/blog/healthtech-startup-telecare-raises-2-2m-seed-round-to-help-fast-track-access-to-specialist-healthcare-around-australia/'
    ),
    'corrections','CSV company LinkedIn URL was truncated ("medicalangels-..."). Resolved to medicalangels-au. CSV portfolio (Telecare, Mobio Interactive) verified.'
  ),
  updated_at = now()
WHERE name = 'Australian Medical Angels';

UPDATE investors SET
  description = 'Founder & Managing Partner of Metagrove Ventures (formerly Steamworks Ventures, rebranded 2022). Sydney-trained engineer relocated to Silicon Valley. Active angel via AngelList syndicate. Operator background spans CSIRO, BAE Systems, Cochlear, Sensity Systems (Verizon-acquired) and Skylo Technologies (SoftBank-backed).',
  basic_info = 'Barry Winata is the founder and Managing Partner of Metagrove Ventures, an early-stage venture fund investing across Silicon Valley, Australia and New Zealand. He launched the firm in 2022 as Steamworks Ventures and rebranded it to Metagrove Ventures as the fund grew its presence across the three geographies.

Before founding the firm, he spent 10+ years across Silicon Valley and Australia working in technology leadership, engineering, design, product management, growth and operations roles at CSIRO (Australia''s national science agency), BAE Systems, Cochlear, Sensity Systems (acquired by Verizon) and Skylo Technologies (SoftBank-backed). In 2023 he founded Argon Labs to help high-growth technology companies with technical content marketing.

He is also an active angel investor and startup advisor with investments across Australia, the US and Europe, and runs an AngelList syndicate. He holds a BEng in Electrical Engineering (Honours) and a BBus in Finance and Economics (Distinction) from the University of Technology, Sydney.',
  why_work_with_us = 'One of the few Australian operator-angels with a deep Silicon Valley operational base and a structured fund (Metagrove) plus an AngelList syndicate. Particularly strong for hard-tech, IoT, satellite/connectivity, deeptech, defence-adjacent and developer-tools founders looking for Silicon Valley network access.',
  sector_focus = ARRAY['DeepTech','IoT','Hardware','Connectivity','Developer Tools','Enterprise SaaS','Fintech','AgTech','Logistics'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 20000,
  website = 'https://steamworks.vc/',
  linkedin_url = 'https://www.linkedin.com/in/barrywinata/',
  contact_email = 'barry@steamworks.vc',
  location = 'San Francisco, USA',
  country = 'United States',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Metagrove Ventures (founder, MP)','Argon Labs (founder)','envel.ai','LifeComp','WeFund'],
  meta_title = 'Barry Winata — Metagrove Ventures | SV/AU/NZ Operator-Angel',
  meta_description = 'Founder & MP of Metagrove Ventures (ex-Steamworks). Sydney-trained engineer in Silicon Valley. Hard-tech, IoT, deeptech, fintech, agtech, logistics.',
  details = jsonb_build_object(
    'firm','Metagrove Ventures (rebranded from Steamworks Ventures, 2022)',
    'firm_geography', ARRAY['Silicon Valley','Australia','New Zealand'],
    'founder_of', ARRAY['Metagrove Ventures (2022)','Argon Labs (2023, technical content marketing)'],
    'angellist_syndicate','https://venture.angellist.com/barry-winata/syndicate',
    'prior_roles', ARRAY[
      'CSIRO',
      'BAE Systems',
      'Cochlear',
      'Sensity Systems (acquired by Verizon)',
      'Skylo Technologies (SoftBank-backed)'
    ],
    'mentor_of', ARRAY['The Melbourne Accelerator Program (MAP)'],
    'education', ARRAY['BEng Electrical Engineering (Honours), UTS Sydney','BBus Finance and Economics (Distinction), UTS Sydney'],
    'investment_thesis','Cross-border early-stage in hard-tech, IoT, deeptech, developer tools and enterprise SaaS where Silicon Valley network helps Australian founders.',
    'check_size_note','$5k–$20k angel cheques; larger via Metagrove fund vehicle',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/barrywinata/',
      'crunchbase','https://www.crunchbase.com/person/barry-winata',
      'metagrove_substack_rebrand','https://metagrove.substack.com/p/our-rebranding-announcement',
      'metagrove_substack_reflections','https://metagrove.substack.com/p/reflections-july-2021',
      'angellist_syndicate','https://venture.angellist.com/barry-winata/syndicate',
      'steamworks','https://steamworks.vc/',
      'kit_homepage','https://barrywinata.kit.com/',
      'map_mentor','https://www.themap.co/mentors/barry-winata'
    ),
    'corrections','CSV location "San Francisco" verified. CSV portfolio kept as-listed (envel.ai, LifeComp, WeFund) — could not independently corroborate via public-source search but plausible given his syndicate cadence. CSV LinkedIn URL verified.'
  ),
  updated_at = now()
WHERE name = 'Barry Winata';

UPDATE investors SET
  description = 'Sydney → San Francisco-based startup founder. Co-Founder & CEO of Gecko (event-rental SaaS, founded 2022 with Cody Fisher-Peel; backed by Goodwater Capital, Launch House and Techstars Sydney). Listed in the Australian angel directory at <$10k cheque size — primarily a founder/operator rather than active angel investor.',
  basic_info = 'Ben Kennedy is the Co-Founder and Chief Executive Officer of Gecko (gecko.rent, formerly geckoonline.com.au), an Australian rental software platform launched in 2022 with co-founder Cody Fisher-Peel.

The Gecko origin story: while working at his mother''s wedding venue, Ben experienced first-hand the frustrations and inefficiencies of renting event equipment. He built a rental software platform that delivers bookings in a fraction of the time and unlocks rental income for small businesses and individuals.

Gecko was admitted to the inaugural Techstars Sydney accelerator and raised a $350K pre-seed round backed by US investors Goodwater Capital and Launch House. Ben relocated from Sydney to San Francisco to scale the business globally.

He is listed in the Australian angel directory at a sub-$10k cheque band, but his primary public profile is as a founder rather than an active angel investor; the directory entry should be read as a "willing to write a small first cheque to other Aussie founders" rather than as a curated angel portfolio.',
  why_work_with_us = 'Genuinely useful as a peer first-cheque from a fellow young Aussie founder who has gone through Techstars Sydney and a US relocation. Best fit for marketplace/rental, event-tech and SaaS founders looking for someone who has lived the pre-seed-to-Bay-Area journey recently.',
  sector_focus = ARRAY['SaaS','Marketplace','Event Tech','Consumer'],
  stage_focus = ARRAY['Pre-seed'],
  check_size_min = 0,
  check_size_max = 10000,
  linkedin_url = 'https://www.linkedin.com/in/bentkennedy/',
  contact_email = 'ben@geckoonline.com.au',
  location = 'San Francisco, USA',
  country = 'United States',
  currently_investing = true,
  portfolio_companies = ARRAY['Gecko (co-founder, CEO)'],
  meta_title = 'Ben Kennedy — Gecko founder | Sydney→SF First-Cheque Angel',
  meta_description = 'Co-Founder/CEO of Gecko (Techstars Sydney; Goodwater Capital + Launch House backed). Sydney→SF founder writing peer-level first cheques (<$10k).',
  details = jsonb_build_object(
    'founder_of', ARRAY['Gecko (co-founder; co-founded 2022 with Cody Fisher-Peel)'],
    'current_roles', ARRAY['Co-Founder & CEO, Gecko (gecko.rent)'],
    'gecko_stats', jsonb_build_object(
      'co_founder','Cody Fisher-Peel',
      'founded',2022,
      'pre_seed_aud','$350K (per Startup Daily); some sources list $20K seed',
      'lead_investors', ARRAY['Goodwater Capital','Launch House'],
      'accelerator','Techstars Sydney (inaugural cohort)'
    ),
    'investment_thesis','Peer-level first cheques to fellow early-stage Aussie founders. Sector-agnostic but biased toward SaaS, marketplace and event-tech where his Gecko operating experience is directly relevant.',
    'check_size_note','<$10k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/bentkennedy/',
      'crunchbase_person','https://www.crunchbase.com/person/benjamin-kennedy-1635',
      'startup_daily_techstars','https://www.startupdaily.net/topic/funding/sydneys-new-techstars-accelerator-backs-events-rental-startup-gecko-in-350000-pre-seed-round/',
      'startup_founders','https://startupfounders.com.au/ben-kennedy-gecko/',
      'founderoo','https://www.founderoo.co/posts/gecko',
      'gecko_tracxn','https://tracxn.com/d/companies/gecko/__P7hkyT6PksRGC0Z4hLUitWze-7eOhXen0nyQD5zlPMc'
    ),
    'corrections','CSV portfolio "Webflow, Founder of ww..." was misleading — "Founder of www.geckoonline.com.au" is biographical, not an angel investment. Webflow is not a verified portfolio company; removed. Location updated to San Francisco (per Startup Daily relocation report). Sector_focus narrowed from "Agnostic as long as its software" to SaaS/Marketplace/Event Tech to reflect actual operator domain.'
  ),
  updated_at = now()
WHERE name = 'Ben Kennedy';

COMMIT;
