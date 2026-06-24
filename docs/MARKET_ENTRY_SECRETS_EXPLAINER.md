# Market Entry Secrets — The Mega Explainer

> A comprehensive, code-grounded explainer of what Market Entry Secrets is, who it serves,
> how it works, what's been built, and where it's going. Written for humans and for AI
> assistants that need a deep mental model of the product.
>
> Companion file: `docs/CLAUDE_PROJECT_PRIMER.md` (the condensed version to drop into a
> Claude Project). This file is the long-form source of truth behind that primer.
>
> Source: derived from the live codebase (frontend `src/`, edge functions
> `supabase/functions/`, 349 migrations, `docs/`, and the full git history as of 2026-06-24).

---

## 0. TL;DR (read this first)

**Market Entry Secrets (MES)** is a B2B SaaS platform that helps companies **enter and scale in
the Australian / New Zealand (ANZ) market**. It does two things at once:

1. **A curated directory + intelligence platform** — thousands of vetted service providers,
   mentors, investors, events, lead databases, innovation hubs, government/trade agencies,
   case studies and guides, all organised by location, source country, and industry sector.
2. **An AI market-entry report engine** — a 3-step intake wizard feeds a multi-phase AI
   pipeline (Firecrawl scraping + Perplexity research + a RAG layer over MES's own data +
   Gemini synthesis) that produces a personalised, citation-backed market-entry plan in
   **2–4 minutes** instead of the **3–6 months and $15k–$50k** a consultant would charge.

It serves **two personas**: *international entrants* (overseas companies coming into ANZ) and
*local startups* (ANZ founders scaling at home). The business model is **one-time payments**
(not subscriptions): Free → Growth ($99) → Scale ($999) → Enterprise (custom). Tier gates which
report sections and directory data you can see.

**Positioning line:** *"AI-powered intelligence for the ANZ market. 500+ vetted providers,
mentors, leads, and custom plans in minutes — whether you're entering Australia or scaling
within it."*

**One-sentence mission (from the About page):** *"To democratise access to the insider
knowledge and expert connections that make success in the ANZ market repeatable."*

---

## 1. What Market Entry Secrets Is

### 1.1 The core idea

Entering a new country market is slow, expensive, and full of unknowns: which lawyer/accountant
to trust, what the regulations are, who the competitors are, where the customers are, which
grants apply, who can mentor you, what events to attend, what it costs. Companies traditionally
solve this by hiring management consultants ($15k–$50k) and spending months on manual research.

MES collapses that into a **self-serve intelligence platform + an AI report** that:

- **Knows the ANZ ecosystem** (it has a hand-curated, vetted database of the players), and
- **Knows your company** (it scrapes your website and asks you targeted questions), and
- **Stitches the two together** into a grounded, personalised plan with real, clickable matches
  to providers, mentors, investors, events and lead lists — plus market research, a SWOT, a
  competitor landscape, a setup/compliance guide and an action plan.

### 1.2 The two products in one

| | **The Directory** | **The Report Engine** |
|---|---|---|
| What | Browse vetted ANZ market-entry resources | Generate a bespoke AI market-entry plan |
| Entry point | `/service-providers`, `/mentors`, `/events`, `/leads`, `/investors`, etc. | `/report-creator` → `/report/:id` |
| Value | Discovery, research, shortlisting | Synthesis, strategy, matched introductions |
| Data | Curated Postgres tables, public read | Same data, RAG-matched + AI research layered on top |
| Monetisation | Freemium view gates + lead-list purchases | Tier gates on report sections |

The directory is the **substrate** (vetted, real data). The report engine is the **intelligence
layer** that personalises that substrate for one company's situation. Critically, the report
**never invents** providers/mentors/events — it only recommends from the vetted database (see
§5.5 Anti-hallucination).

### 1.3 Published surface

- **Live URL:** https://market-entry-secrets.lovable.app
- **Built on:** Lovable Cloud (a managed Supabase + Vite/React environment)
- **Supabase project:** `xhziwveaiuhzdoutpgrh` ("MES Platform" — the only project in scope)
- **Out of scope:** a sibling "Content Studio" project (`rcgaviwbsudouvfwzydq`) that *feeds*
  content into MES but is never written to from this repo.

---

## 2. The Aim — what problem it's solving and why

### 2.1 The before / after (the product's own framing)

The homepage is built around a **before/after** narrative that differs by persona.

**International entrant — "the painful way":** manual research across dozens of tabs, expensive
consultants, strategy by guesswork, cultural missteps, no idea who to trust.
**→ After:** 500+ vetted providers, 200+ mentors, 100+ lead lists, TAM maps, 50+ monthly events,
a custom AI plan in minutes.

**Local startup — "the fragmented founder experience":** scattered tools, cold investor lists,
no curated advisor network, generic growth advice.
**→ After:** a curated local growth stack — investors, accelerators, mentors, grants, founder
network, growth playbooks.

### 2.2 The aim, stated plainly

- **Democratise insider knowledge.** Make the playbook that big consultancies sell repeatable
  and affordable.
- **De-risk and accelerate entry/scaling.** Compress months of research into minutes.
- **Connect, not just inform.** Every insight links to a real, vetted person/provider/dataset
  you can act on.
- **Be the system of record for ANZ market entry** — directory + data + AI + community.

### 2.3 The economic pitch (verbatim anchor)

The pricing section anchors against consultants:
> *"Traditional consulting: $15,000–$50,000"* vs. *"MES Growth plan: $99 in 3 minutes."*

---

## 3. Target Audience

MES is **persona-first**. The user picks their path up front and the entire site (headlines,
stats, goals, report sections, CTAs) reshapes around it. This is implemented via
`PersonaContext` + `useSectionPersona()` reading `src/config/personaContent.ts`.

### 3.1 Persona A — International Entrant (primary, ~the dominant use case)

- **Who:** An overseas company (Singapore, Ireland, Japan, South Korea, UK, US, India, Germany,
  France, Canada, NZ, etc.) wanting to enter Australia/NZ.
- **Top source countries observed in real intake data:** Singapore, Ireland, Japan, Australia.
- **Jobs to be done:** find vetted providers, understand regulation/compliance & visas, size the
  market, find mentors & trade agencies, get lead lists, learn from case studies, find events.
- **CTA:** *"Create My Market Entry Report."*

### 3.2 Persona B — Local Startup (built, secondary)

- **Who:** An Australian/NZ founder scaling within their home market.
- **Jobs to be done:** find investors/VCs & accelerators, grants & R&D incentives, growth-stage
  service providers, co-working/hubs, mentors, founder network, scaling playbooks, lead lists.
- **CTA:** *"Create My Growth Report."*

### 3.3 Secondary audiences (supply side)

- **Service providers / mentors / event organisers** — partners who get listed (via `/partner`)
  to reach pre-qualified inbound. Referral incentives are advertised ($500 provider, $200 mentor,
  $100 event referral).
- **Admins** — internal team reviewing submissions (`/admin/submissions`) and monitoring report
  quality telemetry.

---

## 4. What It's All About — the product surface (sections)

### 4.1 The landing page (`src/pages/Index.tsx`)

Persona-aware sections, in order: **Hero** (with persona toggle + animated stat cards) →
**Before/After** → **How It Works (3 steps)** → **Master Search** → **Value cards** (links to the
directories) → **Testimonials** → **Pricing** → **Final CTA** + a sticky "Start My Report" button.

> Marketing stat figures (e.g. "500+ providers", "1,200+ contacts", "94% success rate", "2,075
> resources") are **display/marketing values** in `personaContent.ts` and the About page — treat
> them as positioning, not verified live DB counts. (There is a `PLAN.md` proposal to make the
> hero stat row read live `count(*)` from the DB per persona; not yet shipped.)

### 4.2 The directories (the curated substrate)

All directory pages follow the same pattern: **Hero → Filters → Results grid/list**, 12 per
page, with a freemium view gate for anonymous users.

| Directory | Route | What it is |
|---|---|---|
| **Service Providers** | `/service-providers` | Vetted legal, accounting, HR, recruitment, consulting, marketing, tech, immigration, insurance firms. Filter by location, type, sector, verified. |
| **Mentors / Advisors** | `/mentors` (`community_members`) | Experienced operators who've done ANZ market entry/scaling. Profiles with company logos (logo.dev), expertise tags, "request intro" modal. |
| **Events** | `/events` | Conferences, workshops, webinars, networking, accelerators. Two sources: **Curated** (editorial) and **Community** (weekly scrape). Upcoming/Past/All tabs. |
| **Lead Databases** | `/leads` (`lead_databases`) | Pre-verified B2B contact lists by sector/geography, priced in AUD, with preview + Stripe checkout. |
| **Investors** | `/investors` (447 rows; `investors_public` view hides PII) | VCs, angels, accelerators, grant providers, venture debt. Filter by type, stage, sector. |
| **Innovation Ecosystem** | `/innovation-ecosystem` | Incubators, accelerators, innovation hubs, coworking. |
| **Government & Trade Agencies** | `/government-support` (`trade_investment_agencies`) | Government bodies, industry associations, chambers, bilateral trade orgs. |
| **Content / Guides** | `/content` | Expert guides, articles, success stories (`content_items` + sections/bodies). |
| **Case Studies** | `/case-studies` | Real companies' entry/scale stories, with revenue impact, time-to-market, cost. |

### 4.3 The taxonomy (how content is organised)

Three cross-cutting "lenses" let users browse the same substrate by different axes. Each has
keyword arrays (`service_keywords[]`, `event_keywords[]`, `content_keywords[]`, `lead_keywords[]`,
`key_industries[]`) used to match resources to the page.

| Lens | Route | Organises by |
|---|---|---|
| **Locations** | `/locations`, `/locations/:slug` | ANZ cities/states/regions (Sydney, Melbourne, Brisbane…) |
| **Countries** | `/countries`, `/countries/:slug` | Source country of origin (Ireland, Japan, Singapore, Korea, France…), with country-specific FAQ/playbook/metrics content blocks |
| **Sectors** | `/sectors`, `/sectors/:slug` | Industry sector (fintech, healthtech, SaaS, agtech…) |

### 4.4 The Report Creator (the intake wizard)

Two implementations exist: `ReportCreator` (v1) and `ReportCreatorV2` (the redesigned wizard).
The v2 schema lives in `src/components/report-creator/intakeSchema.v2.ts`.

**Flow:** Persona select → Step 1 Company → Step 2 Goals → Step 3 Details → Review → Generate.

- **Step 1 — Company:** website-first (offers a Firecrawl scrape to auto-fill name, industry,
  country, stage), industry sector (multi-select from a ~152-option LinkedIn taxonomy with ~50
  popular defaults), company stage, employee count, revenue stage, target ANZ regions.
- **Step 2 — Goals:** 20+ goal cards grouped into **5 categories** — People & network, Capital &
  funding, Knowledge & research, Compliance & risk, Operations & setup. Each goal card shows
  *"→ unlocks {section}"*; 2–3 are pre-selected per persona+industry; capped ~6 picks.
- **Step 3 — Details:** timeline, budget level, **target customer profile** (type B2B/B2C,
  size, buying motion, industries, named companies), **known competitors** (autocomplete by
  name or pasted website), **challenge tags** + free text, and the high-leverage
  **report_focus** ("what's the one thing?") free-text field.
- **Review → Generate:** inline-editable summary; auth is required **before** generation (see
  §9 history — this fixed a 27% abandonment leak); a live "generating" screen shows real phases.

Each selected goal maps to which **report sections** get emphasised (see `goalServiceTags.ts`
`GOAL_SECTION_MAP`).

### 4.5 The Report View (`src/pages/ReportView.tsx`)

Renders the stored report JSON, section by section, with **tier gating**: gated sections are
generated but stored `visible: false`, and upgrading **instantly unlocks** them (no
regeneration). Public sharing is available via a `share_token` and the
`get_shared_report(share_token)` RPC (`/report/shared/:shareToken`).

### 4.6 The Member experience

- **Member Hub / Dashboard** (`/member-hub`, `/dashboard`): bookmarks, reports, mentor
  connections, lead management (stub), TAM maps (coming soon), activity feed (coming soon).
- **My Reports** (`/my-reports`): list of generated reports with status + tier-at-generation.
- **Bookmarks** (`/bookmarks`): saved items across all entity types.
- **Mentor Connections** (`/mentor-connections`): mentors surfaced from reports, with
  pending/requested/connected status.

### 4.7 Trust / info pages

`/about`, `/faq`, `/contact`, `/partner`, `/pricing`, `/privacy`, `/terms`.

---

## 5. The AI Report Engine (the heart of the platform)

The report is produced by the `generate-report` edge function (~1,500+ lines) plus helper
modules. It authenticates in-code (JWT + ownership), and is rate-limited (≈5 reports/hour/user).

### 5.1 The pipeline (5 documented phases)

**Phase 1 — Parallel data gathering** (everything below runs concurrently):

1. **Deep company scrape** (`enrichCompanyDeep`): Firecrawl **Map** discovers key pages →
   **Scrape** homepage + 2 key pages → Lovable AI extracts a *conservative, website-only*
   structured profile (summary, industry, maturity, products, explicit key_clients, USPs).
2. **Perplexity market research** — 6 parallel queries, persona-forked:
   landscape (`sonar-pro`, sized to the **specific niche**, must emit `KEY METRICS` lines),
   regulatory/compliance, recent news (last ~6 months), bilateral trade / funding,
   cost of doing business, grants & incentives.
3. **Key-metrics extraction** — parse the `METRIC: label | value | context` lines from the
   landscape text into structured `key_metrics`.
4. **Directory matching** (semantic-first, see §5.2) over ~9 tables.
5. **Competitor research** — scrape user-named competitors + Firecrawl search for more.
6. **End-buyer research** — scrape up to 3 buyer sites + Perplexity procurement query.
7. **External event discovery** — only if the DB returned <3 events, Firecrawl-search for more.

**Phase 2 — Service-provider enrichment:** matched providers get a Firecrawl website scrape to
enrich their descriptions.

**Phase 3 — AI section generation:** fetch the section templates from `report_templates`, render
each with the gathered variables, and generate content via **Lovable AI Gateway → Gemini
(`google/gemini-3-flash-preview`)**, temperature ~0.4. Gated sections are still generated but
marked `visible:false`. The report is **saved immediately** (before polish) to survive worker death.

**Phase 4 — Polish pass:** all visible sections go through one more Gemini call for Australian
English, de-duplication across sections, and consistency. Best-effort with a timeout; on failure
the unpolished version stands.

**Phase 5 — Storage:** report JSON written to `user_reports` with status `completed`/`failed`
plus a rich `metadata` block (tables searched, match counts, Perplexity health/citations,
Firecrawl stats, key metrics, timing).

### 5.2 The matching engine (semantic-first, deterministic fallback)

- **Path A — semantic:** embed the intake as natural language (`text-embedding-3-small`), call
  the `match_knowledge` RPC against **`mes_knowledge_base`** (the unified RAG index), group by
  source table, hydrate full rows, then apply correctness guards.
- **Path B — array overlap (fallback):** deterministic Postgres array-overlap on `sector_tags` /
  `services` + location `ilike`.
- **Scoring & selection** (`matchScoring.ts`): a weighted score combines own-sector match,
  sells-to-sector, service/skill fit, location, specialist bonus, **country corridor** (origin →
  target), and trade direction — then a **greedy diversity-capped selection** (e.g. max 1 per
  person, max 2 per company) with a "specialist guarantee."
- **Correctness guards:** drop inactive/anonymous/seed mentors; **future-dated events only**;
  title|date|venue de-dupe (no four near-identical Melbourne pitch nights); region hard-filter.

This is what makes matching **explainable and grounded** rather than vibes-based.

### 5.3 The RAG / knowledge-base layer (`mes_knowledge_base`)

A single embedded index over **all** MES entities (providers, mentors, events, content,
ecosystem, agencies, investors, lead databases) **plus** synced LinkedIn posts from the Content
Studio (`source_project='content_creator'`).

- **Embeddings** generated by the cron-driven `embed-knowledge` function (stale rows where
  `embedded_hash != content_hash`, capped per run), logged to `knowledge_embed_log`.
- **Search** via the `match_knowledge` SECURITY DEFINER RPC: vector + keyword + visibility
  filtering. **Visibility gating** (`public` / `member` / `paid`) is enforced *in the RPC*, never
  assumed from the caller.
- **PII-stripped** content (emails/phones removed) before embedding.
- `knowledge-search` is the canonical standalone endpoint; `embed-knowledge` does the embedding.

### 5.4 The report sections and tier gates

Defined in `src/components/report/reportSectionConfig.ts`. Sections are generated for everyone
but **shown** based on tier (`TIER_HIERARCHY = free < growth < scale < enterprise`).

| Section | Tier to view |
|---|---|
| `executive_summary` | **free** |
| `service_providers` | **free** |
| `events_resources` | **free** |
| `action_plan` | **free** |
| `setup_compliance` (Setup & Compliance Guide, built from `country_faqs`) | **free** |
| `swot_analysis` | **growth** |
| `competitor_landscape` | **growth** |
| `mentor_recommendations` | **growth** |
| `investor_recommendations` | **growth** |
| `lead_list` | **scale** |

> Note: the CLAUDE.md schema doc lists an older 8-section set; the live config above (10
> sections, incl. `setup_compliance` and `investor_recommendations`) is the current truth.

### 5.5 Anti-hallucination — the grounding stack

This is a deliberate, layered defence and a key product differentiator:

1. **Data-availability disclosure** — before generation, the model is told exactly which research
   streams succeeded; for any UNAVAILABLE topic it must *not* invent figures, program names,
   percentages, named clients or partners.
2. **Entity hardening** — every directory section ("only recommend from the list above; do NOT
   invent providers/mentors/events"). Empty list → an honest "browse the directory" fallback.
3. **Website-only extraction** — the company-profile extractor forbids inferring clients from
   team members' past employers, partners, integrations, press, investors; "when in doubt, emit
   `[]`."
4. **Citation gating** — `[N]` markers are only allowed when Perplexity actually returned
   citations; otherwise the model is told to use none (no phantom citations).
5. **Semantic correctness guards** — the RAG path mirrors the overlap path's filters (no stale
   events, no seed mentors, region/dedupe).
6. **Practitioner-signal guardrail** — synced LinkedIn posts are "background only": abstract &
   combine in your own words, never quote, never attribute, never cite.

### 5.6 The actual prompts (illustrative)

Section prompts live partly in the DB (`report_templates.prompt_body`) and partly as system-prompt
scaffolding in the edge function. They share a structure: **company context → matched entities
(as JSON) → real research data → strict do/don't rules → formatting (Markdown, 250–550 words)**.

Representative excerpts (trimmed):

- **Executive summary:** *"Write a compelling 3–4 paragraph executive summary that opens with the
  value proposition + market opportunity… NOTE: high-level overview only. Do NOT include detailed
  SWOT, competitor analysis, or action plans. Use **bold** for key statistics."*
- **Service providers:** *"Here are VERIFIED service providers from our directory:
  {{matched_providers_json}}. IMPORTANT: Only recommend from the list above. Do NOT invent
  providers. If the list is empty: 'We did not find matching providers. Browse /service-providers.'"*
- **Company extractor system prompt:** *"You are an analyst extracting verifiable facts from a
  company's own website. Return only valid JSON… Be conservative — when in doubt, omit."*

### 5.7 Sibling AI functions

- `generate-plan` — a lighter tactical plan generator using **Anthropic Claude** + Perplexity
  (directory data only, no deep scrape).
- `scrape-company` — the Step-1 website auto-fill (Firecrawl + AI), SSRF-guarded & rate-limited.
- `classify-personas` — classifies community-member archetypes (Anthropic).
- `enrich-*` — admin tools to enrich content/investors/ecosystem via Firecrawl + AI.

---

## 6. Pricing & Business Model

**One-time payments, not subscriptions.** `create-checkout` uses Stripe `mode: "payment"`, so a
tier (or a lead-list purchase) is a one-time charge granting access indefinitely. There are no
renewals, no `customer.subscription.*` events; the webhook only handles
`checkout.session.completed`. `user_subscriptions` stores just `(user_id, tier)`.

| Tier | Price | Unlocks |
|---|---|---|
| **Free** | $0 | Browse directories; AI report's free sections (exec summary, providers, events, action plan, setup & compliance) |
| **Growth** | **$99** (one-time) | + Full report: SWOT, competitor landscape, mentor & investor matches; unlimited guides/case studies; sample lead packs |
| **Scale** | **$999** (one-time) | + Curated lead list section; full leads/TAM marketplace; competitor/end-buyer research tools; onboarding; quarterly intel |
| **Enterprise** | Custom | + Bespoke research, dedicated account manager, team seats, priority intros, custom exports/integrations |

- **Tier display price** is centralised in `src/lib/tierPricing.ts` (`growth:$99`, `scale:$999`).
- **Legacy tier mapping:** `premium → growth`, `concierge → enterprise`.
- **Security note (SEC-01):** `user_subscriptions.tier` is **service-role-write-only** — clients
  cannot self-upgrade. Tier changes flow only through the Stripe webhook.
- Additional revenue: **lead-list purchases** (per-list Stripe checkout) and partner/referral.

---

## 7. Technical Architecture

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn/ui |
| Backend | Supabase (Postgres, Auth, Edge Functions, Storage) via Lovable Cloud |
| Payments | Stripe (one-time checkout + webhook) |
| Web scraping | Firecrawl (map / scrape / search) |
| Real-time research | Perplexity (`sonar`, `sonar-pro`) |
| Content generation | Lovable AI Gateway → Gemini (`google/gemini-3-flash-preview`) |
| Other AI | Anthropic Claude (`generate-plan`, `classify-personas`); embeddings (`text-embedding-3-small`) |
| Email | Resend, via a code-based blue-branded `_shared/email/` module + a cron email queue |
| CRM/data | Lemlist sync; GetLeads-style lead catalog |

- **~24 edge functions** in `supabase/functions/`, with shared modules in `_shared/`
  (`http.ts` CORS, `log.ts` logging, `auth.ts` `requireAdmin`, `email/`).
- **349 migrations** — schema is migration-driven; never hand-edit the generated
  `src/integrations/supabase/types.ts`.
- **Build/type gotchas:** `user_intake_forms` & `user_reports` are not in the generated types —
  always cast `(supabase as any)`. No `VITE_*` env vars (Lovable limitation). Default query limit
  is 1000 rows.

---

## 8. Data Model (the important tables)

- **Directory:** `service_providers`, `community_members`, `events`, `leads`/`lead_databases` +
  `lead_database_records`, `innovation_ecosystem`, `trade_investment_agencies`, `investors`
  (+ `investors_public` view), `country_trade_organizations`.
- **Taxonomy:** `locations`, `countries`, `industry_sectors` (each with keyword arrays).
- **Content:** `content_items` → `content_sections` → `content_bodies`; `content_categories`,
  `content_company_profiles`, `content_founders`; country-page blocks (`country_faqs`,
  `country_playbook_stages`, `country_trade_metrics`, `country_case_studies`,
  `country_funding_instruments`).
- **User/auth:** `profiles`, `user_roles` (admin/moderator/user), `user_subscriptions`,
  `bookmarks`.
- **Reports (cast `(supabase as any)`):** `user_intake_forms`, `user_reports`,
  `report_templates`, plus `intake_form_events` (funnel analytics).
- **RAG:** `mes_knowledge_base`, `knowledge_embed_log`.
- **Lead/CRM (admin-only read):** `email_leads`, `lead_submissions`, `directory_submissions`,
  `lemlist_contacts`, `lemlist_companies`.
- **Other:** `payment_webhook_logs`, `user_usage` (freemium gate), `testimonials`, `ii_*` (Irish
  Insights pipeline).

**Security model:** RLS everywhere; directory tables public-read; PII-safe views
(`community_members_public`, `investors_public`, `agencies_report_view`). After the SEC-01/02/03
lockdown (Jun 2026), **writes are service-role-only** except the public submission funnels and
RLS-backed owner/admin tables. New tables get broad default grants — scope them deliberately.

---

## 9. What We've Done To Date (history)

Active, intense development window (this repo's tracked history): **June 7 – June 24, 2026**,
~113 commits, shipped via numbered PRs with acceptance criteria. The major workstreams:

1. **Intake v2 redesign (Phases 0–5)** — the biggest UX overhaul. Driven by real data from ~59
   intakes (61% non-AU mobile; 27% abandonment at the auth gate; <40% completion on key
   free-text fields). Delivered: persona-first entry, website-prefill, goal cards grouped into 5
   categories, structured-then-free inputs, **auth moved before generation** (closed the 27%
   leak), inline-editable review, and full funnel instrumentation (`intake_form_events`).

2. **Report quality & semantic matching** — the unified **RAG layer** (`mes_knowledge_base`),
   semantic directory matching, a canonical **20-sector taxonomy** mapped from the 152-term
   LinkedIn taxonomy, rebalanced **explainable** scoring, country-corridor matching, and the
   **anti-hallucination** stack (data-availability disclosure, entity hardening, citation gating).

3. **Mentor directory & enrichment** — company logos (logo.dev) for 168 companies, profile
   polish, PII-safe `community_members_public` view, archetype classification.

4. **Geographic & content expansion** — Ireland country page; **Japan, South Korea, France**
   FAQs + country rows; a new **Setup & Compliance Guide** report section synthesised from
   `country_faqs`; LinkedIn corpus synced into the KB for synthesis.

5. **Mobile & accessibility** — 390px-first responsive fixes across report header, directory
   cards, intake; ARIA roles, 44px hit targets, labelled icon controls.

6. **Observability** — report-quality telemetry → Slack `#report-quality` + weekly rollup;
   Slack activity notifications via an event bus.

7. **Security & performance hardening** — the SEC-01/02/03 write-grant lockdown, `WITH CHECK`
   constraints on funnel inserts (SEC-04), dropped public storage file-listing policies (SEC-07),
   FK indexes + `auth.uid()` InitPlan hoisting (PERF-01), legacy table cleanup (SCHEMA-03).

8. **Transactional email** — a code-based, blue-branded email module + cron-driven queue
   (replacing dashboard templates).

Earlier (pre-June, evidenced by migrations/`docs/`): the core directory build, bulk data imports
& enrichment (Australian failures, Irish/Singapore/UK tiers, investors, case studies), the
initial report pipeline, Stripe integration, and a March 2026 security audit.

---

## 10. Where We Want To Go (roadmap)

Synthesised from `docs/`, `PLAN.md`, backlogs, and recent commit direction. Treat as *direction*,
not commitment.

**Near-term / in-flight**
- **Streaming progress** for report generation — write real phase events and subscribe via
  Supabase realtime (replace the indeterminate "2–4 min" screen with honest progress).
- **Content Studio → KB sync (ii-extraction)** — wire the sibling Content Creator project's
  guides/case studies/LinkedIn corpus continuously into `mes_knowledge_base`.
- **Hero stats → live, persona-aware, clickable** (the `PLAN.md` proposal).
- **Email follow-ups** — finish wiring real Resend follow-ups + open/click telemetry.
- **Lead catalog expansion** — richer `lead_databases` coverage and pricing/coverage metadata.

**Security/hardening still open**
- Rate-limiting across all external-API-calling edge functions.
- Continued audit follow-through (share-token access via RPC, etc.).

**Growth bets**
- More **country pages** (Singapore, UK are the obvious next from usage data).
- Deeper **matching quality** A/B testing using the telemetry.
- Possibly consolidating the two personas into one configurable flow.

**Known technical debt to watch**
- Several directory hooks fetch whole tables client-side then filter in JS — needs server-side
  pagination/filtering as data grows.
- Sector matching still leans on alias regexes; candidate for a cleaner ontology/ML approach.

---

## 11. Brand, Voice & Positioning

- **Name:** Market Entry Secrets (MES). **Tone:** confident, practical, "insider knowledge made
  accessible." Outcome-oriented ("in minutes, not months"), not academic.
- **Geographic scope:** Australia & New Zealand (ANZ).
- **Promise:** vetted, real, actionable — every insight ties to a real person/provider/dataset.
- **Two-audience messaging** (rebalanced Jun 2026): equally speaks to international entrants *and*
  local ANZ builders.
- **Australian English** in all generated content (organise, labour, recognise).
- **Design tokens:** primary blue ≈ `#1AA3E0`, Plus Jakarta Sans; all colours HSL, semantic
  Tailwind tokens (no hardcoded hex in components).

---

## 12. Quick-reference cheat sheet

- **What:** ANZ market-entry directory + AI report platform.
- **Who:** international entrants (primary) + local ANZ startups (secondary).
- **How a report is made:** intake wizard → Firecrawl scrape + 6 Perplexity queries + RAG
  matching over vetted data → Gemini section generation → polish → tier-gated render.
- **Why it's trustworthy:** matches come from a vetted DB; layered anti-hallucination guards;
  citation gating.
- **Money:** one-time payments — Free / $99 Growth / $999 Scale / custom Enterprise; plus lead-list
  purchases.
- **Stack:** React+Vite+TS+Tailwind+shadcn ▸ Supabase ▸ Stripe ▸ Firecrawl ▸ Perplexity ▸ Gemini
  (Lovable AI Gateway) ▸ Anthropic ▸ Resend.
- **Golden rules for building:** don't hand-edit generated types; cast `(supabase as any)` for
  report tables; scope new table grants; never invent directory data in prompts; Australian
  English; HSL design tokens.
