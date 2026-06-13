# MES Transactional Email - Brand Consistency Audit & Remediation

**Prompt type:** Phased, gated. Read-only audit first, then plan (approval gate), then per-email implementation (approval gates).
**Save to:** `~/market-entry-secrets/.claude/prompts/email-brand-consistency-audit.md`
**Paste into:** a fresh CC session in the `~/market-entry-secrets` repo.

---

## 0. Scope and hard guardrails
- **In scope:** MES Platform Supabase project only (`xhziwveaiuhzdoutpgrh`) and the `~/market-entry-secrets` repo. All transactional email sent via Resend.
- **OUT OF SCOPE:** Content Studio project (`rcgaviwbsudouvfwzydq`). If any step would read, write, or deploy against Content Studio, **HALT and report** before doing anything.
- **Deployment:** Edge functions deploy via Supabase CLI only. Never via Lovable.
- **Phasing is non-negotiable:**
  - Phase 1 = read-only audit, hard stop, no changes.
  - Phase 2 = recommendation + plan, requires my explicit approval.
  - Phase 3 = implementation, one email at a time, approval gate per email.
- Do not rotate keys, change DNS, or modify Resend domain config in this workstream. Flag anything you find, do not touch it.

## 1. Brand source of truth (the RUNNING APP, not memory or handoff docs)
**Critical correction.** Do NOT trust the teal palette from any handoff doc or prior context. Teal `#2B7A8C` is the **Content Studio ("MES Content Spark")** brand, a separate project. The live MES Platform app is **blue-led**. The current emails appear to have inherited the wrong (teal) palette. The only authoritative sources are the repo design tokens and the live app UI.

Visual reference taken from the live homepage (approximate hex, **confirm exact values from the repo**; if you extract teal anywhere, you have grabbed the wrong token):

| Token | Visual target (confirm in repo) |
|---|---|
| Primary / accent blue | Bright azure, used on all CTAs, links, stat numbers, "with confidence" headline. Approx `#2E9BE0` |
| Headline / dark text | Near-black navy. Approx `#0F1B2D` to `#1A1A2E` |
| Body / muted text | Slate grey. Approx `#5B6472` |
| Page background | Warm off-white / faint cream, NOT pure white. Approx `#FAF8F5` fading to white |
| Borders | Very light grey. Approx `#E8EAED` |
| Success accent | Green ("97% match" pill) |
| Rating accent | Star yellow |
| Radius | Generous: buttons approx 12px, cards 16 to 20px, badges fully rounded (pills) |
| Shadow | Soft, diffuse, low opacity |
| Logo | Compass icon plus stacked "MARKET ENTRY SECRETS" wordmark in navy |
| Icons | Line style, rounded |
| Microcopy | Middle-dot separators ("No credit card required · Ready in 3 minutes"), confident and concise |
| Tone | "Bloomberg meets a smart directory", founder-voiced editorial, Stripe Atlas register |
| Quality bar | Linear, Stripe, Vercel, Arc, Bloomberg |

Overall aesthetic: light, airy, generous whitespace, soft shadows, rounded everything.

**HARD COPY RULE:** No long dashes (em dash or en dash) anywhere in any email copy. Replace with commas, colons, or restructured sentences. Note the app UI itself currently uses em dashes; this rule is the copy standard regardless, so treat every email body as suspect.

## 2. Known issues from current production emails (verify, do not trust blindly)
Observed from live emails (Welcome, Payment Confirmed) compared against the live app homepage:
1. **Wrong brand palette: teal header on a blue-led app.** This is the single biggest inconsistency. The emails use teal `#2B7A8C` (the Content Studio brand). The MES Platform app is built on bright azure blue with a warm off-white background and navy text. Strong hypothesis: the emails were built from the Content Studio palette by mistake. The fix is a full re-skin to the app's blue system, not a tweak.
2. **Flat white body vs warm off-white app background.** App uses a faint cream/off-white. Emails use pure flat white.
3. **Sharper blocks vs the app's soft, rounded aesthetic.** App uses generous radius (pill buttons, 16 to 20px cards) and soft diffuse shadows. Emails read as flatter, harder-edged.
4. **No logo image.** Header is a text wordmark only. App has a compass-icon plus stacked wordmark. Email needs a hosted absolute https logo URL with a wordmark text fallback.
5. **Long dashes in body copy.** e.g. "now unlocked — including..." and "marketing, and more — all focused on...". Must be removed.
6. **`from` address inconsistency.** One email sends from `hello@marketentrysecrets.com`. Standard sending identity is `noreply@marketentrysecrets.com`. Confirm the intended standard and whether `hello@` is deliberate (reply-friendly) or drift.
7. **Likely duplicated inline HTML.** Header, button, and footer styling appear hand-rolled per email. Suspect copy-paste across multiple edge functions, which is the root cause of drift.
8. **Microcopy style mismatch.** App uses confident, concise lines with middle-dot separators ("No credit card required · Ready in 3 minutes"). Align email microcopy and footers to this voice.

---

## PHASE 1 - Read-only audit (HARD STOP after this)
Do not modify any file, function, table, or config. Produce findings only.

### 1.1 Discover every email-sending path
- Resend usage and email send calls; raw HTML email strings; subjects and from addresses.
- List the Supabase edge functions and identify which ones send email.

### 1.2 Check for non-code email surfaces
- **DB-stored templates:** query `information_schema` for anything matching `email`, `template`, `notification`. Do not assume table names; discover them.
- **Supabase Auth emails:** managed in the Supabase dashboard, not in code. Note as a **separate surface**. Do not edit dashboard config in this phase.

### 1.3 Inventory every distinct email
Capture: Email name | Trigger | Function file | from | reply_to | subject | Template source. Then dump the full current HTML of each.

### 1.4 Extract the app design system
Brand tokens (exact hex), radius/shadow, typography, button component, logo asset (absolute URL?). If primary extracts as teal, wrong source.

### 1.5 Build the gap matrix
Per email: Header/logo | Colors | Typography | Button | Info box | Footer | Copy | Dark mode | Accessibility. Mark `OK`/`DRIFT:<what>`/`MISSING`.

### 1.6 Email-client reality check
Web-safe fonts, inline CSS, Outlook table layout + bulletproof buttons, dark mode.

### 1.7 Deliverable
Write to `~/market-entry-secrets/.claude/prompts/email-brand-audit-findings.md`. Then STOP. Print: "Phase 1 complete. Awaiting approval to proceed to Phase 2." Make no changes.

---

## PHASE 2 - Recommendation and plan (requires explicit approval before Phase 3)
- 2.1 Recommend template architecture (A: shared TS layout module [default]; B: React Email; C: DB-stored templates).
- 2.2 Define the email design system (blue-led; header, colors, typography, button, info box, footer, spacing/radius, dark mode).
- 2.3 Rewrite all copy (remove long dashes; Bloomberg-meets-smart-directory tone; before/after per email).
- 2.4 Migration and test plan (lowest-risk first; Resend test sends; render checks; standardize from/reply_to).
- 2.5 Deliverable: plan doc, then STOP and print: "Phase 2 complete. Approve to begin Phase 3, and confirm pilot email."

---

## PHASE 3 - Implementation (one email at a time, approval gate per email)
1. Build the shared template module first. Show module + one rendered sample.
2. Pilot: migrate approved pilot, apply copy, Resend test send, report. Approval before continuing.
3. Fan out: remaining emails one at a time, each with test send + diff summary.
4. Deploy each changed edge function via Supabase CLI. Never via Lovable.
5. After all: confirm no duplicated inline HTML, all copy long-dash-free, from/reply_to standardized.

### Verification checklist
- [ ] All transactional emails use the single shared module.
- [ ] Palette is the app's blue-led system. No teal `#2B7A8C` remains.
- [ ] Body background warm off-white (confirm vs repo), radius/shadows match.
- [ ] Zero long dashes across all email copy.
- [ ] Logo renders (absolute URL), wordmark fallback present.
- [ ] Buttons render in Outlook.
- [ ] Links and from/reply_to correct.
- [ ] Dark mode acceptable.
- [ ] No change to Content Studio. No DNS or key changes.

---

## Reminders for the agent
- If anything is ambiguous, make a reasonable assumption, state it, and proceed.
- If a step would touch Content Studio (`rcgaviwbsudouvfwzydq`), HALT and report.
- Keep findings and plan as committed markdown artifacts in `.claude/prompts/`.
