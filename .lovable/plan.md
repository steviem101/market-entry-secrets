

# Report Generation Pipeline -- Performance Audit & Optimisation Plan

## Current Performance Baseline (from real data)

| Report ID | Total Time | Providers Enriched | Competitors | Polish | Sections |
|-----------|-----------|-------------------|-------------|--------|----------|
| 2a989963 | **41s** | 7 | 4 | No | 8 |
| 18c4fe1f | **42s** | 5 | 8 | No | 8 |
| 2b22b378 | **116s** | 2 | 8 | Yes | 4 |
| 680aaa94 | **134s** | 5 | 8 | Yes | 8 |
| 1c3af4c7 | **128s** | 0 | 10 | Yes | 8 |
| a45efe30 | **34s** | 0 | 4 | No | 8 |
| 9913cc2e | **39s** | 0 | 6 | No | 8 |

**Key finding:** The two most recent reports (after the "save before polish" fix) completed in ~41s without polish. Earlier reports with polish took 116-134s. The pipeline is now finishing, but there are clear bottlenecks that can cut the time significantly.

---

## Bottleneck Analysis (Ranked by Time Impact)

### 1. Sequential Provider Enrichment -- BIGGEST WIN (~10-20s wasted)

**Problem:** After the main parallel block finishes (line 1117), `enrichMatchedProviders()` runs as a **separate sequential step** before section generation begins. It scrapes up to 10 provider websites one-by-one (each with a 10s timeout).

**Evidence:** Reports with 5-7 enriched providers take ~42s vs ~34s for 0 enriched providers -- a ~8s penalty that adds directly to the critical path.

**Fix:** Move provider enrichment INTO the main `Promise.all()` block at line 1079. The providers come from the DB match, so this requires a two-phase approach: start the DB query first, then enrich providers in parallel with other tasks.

### 2. Section Generation in Batches of 3 (~15-25s)

**Problem:** 8 templates are generated in batches of 3 (lines 1206-1257). That's 3 sequential rounds of AI calls: batch(3) -> batch(3) -> batch(2). Each batch waits for the slowest section before starting the next.

**Fix:** Increase batch size to 8 (all at once). The Lovable AI Gateway can handle 8 parallel requests. This collapses 3 sequential rounds into 1, saving the latency of the 2 slowest individual sections (~10-15s).

### 3. Sequential Known Competitor Scraping (~10-15s for 5 competitors)

**Problem:** Inside `searchCompetitors()` (line 322), known competitors are scraped AND analysed BEFORE the web search starts. Each competitor involves a Firecrawl scrape (15s timeout) + an AI call -- and this happens before the general competitor search even begins.

**Fix:** Run known competitor scraping and the general Firecrawl search in parallel rather than sequentially.

### 4. Redundant Perplexity Calls (~5-8s saveable)

**Problem:** 7 total Perplexity calls run: 6 in `runMarketResearch()` + 1 in `extractKeyMetrics()`. The key metrics query overlaps significantly with the landscape query (both ask about market size, growth, and key players for the same industry/region).

**Fix:** Merge the key metrics extraction into the landscape query by asking `sonar-pro` (already the most capable model) to include structured metrics in its response. This eliminates 1 API call entirely.

### 5. External Event Discovery is Low-Value (~5-8s)

**Problem:** `discoverExternalEvents()` makes a Firecrawl search + AI analysis call to find events on the web. But the internal events DB already provides matches, and the discovered events are just appended as "Web Discovery" tags with no rich data.

**Fix:** Make this conditional -- skip if the internal DB already returned 3+ events. Or move to a lower-priority "best effort" step after the report is saved.

### 6. End Buyer Scraping Scales Poorly (~15s per buyer)

**Problem:** Each end buyer triggers a Firecrawl scrape (15s timeout) + AI analysis. With 5 end buyers, this can add 15-30s to the parallel block since they compete for resources.

**Fix:** Limit to 3 end buyers max in the parallel phase, cap scrape timeout at 8s, and reduce the content slice from 3000 to 2000 chars.

---

## Proposed Changes

### Change 1: Move provider enrichment into the main parallel block

File: `supabase/functions/generate-report/index.ts`

Restructure the pipeline so that provider enrichment runs alongside the other operations rather than blocking the pipeline after. The approach:
- Start the DB match query in the parallel block
- After DB matches return, immediately fire off provider enrichment as a parallel sub-task
- The overall `Promise.all` waits for all tasks including enrichment

This requires a small refactor: wrap `searchMatches` + `enrichMatchedProviders` into a single async function that runs inside the parallel block.

### Change 2: Generate all 8 sections in a single batch

File: `supabase/functions/generate-report/index.ts` (lines 1206-1257)

Change the batch size from 3 to the full template count. Instead of:
```
for (let i = 0; i < templates.length; i += 3) {
  batches.push(templates.slice(i, i + 3));
}
```
Use:
```
// Generate all sections in parallel -- single batch
const results = await Promise.allSettled(
  templates.map(async (tmpl) => { ... })
);
```

This eliminates 2 sequential rounds of waiting.

### Change 3: Parallelise known competitor + search competitor flows

File: `supabase/functions/generate-report/index.ts` (inside `searchCompetitors`)

Currently known competitors are scraped, then web search runs. Change to run both in parallel:
```
const [knownResults, searchResults] = await Promise.all([
  scrapeKnownCompetitors(...),
  firecrawlSearch(firecrawlKey, query, 5),
]);
```

### Change 4: Merge key metrics into market research

File: `supabase/functions/generate-report/index.ts`

Remove the separate `extractKeyMetrics()` call from the parallel block. Instead, add a structured metrics extraction instruction to the `sonar-pro` landscape query in `runMarketResearch()`, or extract metrics from the landscape response using a fast AI call after it returns.

### Change 5: Make external event discovery conditional

File: `supabase/functions/generate-report/index.ts`

Skip `discoverExternalEvents()` in the main parallel block. Instead, check if internal DB events matched 3+ results; if so, skip. If not, run as a lightweight post-save enrichment (similar to polish).

### Change 6: Reduce timeouts and caps for scraping operations

File: `supabase/functions/generate-report/index.ts`

- Reduce `firecrawlMap` timeout from 8s to 5s (line 49)
- Reduce key page scrapes from 3 to 2 (line 163)
- Reduce end buyer scrape timeout from 15s to 8s (line 404)
- Reduce known competitor scrape timeout from 15s to 10s (line 279)
- Reduce content slices from 3000-4000 chars to 2000 chars for AI analysis (saves tokens and latency)

### No Frontend Changes Required

The polling mechanism and overlay already work well. The improvements are entirely backend.

---

## Expected Impact

| Metric | Before | After (Estimated) |
|--------|--------|-------------------|
| Total time (no polish) | ~40s | **~22-28s** |
| Total time (with polish) | ~120s | **~35-45s** |
| Sequential provider enrichment | ~10-15s | **0s** (parallel) |
| Section generation | ~20s (3 batches) | **~8-12s** (1 batch) |
| Competitor analysis | ~15s (sequential) | **~10s** (parallel) |
| External events | ~8s | **0-5s** (conditional) |

The most impactful changes are #1 (provider enrichment parallelisation) and #2 (single-batch section generation), which together could save 15-25 seconds from the critical path.

