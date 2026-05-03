-- Enrich angel investors — batch 03h (records 189-193: Pete Cameron → Playbook Ventures)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based serial entrepreneur and angel investor with 30+ year career in Australian/NZ tech. Chair of Avalanche Foundation (impact-focused angel fund). CEO of Avalanche Technology Group. Former Yellowfin International. Impact business focus.',
  basic_info = 'Peter (Pete) Cameron is a Melbourne-based serial entrepreneur and angel investor with **30+ years of experience** introducing new technology products and services to the Australian and New Zealand markets.

He is **Chair of the Avalanche Foundation** — an angel investment fund designed to help take the best Australian and New Zealand startups to global markets — and is currently **CEO of the Avalanche Technology Group of companies**. He has also served as a **Board Advisor for Merkle Tree Capital** and as a **Venture Partner for Giant Leap** — Australia''s first venture capital fund dedicated to impact businesses.

His investment work emphasises embedding **social and environmental impact** into business models. CSV-listed portfolio includes:
- **Yellowfin** (Australian BI/analytics — formerly worked here)
- **Speediancer**
- **S...** (truncated)
- Plus additional names

CSV cheque size: "Varies for small to l..." (truncated). Stated thesis: **Agnostic - Impact business**. CSV email: invest@avalanche.com.au.',
  why_work_with_us = 'For Australian and New Zealand impact-aligned founders — across climate, social, education and inclusion-tech — Pete combines 30+ years of operator experience, two impact-focused investment vehicles (Avalanche Foundation, Giant Leap Venture Partner) and access to the Australian impact-investing community. Especially relevant for cross-border ANZ founders pursuing global impact markets.',
  sector_focus = ARRAY['Impact','ClimateTech','Social Impact','SaaS','Tech','Generalist','EdTech'],
  stage_focus = ARRAY['Pre-seed','Seed','Series A'],
  linkedin_url = 'https://www.linkedin.com/in/petecameron/',
  contact_email = 'invest@avalanche.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Avalanche Foundation (Chair)','Avalanche Technology Group (CEO)','Giant Leap Fund I (Venture Partner)','Merkle Tree Capital (Board Advisor)','Yellowfin (former)'],
  meta_title = 'Pete Cameron — Avalanche Foundation Chair | Melbourne Impact Angel',
  meta_description = 'Melbourne 30+yr operator and impact angel. Avalanche Foundation Chair, Giant Leap Venture Partner.',
  details = jsonb_build_object(
    'firms', ARRAY['Avalanche Foundation (Chair)','Avalanche Technology Group (CEO)','Giant Leap Fund I (Venture Partner)','Merkle Tree Capital (Board Advisor)'],
    'prior_career','30+ years introducing tech products and services to Australian/NZ markets; former roles at Yellowfin International',
    'investment_thesis','Sector-agnostic impact-aligned — social and environmental impact embedded in business models.',
    'check_size_note','Varies (CSV truncated)',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/petecameron',
      'impact_group','https://www.impact-group.com.au/people/peter-cameron/',
      'pitchbook','https://pitchbook.com/profiles/investor/174766-69'
    ),
    'corrections','CSV portfolio truncated ("Yellowfin, Speediancer, S..."). CSV cheque size truncated.'
  ),
  updated_at = now()
WHERE name = 'Pete Cameron';

UPDATE investors SET
  description = 'Sydney-based veteran angel investor with deep Australian-tech operator background. Cenqua co-founder (acquired by Atlassian). Ninja Blocks alumnus. Active syndicate participant for premium dealflow. $25k–$50k cheques.',
  basic_info = 'Pete Moore is a Sydney-based veteran angel investor with deep Australian-tech operator background. He was previously involved with **Ninja Blocks** (Australian IoT hardware/software pioneer) and **Cenqua** (acquired by **Atlassian** — formative for Atlassian''s Jira ecosystem).

His investment thesis is to **invest in companies he understands, when he believes in the people, and when the payday is worth the risk**. He accesses **premium dealflow** through syndicates, making small bets via syndicates and slightly larger ones direct.

His CSV-listed 2021 portfolio includes:
- **Karta**
- **mtime**
- **Story...** (truncated)
- Plus additional truncated names

CSV cheque size $25k–$50k. Sector mandate: not specified — generalist, people-driven.',
  why_work_with_us = 'For Australian SaaS, IoT, dev-tools and B2B founders — Pete brings deep Atlassian-ecosystem and Sydney-tech operator credentials, combined with a syndicate-savvy deal-access pattern and $25k–$50k personal cheques. Especially valuable for founders seeking introductions into the established Sydney/Atlassian-network angel community.',
  sector_focus = ARRAY['SaaS','IoT','DevTools','B2B','Generalist'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 25000,
  check_size_max = 50000,
  linkedin_url = 'https://www.linkedin.com/in/askpete/',
  contact_email = 'askpete+deck@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Karta','mtime','Cenqua (acquired by Atlassian)','Ninja Blocks (alumnus)'],
  meta_title = 'Pete Moore — Sydney Veteran Angel | Atlassian/Cenqua, Ninja Blocks',
  meta_description = 'Sydney veteran tech angel. Cenqua (Atlassian acquired), Ninja Blocks. Syndicate-savvy. $25k–$50k.',
  details = jsonb_build_object(
    'prior_career','Cenqua (acquired by Atlassian); Ninja Blocks',
    'investment_thesis','People-led and risk/reward-balanced — invests in known categories with clear payday potential.',
    'check_size_note','$25k–$50k (small via syndicates, larger direct)',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/askpete',
      'angellist','https://angel.co/p/askpete'
    ),
    'corrections','CSV portfolio truncated ("2021 - Karta, mtime, Story..."). Two retained verbatim plus exit context added.'
  ),
  updated_at = now()
WHERE name = 'Pete Moore';

UPDATE investors SET
  description = 'Sydney-based finance manager and angel investor. Operates personal angel investments via Davis Enterprises Holdings. Sector-agnostic focus. CSV portfolio includes Puralink (autonomous robot pipe-leak detection), Aquila and Fluency. $20k–$40k cheques.',
  basic_info = 'Peter Davis is a Sydney-based **angel investor and finance manager**. He operates angel investing through **Davis Enterprises Holdings** (his personal investment company name and source of CSV listing).

His CSV-listed portfolio includes:
- **Puralink** (autonomous robot "ferrets" for finding leaky pipes — pre-seed funded by Peak XV, Side Stage Ventures, Startmate, NZVC)
- **Aquila**
- **Fluency**
- Plus additional truncated names

CSV cheque size $20–$40K. Stated thesis: **Sector agnostic — current...** (truncated). Sydney-based.',
  why_work_with_us = 'For Australian deep-tech, SaaS and B2B founders looking for a small Sydney-based generalist cheque from a finance-manager angel with a deep-tech bias (Puralink robotics, Aquila, Fluency). Especially relevant for founders pursuing technical product development and capital-efficient growth.',
  sector_focus = ARRAY['Generalist','Deep Tech','SaaS','Robotics','Industrial Tech','B2B'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 20000,
  check_size_max = 40000,
  linkedin_url = 'https://www.linkedin.com/in/peterdavisau/',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Puralink','Aquila','Fluency','Davis Enterprises Holdings (personal vehicle)'],
  meta_title = 'Peter Davis — Davis Enterprises | Sydney Sector-Agnostic Angel',
  meta_description = 'Sydney finance-manager and angel. Puralink, Aquila, Fluency. $20k–$40k via Davis Enterprises Holdings.',
  details = jsonb_build_object(
    'firms', ARRAY['Davis Enterprises Holdings (personal investment vehicle)'],
    'investment_thesis','Sector agnostic with deep-tech / industrial-tech bias.',
    'check_size_note','$20k–$40k',
    'sources', jsonb_build_object(
      'linkedin','https://au.linkedin.com/in/peterdavisau',
      'davis_enterprises','https://au.linkedin.com/company/davisenterprisesholdings'
    ),
    'corrections','CSV name was truncated ("Peter Davis Davis Enterp..."). CSV portfolio truncated ("Puralink, Aquila, Fluency, ..."). Three retained verbatim. CSV email field had LinkedIn URL.'
  ),
  updated_at = now()
WHERE name = 'Peter Davis Davis Enterp...';

UPDATE investors SET
  description = 'Sydney-based Managing Director at Grant Samuel (top-tier Australian corporate-advisory firm) and active angel investor. Consumer-products focus. Portfolio includes Heaps Normal (non-alcoholic beer) and PMNP. $10k–$50k cheques.',
  basic_info = 'Peter King is a Sydney-based **Managing Director at Grant Samuel** — one of Australia''s top-tier independent corporate-advisory firms — and an active personal angel investor. He joined Grant Samuel in **2017** and has extensive leadership experience in finance and corporate-advisory.

His angel-investing thesis is **all sectors but with strong consumer-products focus**. CSV-listed portfolio includes some standout Australian consumer brands:
- **Heaps Normal** (Australian non-alcoholic beer brand — major DTC and grocery distribution)
- **PMNP** (consumer brand)
- **Re...** (truncated)
- Plus additional truncated names

CSV cheque size $10–$50k. CSV email: pking@grantsamuel.com (Grant Samuel work email).',
  why_work_with_us = 'For Australian consumer-brand, DTC, beverage, food and lifestyle founders — Peter brings the rare combination of Grant Samuel-level corporate-finance/M&A network access (relevant for future strategic exits) plus a portfolio that signals genuine consumer-brand pattern recognition (Heaps Normal scale-up, PMNP).',
  sector_focus = ARRAY['Consumer','DTC','Beverage','Food','Lifestyle','Generalist','Retail'],
  stage_focus = ARRAY['Seed','Series A'],
  check_size_min = 10000,
  check_size_max = 50000,
  linkedin_url = 'https://au.linkedin.com/in/peter-king-a87b1716',
  contact_email = 'pking@grantsamuel.com.au',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Heaps Normal','PMNP','Grant Samuel (Managing Director)'],
  meta_title = 'Peter King — Grant Samuel MD | Sydney Consumer Angel | Heaps Normal',
  meta_description = 'Sydney Grant Samuel MD and consumer-brand angel. Heaps Normal, PMNP in portfolio. $10k–$50k.',
  details = jsonb_build_object(
    'day_role','Managing Director, Grant Samuel (since 2017)',
    'investment_thesis','All sectors but focused on Consumer products and brands.',
    'check_size_note','$10k–$50k',
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/peter-king-a87b1716/',
      'grant_samuel','https://www.grantsamuel.com.au/team/peter-king/'
    ),
    'corrections','CSV portfolio truncated ("Heaps Normal, PMNP, Re..."). Two retained verbatim. CSV email truncated ("pking@grantsamuel.com....") resolved.'
  ),
  updated_at = now()
WHERE name = 'Peter King';

UPDATE investors SET
  description = 'Melbourne-based community-powered angel syndicate founded 2022. Investment platform leveraging The Startup Playbook Podcast. Sector-agnostic pre-seed/seed focus across Australia. Backed by Niki Scevak / Blackbird and high-profile athletes (Naomi Osaka, Nick Kyrgios, Steve Smith). $2.8M LaunchVic-backed deployment.',
  basic_info = 'Playbook Ventures (Playbook Angel Network) is a **Melbourne-based community-powered angel syndicate** investing in Australia''s most exciting **pre-seed and seed-stage** startups. **Founded in 2022.**

The syndicate is built on the reach, trust and relationships of **The Startup Playbook Podcast** — one of Australia''s longest-running and most influential startup podcasts — to source high-quality founders before they''re on everyone else''s radar.

**Key team:**
- **James Harrisson** — Investment Manager, with 6+ years experience in fast-growing tech companies; podcast host with 50+ business-leader interviews; co-founded a DTC brand in North America (currently being acquired)

**Backing & support:**
- $3M funding round led by **Niki Scevak at Blackbird** (one of Australia''s most respected VCs)
- **LaunchVic** support to deploy $2.8M into early-stage startups over 2 years
- High-profile athlete LPs include **Naomi Osaka, Nick Kyrgios, Steve Smith** plus other angels and strategic investors

CSV cheque size not specified. Sector mandate: **Agnostic**.',
  why_work_with_us = 'For Australian pre-seed and seed-stage founders — especially those aligned with the Startup Playbook Podcast audience or seeking Melbourne syndicate access — Playbook Ventures combines deal-by-deal syndicate cheque flexibility with backing from Blackbird Ventures (top-tier Australian VC) and high-profile athlete LPs. Especially valuable for founders looking to plug into a media-amplified angel community.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace','FinTech','HealthTech','Sport Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.playbookventures.com.au/',
  linkedin_url = 'https://www.linkedin.com/company/playbook-ventures/',
  contact_email = 'james@playbookventures.com.au',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = false,
  portfolio_companies = ARRAY['Playbook Angel Network (Syndicate)','The Startup Playbook Podcast (origin)'],
  meta_title = 'Playbook Ventures — Melbourne Angel Syndicate | Blackbird-backed',
  meta_description = 'Melbourne community-powered angel syndicate. Founded 2022. Blackbird-backed. $2.8M LaunchVic deployment.',
  details = jsonb_build_object(
    'organisation_type','Community-powered angel syndicate',
    'founded',2022,
    'investment_thesis','Sector-agnostic Australian pre-seed/seed startups sourced via Startup Playbook Podcast network.',
    'team', jsonb_build_array(
      jsonb_build_object('name','James Harrisson','role','Investment Manager; podcast host; DTC brand co-founder')
    ),
    'backing', jsonb_build_object(
      'lead_investor','Niki Scevak / Blackbird Ventures',
      'launchvic_support','$2.8M deployment over 2 years',
      'high_profile_lps', ARRAY['Naomi Osaka','Nick Kyrgios','Steve Smith']
    ),
    'sources', jsonb_build_object(
      'website','https://www.playbookventures.com.au/',
      'aussie_angels','https://app.aussieangels.com/syndicate/playbook-ventures',
      'linkedin','https://au.linkedin.com/company/playbook-ventures'
    ),
    'corrections','CSV email truncated ("james@playbookventures...") resolved.'
  ),
  updated_at = now()
WHERE name = 'Playbook Ventures';

COMMIT;
