# MES-206 — agent loops rollout runbook

How to take the merged agent-loops system live safely. Everything ships gated OFF, so merging the
code changes nothing in production; behaviour only changes when you flip the flags below, one step
at a time. MES Platform project `xhziwveaiuhzdoutpgrh` only.

## What was built (all merged to main)

- **Control plane:** `agent_content_proposals` table, `content_link_checks` table, the unified
  `agent_proposals` view (security_invoker, admin-read), and `apply-proposal` (the single
  production writer: action whitelist, COALESCE-protected, bulk cap 100).
- **Content-refresh loop:** `loop-content-refresh` with 6 checks (archive_event, set_logo_url,
  flag_dead_link, trigger_reembed, remove_kb_row, flag_stale_content); weekly cron; `events.status`
  gains `archived`.
- **Dashboard data layer:** `agent-actions` (approve/reject/retry), hooks + `agentApi`
  (`/admin/agents` page shell handed to Lovable: `.claude/prompts/lovable-agent-dashboard.md`).
- **Slack:** `agent-notifier` (daily digest + Approve/Reject cards + alerts); `rq-slack-actions`
  extended for the agent-loop buttons.

## Prerequisites

- Migrations already applied on merge (Supabase integration). Confirm the tables/view exist:
  `agent_content_proposals`, `content_link_checks`, `agent_proposals` (view), and `automation_runs`.
- Edge functions deployed: merge the deploy-workflow change (PR #561) so
  `deploy-edge-functions.yml` deploys apply-proposal, loop-content-refresh, agent-actions,
  agent-notifier, and re-deploys rq-slack-actions. Confirm the "Deploy Edge Functions" Action went
  green (or trigger it via workflow_dispatch).

## Step 0 — secrets (before enabling anything)

Set on the Supabase project (edge secrets):

- `AGENT_ACTIONS_SECRET` — server-to-server auth for agent-actions (Slack path). Optional: if unset
  it falls back to `EMAIL_INTERNAL_SECRET`.
- `APPLY_PROPOSAL_SECRET` — same, for apply-proposal (falls back to `EMAIL_INTERNAL_SECRET`).
- Slack (for the digest): invite the MES bot to `#mes-agents-digest` and `#mes-agents-alerts`, then
  set `SLACK_AGENTS_DIGEST_CHANNEL` and `SLACK_AGENTS_ALERTS_CHANNEL` to those channel IDs.
  `agent-notifier` self-skips until the digest channel is set, so it is safe to leave until you want
  the digest.

## Step 1 — content-refresh events pilot (dry run first)

1. **Dry run (no writes):** invoke `loop-content-refresh` with `{"dry_run":true}` (x-webhook-secret
   auth). It returns the archive_event candidates it would propose (about 140 past-dated events
   today) and writes nothing.
2. **Enable propose-only:** set `CONTENT_REFRESH_ENABLED=on`. Trigger a manual run
   (`{"force":true}` or wait for the Sunday 04:00 UTC cron). Verify:
   - a row in `automation_runs` (loop = `content-refresh`, status success),
   - `agent_content_proposals` rows with action_type `archive_event`, status `auto_approved`.
3. **Verify in the dashboard / digest** (once Lovable ships `/admin/agents` and Slack is wired).

## Step 2 — turn on auto-apply

Set `CONTENT_REFRESH_AUTOAPPLY=on`. The next run applies its `auto_approved` proposals through
apply-proposal (archives past events by setting `events.status='archived'`, which drops them from
listings/sitemap/mes-context). Confirm a few events flipped to `archived` and the proposals moved to
`applied`.

## Step 3 — enable the remaining checks, one at a time

Widen `CONTENT_REFRESH_CHECKS` (comma-separated; default `archive_event`). Add ONE check, run
manually, verify its proposals, then add the next. Recommended order (highest value first):

1. `archive_event,set_logo_url` — fills about 425 missing directory logos via logo.dev
   (auto_approved, COALESCE-protected). Highest-value freshness win.
2. `...,flag_dead_link` — GET-checks directory links; proposes only after 2 consecutive weekly
   failures. Makes outbound requests (SSRF-guarded); bounded to 15 URLs/run.
3. `...,trigger_reembed` — surfaces a stuck embed pipeline (auto_approved). Usually silent.
4. `...,remove_kb_row` — flags orphaned KB rows (pending). Usually silent.
5. `...,flag_stale_content` — flags stale content_items (pending, review-only).

Batch cap is 50 proposals/run (`batch_cap` in the request body overrides). `queue_enrichment` is
not implemented yet (deferred: needs Firecrawl + cost caps).

## Step 4 — the other loops (optional, later)

The disabled `activity_event_routing` rows for `directory.demand` / `directory.discovery` /
`prompt.ab.rollup` remain OFF by design. Enable per the MES-148 Phase 5 rollout runbook if/when you
want those loops observable, and decide whether to re-route them to the `#mes-agents-*` channels.

## Rollback

- **A single check:** remove it from `CONTENT_REFRESH_CHECKS`.
- **The whole content loop:** `CONTENT_REFRESH_ENABLED` unset (stops proposing);
  `CONTENT_REFRESH_AUTOAPPLY` unset (stops applying). Unschedule the cron:
  `select cron.unschedule('content-refresh');`.
- **The digest:** unset the `SLACK_AGENTS_*` channel secrets (agent-notifier self-skips).
- **Schema:** every migration has a rollback file in `supabase/rollback/`. All changes are additive;
  archived events revert to `rejected` in the events-status rollback.
- Nothing auto-deploys or auto-enables: the flags are the only switches.

## Telemetry (admin SQL)

```sql
-- Runs by loop (last 7 days)
select loop, status, count(*), max(started_at)
from automation_runs where started_at > now() - interval '7 days' group by loop, status;

-- Proposals by loop + status
select loop_name, action_type, status, count(*)
from agent_proposals group by loop_name, action_type, status order by 1, 4 desc;

-- Pending review queue
select loop_name, action_type, count(*) from agent_proposals where status='pending' group by 1,2;

-- Dead-link failure tracker
select directory_table, count(*) filter (where consecutive_failures >= 2) as flagged,
       count(*) as tracked from content_link_checks group by 1;
```

## Guardrails (reminders)

- Loops propose, never act: the only production writer is apply-proposal (whitelisted,
  COALESCE-protected). Auto-approve is limited to archive_event / set_logo_url / trigger_reembed.
- Slack and the dashboard share one apply path (agent-actions), so state stays consistent.
- Never point any loop at the Content Studio project (`rcgaviwbsudouvfwzydq`).

## Apply-on-approve for staging sources (MES-223 E1)

Approving a `directory-steward` or enrichment proposal can now apply the change to the live
directory row through `apply-proposal` (the same single writer), instead of only recording the
decision. This is **off by default** and enabled per source.

### Enable (owner, at rollout)

Set the Supabase edge secret on BOTH `apply-proposal` and `agent-actions`:

```
AGENT_APPLY_SOURCES=directory_steward_staging
```

Comma-separate to add more (`...,innovation_ecosystem_enrichment_staging,trade_agencies_enrichment_staging`).
Unset/empty = today's behaviour (approve records status, applies nothing). Unknown names are
ignored. No redeploy needed to disable — clear the secret.

### What apply does per source

- **directory-steward** — applies each `field_diffs` field by compare-and-swap: writes `after`
  only while the live value still equals `before` (null/""/missing treated as equal). A field
  edited since the proposal is skipped and reported; it never overwrites drifted data.
- **enrichment (ecosystem / agency)** — fill-empty only: writes a proposed value only into a
  currently-empty field. Populated fields are never overwritten.
- Both are constrained to the **organisations-only fact-field allowlist** in `stagingApply.ts`
  (no people tables; prose/description fields are never machine-written).

A partial apply (some fields skipped) is still success; the skips are returned per field.

### Recovering a hard apply failure

A hard failure (e.g. a DB constraint error) leaves the staging row in `approved` — these tables
have no `apply_failed` state, and the dashboard does **not** offer a direct re-apply for an
`approved` staging row. While it stays `approved` it also holds the steward loop's
open-proposal dedup slot (`uq_directory_steward_open_per_record`, predicate
`status IN ('new','approved')`), so the loop cannot raise any new proposal for that record.

**Recover by rejecting it:** Reject sets the row `dismissed`, which frees the dedup slot; the
steward loop then re-proposes the still-stale field on its next scan (6-hourly). A dedicated
apply_failed/retry surface is deferred to E4. Enrichment rows have no dedup slot, so a rejected
enrichment row simply waits for the enrichment loop to re-propose.

### Undo an applied steward change

The old value is preserved in the proposal's `field_diffs.<field>.before`:

```sql
-- inspect what was applied
select record_id, directory_table, field_diffs, applied_at
from directory_steward_staging where id = '<staging_id>';

-- restore one field (example: website) to its pre-apply value
update innovation_ecosystem
set website = (select field_diffs->'website'->>'before' from directory_steward_staging where id='<staging_id>')
where id = '<record_id>';
```

Enrichment undo = set the filled field back to empty (`null`), since apply only ever filled a blank.

### Supervised soak (E2 — do this before bulk-approving)

Apply the first ~20 individually and verify the live row after each. Expect some benign
`skipped` / no-op results — that is the guard working, not a bug.
