# MES-123 — Contact profile image imports (runbook)

Bulk-load LinkedIn profile photos from a Lemlist/PhantomBuster CSV export onto MES directory
contact tiles. Images are downloaded server-side, re-encoded (EXIF stripped), stored permanently in
the `avatars` Storage bucket, and written to the matched records. Re-runnable and idempotent.

> **⚠️ Exports are perishable.** `media.licdn.com` URLs are signed and expire — the `e=` query
> param is a Unix timestamp that can be **< 24 h** from export time. Run the import **promptly**
> after exporting. Expired URLs return HTTP 403 and land as `failed` rows; the fix is a fresh
> export, not a retry.

## What it touches
- **Function:** `supabase/functions/import-contact-images` (admin-only; deployed manually).
- **Buckets:** `imports` (private, CSV audit copies), `avatars` (public read, service-role write).
- **Staging/audit table:** `public.contact_image_imports` (admin-read, service-role-write).
- **Records written:** `community_members.avatar_url` (mentors, anonymous skipped),
  `agency_contacts.avatar_url`, `service_provider_contacts.avatar_url`, `investors.avatar_url`,
  and the `image` key inside `service_providers.contact_persons` /
  `innovation_ecosystem.contact_persons` JSONB.

## One-time setup (per environment)
1. Merge the three MES-123 migrations (they create the columns, the `contact_image_imports` table,
   and the `avatars` + `imports` buckets). Confirm the Supabase integration check is green.
2. Deploy the function: `supabase functions deploy import-contact-images`.
   (It is intentionally **not** in `.github/workflows/deploy-edge-functions.yml`.)

## CSV format
Canonical columns: **`full_name`**, **`linkedin_url`**, **`image_url`** (+ optional `email`,
`company`). The header mapper also accepts the native Lemlist and PhantomBuster column names, so
either export works unmodified:
- **Lemlist:** `firstName` + `lastName` (auto-joined to full name), `email`, `companyName`,
  `linkedinUrl`, `picture`.
- **PhantomBuster:** `fullName`, `profileUrl`, `companyName`, `imgUrl`.

A row with no `image_url` is stored `failed` (`no_image_url`).

## Running an import
1. **Upload** the CSV to the private `imports` bucket (Supabase dashboard → Storage → `imports`,
   or the Storage API). Note its path, e.g. `2026-07/batch-1.csv`.
2. **Dry run first** (no Storage or record writes — just match/report). Invoke the function (admin
   JWT) with:
   ```json
   { "path": "2026-07/batch-1.csv", "source": "lemlist", "dryRun": true }
   ```
   Review `contact_image_imports` for this batch: `matched` rows show `match_method` +
   `matched_record_id`; `failed` rows show the reason (`no_match`, `ambiguous: …`, `no_image_url`).
   Fix unmatched rows in the CSV (add `linkedin_url`/`email`/`company`) and re-upload under a new
   path if needed.
3. **Live run.** Re-invoke without `dryRun` (a live run re-processes rows that are still `pending`;
   dry-run leaves them `matched`, so start a fresh batch/path for the live run, or clear the
   dry-run rows for that `batch_id`):
   ```json
   { "path": "2026-07/batch-1-live.csv", "source": "lemlist" }
   ```
   The function ingests, then processes one batch (default 30 rows). **Re-invoke until
   `remaining_pending` is 0**, passing the same `batchId` (or the same `path`, which derives a
   stable `batchId`):
   ```json
   { "action": "process", "batchId": "csv:2026-07/batch-1-live.csv" }
   ```
4. **Report.** Each response returns `{ ingest, processed: { matched, uploaded, skipped, failed },
   remaining_pending }`. The `contact_image_imports` rows are the durable audit trail.

### Flags
| Field | Default | Effect |
|-------|---------|--------|
| `path` | — | CSV path in the `imports` bucket. Triggers ingest. |
| `source` | `auto` | `lemlist` \| `phantombuster` \| `auto` — recorded as `photo_source = linkedin:<source>`. |
| `dryRun` | `false` | Match + report only; no Storage upload, no record writes. Also **probes a sample of image URLs** and reports expiry (403). |
| `overwrite` | `false` | Replace records that already have a real avatar. Off = skip them. |
| `applyNameMatches` | `false` | Apply rows held as `needs_review` for **name-only** matches (see gates below). Off = they stay held. |
| `includeColdContacts` | `false` | Write **cold-scraped** surfaces (agency contacts, investors). Off = they stay held as `needs_review`. |
| `batchSize` | `30` | Rows processed per invocation (max 50). |
| `action` | auto | `ingest` \| `process` \| `ingest_and_process`. Defaults to ingest+process when `path` is set, else process. |

### Two safety gates (rows are held, not written, by default)
Matched rows are **not always auto-written** — two gates route risky matches to `needs_review`
(the audit trail records the reason; nothing is written until you approve):
1. **Name-only matches** (matched on name+organisation, with no LinkedIn/email key — the case for
   mentors, provider-JSONB and innovation-JSONB in today's data) → held. Putting the wrong face on
   a profile is this feature's worst failure, so these need a human. Review the held rows in
   `contact_image_imports` (`status='needs_review'`, `error='name_only_review…'`), then re-run the
   same batch with `applyNameMatches: true` to apply the ones you trust.
2. **Cold-scraped surfaces** (`agency_contacts`, `investors` — people who never opted into MES) →
   held. Publishing scraped headshots is a distinct privacy/ToS decision from participants
   (mentors, listed provider reps). **Backfill participants first**; only after you've settled the
   privacy posture and takedown mechanism, re-run with `includeColdContacts: true`.

LinkedIn/email matches to participant surfaces auto-apply. A row matching both a participant and a
cold surface writes the participant now and reports the cold target as gated.

## Matching rules (how a row finds its record)
Precedence: **normalised LinkedIn URL → exact email → exact name + organisation.** LinkedIn URLs
are canonicalised on both sides (`linkedin.com/in/<slug>`). One row may match the **same** person in
several directories → it writes to **all** of them (fan-out). Two or more **different** people in a
**single** table → **ambiguous**, the row `fail`s with a reason and nothing is written. Records are
never fabricated. Anonymous mentors are excluded from matching (their photo is never published).

Note: provider-JSONB, innovation-JSONB, and mentor records have no `linkedin_url`/`email` in the
live data today, so those surfaces match on **name + company** only — and are therefore **held for
review by default** (gate 1 above), not auto-written. Agency contacts and investors carry LinkedIn
URLs and match cleanly, but are **cold-scraped and held by default** (gate 2). The safe first
backfill — LinkedIn-matched participants — happens with no extra flags.

## Idempotency & re-runs
- Ingest skips a `batch_id` that already has rows.
- Images are stored under content-hash filenames (`avatars/<table>/<record_id>-<hash8>.jpg`), so a
  re-import of the same photo is a no-op URL and a changed photo gets a new URL (automatic CDN
  cache-bust).
- Records with a real avatar are skipped unless `overwrite: true`.

## Takedown / privacy
`photo_source` on every staging row records provenance (`linkedin:<source>`) for takedown requests.
To remove a person's photo:
1. Null the field on the record — `avatar_url = NULL` (row tables) or set the contact's
   `image` back to `/placeholder.svg` (JSONB). The tile instantly falls back to initials.
2. Delete the Storage object under `avatars/<table>/…` (dashboard or Storage API).
3. Optionally mark the matching `contact_image_imports` row(s) `skipped` so a future re-run doesn't
   re-add it (or exclude the person from future exports).

## Rollback / disable
- Photos are purely additive. Nulling `avatar_url` (one record or all) restores placeholder tiles;
  no migration rollback needed.
- The frontend falls back to initials if Storage is unavailable or an image fails to load.
- The function is manually invoked — simply stop running it. `contact_image_imports` can be kept
  for audit or truncated safely.
- Emergency: revert the frontend PR; the new columns are nullable and read only by the avatar path.

## Security notes
- Never commit CSV exports or people-data to the repo (they contain PII) — they live only in the
  private `imports` bucket.
- No new secrets. The function uses the auto-provided `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
- `avatars` is public-read (tiles need it); `imports` and `contact_image_imports` are admin/
  service-role only.
