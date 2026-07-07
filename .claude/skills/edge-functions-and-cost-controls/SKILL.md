---
name: edge-functions-and-cost-controls
description: MES edge function conventions (Deno/esm.sh, auth patterns, CORS, error shapes, idempotency) and LLM cost caps. Use before writing or modifying anything under supabase/functions/.
---

Last verified: 2026-07-07

# Edge Functions & Cost Controls

## Purpose
Make every edge function follow the house patterns — correct auth, CORS, logging, idempotent and
safe-to-re-run design — and keep LLM/scrape spend bounded.

## When to trigger / when NOT to
- **Trigger:** any work under `supabase/functions/`; adding external API calls; cron/webhook design.
- **Don't trigger:** payment specifics (→ `stripe-payments-and-webhooks`), report content
  (→ `report-generation-quality`).

## Preconditions — inspect first
- `supabase/config.toml` (per-function `verify_jwt`), `supabase/functions/_shared/` (all of it),
  one neighbouring function similar to yours. 31 function dirs exist; CLAUDE.md §5 is a subset
  and lists two ghosts (`apify-webhook`, `notion-research-trigger` — don't reference them).

## Playbook — conventions
1. **Runtime:** `Deno.serve`, `esm.sh` imports (never npm), long work in
   `EdgeRuntime.waitUntil` after an early ack (`generate-report/index.ts:2596`,
   `rq-slack-actions/index.ts:156-161`).
2. **Auth — pick the house pattern and register it:**
   | Pattern | Use | Reference |
   |---|---|---|
   | `verify_jwt = true` (default) | user/admin-invoked | + `requireAdmin(req)` for admin (`_shared/auth.ts:19-55`) |
   | In-code JWT + ownership | user-owned resources | `generate-report/index.ts:2515-2546` |
   | `x-internal-secret` | server-to-server | `send-email/index.ts:59-100` |
   | `x-webhook-secret` | cron/external webhook | `report-quality-loop/index.ts:371-373` |
   | Provider signature | Stripe/Slack | `stripe-webhook/index.ts:24-35`; `rq-slack-actions/index.ts:43-61` (HMAC + 300s replay window + `timingSafeEqual`) |
   If `verify_jwt = false`, add the `[functions.<name>]` block to `config.toml` **with a comment
   saying why** — five functions currently authenticate in-code but have no config entry
   (`embed-knowledge`, `ingest-events`, `knowledge-search`, `mcp`, `normalize-events`); don't add
   a sixth.
3. **CORS:** browser-facing → `buildCorsHeaders(req)` from `_shared/http.ts` + early `OPTIONS`
   return; never hardcode `*` for user-facing functions (a past audit found 8 doing so,
   `docs/audits/SECURITY_AUDIT.md` §3).
4. **Responses:** JSON, errors as `{ error: string }` without internals; 401 auth / 403 ownership /
   400 validation / 405 method / 429 rate limit / 500 unhandled; deliberate fail-soft returns
   200 + `_reason` (`scrape-company/index.ts:171-208`).
5. **Logging:** `log(prefix, msg, data)` / `logError` from `_shared/log.ts`; include the entity id
   (e.g. `reportId`) in every line for correlation; never log PII or provider error bodies
   (`generate-report/index.ts:692-693`). Deeper rules → Wave 2 observability skill.
6. **External input:** URLs through `isPrivateOrReservedUrl` (`_shared/url.ts` — SSRF guard);
   scraped text through `sanitizeScrapedContent` (`_shared/sanitize.ts` — strips prompt-injection
   patterns, 12k cap); Slack text through `escapeSlack`.
7. **Idempotency & re-runs (design for both):** dedupe keys per side-effect —
   `email_log.idempotency_key` (`send-email/index.ts:22-45`), `payment_webhook_logs.stripe_event_id`,
   proposal-skip + open-run-then-`finish()`-exactly-once (`report-quality-loop/index.ts:408-452`),
   CAS claim protocol for Notion ticket sweep (L205-247). A cron function must be safe to fire
   twice.

## Playbook — cost controls
- **Models in use (don't upgrade casually):** Gemini `google/gemini-3-flash-preview` via
  `ai.gateway.lovable.dev` (report/scrape/enrich-content), Perplexity `sonar`/`sonar-pro`,
  Anthropic `claude-sonnet-4-6` (`generate-plan`, `RQ_LOOP_MODEL` default) and
  `claude-haiku-4-5-20251001` (`classify-personas`), OpenAI `text-embedding-3-small` (KB).
- **Every external call gets a timeout** (AbortController): Firecrawl 10s/5s/15s, Perplexity 60s,
  AI gateway 90s, Notion 10s, Resend 10s — all verified in code.
- **Budget caps are explicit constants:** report-quality-loop `DEFAULT_TOKEN_BUDGET 200000`,
  `MAX_BATCH 50`, `PROPOSAL_CAP 40`, `DEFAULT_MAX_RUN_MS 95000` (`index.ts:38-48`); embedding cron
  hard-capped 100 rows/run (`docs/mes-knowledge-base-rag.md`). New loops copy this pattern and log
  spend to `automation_runs` (`tokens_used`, `cost`).
- **Rate limiting:** `checkRateLimit(id, fn, max, windowMin)` on `edge_function_rate_limits` —
  generate-report 5/60min, scrape-company 20/10min. Know its limits: it **fails open** on DB error
  and anon keying trusts `x-forwarded-for` (`_shared/rateLimit.ts:29-33`; MES-35 S12) — never make
  it the only guard on an expensive path.
- **Caching:** `_shared/scrapeCache.ts` (14d TTL, flag `FIRECRAWL_CACHE_ENABLED`) before adding
  new scrape volume. Per-report cost visibility via `FirecrawlStats.ops` + `perplexity_health`.

## Red flags / approval gates
- New function without an auth pattern from the table, or `verify_jwt=false` without in-code auth.
- Unbounded loops over LLM calls; missing timeout; missing per-run budget constant.
- Anything that lets anonymous traffic trigger paid API calls (scrape-company is already a known
  cost amplifier — MES-35 R5).

## Good / bad examples
- ✅ `report-quality-loop`: secret auth + kill-switch row + budget constants + `finish()` once +
  loud failure digest — the model citizen for scheduled loops.
- ❌ Dedupe/log write *before* the side-effect completes (MES-35 R2 — see stripe skill).
- ❌ `Access-Control-Allow-Origin: "*"` on a user-facing function.

## Self-check rubric (pass/fail)
- [ ] Auth pattern from the table; config.toml entry + comment if `verify_jwt=false`.
- [ ] CORS via `buildCorsHeaders`; errors `{error}`; correct status codes.
- [ ] Every external call: timeout + failure path; function safe to invoke twice.
- [ ] LLM calls: bounded count, budget/cap constant, spend logged; SSRF/sanitize guards on
      external input.
- [ ] No PII in logs; secrets via `Deno.env.get` (rules in `secrets-and-env-management`).

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` (AUD-### findings folded in 2026-07-07).
Inspected 2026-07-07: `supabase/config.toml:39-145`; all of `supabase/functions/_shared/`
(`http.ts`, `log.ts`, `auth.ts`, `rateLimit.ts`, `sanitize.ts`, `scrapeCache.ts`, `url.ts`,
`slack.ts`, `email/`); `generate-report/index.ts`, `stripe-webhook/index.ts`,
`rq-slack-actions/index.ts`, `report-quality-loop/index.ts:26-533`, `scrape-company/index.ts:34-208`,
`send-email/index.ts:22-171`, `process-email-queue/index.ts:46-268`. Audits: MES-35 S10/S12/S13,
`docs/audits/SECURITY_AUDIT.md` §3.

## Common MES pitfalls (real — AUD refs are MES-111, `docs/prelaunch-audit.md`)
1. **Expensive endpoints with no rate limit** — `generate-plan` lets any authed user spam
   `claude-sonnet-4-6` calls (AUD-025); `knowledge-search` may fire paid embeddings for anon
   callers, unpinned + unlimited (AUD-030). Copy `generate-report`'s `checkRateLimit` pattern.
2. **Rate limiter fails open + spoofable IP key** (MES-35 S12; AUD-028) — throttle, not security.
3. **Missing `config.toml` blocks** — 5 functions have no `[functions.X]` entry, so their
   deployed `verify_jwt` depends on unsynced dashboard defaults (AUD-031). Ghost functions in
   CLAUDE.md too (AUD-048) — trust the directory + config.toml.
4. **Inconsistent hardening** — `escapeSlack` exists but untrusted intake still reaches Slack
   unescaped in `report-quality-rollup:98` / `slack-notify` (AUD-032); raw `error.message`
   returned to clients in several functions (AUD-029); `===` secret compares in six guards
   (MES-35 S13) — use `rq-slack-actions`' `timingSafeEqual`.
5. **No cost ceiling on generation** — free users trigger full-cost premium-section generation,
   5×/hour (MES-35 R5). Any new expensive path needs a tier/credit/budget decision up front.
