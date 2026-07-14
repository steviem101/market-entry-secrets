# MES-160 — Notion "MES Events" → Supabase `events` importer

A safe, repeatable, review-gated import path from the curated Notion **MES Events**
database (exported as a versioned CSV) into the live MES `public.events` table.

- **Dry run is the default.** Without `--apply` the importer performs **zero**
  database writes — it validates, normalises, matches against live rows and
  writes review artefacts.
- **Apply is explicitly gated.** `--apply` refuses to run unless dry-run
  artefacts already exist for the *exact same CSV content*, and only ever
  applies proposed inserts and safe per-field updates. Ambiguous matches,
  invalid rows and taxonomy exceptions are **never** applied.
- **No schema, RLS or policy changes.** The importer uses only live columns and
  the existing `events_staging` table as its batch/audit log.

Verified against prod (`xhziwveaiuhzdoutpgrh`) on 2026-07-14: table shape,
constraints (`idx_events_slug` unique, `events_source_url_uniq` partial unique,
`events_status_check`, `events_date_precision_check`), RLS
(`events_public_read` = `status='approved'`; writes admin/service-role only),
the MES-130 `type_canonical` trigger, and the `kb_sync_event` →
`upsert_kb_event` → `embed-knowledge` KB pipeline.

## Files

| File | Purpose |
|---|---|
| `run.ts` | CLI runner (I/O). Dry run / `--apply` / `--rollback`. |
| `importLib.ts` | Pure logic: parsing, sanitisation, mapping, dedupe, proposals. Unit-tested. |
| `importLib.test.ts`, `runCli.test.ts` | Tests (run via `npm test`). |
| `sector-overrides.csv` | Reviewer-curated sector-label additions (label → canonical slugs + display category). Committed and reviewed in git. |
| `input/` (gitignored) | Frozen CSV exports + optional offline snapshots. |
| `out/<batch-id>/` (gitignored) | Review artefacts, apply/rollback reports. Retain with the batch records. |

## CSV contract (v1 — frozen export from Notion)

Export the Notion **MES Events** master database as CSV with exactly these
columns (extra columns are ignored; missing ones abort the run). Name the file
with the export date, e.g. `mes-events-2026-07-14.csv`.

| CSV column | Live column | Normalisation |
|---|---|---|
| `event_name` | `title` | whitespace/control-char sanitised, ≤200 chars |
| `event_date_start` | `date`, `event_date`, `date_precision='exact'` | must be `YYYY-MM-DD`; `event_date` = UTC midnight (curated-row convention) |
| `event_date_end` | — (no live column) | validated (`>= start`), preserved in the staging audit record only |
| `next_edition_expected` | `date`+`typical_month` (`date_precision='month'`) or `typical_month` only (`'tbc'`) | used **only when start is blank**; "July 2026" → month precision; month w/o year → tbc. Exact dates are never invented. |
| `venue` | `venue` | sanitised, ≤300 |
| `city` | `city` (+ composes `location` = "City, STATE") | sanitised |
| `state` | `state_region` | must be NSW/VIC/QLD/WA/SA/ACT/TAS/NT/National |
| `organiser` | `organizer` | sanitised (US spelling is the live column name) |
| `organiser_website` | `organizer_website` | must be `http(s)://`, else dropped + flagged |
| `website_url` | `website_url` | as above |
| `registration_url` | `registration_url` | as above |
| `description` | `description` | sanitised, ≤4000; blank falls back to title (NOT NULL column) |
| `target_audience` | — staging-only | never written to live columns → never embedded in the KB |
| `event_type` | `type` | fixed map (below); unmapped → exception |
| `frequency` | `frequency` | `annual`→Annual, `biennial`→Biennial, `multiple_per_year`→Multiple per year |
| `recurring` | — staging-only | |
| `ticket_price_range_aud` | `price` | sanitised text |
| `expected_attendance` | `attendees` + `attendees_label` | number parsed ("5,000+" → 5000); label kept verbatim |
| `exhibitor_count` | `exhibitors` + `exhibitors_label` | as above |
| `sector_tags` | `sector_tags[]` + `category` + `sector` | labels resolved via live `sector_vocabulary` + `sector-overrides.csv` to canonical LinkedIn slugs (MES-110). Unmapped labels → exception, never invented. |
| `notes` | — staging-only | editorial verification notes; never live, never embedded |
| `source_url` | — staging-only (`research_source_url`) | the research citation |
| `notion_page_url` | `source_url` | **provenance + idempotency key** (unique per event; matches `events_source_url_uniq`) |

Fixed values on insert: `source='notion_mes_events'`, `country='AU'`,
`event_format='in_person'`, `status='approved'` (override with
`--insert-status needs_review`), `data_quality_flags` gets
`import_batch:<batch-id>` plus any normalisation flags
(`date_unpublished`, `date_expected_only`, `date_in_past`, `invalid_url:*`,
`category_fallback`).

**Blanks stay blank.** Fields organisers haven't published are imported as
NULL — the importer never backfills or infers facts (that includes exact dates:
an "expected" edition only ever gets month-level precision, which the Events UI
deliberately treats as never-past).

**Untrusted input.** All CSV free text is treated as data, never instructions —
control/zero-width characters are stripped, whitespace collapsed, lengths
capped, and URLs validated before any value is used anywhere.

### Event type mapping (MES-130-aligned)

| Notion value | `events.type` | `type_canonical` (derived by DB trigger) |
|---|---|---|
| `conference_with_expo` | Conference + Expo | conference |
| `industry_summit` | Summit | conference |
| `trade_exhibition` | Trade Exhibition | expo-trade-show |
| `awards_and_networking` | Awards + Networking | networking (via the MES-130 lead-token heuristic) |
| anything else / blank | — | exception (insert blocked; reviewed) |

### Sector taxonomy

`sector_tags` labels resolve through, in order: live `sector_vocabulary`
(raw label → canonical `v2_sector_slug[]`), then `sector-overrides.csv` in this
directory. Resolved slugs are validated against the live
`sector_group_crosswalk` slug list. The first resolvable label's entry in
`sector-overrides.csv` also supplies the display `category` (a NOT NULL live
column that drives the Events page tabs). Rows with **no resolvable category
cannot be inserted** — they become taxonomy exceptions unless you pass an
explicit, reviewed `--fallback-category "<existing live label>"`. To extend the
vocabulary, add rows to `sector-overrides.csv` in a reviewed PR — never invent
labels at import time.

## Dedupe / idempotency

Matching cascade per CSV row (rejected live rows are never matched or resurrected):

1. **`source_url` equals the Notion page URL** → the row was imported before →
   per-field diff → safe update or "unchanged". This is what makes reruns
   idempotent.
2. **Exact normalised-title match** (ascii-folded, punctuation/year/"the"/
   "australia(n)" stripped) with a compatible city → **adopt** the existing
   curated row: propose a per-field update and set its `source_url` to the
   Notion page URL so future runs bind by key.
3. **Similar title** (character-bigram Dice ≥ 0.82) or exact title in a
   different city (events like Ozwater move cities between editions) →
   **ambiguous**: written to `ambiguous.csv` for human decision, never merged.
4. Otherwise → **insert** with a deterministic slug (collisions resolved
   base → base-city → base-2…).

Update proposals are **fill-blank-only** for content fields (venue, organiser,
URLs, price, attendance, sector tags, …) — curated live values are never
overwritten. The one exception: a **verified exact date** from the CSV replaces
an approximate (`month`/`tbc`) or stale exact date (`overwrite_date` ops,
visible per-field in `updates.csv`); an approximate CSV date never downgrades a
live exact date.

## Reviewer decisions (`--resolve`) — adjudicating exceptions

Ambiguous matches and blank-sector rows are never auto-resolved. After
reviewing a dry run you can feed the decisions back with `--resolve <file>` so
they are explicit, auditable and reproducible. The file is a CSV keyed by the
stable Notion page URL (line numbers shift between exports; URLs don't):

```csv
notion_page_url,decision,sector_tags
https://app.notion.com/p/<aitd-url>,insert,
https://app.notion.com/p/<dup-url>,skip,
https://app.notion.com/p/<blank-sector-url>,,automotive
```

- **`decision=insert`** — the reviewer confirmed a would-be-ambiguous row is
  genuinely new (a fuzzy/different-city match is a false positive); force it to
  insert. Source-URL idempotency still wins, so a re-run after apply binds by
  key and never double-inserts.
- **`decision=skip`** — the reviewer confirmed the row duplicates an existing
  live event; drop it from the batch explicitly (counted as `resolved_skips`,
  written to `resolved-skips.csv`, not left as an ambiguous exception).
- **`sector_tags`** — an explicit label (or `;`/`,`-separated labels) for a row
  the editor left blank, resolved through the same `sector_vocabulary` +
  `sector-overrides.csv` vocabulary. Rows using it are flagged `sector_resolved`.

The decision file is hashed into `summary.json` (`resolve_sha256`); `--apply`
refuses if the file differs from (or was added/removed since) the reviewed dry
run, so the applied decisions are exactly the reviewed ones. Keep the resolve
file alongside the batch's CSV and artefacts.

## Batch audit log & provenance

Each applied row writes an `events_staging` record (the existing events
pipeline staging table — no new schema):

- `run_id` = batch id, `source_url` = Notion page URL, `target_event_id` = the
  live row, `processed=true`
- `raw` = the staging-only fields + `action` (`insert`/`update`) +
  `pre_image` (for updates) + batch id + CSV line

Every touched `events` row also carries `import_batch:<batch-id>` in
`data_quality_flags`. Query a batch:

```sql
select action, count(*) from (
  select raw->>'action' as action from events_staging where run_id = '<batch-id>'
) t group by 1;
```

## Knowledge-base embedding (report grounding)

No importer code path writes to `mes_knowledge_base` — the live DB does it:
every insert/update on `events` fires the `kb_sync_event` trigger →
`upsert_kb_event()` builds the KB row (approved events only; only live columns,
so staging-only triage fields are structurally excluded) → the `embed-knowledge`
cron (~2 min) embeds it. Deleting an event (rollback) deletes its KB row via the
same trigger. KB rows are batch-traceable by joining
`mes_knowledge_base.source_id` to the batch's `events_staging.target_event_id`.

Verify after apply (see also §Verify):

```sql
select count(*) as kb_rows, count(*) filter (where kb.embedding is not null) as embedded
from events_staging s
join mes_knowledge_base kb on kb.source_table = 'events' and kb.source_id = s.target_event_id
where s.run_id = '<batch-id>';
```

## Runbook

### 0. Freeze the source (editorial, in Notion)

Complete the MES-160 sub-ticket: merge all sector research runs into the master
MES Events database, resolve cross-run duplicates, keep blanks where organisers
publish nothing, ensure every row has `sector_tags` and `notion_page_url`, and
export the dated CSV. The frozen CSV is the sole input.

### 1. Dry run (default; no writes)

Run locally or from a trusted server environment. Credentials via env only:

```bash
SUPABASE_URL=https://xhziwveaiuhzdoutpgrh.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=… \
node scripts/events-import/run.ts \
  --csv scripts/events-import/input/mes-events-YYYY-MM-DD.csv \
  --batch-id mes160-seed-YYYY-MM-DD
```

(The key is used **read-only** in a dry run — it exists so the dedupe inventory
can see non-approved rows. A fully offline dry run is possible with
`--events-snapshot` / `--taxonomy-snapshot` JSON files.)

### 2. Review gate (human)

Review everything under `out/<batch-id>/`:

- `inserts.csv` — proposed new events (title, slug, type, category, sectors, date…)
- `updates.csv` — one line per proposed field change (from → to, rule, match type)
- `ambiguous.csv` — needs a decision per row: either fix the Notion row (align
  the title / add the page URL to bind it) or accept it will be skipped
- `invalid.csv` — contract violations to fix in Notion and re-export
- `taxonomy-exceptions.csv` — unmapped sector labels / event types / missing
  category: fix the export or extend `sector-overrides.csv` via a reviewed PR
- `summary.json` — counts + CSV sha256 (the apply gate checks this)

Exceptions are resolved by iterating: fix Notion → re-export → re-dry-run.
**Do not proceed until the counts are what you expect and you have explicit
approval for the production write.**

### 3. Apply (approval-gated production write)

```bash
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
node scripts/events-import/run.ts \
  --csv scripts/events-import/input/mes-events-YYYY-MM-DD.csv \
  --batch-id mes160-seed-YYYY-MM-DD \
  --apply
```

- Refuses if no dry-run artefacts exist for this exact CSV sha256 + batch id.
- Applies inserts + updates only; writes `apply-report.json` with per-row outcomes.
- `--limit N` applies only the first N rows (for a small verification batch first).

### 4. Verify

1. Reconcile `apply-report.json` counts against the reviewed artefacts.
2. `/events` in preview + prod: new rows visible, upcoming-date ordering, Type/
   Sector/Category filters populated, card links work, Past tab unchanged.
   Visibility must be unchanged for anon/free/paid/admin (public read stays
   `status='approved'`).
3. KB: run the embedding SQL above; expect `kb_rows == embedded == applied count`
   after the next `embed-knowledge` cron run (~2 min). Spot-check retrieval via
   the `knowledge-search` function for a sector-matched query.
4. Lifecycle: imported rows use the standard `date_precision` semantics, so the
   existing past-event handling (Past tab, never-past for approximate dates)
   applies automatically.

### 5. Refresh cadence (monthly/quarterly)

Re-export from Notion → new dated CSV → dry run (new batch id, e.g.
`mes160-refresh-YYYY-MM-DD`) → review → apply. Reruns are idempotent: existing
rows bind by Notion page URL and only receive fill-blank/date-refresh updates;
nothing duplicates. Keep each batch's CSV + `out/` artefacts.

## Rollback

```bash
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
node scripts/events-import/run.ts --rollback <batch-id>
```

Uses the batch's `events_staging` records: deletes events the batch **inserted**
(their KB rows are removed by the `kb_sync_event` trigger) and restores the
stored `pre_image` for events the batch **updated**. Writes
`rollback-report.json`. No schema changes, nothing destructive beyond the
batch's own rows; safe to re-run (already-rolled-back rows are skipped).

## Known limitations / deliberate choices

- **No end-date column** exists on `events`; `event_date_end` lives only in the
  staging audit record. If multi-day display is ever wanted, that's a separate
  additive migration (approval-gated).
- **KB batch tagging is by join**, not embedded metadata: `mes_knowledge_base`
  metadata is derived by `upsert_kb_event()` and changing that function is an
  approval-gated migration; `source_id → events_staging.run_id` gives the same
  traceability without touching a SECURITY DEFINER function.
- **`category` is required for inserts** (NOT NULL, drives the page tabs). Rows
  without a resolvable sector are exceptions by design — fix the export or use
  an explicit `--fallback-category`.
- **Sitemap date filter**: the sitemap's known lack of an event-date filter is a
  pre-existing platform gap (see `content-freshness-and-seo-ops-loop`), not
  introduced or widened by this importer.
