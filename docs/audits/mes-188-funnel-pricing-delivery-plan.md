# MES-188 — Funnel, pricing & concierge model: delivery plan (for review)

> **Ticket:** MES-188 · **Date:** 2026-07-15 · **Gate stage: Plan** (nothing below is implemented)
> Companion to the audit: [`mes-188-upgrade-funnel-tier-gating-audit.md`](mes-188-upgrade-funnel-tier-gating-audit.md).
> This plan supersedes the audit's provisional numbers where they differ (notably: **Scale
> includes 2 warm mentor introductions**, not 5; the optional partial-mentor-gating ticket T6 is
> dropped). Per CLAUDE.md §11 this whole programme sits in approval-gated territory
> (payments/entitlements/RPCs) — **no implementation starts until this plan is signed off.**

## 1. The product decision this plan delivers

Tier model v2 — each tier is a relationship depth, not a feature list:

| | **Free** | **Growth (reprice ~$199)** | **Scale $999** |
|---|---|---|---|
| Story | **See the ecosystem** | **We get you in the room** | **We hand you the pipeline** |
| Report sections | Everything except Leads + Mentor Matching (+ First Customers, pending D1) | Everything except Leads (+ First Customers, pending D1) | Everything |
| Ecosystem warm intros (providers / innovation hubs / trade agencies) | Open enquiry form only (existing `WarmIntroModal` funnels — stays free: it's MES lead-gen and partner deal flow) | **Concierge: advisor-made, report-briefed, meeting set up — capped at 3** | Priority concierge, effectively uncapped, sequenced in the strategy session |
| Mentor matching | Locked (teaser: match count + one blurred card) | Full section + **1 warm mentor intro** | Full section + **2 warm mentor intros** |
| Human touch | — | **20–30 min report walkthrough call** (intros get booked on the call; natural Scale upsell moment) | **60-min advisor strategy session** |
| Leads | Locked (teaser: sample rows per #153) | Locked (teaser) | **Full lead list + delivered into their platform** (CSV / Lemlist push MVP) |

Service scoping (applies to every human deliverable, to keep a one-time payment a one-time cost):
intros and sessions must be requested/booked within **30 days** of purchase; consumed services are
the non-refundable portion of any refund (interlocks with #47).

Funnel principles carried over from the audit (unchanged): report-first entry stays exactly as-is
(no wall before the free report — verified none exists today); the three-way offer appears only at
the Review-step order-bump and the generating-screen comparison; in-report locked teasers remain
the primary upsell; matching stays independent of any partner economics, with partner
relationships disclosed.

## 2. Decisions needed before implementation (Phase 0 — product/founder, no code)

| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | `first_customers` placement — the ticket's "everything else free" predates this section; it contains named target accounts (a mini lead list) | Treat as part of the Leads family: gate at **Scale** (or cap: top 2 accounts free). Do **not** free it |
| D2 | `investor_recommendations` free? | **Yes** — investors are publicly browsable (`investors_public`); lock only what's scarce off-platform |
| D3 | Growth price point | **$199** (covers the walkthrough call; $99 is negative-margin with human time attached). Alternatives: $149 / $249 |
| D4 | Intro caps | Growth: 1 mentor + 3 ecosystem · **Scale: 2 mentor** + priority ecosystem · 30-day window — **confirmed in review conversation** |
| D5 | Refund policy for consumed services (session held, intros made) | Non-refundable portion, stated at checkout; align with #47 before any money-back guarantee |
| D6 | Partnership shortlist + SLA | Formalise the 20–30 providers/hubs/agencies appearing most in generated reports first; named receiving contact + response SLA per partner; disclosure line agreed |

## 3. Phased delivery

### Phase 1 — Fix trust, re-gate, re-copy (one coordinated release)

| Ticket | Scope | Size | Risk flags |
|---|---|---|---|
| **T1 Re-gate to final matrix** | Single migration: `CREATE OR REPLACE` **both** `get_tier_gated_report` and `get_shared_report` with the final map (per D1/D2: `mentor_recommendations: growth`, `lead_list: scale`, `first_customers: scale` if D1 lands as recommended) + idempotent `report_templates.visibility_tier` updates; matching shrink of `TIER_REQUIREMENTS` in `reportSectionConfig.ts` and `rubric.ts`; decide share-link backfill vs RPC re-derivation for stored `visible:false` flags | S–M | Freemium funnel · **Touches RLS** (approval-gated). Acceptance: free account's RPC payload contains no gated content and full content for freed sections |
| **T2 Post-payment unlock fix** | Invalidate `['report', reportId]` on tier-flip (poll success + "Refresh access"); make `PaymentStatusModal` poll before claiming the upgrade (or soften copy to "activating…") | S | Freemium funnel · coordinate with **#45** (this is its concrete failing case) |
| **T3 Pricing & copy overhaul** | New tier cards led by the human/concierge promise (all three persona variants in `personaContent.ts`); fix investor-recs/leads-marketplace claims; "one-time" prominence; AUD display; gate-card copy per section; needs D3/D4 | S–M | Freemium funnel |

Ship T1 + T3 in the same release (matrix and copy must never disagree in prod). T2 can precede
everything — it's the highest-ROI fix and fully independent.

**Phase 1 addendum — onboarding-modal friction (amends MES-187, reviewed 2026-07-15):**
`AuthContext.tsx:27-40` renders the welcome `OnboardingDialog` globally the moment
`onboarding_completed = false`, and the dialog blocks outside-clicks — so report-flow signups get
a four-field modal over the generating screen asking Company Name / Country / Target Market /
Use case, **all of which the intake just captured** (`user_intake_forms.company_name`,
`country_of_origin`, persona; Target Market is always Australia per MES-187). It would also fire
over Stripe returns once the T5b order-bump exists. Amendments to fold into **MES-187**:

| | Change | Size |
|---|---|---|
| A1 | **Derive, don't ask:** report-flow signups get their profile set from the intake at submission (company, country, use_case ← persona, `target_market='Australia'`, `onboarding_completed=true`) — the modal never shows for them | S |
| A2 | **Suppression guards:** never render the modal on `/report-creator` or `/report/*`, nor on any Stripe-return render (`stripe_status` param); defer to the next MemberHub/dashboard visit | S |
| A3 | MES-187 v1 as already scoped (Target Market removed, persona first, website field, telemetry) stays — it now serves only directory-entry signups | (as scoped) |

Email-confirmation hop: return-path plumbing already resumes the intake (`AuthCallback` +
`consumeAuthReturnPath`); the dead-end screen has its own P1 ticket. Do not change auth policy
(magic-link-first / disabling confirm-email) until T5a instruments
`signup_started → session_established`.

### Phase 2 — Stripe, entitlements & fulfilment plumbing

| Ticket | Scope | Size | Risk flags |
|---|---|---|---|
| **T8 Growth reprice + service entitlements** (new) | New one-time Stripe price for Growth at D3 (old price retired, not deleted); webhook grants tier exactly as today **plus** inserts service-entitlement rows (walkthrough call / strategy session / mentor-intro count / ecosystem-intro count per D4) into a new `service_entitlements` table — service-role-write only, **never** touching `user_subscriptions` beyond tier (AUD-005 pattern); post-purchase fulfilment email (existing `send-email` plumbing) with booking link (Calendly/Cal.com — build no scheduler) | M | **Payments/entitlements** (approval-gated) · Touches RLS (new table policies) · cross **#47** (D5 refund policy) |
| **T9 Concierge intro gating + counters** (new) | The *guaranteed* intro flavour becomes entitlement-checked server-side with a decrementing counter; the free enquiry path (`WarmIntroModal` → public funnels) stays open to everyone; admin fulfilment view on the existing submissions queue (intro status, partner, SLA clock) | M | Freemium funnel · Touches RLS |

### Phase 3 — Conversion surfaces

| Ticket | Scope | Size | Risk flags |
|---|---|---|---|
| **T5a Funnel instrumentation** (do first) | Gate impressions → gate clicks → checkout starts → paid, via `intake_form_events`-style events; baseline before any surface ships | S | — |
| **T4 Real teasers for locked sections** | Mentor: match count + one blurred card; Leads: sample rows (**#153**); section-specific value copy; teaser data served through the RPC only (no client-side leak) | M | Freemium funnel · Touches RLS |
| **T5b Comparison moments** | Review-step order-bump (Free preselected, one tap to continue free), generating-screen free-vs-Growth-vs-Scale comparison of the sections being written, end-of-report strip | M | Freemium funnel |

### Phase 4 — Commercial & delivery ops (mostly not code)

| Ticket | Scope | Size | Risk flags |
|---|---|---|---|
| **T10 Partner programme** (new) | D6 agreements, named contacts, SLA, disclosure line; matching-integrity guardrail documented (matching independent of partner status — protects the grounding invariant) | M (commercial) | Brand/trust |
| **T7 Lead delivery to platform (MVP)** | Scale fulfilment: clean CSV export of the report's lead list + optional push via the existing Lemlist path; per-CRM connectors explicitly out of scope; entitlement = Scale purchase (folds the audit's marketplace-entitlement question in here) | M | Touches RLS · cross **#47** |

**Dropped:** T6 (partial mentor gating, 1-vs-all RPC machinery) — superseded by the intro-cap
model, which delivers the differentiation commercially instead of in the RPC.

## 4. Sequencing

```
Phase 0  D1–D6 sign-off  ──────────────┐
T2 (unlock fix, independent) ──────────┤
MES-187 + A1/A2 (independent) ─────────┤
Phase 1  T1 + T3 (one release) ◄───────┘
Phase 2  T8 → T9            (needs D3–D5; T8 before T9)
Phase 3  T5a → T4 + T5b     (instrument first; parallel with Phase 2)
Phase 4  T10 (start alongside Phase 2 — agreements take calendar time) → T7
```

Rough total: ~2 focused engineering weeks across Phases 1–3, plus the Phase 4 commercial work
which is calendar-bound, not effort-bound. Everything RPC/payments-touching (T1, T8, T9, T7)
follows the plan-approval gate individually before code.

## 5. Verification & guardrails (carried from the audit)

- **#38 never reopens:** both RPCs change in the same migration; post-deploy check = free
  account's network payload (no mentor/lead/first-customers content; full content for freed
  sections). The four gating sources of truth move together, always.
- **Entitlements are service-role-write only**; the webhook remains the sole grantor; add-on/
  entitlement metadata can never set `user_subscriptions.tier` (AUD-005).
- **Standard verify before each PR:** `npm test`, `npx tsc -p tsconfig.app.json --noEmit`,
  `npm run build`; no new lint errors in touched files.
- **Capacity watch:** every Scale sale now creates ~2h of advisor obligation (session + 2 mentor
  intros + ecosystem coordination); fine at current volume, revisit at ~10 sales/month.

## 6. What's being asked of review

1. Approve the tier model v2 table (§1) as the product decision of record.
2. Decide D1–D6 (§2) — D4 is already settled (2 mentor intros on Scale).
3. Approve the phase/ticket breakdown (§3–4) so T2 and Phase 1 can start immediately after
   sign-off; T1/T8/T9/T7 will each present their detailed plan at their own approval gate.
