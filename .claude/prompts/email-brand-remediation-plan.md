# MES Transactional Email — Brand Remediation Plan (Phase 2)

**Status:** Phase 2 (plan only). No code, function, template, config, or DB changed.
**Date:** 2026-06-13
**Builds on:** `.claude/prompts/email-brand-audit-findings.md` (Phase 1).
**Scope:** MES Platform `xhziwveaiuhzdoutpgrh` + `~/market-entry-secrets` repo only. Content Studio untouched.
**Copy standard applied throughout:** no em dashes, no en dashes. Middle-dot separators where the app uses them.

---

## 2.1 Template architecture — recommendation

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **A. Shared TS layout module** *(recommended)* | A `_shared/email/` module exporting `theme`, `layout()`, `button()`, `infoBox()`, etc., plus one `render()` per email type. `send-email` builds HTML in-code and sends via the **existing-but-unused** `sendViaResend()` raw-HTML path. | Single versioned source of truth; kills the dashboard drift permanently; no new deps; pure Deno/TS (fits edge runtime); `email_log.subject` becomes real; testable. | Hand-written HTML; must render-test across clients. |
| B. React Email | Component templates rendered to HTML. | Nice DX, handles some client quirks. | New dependency + build/bundle step that is awkward inside Deno edge functions; heavier change for 10 small emails. |
| C. DB-stored templates | Templates in Postgres, fetched at send time; editable without deploy. | Non-devs can edit copy; data-driven. | More moving parts; render logic still required; harder to version/review; overkill for v1. |

**Recommendation: Option A now.** It is the only option that converts the un-versioned Resend
dashboard templates (the actual source of the teal drift) into reviewed, version-controlled code, and
the raw-HTML send function already exists (`_shared/email/resend.ts:66`), so the plumbing is a one-line
switch. **Option C is the natural v2** if/when non-developers need to edit copy without a deploy; the
Option A module is structured so its `render()` functions could later read bodies from a table.

### Proposed module shape
```
supabase/functions/_shared/email/
  theme.ts          # colour/font/radius/shadow constants (from §2.2)
  layout.ts         # layout({ preheader, contentHtml }) -> full 600px document (header + footer + dark-mode)
  components.ts     # button(), infoBox(), h1(), p(), divider(), list(), microcopy()
  templates/
    welcome.ts            # render(data) -> { subject, html }
    nurtureEcosystem.ts
    nurtureCaseStudies.ts
    nurtureAiReport.ts
    nurtureEvents.ts
    nurtureUpgradeFree.ts
    nurtureUpgradePaid.ts
    reportCompleted.ts
    paymentConfirmation.ts
    leadFollowup.ts
  render.ts         # renderEmail(email_type, data) -> { subject, html } | null   (replaces resolveTemplateId + mapToResendVariables)
  resend.ts         # unchanged; send-email switches from sendViaResendTemplate() -> sendViaResend()
```
`send-email/index.ts` change is minimal: replace the `resolveTemplateId` + `mapToResendVariables` +
`sendViaResendTemplate` block with `renderEmail(email_type, data)` -> `sendViaResend(to, subject, html)`.
`send-lead-followup` imports the same `layout()`/`button()` so it stops being a bespoke one-off.
Keep `sendViaResendTemplate` in the file during rollout for instant rollback; delete after sign-off.

---

## 2.2 Email design system (the shared module spec) — blue-led

### Layout
- 600px max width, centered, **table-based** (no flex/grid), single column.
- **Page / outer background:** `#F5F8FB` (rc-canvas, cool off-white — confirmed in repo, *not* warm cream).
- **Content card:** `#FFFFFF`, 16px radius, soft shadow `0 10px 26px rgba(16,42,67,.06)` (degrades to flat in Outlook, fine), sitting on the off-white canvas → the "card floating on canvas" look the app uses.
- Outer padding 32–40px; section spacing 24px.

### Header (lighter, app-consistent — not a heavy colour band)
- White/off-white header, **logo image centered** (absolute https URL, see logo task below), ~200px wide.
- A thin **3px azure top rule** (`#1AA3E0`) across the very top to echo the app without a teal/blue block.
- Text fallback if image blocked: **"Market Entry Secrets"** in navy `#102A43`, 700, with `alt` text on the img.

### Colours (map to repo tokens)
| Use | Hex | Token |
|---|---|---|
| Primary (buttons, links) | `#1AA3E0` | `--rc-primary` |
| Primary pressed / gradient end | `#0F6FA0` | `--rc-primary-700` |
| Headings / logo wordmark | `#102A43` | `--rc-ink` |
| Body copy | `#41566B` | `--rc-body` |
| Muted / footer text | `#7387A0` | `--rc-muted` |
| Borders / dividers | `#E6EDF3` | `--rc-line` |
| Page background | `#F5F8FB` | `--rc-canvas` |
| Callout / info box bg | `#F3FAFE` | `--rc-sky-tint` |
| Badge / chip bg | `#E6F4FC` | `--rc-sky-soft` |
| Success accent | `#10B981` | `--rc-success` |
| Star / rating accent (sparingly) | `#F5A623` | `--mes-warning` |
| Card background | `#FFFFFF` | — |

### Typography
- Stack: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
- Optional Google Fonts `<link>` as progressive enhancement only (do not depend on it).
- Sizes: h1 26px/700/`#102A43`; h2 19px/700; body 16px/400/line-height 1.6/`#41566B`; small 13px/`#7387A0`.

### Button (bulletproof)
- Padded-anchor in a table cell; bg `#1AA3E0`; text `#FFFFFF` 16px/700; padding 14px 28px; radius 12px.
- VML wrapper for Outlook so it renders as a solid rounded button (squared corners acceptable in Outlook).

### Info box / callout
- bg `#F3FAFE`; 1px border `#E6EDF3`; 12px radius; 20px padding; navy heading + slate body. Soft, rounded, app-card style.

### Footer
- On the off-white canvas, `#7387A0` 13px. Company name **Market Entry Secrets**; reply guidance
  ("Just reply to this email and it reaches us"); middle-dot microcopy line.
- **Unsubscribe:** transactional mail (welcome, report_completed, payment_confirmation) needs no
  unsubscribe; the **5 nurtures are marketing** and require a functional unsubscribe under the
  Australian Spam Act 2003. See §2.4 compliance note — an unsubscribe link/handler is a Phase 3
  dependency (the opt-out column exists; the link/route does not yet).

### Dark mode
- `<meta name="color-scheme" content="light dark">` + a `@media (prefers-color-scheme: dark)` block
  setting explicit dark canvas/card and keeping azure legible; inline light fallbacks always present.
- Verify azure `#1AA3E0` and off-white behave on auto-inverting clients.

---

## 2.3 Copy rewrite (subject + body) — before / after

Notes: for the 9 dashboard templates the **body "before" is not retrievable from the repo** (it lives
in Resend); the subject "before" is the in-repo DB seed from `email_sequence_steps`. The "after" copy
below is authoritative for Phase 3. Variables shown as `{{VAR}}`. All copy is dash-free.

### 1. welcome  ·  vars: USER_NAME
- **Subject before:** "Welcome to Market Entry Secrets"
- **Subject after:** "Welcome to Market Entry Secrets, {{USER_NAME}}"
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > Welcome to Market Entry Secrets. You now have the shortcut to entering the Australian and ANZ market: vetted service providers, mentors, live market intelligence, and AI generated entry reports, all in one place.
  >
  > The fastest way to see the value: generate your free market entry report. Answer a few questions about your company and we will build a tailored plan in minutes.
  >
  > **[ Create my free market entry report ]**
  >
  > No credit card required · Ready in minutes
  >
  > Prefer to browse first? Explore the service provider directory, upcoming events, and case studies any time.

### 2. nurture_ecosystem  ·  vars: USER_NAME, PROVIDER_COUNT
- **Subject before:** "Your shortcut to the right partners in ANZ"
- **Subject after:** "{{USER_NAME}}, {{PROVIDER_COUNT}} vetted ANZ partners are waiting"
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > Finding the right local partner is usually the slowest part of market entry. We have done the vetting for you: {{PROVIDER_COUNT}} service providers across legal, tax, recruitment, marketing, and operations, each profiled so you can shortlist fast.
  >
  > **[ Browse service providers ]**
  >
  > Filter by sector, location, and service to find the few that fit.

### 3. nurture_case_studies  ·  vars: USER_NAME, CASE_STUDY_TITLE, CASE_STUDY_COMPANY
- **Subject before:** "How [Company] cracked the Australian market"
- **Subject after:** "How {{CASE_STUDY_COMPANY}} entered the Australian market"
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > The best way to plan your entry is to study one that worked. See how {{CASE_STUDY_COMPANY}} approached the Australian market, what they got right, and where the real costs and timelines landed.
  >
  > **[ Read the case study ]**
  >
  > Real numbers, real decisions, no fluff.

### 4. nurture_ai_report  ·  vars: USER_NAME, REPORT_COUNT
- **Subject before:** "Get your personalised market entry plan in minutes"
- **Subject after:** "Your market entry plan, generated in minutes"
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > Your AI market entry report pulls live market research, competitor analysis, regulatory notes, matched service providers, and an action plan into one tailored document, built around your company and target regions.
  >
  > **[ Create my report ]**
  >
  > Founders have already generated {{REPORT_COUNT}} reports. Yours takes minutes.

  *(If `REPORT_COUNT` is empty, the closing line is omitted by the template.)*

### 5. nurture_events  ·  vars: USER_NAME, EVENT_TITLE, EVENT_DATE
- **Subject before:** "Connect with the ANZ market entry community"
- **Subject after:** "On your radar: {{EVENT_TITLE}} · {{EVENT_DATE}}"  *(fallback when no event: "Connect with the ANZ market entry community")*
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > Market entry moves faster when you are in the room. {{EVENT_TITLE}} is coming up on {{EVENT_DATE}}, and it is a strong place to meet partners, mentors, and other founders entering ANZ.
  >
  > **[ See upcoming events ]**

### 6. nurture_upgrade_free  ·  vars: USER_NAME
- **Subject before:** "You've explored the surface. Here's what's deeper."
- **Subject after:** "You have seen the free tier. Here is what sits behind it."
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > Your free access covers the executive summary, service providers, events, and action plan. The deeper layer is where entry decisions actually get made:
  >
  > • Growth: full SWOT, competitor landscape, and mentor recommendations
  > • Scale: targeted lead lists of real buyers and partners
  >
  > **[ See plans ]**
  >
  > One time payment, immediate access, no subscription.

### 7. nurture_upgrade_paid  ·  vars: USER_NAME  *(currently skipped for paid users by the queue, see flag)*
- **Subject after:** "Getting the most from your Market Entry Secrets plan"
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > Thanks for backing your market entry with a paid plan. A few ways to get full value: generate a report for each target region, shortlist three providers and reach out this week, and save the mentors who match your sector.
  >
  > **[ Go to my dashboard ]**

### 8. report_completed  ·  vars: USER_NAME, COMPANY_NAME, REPORT_URL
- **Subject after:** "Your {{COMPANY_NAME}} market entry report is ready"
- **Body after:**
  > Hi {{USER_NAME}},
  >
  > Your market entry report for {{COMPANY_NAME}} is ready. Inside you will find the market landscape, competitor analysis, matched service providers, mentor recommendations, and a step by step action plan.
  >
  > **[ View my report ]**  (→ {{REPORT_URL}})
  >
  > Your report stays in your dashboard, and upgrading unlocks any gated sections instantly.

### 9. payment_confirmation  ·  vars: USER_NAME, TIER_DISPLAY, AMOUNT, CURRENCY
- **Subject after:** "Payment confirmed: your {{TIER_DISPLAY}} access is live"
- **Body after:** *(directly fixes the observed em dash in "now unlocked — including")*
  > Hi {{USER_NAME}},
  >
  > Thank you. Your payment is confirmed and your {{TIER_DISPLAY}} access is now live. Everything in {{TIER_DISPLAY}} is unlocked, including the previously gated sections of your reports.
  >
  > **[ Go to my reports ]**
  >
  > Amount: {{AMOUNT}} {{CURRENCY}} · One time payment · Access does not expire
  >
  > Need a hand? Just reply to this email and it reaches our team.

### 10. lead follow-up (inline)  ·  vars: sector, target_market
- **Subject before:** "Your Bespoke Market Entry Plan is Being Prepared"
- **Subject after:** "Your bespoke market entry plan is on its way"
- **Body after:** *(fixes domain to …secrets.com, brand to "Market Entry Secrets", removes emoji, ranges as "to")*
  > Thank you for your interest. Your bespoke market entry plan for the {{sector}} sector is being prepared.
  >
  > What happens next:
  > • Analysis, within 24 hours: our team reviews your {{sector}} sector and target market.
  > • Custom plan, 24 to 48 hours: we build a personalised entry strategy for your business.
  > • Delivery, within 48 hours: your complete plan arrives in this inbox.
  >
  > Your plan will include market sizing, regulatory requirements, key service providers, target customer insights, entry strategy, risk assessment, and a timeline.
  >
  > Target market: {{target_market}}
  >
  > **[ Contact our team ]**  (→ mailto: the standardised support address, see §2.4)

---

## 2.4 Migration, sender standardisation, compliance, and test plan

### Sender / domain standardisation (resolves the Phase 1 drift)
- **Standard for all transactional + nurture mail:** `from: "Market Entry Secrets <hello@marketentrysecrets.com>"`, `reply_to: "stephen@marketentrysecrets.com"`. `send-lead-followup`'s `noreply@` + missing reply_to and `info@marketentry.com.au` get fixed to this standard.
- **Open decision (yours):** site contact/legal pages use `.com.au`; sending uses `.com`. I will keep **sending on `.com`** and **not** change site pages in this workstream. If you want them reconciled, that is a separate task. Flag only.

### Compliance
- The 5 nurtures are marketing → need a working unsubscribe (Australian Spam Act 2003). Opt-out column
  `profiles.is_email_subscribed` exists and is honoured, but there is **no unsubscribe link/route**.
  Phase 3 will add a footer unsubscribe for nurtures (minimal: a tokenised `/unsubscribe` handler or, as
  a stopgap, a `mailto:` with prefilled subject). Transactional mail is exempt and gets no unsubscribe.

### Migration order (lowest risk first)
1. **Build shared module** (theme/layout/components) + render **welcome** only. Show you the module + rendered sample HTML. *(Phase 3 step 1, approval gate.)*
2. **Pilot: welcome** — wire `send-email` to `renderEmail` for `welcome` only (keep template path for the rest), Resend test send to a real inbox, report renders. Approval gate.
3. Fan out the remaining template emails one at a time: payment_confirmation, report_completed, then the 5 nurtures, then nurture_upgrade_paid. Each: render → test send → short diff. Approval gate per email.
4. **lead follow-up** — re-skin onto the shared `layout()`/`button()`, fix sender/domain/copy. (Flag: appears to have no caller; re-skin anyway, or you confirm deprecation.)
5. Remove `sendViaResendTemplate` + `resolveTemplateId`/`mapToResendVariables` once all migrated. Optionally archive the 9 Resend dashboard templates (manual, not in this repo workstream).

### Logo task (Phase 3 prerequisite)
- Add an optimised horizontal logo at `public/email/logo.png` (≈200–240px wide, <40KB, 2x for retina)
  → stable URL `https://marketentrysecrets.com/email/logo.png`. Source: crop/resize the existing
  `src/assets/market-entry-secrets-logo.png`. (Interim fallback URL `…/favicon.png` works but is 1.4MB/square.)

### Test plan (per email, Phase 3)
- Resend test send to a real inbox (e.g. stephen@irish-insights.com) using the rendered HTML.
- Render check: Gmail web, Apple Mail, Outlook (Windows). Litmus/Email on Acid if available, else manual.
- Verify: every link resolves, `from`/`reply_to` correct, button renders in Outlook, dark mode acceptable, images-off layout readable, no em/en dashes, variables interpolate (incl. empty-variable fallbacks).
- Confirm `email_log` row records the now-real subject and `status: sent`.

### Deployment
- Each changed edge function (`send-email`, later `send-lead-followup`) deploys via **Supabase CLI only**. Never Lovable. No DNS / Resend domain / key changes.

---

## Open decisions carried into Phase 3 (defaults in brackets)
1. Architecture: **Option A** [yes]. 2. Sender: `hello@…com` + reply_to `stephen@…com` [yes].
3. Domain `.com` vs `.com.au` [keep `.com` for sending; site pages untouched]. 4. Background `#F5F8FB` [yes].
5. Optimised logo at `public/email/logo.png` [yes]. 6. `send-lead-followup` re-skin despite no caller [yes].
7. `nurture_upgrade_paid` currently skipped for paid users [re-skin; flag logic]. 8. Nurture unsubscribe link [build minimal in Phase 3].

---

## Phase 2 complete. Approve to begin Phase 3, and confirm the pilot email (default: **welcome**). No changes made.
