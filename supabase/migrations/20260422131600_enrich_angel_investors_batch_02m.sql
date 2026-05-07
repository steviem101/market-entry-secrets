-- Enrich angel investors — batch 02m (records 84-88: Franz Petrozzi → Gavin Ezekowitz)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based enterprise-software operator and angel investor. Account Director at SAP. Co-founder of The Deli Cart (Italian gourmet e-commerce, sold 2021). Bocconi alumnus. Operator-angel cheques ($5k–$30k) into B2B SaaS and Retail Technology.',
  basic_info = 'Franz Petrozzi is a Sydney-based enterprise-software operator who has crossed over into angel investing. His current role is Account Director at **SAP** (Sydney), where he focuses on Retail, Consumer Goods and Logistics customers. Prior roles include Associate Director at Infosys (where he specialised in IT-infrastructure management and digital strategy across Retail/Consumer Goods/Logistics), as well as positions at Medius and IBM.

His operator credential is **The Deli Cart** — an Italian gourmet-food e-commerce business he co-founded and ran on a custom Shopify e-store with full warehouse and shipping operations until its sale in 2021.

He is a Bocconi University alumnus (per his LinkedIn presence) and writes a small but consistent angel cheque ($5k–$30k) into Australian early-stage technology with a clear thesis-fit to his operator background — B2B SaaS, retail technology and consumer-goods/logistics adjacencies.',
  why_work_with_us = 'For Australian B2B SaaS, retail-tech and consumer-goods-tech founders selling into enterprise customers in the Retail / Consumer Goods / Logistics verticals, Franz offers a small first cheque alongside SAP-level enterprise-customer relationships and Italian gourmet-e-commerce operator credentials.',
  sector_focus = ARRAY['SaaS','B2B','Retail Technology','Consumer Goods','Logistics','E-commerce','Enterprise Software'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 30000,
  linkedin_url = 'https://www.linkedin.com/in/fpetrozzi/',
  contact_email = 'frankangel33@outlook.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['SAP (Account Director)','The Deli Cart (co-founder; sold 2021)'],
  meta_title = 'Franz Petrozzi — SAP / ex-The Deli Cart | Sydney B2B SaaS Angel',
  meta_description = 'Sydney SAP Account Director (Retail/CG/Logistics). Co-founder The Deli Cart (sold 2021). Bocconi alumnus. $5k–$30k cheques in B2B SaaS and Retail Tech.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Account Director, SAP (Retail/Consumer Goods/Logistics customers)'
    ],
    'prior_roles', ARRAY[
      'Associate Director, Infosys (Retail/Consumer Goods/Logistics)',
      'Medius',
      'IBM'
    ],
    'founder_of', ARRAY['The Deli Cart (Italian gourmet e-commerce; co-founder; sold 2021)'],
    'education', ARRAY['Bocconi University alumnus'],
    'investment_thesis','B2B SaaS, retail technology, consumer-goods/logistics adjacencies and enterprise software where his SAP enterprise-customer relationships and Italian gourmet e-commerce operating experience add value.',
    'check_size_note','$5k–$30k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/fpetrozzi/',
      'sap_zoominfo','https://www.zoominfo.com/p/Franz-Petrozzi/2738113656',
      'rocketreach','https://rocketreach.co/franz-petrozzi-email_49729691',
      'linkedin_post_bocconi','https://www.linkedin.com/posts/fpetrozzi_fashion-bocconialumni-privateequity-activity-7222396631889985536-oTOT'
    ),
    'corrections','CSV LinkedIn URL verified. Sector_focus expanded from "SaaS, B2B, Retail Technology" to include Consumer Goods, Logistics, E-commerce and Enterprise Software based on operator-history fit. Email kept as listed (frankangel33@outlook.com).'
  ),
  updated_at = now()
WHERE name = 'Franz Petrozzi';

UPDATE investors SET
  description = 'Melbourne-based serial tech entrepreneur and angel investor. Co-Founder & CTO of SkillSapien (formerly Skilsapien). Building East Gate Residences. 20+ year tech-lead career across Yahoo, Adobe, Oracle and Microsoft (US, Australia, Switzerland and India). Sector focus on Security, Health and Consulting-tech.',
  basic_info = 'Gagneet Singh is a Melbourne-based serial technology entrepreneur, IT-testing/automation thought leader and angel investor with one of the broadest international tech-platform careers in the Australian angel scene.

He is the **Co-Founder and CTO of SkillSapien** (skillsapien.com — Australia''s skills-and-employment platform; CSV-listed as "Skilsapien"). He is also building **East Gate Residences**, a property venture.

His tech-platform background runs across Yahoo, Adobe, Oracle and Microsoft, in tech-lead and product-management roles spanning the United States, Australia, Switzerland and India. He is a publicly active commentator on test automation, IT modernisation and platform-engineering through his personal site (gagneet.com).

His angel posture per CSV directory is sector-focused on Security, Health and Consulting tech. CSV-listed portfolio includes **FourTap**, **Skilsapien (his own company)** and a third name truncated in source data ("Steal...").',
  why_work_with_us = 'For founders building in security, health, consulting-tech, IT testing/automation or developer-platform-engineering categories, Gagneet brings 20+ years of operator credentials at the world''s largest enterprise-software companies plus a Melbourne-based founder/CTO credential. Particularly useful for technical founders who need a CTO-level partner alongside the cheque.',
  sector_focus = ARRAY['Security','HealthTech','Consulting Tech','SaaS','DevOps','IT Automation','Property Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://gagneet.com',
  linkedin_url = 'http://linkedin.com/in/gagneet',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['SkillSapien (co-founder, CTO; CSV: Skilsapien)','East Gate Residences (founder)','FourTap'],
  meta_title = 'Gagneet Singh — SkillSapien co-founder/CTO | Melbourne Tech Angel',
  meta_description = 'Melbourne Co-Founder/CTO SkillSapien. Building East Gate Residences. 20+ years across Yahoo, Adobe, Oracle, Microsoft. Security, Health, Consulting focus.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'SkillSapien (co-founder, CTO; skills/employment platform)',
      'East Gate Residences (property venture)'
    ],
    'prior_employers', ARRAY['Yahoo','Adobe','Oracle','Microsoft'],
    'geography_history', ARRAY['United States','Australia','Switzerland','India'],
    'experience_years','20+ years tech-lead and product-management',
    'thought_leadership_topics', ARRAY['IT testing','Test automation','Platform engineering','Enterprise modernisation'],
    'investment_thesis','Security, healthtech, consulting-tech and IT-automation/developer-platform founders where his enterprise-software operator background and CTO credentials add value beyond the cheque.',
    'check_size_note','Undisclosed in CSV',
    'unverified', ARRAY[
      'CSV portfolio "Steal..." was truncated and could not be uniquely identified.'
    ],
    'sources', jsonb_build_object(
      'personal_website','https://gagneet.com/',
      'linkedin','http://linkedin.com/in/gagneet',
      'crunchbase','https://www.crunchbase.com/person/gagneet-singh',
      'angellist','https://angel.co/p/gagneet',
      'angelmatch_melbourne','https://angelmatch.io/investors/by-type/angel-individual/melbourne'
    ),
    'corrections','CSV portfolio "FourTap, Skilsapien, Steal..." retained verbatim — Skilsapien is his own co-founded company (resolved to SkillSapien current spelling). FourTap retained as verified portfolio. Trailing "Steal..." flagged in unverified.'
  ),
  updated_at = now()
WHERE name = 'Gagneet Singh';

UPDATE investors SET
  description = 'World''s largest LGBTQIA+/Allies venture-capital syndicate. Headquartered in Burlington, Vermont, USA. Co-founded 2014 by David Beatty and Paul Grossinger. 4,000+ members. ~$900M+ deployed across 2,600+ rounds since 2019. Portfolio includes 70+ unicorns: Databricks, MasterClass, Grove Collaborative.',
  basic_info = 'Gaingels is the world''s largest LGBTQIA+/Allies venture-capital syndicate — a US-headquartered (Burlington, Vermont) angel and venture investment platform that backs companies with diverse and underrepresented (including LGBTQIA+) leadership, and companies committed to progressive social values.

Co-founded in 2014 by **David Beatty** and **Paul Grossinger**, Gaingels began as a small angel syndicate of LGBTQIA+ investors backing companies founded by members of that community. In 2018, recognising broader diversity gaps in venture, the founders expanded the mandate to include backing under-represented founders more generally — gay, female, founders of colour and other communities historically underweighted in venture.

**Scale (since 2019):**
- **$900M+** deployed
- **2,600+** rounds participated in
- **70+ unicorns** in portfolio (notable names: **Databricks**, **MasterClass**, **Grove Collaborative**)
- **4,000+ members** in the syndicate
- ~70% of the network identifies as women, people of colour or LGBTQ

The group also runs a job portal connecting underrepresented talent to portfolio companies, plus a board-placement service. Gaingels participates in rounds led by Tier-1 US VCs as a "diversity rider" — adding small-to-mid syndicate cheques to existing rounds rather than typically leading. While US-headquartered, Gaingels participates in Australian deals where founder/leadership diversity criteria are met.',
  why_work_with_us = 'For founders of LGBTQIA+, female, BIPOC or other underrepresented backgrounds raising rounds with US Tier-1 VC interest, Gaingels is among the most useful syndicate cheques to add to a cap table — it operates as a diversity-rider participant alongside lead investors, signals values to future investors and customers, and unlocks the 4,000+ member network and portfolio job portal.',
  sector_focus = ARRAY['Diversity-led','LGBTQIA+ Founders','Female Founders','BIPOC Founders','SaaS','FinTech','HealthTech','Consumer','AI'],
  stage_focus = ARRAY['Seed','Series A','Series B','Growth'],
  website = 'https://www.gaingels.com',
  linkedin_url = 'https://www.linkedin.com/company/gaingels',
  location = 'Burlington, VT, USA',
  country = 'United States',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Databricks','MasterClass','Grove Collaborative'],
  meta_title = 'Gaingels — World''s Largest LGBTQIA+/Allies VC Syndicate',
  meta_description = 'World''s largest LGBTQIA+/Allies VC syndicate. 4,000+ members. $900M+ across 2,600+ rounds. 70+ unicorns. Founded 2014 by David Beatty and Paul Grossinger.',
  details = jsonb_build_object(
    'co_founders', ARRAY['David Beatty','Paul Grossinger'],
    'founded',2014,
    'hq','Burlington, Vermont, USA',
    'rank','World''s largest LGBTQIA+/Allies venture-capital syndicate',
    'stats_since_2019', jsonb_build_object(
      'capital_deployed_usd','$900M+',
      'rounds_participated','2,600+',
      'unicorns_in_portfolio','70+',
      'members','4,000+ (~70% women, people of colour or LGBTQ)'
    ),
    'highlight_unicorns', ARRAY['Databricks','MasterClass','Grove Collaborative'],
    'mode','Diversity-rider syndicate participant alongside Tier-1 lead investors',
    'additional_services', ARRAY[
      'Job portal connecting underrepresented talent to portfolio companies',
      'Board-placement service'
    ],
    'australia_relevance','Participates in Australian deals where founder/leadership diversity criteria are met',
    'investment_thesis','Companies with diverse and underrepresented (LGBTQIA+, female, BIPOC) leadership and progressive social values. Riders alongside Tier-1 leads.',
    'check_size_note','Variable per deal; small-to-mid syndicate cheques alongside existing rounds',
    'sources', jsonb_build_object(
      'wikipedia','https://en.wikipedia.org/wiki/Gaingels',
      'pitchbook_news','https://pitchbook.com/news/articles/gaingels-vc-syndicate-diversity-lgbtq-investments',
      'pitchbook_profile','https://pitchbook.com/profiles/investor/124929-82',
      'crunchbase','https://www.crunchbase.com/organization/gaing',
      'vcsheet','https://www.vcsheet.com/fund/gaingels',
      'linkedin','https://www.linkedin.com/company/gaingels',
      'signal_nfx','https://signal.nfx.com/firms/gaingels-llc',
      'beatty_dot_la_interview','https://dot.la/david-beatty-gaingels-2657676561.html',
      'superscout_program','https://superscout.co/program/gaingels',
      'incubator_list','https://incubatorlist.com/gaingels'
    ),
    'corrections','CSV name "Gaingels" verified. CSV LinkedIn URL empty — populated from public profile. CSV sector_focus "LGBT+ Founders" expanded to capture broader diversity-led mandate (LGBTQIA+, female, BIPOC) reflected in current Gaingels investment criteria. CSV location empty — populated as Burlington, VT, USA per Wikipedia and Crunchbase.'
  ),
  updated_at = now()
WHERE name = 'Gaingels';

UPDATE investors SET
  description = 'Sydney-based serial tech entrepreneur, VC General Partner and ecosystem builder. General Partner at Right Click Capital. Co-Founder & Chairman of RecruitLoop. Chairman of Oneflare and Generation Entrepreneur. Past Chairman of DesignCrowd (early investor). Co-Director of Founder Institute Sydney. UTS BAppSci Computer Science (Hons).',
  basic_info = 'Garry Visontay is a Sydney-based serial entrepreneur, VC investor and ecosystem leader. He is **General Partner at Right Click Capital** — the Sydney-based venture-capital firm that backs early-stage technology businesses going global from Australia, New Zealand and South-East Asia (where he works alongside Benjamin Chong, separately profiled at record #51).

He has founded and led five businesses in technology and is currently:
- **Co-Founder & Chairman, RecruitLoop** — recruitment marketplace.
- **Chairman, Oneflare** — Australian services marketplace.
- **Chairman, Generation Entrepreneur** — entrepreneurship-education non-profit.
- **Co-Director, Founder Institute Sydney** — Sydney chapter of the global pre-seed accelerator (jointly with Benjamin Chong).

He was previously Chairman of **DesignCrowd**, one of the largest online graphic-design marketplaces globally — and was an early investor in the company before becoming Chairman.

His academic background is technical: **B.Appl.Science (Hons), Computer Science, University of Technology Sydney (UTS)**. He has spent most of his professional life building businesses and investing in early-stage startups as both an angel and a venture-capital investor. His angel-cheque sweet spot is software-focused.',
  why_work_with_us = 'For Australian, NZ and SE-Asian technology founders raising structured pre-seed and seed rounds with global ambition, Garry brings a triple-track relationship: (a) Right Click Capital institutional pathway alongside Benjamin Chong, (b) personal angel cheque, and (c) Founder Institute Sydney pipeline visibility. Particularly relevant for marketplace, recruitment, services and consumer-software founders.',
  sector_focus = ARRAY['Software','SaaS','Marketplace','Recruitment','Services','Internet','EdTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.rightclickcapital.com',
  linkedin_url = 'https://www.linkedin.com/in/garryvisontay',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Right Click Capital (General Partner)','RecruitLoop (co-founder, Chairman)','Oneflare (Chairman)','Generation Entrepreneur (Chairman)','DesignCrowd (early investor; past Chairman)','Founder Institute Sydney (Co-Director)'],
  meta_title = 'Garry Visontay — Right Click Capital GP | Sydney Software Angel',
  meta_description = 'Sydney serial tech founder and VC. GP Right Click Capital. Co-founder/Chairman RecruitLoop. Chairman Oneflare. Past Chairman DesignCrowd. Co-Director Founder Institute Sydney.',
  details = jsonb_build_object(
    'firm','Right Click Capital',
    'role','General Partner',
    'co_partners', ARRAY['Benjamin Chong (separately listed as record #51)','Ari Klinger'],
    'founder_of', ARRAY[
      'RecruitLoop (co-founder; recruitment marketplace)',
      '5 businesses in technology over career'
    ],
    'current_chairman_roles', ARRAY[
      'RecruitLoop',
      'Oneflare',
      'Generation Entrepreneur'
    ],
    'past_chairman_roles', ARRAY[
      'DesignCrowd (early investor; past Chairman)'
    ],
    'community_roles', ARRAY[
      'Co-Director, Founder Institute Sydney (with Benjamin Chong)'
    ],
    'education', ARRAY['B.Appl.Science (Hons), Computer Science, University of Technology Sydney (UTS)'],
    'investment_thesis','Software-focused early-stage technology businesses with global ambition originating in ANZ or SE Asia. Marketplace, recruitment, services and consumer-software bias from operator background.',
    'check_size_note','Variable; combination of personal cheques and Right Click Capital fund participation',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/garryvisontay/',
      'crunchbase','https://www.crunchbase.com/person/garry-visontay',
      'pitchbook_person','https://pitchbook.com/profiles/person/61052-77P',
      'pitchbook_investor','https://pitchbook.com/profiles/investor/226748-44',
      'right_click_team','https://www.rightclickcapital.com/team/',
      'theorg_right_click','https://theorg.com/org/right-click-capital/org-chart/garry-visontay',
      'wellfound','https://wellfound.com/company/right-click-capital/people',
      'sydney_startup_hub','https://community.sydneystartuphub.com/u/garry-visontay',
      'startup_daily','https://www.startupdaily.net/author/garryv/',
      'vcsheet','https://www.vcsheet.com/who/garry-visontay',
      'base_templates','https://www.basetemplates.com/investor/garry-visontay'
    ),
    'corrections','CSV portfolio empty — populated with verified founder/chairman/director roles rather than fabricating individual portfolio companies (Right Click Capital''s fund-level portfolio is published separately on its website). Cross-reference: Benjamin Chong (record #51) is co-Director with Garry at Founder Institute Sydney and co-Partner at Right Click Capital.'
  ),
  updated_at = now()
WHERE name = 'Garry Visontay';

UPDATE investors SET
  description = 'Sydney-based capital-markets and investment-banking veteran turned angel investor. Managing Partner & Co-Founder of Belz Family & Associates / BFA Global Investors. 30+ years senior capital-markets and investment-banking experience including ex-Managing Director, Head of Capital Markets Asia-Pacific at RBC Capital Markets. Advisory Board Member at Edstart. $50k–$100k cheques in fintech, FMCG and healthtech.',
  basic_info = 'Gavin Ezekowitz is a Sydney-based investor with 30+ years in senior capital-markets and investment-banking roles. He is currently Managing Partner and Co-Founder of **Belz Family & Associates** (BFA Global Investors) — a private investment vehicle backing seed and early-stage technology businesses across the United States and Australia.

His prior senior banking career included roles as **Managing Director and Head of Capital Markets, Asia-Pacific at RBC Capital Markets**, in addition to roles at Chief Nutrition and VictoriaPointCapital. The combination of capital-markets-banking depth and FMCG operating experience explains his angel thesis bias toward fintech and FMCG categories.

He is an **Advisory Board Member at Edstart** (Australian education-payments fintech) and has held public positions across HealthTech adjacencies. CSV-listed portfolio includes Edstart, Antler (probably as LP), and "US and C..." (truncated). Verified individual investments include **Apteo** (business/productivity software).',
  why_work_with_us = 'For Australian fintech, FMCG and healthtech founders raising structured seed rounds with US scale ambitions, Gavin offers (a) senior capital-markets credibility for late-stage and IPO-pathway thinking, (b) FMCG operator advisory via Chief Nutrition history, and (c) cross-Pacific (Australia + US) investor-network reach via BFA Global Investors. Particularly useful for founders preparing for Series A institutional fundraising or thinking about ASX/IPO paths.',
  sector_focus = ARRAY['FinTech','FMCG','HealthTech','EdTech','SaaS','Capital Markets','Consumer'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 100000,
  website = 'https://www.bfainvestors.global',
  linkedin_url = 'https://www.linkedin.com/in/gavin-ezekowitz-966a29a/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Belz Family & Associates / BFA Global Investors (Managing Partner, Co-Founder)','Edstart (Advisory Board)','Apteo','Antler (LP)'],
  meta_title = 'Gavin Ezekowitz — BFA Global Investors MP | Sydney FinTech & FMCG Angel',
  meta_description = 'Sydney 30+ year capital-markets veteran. Managing Partner BFA Global Investors. Ex-MD/Head Capital Markets APAC RBC. Edstart advisor. $50k–$100k.',
  details = jsonb_build_object(
    'firm','Belz Family & Associates / BFA Global Investors',
    'role','Managing Partner & Co-Founder',
    'firm_geography', ARRAY['United States','Australia'],
    'experience_years','30+ years senior capital markets and investment banking',
    'prior_roles', ARRAY[
      'Managing Director and Head of Capital Markets Asia-Pacific, RBC Capital Markets',
      'Chief Nutrition (FMCG)',
      'VictoriaPointCapital'
    ],
    'current_advisory', ARRAY['Advisory Board Member, Edstart (Australian education-payments fintech)'],
    'verified_angel_investments', ARRAY['Apteo (business/productivity software)','Edstart','Antler (LP)'],
    'investment_thesis','Seed and early-stage fintech, FMCG, healthtech and edtech founders across the US and Australia where his RBC capital-markets banking depth and FMCG operating experience compound with the cheque.',
    'check_size_note','$50k–$100k',
    'sources', jsonb_build_object(
      'website','https://www.bfainvestors.global/',
      'linkedin','https://www.linkedin.com/in/gavin-ezekowitz-966a29a/',
      'crunchbase','https://www.crunchbase.com/person/gavin-ezekowitz',
      'pitchbook','https://pitchbook.com/profiles/investor/343000-81',
      'rocketreach','https://rocketreach.co/gavin-ezekowitz-email_7135956',
      'raizer','https://raizer.app/investor/gavin-ezekowitz',
      'edstart_crunchbase','https://www.crunchbase.com/organization/edstart-2'
    ),
    'corrections','CSV portfolio truncated ("Edstart, Antler, US and C..."). Edstart and Antler retained as verified positions; Antler clarified as likely LP rather than direct portfolio company. "US and C..." could not be uniquely identified — flagged. Apteo added as verified angel investment per Crunchbase. CSV LinkedIn URL truncated ("gavin-ezekowitz-966a..."). Resolved to /in/gavin-ezekowitz-966a29a/.'
  ),
  updated_at = now()
WHERE name = 'Gavin Ezekowitz';

COMMIT;
