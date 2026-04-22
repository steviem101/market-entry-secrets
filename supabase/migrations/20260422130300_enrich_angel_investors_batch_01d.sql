-- Enrich angel investors — batch 01d (records 16-20 of 20 for batch 1)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based angel investor, Venture Partner at Significant Capital Ventures, and experienced non-executive director (FAICD). Former Co-CEO of Scale Investors (2017–2019). Focus on female-founded startups.',
  basic_info = 'Amanda Derham is a Melbourne-based angel investor and non-executive director (FAICD). She was Co-CEO and Project Manager at Scale Investors — the Melbourne-based angel group dedicated to closing the funding gap for female entrepreneurs — from 2017 to 2019, and remains part of the Scale Angel Network. She is currently a Venture Partner at Significant Capital Ventures and a director at The Agile Director.

Her angel thesis is explicitly oriented toward startups with female founders. She is a supporter of Six Park (on a personal investing basis) and is active with the Hugh Victor MacKay Fund and the Skyline Foundation.',
  why_work_with_us = 'Direct, long-standing involvement with Scale Investors and the broader network of Australian female-founder-focused angels. Board and governance experience is useful for early-stage founders approaching Series A.',
  sector_focus = ARRAY['Female Founders','Consumer','SaaS','HealthTech','EdTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://au.linkedin.com/in/amandamderham',
  contact_email = 'amderham@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Six Park','Scale Investors (ex-Co-CEO)'],
  meta_title = 'Amanda Derham — Scale Investors alum | Melbourne Angel',
  meta_description = 'Melbourne angel investor and NED. Venture Partner at Significant Capital Ventures. Former Co-CEO, Scale Investors. Female-founder focus.',
  details = jsonb_build_object(
    'credentials','FAICD (Fellow, Australian Institute of Company Directors)',
    'roles', ARRAY[
      'Significant Capital Ventures (Venture Partner)',
      'Scale Angel Network',
      'The Agile Director',
      'Skyline Foundation',
      'Hugh Victor MacKay Fund (Consultant)'
    ],
    'prior_roles', ARRAY['Scale Investors (Co-CEO & Project Manager, 2017–2019)'],
    'investment_thesis','Back startups with female founders.',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/amandamderham',
      'pitchbook','https://pitchbook.com/profiles/person/219551-32P',
      'scale_investors','https://scaleinvestors.com.au/scale-angel-network',
      'six_park','https://www.sixpark.com.au/a-legacy-for-the-future-amandas-story/',
      'significant_capital_interview','https://exceptionalsalescareer.com/interview/amanda-derham-director-at-the-agile-director-partner-at-significant-capital-ventures/',
      'skyline_foundation','https://skylinefoundation.org.au/our-community/amanda-derham/'
    ),
    'corrections','CSV had sector_focus empty and portfolio truncated ("Six Park, Scale Investors ..."). Added verified affiliations as portfolio-adjacent roles.'
  ),
  updated_at = now()
WHERE name = 'Amanda Derham';

UPDATE investors SET
  description = 'Sydney-based GP and Chief Clinical Adviser (Medicine) at the Australian Digital Health Agency. Co-founder of Australian Medical Angels — one of the world''s largest medical angel syndicates (25 investments, ~AU$14M deployed). Founder of Creative Careers in Medicine (25,000+ members).',
  basic_info = 'Dr Amandeep Hansra is a Sydney-based GP with 18 years of clinical experience, now better known as one of Australia''s most active digital-health investors and ecosystem-builders. She is Chief Clinical Adviser (Medicine) at the Australian Digital Health Agency (since July 2024) and previously served as its Digital Health Adviser for five years.

She co-founded Australian Medical Angels (AMA), one of the world''s largest medical angel syndicates, which has closed 25 investments totalling approximately AU$14M across telehealth, virtual reality, wearables and other medtech categories. AMA launched a Victorian branch alongside its Sydney origin. She also founded Creative Careers in Medicine, a community of 25,000+ doctors rethinking clinical careers.

Her operator background is equally deep: ex-CEO & Medical Director of ReadyCare (Telstra/Medgate telemedicine JV), ex-Chief Medical Officer of Telstra Health, and prior involvement in setting up a telemedicine business in the Philippines.',
  why_work_with_us = 'One of the most sophisticated medical-angel networks in the Asia-Pacific — founders get capital plus an entire community of practising clinicians for clinical validation, pilot sites and NPS. Strong government/digital-health relationships through her ADHA role.',
  sector_focus = ARRAY['HealthTech','MedTech','Telehealth','Digital Health','Wearables','VR/AR Health','Clinical Decision Support'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://medangels.com.au',
  linkedin_url = 'https://au.linkedin.com/in/dr-amandeep-hansra-b2092623',
  contact_email = 'drhansra@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['CancerAid','Medgate','Smileyscope','Australian Medical Angels (co-founder)','Creative Careers in Medicine (founder)','ReadyCare (ex-CEO)'],
  meta_title = 'Dr Amandeep Hansra — Australian Medical Angels | HealthTech Angel',
  meta_description = 'Sydney-based medical angel. Co-founder, Australian Medical Angels (25 deals, ~$14M). Chief Clinical Adviser, ADHA. Ex-CEO ReadyCare.',
  details = jsonb_build_object(
    'primary_vehicle','Australian Medical Angels (co-founder)',
    'ama_stats', jsonb_build_object(
      'investments',25,
      'capital_deployed_aud','~$14M',
      'rounds',10,
      'categories', ARRAY['Telehealth','Virtual Reality','Wearables','Clinical Decision Support']
    ),
    'current_roles', ARRAY[
      'Chief Clinical Adviser (Medicine), Australian Digital Health Agency (since July 2024)',
      'Founder, Creative Careers in Medicine (25,000+ members)'
    ],
    'prior_roles', ARRAY[
      'CEO & Medical Director, ReadyCare (Telstra/Medgate telemedicine JV)',
      'Chief Medical Officer, Telstra Health',
      'Digital Health Adviser, Australian Digital Health Agency (5 yrs)'
    ],
    'credentials','MBBS (Hons) Newcastle; Global Executive MBA USyd; Masters Public Health & Tropical Medicine JCU; Certified Health Informatician (CHIA); GAICD',
    'media_presence', ARRAY[
      'LaunchVic Ask an Angel',
      'Talking HealthTech podcast (Ep 196)',
      'Clinical Changemakers profile',
      'O&G Magazine — Leaders in Focus'
    ],
    'sources', jsonb_build_object(
      'adha_bio','https://www.digitalhealth.gov.au/about-us/organisational-structure/executive-team/dr-amandeep-hansra',
      'ama_about','https://medangels.com.au/about/',
      'launchvic_interview','https://launchvic.org/insights/ask-an-angel-dr-amandeep-hansra-australian-medical-angels/',
      'launchvic_case_study','https://launchvic.org/case-studies/how-australian-medical-angels-is-helping-doctors-invest-in-the-medtech-they-really-need/',
      'podcast','https://www.talkinghealthtech.com/podcast/196-medical-angels-digital-health-and-creative-careers-dr-amandeep-hansra',
      'clinical_changemakers','https://www.clinicalchangemakers.com/p/how-one-doctors-career-pivot-inspired',
      'og_magazine','https://www.ogmagazine.org.au/26/4-26/leaders-in-focus-dr-amandeep-hansra/',
      'linkedin','https://au.linkedin.com/in/dr-amandeep-hansra-b2092623'
    ),
    'corrections','CSV portfolio truncated ("Canceraid, Medgate, Smil..."). Expanded Smil... to Smileyscope based on AMA case-study press.'
  ),
  updated_at = now()
WHERE name = 'Amandeep Hansra';

UPDATE investors SET
  description = 'Melbourne-based tech entrepreneur and angel investor. Founder of Adslot; co-founder of Hitwise (sold to Experian, 2007) and Max Super (sold to Orchard Funds Management, 2007). Founder of Venturian VC. Cheque size $50K–$500K.',
  basic_info = 'Andrew Barlow is a serial Melbourne technology entrepreneur with three exits behind him and an active angel/venture practice in front of him. He co-founded Hitwise with Adrian Giles in 1997 and served as Chairman and Managing Director from 1997–2000 and Director of R&D from 2000–2002; Hitwise was named one of Deloitte''s Top 10 fastest-growing companies for five consecutive years before being sold to Experian Group in May 2007. In the same year, he sold Max Super (online retail super fund) to Orchard Funds Management.

He is the founder and current Chairman of Adslot and founded Venturian, a privately-owned venture capital fund investing in early-stage technology companies with unique IP, highly scalable business models and global market potential. He led the seed round in Nitro Software and served as a non-executive director and strategic adviser from January 2007 until August 2020.',
  why_work_with_us = 'Rare Australian angel with three founder-exits and a subsequent VC vehicle (Venturian). Unusually large angel cheque band for AU ($50K–$500K). Domain depth across ad-tech, mar-tech, fintech and document/SaaS — useful for founders in those categories.',
  sector_focus = ARRAY['Fintech','AdTech','MarTech','Enterprise SaaS','Document Tech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 500000,
  linkedin_url = 'https://www.linkedin.com/in/andrewjbarlow/',
  contact_email = 'andrew@andrewbarlow.co',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Adslot (founder, Chairman)','Hitwise (co-founder, sold to Experian 2007)','Max Super (founder, sold to Orchard 2007)','Nitro Software (seed lead, NED 2007–2020)','Venturian (founder)'],
  meta_title = 'Andrew Barlow — Adslot, Venturian | Melbourne Angel Investor',
  meta_description = 'Melbourne serial entrepreneur and angel. Founder of Adslot; co-founder Hitwise (Experian exit 2007) and Max Super (Orchard exit 2007); founder Venturian VC.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Adslot (current)','Hitwise (1997, exited 2007)','Max Super (exited 2007)','Venturian'],
    'notable_angel_lead','Led seed round in Nitro Software Limited (NED Jan 2007 – Aug 2020)',
    'exits', ARRAY[
      jsonb_build_object('company','Hitwise','acquirer','Experian Group','year',2007),
      jsonb_build_object('company','Max Super','acquirer','Orchard Funds Management','year',2007)
    ],
    'sources', jsonb_build_object(
      'crunchbase','https://www.crunchbase.com/person/andrew-barlow',
      'linkedin','https://www.linkedin.com/in/andrewjbarlow/',
      'wellfound','https://wellfound.com/p/andrew-barlow',
      'adslot_directors','https://www.adslot.com/investor-relations/directors/',
      'br1dge_about','https://www.br1dge.com/about-us/',
      'marketscreener','https://www.marketscreener.com/insider/ANDREW-BARLOW-A0HGA0/'
    ),
    'corrections','CSV portfolio was truncated ("Hitwise, Adslot, Nitro, Ma..."). Expanded with Max Super and Venturian, both verified by his LinkedIn/Wellfound profile.'
  ),
  updated_at = now()
WHERE name = 'Andrew Barlow';

UPDATE investors SET
  description = 'Sunshine Coast-based tech entrepreneur and angel investor. Co-founder of LIFX (smart lighting) and AngelCube (Melbourne accelerator). Mentor at 500 Startups.',
  basic_info = 'Andrew Birt is a Sunshine Coast-based tech entrepreneur and early-stage investor. He co-founded LIFX, the connected-lighting startup, and AngelCube, one of Melbourne''s earliest accelerator programs. He has served as a mentor with 500 Startups. His activity straddles building new ventures and supporting other early-stage founders.',
  why_work_with_us = 'Accelerator-builder and IoT/hardware founder background. Useful for early-stage founders navigating accelerator fundraising, demo days, US-Australian network-building and consumer-IoT/hardware scale-up.',
  sector_focus = ARRAY['Hardware','IoT','Consumer','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/andrewbirt/',
  location = 'Sunshine Coast, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['LIFX (co-founder)','AngelCube (co-founder)'],
  meta_title = 'Andrew Birt — LIFX, AngelCube | Angel Investor',
  meta_description = 'Sunshine Coast tech entrepreneur and angel. Co-founder of LIFX and AngelCube. 500 Startups mentor.',
  details = jsonb_build_object(
    'founder_of', ARRAY['LIFX','AngelCube (Melbourne accelerator)'],
    'mentor_of', ARRAY['500 Startups'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/andrewbirt/',
      'melbourne_startup_list','https://melbourne.startups-list.com/people'
    ),
    'corrections','CSV had LinkedIn empty, location Melbourne. Public profile indicates Sunshine Coast-based. Location updated.'
  ),
  updated_at = now()
WHERE name = 'Andrew Birt';

UPDATE investors SET
  description = 'Melbourne-based Partner at Archangel Ventures, an Australian pre-seed and seed VC. Ex-Merrill Lynch investment banker ($30B+ in transactions) and ex-Telstra M&A (supported Snap Series F via Telstra Ventures).',
  basic_info = 'Andrew Cicutto is a Partner at Archangel Ventures, a Melbourne-based pre-seed and seed venture capital firm. He joined as Principal in August 2021 and was elevated to Partner, alongside Ben Armstrong and Rayn Ong. Archangel is raising its second fund, targeting AU$40M to back Australian founders at pre-seed and seed.

Andrew''s prior background is in institutional finance: at Merrill Lynch he managed 20+ transactions valued at more than AU$30B, covering cross-border M&A, equity raises, convertible-note financings and capital management for ASX100 companies. He then moved to Telstra, where he ran M&A for Global Enterprise Services and Health, and supported Telstra Ventures on deals including a Series F investment in Snap.',
  why_work_with_us = 'Rare Archangel blend of operator-experienced VC partners backed by institutional-finance rigour. Cicutto specifically brings M&A experience that is useful for founders thinking about strategic exits or acquisition-led growth. Fund is sized small enough to be deeply hands-on at pre-seed/seed.',
  sector_focus = ARRAY['Consumer','AI','Gaming','Enterprise SaaS','Fintech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 25000,
  website = 'https://www.archangel.vc',
  linkedin_url = 'https://www.linkedin.com/in/andrewcicutto/',
  contact_email = 'andrew@archangel.vc',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Fluency','Termina','Skalata (co-investor)','Heaps Normal'],
  meta_title = 'Andrew Cicutto — Archangel Ventures | Melbourne Angel/VC',
  meta_description = 'Melbourne Partner at Archangel Ventures (pre-seed/seed VC raising AU$40M Fund II). Ex-Merrill Lynch, ex-Telstra M&A.',
  details = jsonb_build_object(
    'firm','Archangel Ventures',
    'role','Partner (since Aug 2021)',
    'co_partners', ARRAY['Ben Armstrong','Rayn Ong'],
    'fund','Archangel Fund II — targeting AU$40M (Australian pre-seed and seed)',
    'prior_roles', ARRAY[
      'Merrill Lynch — 20+ transactions, AU$30B+ value',
      'Telstra M&A — Global Enterprise Services and Health',
      'Telstra Ventures — supported Series F in Snap'
    ],
    'latest_news', jsonb_build_array(
      jsonb_build_object('headline','"Small is beautiful": Archangel''s $40m raise could signal smaller funds are back','url','https://www.capitalbrief.com/article/small-is-beautiful-could-archangels-40m-raise-signal-smaller-funds-are-back-a0ba1eda-a859-4119-b4e3-a2be1aeb56f0/','date','2025')
    ),
    'sources', jsonb_build_object(
      'firm_team','https://www.archangel.vc/meet-our-team',
      'firm_approach','https://www.archangel.vc/about-us',
      'firm_blog','https://www.archangel.vc/blog',
      'linkedin','https://www.linkedin.com/in/andrewcicutto/',
      'equilar','https://people.equilar.com/bio/person/andrew-cicutto-archangel/53726274',
      'capital_brief_fund_ii','https://www.capitalbrief.com/article/small-is-beautiful-could-archangels-40m-raise-signal-smaller-funds-are-back-a0ba1eda-a859-4119-b4e3-a2be1aeb56f0/'
    ),
    'corrections','CSV portfolio was truncated ("Fund: Fluency, Termina, H..."). Expanded to Fluency, Termina, plus Skalata (as co-investor) and Heaps Normal from Archangel''s public portfolio.'
  ),
  updated_at = now()
WHERE name = 'Andrew Cicutto';

COMMIT;
