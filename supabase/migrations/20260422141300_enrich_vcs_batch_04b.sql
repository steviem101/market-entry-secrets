-- Enrich VCs — batch 04b (records 66-70: Jekara Group → King River Capital)

BEGIN;

UPDATE investors SET
  basic_info = 'Jekara Group is an **Australian clean-energy / cleantech venture capital firm** investing across the **clean-energy value chain** — generation, distribution, storage and consumption.

Stage focus: **ideation through Series A** — meaning Jekara backs founders from earliest concept through to early commercial-traction rounds. Sector mandate: **Clean Energy / CleanTech**.',
  why_work_with_us = 'For Australian clean-energy and cleantech founders at any early stage — from ideation through Series A — Jekara Group offers a sector-pure clean-energy VC cheque covering the entire value chain (generation, distribution, storage, consumption). Especially valuable for capital-intensive clean-energy founders pursuing structured early-commercialisation pathways.',
  meta_title = 'Jekara Group — Australian Clean-Energy / CleanTech VC | Ideation to Series A',
  meta_description = 'Australian clean-energy / cleantech VC. Generation, distribution, storage, consumption. Ideation to Series A.',
  details = jsonb_build_object(
    'investment_thesis','Clean energy / cleantech across generation, distribution, storage, consumption.',
    'stages','Ideation through Series A'
  ),
  updated_at = now()
WHERE name = 'Jekara Group';

UPDATE investors SET
  basic_info = 'Jelix Ventures is a **Bondi Junction, NSW-based ANZ early-stage venture capital firm** investing in **Australia and New Zealand** technology founders at **Pre-Seed, Seed and Series A** stages.

The firm is **ESVCLP-registered** and operates a sector-agnostic technology mandate.

Portfolio includes notable Australian breakout names:
- **PropHero** (Australian proptech)
- **Gelomics** (biotech)
- **Syenta**
- **SafeStack** (NZ cybersecurity)',
  why_work_with_us = 'For Australian and New Zealand pre-seed, seed and Series A technology founders — Jelix Ventures offers an ESVCLP-structured sector-agnostic cheque with a high-quality ANZ portfolio (PropHero proptech, SafeStack cybersecurity, Gelomics biotech). Especially valuable for early-stage tech founders looking for trans-Tasman ANZ deal-flow.',
  meta_title = 'Jelix Ventures — Bondi Junction ANZ Early-Stage VC | ESVCLP',
  meta_description = 'ANZ early-stage VC. Bondi Junction NSW. ESVCLP. PropHero, Gelomics, Syenta, SafeStack portfolio.',
  details = jsonb_build_object(
    'organisation_type','ESVCLP-registered ANZ early-stage VC',
    'investment_thesis','Sector-agnostic ANZ technology — pre-seed, seed, Series A.'
  ),
  updated_at = now()
WHERE name = 'Jelix Ventures';

UPDATE investors SET
  basic_info = 'Jungle Ventures is a **Singapore-based venture capital firm** with **US$1B+ AUM**. The firm is **focused exclusively on SE Asia and India** and is **NOT ANZ-focused**.

Stage focus: Series A and Series B technology investments across South-East Asia and India.',
  why_work_with_us = 'For Australian founders pursuing **SE Asia or India market expansion** — Jungle Ventures is a major regional VC partner. **Note**: Jungle does not invest in ANZ directly, so engagement is best for AU founders explicitly building SE Asia/India operations.',
  meta_title = 'Jungle Ventures — Singapore SE Asia / India VC | $1B+ AUM | NOT ANZ-Focused',
  meta_description = 'Singapore VC. $1B+ AUM. SE Asia + India focus only. Series A/B. Not ANZ-focused.',
  details = jsonb_build_object(
    'aum','US$1B+',
    'investment_thesis','Technology — SE Asia and India only (not ANZ-focused).',
    'note','For AU founders, only relevant if explicitly expanding to SE Asia or India.'
  ),
  updated_at = now()
WHERE name = 'Jungle Ventures';

UPDATE investors SET
  basic_info = 'KIN Group is a **Melbourne-based privately-held investment group** with a **100-year vision**.

**IMPORTANT**: KIN Group is **NOT a traditional venture capital fund**. The firm operates as a long-horizon family-office-style investment group rather than running fund cycles or making early-stage VC cheques.',
  why_work_with_us = 'For Australian founders pursuing exceptionally long-term private capital partnerships — KIN Group offers patient family-office-style capital with a stated 100-year horizon. **Note**: Not a traditional VC; engagement is unconventional and best treated as a referral-led conversation.',
  meta_title = 'KIN Group — Melbourne 100-Year Vision | NOT a Traditional VC',
  meta_description = 'Melbourne privately-held investment group. 100-year vision. Not a traditional VC fund.',
  details = jsonb_build_object(
    'organisation_type','Privately-held investment group',
    'is_traditional_vc',false,
    'investment_thesis','100-year vision long-horizon investment.',
    'note','Not a traditional VC; long-term family-office-style investing.'
  ),
  updated_at = now()
WHERE name = 'KIN Group';

UPDATE investors SET
  basic_info = 'King River Capital is a **Sydney-based venture capital firm** founded **2018/2019**, headquartered in Surry Hills (33 Nickson St). The firm manages **AU$1.2B FUM** and focuses on **AI and software** investments at **Seed, Series A and Series B** stages.

**Fund V** (March 2025) is targeting **US$100M** for AI/software-focused investments.

Track record: **49+ investments**.

Notable recent investments include:
- **Relevance AI** (Series B, May 2025)
- **Safewill** (Series B, November 2024)',
  why_work_with_us = 'For Australian and global AI and software founders at seed through Series B — King River Capital offers AU$1.2B FUM scale (one of the largest ANZ tech-VCs by FUM) with active AI/software thesis and recent landmark investments (Relevance AI Series B, Safewill Series B). Especially valuable for founders building AI-native or software-infrastructure products.',
  meta_title = 'King River Capital — Sydney AI / Software VC | AU$1.2B FUM | Fund V US$100M',
  meta_description = 'Sydney AI/software VC. AU$1.2B FUM. Fund V US$100M (Mar 2025). 49+ investments. Relevance AI, Safewill.',
  details = jsonb_build_object(
    'founded',2018,
    'fum','AU$1.2B',
    'fund_v','Targeting US$100M (March 2025)',
    'investment_thesis','AI and software — Seed, Series A, Series B.',
    'portfolio_size','49+ investments',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Relevance AI','context','Series B May 2025'),
      jsonb_build_object('company','Safewill','context','Series B Nov 2024')
    )
  ),
  updated_at = now()
WHERE name = 'King River Capital';

COMMIT;
