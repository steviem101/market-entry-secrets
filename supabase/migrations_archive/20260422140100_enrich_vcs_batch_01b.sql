-- Enrich VCs — batch 01b (records 6-10: Airtree Ventures → Altered Capital)

BEGIN;

UPDATE investors SET
  basic_info = 'Airtree Ventures is **Australia''s largest venture capital firm by funds-under-management** (~AU$2B FUM). Founded **2014 by Daniel Petre AO and Craig Blair**, the firm is headquartered in Surry Hills, Sydney.

Airtree''s LP base reads as a who''s-who of global institutional capital:
- **Harvard Management Company**
- **MetLife Investment Management**
- Major Australian superannuation funds

The firm is sector-broad — investing across **technology, SaaS, fintech, marketplace and deep-tech** — and writes cheques from **Seed through Series C+** (typically AU$500k–$30M).

Airtree''s portfolio includes **9 unicorns** (more than any other ANZ fund) and has produced some of the most prominent ANZ tech success stories:
- **Canva** (one of Australia''s most successful tech companies; design unicorn)
- **Employment Hero** (HR platform; unicorn)
- **Linktree** (link-in-bio platform; unicorn)
- **Immutable** (gaming / web3; unicorn)
- **Go1** (corporate learning; unicorn)
- **Airwallex** (global payments; unicorn)
- **Pet Circle** (DTC pet retail)
- **SafetyCulture** (workplace safety SaaS; unicorn)
- **ProcurePro**
- **Lorikeet**

Airtree also operates the **Halo Effect** programme — a curated network of operators-turned-angels — and the **Explorer** programme connecting top operators to the Airtree investment team and portfolio.',
  why_work_with_us = 'For Australian and New Zealand technology founders building globally-ambitious companies — Airtree is the most credentialed and best-resourced VC partner in the ANZ market. Their unicorn-rich portfolio (Canva, Employment Hero, Linktree, Immutable, Go1, Airwallex, SafetyCulture), institutional LP base (Harvard, MetLife) and ~AU$2B FUM scale mean they can lead-anchor seed rounds and follow-on through to growth. Especially valuable for founders pursuing global category leadership.',
  meta_title = 'Airtree Ventures — Australia''s Largest VC | ~AU$2B FUM | 9 Unicorns',
  meta_description = 'Sydney VC since 2014. Australia''s largest by FUM (~AU$2B). 9 unicorns. Canva, Linktree, Employment Hero. Seed–Series C+.',
  details = jsonb_build_object(
    'founded',2014,
    'founders', ARRAY['Daniel Petre AO','Craig Blair'],
    'fum','~AU$2B',
    'investment_thesis','Australian and NZ technology — Seed through Series C+; sector-broad.',
    'check_size_note','AU$500k–$30M',
    'lps', ARRAY['Harvard Management Company','MetLife Investment Management','Major Australian superannuation funds'],
    'unicorn_count',9,
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Canva','context','Design unicorn'),
      jsonb_build_object('company','Employment Hero','context','HR platform unicorn'),
      jsonb_build_object('company','Linktree','context','Link-in-bio unicorn'),
      jsonb_build_object('company','Immutable','context','Gaming / Web3 unicorn'),
      jsonb_build_object('company','Go1','context','Corporate learning unicorn'),
      jsonb_build_object('company','Airwallex','context','Global payments unicorn'),
      jsonb_build_object('company','SafetyCulture','context','Workplace safety SaaS unicorn')
    ),
    'programmes', ARRAY['Halo Effect (operator-angel network)','Explorer (top-of-funnel operator program)'],
    'sources', jsonb_build_object(
      'website','https://www.airtree.vc',
      'team','https://www.airtree.vc/team',
      'halo_effect','https://www.airtree.vc/open-source-vc'
    )
  ),
  updated_at = now()
WHERE name = 'Airtree Ventures';

UPDATE investors SET
  basic_info = 'Alberts Impact Ventures is the **impact-focused VC arm of the fifth-generation Albert family** — historically known as the founders of AC/DC''s original record label and one of Australia''s longest-running family enterprises. Led by **Kirsty Albert**.

The fund invests in companies generating **measurable social and/or environmental impact alongside financial returns**, across **Impact, Health, Sustainability, Future of Work and Education** sectors at pre-seed, seed and Series A stages.

**Diversity benchmark:** 25% female-led capital invested (as at Dec 2025).

The portfolio spans climate-tech, food-tech, mental-health, women''s-health and inclusion categories:
- **Hatch** (career platform)
- **Harvest B** (alternative protein)
- **Samphire Neuroscience** (femtech / women''s mental health)
- **Mindset Health** (digital therapeutics)
- **Verve** (women''s health — acquired Nov 2023)
- **Circle In** (parenting in workplace — exited)
- **Abby Health**
- **Conserving Beauty**
- **RapidAIM** (agritech)
- **Throughline**
- **Baymatob** (maternal health)
- **Pivot**
- **ULUU** (seaweed-based bioplastics)
- **MGA Thermal** (thermal energy storage)
- **Amber** (energy retail)
- **Tixel** (ticket marketplace)
- **Surreal**
- **Like Family**
- **Sendle** (delivery)
- **AirRobe** (circular fashion)
- **Gridcog** (energy grid software)
- **CommandPost**
- **Bygen** (biochar)',
  why_work_with_us = 'For Australian impact-aligned, health-tech, sustainability, climate-tech, women''s-health, future-of-work and education founders — Alberts Impact Ventures combines five generations of Albert family operating heritage with a clear impact thesis and one of the most diverse portfolios (25% female-led) in the country. Especially valuable for founders pursuing measurable-impact business models with patient family-office capital.',
  meta_title = 'Alberts Impact Ventures — Sydney Impact VC | 25% Female-Led | Albert Family',
  meta_description = 'Sydney impact VC. Albert family fifth-generation. Health, sustainability, future of work, education. 25% female-led.',
  details = jsonb_build_object(
    'organisation_type','Impact-focused family-office VC',
    'family','Albert family (fifth-generation; AC/DC''s original record label)',
    'leadership','Kirsty Albert',
    'investment_thesis','Measurable social/environmental impact alongside financial returns.',
    'diversity','25% female-led capital invested (Dec 2025)',
    'sources', jsonb_build_object(
      'website','https://www.alberts.co/impact-ventures/'
    )
  ),
  updated_at = now()
WHERE name = 'Alberts Impact Ventures';

UPDATE investors SET
  basic_info = 'Alchemy Ventures is a **Sydney-based ESVCLP** (Early Stage Venture Capital Limited Partnership; conditionally registered) operating since **20 May 2016** (ABN 52 612 502 548).

Stated thesis covers **Fintech, Proptech, Consumer Internet, Mining Tech and AgTech** at the **early-stage**.

Portfolio includes some notable Australian / global names:
- **Acctual** (Australian SaaS)
- **Clearmatch** (insurance)
- **Catalyst** (acquired by LI.FI Feb 2025)
- **Unstoppable Domains** (Web3 identity / crypto domain)
- **Nametag** (identity verification)

CSV cheque size: **AU$100k–$5M**.

**Note:** The Alchemy Ventures website was offline as at April 2026 (DNS error), and limited public information is currently available on the firm''s active fund status.',
  why_work_with_us = 'For Australian fintech, proptech, consumer-internet, mining-tech and agritech founders — Alchemy Ventures offers an ESVCLP-structured early-stage cheque ($100k–$5M) with a notable Web3/identity-tech bias (Unstoppable Domains, Nametag). Best treated as a referral-led conversation given limited current public-fund visibility.',
  meta_title = 'Alchemy Ventures — Sydney ESVCLP | FinTech / PropTech / Web3 | $100k–$5M',
  meta_description = 'Sydney ESVCLP since 2016. FinTech, PropTech, Consumer Internet, Mining Tech, AgTech. $100k–$5M.',
  details = jsonb_build_object(
    'organisation_type','ESVCLP (conditionally registered)',
    'abn','52 612 502 548',
    'active_from','20 May 2016',
    'investment_thesis','FinTech, PropTech, Consumer Internet, Mining Tech, AgTech.',
    'check_size_note','AU$100k–$5M',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Catalyst','context','Acquired by LI.FI Feb 2025'),
      jsonb_build_object('company','Unstoppable Domains','context','Web3 identity / crypto domains')
    ),
    'unverified', ARRAY['Website was offline as at April 2026 (DNS error). Active fund status not uniquely corroborated.']
  ),
  updated_at = now()
WHERE name = 'Alchemy Ventures';

UPDATE investors SET
  basic_info = 'ALIAVIA Ventures is an **Australian-rooted, California-based VC firm** founded in **2021 by Marisa Warren and Kate Vale**. The firm''s mandate is **investing in female-founded / female-led technology startups** across **Australia, New Zealand and the United States**.

Pre-seed and seed stage focus.

The LP base reads as a who''s-who of Australian tech wealth and prominent investors:
- **Tattarang** (Forrest Family / Andrew Forrest)
- **Wollemi Capital** (Robyn Denholm — Tesla Chair)
- **Trawalla Group** (Carol Schwartz)
- **Dom Pym** (Up Bank co-founder)
- **Cynthia Scott**

The firm also runs **ELEVACAO** — a pre-accelerator for women founders.

Portfolio includes:
- **Eugene** (genetics / women''s health)
- **HowToo** (eLearning)
- **Othelia**
- **GoFIGR**
- **Ginko**
- **Taelor**
- **Loupe** (exited to Stingray)
- **Human Health**',
  why_work_with_us = 'For ANZ and US-based female-founded / female-led technology startups at pre-seed and seed — ALIAVIA Ventures combines the most credentialed female-founder-focused fund mandate in the ANZ market with US Bay Area positioning, an exceptional Australian-tech-LP base (Tattarang, Wollemi Capital, Trawalla, Dom Pym) and the ELEVACAO pre-accelerator pathway.',
  meta_title = 'ALIAVIA Ventures — California-AU Female-Founded Tech VC | Tattarang/Wollemi LPs',
  meta_description = 'California Australian-rooted female-founded tech VC. Tattarang, Wollemi Capital, Trawalla LPs. ELEVACAO pre-accelerator.',
  details = jsonb_build_object(
    'founded',2021,
    'founders', ARRAY['Marisa Warren','Kate Vale'],
    'investment_thesis','Female-founded / female-led tech startups across ANZ and US.',
    'lps', ARRAY['Tattarang (Forrest Family)','Wollemi Capital (Robyn Denholm)','Trawalla (Carol Schwartz)','Dom Pym','Cynthia Scott'],
    'programmes', ARRAY['ELEVACAO (pre-accelerator for women founders)'],
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Loupe','context','Exited to Stingray')
    ),
    'sources', jsonb_build_object(
      'website','https://www.aliavia.vc'
    )
  ),
  updated_at = now()
WHERE name = 'ALIAVIA Ventures';

UPDATE investors SET
  basic_info = 'Altered Capital is an **Auckland, New Zealand-based growth-stage venture capital firm** founded in **2022 by McGregor Fea, Craig Mawdsley and Marcus Traill**.

The firm invests in **NZ-connected companies with global ambition** at **Series A and Series B** stages, across **technology, SaaS, fintech, maritime, EdTech, healthcare and financial services**.

**Track record:** Fund I tracking **>40% gross IRR**.

**Strategic partnership:** announced with **Pie Funds** in **February 2026**.

Portfolio includes some of NZ''s breakout scale-ups and global names:
- **Crimson Education** (NZ EdTech — global student admissions consulting)
- **Starboard Maritime Intelligence** (NZ maritime data)
- **Emerge** (NZ fintech)
- **Contented** (NZ video / content platform)
- **Oritain** (NZ supply-chain provenance)
- **ZILO** (UK fintech)
- **First Table** (NZ hospitality marketplace)
- **Oraame**
- **Starling Bank** (UK neobank)',
  why_work_with_us = 'For New Zealand-connected technology founders pursuing global Series A or Series B rounds — Altered Capital offers one of the most credentialed NZ-based growth-stage VC cheques. Fund I''s >40% gross IRR signals strong performance, and the Pie Funds partnership (Feb 2026) extends LP reach. Especially valuable for NZ-rooted scale-ups with global ambition.',
  meta_title = 'Altered Capital — Auckland NZ Growth VC since 2022 | Fund I >40% IRR',
  meta_description = 'Auckland NZ growth VC since 2022. Tech, SaaS, fintech. Crimson, Oritain, Starling Bank. >40% gross IRR.',
  details = jsonb_build_object(
    'founded',2022,
    'founders', ARRAY['McGregor Fea','Craig Mawdsley','Marcus Traill'],
    'investment_thesis','NZ-connected companies with global ambition at Series A and Series B.',
    'fund_i_irr','>40% gross IRR',
    'partnership','Pie Funds (announced Feb 2026)',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Crimson Education','context','Global student admissions consulting'),
      jsonb_build_object('company','Oritain','context','Supply-chain provenance'),
      jsonb_build_object('company','Starling Bank','context','UK neobank')
    ),
    'sources', jsonb_build_object(
      'website','https://www.alteredcapital.com'
    )
  ),
  updated_at = now()
WHERE name = 'Altered Capital';

COMMIT;
