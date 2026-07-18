# Pinned decisions — do not re-make these

1. **Brand tokens.** Use the repo's existing tokens (`src/index.css`): primary hsl(200 85% 55%) ≈ #29a3e3. Prototype hexes map onto them: action/link #178fc9, ink #23272e, dark surface #171c26, bg #f4f6f8, borders #e8ecef/#eef1f4, muted #67707e/#8a94a3, tints #f2f9fd/#cfe6f4, semantic green #0ea371, amber #d97706/#f5b84b, red #dc2626. No new palette. Fonts: Plus Jakarta Sans + JetBrains Mono only.
2. **Tone rule.** Recommendations are framed as the research's read, never as instructions ("the research suggests", "one possible order", "a suggested shape, not a prescription"). Strategy decisions are explicitly deferred to the advisory/strategy session, which every report ends on.
3. **Two-tier section pattern.** Every match section = "our read" (ranked top-3 with why-lines) + full match grid below. Nothing the matcher surfaced is dropped.
4. **Links.** Every surfaced entity links to its platform profile page, new tab (`target="_blank" rel="noopener"`). No dead names.
5. **State persistence.** Shortlist stars, scan/brief/lead requests: persist to Supabase keyed by report ID (table: `report_interactions`, one row per event: report_id, type, payload, created_at). Requests also notify the ops channel used for intake today. ⚠ OWNER TO CONFIRM table name + notification channel before Phase A ends.
6. **Identity assets.** 34px circle (people) / 28px square r7 (companies), monogram fallback, platform assets + logo.dev for customer cover mark. Never let images drive layout. PDF: preload with 3s timeout → monogram.
7. **Evidence chips.** Three confidence states (● sourced / ◐ EST / ○ inferred); ◐ numbers must show the EST pill at full size next to the number — headline numbers may not render unchipped. Sources band groups by tier (regulator / analyst / vendor).
8. **Degradation, not apology.** Missing data renders as a gap card with a request hook. Intake-form apology strings never appear in report body copy.
9. **Section numbering + labels.** Mono caps section labels (`05 · SERVICE PROVIDERS`); no lumping — providers, government/trade, and hubs/accelerators are separate sections (05/06), mirroring the database modules.
10. **PDF/print parity.** The web report is canonical; PDF renders the same components (interactive hooks become static "contact us" lines). No separate PDF layout system.
11. **Feature flag.** New renderer ships behind a flag; old renderer untouched until parity is signed off per section.
12. **URL resolution lives in the adapter.** Contract URLs are platform-relative paths; only the adapter maps them to real routes. Components never construct URLs.
13. **Acceptance harness.** Dev-only `/dev/report-preview?fixture=floats|nory` renders fixtures through the Report type; every ticket is accepted there before PR merge. It never ships to production.
