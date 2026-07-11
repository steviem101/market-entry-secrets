# MES-110 step 4b — provider-slate parity check

**Date:** 2026-07-07 · **Verifies:** `20260707210000_mes110_provider_sector_tags_apply.sql` against the corrected `proposed-provider-sector-tags.csv`, per the scorer-interaction note in the main audit §9 step 4. Simulations run with the real `matchScoring.ts` (post-#325 token matching) over the live 95-row provider table with the migration's tags applied in-memory.

## Fidelity
- **Migration ↔ CSV: 95/95 rows, zero drift** (machine diff of the temp-table inserts vs the corrected CSV — includes all 13 hallucination-audit corrections).
- Idempotency guard, empty-preview-DB no-op, and reversal verified present in the migration. *(Post-review hardening in PR #326 strengthened all three: the guard now also requires `sector_agnostic = true` and an actual value change — protecting manual flag edits and eliminating no-op `updated_at` churn; an apply-time completeness assertion aborts loudly if any proposal name no longer matches a live row; and the documented reversal is now scoped to the 95 migrated rows instead of the previously-documented unscoped update.)*

## Before/after slates (top 5; `*` = specialist bonus firing; goals = find_providers-style unless noted)

| Persona | BEFORE (identical for every persona — the same-slate bug) | AFTER |
|---|---|---|
| Fintech → Sydney | EY 7.75, Grant Thornton 7.75, BDO 7.75, Pitcher 5.75, PwC 5.75 | NEXTGEN* 8.5, Standard Ledger* 8.5, oSpace* 8.5, ADAPT* 8.5, Fullstack* 8.5 |
| Healthtech → Sydney | *(same as above)* | *(same tech-specialist slate — goals were accounting/legal; see below)* |
| Construction → Sydney | *(same as above)* | EY 7.75, Grant Thornton 7.75, BDO 7.75, **Pinsent Masons 7.25** (construction practice), Pitcher 5.75 |
| Healthtech + **compliance goals** | *(same as above)* | **Freyr* 7.0, R2 Pharma* 6.5, Dentons (health practice) 5.25, Emergo* 5.0, Adjutor* 5.0** |

## Reading
1. **The same-slate bug is demonstrably broken:** BEFORE is byte-identical across all personas; AFTER differs by persona.
2. **Goals and sectors compose, not compete:** a healthtech founder with *accounting* goals correctly gets startup-accounting specialists; with *compliance* goals gets the health-regulatory specialists (Freyr/R2/Emergo/Adjutor). Both are right answers to different questions.
3. **Big-4 don't vanish** — they hold the slate wherever no genuine specialist exists (construction persona), which is honest.
4. **No over-tag or horizontal-only misfires:** all proposed rows are ≤4 tags (threshold 5), and single-`technology` specialists carry no foreign vertical, so they keep specialist standing by design.

## Notes for the record
- Two NEXTGEN entities (Group + oSpace) can co-occur in a top-5 — distinct rows, no org-diversity cap is configured for the provider surface (pre-existing; flag if undesired).
- `MinterEllisonRuddWatts` (NZ firm) carries `location: "Sydney, NSW"` in the live table — data quirk, ops queue.

## Addendum — sector-axis-only deltas (post-hardening, production `scoreRow`)

Service/location signals zeroed to isolate what the tags alone change, per intake profile:

| Profile | Sector score changed | New specialists (+2) | Specialists at 0 on the sector axis (still reachable via services/location) |
|---|---|---|---|
| SaaS / tech | 20 / 95 | 12 (ADAPT, BENCH PR, Cloud Recruit, Fullstack Advisory, Halcyon Knights, Hatch Quarter, NEXTGEN Group, oSpace, Standard Ledger, Stone & Chalk, TechVisa, Think & Grow) | 5 (the health-regulatory cluster) |
| MedTech (health + manufacturing) | 23 / 95 | 5 (Emergo by UL, Freyr Solutions, PharmOut, R2 Pharma Solutions, The Adjutor Group) | 12 (the tech cluster) |
| Construction | 18 / 95 | 0 (Pinsent Masons is tagged-agnostic by design — industry match without specialist bonus) | 17 (all specialists) |

Watch item for the first post-apply reports: on tech intakes, tech-focused service firms
(recruiter/PR/accounting) now outrank big-4 generalists on the sector axis — the documented
`HORIZONTAL_SECTORS` intent (matchScoring.ts:115-118), with service-fit and location signals
still composing on top.
