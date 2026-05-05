# Import Summary — UK & Irish ANZ Case Studies

**Date:** 2026-05-05
**Branch:** `claude/import-anz-case-studies-AOkH1`
**Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform)
**Source files:**
- `data/case-studies/Irish_Startups_in_the_ANZ_Market_MES_Case_Study_Collection_Combined.md` (5 case studies)
- `data/case-studies/mes_uk_anz_case_studies_with_segment_sources.md` (20 case studies)

---

## Totals inserted

| Table | Inserted |
|---|---|
| `content_items` | 25 |
| `content_company_profiles` | 25 |
| `content_founders` | 9 |
| `content_sections` | 108 |
| `content_bodies` | 217 |
| `case_study_sources` | 186 |

### Baseline → post-import (delta for the 25 imported slugs)

| Table | Baseline | Post-import | Delta from new slugs |
|---|---|---|---|
| `content_items` (case_study) | 41 | 66 | +25 |
| `content_sections` | 212 | 320 | +108 |
| `content_bodies` | 633 | 850 | +217 |
| `content_company_profiles` | 41 | 66 | +25 |
| `content_founders` | 43 | 52 | +9 |
| `case_study_sources` | 165 | 401 | +186 (filtered to new 25 slugs) |

> Note: cumulative `case_study_sources` increased by 236 in the same time window. The extra 50 sources belong to five unrelated `*-australia-market-entry` case studies that had concurrent edits during the import window — outside this task's scope.

---

## Imported case studies

### Irish (status = `published`, 5 cases)

| Slug | Title | Category | Sections | Bodies | Sources | Founders | Has challenges section |
|---|---|---|---|---|---|---|---|
| `daon-anz-market-entry` | How Daon Entered the ANZ Market | Technology Market Entry | 5 | 17 | 14 | 1 | yes |
| `fenergo-anz-market-entry` | How Fenergo Entered the ANZ Market | Fintech Success | 5 | 18 | 9 | 3 | yes |
| `fineos-anz-market-entry` | How FINEOS Entered the ANZ Market | Fintech Success | 4 | 17 | 11 | 1 | no |
| `wayflyer-anz-market-entry` | How Wayflyer Entered the ANZ Market | Fintech Success | 4 | 17 | 10 | 2 | no |
| `tines-anz-market-entry` | How Tines Entered the ANZ Market | Technology Market Entry | 4 | 16 | 9 | 2 | no |

### UK (status = `draft`, 20 cases)

| Slug | Title | Category | Sections | Bodies | Sources | Has challenges section |
|---|---|---|---|---|---|---|
| `revolut-anz-market-entry` | How Revolut Entered the ANZ Market | Fintech Success | 5 | 8 | 6 | yes |
| `wise-anz-market-entry` | How Wise Entered the ANZ Market | Fintech Success | 4 | 6 | 9 | no |
| `darktrace-anz-market-entry` | How Darktrace Entered the ANZ Market | Technology Market Entry | 5 | 8 | 7 | yes |
| `quantexa-anz-market-entry` | How Quantexa Entered the ANZ Market | Fintech Success | 5 | 8 | 7 | yes |
| `thought-machine-anz-market-entry` | How Thought Machine Entered the ANZ Market | Fintech Success | 4 | 6 | 6 | no |
| `featurespace-anz-market-entry` | How Featurespace Entered the ANZ Market | Fintech Success | 4 | 6 | 8 | no |
| `mimecast-anz-market-entry` | How Mimecast Entered the ANZ Market | Technology Market Entry | 4 | 6 | 6 | no |
| `complyadvantage-anz-market-entry` | How ComplyAdvantage Entered the ANZ Market | Fintech Success | 5 | 8 | 7 | yes |
| `onfido-anz-market-entry` | How Onfido Entered the ANZ Market | Technology Market Entry | 4 | 6 | 7 | no |
| `blue-prism-anz-market-entry` | How Blue Prism Entered the ANZ Market | Technology Market Entry | 4 | 6 | 7 | no |
| `dext-anz-market-entry` | How Dext Entered the ANZ Market | Fintech Success | 4 | 6 | 5 | no |
| `nplan-anz-market-entry` | How nPlan Entered the ANZ Market | Technology Market Entry | 4 | 6 | 5 | no |
| `daxtra-technologies-anz-market-entry` | How DaXtra Technologies Entered the ANZ Market | Technology Market Entry | 4 | 6 | 6 | no |
| `anna-money-anz-market-entry` | How ANNA Money Entered the ANZ Market | Fintech Success | 4 | 6 | 8 | no |
| `tractable-anz-market-entry` | How Tractable Entered the ANZ Market | Technology Market Entry | 4 | 6 | 7 | no |
| `deliveroo-anz-market-entry` | How Deliveroo Entered the ANZ Market | Technology Market Entry | 5 | 8 | 7 | yes |
| `banked-anz-market-entry` | How Banked Entered the ANZ Market | Fintech Success | 4 | 6 | 7 | no |
| `ncc-group-anz-market-entry` | How NCC Group Entered the ANZ Market | Technology Market Entry | 5 | 8 | 6 | yes |
| `contino-anz-market-entry` | How Contino Entered the ANZ Market | Technology Market Entry | 4 | 6 | 5 | no |
| `sensat-anz-market-entry` | How Sensat Entered the ANZ Market | Technology Market Entry | 4 | 6 | 7 | no |

---

## Section coverage

- **All 5 sections (entry-strategy, success-factors, key-metrics, challenges-faced, lessons-learned):** 8 of 25 — Daon, Fenergo, Revolut, Darktrace, Quantexa, ComplyAdvantage, Deliveroo, NCC Group
- **4 sections (no challenges-faced):** 17 of 25 — FINEOS, Wayflyer, Tines, Wise, Thought Machine, Featurespace, Mimecast, Onfido, Blue Prism, Dext, nPlan, DaXtra Technologies, ANNA Money, Tractable, Banked, Contino, Sensat

The challenges section is included only when the source markdown surfaces ≥2 concrete challenge signals (regulatory pressure, competitive dynamics, exit, capital intensity, etc.). When skipped, sort_order is renumbered 1–4 with no gaps.

---

## Category split

- **Fintech Success** (`0563b826-2123-4627-b912-14f63e9fbfb6`): 12 — Revolut, Wise, Quantexa, Thought Machine, Featurespace, ComplyAdvantage, Banked, ANNA Money, Dext, Fenergo, Wayflyer, FINEOS
- **Technology Market Entry** (`6a837ef6-c7b5-457c-8069-2b8da9c85716`): 13 — Daon, Tines, Darktrace, Mimecast, Onfido, Blue Prism, nPlan, DaXtra Technologies, Tractable, Deliveroo, NCC Group, Contino, Sensat

---

## Founders

Founders parsed and inserted only for the Irish set (UK source files do not include founder lines):

| Case | Founders |
|---|---|
| Daon | Dermot Desmond *(primary)* |
| Fenergo | Marc Murphy *(primary)*, Philip Burke, Cian Kinsella |
| FINEOS | Michael Kelly *(primary)* |
| Wayflyer | Aidan Corbett *(primary)*, Jack Pierse |
| Tines | Eoin Hinchy *(primary)*, Thomas Kinsella |

UK case studies have `founder_count = NULL` and no rows in `content_founders`. Manual research is needed to backfill if desired.

---

## Source type distribution (across new 186 sources)

| source_type | Count |
|---|---|
| `company_blog` | 86 |
| `news` | 47 |
| `government` | 28 |
| `other` | 18 |
| `linkedin` | 4 |
| `press_release` | 2 |
| `podcast` | 1 |

---

## UK case studies flagged for enrichment

All 20 UK case studies are stored with `status='draft'` because the source narrative is intentionally light (per the source markdown structure, "the existing narrative should now be merged with the verified source lists from the deeper research set"). These should be enriched with deeper research before promoting to `published`.

### Recommended Perplexity research prompt template per UK case study

For each UK draft case study, run a Perplexity `sonar-pro` query with this prompt template:

```
Research the ANZ (Australia & New Zealand) market entry of {COMPANY_NAME}.
For each of these blocks, return ~250 words of well-sourced, factually
verifiable narrative with specific dates, customer names, deal sizes,
office locations, regulatory triggers, and headcount where available:

1. Company Overview — origin, founding year, founders, sector, current scale
2. Why ANZ — what drew the company to Australia / New Zealand, what
   regulatory or commercial conditions made the market attractive
3. Entry Journey — local hires, anchor customers, partnerships, regional
   office openings, IPO/funding milestones, year-by-year timeline
4. Key Outcomes — measurable results: customer count, revenue, regional
   employees, awards, ASX/regulatory milestones
5. Challenges Faced (only if 2+ concrete challenges identifiable) —
   regulatory hurdles, competitive setbacks, exits, pivots, capital gaps
6. Lessons Learned — 4-6 explicit playbook moves other UK operators
   could copy

For each block, list 3-5 verifiable URLs with descriptive labels (no raw
URLs). Prefer primary sources (company newsroom, government registers,
ASX filings, AFR, Reuters) over aggregators or wiki sites.
```

Replace `{COMPANY_NAME}` with one of:
Revolut, Wise, Quantexa, Thought Machine, Featurespace, ComplyAdvantage,
Banked, ANNA Money, Dext, Darktrace, Mimecast, Onfido, Blue Prism, nPlan,
DaXtra Technologies, Tractable, Deliveroo, NCC Group, Contino, Sensat.

After research, re-run `scripts/parse_case_studies.py` against an enriched
input markdown file and `scripts/import_case_studies.py` to upsert. The
importer skips rows that already exist (by content_id × section slug × URL),
so partial enrichment is safe.

---

## Acceptance checklist

- [x] Phase 0 baseline captured (case_studies=41, sections=212, bodies=633, profiles=41, founders=43, sources=165)
- [x] Phase 1 parser output reviewed (Daon Irish 5-section sample, Wise UK 4-section sample)
- [x] Phase 2 insertions: 25 content_items, 108 content_sections, 217 content_bodies, 25 content_company_profiles, 9 founders, 186 sources
- [x] All 5 Irish case studies show `status='published'`
- [x] All 20 UK case studies show `status='draft'`
- [x] 12 case studies with `category_id` for Fintech Success, 13 for Technology Market Entry
- [x] Validation query shows complete graph for every new content_id (4 or 5 sections each, no gaps in sort_order)
- [x] Post-import report generated, listing which case studies got the challenges section vs which were skipped
- [x] No existing rows modified (the 50 extra cumulative `case_study_sources` rows belong to unrelated `*-australia-market-entry` case studies created in parallel by another process — out of scope here)

---

## Files added in this task

- `scripts/requirements.txt` — Python deps for the importer
- `scripts/parse_case_studies.py` — markdown → JSON parser
- `scripts/import_case_studies.py` — Python importer using `supabase` client (deliverable; requires `SUPABASE_SERVICE_ROLE_KEY` in `.env` to run)
- `scripts/generate_case_study_sql.py` — generates idempotent PL/pgSQL DO blocks per case study
- `scripts/parsed_case_studies.json` — parsed records (input to importer)
- `scripts/import_case_studies.sql` — bundled SQL for all 25 cases
- `scripts/import_case_study_blocks/{NN}-{slug}.sql` — one SQL block per case study
- `reports/import-summary-2026-05-05.md` — this file
