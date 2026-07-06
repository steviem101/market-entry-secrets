# Mentor Anonymization — End-to-End Audit (2026-07-06)

**Question:** mentors "marked as anonymous" still render with full identity on
directory cards and profile pages. Where does the anonymization pipeline break?

**Answer:** it doesn't. The pipeline — columns, masking view, grant lockdown,
frontend consumption — is fully built and verified working in prod. **No active
mentor row has ever had `is_anonymous = true` set**, so there is nothing for the
pipeline to mask. The root cause is missing data plus a missing marking path,
not broken code.

---

## 1. Where the flag lives

| Piece | Location |
|---|---|
| Flag | `community_members.is_anonymous` (boolean, NOT NULL, default false) |
| Overrides | `anonymous_alias`, `anonymous_company_label`, `anonymous_headline`, `anonymous_bio` (all nullable text) |
| Added by | `20260616031000_mentor_anonymity_columns.sql` (now in `supabase/migrations_archive/`, preserved in the 2026-07-04 baseline) |

## 2. Enforcement chain (all verified live 2026-07-06)

1. **View masking** — `community_members_public` (owner-executed,
   `security_invoker = false`) rewrites every identity field for
   `is_anonymous` rows: name → `COALESCE(anonymous_alias, archetype,
   'Verified Expert')`, title → masked headline, company → `'Undisclosed'`,
   image → NULL, experience_tiles → `[]`, location → origin country only,
   slug → `anon-<first 8 of id>`. `website`, `contact`, `linkedin_photo_url`
   are never in the view for anyone. Confirmed by querying the view in prod:
   the two flagged rows come back fully masked.
2. **Grant/RLS lockdown** — `anon` has **zero** table- and column-level SELECT
   grants on the base table (verified via `has_table_privilege` +
   `information_schema.column_privileges`); the only base-table SELECT policy
   is admin-only. Identity data for anonymous mentors is therefore withheld at
   the network payload, not hidden in CSS.
3. **Frontend reads** — every mentor read path uses the masked view:
   `useMentors` / `useMentorBySlug`, `useCommunityMembers`, `useMasterSearch`,
   `CommunityMembersSection` (sectors), the `search-mentors` MCP tool
   (`src/lib/mcp/tools/`), and the `mcp` edge function.
4. **Presentation** — `MentorCard`, `PersonCard`, `PersonModal` additionally
   consume `is_anonymous` (Globe avatar, masked heading, hidden company line).
   As of this ticket, `MentorProfile` does too, via the shared
   `src/lib/mentorDisplay.ts` helpers.
5. **Report pipeline** — `generate-report` excludes anonymous mentors from
   matching (`.eq("is_anonymous", false)` + a defensive re-filter at merge
   time), asserted by `semanticMatch.test.ts`.

## 3. Root cause

Prod data at audit time: **134 mentors, 2 with `is_anonymous = true`, 0 of
those active.** The two flagged rows are legacy placeholder records (already
named "Anonymous Expert…", deactivated 2026-06-15), not real mentors. The bulk
mentor import (`mentor_identification/`) that produced the current directory
hardcoded `is_anonymous: false` on every row.

Compounding this, there is **no admin control** to set the flag: client writes
to `community_members` were revoked (SEC-02), so the flag can only be set with
service-role access (dashboard SQL as owner, or a service-role script). That
apparently never happened for any real mentor — the "marking" was never
persisted.

## 4. Gaps fixed in this ticket

- `generate-plan` edge function read mentor `name, title, company` from the
  **base table** (service role) with no anonymity filter → flagged mentors
  would have leaked by real name into AI-generated plans. Now filtered on
  `is_active` / `is_anonymous` like `generate-report`.
- `MentorProfile.tsx` had no anonymous-aware rendering: an anonymous profile
  would have shown initials of the alias ("VE") and an "Undisclosed" company
  line. Now renders the Globe avatar treatment, masked heading, and no
  company/title duplication; SEO title, JSON-LD, breadcrumb, and bookmark
  title all use the masked display name.
- Masking display logic centralised in `src/lib/mentorDisplay.ts` with unit
  tests for both states (`npm test`).

## 5. Runbook — marking a mentor anonymous

The flag is service-role-only by design. To anonymize a mentor, run as owner
(Supabase dashboard SQL editor is acceptable here — this is data, not schema):

```sql
UPDATE public.community_members
SET is_anonymous = true,
    -- Optional but recommended; the view auto-derives safe fallbacks
    -- (archetype / 'Verified Expert' / origin country) when these are NULL.
    anonymous_alias         = 'Verified Fintech Expert',
    anonymous_headline      = 'Fintech scale-up operator',
    anonymous_company_label = 'ASX-listed fintech',
    anonymous_bio           = NULL  -- NULL = auto-derived from archetype + sector_tags
WHERE id = '<mentor-uuid>';
```

To reverse, set `is_anonymous = false` (overrides can stay; they are inert).

**Post-flag checklist:**

1. Verify masked payload:
   `SELECT name, title, company, image, slug FROM community_members_public WHERE id = '<uuid>';`
2. **Regenerate `public/sitemap.xml`** — it is static and contains real-name
   mentor slugs (`/mentors/experts/<real-name>`). The flagged mentor's old URL
   keeps leaking their name in the sitemap until it is rebuilt; the masked
   profile now lives at `/mentors/experts/anon-<id prefix>`.
3. Check `bookmarks` rows for the mentor: `content_title` snapshots the name
   at bookmark time, so pre-flag bookmarks retain the real name. Scrub if the
   privacy agreement requires it:
   `UPDATE bookmarks SET content_title = '<alias>' WHERE content_type = 'community_member' AND content_id = '<uuid>';`
4. The old real-name slug intentionally stops resolving (the view's slug is
   computed), so stale links 404 to the "Mentor Not Found" state rather than
   redirecting — that is the desired privacy behaviour.

## 6. Viewer-role behaviour

| Viewer | What they see |
|---|---|
| Unauthenticated / free / paid | Masked view only — identical output; the view is owner-executed so masking does not vary by role, and none of these roles can read the base table. |
| Admin (app UI) | Also masked — the app's hooks all read the view. |
| Admin (direct query / dashboard) | Real identity — base-table SELECT policy is admin-only. This is the intended "admins can still operate" path. |

## 7. Follow-ups (out of scope here)

- **Admin marking UX**: a small admin-only edge function + toggle, so
  anonymization doesn't require dashboard SQL. (Ticket explicitly deferred.)
- **Sitemap generation**: automate rebuilding `public/sitemap.xml` from the
  masked view so anonymization can't be undone by a stale static file.
- **Flag the real mentors**: business decision — which mentors agreed to
  anonymous-only participation. Use the runbook above per mentor.
