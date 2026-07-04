-- Enrich angel investors — batch 02k (records 74-78: Ecotone Ventures → Emily Casey)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based climate-tech angel network operated by Ecotone Partners. Connects climate-conscious investors to early-stage ventures with measurable climate impact. Pre-seed and seed syndicate investing on a deal-by-deal basis. LaunchVic Climate Angel Network partner. $100k–$200k cheques. Andrew Loh is Angel Network Manager.',
  basic_info = 'Ecotone Ventures is the Melbourne-headquartered climate-tech angel network operated by Ecotone Partners. The network connects climate-conscious investors with early-stage ventures building climate solutions, using a syndicate model where members invest deal-by-deal at the pre-seed and seed stage.

Ecotone Ventures is recognised as a LaunchVic Climate Angel Network partner — formal recognition by Victoria''s state-government innovation agency for the network''s role in catalysing Victorian climate-tech investment activity. The Angel Network Manager is **Andrew Loh**, who runs the syndicate''s deal flow, member matching, and post-investment community-building.

The network''s portfolio leans into Australian climate-tech founders working on energy efficiency, electric mobility and renewable infrastructure. The CSV-listed portfolio includes **Ohmie** (energy/renewables), **Everty** (EV charging SaaS, AGL company since acquisition), **Powerpal** (smart energy monitor; acquired by Amber Electric for $9.5M) and a fourth name truncated in source data.

Cheque band of $100k–$200k reflects the syndicate''s aggregated check from member commitments per deal.',
  why_work_with_us = 'For Australian climate-tech founders, Ecotone Ventures is one of the more focused syndicate cheques on the market — combining (a) explicit climate-only mandate, (b) Ecotone Partners advisory practice for post-investment ESG and impact-measurement support, (c) LaunchVic recognition unlocking Victorian government and ecosystem networks, and (d) member base of climate-conscious investors who value impact alongside returns.',
  sector_focus = ARRAY['Climate Tech','EnergyTech','EV Charging','Renewables','CleanTech','Energy Efficiency','Sustainability','Impact'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 100000,
  check_size_max = 200000,
  website = 'https://www.ecotonepartners.com.au/ecotone-ventures',
  linkedin_url = 'https://www.linkedin.com/company/ecotone-ventures',
  contact_email = 'andrew@ecotonepartners.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Ohmie','Everty','Powerpal'],
  meta_title = 'Ecotone Ventures — Melbourne Climate-Tech Angel Network',
  meta_description = 'Melbourne climate-tech syndicate by Ecotone Partners. LaunchVic Climate Angel Network partner. Andrew Loh, Angel Network Manager. $100k–$200k. Portfolio: Ohmie, Everty, Powerpal.',
  details = jsonb_build_object(
    'parent','Ecotone Partners (Melbourne climate advisory)',
    'angel_network_manager','Andrew Loh',
    'launchvic_partnership','Climate Angel Network partner — formal recognition by Victorian state innovation agency',
    'cadence','Deal-by-deal syndicate investing at pre-seed and seed',
    'investment_thesis','Climate-conscious investors backing Australian early-stage ventures with measurable climate impact. Syndicate model with operator-level Ecotone Partners ESG/impact-measurement support post-investment.',
    'check_size_note','$100k–$200k syndicate cheques',
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','Powerpal','status','Acquired by Amber Electric for $9.5M','category','Smart energy monitor'),
      jsonb_build_object('company','Everty','status','Acquired by AGL','category','EV charging SaaS'),
      jsonb_build_object('company','Ohmie','category','Energy/renewables')
    ),
    'sources', jsonb_build_object(
      'website','https://www.ecotonepartners.com.au/ecotone-ventures',
      'linkedin','https://www.linkedin.com/company/ecotone-ventures',
      'parent_linkedin','https://www.linkedin.com/company/ecotone-partners',
      'launchvic','https://launchvic.org/programs/climate-angel-network/',
      'andrew_loh_balance_grind','https://balancethegrind.co/interviews/andrew-loh-angel-network-manager-at-ecotone-ventures/',
      'climate_network_melbourne','https://climatenetwork.melbourne/news/fund-change-world-literally',
      'climate_salad_directory','https://members.climatesalad.com/organisation/recw0VtALisrAvS7r',
      'cb_insights','https://www.cbinsights.com/investor/ecotone-ventures',
      'powerpal_amber_acquisition','https://www.businessnewsaustralia.com/articles/electricity-retailer-amber-buys-powerpal-for--9-5-million.html'
    ),
    'corrections','CSV portfolio truncated ("Ohmie, Everty, Powerpal,..."). Three names retained as verified portfolio entries; trailing item could not be uniquely identified. CSV LinkedIn URL truncated ("ecotone-ventur..."). Resolved to /company/ecotone-ventures. CSV cheque band "100-200K" interpreted as $100k–$200k.'
  ),
  updated_at = now()
WHERE name = 'Ecotone Ventures';

UPDATE investors SET
  description = 'Melbourne-based serial founder, fund principal and angel investor. Founder of Cardinia Ventures (2016, pre-seed/seed VC across AU + US). Co-founded Omny Studio (2012) and GXE (2020). Long-tenured Investor & Advisor at Chronosphere (since Feb 2019, $160M+ ARR). Portfolio includes Cadmus, Chronosphere and other consumer-software and B2B SaaS investments.',
  basic_info = 'Edward "Ed" Hooper is a Melbourne-based serial technology founder, VC fund principal and angel investor with deep dual-track Australian and US scale-up exposure.

He founded **Cardinia Ventures** in 2016 — a Melbourne/Sydney-based pre-seed and seed VC supporting software and hardware founders across Australia and the US. Cardinia operates across pre-seed through Series A.

Beyond Cardinia, he co-founded **GXE** in 2020 with Andrew Armstrong (gaming/entertainment exchange), and **Omny Studio** in 2012 with Long Zheng and Andrew Armstrong (audio/podcast SaaS).

His most-cited single angel investment is **Chronosphere** — the cloud-native observability platform — where he was an early investor and advisor since February 2019. Chronosphere has since grown to hundreds of employees, USD $160M+ ARR, customers including Robinhood, DoorDash, Snapchat and Commonwealth Bank, and institutional backers including Greylock, Lux Capital, General Atlantic, Founders Fund and Google Ventures. His other CSV-listed portfolio name **Cadmus** is the Australian academic-integrity assessment SaaS used by universities globally.

His thesis spans consumer software, B2B SaaS, infrastructure and developer tools. He is also active in the Sydney technology community via TechSydney.',
  why_work_with_us = 'For Australian founders raising structured pre-seed and seed rounds with US scale ambitions, Ed brings (a) Cardinia Ventures fund-level cheque capacity, (b) operator credentials from three founder companies, and (c) one of the most successful Australian-led US angel investments visible (Chronosphere). Particularly useful for B2B SaaS, infrastructure, observability and developer-tools founders.',
  sector_focus = ARRAY['Consumer Software','B2B SaaS','Infrastructure','Developer Tools','Observability','EdTech','Audio/Podcast'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.cardiniaventures.com',
  linkedin_url = 'https://www.linkedin.com/in/ehooper/',
  contact_email = 'ed@cardiniaventures.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Cardinia Ventures (founder)','Chronosphere (early investor + advisor since Feb 2019)','Cadmus','GXE (co-founder, 2020)','Omny Studio (co-founder, 2012)'],
  meta_title = 'Edward Hooper — Cardinia Ventures founder | Melbourne SaaS & SF Angel',
  meta_description = 'Melbourne founder of Cardinia Ventures. Co-founder GXE, Omny Studio. Early Chronosphere investor (Feb 2019; $160M+ ARR). Cadmus portfolio.',
  details = jsonb_build_object(
    'firm','Cardinia Ventures (founded 2016; Melbourne/Sydney; pre-seed and seed VC)',
    'firm_geography', ARRAY['Australia','United States'],
    'firm_stages', ARRAY['Pre-seed','Seed','Series A'],
    'founder_of', ARRAY[
      'Cardinia Ventures (2016)',
      'GXE (2020, co-founder with Andrew Armstrong)',
      'Omny Studio (2012, co-founder with Long Zheng and Andrew Armstrong)'
    ],
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','Chronosphere','role','Early investor + advisor since Feb 2019','current_arr_usd','$160M+','customers',ARRAY['Robinhood','DoorDash','Snapchat','Commonwealth Bank'],'co_investors',ARRAY['Greylock','Lux Capital','General Atlantic','Founders Fund','Google Ventures']),
      jsonb_build_object('company','Cadmus','category','Academic-integrity assessment SaaS for universities')
    ),
    'community_roles', ARRAY['TechSydney member'],
    'investment_thesis','Consumer software, B2B SaaS, infrastructure, observability and developer tools across Australia and the US. Pre-seed through Series A.',
    'check_size_note','Cardinia Ventures fund-level participation; angel cheques calibrated to deal',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/ehooper/',
      'crunchbase','https://www.crunchbase.com/person/edward-hooper-d63c',
      'cardinia_team','https://www.cardiniaventures.com/team-old',
      'cardinia_linkedin','https://au.linkedin.com/company/cardiniavc',
      'cardinia_tracxn','https://tracxn.com/d/venture-capital/cardinia-ventures/__3F3DlnLdjgLTnnAYgF2w2SacW_Yem_22G-Qjf-RcWV8',
      'cardinia_crunchbase','https://www.crunchbase.com/organization/cardinia-ventures',
      'gxe_about','https://gxe.com/about',
      'startup_galaxy_org','https://theorg.com/org/startup-galaxy/org-chart/edward-hooper',
      'techsydney','https://www.techsydney.com.au/u/edwardhooper'
    ),
    'corrections','CSV portfolio truncated ("Cadmus, Chronosphere, ..."). Two retained as verified; trailing item could not be uniquely identified. Added founder/operator companies (Cardinia, GXE, Omny Studio) for completeness. CSV LinkedIn URL verified.'
  ),
  updated_at = now()
WHERE name = 'Edward Hooper';

UPDATE investors SET
  description = 'Sydney-based climate-tech angel syndicate (established 2022). Australia''s largest Climate Tech syndicate with 400–450+ members. Operates on Aussie Angels platform. ~11 investments to date including MGA Thermal, NRN, Goterra, Amber Electric, Sicona, SunDrive and Gridsight. Founded and led by Danin Kahn. $150k–$400k syndicate cheques.',
  basic_info = 'Electrifi Ventures is Australia''s largest dedicated climate-tech angel investment syndicate, established in 2022 and based in Sydney. Led by founder **Danin Kahn** (separately profiled in the directory at record #66 as the personal-angel entry), the syndicate operates on the **Aussie Angels** platform with a community of 400–450+ members across angels, high-net-worths and family offices.

It primarily focuses on seed-stage Australian climate-tech investments. As of late 2025 the syndicate had made approximately 11 investments, with capital deployed across MGA Thermal, NRN (National Renewable Network), Goterra, Amber Electric, Sicona, SunDrive, Termina, Voltavate, Harvest B, Carbon Asset Solutions, Gridsight, Rainstick, Orkestra, Aquila and Fugu. Of the 39 Australian companies tipped to become "Climate Unicorns" by industry publications, Electrifi has backed 6.

The syndicate''s headline 2025 deal was a Series A position in National Renewable Network (NRN) — one of Australia''s largest climate-tech Series A rounds at $67M (August 2025). It also previously backed MGA Thermal in a $14.1M capital raise.

Cheque band of $150k–$400k reflects aggregated syndicate commitment per deal.',
  why_work_with_us = 'For Australian climate-tech founders, Electrifi Ventures is the highest-leverage syndicate available — Australia''s largest dedicated climate-tech investor community by member count, with the deal-flow filter, network-distribution power and award-winning peer recognition (founder Danin Kahn won 2025 Climate Salad Best Investor) that few other syndicates can match. Particularly relevant for energy storage, renewables, energy efficiency and broader climate-tech founders raising structured seed and Series A rounds.',
  sector_focus = ARRAY['Climate Tech','EnergyTech','Renewables','Energy Storage','CleanTech','GreenTech','Sustainability','EV Charging'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 150000,
  check_size_max = 400000,
  website = 'https://www.electrifi.ventures',
  linkedin_url = 'https://au.linkedin.com/company/electrifi-ventures',
  contact_email = 'hello@electrifi.ventures',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['MGA Thermal','National Renewable Network (NRN)','Goterra','Amber Electric','Sicona','SunDrive','Termina','Voltavate','Harvest B','Carbon Asset Solutions','Gridsight','Rainstick','Orkestra','Aquila','Fugu'],
  meta_title = 'Electrifi Ventures — Australia''s Largest Climate-Tech Syndicate',
  meta_description = 'Sydney climate-tech syndicate. Australia''s largest with 400+ members. ~11 investments incl. MGA Thermal, NRN, Goterra, SunDrive. Founded by Danin Kahn. $150k–$400k.',
  details = jsonb_build_object(
    'founded',2022,
    'founder_lead','Danin Kahn (separately listed as personal-angel record #66)',
    'syndicate_platform','Aussie Angels',
    'syndicate_url','https://app.aussieangels.com/syndicate/electrifi-ventures',
    'member_count','400–450+',
    'rank','Australia''s largest dedicated Climate Tech syndicate',
    'investments_to_date','~11 (with broader portfolio of 15+ tracked companies)',
    'climate_unicorns_backed','6 of 39 tipped',
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','National Renewable Network (NRN)','round','Series A','value_aud','$67M','year',2025,'context','One of Australia''s largest climate-tech Series A deals'),
      jsonb_build_object('company','MGA Thermal','round','Capital raise','value_aud','$14.1M')
    ),
    'investment_thesis','Australian climate-tech founders building scalable solutions across energy storage, renewables, energy efficiency, EV infrastructure, biotech-adjacent climate categories and grid-tech. Syndicate aggregates 400+ angels per deal.',
    'check_size_note','$150k–$400k syndicate cheques',
    'sources', jsonb_build_object(
      'website','https://www.electrifi.ventures/',
      'aussie_angels','https://app.aussieangels.com/syndicate/electrifi-ventures',
      'tracxn','https://tracxn.com/d/angel-network/electrifi-ventures/__4YYju0lH82iabZ6He8VxFL6TwJ6bBa_TUp7aDQZlWuM',
      'pitchbook','https://pitchbook.com/profiles/investor/523470-25',
      'cb_insights','https://www.cbinsights.com/investor/electrifi-ventures',
      'mga_thermal_press','https://www.businessnewsaustralia.com/articles/electrifi-ventures-makes-quickfire-investment-in-energy-tech-startup-mga-thermal-s--14-1m-raise.html',
      'rocketreach','https://rocketreach.co/electrifi-ventures-profile_b778685cc51b392e',
      'danin_kahn_linkedin','https://www.linkedin.com/in/daninkahn/'
    ),
    'corrections','CSV LinkedIn URL empty — populated with the verified electrifi-ventures company LinkedIn page. CSV portfolio empty — expanded with 15 verified Electrifi portfolio names from Tracxn/PitchBook/Crunchbase. CSV cheque band "$150k - $400K" interpreted as $150k–$400k. Cross-reference: founder Danin Kahn appears separately as personal-angel record #66.'
  ),
  updated_at = now()
WHERE name = 'Electrifi Ventures';

UPDATE investors SET
  description = 'Sydney-based serial founder and operator-angel. CEO and Co-founder of Inhouse Ventures (founder/investor marketplace, founded June 2022, sold to ASX-listed Scalare Partners early 2025 for ~AU$1.73M). Co-founder Inhouse Digital growth-marketing agency before. Investor and advisor at GoTradie and EdTripper.',
  basic_info = 'Elliot Spiegel is a Sydney-based serial founder and operator-angel investor with a clean recent exit. He is the CEO and Co-founder of **Inhouse Ventures**, the founder-and-investor marketplace he co-founded in June 2022 with Chad Stephens (separately profiled at record #47) and Mark Cameron. Inhouse Ventures grew to more than 10,000 founders, investors, VC funds, family offices and private-equity firms, automating the matching between entrepreneurs and capital.

Inhouse Ventures was acquired by ASX-listed Scalare Partners in early 2025 for approximately AU$1.73M (with $233,331 in upfront cash consideration to Spiegel). The Inhouse team also launched **AngelClass**, a startup-funding education platform that reduces friction in the founding process.

Before Inhouse Ventures, he was Digital Director at Inhouse Digital, where he bootstrapped the agency into a leading growth-marketing firm working with venture-backed scaleups. His personal angel portfolio includes investments and advisory roles at **GoTradie** (tradie marketplace) and **EdTripper** (educational travel platform), reflecting a sector-agnostic generalist mandate.',
  why_work_with_us = 'For Australian early-stage founders running structured fundraises, Elliot offers (a) deep visibility into Australian VC and angel deal flow via Inhouse Ventures'' 10,000+ user base, (b) practical fundraising-process knowledge from AngelClass, and (c) growth-marketing operator experience from Inhouse Digital. Particularly useful for founders who need help structuring their fundraising process or accessing the Australian capital network.',
  sector_focus = ARRAY['Marketplace','SaaS','Consumer','EdTech','Trade Services','FinTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/elliotspiegel/',
  contact_email = 'elliot@inhouseventures.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Inhouse Ventures (co-founder, CEO; Scalare Partners exit early 2025, ~AU$1.73M)','AngelClass (co-founder via Inhouse)','GoTradie','EdTripper','Inhouse Digital (co-founder)'],
  meta_title = 'Elliot Spiegel — Inhouse Ventures CEO | Sydney Operator-Angel',
  meta_description = 'Sydney CEO/co-founder Inhouse Ventures (Scalare Partners exit early 2025, ~$1.73M). 10,000+ user marketplace. AngelClass co-founder. GoTradie, EdTripper.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Inhouse Ventures (June 2022, co-founder with Chad Stephens and Mark Cameron)',
      'AngelClass (co-founder via Inhouse)',
      'Inhouse Digital (co-founder)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Inhouse Ventures','category','Founder/investor marketplace','users','10,000+','acquirer','Scalare Partners (ASX)','year',2025,'value_aud','~$1.73M','elliot_upfront_cash','$233,331')
    ),
    'co_founders', ARRAY['Chad Stephens (separately listed as record #47)','Mark Cameron'],
    'angel_portfolio', ARRAY['GoTradie','EdTripper'],
    'investment_thesis','Sector-agnostic Sydney early-stage founders, with growth-marketing operator overlay and Inhouse-Ventures-pipeline visibility into the AU capital market.',
    'check_size_note','Undisclosed in CSV',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/elliotspiegel/',
      'inhouse_website','https://www.inhouseventures.com.au/',
      'rocketreach','https://rocketreach.co/elliot-spiegel-email_17707390',
      'data_lead','https://data-lead.com/person/name/Elliot+Spiegel/id/84492367/v/028df',
      'startup_daily_angelclass','https://www.startupdaily.net/topic/venture-capital/how-to-angel-a-new-education-platform-is-teaching-early-stage-investors-about-backing-startups/',
      'business_news_au_acquisition','https://www.businessnewsaustralia.com/articles/startup-fundraising-marketplace-inhouse-ventures-acquired-by-asx-listed-scalare.html',
      'channellife_acquisition','https://channellife.com.au/story/scalare-partners-acquires-inhouse-ventures-for-aud-1-3m',
      'startup_daily_acquisition','https://www.startupdaily.net/topic/asx-listed-accelerator-scalare-partners-buys-vc-marketplace-inhouse-ventures-for-1-73-million/',
      'linkedin_post','https://www.linkedin.com/posts/elliotspiegel_we-started-inhouse-ventures-because-raising-activity-7330718273723912192-xXjY'
    ),
    'corrections','CSV portfolio "GoTradie, EdTripper" verified as personal angel investments. Inhouse Ventures added as his founder/operating company (with Scalare exit context). Cross-reference to record #47 (Chad Stephens — co-founder of Inhouse Ventures) flagged.'
  ),
  updated_at = now()
WHERE name = 'Elliot Spiegel';

UPDATE investors SET
  description = 'Melbourne-based VC analyst and angel investor. Currently in Venture Capital at Tenmile (Twiggy Forrest''s healthtech VC fund). Founder of "What The Health?!" — Australian healthtech community newsletter and network (~6,000+ members). AirTree Halo Effect alumna. Health/Bio/Web3 focus. First angel investment: Eucalyptus.',
  basic_info = 'Emily Casey is a Melbourne-based VC professional and angel investor with one of the most distinctive personal-brand-driven angel practices in the Australian healthtech ecosystem.

She works in Venture Capital at **Tenmile** — the Andrew "Twiggy" Forrest-backed healthtech VC fund — where she covers health-innovation deals. She is the founder of **What The Health?!** (whatthehealth.io), the Australian healthtech community she launched in February 2021 after dropping out of medical school in 2019. The community has grown to ~6,000+ founders, investors, clinicians and health operators, with a regular newsletter that covers Australian healthtech, biotech and emerging-tech intersections (including extensive coverage of Web3 and health).

She is an AirTree Halo Effect alumna (AirTree Ventures'' emerging-investor and operator pipeline). Her first angel investment was **Eucalyptus** — Australia''s largest D2C healthtech business — which she has cited as the deal that brought her into venture investing. Her CSV-listed sector focus is Health, Bio and Web3.

Her angel value-add is unusually distribution-led: she can amplify founder messaging to a 6,000+ healthtech community, which makes her cheque structurally different from a generalist Melbourne angel.',
  why_work_with_us = 'For Australian healthtech, biotech and Web3-health founders, Emily is one of the highest-leverage early-stage relationships available — combining (a) Tenmile institutional pathway visibility, (b) What The Health?! distribution to 6,000+ healthtech operators, clinicians and investors, (c) AirTree Halo Effect alumni network, and (d) thematic depth in Web3-health intersections.',
  sector_focus = ARRAY['HealthTech','MedTech','BioTech','Web3','Digital Health','D2C Health','Consumer Health'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.whatthehealth.io',
  linkedin_url = 'https://www.linkedin.com/in/emily-s-casey/',
  contact_email = 'emily@whatthehealth.io',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Eucalyptus (first angel investment)','What The Health?! (founder; ~6,000+ healthtech community)','Tenmile (VC analyst)','AirTree Halo Effect alumna'],
  meta_title = 'Emily Casey — What The Health?! / Tenmile | Melbourne HealthTech Angel',
  meta_description = 'Melbourne VC at Tenmile (Twiggy Forrest healthtech fund). Founder What The Health?! (~6,000+ community). AirTree Halo Effect. Health/Bio/Web3 focus.',
  details = jsonb_build_object(
    'founder_of', ARRAY['What The Health?! (founded Feb 2021)'],
    'current_roles', ARRAY[
      'Venture Capital, Tenmile (Andrew Forrest healthtech fund)',
      'Founder, What The Health?! (whatthehealth.io)',
      'AirTree Halo Effect alumna'
    ],
    'background','Dropped out of medical school in 2019 to build in healthtech — has since combined VC, community-building and angel investing.',
    'community_stats', jsonb_build_object(
      'name','What The Health?!',
      'launched','February 2021',
      'members','~6,000+',
      'membership','Founders, investors, clinicians, operators across Australian healthtech'
    ),
    'highlight_first_investment','Eucalyptus — Australia''s largest D2C healthtech business; Emily''s first angel cheque',
    'public_writing_focus', ARRAY['Australian healthtech founders','Web3 + health intersections','Healthcare innovation'],
    'investment_thesis','Healthtech, biotech and Web3-health Australian founders where her What The Health?! distribution and Tenmile institutional pathway add to the cheque.',
    'check_size_note','Undisclosed in CSV',
    'sources', jsonb_build_object(
      'website','https://www.whatthehealth.io',
      'about','https://www.whatthehealth.io/about',
      'web3_health_part1','https://www.whatthehealth.io/p/web3andhealthpart1',
      'web3_health_part2','https://www.whatthehealth.io/p/web3-and-health-part-2',
      'linkedin','https://www.linkedin.com/in/emily-s-casey/',
      'airtree_halo_effect','https://www.airtree.vc/open-source-vc/the-halo-effect-emily-casey',
      'smartcompany','https://www.smartcompany.com.au/health/what-the-health-emily-casey-community-healthtech/',
      'startmate_medium','https://medium.com/startmate/how-emily-casey-founder-her-why-and-used-a-specific-skill-set-to-launch-what-the-health-ded7e1d2e83c'
    ),
    'corrections','CSV portfolio empty — populated with verified Tenmile/Eucalyptus/What The Health/AirTree affiliations rather than fabricating individual portfolio companies. CSV LinkedIn URL verified.'
  ),
  updated_at = now()
WHERE name = 'Emily Casey';

COMMIT;
