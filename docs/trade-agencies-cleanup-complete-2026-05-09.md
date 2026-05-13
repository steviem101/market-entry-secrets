# Trade & Investment Agencies — cleanup complete (2026-05-09)

End-of-cycle report for the trade-investment-agencies data quality + schema
overhaul (Pass 1 → Phase 3 → Phase 4). Pass 1 happened earlier and is
summarised; Phases 3 and 4 ran on 2026-05-09 in this branch.

## Before / after

### Pass 1 → Phase 3 → Phase 4 metrics

| Metric | Pre-Pass 1 | After Pass 1 | After Phase 3 | After Phase 4 |
|---|---|---|---|---|
| Records in `trade_investment_agencies` | 142 | 140 (FACCI dedup) | 140 | 140 |
| `domain` populated | 0 | 127 | 138 | 138 |
| `country_iso2` populated | 0 | 140 | 140 | 140 |
| `needs_re_research = true` | 0 | 61 | 1 (AMCC invalid) | 1 (AMCC invalid) |
| `tagline` non-empty | ~14 | ~14 | 139 | 139 |
| `basic_info` non-empty | ~7 | ~7 | 139 | 139 |
| `why_work_with_us` non-empty | ~5 | ~5 | 139 | 139 |
| `description_full` populated | ~25 | ~25 (truncated dups removed) | 139 | 139 |
| `government_level` populated | 14 | 14 | 139 | 139 |
| `jurisdiction` non-empty | 10 | 10 | 139 | 139 |
| `sectors_supported` non-empty | ~30 (non-canonical) | ~30 | 139 (canonical enum) | 139 |
| `support_types` non-empty | 140 (over-tagged defaults) | 140 | 140 (replaced) | 140 |
| `experience_tiles` non-empty | 6 | 6 | 101 | 101 |
| `location_city` clean (no street/level) | ~25 | ~25 | 139 | 139 |
| Tier A richness ≥ 11 | 0 | 0 | 139/140 | 139/140 |
| Rows in `agency_contacts` | 0 | 0 | 0 | 415 |
| Rows in `country_trade_organizations` | 4 | 4 | 4 | (table dropped) |

### Phase 4 contact migration outcome

| Metric | Source (jsonb) | Target (`agency_contacts` rows) |
|---|---|---|
| Total contacts | 415 (jsonb entries) | **415** |
| Distinct agencies covered | 140 | **140** |
| Primary contacts | n/a (no flag in jsonb) | **140** (one per agency) |
| Archived contacts (was `hidden=true`) | 156 | **156** |
| With `mes_relevance_score` preserved | 407 | **407** |
| With `tier` preserved | 407 | **407** |

The PIT-CRM relevance scoring and tier classifications survived the migration
intact — the per-agency primary contact selection prefers non-hidden, then
highest score, then lowest priority.

## What ran in this cycle (Phases 3 + 4)

### Phase 3 — research enrichment

- Logo utility (`src/lib/logoUtils.ts`) extended with `getLogoUrlFromDomain()`
  + `getOrgLogoUrl()`. `CompanyLogo` accepts a `domain` prop that wins over
  `websiteUrl` for Logo.dev lookup. Threaded through trade-agency card +
  detail surfaces.
- 140 records staged via 140 per-record Claude Code research sub-agents
  (web_search + web_fetch + Supabase MCP insert). 139 staged `pending`,
  1 marked `invalid` for the AMCC org which was found not to actually
  exist.
- Diff review doc on 12 representative samples → applied with per-field
  rules from §3.6 (overwrite-if-empty for text/booleans, REPLACE for
  support_types and experience_tiles, address-pattern overwrite for
  location_city, needs_re_research-gated overwrite for domain/website_url).
- Domain fixup migration filled 2 stragglers where the strict apply rule
  had skipped null-domain rows (Embassy of Switzerland, Invest Northern
  Ireland).

### Phase 4 — normalized schema

- Extended `agency_contacts` with `is_archived`, `mes_relevance_score`, `tier`.
- Migrated 415 contact_persons jsonb entries → 415 `agency_contacts` rows
  (140 primary, 156 archived, scoring preserved).
- Recreated `agencies_report_view` to expose `primary_contacts` +
  `team_contacts` arrays, both filtered to `is_archived=false`. View now
  also exposes `domain` and `country_iso2`.
- `useAgencyContacts` hook updated to filter archived contacts and order
  by primary-first, then display_order.
- `country_trade_organizations` (4 duplicate rows) dropped. The country page
  `TradeOrganizationsSection` continues to work — `useCountryTradeOrganizations`
  refactored to query `agencies_report_view` filtered by
  `country_iso2 = <iso2> OR jurisdiction CONTAINS <iso2>`, with a small
  static slug→ISO2 map for the 5 country pages.

### Files created in this cycle

```
src/lib/logoUtils.ts                                                      (extended)
src/components/shared/CompanyLogo.tsx                                     (extended)
src/components/CompanyCard.tsx                                            (added domain prop)
src/components/company-card/CompanyCardHeader.tsx                         (passes domain)
src/components/trade-investment-agencies/TradeInvestmentAgenciesResults.tsx
src/components/trade-investment-agencies/detail/AgencyHero.tsx            (passes domain)
src/components/trade-investment-agencies/detail/AgencyContent.tsx         (passes domain to related cards)
src/hooks/useTradeAgencies.ts                                             (filters archived contacts)
src/hooks/useCountryTradeOrganizations.ts                                 (rewired to view)
scripts/enrich-trade-agencies.ts                                          (orchestration artifact)
docs/trade-agencies-staging-review-2026-05-09.md                          (Phase 3.5)
docs/trade-agencies-phase3-apply-audit-2026-05-09.md                      (Phase 3.7)
docs/trade-agencies-cleanup-complete-2026-05-09.md                        (Phase 4.7, this doc)
supabase/migrations/20260509060000_create_trade_agencies_enrichment_staging.sql
supabase/migrations/20260509070000_apply_trade_agencies_phase3_enrichment.sql
supabase/migrations/20260509070100_apply_trade_agencies_phase3_domain_fixup.sql
supabase/migrations/20260509080000_extend_agency_contacts_with_mes_scoring.sql
supabase/migrations/20260509080100_migrate_contact_persons_to_agency_contacts.sql
supabase/migrations/20260509080200_update_agencies_report_view.sql
supabase/migrations/20260509080300_drop_country_trade_organizations.sql
```

## Cost summary

- 140 Claude Code sub-agent dispatches (3 smoke + 137 bulk).
- Per-agent: ~30-50K tokens (web_search + 2-3 web_fetches + LinkedIn cross-check + one Supabase MCP INSERT).
- Aggregate: ~5M tokens for the bulk research run.
- Wall-clock: ~75 min for Phase 3 research + apply, ~10 min for Phase 4 schema migration + frontend wiring. One mid-run interruption (org monthly usage limit) resumed cleanly.

## Records that need manual handling

1. **Australia Malaysia Chamber of Commerce (AMCC)** — `is_active=true`,
   `needs_re_research=true`, `enrichment.status=invalid`. The research agent
   confirmed this org **does not exist** as a real bilateral body; the
   listed website was unrelated. Recommend: `is_active=false` (or hard
   delete). The legitimate AU-MY body is `Australia Malaysia Business
   Council` and is a separate row.

2. **6 in-table duplicate pairs** — the Phase 3 research agents converged
   on the same canonical site for these, but the dedup itself was scoped
   out of Phase 4. Pick one of each pair to keep:

   | Recommended keep | Recommended drop | Shared canonical site |
   |---|---|---|
   | Danish Trade Council | Danish Trade Council / Danish Connect | australien.um.dk |
   | Dutch Chamber of Commerce Queensland | DCCQ - Dutch Chamber of Commerce Queensland | dccq.org |
   | Estonian Australian Chamber of Commerce | Estonian Chamber of Commerce | eacci.com.au |
   | Indonesian Chamber of Commerce Western Australia | ICCWA - Indonesian Chamber of Commerce Western Australia | iccwa.net.au |
   | New Zealand Middle East Business Council | NZ-Middle East Business Council (NZMEBC) | nzmebc.org.nz |
   | JETRO - Japan External Trade Organization | JETRO - Japan External Trade Organisation | jetro.go.jp |

   Phase 4 already migrated `contact_persons` for *both* rows of each
   pair into `agency_contacts`, so the merge is straightforward — just
   reassign the dropped row's `agency_contacts.agency_id` to the kept
   row, then delete the dropped row.

3. **`government_level` convention for foreign agencies**. KOTRA was tagged
   `bilateral` while Enterprise Ireland was tagged `international` — both
   are foreign federal agencies with an Australian office. Recommend a
   one-shot SQL pass to standardise: `international` for foreign federal
   trade agencies (KOTRA, JETRO, Enterprise Ireland, Business France,
   Enterprise Singapore, Business Sweden, Trade Council of Denmark, etc.);
   `bilateral` reserved for member-funded business councils with no formal
   government affiliation (FACCI, AKBC, AmCham, EABC, etc.).

## Recommendation: legacy fields to retire

The following columns on `trade_investment_agencies` are now superseded
by canonical replacements but were preserved during this cycle for backwards
compatibility. Suggest dropping them in a future migration once frontend
consumers have all switched over (verified zero readers via grep before
dropping):

| Legacy column | Canonical replacement | Reason kept |
|---|---|---|
| `website` | `website_url` | Some legacy SQL/scripts may still read `website` |
| `founded` | `founded_year` | Same |
| `location` | `location_city` + `location_state` + `location_country` | Free-text version still rendered in some sidebars |
| `location_country` | `country_iso2` | Free-text version, replaceable with iso2-driven label |
| `contact_persons` | `agency_contacts` table | Per cleanup spec: keep one release as backup |

**Suggested next migration cycle**: after one release of the new schema in
production, do a coordinated drop of `contact_persons`, `website` (alias
`website_url`), `founded` (alias `founded_year`), and the `location_*`
free-text columns where the structured equivalents are populated.

## Done — entire cleanup arc complete

Phase 3 + Phase 4 are complete. The branch
`claude/enrich-trade-agencies-tbS9P` carries the full work
(7 migrations, 1 orchestration script, 3 docs, frontend updates).
Ready for review + merge.
