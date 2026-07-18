# Parity checklist — tick per section × fixture before flag-on

Review each row in `/dev/report-preview` against the reference HTML (and screenshots when shared). A row passes when layout, tone rules, links, chips, and the named degradation state all match. Do not enable `report_v2` for any customer until every row is ticked.

| # | Section | floats | nory | lemlist | Degradation state to verify |
|---|---------|--------|------|---------|------------------------------|
| 0 | Cover + evidence legend | ☐ | ☐ | ☐ | missing `meta.domain` → monogram cover mark |
| 1 | 01 Executive summary + key question | ☐ | ☐ | ☐ | highlights render as linked entities, never re-quoted question |
| 2 | 02 Metric tiles + footnote | ☐ | ☐ | ☐ | <6 tiles reflow; ◐ EST pill full-size |
| 3 | 02 SWOT quad | ☐ | ☐ | ☐ | 3 vs 4 items per quadrant |
| 4 | 03 Competitor table + scan hook | ☐ | ☐ | ☐ | n=3 vs n=5 vs n=6; customer row first + tinted |
| 5 | 04 Accounts | ☐ | ☐ | ☐ | floats: +1 unbriefed · nory: GYG gap card · lemlist: briefed=[] → ICP card |
| 6 | 05 Providers (two-tier) | ☐ | ☐ | ☐ | ranked 3 + grid 6 vs grid 3 |
| 7 | 06 Gov & hubs | ☐ | ☐ | ☐ | corridor bodies only on foreign_entrant, per `meta.origin` |
| 8 | 07 Mentors | ☐ | ☐ | ☐ | headshot present vs monogram; extra row |
| 9 | 08 Investors | ☐ | ☐ | ☐ | checkSize omitted when unknown (R12) |
| 10 | 09 Events | ☐ | ☐ | ☐ | lemlist: maximise tips block; others: none |
| 11 | 10 Action plan | ☐ | ☐ | ☐ | flat body (floats/nory) vs grouped (lemlist) |
| 12 | 11 Compliance table + stats + checklist | ☐ | ☐ | ☐ | severity border colors; archetype-specific rows |
| 13 | 12 Guides | ☐ | ☐ | ☐ | "Relevant because:" footer on every card |
| 14 | 13 Leads | ☐ | ☐ | ☐ | dataset card (nory) vs gap card (floats/lemlist); request box always |
| 15 | 14 Close + shortlist strip | ☐ | ☐ | ☐ | empty-state copy; starred chips persist after refresh |
| 16 | Sources band | ☐ | ☐ | ☐ | grouped by tier, never raw domains |
| 17 | Mobile 375px + 768px | ☐ | ☐ | ☐ | no horizontal overflow; tables→cards; 44px targets |
| 18 | PDF print | ☐ | ☐ | ☐ | section page-breaks; hooks static; footer every page |
| 19 | Adapter on a REAL production report | ☐ | — | — | renders without renderer changes; mismatches logged |

Sign-off: __________  Date: __________
