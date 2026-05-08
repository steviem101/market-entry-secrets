# Australian Market Entry Failures — Import Summary

**Date:** 2026-05-08
**Branch:** `claude/case-study-failures`
**Cases imported:** 27 (25 net-new + 2 source-only enrichments)

## Scope

Imports 27 Australian market-entry failure case studies into MES `content_items`,
covering global brands (Starbucks, Masters, WeWork, Amazon), regulatory failures
(Foodora, Viagogo, Valve, Binance, Pizza Hut), pre-launch retreats (Kaufland),
fintech collapses (Volt, Laybuy, Affirm, Sezzle), and the MilkRun rapid-grocery
collapse. The 7 council additions (cases 21–27) cover Regulatory / Compliance
Failures and were drafted with primary-source citations to FWO, ACCC, ASIC,
Federal Court judgments, and major media (ABC / Reuters / Allens / Worrells).

## Per-case outcomes

| # | Slug | Mode | Sections | Bodies | Sources |
|---|------|------|---------:|-------:|--------:|
| 01 | starbucks-australia-market-entry | new | 4 | 7 | 4 |
| 02 | masters-australia-market-entry | new | 4 | 6 | 4 |
| 03 | deliveroo-anz-market-entry | sources-only | 5 | 10 | 15 |
| 04 | menulog-australia-market-entry | new | 4 | 6 | 4 |
| 05 | ola-australia-market-entry | new | 4 | 6 | 4 |
| 06 | affirm-australia-market-entry | new | 4 | 6 | 4 |
| 07 | laybuy-australia-market-entry | new | 4 | 6 | 3 |
| 08 | topshop-australia-market-entry | new | 4 | 6 | 3 |
| 09 | esprit-australia-market-entry | new | 4 | 6 | 3 |
| 10 | gap-australia-market-entry | new | 4 | 6 | 3 |
| 11 | carls-jr-australia-market-entry | new | 4 | 6 | 3 |
| 12 | wework-australia-market-entry | new | 4 | 6 | 5 |
| 13 | amazon-australia-ecommerce-entry | sources-only | 5 | 15 | 13 |
| 14 | catch-australia-market-entry | new | 4 | 6 | 4 |
| 15 | groupon-australia-market-entry | new | 4 | 6 | 4 |
| 16 | uber-carshare-australia-market-entry | new | 4 | 6 | 1 |
| 17 | peloton-australia-market-entry | new | 4 | 6 | 3 |
| 18 | sezzle-australia-market-entry | new | 4 | 6 | 3 |
| 19 | volt-bank-australia-market-entry | new | 4 | 6 | 2 |
| 20 | debenhams-australia-market-entry | new | 4 | 6 | 3 |
| 21 | foodora-australia-market-entry | new | 4 | 6 | 5 |
| 22 | viagogo-australia-market-entry | new | 4 | 6 | 6 |
| 23 | kaufland-australia-market-entry | new | 4 | 6 | 6 |
| 24 | pizza-hut-australia-franchise-class-action | new | 4 | 6 | 5 |
| 25 | valve-steam-australia-market-entry | new | 4 | 6 | 5 |
| 26 | binance-australia-derivatives-market-entry | new | 4 | 6 | 5 |
| 27 | milkrun-australia-market-entry | new | 4 | 6 | 5 |

## Categories

| Category | Count | Cases |
|----------|------:|-------|
| Technology Market Entry | 18 | starbucks, masters, deliveroo, menulog, ola, topshop, esprit, gap, carls-jr, wework, amazon, catch, groupon, uber-carshare, peloton, debenhams, kaufland, milkrun |
| Legal & Compliance | 5 | foodora, viagogo, pizza-hut, valve-steam, binance |
| Fintech Success | 4 | affirm, laybuy, sezzle, volt-bank |

## Section structure

Each new case follows a 4-section cautionary-tale layout:
1. **Entry Strategy** — Overview + Australia entry context (2 prose bodies)
2. **Success Factors** — What Went Wrong (1 bullet list, optional intro paragraph)
3. **Key Metrics & Performance** — Outcome (1 prose body)
4. **Lessons Learned** — Auto-prepended cautionary intro + Lessons for MES bullets (2 bodies)

## Data quality

- **HTML balance:** spot-checked across all 27 cases — `<p>`, `</p>`, `<strong>`,
  `</strong>`, `<ul>`, `</ul>` all balanced.
- **Logos:** all 27 cases have `website` and `company_logo` set via logo.dev
  (`https://img.logo.dev/{domain}?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png`).
- **Founders:** populated for 12 cases where named (Schultz, Foley, Neumann,
  Levchin, Mason, Bezos, Newell, Zhao, Milham, Aggarwal/Bhati, Leibovich brothers,
  Weston/Bunbury, Shu/Orlowski).
- **Sources:** primary-source priority — FWO/ACCC/ASIC media releases, Federal
  Court judgments, ABC/Reuters/AFR for major media, Allens/LegalVision for legal
  analysis.

## Special handling: Deliveroo and Amazon (in-place enrichment)

These slugs already exist in MES with rich, curated content from prior imports.
Rather than overwrite their bodies and sections, the SQL generator routed both
cases through a **source-only enrichment block** that:
- Looks up the existing `content_items.id` by slug
- Computes the next available `citation_number` via `MAX(citation_number) + 1`
- Inserts the 4 new sources for each case via `ON CONFLICT (case_study_id, url) DO NOTHING`

Result: Deliveroo went from 11 → 15 sources; Amazon from 9 → 13 sources. No
existing bodies, sections, titles, or subtitles were modified.

## Pipeline

| Step | Output |
|------|--------|
| 1. Source markdown | `data/case-studies/australian_market_failures.md` (20 cases) |
| 1b. Council markdown | `data/case-studies/australian_market_failures_council.md` (7 cases) + `_v2.html` (research addendum) |
| 2. Parser | `scripts/parse_australian_failures.py` → `parsed_australian_failures.json` |
| 3. SQL generator | `scripts/generate_australian_failures_sql.py` → `australian_failures_import.sql` + 27 per-case files in `australian_failures_import_blocks/` |
| 4. Execution | 27 idempotent DO blocks executed via Supabase MCP |
| 5. Validation | section/body counts, HTML balance, source coverage |

## Idempotency

Every block is fully re-runnable:
- `INSERT … ON CONFLICT (slug) DO UPDATE` for `content_items`
- `IF NOT EXISTS` guards on `content_company_profiles` and `content_founders`
- Lookup-or-INSERT-or-UPDATE for `content_sections`
- UPDATE-or-INSERT keyed on `(section_id, sort_order)` for `content_bodies`,
  with a trailing `DELETE WHERE sort_order > N` to handle body-count regressions
- `INSERT … ON CONFLICT (case_study_id, url) DO NOTHING` for sources
- The `COALESCE(website, ...)` UPDATE for company-profile rows preserves any
  existing curated website/logo while filling in NULLs

## Artifacts

```
scripts/
  parse_australian_failures.py
  parsed_australian_failures.json
  generate_australian_failures_sql.py
  australian_failures_import.sql           (bundle, 4344 lines)
  australian_failures_import_blocks/       (27 per-case files)

data/case-studies/
  australian_market_failures.md            (20 source cases, verbatim)
  australian_market_failures_council.md    (7 council additions)
  australian_market_failures_council_v2.html (HTML research addendum)
```
