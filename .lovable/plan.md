

# Integrate Perplexity API into Report Generation

## What This Improves

The current report pipeline has three data sources:
1. **Firecrawl** -- scrapes the company's own website
2. **Internal database** -- matches service providers, events, leads, etc.
3. **Gemini AI** -- generates prose from templates (but with no external market data)

The gap: sections like Executive Summary, SWOT Analysis, and Action Plan are written by AI *without any real market research*. The AI is essentially guessing about the Australian market landscape for each industry.

**With Perplexity**, the pipeline gains a grounded research step that fetches real, cited market data before generating each section.

## How It Works

The `generate-report` Edge Function gains a new step between enrichment and section generation:

```text
Current Flow:
  Firecrawl (website) --> DB Matches --> AI Generation

New Flow:
  Firecrawl (website) --> Perplexity (market research) --> DB Matches --> AI Generation
                                                                            |
                                                              (research injected into prompts)
```

Perplexity runs 3 targeted research queries based on the intake form data:
1. **Market landscape** -- industry size, trends, competitors in Australia
2. **Regulatory environment** -- compliance, visa, licensing requirements
3. **Recent news** -- latest developments in the sector/region

The research results (with citations) are then injected as a `{{market_research}}` variable into the template prompts, giving the AI grounded facts to work with instead of hallucinating.

## Implementation Steps

### Step 1: Connect Perplexity to the project

Link the existing Perplexity workspace connection to this project so the `PERPLEXITY_API_KEY` secret becomes available in Edge Functions.

### Step 2: Add a `callPerplexity` helper function

Add a new helper to the `generate-report` Edge Function that calls the Perplexity API with structured search queries. Uses the `sonar` model for fast, grounded responses with citations.

### Step 3: Add a market research step to the pipeline

After Firecrawl enrichment and before section generation, run 3 parallel Perplexity queries:

| Query | Purpose | Example |
|-------|---------|---------|
| Market landscape | Industry data for the target region | "SaaS market size and trends in Australia 2025" |
| Regulatory/compliance | Entry requirements | "Requirements for US tech company entering Australian market" |
| Recent news | Timely developments | "Recent news about fintech regulation in Australia" |

Each query uses `search_recency_filter: 'year'` to keep results current.

### Step 4: Inject research into template variables

Add three new template variables that any report section can reference:

- `{{market_research_landscape}}` -- market size, trends, competitors
- `{{market_research_regulatory}}` -- compliance and entry requirements
- `{{market_research_news}}` -- recent relevant developments
- `{{market_research_citations}}` -- source URLs for credibility

### Step 5: Update report templates to use research

Update the `report_templates` database prompts for key sections:

- **executive_summary** -- include market landscape data for grounded opportunity assessment
- **swot_analysis** -- use regulatory research for Threats, market data for Opportunities
- **action_plan** -- reference regulatory requirements in Phase 1, market trends in Phase 3

### Step 6: Store citations in report metadata

Save Perplexity's citation URLs in the report JSON so they can be displayed as "Sources" in the report view, adding credibility.

## Technical Details

### Perplexity helper function (added to Edge Function)

```typescript
async function callPerplexity(
  apiKey: string,
  query: string,
  options?: { recency?: string; domains?: string[] }
): Promise<{ content: string; citations: string[] }> {
  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: "Be precise and concise. Focus on factual, data-driven insights." },
        { role: "user", content: query },
      ],
      search_recency_filter: options?.recency || "year",
      search_domain_filter: options?.domains,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Perplexity error:", resp.status, text);
    return { content: "", citations: [] };
  }

  const data = await resp.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}
```

### Research queries (run in parallel)

```typescript
const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
let marketResearch = { landscape: "", regulatory: "", news: "", citations: [] };

if (perplexityKey) {
  const [landscape, regulatory, news] = await Promise.allSettled([
    callPerplexity(perplexityKey,
      `${intake.industry_sector} market size, trends, key players, and growth opportunities in Australia ${targetRegionsText}. Include specific data points and statistics.`
    ),
    callPerplexity(perplexityKey,
      `Requirements, regulations, compliance, and licensing for a ${intake.country_of_origin} ${intake.industry_sector} company entering the Australian market. Include visa, tax, and legal entity requirements.`
    ),
    callPerplexity(perplexityKey,
      `Recent news and developments in ${intake.industry_sector} in Australia in the last 6 months`,
      { recency: "month" }
    ),
  ]);
  // Extract results, merge citations...
}
```

### Template variable additions

The existing `variables` object gets 4 new entries:

```typescript
variables.market_research_landscape = marketResearch.landscape;
variables.market_research_regulatory = marketResearch.regulatory;
variables.market_research_news = marketResearch.news;
variables.market_research_citations = marketResearch.citations.join("\n");
```

### Database template updates (SQL migration)

Update prompts for `executive_summary`, `swot_analysis`, and `action_plan` to reference the new variables. Example for executive_summary:

```sql
UPDATE report_templates
SET prompt_body = prompt_body || E'\n\nUse the following real market research data to ground your analysis:\n{{market_research_landscape}}\n\nCite specific data points where possible.'
WHERE section_name = 'executive_summary';
```

### Best-effort design

Like Firecrawl, all Perplexity calls are wrapped in try/catch. If the API key is missing or calls fail, the report still generates -- just without the external research layer. The report metadata will indicate whether Perplexity research was used.

## Impact on Generation Time

- Current pipeline: ~30-60 seconds
- With Perplexity: adds ~5-10 seconds (3 parallel queries)
- Well within the existing 300-second timeout

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-report/index.ts` | Add `callPerplexity` helper, research step, new template variables, citations in metadata |
| `supabase/config.toml` | No change needed (already has 300s timeout) |
| Database migration | Update 3 report template prompts to use `{{market_research_*}}` variables |

