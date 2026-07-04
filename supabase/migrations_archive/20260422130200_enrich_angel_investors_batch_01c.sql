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
