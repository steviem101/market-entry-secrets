# Market Entry Secrets — Claude Project Primer

> Drop this file into the **Market Entry Secrets Claude Project** as knowledge.
> It gives Claude an accurate working model of the product so it can (a) answer questions
> about MES and (b) write high-quality feature prompts/specs for it.
> Long-form source of truth: `docs/MARKET_ENTRY_SECRETS_EXPLAINER.md`.
> Last synced from the codebase: 2026-06-24.

---

## 1. One-paragraph definition

**Market Entry Secrets (MES)** is a B2B SaaS platform that helps companies **enter and scale in
the Australian / New Zealand (ANZ) market**. It combines (1) a **curated, vetted directory** of
ANZ market-entry resources — service providers, mentors, investors, events, lead databases,
innovation hubs, government/trade agencies, case studies, guides — with (2) an **AI report
engine** that turns a short intake form into a personalised, citation-backed market-entry plan in
2–4 minutes (vs. a consultant's months and $15k–$50k). Live at
https://market-entry-secrets.lovable.app.

## 2. Who it's for (persona-first)

The whole product reshapes around a chosen persona (`src/config/personaContent.ts`,
`PersonaContext`):

- **International Entrant (primary):** overseas company entering ANZ. CTA: *"Create My Market
  Entry Report."* Cares about providers, regulation/visas, market sizing, mentors, trade
  agencies, leads, case studies.
- **Local Startup (secondary):** ANZ founder scaling at home. CTA: *"Create My Growth Report."*
  Cares about investors/VCs, accelerators, grants, growth providers, founder network, playbooks.
- **Supply side:** providers/mentors/event organisers list via `/partner`; admins review at
  `/admin/submissions`.

## 3. The two things MES does

1. **Directory (the substrate):** vetted Postgres data, public-read, browsable & filterable.
2. **Report engine (the intelligence layer):** personalises that substrate for one company using
   web scraping + live research + a RAG layer + AI synthesis. **It only recommends real,
   vetted records — it never invents providers/mentors/events.**

## 4. Product surface (routes you can reference)

- **Landing:** `/` (persona toggle, before/after, how-it-works, search, pricing).
- **Report:** `/report-creator` (intake wizard) → `/report/:id` (tier-gated view) →
  `/report/shared/:token` (public share).
- **Directories:** `/service-providers`, `/mentors`, `/events`, `/leads`, `/investors`,
  `/innovation-ecosystem`, `/government-support`, `/content`, `/case-studies`.
- **Taxonomy:** `/locations/:slug`, `/countries/:slug`, `/sectors/:slug`.
- **Member:** `/member-hub` (=`/dashboard`), `/my-reports`, `/bookmarks`, `/mentor-connections`.
- **Trust/info:** `/pricing`, `/about`, `/faq`, `/partner`, `/contact`, `/privacy`, `/terms`.

Directory page pattern: **Hero → Filters → Results grid (12/page)** + freemium gate for anon users.

## 5. The AI report — how it works (so you can reason about report features)

`generate-report` edge function, ~5 phases:

1. **Parallel gather:** Firecrawl deep company scrape; **6 Perplexity** queries (landscape via
   `sonar-pro`, regulatory, news, bilateral trade/funding, cost of business, grants); key-metrics
   extraction; **directory matching**; competitor + end-buyer research; external event discovery.
2. **Enrich** matched providers (Firecrawl).
3. **Generate sections** via **Gemini `google/gemini-3-flash-preview`** (Lovable AI Gateway) from
   templates in `report_templates`; gated sections still generated but `visible:false`.
4. **Polish pass** (one Gemini call: Australian English, de-dupe, consistency).
5. **Store** to `user_reports` with a rich `metadata` block.

**Matching** is semantic-first (embed intake → `match_knowledge` RPC over `mes_knowledge_base`)
with a deterministic array-overlap fallback, then **explainable weighted scoring** (sector,
service fit, location, specialist bonus, **country corridor** origin→target) and
**diversity-capped greedy selection**. Guards: future-dated events only, no inactive/seed
mentors, region filter + title/date/venue de-dupe.

**Report sections & tier to view** (`src/components/report/reportSectionConfig.ts`):

| Section | Tier |
|---|---|
| executive_summary, service_providers, events_resources, action_plan, setup_compliance | **free** |
| swot_analysis, competitor_landscape, mentor_recommendations, investor_recommendations | **growth** |
| lead_list | **scale** |

Upgrading **instantly unlocks** already-generated sections (no regeneration).

## 6. Anti-hallucination stack (a core product value — preserve it in any report feature)

1. **Data-availability disclosure** — model is told which research streams succeeded; never
   invent figures/programs/clients for UNAVAILABLE topics.
2. **Entity hardening** — "only recommend from the list above; do NOT invent." Empty list → honest
   "browse the directory" fallback.
3. **Website-only company extraction** — no inferring clients from team history/partners; emit
   `[]` when unsure.
4. **Citation gating** — `[N]` markers only when Perplexity returned citations.
5. **Practitioner (LinkedIn) signal is background-only** — abstract, never quote/attribute/cite.

## 7. Pricing & monetisation

**One-time payments, not subscriptions** (Stripe `mode:"payment"`; webhook only handles
`checkout.session.completed`):

| Tier | Price | Adds |
|---|---|---|
| Free | $0 | Browse + free report sections |
| Growth | **$99** | SWOT, competitors, mentor & investor matches, unlimited guides |
| Scale | **$999** | Lead list section + leads/TAM marketplace + research tools |
| Enterprise | Custom | Bespoke research, account manager, seats, integrations |

Also monetised: **per-list lead purchases**. Legacy tiers map `premium→growth`,
`concierge→enterprise`. `user_subscriptions.tier` is **service-role-write-only** (no self-upgrade).

## 8. Tech stack & architecture (for feasibility in feature prompts)

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui.
- **Backend:** Supabase (Postgres + Auth + ~24 Edge Functions [Deno, `esm.sh` imports] + Storage)
  on Lovable Cloud. ~349 migrations.
- **External:** Stripe (payments), Firecrawl (scrape), Perplexity (research),
  Lovable AI Gateway→Gemini (generation), Anthropic Claude (`generate-plan`, `classify-personas`),
  embeddings `text-embedding-3-small`, Resend (email).
- **Key files:** `src/integrations/supabase/client.ts`; report API `src/lib/api/reportApi.ts`;
  auth `src/contexts/AuthContext.tsx` + `src/hooks/useAuth.ts`; subscription
  `src/hooks/useSubscription.ts`; report config `src/components/report/reportSectionConfig.ts`;
  intake schema `src/components/report-creator/intakeSchema*.ts`; edge fns
  `supabase/functions/`; shared `supabase/functions/_shared/`.

## 9. Data model (the tables you'll usually touch)

- **Directory:** `service_providers`, `community_members` (mentors), `events`, `lead_databases`
  (+`lead_database_records`), `investors` (+`investors_public`), `innovation_ecosystem`,
  `trade_investment_agencies`.
- **Taxonomy:** `locations`, `countries`, `industry_sectors` (keyword arrays for matching).
- **Content:** `content_items`→`content_sections`→`content_bodies`; country blocks
  (`country_faqs`, `country_playbook_stages`, `country_trade_metrics`, …).
- **User:** `profiles`, `user_roles`, `user_subscriptions`, `bookmarks`.
- **Reports (cast `(supabase as any)`):** `user_intake_forms`, `user_reports`, `report_templates`,
  `intake_form_events`.
- **RAG:** `mes_knowledge_base`, `knowledge_embed_log`.
- **Admin-only read:** `email_leads`, `lead_submissions`, `directory_submissions`,
  `lemlist_contacts/_companies`.
- PII-safe views: `community_members_public`, `investors_public`, `agencies_report_view`.
- ~70 tables live; **introspect `information_schema` before trusting any table list.**

## 10. Hard rules / gotchas (MUST respect when proposing or writing code)

1. **Never hand-edit** `src/integrations/supabase/types.ts` (auto-generated).
2. `user_intake_forms` & `user_reports` are NOT in generated types → always
   `(supabase as any).from('…')`.
3. `directory_submissions` insert = exactly `{ submission_type, contact_email, form_data }`;
   `form_data` is `Json` (pass a structured object).
4. **No `VITE_*` env vars** (Lovable limitation) — use full URLs/keys or Supabase secrets.
5. Edge functions are **Deno** with `esm.sh` imports, not npm.
6. **Writes are service-role-only** since SEC-01/02/03 — except public funnels
   (`directory_submissions`, `email_leads`, `lead_submissions`, `mentor_contact_requests`,
   `intake_form_events`, `user_usage`), `ai_chat_*`, and RLS-backed owner/admin tables. New
   tables get broad default grants — **scope them deliberately.**
7. Supabase default query limit is **1000 rows** — check before assuming "missing data."
8. Array matching uses Postgres overlap `.cs.{}` on `services`/`keywords`/`sector_tags`.
9. **Australian English** in all generated/report content; **HSL design tokens** only (no
   hardcoded hex in components).
10. In any report/AI feature, **keep the anti-hallucination guards** (§6) — never let the model
    invent directory entries, clients, figures, or citations.

## 11. Status: built vs. coming

**Built:** core directories; AI report engine (5-phase) with RAG matching + anti-hallucination;
intake v2 wizard (persona-first, website-prefill, goal cards, auth-before-generation,
instrumentation); 20-sector taxonomy; mentor enrichment; country pages + FAQs (Ireland, Japan,
Korea, France) + Setup & Compliance section; one-time Stripe billing; transactional email +
queue; report-quality telemetry → Slack; security/perf hardening.

**In-flight / planned:** streaming report progress (realtime); Content Studio→KB continuous sync;
live persona-aware hero stats; real email follow-ups + telemetry; lead-catalog expansion; more
country pages (Singapore, UK likely next); rate-limiting all edge functions; server-side
pagination for heavy directory hooks.

## 12. How to write a good MES feature prompt (use this template)

When asked to draft a feature prompt/spec for MES, produce something like:

```
## Feature: <name>
**Persona / audience:** international entrant | local startup | admin | supply-side
**Where it lives:** route(s) + component/page + any edge function
**User story:** As a <persona>, I want <capability> so that <outcome>.

**Behaviour:**
- <step-by-step UX, following Hero → Filters → Results for directories,
  or the wizard pattern for intake>
- Tier/gating: which tiers see what (free/growth/scale/enterprise)
- Persona variations (copy/goals/sections differ by persona)

**Data & backend:**
- Tables read/written (respect RLS + service-role-only writes; cast (supabase as any) for
  user_intake_forms/user_reports)
- New migration? scope grants deliberately; never edit generated types
- Edge function? Deno + esm.sh; auth pattern (verify_jwt or in-code); CORS via _shared/http.ts

**If it touches the report/AI:**
- Which section(s) of reportSectionConfig.ts; which template variables
- Preserve anti-hallucination guards (only vetted data; citation gating; data-availability
  disclosure); Australian English; 250–550 words/section
- Matching: semantic-first via mes_knowledge_base + explainable scoring

**Design:** Tailwind semantic/HSL tokens, shadcn/ui, mobile-first (390px), <Layout> + Helmet SEO.
**Acceptance criteria:** <testable bullets>
**Out of scope / non-goals:** <bound it>
```

**Checklist before finalising any MES feature prompt:**
- [ ] Persona-aware? (does copy/behaviour change for entrant vs. startup?)
- [ ] Tier-gating defined?
- [ ] RLS / write-grant implications named? (service-role-only writes)
- [ ] Generated types untouched; `(supabase as any)` for report tables?
- [ ] If AI: anti-hallucination guards preserved + Australian English?
- [ ] Mobile-first + HSL tokens + `<Layout>`/SEO?
- [ ] Mentions which existing file(s)/route(s) it extends, not greenfield by default?

## 13. Fast facts for answering questions

- **What is MES?** ANZ market-entry directory + AI report platform.
- **Who runs the report?** `generate-report` edge fn; Firecrawl + Perplexity + RAG + Gemini.
- **Why trust it?** Matches come from a vetted DB; layered anti-hallucination; citation gating.
- **Billing?** One-time payments (Free / $99 / $999 / custom) + lead-list purchases. No renewals.
- **Personas?** International entrant (primary) + local startup.
- **Sections free vs paid?** Free: exec summary, providers, events, action plan, setup &
  compliance. Growth: SWOT, competitors, mentors, investors. Scale: lead list.
- **Geographic scope?** Australia & New Zealand.
- **Marketing stats (500+ providers, 1,200+ contacts, 94% success)** are positioning figures, not
  guaranteed live DB counts.
