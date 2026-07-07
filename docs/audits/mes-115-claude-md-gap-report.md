# MES-115 — CLAUDE.md gap report

**Date:** 2026-07-07 · **Branch:** `claude/mes-115-claude-md-refresh-8qjoiy` · **Ticket:** MES-115

Audit of the previous root `CLAUDE.md` against the repo at `main` (commit `6be24ab`). Every
finding below was verified by inspecting the cited file(s); nothing is inferred from memory.
The rewritten `CLAUDE.md` fixes all items marked **wrong**/**stale**, adds the **missing**
items, and compresses the **redundant** ones per the content-ownership rule (orientation in
`CLAUDE.md`, procedures in `.claude/skills/`, evidence in `docs/`).

## 1. Wrong (factually incorrect on main)

| # | Old claim | Reality | Evidence |
|---|-----------|---------|----------|
| W1 | §2.2/§4/§12: `user_intake_forms` and `user_reports` are "NOT in the auto-generated types — always cast `(supabase as any)`" | Both tables **are** in the generated types now. The cast still exists in `src/lib/api/reportApi.ts` (10×) as legacy pattern, but the stated reason is false | `src/integrations/supabase/types.ts:4675,4777` |
| W2 | §5: edge functions `apify-webhook` and `notion-research-trigger` exist | Neither directory exists (also confirmed by MES-111 AUD-048) | `ls supabase/functions/` |
| W3 | §7 Phase 1: "Key Metrics Extraction — Perplexity structured output" as a separate parallel call | Key metrics are regex-extracted from the landscape research answer, not a separate call | `.claude/skills/report-generation-quality` (index.ts L1864-1883) |
| W4 | §7 Phase 3: sections "generated in batches of 3" | Sections generate in a **single parallel batch** | `.claude/skills/report-generation-quality` (index.ts L2195) |
| W5 | §7: tier gating is frontend-only — "content is already in the JSON, just marked `visible: false`" | Gated content is **stripped server-side** by the `get_tier_gated_report` SECURITY DEFINER RPC before it reaches the client; the RPC's hardcoded `v_tier_requirements` is the security-critical 4th place section/tier truth lives | `src/lib/api/reportApi.ts:137,184`; baseline migration L680; `.claude/skills/CHANGELOG.md` 2026-07-07 entry |
| W6 | §7: 8 report sections ending at `lead_list` | 10 sections — adds `investor_recommendations` (growth) and `setup_compliance` (free) | `src/components/report/reportSectionConfig.ts:101-116` |
| W7 | §11: `ALLOWED_ORIGINS` env secret drives CORS | No code reads `ALLOWED_ORIGINS`; the allowlist is hardcoded in `_shared/http.ts` plus `FRONTEND_URL` | `supabase/functions/_shared/http.ts:3-8`; repo-wide `Deno.env.get` grep |
| W8 | §5: Phase 5 saves report then done | Save-then-polish: `status:"completed"` is written **before** the polish pass (best-effort, 45s + 1 retry) | `.claude/skills/report-generation-quality` |

## 2. Stale (was true, has moved on)

| # | Item | Now | Evidence |
|---|------|-----|----------|
| S1 | §3 route map missing routes | `/market-entry-questions`, `/reset-password`, `/admin/mentors`, and the `/planner` → `/report-creator` redirect all exist | `src/App.tsx:129,138,143,145` |
| S2 | §3: `/report-creator` described as "3-step AI report intake wizard" | Intake **v2** is the default (`report_creator_v2` flag, `defaultValue: true`; `?v2=0` opts back to the legacy 3-step form) | `src/lib/featureFlags.ts:25-29`, `src/pages/ReportCreator.tsx:167` |
| S3 | §5 function inventory missing 9 live functions | `sitemap`, `slack-notify`, `embed-knowledge`, `knowledge-search`, `kb-sync`, `mcp`, `ingest-events`, `normalize-events`, `admin-mentor-anonymity` all exist on main | `ls supabase/functions/`; `supabase/config.toml` |
| S4 | §11 secrets list incomplete | Missing: `OPENAI_API_KEY`, `APIFY_TOKEN`/`APIFY_API_TOKEN`, `EVENTS_WEBHOOK_SECRET`, `SLACK_ALERTS_WEBHOOK`, `SLACK_EVENTS_WEBHOOK`, `FIRECRAWL_CACHE_ENABLED`, `FIRECRAWL_COMPETITOR_DEPTH`, `MATCH_RERANK_ENABLED` | repo-wide `Deno.env.get` grep |
| S5 | §4 schema missing the RAG layer and newer tables | `mes_knowledge_base`, `knowledge_embed_log`, canonical sector reference (MES-110), profiles onboarding columns | `docs/mes-knowledge-base-rag.md`; `supabase/migrations/20260707141000_add_canonical_sector_reference.sql`, `20260704191000` |
| S6 | §4: "investors (447 rows)" | Row count unverifiable from the repo and certain to drift — removed | — |
| S7 | No deployment story for edge functions | A GitHub Action auto-deploys `generate-report`, `scrape-company`, `sitemap`, `generate-plan`, `admin-mentor-anonymity` + `_shared` on push to main; other functions deploy manually | `.github/workflows/deploy-edge-functions.yml` |
| S8 | No mention that `supabase/config.toml` now owns auth config | Version-controlled auth block (site_url, redirect allowlist, OTP expiry — MES-33) must be kept in lockstep with the dashboard | `supabase/config.toml` `[auth]` |

## 3. Missing (merged work with no coverage)

| # | Item | Evidence |
|---|------|----------|
| M1 | Dual-persona model — `PersonaContext` (`international_entrant` \| `local_startup`), persona-aware homepage/directories | `src/contexts/PersonaContext.tsx`, `src/components/PersonaFilter.tsx` |
| M2 | Crisp chat widget (anonymous by design), loaded in `index.html` | `index.html` Crisp loader; skill `support-crisp-and-user-debug-tooling` |
| M3 | DB-driven sitemap edge function + robots.txt posture (AI crawlers default-allowed, MES-79/81/82) | `supabase/functions/sitemap/index.ts`, `public/robots.txt`, `docs/audits/seo-discoverability-audit-2026-07-04.md` |
| M4 | RAG / knowledge layer: `mes_knowledge_base` + `embed-knowledge` cron + `knowledge-search` + `kb-sync` (cross-project read from Content Creator) | `docs/mes-knowledge-base-rag.md`; the four function dirs |
| M5 | MCP server for external agents, auto-generated from `src/lib/mcp/` by `@lovable.dev/mcp-js` | `supabase/functions/mcp/index.ts` banner; skill `mcp-integration-and-capability-boundaries` |
| M6 | Events ingest pipeline: `ingest-events` (Apify actors, `x-webhook-secret`) → `normalize-events` (Claude Haiku classifier, service-role internal) | both function dirs |
| M7 | Directory/filter standardisation: `DirectoryFilterBar` + `useDirectoryFilters` + pure tested `src/lib/*Filters.ts` modules; `ListingPageGate` | `src/components/common/DirectoryFilterBar.tsx`, 12+ `src/lib/*Filters.test.ts` |
| M8 | Sector taxonomy standardisation (MES-110): canonical sector reference + backfill | migrations `20260707141000`, `20260707190000`; `docs/audits/mes-110-sector-taxonomy-audit.md` |
| M9 | Skills library (MES-113) — old file had one pointer line; new file makes it the read-first layer and defers procedures to it | `.claude/skills/README.md` (22 skills, Waves 1–3 merged) |
| M10 | Workflow rules: gate stages, branch naming `mes-<id>-<slug>`, `Closes MES-<id>`, approval-gated categories, Notion ticket upkeep | skill `mes-ticket-workflow` |
| M11 | Testing/verification reality: `npm test` (Node runner, no vitest/jest/DOM tests), typecheck + build gates, known lint debt | `package.json:11`; skill `mes-codebase-conventions` |
| M12 | Key audit corpus pointers: `docs/prelaunch-audit.md` (MES-111, canonical launch checklist), `docs/audits/MES-35-*`, homepage audit, `docs/migrations.md`, runbooks | `docs/` tree |
| M13 | Mentor anonymity model + `admin-mentor-anonymity` function + `/admin/mentors` | `docs/audits/mentor-anonymization-audit-2026-07-06.md` |
| M14 | Feature-flag convention (URL query + localStorage, because no `VITE_*`) | `src/lib/featureFlags.ts` |
| M15 | Australian English UI copy rule | skill `mes-codebase-conventions` §6 |

## 4. Redundant / misplaced (moved or compressed per ownership rule)

- §9 coding conventions and much of §10 security duplicated what `mes-codebase-conventions`,
  `supabase-rls-and-migrations`, and `secrets-and-env-management` now own with citations — the
  rewrite keeps one-line invariants and links out.
- §7's phase-by-phase pipeline narrative duplicated (and contradicted) `report-generation-quality`,
  which owns pipeline truth — compressed to a summary + link.
- The full 40-row route table was kept but tightened; detail-page rows folded into their parents.

## 5. Ground-truth checklist status (from the ticket)

| Item | Status | Evidence |
|------|--------|----------|
| Platform readiness scan (PR #260) + security/data audit | ✅ merged, now linked | `docs/audits/MES-35-platform-readiness-scan.md`, `docs/audits/MES-35-security-data-audit.md` |
| SEO audit + DB-driven sitemap + robots update | ✅ merged, now covered | `supabase/functions/sitemap/`, `public/robots.txt`, `docs/audits/seo-discoverability-audit-2026-07-04.md` |
| Homepage design & CTA audit artefacts | ✅ merged, now linked | `docs/audits/homepage-audit.md`, `docs/audits/homepage-audit/` |
| Report-quality improvement loop | ✅ merged, was already covered; retained | `supabase/functions/report-quality-loop/` |
| `.claude/skills/` library (MES-113) | ✅ all 22 skills live on main (Waves 1–3) | `.claude/skills/README.md` |
| Directory card/CTA + filter/taxonomy standardisation | ✅ merged, now covered (M7/M8) | see above |
| Crisp chat integration | ✅ merged, now covered | `index.html` |
| Leads API integrations | ⚠️ **not found on main** as a distinct feature. Closest merged work: `sync-lemlist` (CRM sync), the `lead_databases`/`lead_database_records` marketplace, and Apify-driven `ingest-events`. Treated as in-progress/not-merged; not stated as fact in `CLAUDE.md` | repo-wide search |

Note: the ticket's background names a report pipeline of "enrich-intake → search-matches →
generate-report". No `enrich-intake` or `search-matches` functions exist on main; the pipeline is
`scrape-company` (intake prefill) + `generate-report` (everything else, incl. directory matching).
`CLAUDE.md` documents the verified shape.

## 6. Sibling context files

- `README.md` — Lovable boilerplate; generic but not contradictory. Left as-is (flagged for an
  optional future rewrite; out of MES-115 scope).
- `PLAN.md` (repo root) — a hero-stats redesign working plan, not repo context. Not contradictory
  but misplaced at root; flagged, left untouched (recent hero commits suggest it is active).
- `docs/redesign/handoff/CLAUDE.md` — an intake-v2 handoff draft whose header says "drop this at
  the root of the repo". Copying it to root today would **destroy** the maintained root file. A
  superseded-notice banner was added (doc-only fix); content otherwise untouched.
- No `AGENTS.md` or `.cursorrules` exist.

## 7. Structure recommendation (implemented)

**Single root `CLAUDE.md` + the existing `.claude/skills/` library; no nested `CLAUDE.md` files.**
Rationale: the skills library already serves the "scoped deep context" role with per-topic
ownership, evidence citations, and a changelog — a `supabase/functions/CLAUDE.md` would duplicate
`edge-functions-and-cost-controls` and create a third source of truth to drift. `@file` imports
were rejected for the same reason: they would inline skill content into every session's context,
defeating the on-demand design. The root file stays within the ~250–400-line budget and links out.
