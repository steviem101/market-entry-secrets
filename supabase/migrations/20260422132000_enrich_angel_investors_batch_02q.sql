-- Enrich angel investors — batch 02q (records 104-108: Ilan Israelstam → Jaffly Chen)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based serial fintech entrepreneur. Co-Founder of BetaShares ETFs (founded 2009; $40B+ AUM, 1M+ clients, 150+ team). Principal at Apex Capital Partners (financial-services VC). Ex-Boston Consulting Group Sydney + NY (Financial Services practice). UNSW Bachelor of Commerce and Laws. $50k–$100k cheques.',
  basic_info = 'Ilan Israelstam is a Sydney-based investing expert and Australian serial entrepreneur. He is **Co-Founder of BetaShares ETFs** — the locally-born Australian ETF manager he helped grow since 2009 to **$40B+ AUM, 1 million+ clients and 150+ team members**, making it one of Australia''s most successful financial-services scale-up stories.

He is also a **Principal at Apex Capital Partners**, an investment firm providing venture capital to founders revolutionising the financial-services landscape.

Earlier in his career he spent time at **Boston Consulting Group** (Sydney and New York, Financial Services practice) and helped found a technology-oriented venture-capital firm. He has 15+ years focused on financial services and the start-up space.

His angel portfolio includes pre-seed to Series B investments in **Safewill** (will/estate-planning fintech), **Pushas** (sneaker authentication marketplace) and **Consumer Physics** (CSV-listed as Zelle...). He holds a Bachelor of Commerce and Laws from the University of New South Wales.',
  why_work_with_us = 'For Australian fintech and financial-services founders, Ilan is among the most credentialed angels in the country — combining BetaShares operating credentials at $40B+ AUM with Apex Capital Partners institutional pathway and BCG financial-services advisory depth.',
  sector_focus = ARRAY['FinTech','Financial Services','SaaS','InsurTech','RegTech','Consumer','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A','Series B'],
  check_size_min = 50000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/ilan-israelstam/',
  contact_email = 'ilanisraelstam@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['BetaShares ETFs (Co-Founder; $40B+ AUM)','Apex Capital Partners (Principal)','Safewill','Pushas','Consumer Physics'],
  meta_title = 'Ilan Israelstam — BetaShares Co-Founder | Sydney FinTech Angel',
  meta_description = 'Sydney Co-Founder BetaShares ETFs ($40B+ AUM). Principal Apex Capital Partners. Ex-BCG. Safewill, Pushas, Consumer Physics. $50k–$100k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['BetaShares ETFs (2009 Co-Founder)'],
    'current_roles', ARRAY[
      'Co-Founder & Group Head, BetaShares Direct, BetaShares ETFs',
      'Principal, Apex Capital Partners (financial-services VC)'
    ],
    'betashares_stats', jsonb_build_object(
      'founded',2009,
      'aum_aud','$40B+',
      'clients','1,000,000+',
      'team','150+'
    ),
    'prior_roles', ARRAY[
      'Boston Consulting Group (Sydney + New York, Financial Services practice)',
      'Co-founder of a technology-oriented venture-capital firm (early career)'
    ],
    'education', ARRAY['Bachelor of Commerce and Laws, UNSW'],
    'experience_years','15+ years financial services and startups',
    'verified_angel_portfolio', ARRAY['Safewill','Pushas','Consumer Physics'],
    'check_size_note','$50k–$100k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/ilan-israelstam',
      'crunchbase','https://www.crunchbase.com/person/ilan-israelstam',
      'betashares','https://www.betashares.com.au/insights/author/ilanisraelstam/',
      'livewire','https://www.livewiremarkets.com/contributors/ilan-israelstam',
      'general_assembly','https://generalassemb.ly/instructors/ilan-israelstam/17985',
      'theorg','https://theorg.com/org/betashares-etfs/org-chart/ilan-israelstam',
      'morningstar','https://www.morningstar.com.au/insights/author/Q7F7GI5TELFN6F76F6PRNOMAXU/ilan-israelstam',
      'equitymates','https://equitymates.com/episode/expert-investor-ilan-israelstam-betashares/'
    ),
    'corrections','CSV portfolio "BetaShares, Athena, Zelle..." — BetaShares is his own founder company; Athena likely refers to Athena Home Loans (could not be uniquely corroborated as personal angel); Zelle... resolved to Consumer Physics per Apex Capital Partners reference. Verified Safewill and Pushas as personal angel investments.'
  ),
  updated_at = now()
WHERE name = 'Ilan Israelstam';

UPDATE investors SET
  description = 'Melbourne-based angel investor network focused on social and environmental impact. $100K syndicate cheques. Limited public profile beyond Australian angel directory listing.',
  basic_info = 'Impact Angel Network is listed in the Australian angel investor directory as a Melbourne-based angel-investor network with explicit focus on **social and environmental impact** investments. The directory entry references a $100K typical cheque size.

The network operates within Melbourne''s broader impact-investing ecosystem, which includes Ecotone Ventures (record #74), the LaunchVic Climate Angel Network, and other social-enterprise-focused investor groups. Beyond the directory entry, detailed information about Impact Angel Network''s structure, lead investors, portfolio companies and current activity could not be uniquely corroborated from public-source search.

Founders should expect to validate the connection directly through warm introduction to one of the Melbourne impact-investing community leaders rather than rely on a public-source track record.',
  why_work_with_us = 'For Melbourne-based purposeful, social-enterprise and environmental-impact founders, Impact Angel Network represents a thematic-angel pathway within the broader Victorian impact-investing ecosystem. Best treated as a referral- or warm-intro-led conversation.',
  sector_focus = ARRAY['Impact','Social Enterprise','Sustainability','Climate','Environmental','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 100000,
  check_size_max = 100000,
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  meta_title = 'Impact Angel Network — Melbourne Social/Environmental Impact Angel',
  meta_description = 'Melbourne angel network for social and environmental impact ventures. $100K syndicate cheques.',
  details = jsonb_build_object(
    'investment_thesis','Social and environmental impact-focused Australian early-stage businesses.',
    'check_size_note','$100K',
    'unverified', ARRAY[
      'Beyond CSV directory listing, structure, lead investors, portfolio companies and current activity could not be uniquely corroborated from public-source search.'
    ],
    'related_networks', ARRAY['Ecotone Ventures (record #74)','LaunchVic Climate Angel Network'],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'launchvic_climate_angel_network','https://launchvic.org/programs/climate-angel-network/'
    ),
    'corrections','CSV had only name, Melbourne, sector_focus and $100K cheque size. No LinkedIn, no email, no portfolio. Conservative entry per data limitations.'
  ),
  updated_at = now()
WHERE name = 'Impact Angel Network';

UPDATE investors SET
  description = 'Canberra-based angel investor with deep-tech preference. CSV-listed portfolio includes Quantum Brilliance (ANU spinoff diamond-quantum-computer company; ~$77M total raised). Sector focus on deep tech and emerging-research commercialisation.',
  basic_info = 'Irene Zhen is a Canberra-based angel investor with an explicit deep-tech preference. Her CSV-listed portfolio reflects this thematic focus:
- **Quantum Brilliance** — Australian-German deep-tech startup spun out of the **Australian National University** (ANU), commercialising room-temperature quantum computers powered by synthetic diamond. The company has raised approximately **$77.7M total** across 4 rounds from 16 investors including Main Sequence, Investible and others; raised $9.7M Seed in 2021 and a further $26M+ since.
- Additional portfolio name **Proc...** truncated in CSV — could not be uniquely corroborated.

The directory listing has not been uniquely corroborated to a single LinkedIn or Crunchbase profile from public-source search alone (multiple "Irene Zhen" individuals exist). Founders should expect to validate the connection directly via the listed LinkedIn URL.',
  why_work_with_us = 'For ACT and Capital Region deep-tech, quantum-computing, advanced-materials and ANU-spinoff founders, Irene''s Quantum Brilliance position signals a willingness to back ambitious technical bets. Particularly relevant for Canberra-region founders.',
  sector_focus = ARRAY['DeepTech','Quantum','Advanced Materials','ANU Spinoffs','Research Commercialisation','Hard Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/irene-zhen/',
  location = 'Canberra, ACT',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Quantum Brilliance'],
  meta_title = 'Irene Zhen — Canberra DeepTech Angel | Quantum Brilliance',
  meta_description = 'Canberra-based deep-tech angel investor. Notable: Quantum Brilliance (ANU diamond-quantum spinoff, $77M+ raised).',
  details = jsonb_build_object(
    'investment_thesis','Deep-tech preference; emerging-research commercialisation; ANU-spinoff bias.',
    'highlight_investment', jsonb_build_object(
      'company','Quantum Brilliance',
      'category','Diamond quantum-computing',
      'origin','ANU spinoff',
      'total_raised_aud','~$77.7M',
      'co_investors',ARRAY['Main Sequence','Investible']
    ),
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single LinkedIn/Crunchbase profile.',
      'CSV portfolio "Proc..." was truncated and could not be uniquely identified.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/irene-zhen/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'quantum_brilliance_crunchbase','https://www.crunchbase.com/organization/quantum-brilliance',
      'quantum_brilliance_acs','https://membership.acs.org.au/member-insight/2021-09-01-Local-Canberra-startup-company-Quantum-Brilliance.html',
      'quantum_brilliance_cb_insights','https://www.cbinsights.com/company/quantum-brilliance'
    ),
    'corrections','CSV portfolio truncated. Quantum Brilliance retained as verified portfolio entry; trailing item flagged in unverified.'
  ),
  updated_at = now()
WHERE name = 'Irene Zhen';

UPDATE investors SET
  description = 'Melbourne-based angel investor associated with Shinjuku Group. Sector-agnostic mandate. Limited public investor profile beyond directory listing and Melbourne Angels LP affiliation.',
  basic_info = 'Jacob Kino is a Melbourne-based angel investor with a sector-agnostic stance per the Australian angel directory. He is associated with the **Shinjuku Group** in the Greater Melbourne Area, and is listed as an LP-affiliate at **Melbourne Angels** — one of Victoria''s most established angel-investor groups.

His public profile on LinkedIn describes him as an experienced IT professional and founder with experience working across SMB and enterprise sectors. His direct angel-investment track record beyond the Melbourne Angels LP affiliation could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Melbourne and Victorian early-stage founders, Jacob offers a small first cheque alongside Melbourne Angels community visibility through his LP affiliation. Best treated as a referral- or warm-intro-led conversation.',
  sector_focus = ARRAY['SaaS','IT','Enterprise Software','SMB','Consumer','Generalist'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/jacobkino/',
  contact_email = 'jacob@shinjukugroup.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Shinjuku Group','Melbourne Angels (LP)'],
  meta_title = 'Jacob Kino — Shinjuku Group | Melbourne Sector-Agnostic Angel',
  meta_description = 'Melbourne-based angel investor associated with Shinjuku Group. Melbourne Angels LP. Sector-agnostic.',
  details = jsonb_build_object(
    'firm','Shinjuku Group',
    'angel_network','Melbourne Angels (LP)',
    'investment_thesis','Sector-agnostic Melbourne early-stage angel investing.',
    'unverified', ARRAY[
      'Beyond Melbourne Angels LP affiliation, individual angel-investment track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/jacobkino/',
      'melbourne_angels_investors','https://melbourneangels.com/investors/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'angelmatch_melbourne','https://angelmatch.io/investors/by-location/melbourne'
    ),
    'corrections','CSV email truncated ("jacob@shinjukugroup.co..."). Resolved to jacob@shinjukugroup.com.au. CSV LinkedIn URL empty — populated from public profile.'
  ),
  updated_at = now()
WHERE name = 'Jacob Kino';

UPDATE investors SET
  description = 'Sydney-based medical doctor turned strategy consultant and angel investor. Medical Doctor (MBBS, MPH, MHM, MGA). Founder of LyfVR (digital health social enterprise — virtual reality for senior aged-care residents). Health10X Mentor at UNSW Founders. Ex-Bain & Company, Australian Digital Health Agency, NSW Health.',
  basic_info = 'Dr Jaffly Chen is a Sydney-based medical doctor who has crossed over into strategy consulting and angel investing. He holds an MBBS from the University of Newcastle / University of New England Joint Medical Program, plus Masters in Public Health, Health Management and Global Affairs.

He is the **Founder of LyfVR**, a digital-health social enterprise that delivers virtual-reality experiences to residential aged-care homes — engaging nostalgic memories and creating new ones for senior citizens. LyfVR currently serves residential aged-care homes in the Orange (NSW) area.

He is currently a **Health10X Mentor at UNSW Founders** — UNSW''s healthtech accelerator program — and brings prior experience from:
- **Ultraviolet Ventures**
- **NSW Health**
- **Australian Digital Health Agency** (Digital Health Adviser)
- **Bain & Company**

He is a **Westpac Scholar** and an alumnus of Sydney School of Entrepreneurship.',
  why_work_with_us = 'For Australian healthtech, digital-health, aged-care-tech and social-enterprise founders, Jaffly is one of the most credentialed clinician-investors in the Sydney scene — combining medical-doctor authority, Bain strategy chops, NSW Health and Australian Digital Health Agency network, and UNSW Founders Health10X Mentor visibility.',
  sector_focus = ARRAY['HealthTech','Digital Health','Aged Care Tech','VR/AR Health','MedTech','Social Enterprise'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://jaffly.com',
  linkedin_url = 'https://www.linkedin.com/in/jafflychen/',
  contact_email = 'hello@jaffly.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['LyfVR (founder; digital-health social enterprise)','UNSW Founders Health10X (Mentor)','Ultraviolet Ventures','Australian Digital Health Agency (Digital Health Adviser)','NSW Health','Bain & Company (alumnus)'],
  meta_title = 'Jaffly Chen — LyfVR founder / Bain alumnus | Sydney HealthTech Angel',
  meta_description = 'Sydney medical doctor (MBBS) turned strategy/angel investor. Founder LyfVR. Health10X Mentor UNSW Founders. Ex-Bain, ADHA, NSW Health.',
  details = jsonb_build_object(
    'credentials', ARRAY[
      'MBBS (University of Newcastle / University of New England Joint Medical Program)',
      'MPH (Masters in Public Health)',
      'MHM (Masters in Health Management)',
      'MGA (Masters in Global Affairs)'
    ],
    'founder_of', ARRAY['LyfVR (digital-health social enterprise; VR for aged-care residents)'],
    'current_roles', ARRAY[
      'Health10X Mentor, UNSW Founders',
      'Strategy Consultant',
      'Angel Investor',
      'Founder, LyfVR'
    ],
    'prior_roles', ARRAY[
      'Bain & Company',
      'Australian Digital Health Agency (Digital Health Adviser)',
      'NSW Health',
      'Ultraviolet Ventures'
    ],
    'recognition', ARRAY['Westpac Scholar','Sydney School of Entrepreneurship alumnus'],
    'investment_thesis','Healthtech, digital-health, aged-care-tech and social-enterprise founders where his medical-doctor + strategy-consultant + government-health-network combination adds value.',
    'sources', jsonb_build_object(
      'website','https://jaffly.com/',
      'linkedin','https://au.linkedin.com/in/jafflychen',
      'newcastle_uni','https://www.newcastle.edu.au/engage/business-and-industry/integrated-innovation-network-i2n/startups-and-scaleups/jaffly-chen',
      'angelmatch','https://angelmatch.io/investors/jaffly-chen',
      'westpac_scholars','https://scholars.westpacgroup.com.au/Scholars/Profile?Id=3347',
      'rocketreach_unsw','https://rocketreach.co/jaffly-chen-email_110726387',
      'adha_advisor','https://www.digitalhealth.gov.au/about-us/organisational-structure/digital-health-advisers/dr-jaffly-chen'
    ),
    'corrections','CSV name "Jaffy Chen" — public-source spelling is "Jaffly Chen" (resolved). CSV LinkedIn URL points to jafflychen (verified).'
  ),
  updated_at = now()
WHERE name = 'Jaffy Chen';

COMMIT;
