# Handoff: Ireland Country Page — `market-entry-secrets` codebase

> Tailored for `steviem101/market-entry-secrets` (Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Supabase via Lovable Cloud).

## What this is

A redesign of `/countries/:countrySlug` (currently `src/pages/CountryPage.tsx`). The Ireland page becomes the **flagship template** for every country corridor page. Same component, different data.

The prototype in this bundle (HTML/React-via-Babel) is a **design reference, not production code**. The task is to recreate it in your existing app using the patterns already in `CountryPage.tsx`, `LocationPage.tsx`, and `SectorPage.tsx`.

## Fidelity

**High-fidelity.** Colours, type scale, copy, and interactions are final.

---

## Codebase orientation (what to reuse, what to add)

| Concern | Reuse | Build new |
|---|---|---|
| Page shell | `<Layout>`, `<SEOHead>`, `<EntityBreadcrumb>`, `<FreemiumGate>`, `<PageSkeleton>` | — |
| Data fetching | `useCountryBySlug` (extend) | `useCountryPlaybook`, `useCountryCaseStudies`, `useCountryAgencies`, etc. — follow the `useSector*` per-domain pattern |
| Routing | Existing `/countries/:countrySlug` route in `App.tsx` | — |
| Tokens | `src/index.css` HSL CSS variables + `tailwind.config.ts` | Add 3 MES-specific token aliases (see below) |
| Primitives | shadcn/ui `Tabs`, `Accordion`, `Card`, `Badge`, `Button`, `Input` | TabBar variant (numbered + active border), stepper rail |
| Carousel | `embla-carousel-react` (already installed) | Hook it up for case studies |
| Icons | `lucide-react` | — |
| SEO | `<SEOHead>` already supports `jsonLd` | Pass `FAQPage` + `HowTo` + `BreadcrumbList` + `Event` arrays |
| Toasts | `sonner` | — |

**Folder convention:** components live in `src/components/countries/`. The existing `CountryHero` and `CountryContent` should be **replaced** with the new section components below (or rewritten in place, your call).

---

## File plan

Create / replace:

```
src/pages/CountryPage.tsx                              ← rewrite, compose new sections
src/components/countries/
  CountryHero.tsx                                      ← replace
  CountryTradeSnapshot.tsx                             ← new
  CountryWhyItWorks.tsx                                ← new (narrative + differentiators)
  CountryCaseStudies.tsx                               ← new (Embla carousel)
  CountryEcosystemTabs.tsx                             ← new (4 tabs)
    parts/AgencyCard.tsx
    parts/MentorCard.tsx
    parts/ServiceCard.tsx
    parts/InvestorCard.tsx
  CountryPlaybook.tsx                                  ← new (6-stage accordion + stepper)
  CountryFundingPathways.tsx                           ← new
  CountryEvents.tsx                                    ← new (reuse EventCard if shape matches)
  CountryCities.tsx                                    ← new
  CountryFAQ.tsx                                       ← new
  CountryLeadCapture.tsx                               ← new (3 tiers)
  CountryStickyBar.tsx                                 ← new (sticky scroll bar)
  CountryStructuredData.tsx                            ← new (JSON-LD assembler)
src/hooks/
  useCountryPlaybook.ts                                ← new
  useCountryCaseStudies.ts                             ← new
  useCountryAgencies.ts                                ← new
  useCountryMentors.ts                                 ← new
  useCountryServiceProviders.ts                        ← new (or reuse existing if filtered)
  useCountryInvestors.ts                               ← new
  useCountryEvents.ts                                  ← new (or reuse useSectorEvents pattern)
  useCountryCities.ts                                  ← new
  useCountryFAQ.ts                                     ← new
src/lib/countryPageContent.ts                          ← typed copy strings (per-country narrative, FAQ, etc.)
```

`CountryContent.tsx` can be deleted or kept as a thin alias.

---

## Design tokens — add to `src/index.css`

Drop these into the `:root` block alongside the existing tokens. All HSL per house rules.

```css
/* MES brand */
--mes-teal: 192 53% 36%;          /* #2B7A8C */
--mes-teal-dark: 192 54% 27%;     /* #1F5C6B */
--mes-blue-light: 192 65% 83%;    /* #B8E4F0 */
--mes-ink: 240 28% 14%;           /* #1A1A2E */
--mes-ink-soft: 240 12% 33%;      /* #4A4A5E */
--mes-ink-muted: 240 10% 58%;     /* #8A8A9E */
--mes-success: 159 79% 39%;       /* #10B981 */
--mes-warning: 38 92% 50%;        /* #F59E0B */
```

The site's existing `--primary` (`200 85% 55%`) is close to but brighter than `--mes-teal`. For the Ireland page **use `--mes-teal` for primary actions** to match the design; leave `--primary` alone (other pages depend on it). Add convenience aliases in `tailwind.config.ts`:

```ts
colors: {
  // ...existing
  'mes-teal':       'hsl(var(--mes-teal))',
  'mes-teal-dark':  'hsl(var(--mes-teal-dark))',
  'mes-blue-light': 'hsl(var(--mes-blue-light))',
  'mes-ink':        'hsl(var(--mes-ink))',
  'mes-ink-soft':   'hsl(var(--mes-ink-soft))',
  'mes-ink-muted':  'hsl(var(--mes-ink-muted))',
}
```

**Type:** Inter is loaded everywhere already. Add JetBrains Mono for the monospace eyebrows/captions — `<link>` in `index.html` or via `font-mono` Tailwind utility if already configured.

**Numerics:** every stat tile must use `font-variant-numeric: tabular-nums` (utility: `tabular-nums`).

---

## Supabase schema additions

The existing `countries` table has: `name, slug, key_industries[], keywords[], (...) _keywords[]`. To support the new sections, add the following tables. Do NOT hand-edit `src/integrations/supabase/types.ts` — run the migration, then regen types.

```sql
-- Per-country editorial copy
create table country_page_content (
  country_id uuid primary key references countries(id) on delete cascade,
  hero_headline text not null,
  hero_subhead text not null,
  hero_trust_companies text[] default '{}',
  hero_trust_extra int default 0,
  narrative_bullets jsonb not null,           -- [{h, b}]
  differentiators jsonb not null,             -- [{h, b}]
  pull_quote text,
  pull_quote_attr text,
  updated_at timestamptz default now()
);

-- Trade snapshot tiles
create table country_trade_metrics (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  sort_order int not null,
  value text not null,                        -- "$US 560B"
  label text not null,
  source text not null,
  source_url text,
  delta text,
  positive boolean default true
);

-- Case studies (link to existing case_studies if useful)
create table country_case_studies (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  sort_order int not null,
  company_name text not null,
  sector text not null,
  outcome text not null,
  logo_color text,                            -- hex for wordmark tile
  wordmark text,                              -- 2-letter
  case_study_id uuid references case_studies(id)   -- nullable join
);

-- 6-stage playbook
create table country_playbook_stages (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  stage_number int not null,                  -- 1-6
  title text not null,
  time_range text not null,
  summary text not null,
  sub_steps text[] not null
);

-- Funding instruments (origin + destination)
create table country_funding_instruments (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  side text check (side in ('origin','destination')) not null,
  sort_order int not null,
  title text not null,
  body text not null,
  tag text not null                           -- Grant / Equity / Debt / Tax credit / Angel
);

-- FAQs (long-tail SEO)
create table country_faqs (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references countries(id) on delete cascade,
  sort_order int not null,
  question text not null,
  answer text not null
);
```

Mentor / Agency / Service Provider / Investor cards in section 5 are **joined views** of existing tables (`community_members`, `trade_investment_agencies`, `service_providers`, plus an `investors` table if it exists — there's already an `Investors.tsx` page suggesting yes) filtered by country association. Look at how `useSectorServiceProviders` does the array-overlap filter and mirror it for country.

RLS: public SELECT on all of the above; admin-only INSERT/UPDATE. Follow the pattern in `country_trade_organizations`.

Seed the Ireland row using the values in `src/core.jsx` (top half of file). Every value is copy-final.

---

## The 11 sections — what each one does

> Reference the live prototype (`Ireland Country Page.html`) for visuals. Below is the implementation summary.

### 0. Persistent chrome
- `<Layout>` already wraps everything. Don't introduce a parallel nav.
- **`CountryStickyBar`**: `position: fixed; top: 64px` (under existing nav). Fades in at `scrollY > 600`. Shows tricolour glyph + breadcrumb + jump links (`#playbook`, `#ecosystem`, `#faqs`) + primary CTA. Hidden below `md`.

### 1. `CountryHero`
- `<EntityBreadcrumb>` is mounted by `CountryPage` already; keep it there.
- Inline SVG tricolour (Ireland: `#169B62 / #FFFFFF / #FF883E`). Build a `<CountryFlag countryCode>` util — other country pages will use it.
- H1 + subhead from `country_page_content`.
- Trade-relationship badge with an animated emerald dot (`<span className="animate-ping ...">`).
- Three CTAs: primary teal → `/report-creator?source=country-ireland`, outline → `/contact?topic=ireland-call`, text link → `/api/playbook-pdf?country=ireland` (stub for now).
- Trust row sourced from `country_page_content.hero_trust_companies`.
- Right rail "Live snapshot" card: 4 mini stats (EUR/AUD, RBA rate, DUB→SYD flight, Director ID lead time). For v1 hardcode in `country_page_content` as `live_snapshot jsonb`. Add a server fetch later.

### 2. `CountryTradeSnapshot`
- Full-bleed `bg-mes-ink text-white` band.
- 6 tiles from `country_trade_metrics`. `2x3` on mobile, `1x6` on desktop.
- Each tile: index `01-06`, large `tabular-nums` value, label, coloured delta line (emerald or amber), `src · {source}` caption.

### 3. `CountryWhyItWorks`
- 12-col grid: 7-col numbered narrative bullets (`narrative_bullets`) + 5-col sticky aside.
- Aside: dark pull-quote card + "What's different vs US/UK" callout box (`differentiators` jsonb).
- **Copy rule:** no em-dashes anywhere. Grep before commit.

### 4. `CountryCaseStudies`
- Sector filter chips, active = `bg-mes-ink text-white`.
- Embla carousel (snap, drag, swipe). Prev/next circle buttons in header.
- Cards: wordmark tile + name + sector badge + outcome + "Read the playbook →" linking to `/case-studies/{slug}` when joined, else `#`.

### 5. `CountryEcosystemTabs`
- shadcn `<Tabs>` with custom `TabsList` styling: numbered pill + title + entry count, active gets ink-filled pill and 2px bottom rule.
- 4 panels: Agencies / Mentors / Services / Investors.
- Mentors tab shows an amber "Coming soon — request an intro" banner above the grid until the network is live.
- Grid: 3-col desktop, 1-col mobile.

### 6. `CountryPlaybook`
- 12-col grid: 3-col **sticky stepper rail** (numbered pills, active filled `bg-mes-ink text-white`) + 9-col card stack.
- shadcn `<Accordion type="single" collapsible>`. The stepper buttons set `value`.
- Expanded panel: dashed-line vertical timeline with mono step numbers + steps text + "Open the {title} checklist" dark button + "See partners for this stage" link.

### 7. `CountryFundingPathways`
- 2 cards side by side. Left = origin (Irish flag), right = destination (Aussie flag, gradient bg).
- Each lists 5 instruments with index + name + tag badge + body.
- Footer band (dark): worked example + "Model my stack" CTA → `/report-creator?focus=funding&country=ireland`.

### 8. `CountryEvents`
- Reuse `<EventCard>` if its shape works; otherwise lightweight cards with large day glyph + month/year mono + city + name + description.
- Filter: where event is tagged with this country (existing `events` table has `sector`; you may need to add a `country_tags text[]` column).

### 9. `CountryCities`
- 4 city cards with stripe-pattern header + city name + tagline + description + sector badges + "See {City} partners →" linking to `/locations/{slug}`.
- Pull from existing `locations` table, filtered to the 4 city slugs configured per country in `country_page_content.featured_city_slugs text[]`.

### 10. `CountryFAQ`
- 12-col grid: 4-col sticky aside (dark "Ask a question" card + search input) + 8-col accordion card.
- shadcn `<Accordion type="multiple">` (multiple open allowed).
- Items from `country_faqs`. First 5 are full answers (2-3 sentences), the rest are shorter.

### 11. `CountryLeadCapture`
- 3 tier cards in a row. Tier 1 free (email capture → `email_leads` table via existing pattern). Tier 2 paid AI report (featured card with `Most popular` ink badge → `/report-creator`). Tier 3 premium call (`/contact?topic=ireland-call`).
- Trust band below: 8 wordmarks of case study companies.

---

## SEO requirements

`<SEOHead>` already accepts `jsonLd`. Build a `CountryStructuredData` helper that returns an **array** of JSON-LD blocks, then pass them all in. The existing `SEOHead` likely supports one block — extend it to render `<script type="application/ld+json">` for each entry in an array. Required blocks:

1. **`BreadcrumbList`** — Explore › By Country › Ireland
2. **`FAQPage`** — built from `country_faqs` (huge rich-result win)
3. **`HowTo`** — built from `country_playbook_stages` (6 steps, with `name`, `text`, optional `totalTime`)
4. **`Event`** — one per Section 8 event
5. **`Place`** — one per Section 9 city (you already emit one for the country itself)
6. **`Organization`** — for MES, ideally at site root not just this page

**Other SEO:**
- The page is already SSR'd via Vite's static build? No — it's a SPA. Lovable's hosting serves the static shell + JS hydrates. For SEO this is workable because crawlers wait for hydration, but a prerender step would be safer. Out of scope for this ticket unless you choose to add it.
- Title tag: **"Ireland to Australia Market Entry: The Founder's Playbook (2026) | Market Entry Secrets"** — keeps the existing `SEOHead` pattern.
- Meta description: ~155 chars leading with "Ireland to Australia market entry."
- Canonical: `https://market-entry-secrets.lovable.app/countries/ireland`.
- Replace every `href="#"` placeholder with a real route (use `<Link>` from react-router-dom).
- Descriptive anchor text — never "Read more" or "View profile" on its own. Always include the entity name.

---

## Coding conventions (per `CLAUDE.md`)

- All colours must use Tailwind semantic tokens / CSS variables. **No hex literals in JSX.**
- All colours are HSL.
- Components are typed (`tsx`).
- No `VITE_*` env vars. Use Supabase URLs directly or secrets.
- For tables not in the auto-generated types, cast `(supabase as any).from('...')` (applies to the new tables until types are regenerated — regenerate ASAP).
- Toast via `sonner` (`toast('Sent')`).
- Use `<Helmet>` indirectly via `<SEOHead>`.
- React Query (`@tanstack/react-query`) is the data layer — every new hook returns `useQuery` results.
- Follow `useSectorServiceProviders` for "filter X by country keywords" array-overlap pattern.

---

## Responsive

- **375 / 768 / 1280** breakpoints. Sticky bar hides on mobile. Sticky stepper rail hides on mobile. Trade tiles become 2×3 on mobile.

---

## Out of scope (do not invent)

- Real auth/payments — wire to the existing flows.
- Sparkline upgrades on the trade snapshot.
- Other country pages — but design every component to accept the country object, not the string "Ireland".

---

## Files in this bundle

- `Ireland Country Page.html` — entry point of the prototype
- `src/core.jsx` — data constants + UI primitives
- `src/sections-top.jsx`, `src/sections-mid.jsx`, `src/bottom.jsx` — the 11 sections
- `CLAUDE_CODE_PROMPT.md` — paste-ready prompt for Claude Code

Open the HTML file in a browser before starting to implement.
