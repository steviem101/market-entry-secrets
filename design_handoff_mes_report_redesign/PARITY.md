# Parity checklist — tick per section × fixture before flag-on

## Build decisions (STEP 1 answers, 2026-07-18)

1. **Profile routes (confirmed):** investors `/investors/:slug` · providers `/service-providers/:providerSlug` · mentors (two-level) `/mentors/:categorySlug/:mentorSlug` · hubs `/innovation-ecosystem/:slug` · gov bodies `/government-support/:slug` · events `/events/:eventSlug` · lead datasets `/leads/:slug` · guides `/content/:slug`. The adapter owns mapping contract paths to these.
2. **Interactions table:** `report_interactions` (report_id, type, payload jsonb, created_at) — confirmed. Migration remains approval-gated per repo rules; plan before tickets 13–14.
3. **Request-hook notifications:** Slack via the existing `dispatch_activity_event` → `slack-notify` path (an `activity_event_routing` row), in addition to `report_interactions` persistence.
4. **`platform:<slug>` asset resolution:** entity row's stored `logo_url`/`avatar_url` column → logo.dev derived from the entity's website domain (`src/lib/logoUtils.ts`) → monogram. Customer cover mark = logo.dev from `meta.domain`.
5. **Branch:** `claude/message-report-redesign-gx8pn3` (harness-pinned, off latest main). Mapping note: the package's suggested `report-v2` branch holds the raw handoff snapshot; this directory is its canonical in-repo copy. Ticket scoping = one commit scope per ticket on this branch.
6. **Font (owner deviation from DECISIONS #1, 2026-07-18, ticket-2 review):** ALL report type renders in the app's default system sans stack — no Plus Jakarta Sans and no monospace anywhere (labels/tags/figures keep caps/tracking/sizes, in sans). Owner accepted drift from the prototypes' type metrics; future tickets must not use `font-mono` or `font-rc` in report_v2 components.

## Code-review fixes (max-effort review, 2026-07-18)

A max-effort `/code-review` over the branch surfaced 15 CONFIRMED findings; all correctness/security items were fixed before continuing. Notable: the adapter read `matches.lead_databases` but the pipeline stores `matches.leads` (§13 dataset card never rendered); `Rich` rendered unsanitized hrefs for links in LLM prose (now guarded by `isPlatformPath`); `public/dev-fixtures/` shipped into `dist` (moved to a gitignored repo-root `dev-fixtures/` served only by a dev-only Vite middleware); `mapPlan` covered paid `growth` reports as "FREE PLAN" (now paid→scale, unknown→free fail-closed); citation `[n]` markers minted "sourced" chips without validation (now range-checked against the source list); the exec hero stat duplicated metric tile 1 (now omitted until Phase B); report dates rendered the UTC day for an ANZ audience (now Australia/Sydney via a shared `formatReportDate`). Fixture entity links were remapped to real routes (providers→service-providers, hubs→innovation-ecosystem, organisations→government-support, guides→content, mentors→mentors/experts). Open items deferred to their tickets: competitor/account links are external-by-construction and unsatisfiable as platform-relative paths (needs a Phase-B contract decision); pipeline selects omit `avatar_url`/`logo_url` so assets stay monogram (Phase-B pipeline change) — both now LOGGED by the adapter.

Review each row in `/dev/report-preview` against the reference HTML (and screenshots when shared). A row passes when layout, tone rules, links, chips, and the named degradation state all match. Do not enable `report_v2` for any customer until every row is ticked.

| # | Section | floats | nory | lemlist | Degradation state to verify |
|---|---------|--------|------|---------|------------------------------|
| 0 | Cover + evidence legend | ☑ | ☑ | ☑ | missing `meta.domain` → monogram cover mark |
| 1 | 01 Executive summary + key question | ☑ | ☑ | ☑ | highlights render as linked entities, never re-quoted question |
| 2 | 02 Metric tiles + footnote | ☑ | ☑ | ☑ | <6 tiles reflow; ◐ EST pill full-size |
| 3 | 02 SWOT quad | ☑ | ☑ | ☑ | 3 vs 4 items per quadrant |
| 4 | 03 Competitor table + scan hook | ☑ | ☑ | ☑ | n=3 vs n=5 vs n=6; customer row first + tinted |
| 5 | 04 Accounts | ☑ | ☑ | ☑ | floats: +1 unbriefed · nory: GYG gap card · lemlist: briefed=[] → ICP card |
| 6 | 05 Providers (two-tier) | ☑ | ☑ | ☑ | ranked 3 + grid 6 vs grid 3 |
| 7 | 06 Gov & hubs | ☑ | ☑ | ☑ | corridor bodies only on foreign_entrant, per `meta.origin` |
| 8 | 07 Mentors | ☑ | ☑ | ☑ | headshot present vs monogram; extra row |
| 9 | 08 Investors | ☑ | ☑ | ☑ | checkSize omitted when unknown (R12) |
| 10 | 09 Events | ☐ | ☐ | ☐ | lemlist: maximise tips block; others: none |
| 11 | 10 Action plan | ☐ | ☐ | ☐ | flat body (floats/nory) vs grouped (lemlist) |
| 12 | 11 Compliance table + stats + checklist | ☐ | ☐ | ☐ | severity border colors; archetype-specific rows |
| 13 | 12 Guides | ☐ | ☐ | ☐ | "Relevant because:" footer on every card |
| 14 | 13 Leads | ☐ | ☐ | ☐ | dataset card (nory) vs gap card (floats/lemlist); request box always |
| 15 | 14 Close + shortlist strip | ☐ | ☐ | ☐ | empty-state copy; starred chips persist after refresh |
| 16 | Sources band | ☑ | ☑ | ☑ | grouped by tier, never raw domains |
| 17 | Mobile 375px + 768px | ☐ | ☐ | ☐ | no horizontal overflow; tables→cards; 44px targets |
| 18 | PDF print | ☐ | ☐ | ☐ | section page-breaks; hooks static; footer every page |
| 19 | Adapter on a REAL production report | ☑ | — | — | renders without renderer changes; mismatches logged |

Sign-off: __________  Date: __________
