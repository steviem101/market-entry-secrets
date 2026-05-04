-- Enrich VCs — batch 03a (records 41-45: Empress Capital → Folklore Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Empress Capital is a **Canberra-based AI-focused venture capital firm** investing in early-stage AI companies across **Australia and New Zealand**.

The firm operates as an **ESVCLP** (Early Stage Venture Capital Limited Partnership) and writes **AU$250k cheques** at **Pre-Seed, Seed and Series A** stages.

Notable investment: **Mary Technology** (Pre-Seed AU$620k, September 2024).',
  why_work_with_us = 'For Australian and New Zealand AI-first founders at pre-seed through Series A — Empress Capital offers a focused $250k cheque from an ESVCLP-structured AI-specialist VC. Especially valuable for ACT/Canberra-based founders or those building AI-native products with cross-Tasman ambition.',
  meta_title = 'Empress Capital — Canberra AI VC | ESVCLP | $250k | ANZ',
  meta_description = 'Canberra AI-focused ESVCLP. ANZ pre-seed/seed/Series A. AU$250k. Mary Technology in portfolio.',
  details = jsonb_build_object(
    'organisation_type','ESVCLP',
    'investment_thesis','Artificial Intelligence — ANZ pre-seed through Series A.',
    'check_size_note','AU$250k',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Mary Technology','context','Pre-Seed $620k, Sep 2024')
    )
  ),
  updated_at = now()
WHERE name = 'Empress Capital';

UPDATE investors SET
  basic_info = 'Euphemia is the **Melbourne-based family office of Dom Pym** — co-founder of **Up bank** (one of Australia''s most successful neobanks).

The firm operates a **co-investment syndicate model** for **fintech, cleantech and women-led startups** at the **early stage**.

Portfolio includes:
- **Heatseeker** (sales analytics)
- **Future Super** (ethical superannuation — AU$15M Series C)
- **Co Ventures**
- **Triple Bubble**

Dom Pym is also a major LP in **ALIAVIA Ventures** (covered separately) — meaning Euphemia''s capital is networked deep into the ANZ female-founder VC ecosystem.',
  why_work_with_us = 'For Australian fintech, cleantech and especially women-led founders — Euphemia offers Dom Pym''s family office co-investment syndicate model with deep operator credentials (Up bank co-founder). Especially valuable for impact-aligned founders pursuing structured family-office co-invest pathways.',
  meta_title = 'Euphemia — Dom Pym (Up Bank) Family Office | Melbourne FinTech / CleanTech / Women-Led',
  meta_description = 'Melbourne Dom Pym family office (Up bank co-founder). FinTech, CleanTech, women-led. Co-investment syndicate model.',
  details = jsonb_build_object(
    'organisation_type','Family office — co-investment syndicate model',
    'principal','Dom Pym (co-founder of Up bank)',
    'investment_thesis','FinTech, CleanTech, women-led startups — early stage.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Future Super','context','Ethical superannuation — AU$15M Series C')
    )
  ),
  updated_at = now()
WHERE name = 'Euphemia';

UPDATE investors SET
  basic_info = 'EVP is a **Sydney-based early-stage venture capital firm** focused on **B2B SaaS and AI-first software** — at **Seed, Series A and Series B** stages. Cheque size: **AU$500k–$5M**.

**Fund V** launched November 2025 at **AU$100M**.

EVP was **co-founded by Howard Leibman and Les Szekely** (legendary Australian angel investor — also covered in this directory).

Portfolio includes some of Australia''s breakout B2B SaaS scale-ups:
- **SiteMinder** (ASX: SDR — Australian hotel-tech unicorn; first investor was Les Szekely 2008 seed)
- **Deputy** (workforce management SaaS)
- **Ignition** (client engagement; acquired)
- **HNRY** (NZ/AU sole-trader fintech)
- **Shippit** (logistics)
- **Mutinex** (marketing analytics)
- **Splo** (truncated)',
  why_work_with_us = 'For Australian and New Zealand B2B SaaS and AI-first software founders at seed through Series B — EVP combines Howard Leibman + Les Szekely co-founder credentials (Les was the first investor in SiteMinder/SDR), AU$100M Fund V capacity, and a high-quality B2B SaaS portfolio (Deputy, Shippit, Ignition).',
  meta_title = 'EVP — Sydney B2B SaaS / AI-First VC | Fund V AU$100M | Co-founded by Les Szekely',
  meta_description = 'Sydney B2B SaaS / AI VC. Fund V AU$100M (Nov 2025). SiteMinder, Deputy, Shippit. Les Szekely co-founder. $500k–$5M.',
  details = jsonb_build_object(
    'co_founders', ARRAY['Howard Leibman','Les Szekely (legendary Australian angel; SiteMinder first investor)'],
    'investment_thesis','B2B SaaS and AI-first software — Seed, Series A, Series B.',
    'check_size_note','AU$500k–$5M',
    'fund_v','Launched Nov 2025 at AU$100M'
  ),
  updated_at = now()
WHERE name = 'EVP';

UPDATE investors SET
  basic_info = 'Exto Partners is an **Australian direct-secondary fund** — providing **early liquidity for shareholders** in growth-stage technology companies. Sydney-based. **Previously raised approximately AU$100M.**

The firm operates exclusively in the **secondary-transactions** stage — meaning Exto buys equity from existing shareholders (founders, employees, early investors) rather than participating in primary fundraising rounds.',
  why_work_with_us = 'For founders, employees and early investors in Australian growth-stage technology companies looking to **realise partial liquidity** without a full company exit — Exto Partners is one of the most credentialed Australian direct-secondary specialists. Engagement is typically about partial-stake liquidity transactions rather than primary investment cheques.',
  meta_title = 'Exto Partners — Australian Direct-Secondary Fund | Early Liquidity | ~AU$100M',
  meta_description = 'Sydney direct-secondary tech fund. Provides early liquidity to growth-company shareholders. ~AU$100M raised.',
  details = jsonb_build_object(
    'organisation_type','Direct-secondary fund',
    'investment_thesis','Secondary transactions — providing early liquidity to growth-company shareholders.',
    'fum','Approximately AU$100M previously raised'
  ),
  updated_at = now()
WHERE name = 'Exto Partners';

UPDATE investors SET
  basic_info = 'Folklore Ventures is a **Sydney-based Australian venture capital firm** focused on **partnering with visionary founders building technology companies for the long term**.

Investment focus: **Capital Markets, Internet Marketplace Platforms, Online and Mail-Order Retail, and Software Development**. Stage focus: **Seed and Series A**. Cheque size: **AU$1M–$10M**.

Portfolio includes some of Australia''s most prominent breakout scale-ups:
- **Employment Hero** (HR platform unicorn)
- **Eucalyptus** (D2C health platform — Pilot, Kin, Juniper, Software Health)
- **Roller** (Australian leisure venue management SaaS — global)',
  why_work_with_us = 'For Australian B2B SaaS, marketplace, capital-markets and software founders at seed through Series A — Folklore Ventures offers AU$1M–$10M cheques with a clear long-term partnership ethos. The Employment Hero and Eucalyptus backings signal pattern recognition for breakout consumer + B2B scale-ups.',
  meta_title = 'Folklore Ventures — Sydney Long-Term Tech VC | Employment Hero, Eucalyptus | $1M–$10M',
  meta_description = 'Sydney long-term tech VC. Capital markets, marketplaces, online retail, software. $1M–$10M. Employment Hero, Eucalyptus, Roller.',
  details = jsonb_build_object(
    'investment_thesis','Long-term partnership with visionary tech founders — capital markets, marketplaces, online retail, software development.',
    'check_size_note','AU$1M–$10M',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Employment Hero','context','HR platform unicorn'),
      jsonb_build_object('company','Eucalyptus','context','D2C health — Pilot, Kin, Juniper, Software Health'),
      jsonb_build_object('company','Roller','context','Australian leisure venue management SaaS')
    )
  ),
  updated_at = now()
WHERE name = 'Folklore Ventures';

COMMIT;
