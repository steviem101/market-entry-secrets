# MES-188 epic — sequenced backlog & ticket write-ups (for minting)

> 2026-07-15 · Companion to the [charter](mes-188-epic-intent-to-advisor-charter.md). This is the
> build order and the ticket content, written to MES ticket standard so each can be minted in the
> MES Tickets DB (pending epic ID + Type confirmation). MES-158 and MES-187 already exist and are
> well-formed; their amendments live as comments on those tickets. Everything else below is new.

## 1. Write-up quality bar (every ticket must pass before "Prompt Ready")

1. **Matrix row** — what anonymous / free / Growth / Scale see *before and after* the change
   (MES Ticket Writing Context requirement for anything gated).
2. **Enforcement layer named** — client UX, stored JSON, RLS, or SECURITY DEFINER RPC.
3. **Four-sources rule** stated on any ticket touching report sections (`reportSectionConfig.ts`,
   `report_templates`, `rubric.ts`, both RPCs move together).
4. **Approval-gate marker** on anything touching RLS/policies, payments/entitlements, or
   destructive data — "stop after plan, get sign-off".
5. **Dependencies explicit** — D-decisions and upstream tickets by ID.
6. **Telemetry** — the events the change must emit (T5a vocabulary).
7. **Rollback/disable plan** — flag, component switch, or revert path.
8. **Test plan** including the free-account network-payload check where gating is involved.
9. **AU English** on all copy; HSL tokens; 390px pass for UI.
10. **Claude Code prompt block** with branch name `mes-<id>-<slug>`.

## 2. Sequencing

### Wave 0 — Decisions (founder, ~1 sitting; blocks everything marked ⬥)
D1 first_customers placement ⬥T1 · D2 investor recs free ⬥T1 · D3 Growth price ⬥T3,T8 ·
D5 refund policy ⬥T8 · D6 partner/mentor shortlist + SLA ⬥T10,T13 · D7 booking tool ⬥T13 ·
D8 concierge at launch ⬥T7, bundle shape · D9 intent hero timing ⬥MES-158.
(D4 settled: Growth 1 mentor + 3 ecosystem · Scale 2 mentors + priority.)

### Wave 1 — Launch bundle (dependency order; ≈2 engineering weeks + parallel commercial)

```
parallel from day 1:   T12 hygiene   T5a instrumentation   T2 unlock fix   MES-187(A1–A4)   T17 degraded-run alert   T10 agreements (commercial)
then, one release:     T1 re-gate  +  T3 copy/pricing            (needs D1–D3)
then:                  T8 reprice + entitlements                 (needs D3, D5; after T3 so prices never disagree)
then:                  T13 booking → T16a report-ready email     (need T8 entitlements; T13 needs D7)
if D8 = yes:           T7 lead delivery MVP                      (needs T8)
launch gate:           T18 fulfilment dry-run  →  T19 prelaunch-audit reconciliation  →  LAUNCH
```

### Wave 2 — Fast-follows (post-launch, **one funnel change per measurement window**, in this order)
1. **MES-158** intent hero (flagged) — biggest lever, cleanest single change to measure.
2. **T4** intent-aware teasers (pairs with MES-158's intent data; #153).
3. **T5b** order-bump + generating-screen comparison (uses design note #2, theatre).
4. **T14** refinement boxes (replace the launch v0 form).
5. **T15** unified deliverables hub + SLA→Slack.
6. **T9** server-side intro counters (retire manual counting).
7. **T11** email-domain enrichment + routing question.
8. **T16b** day-2/7 lifecycle sequence.

## 3. Launch-bundle ticket cards (mint-ready)

---
### T12 — Pre-launch data hygiene: purge/flag founder test data
**Type** Chore · **Priority** P0 (launch blocker) · **Risk flags** Destructive data (approval-gated) · **Size** S
**Objective:** day-1 metrics, the quality loop, and any "X reports generated" proof start clean.
**Scope:** inventory founder/test accounts; **flag, don't delete** `payment_webhook_logs` and any
row with financial meaning (add `is_test`/allowlist); purge or flag `user_reports`,
`user_intake_forms`, `user_subscriptions`, `report_quality`, `email_leads`, `intake_form_events`;
permanently exclude `EVAL_BYPASS_USER_ID` from funnel queries; document the test-account policy.
**Depends:** none. **Approval gate:** yes — destructive data; plan lists every table + row count first.
**Acceptance:** funnel/quality queries return zero test rows; Stripe-linked rows retained and
flagged; a documented, repeatable exclusion (view or predicate) exists for future founder testing.
**Rollback:** flags are reversible; purges only after the approved plan names them.

---
### T5a — Funnel instrumentation + feedback capture (measurement spine)
**Type** Feature · **Priority** P0 (launch blocker) · **Risk flags** Freemium funnel · **Size** S
**Objective:** the first real visitors are the baseline; every later change is measurable.
**Scope:** events (`gate_impression`, `gate_click`, `checkout_started`, `checkout_completed`,
`signup_started`, `session_established`, `report_viewed`, `section_feedback_opened`) following
`intake_form_events` patterns with a `source` field (reserves `homepage_hero` for MES-158);
prominent one-click "Was this useful?" at report open (the existing bottom widget stays);
dashboard query pack in `docs/`.
**Depends:** T12 (clean baseline). **Matrix row:** no visibility change, any audience.
**Acceptance:** every funnel step emits exactly one event with attribution; feedback prompt
renders on report open at 390px; no PII in event payloads.
**Rollback:** events are additive; prompt behind a small flag.

---
### T2 — Post-payment unlock fix + honest pricing-return modal
**Type** Bug · **Priority** P0 · **Risk flags** Freemium funnel (cross **#45**) · **Size** S
**Objective:** a paying user sees their sections unlock in place — never "generate a new report".
**Current:** `ReportView` polls the tier but never invalidates `['report', reportId]`; stale
stripped payload + `staleTime` 5 min + no refocus refetch ⇒ unlocked sections fall into the
legacy `ReportRegenerateSection` branch until hard refresh. `PaymentStatusModal` (pricing-page
return) claims "account upgraded" without polling.
**Scope:** invalidate the report query when `unlockState` → `unlocked` and on "Refresh access";
make `PaymentStatusModal` poll `refetchSubscription` (or soften copy to "activating…") before
asserting success. **Matrix row:** paid user, post-checkout: stripped cache → fresh RPC payload.
**Acceptance:** Stripe-return on report page shows unlocked *content* within the polling window
with no reload; pricing-page return never claims an upgrade the DB hasn't recorded; both paths
emit T5a events.
**Rollback:** two isolated component changes; revert independently.

---
### T1 — Re-gate report sections to the target matrix
**Type** Feature · **Priority** P0 · **Risk flags** Freemium funnel · **Touches RLS** · **Size** S–M
**Objective:** free report shows everything except Mentors + Leads (+ First Customers per D1).
**Matrix row (after):** anon(share)/free: 9 of 11 sections* · Growth: all but `lead_list` ·
Scale: all. *pending D1 on `first_customers`.
**Scope (four sources, one PR):** migration `CREATE OR REPLACE` **both** `get_tier_gated_report`
and `get_shared_report` with the final `v_tier_requirements`; idempotent
`report_templates.visibility_tier` updates; matching shrink in `reportSectionConfig.ts` and
`report-quality-loop/rubric.ts`; decide + implement share-link handling for pre-change reports
(backfill stored `visible` flags vs RPC re-derivation).
**Depends:** D1, D2. **Approval gate:** yes — SECURITY DEFINER RPCs; plan first.
**Acceptance:** free account's `get_tier_gated_report` payload has **no content** for gated
sections and **full content** for freed ones (network-panel check); share links behave per the
chosen backfill; `npm test` + tsc + build green.
**Rollback:** inverse migration restoring the previous tier map (loosening-only change,
no data loss either direction).

---
### T3 — Pricing, tier-card & gate copy overhaul
**Type** Feature · **Priority** P0 · **Risk flags** Freemium funnel · **Size** S–M
**Objective:** what we sell matches what the code grants, led by the human/concierge promise.
**Scope:** rewrite tier cards in all three `personaContent.ts` variants to the charter §2 model
(Growth = walkthrough call + 1 mentor intro + 3 ecosystem intros; Scale = strategy session +
2 mentor intros + leads now/tuned later); fix investor-recs and leads-marketplace claims; gate-card
copy per section (intent-aware placeholders for MES-158); X-not-Y manifesto copy; how-it-works
"Tell us your goal → get your free report → work it with your advisor"; purchase-confidence
microcopy at checkout ("Secure checkout via Stripe · One-time payment · Tax invoice issued");
"one-time" prominence; AUD display decision; live DB counts in the proof strip (design note #6).
**Depends:** D1–D3; ships in the same release as T1. **Matrix row:** copy only, no access change.
**Acceptance:** every tier-card claim traceable to an enforcement point; AU English; no hardcoded
counts; 390px pass.
**Rollback:** copy-only revert.

---
### MES-187 (amended) — Onboarding modal removal + derive-from-intake
Exists in Notion with A1–A4 amendments in comments. **Priority** P0 in this epic ·
**Size** S–M · **Depends:** none. Ship with Wave-1 parallels. (T11 = A5/A6 is Wave 2.)

---
### T8 — Growth reprice + service entitlements
**Type** Feature · **Priority** P0 · **Risk flags** Payments/entitlements (approval-gated) ·
**Touches RLS** · cross **#47** · **Size** M
**Objective:** the tier purchase grants tier + the human-service entitlements that drive servicing.
**Scope:** new one-time Stripe price for Growth at D3 (old price archived, never deleted);
`service_entitlements` table (user_id, source_purchase, kind: walkthrough_call | strategy_session
| mentor_intro | ecosystem_intro, granted/consumed counts, expiry = purchase + 30 days) —
**service-role-write only**, owner SELECT; webhook grants tier exactly as today **plus**
entitlement rows per tier (D4 counts); post-purchase fulfilment email (booking link per D7,
what's-coming copy); tier metadata can never come from add-on metadata (AUD-005 pattern).
**Matrix row:** no report-visibility change; adds entitlement rows for paid tiers.
**Depends:** D3, D5, D7; after T3. **Approval gate:** yes — payments + new RLS.
**Acceptance:** test-mode checkout grants tier + correct entitlement rows atomically; replayed
events don't double-grant (webhook state machine); no client write path to entitlements exists;
refund handling documented per D5 (#47).
**Rollback:** entitlement writes behind a flag; price revert = repoint `STRIPE_GROWTH_PRICE_ID`.

---
### T13 — Advisor booking from the report
**Type** Feature · **Priority** P0 · **Risk flags** Freemium funnel · **Size** S–M
**Objective:** paid users book their included session in one click from the report.
**Scope:** entitlement-driven banner atop `ReportView` for holders of an unconsumed
walkthrough_call/strategy_session ("Your session is included — book a time"); same link in the
T16a email; **one** booking tool per D7; mark-consumed on booking (manual at launch is
acceptable); full-calendar fallback copy ("next window opens…").
**Depends:** T8, D7, D6 (advisor named + capacity). **Matrix row:** banner visible only with an
entitlement row — free users never see it.
**Acceptance:** banner shows for entitled, hides for free/consumed; link opens the booking tool
with user context; event emitted (`session_booking_opened`); 390px pass.
**Rollback:** banner behind a flag.

---
### T16a — Per-tier report-ready email
**Type** Feature · **Priority** P0 · **Risk flags** Freemium funnel · **Size** S
**Objective:** the completion email continues the journey instead of just announcing it.
**Scope:** extend the existing completion email: free = report link + "what your locked sections
found" (counts only) + one self-serve next step; paid = report link + book-your-session (T13
link) + what's coming to your hub and when (SLA copy identical to T3/T15's); code-rendered in
`_shared/email/`; no PII in logs.
**Depends:** T8/T13 for the paid variant. **Acceptance:** correct variant per tier at send time;
SLA strings sourced from one constant; renders in dark-mode clients.
**Rollback:** revert to the current single template.

---
### T7 — Lead delivery to the Member Hub (MVP)
**Type** Feature · **Priority** P0 if D8=yes, else Wave 2 · **Risk flags** Touches RLS · cross
**#47** · **Size** M
**Objective:** Scale's "list now" is real: the report-matched lead list lands in the hub
automatically; the tuned list follows the session.
**Scope:** on Scale report completion, materialise the report's lead matches as a delivered list
(reuse `lead_databases`/`lead_database_records` + a purchases/entitlement row so existing RLS
serves it); surface via the existing Requested-lists hub section; CSV export; tuned-list
re-delivery path post-session (manual upload acceptable at launch); Lemlist push optional.
**Depends:** T8, D8. **Matrix row:** Scale-only rows via the existing purchase-gated RLS —
no policy loosening.
**Acceptance:** Scale buyer sees their list in the hub without human action; free/Growth users
have no read path (RLS check); delivery emits an event + T16 notification.
**Rollback:** delivery job behind a flag; hub section already tolerates absence.

---
### T10 — Partner & mentor programme (commercial)
**Type** Task (commercial) · **Priority** P0 (gates the concierge promise) · **Size** M,
calendar-bound
**Scope:** D6 shortlist (top 20–30 entities in generated reports); named receiving contact +
response SLA per partner; **mentor side:** opt-in intro consent, per-mentor capacity, reciprocity
offer; disclosure line; matching-integrity guardrail documented (matching never reads partner
status). **Acceptance:** signed/acknowledged agreements covering launch-promise volume; entitlement
copy in T3 matches what partners agreed to deliver.

---
### T17 — Degraded-run alerting (launch blocker)
**Type** Chore · **Priority** P0 · **Size** S
**Scope:** investigate the ~19% `report_quality.degraded` rate on founder test runs; fix cheap
causes; wire `degraded=true` into the existing Slack ops routing so live degradations page.
**Acceptance:** degraded rate understood + alert fires on a forced degraded run.

---
### T18 — Fulfilment dry-run (ops rehearsal, launch gate)
Walk 2–3 friendly beta users through the entire paid journey — report, booking, session,
delivery, statuses, emails — before launch. Output: a checklist of what broke, folded into T19.

---
### T19 — Prelaunch-audit reconciliation (launch gate)
Fold the launch bundle into `docs/prelaunch-audit.md` (MES-111) so exactly **one** launch
checklist exists; epic items appear there with owners and states.

## 4. Wave-2 stubs (full write-ups at their gate, same quality bar)

- **MES-158** (exists; amendments in comments — first-person chips, partial-named credibility
  strip, no booking-led hero, popup suppression, D9 timing).
- **T4 intent-aware teasers:** mentor count + one redacted card; lead sample rows (#153); teaser
  data via the RPC only; redaction metaphor per design note #5. *Touches RLS.*
- **T5b comparison moments:** Review order-bump (Free preselected); generating-screen "theatre"
  (skeleton + live match counts) with free-vs-paid comparison; end-of-report strip. Requires T5a
  baselines first.
- **T14 refinement boxes:** concierge-tuning component atop mentor/lead sections; consolidates
  `LeadListRequestCard`; one `report_section_feedback` path; replaces the launch v0 form. *Touches RLS.*
- **T15 deliverables hub:** unify Requested-lists + Mentor Connections + ecosystem intros;
  statuses; SLA-breach → Slack via `activity_event_routing`. *Touches RLS.*
- **T9 intro counters:** server-side enforcement of D4 caps; admin queue integration.
- **T11 onboarding derivation:** email-domain enrichment (extends `website_prefill_from_email`
  pattern); "what are you here to do?" routing question; supply-side branch.
- **T16b lifecycle sequence:** day-2 (locked-section counts + feedback ask), day-7 (market
  nudge); status-change notifications if not landed with T15.

## 5. Open items before minting

1. Confirm epic Type value + next ticket IDs in the MES Tickets DB (T-numbers here are
   epic-internal; they'll become MES-### on minting).
2. Wave-0 decisions D1–D3, D5–D9.
3. On approval, mint Wave-1 tickets from §3 verbatim (each already meets the §1 bar) and set
   the epic as parent.
