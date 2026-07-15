# MES-188 — Upgrade funnel & report tier-gating audit (spike)

> **Ticket:** MES-188 (Spike, P1, Billing) · **Date:** 2026-07-15 · **Author:** Claude Code
> **Mode:** read-only. No code, config, pricing, RLS, or data changes were made. This document is
> the only artefact added by the spike (committed to the harness-assigned branch
> `claude/report-tier-gating-review-jn36ro`; the ticket carries the same findings).
> **Method:** full static walkthrough of the repo, plus live **read-only** checks against the prod
> Supabase project (`xhziwveaiuhzdoutpgrh`: `report_templates`, RPC definitions via
> `pg_get_functiondef`, `pg_policy`, aggregate counts only — no PII) and the live Stripe account
> (read-only price/product list). No browser session, no payments, no writes anywhere.

## TL;DR

1. **The "upgrade wall before the free report" hypothesis is false today.** The funnel is already
   report-first: no pricing on the homepage, no tier/paywall content anywhere in the intake, auth
   is requested only at the final "Generate" click, and the user lands straight on their report.
   The problem is entirely the *other* half of the ticket's worry.
2. **The free report over-gates: 5 of 11 sections are blurred for free users** (target: 2).
   `swot_analysis`, `competitor_landscape`, `first_customers`, `investor_recommendations` are
   growth-gated and must move to free to match the target matrix. Growth and Scale already match.
3. **Gating is genuinely server-side and consistent.** All four sources of truth (frontend config,
   `report_templates.visibility_tier`, quality-loop rubric, and the two SECURITY DEFINER RPCs)
   agree with each other, in the repo **and verified live in prod**. MES-38 is intact; the change
   to the target matrix is loosening-only and cannot reopen the leak if done through the same
   four points.
4. **One real post-payment defect found (smoke FAIL):** after an in-report upgrade, the newly
   unlocked sections render the legacy **"Generate a new report"** placeholder instead of their
   content until the user hard-refreshes — the report payload fetched pre-payment (server-stripped)
   stays in the React Query cache and is never invalidated when the tier flips. Directly in
   MES-45's territory.
5. **Pricing-page copy contradicts actual gating** (investor recommendations sold as Scale but
   unlocked at Growth; Scale's "complete leads marketplace" is not actually granted by the tier).
6. **Recommendation on the three-way entry choice:** do **not** put it before intake. Put the
   free/Growth/Scale offer at the Review step (optional order-bump) and on the ~3-minute
   generating screen (captive comparison moment), keep the in-report locked Leads/Mentor teasers
   as the primary upsell. Live tier data supports this: 16 Scale vs 5 Growth customers — leads
   buyers already convert without an upfront wall.

---

## 1. Journey map (verified end-to-end in code)

| # | Step | What happens | Upgrade prompt / gate? | Source |
|---|------|--------------|------------------------|--------|
| 1 | Landing `/` | Hero CTA **"Generate my free report"** → `/report-creator`; microcopy "Free · No credit card · Ready in about 3 minutes". Homepage renders **no pricing section** | Tier *badges* only (no prices) in "Your report, and what it unlocks" (`WhatsInYourReport.tsx:25-139`) | `src/pages/Index.tsx:67-85`, `src/config/reportCta.ts:10-12`, `src/components/hero/HeroCTAGroup.tsx` |
| 2 | Anonymous browsing (side path) | 3 free directory detail views then signup wall; 30s promo popup pushes the **free report**, not an upgrade | `PaywallModal` ("Sign up to continue") is a **signup** gate, not a payment gate | `FreemiumGate.tsx`, `ListingPageGate.tsx`, `LeadGenPopupProvider.tsx:26-99` |
| 3 | Intake `/report-creator` (v2) | 5 steps (persona → company → goals → details → review), **no auth required**, guest draft in localStorage. "X sections ready · N more to unlock" in the preview rail is *data-completeness* framing, not tier gating. **Zero prices/tier mentions in the whole intake** | None | `ReportCreatorV2.tsx`, `v2/ReportPreview.tsx:55-79` |
| 4 | Auth gate | Clicking **Generate** on Review runs `generate()`; if signed out it returns `needsAuth` and opens `AuthDialog` ("Your answers are saved. / Create a free account to see your report."), then auto-resumes generation | Signup only — no tier choice, no pricing | `ReportCreatorV2.tsx:285-293,370-373`, `useReportGenerationV2.ts:42-44` |
| 5 | Generation | `generate-report` edge function (JWT + ownership, 5/60min rate limit); ~3-min generating screen; **all 11 sections are generated regardless of tier** and gated ones stored `visible:false` (P0-3) so upgrades unlock inline without regeneration | None on the generating screen (a missed opportunity — see §4) | `generate-report/index.ts:3094-3115` |
| 6 | Report `/report/:reportId` | Owner-only. Content fetched via `get_tier_gated_report` RPC (server strips gated content). Free users see 5 open sections + **6 gated cards**: blurred bars, lock icon, "Unlock with Growth/Scale", button **"Upgrade for $99 / $999"** | **This is where all upgrade pressure lives.** 5 of 11 sections blurred for free users | `ReportView.tsx:226-256`, `ReportGatedSection.tsx:49-83`, `tierPricing.ts` |
| 7 | Checkout | Gated-section button calls `create-checkout` directly (tier + `returnUrl` = the report page). `/pricing` cards do the same with `returnUrl=/pricing`. Server validates price↔tier, verifies JWT, open-redirect allowlist | `/pricing` shows the only free-vs-paid comparison in the product ("consulting $15k–$50k vs $99") | `useCheckout.ts`, `create-checkout/index.ts:82-98,177-231`, `PricingSection.tsx:36-69` |
| 8 | Stripe (one-time payment) | Live prices verified: **Growth $99 AUD, Scale $999 AUD, both one-time**, products tagged `mes_tier` metadata. Webhook (`checkout.session.completed`, signature-verified, MES-39 state machine) upserts `user_subscriptions` with a **no-downgrade guard** | — | Stripe API (read-only), `stripe-webhook/index.ts`, `_shared/stripeEvents.ts:185-245` |
| 9a | Return path A (from a gated section) | Lands back on the report with `stripe_status=success` → toast + **polls `user_subscriptions` every 2s for ~30s**; timeout shows honest "Refresh access" banner | See smoke test G-3: unlocked sections render the wrong card until reload | `ReportView.tsx:42-108,203-221` |
| 9b | Return path B (from `/pricing`) | `PaymentStatusModal` says "Your account has been upgraded" **without polling** — may be premature if the webhook lags; then routes to `/my-reports` | Honesty gap; cross-ref #45 | `Pricing.tsx:15-34`, `PaymentStatusModal.tsx:28-31` |
| 10 | Post-upgrade | Tier flips server-side; report sidebar/sections re-key off `useSubscription`. Member hub has **no upsells** | — | `MemberHub.tsx` |

**Verdict on upgrade-prompt timing:** the "no upgrade wall before the free report" principle
**already holds**. First price exposure is inside the report (or on `/pricing` if deliberately
visited). No change needed to prompt *timing* — the fixes are gating *breadth* (§2) and
post-payment *activation* (§3).

## 2. Gating audit — actual vs target

### 2.1 Per-section, per-tier matrix

"Anonymous" = share-link viewer (`/report/shared/:token`); direct report routes require login
(ProtectedRoute + owner check inside the RPC). ✅ = full content, 🔒 = locked teaser.

| Section | Anon (share) | Free | Growth | Scale | Target (Free/Growth/Scale) | Gap |
|---|---|---|---|---|---|---|
| executive_summary | ✅* | ✅ | ✅ | ✅ | ✅ ✅ ✅ | — |
| swot_analysis | 🔒 | 🔒 | ✅ | ✅ | ✅ ✅ ✅ | **Over-gated: move growth → free** |
| competitor_landscape | 🔒 | 🔒 | ✅ | ✅ | ✅ ✅ ✅ | **Over-gated: move growth → free** |
| first_customers | 🔒 | 🔒 | ✅ | ✅ | ✅ ✅ ✅ (falls under "everything else") | **Over-gated: move growth → free** |
| service_providers | ✅* | ✅ | ✅ | ✅ | ✅ ✅ ✅ | — |
| mentor_recommendations | 🔒 | 🔒 | ✅ | ✅ | 🔒 / ✅ (≥1 mentor) / ✅ | **Matches** (Growth gets the full section — satisfies "at minimum one"; see §5 note on 1-vs-all) |
| investor_recommendations | 🔒 | 🔒 | ✅ | ✅ | ✅ ✅ ✅ (per "only Leads + Mentor ever locked") | **Over-gated: move growth → free** — flagged as an explicit product decision, see §7 |
| events_resources | ✅* | ✅ | ✅ | ✅ | ✅ ✅ ✅ | — |
| action_plan | ✅* | ✅ | ✅ | ✅ | ✅ ✅ ✅ | — |
| setup_compliance | ✅* | ✅ | ✅ | ✅ | ✅ ✅ ✅ | — |
| lead_list | 🔒 | 🔒 | 🔒 | ✅ | 🔒 🔒 ✅ | **Matches** |

\* Share links reveal whatever was visible at the owner's `tier_at_generation` — the shared RPC
hides sections whose **stored** `visible` flag is false.

**Net gap: exactly four sections need `growth` → `free`.** Growth and Scale already match the
target. Free users today see 5/11 sections gated (45% of the report blurred) — the "hollow
report" risk the ticket describes is real and is the whole gap.

### 2.2 Where gating is enforced (the exact sources of truth)

Verified consistent across all of these, in the repo **and live in prod** (2026-07-15):

| # | Source | Role | Location | Live verification |
|---|--------|------|----------|-------------------|
| 1 | `TIER_REQUIREMENTS` + `userTierMeetsRequirement` | Client **UX** gate (which card renders); deny-by-default on unknown tiers | `src/components/report/reportSectionConfig.ts:116-144` | n/a (repo) |
| 2 | `report_templates.visibility_tier` | Drives generation-time `visible:false` marking (`generate-report/index.ts:3106-3115`, fail-closed on unknown tier) | DB table | ✅ queried: 5 × `growth`, 1 × `scale`, 5 × `free`, all active |
| 3 | `get_tier_gated_report(p_report_id)` RPC | **The security-critical strip point** for owners: SECURITY DEFINER, owner check, strips content server-side; MES-38 revoked direct `report_json` SELECT so this is the *only* read path | migration `20260711100000_first_customers_section.sql` | ✅ `pg_get_functiondef` contains the same 6-section map (md5 `4a6c311a…`) |
| 4 | `get_shared_report(p_share_token)` RPC | Strip point for public share links (keys off stored `visible:false`) | same migration | ✅ verified live, same map |
| 5 | `rubric.ts` `TIER_REQUIREMENTS` | Quality-loop mirror (not user-facing, but must move with the rest) | `supabase/functions/report-quality-loop/rubric.ts:26-33` | n/a (repo) |

Supporting enforcement (unchanged by this spike's recommendations): `user_subscriptions.tier` is
service-role-write only (SEC-01); the webhook is the sole upgrade path with a no-downgrade guard;
`fetchMyReports` selects columns only (the old MES-38 `select('*')` leak is closed);
`pollReportStatus` deliberately never pulls `report_json`.

**Client-side-only gates found (flagged per ticket rules):** the anonymous 3-view freemium wall is
localStorage-only by design (conversion nudge, not security — documented in `freemium-tier-gating`
skill). Inside the report, the *choice of card* is client-side but content is already stripped
server-side, so it degrades safely. Blurred match-card "masking" (`ReportMatchCard` `blurred`)
renders redaction glyphs client-side — for report sections the underlying data is stripped
server-side by the RPC, so this is cosmetic layering, not a leak.

**Leads marketplace (adjacent, matters for the Scale promise):** `lead_database_records` now has
real RLS (verified live): preview rows public, full rows only with a matching
`lead_database_purchases` row, admin override. Note this entitlement is **per-database purchase,
not tier-based** — buying Scale does not itself grant marketplace records (see §7).

## 3. Smoke test results

**Environment constraint (material):** the Stripe account is **livemode** (verified read-only:
`acct_…glZn`, live prices only — Growth $99 AUD / Scale $999 AUD one-time). There is no test-mode
key or sandbox/preview payment environment reachable from this session, and the ticket forbids
production test payments. Payment-path results below are therefore **static traces corroborated by
prod evidence**, not synthetic card runs. Prod evidence: `payment_webhook_logs` shows **54/54
events `processed`, zero failed/needs_attention, latest 2026-07-15** — the live payment→tier path
is demonstrably working; the reconcile cron (every 15 min) backstops it.

| # | Path | Result | Notes |
|---|------|--------|-------|
| F-1 | Free: intake → auth-at-generate → report renders | **PASS** (trace) | Auth only at Generate; draft survives login; report lands with 5 open sections |
| F-2 | Free: gated content absent from the network payload | **PASS** | `fetchReport` → RPC strips content server-side; MES-38 column revoke means no alternate read path; polling selects `status` only |
| F-3 | Free: gating breadth vs target matrix | **FAIL** | 5 sections gated, target is 2 (§2.1) |
| G-1 | Growth: checkout from a gated section → Stripe → webhook upserts tier | **PASS** (trace + prod webhook health) | Price↔tier validated server-side; no-downgrade guard; metadata tamper-proofed (AUD-005 closed) |
| G-2 | Growth: return-to-report activation polling | **PASS** | 2s × 15 polling, honest timeout banner + "Refresh access" (MES-45 groundwork is in) |
| G-3 | Growth: **re-render of unlocked sections after tier flips** | **FAIL** | The `['report', reportId]` query is never invalidated (no `queryClient` use in `ReportView.tsx`; `staleTime` 5 min, `refetchOnWindowFocus: false` in `App.tsx:72-79`). The cached payload was stripped pre-payment, so `hasContent` is false and each unlocked section falls into the legacy branch (`ReportView.tsx:248-256`) rendering **`ReportRegenerateSection`: "Content Available with Your Plan… Generate a new report"** — factually wrong (P0-3 stored the content; a refetch would return it) and it pushes a paying user back into the intake. Recovers only on manual page reload. |
| G-4 | Growth: "one mentor recommendation" | **PASS-by-superset** | Growth unlocks the full mentor section (target says "at minimum one"). A literal 1-vs-all split does not exist and would need new server-side partial gating (§5) |
| S-1 | Scale: checkout/activation/lead_list unlock | **PASS** (trace), same G-3 **FAIL** applies | |
| S-2 | Scale: pricing copy vs entitlement | **FAIL** | Scale card sells "investor recommendations" (they unlock at Growth) and "complete leads and TAM maps marketplace" (tier grants no `lead_database_purchases` rows — §7) |
| B-1 | Pricing-page return path (`PaymentStatusModal`) | **FAIL (honesty)** | Modal asserts "Your account has been upgraded" with **no polling**; if the webhook lags, `/my-reports` → report can still show gated cards. The polling logic exists only on the report-return path. Cross-ref #45 |
| X-1 | Free-vs-paid comparison at decision moments | **FAIL (absent)** | No comparison exists at Review, generating screen, or in-report; only `/pricing` has one |

## 4. Proposed three-way entry choice — evaluation and recommended workflow

**Evaluated proposal:** before the report, offer (a) Free report, (b) Growth = free report +
mentor match right away, (c) Scale $999 = free report + leads right away, with a side-by-side
comparison.

**Recommendation: do not place the three-way choice before intake.** Reasons:

1. It reintroduces the exact friction the ticket's own principle forbids ("no upgrade wall before
   the free report") at the highest-intent moment. Today's flow is already clean up to the report.
2. **Mechanics fight it:** checkout requires an authenticated user (`create-checkout` verifies the
   JWT), so a pre-intake paid path forces *signup → payment → intake* — three walls before any
   value, versus zero on the free path. The "right away" promise is also weak: mentor/lead content
   is generated *by* the report run, so a pre-payer waits the same ~3 minutes.
3. **The data says the wall is unnecessary:** live tiers are 24 free / 16 Scale / 5 Growth.
   Scale — the leads promise — already outsells Growth 3:1 through the in-report path. High-intent
   buyers are finding the checkout; what's missing is comparison clarity, not an earlier wall.

**Recommended workflow (report-first, choice at low-friction moments):**

1. **Keep** the single "Generate my free report" entry (homepage → intake → auth at Generate).
2. **Review step — optional order-bump, not a wall:** under the Generate button, a compact
   three-option card ("Free report · Growth $99 adds your mentor matches · Scale $999 adds your
   lead list"), default Free preselected, one tap to continue free. Selecting a paid option runs
   signup + checkout, then generation proceeds; the report opens with those sections already
   unlocked (works today — tier is read at render, and content is stored regardless of tier).
3. **Generating screen — the captive moment (~3 min):** show the side-by-side free-vs-Growth-vs-
   Scale comparison of the *actual sections being written right now* ("Being generated for you:
   SWOT, competitors, action plan… · Unlockable: your mentor matches (Growth $99) · your lead list
   (Scale $999)"). This meets the "comparison before the report" ask without blocking anything.
4. **In-report:** locked Leads/Mentor teasers stay the primary upsell, upgraded from generic blur
   to real teasers (e.g. "8 mentor matches found — here's one, blurred" / sample lead rows per
   #153), plus one compact comparison strip at the end of the report. With only 2 locked sections,
   each gate card can carry section-specific value copy instead of today's generic "get deeper
   insights" line.
5. **Post-payment:** fix G-3/B-1 so the unlock moment is instant and honest (T2 below).

**Copy/UX notes:** lead each gate with counts from the user's own report ("Your report matched
12 providers and 8 mentors — unlock your mentor introductions"); state one-time pricing explicitly
("one-time $99 — not a subscription", the current cards only whisper "one-time"); keep Australian
English; reuse the `/pricing` consulting-cost anchor at the comparison moments.

## 5. Minimal change list to reach the target matrix

One coordinated PR (this is the **approval-gated** entitlements category per CLAUDE.md §11 —
plan sign-off before implementation):

1. **Migration** (single file): `CREATE OR REPLACE` **both** `get_tier_gated_report` and
   `get_shared_report` with `v_tier_requirements = {"mentor_recommendations":"growth",
   "lead_list":"scale"}`; `UPDATE report_templates SET visibility_tier='free' WHERE section_name
   IN ('swot_analysis','competitor_landscape','first_customers','investor_recommendations')`
   (idempotent).
2. **Frontend:** shrink `TIER_REQUIREMENTS` in `reportSectionConfig.ts` to the same two entries.
3. **Rubric:** same shrink in `report-quality-loop/rubric.ts`.
4. **Backfill decision for existing reports:** owners are fine automatically (the RPC + client
   config decide at read time; content already stored). But `get_shared_report` hides based on the
   **stored** `visible:false` flag, so *old share links* would keep hiding newly-freed sections.
   Either a one-off data backfill flipping `visible` for the four sections, or make the shared RPC
   re-derive visibility from the tier map instead of the stored flag.
5. **Copy:** pricing cards in `personaContent.ts` (all three persona variants) + gated-card copy.

**Explicitly not needed:** any Stripe change (prices/products stay), any RLS policy change, any
`user_subscriptions` change.

**"One mentor on Growth vs full on Scale":** today's gating is whole-section. A literal split
needs a new server-side mechanism (RPC caps the mentor match array for growth). Recommend
shipping Growth = full mentor section first (satisfies "at minimum one", zero new machinery) and
treating the 1-vs-all split as an optional follow-up (T6) if Scale needs the extra differentiator.

## 6. Proposed follow-up tickets

| # | Ticket | Scope | Size | Risk flags |
|---|--------|-------|------|-----------|
| T1 | **Re-gate report sections to the target matrix** | §5 items 1–4 (both RPCs + templates + frontend + rubric + share-link backfill decision) | S–M | Freemium funnel · **Touches RLS** (SECURITY DEFINER RPCs; approval-gated; must not reopen #38 — verify with a free account's network payload) |
| T2 | **Post-payment unlock: invalidate the report query + honest pricing-return modal** | On tier flip (poll success / Refresh access), `invalidateQueries(['report', reportId])`; make `PaymentStatusModal` poll (or soften copy to "activating…") before claiming the upgrade | S | Freemium funnel · coordinate with **#45** (this G-3/B-1 finding is its concrete failing case) |
| T3 | **Pricing & gate copy alignment** | Fix investor-recs placement, leads-marketplace claim, add `first_customers` (while still gated), "one-time" prominence, all three persona variants | S | Freemium funnel |
| T4 | **Real teasers for the two locked sections** | Mentor: matched-count + one blurred card. Leads: sample rows per **#153**. Section-specific value copy | M | Freemium funnel · server-side teaser data must come through the RPC (no client-side leak) — Touches RLS |
| T5 | **Free-vs-paid comparison at decision moments** | Generating-screen comparison + end-of-report strip + Review-step order-bump (§4 items 2–3), with `intake_form_events` funnel tracking | M | Freemium funnel |
| T6 | *(Optional)* **Partial mentor gating (1 on Growth, all on Scale)** | New RPC-side array capping | M | Freemium funnel · Touches RLS · only if product wants the split |
| T7 | **Scale ↔ leads-marketplace entitlement decision** | Does Scale include marketplace databases? If yes, grant mechanism (webhook writes `lead_database_purchases`? tier clause in RLS?); if no, fix the Scale card copy (overlaps T3) | S (investigation) | Touches RLS · cross-ref **#47** (refund/downgrade semantics of any grant) |

Suggested order: T1 + T3 together (matrix + copy must land in the same release), T2 next
(or folded into #45), then T4/T5, T6/T7 as product decides.

## 7. Risks & open questions

- **#38 leak regression (High):** the RPCs are the only strip point. The change is loosening-only,
  but both RPCs must move in the same migration and the four sources must never drift — a section
  removed from the frontend map but not the RPC merely over-strips (safe); the reverse leaks.
  Acceptance test for T1: free account's `get_tier_gated_report` network payload contains **no**
  content for `mentor_recommendations`/`lead_list` and full content for the four freed sections.
- **Growth's value proposition (product):** after re-gating, Growth's only report differentiator
  is mentor matching. At $99 vs $999 with live sales already 16:5 in Scale's favour, Growth may be
  fine as a low-anchor — but decide deliberately (strengthen with T4 teasers/T6 split, or accept
  it as the entry paid tier).
- **`investor_recommendations` placement (product, decide before T1):** the ticket's principle
  ("only Leads and Mentor Matching ever locked") puts it free; the current Scale pricing copy
  implies it's paid. This audit follows the principle — confirm explicitly.
- **Refunds/downgrades (#47):** refunds still don't auto-revoke tiers, and the webhook's
  no-downgrade guard means a lower-tier replay can't demote. Once Scale is the only big gate,
  a refunded-$999 user keeps lead access until #47 lands — sequence T7/any grant mechanism after
  or with #47.
- **Free-report cost (MES-35 R5):** all sections are generated for every tier, so re-gating
  changes perceived value, not generation cost. Unchanged, but worth remembering when adding
  teaser generation (T4).
- **Old shared links** (§5 item 4) — pick backfill vs RPC re-derivation in T1's plan.
- **Currency display:** prices are AUD in Stripe but rendered as bare "$99/$999" — cosmetic,
  fold into T3 if desired.
- **No Stripe config changes** are required or recommended by this spike.

## Acceptance-criteria mapping

- Journey map — §1. Gating table + exact sources — §2. Smoke results (Free/Growth/Scale) — §3.
- Upgrade-prompt timing recommendation — §1 verdict + §4 (keep report-first; the wall already
  doesn't exist; fix breadth + activation instead).
- Three-way entry choice evaluated — §4 (recommended workflow: order-bump + generating-screen
  comparison, not a pre-intake wall).
- Follow-up tickets with sizing + risk flags — §6. Risks/open questions — §7.
- **No code, config, or data changes made** — confirmed; all live access was read-only.
