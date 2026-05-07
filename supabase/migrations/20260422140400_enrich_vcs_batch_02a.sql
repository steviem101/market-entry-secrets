-- Enrich VCs — batch 02a (records 21-25: Billfolda Ventures → Boson Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Billfolda Ventures (BVC) is a **Sydney-based ESVCFLP** sector-agnostic pre-seed/seed venture capital fund founded in **2024** with **AU$10.5M committed capital** from members of the successful **Billfolda Angels Investment Syndicate** (active since 2019).

The fund has applied for **Early Stage Venture Capital Limited Partnership status** and targets **AU$25M maximum committed capital**. Plans **15-20 investments** in Australian pre-seed, seed, start-up and early-expansion businesses with additional capital reserved for follow-on investment.

Investment range: **AU$200k–$2M** at **Angel, Pre-seed, Seed and Series A** stages. Sector mandate: **Sustainable Tech, AI, FinTech, HealthTech, Cyber, CleanTech and DefenceTech**.

**Track record:** Billfolda Angels Syndicate has invested actively since 2019 in **9 companies** — 5 of which have offered exit opportunities, with most subsequent rounds at higher valuations.',
  why_work_with_us = 'For Australian pre-seed and seed-stage founders across Sustainable Tech, AI, FinTech, HealthTech, Cyber, CleanTech and DefenceTech — Billfolda Ventures offers a $200k–$2M cheque from an ESVCLP-aligned vehicle with proven angel-syndicate track record (9 investments since 2019, 5 exit opportunities). Especially valuable for sector-aligned founders looking for structured early-stage capital with follow-on capacity.',
  meta_title = 'Billfolda Ventures — Sydney ESVCFLP Pre-Seed/Seed VC | $200k–$2M | $10.5M Fund',
  meta_description = 'Sydney ESVCFLP since 2024. AU$10.5M fund (max $25M). Sustainable Tech, AI, FinTech, HealthTech, Cyber, Defence. $200k–$2M.',
  details = jsonb_build_object(
    'organisation_type','ESVCFLP (Early Stage Venture Capital Fund Limited Partnership; pending registration)',
    'founded',2024,
    'committed_capital','AU$10.5M',
    'max_capital','AU$25M',
    'investment_thesis','Sector-agnostic — Sustainable Tech, AI, FinTech, HealthTech, Cyber, CleanTech, DefenceTech.',
    'check_size_note','AU$200k–$2M',
    'plan','15-20 Australian pre-seed/seed investments + follow-on',
    'parent_syndicate','Billfolda Angels Investment Syndicate (active since 2019; 9 investments)',
    'sources', jsonb_build_object(
      'website','https://billfolda.vc/',
      'fund_structure','https://billfolda.vc/fund-structure/'
    )
  ),
  updated_at = now()
WHERE name = 'Billfolda Ventures';

UPDATE investors SET
  basic_info = 'Black Nova VC is a **Sydney-based early-stage B2B SaaS specialist venture capital fund** founded in **2020 by Matthew Browne and Darcy Naunton**. Headquartered in Surry Hills.

The firm''s thesis is **mission-critical, workflow-led B2B SaaS in regulated industries** — at **Pre-Seed, Seed and Series A** stages. Cheque size: up to **AU$1M**.

**Fund II closed exceeding AU$35M target (December 2025)** — making Black Nova one of the most-active and best-capitalised pure-play B2B SaaS funds in the ANZ market.

Portfolio includes some of Australia''s most exciting B2B SaaS companies:
- **Kismet** (workflow automation)
- **Operata** (contact-centre observability)
- **Offerfit** (AI marketing)
- **Cipherstash** (encryption-as-a-service)
- **GovConnex** (government engagement SaaS)
- **Pathzero** (carbon accounting)
- **Notiv** (meeting intelligence)
- **Functionly** (org-design SaaS)
- **RightPaw** (pet-care marketplace)

Several Australian individual angels are LPs in Black Nova VC (covered separately in this directory).',
  why_work_with_us = 'For Australian B2B SaaS founders building **mission-critical, workflow-led software in regulated industries** — Black Nova VC is the most credentialed sector-pure B2B SaaS specialist VC in the ANZ market. Fund II''s AU$35M+ close plus the Matthew Browne / Darcy Naunton operator track record signal both capital depth and sector pattern recognition.',
  meta_title = 'Black Nova VC — Sydney B2B SaaS Specialist | Fund II AU$35M+ | up to $1M',
  meta_description = 'Sydney B2B SaaS VC since 2020. Mission-critical workflow software. Fund II AU$35M+. Kismet, Operata, Cipherstash.',
  details = jsonb_build_object(
    'founded',2020,
    'founders', ARRAY['Matthew Browne','Darcy Naunton'],
    'investment_thesis','Mission-critical, workflow-led B2B SaaS in regulated industries.',
    'check_size_note','Up to AU$1M',
    'fund_ii','Closed exceeding AU$35M target (Dec 2025)',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Cipherstash','context','Australian encryption-as-a-service'),
      jsonb_build_object('company','Operata','context','Contact-centre observability'),
      jsonb_build_object('company','Pathzero','context','Carbon accounting'),
      jsonb_build_object('company','GovConnex','context','Government engagement SaaS')
    ),
    'sources', jsonb_build_object(
      'website','https://www.blacknova.vc/'
    )
  ),
  updated_at = now()
WHERE name = 'Black Nova VC';

UPDATE investors SET
  basic_info = 'Black Sheep Capital is a **Brisbane-based early-stage angel/micro-VC** founded in **2013 by Dan Gavel**. Focused on scalable technology companies at **Pre-Seed through Series B** stages — typical deals **AU$1M–$5M**.

Portfolio reflects deep operator-aligned consumer/B2B software pattern recognition, with **52 investments** across diverse sectors — primarily technology and healthcare:
- **Amber Electric** (Australian energy retail)
- **Go1** (corporate learning unicorn)
- **Ignition** (Australian client engagement SaaS)
- **Valiant Finance** (SME finance marketplace)
- **Notiv** (meeting intelligence)
- **Sendle** (delivery)
- **Practice Ignition** / **Ignition** (acquired)

The fund manager has executed **more than 50 investments** across diverse sectors.',
  why_work_with_us = 'For Australian — and especially Brisbane/Queensland-based — early-stage technology and healthcare founders pursuing pre-seed through Series B rounds — Black Sheep Capital combines 12+ years of operating history with a high-quality 50+ investment portfolio (Amber, Go1, Ignition, Valiant). Especially valuable for founders looking for hands-on early-stage support from a pure-play tech-sector specialist.',
  meta_title = 'Black Sheep Capital — Brisbane Early-Stage Tech VC since 2013 | 52+ Investments',
  meta_description = 'Brisbane micro-VC since 2013. Technology, healthcare. Pre-Seed to Series B. 52+ investments. Amber, Go1, Ignition.',
  details = jsonb_build_object(
    'founded',2013,
    'founder','Dan Gavel',
    'investment_thesis','Scalable technology — pre-seed through Series B.',
    'check_size_note','AU$1M–$5M typical',
    'portfolio_size','52+ investments',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Go1','context','Australian corporate learning unicorn'),
      jsonb_build_object('company','Amber Electric','context','Australian energy retail'),
      jsonb_build_object('company','Ignition','context','Acquired')
    ),
    'sources', jsonb_build_object(
      'website','https://blacksheepcapital.com.au/'
    )
  ),
  updated_at = now()
WHERE name = 'Black Sheep Capital';

UPDATE investors SET
  basic_info = 'Blackbird Ventures is **one of Australia''s largest and most prominent venture capital funds** — and arguably the most active backer of globally-ambitious ANZ founders. Founded **2012 by Niki Scevak, Rick Baker and Bill Bartee**.

The firm invests in the **most ambitious founders from Australia and New Zealand building technology companies that can become global leaders** — across **Pre-Seed through Growth** stages, with cheques from **AU$100k to AU$50M**.

Blackbird''s portfolio reads as a who''s-who of ANZ tech success stories:
- **Canva** (one of Australia''s most successful tech companies; design unicorn — Niki Scevak led seed)
- **SafetyCulture** (workplace safety SaaS unicorn)
- **Culture Amp** (employee experience SaaS unicorn)
- **Zoox** (autonomous vehicles — acquired by Amazon for ~US$1.2B)
- Plus an extensive portfolio of breakout ANZ companies

Blackbird also operates the **First Believers** programme — Australia''s most prominent accelerator-angel programme that has bootstrapped many of Australia''s most active emerging angel investors (covered extensively in this directory).',
  why_work_with_us = 'For Australian and New Zealand technology founders building globally-ambitious companies — Blackbird Ventures is the most-active and best-known VC partner for ANZ tech ambition. Their unicorn-rich portfolio (Canva, SafetyCulture, Culture Amp, Zoox), $100k–$50M cheque flexibility and First Believers angel-network make them a top-of-funnel choice for founders pursuing global category leadership.',
  meta_title = 'Blackbird Ventures — Australia''s Largest VC | Canva, SafetyCulture, Zoox',
  meta_description = 'Sydney/Melbourne/Auckland VC since 2012. ANZ founders building global tech. Pre-Seed to Growth. $100k–$50M.',
  details = jsonb_build_object(
    'founded',2012,
    'founders', ARRAY['Niki Scevak','Rick Baker','Bill Bartee'],
    'investment_thesis','Ambitious ANZ founders building global tech leaders — Pre-Seed through Growth.',
    'check_size_note','AU$100k–$50M',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Canva','context','Design unicorn — one of Australia''s most successful tech companies'),
      jsonb_build_object('company','SafetyCulture','context','Workplace safety SaaS unicorn'),
      jsonb_build_object('company','Culture Amp','context','Employee experience SaaS unicorn'),
      jsonb_build_object('company','Zoox','context','Autonomous vehicles — acquired by Amazon ~US$1.2B')
    ),
    'programmes', ARRAY['First Believers (premier accelerator-angel programme)'],
    'sources', jsonb_build_object(
      'website','https://www.blackbird.vc/'
    )
  ),
  updated_at = now()
WHERE name = 'Blackbird Ventures';

UPDATE investors SET
  basic_info = 'Boson Ventures is a **Sydney-based early-stage venture capital firm** founded in **2021 by Alan Jones and Victor Ma**.

The firm operates two distinct fund vehicles:
- **Boson Newton Fund** — DeepTech, biotech, medtech, cleantech
- **Boson Eoarchean Fund** — B2B SaaS, FinTech

Boson''s differentiator is its **unique global perspective with extensive networks in China and the United States** — specifically positioned to help portfolio scale through Chinese manufacturing and US capital markets. Given that much of high-tech downstream manufacturing is concentrated in China, Boson''s connections provide invaluable support for scaling deep-tech.

The team comprises ex-founders, former corporate executives and veteran investors. Stage focus: **Pre-Seed and Seed**.

Portfolio includes:
- **GreenDynamics** (Australian climate-tech)
- **Osara Health** (digital therapeutics)
- **Hello Clever** (FinTech)
- **Fiable** (FinTech)
- **Kite Magnetics** (deep-tech magnets — also Breakthrough Victoria portfolio)',
  why_work_with_us = 'For Australian and New Zealand deep-tech, biotech, medtech, cleantech, B2B SaaS and FinTech founders pursuing **China-supply-chain or US-market expansion** — Boson Ventures combines two specialist sub-funds with rare ANZ-China-US connectivity. Especially valuable for hardware-and-deep-tech founders needing structured Chinese manufacturing partnerships.',
  meta_title = 'Boson Ventures — Sydney Deep-Tech / B2B SaaS VC | China + US Connectivity',
  meta_description = 'Sydney VC since 2021. Newton Fund (deep-tech) + Eoarchean Fund (B2B SaaS). China/US scaling network.',
  details = jsonb_build_object(
    'founded',2021,
    'founders', ARRAY['Alan Jones','Victor Ma'],
    'funds', jsonb_build_array(
      jsonb_build_object('name','Boson Newton Fund','focus','DeepTech, biotech, medtech, cleantech'),
      jsonb_build_object('name','Boson Eoarchean Fund','focus','B2B SaaS, FinTech')
    ),
    'investment_thesis','ANZ early-stage with China and US scaling-network leverage.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Kite Magnetics','context','Deep-tech magnets'),
      jsonb_build_object('company','GreenDynamics','context','Climate-tech')
    ),
    'sources', jsonb_build_object(
      'website','https://www.boson.vc/'
    )
  ),
  updated_at = now()
WHERE name = 'Boson Ventures';

COMMIT;
