# Intelligence Layer — Baseline Audit (Sub-ticket 1, Phase 0)

> **Status: DRAFT — read-only audit. No code, migrations, or writes performed.**
> Branch: `claude/mes-intelligence-content-studio-g6knk8` (harness-assigned; maps to the
> intended `mes-<id>-intelligence-sync`). Author: intelligence-layer sub-ticket 1.
> Verified live against both Supabase projects on 2026-07-18.
> Zero writes to `rcgaviwbsudouvfwzydq` (Content Studio) — SELECT-only throughout.

## 0. TL;DR — what the live systems actually show

The parent-prompt "SHARED CONTEXT" is partly stale. Five findings change the plan:

1. **`generate-report` ALREADY does knowledge retrieval.** The prompt says "generate-report has no
   knowledge retrieval; market context is Perplexity only." False. `generate-report/index.ts` has
   **two** live `match_knowledge` paths: `semanticMatches()` (directory hydration, visibility
   public/member/paid, L1829) and `fetchLinkedInSignal()` (internal LinkedIn synthesis-only signal,
   L1896). Sub-ticket 3's "report integration" is therefore an **extension of an existing
   retrieval surface**, not a greenfield build.

2. **The LinkedIn sync is NOT broken, and NOT "stale since 2026-06-22".** kb-sync is fully current.
   The real stall is **upstream in Content Studio**: the `linkedin_posts` corpus is frozen at
   **2026-02-15** (max `post_date` AND max `updated_at`). kb-sync's last cron run (2026-07-16)
   pulled **0 rows** because there is nothing new to pull. See §3.

3. **A real, live confidentiality leak exists in `match_knowledge`.** An anonymous PostgREST caller
   can retrieve all 1,672 `internal` LinkedIn rows by calling the RPC directly with
   `allowed_visibility := ['internal']`. Proven live (§5). This is the security clamp Sub-ticket 1
   anticipated — and it should ship first.

4. **Events ARE in the KB** (340 event rows, `entity_type='event'`). The prompt's "Events not
   chunked into the KB (known 20% blind spot)" is stale for *directory* events. What is genuinely
   absent: the Content Studio **document library** (17 PDFs / 1,918 chunks), `research_cache`,
   `youtube_videos`, `reddit_threads` — none are synced. That is the true Sub-ticket 1B gap.

5. **The three onboarding docs the parent prompt references don't exist**
   (`MARKET_ENTRY_SECRETS_EXPLAINER.md`, `CLAUDE_PROJECT_PRIMER.md`, `MES_QUICK_CONTEXT.md`).
   The canonical deep doc is `docs/mes-knowledge-base-rag.md`. Sub-ticket 4's doc plan must retarget.

---

## 1. Git archaeology

Repo history is a squash-flattened Lovable import: every KB-layer file first appears in commit
`78f6007` (2026-07-15, PR #442). The real build chronology therefore lives in **migration
timestamps**, not commits.

**KB build chronology (from `supabase/migrations_archive/`, applied to prod pre-baseline):**

| Timestamp | Phase | What it did |
|-----------|-------|-------------|
| 2026-06-14 09:00 | Phase 2 | Created `mes_knowledge_base` + `knowledge_embed_log` + indexes + RLS lockdown |
| 2026-06-14 09:01 | Phase 3 | `service_providers` sync pilot (PII-stripped upsert fn + trigger + `kb_sync_all`) |
| 2026-06-14 09:02 | Phase 4a/4b | Embedding pipeline helpers; **scheduled `embed-knowledge` cron `*/2 * * * *`** |
| 2026-06-14 09:03 | Phase 5 | **Created `match_knowledge` RPC** (SECURITY DEFINER; hybrid vector+FTS+trigram) |
| 2026-06-14 09:10–09:20 | Phase 6/6b/6c | Fan-out to 8 structured entities; PII-scrub guard; `content_items` chunking |
| 2026-06-21 06:00–06:04 | KB cross-project | Extended KB for cross-project LinkedIn; `kb_sync_state` watermark; bulk upsert; **scheduled `kb-sync-incremental` cron `17 3 */3 * *`** |
| 2026-07-04 09:55 | Baseline squash | `20260704095538_remote_baseline.sql` snapshots prod; `kb_phase*` moved to archive |

**Post-baseline KB-relevant commits:** `1563996` (#478, AUD-030 — rate-limit/input-cap
`knowledge-search`), `2530d0d` (#484 — fail-closed rate limiting + proxy-header IP). The two
sector-tag backfills (#442, #445) re-fire KB triggers but don't change the layer.

**Live cron confirmation (MES `cron.job`):** both jobs **active** — `embed-knowledge` `*/2 * * * *`,
`kb-sync-incremental` `17 3 */3 * *`. (The baseline pg_dump doesn't re-declare these; they live only
in the DB + archived cron migrations. Now verified live.)

---

## 2. How the three edge functions actually work

- **`kb-sync/index.ts`** — reads Content Studio's restricted `kb_sync_source` view (anon key), pulls
  qualifying LinkedIn posts, bulk-upserts to MES `mes_knowledge_base` via `upsert_kb_linkedin_posts`.
  Embeddings are **copied, not regenerated** (`embedded_hash=content_hash`, zero embed cost).
  Watermark on `kb_sync_state.last_synced_at`. Auth: `x-internal-secret == KB_SYNC_SECRET`.
  Modes: `incremental` (watermark) / `backfill` (offset paging). **Only source it handles today:
  `content_creator_linkedin`.**
- **`embed-knowledge/index.ts`** — drains stale rows (`embedding null OR embedded_hash != content_hash`),
  embeds `content` via OpenAI `text-embedding-3-small`, hard cap 100/run, logs to `knowledge_embed_log`.
  Cron `*/2 min`. Auth: Vault-backed `x-internal-secret` (`kb_check_secret`).
- **`knowledge-search/index.ts`** — anonymous agent/MCP entry point (`verify_jwt=false`). Embeds the
  query, calls `match_knowledge` **with the service-role client**, derives `allowed_visibility` from
  caller auth (anon→`public`; bearer→`+member`; paid tier→`+paid`). Rate-limited + input-capped +
  fail-closed (AUD-030). **This clamp is correct — but bypassable, see §5.**

### `kb_sync_source` view (Content Studio, read-only)
```sql
SELECT id::text AS source_ref, post_text AS content, NULL::text AS title, embedding, post_url,
       post_date, engagement_score, quality_score, content_types,
       COALESCE(updated_at, post_date) AS synced_at
FROM linkedin_posts
WHERE embedding IS NOT NULL AND quality_score >= 70;
```
The `quality_score >= 70` gate is **source-side, in the view** — kb-sync inherits it and cannot see
sub-70 posts at all.

---

## 3. Data baseline (both projects, 2026-07-18)

### Content Studio `rcgaviwbsudouvfwzydq` (READ ONLY)
| Table | Rows |
|-------|------|
| `source_documents` | 17 |
| `document_chunks` | 1,918 |
| `research_cache` | 3 |
| `youtube_videos` | 2 |
| `reddit_threads` | 1 |
| `call_recordings` | 0 (future proprietary lane) |
| `podcast_episodes` | 0 (future proprietary lane) |
| `linkedin_posts` | 3,814 total · **1,672 at quality≥70, all embedded** · 0 qualifying rows missing embeddings |

### LinkedIn stall diagnosis (the real root cause)
| Signal | Value |
|--------|-------|
| `kb_sync_source` rows (qualifying) | 1,672 |
| view max `synced_at` | **2026-02-15 21:53** |
| `linkedin_posts` max `post_date` | **2026-02-15 09:28** |
| `linkedin_posts` max `updated_at` | **2026-02-15 21:53** |
| MES `kb_sync_state.last_synced_at` | 2026-02-15 21:53 (== view max; fully caught up) |
| MES `kb_sync_state.last_run_at` | 2026-07-16 03:17 (cron ran; on schedule) |
| MES `kb_sync_state.last_rows_synced` | **0** (nothing new upstream) |

**Conclusion:** kb-sync mirrors a frozen source. The Content Studio LinkedIn ingest (Apify scrape →
embedding) stopped writing `linkedin_posts` in mid-February 2026. The other 2,142 posts are
quality<70 and excluded **by design**. Because Content Studio is read-only for us, the upstream
ingest cannot be fixed from this thread — it is a **companion Content Studio ticket**, not
Sub-ticket 1 code. Sub-ticket 1's "fix the LinkedIn sync" is therefore reframed (§8).

### MES KB `xhziwveaiuhzdoutpgrh` — composition (5,405 rows, 100% embedded, 0 stale)
By visibility: `public` 3,169 · `internal` 1,672 (all LinkedIn) · `member` 499 (investors) · `paid` 65 (lead_databases).
By source_table: content_items 2,117 · linkedin_post 1,672 · investors 499 · events **340** · innovation_ecosystem 217 · trade_investment_agencies 148 · community_members 132 · service_providers 113 · country_faqs 94 · lead_databases 65 · countries 8.
**Not present: any Content Studio `document_chunk`/`source_document`, `research_cache`, `youtube_video`, `reddit_thread`.** ← Sub-ticket 1B target.

---

## 4. `embed-knowledge` confirmation
Stale-hash trigger + per-run cap both verified: `kb_stale_rows(p_limit)` selects
`embedding null OR embedded_hash != content_hash`; `HARD_CAP=100`. Queue currently drained
(kb_stale = 0). Working as documented.

---

## 5. SECURITY FINDING — `match_knowledge` visibility bypass (live, confirmed)

**`match_knowledge` trusts its `allowed_visibility` argument and never re-derives visibility from the
caller.** It is `SECURITY DEFINER` (reads the table as owner, bypassing RLS) and granted `EXECUTE`
to `anon` + `authenticated`. The `knowledge-search` clamp (anon→`public`) is defence only on *that*
path; the RPC is directly reachable via PostgREST `/rest/v1/rpc/match_knowledge`.

**Proof (run live as role `anon`):**
```
set role anon;
-- match_knowledge(<any vector>, 'market entry australia lawyer distribution', 1000, -1, '{}', array['internal'])
--   → anon_internal_rows = 1000 (capped; full internal set = 1,672)
--   → anon_public_rows   = 1000
```
An anonymous caller retrieves the full `internal` LinkedIn corpus (raw `post_text`), which the design
intends as synthesis-only, never surfaced. Same mechanism would expose `member`/`paid` rows.

**Caller inventory (who legitimately calls the RPC):**
- `knowledge-search` edge fn → **service-role client** (not anon/authenticated).
- `generate-report` (`semanticMatches`, `fetchLinkedInSignal`) → **service-role**.
- `src/**` → **no client-side `match_knowledge` call** (only the generated `types.ts` entry).

⇒ **No legitimate caller relies on the anon/authenticated grant.** The minimal, reversible clamp is
to **revoke `EXECUTE` on `match_knowledge` from `anon` and `authenticated`**. Optional
defence-in-depth: intersect `allowed_visibility` with a caller-derived ceiling inside the function.

Related prior flag: `docs/prelaunch-audit.md` AUD-060 suspected this ("verify `match_knowledge`
visibility default"). The *default* (`['public']`) is safe; the *bypass via explicit argument* is the
un-closed hole. This audit confirms it as live.

---

## 6. Docs inventory (feeds Sub-ticket 4)
- `docs/mes-knowledge-base-rag.md` — **high accuracy**, current for table shape, RPC signature,
  score weights (`0.6·cos + 0.25·ts_rank + 0.15·trigram`), visibility model, cost caps. Soft spots:
  states cron cadences as fact (they're DB-resident — now verified §1), and doesn't document the
  cross-project LinkedIn source in its entity table.
- `CLAUDE.md` §5/§6/§12 KB claims — accurate.
- Skills `secrets-and-env-management`, `content-freshness-and-seo-ops-loop`,
  `edge-functions-and-cost-controls`, `supabase-rls-and-migrations` — accurate KB references.
- **Missing docs:** Content Studio table/view shapes; the "LinkedIn-only" sync coverage boundary;
  a reconciled statement of the cron schedules; the `upsert_kb_*` trigger template; the three
  phantom onboarding files.

---

## 7. Eval baseline (frozen golden set) — DEFINED, generation pending approval

Generating 5 full reports spends real API budget (Perplexity/Firecrawl/LLM) and writes
`user_intake_forms`/`user_reports` rows to **prod**. Per the gate, the golden set is **specified
here** and generation is the **first approved implement step** (not run during read-only Phase 0).

Frozen intakes → `docs/audits/eval-baseline/` (with `report_json`, metadata, and
`knowledge_insights_matched`/`chunks_matched` telemetry) as the before-picture:

1. **Strong** — UK fintech → AU (well-covered corridor).
2. **Medium** — US SaaS → AU.
3. **Weak** — Japan healthtech → AU (expect honest gating).
4. **Local** — AU local startup (no international corridor).
5. **Focus-heavy** — a `report_focus`-driven intake (e.g. distribution partnerships).

Each captured twice in Sub-ticket 3 (layer OFF vs ON) via the kill switch to prove additivity.

---

## 8. Plan deltas vs the parent prompt (Sub-ticket 1)

| Prompt assumption | Reality | Plan change |
|-------------------|---------|-------------|
| generate-report has no retrieval | It has `semanticMatches` + `fetchLinkedInSignal` | ST-3 = extend existing surface |
| LinkedIn "stale since 2026-06-22, root cause unknown" | Source frozen 2026-02-15; kb-sync fully caught up (0 new) | ST-1C: no kb-sync bug to fix. Raise a **companion Content Studio ticket** for the upstream ingest. Quality gate already exists (`quality_score≥70`, source-side) |
| Events a 20% KB blind spot | 340 events in KB; hydrated by generate-report | Drop "chunk events into KB" as ST-1 work (already covered) |
| Sync covers linkedin only (accurate) | Confirmed; docs/research_cache/yt/reddit absent | ST-1B stands: add handlers for `document_chunk` (JOIN `source_documents`), `research_cache`, `youtube_video`, `reddit_thread`, + `call_recording`/`podcast_episode` (skip until populated + consent) |
| Extend/refit onboarding MD files | They don't exist | ST-4 retargets `docs/mes-knowledge-base-rag.md` + `CLAUDE.md` + new `docs/intelligence-layer.md` |
| Security clamp "if audit found a leak" | Leak confirmed live | ST-1A ships FIRST: revoke anon/authenticated EXECUTE on `match_knowledge` (+ optional in-fn clamp) |

### Proposed Sub-ticket 1 implementation order (post-approval)
- **A. Security clamp (first).** Reversible migration: `REVOKE EXECUTE ON match_knowledge FROM anon,
  authenticated;` Down migration re-grants. Verify with the anon-role probe that `internal`/`member`/
  `paid` are unreachable and that `knowledge-search`/`generate-report` (service-role) still work.
  → This is an **RLS/grant change = approval-gated**. Stop for sign-off.
- **B. kb-sync extension.** New source handlers (document_chunk via `source_documents` JOIN,
  research_cache, youtube_video, reddit_thread; call_recording/podcast_episode guarded by
  `consent_confirmed` + empty today). Metadata resolution: source-side columns → seed map for the 17
  files → Haiku fallback (batch, cached, dry-run-able) → null (never guessed). Watermark on
  `updated_at` (fallback `created_at`); weekly full-ID reconciliation as a `mode` param. New MES
  objects only (upsert RPC + `kb_sync_state` rows); **zero writes to Content Studio**.
- **C. LinkedIn.** No kb-sync bug. File the companion Content Studio ingest ticket; keep the existing
  source-side quality gate. (Optionally expose the gate threshold as config for when the corpus thaws.)
- **D. Backfill + verify** embed drain to 100%, counts reconcile with source.

**Approval-gated items in this sub-ticket:** the `match_knowledge` grant change (A) and any new RLS/
grants on the new upsert path (B). Per workflow rules, these stop for sign-off before code.
