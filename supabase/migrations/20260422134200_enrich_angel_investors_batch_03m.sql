-- Enrich angel investors — batch 03m (records 214-218: Sam Savis → Sebastien Eckersley-Maslin)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based KPMG executive and angel investor. Climate Tech, AI, FinTech focus. Portfolio includes ZeroCO. Small cheques (≤$10K) — early-career angel building track record alongside KPMG operating role.',
  basic_info = 'Sam Savis is a Melbourne-based **KPMG Australia** executive and angel investor. CSV email "ssavis@kpmg.com.au" reflects KPMG affiliation.

His CSV-listed portfolio includes:
- **ZeroCO** (Australian climate-tech / carbon)
- Plus additional truncated names

Stated thesis: **Climate Tech, AI, FinTech**. CSV cheque size **≤$10K** — characteristic of an early-career angel making small entry cheques alongside operator-firm career.

Beyond CSV, individual investor portfolio details could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian climate-tech, AI and FinTech founders looking for a small-cheque early-career angel with KPMG-network operating context. Especially relevant for founders pursuing future enterprise/large-corporate sales motions where KPMG advisory exposure may be useful.',
  sector_focus = ARRAY['Climate Tech','AI','FinTech','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 10000,
  contact_email = 'ssavis@kpmg.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['ZeroCO','KPMG Australia (current)'],
  meta_title = 'Sam Savis — KPMG Melbourne | Climate/AI/FinTech Angel | ≤$10K',
  meta_description = 'Melbourne KPMG climate-tech, AI, FinTech angel. ZeroCO in portfolio. ≤$10K small cheques.',
  details = jsonb_build_object(
    'day_role','KPMG Australia (current)',
    'investment_thesis','Climate Tech, AI, FinTech — small early-career angel cheques.',
    'check_size_note','≤$10K',
    'unverified', ARRAY[
      'Beyond CSV directory listing and ZeroCO, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'crunchbase','https://www.crunchbase.com/person/sam-savis'
    ),
    'corrections','CSV LinkedIn empty. CSV thesis truncated ("Climate Tech, AI, FinTech,...").'
  ),
  updated_at = now()
WHERE name = 'Sam Savis';

UPDATE investors SET
  description = 'Melbourne-based angel investor and Headstart Capital affiliate. Tech, hospitality, e-commerce focus. Portfolio includes Hospitality and Healthcare investments. $50,000 cheques.',
  basic_info = 'Sandeep Hettiarachchi is a Melbourne-based angel investor with active involvement in **Headstart Capital** — an Australian hospitality-investment structuring firm. His CSV-listed thesis spans **Tech, Hospitality and E-commerce** sectors.

CSV-listed portfolio descriptors include:
- **Hospitality**
- **Healthcare**
- **T...** (truncated)
- Plus additional names

CSV cheque size $50,000. Beyond Headstart Capital affiliation and the CSV directory listing, individual investor portfolio company-level details could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian hospitality-tech, e-commerce, healthcare and SaaS founders — Sandeep brings hospitality-investment-structuring depth (Headstart Capital) alongside a $50k personal cheque size. Especially relevant for hospitality/dining/F&B founders given his Headstart background.',
  sector_focus = ARRAY['Tech','Hospitality','Hospitality Tech','E-commerce','Healthcare','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 50000,
  linkedin_url = 'https://au.linkedin.com/in/sandeep-hettiarachchi',
  contact_email = 'sandeep98desh@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Headstart Capital (affiliated; hospitality investments)','Hospitality investments','Healthcare investments'],
  meta_title = 'Sandeep Hettiarachchi — Headstart Capital | Melbourne Hospitality/Tech Angel',
  meta_description = 'Melbourne hospitality, tech, ecommerce angel. Headstart Capital affiliate. $50k cheques.',
  details = jsonb_build_object(
    'firms', ARRAY['Headstart Capital (affiliated; hospitality investments)'],
    'investment_thesis','Tech, Hospitality, E-commerce — Headstart-Capital-aligned angel.',
    'check_size_note','$50,000',
    'unverified', ARRAY[
      'Specific portfolio companies could not be uniquely corroborated from public-source search.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/sandeep-hettiarachchi'
    ),
    'corrections','CSV portfolio descriptors generic ("Hospitality, Health care, T..."). CSV email truncated ("sandeep98desh@gmail.c...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Sandeep Hettiarachchi';

UPDATE investors SET
  description = 'Melbourne-based serial founder, startup mentor and angel investor. Founder & CEO of Hyper (global startup studio / incubator). Has helped 350+ founders launch ventures. Notable portfolio includes Splend, Shebah, RIDE, Socialbase, Kubo, Magic Mountain. $50k–$100k cheques.',
  basic_info = 'Sasha Reid is one of Australia''s most prominent startup-studio operators and an active angel investor. He is the **Founder & CEO of Hyper** — a global incubator working to fund and launch tech startups (Sydney/Melbourne dual-base; Sam Cust is Director per separate listing).

He has helped **350+ founders launch ventures** with a track record that includes some of Australia''s biggest startup-studio success stories:
- **Splend** (Australian rideshare-driver vehicle financing — major scale-up)
- **Shebah** (women-only rideshare)
- **RIDE** (Australian transport/mobility)
- **Socialbase** (consumer/social)
- **Kubo** (consumer)
- **Magic Mountain** (consumer)
- Plus additional names

CSV cheque size $50,000–$100,000. Has a decade+ in digital and 5+ years specifically launching tech startups via Hyper.',
  why_work_with_us = 'For Australian consumer, marketplace, mobility, hospitality and SaaS founders — Sasha is one of the most credentialed startup-studio operators in the country. His Hyper platform has launched 350+ ventures and includes genuine Australian scale-up references (Splend, Shebah, RIDE). Especially valuable for non-technical founders who need studio-style operator support alongside the cheque.',
  sector_focus = ARRAY['Consumer','SaaS','Marketplace','Mobility','Transport','Hospitality','Studio','Tech-Enabled Services'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 50000,
  check_size_max = 100000,
  linkedin_url = 'https://www.linkedin.com/in/sashareid/',
  contact_email = 'sasha.reid@gmail.com',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Hyper (Founder & CEO; global startup studio)','Splend','Shebah','RIDE','Socialbase','Kubo','Magic Mountain','350+ founders launched via Hyper'],
  meta_title = 'Sasha Reid — Hyper Founder & CEO | Melbourne Studio-Operator Angel',
  meta_description = 'Melbourne Hyper founder/CEO. 350+ founders launched. Splend, Shebah, RIDE, Socialbase, Magic Mountain. $50k–$100k.',
  details = jsonb_build_object(
    'firms', ARRAY['Hyper (Founder & CEO; global startup studio)'],
    'prior_career','Decade+ digital experience; 5+ years launching tech startups via Hyper',
    'investment_thesis','Sector-agnostic — Hyper studio-network deal flow.',
    'check_size_note','$50k–$100k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Splend','context','Australian rideshare-driver vehicle financing scale-up'),
      jsonb_build_object('company','Shebah','context','Women-only rideshare platform'),
      jsonb_build_object('company','RIDE','context','Australian transport/mobility'),
      jsonb_build_object('company','350+ founders','context','Hyper studio platform graduates')
    ),
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/sashareid',
      'humanipo','https://humanipo.app/id/sasha.reid'
    ),
    'corrections','CSV portfolio truncated ("Socialbase, Ride, Magic..."). Six retained verbatim plus founder-of context.'
  ),
  updated_at = now()
WHERE name = 'Sasha Reid';

UPDATE investors SET
  description = 'Sydney-based angel investor group dedicated exclusively to Media, Film and Television sector investments. $2,500–$10,000 cheques. Niche sector-focused angel network.',
  basic_info = 'Screen Angels is a Sydney-based angel investor group with a stated **exclusive focus on Media, Film and Television** sector investments. The group operates as a niche sector-focused angel network supporting Australian content, film and TV production businesses.

CSV cheque size: **$2,500 – $10,000** — small-cheque entry positions, typical of pooled-member angel networks supporting creative-sector ventures with limited individual cheque depth.

Beyond the CSV directory entry, Screen Angels'' formal organisational details, member list and individual portfolio companies could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Australian film, television, streaming, content and creative-tech founders — Screen Angels offers a sector-pure angel-network entry-point with small ($2.5k–$10k) cheques. Especially useful for content/production businesses seeking creative-sector-aligned capital.',
  sector_focus = ARRAY['Media','Film','Television','Content','Streaming','Creative Tech','Entertainment'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 2500,
  check_size_max = 10000,
  contact_email = 'Contact@screenangels.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Screen Angels — Sydney Media/Film/TV Angel Group | $2.5k–$10k',
  meta_description = 'Sydney sector-pure media, film, television angel investor group. $2,500–$10,000 cheques.',
  details = jsonb_build_object(
    'organisation_type','Sector-pure angel investor group / network',
    'investment_thesis','Media, Film and Television exclusively.',
    'check_size_note','$2,500 – $10,000',
    'unverified', ARRAY[
      'Beyond CSV directory listing, formal organisational details and individual portfolio companies could not be uniquely corroborated.'
    ],
    'corrections','CSV LinkedIn empty. CSV email truncated ("Contact@screenangels.c...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Screen Angels';

UPDATE investors SET
  description = 'Sydney-based founder, angel investor and innovation leader. Founder & former CEO of BlueChilli (helped launch 150+ ventures globally). Currently Founder & CEO of Phyllome. Former Royal Australian Navy weapons engineer (deployed to Iraq). EY Entrepreneur of the Year. 3x "30-under-30". Awesome Foundation Sydney board.',
  basic_info = 'Sebastien Eckersley-Maslin is one of Australia''s most prominent founders and innovation leaders. He is the **Founder and former CEO of BlueChilli** — the venture-tech firm that **helped launch 150+ new ventures globally** and was involved in 140+ startups during his tenure. BlueChilli operated offices in Sydney, Melbourne and Brisbane and worked with non-technical entrepreneurs, investors and corporate customers to build, grow and invest in venture-tech startups.

He launched BlueChilli in **2012**. Today he is **Founder & CEO of Phyllome** — his current operating venture.

His distinguished prior career includes:
- **Royal Australian Navy weapons engineer** — deployed to Iraq
- **Ernst and Young Entrepreneur of the Year** recipient
- **3x "30-under-30" winner**
- **Sydney chapter board member of Awesome Foundation**

He represents the Australian tech-startup industry at State and Federal government levels.

CSV cheque size and sector focus not specified beyond "Most" (broad generalist). As an angel he invests personal money into promising companies in exchange for equity.',
  why_work_with_us = 'For Australian founders — particularly non-technical founders or those building structured venture-studio-style products — Seb is among the most experienced startup-builders in the country. His BlueChilli legacy means a deep network across 140+ ventures plus government / regulatory access through his industry-representation roles.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Tech','Marketplace','Government Tech','Studio'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/sebeckmas/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Phyllome (Founder & CEO; current)','BlueChilli (Founder & former CEO; 150+ ventures launched)','Awesome Foundation Sydney (Board)','140+ BlueChilli ventures'],
  meta_title = 'Sebastien Eckersley-Maslin — BlueChilli Founder | Sydney Innovation Angel',
  meta_description = 'BlueChilli founder/former CEO (150+ ventures). Phyllome founder. EY Entrepreneur of the Year. 3x 30-under-30.',
  details = jsonb_build_object(
    'firms', ARRAY['Phyllome (Founder & CEO; current)','BlueChilli (Founder & former CEO; launched 2012)'],
    'prior_career','Royal Australian Navy weapons engineer — deployed to Iraq',
    'investment_thesis','Most sectors — generalist startup-studio-network angel.',
    'awards', ARRAY['EY Entrepreneur of the Year','3x "30-under-30" winner'],
    'community_roles', ARRAY['Awesome Foundation Sydney (Board Member)','State/Federal Government Australian tech-startup industry representative'],
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/sebeckmas',
      'pitchbook','https://pitchbook.com/profiles/investor/108180-19',
      'bloomberg','https://www.bloomberg.com/profile/person/19276460'
    ),
    'corrections','CSV email empty. CSV thesis "Most" expanded with public-source context.'
  ),
  updated_at = now()
WHERE name = 'Sebastien Eckersley-Maslin';

COMMIT;
