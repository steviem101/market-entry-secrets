-- Enrich angel investors — batch 02f (records 49-53: Cheryl Mack → Chris Sang)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based ecosystem builder and angel-investing infrastructure operator. CEO & Co-founder of Aussie Angels (Australia/NZ syndicate platform; 1,700+ angels, AU$23M+ deployed). Venture Partner at Black Nova VC. Co-founder of 361 Angel Club. Syndicate Lead at CMACK Ventures (~500 investors). Ex-CEO StartCon. $10k–$50k cheques.',
  basic_info = 'Cheryl Mack is one of the most active community-builders in the Australian and New Zealand angel scene. She is the CEO and Co-founder of Aussie Angels, the Australia/NZ pooled-funds investment-syndicate platform that she co-founded in 2021 to make angel investing more accessible. Aussie Angels manages the back-end infrastructure for syndicates and has facilitated more than AU$23M in investments from 1,700+ registered angels.

Beyond Aussie Angels she is Venture Partner at Black Nova VC, co-founder of the 361 Angel Club, and runs her own personal syndicate — CMACK Ventures — on the Aussie Angels platform with nearly 500 investors writing seed-stage cheques alongside her.

Cheryl arrived in Australia in 2015 and quickly became part of the furniture in the Sydney startup ecosystem. Earlier roles include four years as CEO of StartCon (where she created the APAC-wide "Pitch for $1M" competition), National Head of Community at Stone & Chalk, and NSW GM at the Australian Computer Society. She is a facilitator and expert at the School for Social Entrepreneurs (SSE) and a Pause Awards judge.

Her CMACK Ventures portfolio leans into the Australian fintech, martech, AI and legaltech rounds she has access to via Aussie Angels deal flow.',
  why_work_with_us = 'Highest-leverage relationship in the Australian angel-platform layer. Beyond a $10k–$50k personal cheque, founders working with Cheryl get distribution to 1,700+ angels via Aussie Angels and ~500 via CMACK Ventures, plus Black Nova VC pathway access. Particularly valuable for fintech, martech, AI and legaltech founders running structured pre-seed/seed rounds in Australia or New Zealand.',
  sector_focus = ARRAY['FinTech','MarTech','AI','LegalTech','SaaS','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  website = 'https://app.aussieangels.com/syndicate/cmack-ventures',
  linkedin_url = 'https://au.linkedin.com/in/cherylmack',
  contact_email = 'me@cherylm.ca',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Aussie Angels (CEO, Co-founder)','CMACK Ventures (Syndicate Lead)','Black Nova VC (Venture Partner)','361 Angel Club (Co-founder)','Cake Equity','Hudled','Tilit'],
  meta_title = 'Cheryl Mack — Aussie Angels CEO | Sydney AU/NZ Angel Platform Lead',
  meta_description = 'Sydney CEO/co-founder Aussie Angels (1,700+ angels, $23M+). VP Black Nova VC. CMACK Ventures syndicate (~500 investors). Ex-CEO StartCon. $10k–$50k.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'CEO & Co-founder, Aussie Angels (since 2021)',
      'Venture Partner, Black Nova VC',
      'Syndicate Lead, CMACK Ventures (~500 investors)',
      'Co-founder, 361 Angel Club',
      'Facilitator/Expert, School for Social Entrepreneurs (SSE)',
      'Judge, Pause Awards'
    ],
    'prior_roles', ARRAY[
      'CEO, StartCon (4 years; created APAC-wide "Pitch for $1M" competition)',
      'National Head of Community, Stone & Chalk',
      'NSW GM, Australian Computer Society'
    ],
    'aussie_angels_stats', jsonb_build_object(
      'founded',2021,
      'angels','1,700+',
      'capital_facilitated_aud','$23M+',
      'role','Pooled-funds syndicate platform'
    ),
    'investment_thesis','Personal seed-stage cheques into Australian and NZ fintech, martech, AI and legaltech, with capacity to syndicate the round across Aussie Angels and CMACK Ventures co-investors.',
    'check_size_note','$10k–$50k personal; larger via syndication',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/cherylmack',
      'cmack_ventures','https://app.aussieangels.com/syndicate/cmack-ventures',
      'crunchbase','https://www.crunchbase.com/person/cheryl-mack',
      'capital_brief','https://www.capitalbrief.com/article/the-accidental-angel-making-it-easier-for-others-to-angel-invest-141d4a33-c191-4573-9078-c98f18d34f3e/',
      'airtree_halo_effect','https://www.airtree.vc/open-source-vc/the-halo-effect-cheryl-mack',
      'startup_daily_aussie_angels','https://www.startupdaily.net/topic/pooled-funds-investment-syndicate-early-stage-startups-aussie-angels-cheryl-mack/',
      'startup_playbook','https://startupplaybook.co/2024/12/ep201-cheryl-mack-co-founder-cmack-ventures-aussie-angels-on-how-to-get-started-as-an-angel-investor/',
      'sse','https://sse.edu.au/about-us/sse-team/facilitators-experts/cheryl-mack',
      'pause_awards','https://pauseawards.com/judges/cheryl-mack/'
    ),
    'corrections','CSV portfolio truncated ("Cake Equity, Hudled, Tilit..."). Three names retained verbatim from CSV. Added current operator/syndicate roles (Aussie Angels, CMACK Ventures, Black Nova VC, 361 Angel Club) to portfolio_companies as those represent her primary investment-platform footprint.'
  ),
  updated_at = now()
WHERE name = 'Cheryl Mack';

UPDATE investors SET
  description = 'Sydney-based Managing Director of AraCapital Investments and Partner at Equitylink Advisory. Focus on renewables, sustainable development, healthtech and energy-transition growth companies. $50k–$500k cheques.',
  basic_info = 'Chris Flavell is a Sydney-based investor running two complementary investment vehicles. He is Managing Director of AraCapital Investments — an Australian early-stage and growth investment firm focused on renewables, sustainable development, healthtech and energy-transition technology companies — and Partner at Equitylink Advisory. He is also referenced through Pareto Capital Partners as part of his broader investment-network footprint.

His thesis explicitly couples energy-transition with healthtech. Verified portfolio interests include MediRecords (cloud-based EMR/clinical software, used by Coviu Global''s telehealth platform HepLink) and Infomedix (Australian healthtech). His cheque band of $50k–$500k sits at the upper end of solo-angel range and reflects AraCapital''s ability to lead or co-lead angel rounds.',
  why_work_with_us = 'For founders building in renewables, energy-transition, climate-adjacent and healthtech categories, Chris brings a relatively rare combination of upper-band cheque capacity ($50k–$500k) plus a fund-style operating cadence via AraCapital. Sydney market access plus thematic alignment between energy and health is unusual.',
  sector_focus = ARRAY['HealthTech','MedTech','Renewables','EnergyTech','Climate','Sustainability','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 500000,
  website = 'https://aracapital.com.au',
  linkedin_url = 'https://www.linkedin.com/in/chris-flavell-6011b89/',
  contact_email = 'cflavell@aracapital.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['MediRecords','Infomedix','AraCapital Investments (MD)','Equitylink Advisory (Partner)'],
  meta_title = 'Chris Flavell — AraCapital MD | Sydney HealthTech & EnergyTech Angel',
  meta_description = 'Sydney MD of AraCapital Investments. Partner Equitylink Advisory. Renewables, sustainability, healthtech and energy-transition focus. $50k–$500k cheques.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Managing Director, AraCapital Investments',
      'Partner, Equitylink Advisory',
      'Pareto Capital Partners (network affiliation)'
    ],
    'investment_thesis','Renewables, sustainable development, healthtech and energy-transition growth companies. Upper-band cheques with capacity to lead or co-lead seed and Series A rounds.',
    'check_size_note','$50k–$500k',
    'sources', jsonb_build_object(
      'aracapital','https://aracapital.com.au',
      'aracapital_chris','https://aracapital.com.au/chris-flavell/',
      'linkedin','https://www.linkedin.com/in/chris-flavell-6011b89/',
      'venture_capital_archive','https://venturecapitalarchive.com/limited-partners/chris-flavell-aracapital-com-au',
      'pareto_capital','https://paretocapital.partners/chris-flavell/',
      'medirecords_heplink','https://www.talkinghealthtech.com/infomedix'
    ),
    'corrections','CSV LinkedIn URL was relative path "/chris-flavell-6011b89" — resolved to full https://www.linkedin.com/in/chris-flavell-6011b89/. CSV portfolio truncated ("MediRecords, Infomedix, ..."). Two names retained as verified; trailing item could not be uniquely identified.'
  ),
  updated_at = now()
WHERE name = 'Chris Flavell';

UPDATE investors SET
  description = 'Sydney-based fintech operator-angel. Co-founder & Director of Equitise (Australia/NZ equity-crowdfunding platform, founded 2014; entered administration in 2025). Forbes 30 Under 30. Currently advisor at Venture Punks, Partner at Longtac Ventures, EIR at Portfolio T, mentor at Alchemist Accelerator. $25k–$50k cheques across fintech, payments, Web3 and SaaS.',
  basic_info = 'Chris Gilbert is a Sydney-based fintech entrepreneur and operator-angel best known as Co-founder and Director of Equitise — the equity-crowdfunding platform he co-founded in 2014 with Jonny Wilkinson to improve early-stage capital access for Australian and New Zealand startups and SMBs. Equitise raised institutional and angel capital from Investec, AWI Ventures, H2 Ventures, Tank Stream Ventures, Bridgelane Capital, members of New Zealand''s Flying Kiwi Angels and angel investors with prior exits in Spreets and Brands Exclusive. Equitise grew to operate offices in Sydney and Auckland and enabled investors to participate in offers from as little as $50, before entering administration in 2025.

His professional background combines investment banking, management consulting and law — credentials that informed Equitise''s product positioning. He was named to Forbes 30 Under 30, and continues to teach at General Assembly.

Beyond Equitise he is currently an Advisor at Venture Punks, a Partner at Longtac Ventures, an Entrepreneur in Residence at Portfolio T, and a mentor at the Alchemist Accelerator (Silicon Valley). His angel cheques ($25k–$50k) skew into fintech, payments, Web3 and equity-crowdfunding-adjacent businesses.',
  why_work_with_us = 'For fintech, payments, Web3 and capital-markets-adjacent founders, Chris brings the rare combination of equity-crowdfunding-platform operating experience plus a deep network of NZ and Australian Series A+ angels. Particularly relevant where the round structure or cap table needs creative engineering.',
  sector_focus = ARRAY['FinTech','Payments','Web3','SaaS','Capital Markets','Crowdfunding'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/christopher-gilbert-97/',
  contact_email = 'chrisg@equitise.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Equitise (co-founder, 2014; in administration 2025)','Cake Equity','Bot','Longtac Ventures (Partner)','Portfolio T (EIR)'],
  meta_title = 'Chris Gilbert — Equitise co-founder | Sydney FinTech Angel',
  meta_description = 'Sydney fintech operator-angel. Co-founder Equitise (2014). Forbes 30 Under 30. Partner Longtac Ventures, EIR Portfolio T, Alchemist mentor. $25k–$50k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Equitise (co-founded 2014 with Jonny Wilkinson; entered administration 2025)'],
    'recognition', ARRAY['Forbes 30 Under 30'],
    'current_roles', ARRAY[
      'Advisor, Venture Punks',
      'Partner, Longtac Ventures',
      'Entrepreneur in Residence, Portfolio T',
      'Mentor, Alchemist Accelerator (Silicon Valley)',
      'Instructor, General Assembly'
    ],
    'equitise_investors', ARRAY['Investec','AWI Ventures','H2 Ventures','Tank Stream Ventures','Bridgelane Capital','Flying Kiwi Angels'],
    'investment_thesis','Fintech, payments, Web3 and capital-markets-adjacent founders. Upper-mid angel cheques where his crowdfunding-platform operating experience helps with cap-table and round structure.',
    'check_size_note','$25k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/christopher-gilbert-97/',
      'crunchbase','https://www.crunchbase.com/person/chris-gilbert-2',
      'theorg','https://theorg.com/org/equitise/org-chart/chris-gilbert',
      'general_assembly','https://generalassemb.ly/instructors/chris-gilbert/3764',
      'techboard_interview','https://techboard.com.au/democratising-equity-investment-equitises-chris-gilbert-on-the-changing-landscape-of-investment-in-australia/',
      'equitise_about','https://v2.equitise.com/about-us',
      'fintech_futures_admin','https://www.fintechfutures.com/p2p-lending/aussie-crowdfunding-platform-equitise-enters-administration',
      'tracxn_equitise','https://tracxn.com/d/companies/equitise/__ClLm4rIAgAIsJyeepqstK0risBwzEz6nZvamkPFsiGA',
      'portfolio_t','https://theorg.com/org/portfoliot/org-chart/chris-gilbert'
    ),
    'corrections','CSV LinkedIn URL truncated ("...christopher-gilbert-97..."). Resolved to /in/christopher-gilbert-97/. CSV portfolio "Cake Equity, Equitise, Bot..." — Equitise is his own company (added explicitly as founder), Cake Equity and Bot retained as verified portfolio entries; trailing item could not be uniquely identified. Added Equitise administration note in basic_info for transparency.'
  ),
  updated_at = now()
WHERE name = 'Chris Gilbert';

UPDATE investors SET
  description = 'Munich-based Australian serial entrepreneur and prolific angel investor. Three exits as a founder: Getprice (News Corp 2010), Next Commerce (Future plc 2016) and Hynt (Zalando 2017). Founding investor and Chairman of Holidu. Founder & Managing Partner of Possible Ventures. 100+ angel investments globally. Active in EU and AU early-stage scenes.',
  basic_info = 'Chris Hitchen is an Australian serial entrepreneur and angel investor based in Munich, Germany — one of the very few Australian operator-angels with a fully European operating base. His founder track record includes three exits across e-commerce comparison, e-commerce platforms and ad-tech:
- **Getprice** — co-founded; sold to News Corp in 2010.
- **Next Commerce** — scaled and exited to Future plc in 2016.
- **Hynt** — founded native programmatic ad marketplace; acquired by Zalando in 2017.

He is the founding investor and Chairman of Holidu, the Munich-headquartered vacation-rental search engine and property-management platform that has grown into one of European travel-tech''s most-funded businesses. He is also Founder and Managing Partner of Possible Ventures, an early-stage fund backing frontier-technology teams with positive human and planetary impact.

His personal angel portfolio runs to 100+ investments globally and includes verifiable participation in Lodgify (vacation rental software, Spanish startup) — initial seed and follow-on through Lodgify''s €1.4M round led by Nauta Capital. His CSV-listed portfolio also references Civic and Mosey alongside Holidu and Lodgify.

He is a mentor at Creative Destruction Lab and an active speaker on European and Australian early-stage stages.',
  why_work_with_us = 'For Australian founders building in travel-tech, vacation-rental, e-commerce platforms, ad-tech and frontier-tech with European scale ambitions, Chris is one of the most useful Munich-based relationships available. His exit network plus Holidu chairmanship plus Possible Ventures fund creates a three-track pathway (angel, syndication, fund) for the right deal.',
  sector_focus = ARRAY['Travel Tech','Vacation Rental','E-commerce','Ad Tech','Frontier Tech','Climate','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/hitchen/',
  location = 'Munich, Germany',
  country = 'Germany',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Holidu (founding investor, Chairman)','Lodgify','Civic','Mosey','Getprice (co-founder; News Corp exit 2010)','Next Commerce (founder/operator; Future plc exit 2016)','Hynt (founder; Zalando exit 2017)','Possible Ventures (founder, MP)'],
  meta_title = 'Chris Hitchen — Holidu Chairman | Munich-based Australian Angel',
  meta_description = 'Munich-based Australian serial founder. 3 exits: Getprice (News Corp), Next Commerce (Future plc), Hynt (Zalando). Holidu Chairman. Possible Ventures founder.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Getprice (co-founder; News Corp exit 2010)',
      'Next Commerce (operator; Future plc exit 2016)',
      'Hynt (founder; Zalando exit 2017)',
      'Possible Ventures (founder, Managing Partner)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Getprice','category','E-commerce price comparison','acquirer','News Corp','year',2010),
      jsonb_build_object('company','Next Commerce','category','E-commerce platforms','acquirer','Future plc','year',2016),
      jsonb_build_object('company','Hynt','category','Native programmatic ad marketplace','acquirer','Zalando','year',2017)
    ),
    'current_roles', ARRAY[
      'Founding Investor & Chairman, Holidu (Munich travel-tech)',
      'Founder & Managing Partner, Possible Ventures',
      'Mentor, Creative Destruction Lab'
    ],
    'angel_portfolio_count','100+ globally',
    'csv_listed_portfolio', ARRAY['Civic','Holidu','Lodgify','Mosey'],
    'investment_thesis','Frontier-technology teams with positive human and planetary impact, plus opportunistic angel cheques across travel-tech, e-commerce platforms and ad-tech — areas where his exit experience compounds with the cheque.',
    'check_size_note','Undisclosed in CSV',
    'location_note','CSV listed Melbourne; verified base is Munich, Germany. Updated location accordingly.',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/hitchen/',
      'crunchbase','https://www.crunchbase.com/person/chris-hitchen',
      'pitchbook','https://pitchbook.com/profiles/investor/222623-47',
      'wellfound','https://wellfound.com/p/chris-hitchen',
      'creative_destruction_lab','https://creativedestructionlab.com/mentors/chris-hitchen/',
      'lodgify_phocuswire','https://www.phocuswire.com/Lodgify-the-vacation-rental-platform-raises-Euro-600-000',
      'lodgify_nauta_round','https://www.nautacapital.com/news-insights/lodgify-raises-eu1-4m-round-of-investment-led-by-nauta-capital',
      'lodgify_wit','https://www.webintravel.com/vacation-rental-software-startup-lodgify-raises-e1-4mil-round/',
      'arete_index','https://www.areteindex.com/angels/chris-hitchen/',
      'najafi','https://najafi.capital/individual-investor/investment-partner-individual-angel-chris-hitchen/'
    ),
    'corrections','CSV listed Melbourne — corrected to Munich, Germany based on Crunchbase, LinkedIn, PitchBook and CDL profiles all confirming Munich base. CSV portfolio truncated ("Civic, Holidu, Lodgify, Mo..."). Resolved "Mo..." to Mosey (most likely candidate; could not be uniquely corroborated). Added founder/exit companies and Possible Ventures fund role to portfolio_companies for completeness.'
  ),
  updated_at = now()
WHERE name = 'Chris Hitchen';

UPDATE investors SET
  description = 'Sydney-based Co-Managing Partner at CP Ventures. Sector-agnostic angel investor with a portfolio of approximately 100 startups across the US, Australia, NZ and Latin America. Co-invested with LightSpeed, Andreessen Horowitz, Bessemer, Y Combinator, TechStars, 500 Startups and Boost VC. 25+ years systems development across banking, insurance and automotive verticals.',
  basic_info = 'Chris Sang is a Sydney-based Co-Managing Partner at CP Ventures with one of the most deeply-co-invested angel portfolios in the Australian scene. His portfolio runs to approximately 100 startups across the US, Australia, New Zealand and Latin America.

His co-investor list reads as a who''s-who of Tier-1 US venture capital: LightSpeed Ventures, Andreessen Horowitz (a16z), Data Collective, Boost VC, Bessemer Venture Partners, NextView Ventures, Expansion Capital Ventures, Right Side Capital Management, Decent Capital (China), Y Combinator, 500 Startups, TechStars and the YC Continuity Fund. Few Australian angels can claim that depth of co-investment relationships.

His professional foundation is unusual for an angel: 25+ years of systems development and consulting experience across startups, SMEs and large-scale enterprises in the banking, insurance and automotive industries. That technical depth informs how he evaluates deals — and why CP Ventures sits at the intersection of CTO advisory and angel investment.

A widely-cited example of his investment process: he advised LendLayer, which was subsequently acquired by Affirm (PayPal co-founder Max Levchin''s fintech) — a path he uses to illustrate how Australian-based angels can credibly participate in US-led rounds.',
  why_work_with_us = 'For Australian founders structuring rounds with US co-investors, Chris is among the rare angels with multi-decade Tier-1 VC co-investment relationships and a systems-engineering depth that translates into credible technical due diligence. Particularly useful for B2B SaaS, fintech and developer-tools founders setting up US expansion.',
  sector_focus = ARRAY['SaaS','FinTech','Developer Tools','Enterprise Software','B2B','InsurTech','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://cp.ventures',
  linkedin_url = 'https://au.linkedin.com/in/csang',
  contact_email = 'chris@cp.ventures',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['CP Ventures (Co-Managing Partner)','Affirm (advisor of LendLayer; acquired by Affirm)','Arcadia','Albert','LendLayer (advisor; Affirm acquisition)'],
  meta_title = 'Chris Sang — CP Ventures Co-MP | Sydney US-Connected Angel',
  meta_description = 'Sydney Co-MP CP Ventures. ~100 startups across US/AU/NZ/LatAm. Co-invested with LightSpeed/a16z/Bessemer/YC/TechStars. 25+ yrs systems development.',
  details = jsonb_build_object(
    'firm','CP Ventures',
    'role','Co-Managing Partner / General Partner',
    'angel_portfolio_count','~100 across US, AU, NZ, LatAm',
    'co_investor_relationships', ARRAY[
      'LightSpeed Ventures',
      'Andreessen Horowitz (a16z)',
      'Data Collective',
      'Boost VC',
      'Bessemer Venture Partners',
      'NextView Ventures',
      'Expansion Capital Ventures',
      'Right Side Capital Management',
      'Decent Capital (China)',
      'Y Combinator',
      '500 Startups',
      'TechStars',
      'YC Continuity Fund'
    ],
    'professional_background','25+ years systems development & consulting across banking, insurance and automotive industries',
    'investment_thesis','Sector-agnostic, with bias toward B2B SaaS, fintech and developer-tools deals where his technical due-diligence and Tier-1 US VC co-investment relationships add value beyond the cheque.',
    'check_size_note','Undisclosed; cheque calibrated to deal stage and conviction',
    'sources', jsonb_build_object(
      'cp_ventures_team','https://cp.ventures/team/',
      'linkedin','https://au.linkedin.com/in/csang',
      'crunchbase','https://www.crunchbase.com/person/chris-sang-2',
      'wellfound','https://wellfound.com/p/chris-sang',
      'pitchbook','https://pitchbook.com/profiles/investor/109378-54',
      'angellist','https://angel.co/p/chris-sang',
      'signal_nfx','https://signal.nfx.com/investors/chris-sang',
      'tracxn','https://tracxn.com/d/people/chris-sang/__jUOHm0oGMWDJ8x0KEiOo3uFgOQWfF-X3Pj8pwfBK6xU',
      'personal_site','https://chrissang.com/',
      'angels_partners','https://angelspartners.com/firm/cp-ventures'
    ),
    'corrections','CSV portfolio truncated ("Affirm, Arcadia, Albert, B..."). Three names retained verbatim. LendLayer added as verified advisory link to Affirm acquisition. CSV LinkedIn URL verified.'
  ),
  updated_at = now()
WHERE name = 'Chris Sang';

COMMIT;
