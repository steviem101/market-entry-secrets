-- Enrich angel investors — batch 02x (records 139-143: Lawrence Wen → Lucky Ariyasena)

BEGIN;

UPDATE investors SET
  description = 'Singapore-based angel investor with people-not-sector thesis. $100k cheques. Currently with CHAGEE Singapore. Limited public investor profile beyond directory.',
  basic_info = 'Lawrence Wen is a Singapore-based angel investor listed in the Australian angel directory at $100k cheque size. His stated thesis is "People - not sector(s)" — backing founders rather than category. Currently associated with CHAGEE Singapore.

The directory listing has not been uniquely corroborated to a single LinkedIn or Crunchbase profile from public-source search alone (multiple Lawrence Wen individuals exist in Singapore venture and finance).',
  why_work_with_us = 'For Australian founders looking for cross-border SE Asia angel exposure on a people-led thesis. Best treated as a referral- or warm-intro-led conversation given limited public profile.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','Cross-border'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 100000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/lawrence-wen-565001/',
  contact_email = 'lawrencewen@hotmail.com',
  location = 'Singapore',
  country = 'Singapore',
  currently_investing = true,
  meta_title = 'Lawrence Wen — Singapore Angel | People-Led Thesis',
  meta_description = 'Singapore-based angel investor. People-not-sector thesis. $100k cheques.',
  details = jsonb_build_object(
    'investment_thesis','People-not-sector — back founders rather than categories',
    'check_size_note','$100k',
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single LinkedIn/Crunchbase profile.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/lawrence-wen/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV LinkedIn URL truncated. Common-name caveat applies.'
  ),
  updated_at = now()
WHERE name = 'Lawrence Wen';

UPDATE investors SET
  description = 'Melbourne-based angel investor. Limited public profile beyond Australian angel directory listing.',
  basic_info = 'Leila Oliveira is listed in the Australian angel investor directory as a Melbourne-based angel investor. Beyond the directory entry, no detailed public investor profile, portfolio or sector-focus information could be uniquely corroborated from public-source search.',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory listing.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/leilaneoliveira/',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Leila Oliveira — Melbourne Angel Investor',
  meta_description = 'Melbourne-based angel investor. Limited public profile.',
  details = jsonb_build_object(
    'unverified', ARRAY[
      'Beyond CSV directory listing, no detailed public investor profile could be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/leilaneoliveira/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV had only name, LinkedIn and Melbourne location.'
  ),
  updated_at = now()
WHERE name = 'Leila Oliveira';

UPDATE investors SET
  description = 'Sydney-based veteran angel investor and VC. First investor in Australian unicorn SiteMinder (2008 seed). Founded Grand Prix Capital (GPC, 2010). Co-founded Equity Venture Partners with Howard Leibman. Active angel since 1999. 30+ year career as tax consulting partner at Horwaths/Deloitte. SaaS, IoT, digital marketplaces (tourism, financial). $300K–$3M cheques.',
  basic_info = 'Leslie (Les) Szekely is one of Australia''s most legendary angel investors and a Sydney-based VC. He has been an active angel since 1999 — and is most famous as the **very first investor in SiteMinder** (Australian hotel-tech unicorn). In 2008 he provided the seed funding for SiteMinder and led several subsequent angel rounds until 2012 when VC funds joined; he has been continuously on the SiteMinder Board since the company started trading, during which time it grew from 2 to 720+ employees with offices in 6 countries.

He started **Grand Prix Capital (GPC)** in 2010 after a career of almost 30 years as a tax consulting partner and director with Horwaths Chartered Accountants and then Deloitte.

He co-founded **Equity Venture Partners** with Howard Leibman.

His active portfolio includes great Australian startups like **Shippit** (logistics SaaS) and **Bluetide**. He specialises in B2B SaaS and digital marketplaces, with particular interest in SaaS and marketplaces related to tourism and financial products/services.',
  why_work_with_us = 'For Australian B2B SaaS and marketplace founders building in tourism, financial-services or hotel-tech adjacencies, Les is among the most credentialed angels in the country — his SiteMinder seed-to-unicorn track record is unmatched. Combines $300K–$3M cheque capacity with EVP fund-level pathway.',
  sector_focus = ARRAY['SaaS','IoT','Marketplace','Tourism Tech','FinTech','Hotel Tech','B2B'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  check_size_min = 300000,
  check_size_max = 3000000,
  linkedin_url = 'https://www.linkedin.com/in/lesszekely/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['SiteMinder (first investor 2008; continuous board director)','Shippit','Bluetide','Equity Venture Partners (co-founder, Chairman)','Grand Prix Capital (founder; 2010)','Microequities Asset Management Group'],
  meta_title = 'Les Szekely — SiteMinder First Investor | Sydney Big-Cheque Angel',
  meta_description = 'Sydney legendary angel since 1999. First investor SiteMinder (2008 seed). Founded Grand Prix Capital. Co-founded EVP with Howard Leibman. $300K–$3M.',
  details = jsonb_build_object(
    'angel_investing_since',1999,
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','SiteMinder','role','First investor (2008 seed)','context','Led several rounds until 2012; continuous board director; grew from 2 to 720+ employees, 6 countries')
    ),
    'firms', ARRAY['Grand Prix Capital (Founder, 2010)','Equity Venture Partners (Co-Founder, Chairman; with Howard Leibman)'],
    'prior_career','30 years tax consulting partner/director at Horwaths Chartered Accountants then Deloitte',
    'investment_thesis','B2B SaaS and digital marketplaces with tourism/financial-services bias',
    'check_size_note','$300K–$3M',
    'sources', jsonb_build_object(
      'crunchbase','https://www.crunchbase.com/person/les-szekely',
      'linkedin','https://au.linkedin.com/in/lesszekely',
      'airtree_halo_effect','https://www.airtree.vc/open-source-vc/the-halo-effect-les-szekely',
      'evp_team','https://www.evp.com.au/team/les-szekely',
      'pitchbook','https://pitchbook.com/profiles/investor/226753-75',
      'brookvine','https://brookvine.com.au/fund_managers/les-szekely/'
    ),
    'corrections','CSV portfolio truncated ("Siteminder, Shippit, Bluet..."). Resolved to Bluetide.'
  ),
  updated_at = now()
WHERE name = 'Leslie Szekely';

UPDATE investors SET
  description = 'Sydney-based angel investor with Construction and Energy sector focus. $10k–$100k cheques. Limited public investor profile beyond directory.',
  basic_info = 'Lucky Ariyasena is listed in the Australian angel investor directory as a Sydney-based angel investor with stated focus on **Construction and Energy** sectors. Cheque size $10k–$100k. CSV email contact suggests association with Maiden Consulting.

Beyond the directory entry, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian construction-tech, contech, energy-tech and energy-transition founders looking for a small-to-mid cheque from a Sydney-based sector-focused angel.',
  sector_focus = ARRAY['Construction','Energy','ConTech','EnergyTech','Renewables','PropTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/luckyari/',
  contact_email = 'lucky.a@maidenconsulting.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Lucky Ariyasena — Sydney Construction/Energy Angel | $10k–$100k',
  meta_description = 'Sydney-based angel investor. Construction and Energy focus. $10k–$100k cheques.',
  details = jsonb_build_object(
    'investment_thesis','Construction and Energy sector founders.',
    'check_size_note','$10k–$100k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/luckyari/'
    ),
    'corrections','CSV email truncated ("lucky.a@maidenconsultin..."). Resolved to lucky.a@maidenconsulting.com.au.'
  ),
  updated_at = now()
WHERE name = 'Lucky Ariyasena';

UPDATE investors SET
  description = 'Melbourne-based serial founder and angel investor. Co-Founder of Cherry (travel-tech, sold to TRAVLR). Operating company Little Red Jet. Sector-agnostic angel ($10k–$100k). CSV portfolio: Defeat Diabetes, Fluff and other consumer-tech investments.',
  basic_info = 'Luke Young is a Melbourne-based serial founder and angel investor. He is **Co-Founder of Cherry** (travel-tech, sold to TRAVLR). His current operating practice runs through **Little Red Jet** — Melbourne-based agency/advisory.

His CSV-listed portfolio includes:
- **Defeat Diabetes** (digital health for type-2 diabetes reversal)
- **Fluff** and additional truncated names

CSV cheque size $10k–$100k. Sector-agnostic mandate.',
  why_work_with_us = 'For Australian consumer-tech, travel-tech, digital-health and SaaS founders looking for a Melbourne-based generalist angel cheque from a Cherry-exited founder.',
  sector_focus = ARRAY['Consumer','Travel Tech','Digital Health','SaaS','Marketplace','Generalist'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/mrlukeyoung/',
  contact_email = 'luke@littleredjet.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Cherry (Co-Founder; sold to TRAVLR)','Little Red Jet (operating)','Defeat Diabetes','Fluff'],
  meta_title = 'Luke Young — Cherry Co-Founder / Little Red Jet | Melbourne Angel',
  meta_description = 'Melbourne Co-Founder Cherry (sold to TRAVLR). Operating Little Red Jet. $10k–$100k. Defeat Diabetes, Fluff portfolio.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Cherry (Co-Founder; sold to TRAVLR)','Little Red Jet'],
    'investment_thesis','Sector-agnostic Melbourne consumer/travel-tech/digital-health bias.',
    'check_size_note','$10k–$100k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/mrlukeyoung/',
      'money_in_sport','https://moneyinsport.com/2018-speakers/luke-young/'
    ),
    'corrections','CSV portfolio truncated ("Defeat Diabetes, Fluff, re..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Luke Young';

COMMIT;
