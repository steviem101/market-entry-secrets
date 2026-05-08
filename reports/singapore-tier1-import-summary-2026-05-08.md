# Singapore Tier 1 Case Studies — Import Summary

**Date:** 2026-05-08
**Branch:** `claude/import-singapore-tier1-case-studies`
**Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform)
**Source:** `data/case-studies/singapore_anz_research.html` (master HTML, Tier 1 + Tier 2)

---

## What was imported (5 of 6 Tier 1 cases)

| Slug | Source id | Sector | Category | Sections | Bodies | Founders | Sources |
|---|---|---|---|---:|---:|---:|---:|
| shopback-anz-market-entry | shopback | Consumer Fintech | Fintech Success | 4 | 6 | 4 | 4 |
| secretlab-anz-market-entry | secretlab | Consumer Hardware / Gaming | Technology Market Entry | 4 | 6 | 2 | 3 |
| comfortdelgro-anz-market-entry | comfortdelgro | Mobility & Transport | Technology Market Entry | 4 | 6 | 0 | 3 |
| nium-anz-market-entry | nium | Fintech Infrastructure | Fintech Success | 4 | 6 | 2 | 3 |
| propertyguru-anz-market-entry | propertyguru | PropTech | Technology Market Entry | 4 | 7 | 2 | 3 |

DB delta: +5 `content_items`, +5 `content_company_profiles`, +10 `content_founders`, +20 `content_sections`, +31 `content_bodies`, +16 `case_study_sources`. All status=`published`.

---

## What was excluded — and why

**Shopee dropped on accuracy grounds.** The source HTML claims Shopee "launched in Australia in 2021" and "withdrew in 2022", citing a Reuters article. Independent fact-checking against the Wikipedia chronology, Inside Retail Asia, Momentum Works, kr-asia, and the cited Reuters article itself shows:

- Shopee's documented launches between 2019 and 2022 are: **Brazil (2019); Mexico, Chile, Colombia, Argentina (2020); Poland, Spain, France (2021); India (Nov 2021); South Korea**.
- The cited Reuters article ("Shopee shuts operations in Argentina, Chile, Colombia, Mexico, sources") covers Latin America retreat — not Australia.
- No primary source (Sea Ltd 10-K filings, Shopee press releases, Australian retail press) confirms an Australian launch.

The source HTML appears to conflate Shopee's broader 2022 retrenchment with an Australia-specific move that did not occur. Importing the case as-is would have introduced a verifiable factual error into the MES library.

The Shopee article and per-case SQL block are intentionally not generated, and the slug-normalisation map in `scripts/parse_singapore_tier1.py` documents the exclusion with a research note inline.

---

## Founder backfills (research-supplemented)

The source HTML named only Secretlab's founders. The remaining cases were enriched via verified primary sources:

| Case | Founders added | Source |
|---|---|---|
| ShopBack | Henry Chan (CEO), Joel Leong, Lai Shanru, Josephine Chow | DBS BusinessClass; Crunchbase; Tracxn; Grokipedia |
| Secretlab | Ian Ang (CEO), Alaric Choo | Source HTML; cross-checked via Tatler Asia |
| ComfortDelGro | None — corporate entity formed 29 Mar 2003 from Comfort Group + DelGro Corporation merger | Wikipedia; SGPBusiness corporate registry |
| Nium | Prajit Nanu (CEO), Michael Bermingham | Wikipedia; SMU Newsroom; Fintech Futures |
| PropertyGuru | Steve Melhuish, Jani Rautiainen | Yahoo Finance; PropertyGuru official journey page; Tracxn |

ComfortDelGro is intentionally left with `founder_count = NULL` because the company was created via a 2003 merger of two listed entities — it has no individual founder.

---

## PropertyGuru research enrichment

The source HTML's PropertyGuru panel was lighter than the others (no summary-grid, no key-outcomes table, no "What founders can copy" list). Per the user's request, additional content was synthesised from validated primary sources (onlinemarketplaces.com, ASX divestment announcement, REA Group Wikipedia chronology) to bring PropertyGuru up to a uniform 4-section MES shape:

- **Success Factors** (synthesised, 3 bullets) — strategic ownership as alternative to operating expansion; sequencing M&A around capital-market milestones; reading divestments as transitions.
- **Lessons Learned** (synthesised, 3 bullets) — asset swap as entry mechanism; strategic shareholder access as ANZ market signal; planning the unwind alongside the entry.
- **MES note** carried through from the source warning that this is a strategic-link case rather than a classic operating rollout.

---

## Validation results

| Check | Result |
|---|---|
| All 5 cases `status='published'` and `content_type='case_study'` | ✅ 5/5 |
| Section sort_order contiguous (1..N) within each case | ✅ no gaps |
| Body sort_order contiguous within each section | ✅ no gaps |
| Zero duplicate `(section_id, sort_order)` pairs | ✅ |
| HTML tag balance (`<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`) | ✅ all balanced |
| `category_id` resolves to a real row | ✅ 5/5 |
| All `source_type` values within enum | ✅ |
| Pre-existing 51 case studies untouched (total now 56) | ✅ |

---

## Files added in this task

- `data/case-studies/singapore_anz_research.html` — verbatim source (Tier 1 + Tier 2 master file)
- `scripts/parse_singapore_tier1.py` — BeautifulSoup HTML → JSON parser
- `scripts/parsed_singapore_tier1.json` — parsed records (5 cases; Shopee excluded with documented reason)
- `scripts/generate_singapore_tier1_sql.py` — idempotent SQL generator
- `scripts/singapore_tier1_import.sql` + `scripts/singapore_tier1_import_blocks/{NN}-{slug}.sql`
- `reports/singapore-tier1-import-summary-2026-05-08.md` — this file

---

## Aggregate ANZ case-study count

After this import: **36 ANZ market-entry case studies** in scope (5 original Irish + 20 enriched UK + 6 Irish Tier 1 + **5 Singapore Tier 1**), plus the 20 unrelated `*-australia-market-entry` cases from other workflows. Total `case_study` rows in `content_items`: 56.
