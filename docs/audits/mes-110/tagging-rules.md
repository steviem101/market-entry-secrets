# MES-110 — Sector-tagging rules (canonical)

Rules for assigning `sector_tags` / `sector_agnostic` to a content row (service provider,
mentor, event, investor, innovation org). Codified from the step-4d review after two
generator defaults (Greenhouse, CICALab) were caught mislabelled. Apply these on every
future coverage pass so the miss can't repeat.

1. **Business-model ≠ industry.** A row specialised by *model* (software-only, pre-seed,
   deep-tech, hardware, marketplace, DTC) but not by *industry* stays **agnostic**. Tag
   only when the thesis names industries it serves. Documented exception: a software-only
   investor whose *targets* are software companies → `technology-information-and-media`
   (e.g. Potentia). Contrast Co Ventures (software-only but invests across all industries →
   agnostic).

2. **Thesis ≠ sector.** Impact/audience theses — social enterprise, women/First-Nations/
   diversity founders, conservation, blue economy, climate-justice — are **agnostic**;
   none map to a sector slug. Worked examples: Mill House, New Wave, Anyone Can, HATCH
   (Taronga), Ocean Impact.

3. **Fixed convention table for composite labels** (identical label → identical tag set,
   no per-row improvisation): cleantech/energy → `utilities` (+`manufacturing`/
   `professional-services` for platforms); space/defence → `government-administration` +
   `manufacturing`; biotech/health/medtech → `hospitals-and-health-care` (+`manufacturing`
   for devices); govtech → `government-administration`; mining/resources → `oil-gas-and-mining`;
   agtech → `farming-ranching-forestry` (+`technology-information-and-media`); gaming/sport →
   `entertainment-providers` (+`technology-information-and-media`); fintech →
   `financial-services` + `technology-information-and-media`. Cap at **4 tags** (5+ trips the
   `OVERTAG_THRESHOLD` demotion in `matchScoring.ts`).

4. **Invariant: tagged ⇒ `sector_agnostic = false`; agnostic decision ⇒ `sector_tags = '{}'`
   AND `sector_agnostic = true`.** Enforce in the migration by construction, never assume it
   from a CSV.

5. **Verify where the uncertainty is, not where confidence is.** The generator's
   "no stored label → agnostic + flag" default is safe, but the flagged rows are exactly the
   ones needing human/URL-level verification — generic names (Greenhouse, HATCH, Aeona) are
   the highest collision risk. Check the row's stored `description`/`website`/`location`
   (they usually resolve it) before a web search. Record `tag_source`
   (`stored_label | web_verified | operator_review`) on every decision for receipts.

6. **Events are location-first.** A generic founder/networking event is agnostic, but note
   that `sector_agnostic = true` makes it eligible for *every* report regardless of target
   region; the events candidate fetch is date-ordered with a row cap, so a large agnostic
   pool can crowd sector-tagged events. Pair any broad agnostic-events pass with a
   relevance-ordering fix in `generate-report` (tracked follow-up).
