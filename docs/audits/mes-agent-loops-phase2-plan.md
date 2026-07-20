# MES Agent Loops: Phase 2 Plan (reconciled against Phase 1 audit)

> Branch: `claude/mes-agent-loops-audit-3qk45r` · Date: 2026-07-20 · Requires explicit approval before Phase 3.
> Reconciles the ticket design against the audit: `docs/audits/mes-agent-loops-phase1-audit.md`.
> Decisions carried in: proposals-model = **present both, recommend, choose in this plan**; Slack = **new `#mes-agents-*` channels**.

## 2.1 Control plane (reconcile, do not recreate)

### Runs — adopt `automation_runs`
`automation_runs` already is the run ledger (used by 3 loops; carries `cost`/`tokens_used` the ticket omits). Do **not** create `agent_runs`.
- Standardise on existing column `loop` (the dashboard/API alias it to `loop_name`).
- **Backfill coverage:** `demand-mining` and `directory-discovery` currently write no run row — add an `automation_runs` insert/update to both (Workstream B/A) so every loop is ledgered.
- New `loop-content-refresh` writes one `automation_runs` row per run (`items_scanned`→`metadata`, `proposed`, `accepted`).

### Proposals — two options (recommendation: Option A)

**Option A — unified read-view + dispatcher (RECOMMENDED, non-destructive):**
- New SQL **view** `agent_proposals` unioning the 8 existing staging tables into one projection:
  `proposal_key text` (`'<source_table>:'||id`), `run_id`, `loop_name`, `action_type`, `target_table`, `target_id`, `payload jsonb`, `reason`, `confidence`, `status` (normalised to `pending|approved|rejected|auto_approved|applied|apply_failed` via a per-table CASE), `reviewed_by`, `reviewed_at`, `applied_at`, `apply_error`, `created_at`.
- New `agent_content_proposals` **table** (real, for the content-refresh loop, matching the canonical shape) folded into the same view.
- `apply-proposal` edge fn is the single writer: resolves `proposal_key` → source table, validates `action_type` vs whitelist, applies COALESCE-protected upsert, stamps `applied_at`/`status` on the source row.
- **Pros:** zero migration of live loops, fastest, matches "extend over duplicate", dashboard/apply get one contract immediately. **Cons:** view union must be maintained as loops are added; heterogeneous payloads.

**Option B — new unified `agent_proposals` table + migrate loops:**
- Create the ticket's table; migrate each loop to write it; keep staging tables as raw evidence or drop over time.
- **Pros:** one clean physical model for dashboard/apply. **Cons:** touches every live loop (steward is healthy and in-prod), larger/destructive-adjacent migration, higher regression risk.

**Recommendation:** **Option A** for this ticket. It delivers the dashboard + choke point without disturbing working loops; Option B becomes an optional later consolidation ticket. Confirm A before Workstream A.

### RLS / grants (both options)
- `agent_content_proposals`: RLS on, admin-read (`has_role(auth.uid(),'admin')`), **service-role-write only**; the view inherits source-table RLS (all already admin-read). Indexes `(status, loop_name)` equivalent on the real table; `(run_id)`.
- No client writes anywhere — all mutations via edge functions.

### `apply-proposal` edge fn (Workstream A)
- Auth: `requireAdmin(req)` (JWT) **or** internal secret (for Slack path reuse).
- Input: single `proposal_key` or array (bulk). Whitelist of `action_type`. COALESCE-protected upserts for curated-field touches. Stamps `applied_at`; on failure sets status `apply_failed` + `apply_error`. Returns per-row `{key, ok, error}` (no silent drops).
- **Auto-approve whitelist (low-risk only):** `archive_event`, `set_logo_url`, `trigger_reembed`. Everything else stays `pending`.
- **Carve-out:** directory-steward's direct `last_verified`/`data_health` writes are health telemetry, not curated fields — documented as an allowed exception to "propose, never act".

## 2.2 Content refresh loop (`loop-content-refresh`)

Weekly pg_cron (schedule documented in the migration + a runbook, since cron lives in DB). Writes one `automation_runs` row + N `agent_content_proposals`. Gated by `CONTENT_REFRESH_ENABLED` (default off), batch cap default 50 (configurable via env).

| Check | action_type | Auto-approve | Notes |
|---|---|---|---|
| Past-dated events still `approved`/`needs_review` | `archive_event` | Yes | 107+36 rows today |
| Dead website (2 consecutive weekly GET failures) | `flag_dead_link` | No | GET (not HEAD) + failure counter table |
| Missing logo, domain resolves | `set_logo_url` | Yes | logo.dev pattern via `logoUtils` |
| 90d+ since `last_verified` + thin desc | `queue_enrichment` | No | Firecrawl scrape at proposal time, XML-delimited + length-capped |
| KB embed backlog > threshold | `trigger_reembed` | Yes | invoke embed-knowledge |
| KB orphan (source row gone) | `remove_kb_row` | No | 0 today, still wired |
| Stale content (180d+ / old year ref) | `flag_stale_content` | No | structural signal only |

- **Dead-link state:** new tiny table `content_link_checks (target_table, target_id, url, last_status, consecutive_failures, last_checked_at)` so the 2-failure rule survives across weekly runs. `flag_dead_link` proposed only when `consecutive_failures >= 2`.
- **Prompt-injection:** scraped free text wrapped in XML delimiters + length-capped before any LLM step; raw descriptions never unguarded into prompts.
- **Sector tags** in any payload exact-match canonical `industry_sectors` looked up at runtime.
- **Pilot:** ship with only `archive_event` enabled; verify proposals + digest; then enable checks one at a time with a manual run each.

## 2.3 Dashboard (`/admin/agents`)

**CC builds (this session):**
- `src/hooks/useAgentRuns.ts`, `src/hooks/useAgentProposals.ts` — filtered/paginated React Query (kebab-case keys, `(supabase as any)` for tables absent from generated types).
- `src/lib/api/agentApi.ts` — approve / reject / bulk approve / bulk reject / retry-apply; **all via edge functions**, never direct table writes.
- Edge fn `agent-actions` — admin-JWT endpoint that flips proposal status and invokes `apply-proposal`. **Same code path the Slack buttons hit.** Bulk cap 100; per-row result reporting.

**Lovable builds (handoff prompt → `.claude/prompts/lovable-agent-dashboard.md`, written in Workstream C, not executed here):** loop health grid, proposals queue (filter, expandable payload, checkbox + select-all-filtered bulk with confirm modal + partial-failure reporting), 30-day activity chart, empty/loading/error states, 390px mobile-first, HSL tokens, shadcn/ui. CC does **not** touch `src/pages/` or `src/components/ui/`.

## 2.4 Slack reconciliation (new `#mes-agents-*` channels)

- **Requires from you before Workstream D:** the channel IDs for `#mes-agents-digest`, `#mes-agents-alerts`, `#mes-agents-prs`. Add three `activity_event_routing` rows (or reuse the routing table's channel mapping) pointing loop events at them.
- Extend the existing hourly digest path into a **daily** `agent-notifier` rollup: runs, proposals created, pending count, deep link to `/admin/agents`. Routed to `#mes-agents-digest`.
- Per-proposal Block Kit only for non-auto-approved types; buttons hit `agent-actions` (shared path). Failures + 3× anomaly volume → `#mes-agents-alerts`.
- Also **enable the currently-disabled routing rows** (`directory.demand`, `directory.discovery`, `prompt.ab.rollup`) or supersede them by routing to the new channels — decided per-loop in D.
- State lives only in `agent_content_proposals` / source tables, so approve-in-Slack and approve-in-dashboard converge.

## Migration list (all additive; schema via PR flow only)
1. `agent_content_proposals` table + RLS + grants + indexes.
2. `content_link_checks` table + RLS + grants.
3. `agent_proposals` view (Option A) with per-table status normalisation.
4. `automation_runs` backfill wiring is code-only (no schema) — demand-mining/directory-discovery insert run rows.
5. New `activity_event_routing` rows for the `#mes-agents-*` channels (data migration, idempotent).
6. New pg_cron schedule for `loop-content-refresh` (documented).

## Function list (edge, deploy via Supabase CLI only)
- New: `apply-proposal`, `loop-content-refresh`, `agent-actions`, `agent-notifier` (or extend existing digest).
- Modified: `directory-discovery`, `demand-mining` (write `automation_runs`); `rq-slack-actions` (delegate apply to `apply-proposal`).

## Workstream order (approval gate between each)
- **A — Control plane:** migrations (view/tables/RLS), `apply-proposal` with whitelist + bulk, synthetic-proposal test, CLI deploy, `mes-context` canary. **Stop.**
- **B — Content refresh (pilot events-only):** `loop-content-refresh` archive_event only, weekly cron, one manual run, digest entry confirmed. **Stop, then enable checks one at a time.**
- **C — Dashboard data layer:** hooks + `agentApi` + `agent-actions`; write Lovable handoff prompt; verify bulk approve end-to-end on pilot proposals. **Stop.**
- **D — Slack:** `#mes-agents-*` wiring (needs channel IDs), Block Kit buttons → `agent-actions`, confirm Slack-click and dashboard-click resolve the same proposal; `mes-context` canary. **Stop: final summary, PR opened (never merged), full `mes-qa` verdict in the PR body.**

## Open decisions for approval
1. **Proposals model: Option A (recommended) or B?**
2. **Provide the 3 `#mes-agents-*` Slack channel IDs** (needed for D).
3. Confirm `CONTENT_REFRESH_ENABLED` staged-rollout (pilot events-only first) is acceptable.
