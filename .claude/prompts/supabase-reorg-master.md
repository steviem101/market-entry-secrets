# Master CC Prompt: Supabase Reorganization + Knowledge Base Integration
**Save to:** `~/market-entry-secrets/.claude/prompts/supabase-reorg-master.md`
**Mode:** Gated, multi-phase. Read-only first. Hard stops between phases. Do not skip gates.
**Run discipline:** This is the master spec. Execute each major phase in a **separate CC session** to avoid tool_use ID collisions on long threads. This file is the source of truth across all of them.

> Phase 1 audit completed 2026-06-21 → see `_audit-supabase-reorg.md`. Currently at **Hard Stop 1**.

---
## 1. Objective
Reorganize three Supabase workloads into a clean structure, extract a misplaced business out of the production database, and make the MES content corpus queryable by the MES report creator. **Without merging any databases.**
### Target architecture (final state)
| Org (one Supabase account owns all) | Project | Ref | Role |
|---|---|---|---|
| **MES** | MES Platform | `xhziwveaiuhzdoutpgrh` | Customer-facing product (service providers, events, mentors, leads, reports) |
| **MES** | Content Creator | `rcgaviwbsudouvfwzydq` | Internal marketing tooling (LinkedIn scrape, RAG, content gen) |
| **Irish Insights** | Irish Insights | *(new, created in Phase 2)* | Separate business: `ii_*` newsletter orchestration extracted out of MES Platform |
**Result:** 3 projects, 2 orgs, 1 account. MES Platform and Content Creator stay as **two separate databases in one org** (Claude orchestrates across both in one session; no schema merge). Irish Insights is fully separated for billing and future spin-off.

---
## 2. Hard rules (do not violate)
1. **DO NOT MERGE Content Creator into MES Platform.** This was explicitly decided against. Content Creator stays a separate project. Its edge functions and tables do not move. If you find yourself planning a merge, stop.
2. **Three projects, never conflated.** Every write is scoped to exactly one project ref. State the ref before any write. Cross-project writes happen only via the explicit sync defined in Phase 4.
3. **Audit before writing.** Phase 1 is read-only. No DDL, no writes, no deploys, no project creation until the Phase 1 plan is approved at the hard stop.
4. **Runtime schema discovery.** Never hardcode table or column names. Query `information_schema.columns`, `pg_constraint`, `pg_proc`, `cron.job` first. The inventories in this doc are *last-known*, not ground truth. Verify everything live.
5. **Reversible migrations.** Every migration ships with a tested down migration. No exceptions.
6. **COALESCE-protect curated data.** All upserts use `COALESCE(NULLIF(EXCLUDED.field, ''), target.field)` so manually curated values are never overwritten by empty incoming values.
7. **Freemium funnel preservation.** MES Platform RLS must keep the anonymous three-view gate intact. Use column-level grants or restricted views, never blanket auth requirements. Any RLS change is followed by the verification matrix (anon / authenticated / service role) and `get_advisors`.
8. **mes-context canary.** Content Creator's `mes-context` edge function reads MES Platform tables. Before and after any MES Platform change, run a canary call confirming `mes-context` still returns data. If it breaks, halt and report.
9. **MCP scoping discipline.**
   - Audits: org-scoped or project-scoped, **read-only mode**.
   - Writes: scope the MCP server to the **specific project ref** being modified (`project_ref` parameter). Never run a write unscoped.
10. **Cost gate.** Any action that incurs spend (new project creation, compute changes) requires `get_cost` then `confirm_cost`, then an explicit human approval before proceeding.
**Halt conditions (stop and report, do not improvise):** any cross-account access failure, any FK from `ii_*` into a non-`ii_*` MES table that cannot be cleanly severed, any name collision that blocks extraction, any RLS change that exposes data to the anon key, `mes-context` canary failure.

---
## 3. Human prerequisites (Supabase dashboard, not CC)
CC cannot create organizations or transfer projects between orgs. These are done by a human in the dashboard. CC will pause and request confirmation at the points where these are required.
| Action | Who | When | Notes |
|---|---|---|---|
| Confirm one account owns/administers all relevant orgs | Human | Before Phase 1 | If Content Creator currently sits under a separate login, consolidate admin access first. Phase 1 audit reports current placement so you know what is needed. |
| Create the **Irish Insights** organization | Human | Before Phase 2 | CC cannot create orgs. Paid plan on the new org if you want production guarantees. |
| Transfer **Content Creator** into the **MES** org (if not already there) | Human | Any time before relying on single-session orchestration | Dashboard project-transfer action. Requires owner access on both orgs and target org on a paid plan. Confirm conditions in-dashboard. Not required for the migrations themselves, only for one-session Claude orchestration. |
| Approve project creation cost | Human | Phase 2 gate | After CC runs `get_cost` / `confirm_cost`. |

---
## 4. Phase 1: Read-only audit (ALL reachable projects)
**Scope:** read-only. Goal: produce a findings report and a concrete migration plan, then STOP for approval.
Run and capture:
1. **Account/org/project map.** `list_organizations`, `list_projects`. Report which org each of the three projects currently lives in, and which transfers (if any) are needed to reach the target structure.
2. **Extension versions per project.** pgvector, pg_net, pg_cron, pg_trgm versions on MES Platform; what Irish Insights will need; Content Creator's pgvector version (must match or be <= target for embedding copy).
3. **Irish Insights (`ii_*`) inventory on MES Platform:** tables, row counts, columns, indexes; FK analysis (critical); functions/RPCs; `cron.job`; RLS; edge functions; external consumers.
4. **Content Creator inventory:** confirm `linkedin_posts` shape, embedding model, RPCs (`match_linkedin_posts`, `match_linkedin_posts_v2`), edge function set. Confirm they do not need to move (they do not).
5. **MES Platform report creator:** does it currently perform vector retrieval, or is it prompt/template-only? Identify the exact edge function. Determines whether Phase 5 adds or extends retrieval.
6. **`mes_knowledge_base` state:** exists already? Capture its schema so Phase 3 extends rather than recreates.
7. **Name-collision check** for cross-project read; confirm Phase 4 sync source view name is free.
8. **Baseline canary:** run a `mes-context` call and record the working result as the reference.
**Deliverable:** `~/market-entry-secrets/.claude/prompts/_audit-supabase-reorg.md` with findings, FK/entanglement verdict, and a step-by-step migration plan with explicit rollback for each step.
### HARD STOP 1 — do not proceed until the audit and plan are approved.

---
## 5. Phase 2: Extract Irish Insights into its own project
Pre-req: Irish Insights org exists (human). Pre-req: Phase 1 confirmed `ii_*` FK entanglement is clean or has a documented severing plan.
1. **Create the project**: `get_cost` → `confirm_cost` → **human approval** → `create_project`. Record the new ref.
2. **Enable extensions** to match `ii_*` needs (pgvector at matching version, plus pg_cron/pg_net/pg_trgm as required).
3. **Sever or duplicate** any `ii_*` ↔ MES reference data identified in Phase 1.
4. **Migrate schema then data** via `supabase db dump` / `pg_dump` (NOT MCP `execute_sql`): `--schema-only` for `ii_*`, then `--data-only`. Embeddings copy as-is. **Do not** dump/restore `auth`.
5. **Recreate** `cron.job`, RLS, indexes in the new project (verify they travel with the dump).
6. **Migrate edge functions** that operate on `ii_*` via `functions deploy` against the new ref; re-set secrets.
7. **Repoint consumers:** Irish Insights frontend env, Beehiiv automations, n8n/GitHub Actions reading `ii_*`.
8. **Verify (canary):** Irish Insights critical path end-to-end; row counts match; embeddings intact.
### HARD STOP 2 — verify Irish Insights runs fully on the new project before any destructive action on MES Platform.
9. **After approval:** drop `ii_*` from MES Platform (scoped to `xhziwveaiuhzdoutpgrh`) with a tested down migration; re-run `mes-context` canary; run `get_advisors`.

---
## 6. Phase 3: Build / extend `mes_knowledge_base` (MES Platform)
Scope writes to `xhziwveaiuhzdoutpgrh`. If `mes_knowledge_base` already exists, **extend it**; do not recreate. Polymorphic serving layer; `vector(1536)` `text-embedding-3-small`; HNSW cosine + FTS; `match_knowledge_base(query_embedding, source_types[], top_k, min_quality)` hybrid RPC; RLS service-role writes + freemium-gated reads; verification matrix + `get_advisors`; tested down migration; pilot on `service_providers` if building fresh.

---
## 7. Phase 4: Content Creator → `mes_knowledge_base` sync
The **only** sanctioned cross-project data movement. Embeddings copied, not regenerated. CC restricted read-only `kb_sync_source` view (quality-gated) granted to `anon`, read via CC anon key; secrets `CONTENT_CREATOR_URL` + `CONTENT_CREATOR_ANON_KEY` (never a service-role key cross-project); fall back to `SECURITY DEFINER` fn if not anon-safe (get approval). 4a one-time COALESCE-protected backfill; 4b scheduled incremental `kb-sync` edge fn via `pg_cron`+`pg_net` (~every 3 days, watermarked, logged).

---
## 8. Phase 5: Wire the report creator to `mes_knowledge_base`
Scope `xhziwveaiuhzdoutpgrh`. Extend existing retrieval (or add it) to include `mes_knowledge_base` sources per report context. **Provenance guardrail (required):** LinkedIn posts are synthesis signal only — abstract and combine, never reproduce verbatim, never attribute quotes to named individuals in paid output. Enforce in the report system prompt.

---
## 9–12 (rewiring map, verification matrix, rollback posture, execution order)
See the original master brief. Execution order: Human prereqs → Session A Phase 1 (Hard Stop 1) → Session B Phase 2 (Hard Stop 2, then drop + canary + advisors) → Session C Phase 3 → Session D Phase 4 → Session E Phase 5 → final verification (3 projects, 2 orgs, 1 account).
