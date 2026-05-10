# Trade & Investment Agencies — Phase 3.6/3.7 apply audit (2026-05-09)

Phase 3.6 (apply staged enrichment) and Phase 3.7 (post-enrichment audit)
ran end-to-end against `trade_investment_agencies`. This doc captures the
final state. Phase 4 (normalized schema migration) has **not** started yet
and is gated on user approval.

## Acceptance criteria — §3.7

| Criterion | Target | Actual | Pass | Notes |
|---|---|---|---|---|
| Tier A (richness ≥ 11) | ≥ 100 | **139** | ✅ | Was 0 before Phase 3 |
| Tier C (richness ≤ 3) | ≤ 5 | **1** | ✅ | The 1 record at richness=1 is `Australia Malaysia Chamber of Commerce (AMCC)`, correctly flagged invalid |
| `needs_re_research = true` | 0 | **1** | ⚠️ | The same AMCC invalid row — apply intentionally skipped it |
| `domain` populated | ≥ 135 | **138** | ✅ | Was 127 |
| `location_city` clean (no street/level/etc) | ≥ 130 | **139** | ✅ | All non-AMCC records cleaned |
| `government_level` populated | ≥ 130 | **139** | ✅ | Was 14 |
| `jurisdiction` non-empty | ≥ 130 | **139** | ✅ | Was 10 |

## Richness distribution (out of 14 possible points)

| Richness | Count |
|---|---|
| 14 (max) | 29 |
| 13 | 81 |
| 12 | 26 |
| 11 | 3 |
| 1 | 1 (AMCC, invalid) |

**139 of 140 records (99%) are Tier A.**

## Field-by-field population

| Field | Populated | Notes |
|---|---|---|
| `tagline` | 139/140 | Apply rule: overwrite if null/empty |
| `basic_info` | 139/140 | Apply rule: overwrite if null/empty |
| `why_work_with_us` | 139/140 | Apply rule: overwrite if null/empty |
| `description` | 140/140 | Was already NOT NULL; rule overwrote ~102 truncated/short ones |
| `description_full` | 139/140 | Newly populated for all applied records |
| `description` length ≥ 200 | 41/140 | New `description` is the *short* version (~250 char target). The *long* version lives in `description_full`. |
| `linkedin_url` | 136/140 | 4 records had no findable LinkedIn |
| `government_level` | 139/140 | Was 14 |
| `domain` | 138/140 | Was 127. Two still null: ASEAN Chamber (no public site) + AMCC (org doesn't exist) |
| `website_url` | 139/140 | Only AMCC remains (its existing arvensystech.com URL was unrelated to AU-MY trade) |
| `jurisdiction` non-empty | 139/140 | Was 10 |
| `sectors_supported` non-empty | 139/140 | Replaced non-canonical strings (`fintech`, `technology`) with canonical enums (`Fintech`, `Deep Tech`, etc.) |
| `support_types` non-empty | 140/140 | REPLACE rule preserved AMCC's existing default values |
| `experience_tiles` non-empty | 101/140 | Was 6 |
| `needs_re_research = false` | 139/140 | Only AMCC still flagged |

## Records still missing a domain (2)

1. **ASEAN Chamber of Commerce Inc.** — `applied`, `needs_re_research=false`. Agent searched extensively and confirmed the org exists (Perth WA, est. 2018) but has no standalone public website beyond a LinkedIn page. The agent's `verified_domain` was empty; the apply rule preserved the null.
2. **Australia Malaysia Chamber of Commerce (AMCC)** — `invalid`, `needs_re_research=true`. Agent confirmed this org **does not exist**. The legitimate AU-MY bilateral body is Australia Malaysia Business Council (AMBC), which is a separate row in the directory. Recommend setting `is_active=false` on the AMCC row in a follow-up cleanup, or hard-deleting it.

## Domain/website fixup (Phase 3.6 patch)

The strict apply rule (`overwrite if needs_re_research = true AND verified differs`)
left 2 records with `domain=null` even though research had verified the
canonical site, because they happened to have `needs_re_research=false`
already (Pass 1 didn't flag them):

- **Embassy of Switzerland in Australia** → `eda.admin.ch` (Canberra office)
- **Invest Northern Ireland** → `investni.com`

A small follow-up migration (`apply_trade_agencies_phase3_domain_fixup`)
backfilled `domain` and `website_url` for any `applied` staging rows where
those fields were null on the source. Final domain count: 138/140.

## Duplicates flagged for Phase 4

Six pairs were independently confirmed by separate sub-agents converging
on the same canonical site:

| Keep | Drop (or merge into kept) | Shared canonical |
|---|---|---|
| Danish Trade Council | Danish Trade Council / Danish Connect | australien.um.dk |
| Dutch Chamber of Commerce Queensland | DCCQ - Dutch Chamber of Commerce Queensland | dccq.org |
| Estonian Australian Chamber of Commerce | Estonian Chamber of Commerce | eacci.com.au |
| Indonesian Chamber of Commerce Western Australia | ICCWA - Indonesian Chamber of Commerce Western Australia | iccwa.net.au |
| New Zealand Middle East Business Council | NZ-Middle East Business Council (NZMEBC) | nzmebc.org.nz |
| JETRO - Japan External Trade Organization | JETRO - Japan External Trade Organisation | jetro.go.jp (spelling variant only) |

The Phase 4 plan (`agency_contacts` migration) should preserve any
non-overlapping `contact_persons` rows from the dropped row before merging.

## Cross-cutting note for Phase 4

**`government_level` convention for foreign agencies is inconsistent.**
KOTRA was tagged `bilateral` while Enterprise Ireland was tagged
`international`. Both are foreign federal agencies with an Australian
office. Recommend a one-shot SQL pass to normalize:

- `international` → foreign federal trade agencies running an AU/NZ office
  (Austrade is `federal`; KOTRA, JETRO, Enterprise Ireland, Business
  France, Enterprise Singapore, Business Sweden, Trade Council of
  Denmark, etc. are `international`)
- `bilateral` → reserve for member-funded business councils with no
  formal government affiliation (FACCI, AKBC, AmCham, EABC, etc.)

This isn't blocking Phase 4 but worth doing in the same window.

## Cost / process notes

- 140 sub-agent dispatches (3 smoke + 137 bulk).
- One mid-run interruption was a temporary org monthly usage limit; resumed cleanly.
- Each agent: ~30-50K input/output tokens (web search + 2-3 fetches + LinkedIn cross-check + Supabase MCP insert). Aggregate ~5M tokens.
- Wall-clock: ~75 min end-to-end for the bulk research + apply.
- All agents inserted directly into `trade_agencies_enrichment_staging`; the parent session ran the validation, diff review, and apply UPDATE.

## Next step

Phase 3 is complete. Awaiting approval before Phase 4:

1. `agency_contacts` schema extension (add `is_archived`, `mes_relevance_score`, `tier`)
2. Migrate `contact_persons` jsonb → `agency_contacts` rows
3. Update `agencies_report_view` with `primary_contacts` + `team_contacts`
4. Wire frontend consumers
5. Resolve `country_trade_organizations` (4 rows, likely all duplicates)
6. Resolve the 6 Phase-3-discovered duplicates within `trade_investment_agencies`
