---
name: support-crisp-and-user-debug-tooling
description: MES support + debug surfaces — the Crisp chat widget (anonymous by design), the error boundary, URL-query feature flags, and how to pass user identity/tier safely if ever needed. Use before touching Crisp, ErrorBoundary, featureFlags, or adding a support/debug path.
---

Last verified: 2026-07-07

# Support (Crisp) & User Debug Tooling

## Purpose
Document the actual support/debug surfaces so changes keep them privacy-safe and consistent — and
so "pass the user's tier to support" work is done correctly (it's currently net-new).

## When to trigger / when NOT to
- **Trigger:** the Crisp widget, `ErrorBoundary`, `featureFlags`, report feedback, or adding any
  support/debug/"report a problem" path.
- **Don't trigger:** observability/logging conventions (→ `observability-logging-and-cost-attribution`);
  admin moderation queues (→ `admin-submissions-and-moderation-workflows`).

## Preconditions — inspect first
- `index.html` (Crisp boot script), `src/components/ErrorBoundary.tsx`, `src/lib/featureFlags.ts`,
  `src/components/report/ReportFeedback.tsx`.

## What exists (verified)
- **Crisp** is a single inline boot script in `index.html:64` with a **hardcoded public website id**
  (`CRISP_WEBSITE_ID`, a client-side id, not a secret). It mounts unconditionally at document boot,
  outside React — you cannot gate it by app state without moving it.
- **It is fully anonymous.** Grep confirms **no** `$crisp.push`, no `set:user:email`, no session
  data anywhere in `src/` — no email, tier, or user id is passed to Crisp. That's the privacy-safe
  default; any identity enrichment is net-new work.
- **No consent/cookie gate** and no lazy-load — it loads for every visitor (the SEO audit lists
  "Crisp lazy-load" as an unshipped optimisation).
- **ErrorBoundary** (`src/components/ErrorBoundary.tsx`) is a class component that resets on route
  change and renders a shadcn Card + "Refresh Page". It logs to `console.error` **only** — no
  remote error reporting (MES-111 §13 flags adding Sentry/equivalent as a launch item).
- **Feature flags** (`src/lib/featureFlags.ts`) are URL-query + `localStorage`, not env vars
  (Lovable has no `VITE_*` — see `mes-codebase-conventions`). One flag exists: `report_creator_v2`
  (`?v2=1`/`?v2=0`, storage key `mes_flag_report_creator_v2`, default `true`).
- **No generic bug-report path.** The only feedback surface is report-specific
  (`ReportFeedback.tsx` → `user_reports.feedback_score`).

## Playbook
1. **Adding identity/tier to Crisp (if asked):** push only the minimum needed via `$crisp` after
   auth resolves, and **treat it as PII** — email/tier are sensitive. Follow
   `secrets-and-env-management`: never log it, gate it on a signed-in user, and confirm privacy
   expectations before sending customer email to a third party. Default to anonymous if unsure.
2. **A new feature flag:** copy the `featureFlags.ts` pattern (query param + `localStorage`,
   SSR-safe guard); never introduce a `VITE_*` var.
3. **A support/debug path:** route user-submitted problem reports through a submission funnel
   (see `admin-submissions-and-moderation-workflows`, e.g. `directory_submissions` with a valid
   `submission_type`), not a form-to-nowhere.
4. **Error reporting:** if you add remote reporting, strip PII from payloads and correlate by entity
   id (rules owned by `observability-logging-and-cost-attribution`).

## Red flags / approval gates
- Pushing customer email/tier to Crisp without confirming privacy expectations (external service =
  data leaves MES).
- Adding a `VITE_*` env var for a flag or the Crisp id.
- A "report a problem" form that only toasts and saves nothing (the real contact-form bug).
- Assuming an error-reporting/analytics backend exists — none does yet.

## Good / bad examples
- ✅ Signed-in-only `$crisp.push(['set:session:data', [['tier', tier]]])` — no email, gated, minimal.
- ✅ New flag `?newthing=1` mirroring `featureFlags.ts`.
- ❌ `$crisp.push(['set:user:email', [user.email]])` for all visitors with no consent consideration.
- ❌ A debug page that dumps `user_reports`/PII to the console.

## Self-check rubric (pass/fail)
- [ ] Crisp stays anonymous unless identity is explicitly required, gated on auth, and PII-aware.
- [ ] Flags use the query+localStorage pattern; no `VITE_*`.
- [ ] Support submissions go to a funnel table with a valid type, not a form-to-nowhere.
- [ ] No assumption of a Sentry/analytics backend that doesn't exist; PII stripped from any report.

## Evidence
Inspected 2026-07-07: `index.html:64` (Crisp boot, hardcoded website id; grep found no `$crisp`
usage in `src/`), `src/components/ErrorBoundary.tsx` (console.error-only), `src/lib/featureFlags.ts`
(`report_creator_v2`, default true), `src/components/report/ReportFeedback.tsx`. Audits:
`docs/prelaunch-audit.md` §13 (no external error monitoring — add Sentry),
`docs/audits/seo-discoverability-audit-2026-07-04.md` (Crisp in the CSR shell, lazy-load unshipped),
`docs/audits/submission-forms-audit.md` (contact-form-to-nowhere). Cross-refs:
`secrets-and-env-management`, `observability-logging-and-cost-attribution`,
`admin-submissions-and-moderation-workflows`.

## Common MES pitfalls (real)
1. **Assuming support has user context** — Crisp is fully anonymous; agents see no tier/email
   unless it's added.
2. **Expecting an error/analytics backend** — errors only hit `console.error`; MES-111 §13 lists
   adding one as a launch task, and the audit found zero analytics installed.
3. **Form-to-nowhere** — a support form that toasts success but persists nothing
   (`submission-forms-audit.md`); route through a funnel table.
4. **`VITE_*` reflex** — flags/config here are URL-query + localStorage by necessity, not env vars.
