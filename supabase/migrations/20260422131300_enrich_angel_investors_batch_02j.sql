-- Enrich angel investors — batch 02j (records 69-73: David Elliott → Debra Hall)

BEGIN;

UPDATE investors SET
  description = 'Brisbane-based CFO and angel investor. CFO of Novena (Australian property business). Startmate First Believer. AGSM UNSW MBA candidate. Small-cheque sector-agnostic angel ($5k–$10k).',
  basic_info = 'David Elliott is a Brisbane-based finance professional who has crossed over into angel investing through the Startmate First Believer program — Startmate''s pipeline for emerging Australian operator-angels. His day job is CFO at Novena, an Australian property business, and he is currently an MBA candidate at AGSM UNSW.

His CSV-listed cheque size of $5k–$10k and sector-agnostic posture reflect a typical First Believer-stage operator-angel — small first cheques into Australian early-stage technology with broad mandate, prioritising founder quality over sector specialisation.',
  why_work_with_us = 'For Brisbane and Queensland founders running pre-seed rounds, David offers a small first-money cheque from a Startmate-network-aligned angel with finance-CFO discipline. Particularly useful where founders want a peer-level reference cheque from someone in the Startmate pipeline ecosystem.',
  sector_focus = ARRAY['SaaS','Consumer','FinTech','PropTech','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 10000,
  linkedin_url = 'https://www.linkedin.com/in/david-elliott-60a2832b/',
  contact_email = 'd.elliott.business@gmail.com',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Novena (CFO)','Startmate First Believer'],
  meta_title = 'David Elliott — Novena CFO / Startmate First Believer | Brisbane Angel',
  meta_description = 'Brisbane CFO at Novena (property). Startmate First Believer. AGSM UNSW MBA candidate. Sector-agnostic small first cheques ($5k–$10k).',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'CFO, Novena (Australian property business)',
      'Startmate First Believer (emerging-angel pipeline)',
      'MBA candidate, AGSM UNSW'
    ],
    'investment_thesis','Sector-agnostic small first cheques into Australian early-stage technology with finance-discipline overlay. Bias to founders surfaced through the Startmate First Believer pipeline.',
    'check_size_note','$5k–$10k',
    'unverified', ARRAY[
      'Beyond CSV directory listing and First Believer affiliation, no detailed portfolio-investment record could be uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/david-elliott-60a2832b/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'cut_through_investments','https://www.cutthrough.com/investments'
    ),
    'corrections','CSV LinkedIn URL verified. CSV email truncated ("d.elliott.business@gmail...."). Resolved to d.elliott.business@gmail.com. Sector_focus from "sector agnostic" expanded to common First-Believer-pipeline verticals while preserving sector-agnostic stance.'
  ),
  updated_at = now()
WHERE name = 'David Elliott';

UPDATE investors SET
  description = 'Sydney-based angel investor with technology focus. $25k–$50k cheques. CSV-listed portfolio includes ION Energy and Mainstream Renewable Power. Limited public investor profile beyond directory listing.',
  basic_info = 'David Walsh is a Sydney-based angel investor listed in the Australian angel directory at $25k–$50k cheque band, with a stated focus on "All but focus on Technology". His CSV-listed portfolio names include ION Energy (Indian-listed/global lithium-battery and energy-storage company) and Mainstream Renewable Power (Irish-headquartered renewables developer).

The directory listing has not been uniquely corroborated to a single LinkedIn or Crunchbase profile from public-source search alone — multiple "David Walsh" investors operate in the Sydney/Australian and global energy/finance ecosystems, including a Partner at Energy Capital Partners (ECP). Founders should expect to validate his profile and thesis directly via the listed email.',
  why_work_with_us = 'For Sydney-based founders building in technology and energy-transition categories, David''s mid-band cheque ($25k–$50k) plus apparent energy-sector portfolio (ION Energy, Mainstream Renewable Power) suggest a useful relationship for cleantech, energy-storage, batteries and power-infrastructure adjacencies.',
  sector_focus = ARRAY['Technology','Energy','Renewables','Batteries','Power Infrastructure','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/david-walsh-81912616/',
  contact_email = 'dwalsh1@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['ION Energy','Mainstream Renewable Power'],
  meta_title = 'David Walsh — Sydney Tech & Energy Angel | $25k–$50k',
  meta_description = 'Sydney-based angel investor with technology and energy focus. $25k–$50k cheques. CSV portfolio: ION Energy, Mainstream Renewable Power.',
  details = jsonb_build_object(
    'investment_thesis','Sydney-based technology-focused angel cheques with apparent energy-sector portfolio. Mid-band cheques.',
    'check_size_note','$25k–$50k',
    'unverified', ARRAY[
      'Could not uniquely match the directory listing to a single LinkedIn/Crunchbase profile (multiple David Walsh individuals in Sydney venture/finance/energy).',
      'CSV portfolio (ION Energy, Mainstream Renewable Power) verified as real companies but his cap-table participation not independently corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/david-walsh-81912616/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'shizune_energy_angels','https://shizune.co/investors/energy-angel-investors-australia'
    ),
    'corrections','CSV portfolio "ION Energy, Mainstream..." retained verbatim — Mainstream interpreted as Mainstream Renewable Power, the Irish-headquartered renewables developer, but could not be uniquely corroborated as a David Walsh personal investment.'
  ),
  updated_at = now()
WHERE name = 'David Walsh';

UPDATE investors SET
  description = 'Sydney-based serial founder, prolific angel investor and ecosystem leader. Co-founder of Spreets — Australia''s first group-buying site, sold to Yahoo!7 for ~$40M just 11 months after launch (2011). 96+ angel investments. CEO/Co-founder of TechSydney. Founding mentor and investor at Startmate. Personal vehicle: Binary Investments.',
  basic_info = 'Dean McEvoy is one of the most-cited names in Australian early-stage venture. He is a serial founder turned full-time angel investor with three startup founder credentials and 96+ angel investments to his name.

His best-known operating story is **Spreets** — Australia''s first group-buying website, which he co-founded with Pollenizer''s Phil Morle in February 2010 after seeing the model in the US. Spreets was sold to Yahoo!7 just 11 months later for approximately AU$40 million — one of the fastest, highest-multiple Australian startup exits of that era. Before Spreets, Dean commercialised and patented **Booking Angel** (online booking software for service businesses).

Post-exit, Dean became one of the founding mentors and investors at **Startmate**, Australia''s most-active early-stage accelerator. After his Spreets earn-out completed in June 2012 he formalised his angel practice through **Binary Investments**, his personal investment vehicle, and through his 96+ angel-investment portfolio (visible across AngelList, Crunchbase and personal commentary).

In 2015 he co-founded and serves as CEO of **TechSydney**, the world''s largest member-funded technology industry group, which lobbies for and accelerates Sydney''s technology ecosystem. He is also an instructor at General Assembly and a regular speaker (VIVID Sydney, Day One FM and others) advocating for more high-cheque Australian angel activity.',
  why_work_with_us = 'For Australian founders running structured pre-seed and seed rounds, Dean is among the best-credentialed operator-angels in the country: high-multiple Spreets exit; 96+ portfolio with deep pattern recognition; Startmate founding mentor; CEO of TechSydney with ecosystem reach across Sydney, Australia and the US. Particularly useful for marketplace, group-buying, consumer-internet and SaaS founders who want venture-style support at angel speed.',
  sector_focus = ARRAY['Marketplace','SaaS','Consumer Internet','Group Buying','High Growth Tech','FinTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 25000,
  check_size_max = 50000,
  website = 'https://www.deanmcevoy.com',
  linkedin_url = 'https://www.linkedin.com/in/deanmcevoy/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Spreets (co-founder; Yahoo!7 exit 2011, ~AU$40M)','Booking Angel (founder)','TechSydney (CEO, co-founder)','Binary Investments (founder)','Blackbird Ventures (LP)','Startmate (founding mentor, investor)'],
  meta_title = 'Dean McEvoy — Spreets / TechSydney | Sydney Big-Cheque Angel',
  meta_description = 'Sydney serial founder. Spreets co-founder (Yahoo!7 ~$40M exit 2011). 96+ angel investments. Startmate founding mentor. CEO TechSydney.',
  details = jsonb_build_object(
    'founder_of', ARRAY[
      'Spreets (co-founder with Phil Morle, 2010; Yahoo!7 exit 2011, ~AU$40M)',
      'Booking Angel (founder; commercialised and patented online booking software)',
      'TechSydney (co-founder, CEO)',
      'Binary Investments (personal investment vehicle)'
    ],
    'exits', jsonb_build_array(
      jsonb_build_object('company','Spreets','category','Australia''s first group-buying site','acquirer','Yahoo!7','year',2011,'value_aud','~AU$40M','time_to_exit','11 months')
    ),
    'angel_portfolio_count','96+ across Australia and globally',
    'current_roles', ARRAY[
      'CEO & Co-Founder, TechSydney',
      'Founding Mentor & Investor, Startmate',
      'Instructor, General Assembly',
      'Personal investment vehicle: Binary Investments'
    ],
    'csv_listed_portfolio_hints', ARRAY['Blackbird Ventures (LP)'],
    'media_speaker', ARRAY['VIVID Creative Sydney','Day One FM','Anthill Magazine','Startup Grind Sydney'],
    'investment_thesis','Australian early-stage marketplace, consumer-internet and SaaS businesses with high growth potential. Hands-on operator support post-investment, with TechSydney distribution and Startmate-network reach.',
    'check_size_note','$25k–$50k',
    'sources', jsonb_build_object(
      'website','https://www.deanmcevoy.com',
      'about','https://www.deanmcevoy.com/about',
      'crunchbase','https://www.crunchbase.com/person/dean-mcevoy',
      'angellist','https://angel.co/p/dean-mcevoy',
      'startup_grind','https://www.startupgrind.com/events/details/startup-grind-sydney-presents-dean-mcevoy-techsydney-spreets-booking-angel/',
      'day_one_fm','https://dayone.fm/episode/dean-mcevoy-on-egos-and-startups',
      'anthill_vivid','https://anthillonline.com/australia-needs-more-angels-spreets-co-founder-dean-mcevoy-shares-some-hard-truths-at-vivid-creative-sydney/',
      'general_assembly','https://generalassemb.ly/instructors/dean-mcevoy/2824'
    ),
    'corrections','CSV portfolio truncated ("Spreets (Founder), Black..."). Resolved "Black..." to Blackbird Ventures (he is publicly an LP) and added Booking Angel, TechSydney, Binary Investments and Startmate as founder/role positions. CSV email empty — left contact_email NULL (deanmcevoy.com contact form is the documented public path).'
  ),
  updated_at = now()
WHERE name = 'Dean McEvoy';

UPDATE investors SET
  description = 'Sydney-based legal-tech founder and angel investor. Co-founder & President of DocsCorp (legal document productivity SaaS, sold to Litera in March 2021). 25+ year career in product/technology. Computer Science degree from UTS Sydney. $50k–$500k cheques across LegalTech, FinTech and adjacent SaaS.',
  basic_info = 'Dean Sappey is a Sydney-based legal-technology founder and angel investor with a 25+ year track record across product, technology and document-productivity software. He is the Co-Founder and President of DocsCorp, a leading provider of document productivity tools (compare, repair, redact, metadata management) embedded in the workflows of law firms, accounting firms and corporate legal departments globally.

DocsCorp grew under his leadership through to its acquisition by Litera (the global legal-software platform) in March 2021 — adding DocsCorp''s document-drafting and quality capabilities to Litera''s broader legal-technology stack. He continues as President of DocsCorp post-acquisition. DocsCorp also acquired the document-assembly platform verowave in July 2020 under his leadership.

He holds a Computer Science degree from the University of Technology, Sydney. His angel cheque band of $50k–$500k sits at the upper end of solo-angel range — appropriate for a founder with a Litera-scale exit on his cap table. His angel thesis spans LegalTech, FinTech and adjacent enterprise-SaaS categories where his DocsCorp operating playbook directly applies.',
  why_work_with_us = 'For LegalTech, FinTech, document-management and compliance-SaaS founders, Dean is among Australia''s most credentialed operator-angels in the category — DocsCorp scaled to a Litera acquisition and his $50k–$500k cheque band can lead structured seed/Series A rounds. Particularly useful for founders selling into law firms, accounting firms or corporate legal departments globally.',
  sector_focus = ARRAY['LegalTech','FinTech','Document Management','Enterprise SaaS','Compliance','RegTech'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 500000,
  linkedin_url = 'https://www.linkedin.com/in/dean-sappey/',
  contact_email = 'dsappey@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['DocsCorp (co-founder, President; Litera acquisition March 2021)','verowave (acquired by DocsCorp July 2020)'],
  meta_title = 'Dean Sappey — DocsCorp co-founder | Sydney LegalTech Angel',
  meta_description = 'Sydney legal-tech founder. Co-founder/President DocsCorp (Litera acquisition 2021). 25+ years product/tech. CS degree UTS. $50k–$500k cheques.',
  details = jsonb_build_object(
    'founder_of', ARRAY['DocsCorp (co-founder, President)'],
    'exits', jsonb_build_array(
      jsonb_build_object('company','DocsCorp','category','Legal document productivity SaaS','acquirer','Litera','year',2021,'month','March','dean_role','President & Co-Founder')
    ),
    'docscorp_acquisitions', ARRAY['verowave (document assembly, July 2020)'],
    'experience_years','25+',
    'education', ARRAY['Bachelor of Computer Science, University of Technology Sydney (UTS)'],
    'media_presence', ARRAY['Accounting Today columns','American Banker columns','Legal IT Insider interviews','Twitter/X'],
    'investment_thesis','LegalTech, FinTech and adjacent enterprise-SaaS where document-management, compliance and legal-workflow expertise is value-add. Cheque size capable of leading or co-leading structured seed/Series A rounds.',
    'check_size_note','$50k–$500k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/dean-sappey/',
      'crunchbase','https://www.crunchbase.com/person/dean-sappey',
      'docscorp_team','https://www.docscorp.com/about/docscorp/meet-the-team/dean-sappey/',
      'litera_acquisition','https://www.litera.com/newslinks/litera-acquires-docscorp-expand-solutions-available-customers',
      'lawnext_acquisition','https://www.lawnext.com/2021/03/litera-acquires-docscorp-rounding-out-its-document-drafting-capabilities.html',
      'legaltechnology_growth','https://legaltechnology.com/docscorp-unveils-20-growth-for-2018-2019-we-speak-to-co-founder-dean-sappey/',
      'verowave_acquisition','https://legaltechnology.com/2020/07/07/docscorp-acquires-document-assembly-platform-verowave/',
      'accounting_today','https://www.accountingtoday.com/author/dean-sappey',
      'american_banker','https://www.americanbanker.com/author/dean-sappey'
    ),
    'corrections','CSV portfolio "CEO and Co-founder of D..." — interpreted as DocsCorp (his own company, fully verified). DocsCorp is his founder/operating company rather than an angel investment, but listed in portfolio_companies as the primary operator-credential founders should care about. CSV LinkedIn URL verified.'
  ),
  updated_at = now()
WHERE name = 'Dean Sappey';

UPDATE investors SET
  description = 'Auckland-based career independent director, angel investor and mentor. NZ Arch Angel 2017 (Angel Association of NZ). ICE Angels WH Payne Active Angel 2015. Active across Flying Kiwi Angels, ICE Angels and AANZ. Director and Chair of Investment Committee at KiwiNet (Kiwi Innovation Network). Currently NOT taking new angel investments per CSV listing.',
  basic_info = 'Debra Hall is one of New Zealand''s most decorated angel investors and ecosystem builders. She has been recognised as **NZ Arch Angel 2017** by the Angel Association of New Zealand for services to angel investing and the startup community, and as **WH Payne Active Angel of the Year 2015** by ICE Angels.

Her portfolio of board roles and angel-network affiliations spans:
- **KiwiNet (Kiwi Innovation Network)** — Director and Chair of Investment Committee.
- **Valocity Ltd** — Advisory Board Lead (NZ-headquartered fintech).
- **Massey Global Ltd** — Independent Director.
- **Bobux Ltd** — Independent Director (NZ children''s footwear brand).
- **Rose & Thorne Design Ltd** — Chairman (lingerie business).
- **WayBeyond** — Board member (NZ AgTech).
- **Mindhive Global** — past portfolio.
- **Flying Kiwi Angels** — long-standing member.
- **ICE Angels** — long-standing member.

She brings 20+ years of experience in the innovation sector, runs the Startup Toolkit Series on angel investment with eCentre Business Incubator, and is a member of Global Women NZ.

**Important: per CSV directory listing, Debra is currently NOT taking new angel investments.** Her profile is retained for ecosystem context and historical reference; founders looking for active NZ angel relationships should approach Flying Kiwi Angels or ICE Angels directly.',
  why_work_with_us = 'Despite her current "not investing" stance, Debra remains one of the most important reference points in the NZ angel-investor ecosystem. For NZ founders building in fintech (Valocity), agtech (WayBeyond), women''s consumer (Rose & Thorne, Bobux) and innovation-commercialisation (KiwiNet), her board-network reach makes her a high-leverage advisory or warm-intro relationship.',
  sector_focus = ARRAY['FinTech','AgTech','Consumer','HealthTech','Innovation Commercialisation','Women-led','Generalist'],
  stage_focus = ARRAY['Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/rugbymother/',
  location = 'Auckland, New Zealand',
  country = 'New Zealand',
  currently_investing = false,
  leads_deals = false,
  portfolio_companies = ARRAY['Valocity','Mindhive Global','Bobux','Massey Global','Rose & Thorne Design','WayBeyond','KiwiNet','Flying Kiwi Angels','ICE Angels'],
  meta_title = 'Debra Hall — NZ Arch Angel 2017 | Auckland (NOT currently investing)',
  meta_description = 'Auckland career angel investor and director. NZ Arch Angel 2017. ICE Angels Active Angel 2015. KiwiNet, Valocity, Bobux, Massey. NOT currently investing.',
  details = jsonb_build_object(
    'recognition', ARRAY[
      'NZ Arch Angel Award (2017) — Angel Association of New Zealand',
      'WH Payne Active Angel of the Year (2015) — ICE Angels'
    ],
    'current_status','NOT currently investing (per CSV directory)',
    'current_board_roles', ARRAY[
      'Director and Chair of Investment Committee, KiwiNet (Kiwi Innovation Network)',
      'Advisory Board Lead, Valocity Ltd (fintech)',
      'Independent Director, Massey Global Ltd',
      'Independent Director, Bobux Ltd (children''s footwear)',
      'Chairman, Rose & Thorne Design Ltd (lingerie)',
      'Board member, WayBeyond (AgTech)'
    ],
    'angel_network_affiliations', ARRAY[
      'Flying Kiwi Angels',
      'ICE Angels',
      'Angel Association of New Zealand (AANZ)'
    ],
    'community_involvement', ARRAY[
      'Global Women NZ member',
      'eCentre Startup Toolkit Series — Angel Investment instructor'
    ],
    'experience_years','20+ years innovation sector',
    'investment_thesis','Historically generalist with AgTech, FinTech, women-led consumer and innovation-commercialisation depth via NZ ecosystem networks. Currently paused.',
    'check_size_note','Not currently investing',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/rugbymother/',
      'global_women','https://globalwomen.org.nz/member/debra-hall/',
      'nz_entrepreneur_arch_angel_2017','https://nzentrepreneur.co.nz/debra-hall-named-new-zealand-arch-angel-2017/',
      'rocketreach_kiwinet','https://rocketreach.co/debra-hall-email_52162401',
      'flying_kiwi_angels_contact','https://contactout.com/Debra-Hall-18027830',
      'ecentre_toolkit','https://www.ecentre.org.nz/events/angel-investment',
      'boardpro_intro','https://www.boardpro.com/blog/introducing-debra-hall',
      'twitter_rugbymother','https://twitter.com/rugbymother',
      'valocity_huljich','https://www.valocityglobal.com/en-au/2018/08/valocity-attracts-investment-from-the-huljich-family-to-further-expansion-opportunities/',
      'waybeyond_appointment','https://www.fruitnet.com/asiafruit/debra-hall-joins-waybeyond-board/187032.article'
    ),
    'corrections','CSV portfolio truncated ("Valocity, Mindhive Global,..."). Two retained as verified board/portfolio links; expanded with Bobux, Massey Global, Rose & Thorne, WayBeyond and KiwiNet from public board records. CSV "Not currently investing" status preserved in currently_investing = false. CSV email field "Not currently investing" interpreted as a status note — left contact_email NULL.'
  ),
  updated_at = now()
WHERE name = 'Debra Hall';

COMMIT;
