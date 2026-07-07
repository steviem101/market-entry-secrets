---
name: content-and-vendor-copy
description: MES house style for content_items, case studies, and provider/vendor copy — the standardised CTA language systems, card layouts, and the mentor anonymity model in copy. Use before writing or editing content, provider descriptions, CTAs, or card copy.
---

Last verified: 2026-07-07

# Content & Vendor Copy

## Purpose
Keep on-platform copy consistent: the single-source CTA systems, the content/case-study structure,
grounded vendor descriptions, and anonymity-safe mentor copy.

## When to trigger / when NOT to
- **Trigger:** writing/editing `content_items`, case studies, provider/vendor descriptions, CTA
  labels, card copy, mentor-facing copy.
- **Don't trigger:** report section prose (→ `report-generation-quality`); importing/enriching the
  underlying rows (→ `directory-data-enrichment`).

## Preconditions — inspect first
- `src/config/reportCta.ts` + `src/components/cta/ReportCTAButton.tsx` (report-funnel CTA),
  `src/components/directory/cardCtaConfig.ts` + `CardCTA.tsx` (directory-card CTA),
  `docs/ui/card-cta-standard.md`, `src/lib/mentorDisplay.ts`, `src/hooks/useContent.ts`.

## Playbook — house style (verified)
- **Australian English**, sentence case, verb-led CTAs (`cardCtaConfig.ts` header).
- **Two single-source CTA systems — use them, don't hardcode:**
  - Report funnel → `reportCta.ts` constants: label **"Generate my free report"**, microcopy
    **"Free · No credit card · Ready in about 3 minutes"**, path `/report-creator`. Render via
    `ReportCTAButton`. The point of the constants is that label and promise "can never drift apart."
  - Directory cards → `CARD_CTA_CONFIG` keyed by entity (service_provider/mentor/investor primary
    "Get warm intro" + "View profile"; lead_list "Find out more"; event "View event"/"Add to
    calendar"; content "Read full guide"; case_study "Read case study"). Gated label
    `Unlock with {tier}` via `tierDisplayName()` (maps legacy `premium→Growth`,
    `concierge→Enterprise`). Render via `CardCTA`; the gated variant is **never a dead end** (routes
    to `/pricing` or `onUnlock`).
- **Content structure:** `content_items` (type + `status='published'` is the only rendered state)
  → `content_sections` → `content_bodies` (attach to a section or float free). Rendered by
  `ContentBodyRenderer`. `content_type` values seen: `article`, `guide`, `case_study`,
  `success_story`, plus `interview`/`best_practice`/`compliance`.
- **Case studies** are `content_items` rows with `content_type='case_study'`, served only at
  `/case-studies/:slug` (non-admins redirect from `/content`), with richer chrome (TLDR, quick
  facts, sources via `case_study_sources`, quotes via `case_study_quotes`, outcome badge
  Success/Failure). Cite sources — case studies are evidence, not marketing.
- **Vendor/provider copy** flows through `normalizeProvider()` safe defaults (`description || ""`,
  arrays `[]`, `is_verified:false`); the SEO/meta description falls back
  `meta_description → tagline → description.slice(0,160)`. Don't assume a field is populated.

## Mentor anonymity in copy (hard rule)
For `is_anonymous` mentors the frontend reads `community_members_public` and uses
`src/lib/mentorDisplay.ts`: show the masked headline instead of the name, **no initials**
(`mentorInitials` returns null → neutral Globe glyph), coarse country label only, hide
title/company and experience-tile logos. Never write copy (or an intro payload) that could
re-identify an anonymous mentor. Server masking is owned by `supabase-rls-and-migrations`; this is
the copy-layer obligation.

## Red flags / approval gates
- Hardcoding a CTA label/colour instead of using `reportCta.ts` / `CardCTA` — the legacy
  `CTAButton.tsx` does exactly this (hardcoded "Get Your Market Entry Report" + orange/red gradient)
  and violates the no-hardcoded-colours rule; don't extend it.
- CTA copy drift — detail-page inline CTAs say "Get Your Report"/"Get Started" instead of the
  canonical "Generate my free report"; new surfaces must use the constant.
- A gated CTA that dead-ends instead of routing to `/pricing`.
- Any mentor copy that reveals name/company/logo/initials for an anonymous mentor.

## Good / bad examples
- ✅ `<ReportCTAButton withMicrocopy />` on a new landing surface.
- ✅ `<CardCTA entity="service_provider" ... />` — standard label + gated fallback to `/pricing`.
- ✅ Case study citing `case_study_sources` inline + a Success/Failure outcome badge.
- ❌ `<button className="bg-gradient-to-r from-orange-500 to-red-500">Get Your Report</button>`.
- ❌ Rendering an anonymous mentor's initials or company in a card.

## Self-check rubric (pass/fail)
- [ ] Report CTA via `reportCta.ts`/`ReportCTAButton`; card CTA via `CARD_CTA_CONFIG`/`CardCTA`.
- [ ] Australian English, sentence case, verb-led; no hardcoded CTA colours.
- [ ] Gated CTAs route to `/pricing`/`onUnlock`, never dead-end.
- [ ] Case-study copy cites sources; outcome framed honestly (Success/Failure).
- [ ] Anonymous mentors: masked name, no initials/logo/company in any copy or intro payload.

## Evidence
Inspected 2026-07-07: `src/config/reportCta.ts`, `src/components/cta/ReportCTAButton.tsx`,
`src/components/directory/cardCtaConfig.ts` + `CardCTA.tsx`, `docs/ui/card-cta-standard.md`,
`src/hooks/useContent.ts`, `src/pages/ContentDetail.tsx`/`CaseStudyDetail.tsx`,
`src/hooks/useServiceProviders.ts` (`normalizeProvider`), `src/lib/mentorDisplay.ts` +
`.test.ts`, `src/components/mentors/MentorCard.tsx`. Cross-refs: `freemium-tier-gating` (gated
labels/tiers), `supabase-rls-and-migrations` (mentor masking), `directory-data-enrichment`.

## Common MES pitfalls (real)
1. **CTA drift** — canonical label is "Generate my free report" but `CTAButton.tsx` and detail-page
   inline CTAs use different wording; new copy must use the `reportCta.ts` constant.
2. **Hardcoded CTA colours** — `CTAButton.tsx` uses an orange/red gradient against the HSL-token
   rule (`mes-codebase-conventions`).
3. **Only `published` renders** — draft `content_items` exist in schema but never surface; don't
   rely on a non-published state showing.
4. **Anonymity leaks in copy** — initials, company, or logos re-identify a masked mentor; use
   `mentorDisplay.ts` helpers.
