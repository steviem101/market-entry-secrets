# MES Claude Code Skills Library

Reviewed operating knowledge for working on Market Entry Secrets (MES-113). These skills exist so
that **any** Claude model (especially Opus) delivers MES work — research, reports, content, data,
code — at the same quality and safety level, without re-learning conventions each session.

**Read-first order** (before your first MES task, read at least 1–3):

1. `mes-codebase-conventions` — repo map, stack rules, verified conventions. Always read first.
2. `supabase-rls-and-migrations` — before touching schema, policies, or any migration.
3. `secrets-and-env-management` — before touching env vars, keys, or anything credential-shaped.
4. `freemium-tier-gating` — before touching gated content, tiers, or conversion surfaces.
5. `stripe-payments-and-webhooks` — before touching checkout, webhooks, or entitlements.
6. `report-generation-quality` — before touching the report pipeline or writing report content.
7. `edge-functions-and-cost-controls` — before writing/modifying any edge function.
8. `qa-and-exam` — before shipping: grade your output against the baselines and rubric.

## Skill index

| Skill | Tier | Status | One-liner |
|---|---|---|---|
| `mes-codebase-conventions` | P0 | ✅ Wave 1 | Repo map and stack rules; the "read this first" skill |
| `supabase-rls-and-migrations` | P0 | ✅ Wave 1 | Safe RLS patterns and the fragile migration ledger |
| `secrets-and-env-management` | P0 | ✅ Wave 1 | Where secrets live; what must never reach the client or git |
| `freemium-tier-gating` | P0 | ✅ Wave 1 | The tier matrix and server-side gating enforcement |
| `stripe-payments-and-webhooks` | P0 | ✅ Wave 1 | Checkout/webhook conventions; **owns entitlement invariants** |
| `report-generation-quality` | P0 | ✅ Wave 1 | Report rubric; **owns anti-hallucination/grounding rules** |
| `edge-functions-and-cost-controls` | P0 | ✅ Wave 1 | Edge function conventions, LLM cost caps, idempotency |
| `qa-and-exam` | P0 | ✅ Wave 1 | Exam scenarios, Fable baselines, pass/fail scoring rubric |
| `observability-logging-and-cost-attribution` | P1 | ✅ Wave 2 | Structured logging, correlation ids; **owns logging/cost-attribution rules** |
| `post-payment-activation-and-entitlements-ux` | P1 | ✅ Wave 2 | Post-redirect polling, webhook-delay races, no silent re-paywall |
| `seo-rendering-indexing-and-programmatic-pages` | P1 | ✅ Wave 2 | Prerender-as-anon, sitemaps, canonicals, soft-404 guardrails |
| `directory-data-enrichment` | P1 | ✅ Wave 2 | Staging/proposal-first writes, confidence gates, taxonomy |
| `mes-ticket-workflow` | P1 | ✅ Wave 2 | Gate stages, branch naming, approval gates, Notion updates |
| `admin-submissions-and-moderation-workflows` | P1 | ✅ Wave 2 | Submission funnels, CHECK constraint, safe admin write paths |
| `slack-notifications-and-ops-triage` | P1 | ✅ Wave 2 | Slack signing, escaping, routing, idempotent delivery, RQ triage |
| `launch-readiness-and-production-audits` | P1 | ✅ Wave 2 | Repeatable production-readiness audit method + ticketing |
| `market-entry-research` | P2 | Wave 3 | Grounded ANZ research method |
| `content-and-vendor-copy` | P2 | Wave 3 | House style, CTA system, mentor anonymity model |
| `content-freshness-and-seo-ops-loop` | P2 | Wave 3 | Expiring events, stale-content detection |
| `mcp-integration-and-capability-boundaries` | P2 | Wave 3 | Secure MCP design, prompt-injection handling |
| `support-crisp-and-user-debug-tooling` | P3 | Wave 3 | Crisp integration and support workflows |
| `market-entry-secrets-insights` | P3 | Wave 3 | What makes a genuine MES "secret" |

## Source-of-truth boundaries

One skill owns each cross-cutting topic; others must **link, not restate**:

- Entitlement invariants → `stripe-payments-and-webhooks`
- Secret handling → `secrets-and-env-management`
- Anti-hallucination / grounding → `report-generation-quality`
- Logging / cost attribution → `observability-logging-and-cost-attribution`

## Keeping the library honest

- Every skill has a `Last verified:` date and an Evidence section citing real files/tables.
  If the repo or schema has changed materially since that date, re-verify before trusting a rule.
- Found a gap, a wrong rule, or a contradiction? Log it in `.claude/skills/CHANGELOG.md` (or the
  PR description) so it gets fixed in a follow-up PR. A single wrong rule erodes the whole library.
- Notion sources of truth: [MES Ticket Writing Context](https://app.notion.com/p/95be3b3db0d3427295fba8664011d7ad)
  (ticket structure, risk flags, status workflow). Skills encode operational rules only — link,
  don't duplicate.
- Launch-readiness source of truth: `docs/prelaunch-audit.md` (MES-111) — its §13 manual checklist
  and §14 launch-day smoke test are canonical; skills cite its AUD-### findings as live pitfalls.
