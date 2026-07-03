# Startmate import batch `startmate-2026-07` — staging review gate

**Date:** 2026-07-03
**Precedes:** applying `scripts/startmate_import_blocks/*.sql` to `ecosystem_import_candidates`, then any promotion into live tables.
**Companion docs:** analysis + rules in `docs/data-analysis/startmate-ecosystem-sheet-analysis.md`; staging DDL in `supabase/migrations/20260703120000_create_ecosystem_import_candidates.sql`.
**No production writes have been made.** The migration is unapplied; the blocks are generated but not executed.

## Summary

314 candidates generated from the 896-row sheet. Every candidate proposed for import or flagged as related (186) was **web-verified by parallel research agents on 2026-07-03** — existence, current activity (2024+ evidence), corrected website/location/description/founded, with source URLs stored in each candidate's `verification` jsonb.

| Entity type | Total | insert_new | enrich_existing | related_review | content_guide | review | exclude |
|---|---:|---:|---:|---:|---:|---:|---:|
| investor_fund | 117 | 59 | 54 | 1 | — | — | 3 |
| investor_person | 29 | — | 1 | — | — | 28 | — |
| accelerator | 90 | 26 | 18 | 17 | — | — | 29 |
| coworking_space (grouped orgs) | 28 | 22 | 3 | 3 | — | — | — |
| newsletter | 48 | — | — | — | 40 | — | 8 |
| podcast | 2 | — | — | — | 2 | — | — |
| **Total** | **314** | **107** | **76** | **21** | **42** | **28** | **40** |

**Verification verdicts (186 researched):** 160 verified · 11 inactive · 3 defunct · 2 not_found · 10 uncertain. 134 candidates received field corrections (websites, HQ cities, founding years, one-line descriptions). The 128 unresearched candidates are `enrich_existing` (COALESCE-only NULL-fills reviewed at apply time), `review` (fund-less people), or sheet-flagged excludes.

## What the research pass caught (would have polluted the directory)

The sheet *was* stale — 16 records that looked importable were killed or downgraded by verification:

| Record | Verdict | Evidence (abridged; full text + sources in the candidate row) |
|---|---|---|
| 1835i (fund) | defunct | ANZ shut its venture arm Oct 2025 after selling its Airwallex stake; team redundant |
| Startup Galaxy (fund) | inactive | Rebranded away from startup-ecosystem work |
| Hansa Accelerator | defunct | hansa.network is now a parked for-sale domain |
| Whakatipu Incubator | inactive | HTK Group announced the March 2025 intake as final |
| SunRamp | inactive | No activity since ~Q1 2022; site dead |
| PRF Growth Incubator (SEFA) | inactive | Inaugural cohort only; no 2024+ evidence |
| UTS Techcelerator | inactive | Cohort pages end 2019–2022 |
| UTS Startups Growth Funding | inactive | Program page dead; no 2024+ cohorts |
| Bootstrapped NZ (newsletter) | defunct | Last edition May 2023 |
| Two by Two, Community VC, Funding Climatetech, Rare Candy, Pulse Check (newsletters) | inactive | Last issues Feb–Dec 2024 or product rebrand |
| Fullstack eCommerce (newsletter) | not_found | Subscribe link 404s |
| NZGCP Aspire (newsletter) | not_found | No distinct newsletter locatable |

Also materially corrected rather than excluded: **XV Capital is Sydney, not Adelaide** (sheet error); Creative HQ is **Wellington, not Auckland**; MOVAC is Wellington; "Lead Out" is Leadout Capital (Palo Alto); "Outset Venture" → Outset Ventures; "Backbone Ventures" is officially Backbone Partners; Stone & Chalk Sydney moved to Tech Central (477 Pitt St); Swinburne Accelerator rebranded "Elevate Program". Relation questions resolved: **LuminaX = the existing investors."LX Health" org** (same operator); Griffin Accelerator, Genesis, EnergyLab, Sprout (NZ), CSIRO ON Accelerate are **siblings of existing records, not duplicates**; Cicada, iLab UQ, Monash Generator, RMIT Activator are the **same programs** as existing records.

**Kept but flagged `uncertain` (10):** Power of N/Headline and Kokiri (insert candidates — recommend reviewer decision), plus 8 newsletters (AirMail, Deeptech MSV, Impactsheet, Startup builder, Fullstack ×2, The Labs, Square Peg All Signal) which stay in the guide list but should be re-checked editorially.

## Apply rules (per the approved plan)

| proposed_action | On approval, the apply step will… |
|---|---|
| `insert_new` (107) | Plain INSERT into the destination table (`investors` ×59, `innovation_ecosystem` ×48). Descriptions composed from verified facts; then run `enrich-investors` / `enrich-innovation-ecosystem` for logos/long copy. Never upsert-overwrite. |
| `enrich_existing` (76) | `COALESCE(existing, new)` NULL-fills only — fund contacts into `contact_name` + `details.contacts`, LinkedIn URLs, websites. Existing non-NULL values never change. |
| `related_review` (21) | Human call per row: sibling program worth its own row vs merge vs skip. Verification evidence answers most of these already (see above). |
| `content_guide` (42) | Source list for one curated `content_items` guide ("ANZ startup newsletters & podcasts") — editorial ticket, not a bulk import. |
| `review` (28) | Fund-less VC people. Recommend: import none in this batch; revisit only if the mentors/angels pipeline wants them. |
| `exclude` (40) | Stays in staging as an audit record; never promoted. |

## How to run this batch (admin, after PR merge)

1. Apply the staging migration via the normal CLI flow (`supabase db push`) — **note the migration-ledger drift freeze: merged ≠ applied; a human must apply it** (docs/migrations.md).
2. Execute `scripts/startmate_import_blocks/01…06_*.sql` against prod (psql/MCP, service role). Idempotent: `ON CONFLICT (batch_id, dedupe_key) DO NOTHING`.
3. Review: `SELECT entity_type, proposed_action, name FROM ecosystem_import_candidates WHERE batch_id='startmate-2026-07' AND status='pending' ORDER BY 1,2;` — flip `status` to `approved`/`rejected`/`duplicate` (admin RLS allows UPDATE via SQL; there is no UI yet).
4. Promotion SQL for approved rows is generated in the next phase (per-destination apply scripts, stamping `applied_at` + `target_record_id`).
5. Rollback at any point: `DELETE FROM ecosystem_import_candidates WHERE batch_id='startmate-2026-07';` (staging) — promoted rows are individually tracked via `target_record_id`.

## Reproducing the pipeline locally

```
# inputs (gitignored, PII): data/private/startmate/{startmate_community_sheet.xlsx, live_snapshot.json, verification_results.json}
python3 scripts/parse_startmate_sheet.py            # xlsx -> parsed JSON + profile
python3 scripts/generate_startmate_candidates.py    # dry-run summary
python3 scripts/generate_startmate_candidates.py --write   # candidates JSON + SQL blocks
```

`live_snapshot.json` is produced by the read-only SQL embedded in the generator's docstring; `verification_results.json` came from the 2026-07-03 research pass (20 parallel agents, ~11 orgs each, evidence + sources per verdict; LinkedIn never scraped).

## Open items for Stephen

1. Approve applying the migration + staging blocks (steps 1–2 above).
2. §7 questions from the analysis doc still stand — most importantly: US/global funds in batch 1 or ANZ-only? (59 insert_new funds ≈ 28 ANZ / 31 US-global; easy to approve by geography in the review query.)
3. NZGCP / Aspire alias call (probable aliases of the existing "NZ Growth Capital Partners" row — staged as `enrich_existing` with a match note).
4. The 10 `uncertain` records — approve, reject, or hold per row.
