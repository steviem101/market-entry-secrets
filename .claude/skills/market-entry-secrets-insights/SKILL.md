---
name: market-entry-secrets-insights
description: What makes a genuine MES "secret" — proprietary, actionable ANZ market-entry insights distilled from directory data, report telemetry, and case studies that generic research can't replicate. Use when creating insight/playbook content or deciding whether something clears the "secret" bar.
---

Last verified: 2026-07-07

# Market Entry Secrets — Insights

## Purpose
Define and produce the platform's differentiated content: corridor-specific, evidenced,
actionable playbooks that a generic LLM or a Google search cannot reproduce — because they're
distilled from MES's own directory, telemetry, and sourced case studies.

## When to trigger / when NOT to
- **Trigger:** authoring country playbooks/funding pathways, insight articles, "secret"-style
  content; judging whether a claim clears the bar.
- **Don't trigger:** the raw research method (→ `market-entry-research`); per-report generation
  (→ `report-generation-quality`); copy style/CTAs (→ `content-and-vendor-copy`). Grounding rules
  are owned by `report-generation-quality` — every rule here inherits "trace to a record."

## Preconditions — inspect first
The real material below and how it renders: `src/pages/CountryPage.tsx`,
`src/lib/countryPageContent.ts`, the `country_*` tables, `case_study_sources`/`case_study_quotes`,
and (aggregate, no PII) `report_quality` / `user_intake_forms.country_of_origin`.

## What makes a genuine MES secret
Proprietary + specific + actionable + **evidenced**. Not "Australia has a strong tech sector"
(generic), but "UK→AU SaaS: claim the R&D Tax Incentive (43.5% refundable under A$20M turnover)
in stage 2, then EMDG (up to A$770k/8yr) once exporting" — corridor-specific, cited, sequenced.
Every secret must trace to a specific MES row or a sourced case study; if it can't, it's generic
research, not a secret.

## The real material to distil (verified — cite these)
1. **Country playbooks** (`country_playbook_stages`, 30 rows; `/countries/:slug` → `CountryPlaybook`):
   6-stage, time-boxed corridor plans (UK→AU: Validate 0-2mo → Structure → Land → Hire → Sell →
   Scale Y2+) with 4-7 opinionated sub-steps each. The definitional secret shape.
2. **Corridor funding instruments** (`country_funding_instruments`, 50 rows, `origin`/`destination`
   split): distilled, cited, actionable — R&D Tax Incentive, EMDG, state grants (NSW Going Global,
   Vic Global Growth), named AU VC funds (Blackbird, AirTree, Square Peg), UKEF.
3. **Sourced case-study corpus** (`case_study_sources` 631, `case_study_quotes` 118,
   `content_company_profiles` 102, 102 published case studies): real named ANZ entrants with
   attribution — the evidence base that makes an insight defensible.
4. **Demand telemetry → content-gap secret** (`user_intake_forms.country_of_origin`: Ireland 33,
   Singapore 31, Japan 12, South Korea 4): the true top corridors. Cross-referenced with country-page
   completeness, Japan & South Korea are **FAQ-only** (no playbook/funding) — an evidenced
   "demand outruns our content" insight and a real gap to name, not paper over.
5. **Report meta-telemetry** (`report_quality.match_counts/tables_hit/rag_hit_rate/utilization`,
   28 rows; `user_reports.report_json.matches`, 78 rows; tier mix scale 52/79): which directory
   tables actually surface in reports and where coverage is thin — a proprietary "what our data is
   good/bad at" insight (no PII; aggregate only).

## Playbook
1. Pick a corridor (origin→ANZ) and anchor to the real material above; if a country has no
   playbook/funding rows (Japan, South Korea, France are FAQ-only), say the coverage is thin —
   don't invent stages.
2. Every claim traces to a row (`country_*`, directory) or a `case_study_sources` citation. Numbers
   get a source + year; unsourced ⇒ omit (inherits `report-generation-quality` grounding).
3. Sequence and make it actionable — stages/time-boxes/named instruments, not adjectives.
4. Distil telemetry honestly: aggregate, no PII (never a company name from an intake row); a
   content-gap or low-`utilization` finding is a legitimate secret.
5. Format to the platform: country blocks render via `CountryPlaybook`/`CountryFundingPathways`/
   `CountryCaseStudies` under `FreemiumGate` — respect tier gating (`freemium-tier-gating`).

## Red flags / approval gates
- Any "secret" that's actually generic advice, or a figure/entity with no MES row / case-study
  source behind it (auto-fail — see `report-generation-quality`).
- Asserting corridor coverage that doesn't exist (Japan/SK/France are FAQ-only today).
- Surfacing PII from `user_intake_forms`/`user_reports` in "insight" content — aggregate only.
- Bulk-writing new country content without the staging/review path (`directory-data-enrichment`).

## Good / bad examples
- ✅ "Ireland→AU (our #1 corridor, 33 intakes): stage 3 'Land' — use an EMDG-eligible AU entity;
   see [case study company] (`case_study_sources` #NN)." — corridor, telemetry, sequence, citation.
- ✅ "Coverage gap: Japan is our #3 origin (12 intakes) but has no playbook — FAQ-only." — evidenced gap.
- ❌ "Australia is a great launchpad for Asia-Pacific." — generic, no source, not a secret.
- ❌ Inventing a 6-stage Japan playbook when `country_playbook_stages` has zero Japan rows.

## Self-check rubric (pass/fail)
- [ ] Corridor-specific and actionable (stages/instruments/named entities), not generic.
- [ ] Every claim traces to an MES row or `case_study_sources` citation; figures sourced or omitted.
- [ ] Telemetry-derived insights are aggregate, no PII.
- [ ] Coverage stated honestly — thin corridors flagged, not fabricated.
- [ ] Tier gating + staging/review respected for any new content.

## Evidence
Inspected 2026-07-07 (live, project `xhziwveaiuhzdoutpgrh`): `country_playbook_stages` (30),
`country_funding_instruments` (50), `country_case_studies` (59), `country_faqs` (94),
`country_trade_metrics` (30) — full for US/Singapore/UK/Canada/Ireland, FAQ-only for
France/Japan/South Korea; `case_study_sources` (631), `case_study_quotes` (118),
`content_company_profiles` (102); `user_intake_forms.country_of_origin` distribution;
`report_quality` (28) + `user_reports.report_json` (79). Rendering: `src/pages/CountryPage.tsx`,
`src/lib/countryPageContent.ts`, `CountryPlaybook`/`CountryFundingPathways` components. Cross-refs:
`market-entry-research`, `report-generation-quality`, `content-and-vendor-copy`,
`freemium-tier-gating`, `directory-data-enrichment`.

## Common MES pitfalls (real)
1. **Generic dressed as proprietary** — if a generic LLM could write it without MES data, it isn't
   a secret; require a row/citation.
2. **Uneven country coverage** — only 5 of 8 countries have full playbook/funding content; 3 are
   FAQ-only. Don't assert or invent coverage for the thin ones.
3. **Shallow/young telemetry** — ~63 usable reports, a June–July 2026 build window (no aging
   signal), and zero web analytics, so "which pages perform" can't be measured yet
   (`content-freshness-and-seo-ops-loop`). Scope claims to what the data supports.
4. **PII leakage** — never surface a company/founder name from an intake/report row as an
   "insight"; aggregate only (`secrets-and-env-management`).
