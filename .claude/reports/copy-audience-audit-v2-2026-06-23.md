# Dual-Audience Copy Audit (v2) — Market Entry Secrets

**Date:** 2026-06-23
**Scope:** User-facing marketing and information copy (home, about, contact, FAQ, pricing, shared microcopy, global meta).
**Type:** READ-ONLY audit. No source files were modified. This report is the only file created.

Audiences under review:
- **Audience A (inbound entrants):** international companies entering and scaling in the ANZ market.
- **Audience B (local builders):** Australian and New Zealand founders and operators growing within their home market.

---

## 1. Executive Summary

**The ~80/20 lean toward Audience A is confirmed, and on the layers that matter most for first impressions it is closer to 100/0.** The codebase already contains a well-built dual-persona engine: a hero toggle (`International Entry` / `Startup Growth`) swaps the entire home page between an "international entrant" variant and an "Australian startup" variant via `src/config/personaContent.ts`. Audience B copy is genuinely strong where it exists. The problem is not that B copy is missing from the engine; it is that **B is never the default and never reaches the surfaces that are not persona-aware.**

Three structural gaps drive the imbalance:
1. **The default persona is `international` (Audience A).** A first-time visitor with no stored persona sees the A variant on every home section (`useSectionPersona.ts` falls back to `"international"`; `HeroSection` initialises to `international`). B copy only appears after the user finds and clicks the toggle.
2. **Every static page is A-only with no persona switch:** About, Contact, and FAQ are hardcoded entirely around "entering the Australian market" and "international companies." The FAQ "Who is this platform for?" answer does not mention local founders at all.
3. **All SEO, meta, OG, and JSON-LD copy is invariant and A-only.** This is what Google indexes and what gets shared on social, so the platform's public face is 100% entrant-framed regardless of the toggle.

**Top 3 changes that fix most of it:**
1. **Dual-frame the global meta + hero default** (the title, meta description, OG, JSON-LD, and the un-toggled hero line). This is the highest-reach copy on the site and is pure A today. (P0)
2. **Rewrite the FAQ and About "who is this for" framing** to name both audiences explicitly. These pages are static, A-only, and carry the brand's plain-language self-description. (P1)
3. **Give the home a neutral/both default** (either a dual-framed hero line shown before a persona is chosen, or default the shared sections to dual copy) so the toggle becomes an optional refinement rather than the only path to B. (P0/P1)

> Positioning note: the existing copy already reads as a structured intelligence and execution platform (vetted providers, leads, case studies, events, planner). All rewrites below preserve that and avoid generic "content site" language.

---

## 2. Balance Scorecard

Counts reflect copy **as served by default** (first-time visitor, no persona selected), since that determines the lean a real visitor experiences.

| Surface | A | B | Both | Neutral | Lean | Priority |
|---|---|---|---|---|---|---|
| Global meta / SEO / OG / JSON-LD | 7 | 0 | 0 | 0 | Strongly A | P0 |
| Home — Hero (default) | 4 | 0 | 1 | 1 | Strongly A | P0 |
| Home — Before/After, How It Works, Search, Value, Testimonials, Pricing, CTA (default) | 7 | 0 | 0 | 1 | Strongly A | P0 |
| About | 7 | 0 | 0 | 1 | Strongly A | P1 |
| FAQ | 5 | 0 | 0 | 7 | A (0 B) | P1 |
| Contact | 5 | 0 | 0 | 1 | Strongly A | P1 |
| Pricing (page-level) | 2 | 0 | 0 | 1 | A | P1 |
| Navigation | 2 | 0 | 0 | 11 | Neutral, slight A | P2 |
| Footer | 0 | 0 | 0 | 3 | Neutral | P2 |

**Overall verdict:** Against a 50/50 target, the served experience is roughly **A 39 / B 0 / Both 2 / Neutral 25**. The ~80/20 hypothesis holds and understates the issue on the static and meta layers (effectively 100/0). The mitigating factor is that the home persona engine delivers near-parity B copy **once the toggle is clicked** and the choice persists in `localStorage` (`mes_user_persona`). The fix is largely about defaults and the non-persona-aware surfaces, not about writing B copy from scratch.

---

## 3. Source Inventory

| Surface | Source location | Where it renders |
|---|---|---|
| Persona engine (home A vs B copy) | `src/config/personaContent.ts` | All home sections via `useSectionPersona` |
| Persona default + fallback | `src/hooks/useSectionPersona.ts:10`, `src/contexts/PersonaContext.tsx:24`, `src/components/sections/HeroSection.tsx:15-25` | Determines which variant a new visitor sees |
| Hero headline/subheadline/CTA/toggle | `src/components/hero/heroContent.ts`, `HeroHeadline.tsx`, `HeroSubheadline.tsx`, `HeroPersonaToggle.tsx`, `HeroSocialProof.tsx` | Home hero |
| Home sections | `src/components/sections/*.tsx` (Hero, BeforeAfter, HowItWorks, Search, Value, Testimonials, Pricing, CTA) | `/` |
| Floating CTA | `src/components/FloatingCTAButton.tsx` (+ `personaContent.ts`) | `/` and other routes |
| Home meta / JSON-LD | `src/pages/Index.tsx:46-64` | `/` `<head>` |
| Site-wide static meta | `index.html:11-31` | All routes (pre-render / crawl) |
| Shared SEO component | `src/components/common/SEOHead.tsx` | About, Contact, FAQ, Pricing, Partner |
| About | `src/pages/About.tsx` (hardcoded) | `/about` |
| Contact | `src/pages/Contact.tsx` (hardcoded) | `/contact` |
| FAQ | `src/pages/FAQ.tsx` (hardcoded `FAQ_ITEMS` + JSX) | `/faq` |
| Pricing (page wrapper) | `src/pages/Pricing.tsx` (renders persona-aware `PricingSection`) | `/pricing` |
| Navigation | `src/components/navigation/NavigationItems.tsx` | All routes |
| Footer | `src/components/Footer.tsx` | All routes |
| Testimonials (data) | DB `testimonials` table via `src/hooks/useTestimonials.ts`; persona fallbacks in `personaContent.ts` | Home testimonials |

**DB-driven copy check:** The in-scope marketing surfaces (home, About, Contact, FAQ, Pricing) are **hardcoded in source**, not served from MES Platform tables. Only testimonials are DB-driven (`testimonials`), and the home uses persona-specific fallbacks when the table is empty. `country_faqs` exists but holds per-country page content, not the main marketing FAQ, so it is outside this audit's core surfaces. No central `src/content` / `src/copy` / i18n / JSON string store exists; copy lives in components and `src/config/personaContent.ts`.

---

## 4. Per-Surface Findings

### 4.1 Global meta / SEO / OG / JSON-LD — Priority P0

This is the highest-reach copy on the site (indexed by search, shown on shares) and it is invariant: the persona toggle does not touch it. Every string is Audience A.

**Finding 1 — Site-wide title and description**
- Location: `index.html:11-12`, `:28-31`
- Current:
  - `<title>Market Entry Secrets — Australian Market Entry Intelligence</title>`
  - `<meta name="description" content="Uncover the secrets for successful market entry into Australia">`
- Issue: Audience B (local founders not "entering" anything) sees nothing for them in the title, description, OG, and Twitter tags. This is the public face of the brand.
- Suggested rewrite:
  - Title: `Market Entry Secrets | Intelligence and Execution for the ANZ Market`
  - Description: `The intelligence and execution platform for the Australian and New Zealand market. Vetted providers, leads, case studies, events, and AI plans, whether you are entering ANZ or scaling within it.`

**Finding 2 — Home meta description and JSON-LD**
- Location: `src/pages/Index.tsx:49`, `:54`, `:22-23` (Organization JSON-LD `description`)
- Current (meta): `"AI market entry intelligence for companies entering Australia. 500+ vetted providers, mentors, and custom reports in minutes."`
- Current (JSON-LD): `"AI-powered market entry intelligence platform helping international companies enter the Australian and New Zealand markets."`
- Issue: Both lock the brand to inbound entrants only.
- Suggested rewrite:
  - Meta: `AI-powered intelligence for the ANZ market. 500+ vetted providers, mentors, leads, and custom plans in minutes, whether you are entering Australia or scaling within it.`
  - JSON-LD description: `AI-powered intelligence and execution platform for the Australian and New Zealand market, serving international companies entering ANZ and local founders scaling within it.`

**Finding 3 — Per-page SEO descriptions**
- Location: `src/pages/About.tsx:35`, `Contact.tsx:85`, `FAQ.tsx:28`, `Pricing.tsx:37`, `PartnerWithUs.tsx:17`
- Current examples:
  - About: `"...helping international companies enter the Australian and ANZ markets with AI-powered intelligence."`
  - Pricing: `"Choose the right plan for your Australian market entry journey."`
  - FAQ: `"Frequently asked questions about entering the Australian market and using Market Entry Secrets."`
- Issue: Every page's social/search snippet is A-only.
- Suggested rewrites:
  - About: `Learn about Market Entry Secrets, the intelligence and execution platform for companies entering ANZ and local founders scaling within it.`
  - Pricing: `Choose the right plan for your ANZ journey, whether you are entering the market or scaling within it.`
  - FAQ: `Answers about using Market Entry Secrets to enter the ANZ market or to scale your Australian or New Zealand business.`

---

### 4.2 Home — Hero (default state) — Priority P0

The hero defaults to the `international` persona for every new visitor.

**Finding 4 — Default hero headline and subheadline**
- Location: `src/components/hero/heroContent.ts:20-24` (rendered via `HeroHeadline.tsx`, `HeroSubheadline.tsx`); default set by `HeroSection.tsx:15` and `useSectionPersona.ts:10`.
- Current (default shown before any toggle):
  - Headline: `"Enter the Australian market"` / `"with confidence."`
  - Subheadline: `"Answer a few questions about your company, sector, and goals. MES combines 500+ vetted providers, real case studies, and AI-powered intelligence to generate a plan for entering the ANZ market."`
- Issue: The first thing 100% of new visitors read is entrant-only. A local founder bounces before discovering the `Startup Growth` toggle.
- Suggested rewrite (a single dual-framed default shown when no persona is chosen; keep the existing two variants for when a persona is selected):
  - Headline: `Win in the Australian and New Zealand market` / `with confidence.`
  - Subheadline: `Answer a few questions about your company, sector, and goals. MES combines 500+ vetted providers, real case studies, and AI-powered intelligence to build your plan, whether you are entering ANZ or scaling within it.`

**Finding 5 — Default primary CTA**
- Location: `src/components/hero/heroContent.ts:25` (international `primaryCTA`)
- Current: `"Create my free market entry report"`
- Issue: "Market entry report" excludes the founder who is not entering.
- Suggested rewrite (neutral default): `Create my free report` (the persona-specific `Create my free growth report` already exists for the startup variant at `heroContent.ts:42` and should be retained for that variant).

**Finding 6 — Hero social proof line**
- Location: `src/components/hero/HeroSocialProof.tsx:12`
- Current: `"Trusted by 500+ companies from 12+ countries"`
- Issue: "from 12+ countries" signals cross-border entrants only; an Australian founder does not see themselves.
- Suggested rewrite: `Trusted by 500+ companies across ANZ and 12+ countries`
- Priority: P1.

**Already balanced (keep):** the persona toggle itself (`HeroPersonaToggle.tsx:11-12`, labels `International Entry` / `Startup Growth`, with `Choose your journey`) is the one genuinely dual element in the hero. Recommendation: make it more prominent and ensure a neutral default sits above it, rather than pre-selecting A.

---

### 4.3 Home — Body sections (default state) — Priority P0/P1

All of these render the `international` variant by default from `personaContent.ts`. The `startup` variants already exist and are strong, so the fix is the default, not new copy. Worst offenders to address if a neutral default is introduced:

**Finding 7 — Before/After section title**
- Location: `src/config/personaContent.ts:175-179`
- Current: `sectionTitle: "Before vs. After Market Entry"`, `beforeSubheading: "The painful way companies enter Australia"`
- Issue: Frames the entire problem as "market entry" for a default visitor.
- Suggested neutral-default rewrite: `sectionTitle: "Before vs. After Market Entry Secrets"`, `subtitle: "See the difference between navigating the ANZ market blind and having the right intelligence at your fingertips, whether you are entering or scaling."`

**Finding 8 — Value section heading**
- Location: `src/config/personaContent.ts:288-290`
- Current: `sectionTitle: "Intelligence, Not Just a Directory"`, subtitle references "what takes consultants months."
- Note: The heading `Intelligence, Not Just a Directory` is on-brand and audience-agnostic. Keep it. The issue is the items below (`Market Entry Specialists`, `Cross-Border Mentors`, "foreign companies establish in ANZ") which are A-only by default.
- Suggested neutral-default item framing example: `Cross-Border Mentors` becomes `Mentors and Operators` with description `Advisors who have entered ANZ from abroad and founders who have scaled within it, matched to your situation.`

**Finding 9 — CTA section**
- Location: `src/config/personaContent.ts:470-479`
- Current: `headingAccent: "Ready to Enter"`, `headingPlain: "the Australian Market?"`, subtitle `"Generate a tailored market entry plan in minutes..."`, secondary CTA `"Schedule Consultation"`.
- Issue: The closing pitch every default visitor sees is entrant-only.
- Suggested neutral-default rewrite: `headingAccent: "Ready to Win"`, `headingPlain: "in the ANZ Market?"`, subtitle `"Generate a tailored plan in minutes, backed by 500+ vetted providers and real market intelligence, whether you are entering or scaling."`

**Finding 10 — Search and Pricing/Testimonials headings (default)**
- Location: `personaContent.ts:284` (search subtitle "...accelerate your Australian market entry."), `:402-405` (pricing "Choose Your Market Entry"), `:350-353` (testimonials "...international businesses transformed their market entry").
- Issue: All default to A.
- Suggested: introduce neutral defaults, e.g. pricing heading `Choose Your Plan`, testimonials `Companies That Chose Success` with subtitle `See how companies entering ANZ and founders scaling within it grew with our resources.`

> Reusable fix R1 (see §5) covers Findings 4 to 10 in one move: add a third "default/both" entry to the persona content (or render a dual-framed default when `persona === null`) so the un-toggled home speaks to both.

---

### 4.4 About — Priority P1 (static, A-only)

**Finding 11 — About hero and mission**
- Location: `src/pages/About.tsx:46-53`, `:89-93`
- Current:
  - `"Unlock the Secrets to Australian Market Success"`
  - `"We're Australia's premier directory connecting businesses with the insider knowledge, vetted experts, and proven strategies needed to successfully enter and thrive in the Australian market."`
  - Mission: `"...the insider knowledge and expert connections that make Australian market entry successful..."`
- Issue: Entirely entrant-framed; a local founder reads "enter" and assumes the platform is not for them. Also note "premier directory" softens the intelligence-platform positioning.
- Suggested rewrite:
  - Hero: `Unlock the Secrets to Winning in Australia and New Zealand`
  - Intro: `We are the intelligence and execution platform connecting businesses with the insider knowledge, vetted experts, and proven strategies they need to succeed in the ANZ market, whether they are entering it or scaling within it.`
  - Mission: `...the insider knowledge and expert connections that make success in the ANZ market repeatable, whether you are landing here or growing the business you already run here.`

**Finding 12 — About values and final CTA**
- Location: `src/pages/About.tsx:11`, `:21`, `:170-172`
- Current:
  - `"...proven market entry specialists."` / `"...the hidden strategies and insider tips that successful companies use to enter the Australian market."`
  - Final CTA copy: `"Join thousands of businesses who have successfully entered the Australian market using our insider knowledge and expert network."`
- Issue: Reinforces entrant-only at every value and the closing CTA.
- Suggested rewrite (final CTA): `Join thousands of businesses that have grown in the ANZ market using our insider knowledge and expert network, whether they entered or scaled within it.`

---

### 4.5 FAQ — Priority P1 (static, 0 B)

**Finding 13 — FAQ definition and "Who is this for"**
- Location: `src/pages/FAQ.tsx:9-10` (`FAQ_ITEMS`) and the duplicated JSX at `:55-65`, plus section title `:81` (`"For Businesses Entering Australia"`).
- Current:
  - `"Market Entry Secrets is Australia's comprehensive platform for businesses looking to enter the Australian market. We connect international companies with local service providers..."`
  - `"Our platform serves international businesses planning to enter Australia, local service providers specializing in market entry, mentors with Australian business expertise, and anyone involved in the market entry ecosystem."`
- Issue: The single most important "what/who" answer names international businesses, providers, and mentors but **not local founders**. Audience B is entirely absent from the platform's own definition. (Note: copy is duplicated between the `FAQ_ITEMS` array and the JSX accordion; both must change.)
- Suggested rewrite:
  - What: `Market Entry Secrets is the intelligence and execution platform for the Australian and New Zealand market. We connect companies with vetted providers, mentors, leads, events, and AI plans, whether they are entering ANZ or scaling within it.`
  - Who: `Our platform serves international companies entering ANZ, Australian and New Zealand founders scaling within their home market, plus the providers and mentors who support them.`
  - Section title `For Businesses Entering Australia` becomes `For Companies Growing in ANZ`.

**Finding 14 — FAQ "getting started" and "timeline"**
- Location: `src/pages/FAQ.tsx:12`, `:14` (and JSX `:87`, `:101`)
- Current: `"How do I get started with my Australian market entry?"` and `"How long does it typically take to enter the Australian market?"`
- Issue: Both questions assume the reader is entering. A local founder has no equivalent question.
- Suggested: add a parallel question such as `"How do I get started if I am already operating in ANZ?"` with an answer pointing to mentors, investors, leads, and the growth report; and reframe the getting-started question to `"How do I get started?"` with a dual answer.

---

### 4.6 Contact — Priority P1 (static, A-only)

**Finding 15 — Contact intro and helper text**
- Location: `src/pages/Contact.tsx:92-94`, `:103`, `:192`, `:265`
- Current:
  - `"Ready to accelerate your Australian market entry? Let's discuss your enterprise needs."`
  - `"Tell us about your market entry goals and we'll create a custom solution for you."`
  - Message placeholder: `"Tell us about your market entry goals, timeline, and any specific challenges you're facing..."`
  - `"Are you a market entry consultant? Join our directory to connect with potential clients."`
- Issue: Every prompt assumes the reader is an inbound entrant; a local founder's "growth goals" are not invited.
- Suggested rewrite:
  - Intro: `Ready to accelerate in the ANZ market? Tell us where you are, entering or scaling, and what you need.`
  - Helper: `Tell us about your goals in the ANZ market and we will create a custom solution for you.`
  - Placeholder: `Tell us about your goals, timeline, and any specific challenges you are facing, whether you are entering ANZ or scaling within it...`
  - Directory line: `Are you a provider or advisor who helps companies grow in ANZ? Join our directory to connect with potential clients.`

---

### 4.7 Pricing (page-level) — Priority P1

The plan cards are persona-aware (good), but the page wrapper's SEO and the default (international) plan copy lean A. Covered by Finding 3 (SEO) and Findings 7 to 10 (default persona). Plan names and descriptions read well once a persona is selected; no separate rewrite needed beyond the default fix.

---

### 4.8 Navigation and Footer — Priority P2

**Finding 16 — Nav descriptions**
- Location: `src/components/navigation/NavigationItems.tsx:42` (`"Source country market guides"`), `:54` (`"Step-by-step entry playbooks"`)
- Issue: Minor A lean in two descriptions; the rest are audience-agnostic.
- Suggested: `Market Entry Guides` description becomes `Step-by-step playbooks for ANZ` and `By Country` becomes `Country market guides` (drops the "source country" entrant assumption).

**Finding 17 — Footer tagline**
- Location: `src/components/Footer.tsx:55`
- Current: `"Your comprehensive platform for dominating the Australian market."`
- Issue: Audience-agnostic and works for both, but "comprehensive platform"/"dominating" softens the intelligence positioning and "Australian" drops NZ. Low priority.
- Suggested (optional): `The intelligence and execution platform for winning in the Australian and New Zealand market.`

---

## 5. Reusable Dual-Audience Messaging Framework

Five canonical lines, grounded in the real copy above, ready to paste into Lovable. None contain em or en dashes.

**R1 — Default/both persona (the core fix).** Introduce a third "default" state in `src/config/personaContent.ts` and `heroContent.ts`, rendered whenever `persona === null`, so the un-toggled home and all non-persona surfaces speak to both. Keep the two existing variants for when a persona is chosen.

- **Hero headline (default):**
  `Win in the Australian and New Zealand market, whether you are entering it or scaling within it.`

- **Hero sub-header (default):**
  `Answer a few questions about your company, sector, and goals. MES combines 500+ vetted providers, real case studies, leads, and AI-powered intelligence to build your plan, whether you are landing in ANZ or growing the business you already run here.`

- **"Who it is for" block (for About and FAQ):**
  `Built for international companies entering ANZ and for Australian and New Zealand founders scaling at home, plus the vetted providers and mentors who support them.`

- **Primary CTA (default):**
  `Create my free report`
  (retain `Create my free market entry report` and `Create my free growth report` for the two selected personas)

- **Meta description (global, for `index.html` and home):**
  `AI-powered intelligence and execution for the ANZ market. 500+ vetted providers, mentors, leads, and custom plans in minutes, whether you are entering Australia and New Zealand or scaling within it.`

**Drop-in vocabulary swaps** (apply wherever a single shared line is needed):
- "Enter the Australian market" to "Win in the ANZ market"
- "market entry plan/report" (in shared contexts) to "your plan/report"
- "international companies" (in shared contexts) to "companies entering or scaling in ANZ"
- "Australian market" to "Australian and New Zealand market" / "ANZ market" (NZ is in scope per the brand but frequently dropped)

---

## 6. Other Observations

- **NZ is routinely dropped.** Most copy says "Australian market" even though the brand and JSON-LD `areaServed` cover Australia and New Zealand. Adding NZ is a cheap, repeated win for both audiences.
- **Duplicated FAQ copy.** `src/pages/FAQ.tsx` holds the same Q&A text twice: once in the `FAQ_ITEMS` array (used for JSON-LD) and once hardcoded in the accordion JSX. Any edit must touch both or the structured data and visible text will diverge. (Functional/maintainability note.)
- **Em dashes are present in existing copy** (e.g. `personaContent.ts` "in minutes, not months", index.html title). Out of scope to change here, but worth a pass if the no-dash rule applies to live copy, not just suggestions.
- **`index.html` Twitter handle is `@lovable_dev`** (`index.html:26`), likely a template default rather than the MES account. (Functional note.)
- **FAQ mentions a mobile app "planned for 2024"** (`FAQ.tsx:167`), now stale. (Functional note.)
- **The persona engine is an asset, not a liability.** The B copy in `startupContent` is specific and on-brand. The entire fix is about defaults and the static/meta layer, not about authoring B copy.

---

## 7. Open Questions and Assumptions

1. **Default behaviour:** Should a brand-new visitor see a neutral/both hero (recommended), or should the site auto-detect and default to A because inbound entrants are the larger commercial segment? This audit assumes 50/50 parity is the goal and recommends a neutral default. If A is intentionally the priority segment, the meta/static fixes (P0/P1) still apply.
2. **Persona persistence:** The chosen persona is stored in `localStorage` (`mes_user_persona`) and reused across the home. Confirm whether static pages (About, FAQ, Contact) should also read this persona to render variant copy, or remain neutral/both. This audit recommends neutral/both for static pages to avoid building a second persona system.
3. **Editing path:** Per the brief, copy is owned and edited via Lovable. These are recommendations only; no source was changed. The exact strings and file:line references are provided so each change can be made directly in Lovable.
4. **NZ scope:** Assumed in-scope based on CLAUDE.md ("Australian/ANZ") and `areaServed: ["Australia", "New Zealand"]`. If the product is Australia-only in practice, ignore the NZ swaps.
