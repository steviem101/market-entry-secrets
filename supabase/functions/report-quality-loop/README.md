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

## Caps (POST body overrides)

```jsonc
{
  "batch_size": 20,        // reports per run (max 50)
  "token_budget": 200000,  // total Anthropic tokens (in+out) per run; stops the batch when hit
  "lookback_days": 14,     // how far back to consider report_quality rows
  "dry_run": false         // true → score + return proposals WITHOUT writing or posting
}
```

`PROPOSAL_CAP` (40) bounds proposals written per run. Cost is logged to
`automation_runs.cost` (`{ input_tokens, output_tokens, usd }`).

## Manual / dry run

```bash
curl -sS -X POST "$SUPABASE_FUNCTIONS_URL/report-quality-loop" \
  -H "x-webhook-secret: $SLACK_NOTIFY_WEBHOOK_SECRET" \
  -H "content-type: application/json" \
  -d '{"dry_run": true, "batch_size": 3}'
```

(The loop must be enabled via the routing flag above for even a dry run to proceed.)

## Reviewing proposals

`report_quality_proposals` is admin-read + admin-update. A reviewer accepts/rejects by
setting `status` (`new` → `accepted` | `rejected` | `shipped`) and may set `fix_ref` to
the tracking ticket/PR. Accepted proposals are the prioritised quality backlog; any
resulting code change ships as a normal human-reviewed PR — the loop never merges.

## Tests

`rubric.ts` holds all pure logic (tier-awareness, PII scrubbing, parsing, ranking,
theming) and is covered by `rubric.test.ts` (`npm test`).
