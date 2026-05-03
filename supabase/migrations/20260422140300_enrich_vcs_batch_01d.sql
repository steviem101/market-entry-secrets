-- Enrich VCs — batch 01d (records 16-20: Athletic Ventures → Beachhead Venture Capital)

BEGIN;

UPDATE investors SET
  basic_info = 'Athletic Ventures is one of Australia''s most distinctive venture capital firms — a **VC fund and syndicate** founded by **former AFL player Matt De Boer and NBA basketballer Matthew Dellavedova**.

The firm leverages a **community of 500+ current and former elite athletes** — bringing performance-mindset, discipline, and unique distribution / brand-amplification capability to portfolio companies.

**Champions Fund: AU$25M closed April 2025.** Cheque size: **AU$1M–$4M** at **Seed, Series A and Series B** stages.

Sector focus is **generalist (technology / consumer)** with a notable consumer / sport / health / wellness bias from the founder backgrounds.

Portfolio includes some of Australia''s breakout scale-ups:
- **Traild** (B2B marketplace)
- **Lorikeet** (AI customer support)
- **Airwallex** (global payments unicorn)
- **Rokt** (e-commerce / advertising)
- **Baseten** (US ML infrastructure)',
  why_work_with_us = 'For Australian and global technology and consumer founders — Athletic Ventures combines a sector-broad mandate with an unparalleled athlete-network distribution channel (500+ elite athletes), AU$25M Champions Fund capital, and high-quality scale-up portfolio (Airwallex, Rokt). Especially valuable for consumer, sport-tech, performance and brand-driven founders.',
  meta_title = 'Athletic Ventures — AFL + NBA Founders | 500+ Athlete Community | $1M–$4M',
  meta_description = 'Sydney VC by AFL/NBA athletes. 500+ elite athletes community. $25M Champions Fund. Airwallex, Rokt, Lorikeet.',
  details = jsonb_build_object(
    'founders', ARRAY['Matt De Boer (former AFL player)','Matthew Dellavedova (NBA basketballer)'],
    'investment_thesis','Generalist — technology and consumer with athlete-network distribution leverage.',
    'check_size_note','AU$1M–$4M',
    'community','500+ current and former elite athletes',
    'champions_fund','AU$25M closed April 2025',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Airwallex','context','Australian global payments unicorn'),
      jsonb_build_object('company','Rokt','context','E-commerce advertising'),
      jsonb_build_object('company','Lorikeet','context','AI customer support'),
      jsonb_build_object('company','Baseten','context','US ML infrastructure')
    ),
    'sources', jsonb_build_object(
      'website','https://www.athletic.vc/'
    )
  ),
  updated_at = now()
WHERE name = 'Athletic Ventures';

UPDATE investors SET
  basic_info = 'Aura Ventures is a Sydney-based **thesis-driven, seed-stage specialist VC** founded in **2013** as part of the **Aura Group** — a financial services organisation with **AU$1.8B total AUM**.

The firm partners with **outstanding entrepreneurs across Australia and South-East Asia** at **Angel, Pre-Seed, Seed and Series A** stages. Cheque size: **AU$500k–$2M**.

**Fund III** is targeting approximately **25 AI-enabled B2B software companies** with global scaling potential — across AI, compliance tech, logistics and adjacent sectors.

Portfolio includes some of ANZ''s breakout names:
- **Shippit** (logistics)
- **Catapult** (sport science / wearables — ASX-listed)
- **Gamurs** (gaming media)
- **Jigspace** (3D content / collaborative product development)
- **Sahha AI** (mobile mental-health monitoring)
- **Hatch** (career platform)',
  why_work_with_us = 'For Australian and South-East-Asia-connected AI-enabled B2B SaaS founders at seed-stage — Aura Ventures offers thesis-driven specialist capital with broader Aura Group AU$1.8B AUM scale, regional SEA reach and a strong portfolio (Shippit, Catapult, Jigspace). Especially valuable for B2B SaaS founders with cross-border SEA expansion ambition.',
  meta_title = 'Aura Ventures — Sydney AI / B2B SaaS Seed VC | Aura Group AU$1.8B | $500k–$2M',
  meta_description = 'Sydney seed VC since 2013. AI-enabled B2B software. SE Asia connected. Aura Group AU$1.8B AUM. Fund III.',
  details = jsonb_build_object(
    'founded',2013,
    'parent','Aura Group (total AUM ~AU$1.8B)',
    'investment_thesis','AI-enabled B2B software; South-East Asia connected.',
    'check_size_note','AU$500k–$2M',
    'fund_iii_target','~25 AI-enabled B2B software companies',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Shippit','context','Logistics scale-up'),
      jsonb_build_object('company','Catapult','context','Sport science / wearables; ASX-listed'),
      jsonb_build_object('company','Jigspace','context','3D content / collaborative product development')
    ),
    'sources', jsonb_build_object(
      'website','https://www.aura.vc/',
      'fund_iii','https://www.aura.co/aura-ventures-fund-iii',
      'aura_group','https://www.aura.co/venture-capital'
    )
  ),
  updated_at = now()
WHERE name = 'Aura Ventures';

UPDATE investors SET
  basic_info = 'Australian Unity Future of Healthcare Fund is a **Sydney-based managed fund** investing in **emerging and innovative healthcare businesses** — across **pharmaceuticals, life sciences, biotech, medical devices and health IT**.

Launched **October 2020** by Australian Unity. **Management rights transferred to Perennial Partners in May 2024.**

Stage focus: **Series A, Series B, Series C**. Cheque size: **AU$250k–$7.5M**.

Notable investment: **Lumos Diagnostics** (rapid diagnostics platform).',
  why_work_with_us = 'For Australian healthcare founders — across pharmaceuticals, biotech, medical devices, life sciences and health IT — Australian Unity Future of Healthcare Fund (now managed by Perennial Partners) offers a Series A–C cheque from a major Australian healthcare-aligned institution with regulatory and clinical-network depth. Especially valuable for capital-intensive medical-device and biotech founders.',
  meta_title = 'Australian Unity Future of Healthcare Fund | Series A–C Healthcare | $250k–$7.5M',
  meta_description = 'Sydney healthcare fund launched 2020. Now Perennial Partners managed. Pharma, biotech, devices, health IT. $250k–$7.5M.',
  details = jsonb_build_object(
    'launched','October 2020',
    'manager','Perennial Partners (since May 2024)',
    'parent','Australian Unity',
    'investment_thesis','Emerging and innovative healthcare — pharma, life sciences, biotech, medical devices, health IT.',
    'check_size_note','AU$250k–$7.5M',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Lumos Diagnostics','context','Rapid diagnostics platform')
    ),
    'sources', jsonb_build_object(
      'website','https://www.australianunity.com.au/wealth/investment-options/future-of-healthcare-fund'
    )
  ),
  updated_at = now()
WHERE name = 'Australian Unity Future of Healthcare Fund';

UPDATE investors SET
  basic_info = 'Bailador Technology Investments is an **ASX-listed growth capital fund** (Listed Investment Company; ASX: **BTI**) focused on the **information technology sector**. Founded **2010 by David Kirk MBE and Paul Wilson**. Listed on the ASX in **November 2014**.

The fund pays **dividends** to listed shareholders — making it one of the few Australian VC vehicles offering retail-investor access to private-tech-fund returns via a public market vehicle.

Investment range: **AU$5M–$20M** at **Series A through Series D+ (Growth, Pre-IPO)** stages — focused on **SaaS, subscription-based internet and online marketplaces**.

Portfolio includes some of Australia''s most notable scale-ups:
- **SiteMinder (ASX: SDR)** — Australian hotel-tech unicorn (now publicly listed)
- **Updoc** (telehealth)
- **DASH** (truncated — financial-services software)
- **Access Telehealth** (telehealth)
- **Straker** (translation; ASX-listed)
- **Nosto** (e-commerce personalisation)
- **Rosterfy** (volunteer management)
- **Hapana** (fitness software)
- **PropHero** (proptech)',
  why_work_with_us = 'For Australian B2B SaaS, subscription-internet and online-marketplace founders pursuing Series A through Pre-IPO rounds — Bailador offers AU$5M–$20M cheques from one of the few ASX-listed growth-VC vehicles (BTI), giving founders pathway to public-market capital structuring expertise. The David Kirk MBE / Paul Wilson founder track-record (incl. SiteMinder/SDR ASX-IPO) is among the most credentialed in Australian growth-tech.',
  meta_title = 'Bailador Technology Investments — ASX:BTI | Australian Growth Tech VC | $5M–$20M',
  meta_description = 'Sydney ASX-listed growth tech VC since 2010. SaaS, subscription, marketplaces. SiteMinder, Straker. $5M–$20M.',
  details = jsonb_build_object(
    'founded',2010,
    'founders', ARRAY['David Kirk MBE','Paul Wilson'],
    'asx_listed','ASX: BTI (listed Nov 2014)',
    'fund_type','Listed Investment Company (LIC) — pays dividends',
    'investment_thesis','Information technology — SaaS, subscription-based internet, online marketplaces.',
    'check_size_note','AU$5M–$20M',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','SiteMinder','context','Australian hotel-tech unicorn — ASX:SDR'),
      jsonb_build_object('company','Straker','context','Translation; ASX-listed')
    ),
    'sources', jsonb_build_object(
      'website','https://www.bailador.com.au/'
    )
  ),
  updated_at = now()
WHERE name = 'Bailador Technology Investments';

UPDATE investors SET
  basic_info = 'Beachhead Venture Capital is a **Sydney-based early-stage venture capital firm** founded in **2013** investing in **high-growth Australian companies looking to rapidly expand**.

The partners are **all former founders** themselves — bringing operational experience to portfolio engagement. The firm has made **20 investments** as of October 2023.

Investment focus: **companies with a product, team, and paying customers** — at **Seed (8 deals) and Series A (1 deal)** stages. Cheque size: **AU$200k–$1M**.

Sector focus: **Fintech, SaaS (Vertical and Enterprise Applications), Blockchain, Business Services, Consumer**.',
  why_work_with_us = 'For Australian fintech, vertical-SaaS, enterprise-applications and blockchain founders with a product, team and paying customers — Beachhead Venture Capital offers a $200k–$1M cheque from former-founder partners with operational depth. Especially valuable for founders who want hands-on operator engagement at the seed stage with a proven 20-deal track record.',
  meta_title = 'Beachhead Venture Capital — Sydney Founder-Led Seed VC since 2013 | $200k–$1M',
  meta_description = 'Sydney former-founder seed VC since 2013. 20 investments. FinTech, SaaS, Blockchain. $200k–$1M.',
  details = jsonb_build_object(
    'founded',2013,
    'investment_thesis','High-growth Australian companies with product, team and paying customers.',
    'check_size_note','AU$200k–$1M',
    'partners','All former founders',
    'portfolio_size','20 investments (as at Oct 2023)',
    'sources', jsonb_build_object(
      'website','https://beachhead.vc/',
      'team','https://beachhead.vc/team',
      'pitchbook','https://pitchbook.com/profiles/investor/264919-33'
    )
  ),
  updated_at = now()
WHERE name = 'Beachhead Venture Capital';

COMMIT;
