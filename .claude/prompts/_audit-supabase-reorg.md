# Phase 1 Audit — Supabase Reorganization + Knowledge Base Integration

> Deliverable for **Hard Stop 1** of `supabase-reorg-master.md`.
> Mode: **read-only**. No DDL, writes, deploys, or project creation were performed.
> Session: CC Session A (Phase 1). Date: 2026-06-21.
> Verdict in one line: **`ii_*` extraction is clean and ready to plan; the KB layer already exists and is healthy; but the cross-project half of this initiative (Content Creator) is currently UN-REACHABLE and conflicts with `CLAUDE.md` — that must be resolved before Phase 4 and before the canary discipline can run.**

---

## 0. TL;DR — what changes vs. the master spec's assumptions

| Master-spec assumption | Reality found live | Impact |
|---|---|---|
| 3 projects reachable, "1 account owns all" | **Only 1 org (`Market Entry Secrets` / `gplxtklumpehzfpmbcji`) and 1 project (`xhziwveaiuhzdoutpgrh`) are visible to this session.** Content Creator (`rcgaviwbsudouvfwzydq`) is NOT listed. No Irish Insights org exists. | **BLOCKER** for Phases 4 + the per-phase `mes-context` canary. |
| `CLAUDE.md` is silent on Content Creator | `CLAUDE.md` explicitly lists `rcgaviwbsudouvfwzydq` as **out of scope — "Never read from, write to, or migrate against it from this repo."** | **GOVERNANCE CONFLICT** — needs explicit user override. |
| `mes_knowledge_base` may exist from prior RAG prompt | It **fully exists and is in production**: 2,844 rows, 100% embedded, 10 source tables, cron-driven re-embed every 2 min. | Phase 3 = **extend**, not build. |
| Report creator may be prompt/template-only | It **already does KB vector retrieval** (`generate-report/semanticMatch.ts` → `match_knowledge` RPC). | Phase 5 = **extend existing retrieval**, not add it. |
| Existing KB schema = spec's `source_type`/`source_project`/`source_ref` | Existing schema is the **prior prompt's shape**: `source_table` / `source_id uuid` / `chunk_index` / `content_hash` / `embedded_hash`. RPC is `match_knowledge`, not `match_knowledge_base`. | Phase 3/4 = **reconcile by extension**, reuse `match_knowledge`. |
| `ii_*` FK entanglement is the make-or-break | **All 4 `ii_*` FKs are internal (`ii_*` → `ii_*`). Zero cross-boundary FKs. No `auth.users` FK. No view/frontend consumer.** | Extraction verdict: **CLEAN**. |

---

## 1. Account / org / project map (master Phase 1 §1)

- **Postgres MCP / account reach:** exactly **one** organization and **one** project.
  - Org: `Market Entry Secrets` — `gplxtklumpehzfpmbcji`
  - Project: `xhziwveaiuhzdoutpgrh` (MES Platform) — `ACTIVE_HEALTHY`, Postgres **17.4.1**, region `ap-southeast-2`, created 2025-06-09.
- **Content Creator (`rcgaviwbsudouvfwzydq`): NOT reachable** from this session (not in `list_projects`; not in any reachable org).
- **Irish Insights org: does not exist yet** (human prerequisite per master §3).

> **Consequence:** every master-spec step that reads or writes Content Creator — Phase 1 §4 (CC inventory), §7 (CC view-name collision), §8 (`mes-context` canary, since that function lives in CC), and **all of Phase 4** — cannot be executed or even verified from this session. See §10 Open Decisions.

---

## 2. Extensions on MES Platform (master Phase 1 §2)

| Extension | Version | Relevance |
|---|---|---|
| `vector` (pgvector) | **0.8.0** | KB + `ii_*` embeddings. Irish Insights project must get **≥ 0.8.0** for a clean embedding copy. |
| `pg_cron` | 1.6 | KB embed cron + others. `ii_*` uses **no** in-DB cron (see §4). |
| `pg_net` | 0.14.0 | cron → edge-function HTTP calls. |
| `pg_trgm` | 1.6 | hybrid keyword search in `match_knowledge`. |
| `pgcrypto`, `uuid-ossp` | 1.3 / 1.1 | gen_random_uuid etc. |
| `supabase_vault` | 0.3.1 | secret storage for cron (`slack_notify_url`, etc.). |
| `wrappers` | 0.5.0 | FDW (the `MES` Notion foreign table, moved to `private` schema per `CLAUDE.md`). Not `ii_*`-related. |
| `pg_stat_statements` | 1.11 | — |

**Irish Insights project will need:** `vector` (≥0.8.0). `pg_trgm` if it reuses `match_*` hybrid search. **`pg_cron`/`pg_net` are NOT required for `ii_*`** — the orchestration is external (GitHub Actions / Python crons / Apify / Beehiiv). Confirm against the new project's release channel at creation.

---

## 3. `ii_*` inventory + FK entanglement verdict (master Phase 1 §3) — **the make-or-break**

### 3.1 Tables (9), row counts, embeddings, RLS

| Table | Rows | Embedded | `vector` col | RLS enabled | RLS policies |
|---|---:|---:|:--:|:--:|---|
| `ii_content` (PK index legacy-named `ii_emails_pkey`; was `ii_emails`) | 5,975 | 1,285 | ✅ | ✅ | 1: `Read relevant content` — `SELECT` to `public` where `is_ii_relevant = true` |
| `ii_prefilter_log` | 12,255 | — | — | ✅ | none → service-role only |
| `ii_curated_log` | 4,861 | — | — | ✅ | none |
| `ii_curations` | 256 | — | — | ✅ | none |
| `ii_published_archive` | 798 | 798 (100%) | ✅ | ✅ | none |
| `ii_reddit_signals` | 550 | 38 | ✅ | ✅ | none |
| `ii_experiment_outputs` | 30 | — | — | ✅ | none |
| `ii_intro_archive` | 9 | — | — | ✅ | none |
| `ii_personal_linkedin_posts` | **0** | 0 | ✅ | ✅ | none |

Notes: `ii_content` carries `embedding`, `embedding_model`, `author_name/handle/url` (plain text, **not** FKs to people). `ii_personal_linkedin_posts` is built (cols + unique `post_id` + ivfflat index + `upsert_ii_linkedin_posts` RPC, migration `20260619`) but **not yet populated**. `ii_published_archive` links to Beehiiv via `beehiiv_post_id`.

### 3.2 Foreign keys — **CLEAN**

All foreign keys touching any `ii_*` table (queried both directions via `pg_constraint`):

| FK | Child → Parent |
|---|---|
| `ii_curated_log_curation_id_fkey` | `ii_curated_log` → `ii_curations` |
| `ii_curations_content_id_fkey` | `ii_curations` → `ii_content` |
| `ii_experiment_outputs_content_id_fkey` | `ii_experiment_outputs` → `ii_content` |
| `ii_reddit_signals_promoted_content_id_fkey` | `ii_reddit_signals` → `ii_content` |

**Every FK is `ii_*` → `ii_*`.** No FK crosses into MES tables, and **no `ii_*` table has an FK to `auth.users`** (authors are text). → **Extraction severs nothing in MES; no halt condition fires.**

### 3.3 Functions / RPCs referencing `ii_*` (move with the schema)

`match_content`, `match_archive`, `match_emails`, `recent_ii_content`, `recent_ii_emails`, `upsert_ii_linkedin_posts`. All are `ii_*`-only; **none referenced by MES product code.**

### 3.4 `cron.job` touching `ii_*`

**None.** The 6 active cron jobs are: `process-email-queue` (jobid 3), `roll-forward-month-precision-events` (4), `embed-knowledge` (5, KB), `slack-activity-digest` (6), `detect-funnel-gate-hits` (7), `report-quality-rollup` (9). The `ii_*` pipeline is driven **externally** (Apify → `apify-webhook`; GitHub Actions `research.yml`; a Python classifier cron; Beehiiv publishing). → **No cron to migrate for Phase 2**, but external orchestrators must be repointed.

### 3.5 Edge functions operating on `ii_*`

| Function | Touches `ii_*`? | Secrets | Disposition |
|---|---|---|---|
| `apify-webhook` (v14, `verify_jwt=false`, deployed from **outside this repo** — `source/index.ts` + `normalisers/`, `filters/`) | **Yes** — upserts `ii_content`, inserts `ii_prefilter_log` (service-role) | `APIFY_WEBHOOK_SECRET`, `APIFY_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | **Move to Irish Insights**; repoint Apify webhook URL. Source captured this session. |
| `notion-research-trigger` (v11, `verify_jwt=false`) | **No DB** — only `workflow_dispatch` to GitHub `research.yml` | `NOTION_TRIGGER_SECRET`, `GITHUB_DISPATCH_TOKEN`, `GITHUB_REPO_OWNER/NAME/REF`, `GITHUB_WORKFLOW_FILE` | **Move to Irish Insights** (pure orchestration, no MES dep); repoint Notion automation URL. |

### 3.6 Indexes (recreated by schema dump; **note the ivfflat debt**)

All `ii_*` vector indexes are **ivfflat `vector_cosine_ops`** (`lists`=100 for `ii_content`/`ii_personal_linkedin_posts`/`ii_published_archive`, 50 for `ii_reddit_signals`) — not HNSW. They travel with `pg_dump --schema-only`. Plus the expected btree/gin (author, tags, source_metadata, unique keys). Full DDL captured for the down-migration.

### 3.7 External consumers of `ii_*`

- **No `src/` frontend reads `ii_*`.** (Repo grep: `ii_*` only appears in `ii_*` migrations, docs, `CLAUDE.md`, review notes — never in app code.)
- **No SQL view references `ii_*`** (`information_schema.views` scan empty).
- External, off-DB consumers to repoint in Phase 2 §7: **Apify** actor task `3RnAZzC9CsXXPZrbM` (LinkedIn) → `apify-webhook`; **Notion** automation → `notion-research-trigger`; **GitHub Actions** `research.yml`; **Beehiiv** (publishing into `ii_published_archive`); the **Python classifier cron**. *(These cannot be inventoried from Supabase MCP — confirm with the operator / `.github/workflows` / Beehiiv MCP before cutover.)*

---

## 4. Content Creator inventory (master Phase 1 §4) — **NOT VERIFIABLE THIS SESSION**

`rcgaviwbsudouvfwzydq` is unreachable (see §1). The master spec's expected shape — `linkedin_posts(text, embedding vector(1536), engagement_score, quality_score, content_types, post_url, post_date, source_profile_id)`, model `text-embedding-3-small`, RPCs `match_linkedin_posts` / `match_linkedin_posts_v2`, edge fns `generate-content`/`mes-context`/`rag-search`/`ingest-posts`/`apify-webhook`/`classify-content` — **could not be confirmed.** This entire section is **deferred to a session that has Content Creator access.** It gates Phase 4.

> ⚠️ **Source ambiguity to resolve:** the report's "LinkedIn corpus" could mean (a) Content Creator's `linkedin_posts` (the master spec's Phase 4 source), or (b) the `ii_*` LinkedIn data here (`ii_content` `source_type='linkedin_post'`, and the empty `ii_personal_linkedin_posts`). These are **different datasets for different products** — `ii_*` LinkedIn feeds the Irish Insights newsletter and is being extracted out; Content Creator's `linkedin_posts` is the marketing-RAG corpus the spec wants to sync into MES. Phase 4 must read **Content Creator's `linkedin_posts`**, not `ii_*`. Flagging so the two are never conflated post-extraction.

---

## 5. MES Platform report creator (master Phase 1 §5) — **already retrieves**

- Report generator = edge function **`generate-report`** (v182, `verify_jwt=false`, in-code JWT + ownership).
- It **already performs KB vector retrieval**: `generate-report/semanticMatch.ts` builds a NL query from the intake (`buildMatchQueryText`), the edge fn embeds it and calls **`match_knowledge`**, then `groupRankedBySource` dedupes by `source_table` and hydrates full rows for **8 entity types**: `service_providers`, `community_members`, `events`, `content_items`, `innovation_ecosystem`, `trade_investment_agencies`, `investors`, `lead_databases`.
- → **Phase 5 is an extension** (add a synthesis-only source + provenance guardrail), not new retrieval plumbing.

---

## 6. `mes_knowledge_base` state (master Phase 1 §6) — **exists, healthy, in production**

Built by migrations `kb_phase2_schema` … `kb_phase6c_fanout_content_chunks` (2026-06-14), with paired reverts in `supabase/rollback/`.

### 6.1 Live schema (⚠️ differs from master spec)

```
mes_knowledge_base(
  id uuid pk default gen_random_uuid(),
  source_table text not null,       -- spec wanted source_type
  source_id    uuid not null,       -- spec wanted source_ref text
  chunk_index  int not null default 0,
  entity_type  text not null,
  title text, content text not null,
  metadata jsonb not null default '{}',
  content_hash text not null,
  embedding vector(1536),
  embedded_hash text,
  embedding_model text default 'text-embedding-3-small',
  updated_at timestamptz not null default now(),
  unique(source_table, source_id, chunk_index)
)
```
- **No `source_project` / `source_ref` columns.** RLS **enabled, zero policies → service-role only**. `knowledge_embed_log` same posture.
- Match RPC is **`match_knowledge(query_embedding vector, query_text text, match_count int, match_threshold float, filter jsonb, allowed_visibility text[])`**, `SECURITY DEFINER` (visibility enforced inside). Spec's `match_knowledge_base(... source_types[], min_quality)` **does not exist** — reuse/extend `match_knowledge`.
- Helpers present: `kb_sync_all`, `upsert_kb_service_provider` (+ per-entity upserts), `embed-knowledge` & `knowledge-search` edge fns, cron jobid 5 (`*/2 * * * *`).

### 6.2 Content (2,844 rows, 100% embedded, 0 stale)

`content_items` 1,650 (case_study 883, guide 738, best_practice 14, compliance 5, interview 5) · `investors` 447 · `events` 140 · `trade_investment_agencies` 133 · `community_members` 132 · `innovation_ecosystem` 124 · `service_providers` 95 · `lead_databases` 65 · `country_faqs` 58 · `countries` 5.

### 6.3 Phase 3 reconciliation (how to "extend, not recreate")

LinkedIn posts can be absorbed **within the existing schema** via convention: `source_table='linkedin_post'`, `source_id=<CC post uuid>`, `entity_type='linkedin_post'`, engagement/quality/author/post_date → `metadata`, `visibility` per the existing contract. Optionally add a nullable **`source_project text default 'mes_platform'`** column for provenance clarity (additive, reversible). **Do not** create a parallel `match_knowledge_base`; pass an `entity_type`/`source_table` filter through `match_knowledge`'s existing `filter jsonb`. RLS already meets the spec's "service-role writes / gated reads" requirement.

---

## 7. Name-collision check (master Phase 1 §7)

MES-side new objects are **free**: no `kb-sync` edge fn (the 26 deployed don't include it), no `CONTENT_CREATOR_URL`/`CONTENT_CREATOR_ANON_KEY` secret yet. The Content-Creator-side `kb_sync_source` view name **cannot be checked** (CC unreachable). Naming divergence to honor: existing `match_knowledge` (not `match_knowledge_base`); existing `source_table`/`source_id` (not `source_type`/`source_ref`).

---

## 8. Baseline canary (master Phase 1 §8) — **NOT CAPTURABLE THIS SESSION**

The `mes-context` function lives in **Content Creator** (unreachable), so its reference output cannot be recorded here. **Hard rule #8's canary cannot run until CC access exists.** Until then, the Phase 2 destructive drop of `ii_*` (which runs only at Hard Stop 2) **must not proceed**, because we cannot prove `mes-context` is unaffected before/after. *(Note: `mes-context` reads MES product tables, not `ii_*`, so the `ii_*` drop is very unlikely to affect it — but the spec mandates the canary, and I will not waive a hard rule.)*

---

## 9. Migration plan with rollback (Phases 2–5)

> Convention to follow (already used in-repo): up = `supabase/migrations/<ts>_<name>.sql`, down = `supabase/rollback/<ts>_<name>_revert.sql`. Every step below lists its rollback. **Nothing here executes until Hard Stop 1 is approved and the §10 blockers are resolved.**

### Phase 2 — Extract Irish Insights (scope: NEW ref, then `xhziwveaiuhzdoutpgrh` for the drop)
1. **Create project** in Irish Insights org. `get_cost` → `confirm_cost` → **human approval** → `create_project`. *Rollback:* delete the new project (no MES change yet).
2. **Enable extensions** on new project: `vector` (≥0.8.0), `pg_trgm`. *Rollback:* drop extensions.
3. **Schema + data move via `pg_dump`** (NOT MCP `execute_sql`), restricted to the 9 `ii_*` tables + their 6 functions + ivfflat/btree/gin indexes + RLS. `--schema-only` then `--data-only`; embeddings copy as-is. **Do not dump `auth`.** *Rollback:* truncate/drop `ii_*` in the new project (source untouched).
4. **No cron to recreate** (none exist); recreate the single `ii_content` RLS policy + the (none) others; verify ivfflat indexes rebuilt. *Rollback:* drop policies/indexes in new project.
5. **Migrate edge fns** `apify-webhook` + `notion-research-trigger` to new ref (`functions deploy`); re-set their secrets. *Rollback:* delete fns in new project; old ones still live on MES until step 9.
6. **Repoint external consumers** (Apify webhook URL, Notion automation URL, `research.yml` env, Beehiiv). *Rollback:* point them back at MES endpoints.
7. **Verify (canary):** Irish Insights critical path end-to-end on new project; row counts match source; sample similarity query on copied embeddings. → **HARD STOP 2.**
8. **Only after Hard Stop 2 approval — destructive drop on MES** (`xhziwveaiuhzdoutpgrh`): drop `ii_*` tables (CASCADE within `ii_*` only), the 6 `ii_*` functions, and remove `apify-webhook`/`notion-research-trigger` from MES. *Rollback:* a paired `*_revert.sql` recreating the (empty) `ii_*` structure + functions + indexes + RLS from the captured DDL. Re-run `mes-context` canary; run `get_advisors` (security+performance) on MES.

### Phase 3 — Extend `mes_knowledge_base` (scope: `xhziwveaiuhzdoutpgrh`)
- Additive migration: optional `source_project text default 'mes_platform'` column + partial index for `source_table='linkedin_post'`; keep `match_knowledge`, add `entity_type`/`source_table` filter support if not already expressible via `filter jsonb`. *Rollback:* drop column/index; `match_knowledge` revert to current definition. **No pilot rebuild needed** — `service_providers` is already live.

### Phase 4 — CC → KB sync (scope: read CC, write `xhziwveaiuhzdoutpgrh`) — **blocked on §10**
- CC side: `kb_sync_source` view over `linkedin_posts` (quality-gated) granted to `anon`; if not anon-safe, `SECURITY DEFINER` fn (get approval). MES side: secrets `CONTENT_CREATOR_URL` + `CONTENT_CREATOR_ANON_KEY`; `kb-sync` edge fn; 4a one-time COALESCE-protected backfill (embeddings copied, not regenerated); 4b `pg_cron`+`pg_net` incremental sync (~every 3 days, watermarked) with run logging. *Rollback:* delete synced `source_table='linkedin_post'` rows; unschedule cron; drop `kb-sync`; drop CC view.

### Phase 5 — Wire report creator (scope: `xhziwveaiuhzdoutpgrh`)
- Extend `semanticMatch.ts`/`index.ts` to include `linkedin_post` as **synthesis-only** context (NOT a hydrated directory entity), and add the **provenance guardrail** to the report system prompt (abstract/combine only; never reproduce verbatim; never attribute quotes to named individuals in paid output). *Rollback:* revert the edge-fn deploy to the prior version.

---

## 10. Open decisions for the user (resolve before any Phase 2+ work)

1. **Content Creator access + `CLAUDE.md` conflict.** `rcgaviwbsudouvfwzydq` is unreachable from this account/session, **and** `CLAUDE.md` forbids touching it from this repo. Phase 4 and the canary discipline depend on it. Options: (a) consolidate/transfer so this account can reach CC and explicitly override the `CLAUDE.md` out-of-scope rule for this initiative; (b) keep CC walled off per `CLAUDE.md` and **drop/defer Phase 4** (LinkedIn sync), shipping only the `ii_*` extraction (Phase 2) + KB extension. No further CC work proceeds until this is decided.
2. **Irish Insights org** must be created by a human (master §3) before Phase 2 step 1.
3. **Cost gate** for the new project (master rule #10) — needs `get_cost`/`confirm_cost` + explicit approval at Phase 2 step 1.

## 11. Verification baseline captured this session
- MES Platform reachable & healthy (PG 17.4). KB: 2,844 rows / 100% embedded / 0 stale; embed cron active.
- `ii_*`: 9 tables, ~24.9k rows, all FKs internal, 0 MES consumers — extraction CLEAN.
- ❌ `mes-context` baseline NOT captured (CC unreachable) — required before Hard Stop 2.

### → HARD STOP 1. Awaiting approval of this plan and resolution of §10 before any DDL/writes/deploys/project creation.

---

## 12. Decisions taken at Hard Stop 1 (2026-06-21)

1. **Content Creator scope → "Grant access + override `CLAUDE.md`."** Phase 4 (LinkedIn sync) stays in plan. CC (`rcgaviwbsudouvfwzydq`) is still unreachable from this session, so its inventory (§4), name-collision check (§7), and the `mes-context` canary baseline (§8) are **deferred to a future session once access is consolidated**. No CC reads/writes happened here.
2. **Next step → "Prep Phase 2, hold for org."** Phase 2 extraction artifacts drafted (no execution) in `phase2-ii-extraction/`:
   - `00-runbook.md` — full execution runbook (pg_dump move, extensions, edge-fn migration, consumer repoint, Hard Stop 2 verification, snapshot-based rollback, advisors).
   - `10-mes-drop.sql` — the post-Hard-Stop-2 MES teardown (9 tables + 10 functions), staged outside `supabase/migrations/` so it can't auto-apply.
   - Down-migration strategy: a byte-exact `pg_dump --schema-only -t 'public.ii_*'` snapshot captured immediately before the drop (more faithful than hand DDL; satisfies hard rule #5).
3. **Still blocking actual Phase 2 execution:** human creates Irish Insights org → `get_cost`/`confirm_cost` + approval → then a fresh session (B) runs the runbook. CC access also needs consolidating before Phase 4 and before the canary discipline can run.

---

## 13. Progress log — 2026-06-22

**Access resolved.** Content Creator (`rcgaviwbsudouvfwzydq`, renamed "MES Content Creator") was **transferred into the Market Entry Secrets org** (`gplxtklumpehzfpmbcji`), and MES Platform renamed "MES - Australia" (ref unchanged `xhziwveaiuhzdoutpgrh`). The connector now reaches **both** in one session. Irish Insights stays in its own org (separate-billing/spin-off intent preserved); its Phase 2 access will be a one-time per-session re-auth.

**Phase 1 §4 gap closed — Content Creator inventory:**
- `linkedin_posts`: **3,814 rows, 100% embedded**, `embedding vector(1536)` (`text-embedding-3-small`). Columns confirmed: `id uuid`, `post_text` (NOT NULL), `post_url`, `post_date`, `engagement_score numeric`, `quality_score numeric` (**0–100 scale**, avg 64), `content_types text[]`, `updated_at` (watermark). Quality histogram: ≥60→2,357, ≥70→1,672, ≥80→1,000.
- RPCs: `match_linkedin_posts(...)`, `match_linkedin_posts_v2(query_embedding, match_count, filter_content_types[], min_engagement, min_quality)`. Edge fns present incl. `mes-context`, `rag-search`, `generate-content`, `ingest-posts`, `apify-webhook`, `classify-content` (all stay put). `kb_sync_source` view name is FREE.

**`mes-context` canary baseline (hard rule #8):** reads MES product tables ONLY via `MES_ANON_KEY` — `events`, `service_providers`, `innovation_ecosystem`, `trade_investment_agencies`, `content_items`/`content_company_profiles`/`content_bodies`, `user_reports`, `community_members`, `testimonials`, `countries`, `industry_sectors`. **Touches neither `ii_*` nor `mes_knowledge_base`** → both the Phase 2 `ii_*` drop and Phase 3 KB change are structurally invisible to it; canary stays green.

**Phase 3 APPLIED to `xhziwveaiuhzdoutpgrh`** (migrations `kb_extend_cross_project_linkedin_source` + `kb_linkedin_upsert_lock_anon_authenticated`):
- `source_project` column added; all 2,883 existing rows backfilled to `mes_platform` (0 cross-project). `kb_external_source_id()` + `upsert_kb_linkedin_post()` created.
- **Security fix:** Supabase default privileges had granted EXECUTE on the new SECURITY DEFINER `upsert_kb_linkedin_post` to `anon`+`authenticated` explicitly (a `revoke from public` doesn't remove those). Locked down → now `postgres, service_role` only.
- `get_advisors` security/performance: only pre-existing INFO/WARN lints (e.g. `rls_enabled_no_policy` on service-role-locked tables, `auth_rls_initplan`) — **nothing new** from Phase 3. `match_knowledge`/`generate-report` retrieval path unchanged (no column dropped/renamed).

**Phase 4 view finalized (staged):** `phase4-kb-sync/01-content-creator-view.sql` corrected to the verified schema + `quality_score >= 70` gate (0–100 scale). Next: build `kb-sync` edge function + backfill (1,672 posts) + incremental cron, then Phase 5 wiring.

## 14. Phase 4 COMPLETE — 2026-06-22

- **`kb_sync_source` view** created in Content Creator (`rcgaviwbsudouvfwzydq`), granted to anon, `quality_score >= 70` → 1,672 posts (all embedded).
- **`kb-sync` edge function** deployed to MES (`verify_jwt=false`, `x-internal-secret` guard). Set-based bulk upsert (`upsert_kb_linkedin_posts(jsonb)`) — the per-row version hit the 150s compute limit.
- **3 MES secrets** set by the user: `CONTENT_CREATOR_URL`, `CONTENT_CREATOR_ANON_KEY`, `KB_SYNC_SECRET` (also mirrored into Vault as `kb_sync_secret` for the cron).
- **Backfill:** pulled 1,672 / upserted 1,672 / failed 0. All `source_project='content_creator'`, `visibility='internal'`. **0 rows visible to public/anon** (freemium gate intact).
- **PII-scrub interaction (expected):** the `kb_scrub_pii` BEFORE trigger recomputes `content_hash` from scrubbed content, so ~12% of posts (those with PII) land "stale" and the embed-knowledge cron re-embeds them over the scrubbed text — correct & self-healing (stale drained 206→6→0). PII-free posts keep their copied embedding (zero cost).
- **Incremental cron** `kb-sync-incremental` scheduled every 3 days (`17 3 */3 * *`), reading the guard secret from Vault.
- Migrations recorded in-repo: `kb_sync_state`, `kb_bulk_upsert_linkedin_posts`, `kb_sync_incremental_cron` (+ reverts); function at `supabase/functions/kb-sync/`.

**Remaining: Phase 5** — wire `generate-report` to use `source_table='linkedin_post'` rows as synthesis-only signal (widen `allowed_visibility` to include `internal` for that retrieval), with the provenance guardrail in the system prompt (abstract/combine; never reproduce verbatim; never attribute quotes to named individuals).

## 15. Phase 5 — code complete, deploy pending — 2026-06-22

Edited `supabase/functions/generate-report/index.ts` (3 isolated, additive changes):
1. New `fetchLinkedInSignal(supabase, intake)` — a SEPARATE `match_knowledge` call with `filter={source_project:'content_creator'}` + `allowed_visibility=['internal']`, so ONLY LinkedIn rows return. Kept apart from `semanticMatches()` (public/member/paid) so internal rows never enter directory hydration. Returns up to 8 abstracted, truncated, unattributed snippets.
2. Computed once per report (best-effort; failure leaves reports unchanged) into `synthesisSignalNote`.
3. Appended `${synthesisSignalNote}` to every section's system prompt, behind a strict **provenance guardrail**: abstract/combine only; never reproduce verbatim/near-verbatim; never quote; never attribute to a named person/company/post; never cite. The polish pass needs no change (it never sees raw posts).

**Deploy blocked in this sandbox:** no Supabase CLI / Deno / access token, and `generate-report` is a 7-file / 109KB function — too large to safely hand-upload inline via the MCP `deploy_edge_function` (corrupt-deploy risk on a production function). **Deploy via the normal pipeline** (Lovable / CI) or `supabase functions deploy generate-report --project-ref xhziwveaiuhzdoutpgrh` from a machine with the access token. **Verify after deploy:** generate a sample report; confirm it draws on the signal and reproduces nothing verbatim / attributes no quotes.
