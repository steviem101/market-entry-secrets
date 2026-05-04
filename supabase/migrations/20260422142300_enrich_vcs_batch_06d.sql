-- Enrich VCs — batch 06d (records 116-120: Significant Ventures → SAVCF)

BEGIN;

UPDATE investors SET
  basic_info = 'Significant Early Venture Capital (Significant Ventures) is a **Canberra, ACT-based early-stage venture capital firm** (Suite 41, Level 1, 65 Constitution Ave, Campbell, ACT).

The firm manages **AU$28.6M FUM** with **32 investments** to date. Cheque size: **AU$100k–$500k**. Founded by the **Hindmarsh family**.

Sector focus: **Deep tech, critical tech, life sciences, AI, climate tech, advanced manufacturing** — with a notable bias to **university spinouts**. Stage focus: **Seed and Series A**.

Notable portfolio includes:
- **Wavewise Analytics**
- **Earthodic**
- **Visionary Machines**',
  why_work_with_us = 'For Australian deep-tech, critical-tech, life-sciences, AI, climate-tech and advanced-manufacturing founders — and especially university spinouts — Significant Ventures offers Canberra-anchored capital ($100k–$500k) from a Hindmarsh-family-backed VC with deep university-commercialisation network depth.',
  meta_title = 'Significant Ventures — Canberra Deep-Tech VC | $28.6M FUM | Hindmarsh Family',
  meta_description = 'Canberra early-stage VC. AU$28.6M FUM. 32 investments. $100k–$500k. Deep tech, critical tech, life sciences, AI, climate.',
  details = jsonb_build_object(
    'family','Hindmarsh family',
    'fum','AU$28.6M',
    'portfolio_size','32 investments',
    'check_size_note','AU$100k–$500k',
    'investment_thesis','Deep tech, critical tech, life sciences, AI, climate tech, advanced manufacturing — university spinouts emphasis.'
  ),
  updated_at = now()
WHERE name = 'Significant Early Venture Capital (Significant Ventures)';

UPDATE investors SET
  basic_info = 'Skalata Ventures is a **Melbourne-based pre-seed to seed-stage venture capital firm** known as **Australia''s highest support-to-cheque ratio VC** — meaning the firm provides exceptionally high levels of operating and structural support relative to capital invested.

**Fund III** is **ESVCLP-registered** (registered November 2025). Headquartered at Level 8, 446 Collins St, Melbourne.

Sector mandate is agnostic with **priority focus on women founders, climate, agtech, AI and healthtech**.

Notable portfolio includes:
- Digital freight forwarder
- E-commerce personalisation
- Custom artwork marketplace
- Cinema ticketing
- Financial education app
- Hospitality ordering
- Smart livestock ear tags

**Tracie Clark** (covered separately as Perth angel; Champion of Investment Diversity 2023) is part of the Skalata team.',
  why_work_with_us = 'For Australian pre-seed and seed-stage founders — and especially women founders, climate, agtech, AI and healthtech — Skalata Ventures offers Australia''s highest support-to-cheque ratio with structured operating-team engagement. ESVCLP Fund III (Nov 2025) provides additional capital depth.',
  meta_title = 'Skalata Ventures — Melbourne Pre-Seed/Seed VC | Fund III ESVCLP (Nov 2025) | Highest Support-to-Cheque',
  meta_description = 'Melbourne pre-seed/seed VC. Fund III ESVCLP (Nov 2025). Sector-agnostic. Women founders, climate, agtech, AI, healthtech priority.',
  details = jsonb_build_object(
    'distinction','Australia''s highest support-to-cheque ratio VC',
    'fund_iii','ESVCLP-registered Nov 2025',
    'investment_thesis','Sector-agnostic with women-founder, climate, agtech, AI, healthtech priority.',
    'related_individuals', ARRAY['Tracie Clark (Champion of Investment Diversity 2023)']
  ),
  updated_at = now()
WHERE name = 'Skalata Ventures';

UPDATE investors SET
  basic_info = 'Skip Capital is the **private investment fund of Scott Farquhar** (Atlassian Co-Founder) and his wife **Kim Jackson**.

The firm invests in **technology and infrastructure** at growth and multi-stage. Notable portfolio includes:
- **Neara** (utility-grid digital twin SaaS)
- **Lorikeet** (AI customer support — co-investor)

Skip Capital represents the **Farquhar / Jackson family-office venture activity** — distinct from Mike Cannon-Brookes'' Grok Ventures (the other Atlassian co-founder''s family office, covered separately).',
  why_work_with_us = 'For Australian and global technology and infrastructure founders pursuing growth-stage capital — Skip Capital offers Scott Farquhar (Atlassian Co-Founder) family-office capital with deep ANZ tech and infrastructure-investment depth (Neara, Lorikeet).',
  meta_title = 'Skip Capital — Scott Farquhar (Atlassian Co-Founder) Family Office | Tech / Infrastructure',
  meta_description = 'Scott Farquhar (Atlassian Co-Founder) + Kim Jackson family office. Technology and infrastructure. Growth / multi-stage.',
  details = jsonb_build_object(
    'principals', ARRAY['Scott Farquhar (Atlassian Co-Founder)','Kim Jackson'],
    'investment_thesis','Technology and infrastructure — growth / multi-stage.',
    'related','Sister-firm context to Grok Ventures (Mike Cannon-Brookes)'
  ),
  updated_at = now()
WHERE name = 'Skip Capital';

UPDATE investors SET
  basic_info = 'Social Ventures Australia (SVA) is an **Australian social-impact advisory and investment organisation** focused on **social enterprises and impact investment**.

The firm operates as a structured impact-investing platform combining advisory services with investment capital.',
  why_work_with_us = 'For Australian social-enterprise and impact-aligned founders — Social Ventures Australia offers a structured impact-advisory + investment combination. Especially valuable for founders building businesses with measurable social-impact outcomes.',
  meta_title = 'Social Ventures Australia (SVA) — Social-Impact Advisory + Investment',
  meta_description = 'Australian social-impact advisory and investment organisation. Social enterprises and impact investment.',
  details = jsonb_build_object(
    'organisation_type','Social-impact advisory + investment organisation',
    'investment_thesis','Social enterprises and impact investment.'
  ),
  updated_at = now()
WHERE name = 'Social Ventures Australia';

UPDATE investors SET
  basic_info = 'South Australian Venture Capital Fund (SAVCF) is the **South Australian Government-backed AU$50M venture capital fund**, **managed by Artesian Venture Partners**.

The fund operates two distinct cheque tiers:
- **Seed** — AU$400k
- **Series A** — AU$2.5M

**SA company requirement**: Portfolio companies must have **50%+ staff or assets in South Australia** to qualify.

Sector focus: **B2B Software, Space, Clean Energy, Cybersecurity, Defence, Agrifood and Health/MedTech**.

**11 SA businesses** supported to date.

Headquartered in Adelaide (L5, 2 Ebenezer Place). Contact: SAVCF@artesianinvest.com.',
  why_work_with_us = 'For South Australian founders — and especially companies with 50%+ SA staff/assets — building B2B software, space, clean-energy, cybersecurity, defence, agrifood or health-tech products — SAVCF is the **most-capitalised SA-Government-aligned VC** with structured Seed (AU$400k) and Series A (AU$2.5M) cheque tiers managed by Artesian.',
  meta_title = 'South Australian Venture Capital Fund (SAVCF) — SA Government VC | AU$50M | Managed by Artesian',
  meta_description = 'SA Government AU$50M VC. Managed by Artesian. Seed ($400k) + Series A ($2.5M). 50% SA staff/assets required.',
  details = jsonb_build_object(
    'organisation_type','SA Government-backed VC fund',
    'fund_size','AU$50M',
    'manager','Artesian Venture Partners',
    'check_tiers', jsonb_build_array(
      jsonb_build_object('stage','Seed','amount','AU$400k'),
      jsonb_build_object('stage','Series A','amount','AU$2.5M')
    ),
    'eligibility','50%+ staff or assets in South Australia',
    'investment_thesis','B2B Software, Space, Clean Energy, Cybersecurity, Defence, Agrifood, Health/MedTech.'
  ),
  updated_at = now()
WHERE name = 'South Australian Venture Capital Fund (SAVCF)';

COMMIT;
