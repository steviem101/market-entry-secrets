# Startmate import batch `startmate-2026-07` — staging review gate

**Date:** 2026-07-03 (staged) → **2026-07-04 (applied, polished, tested, closed)**
**Status: CLOSED.** The migration is live in prod, all approved rows are promoted and polished, and the batch has passed post-apply verification. See "Closure summary (2026-07-04)" at the end of this doc for the final state and open follow-ups.
**Companion docs:** analysis + rules in `docs/data-analysis/startmate-ecosystem-sheet-analysis.md`; staging DDL in `supabase/migrations/20260703120000_create_ecosystem_import_candidates.sql`.
**Scope: ANZ-only (batch 1).** The pipeline was **tested end-to-end against a real Postgres** before apply — see "Pre-merge test" below — and the applied data was **re-verified against prod** after promotion — see "Closure summary" below.

## Summary

314 candidates generated from the 896-row sheet. Every candidate proposed for import or flagged as related (186) was **web-verified by parallel research agents on 2026-07-03** — existence, current activity (2024+ evidence), corrected website/location/description/founded, with source URLs stored in each candidate's `verification` jsonb. Then three **scope rules** were applied (see "Scope decisions" below): ANZ-only, defer fund-less people, downgrade uncertain inserts.

| Entity type | Total | insert_new | enrich_existing | related_review | content_guide | review | exclude |
|---|---:|---:|---:|---:|---:|---:|---:|
| investor_fund | 117 | 14 | 54 | 3 | — | 46 |
| investor_person | 29 | — | 1 | — | — | 28 |
| accelerator | 90 | 24 | 18 | 19 | — | 29 |
| coworking_space (grouped orgs) | 28 | 22 | 3 | 3 | — | — |
| newsletter | 48 | — | — | — | 40 | 8 |
| podcast | 2 | — | — | — | 2 | — |
| **Total** | **314** | **60** | **76** | **25** | **42** | **111** |

(The `review` column is gone — those 28 fund-less people are now `exclude` per scope rule 2.)

**Net new ANZ records to import: 60** (14 funds + 24 accelerators + 22 coworking orgs) + **76** NULL-fill enrichments of existing rows + **42** newsletter/podcast sources for a curated guide.

**Verification verdicts (186 researched):** 160 verified · 11 inactive · 3 defunct · 2 not_found · 10 uncertain. 134 candidates received field corrections (websites, HQ cities, founding years, one-line descriptions). The 128 unresearched candidates are `enrich_existing` (COALESCE-only NULL-fills reviewed at apply time) or sheet-flagged excludes.

## Scope decisions applied (this batch)

Encoded in `scripts/generate_startmate_candidates.py::apply_scope_rules` (run post-verification, so they use corrected locations) and covered by `--self-test`:

1. **ANZ-only** — 43 non-ANZ (US/global) funds deferred to `exclude` (`non_anz_deferred`): AIX Ventures, Base10, Battery, Lightspeed, Peak XV, M12, General Catalyst, etc. They stay in staging as audit rows and can be revived for a future international batch by clearing the flag. **2 rows** with genuinely unresolvable geography (Battery Ventures "International", TinySeed "Global") went to `related_review` (`geography_unconfirmed`) rather than being dropped. ANZ presence of a global firm counts — KKR (Sydney) and Nuance (Auckland) are kept.
2. **Defer fund-less VC people** — the 28 VC-tab people with no fund and no existing-record match went to `exclude` (`deferred_fundless_person`); recommendation is to handle them in a dedicated mentors/angels batch, not this ecosystem import. (1 fund-less person that matched an existing investor stays `enrich_existing`.)
3. **Uncertain inserts → review** — the 2 `insert_new` candidates whose verification came back `uncertain` (Power of N/Headline; Kokiri) were downgraded to `related_review` so a human confirms existence before a row is created.

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

## Pre-merge test (run 2026-07-03)

`scripts/test_startmate_staging.sh` exercises the migration + generated blocks against a **throwaway local Postgres** (Supabase-specific objects — `app_role`, `has_role`, `auth.uid()`, the `anon`/`authenticated`/`service_role` roles — stubbed), so bugs surface before prod ever sees the SQL. It is re-runnable (`PGPORT=… scripts/test_startmate_staging.sh`) and asserts, all passing:

- migration applies cleanly; RLS enabled; 2 admin policies present; anon/authenticated writes revoked;
- all six INSERT blocks load (314 rows) — proving every `entity_type` / `proposed_action` / `confidence` / `status` value satisfies its CHECK and no `dedupe_key` collides within the batch;
- re-running the blocks is idempotent (`ON CONFLICT (batch_id, dedupe_key) DO NOTHING`);
- required jsonb/array fields are populated; every `enrich_existing` row carries `matched_existing_id` + `match_method`;
- an admin review `UPDATE … SET status='approved'` succeeds, an illegal status is rejected by the CHECK;
- batch rollback (`DELETE WHERE batch_id`) clears the batch.

This tests the schema and data end-to-end without touching prod. It does **not** exercise live `has_role` semantics (stubbed to `false`) — that RLS behaviour matches the identical pattern already in production on `report_quality_proposals`.

## Open items for Stephen (pre-apply — now resolved, kept for history)

1. ~~Approve applying the migration + staging blocks.~~ **Done 2026-07-04** — migration applied via dashboard SQL editor, ledger repaired (`supabase migration repair --status applied 20260703120000`), all 314 rows staged via the Supabase MCP channel.
2. ~~US/global funds in batch 1?~~ **Resolved: ANZ-only.** 43 US/global funds deferred (`non_anz_deferred`), revivable later; 14 new ANZ funds promoted.
3. ~~NZGCP / Aspire alias call.~~ **Approved and applied** as `enrich_existing` merges into the existing "NZ Growth Capital Partners" row.
4. ~~The `uncertain` records.~~ **Approved and applied per recommendation:** Power of N/Headline and Kokiri held at `related_review` (not imported); Battery Ventures and TinySeed excluded (not ANZ); uncertain newsletters left `pending` untouched per instruction (newsletters/podcasts guide explicitly deferred — no action taken on the 42 `content_guide` rows).

## Closure summary (2026-07-04)

**Promoted to live tables** (idempotent SQL run via the Supabase MCP channel, each staging row stamped `status='applied'`, `applied_at`, `target_record_id` for full rollback traceability):

| Group | Action | Count | Destination |
|---|---|---:|---|
| New ANZ funds | `insert_new` | 14 | `investors` (447 → 461) |
| New ANZ accelerators + coworking orgs | `insert_new` | 45 → 44 unique rows | `innovation_ecosystem` (124 → 169); Creative HQ's accelerator + coworking candidates merged into one row (`services: ['Accelerator','Co-working']`) rather than two |
| Fund contact enrichment | `enrich_existing` (COALESCE NULL-fill only) | 52 funds + 1 person | `investors.contact_name` / `linkedin_url` / `details.startmate.contacts` |
| Held per review decisions | `related_review` / `rejected` | 4 + 111 | no write — Power of N, Kokiri, Battery Ventures, TinySeed held; non-ANZ funds, fund-less people, inactive/defunct programs, dead newsletters rejected |
| Already on platform | `duplicate` | 21 | no write — accelerator/coworking rows matching an existing `innovation_ecosystem` record |
| Newsletters/podcasts | *(untouched, explicit instruction)* | 42 | still `pending` in staging; no guide drafted, no data touched |

**Polish pass** (web research via parallel Sonnet subagents, applied after promotion):
- All 14 new funds: `basic_info`, `why_work_with_us`, logo (via the repo's `logo.dev` domain convention); 8 got `stage_focus`, 5 got `fund_size`, 2 got `year_fund_closed`.
- 44 of 45 new orgs: same fields + logo. The 45th ("Anyone Can") had an unreachable site and no independent coverage — correctly left without fabricated content rather than guessed.
- 3 records gained a corrected/discovered website during research (Tenmile, WeWork AU, WOTSO) and got a logo backfilled from it.
- **Quality fix:** the initial placeholder `founded`/`employees` value (`'Unknown'`, required by a `NOT NULL` constraint) rendered literally on the public detail page (`Founded Unknown`, `Unknown employees`) because the component's conditional (`org.founded && …`) treats any non-empty string as truthy. Confirmed zero pre-existing rows used this placeholder (it is not a platform convention), so all 45 new rows were corrected to `''` (still `NOT NULL`-safe, but falsy — the line no longer renders) wherever a real value wasn't found by research.

**Post-apply verification:**
- `mcp__Supabase__get_advisors` (security + performance): zero new findings on `investors`, `innovation_ecosystem`, or `ecosystem_import_candidates` beyond expected `unused_index` INFO notices on the brand-new table.
- `investors_public` view re-confirmed to exclude `contact_name`/`contact_email`/`linkedin_url`/`details` — the new funds' partner-contact data is not publicly exposed; KB visibility for investor rows is `member`, as designed.
- `mes_knowledge_base`: 115/115 applied rows synced and embedded (0 stale) via the existing triggers + `embed-knowledge` cron — no manual KB work needed.
- Staging table re-confirmed admin-only (`anon` has zero table privileges) after all the write activity.
- No duplicate slugs introduced in either destination table.
- Confirmed via direct query that the two live-app listing hooks (`useInvestors`, `useInnovationEcosystem`, both `.limit(500)`) return all new rows within their window — current totals (461 / 169) are comfortably under the limit, though `investors` is worth watching as it approaches 500.
- Traced the exact React components (`InvestorCard`, `InnovationOrgHero`, `CompanyCard`) rendering these tables end-to-end to confirm every nullable field our batch could produce (`sector_focus`, `stage_focus`, `check_size_*`, `services`, `contact_persons`, `experience_tiles`) is handled safely — no code changes were needed or made.
- **Known limitation:** a live in-browser (Playwright) smoke test of `/investors` and `/innovation-ecosystem` was attempted but blocked — the sandboxed session's outbound network policy resets connections that a spawned browser subprocess makes to the Supabase REST API, even though the same domain is reachable from `curl` and from this session's own Supabase MCP tool. This appears to be an environment/proxy limitation specific to browser-originated traffic, not an application defect; it was not it worth working around given the equivalent verification already available (direct query simulation of the page's exact `select/order/limit`, plus static analysis of the rendering components). Flagging so a future session with browser network access can do a final visual pass if desired.

**Rollback, if ever needed:** every promoted row is traceable — new rows via `SELECT target_record_id FROM ecosystem_import_candidates WHERE batch_id='startmate-2026-07' AND proposed_action='insert_new' AND status='applied'`; enrichments are COALESCE-only (original values were `NULL`, so reverting means setting those specific fields back to `NULL` for the batch's `target_record_id`s). The staging ledger itself remains intact for audit — nothing was deleted.

**Remaining open work (not part of this closure, no action taken):**
- The 42 newsletter/podcast `content_guide` rows — explicitly left untouched this round.
- 21 `related_review` rows where a program/fund is cross-table-related to an existing record (e.g. a fund whose accelerator program isn't yet its own `innovation_ecosystem` row) — a merge-vs-coexist judgment call, not urgent.
5. Battery Ventures & TinySeed (`geography_unconfirmed`, `related_review`) — confirm ANZ relevance or leave excluded.
