-- Enrich VCs — batch 07e (records 141-145: Uniseed → Virescent Ventures) — FINAL VC BATCH

BEGIN;

UPDATE investors SET
  basic_info = 'Uniseed is **Australia''s longest-running university venture capital fund** — multi-decade operating history across multiple Australian universities.

The firm partners with **Universities of Melbourne, Queensland, Sydney, UNSW and CSIRO** — making Uniseed the most extensive university-spinout VC platform in the country.

Track record: **70 startups, 12 exits** (notable exits include **Fibrotech, Spinifex, Hatchtech**). **Fund 3: AU$50M.**

Stage focus: **Seed**. Multi-city presence (Melbourne, Brisbane, Sydney).',
  why_work_with_us = 'For Australian university researchers, postdocs, spinout-founders and academic-aligned technology founders — Uniseed is **Australia''s longest-running and most extensive university VC fund** with formal partnerships across UoM, UQ, USyd, UNSW and CSIRO. Multi-decade operating history (70 startups, 12 exits) makes Uniseed the go-to capital partner for university-commercialisation founders.',
  meta_title = 'Uniseed — Australia''s Longest-Running University VC | UoM / UQ / USyd / UNSW / CSIRO Partnership',
  meta_description = 'AU''s longest-running university VC. UoM, UQ, USyd, UNSW, CSIRO partners. 70 startups, 12 exits. Fund 3 $50M.',
  details = jsonb_build_object(
    'distinction','Australia''s longest-running university VC fund',
    'partners', ARRAY['University of Melbourne','University of Queensland','University of Sydney','UNSW','CSIRO'],
    'track_record','70 start-ups; 12 exits (Fibrotech, Spinifex, Hatchtech among others)',
    'fund_3','AU$50M',
    'investment_thesis','University commercialisation across broad technology sectors — seed.'
  ),
  updated_at = now()
WHERE name = 'Uniseed';

UPDATE investors SET
  basic_info = 'Utiliti Ventures is an **Australia-based venture capital firm and ecosystem builder** that **bridges Australian tech startups to the US market**.

Stage focus: **Early stage to Series B**. Sector focus: high-growth technology.',
  why_work_with_us = 'For Australian high-growth technology founders pursuing **US market expansion** — Utiliti Ventures offers a structured AU-to-US bridge with both investment capital and ecosystem-building support.',
  meta_title = 'Utiliti Ventures — Australian VC + US Market Bridge | Early Stage to Series B',
  meta_description = 'Australian VC + ecosystem builder. AU-to-US tech bridge. Early stage to Series B.',
  details = jsonb_build_object(
    'investment_thesis','High-growth technology — AU-to-US bridge.'
  ),
  updated_at = now()
WHERE name = 'Utiliti Ventures';

UPDATE investors SET
  basic_info = 'Verona Capital is the **family office of Craig and Katrina Burton**. The firm is a **global multi-asset investor** operating across **PE, VC, public equities and quant strategies**.

Verona backs both **Australian and global VC funds** as an LP and makes **direct investments**.',
  why_work_with_us = 'For Australian and global founders or fund managers — Verona Capital offers structured multi-asset family-office capital with a notable LP commitment to AU and global VC funds (LP-style relationships) plus direct-investment capability. Especially valuable for founders pursuing structured family-office partnerships or fund managers raising LP capital.',
  meta_title = 'Verona Capital — Craig + Katrina Burton Family Office | Multi-Asset Global Investor',
  meta_description = 'Craig + Katrina Burton family office. Multi-asset global investor (PE, VC, equities, quant). LP + direct.',
  details = jsonb_build_object(
    'organisation_type','Family office (multi-asset)',
    'principals', ARRAY['Craig Burton','Katrina Burton'],
    'investment_thesis','Multi-asset — PE, VC, public equities, quant strategies; AU and global.'
  ),
  updated_at = now()
WHERE name = 'Verona Capital';

UPDATE investors SET
  basic_info = 'Victorian Clean Technology Fund (VCTF) is a **Victorian Government not-for-profit evergreen fund** investing in **novel clean technologies**.

The fund''s explicit thesis: **fill the gap between discovery and commercialisation** for clean-technology and renewable-energy ventures in Victoria.

**Track record: 30+ companies backed.** Initial investment: **up to AU$500K**. Stage focus: **early stage — pre-commercialisation to commercialisation**.',
  why_work_with_us = 'For Victorian-based clean-technology and renewable-energy founders at pre-commercialisation through commercialisation stages — Victorian Clean Technology Fund is the most-credentialed VIC-Government not-for-profit evergreen cleantech vehicle. Especially valuable for early-stage cleantech founders pursuing structured Government-aligned discovery-to-commercialisation capital.',
  meta_title = 'Victorian Clean Technology Fund (VCTF) — VIC Government Not-for-Profit Evergreen | up to $500K | 30+ Companies',
  meta_description = 'VIC Government not-for-profit evergreen fund. Novel clean tech. 30+ companies backed. Up to AU$500K initial.',
  details = jsonb_build_object(
    'organisation_type','VIC Government not-for-profit evergreen fund',
    'investment_thesis','Novel clean technologies — fill gap between discovery and commercialisation.',
    'check_size_note','Up to AU$500K initial',
    'portfolio_size','30+ companies backed'
  ),
  updated_at = now()
WHERE name = 'Victorian Clean Technology Fund (VCTF)';

UPDATE investors SET
  basic_info = 'Virescent Ventures is **Australia''s largest dedicated climate-tech venture capital firm** — born from **CEFC''s Clean Energy Innovation Fund** in **2022**.

**Fund I: AU$270M+ deployed across 37 Australian climate-tech investments.**

**Fund II**: targeting **AU$200M** — first close **AU$100M (October 2024)**, raised **AU$125M (November 2024)** with **QIC backing**.

Sector focus across **Clean Energy, Food/Agriculture, Circular Economy, Mobility and Hard-to-Abate Emissions**. Stage focus: **Pre-seed to Late stage** — meaning Virescent has the cheque flexibility to back climate founders from earliest concept through to growth/pre-IPO.',
  why_work_with_us = 'For Australian climate-tech founders across clean energy, food/agriculture, circular economy, mobility and hard-to-abate-emissions categories — Virescent Ventures is **Australia''s largest dedicated climate-tech VC** with AU$270M+ Fund I deployed across 37 investments and Fund II actively raising. Especially valuable for capital-intensive climate-tech founders pursuing structured pre-seed through late-stage capital.',
  meta_title = 'Virescent Ventures — Australia''s Largest Climate-Tech VC | Fund I $270M+ / 37 Investments | Fund II $125M',
  meta_description = 'AU''s largest climate-tech VC. Born from CEFC. Fund I $270M+ / 37 investments. Fund II $125M raised (Nov 2024) with QIC.',
  details = jsonb_build_object(
    'distinction','Australia''s largest dedicated climate-tech VC',
    'origin','Born from CEFC Clean Energy Innovation Fund (2022)',
    'fund_i','AU$270M+ deployed in 37 Australian investments',
    'fund_ii','Targeting AU$200M; first close AU$100M (Oct 2024); AU$125M raised (Nov 2024) with QIC backing',
    'investment_thesis','Climate tech — clean energy, food/agriculture, circular economy, mobility, hard-to-abate emissions; pre-seed to late stage.'
  ),
  updated_at = now()
WHERE name = 'Virescent Ventures';

COMMIT;
