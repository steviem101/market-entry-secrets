-- Enrich angel investors — batch 02d (records 39-43: Brendan Hill → Brisbane Angels)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based exited e-commerce founder turned full-time angel investor and venture partner. Venture Partner at TEN13. Syndicate Lead at Logan and Wayne. Active AngelList syndicate. UNSW Founders Program mentor. Big-cheque angel — $350k–$1M ticket sizes.',
  basic_info = 'Brendan Hill is a Sydney-based angel investor who reverse-engineered his way into venture from operating. He built and exited a sports-memorabilia e-commerce business in 2016, and has spent the years since deploying capital and time into Australian early-stage technology.

He is currently Venture Partner at TEN13 (Steve Baxter''s syndicate-VC platform), Syndicate Lead at Logan and Wayne (a syndicate vehicle investing in early-stage tech), and runs his own active AngelList syndicate. He also mentors at the UNSW Founders Program and contributes to ecosystem-building via the Sydney Startup Hub community.

His angel portfolio includes some of Australia''s most-talked-about early-stage names — Everlab (preventative health, Melbourne), Instant (employment/payments), Heidi Health (clinical AI scribe) and a small allocation into SpaceX. His ticket band of $350k–$1M sits at the top of the Australian angel range and reflects his exit-funded balance sheet plus syndicated co-investment vehicles.',
  why_work_with_us = 'For Australian founders raising $750k–$2M pre-seed/seed rounds, Brendan is a rare angel who can lead and pull syndicate capital alongside his own cheque. Particularly relevant for healthtech, future-of-work, employment/payments and ambitious deeptech founders who want venture-style support at angel speed.',
  sector_focus = ARRAY['HealthTech','Future of Work','Employment Tech','SaaS','DeepTech','Consumer','Space'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 350000,
  check_size_max = 1000000,
  linkedin_url = 'https://au.linkedin.com/in/itsbrendanhill',
  contact_email = 'brendan@loganwayne.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Everlab','Instant','Heidi Health','SpaceX','GROW Inc.','Logan and Wayne (Syndicate Lead)','TEN13 (Venture Partner)'],
  meta_title = 'Brendan Hill — TEN13 / Logan and Wayne | Sydney Big-Cheque Angel',
  meta_description = 'Sydney exited e-commerce founder turned angel. Venture Partner TEN13, Syndicate Lead Logan and Wayne. Portfolio: Everlab, Instant, Heidi Health. $350k–$1M.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Venture Partner, TEN13',
      'Syndicate Lead, Logan and Wayne',
      'Mentor, UNSW Founders Program',
      'AngelList Syndicate Lead'
    ],
    'prior_roles', ARRAY[
      'Founder, sports-memorabilia e-commerce business (exited 2016)'
    ],
    'angellist_syndicate','https://venture.angellist.com/brendan-hill/syndicate',
    'investment_thesis','Australian early-stage technology with venture-scale ambition. Lead rounds where possible; syndicate co-investment from network. Particularly active in healthtech, future-of-work and ambitious deeptech.',
    'check_size_note','$350k–$1M (top of Australian angel band)',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/itsbrendanhill',
      'unsw_founders','https://www.founders.unsw.edu.au/brendan-hill',
      'angellist_syndicate','https://venture.angellist.com/brendan-hill/syndicate',
      'crunchbase','https://www.crunchbase.com/person/brendan-hill-57ce',
      'wellfound','https://wellfound.com/p/brendanhill',
      'yaro_blog_interview','https://yaro.blog/brendan-hill/',
      'kintell_advisor','https://kintell.com/advisors/brendan-hill/angel-investing',
      'dayone','https://dayone.fm/people/brendan-hill',
      'sydney_startup_hub','https://community.sydneystartuphub.com/u/brendanhill',
      'history_aus_startup_podcast','https://open.spotify.com/episode/39aeENrgSWBZ2RrbejVkqu'
    ),
    'corrections','CSV portfolio truncated ("Everlab, Instant, GROW In..."). "GROW In..." resolved to GROW Inc. (Australian future-of-work company). Verified additional names (Heidi Health, SpaceX) from the Brendan Hill public profile and AngelList syndicate.'
  ),
  updated_at = now()
WHERE name = 'Brendan Hill';

UPDATE investors SET
  description = 'Sydney-based startup mentor and angel investor with 15+ years in the Australian startup ecosystem. UNSW staff (Start@UNSW). Past Director of Community Development at SoftLayer (IBM Cloud). Founded ShopFree.com (1999) and RecipeLover (2004). $25k cheques in AdTech and B2C.',
  basic_info = 'Brendan Yell is a Sydney-based startup mentor and angel investor with 15+ years of experience helping Australian founders move from initial concept to successful exit. His operator track record includes founding ShopFree.com (1999) — one of the earliest Australian e-commerce platforms — and RecipeLover (2004).

He spent several years as Director of Community Development at SoftLayer (acquired by IBM and now part of IBM Cloud), where he supported startups with cloud infrastructure packages and enterprise-customer introductions. He is also affiliated with Start@UNSW and the broader UNSW startup community.

Today he runs his own personal mentoring and angel-investing practice (brendanyell.com) and writes $25k cheques into ad-tech and B2C consumer-tech founders. His public posts emphasise the importance of authentic founder-investor relationships and warmly recommend other ecosystem operators in the Sydney scene.',
  why_work_with_us = 'For ad-tech and B2C founders, Brendan offers a $25k first cheque plus deep cloud-infrastructure relationships from his SoftLayer/IBM era and 15+ years of accumulated mentor-network access in Sydney. Particularly useful for founders early on the journey who need help navigating cloud cost optimisation, enterprise customer intros and broader ecosystem warm intros.',
  sector_focus = ARRAY['AdTech','B2C','Consumer','SaaS','E-commerce'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  website = 'http://brendanyell.com/',
  linkedin_url = 'https://au.linkedin.com/in/brendanyell',
  contact_email = 'me@brendanyell.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['GoTradie','Stickler','Landmark','ShopFree.com (founder, 1999)','RecipeLover (founder, 2004)'],
  meta_title = 'Brendan Yell — UNSW / Startup Mentor | Sydney AdTech B2C Angel',
  meta_description = 'Sydney startup mentor and angel. 15+ years in startups; UNSW. Ex-Director Community Development, SoftLayer. ShopFree.com & RecipeLover founder. $25k cheques.',
  details = jsonb_build_object(
    'founder_of', ARRAY['ShopFree.com (1999)','RecipeLover (2004)'],
    'current_roles', ARRAY[
      'Startup Mentor & Angel Investor (brendanyell.com)',
      'UNSW (Start@UNSW affiliated)'
    ],
    'prior_roles', ARRAY[
      'Director of Community Development, SoftLayer (now IBM Cloud)'
    ],
    'speaker', ARRAY['AMZ Summits (Amazon ecosystem speaker)'],
    'investment_thesis','Small-cheque AdTech and B2C investments with mentor-network value. Bias toward founders early in the journey who benefit from cloud-infra and enterprise-intro support.',
    'check_size_note','$25k typical',
    'sources', jsonb_build_object(
      'website','http://brendanyell.com/',
      'linkedin','https://au.linkedin.com/in/brendanyell',
      'crunchbase','https://www.crunchbase.com/person/brendan-yell',
      'amz_summits','https://amzsummits.com/speakers/brendan-yell/',
      'unsw_start','https://www.student.unsw.edu.au/startunsw'
    ),
    'corrections','CSV portfolio was truncated ("GoTradie, Stickler, Landm..."). Resolved "Landm..." to Landmark (most likely candidate). These three names taken from CSV directly; could not be independently corroborated via public-source search. Founder companies (ShopFree.com, RecipeLover) added to portfolio_companies as he is the founder of both.'
  ),
  updated_at = now()
WHERE name = 'Brendan Yell';

UPDATE investors SET
  description = 'Sydney-based founder/CEO of Wattblock (energy-efficiency platform for strata-titled multi-tenant buildings, founded 2014 with Ross McIntyre via muru-D accelerator). Cleantech and fintech operator-angel. 1,000+ Australian buildings assisted; 100+ strata buildings energy-upgraded.',
  basic_info = 'Brent Clark is a Sydney-based cleantech and fintech operator turned angel investor. He is the Founder and CEO of Wattblock, an Australian SaaS platform that produces customised energy-saving roadmaps for strata-titled multi-tenant buildings. Wattblock was founded in 2014 with Ross McIntyre as part of muru-D (Telstra''s accelerator) and has since assisted over 1,000 multi-tenant buildings across Australia and energy-upgraded more than 100 strata buildings — reducing common-area energy costs by up to 65%.

His path into cleantech began as Chairperson of his own Sydney apartment building, where he ran 13 energy-saving initiatives over three years to cut common-area energy costs by 77% — the data and learnings from that experiment formed Wattblock''s commercial product.

He is an Australian Graduate School of Management (AGSM) alumnus. As an angel investor he writes cheques into fintech and energy-related startups. The CSV directory lists Eshares.com.au and GPayments among his investments — names tied to the Sydney/Australian fintech and identity/payments scene — although the full portfolio could not be independently corroborated from public-source search.',
  why_work_with_us = 'A practitioner-grade cleantech operator with a public Australian SaaS scale story (Wattblock). Particularly relevant for cleantech, energytech, strata-tech, fintech and B2B SaaS founders selling into Australian property, energy and finance verticals.',
  sector_focus = ARRAY['CleanTech','EnergyTech','PropTech','FinTech','SaaS','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.wattblock.com',
  linkedin_url = 'https://www.linkedin.com/in/brent-clark-2896921/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Wattblock (founder, CEO)','Eshares.com.au','GPayments'],
  meta_title = 'Brent Clark — Wattblock founder | Sydney CleanTech Angel',
  meta_description = 'Sydney founder/CEO Wattblock (1,000+ buildings, ~65% common-area energy savings). muru-D alum. Cleantech/fintech angel. Sectors: Energy, FinTech, PropTech.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Wattblock (2014, co-founder with Ross McIntyre via muru-D)'],
    'current_roles', ARRAY[
      'Founder & CEO, Wattblock'
    ],
    'origin_story','Ran 13 energy-saving initiatives over 3 years as Chairperson of his Sydney apartment building, cutting common-area energy costs by 77% — data became Wattblock''s commercial product.',
    'wattblock_stats', jsonb_build_object(
      'founded',2014,
      'co_founder','Ross McIntyre',
      'incubator','muru-D (Telstra accelerator)',
      'buildings_assisted','1,000+',
      'strata_buildings_upgraded','100+',
      'energy_savings_potential','Up to 65% common-area energy reduction'
    ),
    'education', ARRAY['AGSM (Australian Graduate School of Management)'],
    'investment_thesis','Small-cheque angel cheques into fintech and energy-related startups, with cleantech operator perspective.',
    'check_size_note','Undisclosed; CSV did not specify',
    'sources', jsonb_build_object(
      'wattblock_team','https://www.wattblock.com/team.html',
      'wattblock_about','https://www.wattblock.com/background.html',
      'linkedin','https://www.linkedin.com/in/brent-clark-2896921/',
      'crunchbase','https://www.crunchbase.com/organization/wattblock',
      'fifth_estate_results','https://thefifthestate.com.au/energy-lead/energy/great-results-for-wattblock-in-strata-energy-project/',
      'fifth_estate_capital_raise','https://thefifthestate.com.au/business/investment-deals/wattblock-undertaking-million-dollar-capital-raise/',
      'strata_member_focus','https://nsw.strata.community/member-focus-brent-clark-wattblock/',
      'startup_galaxy','https://startupgalaxy.com.au/startups/wattblock'
    ),
    'corrections','CSV LinkedIn URL empty — populated from public Wattblock profile. CSV portfolio "Eshares.com.au, GPayme..." resolved "GPayme..." to GPayments (Sydney identity/payments company, widely known). Both portfolio names retained as listed but not independently corroborated as Brent Clark personal investments.'
  ),
  updated_at = now()
WHERE name = 'Brent Clark';

UPDATE investors SET
  description = 'Singapore-based sector-agnostic angel investor with Australian deal-flow exposure. $10k–$50k cheques. Limited public profile — multiple "Brian Lim" investors on the Singapore scene; specific identity could not be uniquely corroborated.',
  basic_info = 'Brian Lim is listed in the Australian angel investor directory as a Singapore-based sector-agnostic angel writing $10k–$50k cheques. Singapore is a recognised cross-border hub for South-East Asian and Australian early-stage venture: Singapore-based angels often invest into Australian deals through syndicate platforms (Aussie Angels, AngelList) and via family-office-backed structures.

The directory entry has not been uniquely corroborated to a single LinkedIn or Crunchbase profile. Multiple Brian Lims exist in the Singapore venture and finance ecosystem (including a Pantheon Ventures partner with 25+ years private-equity experience and a Bagchaser-affiliated entrepreneur). Founders should expect to validate his profile and thesis directly via the listed email when they make contact.',
  why_work_with_us = 'For Australian founders raising small first cheques and looking for cross-border South-East Asia exposure, Brian provides a sector-agnostic Singapore-based ticket. Best treated as a referral- or warm-intro-based first conversation rather than a primary-source investor signal.',
  sector_focus = ARRAY['SaaS','Consumer','FinTech','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/brianlimdaging/',
  contact_email = 'brianlim1218@gmail.com',
  location = 'Singapore',
  country = 'Singapore',
  currently_investing = true,
  meta_title = 'Brian Lim — Singapore Angel Investor | Sector Agnostic',
  meta_description = 'Singapore-based sector-agnostic angel writing $10k–$50k cheques into Australian and SE Asian early-stage technology startups.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic small-cheque angel investing with Singapore + Australian deal-flow exposure. Best for founders early in the round building Asia-Pacific cross-border investor mix.',
    'check_size_note','$10k–$50k',
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single public investor profile (multiple Brian Lims in Singapore venture/finance).',
      'No portfolio companies listed in CSV; none independently identified.'
    ],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'angelmatch_singapore','https://angelmatch.io/investors/by-location/singapore',
      'csv_linkedin','https://www.linkedin.com/in/brianlimdaging/'
    ),
    'corrections','CSV LinkedIn URL kept as listed (https://www.linkedin.com/in/brianlimdaging/). Could not corroborate or contradict from public sources. Sector_focus tightened from "Sector Agnostic" to common cross-border angel verticals while preserving sector-agnostic stance.'
  ),
  updated_at = now()
WHERE name = 'Brian Lim';

UPDATE investors SET
  description = 'One of Australia''s oldest and most active angel groups (incorporated 2006, New Farm-headquartered). Member-run organisation of 50+ entrepreneurs, CEOs and high-net-worth investors. Won "Most Active Angel Group in Australia" three consecutive years (2019, 2020, 2021). 16-company portfolio includes Vaxxas, Spoke Phone, Five Faces and Aurtra (acquired by Schneider Electric, March 2022).',
  basic_info = 'Brisbane Angels is one of the largest and most active business-angel networks in Australia, established in 2006 and headquartered in New Farm, Queensland. It is a member-run organisation whose 50+ members are entrepreneurs, CEOs and high-net-worth business leaders who have founded, financed and developed exceptional companies — bringing diverse industry knowledge and operating experience to the Queensland startup ecosystem.

The group focuses primarily on seed-stage investments in Australian companies with high growth potential, strong market position and sustainable competitive advantages. Notable portfolio companies (drawn from a 16-company verified list) include Vaxxas (needle-free vaccine delivery), Spoke Phone (cloud telephony), Five Faces (digital signage and CX) and Aurtra — which was acquired by Schneider Electric in March 2022. Coverage is heavily weighted toward enterprise applications and high-tech.

Recognition includes winning "Most Active Angel Group in Australia" three consecutive years (2019, 2020, 2021). The group is registered with Gust as an accredited angel investment group.',
  why_work_with_us = 'For Queensland-based or QLD-relevant founders, Brisbane Angels is the highest-leverage angel introduction in the state — 50+ active members, 20+ years of accumulated deal-flow process, public exit track record (Aurtra/Schneider) and Most Active Group recognition. Member-driven decision-making means founders pitch to a curated audience of operators with cheque authority.',
  sector_focus = ARRAY['Enterprise SaaS','HealthTech','MedTech','HighTech','SaaS','Telephony','Digital Signage','DeepTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.brisbaneangels.com.au',
  linkedin_url = 'https://au.linkedin.com/company/brisbaneangelsgrouplimited',
  location = 'New Farm, QLD (Brisbane)',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Vaxxas','Spoke Phone','Five Faces','Aurtra (Schneider Electric exit, March 2022)'],
  meta_title = 'Brisbane Angels — Australia''s Most Active Angel Group (3x)',
  meta_description = 'Brisbane Angels (est. 2006, New Farm). 50+ member-run angel group. Most Active Angel Group Australia 2019/2020/2021. Portfolio: Vaxxas, Spoke Phone, Five Faces, Aurtra.',
  details = jsonb_build_object(
    'founded',2006,
    'hq','New Farm, QLD',
    'structure','Member-run; each member makes own investment decision',
    'members','50+',
    'portfolio_size','16 companies (verified per Tracxn)',
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','Vaxxas','category','Needle-free vaccine delivery'),
      jsonb_build_object('company','Spoke Phone','category','Cloud telephony'),
      jsonb_build_object('company','Five Faces','category','Digital signage / CX'),
      jsonb_build_object('company','Aurtra','status','Acquired by Schneider Electric, March 2022')
    ),
    'awards', ARRAY[
      'Most Active Angel Group in Australia — 2019',
      'Most Active Angel Group in Australia — 2020',
      'Most Active Angel Group in Australia — 2021'
    ],
    'investment_thesis','Seed-stage Australian companies with high growth potential, strong market position and sustainable advantages. Bias toward enterprise applications and high-tech.',
    'sources', jsonb_build_object(
      'website','https://www.brisbaneangels.com.au/',
      'angels_page','https://www.brisbaneangels.com.au/angels',
      'tracxn','https://tracxn.com/d/angel-network/brisbane-angels/__1FGUjrDnjy6tJt72U5pYRfq4FrGrQ1KTY0bk_61i5t8',
      'gust','https://gust.com/organizations/brisbane-angels/',
      'crunchbase','https://www.crunchbase.com/organization/brisbane-angels',
      'linkedin','https://au.linkedin.com/company/brisbaneangelsgrouplimited'
    ),
    'corrections','CSV LinkedIn URL empty — populated from public profile. CSV portfolio "50+" appears to refer to member count rather than portfolio companies; clarified in details.members. Verified portfolio names added from Tracxn and public press.'
  ),
  updated_at = now()
WHERE name = 'Brisbane Angels';

COMMIT;
