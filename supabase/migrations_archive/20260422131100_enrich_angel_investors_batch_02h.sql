-- Enrich angel investors — batch 02h (records 59-63: Cut Through Angels → Daniel Murray)

BEGIN;

UPDATE investors SET
  description = 'Australian angel syndicate operated by Cut Through Venture (the country''s most-cited Australian startup-funding-data publisher). Founded and led by Chris Gillings (also at Five V Capital). Operates on the Aussie Angels platform. Exclusive syndicate partner for Techstars Tech Central Sydney. Software focus, $100k–$300k syndicate cheques.',
  basic_info = 'Cut Through Angels is the angel-syndicate vehicle operated by Cut Through Venture, the publisher of Australia''s most-trusted startup funding data and quarterly investment reports. Founded and led by Chris Gillings — who also sits on the venture team at Five V Capital — Cut Through emerged to fill a market data gap that global platforms didn''t cover, then naturally evolved a syndicate model alongside its publishing footprint.

The syndicate runs on the Aussie Angels platform. It operates as one of Australia''s largest angel syndicates by member count and was named the exclusive syndicate partner for the inaugural Techstars Tech Central Sydney accelerator — meaning Cut Through Angels members get first-look access to that cohort''s rounds.

Chris Gillings'' bio is unusual: he spent a decade in the US working in venture capital, including the corporate-VC arm of Mastercard, before returning to Australia and starting Cut Through Venture. His Five V Capital seat means deal-flow visibility from Series A+ as well.

The published cheque band is $100k–$300k at the syndicate level, with software-focused mandate. CSV portfolio includes Cake Equity (cap-table SaaS), Aerotruth and a third name truncated in the source data.',
  why_work_with_us = 'For Australian software founders raising structured pre-seed/seed rounds with strong data fundamentals, Cut Through is one of the most interesting syndicate cheques on the market — combining (a) Australia''s sharpest funding-data publishing eye, (b) Techstars Tech Central first-look pipeline, and (c) Five V Capital institutional pathway access via Chris.',
  sector_focus = ARRAY['Software','SaaS','B2B','Marketplace','FinTech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 100000,
  check_size_max = 300000,
  website = 'https://cutthroughventure.com',
  linkedin_url = 'https://au.linkedin.com/company/cut-through-venture',
  contact_email = 'team@cutthroughventure.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Cake Equity','Aerotruth'],
  meta_title = 'Cut Through Angels — Cut Through Venture syndicate | AU Software Angel',
  meta_description = 'Cut Through Angels syndicate. Australia''s top funding-data publisher. Chris Gillings (also Five V Capital). Techstars Tech Central exclusive. Software focus.',
  details = jsonb_build_object(
    'syndicate_lead','Chris Gillings (Founder, Cut Through Venture; venture team at Five V Capital)',
    'parent','Cut Through Venture (Australian startup-funding-data publisher and quarterly reports)',
    'syndicate_platform','Aussie Angels',
    'syndicate_url','https://app.aussieangels.com/syndicate/cut-through-angels',
    'exclusive_partnerships', ARRAY['Techstars Tech Central Sydney (exclusive syndicate partner)'],
    'chris_gillings_background', jsonb_build_object(
      'us_career','10 years in US venture capital including Mastercard corporate VC',
      'current_roles', ARRAY['Founder, Cut Through Venture','Venture team, Five V Capital']
    ),
    'investment_thesis','Software-focused angel syndicate cheques with data-led conviction, leveraging Cut Through Venture''s sector-wide visibility and Techstars Sydney pipeline.',
    'check_size_note','$100k–$300k syndicate cheques',
    'sources', jsonb_build_object(
      'aussie_angels','https://app.aussieangels.com/syndicate/cut-through-angels',
      'linkedin','https://au.linkedin.com/company/cut-through-venture',
      'tribe_global_podcast','https://tribeglobalventures.podbean.com/e/investor-focus-ep-8-chris-gillings-of-cut-through-venture-and-5-v-capital/',
      'innovation_bay','https://innovationbay.com/news/market-update-and-crystal-ball-from-cut-through-venture-%F0%9F%94%AE/',
      'techstars_partnership','https://www.overnightsuccess.vc/p/techstars-tech-central-sydney-cut-through-angels',
      'q3_2024_report','https://tribeglobalventures.podbean.com/e/chris-gillings-cut-through-venture-q3-2024-report/'
    ),
    'corrections','CSV LinkedIn URL was truncated ("cut-through-ventu..."). Resolved to /company/cut-through-venture. CSV portfolio truncated ("Cake Equity, Aerotruth, M..."). Two names retained as verified; trailing item could not be uniquely identified. CSV cheque band "$100-300K" interpreted as $100k–$300k.'
  ),
  updated_at = now()
WHERE name = 'Cut Through Angels';

UPDATE investors SET
  description = 'Sydney-based angel investor with Fintech, Regtech, Edtech and broader sector reach. $100k cheques. Listed Aussie Angels and Lyka among portfolio holdings.',
  basic_info = 'Damien Menzies is a Sydney-based angel investor listed in the Australian angel investor directory at $100k cheque size with thematic focus on Fintech, Regtech and Edtech (alongside other sectors).

His CSV-listed portfolio names include Aussie Angels (the Australian/NZ syndicate platform run by Cheryl Mack — see record #49 of this enrichment series) and Lyka (Sydney premium pet-food D2C brand) plus a third name truncated in the source data. The pattern of investments is consistent with a Sydney-based mid-cheque generalist angel who has participated in highly-marketed Australian fintech, consumer and platform deals.',
  why_work_with_us = 'For founders raising a $100k cheque from a Sydney-based investor with breadth across fintech, regtech, edtech and consumer-tech, Damien''s public profile suggests an opportunistic generalist who values warm intros. Best for founders early in the round build with a credible founder-investor reference connection.',
  sector_focus = ARRAY['FinTech','RegTech','EdTech','Consumer','SaaS','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 100000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/dmenzies/',
  contact_email = 'damien.menzies@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Aussie Angels','Lyka'],
  meta_title = 'Damien Menzies — Sydney FinTech/RegTech/EdTech Angel | $100k',
  meta_description = 'Sydney-based generalist angel. $100k cheques. Fintech, Regtech, Edtech focus. Portfolio incl Aussie Angels and Lyka.',
  details = jsonb_build_object(
    'investment_thesis','Generalist Sydney-based mid-cheque angel with Fintech/Regtech/Edtech bias.',
    'check_size_note','$100k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, no detailed individual investor profile or angel-track-record could be uniquely corroborated from public-source search.',
      'CSV portfolio "MA..." was truncated and could not be uniquely identified.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/dmenzies/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV portfolio truncated ("Aussie Angels, Lyka, MA..."). Two names retained verbatim. CSV email kept as listed (damien.menzies@gmail.com).'
  ),
  updated_at = now()
WHERE name = 'Damien Menzies';

UPDATE investors SET
  description = 'Sydney-based product manager at Atlassian. Co-Founder & Chief Meme Officer of Earlywork (Australian early-career operator newsletter and community). Explorer at AirTree Ventures (AirTree''s emerging-investor pipeline). Small-cheque angel ($5k–$10k). Portfolio: Gridsight, ProFlow.',
  basic_info = 'Daniel "Dan" Brockwell is a Sydney-based product manager at Atlassian and one of the more visible faces of the Australian early-career-operator scene through Earlywork — the newsletter and community he co-founded that serves as a discovery and content channel for early-career operators in startups.

He is part of the AirTree Explorer program, AirTree Ventures'' emerging-investor pipeline that empowers early-career operators to make their first angel investments alongside Australia''s largest VC. Before Atlassian he held roles at Amazon, Uber, Deloitte Digital and IBM (4+ years across product, operations, project management, sales, marketing, consulting and design). He has also written and contributed at RocketBlocks.

His angel cheques sit at $5k–$10k — small first cheques typical of operator-angels in his career stage. His CSV-listed portfolio includes **Gridsight** (Australian electricity-grid analytics) and **ProFlow** (NZ B2B SaaS for first-time managers, where Dan worked as the founder''s first-year-uni assistant).',
  why_work_with_us = 'For early-stage Australian and NZ founders looking for a small first-money cheque from a deeply-networked early-career operator-angel — Dan''s Earlywork distribution is genuinely useful for early hiring and operator-network warm intros, particularly for companies in education, sustainability/climate, and B2B SaaS.',
  sector_focus = ARRAY['Education','Sustainability','Climate','B2B SaaS','Future of Work','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 10000,
  linkedin_url = 'https://www.linkedin.com/in/danielbrockwell/',
  contact_email = 'brockwell.daniel@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Gridsight','ProFlow','Earlywork (co-founder)','AirTree Explorer'],
  meta_title = 'Daniel Brockwell — Earlywork / AirTree Explorer | Sydney Operator-Angel',
  meta_description = 'Sydney Atlassian PM. Co-founder Earlywork. AirTree Explorer. Small first cheques ($5k–$10k) in education, sustainability and B2B SaaS.',
  details = jsonb_build_object(
    'current_roles', ARRAY[
      'Product Manager, Atlassian',
      'Co-Founder & Chief Meme Officer, Earlywork',
      'Explorer, AirTree Ventures (AirTree Explorer program)',
      'Contributor, RocketBlocks'
    ],
    'prior_roles', ARRAY[
      'Amazon',
      'Uber',
      'Deloitte Digital',
      'IBM'
    ],
    'investment_thesis','Small first-money cheques to early-stage Australian and NZ founders building in education, sustainability/climate and B2B SaaS where his Earlywork distribution and operator network add value.',
    'check_size_note','$5k–$10k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/danielbrockwell',
      'humanipo','https://humanipo.app/id/daniel.brockwell',
      'rocketblocks','https://www.rocketblocks.me/contributors/daniel-brockwell.php',
      'earlywork','https://earlywork.substack.com/p/earlywork-10-no-code-no-worries'
    ),
    'corrections','CSV portfolio "Gridsight, ProFlow" verified. Co-founder role at Earlywork added to portfolio_companies as the operating company most relevant to founders considering working with him.'
  ),
  updated_at = now()
WHERE name = 'Daniel Brockwell';

UPDATE investors SET
  description = 'Sydney-based serial e-commerce entrepreneur and angel investor. Founder of brandsExclusive (Australian e-commerce). Played roles in Spreets and Styletread (received Pearcey Australia 2013 special recognition for the trio). Now Partner at Boston Consulting Group Digital Ventures. MBA from Heinrich Heine University. Ex-eBay, PwC, IBM across Europe, Asia and Australia.',
  basic_info = 'Daniel Jarosch is a Sydney-based e-commerce entrepreneur and angel investor with one of the more decorated track records in the Australian online-retail scene. He founded brandsExclusive — a leading Australian e-commerce flash-sales business — and was associated with two other notable Australian e-commerce names of the same era: Spreets (group-buying, exited via Yahoo!7 acquisition in 2011) and Styletread (online footwear retail). For these contributions he received the 2013 Pearcey Australia Special Recognition Award.

He has held leadership roles at eBay, PwC and IBM across Europe, Asia and Australia, and holds an MBA from Heinrich Heine University in Germany. He has more recently been placed by The Lancer Group as Partner at Boston Consulting Group (BCG) Digital Ventures.

His angel portfolio reflects his e-commerce and consumer-internet centre of mass: investments include Spreets, L''ArcoBaleno (curated artisan furniture marketplace) and Soma Water (D2C water-filter brand). The CSV cheque band is $50k–$100k, suggesting structured upper-mid angel participation rather than tiny first cheques.',
  why_work_with_us = 'For consumer-internet, e-commerce, marketplace and D2C brand founders, Daniel offers operator credibility from one of Australia''s most-cited e-commerce eras (brandsExclusive/Spreets/Styletread) plus institutional pathway via BCG Digital Ventures.',
  sector_focus = ARRAY['E-commerce','D2C','Consumer','Marketplace','Internet'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 50000,
  check_size_max = 100000,
  linkedin_url = 'https://au.linkedin.com/in/danieljarosch',
  contact_email = 'danieljarosch@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['brandsExclusive (founder)','Spreets','Styletread','L''ArcoBaleno','Soma Water','BCG Digital Ventures (Partner)'],
  meta_title = 'Daniel Jarosch — brandsExclusive founder | Sydney E-commerce Angel',
  meta_description = 'Sydney e-commerce founder. Founder brandsExclusive; involved in Spreets and Styletread. Pearcey 2013 award. Partner BCG Digital Ventures. $50k–$100k.',
  details = jsonb_build_object(
    'founder_of', ARRAY['brandsExclusive (Australian e-commerce flash sales)'],
    'recognition', ARRAY['Pearcey Australia Special Recognition Award (2013) — for contribution to brandsExclusive, Spreets and Styletread'],
    'current_roles', ARRAY[
      'Partner, BCG Digital Ventures (placed by The Lancer Group)'
    ],
    'prior_roles', ARRAY[
      'eBay (Europe/Asia/Australia)',
      'PwC',
      'IBM'
    ],
    'education', ARRAY['MBA, Heinrich Heine University (Düsseldorf, Germany)'],
    'angel_portfolio_categories', ARRAY['Information Services (B2C)','Internet Retail','Household Appliances'],
    'investment_thesis','E-commerce, D2C, marketplace and consumer-internet founders where his operator track record (brandsExclusive era) plus BCG DV institutional pathway add to the cheque.',
    'check_size_note','$50k–$100k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/danieljarosch',
      'pitchbook','https://pitchbook.com/profiles/investor/149664-70',
      'lancer_bcg_placement','https://huntscanlon.com/lancer-group-places-daniel-jarosch-partner-boston-consulting-group-digital-ventures/',
      'lancer_bcg_placement_2','https://thelancergroup.com/the-lancer-group-places-daniel-jarosch-as-partner-of-boston-consulting-group-digital-ventures/',
      'signal_nfx','https://signal.nfx.com/investors/daniel-jarosch',
      'pollenizer_spreets','http://www.pollenizer.com/2010/06/26/big-day-for-spreets/',
      'slideshare','https://www.slideshare.net/danieljarosch',
      'bloomberg','https://www.bloomberg.com/profile/person/19764640'
    ),
    'corrections','CSV portfolio truncated ("brandsExclusive, Spreets,..."). Expanded with verified investment names (L''ArcoBaleno, Soma Water) and operating affiliations (BCG Digital Ventures). Sector_focus from "Amazing Entrepreneurs" replaced with thematic e-commerce/consumer-internet categories that match his actual track record.'
  ),
  updated_at = now()
WHERE name = 'Daniel Jarosch';

UPDATE investors SET
  description = 'Brisbane-based Bitcoin-only angel investor. Mandate explicitly limited to bitcoin-native businesses (no broader fiat-startup investing). Portfolio includes Strike (lightning-network payments), Umbrel (sovereign personal-server software) and Unchained (bitcoin-native financial services). $10k cheques.',
  basic_info = 'Daniel Murray is a Brisbane-based angel investor with an unusually concentrated thesis: bitcoin-only. His mandate explicitly excludes broader fiat-startup investing in favour of investments in bitcoin-native infrastructure, applications and financial-services businesses.

His CSV-listed portfolio includes three of the most-cited bitcoin-native names in venture:
- **Strike** — lightning-network payments, mobile-first bitcoin/USD app.
- **Umbrel** — sovereign personal-server software for self-hosting bitcoin nodes and other applications.
- **Unchained Capital** — Texas-headquartered bitcoin-native financial services (collaborative custody, lending).

His CSV cheque band is $10k — small individual cheques typical for sovereign-bitcoin-aligned angel investors who aim for portfolio breadth across the bitcoin stack rather than concentrated bets.',
  why_work_with_us = 'For founders building bitcoin-native infrastructure, lightning-network applications, self-custody tooling, mining or bitcoin-native financial services, Daniel offers a small early cheque plus alignment with the very specific value system that bitcoin-only investors look for. Not appropriate for non-bitcoin crypto, web3 broadly or generic fintech.',
  sector_focus = ARRAY['Bitcoin','Lightning Network','Self-Custody','Bitcoin Mining','Bitcoin Financial Services'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 10000,
  check_size_max = 10000,
  linkedin_url = 'https://www.linkedin.com/in/danieldavidmurray/',
  contact_email = 'danieldavidmurray@gmail.com',
  location = 'Brisbane, QLD',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Strike','Umbrel','Unchained Capital'],
  meta_title = 'Daniel Murray — Bitcoin-only Angel | Brisbane',
  meta_description = 'Brisbane Bitcoin-only angel investor. $10k cheques into bitcoin-native infrastructure: Strike, Umbrel, Unchained.',
  details = jsonb_build_object(
    'thesis','Bitcoin-only — explicitly limited to bitcoin-native businesses',
    'thesis_excludes', ARRAY['Non-bitcoin crypto / web3','General fintech','Generic startup categories'],
    'csv_portfolio', ARRAY['Strike','Umbrel','Unchained Capital'],
    'investment_thesis','Small individual cheques across bitcoin-native infrastructure (lightning, self-custody, financial services) for portfolio breadth.',
    'check_size_note','$10k',
    'unverified', ARRAY[
      'Common name; the specific Brisbane-based bitcoin-only individual could not be uniquely matched from public-source search to a Crunchbase/PitchBook investor profile.',
      'Portfolio companies (Strike/Umbrel/Unchained) are well-documented bitcoin-native businesses; his cap-table participation is taken from CSV listing.'
    ],
    'sources', jsonb_build_object(
      'linkedin_csv','https://www.linkedin.com/in/danieldavidmurray/',
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia',
      'unchained_company_profile','https://angelspartners.com/firm/UnchainedCapitalInc'
    ),
    'corrections','CSV portfolio truncated ("Strike, Umbrel, Unchaine..."). Resolved "Unchaine..." to Unchained Capital (the bitcoin-native financial-services firm most commonly referenced as "Unchained" in bitcoin angel circles).'
  ),
  updated_at = now()
WHERE name = 'Daniel Murray';

COMMIT;
