# UK Case Studies Enrichment Summary

**Date:** 2026-05-07
**Branch:** `claude/import-anz-case-studies-AOkH1`
**Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform)
**Source file:** `data/case-studies/uk_anz_enriched_research.md` (20 enriched UK case studies, 69 references)

---

## What changed

All 20 UK case studies that were imported as `status='draft'` on 2026-05-05 have been
**enriched in place** with the rich research dataset and **promoted to `status='published'`**.

The enrichment was strictly additive / non-destructive:

- `content_items` rows: **UPDATE** of `subtitle`, `tldr`, `quick_facts`, `status`, `read_time`, `style_version`. Title, slug, category, content_type, created_at preserved.
- `content_company_profiles` rows: **UPDATE** of `founder_count` only.
- `content_founders`: **INSERT** (skip-if-exists) — added 24 new founder rows for 16 of 20 cases.
- `content_sections`: **UPDATE** title for existing sections; INSERT only if missing. Existing `challenges-faced` sections (6 cases) left fully intact.
- `content_bodies`: **UPDATE in place** at known sort_orders, **INSERT** new rows for additional paragraphs (sort_order > existing max). No deletes; no orphans.
- `case_study_sources`: **INSERT … ON CONFLICT (case_study_id, url) DO NOTHING** — added 84 new source rows.

Re-running any block is a no-op.

---

## Per-case enrichment results

| Slug | Status | Sections | Bodies | Founders | Sources | Read |
|---|---|---:|---:|---:|---:|---:|
| anna-money-anz-market-entry | published | 4 | 8 | 2 | 11 | 2 |
| banked-anz-market-entry | published | 4 | 9 | 1 | 10 | 2 |
| blue-prism-anz-market-entry | published | 4 | 8 | 2 | 11 | 2 |
| complyadvantage-anz-market-entry | published | 5 | 12 | 1 | 10 | 2 |
| contino-anz-market-entry | published | 4 | 9 | 2 | 8 | 3 |
| darktrace-anz-market-entry | published | 5 | 11 | 0 | 10 | 2 |
| daxtra-technologies-anz-market-entry | published | 4 | 7 | 0 | 9 | 2 |
| deliveroo-anz-market-entry | published | 5 | 10 | 2 | 11 | 2 |
| dext-anz-market-entry | published | 4 | 10 | 1 | 8 | 2 |
| featurespace-anz-market-entry | published | 4 | 8 | 2 | 14 | 2 |
| mimecast-anz-market-entry | published | 4 | 9 | 2 | 10 | 2 |
| ncc-group-anz-market-entry | published | 5 | 10 | 0 | 9 | 2 |
| nplan-anz-market-entry | published | 4 | 8 | 2 | 8 | 2 |
| onfido-anz-market-entry | published | 4 | 9 | 0 | 10 | 2 |
| quantexa-anz-market-entry | published | 5 | 11 | 1 | 10 | 2 |
| revolut-anz-market-entry | published | 5 | 12 | 2 | 11 | 3 |
| sensat-anz-market-entry | published | 4 | 9 | 2 | 9 | 3 |
| thought-machine-anz-market-entry | published | 4 | 9 | 1 | 10 | 2 |
| tractable-anz-market-entry | published | 4 | 8 | 2 | 11 | 2 |
| wise-anz-market-entry | published | 4 | 10 | 2 | 14 | 3 |

The 6 cases with the existing `challenges-faced` section (Revolut, Darktrace, Quantexa,
ComplyAdvantage, Deliveroo, NCC Group) retain that section unchanged — it sits at
sort_order=4 and the enriched lessons-learned content lives at sort_order=5.

The 14 cases without a `challenges-faced` section remain on the 4-section layout
(entry-strategy → success-factors → key-metrics → lessons-learned).

---

## Founders added

UK source files originally had no founder data. The enriched dataset names founders for
16 of the 20 cases. Inserted into `content_founders`:

| Case | Founders |
|---|---|
| Revolut | Nikolay Storonsky *(primary)*, Vlad Yatsenko |
| Wise | Kristo Käärmann *(primary)*, Taavet Hinrikus |
| Quantexa | Vishal Marria *(primary)* |
| Thought Machine | Paul Taylor *(primary)* |
| Featurespace | Dave Excell *(primary)*, Bill Fitzgerald |
| Mimecast | Peter Bauer *(primary)*, Neil Murray |
| ComplyAdvantage | Charles Delingpole *(primary)* |
| Blue Prism | Alastair Bathgate *(primary)*, David Moss |
| Dext | Michael Wood *(primary)* |
| nPlan | Dev Amratia *(primary)*, Tom Bower |
| ANNA Money | Eduard Panteleev *(primary)*, Alexei Grachev |
| Tractable | Alex Dalyac *(primary)*, Razvan Ranca |
| Deliveroo | Will Shu *(primary)*, Greg Orlowski |
| Banked | Brad Goodall *(primary)* |
| Contino | Matt Farmer *(primary)*, William Martin |
| Sensat | Rob Bhatt *(primary)*, James Dean |

Darktrace, DaXtra Technologies, NCC Group, and Onfido remain `founder_count = NULL`
because the source narrates founding teams generically (e.g. "three Oxford computer
scientists", "former GCHQ and MI5 intelligence officers") without specific names.

---

## Validation checks (post-enrichment)

| Check | Result |
|---|---|
| All 20 UK cases `status = 'published'` | ✅ |
| All section sort_orders contiguous (1..N within each case) | ✅ |
| All body sort_orders contiguous (1..N within each section) | ✅ |
| No duplicate (section_id, sort_order) pairs | ✅ |
| Existing `challenges-faced` sections preserved unchanged | ✅ (6 cases) |
| All 5 Irish case studies untouched | ✅ |
| `case_study_sources` ON CONFLICT idempotent on (case_study_id, url) | ✅ |
| Re-running any DO block is a no-op | ✅ |

---

## Files added in this task

- `data/case-studies/uk_anz_enriched_research.md` — source rich research markdown (20 case studies, 69 references)
- `scripts/parse_uk_enriched.py` — markdown → JSON parser for the enriched format
- `scripts/parsed_uk_enriched.json` — parsed records (input to enrichment SQL generator)
- `scripts/generate_uk_enrichment_sql.py` — generates idempotent UPDATE + INSERT DO blocks
- `scripts/uk_enrichment.sql` — bundled SQL for all 20 enrichment blocks
- `scripts/uk_enrichment_blocks/{NN}-{slug}.sql` — one SQL block per case study
- `reports/uk-enrichment-summary-2026-05-07.md` — this file

---

## Architectural notes

- The enrichment generator preserves the on-disk schema by design: it does not issue
  any DDL, does not delete any rows, and uses `IF EXISTS / UPDATE / ELSE INSERT`
  patterns in lieu of `ON CONFLICT` where no unique constraint exists
  (`content_bodies`, `content_sections`).
- The parser converts the rich markdown — phase headings, outcome tables, "What You
  Can Copy" tables, and footnote-cited references — into MES-shaped HTML bodies
  (`<p>` for prose, `<ul>` for tables) and a separate sources array. Footnote
  markers `[^N]` are stripped from body text and resolved to `case_study_sources`
  rows via the References section.
- Source-type detection now matches on URL **domain** only (not path), so paths
  containing company names like `/story/revolut-…` no longer get misclassified as
  `company_blog`.
