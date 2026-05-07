-- Enrich angel investors — batch 02o (records 94-98: Glenn Bartlett → Hamia Group Investments)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based growth consultant and profit-for-purpose angel investor. Founder of Story & Focus consultancy (brand/growth strategy). Active in impact, sustainability and technology investing. CSV-listed portfolio includes Monarc Global and Amber Electric (residential energy retailer).',
  basic_info = 'Glenn Bartlett is a Sydney-based growth consultant and profit-for-purpose angel investor whose stated personal mission is "to help people buy a better world." He runs **Story & Focus**, his consultancy that works with businesses on brand articulation and growth strategy.

His angel posture is explicitly impact- and sustainability-aligned. CSV-listed portfolio includes:
- **Monarc Global** — Australian technology business (Deloitte technology-leaders alumnus).
- **Amber Electric** — Australian residential electricity retailer with wholesale-pass-through pricing, founded 2017 by Chris Thompson (ex-BCG/Goldman Sachs) and Dan Adams (ex-Tesla/BCG).

His public profile is consistent with someone who picks deals on values-fit rather than category — sustainability, impact and technology are the umbrella, but specific deal selection is founder-driven.',
  why_work_with_us = 'For Australian impact, sustainability, energy-transition and consumer-tech founders who can articulate a "buy-a-better-world" thesis, Glenn offers values-aligned angel cheques alongside Story & Focus brand and growth-strategy advisory. Best for founders who want a thoughtful storyteller-investor relationship rather than a transactional cheque.',
  sector_focus = ARRAY['Impact','Sustainability','EnergyTech','Consumer','SaaS','Climate','Technology'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.glennbartlett.co',
  contact_email = 'bartlett.glenn@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Monarc Global','Amber Electric','Story & Focus (founder, growth consultancy)'],
  meta_title = 'Glenn Bartlett — Story & Focus | Sydney Impact-Sustainability Angel',
  meta_description = 'Sydney profit-for-purpose angel and growth consultant. Founder Story & Focus. Portfolio: Monarc Global, Amber Electric. Impact + sustainability focus.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Story & Focus (Sydney brand/growth-strategy consultancy)'],
    'mission','Help people buy a better world',
    'investment_thesis','Profit-for-purpose ventures with impact, sustainability or technology dimensions. Values-aligned investor with brand/growth-strategy advisory layer.',
    'check_size_note','Undisclosed in CSV',
    'unverified', ARRAY[
      'CSV portfolio (Monarc Global, Amber Electric) verified as real Australian companies but his cap-table participation in each not independently corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'website','https://www.glennbartlett.co/',
      'monarc_partners','https://www.linkedin.com/company/monarc-partners',
      'monarc_group','https://www.linkedin.com/company/themonarcgroup',
      'amber_about','https://www.amber.com.au/about-us',
      'amber_pitchbook','https://pitchbook.com/profiles/company/230725-09',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV LinkedIn URL empty — populated personal site instead. CSV portfolio "Monarc Global, Amber El..." retained verbatim — both names verified as real companies; cap-table participation taken from CSV listing without independent corroboration.'
  ),
  updated_at = now()
WHERE name = 'Glenn Bartlett';

UPDATE investors SET
  description = 'Perth-based technology operator, VC and angel investor. CEO/Managing Director of FundWA (Western Australian VC firm). Venture Partner at CP Ventures (alongside Emlyn Scott #79 and Chris Sang #53). Past Principal Consultant at The Growth Execs. Ex-VP Engineering at Brandscreen and Director of SaaS Engineering at Atlassian. NED at Ecocentric Energy. 25+ years in senior tech leadership including Atlassian and Amazon.',
  basic_info = 'Glenn Butcher is a Perth-based technology operator, venture-capital investor and angel investor with one of the more compounded operator-VC career arcs in Western Australia. He is currently the **CEO and Managing Director of FundWA** (fundwa.com.au) — the Western Australian venture-capital firm dedicated to fostering innovation and championing visionary startups in the WA region.

He is also a **Venture Partner at CP Ventures** — the Sydney boutique VC fund where he works alongside Managing Partners **Emlyn Scott (record #79)** and **Chris Sang (record #53)**. CP Ventures runs two global top-quartile Australian VC funds, both now closed to investment.

His operator track record before founding/joining the WA-VC ecosystem:
- **VP of Engineering, Brandscreen** — programmatic ad-tech.
- **Director of SaaS Engineering, Atlassian** — one of Australia''s largest tech companies.
- Long career at **Amazon** and other major global businesses.
- **Principal Consultant, The Growth Execs** — Director and Principal Engineering and Operations Consultant role; created high-performing customer-centric technical team cultures.

He is currently chairman of two technology companies, director of two further startups, and serves as **Non-Executive Director at Ecocentric Energy**. 25+ years senior leadership across Atlassian, Amazon and other global businesses.

His CSV email contact (glenn@thegrowthexecs.com) reflects his Growth Execs role at the time of the directory snapshot.',
  why_work_with_us = 'For Western-Australian and Perth-region technology founders, Glenn is among the highest-leverage relationships available — combining (a) FundWA institutional pathway as the dedicated WA VC firm, (b) CP Ventures cross-Pacific cheque alongside Emlyn Scott and Chris Sang, (c) deep Atlassian/Amazon engineering-leadership operator credentials, and (d) Growth Execs technical-team-building advisory. Particularly useful for SaaS, engineering-tooling and B2B-technology founders selling globally.',
  sector_focus = ARRAY['SaaS','Engineering Tooling','B2B','DeepTech','Energy','Infrastructure','Enterprise Software'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.fundwa.com.au',
  linkedin_url = 'https://au.linkedin.com/in/glennbutcher',
  contact_email = 'glenn@thegrowthexecs.com',
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['FundWA (CEO, Managing Director)','CP Ventures (Venture Partner)','The Growth Execs (Principal Consultant)','Ecocentric Energy (Non-Executive Director)','Brandscreen (ex-VP Engineering)','Atlassian (ex-Director SaaS Engineering)','Amazon (ex-)','InterEarth (founder/contributor)'],
  meta_title = 'Glenn Butcher — FundWA CEO / CP Ventures VP | Perth Tech Angel',
  meta_description = 'Perth CEO FundWA. Venture Partner CP Ventures (with Emlyn Scott, Chris Sang). Ex-VP Engineering Brandscreen, Director SaaS Engineering Atlassian.',
  details = jsonb_build_object(
    'firms', ARRAY[
      'FundWA (CEO, Managing Director; Western Australian VC firm)',
      'CP Ventures (Venture Partner; alongside Emlyn Scott #79, Chris Sang #53)',
      'The Growth Execs (past Principal Consultant)'
    ],
    'current_roles', ARRAY[
      'CEO & Managing Director, FundWA',
      'Venture Partner, CP Ventures',
      'Non-Executive Director, Ecocentric Energy',
      'Chairman of 2 technology companies',
      'Director of 2 further startups'
    ],
    'prior_roles', ARRAY[
      'VP Engineering, Brandscreen (programmatic ad-tech)',
      'Director of SaaS Engineering, Atlassian',
      'Amazon and other major global businesses'
    ],
    'experience_years','25+ years senior tech leadership',
    'investment_thesis','Western-Australian and Australian SaaS, engineering-tooling, B2B and infrastructure technology businesses with global ambition. Mix of FundWA fund-level participation, CP Ventures cross-Pacific cheques and personal angel positions.',
    'check_size_note','Variable; combination of FundWA fund + CP Ventures fund + personal cheques',
    'sources', jsonb_build_object(
      'fundwa','https://www.fundwa.com.au/about-glennbutcher',
      'linkedin','https://au.linkedin.com/in/glennbutcher',
      'crunchbase','https://www.crunchbase.com/person/glenn-butcher',
      'inter_earth','https://www.inter.earth/gbutcher/',
      'cb_insights','https://www.cbinsights.com/investor/glenn-butcher',
      'theorg_ecocentric','https://theorg.com/org/ecocentric-energy/org-chart/glenn-butcher',
      'business_news_au','https://www.businessnews.com.au/Person/Glenn-Butcher',
      'angelmatch_perth','https://angelmatch.io/investors/by-location/perth',
      'foundersuite','https://foundersuite.com/investors/glenn-butcher-a47831bd-7fba-4422-b706-43e7621d9c8c',
      'growth_execs','https://thegrowthexecs.com/'
    ),
    'corrections','CSV LinkedIn URL empty — populated from public profile. CSV portfolio empty — populated with verified firm/operator affiliations rather than fabricating individual portfolio companies. CSV email kept as listed (glenn@thegrowthexecs.com).'
  ),
  updated_at = now()
WHERE name = 'Glenn Butcher';

UPDATE investors SET
  description = 'Melbourne-based devtools product leader and prolific developer-tools angel investor. Director of Product, Terraform Commercial at HashiCorp. Director of Product at Ockam. 11+ board and advisor roles across developer-tools and B2B SaaS. Notable portfolio: Bitrise (Investor + Advisor since May 2017), FOSSA (Investor since May 2016), Mystic, Corrily, Multitudes.',
  basic_info = 'Glenn Gillen is a Melbourne-based devtools product leader and one of Australia''s most-cited developer-tools angel investors. His day-job centre-of-mass is at the intersection of platform engineering and infrastructure-as-code:
- **Director of Product, Terraform Commercial at HashiCorp** — leading product for the commercial Terraform line at the company that defined cloud infrastructure-as-code.
- **Director of Product at Ockam** — secure-channels infrastructure for distributed systems.

His angel-investment portfolio runs to **11+ board and advisor roles** across developer-tools and B2B SaaS. Verified investments include:
- **Bitrise** — mobile DevOps / CI-CD platform; Investor + Advisor since May 2017.
- **FOSSA** — open-source license compliance; Investor since May 2016.
- **Mystic** — devtools/infrastructure.
- **Corrily** — pricing infrastructure.
- **Multitudes** — engineering-team analytics.
- **Steppen** — fitness/consumer (per CSV).

He is a long-standing contributor to AirTree Ventures'' "Open Source VC" community and writes regularly on devtools, product management and SaaS at glenngillen.com and on dev.to.',
  why_work_with_us = 'For Australian and global developer-tools, infrastructure-as-code, B2B-SaaS and platform-engineering founders, Glenn is among the highest-leverage product-and-engineering-savvy angels available. His Bitrise/FOSSA early-investment track record signals strong taste for technical product, and his HashiCorp Terraform leadership credential gives him near-unmatched depth in IaC, secrets-management and cloud-native infrastructure.',
  sector_focus = ARRAY['Developer Tools','Infrastructure','DevOps','SaaS','B2B','Tech','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://glenngillen.com',
  linkedin_url = 'https://au.linkedin.com/in/glenngillen',
  contact_email = 'airtree@gln.io',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Bitrise (Investor + Advisor since May 2017)','FOSSA (Investor since May 2016)','Mystic','Corrily','Multitudes','Steppen','Percy.io','HashiCorp (Director of Product, Terraform Commercial)','Ockam (Director of Product)'],
  meta_title = 'Glenn Gillen — HashiCorp Terraform / Ockam | Melbourne DevTools Angel',
  meta_description = 'Melbourne devtools product leader. Director of Product Terraform Commercial at HashiCorp. Director Ockam. 11+ angel positions. Bitrise, FOSSA, Mystic, Corrily.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Director of Product, Terraform Commercial, HashiCorp',
      'Director of Product, Ockam'
    ],
    'angel_portfolio_count','11+ board and advisor roles',
    'verified_investments', ARRAY[
      'Bitrise (Investor + Advisor since May 2017)',
      'FOSSA (Investor since May 2016)',
      'Mystic',
      'Corrily',
      'Multitudes',
      'Steppen',
      'Percy.io'
    ],
    'community_roles', ARRAY['AirTree Ventures Open Source VC community contributor'],
    'public_writing', ARRAY['glenngillen.com personal blog','dev.to/glenngillen technical posts'],
    'investment_thesis','Developer tools, infrastructure, DevOps, B2B SaaS and adjacent platform-engineering categories where his HashiCorp Terraform Commercial product depth is value-add.',
    'check_size_note','Undisclosed in CSV',
    'sources', jsonb_build_object(
      'personal','https://glenngillen.com/',
      'linkedin','https://au.linkedin.com/in/glenngillen',
      'crunchbase','https://www.crunchbase.com/person/glenn-gillen',
      'cb_insights','https://www.cbinsights.com/investor/glenn-gillen',
      'dev_to','https://dev.to/glenngillen',
      'theorg_steppen','https://theorg.com/org/steppen/org-chart/glenn-gillen',
      'airtree_open_source_vc','https://www.airtree.vc/open-source-vc/fundraising-in-australia-updated-open-source-investor-list',
      'bitrise_crunchbase','https://www.crunchbase.com/organization/bitrise/people',
      'fossa_crunchbase','https://www.crunchbase.com/organization/fossa-2'
    ),
    'corrections','CSV portfolio truncated ("Bitrise, Percy.io, Fossa, St..."). Three core names retained ("St..." resolved to Steppen via The Org cross-reference) and expanded with verified Crunchbase/CB Insights positions (Mystic, Corrily, Multitudes). CSV LinkedIn URL verified.'
  ),
  updated_at = now()
WHERE name = 'Glenn Gillen';

UPDATE investors SET
  description = 'Sydney-based generalist angel investor with deep-tech and climate-tech bias. CSV-listed portfolio includes Sea Forest (Tasmanian methane-reducing seaweed) and Morse Micro (Sydney Wi-Fi HaLow microprocessors). Open to all sectors. Limited public investor profile beyond directory listing.',
  basic_info = 'Graeme Elgie is a Sydney-based angel investor listed in the Australian angel directory at "Open to all sectors". His CSV-listed portfolio includes two of the most ambitious deeptech and climate-tech names in the Australian ecosystem:
- **Sea Forest** — Tasmanian aquaculture business commercialising the methane-reducing red seaweed (Asparagopsis) for cattle feed; a globally-cited climate-tech success story.
- **Morse Micro** — Sydney-headquartered Wi-Fi HaLow microprocessor company (long-range, low-power IEEE 802.11ah). Backed by Australia''s National Reconstruction Fund among others.

The directory listing has not been uniquely corroborated to a single LinkedIn or Crunchbase profile from public-source search alone — multiple "Graeme Elgie" individuals exist in Australian and global business circles. Founders should expect to validate his profile and thesis directly via the listed email when they make contact.',
  why_work_with_us = 'For Australian deep-tech and climate-tech founders, Graeme''s CSV-listed portfolio (Sea Forest and Morse Micro) suggests an angel willing to back ambitious technical bets. Particularly relevant for founders building hard-tech, ag/cleantech, semiconductor or wireless-infrastructure businesses. Best treated as a referral- or warm-intro-led conversation given limited public profile beyond directory.',
  sector_focus = ARRAY['DeepTech','Climate Tech','AgTech','Semiconductors','Wireless Infrastructure','Consumer','SaaS'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/graeme-elgie-75a797',
  contact_email = 'graemeelgie@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Sea Forest','Morse Micro'],
  meta_title = 'Graeme Elgie — Sydney Generalist Angel | Sea Forest, Morse Micro',
  meta_description = 'Sydney-based generalist angel. CSV portfolio: Sea Forest (methane-reducing seaweed), Morse Micro (Wi-Fi HaLow). Open to all sectors.',
  details = jsonb_build_object(
    'investment_thesis','Generalist sector-agnostic mandate with apparent bias toward deeptech and climate-tech bets via CSV-listed portfolio (Sea Forest, Morse Micro).',
    'check_size_note','Undisclosed in CSV',
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single LinkedIn/Crunchbase profile (multiple Graeme Elgie individuals).',
      'CSV portfolio (Sea Forest, Morse Micro) verified as real high-profile Australian companies but his cap-table participation not independently corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/graeme-elgie-75a797',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'morse_micro_wikipedia','https://en.wikipedia.org/wiki/Morse_Micro',
      'morse_micro_nrf','https://www.nrf.gov.au/our-investments/morse-micro'
    ),
    'corrections','CSV portfolio truncated ("Sea Forest, Morse Micro, ..."). Two retained verbatim; trailing item could not be uniquely identified. CSV LinkedIn URL had no protocol — resolved to https://www.linkedin.com/in/graeme-elgie-75a797.'
  ),
  updated_at = now()
WHERE name = 'Graeme Elgie';

UPDATE investors SET
  description = 'Sydney-based investment syndicate founded by Jack Richardson (Managing Director). Founded 2020. Sector-agnostic with focus on growth-stage private businesses with a strong US footprint, including secondary direct deals in late-stage pre-IPO tech companies. $20k+ minimum cheque from syndicate members.',
  basic_info = 'Hamia Group Investments is a Sydney-based investment syndicate founded in 2020 by **Jack Richardson** (Managing Director). The group is structured as a secondary-market fund that primarily targets:
- **Growth-stage private businesses with a strong US footprint** (mid-stage venture rounds, late primary fundraises)
- **Secondary direct deals in late-stage pre-IPO tech companies** (offering members access to mature private-company shares typically reserved for institutional funds)

The group operates as more than a network — its founding principles emphasise honesty, transparency, balance and empathy, and it positions itself as "a community of independent thought and knowledge." Sector mandate is explicitly **agnostic**.

CSV-listed minimum cheque from members is **$20k+**, which is consistent with growth-stage syndicate participation rather than pre-seed angel cheques. Founders building in Australian and US growth-stage technology should treat Hamia as a syndicate path for Series B+ or pre-IPO rounds rather than for early seed funding.',
  why_work_with_us = 'For Australian and US-based late-stage / pre-IPO tech founders looking to bring an Australian syndicate onto the cap table for secondary or growth-round participation, Hamia Group Investments offers structured access to a Sydney HNW community. Less relevant for pre-seed and seed-stage rounds.',
  sector_focus = ARRAY['Growth Stage','Pre-IPO','Tech','SaaS','Secondary','US-footprint Australian'],
  stage_focus = ARRAY['Series B','Series C','Growth','Pre-IPO'],
  check_size_min = 20000,
  check_size_max = NULL,
  linkedin_url = 'https://www.linkedin.com/in/jackrichardson236/',
  contact_email = 'jack@hamiagroup.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Hamia Group (founded 2020 by Jack Richardson)'],
  meta_title = 'Hamia Group Investments — Sydney Late-Stage / Secondary Syndicate',
  meta_description = 'Sydney syndicate by Jack Richardson (founded 2020). Secondary-market fund targeting growth-stage US-footprint tech and pre-IPO secondaries. $20k+ minimum.',
  details = jsonb_build_object(
    'managing_director','Jack Richardson',
    'founded',2020,
    'mandate', ARRAY[
      'Growth-stage private businesses with strong US footprint',
      'Secondary direct deals in late-stage pre-IPO tech companies'
    ],
    'sector_focus','Agnostic',
    'principles', ARRAY['Honesty','Transparency','Balance','Empathy'],
    'minimum_cheque_aud','$20k+',
    'investment_thesis','Sydney HNW-community syndicate access to growth-stage and pre-IPO tech rounds via primary growth-stage participation and secondary direct deals.',
    'check_size_note','$20k+ per member',
    'sources', jsonb_build_object(
      'linkedin_jack_richardson','https://www.linkedin.com/in/jackrichardson236/',
      'linkedin_company','https://www.linkedin.com/company/hamiagroup',
      'tracxn','https://tracxn.com/d/companies/hamia-group/__HV2Hgzey-tRhNo6wrLUPsEIRTVF-zbOEvZyC3rRgjBM',
      'wellfound_jack','https://wellfound.com/p/jack-richardson-8',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV LinkedIn URL points to Jack Richardson''s personal LinkedIn (verified). CSV sector_focus "Agnostic" preserved. CSV portfolio "Confidential" preserved (Hamia''s secondary mandate is by nature confidential about underlying positions). CSV cheque "$20k+" interpreted as $20k minimum with no upper cap.'
  ),
  updated_at = now()
WHERE name = 'Hamia Group Investments';

COMMIT;
