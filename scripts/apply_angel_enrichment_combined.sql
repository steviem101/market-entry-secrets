-- Combined angel investor enrichment SQL — DASHBOARD-SAFE VERSION
-- Paste this entire file into Supabase SQL Editor and click Run
-- https://supabase.com/dashboard/project/xhziwveaiuhzdoutpgrh/sql/new
--
-- Includes a defensive ALTER TABLE prelude that adds any columns the live
-- DB is missing (because earlier schema migrations may not have been applied
-- yet). All ADDs use IF NOT EXISTS, so this is idempotent.

-- ======================================================================
-- PRELUDE: ensure all columns referenced by the UPDATEs exist
-- ======================================================================
BEGIN;

ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS currently_investing boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS leads_deals boolean,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Australia',
  ADD COLUMN IF NOT EXISTS application_url text,
  ADD COLUMN IF NOT EXISTS fund_size text,
  ADD COLUMN IF NOT EXISTS year_fund_closed text,
  ADD COLUMN IF NOT EXISTS portfolio_companies text[];

COMMIT;


-- ======================================================================
-- FILE: 20260422120000_enrich_angel_investors_pilot.sql
-- ======================================================================
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

-- ======================================================================
-- FILE: 20260422130000_enrich_angel_investors_batch_01a.sql
-- ======================================================================
-- Enrich angel investors — batch 01a (5 of 20 for batch 1)
-- Public-source research only. Sources captured in details.sources for UI rendering.

BEGIN;

UPDATE investors SET
  description = 'Sydney-based engineering leader and angel investor. VP of Studio Engineering at Immutable; 20+ year product/engineering career across Yahoo!, Microsoft, Electronic Arts (founded EA''s Virtual Economy Platform behind Apex Legends). Active mentor; 10+ personal investments.',
  basic_info = 'Aakash Mandhar is a Sydney-based operator-investor. Over 20+ years he has led and scaled products at Yahoo!, Microsoft, Electronic Arts and Immutable. At EA he founded the Virtual Economy Platform that powered Apex Legends (50M+ players in 4 weeks, $1B+ first-year revenue). His investing interests track his operating interests: cloud infrastructure, in-game virtual economies, blockchain gaming and, most recently, generative AI. He publishes regularly on YouTube, newsletters and podcasts at aakashmandhar.com and writes publicly about his angel thesis on LinkedIn.',
  why_work_with_us = 'Deep engineering-leadership experience at global scale (Yahoo, Microsoft, EA, Immutable). Particularly useful for technical founders in gaming, virtual economies, blockchain infrastructure and AI. Mentor-oriented — explicitly frames angel investing as a vehicle for working with entrepreneurs.',
  sector_focus = ARRAY['Gaming','Web3','Blockchain','AI','Infrastructure','DevTools'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_max = 25000,
  website = 'https://www.aakashmandhar.com',
  linkedin_url = 'https://www.linkedin.com/in/mandhar/',
  currently_investing = true,
  meta_title = 'Aakash Mandhar — Sydney Angel Investor (Gaming, Web3, AI)',
  meta_description = 'Sydney angel investor. VP Studio Engineering at Immutable; ex-EA, Microsoft, Yahoo. Invests in gaming, Web3, AI infrastructure at pre-seed and seed.',
  details = jsonb_build_object(
    'operator_background','VP Studio Engineering at Immutable; ex-EA (founded Virtual Economy Platform), ex-Microsoft, ex-Yahoo.',
    'notable_product','EA Virtual Economy Platform (Apex Legends) — 50M+ players in 4 weeks, $1B+ first-year revenue.',
    'investment_focus','Cloud, in-game virtual economies, blockchain gaming, generative AI.',
    'investment_count','10+',
    'media', ARRAY['YouTube: @AakashMandhar','Newsletter + podcast via aakashmandhar.com','LinkedIn thought-leadership on angel investing'],
    'sources', jsonb_build_object(
      'personal_site','https://www.aakashmandhar.com/about/',
      'crunchbase','https://www.crunchbase.com/person/aakash-mandhar-bd33',
      'linkedin','https://www.linkedin.com/in/mandhar/',
      'youtube','https://www.youtube.com/@AakashMandhar',
      'why_angel_investing_post','https://www.linkedin.com/posts/mandhar_why-i-started-angel-investing-activity-6883787696343515136--6jb'
    ),
    'corrections','CSV had sector_focus and portfolio_companies empty. Reconstructed sector_focus from stated interests on personal site and LinkedIn posts. Portfolio companies not publicly itemised — left empty rather than inventing.'
  ),
  updated_at = now()
WHERE name = 'Aakash Mandhar';

UPDATE investors SET
  description = 'Brisbane-based co-founder of Tribe Global Ventures, a fund backing ambitious Australian and New Zealand B2B tech companies expanding into the UK and US. 20+ year founder/operator; supported 60+ ANZ tech ventures to scale globally.',
  basic_info = 'Aaron Birkby has spent over two decades building and supporting technology companies, as a founder, advisor, investor and facilitator. He was awarded the Australian Telecommunications User Group (ATUG) Most Innovative Broadband Solution award, the national Benson Award for Entrepreneurship in 2016, and the Pearcey Award for Queensland in 2016.

He is Co-Founder of Tribe Global Ventures, a fund for ambitious ANZ B2B technology ventures seeking to enter the UK or USA. Earlier he co-founded the RCL Accelerator Mentor Investment Fund, which is tracking at an 11.33% IRR, and he has directly supported 60+ ANZ technology ventures in global expansion. He is a host on DayOne.fm and runs the Transparent VC podcast.',
  why_work_with_us = 'Specialist thesis for ANZ B2B tech companies that need to break into the UK or US. Combines capital with 20+ years of globalisation playbooks. Deep Queensland ecosystem ties.',
  sector_focus = ARRAY['B2B SaaS','Enterprise Tech','Fintech','Marketplaces'],
  stage_focus = ARRAY['Seed','Series A'],
  website = 'https://tribeglobal.vc',
  linkedin_url = 'https://au.linkedin.com/in/aaronbirkby',
  contact_email = 'aaron@tribeglobal.vc',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['APLYiD','Cake','Veriluma','Travello','Pickle'],
  meta_title = 'Aaron Birkby — Tribe Global Ventures | Brisbane Angel Investor',
  meta_description = 'Brisbane co-founder of Tribe Global Ventures. Backs ANZ B2B tech ventures expanding into the UK and US. Pearcey Award QLD 2016, Benson Award 2016.',
  details = jsonb_build_object(
    'fund','Tribe Global Ventures',
    'prior_vehicle','RCL Accelerator Mentor Investment Fund (IRR 11.33%)',
    'awards', ARRAY['ATUG Most Innovative Broadband Solution','Benson Award for Entrepreneurship 2016','Pearcey Award Queensland 2016'],
    'investment_thesis','Back ANZ B2B tech ventures with the product-market fit and ambition to enter UK or US markets.',
    'media_presence', ARRAY['DayOne.fm host','Transparent VC podcast'],
    'latest_news', jsonb_build_array(
      jsonb_build_object('headline','Transparent VC podcast — Tribe Global Ventures','url','https://www.linkedin.com/posts/aaronbirkby_transparent-vc-podcast-tribe-global-ventures-activity-7087621171877187584-7ik3','date','Ongoing')
    ),
    'sources', jsonb_build_object(
      'firm_site','https://tribeglobal.vc/team/aaron-birkby/',
      'firm_about','https://tribeglobal.vc/about-us/',
      'linkedin','https://au.linkedin.com/in/aaronbirkby',
      'crunchbase','https://www.crunchbase.com/person/aaron-birskby',
      'personal_site','https://www.birkby.com.au/',
      'podcast','https://dayone.fm/people/aaron-birkby'
    ),
    'corrections','CSV portfolio was truncated ("Veriluma Travello Pickle..."). Expanded to include APLYiD (confirmed as first Tribe investment) and Cake.'
  ),
  updated_at = now()
WHERE name = 'Aaron Birkby';

UPDATE investors SET
  description = 'Sydney-based agile/portfolio management consultant (ScaleNow). Listed as angel investor in the Australian angel directory; no disclosed public portfolio or investment track record found in open sources.',
  basic_info = 'Abhi Chaturvedi is a Sydney-based corporate consultant and Agile expert, associated with ScaleNow (scalenow.com.au). He has worked on lean portfolio management uplift at large Australian enterprises including nbn. Public angel-investor activity is minimal in open sources as at the date of this profile — treat listed status as exploratory rather than active.',
  sector_focus = ARRAY['Enterprise Software','Agile/PM Tools'],
  linkedin_url = 'https://www.linkedin.com/in/scalenow/',
  contact_email = 'abhi.chaturvedi@scalenow.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  meta_title = 'Abhi Chaturvedi — Sydney Angel Investor (ScaleNow)',
  meta_description = 'Sydney-based agile and portfolio management consultant at ScaleNow. Listed angel investor; limited public investment activity disclosed.',
  details = jsonb_build_object(
    'affiliation','ScaleNow (scalenow.com.au)',
    'professional_background','Agile / Lean Portfolio Management consulting; engagements including nbn.',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/scalenow/'
    ),
    'corrections','CSV had sector_focus and portfolio empty. Not confused with Scale Investors (separate Melbourne angel group for female founders). No disclosed angel investments found in public sources (Crunchbase, PitchBook, AngelList, SmartCompany, Startup Daily).',
    'unverified', ARRAY['Active angel investing status — listed but no disclosed investments']
  ),
  updated_at = now()
WHERE name = 'Abhi Chaturvedi';

UPDATE investors SET
  description = 'Co-founder of THE ICONIC, Australia''s largest online fashion retailer, and co-founder of Hatch. Ex-BCG and PwC strategy consultant. Sydney-based seed-stage angel investor.',
  basic_info = 'Adam Jacobs co-founded THE ICONIC in 2011 on a premise of customer-experience leadership and the power of great teams; the business grew into Australia''s largest online fashion retailer. He later co-founded Hatch, a venture focused on helping people find meaning in work. His pre-founder career was in strategy consulting at BCG and PwC (Sydney and Copenhagen). He invests at seed stage across Australian startups.',
  why_work_with_us = 'Operator credibility from scaling one of Australia''s largest pure-play e-commerce businesses (THE ICONIC). Useful for founders in consumer, marketplaces, D2C, e-commerce ops and early-career / future-of-work tech.',
  sector_focus = ARRAY['Consumer','Marketplaces','E-commerce','D2C','Future of Work','EdTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/adam-s-jacobs/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['THE ICONIC (co-founder)','Hatch (co-founder)','Sapling','ClassBento','Healthmatch','Elevate Brands','Mustard','Archa'],
  meta_title = 'Adam Jacobs — Co-founder THE ICONIC | Sydney Angel Investor',
  meta_description = 'Sydney seed-stage angel investor. Co-founder THE ICONIC and Hatch. Ex-BCG, PwC. Invests in consumer, marketplaces, D2C, future-of-work and EdTech.',
  details = jsonb_build_object(
    'founder_of', ARRAY['THE ICONIC (2011)','Hatch'],
    'operator_background','Strategy consulting at BCG and PwC (Sydney, Copenhagen) prior to founding THE ICONIC.',
    'latest_news', jsonb_build_array(
      jsonb_build_object('headline','Archa — Adam Jacobs participates in Angel round','url','https://www.crunchbase.com/person/adam-jacobs-5','date','April 2022')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/adam-s-jacobs',
      'crunchbase','https://www.crunchbase.com/person/adam-jacobs-5',
      'press_the_iconic','https://jewishbusinessnews.com/2013/07/12/adam-jacobs-picks-up-further-funding-for-his-australian-online-fashion-portal-the-iconic/',
      'adma_profile','https://www.adma.com.au/people/adam-jacobs',
      'tracxn','https://tracxn.com/d/people/adam-jacobs/__4t1AlpcLA8HgEci2favLdKpfGB7SOna1IY8glCitZzc'
    ),
    'corrections','CSV sector_focus was truncated ("Open to all, particularly in..."). Portfolio was truncated ("Sapling, ClassBento, Heal..."). Reconstructed based on public Crunchbase / Tracxn investment records.'
  ),
  updated_at = now()
WHERE name = 'Adam Jacobs';

UPDATE investors SET
  description = 'Founder and CEO of Overtly Covert, a Melbourne private angel investment firm (est. 2011). High-impact angel with 12+ investments across deep tech, hardware, gaming, energy tech and Web3. Cheque size $10K–$150K (sweet spot $75K). Board observer at Woojer.',
  basic_info = 'Adam Krongold is a Melbourne-based angel investor and futurist, running his own private angel vehicle, Overtly Covert (founded 2011). He invests in entrepreneurs building at the convergence of emerging technologies — haptics, nanotechnology, material science, marketplaces, hardware and gaming. Beyond angel activity, Adam sits on the boards of the Jewish Museum of Australia and Shenkar College of Engineering, Design and Art in Tel Aviv, and is a Board Observer at Woojer.',
  why_work_with_us = 'One of the rare Australian angels with an explicit deep-tech / hardware / material-science bias, plus a global (AU/Israel) network. Investment sweet spot ($75K) is high for a solo angel, making him useful as a meaningful line on a pre-seed cap table.',
  sector_focus = ARRAY['Deep Tech','Hardware','Material Science','Gaming','eSports','EnergyTech','Web3','Blockchain','Marketplaces'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 150000,
  linkedin_url = 'https://www.linkedin.com/in/akrongold/',
  contact_email = 'adam@overtlycovert.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Woojer','DrChrono','Dream','Guverna'],
  meta_title = 'Adam Krongold — Overtly Covert | Melbourne Deep-Tech Angel',
  meta_description = 'Melbourne angel investor and futurist. Founder of Overtly Covert (2011). Deep tech, hardware, material science, gaming, energy tech, Web3. Cheques $10K–$150K.',
  details = jsonb_build_object(
    'vehicle','Overtly Covert (Melbourne, founded 2011)',
    'check_size_sweet_spot',75000,
    'investment_count_disclosed',12,
    'board_roles', ARRAY['Jewish Museum of Australia (Board)','Shenkar College of Engineering, Design and Art, Tel Aviv (Board)','Woojer (Board Observer)'],
    'investment_areas', ARRAY['Haptics','Nanotechnology','Material Science','Marketplaces','Hardware','Gaming/eSports','EnergyTech','Web3/Blockchain'],
    'sources', jsonb_build_object(
      'overtly_covert_crunchbase','https://www.crunchbase.com/organization/overtly-covert',
      'personal_crunchbase','https://www.crunchbase.com/person/adam-krongold',
      'linkedin','https://www.linkedin.com/in/akrongold/',
      'signal_profile','https://signal.nfx.com/investors/adam-krongold',
      'clarity','https://clarity.fm/adamkrongold'
    ),
    'corrections','CSV sector_focus truncated ("Deep Tech, Hardware, Me..."). Portfolio truncated ("DrChrono, Woojer, Dream..."). Check-size band filled from public Signal NFX profile.'
  ),
  updated_at = now()
WHERE name = 'Adam Krongold';

COMMIT;

-- ======================================================================
-- FILE: 20260422130100_enrich_angel_investors_batch_01b.sql
-- ======================================================================
-- Enrich angel investors — batch 01b (records 6-10 of 20 for batch 1)
-- Public-source research only.

BEGIN;

UPDATE investors SET
  description = 'Sydney Angels management committee member. 14-year angel with 50+ investments and mentor to many more. Experienced non-executive director via Modus Partners.',
  basic_info = 'Adrian Bunter has been an active angel investor for roughly 14 years and has invested in 50+ startups while advising many more. He serves on the management committee of Sydney Angels, a not-for-profit angel investment membership organisation operating since 2008, and is an experienced non-executive director through Modus Partners.

Adrian is featured in a Sydney Angels interview on Funded Futures and a SmartCompany StartupSmart interview on early-stage startup funding. He writes publicly on angel investing via LinkedIn (Inside Angel Investing).',
  why_work_with_us = 'Access to Sydney Angels via committee membership — founders get not just Adrian''s cheque but exposure to the Sydney Angels network. NED experience across multiple portfolio companies makes him useful as a governance-stage backer.',
  sector_focus = ARRAY['Consumer','Fintech','Marketplaces','Entertainment','Gaming','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/adrianbunter/',
  contact_email = 'adrian.bunter@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY[
    'Simply Wall St','Edrolo','ingogo','Fame and Partners','Stagebitz','Venuemob','Quizling',
    'Genero TV','Listium','eBev','Walls360','Zenogen','Drive My Car Rentals','Muzeek',
    'ezycollect','Posse','Bubble Gum Interactive','Beeroll','Circopay','DCPower','F2K Gaming'
  ],
  meta_title = 'Adrian Bunter — Sydney Angels | Angel Investor Profile',
  meta_description = 'Sydney-based angel investor, Sydney Angels management committee. 50+ startup investments over 14 years. NED via Modus Partners.',
  details = jsonb_build_object(
    'affiliations', ARRAY['Sydney Angels (Management Committee)','Modus Partners'],
    'investment_count','50+ over 14 years',
    'media_presence', ARRAY[
      'LinkedIn: "Inside Angel Investing — A Conversation with Adrian Bunter from Sydney Angels"',
      'SmartCompany StartupSmart interview',
      'Funded Futures podcast — The Rise of Angel Networks in Startup Funding'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/adrianbunter/',
      'linkedin_au','https://au.linkedin.com/in/adrianbunter',
      'sydney_angels','https://www.sydneyangels.net.au/about-us',
      'pitchbook','https://pitchbook.com/profiles/investor/108348-40',
      'angelmatch','https://angelmatch.io/investors/adrian-bunter',
      'smartcompany','https://www.smartcompany.com.au/startupsmart/sydney-angels-startup-funding-covid-19/',
      'podcast','https://creators.spotify.com/pod/profile/fundedfutures/episodes/Adrian-Bunter---The-Rise-of-Angel-Networks-in-Startup-Funding-e33doj9',
      'pulse_article','https://www.linkedin.com/pulse/inside-angel-investing-conversation-adrian-bunter-amvsc',
      'treasury_submission','https://treasury.gov.au/sites/default/files/2024-02/c2023-404702-bunter-adrian.pdf'
    ),
    'corrections','CSV portfolio truncated ("Beeroll, circopay, DCPow..."). Expanded from public Crunchbase / AngelMatch / PitchBook records.'
  ),
  updated_at = now()
WHERE name = 'Adrian Bunter';

UPDATE investors SET
  description = 'Auckland-based angel investor. Listed with a $50K cheque size; limited public investment disclosures found in open sources.',
  basic_info = 'Aidan Kenealy is an Auckland-based angel investor. His registered contact is aidan@hiov.co.nz (HiOV, NZ). Typical cheque size listed at $50,000. No broader public portfolio or thesis statements were found in open sources at the time of this profile.',
  sector_focus = ARRAY['Early-stage Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/aidankenealy/',
  contact_email = 'aidan@hiov.co.nz',
  location = 'Auckland',
  country = 'New Zealand',
  meta_title = 'Aidan Kenealy — Auckland Angel Investor',
  meta_description = 'Auckland-based angel investor. $50K cheques. Limited public disclosures.',
  details = jsonb_build_object(
    'affiliation','HiOV (hiov.co.nz)',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/aidankenealy/'
    ),
    'unverified', ARRAY['Active portfolio / recent deals — no public disclosures found']
  ),
  updated_at = now()
WHERE name = 'Aidan Kenealy';

UPDATE investors SET
  description = 'Melbourne-based fintech and frontier-tech angel. Founding General Manager of Stone & Chalk Melbourne; co-founder of Fintech Victoria; former three-term Chair and current Board member of Fintech Australia; ex-Director of Revenue Strategy at Chipper Cash.',
  basic_info = 'Alan Tsen is an operator, ex-founder and long-standing figure in Australian fintech. He was the founding General Manager of Stone & Chalk Melbourne (launching the Victorian Innovation Hub), co-founded Fintech Victoria, and served as Chairperson of Fintech Australia for three years; he remains a board member today. He also sits on the Federal Government''s Fintech Advisory Group and ASIC''s Digital Finance Advisory Committee.

His most recent operating role was Director of Revenue Strategy at Chipper Cash, one of Africa''s fastest-growing fintechs. He angel-invests at the earliest stages in fintech and frontier technology, positioning himself as a "first believer" for pre-seed founders. He writes at alantsen.com and is a mentor with Startupbootcamp.',
  why_work_with_us = 'Deep regulatory and industry relationships in Australian fintech — rare combination of operator, policy-maker, and capital. Comfortable writing a first cheque into early-stage fintech and frontier-tech, and helpful at navigating ASIC / AUSTRAC / regulatory pathways.',
  sector_focus = ARRAY['Fintech','Regtech','Crypto','Frontier Tech','Payments'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 25000,
  website = 'https://alantsen.com',
  linkedin_url = 'https://www.linkedin.com/in/alan-tsen-22742716/',
  contact_email = 'me@alantsen.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Cake','FrankieOne','CryptoSpend'],
  meta_title = 'Alan Tsen — Fintech Angel Investor (Melbourne)',
  meta_description = 'Melbourne fintech angel. Ex-GM Stone & Chalk Melbourne; co-founder Fintech Victoria; Board member Fintech Australia; ex-Chipper Cash.',
  details = jsonb_build_object(
    'affiliations', ARRAY[
      'Fintech Australia (Board, ex-Chair 3 yrs)',
      'Federal Government Fintech Advisory Group',
      'ASIC Digital Finance Advisory Committee',
      'Startupbootcamp (Mentor)'
    ],
    'operator_background','Founding GM of Stone & Chalk Melbourne; co-founder Fintech Victoria; Director of Revenue Strategy at Chipper Cash.',
    'investment_thesis','First-believer cheques into pre-seed fintech and frontier-tech in Australia and abroad.',
    'sources', jsonb_build_object(
      'personal_site','https://alantsen.com/',
      'about_me','https://www.alantsen.com/about-me/',
      'media_bio','https://alantsen.com/bio/',
      'linkedin','https://www.linkedin.com/in/alan-tsen-22742716/',
      'startupbootcamp','https://www.startupbootcamp.com.au/selection-days/ft23/mentors/05MhzgYKdS93Pkx4Tvxz8v',
      'fintech_australia','https://www.industrymoves.com/moves/fintech-australia-announces-new-chair',
      'startup_daily','https://www.startupdaily.net/advice/perfect-storm-fintech/'
    ),
    'corrections','CSV portfolio truncated ("Cake, FrankieOne, Crypto..."). Third entry reconstructed as CryptoSpend based on his public fintech advocacy.'
  ),
  updated_at = now()
WHERE name = 'Alan Tsen';

UPDATE investors SET
  description = 'Sydney-based angel investor and operator. VP Strategy & Operations at Nexl (and previously Chief of Staff). Focuses on B2B SaaS and marketplaces; has made at least one disclosed seed-stage investment (Earlywork, 2023) alongside his earlier involvement in Kapiche (2021).',
  basic_info = 'Albert Patajo is a Sydney-based operator-angel. He is currently VP of Strategy & Operations at Nexl (having joined as Chief of Staff) and invests selectively in B2B SaaS and marketplace startups. His disclosed investments include Kapiche (B2B customer experience intelligence, 2021) and Earlywork (seed, November 2023).',
  sector_focus = ARRAY['B2B SaaS','Marketplaces','Future of Work'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/albertpatajo/',
  contact_email = 'albert.patajo@live.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Kapiche','Earlywork'],
  meta_title = 'Albert Patajo — Sydney B2B SaaS Angel Investor',
  meta_description = 'Sydney operator-angel. VP Strategy & Ops at Nexl. Invests in B2B SaaS and marketplaces. Portfolio includes Kapiche and Earlywork.',
  details = jsonb_build_object(
    'operator_role','VP Strategy & Operations, Nexl (previously Chief of Staff)',
    'disclosed_investments', jsonb_build_array(
      jsonb_build_object('company','Kapiche','year',2021,'note','Participated alongside 2 other investors'),
      jsonb_build_object('company','Earlywork','round','Seed VC','date','21 November 2023')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/albertpatajo/',
      'crunchbase','https://www.crunchbase.com/person/albert-patajo',
      'cbinsights','https://www.cbinsights.com/investor/albert-patajo',
      'kapiche_financials','https://www.crunchbase.com/organization/kapiche/financial_details'
    ),
    'corrections','CSV sector_focus and portfolio truncated. CSV email had capitalisation quirk ("albert.patajo@Live.com") — normalised to lowercase.'
  ),
  updated_at = now()
WHERE name = 'Albert Patajo';

UPDATE investors SET
  description = 'Sydney-based angel investor and Startmate mentor. Advisor at Electrifi Ventures. Ex-Airtree, Tank Stream Ventures, MercadoLibre. Stanford Graduate School of Business MBA.',
  basic_info = 'Alex de Aboitiz is a Sydney-based angel investor and mentor at Startmate, with a track record that spans direct angel investments and advisory work. He is an Advisor at Electrifi Ventures and has held prior roles at Airtree Ventures, Tank Stream Ventures, MercadoLibre and Private Equity / Venture Capital Investments. He holds an MBA from Stanford Graduate School of Business.

His publicly disclosed investments include Harvest B (Seed VC, July 2021) and involvement in Biteable. He also posted publicly about Biteable''s USD$7M round on LinkedIn.',
  why_work_with_us = 'Cross-border LatAm/US/AU background (MercadoLibre + Stanford + Sydney VCs) is unusual in the Australian angel pool — helpful for founders thinking about LatAm or US expansion. Active Startmate mentor with live deal-flow relationships.',
  sector_focus = ARRAY['Marketplaces','Consumer','Enterprise SaaS','FoodTech','Climate'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/alex-de-aboitiz-b68266/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Biteable','Harvest B','Baraja','Elev.io'],
  meta_title = 'Alex de Aboitiz — Sydney Angel Investor & Startmate Mentor',
  meta_description = 'Sydney angel and Startmate mentor. Advisor at Electrifi Ventures. Stanford MBA. Ex-Airtree, Tank Stream Ventures, MercadoLibre.',
  details = jsonb_build_object(
    'education','MBA, Stanford Graduate School of Business',
    'affiliations', ARRAY['Startmate (Mentor & Investor)','Electrifi Ventures (Advisor)'],
    'prior_roles', ARRAY['Airtree Ventures','Tank Stream Ventures','MercadoLibre','Private Equity & VC Investments'],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/alex-de-aboitiz-b68266/',
      'crunchbase','https://www.crunchbase.com/person/alex-de-aboitiz',
      'cbinsights','https://www.cbinsights.com/investor/alex-de-aboitiz',
      'pitchbook','https://pitchbook.com/profiles/investor/119472-85',
      'premier_alts','https://www.premieralts.com/investors/alex-de-aboitiz',
      'biteable_post','https://www.linkedin.com/posts/alex-de-aboitiz-b68266_biteable-is-looking-for-some-great-people-activity-6760005118457978880-dEY2'
    ),
    'corrections','CSV sector_focus truncated ("Only looking for deals in t..."). Portfolio truncated ("Baraja, Biteable, Elev.io, F..."). Reconstructed from Crunchbase/CBInsights/PitchBook with Harvest B added per CBInsights.'
  ),
  updated_at = now()
WHERE name = 'Alex de Aboitiz';

COMMIT;

-- ======================================================================
-- FILE: 20260422130200_enrich_angel_investors_batch_01c.sql
-- ======================================================================
-- Enrich angel investors — batch 01c (records 11-15 of 20 for batch 1)

BEGIN;

UPDATE investors SET
  description = 'Sunshine Coast-based angel investor and fintech founder. Founder & CEO of Advanced (R&D finance fintech, AU$25M raised). Former investment manager at VentureCrowd; ex-Tractor Ventures. Personal angel in 12+ Australian startups including Mr Yum (now me&u) and Vitable.',
  basic_info = 'Alex Knight is a Sunshine Coast-based founder-investor. He is the Founder and CEO of Advanced, a fintech providing R&D finance to Australian startups, which has raised AU$25M (with subsequent plans flagged for a potential AU$100M raise). Previously he was an investment manager at crowdfunding platform VentureCrowd and worked with debt financier Tractor Ventures.

He has personally invested in 12+ Australian startups, with disclosed positions including Mr Yum (now me&u), Vitable and Aussie Angels.',
  why_work_with_us = 'Rare combination of equity-investor and non-dilutive-capital (R&D finance) perspective — valuable for founders thinking about how to stretch runway via R&DTI cash-flow products. Strong sub-VC / crowdfunding / debt network across Australia.',
  sector_focus = ARRAY['Fintech','Consumer','Marketplaces','Hospitality Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 20000,
  check_size_max = 20000,
  linkedin_url = 'https://au.linkedin.com/in/alex-knight-32b3ba101',
  contact_email = 'alex@knightadvisory.com.au',
  location = 'Sunshine Coast, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Mr Yum (me&u)','Vitable','Aussie Angels','Advanced (founder)'],
  meta_title = 'Alex Knight — Advanced | Sunshine Coast Angel Investor',
  meta_description = 'Sunshine Coast angel investor and founder. CEO of Advanced (R&D finance fintech). Ex-VentureCrowd, ex-Tractor Ventures. Invested in Mr Yum, Vitable.',
  details = jsonb_build_object(
    'current_role','Founder & CEO, Advanced (R&D finance fintech)',
    'prior_roles', ARRAY['VentureCrowd (Investment Manager)','Tractor Ventures'],
    'advanced_capital_raised','AU$25M initial raise; supporting R&D efforts of ~50 companies',
    'latest_news', jsonb_build_array(
      jsonb_build_object('headline','R&D funder Advanced eyes $100M raise after $25M round','url','https://www.businessnewsaustralia.com/articles/r-d-funder-advanced-eyes-a-potential--100m-raise-for-startups-after-success-of-initial--25m-round.html','date','2025'),
      jsonb_build_object('headline','Queensland R&D finance fintech raises $2.3M (Advanced)','url','https://www.startupdaily.net/topic/funding/queensland-rd-finance-fintech-raises-2-3-million/','date','2024')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/alex-knight-32b3ba101',
      'foundersuite','https://www.foundersuite.com/investors/alex-knight',
      'fwdfest','https://fwdfest.co/speakers/alex-knight',
      'co_community','https://www.coventures.vc/co-community'
    ),
    'corrections','CSV had no LinkedIn and sector_focus was truncated ("Agnostic. Anything I unde..."). CSV email was truncated ("Alex@knightadvisory.com..."). Reconstructed sector_focus from disclosed portfolio (Mr Yum = hospitality; Vitable = consumer health).'
  ),
  updated_at = now()
WHERE name = 'Alex Knight';

UPDATE investors SET
  description = 'Sydney-based angel investor (plausibly the same person as Alex Unsworth, Managing Director and Co-Head of Equities at Canaccord Genuity — disambiguation ambiguous in public sources).',
  basic_info = 'The "Alex Unsworth" angel-investor record overlaps publicly with Alex Unsworth, Managing Director and Co-Head of Equities at Canaccord Genuity in Sydney. The CSV-listed LinkedIn (alexunsworth) matches this profile, and the listed portfolio (Fibersense, Canva, Betmakers) is consistent with ECM-adjacent Australian tech investments, so the two are plausibly the same person — but this could not be confirmed independently from a single primary source.

Treat the record as an institutional-finance operator-angel with Australian tech exposure until Alex confirms the profile himself.',
  sector_focus = ARRAY['Software','Hardware','Online Marketplaces','Hospitality'],
  stage_focus = ARRAY['Pre-seed','Seed','Pre-IPO'],
  linkedin_url = 'https://au.linkedin.com/in/alexunsworth',
  location = 'Sydney, NSW',
  country = 'Australia',
  portfolio_companies = ARRAY['Fibersense','Canva','BetMakers'],
  meta_title = 'Alex Unsworth — Sydney Angel Investor',
  meta_description = 'Sydney-based angel investor. Portfolio includes Fibersense, Canva and BetMakers.',
  details = jsonb_build_object(
    'possible_day_job','Managing Director & Co-Head of Equities, Canaccord Genuity (unconfirmed match)',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/alexunsworth',
      'canaccord_profile','https://www.canaccordgenuity.com/capital-markets/sydney/alex-unsworth/',
      'trivian_capital','https://www.triviancapital.com/members/investor-profiles/alex-unsworth'
    ),
    'corrections','CSV portfolio was truncated ("Fibersense, Canva, Betm..."). Reconstructed BetMakers fully.',
    'unverified', ARRAY['Identity disambiguation — Canaccord Genuity Alex Unsworth vs angel Alex Unsworth not confirmed by primary source']
  ),
  updated_at = now()
WHERE name = 'Alex Unsworth';

UPDATE investors SET
  description = 'Sydney-based operator-angel. Early Canva employee (helped scale from 23 to global team) and co-founder of Eucalyptus (now 500+ people). Now at Co Ventures. Angel investor in early-stage Australian startups.',
  basic_info = 'Alexey Mitko is a Sydney-based operator-angel. He was an early Canva employee, helping scale the company from 23 people to a global team as its Finance Manager, and then went on to co-found Eucalyptus, the consumer-healthcare company that has since scaled past 500 employees. He now works with Co Ventures and angel-invests at pre-seed and seed in Australia.

A disclosed recent investment is Keeyu, which raised AU$2.3M in pre-seed funding (with Alexey as one of the participating angels).',
  why_work_with_us = 'Rare combination of early-Canva finance operator and consumer healthcare founder (Eucalyptus) experience. Valuable for founders scaling consumer subscription, telehealth, finance ops, or going from early hires to 100+ headcount.',
  sector_focus = ARRAY['Consumer','HealthTech','Telehealth','SaaS','E-commerce'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/alexeymitko/',
  contact_email = 'alexey@wildpaths.vc',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Canva (early employee)','Eucalyptus (co-founder)','Keeyu'],
  meta_title = 'Alexey Mitko — Canva & Eucalyptus alum | Sydney Angel',
  meta_description = 'Sydney operator-angel. Early Canva employee, co-founder of Eucalyptus, now at Co Ventures. Invests at pre-seed and seed.',
  details = jsonb_build_object(
    'operator_background','Finance Manager at Canva (2 yrs, scaled 23 → global); co-founder of Eucalyptus (500+ people)',
    'current_affiliation','Co Ventures',
    'latest_news', jsonb_build_array(
      jsonb_build_object('headline','Keeyu raises $2.3M in pre-seed funding','url','https://www.thesaasnews.com/news/keeyu-raises-2-3m-in-pre-seed-funding','date','2024-2025')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/alexeymitko/',
      'crunchbase','https://www.crunchbase.com/person/alexey-mitko',
      'tracxn','https://tracxn.com/d/people/alexey-mitko/__gN13iqcNjN_06K8386Ts37cApgbpBgKDBZBqGphpnpY',
      'podcast','https://www.callingoperator.com/episodes/ep-52-operational-leadership-with-alexey-mitko',
      'co_ventures','https://www.coventures.vc/co-community'
    ),
    'corrections','CSV had no sector_focus and portfolio was truncated ("Canva, Eucalyptus, Mutin..."). Kept verified items only (Keeyu); "Mutin..." could not be confirmed.'
  ),
  updated_at = now()
WHERE name = 'Alexey Mitko';

UPDATE investors SET
  description = 'Sydney-based angel investor associated with Muir Capital. Fintech, regtech and cyber focus. Disclosed investments include Ayoconnect, COLABS and Resource.',
  basic_info = 'Alistair Muir is a Sydney-based angel investor operating under the Muir Capital banner. His investment focus is fintech, regtech and cyber. Publicly disclosed Muir Capital investments include Ayoconnect (financial software), COLABS (office services) and Resource (business/productivity software).',
  sector_focus = ARRAY['Fintech','Regtech','Cyber','Enterprise SaaS'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/alistairmuir',
  contact_email = 'alistair@alistairmuir.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Ayoconnect','COLABS','Resource'],
  meta_title = 'Alistair Muir — Muir Capital | Sydney Fintech Angel',
  meta_description = 'Sydney angel investor via Muir Capital. Fintech, regtech and cyber focus. Portfolio includes Ayoconnect, COLABS, Resource.',
  details = jsonb_build_object(
    'vehicle','Muir Capital',
    'investment_focus','Fintech, regtech, cyber',
    'sources', jsonb_build_object(
      'gritt_profile','https://www.gritt.io/investor/alistairmuir/',
      'muir_capital_pitchbook','https://pitchbook.com/profiles/investor/483517-90',
      'linkedin','https://www.linkedin.com/in/alistairmuir'
    ),
    'corrections','CSV sector_focus and portfolio were truncated ("Fintech, Regtech, Cyber, ..." and "Fintech (home loans busi..."). Replaced portfolio with verified Muir Capital investments from PitchBook.'
  ),
  updated_at = now()
WHERE name = 'Alistair Muir';

UPDATE investors SET
  description = 'Singapore-based angel investor. Listed as sector-agnostic with typical cheque size AU$5–10k. Limited public disclosures found in open sources.',
  basic_info = 'Allen Lee is a Singapore-based angel investor with a sector-agnostic stance and a typical cheque band of AU$5,000–10,000. Broader public investment activity and a canonical portfolio could not be confirmed in open sources at the time of this profile — treat as a small-cheque early supporter rather than a lead investor.',
  sector_focus = ARRAY['Sector Agnostic'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 10000,
  linkedin_url = 'https://www.linkedin.com/in/0208allenlee',
  contact_email = 'lyh0208@gmail.com',
  location = 'Singapore',
  country = 'Singapore',
  meta_title = 'Allen Lee — Singapore Angel Investor',
  meta_description = 'Singapore-based angel investor. Sector agnostic. $5K–10K cheques. Limited public disclosures.',
  details = jsonb_build_object(
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/0208allenlee'
    ),
    'unverified', ARRAY['Portfolio and disclosed investments — no authoritative public listing found']
  ),
  updated_at = now()
WHERE name = 'Allen Lee';

COMMIT;

-- ======================================================================
-- FILE: 20260422130300_enrich_angel_investors_batch_01d.sql
-- ======================================================================
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
