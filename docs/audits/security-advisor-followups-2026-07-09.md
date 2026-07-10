# Security Advisor Follow-ups + `template1` Support Note (2026-07-09)

Spun out of the collation investigation
([`postgres-collation-version-mismatch-2026-07-09.md`](./postgres-collation-version-mismatch-2026-07-09.md)).
Two ready-to-use drafts: (A) a security ticket for the Supabase Advisor findings, and (B) a one-line
Supabase support request for the `template1` collation refresh.

Evidence source: `get_advisors(type: security)` against project `xhziwveaiuhzdoutpgrh`, 2026-07-09.
Nothing here has been changed in production — this is scoped work awaiting the Audit→Plan gate (§11:
RLS/policies/grants are approval-gated).

---

## A. Security ticket draft — "Resolve Supabase Advisor security findings (3 CRITICAL + grant triage)"

> Paste into Notion MES Tickets (or GitHub issue). Suggested title:
> **"MES-XXX — Supabase Advisor: SECURITY DEFINER views + function-grant triage"**
> Status: Idea → **Scoped**. Category: **RLS/policies/grants → approval-gated (stop after Plan).**

### Problem / opportunity

Supabase Advisor flags **3 CRITICAL (ERROR-level)** security findings on production
(`xhziwveaiuhzdoutpgrh`), plus a cluster of related `WARN`s. The CRITICALs are all
`security_definer_view`: a `SECURITY DEFINER` view enforces the **view creator's** permissions/RLS,
not the **querying user's**, so RLS on the underlying tables is bypassed for anyone who can read the
view. For PII-bearing sources this is the difference between "PII-safe projection" and "PII leak,"
so it must be reviewed deliberately — **not** blind-flipped.

### The 3 CRITICAL findings (lint `0010_security_definer_view`)

| View | Underlying sensitivity | Notes |
|------|------------------------|-------|
| `public.agency_contacts_public` | `agency_contacts` holds PII (per CLAUDE.md §5) | Confirm the view's column projection is the intended PII-safe subset |
| `public.community_members_public` | Mentor PII; **intended** public projection (CLAUDE.md §5) | Anonymity model depends on this — review, don't break |
| `public.investors_public` | Investor PII; **intended** public projection (CLAUDE.md §5) | Same |

Docs / remediation: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

### Why this is subtle (do NOT blind-fix)

The standard remediation is to recreate each view with `security_invoker = true` (PG15+) so the
**caller's** RLS applies. But `community_members_public` and `investors_public` are *designed* to be
readable by `anon` as PII-safe projections. If we flip `security_invoker` on without first ensuring
the underlying tables' RLS grants `anon`/`authenticated` exactly the intended rows/columns, we will
either (a) **break** the public directory (view returns nothing), or (b) **leak** PII (if RLS is more
permissive than the view's projection). So each view needs: confirm the SELECT projection is
PII-safe → confirm/author underlying-table RLS that matches → switch to `security_invoker` →
verify anon sees only the safe projection.

### Secondary (WARN) — fold in as a checklist, lower priority

- **SECURITY DEFINER functions executable by `anon`/`authenticated`** (lints `0028`/`0029`) — triage
  which grants are deliberate vs should be revoked:
  - *Intended public* (keep, per CLAUDE.md §7): `get_shared_report(uuid)`, `match_knowledge(...)`,
    `get_tier_gated_report(uuid)` (the security-critical tier strip point).
  - *Review*: `get_ecosystem_stats()`, `has_role(uuid, app_role)`, `increment_download_count(uuid)`
    — decide whether `anon`/`authenticated` EXECUTE is needed; revoke if not.
- **Extensions in `public`** (lint `0014`): `pg_trgm`, `vector`, `pg_net` — consider relocating to a
  dedicated schema (low urgency; some tooling assumes `public`).
- **Auth**: `auth_otp_long_expiry` (already tracked by **MES-33**), `auth_leaked_password_protection`
  **disabled** (trivial dashboard toggle — enable it).
- **INFO** (`rls_enabled_no_policy`, ~20 internal/staging tables e.g. `ii_*`, `events_staging`,
  `firecrawl_scrape_cache`, `mes_knowledge_base`): deny-by-default is the *intended* posture for
  service-role-only tables; do a quick pass to confirm none should actually be readable.

### Proposed approach (gate-staged)

1. **Audit** (read-only): for each of the 3 views, dump the view definition + the underlying table's
   RLS policies and grants; confirm the intended anon-visible projection.
2. **Plan**: write the exact `CREATE OR REPLACE VIEW ... WITH (security_invoker = true)` + any RLS
   policy changes per view, as an additive migration. **Stop here for Stephen's approval** (RLS).
3. **Implement**: migration via the PR flow (merge-to-main auto-applies — §10); re-run
   `get_advisors(type: security)` to confirm the 3 CRITICALs clear and no new PII exposure.

### Acceptance criteria

- [ ] The 3 `security_definer_view` CRITICALs no longer appear in `get_advisors`.
- [ ] `anon` sees only the intended PII-safe projection from each of the 3 views (verified).
- [ ] SECURITY DEFINER function grants triaged; unnecessary `anon`/`authenticated` EXECUTE revoked.
- [ ] Leaked-password protection enabled; OTP expiry cross-checked with MES-33.
- [ ] Migration is additive/reversible; RLS changes approved before implementation.

### Out of scope

- Anything touching payments/entitlements, or the collation work (done separately).

---

## B. Supabase support note — `template1` collation refresh

> Low priority. The project `postgres` role is not superuser and cannot refresh `template1`
> (owned by `supabase_admin`), so this needs Supabase to run it. Paste into a support request:

**Subject:** Refresh collation version on `template1` (project `xhziwveaiuhzdoutpgrh`)

> After the recent platform ICU update, `template1` reports a collation version mismatch
> (`datcollversion` `153.120` vs actual `153.121`) and logs `database "template1" has a collation
> version mismatch` on internal maintenance connections. We've already run
> `ALTER DATABASE postgres REFRESH COLLATION VERSION;` on the `postgres` database (which cleared the
> bulk of the warnings), but our project role can't refresh `template1`. Could you run
> `ALTER DATABASE template1 REFRESH COLLATION VERSION;` to clear the remaining warnings? It's a micro
> ICU bump (unchanged Unicode/UCA version), so no reindex is needed. Thanks.
