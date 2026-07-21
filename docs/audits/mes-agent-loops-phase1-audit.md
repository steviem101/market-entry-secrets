# MES Agent Loops: Phase 1 Read-Only Audit

> Branch: `claude/mes-agent-loops-audit-3qk45r` · Date: 2026-07-20 · Scope: MES Platform `xhziwveaiuhzdoutpgrh` (writable) + Content Creator `rcgaviwbsudouvfwzydq` (read-only)
> Read-only: no writes, deploys, or migrations were performed. `mes-context` canary run before this audit (baseline recorded, GREEN).

## 0. Canary baseline (recorded)

`mes-context` (Content Creator edge fn `rcgaviwbsudouvfwzydq`, v15, reads MES Platform REST with `MES_ANON_KEY`) invoked with a fintech query: returned 24 items across all categories, 7508-char summary. **GREEN.** Reference for the Phase 3 re-checks.

## 1. Headline

The "self-improving agent loops" this ticket sets out to build **already exist in substantial, partial form.** MES has a working control plane (`automation_runs` run ledger + 8 per-loop staging/proposal tables + `activity_events`/`activity_event_routing` Slack routing + `rq-slack-actions` apply endpoint) and three live directory loops (steward, demand-mining, directory-discovery) plus report-quality and knowledge loops. What is genuinely missing is (a) a **unified proposals abstraction**, (b) an **admin dashboard** (no loop surface exists in the app at all), (c) **observability on several loops whose Slack routing is disabled**, and (d) a **single `apply-proposal` choke point** (apply logic is today split and Slack-signing-gated).

This materially changes Phase 2: the plan should **reconcile and extend**, not create `agent_runs`/`agent_proposals` from scratch.

## 2. Loop inventory

Trigger source: `cron.job` (pg_cron via pg_net) unless noted. Run history from `cron.job_run_details` (30d) and `automation_runs`.

| Loop | Trigger / cadence | Reads | Writes | Notifies | Last success | Status |
|---|---|---|---|---|---|---|
| **directory-steward** | cron j16, every 6h `15 */6 * * *` | directory tables (svc/mentors/agencies/ecosystem/investors) | `directory_steward_staging` (field-change proposals) + **direct** `last_verified`/`data_health` on prod rows; `automation_runs` | Slack `C0BB2PH60K0` via routing `directory.steward` (enabled) + direct chat.postMessage | 2026-07-20 18:15 | **healthy, observed** (32 runs, 73 proposals, gated by `DIRECTORY_STEWARD_ENABLED`) |
| **demand-mining** | cron j17, weekly `30 2 * * 1` | reports/search demand vs directory supply | `directory_demand_signals` | routing `directory.demand` **enabled=false** | 2026-07-20 02:30 (1 run) | **running but unobserved** — routing off; 0 signals produced; no `automation_runs` row seen |
| **directory-discovery** | cron j18, weekly `30 3 * * 1` | demand signals + Firecrawl search | `directory_discovery_staging` | routing `directory.discovery` **enabled=false** | 2026-07-20 03:30 (1 run) | **running but unobserved** — routing off; 0 candidates; no `automation_runs` row seen |
| **report-quality-loop** | cron j11, weekly `0 9 * * 2` | `user_reports`, rubric | `report_quality_proposals`, `automation_runs` | routing `report.quality.loop` (enabled), `C0BB2PH60K0` | 2026-07-14 09:00 | **healthy, observed** (5 runs, 112 proposals) |
| **report-quality-rollup** | cron j9, weekly `0 9 * * 1` | `report_quality` telemetry | Slack rollup | `report.quality` (enabled) | 2026-07-20 09:00 | **healthy** |
| **prompt-ab-rollup** | fn `prompt-ab-rollup` (no cron found) | report_quality A/B | `prompt_ab_proposals` (0 rows) | routing `prompt.ab.rollup` **enabled=false** | — | **orphaned/unobserved** — no scheduler, routing off, never produced a row |
| **distill-knowledge** | fn, **no cron** (manual/`force`, gated `DISTILL_KNOWLEDGE_ENABLED`) | `knowledge_chunk` (embedded) | `knowledge_insight` KB rows, `knowledge_distill_log`, `automation_runs` | none dedicated | 2026-07-19 08:16 | **active but un-scheduled** (45 runs, 1006 proposed, 925 auto-accepted) — a live loop with no visible trigger |
| **embed-knowledge** | cron j5, every 2 min | `mes_knowledge_base` stale rows | KB embeddings, `knowledge_embed_log` | none | 2026-07-20 21:08 | **healthy** (21,599 runs, 0 fail) |
| **kb-sync (incremental/reconcile)** | cron j10 `17 3 */3 * *`, j22 `47 4 * * 0` | Content Creator view (anon) | `mes_knowledge_base` | none | 2026-07-19 | **healthy** |
| **doc-freshness** | **GitHub Action** `0 8 * * 1` (Mon 08:00) | repo files (CLAUDE.md, skills, functions) | job summary + optional Slack webhook; `doc_freshness_proposals` **(table not yet created)** | Slack webhook (if secret set) | scheduled | **advisory loop, no DB state yet** |
| **golden-eval** | GitHub Action (dispatch + report-pipeline PRs) | frozen intakes → generate-report | `eval_runs` | job summary | on demand | **eval harness, not a cron loop** |
| slack-activity-digest | cron j6, hourly | `activity_events` | Slack digest | slack-notify | 2026-07-20 21:00 | healthy (infra) |
| detect-funnel-gate-hits, reap-stuck-reports, stripe-webhook-reconcile, cleanup-rate-limits, roll-forward-month-precision-events, country-links-orphan-sweep, firecrawl-scrape-cache-purge, process-email-queue | crons j3/4/7/12/13/14/15/19 | — | maintenance | varies | recent | healthy maintenance jobs (not agent loops) |

**Orphaned / undocumented functions (deployed, not in repo):** `apify-webhook` (v42), `notion-research-trigger` (v39). Neither is in `supabase/functions/`. `apify-webhook` is likely the Apify events ingest entrypoint; `notion-research-trigger` purpose unknown. Both bypass the repo/CI deploy path.

## 3. Existing control-plane infrastructure (found — do not recreate)

- **`automation_runs`** = the run ledger the ticket calls `agent_runs`. Columns: `id, loop, started_at, finished_at, status, reviewed, proposed, accepted, tokens_used, cost jsonb, error, metadata jsonb, created_at`. Already written by 3 loops (directory-steward, distill-knowledge, report-quality-loop). Richer than the proposed schema (has cost/token attribution). Uses `loop` not `loop_name`.
- **Per-loop staging/proposal tables (8):** `directory_steward_staging` (change_class, field_diffs, computed_health, status new/approved/dismissed, applied_at), `directory_discovery_staging` (candidate_*, status, imported_at), `directory_demand_signals` (gap_score, status), `report_quality_proposals` (category, status new/shipped/accepted, reviewed_by), `prompt_ab_proposals` (verdict, status), `ecosystem_import_candidates` (proposed_action/payload, status applied/pending/rejected/duplicate, applied_at), `innovation_ecosystem_enrichment_staging`, `trade_agencies_enrichment_staging`. Plus `events_staging` (raw/processed). **Each has its own status vocabulary and shape — there is no unified `agent_proposals`.**
- **Notification layer:** `activity_events` (event log, dedup_key, notified_at, slack_ts, dispatch_attempts) + `activity_event_routing` (event_type → channel_id, severity, enabled). Emitted by the `dispatch_activity_event()` DB trigger → `slack-notify`. Hourly `slack-activity-digest` cron already exists.
- **Apply path:** `rq-slack-actions` (Slack-signing-gated) handles Approve/Dismiss for `report_quality_proposals` **and** `directory_steward_staging`. There is **no general admin/HTTP apply endpoint** and **no single `apply-proposal` choke point.**
- **RLS:** every control-plane table is `admin`-read (`has_role(auth.uid(),'admin')`), service-role-write; `report_quality_proposals` and `ecosystem_import_candidates` additionally allow admin UPDATE. This matches the ticket's proposed RLS exactly.
- **Admin UI:** only `/admin/submissions` and `/admin/mentors` exist. **No loop/proposals dashboard exists** — the staging tables appear in `types.ts` only, with zero frontend surface. This is the largest genuine gap.

## 4. Gaps & risks (highest priority first)

1. **Loops that act invisibly.** `demand-mining`, `directory-discovery`, `prompt-ab-rollup` have their `activity_event_routing` rows **disabled**, so they run with no Slack signal. demand-mining/directory-discovery also appear to write **no `automation_runs` row** (not in the ledger), so they have no observability at all. Highest audit priority per 1.4.
2. **No admin backstop.** With no dashboard, every proposal is reviewable only via Slack buttons or raw SQL. A missed Slack message = a stranded proposal (e.g. 18 `new` steward rows, 63 `pending` ecosystem candidates sitting unreviewed).
3. **`distill-knowledge` runs off-schedule and auto-accepts at scale** (925 auto-accepts) with no cron and no dedicated notification — an active writer to the KB with weak observability.
4. **Apply is not a single choke point.** `rq-slack-actions` is Slack-signing-gated (not usable by a dashboard as-is); ecosystem/enrichment tables have their own apply history. The ticket's "single `apply-proposal`" invariant is currently violated in spirit.
5. **directory-steward writes directly to prod** (`last_verified`, `data_health`) — health telemetry only, not curated fields, but it is a loop writing production outside a proposal. Worth an explicit carve-out in the "loops propose, never act" rule.
6. **Orphaned functions** `apify-webhook`, `notion-research-trigger` are deployed but not in the repo/CI path — untracked surface area.
7. **Heterogeneous proposal schemas** make a single dashboard/apply layer hard without either a unifying view or a new table.

## 5. Content freshness baseline

- **Events:** 340 approved, 38 needs_review, 28 rejected. **Past-dated but still live: 107 `approved` + 36 `needs_review`** (the `archive_event` target). (Note: `roll_forward_month_precision_events` and a sitemap event-date gap are known.)
- **Directory completeness / staleness (updated_at 90d+):**
  | Table | Total | No website | Thin desc (<40) | No logo/photo | Stale 90d |
  |---|---|---|---|---|---|
  | service_providers | 113 | 0 | 0 | 26 | 0 |
  | community_members | 134 | 2 | 0 | 10 | 0 |
  | investors | 499 | **197** | 1 | **411** | 32 |
  | trade_investment_agencies | 149 | 1 | 0 | **147** | 0 |
  | innovation_ecosystem | 217 | 1 | 1 | **137** | 0 |
  (`updated_at` is an unreliable staleness signal — bulk migrations touch it; `last_verified` is the better basis, and it is what directory-steward already stamps.)
- **KB (`mes_knowledge_base`):** 8318 rows; embed backlog `embedded_hash != content_hash` = **32** (= null-embedding count; drained by the 2-min `embed-knowledge` cron — healthy); **orphans = 0** across all source tables.
- **Content items:** 196 total; stale 180d = 0; old year-ref in title = 1.
- **Dead-link sample (20 service_providers, HEAD):** 19/20 reachable; the 1 "failure" was HTTP 415 (HEAD not allowed — false positive). Confirms the design's insight: HEAD-only checks produce false positives; a GET fallback + the "2 consecutive weekly failures" rule are both warranted.

## 6. Recommendation

**Reconcile and extend the existing control plane; do not create `agent_runs`/`agent_proposals` fresh.**

- **Runs:** adopt `automation_runs` as the run ledger (map ticket `loop_name`→`loop`; it already carries cost/token columns the ticket omits). Backfill demand-mining/directory-discovery to write it.
- **Proposals:** the open design decision for Phase 2 — either (a) introduce **one** `agent_proposals` table and migrate the loops onto it over time (cleanest for the dashboard/apply choke point, biggest migration), or (b) build a **read `agent_proposals` view** unioning the existing staging tables (fast, non-destructive) plus a thin `apply-proposal` dispatcher that writes back to each source table. Recommend **(b) as the pilot** (matches "extend over duplicate"), with (a) as an optional later consolidation.
- **Apply choke point:** build the new `apply-proposal` edge function as the single writer, and refactor `rq-slack-actions` to call it, so Slack and the dashboard share one path (the ticket already wants this via `agent-actions`).
- **Dashboard:** genuinely new — build `/admin/agents` hooks/data-layer (CC) + page shell (Lovable handoff). Surface `automation_runs` + the unified proposals view.
- **Notifications:** flip on the disabled routing rows (or supersede with the ticket's `#mes-agents-*` channels) and add a daily digest; the hourly `slack-activity-digest` already exists to extend.
- **Content refresh loop:** net-new `loop-content-refresh`, but its `archive_event`, `flag_dead_link`, logo, and KB checks should write through the unified proposals layer, and its dead-link check must respect the 2-failure rule the sample validates.

## 7. Conflicts with Phase 2 design assumptions

| Phase 2 assumption | Reality | Action |
|---|---|---|
| Create `agent_runs` | `automation_runs` already exists, used by 3 loops | Extend/alias, don't create |
| Create `agent_proposals` (single) | 8 heterogeneous per-loop tables, no unified one | Decide table-vs-view in Plan |
| `apply-proposal` is the only writer | `rq-slack-actions` + per-table applies exist | Consolidate onto new choke point |
| Loops propose, never act | directory-steward writes `last_verified`/`data_health` to prod | Carve out health-telemetry writes explicitly |
| Route to `#mes-agents-digest/-alerts/-prs` | Existing channels: `C0BB2PH60K0` (agents), `C0BACH1NR2S` (alerts), `C0BAJ7ZD6VA` (info) | Reuse existing or create new deliberately |
| `industry_sectors` canonical match | canonical sector layer confirmed present | OK |
| Cron adds a weekly schedule | pg_cron schedules live in DB, unversioned | Document schedule in migration/runbook |

## HARD STOP — awaiting approval before Phase 2 (Plan).
