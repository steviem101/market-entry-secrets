-- Enrich angel investors — batch 02z (records 149-153: Madeleine Grummet → Marc Schwartz)

BEGIN;

UPDATE investors SET
  description = 'Melbourne-based award-winning edtech entrepreneur, startup mentor, journalist and angel investor. 80+ company portfolio across ANZ via Flying Fox Ventures and Working Theory Angels. Founder of Future Amp (career-skills platform; 50,000+ secondary students; backed by AWS, Melbourne Uni, David Gonski''s Future Minds Accelerator) and girledworld (national women''s mentoring). University of Melbourne Faculty Leadership Award (2020).',
  basic_info = 'Madeleine Grummet (Hanger) is a Melbourne-based award-winning edtech entrepreneur, journalist and venture-and-angel investor with a portfolio of **80+ companies across ANZ**.

Her founder track record (both founded 2016 after Master of Entrepreneurship at Melbourne Business School):
- **Future Amp** — career-skills platform supporting 50,000+ secondary students across Australia. Backed by governments, AWS, The University of Melbourne and David Gonski''s Future Minds Accelerator.
- **girledworld** — national education company connecting young women with mentors in business, technology and innovation.

She received the **University of Melbourne Faculty of Business and Economics Leadership Award (2020)** for her founding leadership of girledworld and gender-equality initiatives.

Her angel investing is via **Flying Fox Ventures** (with Rachael Neumann #83 and Kylie Frazer #136) and **Working Theory Angels** — both founded 2020/2021 by Neumann and Frazer to drive private capital into early-stage startups while increasing the quantity and quality of angel investors.

She is also active with **SheEO** (now **Coralus**), the multinational community of women that has loaned $3M+ to 32 women-led ventures across three countries.

Her career began with a journalism cadetship at News Corp, including roles at ABC, ABC Radio National, Crikey, Channel Nine, Herald Sun, The Australian, Women''s Agenda and other major media outlets.',
  why_work_with_us = 'For Australian edtech, female-founder, women''s-leadership and consumer-impact founders, Madeleine offers exceptionally deep ecosystem reach via 80+ portfolio plus Flying Fox + Working Theory Angels alumni network plus SheEO/Coralus distribution.',
  sector_focus = ARRAY['EdTech','Female Founders','Women''s Leadership','Consumer','Social Impact','SaaS','Career Tech'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  website = 'https://www.madeleinegrummet.com',
  linkedin_url = 'https://www.linkedin.com/in/madeleinegrummet/',
  location = 'Melbourne, VIC',
  country = 'Australia',
  currently_investing = true,
  leads_deals = true,
  portfolio_companies = ARRAY['Future Amp (Founder; 50,000+ students)','girledworld (Founder)','Flying Fox Ventures (early-stage investor)','Working Theory Angels (early-stage investor)','SheEO / Coralus (Activator)','LaunchVic'],
  meta_title = 'Madeleine Grummet — Future Amp / girledworld | Melbourne EdTech Angel',
  meta_description = 'Melbourne edtech entrepreneur with 80+ portfolio. Founder Future Amp, girledworld. Flying Fox + Working Theory Angels. UoM Leadership Award 2020.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Future Amp (2016; 50,000+ secondary students)','girledworld (2016; women''s mentoring)'],
    'recognition', ARRAY['University of Melbourne Faculty of Business and Economics Leadership Award (2020)'],
    'angel_portfolio_count','80+ across ANZ',
    'angel_affiliations', ARRAY['Flying Fox Ventures (early-stage investor)','Working Theory Angels (early-stage investor)','SheEO / Coralus (Activator)'],
    'cross_references', jsonb_build_object(
      'flying_fox_co_founders',ARRAY['Rachael Neumann (record #83)','Kylie Frazer (record #136)']
    ),
    'media_career', ARRAY['News Corp journalism cadetship','ABC','ABC Radio National','Crikey','Channel Nine','Herald Sun','The Australian','Women''s Agenda'],
    'education', ARRAY['Master of Entrepreneurship, Melbourne Business School'],
    'sources', jsonb_build_object(
      'website','https://www.madeleinegrummet.com/',
      'investor','https://www.madeleinegrummet.com/venture-capital-angel-investor/',
      'about','https://www.madeleinegrummet.com/about-madeleine-grummet/',
      'girledworld_founders','http://www.girledworld.com/founders',
      'linkedin','https://www.linkedin.com/in/madeleinegrummet/'
    ),
    'corrections','CSV had only LinkedIn and Melbourne. Sector_focus, portfolio and detailed bio populated from public sources.'
  ),
  updated_at = now()
WHERE name = 'Madeleine Grummet';

UPDATE investors SET
  description = 'Perth-based generalist angel investor. CSV-listed portfolio includes Hurtec and Keeyu (AI-backed e-commerce tech, $2.3M pre-seed).',
  basic_info = 'Mala Kennedy is a Perth-based generalist angel investor listed in the Australian angel directory. CSV-listed portfolio:
- **Hurtec** — Australian early-stage technology company
- **Keeyu** — AI-backed e-commerce monitoring platform (Sydney-based, raised $2.3M pre-seed led by Rampersand with Archangel, Startmate, Empress Capital, Exhort Ventures, Sydney Angels, Southern Angels and individual angels)

Beyond the directory entry, individual investor track record could not be uniquely corroborated from public-source search.',
  why_work_with_us = 'For Western-Australian and Perth-region founders looking for a small generalist cheque from a local angel.',
  sector_focus = ARRAY['Generalist','E-commerce','SaaS','AI','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/malakennedy',
  contact_email = 'malakennedy84@gmail.com',
  location = 'Perth, WA',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Hurtec','Keeyu'],
  meta_title = 'Mala Kennedy — Perth Generalist Angel | Hurtec, Keeyu',
  meta_description = 'Perth-based generalist angel investor. CSV portfolio: Hurtec, Keeyu.',
  details = jsonb_build_object(
    'investment_thesis','Generalist Perth-region angel investing.',
    'unverified', ARRAY[
      'Beyond CSV directory listing, individual investor track record could not be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/malakennedy',
      'keeyu_funding','https://www.thesaasnews.com/news/keeyu-raises-2-3m-in-pre-seed-funding'
    ),
    'corrections','CSV email truncated ("malakennedy84@gmail.c..."). Resolved to malakennedy84@gmail.com.'
  ),
  updated_at = now()
WHERE name = 'Mala Kennedy';

UPDATE investors SET
  description = 'Sydney-based founder, advisor and angel investor. Founder of Babyology (Australia''s largest digital publisher for parents; founded 2007; built to multi-million dollar platform reaching 5M+ people/week, ~25 staff; sold late 2017). Climate Salad Founding Advisor. UNSW BCom. Not sector-specific.',
  basic_info = 'Mandi Gunsberger is a Sydney-based serial entrepreneur and angel investor. She is the founder of **Babyology** — Australia''s largest digital publisher for parents — which she launched alone in 2007 in her living room with $5,000 spent on website design while on maternity leave. She built it into a multi-million-dollar digital media platform with a team of almost 25, reaching 5+ million people per week, and exited via acquisition in late 2017.

Her earlier ventures: a cookie company at age 23, and a relocation business at 25, before founding Babyology at 29.

She holds a Bachelor of Commerce from UNSW and spent 8 years in marketing and PR in Australia and San Francisco before moving into event management.

Currently she is **Founding Advisor at Climate Salad** — Australia''s climate-tech community network. She is also a Mentor Walk mentor, Non-Executive Director for Bicycles for Humanity, and active across Mama Creatives.',
  why_work_with_us = 'For Australian parenting-tech, women''s-business, digital-media, climate-tech and consumer founders, Mandi offers exit-tested digital-media operator credentials (Babyology) plus Climate Salad founding-advisor reach.',
  sector_focus = ARRAY['Consumer','Digital Media','Parenting Tech','Climate Tech','Women''s Business','SaaS'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  linkedin_url = 'https://www.linkedin.com/in/mandigunsberger/',
  contact_email = 'mandi@mandigunsberger.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  portfolio_companies = ARRAY['Babyology (Founder; sold late 2017)','Climate Salad (Founding Advisor)','Bicycles for Humanity (NED)','Mama Creatives','Mentor Walks (mentor)','Nourish Travel (CEO/Partnership Expert)'],
  meta_title = 'Mandi Gunsberger — Babyology founder | Sydney Consumer Angel',
  meta_description = 'Sydney founder Babyology (sold 2017, multi-million-dollar parenting platform). Climate Salad Founding Advisor. UNSW BCom.',
  details = jsonb_build_object(
    'founder_of', ARRAY['Babyology (2007; sold late 2017; ~25 staff; 5M+ weekly reach)','Cookie company (age 23)','Relocation business (age 25)'],
    'current_roles', ARRAY['Climate Salad Founding Advisor','Bicycles for Humanity NED','Nourish Travel CEO/Partnership Expert','Mama Creatives','Mentor Walks (mentor)'],
    'education', ARRAY['Bachelor of Commerce, UNSW'],
    'prior_career','8 years marketing and PR (Australia + San Francisco)',
    'sources', jsonb_build_object(
      'bio','http://mandigunsberger.com/bio',
      'climate_salad','https://www.climatesalad.com/posts/welcome-our-founding-advisor-mandi-gunsberger',
      'crunchbase','https://www.crunchbase.com/person/mandi-gunsberger',
      'linkedin','https://www.linkedin.com/in/mandigunsberger/',
      'mama_creatives','https://mamacreatives.com/community/mandig/'
    ),
    'corrections','CSV email truncated ("mandi@mandigunsberger..."). Resolved to mandi@mandigunsberger.com.'
  ),
  updated_at = now()
WHERE name = 'Mandi Gunsberger';

UPDATE investors SET
  description = 'Sydney-based angel investor. Limited public investor profile beyond Australian angel directory listing. $5k–$10k cheques.',
  basic_info = 'Mara Halim Hidayat Siregar is listed in the Australian angel investor directory as a Sydney-based angel investor at $5k–$10k cheque size. Beyond the directory entry, no detailed public investor profile or sector focus could be uniquely corroborated from public-source search.',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  check_size_min = 5000,
  check_size_max = 10000,
  linkedin_url = 'https://www.linkedin.com/in/marasiregar',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Mara Halim Hidayat Siregar — Sydney Angel | $5k–$10k',
  meta_description = 'Sydney-based angel investor. Limited public profile.',
  details = jsonb_build_object(
    'check_size_note','$5k–$10k',
    'unverified', ARRAY[
      'Beyond CSV directory listing, no detailed public investor profile could be uniquely corroborated.'
    ],
    'sources', jsonb_build_object(
      'linkedin','https://www.linkedin.com/in/marasiregar'
    ),
    'corrections','CSV had only name, LinkedIn and Sydney location.'
  ),
  updated_at = now()
WHERE name = 'Mara Halim Hidayat Siregar';

UPDATE investors SET
  description = 'Sydney-based angel investor with all-sector mandate. Limited public profile beyond Australian angel directory listing.',
  basic_info = 'Marc Schwartz is listed in the Australian angel investor directory as a Sydney-based angel investor with all-sector mandate. Beyond the directory entry and email contact, no detailed public investor profile, portfolio or LinkedIn could be uniquely corroborated from public-source search (multiple Marc Schwartz individuals exist).',
  why_work_with_us = 'Best treated as a referral- or warm-intro-led conversation. Limited public investor signal beyond directory.',
  sector_focus = ARRAY['Generalist','SaaS','Consumer','Marketplace'],
  stage_focus = ARRAY['Pre-seed','Seed'],
  contact_email = 'mschwartzz@gmail.com',
  location = 'Sydney, NSW',
  country = 'Australia',
  currently_investing = true,
  meta_title = 'Marc Schwartz — Sydney Generalist Angel',
  meta_description = 'Sydney-based generalist angel investor. Limited public profile.',
  details = jsonb_build_object(
    'unverified', ARRAY[
      'Beyond CSV directory listing and email, no detailed public investor profile could be uniquely corroborated. Common-name caveat applies.'
    ],
    'sources', jsonb_build_object(
      'australian_angel_list_pdf','https://www.scribd.com/document/767032518/Angels-Australia'
    ),
    'corrections','CSV had only name, all-sector focus, Sydney location and email. No LinkedIn URL.'
  ),
  updated_at = now()
WHERE name = 'Marc Schwartz';

COMMIT;
