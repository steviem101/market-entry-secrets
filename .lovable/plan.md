

# Security Fixes Deployment + Build Error Fix

## Status After Investigation

Your 5 security migration SQL files are present in the codebase but **none have been applied to the database**. The old vulnerable policies are still live. The edge function code updates also need redeployment.

---

## Step 1: Fix Build Error

The `SearchSection.tsx` file has a TypeScript error on line 87 where `tab.id` (type `string`) is passed to `setActiveTab` which expects `SearchCategory`. Fix by typing the `searchTabs` array with `as const` or casting `tab.id`.

**File:** `src/components/sections/SearchSection.tsx`
- Type the `searchTabs` array so each `id` is recognized as a `SearchCategory` literal

---

## Step 2: Apply 5 RLS Security Migrations

The migration files exist but were not applied. Re-run them as direct SQL migrations:

1. **email_leads** -- Drop `"Authenticated users can view email leads"` (USING true), replace with admin-only SELECT
2. **lemlist_contacts + lemlist_companies** -- Drop `USING(true)` SELECT policies, replace with admin-only
3. **lead_submissions** -- Enable RLS, add admin-only SELECT policy
4. **profiles** -- Drop `"Users can view all profiles"` (USING true), replace with own-profile + admin SELECT
5. **user_reports** -- Drop the tautological `share_token = share_token` policy, replace with a proper share token check that requires a query parameter match

---

## Step 3: Redeploy Edge Functions

Deploy the 3 updated edge functions:
- `generate-report` (JWT validation + ownership check)
- `create-checkout` (open redirect fix with URL allowlist)
- `sync-lemlist` (admin role check)

The `config.toml` already has `verify_jwt = true` for `generate-report` and `sync-lemlist`.

---

## Summary of What Gets Fixed

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | Email addresses publicly readable | CRITICAL | RLS migration |
| 2 | Lemlist CRM data publicly readable | CRITICAL | RLS migration |
| 3 | Lead submissions no RLS | CRITICAL | RLS migration |
| 4 | Profiles leaking stripe_customer_id | HIGH | RLS migration |
| 5 | Share token always-true tautology | CRITICAL | RLS migration |
| 6 | Build error in SearchSection.tsx | LOW | Type fix |
| 7 | Edge functions need redeployment | HIGH | Deploy 3 functions |

No new secrets or schema columns are needed.

