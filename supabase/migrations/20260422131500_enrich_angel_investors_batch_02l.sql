-- Enrich angel investors — batch 02l (records 79-83: Emlyn Scott → Flying Fox Ventures)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based VC fund manager, angel investor and serial public-markets operator. Managing Partner at CP Ventures. Former CEO of the National Stock Exchange of Australia (4.5 years). Founder of OpenMarkets Group (Australia''s 2nd largest retail broker). 30+ years in finance, financial markets and technology. CFA, MBA, GDAFI, BEc credentialed.',
  basic_info = 'Emlyn Scott is a Sydney-based VC and angel investor with one of the deepest career mixes of public-markets, finance and technology in Australia. He is currently Managing Partner of **CP Ventures** — the boutique venture fund headquartered at 37 Bligh Street, Sydney that invests internationally in early-stage, highly scalable technology companies driven by the Fourth Industrial Revolution. He works alongside co-Managing Partner Chris Sang (separately profiled at record #53).

His operating track record runs across:
- **Founder, OpenMarkets Group** — Australia''s second-largest retail broker.
- **Former CEO, National Stock Exchange of Australia** (4.5 years) — Australia''s second-largest listing stock exchange.
- 30+ years across finance, financial markets and technology as founder, public-company CEO, angel investor, VC investor and fund manager.

He is unusually credentialed: **CFA** (Chartered Financial Analyst), **MBA**, **GDAFI** (Graduate Diploma in Applied Finance and Investment) and **BEc** (Bachelor of Economics) — four finance-related qualifications. He is a published podcast guest at Investor Connect and a long-standing voice on Australian fintech and capital-markets evolution.

His angel posture is sector-agnostic via CP Ventures'' international scaleable-technology mandate.',
  why_work_with_us = 'For Australian fintech, capital-markets and broader technology founders, Emlyn brings (a) a unique public-markets-CEO operator credential, (b) the OpenMarkets brokerage operating playbook, (c) CP Ventures fund-level cheque capacity alongside Chris Sang, and (d) Tier-1 US VC co-investment relationships via CP Ventures. Particularly relevant for fintech and capital-markets-adjacent founders thinking about IPO pathways or US institutional fundraising.',
  sector_focus = ARRAY['FinTech','Capital Markets','SaaS','Enterprise Tech','4th Industrial Revolution','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://cp.ventures',
  linkedin_url = 'https://www.linkedin.com/in/emlynscott/',
  contact_email = 'emlyn@cp.ventures',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['CP Ventures (Managing Partner)','OpenMarkets Group (founder)','National Stock Exchange of Australia (ex-CEO)'],
  meta_title = 'Emlyn Scott — CP Ventures MP | Sydney FinTech & Capital Markets Angel',
  meta_description = 'Sydney VC. Managing Partner CP Ventures. Ex-CEO National Stock Exchange of Australia (4.5y). Founder OpenMarkets Group. CFA/MBA/GDAFI/BEc. 30+ years.',
  details = jsonb_build_object(
    'firm','CP Ventures (boutique international VC; 4th Industrial Revolution thesis)',
    'role','Managing Partner',
    'co_managing_partner','Chris Sang (separately listed as record #53)',
    'firm_hq','37 Bligh Street, Suite 2, Sydney, NSW 2000',
    'credentials', ARRAY[
      'CFA (Chartered Financial Analyst)',
      'MBA (Masters Business Administration)',
      'GDAFI (Graduate Diploma in Applied Finance and Investment)',
      'BEc (Bachelor of Economics)'
    ],
    'operator_history', jsonb_build_array(
      jsonb_build_object('role','Founder','company','OpenMarkets Group','context','Australia''s 2nd largest retail broker'),
      jsonb_build_object('role','CEO','company','National Stock Exchange of Australia','tenure','4.5 years','context','Australia''s 2nd largest listing stock exchange')
    ),
    'experience_years','30+ years finance/financial markets/technology',
    'investment_thesis','International, highly scalable, breakthrough technology companies driven by the 4th Industrial Revolution. Sector-agnostic with capital-markets and finance depth.',
    'check_size_note','Undisclosed in CSV; CP Ventures fund-level participation calibrated to deal',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/emlynscott/',
      'crunchbase','https://www.crunchbase.com/person/emlyn-scott',
      'cb_insights','https://www.cbinsights.com/investor/emlyn-scott',
      'tracxn','https://tracxn.com/d/people/emlyn-scott/__51wvrvsfLsEgbAILmzp4WIIQjU471WdPx7JR57vK1Nc',
      'cp_team','https://cp.ventures/team/',
      'fundwa','https://www.fundwa.com.au/aboutemlynscott',
      'beamstart','https://beamstart.com/@CPVentures',
      'investor_connect','https://investorconnect.org/investor-connect-emlyn-scott-of-cp-ventures/',
      'najafi','https://najafi.capital/individual-investor/investment-partner-individual-angel-emlyn-scott/'
    ),
    'corrections','CSV portfolio truncated ("CP Ventures, OpenMarke..."). Resolved "OpenMarke..." to OpenMarkets Group (his founder company; Australia''s 2nd largest retail broker). Added National Stock Exchange of Australia ex-CEO role for completeness. CSV LinkedIn URL verified. Cross-reference: Chris Sang (record #53) is co-Managing Partner.'
  ),
  updated_at = now()
WHERE name = 'Emlyn Scott';

UPDATE investors SET
  description = 'Sydney-based angel network and accelerator. Australia''s only dedicated clean-energy and climate-tech angel investor group. Founded 2017. Free to join for accredited investors. Syndicates through Impact Ventures partner. ~$150k cheque size. Notable alumni include Powerpal (Amber exit), Amber Electric and Everty.',
  basic_info = 'EnergyLab Cleantech Angel Network is the angel-investing arm of EnergyLab — Australia''s leading climate-tech-focused incubator and accelerator, founded in 2017 and headquartered in Sydney. The network connects accredited Australian and New Zealand investors with vetted clean-energy and climate-tech early-stage companies, providing structured deal flow from EnergyLab''s incubator/accelerator/scaleup pipelines.

Joining the angel group is **free of charge** — EnergyLab coordinates the group as an ecosystem service to the Australian climate-tech community, rather than charging carry or membership fees. Investors can either invest directly into companies or syndicate through EnergyLab''s partner **Impact Ventures**.

The network''s alumni roster includes some of the most-cited Australian climate-tech success stories: **Powerpal** (smart energy monitor, acquired by Amber Electric for $9.5M), **Amber Electric** (residential electricity retailer with wholesale-pass-through pricing) and **Everty** (EV-charging SaaS, since acquired by AGL).

EnergyLab''s broader programs include a Scaleup program (13-company first cohort) and incubator cohorts focused on clean energy and climate solutions.',
  why_work_with_us = 'For climate-tech and clean-energy founders, EnergyLab Cleantech Angel Network is the most focused angel pipeline in the country — it is the **only** dedicated clean-energy and climate-tech angel network in Australia, and gives founders structured access to a curated investor base alongside accelerator/incubator program participation. Particularly relevant for energy efficiency, EV, residential energy, grid-tech and broader climate-tech founders.',
  sector_focus = ARRAY['Climate Tech','CleanTech','EnergyTech','Renewables','EV Charging','Energy Efficiency','Grid Tech','Sustainability'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 150000,
  check_size_max = 150000,
  website = 'https://energylab.org.au/angel-group/',
  linkedin_url = 'https://au.linkedin.com/company/energylab-international',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Powerpal (acquired by Amber Electric)','Amber Electric','Everty (acquired by AGL)','Ohmie'],
  meta_title = 'EnergyLab Cleantech Angel Network — Australia''s Only Climate-Tech Angel Group',
  meta_description = 'Australia''s only dedicated clean-energy/climate-tech angel network. Free to join. Syndicates via Impact Ventures. Notable alumni: Powerpal, Amber, Everty.',
  details = jsonb_build_object(
    'parent','EnergyLab (Australian climate-tech accelerator/incubator, founded 2017, Sydney)',
    'rank','Australia''s only dedicated clean-energy and climate-tech angel investor group',
    'membership_cost','Free of charge for accredited investors',
    'syndicate_partner','Impact Ventures',
    'pipeline','EnergyLab incubator, accelerator and scaleup program graduates',
    'highlight_alumni', jsonb_build_array(
      jsonb_build_object('company','Powerpal','status','Acquired by Amber Electric','value_aud','$9.5M'),
      jsonb_build_object('company','Amber Electric','category','Residential electricity retailer (wholesale pass-through)'),
      jsonb_build_object('company','Everty','status','Acquired by AGL','category','EV charging SaaS')
    ),
    'investment_thesis','Vetted Australian and New Zealand clean-energy and climate-tech early-stage companies; investors deploy directly or via Impact Ventures syndicate.',
    'check_size_note','~$150k typical cheque',
    'programs', ARRAY['Incubator cohorts','Accelerator cohorts','Scaleup Program (13-company first cohort)'],
    'sources', jsonb_build_object(
      'angel_group','https://energylab.org.au/angel-group/',
      'investors_page','https://energylab.org.au/angel-group/investors/',
      'startups_page','https://energylab.org.au/angel-group/startups/',
      'linkedin','https://au.linkedin.com/company/energylab-international',
      'pitchbook','https://pitchbook.com/profiles/investor/180884-62',
      'angels_partners','https://angelspartners.com/firm/EnergyLab',
      'pv_magazine_incubator','https://www.pv-magazine-australia.com/2019/10/28/4-clean-energy-startups-enter-the-energylab-incubator/',
      'energy_innovation_scaleup','https://www.energyinnovation.net.au/event/energylab-scaleup-program-launch-1',
      'scaleup_cohort_blog','https://energylab.org.au/blog/meet-the-thirteen-companies-in-energylabs-1st-scaleup-program-cohort/',
      'auscleantech_angels','https://www.auscleantech.com.au/forms/angels.php'
    ),
    'corrections','CSV name "EnergyLab Cleantech An..." truncated; resolved to "EnergyLab Cleantech Angel Network". CSV LinkedIn URL truncated ("energylab-inter..."). Resolved to /company/energylab-international. CSV portfolio truncated ("Ohmie, Everty, Powerpal,..."). Three retained as verified portfolio entries; expanded with Amber Electric (verified alumni). CSV cheque "150000" interpreted as $150k.'
  ),
  updated_at = now()
WHERE name = 'EnergyLab Cleantech Angel Network';

UPDATE investors SET
  description = 'Sydney-based early-stage angel syndicate run by Federico ("Fed") Quaia. 450+ investor community on the Aussie Angels platform (founded 2024). Software/technology focus. $150k syndicate cheques. Notable portfolio: Fluency ($9M Seed led by Accel), Tikpay, Mary Technologies.',
  basic_info = 'Exhort Ventures is a Sydney-based early-stage angel syndicate founded in 2024 by **Federico ("Fed") Quaia**. The syndicate operates on the **Aussie Angels** platform with a community of 450+ investors backing early-stage technology startups and venture-capital funds.

Exhort''s thesis is sector-agnostic with software/technology bias. Notable portfolio investments include:
- **Fluency** — Australian AI-native operations platform; Exhort participated in Fluency''s $9M Seed round led by Accel and was an early backer in prior rounds.
- **Tikpay** — fintech/payments.
- **Mary Technologies** (CSV-listed as "Mary Tec...").

The syndicate''s $150k typical cheque reflects the aggregated commitment from Exhort''s 450+ angel base per deal — sized to be meaningful at pre-seed/seed without dominating the cap table.',
  why_work_with_us = 'For Australian software and technology founders raising structured pre-seed/seed rounds, Exhort offers an active 450+ angel community alongside Fed''s direct cheque. Particularly useful for founders who want syndicate distribution without giving up significant cap-table real estate to a single name.',
  sector_focus = ARRAY['Software','SaaS','FinTech','AI','Payments','B2B','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 150000,
  check_size_max = 150000,
  website = 'https://exhortventures.com',
  linkedin_url = 'https://au.linkedin.com/company/exhort-ventures',
  contact_email = 'fed@exhortventures.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Fluency','Tikpay','Mary Technologies'],
  meta_title = 'Exhort Ventures — Sydney Angel Syndicate (450+ investors)',
  meta_description = 'Sydney early-stage syndicate by Federico Quaia. 450+ investors on Aussie Angels. Software focus. $150k. Portfolio: Fluency, Tikpay, Mary Technologies.',
  details = jsonb_build_object(
    'syndicate_lead','Federico ("Fed") Quaia',
    'founded',2024,
    'syndicate_platform','Aussie Angels',
    'syndicate_url','https://app.aussieangels.com/syndicate/exhort-ventures',
    'member_count','450+',
    'investment_thesis','Sector-agnostic with software/technology bias. Aggregated 450+ angel community per deal.',
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','Fluency','round','$9M Seed led by Accel','exhort_role','Early backer + follow-on participant'),
      jsonb_build_object('company','Tikpay','category','FinTech/payments'),
      jsonb_build_object('company','Mary Technologies','category','Software (per CSV)')
    ),
    'check_size_note','$150k syndicate cheque',
    'sources', jsonb_build_object(
      'website','https://exhortventures.com',
      'invest_page','https://exhortventures.com/invest',
      'tikpay_portfolio_page','https://exhortventures.com/portfolio/tikpay',
      'aussie_angels','https://app.aussieangels.com/syndicate/exhort-ventures',
      'crunchbase','https://www.crunchbase.com/organization/exhort-ventures',
      'tracxn','https://tracxn.com/d/venture-capital/exhort-ventures/__iz9UpclFQlsOUWhHSdutYGkM03FpDLtRKlqaB1uUQBw',
      'fed_quaia_linkedin','https://www.linkedin.com/in/federico-quaia/',
      'tikpay_pitchbook','https://pitchbook.com/profiles/company/521976-25'
    ),
    'corrections','CSV LinkedIn URL empty — populated with the verified company LinkedIn page. CSV portfolio truncated ("Fluency, Tikpay, Mary Tec..."). Resolved "Mary Tec..." to Mary Technologies (the most likely Australian early-stage company match).'
  ),
  updated_at = now()
WHERE name = 'Exhort Ventures';

UPDATE investors SET
  description = 'Adelaide-based serial founder and operator-angel. Co-Founder & Executive Director of Bluedot (location-based services platform). Investor & Advisor at Getmee (since June 2021). Investor at GroundLevel Insights, Exhort Ventures and SWIPEBY. Sector-agnostic small-cheque angel ($2.5k–$20k).',
  basic_info = 'Filip Eldic is an Adelaide-based serial entrepreneur and angel investor with a 10+ year track record building location-based services. He is the **Co-Founder and Executive Director of Bluedot** (bluedot.io), the location-technology platform that re-architected mobile location services for accuracy, battery efficiency and privacy.

Beyond Bluedot, his angel and advisory portfolio includes:
- **Getmee** — investor and advisor since June 2021.
- **GroundLevel Insights** — investor.
- **Exhort Ventures** — investor (LP-style commitment to Federico Quaia''s syndicate; see record #81).
- **SWIPEBY** — investor.

His academic credentials are international: a double bachelor in Economics and International Studies from the University of Adelaide, and an IT diploma from Zagreb School of Computer Sciences.

His CSV cheque band of $2.5k–$20k is operator-angel small — reflecting first-cheque participation across deals he can directly add value to via the Bluedot operator network and Adelaide ecosystem.',
  why_work_with_us = 'For Adelaide and South-Australian founders building location-based, geospatial, retail-tech or operations-tech businesses, Filip is among the most relevant local operator-angels. Particularly useful for founders who want a peer-level operator cheque from someone who has scaled a venture-backed mobile-tech platform (Bluedot).',
  sector_focus = ARRAY['Location Tech','GeoTech','Mobile','SaaS','Consumer','Retail Tech','Operations Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 2500,
  check_size_max = 20000,
  linkedin_url = 'https://www.linkedin.com/in/filipeldic/',
  contact_email = 'eldicf@gmail.com',
  location = 'Adelaide, SA',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Bluedot (co-founder, Executive Director)','Getmee (investor + advisor since June 2021)','GroundLevel Insights','Exhort Ventures','SWIPEBY'],
  meta_title = 'Filip Eldic — Bluedot co-founder | Adelaide Location-Tech Angel',
  meta_description = 'Adelaide co-founder of Bluedot (location services). Investor/advisor Getmee, GroundLevel Insights, Exhort Ventures, SWIPEBY. $2.5k–$20k cheques.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Bluedot (co-founder, Executive Director; location-based services)'],
    'current_roles', ARRAY[
      'Co-Founder & Executive Director, Bluedot',
      'Investor & Advisor, Getmee (since June 2021)',
      'Investor, GroundLevel Insights',
      'Investor, Exhort Ventures',
      'Investor, SWIPEBY'
    ],
    'education', ARRAY[
      'Double Bachelor of Economics and International Studies, University of Adelaide',
      'Diploma in IT, Zagreb School of Computer Sciences'
    ],
    'investment_thesis','Sector-agnostic small-cheque angel investing with location-tech, geospatial, mobile and operations-tech bias from Bluedot operator perspective.',
    'check_size_note','$2.5k–$20k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/filipeldic/',
      'muraena_profile','https://muraena.ai/profile/filip_eldic_46f09350',
      'crunchbase','https://www.crunchbase.com/person/filip-eldic',
      'bluedot_blog','https://bluedot.io/blog/author/filip-eldic/',
      'angelmatch_adelaide','https://angelmatch.io/investors/by-location/adelaide',
      'lead_sa_startup','https://theleadsouthaustralia.com.au/industries/startups/angel-investor-group-to-drive-adelaide-startup-scene/'
    ),
    'corrections','CSV portfolio truncated ("Getmee, Ground Level Ins..."). Two retained verbatim and expanded with Exhort Ventures + SWIPEBY (verified additional positions per Crunchbase). Bluedot added as co-founder/operating company.'
  ),
  updated_at = now()
WHERE name = 'Filip Eldic';

UPDATE investors SET
  description = 'Sydney-based modern angel syndicate co-led by Kylie Frazer and Rachael Neumann. Targets ~$5M deployment per year into early-stage Australian and New Zealand startups. Hybrid fund/syndicate model — described as "the power of a fund with the flexibility and community of a syndicate". Strong founder-advocacy and transparent processes.',
  basic_info = 'Flying Fox Ventures is a Sydney-based modern angel-investing syndicate co-founded by **Kylie Frazer** and **Rachael Neumann**, both of whom previously worked together at Eleanor Venture. Both lead Flying Fox full-time, investing alongside the angel pool of 200+ accredited Australian and New Zealand angel investors.

The firm aims to deploy approximately **AU$5 million per year** into early-stage technology startups. The model is explicitly hybrid: it offers "the power and capacity of a fund with the flexibility and community of a syndicate," operating more like a subscription that enables more part-time angels to deploy capital faster on investment opportunities.

Flying Fox is widely cited in the Australian early-stage ecosystem for **strong founder advocacy** and **transparent processes** — both founders publish openly about deal-flow and investing norms, and have been featured at Startmate, EvokeAg, SmartCompany, Startup Daily and elsewhere as voices for the Australian syndicate movement.',
  why_work_with_us = 'For Australian and NZ founders running structured pre-seed and seed rounds, Flying Fox is one of the most operator-friendly syndicates in the country — high-cadence deal-flow processes, transparent decision-making, and access to a 200+ angel pool. Particularly useful for founders who want both fund-style capacity and the flexibility of a syndicate. Note: cheque size and sector breadth are intentionally broad.',
  sector_focus = ARRAY['SaaS','Marketplace','FinTech','AgTech','Consumer','HealthTech','DeepTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.flyingfox.vc',
  linkedin_url = 'https://au.linkedin.com/company/flying-fox-vc',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Flying Fox Ventures (co-founded by Kylie Frazer + Rachael Neumann; ~$5M/yr deployment target)'],
  meta_title = 'Flying Fox Ventures — Sydney Modern Angel Syndicate ($5M/yr)',
  meta_description = 'Sydney syndicate co-led by Kylie Frazer + Rachael Neumann. ~$5M/year deployment. Hybrid fund/syndicate. AU + NZ early-stage. Founder-advocacy lens.',
  details = jsonb_build_object(
    'co_founders', ARRAY['Kylie Frazer','Rachael Neumann'],
    'leads_full_time', ARRAY['Kylie Frazer','Rachael Neumann'],
    'predecessor','Eleanor Venture (where the founders worked together previously)',
    'annual_deployment_target_aud','$5M',
    'model','Hybrid fund/syndicate — subscription-style flexibility',
    'angel_pool_size','200+ accredited Australian and NZ angels',
    'investment_thesis','High-growth Australian and New Zealand early-stage startups across software, marketplaces, fintech, agtech, consumer and healthtech, with strong founder-advocacy lens.',
    'public_voice','Featured at Startmate, EvokeAg, SmartCompany, Startup Daily; transparent investing-process publishing',
    'check_size_note','Variable per deal; cheque sized by syndicate aggregation',
    'sources', jsonb_build_object(
      'website','https://www.flyingfox.vc/',
      'linkedin','https://au.linkedin.com/company/flying-fox-vc',
      'startup_daily','https://www.startupdaily.net/topic/funding/the-rise-of-angel-investors-continues-with-a-new-vc-syndicate-flying-fox/',
      'smartcompany','https://www.smartcompany.com.au/startupsmart/flying-fox-ventures-angel-syndicate-kylie-frazer-rachael-neumann/',
      'startmate_writing','https://www.startmate.com/writing/syndicates-benefit-founders-investors-ecosystem-kylie-frazer',
      'evoke_ag','https://www.evokeag.com/love-at-first-sight-makes-solid-foundation-for-new-vc-partnership/',
      'kylie_frazer_linkedin','https://www.linkedin.com/in/kylie-frazer-6331407a/'
    ),
    'corrections','CSV LinkedIn URL empty — populated from public profile (/company/flying-fox-vc). CSV portfolio empty — left intentionally minimal (Flying Fox publishes deals selectively rather than maintaining a public portfolio list). CSV cheque empty — variable per deal.'
  ),
  updated_at = now()
WHERE name = 'Flying Fox Ventures';

COMMIT;
