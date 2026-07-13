# Investor sector & stage vocabulary consolidation (Phase A — mapping only)

> **Origin:** flagged by the MES-130 filter-curation audit ("113 sectors is a data problem wearing a
> UI costume") and approved for audit by the owner on 2026-07-13. **Sector taxonomy is MES-110
> territory and stage buckets MES-108-adjacent** — this doc delivers the inventories/mappings those
> tickets need and identifies the cheapest safe fix. **No data writes here.**
> Data: live prod `xhziwveaiuhzdoutpgrh`, 2026-07-13 (`investors` 499 rows).

## 1. Sector: no merge needed — the canonical column already exists and is nearly full

The MES-110 canonicalisation **already covers investors**:

| Check | Result |
|---|---|
| `investors.sector_tags` column | exists (canonical MES-110 slugs) |
| Rows with ≥1 tag | **451 of 499** (90.4%) |
| Distinct canonical slugs | **17** (vs **113** raw `sector_focus` values) |
| Top tags | technology-information-and-media 419, retail 150, financial-services 132, hospitals-and-health-care 121, utilities 108, manufacturing 100, professional-services 85, education 61 … |
| `investors_public` view exposes `sector_tags` | **NO — this is the actual gap** |

**Recommended fix (small, additive, no bulk write):**
1. Migration: recreate `investors_public` adding `sector_tags` (+ `sector_agnostic`) to the column
   list — both are non-PII taxonomy fields, safe for the public view. (View change only; grants and
   RLS posture unchanged.)
2. Frontend: point the Investors Sector select at `sector_tags` (17 canonical values → top-10 +
   overflow per MES-130 rules). `sector_focus` stays untouched as data — search can still match it.
3. Backfill the remaining 48 untagged rows via the MES-110 tagging rules
   (`docs/audits/mes-110/tagging-rules.md`) as a follow-up; until then untagged rows are reachable
   via **All** (MES-130 null rule).

The 113-value `sector_focus` merge everyone assumed was needed is thereby **avoided entirely**.

## 2. Stage: genuine 68-value free-text mess — mapping delivered

No canonical stage column exists. Full inventory + mapping:
[`investor-stage-value-to-canonical.csv`](investor-stage-value-to-canonical.csv) — **all 68 values**
→ a 7-stage canonical ladder + `na`:

`pre-seed → seed → series-a → series-b → series-c-plus → growth → pre-ipo` (+ `na` = not a stage:
advisory/N-A/strategy values, excluded from filter options; `all` in the CSV expands to the full
ladder).

Design decisions for review:
- **Multi-valued mapping.** Range values (`Pre-Seed to Series B`, 2) expand to every stage in the
  range, so an investor stays findable at each stage they actually cover. Implementation is an
  additive `stage_tags text[]` column (mirroring `sector_tags`), backfilled from the CSV;
  `stage_focus` preserved untouched as the rollback.
- **Case/format dupes fold silently:** `Pre-seed` 219 + `Pre-Seed` 38 → `pre-seed`; `Early stage` /
  `Early-stage` / `Early stage (…)` → the early range. This closes the §B2 "visible option misses
  dupe rows" trap flagged in the MES-130 audit.
- **4 parse artifacts found** (`fund investments)`, `Multi-stage (direct VC investments`,
  `Pre-IPO)`, `Series D+ (Growth`): comma-split damage in the source rows. The mapping absorbs them,
  but the 4 underlying `stage_focus` arrays should be repaired in the same backfill (listed in the
  CSV notes).
- **`na` rows (≈14 investors)** get an empty `stage_tags` → reachable via All only, consistent with
  the MES-130 null rule.

Resulting Stage filter: **7 options, all populated** (vs 68 today), e.g. seed ≈ 350+, pre-seed ≈
270+, series-a ≈ 190+ after range expansion.

## 3. Approval gate

Phase B (all additive/reversible, in this order):
1. `investors_public` view + Sector select swap — **no data write**; smallest possible PR.
2. `stage_tags text[]` column + CSV-driven idempotent backfill + Stage select swap — **bulk data
   write, approval-gated**; `stage_focus` untouched = rollback path.
3. Repair the 4 parse-artifact source rows (tiny targeted update, listed above).

Flag to **MES-110**: investors join the tagged-tables list; the 48-row tag gap. Flag to **MES-108**:
the 7-stage ladder as the canonical stage bucket vocabulary.
