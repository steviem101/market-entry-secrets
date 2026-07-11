# Phase 2 — Extract Irish Insights (`ii_*`) to its own project — EXECUTION RUNBOOK

> **Status: STAGED, NOT EXECUTED.** Prepared at Hard Stop 1 per user direction ("Prep Phase 2, hold for org").
> Nothing destructive runs until Irish Insights is verified fully operational on the new project (**Hard Stop 2**) before the MES drop. Project creation + cost approval are **DONE** (see §0 / §2).
> These files live OUTSIDE `supabase/migrations/` on purpose so `supabase db push` cannot apply the destructive drop prematurely. Copy into `supabase/migrations/` + `supabase/rollback/` only at execution time.
> Source of truth: `../supabase-reorg-master.md` (§5) and the audit `../_audit-supabase-reorg.md`.

---

## 0. Pre-flight gates (all must be ✅ before step 1)

> **Project CREATED 2026-06-23 — decision: inside the MES Pro org, NOT a separate org** (same owner; inherits Pro durability with no second subscription). Ref **`schyrnxekxcoaragofgv`** (org **Market Entry Secrets**, PRO), URL `https://schyrnxekxcoaragofgv.supabase.co`, region **eu-west-1 (Ireland)**, **MICRO** compute. Being in the MES Pro org it **inherits Pro backups + no auto-pause** and is MCP-reachable with no extra setup. Confirm the ref via `list_projects` before use.
> **Run location:** the schema/data move MUST run from a machine with **PG17 `pg_dump`** (or `supabase db dump`) and DB reach — i.e. the user's Mac, NOT the CC sandbox (its `pg_dump` is v16 < PG17 server, and it has no IPv6 for direct connections). The CC session handles only the MES-side drop (step 8) via MCP.
> ⚠️ **Before the destructive drop (step 8):** keep the MES `ii_*` copy until Irish Insights is verified operational on the new project (Hard Stop 2). Pro backups are already active on the new project, so durability is covered.
> **Superseded:** the earlier empty Free project `kvobhxuurxfjgvhxmoeg` (separate org) is **PARKED/unused** — ignore it; do not migrate into it or delete it.

- [x] Project created in the **MES Pro org** (`schyrnxekxcoaragofgv`) — §2 done. Confirm `ACTIVE_HEALTHY` via `list_projects` before step 3.
- [x] Reachable via MCP (same org as MES; `list_projects` shows it).
- [x] Cost approved + project provisioned (MICRO, eu-west-1).
- [ ] `mes-context` canary baseline captured (needs Content Creator access — still outstanding per audit §8). **The MES drop (step 8) must not run until this baseline exists**, even though `mes-context` reads MES product tables, not `ii_*`.

---

## 1. Inventory being moved (captured live 2026-06-21, MES `xhziwveaiuhzdoutpgrh`)

**9 tables** (~24.9k rows). FK graph is fully internal — extract as one unit:
```
ii_content (5,975 rows; 1,285 embedded)        ← parent of the 3 FKs below + reddit SET NULL
  ├─ ii_curations (256)        FK content_id → ii_content(id) ON DELETE CASCADE
  │    └─ ii_curated_log (4,861)  FK curation_id → ii_curations(id) ON DELETE CASCADE
  ├─ ii_experiment_outputs (30)  FK content_id → ii_content(id) ON DELETE CASCADE
  └─ ii_reddit_signals (550; 38 embedded)  FK promoted_content_id → ii_content(id) ON DELETE SET NULL
ii_published_archive (798; 798 embedded)       standalone
ii_personal_linkedin_posts (0; bigint IDENTITY id)  standalone, currently EMPTY
ii_prefilter_log (12,255)                       standalone
ii_intro_archive (9)                            standalone
```
Vector columns (`vector(1536)`, model `text-embedding-3-small`) on: `ii_content`, `ii_personal_linkedin_posts`, `ii_published_archive`, `ii_reddit_signals`. All vector indexes are **ivfflat** (lists 100 / 50) — copy as-is (do NOT switch to HNSW in this move; that's separate deferred debt).

**10 functions** (all `ii_*`-only; verified unused by MES product code):
- RPCs: `match_content`, `match_archive`, `match_emails`, `recent_ii_content`, `recent_ii_emails`, `upsert_ii_linkedin_posts`
- trigger fns: `update_ii_content_updated_at`, `ii_curations_set_updated_at`, `update_ii_published_archive_updated_at`, `ii_reddit_signals_set_updated_at`

**4 triggers** (BEFORE UPDATE → the trigger fns above) on `ii_content`, `ii_curations`, `ii_published_archive`, `ii_reddit_signals`.

**RLS:** every `ii_*` table has RLS enabled. Only **one policy**: `ii_content` `"Read relevant content"` — `SELECT TO public USING (is_ii_relevant = true)`. The other 8 are service-role-only (no policies). Travels with the schema dump.

**2 edge functions** to migrate (NOT in this repo — both deployed from elsewhere; source captured in `_audit` session):
- `apify-webhook` (`verify_jwt=false`) — upserts `ii_content`, inserts `ii_prefilter_log`. Secrets: `APIFY_WEBHOOK_SECRET`, `APIFY_TOKEN` (+ `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` auto-injected).
- `notion-research-trigger` (`verify_jwt=false`) — no DB; dispatches GitHub `research.yml`. Secrets: `NOTION_TRIGGER_SECRET`, `GITHUB_DISPATCH_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_REF`, `GITHUB_WORKFLOW_FILE`.

**No `ii_*` cron** on MES — orchestration is external (Apify task `3RnAZzC9CsXXPZrbM`, Notion automation, GitHub Actions `research.yml`, Beehiiv publishing, a Python classifier cron). **No MES `ii_*` reference-data dependency** (no FK/column into `countries` etc.) — nothing to denormalize (master §5 step 3 is a no-op here).

---

## 2. Create the new project — ✅ DONE (2026-06-23)
Created **inside the MES Pro org** (decision: not a separate org — same owner, inherits Pro
durability, no second subscription):
```
II_REF = schyrnxekxcoaragofgv     # name "Irish Insights", org "Market Entry Secrets" (PRO)
                                  # region eu-west-1 (Ireland), MICRO compute
```
Confirm via `list_projects` that it is `ACTIVE_HEALTHY` before step 3. **Rollback:** delete the new project; MES untouched.

## 3. Enable extensions on the new project
`vector` (must be **≥ 0.8.0** to match MES for a clean ivfflat embedding copy), `pg_trgm`. `pg_cron`/`pg_net` only if you later add in-DB scheduling (not needed for current `ii_*`). **Rollback:** `drop extension`.

## 4. Move schema then data via `pg_dump` (NOT MCP `execute_sql`)
Get connection strings from each project's dashboard (Settings → Database → connection string, session pooler off / direct). Use a restricted table set.
```bash
# 4a. SCHEMA ONLY from MES, ii_* objects (tables + owned seq) ---------------------
pg_dump "$MES_CONN" --schema-only --no-owner --no-privileges \
  -t 'public.ii_content' -t 'public.ii_curations' -t 'public.ii_curated_log' \
  -t 'public.ii_experiment_outputs' -t 'public.ii_reddit_signals' \
  -t 'public.ii_published_archive' -t 'public.ii_personal_linkedin_posts' \
  -t 'public.ii_prefilter_log' -t 'public.ii_intro_archive' \
  > ii_schema.sql
# NOTE: pg_dump -t does NOT pull standalone functions. Append the 11 fns + 4 triggers:
#   psql "$MES_CONN" -At -c "select pg_get_functiondef(oid) from pg_proc
#     where pronamespace='public'::regnamespace and proname in
#     ('match_content','match_archive','match_emails','recent_ii_content','recent_ii_emails',
#      'upsert_ii_linkedin_posts','update_ii_content_updated_at','ii_curations_set_updated_at',
#      'update_ii_published_archive_updated_at','ii_reddit_signals_set_updated_at',
#      'update_ii_emails_updated_at');" >> ii_schema.sql   -- 11th: orphan legacy trigger fn
#   then the 4 CREATE TRIGGER statements (captured in the audit session).
# Sanity-check ii_schema.sql by eye before restoring.

# 4b. RESTORE schema into new project --------------------------------------------
psql "$II_CONN" -v ON_ERROR_STOP=1 -f ii_schema.sql

# 4c. DATA ONLY from MES (embeddings copy as-is; same pgvector version) ----------
pg_dump "$MES_CONN" --data-only --no-owner --disable-triggers \
  -t 'public.ii_content' -t 'public.ii_curations' -t 'public.ii_curated_log' \
  -t 'public.ii_experiment_outputs' -t 'public.ii_reddit_signals' \
  -t 'public.ii_published_archive' -t 'public.ii_personal_linkedin_posts' \
  -t 'public.ii_prefilter_log' -t 'public.ii_intro_archive' \
  > ii_data.sql
psql "$II_CONN" -v ON_ERROR_STOP=1 -f ii_data.sql
```
**Do NOT dump the `auth` schema.** No `ii_*` rows reference `auth.users`, so no users to recreate.
**Rollback:** `truncate`/`drop` `ii_*` in the new project; MES is read-only in this phase.

## 5. Recreate indexes / RLS (verify they travelled)
The schema dump carries indexes (ivfflat + btree/gin), the 1 RLS policy, and `alter table ... enable row level security`. Verify:
```sql
-- on II_REF
select tablename, count(*) idx from pg_indexes where schemaname='public' and tablename like 'ii_%' group by 1;
select tablename, policyname from pg_policies where tablename like 'ii_%';
select relname, relrowsecurity from pg_class where relname like 'ii_%' and relkind='r';
```
**Rollback:** drop/recreate as needed in the new project.

## 6. Migrate edge functions + repoint consumers (new project)
- Deploy `apify-webhook` + `notion-research-trigger` to `II_REF` (`supabase functions deploy --project-ref $II_REF`, `verify_jwt=false`). Re-set their secrets (list in §1).
  > ⚠️ **Source not in this repo.** Both functions are deployed from the Irish Insights / `ii-ingest` codebase, not `market-entry-secrets`. Deploy from there, or use the source captured in the Phase 1 audit session (`apify-webhook`: `index.ts` + `normalisers/linkedin.ts` + `filters/prefilter.ts` + `types.ts`; `notion-research-trigger`: `index.ts`).
- **Repoint external consumers to the new function URLs/keys:**
  - Apify actor task `3RnAZzC9CsXXPZrbM` webhook URL → `https://$II_REF.functions.supabase.co/apify-webhook`.
  - Notion DB automation HTTP webhook → new `notion-research-trigger` URL.
  - GitHub `research.yml` env / `ii-ingest` CLI → new project ref + service-role key.
  - Beehiiv automations writing `ii_published_archive` → new connection.
  - Python classifier cron → new ref + key.
- **Rollback:** point consumers back at MES endpoints (still live until step 7).

## 7. Verify on the new project → **HARD STOP 2**
- Row counts per table match the MES source exactly (compare against §1).
- Sample a similarity query on copied embeddings (e.g. `select 1-(embedding<=>embedding) from ii_content where embedding is not null limit 1;` ⇒ 1.0; and a real `match_content` call returns rows).
- Run the Irish Insights critical path end-to-end (Apify→webhook→`ii_content`; a research dispatch; a Beehiiv publish path).
- **STOP. Get explicit human approval before ANY destructive action on MES.**

## 8. (Post-Hard-Stop-2) Drop `ii_*` from MES — scope `xhziwveaiuhzdoutpgrh`
1. **Capture the byte-exact down migration FIRST** (this IS the tested rollback per hard rule #5):
   ```bash
   pg_dump "$MES_CONN" --schema-only --no-owner --no-privileges \
     -t 'public.ii_*' > supabase/rollback/<ts>_ii_extraction_drop_from_mes_revert.sql
   # append the 11 fns + 4 triggers exactly as in step 4a, then restore-test it
   # against a scratch DB before proceeding.
   ```
2. Apply `10-mes-drop.sql` (this folder) as `supabase/migrations/<ts>_ii_extraction_drop_from_mes.sql`.
3. Remove the two edge functions from MES (dashboard/CLI delete on `xhziwveaiuhzdoutpgrh`).
4. **Re-run the `mes-context` canary** — must match the Phase-1 baseline.
5. `get_advisors(security)` + `get_advisors(performance)` on MES — confirm no new warnings.
- **Rollback of the drop:** apply the captured `*_revert.sql` (recreates the empty `ii_*` structure + functions + triggers + RLS), then `--data-only` restore from the Irish Insights copy if a full revert is ever needed.

---

## 9. Verification matrix to record after step 8 (master §10)
| Check | Expectation |
|---|---|
| Anon key on MES | Freemium gate intact; no change |
| Authenticated on MES | Normal product behaviour |
| Service role on MES | Full access |
| `get_advisors` security/perf | No new warnings; no orphaned `ii_*` refs |
| `mes-context` canary | Returns data, matches Phase-1 baseline |
| Irish Insights critical path | Fully operational on `II_REF` |

## 10. Halt conditions (stop + report, do not improvise)
Cross-account access failure · any `ii_*`↔non-`ii_*` FK discovered at dump time (none expected) · name collision blocking restore · any MES RLS change exposing data to anon · `mes-context` canary failure.

---

## 11. Execution log — Session B (2026-06-23)

**Project/ref corrected (this session's prompt overrides §0/step 2 of this runbook):**
the target is ref **`schyrnxekxcoaragofgv`** ("Irish Insights", region **eu-west-1**,
MICRO), created **inside the existing MES org** `gplxtklumpehzfpmbcji` — NOT a separate
org, NOT `kvobhxuurxfjgvhxmoeg` (that's a parked/empty Free project; do not touch).
Confirmed `ACTIVE_HEALTHY`, PG 17.6.1, via `list_projects`. Cost gate already satisfied
(project pre-created by a human).

**Step 3 DONE** (via MCP `apply_migration` on `schyrnxekxcoaragofgv`, migration
`ii_extraction_enable_extensions`): `vector` 0.8.0 + `pg_trgm` 1.6, both in **public**
to mirror MES exactly (MES has both in `public`; `pgcrypto`/`uuid-ossp` in `extensions`,
already present). UUID PK defaults use core `gen_random_uuid()` (no extension dep in PG17).
No `ii_*` collisions on the target.

**Live inventory re-captured (MES, 2026-06-23) — drift + corrections vs §1:**
- Row counts grew (pipeline is live): `ii_content` 6,202 (1,338 emb) · `ii_prefilter_log`
  12,508 · `ii_curated_log` 5,123 · `ii_curations` 282 · `ii_published_archive` 810 (810) ·
  `ii_reddit_signals` 550 (38) · `ii_experiment_outputs` 30 · `ii_intro_archive` 10 ·
  `ii_personal_linkedin_posts` 0. → **The Hard-Stop-2 "row counts match exactly" gate must
  compare against a MES snapshot captured AT DUMP TIME under a write-freeze**, not §1 and not
  a later drifting count. See `30-mac-commands.md` STEP 4b (count capture + freeze rationale).
- **FUNCTION COUNT IS 11, NOT 10.** Live found an 11th, `update_ii_emails_updated_at` — an
  orphaned plpgsql trigger fn (no trigger references it; legacy from when `ii_content` was
  `ii_emails`). `10-mes-drop.sql` updated to drop it; the down-migration capture must use the
  full 11-name set; carried to the target for a faithful copy.
- FK graph re-confirmed CLEAN (4 FKs, all `ii_*`→`ii_*`; 3 CASCADE, 1 SET NULL). RLS: all 9
  enabled, 1 policy (`ii_content` "Read relevant content"). 4 BEFORE UPDATE triggers. Object
  sweep: no `ii_*` views/matviews/enum types; only extra relation is the identity sequence
  `ii_personal_linkedin_posts_id_seq` (owned by the table, travels inside CREATE TABLE).

**Restore ordering correction (the runbook step 4 "append all fns to ii_schema.sql" would
fail):** `pg_dump -t` emits CREATE TRIGGER but not the standalone trigger functions, and the
6 RPCs are `LANGUAGE sql` (validated at CREATE, reference tables). Correct order is
**extensions → trigger fns → schema dump → RPC fns → data dump**. Captured byte-exact as:
- `20-ii-trigger-functions.sql` (5 trigger fns, pre-schema)
- `21-ii-rpc-functions.sql` (6 RPCs, post-schema)
These double as the function portion of the step-8 down-migration.

**Still needed from the operator:** edge-function source for `apify-webhook` +
`notion-research-trigger` (not in this repo) and their secret values, OR have CC deploy via
MCP given the source. External-consumer repoint is operator-side (see step 6).

---

### Session C (2026-06-29) — schema + data move COMPLETE; Hard-Stop-2 copy verification PASS

**Schema move (step 4a) DONE** on `schyrnxekxcoaragofgv`, in the corrected order
(extensions → trigger fns → schema dump → RPC fns). Verified via MCP: 9 tables, 54
indexes (incl. 4 ivfflat), 11 functions, 4 BEFORE UPDATE triggers, RLS enabled on all 9,
1 policy (`ii_content` "Read relevant content"). Vector columns present on the same 4
tables as MES (`ii_content`, `ii_published_archive`, `ii_reddit_signals`,
`ii_personal_linkedin_posts`).

**Data move (step 4b) DONE.** Moved on the operator's Mac via the resumable, pooler-safe
keyset-pagination script `migrate-ii-data.sh` (Session pooler, IPv4; statement timeout
disabled for the slow trans-Pacific→Ireland upload; per-chunk `.loaded` markers for
resume). Survived multiple pooler drops, a sleep-induced stall, and two transient DNS
blips — resumed cleanly each time. Final target row counts equal the dump-time snapshot
exactly (all 9 tables).

**Hard-Stop-2 copy verification (via MCP) — PASS:**
- **Row counts:** target == dump-time snapshot for all 9 tables
  (content 6754 · curated_log 5204 · curations 292 · experiment_outputs 30 ·
  intro_archive 10 · personal_linkedin_posts 0 · prefilter_log 13298 ·
  published_archive 810 · reddit_signals 550).
- **Embeddings:** all `vector(1536)`, single dim variant, counts match dump snapshot
  (published_archive 810/810, reddit_signals 38, content 1362). `vector_dims` uniform.
- **Similarity / RPC end-to-end:** `match_content(self_embedding, …)` returns the source
  row at similarity **exactly 1.000000** (lossless vector round-trip + live ivfflat index +
  working `LANGUAGE sql` RPC), with sane runner-up neighbours (0.69, 0.67).
- **Id-set checksums** `md5(string_agg(id ORDER BY id))`, target vs **live MES**:
  6 of 9 tables **bit-identical right now** (curations, experiment_outputs, intro_archive,
  personal_linkedin_posts, published_archive, reddit_signals). The other 3 differ only by
  post-dump drift on the high-churn ingest tables: **ii_content +143, ii_curated_log +9,
  ii_prefilter_log +793** (MES total +945). Target faithfully holds the dump-time snapshot.

**Consequence — NOT yet safe to drop MES `ii_*` (Hard Stop 2 not cleared for the drop).**
The copy is verified faithful, but live MES has drifted +945 rows on 3 ingest tables since
the dump. Dropping now would lose those rows. Before step 8 we need EITHER:
  (A) **Freeze + final delta sync** (recommended): quiesce the external writers
      (Apify task `3RnAZzC9CsXXPZrbM`, `research.yml`, Beehiiv, the Python classifier),
      delta-sync only rows newer than the dump watermark, repoint consumers to II, resume; OR
  (B) **Delta top-up now**, accepting continued drift until consumers are repointed.
Either way the drop is the LAST action, after consumers point at Irish Insights.

**Still blocked on the operator (unchanged):** edge-function source for `apify-webhook` +
`notion-research-trigger` (not in this repo) + their secrets (or have CC deploy via MCP given
source), and the external-consumer repoint (step 6). Cutover strategy (A vs B) is an operator
decision.

---

### Session C (2026-06-29) cont. — interim delta top-up (operator chose "top-up now, repoint later")

MES is still **actively writing** (a classify/curate batch was observed mid-measurement:
`ii_content` recent-window jumped 177→314 and `ii_curated_log` grew 5213→5427→… within
minutes). So a "now" top-up is by definition a moving target; the authoritative zero-gap
sync still happens at the freeze. Done as an interim convergence step anyway, per operator.

**Mechanism — server-side `dblink` (NOT through CC's context).** The delta included
`ii_content` rows with full `body_html` + `vector(1536)` embeddings (~2 MB, 57 kB max row);
round-tripping that through MCP result→reconstructed-INSERT would burn huge tokens and risk
escaping/truncation bugs. Instead: enabled `dblink` on II (`extensions` schema), pulled MES
rows DB→DB via the **Session pooler** (`aws-0-ap-southeast-2.pooler.supabase.com:5432`,
user `postgres.xhziwveaiuhzdoutpgrh`), `insert … on conflict` directly. All heavy types move
natively. `session_replication_role=replica` during inserts to neutralise the ii_*→ii_* FK
graph (incl. `ii_content.story_cluster_id` self-ref) regardless of order. Extension dropped
again afterwards (only `vector` + `pg_trgm` remain).

**Windows / conflict policy:** prefilter ≥06-25 DO NOTHING; content ≥06-20 DO UPDATE (catches
backfilled embeddings too); curations ≥06-20 DO UPDATE; curated_log ≥06-20 then ≥06-28 DO
NOTHING (append-only).

**Verification (server-side dblink anti-join, "MES rows missing from II"):**
8/9 tables = **0 missing**; `ii_curated_log` = 1 (a row appended by the live writer mid-check).
FK orphan checks on II all **0** (curated_log→curations, curations→content,
content→story_cluster). Final II counts: content 6897 (emb 1411) · curated_log 5483 ·
curations 295 · experiment_outputs 30 · intro_archive 10 · personal_linkedin_posts 0 ·
prefilter_log 14091 · published_archive 810 (810) · reddit_signals 550 (38).

**Caveats carried forward:**
- II is now a **superset** on `ii_curated_log` (it retains a few older rows MES has since
  pruned). Harmless for a log; if exact parity is wanted, reconcile at the freeze.
- Interim only — MES keeps drifting until consumers are repointed. **Final freeze-sync is
  still required and is authoritative** (re-enable dblink, repeat the anti-join to 0, validate
  FKs with `session_replication_role=default`).
- The MES DB password was used inline in the dblink conn string (already shared in chat and on
  the post-migration rotation list) — rotating it after cutover remains required; it also now
  appears in II query logs/pg_stat_statements.

**Hard Stop 2 status:** copy is verified faithful AND now topped-up to ~live, but the MES drop
remains BLOCKED on (a) edge-fn source/secrets + consumer repoint, and (b) the final
freeze-sync + explicit operator "yes". No destructive action taken on MES.

---

### Session C (2026-06-29) cont. — edge functions deployed to Irish Insights (step 6, partial)

The two ingest functions were **not in this repo** (canonical home: the `ii-ingest`
codebase) but **were deployed on MES**, so I pulled them verbatim via MCP
`get_edge_function(xhziwveaiuhzdoutpgrh, …)` and redeployed to `schyrnxekxcoaragofgv`
via `deploy_edge_function`. Both `verify_jwt=false` (in-code shared-secret auth, matching
MES). Exact deployed source captured under
`.claude/prompts/phase2-ii-extraction/edge-functions/` as a migration record/backup.

- `apify-webhook` → II v1 ACTIVE. Files: `index.ts`, `normalisers/linkedin.ts`,
  `filters/prefilter.ts` (+ a reconstructed `types.ts`; the original `./types.ts` import is
  type-only/erased — MES stored only 3 files). Entry `index.ts` at source root, mirroring MES.
- `notion-research-trigger` → II v1 ACTIVE. Single self-contained `index.ts`.

**New endpoints:**
`https://schyrnxekxcoaragofgv.supabase.co/functions/v1/apify-webhook` and
`…/functions/v1/notion-research-trigger`.

**Secrets — still operator action (MCP cannot set secret values).** `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` auto-inject. Must set on II:
- apify-webhook: `APIFY_WEBHOOK_SECRET`, `APIFY_TOKEN` (reuse MES values).
- notion-research-trigger: `NOTION_TRIGGER_SECRET`, `GITHUB_DISPATCH_TOKEN`,
  `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` (+ optional `GITHUB_REF`, `GITHUB_WORKFLOW_FILE`).
With secrets unset both fail closed (401 / 500), so they're safely inert pre-repoint.

**Still pending for step 6:** set the secrets above on II; repoint Apify task
`3RnAZzC9CsXXPZrbM` webhook URL + the Notion automation URL to the new endpoints (keep the
same header secrets); repoint DB consumers (Python classifier, Beehiiv, `research.yml`) to the
II connection string/keys. Then final freeze-sync + Hard Stop 2 + MES drop.

---

### Session C (2026-07-xx) cont. — notion-research-trigger VERIFIED end-to-end on Irish Insights

Consumer repoint + secrets completed for `notion-research-trigger`:
- Notion automation URL repointed MES → `https://schyrnxekxcoaragofgv.supabase.co/functions/v1/notion-research-trigger`.
- Secrets set on II: `NOTION_TRIGGER_SECRET` (aligned both sides), `GITHUB_DISPATCH_TOKEN`
  (fine-grained PAT, Actions:read/write), `GITHUB_REPO_OWNER=steviem101`,
  `GITHUB_REPO_NAME=irish-insights-email-ingest` (confirmed via list_repos — this is the
  ii-ingest repo holding `research.yml`).
- Verified in stages via edge logs + a side-effect-free empty-body probe (correct secret →
  `400 missing page_id` = secret + all GitHub vars present), then a **real Notion deep-research
  flip → `POST | 200` (1.8s)** = PAT valid and `research.yml` dispatched. Fully working.

Debug trail worth keeping: first real flip went to MES (200) because the Notion URL hadn't been
repointed; after repoint it hit II but `401` (secret mismatch); after secret alignment `500`
(GitHub vars missing); after GitHub vars `200`. Each step localized via the `get_logs` request
stream on both projects.

**Remaining for step 6:** `apify-webhook` still `502` (Apify dataset fetch failing →
`APIFY_TOKEN` wrong/missing). Needs token confirmed (`curl api.apify.com/v2/users/me` → 200) +
a fresh Apify run; verify `200` + rows in `ii_prefilter_log`/`ii_content`. Then: DB-consumer
repoint (Python classifier, Beehiiv, research.yml) → final freeze-sync → Hard Stop 2 → MES drop.

---

### 2026-07-11 — GitHub-Actions pipeline cut over to Irish Insights + backlog resynced

Operator repointed the `steviem101/irish-insights-email-ingest` Actions secrets:
`SUPABASE_URL` → `https://schyrnxekxcoaragofgv.supabase.co`, `SUPABASE_SECRET_KEY` →
Irish Insights service-role key. The repo's full Actions secret list confirmed the ENTIRE
pipeline (Gmail ingest, Beehiiv, Anthropic/OpenAI classifier, research orchestrator,
Slack/Notion posting) runs as GitHub Actions sharing those two values — so this single change
repoints Gmail ingest + Beehiiv + classifier + research all at once. Only two Supabase-related
secrets existed (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`); no raw `DATABASE_URL`.

**MES drift since the 06-29 sync** (pipeline was still MES-pointed until the cutover):
content +227 (7124), curated_log +581 (6064), curations +48 (343), published_archive +12 (822);
prefilter +0 (Apify billing-blocked), reddit +0. MES last write 2026-07-10 10:26; quiet since.

**Backlog resynced via dblink** (II had NO pipeline writes yet — all II data still from the
06-29 sync — so DO UPDATE from MES carried zero clobber risk): content (≥06-25, upsert),
curations (≥06-25, upsert), curated_log (≥06-25, insert-only), published_archive (full table,
upsert — metrics update in place on old rows). Post-sync anti-join: **0 missing on all tables,
0 FK orphans.** dblink dropped again.

**Cutover state:** every writer now targets Irish Insights — Apify webhook (billing-blocked),
Notion trigger (verified), and the whole Actions pipeline. MES `ii_*` should now be frozen.

**Remaining before Hard Stop 2 / drop:**
1. Confirm the pipeline actually writes to II on its next scheduled run (or a manual dispatch) —
   watch for II `ii_content`/`ii_curated_log` timestamps advancing past 2026-07-11.
2. Confirm nothing runs the pipeline OUTSIDE GitHub Actions (operator to verify; secrets list
   strongly implies Actions-only).
3. Apify: raise the monthly usage limit ($29/$29 hard cap) to run its final live test; token
   already verified. Not a drop blocker (webhook already points to II).
4. FINAL freeze-sync right before the drop must be **insert-only (DO NOTHING)** to avoid
   reverting any II-native post-cutover updates (metrics/embeddings/status) with frozen MES data.
5. Then Hard Stop 2 (explicit approval) → capture byte-exact rollback → drop MES `ii_*` → remove
   the 2 MES edge fns → re-run mes-context canary → get_advisors → rotate the shared DB passwords.

---

### 2026-07-11 — apify-webhook verified live end-to-end; II is now source of truth

Operator raised the Apify monthly limit ($29→$40) and re-ran task `3RnAZzC9CsXXPZrbM`
(`harvestapi/linkedin-profile-posts`). On completion the webhook fired and delivered:
`POST 200` (2.3s), **692 posts pre-filtered → 430 kept into `ii_content` (linkedin_post)**,
262 dropped. Totals: `ii_content` 7124→7554, `ii_prefilter_log` 14091→14783. APIFY_TOKEN fix
confirmed working against a real dataset.

**Both edge functions now verified with live traffic:** apify-webhook (430 real rows) +
notion-research-trigger (real dispatch 200). Irish Insights holds 430 linkedin rows MES does
NOT have (MES Apify was billing-blocked) — i.e. II is now legitimately ahead; the cutover is real.

**Confirmed live paths:** Apify ingest ✅, Notion research dispatch ✅.
**Not yet watched end-to-end on II:** the Gmail/Beehiiv/classifier GitHub-Actions pipeline —
same shared secrets, so low risk, and the 430 new unclassified rows (is_ii_relevant=null) are a
natural pending test for the next classifier run. Operator confirmed pipeline is Actions-only.

**Endgame remaining:** (1) confirm one GitHub-Actions run reads/writes II (email ingest +
classifier picking up the 430 new rows); (2) final INSERT-ONLY freeze-sync (MES is frozen ~24h;
must not clobber II's now-fresh data); (3) Hard Stop 2 explicit approval → capture byte-exact
rollback → drop MES `ii_*` → remove 2 MES edge fns → re-run mes-context canary → get_advisors →
rotate the shared DB passwords.

---

### 2026-07-11 — FULL PIPELINE VERIFIED on Irish Insights; MES drop DEFERRED (operator choice)

Ran `II Email Ingestion` (ingest.yml: `ingest` + `classify-pending` jobs). Results in II:
- `ingest` green → `ii_content` 7554→7571 (new emails written with operator's SUPABASE_SECRET_KEY).
- `classify-pending` green → **linkedin unclassified 430→0** (classifier WROTE is_ii_relevant back:
  1085 relevant / 4150 not-relevant). Confirms Actions→II **write** path with the operator key.
- Earlier same run: curation job read II (all REST GETs 200 via python-httpx). The II Curation
  "Failed to save" warning was NOT Supabase (all II calls 200/201) — an external service (Notion)
  blip.

**Every path now verified live on Irish Insights:** email ingest (write), classifier (write),
Apify linkedin (write, 430 rows), curation (read), notion research dispatch (200), plus the full
data copy (9 tables, 0 missing, FK-clean, embeddings + match_content self-sim = 1.0). II is the
operational source of truth; all writers repointed; MES `ii_*` frozen since 2026-07-10 10:26.

**Hard Stop 2 reached; operator chose "keep MES as backup, drop later."** No destructive action
taken. MES `ii_*` retained as a frozen safety copy.

**To execute the drop later (when operator says go):**
1. Confirm MES `ii_*` still frozen (no writes since cutover) + `10-mes-drop.sql` sentinel.
2. Final **insert-only** sync MES→II (expect 0 missing; MES frozen) — re-enable dblink, verify, drop it.
3. Capture byte-exact rollback → `supabase/rollback/<ts>_ii_extraction_drop_from_mes_revert.sql`
   (schema-only `pg_dump -t 'public.ii_*'` + the 11 fns + 4 triggers via the captured 20-/21- SQL).
4. Copy `10-mes-drop.sql` → `supabase/migrations/<ts>_ii_extraction_drop_from_mes.sql`; run via MCP.
5. Delete MES edge fns `apify-webhook` + `notion-research-trigger`; re-run mes-context canary;
   `get_advisors(security|performance)` on MES.

**Housekeeping (independent of the drop):**
- Rotate the **II DB password** now (live production DB; the postgres password was shared in chat).
  Nothing operational uses it — the pipeline auth is the service-role key — so rotation is safe.
- Rotate the **MES DB password** after the final sync/drop (dblink still needs it until then).
- Gmail OAuth token is printed in the `ingest` job summary — suppress in ingest.yml when convenient.
