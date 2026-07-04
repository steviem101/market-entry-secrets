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
