

# Add Known Competitors Field to Intake Form

## Overview

Add a new "Known Competitors" section to Step 2 of the Report Creator form where users can enter the names and websites of companies they see as direct competitors. These competitor websites will be stored in the database and used during report generation for a deeper, more targeted competitor analysis (Firecrawl scraping of the actual competitor websites instead of relying solely on generic search queries).

## What changes for the user

- A new section appears on Step 2 ("Your Market Entry Goals") between "Key Challenges" and the navigation buttons
- Users can add up to 5 competitors, each with a **name** and **website URL**
- An "Add Competitor" button lets them add rows dynamically
- Each competitor row has a remove button (X) to delete it
- The field is optional -- users can skip it entirely
- Step 3 (Review) shows the entered competitors in a summary card
- The generated report will scrape these specific competitor websites for a more accurate competitor landscape section

## Files to change

### 1. Database migration

Add a new column `known_competitors` to the `user_intake_forms` table:
- Type: `jsonb`
- Default: `'[]'::jsonb`
- Nullable: yes
- Structure: array of objects `[{ "name": "Acme Corp", "website": "https://acme.com" }, ...]`

JSONB is the right choice here because:
- Each competitor has two fields (name + website) -- not a simple string array
- The number of competitors varies per submission (0-5)
- No need to query/filter by individual competitor values

### 2. Schema (`intakeSchema.ts`)

- Add a `competitorSchema` Zod object: `z.object({ name: z.string(), website: z.string() })`
- Add `known_competitors` to `step2Schema` as `z.array(competitorSchema).max(5).optional().default([])`
- Each competitor entry validates that website is a valid URL (with the same `https://` auto-prepend transform used for company website)

### 3. Step 2 form (`IntakeStep2.tsx`)

- Add a new "Known Competitors" section after the Key Challenges textarea
- Section includes:
  - Label: "Known Competitors" (no asterisk -- it is optional)
  - Helper text: "Add companies you consider direct competitors in the Australian market"
  - Dynamic list of competitor rows, each with:
    - Name input (placeholder: "e.g. Acme Corp")
    - Website input with Globe icon (placeholder: "https://competitor.com")
    - X button to remove the row
  - "Add Competitor" button (disabled when 5 competitors already added)
- Uses `useFieldArray` or manual array state management via `setValue`

### 4. Step 3 review (`IntakeStep3.tsx`)

- Add a "Known Competitors" subsection in the Market Entry Goals summary card
- Only shows if `known_competitors` has entries
- Displays each competitor as a row with name and a truncated, clickable website link

### 5. Default values (`ReportCreator.tsx`)

- Add `known_competitors: []` to the `defaultValues` object

### 6. API layer (`reportApi.ts`)

- Add `known_competitors: data.known_competitors || []` to the payload sent to Supabase

### 7. Edge function (`generate-report/index.ts`)

- Update the `searchCompetitors` function to use user-provided competitor websites:
  - If `intake.known_competitors` exists and has entries, scrape those websites directly using Firecrawl instead of (or in addition to) the generic search
  - For each known competitor: call `firecrawlScrape` on their website, then use AI to extract structured `CompetitorData`
  - Merge user-provided competitors with any search-discovered competitors (deduplicating by domain)
  - This gives the competitor landscape section much more accurate, targeted intelligence
- Pass `known_competitors` into the template variables so the AI prompt can reference them

## Technical notes

- The field is fully optional with a default of `[]`, so existing intake forms and the current flow are unaffected
- Max 5 competitors keeps the scraping workload reasonable within the edge function's 300-second timeout
- URL validation on the frontend prevents bad URLs from reaching the scraping pipeline
- The JSONB column type means no schema migration is needed if we later add fields like "relationship" or "notes" to each competitor entry

