---
name: observability-logging-and-cost-attribution
description: MES structured logging, correlation IDs, error taxonomy, and per-run LLM cost attribution (OWNED here — other skills link). Use before adding logging, telemetry, or cost tracking to app code or edge functions, or when debugging a run.
---

Last verified: 2026-07-07

# Observability, Logging & Cost Attribution

## Purpose
Own the logging and cost-attribution rules so every run is traceable and every LLM dollar is
attributable — without leaking PII. Other skills link here rather than restating.

## When to trigger / when NOT to
- **Trigger:** adding/changing logs, telemetry, cost tracking, correlation IDs, alert thresholds;
  debugging why a run failed or cost too much.
- **Don't trigger:** the security of a secret value (→ `secrets-and-env-management`); rate-limit
  design (→ `edge-functions-and-cost-controls`).

## Preconditions — inspect first
- `supabase/functions/_shared/log.ts` (the logging primitives), one function that already logs
  well (`generate-report`, `report-quality-loop`), and the telemetry tables:
  `automation_runs`, `report_quality`, `user_reports` (telemetry columns + `report_json.metadata`).

## Playbook — logging
1. **Use the shared primitives, not raw console.** `log(prefix, message, data?)` and
   `logError(prefix, message, err)` from `_shared/log.ts` emit `[ISO-ts] [prefix] message` +
   `JSON.stringify(data)`. Pick a stable `prefix` per function.
2. **Correlation id in every line.** MES correlates by the entity id, not a separate trace id:
   `reportId` for generation (`generate-report/index.ts` logs it at each phase), run id for loops.
   Include it so a run can be reconstructed from logs.
3. **Never log PII or secrets.** No emails, tokens, or raw provider error bodies — `generate-report`
   deliberately omits Perplexity error bodies (`index.ts:692-693`). Secret *values* rule is owned
   by `secrets-and-env-management`; customer email in Slack was a real leak (MES-35 S8).
4. **Client side:** there is no external error reporting today — the app only `console.error`s
   (MES-111 §13 flags adding Sentry/equivalent as a launch item). Don't add `console.log` to `src/`
   (MES-111 verified none exist); if you add client telemetry, gate it and strip PII.
5. **Errors to clients stay generic.** Return `{ error: "..." }` without internals; several
   functions currently leak raw `error.message` (MES-111 AUD-029) — don't copy that.

## Playbook — cost attribution
1. **Per-run token + cost row.** The model is `report-quality-loop`: it writes `tokens_used` and
   `cost {input_tokens, output_tokens, usd}` (priced from constants, `index.ts:50-51,497`) to
   `automation_runs`, opened before work and closed exactly once via `finish()`. New scheduled
   loops copy this.
2. **Per-report cost proxies.** `generate-report` persists `FirecrawlStats` (`.ops` = call count
   "for cost visibility") and `perplexity_health` into `report_json.metadata` and mirrors queryable
   columns (`generation_time_ms`, `firecrawl_ops`, `perplexity_ok`, …). `report_quality` is the
   scoring/telemetry system of record. Attribute cost to `(reportId, userId)`.
3. **Model + price provenance.** When you add an LLM call, record which model and the token counts;
   don't hardcode a price without a comment (loop uses `$3/$15 per 1M` inline). Models in use are
   listed in `edge-functions-and-cost-controls`.
4. **Alert thresholds.** MES-111 §13 calls for cost alerts on Firecrawl/Perplexity/Anthropic/
   OpenAI/Lovable and alerting on Stripe webhook 500s + `payment_webhook_logs` write failures.
   New expensive paths should state their expected per-run cost and a ceiling.

## Red flags / approval gates
- Logging anything PII-shaped; returning raw DB/error text to a client.
- Adding an LLM call with no token/cost capture and no per-run budget (→ `edge-functions-and-cost-controls`).
- A scheduled loop that doesn't open/close an `automation_runs` row (silent, unattributable spend).

## Good / bad examples
- ✅ `log("generate-report", "phase 1 complete", { reportId, firecrawlOps })` — prefixed,
  correlated, no PII.
- ✅ `automation_runs` row: `finish()` writes status + `tokens_used` + `cost` exactly once, even on
  the error path (loud "write FAILED" digest if the insert fails).
- ❌ `console.log("checkout for", user.email)` — PII + raw console.
- ❌ An enrichment loop that calls an LLM 300× and records neither token counts nor a run row.

## Self-check rubric (pass/fail)
- [ ] All logs via `log`/`logError` with a stable prefix + the entity/correlation id.
- [ ] Zero PII/secret values in logs or client error bodies.
- [ ] Every LLM call's tokens + model captured; scheduled loops write an `automation_runs` row.
- [ ] Per-report cost attributable to `(reportId, userId)` via metadata/columns.
- [ ] New expensive path states expected cost + ceiling; alert threshold noted.

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` §13 (monitoring/cost-alert launch items),
AUD-029 (raw errors to client). Inspected 2026-07-07: `supabase/functions/_shared/log.ts`;
`supabase/functions/generate-report/index.ts` (reportId logging, `FirecrawlStats` L28-57,
`perplexity_health` L720-726, metadata persistence L2291-2363, no-PII L692-693);
`supabase/functions/report-quality-loop/index.ts:50-51,408-431,497-522`. Live tables
`automation_runs`, `report_quality`, `user_reports` (project `xhziwveaiuhzdoutpgrh`).

## Common MES pitfalls (real)
1. **Customer email logged to Slack** — `slack-notify` posted raw `actor_email` (MES-35 S8);
   escape/omit PII in every notification (see `slack-notifications-and-ops-triage`).
2. **Raw error messages to clients** — several functions return `error.message` verbatim,
   disclosing schema (MES-111 AUD-029).
3. **No external error monitoring** — the app only `console.error`s; a prod incident is invisible
   until someone reads Supabase logs (MES-111 §13).
4. **Fail-open rate limiter hides load** — throttling silently disables on DB error with no alert
   (MES-111 AUD-028); log it loudly if you depend on it.
