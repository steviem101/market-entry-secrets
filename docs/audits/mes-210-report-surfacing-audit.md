# MES-210 — Report surfacing audit: which databases actually reach AI reports

> **Read-only audit** (SELECT-only against Supabase project `xhziwveaiuhzdoutpgrh`, repo inspection
> only). Conducted 2026-07-18 on branch `claude/mes-database-surfacing-audit-837rn1` (harness-assigned;
> maps to the ticket's requested `mes-210-report-surfacing-audit`). All data figures are aggregates —
> no lead/user PII, no secret values. Every finding is labelled **Confirmed** (with file/line or query
> evidence) or **Suspected** (needs a human check).

## 0. Executive summary

The matching layer is *not* silently broken across the board — for most directory tables the
pipeline queries, candidate pools are healthy and embeddings are 100 % fresh. The under-surfacing
is concentrated in a small number of structural causes:

1. **There is no `case_studies` table.** The "120+ case studies" are 146 published
   `content_items` rows with `content_type='case_study'` (plus a fully-populated
   `content_company_profiles` row each). The report pipeline reaches them only through the shared
   `content_items` pool — **capped at 5 cards, shared with guides, and attached to the
   `events_resources` section as secondary "resources" cards**. There is no case-study section, no
   case-study-specific matching, and the rich corridor fields (`origin_country`, `target_market`,
   `industry`, `outcome` — 100 % populated on all 146) are **never queried** by `generate-report`.
2. **Measured production surfacing (115 completed reports):** only **31 of 146 case studies (21 %)
   have ever surfaced in any report**; **45 of 115 reports (39 %) contain zero case-study cards**;
   the mean is ~2.0 case-study cards per report. This is despite every simulated profile having
   60–120 sector-eligible case-study candidates.
3. **`lemlist_contacts` is empty (0 rows)** — the `lead_list` section's "contacts" half has
   surfaced nothing in 100 % of reports.
4. **Goal→service-tag matching has many dead levers**: 12+ of the tags the intake goals expand to
   (`HR`, `Trade Advisory`, `Lead Generation`, `Data`, `Regulatory`, `Marketing`, `Sales`,
   `Grants`, `Funding`, `Startup`, `Innovation Hub`, `Founder`) match **zero** directory rows via
   exact `.cs.{}`; `Legal` matches just 2 provider rows. The `service_terms` synonym fix exists
   (14 rows) but `SERVICE_TERMS_ENABLED` is default-off.
5. **Candidate fetches truncate arbitrarily**: most overlap queries use `.limit(40)` with **no
   `.order()`** while 80–160 rows qualify, so which candidates even reach the ranker is
   arbitrary — the same bug class already diagnosed and fixed for `trade_investment_agencies`
   (comment at `supabase/functions/generate-report/index.ts:1672-1681`) still applies to
   `content_items`, `service_providers`, `community_members`, `events`, `innovation_ecosystem`.
6. **Sector tagging is canonical but sparse on two surfaces**: zero non-canonical `sector_tags`
   values exist anywhere (MES-110 held), but only 33 % of `service_providers` and 35 % of
   `trade_investment_agencies` carry sector tags — those surfaces rank almost entirely on
   `sector_agnostic`/services/location, which converges non-tech reports on the same generic rows.

`case_studies` is the **4th most-selected intake goal** (83 of 151 intakes) — customers explicitly
ask for case studies and receive ~2 cards buried in "Events & Resources". A prioritised, ticket-ready
fix list is in §7.

---

## 1. Pipeline map (verified in code)

### 1.1 Stages

There are **no** `enrich-intake` or `search-matches` edge functions (ticket names were hints; the
repo confirms one function does everything). The whole flow is
`supabase/functions/generate-report/index.ts` (~4,000 lines + pure helper modules):

| Stage | Where | What happens |
|---|---|---|
| Intake | `user_intake_forms` (v2 form writes `goal_ids`, `end_buyer_industries`, `report_focus`, …) | Row fetched at `index.ts:2348`; ownership + JWT checked in-code |
| Research | Phase-1 `Promise.all` | Firecrawl scrape, 6 Perplexity queries, competitor/end-buyer research |
| **Matching** | `searchMatches()` `index.ts:1921` | Union of two paths: **array-overlap** (`searchMatchesOverlap`, `index.ts:1412`) and **semantic KB** (`semanticMatches`, `index.ts:1823` → `match_knowledge` RPC over `mes_knowledge_base`), re-ranked by the pure `matchScoring` module, then union-level relevance gates (geo, corridor, state, chamber, lead-ICP, immigration) and cross-section dedupe |
| Section generation | `index.ts:3077+` | 10 sections in one parallel batch via Lovable gateway (or Anthropic for `claude-*` section models); cards attached via `getMatchesForSection` (`index.ts:2219`) |
| Persist | `user_reports.report_json` | `{sections, matches, metadata}`; tier gating at render via `get_tier_gated_report` |

### 1.2 Section → source table → mechanism

`getMatchesForSection` (`index.ts:2219-2252`) is the **complete** section↔table map:

| Report section | Source tables (cards) | Mechanism |
|---|---|---|
| `service_providers` | `service_providers` (cap 10) + `trade_investment_agencies` (cap 5) + `innovation_ecosystem` (cap 5) | overlap `.or()` on `sector_tags.ov` / `sector_agnostic` / `services.cs` / `location.ilike` **+** KB semantic, union re-ranked; corridor/geo/chamber gates |
| `mentor_recommendations` | `community_members` (cap 5) | as above on `specialties`, + `origin_country` corridor boost; `is_active`/`is_anonymous` filters, person dedupe |
| `events_resources` | `events` (cap 5) + **`content_items` (cap 5)** | events: sector + hard `date>=today` + region filter + dedupe; content: sector-only (no location), semantic-first |
| `investor_recommendations` | `investors` (cap 8) | sector + `country` corridor |
| `lead_list` | `lead_databases` (cap 5, remapped onto `leads` variable, strict ICP gate) + `lemlist_contacts` (cap 10) | lead_databases fetched whole (65 rows) then ICP-gated; lemlist via `industry`/`contact_location` ilike |
| `competitor_landscape` | *none* (research-driven) | `index.ts:2249` returns `[]` |
| `executive_summary`, `swot_analysis`, `action_plan`, `setup_compliance` | *none* (research/prose-driven; prose may reference matched entities via prompt variables) | — |

**Confirmed:** no section sources case studies as a first-class surface. Case studies can only
appear as up to 5 `content_items` cards (shared with guides/interviews/best-practices) inside
`events_resources` (`index.ts:2240-2243`), plus whatever prose the section model writes from the
card list.

**Confirmed:** the KB semantic path cannot widen this: `SEMANTIC_CFG`
(`supabase/functions/generate-report/semanticMatch.ts:36-157`) enumerates the eight consumed
types, and `groupRankedBySource` (`semanticMatch.ts:182-197`) explicitly **drops any
`source_table` not in that config**.

**Confirmed:** `generate-plan`'s `case_studies` context variable is actually a
`content_company_profiles` query (`supabase/functions/generate-plan/index.ts:67, 89-93, 112`) —
no AI pipeline queries a case-study table (none exists — see §2).

### 1.3 Intake fields → matching signals

| Intake column (`user_intake_forms`) | Transform | Used by |
|---|---|---|
| `goal_ids` (fallback `services_needed` labels) | `expandGoalsToServiceTags` (`goalServiceTags.ts:100`) → service tags, optionally synonym-expanded via `service_terms` (flag `SERVICE_TERMS_ENABLED`, default **off**, `index.ts:1400-1410`) | `.cs.{}` arms on `services`/`specialties` + scorer service-overlap |
| `industry_sector[]` (LinkedIn groups or free text) | `industryGroupsToSectorSlugs` (`sectorTaxonomy.ts`) → 20 canonical sector slugs (152-group rollup + free-text alias regexes) | `sector_tags.ov.{}` arms + scorer sector overlap |
| `end_buyer_industries[]` (v2 `target_customers.industries` shim) | same rollup → `sellsToSectors`; `leadIcpTokens` | buyer-facing surfaces only (leads/events/content, `applySellsTo`) + strict lead ICP gate |
| `target_regions[]` | overlap candidate query: `region.split("/")[0]` (`index.ts:1434`) → `location.ilike`; gates/scorer: `expandTargetRegions` (`targetRegion.ts:48`) which drops generic words ("National") and expands state codes | location arms, event region hard-filter, geo gates. NB "National" (96/151 intakes) contributes a dead `%National%` ilike arm in the candidate query — harmless (OR) but no signal |
| `country_of_origin` | `normalizeCountry` / `geoOriginTerms` | mentor `origin_country` corridor, agency corridor gate, investor `country`, immigration gate |
| `report_focus`, `key_challenges`, `services_needed` | regex intent (`index.ts:1985-1987`) + prompt variables | immigration-intent detection; section prompts |
| `company_name`, `company_stage`, `employee_count`, … | prompt variables only | no matching effect |

### 1.4 KB / embedding layer

Sources per `docs/mes-knowledge-base-rag.md` + measured `mes_knowledge_base` contents: 11 source
tables; **0 unembedded rows, 0 stale rows** (embedded_hash = content_hash everywhere) as of
2026-07-18. Coverage vs eligible source rows:

| source_table | KB sources | eligible source rows | coverage |
|---|---|---|---|
| service_providers | 113 | 113 | 100 % |
| community_members | 132 | 132 active | 100 % |
| events | 340 | 340 approved | 100 % |
| content_items | 196 (2,117 chunk rows) | 196 published | 100 % |
| innovation_ecosystem | 217 | 217 | 100 % |
| trade_investment_agencies | 148 | 149 (1 inactive — excluded by recipe) | 100 % of active |
| investors | 499 | 499 | 100 % |
| lead_databases | 65 | 65 active | 100 % |
| countries / country_faqs / linkedin_post | 8 / 94 / 1,672 | — | (not report-card surfaces) |

**Suspected:** the last `knowledge_embed_log` run is `2026-07-14` (cron is documented as every
2 min). Since nothing is currently stale this may simply be "no work → no log rows", but worth a
human check that the pg_cron job is still scheduled.

---

## 2. Where case studies actually live (Confirmed)

There is **no `public.case_studies` table** (information_schema check; only `case_study_sources`,
`case_study_quotes`, `country_case_studies` exist). CLAUDE.md §5 listing `case_studies` as a
directory table is drift. The `/case-studies` directory reads
`content_items` where `content_type='case_study'` joined to `content_company_profiles` and
`content_founders` (`src/hooks/useCaseStudies.ts:4-27`).

Case-study data quality is **excellent**:

- 146 rows, all `status='published'`, all with slugs, all with non-empty canonical `sector_tags`
  (58 also `sector_agnostic=true`).
- `content_company_profiles`: **146/146** have `origin_country`, `target_market`, and `industry`
  populated (plus `outcome`, revenue/cost fields).
- All 146 embedded in the KB (within the 196 content_items, chunked).

The under-surfacing is therefore **structural in the pipeline, not a data problem**.

---

## 3. Per-table inventory (measured 2026-07-18)

"Sector" = non-empty `sector_tags`; percentages against the eligible pool the pipeline queries.

| Table | Eligible rows | Sector tags | Sector-agnostic | Country/origin | Usable link | Description ≥80 chars | KB embedded |
|---|---|---|---|---|---|---|---|
| `content_items` (case_study) | 146 published (of 196 content items: 44 guides, 6 other) | 146 (100 %) | 58 (40 %) | via profile join: 146/146 origin + target market (**unused by pipeline**) | 146 slugs | meta_description ≥40 chars: 89 (61 %); full bodies exist | 100 % |
| `service_providers` | 113 | **37 (33 %)** | 94 (83 %) | n/a (free-text `location`, 113/113) | 113 websites | 112 (99 %) | 100 % |
| `community_members` | 132 active / 127 named | 121 (92 %) | 11 (8 %) | `origin_country` **101 (77 %)** | 132 slugs | — | 100 % |
| `events` | 231 approved+future (340 approved, 406 total) | 226 (98 %) | 5 (2 %) | `country` 231 (100 %) | 231 slugs | — | 100 % (approved) |
| `lead_databases` | 65 active | `sector` text 65 (100 %); `sector_tags` 41 (63 %, **not read by matcher** — schema note `index.ts:1619-1631`) | n/a | `location` 65 (100 %) | 65 slugs | — | 100 % |
| `leads` (legacy) | 7 | 7 | 0 | 7 | no slugs | — | **not consumed by reports** (replaced by lead_databases) |
| `innovation_ecosystem` | 217 | 125 (58 %) | 76 (35 %) | free-text location 217 | 216 websites | 203 (94 %) | 100 % |
| `trade_investment_agencies` | 149 (148 active) | **52 (35 %)** | 128 (86 %) | `location_country` 149 (100 %) | 148 website/domain | 149 (100 %) | 100 % of active |
| `investors` | 499 | 451 (90 %) | 116 (23 %) | `country` 499 (100 %) | **302 websites (61 %)** | 484 (97 %) | 100 % |
| `lemlist_contacts` | **0 rows** | — | — | — | — | — | not in KB (by design) |

### 3.1 Taxonomy drift check (Confirmed: none at the slug layer)

A cross-table scan of every `sector_tags` value against the canonical 20 LinkedIn sector slugs
returned **zero non-canonical values** in any of the nine tables. The MES-110 standardisation is
holding. Free-text intake industries are handled by the alias regexes in `sectorTaxonomy.ts`
(top live values — "Artificial Intelligence" ×34, "Data Infrastructure and Analytics" ×20,
"SaaS" ×16, "FinTech"/"Fintech" ×28, "Cybersecurity" ×10 — all resolve to slugs).

### 3.2 Goal service-tag drift (Confirmed: many dead levers)

The goal expansion feeds exact-match `.cs.{}` arms. Measured exact-match row counts across
`service_providers.services` (sp), `community_members.specialties` (cm),
`innovation_ecosystem.services` (ie), `trade_investment_agencies.services` (ta):

| Tag | sp | cm | ie | ta | Verdict |
|---|---|---|---|---|---|
| HR, Trade Advisory, Lead Generation, Data, Regulatory, Marketing, Sales, Grants, Funding, Startup, Innovation Hub, Founder, Community (≈), Government (0) | 0 | 0 | 0 | 0–1 | **dead levers** |
| Legal | 2 | 1 | 0 | 0 | near-dead (real vocab is "Legal Services" etc.) |
| Tax | 11 | 0 | 0 | 0 | works (sp only) |
| Consulting | 10 | 0 | 0 | 0 | works (sp only) |
| Accelerator / Incubator / Co-working | 0 | — | 77 / 24 / 45 | — | works (ie) |
| Active Advisor / Cross-border / International Founder / Scaled Founder | — | 22 / 47 / 47 / 15 | — | — | works (cm archetypes, per the 2026-07-09 reconciliation) |
| Mentorship / Advisory | 1 | **0** | 0 | 0 | dead on the surface they target |

The mitigation (`service_terms` synonym index, 14 rows) is wired in (`index.ts:1400-1429`) but
**inert until `SERVICE_TERMS_ENABLED` is turned on** (MES-148 Phase 5 rollout runbook).

Minor data note (**Suspected** cause — legacy backfill): `goal_ids` arrays contain 217 NULL
elements across the 151 intakes (harmless — the expander skips unknown ids — but worth a cleanup).

---

## 4. Surfacing simulation (5 representative profiles)

Profiles are built from real intake distributions (origins: Ireland 52, Singapore 35, Australia 25,
UK 16, Japan 12; regions: National 96, Sydney/NSW 80, Melbourne/VIC 18, Brisbane/QLD 11; top
industries as in §3.1). For each, the overlap matcher's **candidate** filter
(`buildOr` — `sector_tags && slugs OR sector_agnostic OR services ⊇ tag OR location ilike city`)
was replicated in SQL exactly as `index.ts:1453-1464` composes it. Run twice (2026-07-18);
**both runs returned identical counts** (stability check passed).

| Candidate pool | P1 IE·AI·National | P2 SG·FinTech·Sydney | P3 UK·Cyber·Melbourne | P4 AU·RecTech·National | P5 JP·Mfg·Brisbane |
|---|---|---|---|---|---|
| service_providers (of 113) | 108 | 109 | 110 | 95 | 98 |
| — of which real sector-tag match | 17 | 20 | 17 | **0** | 7 |
| community_members (of 127) | 65 | 106 | 108 | 42 | 15 |
| events (future, of 231) | 111 | 143 | 145 | **14** | 39 |
| content_items (of 196) | 152 | 164 | 152 | 86 | 83 |
| — **case studies** (of 146) | **108** | **120** | **108** | **63** | **60** |
| — case studies via real sector match | 63 | 89 | 63 | **5** | **5** |
| innovation_ecosystem (of 217) | 171 | 185 | 181 | 137 | 118 |
| trade_investment_agencies (of 149) / in corridor | 149 / 113 | 149 / 112 | 149 / 116 | 129 / 111 | 144 / 112 |
| investors (of 499) | 476 | 475 | 479 | 120 | 222 |
| lead_databases (active) | 65 | 65 | 65 | 65 | 65 |
| lemlist_contacts | 0 | 0 | 0 | 0 | 0 |

### 4.1 Reading the case-study rows

Every profile has 60–120 eligible case-study candidates, yet production reports average ~2
case-study cards. The losses are all **after** candidacy:

1. `content_items` fetch is `.limit(40)` with **no `.order()`** (`index.ts:1607`) — PostgREST
   returns an arbitrary 40 of the 83–164 qualifying rows *before* ranking ever sees them
   (**Confirmed** — same starvation class as the fixed TIA bug, `index.ts:1672-1681`).
2. The ranked pool is capped at **5 content cards total**, shared with 44 guides + 6 other
   content items (`SEMANTIC_CFG.content_items.cap=5`, `semanticMatch.ts:82-94`).
3. Those ≤5 cards land as secondary "resources" cards inside `events_resources`
   (`index.ts:2240-2243`) — there is no case-study section, heading, or slate.
4. For non-tech profiles (P4, P5) only ~5 case studies match on real sector overlap; the other
   ~55 candidates are `sector_agnostic` — the scorer prefers genuine sector matches
   (`preferRelevant`/scoring), so the *relevant-looking* pool is effectively ~5, and corridor
   relevance (an Irish company's case studies for an Irish founder) **cannot** be scored because
   `content_company_profiles` is never joined (**Confirmed** — no reference in
   `generate-report/index.ts`).

### 4.2 Other zero/near-zero explanations

- **lemlist_contacts = 0 everywhere** (**Confirmed**): the table has 0 rows. The `lead_list`
  "contacts" card group has been empty in every report ever generated.
- **P4 events = 14** (**Confirmed**): only 14 future events carry the
  `administrative-and-support-services` tag or are sector-agnostic; events are 98 % sector-tagged
  but heavily tech/finserv-skewed.
- **P4 sp sector = 0** (**Confirmed**): zero providers are tagged
  `administrative-and-support-services`; the section fills entirely from `sector_agnostic` (94
  rows) + service tags — i.e. the same generic slate every non-tech report gets.

---

## 5. Measured production surfacing (115 completed reports)

From `user_reports.report_json->'matches'` (the persisted card arrays):

| Match pool | Reports with ≥1 card | Avg cards/report | Distinct entities ever surfaced | Table size | Directory coverage |
|---|---|---|---|---|---|
| service_providers | 84 / 115 (73 %) | 6.05 | 52 | 113 | 46 % |
| community_members | 104 (90 %) | 3.72 | 70 | 127 named | 55 % |
| events | 113 (98 %) | 4.23 | 73 | 231 future | 32 % |
| content_items | 84 (73 %) | 3.03 | 49 | 196 | 25 % |
| — **case-study cards** | **70 (61 %)** | **1.99** | **31** | **146** | **21 %** |
| trade_investment_agencies | 99 (86 %) | 3.07 | 41 | 148 | 28 % |
| innovation_ecosystem | 92 (80 %) | 3.48 | 60 | 217 | 28 % |
| investors | 73 (63 %) | 4.72 | 146 | 499 | 29 % |
| leads (lead_databases) | 86 (75 %) | 2.00 | 34 | 65 | 52 % |
| lemlist_contacts | **0 (0 %)** | 0 | 0 | 0 | — |

Case-study sanity check (ticket test plan): **146 total → ~60–120 matchable by any single profile
→ 31 ever actually surfaced → 39 % of reports ship with zero case-study cards.**

(Older reports predate some matcher fixes — e.g. the provider-select 400 bug noted at
`index.ts:1490-1495` — so the "reports with ≥1 card" column mixes eras; treat it as a floor.)

---

## 6. Root causes

| # | Cause | Status | Evidence |
|---|---|---|---|
| RC1 | Case studies have no dedicated surface: ≤5 shared content cards inside `events_resources`; no case-study section or slate | **Confirmed** | `index.ts:2219-2252`, `semanticMatch.ts:82-94`; §5 measurements |
| RC2 | Case-study corridor/relevance fields never used: `content_company_profiles` (origin/target/industry/outcome, 100 % populated) is not queried by `generate-report` | **Confirmed** | no `content_company_profiles` reference in `generate-report/`; §2 |
| RC3 | Arbitrary candidate truncation: `.limit(40)`, no `.order()`, on content/sp/cm/events/ie fetches while 80–160 rows qualify | **Confirmed** | `index.ts:1496-1498, 1512-1516, 1562-1565, 1607, 1662`; §4 candidate counts; prior TIA fix comment `index.ts:1672-1681` |
| RC4 | `lemlist_contacts` empty → lead_list contacts half always empty | **Confirmed** | table count 0; §5 |
| RC5 | Dead goal→service tags (12+ tags match 0 rows; `Legal` ×2); synonym fix flag-gated off | **Confirmed** | §3.2 measurements; `index.ts:1400-1410`; `goalServiceTags.ts:38-60` |
| RC6 | Sparse sector tagging on `service_providers` (33 %) and `trade_investment_agencies` (35 %) → sector signal no-op, generic slates for non-tech sectors | **Confirmed** | §3 inventory; §4 P4/P5 rows |
| RC7 | `case_studies` goal (83 intakes) expands only to generic `Market Research`/`Consulting` tags + section emphasis — no mechanism raises case-study count | **Confirmed** | `goalServiceTags.ts:42,127`; §4.1 |
| RC8 | Event sector skew: only 14 future events for admin/support sector; 39 for manufacturing | **Confirmed** | §4 simulation |
| RC9 | Mentor `origin_country` 77 % populated — corridor boost silently unavailable for ~23 % of active mentors | **Confirmed** | §3 inventory |
| RC10 | `knowledge_embed_log` last run 2026-07-14 despite 2-min cron (currently zero stale rows, so no live impact) | **Suspected** | log query; may be "no work → no log" — verify pg_cron schedule |
| RC11 | `goal_ids` arrays carry 217 NULL elements (legacy backfill?) | **Suspected** | §3.2 note; harmless to matching today |
| RC12 | Docs drift: CLAUDE.md §5 lists a `case_studies` table that does not exist | **Confirmed** | information_schema check; §2 |

Explicitly checked and **cleared**: RLS does not block the pipeline (service-role client); no
non-canonical sector slugs anywhere; KB embeddings 100 % fresh; tier gating does not reduce
matching (gated sections are generated for everyone and stripped at render,
`get_tier_gated_report`); the strict lead-ICP gate can empty `lead_list` **by design** (escape
hatch is the custom-list request box).

---

## 7. Prioritised fix list (proposed sub-tickets of MES-210)

| # | Proposed sub-ticket | Effort | Impact | Risk flags |
|---|---|---|---|---|
| 1 | **Case-study surfacing v1**: give case studies their own match pool (`content_items` `content_type='case_study'` joined to `content_company_profiles`), score on origin-corridor + target market + sector + outcome, and surface a dedicated slate (own card group in `events_resources`, or a new section — if a new section, update all four section-truth places incl. `get_tier_gated_report`) | M | **High** — fixes RC1/RC2/RC7; 4th-most-selected goal | Report pipeline; section-truth 4-place update if new section |
| 2 | **Deterministic candidate fetch**: add `.order()` (e.g. `last_verified`/`publish_date`/`id`) or widen `CAND` on the overlap fetches (content, sp, cm, events, ie), mirroring the TIA fetch-whole-table fix | S | High — fixes RC3 everywhere at once | Report pipeline (behaviour shift in which rows surface — golden-eval before/after) |
| 3 | **Turn on + extend `service_terms`** per the MES-148 Phase 5 runbook; then reconcile/prune the dead goal tags of §3.2 (either add synonyms that resolve them or stop emitting them) | S–M | Med-High — fixes RC5 | Flag rollout (staged); no schema change |
| 4 | **Sector-tag enrichment backfill** for `service_providers` + `trade_investment_agencies` (steward/proposal-first per `directory-data-enrichment`; target ≥80 % tagged) | M | Med — fixes RC6, helps RC8's visibility | Broad data writes → approval-gated; staging-first |
| 5 | **Per-run surfacing telemetry**: persist per-table match counts (and per-table zero flags) into `report_quality`/metadata + add to the weekly rollup, so under-surfacing is visible without a human reading reports | S | Med — makes every future regression measurable | None (additive telemetry) |
| 6 | **lemlist_contacts: populate or remove**: either wire `sync-lemlist` to actually fill the table or drop the contacts card group from `lead_list` (empty promise today) | S | Med — fixes RC4 | CRM sync (PII care) if populating |
| 7 | **Mentor `origin_country` backfill** (31 active mentors missing) + `goal_ids` NULL-element cleanup | S | Low-Med — RC9/RC11 | Data writes (small, staged) |
| 8 | **Docs**: fix CLAUDE.md §5 (`case_studies` → content_items reality), note `leads` table is legacy/unconsumed | XS | Low — RC12 | None |
| 9 | **Verify embed cron schedule** (`knowledge_embed_log` gap, RC10) — ops check, no code | XS | Low | None |

Suggested order: 2 → 1 → 3 → 5 → 6 → 4 → 7 → 8 → 9 (2 first because it is small and every other
surfacing measurement becomes deterministic after it).

---

## 8. Method / reproducibility

- Code evidence: all file:line references against branch `claude/mes-database-surfacing-audit-837rn1`
  (HEAD = main at audit time).
- Data evidence: SELECT-only SQL via the Supabase MCP against `xhziwveaiuhzdoutpgrh`, 2026-07-18.
  Aggregate queries only; no PII, no raw lead/user rows, no secret values.
- The §4 simulation replicates `buildOr` (`index.ts:1453-1464`) semantics in SQL (array `&&` for
  `.ov`, `@>` for `.cs`, `ilike` for location, plus the per-table hard filters:
  `is_active`/`is_anonymous`, `date >= today`, `status` filters, and the `isAgencyInCorridor`
  logic of `geoRelevance.ts:311-348` approximated on its structured fields). In-memory ranking
  (matchScoring) and union gates are not re-implemented — the simulation measures *candidate*
  supply; §5 measures the *final* surfaced output from real reports, bracketing the pipeline from
  both ends.
- Both simulation runs (same day) returned identical counts.
