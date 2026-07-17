# Runbook — MES-158 intent-first hero + launch flag flip-order

> Owner: engineering · Last updated: 2026-07-16 (MES-158 / PR #476)
> Covers: enabling the `intent_hero` feature, the smoke test that gates it, and
> the flip-order for the other dark launch flags it sits alongside.

## 1. What ships dark in PR #476

MES-158 adds an intent-first homepage hero: a free-text input + six prompt
chips. The visitor's phrase is classified **deterministically** (no model, no
network — `src/lib/intentClassifier.ts`) into `{ persona, goal_ids, report_focus }`,
persisted as a v2 intake prefill (`src/lib/heroIntentPrefill.ts`), and the
visitor lands in `/report-creator` with a confirm banner. The wizard remains the
explicit confirm-and-generate surface — nothing auto-generates.

It is gated by the **`intent_hero`** feature flag, **default off**. With the flag
off the classic `HeroCTAGroup` renders unchanged (zero regression).

| Flag | Query | localStorage key | Default |
|------|-------|------------------|---------|
| `intent_hero` | `?intent=1` / `?intent=0` | `mes_flag_intent_hero` | **off** |

## 2. Pre-enable smoke test (run before flipping the flag on)

The pure classifier + prefill cores are unit-tested (`npm test` →
`intentClassifier` 11 + `heroIntentPrefill` 4). The **end-to-end wiring** (flag
gate, render, submit, prefill persistence, navigation, confirm banner) is not
covered by the repo's logic-only test runner, so it is smoke-tested in a real
headless browser with **all Supabase traffic blocked** (no prod analytics/DB
writes). Script: `scripts/smoke/intent-hero-smoke.mjs`.

Run:

```bash
npm run build
npm run preview -- --port 4319 --host 127.0.0.1 &   # serve dist/
# headless-shell binary (the Chrome binary dropped --headless=old):
node scripts/smoke/intent-hero-smoke.mjs             # exits non-zero on any fail
```

Expected: **16/16 checks pass**. Last run (2026-07-16, commit `51a09d6`):

```
PASS  flag OFF → no intent input rendered
PASS  flag OFF → classic CTA still present
PASS  flag ON → intent input renders
PASS  input has maxLength=200
PASS  6 prompt chips render
PASS  typed submit navigates to /report-creator
PASS  v2 draft persisted with focus + goals   [international / ["find_providers"] / "I need a fintech lawyer in Sydney"]
PASS  lawyer intent → find_providers goal
PASS  lawyer intent → international persona
PASS  origin marker set
PASS  confirm banner renders on report creator
PASS  banner echoes the raw intent
PASS  investor chip → startup persona
PASS  investor chip → investors goal
PASS  no Supabase network side effects reached the wire (all aborted)
PASS  no uncaught console/page errors
16/16 checks passed
```

If the smoke fails on `--headless=old`, point `EXE` at the standalone
`chromium_headless_shell-*/chrome-linux/headless_shell` (the full Chrome binary
in this image no longer supports old-headless).

## 3. Enable procedure (`intent_hero`)

Because the flag is **client-side** (URL query + localStorage, no server flag),
there is no server toggle. To roll it out:

1. **Migration must be live first.** The 6 new funnel events
   (`hero_intent_started/submitted/chip_clicked`,
   `report_prefill_loaded/confirmed`, `report_completed_from_hero_intent`)
   require the widened `intake_form_events` event_type CHECK
   (`20260716240000_mes158_intent_hero_events.sql`). The analytics bus **swallows
   inserts that violate the CHECK**, so if the flag is on before the migration
   applies, events silently drop. The migration auto-applies on merge to main —
   confirm the Supabase integration check is green on #476 before enabling.
2. **Verify with `?intent=1`** on prod (sticky per-browser) and walk the flow.
3. **Broad rollout** = change `intent_hero.defaultValue` to `true` in
   `src/lib/featureFlags.ts` (a code change → its own small PR + mes-qa), or
   drive it via a marketing link carrying `?intent=1`.

**Rollback:** flip `defaultValue` back to `false` (or ship nothing — it starts
off). `?intent=0` clears a visitor's sticky value. No data migration to unwind;
the CHECK widening is a harmless superset if the flag never flips.

## 4. Launch flag flip-order (the other dark flags)

MES-158 is one of several flags shipped dark during the MES-188 launch bundle.
Flip them in dependency order; each has an independent rollback.

| Flag / env | Owner surface | Gate before flipping | Rollback |
|------------|---------------|----------------------|----------|
| `ENTITLEMENTS_ENABLED` | entitlements/tier unlock | Stripe live cutover done; `user_subscriptions` writes verified | env off |
| `intent_hero` | homepage hero (this doc) | §2 smoke green + CHECK migration live | `defaultValue=false` |
| **`LEAD_DELIVERY_ENABLED`** | Scale lead auto-delivery (T7/MES-198) | **BLOCKED — see §5** | env off |
| MES-148 rollout flags | report-pipeline quality | per `docs/runbooks/mes-148-flag-rollout.md` | env off |

Discipline: **one funnel-affecting flag per measurement window** so the T5a
funnel instrumentation can attribute the change.

## 5. ⚠ Blocker — do NOT enable `LEAD_DELIVERY_ENABLED` yet

T7 auto-delivery inserts a `lead_list_requests` row with `status='delivered'`,
which trips the existing AFTER-INSERT trigger `trg_emit_lead_list_request_activity`
(`20260710160000_lead_list_requests.sql`) → emits a `lead_list.requested`
activity event. That event's Slack routing is **enabled on prod** (channel
`C0BACH1NR2S`) while the intended `lead_list.delivered` routing is **disabled**
(`20260716230000_mes198_lead_delivery_routing.sql`). Net effect: the moment
`LEAD_DELIVERY_ENABLED` flips, every delivered dataset posts a **phantom "new
custom lead-list request"** ping to ops, and the real delivery event is silent.

This is code-review **finding #3** (deferred, approval-gated — it touches a
SECURITY DEFINER trigger + Slack routing). Fix it (a `WHEN (NEW.status <>
'delivered')` trigger guard, or enable `lead_list.delivered` routing + suppress
the `requested` emit for delivered rows) **before** enabling the flag.

Note: per `docs/prelaunch-audit.md`, `LEAD_DELIVERY_ENABLED` is intentionally
**off for launch and not a launch blocker** — so finding #3 is a fast-follow,
not launch-critical.

## 6. Related post-merge ops (not flags)

- **T16a/MES-197** (tier-aware report email) is merged but **not live** —
  `send-email` is manual-deploy: `supabase functions deploy send-email`.
