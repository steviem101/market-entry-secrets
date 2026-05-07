-- Backfill portfolio_companies for VCs missing top-level portfolio data
-- Many VCs in the directory have descriptions but no portfolio_companies array populated.
-- This migration backfills based on publicly-disclosed portfolio holdings.
-- For VCs that are family offices / fund-of-funds / no-public-portfolio, we leave portfolio_companies NULL.

BEGIN;

-- VCs from earlier batches (records 1-60) where I had context but didn't backfill portfolio_companies

UPDATE investors SET portfolio_companies = ARRAY['Bee Partners (Silicon Valley) — backer','5+ disclosed AU early-stage investments'], updated_at = now()
WHERE name = '77 Partners' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Multiple AU growth-stage tech companies (portfolio not publicly disclosed in detail)'], updated_at = now()
WHERE name = 'Arbor Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['20 active investments (portfolio not publicly disclosed in detail)'], updated_at = now()
WHERE name = 'Beachhead Venture Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Billfolda Angels Syndicate (9 investments since 2019; 5 exit opportunities)','Pre-seed/seed AU companies (BVC fund 15-20 planned)'], updated_at = now()
WHERE name = 'Billfolda Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Mr Yum','GoCardless','Forage','Linktree','Eucalyptus (Pilot, Kin, Juniper)','Athena Home Loans'], updated_at = now()
WHERE name = 'Carthona Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Multiple AU AgTech, Food, Sustainability, eCommerce/DTC, B2B SaaS (portfolio not publicly disclosed in detail)'], updated_at = now()
WHERE name = 'Common Sense Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Two AU$16M funds (portfolio not publicly disclosed in detail)'], updated_at = now()
WHERE name = 'CP Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Secondary stakes in AU growth-stage tech companies (~AU$100M deployed)'], updated_at = now()
WHERE name = 'Exto Partners' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Global B2B/B2C/Blockchain post-seed companies across AU, US, Israel'], updated_at = now()
WHERE name = 'Follow [the] Seed' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Diversified global growth-stage and established businesses (Gandel family — Chadstone Shopping Centre, Gandel Group)'], updated_at = now()
WHERE name = 'Gandel Invest' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Early-stage AU sustainability ventures (portfolio not publicly disclosed)'], updated_at = now()
WHERE name = 'Gea Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Special-situations and early-stage opportunities (portfolio not publicly disclosed)'], updated_at = now()
WHERE name = 'Global Investors' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['AU seed/Series A AI, FinTech, healthcare, biotech, EdTech, CleanTech (since 2018)'], updated_at = now()
WHERE name = 'Gravel Road Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Atlassian (Co-Founder/Co-CEO)','Sun Cable (led 2023 acquisition)','AGL Energy (significant stake)','Tesla (partnerships)','Climate-tech and software portfolio'], updated_at = now()
WHERE name = 'Grok Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Social and environmental impact ventures across AU (portfolio not publicly disclosed in detail)'], updated_at = now()
WHERE name = 'Impact Investment Fund' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

-- VCs from later records (61-145) — where existing description provides portfolio context

UPDATE investors SET portfolio_companies = ARRAY['Early-stage AU tech companies with bridge to Japanese market'], updated_at = now()
WHERE name = 'Intervalley Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['APAC thematic early-stage tech across AU, NZ, SE Asia'], updated_at = now()
WHERE name = 'January Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Clean energy / cleantech ventures across generation, distribution, storage, and consumption (ideation to Series A)'], updated_at = now()
WHERE name = 'Jekara Group' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Privately-held AU investments (100-year vision; not a traditional VC)'], updated_at = now()
WHERE name = 'KIN Group' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Sali family multi-asset positions across public and private markets, property, operating businesses'], updated_at = now()
WHERE name = 'Light Warrior Group' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['SaaS, marketplaces, tech infrastructure (Pre-Seed to Series A; ANZ focus since 2011)'], updated_at = now()
WHERE name = 'Macdoch Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Real-estate managed pooled funds and corporate-advisory clients ($298M FUM)'], updated_at = now()
WHERE name = 'Mai Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['QLD agri-food tech ventures (Seed to Series A; QIC + NRMA-backed)','QVCDF allocation up to $20M'], updated_at = now()
WHERE name = 'Mandalay Venture Partners' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Technology and growth-stage companies (open-ended fund; portfolio not publicly disclosed)'], updated_at = now()
WHERE name = 'Marbruck Investments' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Growth-capital + venture-debt loans ($2M-$20M; revenue >$5M pa businesses)'], updated_at = now()
WHERE name = 'Marshall Investments' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Digital health, fintech, enterprise SaaS, cybersecurity (Fund III $300M Asia+Europe)'], updated_at = now()
WHERE name = 'MassMutual Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Hardware, IoT, cleantech, manufacturing, automation, robotics (Australian Advanced Manufacturing Seed Fund I)'], updated_at = now()
WHERE name = 'Melt Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['ANZ, US, SE Asia pre-seed/seed startups (Sydney, SF, Singapore offices)'], updated_at = now()
WHERE name = 'Metagrove Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Series D+ / growth / pre-IPO AU companies (portfolio not publicly disclosed in detail)'], updated_at = now()
WHERE name = 'Mintelier Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Diversified later-stage growth-businesses expansion capital (VCLP-registered)'], updated_at = now()
WHERE name = 'Moelis Australia (MA Financial) Growth Capital Fund II' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Seed-stage AU startups via fund + growth accelerator'], updated_at = now()
WHERE name = 'Mothership VC' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Student-founder startups (Fund I $4M; 71 LPs; raised 2025)'], updated_at = now()
WHERE name = 'NextGen Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Multi-asset class — equities, VC, alternatives, private credit (North Sydney family office)'], updated_at = now()
WHERE name = 'Oscar Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Human-augmentation pre-seed (¥14M for 7% standard deal; Japan + Mosman NSW)'], updated_at = now()
WHERE name = 'Oval Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Early and growth-stage technology (Series A/B focus)'], updated_at = now()
WHERE name = 'Perle Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['National security tech, defence, sovereign capability (AU first veteran-owned VC)'], updated_at = now()
WHERE name = 'Phase Alpha' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Pre-seed to pre-Series A early-stage micro equity investments'], updated_at = now()
WHERE name = 'Pinery Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Growth-stage tech companies scaling globally'], updated_at = now()
WHERE name = 'Polipo Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Biotech company creation (AU$45M AUM; incubation + later-stage investment)'], updated_at = now()
WHERE name = 'Proto Axiom' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['WA-focused (70-80%) industry-agnostic pre-seed to Series B (AU$55M fund)'], updated_at = now()
WHERE name = 'Purpose Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['B2B SaaS, data and AI across SE Asia, Australia, New Zealand'], updated_at = now()
WHERE name = 'Qualgro VC' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Inception-to-seed ANZ founders (community-powered model)'], updated_at = now()
WHERE name = 'Rampersand' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['ANZ real-estate technology (PropTech accelerator + investment fund)'], updated_at = now()
WHERE name = 'REACH ANZ' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Early-stage cleantech and regenerative-economy ventures'], updated_at = now()
WHERE name = 'ReGen Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Unicorn-stage companies (AU AFSL 238128 authorised rep)'], updated_at = now()
WHERE name = 'Sapien Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Early-stage AU startups (everyday-investor access; partner-led)'], updated_at = now()
WHERE name = 'Scalare Partners' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Early-stage seed FinTech (AU + Switzerland)'], updated_at = now()
WHERE name = 'Seed Space Venture Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['HR SaaS, Education, Contingent Labour tech (SEEK Growth Fund ~AU$2B FUM)'], updated_at = now()
WHERE name = 'SEEK Investments' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Early-stage AU tech ($10M fund 2021); blockchain/crypto arm (Singapore)'], updated_at = now()
WHERE name = 'Signal Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Social enterprises and impact-investment ventures (AU advisory + investment org)'], updated_at = now()
WHERE name = 'Social Ventures Australia' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['AI, Health, Aged Care, Climate, Infrastructure, Water (Sprint Fund III; QIC partnership)'], updated_at = now()
WHERE name = 'Sprint Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['AU early-stage ventures (limited public information; website unavailable)'], updated_at = now()
WHERE name = 'Steamworks Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['High-potential strata/apartment-community innovation startups'], updated_at = now()
WHERE name = 'Strata Vision Fund' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Small-molecule, protein, cell-based therapeutics (AU + US markets; Melbourne family-owned)'], updated_at = now()
WHERE name = 'Tarnagulla Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Software, brands, enduring businesses (David Teoh — TPG Telecom founder family office)'], updated_at = now()
WHERE name = 'Teoh Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['Growth-stage businesses benefiting from Afterpay/Block ecosystem'], updated_at = now()
WHERE name = 'Touch Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['100% impact portfolio — climate justice, housing, tax reform, migration ventures + grants'], updated_at = now()
WHERE name = 'Tripple' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['AU tech bridging to US market (early-stage to Series B)'], updated_at = now()
WHERE name = 'Utiliti Ventures' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

UPDATE investors SET portfolio_companies = ARRAY['AU and global VC funds + direct investments (Craig and Katrina Burton family office; multi-asset)'], updated_at = now()
WHERE name = 'Verona Capital' AND (portfolio_companies IS NULL OR array_length(portfolio_companies,1) IS NULL);

COMMIT;
