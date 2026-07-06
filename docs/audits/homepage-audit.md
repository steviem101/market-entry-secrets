# Homepage Audit — Design, Noise, Duplication & Conversion (MES-109)

**Date:** 2026-07-06
**Scope:** Audit + redesign options only. No production changes ship from this ticket.
**Goal:** One primary action — **create an account and generate an AI market entry report.**

**Method.** Code-level review of the homepage route and all section components, plus a visual
audit in a real Chromium browser at desktop (1440×900) and mobile (390×844) viewports.
Because the sandbox egress proxy cannot tunnel Chromium's TLS 1.3 handshake to the
production origin, the visual audit ran against a local dev build of `main` (the exact code
Lovable deploys to production), with Supabase API calls relayed so live counts and
testimonials render. Competitor pages were captured live. Screenshots are in
[`docs/audits/homepage-audit/`](./homepage-audit/).

---

## 1. Current state — what the homepage is today

Route `/` (`src/pages/Index.tsx`) renders **8 stacked sections** plus navigation, footer and a
timed popup:

| # | Section | Component | Height (desktop) |
|---|---------|-----------|------------------|
| 1 | Hero (persona toggle, headline, mockup, stats) | `src/components/sections/HeroSection.tsx` | 1,178 px (min-h-screen) |
| 2 | Before vs. After | `BeforeAfterSection.tsx` | 1,187 px |
| 3 | How It Works | `HowItWorksSection.tsx` | 622 px |
| 4 | Master search | `SearchSection.tsx` | 819 px |
| 5 | Value grid ("Intelligence, Not Just a Directory") | `ValueSection.tsx` | 1,024 px |
| 6 | Testimonials carousel | `TestimonialsSection.tsx` | 724 px |
| 7 | Full 4-tier pricing grid | `PricingSection.tsx` | 1,096 px |
| 8 | Final CTA | `CTASection.tsx` | 462 px |

Total: **~7,600 px on desktop (~8.5 screens), ~14,850 px on mobile (~17.5 screens)**.
A lead-gen dialog (`LeadGenPopupProvider`) fires at 15 seconds for anonymous visitors.

Full-page captures: [desktop](./homepage-audit/mes-local-desktop-full.jpg) ·
[mobile](./homepage-audit/mes-local-mobile-full.jpg)

### 1.1 Information hierarchy

**The first thing a visitor sees is a question, not an answer.** The hero
(`HeroSection.tsx:67-79`) places the "CHOOSE YOUR JOURNEY" persona toggle
(`HeroPersonaToggle`) *above* the headline. Before MES has said what it is, it asks the
visitor to classify themselves — and the toggle swaps copy in five sections
(`src/config/personaContent.ts`, 1,084 lines of persona-varied copy), a mechanism first-time
visitors have no reason to engage with. On mobile the toggle plus nav consume the entire
first screen: **the headline is half-visible and the primary CTA is below the fold**
([mobile fold](./homepage-audit/mes-local-mobile-fold.jpg)).

**The default headline hedges.** "Win in the Australian and New Zealand market — whether you
enter or scale" (`src/components/hero/heroContent.ts:20-24`) tries to address two personas at
once and names no product. "Win" is abstract; nothing above the fold says *AI market entry
report* — the thing we want the visitor to generate. The subheadline is a 40-word mechanism
list ("Answer a few questions… MES combines 500+ vetted providers, real case studies, and
AI-powered intelligence…") rather than a one-sentence definition of the platform.

**Two heroes compete.** The search section
([screenshot](./homepage-audit/mes-section-4.jpg)) uses a 6xl two-line gradient headline
("Search 2,000+ Verified Data Points / Curated by AI + Human Experts") — the same visual
weight as the hero. Halfway down the page the value proposition silently changes from
"generate a report" to "search a directory."

**Pricing arrives before conviction.** A full 4-tier pricing grid with ~30 bullet points
(`PricingSection.tsx`, [screenshot](./homepage-audit/mes-section-7.jpg)) sits on the
homepage, duplicating `/pricing`. For a freemium funnel, the homepage only needs to say
"free, no credit card" — tier comparison belongs after the visitor wants the product.

### 1.2 Content duplication

**The same directory inventory is enumerated four times** with different numbers each time:

| Claim | Hero stats row (live DB) | Before/After list | Value grid badges | Hero/CTA copy |
|---|---|---|---|---|
| Service providers | **100+** | **120+** | **120+** | **500+** ("vetted providers") |
| Mentors | **30+** | **200+** | **200+** | — |
| Lead lists / contacts | **20+** | **100+ lists** | **1,200+ contacts** | — |
| Events | **50+** | **50+ monthly** | **50+ monthly** | — |

Sources: `heroContent.ts:96-118` (live counts via `useHeroStats`, fallbacks shown),
`personaContent.ts` Before/After items (`:175-278`), Value grid (`:288-346`), hero
subheadline and final CTA ("backed by 500+ vetted providers"). The search section adds a
fifth set of hardcoded numbers — "2,000+ verified data points", "850 Companies",
"620 People", "340 Events", "265 Locations" (`SearchSection.tsx:32-38`) — none of which come
from the database. **A market-intelligence product whose own homepage disagrees with itself
about its data is a direct trust hit** (see §2: Starter Story repeats one number verbatim
everywhere).

**The trust line is repeated three times, always self-asserted.** Five yellow stars +
"Trusted by 500+ companies across ANZ and 12+ countries" appears in the hero
(`HeroSocialProof.tsx`), again above the testimonials heading ("Trusted by teams across ANZ
and 12+ countries", `personaContent.ts:354`), and the same stars again inside each
testimonial card. No customer logos or named institutions back any instance.

**Before/After (13 cards) and the Value grid (6 cards) are the same section twice.** The
"With MES" column ([screenshot](./homepage-audit/mes-section-2.jpg)) lists vetted providers,
mentors, lead lists, events/networking, success stories, AI report; the Value grid
([screenshot](./homepage-audit/mes-section-5.jpg)) lists vetted providers, mentors, lead
databases, events, playbooks/case studies, agencies. Both duplicate the hero stats row.

**The popup duplicates the hero CTA.** At 15 seconds the dialog
([screenshot](./homepage-audit/mes-popup.jpg)) interrupts reading to offer exactly what the
hero, nav, and final CTA already offer — a free report — usually while the visitor is
mid-way through the page that is making that same pitch.

### 1.3 CTA clarity

The one desired action is phrased **six different ways**: "Get Your Report" (nav),
"Create my free report" (hero), "Start now" (How-It-Works step 1), "Create Your Free Report"
(popup), "Start Exploring Free" (pricing free tier), "Create My Free Report" (final CTA).
Repetition builds recognition only when the words repeat; six variants read as six actions.

Meanwhile the page offers **~25 competing clickable destinations** before the footer: 2
persona toggles, secondary CTAs ("Explore providers", "Find a mentor", "Schedule
Consultation"), 5 hero stat cards (all links), 3 per-step links in How It Works ("Start now"
/ "See how it works" / "View providers" — three different destinations for three steps of
*one* process), 5 search tabs + master search, 6 value-grid cards, 4 pricing buttons. Every
link that isn't "generate a report" is an exit ramp from the primary funnel.

On the positive side: the nav CTA is persistent and correctly worded, the hero CTA has good
trust microcopy ("No credit card required · Ready in 3 minutes", `HeroCTAGroup.tsx`), and
tier-gating means the free report is genuinely the right top-of-funnel offer.

### 1.4 Visual noise & graphics

- **Decorative animation systems run simultaneously**: 5 floating blurred orbs + dot grid +
  gradient shift in the hero background (`HeroBackground.tsx`); 3 more pulsing orbs, 2
  `animate-ping` dots and a **perpetually bouncing search icon** in the search section
  (`SearchSection.tsx:44-53,131`); staggered fade-in-up on six hero tiers (0–600 ms);
  animated counters plus "breathing" icons in the stat cards (`HeroStatsRow.tsx`); a shimmer
  sweep across the primary CTA button (`HeroCTAGroup.tsx:47`); hover-scale on nearly every
  card. No single element is loud, but they compound into restlessness.
- **Nearly every section paints its own gradient background** (all 8 sections use
  `bg-gradient-to-*`), plus gradient text (`bg-clip-text`) in four section headings, plus
  gradient pill badges. Gradient-as-default removes the emphasis gradients could provide.
- **Icon inflation:** ~40 icon tiles across the page (13 Before/After items, 6 value cards,
  5 stats, 5 search tabs, 3 steps…), each in its own colored gradient container — violet,
  emerald, blue, orange, rose, amber (`HeroStatsRow.tsx:31-39`) — competing with the brand
  primary/accent palette.
- **Scroll-linked opacity resets:** the search section re-animates from `opacity-0` every
  time it re-enters the viewport (`useIntersectionObserver` without a once-flag), so
  scrolling up blanks a full screen of content momentarily — visible as a blank band in
  full-page captures.
- The hero mockup (`HeroProductMockup`) is a good instinct — showing the report — but it
  competes with the persona toggle, journey-flow SVG connector (`HeroJourneyFlow`), stats
  row and social proof for one screen of attention.

### 1.5 Mobile

- Fold = nav + "CHOOSE YOUR JOURNEY" + two toggle cards + 6-line headline. **No CTA, no
  product visual, no definition of the platform on the first screen.**
- ~17.5 screens of scroll; Before/After alone is ~13 stacked cards of reading.
- The 15-second popup covers the full viewport on mobile.
- Testimonial carousel and pricing cards each occupy multiple screens.

---

## 2. Competitor teardown

Captured live at 1440×900 on 2026-07-06.

### 2.1 Navigator Global (Santander) — [navigator.global/gb](https://navigator.global/gb)

[Hero](./homepage-audit/navigator-desktop-fold.jpg)

- Headline is a plain promise: **"Navigate international trade with confidence"**, and the
  line under it *defines the platform in one sentence* including who's behind it: "Created by
  Santander, Navigator Global is a platform that helps businesses identify overseas demand,
  reach interested buyers and connect with verified providers…"
- **One CTA pair** — "Get started" / "Book a demo" — and "Get started" is repeated verbatim
  at each section end. Sections contain almost no other links.
- Structure: hero → 3 benefit cards → "Who is it for?" → stage-based journey (Explore new
  markets / Scale globally / Plan your growth) → platform pillars → services grid. Each
  section has exactly one job; numbers (41 market profiles, 280+ verified providers) appear
  once, in context, consistently.
- Visually quiet: white/grey, single red accent, real product screenshots, no animated
  backgrounds.

**Takeaways for MES:** put a one-sentence *definition* under the headline; replace the
persona toggle with journey-stage content lower on the page; repeat one CTA verbatim;
one accent color doing emphasis work.

### 2.2 Hubble — [hubble.social](https://www.hubble.social/)

[Hero](./homepage-audit/hubble-desktop-fold.jpg) · [full page](./homepage-audit/hubble-desktop-full.jpg)

- Benefit-led hero over a single photograph: **"Talk to founders & investors who've actually
  done it"**, sub-line is a concrete, time-boxed promise ("Book a 30-minute call and get
  honest advice from someone a few steps ahead of you"), **one CTA ("Find my expert")**.
- Proof is *specific and borrowed*: "600+ operators from a16z, Y Combinator, Apple" + logo
  bar — not self-asserted stars.
- Emotional problem framing ("Stop building alone.") in one section, three quiet statements,
  a 3-step how-it-works, FAQ, and a final "Ready when you are" CTA. ~7 sections, enormous
  whitespace, effectively zero decorative graphics.

**Takeaways for MES:** one repeated CTA phrase and one conversion path; concrete time-boxed
promise ("your report in ~3 minutes" is MES's version); named logos/institutions as proof
instead of star self-ratings; whitespace as the noise-reduction tool.

### 2.3 Starter Story — [starterstory.com](https://www.starterstory.com/)

[Hero](./homepage-audit/starterstory-desktop-fold.jpg)

- **One headline metric, repeated verbatim everywhere**: "2,861+ real, revenue-generating
  projects" appears in the hero copy, under the email field, in the database section and in
  the final CTA — always the same number. That consistency *is* the credibility.
- "Updated live. **Free.**" — the price is in the hero, and the only ask is an email field
  ("Get Started"), the lowest-friction capture possible.
- The hero visual is **the actual product** — a live table of the database with a
  "Live · Updating now" badge — not an illustration.
- Structure: hero (product embedded) → database proof → category grid → founder interviews →
  single final CTA with the same number again.

**Takeaways for MES:** pick ONE stat set, make it live from the DB, repeat it verbatim
(hero, proof strip, final CTA); say "Free" in the hero; make the hero visual the real
report UI; consider email-first capture for the report intake.

### 2.4 NUVC — [nuvc.ai/ecosystem](https://nuvc.ai/ecosystem)

[Hero](./homepage-audit/nuvc-desktop-fold.jpg)

- Noun-specific headline ("Startup Accelerators & Programs Across AU, NZ & APAC") followed
  immediately by a **compact stat strip (746 Total Programs / 521 Accelerators / 42
  Countries)** and then the *actual filterable directory* on the landing page.
- Data is the hero; one accent color; single top-right CTA ("Score My Deck — Free").

**Takeaways for MES:** a single stat strip directly under the value proposition beats five
icon-heavy stat cards mid-hero; if the directory matters, show real rows, not five tab
buttons with hardcoded counts.

### 2.5 Asia Market Entry — [asiamarketentry.com](https://www.asiamarketentry.com/)

[Hero](./homepage-audit/asiamarketentry-desktop-fold.jpg)

- Outcome-first headline: **"Turn APAC expansion into revenue growth"** — names the result,
  not the mechanism. Sub-line states the offer and the single funnel (a workshop) in two
  sentences.
- Trust via **institutional endorsements** ("Endorsed by:" UK DBT, NZ Trade & Enterprise,
  Singapore EDB, Microsoft) rather than self-ratings — highly relevant pattern for MES's
  government-agency relationships (Austrade et al.).

**Takeaways for MES:** an outcome verb in the headline; a government/agency logo strip is
the most credible proof MES could show and costs nothing to build once one partner agrees.

---

## 3. Redesign options

All options share: **one CTA phrase used verbatim everywhere**, one consistent live-count
stat set, persona toggle removed from the top of the hero (persona is already captured
inside the report intake), and pricing reduced to a link/free-emphasis (full grid stays on
`/pricing`).

### Option A — "The report is the product" *(recommended)*

The homepage sells one thing: the AI market entry report. The directory becomes supporting
evidence ("what feeds your report") rather than a co-equal product.

- **Hero headline:** `Your Australian market entry plan — generated in minutes.`
- **One-line platform description:** `Market Entry Secrets turns a 5-minute questionnaire
  into a full ANZ market entry report: live market intelligence, competitor landscape,
  vetted providers, mentors, and a step-by-step action plan.`
- **Primary CTA:** `Generate my free report` (verbatim in nav, hero, mid-page, final CTA)
  with microcopy `Free · No credit card · Ready in ~3 minutes`.
  **Secondary (hero only):** `See a sample report` — satisfies "show me first" visitors
  without leaving the funnel (links to a shared sample via `/report/shared/:token`).
- **Section structure (7, ~55% of current height):**
  1. **Hero** — headline, one-liner, CTA pair, report mockup (kept, made the only visual).
  2. **Proof strip** — one line: live counts from `useHeroStats` (providers · mentors ·
     lead lists · events · investors) + partner/agency logos when available.
  3. **How it works** — 3 steps, one CTA at the end (`Generate my free report`).
  4. **What's in your report** — replaces Before/After + Value grid: 6 cards mirroring
     actual report sections (exec summary, SWOT, competitor landscape, provider matches,
     mentor recommendations, action plan) with Free/Growth tier labels — sells the report
     *and* previews the upgrade path.
  5. **Explore the platform** — compact search/directory teaser with live counts, one link.
  6. **Testimonials** — 3 cards, no carousel, logos where possible.
  7. **Final CTA** — same phrase + microcopy.
- **Competitor learnings applied:** Starter Story (one metric set, "Free" up front, product
  as hero visual), Hubble (one CTA path, calm hierarchy), Navigator (definitional
  one-liner), Asia Market Entry (agency logos).

### Option B — "Platform definition + journey" (Navigator-style)

Positions MES as the end-to-end entry/scale platform; the report is step one of a journey.

- **Hero headline:** `Enter the Australian market with confidence.` (the existing
  international-persona headline — already the strongest of the three variants)
- **One-line platform description:** `Created by ANZ market-entry operators, Market Entry
  Secrets helps you research the market, connect with 500+ vetted providers and mentors,
  and generate an AI-powered entry plan — free to start.`
- **Primary CTA:** `Get started free` · **Secondary:** `Book a walkthrough` (or `Explore
  the directory` if no demo motion exists).
- **Section structure (7):** Hero → three benefit cards (Research · Connect · Plan) →
  journey stages (Validate → Enter → Scale, each mapping to platform features) → directory
  proof with live counts → how it works → testimonials → final CTA.
- **Competitor learnings applied:** Navigator (definition line, journey stages, single CTA),
  Asia Market Entry (outcome framing), Hubble (calm structure).
- **Trade-off:** journey content is more copy to maintain, and "get started" is a weaker
  scent than "generate my report" for the specific conversion goal.

### Option C — "Data-led directory" (Starter Story/NUVC-style)

Leads with the dataset; the report is the free tool you get for signing up.

- **Hero headline:** `2,000+ verified resources for entering the Australian market.`
  (number must be live and match the stat strip exactly)
- **One-line platform description:** `Vetted service providers, mentors, investors, lead
  databases and events — mapped, searchable, and distilled into a free AI market entry
  report for your company.`
- **Primary CTA:** `Create my free account` (email-first field, Starter Story-style).
- **Section structure (6):** Hero with embedded live directory table → stat strip →
  categories grid → how the report works → testimonials → final CTA.
- **Trade-off:** sells the directory, not the report — weaker alignment with the
  account→report conversion goal and with tier-gated report monetization. Included for
  completeness; not recommended as-is.

### Recommendation: **Option A**

Rationale against the conversion goal (account creation → AI report generation):

1. **Scent continuity:** the CTA promises exactly what the funnel delivers — `Generate my
   free report` → intake wizard → report. No re-orientation at any step.
2. **Monetization alignment:** report sections are tier-gated (`reportSectionConfig.ts`), so
   "What's in your report" simultaneously converts free users and previews Growth/Scale
   value — the Before/After and Value sections do neither directly.
3. **Differentiation:** competitors can copy a directory; the generated report is MES's
   unique asset. Navigator/Hubble/Starter Story all lead with their unique asset.
4. **It subsumes the best of B** (definitional one-liner) **and C** (live stat strip,
   product-as-hero-visual) without their trade-offs.

---

## 4. Follow-up implementation ticket (outline)

**Title:** Homepage redesign — single-funnel "report first" homepage (implements MES-109
Option A)

**User story:** As a first-time visitor, I instantly understand MES generates an AI market
entry report for my company, and I create a free account to generate one.

**Scope (frontend only, no backend/RLS/migrations):**
1. `Index.tsx`: new section order (Hero → ProofStrip → HowItWorks → WhatsInYourReport →
   PlatformTeaser → Testimonials → CTA); delete `BeforeAfterSection`, `ValueSection`,
   `PricingSection` from the homepage (pricing stays at `/pricing`).
2. Hero: remove `HeroPersonaToggle`/`HeroJourneyFlow` from the top (persona captured in
   report intake); new default copy in `heroContent.ts`; keep `HeroProductMockup`; CTA label
   unified to `Generate my free report` (nav `NavigationItems.tsx`, hero, final CTA,
   popup).
3. New `ProofStrip` fed exclusively by `useHeroStats` (single source of truth for counts);
   remove all hardcoded counts (`SearchSection` tabs, `personaContent.ts` badges, "500+" in
   copy) or derive them from the same hook.
4. New `WhatsInYourReport` section driven by the real report section list
   (`reportSectionConfig.ts`) with tier labels.
5. Noise reduction: single hero background gradient (drop orbs/dot grid/ping dots/bouncing
   icon), one-shot intersection animations, cap icon palette at primary/accent.
6. Popup: suppress when the visitor has scrolled past How-It-Works or clicked any CTA;
   consider raising delay to 30s.
7. Mobile: CTA visible in first viewport; target < 9 screens total.
8. Sample report: publish one shared report and wire `See a sample report`.

**Measurement (before/after):** homepage → signup rate, signup → report-generation rate,
scroll depth, CTA click-through by position, popup dismiss rate. No A/B infra in scope —
compare 2-week windows.

**Risks:** copy drift from brand voice (human approval before ship); removing directory
sections may reduce SEO surface (keep `SearchSection` content crawlable); conversion
regression (measurement window + fast revert since change is presentational).

---

## 5. Acceptance-criteria traceability

- Audit findings each reference a component/line or screenshot (§1).
- All 5 competitor homepages captured with screenshots + takeaways (§2), each takeaway
  mapped to a concrete MES recommendation (§2 "Takeaways", §3 "learnings applied").
- 3 redesign options with hero headline, one-line description, CTA copy and section
  structure (§3), each sanity-checked against the account→report goal (Option C explicitly
  flagged as misaligned).
- One recommended option with rationale (§3) and follow-up ticket outline (§4).
