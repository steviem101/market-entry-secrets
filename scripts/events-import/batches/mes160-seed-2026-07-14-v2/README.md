# Batch record — mes160-seed-2026-07-14-v2 (MES-160)

Auditable inputs for the MES-160 initial events seed. Retained per the rollback
plan (keep the exact source CSV, resolve file and batch id for every apply).

| File | What it is |
|---|---|
| `mes-events-2026-07-14-v2.csv` | The frozen Notion **MES Events** export (219 rows), re-tagged editorial pass. **One third-party email in a `notes` cell was redacted to `[email redacted]`** before committing (repo no-PII-in-history rule, MES-35); `notes` is staging-only, so this does not affect the import. |
| `resolutions-2026-07-14-v2.csv` | Reviewer decisions (`--resolve`): 3 force-inserts (AITD/ALIA/AMaGA — false positives vs AIIA), 15 blank-sector assignments, 9 duplicate skips. |

Dry run over these resolves to **194 inserts, 16 fill-blank updates, 9 reviewer
skips, 0 ambiguous, 0 taxonomy exceptions, 0 invalid** (194+16+9 = 219).

Run (see `../../README.md` for the full runbook):

```bash
node scripts/events-import/run.ts \
  --csv scripts/events-import/batches/mes160-seed-2026-07-14-v2/mes-events-2026-07-14-v2.csv \
  --batch-id mes160-seed-2026-07-14-v2 \
  --resolve scripts/events-import/batches/mes160-seed-2026-07-14-v2/resolutions-2026-07-14-v2.csv
# add --apply (and optionally --limit 5) only after reviewing the dry-run artefacts.
```
