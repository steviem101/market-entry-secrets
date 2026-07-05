# report-quality-loop

A scheduled, **propose-only** review loop that reads completed MES reports + their
Report Quality telemetry + the user's intake inputs, scores each report on three axes
against its subscription tier, and writes ranked improvement **proposals** to a review
queue. It posts a digest to Slack `#report-quality` and logs each run to
`automation_runs`. It **never** edits prod prompts, matching logic, RLS, or directory
data — a human approves proposals before anything ships.

## What it does each run

1. Pulls a capped batch of recent **completed** `report_quality` rows (lowest
   `report_score` first), skipping reports that already have proposals.
2. For each, reads `user_reports.report_json` + `tier_at_generation` and the original
   `user_intake_forms` inputs (server-side service role, read-only).
3. Builds a compact, **PII-scrubbed** payload (no email/user_id — only the user's own
   company name + public directory match names) and asks an Anthropic judge to score:
   - **relevance** — are matched directory items genuinely on-target?
   - **conciseness** — is the report padded / duplicated / stuffed?
   - **fidelity** — did it deliver, accurately, what the form asked for?
   ...evaluated **against the report's tier** (gated sections are never flagged as
   "missing" — see `gatedSections()` in `rubric.ts`).
4. Bins findings into `matching/relevance`, `content/prompt-bulk`, `data-coverage-gap`,
   `input-not-actioned`, `accuracy/hallucination`; ranks by impact × confidence.
5. Writes ranked proposals to `report_quality_proposals`, logs the run to
   `automation_runs` (reviewed / proposed / tokens / cost / status), posts a digest.

## Disabled by default

The loop **self-gates** on the `activity_event_routing` row `report.quality.loop`
(`enabled = false` after migration). The weekly cron fires but the function returns
immediately — no reads, no AI, no writes — until you flip the flag:

```sql
-- enable
update public.activity_event_routing set enabled = true  where event_type = 'report.quality.loop';
-- disable
update public.activity_event_routing set enabled = false where event_type = 'report.quality.loop';
```

To stop scheduling entirely: `select cron.unschedule('report-quality-loop');`

## Schedule

`pg_cron` job `report-quality-loop` runs **Tuesdays 09:00 UTC** (a day after the Monday
rollup). It POSTs to the function with the `x-webhook-secret` header (same pattern as
`report-quality-rollup`). See migration `20260628140200_report_quality_loop_cron.sql`.

## Required secrets (server-side only — never `VITE_*`)

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude judge that scores the three axes + emits findings |
| `SUPABASE_SERVICE_ROLE_KEY` | Read reports/intake, write proposals + run log (provided by platform) |
| `SLACK_BOT_TOKEN` | Posts the digest to `#report-quality` |
| `SLACK_NOTIFY_WEBHOOK_SECRET` | Authenticates the cron POST (`x-webhook-secret`) |
| `RQ_LOOP_MODEL` (optional) | Override the Claude model (default `claude-sonnet-4-6`) |
| `NOTION_API_KEY` (optional) | Enables the Notion ticket sweep (internal integration token; the integration must be shared with the MES Tickets database). Missing → sweep skips quietly |
| `NOTION_TICKETS_DB_ID` (optional) | MES Tickets database id (prod: `3865de22266780408c6eef94b1d5ac63`). No default — both this and the key must be set for the sweep to run, so a non-prod deploy can never write into the prod ticket DB |
| `RQ_SLACK_REVIEWERS` (optional, on `rq-slack-actions`) | Comma-separated Slack user IDs allowed to click Accept/Reject. Unset → anyone who can see the channel |

## Caps (POST body overrides)

```jsonc
{
  "batch_size": 20,        // max reports to consider per run (hard max 50)
  "token_budget": 200000,  // total Anthropic tokens (in+out) per run; stops the batch when hit
  "lookback_days": 14,     // how far back to consider report_quality rows
  "max_run_ms": 95000,     // wall-clock deadline; stops the batch early and still writes/posts
  "dry_run": false         // true → score + return proposals WITHOUT writing or posting
}
```

`PROPOSAL_CAP` (40) bounds proposals written per run. Cost is logged to
`automation_runs.cost` (`{ input_tokens, output_tokens, usd }`).

**Wall-clock deadline.** Edge functions are killed at the gateway timeout (~150s). The
loop processes reports sequentially and stops at `max_run_ms` (default 95s), then writes
+ logs + posts whatever it gathered. Any reports not yet reviewed are picked up on the
next run (already-proposed reports are skipped), so a backlog drains across runs rather
than blowing the timeout. A partial run is flagged in `automation_runs.metadata.deadline_hit`
and noted in the Slack digest. To sweep a large backlog at once, invoke repeatedly (each
call clears ~6–8 more) rather than raising `batch_size`.

## Manual / dry run

```bash
curl -sS -X POST "$SUPABASE_FUNCTIONS_URL/report-quality-loop" \
  -H "x-webhook-secret: $SLACK_NOTIFY_WEBHOOK_SECRET" \
  -H "content-type: application/json" \
  -d '{"dry_run": true, "batch_size": 3}'
```

(The loop must be enabled via the routing flag above for even a dry run to proceed.)

## Post the review queue to Slack (no scoring)

`POST {"post_queue": true}` reads the open proposals (`status='new'`, ranked) and posts
the full list to `#report-quality` via the loop's own bot — no scoring, no writes, no
`automation_runs` row. The top 10 get ✅ Accept / ❌ Reject buttons; the tail is compact
text with a `[ref]` (first 8 chars of the proposal id) for actioning via Claude/admin.
Optional `limit` (default 40, max 100).

## Reviewing proposals

**From Slack (easiest):** digests carry ✅ Accept / ❌ Reject buttons (top 5 on run
digests, top 10 on `post_queue`). Clicks hit the `rq-slack-actions` function
(Slack-signature-verified), which sets `status` + `reviewed_at`, records the reviewer in
`evidence.slack_review`, and posts an in-channel confirmation. Shipped rows are immutable
from Slack; accept↔reject re-decisions are allowed. Plain thread replies are **not**
machine-read — only the buttons act.

**From SQL/admin:** `report_quality_proposals` is admin-read + admin-update. A reviewer
accepts/rejects by setting `status` (`new` → `accepted` | `rejected` | `shipped`) and may
set `fix_ref` to the tracking ticket/PR.

Either way, accepted proposals are the prioritised quality backlog; any resulting change
ships as a normal human-reviewed PR — the loop never merges.

## Notion ticket sweep (accepted → MES Tickets)

At the end of every scheduled run (and on demand via `POST {"sync_notion": true}`), the
loop sweeps proposals with `status='accepted'` and `fix_ref IS NULL`, groups them **by
category** into tickets in the Notion **MES Tickets** database (Status `Scoped`,
Workstream `Reports`; `data-coverage-gap` tickets are flagged "needs human data
sourcing"), and writes each ticket's URL back to the proposals' `fix_ref`. So: click
Accept in Slack during the week → grouped tickets appear in the Notion pipeline on the
next run (or immediately via the on-demand call). Proposals that already have a
`fix_ref` are never re-ticketed. Requires `NOTION_API_KEY` **and** `NOTION_TICKETS_DB_ID`;
without them the sweep skips quietly. A "🗂 Notion sweep" note posts to `#report-quality`
whenever tickets were created, and a ⚠️ warning posts if any sweep step failed (so an
expired Notion token can't silently strand accepted proposals).

Operational notes:
- The on-demand `sync_notion` mode works even while the scoring loop's routing flag is
  disabled — ticketing accepted proposals doesn't require Anthropic-spending scoring.
- **Claim protocol:** rows are atomically claimed (`fix_ref = "claim:<iso>:<rand>"`)
  before any ticket is created, so overlapping sweeps (manual + scheduled) can't
  double-ticket; claims stranded by a dead sweep are recovered after ~15 min. Tickets
  list at most 90 proposals — overflow rows are released and ticketed on the next sweep,
  never silently dropped.
- **Budgeted:** the sweep respects the run's wall-clock budget (deferring remaining
  groups) and each Notion call has a 10s timeout, so it can't push the function into the
  edge gateway kill window; deadline-hit runs skip it entirely.
- **Observable:** the sweep outcome (created/ticketed/deferred/errors) is recorded in
  the run's `automation_runs.metadata.notion_sweep` as well as posted to Slack, so an
  expired Notion token is queryable even if the Slack warning fails.
- Re-decisions: if a proposal is rejected *after* it was ticketed, the ticket keeps
  listing it (`fix_ref` stays as provenance) — prune the ticket manually if it matters.
- Button clicks: decisions post in-channel (audit trail); errors and allowlist
  rejections post ephemerally to the clicker only. `evidence.slack_review` records both
  the display name (`by`) and the immutable Slack user id (`by_id`).

### Slack app setup for the buttons (one-time)

1. In the MES Events Bot Slack app config: **Interactivity & Shortcuts → On**, Request URL
   `https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/rq-slack-actions`.
2. Copy the app's **Signing Secret** (Basic Information) into the Supabase secret
   `SLACK_SIGNING_SECRET`.
3. Buttons appear on the next digest; clicks before setup fall back to a Slack error toast.

## Tests

`rubric.ts` holds all pure logic (tier-awareness, PII scrubbing, parsing, ranking,
theming) and is covered by `rubric.test.ts` (`npm test`).
