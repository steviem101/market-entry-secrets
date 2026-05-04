-- Enrich VCs — batch 03d (records 56-60: Grok Ventures → Inhouse Ventures)

BEGIN;

UPDATE investors SET
  basic_info = 'Grok Ventures is the **private investment company of Mike Cannon-Brookes** — Atlassian Co-Founder & Co-CEO and one of Australia''s most prominent tech entrepreneurs.

The firm backs **fast-growing technology-enabled businesses** across **early to late stage** — and is one of the most active private climate-tech and clean-energy investors in Australia.

**Major positions / activity** (per public reporting):
- Significant stake-holding in **AGL Energy** (used to push for accelerated coal-plant retirement)
- **Sun Cable** (Australia–Singapore solar export project; led 2023 acquisition out of administration)
- **Tesla** (well-publicised Powerwall/grid partnerships in South Australia)
- Plus broad climate-tech and software portfolio

Mike Cannon-Brookes is also covered as an angel investor in this directory.',
  why_work_with_us = 'For Australian climate-tech, clean-energy, grid, deep-tech and software founders — Grok Ventures is one of the largest and most ambitious private capital pools in the country. Mike Cannon-Brookes personally backs founders directly and through Grok across stages. Particularly transformational for energy-transition founders given his Sun Cable and AGL track record.',
  meta_title = 'Grok Ventures — Mike Cannon-Brookes Family Office | Sydney | Climate / Energy / Tech',
  meta_description = 'Sydney Mike Cannon-Brookes (Atlassian Co-CEO) family office. Climate-tech, clean energy, software. Sun Cable, AGL.',
  details = jsonb_build_object(
    'organisation_type','Private investment company / family office',
    'principal','Mike Cannon-Brookes (Atlassian Co-Founder & Co-CEO)',
    'investment_thesis','Fast-growing technology-enabled businesses — early to late stage; major climate-tech and clean-energy bias.',
    'highlight_positions', jsonb_build_array(
      jsonb_build_object('company','Sun Cable','context','Led 2023 acquisition out of administration; Australia-Singapore solar export'),
      jsonb_build_object('company','AGL Energy','context','Significant stakeholder; pushed for accelerated coal-plant retirement'),
      jsonb_build_object('company','Atlassian','context','Co-Founder, Co-CEO; NASDAQ: TEAM')
    )
  ),
  updated_at = now()
WHERE name = 'Grok Ventures';

UPDATE investors SET
  basic_info = 'IDG Capital is a **global venture capital firm with offices across USA, China and ANZ**. Headquartered in **Boston, USA**, with strong China presence and active Australian deal-flow participation.

The firm invests in **early to late-stage technology companies** across categories — and has co-invested in Australian deals (e.g. **Party Icons** Series A, October 2024).

IDG Capital is one of the largest and most-established global tech VCs with multi-decade track record.',
  why_work_with_us = 'For Australian tech founders pursuing **US or China-market expansion** — IDG Capital offers global multi-continent VC reach with active Australian deal-flow participation. Especially valuable for cross-border founders with global ambition.',
  meta_title = 'IDG Capital — Global VC | Boston/USA + China + ANZ | Early to Late Stage',
  meta_description = 'Global VC with offices in USA, China, ANZ. Boston-headquartered. Tech early to late stage. Co-invested in AU deals.',
  details = jsonb_build_object(
    'organisation_type','Global venture capital firm',
    'investment_thesis','Technology — early to late stage; multi-continent.',
    'global_offices', ARRAY['USA (Boston)','China','Australia/NZ'],
    'highlight_investments', jsonb_build_array(
      jsonb_build_object('company','Party Icons','context','Series A Oct 2024 (AU)')
    )
  ),
  updated_at = now()
WHERE name = 'IDG Capital';

UPDATE investors SET
  basic_info = 'Impact Investment Fund is an **Australian impact advisory and fund manager** focused on **social and environmental impact investing**. Limited additional public information available.',
  why_work_with_us = 'For Australian founders pursuing **social or environmental impact** investments — Impact Investment Fund offers structured impact-aligned advisory and fund-management services. Best treated as a referral-led conversation given limited public investor profile.',
  meta_title = 'Impact Investment Fund — Australian Impact Advisory & Fund Manager',
  meta_description = 'Australian impact advisory and fund manager. Social and environmental impact investing.',
  details = jsonb_build_object(
    'organisation_type','Impact advisory and fund manager',
    'investment_thesis','Social and environmental impact investing.',
    'unverified', ARRAY['Limited public information available.']
  ),
  updated_at = now()
WHERE name = 'Impact Investment Fund';

UPDATE investors SET
  basic_info = 'In-Q-Tel Australia is the **Australian arm of In-Q-Tel** — a **US-based CIA-linked not-for-profit venture capital firm** that invests in **strategic technologies** for national-security and intelligence applications.

Headquartered in **Arlington, Virginia, USA** with global investment activity. Now active in Australia as part of allied-nation strategic-tech investment expansion.

The firm has **50+ unicorn companies in its global portfolio** across **Space, Biotech, Microelectronics, Energy and Cybersecurity** sectors. Stage focus: **early through late**.',
  why_work_with_us = 'For Australian deep-tech founders building strategic-technology products — particularly in **Space, Biotech, Microelectronics, Energy, Cybersecurity** and adjacent dual-use categories — In-Q-Tel Australia offers a unique strategic-investor cheque from a CIA-linked allied-nation programme. Especially valuable for founders building products with allied-nation national-security commercial applications.',
  meta_title = 'In-Q-Tel Australia — US CIA-Linked Strategic-Tech VC | 50+ Unicorns | Allied-Nation',
  meta_description = 'US-based CIA-linked NPO strategic-tech VC. 50+ unicorns. Space, Biotech, Microelectronics, Energy, Cybersecurity.',
  details = jsonb_build_object(
    'organisation_type','US CIA-linked not-for-profit venture capital — Australian allied-nation arm',
    'headquarters','Arlington, VA, USA',
    'investment_thesis','Strategic technologies — Space, Biotech, Microelectronics, Energy, Cybersecurity.',
    'global_portfolio','50+ unicorn companies'
  ),
  updated_at = now()
WHERE name = 'In-Q-Tel Australia';

UPDATE investors SET
  basic_info = 'Inhouse Ventures is a **startup platform / matchmaker** connecting founders with venture capitalists.

**IMPORTANT:** Inhouse Ventures is **NOT a traditional VC fund** — the platform does **NOT make direct investments**. It operates as a **founder-investor matchmaking service**.',
  why_work_with_us = 'For Australian founders looking for structured introductions to venture capitalists — Inhouse Ventures offers a matchmaking platform. **Note**: Inhouse does not make direct investments; engagement is for VC introduction services rather than receiving cheques.',
  meta_title = 'Inhouse Ventures — Australian Founder-VC Matchmaker | NOT a Direct Investor',
  meta_description = 'Australian startup platform matchmaker connecting founders with VCs. NOT a direct VC fund.',
  details = jsonb_build_object(
    'organisation_type','Startup platform / matchmaker',
    'is_direct_investor',false,
    'note','Inhouse Ventures connects founders with VCs rather than making direct investments.'
  ),
  updated_at = now()
WHERE name = 'Inhouse Ventures';

COMMIT;
