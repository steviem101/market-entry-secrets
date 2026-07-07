# MES-110 step 4b — provider-slate parity check

**Date:** 2026-07-07 · **Verifies:** `20260707210000_mes110_provider_sector_tags_apply.sql` against the corrected `proposed-provider-sector-tags.csv`, per the scorer-interaction note in the main audit §9 step 4. Simulations run with the real `matchScoring.ts` (post-#325 token matching) over the live 95-row provider table with the migration's tags applied in-memory.

## Fidelity
- **Migration ↔ CSV: 95/95 rows, zero drift** (machine diff of the temp-table inserts vs the corrected CSV — includes all 13 hallucination-audit corrections).
- Idempotency guard (`sector_tags` still empty), empty-preview-DB no-op, and uniform reversal (`set sector_tags='{}', sector_agnostic=true`) verified present in the migration.

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
