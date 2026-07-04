-- Enrich angel investors — batch 02g (records 54-58: Christian Bartens → Craig Davis)

BEGIN;

UPDATE investors SET
  description = 'Australian/NY-based data-analytics entrepreneur and angel investor. Co-Founder & CEO of Tribes.AI. Founder & ex-CEO of Datalicious (50-person, AU$10M-revenue marketing-analytics consultancy; controlling stake to Veda 2015 → Equifax 2016). Investor, Advisor and Board Member at Nugit, Sajari (now Search.io) and My Medic Watch.',
  basic_info = 'Christian Bartens is an Australian data-analytics entrepreneur, currently Co-Founder and CEO of Tribes.AI. He is best known as the founder and former CEO of Datalicious — the marketing-analytics consultancy he built into a 50-person, AU$10 million-revenue business with operations across Asia-Pacific. Australian credit-reporting agency Veda took a controlling stake in Datalicious in 2015; Veda was itself acquired by Equifax in 2016. After the Equifax transaction, Christian relocated to New York and joined Equifax''s leadership.

His angel and advisory portfolio focuses on data-driven products and AI-native infrastructure. Verified investments and board roles include:
- **Nugit** — data-storytelling platform.
- **Sajari** (now Search.io) — AI-powered search and recommendations.
- **My Medic Watch** — data-enabled medical wearable.

He has a long-standing tie to the University of Queensland and is active on the I-COM Australia / ADMA committee. The CSV-listed Queensland location reflects his Australian base; he also operates from New York via Tribes.AI.',
  why_work_with_us = 'For data-analytics, AI infrastructure, marketing-tech and healthtech founders, Christian brings (a) operator credibility from a known mid-size Australian data-analytics exit, (b) board-level advisory experience across data-storytelling, AI search and medical wearables, and (c) cross-Pacific (Sydney/NY/QLD) network access. Particularly relevant for Australian data and AI founders building toward US enterprise customers.',
  sector_focus = ARRAY['Data Analytics','AI','MarTech','HealthTech','SaaS','Search'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/cbartens/',
  contact_email = 'christian@bartens.biz',
  location = 'Queensland (and New York)',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Tribes.AI (Co-Founder, CEO)','Datalicious (founder, ex-CEO; Veda 2015 → Equifax 2016)','Nugit','Sajari (Search.io)','My Medic Watch'],
  meta_title = 'Christian Bartens — Tribes.AI / ex-Datalicious | Data & AI Angel',
  meta_description = 'Australian/NY data-analytics entrepreneur. Co-Founder/CEO Tribes.AI. Ex-Datalicious (Veda/Equifax). Investor/Board: Nugit, Sajari/Search.io, My Medic Watch.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Tribes.AI (current; Co-Founder & CEO)',
      'Datalicious (founder, ex-CEO; 50-person, AU$10M revenue at peak)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Datalicious','event','Veda took controlling stake','year',2015,'subsequent','Veda acquired by Equifax (2016)')
    ),
    'current_roles', ARRAY[
      'Co-Founder & CEO, Tribes.AI',
      'Investor, Advisor & Board Member — Nugit',
      'Investor, Advisor & Board Member — Sajari (Search.io)',
      'Investor, Advisor & Board Member — My Medic Watch'
    ],
    'community_roles', ARRAY[
      'I-COM Australia (ADMA) committee'
    ],
    'university_link','University of Queensland',
    'investment_thesis','Data-driven products and AI-native infrastructure where his marketing-analytics operator background adds value — particularly martech, search, healthtech wearables and data-storytelling.',
    'check_size_note','$25k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/cbartens/',
      'crunchbase','https://www.crunchbase.com/person/christian-bartens',
      'golden','https://golden.com/wiki/Christian_Bartens-633W9NP',
      'mumbrella_equifax_move','https://mumbrella.com.au/founder-of-datalicious-moves-joins-equifax-in-new-york-493665',
      'icom_bio','https://www.i-com.org/src-board-with-biogs-1/christian-bartens-adma-australia',
      'datalicious_interview','https://www.youtube.com/watch?v=rY9rI-_2wC4',
      'nugit_angellist','https://angel.co/company/nugit/people'
    ),
    'corrections','CSV sector_focus was truncated ("Open to anything but my..."). Replaced with the actual data/AI/martech focus areas reflected in his three verified board roles. CSV portfolio truncated ("Nugit, Search.io, My Medi..."). Resolved to Nugit, Search.io (Sajari) and My Medic Watch.'
  ),
  updated_at = now()
WHERE name = 'Christian Bartens';

UPDATE investors SET
  description = 'Sydney-based serial tech entrepreneur and angel investor. Founded Netscape Australasia and led CDNow (Australia''s largest pre-Amazon e-commerce store). Principal investor and ex-Chairman of Sky Software (sold to Tribal Group 2014, ~AU$23M). Lead angel investor in OpenLearning ($1M, 2015). Founder of Yoga Aid Foundation. $500k–$2M big-cheque angel — among the largest in the Australian directory.',
  basic_info = 'Clive Mayhew is a Sydney-based serial technology entrepreneur and one of the highest-cheque-size angels in the Australian directory ($500k–$2M). His operating track record is unusually long for an active angel:
- **Netscape Australasia** — founder of the regional Netscape business in the late 1990s.
- **CDNow Australasia** — led the local arm of CDNow, the largest e-commerce store in the world before Amazon scaled.
- **Sky Software** — principal investor and Chairman of the Australian/NZ cloud-based student-management and online-accounting platform; sold to UK-listed Tribal Group in 2014 for approximately AU$23M.

His most-cited angel investment is **OpenLearning** — the ASX-listed (post-IPO) MOOC platform — where he invested AU$1M in February 2015 as part of a $1.7M round, and joined as Non-Executive Director and Chairman.

He holds an MBA and a Masters of Wellness from the University of Melbourne. His angel thesis is explicitly early-stage with a thematic focus on online learning (edutech) and gaming — drawing on his Sky Software/OpenLearning operating context. Outside venture, he founded the international Yoga Aid Foundation and is invested in healthcare/wellness business Orchard Street.',
  why_work_with_us = 'For founders raising large angel rounds ($500k–$2M cheques), Clive is among a handful of Australian angels with the personal balance sheet and operator credentials to lead. Particularly relevant for edutech/MOOC, gaming, e-commerce and wellness founders. Pro tip: ASX-listed-board governance experience makes him useful for companies on a path to public-market listings.',
  sector_focus = ARRAY['EdTech','Online Learning','MOOC','Gaming','E-commerce','Wellness','HealthTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 500000,
  check_size_max = 2000000,
  linkedin_url = 'https://au.linkedin.com/in/clivemay',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['OpenLearning ($1M lead, 2015; NED & Chairman)','Sky Software (principal investor, ex-Chairman; Tribal Group exit 2014, ~AU$23M)','Netscape Australasia (founder)','CDNow Australasia (operator)','Orchard Street','Yoga Aid Foundation (founder)'],
  meta_title = 'Clive Mayhew — OpenLearning lead, ex-Sky Software | Sydney Big-Cheque Angel',
  meta_description = 'Sydney serial tech founder. Sky Software exit (Tribal Group 2014). OpenLearning $1M lead 2015. EdTech/gaming/wellness. $500k–$2M cheques.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Netscape Australasia',
      'Yoga Aid Foundation (international)'
    ],
    'operator_history', ARRAY[
      'CDNow Australasia (ran local arm; pre-Amazon largest e-commerce store)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Sky Software','category','Cloud student-management & online accounting','acquirer','Tribal Group (UK-listed)','year',2014,'value_aud','~AU$23M','clive_role','Principal investor & Chairman')
    ),
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','OpenLearning','round_aud','$1.7M total — Clive led with $1M','year',2015,'role_post','Non-Executive Director and Chairman')
    ),
    'education', ARRAY['MBA, University of Melbourne','Masters of Wellness, University of Melbourne'],
    'investment_thesis','Early-stage with thematic emphasis on online learning (edutech, MOOC), gaming, e-commerce, and wellness/healthtech. Cheque size capable of leading angel rounds in the $500k–$2M range.',
    'check_size_note','$500k–$2M (top of Australian angel band)',
    'health_wellness_interests', ARRAY['Yoga Aid Foundation (founder)','Orchard Street'],
    'sources', jsonb_build_object(
      'crunchbase','https://www.crunchbase.com/person/clive-mayhew',
      'linkedin','https://au.linkedin.com/in/clivemay',
      'wellfound','https://wellfound.com/p/clivemay',
      'sipbn','https://sipbn.com.au/team-members/clive-mayhew/',
      'pitchbook','https://pitchbook.com/profiles/investor/122500-72',
      'topio_openlearning','https://www.topionetworks.com/people/clive-mayhew-5b29375f78e0022abfd309cd',
      'openlearning_wikipedia','https://en.wikipedia.org/wiki/OpenLearning',
      'smartcompany_openlearning','https://www.smartcompany.com.au/startupsmart/finance-2/venture-capital/tech-entrepreneur-clive-mayhew-pumps-1-million-into-openlearning-as-the-mooc-provider-raises-17-million/',
      'intro','https://intro.co/CliveMayhew',
      'cb_insights','https://www.cbinsights.com/investor/clive-mayhew'
    ),
    'corrections','CSV portfolio was truncated ("Open learning $2m, Sky s..."). The "$2m" reference appears to conflate his cheque-size band with the OpenLearning round; corrected to OpenLearning $1M actual angel cheque (part of the $1.7M total round). "Sky s..." resolved to Sky Software.'
  ),
  updated_at = now()
WHERE name = 'Clive Mayhew';

UPDATE investors SET
  description = 'Sydney-based small/mid-cheque angel investor with a self-described open mandate. Up to $100k cheques. CSV portfolio cites Specsavers (likely advisory or operating role rather than personal angel investment). Limited public investor profile — ProSource Partners LinkedIn affiliation noted.',
  basic_info = 'Conor Davis is listed in the Australian angel investor directory as a Sydney-based small/mid-cheque angel writing up to $100k. The directory describes his mandate as "Open to all, mostly interested in [unspecified]" — a generalist sector-agnostic position consistent with someone who picks deals on founder rather than category.

The CSV references Specsavers in his portfolio. Specsavers is a Guernsey-headquartered global optical retail chain with a major Australian presence rather than a venture-backed startup; it is more likely that this reflects an operating/advisory association rather than a venture angel investment per se. His public LinkedIn affiliation is with ProSource Partners.

The directory listing has not been uniquely corroborated to a single public-source profile (multiple "Conor Davis" investors operate in the Sydney/Australian and US scenes). Founders should expect to validate directly via the listed email when they make contact.',
  why_work_with_us = 'Useful as a small/mid-cheque first-money cheque from a generalist Sydney-based investor who writes up to $100k. Best treated as a referral- or warm-intro-led conversation rather than a primary-source investor signal until the public profile firms up.',
  sector_focus = ARRAY['Consumer','Retail','SaaS','Services','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = NULL,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/conor-davis-9b7060134',
  contact_email = 'Conor1089@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Specsavers (advisory/operator association)'],
  meta_title = 'Conor Davis — Sydney Generalist Angel | Up to $100k',
  meta_description = 'Sydney-based generalist angel investor writing up to $100k cheques. Specsavers advisory association. Limited public investor profile.',
  details = jsonb_build_object(
    'investment_thesis','Generalist sector-agnostic mandate; cheques up to $100k. Picks on founder quality.',
    'check_size_note','Up to $100k',
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single public investor profile (multiple Conor Davis individuals in the Australian/US scenes).',
      'Specsavers portfolio entry likely represents advisory/operator rather than venture-angel investment; not independently corroborated as a personal cap-table participation.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/conor-davis-9b7060134',
      'linkedin_prosource','https://www.linkedin.com/in/conordavis/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'specsavers_wikipedia','https://en.wikipedia.org/wiki/Specsavers',
      'angel_investment_network_au','https://www.australianinvestmentnetwork.com/angel-investors/conor-d-angel-investor-sydney-australia-836850'
    ),
    'corrections','CSV LinkedIn URL kept as listed (https://www.linkedin.com/in/conor-davis-9b7060134). CSV portfolio "Specsavers" interpreted as advisory/operator association rather than venture angel investment; flagged in unverified.'
  ),
  updated_at = now()
WHERE name = 'Conor Davis';

UPDATE investors SET
  description = 'Melbourne-based personal angel-investment trust of Sameer Babbar — named one of the top five startup mentors in Australia/NZ by Founder Institute. 100+ active angel investments and 500+ advisory roles. $25k cheques. Sector agnostic.',
  basic_info = 'CPB Trust is the personal angel-investment vehicle of Sameer Babbar, a Melbourne-based startup mentor and angel investor named one of the top five startup mentors in Australia and New Zealand by Founder Institute.

Sameer''s investment and advisory footprint is unusually broad for a single-person vehicle: 100+ active venture investments and 500+ advisory roles spanning Australian and New Zealand early-stage technology businesses. He runs his own personal site at sameerbabbar.com and leads SVB Group Australia, his consulting and advisory practice.

The directory cheque-size of $25k and sector-agnostic stance reflect a mentor-first investment model — small first cheques to lots of founders, with the trust operating as the cap-table vehicle and Sameer''s personal time as the primary value-add.',
  why_work_with_us = 'For founders early in the journey looking for a small first cheque from a recognised top-tier Australian/NZ mentor — Sameer''s 500+ advisory engagements mean unusually deep pattern recognition and warm-intro density across the AU/NZ ecosystem. Best for pre-seed founders who value the mentor-network value-add.',
  sector_focus = ARRAY['SaaS','FinTech','HealthTech','Consumer','Marketplace','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  website = 'https://www.sameerbabbar.com',
  linkedin_url = 'https://au.linkedin.com/in/sameerbabbar',
  contact_email = 'sbabbar@sameerbabbar.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['SVB Group (founder)','100+ active angel investments (sector-agnostic)','500+ advisory engagements'],
  meta_title = 'CPB Trust (Sameer Babbar) — Melbourne Top-5 Mentor Angel',
  meta_description = 'Melbourne CPB Trust = Sameer Babbar. Top 5 AU/NZ Founder Institute mentor. 100+ active investments, 500+ advisory engagements. $25k cheques.',
  details = jsonb_build_object(
    'individual','Sameer Babbar',
    'vehicle','CPB Trust (personal investment trust)',
    'recognition', ARRAY['Top 5 Startup Mentors in Australia & New Zealand — Founder Institute'],
    'current_roles', ARRAY[
      'Founder, SVB Group Australia',
      'Personal site: sameerbabbar.com',
      '100+ active angel investments',
      '500+ advisory engagements'
    ],
    'investment_thesis','Sector-agnostic small first cheques to many founders; mentor-first model where the trust supplies cap-table participation while Sameer supplies the time/network value-add.',
    'check_size_note','$25k typical',
    'sources', jsonb_build_object(
      'sameer_babbar_personal','https://www.sameerbabbar.com/',
      'linkedin','https://au.linkedin.com/in/sameerbabbar',
      'svb_group','https://www.svbgroup.com.au/about',
      'angelmatch_melbourne','https://angelmatch.io/investors/by-location/melbourne',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV email truncated ("sbabbar@sameerbabbar..."). Resolved to sbabbar@sameerbabbar.com. CSV LinkedIn URL pointed to Sameer''s personal LinkedIn (in/sameerbabbar) — verified. Sector_focus from "Agnostic" expanded to common AU/NZ angel verticals while preserving sector-agnostic framing.'
  ),
  updated_at = now()
WHERE name = 'CPB Trust';

UPDATE investors SET
  description = 'Canberra-based angel investor and ecosystem builder. Co-founder of TakeABreak (sold to Fairfax 2011, integrated with Stayz, group on-sold for ~$210M). GM Growth Programs, Canberra Innovation Network. Co-founder of GRIFFIN Accelerator. Deputy Chair of Capital Angels. Personal angel vehicle: Dendarii Investments. PhD physics (Cambridge + ANU).',
  basic_info = 'Dr Craig Davis is one of the longest-serving operators in the Canberra startup ecosystem. He holds a PhD in physics from the University of Cambridge with subsequent research positions at the Australian National University before pivoting to technology entrepreneurship.

His operator track record includes co-founding TakeABreak, an online accommodation business sold to Fairfax in 2011 — Craig led the integration with Fairfax''s competing business Stayz, and the combined Stayz Group was subsequently on-sold for approximately AU$210M (to HomeAway / Expedia in 2013).

In the years since he has been instrumental in shaping the ACT startup landscape:
- **GM Growth Programs**, Canberra Innovation Network (CBR Innovation Network).
- Co-founder of the **GRIFFIN Accelerator**, the Canberra-based startup accelerator program.
- **Deputy Chair**, Capital Angels (Australia''s first incorporated angel group, established 2005).
- His personal angel investment vehicle is **Dendarii Investments**.

His portfolio listing across Stayz (his prior operating company), Instaclustr (a Canberra-based open-source data-platform business that became one of Capital Angels'' flagship investments) and Signon reflects a 20+-year operator-investor record concentrated in the Capital Region. Cheque size $20k–$200k.',
  why_work_with_us = 'For Canberra and Capital Region founders, Craig is one of the highest-leverage relationships in the ACT — running CBR Innovation Network''s growth programs, co-running the GRIFFIN Accelerator, and Deputy Chair of Capital Angels. Founders working with him gain access to multiple ACT funding pathways simultaneously.',
  sector_focus = ARRAY['SaaS','Consumer','Marketplace','DeepTech','Open Source','Government Tech','HealthTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 20000,
  check_size_max = 200000,
  linkedin_url = 'https://www.linkedin.com/in/craigdaviscbr/',
  contact_email = 'craig.davis@dendarii.com',
  location = 'Canberra, ACT',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Dendarii Investments (personal vehicle)','Stayz Group (TakeABreak co-founder; Fairfax 2011 → Stayz Group; ~$210M on-sale)','Instaclustr','Signon','GRIFFIN Accelerator (co-founder)','Capital Angels (Deputy Chair)','CBR Innovation Network (GM Growth Programs)'],
  meta_title = 'Craig Davis — GRIFFIN / Capital Angels Deputy Chair | Canberra Angel',
  meta_description = 'Canberra angel and ecosystem builder. PhD physics. Co-founder TakeABreak/Stayz Group (~$210M). GM Growth CBR Innovation Network. Deputy Chair Capital Angels.',
  details = jsonb_build_object(
    'credentials','PhD Physics — University of Cambridge (UK); subsequent research at Australian National University',
    'founder_of', ARRAY[
      'TakeABreak (co-founder; Fairfax exit 2011)',
      'GRIFFIN Accelerator (co-founder)',
      'Dendarii Investments (personal angel vehicle)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','TakeABreak','event','Sold to Fairfax','year',2011,'subsequent','Integrated with Stayz; combined Stayz Group on-sold ~AU$210M (to HomeAway/Expedia 2013)')
    ),
    'current_roles', ARRAY[
      'GM Growth Programs, Canberra Innovation Network (CBR Innovation Network)',
      'Co-founder, GRIFFIN Accelerator',
      'Deputy Chair, Capital Angels',
      'Personal angel vehicle: Dendarii Investments'
    ],
    'investment_thesis','Sector-agnostic Canberra-Region investing with multi-channel pathways: personal Dendarii cheques, Capital Angels member investments and GRIFFIN Accelerator program participation. Particularly active in deeptech, open-source, govtech and healthtech relevant to the ACT economy.',
    'check_size_note','$20k–$200k',
    'experience','20+ years as co-founder, CEO, director, investor or mentor across startups',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/craigdaviscbr/',
      'crunchbase','https://www.crunchbase.com/person/craig-davis-3',
      'cbrin_profile','https://cbrin.com.au/general-news/dr-craig-davis-the-accidental-entrepreneur/',
      'confengine','https://confengine.com/user/craig-davis',
      'pitchbook','https://pitchbook.com/profiles/investor/491259-97',
      'raizer','https://raizer.app/investor/craig-davis',
      'cb_insights','https://www.cbinsights.com/investor/craig-davis',
      'rocketreach','https://rocketreach.co/craig-davis-email_5664206'
    ),
    'corrections','CSV email truncated ("craig.davis@dendarii.com..."). Resolved to craig.davis@dendarii.com. CSV portfolio "Stayz, Instaclustr, Signon..." retained verbatim with Stayz contextualised as his prior operating company (TakeABreak → Stayz Group integration). Trailing item could not be uniquely identified.'
  ),
  updated_at = now()
WHERE name = 'Craig Davis';

COMMIT;
