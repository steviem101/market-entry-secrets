---
name: slack-notifications-and-ops-triage
description: MES Slack notification patterns — signing verification, mrkdwn escaping, data-driven channel routing, idempotent delivery, and the report-quality loop triage playbook. Use before touching slack-notify, report-quality-loop/rollup, rq-slack-actions, or activity_event routing.
---

Last verified: 2026-07-07

# Slack Notifications & Ops Triage

## Purpose
Deliver Slack notifications safely (verified, escaped, idempotent, PII-free) and triage the
report-quality queue correctly.

## When to trigger / when NOT to
- **Trigger:** any of `slack-notify`, `report-quality-loop`, `report-quality-rollup`,
  `rq-slack-actions`; `activity_events`/`activity_event_routing`; adding a new notification.
- **Don't trigger:** general edge-function conventions (→ `edge-functions-and-cost-controls`);
  what to log vs notify (→ `observability-logging-and-cost-attribution`).

## Preconditions — inspect first
- `supabase/functions/_shared/slack.ts` (`escapeSlack`), `slack-notify/index.ts`,
  `report-quality-loop/index.ts`, `rq-slack-actions/index.ts`, `report-quality-rollup/index.ts`,
  and the routing tables `activity_events` / `activity_event_routing`.

## Playbook
1. **Verify inbound.** Interaction payloads (button clicks) hitting `rq-slack-actions` must pass
   Slack request signing: v0 HMAC-SHA256 over `v0:${ts}:${rawBody}` with `SLACK_SIGNING_SECRET`,
   a 300s replay window, and `timingSafeEqual` (`rq-slack-actions/index.ts:43-61`). Server-to-server
   posts into the loop/rollup are guarded by `x-webhook-secret` (`SLACK_NOTIFY_WEBHOOK_SECRET`).
2. **Escape all untrusted text.** Any user/intake-derived string in a Slack message goes through
   `escapeSlack` (`_shared/slack.ts:5-7`, escapes `& < >`) to block `<!channel>` pings and link
   spoofing. This is applied in the loop but **missed** in `report-quality-rollup:98` and
   `slack-notify` (MES-111 AUD-032) — apply it consistently.
3. **No PII in messages.** Never post customer emails/names to a channel (MES-35 S8 leaked
   `actor_email`); mask or omit. PII rules owned by `secrets-and-env-management`.
4. **Route data-drivenly.** Channel + per-event kill switch live in `activity_event_routing`
   (`enabled=false` disables an event type with no deploy); the loop/rollup gate on their routing
   row (`event_type='report.quality[.loop]'`). Add a routing row, don't hardcode a channel id.
5. **Deliver idempotently.** Ack Slack within its 3s window then do work in
   `EdgeRuntime.waitUntil` (`rq-slack-actions:156-161`). Button actions carry the proposal UUID as
   `value` and flip status via compare-and-swap so a double-click has a single winner
   (`rq-slack-actions:99-106`). Confirmations post to the `response_url` pinned to
   `https://hooks.slack.com/`.
6. **Truncate loudly.** Slack's 50-block cap is handled with a visible "truncated" note
   (`report-quality-loop:176-179`) — never silently drop.

## Triage playbook — report-quality queue
- The loop is **propose-only**: it scores reports, writes ranked rows to
  `report_quality_proposals` (no PII), logs to `automation_runs`, and posts a digest with
  Accept/Reject buttons. Accepting sweeps into a Notion ticket via an atomic claim
  (`fix_ref = "claim:..."` CAS + 15-min stale recovery). Reviewers gate via channel membership or
  the optional `RQ_SLACK_REVIEWERS` allowlist.
- `rq-slack-actions` only flips `report_quality_proposals.status` — it **never ships code**. Treat
  an accepted proposal as a ticket to implement under `mes-ticket-workflow`, not an auto-fix.
- On a loud "write FAILED" digest: the `automation_runs` row insert failed — check the loop's
  logs; the run is unattributed until fixed.

## Red flags / approval gates
- Posting untrusted text unescaped, or any PII, to Slack.
- A notification path with no signature/secret verification.
- Hardcoding a channel instead of an `activity_event_routing` row.
- Anything that lets a Slack button mutate data beyond a review-status flip.

## Good / bad examples
- ✅ `report-quality-loop`: secret-verified, escapes text, caps blocks, CAS claim, `finish()` once.
- ✅ `rq-slack-actions`: signed + replay window + timing-safe compare + host-pinned `response_url`.
- ❌ `` `Report for ${company}` `` straight into a block without `escapeSlack` (AUD-032).
- ❌ Posting `actor_email` to a channel (MES-35 S8).

## Self-check rubric (pass/fail)
- [ ] Inbound verified (Slack signing for interactions, `x-webhook-secret` for s2s).
- [ ] All untrusted text `escapeSlack`-d; zero PII in the message.
- [ ] Channel via `activity_event_routing` row (+ kill switch honoured).
- [ ] Ack within 3s, work in `waitUntil`; button actions idempotent (CAS).
- [ ] Block-count cap handled with a visible truncation note.

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` AUD-032 (Slack mrkdwn injection). Inspected
2026-07-07: `supabase/functions/_shared/slack.ts`, `slack-notify/index.ts`,
`report-quality-loop/index.ts` (auth L371, escape L153-154, blocks L176-179, claim L205-247,
finish L408-431), `rq-slack-actions/index.ts:27-161`, `report-quality-rollup/index.ts`. Live
tables `activity_events`, `activity_event_routing`, `report_quality_proposals`, `automation_runs`.
Secrets (names only, rules in `secrets-and-env-management`): `SLACK_BOT_TOKEN`,
`SLACK_SIGNING_SECRET`, `SLACK_NOTIFY_WEBHOOK_SECRET`, `RQ_SLACK_REVIEWERS`.

## Common MES pitfalls (real)
1. **Inconsistent escaping** — `escapeSlack` exists and is used in the loop but missed in
   `report-quality-rollup:98` and `slack-notify`, allowing `<!channel>` injection into the
   internal channel (MES-111 AUD-032).
2. **PII into channels** — raw `actor_email` posted by `slack-notify` (MES-35 S8).
3. **Treating an accepted proposal as an auto-fix** — the queue is review-only; `rq-slack-actions`
   never ships code. Implement via a ticket.
4. **Hardcoded channels** — bypasses the `activity_event_routing` kill switch, so an incident
   can't be silenced without a deploy.
