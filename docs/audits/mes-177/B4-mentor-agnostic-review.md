# MES-177 Phase B4 — Mentor `sector_agnostic` invariant fix (REVIEW — awaiting sign-off)

**Status:** proposed, not applied. The migration below is staged in `docs/audits/mes-177/`
(NOT in `supabase/migrations/`) so it cannot auto-apply. On your sign-off it moves to
`supabase/migrations/<timestamp>_mes177_mentor_agnostic_flip.sql` (timestamp after
`20260714093000`) and applies on merge to `main`.

## The finding (verified live 2026-07-14, project `xhziwveaiuhzdoutpgrh`)

The MES-110 invariant is **sector-tagged ⇒ not `sector_agnostic`**. It's violated:

| Cohort | Count |
|---|---|
| Tagged **and** `sector_agnostic=true` (the violation) | **114** |
| Tagged and `sector_agnostic=false` (correct) | 9 |
| Untagged and `sector_agnostic=true` (correct — genuinely general) | 11 |

`sector_agnostic=true` sits on **125 of ~134 mentors (93%)** — i.e. it's an indiscriminate
import default, not a considered per-mentor choice. And the 114 offenders are **focused**, not
broad: **86 carry a single tag, 20 two tags, 8 three tags** — none near the over-tag threshold (5).
A single-tag mentor is a specialist signal, so "matches every sector" is the wrong behaviour for it.

## Decision (approved): flip the 114 to `sector_agnostic=false`

Restores the invariant. The 11 genuinely-untagged agnostic mentors and the 9 already-correct
specialists are untouched.

## Matcher impact — the one behavioural change (`generate-report/matchScoring.ts`)

`sector_agnostic` is read **only** by the report matcher (the frontend mentor filter keys off
`sector_tags`, not `agnostic`). For each flipped mentor:

- **Loses** the `AGNOSTIC_NUDGE` ("eligible for all sectors") that currently makes it score on
  *every* report regardless of sector.
- **Gains** `SPECIALIST_BONUS` eligibility for its 1–3 tagged sectors (`specialist = !sector_agnostic
  && !overTagged && !horizontalOnly && ownMatches > 0`). None of the 114 are over-tagged (max 3
  tags « threshold 5), so they become clean specialists for their own sector.
- **Net:** stronger, correctly-ranked matches on in-sector reports; **drops off off-sector reports**
  (no longer a universal fallback). Report pipelines for niche sectors keep the 11 still-agnostic
  mentors + location/corridor signals as fallbacks, and mentor cards are capped per report anyway.

This is a precision improvement (specialists surface for their sector instead of every report). The
only regression risk is fewer mentor matches on a report whose sector has no tagged specialist — call
that acceptable given the 11 remaining agnostic fallbacks. If you'd rather de-risk further, we can run
a before/after matcher diff on a sample of real reports before applying (say the word).

## Migration design — guarded · idempotent · reversible · preview-safe

- **Snapshot** the prior value into a nullable `sector_agnostic_pre_mes177` column so the flip is
  *precisely* reversible (a plain reverse-predicate would wrongly also flip the 9 already-`false`
  tagged rows). The `community_members_public` view uses an explicit column list that does **not**
  select this column (verified), so it does not leak.
- **Guarded predicate** = exactly the 114-row set (`sector_tags` non-empty AND `sector_agnostic
  is true`), with a `sector_agnostic_pre_mes177 is null` idempotency latch: re-running flips
  nothing already flipped.
- **Preview-safe:** on an empty preview DB it updates 0 rows — a no-op.
- **Reverse** (kept in `supabase/rollback/` on apply): restore `sector_agnostic` from the snapshot
  where non-null, then drop the snapshot column.

## Proposed migration
See `docs/audits/mes-177/proposed-migration-B4-mentor-agnostic.sql` (staged; not yet applied).

## Sign-off
- [ ] Approve applying the flip to the 114 mentors as specified
- [ ] (or) Run a before/after matcher diff on sample reports first
- [ ] (or) Do not flip — document tagged+agnostic as intentional instead
