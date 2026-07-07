---
name: supabase-rls-and-migrations
description: Safe RLS patterns and migration-ledger discipline for the MES Supabase project (xhziwveaiuhzdoutpgrh). Use before ANY schema change, migration, policy, grant, or RLS-adjacent work.
---

Last verified: 2026-07-07

# Supabase RLS & Migrations

## Purpose
Prevent the two failure modes that have actually burned MES: a drifted migration ledger (5 months
of `MIGRATIONS_FAILED`, full re-baseline in PR #263) and RLS policies that looked safe but leaked
PII or entitlements.

## When to trigger / when NOT to
- **Trigger:** any migration, policy, grant, trigger, view, or SECURITY DEFINER function; any task
  where access control matters.
- **Don't trigger:** pure frontend or content work with no schema/policy surface.

## Preconditions — inspect first
- `docs/migrations.md` (the ledger canon and how it broke), `supabase/migrations/` (active dir
  starts at `20260704095538_remote_baseline.sql`; `supabase/migrations_archive/` is reference only).
- Live policies: `pg_policies` via read-only SQL; live posture: Supabase `get_advisors`.
  Migrations are **not** proof of prod state — the ledger drifted before.

## Playbook — migrations
1. **PR flow only.** Merge to main auto-applies. Never apply schema out-of-band: no dashboard SQL
   editor for schema, no ad-hoc psql, and agents must **never** run MCP `apply_migration` against
   prod. Dashboard SQL is acceptable for *data*, never schema
   (`docs/audits/mentor-anonymization-audit-2026-07-06.md` §5).
2. **Name:** `<timestamp>_snake_name.sql`, timestamp after the 2026-07-04 baseline. The CLI
   *silently skips* anything else — 36 legacy `<ts>-<uuid>.sql` files and a timestamp-less file
   never applied (`docs/audits/MES-35-platform-readiness-scan.md` R10).
3. **Never rename/renumber an applied migration** — that is exactly how the ledger drifted
   (~94% divergence; `docs/migrations.md`). Fix collisions before first apply or add a new migration.
4. **Additive by default.** Drops, rewrites, PK changes, bulk updates = destructive → approval gate
   + rollback plan in the PR.
5. **Seeds must be idempotent and self-sufficient** — preview branches replay every migration
   against an *empty* DB; a seed referencing prod-only rows reds every future PR check
   (`docs/migrations.md`, incident `20260704155252`).
6. After merge, confirm the Supabase integration check is green before assuming it's live.

## Playbook — RLS
1. Role checks go through `has_role(auth.uid(), 'admin'::app_role)` — SECURITY DEFINER, verified
   live. Never query `user_roles` directly in a policy (recursion risk).
2. **Client write grants are locked down** (SEC-01/02/03): `anon`/`authenticated` writes are
   exceptions, not defaults. New tables get broad default grants — scope them deliberately.
3. **A write-lockdown is not a read-lockdown.** Audit SELECT policies and *grants* separately:
   `USING (true)` SELECT + surviving grants left `agency_contacts` PII anon-readable and
   `investors` PII authenticated-readable after the write fix
   (`docs/audits/MES-35-security-data-audit.md` S1/S2).
4. **RLS cannot express "caller knows the token".** `USING (share_token IS NOT NULL)` exposed ALL
   shared reports (`docs/audits/SECURITY_AUDIT.md` §1.2). Use a SECURITY DEFINER RPC instead —
   the live pattern is `get_shared_report(share_token)`; same pattern for `match_knowledge()`.
5. **PII goes behind views:** public reads of people-tables use `community_members_public`,
   `investors_public`, `agencies_report_view` (verified live). Base `community_members` SELECT is
   admin-only. Service-role code must re-apply masking filters itself — views don't protect it
   (`generate-plan` nearly leaked anonymised mentor names:
   `docs/audits/mentor-anonymization-audit-2026-07-06.md` §4).
6. **Verify after apply:** run `get_advisors` (security) before and after any RLS change and diff.
   Live example: `public.ingest_state` has **RLS disabled + anon INSERT/UPDATE/DELETE/TRUNCATE
   grants** (out-of-band artifact, in no migration) — MES-111 AUD-003, open P1.
7. **The live DB, not migration files, is the source of truth.** The 2026-07-04 re-baseline
   silently dropped anything not in the baseline snapshot: the `lead_database_purchases` table +
   its purchase-scoped RLS existed only in `migrations_archive/` and are **absent from prod**,
   breaking lead purchases (MES-111 AUD-006). Before relying on a table/policy, confirm it via
   live introspection.

## Red flags / approval gates (stop and get approval)
- Any policy/grant change; anything DROP/TRUNCATE/bulk-UPDATE; changing `user_subscriptions`,
  `user_reports`, `profiles`, or PII tables; new SECURITY DEFINER functions; moving the archive back.

## Good / bad examples
- ✅ `20260707103000_add_events_capacity.sql` — additive column, nullable, no backfill surprises.
- ✅ Owner-scoped policy: `USING ((SELECT auth.uid()) = user_id)` (live pattern on `bookmarks`).
- ❌ `USING (true)` SELECT on any table containing emails/phones/LinkedIn URLs.
- ❌ "I'll just run this ALTER in the dashboard to unblock" — that is the re-baseline origin story.

## Self-check rubric (pass/fail)
- [ ] Migration named `<timestamp>_snake_name.sql`, timestamp > 20260704095538, applied via PR only.
- [ ] No applied file renamed; destructive ops approved + rollback plan written.
- [ ] For each touched table: SELECT policy, write policies, AND grants all reviewed.
- [ ] PII exposed only via the `*_public` views or a guarded SECURITY DEFINER RPC.
- [ ] `get_advisors` clean (or diff explained) after apply; seeds replay on an empty DB.

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` (AUD-### findings folded in 2026-07-07).
Live inspection 2026-07-07 (project `xhziwveaiuhzdoutpgrh`): `pg_policies` for user/payment/content
tables; views `community_members_public`, `investors_public`, `agencies_report_view`;
SECURITY DEFINER fns `has_role`, `get_shared_report`, `match_knowledge`, `handle_new_user`,
`handle_new_user_subscription`; advisor finding on `ingest_state`. Docs: `docs/migrations.md`,
`docs/audits/MES-35-security-data-audit.md`, `docs/audits/SECURITY_AUDIT.md`,
`docs/audits/mentor-anonymization-audit-2026-07-06.md`.

## Common MES pitfalls (real — AUD refs are MES-111, `docs/prelaunch-audit.md`)
1. **Out-of-band applies drift the ledger** — apply-time version stamps diverged from filenames,
   auto-apply died for 5 months, `ingest_state` (RLS off, anon-writable — AUD-003) appeared in
   no migration (`docs/migrations.md`; MES-35 S5).
2. **The re-baseline dropped archived schema** — `lead_database_purchases` + purchase-scoped RLS
   survive only in `migrations_archive/`, not prod (AUD-006). Live introspection over migration
   archaeology, always.
3. **Ownership-only UPDATE on entitlements** let any user set `tier='enterprise'` free
   (`SECURITY_AUDIT.md` §1.1); same shape on `profiles.stripe_customer_id`
   (`AUTH-JOURNEY-AUDIT.md` §8.2). Invariants: see `stripe-payments-and-webhooks`.
4. **`USING(true)` + authenticated grants on PII** — anon probes pass (401) while any free
   signup can still export `investors` contact PII (~447 rows, AUD-002), `agency_contacts` /
   `service_provider_contacts` (AUD-020), and all `lead_database_records` (AUD-001). Test
   *authenticated* reachability, not just anon.
5. **Migrations ≠ prod** — SEC-03 `REVOKE EXECUTE` migrations existed while advisors still showed
   18 anon-executable RPCs (MES-35 S7); MES-111 re-verified prod by direct anon-key probes.
