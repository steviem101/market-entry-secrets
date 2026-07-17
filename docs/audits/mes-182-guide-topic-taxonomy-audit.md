# MES-182 Phase A — Guides Topic Taxonomy Audit (REVIEW — awaiting sign-off)

**Status:** audit + proposal only. **No schema or data changes have been made.** Phase B
(migration + UI) is blocked on approval of this document.

**Origin:** MES-177 B3 Finding 2
(`docs/audits/mes-177/B3-guides-and-casestudy-filter-review.md`) — the guides' real browse gap
is a *topic* axis, not sectors. Live data verified read-only against prod
(`xhziwveaiuhzdoutpgrh`) on 2026-07-17.

---

## 1. Count correction — the scope is 44 guides, not 21

The ticket says "the 21 published guides". Live prod today:

- `content_type = 'guide' AND status = 'published'` → **44 rows**, **all 44** in the single
  generic **"Market Entry Guides"** category (`content_categories.slug = 'market-entry-guides'`).
- B3's "21" was the count of **untagged** guides (`sector_tags` NULL or empty `{}`), not the
  count of published guides. Today's split of the 44: **21 untagged + 23 sector-tagged**
  (the tagged ones are mostly the 9 sector playbooks, 3 country-corridor guides, and
  ANZ-expansion compliance guides published 2026-06-05/06).

**Consequence:** the topic taxonomy must cover all **44** guides — the browse axis applies to
the whole guide set, and the ticket's 6 candidate buckets (drawn from the 21 horizontal
guides) don't accommodate the 9 sector playbooks or 3 corridor guides. The proposal below adds
buckets for those.

## 2. Schema audit (verified live, 2026-07-17)

### `content_items` (relevant columns)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `slug` | text NOT NULL, UNIQUE | |
| `title`, `subtitle` | text | |
| `category_id` | uuid NULL, FK → `content_categories(id)` | single-valued — one category per item |
| `content_type` | text NOT NULL, default `'article'` | **no CHECK constraint** — free text |
| `status` | text NOT NULL, default `'published'` | |
| `sector_tags` | text[] NULL | canonical MES-110 slugs |
| `sector_agnostic` | boolean NULL, default false | precedent: additive flag column added for the horizontal-guide problem |
| `featured` | boolean | |

There is **no topic/subject column of any kind** today. No CHECK constraints exist on
`content_type` or `status` (only PK, slug UNIQUE, and the `category_id` FK).

### `content_categories`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `slug` | text NULL | **exists now** (added post-MES-100; the header comment in `src/lib/contentFilters.ts:5-6` saying "no slug column" is stale) |
| `description`, `icon`, `color` | text NULL | used by content cards |
| `sort_order` | integer default 0 | drives select ordering |

### Current category usage (published items) — the vocabulary is already mixed

| Category | content_type(s) | Published |
|---|---|---|
| Market Entry Guides | guide | **44** (all guides) |
| Technology Market Entry | case_study | 88 |
| Fintech Success | case_study | 28 |
| Australian Startup Success | case_study | 22 |
| Legal & Compliance | case_study (5) + compliance (2) | 7 |
| Success Stories | case_study | 3 |
| Expert Interviews | interview | 2 |
| Best Practices | best_practice | 2 |
| Video Tutorials / E-commerce Giants / Healthcare Innovation | — | 0 (empty) |

`content_categories` is a **shared, already-incoherent vocabulary**: it mixes type-like
buckets (Expert Interviews, Best Practices), sector-like buckets (Fintech Success,
Technology Market Entry), and the generic guides bucket. This weighs on the schema choice (§5).

## 3. MES-108 cross-check — no collision if we add a new column

- MES-108's audit doc has **not landed** in the repo (no `docs/audits/*mes-108*`; the only
  MES-108 references are in MES-110/MES-130 docs and `eventTypeBuckets.ts`).
- Its finding is **confirmed live**: `content_type` values in prod are
  `guide` (44) / `case_study` (146) / `compliance` (2) / `interview` (2) / `best_practice` (2)
  — there are **no `article` or `success_story` rows**, while `/content`
  (`src/pages/Content.tsx:44-46`) fetches exactly `['guide','article','success_story']` and
  defines tabs for them. Net effect today: `/content` renders **only the 44 guides** (zero-count
  tabs are hidden since MES-130, so no phantom tabs render), and the 6 published
  compliance/interview/best_practice items are **invisible on `/content`** (case studies have
  their own page). That re-mapping is MES-108's to fix.
- **Collision analysis:** MES-108 owns `content_type` values; this ticket recommends a **new
  `guide_topic` column** and touches neither `content_type` values nor existing
  `content_categories` rows → **no shared columns, no collision**. If MES-108 later re-types
  the 6 hidden items, nothing here changes.

## 4. Proposed topic taxonomy (8 buckets, single-topic)

The ticket's candidate set (6 buckets) fits the 21 horizontal guides but not the full 44.
Proposed vocabulary — slugs are the stored values, labels are the UI strings:

| # | Slug | Label | Guides |
|---|---|---|---|
| 1 | `registration-structure` | Registration & company structure | 4 |
| 2 | `tax-finance` | Tax, finance & banking | 4 |
| 3 | `employment-visas` | Employment, hiring & visas | 3 |
| 4 | `ip-legal` | IP & legal agreements | 2 |
| 5 | `regulation-compliance` | Regulation, privacy & compliance | 4 |
| 6 | `funding-grants-equity` | Funding, grants & equity | 4 |
| 7 | `strategy-gtm` | Strategy & go-to-market | 11 |
| 8 | `sector-corridor-playbooks` | Sector & corridor playbooks | 12 |

Total = 44. ≤8 values satisfies the MES-177 bar-anatomy low-cardinality contract, so the axis
could be rendered as tabs on a future dedicated guides page as well as a select on `/content`.

**Single- vs multi-topic decision: single primary topic.** Every one of the 44 maps cleanly to
one primary bucket (see the `Alt` column for the 6 genuinely dual-natured guides — each has a
defensible primary). Multi-topic (an array) would reintroduce the array-overlap filtering
complexity and count ambiguity ("counts per facet sum > total") for no real browse benefit at
n=44. Revisit only if the guide library grows into genuinely cross-topic content.

**Variants considered (call out in review if preferred):**
- **7 buckets:** merge `ip-legal` (2) into `regulation-compliance` → "Legal, IP & compliance" (6).
  Slightly cleaner counts, slightly muddier label.
- **9 buckets:** split `sector-corridor-playbooks` into sector playbooks (9) and country
  corridors (3). More precise, but 3-item bucket and pushes the axis to the tab-contract ceiling.

## 5. Complete guide → topic mapping (all 44)

`Alt` = defensible alternative bucket, noted so any row can be flipped in review.

| Guide (slug) | Proposed topic | Alt |
|---|---|---|
| australian-business-registration-guide | registration-structure | |
| foreign-company-setup-anz | registration-structure | |
| entry-structure-subsidiary-branch-distributor | registration-structure | strategy-gtm |
| au-startup-structure-company-trust | registration-structure | |
| australian-tax-obligations-guide | tax-finance | |
| cross-border-pricing-billing-gst-anz | tax-finance | strategy-gtm |
| au-gst-bas-bookkeeping-startups | tax-finance | |
| business-banking-payments-anz | tax-finance | |
| employment-payroll-superannuation-anz | employment-visas | |
| talent-visa-sponsorship-anz | employment-visas | |
| au-first-employees-payg-super-fairwork | employment-visas | |
| au-startup-ip-trademarks-patents | ip-legal | |
| au-cofounder-agreements-founding-team | ip-legal | funding-grants-equity |
| firb-foreign-investment-approval-anz | regulation-compliance | |
| australia-market-entry-regulatory-compliance | regulation-compliance | |
| data-residency-privacy-act-anz | regulation-compliance | |
| government-enterprise-procurement-anz | regulation-compliance | strategy-gtm |
| au-startup-fundraising-safe-esic | funding-grants-equity | |
| au-employee-share-option-plan-esop | funding-grants-equity | employment-visas |
| au-startup-grants-government-support | funding-grants-equity | |
| au-rd-tax-incentive-rdti | funding-grants-equity | tax-finance |
| how-to-choose-market-entry-strategy-australia | strategy-gtm | |
| how-to-choose-target-market-australia-nz | strategy-gtm | |
| distributor-vs-direct-entry-australia | strategy-gtm | |
| control-vs-flexibility-market-entry-anz | strategy-gtm | |
| how-long-market-entry-australia-takes | strategy-gtm | |
| cost-of-entering-australian-market | strategy-gtm | |
| australia-market-entry-risks-mitigation | strategy-gtm | |
| competitor-analysis-australian-market | strategy-gtm | |
| localising-product-pricing-marketing-australia | strategy-gtm | |
| au-startup-go-to-market-first-customers | strategy-gtm | |
| market-entry-services-australia-guide | strategy-gtm | |
| fintech-market-entry-anz | sector-corridor-playbooks | |
| regtech-identity-verification-anz | sector-corridor-playbooks | |
| saas-go-to-market-anz | sector-corridor-playbooks | strategy-gtm |
| cybersecurity-market-entry-anz | sector-corridor-playbooks | |
| retail-qsr-market-entry-anz | sector-corridor-playbooks | |
| healthtech-medtech-market-entry-anz | sector-corridor-playbooks | |
| ai-data-platform-market-entry-anz | sector-corridor-playbooks | |
| cleantech-energy-market-entry-anz | sector-corridor-playbooks | |
| edtech-training-market-entry-anz | sector-corridor-playbooks | |
| irish-tech-founders-guide-anz-expansion | sector-corridor-playbooks | |
| india-to-anz-market-entry | sector-corridor-playbooks | |
| canada-to-anz-market-entry | sector-corridor-playbooks | |

Bucket sums: 4 + 4 + 3 + 2 + 4 + 4 + 11 + 12 = **44** ✓ (complete, no orphaned topics —
every bucket has ≥2 guides).

## 6. Schema recommendation: new `guide_topic` column (NOT new category rows)

### Recommended: additive `content_items.guide_topic text NULL` + CHECK constraint

```sql
ALTER TABLE content_items ADD COLUMN guide_topic text;
ALTER TABLE content_items ADD CONSTRAINT content_items_guide_topic_check
  CHECK (guide_topic IS NULL OR guide_topic IN (
    'registration-structure','tax-finance','employment-visas','ip-legal',
    'regulation-compliance','funding-grants-equity','strategy-gtm',
    'sector-corridor-playbooks'));
```

Backfill: one guarded, **slug-keyed**, fill-only-empty (`guide_topic IS NULL` latch) data
migration carrying the §5 table — same pattern as the MES-177 B2 tagging migration.
Idempotent and preview-branch-safe (keyed on stable slugs, no-op where slugs don't exist).

**Why this over new `content_categories` rows:**

| | `guide_topic` column (recommended) | New `content_categories` rows |
|---|---|---|
| Additivity | Purely additive: new column + new rows' values. Existing `category_id` untouched. | Requires **repointing** all 44 guides' `category_id` away from "Market Entry Guides" — an UPDATE on existing rows, and it leaves a newly-empty generic category behind. |
| Blast radius | Zero: nothing reads `guide_topic` until the UI ships. | `category_id` is read by `/content` filtering, `ContentGrid` headings, `FeaturedContent`, `ContentDetail` breadcrumbs/cards — every surface that shows "Market Entry Guides" changes meaning at once. |
| Vocabulary hygiene | Topic is a guide-scoped dimension; the shared category select stays untouched for case studies etc. | Adds 8 more rows to an already-incoherent shared vocabulary (§2), and topic categories would appear as options alongside "Fintech Success" for all content types. |
| Multi-topic later | Column → array migration possible if ever needed. | One FK = single-topic forever (or a join table = bigger change). |
| MES-108 collision | None (new column). | None on columns, but both would churn category semantics near MES-108's re-typing work. |
| UI reuse | Needs one new select in the existing `DirectoryFilterBar` config + a one-line predicate in `contentFilters.ts` (small, tested). | Reuses the existing Category select with zero new filter code. |
| Rollback | Drop column (or just stop rendering the select). | Restore 44 `category_id` values + delete 8 rows. |

The only real advantage of the category-rows approach is reusing the existing select — but the
"new select" cost is genuinely small (the filter bar is config-driven), while the category
approach mutates shared data and semantics. **Recommendation: `guide_topic` column.**

Vocabulary lives in a new pure module `src/lib/guideTopics.ts` (slug → label + ordered list)
with a `.test.ts` (label coverage, slug format), mirroring the `sectorLabels.ts` pattern; the
CHECK constraint keeps the DB honest.

## 7. Phase B UI wiring plan (for approval, not yet implemented)

`/content` (`src/pages/Content.tsx`) already follows the MES-177 bar contract; the change is
config + pure logic only:

1. **New "Topic" select** in the `DirectoryFilterBar` `selects` config, options built with
   `curateValues(items.map(i => i.guide_topic), { labelFor: guideTopicLabel })` — count-ranked,
   zero-hidden, junk-guarded; 8 values so `searchable` not needed. Non-guide items have NULL
   topic and simply never produce options (same behaviour as untagged sectors today).
2. **Filter spec:** add `topic: { param: "topic", default: "all" }` to `CONTENT_FILTER_SPEC`;
   add `topic` to the `allowedValues` map so stale/case-variant `?topic=` URLs coerce to `all`
   (never an empty grid).
3. **Predicate:** extend `filterContent` in `src/lib/contentFilters.ts` with
   `matchesTopic = topic === "all" || item.guide_topic === topic`, + cases in
   `contentFilters.test.ts` (topic match, null-topic exclusion under an active topic,
   "all" passthrough, counts).
4. Tabs stay `content_type` (MES-108's axis); Category select stays untouched.
5. **No sector tags are added or changed anywhere** (hard requirement).

Freemium: `/content` remains gated by `ListingPageGate` exactly as today — no tier changes.
Edge functions: none involved (confirmed — reads go straight through the anon client).
Env vars: none.

## 8. Out-of-scope observations (for follow-ups, no action in MES-182)

1. **Dubious sector tags on some guides** — e.g. `au-cofounder-agreements-founding-team` is
   tagged `construction`, `retail-qsr-market-entry-anz` carries `farming-ranching-forestry`,
   `healthtech-medtech-market-entry-anz` carries `education`. 23 of 44 guides carry sector
   tags of mixed quality. B3 Finding 1 only decided the *untagged 21* stay untagged; nobody
   has reviewed the tagged 23. Worth a small review ticket; **not** touched here.
2. **6 published items invisible on `/content`** (2 compliance, 2 interview, 2 best_practice)
   — MES-108's re-typing territory, noted in §3.
3. **Stale comment** in `src/lib/contentFilters.ts:5-6` claiming `content_categories` has no
   slug column — can be fixed in the Phase B PR touching that file.
4. Three empty `content_categories` rows (Video Tutorials, E-commerce Giants, Healthcare
   Innovation) — harmless (UI filters to categories-with-content) but candidates for cleanup.

## 9. Rollback / disable

- This document: no risk (docs only).
- Phase B schema: additive column + CHECK — revert by dropping both; backfill is slug-keyed
  and re-runnable.
- Phase B UI: its own scoped PR; reverting it removes the Topic select without touching data.

## 10. Sign-off checklist

- [ ] Accept the **44-guide scope** (ticket's "21" corrected)
- [ ] Approve the 8-bucket taxonomy (or pick the 7-/9-bucket variant in §4)
- [ ] Approve the **single-topic** decision
- [ ] Approve the guide→topic mapping table (§5) — flag any row to flip (Alt column shows the alternative)
- [ ] Approve the **`guide_topic` column** schema approach (§6) over new category rows
- [ ] Green-light Phase B: additive migration (column + CHECK + slug-keyed backfill) and the UI wiring PR (§7)
