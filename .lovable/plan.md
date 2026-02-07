

# Comprehensive Report Improvements Plan

## Overview

This plan addresses all 6 issues identified in the report quality analysis. The improvements span the report view UI, the matching algorithm in the Edge Function, and the data pipeline. They are ordered by impact.

---

## Improvement 1: Render Markdown Properly

**Problem**: Report section content contains Markdown syntax (`**bold**`, `### headings`, `* lists`) but the `ReportSection` component displays it as raw text using `whitespace-pre-wrap`.

**Solution**: Install `react-markdown` and update `ReportSection` to render formatted HTML instead of plain text.

**File: `src/components/report/ReportSection.tsx`**
- Replace the plain `{content}` div with a `<ReactMarkdown>` component
- Apply Tailwind prose classes for styling (headings, lists, bold, links)
- Remove `whitespace-pre-wrap` since Markdown handles line breaks

---

## Improvement 2: Add Sources/Citations Section

**Problem**: Perplexity returns 19+ citation URLs that are stored in `report_json.metadata.perplexity_citations` but never shown to users. This is a missed trust and credibility signal.

**Solution**: Create a new `ReportSources` component and render it after the last report section.

**File: `src/components/report/ReportSources.tsx`** (new)
- Accepts an array of citation URLs
- Renders as a collapsible card with a "Sources" header
- Each citation displayed as a numbered, clickable external link
- Shows domain name extracted from URL for readability (e.g., "ibisworld.com", "pwc.com.au")

**File: `src/pages/ReportView.tsx`**
- Extract `reportJson.metadata.perplexity_citations` array
- Render `<ReportSources>` between the last section and `<ReportFeedback>`

---

## Improvement 3: Improve Service Provider Matching (Industry + Services)

**Problem**: The current matching query only filters by location, returning generic providers (McKinsey, Accenture) regardless of the user's industry or requested services. With only 8 providers in the database, the AI then hallucinates additional providers not in the directory.

**Solution**: Update `searchMatches` in the Edge Function to also filter by `services_needed` and `industry_sector`, and tell the AI prompt to only reference matched providers (no inventing).

**File: `supabase/functions/generate-report/index.ts`**
- In the `service_providers` query, add an `or()` filter on `services` array overlap with `intake.services_needed`
- Apply similar industry-aware filtering to `community_members` (match specialties to services needed)
- Update the `service_providers` template prompt (via migration) to instruct the AI: "Only recommend providers from the list below. If the list is empty, state that no matching providers were found in our directory and suggest the user browse the full directory."

**Database migration**: Update the `service_providers` template prompt to prevent hallucinated recommendations when no matches exist.

---

## Improvement 4: Fix Empty Events Matching

**Problem**: All 22 events in the database have past dates, so the `gte("date", today)` filter returns 0 results. The AI then invents fictional events.

**Solution**: 
- Include past events as well (they demonstrate the types of events available), but sort future events first
- Add keyword/category matching against the intake's industry sector
- Update the template prompt to clarify that listed events are examples from the directory, not guaranteed upcoming events

**File: `supabase/functions/generate-report/index.ts`**
- Remove the `gte("date", today)` filter
- Sort by date descending to show most recent events
- Add category/location matching against intake data
- Limit to 5 results

**Database migration**: Update `events_resources` template prompt to say "Here are relevant events from our directory (check dates for upcoming editions)."

---

## Improvement 5: Deep-Link Match Cards to Actual Profiles

**Problem**: Match cards link to generic directory listing pages (e.g., `/service-providers`, `/community`) instead of individual profile pages. The app does not have individual profile routes for providers/members.

**Solution**: Since individual profile pages don't exist as routes, improve the links to at least include search/filter context where possible.

**File: `supabase/functions/generate-report/index.ts`**
- For `service_providers`: change `link` to `/service-providers` (no change possible without individual routes)
- For `content_items`: already deep-links to `/content/${slug}` (correct)
- For `events`: already links to `/events` (no individual routes)

**File: `src/components/report/ReportMatchCard.tsx`**
- Distinguish between internal links (use `<Link>`) and external links (use `<a target="_blank">`)
- If a match has a `website` field, show a secondary "Website" button that opens the external URL
- Add the provider's website URL to the match data in the Edge Function

---

## Improvement 6: Add "Powered by Research" Indicator

**Problem**: Users don't know that their report includes real-time market research data, which is a major differentiator.

**Solution**: Add a small indicator badge in the report header showing that Perplexity research was used.

**File: `src/components/report/ReportHeader.tsx`**
- Accept a new `perplexityUsed` prop (boolean)
- When true, display a small badge/chip: "Powered by AI Research" with a globe or search icon
- Positioned next to the tier badge in the header metadata row

**File: `src/pages/ReportView.tsx`**
- Pass `reportJson.metadata?.perplexity_used` to `ReportHeader`

---

## Summary of Files Changed

| File | Changes |
|------|---------|
| `src/components/report/ReportSection.tsx` | Replace raw text with `ReactMarkdown` rendering |
| `src/components/report/ReportSources.tsx` | New component for citation display |
| `src/components/report/ReportMatchCard.tsx` | Add external website link support |
| `src/components/report/ReportHeader.tsx` | Add "Powered by Research" badge |
| `src/pages/ReportView.tsx` | Pass citations to ReportSources, pass perplexityUsed to header |
| `supabase/functions/generate-report/index.ts` | Improve matching (industry/services filter, remove date filter on events, add website to matches) |
| Database migration | Update 3 template prompts (service_providers, events_resources, prevent hallucination) |

## New Dependency

- `react-markdown` -- lightweight Markdown renderer for React (widely used, ~30KB)

