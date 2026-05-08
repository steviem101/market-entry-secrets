# Irish Tier 1 Case Studies — Import Summary

**Date:** 2026-05-08
**Branch:** `claude/import-irish-tier1-case-studies`
**Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform)
**Source:** `data/case-studies/irish_tier1_anz_research.html` (Perplexity-produced HTML, 6 case studies, ~42 citation URLs)

---

## What was added

Six **net-new** Irish ANZ case studies, all imported with `status='published'`.
All slugs were normalised to the standard `<company>-anz-market-entry` pattern
to match the existing 45 case studies in the directory.

| Slug | Source slug | Sector | Category | Sections | Bodies | Founders | Sources |
|---|---|---|---|---:|---:|---:|---:|
| clanwilliam-anz-market-entry | clanwilliam-anz | Healthtech | Technology Market Entry | 4 | 9 | 1 | 6 |
| spectrum-life-anz-market-entry | spectrumlife-australia | Insurtech | Fintech Success | 4 | 11 | 2 | 14 |
| t-pro-anz-market-entry | tpro-apac | Healthcare AI | Technology Market Entry | 4 | 9 | 0 | 5 |
| fexco-anz-market-entry | fexco-pacific-australia | Fintech | Fintech Success | 4 | 9 | 1 | 3 |
| learnupon-anz-market-entry | learnupon-apac | Edtech | Technology Market Entry | 4 | 8 | 2 | 5 |
| kyckr-anz-market-entry | kyckr-asx | RegTech | Fintech Success | 4 | 9 | 4 | 5 |

DB delta: +6 `content_items`, +6 `content_company_profiles`, +10 `content_founders`,
+24 `content_sections`, +55 `content_bodies`, +38 `case_study_sources`.

---

## Pipeline (reused / extended from the UK enrichment)

1. **Persist source** — Saved the signed-CloudFront HTML verbatim to `data/case-studies/irish_tier1_anz_research.html` (so the URL expiry doesn't break reproducibility).
2. **`scripts/parse_irish_tier1.py`** — BeautifulSoup-based parser. For each `<section class="case-study">`:
   - Reads the slug-code, h2, tagline, meta-strip, all `section-block`s.
   - Renders entry-journey / outcomes / playbook tables → `<ul>` with `<strong>{key}</strong> — {value} <em>({detail})</em>` per row.
   - Strips inline `<strong>` from cell content before wrapping (no nested tags).
   - Pulls the editorial `callout` quote and renders as `<p><em>...</em></p>`. Named attributions (e.g. CEO quote) are kept; generic "MES editorial lesson" attributions are dropped.
   - Resolves citation URLs to `case_study_sources` rows with domain-based source_type detection.
   - Synthesizes a Key Metrics section from the meta-strip when the source lacks an explicit "Key outcomes" table (T-Pro, Fexco) — keeps every case at a uniform 4-section shape.
3. **`scripts/generate_irish_tier1_sql.py`** — emits one idempotent DO block per case:
   - `INSERT … ON CONFLICT (slug) DO UPDATE` for `content_items`
   - `IF NOT EXISTS` skip-guards for `content_company_profiles` and `content_founders`
   - lookup-or-INSERT pattern for `content_sections`
   - `IF EXISTS / UPDATE / ELSE INSERT` pattern for `content_bodies`
   - `INSERT … ON CONFLICT (case_study_id, url) DO NOTHING` for sources
4. **Executed** via Supabase MCP, one DO block at a time.
5. **Validated** with the 5-phase test suite from the UK enrichment.

---

## Validation results

| Check | Result |
|---|---|
| All 6 cases `status='published'` and `content_type='case_study'` | ✅ 6/6 |
| Section sort_order contiguous (1..N) within each case | ✅ no gaps |
| Body sort_order contiguous within each section | ✅ no gaps |
| No duplicate (section_id, sort_order) pairs | ✅ |
| HTML tag balance (`<p>`, `<ul>`, `<li>`, `<strong>`, `<em>`) | ✅ all balanced |
| Frontend hook compatibility (`useCaseStudy` filters + section shape) | ✅ 6/6 |
| `category_id` resolves to a real row | ✅ |
| `source_type` within the renderable enum | ✅ |
| Idempotency: re-ran Clanwilliam, all counts unchanged | ✅ |
| Pre-existing 45 case studies untouched (total now 51) | ✅ |

---

## Notable parsing decisions

- **Slug normalisation.** Source uses ad-hoc slugs (`tpro-apac`, `kyckr-asx`, etc.). For directory consistency I normalised to `<company>-anz-market-entry`. The original is preserved in the parsed JSON (`legacy_slug`) for traceability.
- **T-Pro founders.** The source narrates the company without naming founders, so `founder_count = NULL` and no `content_founders` rows. Manual backfill needed if desired.
- **Spectrum.Life entry date.** Stored as `2026-01-01` (the company announced its triple acquisition on 17 March 2026 — recent-future-dated relative to the source). Worth re-checking `last_verified_at` once the deal closes formally.
- **Fexco entry date.** Set to `2009-01-01` (NZ entry via Federal Pacific acquisition), reflecting Fexco's first ANZ presence rather than the September 2024 Australian launch.

---

## Files added in this task

- `data/case-studies/irish_tier1_anz_research.html` — verbatim source (75KB, 6 case studies)
- `scripts/parse_irish_tier1.py` — BeautifulSoup-based HTML → JSON parser
- `scripts/parsed_irish_tier1.json` — parsed records
- `scripts/generate_irish_tier1_sql.py` — idempotent SQL generator
- `scripts/irish_tier1_import.sql` — bundled SQL
- `scripts/irish_tier1_import_blocks/{NN}-{slug}.sql` — one DO block per case
- `reports/irish-tier1-import-summary-2026-05-08.md` — this file

---

## Aggregate ANZ case-study count

After this import: **31 ANZ market-entry case studies** total.
- 5 original Irish (May 2026 batch)
- 20 enriched UK (May 2026)
- **6 new Irish Tier 1 (this PR)**

(Plus 20 unrelated `*-australia-market-entry` cases from other workflows, total `case_study` rows now 51.)
