-- Enrich angel investors — batch 03a (records 154-158: Marc Sofer → Martyn Reeves)

BEGIN;

UPDATE investors SET
  description = 'Byron Bay-based serial founder and investor. Chair of Byron Bay Angels (record #44). Founder of Byron Ventures. 25+ year career as founder, developer and exiter of businesses across UK, Australia and the Caribbean. Unit Writer in Entrepreneurship and Innovation at Southern Cross University. Northern Rivers Community Foundation trustee. Portfolio: Humble Bee, Ping, Vaulta, SchoolStream, Verton, Cake Equity, tagSpace, Monarc Global, Unhedged.',
  basic_info = 'Marc Sofer is a Byron Bay-based seasoned founder and investor who is the **Chair of Byron Bay Angels** (the regional angel-investment group separately listed as record #44) and **Founder of Byron Ventures** (its associated venture catalyst).

His operating background spans 25+ years as a founder, developer and exiter of businesses across the **United Kingdom, Australia and the Caribbean** — bringing unusual cross-jurisdictional context to the Byron Bay regional ecosystem.

Beyond his investment activity, he is:
- **Unit Writer in Entrepreneurship and Innovation at Southern Cross University**
- Trustee of the **Northern Rivers Community Foundation**
- Holds Board Advisory and Director roles in startups and scaleups across Australia and the UK

Notable portfolio companies (a number of which are also Byron Bay Angels positions):
- **Humble Bee** (sustainable biotech materials)
- **Ping** (telco)
- **Vaulta** (battery-tech / energy storage)
- **SchoolStream** (school communications platform)
- **Verton** (industrial robotics)
- **Cake Equity** (cap-table SaaS)
- **tagSpace** (location-based AR)
- **Monarc Global** (technology)
- **Unhedged** (financial-tech)',
  why_work_with_us = 'For Australian regional founders, climate-tech, sustainability, biotech-materials, education-tech and energy-storage entrepreneurs, Marc combines the Chair role at Byron Bay Angels with Byron Ventures fund-style cheque capacity plus 25 years of serial-founder operator credentials.',
  sector_focus = ARRAY['Climate','Biotech','Energy Storage','Telco','EdTech','Robotics','SaaS','FinTech','Sustainability','Regional Tech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.byron.ventures',
  linkedin_url = 'https://www.linkedin.com/in/marc-sofer-937162184/',
  contact_email = 'pitch@byron.ventures',
  location = 'Byron Bay, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Byron Bay Angels (Chair; record #44)','Byron Ventures (Founder)','Humble Bee','Ping','Vaulta','SchoolStream','Verton','Cake Equity','tagSpace','Monarc Global','Unhedged','Northern Rivers Community Foundation (Trustee)','Southern Cross University (Unit Writer)'],
  meta_title = 'Marc Sofer — Byron Bay Angels Chair / Byron Ventures Founder',
  meta_description = 'Byron Bay-based 25+ year founder/investor. Chair Byron Bay Angels. Founder Byron Ventures. Humble Bee, Ping, Vaulta, Cake Equity, tagSpace.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Chair, Byron Bay Angels (record #44)',
      'Founder, Byron Ventures',
      'Unit Writer in Entrepreneurship and Innovation, Southern Cross University',
      'Trustee, Northern Rivers Community Foundation'
    ],
    'experience','25+ years founder/developer/exiter across UK, Australia, Caribbean',
    'sources', jsonb_build_object(
      'byron_ventures','https://www.byron.ventures/',
      'angellist_syndicate','https://venture.angellist.com/marc-sofer/syndicate',
      'byron_angels_linkedin','https://au.linkedin.com/company/byron-angels',
      'tracxn','https://tracxn.com/d/venture-capital/byron-ventures/__IHMIzUcLELhyjBbbHKQRNW9Rhk0yZohBqqlNXuWlwVQ',
      'nrcf','https://nrcf.org.au/about/our-people/marc-sofer/',
      'clarity','https://clarity.fm/marcsofer'
    ),
    'corrections','CSV portfolio truncated ("Humble Bee, Ping, Vaulta,..."). Three retained verbatim and expanded with verified portfolio (SchoolStream, Verton, Cake Equity, tagSpace, Monarc Global, Unhedged) per Byron Ventures public sources. Cross-reference: Byron Bay Angels (record #44).'
  ),
  updated_at = now()
WHERE name = 'Marc Sofer';

UPDATE investors SET
  description = 'Sydney-based B2B SaaS angel investor. CSV portfolio: Insightech, Sumo Logic. $25k cheques.',
  basic_info = 'Mark Ghiasy is listed in the Australian angel investor directory as a Sydney-based B2B SaaS angel investor at $25k cheque size. CSV-listed portfolio:
- **Insightech** — digital experience analytics (Australian SaaS)
- **Sumo Logic** — cloud-native log management and observability (US-listed; NASDAQ:SUMO before going private)

Beyond the directory entry, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian B2B SaaS founders looking for a small first cheque from a Sydney-based sector-aligned angel.',
  sector_focus = ARRAY['B2B SaaS','SaaS','Analytics','Observability','Enterprise Software'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  contact_email = 'mark.ghiasy@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Insightech','Sumo Logic'],
  meta_title = 'Mark Ghiasy — Sydney B2B SaaS Angel | Insightech, Sumo Logic',
  meta_description = 'Sydney B2B SaaS angel investor. Portfolio: Insightech, Sumo Logic. $25k cheques.',
  details = jsonb_build_object(
    'check_size_note','$25k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV LinkedIn URL empty. CSV portfolio retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Mark Ghiasy';

UPDATE investors SET
  description = 'Sydney-based UNSW Associate Professor of Finance and angel investor. Founder of Otso Capital (US-focused hedge fund + open-ended venture fund). PhD CA. Research spans corporate finance, venture capital and law. Sector-agnostic angel. CSV portfolio: AgUnity, AirRobe, Alixir.',
  basic_info = 'Associate Professor Mark Humphery-Jenner PhD CA is a Sydney-based academic and angel investor. He is **Associate Professor of Finance at UNSW Business School**, with research spanning corporate finance, venture capital and law.

He is the **founder of Otso Capital**, which manages a US-focused hedge fund and an open-ended venture fund. He also serves as Board Member at multiple ventures. He is a regular contributor to The Conversation and South China Morning Post, and his finance research is widely cited (Google Scholar profile maintained).

His CSV-listed personal angel portfolio:
- **AgUnity** — supply-chain platform connecting smallholder farmers
- **AirRobe** — circular-fashion / resale platform
- **Alixir** and additional truncated names',
  why_work_with_us = 'For Australian founders raising structured rounds where corporate-finance, venture-capital-law, and US-fund-pathway expertise is value-add, Mark combines academic research depth with Otso Capital fund-level cheque capacity.',
  sector_focus = ARRAY['SaaS','FinTech','AgTech','Sustainability','Generalist','Corporate Finance','Cross-border'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/humpheryjenner/',
  contact_email = 'm.humpheryjenner@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['UNSW Business School (Associate Professor of Finance)','Otso Capital (Founder; US hedge fund + open-ended venture fund)','AgUnity','AirRobe','Alixir'],
  meta_title = 'Mark Humphery-Jenner PhD CA — UNSW / Otso Capital | Sydney Finance Angel',
  meta_description = 'Sydney UNSW Assoc Professor of Finance. Founder Otso Capital. PhD CA. Portfolio: AgUnity, AirRobe, Alixir.',
  details = jsonb_build_object(
    'credentials', ARRAY['PhD','CA (Chartered Accountant)'],
    'firm','Otso Capital (US-focused hedge fund + open-ended venture fund)',
    'current_roles', ARRAY[
      'Associate Professor of Finance, UNSW Business School',
      'Founder, Otso Capital',
      'Angel Investor and Board Member'
    ],
    'research_focus','Corporate finance, venture capital, law',
    'media_presence', ARRAY['The Conversation contributor','South China Morning Post contributor'],
    'sources', jsonb_build_object(
      'unsw_staff','https://www.unsw.edu.au/staff/mark-humphery-jenner',
      'unsw_research','https://research.unsw.edu.au/people/associate-professor-mark-laurence-humphery-jenner',
      'business_think','https://www.businessthink.unsw.edu.au/profiles/mark_humphery_jenner/True',
      'linkedin','https://www.linkedin.com/in/humpheryjenner/',
      'google_scholar','https://scholar.google.com/citations?user=bqsAVEYAAAAJ&hl=en',
      'the_conversation','https://theconversation.com/profiles/mark-humphery-jenner-118505',
      'scmp','https://www.scmp.com/author/mark-humphery-jenner'
    ),
    'corrections','CSV portfolio truncated ("AgUnity, AirRobe, Alixir, B..."). Three retained verbatim. Email lowercase corrected.'
  ),
  updated_at = now()
WHERE name = 'Mark Humphrey-Jenner';

UPDATE investors SET
  description = 'Melbourne-based angel investor and operator. Co-Founder of Escape Collective. CEO of Cogent (Melbourne strategy/design/development consultancy). Chairperson of Fresho. Investment Director Cogent Ventures. Active investor in renewable energy tech and Transport-as-a-Service (TaaS). $50k–$150k cheques.',
  basic_info = 'Mark Wells is a Melbourne-based chair, director, advisor and angel investor with experience in growth-stage tech, vertical SaaS and climate.

His operating roles:
- **Co-Founder, Escape Collective** — global cycling-media and community brand
- **CEO, Cogent** — Melbourne strategy/design/development consultancy turning ideas into businesses
- **Chairperson, Fresho** (independent NED) — wholesale-food-supply SaaS where he previously served as a supplier customer for 6+ years and as Investment Director of Cogent Ventures has participated in all funding rounds since 2015
- **Investment Director, Cogent Ventures**

He is a passionate advocate for **renewable energy tech** and **transport-as-a-service (TaaS)** as the future of climate-impactful technology. He has held a range of CEO, CCO, CTO and Non-Executive Director roles, and is a sought-after advisor on fundraising, strategic planning and market entry.',
  why_work_with_us = 'For Australian growth-stage tech, vertical SaaS, climate-tech, renewable-energy-tech and Transport-as-a-Service founders, Mark combines Cogent + Cogent Ventures cheque capacity with multi-decade tech operator credentials and Fresho/Escape Collective board context.',
  sector_focus = ARRAY['Vertical SaaS','SaaS','Climate Tech','Renewable Energy','Transport-as-a-Service','TaaS','Growth Stage Tech','FoodTech','MediaTech'],
  stage_focus = ARRAY['Seed','Series A','Series B'],
  check_size_min = 50000,
  check_size_max = 150000,
  linkedin_url = 'https://www.linkedin.com/in/mrmwells/',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Escape Collective (Co-Founder)','Cogent (CEO)','Cogent Ventures (Investment Director)','Fresho (Chairperson; participated in all funding rounds since 2015)'],
  meta_title = 'Mark Wells — Cogent CEO / Escape Collective | Melbourne Vertical SaaS + Climate Angel',
  meta_description = 'Melbourne CEO Cogent. Co-Founder Escape Collective. Chairperson Fresho. Vertical SaaS, climate, renewable energy, TaaS. $50k–$150k.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'CEO, Cogent (Melbourne strategy/design/development)',
      'Co-Founder, Escape Collective (cycling media)',
      'Chairperson, Fresho (independent NED)',
      'Investment Director, Cogent Ventures'
    ],
    'investment_thesis','Vertical SaaS, climate-tech, renewable energy and Transport-as-a-Service (TaaS).',
    'check_size_note','$50k–$150k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/mrmwells/',
      'rocketreach_fresho','https://rocketreach.co/mark-wells-email_781647',
      'general_assembly','https://generalassemb.ly/instructors/mark-wells/14399',
      'fresho_chair_post','https://www.linkedin.com/posts/mrmwells_very-proud-to-be-the-chair-of-this-great-activity-7156554500147662848-wZg2'
    ),
    'corrections','CSV portfolio truncated ("Escape Collective, Fresho..."). Two verified retained with chairmanship context.'
  ),
  updated_at = now()
WHERE name = 'Mark Wells';

UPDATE investors SET
  description = 'Sydney-based angel investor focused on pre-seed and seed-stage SaaS. CSV portfolio: Black AI (machine vision), Amaka (accounting integrations), Wagetap. Up to $50k cheques.',
  basic_info = 'Martyn Reeves is a Sydney-based angel investor with explicit pre-seed and seed-level SaaS focus per the Australian angel directory. CSV-listed portfolio:
- **Black AI** — Australian machine-vision / computer-vision platform
- **Amaka** — Australian accounting integrations / SaaS connector
- **Wagetap** — fintech (early-wage-access)

CSV cheque size up to $50,000. Beyond the directory entry, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian pre-seed and seed SaaS founders, Martyn offers a small-to-mid first cheque (up to $50k) from a Sydney-based sector-aligned angel with apparent AI, fintech and accounting-integration portfolio.',
  sector_focus = ARRAY['SaaS','Pre-seed','Seed','AI','FinTech','Accounting Integrations'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 0,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/martynreeves/',
  contact_email = 'martynr12@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Black AI','Amaka','Wagetap'],
  meta_title = 'Martyn Reeves — Sydney Pre-Seed/Seed SaaS Angel | Up to $50k',
  meta_description = 'Sydney pre-seed/seed SaaS angel. Portfolio: Black AI, Amaka, Wagetap. Up to $50k.',
  details = jsonb_build_object(
    'investment_thesis','Pre-seed and seed-level SaaS founders.',
    'check_size_note','Up to $50,000',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/martynreeves/'
    ),
    'corrections','CSV portfolio retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Martyn Reeves';

COMMIT;
