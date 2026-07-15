# EPIC CHARTER — Intent-to-Advisor funnel (MES-188)

> **Status: for review & sign-off before any implementation.** 2026-07-15.
> Consolidates the MES-188 audit, delivery plan, and all review conversations into the single
> document of record. Working history: [`mes-188-upgrade-funnel-tier-gating-audit.md`](mes-188-upgrade-funnel-tier-gating-audit.md),
> [`mes-188-funnel-pricing-delivery-plan.md`](mes-188-funnel-pricing-delivery-plan.md).
> Context: **MES is pre-launch** — all existing production data is founder test data. This epic
> defines the launch state of the funnel, not iterations to a live one.

## 1. Thesis

**Capture intent once; deliver the free report around it; upsell with the two locked sections
that answer it; fulfil with humans.**

The end-to-end journey this epic ships:

1. **Hero:** visitor types what they need ("find a fintech mentor") or taps a chip → intent
   captured once.
2. **Intake:** prefilled from intent; no prices, no auth until the Generate click.
3. **Signup:** auth at Generate; profile derived from the intake — **no onboarding modal,
   nothing asked twice.**
4. **Free report:** built and *prioritised* around the stated intent (existing `goal_ids`
   plumbing); 9 of 11 sections open; only Mentor Matching and Leads locked, each with an
   intent-aware teaser ("You asked for a fintech mentor — your report matched 8").
5. **Purchase:** optional order-bump at Review; comparison on the generating screen; primary
   upsell inside the report. One-time payments; no wall anywhere before the report.
6. **Activation:** sections unlock instantly on payment (cache invalidation fix); honest
   pending states.
7. **Servicing:** paid users book their advisor call from the top of the report; the session
   tunes the ICP and brokers intros; deliverables and introduction statuses live in the Member
   Hub; concierge refinement boxes in the mentor/lead sections catch the rest.
8. **Lifecycle:** per-tier report-ready email, delivery/status notifications, day-2/7
   follow-ups.

## 2. The tier model (decision of record, pending D-decisions)

| | **Free** | **Growth ~$199** (D3) | **Scale $999** |
|---|---|---|---|
| Story | See the ecosystem | We get you in the room | We hand you the pipeline |
| Report sections | All except Leads + Mentors (+ First Customers per D1) | All except Leads (+ First Customers per D1) | Everything |
| Ecosystem warm intros (providers/hubs/agencies) | Open enquiry form (stays free) | Concierge, advisor-made, capped at 3 | Priority, effectively uncapped |
| Mentors | Locked (teaser) | Full section + **1 warm intro** | Full section + **2 warm intros** |
| Human touch | — | 20–30 min walkthrough call | 60-min strategy session |
| Leads | Locked (teaser) | Locked (teaser) | Full list **now** + tuned list after the session, delivered to the Member Hub |

Service scoping: sessions/intros claimable within 30 days; consumed services are the
non-refundable portion (D5); mentor intros are **brokerage, never a guarantee** of a third
party's reply (fallback: advisor proposes alternates).

## 3. What the epic covers — workstreams & tickets

### WS-A — Entry & intent
| Ticket | Scope | Size | When |
|---|---|---|---|
| MES-158 | Hero intent capture V1 (input + chips → sessionStorage prefill → confirm step in intake; intents mapped to `goal_ids`; rule-based classification; "browse now" path for directory-shaped intents). **Hubble live-review amendments (2026-07-15):** chips are first-person situational ("I need my first Australian customers"), not imperatives; credibility strip is *partial*-named — named provider/agency/investor cards with logos + anonymised mentor cards that trade names for signal; hero promise stays the report, never "book a call" (the human is what the tiers sell); LeadGenPopup suppressed on the homepage when the intent hero ships | M | **Fast-follow or launch — decision D9** (flagged either way) |

### WS-B — Frictionless onboarding
| Ticket | Scope | Size | When |
|---|---|---|---|
| MES-187 + A1–A4 | Remove modal for report-flow signups (derive profile from intake); suppress on report routes + Stripe returns; card-not-modal for directory signups; v1 streamline (Target Market removed, persona first, website field) | S–M | **Launch bundle** |
| T11 (A5–A6) | Email-domain profile enrichment; "what are you here to do?" routing question; supply-side branch to partner path | S–M | Post-launch |

### WS-C — Value & gating
| Ticket | Scope | Size | When |
|---|---|---|---|
| T1 | Re-gate to the target matrix: one migration touching **both** RPCs + `report_templates`, plus `reportSectionConfig.ts` + `rubric.ts`; share-link backfill decision | S–M | **Launch bundle** (approval-gated: RPCs) |
| T3 | Pricing & copy overhaul: concierge-led tier cards (all personas), fix investor-recs/leads-marketplace claims, one-time prominence, SLA copy | S–M | **Launch bundle** (ships with T1) |
| T4 | Intent-aware teasers for the two locked sections (mentor count + blurred card; lead sample rows per #153), served via the RPC | M | Post-launch (v0 copy improvements ride T3) |

### WS-D — Purchase & activation
| Ticket | Scope | Size | When |
|---|---|---|---|
| T2 | Post-payment unlock fix (invalidate report query on tier flip) + honest `PaymentStatusModal` (#45) | S | **Launch bundle** |
| T8 | Growth reprice in Stripe + `service_entitlements` table (webhook writes entitlement rows; never grants tier from add-on metadata) + fulfilment email with booking link | M | **Launch bundle** (approval-gated: payments) |
| T9 | Server-side concierge-intro gating + counters; admin fulfilment queue | M | Post-launch (manual counting at launch) |

### WS-E — Servicing & fulfilment (post-report)
| Ticket | Scope | Size | When |
|---|---|---|---|
| T13 | Advisor booking: entitlement banner atop the report + link in report-ready email; **one** booking tool (D7); full-calendar fallback | S–M | **Launch bundle** |
| T14 | Concierge refinement boxes atop mentor/lead sections (below title/first para): structured reasons + free text + booking link; consolidates `LeadListRequestCard`; one `report_section_feedback` data path | M | Post-launch (**v0 at launch:** simple form → founder inbox) |
| T15 | Deliverables & introductions hub: unify Requested-lists + Mentor Connections + ecosystem intros; statuses (`requested → in progress → delivered / intro made → meeting booked`); report cross-links; **SLA-breach → Slack alert** via existing `activity_event_routing` | M | Post-launch (**launch uses the existing Requested-lists pattern + manual emails**) |
| T16 | Lifecycle emails: per-tier report-ready (paid = book session + what's coming and when; free = one self-serve next step), delivery/intro notifications, day-2/7 follow-ups | M | **Report-ready email in launch bundle**; sequence post-launch |
| T7 | Lead delivery MVP: report-matched list uploaded to Supabase → hub ("list now"); tuned list post-session; CSV/Lemlist, no per-CRM connectors | M | Launch bundle **if** Scale sells day 1 (D8) |
| T10 | Partner programme **including the mentor side**: provider/hub/agency agreements + SLA + disclosure; mentor opt-in intro consent + per-mentor capacity + reciprocity; matching stays independent of partner economics | M (commercial, calendar-bound) | **Pre-launch start** — agreements gate the concierge promise |

### WS-F — Measurement spine
| Ticket | Scope | Size | When |
|---|---|---|---|
| T5a | Funnel instrumentation end-to-end (gate impressions → clicks → checkout → paid; hero attribution; signup_started → session_established), plus prominent report-feedback capture | S | **Launch blocker** |
| T5b | Comparison moments: Review order-bump, generating-screen free-vs-paid, end-of-report strip | M | Post-launch |

### Launch blockers (not features)
| Ticket | Scope |
|---|---|
| T12 | Pre-launch data hygiene: purge/flag founder test data across `user_subscriptions`, `user_reports`, `user_intake_forms`, `payment_webhook_logs`, `report_quality`, `email_leads` (flag-don't-delete for payment records); exclude `EVAL_BYPASS_USER_ID` from funnel metrics |
| — | Fix or alert on the ~19% degraded-run rate in `report_quality` |
| — | **Fulfilment dry-run:** walk 2–3 friendly beta users through the entire paid journey (report → booking → session → delivery → statuses → emails) as an ops rehearsal |
| — | **Reconcile with `docs/prelaunch-audit.md`** (MES-111): fold this launch bundle into the canonical checklist — exactly one launch gate exists |

## 4. Launch principle: journey-complete, not automation-complete

The pre-launch bar is that **every step works end to end, even where a human plus an email is
the implementation.** Launch bundle: **T12 · T5a · T1+T3 · T2 · MES-187(A1–A4) · T8 · T13 ·
T16(report-ready) · T7(if D8) — with T10 agreements running in parallel.** Everything else ships
against real user behaviour, not ahead of it. Manual seams at launch (refinement via simple
form, statuses via existing pattern + manual email, intro counting by hand) are deliberate:
automate what hurts after volume proves it.

## 5. Decisions required before starting (owner: product)

| # | Decision | Recommendation |
|---|---|---|
| D1 | `first_customers` placement | Gate at **Scale** (named target accounts = mini lead list); do not free it |
| D2 | `investor_recommendations` free | **Yes** (publicly browsable directory; lock only what's scarce off-platform) |
| D3 | Growth price | **$199** (covers the human call; $99 is negative-margin) |
| D4 | Intro caps | **Settled:** Growth 1 mentor + 3 ecosystem · Scale 2 mentors + priority ecosystem · 30-day window |
| D5 | Refund policy for consumed services | Non-refundable portion, stated at checkout; align with #47 |
| D6 | Partner + mentor shortlist & SLA | Top 20–30 entities appearing in test reports; named contacts; mentor opt-in |
| D7 | Booking tool | **One** of HubSpot Meetings (if CRM stays HubSpot) or Calendly — never both |
| D8 | Is concierge a launch-day promise? | **Yes, recommended** — it is the differentiator; requires T8/T13/T7 in the bundle and D6 signed |
| D9 | Intent hero (MES-158) at launch or first fast-follow? | **Fast-follow, recommended** — launch with the proven single-CTA hero; make the intent hero the first measured change |

## 5b. Design direction notes (Hubble live review, 2026-07-15 + design recommendations)

From the hubble.social teardown (Webflow build; full copy/structure reviewed):

1. **Mirror the posture, not the material.** Outcome-first hero, first-person situational chips,
   proof-of-answerability strip, "not sure where to start?" topic grid, X-not-Y manifesto copy,
   3-step how-it-works that ends on the paid product, supply-side recruitment section. Do NOT
   mirror booking-led conversion (their product is the call; MES's free product is the report).
2. **X-not-Y copy for T3**, honest because of the grounding invariant: *"Recommendations that
   trace to real providers — not AI guesses. A plan, not a PDF. Warm introductions, not a
   contact list."* How-it-works: *Tell us your goal → get your free report → work it with your
   advisor.*
3. **Show the product, not claims (top recommendation):** link a real, curated **sample report**
   from the hero ("See a real report") using the existing share-token infrastructure — near-zero
   build cost, the strongest trust asset MES owns. Replace/augment the static hero mockup with it.
4. **Design the generating screen as theatre:** report skeleton assembling with live match counts
   ("Found 12 providers… 8 mentors…") instead of a spinner — perceived value compounds during
   the 3-minute wait and sets up the comparison moment (T5b).
5. **One locked-section metaphor:** redaction bars (the `ReportMatchCard` ████ pattern) over
   generic blur — redaction reads as "real content underneath"; blur reads as stock UI. Unify.
6. **Real numbers as design material:** proof strip counts pulled from the DB (post-T12 they're
   honest), `tabular-nums`, never hand-typed marketing numbers that drift.
7. **Purchase-confidence microcopy at the $999 moment:** "Secure checkout via Stripe · One-time
   payment · Tax invoice issued" — AU B2B buyers look for it; costs one line (T3).
8. **Shared reports get OG cards** (company name + section count + "Australian market entry
   report") so the share-link viral loop looks credible in Slack/LinkedIn previews (rides T4/SEO).
9. **Craft floor:** hero renders without layout shift pre-hydration (CSR + prerender-as-anon
   posture), 390px mobile pass on every new surface, visible focus states, `prefers-reduced-motion`
   respected, dark theme intentional not inverted.

## 6. Guardrails (non-negotiable, carried from the audit)

1. **#38 never reopens:** both gating RPCs change in one migration; post-deploy free-account
   payload check; the four section-truth sources always move together.
2. **Entitlements are service-role-write only;** the Stripe webhook is the sole grantor; add-on
   metadata can never set a tier (AUD-005 pattern).
3. **Matching integrity:** recommendations trace to directory rows on merit; partner economics
   never influence matching; relationships disclosed.
4. **Nothing gates on `onboarding_completed`** — ever.
5. **One feedback data path** (report score + refinement + list requests converge).
6. **One SLA copy** across checkout, report, hub, email — and SLA breaches page Slack, so
   statuses can't rot silently.
7. **No wall before the free report.** The order-bump and comparisons are offers, never gates.
8. Australian English; HSL tokens; no PII in logs; standard verify suite per PR.

## 7. How we'll know it worked

T5a live from the first real visitor (they are the baseline). North star: **report → paid within
7 days**. Supports: landing → report completion; session → Scale upsell rate; intent-to-tier
conversion by hero intent (post-MES-158). Guardrails: refund rate, degraded-run rate, report
feedback score. Post-launch experiment discipline: **one funnel change per measurement window.**
Checkpoint: hold T9/T14/T15 automation until the launch cohort's data justifies it.

## 8. Explicitly out of scope

Subscriptions/recurring billing; per-CRM delivery connectors; partner-facing portal; a hero
chatbot; LinkedIn OAuth (#37); partial mentor gating machinery (T6 — dropped, superseded by
intro caps); New Zealand as a separate market; changing the anonymous 3-view freemium gate.

## 9. Review asks

1. Approve the tier model (§2) and the journey (§1) as the product decision of record.
2. Decide D1–D3, D5–D8 (D4 settled).
3. Approve the launch bundle vs post-launch split (§3–4) — especially the manual-first seams.
4. Confirm epic creation in the MES Tickets DB (needs next ticket ID + Type value) and
   re-parenting of MES-158, MES-187, and the T-tickets as sub-tickets.
