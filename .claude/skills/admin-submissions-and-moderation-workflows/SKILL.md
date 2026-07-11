---
name: admin-submissions-and-moderation-workflows
description: MES admin submission/review queues end-to-end — public-INSERT funnels, the directory_submissions CHECK constraint, admin read/write paths, and the requireAdmin-edge-function pattern for mutations. Use before touching submission forms, the admin queue, or any admin-only write.
---

Last verified: 2026-07-07

# Admin Submissions & Moderation Workflows

## Purpose
Make submission funnels land where an admin can act on them, and make admin mutations go through the
correct (RLS- or service-role-backed) path — the area MES has repeatedly gotten wrong.

## When to trigger / when NOT to
- **Trigger:** submission forms (contact, directory, mentor-contact, lead/email capture, events),
  `/admin/submissions`, `/admin/mentors`, any admin-only write, review queues.
- **Don't trigger:** the RLS policy design itself (→ `supabase-rls-and-migrations`); staged data
  enrichment (→ `directory-data-enrichment`).

## Preconditions — inspect first
- `src/pages/AdminSubmissions.tsx`, `src/hooks/useAdminSubmissions.ts`,
  `src/components/auth/ProtectedRoute.tsx`, the submission modal(s), and
  `supabase/functions/admin-mentor-anonymity/index.ts` (the mutation-via-edge-function exemplar).
- The live `directory_submissions.submission_type` CHECK values before adding a new type.

## The funnels (verified)
Public/anon INSERT is scoped per table with `WITH CHECK` validation; SELECT is admin-only (or
admin + own): `directory_submissions`, `email_leads`, `lead_submissions`,
`mentor_contact_requests`, `intake_form_events`, `user_usage`. `directory_submissions` insert shape
is exactly `{ submission_type, contact_email, form_data }` — `form_data` is `Json` (pass a
structured object, e.g. `{ submission_version: 2, content_type, ...fields }`), never flat fields at
the root (CLAUDE.md rule #3).

**`directory_submissions.submission_type` CHECK — 12 allowed values:** `mentor, service_provider,
trade_agency, innovation_organization, investor, event, content, case_study, guide, data_request,
mentor_contact, contact_inquiry`. A value outside this list is rejected by the DB — a form using an
unlisted type silently fails while showing a success toast (the exact `mentor_contact` bug).

## Admin read/write paths (two correct patterns)
1. **RLS-backed direct client write** — the admin queue updates `directory_submissions.status`
   (`pending→in_review→approved|rejected`) with a client `.update()` guarded by the admin RLS
   policy (`useAdminSubmissions.ts:62-93`). Works only because the table has an admin UPDATE policy.
2. **requireAdmin edge function + service role** — where client writes are revoked (e.g.
   `community_members`, SEC-02), the UI calls an edge function. `admin-mentor-anonymity` is the
   canonical pattern: POST-only → `requireAdmin(req)` → validate inputs (UUID, boolean) → **service-
   role** update of only the intended columns → returns the masked `community_members_public` row so
   the admin preview matches public view; logs ids only, no PII. Use this whenever the table's client
   writes are locked down.

Both sit behind `<ProtectedRoute requireAdmin>` — but that gate is **client-side UX only** (hides
UI, renders no children for non-admins); **RLS is the real control** (verified present on
`directory_submissions`/`lead_submissions`/`email_leads`/`lemlist_*`/mentor-admin tables).

## Playbook
1. New submission source → INSERT into the right funnel table with a valid `submission_type`;
   structure `form_data` as an object; add the type to the CHECK **and** the admin queue's type list
   if it's new (migration = approval-gated).
2. New admin mutation → if the table has an admin RLS write policy, a scoped client write is fine;
   if client writes are revoked, add/extend a `requireAdmin` edge function writing with the service
   role, touching only the intended columns.
3. Record moderation audit fields (`reviewed_at`, `reviewed_by`, `review_notes`) on status changes.
4. Confirm an admin can actually SELECT the queue (the `USING(false)` placeholder once blocked all
   admins) and that a confirmation path exists (a form that only toasts loses data).

## Red flags / approval gates
- A form that shows success but performs no insert (or inserts an invalid `submission_type`).
- Writing directly to a **live directory table** (e.g. `events`) from a submission form, bypassing
  the review funnel.
- A client write to a table whose client grants are revoked (will fail; use the edge-function path).
- Changing the CHECK constraint or a submission RLS policy → approval-gated migration.

## Good / bad examples
- ✅ `admin-mentor-anonymity`: requireAdmin + service role + column-scoped update + masked-row echo.
- ✅ Contact form → `directory_submissions` as `contact_inquiry` (a valid type), admin sees it.
- ❌ Contact form `handleSubmit` that only `toast.success`es — data lost (real: Critical).
- ❌ `EventSubmissionForm` inserting straight into live `events` with no `pending`/review state.
- ❌ Fallback insert with `submission_type:"mentor_contact"` when that value isn't in the CHECK.

## Self-check rubric (pass/fail)
- [ ] Submission actually persists to a funnel table; `submission_type` is a valid CHECK value.
- [ ] `form_data` is a structured object; new types added to CHECK + admin queue together.
- [ ] Admin mutation uses the RLS-backed client write OR a requireAdmin service-role edge function.
- [ ] Admins can SELECT the queue; moderation audit fields recorded.
- [ ] No submission writes directly to a live directory table.

## Evidence
Inspected 2026-07-07: `src/hooks/useAdminSubmissions.ts:32-93`, `src/pages/AdminSubmissions.tsx`
(ProtectedRoute wrap, form_data rendering), `src/components/auth/ProtectedRoute.tsx:24-99`,
`supabase/functions/admin-mentor-anonymity/index.ts:28-109`; `directory_submissions` INSERT/SELECT
policies + `submission_type` CHECK and the funnel tables in
`supabase/migrations/20260704095538_remote_baseline.sql`. Audit:
`docs/audits/submission-forms-audit.md` (contact-to-nowhere, CHECK violation, `USING(false)` admin
block, EmailCapture mismatch, direct-to-`events` form). Cross-refs: `supabase-rls-and-migrations`,
`directory-data-enrichment`, `secrets-and-env-management`.

## Common MES pitfalls (real)
1. **Form to nowhere** — `/contact` showed success and saved nothing (`submission-forms-audit.md`).
2. **Invalid `submission_type`** — the `mentor_contact` fallback violated the CHECK and always
   failed silently until the value was added.
3. **`USING(false)` admin SELECT** — submissions accumulated in a table no admin could read.
4. **Direct-to-live-table submission** — `EventSubmissionForm` wrote live `events` with no review,
   bypassing the moderation funnel.
