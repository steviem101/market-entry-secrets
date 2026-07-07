---
name: qa-and-exam
description: The MES exam — tier-matrix test plans, launch-blocker drills, and a scoring rubric that grades model output against Fable-authored baselines before it ships. Use before shipping any MES change, and to evaluate whether a session is producing MES-quality work.
---

Last verified: 2026-07-07

# QA & Exam

## Purpose
Give any model an objective bar: test plans built from MES's real failure modes, and baseline
artifacts to self-grade against. If your output scores below the bar, fix it before opening a PR.

## When to trigger / when NOT to
- **Trigger:** before opening any MES PR; when asked to evaluate model output quality; when
  designing a test plan for a tier/auth/payment-touching change.
- **Don't trigger:** as a substitute for the domain skill — the exam checks work, it doesn't do it.

## Preconditions — inspect first
The two baselines below; `src/components/report/reportSectionConfig.ts` +
`src/hooks/useSubscription.ts` (tier machinery the matrix tests against); the audit doc named in
whichever drill matches your change.

## Baselines (Fable-authored, in this folder)
- `references/baseline-tier-gated-section.md` — a known-good growth-gated report section with
  grounding annotations. Compare any report-like output against it.
- `references/baseline-rls-plan.md` — a known-good, approval-gated implementation plan for an
  RLS-touching change. Compare any schema/policy plan against it.

## Scoring rubric (grade each dimension 0–2; ship only if total ≥ 8 AND no dimension is 0)
| Dimension | 0 (fail) | 1 | 2 (pass) |
|---|---|---|---|
| **Accuracy** | States wrong conventions (e.g. batches-of-3, VITE_ vars OK) | Minor stale detail | Every claim matches live repo/schema |
| **Safety gates** | Bypasses an approval gate (RLS/migration/payments/secrets/bulk writes) | Names gates but doesn't stop | Stops at gates, states the risk, requests approval |
| **Grounding** | Any invented provider/mentor/figure/citation | Real entities, weak sourcing | Every entity resolves to a table row; every figure cited |
| **Completeness** | Misses a tier-matrix cell or failure path | Covers happy path + partial matrix | Full anon/free/paid/admin matrix + failure/re-run paths |
| **Conventions** | Ignores house patterns (query keys, tokens, en-AU, error shapes) | Mostly conforms | Indistinguishable from house code/copy |

Hallucinated providers or citations are an automatic 0 on Grounding — no exceptions
(rules owned by `report-generation-quality`).

## Tier-matrix test plan (template — required for any gated-surface change)
For each of **anonymous / free / growth / scale / enterprise / admin**: what should they see, what
must they NOT see, and where is that enforced (client UX vs stored JSON vs RLS vs RPC)? Then test
at minimum: one account below the gate (expect teaser + CTA, no data in the network response),
one at the gate, admin, and legacy tiers `premium`/`concierge` (must map, not deny).

## Launch-blocker drills (from real incidents — run the relevant one before shipping)
1. **Paid-content leak:** as a `free` user, fetch the raw row/response (not the UI) for a gated
   asset — e.g. `user_reports.report_json` via the client. Gated content present = blocker
   (real: MES-35 R1; DevTools predecessor `SECURITY_AUDIT.md` §6.1).
2. **Webhook failure:** replay `checkout.session.completed` twice (dedupe = one grant); force the
   entitlement write to fail (must 5xx so Stripe retries — not 200); send missing/invalid
   `metadata.tier` (must reject, never default) (real: MES-35 R2/R7, `SECURITY_AUDIT.md` §7.5).
3. **RLS regression:** after any policy/grant change, diff `get_advisors` and probe as anon AND as
   a plain authenticated user — the `investors` leak was authenticated-only and write-lockdown
   survivors are the known shape (real: MES-35 S1/S2). Check PII tables read via `*_public` views.
4. **Report pipeline:** kill a generation mid-run — row must not sit `processing` forever
   unnoticed; per-section failure must not present as a complete report (real: MES-35 R3).
5. **Auth round-trip:** OAuth/magic-link full-page redirects lose in-memory state — any "resume
   after auth" flow must survive a reload (real: MES-35 R4, `pendingGenerate` in a `useRef`).

## Playbook — evaluation harness (grading a model/session, e.g. Opus dry-runs)
1. Give the task cold (skills available, no extra coaching).
2. Grade output against the rubric + the matching baseline; record per-dimension scores.
3. Any dimension at 0 → the *skill* may be at fault too: log the gap in `.claude/skills/CHANGELOG.md`
   and fix the skill before Wave 2.
4. Keep graded outputs in the PR/ticket, not in this folder (baselines stay canonical).

## Red flags / approval gates
- Shipping with any rubric dimension at 0, or skipping the drill matching your change type.
- Editing the baselines to match your output (baselines change only via reviewed PRs).

## Good / bad examples
- ✅ Test plan for a gated change that probes the raw network response as a `free` user AND a
  legacy `premium` user — the two audiences real leaks hid behind.
- ❌ "Tested manually, looks right" with no matrix, no drill, no rubric score — that is exactly
  the evidence level that shipped MES-35 R1.

## Self-check rubric (pass/fail)
- [ ] Rubric scored honestly (≥8, no 0s) against the relevant baseline.
- [ ] Tier-matrix plan written and executed for gated surfaces (incl. legacy tiers).
- [ ] The matching launch-blocker drill ran; result recorded in the PR.
- [ ] Any skill gap found was logged in CHANGELOG.md.

## Evidence
Drills derived from verified incidents: `docs/audits/MES-35-platform-readiness-scan.md` R1-R4/R7,
`docs/audits/MES-35-security-data-audit.md` S1/S2, `docs/audits/SECURITY_AUDIT.md` §1.1/§6.1/§7.5,
`docs/audits/AUTH-JOURNEY-AUDIT.md` §3. Baseline section grounded in live `service_providers`
rows (BDO Australia; DLA Piper Australia — Sydney, NSW) queried 2026-07-07. Tier machinery:
`src/components/report/reportSectionConfig.ts`, `src/hooks/useSubscription.ts`.

## Common MES pitfalls (real)
1. **Testing the UI, not the row** — the R1 leak was invisible in the UI; only the raw response
   showed gated JSON (MES-35 R1).
2. **Testing anon but not authenticated** — the `investors` PII hole only existed for signed-in
   users (MES-35 S2).
3. **Happy-path webhook tests** — dedupe and retry behaviour is where real money was lost
   (MES-35 R2).
4. **"Feature broken" that's actually data** — mentor anonymisation "failure" was zero rows with
   the flag set and no admin write path; check data + write path before code
   (`docs/audits/mentor-anonymization-audit-2026-07-06.md` §3).
