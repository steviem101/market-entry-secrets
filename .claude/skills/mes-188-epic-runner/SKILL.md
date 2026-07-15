---
name: mes-188-epic-runner
description: Autonomous runner for the MES-188 Intent-to-Advisor epic — picks the next ticket from the sequenced backlog, respects gate stages and approval boundaries, implements, verifies, opens PRs, and updates Notion. Invoke with /mes-188-epic-runner to advance the epic one unit of work; safe to invoke repeatedly (idempotent state sync first).
---

# MES-188 epic runner

Goal: deliver the Intent-to-Advisor epic (charter:
`docs/audits/mes-188-epic-intent-to-advisor-charter.md`, backlog:
`docs/audits/mes-188-ticket-backlog.md`) autonomously, one verified unit of work per invocation,
without ever crossing an approval boundary on its own.

## Preconditions (refuse politely if missing)

1. **Intake block is filled** — the "Epic intake" section on the MES-188 Notion page contains:
   decisions D1–D3, D5–D9; booking-tool URL (D7); advisor name + weekly capacity; SLA windows;
   epic Type + ticket-ID range; test-account policy (see Testing); a single-use 100% Stripe promo
   code (or explicit denial → skip live checkout smoke tests); beta-user list for T18.
2. Skills read first: `mes-codebase-conventions`, `mes-ticket-workflow`, `freemium-tier-gating`,
   `stripe-payments-and-webhooks`, `supabase-rls-and-migrations` for any gated ticket.

## Operating loop (one iteration per invocation)

1. **Sync state:** read the MES-188 Notion page + sub-tickets (statuses, comments since last
   run), `git fetch`, open PR states. Never assume memory of a prior session is current.
2. **Pick work** in backlog §2 order: the first Wave-1 ticket not Done/blocked. Parallel-safe
   tickets (T12, T5a, T2, MES-187, T17) may be picked in any order; the T1+T3 → T8 → T13 → T16a
   chain is strict. Never start a Wave-2 ticket before launch is declared on the Notion page.
3. **Gate stage:** for tickets flagged approval-gated (T12 destructive plan, T1 RPCs, T8
   payments/RLS, T7/T14/T15 new RLS): write the plan (incl. matrix row + enforcement layer +
   rollback) as a Notion comment on the ticket, set Gate stage = Plan, **stop and end the turn**.
   Resume only when a human comment approves. Non-gated tickets proceed directly.
4. **Implement** on branch `mes-<ticket-id>-<slug>` (or the harness-assigned branch — note the
   mapping on the ticket). Match repo conventions; AU English; HSL tokens; no generated-file
   edits.
5. **Verify** per the Testing protocol below. A ticket is not "done" until its acceptance
   criteria in backlog §3 are demonstrated, not asserted.
6. **Pre-merge QA (mandatory):** run the **`mes-qa`** skill (the pre-merge exam) on the branch,
   plus `/code-review` at high effort for approval-gated diffs. Fix every confirmed finding or
   document why it stands; paste the QA verdict into the PR description. No PR is marked ready
   without it.
7. **PR:** open with `Refs MES-<epic-id>` + `Closes MES-<ticket-id>`, describe the matrix row,
   test evidence, and the mes-qa verdict, subscribe to PR activity. **Never merge own PRs** —
   the owner merges all Wave-1 PRs after reading the evidence.
8. **Update Notion** and **end turn** as below (steps renumber accordingly).
7. **Update Notion:** ticket status, branch, PR link, evidence summary, caveats, follow-ups.
8. **End turn** with a one-paragraph status: what shipped, what's blocked on whom, what's next.

## Approval boundaries (hard stops — no exceptions)

- RLS/policies/grants, SECURITY DEFINER functions, destructive migrations or data ops,
  payments/subscriptions/entitlements, secrets: plan → human approval → implement.
- Anything not in the backlog: propose on the Notion page, don't build.
- Stripe live objects: create nothing without the intake's explicit go-ahead per object.
- If a decision (D1–D9) is missing for the picked ticket, skip to the next unblocked ticket and
  flag the gap; never guess a product decision.

## Model routing

| Work | Model | Why |
|---|---|---|
| Approval-gated plans, RPC/payments diffs, final pre-merge QA (`mes-qa`), adjudicating conflicting findings | Strongest available (Fable/Opus tier) | Security-critical judgement; cost is trivial vs a leak |
| Feature implementation (T2, T3, T13, T15, T16, MES-158 UI), test writing | Sonnet tier | Workhorse; conventions are well documented |
| Fan-out reads: codebase exploration, copy-consistency sweeps, event-name audits, match-count checks | Haiku tier / Explore subagents | Cheap breadth; conclusions only |
| Adversarial review of gated diffs | 2–3 independent verifier subagents prompted to refute | Catches plausible-but-wrong before a human sees it |

## Testing protocol (as-you-go, every ticket)

1. **Static gate (always):** `npm test`, `npx tsc -p tsconfig.app.json --noEmit`,
   `npm run build`, no new lint errors in touched files.
2. **Gating payload check (any ticket near sections/tiers):** as the flagged **free** test
   account, call `get_tier_gated_report` and assert: no content for gated sections, full content
   for freed ones; repeat for growth/scale accounts. Keep the check as a repeatable script under
   `scripts/` (read-only, anon/user JWT only — never service-role).
3. **Runtime smoke (UI tickets):** run `vite` dev in the sandbox + the pre-installed Chromium
   (Playwright, `executablePath: '/opt/pw-browsers/chromium'`); walk the affected flow at 1440px
   and 390px; screenshot into the PR.
4. **Test accounts:** created via the real signup flow under `stephen+090*@marketentrysecrets.com`,
   flagged per T12's `is_test` policy so they never pollute metrics. Email confirmation for
   is_test accounts is done by **admin-confirm via service role** — approved in intake, codified
   in T12's plan, and used for is_test accounts ONLY. Paid-tier state is reached through the
   **real checkout with the 100% promo code** (MES-140 flow; code held in the Notion intake,
   never in git) — smoke-tests payments end-to-end at $0. Never use a real card; never write
   tiers directly.
5. **Cost cap:** full report generations cost real API money — max 2 per ticket, only when the
   ticket touches generation/gating output; otherwise test against existing flagged reports.
6. **Migrations:** validated by the PR's Supabase integration check (preview replays the
   ledger); never MCP-applied to prod. Post-merge, verify live via read-only catalog queries
   (`pg_get_functiondef`, `report_templates`) exactly as the MES-188 audit did.
7. **Post-merge watch:** stay subscribed to the PR; re-check CI/mergeability on wake; after
   deploy, run the relevant live check before marking the Notion ticket Deployed.

## Cadence & comms

- One meaningful unit per invocation; end the turn rather than pile risk.
- Pair with a Routine/scheduled session ("continue the MES-188 epic — invoke
  /mes-188-epic-runner") only after the human opts in; a stalled approval is a normal state, not
  a failure — check in, don't churn.
- Weekly (or on demand): post a rollup on the MES-188 page — done / in review / blocked / next,
  plus budget notes (API spend on test generations).
