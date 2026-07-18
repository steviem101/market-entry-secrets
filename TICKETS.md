# Build tickets — ordered, one component each

Rules: one PR per ticket. Done-check = renders ALL THREE fixtures (`floats.json`, `nory.json`, `lemlist.json`) correctly, including the degradation state named in the ticket. Do not start Phase B until P0+P1 pass on both fixtures. Reference visuals: `reference/*.dc.html`. **Ticket 0 (the /dev/report-preview harness) is defined in START_HERE.md and comes before ticket 1.**

## P0 — foundation (trust floor)
1. **ReportShell + SectionCard** — page frame (1240px column, #f4f6f8 bg), section card (14px radius, 3px sky top accent, 64/80 padding), mono section label. Done: all 16 sections render as empty shells from fixture section list.
2. **EvidenceChip + SourcesBand** — ●/◐/○ chips (inline + pill variants), dark sources band grouped by tier. Done: every chipped number in both fixtures renders; ◐ shows EST pill at full size.
3. **Cover + Close** — dark cover (logo slot, headline, legend strip, key question) + strategy-session close (arriveWith list). Done: both archetype covers; plan-specific close copy (scale = session included).
4. **Adapter** — maps current pipeline output → contracts. Done: a real production report JSON renders through the shell without renderer changes; all mismatches logged, not thrown.

## P1 — value layer
5. **MetricTiles + SwotQuad** — 3×N tile grid, SWOT with accent borders. Degradation: <6 tiles reflow; missing quadrant omitted.
6. **CompetitorTable + ScanHook** — tinted customer row, verdict column, dashed request hook + inline confirmation. Degradation: Floats n=3 vs Nory n=5; n=1 → single row + hook.
7. **AccountCards + GapCard + IcpCard** — briefed cards with status chips + APPROACH/ANGLE footer; unbriefed → gap card with request button; briefed=[] → ICP-guidance card + "name your targets" hook. Degradation: Nory GYG gap card AND lemlist zero-briefed state.
8. **TwoTierSection (ourRead + MatchGrid)** — ranked ruled rows + card grid; reused by providers/investors/hubs. Done: providers + investors on both fixtures.
9. **PersonCard + IdentitySlot** — headshot/logo slots with monogram fallback (34px circle / 28px square r7). Done: renders with and without asset URLs; no layout shift.
10. **EventCards + GuideCards** — date-led events; optional "maximise" tips block (lemlist fixture); guides with "Relevant because:" footer.
11. **ActionPlanPhases + ComplianceTable** — 3-col phases with entity links, supporting flat body OR grouped sub-blocks (lemlist); severity-bordered compliance table + stat rail + checklist.
12. **LeadsSection + RequestBox** — dataset card OR gap card, custom-build textarea + confirmation. Degradation: Floats (no dataset) vs Nory (360-record dataset).

## P2 — funnel & premium
13. **Shortlist (☆)** — star toggle on all match cards, chips strip in Close, persistence per DECISIONS.md #5. Done: star → refresh → still starred; chips link to profiles.
14. **Request persistence + ops notification** — all hooks write `report_interactions` rows + notify ops channel.
15. **Feature flag + side-by-side + mobile pass** — flag per report ID; old/new toggle for parity review. Mobile rules per MOBILE_AND_PDF.md (columns collapse, tables→cards, 44px targets). Done: both fixtures at 375px/768px, no horizontal overflow.
16. **PDF path** — same components, print stylesheet per MOBILE_AND_PDF.md (section page-breaks, atomic cards, hooks → static lines with report URL, profile URLs under card titles, assets preload-with-timeout). Done: print of both fixtures passes the acceptance list in MOBILE_AND_PDF.md.

**Excluded from this package:** Market Entry Map + design-rubric scorer (follow-up handoff — do not scaffold).

## Phase B (pipeline — after renderer parity)
17. Archetype field in generation output. 18. Claims registry (R3). 19. Source-tier metadata (sources → 3 tiers). 20. Ranked ourRead output with why-lines (R8) + linter rules R1–R10 as a publish gate in report-quality-loop.
