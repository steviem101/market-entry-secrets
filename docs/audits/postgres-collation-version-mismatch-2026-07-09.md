# Postgres Collation Version Mismatch — Investigation & Remediation Plan

- **Project:** MES Platform — Supabase ref `xhziwveaiuhzdoutpgrh` (production)
- **Date:** 2026-07-09
- **Branch:** `claude/mes-postgres-collation-mismatch-hfev8j` (harness-assigned; no MES-<id> yet)
- **Stage:** Audit → Plan → **Executed (partial)**. Root-cause investigation, then — with Stephen's
  approval of "Option A" — the `postgres` database was refreshed. See **§0 Execution log & outcome**
  for exactly what ran, what was deliberately not run, and why.

---

## TL;DR

- **Root cause is confirmed.** The three databases (`postgres`, `template1`, `template0`) use the
  **ICU** locale provider (`en-US`, UTF-8). Postgres recorded ICU collation version **`153.120`**;
  the ICU library now shipped in the Postgres container actually reports **`153.121`**. That one-digit
  delta is a **micro ICU version bump introduced by a Supabase platform/image update**. `pg_database.datcollversion`
  was never refreshed, so Postgres emits the warning defensively.
- **Data-integrity risk is LOW and nothing is currently broken.** Zero invalid/not-ready indexes
  exist anywhere. All 853 ICU collation *objects* already report matching versions — only the
  database-level `datcollversion` string is stale. The bump is a micro revision (same Unicode/UCA
  version), so `en-US` sort ordering is effectively unchanged.
- **The "58.9% success rate" and "8,594 warnings" are a logging artefact, not user-facing failures.**
  The warning fires **once per new backend connection**; with PostgREST/pooler connection churn and
  per-minute cron jobs, that floods the log and drags Supabase's warning-free "success rate" down.
- **The 79 Postgres errors are a SEPARATE, benign track — not caused by collation.** The DB is
  operationally healthy: 299,002 commits vs 932 rollbacks (~0.31%), **0 deadlocks, 0 conflicts**.
  The only error observed live in the log window was a self-inflicted introspection query from this
  very investigation.
- **Advisor "3 CRITICAL":** the three `ERROR`-level findings are `security_definer_view` on
  `agency_contacts_public`, `community_members_public`, `investors_public`. Recommend a **separate
  security ticket** (details in §5).

---

## 0. Execution log & outcome (2026-07-09, ~19:20 UTC)

**What was run (in order):**

1. **`ALTER DATABASE postgres REFRESH COLLATION VERSION;`** — succeeded. `postgres.datcollversion`
   is now `153.121` == actual; `mismatch=false`. Verified in `pg_database` and in Unified Logs:
   connections after the refresh no longer emit `database "postgres" has a collation version
   mismatch`. **This resolves the overwhelming majority of the ~8,594 warnings/24h and the
   depressed "success rate."**
2. Cleanup of two aborted reindex attempts (see below) — all transient indexes removed; **0 invalid
   indexes** remain.
3. Temporary session config (`maintenance_work_mem`) set and then **reset** — no config drift left
   behind (verified: no MES-added `pg_db_role_setting` entries; the only DB-level setting present is
   Supabase's own pre-existing `app.settings.jwt_exp`).

4. **All 121 public collation-sensitive btree text indexes were rebuilt** (second pass, same day,
   after a critical re-review). Method: batched **plain `REINDEX INDEX`** (not CONCURRENTLY) with
   `SET lock_timeout='2s'` as a stall guard, in 3 transactions — appropriate because every target
   index is tiny (5.1 MB total, largest 656 kB), plain REINDEX is transactional (a failure rolls
   back cleanly instead of leaving `_ccnew` litter), and each index's exclusive lock lasts
   milliseconds. All batches completed in seconds with zero lock timeouts. Verified after: 0 invalid
   indexes, and all 95 `service_providers` slugs round-trip through index lookups.

**Risk-analysis correction (from the re-review):** an earlier draft claimed the worst case of a
stale collation was "wrong sort order only." That was **incorrect**: a btree navigates by the
collation's ordering even for `=` probes, so a stale index can *miss existing rows* on equality
lookups (e.g. a directory slug lookup 404ing on a row that exists). The mitigating fact is that
MES's lookup-critical text keys (slugs, emails, tokens, dedup keys) are ASCII, whose ordering is
stable across ICU micro versions — so real-world probability remained very low. The public reindex
above closes the gap regardless; `auth`/`storage` remain unrebuildable from this role but their
lookup keys are ASCII (tokens/emails), making the residual risk negligible.

**Reindex attempt history (kept for the record):**

- **Two earlier bulk concurrent attempts failed and were cleaned up.** `REINDEX DATABASE/SCHEMA
  CONCURRENTLY` also rebuilds the large non-collation **vector** indexes, which is what broke:
  the 42 MB HNSW `mes_kb_embedding_idx` and 13 MB ivfflat indexes hit `maintenance_work_mem`
  (default 32 MB), and when memory was raised to 256 MB, the parallel build exhausted the
  container's `/dev/shm`. Each failure left invalid `_ccnew` transient indexes (14 then 9, all on
  internal `ii_*`/KB tables); **all were dropped**, and the *original* indexes stayed valid
  throughout (concurrent reindex never drops the old index until the new one validates), so
  **nothing was ever degraded** and RAG/KB reads were unaffected. Lesson recorded: scope reindexes
  to the collation-sensitive **btree** subset explicitly; never point a bulk concurrent reindex at
  a schema containing large vector/GIN indexes on a memory-constrained instance.

**Managed-role limits discovered (things this repo's `postgres` role cannot do):**

The Supabase `postgres` role is **not a superuser** and does not own `auth`/`storage` (owned by
`supabase_auth_admin`/`supabase_storage_admin`) or `template1` (owned by `supabase_admin`).
Therefore, from this project's SQL access it is **not possible** to:

- `REFRESH COLLATION VERSION` on `template1` → **`template1` still warns** (a small residual: it is
  only touched by internal maintenance connections, far less frequent than the `postgres` warnings
  that are now gone). Needs Supabase support or a `supabase_admin`-level action.
- Reindex `auth`/`storage` indexes → left as-is (low risk given the micro bump).

**Net outcome:** the warning flood / "success rate" issue is resolved, and every collation-sensitive
btree index in `public` has been rebuilt against the current ICU version — Option A is complete for
everything reachable from the project role. Residuals (all requiring Supabase-managed roles, all
low-value): `template1` refresh (cosmetic warnings only) and `auth`/`storage` reindex (ASCII lookup
keys → negligible risk). See §4.1.

---

## 1. Evidence — root cause confirmed

### 1.1 Database metadata (`pg_database`)

`SELECT datname, datlocprovider, datcollate, datctype, datlocale, datcollversion AS stored,
 pg_database_collation_actual_version(oid) AS actual, ... FROM pg_database;`

| datname   | provider | locale | datcollate    | stored `datcollversion` | actual ICU version | mismatch |
|-----------|----------|--------|---------------|-------------------------|--------------------|----------|
| postgres  | `i` (ICU)| en-US  | en_US.UTF-8   | **153.120**             | **153.121**        | **yes**  |
| template1 | `i` (ICU)| en-US  | en_US.UTF-8   | **153.120**             | **153.121**        | **yes**  |
| template0 | `i` (ICU)| en-US  | en_US.UTF-8   | `NULL` (frozen)         | 153.121            | (n/a)*   |

\* `template0` has `datallowconn=false` and a NULL recorded version, so it **never emits the
per-connection warning**. Only `postgres` and `template1` do. `template1` warns because internal
maintenance connections open it.

- **Server:** `PostgreSQL 17.6 on aarch64-unknown-linux-gnu`.
- **Encoding:** UTF8. **Locale provider:** ICU (not glibc/libc, despite the `en_US.UTF-8`-style
  `datcollate` label — the real driver is ICU locale `en-US`).

### 1.2 Collation objects (`pg_collation`)

| bucket | count | mismatched |
|--------|-------|------------|
| libc collations (`collprovider='c'`) | 5 | **0** |
| ICU collations (`collprovider='i'`)  | 853 | **0** |

Every *named* collation object already reports `collversion == pg_collation_actual_version()`. The
mismatch is **only** at the `pg_database.datcollversion` level. This is the classic signature of an
ICU patch bump where the platform refreshed the catalog collations but not the per-database version
stamp.

### 1.3 Index health

`SELECT ... FROM pg_index WHERE indisvalid=false OR indisready=false ... (non-system schemas)` →
**0 rows.** No invalid, not-ready, or corrupt indexes anywhere.

### 1.4 What the warning means here

Postgres stores the collation-provider version that was current when the database was created/last
refreshed. On every backend startup that touches the default collation, it compares the stored value
to the live provider version; a difference triggers:

> `WARNING: database "postgres" has a collation version mismatch`
> `DETAIL: The database was created using collation version 153.120, but the operating system provides version 153.121.`

The warning is **conservative**: Postgres cannot prove that the ordering rules didn't change, so it
warns even for a micro bump where, in practice, `en-US` ordering is unchanged. It is a *warning*, not
an error, and it does **not** block queries.

---

## 2. Impact assessment

### 2.1 What *could* be affected (theory)

Collation-sensitive on-disk structures — primarily **btree indexes on `text`/`varchar`/`bpchar`
columns** that use the ICU `en-US` default collation. If the underlying ordering had changed, such
indexes could return wrong results for range scans / `ORDER BY` / uniqueness, and could be considered
logically corrupt until rebuilt.

Scope of collation-sensitive btree indexes (all inherit the `en-US` ICU default; no column uses an
explicit non-default collation):

| schema | index AM | count | total size |
|--------|----------|-------|-----------|
| public | btree | 120 | 5.1 MB |
| auth | btree | 26 | 312 kB |
| storage | btree | 13 | 160 kB |
| supabase_migrations / private / cron / vault / extensions / realtime | btree | ~9 | <150 kB |
| auth | hash | 2 | 64 kB (hash is **not** collation-sensitive) |

Whole-database size: **311 MB**; all indexes: **98 MB / 441 indexes**. Everything is small.

### 2.2 What is *actually* wrong (measured)

- **Nothing is currently broken.** 0 invalid indexes; healthy transaction/rollback ratio; 0
  deadlocks; 0 conflicts.
- The delta is a **micro ICU revision (153.120 → 153.121)** — the Unicode/UCA version is unchanged,
  so `en-US` collation ordering is effectively identical. Real-world probability of altered ordering
  (and therefore of a genuinely stale index) is very low.

### 2.3 Severity & urgency

- **Data integrity:** **Low** risk. No evidence of corruption; micro bump.
- **Operational noise:** **Medium/High**. The warning-per-connection floods logs, halves the
  dashboard "success rate", and masks any genuinely interesting log signal. This is the real reason
  to act.
- **Urgency:** Not an incident. Schedule the fix as planned maintenance; the noise is the pain point,
  not a live threat.

---

## 3. The "79 errors" and low success rate — separate track

- **Success rate (58.9%) = logging artefact.** Supabase's Postgres "success rate" counts log events
  without a `WARNING/ERROR` severity. Because the collation `WARNING` is emitted on essentially every
  new connection (PostgREST `authenticator`, superuser/internal, and per-minute `cron` jobs all show
  a paired "connection … / collation version mismatch" in the log), the warning count balloons
  (~8,594/24h) and the ratio collapses. It reflects **log lines, not failed requests**.
- **Warnings ≠ errors.** The collation issue produces only `WARNING`s. It contributes **zero** to the
  79 errors.
- **The 79 errors are benign/low-volume.** Live log sampling showed the only `ERROR` in-window was a
  self-inflicted introspection query from this investigation (`column "daticulocale" does not exist`
  — a PG15→17 catalog rename I hit and corrected). That is strong evidence the "errors" bucket is
  dominated by transient admin/introspection queries and ordinary app-level conditions (e.g.
  unique-violation on upserts), not systemic failures. Against 299,002 commits, 79 errors is ~0.03%.
- **No correlation with collation bursts.** Warning bursts track connection churn, not error
  timestamps.
- **API Gateway (117 warnings/24h, 0 errors)** is unrelated background noise, not an outage signal.

**Conclusion:** treat the errors and the success-rate number as *not* a real reliability problem.
Once the collation warning is silenced (§4), the "success rate" will jump back toward ~100% on its
own, because the warning flood disappears.

---

## 4. Remediation plan (for approval — DO NOT run without Stephen's OK)

**Correct order: REINDEX first, then REFRESH COLLATION VERSION.** Refreshing first would silence the
warning while (in theory) leaving any stale index unrebuilt. Given the DB is tiny, doing the thorough
version is cheap.

### Option A — Thorough & safe (recommended)

Run in the Supabase **SQL editor** (connects as `postgres`) during a low-traffic window.

```sql
-- 1. Rebuild collation-sensitive indexes without blocking reads/writes.
--    311 MB DB / 98 MB indexes → expect seconds to a couple of minutes.
REINDEX DATABASE CONCURRENTLY postgres;

-- 2. Record the new collation version so the warning stops.
ALTER DATABASE postgres  REFRESH COLLATION VERSION;
ALTER DATABASE template1 REFRESH COLLATION VERSION;
```

- `REINDEX … CONCURRENTLY` avoids the heavy locks a plain `REINDEX` takes (it builds the new index
  alongside the old and swaps). It **cannot** run inside a transaction block — run each statement
  standalone. A few internal catalog indexes are skipped by CONCURRENTLY; that is expected and fine
  for this purpose.
- `ALTER DATABASE <name> REFRESH COLLATION VERSION` updates that database's `datcollversion` by name
  and can be issued while connected to a different database, so `template1` can be refreshed from the
  `postgres` connection.
- `template0` is frozen (`datallowconn=false`) and emits no warning — **leave it alone**; the Supabase
  platform owns it.

### Option B — Minimal (silence only)

If we accept that a micro ICU bump did not change `en-US` ordering (well-supported, and consistent
with 0 invalid indexes):

```sql
ALTER DATABASE postgres  REFRESH COLLATION VERSION;
ALTER DATABASE template1 REFRESH COLLATION VERSION;
```

Stops the warning immediately with no reindex. Faster and lock-free, but does not rebuild indexes.
**Recommendation:** prefer **Option A** — the reindex cost here is negligible and it removes all
residual doubt.

### Safety / operational notes

- **Backup-first:** confirm Supabase PITR/daily backup is current before running. These operations
  do not modify row data (REINDEX rebuilds; REFRESH updates a version string), and the old index is
  only dropped after the new one succeeds — but backup-first remains policy for any prod DB op.
- **Blast radius:** minimal. `CONCURRENTLY` keeps tables writable throughout. No data migration.
- **Do NOT route this through the migration ledger.** These are database-instance operations, not
  schema DDL: `REINDEX DATABASE CONCURRENTLY` can't run in the migration transaction wrapper, and
  `REFRESH COLLATION VERSION` / `template1` are instance-level concerns that should not replay on
  preview branches. Run manually via SQL editor with approval, and log the action in the ticket.
- **Rollback:** not applicable in the usual sense — no data changes, operations are forward-only and
  idempotent (re-running REFRESH is a no-op once versions match). PITR remains the ultimate fallback.
- **Verification after running:**
  ```sql
  SELECT datname, datcollversion,
         pg_database_collation_actual_version(oid) AS actual,
         (datcollversion IS DISTINCT FROM pg_database_collation_actual_version(oid)) AS mismatch
  FROM pg_database;                    -- expect mismatch=false for postgres & template1
  ```
  Then confirm the `collation version mismatch` warnings stop in Unified Logs and the Postgres
  "success rate" recovers.

### Decisions needed from Stephen

1. **Option A (reindex + refresh) vs Option B (refresh only).** Recommend A.
2. **Maintenance window:** not strictly required (CONCURRENTLY is non-blocking on a 311 MB DB), but a
   low-traffic slot is prudent. Approve running ad-hoc vs scheduling.
3. **Who runs it:** manual SQL-editor execution by an approver (not via automated migration).

### 4.1 Residual follow-ups (require Supabase-managed roles — optional given micro bump)

- **`template1` collation refresh** — `ALTER DATABASE template1 REFRESH COLLATION VERSION;` must be
  run by `supabase_admin`/superuser (Supabase support or the platform). Until then, low-frequency
  `template1` collation warnings persist. Cosmetic; no data impact.
- **`auth` / `storage` reindex** — if full belt-and-braces is wanted, these schemas' collation
  btree indexes (≈39 indexes, ~470 kB) must be reindexed under `supabase_auth_admin` /
  `supabase_storage_admin`. Near-zero need for a micro bump.
- ~~Optional `public` reindex~~ — **DONE** (2026-07-09 second pass): all 121 collation-sensitive
  btree text indexes rebuilt via batched plain `REINDEX` with `lock_timeout` guard; verified clean.

---

## 5. Supabase Advisor — CRITICAL security findings (follow-up)

The three dashboard "CRITICAL" items map to the three `ERROR`-level advisor lints, all
`security_definer_view`:

| View | Finding | Note |
|------|---------|------|
| `public.agency_contacts_public` | View defined `SECURITY DEFINER` — enforces creator's RLS, not caller's | Backs agency PII exposure surface |
| `public.community_members_public` | same | Documented PII-safe mentor view (CLAUDE.md §5) |
| `public.investors_public` | same | Documented PII-safe investor view (CLAUDE.md §5) |

Remediation direction: set these views to `security_invoker = true` (PG15+) so the querying user's
RLS applies, and confirm the underlying tables' RLS still yields the intended PII-safe projection.
Because `community_members_public` / `investors_public` are *intended* public projections, this needs
a careful RLS review, not a blind flip — hence a **separate security ticket** (approval-gated under
§11: RLS/policies).

Advisor also flagged (lower priority, fold into the same or a second security ticket):

- **WARN — `anon`/`authenticated` can execute `SECURITY DEFINER` functions:** `get_ecosystem_stats`,
  `get_shared_report`, `has_role`, `match_knowledge`, `get_tier_gated_report`,
  `increment_download_count`. Several are *intentionally* public (`get_shared_report`,
  `match_knowledge`, `get_tier_gated_report` — see CLAUDE.md §7); triage which grants are deliberate
  vs should be revoked.
- **WARN — extensions in `public`:** `pg_trgm`, `vector`, `pg_net`.
- **WARN — Auth:** OTP expiry > 1h (MES-33 tracks auth config); leaked-password protection disabled.
- **INFO — RLS enabled but no policy** on ~20 internal/staging tables (`ii_*`, `events_staging`,
  `firecrawl_scrape_cache`, `mes_knowledge_base`, etc.) — deny-by-default is the intended posture for
  service-role-only tables, but worth a pass to confirm none should be readable.

**Recommendation:** open a dedicated **Security follow-up ticket** for the 3 `security_definer_view`
ERRORs + the SECURITY DEFINER function-grant triage; keep the extension/auth WARNs as a checklist
item on it. Do not bundle into the collation fix.

---

## 6. Acceptance-criteria coverage

- [x] Root cause confirmed with evidence (§1) — ICU `153.120`→`153.121` micro bump from platform image.
- [x] Affected databases/collations documented (§1.1–1.2) — `postgres` + `template1`; ICU `en-US`.
- [x] Impact assessment written (§2) — low integrity risk, 0 invalid indexes, noise is the real cost.
- [x] 79 errors categorised & decoupled from collation (§3) — separate, benign, ~0.03% of txns.
- [x] Remediation plan with safety/locking/rollback (§4) — reindex→refresh, CONCURRENTLY, approval-gated.
- [x] Advisor CRITICAL findings captured with next steps (§5) — separate security ticket recommended.
