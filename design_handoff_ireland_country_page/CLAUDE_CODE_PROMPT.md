# Claude Code Prompt — MES Ireland Country Page (`market-entry-secrets`)

Place this entire `design_handoff_ireland_country_page/` folder at the **root** of your `steviem101/market-entry-secrets` checkout, then open Claude Code and paste the prompt below.

---

## The prompt

> You are implementing the **MES Ireland Country Page** redesign in this codebase. The design spec, copy, tokens, and data live in `./design_handoff_ireland_country_page/`.
>
> ## Step 0 — Read before writing any code
>
> 1. Read `design_handoff_ireland_country_page/README.md` end to end.
> 2. Read `CLAUDE.md` at the repo root — pay attention to the build & type safety rules, the database schema, RLS conventions, and the "no hardcoded colors, HSL only" styling rule.
> 3. Open `design_handoff_ireland_country_page/Ireland Country Page.html` in a browser to see the intended visual result.
> 4. Read the existing files you'll be replacing or extending:
>    - `src/pages/CountryPage.tsx`
>    - `src/components/countries/CountryHero.tsx`
>    - `src/components/countries/CountryContent.tsx`
>    - `src/hooks/useCountries.ts`
>    - `src/components/common/SEOHead.tsx`
>    - `src/components/common/EntityBreadcrumb.tsx`
>    - `src/components/FreemiumGate.tsx`
> 5. Read one existing directory-page implementation end to end as a pattern reference: `src/pages/SectorPage.tsx` and its `useSector*` hooks. The country page will follow the same hook-per-domain pattern.
> 6. Read `src/index.css` and `tailwind.config.ts` to see how design tokens are wired.
>
> ## Step 1 — Plan
>
> Produce a written plan covering:
>
> - Token additions to `src/index.css` and `tailwind.config.ts`
> - Supabase migration file (one file, in `supabase/migrations/`) with the 6 new tables defined in the README, plus RLS policies that match the existing public-SELECT pattern
> - The new component file structure under `src/components/countries/`
> - The new hooks under `src/hooks/`
> - The Ireland seed data (copy verbatim from `design_handoff_ireland_country_page/src/core.jsx`)
> - Which existing components (`EventCard`, `PersonCard`, etc.) can be reused vs which need new variants
> - How `<SEOHead>` needs to be extended to accept an array of JSON-LD blocks
>
> **Stop and surface the plan for review before writing any code.** Wait for approval.
>
> ## Step 2 — Implement (in this order)
>
> 1. **Migration + types.** Write the SQL migration, run it locally against the Supabase project (`xhziwveaiuhzdoutpgrh`), then regenerate `src/integrations/supabase/types.ts`. Until the regen lands, cast `(supabase as any).from('country_page_content')` etc., as per the existing pattern for `user_intake_forms`.
> 2. **Seed data.** Write a TypeScript seed script in `scripts/` that inserts the Ireland row across all 6 new tables. Source values verbatim from `design_handoff_ireland_country_page/src/core.jsx` (the constants `HERO`, `TRADE_METRICS`, `NARRATIVE_BULLETS`, `DIFFERENTIATORS`, `CASE_STUDIES`, `AGENCIES`, `MENTORS`, `SERVICES`, `INVESTORS`, `PLAYBOOK`, `FUNDING_IE`, `FUNDING_AU`, `EVENTS`, `CITIES`, `FAQS`).
> 3. **Tokens.** Add the 8 `--mes-*` CSS variables (HSL only) to `src/index.css`, plus the colour aliases in `tailwind.config.ts`. Do not touch the existing `--primary` token.
> 4. **Hooks.** Create the 9 `useCountry*` hooks listed in the README, following `useSectorServiceProviders` for filtering patterns and React Query for caching.
> 5. **SEO helper.** Extend `<SEOHead>` to accept `jsonLd: JsonLdBlock | JsonLdBlock[]` and emit one `<script type="application/ld+json">` per entry. Then build `CountryStructuredData.tsx` that assembles `BreadcrumbList`, `FAQPage`, `HowTo`, `Event[]`, `Place[]`, and `Organization` blocks from the data.
> 6. **Components.** Build the 11 section components plus the sticky bar. Use shadcn `Tabs`, `Accordion`, `Card`, `Badge`, `Button`, `Input`. Use `embla-carousel-react` for the case study carousel. Use `lucide-react` for icons. No hex colours in JSX — every colour must reference a token.
> 7. **Rewrite `CountryPage.tsx`** to compose the new sections. Keep `<SEOHead>`, `<EntityBreadcrumb>`, `<FreemiumGate>`, `<PageSkeleton>` wrappers. Delete the now-orphaned `CountryContent.tsx`.
> 8. **Sticky bar.** Mount `<CountryStickyBar>` at page root, position `fixed top-16` (under existing `<Navigation>`), fade in at scroll > 600px, hide below `md`.
>
> ## Step 3 — Quality gates
>
> Before opening a PR:
>
> 1. **Lint:** `npm run lint` clean.
> 2. **Typecheck:** `tsc --noEmit` clean (or whatever the existing typecheck command is).
> 3. **Em-dash grep:** `grep -R "—" src/components/countries src/lib/countryPageContent.ts` returns nothing. The MES editorial rule is no em-dashes anywhere. Use hyphens or rewrite.
> 4. **Hardcoded-colour grep:** `grep -RE "#[0-9a-fA-F]{3,6}" src/components/countries` returns nothing except in SVG flag definitions (those are intentional brand assets).
> 5. **Responsive smoke test:** Hit the page at 375 / 768 / 1280px. Sticky bar hides at 375. Stepper rail hides at 375.
> 6. **JSON-LD validation:** Paste the rendered HTML into Google's Rich Results Test. `FAQPage` and `HowTo` should both validate.
> 7. **Tier gating:** Confirm `<FreemiumGate>` still works for unauthenticated users.
> 8. **Lighthouse:** Run on `/countries/ireland`. Aim for >85 on every category. LCP under 2.5s.
>
> ## Step 4 — Summarise
>
> When done, post a summary covering:
>
> - Files added / modified / deleted
> - Migration filename and what it changed
> - Any deviations from the spec (and your reasoning)
> - Anything stubbed (e.g. PDF endpoint, real logo assets) with a TODO
> - Lighthouse + Rich Results Test outputs
> - Suggested follow-ups (sparkline upgrades, prerender step, UK/US/SG country variants)
>
> ## Constraints
>
> - **Don't** copy the HTML/Babel scaffold from the prototype.
> - **Don't** introduce new colour systems or parallel design tokens.
> - **Don't** edit `src/integrations/supabase/types.ts` by hand.
> - **Don't** use `VITE_*` env vars — Lovable doesn't support them.
> - **Don't** invent UI for things the spec doesn't cover. Ask.
> - **Do** reuse existing primitives wherever they exist.
> - **Do** keep every copy string verbatim from the prototype's `src/core.jsx`.

---

## Tips for running this

1. **Run Step 0 + 1 first as one Claude Code session, review the plan, then run Step 2+ in a second session.** Otherwise it'll generate the whole thing before you can correct course.
2. **The em-dash rule is real.** Claude routinely reintroduces them. Grep at every commit boundary.
3. **The `useSectorServiceProviders` pattern is gold.** Use it as the literal template for every new `useCountry*` hook.
4. **Lovable will auto-commit changes back to this repo.** If you're running Claude Code locally, push the branch first so Lovable doesn't conflict with you.
5. **Seed data live in `src/core.jsx`** of the prototype — that file is the source of truth for every string and number on the Ireland page.
