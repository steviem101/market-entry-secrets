
# Inline Source Citations Throughout Report

## What This Does

Currently, the 23 source URLs sit in a collapsed list at the bottom of the report with no connection to the text they support. This change will add clickable numbered citations (like Wikipedia footnotes) directly within the report prose, so readers can see exactly which claim is backed by which source.

For example, instead of:

> The Australian AI market is projected to reach USD 8.48 billion by 2030.

it would render as:

> The Australian AI market is projected to reach USD 8.48 billion by 2030. **[1]**

where **[1]** is a small superscript link that either scrolls down to the Sources section or shows a tooltip with the source URL.

---

## How It Works (Two Parts)

### Part 1: Backend -- Tell the AI to Cite Its Sources

The AI currently receives Perplexity research data and a numbered citation list, but is never told to actually reference those numbers in its output. This change updates the prompt instructions.

**What changes:**
- Update the **system prompt** in `generate-report/index.ts` (the one passed to the AI for each section) to include an instruction like: *"When referencing data, statistics, or claims from the provided market research, include inline citations using the format [N] where N is the source number from the provided citations list."*
- Ensure the `market_research_citations` variable (already formatted as `[1] url, [2] url...`) is passed to **all sections that receive market research data** (executive_summary, swot_analysis, competitor_landscape, action_plan) -- not just the two that currently include it
- Also update the **polish pass** prompt to preserve citation markers `[N]` during editing

**Important note:** This only affects newly generated reports. Existing reports (like the one you're viewing now) won't have inline citations since their prose was generated without them.

### Part 2: Frontend -- Render Citations as Clickable Links

Parse the `[N]` markers in the markdown and render them as interactive superscript links.

**What changes:**

1. **New component: `InlineCitation`** -- A small superscript badge/link that shows the source number. On click, it scrolls to the matching source in the Sources section. On hover, it shows a tooltip with the source domain name.

2. **Update `ReportSection.tsx`** -- Accept a `citations` prop (the array of URLs). Use a custom `react-markdown` component override or a post-processing step to find `[N]` patterns in the rendered text and replace them with `<InlineCitation>` components. The component maps the number to the URL from the citations array.

3. **Update `ReportSources.tsx`** -- Add anchor IDs to each source item (e.g., `id="source-1"`, `id="source-2"`) so the inline citations can scroll to them. Also highlight the targeted source briefly when scrolled to (CSS `:target` pseudo-class with a subtle flash animation).

4. **Update `ReportView.tsx` and `SharedReportView.tsx`** -- Pass the `perplexityCitations` array down to each `ReportSection` component.

---

## Technical Details

| File | Changes |
|---|---|
| `supabase/functions/generate-report/index.ts` | Add citation instruction to the section AI system prompt; pass `market_research_citations` to all research-backed sections; update polish pass prompt to preserve `[N]` markers |
| `src/components/report/ReportSection.tsx` | Accept `citations` prop; post-process markdown to convert `[N]` patterns into clickable superscript links with tooltips |
| `src/components/report/ReportSources.tsx` | Add `id="source-N"` anchors to each list item; add CSS `:target` highlight animation |
| `src/pages/ReportView.tsx` | Pass `perplexityCitations` to each `ReportSection` |
| `src/pages/SharedReportView.tsx` | Same -- pass citations to each `ReportSection` |
| `src/index.css` | Add styles for `.inline-citation` superscript badge and `#source-N:target` highlight animation; print styles to show citation numbers without interactivity |

No new dependencies needed. The citation parsing uses a simple regex (`/\[(\d+)\]/g`) and React's `react-markdown` custom components.

---

## Edge Cases Handled

- **No citations available**: If the citations array is empty, `[N]` markers render as plain text (no broken links)
- **Citation number out of range**: If the AI outputs `[25]` but there are only 23 sources, it renders as plain text
- **Existing reports**: Reports generated before this change won't have `[N]` markers in their prose, so they display exactly as they do now -- no visual regression
- **Gated sections**: Gated sections don't render prose, so no citation parsing is needed there
- **Polish pass**: The polish prompt is updated to explicitly preserve `[N]` citation markers so they aren't removed during editing
