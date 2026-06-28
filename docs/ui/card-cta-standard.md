# Directory Card + CTA Standard — Phase 1 (recommendation, awaiting sign-off)

**Ticket:** Directory card + CTA audit / standardisation
**Status:** 🟡 Proposed — **stop for sign-off before Phase 2 implementation.**
**Companion:** `docs/ui/card-cta-audit.md` (Phase 0 findings)
**Conventions:** Australian English · sentence case · verb-led · one primary CTA per card · HSL design tokens · shadcn/ui + Tailwind · 2xl radius + soft shadow.

---

## 1. The card anatomy

One shared **`DirectoryCard`** primitive (wrapping shadcn `Card`) with a fixed slot order. Every directory renders through it via a thin per-entity adapter that maps its data to the slots — no bespoke card markup per page.

```
┌─────────────────────────────────────┐
│ [media / logo]            [bookmark] │  ← media + save affordance
│ Title                       (badge)  │  ← title + optional featured/verified badge
│ meta line (location · founded · …)   │  ← muted meta
│ [tag] [tag] [tag] +n                 │  ← category / sector / specialty tags (max 3 + overflow)
│ Short description (line-clamp-2/3)    │  ← supporting copy
│ — optional value signal —            │  ← e.g. "12,500 records", "3 mentors matched"
│ [ Primary CTA ]      [ Secondary ]   │  ← CardCTA row (see §3)
└─────────────────────────────────────┘
```

**Visual tokens (single source of truth):**

| Property | Value |
|----------|-------|
| Radius | `rounded-2xl` |
| Border | `border border-border` |
| Surface | `bg-card text-card-foreground` |
| Shadow | `shadow-sm` resting → `hover:shadow-lg` |
| Hover lift | `hover:-translate-y-1 transition-all duration-300` |
| Padding | `p-6` (compact variant `p-5` for dense country/sector grids) |
| Grid gap | `gap-6` |

All colours via HSL theme tokens (`--primary`, `--border`, `--card`, `--muted-foreground`). **Retire the bespoke `mes-*` country-card tokens** in favour of the theme tokens (or alias `mes-*` to the theme so the country cards converge without a visual jump — implementer's call at build time).

---

## 2. `CardCTA` + the copy config map

All button wording lives in **one config map** keyed by entity type — never hard-coded per page.

```ts
// src/components/directory/cardCtaConfig.ts  (Phase 2)
export type DirectoryEntity =
  | 'service_provider' | 'mentor' | 'investor' | 'agency'
  | 'lead_list' | 'event' | 'content' | 'case_study' | 'innovation_hub';

export interface CtaConfig {
  primary: { label: string; action: 'warm_intro' | 'enquire' | 'navigate' | 'external'; icon?: 'handshake' | 'arrow' | 'mail' };
  secondary?: { label: string; action: 'navigate' | 'save' };
  gatedLabel: (tier: string) => string;   // tier/visibility gate only
}
```

| Entity | Primary CTA | Action | Secondary | Gated (tier) |
|--------|-------------|--------|-----------|--------------|
| `service_provider` | **Get warm intro** | warm_intro (modal) | View profile | Unlock with {tier} |
| `mentor` | **Get warm intro** | warm_intro (modal) | View profile | Unlock with {tier} |
| `investor` | **Get warm intro** | warm_intro (modal) | View profile | Unlock with {tier} |
| `agency` | **Get warm intro** | warm_intro (modal) | View details | Unlock with {tier} |
| `lead_list` | **Find out more** | enquire (modal) | View details | Unlock with {tier} |
| `event` | **View event** | navigate | Add to calendar | — |
| `content` | **Read more** | navigate | Save | Unlock with {tier} |
| `case_study` | **Read more** | navigate | Save | Unlock with {tier} |
| `innovation_hub` | **Get warm intro** | warm_intro (modal) | View details | Unlock with {tier} |

**Wording rules:**
- Sentence case (`Get warm intro`, not `Get Warm Intro`) — normalises the current Title Case usage.
- Verb-led, present tense, no entity name interpolation in the button (`View profile`, **not** `View {name} profile`). This kills the country-card variants `View {name} profile` / `See {name} portfolio` / `Request intro to {firstName}`.
- One **primary** (filled, `Button` default) + one **secondary** (outline). Bookmark/save is an icon affordance in the media row, not a third text button.
- **Never a raw price as a CTA.** (Deletes `Buy Now — $1,799`, `Get Instant Access — $… AUD`, etc.)

**Recommended exact strings** (resolving Open Question 4): **`Get warm intro`** and **`Find out more`** as the visible primary labels. `Find out more` tested over `Enquire about this list` for being shorter and lower-friction; the enquiry modal heading can carry the fuller "Enquire about this lead list" framing.

---

## 3. Change 1 — "Get warm intro" flow

**Surfaces:** service providers, mentors, investors, trade/investment agencies (cards + detail + modals + the country-page variants). Already live on `CompanyCard`/`MentorCard`/`PersonCard`; extend to `InvestorCard`, country `InvestorCard`/`AgencyCard`, and converge the country `MentorCard`/`ServiceCard` link-CTAs.

**One shared `WarmIntroModal`** (generalise the existing `MentorContactModal`):
- Title: `Get a warm intro` / `Get a warm intro to {name}` when a name is known.
- Fields: name*, email*, company, country, message* (reuse current modal's fields).
- Submit `Send request` → **persist to a public-funnel table** (anon-insert allowed):
  - mentors/people → `mentor_contact_requests` (existing), fallback `directory_submissions`.
  - providers / investors / agencies / hubs → `directory_submissions` with `submission_type` distinguishing the entity (per CLAUDE.md: `{ submission_type, contact_email, form_data }`, `form_data` = structured object holding entity id/type + requester).
- **Notify `#mes-ops`** via the existing pipeline: a DB trigger on the funnel table emits a `public.activity_events` row (`event_type` e.g. `intro.requested`) which `slack-notify` already routes. No client-side Slack calls; no new secrets in the bundle.
- Success toast: `Intro request sent — we'll be in touch within 48 hours.`

**Gating:** for a tier-gated record the CTA shows the **gated state** (`Unlock with {tier}`) instead of opening the modal — never a dead end. (No change to who is gated; visibility_tier/RLS untouched.)

**`mailto:` degradation:** replace `CompanyCard`'s current `mailto:`-when-contact-exists branch with the modal so every intro is captured + notified consistently (today a `mailto:` leaves no record and no Slack ping).

---

## 4. Change 2 — leads card

- **Remove every `price_aud` surface** listed in audit §4 from the card/detail/preview/sort layers. No price label, no price in the CTA, no `Price: Low→High` sort options.
- **Primary CTA → `Find out more`** (entity `lead_list`), opening a **`LeadEnquiryModal`** (the `WarmIntroModal` with lead framing): "Enquire about this lead list".
- On submit: **capture intent into `lead_submissions`** (`form_data` = `{ lead_id, lead_title, record_count, requester… }`) + `#mes-ops` via the same trigger→`activity_events`→`slack-notify` path. **No Stripe checkout** from the card.
- **Keep `record_count`** as a value signal, reframed as interest not price: e.g. `12,500 verified records` stays; the preview-blur lock copy changes from `Sign in or purchase to unlock…` to `Enquire to access the full list` (no "purchase").
- Curated AUD $1,799 SKUs are **protected, not removed** — only the *card surface* changes; pricing/SKU/checkout config is out of scope.

---

## 5. Unified gated / blur vocabulary

Two **distinct** families, both wording-only (no behaviour, RLS, visibility_tier, or 3-view-gate changes):

1. **Freemium 3-view gate** (anonymous browsing) — keep `PaywallModal`/`UsageBanner`. Normalise to one phrasing:
   - Title `Sign up to continue` · body `You've reached your limit of 3 free views. Sign up for unlimited access to {description}.` · button `Sign up for free`.
2. **Tier / visibility gate** (paid report sections, locked matches) — single pattern: **`Unlock with {Tier}`** (e.g. `Unlock with Growth`). Applies to `ReportMatchCard` (replaces `Upgrade to unlock`), `ReportGatedSection` heading, and any gated directory card. The action button keeps its existing checkout/`Contact us` behaviour; only the label standardises.

---

## 6. Implementation shape (Phase 2 preview — not yet built)

```
src/components/directory/
  DirectoryCard.tsx        // shared primitive (slots + tokens)
  CardCTA.tsx              // renders primary/secondary/gated from config
  cardCtaConfig.ts         // the copy map (single source of CTA wording)
  WarmIntroModal.tsx       // generalised from MentorContactModal
  LeadEnquiryModal.tsx     // thin wrapper of WarmIntroModal, lead framing
  useIntroRequest.ts       // persist to funnel table + emit activity_event
```
Existing per-entity cards become thin adapters mapping data → `DirectoryCard` slots + an entity key into `cardCtaConfig`. Country `mes-*` cards fold onto the same primitive.

**Guardrail compliance:** anon writes only to `mentor_contact_requests` / `directory_submissions` / `lead_submissions`; `slack-notify` reused (no new client secrets); `types.ts` untouched (cast `(supabase as any)` where needed); Deno+esm.sh for any trigger function; HSL tokens; Australian English; Content Studio project untouched.

---

## 7. Open questions for sign-off

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Where do warm-intro/enquiry requests route — Slack only, CRM, both? | **Slack `#mes-ops` via existing `activity_events`→`slack-notify`** now; CRM out of scope for this ticket. |
| 2 | Does the contact-process-flow ticket land first, or stub here? | **Stub here** — funnel-table write + Slack ping is already feasible with existing infra; full routing/SLA owned by the other ticket. |
| 3 | Is `Get warm intro` gated (paid-only) on some directories, or free lead-gen? | **Free lead-gen capture** for ungated records (maximises intent capture); gated records show `Unlock with {tier}`. |
| 4 | Exact wording: `Get warm intro` vs `Request intro`; `Find out more` vs `Enquire about this list`? | **`Get warm intro`** + **`Find out more`** (modal heading carries the fuller enquiry framing). |
| 5 | Keep any price signal on leads (`from $…`) or remove all? | **Remove all** per the ask; keep `record_count` as the value signal. |

**Awaiting sign-off on §2 wording table, §3–4 flows, §5 gated vocabulary, and the §7 answers before writing Phase 2 code.**
