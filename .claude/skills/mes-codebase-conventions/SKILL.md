---
name: mes-codebase-conventions
description: MES repo map and verified stack conventions (React 18 + Vite + TS, Tailwind/shadcn, React Query, Supabase, Lovable). Read FIRST before any MES platform work — code, review, or planning.
---

Last verified: 2026-07-07

# MES Codebase Conventions

## Purpose
Give any model the verified, current conventions of `steviem101/market-entry-secrets` so it writes
code that matches the repo — and so it knows where the root `CLAUDE.md` has drifted from reality.

## When to trigger / when NOT to
- **Trigger:** any task touching this repo — always read this skill first.
- **Don't trigger:** pure Notion/research tasks with no repo interaction.

## Preconditions — inspect before assuming
- `src/App.tsx` (all routing), `src/integrations/supabase/client.ts`, `package.json` scripts.
- The DB has ~80 live tables; `CLAUDE.md` §4 is a curated subset. Introspect before using a table.

## Playbook
1. **Routing:** all routes live in `src/App.tsx`. `Index`/`NotFound` eager, everything else
   `React.lazy` + `Suspense` (`App.tsx:18-64,96`). Legacy aliases use
   `<Navigate to="..." replace />` (`/community`→`/mentors` L104, `/trade-investment-agencies`→
   `/government-support` L125, `/planner`→`/report-creator` L138). `<Layout>` is mounted **once
   globally** (`App.tsx:95`) — never wrap a page in `<Layout>` again.
2. **Data fetching:** React Query with kebab-case string keys + params, e.g.
   `['events', debouncedSearchQuery]` (`src/hooks/useEvents.ts:73`),
   `['user-subscription', user?.id]` (`src/hooks/useSubscription.ts:60`). Global defaults:
   `staleTime: 5min`, `refetchOnWindowFocus: false` (`App.tsx:72-79`). Debounce search with
   `useDebounce(query, 300)`. Tables missing from generated types use the `(supabase as any)`
   cast (10× in `src/lib/api/reportApi.ts`; also `src/hooks/useAIChat.ts:54`). Never hand-edit
   `src/integrations/supabase/types.ts`.
3. **Directory pages:** Hero → `DirectoryFilterBar` → results grid + `ListPagination`, gated by
   `ListingPageGate` (`src/pages/Events.tsx:173-249` is the reference implementation).
   `DirectoryFilterBar` (`src/components/common/DirectoryFilterBar.tsx:1-13`) is presentational
   only; filter state is URL-synced via `useDirectoryFilters(FILTER_SPEC)`; pure filter logic goes
   in a tested `src/lib/*Filters.ts` module.
4. **SEO:** `react-helmet-async` per page — title, meta description, canonical, JSON-LD
   (`src/pages/Events.tsx:151-171`) or the `SEOHead` wrapper (`src/components/common/SEOHead.tsx`).
5. **Styling:** HSL semantic tokens only — shadcn set plus `--mes-*` brand and `--rc-*` report
   tokens (`src/index.css:9-75`, mapped in `tailwind.config.ts:22-87`). `--rc-*` are aliases of
   parent tokens; never redefine them bespoke. Exception that is deliberate, not licence:
   `reportSectionConfig.ts:22-86` uses raw palette classes as its per-section accent system.
6. **Language:** Australian English in UI copy — "personalised" (`src/pages/ReportCreator.tsx:125`),
   "Organisation" (`AgencyDetailPage.tsx:26`). Match it in new copy.
7. **Edge functions:** Deno + `esm.sh` imports; see `edge-functions-and-cost-controls`.
8. **Verify:** `npm test` (Node's built-in runner over `src/**/*.test.ts` +
   `supabase/functions/**/*.test.ts`, `package.json:10-12`; 242 tests) must pass, and
   `npx tsc -p tsconfig.app.json --noEmit` + `npm run build` must be clean. **Know that
   `npm run lint` currently exits non-zero with ~437 pre-existing `no-explicit-any` errors**
   (MES-111 AUD-051) — the bar is *no new lint errors*, checked by linting only your changed
   files. No vitest/jest, no DOM tests — put testable logic in pure modules
   (e.g. `src/lib/eventFilters.ts`).

## Red flags / approval gates
- Introducing `VITE_*` env vars or `import.meta.env` reads — Lovable doesn't support them; the repo
  works around this deliberately (`src/lib/featureFlags.ts:4`, `src/lib/publishedOrigin.ts:8`).
  The root `.env` with `VITE_SUPABASE_*` is dead scaffold config — do not consume or extend it.
- Editing `src/integrations/supabase/client.ts` or `types.ts` (both generated).
- Anything touching RLS, migrations, payments, secrets, or bulk data → see the owning skill; these
  are approval-gated per the MES Ticket Writing Context.

## Good / bad examples
- ✅ New directory page: copy `src/pages/Events.tsx` structure; filter spec + `useDirectoryFilters`;
  pure logic in `src/lib/<x>Filters.ts` with a `.test.ts`.
- ❌ `const url = import.meta.env.VITE_API_URL` — banned pattern; use full URLs or edge secrets.
- ❌ `<div className="text-gray-500">` — use `text-muted-foreground`.
- ❌ Wrapping a page in `<Layout>` — it's already global.

## Self-check rubric (pass/fail)
- [ ] No `VITE_*`/`import.meta.env`; no hardcoded palette colors (outside the documented exception).
- [ ] Query keys kebab-case; `(supabase as any)` used only for tables absent from generated types.
- [ ] New page: lazy route in `App.tsx`, Helmet SEO, no double `<Layout>`.
- [ ] `npm test` + typecheck pass; no NEW lint errors; new pure logic has a `.test.ts`.
- [ ] UI copy is Australian English.

## Evidence
Inspected 2026-07-07: `src/App.tsx`, `src/integrations/supabase/client.ts:5-35`,
`src/hooks/useEvents.ts`, `src/hooks/useSubscription.ts`, `src/lib/api/reportApi.ts`,
`src/index.css`, `tailwind.config.ts`, `src/components/common/DirectoryFilterBar.tsx`,
`src/components/Layout.tsx`, `src/pages/Events.tsx`, `package.json`, `eslint.config.js`,
`vite.config.ts` (lovable-tagger + `@lovable.dev/mcp-js`), root `.env` (dead `VITE_SUPABASE_*`).

## Common MES pitfalls (real)
1. **Trusting `CLAUDE.md` verbatim.** Verified drift: sections generate in one parallel batch not
   "batches of 3"; `apify-webhook`/`notion-research-trigger` don't exist (confirmed again by
   MES-111 AUD-048); route map incomplete (`/market-entry-questions`, `/reset-password`,
   `/admin/mentors`). Verify before encoding.
2. **The dead `.env`.** Root `.env` contains `VITE_SUPABASE_*` vars nothing consumes
   (`docs/audits/AUDIT-REPORT-2-MEDIUM-LOW-ARCHITECTURE.md:159-162`). Don't "fix" code to read it.
3. **Supabase default 1000-row limit** read as "missing data" bugs (`CLAUDE.md` gotcha #6 — this
   one is true); `useEvents` explicitly `.limit(500)`.
4. **Assuming a component test framework exists.** There is none; DOM-heavy tests can't be added
   without new tooling — extract logic to pure modules instead.
