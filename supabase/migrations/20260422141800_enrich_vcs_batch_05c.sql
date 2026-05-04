-- Enrich VCs — batch 05c (records 91-95: Oval Ventures → Pinery Capital)

BEGIN;

UPDATE investors SET
  basic_info = 'Oval Ventures is a **Japan + Australia pre-seed venture capital firm** with offices in **Mosman, NSW (Australia) and Ichikawa, Japan**.

The firm has a **highly distinctive sector mandate: human augmentation** — investing in technology that enhances human physical and cognitive capability.

**Standard deal: ¥14M for 7% equity** — meaning Oval offers a structured, formula-based investment offer rather than negotiating bespoke terms per round. This makes Oval one of the most transparent pre-seed funds globally.',
  why_work_with_us = 'For founders building **human-augmentation technology** at pre-seed stage — Oval Ventures offers a unique cross-border AU-Japan cheque with a fixed ¥14M / 7% standard deal structure. Especially valuable for founders building wearable, neurotech, performance-enhancement or cognitive-enhancement products with Japan-relevant market opportunity.',
  meta_title = 'Oval Ventures — AU + Japan Human-Augmentation Pre-Seed | ¥14M / 7% Standard Deal',
  meta_description = 'Mosman NSW + Ichikawa Japan pre-seed VC. Human augmentation focus. Standard deal: ¥14M for 7% equity.',
  details = jsonb_build_object(
    'investment_thesis','Human augmentation — pre-seed.',
    'standard_deal','¥14M for 7% equity',
    'global_offices', ARRAY['Mosman, NSW (Australia)','Ichikawa (Japan)']
  ),
  updated_at = now()
WHERE name = 'Oval Ventures';

UPDATE investors SET
  basic_info = 'Paloma is **Australia''s largest venture studio** — best known for **building and scaling the original tech behind Afterpay** (Australia''s most successful BNPL company; acquired by Block / Square).

Paloma operates as both a venture studio (building companies from concept) and an investor — with **VC Fund II AU$25M** raised in **October 2024**.

The firm partners with ambitious founders to turn great ideas into category-defining companies. Headquartered in Darlinghurst (165 Riley St). Stage focus: **Pre-Seed, Seed, Series A**. Cheque size: **AU$250k–$1M**. ANZ focus.

Portfolio includes:
- **Marmalade** (Australian SME invoice finance)
- **Chemcloud** (chemistry/lab software)
- **Runn** (resource planning SaaS)
- **Authsignal** (passwordless authentication)

**Rafe Custance** (covered in this directory as Sydney angel) is a **Partner at Paloma**.',
  why_work_with_us = 'For Australian and New Zealand technology founders at pre-seed through Series A — Paloma offers Australia''s most credentialed venture-studio operating model (think Afterpay-scale tech build experience) plus AU$25M VC Fund II cheque capacity. Especially valuable for founders building structurally hard tech products who want studio-level engineering and product partnership.',
  meta_title = 'Paloma — Australia''s Largest Venture Studio | Fund II AU$25M | Afterpay Origin',
  meta_description = 'Australia''s largest venture studio. Built original Afterpay tech. Fund II AU$25M (Oct 2024). Marmalade, Authsignal portfolio.',
  details = jsonb_build_object(
    'distinction','Australia''s largest venture studio',
    'origin','Built and scaled the original tech behind Afterpay',
    'fund_ii','AU$25M VC Fund II raised October 2024',
    'investment_thesis','Pre-Seed to Series A — ANZ technology.',
    'check_size_note','AU$250k–$1M',
    'related_individuals', ARRAY['Rafe Custance (Partner)']
  ),
  updated_at = now()
WHERE name = 'Paloma';

UPDATE investors SET
  basic_info = 'Perle Ventures is a **Sydney-based venture capital firm** investing in **early and growth-stage technology companies**. Stage focus: **Series A and Series B**.',
  why_work_with_us = 'For Australian Series A and Series B technology founders — Perle Ventures offers Sydney-based growth-stage capital. Best treated as a referral-led conversation given limited public information beyond directory listing.',
  meta_title = 'Perle Ventures — Sydney Series A/B Tech VC',
  meta_description = 'Sydney-based VC. Early and growth-stage technology. Series A/B focus.',
  details = jsonb_build_object(
    'investment_thesis','Technology — Series A and Series B.'
  ),
  updated_at = now()
WHERE name = 'Perle Ventures';

UPDATE investors SET
  basic_info = 'Phase Alpha is **Australia''s first veteran-owned venture capital firm**.

The firm focuses exclusively on **national security technology, defence and sovereign capability** — meaning Phase Alpha is one of the few sector-pure defence-tech / national-security VCs in the ANZ market.',
  why_work_with_us = 'For Australian national-security, defence-tech, sovereign-capability and dual-use technology founders — Phase Alpha offers the **only veteran-owned VC cheque** in Australia with explicit defence-and-sovereign-capability mandate. Especially valuable for founders building products with allied-nation national-security applications.',
  meta_title = 'Phase Alpha — Australia''s First Veteran-Owned VC | National Security / Defence',
  meta_description = 'Australia''s first veteran-owned VC. National security tech, defence, sovereign capability.',
  details = jsonb_build_object(
    'distinction','Australia''s first veteran-owned VC',
    'investment_thesis','National security tech, defence, sovereign capability.'
  ),
  updated_at = now()
WHERE name = 'Phase Alpha';

UPDATE investors SET
  basic_info = 'Pinery Capital is an **Australian pre-seed to pre-Series A early-stage micro equity fund**. Sector mandate is technology-agnostic.',
  why_work_with_us = 'For Australian technology founders at pre-seed through pre-Series A — Pinery Capital offers a small-cheque early-stage micro-equity entry-point. Best treated as a referral-led conversation given limited public information.',
  meta_title = 'Pinery Capital — Australian Pre-Seed / Pre-Series A Micro-Equity Fund',
  meta_description = 'Australian pre-seed to pre-Series A micro-equity fund. Sector-agnostic technology.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic technology — pre-seed to pre-Series A; micro-equity.'
  ),
  updated_at = now()
WHERE name = 'Pinery Capital';

COMMIT;
