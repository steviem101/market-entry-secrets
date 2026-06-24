# MES — Quick Context (paste-into-chat)

> ~1-page priming block. Paste at the top of a chat when you want an assistant to have the
> essentials fast. Fuller versions: `CLAUDE_PROJECT_PRIMER.md` → `MARKET_ENTRY_SECRETS_EXPLAINER.md`.

**What:** Market Entry Secrets (MES) is a B2B SaaS platform for entering/scaling in the
**Australian/NZ (ANZ)** market. Two halves: (1) a **vetted directory** (service providers,
mentors, investors, events, lead databases, innovation hubs, govt/trade agencies, case studies,
guides) and (2) an **AI report engine** that turns a short intake into a personalised,
citation-backed market-entry plan in ~2–4 min (vs. a consultant's months / $15k–$50k). Live:
market-entry-secrets.lovable.app.

**Who (persona-first):** *International Entrant* (primary — overseas co. entering ANZ) and *Local
Startup* (ANZ founder scaling). Copy, goals, report sections and CTAs all change by persona.

**AI report (`generate-report` edge fn):** Firecrawl deep company scrape + **6 Perplexity**
research queries (landscape `sonar-pro`, regulatory, news, bilateral trade, cost, grants) +
**semantic matching** (embed intake → `match_knowledge` RPC over `mes_knowledge_base`, explainable
weighted scoring, diversity caps) → **Gemini `gemini-3-flash-preview`** section generation →
polish pass → store to `user_reports`. **It only recommends real, vetted records — never invents
providers/clients/citations.**

**Report sections → tier to view** (`reportSectionConfig.ts`):
- **Free:** executive_summary, service_providers, events_resources, action_plan, setup_compliance
- **Growth:** swot_analysis, competitor_landscape, mentor_recommendations, investor_recommendations
- **Scale:** lead_list
- Gated sections are generated but `visible:false`; upgrading unlocks instantly (no regen).

**Pricing (one-time, NOT subscriptions; Stripe `mode:"payment"`):** Free $0 · **Growth $99** ·
**Scale $999** · Enterprise custom. Also sells per-list lead purchases. `user_subscriptions.tier`
is service-role-write-only (no self-upgrade).

**Stack:** React 18 + Vite + TS + Tailwind + shadcn/ui ▸ Supabase (Postgres + Auth + ~24 Deno
edge fns + Storage, ~349 migrations) ▸ Stripe ▸ Firecrawl ▸ Perplexity ▸ Lovable AI Gateway→Gemini
▸ Anthropic Claude (`generate-plan`, `classify-personas`) ▸ Resend email. Supabase project
`xhziwveaiuhzdoutpgrh`.

**Hard rules:** never hand-edit `src/integrations/supabase/types.ts`; cast `(supabase as any)` for
`user_intake_forms`/`user_reports`; no `VITE_*` env vars; writes are service-role-only except
public funnels + RLS-backed owner/admin tables (scope grants on new tables); 1000-row default
query limit; **Australian English** + **HSL design tokens** only; keep the anti-hallucination
guards in any AI feature; introspect `information_schema` before trusting any table list (~70 live).

**Status — built:** directories, 5-phase report engine + RAG + anti-hallucination, intake v2
wizard (persona-first, website-prefill, goal cards, auth-before-generation), 20-sector taxonomy,
country pages + FAQs (Ireland/Japan/Korea/France) + Setup & Compliance section, one-time billing,
email queue, report-quality telemetry → Slack, security/perf hardening.
**Planned:** streaming report progress, Content Studio→KB sync, live persona-aware hero stats,
real email follow-ups, lead-catalog expansion, more country pages (Singapore/UK), edge-fn
rate-limiting, server-side pagination for heavy directory hooks.
