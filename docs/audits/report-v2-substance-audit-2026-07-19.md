# report_v2 substance audit — beyond the renderer (2026-07-19)

The Phase 1–3 work (renderer/adapter hardening + grounded competitor columns) made the report
*render* cleanly. This audit asked the different question: **is the report's content actually
good** — are the matched entities right, is the research accurate, is it worth paying for? It
looked at real production reports, not fixtures.

## Findings

**F1 — Validation has been an echo chamber.** Of ~152 intake forms, ~144 are internal/team test
runs (`marketentrysecrets.com`, plus gmail/hotmail accounts) cycling the *same ~20 demo companies*
— heavily fintech/SaaS and Irish-origin. Genuine arms-length external users number **~3** (Sortd,
Nexiserve, Ignite Partners). The demo set's sector concentration mirrors the directory's, so reports
"look good" in testing because the test companies were drawn from the same inventory the matcher pulls.

**F2 — Report quality is bounded by directory coverage, and coverage is narrow.** The mentor
directory has **132 active mentors across only 8 distinct sector tags, 27% financial-services, and
0 tagged retail/ecommerce/consumer.** For the one real ecommerce user (Sortd), all three surfaced
mentors were `sector_agnostic` financial-services/government advisors — matched on *goal/stage*, not
industry (their `match_reasons` carried no "industry match"). The entities are **real** (grounding
holds — nothing hallucinated), but for any company outside the fintech/fundraising core the report
can only return generically-relevant matches. This is a **data/inventory problem**, not a renderer
or matching-code bug.

**F3 — The research layer is the strong part.** Sector-specific, current, plausible market metrics
(e.g. for Sortd: AU e-commerce market ~$51B, e-commerce software ~$9.8B @ 14.7% CAGR). The metric
tiles carry mild TAM redundancy (three overlapping "market size" figures) but are grounded.

**F4 — Scrape-declined is a common, unhandled degradation.** Sortd declined the website scrape
(`website_scrape_accepted=false`) and named no competitors — so the site-derived personalisation
(company USPs/positioning, the §03 "you" row) is empty for them. A common real-world path the
enrichment features don't yet degrade gracefully around.

## Response shipped this pass — honest degradation (t20)

Rather than let a real-but-generic fallback set read as sector-tailored, the adapter now emits an
**honest coverage caption** on the mentors / providers / investors sections **only when no match in
that section earned a sector hit** (reusing the matcher's own `match_reasons` breadcrumbs, mirroring
`hasSectorRelevance` in `matchScoring.ts`). It states the basis the matcher actually used — e.g.
*"Matched on your goals and stage rather than your specific industry."* Self-limiting: for every
company the directory covers (all the fintech demo set), no caption renders — zero change. It only
appears for out-of-cluster users like Sortd. Adapter + renderer only; no pipeline/migration/RLS.

## The real levers (not yet done — owner's call)

- **Broaden directory coverage** in target sectors (F2) — the actual quality ceiling. Start with the
  gaps real users hit (0 ecommerce mentors).
- **Get real, diverse users** (F1) — the product is being tuned without a demand signal.
- **Graceful scrape-declined handling** (F4) and TAM de-duplication (F3) — smaller follow-ups.
