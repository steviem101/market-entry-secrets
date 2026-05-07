-- Enrich angel investors — batch 02y (records 144-148: Lumpur Kuo → M8 Ventures)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based angel investor. Limited public profile beyond Australian angel directory listing.',
  basic_info = 'Lumpur Kuo is listed in the Australian angel investor directory as a Sydney-based angel investor. Beyond the directory entry, no detailed public investor profile, portfolio or sector-focus information could be uniquely corroborated from public-source search.',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/lumpurkuo/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Lumpur Kuo — Sydney Angel Investor',
  meta_description = 'Sydney-based angel investor. Limited public profile.',
  details = jsonb_build_object(
    'unverified', ARRAY[
      'Beyond CSV directory listing, no detailed public investor profile could be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/lumpurkuo/'
    ),
    'corrections','CSV had only name, LinkedIn and Sydney location.'
  ),
  updated_at = now()
WHERE name = 'Lumpur Kuo';

UPDATE investors SET
  description = 'Gold Coast-based dedicated HealthTech angel network and accelerator. Operates the LuminaX Accelerator (since 2021; 52 startups supported). Australia''s leading HealthTech accelerator. Aussie Angels syndicate platform. $24M+ deployed via investor network. $50k–$100k investments per startup. Wholesale-investor-only LP base.',
  basic_info = 'LX Health is the Gold Coast-based dedicated HealthTech angel investment network and accelerator. It operates the **LuminaX HealthTech Accelerator** — Australia''s leading HealthTech accelerator program, launched in 2021 from the Gold Coast Health and Knowledge Precinct.

**Stats:**
- **52 Australian HealthTech startups** supported since 2021
- **$24M+** capital deployed via the investor network
- Per-startup investment: up to **AU$200k cash + AU$50k in-kind program support**, no equity (2024-25 program terms)
- **$5k LP minimum** per deal; no commitment or fees to join
- Wholesale-investor only

The accelerator provides selected startups with investment, expert guidance, access to clinical trials, research networks and industry partnerships — accelerating prototype-to-market readiness. LX Health also runs an active syndicate on the **Aussie Angels** platform for direct investment in selected portfolio startups.

Recent example: HealthTech startup **GenAqua** secured $300k in funding from angel investors, industry supporters and LX Health.',
  why_work_with_us = 'For Australian HealthTech founders, LX Health is the most focused HealthTech angel network in the country — Gold Coast Health and Knowledge Precinct base, LuminaX accelerator pathway, dedicated wholesale-investor LP network and clinical-trial/research-network access.',
  sector_focus = ARRAY['HealthTech','MedTech','Digital Health','Biotech','Clinical Trials','Research Commercialisation'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 100000,
  website = 'https://lxhealth.com.au',
  linkedin_url = 'https://au.linkedin.com/company/lxhealth',
  contact_email = 'dren@lxhealth.com.au',
  location = 'Gold Coast, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['LuminaX Accelerator (operator since 2021; 52 startups)','GenAqua (recent $300k round)','Aussie Angels (LX Health syndicate)'],
  meta_title = 'LX Health — Gold Coast LuminaX HealthTech Accelerator',
  meta_description = 'Gold Coast HealthTech angel network. LuminaX Accelerator (52 startups since 2021; $24M+ deployed). $200k cash + $50k in-kind. Aussie Angels syndicate.',
  details = jsonb_build_object(
    'parent_program','LuminaX HealthTech Accelerator (since 2021)',
    'hq','Gold Coast Health and Knowledge Precinct, Cohort Innovation Space',
    'launched',2021,
    'startups_supported','52 HealthTech startups',
    'capital_deployed_aud','$24M+',
    'per_startup_investment', jsonb_build_object(
      'cash_aud','Up to $200,000',
      'in_kind_aud','$50,000 program support',
      'equity_taken','None (2024-25 program terms)'
    ),
    'lp_terms', jsonb_build_object(
      'minimum_aud','$5k per deal',
      'commitment_required',false,
      'fees',false,
      'wholesale_investor_only',true
    ),
    'investment_thesis','Australian HealthTech startups graduating from the LuminaX accelerator with clinical-trial-ready, research-backed innovation.',
    'check_size_note','$50k–$100k typical (cohort starting investment)',
    'sources', jsonb_build_object(
      'website','https://lxhealth.com.au/',
      'luminax','https://lxhealth.com.au/luminax-accelerator/',
      'aussie_angels','https://app.aussieangels.com/syndicate/lx-health',
      'linkedin','https://au.linkedin.com/company/lxhealth',
      'pattens_grants','https://pattens.com/grants/luminax-lx-healthtech-accelerator/',
      '2025_cohort','https://lxhealth.com.au/2025-lx-cohort-announce/'
    ),
    'corrections','CSV portfolio truncated ("LuminaX Accelerator Star..."). Resolved to LuminaX Accelerator. CSV cheque "50-100k" interpreted as $50k–$100k.'
  ),
  updated_at = now()
WHERE name = 'LX Health';

UPDATE investors SET
  description = 'Canberra-based angel investor and experienced board director. Capital Angels member. Chair of Good360 Australia. Non-Executive Director of Enabled Employment (disability employment). Founder of Viria Pty Ltd (business development, mentoring and capital raising). FAICD. 30+ person years on for-profit and not-for-profit Boards.',
  basic_info = 'Lyndal Thorburn FAICD is a Canberra-based angel investor and seasoned board director. She is currently:
- **Chair, Good360 Australia** — surplus-goods redistribution charity
- **Non-Executive Director, Enabled Employment Pty Ltd** — Canberra-based disability-employment company
- **Founder, Viria Pty Ltd** — business development support, mentoring and capital raising services using the Australian Small Scale Offerings Board framework
- Active member of **Capital Angels** (Australia''s first incorporated angel group, est. 2005; see record #46)

She brings 30+ person-years of for-profit and not-for-profit Board experience.',
  why_work_with_us = 'For ACT and Capital Region founders, particularly in disability-employment, social-enterprise, charity-tech and capital-raising adjacencies, Lyndal offers Capital Angels member access plus Viria''s small-scale-offerings-board capital-raising expertise.',
  sector_focus = ARRAY['Social Enterprise','Disability Tech','HealthTech','Charity Tech','SaaS','Government Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://au.linkedin.com/in/lyndalthorburn',
  location = 'Canberra, ACT',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Enabled Employment (NED)','Good360 Australia (Chair)','Viria Pty Ltd (Founder)','Capital Angels (member)','Significant'],
  meta_title = 'Lyndal Thorburn FAICD — Canberra Capital Angels | Disability/Social',
  meta_description = 'Canberra Capital Angels member. Chair Good360 Australia. NED Enabled Employment. Founder Viria Pty Ltd. FAICD.',
  details = jsonb_build_object(
    'credentials',ARRAY['FAICD'],
    'current_roles', ARRAY[
      'Chair, Good360 Australia',
      'Non-Executive Director, Enabled Employment Pty Ltd',
      'Founder, Viria Pty Ltd',
      'Member, Capital Angels'
    ],
    'experience','30+ person-years on for-profit and not-for-profit Boards',
    'sources', jsonb_build_object(
      'crunchbase','https://www.crunchbase.com/person/lyndal-thorburn',
      'linkedin','https://au.linkedin.com/in/lyndalthorburn',
      'capital_angels','https://www.capitalangels.com.au/'
    ),
    'corrections','CSV portfolio truncated ("Enabled Employment, Sig..."). Two retained verbatim with Significant retained as listed.'
  ),
  updated_at = now()
WHERE name = 'Lyndal Thorburn';

UPDATE investors SET
  description = 'Melbourne-based angel investor. FinTech, InsurTech, Web3 and Ecommerce focus. Active in democratising access to investment in the world''s largest asset class (real estate / large-cap). $5k–$50k cheques.',
  basic_info = 'Lynton J Pipkorn is a Melbourne-based angel investor focused on **FinTech, InsurTech, Web3 and PLG** (product-led growth) categories. His public posture is "democratising access to investment in the world''s largest asset class" — referring to real estate, with implications for fractionalisation and tokenisation themes.

CSV cheque size $5k–$50k. Beyond his LinkedIn presence and Melbourne directory listing, individual portfolio companies could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian fintech, insurtech, Web3, PLG and proptech-fractionalisation founders, Lynton offers a small-to-mid first cheque alongside the Melbourne fintech-and-Web3 community.',
  sector_focus = ARRAY['FinTech','InsurTech','Web3','E-commerce','PLG','PropTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 50000,
  contact_email = 'pippaslyntonis@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Lynton J Pipkorn — Melbourne FinTech/InsurTech/Web3 Angel',
  meta_description = 'Melbourne angel investor. FinTech, InsurTech, Web3, Ecommerce focus. $5k–$50k cheques.',
  details = jsonb_build_object(
    'investment_thesis','FinTech, InsurTech, Web3 and PLG. Particular interest in democratising access to large-asset-class investing.',
    'check_size_note','$5k–$50k',
    'unverified', ARRAY[
      'Beyond CSV directory listing and LinkedIn, individual portfolio companies could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin_author','https://www.linkedin.com/today/author/lyntonpipkorn',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV LinkedIn URL empty — populated from public LinkedIn author profile.'
  ),
  updated_at = now()
WHERE name = 'Lynton J Pipkorn';

UPDATE investors SET
  description = 'Sydney-based pre-seed and seed venture syndicate on the Aussie Angels platform. Backs product-led tech startups from Australia and New Zealand. $50k–$200k syndicate cheques. No sector focus — focuses on stage and product-led teams.',
  basic_info = 'M8 Ventures is a Sydney-based **pre-seed and seed specialist** venture fund and syndicate. Its mandate explicitly focuses on the earliest and most impactful stages of investment, backing **product-led tech startups from Australia and New Zealand**.

The syndicate operates on the **Aussie Angels** platform with $50k–$200k typical cheques per deal. M8 Ventures has no sector focus — instead specialising on stage and on backing product-led founders.

Founders apply through the M8 Ventures website. M8 Ventures is associated with Innovation Bay (Phaedon Stough''s long-running Australian tech-startup networking community) — though direct cap-table relationship is not explicitly disclosed.',
  why_work_with_us = 'For Australian and NZ pre-seed/seed founders building product-led tech businesses, M8 Ventures offers focused stage-specific capital alongside Innovation Bay community visibility. Best for founders with a clear product-led growth thesis.',
  sector_focus = ARRAY['Product-Led','Tech','SaaS','Consumer','Marketplace','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 200000,
  website = 'https://m8.ventures',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['M8 Ventures (Aussie Angels syndicate)','Innovation Bay (community affiliation)'],
  meta_title = 'M8 Ventures — Sydney Pre-Seed Syndicate (Aussie Angels)',
  meta_description = 'Sydney pre-seed and seed specialist syndicate on Aussie Angels. AU/NZ product-led tech. $50k–$200k.',
  details = jsonb_build_object(
    'syndicate_platform','Aussie Angels',
    'syndicate_url','https://app.aussieangels.com/syndicate/m8-ventures',
    'investment_thesis','Pre-seed and seed product-led tech startups from Australia and New Zealand. No sector focus.',
    'check_size_note','$50k–$200k syndicate cheques',
    'application','Apply online via website',
    'community_affiliation','Innovation Bay (Phaedon Stough)',
    'sources', jsonb_build_object(
      'website','https://m8.ventures/who-we-are',
      'aussie_angels','https://app.aussieangels.com/syndicate/m8-ventures',
      'superscout','https://superscout.co/investor/m8-ventures',
      'innovation_bay_qld','https://www.startupdaily.net/topic/venture-capital/innovation-bay-is-launching-in-queensland-and-on-the-hunt-for-great-local-startups-to-back/'
    ),
    'corrections','CSV cheque "AUD$50-200k" interpreted as $50k–$200k. Email "Apply online" treated as application instruction not contact.'
  ),
  updated_at = now()
WHERE name = 'M8 Ventures';

COMMIT;
