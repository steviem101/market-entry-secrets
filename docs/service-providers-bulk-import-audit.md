# Service Providers Bulk Import Audit Report

**Date:** 2026-03-29
**Auditor:** Claude Code
**Scope:** Supabase data state + frontend rendering after ~87 bulk-imported service providers

---

## Executive Summary

On 2026-03-29, 87 service provider records were bulk-imported via Perplexity research + Supabase MCP connector, bringing the total from 8 to 95 records. The audit identified **3 critical issues**, **5 data quality problems**, and **3 performance concerns**.

**Root cause of frontend loading issues:** The frontend code expects ~27 columns and 3 related tables (`service_provider_categories`, `service_provider_contacts`, `service_provider_reviews`) that **do not exist** in the database. The `normalizeProvider()` function masks this with safe defaults, but failed Supabase queries to missing tables will throw errors on detail pages.

---

## PHASE 1: SUPABASE DATA AUDIT

### 1.1 Schema Baseline

**Actual `service_providers` columns (18 total):**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `name` | text | NO | - |
| `description` | text | NO | - |
| `location` | text | NO | - |
| `founded` | text | NO | - |
| `employees` | text | NO | - |
| `services` | text[] | NO | `'{}'::text[]` |
| `website` | text | YES | - |
| `contact` | text | YES | - |
| `logo` | text | YES | - |
| `basic_info` | text | YES | - |
| `why_work_with_us` | text | YES | - |
| `experience_tiles` | jsonb | YES | `'[]'::jsonb` |
| `contact_persons` | jsonb | YES | `'[]'::jsonb` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |
| `location_id` | uuid | YES | - |
| `slug` | text | NO | - |

**Indexes:**
- `service_providers_pkey` - btree on `id`
- `service_providers_slug_unique` - unique btree on `slug`
- `idx_service_providers_location_id` - btree on `location_id`

**RLS Policies:** None (public read access)

**Foreign Key References:** No other tables reference `service_providers` via FK.

**Table Size:** 528 KB (healthy)

### 1.2 Critical Schema Mismatch

The frontend expects **27 columns that DO NOT EXIST** in the database:

```
logo_url, cover_image_url, tagline, is_verified, is_featured, is_active,
sectors, support_types, markets_served, category_slug, category_name,
engagement_model, company_size_focus, price_range, contact_email,
contact_phone, linkedin_url, website_url, founded_year, team_size_range,
meta_title, meta_description, view_count, click_count, avg_rating,
review_count, serves_personas
```

**3 related tables referenced in frontend hooks DO NOT EXIST:**
- `service_provider_categories` (used by `useServiceProviderCategories()`)
- `service_provider_contacts` (used by `useServiceProviderContacts()`)
- `service_provider_reviews` (used by `useServiceProviderReviews()`)

**Impact:** The `normalizeProvider()` function in `useServiceProviders.ts` provides safe defaults (empty strings, empty arrays, `false` for booleans, `true` for `is_active`), so the listing page won't crash. However, detail page queries to non-existent tables will throw Supabase errors.

### 1.3 Data Quality Analysis

**Record Counts:**
- 8 original records (created 2025-06-15)
- 87 bulk-imported records (created 2026-03-29)
- 95 total

**Null/Empty Field Summary (of 95 records):**

| Field | Missing Count | Notes |
|-------|--------------|-------|
| name | 0 | All populated |
| description | 0 | All populated |
| slug | 0 | All populated |
| website | 0 | All populated |
| logo | 0 | All populated |
| location | 0 | All populated |
| founded | 0 | All populated |
| employees | 0 | All populated |
| basic_info | 8 | The 8 original records |
| why_work_with_us | 8 | The 8 original records |
| contact | 6 | |
| services | 0 | All have at least one service |
| experience_tiles | 2 | Empty `[]` |
| contact_persons | 1 | Empty `[]` |
| location_id | **95** | ALL records have NULL location_id |

### 1.4 Duplicate Analysis

- **Duplicate slugs:** None (unique constraint enforced)
- **Duplicate names:** None
- **Duplicate websites:** None

### 1.5 Slug Format Issues

**1 malformed slug found:**
| ID | Name | Slug |
|----|------|------|
| `b4439269-...` | SGS Australia | `sgs-société-générale-de-surveillance-sa` |

Contains accented characters (`é`) which will cause URL encoding issues and may break routing.

### 1.6 Location Data Inconsistency

**43 unique location values** across 95 records. Major inconsistencies:

| Pattern | Count | Examples |
|---------|-------|----------|
| Clean format | 55 | `Sydney, NSW` (31), `Melbourne, VIC` (21) |
| With qualifier | 12 | `Sydney, NSW (Headquarters)`, `Melbourne, VIC (Treadstone)` |
| Full state name | 3 | `Melbourne, Victoria`, `Melbourne, Victoria (HQ)` |
| Full address | 2 | `Melbourne, Victoria, Australia (Headquarters)` |
| Foreign locations | 8 | `New York, NY (HQ)`, `Geneva, Switzerland`, `France` |
| Malformed | 2 | `in Sydney, NSW`, `in 6th of October City, Giza, Egypt` |
| Street address | 1 | `6 Australia St, Camperdown, Sydney` |

**Impact:** The frontend location filter dropdown is **hardcoded** to 10 Australian cities (e.g., "Sydney NSW", "Melbourne VIC"). Most of the 43 location variants won't match because:
1. The filter checks exact match against `company.location`
2. `"Sydney, NSW"` != `"Sydney NSW"` (comma difference)
3. `"Sydney, NSW (Headquarters)"` won't match either

### 1.7 Services Data Quality

**~500+ unique service values** across all providers. Major issues:

**Garbage values (parenthetical source references leaked from Perplexity scraping):**
```
"Capabilities)", "Employment)", "etc.)", "Launch)", "LinkedIn)",
"Our Story)", "Rail)", "On Demand)", "Corporates)", "Regulatory)",
"CEO LinkedIn)", "APAC regional coordination (Bench PR Homepage)",
"Chamber Magazine. Website What We Do",
"SMSF Term Deposits Judo Bank Homepage",
"Cloud Infrastructure & Project Services (CIPS) Recruitment (Homepage"
```

**Providers with most garbage services:**
| Provider | Total Services | Garbage Count |
|----------|---------------|---------------|
| NEXTGEN Group | 8 | 6 |
| Hays Recruitment | 8 | 5 |
| Hatch Quarter | 13 | 4 |
| Speak Your Language | 13 | 4 |
| Employment Hero | 9 | 4 |
| The Instant Group | 7 | 4 |

**Near-duplicate service values (inconsistent naming):**
- `Audit & Assurance` vs `Audit and Assurance`
- `M&A` vs `M&A Advisory` vs `Mergers & Acquisitions` vs `Mergers and Acquisitions`
- `Investor relations` vs `Investor Relations` (casing)
- `branding` vs `Branding & Design` (casing + specificity)
- `Dispute resolution` vs `Dispute Resolution` (casing)
- `Tax` vs `Tax Services` vs `Tax & Legal` vs `Tax (Expertise)` vs `Tax (DLA Piper Capabilities)`

### 1.8 Contact Persons Data Quality

**Garbage in contact person names:**
- `"LinkedIn Company Page)"` listed as a contact person (Speak Your Language)
- `"Barri Rafferty (CEO"` - unclosed parenthetical with empty role (Sodali & Co)

### 1.9 Experience Tiles Data Quality

- **All 93 records with experience tiles use `/placeholder.svg` for logos** - placeholder images, not real logos
- Some tile names have source annotations: `"SGIC (Website Home)"`, `"3M Australia (AmCham Australia)"`

---

## PHASE 2: FRONTEND AUDIT

### 2.1 Service Providers Listing Page

**File:** `src/pages/ServiceProviders.tsx`
**Data Provider:** `src/components/service-providers/ServiceProvidersDataProvider.tsx`

**How data is fetched:**
- Fetches ALL `service_providers` records ordered by name (no server-side limit/pagination)
- Client-side filtering + pagination (PAGE_SIZE = 12)
- Uses React Query with 15-min stale time

**Scaling concern:** Fetching all 95 records into memory on mount. Not critical at 95 records (528KB total table), but the architecture doesn't scale. Every page that shows service providers (sector pages, location pages, country pages, homepage) independently fetches the full table.

**Filter issues at scale:**
- **Location filter:** Hardcoded to 10 Australian cities in `ServiceProvidersFilters.tsx`. These use format like `"Sydney NSW"` but data uses `"Sydney, NSW"` - **exact match will fail for all locations**.
- **Sector filter:** Dynamic but depends on `sectors` column (doesn't exist) - always empty
- **Category filter:** Queries `service_provider_categories` table (doesn't exist) - will fail
- **Verified toggle:** Checks `is_verified` (doesn't exist, defaults to false) - no records will ever show as verified
- **Featured sort:** Sorts by `is_featured` (doesn't exist, defaults to false) - effectively random

**Null field handling in cards:**
- `logo_url` -> falls back to `logo` -> falls back to initials (safe)
- `description` -> 3-line clamp (safe)
- `tagline` -> hidden if empty (safe)
- `services` -> shows 3 max with "+X more" badge (safe)
- `sectors`, `markets_served`, `support_types` -> all empty, hidden (safe)

### 2.2 Service Provider Detail Page

**File:** `src/pages/ServiceProviderPage.tsx`

**Slug lookup logic:**
1. Checks if slug is UUID format -> direct ID match
2. Falls back to ilike name matching (converts hyphens to spaces)

**Critical: Queries to non-existent tables:**
- `useServiceProviderReviews(providerId)` -> queries `service_provider_reviews` -> **Supabase error**
- `useServiceProviderContacts(providerId)` -> queries `service_provider_contacts` -> **Supabase error**
- `useServiceProviderCategories()` -> queries `service_provider_categories` -> **Supabase error**

These failed queries won't crash the page (React Query catches errors), but they generate console errors and may cause loading state issues.

**Related providers:** Matches by `category_slug` + `location` ilike. Since `category_slug` doesn't exist, only location matching works.

**SEO:** `meta_title` and `meta_description` don't exist - falls back to name/description.

### 2.3 Other Pages Referencing Service Providers

| Page | Hook | Fetch Pattern | Impact |
|------|------|--------------|--------|
| Homepage | ProvidersSection | Fetch all, limit 9 | Works, no issues |
| Sector pages | `useSectorServiceProviders` | Fetch all, client-side keyword filter | Works (searches name+description+services) |
| Location pages | `useLocationServiceProviders` | Fetch all, client-side keyword filter | Works |
| Country pages | `useCountryServiceProviders` | Fetch all, client-side keyword filter | Works |
| Global search | `useMasterSearch` | Server-side ilike, limit 10 | Works |
| Report generator | DB matching | Array overlap + location ilike | Works |

### 2.4 Likely Causes of "Struggling to Load"

1. **Failed queries to non-existent tables** (`service_provider_categories`, `service_provider_contacts`, `service_provider_reviews`) generating errors and potentially blocking rendering on detail pages
2. **Location filter mismatch** - hardcoded filter values don't match data format, so filtering appears broken
3. **All advanced features non-functional** (verified, featured, categories, sectors, markets) due to missing columns - makes the UI appear empty/broken
4. **Multiple full-table fetches** - listing page, homepage, sector/location/country pages all independently fetch all 95 records

---

## PHASE 3: RECOMMENDATIONS

### 3.1 Critical Issues (Blocking)

| # | Issue | Location | Fix | Effort |
|---|-------|----------|-----|--------|
| C1 | Queries to non-existent `service_provider_categories` table | `useServiceProviderCategories()` hook | Create table OR remove hook references | Medium |
| C2 | Queries to non-existent `service_provider_contacts` table | `useServiceProviderContacts()` hook | Create table OR remove hook references | Medium |
| C3 | Queries to non-existent `service_provider_reviews` table | `useServiceProviderReviews()` hook | Create table OR remove hook references | Medium |

### 3.2 Data Quality Issues (Degrading Experience)

| # | Issue | Count | Fix | Effort |
|---|-------|-------|-----|--------|
| D1 | Garbage service values with source refs | ~60+ values across 20+ providers | SQL cleanup | Medium |
| D2 | Inconsistent location formats | 43 unique values | Normalize to "City, STATE" | Medium |
| D3 | Malformed slug (accented chars) | 1 record | Update slug | Quick |
| D4 | Garbage contact person names | 2 records | Manual cleanup | Quick |
| D5 | All experience tile logos are `/placeholder.svg` | 93 records | Enrich with real logos or remove | Significant |
| D6 | location_id NULL for all records | 95 records | Match to locations table | Medium |

### 3.3 Performance Concerns

| # | Issue | Impact | Fix | Effort |
|---|-------|--------|-----|--------|
| P1 | Every page fetches full table independently | 4-6 redundant full-table fetches per session | Shared cache or server-side filtering | Medium |
| P2 | No server-side pagination | All 95 records loaded every time | Add `.range()` to Supabase queries | Medium |
| P3 | Location filter hardcoded, doesn't match data | Filters appear broken | Dynamic location extraction or normalize data | Quick-Medium |

### 3.4 Recommended Fix Order

**Immediate (fix loading failures):**
1. Create the 3 missing tables (categories, contacts, reviews) even if empty - stops Supabase errors
2. Fix the malformed slug

**Quick wins (data quality):**
3. Normalize location formats
4. Clean garbage service values
5. Fix garbage contact person entries
6. Fix location filter to match data format

**Medium effort (frontend hardening):**
7. Add missing columns to schema (or remove frontend references)
8. Populate `location_id` by matching to `locations` table
9. Deduplicate/normalize service values

**Schema improvements:**
10. Add `is_active` boolean column with default `true`
11. Add `category_slug` column for categorization
12. Consider adding `sectors` array column for cross-referencing

### 3.5 Data Cleanup SQL (Ready to Run)

#### Fix malformed slug
```sql
UPDATE service_providers
SET slug = 'sgs-australia'
WHERE id = 'b4439269-014c-4271-bb71-3c91aded4803';
```

#### Normalize location formats
```sql
-- Remove qualifiers like "(Headquarters)", "(Dentons)", etc.
UPDATE service_providers
SET location = regexp_replace(location, '\s*\([^)]*\)\s*$', '')
WHERE location ~ '\([^)]*\)$';

-- Fix "in " prefix
UPDATE service_providers
SET location = regexp_replace(location, '^in\s+', '')
WHERE location LIKE 'in %';

-- Normalize "Victoria" -> "VIC"
UPDATE service_providers
SET location = replace(location, 'Victoria', 'VIC')
WHERE location LIKE '%Victoria%';

-- Normalize "New South Wales" -> "NSW"
UPDATE service_providers
SET location = replace(location, 'New South Wales', 'NSW')
WHERE location LIKE '%New South Wales%';

-- Normalize "Queensland" -> "QLD"
UPDATE service_providers
SET location = replace(location, 'Queensland', 'QLD')
WHERE location LIKE '%Queensland%';

-- Remove ", Australia" suffix
UPDATE service_providers
SET location = regexp_replace(location, ',?\s*Australia\s*$', '')
WHERE location LIKE '%Australia%';
```

#### Clean garbage service values
```sql
-- Remove services that are just closing parentheses or source references
UPDATE service_providers
SET services = array(
  SELECT s FROM unnest(services) s
  WHERE s NOT IN (
    'Capabilities)', 'Employment)', 'etc.)', 'Launch)', 'LinkedIn)',
    'Our Story)', 'Rail)', 'On Demand)', 'Corporates)', 'Regulatory)',
    'CEO LinkedIn)', 'LinkedIn', 'Sea', 'Road', 'Plan', 'IT',
    'Corporate', 'Technical', 'International', 'Health', 'Energy',
    'Medical', 'Certificate', 'Video', 'Employment', 'Testing',
    'Transaction', 'Setup', 'Formation', 'Inspection', 'Finance',
    'Legal', 'Tax', 'Compliance', 'Research', 'Consulting',
    'ESG', 'Payroll', 'Training', 'Recruitment', 'Advisory',
    'Insurance', 'Ecommerce', 'Assurance', 'Certification',
    'Deals', 'Lobbying', 'Networking', 'Localization',
    'Mentorship', 'Technology', 'Visibility', 'Cybersecurity',
    'Immigration', 'Interpreting', 'Bookkeeping', 'CRO',
    'SEO', 'Translation', 'Transcreation', 'Subtitling',
    'Linehaul', 'Rewards'
  )
  AND s !~ '^\)' -- starts with closing paren
  AND LENGTH(s) > 2 -- too short to be meaningful
);
-- NOTE: Review the exclusion list carefully before running.
-- Some single-word values like "Tax" may be valid depending on context.
-- A safer approach is to only remove the obvious garbage:
```

#### Safer garbage cleanup (recommended)
```sql
UPDATE service_providers
SET services = array(
  SELECT s FROM unnest(services) s
  WHERE s !~ '^\s*\)\s*$'  -- just a closing paren
    AND s !~ 'Homepage'     -- source page references
    AND s !~ 'About Us'
    AND s !~ 'About Page'
    AND s !~ 'LinkedIn\)'
    AND s !~ 'CEO LinkedIn'
    AND s !~ 'Our Story'
    AND s !~ 'Website What We Do'
    AND s !~ 'Website Services'
    AND s !~ 'Judo Bank Homepage'
    AND LENGTH(TRIM(s)) > 0
)
WHERE EXISTS (
  SELECT 1 FROM unnest(services) s
  WHERE s ~ 'Homepage|About Us|About Page|LinkedIn\)|CEO LinkedIn|Our Story|Website What We Do|Website Services|Judo Bank Homepage'
    OR s ~ '^\s*\)\s*$'
);
```

#### Remove source annotations from service names
```sql
UPDATE service_providers
SET services = array(
  SELECT regexp_replace(s, '\s*\([^)]*(?:Homepage|Services|About|LinkedIn|Expertise|Products|Capabilities|Page)[^)]*\)\s*$', '', 'i')
  FROM unnest(services) s
)
WHERE EXISTS (
  SELECT 1 FROM unnest(services) s
  WHERE s ~ '\(.*(?:Homepage|Services|About|LinkedIn|Expertise|Products|Capabilities|Page).*\)'
);
```

#### Fix garbage contact persons
```sql
-- Remove contact persons with garbage names
UPDATE service_providers
SET contact_persons = (
  SELECT jsonb_agg(cp)
  FROM jsonb_array_elements(contact_persons) cp
  WHERE cp->>'name' NOT LIKE '%LinkedIn%'
    AND cp->>'name' NOT LIKE '%)'
    AND LENGTH(TRIM(cp->>'name')) > 0
)
WHERE contact_persons::text LIKE '%LinkedIn%'
   OR contact_persons::text LIKE '%)%';

-- Fix contact person names with unclosed parentheticals
UPDATE service_providers
SET contact_persons = (
  SELECT jsonb_agg(
    jsonb_set(cp, '{name}', to_jsonb(regexp_replace(cp->>'name', '\s*\([^)]*$', '')))
  )
  FROM jsonb_array_elements(contact_persons) cp
)
WHERE contact_persons::text ~ '"name"\s*:\s*"[^"]*\([^)]*"';
```

#### Create missing tables (empty, prevents Supabase errors)
```sql
CREATE TABLE IF NOT EXISTS service_provider_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_provider_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text,
  email text,
  phone text,
  linkedin_url text,
  avatar_url text,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_provider_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title text,
  review_text text,
  reviewer_name text,
  reviewer_company text,
  reviewer_country text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read" ON service_provider_categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON service_provider_contacts FOR SELECT USING (true);
CREATE POLICY "Public read" ON service_provider_reviews FOR SELECT USING (true);
```

#### Flag records with insufficient data for manual review
```sql
SELECT id, name, slug,
  CASE
    WHEN contact IS NULL OR contact = '' THEN 'missing_contact'
    ELSE 'ok'
  END as contact_status,
  CASE
    WHEN basic_info IS NULL OR basic_info = '' THEN 'missing_basic_info'
    ELSE 'ok'
  END as basic_info_status,
  CASE
    WHEN why_work_with_us IS NULL OR why_work_with_us = '' THEN 'missing_why_work'
    ELSE 'ok'
  END as why_work_status,
  (SELECT COUNT(*) FROM unnest(services) s
   WHERE s ~ 'Homepage|About|LinkedIn|Website|Our Story|\)$' OR LENGTH(s) < 3
  ) as garbage_service_count,
  array_length(services, 1) as total_services
FROM service_providers
WHERE contact IS NULL OR contact = ''
   OR basic_info IS NULL OR basic_info = ''
   OR why_work_with_us IS NULL OR why_work_with_us = ''
   OR EXISTS (
     SELECT 1 FROM unnest(services) s
     WHERE s ~ 'Homepage|About|LinkedIn|Website|Our Story|\)$' OR LENGTH(s) < 3
   )
ORDER BY garbage_service_count DESC NULLS LAST;
```

---

## Appendix: Full Location Value Distribution

| Location | Count |
|----------|-------|
| Sydney, NSW | 31 |
| Melbourne, VIC | 21 |
| Canberra, ACT | 2 |
| Richmond, VIC | 2 |
| All others | 1 each (39 unique values) |

## Appendix: Import Timeline

| Date | Records Created |
|------|----------------|
| 2025-06-15 | 8 (original seed data) |
| 2026-03-29 | 87 (bulk import) |
