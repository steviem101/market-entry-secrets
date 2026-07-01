# Database migrations — how they work here (and how NOT to break them)

## TL;DR rules (read before touching `supabase/migrations/`)

1. **Migrations reach prod via the CLI / PR flow (`supabase db push`), not out-of-band.**
   Do **not** apply schema to prod through the dashboard SQL editor, ad-hoc `psql`, or an
   agent's MCP `apply_migration`. Each of those stamps its own apply-time version and
   drifts the ledger (see "Why it's currently broken").
2. **File names must be `<timestamp>_snake_name.sql`.** The Supabase CLI **silently skips**
   any file it can't parse — including the legacy `<timestamp>-<uuid>.sql` Lovable-style
   names — with `Skipping migration … (file name must match pattern "<timestamp>_name.sql")`.
   A skipped file never applies via the CLI.
3. **Never change the version/filename of a migration that has already been applied.**
   Renumbering an applied migration (e.g. to dodge a collision) makes the recorded version
   and the file version disagree → instant ledger drift. Fix collisions *before* first
   apply, or add a *new* migration instead.
4. **Until the integration is re-baselined (below), a merged migration does NOT auto-apply
   to prod.** Edge functions auto-deploy on merge; migrations currently do not. Treat any
   PR that adds a migration as **"not live until you've confirmed it applied to prod."**

## Why it's currently broken

Prod project `xhziwveaiuhzdoutpgrh` has a **divergent migration ledger**. As of Jun 2026:

- `supabase/migrations/` has ~361 files; `supabase_migrations.schema_migrations` has ~289
  rows; **only ~22 versions match** (~94% divergence).
- The divergence is almost entirely **the same migrations recorded under apply-time
  timestamps a few seconds off the filename version** (e.g. file `20260206223728` ↔ ledger
  `20260206223725`). Prod's **schema is correct** — this is a bookkeeping problem, not
  missing schema.
- ~37 early files use the legacy `<timestamp>-<uuid>.sql` name and are **skipped by the CLI
  entirely**.

Because the ledger doesn't line up with the files, Supabase's GitHub/branching integration
fails its migration step (`MIGRATIONS_FAILED` since Feb 2026): `supabase db push` would try
to re-apply hundreds of "local-only" migrations (→ "already exists") and chokes on the
"remote migration versions not found in local" mismatch. So merges don't auto-apply
migrations, preview branches' migration step is red, and migrations get applied manually.

Root causes: (a) migrations applied out-of-band (dashboard editor / agent MCP
`apply_migration`) stamping apply-time versions; (b) renumbering already-applied files; (c)
legacy `<ts>-<uuid>` filenames the CLI can't manage.

## Severity

**Low operationally, but a loaded footgun.** Prod is healthy and has been fine for months —
nothing is down or at risk. The real danger: because edge functions *do* auto-deploy on
merge, it's easy to assume migrations did too. They didn't. Merge a migration that adds a
column your code reads, forget to apply it manually, and prod throws at runtime. The
interim rule (#4 above) neutralizes this for free.

## Interim workflow (do this today, zero effort)

- Any PR touching `supabase/migrations/` is **not "done" until the migration is confirmed
  applied to prod.** Apply it via `supabase db push` (once re-baselined) or, until then,
  by running the migration's exact SQL against prod and recording it.
- Agents (Claude Code etc.) **must not** `apply_migration` against prod — commit the file
  in the PR and let a human apply it.

## Permanent fix — re-baseline (recommended over ledger repair)

Given the depth of divergence *and* the ~37 CLI-skipped files, a file-by-file
`migration repair` (600+ ops) is fiddly and error-prone. Prefer a **clean baseline**: snapshot
current prod schema into a single migration and reset the ledger to it. One-time, needs
Docker Desktop, ~30–45 min. It only edits schema *bookkeeping* — it runs no destructive SQL.

### Prerequisites
- Docker Desktop **running** (`supabase db pull` / `db diff` build a shadow DB).
- Supabase CLI authenticated (`supabase login`); recent version.
- A clean feature branch off `main`.

### Steps
```bash
# 0. Link + snapshot the current state for your records.
supabase link --project-ref xhziwveaiuhzdoutpgrh
supabase migration list > /tmp/mig_before.txt

# 1. Archive the existing migration files (keep them in git history, out of the active dir).
mkdir -p supabase/migrations_archive
git mv supabase/migrations/*.sql supabase/migrations_archive/

# 2. Generate ONE baseline migration reflecting current prod schema.
supabase db pull            # writes supabase/migrations/<ts>_remote_schema.sql
#   REVIEW the baseline: db pull captures tables/columns/constraints/policies/functions,
#   but double-check it also carries what you rely on — RLS policies, grants, triggers,
#   pg_cron jobs, and any Vault-dependent bits. Add anything missing as follow-up migrations.

# 3. Reset the ledger to just the baseline (repair edits bookkeeping only; runs no SQL).
#    a) mark EVERY existing remote version reverted:
supabase migration list --linked \
  | awk 'NF && $3 ~ /^[0-9]{14}$/ {print $3}' \
  | xargs -n 40 sh -c 'supabase migration repair --status reverted "$@"' _
#    b) mark the new baseline applied (replace <BASELINE_TS> with the file's timestamp):
supabase migration repair --status applied <BASELINE_TS>

# 4. Verify: only the baseline should remain, with Local == Remote, and schema unchanged.
supabase migration list        # single baseline row, both columns populated
supabase db diff --linked      # MUST be empty — we changed bookkeeping, not schema

# 5. Commit (archived files + baseline), open a PR, merge.
```

After this: `supabase db push` is clean, merges auto-apply, and preview branches work again.
Keep it healthy by following the TL;DR rules — especially: **all migrations via CLI/PR, no
out-of-band applies, never re-version an applied migration.**

> Exact version lists for step 3a can be regenerated any time from
> `supabase migration list` (or `select version from supabase_migrations.schema_migrations`).
