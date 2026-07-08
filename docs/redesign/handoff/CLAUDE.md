# CLAUDE.md — repo conventions for Claude Code

> **SUPERSEDED (MES-115, 2026-07-07): historical handoff artefact — do NOT copy this file to the
> repo root.** The maintained root `CLAUDE.md` already exists and covers current repo context;
> intake v2 has since shipped as the default `/report-creator` flow. Kept for the redesign-specific
> guardrails below.

> ~~Drop this at the **root** of `steviem101/market-entry-secrets`.~~ Claude Code loads the root
> file automatically every session, so those conventions are always in context.

## Active project: Intake v2 redesign (`/report-creator`)

The approved design + phased build plan for redesigning the Market Entry Report intake flow lives in
**`docs/redesign/handoff/`**. **Start at `docs/redesign/handoff/START_HERE.md`** — it has the read
order, a 6-phase PR plan, and acceptance criteria. The target schema + migration are on **PR #197**
(`docs/redesign/intakeSchema.v2.draft.ts`, `intake_redesign_v2.draft.sql`).

### Guardrails (apply to all intake-redesign work)
- **Recreate the design in this codebase** — the `handoff/reference_src/*.jsx` files are an HTML/Babel
  **prototype** (reference only). Rebuild with the real stack: **Vite + React 18 + TS + Tailwind +
  shadcn/ui + react-hook-form + zod + Supabase**. Read them for exact markup/logic; never import them.
- **Never port the prototype's dev tooling:** the dark top **control bar** (viewport / persona / screen
  jumper / Reset) and the **Tweaks panel** (accent / typeface / card style / density / persona A/B) are
  design-review scaffolding, not product features.
- **Reuse existing modules:** `react-hook-form` + `zodResolver`, shadcn primitives (`Select`, `Input`,
  `Card`, `Button`, `Badge`, `Dialog`, `Command`), `lucide-react`, `AuthDialog`, `useReportGeneration`,
  `linkedinTaxonomy.ts`. Map prototype hex/px to `tailwind.config.ts` / `src/index.css` tokens — don't
  hard-code the palette.
- **Australian English** in all copy (organise, personalise, analyse, licence, prioritise).
- **390px-first** — 61% of users are non-AU / mobile.
- **Accessibility is required:** single-select chip groups `role="radiogroup"` (children `role="radio"`,
  arrow-key nav); multi-select `role="group"` (`role="checkbox"`); goal cards `role="checkbox"
  aria-checked`; ≥44px hit targets; visible focus rings.
- **Protect the pipeline.** `supabase/functions/generate-report` consumes a flat legacy shape via
  `mapV2ToLegacyIntake()`. It has a real bug (handoff Phase 1 / ENGINEERING_TODO P0.1): the shim writes
  *short* goal labels but `GOAL_SERVICE_TAGS` is keyed by the *old long* labels → matching silently
  breaks. Fix it (re-key by `goal_id`), and after any schema change verify a seeded v2 intake still
  returns non-empty provider/mentor/lead matches.

### Working agreement
- Build **one phase at a time** (sequential PRs in `START_HERE.md`); land **Phase 1 first or alongside
  Phase 2**. Self-check each phase's **Acceptance** criteria before opening the next PR.
- Do **not** build the deferred Tier 3 items (skip-to-review, save-and-resume email, softened validation
  gates) unless explicitly asked.
