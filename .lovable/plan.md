

# Set Up Lemlist Contact and Company Sync for Report Generation

## Overview

Create two new Supabase tables to store Lemlist contacts and companies, plus an edge function that pulls data from Lemlist's API and upserts it into your database. This data then becomes available as an additional source during AI Market Entry Report generation.

## Database Design

### Table 1: `lemlist_companies`

Stores company/account-level data from Lemlist.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Supabase auto-generated |
| lemlist_id | text (unique, not null) | Lemlist `_id` field, used for upsert matching |
| name | text (not null) | Company name |
| domain | text | Website domain |
| industry | text | Industry sector |
| size | text | Company size (e.g. "11-50") |
| location | text | Geographic location |
| linkedin_url | text | LinkedIn company page |
| fields | jsonb | All other flexible Lemlist fields |
| owner_id | text | Lemlist owner user ID |
| lemlist_created_at | timestamptz | Original creation date in Lemlist |
| created_at | timestamptz | Row creation in Supabase |
| updated_at | timestamptz | Last sync timestamp |

### Table 2: `lemlist_contacts`

Stores individual contact/person data from Lemlist, linked to companies.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Supabase auto-generated |
| lemlist_id | text (unique, not null) | Lemlist `_id` field |
| company_id | uuid (FK) | References lemlist_companies.id |
| full_name | text | Calculated full name |
| first_name | text | From fields.firstName |
| last_name | text | From fields.lastName |
| email | text | Primary email |
| job_title | text | From fields.jobTitle |
| phone | text | From fields.phone |
| linkedin_url | text | LinkedIn profile URL |
| industry | text | From fields.industry |
| lifecycle_status | text | Contact lifecycle stage (New, Contacted, Opportunity, etc.) |
| campaigns | jsonb | Array of campaign associations |
| fields | jsonb | All other flexible Lemlist fields |
| owner_id | text | Lemlist owner user ID |
| lemlist_created_at | timestamptz | Original creation date in Lemlist |
| created_at | timestamptz | Row creation in Supabase |
| updated_at | timestamptz | Last sync timestamp |

### RLS Policies

Both tables will have:
- **Public SELECT** for reading (needed by the report generator edge function)
- **No public INSERT/UPDATE/DELETE** -- only the sync edge function (using service role key) writes to these tables

## Edge Function: `sync-lemlist`

A new edge function that connects to the Lemlist API (v2) and syncs data into Supabase.

### How it works

1. Authenticates with Lemlist using Basic Auth (API key)
2. Fetches all companies from `GET https://api.lemlist.com/api/companies`
3. Upserts each company into `lemlist_companies` (matched on `lemlist_id`)
4. Fetches all contacts from `GET https://api.lemlist.com/api/contacts`
5. Links contacts to companies by matching the company name/domain
6. Upserts each contact into `lemlist_contacts` (matched on `lemlist_id`)
7. Returns a summary of synced counts

### Trigger options

- **Manual**: Call it from an admin button in your app
- **Scheduled**: Set up a pg_cron job to run it hourly or daily

## Integration with Report Generation

Update the `generate-report` edge function to include Lemlist data as an additional matching source during Step 3 (Database Directory Matching). Specifically:

- Query `lemlist_contacts` for contacts whose company industry or location matches the report's target market
- Include matched contacts in the report as potential leads or connections
- This complements the existing matching against `service_providers`, `community_members`, `leads`, etc.

## New Secret Required

- **LEMLIST_API_KEY**: Your Lemlist API key (found in Lemlist Settings > Integrations > API). This will be stored securely as a Supabase secret.

## Files to create or modify

| File | Change |
|------|--------|
| `supabase/migrations/...` | Create `lemlist_companies` and `lemlist_contacts` tables with indexes and RLS |
| `supabase/functions/sync-lemlist/index.ts` | New edge function for API sync |
| `supabase/config.toml` | Add `sync-lemlist` function config with `verify_jwt = false` |
| `supabase/functions/generate-report/index.ts` | Add Lemlist data as additional matching source in Step 3 |

## Implementation sequence

1. Add the `LEMLIST_API_KEY` secret
2. Create the database tables via migration
3. Build and deploy the `sync-lemlist` edge function
4. Test the sync by calling the edge function manually
5. Update the report generator to include Lemlist matches
6. Optionally set up a cron schedule for automatic syncing

