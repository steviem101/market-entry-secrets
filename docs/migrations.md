# Database migrations — how they work here (and how NOT to break them)

> **Status: healthy.** The migration history was re-baselined on **2026-07-04** (PR #263)
> after months in a `MIGRATIONS_FAILED` drift state. Merged migrations **auto-apply to prod**
> again — proven end-to-end by PR #263's own fixup migration applying on merge. The rules
> below are what keep it that way.

## TL;DR rules (read before touching `supabase/migrations/`)

1. **Migrations reach prod via the CLI / PR flow (`supabase db push` / merge to main), not
   out-of-band.** Do **not** apply schema to prod through the dashboard SQL editor, ad-hoc
   `psql`, or an agent's MCP `apply_migration`. Each of those stamps its own apply-time
   version and drifts the ledger (see "How it broke last time").
2. **File names must be `<timestamp>_snake_name.sql`.** The Supabase CLI **silently skips**
   any file it can't parse — including the legacy `<timestamp>-<uuid>.sql` Lovable-style
   names — with `Skipping migration … (file name must match pattern "<timestamp>_name.sql")`.
   A skipped file never applies via the CLI.
3. **Never change the version/filename of a migration that has already been applied.**
   Renumbering an applied migration (e.g. to dodge a collision) makes the recorded version
   and the file version disagree → instant ledger drift. Fix collisions *before* first
   apply, or add a *new* migration instead.
4. **Merging a PR with a migration applies it to prod automatically.** Still glance at the
   Supabase integration check on the PR before assuming it's live — a red migration step
   means it did NOT apply. `supabase/migrations_archive/` is historical reference only; the
   CLI ignores it. Never move a file from the archive back into `supabase/migrations/`.
5. **Data-seed migrations must be self-sufficient and idempotent.** Preview branches
   replay every migration against an **empty** database, so a seed that references a
   prod-only row by FK (a category id, sector, location…) applies fine to prod and then
   turns every PR's Migrations check red. Upsert FK targets first and use
   `ON CONFLICT ... DO NOTHING` (see `20260704155252` for the pattern — and for what it
   looks like when this rule is skipped).
6. **Editing the CONTENT of an already-applied migration is allowed only for idempotent
   replay-safety fixes that cannot alter prod** (e.g. adding the guard from rule 5).
   Prod never re-runs an applied version, so such edits affect fresh replays (previews,
   local resets) only. Anything that would change prod schema/data belongs in a NEW
   migration — never smuggle real changes into an applied file.

## Current state (post re-baseline)

- `supabase/migrations/` starts fresh from `20260704095538_remote_baseline.sql` (full prod
  schema snapshot) plus `20260704100740_baseline_grant_lockdown.sql` (grant revokes that a
  schema dump can't represent). Prod's ledger matches the files 1:1.
- The 362 pre-baseline files live in `supabase/migrations_archive/` for git history.
- New migrations go in `supabase/migrations/` with a timestamp **after** the baseline and
  apply automatically on merge to main.

## How it broke last time (Feb–Jul 2026) — kept for the post-mortem

Prod project `xhziwveaiuhzdoutpgrh` had a **divergent migration ledger**: ~361 files vs
~289 ledger rows with **only ~22 versions matching** (~94% divergence). The divergence was
almost entirely the same migrations recorded under apply-time timestamps a few seconds off
the filename version (e.g. file `20260206223728` ↔ ledger `20260206223725`) — a bookkeeping
problem, not missing schema. ~37 early files also used the legacy `<ts>-<uuid>.sql` name
the CLI skips entirely.

Because the ledger didn't line up with the files, the GitHub/branching integration failed
its migration step (`MIGRATIONS_FAILED` since Feb 2026), merges didn't auto-apply
migrations, and everything was applied manually — with the standing risk of merging a
migration your code depends on and forgetting to apply it.

Root causes: (a) migrations applied out-of-band (dashboard editor / agent MCP
`apply_migration`) stamping apply-time versions; (b) renumbering already-applied files; (c)
legacy `<ts>-<uuid>` filenames the CLI can't manage. The TL;DR rules above block all three.

## Re-baseline runbook (used 2026-07-04; keep in case it's ever needed again)

A clean baseline beats file-by-file `migration repair` when divergence is deep: snapshot
current prod schema into a single migration and reset the ledger to it. Bookkeeping only —
it runs no destructive SQL. Needs Docker Desktop and an authenticated Supabase CLI.

```bash
# 0. Link + snapshot the current state for your records.
supabase link --project-ref xhziwveaiuhzdoutpgrh
supabase migration list > /tmp/mig_before.txt

# 1. Archive the existing migration files (keep them in git history, out of the active dir).
mkdir -p supabase/migrations_archive
git mv supabase/migrations/*.sql supabase/migrations_archive/

# 2. Reset the ledger FIRST (db pull refuses while history mismatches).
#    Mark EVERY existing remote version reverted (repair edits bookkeeping only; runs no SQL):
supabase migration list | awk -F'|' '{ v=$2; gsub(/[^0-9]/,"",v); if (length(v)==14) print v }' > /tmp/remote_versions.txt
supabase migration repair --status reverted $(cat /tmp/remote_versions.txt)

# 3. Generate ONE baseline migration reflecting current prod schema.
supabase db pull remote_baseline   # writes the file AND records it applied (answer Y)
#   REVIEW the baseline: db pull captures tables/columns/constraints/policies/functions,
#   but not default-privilege revokes, and it may render policies cosmetically differently.

# 4. Verify, and capture any residual diff as a fixup migration.
supabase migration list                  # single baseline row, Local == Remote
supabase db diff --linked --schema public -f baseline_fixup   # revokes / cosmetic recreates land here

# 5. Commit (archived files + baseline + fixup), open a PR, merge. The fixup auto-applying
#    on merge is the end-to-end proof the integration works again.
```

Notes from the 2026-07-04 run: zsh chokes on pasted `#` comments (use comment-free blocks);
the residual diff contained only SEC-02 `REVOKE REFERENCES/TRIGGER/TRUNCATE` statements
(default privileges aren't dump-representable), three byte-identical policy recreations,
and a `pg_net` no-op — all safe to replay.
