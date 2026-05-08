# Case-Study Logo Backfill Summary

**Date:** 2026-05-08
**Branch:** `claude/case-study-logos`
**Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform)

---

## What changed

Backfilled `content_company_profiles.website` and `content_company_profiles.company_logo` for **53 published case studies** that previously had neither field populated. Logos point at logo.dev (the same provider already wired into `src/lib/logoUtils.ts`).

DB delta: 53 rows updated. No schema changes, no other tables touched, no rows added or removed.

| | Before | After |
|---|---:|---:|
| Total published case studies | 77 | 77 |
| Has `website` | 24 | 77 |
| Has `company_logo` | 0 | 53 |
| Missing both | 53 | **0** |

The 24 pre-existing rows that already had a `website` were intentionally left alone (per scope: "53 missing only"). They continue to render logos via the runtime `getLogoUrl(website)` fallback in the frontend.

---

## Pipeline

Reproducible from the repo:

1. `scripts/cases_missing_logos_input.json` — snapshot of the 53 cases needing logos (slug, company_name, source URLs).
2. `scripts/build_case_study_logos.py` — applies a curated `slug → domain` map and validates each domain against `https://img.logo.dev/{domain}?token=...&fallback=404`. The `fallback=404` parameter cleanly distinguishes real logos (200) from monogram fallbacks (404).
3. `scripts/parsed_case_study_logos.json` — validated mapping (slug, domain, website URL, logo URL, validation result).
4. `scripts/generate_case_study_logo_sql.py` → `scripts/backfill_case_study_logos.sql` — idempotent UPDATE bundle (53 statements, only update where both fields are still NULL).

Validation: **53/53 domains returned 200 OK from logo.dev** with `fallback=404`. No domain hit a generated monogram fallback.

---

## Curated domain map (53 cases)

Domains were selected from first-hand knowledge of each company plus cross-reference with the company's official site / Wikipedia / Crunchbase. Notable choices:

- `aws.amazon.com` for AWS (separate brand identity from amazon.com)
- `deliveroo.co.uk` for Deliveroo (registered original)
- `tpro.io` for T-Pro
- `secretlab.co`, `sensat.co`, `tractable.ai`, `nplan.io`, `contino.io` for `.co` / `.ai` / `.io` brands
- `zoom.us` for Zoom (their brand domain)
- `spectrum.life` for Spectrum.Life
- `anna.money` for ANNA Money
- `thoughtmachine.net` for Thought Machine
- `blueprism.com` for Blue Prism (single token, not hyphenated)

Logo URL format: `https://img.logo.dev/{domain}?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png` (256px for hero quality; the existing publishable token from `src/lib/logoUtils.ts` is reused).

---

## How the frontend uses this

`src/pages/CaseStudyDetail.tsx:211, 279` already implements the logo fallback chain:

```ts
src={companyProfile?.company_logo
     || getLogoUrl(companyProfile?.website, 64)
     || primaryFounder?.image}
```

So:
- **For these 53 cases:** the persisted 256px `company_logo` URL is used directly (cleaner OG image, faster paint, lets us override if logo.dev gets one wrong).
- **For the other 24:** runtime `getLogoUrl(website)` continues to work as before — no regression.

The OG image fallback at `CaseStudyDetail.tsx:168` (`ogImage={heroImageUrl || companyProfile?.company_logo || undefined}`) now picks up the new `company_logo` for social shares.

---

## Files added in this task

- `scripts/cases_missing_logos_input.json` — 53-case snapshot (input)
- `scripts/build_case_study_logos.py` — curated mapping + logo.dev validator
- `scripts/parsed_case_study_logos.json` — validated mapping output
- `scripts/generate_case_study_logo_sql.py` — SQL generator
- `scripts/backfill_case_study_logos.sql` — idempotent UPDATE bundle (53 statements)
- `reports/case-study-logos-summary-2026-05-08.md` — this file
