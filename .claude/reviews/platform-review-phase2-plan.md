# MES Platform Review — Phase 2: Findings Report & Prioritised Plan (2026-06-12)

> Companion to `platform-review-findings.md`. No changes made. Phase 3 implementation is approval-gated per finding ID.

## 1. Executive summary

Overall the platform is functionally mature with strong bones (good RLS *intent*, healthy Stripe/SSRF/PII patterns, rich content) but carries one exploitable revenue-bypass and a too-wide write-grant surface that the same bug rides on. Data is plentiful but visually thin (logos). Docs have drifted.

- **Area A — Schema & data model: C.** Sound core, but single-market assumptions, dead/duplicate tables, and missing country/SEO columns block rollout.
- **Area B — RLS & security: D.** SEC-01 (tier self-upgrade), SEC-02 (broad write grants), SEC-03 (anon foreign table) are serious; PII column-gating and chat scoping are done right.
- **Area C — Edge functions: B.** Well-structured, good guards; minor model-string duplication and `verify_jwt=false` surfaces to confirm.
- **Area D — Data quality: C.** Descriptions complete; logo coverage 71–100% missing across most directories; `needs_re_research` backlog.
- **Area E — Frontend: C+.** Solid React Query/auth patterns; localStorage-only gate, `as any` casts, hook duplication.
- **Area F — Auth/billing/email: C-.** Stripe happy-path only (no cancel/fail handling); combined with SEC-01, subscription state is unreliable both ways.
- **Area G — AI features: B-.** Report pipeline solid with PII obfuscation; chat is design-only.
- **Area H — Hygiene/ops: C.** PII CSVs in repo, stale CLAUDE.md, migration version reconciliation broken.

**Top 3 risks:** (1) SEC-01 paid-tier self-upgrade bypasses Stripe entirely; (2) SEC-03 anon-readable Notion foreign table ignores RLS; (3) BILL-01 cancellations/failed payments never downgrade tier.
**Top 3 quick wins:** (1) SEC-01 revoke `tier` UPDATE from anon/authenticated (S); (2) SEC-03 move `MES` foreign table out of `public` (S); (3) SEC-06 revoke anon EXECUTE on `has_role` (S).

## 2. Findings table

| ID | Area | Finding | Severity | Effort | Funnel risk | Content Studio risk | Recommendation |
|----|------|---------|----------|--------|-------------|--------------------|----------------|
| SEC-01 | B | Authenticated users can self-upgrade subscription `tier` (Stripe bypass) | Critical | S | No | No | Revoke `tier`/`user_id` UPDATE from anon+authenticated; service-role-only writes (or WITH CHECK forbidding elevation) |
| SEC-02 | B | anon/authenticated hold INSERT/UPDATE/DELETE/TRUNCATE on core tables | Critical | M | No | No | Revoke write privs from anon/authenticated; re-grant column-scoped only |
| SEC-03 | B | Notion-backed foreign table `public.MES` anon-readable/writable | Critical | S | No | No | Move FDW table to private schema; revoke anon/authenticated grants |
| SEC-04 | B | 8 always-true write policies; dead `market_entry_reports` anon INSERT | High | M | Yes (`user_usage`) | No | Add WITH CHECK/length caps; drop anon INSERT on dead table |
| SEC-05 | B/C | `generate-report`/`scrape-company` `verify_jwt=false` | High | M | No | No | Confirm in-body auth; require internal secret or rate-limit suffices |
| DATA-01 | D | Investors: 90% no logo, 45% no website | High | L | No | No | logo.dev + `enrich-investors` backfill, pilot first |
| DATA-02 | D | Logo coverage poor across directories (71–100% missing) | High | L | No | No | Batch logo.dev resolution by domain; triage `needs_re_research` |
| FE-01 | E | Freemium gate localStorage-only, bypassable | High | M | Yes | No | Document now; later enforce server-side per `session_id`, anon-safe |
| HYG-02 | H | PII-bearing investor/accelerator CSVs in repo root | High | M | No | No | Remove, gitignore, scrub history (with approval) |
| BILL-01 | F | Stripe webhook handles only `checkout.session.completed` | High | M | No | No | Add subscription.deleted / payment_failed / charge.failed handlers |
| SCHEMA-01 | A | No country/market dimension on directory tables | Medium | L | No | Yes | Add `country_iso2`/market col (trade_agencies model) before rollout |
| SCHEMA-02 | A | Country-page SEO columns absent | Medium | M | No | No | Defer to indexable layer; add seo_canonical_url/sitemap_priority then |
| SCHEMA-03 | A | Dead/duplicate tables (`market_entry_reports`,`Community`,`leads`) | Medium | S | No | Yes | Drop after confirming no FE/mes-context refs |
| PERF-01 | A | 73 RLS initplan re-evals, 10 unindexed FKs, dup/unused indexes | Medium | M | No | No | Wrap auth.uid()/has_role in subselect; add FK indexes; drop dup index |
| AI-01 | G | Hardcoded/duplicated AI model strings | Medium | S | No | No | Centralise in `_shared/models.ts` |
| AI-02 | G | `ai-chat` placeholder; homepage-chat unbuilt | Medium | L | No | No | Roadmap build, or remove placeholder |
| DOC-01 | H | CLAUDE.md stale (routes/functions/schema/env) | Medium | M | No | No | Refresh sections 3/4/5/11 to live state |
| FE-02 | E | `(supabase as any)` casts + ~60 duplicated fetch hooks | Medium | L | No | No | Regenerate types; extract `useFilteredTable()` |
| FE-03 | E | Half-built SEO inside non-crawlable SPA | Medium | M | No | No | Park; move to indexable v2 |
| BILL-02 | F | Legacy tier enum + hardcoded pricing/stats | Medium | M | No | No | Move pricing/stats to config table |
| SEC-06 | B | SECURITY DEFINER fns anon-executable; `has_role` via RPC | Low | S | No | No | Revoke anon EXECUTE on `has_role` |
| SEC-07 | B | Public buckets allow listing; auth hardening (OTP/leaked-pw/PG patch) | Low | S | No | No | Restrict bucket SELECT; enable protections; schedule PG upgrade |
| HYG-01 | H | Repo migrations not reconciled with live versions | Low | S | No | No | Treat live as source of truth; move combined SQL to scripts/ |
| HYG-03 | H | Signals worth automating | Low | M | No | No | Build schema-drift + data-quality + security-canary agents |
| DATA-03 | D | UK case studies already populated (status correction) | Low | S | No | No | Treat as UPDATE-by-content_id if rewriting |
| DATA-04 | D | `user_reports.feedback_score` uniformly -1 | Low | S | No | No | Verify writer; treat -1 as sentinel or fix |
| HYG-04 | H | Root-directory clutter | Low | M | No | No | Move audits to docs/, data to data/private/ |
| EF-01 | C | Edge-fn duplication; functions with no callers | Low | S | No | No | Move helpers to `_shared/`; add caller manifest |

## 3. Proposed fix sequence (batches, each sized for one CC session)

**Batch 1 — Security criticals (RLS/grants). Highest priority.**
- SEC-01, SEC-02, SEC-03, SEC-06.
- All are grant/policy/schema-placement changes via `apply_migration`.
- **Verification matrix required** (run after change): as **anon** — can still SELECT all funnel tables + `*_public` views; cannot SELECT `MES`; cannot UPDATE `user_subscriptions.tier`. As **authenticated (non-admin)** — cannot change own `tier`; cannot write directory tables; can still read own reports/subscription. As **service role** — Stripe webhook can still upsert `user_subscriptions`; enrichment can still write directory tables.
- **Content Studio canary:** after deploy, run `generate-content` on Content Studio against MES and confirm `mes-context` still resolves directory data.

**Batch 2 — Billing integrity.**
- BILL-01 (Stripe webhook handlers) + SEC-04 (tighten always-true write policies, drop dead-table anon INSERT). Deploy webhook via Supabase CLI. Pairs naturally with Batch 1 since both concern subscription state.

**Batch 3 — Edge-function & verify_jwt hardening.**
- SEC-05 (confirm/adjust `verify_jwt` + in-body auth), AI-01 (`_shared/models.ts`), EF-01 (shared helpers + manifest).

**Batch 4 — DB performance + dead-schema cleanup.**
- PERF-01 (initplan wrap, FK indexes, drop dup/unused indexes), SCHEMA-03 (drop dead tables after ref-check), SEC-07 (bucket/auth hardening). Pilot index changes; EXPLAIN before/after.

**Batch 5 — Data quality (pilot-before-fan-out).**
- DATA-02 then DATA-01 (logo + website enrichment): run 5–10 records, show results, await approval, then full set. DATA-04 (feedback writer check).

**Batch 6 — Docs, hygiene, repo.**
- DOC-01 (refresh CLAUDE.md), HYG-02 (CSV removal + history scrub — needs explicit approval for `filter-repo`), HYG-04 (reorg), HYG-01 (migration note), HYG-03 (stand up always-on agents).

**Batch 7 — Frontend debt.**
- FE-01 (server-side gate, funnel-safe), FE-02 (types + `useFilteredTable`), BILL-02 (pricing/stats to config).

## 4. Out of scope for fixes — feed to roadmap

- **Country/market rollout (SCHEMA-01):** add market dimension to directory tables — part of the multi-market workstream, not a defect fix.
- **Indexable SEO layer (SCHEMA-02, FE-03):** SSR/prerender + country SEO columns belong to the deferred v2 indexable layer; do not build SEO inside the SPA.
- **Homepage chat (AI-02):** build the single `homepage-chat` function with 9 tools and cookie-UUID sessions per design; DB scaffolding + RLS already exist.
- **`mes_knowledge_base` RAG layer:** content tables (`content_bodies`, case studies, `ii_*` already embedded) are clean enough to feed embeddings; investors/agencies need the logo/website cleanup (DATA-01/02) first.
- **Always-on agents (HYG-03):** schema-drift monitor, data-quality digest, security canary — net-new automation, scoped separately.
