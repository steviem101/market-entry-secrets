

# Fix: URL Validation Rejecting Valid Domains Without "https://"

## The Problem

On the report creator form (Step 1), the "Company Website" field rejects entries like `ignitepartners.com.au` because the Zod schema uses `z.string().url()`, which requires a full URL with protocol (e.g., `https://ignitepartners.com.au`).

Most users naturally type just the domain without the protocol prefix, so this causes unnecessary friction.

## The Fix

Update the `website_url` validation in the Zod schema to automatically prepend `https://` when the user omits it, then validate the result. This matches the behavior already in the backend Firecrawl scraper, which does the same prepending.

## What Changes

**File: `src/components/report-creator/intakeSchema.ts`** (1 line change)

Replace:
```typescript
website_url: z.string().url('Please enter a valid URL').max(500),
```

With:
```typescript
website_url: z.string().max(500).transform((val) => {
  const trimmed = val.trim();
  if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}).pipe(z.string().url('Please enter a valid URL')),
```

This:
- Trims whitespace
- Auto-prepends `https://` if no protocol is present
- Then validates the resulting string is a proper URL
- Accepts both `ignitepartners.com.au` and `https://ignitepartners.com.au`

No other files need changes -- the form, Edge Function, and Firecrawl integration all work with full URLs downstream.

