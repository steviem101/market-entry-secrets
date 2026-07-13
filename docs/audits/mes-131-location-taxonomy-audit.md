# MES-131 — Location Taxonomy Consolidation Audit (Phase A)

> **Ticket:** MES-131 — *Location taxonomy consolidation: dedupe near-duplicate location values across all directories & forms*
> **Gate stage:** Audit (read-only). **No data writes, no schema changes** in this PR.
> **Branch note:** rides on `claude/mes-filter-option-curation-m525iw` / PR #426 (the MES-130 audit
> PR) because that is this session's authorised branch — separate audit doc kept per the combined
> run-order rule; Phase B PRs should use `mes-131-*` branches.
> **Date:** 2026-07-13 · live prod `xhziwveaiuhzdoutpgrh`, read-only.

## 1. Executive summary — the taxonomy already exists; nothing joins to it

The repo/DB already contains a curated canonical location layer: **`public.locations`, 23 rows**
(12 AU/NZ cities, 7 states/territories, 4 NZ regions — each with slug, keywords, landing-page
content, feeding `/locations/:slug`). Most directory tables even carry a **`location_id` FK** to it.
The consolidation problem is not "invent a taxonomy"; it is **"the FK is almost never populated, so
every filter falls back to raw free-text `location` strings"**:

| Table | Rows | `location_id` populated | Distinct raw `location` values |
|---|---|---|---|
| `service_providers` | 113 | **0** | 27 |
| `community_members` (mentors) | 134 | **0** | 25 |
| `trade_investment_agencies` | 149 | **0** | ~100 (raw street addresses; `location_city` populated on 133) |
| `events` | 212 | 81 (38%) | city column is clean (12 values) |
| `innovation_ecosystem` | 217 | 111 (51%) | 51 |
| `investors` | 499 | *(no FK column)* | **87** |

Classic dupe clusters confirmed (the user's report): `Greater Sydney Area` 35 vs
`Sydney, New South Wales, Australia` 33 (mentors); `Sydney, NSW` 62 vs `Sydney` 8 (innovation);
`Sydney, NSW` 181 vs `Sydney` 6 vs `Sydney, Australia` 5 vs six address-suffixed variants
(investors); plus suburb-level fragments (`Surry Hills`, `North Sydney`, `Richmond`, `Prahran`,
`Fortitude Valley` …) that all mean their metro city for filtering purposes.

## 2. Deliverables — complete value→canonical mappings

Every raw value in every table mapped to a `locations.slug` (or a proposed new row), with counts
and notes, in [`docs/audits/mes-131/`](mes-131/):

- [`investors-location-to-canonical.csv`](mes-131/investors-location-to-canonical.csv) — 87 values
- [`service-providers-location-to-canonical.csv`](mes-131/service-providers-location-to-canonical.csv) — 27
- [`mentors-location-to-canonical.csv`](mes-131/mentors-location-to-canonical.csv) — 25
- [`innovation-ecosystem-location-to-canonical.csv`](mes-131/innovation-ecosystem-location-to-canonical.csv) — 51
- [`events-city-to-canonical.csv`](mes-131/events-city-to-canonical.csv) — 12
- **Trade agencies:** no CSV — the raw `location` column is unusable street addresses, but
  **`location_city` is populated on 133/149** and is nearly clean (Sydney 41, Melbourne 19,
  Auckland 9, Canberra 7 …). Rule-based mapping: `location_city` → city slug; ~10 junk values
  (`KOTRA Bldg`, `L5`, `PO Box`, `NSW 2000`, suburb names) listed for manual fix; 16 nulls → All.

**Mapping rules used (consistent across all CSVs):** exact city → city slug; metro suburb → its
city slug; regional town with no canonical row → its state slug; state/region names → state slug;
multi-site values → semicolon list, **first = primary** (fills the single-valued `location_id`);
non-AU/NZ → `international`; country-level (`Australia`, `National`, `New Zealand`) → country rows.

## 3. Gaps in the canonical `locations` table (additive seed rows needed)

The 23-row table cannot receive every mapping; Phase B needs **4 additive rows** (flagged
`proposed:` in the CSVs):

| Proposed row | Why | Rows depending on it |
|---|---|---|
| `australia` (country) | `Australia`/`National` is the single biggest raw value across tables (73 investors, 27 IE, 14 SP, 9 mentors) | ~125 |
| `new-zealand` (country) | country-level NZ values | ~4 |
| `international` (country/other) | all non-AU/NZ rows (Singapore, London, SF, …) — keeps every row filterable | ~45 |
| `tasmania` (state) | only AU state missing; Hobart rows have no home | ~3 |

Also noted, **not** proposed (state slug suffices at current volumes): Newcastle, Geelong,
Wollongong, Byron Bay, Sunshine Coast city rows.

## 4. Phase B plan (approval-gated — bulk data writes)

Additive and reversible throughout; raw `location` strings are **never modified** (they remain the
display value and the rollback):

1. **Seed migration:** the 4 new `locations` rows (idempotent inserts).
2. **Per-table backfill migrations** driven by the reviewed CSVs: populate `location_id`
   (+ add the FK column to `investors`, which lacks it). One PR per table, spot-check sample in
   each PR description.
3. **Filter swap (per MES-130 curation rollout):** location selects read the canonical joined
   value (`locations.name` via `location_id`) instead of raw strings — options collapse from
   27–87 to ≤ ~15 per directory, then MES-130 top-10 + overflow applies on top.
4. **Forms follow-up:** submission forms (directory submissions, admin enrichment) should write
   `location_id` going forward or the free-text tail regrows — same class of gap as the Events
   type-on-ingest fix (MES-130 audit §8.6).

**Unreachability guard:** rows whose `location_id` stays null (junk values pending manual fix)
remain reachable via **All** — the MES-130 null rule; the count-sum invariant
(`visible + overflow + nulls = All`) applies to location selects too.

## 5. Approval gate

Phase A stops here. The CSVs are the review artefact: sign off (or amend) the mappings and the 4
seed rows, then Phase B proceeds table-by-table with the investor stage/sector work sequenced in
[`mes-130/investor-vocabulary-consolidation.md`](mes-130/investor-vocabulary-consolidation.md).
