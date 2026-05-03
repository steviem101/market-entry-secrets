-- Enrich angel investors — batch 03w (records 264-267: Web3 VC Coinvestment Syndicate → Zoe Keck)

BEGIN;

UPDATE investors SET
  description = 'Web3-focused angel coinvestment syndicate operated via Trivian Capital. Digital Assets, Web3, Artificial Intelligence focus. Portfolio includes Swell Network Guardian Layer. $50,000–$100,000 cheques.',
  basic_info = 'Web3 VC Coinvestment Syndicate is a Web3-focused angel coinvestment syndicate operated via **Trivian Capital** (CSV email "kevin@triviancapital.com" reflects Trivian Capital affiliation; CSV LinkedIn handle is Kevin O''Connor based). The CSV LinkedIn URL points to Kevin O''Connor''s profile (linkedin.com/in/kevino23/) — likely the syndicate''s lead.

Stated thesis: **Digital Assets, Web3, Artificial Intelligence** (truncated).

CSV-listed portfolio includes:
- **Swell Network Guardian L...** (truncated — Swell Network Guardian Layer; Web3 / Ethereum-related)
- Plus additional truncated names

CSV cheque size **$50,000 – $100,000**. CSV location not specified.',
  why_work_with_us = 'For Web3, blockchain, digital-asset, DeFi and AI founders — this syndicate offers a focused $50k–$100k coinvestment vehicle into Web3 deals via the Trivian Capital network. Best leveraged for sector-aligned Web3 founders pursuing structured digital-asset capital.',
  sector_focus = ARRAY['Web3','Digital Assets','Blockchain','AI','DeFi','Crypto','Ethereum','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/kevino23/',
  contact_email = 'kevin@triviancapital.com',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Trivian Capital (operating vehicle)','Swell Network Guardian Layer'],
  meta_title = 'Web3 VC Coinvestment Syndicate — Trivian Capital | Digital Assets / Web3 Angel',
  meta_description = 'Web3 angel coinvestment syndicate via Trivian Capital. Digital Assets, Web3, AI. Swell Network. $50k–$100k.',
  details = jsonb_build_object(
    'organisation_type','Angel coinvestment syndicate (Web3-focused)',
    'operating_vehicle','Trivian Capital',
    'lead','Kevin O''Connor (CSV LinkedIn)',
    'investment_thesis','Digital Assets, Web3, Artificial Intelligence.',
    'check_size_note','$50,000 – $100,000',
    'unverified', ARRAY[
      'Beyond Trivian Capital naming and Swell Network entry, formal organisational details not uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/kevino23/'
    ),
    'corrections','CSV name was truncated ("Web3 VC Coinvestment S..."). CSV portfolio truncated ("Swell Network Guardian L..."). CSV location empty. CSV thesis truncated ("Digital Assets, Web3, Arti...").'
  ),
  updated_at = now()
WHERE name = 'Web3 VC Coinvestment Syndicate';

UPDATE investors SET
  description = 'Perth-based angel investor network. Sector-agnostic. Portfolio includes Grow Impact and Procuracon. $5k cheques (small-coordinated rounds). Limited public organisational detail beyond directory listing.',
  basic_info = 'West Tech Investor Network is a Perth-based **angel investor network**. Stated thesis: **Agnostic** (sector-agnostic).

CSV-listed portfolio includes:
- **Grow Impact** (Australian impact-aligned tech)
- **Procuracon** (Australian B2B procurement / construction-tech SaaS)
- Plus additional truncated names

CSV cheque size **$5k** — small-coordinated rounds typical of pooled-member angel networks. Beyond the CSV directory entry, formal organisational details, member structure and broader portfolio could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Western Australian and Perth-based founders — and especially impact-aligned, B2B and construction-tech founders — West Tech Investor Network offers a low-ceremony small-cheque entry-point into the Perth angel community. Best treated as a Perth-tech-network warm-intro path.',
  sector_focus = ARRAY['Generalist','Impact','B2B','SaaS','Procurement','Construction Tech','Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 5000,
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Grow Impact','Procuracon'],
  meta_title = 'West Tech Investor Network — Perth Sector-Agnostic Angel | $5k',
  meta_description = 'Perth angel investor network. Sector-agnostic. Grow Impact, Procuracon. $5k cheques.',
  details = jsonb_build_object(
    'organisation_type','Angel investor network',
    'investment_thesis','Sector-agnostic — Perth-tech-network angel.',
    'check_size_note','$5k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, formal organisational details and member structure could not be uniquely corroborated.'
    ],
    'corrections','CSV LinkedIn empty. CSV email empty. CSV portfolio "Grow Impact, Procuracon" retained.'
  ),
  updated_at = now()
WHERE name = 'West Tech Investor Network';

UPDATE investors SET
  description = 'Melbourne-based all-women-run angel network founded 2020. Founder Rachael Neumann (also Flying Fox Ventures Founding Partner; ex-Eventbrite Australia MD; ex-AWS ANZ Head of Startups). Now operating as Flying Fox Ventures. Sector-agnostic. Portfolio includes Chatterize, Catalyst, Muso. $200k–$250k cheques.',
  basic_info = 'Working Theory Angels is a **Melbourne-based all-women-run angel network founded in 2020** by **Rachael Neumann** (covered separately in this directory; Founder of Working Theory Angels; Founding Partner of Flying Fox Ventures; ex-Managing Director of Eventbrite Australia; ex-Head of Startups ANZ at AWS).

The mission was to **attract new investors to venture capital** and address a weakness in current angel networks that leave investors exposed to the risk inherent in small portfolios.

The network has now **transitioned into Flying Fox Ventures** — Rachael''s early-stage ANZ venture-capital firm. Working Theory Angels effectively now operates as / under the Flying Fox brand.

CSV-listed portfolio includes:
- **Chatterize** (Australian SaaS)
- **Catalyst** (Australian SaaS)
- **Muso** (consumer-tech — also seen in other angel portfolios in this series)
- Plus additional truncated names

CSV cheque size **$200k–$250k**. Stated thesis: **All sectors**.',
  why_work_with_us = 'For Australian — and especially women-led or diverse-team — early-stage founders across all sectors — Working Theory Angels (now operating under Flying Fox Ventures) is one of the most progressive and inclusive angel networks in the country. The Rachael Neumann founder-leadership combined with all-women-run structure offers genuinely differentiated capital signalling.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','Women-Led','Diversity','EventTech','HRTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  check_size_min = 200000,
  check_size_max = 250000,
  linkedin_url = 'https://www.linkedin.com/in/rachaelneumann',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Working Theory Angels (now operating under Flying Fox Ventures)','Flying Fox Ventures (successor)','Chatterize','Catalyst','Muso'],
  meta_title = 'Working Theory Angels — Melbourne All-Women Angel Network | Now Flying Fox Ventures',
  meta_description = 'Melbourne all-women angel network founded 2020 by Rachael Neumann. Now Flying Fox Ventures. $200k–$250k.',
  details = jsonb_build_object(
    'organisation_type','Angel network — all-women-run; founded 2020; transitioned to Flying Fox Ventures',
    'founded',2020,
    'founder','Rachael Neumann (ex-Eventbrite Australia MD; ex-AWS ANZ Head of Startups; Flying Fox Ventures Founding Partner)',
    'investment_thesis','Sector-agnostic — Australian early-stage; addresses small-portfolio risk via syndicated approach.',
    'check_size_note','$200k–$250k',
    'transition','Now operating as Flying Fox Ventures',
    'sources', jsonb_build_object(
      'website','https://www.workingtheoryangels.com/team',
      'crunchbase','https://www.crunchbase.com/organization/working-theory-angels',
      'linkedin_neumann','https://www.linkedin.com/in/rachaelneumann/'
    ),
    'corrections','CSV portfolio truncated ("Chatterize, Catalyst, Mus..."). Three retained verbatim plus Flying Fox Ventures successor-context.'
  ),
  updated_at = now()
WHERE name = 'Working Theory Angels';

UPDATE investors SET
  description = 'Sydney-based angel investor with stated focus on SaaS, Tech, Health/Wellness and FemTech. Limited public investor profile beyond Australian angel directory listing.',
  basic_info = 'Zoe Keck is a Sydney-based angel investor with stated thesis covering **SaaS, Tech, Health/Wellness and FemTech** — a sector mix oriented toward consumer-facing health/wellness and women''s health technology categories.

CSV cheque size and CSV portfolio: not specified. Beyond the CSV directory listing, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian SaaS, tech, health/wellness, FemTech and women''s-health-tech founders — Zoe''s sector mix is well-aligned with Australian consumer-health and women''s-health categories. Best treated as a referral- or warm-intro-led conversation given limited public investment history.',
  sector_focus = ARRAY['SaaS','Tech','Health','Wellness','FemTech','Women''s Health','HealthTech','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://linkedin.com/in/zoekeck',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Zoe Keck — Sydney SaaS / Tech / Health / FemTech Angel',
  meta_description = 'Sydney-based angel. SaaS, Tech, Health/Wellness, FemTech focus.',
  details = jsonb_build_object(
    'investment_thesis','SaaS, Tech, Health/Wellness, FemTech — consumer-and-women-health bias.',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://linkedin.com/in/zoekeck'
    ),
    'corrections','CSV LinkedIn URL had no protocol prefix. CSV portfolio empty. CSV cheque size empty. CSV email empty.'
  ),
  updated_at = now()
WHERE name = 'Zoe Keck';

COMMIT;
