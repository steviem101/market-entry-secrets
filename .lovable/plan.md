# Countries area — split into separate PRs

Three independent PRs, shipped in order. Each is self-contained and verifiable on its own.

---

## PR 1 — Phase A: Data bugs (hot fix)

Live bugs on UK / USA / Singapore country pages right now.

### A1. Real flags for GB, US, SG
- Add inline SVG flags for `GB`, `US`, `SG` in `src/components/countries/CountryFlag.tsx`.
- Replace the silent "fall through to Irish stripes" branch with a neutral globe icon (lucide `Globe`) for unknown codes.
- Change `COUNTRY_CODES` fallback in `src/pages/CountryPage.tsx` from `"IE"` to `null`, and let `CountryFlag` handle the unknown case.

### A2. Drop Ireland-only `live_snapshot` fallback
- `src/components/countries/CountryHero.tsx` lines 107–114: render the snapshot aside only when `pageContent?.live_snapshot?.length > 0`.
- When hidden, let the hero text column span the full grid width (`md:col-span-12`) instead of leaving an empty 5/12 gap.

### A3. Template SEO title/description per country
- `src/pages/CountryPage.tsx` lines 83–91: derive title/description from `country.name`, `country.key_industries`, and `pageContent?.hero_subhead`.
- Keep Ireland's bespoke wording as a per-slug override map (data-driven), not an `if (slug === "ireland")` branch.

### A4. Use `publishedOrigin()` for JSON-LD baseUrl
- `src/pages/CountryPage.tsx:78`: swap `window.location.origin` for `publishedOrigin()` from `src/lib/publishedOrigin.ts`. Scoped to JSON-LD only.
- **Not touching** `SEOHead.tsx` — that's app-wide and belongs in its own PR.

**Verify:** Playwright screenshots of `/countries/uk`, `/countries/usa`, `/countries/singapore`. Each shows the correct flag, no Ireland fallback stats, correct `<title>` / `<meta description>`.

**Files:** `CountryFlag.tsx`, `CountryHero.tsx`, `CountryPage.tsx`.

---

## PR 2 — Phase B: Listing rebuild

Polish the `/countries` index so it stops feeling disconnected from the detail pages.

### B1. Rebuild `CountryCard`
- Add flag (top-left) using the now-real `CountryFlag` from PR 1.
- Replace hardcoded `text-green-500` / `text-blue-500` / `text-orange-500` (lines 41/47/53) with semantic tokens.
- Replace the inline icon stat rows with a compact stat strip that visually echoes `CountryTradeSnapshot` tiles on the detail page.
- Add an explicit "View country playbook →" affordance.

### B2. Stop showing featured countries twice
- `AllCountriesSection.tsx`: when `searchQuery` is empty, exclude featured countries from the render set.
- Rename the second section heading to "More countries" so the hierarchy reads cleanly.

### B3. Country flavour on `CountriesHero`
- Add a small strip of 4–6 featured-country flags near the headline.

### B4. Visible Featured treatment
- Add a "Featured" pill or accent border on featured cards.

**Verify:** Side-by-side screenshots of `/countries`, `/sectors`, `/locations` for visual continuity. First-load check confirms no country card appears twice.

**Files:** `CountryCard.tsx`, `AllCountriesSection.tsx`, `CountriesHero.tsx`, `FeaturedCountriesSection.tsx`.

**Depends on:** PR 1 (uses the new `CountryFlag` SVGs).

---

## PR 3 — Phase C: Latent dark-mode note

One-line comment in `src/index.css` next to the `--mes-*` block flagging that they have no `.dark` overrides — if dark mode is ever switched on (currently unreachable), country pages render light-on-light. No behavioural change.

**Files:** `src/index.css`.

---

## Explicitly NOT doing

- No `index.css` token aliasing (already aligned in commit f02da58; aliasing would regress hover/eyebrow contrast and the RC button gradient).
- No rename of `mes-teal*` → `mes-primary*`.
- No `SEOHead.tsx` rewrite (app-wide; separate scope).
- No `LocationCard` cleanup.
- No data/schema/edge function changes.

---

Approving this plan switches me to build mode and I'll start with **PR 1 (Phase A)**. PR 2 and PR 3 follow as separate approvals.
