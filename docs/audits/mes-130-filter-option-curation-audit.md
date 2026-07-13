# MES-130 — Directory Filter Option Curation Audit (Phase A)

> **Ticket:** MES-130 — *Directory filter option curation: top-N popular options, hide empty filters & classify noisy type lists*
> **Gate stage:** Audit (read-only) → this document is the Phase A deliverable. **No data writes, no schema changes, no component changes** are made by this PR.
> **Branch:** `claude/mes-filter-option-curation-m525iw` (harness-assigned; maps to the Notion `mes-130-filter-option-curation`).
> **Date:** 2026-07-13
> **Data source:** live prod Supabase `xhziwveaiuhzdoutpgrh`, read-only `SELECT` inventory taken 2026-07-13. Code refs against repo `HEAD` (`793d39a`).
> **Scope boundary:** this ticket owns *which options each control shows, in what order, how many, and what happens to the tail*. It does **not** own the UI pattern (MES-93), the sector taxonomy (MES-110), the tab-row type buckets / primary-dimension decision (MES-108), or location value consolidation (MES-131). Where those are unlanded, this audit applies **frontend-only curation** on the raw values and hands its inventories back to the owning ticket.

---

## 1. Executive summary

MES-93 (and sub-tickets MES-94..100) fully landed: **all nine directories now render on the shared
`DirectoryFilterBar` + `useDirectoryFilters` + `src/lib/directoryFilters.ts`** stack. That solved the
*UI pattern*. It did **not** solve the *option lists*: every page still builds its dropdown/tab
options with the same shape —

```ts
const options = [...new Set(items.map(i => i.someField).filter(Boolean))].sort();
```

i.e. **distinct → alphabetical → uncapped**, with **no popularity ranking, no top-N cap, no
minimum-count threshold, and (mostly) no zero-count hiding**. Counts are computed only for the
primary *tab* row, and `DirectoryFilterBar` only renders a `count` on tabs — never on select
options (`DirectoryFilterBar.tsx:139-143` vs `:180-184`).

The result is exactly the ticket's thesis: filters that are noise, not filters. The worst offenders
are **not** the ones in the screenshots — the screenshots are a stale Lovable preview. Against live
prod data the ranking is:

| Rank | Control | Distinct options | Rows | Character of the tail |
|---|---|---|---|---|
| 1 | **Investors → Sector** (`sector_focus[]`) | **113** | 499 | massive long tail; near-dupes (`Deep Tech`/`DeepTech`-style) |
| 2 | **Investors → Stage** (`stage_focus[]`) | **68** | 499 | case-dupes: `Pre-seed` 219 **+** `Pre-Seed` 38; `Seed` 324 + `Startup/Seed` 16 |
| 3 | **Investors → Location** | 87 | 499 | free-text city/region tail |
| 4 | **Events → Sector** (`events.sector`) | 45 (+null) | 146 | ~30 singletons (SaaS 1, Pharmacy 1, …) |
| 5 | **Events → Type** (`events.type`) | **20** | 146 | compound near-dupes (`Conference + Exhibition`, `Summit + Pitch Night`, …) — **the classification target** |
| 6 | **Innovation Ecosystem → Location** | ~50 | 217 | free-text tail |
| 7 | **Gov Support → Location** | ~100 | 148 | full street addresses (`235 St Georges Terrace…`) — MES-131 territory |
| 8 | **Case Studies → Industry** | 30 | 102 | FinTech 17, Software 15, then a tail of singletons |
| 9 | **Leads → Sector** | 26 | 65 | Sector Agnostic 23, Technology 11, then singletons |

Plus two structural bugs the ticket flagged:

- **Case Studies "Failure Stories 0"** is a **phantom tab**: the DB `content_company_profiles.outcome`
  column has **no `failed` value at all** (`successful` 25, `null` 61, `scaling` 13, `acquired` 2,
  `ipo` 1). The Failure tab is hard-coded in the page, so it renders at 0 permanently. This is a
  zero-count-hiding fix, not a data fix.
- **Investors "0 total, all tabs 0"** (screenshot) is **environment-specific to the Lovable
  preview, not a prod bug**: prod `investors` = **499 rows** with a healthy type split
  (`angel` 268 / `vc` 176 / `grant` 40 / `venture_debt` 12 / `accelerator` 3). See §6.

A third, previously-unflagged finding: **Mentors' primary tab dimension is effectively broken.**
`useMentorCategories()` reads a `mentor_categories` table that **does not exist** in prod (the hook
swallows the error and returns `[]` — `useMentors.ts:209-231`), and `community_members` has **no
`category_slug` column**, so `m.category_slug` is `null` for every mentor. The only clean, populated
mentor dimension is **`archetype`** (Trade & Government 48, International Founder 47, Active Advisor
22, Scaled Founder 15). See §4.9.

**Recommendation:** implement curation as **one pure, tested helper** (`curateOptions`) plus a small,
additive `DirectoryFilterBar` enhancement (counts + a "More…" overflow on selects), driven entirely
by **per-directory config**. Roll out per directory, noisiest first. The **only** owned data change
is the Events `type` classification, shipped in Phase B as a reviewed, reversible, additive backfill.

---

## 2. Methodology & how options are derived today

### 2.1 The shared stack (verified present)

- `src/components/common/DirectoryFilterBar.tsx` (257 lines) — **presentational only**; options are
  passed in as pre-built `FilterOption[] = { value, label, count? }` arrays. `count` renders **only
  on tabs** (`:139-143`); selects map options verbatim after a hard-coded `all` row (`:169-188`) —
  no count, no cap, no search. `StandardDirectoryFilters.tsx` from the MES-93 audit **no longer
  exists** (fully migrated).
- `src/hooks/useDirectoryFilters.ts` (82 lines) + `src/lib/directoryFilters.ts` — URL↔state only;
  they manage filter *values*, never option lists.
- **Option derivation lives in each page component.** The `src/lib/*Filters.ts` modules
  (`eventFilters`, `investorFilters`, `agencyFilters`, `mentorFilters`, `leadFilters`,
  `caseStudyFilters`, `innovationFilters`, `contentFilters`) are **pure predicate/sort helpers**;
  they do not build option lists (fixed constants aside: `eventFilters.TOPIC_TAGS`,
  `caseStudyFilters.REVENUE_RANGES/COST_RANGES`).

### 2.2 The two existing curation behaviours (the exceptions to copy)

Only two directories already do *any* option curation, and they are the templates for the rule:

1. **Content → Category** hides zero-count options (`Content.tsx:55-58`):
   `categories.filter(c => contentItems.some(i => i.category_id === c.id))`.
2. **Events → Topic pills** use an allowlist filtered to present values (`Events.tsx:57`,
   `eventFilters.TOPIC_TAGS`).

Both are **zero-hiding**, neither is **top-N** or **popularity-ranked**. Everything else is
`[...new Set()].sort()`.

### 2.3 Dependency state (verified in-repo)

| Dependency | State | What MES-130 consumes |
|---|---|---|
| **MES-93** UI pattern | **Landed** — all 9 directories on `DirectoryFilterBar` | Build curation *into* it; don't fork. |
| **MES-110** sector taxonomy | **Landed** — `src/constants/canonicalSectors.ts` (147 codes + V2 crosswalk), `sector_tags[]` slug arrays canonical across 8 tables, migrations `20260707141000`…`20260708140000` | Curation ranks/caps taxonomy values; never re-derives sector names. |
| **MES-108** type buckets / primary dimension | **Not landed** (no `docs/audits/mes-108*`, no migration). Closest artefact: `getStandardTypes` (`src/utils/sectorMapping.ts:64-72`) + the innovation `type[]` axis (`20260708150000_innovation_ecosystem_type_axis.sql`) | Where a bucket list exists, curate within it; otherwise curate the **current** dimension and mark the slot **provisional**. The Events `type` mapping (§5) is owned here and flagged to MES-108. |
| **MES-131** location consolidation | Not landed (this audit's location inventories feed it) | Curate whatever location values exist; do not dedupe. |

---

## 3. Per-control option inventory (live prod, 2026-07-13)

Counts are result counts per option. "≤2" column = how many options have count ≤ 2 (the noise the
top-N cap removes from the visible list). All controls order **alphabetically** today with **no cap**
unless noted.

### 3.1 Events — `src/pages/Events.tsx` → `events` (status = `approved`, **146** rows — the ticket's "145" is stale)

**Type** (`events.type`, 20 distinct — the classification target, §5):

| Type | n | Type | n |
|---|---|---|---|
| Conference + Exhibition | 31 | Festival + Conference | 2 |
| Networking | 31 | Workshop | 2 |
| Conference | 17 | *11 compound singletons* | 1 each |
| Pitch Night | 16 | (Airshow + Trade Exhibition, Conference + Expo, Conference + Investor Presentation, Conference + Networking, Festival + Conference + Exhibition, Festival + Conference + Startup Expo, Showcase + Networking, Summit + Exhibition, Summit + Pitch Night, Trade Exhibition) | |
| Summit | 15 | | |
| Trade Show + Conference | 9 | | |
| Trade Show | 8 | | |
| Expo | 5 | | |

→ **14 of 20 values have count ≤ 2.** Classified into **7 canonical buckets** (§5), 6 populated.

**Sector** (`events.sector`, 45 distinct + `(null)` on 4 rows): Founders & Startups 28, Technology
12, Professional Services 9, AI & Data 8, Mining & Metals 7, Venture Capital 5, then a tail where
**~30 values have count 1** (SaaS, Pharmacy, LegalTech, GovTech, Smart Cities, Hospitality, …).
**Category** (`events.category`, 49 distinct) is an even longer near-duplicate of Sector and is not
currently surfaced as a select — flag to MES-108/110 that `sector` and `category` overlap.

### 3.2 Investors — `src/pages/Investors.tsx` → `investors_public` (499 rows)

- **Type** (tabs, fixed `INVESTOR_TYPES`): angel 268, vc 176, grant 40, venture_debt 12,
  accelerator 3. Clean — keep. (No `Other`-bucket rows in data; the `Other` tab renders 0 → should
  be hidden by the zero rule.)
- **Sector** (`sector_focus[]`, **113 distinct**): SaaS 218, Consumer 126, Technology 116, FinTech
  113, CleanTech 99, Marketplace 83, Software 75, HealthTech 70, AI & Data 59, Deep Tech 46 … then a
  ~100-value tail. **Noisiest control on the platform.**
- **Stage** (`stage_focus[]`, **68 distinct**): Seed 324, Pre-seed 219, Series A 159, Series B 40,
  **Pre-Seed 38** (case-dupe of Pre-seed), Growth 35, Startup/Seed 16, Early stage 11, …
  Case/format dupes inflate the list; curation top-N hides them but does **not** merge them (merging
  is a data-quality follow-up — §8).
- **Location** (87 distinct): free-text city tail (MES-131).

### 3.3 Service Providers — `src/pages/ServiceProviders.tsx` → `service_providers` (113 rows)

- **Category** (tabs, `useServiceProviderCategories`): landed since the screenshot — SP now has a
  category tab row (the "single All 95" screenshot is **stale**, pre-MES-98). Curate per §4.
- **Sector** (`mapServicesToSectors(services[])`, 11 distinct slugs): technology-information-and-media
  17, manufacturing 7, hospitals-and-health-care 6, government-administration 5, then 1–4 each.
  **Note:** 94 of 113 providers are `sector_agnostic` → the sector select only meaningfully covers
  ~19 rows. Small enough that top-10 shows almost everything; zero-hiding is the main win.
- **Location** (27 distinct): Sydney NSW 39, Melbourne VIC 30, Australia 14, Canberra 4, then a tail
  of singletons incl. malformed values (`6 Australia St, Camperdown, Sydney`,
  `Sydney, NSW (Primary), Melbourne, VIC`). Curate top-N; dedupe is MES-131.

### 3.4 Government Support — `src/pages/TradeInvestmentAgencies.tsx` → `trade_investment_agencies` (148 active)

- **Category** (tabs, `useOrganisationCategories` / `category_slug`): chambers-of-commerce 53,
  federal-agencies 40, bilateral-organisations 26, `(null)` 15, state-investment-bodies 5,
  accelerators-programs 4, industry-associations 3, nz-government 2. Clean.
- **Type** (`organisation_type`, 8 distinct): bilateral 79, foreign_trade_agency 37, federal_agency
  12, state_body 10, trade_consultancy 4, industry_association 3, nz_government 2, export_finance 1.
  Overlaps Category (same problem MES-93 flagged) — MES-108 to pick the primary; provisional here.
- **Sector** (`sectors_supported[]`, 19 distinct): Manufacturing 29, Financial Services 23, Mining &
  Metals 23, FoodTech 20, CleanTech 17, HealthTech 14, AgTech 13, EdTech 13, Defence & Space 12,
  Construction 11, then ≤10. Top-10 + zero-hide is a clean fit.
- **Location** (~100 distinct, full street addresses; `Unknown` 37): **worst location noise on the
  platform** — top-N helps, but this control mostly demonstrates why MES-131 exists.

### 3.5 Innovation Ecosystem — `src/pages/InnovationEcosystem.tsx` → `innovation_ecosystem` (217 rows)

- **Type** (tabs, `type[]` multi-value — MES-100 landed): Accelerator 94, Industry Body 53,
  Coworking Space 50, Incubator 33, Community 19, Research Institute 8. Clean, curated-order-seeded.
- **Location** (~50 distinct): Sydney NSW 62, Melbourne VIC 31, Australia 27, Adelaide 10, Perth 9,
  Sydney 8 (dupe of "Sydney, NSW"), then a long singleton tail. Top-N + zero-hide.
- **Service** (`Popover`+`Command` searchable combobox, derived from `services[]`): already
  effectively "search the tail" — align its behaviour with the standard "More…" overflow.

### 3.6 Leads — `src/pages/Leads.tsx` → `lead_databases` (65 rows)

- **Type** (tabs, `list_type` via `getStandardTypes.leads`): Lead Database 53, Market Data 11, TAM
  Map 1. Clean (TAM Map 1 survives min-count if pinned; see §4).
- **Sector** (26 distinct): Sector Agnostic 23, Technology 11, Financial Services 5, Professional
  Services 2, Retail 2, then ~18 singletons. Top-10 + zero-hide.
- **Location** (4 distinct): Australia 32, Australia & New Zealand 30, New Zealand 2, Singapore 1.
  Already short — no curation needed beyond zero-hide.

### 3.7 Case Studies — `src/pages/CaseStudies.tsx` → `content_items` + `content_company_profiles` (102 rows)

- **Outcome** (tabs, hand-rolled All/Success/**Failure**): DB `outcome` = successful 25, `null` 61,
  scaling 13, acquired 2, ipo 1. **There is no `failed` value** → the **Failure Stories tab is a
  permanent 0** (the ticket's flagged phantom). Curation zero-rule removes it. Note **outcome is
  null on 61 of 102 rows**, so even curated outcome tabs only classify 41 rows — the null rule
  (§4.1) applies and the count-sum test is the three-term identity, not `tabs = All`. Provisional
  primary dimension pending MES-108 (candidate: a real Success/Scaling/Exited grouping over
  `outcome` — only worth promoting if the null backlog gets classified).
- **Industry** (`profile.industry`, 30 distinct): FinTech 17, Software 15, Marketplace 8, AI & Data
  7, Cybersecurity 5, E-commerce 4, HealthTech 4, then ~20 singletons. Top-10 + zero-hide.
- **Origin Country** (13 distinct): curate top-N, keep flag emoji.
- Revenue / Cost ranges: fixed constant buckets — **not** in scope (already bounded).

### 3.8 Market Entry Guides (Content) — `src/pages/Content.tsx` → `content_items`

- **Type** (tabs, fixed allowlist `CONTENT_TYPE_TABS`): the page requests `guide/article/
  success_story`, but the DB `content_type` domain is `case_study` 102, `guide` 44, `best_practice`
  2, `interview` 2, `compliance` 2 — **there is no `article` or `success_story` value**. So the
  Guides page's Article/Success-Story tabs are **phantom tabs** (same class as Case Studies'
  Failure). Zero-rule removes them; flag the `content_type` vocabulary mismatch to MES-108. Best_
  practice/interview/compliance guides currently have **no tab** at all.
- **Category** (select): already zero-hidden (`categoriesWithContent`) — the reference implementation.

### 3.9 Mentors — `src/pages/MentorsDirectory.tsx` → `community_members` (132 active)

- **Category** (tabs, `useMentorCategories`): **broken** — reads non-existent `mentor_categories`
  table (returns `[]`), and `category_slug` is `null` on all rows (`community_members` has no such
  column). The tab row is effectively just "All". **Recommend `archetype` as the primary dimension**
  (Trade & Government 48, International Founder 47, Active Advisor 22, Scaled Founder 15 — clean,
  4 values). Provisional pending MES-108; also raise the dead `mentor_categories` reference as a bug
  (§8).
- **Sector** (pills, `sector_tags[]`, 8 distinct) / **Corridor** (pills, `market_corridors[]`, 17
  distinct: uk-to-australia 33, ireland-to-australia 31, usa-to-australia 15, then singletons) —
  advanced-panel pills. Curate top-N with a "More…" for the corridor tail.
- **Location** (~25 distinct): Greater Sydney Area 35, Sydney NSW 33, Melbourne VIC 14, Greater
  Melbourne Area 12 (dupe cluster), … top-N + zero-hide; dedupe is MES-131.

---

## 4. Proposed platform-wide curation rules

All rules live in **config**, defaulting sensibly so a directory that passes no override still gets
curated. The engine is a single pure function; the bar change is additive.

### 4.1 Default rules (apply to every control unless overridden)

| Rule | Default | Rationale |
|---|---|---|
| **Ordering** | **Popularity (result count) descending**, then **label A→Z** as a stable tie-break | deterministic; no churn between equal-count options |
| **Cap (top-N)** | **10** visible options | the ticket's target; keeps a control to one screen |
| **Min-count threshold** | **≥ 1** (hide count-0) | zero options are never useful; kills phantom tabs |
| **Zero-count option** | **hidden** | e.g. Investors `Other` tab, Case Studies `Failure`, Guides `Article` |
| **Empty control** | **control hidden entirely** if 0 options survive | e.g. SP sector when all rows agnostic |
| **Empty directory** | render the existing empty-state; suppress all filter controls | no "filter to nothing" |
| **Overflow (the tail beyond top-N)** | see 4.2 — depends on control type | every row stays reachable |
| **Null values** | never rendered as an option; null-valued rows are reachable via **All** only | e.g. Case Studies `outcome` null 61/102, Gov Support `category_slug` null 15, Events `sector` null 4 |
| **Min-count** | deliberately **1** (= zero-hiding only), overridable per control | with 65–500-row datasets, a ≥2 threshold hides legitimate reachable singletons that have no canonical bucket to fold into; the cap + overflow already bounds the visible list — a higher default is rejected, not forgotten |

**Count-sum invariant (restated precisely — the naive "options sum to All" is structurally false
for two dimension classes):**

- **Scalar dimensions:** `visible + overflow + null-valued rows = All`. Null-heavy dimensions make
  this visible: Case Studies outcome options sum to **41 of 102** (61 nulls) — correct behaviour,
  not a bug. Tests must assert the three-term identity, not `options = All`.
- **Array dimensions** (`sector_focus[]`, `type[]`, `sector_tags[]`, `market_corridors[]`): one row
  counts under many options, so option counts legitimately sum to **more** than All. Exempt from
  the sum test; assert instead that every row carries ≥1 option or is null-reachable via All.

### 4.2 Overflow — "More…" vs "Other", chosen by control type

The reachability guarantee (AC: *every row remains reachable*) is satisfied differently per control:

- **Free-text / taxonomy selects** (location, sector, stage, industry, origin) → **"More…"
  searchable overflow.** Show top-10 with a **"More…"** path to the *full* searchable option list.
  **Implementation call:** do **not** embed a "More…" pseudo-item inside the shadcn/Radix `Select`
  — its value model fights an item that opens a second surface. Instead, when a control's overflow
  is non-empty, `DirectoryFilterBar` renders that control as a **`Popover`+`Command` combobox
  variant** (the Innovation Ecosystem Service control is the in-repo proof), showing the top-10
  ranked with the rest one search away. No value is dropped. **Counts render inline** on each
  option (new bar capability, §7). This is the default for selects because these dimensions have no
  canonical bucketing to fold the tail into.
- **Classified / bucketed tabs** (Events type, investor type, IE type, leads type) → **"Other"
  catch-all bucket.** The classification maps *every* raw value to a canonical bucket (or `Other`),
  so the tail is reachable by selecting `Other`. `Other` is itself subject to the zero rule (hidden
  when empty). This is only available where a value→canonical mapping exists — today that is Events
  type (§5); elsewhere the tab dimension is already a small clean set.
- **Advanced-panel pills** (mentor corridor, mentor sector) → top-N pills + a **"More…"** toggle
  that expands the rest. Same reachability, no dropped value.

### 4.3 Where counts are shown

Counts render **wherever the popularity signal helps the user** and the surface has room: **tabs**
(already) and **select options** (new — §7). Pills stay countless (space). This is a display concern
only; ordering is by count regardless of whether the count is shown.

### 4.4 Stability / churn

Ranking is computed at **query/render time from the current result set** (client-side, as today), so
it reflects live data. To avoid the "options reshuffle as I type" problem, **rank against the
directory's full unfiltered set, not the search-narrowed set** — the option list is stable across
search/tab interactions within a session. Ties break on label, so equal-count options never swap.

**Documented tradeoff (convention, not a bug):** because ranking/counts come from the *unfiltered*
set, a displayed count will not shrink when a tab or search is active ("FinTech 17" stays 17 while
a tab narrows the grid to 3). This is deliberate — live-recomputing counts makes options reorder
and vanish mid-interaction, which is worse than a stale count. State it in the Phase B PR
descriptions so reviewers don't file it.

### 4.5 Per-directory config (recommended overrides)

`primary` = the tab dimension MES-108 will bless; **(prov.)** = provisional (curate current dimension
now, revisit when MES-108 lands). `selectCap`/`pillCap` default to 10; `pin` = values force-kept
regardless of rank (small clean taxonomies where hiding a low-count value would confuse).

| Directory | Primary (tab) | Select caps & overflow | Notes |
|---|---|---|---|
| **Investors** | Type (fixed) — keep; hide `Other` when 0 | Sector 10 + More…; Stage 10 + More… (`pin` none); Location 10 + More… | Highest-value target: 113-sector & 68-stage dropdowns. |
| **Events** | **Type → 7 canonical buckets** (§5) + `Other` | Sector 10 + More…; hide `(null)` | Only directory with an owned data change. |
| **Service Providers** | Category (fixed) | Sector: hide-zero + `pin` all (≤11 slugs, all fit); Location 10 + More… | Sector control may auto-hide if agnostic-only after filtering. |
| **Gov Support** | Category *(prov.; overlaps Type)* | Sector 10 + More…; Type `pin` all 8; Location 10 + More… (`Unknown` sorts last) | MES-108 to resolve Category-vs-Type. |
| **Innovation Ecosystem** | Type (fixed, `type[]`) | Location 10 + More…; Service → keep combobox (already "search the tail") | Model overflow behaviour on this Service combobox. |
| **Leads** | Type (fixed, `list_type`) — `pin` all 3 | Sector 10 + More…; Location `pin` all 4 | Tiny dataset; mostly zero-hiding. |
| **Case Studies** | Outcome *(prov.)* — **drop Failure (0)** | Industry 10 + More…; Origin 10 + More… | Phantom-tab fix is the headline. |
| **Market Entry Guides** | Content type — **drop Article & Success Story (0)**; add Best-practice/Interview/Compliance only if non-zero | Category already zero-hidden | Flag `content_type` vocab mismatch to MES-108. |
| **Mentors** | **Archetype *(prov.)*** — replaces the broken `mentor_categories` tabs | Location 10 + More…; Sector pills `pin` all 8; Corridor pills 8 + More… | Also file the dead-hook bug (§8). |

---

## 5. Events `type` value → canonical mapping (owned deliverable)

Complete mapping of **all 20** existing `events.type` values → **7 canonical buckets** (6 populated +
`Webinar` reserved for online events / consistency with `getStandardTypes.events` and the
`normalize-events` `deriveEventType` buckets). Every approved row maps; nothing lands in `Other`
today. Full table also at [`mes-130/events-type-value-to-canonical.csv`](mes-130/events-type-value-to-canonical.csv).

**Classification rule:** exact match → synonym → **lead-token** (the first/dominant format word in a
compound decides the bucket). Priority when a compound spans families:
`Conference/Summit > Expo/Trade Show/Exhibition/Airshow > Pitch > Networking > Workshop >
Festival/Showcase`.

| Canonical bucket | Approved rows | Raw values folded in |
|---|---|---|
| **Conference** | **68** | Conference (17), Conference + Exhibition (31), Summit (15), Conference + Expo (1), Conference + Investor Presentation (1), Conference + Networking (1), Summit + Exhibition (1), Summit + Pitch Night (1) |
| **Networking** | **31** | Networking (31) |
| **Expo & Trade Show** | **24** | Trade Show + Conference (9), Trade Show (8), Expo (5), Airshow + Trade Exhibition (1), Trade Exhibition (1) |
| **Pitch & Demo Day** | **16** | Pitch Night (16) |
| **Festival & Showcase** | **5** | Festival + Conference (2), Festival + Conference + Exhibition (1), Festival + Conference + Startup Expo (1), Showcase + Networking (1) |
| **Workshop & Training** | **2** | Workshop (2) |
| **Webinar** | 0 | *(reserved; hidden by zero-rule until online events exist)* |
| **Other** | 0 | *(catch-all for future unmapped values)* |
| **Total** | **146** | = the full approved set (146 rows, all type-tagged, zero null types) — buckets sum exactly to All ✓ |

**Coordination note for MES-108:** this 7-bucket set is a superset-compatible extension of
`getStandardTypes.events = ['Conference','Workshop','Webinar','Networking','Trade Show']` — it splits
`Trade Show` into `Expo & Trade Show`, adds `Pitch & Demo Day` and `Festival & Showcase` (both
present in real data), and renames `Workshop`→`Workshop & Training`. **Flagged to MES-108 as the
proposed events bucket vocabulary.** If MES-108 blesses a different set, this mapping's *rule* (lead-
token) carries over unchanged; only the bucket labels move.

**Implementation shape (Phase B, approval-gated — `Destructive migration` risk flag):** additive,
reversible backfill. Add `events.type_canonical text` (nullable), populate it from the mapping via an
idempotent data migration, **preserve `events.type` untouched**, and point the Type tab/predicate at
`type_canonical`. Originals are the rollback. No `UPDATE` to `events.type` itself → not actually
destructive; the risk flag stays until the plan is signed off. The submission/normalize path
(`normalize-events` `deriveEventType`, baseline RPC `upsert_normalized_event` writing `type`) should
also emit `type_canonical` so new rows are classified on ingest — flag as the follow-up that keeps
the bucket set from re-fragmenting.

---

## 6. Investors zero-count investigation (resolved: not a prod bug)

**Finding: environment-specific to the Lovable preview; prod data is healthy.**

| Check | Result |
|---|---|
| `investors` base rows | **499** |
| `investors_public` rows | **499** (view is not stripping rows) |
| `investor_type` split | angel 268, vc 176, grant 40, venture_debt 12, accelerator 3 |

The tab counts derive from the fetched result set (`Investors.tsx:62-77`). With 499 healthy rows in
prod, tabs render real counts. The screenshot's "0 total / all tabs 0" is therefore the **preview
environment returning no rows** — a preview-branch/RLS/seed-data condition, not a code defect. The
`investors_public` view read path is anon-safe and returns data.

**However**, there *is* a real UI gap the screenshot exposes, worth folding into this ticket's zero
rules: when the result set is empty (for any reason), the page still renders **every hard-coded
`INVESTOR_TYPES` tab at count 0** rather than collapsing to a single empty-state. The §4.1 rules —
*hide zero-count options; empty directory ⇒ suppress filter controls + show empty-state* — fix this
generically. So: **no data fix and no standalone follow-up ticket needed**; the empty-state
robustness is covered by the curation rollout. (If the preview keeps showing empty, that's an env/
seed issue for whoever owns the Lovable preview DB, not MES-130.)

---

## 7. Implementation plan (Phase B — after approval)

Each step is a scoped, reversible PR. Only the final PR carries `Closes MES-130`.

**B0 — Curation engine + bar capability (foundation PR, `Refs MES-130`).** No directory behaviour
changes yet.
- `src/lib/filterCuration.ts` — pure `curateOptions(counted: {value,label,count}[], cfg)` →
  `{ visible: FilterOption[], overflow: FilterOption[] }`. Implements popularity sort, stable tie,
  top-N cap, min-count, zero-hide, `pin`, and `Other` folding. Colocated `filterCuration.test.ts`
  (`node --test`): top-N selection, tie-break stability, the §4.1 count-sum invariant
  (`visible + overflow + nulls = All` for scalar dims; array dims exempt), zero-hiding, pin,
  overflow reachability.
- `DirectoryFilterBar.tsx` — additive: render `count` on **select** options; when a select's
  `overflow` is non-empty, render that control as the **`Popover`+`Command` combobox variant**
  (generalised from the IE Service control) rather than embedding a "More…" pseudo-item in the
  Radix `Select` (§4.2). Tabs `Other` bucket support. Fully backward-compatible: a control with no
  overflow renders exactly as today.
- A shared `DirectoryCurationConfig` type + a `directoryCuration.ts` config map holding the §4.5
  overrides.

**B1 — Events (noisiest + owned data change).** Frontend curation on Sector; the Type classification
migration (§5, additive `type_canonical`) + wiring the tab/predicate to it. This is the
approval-gated data step — ship it as its own PR with the parity checklist (type buckets sum to the
All count; every raw value maps; originals preserved).

**B2 — Investors.** Sector (113→10+More…), Stage (68→10+More…), Location; hide empty tabs. Highest
user-facing win after Events. **Caveat that must ship with B2:** top-N over a duplicate-ridden
vocabulary makes the visible list look authoritative while the dupes hide in the overflow — a user
picking the visible `Pre-seed` (219) silently misses the `Pre-Seed` (38) rows. That trap exists
today, but curation *amplifies* it. Either land a minimal stage-vocabulary merge (case-fold +
`Startup/Seed`→`Seed`) alongside B2 as a reviewed data fix, or have the curation key
case-insensitively fold display-identical values at render time (frontend-only, reversible) until
the data merge lands. Do not ship B2 with neither.

**B3 — Simple adopters:** Leads, Innovation Ecosystem, Gov Support (Sector/Location caps + zero-hide;
IE Service combobox becomes the overflow reference).

**B4 — Case Studies & Guides:** drop phantom tabs (Failure / Article / Success Story) via the zero
rule; cap Industry/Origin. Flag the `content_type` vocab mismatch to MES-108.

**B5 — Service Providers & Mentors:** SP sector/location; Mentors switch primary tab to `archetype`
(provisional), curate corridor/sector pills, and file the dead `mentor_categories` bug.

Each PR: parity checklist (every §3 dimension still reachable; the §4.1 count-sum invariant holds;
search+tab+select combos correct; mobile wrap at 375px; tier-gating untouched). Config-driven ⇒ any
directory reverts by config.

---

## 8. Data-field gaps & follow-ups (flag, don't fix here)

| # | Finding | Owner / follow-up |
|---|---|---|
| 1 | **`mentor_categories` table does not exist**; `useMentorCategories` silently returns `[]`; `community_members` has no `category_slug`. Mentor primary tabs are dead. | MES-130 B5 uses `archetype`; file a **bug ticket** to either create `mentor_categories` or formally retire the hook. |
| 2 | **Investors `stage_focus` case/format dupes** (`Pre-seed` 219 + `Pre-Seed` 38; `Seed`/`Startup/Seed`). Curation *hides* but does not *merge*. | Data-quality follow-up (a small stage vocabulary, MES-108/110-adjacent). |
| 3 | **Guides `content_type` vocabulary mismatch**: page expects `article`/`success_story`; DB has `case_study/guide/best_practice/interview/compliance`. | MES-108 (type buckets) — the Guides tab set should match the real domain. |
| 4 | **Events `sector` vs `category`** are overlapping 46/48-value near-duplicates on the same table. | MES-110/108 — one should be canonical; MES-130 curates whichever the page surfaces. |
| 5 | **Gov Support & SP location values** are raw addresses / malformed free-text. | MES-131 location consolidation. |
| 6 | **New event ingest re-fragments `type`** unless `normalize-events` emits the canonical bucket. | MES-130 B1 follow-up: classify on ingest (additive) so the bucket set stays stable. |
| 7 | **`investor_type = 'Other'`, Case Studies `Failure`, Guides `Article/Success Story`** are hard-coded phantom tabs. | Fixed generically by the §4.1 zero rule during rollout. |

---

## 9. Acceptance-criteria coverage (Phase A)

- [x] Written audit of every filter control on every directory (§3), noisiest ranked (§1).
- [x] Platform-wide curation rules — top-N, min-count, ordering, overflow, zero/empty (§4) + per-directory config (§4.5).
- [x] Complete Events type value→canonical mapping covering **all 20** values (§5 + CSV), flagged to MES-108. *(Review/approval pending — Phase A gate.)*
- [ ] Shared component supports config-driven caps/ranking/overflow/zero-hide — **Phase B** (§7 B0).
- [x] Per-directory primary dimension applied per MES-108 rule or marked **provisional** (§4.5).
- [ ] Every row reachable / §4.1 count-sum invariant holds (`visible + overflow + nulls = All`, array dims exempt) — **Phase B**, with tests (§7).
- [x] Zero-count tabs identified for removal (Case Studies Failure, Guides Article/Success Story, Investors Other); **Investors empty-state documented as env-specific, not a bug** (§6).
- [x] Recommendations reference actual components/routes and live data values/counts.

**Phase A ends here. No implementation, data write, or schema change proceeds without explicit
approval of this audit and the §5 mapping.**
