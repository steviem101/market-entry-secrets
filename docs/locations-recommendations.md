# Locations Feature - Audit & Recommendations

**Date:** 2026-02-28
**Scope:** Full review of the Market Entry Locations feature

---

## 1. Current State Gaps

### Data Gaps
- **Only 5 of 21+ required locations existed** (NSW, VIC, QLD, Sydney, Melbourne) - all Australian, no New Zealand coverage
- **No `country` column** - impossible to distinguish Australian vs New Zealand locations or filter by country
- **No `active` flag** - no way to soft-disable a location without deleting it
- **`parent_location` was text-only** - cities had NULL parent references, breaking the state/city hierarchy
- **No `location_id` FK on directory tables** - service_providers, events, community_members, innovation_ecosystem, and trade_investment_agencies all use a free-text `location` field with no relational link

### Frontend Gaps
- **No country filter** on the locations listing page - only type filter (state/city/region)
- **Missing sections on detail pages** - LocationContent rendered 5 sub-sections but omitted InnovationEcosystemSection and TradeAgenciesSection (both of which exist on SectorPage)
- **Hero copy was Australia-only** - didn't mention New Zealand

### Filtering Architecture
- All related entity filtering is **keyword-based and client-side** - hooks fetch ALL rows from each directory table, then filter in JavaScript using the location's keyword arrays
- This works for the current data volume (~50-100 rows per table) but will not scale beyond ~500 rows per table due to Supabase's 1000-row default limit and client-side processing cost

---

## 2. Schema Improvements

### What Was Added
| Column | Table | Purpose |
|--------|-------|---------|
| `country` | `locations` | 'Australia' or 'New Zealand' - enables country filtering |
| `active` | `locations` | Boolean soft-disable flag |
| `parent_location_id` | `locations` | Self-referencing UUID FK for state/city hierarchy |
| `location_id` | 5 directory tables | Nullable FK to `locations` for relational filtering |

### Design Decisions

**`key_industries` as `text[]` (kept as-is)**
A join table (`location_industries` with a normalized `industries` reference table) would enable better filtering and prevent typos. However, for the current scale (21 locations, ~6 industries each), the text array is simpler, directly queryable via Postgres `@>` overlap operator, and consistent with the existing pattern used across `countries`, `industry_sectors`, and all keyword arrays. Recommend revisiting if the locations table exceeds 100 rows.

**Dual parent columns (`parent_location` text + `parent_location_id` UUID)**
Keeping both is intentional: the text column is backward-compatible with existing UI code, and the FK enables relational queries. A future migration should drop `parent_location` text after all references are updated to use the FK.

**`location_id` FK on directory tables**
Added as nullable with no backfill - the existing text `location` values are inconsistent (e.g., "Sydney, NSW", "Sydney & Melbourne", "Brisbane") and automated matching would produce errors. Backfilling should be a manual data curation task.

---

## 3. SEO URL Strategy

### Current Pattern (Consistent Across Platform)
| Entity | URL Pattern | Example |
|--------|-------------|---------|
| Locations | `/locations/:slug` | `/locations/sydney` |
| Countries | `/countries/:slug` | `/countries/united-states` |
| Sectors | `/sectors/:slug` | `/sectors/technology` |
| Events | `/events/:slug` | `/events/aus-tech-summit` |
| Content | `/content/:slug` | `/content/market-entry-guide` |

### Slug Convention
- Lowercase, hyphen-separated: `new-south-wales`, `auckland-region`, `gold-coast`
- Unique constraint enforced at database level
- URL-safe characters only

### Recommendations
- The existing slug pattern is well-established and SEO-friendly. No changes needed.
- For NZ cities that share names with NZ regions (e.g., Auckland city vs Auckland Region), the slugs are differentiated: `auckland` (city) vs `auckland-region` (region).
- Consider adding `<link rel="canonical">` tags and structured data (JSON-LD `Place` schema) to location detail pages for enhanced SEO.

---

## 4. Cross-Entity Linking

### Current State: Keyword Matching
Each location has 5 keyword arrays (`service_keywords`, `event_keywords`, `content_keywords`, `lead_keywords`, `keywords`). Hooks fetch all rows from a directory table and filter client-side.

### Future State: FK-Based Filtering
With `location_id` on directory tables, the detail page can show precise counts and filtered results:

```sql
-- "12 service providers in Sydney"
SELECT count(*) FROM service_providers WHERE location_id = '<sydney-uuid>';

-- Direct FK query (faster, more accurate)
SELECT * FROM service_providers WHERE location_id = '<sydney-uuid>';
```

### Recommended Transition Path
1. **Phase 1 (done):** Add `location_id` FK columns to directory tables
2. **Phase 2 (next):** Build an admin tool or script to backfill `location_id` values by matching text `location` fields to `locations.name`
3. **Phase 3:** Update location hooks to use FK-based filtering when `location_id` is populated, falling back to keyword matching for unlinked rows
4. **Phase 4:** Display entity counts on LocationCard: "8 service providers, 5 events"

---

## 5. AI/RAG Readiness

The locations schema is well-suited for AI-powered recommendations and market entry plan generation:

### Embedding-Ready Fields
| Field | Embedding Value |
|-------|----------------|
| `description` | Rich text summarizing business environment |
| `hero_description` | Additional context for vector similarity |
| `key_industries[]` | Structured industry tags for filtering |
| `economic_indicators` (JSONB) | GDP, unemployment, earnings data |
| `business_environment_score` | Numeric ranking for sorting |
| `startup_ecosystem_strength` | Categorical strength indicator |
| `government_agency_name/website` | Structured support resource data |

### Recommendations for AI Integration
- The `description` + `hero_description` + `key_industries` concatenation provides rich text for embedding generation
- `economic_indicators` JSONB can be flattened into structured prompts for market comparison
- The `parent_location_id` hierarchy enables "if you're interested in Sydney, also consider NSW" recommendations
- `country` enables scoping AI searches to AU-only, NZ-only, or both

---

## 6. Quick Wins

### 1. Backfill `location_id` on Service Providers (1-2 hours)
Most service providers have simple location text ("Sydney, NSW", "Melbourne, VIC"). A SQL script can match these to location slugs with ~80% accuracy, with manual review for edge cases like "Sydney & Melbourne".

### 2. Add Entity Counts to LocationCard (30 minutes)
Query `service_providers`, `events`, etc. with keyword matching and show counts: "8 Service Providers | 5 Events". This gives users immediate value signals before clicking into a location.

### 3. Add Structured Data (JSON-LD) to Location Pages (1 hour)
Add `Place` schema markup to LocationPage for SEO:
```json
{
  "@type": "Place",
  "name": "Sydney",
  "address": { "@type": "PostalAddress", "addressCountry": "AU" },
  "description": "..."
}
```
This improves search engine visibility for location-specific queries like "market entry Sydney Australia".
