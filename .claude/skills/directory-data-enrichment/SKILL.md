---
name: directory-data-enrichment
description: Staging/proposal-first directory data enrichment — never live writes without review, dedupe rules, the canonical sector taxonomy, source attribution, and PII stripping. Use before importing, enriching, or bulk-writing any directory table.
---

Last verified: 2026-07-07

# Directory Data Enrichment

## Purpose
Get research/AI-enriched data into the directories **safely**: staged, confidence-flagged,
human-reviewed, per-field applied — never a blind bulk write to a live table.

## When to trigger / when NOT to
- **Trigger:** importing/enriching `service_providers`, `community_members`, `events`,
  `innovation_ecosystem`, `trade_investment_agencies`, `investors`, `content_*`, `lead_databases`;
  any AI/scrape → directory write.
- **Don't trigger:** reading directories for a report (→ `report-generation-quality`); schema/RLS
  of the tables (→ `supabase-rls-and-migrations`).

## Preconditions — inspect first
- The staging tables and their `status`/`confidence` columns (below), and the two workflow docs:
  `docs/trade-agencies-staging-review-2026-05-09.md` (the good pattern),
  `docs/service-providers-bulk-import-audit.md` (the anti-pattern).
- The target live table's real columns + how the frontend reads them (bulk imports have shipped
  data the UI can't render).

## Playbook — the staged workflow (canonical, do this)
1. **Write to a staging table, never the live one.** Staging tables carry a `status` CHECK and
   (where present) `confidence`: `trade_agencies_enrichment_staging`
   (`pending|approved|rejected|applied|invalid`), `innovation_ecosystem_enrichment_staging`
   (`pending|approved|rejected|applied`), `ecosystem_import_candidates`
   (`status` + `confidence high|medium|low` + `proposed_action` + `validation_flags[]` +
   `dedupe_key`), `events_staging` (`processed` + `target_event_id`). All are admin-gated,
   service-role written.
2. **Self-report confidence and flag the unverifiable.** Research agents mark each row's confidence
   and set fabricated/unverifiable orgs to `invalid`/`low` — the trade-agencies run caught a
   fabricated chamber ("AMCC") and quarantined a site-less org this way. Never silently apply a
   low-confidence or unverifiable row.
3. **Human diff-review gate before apply.** Produce a review doc, then **STOP and await explicit
   "apply"** (the trade-agencies doc ends exactly this way). No apply without sign-off — this is an
   approval-gated broad-data-write (see `mes-ticket-workflow`).
4. **Apply per-field, not overwrite-all.** Encode rules per column: some fields REPLACE entirely
   (over-tagged defaults like `support_types`), most only fill null/placeholder/truncated values,
   some are conditional (overwrite `location_city` only if it looks like an address). Flip any
   `needs_re_research` flag off after apply.
5. **Normalise before it reaches a live table:** resolve `location` → `location_id`, generate clean
   slugs (no accented/garbage chars), and clean array tags — the direct bulk import shipped
   `"LinkedIn)"` service tags, 43 unmatchable location formats, and 95 NULL `location_id`s.
6. **Attribute the source** (e.g. `partner_domain_lookup.source = 'claude_research'`); strip PII per
   `secrets-and-env-management` — never commit people-data CSVs/SQL to the repo (MES-35 S3).

## Canonical sector taxonomy (use the right table)
- `linkedin_industries` — canonical **intake/tagging** vocabulary (sector→group→sub_industry).
- `legacy_industry_mapping` — old-value → LinkedIn adapter (compat only, not a primary vocab).
- `sector_vocabulary` — raw-string → `sector_slugs[]` **matching lookup** for enrichment/matching.
- `industry_sectors` — canonical **`/sectors` directory content** + keyword arrays for array-overlap
  matching (`.cs.{}`). Don't cross these wires.

## Red flags / approval gates
- Any write to a live directory table from a research/scrape/MCP flow without a staging step.
- Applying staged rows without a diff-review sign-off, or applying `invalid`/`low` rows.
- Overwrite-all where a per-field rule is needed; unnormalised location/slug/tags.
- Note the current inconsistency: `enrich-innovation-ecosystem`/`enrich-investors`/`enrich-content`
  write **directly to live tables** (admin-gated, only-missing fields). That's tolerated for
  fill-missing enrichment but is NOT a licence for bulk imports — prefer staging for anything
  broad or overwriting.

## Good / bad examples
- ✅ Trade-agencies run: 140 rows staged, confidence-tagged, one fabricated org caught, review doc
  → STOP → apply per-field rules only after "apply".
- ❌ Service-providers bulk import: 87 rows straight to live `service_providers` via MCP →
  scrape-garbage tags, unmatchable locations, NULL `location_id`, UI can't mark any row verified.
- ❌ Committing `import_investors.sql` with real emails (MES-35 S3) — PII in history.

## Self-check rubric (pass/fail)
- [ ] Enriched/imported rows land in a staging table with `status` (+ `confidence` where present).
- [ ] Each row confidence-tagged; fabricated/unverifiable → `invalid`/`low`, not applied.
- [ ] A diff-review doc exists and apply happened only after explicit sign-off.
- [ ] Apply is per-field; `location_id`/slugs/tags normalised; source attributed; no PII committed.
- [ ] Correct taxonomy table used for the purpose.

## Evidence
Inspected 2026-07-07: staging tables in `supabase/migrations/20260704095538_remote_baseline.sql`
(`trade_agencies_enrichment_staging`, `innovation_ecosystem_enrichment_staging`,
`ecosystem_import_candidates`, `events_staging`, `partner_domain_lookup`) + live `list_tables`;
enrichment fns `enrich-content/index.ts:156,267-276`, `enrich-innovation-ecosystem/index.ts:37,373`,
`enrich-investors/index.ts:31,282`; taxonomy tables `linkedin_industries`,
`legacy_industry_mapping`, `sector_vocabulary`, `industry_sectors`. Docs:
`docs/trade-agencies-staging-review-2026-05-09.md`, `docs/service-providers-bulk-import-audit.md`;
PII-in-history `docs/audits/MES-35-security-data-audit.md` S3.

## Common MES pitfalls (real)
1. **Direct bulk import without staging** shipped scrape garbage, unmatchable locations, and 95
   NULL `location_id`s to live `service_providers` (`service-providers-bulk-import-audit.md`).
2. **Fabricated orgs** slip in without a verify step — the staged run caught "AMCC" only because
   agents self-reported and a human reviewed (`trade-agencies-staging-review-2026-05-09.md`).
3. **Wrong taxonomy table** — using `industry_sectors` where `linkedin_industries` (intake) or
   `sector_vocabulary` (matching) is canonical, or vice versa.
4. **PII committed to the repo** — data CSVs/SQL with real emails need a history rewrite, not a
   delete (MES-35 S3); enrichment must strip PII (rules in `secrets-and-env-management`).
