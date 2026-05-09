# Innovation Ecosystem — Phase 1 Audit (2026-05-08)

> Read-only audit. No DB writes, no code changes. Phase 2/3 plans below are proposals — STOP markers preserved.

Supabase project: `xhziwveaiuhzdoutpgrh` (MES Platform). Table: `innovation_ecosystem`.
Branch: `claude/logo-dev-data-quality-zVWA6`.

---

## 1. Schema Discovery (Phase 1.1)

All required columns confirmed present in `public.innovation_ecosystem`:

| Column | Type | Nullable |
|---|---|---|
| id | uuid | NO |
| name | text | NO |
| description | text | NO |
| location | text | NO |
| founded | text | NO |
| employees | text | NO |
| services | ARRAY (text[]) | NO |
| website | text | YES |
| contact | text | YES |
| logo | text | YES |
| basic_info | text | YES |
| why_work_with_us | text | YES |
| experience_tiles | jsonb | YES |
| contact_persons | jsonb | YES |
| location_id | uuid | YES |
| slug | text | NO |
| created_at | timestamptz | NO |
| updated_at | timestamptz | NO |

No missing columns. Proceed.

---

## 2. Re-validated Audit Findings (Phase 1.2)

### 2.1 Tier distribution (richness = count of 7 populated fields)

| Richness | Records | Tier |
|---|---|---|
| 7/7 | 36 | A (fully enriched) |
| 4/7 | 17 | B (partial) |
| 1/7 | 57 | C (sparse) |
| 0/7 | 14 | D (skeletal) |
| **Total** | **124** | |

The original brief said "71 sparse records (Tier C+D)". Confirmed: 57 + 14 = **71**.

### 2.2 "Working With" partner-tile logos — 100% broken at the tile level

`experience_tiles` JSONB has shape `[{id, name, logo}]`. All 225 entries have those exact three keys (verified via `jsonb_object_keys`). Of those:

| Tile-level logo source | Count |
|---|---|
| `/placeholder.svg` literal | 51 |
| empty string OR null | 174 |
| Any real http URL or `/lovable-uploads/...` | **0** |
| **Total tiles across 53 records** | **225** |

So although the row-level "experience_tiles is non-empty" count is 53, **zero tiles render a real partner logo today.** Original brief was correct.

### 2.3 Service-tag taxonomy — 219 unique tags, mostly singletons

Top hits (full list captured in audit query results):

| Tag | Count | Note |
|---|---|---|
| Accelerator | **71** | Massively over-tagged. Many are member networks, chambers of commerce, VC funds, or government programs that are not accelerators. |
| Policy Advocacy | 31 | |
| Sector Agnostic | **28** | This is a sector classification, not a service. Should move to a new `sectors` array. |
| Networking | 19 | Overlaps with… |
| Networking & Events | 15 | …and… |
| Events | 13 | …and… |
| Networking Events | 1 | …and "Events & Networking" (1), "Events/Conferences" (1). Five spellings of one concept. |
| Education | 14 | Overlaps with "Education & Training" (4), "Professional Development" (4), "Education/L&D" (1), "Education/Training" (1), "Education/Webinars" (1), "Education & Resources" (1), "Education & Thought Leadership" (1), "Education/Professional Development" (1), "Education Accreditation" (1), "Training & Education" (1), "Continued Professional Development" (1), "Entrepreneur Education" (1). |
| Mentoring | 12 | |
| Research | 12 | …plus 15+ research variants ("Research & Foresight", "Research/Publications", "Research Reports", "Research/Submissions", etc.). |
| Industry Reports | 11 | …plus 7+ report variants. |

Long tail: ~180 of the ~219 unique tags appear only once. The taxonomy is essentially noise below the top 10.

### 2.4 Location quality

| Location | Count | Issue |
|---|---|---|
| `Australia` | 60 | Country-level only — useless for filtering by city |
| Sydney, NSW | 34 | OK |
| Melbourne, VIC | 9 | OK |
| Canberra, ACT | 5 | OK |
| Auckland, NZ | 4 | OK |
| Adelaide, SA | 3 | OK |
| `USA & North America` | 3 | Out of scope or needs filtering |
| `Sydney & Melbourne` | 2 | Multi-location string |
| Gold Coast, QLD | 1 | OK |
| `Other` | 1 | Junk |
| `Multiple Locations` | 1 | Junk |
| Brisbane, QLD | 1 | OK |

48% of records (60/124) have location = "Australia" and need re-research to a city-level value.

### 2.5 Foreign-key linkage

| Status | Count |
|---|---|
| location_id NOT NULL | 57 |
| location_id NULL | 67 |

54% of records are not linked to the `locations` taxonomy table. These can only be linked AFTER location strings are normalised.

### 2.6 Organisation logo source breakdown

| Source | Count |
|---|---|
| LinkedIn signed URL (`licdn.com`) | 5 (will expire) |
| WordPress media (`wp-content`) | 14 (often break on cache cycles) |
| Other http URL | 17 |
| `/lovable-uploads/...` | 0 |
| `logo` empty or NULL | **88** |
| **Total** | **124** |

71% of records have no organisation logo at all. Of the 36 that do, 5 are guaranteed-to-break LinkedIn signed URLs and 14 are fragile WordPress URLs. Only 17 are stable.

### 2.7 Records with website (eligible for domain backfill)

| Has website | 118 |
|---|---|
| No website | 6 |

118/124 records (95%) can be auto-backfilled with a `domain` column derived from `website`. The 6 without a website (Atomic Sky, Gold Coast Innovation Centre, Hoist Ai, iAccelerate Wollongong, Runway HQ, ygap First Gens) need manual research or a website lookup.

### 2.8 The 71 sparse records (full list)

All 71 records with richness < 4 captured. Quick distribution:

- **14 records at richness 0** — only have name + description (often <100 chars). Examples: Barayamal (30 char desc), CERI, ClimateLaunchpad, Fishburners (43 char desc), Macquarie University Incubator (31 char desc).
- **57 records at richness 1** — typically have one of {logo, founded, employees}. Examples: Y Combinator, Startupbootcamp, Founder Institute Sydney, MedTech Actuator, Remarkable, Slingshot, ON Accelerate (CSIRO), Landing Pad (Austrade).

(See audit query result in Phase 1.2 for the complete list with names, websites, and description lengths.)

---

## 3. Frontend Audit (Phase 1.3)

### 3.1 KEY FINDING — logo.dev is ALREADY 75% built

This materially changes Phase 2 of the plan. Existing infrastructure:

| File | Purpose |
|---|---|
| `src/lib/logoUtils.ts` (47 lines) | `extractDomain(url)`, `getLogoDevUrl(domain, size)`, `getLogoUrl(websiteUrl, size)`. **Token hardcoded** at line 1: `pk_L3JbJjCeT0-mUdhpPlS6SA`. |
| `src/components/shared/CompanyLogo.tsx` (97 lines) | Already implements 3-tier fallback: existing logo → logo.dev (from `websiteUrl` prop) → company initials. |

The `CompanyLogo` component is consumed in 6+ places (directory cards, hero, mentor cards, service-provider profiles, modals). Its primarySrc/secondarySrc switching logic on `<img onError>` is already implemented and works.

**The bug:** when the component is used to render a partner tile (in `InnovationOrgContent.tsx` lines 78–93), only `existingLogoUrl` and `companyName` are passed — **`websiteUrl` is omitted**, so the fallback chain skips the logo.dev tier and goes straight to initials. Tiles have no website information today, only `name` and a broken `logo` field.

**Implication for Phase 2.3:** The plan says to create `src/lib/logos.ts` with `logoDevUrl`, `getOrgLogo`, `getPartnerLogo`. This is **redundant** with `logoUtils.ts` and `CompanyLogo.tsx`. The actual fix is much smaller:

1. Add a `domain` field to each `experience_tiles` entry (Phase 3.3 already plans this).
2. In tile-rendering markup, pass `websiteUrl={tile.domain ? \`https://${tile.domain}\` : undefined}` to `CompanyLogo`.
3. Existing `CompanyLogo` then resolves logo.dev automatically. Done.

Also note: **CLAUDE.md §2.5 says "No `VITE_*` env vars — Lovable doesn't support them."** The plan's `import.meta.env.VITE_LOGO_DEV_TOKEN` won't work. The hardcoded token in `logoUtils.ts` is the existing convention; we should keep it (or move to a single constants module) rather than introduce a non-functional env var.

### 3.2 Files where `experience_tiles` is read (18 files)

| Group | File | Line(s) |
|---|---|---|
| Innovation Ecosystem detail | `src/components/innovation-ecosystem/detail/InnovationOrgContent.tsx` | 33 (parse), 74–93 (render) |
| Innovation Ecosystem directory | `src/components/innovation-ecosystem/InnovationEcosystemResults.tsx` | 79 |
| Card primitives | `src/components/CompanyCard.tsx` | 14–18 (`ExperienceTile` type), 34 |
| Card primitives | `src/components/company-card/CompanyCardContent.tsx` | 20, 84 |
| Card primitives | `src/components/CompanyModal.tsx` | 20 (`parseJsonArray`), 57 |
| Cross-domain consumers | `src/components/PersonCard.tsx` | 10–13, 126–147 |
| Cross-domain consumers | `src/components/mentors/MentorCard.tsx` | 53, 73–75 |
| Cross-domain consumers | `src/components/service-provider-profile/ServiceProviderProfileContent.tsx` | 45, 107 |
| Sector pages | `src/components/sectors/InnovationEcosystemSection.tsx` | 35 |
| Sector pages | `src/components/sectors/ServiceProvidersSection.tsx` | 55 |
| Sector pages | `src/components/sectors/CommunityMembersSection.tsx` | 40 |
| Hooks | `src/hooks/useInnovationEcosystem.ts` | All select * |
| Hooks | `src/hooks/useSectorInnovationEcosystem.ts` | line 10 |
| Hooks | `src/hooks/useLocationInnovationEcosystem.ts` | line 19 |
| Other | `src/components/sections/ProvidersSection.tsx` | 57–60 |
| Other | `src/components/service-providers/ServiceProvidersDataProvider.tsx` | 70–71 |
| Other | `src/pages/MentorProfile.tsx` | 78–81 |
| Other | `src/hooks/useCommunityMembers.ts` | 36–38 |

### 3.3 Files where org-level `logo` is rendered

| Surface | File | Line(s) |
|---|---|---|
| Directory grid card | `src/components/company-card/CompanyCardHeader.tsx` | 15–23 |
| Directory grid card | `src/components/innovation-ecosystem/InnovationEcosystemResults.tsx` | 75, 81–82 (passes `logo: org.logo` to CompanyCard) |
| Detail page hero | `src/components/innovation-ecosystem/detail/InnovationOrgHero.tsx` | 37–45 (size="xl") |
| Detail page related orgs | `src/components/innovation-ecosystem/detail/InnovationOrgContent.tsx` | 206 |
| SEO meta / JSON-LD | `src/pages/InnovationOrgPage.tsx` | 39, 46 (og:image + schema) |

All of these already flow through `CompanyLogo` → `getLogoUrl(websiteUrl, …)`, so org-level logos already render via logo.dev when `org.website` is present. The `logo` column is currently used as a **manual override** that takes precedence (`primarySrc = existingLogoUrl || logoDevUrl`). This is fine to keep.

### 3.4 Hooks (data fetching)

| Hook | File | Selects |
|---|---|---|
| `useInnovationEcosystem` | `src/hooks/useInnovationEcosystem.ts:10` | `*` |
| `useInnovationOrgById` | line 30 | `*` |
| `useInnovationOrgBySlug` | line 48 | `*` |
| `useRelatedInnovationOrgs` | line 67 | `*` |
| `useSectorInnovationEcosystem` | `src/hooks/useSectorInnovationEcosystem.ts:10` | `*` |
| `useLocationInnovationEcosystem` | `src/hooks/useLocationInnovationEcosystem.ts:19` | `*` |

All use wildcard select. Adding new columns (`domain`, `sectors`) will flow through automatically AFTER Supabase types are regenerated.

### 3.5 Types

| Type | Location | Shape |
|---|---|---|
| `Database["public"]["Tables"]["innovation_ecosystem"]["Row"]` | `src/integrations/supabase/types.ts:1948–2018` | Auto-generated. Will need regeneration after Phase 2.1 migration. |
| `ExperienceTile` (local) | `src/components/CompanyCard.tsx:14–18` | `{ id: string; name: string; logo: string }` |
| `ExperienceTile` (duplicate) | `src/components/PersonCard.tsx:10–13` | identical |

`ExperienceTile` will need a `domain?: string` addition in both files (or consolidated to a single export).

### 3.6 Existing fallback chains for missing logos

The placeholder pattern `tile.logo && tile.logo !== "/placeholder.svg"` is repeated in 6 files (CompanyCardContent, CompanyModalSections, InnovationOrgContent, PersonCard, MentorCard, ServiceProviderProfileContent). **All of them** then hand off to `<CompanyLogo>` which has its own internal fallback chain. So the `placeholder.svg` literal acts as a sentinel that means "treat as missing". After Phase 3 strips all `placeholder.svg` strings from the data, the JS-level guard becomes redundant but harmless.

---

## 4. Plan Refinements (proposed for Phase 2 / Phase 3)

Below is a delta proposal vs. the original brief. **Nothing is implemented yet.** Awaiting approval.

### 4.1 Phase 2.1 (schema migration) — proceed as written

```sql
ALTER TABLE innovation_ecosystem
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS sectors TEXT[] DEFAULT '{}'::text[];
COMMENT ON COLUMN innovation_ecosystem.domain IS '...';
COMMENT ON COLUMN innovation_ecosystem.sectors IS '...';
CREATE INDEX IF NOT EXISTS idx_innovation_ecosystem_domain
  ON innovation_ecosystem(domain) WHERE domain IS NOT NULL;
```

Keep the existing `logo` column as legacy override.

### 4.2 Phase 2.2 (domain backfill) — proceed as written

The deterministic SQL `UPDATE` works for all 118 records with a website. After running, regenerate types via `mcp__cfbc42a3...__generate_typescript_types` so the new columns appear in `src/integrations/supabase/types.ts`.

### 4.3 Phase 2.3 (frontend logo utility) — REVISED

**Original plan:** Create `src/lib/logos.ts` with `logoDevUrl`, `getOrgLogo`, `getPartnerLogo` reading `import.meta.env.VITE_LOGO_DEV_TOKEN`.

**Problem:**
1. `logoUtils.ts` already provides `getLogoDevUrl(domain, size)` and `getLogoUrl(websiteUrl, size)`.
2. `CompanyLogo` already implements the 3-tier fallback.
3. Lovable does not support `VITE_*` env vars (CLAUDE.md §2.5).
4. The token is already hardcoded at `src/lib/logoUtils.ts:1`.

**Revised plan:**
- Skip creating `src/lib/logos.ts`.
- Add a small helper to `src/lib/logoUtils.ts`:
  ```ts
  // Build a synthetic websiteUrl from a bare domain so CompanyLogo can use it.
  export function domainToWebsite(domain: string | null | undefined): string | null {
    if (!domain) return null;
    return `https://${domain}`;
  }
  ```
- Update the local `ExperienceTile` type in `CompanyCard.tsx` and `PersonCard.tsx` to add `domain?: string`. Better: extract a single `ExperienceTile` type to a new shared file `src/types/experienceTile.ts` and import from both places.

### 4.4 Phase 2.4 (wire frontend) — REVISED

**Original plan:** Update directory card and detail page to use `getOrgLogo` / `getPartnerLogo`.

**Revised plan:** Tile-rendering sites already pass `existingLogoUrl` to `CompanyLogo`. Add `websiteUrl={domainToWebsite(tile.domain)}` to each tile-rendering site. Six call sites:

1. `src/components/innovation-ecosystem/detail/InnovationOrgContent.tsx:80`
2. `src/components/company-card/CompanyCardContent.tsx:84`
3. `src/components/CompanyModal.tsx` (and `company-modal/CompanyModalSections.tsx:58`)
4. `src/components/PersonCard.tsx:133`
5. `src/components/mentors/MentorCard.tsx:57`
6. `src/components/service-provider-profile/ServiceProviderProfileContent.tsx:107`

Org-level logos already work via `org.website` → `CompanyLogo websiteUrl={org.website}` → logo.dev. No change needed at the org level except confirming it works in QA.

### 4.5 Phase 3.1 (service taxonomy) — proceed with note

The brief's `SERVICE_REMAP` is a good start. Based on the live data I'd add:

- All Education variants → `Education & Training`
- All Networking/Events variants → `Networking Events`
- All Research variants → `Research`
- All Reports variants → `Industry Reports`
- "Sector Agnostic", "Cleantech", "Sustainability", "Agritech", "Deep Tech", "Food", "Foodtech", "Space Industry", "Tech", "Bio", "Med", "Health", "Healthtech", "Medtech", "Biotech", "Fintech", "Edtech" → move to `sectors[]` (these were tagged as services but are sectors).
- "Accelerator" reclassification via Haiku is the right call. Expected outcome: 20–30 genuine accelerators (not 71).

Suggested controlled vocabulary for `services` (~18 tags):
> Accelerator, Incubator, Pre-accelerator, Venture Studio, Mentorship Program, Seed Funding, Venture Capital, Member Network, Industry Association, Chamber of Commerce, Networking Events, Conferences, Education & Training, Research, Industry Reports, Policy Advocacy, Regulatory Guidance, Co-working / Lab Access

Suggested controlled vocabulary for `sectors[]` (~13 tags):
> Fintech, Agritech, Healthtech, Cleantech, Deep Tech, Space, Defence, Mining, Construction, Foodtech, Edtech, Insurtech, Sector Agnostic

### 4.6 Phase 3.2 (sparse-record enrichment) — proceed as written

71 records × 1 Perplexity Sonar call ≈ ~$3–5. Stage to `innovation_ecosystem_enrichment_staging`, hard stop, side-by-side review of 10 samples, approve, apply.

Overwrite rules look right. Note one preservation rule to add: **do not overwrite an existing org `logo` if the new value would be a LinkedIn signed URL or wp-content URL.** Prefer leaving `logo` empty so logo.dev resolves from `website` instead.

### 4.7 Phase 3.3 (partner-domain resolution) — proceed as written

225 tile entries → ~150 unique partner names (estimate). Batches of 20 → ~8 Perplexity calls ≈ ~$1. The `partner_domain_lookup` table caches results so re-runs are free.

After domain resolution, frontend tiles render via the wiring done in 4.4 above.

### 4.8 Phase 3.4 (citation cleanup) — proceed as written

The regex `\.\[.*\]$` matches Perplexity-style citation markers. Confirm against actual data after enrichment lands.

### 4.9 Phase 3.5 (acceptance criteria) — proceed as written

Acceptance bar:
- Tier A ≥ 95 (currently 36)
- Tier D = 0 (currently 14)
- ≥ 90% of tile entries have `domain` populated
- All 118 records-with-website have `domain` populated
- Zero `placeholder.svg` strings in `experience_tiles`
- Service tags only from controlled vocabulary
- "Accelerator" count drops from 71 to expected ~20–30

---

## 5. Files to be created (final list, after refinements)

| Phase | Path | Purpose |
|---|---|---|
| 1 | `docs/innovation-ecosystem-audit-2026-05-08.md` | This document |
| 2.1 | `supabase/migrations/{ts}_add_logo_dev_support_to_innovation_ecosystem.sql` | Add `domain`, `sectors`, index |
| 2.2 | `scripts/backfill-domains.ts` | One-off (or run inline SQL — TBD) |
| 2.3 | `src/lib/logoUtils.ts` (edit) | Add `domainToWebsite()` helper |
| 2.3 | `src/types/experienceTile.ts` (new) | Single shared `ExperienceTile` type |
| 2.4 | 6 component edits | Pass `websiteUrl={domainToWebsite(tile.domain)}` |
| 3.1 | `scripts/normalize-service-taxonomy.ts` | Service remap + Haiku accelerator reclassification |
| 3.2 | `scripts/enrich-sparse-ecosystem-records.ts` | Perplexity Sonar enrichment |
| 3.3 | `scripts/resolve-partner-domains.ts` | Perplexity batch domain resolution |
| 3.5 | `docs/innovation-ecosystem-enrichment-complete-{date}.md` | Final report |

`src/lib/logos.ts` from the original brief is **dropped** — its functions already exist in `src/lib/logoUtils.ts`.

---

## 6. STOP — Awaiting approval

Phase 1 deliverable complete. No DB writes, no code changes. Two refinements above (4.3 and 4.4) deviate from the original brief because logo.dev infrastructure already exists and Lovable doesn't support `VITE_*` env vars. Please confirm the refinements before I proceed to Phase 2.
