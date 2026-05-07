-- Enrich VCs — batch 05a (records 81-85: Melt Ventures → Moelis Australia)

BEGIN;

UPDATE investors SET
  basic_info = 'Melt Ventures is a **Newcastle, NSW-based venture capital firm** focused on **hardware, IoT, cleantech, manufacturing, automation and robotics**.

The firm operates as an **ESVCLP** under the **Australian Advanced Manufacturing Seed Fund I** mandate — supporting hard-tech founders building physical products at **Pre-Seed and Seed** stages.

Newcastle positioning makes Melt one of the few credentialed regional-NSW-based hard-tech VCs.',
  why_work_with_us = 'For Australian hardware, IoT, cleantech, manufacturing, automation and robotics founders at pre-seed and seed — Melt Ventures offers ESVCLP-structured early-stage capital with explicit Advanced Manufacturing Seed Fund mandate. Especially valuable for hard-tech / physical-product founders pursuing structured Government-aligned commercialisation.',
  meta_title = 'Melt Ventures — Newcastle NSW Hardware / IoT / CleanTech VC | ESVCLP',
  meta_description = 'Newcastle hard-tech VC. Hardware, IoT, cleantech, manufacturing, automation, robotics. ESVCLP (Adv Manufacturing Seed Fund I).',
  details = jsonb_build_object(
    'organisation_type','ESVCLP — Australian Advanced Manufacturing Seed Fund I',
    'investment_thesis','Hardware, IoT, cleantech, manufacturing, automation, robotics — Pre-Seed and Seed.'
  ),
  updated_at = now()
WHERE name = 'Melt Ventures';

UPDATE investors SET
  basic_info = 'Metagrove Ventures is a **multi-continent pre-seed/seed venture capital firm** with offices in **Sydney, San Francisco and Singapore**.

The firm backs **ANZ, US and Southeast Asian startups** with sector-agnostic mandate — meaning Metagrove operates across the entire Pacific corridor for early-stage technology companies.',
  why_work_with_us = 'For Australian, New Zealand and Asia-Pacific founders pursuing **multi-continent expansion** — Metagrove Ventures offers Sydney/SF/Singapore offices providing structured cross-border deal-flow and post-investment scaling support. Especially valuable for ANZ founders pursuing US Series A or SE Asia regional expansion.',
  meta_title = 'Metagrove Ventures — Sydney / SF / Singapore Pre-Seed/Seed VC | ANZ + US + SE Asia',
  meta_description = 'Sydney / SF / Singapore pre-seed/seed VC. ANZ, US, SE Asia startups.',
  details = jsonb_build_object(
    'investment_thesis','Sector-agnostic technology — pre-seed and seed across ANZ, US, SE Asia.',
    'global_offices', ARRAY['Sydney','San Francisco','Singapore']
  ),
  updated_at = now()
WHERE name = 'Metagrove Ventures';

UPDATE investors SET
  basic_info = 'Microequities Venture Capital Fund is a **Sydney-based ESVCLP** operating since **2016** out of Governor Macquarie Tower. The fund manages **AU$25M** investing in **Australian technology startups at Series A**.

The fund is structured as a **joint venture between Equity Venture Partners (EVP) and Microequities Asset Management Group** — bringing together two of Australia''s most credentialed mid-cap and growth-tech investing platforms.

Cheque size: **AU$500k–$3M**. Plans up to **10 early-stage company investments**.

**Les Szekely** (covered in this directory as Sydney legendary angel and SiteMinder first investor) co-founded **Equity Venture Partners** with Howard Leibman — making this fund part of the broader EVP / Szekely platform.',
  why_work_with_us = 'For Australian Series A technology founders — Microequities Venture Capital Fund offers structured ESVCLP capital ($500k–$3M) backed by the EVP + Microequities joint venture, with Les Szekely + Howard Leibman operator pedigree.',
  meta_title = 'Microequities Venture Capital Fund — Sydney ESVCLP since 2016 | $25M | $500k–$3M | EVP/Microequities JV',
  meta_description = 'Sydney ESVCLP since 2016. AU$25M fund. Series A. AU$500k–$3M. EVP + Microequities JV.',
  details = jsonb_build_object(
    'organisation_type','ESVCLP joint venture',
    'founded',2016,
    'fund_size','AU$25M',
    'parents', ARRAY['Equity Venture Partners (EVP)','Microequities Asset Management Group'],
    'investment_thesis','Australian tech startups — Series A.',
    'check_size_note','AU$500k–$3M',
    'related_individuals', ARRAY['Les Szekely (legendary Sydney angel; EVP co-founder; SiteMinder first investor)','Howard Leibman (EVP co-founder)']
  ),
  updated_at = now()
WHERE name = 'Microequities Venture Capital Fund';

UPDATE investors SET
  basic_info = 'Mintelier Capital is an **Australian Series D+ / growth / pre-IPO focused fund**. Limited public information available beyond the directory listing.',
  why_work_with_us = 'For Australian late-stage growth and pre-IPO founders pursuing Series D+ rounds — Mintelier Capital offers a focused later-stage cheque. Best treated as a referral-led conversation given limited public information.',
  meta_title = 'Mintelier Capital — Australian Series D+ / Growth / Pre-IPO Fund',
  meta_description = 'Australian Series D+ / growth / pre-IPO fund. Limited public information.',
  details = jsonb_build_object(
    'investment_thesis','Series D+ / growth / pre-IPO Australian companies.',
    'unverified', ARRAY['Limited public information available.']
  ),
  updated_at = now()
WHERE name = 'Mintelier Capital';

UPDATE investors SET
  basic_info = 'Moelis Australia (MA Financial) Growth Capital Fund II is a **VCLP-registered growth-capital fund** based in Sydney (Level 27, 1 Farrer Place — Governor Phillip Tower). Now operates under **MA Financial Group**.

The fund provides **diversified private expansion capital for later-stage growth businesses** — bridging traditional VC and private-equity-style investing for established, revenue-generating Australian companies.',
  why_work_with_us = 'For Australian later-stage growth founders pursuing **diversified private expansion capital** — Moelis Australia (MA Financial) Growth Capital Fund II offers a VCLP-structured cheque from a major Australian financial-services group. Especially valuable for growth-stage businesses pursuing structured expansion-capital partnerships.',
  meta_title = 'Moelis Australia Growth Capital Fund II — VCLP | Sydney | Diversified Growth Capital',
  meta_description = 'Sydney VCLP-registered growth-capital fund. MA Financial Group. Later-stage growth-business expansion capital.',
  details = jsonb_build_object(
    'organisation_type','VCLP-registered growth-capital fund',
    'parent','MA Financial Group (formerly Moelis Australia)',
    'investment_thesis','Diversified private expansion capital for later-stage growth businesses.'
  ),
  updated_at = now()
WHERE name = 'Moelis Australia (MA Financial) Growth Capital Fund II';

COMMIT;
