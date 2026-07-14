# MES-178 follow-up — staged case-study enrichment proposal

**Status: proposed, NOT applied.** Editorial reviews this diff, then the SQL
in `out/enrichment/enrichment_proposal.sql` is applied to the existing
(already published) rows. This is separate from the MES-178 import, which only
added new draft rows.

Scope chosen: the 2 empty live pages + the 7 thin stubs (9 of the 21 skipped
duplicates). The 6 medium and 6 already-rich live pages are left untouched.

## How the SQL behaves

- **fill** (empty pages): inserts the draft's intro + sections + bodies against
  the existing `content_id`. No deletes.
- **replace** (thin stubs): deletes the existing auto-generated sections + bodies
  (FK cascade drops section bodies; `case_study_sources`/`quotes` are kept, their
  `section_id` SET NULL), then inserts the richer draft content.
- Both: update `read_time`; fill **only blank** profile fields via COALESCE/NULLIF
  (curated values are never overwritten — this is what surfaces the success/failure
  badge on the thin stubs, whose `outcome` is currently blank).
- `sources_markdown` is NOT written (editorial-only, per the import rule).

## Targets

| Live slug | Action | Live body (chars) | Draft body (chars) | Draft sections | From draft |
|---|---|---:|---:|---:|---|
| `netflix-streaming-australia-launch` | fill | 0 | 4,903 | 6 | `how-netflix-localised-its-way-to-australian-streaming-dominance` |
| `afterpay-buy-now-pay-later-revolution` | fill | 0 | 3,290 | 6 | `how-afterpay-invented-buy-now-pay-later-from-its-australian-home-market` |
| `secretlab-anz-market-entry` | replace | 2,373 | 4,016 | 6 | `how-secretlab-sold-australia-gaming-chairs-without-a-single-store` |
| `shopback-anz-market-entry` | replace | 2,598 | 3,991 | 6 | `how-shopback-used-cashback-to-break-into-australian-loyalty` |
| `starbucks-australia-market-entry` | replace | 3,048 | 2,836 | 6 | `how-starbucks-misread-australias-coffee-culture-and-closed-61-stores` |
| `masters-australia-market-entry` | replace | 3,054 | 3,364 | 6 | `how-masters-lowes-lost-billions-challenging-bunnings` |
| `ola-australia-market-entry` | replace | 3,060 | 3,018 | 6 | `how-ola-won-australian-drivers-but-never-won-the-riders` |
| `topshop-australia-market-entry` | replace | 3,156 | 3,208 | 6 | `how-topshops-australian-franchise-collapsed-under-its-own-economics` |
| `wework-australia-market-entry` | replace | 3,449 | 3,898 | 6 | `how-weworks-australian-business-outlived-its-parents-bankruptcy` |

## Apply / rollback

- Apply per-target or all at once; each block is wrapped in `BEGIN;`/`COMMIT;`.
- Rollback of a **fill** target: delete the sections/bodies added against that
  `content_id`. Rollback of a **replace** target is not automatic — the old thin
  content is dropped, so snapshot those rows before applying if reversibility is
  required.
