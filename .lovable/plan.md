
# Fix: Report Stuck at "Processing" Due to Polish Pass Timeout

## Root Cause

The edge function worker is killed during the polish pass. The sequence is:
1. Parallel research completes (~20s)
2. Provider enrichment completes (~1s)
3. Section generation completes (~26s)
4. Polish pass starts -- sends 33,831 chars to `gemini-2.5-pro` (the slowest model)
5. **Worker is shut down ~28 seconds into the polish pass** -- before it can save the report

Because the save happens AFTER the polish pass (line 1296), the report status is never updated from "processing" to "completed". The data is lost.

## Fix Strategy

Three changes to make the pipeline robust:

### 1. Save the report BEFORE the polish pass (critical fix)

Move the database save (lines 1296-1304) to happen immediately after section generation completes, BEFORE attempting the polish pass. This ensures the report is always saved even if the worker gets killed.

If the polish pass succeeds, do a second save to update the sections with polished content. If it fails or the worker dies, the user still gets their unpolished report.

### 2. Downgrade the polish pass model from `gemini-2.5-pro` to `gemini-3-flash-preview`

The `gemini-2.5-pro` model is 5-10x slower than flash models and is the primary reason the worker times out. The flash model produces comparable editing quality for this task and completes in 5-10 seconds instead of 30-60+.

### 3. Add a timeout wrapper around the polish pass

Wrap the polish call in a `Promise.race` with a 30-second timeout. If it doesn't complete in time, fall back to the already-saved unpolished content gracefully.

## Technical Changes

### File: `supabase/functions/generate-report/index.ts`

**Change 1 — Save before polish (lines ~1259-1310)**

Restructure `generateReportInBackground` so that:
- After section generation (line 1257), immediately build `reportJson` and save with `status: "completed"`
- Then attempt the polish pass as an optional improvement
- If polish succeeds, do an UPDATE with the polished sections
- If polish fails or times out, the report is already saved and viewable

```text
Before:
  Generate sections -> Polish -> Save (single save at the end)

After:
  Generate sections -> Save (completed) -> Polish (optional) -> Update if successful
```

**Change 2 — Downgrade polish model (line 828)**

Change from:
```
"google/gemini-2.5-pro"
```
To:
```
"google/gemini-3-flash-preview"
```

**Change 3 — Add timeout wrapper (around line 1262)**

```
const polishWithTimeout = Promise.race([
  polishReport(lovableKey, sections, sectionOrder),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Polish timeout")), 30000)
  ),
]);
```

### No frontend changes needed

The frontend already polls for `status === "completed"` and renders whatever `report_json` is saved. This fix is entirely backend.

## What This Fixes

- Reports will no longer get stuck at "processing" -- they save immediately after sections are generated
- The polish pass becomes a best-effort improvement rather than a blocking requirement
- The faster model reduces the chance of worker shutdown during polish
- Existing reports already stuck at "processing" can be manually fixed by updating their status

## Bonus: Fix the stuck Credit Logic report

Run a query to check if the stuck report actually has section data in `report_json`, and if not, mark it as "failed" so the user can regenerate.
