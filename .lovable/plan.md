

# Enhanced Research Intelligence Pipeline

## Overview

This plan adds 7 new research capabilities to the report generation pipeline, all running in parallel with the existing queries to minimize latency. The changes are entirely in the backend edge function and the report template prompts -- the frontend already supports rendering any new data injected into sections.

---

## New Research Queries

### 1. Bilateral Trade Intelligence (Perplexity)

A new Perplexity query using the user's `country_of_origin` to research the specific trade corridor between their home country and Australia.

**Query**: "Trade relationship between {country_of_origin} and Australia in {industry_sector}: bilateral agreements, free trade agreements, export statistics, success stories of {country_of_origin} companies entering Australia"

- Uses `sonar` model with `year` recency
- Citations merge into the shared citations pool
- Result stored in a new template variable `market_research_bilateral_trade`
- Injected into: `executive_summary`, `swot_analysis`, and `action_plan` prompts

### 2. Cost of Doing Business (Perplexity)

Practical operational costs for the target regions.

**Query**: "Cost of doing business in Australia {target_regions} for {industry_sector}: average office rent, local salaries for key roles, corporate tax rate, GST, employer superannuation obligations, typical setup costs for a foreign company"

- Result stored as `market_research_cost_of_business`
- Injected into: `action_plan` and `swot_analysis` prompts (informs budgeting advice and threats/opportunities)

### 3. Government Grants and Incentives (Perplexity)

Targeted search for available financial support.

**Query**: "Australian government grants, incentives, R&D tax incentives, landing pad programs, and funding opportunities for international {industry_sector} companies from {country_of_origin} setting up in {target_regions}"

- Result stored as `market_research_grants`
- Injected into: `action_plan` prompt (Phase 1 funding opportunities) and `executive_summary` (highlight key incentives)

### 4. Upgrade Market Landscape to sonar-pro

The existing `landscape` Perplexity query currently uses `sonar`. This switches it to `sonar-pro` for deeper multi-step analysis, more citations, and richer data points -- the single highest-impact change for research quality.

### 5. Key Metrics via Perplexity Structured Output

A new Perplexity call using `sonar` with a JSON schema response format to extract 4-6 hard data points (market size, CAGR, key growth drivers, number of active players, etc.).

**Response schema**:
```text
{
  "metrics": [
    { "label": "Market Size", "value": "$8.48B", "context": "2024 estimate" },
    { "label": "CAGR", "value": "5.1%", "context": "2024-2030 projected" },
    ...
  ]
}
```

- Stored as `key_metrics` in the report JSON metadata
- The frontend `ReportView.tsx` renders these as stat cards above the Executive Summary section

### 6. End Buyer Deep Research (Perplexity)

Currently, end buyer URLs are scraped via Firecrawl and analysed with the same competitor analysis prompt. This replaces that with a dedicated Perplexity query per buyer industry + a refined Firecrawl extraction prompt focused on procurement.

**Perplexity query**: "How do {end_buyer_industry} companies in Australia procure {industry_sector} services? Key procurement channels, typical buying cycles, RFP processes, partnership models"

**Firecrawl extraction prompt update**: Change from competitor intelligence framing to buyer intelligence: "Analyse this company as a potential customer. Extract: what they buy, how they procure, partnership programs, supplier requirements."

- Result stored as `end_buyer_research` and `end_buyers_analysis_json`
- Injected into: `executive_summary` (target customer insights), `lead_list` (buyer matching context), and `action_plan` (go-to-market approach)

### 7. External Event Discovery (Firecrawl Search)

Supplement the internal events database with real-world industry events discovered via web search.

**Firecrawl Search query**: "{industry_sector} conference trade show expo Australia {target_regions} 2025 2026"

- Returns up to 5 results, AI extracts structured event data (name, date, location, URL, relevance)
- Stored as `discovered_events_json` template variable
- Injected into: `events_resources` prompt alongside the existing `matched_events_json`

---

## Execution Architecture

All new queries run in the existing `Promise.all` parallel block alongside the current 5 operations, keeping total latency roughly the same.

```text
Promise.all([
  enrichCompanyDeep(...)          // existing
  runMarketResearch(...)          // MODIFIED: adds 4 new queries, upgrades model
  searchMatches(...)              // existing
  searchCompetitors(...)          // existing  
  scrapeEndBuyers(...)            // MODIFIED: new Perplexity buyer research
  discoverExternalEvents(...)     // NEW
  extractKeyMetrics(...)          // NEW
])
```

The `runMarketResearch` function expands from 3 parallel Perplexity calls to 6:
1. Market landscape (upgraded to `sonar-pro`)
2. Regulatory requirements (unchanged)
3. Recent news (unchanged)
4. Bilateral trade intelligence (new)
5. Cost of doing business (new)
6. Government grants and incentives (new)

---

## Frontend Changes

### Key Metrics Stat Cards

A new `ReportKeyMetrics` component renders 3-6 stat cards in a responsive grid above the Executive Summary. Each card shows:
- A bold value (e.g. "$8.48B")
- A label (e.g. "Market Size")
- A small context line (e.g. "2024 estimate")

This is conditionally rendered -- only appears if `key_metrics` data exists in the report metadata (backward compatible with existing reports).

### Discovered Events in Match Cards

External events discovered by Firecrawl are added to the `events_resources` section's match cards alongside internal directory events, with a small "Web" badge to distinguish them from directory entries.

### Report Config Updates

- Add `key_metrics` section config styling
- Update `SECTION_CONFIG` labels for discovered events badge support

---

## Template Variable Summary

| New Variable | Source | Injected Into |
|---|---|---|
| `market_research_bilateral_trade` | Perplexity (sonar) | executive_summary, swot_analysis, action_plan |
| `market_research_cost_of_business` | Perplexity (sonar) | action_plan, swot_analysis |
| `market_research_grants` | Perplexity (sonar) | action_plan, executive_summary |
| `end_buyer_research` | Perplexity (sonar) | executive_summary, lead_list, action_plan |
| `end_buyers_analysis_json` | Firecrawl + AI | lead_list |
| `discovered_events_json` | Firecrawl Search + AI | events_resources |
| `key_metrics_json` | Perplexity structured output | stored in report metadata, rendered by frontend |

---

## Database Changes

**Update `report_templates` table**: Add the new template variables to each affected section's `variables` array and append new research data blocks to the relevant prompt bodies:

- `executive_summary`: Add bilateral trade, grants, end buyer research
- `swot_analysis`: Add bilateral trade, cost of business
- `action_plan`: Add bilateral trade, cost of business, grants, end buyer research
- `events_resources`: Add discovered events
- `lead_list`: Add end buyer research and analysis

---

## Technical File Changes

| File | Changes |
|---|---|
| `supabase/functions/generate-report/index.ts` | Expand `runMarketResearch` with 3 new queries + sonar-pro upgrade; add `discoverExternalEvents` function; add `extractKeyMetrics` function; update `scrapeKnownCompetitors` buyer prompt; add all new variables to the variables map; add discovered events to matches; store key_metrics in reportJson metadata |
| `src/components/report/ReportKeyMetrics.tsx` | New component: stat card grid for key metrics |
| `src/pages/ReportView.tsx` | Render `ReportKeyMetrics` above first section if data exists; pass discovered event badges |
| `src/pages/SharedReportView.tsx` | Same key metrics rendering |
| `src/components/report/ReportMatchCard.tsx` | Add optional "Web" source badge for externally discovered matches |
| `src/components/report/reportSectionConfig.ts` | No structural changes needed |
| Database migration | Update `report_templates` rows with expanded prompts and variables arrays |

---

## Backward Compatibility

- All new variables default to empty strings or "No data available" if their API calls fail
- Existing reports render exactly as before (no `key_metrics` in metadata = component doesn't render)
- Template variable substitution is additive -- old prompts without new `{{variables}}` simply don't use them
- Every new API call is wrapped in try/catch with fallback values (best-effort pattern)

---

## API Cost Impact

- 3 additional Perplexity calls per report (sonar model, ~$0.005 each)
- 1 Perplexity call upgraded from sonar to sonar-pro (~$0.005 more)
- 1 additional Firecrawl Search call (~1 credit)
- All calls run in parallel, so wall-clock time increase is minimal (bounded by the slowest call, which is typically the existing deep scrape)

