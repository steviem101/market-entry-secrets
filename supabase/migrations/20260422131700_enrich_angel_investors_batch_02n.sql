-- Enrich angel investors — batch 02n (records 89-93: Geelong Angels → George Freney)

BEGIN;

UPDATE investors SET
  description = 'Geelong-based regional angel investment group. Formed 2014 by experienced entrepreneurs to support promising new enterprises with secondary focus on Geelong-region ideas and entrepreneurs. ~12 members. Now part of the Regional Angel Investor Network. Notable co-investments: Kesem Health (iUFlow bladder-monitoring device; co-invest with Melbourne Angels), Monnie ($300K seed September 2015).',
  basic_info = 'Geelong Angels (now operating under the **Regional Angel Investor Network** umbrella) was formed in 2014 by a small group of experienced entrepreneurs to channel angel investment into promising emerging-sector ventures, with a secondary focus on Geelong-region ideas and entrepreneurs.

The group has approximately **12 members** — high-net-worth private investors who actively back early-stage and growth-stage companies. The mission is collaborative: members share knowledge and networks, deal-flow is curated jointly, but each member writes their own cheque to companies they personally back.

Notable co-investments include:
- **Kesem Health** — Geelong Angels participated alongside Melbourne Angels and other private investors in a A$355K round backing the iUFlow bladder-monitoring home diagnostic medical device.
- **Monnie** — A$300,000 seed funding round in September 2015 led by Geelong Angel Investor Network.

The group is registered with **Gust** as an accredited angel investment group and operates within the broader Victorian regional angel ecosystem alongside Melbourne Angels and other LaunchVic-aligned networks.',
  why_work_with_us = 'For Geelong-based, regional Victorian and broader Australian early-stage founders, Geelong Angels is the most established angel pipeline outside metropolitan Melbourne — a curated 12-member group with 10+ years of accumulated deal-flow process. Particularly relevant for founders with Geelong-region operating context, healthcare-device, marketplace and emerging-sector businesses.',
  sector_focus = ARRAY['HealthTech','MedTech','SaaS','Marketplace','Consumer','Emerging Sectors','Regional Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  website = 'https://regionalangels.com.au',
  linkedin_url = 'https://au.linkedin.com/company/regional-angel-investor-network',
  location = 'Geelong, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Kesem Health (iUFlow; co-invest with Melbourne Angels)','Monnie (A$300K seed, Sept 2015)'],
  meta_title = 'Geelong Angels — Regional Victorian Angel Group (est. 2014)',
  meta_description = 'Geelong-based angel group, formed 2014. ~12 members. Now Regional Angel Investor Network. Portfolio: Kesem Health, Monnie. Gust-accredited.',
  details = jsonb_build_object(
    'founded',2014,
    'hq','Geelong, VIC',
    'now_part_of','Regional Angel Investor Network',
    'members','~12',
    'structure','Member-driven; each member writes own cheque, group provides shared deal-flow filter and DD',
    'highlight_deals', jsonb_build_array(
      jsonb_build_object('company','Kesem Health','round','A$355K','co_investors',ARRAY['Melbourne Angels','Private investors'],'product','iUFlow bladder-monitoring home diagnostic medical device'),
      jsonb_build_object('company','Monnie','round','A$300K seed','year',2015,'month','September','geelong_role','Lead investor')
    ),
    'investment_thesis','Promising new enterprises in emerging sectors, with secondary focus on Geelong-region ideas and entrepreneurs.',
    'check_size_note','Variable; member-by-member',
    'sources', jsonb_build_object(
      'website','https://regionalangels.com.au/',
      'gust','https://gust.com/organizations/geelong-angel-investor-network',
      'cb_insights','https://www.cbinsights.com/investor/geelong-angel-investor-network',
      'crunchbase','https://www.crunchbase.com/organization/geelong-angel-investor-network',
      'linkedin','https://au.linkedin.com/company/regional-angel-investor-network',
      'zoominfo','https://www.zoominfo.com/c/geelong-angel-investor-network/372400316'
    ),
    'corrections','CSV portfolio truncated ("Kesem Health, Monnie Lt..."). Resolved "Monnie Lt..." to Monnie (A$300K seed Sept 2015 verified). Added contextual co-investor data (Melbourne Angels for Kesem Health). CSV LinkedIn URL empty — populated with Regional Angel Investor Network company page (the current operating entity).'
  ),
  updated_at = now()
WHERE name = 'Geelong Angels';

UPDATE investors SET
  description = 'Sydney-based deep-tech specialist VC and angel investor. Head of Venture Investment at the University of Sydney. Partner at Stoic VC (managed seed fund; 22 university spinoff investments + two seed-stage VC funds). PhD Economics & Strategy from UCLA. Former business-school academic at AGSM, HKUST, Emory and UCLA. $50k–$300k cheques.',
  basic_info = 'Dr Geoff Waring is a Sydney-based deep-tech investor with one of the most academically-credentialed profiles in the Australian angel scene. He is Head of Venture Investment at the **University of Sydney**, where he oversees the pre-seed investment fund focused on commercialising university research, and is a Partner at **Stoic Venture Capital** (Stoic VC) — a frontier-research-focused VC firm where he managed the seed fund and led 22 university-spinoff investments plus two seed-stage VC fund commitments.

His academic background runs across multiple top-tier business schools: he was a competitive-strategy academic at the **AGSM** (Australian Graduate School of Management), **Hong Kong University of Science & Technology**, the **Goizueta Business School at Emory University Atlanta** and **UCLA**. He holds a **PhD in Economics & Strategy from UCLA**.

His personal angel portfolio is concentrated in deep-tech and frontier-research companies. CSV-listed portfolio includes **BioScout** (agricultural pathogen detection), **Eyes of AI** (medical imaging) and **DetectedX** (radiology AI). Verified additional Stoic-led investments include Forcite, Wildlife Drones, Ferronova, Cardihab, Kinoxis and LM Plus. He was previously associated with Uniseed (university VC firm) and BioScout.

His CSV cheque band is $50k–$300k — appropriate for someone running both a fund-level practice (via Stoic and University of Sydney) and personal angel cheques.',
  why_work_with_us = 'For Australian deep-tech and university-spinoff founders, Geoff is among the highest-leverage relationships in the country — combining (a) University of Sydney pre-seed fund visibility into the country''s largest research pipeline, (b) Stoic VC institutional pathway alongside personal angel cheque, (c) decades of competitive-strategy academic depth across three continents. Particularly relevant for medical-imaging, agricultural-pathogen, biotech, satellite/drones, and other commercialisation-of-research founders.',
  sector_focus = ARRAY['DeepTech','BioTech','MedTech','AgTech','AI','Frontier Research','University Spinoffs'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 300000,
  linkedin_url = 'https://au.linkedin.com/in/geoffwaring',
  contact_email = 'geoffrey.waring@sydney.edu.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['BioScout','Eyes of AI','DetectedX','Forcite','Wildlife Drones','Ferronova','Cardihab','Kinoxis','LM Plus','Stoic Venture Capital (Partner)','University of Sydney pre-seed fund (Head of Venture Investment)'],
  meta_title = 'Geoff Waring — Stoic VC / U Sydney | Sydney DeepTech Angel',
  meta_description = 'Sydney deep-tech investor. Head of Venture Investment, University of Sydney. Partner Stoic VC. PhD UCLA. Portfolio: BioScout, Eyes of AI, DetectedX. $50k–$300k.',
  details = jsonb_build_object(
    'firm','Stoic Venture Capital (frontier-research VC) + University of Sydney pre-seed fund',
    'roles', ARRAY[
      'Head of Venture Investment, University of Sydney',
      'Partner, Stoic Venture Capital (managed seed fund + 22 university spinoff investments + 2 seed-stage VC fund commitments)'
    ],
    'prior_academic_career', ARRAY[
      'AGSM (Australian Graduate School of Management) — competitive strategy',
      'Hong Kong University of Science & Technology',
      'Goizueta Business School, Emory University Atlanta',
      'UCLA'
    ],
    'prior_industry_career', ARRAY['BioScout','Eyes of AI','Self-employed','Uniseed (Australian university VC firm)'],
    'education', ARRAY['PhD Economics & Strategy, UCLA, California'],
    'portfolio_count','22 university spinoffs led at Stoic + personal angel portfolio',
    'investment_thesis','Frontier-research and deep-tech university spinoffs across biotech, medtech, agtech and AI. Personal angel cheques calibrated to deal stage.',
    'check_size_note','$50k–$300k',
    'sources', jsonb_build_object(
      'usyd_pre_seed','https://www.sydney.edu.au/engage/innovation-and-enterprise/pre-seed-investment-fund.html',
      'usyd_zoominfo','https://www.zoominfo.com/p/Geoffrey-Waring/110710436',
      'rocketreach','https://rocketreach.co/geoff-waring-email_54977401',
      'stoic_vc','https://newsite.stoicvc.com.au/team/dr-geoff-waring/',
      'detectedx','https://detectedx.com/staff/geoff-waring/',
      'eyes_of_ai','https://eyesofai.com/about',
      'linkedin','https://au.linkedin.com/in/geoffwaring',
      'pitchbook','https://pitchbook.com/profiles/person/245835-10P',
      'medium','https://medium.com/@geoffwaring'
    ),
    'corrections','CSV portfolio truncated ("BioScout, Eyes of AI, Det..."). Three retained verbatim and expanded with verified Stoic VC portfolio (Forcite, Wildlife Drones, Ferronova, Cardihab, Kinoxis, LM Plus). Added Stoic VC Partner and University of Sydney Head of Venture Investment roles for completeness.'
  ),
  updated_at = now()
WHERE name = 'Geoff Waring';

UPDATE investors SET
  description = 'Melbourne-based global social entrepreneur and impact investor. Founder of One10 (Incubator/Accelerator for profit-for-purpose ventures, founded 2015; 70+ startups supported). Co-Founder of $100M Impact Investment Fund. NED of NuGreen Solutions. Co-Founder of Entrepreneurs & Co. Investor + Board Director at CarbonTRACK. Centre for Sustainability Leadership Fellow (2008). 24+ years operating across design/property/environmental/energy/tech.',
  basic_info = 'Geoffrey "Geoff" Gourley is a Melbourne-based global social entrepreneur and impact investor with one of the most distinctive profit-for-purpose investing practices in Australia.

He is the **founder of One10** (oneten.com.au) — the Incubator and Accelerator he established in 2015 to support entrepreneurs and organisations delivering profit for purpose. One10 has worked with **70+ founders and startups** across its Fundamentals, Activate, Amplify and Enhance flagship programs, with a "Founder Fund" that has raised $750K+ in contributions.

His portfolio of current roles includes:
- **Founder, One10** (incubator/accelerator)
- **Co-Founder, $100M Impact Investment Fund**
- **Non-Executive Director, NuGreen Solutions**
- **Co-Founder, Entrepreneurs & Co**
- **Investor + Board Director, CarbonTRACK**

His personal portfolio runs to 14+ companies, all selected through an impact-investing lens. He has 24+ years operating experience across design, property, environmental, energy and technology industries — developing, commercialising and managing numerous businesses.

He was a **Centre for Sustainability Leadership Fellow** in 2008, which he has cited as the moment of conviction that motivated his pivot into impact investing and the founding of One10.',
  why_work_with_us = 'For Australian profit-for-purpose, social-enterprise, impact-tech, climate-tech, energy-transition and sustainability-focused founders, Geoff is among the highest-leverage relationships in the country — combining (a) One10 incubator-program participation, (b) Co-Founder access to a $100M Impact Investment Fund, (c) operator credentials across NuGreen Solutions, CarbonTRACK and Entrepreneurs & Co. Particularly useful for founders who can articulate clear social/environmental impact alongside commercial returns.',
  sector_focus = ARRAY['Impact','Social Enterprise','Sustainability','Climate Tech','Energy','Property Tech','Design Tech','Education'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 250000,
  website = 'https://oneten.com.au',
  linkedin_url = 'https://www.linkedin.com/in/geoffgourley/',
  contact_email = 'geoff.gourley@oneten.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['One10 (founder; incubator/accelerator)','$100M Impact Investment Fund (co-founder)','NuGreen Solutions (NED)','Entrepreneurs & Co (co-founder)','CarbonTRACK (Board Director + Investor)'],
  meta_title = 'Geoffrey Gourley — One10 founder | Melbourne Impact-Investor',
  meta_description = 'Melbourne global social entrepreneur. Founder One10 (incubator). Co-founder $100M Impact Investment Fund. NED NuGreen, board CarbonTRACK. 14+ portfolio.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'One10 (Incubator/Accelerator for profit-for-purpose, 2015)',
      '$100M Impact Investment Fund (co-founder)',
      'Entrepreneurs & Co (co-founder)'
    ],
    'current_roles', ARRAY[
      'Founder, One10',
      'Co-Founder, $100M Impact Investment Fund',
      'Non-Executive Director, NuGreen Solutions',
      'Co-Founder, Entrepreneurs & Co',
      'Investor + Board Director, CarbonTRACK'
    ],
    'one10_stats', jsonb_build_object(
      'founded',2015,
      'startups_supported','70+',
      'flagship_programs', ARRAY['Fundamentals','Activate','Amplify','Enhance'],
      'founder_fund_raised_aud','$750K+ in contributions'
    ),
    'recognition', ARRAY['Centre for Sustainability Leadership Fellow (2008)'],
    'experience_years','24+ years across design, property, environmental, energy and technology',
    'personal_portfolio_count','14+ companies',
    'investment_thesis','Profit-for-purpose ventures with measurable social and environmental impact alongside commercial returns. Cross-sector reach from design/property/environmental/energy/tech operator background.',
    'check_size_note','$25K–$250K then follow-on',
    'sources', jsonb_build_object(
      'one10','https://oneten.com.au/',
      'one10_purpose','https://oneten.com.au/purpose',
      'one10_partners','https://oneten.com.au/partners',
      'one10_founder_fund','https://oneten.com.au/blog-archive/2020/5/12/one10-founder-fund-hits-750k-in-contributions-milestone',
      'one10_newsroom','https://oneten.com.au/newsroom',
      'about_me','https://about.me/geoffgourley',
      'crunchbase','https://www.crunchbase.com/person/geoff-gourley'
    ),
    'corrections','CSV portfolio truncated ("NuGreen Solutions, One1..."). Two retained verbatim ("One1..." resolved to One10) and expanded with $100M Impact Investment Fund, Entrepreneurs & Co and CarbonTRACK roles. CSV cheque "$25K - $250K then..." resolved to $25K–$250K + follow-on. CSV email truncated — resolved to geoff.gourley@oneten.com.au.'
  ),
  updated_at = now()
WHERE name = 'Geoffrey Gourley';

UPDATE investors SET
  description = 'Nanango QLD-based developer-tools engineer and SaaS angel investor. Currently engineer at Sourcegraph (Amp coding-agent product). Previously tech lead for developer productivity at Canva. ReactiveUI core contributor. Lives a remote/van-life work pattern around Australia. Public personal brand at ghuntley.com.',
  basic_info = 'Geoffrey ("Geoff") Huntley is a Nanango (Queensland)-based software engineer and SaaS angel investor with a uniquely public-facing developer-tools brand. He is currently an engineer at **Sourcegraph**, working on **Amp** — Sourcegraph''s AI-coding-agent product — building "AI with AI" as he describes it.

Previously he was **tech lead for developer productivity at Canva** (one of Australia''s largest tech companies and a Blackbird Ventures portfolio company), and is a long-standing core contributor to **ReactiveUI**, the open-source .NET reactive-programming framework that he helped formalise into the .NET Foundation.

He has been developing **The Weaving Loom** for the last three years — infrastructure for evolutionary software — and publishes extensively on coding agents, AI-assisted development and developer tooling at ghuntley.com. He has presented at WebDirections on building coding agents and runs a free workshop on the same.

His lifestyle is unusual for an angel investor: he lives in a van that is slowly working its way around Australia, following the intersection of remote work, camping and van life. His CSV-listed sector focus is SaaS and his cheque size is undisclosed.',
  why_work_with_us = 'For SaaS, developer-tools, AI-coding-agent and open-source-adjacent founders, Geoff offers technical credibility from one of the most-cited developer-productivity careers in the Australian scene (Canva tech lead, Sourcegraph Amp, ReactiveUI core contributor). Particularly useful for technical founders who want a peer-level engineering review and SaaS-product judgement alongside a small first cheque.',
  sector_focus = ARRAY['SaaS','Developer Tools','AI','AI Coding Agents','Open Source','Productivity','Engineering'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://ghuntley.com',
  linkedin_url = 'https://linkedin.com/in/GeoffreyHuntley',
  contact_email = 'ghuntley@ghuntley.com',
  location = 'Nanango, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Sourcegraph (engineer)','Canva (ex-tech lead, developer productivity)','ReactiveUI (core contributor)'],
  meta_title = 'Geoffrey Huntley — Sourcegraph / ex-Canva | QLD SaaS Angel',
  meta_description = 'Nanango QLD developer-tools engineer. Sourcegraph Amp engineer. Ex-tech lead developer productivity at Canva. ReactiveUI contributor. SaaS angel.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Engineer, Sourcegraph (Amp AI-coding-agent product)',
      'Personal site/blog: ghuntley.com'
    ],
    'prior_roles', ARRAY[
      'Tech lead, developer productivity, Canva',
      'Core contributor, ReactiveUI (.NET Foundation)'
    ],
    'public_projects', ARRAY[
      'The Weaving Loom (infrastructure for evolutionary software, 3-year personal project)',
      'Coding-agent free workshop',
      'ReactiveUI .NET Foundation adoption work'
    ],
    'media_speaker', ARRAY['WebDirections (coding agents)','YouTube channel @GeoffreyHuntley'],
    'lifestyle','Lives in a van around Australia (remote work + camping + van life)',
    'investment_thesis','SaaS, developer tools, AI-coding-agent infrastructure, open-source-adjacent businesses where technical operator credibility from Canva/Sourcegraph compounds with the cheque.',
    'check_size_note','Undisclosed in CSV',
    'sources', jsonb_build_object(
      'website','https://ghuntley.com/',
      'github','https://github.com/ghuntley',
      'linkedin','https://linkedin.com/in/GeoffreyHuntley',
      'youtube','https://www.youtube.com/@GeoffreyHuntley',
      'twitter_x','https://x.com/GeoffreyHuntley',
      'bluesky','https://bsky.app/profile/ghuntley.com',
      'weaving_loom_post','https://ghuntley.com/loop/',
      'agent_workshop','https://ghuntley.com/agent/'
    ),
    'corrections','CSV LinkedIn URL had no protocol — resolved to https://linkedin.com/in/GeoffreyHuntley. CSV portfolio empty — populated with verified employer/contributor affiliations rather than fabricating angel-investment names. CSV cheque empty.'
  ),
  updated_at = now()
WHERE name = 'Geoffrey Huntley';

UPDATE investors SET
  description = 'Adelaide-based serial founder, chemical engineer and angel investor. Co-founder of conTgo (mobile travel-tech, sold 2013) and Booodl (retail-discovery platform, 2012). Currently Founding Partner at 11point2, Co-Founder & Strategy Director of Space Machines Company, and Founding Member of Lunar Ascent. $20k cheques in technology and biotech.',
  basic_info = 'George Freney is an Adelaide-based serial entrepreneur and angel investor with a chemical-engineering background and one of the more distinctive trajectory-of-bets in the Australian space-and-tech scene.

His operating track record:
- **conTgo** — Co-founded in 2007. Mobile travel-technology platform that became a market leader. Sold in 2013.
- **Booodl** — Co-founded in 2012. Helped shoppers find the right physical retail store selling the product they want. Co-Founder & CEO.
- **11point2** — Founding Partner. Combines advisory expertise with a drive to accelerate promising ideas for people, businesses and governments.
- **Space Machines Company** — Co-Founder & Strategy Director / Co-Founder & Chief Development Officer. Pioneering Australian space-technology company.
- **Lunar Ascent** — Founding Member. Space-technology venture.

He has been a regular speaker at Startup Grind Adelaide and a contributor to publications including The Big Smoke and Inspirepreneur Magazine. His CSV cheque size of $20k reflects small, targeted operator-angel positions.

CSV-listed portfolio includes **Contgo** (his own founder company), **Booodl** (his own founder company) and **Tinybeans** (per CSV — could not be independently corroborated as personal angel investment).',
  why_work_with_us = 'For Australian space-tech, biotech, retail-tech and consumer-mobile founders, George brings (a) two-time exited-founder operating credentials, (b) Space Machines Company space-tech depth, (c) advisory bench at 11point2 across business and government clients, and (d) chemical-engineering technical foundation. Particularly relevant for South-Australian space, defence-adjacent and deeptech founders.',
  sector_focus = ARRAY['Technology','BioTech','Space Tech','Retail Tech','Mobile','Travel Tech','DeepTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 20000,
  check_size_max = 20000,
  linkedin_url = 'https://www.linkedin.com/in/georgefreney/',
  location = 'Adelaide, SA',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['conTgo (co-founder; sold 2013)','Booodl (co-founder & CEO, 2012)','11point2 (Founding Partner)','Space Machines Company (co-founder, Strategy Director / CDO)','Lunar Ascent (Founding Member)'],
  meta_title = 'George Freney — Booodl / Space Machines | Adelaide Angel',
  meta_description = 'Adelaide chemical engineer. Co-founder conTgo (2013 exit), Booodl, 11point2. Co-founder/Strategy Director Space Machines Company. $20k cheques.',
  details = jsonb_build_object(
    'background','Chemical engineer by training; Adelaide-based',
    'founder_of', ARRAY[
      'conTgo (2007 co-founder; mobile travel tech; sold 2013)',
      'Booodl (2012 co-founder & CEO; retail-discovery platform)',
      '11point2 (Founding Partner)',
      'Space Machines Company (Co-Founder & Strategy Director / Chief Development Officer)',
      'Lunar Ascent (Founding Member)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','conTgo','category','Mobile travel technology','sold','2013')
    ),
    'media_speaker', ARRAY['ADC Global Blockchain Summit','Startup Grind Adelaide','The Big Smoke','Inspirepreneur Magazine'],
    'investment_thesis','Technology and biotech early-stage with operator-angel value-add. Particularly useful for South-Australian space-tech, retail-tech and deeptech founders.',
    'check_size_note','$20k',
    'unverified', ARRAY[
      'CSV portfolio entry "Tinybeans" could not be independently corroborated as a personal George Freney angel investment.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/georgefreney/',
      'crunchbase','https://www.crunchbase.com/person/george-freney',
      'adc_blockchain','https://www.adcblockchain.org/george-freney',
      'big_smoke_interview','https://thebigsmoke.com.au/2016/07/07/meet-an-innovator-george-freney-from-booodl/',
      'inspirepreneur','https://inspirepreneurmagazine.com/george-freneys-vision-for-the-future-of-space-and-sustainability/',
      'startup_grind_youtube','https://www.youtube.com/watch?v=4aJpeGR4aUw',
      'space_machines_zoominfo','https://www.zoominfo.com/p/George-Freney/1629008856',
      'twitter','https://twitter.com/gfreney'
    ),
    'corrections','CSV portfolio "Contgo, Boodl, Tinybeans..." — Contgo and Boodl are his own founder companies (kept and contextualised). Tinybeans flagged in unverified. Added 11point2, Space Machines Company and Lunar Ascent as verified current operating affiliations. CSV email field empty — left contact_email NULL.'
  ),
  updated_at = now()
WHERE name = 'George Freney';

COMMIT;
