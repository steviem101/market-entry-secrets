-- Enrich VCs — batch 06c (records 111-115: Seed Space VC → Significant Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Seed Space Venture Capital is an **Australian and Swiss-based early-stage seed FinTech venture capital firm** investing in companies driving a revolution in financial services.

Stage focus: **Seed**.',
  why_work_with_us = 'For Australian and European fintech founders at seed — Seed Space Venture Capital offers a sector-pure FinTech cheque with cross-continent AU + Switzerland deployment.',
  meta_title = 'Seed Space Venture Capital — AU + Switzerland Early-Stage Seed FinTech VC',
  meta_description = 'Australian + Swiss early-stage seed FinTech VC.',
  details = jsonb_build_object(
    'investment_thesis','FinTech — seed stage.',
    'global_offices', ARRAY['Australia','Switzerland']
  ),
  updated_at = now()
WHERE name = 'Seed Space Venture Capital';

UPDATE investors SET
  basic_info = 'SEEK Investments is the **investment arm of SEEK Limited** — Australia''s largest employment marketplace and a globally significant HR-tech operator. Headquartered in Cremorne, VIC (60 Cremorne St).

The firm is a **thematic long-term growth investor** — operating the **SEEK Growth Fund** with **~AU$2B FUM**.

Sector focus: **HR SaaS, Education, Contingent Labour tech** — categories aligned with SEEK''s core operating thesis. Stage focus: **Growth** (global investment scope).

**Ariel Hersh** (covered separately as **Investment Director at Seek Investments**) is part of **Nullarbor Ventures** founding team — illustrating SEEK''s deep ties into the broader ANZ angel community.',
  why_work_with_us = 'For HR SaaS, Education and Contingent Labour tech founders at growth stage — SEEK Investments offers ~AU$2B FUM scale plus deep strategic alignment with SEEK Limited''s global HR-tech operating depth. Especially valuable for founders whose products complement or extend SEEK''s core marketplace.',
  meta_title = 'SEEK Investments — SEEK Growth Fund | ~AU$2B FUM | HR SaaS / EdTech / Contingent Labour',
  meta_description = 'Investment arm of SEEK Limited. Thematic growth investor. ~AU$2B FUM. HR SaaS, EdTech, Contingent Labour tech.',
  details = jsonb_build_object(
    'parent','SEEK Limited',
    'fund','SEEK Growth Fund',
    'fum','~AU$2B',
    'investment_thesis','HR SaaS, Education, Contingent Labour tech — thematic long-term growth.',
    'related_individuals', ARRAY['Ariel Hersh (Investment Director; Nullarbor Ventures founding team)']
  ),
  updated_at = now()
WHERE name = 'SEEK Investments';

UPDATE investors SET
  basic_info = 'Shearwater Capital is a **Sydney-based venture capital firm** (Edgecliff, NSW) with **AU$100M Fund II** raised in **2024**.

Distinctive structure: **3 founders as partners investing their own capital** — meaning Shearwater operates with a high alignment of incentives between investors and founders.

Track record: **22 investments**, **6 at AU$100M+ valuation** (i.e. centaur or unicorn-grade outcomes).

Sector focus: Fast-growth technology in Australia and New Zealand. Stage focus: **Seed to Growth**.',
  why_work_with_us = 'For Australian and New Zealand fast-growth technology founders at seed through growth — Shearwater Capital offers AU$100M Fund II capital from a partner-aligned firm where the 3 founders invest their own capital. The 22-investment portfolio with 6 at $100M+ valuation signals strong pattern recognition for breakout outcomes.',
  meta_title = 'Shearwater Capital — Sydney Fast-Growth Tech VC | $100M Fund II | 22 investments / 6 at $100M+',
  meta_description = 'Sydney VC. AU$100M Fund II (2024). 3 partners investing own capital. 22 investments, 6 at $100M+ valuation.',
  details = jsonb_build_object(
    'fund_ii','AU$100M (2024)',
    'partner_alignment','3 founders as partners investing own capital',
    'track_record','22 investments, 6 at $100M+ valuation',
    'investment_thesis','Fast-growth technology — AU/NZ; Seed to Growth.'
  ),
  updated_at = now()
WHERE name = 'Shearwater Capital';

UPDATE investors SET
  basic_info = 'Side Stage Ventures is an **Australian founder-led seed venture capital fund**. **Fund I: AU$15M** raised in **August 2023**.

The firm is led by **Markus Kahlbetzer** (founder of BridgeLane Group — covered separately in this directory; BridgeLane has now moved focus exclusively to Side Stage). Cheque size: **up to AU$500k**. Sector mandate: agnostic with bias to large markets.

Notable portfolio includes some of Australia''s breakout technology successes:
- **Leonardo AI** (generative AI — exited to Canva)
- **Braid** (financial-services SaaS)
- **Superdesign** (design tooling)
- **Arca** (climate tech — AU$12.2M raise)
- **TrueState**
- **MagicBrief** (exited)
- Plus historic backings of **Go1** and **Airtasker**',
  why_work_with_us = 'For Australian seed-stage founders building products targeting big markets — Side Stage Ventures offers Markus Kahlbetzer''s deep Australian-tech network plus Fund I AU$15M capacity (Aug 2023). Especially valuable for founders pursuing structured pre-Series A capital with notable scale-up adjacency (Leonardo AI/Canva, Go1, Airtasker historic backings).',
  meta_title = 'Side Stage Ventures — Markus Kahlbetzer''s Founder-Led Seed VC | $15M Fund I | up to $500k',
  meta_description = 'AU founder-led seed fund. AU$15M Fund I (Aug 2023). Up to $500k. Leonardo AI (Canva exit), Arca, MagicBrief.',
  details = jsonb_build_object(
    'principal','Markus Kahlbetzer (formerly BridgeLane Group)',
    'fund_i','AU$15M (August 2023)',
    'check_size_note','Up to AU$500k',
    'investment_thesis','Sector-agnostic with bias to big markets — seed.',
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Leonardo AI','context','Generative AI — exited to Canva'),
      jsonb_build_object('company','Arca','context','Climate tech — AU$12.2M raise')
    )
  ),
  updated_at = now()
WHERE name = 'Side Stage Ventures';

UPDATE investors SET
  basic_info = 'Signal Ventures is a **Melbourne-founded seed venture capital firm** with offices in **Melbourne (AU team) and Singapore**.

**Fund I: AU$10M** raised in **2021**. Cheque size: **AU$150k–$250k**. Sector focus: **early-stage Australian technology** + **blockchain/crypto investment arm** based in Singapore.',
  why_work_with_us = 'For Australian early-stage technology founders at seed — Signal Ventures offers a focused $150k–$250k cheque with Melbourne base and Singapore blockchain/crypto-arm reach. Especially valuable for founders building tech-or-blockchain products with Asian regional ambition.',
  meta_title = 'Signal Ventures — Melbourne Seed VC + Singapore Blockchain Arm | $10M Fund (2021)',
  meta_description = 'Melbourne seed VC. AU$10M fund (2021). Early-stage AU tech. Blockchain/crypto arm in Singapore.',
  details = jsonb_build_object(
    'fund_i','AU$10M (2021)',
    'investment_thesis','Early-stage AU tech + blockchain/crypto (Singapore arm).',
    'check_size_note','AU$150k–$250k'
  ),
  updated_at = now()
WHERE name = 'Signal Ventures';

COMMIT;
