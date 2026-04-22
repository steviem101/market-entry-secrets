-- Enrich angel investors — pilot batch (3 records)
-- Source research: public web (firm sites, Crunchbase/PitchBook snippets, Medium, Innovation Bay,
--                  Startup Daily, Business News Australia, LinkedIn public pages, podcasts).
-- Rows targeted already exist (inserted via scripts/import_investors.sql).
-- Fields enriched: description, basic_info, why_work_with_us, sector_focus, stage_focus,
--   portfolio_companies, website, application_url, leads_deals, currently_investing,
--   meta_title, meta_description, details (sources, latest_news, thesis, exclusions, etc.).
-- Every factual claim has a URL in details.sources. Unverified items are flagged in details.corrections.

BEGIN;

-- =====================================================================
-- 1. Alan Jones (Sydney) — General Partner, M8 Ventures
-- =====================================================================
UPDATE investors SET
  description = 'Co-founder and General Partner of M8 Ventures, a pre-seed and seed syndicate on Aussie Angels. 25+ years in Australian tech; founding investor in Pollenizer, Startmate and Blackbird Ventures. Founder coach and former EIR at muru-D.',
  basic_info = 'Alan Jones is one of the most active early-stage tech investors in Australia. He rose through product ranks from Yahoo''s first product hire in Australia to Product Director, South Asia, then founded The New Agency (acquired by BlueChilli in 2012). He has been a founding investor in Pollenizer, Startmate and Blackbird Ventures and has personally invested in 30+ startups.

He co-founded M8 Ventures with Emily Rich. M8 is a pre-seed and seed specialist that, after handing back its AFSL, now runs as an angel syndicate on the Aussie Angels platform. In its first partial year (2024) M8 syndicate members deployed approximately AU$1.7M across eight startups between idea stage and pre-Series A. M8 led the pre-Series A of telehealth startup Hola Health in April 2024 and returned to participate in the April 2025 Series A extension led by Woolworths Group subsidiary W23.

Alan is also a founder coach (startupfoundercoach.com), a regular writer on Medium (bigyahu.medium.com), and a host on DayOne.fm. He has mentored through BlueChilli, Catalysr, Collider, CyRise, Monash University, muru-D, Remarkable, Startmate, Sydney School of Entrepreneurship and UTS.',
  why_work_with_us = 'Deep pre-seed/seed experience across Australian tech going back to the founding rounds of Canva, Pollenizer, Startmate and Blackbird Ventures. Explicit focus on backing diverse teams (women, LGBTQI+, refugees, migrants, young entrepreneurs). Operates a live syndicate on Aussie Angels so founders get both lead conviction and a broader angel group on cap table. Hands-on coaching orientation; writes publicly about thesis and portfolio.',
  sector_focus = ARRAY['Software','Enterprise SaaS','Consumer Tech','HealthTech','AI','Hardware'],
  stage_focus = ARRAY['Pre-seed','Seed','Pre-Series A'],
  check_size_min = 25000,
  check_size_max = 200000,
  website = 'https://m8.ventures',
  application_url = 'https://app.aussieangels.com/syndicate/m8-ventures',
  linkedin_url = 'https://www.linkedin.com/in/alanjones/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY[
    'Canva','Pollenizer','Startmate','Blackbird Ventures','Bugcrowd','Biteable',
    'Propeller Aero','HappyCo','UpGuard','Hola Health','SeenCulture','Emanda',
    'Tzukuri','Tyde','Workyard','Macropod','Shoeboxed','Elevio','Cardly',
    'HowAboutEat','Chromasun','Muru Music','GeoSnap','TopMe','Upperstory','Buzzy'
  ],
  meta_title = 'Alan Jones — M8 Ventures | Angel Investor Profile',
  meta_description = 'Sydney-based pre-seed and seed angel investor. General Partner at M8 Ventures. Founding investor in Pollenizer, Startmate and Blackbird Ventures.',
  details = jsonb_build_object(
    'fund', 'M8 Ventures',
    'role', 'Co-founder & General Partner',
    'investment_thesis', 'Back teams from pre-seed who are building a world-class technology product, with an explicit bias toward diverse founders (women, LGBTQI+, refugees, migrants, young entrepreneurs) across Australia, New Zealand and high-growth emerging markets.',
    'exclusions', ARRAY['Defence (explicitly stated on LinkedIn, May 2025)'],
    'fund_size_raw', 'Angel syndicate; first partial year (2024) deployed ~AU$1.7M across 8 startups.',
    'geography', ARRAY['Australia','New Zealand','High-growth emerging markets'],
    'programs_mentored', ARRAY['BlueChilli','Catalysr','Collider','CyRise','Monash University','muru-D','Remarkable','Startmate','Sydney School of Entrepreneurship','UTS'],
    'media_presence', ARRAY[
      'Medium: https://bigyahu.medium.com/',
      'DayOne.fm host',
      'Startup Founder Coach: https://startupfoundercoach.com/',
      'The Halo Effect podcast (Airtree)'
    ],
    'notable_co_investors', ARRAY['W23 (Woolworths Group)','InterValley Ventures','Simon Wright'],
    'latest_news', jsonb_build_array(
      jsonb_build_object('headline','Hola Health Series A extension totals AU$10M (W23-led)','url','https://medium.com/m8-ventures/hola-health-secures-10-million-led-by-woolworths-group-subsidiary-ba275697281b','date','April 2025'),
      jsonb_build_object('headline','Emanda pre-seed (AU$300k) led by M8 Ventures','url','https://medium.com/m8-ventures/emandas-pre-seed-round-backs-a-smarter-way-to-value-a-business-be0947ea10bf','date','December 2025'),
      jsonb_build_object('headline','M8 Ventures returns to lead AU$4.5M pre-Series A for Hola Health','url','https://www.startupdaily.net/topic/funding/m8-ventures-returns-to-lead-4-5m-pre-series-a-for-medtech-startup-hola-health/','date','April 2024'),
      jsonb_build_object('headline','2024: M8 Ventures starts investing','url','https://medium.com/m8-ventures/2024-m8-ventures-starts-investing-4e7c15f90866','date','2024')
    ),
    'sources', jsonb_build_object(
      'firm_site','https://m8.ventures/who-we-are',
      'syndicate','https://app.aussieangels.com/syndicate/m8-ventures',
      'crunchbase','https://www.crunchbase.com/person/alan-jones',
      'linkedin','https://www.linkedin.com/in/alanjones/',
      'medium','https://bigyahu.medium.com/',
      'podcast','https://dayone.fm/people/alan-jones',
      'interview','https://pioneera.com/content/blog/take-5-with-alan-jones',
      'third_hemisphere','https://channellife.com.au/story/tech-investor-alan-jones-joins-third-hemisphere-as-tech-investments-director',
      'hola_health_news','https://www.businessnewsaustralia.com/articles/hola-health-greets-a-new-chapter-in-telehealth-with--4-5m-pre-series-a-raise.html'
    ),
    'corrections', 'Prior sector_focus array was truncated ("Software engineering, Ent..."). Reconstructed from public M8 portfolio and Alan''s personal investment track record. check_size_min/max: personal cheques historically small (~$30k); syndicate round participation larger ($300k–$4.5M). Range given reflects personal angel cheque band.'
  ),
  updated_at = now()
WHERE name = 'Alan Jones';

-- =====================================================================
-- 2. Adam Milgrom (Melbourne) — Partner, Giant Leap / Co-founder, Tripple
-- =====================================================================
UPDATE investors SET
  description = 'Partner at Giant Leap, Australia''s first VC dedicated 100% to impact startups. Co-founder and Executive Director of Tripple family office. Board Director at Future Super. Angel investor in 20+ impact startups.',
  basic_info = 'Adam Milgrom is a Melbourne-based impact investor. He began in marketing and strategy, helping companies navigate the shift to digital, before concluding that he would "only work with those solving problems that mattered." He now invests across three overlapping vehicles:

1. **Giant Leap** — Partner at Australia''s first 100%-impact venture capital fund, backing seed to Series A impact-first companies in clean energy, financial inclusion, education, food and health.
2. **Tripple** — Co-founder and Executive Director of a family office that has built a 100% Impact Portfolio spanning all asset classes, blending investing and grant-making.
3. **Personal angel** — 20+ personal investments including Applied, Mindset, Amber Electric, Future Super and YourGrocer. Holds board seats at Future Super and YourGrocer, and is a Board Director / Investment Committee member at the Australian Communities Foundation.

Adam is a recurring voice on Australian impact investing — featured on The Startup Playbook (Ep125), Humans of Purpose (Ep170), Innovation Bay''s Angel Voices series, and the Impact Investment Summit Asia Pacific.',
  why_work_with_us = 'One of very few Australian investors with a genuine, disclosed 100%-impact thesis across both a fund (Giant Leap) and a family office (Tripple). Active director-level operator — useful for founders who want a board-capable early backer. Strong network in impact, ESG and philanthropic capital, including the Australian Communities Foundation.',
  sector_focus = ARRAY['Impact','CleanEnergy','FinTech','FoodTech','HealthTech','EdTech','Climate'],
  stage_focus = ARRAY['Seed','Series A'],
  website = 'https://www.giantleap.com.au',
  linkedin_url = 'https://www.linkedin.com/in/amilgrom/',
  contact_email = 'adam@dotpoint.co',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY[
    'Future Super','YourGrocer','Amber Electric','Applied','Mindset',
    'Spriggy','Giant Leap Fund (GP)','Tripple (co-founder)'
  ],
  meta_title = 'Adam Milgrom — Giant Leap, Tripple | Impact Angel Investor',
  meta_description = 'Melbourne impact investor. Partner at Giant Leap, Australia''s first 100% impact VC. Co-founder of Tripple family office. Board Director at Future Super.',
  details = jsonb_build_object(
    'vehicles', jsonb_build_object(
      'fund','Giant Leap',
      'family_office','Tripple',
      'angel','Personal direct investments'
    ),
    'investment_thesis', 'Intersection of trusted team execution, meaningful problems, and believable solutions — 100% impact-aligned. "Once I realised I could choose who to work with, it was obvious that I should only work with those solving problems that mattered."',
    'founder_preferences', 'Values founders with genuine vision and autonomy. Cautionary note from his own early mistakes: avoid investing based on your idea of what the company should do, without regard to what founders actually want to do.',
    'philosophy_on_angel_investing', ARRAY[
      'If your motivation is primarily to make money, reconsider — this is a long game.',
      'Build a diverse portfolio across multiple companies.',
      'Be patient and measured.'
    ],
    'exclusions', ARRAY['Non-impact businesses','Technologies he cannot understand'],
    'board_roles', ARRAY['Future Super (Board Director)','YourGrocer','Australian Communities Foundation (Board & Investment Committee)'],
    'media_presence', ARRAY[
      'The Startup Playbook Ep125',
      'Humans of Purpose Ep170',
      'Connect to Capital podcast',
      'Impact Investment Summit Asia Pacific (speaker, 2024)',
      'Innovation Bay Angel Voices'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/amilgrom/',
      'giant_leap','https://www.giantleap.com.au/team',
      'innovation_bay','https://innovationbay.com/insights/angel-voices-adam-milgrom/',
      'impact_summit','https://impactinvestmentsummit.com/speakers-2024/adam-milgrom/',
      'crunchbase','https://www.crunchbase.com/person/adam-milgrom-2',
      'pitchbook','https://pitchbook.com/profiles/investor/312771-34',
      'podcast_startup_playbook','https://startupplaybook.co/2020/08/ep125-adam-milgrom-venture-partner-giant-leap-fund-on-building-your-decision-making-muscle/',
      'podcast_humans_of_purpose','https://podcasts.apple.com/au/podcast/170-adam-milgrom-impact-investing/id1205858107',
      'impact_group','https://www.impact-group.com.au/people/adam-milgrom/'
    ),
    'corrections', 'Prior sector_focus was truncated ("Impact, Fintech, Environ..."). Prior portfolio list had "Future Super, Spriggy, Mi..." — verified Future Super and reconstructed full verified portfolio; Spriggy appears in the original CSV but could not be independently verified in public sources (flagging as unverified). Added Giant Leap and Tripple as the primary investment vehicles rather than just personal cheques.',
    'unverified', ARRAY['Spriggy investment — listed in original CSV but not confirmed via Crunchbase / PitchBook public data']
  ),
  updated_at = now()
WHERE name = 'Adam Milgrom';

-- =====================================================================
-- 3. Adrenalin Equity (Sydney) — Principal-capital seed VC
-- =====================================================================
UPDATE investors SET
  description = 'Australian principal-capital seed VC. Invests own money (not a managed fund) at pre-seed and seed across industrial, aerospace, defence and deep-tech. Led by Principal Investor Nicholas Assef.',
  basic_info = 'Adrenalin Equity is an Australian seed venture capital investor that puts its own capital at risk rather than managing outside funds. The firm''s stated positioning is "seed capital investment at Day One — before the world believes," with an emphasis on lean operations, hands-on founder support, and IP development and protection.

Principal Investor Nicholas Assef (LLB(Hons), LLM, MIP, MBA) leads the firm. The team describes themselves as founders first and orient their support around operational execution rather than polished presentations. Adrenalin Equity is explicit that it is highly confidential about the projects and companies it backs, which is why a portfolio list is not published.',
  why_work_with_us = 'Principal capital rather than a LP-backed fund means decision speed and alignment with founders over LPs. Legal and IP expertise in-house via Nicholas Assef''s background. Comfort with industrial, aerospace and defence categories that many Australian angel syndicates explicitly avoid.',
  sector_focus = ARRAY['Industrial','Aerospace','Defence','Deep Tech','Hardware'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 250000,
  website = 'https://www.adrenalinequity.com',
  application_url = 'https://www.adrenalinequity.com',
  contact_email = 'pitch@adrenalinequity.com',
  contact_name = 'Nicholas Assef',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  meta_title = 'Adrenalin Equity — Sydney Principal-Capital Seed VC',
  meta_description = 'Sydney seed VC investing own capital at pre-seed and seed across industrial, aerospace, defence and deep-tech. Cheques AU$50k–$250k.',
  details = jsonb_build_object(
    'firm_type', 'Principal-capital seed VC (not a managed fund)',
    'principal_investor', jsonb_build_object(
      'name','Nicholas Assef',
      'qualifications','LLB(Hons), LLM, MIP, MBA'
    ),
    'investment_thesis', 'Seed capital at Day One — before the world believes. Backs raw ambition, relentless determination, unique insights and impossible ideas, with strong emphasis on IP development and protection.',
    'geography', ARRAY['Australasia','Pacific'],
    'portfolio_companies_note', 'Firm is explicitly confidential about portfolio — no public list.',
    'phone', '+61 2 9262 2121',
    'secondary_email', 'vc@adrenalinequity.com',
    'sources', jsonb_build_object(
      'firm_site','https://www.adrenalinequity.com/',
      'private_equity_list','https://privateequitylist.com/investors/venture-capital/aerospace'
    ),
    'corrections', 'Original CSV had truncated sector_focus ("Industrial, aerospace, def..."). Expanded to include Deep Tech and Hardware based on firm site and sector listings. Portfolio companies field left empty because firm publicly states it is confidential about holdings — flagging this rather than inventing.'
  ),
  updated_at = now()
WHERE name = 'Adrenalin Equity';

COMMIT;
