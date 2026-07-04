-- Enrich angel investors — batch 03o (records 224-228: Something Real Ventures → SPV Ventures)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based ANZ-leading cybersecurity-focused angel syndicate and community. Pure cybersecurity sector mandate. Portfolio includes Knocknoc (network management software). $50,000–$250,000 syndicate cheques. Active via Aussie Angels platform.',
  basic_info = 'Something Real Ventures is the **leading ANZ community and angel syndicate for cybersecurity founders** — Melbourne-headquartered with Australia/New Zealand-wide reach. Sector-pure cybersecurity mandate.

Their portfolio includes:
- **Knocknoc** (Network Management Software — investment made March 2025)
- **Alcova**
- **Dam ...** (truncated context)
- Plus additional cybersecurity-focused investments

CSV cheque size: **$50,000 – $250,000** (syndicate scale). Stated thesis: **Cybersecurity (CSV "Cybersecuirty" misspelling)**.

The syndicate operates via the **Aussie Angels platform** and supports cybersecurity founders with both capital and the ANZ cybersecurity-community network access.',
  why_work_with_us = 'For Australian and New Zealand cybersecurity founders — Something Real Ventures is the most credentialed sector-pure cybersecurity angel syndicate in the ANZ market. The combination of $50k–$250k syndicate cheque capacity plus access to the broader ANZ cybersecurity-community network is unmatched for sector founders.',
  sector_focus = ARRAY['Cybersecurity','Security','Infrastructure','DevSecOps','Network Security','Cloud Security'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 250000,
  website = 'https://www.somethingreal.vc/',
  linkedin_url = 'https://www.linkedin.com/company/something-real-ventures',
  contact_email = 'hello@somethingreal.vc',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Knocknoc','Alcova'],
  meta_title = 'Something Real Ventures — ANZ Cybersecurity Angel Syndicate | Melbourne',
  meta_description = 'ANZ leading cybersecurity-focused angel syndicate. Knocknoc, Alcova in portfolio. $50k–$250k syndicate cheques.',
  details = jsonb_build_object(
    'organisation_type','Sector-pure angel syndicate / community',
    'investment_thesis','Cybersecurity exclusively — ANZ cybersecurity-community-network leveraged.',
    'check_size_note','$50,000 – $250,000',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Knocknoc','context','Network Management Software; investment 19-Mar-2025')
    ),
    'sources', jsonb_build_object(
      'website','https://www.somethingreal.vc/',
      'linkedin','https://au.linkedin.com/company/something-real-ventures',
      'aussie_angels','https://app.aussieangels.com/syndicate/something-real-ventures',
      'pitchbook','https://pitchbook.com/profiles/investor/762748-03'
    ),
    'corrections','CSV thesis "Cybersecuirty" was a misspelling — corrected. CSV portfolio truncated ("Knoc Knoc, Alcova, Dam..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Something Real Ventures';

UPDATE investors SET
  description = 'Sydney-based marketing research and angel investor. Marketing Research & Insights Advisor and early investor at Auric Essentials (wellness/AromaSphere). 20+ years in customer research, brand strategy and behavioural economics. Portfolio includes Auric, SkillsTX, Brolly. $200k cheques. Tech, SaaS, Media, FinTech focus.',
  basic_info = 'Sushant ("Sonny") Sethi is a Sydney-based **marketing research, brand strategy and angel investor**. He has **20+ years of global experience** in customer research, insights and brand strategy and has led **1,500+ research projects** across multiple industries.

He is the **Marketing Research & Insights Advisor and early investor at Auric Essentials** — a wellness-tech leader pioneering the emerging "Mood as a Service" category with its flagship **AromaSphere** product (announced 2024). His expertise spans **scaling new products, customer segmentation, pricing strategy, behavioural economics and product optimisation**.

His CSV-listed portfolio includes:
- **Auric** (Auric Essentials — wellness tech)
- **SkillsTX** (skills-management SaaS)
- **Brolly** (Australian insurance startup)
- **Biz...** (truncated)
- Plus additional names

Stated thesis: **Tech, SaaS, Media, FinTech**. CSV cheque size **$200k** — a substantial mid-cheque candidate.',
  why_work_with_us = 'For Australian Tech, SaaS, Media, FinTech and consumer-wellness founders — Sonny brings rare research/insights/brand-strategy depth (1,500+ projects, 20+ years), an Auric Essentials early-investor and advisory track record, plus a substantial $200k personal cheque. Especially valuable for founders pursuing brand-led product positioning.',
  sector_focus = ARRAY['Tech','SaaS','Media','FinTech','Consumer','Wellness','InsurTech','Marketing'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 200000,
  check_size_max = 200000,
  linkedin_url = 'https://www.linkedin.com/in/sonny-sethi',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Auric Essentials (Marketing Research & Insights Advisor; early investor)','SkillsTX','Brolly'],
  meta_title = 'Sonny Sethi — Auric Advisor | Sydney Tech/SaaS/FinTech Angel | $200k',
  meta_description = 'Sydney 20+yr marketing research executive and angel. Auric early investor. SkillsTX, Brolly. Tech, SaaS, Media, FinTech.',
  details = jsonb_build_object(
    'firms', ARRAY['Auric Essentials (Marketing Research & Insights Advisor; early investor)'],
    'prior_career','20+ years global customer research, insights, brand strategy; 1,500+ research projects led',
    'investment_thesis','Tech, SaaS, Media, FinTech — research-and-brand-strategy-led pattern recognition.',
    'check_size_note','$200k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/sonny-sethi',
      'auric_news','https://www.auric.au/post/auric-essentials-appoints-sonny-sethi-as-marketing-research-advisor'
    ),
    'corrections','CSV portfolio truncated ("Auric, SkillsTX, Brolly, Biz..."). Three retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Sonny Sethi';

UPDATE investors SET
  description = 'Adelaide-based angel investor group founded 2018. Sector focus: technology, life sciences, software and biotech. Notable backer of GPN Vaccines (Series B; Streptococcus pneumoniae vaccine). Portfolio includes TekCyte. Founding member Tim Hirst — Australian Angel Investor of the Year 2022.',
  basic_info = 'Southern Angels is an Adelaide-based **angel investor group founded in 2018** focusing on early-stage Aussie startups in **technology, life sciences, software and biotech** sectors.

The group''s most prominent investor is **Tim Hirst** — a founding member who has actively supported Southern Angels since inception. Tim is **GPN Vaccines'' Chairman and CEO** and was awarded **Australian Angel Investor of the Year 2022** by Techboard for his contribution to angel investment.

CSV-listed portfolio includes:
- **TekCyte** (truncated context — Adelaide tech)
- **GPN Vaccines** — Adelaide-based biotech developing a vaccine against **Streptococcus pneumoniae** (cause of life-threatening pneumonia, bacteraemia, meningitis — responsible for 1-2 million deaths worldwide annually); secured **AUD$18M Series B** funding round
- Plus additional names

CSV cheque size **$100k** (round-coordination level via member syndication).',
  why_work_with_us = 'For South Australian and especially Adelaide-based biotech, life-sciences, medical-device, software and tech founders — Southern Angels is one of the most active sector-credentialed angel groups in SA. Founding member Tim Hirst''s 2022 Australian Angel Investor of the Year award signals exceptional pattern recognition, especially in biotech.',
  sector_focus = ARRAY['Tech','Life Sciences','Software','Biotech','MedTech','Vaccines','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 100000,
  check_size_max = 100000,
  website = 'https://www.southernangels.com.au/',
  linkedin_url = 'https://www.linkedin.com/in/sthnangels',
  location = 'Adelaide, SA',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['TekCyte','GPN Vaccines (Series B; Streptococcus pneumoniae vaccine)'],
  meta_title = 'Southern Angels — Adelaide Biotech/Tech Angel Group | $100k',
  meta_description = 'Adelaide angel group since 2018. Biotech, life sciences, software focus. GPN Vaccines, TekCyte. Tim Hirst founder.',
  details = jsonb_build_object(
    'organisation_type','Angel investor group',
    'founded',2018,
    'investment_thesis','Technology, life sciences, software, biotech — Adelaide/SA focus.',
    'check_size_note','$100k member-coordinated rounds',
    'notable_members', jsonb_build_array(
      jsonb_build_object('name','Tim Hirst','context','Founding member; GPN Vaccines Chairman & CEO; Australian Angel Investor of the Year 2022 (Techboard)')
    ),
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','GPN Vaccines','context','Adelaide biotech; AUD$18M Series B; Streptococcus pneumoniae vaccine'),
      jsonb_build_object('company','TekCyte','context','Adelaide tech')
    ),
    'sources', jsonb_build_object(
      'website','https://www.southernangels.com.au/',
      'linkedin','https://au.linkedin.com/company/sthnangels',
      'gpn_vaccines','https://gpnvaccines.com/tim-hirst-named-australian-angel-investor-of-the-year-in-2022/',
      'pitchbook','https://pitchbook.com/profiles/investor/432906-22'
    ),
    'corrections','CSV portfolio truncated ("TekCyte, GPN Vaccines, ..."). Two retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Southern Angels';

UPDATE investors SET
  description = 'Toronto-based (originally Perth/Tasmania, Australia) angel investor and mining-royalties executive. Chief Investment Officer at Vox Royalty Corp (TSXV-listed). Co-founder of Mineral Royalties Online (acquired by Vox 2020). Sector-agnostic angel. Portfolio includes ULUU (seaweed-based plastics) and BeforePay (ASX-listed BNPL). $25k–$150k cheques.',
  basic_info = 'Spencer Cole is a **Toronto-based (Canadian-Australian) angel investor and mining-royalties executive**. He is **Chief Investment Officer at Vox Royalty Corp** (TSX-Venture-listed precious-metals royalty/streaming company) since 2021 and **Chief Financial & Development Officer at Xanadu Mines Ltd.** since 2020.

He is the **Co-Founder of Mineral Royalties Online** — the royalty database (with Riaan Esterhuizen) which Vox acquired prior to its May 2020 listing transaction on the TSXV.

His CSV-listed angel portfolio includes:
- **ULUU** (Australian seaweed-based bioplastics — climate/circular-economy)
- **BeforePay** (Australian "pay-on-demand" BNPL — IPO''d on ASX 2022)
- Plus additional truncated names
- Other angel positions: Cove Insurance, RetiSpec, 99Mines, Enroly, Leasy

CSV cheque size **$25k–$150k**. Sector mandate: **Agnostic**. Originally **Perth/Tasmania-based**, now Toronto-based.',
  why_work_with_us = 'For Australian — and especially WA/Perth-based or mining-tech — and Canadian climate-tech, fintech, insurtech and resources-tech founders — Spencer brings a unique cross-Pacific angel position. His Vox Royalty mining-finance depth plus a sector-agnostic angel portfolio with both BeforePay (BNPL ASX-IPO) and ULUU (climate/seaweed) signals genuinely diverse pattern recognition.',
  sector_focus = ARRAY['Generalist','Mining Tech','Resources','FinTech','BNPL','Climate Tech','Bioplastics','InsurTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 150000,
  linkedin_url = 'https://ca.linkedin.com/in/spencer-cole-76761a26',
  contact_email = 'Spencer@mineralroyalties.com',
  location = 'Toronto, Canada',
  country = 'Canada',
  currently_investing = true,
  portfolio_companies = ARRAY['Vox Royalty Corp (CIO; TSXV-listed)','Xanadu Mines Ltd. (CFO & Development Officer)','Mineral Royalties Online (Co-Founder; acquired by Vox)','ULUU','BeforePay (ASX-IPO)','Cove Insurance','RetiSpec','99Mines','Enroly','Leasy'],
  meta_title = 'Spencer Cole — Vox Royalty CIO | Toronto-AU Cross-Pacific Angel',
  meta_description = 'Toronto-AU angel. Vox Royalty CIO. Mineral Royalties Online co-founder. ULUU, BeforePay portfolio. $25k–$150k.',
  details = jsonb_build_object(
    'firms', ARRAY['Vox Royalty Corp (CIO; TSXV-listed; since 2021)','Xanadu Mines Ltd. (CFO & Development Officer; since 2020)','Mineral Royalties Online (Co-Founder; acquired by Vox 2020)'],
    'investment_thesis','Sector-agnostic — mining-finance + cross-Pacific consumer/climate angel.',
    'check_size_note','$25k–$150k',
    'origin','Originally Perth/Tasmania, Australia — now Toronto, Canada',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','ULUU','context','Australian seaweed-based bioplastics — climate/circular economy'),
      jsonb_build_object('company','BeforePay','context','Australian "pay-on-demand" BNPL; IPO''d on ASX 2022')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://ca.linkedin.com/in/spencer-cole-76761a26',
      'angel_match','https://angelmatch.io/investors/spencer-cole',
      'market_screener','https://ca.marketscreener.com/insider/SPENCER-COLE-A1N4Y1/'
    ),
    'corrections','CSV name was truncated ("Spencer Cole / Mineral Ro..."); DB record is "Spencer Cole / Mineral Royalties Online". CSV email truncated ("Spencer@mineralroyaltie...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Spencer Cole / Mineral Royalties Online';

UPDATE investors SET
  description = 'Sydney-based VC/angel investor. Founded by Mathew Benjamin (University of Sydney; ACI Global Ventures). Thesis: deglobalization, decarbonization, decentralisation. Portfolio includes Cortical Labs (DishBrain biological-intelligence). US$250k–$2M cheques (Series-stage).',
  basic_info = 'SPV Ventures is a Sydney-based VC/angel investor associated with **Mathew Benjamin** — University of Sydney-affiliated venture investor with focus on advanced compute, applied AI, next-generation life sciences and the emerging digital stack via **ACI Global Ventures**.

Stated thesis: **Deglobalization, Decarbonization** (and decentralisation) — three macro themes shaping investing in the 2020s.

CSV-listed portfolio includes:
- **Cortical Labs** (Stealth context — Australian company building **DishBrain**, technology fusing living brain cells onto computing devices to create machines with biological intelligence; Horizons Ventures led a US$10M round)
- Plus additional truncated names

CSV cheque size **US$250k – US$2M** — Series-stage (substantial fund-scale cheques).',
  why_work_with_us = 'For Australian deep-tech, biotech, advanced-compute, climate-tech and decentralised-systems founders — SPV Ventures combines Mathew Benjamin''s University of Sydney + ACI Global Ventures network access with a Series-stage cheque capacity (US$250k–US$2M). Especially valuable for founders building on the deglobalization / decarbonization / advanced-compute thesis with a Cortical Labs-class technical ambition.',
  sector_focus = ARRAY['Deep Tech','BioTech','AI','Advanced Compute','Climate Tech','Decarbonization','Life Sciences','DeepTech'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  check_size_min = 380000,
  check_size_max = 3000000,
  linkedin_url = 'https://www.linkedin.com/in/mathewtbenjamin/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Cortical Labs (DishBrain — biological intelligence)','ACI Global Ventures (Mathew Benjamin affiliated)'],
  meta_title = 'SPV Ventures — Sydney Deep-Tech / Decarbonization | US$250k–$2M',
  meta_description = 'Sydney VC. Deglobalization, decarbonization, advanced compute thesis. Cortical Labs. US$250k–$2M cheques.',
  details = jsonb_build_object(
    'organisation_type','Venture capital / angel',
    'founder','Mathew Benjamin',
    'investment_thesis','Deglobalization, Decarbonization, Decentralisation — advanced compute, applied AI, life sciences, emerging digital stack.',
    'check_size_note','US$250k – US$2M (~AUD 380k–3M)',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Cortical Labs','context','Australian DishBrain — fuses living brain cells onto computing devices for biological intelligence; Horizons Ventures led US$10M round')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/mathewtbenjamin/',
      'horizons_ventures','https://www.horizonsventures.com/news/synthetic-biology-and-the-new-frontier-in-ai'
    ),
    'corrections','CSV thesis truncated ("Deglobalization, decorbo..."). Resolved. CSV portfolio truncated ("Cortical Labs Stealth,..."). Cheque-size converted USD→AUD approx.'
  ),
  updated_at = now()
WHERE name = 'SPV Ventures';

COMMIT;
