-- Enrich angel investors — batch 02c (records 34-38: Ben Kepes → Brendan Brummer)

BEGIN;

UPDATE investors SET
  description = 'Christchurch-based New Zealand technology evangelist, board director and angel investor. Founder of Diversity Limited (cloud-computing analyst/consultancy). Co-founder and director of Cactus Outdoor (NZ outdoor-equipment manufacturer, since 1995). 17+ angel investments including 1Centre, Cloud 66 and ThisData. Globally respected commentator on cloud computing.',
  basic_info = 'Ben Kepes is one of New Zealand''s most prominent technology commentators, board directors and angel investors. He is the founder of Diversity Limited, a Christchurch-based cloud-computing analyst and consultancy practice through which he advises vendors, investors and enterprise buyers on cloud strategy.

His operator background runs even longer than his analyst practice: he co-founded Cactus Outdoor in 1995 — a Christchurch-headquartered locally-manufactured outdoor-equipment business making backpacks and outdoor clothing — and continues to serve as a board member and director. Cactus has become one of New Zealand''s most recognised outdoor-apparel brands.

As an angel investor he has made 17+ verifiable investments, including 1Centre (B2B credit-account onboarding), Cloud 66 (cloud-application infrastructure) and ThisData (account takeover protection, acquired by SignalSciences/Fastly). His thesis spans business/productivity software, systems and information management, network management and cloud-native infrastructure.

He is a director on Blake NZ, contributes to Christchurch''s post-earthquake rebuild ecosystem, and is widely regarded as the country''s go-to voice on cloud computing in mainstream media (Forbes, Computerworld, Diversity Blog).',
  why_work_with_us = 'For NZ-based or NZ-active founders building in cloud infrastructure, B2B SaaS, agtech, cleantech or outdoor consumer hardware, Ben Kepes brings (a) cap-table-relevant analyst credibility with cloud vendors and enterprise buyers, (b) a 30-year manufacturing/operator base via Cactus Outdoor, and (c) a Christchurch ecosystem footprint that is hard to replicate from offshore.',
  sector_focus = ARRAY['Cloud Infrastructure','Enterprise SaaS','AgTech','CleanTech','Consumer Hardware','Outdoor','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 50000,
  website = 'https://www.diversity.net.nz',
  linkedin_url = 'https://nz.linkedin.com/in/benkepes',
  contact_email = 'ben@diversity.net.nz',
  location = 'Christchurch, New Zealand',
  country = 'New Zealand',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['1Centre','Cloud 66','ThisData (acquired)','Cactus Outdoor (co-founder, director)','Diversity Limited (founder)'],
  meta_title = 'Ben Kepes — Diversity Limited / Cactus Outdoor | NZ Cloud Angel',
  meta_description = 'Christchurch-based NZ tech evangelist, director and angel. Founder of Diversity Limited. Co-founder Cactus Outdoor (1995). 17+ investments incl. 1Centre, Cloud 66.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Diversity Limited (cloud-computing analyst/consultancy)','Cactus Outdoor (1995, co-founder)'],
    'current_roles', ARRAY[
      'Founder, Diversity Limited',
      'Board Member & Director, Cactus Outdoor',
      'Director, Blake NZ'
    ],
    'media_presence', ARRAY[
      'Forbes contributor',
      'Computerworld commentator',
      'Diversity Blog (diversity.net.nz)',
      'Stuff.co.nz business profile',
      'NZ Business Podcast guest'
    ],
    'investments_count','17+',
    'notable_investments', ARRAY[
      '1Centre',
      'Cloud 66',
      'ThisData (acquired)'
    ],
    'investment_categories', ARRAY['Business/Productivity Software','Systems & Information Management','Network Management Software','Cloud-native infrastructure'],
    'investment_thesis','Cloud-first B2B SaaS and infrastructure investments where his analyst practice and enterprise-buyer relationships are directly value-add to founders. Also active across NZ-relevant agtech, cleantech and outdoor-consumer categories.',
    'check_size_note','$50k typical (per published listing)',
    'community_involvement', ARRAY['Christchurch post-earthquake rebuild ecosystem'],
    'sources', jsonb_build_object(
      'diversity_blog','https://www.diversity.net.nz/',
      'crunchbase_person','https://www.crunchbase.com/person/ben-kepes',
      'pitchbook','https://pitchbook.com/profiles/investor/106046-20',
      'blake_nz','https://www.blakenz.org/person/ben-kepes/',
      'cactus_b2b_news','https://b2bnews.co.nz/articles/ben-kepes-the-man-behind-cactus-outdoor/',
      'spotlight_cactus_crisis','https://www.spotlightreporting.com/blog-posts/powered-by-spotlight-during-a-crisis-ben-kepes-from-cactus-outdoor',
      'nz_business_podcast','https://nzbusinesspodcast.com/ben-kepes-co-founder-commentator-investor/',
      'stuff_profile','https://www.stuff.co.nz/business/114130117/ben-kepes-sustainably-embraces-old-and-new-technology'
    ),
    'corrections','CSV portfolio was truncated ("Agtech, Clean Tech, Com..."). The CSV "portfolio" field appears to actually mix sector tags and individual companies; reorganised so sector_focus captures the verticals and portfolio_companies captures the verifiable individual investments. CSV LinkedIn empty — populated from public profile.'
  ),
  updated_at = now()
WHERE name = 'Ben Kepes';

UPDATE investors SET
  description = 'Sydney-based Partner at Right Click Capital, an Australian venture-capital firm investing in technology businesses going global from Australia, New Zealand and South-East Asia. Co-Director of Founder Institute Sydney. 20+ years of internet investing and operating experience.',
  basic_info = 'Benjamin Chong is a Partner at Right Click Capital, a founder-led Sydney-based venture-capital firm that invests in technology businesses with origins in Australia, New Zealand or South-East Asia and a path to global scale. Right Click Capital is one of three partner-led firms profiled by business.gov.au under the Early Stage Venture Capital Limited Partnerships (ESVCLP) program, and Benjamin is one of three partners alongside Garry Visontay and Ari Klinger.

He has more than two decades of experience investing in and building Internet-related businesses. Beyond Right Click Capital, he is Co-Director of Founder Institute Sydney — the Sydney chapter of the global pre-seed accelerator program — and serves as a mentor, guest speaker and panellist across multiple Australian, South-East Asian and US startup, entrepreneurship and industry programs. He maintains an active personal blog on tech entrepreneurship at benjaminchong.com.

The CSV directory listing places him at "Tech" focus with no specified cheque size — for direct angel-style cheques. Through Right Click Capital his cheque band sits at venture-capital scale, in line with Right Click''s standard ESVCLP fund sizes.',
  why_work_with_us = 'Two-track value: (a) personal angel access for Sydney-area tech founders, with Founder Institute Sydney pipeline visibility into very-early-stage deals, and (b) institutional pathway to Right Click Capital''s ESVCLP fund. Particularly relevant for ANZ + SE Asia tech businesses with a global expansion thesis.',
  sector_focus = ARRAY['SaaS','Marketplace','Internet','Enterprise Tech','Fintech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  website = 'https://www.rightclickcapital.com',
  linkedin_url = 'https://www.linkedin.com/in/benjaminchong',
  contact_email = 'benjamin.chong@rightclickcapital.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Right Click Capital (Partner)','Founder Institute Sydney (Co-Director)'],
  meta_title = 'Benjamin Chong — Right Click Capital Partner | Sydney VC',
  meta_description = 'Sydney VC. Partner, Right Click Capital (ESVCLP fund). Co-Director, Founder Institute Sydney. 20+ years internet investing across ANZ + SE Asia.',
  details = jsonb_build_object(
    'firm','Right Click Capital',
    'role','Partner',
    'co_partners', ARRAY['Garry Visontay','Ari Klinger'],
    'fund_program','Early Stage Venture Capital Limited Partnership (ESVCLP)',
    'firm_geography', ARRAY['Australia','New Zealand','South-East Asia'],
    'firm_thesis','Founder-led tech businesses with global ambition originating in ANZ or SE Asia',
    'current_roles', ARRAY[
      'Partner, Right Click Capital',
      'Co-Director, Founder Institute Sydney',
      'Mentor and panellist across multiple AU/SEA/US startup programs'
    ],
    'personal_blog','https://benjaminchong.com/',
    'investment_thesis','Internet-native businesses across ANZ and SE Asia with credible international scale paths, prioritising B2B SaaS, marketplaces and fintech.',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/benjaminchong',
      'personal_website','https://benjaminchong.com/',
      'crunchbase','https://www.crunchbase.com/person/benjamin-chong',
      'right_click_team','https://www.rightclickcapital.com/team/',
      'business_gov_customer_story','https://business.gov.au/grants-and-programs/early-stage-venture-capital-limited-partnerships/customer-stories/right-click-capital',
      'fi_sydney','https://fi.co/insight/australian-startup-ecosystem-leader-benjamin-chong-featured-writing',
      'siskar_interview','https://www.siskar.com/blog/2019/3/25/benjamin-chong-right-click-capital',
      'smartcompany','https://www.smartcompany.com.au/startupsmart/news/vc-attention-right-click-capital-benjamin-chong/',
      'highgrowthventures_invested','https://www.highgrowthventures.com.au/resources-hub/invested/benjamin-chong'
    ),
    'corrections','CSV email was truncated ("benjamin.chong@rightcli..."). Resolved to benjamin.chong@rightclickcapital.com. CSV portfolio empty — populated with verified firm/program affiliations rather than fabricating individual portfolio companies (Right Click''s fund-level portfolio is published separately on its website).'
  ),
  updated_at = now()
WHERE name = 'Benjamin Chong';

UPDATE investors SET
  description = 'Australian early-stage angel syndicate operating on the Aussie Angels platform since February 2023. Run by Vadim Petrichenko (Syndicate Lead). 4–6 deals per year across FinTech, MarTech, AdTech, Productivity/Enterprise SaaS and DeepTech. $100k+ syndicate cheques. Vadim was shortlisted for Investor of the Year — 2023 Governor of Victoria Startup Awards.',
  basic_info = 'Blossom Capital Partners is an Australian early-stage angel syndicate built on the Aussie Angels platform with the explicit goal of making early-stage startup investing more accessible to part-time angels. The syndicate is operated by Syndicate Lead Vadim Petrichenko and has been live since February 2023.

Blossom takes an explicit "quality over quantity" stance, targeting 4–6 deals per year so that each portfolio company can receive meaningful diligence and post-investment support. Their published focus verticals are FinTech, MarTech, AdTech, Productivity / Enterprise SaaS and DeepTech.

Vadim brings 20 years of corporate Commercial and Procurement leadership experience, having led large-scale deals and strategies across IT, Retail, Franchise, Finance, Infrastructure, Telecommunications and Manufacturing. He studied Software Engineering before completing a Bachelor of Business Law. He was shortlisted for Investor of the Year at the 2023 Governor of Victoria Startup Awards. He is also separately listed as a seed investor in Empiraa.

Note: Despite the similar name, this is **not** the London-headquartered Series-A VC "Blossom Capital" run by Ophelia Brown. Founders should be careful not to confuse the two.',
  why_work_with_us = 'Best for Australian fintech/martech/adtech/SaaS/deeptech founders raising a structured pre-seed or seed round who want a syndicate cheque ($100k+) plus an active syndicate lead with deep enterprise procurement and commercial experience. Note disambiguation from London VC of similar name.',
  sector_focus = ARRAY['FinTech','MarTech','AdTech','Productivity SaaS','Enterprise SaaS','DeepTech','RegTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 100000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/company/blossom-capital-partners',
  contact_email = 'vadim.l.petrichenko@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Empiraa (seed; Vadim personally)'],
  meta_title = 'Blossom Capital Partners — Aussie Angels syndicate (Vadim P)',
  meta_description = 'Melbourne angel syndicate on Aussie Angels. Run by Vadim Petrichenko. 4–6 deals/yr in FinTech, MarTech, AdTech, SaaS, DeepTech. $100k+ syndicate cheques.',
  details = jsonb_build_object(
    'syndicate_platform','Aussie Angels',
    'syndicate_url','https://app.aussieangels.com/syndicate/blossom-capital-partners',
    'live_since','February 2023',
    'syndicate_lead','Vadim Petrichenko',
    'syndicate_lead_background', jsonb_build_object(
      'experience','20+ years Commercial & Procurement leadership',
      'industries', ARRAY['IT','Retail','Franchise','Finance','Infrastructure','Telecommunications','Manufacturing'],
      'education', ARRAY['Software Engineering','Bachelor of Business Law'],
      'recognition','Shortlisted, Investor of the Year — 2023 Governor of Victoria Startup Awards'
    ),
    'cadence','4–6 deals per year (quality-over-quantity stance)',
    'investment_thesis','Selective Australian early-stage cheques in FinTech, MarTech, AdTech, Productivity/Enterprise SaaS and DeepTech, with an explicit "operator angel" support model from Vadim post-investment.',
    'check_size_note','$100k+ syndicate cheques',
    'disambiguation','Not to be confused with Blossom Capital (London-headquartered Series-A VC, Ophelia Brown). Different firms, different geographies, different stages.',
    'sources', jsonb_build_object(
      'aussie_angels_syndicate','https://app.aussieangels.com/syndicate/blossom-capital-partners',
      'linkedin_company','https://www.linkedin.com/company/blossom-capital-partners',
      'vadim_linkedin','https://www.linkedin.com/in/vadimpetrichenko/',
      'vadim_empiraa','https://theorg.com/org/empiraa/org-chart/vadim-petrichenko',
      'how_to_get_invest_youtube','https://www.youtube.com/watch?v=l6d3Ne6Ylow',
      'angel_day_in_life_youtube','https://www.youtube.com/watch?v=Jjo2kqvbZVY'
    ),
    'corrections','CSV LinkedIn URL truncated ("blossom-capital..."). Resolved to /company/blossom-capital-partners. CSV portfolio "Confidential" — left high-level (no individual companies listed) per syndicate''s stated confidentiality preference; added Empiraa as a personally-disclosed Vadim-level investment. Added explicit disambiguation against London VC.'
  ),
  updated_at = now()
WHERE name = 'Blossom Capital Partners';

UPDATE investors SET
  description = 'Sydney-based fintech operator-angel. Co-founder of Pocketbook (personal-finance app, founded 2012, acquired by Zip in September 2016 for ~AU$7.5M). Former Head of Growth at Zip. Active angel investor across Earnd (exited), Ordermentum, Tiiik and Atelier. $25k–$100k cheques.',
  basic_info = 'Bosco Tan is a Sydney-based fintech founder, growth operator and angel investor. He co-founded Pocketbook in 2012 with Alvin Singh — conceived a year earlier in a Wolli Creek apartment as a personal money-management tool — which grew into one of Australia''s leading personal-finance management apps. Pocketbook was acquired in September 2016 by ASX-listed Zip Co (ASX: Z1P) for ~AU$7.5M.

Following the acquisition, Bosco served as Chief Operating Officer at Pocketbook and then Head of Growth at Zip, where he had operating exposure to one of Australia''s defining BNPL scale-up stories before transitioning to a self-employed advisor and angel investor.

His angel portfolio leans into B2B SaaS, marketplaces and consumer-tech adjacencies. Verified investments include Earnd (earned-wage access; exited via acquisition by Greensill), Ordermentum (hospitality wholesale ordering), Tiiik (consumer fintech) and Atelier. He is described in public profiles as well connected in the Australian early-stage community with a natural business-development and sales lean.',
  why_work_with_us = 'A rare combination of fintech-founder credibility (Pocketbook → Zip exit) plus growth-operator experience inside an ASX-listed BNPL leader. Particularly useful for fintech, B2B SaaS and consumer-tech founders preparing for a growth phase or thinking about scaling go-to-market alongside a corporate acquirer.',
  sector_focus = ARRAY['FinTech','SaaS','Marketplace','Consumer','HealthTech','FoodTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 100000,
  linkedin_url = 'https://au.linkedin.com/in/boscotan',
  contact_email = 'boscotan@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Pocketbook (co-founder; Zip acquisition 2016)','Earnd (exited)','Ordermentum','Tiiik','Atelier'],
  meta_title = 'Bosco Tan — Pocketbook co-founder | Sydney FinTech Angel',
  meta_description = 'Sydney fintech operator-angel. Co-founder Pocketbook (Zip acquisition Sept 2016, ~$7.5M). Ex-Head of Growth Zip. Portfolio: Earnd, Ordermentum, Tiiik.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Pocketbook (2012, co-founder; sold to Zip Sept 2016)'],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Pocketbook','acquirer','Zip Co (ASX: Z1P)','year',2016,'value_aud','~$7.5M'),
      jsonb_build_object('company','Earnd','status','Exited (acquired by Greensill)')
    ),
    'prior_roles', ARRAY[
      'Co-founder & COO, Pocketbook (2012–2016+)',
      'Head of Growth, Zip (post-Pocketbook acquisition)'
    ],
    'current_roles', ARRAY[
      'Self-employed advisor and angel investor'
    ],
    'investment_thesis','Sydney-based operator cheques into fintech, B2B SaaS and consumer-tech businesses where growth-operator support and ASX-listed-acquirer-context add to the cheque.',
    'check_size_note','$25k–$100k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/boscotan',
      'crunchbase','https://www.crunchbase.com/person/bosco-tan',
      'pitchbook','https://pitchbook.com/profiles/investor/303617-26',
      'angellist','https://angel.co/p/bosco-tan',
      'wellfound','https://wellfound.com/p/bosco-tan',
      'pocketbook_wiki','https://en.wikipedia.org/wiki/Pocketbook_(application)',
      'pocketbook_zip_closure','https://www.businessnewsaustralia.com/articles/zip-cuts-pocketbook-app-loose-as-operational-challenges-hit-bnpl-sector.html',
      'sbs_pocketbook','https://www.sbs.com.au/news/small-business-secrets/article/2018/03/22/small-business-check-pocketbook',
      '8percent_interview','https://the8percent.com/entrepreneur-insider-series-bosco-tan-alvin-singh-pocketbook/'
    ),
    'corrections','CSV portfolio was truncated ("Zip, Happy Co, Jayride, E..."). Zip is his ex-employer (post-Pocketbook acquisition) rather than a personal angel investment, so removed from portfolio array. "E..." resolved to Earnd (verified exit). Happy Co and Jayride could not be independently verified as Bosco Tan investments via public-source search; left out of verified portfolio but flagged here for follow-up.'
  ),
  updated_at = now()
WHERE name = 'Bosco Tan';

UPDATE investors SET
  description = 'San Francisco-based Australian operator-angel. Founding Partner of Bonav Investments (since 2014). President & COO of Kapiche (since 2020). Joined Arkose Labs as one of its first employees and built the Operations function (VP/COO). Angel investor in Shippit (2015) and advisor/investor at Arkose Labs.',
  basic_info = 'Brendan Brummer is a San Francisco-based Australian SaaS operator and angel investor with a strong finance and analytical foundation. He started his career at PwC Australia (joined 2015 as an Analyst) helping build a new team focused on Emerging Companies, before relocating into operating roles at venture-stage US technology businesses.

In 2014 he became a Founding Partner at Bonav Investments, an advice-and-investment vehicle, and in 2015 he became Advisory Board Member and Investor at Sydney logistics-tech business Shippit (May 2015) — among his first verifiable angel investments.

In 2017 he was appointed VP Operations (effectively COO) at Arkose Labs, joining as one of its first employees. He helped define the company''s overall strategy and direction in its formative years and oversaw Finance, Legal, People & Culture and Customer Success. He continues to hold an angel-investor and board-advisor position with Arkose Labs.

Since 2020 he has been President & COO of Kapiche, a customer-experience and feedback-analytics SaaS business.

His public posture is "always depends" on cheque size — he writes cheques calibrated to the deal stage and his available capital, rather than a fixed band.',
  why_work_with_us = 'For B2B SaaS and enterprise/security/fraud-prevention founders, Brendan is among the more useful Sydney-network operator-angels with a deep San Francisco operational base. His Arkose Labs scaling experience (early employee through to growth) and Kapiche customer-experience SaaS background make him particularly valuable to founders building B2B SaaS with US enterprise GTM ambitions.',
  sector_focus = ARRAY['B2B SaaS','Enterprise Security','Fraud Detection','CX/Feedback Analytics','Logistics','Cyber Security'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/brendanbrummer/',
  contact_email = 'brendan@brummer.haus',
  location = 'San Francisco, USA',
  country = 'United States',
  currently_investing = true,
  portfolio_companies = ARRAY['Arkose Labs (early employee, VP Ops/COO; angel + board advisor)','Kapiche (President & COO since 2020)','Shippit (advisor + investor since May 2015)','Bonav Investments (Founding Partner since 2014)'],
  meta_title = 'Brendan Brummer — Bonav, Arkose Labs, Kapiche | SF Operator-Angel',
  meta_description = 'San Francisco-based Australian SaaS operator-angel. Founding Partner Bonav Investments. President/COO Kapiche. Ex-VP Ops Arkose Labs. Shippit angel.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Bonav Investments (2014, Founding Partner)'],
    'current_roles', ARRAY[
      'President & COO, Kapiche (since 2020)',
      'Founding Partner, Bonav Investments (since 2014)',
      'Angel Investor & Board Advisor, Arkose Labs'
    ],
    'prior_roles', ARRAY[
      'VP Operations, Arkose Labs (since 2017; one of first employees)',
      'Analyst, PwC Australia (since 2015)',
      'Advisory Board Member & Investor, Shippit (since May 2015)'
    ],
    'investment_thesis','B2B SaaS, enterprise security, fraud-detection, CX/feedback analytics and logistics-tech with U.S. enterprise scale paths — areas where his operating experience compounds with the cheque.',
    'check_size_note','"Always depends" — calibrated to deal stage, not fixed band',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/brendanbrummer/',
      'crunchbase','https://www.crunchbase.com/person/brendan-brummer',
      'bonav_profile','https://bonav.io/brendan-brummer',
      'arkose_labs_blog','https://www.arkoselabs.com/blog/author/brendan/',
      'kapiche_org','https://theorg.com/org/kapiche/org-chart/brendan-brummer',
      'shippit_investor_hunt','https://investorhunt.co/investments/shippit',
      'bonav_crunchbase','https://www.crunchbase.com/organization/bonav',
      'arkose_funding_wellfound','https://wellfound.com/company/arkoselabs/funding'
    ),
    'corrections','CSV portfolio was truncated ("Carta, Arkose Labs, Ship..."). "Ship..." resolved to Shippit (verified May 2015 angel investment). "Carta" is a US cap-table SaaS company — could not independently verify Brendan Brummer as an investor; not included in verified portfolio. Email taken as-listed (brendan@brummer.haus, personal domain).'
  ),
  updated_at = now()
WHERE name = 'Brendan Brummer';

COMMIT;
