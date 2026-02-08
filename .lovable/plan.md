

# Add Readability Polish Step to Report Generation

## Overview

After all 8 report sections are generated individually, a new "polish pass" will run. It will concatenate the visible section content and send it through `google/gemini-2.5-pro` (a stronger reasoning model) with a professional editing prompt. The polished content replaces the raw sections before saving to the database.

## Why a single pass with a stronger model?

- **Consistency**: Individual sections are generated in parallel batches and can have inconsistent tone, formatting, or repeated information. A single pass unifies the voice.
- **Quality uplift**: `gemini-2.5-pro` is a more capable model than `gemini-3-flash-preview` (used for initial generation), giving a meaningful quality improvement without adding a new API key or provider.
- **No new secrets needed**: Uses the same `LOVABLE_API_KEY` already configured.
- **Cost-efficient**: One extra AI call instead of 8 individual polish calls.

## What the polish prompt will do

1. Improve sentence structure and flow
2. Ensure Australian English spelling (e.g., "organisation", "labour", "recognise")
3. Add smooth transitions between sections
4. Remove redundant phrases or repeated information across sections
5. Maintain all factual data, statistics, and citations exactly as-is
6. Keep Markdown formatting intact (headings, bold, bullets, numbered lists)

## Technical Details

### File changed

`supabase/functions/generate-report/index.ts`

### Insertion point

After the section generation loop (line 755) and before the report assembly (line 757). The new code will:

1. Collect all visible section content into a single string with section headers
2. Call `callAI()` using `google/gemini-2.5-pro` with an editing system prompt
3. Parse the polished output back into individual sections
4. Replace each section's content with the polished version
5. Wrap the whole step in a try/catch so that if the polish fails, the original unpolished content is preserved

### New helper function

```text
async function polishReport(
  apiKey: string,
  sections: Record<string, any>,
  sectionOrder: string[]
): Promise<Record<string, any>>
```

This function:
- Filters to only visible sections with content
- Concatenates them with clear `===SECTION: section_name===` delimiters
- Sends to `google/gemini-2.5-pro` with an editing prompt
- Splits the response back by the same delimiters
- Returns the updated sections object (or the original if anything fails)

### Prompt strategy

The system prompt will instruct the model to act as a professional editor, not a rewriter. It will preserve:
- All data, numbers, statistics, and citations
- Markdown formatting structure
- Section delimiters exactly as provided
- The advisory/consultant tone

### Failsafe

The entire polish step is wrapped in try/catch. If the AI call fails, times out, or the response cannot be parsed back into sections, the original unpolished content is used. A console log will indicate whether polishing succeeded or was skipped.

### Timing consideration

The `generate-report` function already has a 300-second wall clock limit. The polish call adds roughly 15-30 seconds. The existing pipeline typically completes in under 60 seconds, so there is ample headroom.

## Result

- Reports will read more professionally with consistent tone and Australian English
- Transitions between sections will feel natural rather than disconnected
- No new API keys, secrets, or external services required
- Zero risk of breaking existing reports -- polish only applies to new generations
- If the polish step fails for any reason, the report still saves with original content

