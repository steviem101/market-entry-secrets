-- Enrich VCs — batch 01c (records 11-15: Arbor Capital → AS1 Growth Partners)

BEGIN;

UPDATE investors SET
  basic_info = 'Arbor Capital is a Brisbane-based **patient-capital fund for high-growth private technology companies**, part of the **Arbor Group** investment platform. Founded **2016**.

The fund operates an **evergreen structure** — meaning no fixed term — backing **capital-efficient, near-profitable early-stage tech businesses** with a long-term horizon. Investment range: **AU$500k–$5M** at **Series A through Growth (Series D+)**.

Sector focus spans **technology — SaaS, marketplaces, energy, logistics and fintech**.

The firm''s naming reflects its philosophy: "Arbor" is the Latin name for a species of tree known for providing strength, support and coverage through an interconnecting lattice of vines in its canopy. Arbor positions itself as **"the long-term custodians of Great Australian Businesses."**',
  why_work_with_us = 'For Australian capital-efficient, near-profitable technology founders in SaaS, marketplaces, energy, logistics or fintech — Arbor Capital''s evergreen structure offers a rare patient-capital alternative to fixed-term VC funds. Especially valuable for founders pursuing sustainable growth (no aggressive exit pressure) with $500k–$5M cheques across Series A through Series D+.',
  meta_title = 'Arbor Capital — Brisbane Patient-Capital Tech VC | Evergreen | $500k–$5M',
  meta_description = 'Brisbane evergreen patient-capital tech fund since 2016. SaaS, marketplaces, energy, logistics, fintech. $500k–$5M.',
  details = jsonb_build_object(
    'founded',2016,
    'fund_structure','Evergreen (no fixed term)',
    'investment_thesis','Capital-efficient, near-profitable Australian tech businesses with long-term horizon.',
    'check_size_note','AU$500k–$5M',
    'parent','Arbor Group',
    'sources', jsonb_build_object(
      'website','https://arborcapital.co/',
      'group','https://arborgroup.co/'
    )
  ),
  updated_at = now()
WHERE name = 'Arbor Capital';

UPDATE investors SET
  basic_info = 'Archangel Ventures is a **Melbourne-based early-stage venture capital firm** writing first cheques into Australian founders at **Angel, Pre-Seed and Seed** stages.

**Fund I** raised **AU$40M from 150 wholesale investors**. **Managing Partner: Ben Armstrong.**

The firm has connections with **Rayn Ong** (Sydney legendary angel; Partner at Archangel Ventures — covered separately in this directory) and operates with **LaunchVic** support.

Portfolio includes some of Australia''s most exciting early-stage scale-ups:
- **Heidi** (clinical AI scribe — major scale-up)
- **Atelier**
- **Pearler** (DTC investing)
- **Relevance AI** (AI agents)
- **Mutinex** (marketing analytics)
- **InvestorHub** (investor relations SaaS)

Sector focus is **generalist** — healthtech, fintech, supply chain, consumer tech.',
  why_work_with_us = 'For Australian pre-seed, seed and angel-stage founders — especially in healthtech, fintech, supply-chain and consumer-tech — Archangel Ventures offers a first-cheque investor with AU$40M Fund I capacity, 150 wholesale-investor LP base, and access to the Rayn Ong / LaunchVic angel network. Especially valuable for founders looking for early-stage Melbourne syndicate-backed capital.',
  meta_title = 'Archangel Ventures — Melbourne First-Cheque VC | $40M Fund I | Heidi, Pearler',
  meta_description = 'Melbourne first-cheque early-stage VC. AU$40M Fund I from 150 LPs. Heidi, Pearler, Relevance AI, Mutinex.',
  details = jsonb_build_object(
    'fund_i','AU$40M from 150 wholesale investors',
    'managing_partner','Ben Armstrong',
    'related_individuals', ARRAY['Rayn Ong (Partner; Sydney legendary angel)'],
    'investment_thesis','Generalist — healthtech, fintech, supply chain, consumer tech.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Heidi','context','Clinical AI scribe — major Australian scale-up'),
      jsonb_build_object('company','Relevance AI','context','AI agents'),
      jsonb_build_object('company','Pearler','context','DTC investing platform')
    ),
    'sources', jsonb_build_object(
      'website','https://www.archangel.vc/'
    )
  ),
  updated_at = now()
WHERE name = 'Archangel Ventures';

UPDATE investors SET
  basic_info = 'Arowana Partners is the **London-based VC arm of Arowana** — investing in **secondaries of technology-enabled companies globally** in partnership with **selected family-office co-investors**.

The firm also operates a **corporate ventures arm**.

Notable transaction: **Glassbox** (digital experience analytics) — listed on **Tel Aviv Stock Exchange**.

Stage focus: **secondaries** (i.e. acquiring stakes from existing shareholders rather than primary fundraising rounds).',
  why_work_with_us = 'For technology-enabled companies (and their existing shareholders) globally — Arowana Partners offers a specialist secondaries-buyer with London base and Australian roots. Especially relevant for founders or early investors looking for liquidity options without a full company exit, or for family offices wanting curated co-investment access.',
  meta_title = 'Arowana Partners — London Tech Secondaries | Family-Office Co-Invest',
  meta_description = 'London Australian-rooted VC. Tech secondaries. Family-office co-invest. Glassbox listed Tel Aviv.',
  details = jsonb_build_object(
    'investment_thesis','Secondaries of technology-enabled companies globally; family-office co-investor partnerships.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Glassbox','context','Listed on Tel Aviv Stock Exchange')
    ),
    'sources', jsonb_build_object(
      'website','https://arowanaco.com/venture-capital/'
    )
  ),
  updated_at = now()
WHERE name = 'Arowana Partners';

UPDATE investors SET
  basic_info = 'Artesian Capital Management is a **global alternative investment management firm** founded in **2004**. Headquartered in Sydney with **41 staff across 10 global offices**, Artesian manages **AU$1.4B in AUM** and is **B Corp certified**.

Artesian is one of Australia''s most prolific VCs by deal volume — **625+ portfolio companies** and **1,500+ founder alumni** across its programmes. The firm has been a pioneer in Australia''s VC sector since the early 2010s.

Sector focus: **Agrifood, Clean Energy, AI/Robotics, MedTech**. Stage focus: **early-stage to growth**.',
  why_work_with_us = 'For Australian agrifood, clean-energy, AI/robotics and medtech founders — Artesian offers one of the most extensive global VC networks in the ANZ market (10 offices, AU$1.4B AUM, 625+ portfolio companies). The B Corp certification and 1,500+ founder-alumni network make Artesian especially valuable for impact-aligned founders pursuing global capital and ecosystem support.',
  meta_title = 'Artesian Capital Management — Global Alternative VC | AU$1.4B AUM | B Corp',
  meta_description = 'Sydney global alternative VC since 2004. AU$1.4B AUM. 10 offices. 625+ portfolio companies. B Corp.',
  details = jsonb_build_object(
    'founded',2004,
    'aum','AU$1.4B',
    'staff',41,
    'offices',10,
    'b_corp_certified',true,
    'investment_thesis','Agrifood, Clean Energy, AI/Robotics, MedTech — early-stage to growth.',
    'portfolio_size','625+ portfolio companies',
    'founder_alumni','1,500+',
    'sources', jsonb_build_object(
      'website','https://www.artesianinvest.com/'
    )
  ),
  updated_at = now()
WHERE name = 'Artesian Capital Management';

UPDATE investors SET
  basic_info = 'AS1 Growth Partners is a **Sydney-based private multi-family investment office** established in **2019** focused on **growth-stage technology investments across both private and public markets**.

The firm manages the wealth of **entrepreneurial families whose capital stems from technology and e-commerce ventures** — including **Temple & Webster founders**.

Vehicles include:
- **AS1 Growth Fund 1**
- **AS1 Fund of Funds**

Capital is **long-term**, structure is **evergreen**, and focus is **enduring value**.

Notable recent investment: **Edstart** (Australian education-finance — Series C-1, December 2024).',
  why_work_with_us = 'For Australian growth-stage technology founders pursuing Series D+ rounds — AS1 Growth Partners offers a rare private multi-family-office cheque structured as evergreen long-term capital. The Temple & Webster founder LP base brings deep DTC and ecommerce operator network access. Especially valuable for capital-efficient growth-stage tech companies with public-market potential.',
  meta_title = 'AS1 Growth Partners — Sydney Multi-Family Growth Tech VC | Evergreen',
  meta_description = 'Sydney private multi-family office since 2019. Growth-stage tech. Evergreen. Temple & Webster founders LP base.',
  details = jsonb_build_object(
    'organisation_type','Private multi-family investment office',
    'founded',2019,
    'investment_thesis','Growth-stage technology investments across private and public markets.',
    'fund_structure','Evergreen long-term capital',
    'lp_base','Entrepreneurial families incl. Temple & Webster founders',
    'vehicles', ARRAY['AS1 Growth Fund 1','AS1 Fund of Funds'],
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Edstart','context','Series C-1 Dec 2024')
    ),
    'sources', jsonb_build_object(
      'website','https://www.as1growthpartners.com/',
      'team','https://www.as1growthpartners.com/team'
    )
  ),
  updated_at = now()
WHERE name = 'AS1 Growth Partners';

COMMIT;
