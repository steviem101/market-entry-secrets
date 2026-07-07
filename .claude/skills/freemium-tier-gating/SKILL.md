---
name: freemium-tier-gating
description: The MES tier matrix (anonymous/free/growth/scale/enterprise/admin), where gating is actually enforced, and conversion-safe change rules. Use before touching gated content, paywalls, report visibility, upgrade CTAs, or anything tier-dependent.
---

Last verified: 2026-07-07

# Freemium & Tier Gating

## Purpose
Make tier-gated changes that neither leak paid content nor break the free→paid conversion funnel.
The core lesson from MES audits: **gating is only real where the server enforces it** — know which
gates are security and which are UX.

## When to trigger / when NOT to
- **Trigger:** gated content, report sections, paywalls, upgrade CTAs, lead visibility, pricing,
  anything reading `user_subscriptions` or tier state.
- **Don't trigger:** public directory pages with no gated variant.

## Preconditions — inspect first
- `src/hooks/useSubscription.ts` (tier source of truth client-side),
  `src/components/report/reportSectionConfig.ts` (section↔tier map),
  `src/components/FreemiumGate.tsx`, `src/hooks/useUsageTracking.ts`.
- Live `user_subscriptions` policies (SELECT-own only; **no client write path** — writes are
  service-role only; invariants owned by `stripe-payments-and-webhooks`).

## The tier matrix (verified)
| Audience | Sees | Enforced by |
|---|---|---|
| Anonymous | 3 free detail views, then `PaywallModal` | **Client-only**: localStorage `view_count`, per-item `viewed_<type>_<id>`, `FREE_TIER_LIMIT = 3` (`useUsageTracking.ts:6,64`); `user_usage` insert is analytics, not enforcement. Never call this a security control (`docs/audits/AUTH-JOURNEY-AUDIT.md` §2). |
| `free` | executive_summary, service_providers, events_resources, action_plan | **Server-side**: `fetchReport` gets content via the `get_tier_gated_report` RPC, which strips `visible:false` section *content* before it leaves the DB (verified clean, MES-111 §7); frontend config is defense-in-depth only |
| `growth` | + swot_analysis, competitor_landscape, mentor_recommendations, **investor_recommendations** | `TIER_REQUIREMENTS` (`reportSectionConfig.ts:108-114`) |
| `scale` | + lead_list | same |
| `enterprise` | everything | same |
| admin | own + all reports | RLS `has_role(...,'admin')` on `user_reports` |

- Hierarchy: `TIER_HIERARCHY = ['free','growth','scale','enterprise']`;
  `userTierMeetsRequirement()` **denies unknown tiers** (`reportSectionConfig.ts:116-124`).
- Legacy DB tiers map in `mapDatabaseTier()`: `premium`→`growth`, `concierge`→`enterprise`,
  unknown→`free` (`useSubscription.ts:21-36`). Handle legacy values in any tier logic.
- Tier upgrades unlock sections **without regeneration** — gated content is already in the report
  JSON marked `visible:false` (`generate-report/index.ts:2206-2248`).

## Playbook
1. Before changing a gate, write down the matrix row you're changing: what anonymous / free / paid /
   admin each see before and after (MES Ticket Writing Context requires this).
2. State the enforcement layer explicitly: client UX (FreemiumGate/ListingPageGate/PaywallModal),
   stored-JSON visibility, RLS, or SECURITY DEFINER RPC. If a paid asset's only protection is
   client-side, that's a finding, not a pattern to copy.
3. New gated report section → update **all three** section-truth sources together: frontend
   `SECTION_ORDER`/`TIER_REQUIREMENTS`, DB `report_templates.visibility_tier`, and the quality-loop
   rubric — a template added to only one silently never displays
   (`docs/audits/MES-35-platform-readiness-scan.md` R12).
4. Never write tier state from the client. Upgrades happen only via the Stripe webhook →
   see `stripe-payments-and-webhooks` for invariants and post-payment polling.
5. Conversion safety: gates must fail toward *teaser + upgrade CTA*, not blank content or silent
   unlocks. Keep the paywall copy path working for anonymous users (LeadGenPopup, PaywallModal).

## Red flags / approval gates
- Changing tier prices, tier names, or what a tier includes → product decision, get approval.
- Any change that makes gated data reachable pre-payment (including via `select('*')` on
  `user_reports` — see pitfall 2).
- Weakening `userTierMeetsRequirement`'s deny-by-default on unknown tiers.

## Good / bad examples
- ✅ Gating a new section: add to `TIER_REQUIREMENTS` + `report_templates.visibility_tier` + rubric;
  verify a `free` account sees teaser state, a `growth` account sees content.
- ❌ `if (tier !== 'free') showLeads()` — breaks for legacy `premium` and unknown tiers; use
  `canAccessFeature`/`userTierMeetsRequirement`.
- ❌ Documenting the 3-view localStorage gate as preventing content access — clearing localStorage
  defeats it; it's a conversion nudge.

## Self-check rubric (pass/fail)
- [ ] Matrix (anon/free/growth/scale/enterprise/admin) written for the change; enforcement layer named.
- [ ] Legacy tiers `premium`/`concierge` handled; unknown tier denies.
- [ ] All three section-truth sources updated together (if sections touched).
- [ ] No client-side write of tier state; no paid content reachable below its tier.
- [ ] Teaser/upgrade state exists for the gated-out audiences.

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` (AUD-### findings folded in 2026-07-07).
Inspected 2026-07-07: `src/hooks/useSubscription.ts:7,21-36,60-101`;
`src/components/report/reportSectionConfig.ts:101-124`; `src/components/FreemiumGate.tsx:28-61`;
`src/hooks/useUsageTracking.ts:6,33-79`; `supabase/functions/generate-report/index.ts:1958-2248`;
live `pg_policies` on `user_subscriptions`/`user_reports`. Audits:
`docs/audits/AUTH-JOURNEY-AUDIT.md` §2-3, `docs/audits/MES-35-platform-readiness-scan.md` R1/R12,
`docs/audits/SECURITY_AUDIT.md` §1.1/§6.1.

## Common MES pitfalls (real — AUD refs are MES-111, `docs/prelaunch-audit.md`)
1. **Client-writable tier** — ownership-only UPDATE policy let users self-upgrade to enterprise
   (`SECURITY_AUDIT.md` §1.1; closed as SEC-01). The current P1 variant is checkout-side:
   client `tier` trusted in the lead-purchase branch (AUD-005 — owned by
   `stripe-payments-and-webhooks`).
2. **One `select('*')` undoes the RPC** — `fetchReport` is safe via `get_tier_gated_report`, but
   `fetchMyReports` (`reportApi.ts:210`) still ships full `report_json` with gated content to
   free owners (AUD-004, open P1). Check what the *row/response* exposes, not what the UI renders.
3. **Paid data gated only client-side** — `lead_database_records` is `USING(true)` for any
   authenticated user with no entitlement table behind it (AUD-001/006); preview "masking" is
   cosmetic — raw values sit in the network payload (AUD-035).
4. **Three sources of section truth** drifting (MES-35 R12); **freemium 3-view gate is
   localStorage** — by design it protects no revenue (AUD-034).
5. **Premium sections cost money even for free users** — generated regardless of tier
   (MES-35 R5); cost rules live in `edge-functions-and-cost-controls`.
