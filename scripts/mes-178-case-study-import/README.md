# MES-178 — Import 65 case-study drafts (batch import, 2026-07-14)

One-off import of the 65-case-study draft batch (Notion → CSV) into the
content system as **drafts** (`content_items.status='draft'`,
`content_type='case_study'`) pending editorial review. Public RLS on
`content_items` only exposes `status='published'`, so none of these are
visible on `/case-studies` until editorial publishes them.

## Contents

| File | Purpose |
|---|---|
| `mes_case_studies_batch_65.csv` | Source CSV from the ticket (title, suggested_slug, status, body_markdown, sources_markdown, notion_page_url). `sources_markdown` is **editorial-only — never publish, never write to the DB** (`case_study_sources` is publicly readable). |
| `transform.py` | Deterministic CSV → SQL transform. Splits each draft's markdown into `content_sections` + `content_bodies` (body_text as sanitised-HTML per `ContentBodyRenderer`, original markdown kept in `body_markdown`), parses the quick-facts table into `content_company_profiles`, and skips company-level duplicates. |
| `out/import_batch.sql` | Generated idempotent inserts (44 statements; `WHERE NOT EXISTS` on slug). Applied to prod 2026-07-14 via the Supabase MCP (service-role path per the ticket). |
| `out/review.md` | Import review: 44 imported / 21 skipped duplicates (also copied to `docs/audits/mes-178-case-study-import-review.md`). |
| `out/expected_counts.json` | Per-slug expected section/body counts used for post-import verification. |

## Dedupe result

The batch was drafted against a partial (~26-slug) view of the catalogue; the
live table held ~100 case studies at import time. 21 of the 65 drafts
duplicated an existing company story and were **not** imported — see
`out/review.md` for the slug-by-slug mapping. The skipped drafts remain in the
CSV should editorial prefer the newer angle (import by adding the slug's
statement back via `transform.py` after removing it from `SKIP_EXISTING`).

## Re-running

```sh
python3 transform.py           # regenerates out/ from the CSV
# apply out/import_batch.sql to the MES project (xhziwveaiuhzdoutpgrh)
# via the reviewed service-role path; statements are idempotent.
```

Historical one-off, per `scripts/` convention — not part of the build.
