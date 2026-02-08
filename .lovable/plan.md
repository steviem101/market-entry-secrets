

# Add Lemlist CSV Properties as Supabase Columns

## Overview

The current `lemlist_contacts` table only has 18 columns (mostly core fields like name, email, phone) with a generic `fields` JSONB catch-all. The actual Lemlist export has **83 properties**. This plan adds dedicated columns for the most valuable fields so your n8n automation can write directly to named columns, making the data queryable and usable in report generation.

## Current vs new mapping

The table below shows every CSV column and whether it already exists, will become a new dedicated column, or will remain in the `fields` JSONB.

### Already mapped (no change needed)
| CSV Column | Supabase Column |
|---|---|
| firstName | first_name |
| lastName | last_name |
| email | email |
| linkedinUrl | linkedin_url |
| jobTitle | job_title |
| phone | phone |

### New dedicated columns (28 new columns)

These are fields that are valuable for lead intelligence, CRM filtering, and report generation:

**Contact enrichment:**
| CSV Column | New Supabase Column | Type |
|---|---|---|
| linkedinUrlSalesNav | linkedin_url_sales_nav | text |
| companyName | company_name | text |
| companyWebsite | company_website | text |
| location | location | text |
| contactLocation | contact_location | text |
| personalEmail | personal_email | text |
| twitterProfile | twitter_profile | text |

**LinkedIn intelligence:**
| CSV Column | New Supabase Column | Type |
|---|---|---|
| linkedinHeadline | linkedin_headline | text |
| linkedinDescription | linkedin_description | text |
| linkedinSkills | linkedin_skills | text |
| linkedinJobIndustry | linkedin_job_industry | text |
| linkedinFollowers | linkedin_followers | integer |
| linkedinConnectionDegree | linkedin_connection_degree | text |
| linkedinProfileId | linkedin_profile_id | text |
| linkedinOpen | linkedin_open | boolean |
| tagline | tagline | text |
| summary | summary | text |

**CRM / campaign status:**
| CSV Column | New Supabase Column | Type |
|---|---|---|
| status | status | text |
| leadStatus | lead_status | text |
| source | source | text |
| emailstatus | email_status | text |
| priority | priority | text |
| client | client | text |
| hubspot Id | hubspot_id | text |
| leadNotes | lead_notes | text |
| lastContactedDate | last_contacted_date | timestamptz |
| firstContactedDate | first_contacted_date | timestamptz |
| lastRepliedDate | last_replied_date | timestamptz |

### Remaining in `fields` JSONB (not worth dedicated columns)

These are either rarely populated, duplicative, or too granular for querying:
- languages, skills, lastCampaign, activeCampaigns, isActiveInCampaigns
- lastLeadLaunchedDate, firstLeadLaunchedDate, lastLeadMarkedAsInterestedDate
- lastCampaignStartDate, lastCampaignEndDate
- jobTitle_custom, linkedinCompanyURL, salesNavigatorCompanyURL
- linkedinJobDateRange, jobLocation, jobDescription
- All "previous" fields (previousCompanyName, previousJobTitle, etc.)
- All school fields (schoolName, degree, description)
- linkedinMutualConnectionsUrl
- phone1-10, companyName_custom
- variable1, variable2, linkedInConnectionDegree (duplicate)
- sBLinkedinConnection, sBLinkedInConnectionDegree (duplicates)
- sectorCopy3HCI

## Changes required

### 1. Database migration

- Add 28 new nullable columns to `lemlist_contacts` with appropriate types
- No data migration needed (existing rows will have NULL for new columns until next sync)

### 2. Edge function update (`sync-lemlist/index.ts`)

- Update the `transformContact()` function to map all new fields from the Lemlist API response to the new column names
- The Lemlist API returns the same property names as the CSV export, so the mapping is straightforward (e.g., `raw.linkedinHeadline` maps to `linkedin_headline`)

### 3. Report generation (`generate-report/index.ts`)

- Update the Lemlist contacts SELECT query to include key new columns: `company_name`, `company_website`, `linkedin_headline`, `linkedin_job_industry`, `status`, `contact_location`
- This gives the AI more context about each contact for better lead matching

### 4. No frontend changes

The Lemlist data is currently only surfaced through the report generation pipeline (as match cards in the lead list section). The new columns will automatically enrich those results.

## n8n automation compatibility

After this migration, your n8n workflow can map CSV columns directly to Supabase column names using this mapping:
- `firstName` -> `first_name`
- `lastName` -> `last_name`
- `companyName` -> `company_name`
- `companyWebsite` -> `company_website`
- `linkedinHeadline` -> `linkedin_headline`
- etc.

Any CSV columns not in the dedicated list should be combined into the `fields` JSONB column as a JSON object.
