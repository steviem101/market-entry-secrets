

# Enhanced Firecrawl Usage in Report Generation

## Current State

Firecrawl is used **once** during report generation -- to scrape the user's own company website and produce a 2-3 sentence summary. This is Step 2 in the pipeline (lines 284-314 of the Edge Function):

```text
Pipeline today:
1. Fetch intake form from DB
2. Scrape user's website via Firecrawl --> 2-sentence summary  (ONLY Firecrawl usage)
3. Perplexity market research (3 parallel calls)
4. DB directory matching (7 tables queried)
5. AI generates each report section from prompts + data
6. Store report
```

The scrape produces a basic JSON object like:
```json
{
  "summary": "Daon is a global leader in identity verification...",
  "industry": "Cybersecurity / IAM",
  "maturity": "Enterprise"
}
```

This is good but significantly underutilises Firecrawl. The rest of the report relies on Perplexity for market research and the internal database for matches -- but there is no web enrichment of the **matched providers themselves**, no **competitor scraping**, and no **deeper company analysis**.

---

## Proposed Enhancements (3 additions)

### Enhancement 1: Scrape Matched Service Provider Websites

**Problem**: The 8 service providers in the database have only a name, location, services array, and a 1-line description. When the AI writes recommendations, it works with almost no context about what these providers actually do, resulting in generic recommendations.

**Solution**: After directory matching returns service providers, scrape their websites via Firecrawl to extract rich descriptions. Feed this into the AI prompt so it can write informed, specific recommendations.

**What changes in `generate-report/index.ts`**:
- After `searchMatches()` returns, loop through matched `service_providers` (max ~10)
- For each provider with a `website` field, call Firecrawl scrape (parallel, with a 10-second timeout per call)
- Extract the first 1,500 characters of markdown from each scrape
- Add an `enriched_description` field to each provider match object
- Update `{{matched_providers_json}}` to include this richer data so the AI prompt has real context

**Example before/after**:
- Before: `{"name": "Sleek", "services": ["Company Formation", "Accounting"], "description": null}`
- After: `{"name": "Sleek", "services": ["Company Formation", "Accounting"], "enriched_description": "Sleek helps entrepreneurs set up companies in Australia with online incorporation, registered addresses, ASIC compliance, bookkeeping, and tax filing. They specialise in foreign companies establishing Australian entities..."}`

**Impact**: The `service_providers` section will contain specific, accurate descriptions of what each provider does and why they are relevant -- rather than generic AI-generated guesses.

---

### Enhancement 2: Competitive Landscape via Firecrawl Search

**Problem**: There is no `competitor_landscape` report section. The SWOT analysis references competitors generically based on Perplexity research, but there is no dedicated competitive intelligence.

**Solution**: Add a new Firecrawl search step that finds the user's direct competitors in the Australian market, then scrapes the top 3 for key details. Create a new report template section for this.

**What changes**:

1. **New function `searchCompetitors()`** in the Edge Function:
   - Uses Firecrawl search: `"${intake.industry_sector} companies in Australia ${intake.target_regions}"`
   - Takes the top 3 results and scrapes each to extract company name, what they do, and key differentiators
   - Returns structured competitor data

2. **New template variable**: `{{competitor_analysis_json}}`

3. **Database migration**: Insert a new `report_templates` row:
   - `section_name`: `competitor_landscape`
   - `visibility_tier`: `growth` (paid feature)
   - Prompt instructs the AI to compare the user's company against identified Australian competitors using real scraped data

4. **Template variables**: Add `competitor_analysis_json` to the variables map

**Impact**: Paid-tier users get a real competitive analysis grounded in actual Australian companies, not AI-generated guesses. This is a high-value differentiator.

---

### Enhancement 3: Deeper Company Analysis (Multi-Page Scrape)

**Problem**: Currently only the homepage is scraped (`onlyMainContent: true`), producing a thin 2-3 sentence summary. Key pages like "About", "Products", "Team" are missed.

**Solution**: Use Firecrawl's **map** endpoint first to discover key pages on the user's website, then scrape the 3-4 most relevant pages (about, products/services, team, case studies) for a much richer company profile.

**What changes in `generate-report/index.ts`**:

1. Replace the single `scrape` call with:
   - Call Firecrawl **map** on the user's website to discover all URLs (fast, 1-2 seconds)
   - Filter for key pages (URLs containing "about", "product", "service", "team", "case-stud")
   - Scrape up to 3 additional pages beyond the homepage (parallel)
   - Concatenate all markdown content (capped at 4,000 chars total)

2. Update the AI enrichment prompt to extract more structured data:
   ```json
   {
     "summary": "...",
     "industry": "...",
     "maturity": "...",
     "products": ["Product A", "Product B"],
     "key_clients": ["Client X", "Client Y"],
     "team_size_indicators": "...",
     "unique_selling_points": ["USP 1", "USP 2"]
   }
   ```

3. Store the enriched data in `user_intake_forms.enriched_input` (already exists)

4. Create a new template variable `{{enriched_company_profile}}` with the full structured data so all sections can reference it

**Impact**: The executive summary, SWOT analysis, and action plan will all be grounded in a much deeper understanding of the company -- its actual products, clients, and strengths.

---

## Implementation Order and File Changes

### Step 1: Deeper Company Scrape (Enhancement 3)
- **File**: `supabase/functions/generate-report/index.ts`
  - New `enrichCompanyDeep()` function using map + multi-page scrape
  - Replace existing single-page scrape block (lines 284-314)
  - Add `enriched_company_profile` to template variables

### Step 2: Scrape Matched Providers (Enhancement 1)
- **File**: `supabase/functions/generate-report/index.ts`
  - New `enrichMatchedProviders()` function
  - Called after `searchMatches()`, enriches up to 10 providers in parallel
  - Updates `matched_providers_json` with `enriched_description`

### Step 3: Competitor Search (Enhancement 2)
- **File**: `supabase/functions/generate-report/index.ts`
  - New `searchCompetitors()` function using Firecrawl search + scrape
  - Add `competitor_analysis_json` to template variables
- **Database migration**: Insert new `competitor_landscape` template row

### Step 4: Update Template Prompts
- **Database migration**: Update existing template prompts to reference the new enriched data variables (`enriched_company_profile`, `enriched_description` within provider JSON)

---

## Performance Considerations

The current pipeline takes ~29 seconds. Adding these Firecrawl calls will increase generation time. Mitigations:

- All new Firecrawl calls run **in parallel** with existing Perplexity calls (using `Promise.allSettled`)
- Each individual scrape has a **10-second timeout** to avoid blocking
- Provider enrichment is capped at **10 providers** (already the query limit)
- Competitor scrape is capped at **3 results**
- The Edge Function already has a **300-second** wall clock limit, so there is plenty of headroom
- All Firecrawl calls are **best-effort** -- if they fail, the report still generates with the data it has

**Estimated new timeline**: ~35-45 seconds (parallel calls add ~10-15 seconds)

---

## Summary

| Enhancement | What it does | Firecrawl feature used | Impact |
|---|---|---|---|
| Deeper company analysis | Scrape 3-4 pages from user's website | Map + Scrape | Richer executive summary, SWOT |
| Provider enrichment | Scrape matched provider websites | Scrape (parallel) | Specific, accurate recommendations |
| Competitor landscape | Find and analyse Australian competitors | Search + Scrape | New paid-tier section |

All three enhancements are best-effort and gracefully degrade if Firecrawl is unavailable. No new dependencies required -- only changes to the Edge Function and one database migration for the new template.

