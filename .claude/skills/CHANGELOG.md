# Skills Library Changelog

Log every skill gap, wrong rule, or contradiction you find here (newest first), so it can be
fixed in a follow-up PR. Format: `- YYYY-MM-DD [skill-name] what was wrong/missing — found while <task>`.

## 2026-07-07 — Wave 2 (MES-113): 8 P1 skills

Added the 8 P1 skills, grounded in fresh read-only repo/schema inspection (two research passes on
SEO/rendering and admin/enrichment, plus the earlier edge-function/audit analysis):
`observability-logging-and-cost-attribution` (now the source of truth for logging/cost — the
README pointer and `edge-functions-and-cost-controls` defer to it),
`post-payment-activation-and-entitlements-ux`, `seo-rendering-indexing-and-programmatic-pages`,
`directory-data-enrichment`, `mes-ticket-workflow`, `admin-submissions-and-moderation-workflows`,
`slack-notifications-and-ops-triage`, `launch-readiness-and-production-audits`.

- Grounded in MES-111 findings (AUD-004/005/006/011/028/029/032/037/046/051) plus the SEO,
  submission-forms, and staging-review docs.
- Noted current-state corrections the SEO agent surfaced: several 2026-07-04 SEO-audit issues are
  already fixed (static homepage canonical removed, DB-driven sitemap live, `llms.txt` v2) — the
  skill tells models to verify before "re-fixing" them.
- Flagged a live inconsistency (not a change): `enrich-*` functions write directly to live tables
  despite staging tables existing — documented as tolerated fill-missing, not a bulk-import licence.

## 2026-07-07 — MES-111 audit findings folded into Wave 1

`docs/prelaunch-audit.md` (MES-111, PR #309) landed — 0 P0, 5 P1, 18 P2, 22 P3. Its findings were
merged into the Wave 1 skills' pitfalls, drills, and matrices (AUD-### refs), before Wave 1 merge:

- `stripe-payments-and-webhooks`: AUD-005 (lead-purchase paywall bypass — pay lead price, get
  `enterprise`), AUD-006/008 (missing `lead_database_purchases` table + swallowed failure),
  AUD-007 (dedupe-before-processing), AUD-009 (paid amount never validated against tier).
- `freemium-tier-gating`: AUD-004 (`fetchMyReports` `select('*')` leak), AUD-001/035 (lead records
  + cosmetic masking), AUD-034 (localStorage gate); marked the `get_tier_gated_report` RPC path
  verified-clean per MES-111 §7.
- `supabase-rls-and-migrations`: AUD-002/020 (authenticated PII on investors/agency contacts),
  AUD-003 (`ingest_state` RLS off + anon writes), AUD-006 (re-baseline dropped archived schema →
  live DB is the source of truth, not migration files).
- `edge-functions-and-cost-controls`: AUD-025/030 (unrate-limited paid LLM/embedding endpoints),
  AUD-028 (fail-open limiter), AUD-029 (raw errors to client), AUD-031 (5 functions missing
  config.toml blocks), AUD-032 (Slack injection), AUD-048 (ghost functions).
- `report-generation-quality`: AUD-027 (stuck-`processing` reaper + regen block); noted §9
  verified-clean areas so models don't "fix" what's already correct.
- `mes-codebase-conventions`: AUD-051 (lint exits red on ~437 pre-existing `no-explicit-any`) — bar
  is now "no NEW lint errors"; AUD-053 (`.env` tracked in git).
- `qa-and-exam`: drills retargeted to the current open findings; MES-111 §13 manual checklist +
  §14 launch-day smoke test named as canonical; RLS baseline artifact retargeted to AUD-003.

MES-111 also confirms much of the platform verified-CLEAN (anon lockdown holds, report-view RPC
path strips gated content, Stripe signature verification correct, generate-report auth/ownership/
SSRF correct) — the skills point at the *open* issues, not the fixed ones.

## 2026-07-07 — Wave 1 (MES-113)

- Initial release: 8 P0 skills + index + exam baselines, authored by Fable from live repo/schema
  inspection (see each skill's Evidence section).
- Known caveat (RESOLVED same day — see entry above): the MES-111 pre-launch audit report had not
  landed at authoring time. Pitfalls were grounded in the existing audits under `docs/audits/` and
  `docs/migrations.md`; MES-111 findings were folded in once it landed.
- Corrections to root `CLAUDE.md` discovered during authoring (root doc not modified beyond the
  skills pointer; trust the skills where they conflict): report sections now generate in a single
  parallel batch, not batches of 3 (`supabase/functions/generate-report/index.ts:2195`);
  `apify-webhook` and `notion-research-trigger` edge functions no longer exist; `generate-plan`
  calls Anthropic only (no Perplexity); route map omits `/market-entry-questions`,
  `/reset-password`, `/admin/mentors`; `reportSectionConfig.ts` also defines
  `investor_recommendations` (growth) and `setup_compliance` sections.
