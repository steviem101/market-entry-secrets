# MES-188 — Funnel, pricing & concierge model: delivery plan (for review)

> **Ticket:** MES-188 · **Date:** 2026-07-15 · **Gate stage: Plan** (nothing below is implemented)
> Companion to the audit: [`mes-188-upgrade-funnel-tier-gating-audit.md`](mes-188-upgrade-funnel-tier-gating-audit.md).
> This plan supersedes the audit's provisional numbers where they differ (notably: **Scale
> includes 2 warm mentor introductions**, not 5; the optional partial-mentor-gating ticket T6 is
> dropped). Per CLAUDE.md §11 this whole programme sits in approval-gated territory
> (payments/entitlements/RPCs) — **no implementation starts until this plan is signed off.**

## 0. Correction & reframe (2026-07-15): MES is pre-launch

**All production data referenced in this programme is founder test data — there are no public
users yet.** Consequences, folded into the plan below:

1. **Voided evidence:** the tier distribution (16 Scale / 5 Growth) is not demand data; every
   "leads outsell mentors" argument is now structural, not empirical. The report-first workflow
   recommendation stands on its structural reasons alone (checkout requires auth; value before
   payment; intent friction).
2. **Sequencing simplifies dramatically.** Pre-launch is the cheapest moment this programme will
   ever have: no users to migrate, no grandfathering, no live measurement windows to protect.
   Reframe from "iterate per window" to **define the launch bundle**: ship Workstreams B + C +
   T2 + T5a (and T8/T9 if concierge is a launch-day promise) as the *launch state*, not as
   staged changes to a live funnel. The #159 measurement-window caution applies **post-launch
   only**; MES-158 (hero intent) can join the launch bundle or be the first fast-follow.
3. **Launch with instrumentation live from day 1** (T5a becomes a launch blocker, not an
   optimisation): the first real users are the baseline — don't spend them unmeasured.
4. **New T12 — pre-launch data hygiene (launch blocker, S):** purge or flag founder test data
   (`user_subscriptions`, `user_reports`, `user_intake_forms`, `payment_webhook_logs`,
   `report_quality`, `email_leads` etc. — flag-don't-delete where payment records matter) so
   day-1 metrics, the quality loop, and any "X reports generated" social proof start clean.
   Interlocks with `EVAL_BYPASS_USER_ID` (the golden-eval user should be permanently excluded
   from funnel metrics).
5. **Still real despite the correction:** the ~19% degraded-run rate in `report_quality`
   (founder runs exercised the real pipeline) — fix or alert on it pre-launch; and the
   feedback-capture gap (the widget collected almost nothing across 107 test reports —
   structural, not sentiment, evidence that the feedback mechanism needs to be more prominent
   before real users arrive).

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

**Approved onboarding extensions (2026-07-15 review — approved in conversation):**

| | Change | Where | Size |
|---|---|---|---|
| A4 | **Card, not modal:** for anyone the modal would still target (directory-entry signups), replace the blocking dialog with a dismissible "complete your profile" card in MemberHub with a progress meter and stated payoff | MES-187 (same component/release) | S |
| A5 | **Derive before asking:** persona from `mes_user_persona` localStorage at signup; company from the signup **email domain** via the existing `scrape-company` enrichment (async, silent, per-domain cache, free-mail domains fall back to the ask) — note the intake already does exactly this (`website_prefill_from_email`, `ReportCreatorV2.tsx:126-141`); this extends the pattern to profiles | Fast-follow ticket (T11) | S |
| A6 | **Navigation, not survey:** if one question survives, it's "What are you here to do?" (generate my report / find providers / find a mentor / list my business) — the answer routes the user *and* sets `use_case`; "list my business" branches supply-side signups (providers/advisors/agencies) to the partner path, which Phase 4 (T10) now cares about | Fast-follow ticket (T11) | S |
| — | **Hard rule:** nothing may ever gate on `onboarding_completed` — no report generation, directory access, or checkout. Observed-behaviour signal (categories browsed, persona toggle) rides T5a as profile input | Guardrail, all tickets | — |

**T11 (new, fast-follow to MES-187):** email-domain profile enrichment + "what are you here
to do?" routing question + supply-side branch. S–M. *Freemium funnel.*

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

## 3b. MES-158 review — homepage hero intent capture (analysed 2026-07-15)

MES-158 ("hero asks what the visitor needs → routes to the report generator prefilled") is the
missing **top** of this funnel and belongs in the same programme. Assessment:

**What's right (keep as scoped):** outcome-first hero; chips over blank-page; the explicit
"no chatbot in V1" pushback; sessionStorage prefill contract (option 2); the confirm/refine step;
no anonymous DB writes; gating untouched; analytics events specified.

**What the ticket under-exploits — the intent thread.** Hero intent shouldn't just prefill a
form; it should be captured **once** and flow through the entire funnel:

1. **Intent → report emphasis (plumbing already exists):** `generate-report` prioritises
   sections from `goal_ids` (`goalsToPrioritisedSections`, `index.ts:3009`) — map hero intents
   onto goal ids + sector and the report *leads with* what the visitor asked for. No new
   machinery.
2. **Intent → profile (closes the loop with MES-187 A1):** the visitor's hero text is the best
   `use_case`/persona signal MES will ever get; at signup-at-generate it flows into the derived
   profile. Intent asked once on the homepage, never re-asked anywhere.
3. **Intent → tier-aware upsell (connects to T4/T5b):** intents map to tiers. "Find a mentor" →
   the one section Free locks; "find leads / first customers" → Scale from minute one. The
   confirmation step and the in-report gate cards must acknowledge the intent honestly
   ("You asked for a fintech mentor — your report matched 8; Growth unlocks introductions"),
   and the Review-step order-bump can be intent-aware (lead-intent visitors see Scale first).
   Done dishonestly this is bait-and-switch; done honestly it's the strongest conversion copy
   in the funnel — the gate answers the exact thing the visitor typed.
4. **Intent → attribution:** MES-158's event names must join T5a's spine
   (`source=homepage_hero` flowing hero → intake → report → gate click → paid), or the epic's
   core question ("which intents convert to which tier?") stays unanswerable.

**Cautions:** (a) **directory-shaped intents** — "find a startup lawyer" is served *today* by a
free public directory; routing everything into a 3-minute report can hurt task completion. Keep
the secondary "browse now" path on the confirmation step for provider/event intents. (b)
**measurement window** — the #159 homepage ticket warns mid-window hero changes destroy MES-116
attribution; ship MES-158 behind a flag and sequence after that window closes. (c) chips should
be curated to intents MES can actually fulfil from directory data (grounding invariant); rule-
based classification for V1 is right — resist LLM parsing until V2, after the user is in the flow.

## 3c. Epic structure — one programme of record

Recommend converting MES-188 into (or parenting it under) a single epic using the tickets DB's
sub-ticket support:

> **EPIC: Intent-to-Advisor funnel** — *capture intent once; deliver the free report around it;
> upsell with the two sections that answer it; fulfil with humans.*

| Workstream | Tickets | Notes |
|---|---|---|
| **A — Entry & intent** | MES-158 (hero intent V1, flagged) | sequence after the #159/MES-116 measurement window |
| **B — Frictionless onboarding** | MES-187 + A1–A4 · T11 (A5–A6) | independent; ship early with T2 |
| **C — Value & gating** | T1 re-gate · T3 copy · T4 intent-aware teasers (#153) | T1+T3 one release; approval-gated |
| **D — Purchase & activation** | T2 unlock fix (#45) · T8 reprice + entitlements · T9 intro gating | D1–D6 decisions gate T8/T9 |
| **E — Servicing & fulfilment (post-report)** | T13 booking · T14 refinement boxes · T15 deliverables hub · T16 lifecycle emails · T10 partner programme · T7 lead delivery (#47) | see §3d; T10 is calendar-bound, start early; if concierge is a launch-day promise, T13/T15/T16 join the launch bundle |
| **F — Measurement spine** | T5a events (incl. MES-158 attribution) · T5b comparison moments | T5a lands **first** — every other workstream reports into it |

Epic-level sequencing: **F(T5a) + B + T2 first** (small, independent, immediate ROI) → **C**
(one release) → **D** → **A** (post-measurement-window, flagged) → **E** ongoing. Cross-epic
interlocks: #45 (T2), #47 (T7/T8 refunds), #153 (T4), #159 (workstream A timing), MES-187
(workstream B).

## 3d. Post-report servicing layer (added 2026-07-15 — the final piece)

The journey must not end at "report rendered". Target end-to-end for paid users:
**report opens → book your advisor session (entitlement banner + email) → session tunes the ICP
and books intros → deliverables land in the Member Hub with live statuses → refine
asynchronously from inside the report**. Much of the skeleton already exists: MemberHub's
"Requested lists" section already tracks `new → in_progress → delivered` with
`delivered_database_id` → `/leads/:id` (P1-D), "Mentor Connections" is backed by
`mentor_contact_requests` (`status`, `admin_notes`), and `LeadListRequestCard` already lives in
the report's lead-list section. This workstream extends those patterns — it does not invent new
architecture.

| Ticket | Scope | Size | Risk flags |
|---|---|---|---|
| **T13 Advisor booking flow** | Entitlement-driven banner at the top of the report for Growth/Scale ("Your walkthrough call / strategy session is included — book a time") + the same link in the report-ready email; **one** booking tool (HubSpot Meetings if the CRM stays HubSpot, else Calendly — not both); display gated by `service_entitlements` (T8); booking-window fallback when the calendar is full | S–M | Freemium funnel · depends T8 |
| **T14 Section refinement boxes (mentors + leads)** | One reusable "concierge tuning" component at the top of the mentor and lead sections (below title/first paragraph, per product direction): structured reasons (wrong sector / wrong stage / wrong geography / not enough) + free text + "book time with your advisor" link for entitled users. **Consolidates** `LeadListRequestCard` into the same mechanism and writes to one `report_section_feedback` path feeding the admin ops queue and the quality loop. Shown only where matches are visible (Growth: mentors; Scale: both); free users' locked sections keep the T4 teaser + intent-capture instead | M | Freemium funnel · Touches RLS (new table, owner-insert/read, service-role update) |
| **T15 Deliverables & introductions hub** | Unify "Requested lists" + "Mentor Connections" + ecosystem-intro tracking into one Member Hub deliverables area: per-item status (`requested → in progress → delivered / intro made → meeting booked`), advisor notes, SLA countdown copy; the report's lead-list section cross-links here once delivered ("your list lives in your dashboard"). Admin updates via existing `/admin` patterns — no partner-facing portal at launch | M | Freemium funnel · Touches RLS |
| **T16 Post-report lifecycle emails** | Report-ready email **per tier** (Free: report + what your locked sections found; paid: report + book-your-session + what's coming to your hub and when); status-change notifications (list delivered, intro made) via the existing send-email/queue; day-2/day-7 follow-ups (absorbs the retention/WS-G idea; interlocks with the existing Resend comms-audit ticket) | M | Freemium funnel |

**Design decisions inside this workstream:**
- **Refinement boxes are concierge, not complaint.** Copy frames tuning as part of the paid
  service ("Not quite your ICP? Tell us — we'll re-tune within 24h, or bring it to your
  session"), never "was this wrong?". Prominent placement is fine; apologetic framing is not.
- **"List now, perfect list after."** Scale gets the report-matched list delivered to the hub
  immediately (automated upload), and the *tuned* list after the advisor session — satisfying
  both "leads right away" and "the most perfect list possible" without making delivery block on
  a calendar.
- **One feedback system.** `ReportFeedback` (whole-report score), the refine boxes, and list
  requests must converge on one data path — three disconnected feedback tables would fragment
  the only quality signal MES gets at launch.
- **SLA copy everywhere expectations are set:** checkout, report banner, hub, and email must
  quote the same delivery windows.

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
