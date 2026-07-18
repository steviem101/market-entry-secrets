# Content contracts

**Canonical type definitions live in `report.ts`** (copy it into the repo as `src/types/report.ts`). The generation pipeline — or the Phase-A adapter — must emit JSON matching the `Report` type. The renderer consumes ONLY that shape; no free-form HTML from the pipeline. This file adds the rules that sit on top of the types.

## Paragraph grammar (markdown-lite)
Exactly three constructs: `**bold**`, `[text](/path)` entity links, `{chip:sourced|est|inferred}` inline chips. Nothing else — no headings, lists, or raw HTML. Escape everything else. One shared `<Rich>` renderer component (part of ticket 2).

## Source tiers from raw domains
The current pipeline emits sources as bare domains (mordorintelligence.com, linkedin.com…). The adapter owns a domain→tier lookup (regulator/gov domains → tier 1, research houses → tier 2, everything else → tier 3/vendor) with unknown domains defaulting to vendor. Domains never render raw in the sources band — they group under tier headings.

## URL resolution
All `url`/link paths are platform-relative (`/investors/aura-ventures`). The adapter (ticket 4) owns the mapping to real routes — components never build URLs themselves. `logoUrl`/`headshotUrl` values of the form `platform:<slug>` resolve from profile assets; absent → monogram fallback.

## Linter rules (pipeline output must pass before render)
R1 labels: no `[-_]` compound keys; title-case ≤48ch. R2 keyQuestion renders as component, never quoted twice. R3 one fact = one value; conflicting figures → range or omit. R4 ≤6 metric tiles, consistent geography+scope. R5 no intake/apology strings in body (gap structures only). R6 angle/why-fit must reference the customer's stated product terms. R7 every section intro states why-for-you in ≤140ch. R8 ourRead is ranked (1–3), never unordered. R9 headline numbers carry a chip. R10 sparse: n=1 → row, n=0 → gap structure, never empty scaffolding. R11 relevance gate: every matched entity must pass a domain-relevance check against the customer's sector — a non-commercial or out-of-sector match (real case: the singer "Clay Aiken" surfaced as a sales-tech competitor) is dropped by the adapter and logged, never rendered. R12 unknown fields are omitted, never printed as "Not specified" / "N/A".

## Archetype → module map
- `domestic_scaleup` (Floats): no corridor bodies; compliance table = regulatory exposures + investor-readiness checklist; close = advisory session.
- `foreign_entrant` (Nory = Ireland, lemlist = France): corridor bodies are **origin-parameterised** via `meta.origin` (Enterprise Ireland + Irish Australian Chamber vs Business France + AiGroup), compliance = entity setup / resident director / tax treaty (per origin) / visas / banking; enterprise-readiness checklist.
- `startup_launch` (CreditLogic-class): incubation-weighted hubs, founder-stage investors, compliance = licensing/regulatory pathway.
