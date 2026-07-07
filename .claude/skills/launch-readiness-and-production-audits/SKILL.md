---
name: launch-readiness-and-production-audits
description: How to run a repeatable MES production-readiness audit (auth, payments, report generation, RLS, SEO, performance, error handling) and turn findings into risk-flagged follow-up tickets. Use before a launch/release or when asked to assess production readiness.
---

Last verified: 2026-07-07

# Launch Readiness & Production Audits

## Purpose
Produce a trustworthy go/no-go on MES with reproducible method and evidence, and convert findings
into actionable, risk-flagged tickets — the way MES-111 did.

## When to trigger / when NOT to
- **Trigger:** pre-launch/pre-release readiness reviews; "is X production-ready?"; auditing a
  subsystem for security/reliability.
- **Don't trigger:** a scoped feature build (use the domain skill + `qa-and-exam` instead).

## Preconditions — inspect first
- `docs/prelaunch-audit.md` (MES-111) — the **canonical exemplar**: severity rubric, per-finding
  format, §13 manual checklist, §14 launch-day smoke test. Reuse its structure.
- The relevant domain skills for whatever you audit; the `qa-and-exam` drills.

## Playbook — audit method (read-only; change nothing)
1. **State scope + "read-only".** Run builds/typecheck/lint/tests (reading, not changing), and DB
   introspection via read-only SQL + Supabase advisors. Never `apply_migration`/dashboard-SQL.
2. **Phase 0 build health:** `npm run build`, `npx tsc -p tsconfig.app.json --noEmit`, `npm test`,
   `npm audit`. Record lint's ~437 pre-existing `no-explicit-any` errors as a known baseline
   (AUD-051), not a new finding.
3. **Cover the surfaces:** auth/sessions, payments/entitlements, report pipeline, RLS/data exposure,
   edge functions/cost, SEO/rendering, directories/UX/performance, error handling. One domain skill
   backs each.
4. **Prove reachability, don't infer it.** MES-111's load-bearing move: **direct anon-key probes**
   against PostgREST confirmed anon is blocked (401) on PII/paid tables — re-scoping several
   "anonymous leak" suspicions down to authenticated-only. Verify against the **live DB**, not
   migration files (the re-baseline dropped an entitlement table — AUD-006).
5. **Adversarial pass:** try to *disprove* each P0/P1 before reporting it (MES-111 §11).
6. **ID + severity every finding:** `AUD-###`, P0–P3, area, location (`file:line`/table), evidence,
   fix, effort, and VERIFIED vs SUSPECTED (dashboard-only settings are SUSPECTED). Go/no-go rubric:
   any open P0 = NO-GO; open P1s = launch only with explicit accepted-risk sign-off.
7. **Also record the CLEAN findings** — MES-111 verified the anon lockdown, report-view RPC, Stripe
   signature, and generate-report auth as correct, so future work doesn't "fix" them.

## Turning findings into tickets
Group by workstream, keep severity, carry the risk flags from `mes-ticket-workflow` (Touches RLS,
Freemium funnel, Cross-project, Destructive migration). Approval-gated categories (RLS, payments,
secrets, destructive migration, broad writes) stay plan-first. Split dashboard-only items into a
manual checklist (MES-111 §13) since they can't be fixed in-repo.

## Five concrete MES examples (from MES-111)
1. **Payments — AUD-005 (P1):** client `tier` trusted in the lead-purchase checkout branch → pay a
   lead-DB price, receive `enterprise`. Fix: force `tier="lead_purchase"`; validate amount↔tier.
2. **Data-integrity — AUD-006 (P1):** `lead_database_purchases` exists only in `migrations_archive/`
   — the live webhook upserts a missing table and swallows the error. Found by live introspection,
   not migration reading.
3. **RLS — AUD-002/003 (P1):** `investors` PII readable by any authenticated user; `ingest_state`
   RLS-off with anon write/truncate grants. Found by anon+authenticated probes + advisors.
4. **Freemium — AUD-004 (P1):** `fetchMyReports` `select('*')` re-leaks gated `report_json` even
   though `fetchReport`'s RPC path is clean — the same bug class, one call site later.
5. **SEO — AUD-046 (P2):** all 8 detail pages soft-404 (200 shell, no `noindex`), so garbage slugs
   are indexable. Fix: `<NoIndex>` or real 404.

## Red flags / approval gates
- Reporting a finding you couldn't reproduce (mark SUSPECTED, don't assert VERIFIED).
- Any write during an audit — it's read-only by definition; a fix is a separate approved ticket.
- Declaring GO with an open P0, or an open P1 without explicit accepted-risk sign-off.

## Good / bad examples
- ✅ "AUD-00X (P1, VERIFIED): `file:line` … anon-probe returned 401/200 … fix … effort M."
- ✅ A §13 manual checklist for dashboard-only items (email confirmation, OTP expiry, live Stripe keys).
- ❌ "RLS looks fine" with no advisor diff and no authenticated-user probe.
- ❌ Fixing AUD-003 inline during the audit instead of filing it.

## Self-check rubric (pass/fail)
- [ ] Read-only; build/typecheck/test/advisors run; lint baseline noted not re-reported.
- [ ] Reachability proven by live probes (anon AND authenticated), verified against the live DB.
- [ ] Every finding: ID + severity + location + evidence + fix + effort + VERIFIED/SUSPECTED.
- [ ] Adversarial pass done; CLEAN findings recorded; go/no-go stated against the rubric.
- [ ] Findings → risk-flagged tickets; dashboard-only items in a manual checklist.

## Evidence
Exemplar: `docs/prelaunch-audit.md` (MES-111) — §1 rubric/go-no-go, §2 build health, §3 findings
table, §4 RLS + anon probes, §11 adversarial pass, §13 manual checklist, §14 smoke test; findings
AUD-002/003/004/005/006/046/051. Method corroborated by `docs/audits/MES-35-security-data-audit.md`
(advisors-after-apply), `docs/audits/AUTH-JOURNEY-AUDIT.md`. Cross-refs: `qa-and-exam` (drills),
`mes-ticket-workflow` (risk flags), and each domain skill.

## Common MES pitfalls (real)
1. **Inferring reachability from RLS text** — the `investors` PII hole was authenticated-only;
   anon-only testing would have missed it (MES-111 §11; MES-35 S2).
2. **Trusting migrations as prod truth** — a re-baseline silently dropped `lead_database_purchases`
   (AUD-006); introspect the live DB.
3. **Re-flagging the known lint baseline** — ~437 pre-existing `no-explicit-any` errors are AUD-051,
   not a new finding.
4. **Fixing during the audit** — turns a read-only assessment into an unreviewed change; file a
   risk-flagged ticket instead.
