# Phase 2 — Extract Irish Insights (`ii_*`) to its own project — EXECUTION RUNBOOK

> **Status: STAGED, NOT EXECUTED.** Prepared at Hard Stop 1 per user direction ("Prep Phase 2, hold for org").
> Nothing here runs until: (1) a human creates the **Irish Insights** org, (2) `get_cost`/`confirm_cost` + explicit cost approval, (3) Irish Insights is verified fully operational on the new project (**Hard Stop 2**) before the MES drop.
> These files live OUTSIDE `supabase/migrations/` on purpose so `supabase db push` cannot apply the destructive drop prematurely. Copy into `supabase/migrations/` + `supabase/rollback/` only at execution time.
> Source of truth: `../supabase-reorg-master.md` (§5) and the audit `../_audit-supabase-reorg.md`.

---

## 0. Pre-flight gates (all must be ✅ before step 1)
- [ ] Irish Insights **organization** exists (human, dashboard).
- [ ] This account can reach the new org via MCP (`list_organizations` shows it).
- [ ] `mes-context` canary baseline captured (needs Content Creator access — still outstanding per audit §8). **The MES drop in step 7 must not run until this baseline exists**, even though `mes-context` reads MES product tables, not `ii_*`.
- [ ] Cost approved: run `get_cost(type=project, organization_id=<II org>)` → `confirm_cost` → human "yes".

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

## 2. Create the new project (scope: Irish Insights org)
```
get_cost(type=project, organization_id=<II_ORG_ID>)
confirm_cost(...)                  # human approval REQUIRED (hard rule #10)
create_project(name="Irish Insights", organization_id=<II_ORG_ID>, region=ap-southeast-2)
```
Record `II_REF=<new ref>`. **Rollback:** delete the new project; MES untouched.

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
# NOTE: pg_dump -t does NOT pull standalone functions. Append the 10 fns + 4 triggers:
#   psql "$MES_CONN" -At -c "select pg_get_functiondef(oid) from pg_proc
#     where pronamespace='public'::regnamespace and proname in
#     ('match_content','match_archive','match_emails','recent_ii_content','recent_ii_emails',
#      'upsert_ii_linkedin_posts','update_ii_content_updated_at','ii_curations_set_updated_at',
#      'update_ii_published_archive_updated_at','ii_reddit_signals_set_updated_at');" >> ii_schema.sql
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
   # append the 10 fns + 4 triggers exactly as in step 4a, then restore-test it
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
