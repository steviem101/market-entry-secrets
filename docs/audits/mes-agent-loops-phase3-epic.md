# MES Agent Loops — Phase 3 Epic: Self-Updating Directory (apply-on-approve + full-app enrichment)

> Status: **Approved plan, execution pending per-ticket gates** · Parent: MES-206 (control plane,
> dashboard, Slack layer — shipped) · Author: agent session (2026-07-23) · Owner: Stephen
>
> This is the canonical spec for the "system regularly updates itself" programme. It supersedes
> the chat-drafted plans v1–v4. Any session executing a ticket below MUST read this file first,
> plus `mes-ticket-workflow`, `supabase-rls-and-migrations`, `directory-data-enrichment`,
> `edge-functions-and-cost-controls`.

## 0. Product framing (why, who for)

MES sells **trust**: grounded, current, verifiable ANZ market-entry intelligence to
`international_entrant` and `local_startup` personas. Report matching runs on Postgres
array-overlap against `services[]`/`keywords[]` — **an unenriched row is invisible to the paid
report pipeline**. Enrichment is therefore not data hygiene; it is report quality, SEO surface,
and the moat against generic LLM research. Every ticket below is judged by: does it improve the
next paying customer's report, without risking the trust the directory embodies?

## 1. Non-negotiable invariants (all tickets)

1. **One writer.** All production mutation goes through `apply-proposal`. No second path, ever.
2. **Organisations only.** Automated enrichment NEVER targets people tables
   (`community_members`, contacts, mentors). Hard exclusion in the planner's table allowlist.
   Mentor data changes remain human via `/admin/mentors` (MES-208 anonymity model).
3. **Facts vs prose.** Field allowlist carries a class per field: `fact` (urls, tags, logos,
   years — auto-apply eligible after graduation) vs `prose` (descriptions, copy — human-reviewed
   forever, Australian English, house copy standards).
4. **New rows stay human.** Import/discovery approve = record-only, permanently.
5. **Failure lands visible.** Every planner failure → `skipped` (with reason) or `apply_failed`
   (+ Retry). Silent wrong writes are designed out via CAS / fill-empty / allowlists.
6. **Kill switches.** `AGENT_APPLY_SOURCES` (per-source apply), `AGENT_AUTO_APPLY_TYPES`
   (per-action-type graduation). Unset = today's behaviour. Disable requires no deploy.
7. **Evidence required.** No proposal applies without `source_url`/evidence. Taxonomy-bearing
   fields validate against the canonical sector layer (MES-110) at apply time — unknown tags are
   dropped-and-reported, never written.
8. **Agents open PRs, never merge. No auto-deploy. Schema via PR flow only.** (§10/§11.)
9. **Human gates (execution stops, listed per ticket):** PR merges; edge-function CLI deploys
   confirmed post-merge; flag/env enables; auto-approve graduations; anything touching
   RLS/destructive/payments (none planned — if discovered, HALT and re-plan).

## 2. Ticket sequence

Effort ≈ focused build time; elapsed time is dominated by deliberate soak windows.

### E0 — Demand-aimed coverage + KPI baseline *(read-only, no gate — may run immediately)*
- Introspect + measure field coverage (% populated) for report-critical fields
  (`website, description, services/keywords, sectors, logo`) across org directory tables.
- Read `directory_demand_signals` + recent `user_intake_forms` sectors/regions → ranked
  "demand-weighted gap list" (which table × field × corridor to enrich first).
- Baseline KPIs from `report_quality`: avg directory matches per section, % thin sections.
- Output: `docs/audits/mes-enrichment-coverage-baseline.md`. Exit: numbers exist, targets ranked.

### E1 — Apply-on-approve, safe tier *(1 PR · gates: merge, then supervised applies)*
- `apply-proposal`: per-source planners —
  `directory_steward_staging` (per-field CAS vs `field_diffs.before`, null/""-normalised),
  `innovation_ecosystem_enrichment_staging` + `trade_agencies_enrichment_staging`
  (fill-empty/COALESCE only). Field allowlist (fact/prose classes, org-tables only).
- Type-safe jsonb→column validation (mismatch → `apply_failed`, no cast guessing).
- Freshness re-check at apply time (stale approved rows skip, don't blind-fire).
- Flip `applyable: true` in `agentActions.ts` SOURCE_CONFIG + `agentProposalsMeta.ts` for the
  three sources; bulk (cap 100) inherits per-row results into the existing partial-failure panel.
- `AGENT_APPLY_SOURCES` switch; runbook update (incl. undo procedure from stored `before`s).
- **Read-only dry-run of the RMIT steward row posted for review BEFORE the PR opens.**
- Verify: unit tests on pure planners, `npm test`, tsc, build, full `mes-qa` in PR body.
- Exit: merged, functions CLI-deployed, `AGENT_APPLY_SOURCES=directory_steward_staging` enabled
  by owner, RMIT row applied live and verified.

### E2 — Supervised soak *(no build · gate: owner reads soak report)*
- First ~20 applies performed individually and verified against live rows.
- Observe one full weekly cycle end-to-end, incl. the FIRST `loop-content-refresh` production
  run (Sundays 04:00 UTC) and its auto-approved applies; agent self check-ins monitor and log.
- Output: soak report (apply/skip/fail counts, bug list). Exit: a clean supervised week, or
  bugs fixed and re-soaked. **Nothing later starts until E2 exits.**

### E3 — Queue hygiene + reject taxonomy *(1 small PR · gate: merge)*
- Auto-expiry: `pending` proposals older than 60 days → `rejected` with reason `stale_expired`
  (idempotent cron or piggyback on agent-notifier; additive migration only).
- One-click reject reasons on the dashboard (duplicate / bad data / out of scope / not
  relevant) stored on the row; surfaced in the daily digest; fed into loop prompt tuning.

### E4 — Graduation rails *(1 PR · gates: merge; graduations are separate owner decisions)*
- **Flood breaker**: >N (default 20) proposals of one action type in one run → auto-apply
  suspended for that batch, Slack alert, human review fallback.
- **Two-strike rule**: dead-link class auto-apply eligible only after failing checks on two
  runs ≥48h apart. **Daily auto-apply cap** (global).
- Acceptance stats per action type (≥95% human acceptance over ≥20 decisions / 30 days) shown
  on the dashboard as graduation evidence. `AGENT_AUTO_APPLY_TYPES` env consumes graduations.
- Exit: rails merged + deployed with ZERO types graduated. First graduation (likely
  `archive_event`, then steward dead-link) is an explicit owner decision recorded in Notion.

### E5 — Generic enrichment loop pilot: service_providers *(1 PR · gates: merge, flag enable)*
- New loop `directory-enrichment` writing **canonical `agent_content_proposals`** (no new
  staging table — applyable/dashboard/Slack for free). Facts-only fields; evidence mandatory;
  sector tags validated vs canonical layer; PII-stripping per `directory-data-enrichment`.
- Priority order = E0 gap list (demand-weighted, emptiest-first). Per-run row cap + monthly
  cost budget (env); stops proposing at budget and says so in the digest.
- Flag-gated OFF (`DIRECTORY_ENRICHMENT_ENABLED` + `activity_event_routing` row). Pilot cohort:
  ~50 service_providers rows, human-approved (no auto-apply) for the first cycle.

### E6 — Demand→priority wiring *(small PR · gate: merge)*
- `directory_demand_signals` (ack'd) become the standing priority feed for E5's target
  selection and `directory-discovery`'s search corridors. Demand-mining finally gets a consumer.

### E7 — KPI instrumentation *(small PR · gate: merge)*
- Report-match density + thin-section % into the weekly report-quality rollup and dashboard
  tiles (coverage % per table beside loop health). Compare against E0 baseline; the epic is
  working iff these move. If they don't after two E5 cycles: stop scaling, re-aim.

### E8 — Public freshness signal *(small PR · gates: merge; copy check)*
- Propagate `last_verified_at` on enriched/verified rows; render "Verified <Month Year>" on
  directory detail pages (Australian English, house tokens; SEO: no route/canonical changes).

### E9 — Scale-out + graduation reviews *(repeat template · owner decisions throughout)*
- Extend E5 loop table-by-table: investors → events → case_studies → leads (orgs only, ever).
- Graduate action types per E4 evidence; demote instantly on anomaly.
- Optional Phase-4: report-quality Approve → auto GitHub issue + `fix_ref` stamp (needs a repo
  write credential decision — separate approval).

## 3. Autonomous execution protocol

- One ticket at a time, in order; E2 is a hard barrier. Per ticket: Audit → Plan → Implement
  per `mes-ticket-workflow`; harness branch; full `mes-qa` before every PR; PR references
  MES-206 (`Refs`); owner merges; agent confirms deploy/migration live before closing ticket.
- Agent self-schedules check-ins for soak/monitoring windows; silent when nothing changed.
- Notion: append progress to MES-206 (content appends only) after each ticket exit.
- HALT conditions: any RLS/policy/destructive/payments surface, any people-table write path,
  any second writer proposal, budget overrun, or E7 KPIs flat after two E5 cycles.

## 4. Definition of done (epic)

Directory tables (orgs) cycle through verify-and-enrich on a ≤90-day cadence, aimed by demand
signals, inside cost budgets; graduated fact-fixes apply without clicks behind flood-breaker/
two-strike/daily-cap rails; new rows and all prose remain human; owner time ≈ one digest read +
one queue pass per week; report-match KPIs measurably above E0 baseline; "Verified" stamps
public. Every change traces to one writer, one audit trail, one kill switch.
