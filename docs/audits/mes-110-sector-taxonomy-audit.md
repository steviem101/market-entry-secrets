# MES-110 — Sector Taxonomy Audit (Phase A)

**Date:** 2026-07-07 · **Branch:** `claude/sector-taxonomy-audit-gjs2ro` · **Status:** audit for review — no data has been written; all Supabase access was SELECT-only.

This is the Phase A deliverable for MES-110: a full inventory of every sector surface on the platform, duplicate-cluster analysis, match-failure analysis, complete merge-mapping tables against the pinned LinkedIn industry-codes table (147 entries), and a proposed Phase B plan. **It stops here for review — one decision (§2) must be made before any implementation.**

## Contents

1. [Executive summary](#1-executive-summary)
2. [⚠️ Decision required: pinned legacy 147 codes vs the already-shipped V2 taxonomy](#2-decision-required)
3. [Sector surface inventory](#3-sector-surface-inventory)
4. [Tag coverage gaps (the biggest matching problem is missing tags, not wording)](#4-tag-coverage-gaps)
5. [Duplicate-cluster analysis](#5-duplicate-cluster-analysis)
6. [Match-failure analysis](#6-match-failure-analysis)
7. [Merge mapping tables (deliverables)](#7-merge-mapping-tables)
8. [Canonical source-of-truth design](#8-canonical-source-of-truth-design)
9. [Phase B implementation plan](#9-phase-b-implementation-plan)
10. [Method and verification](#10-method-and-verification)

---

## 1. Executive summary

- **1,386 mapping rows** covering **every distinct sector value on every surface** were produced (16 DB columns + 5 code/constant surfaces), each mapped to a merged cluster label and its closest pinned LinkedIn industry code. Coverage is **verified bit-for-bit** against the live DB via per-surface md5 checksums (§10).
- **The ticket's premise needs updating.** The platform is not "partially adopted LinkedIn taxonomy on free-grown values" — a substantial LinkedIn standardisation already shipped (April–June 2026), but on **LinkedIn's V2 taxonomy** (20 sectors → 152 industry groups), which the ticket explicitly pins *against*. The intake forms, the `linkedin_industries` DB table (289 rows), a DB validation trigger, `legacy_industry_mapping` (172 rows), `sector_vocabulary` (40 rows), canonical `sector_tags` slug arrays on 8 content tables, and the entire report-matching engine all run on V2. **§2 frames the decision; a recommendation is given.**
- The worst drift lives in five places: `investors.sector_focus` (**610 distinct free-text values** across 461 rows, including 30 corrupted comma-split fragments like `"AI)"`), `events.sector`/`events.category` (75/80 free-text values over 202 rows, near-duplicated across two columns), `content_company_profiles.industry` (83 values / 102 rows), `country_case_studies.sector` (46/59), and `trade_investment_agencies.sectors_supported` (30 values with casing/snake_case dupes).
- **Matching breaks in two distinct ways** (§6): (a) wording drift — including seven of the report form's *own quick-pick chips* that silently contribute zero to matching; and (b) **missing tags** — 108/202 events (53 %) and 45/169 innovation orgs are entirely invisible to the report matcher, and all 95 service providers carry no sector data at all (every provider is `sector_agnostic`).
- Directory sector filters are derived from raw row values at runtime, so every duplicate becomes a separate dropdown option and splits results (the Investors dropdown draws from 610 values).
- No form or DB constraint prevents recurrence: intake v2 accepts free-text custom industries, all submission forms are free-text, and only `user_intake_forms` has (partial) DB-level validation.

## 2. Decision required

**The pinned canonical list conflicts with what production already runs on.**

The ticket pins the *legacy* LinkedIn industry-codes table (147 entries, stable numeric codes — reproduced verbatim at [`mes-110/linkedin-industry-codes-147.csv`](mes-110/linkedin-industry-codes-147.csv)) and says "do not substitute LinkedIn's V2 taxonomy". But the repo and database standardised on **V2** months ago:

| Already-shipped V2 asset | Where | Scale |
|---|---|---|
| `LINKEDIN_SECTORS` / `LINKEDIN_TAXONOMY` / `INDUSTRY_GROUP_OPTIONS` | `src/constants/linkedinTaxonomy.ts` | 20 sectors × 152 groups; consumed by intake v1+v2 and `IndustrySelect` |
| `linkedin_industries` table | Supabase | 289 rows (sector / industry_group / sub_industry, slugs, `is_active`) — **no numeric codes** |
| `validate_industry_sector_values` trigger | DB (baseline migration) | validates `user_intake_forms.industry_sector` against `linkedin_industries.industry_group` + `legacy_industry_mapping.legacy_value` |
| `legacy_industry_mapping` | Supabase | 172 rows old value → V2 group/sector; drove a one-time backfill of events/lead_databases/content_items/investors |
| `sector_tags` slug arrays + `sector_agnostic` flags | 8 content tables | fully canonical on the 20 V2 sector slugs (verified — zero drift in `sector_tags`) |
| `sector_vocabulary` | Supabase | 40 rows mapping raw thematic labels (fintech, agritech, defence…) → V2 sector slugs |
| Report matcher | `supabase/functions/generate-report/sectorTaxonomy.ts` | rolls intake groups up to V2 sector slugs; matches `sector_tags.ov.{slug}` |

The legacy 147 table is *flatter but more granular* than V2's 20 sectors, and several V2 umbrellas have **no legacy-147 equivalent**: generic *Manufacturing*, *Professional Services*, *Technology, Information and Media*, *Holding Companies*, *Administrative and Support Services*. Mapping the shipped `sector_tags` backbone onto 147 codes is therefore lossy in exactly the places the matcher depends on (see `mes-110/mapping-form-constants-and-sector-slugs.csv`, "sector_tags slug" rows).

**Options:**

- **Option A — adopt the pinned 147 codes as the platform spine (ticket as written).** Replace the V2 hierarchy everywhere: forms present 147 options, `sector_tags` re-tagged to 147-code slugs, matcher and trigger rewritten. *Cost:* re-migrates every canonical surface that is already clean, discards the working 152-group intake UX and the group→sector rollup that powers overlap scoring, and forces awkward mappings for the five umbrella concepts above. Highest churn, highest mislabel risk, no user-visible gain over Option B.
- **Option B (recommended) — keep the V2 spine; add the 147 codes as a stable-ID crosswalk.** Create the `sectors` reference table keyed by the pinned numeric `code` (147 rows, `description` verbatim) with crosswalk columns `v2_industry_group` / `v2_sector_slug` (complete mapping already produced: [`mes-110/mapping-v2-industry-groups-to-147.csv`](mes-110/mapping-v2-industry-groups-to-147.csv), all 152 groups). All *dirty* surfaces (§3, group C) are remapped onto the existing canonical V2 vocabulary; the 147 code becomes the stable external identifier MES-108 and operators can key on. Satisfies "one canonical source of truth, stable numeric codes, LinkedIn descriptions verbatim" while not regressing shipped work.
- **Option C — 147 codes for raw *display* columns only.** Remap free-text columns to 147 descriptions but leave `sector_tags`/matching on V2. Two live vocabularies forever; rejected as it re-creates the split this ticket exists to close.

Everything below is decision-neutral: the inventory, clusters, and match failures are facts; the mapping tables give **both** the merged cluster label and the 147 code for every value, so either option can be executed from them. Phase B step order (§9) is written for Option B and notes what changes under Option A.

## 3. Sector surface inventory

Full per-value inventories with row counts are in the CSVs (§7). Summary:

### A. Forms (what a user can select or type)

| Surface | File | Options source | Stored to | State |
|---|---|---|---|---|
| Sign-up / onboarding | `src/components/auth/OnboardingDialog.tsx` | — | profile | **No sector field at all** (country / target market / use-case only) |
| Report intake v1 | `src/components/report-creator/intakeSchema.ts:47-49` + `IndustrySelect` | `INDUSTRY_GROUP_OPTIONS` (152 V2 groups) | `user_intake_forms.industry_sector[]` | Canonical list, multi-select |
| Report intake v2 Step 1 (shipping) | `src/components/report-creator/v2/Step1Company.tsx:261-322` | 24 curated chips (`rcData.ts:69-79`) + search over the 152 + **free-text custom** | `user_intake_forms.industry_sector[]` (max 3) | 10 of 24 chips don't string-match the canonical list; free text unconstrained |
| Report intake v2 Step 3 | `v2/Step3Details.tsx:123-169` | same chips/search + free text (max 5) | `user_intake_forms.end_buyer_industries[]` | same problems |
| Submission forms (case study, content, guide, data request) | `src/components/directory-submissions/*FormFields.tsx` | **free text** | `directory_submissions.form_data` | No option list anywhere |
| Mentor / provider / agency / investor / event submissions | `directory-submissions/` | — | `form_data` | No sector field |
| Partner page | `src/pages/PartnerWithUs.tsx:52-124` | bespoke 7-value service categories | none (no submit handler) | Not a sector taxonomy; cosmetic only |

### B. Code constants

| Constant | File | Contents |
|---|---|---|
| `LINKEDIN_SECTORS` / `LINKEDIN_TAXONOMY` / `INDUSTRY_GROUP_OPTIONS` | `src/constants/linkedinTaxonomy.ts` | canonical V2: 20 sectors / 152 groups |
| `TOP_INDUSTRIES` + `MORE_INDUSTRIES` | `src/components/report-creator/v2/rcData.ts:69-79` | 24 quick-pick chips; 10 deviate from canonical wording |
| `SECTOR_SLUG_MAP` (11 broad names) | `src/constants/sectorTaxonomy.ts:16-53` | lead-database display meta |
| `SECTOR_MAPPINGS` (fintech/medtech/telecoms) | `src/config/sectors.ts:17-60` | legacy 3-sector config |
| Edge mirror + alias regexes | `supabase/functions/generate-report/sectorTaxonomy.ts` | group→slug map + 31 free-text alias patterns |
| `SECTOR_RULES` / `STANDARD_SECTORS` | `src/utils/sectorMapping.ts` | keyword→V2-sector mapper; unknowns default to `'Professional Services'` |

### C. Database columns

| Column | Distinct values | Rows | State |
|---|---|---|---|
| `investors.sector_focus[]` | **610** | 461 | Worst surface; free text incl. 30 corrupted comma-split fragments |
| `events.category` | 80 | 202 | Free text; near-duplicate of `events.sector` |
| `events.sector` | 75 | 202 | Free text + 6 post-migration V2 values |
| `content_company_profiles.industry` | 83 | 102 | Free-text company descriptors |
| `country_case_studies.sector` | 46 | 59 | Free-text product descriptors |
| `user_intake_forms.industry_sector[]` | 59 | 98 | ~60 % canonical groups, ~40 % free-text custom |
| `user_intake_forms.end_buyer_industries[]` | 41 | 98 | Mixed canonical/legacy-147/free-text — incl. `Staffing & Recruiting` *and* `Staffing and Recruiting` |
| `locations.key_industries[]` | 36 | 23 | Curated display list |
| `innovation_ecosystem.sectors[]` | 35 | 169 | Thematic labels + casing dupes + audience labels misfiled as sectors |
| `trade_investment_agencies.sectors_supported[]` | 30 | 134 | Casing + snake_case dupes |
| `lead_databases.sector` | 26 | 65 | Mostly V2 names + `Cross-Industry` (23 rows) |
| `countries.key_industries[]` | 20 | 8 | Curated |
| `industry_sectors.industries[]` | 15 | 3 | Sector-page display |
| `leads.industry` / `leads.category` | 7 / 7 | 7 | Duplicated pair, casing drift |
| `lead_submissions.sector` | 2 | 2 | Free text |
| `lead_database_records.sector` | 0 | 325 | **Entirely NULL** |
| `sector_tags[]` on 8 tables | 19 V2 slugs | — | **Clean** (see `mes-110/inventory-sector-tags.csv`) — but coverage gaps, §4 |
| `community_members.specialties[]` | 104 | 134 | Expertise/persona tags, **not** sectors — out of scope for remapping; only `sector_tags` should carry mentor sector |

Matching code paths (traced, file:line cited in §6): `generate-report` overlap matcher + scorer, semantic RAG path, `generate-plan` (persona-filtered, sector only in prompt), `useSector*` hooks (keyword arrays on `industry_sectors`), `useMasterSearch` (`lead_databases.sector ilike` only), directory filter modules (`investorFilters.ts`, `leadFilters.ts`, `agencyFilters.ts`, `mentorFilters.ts`, Events/CaseStudies pages).

## 4. Tag coverage gaps

The report matcher (`generate-report/index.ts:1183-1194`) reaches rows via `sector_tags.ov.{slug}` OR `sector_agnostic = true` (plus service/location clauses). Rows with **no tags and no agnostic flag are unreachable by sector**; rows flagged agnostic match *every* sector indiscriminately. Live counts (2026-07-07):

| Table | Rows | Empty `sector_tags` | `sector_agnostic` | **Invisible to sector matching** |
|---|---|---|---|---|
| `service_providers` | 95 | **95 (100 %)** | 95 (100 %) | 0 — but sector selection has *zero* effect on provider matching; specialist scoring never fires |
| `events` | 202 | 112 | 6 | **108 (53 %)** |
| `innovation_ecosystem` | 169 | 78 | 45 | **45 (27 %)** |
| `investors` | 461 | 48 | 94 | 14 |
| `trade_investment_agencies` | 134 | 86 | 117 | 0 (but 87 % agnostic → sector filter near-meaningless) |
| `community_members` | 134 | 11 | **125 (93 %)** | 0 (ditto) |
| `content_items` | 152 | 81 | 81 | 0 |

This is as important as the wording drift: merging duplicates fixes the *filter options*, but reports will keep recommending the same agnostic rows until the tagging backfill (Phase B step 4) closes these gaps.

## 5. Duplicate-cluster analysis

1,386 raw values collapse to **214 merged cluster labels**. Representative clusters (full detail in the CSVs — every row carries its `merged_value`):

| Cluster | Variants found (surface count in brackets) |
|---|---|
| **FinTech** | `FinTech` (83 investors), `Fintech` (23), `fintech` (2 investors + 2 agencies), `Financial Technology` (2+1), `Fintech & Financial Services` (3+3 events), `Fintech / Payments`, `Consumer Fintech`, `fintech)` ← fragment, `Banking Tech`, `Payments`, `BNPL`, `Open Banking`… |
| **CleanTech** | `Cleantech`/`CleanTech`/`cleantech`/`Clean Tech`/`Clean technology`/`CleanEnergy`/`Climate Tech`/`ClimateTech`/`Climate tech`/`climate tech`/`climate`/`climate.`/`Renewables`/`Renewable Energy`/`Renewable energy`/`Energy Transition`/`Decarbonization`/`decarbonisation`/`NetZero`/`GreenTech`/`EcoTech`… (30+ variants across 5 surfaces) |
| **AgTech** | `Agritech`(3 surfaces)/`agritech`/`Agtech`/`agtech`/`AgTech`/`AgriTech`/`Agri-food tech`/`Agrifood`/`agrifood`/`Agricultural technology`; plus `Agriculture`/`agriculture`/`Agribusiness`/`Agriculture & Agribusiness`/`Agriculture & Farming`/`Farming` |
| **Deep Tech** | `Deep Tech`/`Deeptech`/`deeptech`/`Deep tech`/`DeepTech`/`Frontier Tech`/`FrontierTech`/`Hard Tech`/`Quantum` — across investors, innovation, agencies, events |
| **HealthTech** | `HealthTech`/`Healthtech`/`healthtech`/`Health Tech`/`Healthcare Technology`/`Digital Health`/`Digital health`/`Telehealth`/`health IT`/`Health IT & Digital Health` |
| **Manufacturing** | `Manufacturing`/`manufacturing`(agencies)/`Manufacturing & Industry`/`Manufacturing & Engineering`/`Advanced Manufacturing`/`Advanced manufacturing` |
| **& vs and** | `Staffing & Recruiting` vs `Staffing and Recruiting` — both live in `user_intake_forms.end_buyer_industries` at 4 rows each; `Architecture & Planning` (chip) vs `Architecture and Planning` (canonical); `Data Infrastructure & Analytics` vs `Data Infrastructure and Analytics`; `IT Services & Consulting` vs `IT Services and IT Consulting` |
| **Agnostic** | `Sector Agnostic`(2 surfaces)/`sector agnostic`/`all`/`All Sectors`/`Generalist`/`Agnostic`/`Cross-Industry`(23 lead DBs)/`Diversified…`(4 forms)/`Technology (agnostic)` — 19 values that should be the `sector_agnostic` boolean, not a sector |
| **Events finance split** | `Financial Services`, `Fintech & Financial Services`, `Superannuation & Financial Services`, `Accounting & Finance`, `Mortgage & Finance`, `Finance`, `Investing & Capital`, `Venture Capital & Investment`, `Startups & Venture Capital` — nine finance-flavoured options in one 202-row table |
| **US/UK spelling** | `Defence`/`defence`/`Defense & Space`/`DefenceTech)` |

Beyond wording variants, three *category errors* recur and are flagged per-row in the CSVs: **audience labels stored as sectors** (`women`, `Black and Women of Colour`, `Female Founders`, `LGBTQIA+ Founders` — 16 values), **investment-thesis/stage labels** (`Impact`, `ESG`, `Pre-seed`, `Growth Stage` — 31 values), and **corrupted comma-split fragments** in `investors.sector_focus` (30 values such as `AI)`, `cleantech)`, `Agnostic (healthcare`, `early stage)` — clearly one original list split on embedded commas during import).

## 6. Match-failure analysis

Concrete, code-cited failures a user hits today:

1. **The form's own suggestions silently break report matching.** Intake v2 quick-pick chips (`rcData.ts:69-79`) are stored verbatim; the matcher resolves them via exact group lookup then alias regexes (`generate-report/sectorTaxonomy.ts:111-123`, `67-98`). Seven of 24 chips match *neither*: **`Financial Services`, `Biotechnology Research`, `Medical Devices`, `Architecture & Planning`, `Agriculture`, `Education`, `Pharmaceuticals`** (e.g. `\bpharma\b` can't match inside "Pharmaceuticals"; `\bmedical device\b` fails on the plural; bare "Agriculture" isn't in the agritech alias). A founder who picks only `Medical Devices` — a suggested chip — gets `allSectors = []`, every sector-overlap score is 0, and the report falls back to agnostic + location rows (the historical "same agnostic-Sydney rows" bug the alias map was added to fix). `IT Services & Consulting` half-fails: rescued by the `consult*` alias into `professional-services` but loses its tech-sector signal.
2. **Free-typed industries drop the same way.** From live intake data (59 distinct values): `Software as a Service` (6 uses), `Recruitment Technology` (4), `Market Research` (2), `Credit Bureau` (3), `Biometrics` (2), `Decision Intelligence` (2), `HR Tech`, `Human Resources`, `Identity Management`, `Identity Verification`, `Software`, `Automation Software` all resolve to zero sector slugs. `Financial Services` — typed by 2 users and also present 25× in `end_buyer_industries` (`Financial Services`+`financial services`+`finance`) — contributes nothing because it is a V2 *sector* name and the lookup keys are *groups*.
3. **53 % of events can never sector-match** (§4: 108/202 rows have no `sector_tags` and aren't agnostic). A Mining-sector report's "events" section draws from the 11 tagged mining events at best; the rest of the calendar is invisible regardless of wording.
4. **Provider matching ignores sector entirely.** All 95 `service_providers` rows are untagged + agnostic, so `scoreRow`'s industry points and `SPECIALIST_BONUS` (`matchScoring.ts:102-128`, 76) never differentiate providers; ranking degrades to services/location only.
5. **Directory dropdowns split the same sector into competing options.** Filter options are derived from raw values at runtime: Investors (`Investors.tsx:55-56`, filtered by exact string in `investorFilters.ts:42`) offers `FinTech` (83 rows), `Fintech` (23) and `fintech` (2) as three options — picking the biggest still hides 25 investors, and the dropdown carries ~610 entries. Events (`Events.tsx:54`) renders the nine-way finance split from §5 — choosing "Financial Services" returns **1** of the ~14 finance events. Gov Support's `normalise()` (`agencyFilters.ts:21,44`) handles case/underscore (so `manufacturing` ≈ `Manufacturing`) but not wording (`Foodtech` ≠ `FoodTech` is fine, but `Deep Tech` ≠ `deeptech` fails on the space).
6. **`/sectors` landing pages run a third, disconnected taxonomy.** `useSectorContent.ts:11-18` matches `content_items.sector_tags.cs.{slug}` where `slug` is the sector page slug (`fintech`/`medtech`/`telecoms` — `industry_sectors` has only these 3 rows) while `sector_tags` hold V2 slugs (`financial-services`…) — the `.cs` clause can never hit; results come solely from hand-curated `ilike` keyword arrays. All eight `useSector*` hooks silently return `[]` on any keyword mismatch.
7. **`Cross-Industry` (23 of 65 lead databases) is not recognised as agnostic** by anything — it's absent from `sector_vocabulary`, and in the Leads directory it renders as just another sector option.
8. **Raw wording flows into research quality.** `industry_sector` values are interpolated verbatim into Perplexity queries and section prompts (`generate-report/index.ts:538-570, 743-792, 874-938`), so `"Software as a Service"` vs `"SaaS"` produce different research framing for identical companies.

## 7. Merge mapping tables

All deliverables live in [`docs/audits/mes-110/`](mes-110/). Every row = `surface, raw_value, row_count, merged_value, linkedin_code, linkedin_description, confidence, note`; codes/descriptions are verbatim from the pinned table; nothing was invented.

| File | Covers | Rows |
|---|---|---|
| `linkedin-industry-codes-147.csv` | The pinned canonical table (code, groups, description) | 147 |
| `mapping-investors-sector-focus.csv` | all 610 `investors.sector_focus` values | 610 |
| `mapping-events-content-casestudies.csv` | `events.sector` (75), `events.category` (80), `country_case_studies.sector` (46), `content_company_profiles.industry` (83) | 284 |
| `mapping-remaining-surfaces.csv` | lead_databases / lead_database_records / leads×2 / lead_submissions / innovation_ecosystem / trade_investment_agencies / user_intake_forms×2 / locations / countries / industry_sectors | 280 |
| `mapping-v2-industry-groups-to-147.csv` | **the V2→147 crosswalk**: all 152 canonical industry groups → closest 147 code | 152 |
| `mapping-form-constants-and-sector-slugs.csv` | the 24 intake chips (with per-chip matcher fate), `sectorTaxonomy.ts` names, `config/sectors.ts`, the 20 V2 sector slugs → 147 | 61 |
| `inventory-sector-tags.csv` | current canonical `sector_tags` distributions per table | 96 |

**Stats:** 1,386 rows; 1,246 map to a 147 code; 140 are flagged `UNMAPPABLE:<category>` (agnostic 19, investment-thesis 19, business-model 16, audience 16, funding-stage 12, event-theme 10, corrupted-fragment 30 [some fragments additionally carry a best-effort code], geography 3, other 15). Confidence: 811 high / 415 medium / 160 low — **low-confidence and UNMAPPABLE rows are the review focus**; each carries a note.

**Explicitly flagged for decision (no sensible 147 entry — map-to-closest vs approve as named MES extension):** `Deep Tech`, `Smart Cities`, `Creative Industries`, `Web3`, generic `Manufacturing`, `Professional Services`, `Technology` umbrellas, `Holding Companies`, `Equipment Rental Services`, `Workplace Safety`/OHS, plus the audience/thesis/stage/agnostic categories which should become **flags or separate fields, not sectors** (`sector_agnostic` boolean already exists for the agnostic cluster).

## 8. Canonical source-of-truth design

Proposed (under Option B; Option A changes only which vocabulary the columns hold):

1. **New `sectors` reference table** (additive migration): `code int primary key` (pinned 147), `description text` (verbatim), `groups text[]`, `v2_industry_group text`, `v2_sector_slug text`, `is_active boolean`. Seeded from `linkedin-industry-codes-147.csv` + the crosswalk CSV. Read-only to clients (SELECT grant only), service-role write — consistent with SEC-01 conventions.
2. **One TS module** `src/constants/canonicalSectors.ts` generated from the same seed (single source, checked by a mapping-completeness test) re-exporting today's `linkedinTaxonomy.ts` surface so imports migrate incrementally. The edge mirror (`generate-report/sectorTaxonomy.ts`) asserts equality with it in tests (both are pure modules — a shared test already runs under `npm test`).
3. **`sector_vocabulary` becomes the single normaliser** for raw/legacy strings (expand from 40 rows using the merge tables — e.g. add `cross-industry`, chip variants, `software as a service`), and the intake form writes **canonical values only** (chips fixed to canonical wording; custom free-text mapped through the vocabulary at submit or flagged for ops review).
4. **Forms, filters, matcher, MES-108 buckets** all consume that one source; directory dropdowns switch from derive-from-data to canonical lists (dropdown application itself is MES-108's, per the dependency note — we deliver the source + mappings).

## 9. Phase B implementation plan (per-surface, reversible, approval-gated)

Each step = one scoped PR on a `mes-110-<surface>` branch; migrations additive; originals preserved in `<column>_legacy` copies until sign-off; no RLS changes; no `apply_migration` against prod — PR flow only.

1. **Reference table + constants + tests** (no behaviour change): `sectors` table, seed, `canonicalSectors.ts`, mapping-completeness tests (every value in the merge CSVs resolves; edge/frontend constant parity).
2. **Fix the intake form surface** (highest user impact, code-only): correct the 10 non-canonical chips in `rcData.ts`; route custom free-text through `sector_vocabulary`; extend the edge alias map for the known-dropped values from §6.2 as a stopgap. Before/after matching parity test: every §6.1 chip now yields ≥1 sector slug.
3. **Backfill dirty columns** (reviewed batch per table, `UPDATE … SET x = canonical, x_legacy = old` style): investors.sector_focus (with fragment repair), events.sector/category, trade_investment_agencies.sectors_supported, innovation_ecosystem.sectors, lead_databases.sector (+ `Cross-Industry` → `sector_agnostic=true`), content_company_profiles.industry, country_case_studies.sector, leads, lead_submissions, locations/countries/industry_sectors display arrays. Audience/thesis/stage values move to a `focus_tags`-style column (or are dropped with the legacy copy retained) — per-row decisions are already in the CSVs.
4. **Tag-coverage backfill** (the §4 gaps; arguably the highest report-quality win): propose `sector_tags` for the 108 untagged events, 45 innovation orgs, 14 investors, and real tags for the 95 all-agnostic service providers — derived from the merge mapping of their existing raw values where present, AI-assisted + operator-reviewed where absent. Propose-only artefact first (consistent with the report-quality loop's review pattern).
5. **User-side tables last, most conservative:** `user_intake_forms.industry_sector` / `end_buyer_industries` remapped with `_legacy` copies; `validate_industry_sector_values` trigger updated to accept canonical + vocabulary values. Past `user_reports` are *not* rewritten (reports are snapshots); `raw_input` JSON already preserves originals.
6. **Switch consumers:** directory filters to canonical options (hand off dropdown wiring to MES-108), `useSectorContent`'s `.cs.{slug}` fixed to the canonical slugs, master-search `lead_databases.sector` unaffected once data is canonical. Remove `src/config/sectors.ts` drift or fold into the reference table.
7. **Verification per test plan:** spot-check samples per table against the CSVs; assert no legacy variant remains reachable (`SELECT` distinct checks re-run and md5-compared); representative before/after matching cases (e.g. canonical FinTech returns ≥ union of old `FinTech`/`Fintech`/`fintech` rows); report generation smoke for one company per canonical sector.

Rollback: every backfill is reversible from `_legacy` columns/exports; form changes revert per-PR; the reference table is additive and unconsumed until step 6.

## 10. Method and verification

- Repo surfaces and matching paths traced by direct inspection (files/lines cited inline). DB inventories pulled from Supabase project `xhziwveaiuhzdoutpgrh` on 2026-07-07 with SELECT-only queries; **no writes of any kind were made**.
- **Mapping completeness is machine-verified:** for each of the 16 DB surfaces, `md5(string_agg(DISTINCT value ORDER BY value COLLATE "C"))` computed in Postgres equals the md5 of the sorted `raw_value` set in the corresponding CSV (checked for all surfaces incl. all 610 investor values). Re-run the check with `python3 - <<'PY' … PY` against the CSVs before executing Phase B in case data moved.
- Row counts in the CSVs are point-in-time mention counts (array columns count one per row-mention).
- Caveats: `community_members.specialties` catalogued but excluded from remapping (expertise tags, not sectors); `lemlist_contacts.industry` (0 rows) and the `ii_*` Irish-Insights pipeline are out of scope; `directory_submissions.form_data` free-text industries (3 rows) will be constrained by the form fix rather than backfilled.

---

*Phase A ends here. Do not execute §9 until the §2 decision and the mapping tables are approved. This PR intentionally does **not** carry `Closes MES-110`.*
