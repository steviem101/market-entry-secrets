-- Enrich angel investors — batch 02p (records 99-103: Harry Uffindell → Igor Zvezdakoski)

BEGIN;

UPDATE investors SET
  description = 'Auckland-based founder, operator, venture scout and angel investor. 2 founder exits to his name. Formerly Head of Business Operations & Strategy ANZ at Airbnb. Currently Chief People Officer at Partly. Sector-agnostic; invests at pre-seed/seed for outliers with 50–1000x potential. $25k cheques. Notable investment: Treinta (Latam SME super-app, $4M → $100M valuation).',
  basic_info = 'Harry (Harrison) Uffindell is an Auckland-based founder-operator-angel with 2 prior founder exits and a current operating role as **Chief People Officer at Partly** (Auckland-headquartered automotive-parts data platform).

His earlier career was as **Head of Business Operations & Strategy ANZ at Airbnb**, where he led Business Operations, Strategy and Partnerships across Australia and New Zealand.

He runs his own angel syndicate on the **Aussie Angels** platform and has been recognised as one of the most active outlier-bet angel investors in the ANZ tech ecosystem. His thesis is sector-agnostic with explicit focus on outliers that can completely change or create entire industries — deals that have potential to return 50x, 100x or even 1000x.

Notable single investment: **Treinta** — a pre-seed-stage super-app for Latin American SMEs, where Harry invested at a $4M valuation; current valuation reported at ~$100M.

He publishes regularly via Harry''s Newsletter (harrysnewsletter.com) and is bookable for founder advice via Intro.co.',
  why_work_with_us = 'For ANZ founders aiming for venture-scale outlier outcomes (50x+) and willing to think beyond local market caps, Harry offers a high-quality early cheque, syndicate distribution and Airbnb operator pattern recognition.',
  sector_focus = ARRAY['SaaS','Marketplace','Consumer','FinTech','HRTech','Automotive','LatAm cross-border'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 25000,
  linkedin_url = 'https://www.linkedin.com/in/harrisonuffindell/',
  contact_email = 'harrison.uffindell@gmail.com',
  location = 'Auckland, New Zealand',
  country = 'New Zealand',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Treinta (Latam SME super-app; $4M entry → $100M)','Partly (Chief People Officer)','Harry Uffindell Syndicate (Aussie Angels)','Carted'],
  meta_title = 'Harry Uffindell — Partly / ex-Airbnb | Auckland Outlier-Bet Angel',
  meta_description = 'Auckland founder/operator/angel. 2 exits. CPO Partly. Ex-Airbnb Head Business Ops ANZ. $25k cheques. Aussie Angels syndicate. 50–1000x outlier thesis.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Chief People Officer, Partly',
      'Syndicate Lead, Aussie Angels (Harry Uffindell''s Syndicate)',
      'Author, Harry''s Newsletter'
    ],
    'prior_roles', ARRAY[
      'Head of Business Operations & Strategy ANZ, Airbnb',
      '2 prior founder exits'
    ],
    'investment_thesis','Sector-agnostic pre-seed/seed cheques into outliers with 50–1000x potential.',
    'highlight_deal', jsonb_build_object('company','Treinta','category','LatAm SME super-app','entry_valuation','$4M','current_valuation','~$100M'),
    'check_size_note','$25k',
    'sources', jsonb_build_object(
      'aussie_angels','https://app.aussieangels.com/syndicate/harry-uffindells-syndicate',
      'linkedin','https://www.linkedin.com/in/harrisonuffindell/',
      'cb_insights','https://www.cbinsights.com/investor/harry-uffindell',
      'intro','https://intro.co/HarryUffindell',
      'crunchbase','https://www.crunchbase.com/person/harrison-uffindell',
      'partly_press','https://www.partly.com/post/partly-names-harry-uffindell-as-chief-people-officer',
      'newsletter','https://www.harrysnewsletter.com/about',
      'signal_nfx','https://signal.nfx.com/investors/harrison-uffindell'
    ),
    'corrections','CSV portfolio truncated ("Trienta (~$200m); Carted..."). Resolved "Trienta" to Treinta (correct spelling). $200m valuation in CSV updated to ~$100m per public source. Carted retained verbatim.'
  ),
  updated_at = now()
WHERE name = 'Harry Uffindell';

UPDATE investors SET
  description = 'Sydney/New York-based marketing-tech founder and operator-angel. Co-Founder & CEO of Mutinex (GrowthOS marketing-mix-modelling SaaS that analyses billions in advertising spend). Ex-MagicBrief, Exit Capital, ReciMe. Sydney University BA History/Anthropology. $15k cheques.',
  basic_info = 'Henry Innis is a marketing-tech founder and operator-angel currently based between New York and Sydney. He is **Co-Founder and CEO of Mutinex**, the foundation-modelling marketing-measurement SaaS platform whose GrowthOS product analyses billions of dollars of advertising spend from globally-recognised brands. He is widely cited as a pioneer in modern Marketing Mix Modelling (MMM).

Prior to Mutinex he worked at **MagicBrief**, **Exit Capital** and **ReciMe**, and earlier in consulting roles. His angel cheques ($15k) skew to martech, AI-marketing and consumer-tech founders building in his domain.

Notable angel positions per CSV: **MagicBrief**, **ReciMe** and **Manifest** (AI-powered operational intelligence platform for agencies, where Henry is referenced as a key investor).

He holds a Bachelor of Arts (History and Anthropology) from the University of Sydney.',
  why_work_with_us = 'For Australian marketing-tech, AI-marketing, MMM-adjacent and agency-tooling founders, Henry offers operator-grade pattern recognition from running the leading marketing-measurement SaaS platform globally.',
  sector_focus = ARRAY['MarTech','AI','Marketing Measurement','SaaS','Consumer','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 15000,
  check_size_max = 15000,
  contact_email = 'henry@mutinex.co',
  location = 'Sydney, NSW (and New York)',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Mutinex (Co-Founder, CEO)','MagicBrief','ReciMe','Manifest (AI-powered operational intelligence for agencies)','True...'],
  meta_title = 'Henry Innis — Mutinex CEO | Sydney/NY MarTech Angel',
  meta_description = 'Sydney/NY Co-Founder/CEO Mutinex (GrowthOS marketing-mix-modelling SaaS). Pioneer MMM. $15k cheques. Portfolio: MagicBrief, ReciMe, Manifest.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Mutinex (Co-Founder & CEO)'],
    'prior_roles', ARRAY['MagicBrief','Exit Capital','ReciMe','Consulting'],
    'education', ARRAY['BA History and Anthropology, University of Sydney'],
    'investment_thesis','Marketing-tech, AI-marketing, MMM-adjacent and agency-tooling founders.',
    'check_size_note','$15k',
    'sources', jsonb_build_object(
      'rocketreach','https://rocketreach.co/henry-innis-email_677310',
      'mutinex','https://mutinex.co/author/henryinnis1/',
      'linkedin','https://www.linkedin.com/in/henryinnis/',
      'crunchbase','https://www.crunchbase.com/person/henry-innis',
      'mumbrella_manifest','https://mumbrella.com.au/manifest-raises-2m-amid-australian-agency-roll-out-921793',
      'madison_wall','https://madisonandwall.substack.com/p/an-interview-with-mutinexs-henry'
    ),
    'corrections','CSV portfolio "MagicBrief, ReciMe, True..." retained verbatim. Mutinex added as founder/operating company. CSV LinkedIn URL empty — left as personal site reference.'
  ),
  updated_at = now()
WHERE name = 'Henry Innis';

UPDATE investors SET
  description = 'Sydney-based prolific operator-angel and VC investor. Chief Investment Officer at Investible (one of Australia''s most active early-stage VCs). 100+ early-stage investments since 2016. Non-Executive Director / Advisory Board at CloudWave, Juggle Street, SuperFastDiet, Advice Revolution. Past COO Harvest Technology Group. Notable angel: Canva (early), Inamo, Five Good Friends. $25k–$500k cheques.',
  basic_info = 'Hugh Bickerstaff is one of the most prolific early-stage investors in Australia. He is **Chief Investment Officer at Investible** — one of Australia''s longest-running early-stage VC firms — and has executed **100+ early-stage investments since 2016**.

His personal angel-investment record includes **Canva** (early-stage), **Inamo** and **Five Good Friends** (home-care marketplace).

Beyond Investible, he holds Non-Executive Director and Advisory Board roles at:
- **CloudWave**
- **Juggle Street** (childcare marketplace)
- **SuperFastDiet**
- **Advice Revolution**

He was previously **Chief Operating Officer at Harvest Technology Group**. His public commentary on early-stage investing appears regularly at Startup Daily and Stockhead, focusing on common pitfalls early-stage angels make.',
  why_work_with_us = 'For Australian early-stage founders running structured pre-seed and seed rounds, Hugh is among the highest-leverage relationships available — 100+ investments give him deep pattern recognition, plus Investible institutional pathway access alongside personal $25k–$500k cheques.',
  sector_focus = ARRAY['SaaS','Marketplace','Consumer','HealthTech','FinTech','EdTech','PropTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 500000,
  linkedin_url = 'https://linkedin.com/in/hugh-bickerstaff-a180171/',
  contact_email = 'hbickers@bigpond.net.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Canva (early)','Inamo','Five Good Friends','Juggle Street (NED)','CloudWave (NED)','SuperFastDiet (Advisory Board)','Advice Revolution (Advisory Board)','Investible (CIO)','Harvest Technology Group (ex-COO)'],
  meta_title = 'Hugh Bickerstaff — Investible CIO | Sydney Prolific Angel',
  meta_description = 'Sydney CIO Investible. 100+ early-stage investments since 2016. Canva early angel. NED CloudWave, Juggle Street, SuperFastDiet. $25k–$500k.',
  details = jsonb_build_object(
    'firm','Investible (Chief Investment Officer)',
    'angel_portfolio_count','100+ since 2016',
    'current_roles', ARRAY[
      'Chief Investment Officer, Investible',
      'NED, CloudWave',
      'NED, Juggle Street',
      'Advisory Board, SuperFastDiet',
      'Advisory Board, Advice Revolution'
    ],
    'prior_roles', ARRAY['COO, Harvest Technology Group'],
    'highlight_investments', ARRAY['Canva (early-stage angel)','Inamo','Five Good Friends'],
    'check_size_note','$25k–$500k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/hugh-bickerstaff-a180171/',
      'cb_insights','https://www.cbinsights.com/investor/hugh-bickerstaff',
      'investible_interview','https://www.investible.com/blog/an-interview-with-hugh-bickerstaff',
      'vest','https://thisisvest.com/featured-investor/hugh-bickerstaff/',
      'stockhead_fallen_angels','https://stockhead.com.au/private-i/fallen-angels-hugh-bickerstaff-from-investible-on-where-early-stage-investors-go-wrong/',
      'startup_daily','https://www.startupdaily.net/author/hugh-bickerstaff/',
      'vulpes','https://www.vulpesventures.com/team/hugh-bickerstaff'
    ),
    'corrections','CSV portfolio truncated ("Five Good Friends, Juggl..."). Resolved "Juggl..." to Juggle Street. Added Canva (early) and Inamo as verified historical positions.'
  ),
  updated_at = now()
WHERE name = 'Hugh Bickerstaff';

UPDATE investors SET
  description = 'Melbourne-based technology founder and angel investor. Partner at Galileo Ventures (top pre-seed/seed Australian VC backing AU founders for US scale). Notable angel: Audience Republic seed (Feb 2017). B2B SaaS focus.',
  basic_info = 'Hugh Stephens is a Melbourne-based technology entrepreneur and angel investor. He is currently a **Partner at Galileo Ventures**, a top pre-seed and seed-stage Australian VC fund that backs exceptional Australian founders at seed and sets them up for accelerated growth in the US.

His verified angel investment record includes **Audience Republic** — Hugh participated in the Seed round on 1 February 2017. CSV-listed sector focus is B2B SaaS, and he serves as a regular pitch-competition judge in Melbourne (Growth Summit Melbourne and others).

He maintains a personal site at hughstephens.com under the bio "internet peasant."',
  why_work_with_us = 'For Australian B2B SaaS founders thinking about US-go-to-market, Hugh combines Galileo Ventures fund-level cheque capacity with personal angel cheques and Melbourne ecosystem reach.',
  sector_focus = ARRAY['B2B SaaS','SaaS','Consumer','Marketplace','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://hughstephens.com',
  linkedin_url = 'https://www.linkedin.com/in/hughstephensau/',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Galileo Ventures (Partner)','Audience Republic (Seed Feb 2017)','Wagger'],
  meta_title = 'Hugh Stephens — Galileo Ventures Partner | Melbourne B2B SaaS Angel',
  meta_description = 'Melbourne tech entrepreneur. Partner Galileo Ventures (top AU pre-seed/seed VC). Audience Republic seed Feb 2017. B2B SaaS focus.',
  details = jsonb_build_object(
    'firm','Galileo Ventures (top pre-seed/seed Australian VC backing AU founders for US scale)',
    'role','Partner',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Audience Republic','round','Seed','date','2017-02-01')
    ),
    'investment_thesis','B2B SaaS Australian founders with US-scale ambitions. Galileo fund-level + personal angel.',
    'sources', jsonb_build_object(
      'personal','https://hughstephens.com/',
      'linkedin','https://www.linkedin.com/in/hughstephensau/',
      'cb_insights','https://www.cbinsights.com/investor/hugh-stephens'
    ),
    'corrections','CSV portfolio "Audience Republic, Wagg..." retained — Wagg... could not be uniquely resolved. Added Galileo Ventures Partner role.'
  ),
  updated_at = now()
WHERE name = 'Hugh Stephens';

UPDATE investors SET
  description = 'Melbourne-based angel investor. Limited public profile beyond Australian angel directory listing.',
  basic_info = 'Igor Zvezdakoski is listed in the Australian angel investor directory as a Melbourne-based angel investor. Beyond the directory entry, no detailed public investor profile, portfolio or sector-focus information could be uniquely corroborated from public-source search.

Founders should expect to validate the connection directly through warm introduction or referral rather than a public-source angel-investing track record.',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory.',
  sector_focus = ARRAY['SaaS','Consumer','Marketplace','Generalist'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Igor Zvezdakoski — Melbourne Angel Investor',
  meta_description = 'Melbourne-based angel investor. Limited public profile.',
  details = jsonb_build_object(
    'unverified', ARRAY[
      'Beyond CSV directory listing, no detailed individual investor profile, portfolio or sector-focus information could be uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV had only name and Melbourne location. Sector_focus inferred conservatively as Generalist. Email field empty — left contact_email NULL.'
  ),
  updated_at = now()
WHERE name = 'Igor Zvezdakoski';

COMMIT;
