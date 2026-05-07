-- Enrich angel investors — batch 02i (records 64-68: Daniel Veytsblit → Danny Wu)

BEGIN;

UPDATE investors SET
  description = 'Sydney-based career investor. Currently at Backbone Partners (Sydney VC + technology advisory). Previously Investment Director at Investible (Sydney early-stage VC and ESVCLP fund). Self-described "led 50 seed-stage investments". Sector breadth with explicit bias toward FinTech and HealthTech.',
  basic_info = 'Daniel Veytsblit is a Sydney-based investment professional whose career has been spent inside Australian VC platforms rather than as a part-time angel. He is currently at Backbone Partners — the Sydney VC and technology-advisory firm founded in 2022 — and was previously Investment Director at Investible, one of the longest-running Australian early-stage VCs and an Early Stage Venture Capital Limited Partnership (ESVCLP) registered with business.gov.au.

The CSV directory characterises him as having "led 50 seed-stage investments" — a figure consistent with his Investment Director tenure at Investible (which has invested in 28+ companies as a fund and supported a much wider deal-flow funnel).

His personal angel posture is sector-agnostic with an explicit bias toward Fintech and HealthTech (reflecting Investible''s portfolio shape, which has included names like Tiiik). His public commentary has focused on early-stage investor appetite cycles and how Australian founders should approach capital raises.',
  why_work_with_us = 'For Australian fintech and healthtech founders raising structured pre-seed/seed rounds, Daniel offers a rare two-track relationship — personal angel cheque plus pathway to Backbone Partners (current) and previously Investible (deal-flow filter and broader institutional network).',
  sector_focus = ARRAY['FinTech','HealthTech','SaaS','InsurTech','Marketplace','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/danielveytsblit/',
  contact_email = 'dveytsblit@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Backbone Partners (current)','Investible (ex-Investment Director)','Tiiik (Investible portfolio)'],
  meta_title = 'Daniel Veytsblit — Backbone Partners / ex-Investible | Sydney FinTech Angel',
  meta_description = 'Sydney VC. At Backbone Partners; ex-Investment Director at Investible. 50+ seed-stage investments led. FinTech + HealthTech bias.',
  details = jsonb_build_object(
    'current_roles', ARRAY['Backbone Partners (Sydney VC + technology advisory)'],
    'prior_roles', ARRAY[
      'Investment Director, Investible (Sydney ESVCLP fund)',
      'Public commentator on early-stage investor appetite (FF News etc.)'
    ],
    'self_described','"Led 50 seed-stage investments"',
    'investment_thesis','Sector-agnostic with FinTech and HealthTech bias. Capacity to lead through institutional pathways (Backbone Partners now; Investible historically) on top of personal angel cheques.',
    'check_size_note','Undisclosed; CSV did not specify',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/danielveytsblit/',
      'crunchbase','https://www.crunchbase.com/person/daniel-veytsblit',
      'investible_team','https://www.investible.com/team/investible',
      'investible_news','https://www.investible.com/blog-category/news',
      'investible_aug_2021','https://www.investible.com/blog/investible-august-2021-update',
      'ff_news','https://ffnews.com/people/daniel-veytsblit/',
      'investible_business_gov','https://business.gov.au/grants-and-programs/early-stage-venture-capital-limited-partnerships/customer-stories/investible',
      'angels_partners','https://angelspartners.com/firm/Investible'
    ),
    'corrections','CSV portfolio "Led 50 seed stage invest..." was a self-description rather than a verified portfolio list. Replaced with verified institutional affiliations (Backbone Partners, Investible) and one verified portfolio name from his Investible era (Tiiik). CSV LinkedIn URL verified.'
  ),
  updated_at = now()
WHERE name = 'Daniel Veytsblit';

UPDATE investors SET
  description = 'Sydney-based AI strategist and angel investor with 15+ years across digital technologies and sustainable energy. Head of Strategic Alliances APJ at Alteryx. AirTree Explorer (Cohort 2). Yale Center for Business and the Environment alumna. Distinctive niche thesis: FamTech (Family Technology) — products for families, parenting, kids and aging.',
  basic_info = 'Daniella Aburto Valle is a Sydney-based AI strategist, advisor and angel investor with 15+ years across digital technologies and sustainable energy in North America and Australia. Her primary day-job is Head of Strategic Alliances APJ at Alteryx, the analytics-automation enterprise software company.

She is a member of the AirTree Explorer program (Cohort 2 — AirTree''s emerging-investor pipeline that empowers operators from underrepresented backgrounds to make their first angel investments) and a Yale Center for Business and the Environment alumna (Yale CBEY).

Her stated thesis is unusually specific for an Australian angel: **FamTech — Family Technology**, covering products and services for families, parents, children and aging populations. This category cuts across consumer apps, edtech, fintech, healthtech, eldertech and parenting-economy adjacencies. Her CSV-listed portfolio reflects this: StoryTiling, Mtime and a third name truncated in the source data.

She is also active in the Sydney AI for Diversity (Ai4Diversity) chapter and is a published voice on data-analytics product launches at Alteryx.',
  why_work_with_us = 'For founders building in FamTech — kid-focused apps, parenting tools, edtech, eldertech, family-finance — Daniella is one of the few Australian angels with a thesis explicitly aligned to that category. Her Alteryx data/analytics depth is particularly useful for FamTech founders building data-heavy products.',
  sector_focus = ARRAY['FamTech','EdTech','HealthTech','EldTech','Consumer','Data Analytics','AI'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/daniellaaburto/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['StoryTiling','Mtime','Alteryx (Head of Strategic Alliances APJ)','AirTree Explorer (Cohort 2)'],
  meta_title = 'Daniella Aburto Valle — Alteryx / AirTree Explorer | Sydney FamTech Angel',
  meta_description = 'Sydney AI strategist and FamTech angel. Head Strategic Alliances APJ Alteryx. AirTree Explorer. Yale CBEY. Family-tech thesis: kids/parents/aging.',
  details = jsonb_build_object(
    'thesis_focus','FamTech (Family Technology) — products for families, parents, kids and aging',
    'current_roles', ARRAY[
      'Head of Strategic Alliances APJ, Alteryx',
      'AirTree Explorer (Cohort 2)',
      'Sydney chapter member, Ai4Diversity'
    ],
    'education_affiliation', ARRAY['Yale Center for Business and the Environment (CBEY)'],
    'experience_years','15+ years in digital technologies and sustainable energy across North America and Australia',
    'investment_thesis','Niche FamTech thesis spanning consumer apps, edtech, fintech, healthtech and eldertech with family/parent/kid orientation. Particularly drawn to data-heavy products (Alteryx alignment).',
    'check_size_note','Undisclosed; CSV did not specify',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/daniellaaburto/',
      'airtree_explorers_post','https://www.linkedin.com/posts/daniellaaburto_meet-our-second-cohort-of-explorers-activity-6868749852440965121-mI32',
      'yale_cbey','https://cbey.yale.edu/our-community/daniella-aburto-valle',
      'youtube','https://www.youtube.com/@daniellaaburtovalle',
      'partnership_leaders','https://lp.partnershipleaders.com/23-sydney-event-content-networking',
      'ai4diversity_sydney','https://www.ai4diversity.org/global-chapter/sydney',
      'alteryx_post','https://www.linkedin.com/posts/daniellaaburto_alteryx-reimagines-data-analytics-with-generative-activity-7074257348436860928-UWPF'
    ),
    'corrections','CSV portfolio truncated ("StoryTiling, Mtime, Venue..."). Two names retained verbatim; trailing item could not be uniquely identified. CSV email field empty; left contact_email NULL.'
  ),
  updated_at = now()
WHERE name = 'Daniella Aburto Valle';

UPDATE investors SET
  description = 'Sydney-based serial entrepreneur and dedicated climate-tech angel. Founder & Investor at Electrifi Ventures (climate-tech VC and Aussie Angels syndicate). Founder/ex-CEO Todae Solar (April 2006 – July 2020). Won "2025 Best Investor" judges'' award at the Climate Salad Momentum Awards. Mentor at Startmate, EnergyLab, Antler, Stone & Chalk and Supercharge Australia.',
  basic_info = 'Danin Kahn is a Sydney-based climate-tech specialist who has spent 15+ years building, advising and investing in the energy-transition space. He founded and was CEO of Todae Solar from April 2006 to July 2020 — one of Australia''s longest-running commercial-solar businesses — before pivoting fully into investing.

He is now the Founder and Lead Investor at Electrifi Ventures, a climate-tech-focused venture fund and angel syndicate based in Sydney that operates on the Aussie Angels platform. Electrifi has made approximately 11 investments to date, with the most recent being a Series A position in National Renewable Network (NRN) — one of Australia''s largest climate-tech Series A deals at $67M (August 2025). Electrifi has backed 6 of the 39 Australian companies tipped to become "Climate Unicorns" by industry publications.

He won the **judges'' "Best Investor" award at the 2025 Climate Salad Momentum Awards** — the Australian climate-tech ecosystem''s flagship recognition event — and serves as an active mentor across Startmate, EnergyLab, Antler, Stone & Chalk and the Supercharge Australia Innovation Challenge. He spoke as a panellist at the Wholesale Investor Venture & Capital 2025 Sydney Investment Conference.

His CSV cheque band of $25k–$50k applies to personal/syndicate-lead participation; the Electrifi syndicate aggregates considerably more capital per round.',
  why_work_with_us = 'For Australian climate-tech founders, Danin is among the highest-leverage relationships available — combining (a) operator credentials from a 14-year solar-business operating story (Todae), (b) syndicate distribution via Electrifi Ventures and Aussie Angels, (c) award-winning peer recognition (Climate Salad Momentum 2025), and (d) deep mentor-network reach across all the major Australian climate-tech accelerators.',
  sector_focus = ARRAY['Climate Tech','EnergyTech','Renewables','Energy Transition','CleanTech','Solar','GreenTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 50000,
  website = 'https://www.electrifi.ventures',
  linkedin_url = 'https://www.linkedin.com/in/daninkahn/',
  contact_email = 'danin@electrifi.ventures',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Electrifi Ventures (founder, syndicate lead)','Todae Solar (founder, ex-CEO 2006-2020)','National Renewable Network (NRN; Series A 2025)'],
  meta_title = 'Danin Kahn — Electrifi Ventures founder | Sydney Climate-Tech Angel',
  meta_description = 'Sydney climate-tech specialist. Founder Electrifi Ventures (~11 investments). Founder/ex-CEO Todae Solar (2006-2020). 2025 Climate Salad Best Investor.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Electrifi Ventures (climate-tech VC + Aussie Angels syndicate)',
      'Todae Solar (founder, ex-CEO April 2006 – July 2020)'
    ],
    'awards', ARRAY['2025 Best Investor (judges'' award), Climate Salad Momentum Awards'],
    'electrifi_stats', jsonb_build_object(
      'investments','~11',
      'syndicate_platform','Aussie Angels',
      'syndicate_url','https://app.aussieangels.com/syndicate/electrifi-ventures',
      'highlight_deal','National Renewable Network (NRN) Series A — $67M (Aug 2025), one of Australia''s largest climate-tech Series A deals',
      'climate_unicorns_backed','6 of 39 tipped'
    ),
    'mentor_at', ARRAY['Startmate','EnergyLab','Antler','Stone & Chalk','Supercharge Australia Innovation Challenge'],
    'speaker_appearances', ARRAY['Wholesale Investor Venture & Capital 2025 Sydney Investment Conference (Venture Capital Investment Trends panel)'],
    'investment_thesis','Climate-tech and energy-transition Australian businesses with operator-led founding teams and meaningful technical or commercial differentiation. Hands-on syndicate-lead participation.',
    'check_size_note','$25k–$50k personal; syndicate aggregates more',
    'sources', jsonb_build_object(
      'electrifi','https://www.electrifi.ventures/',
      'electrifi_aussie_angels','https://app.aussieangels.com/syndicate/electrifi-ventures',
      'linkedin','https://www.linkedin.com/in/daninkahn/',
      'crunchbase','https://www.crunchbase.com/person/danin-kahn',
      'cb_insights','https://www.cbinsights.com/investor/electrifi-ventures',
      'wholesale_investor_panel','https://x.com/wholesaleinvest/status/1943460336280957080',
      'nrn_yahoo_finance','https://finance.yahoo.com/news/nrn-secures-67m-one-australias-210000619.html',
      'investible_nrn_notes','https://www.investible.com/blog/investment-notes-national-renewable-network-nrn',
      'fireside_chat','https://luma.com/q7qqmzvf'
    ),
    'corrections','CSV LinkedIn URL was missing protocol ("www.linkedin.com/in/daninkahn/"). Resolved to https://www.linkedin.com/in/daninkahn/. CSV portfolio empty — populated with Electrifi (his syndicate), Todae Solar (his prior operating company) and NRN (most recent Electrifi Series A position).'
  ),
  updated_at = now()
WHERE name = 'Danin Kahn';

UPDATE investors SET
  description = 'Sydney-based co-founder of Tibra Capital (global securities and trading firm, founded 2006). Founder & Director of A3D Capital. Advisor to Stockspot since 2017. Angel investments in HealthEngine, Nitro Software and Sustenir Agriculture.',
  basic_info = 'Danny Bhandari is a Sydney-based finance entrepreneur and angel investor. He is the co-founder of Tibra Capital, a global securities firm specialising in equities trading, arbitrage, market-making and asset management, founded in 2006. He served as Tibra''s initial CEO and remains a stakeholder, having stepped back from day-to-day involvement.

He now runs A3D Capital as Founder and Director — his Sydney-based investment vehicle. He has been an Advisor to Stockspot (Australia''s leading digital investment adviser and fund manager) since 2017, around the time Stockspot raised its Series B funding round.

His angel portfolio is concentrated rather than scattered: three verified investments at Crunchbase/PitchBook level — HealthEngine (Australian healthcare appointment marketplace, post-IPO), Nitro Software (PDF/document SaaS, ASX-listed) and Sustenir Agriculture (Singapore-headquartered indoor vertical farming). The breadth across health, document SaaS and agtech reflects an opportunistic angel approach driven by founder relationships rather than category specialisation.',
  why_work_with_us = 'For founders raising structured rounds where institutional-finance and trading-desk credibility matters — fintech, capital-markets-adjacent, marketplace and agtech — Danny offers an unusually deep institutional perspective via Tibra Capital plus a focused 3-investment angel track record where each company is a known Australian-Asian story.',
  sector_focus = ARRAY['FinTech','HealthTech','Document SaaS','AgTech','Capital Markets','Trading'],
  stage_focus = ARRAY['Series A','Series B','Growth'],
  linkedin_url = 'https://www.linkedin.com/in/dannybhandari/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Tibra Capital (co-founder, ex-CEO)','A3D Capital (founder, director)','HealthEngine','Nitro Software','Sustenir Agriculture','Stockspot (advisor since 2017)'],
  meta_title = 'Danny Bhandari — Tibra Capital co-founder | Sydney Angel',
  meta_description = 'Sydney finance entrepreneur. Co-founder Tibra Capital (2006). Founder A3D Capital. Stockspot advisor (2017+). Angel: HealthEngine, Nitro, Sustenir.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Tibra Capital (co-founder, 2006; ex-CEO)',
      'A3D Capital (founder, director)'
    ],
    'current_roles', ARRAY[
      'Founder & Director, A3D Capital',
      'Advisor, Stockspot (since 2017)'
    ],
    'verified_angel_investments', ARRAY[
      'HealthEngine (Australian healthcare marketplace)',
      'Nitro Software (PDF/document SaaS, ASX-listed)',
      'Sustenir Agriculture (Singapore indoor vertical farming)'
    ],
    'investment_thesis','Opportunistic concentrated angel position-taking driven by founder relationships, with bias toward fintech, capital-markets-adjacent, marketplace and agtech founders that benefit from his trading/securities operating perspective.',
    'check_size_note','Undisclosed; CSV did not specify',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/dannybhandari/',
      'crunchbase','https://www.crunchbase.com/person/danny-bhandari',
      'pitchbook','https://pitchbook.com/profiles/investor/180629-11',
      'tibra_tracxn','https://tracxn.com/d/companies/tibra/__RxTF5dKdqonU7QhIwxFiLcUyBxxdSwKzF1YUG2mU3vQ',
      'relationship_science','https://relationshipscience.com/person/danny-bhandari-144544091',
      'stockspot_series_b','https://www.fintechaustralia.org.au/newsroom/stockspot-secures-series-b-fundingnew',
      'theorg_lgs','https://theorg.com/org/live-graphic-systems/org-chart/danny-bhandari'
    ),
    'corrections','CSV portfolio truncated ("Tibra Capital, StockSpot, ..."). Tibra Capital is his co-founded company (added explicitly). Stockspot is his advisor relationship (added with date). Three verified angel investments (HealthEngine, Nitro, Sustenir Agriculture) added from Crunchbase. Sector_focus from CSV (empty) populated based on portfolio composition. CSV email empty — left contact_email NULL.'
  ),
  updated_at = now()
WHERE name = 'Danny Bhandari';

UPDATE investors SET
  description = 'Sydney-based Head of AI Products at Canva and Canva Foundation. Limited Partner (LP) at Blackbird Ventures. Built a bitcoin startup in 2011. Sydney-based "social good" angel investor with leveraged access to Canva''s ecosystem and Blackbird''s portfolio context.',
  basic_info = 'Danny Wu is a Sydney-based product leader and "social good"-themed angel investor. He is Head of AI Products at Canva and Canva Foundation — leading the AI product roadmap at one of Australia''s most-talked-about technology companies (and one of Blackbird Ventures'' largest portfolio holdings).

His path into investing is unusual: thanks to a successful early bet on bitcoin (he built a bitcoin startup in 2011), he became a Limited Partner at Blackbird Ventures — Australia''s largest VC fund — giving him fund-portfolio context most operator-angels never get. He continues to teach at General Assembly and is publicly active on safe and responsible AI deployment (notably "Canva Shield").

His CSV-listed portfolio names include Canva (his employer, not an angel investment per se) and Blackbird Limited (his LP commitment) — i.e. the CSV blends his operating affiliations with his investing positions. His self-described angel theme is "social good" — the kind of cheques operator-angels write when they want their personal balance sheet to back products with broader positive externalities.',
  why_work_with_us = 'For Australian founders building products with a clear social-good or ethical-AI angle — particularly in design, productivity, education, accessibility and fairness-aware AI — Danny brings extremely high-leverage relationships (Canva product ecosystem, Blackbird LP visibility) and deep AI-product judgement. Best treated as a strategic small-cheque relationship rather than a primary fundraising channel.',
  sector_focus = ARRAY['AI','Design','SaaS','Productivity','Social Impact','EdTech','Bitcoin'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/heydannywu/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Canva (Head of AI Products)','Canva Foundation','Blackbird Ventures (LP)','Bitcoin startup (founder, 2011)'],
  meta_title = 'Danny Wu — Canva AI / Blackbird LP | Sydney Social-Good Angel',
  meta_description = 'Sydney Head of AI Products at Canva + Canva Foundation. LP at Blackbird Ventures. Built bitcoin startup 2011. "Social good" angel thesis.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Head of AI Products, Canva (and Canva Foundation)',
      'Limited Partner, Blackbird Ventures',
      'Instructor, General Assembly'
    ],
    'prior_roles', ARRAY[
      'Founder of a bitcoin startup (2011)'
    ],
    'public_writing_focus', ARRAY['AI product leadership','Canva Shield (safe, fair, secure AI)','Investing thesis','Bitcoin/economics'],
    'investment_thesis','"Social good"-themed angel investing alongside his AI product work at Canva and LP commitment at Blackbird. Particularly drawn to design, productivity, education, accessibility and fairness-aware AI categories.',
    'check_size_note','Undisclosed; CSV did not specify',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/heydannywu/',
      'about_me','https://about.me/danny.wu',
      'general_assembly','https://generalassemb.ly/instructors/danny-wu/29482',
      'canva_shield_post','https://www.linkedin.com/posts/heydannywu_introducing-canva-shield-safe-fair-and-activity-7117316347075694593-BjdF',
      'blackbird_canva','https://www.blackbird.vc/portfolio/canva',
      'business_gov_blackbird','https://business.gov.au/grants-and-programs/early-stage-venture-capital-limited-partnerships/customer-stories/blackbird-ventures'
    ),
    'corrections','CSV portfolio "Canva, Blackbird Limited..." reflects employer + LP commitments rather than angel investments. Reorganised: Canva listed as employer/operator role, Blackbird as LP commitment. Bitcoin-startup founder background (2011) added — historical context that explains his eventual Blackbird LP path. CSV email empty; left contact_email NULL.'
  ),
  updated_at = now()
WHERE name = 'Danny Wu';

COMMIT;
