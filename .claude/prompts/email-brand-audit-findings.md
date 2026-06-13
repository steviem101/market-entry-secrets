# MES Transactional Email — Brand Consistency Audit (Phase 1 Findings)

**Status:** Phase 1 complete (read-only). No code, function, template, config, or DB changed.
**Date:** 2026-06-13
**Scope:** MES Platform Supabase project `xhziwveaiuhzdoutpgrh` + `~/market-entry-secrets` repo only.
**Out of scope (untouched):** Content Studio `rcgaviwbsudouvfwzydq`. Nothing in this audit read, wrote, or deployed against it.
**Method:** repo grep/read + one read-only `information_schema` query against the MES project.

---

## 0. Headline finding (this changes the project)

**The brand problem does not live in the repo. It lives in the Resend dashboard.**

9 of the 10 distinct emails are **Resend-dashboard-hosted templates**. The repo holds only their
**template IDs** (`_shared/email/resend-templates.ts`) and a variable-mapping function. The actual
HTML — header, colours, buttons, footer, the teal palette you saw in the live Welcome / Payment
emails, and the em dashes — is stored in the Resend dashboard and is **not in version control**.

Consequences that reshape Phases 2–3:

1. The prompt's assumption #7 ("likely duplicated inline HTML copy-pasted across edge functions")
   is **largely false for the repo**. There is exactly **one** inline-HTML email in code
   (`send-lead-followup`), and it is **already blue** (`#2563eb`), not teal. The other nine carry
   **zero HTML in the repo**. The duplication/drift is happening **inside the Resend dashboard**,
   which is exactly why it drifted to the wrong (Content Studio) palette unnoticed.
2. You **cannot re-skin the nine emails by editing repo code today** — there is no email HTML there
   to edit. Two paths exist (decided in Phase 2):
   - **Repatriate** the templates into the repo as a shared TS module and switch `send-email` from
     `sendViaResendTemplate()` (dashboard) to `sendViaResend()` (raw HTML built in code). The raw-HTML
     send path **already exists and is unused** (`_shared/email/resend.ts:66`). This makes the
     blue-led design system the single version-controlled source of truth and permanently kills the
     dashboard drift. **This is the recommended direction and matches the prompt's Option A.**
   - Or hand-edit each of the 9 templates in the Resend dashboard (not version-controlled, drift-prone,
     re-creates the exact failure mode). Not recommended.
3. The repo's design tokens are **already correct and blue-led.** Real teal `#2B7A8C` appears
   **nowhere** in the repo. Even the legacy token *named* `--mes-teal` has been reassigned to the
   app's azure blue (`200 85% 55%`) with an explicit "aligned to the app palette" comment. So there
   is no token to fix — the email side simply has to *adopt* what the app already uses.

**Root-cause statement:** *10 distinct transactional emails. 9 are Resend-dashboard-hosted (no HTML
in repo); 1 is inline HTML in an edge function (`send-lead-followup`). There is no shared email
template module producing HTML, and no DB-stored templates. Brand drift to the Content Studio teal
palette occurred in the un-versioned Resend dashboard templates. `from`/`reply_to` identity is
inconsistent across the two systems, and email contact addresses use a different TLD (`.com.au`) than
the sending domain (`.com`).*

---

## 1. Email-sending architecture

```
SYSTEM A — Template-based (9 emails)
  trigger ──> send-email/index.ts
                ├─ resolveTemplateId()      (_shared/email/resend-templates.ts)  → Resend template UUID
                ├─ mapToResendVariables()   (_shared/email/resend-templates.ts)  → {{VAR}} values
                └─ sendViaResendTemplate()  (_shared/email/resend.ts)            → POST api.resend.com
                                                                                   body.template = { id, variables }
        from:     "Market Entry Secrets <hello@marketentrysecrets.com>"   (resend.ts:5)
        reply_to: "stephen@marketentrysecrets.com"                        (resend.ts:6)
        HTML/subject: defined in the Resend dashboard (NOT in repo)

SYSTEM B — Inline HTML (1 email)
  trigger ──> send-lead-followup/index.ts   → builds emailHtml string in code → POST api.resend.com
        from: "Market Entry Secrets <noreply@marketentrysecrets.com>"     (index.ts:173)  ← different!
        reply_to: (none)                                                                  ← different!
        HTML/subject: inline in the function (IN repo)

SEPARATE SURFACE — Supabase Auth emails (signup confirm, magic link, password reset, email change)
        Managed in the Supabase dashboard, not in code. Email confirmation is ON
        (AuthCallback.tsx shows "Email verified successfully"). Delivery path (Supabase default SMTP
        vs custom Resend SMTP) not determinable from repo. Do NOT touch in this workstream.
```

Supporting infrastructure (all deployed, confirmed via `information_schema`):
- `email_log` — every send logged (status, resend_id, idempotency_key, metadata). RLS: insert-only, no client read.
- `email_sequences` / `email_sequence_steps` — nurture drip engine (service-role only).
- `profiles.is_email_subscribed` — opt-out flag, honoured by `send-email`.
- Dedup via `idempotency_key` (e.g. `welcome:{userId}`, `payment_confirmation:{stripe_event_id}`).
- **No DB column stores email HTML** (`email_sequence_steps` has `subject` + `template_name` only).

---

## 2. Email inventory (1.3)

| # | Email (type) | Trigger / when sent | Function file | from | reply_to | Subject source | Template source |
|---|---|---|---|---|---|---|---|
| 1 | `welcome` | On `SIGNED_UP`/`SIGNED_IN`, fire-and-forget | `useAuthState.ts:68` → `send-email` | `hello@marketentrysecrets.com` | `stephen@…com` | Resend template | **Resend dashboard** `b252c9f8…` |
| 2 | `nurture_ecosystem` | Onboarding drip, day 2 | `process-email-queue` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `eb576a39…` |
| 3 | `nurture_case_studies` | Onboarding drip, day 5 | `process-email-queue` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `96d2c574…` |
| 4 | `nurture_ai_report` | Onboarding drip, day 8 | `process-email-queue` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `5581662e…` |
| 5 | `nurture_events` | Onboarding drip, day 12 | `process-email-queue` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `baebf571…` |
| 6 | `nurture_upgrade_free` | Onboarding drip, day 16 (free users) | `process-email-queue` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `57162f7a…` |
| 7 | `nurture_upgrade_paid` | `nurture_upgrade` variant for paid (currently **skipped** for paid users by the queue) | `process-email-queue` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `edb5c831…` |
| 8 | `report_completed` | After report pipeline succeeds | `generate-report/index.ts:1395` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `5d30c0bf…` |
| 9 | `payment_confirmation` | Stripe `checkout.session.completed` | `stripe-webhook/index.ts:193` → `send-email` | `hello@…com` | `stephen@…com` | Resend template | **Resend dashboard** `d80bb2ee…` |
| 10 | Lead follow-up ("Bespoke Market Entry Plan") | `send-lead-followup` invoked w/ `{email, sector, target_market}`. **No frontend caller found in `src/`** — likely orphaned. | `send-lead-followup/index.ts` | `noreply@marketentrysecrets.com` | (none) | Inline: "Your Bespoke Market Entry Plan is Being Prepared" | **Inline HTML in repo** |
| — | Auth emails ×4 (confirm/magic-link/reset/change) | Supabase Auth | Supabase dashboard | n/a | n/a | dashboard | **Supabase dashboard** (separate surface) |

Notes:
- `nurture_upgrade` resolves to `_free` or `_paid` via `data.current_tier` (`resend-templates.ts:26`). The
  queue currently **skips the upgrade step entirely for paid users** (`process-email-queue.ts:146`), so
  `nurture_upgrade_paid` may rarely/never fire in practice. Flag for product confirmation.
- DB-seeded subjects exist in `email_sequence_steps` (e.g. "Welcome to Market Entry Secrets") but the
  **actually-sent subject is the Resend template's** (`send-email/index.ts:171` comment). Subjects are
  therefore defined in two places that can disagree — a latent drift source.

---

## 3. Full current HTML / source per email (1.3)

### 3a. The 9 template-based emails (1–9)
**HTML is not retrievable from the repo** — it lives in the Resend dashboard under the IDs above. The
repo contributes only the injected variables:

```ts
// _shared/email/resend-templates.ts — variables sent per type
welcome:               { USER_NAME }
nurture_ecosystem:     { USER_NAME, PROVIDER_COUNT }
nurture_case_studies:  { USER_NAME, CASE_STUDY_TITLE, CASE_STUDY_COMPANY }
nurture_ai_report:     { USER_NAME, REPORT_COUNT }
nurture_events:        { USER_NAME, EVENT_TITLE, EVENT_DATE }
nurture_upgrade_*:     { USER_NAME }
report_completed:      { USER_NAME, COMPANY_NAME, REPORT_URL }
payment_confirmation:  { USER_NAME, TIER_DISPLAY, AMOUNT, CURRENCY }
```
Observed live characteristics (from your screenshots of Welcome + Payment Confirmed, to be treated as
the ground truth for these nine until the templates are repatriated): **teal `#2B7A8C` header band,
flat pure-white body, hard-edged blocks, text wordmark (no logo image), em dashes in body copy.** All
nine share the same dashboard lineage, so the re-skin must cover all nine, not just the two observed.

> Action for Phase 3 if we repatriate: pull each template's current HTML from the Resend dashboard
> once (manual copy or Resend API) purely as a copy reference, then rebuild via the shared module.
> There is no Resend MCP connector in this session, so the dashboard HTML can't be fetched here.

### 3b. The one inline email (10) — `send-lead-followup/index.ts` (full current HTML)

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin-bottom: 10px;">Thank You for Your Interest!</h1>
    <p style="color: #666; font-size: 16px;">Your Bespoke Market Entry Plan is Being Prepared</p>
  </div>
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #1e40af; margin-bottom: 15px;">What Happens Next?</h2>
    <div style="margin-bottom: 15px;">
      <h3 style="color: #374151; margin-bottom: 8px;">📋 Step 1: Analysis (Next 24 hours)</h3>
      <p style="color: #666; margin: 0;">Our market entry experts will analyze your ${safeSector} sector and target market requirements.</p>
    </div>
    <div style="margin-bottom: 15px;">
      <h3 style="color: #374151; margin-bottom: 8px;">📊 Step 2: Custom Plan Creation (24-48 hours)</h3>
      <p style="color: #666; margin: 0;">We'll create a comprehensive, personalized market entry strategy specifically for your business.</p>
    </div>
    <div>
      <h3 style="color: #374151; margin-bottom: 8px;">📧 Step 3: Delivery (Within 48 hours)</h3>
      <p style="color: #666; margin: 0;">Your complete Bespoke Market Entry Plan will be delivered directly to this email address.</p>
    </div>
  </div>
  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #059669; margin-bottom: 15px;">Your Plan Will Include:</h2>
    <ul style="color: #374151; line-height: 1.6; padding-left: 20px;">
      <li><strong>Market Size & Opportunity Analysis</strong> for the ${safeSector} sector</li>
      <li><strong>Regulatory Requirements</strong> and compliance guidelines</li>
      <li><strong>Key Service Providers</strong> and potential partners</li>
      <li><strong>Target Customer Insights</strong> based on your specified market</li>
      <li><strong>Entry Strategy Recommendations</strong> tailored to your business</li>
      <li><strong>Risk Assessment</strong> and mitigation strategies</li>
      <li><strong>Timeline & Action Plan</strong> for market entry</li>
    </ul>
  </div>
  <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="color: #92400e; margin: 0; font-weight: 500;">
      ⏰ <strong>Estimated Delivery:</strong> Within 48 hours to ${safeEmail}
    </p>
  </div>
  <div style="text-align: center; margin-bottom: 30px;">
    <p style="color: #666; margin-bottom: 15px;">Questions while you wait?</p>
    <a href="mailto:info@marketentry.com.au" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
      Contact Our Team
    </a>
  </div>
  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
    <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
      This email was sent because you requested a Bespoke Market Entry Plan from Market Entry.
    </p>
    <p style="color: #666; font-size: 14px; margin: 0;">
      <strong>Your Target Market:</strong> ${safeTargetMarket}
    </p>
  </div>
</div>
```
Issues specific to this one: generic `#2563eb` blue (not the app's azure token), `Arial` (not the
brand font), 8px radii (app uses 12px+), no logo, emoji headers, **wrong domain** `info@marketentry.com.au`
(should be `…secrets.com`), brand said as "Market Entry" not "Market Entry Secrets", and a different
`from` (`noreply@`) with no `reply_to`. No long dashes in this one (good). Bulletproof button missing
(plain padded anchor — acceptable but not Outlook-optimal).

---

## 4. App design system extract (1.4) — the target the email must match

Source of truth: `src/index.css` (CSS variables) + `tailwind.config.ts`. **All values confirmed
blue-led. No teal present.** The authoritative palette for the redesign is the `rc-*` ("Report
Creator v2") token set, which carries exact hex in code comments:

| Role | Token | HSL | Hex | Use |
|---|---|---|---|---|
| **Primary / accent blue** | `--rc-primary` | `198 79% 49%` | **`#1AA3E0`** | buttons, links, active, stat accents |
| Primary pressed / gradient end | `--rc-primary-700` | `200 83% 34%` | `#0F6FA0` | hover/pressed, gradient bottom |
| Live-app primary (homepage) | `--primary` | `200 85% 55%` | ≈ `#2BA9E6` | same azure family; homepage CTAs |
| **Heading / dark navy** | `--rc-ink` | `209 61% 16%` | **`#102A43`** | headings, logo wordmark |
| **Body / slate** | `--rc-body` | `210 24% 34%` | **`#41566B`** | body copy |
| Muted / hints | `--rc-muted` | `213 19% 54%` | `#7387A0` | secondary text, placeholders |
| **Borders / dividers** | `--rc-line` | `208 35% 93%` | **`#E6EDF3`** | 1px borders, hairlines |
| **Page / panel background** | `--rc-canvas` | `210 43% 97%` | **`#F5F8FB`** | airy off-white (see note) |
| Soft tint (badges/chips) | `--rc-sky-soft` | `202 79% 94%` | `#E6F4FC` | icon badges, active chips |
| Callout tint | `--rc-sky-tint` | `204 85% 97%` | `#F3FAFE` | callout / info blocks |
| **Success green** | `--rc-success` | `160 84% 39%` | **`#10B981`** | "Saved"/match/confirm accents |
| Warning / star yellow | `--mes-warning` | `38 92% 50%` | ≈ `#F5A623` | ratings/star accent only |

Radius / shadow / type:
- **Radius:** `--radius: 0.75rem` = **12px** base. Tailwind `rounded-xl`=12px, `rounded-2xl`=16px.
  App pattern: buttons ~12px, cards 16px, badges fully-rounded pills. Matches the brief.
- **Shadows (soft, diffuse):** `--shadow-rc-card: 0 1px 2px rgba(16,42,67,.04), 0 10px 26px rgba(16,42,67,.06)`;
  `--shadow-rc-pop: 0 18px 50px rgba(16,42,67,.16)`. (rgb 16,42,67 = the navy ink.)
- **Primary button gradient:** `linear-gradient(180deg, rc-primary@20% → rc-primary@58% → rc-primary-700)` (`.bg-rc-btn-gradient`).
- **Font:** **Plus Jakarta Sans** (weights 400–800), loaded from Google Fonts in `index.html:18`;
  mono = JetBrains Mono. Email cannot rely on web fonts → use `'Plus Jakarta Sans', -apple-system,
  BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` with a Google Fonts `<link>`
  as progressive enhancement (Apple Mail/some clients honour it; most fall back to the system stack).

**Logo asset (1.4):**
- A real logo exists: `src/assets/market-entry-secrets-logo.png` — **navy compass icon with an azure
  needle + stacked "MARKET ENTRY SECRETS" navy wordmark.** Rendered in-app via `MarketEntryLogo.tsx`
  (`<img>`), bundled by Vite (hashed) so that path has **no stable URL**.
- **However** `public/favicon.png` is **byte-identical** (1,474,547 bytes) to that logo, so a stable
  absolute URL effectively already exists: `https://marketentrysecrets.com/favicon.png`. Caveat: it's a
  **1.4 MB, square, unoptimised PNG** — too heavy and wrong aspect ratio for an email header. Phase 2
  should host a properly sized horizontal logo (≈ 200–240px wide, < 40 KB, 2× for retina) at a stable
  path (e.g. `public/email/logo.png` → `https://marketentrysecrets.com/email/logo.png`) with an
  `alt="Market Entry Secrets"` navy text fallback.

> **Repo-confirmation correction to the brief:** the prompt estimated a *warm* cream background
> (`#FAF8F5`). The repo has **no warm/cream token**. The live homepage `--background` is **pure white
> `#FFFFFF`**; the redesign's off-white is **cool/blue-tinted `--rc-canvas #F5F8FB`**. Recommend the
> email body use **`#F5F8FB`** (the redesign canvas) over pure white for the airy feel — *not* a warm
> cream. Flagging because the brief said "confirm exact values from the repo," and this is the one
> place the visual estimate diverges from the tokens.

---

## 5. Gap matrix (1.5)

`OK` / `DRIFT:<what>` / `MISSING`. Emails 1–9 scored from the shared send path + your live
observations of the dashboard templates (same lineage); email 10 scored precisely from code.

| Email | Header / logo | Colors vs tokens | Typography | Button style | Info box | Footer | Copy (long dashes, tone) | Dark mode | Accessibility |
|---|---|---|---|---|---|---|---|---|---|
| 1 welcome | DRIFT: teal band, text wordmark, no logo img | DRIFT: teal `#2B7A8C` not azure | DRIFT: not Plus Jakarta | DRIFT: not token blue/radius | DRIFT: flat white, hard edges | DRIFT: tone/separators | DRIFT: em dashes observed | UNKNOWN (dashboard) | UNKNOWN: alt/contrast |
| 2 nurture_ecosystem | DRIFT (same lineage) | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT (verify) | UNKNOWN | UNKNOWN |
| 3 nurture_case_studies | DRIFT | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT (verify) | UNKNOWN | UNKNOWN |
| 4 nurture_ai_report | DRIFT | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT (verify) | UNKNOWN | UNKNOWN |
| 5 nurture_events | DRIFT | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT (verify) | UNKNOWN | UNKNOWN |
| 6 nurture_upgrade_free | DRIFT | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT (verify) | UNKNOWN | UNKNOWN |
| 7 nurture_upgrade_paid | DRIFT | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT (verify) | UNKNOWN | UNKNOWN |
| 8 report_completed | DRIFT: teal observed | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT (verify) | UNKNOWN | UNKNOWN |
| 9 payment_confirmation | DRIFT: teal band, no logo | DRIFT: teal | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT: em dashes observed | UNKNOWN | UNKNOWN |
| 10 lead follow-up | DRIFT: no logo, text wordmark | DRIFT: generic `#2563eb`, not token | DRIFT: Arial | DRIFT: plain anchor, 6px radius, generic blue | DRIFT: multi-colour blocks, 8px radius | DRIFT: wrong domain, "Market Entry" not "…Secrets" | OK: no long dashes; tone DRIFT (emoji) | MISSING: no dark-mode handling | DRIFT: emoji-as-info, no role/semantics; button contrast OK |

Cross-cutting:
- **`from`/`reply_to` inconsistency** — System A `hello@…com` (+reply_to `stephen@…com`); System B
  `noreply@…com` (no reply_to). **DRIFT.**
- **Domain/TLD drift** — sending uses `marketentrysecrets.com`; site contact/legal pages use
  `marketentrysecrets.com.au` (Footer, Contact, FAQ, Privacy, Terms); lead-followup body uses
  `marketentry.com.au`. **Three identities, two TLDs. DRIFT — needs an owner decision (1.3).**
- **No shared HTML layout module** — `_shared/email/` maps templates/variables but emits no HTML.
- **No logo image in any email.**

---

## 6. Email-client reality check (1.6) — constraints for Phase 2

- **Fonts:** custom web fonts are unreliable in email. Use a web-safe stack with Plus Jakarta Sans
  first + system fallback; optional Google Fonts `<link>` is progressive enhancement only. "Consistent"
  = visually aligned within email limits, not pixel-identical to the SPA.
- **CSS:** inline styles only; many clients strip `<style>`/`<head>`. Plan a `prefers-color-scheme`
  `<style>` block but never depend on it; provide inline fallbacks.
- **Outlook (Windows/Word engine):** table-based layout, no flex/grid; **bulletproof buttons** (VML or
  padded-cell anchor); avoid `border-radius` reliance (Outlook squares corners — acceptable degradation).
- **Layout:** 600px max width, centered, single column, tables for structure.
- **Dark mode:** some clients auto-invert. Verify azure `#1AA3E0` on dark and the off-white `#F5F8FB`
  (which may invert to near-black) — set explicit colours and test. The current teal header on dark is
  unverified.
- **Images:** off by default in many clients — logo needs `alt` text and the layout must read with
  images suppressed. Use absolute `https` URLs only.

---

## 7. Non-code surfaces (handle separately)

1. **Resend dashboard templates (×9)** — the real location of the brand drift. Either repatriate into
   the repo (recommended) or edit in-dashboard. Editing requires Resend dashboard access (no Resend MCP
   in this session).
2. **Supabase Auth emails (×4)** — signup confirmation, magic link, password reset, email change.
   Dashboard-managed; email confirmation is enabled. Out of scope for code changes here; note as a
   distinct follow-up so the brand is consistent end-to-end. **Do not edit dashboard config in this
   workstream.**
3. **DNS / Resend domain / API keys** — not inspected, not to be touched (per guardrails). No evidence
   of issues found in repo; flag-only.

---

## 8. Open questions for Phase 2 (assumptions I'll default to unless told otherwise)

1. **Architecture:** repatriate the 9 templates into a shared TS module (Option A) and retire the
   Resend dashboard templates? *(Default: yes — it's the only way to make the repo the source of truth
   and stop the drift. The raw-HTML send path already exists.)*
2. **Sender identity:** standardise on **`Market Entry Secrets <hello@marketentrysecrets.com>`** +
   `reply_to: stephen@marketentrysecrets.com` for all transactional mail? *(Default: yes — matches the
   live shared module and the founder-voiced tone; `noreply@` in lead-followup is the outlier to fix.)*
3. **Domain/TLD:** is the canonical domain `marketentrysecrets.com` (sending) or `.com.au` (site
   contact pages)? This needs an owner call; it affects footer + reply addresses. *(Default: keep
   sending on `.com`; flag the `.com.au` site pages + `marketentry.com.au` in lead-followup as drift to
   reconcile, but do not change site pages in this workstream without sign-off.)*
4. **Background:** confirm cool off-white `#F5F8FB` (repo token) over the brief's warm cream. *(Default:
   `#F5F8FB`.)*
5. **Logo:** OK to add an optimised horizontal logo at `public/email/logo.png` and reference
   `https://marketentrysecrets.com/email/logo.png`? *(Default: yes.)*
6. **`send-lead-followup`:** it has no frontend caller and was historically a stub. Keep + re-skin, or
   confirm deprecated? *(Default: re-skin it through the shared module for completeness, but flag it may
   be dead code.)*
7. **`nurture_upgrade_paid`:** currently skipped for paid users by the queue — is it intended to ever
   send? *(Default: re-skin anyway; flag the logic.)*

---

## Phase 1 complete. Awaiting approval to proceed to Phase 2. No changes made.
