# Directory Card & CTA Audit — Phase 0 (read-only findings)

**Ticket:** Directory card + CTA audit / standardisation (`claude/directory-card-cta-audit-ghwngz`)
**Date:** 2026-06-28
**Scope:** Every member-facing directory card across the MES platform (list / grid / detail surfaces) and the AI report's match cards. Read-only — no app code changed in this phase.
**Method:** Source read of every `*Card*.tsx` component plus the pages/sections that render them, the gating/paywall components, and the leads price surfaces. All strings below are quoted verbatim from the code.

> **Headline:** The `Get warm intro` primary CTA (Change 1) is **already partly implemented** on the three main directory cards (`CompanyCard`, `MentorCard`, `PersonCard`) and the `MentorContactModal` already persists to `mentor_contact_requests`. The real remaining work is (a) **consistency** — country-page cards, the report match card, events/content/leads use different verbs and layouts; (b) **Change 2** — leads cards still surface raw price everywhere; (c) **one unified gated/blur vocabulary**. This is a convergence job more than a greenfield build.

---

## 1. Card component inventory

| # | Component | File | Entity / table | Rendered on | Design system |
|---|-----------|------|----------------|-------------|---------------|
| 1 | `CompanyCard` (+ `company-card/*` parts) | `src/components/CompanyCard.tsx` | service_providers, **also** trade_investment_agencies & innovation_ecosystem | `/service-providers`, `/government-support`, `/innovation-ecosystem` | shadcn + theme tokens |
| 2 | `MentorCard` | `src/components/mentors/MentorCard.tsx` | community_members | `/mentors`, `/mentors/:cat` | shadcn + theme tokens |
| 3 | `PersonCard` | `src/components/PersonCard.tsx` | community_members | sector pages (`CommunityMembersSection`) | shadcn + theme tokens |
| 4 | `InvestorCard` | `src/components/investors/InvestorCard.tsx` | investors_public | `/investors` | shadcn + theme tokens |
| 5 | `EventCard` | `src/components/EventCard.tsx` | events | `/events`, related-events grids | shadcn `Card` |
| 6 | `LeadCard` | `src/components/LeadCard.tsx` | leads / lead_databases | `/leads`, `/sectors/:slug`, `/leads/:slug` related | shadcn `Card` |
| 7 | `ContentCard` | `src/components/content/ContentCard.tsx` | content_items | `/content`, featured content | shadcn `Card` |
| 8 | Case-study cards (inline) | `src/pages/CaseStudies.tsx` | case_studies / content_items | `/case-studies` | shadcn `Card` (bespoke grid+list) |
| 9 | `FeaturedItemCard` | `src/components/featured-items/FeaturedItemCard.tsx` | mixed (provider/event/hub/agency) | featured sections | shadcn `Card` |
| 10 | `SearchResultCard` | `src/components/search/SearchResultCard.tsx` | mixed (master search) | search results | shadcn `Card` |
| 11 | `ReportMatchCard` | `src/components/report/ReportMatchCard.tsx` | report matches (all entity types) | `/report/:reportId` | shadcn `Card` |
| 12 | Country `ServiceCard` | `src/components/countries/parts/ServiceCard.tsx` | service_providers | `/countries/:slug` | **`mes-*` custom tokens** |
| 13 | Country `MentorCard` | `src/components/countries/parts/MentorCard.tsx` | community_members | `/countries/:slug` | **`mes-*` custom tokens** |
| 14 | Country `InvestorCard` | `src/components/countries/parts/InvestorCard.tsx` | investors | `/countries/:slug` | **`mes-*` custom tokens** |
| 15 | Country `AgencyCard` | `src/components/countries/parts/AgencyCard.tsx` | country_trade_organizations | `/countries/:slug` | **`mes-*` custom tokens** |

Supporting / non-card surfaces audited: `MentorContactModal`, `PersonModal`, `CompanyModal`, `LeadPreviewModal`, `LeadDatabaseDetailHero`, `LeadDatabaseDetailContent`, `EventDetailContent`, `FreemiumGate`, `PaywallModal`, `ListingPageGate`, `UsageBanner`, `ReportSection`, `ReportGatedSection`.

---

## 2. Primary CTA copy & behaviour, by card

### Already on the standard ("Get warm intro" pattern)

| Card | Primary CTA (exact) | Secondary CTA | On-click behaviour |
|------|--------------------|---------------|--------------------|
| `CompanyCard` | `Get Warm Intro` (Handshake icon) | `View Profile` (outline) | If `contact_email`/`contact` present → `mailto:`; else → `onContact(company)` callback |
| `MentorCard` | `Get Warm Intro` (Handshake icon) | `View Profile` (outline) | Opens `MentorContactModal` via `onContact(mentor)` |
| `PersonCard` | `Get Warm Intro` (Handshake icon) | `View Profile` (outline) | `onContact(person)` → `useSectorHandlers`: `mailto:` if email, else opens URL/toast |

`MentorContactModal`: title `Get a Warm Intro to {mentor.name}`; submit `Send Request` / `Sending...`; **inserts to `mentor_contact_requests`, falls back to `directory_submissions`**; success toast `Intro request sent! ... We'll connect you with {mentor.name} within 48 hours.`

> **These three are the template to converge everything else onto.** Note capitalisation is Title Case (`Get Warm Intro`); the standard should normalise to sentence case (`Get warm intro`).

### Off-standard / inconsistent

| Card | Primary CTA (exact) | Issue |
|------|--------------------|-------|
| `InvestorCard` | `View Profile` (default) + `Website` (outline) | **No warm-intro path.** Investors are a target directory for Change 1. |
| Country `ServiceCard` | `View {provider.name} profile` (link) | Verb/format drift vs `View Profile`; link-style not button |
| Country `MentorCard` | `Request intro to {firstName}` (link) | Different verb (`Request intro` vs `Get warm intro`); routes to `/mentor-connections` page, not the modal |
| Country `InvestorCard` | `See {investor.name} portfolio` (link) | Bespoke verb; no intro path |
| Country `AgencyCard` | `View {agency.name} profile` (link) | Bespoke; no intro path |
| `EventCard` | `View Details` (default) + `Add to Calendar` | Standard wants `View event` |
| `EventDetailContent` (organizer) | `Contact Organizer` / `Organizer Website` | `mailto:` / external — fine, but verb differs from card vocabulary |
| `ContentCard` | *(none — whole card is a `Link`)* | Standard wants explicit `Read more`; currently no button at all |
| Case-study cards | *(none — whole card is a `Link to /case-studies/:slug`)* | Same as content |
| `FeaturedItemCard` | `View Details` | Drift vs `View Profile` / `Read more` |
| `SearchResultCard` | *(none — whole card is a `Link`)* | Acceptable for search rows; note for consistency |
| `ReportMatchCard` | `{linkLabel}` default `View Profile` (+ `Website`/`LinkedIn` ghost) | No warm-intro in report; gated copy `Upgrade to unlock` |

---

## 3. Dead / weak CTAs

- The planning doc flagged a directory **"Contact" button that does nothing**. In the **current** code that has already been replaced by `Get Warm Intro` on `CompanyCard`/`MentorCard`/`PersonCard`, so there is **no longer a literal dead "Contact" button** on those three. **However:**
  - `CompanyCard`'s warm-intro path **silently degrades**: when a record has no `contact_email`/`contact`, it calls `onContact(company)` — and whether that does anything depends on the page passing a handler. On `/service-providers` / `/government-support` / `/innovation-ecosystem` this needs verifying per-page; where no handler is wired, the button is effectively a no-op. **(Flag: confirm every render site passes a working `onContact`.)**
  - `PersonCard` "View Profile" → `useSectorHandlers.handleViewProfile` falls back to a `Profile details for {name} coming soon.` toast when there's no website — a soft dead-end.
  - Country `MentorCard` routes intro requests to `/mentor-connections` (a page) rather than the `MentorContactModal` capture flow — inconsistent and lower-intent.
- `InvestorCard`, country `InvestorCard`, country `AgencyCard`, `CompanyCard`-on-agencies: **no warm-intro affordance at all** for entities the ticket says should have one.

---

## 4. Leads price surfaces (Change 2 target list)

Every place a raw price is exposed today. **All of these must lose the price as a primary action** and move to a soft enquiry CTA; `record_count` stays as a value signal.

| Surface | File | Price/price-CTA (exact) | Field |
|---------|------|------------------------|-------|
| `LeadCard` CTA | `src/components/LeadCard.tsx` | `Buy Now — $${price_aud.toLocaleString()}` (else `Get Free Access` / `Get Instant Access`) | `price_aud`, `is_free` |
| `LeadCard` header overlay | same | `{record_count.toLocaleString()} records` | `record_count` *(keep as value signal)* |
| `LeadDatabaseDetailHero` info grid | `src/components/leads/detail/LeadDatabaseDetailHero.tsx` | `$${price_aud.toLocaleString()} AUD` / `Free` (DollarSign icon) | `price_aud`, `is_free` |
| `LeadDatabaseDetailHero` CTA | same | `Get Instant Access — $${price_aud.toLocaleString()} AUD` | `price_aud` |
| `LeadDatabaseDetailContent` sidebar | `src/components/leads/detail/LeadDatabaseDetailContent.tsx` | `$${price_aud.toLocaleString()} AUD` under a `Price` label | `price_aud`, `is_free` |
| `LeadDatabaseDetailContent` CTA | same | `Get Instant Access — $${price_aud.toLocaleString()}` (no "AUD") | `price_aud` |
| `LeadPreviewModal` CTA | `src/components/leads/LeadPreviewModal.tsx` | `Get Instant Access — $${price_aud.toLocaleString()} AUD` | `price_aud` |
| `LeadPreviewModal` lock copy | same | `Sign in or purchase to unlock full access to {record_count} records` | `record_count` |
| `Leads.tsx` sort dropdown | `src/pages/Leads.tsx` | `Price: Low to High` / `Price: High to Low` (sorts on `price_aud`) | `price_aud` |
| Report `lead_list` section | `ReportView.tsx` → `ReportMatchCard` | **No price shown** (already clean) | — |

**CTA price-suffix is itself inconsistent:** `Buy Now — $1,799` (no AUD) vs `Get Instant Access — $1,799 AUD` vs `Get Instant Access — $1,799` (no AUD). Change 2 deletes all of these.

> On-click today: every leads CTA calls `onCheckout(lead)` → Stripe one-time checkout. Change 2 replaces this with **intent capture** (no checkout): enquiry into `lead_submissions` + a staff notification.

---

## 5. Gated / blur state wording (needs one vocabulary)

Today there are at least **five** different gating vocabularies:

| Surface | Component | Exact copy |
|---------|-----------|-----------|
| Listing pages (3-view freemium gate) | `PaywallModal` via `ListingPageGate`/`FreemiumGate` | Title `Sign Up to Continue`; body `You've reached your limit of 3 free views. Sign up to get unlimited access to all {description}.`; button `Sign Up for Free` |
| Usage banner | `UsageBanner` | `{n} free view(s) remaining. Sign up for unlimited access.` / `You've reached your limit of 3 free views. Sign up to continue browsing.`; button `Sign Up Free` |
| Report gated section | `ReportGatedSection` | Heading `Upgrade to {Growth\|Scale\|Enterprise}`; subtext `Unlock the {title} section and get deeper insights...`; button `Upgrade for ${price}` / `Contact Us` (enterprise) / `Starting checkout...` |
| Report match card (blurred) | `ReportMatchCard` | `Upgrade to unlock` (default) or per-match `{upgrade_cta}` |
| Leads preview blur | `LeadPreviewModal` | `Sign in or purchase to unlock full access to {record_count} records` |

`PaywallModal` `contentType → description` map (drives the freemium copy) is already comprehensive (content, case-study, service_providers, community_members, mentors, leads, events, trade_investment_agencies, innovation_ecosystem, investor, locations, countries, sectors).

> Two **distinct** gate types exist and must stay distinct in the standard:
> 1. **Freemium 3-view gate** (anonymous browsing limit) — "Sign up to continue" family.
> 2. **Tier/visibility gate** (paid report sections / locked matches) — "Unlock with [tier]" family.
> The ticket's "Unlock with [tier]" standard applies to **#2**. The freemium #1 wording is out of scope to change behaviourally; we only normalise its phrasing. **No RLS / visibility_tier / 3-view logic changes.**

---

## 6. Layout / token inconsistencies

| Aspect | Main cards (1–11) | Country cards (12–15) |
|--------|-------------------|------------------------|
| Radius | `rounded-lg` (8px) | `rounded-xl` (12px) |
| Shadow | `hover:shadow-lg` + `hover:-translate-y-1` | none (border only) |
| Padding | `p-6` | `p-5` |
| Grid gap | `gap-6` | `gap-4` |
| Tokens | shadcn theme (`bg-card`, `border-border`, `text-muted-foreground`) | bespoke `mes-card`, `mes-ink`, `mes-border`, `mes-teal-dark`, `mes-blue-light` |
| CTA style | `Button` (default/outline) | `Button variant="link"` |

Other drift: `ContentCard`/case-study/`SearchResultCard` make the **whole card a link with no button**, while provider/mentor cards use an explicit two-button CTA row. `FeaturedItemCard` uses a gradient `View Details`. None of the main cards import the shadcn `Card` primitive directly — they hand-roll `div.bg-card.border.rounded-lg.p-6` (so a shared primitive would also de-duplicate styling).

---

## 7. Staff-notification path that already exists (for Phase 2 wiring)

- `public.activity_events` table + `dispatch_activity_event()` DB trigger → **`slack-notify` edge function** (`supabase/functions/slack-notify/index.ts`) routes events to Slack channels by `event_type` (routing table with channel/emoji/severity/realtime/mention). Authenticated by `x-webhook-secret`.
- **Recommended Phase 2 wiring:** warm-intro and leads-enquiry writes land in the existing public-funnel tables (`mentor_contact_requests` / `directory_submissions` / `lead_submissions`); a DB trigger on those tables emits an `activity_events` row, which the existing pipeline delivers to `#mes-ops`. This reuses infrastructure rather than adding bespoke Slack calls from the client, and keeps anon writes confined to the approved funnel tables.

---

## 8. Audit conclusions → drives the standard (Phase 1)

1. **Adopt the existing `Get Warm Intro` pattern as the standard**, normalise to sentence case (`Get warm intro`), and **extend it to investors + agencies** (`InvestorCard`, country `AgencyCard`/`InvestorCard`, and `CompanyCard`-on-agencies already has it).
2. **Route every warm-intro click through one capture flow** (a shared intro-request modal writing to a funnel table), not a mix of `mailto:` / `/mentor-connections` / silent no-op callbacks.
3. **Drive all CTA copy from one config map** keyed by entity type, so wording lives in one place.
4. **Leads:** remove every `price_aud` surface listed in §4 from the card layer; replace the primary CTA with a soft enquiry (`Find out more` / `Enquire about this list`) writing to `lead_submissions`; keep `record_count`; drop the price sort options.
5. **Unify gated wording into two families** (freemium "Sign up to continue" — phrasing only; tier "Unlock with [tier]").
6. **Optionally** introduce a shared `DirectoryCard` primitive + `CardCTA` to converge radius/shadow/padding/tokens and collapse the country `mes-*` cards onto theme tokens.

See `docs/ui/card-cta-standard.md` for the proposed standard and the per-entity wording table. **Stopping for sign-off before any app code.**
