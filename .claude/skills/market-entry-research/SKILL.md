---
name: market-entry-research
description: Grounded ANZ market-entry research method — sector/corridor framing, SWOT/TAM standards, source hierarchy, and tracing every claim to a directory record or cited source. Use when producing market research, competitor/landscape analysis, or the research inputs to a report.
---

Last verified: 2026-07-07

# Market Entry Research

## Purpose
Produce ANZ (Australia/New Zealand) market-entry research that is grounded, corridor-specific, and
traceable — never plausible-sounding invention. This is the research method; report structure and
the anti-hallucination rules are **owned by `report-generation-quality`** (link, don't restate).

## When to trigger / when NOT to
- **Trigger:** market landscape/competitor/regulatory research; SWOT/TAM sizing; the Perplexity/
  Firecrawl research inputs feeding a report or plan.
- **Don't trigger:** the report section rubric or storage pipeline (→ `report-generation-quality`);
  distilling proprietary insight content (→ `market-entry-secrets-insights`).

## Preconditions — inspect first
- How the pipeline already researches: `supabase/functions/generate-report/index.ts`
  (`runMarketResearch` 6 parallel Perplexity queries, `sonar-pro` for landscape / `sonar` for the
  rest; key metrics regex-extracted from the landscape answer). The MES directory tables you must
  ground recommendations against (service_providers, community_members_public, investors_public,
  events, lead_databases, trade_investment_agencies, innovation_ecosystem).

## Framing (do this first)
1. **Sector × corridor, not generic.** Frame every question as "{company's sector} entering
   Australia from {origin country}" — the pipeline's persona/corridor framing was once cosmetic
   ("trade relationship between Australia and Australia" — AUDIT_REPORT_GENERATION §5.3); make the
   corridor real in each query.
2. **Anchor to the company's actual profile** (from intake + company scrape), not a generic entrant.

## Source hierarchy (highest to lowest)
1. MES directory/metrics rows (a named provider/mentor/event/`country_trade_metrics` figure).
2. A cited Perplexity/`sonar-pro` research answer with a source.
3. Firecrawl-scraped primary pages (company/competitor/agency sites), sanitised.
4. General model knowledge — **only** for framing/structure, never for named entities or figures.

## Playbook
1. **SWOT:** each quadrant must be specific to this company/corridor and each point traceable to a
   source or the company profile — not boilerplate. (The `qa-and-exam` tier-gated section baseline
   is a model of grounded SWOT.)
2. **TAM/market sizing:** prefer a cited range + source-year over a confident point number; if the
   research phase returns no citable figure, **say so and omit it** — do not fabricate. One
   unsourced number becomes canonical and wrong everywhere (`report-generation-quality`, MES-35 R11).
3. **Never invent entities.** Every provider/mentor/investor/event/competitor named must resolve to
   a directory row (grounding rules owned by `report-generation-quality`). Web-searched competitors
   are fine as *market context* but flag them as external, don't present them as MES matches.
4. **Regulatory/cost claims:** attribute to a source (Austrade/state agency/`country_*` content);
   Australian specifics (Privacy Act/APPs, visa classes, state incentives) over generic advice.
5. **Citations bind to claims.** Keep `[N]` markers aligned with their sources — dedup after
   embedding misaligns numbering (AUDIT_REPORT_GENERATION §5.3).
6. **Australian English** throughout (see `mes-codebase-conventions`).

## Red flags / approval gates
- A market figure with no source; a named firm not in the directory presented as a recommendation.
- Generic "Australia is an attractive market" filler with no corridor/sector specificity.
- Reusing another company's research verbatim (each report is company-specific).

## Good / bad examples
- ✅ "Per Austrade's [year] fintech report [1], the segment grew ~X%; MES directory provider
  **[real name]** (Sydney, NSW) covers AFSL licensing — see Service Providers."
- ❌ "The Australian market is worth $12B and growing fast." — no source, no corridor.
- ❌ "Consider engaging King & Wood Mallesons." — real firm, but not an MES directory row → for
  MES purposes it's a hallucinated recommendation.

## Self-check rubric (pass/fail)
- [ ] Every question framed sector × corridor, anchored to the company profile.
- [ ] Every figure cited (range + year) or explicitly omitted; no invented numbers.
- [ ] Every recommended entity resolves to a directory row; external context flagged as external.
- [ ] Regulatory/cost claims sourced; Australian specifics used.
- [ ] Citations aligned to claims; Australian English.

## Evidence
Inspected 2026-07-07: `supabase/functions/generate-report/index.ts` (`runMarketResearch` 6 parallel
Perplexity queries L788-798, `callPerplexity` L659-708, key-metrics regex L1864-1883). Live tables
`country_trade_metrics` (30), directory tables. Audits: `docs/audits/AUDIT_REPORT_GENERATION.md`
§5.3 (cosmetic persona, citation misalignment), `docs/audits/MES-35-platform-readiness-scan.md` R11
(canonical-metric amplification). Owns nothing cross-cutting — defers to `report-generation-quality`
(grounding), `market-entry-secrets-insights` (distilled insight content).

## Common MES pitfalls (real)
1. **Corridor collapse** — persona/corridor was cosmetic, producing "Australia→Australia" queries
   (AUDIT_REPORT_GENERATION §5.3). Make the corridor real per query.
2. **Uncited canonical figure** — one regex-parsed market number fans out to every section as
   "CANONICAL MARKET FIGURES" (MES-35 R11); validate before it propagates.
3. **Known-firm hallucination** — recommending a real-world firm that isn't an MES directory row.
4. **Citation drift** — dedup after `[N]` markers misaligns references (AUDIT_REPORT_GENERATION §5.3).
