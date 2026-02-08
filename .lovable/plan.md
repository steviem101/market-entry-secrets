

# PDF Download and Share Links for Completed Reports

## Overview

Enable the two currently disabled buttons in the report header: **PDF** for downloading a formatted PDF of the report, and **Share** for generating a shareable link that anyone can view without logging in.

## What changes for the user

- **PDF button**: Clicking opens the browser's print dialog, pre-configured for PDF output. The report renders cleanly with print-optimized styling (no navigation, no sidebar, no feedback section -- just the report content).
- **Share button**: Clicking opens a dialog where the user can generate a unique shareable link. The link is copied to their clipboard with one click. Anyone with the link can view the report's unlocked sections without needing an account.
- A shared report view shows a "View Only" banner and hides interactive elements (feedback, upgrade CTAs).

## Changes required

### 1. Database: Add share_token column

Add a `share_token` (UUID, nullable, unique) column to `user_reports`. This token is generated on-demand when a user first clicks "Share" -- not pre-generated for every report.

| Column | Type | Default | Purpose |
|---|---|---|---|
| `share_token` | `uuid` | `NULL` | Unique public access token, created when user shares |

Add a new RLS policy: **"Anyone can view shared reports via token"** -- allows `SELECT` on `user_reports` when the `share_token` matches, without requiring authentication.

### 2. PDF Download (Client-side print)

**Approach**: Use `window.print()` with `@media print` CSS. This is the most reliable approach that requires zero extra dependencies. The browser's built-in "Save as PDF" option produces a clean document.

**Print stylesheet additions (`index.css`)**:
- Hide Navigation, Footer, ReportSidebar, ReportFeedback, ReportHeader sticky bar, gated section overlays
- Remove blur filters on gated sections (show the placeholder lines but not blurred)
- Add a visible print-only header with company name, date, and "Market Entry Secrets" branding
- Set clean page margins, remove background colors, ensure prose text is black
- Force page breaks before each report section for clean formatting

**ReportHeader changes**:
- Remove `disabled` from PDF button
- Add `onClick` handler that calls `window.print()`

### 3. Share Link Feature

**New component: `ReportShareDialog.tsx`**
- Dialog triggered by the Share button in ReportHeader
- Shows current share status:
  - If no share_token exists: "Generate Share Link" button
  - If share_token exists: displays the URL with a "Copy Link" button
- Copy button uses `navigator.clipboard.writeText()` with a success toast
- Share URL format: `https://market-entry-secrets.lovable.app/report/shared/{share_token}`

**API layer (`reportApi.ts`)**:
- Add `generateShareToken(reportId)`: calls Supabase to update the report with a new UUID share_token (using `crypto.randomUUID()`) and returns it
- Add `fetchSharedReport(shareToken)`: queries `user_reports` by `share_token` instead of `id`
- Add `revokeShareToken(reportId)`: sets `share_token` back to null (optional, nice to have for revoking access)

**New route: `/report/shared/:shareToken`**
- New page component `SharedReportView.tsx` that:
  - Fetches the report by share_token (no auth required)
  - Shows a "Shared Report" banner at the top with a link to create your own report
  - Renders only the sections that were unlocked at the owner's tier at generation time (uses `visible` flag from stored `report_json.sections`)
  - Hides: feedback section, upgrade CTAs, sidebar locked items, PDF/Share buttons
  - Shows: Navigation (with CTA to sign up), report content, match cards, sources, Footer

**ReportHeader changes**:
- Accept new props: `shareToken`, `onShare`, `reportId`
- Remove `disabled` from Share button
- Wire Share button to open `ReportShareDialog`

### 4. Shared Report View (`SharedReportView.tsx`)

- Simplified version of `ReportView.tsx`
- No subscription check needed -- uses the `visible` flag already stored in each section of `report_json`
- Sections where `visible: false` show a "This section is available in the full report" placeholder with CTA to sign up
- No feedback component
- Header shows "Shared Report" badge instead of tier badge
- "Create Your Own Report" CTA button in header

### 5. Route Registration (`App.tsx`)

Add new route:
```
/report/shared/:shareToken -> SharedReportView
```

## File-by-file summary

| File | Change |
|---|---|
| `supabase/migrations/...` | Add `share_token` column + unique index + public read RLS policy |
| `src/index.css` | Add `@media print` styles for clean PDF output |
| `src/components/report/ReportHeader.tsx` | Enable PDF/Share buttons, add share dialog trigger, print handler |
| `src/components/report/ReportShareDialog.tsx` | **New** -- share link dialog with generate/copy/revoke |
| `src/lib/api/reportApi.ts` | Add `generateShareToken`, `fetchSharedReport`, `revokeShareToken` |
| `src/hooks/useReport.ts` | Add `useSharedReport` hook |
| `src/pages/SharedReportView.tsx` | **New** -- public read-only report view |
| `src/pages/ReportView.tsx` | Pass share props to ReportHeader |
| `src/App.tsx` | Add `/report/shared/:shareToken` route |
| `src/integrations/supabase/types.ts` | Update types for share_token column |

## Technical notes

- **PDF approach rationale**: `window.print()` with CSS is zero-dependency, works across all browsers, and produces high-quality output. Users can choose "Save as PDF" from the print dialog. A library like `jspdf` + `html2canvas` would add ~500KB to the bundle and produce lower-quality rasterized output.
- **Share token security**: UUIDs are effectively unguessable (122 bits of randomness). The token is only generated when explicitly requested, and can be revoked. The RLS policy scopes access strictly to SELECT with a matching token.
- **Gated sections in shared view**: The shared view respects the `visible` flag stored in the report JSON at generation time. This means if the owner was on the Growth plan, shared viewers see Growth-level sections. They cannot see sections the owner didn't have access to.
- **No new dependencies required** -- everything uses existing packages and browser APIs.

