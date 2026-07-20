---
name: report-generation-quality
description: The MES report pipeline as it actually runs, the section rubric, and the grounding/anti-hallucination rules (OWNED here — other skills link). Use before touching generate-report, report_templates, report content, or when writing/reviewing any report-like output.
---

Last verified: 2026-07-07

# Report Generation Quality

## Purpose
Keep AI market-entry reports grounded, complete, and tier-correct. A report's value is that every
provider, mentor, event, and figure is *real* — traceable to a directory row or a cited source.

## When to trigger / when NOT to
- **Trigger:** changes to `supabase/functions/generate-report/`, `report_templates`, section
  config; writing or reviewing report content; report-quality-loop work.
- **Don't trigger:** tier *access* questions (→ `freemium-tier-gating`), pipeline cost/infra
  conventions (→ `edge-functions-and-cost-controls`).

## Preconditions — inspect first
- `supabase/functions/generate-report/index.ts` (2,617 lines + 15 pure helper modules with
  colocated `*.test.ts`), `report_templates` rows (`is_active=true`),
  `src/components/report/reportSectionConfig.ts`, `report_quality` telemetry table.

## Pipeline reality (verified — differs from CLAUDE.md §7 in places)
- Auth: in-code JWT + intake-ownership check (`index.ts:2515-2546`); rate limit **5 reports/60min/
  user**; row pre-created `status:"processing"`; work runs in `EdgeRuntime.waitUntil`.
- Phase 1 one big `Promise.all`: Firecrawl company scrape (map+scrape, homepage retried once),
  6 parallel Perplexity queries (landscape=`sonar-pro`, rest `sonar`), DB directory matching,
  competitor/end-buyer research. Key metrics are **regex-extracted from the landscape answer**,
  not a separate call (L1864-1883).
- Sections generate in **a single parallel batch** (not batches of 3 — comment at L2195) via
  Lovable gateway, `google/gemini-3-flash-preview`, temp 0.4, prompt-budgeted "250–550 words,
  never exceed ~800" (no max_tokens by design, L950-954).
- Gated sections are generated for everyone and stored `visible:false` by tier (L2206-2248);
  per-section failure stores `{content:"", visible:false}` — a "completed" report can silently
  miss sections (L2252-2257).
- Save-then-polish: `status:"completed"` is written **before** the polish pass (45s + 1 retry,
  `polish_applied` recorded); failures set `user_reports.status="failed"` + intake `failed`.
- Telemetry: `FirecrawlStats` + `perplexity_health` persisted into `report_json.metadata` and
  mirrored to queryable columns; `report_quality` is the scoring system of record.

## Playbook — grounding rules (source of truth — link here, don't restate)
1. **Never invent providers, mentors, investors, events, or leads.** Every recommendation must map
   to a real row in `service_providers`, `community_members(_public)`, `investors_public`,
   `events`, `lead_databases` — cite the name exactly as stored. The enrichment corpus has already
   caught one fabricated organisation (`docs/trade-agencies-staging-review-2026-05-09.md`, "AMCC").
2. **Never invent figures.** Market sizes, growth rates, tariffs come from a cited research answer
   or a directory/metrics row (`country_trade_metrics`), or they don't appear. Prefer ranges +
   source-year over confident point numbers.
3. **One bad number propagates.** The single regex-parsed `key_metrics` set is broadcast to every
   section as canonical (MES-35 R11) — validate metrics before letting them fan out.
4. **Citations must bind to claims.** Dedup after `[N]` markers are embedded misaligns numbering
   (`docs/audits/AUDIT_REPORT_GENERATION.md` §5.3); when touching citations, renumber atomically.
5. **Respect user intent fields.** Intake fields have been collected-but-dead before
   (`target_market`, `revenue_stage`, buried `additional_notes` — AUDIT_REPORT_GENERATION §2);
   when adding intake fields, wire them into a template variable or don't collect them.

## Section rubric (self-review before shipping report output)
Per section: (a) answers its template's question for *this* company/corridor, not generic advice;
(b) every named entity resolves to a directory row; (c) every number has a source; (d) tier
visibility matches `TIER_REQUIREMENTS`; (e) 200–450 words (hard cap ~550); (f) Australian English;
(g) actionable next step present (esp. `action_plan`). Cross-report: no section contradicts another
(polish pass exists for this; don't rely on it — it's best-effort with a timeout).

## Prose style — the writing system (report output)
Reports must read as consultant-grade prose, not AI boilerplate. Enforced in the section-writer
system prompt (`generate-report/index.ts`, the PRESENTATION & FORMATTING block, ~L3369-3374); apply
the same rules when hand-writing or reviewing report content.
- **Plain English (Orwell, 1946):** short word over the long one; cut any word that can go; active
  voice ("Austrade runs the program", not "the program is run by Austrade"); no stale metaphors or
  business clichés. Keep regulatory/technical terms (ASIC, AFSL, ABN, GST, R&D) where an everyday
  word loses precision. Break a rule sooner than write an awkward sentence.
- **Signal density:** open each subsection with its most decision-relevant fact — a figure, a named
  entity, a date, a dollar amount — not a framing sentence. Cut hedging ("it is important to note",
  "in today's competitive landscape") and puffery adjectives ("comprehensive", "robust", "seamless",
  "world-class", "cutting-edge").
- **Swap test:** rewrite or delete any sentence a *different company* could paste unchanged into
  their own report. Every sentence must carry a concrete fact, figure, or specific action for THIS
  company.
- **Grounding always wins:** "prefer numbers over adjectives" means *sourced* numbers — a figure
  without a source does not appear (Playbook rule 2), and brevity cuts filler, never citations or
  entity links.

## Red flags / approval gates
- New/renamed section → update **four** places together: frontend `SECTION_ORDER`+`TIER_REQUIREMENTS`,
  DB `report_templates`, the quality-loop `rubric.ts`, AND the `get_tier_gated_report` RPC's
  hardcoded `v_tier_requirements` (the server-side strip point — miss it and gated prose leaks to
  free/anon; MES-35 R12, extended by the 2026-07-07 exam dry-run). Gating in the pipeline itself is
  generic on `visibility_tier` — no `generate-report` code change needed.
- Prompt changes that remove grounding instructions or citation requirements.
- Anything increasing per-report external calls → cost gate in `edge-functions-and-cost-controls`.

## Good / bad examples
- ✅ "Engage [provider name from `service_providers` row] for entity setup; see their profile at
  /service-providers/<slug>." — entity, slug, and claim all traceable.
- ❌ "Australia's medtech market is worth $8.2B" with no citation — and if it came from
  `key_metrics`, it's now in six sections and a stat card.
- ❌ Recommending "KPMG Australia" because the model knows it exists — it must be in the directory
  or it doesn't get recommended.

## Self-check rubric (pass/fail)
- [ ] Zero hallucinated entities: every provider/mentor/investor/event checked against its table.
- [ ] Zero uncited figures; key_metrics validated before fan-out.
- [ ] Section-truth triple updated together; tier visibility verified for a free + a growth user.
- [ ] Failure paths preserved: per-section failure → `visible:false`; run failure → `status:"failed"`.
- [ ] Rubric (a)-(g) passes on sampled output; grade with `qa-and-exam` baselines before shipping.

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` (AUD-### findings folded in 2026-07-07).
Inspected 2026-07-07: `supabase/functions/generate-report/index.ts` (L299-311, 659-798, 955-988,
1786-2617), `src/components/report/reportSectionConfig.ts:101-124`, `src/lib/api/reportApi.ts`,
live tables `report_templates` (10 rows), `report_quality`, `user_reports`. Audits:
`docs/audits/AUDIT_REPORT_GENERATION.md`, `docs/audits/MES-35-platform-readiness-scan.md`
R3/R11/R12, `docs/trade-agencies-staging-review-2026-05-09.md`.

## Common MES pitfalls (real)
0. Context: MES-111 (`docs/prelaunch-audit.md` §9) verified the pipeline's auth/ownership, SSRF
   guards, sanitisation, and server-trusted tier as CLEAN — don't "fix" those; the open issues
   are the ones below.
1. **Stuck-`processing` orphans** — isolate death leaves rows processing forever AND the
   duplicate guard then blocks that intake from ever regenerating; no reaper (MES-35 R3;
   MES-111 AUD-027). Don't add long pre-save steps without a failure path.
2. **Canonical-metric amplification** — one hallucinated Perplexity number became "consistently
   wrong everywhere" (MES-35 R11).
3. **Silently incomplete "completed" reports** — per-section failures don't fail the run (R3/§6).
4. **Dead intake fields** wasting user trust (AUDIT_REPORT_GENERATION §2.1-2.2).
5. **Matching that never matches** — checkbox label text compared via `.cs.{}` against service
   tags; leads `ilike` fuzz ("AI" ↔ "Airlines") (AUDIT_REPORT_GENERATION §6.3.1). Test matching
   changes against real rows.
