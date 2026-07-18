# Handoff: MES Report Redesign

## Overview
Redesign of the Market Entry Secrets customer report — the core deliverable of marketentrysecrets.com (repo: `steviem101/market-entry-secrets`). The redesign keeps the current report's comprehensive, explore-everything character (the report is a funnel: wide view + light insight, strategy decided later in the advisory session) while adding a decision layer, evidence discipline, funnel hooks, and MES-branded visual craft.

**Canonical-source rule (read first):** the type definitions (`contracts/report.ts`), the contract rules (`contracts/contracts.md`), and the **ticket list** (`tickets/TICKETS.md`) are the spec. Start with `START_HERE.md` — it contains the exact kickoff prompt for Claude Code. The HTML prototypes in `reference/` are **visual reference only** — recreate them as React components in the existing codebase (React 18 + Tailwind + shadcn, existing conventions), never copy their markup. Where README and prototype disagree, README wins; where README and DECISIONS.md disagree, DECISIONS.md wins.

## About the Design Files
The `reference/*.dc.html` files are design prototypes created in HTML. They open in a browser and show intended look and behavior for two archetypes:
- `Floats Report v2.dc.html` — domestic scale-up archetype (AU company, seed raise focus; no foreign-corridor modules; empty lead-list directory → request hook).
- `Nory Report v2.dc.html` — inbound foreign entrant archetype (Irish SaaS → Sydney; corridor modules active; matched lead dataset present; identity-asset slots demonstrated).
- `fixtures/lemlist.json` (no prototype — fixture only) — the stress case: French corridor (origin-parameterised), **zero briefed accounts** (ICP-guidance card + request hook), grouped action-plan phases, events "maximise" tips, empty leads directory, and the R11 relevance-gate example (the matcher surfaced an entertainer as a competitor).

## Fidelity
**High-fidelity.** Colors, type, spacing, and interaction states are final intent. Recreate pixel-perfectly using the codebase's Tailwind tokens and shadcn primitives.

## Implementation phasing (minimises triage)
- **Phase A — renderer only.** Build components against the fixture JSON (`fixtures/`). An adapter maps the pipeline's current output → the contracts. Do not modify the generation pipeline.
- **Phase B — pipeline upgrades.** One field at a time: claims registry, source tiers, archetype field, ranked-with-reason match output. Each lands behind the adapter.
- Ship behind a feature flag; render old and new side by side on the same report ID during dev. New sections can ship individually.
- Every ticket's done-check: renders **both** fixtures correctly, including degradation states.

## Page anatomy (sections, in order)
1. **Cover** — dark ink surface (#171c26), customer logo (logo.dev) + name + intake descriptor, one-line thesis headline (42/800), report scope paragraph, evidence-legend strip (source count, ●/◐/○ key), customer's verbatim key question.
2. **01 Executive summary** — 2-col: narrative (16px/1.75 body, bold key facts, inline evidence chips) + right rail (dark stat card with the single most material number; 12-month/entry-sequence shape card with "suggested shape, not a prescription" caveat). Below: "Your key question — answered" callout (sky tint #f2f9fd, border #cfe6f4) with linked highlight matches.
3. **02 Market metrics & SWOT** — 3×2 metric tile grid (32/800 sky number + chip + 12px caption); SWOT quad with 3px left accents (green/amber/sky/red).
4. **03 Competitor landscape** — ruled table: customer row first, sky-tinted, "WHERE {CUSTOMER} DIFFERS" verdict column; gaps + positioning-read callout below; **competitor-scan request hook** (dashed border card + button → inline confirmation).
5. **04 First customers** — account cards: name+logo, status chips (HIRING NOW / TECH ID'D), Signals/Stack/Fit body, APPROACH/ANGLE mono footer; **gap card** for unbriefed accounts (dashed, one-click request); "worth knowing" buyer-behavior callout.
6. **05 Service providers** — two-tier pattern: "our read" ranked top-3 (numbered ruled rows: rank, name+meta, why-line, role tag) + full match card grid below ("ALL MATCHED — EXPLORE FREELY").
7. **06 Government & accelerators** — 2-col split: free-to-engage bodies (ruled rows) vs competitive programs (bordered rows with focus tags). Corridor bodies (Enterprise Ireland, IACC) only for foreign-entrant archetype.
8. **07 Mentors** — headshot cards (3 primary + compact extras), role in mono caps, why-line referencing the customer's product surfaces.
9. **08 Investors** — "our read" numbered approach order (framed as *one possible* order) + full match card grid with stage tags and check sizes.
10. **09 Events** — date-led cards (amber mono date), why-this-room body; "also flagged" line.
11. **10 Action plan** — 3 phase columns (top border accent, first phase sky), dense linked body; every named resource links to its profile.
12. **11 Setup & compliance** — exposure/requirement table (severity-colored top borders), left-rail key cost stats (26/800 + chip), readiness checklist 2-col ruled grid.
13. **12 Case studies & guides** — guide cards with "Relevant because:" footer tying each to this report's content. Non-negotiable section.
14. **13 Lead list** — matched dataset card (record count chip) OR honest-gap card, + **custom lead-list request**: textarea (ICP placeholder) + Send request → inline confirmation.
15. **14 Advisory/strategy session close** — "This report is the map. The route gets chosen together." + "worth arriving with a view on" list (3–4 open decisions) + **shortlist strip** (starred chips collect here; empty state explains the ☆ mechanic).
16. **Sources** — dark band, sources grouped by tier: ● regulator/statute · ● analyst/institutional · ● vendor/press/end-buyer.

## Interactions & behavior
- **Shortlist (☆):** every matched entity card header has a star toggle (☆ #c9d2da → ★ #f5b84b). Starred set renders as pill chips in §14 and pre-frames the advisory session. Persist per report (see DECISIONS.md).
- **Request hooks:** competitor scan (button), account brief (button), custom lead list (textarea+button). All confirm inline (green tint #e9f7f1, border #b9e4d2, text #0b7a55). Submissions persist (see DECISIONS.md).
- **Profile links:** every surfaced entity (provider, hub, mentor, investor, event, account, competitor, org, dataset, guide) links to its platform database page, `target="_blank" rel="noopener"`, with a ↗ affordance on card titles.
- **Hovers:** buttons darken (#29a3e3 → #178fc9); links underline; cards static (no lift/shadow animation).
- **No strategy lock-in tone:** recommendation copy is framed as "the research suggests / one possible order / a suggested shape" — decisions deferred to the advisory session. This is a copy rule, not just design.

## Identity assets (logos & headshots)
- Fixed slots only: **34px circle** for people headshots (mentors + angel investors), **28px rounded square (7px radius, 1px #e8ecef border)** for company logos (accounts, competitors, providers, VC firms, hubs). Image never drives layout.
- **Monogram fallback** always available: initials on #e3f2fb/#178fc9 (people) or #eef4f8/#67707e (companies). Customer's own mark: solid #29a3e3, white initial.
- Sources: platform profile assets for database entities; logo.dev for the customer's own cover mark. Web lazy-loads; PDF preloads with timeout then monogram fallback.

## Degradation rules (content-driven)
- n=1 competitors → single row + scan-request hook, never an empty table.
- Account on intake but unbriefed (no domain) → gap card with request button, never apology prose in the body.
- No matching lead dataset → honest-gap card + custom-build request (Floats fixture shows this; Nory shows the dataset-present state).
- Missing image asset → monogram, never broken image or layout shift.
- Archetype drives which sections/modules render (corridor modules, visa/tax tables) — see `contracts/archetype.md`.

## Design tokens
See DECISIONS.md for the pinned brand tokens. Summary: MES sky #29a3e3 (link/action #178fc9), ink #23272e, dark surface #171c26, page bg #f4f6f8, card border #e8ecef, muted #67707e / #8a94a3, sky tint #f2f9fd / #cfe6f4, green #0ea371, amber #d97706 / #f5b84b, red #dc2626. Type: Plus Jakarta Sans (400–800) + JetBrains Mono (500/700) for labels/data. Radii: 14px section cards, 12px inner cards, 8px buttons. Section label: mono 11px, 0.14em tracking, sky. Evidence chips: ● sourced (green) / ◐ EST (amber, tinted pill) / ○ inferred (grey), 8.5px mono.

## Files
- `reference/Floats Report v2.dc.html` — domestic archetype prototype
- `reference/Nory Report v2.dc.html` — foreign-entrant archetype prototype (identity assets demo)
- `reference/MES Report Design Review.dc.html` — full design review: audits of 3 current reports, converged direction, Market Entry Map spec, component spec, linter rules, 100-pt rubric, build tickets
- `MASTER_PROMPT.md` — **paste this into Claude Code to run the whole build step-by-step** (it drives, prompts you at every gate)
- `START_HERE.md` — shorter kickoff prompt + notes (alternative to MASTER_PROMPT for experienced operators)
- `contracts/report.ts` — canonical TypeScript types (copy into the repo as-is)
- `contracts/contracts.md` — paragraph grammar, URL resolution, linter rules R1–R10, archetype→module map
- `fixtures/floats.json`, `fixtures/nory.json`, `fixtures/lemlist.json` — fixture data for three coverage cases (validate against report.ts)
- `tickets/TICKETS.md` — ordered build tickets with done-checks (plus ticket 0, the /dev/report-preview harness in START_HERE.md)
- `tokens.md` — prototype hex → Tailwind token mapping
- `MOBILE_AND_PDF.md` — responsive + print spec (acceptance criteria for tickets 15–16)
- `DECISIONS.md` — pinned decisions Claude Code must not re-make
- `PARITY.md` — per-section × per-fixture sign-off checklist; gates flag-on

**Out of scope for this package:** the Market Entry Map signature visual and the design-rubric scorer — deliberately excluded so tickets 1–16 stay small; they follow as a separate handoff once the report redesign has shipped.
