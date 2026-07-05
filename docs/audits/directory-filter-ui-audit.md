# Directory Filter UI Audit & Standardisation Plan

> **Ticket:** MES directory filter/navigation UI audit (audit-first — no broad implementation in this PR)
> **Date:** 2026-07-05
> **Scope:** Filter/navigation UI at the top of all nine main content directories.
> **Target pattern:** the Investors-style layout — category tabs with counts, plus search and a small set of dropdowns.

---

## 1. Executive summary

Nine directories, **seven distinct filter architectures**. The good news: a shared component
(`src/components/common/StandardDirectoryFilters.tsx`) already exists and is used by four
directories (Service Providers, Events, Government Support, Leads) — but it standardises only the
*middle* of the pattern (search + 3 dropdowns + a "Filters" toggle) and each consumer has bolted
different things around it. The other five directories are fully bespoke.

Key cross-cutting findings:

1. **The category/type axis — the primary navigation axis — is expressed five different ways:**
   shadcn `Tabs` (Investors), underline text-tabs (Content), pill `Button`s (Events category,
   Content categories), plain `Select` dropdowns (Mentors, Service Providers, Government Support —
   hidden behind a "Filters" toggle on the latter two), and hand-rolled buttons (Case Studies
   outcome tabs).
2. **Counts are inconsistent.** Investors, Leads and Case Studies show per-type counts in the hero;
   only Events shows counts inline on its tabs; no directory shows counts on the primary filter
   controls themselves (the Investors reference pattern puts them in the hero, not on the tabs).
3. **URL param naming diverges:** `search` everywhere except Mentors (`q`); `location` everywhere
   except Events (`city`); empty-state sentinel is `all` everywhere except Case Studies (`any` for
   4 of its 6 params); sort defaults are `featured` / `recent` / `newest` depending on page.
4. **The audience (persona) filter exists on only 3 of 9 directories** (Service Providers, Events,
   Mentors) and sits in a different place on each: below the hero in the results header (SP),
   floating in the content area (Events), inside the collapsed advanced panel (Mentors). On
   Events, "Clear all filters" does **not** reset it.
5. **Mobile behaviour is broken in the shared component:** `StandardDirectoryFilters` lays out
   search + three dropdowns + button in a single non-wrapping `flex` row (`flex gap-4
   items-center`), so on small screens the four directories using it get crushed controls.
   The bespoke pages each solved mobile differently (stacking, wrapping, or a dedicated drawer).
6. **Case Studies is structurally the outlier** (confirmed "messiest"): it is the only directory
   with a persistent left filter *sidebar* + sticky top bar + mobile drawer + view-mode toggle,
   six filter dimensions, and its own money-range parsing. Individually the features are fine;
   collectively it shares almost nothing with the other eight pages.
7. **Fragile label-as-value coupling** in two places: Government Support filters by comparing the
   *prettified display label* back against a normalised DB value, and Leads/Service Providers
   filter `list_type`/type against a hard-coded label list in `src/utils/sectorMapping.ts`
   (`getStandardTypes`) that must stay in lockstep with DB strings.

**Recommendation (§4):** evolve rather than restart — build a config-driven `DirectoryFilterBar`
(+ `useDirectoryFilters` URL-state hook) modelled on the Investors layout, and migrate directories
one PR at a time, starting with Case Studies. `StandardDirectoryFilters` stays in place until its
four consumers are migrated, then gets deleted.

---

## 2. Per-directory audit

Rating scale — **Effectiveness**: does the filter set help users narrow this dataset well?
**Consistency**: how close is it to the target Investors pattern / the rest of the site? (1–5.)

### 2.1 Investors — the reference pattern ★

| | |
|---|---|
| Route / page | `/investors` → `src/pages/Investors.tsx` |
| Filter UI | `src/components/investors/InvestorFilters.tsx`, hero counts in `InvestorsHero.tsx` |
| Data | `useInvestors` → `investors_public` view (client-side filtering) |

| Dimension | Control | Options source | Notes |
|---|---|---|---|
| Type (primary) | shadcn `Tabs` row: All / VCs / Angels & Syndicates / Venture Debt / Accelerators / Grants / Other | Hard-coded `INVESTOR_TYPES` ↔ `investor_type` column | Fixed taxonomy — this is what makes it scannable |
| Search | `Input` w/ icon | name, description, location, `sector_focus[]` | param `search` |
| Stage | `Select` ("All Stages") | derived from `stage_focus[]` | |
| Sector | `Select` ("All Sectors") | derived from `sector_focus[]` | |

- **Counts:** per-type counts as hero stat cards (`typeCounts`); result line "Showing X of Y investors".
- **URL sync:** `search`, `type`, `stage`, `sector`, `page`; clear-all link; filter change resets page.
- **Mobile:** tabs wrap (`flex-wrap h-auto`); search/dropdown row stacks (`flex-col sm:flex-row`). Good.
- **Empty state:** handled in `InvestorResults` with `onClearFilters`.
- **Effectiveness 5 / Consistency 5.** Gaps to fix while standardising: tab counts are in the hero,
  not on the tabs; no Location filter (investors have a `location` column that is only searchable);
  no audience axis (no backing field — see §6).

### 2.2 Service Providers

| | |
|---|---|
| Route / page | `/service-providers` → `src/pages/ServiceProviders.tsx` |
| Filter UI | `StandardDirectoryFilters` + `ServiceProvidersAdvancedFilters` + `PersonaFilter` |
| Data | `ServiceProvidersDataProvider` → `service_providers` (client-side) |

| Dimension | Control | Notes |
|---|---|---|
| Search | `Input` | param `search` |
| Location | `Select` | derived locations |
| Type | `Select` | **hard-coded** `getStandardTypes.serviceProviders` (Consultant / Law Firm / Accountant / Marketing Agency / Other) |
| Sector | `Select` | derived via `mapServicesToSectors(services[])` |
| Category | `Select` (behind "Filters" toggle) | `useServiceProviderCategories` — overlaps Type conceptually |
| Sort | `Select` (behind toggle) | featured / A-Z / views |
| Verified only | `Switch` (behind toggle) | |
| Services | pill row (first 10, behind toggle) | **clicking a pill overwrites the search term** — surprising side-channel |
| Audience | `PersonaFilter` pills — but rendered *below* the filter bar in the results header | param `persona` |

- **Counts:** hero stats only (totals). Result line present.
- **Mobile:** inherits the non-wrapping `StandardDirectoryFilters` row — cramped.
- **Effectiveness 3 / Consistency 2.** Densest page: three overlapping mechanisms (dropdowns +
  Filters panel + service pills) and two type-like axes (Type *and* Category). The service-pill →
  search-term coupling silently discards the user's typed query.

### 2.3 Mentors

| | |
|---|---|
| Route / page | `/mentors`, `/mentors/:categorySlug` → `src/pages/MentorsDirectory.tsx` |
| Filter UI | `src/components/mentors/MentorFilters.tsx` (also exports `useMentorFilters`, `useFilteredMentors`) |
| Data | `useMentors` → `community_members_public` (client-side) |

| Dimension | Control | Notes |
|---|---|---|
| Search | `Input` | param **`q`** — only directory not using `search` |
| Category | `Select` | `mentor_categories`; also pre-filterable via route param — the only directory with URL-path category nav |
| Location | `Select` | derived |
| Sort | `Select` | featured / views / experience / A-Z |
| Audience | `PersonaFilter` pills (in advanced panel) | `persona_fit[]` incl. `both` handling |
| Corridor | pill row "Experience entering from:" (advanced) | `market_corridors[]` origins, flag emoji |
| Sector | pill row (advanced) | `sector_tags[]` |

- **Counts:** active-filter count badge on the Filters button (only directory with this); no
  per-option counts. Result line present.
- **Mobile:** `flex-wrap` on the main row — acceptable.
- **Effectiveness 4 / Consistency 3.** Best-engineered filter state on the site (URL as single
  source of truth, exported pure-ish filter fn, `DEFAULT_FILTERS`). But rich = tall, category is a
  dropdown instead of the primary tab row, and the persona/corridor/sector pills are hidden behind
  a toggle. `useMentorFilters`/`useFilteredMentors` is the best starting point for the shared hook.

### 2.4 Events — most fragmented

| | |
|---|---|
| Route / page | `/events` → `src/pages/Events.tsx` |
| Filter UI | `StandardDirectoryFilters` + inline pill rows + `PersonaFilter` + two `Tabs` rows |
| Data | `useEvents` → `events` (server-ish search via hook, rest client-side) |

Nine dimensions in **four visually separate clusters**:

| Cluster | Dimensions |
|---|---|
| Filter bar (`StandardDirectoryFilters`) | Search (`search`), City (param **`city`**, labelled "Location"), Type, Sector |
| Always-visible children of the bar | Category pill buttons, Topic pill buttons (fixed `TOPIC_TAGS` allowlist on `tags[]`) |
| Content area | Audience `PersonaFilter` pills (param `persona`) |
| Content area, two `Tabs` rows | Source: Curated/Community/All **(with counts)**; Time: Upcoming/Past/All **(with counts)** |

- **Counts:** the only directory with counts on tabs. Result line present.
- **Empty state:** `EmptyState` with context-aware copy (search vs community vs upcoming). Good.
- **Bugs/smells:** `hasActiveFilters` ignores search/source/persona/tab; **clear-all does not reset
  Topic…** actually resets topic but *not* persona or source; a 40-line scroll-pinning workaround
  (`restoreScrollY`) exists purely because filter interactions yank the viewport — strong signal
  the filter layout itself is the problem.
- **Effectiveness 3 / Consistency 2.** Individually sensible axes; collectively the user must scan
  four different regions to understand what's filtering the list.

### 2.5 Innovation Ecosystem — sparsest

| | |
|---|---|
| Route / page | `/innovation-ecosystem` → `src/pages/InnovationEcosystem.tsx` |
| Filter UI | `src/components/innovation-ecosystem/InnovationEcosystemFilters.tsx` |
| Data | `useInnovationEcosystem` → `innovation_ecosystem` (client-side) |

| Dimension | Control | Notes |
|---|---|---|
| Search | `Input` | param `search` |
| Location | `Select` | derived |
| Service | `Popover`+`Command` searchable combobox | **unique control type on the site** — used nowhere else |

- **Counts:** hero totals only. Result line present. Empty state in results component.
- **Mobile:** stacks correctly (`flex-col sm:flex-row`).
- **Effectiveness 2 / Consistency 3.** No type axis even though the data has an obvious one
  (Incubator / Accelerator / Coworking / Research — `getStandardTypes.innovationEcosystem` already
  defines it and it goes unused here); no sector; no audience. Least filterable directory.

### 2.6 Government Support (Trade & Investment Agencies)

| | |
|---|---|
| Route / page | `/government-support` → `src/pages/TradeInvestmentAgencies.tsx` |
| Filter UI | `TradeInvestmentAgenciesFilters` (wraps `StandardDirectoryFilters`) |
| Data | `useTradeAgencies` → `trade_investment_agencies` (client-side) |

| Dimension | Control | Notes |
|---|---|---|
| Search | `Input` | name, description, services, tagline |
| Location | `Select` | derived — **not sorted** (only directory whose location list isn't sorted) |
| Type | `Select` | `organisation_type`, display-prettified |
| Sector | `Select` | `sectors_supported[]` with `'all'` sentinel rows in data |
| Category | `Select` (behind "Filters" toggle) | `useOrganisationCategories`, `category_slug` |

- **Counts:** hero receives `categories` + full `agencies` array (category cards in hero); result line present.
- **Fragility:** filtering compares the lowercased *display label* against a `normalise()`d DB
  value (`formatTypeLabel` → `normalise` round-trip). Works today; breaks the moment a label is
  reworded. Options should carry `{ value, label }` pairs.
- **Effectiveness 3 / Consistency 3.** Closest existing consumer of the shared component; Category
  vs Type overlap mirrors the Service Providers problem.

### 2.7 Leads

| | |
|---|---|
| Route / page | `/leads` → `src/pages/Leads.tsx` |
| Filter UI | `StandardDirectoryFilters` (no children) + separate Sort `Select` in the results header |
| Data | `useLeadDatabases` → `lead_databases` (client-side); `useLeadDatabaseStats` for hero counts |

| Dimension | Control | Notes |
|---|---|---|
| Search | `Input` | title, descriptions, tags |
| Location | `Select` | derived — not sorted |
| Type | `Select` | `list_type` vs **hard-coded** `getStandardTypes.leads` ('Lead Database', 'Market Data', 'TAM Map') — silently drops any new DB value |
| Sector | `Select` | derived |
| Sort | `Select` — detached, right-aligned above the grid | newest / most_records; param `sort` |

- **Counts:** `countsByType` already computed and shown in the hero — ready-made for tab counts.
- **Mobile:** inherits the non-wrapping shared row.
- **Effectiveness 3 / Consistency 3.** Cleanest candidate for Investors-style type tabs: small
  fixed taxonomy + counts already exist. Sort control placement is unique to this page.

### 2.8 Case Studies — messiest, priority refactor

| | |
|---|---|
| Route / page | `/case-studies` → `src/pages/CaseStudies.tsx` (~820 lines, everything inline) |
| Filter UI | bespoke: sticky top bar + desktop left sidebar + mobile drawer |
| Data | `useCaseStudies` → `content_items` (+ `content_company_profiles`, `content_founders`) |

| Dimension | Control | Location | Notes |
|---|---|---|---|
| Outcome (primary) | hand-rolled tab buttons: All / Success Stories / Failure Stories | sticky bar | `content_company_profiles[0].outcome`; param `outcome`, default `all` |
| Search | `Input` with inline clear-X | sticky bar | param `search` |
| Sort | `Select` | **sidebar** | recent / views / alphabetical; default `recent` |
| Monthly Revenue | `Select` of ranges | sidebar | param `revenue`, default **`any`**; custom `$`-string parsing |
| Entry Costs | `Select` of ranges | sidebar | param `costs`, default `any` |
| Industry | `Select` | sidebar | profile `industry`; param `industry`, default `any` |
| Origin Country | `Select` w/ flag emoji | sidebar | profile `origin_country`; default `any` |
| View mode | grid/list toggle | sticky bar | param `view` — presentation, not filtering |

- **Counts:** rich hero stats (total/success/failure/industries/countries); active-filter badge on
  the mobile Filters button; result line in the sticky bar.
- **Mobile:** dedicated collapsible drawer duplicating the sidebar. Most elaborate mobile handling
  on the site — and completely nonstandard.
- **Effectiveness 3 / Consistency 1.** The only sidebar layout, the only `any` default, the only
  view toggle, the only sticky filter bar, plus a private country-flag map and money parsers
  inline in the page. Feature-rich but structurally alien; exactly the consolidation target.

### 2.9 Market Entry Guides (Content)

| | |
|---|---|
| Route / page | `/content` → `src/pages/Content.tsx` |
| Filter UI | inline in page |
| Data | `useContentItems({contentType: ['guide','article','success_story']})` + `useContentCategories` |

| Dimension | Control | Notes |
|---|---|---|
| Type (primary) | underline text-tabs: All Content / Guides / Articles / Success Stories | `content_type`; param `type` |
| Search | `Input` | param `search` |
| Category | pill `Button` row | `content_categories` (only those with content); param `category` — stores the **category UUID** in the URL (ugly/unstable links) |

- **Counts:** hero totals; result count **only shown when a filter is active** — only directory
  that hides the default count. No pagination at all (full list renders).
- **Mobile:** pills wrap; tabs row can overflow (no wrap on the type tab row).
- **Effectiveness 3 / Consistency 3.** Spiritually closest to Investors (tabs + pills + search) but
  with two different tab styles on one page, no location/sector, and UUID URLs.

---

## 3. Consistency matrix

| | Investors | Svc Providers | Mentors | Events | Innovation | Gov Support | Leads | Case Studies | Content |
|---|---|---|---|---|---|---|---|---|---|
| Uses `StandardDirectoryFilters` | — | ✔ | — | ✔ | — | ✔ | ✔ | — | — |
| Category/type tabs or pills | ✔ Tabs | — (2 dropdowns) | — (dropdown) | pills | — | — (2 dropdowns) | — (dropdown) | custom tabs | underline tabs + pills |
| Counts on/near primary axis | hero | — | — | on tabs | — | hero cards | hero | hero | — |
| Search param | `search` | `search` | **`q`** | `search` | `search` | `search` | `search` | `search` | `search` |
| Location filter | — | ✔ | ✔ | ✔ (`city`) | ✔ | ✔ | ✔ | — (origin country) | — |
| Sector filter | ✔ | ✔ | ✔ (adv.) | ✔ | — (services) | ✔ | ✔ | — (industry) | — |
| Audience filter | — | ✔ | ✔ (adv.) | ✔ | — | — | — | — | — |
| Sort | — | ✔ (adv.) `featured` | ✔ `featured` | — | — | — | ✔ `newest` | ✔ `recent` | — |
| Clear-all resets everything | ✔ | ✔ | ✔ | ✖ (misses persona/source) | ✔ | ✔ | ✔ | ✔ | ✔ |
| Result count always visible | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ |
| URL-synced | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ (no page) |
| Mobile OK | ✔ | ✖ | ✔ | ✖ | ✔ | ✖ | ✖ | ✔ (drawer) | ~ |

(✖ mobile = inherited non-wrapping `StandardDirectoryFilters` row.)

---

## 4. Recommended standard pattern

### 4.1 Layout (Investors-style, top to bottom)

1. **Hero** — unchanged per directory, keeps stat cards.
2. **Category/Type tab row** — shadcn `Tabs`, wrapping, **with counts** (`All (447)`, `VCs (212)`…).
   One primary axis per directory; fixed, curated taxonomies preferred over derived lists.
3. **Control row** — Search (flex-1, `search` param) → Location `Select` → Sector `Select` →
   optional Sort `Select` → optional "Filters" toggle (only if an advanced panel exists), stacking
   to a column below `sm`.
4. **Audience pill row** — `PersonaFilter`, rendered *inside* the bar (not floating in content),
   only where a backing field exists.
5. **Advanced panel** (collapsed) — directory-specific extras, config `children`.
6. **Meta row** — always-visible "Showing X of Y {noun}" + "Clear all filters" (resets *every*
   dimension including audience/tabs).

### 4.2 Shared component + hook

New: `src/components/common/DirectoryFilterBar.tsx` + `src/hooks/useDirectoryFilters.ts`
(additive; `StandardDirectoryFilters` untouched until all four consumers migrate).

```ts
// All options are value/label pairs — kills the label-as-value fragility (§2.6, §2.7)
interface FilterOption { value: string; label: string; count?: number }

interface SelectFilterConfig {
  param: string;            // URL param + state key, e.g. "location"
  allLabel: string;         // "All Locations"
  options: FilterOption[];
  width?: string;
}

interface DirectoryFilterConfig {
  noun: string;                                  // "investors" — for the meta row
  search?: { placeholder: string };              // param is always "search"
  tabs?: {                                       // primary axis
    param: string;                               // "type", "outcome", …
    options: FilterOption[];                     // counts rendered when present
    allLabel?: string;                           // default "All"
  };
  selects?: SelectFilterConfig[];                // Location, Sector, directory extras
  audience?: boolean;                            // PersonaFilter pills, param "persona"
  sort?: { options: FilterOption[]; defaultValue: string };
  advanced?: React.ReactNode;                    // collapsed panel
}

// useDirectoryFilters(config): URL <-> state sync (replace: true), defaults omitted from URL,
// clearAll() resetting every dimension, page-reset callback on any change.
// Model on useMentorFilters (src/components/mentors/MentorFilters.tsx:62-88), generalised.
```

Conventions locked in by the hook: param names `search`/`type`/`location`/`sector`/`persona`/
`sort`/`page`; sentinel `all` (never `any`); slugs — not display labels or UUIDs — as option
values; result count always visible; pure filter predicates live beside the config so they can be
unit-tested with the existing `node --test` runner.

### 4.3 Per-directory mapping (keep / add / remove / rename)

| Directory | Tabs (primary) | Keep | Add | Remove / consolidate | Rename |
|---|---|---|---|---|---|
| **Investors** | Type (existing) | Search, Stage, Sector | counts on tabs; Location select | — | — |
| **Case Studies** | Outcome (All/Success/Failure) w/ counts | Search, Sort, Industry, Origin Country | — | sidebar layout → standard bar; Revenue+Costs move to advanced panel; view toggle stays but out of filter bar | params `any`→`all`; "Industry"→Sector slot |
| **Content** | Content type (existing) w/ counts | Search, Category pills (as advanced or secondary pill row) | pagination + always-on count | second tab style (unify on `Tabs`) | category param UUID → slug |
| **Innovation Ecosystem** | **Type (new)** — Incubator/Accelerator/Coworking/Research from `getStandardTypes.innovationEcosystem` (needs data check, §6) | Search, Location | Service select (standard `Select`) | `Command` combobox | `service` param stays |
| **Leads** | **Type (new)** — Lead Database/Market Data/TAM Map w/ existing `countsByType` | Search, Location, Sector, Sort | — | detached sort → control row | — |
| **Gov Support** | **Category (new)** — org categories (already in hero cards) | Search, Location, Type→select, Sector | — | advanced panel (Category moves to tabs) | value/label pairs replace prettify-and-compare |
| **Events** | Category (curated list) w/ counts | Search, City→Location, Type, Sector, Audience | — | Topic pills → advanced panel; Source + Upcoming/Past stay as secondary tabs above results (they partition, not filter); delete scroll-pinning hack after layout consolidation | `city`→`location`; clear-all resets persona/source |
| **Service Providers** | **Category (new)** — provider categories | Search, Location, Sector, Sort, Verified (advanced), Audience | — | Type dropdown (folds into Category tabs); service pills either become a Services select or are dropped — **stop overwriting the search term** | — |
| **Mentors** | **Category (new)** — `mentor_categories` (keep `/mentors/:categorySlug` routes writing to the same param) | Search, Location, Sort, Audience, Sector pills (advanced), Corridor pills (advanced — genuinely valuable, keep) | — | — | param `q`→`search` |

---

## 5. Prioritised implementation plan

Each phase = one scoped, reversible PR. The new bar ships additively; any directory can be
reverted independently.

**Phase 0 — Quick wins, no new component (small PR, immediate value)**
- Fix `StandardDirectoryFilters` mobile: `flex-wrap` / `flex-col sm:flex-row` (fixes SP, Events, Gov Support, Leads at once).
- Events: clear-all resets persona + source; include search in `hasActiveFilters`.
- Mentors: accept `search` param (keep `q` as read-fallback for old links).
- Content: always show result count.
- Gov Support: sort the locations list; pass `{value,label}` for types/sectors.

**Phase 1 — Build the standard (foundation PR)**
- `DirectoryFilterBar` + `useDirectoryFilters` + pure predicate helpers with `node --test` unit tests.
- Migrate **Investors** first: near-zero visual delta (it *is* the pattern), proves parity cheaply. Add tab counts + Location select.

**Phase 2 — Case Studies (messiest, biggest win)**
- Replace sidebar/drawer/sticky-bar with the standard bar: Outcome tabs w/ counts, search, Sector (industry), Origin Country, Sort; Revenue/Costs ranges into the advanced panel.
- Extract money parsing + `COUNTRY_FLAGS` out of the page. Parity checklist: every §2.8 dimension still reachable, old URL params redirected (`any`→`all`).

**Phase 3 — Simple adopters: Content, Innovation Ecosystem, Leads**
- Small datasets, few dimensions, each gains a proper type-tab row with counts. Leads' `countsByType` is already computed.

**Phase 4 — Gov Support, then Events**
- Events is the hardest consolidation (9 dimensions, 4 clusters); do it after the pattern has survived four directories. Removing the scroll-pinning hack is the acceptance signal.

**Phase 5 — Service Providers, then Mentors**
- Highest-traffic + most intertwined (data provider render-prop on SP; route-param category on Mentors). Mentors last: it already has the best state handling, so it loses the least by waiting.

**Phase 6 — Cleanup**
- Delete `StandardDirectoryFilters`, `InvestorFilters`, `InnovationEcosystemFilters`, `TradeInvestmentAgenciesFilters`; fold `MentorFilters` UI into the shared bar (its hook logic graduates into `useDirectoryFilters`).

### Test plan (per migrated directory)
- Parity checklist from the §2 tables: every dimension, control, default, URL param (old params honoured or redirected).
- Unit tests (existing `node --test` runner) for the pure filter predicates and URL-state serialisation — mirror `src/lib/authReturnPath.test.ts` style. Note: the repo has **no React component test infra** (no vitest/RTL); adding it is optional follow-up, not a blocker.
- Manual: combination filtering (search+tab+location+sector+audience), count updates, clear-all, empty state, mobile wrap at 375px, tier-gating untouched (`ListingPageGate`/`UsageBanner` are outside the filter bar and unaffected).

---

## 6. Data-field gaps (flag, don't build here)

| Gap | Affected filter | Follow-up |
|---|---|---|
| No audience/persona field on `investors`, `innovation_ecosystem`, `trade_investment_agencies`, `lead_databases`, `content_items` | Audience pills can't extend beyond SP/Events/Mentors | Ticket: add `persona_fit`/`target_personas` where the axis is meaningful (likely Gov Support + Content; probably not Investors) |
| `innovation_ecosystem` type axis — verify a usable type/category column exists (taxonomy exists in `getStandardTypes.innovationEcosystem` but the page derives nothing) | New Type tabs (§4.3) | Confirm column/backfill; else derive from `services[]` as interim |
| `lead_databases.list_type` free-text vs hard-coded label list | Leads Type tabs | Enum/check-constraint or config-from-distinct-values |
| Case Studies `monthly_revenue`/`startup_costs` stored as `$`-strings, parsed client-side | Range filters | Optional: numeric columns for robust ranges |
| Content category URL param is a UUID | Shareable URLs | Use `content_categories` slug (add slug column if missing) |
| Events `city` derived + separate from `location` string | Location select | Fine as-is; just rename the param |

No RLS, payments, report-generation, or schema changes are made by this audit. All reads are
against existing public directory tables/views (`investors_public`, `community_members_public`,
`service_providers`, `events`, `lead_databases`, `content_items` (+ profile joins),
`innovation_ecosystem`, `trade_investment_agencies`, `content_categories`, `mentor_categories`).
