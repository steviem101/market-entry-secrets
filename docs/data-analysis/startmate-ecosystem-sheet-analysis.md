# Startmate Community-Sourced Ecosystem Sheet — Analysis & Safe Ingestion Plan

**Date:** 2026-07-03
**Source:** [Startmate community sheet](https://docs.google.com/spreadsheets/d/1lIK2Lji83-tO5DlgMHu7KI7WeVzPqL9fFJ2hrNuVaCg) (7 tabs: VCs, Accelerators, Startup Newsletters, Coworking Spaces, Student Societies, Workshop Hosts, Podcasts)
**Status:** Phase 1 — analysis only. **No production writes, no migrations applied.** Everything below the mapping matrix is a proposal awaiting admin approval.
**Tooling:** `scripts/parse_startmate_sheet.py` (dry-run parser/profiler; `--self-test` covers the normalization helpers). Raw sheet + parsed JSON live under the gitignored `data/private/startmate/` path (HYG-02: the sheet contains personal emails and LinkedIn URLs — do not commit).

---

## 1. Sheet overview

Profiled from the 2026-07-03 xlsx export (896 usable data rows total). The sheet is community-sourced and must be treated as **unverified input**.

| Tab | Data rows | Key columns | Notable quality issues |
|---|---:|---|---|
| VCs | 219 | Full Name, Fund, LinkedIn, Job Title, City, Country, Sector Focus | 13 missing LinkedIn, 1 LinkedIn *search* placeholder, 15 unknown geography, 29 missing fund, 65 missing job title, 85 missing city; sector focus filled on only 78 rows |
| Accelerators | 90 | Status, Name, Point of Contact, City/Country, Investment, Cohort Timing, Focus, Association, Website | 19 marked **Inactive**, 3 CVC; 22 missing website; location free-text ("Naarm/Melbourne/Australia", "Lower Hunter, Central Coast / Australia"); sidebar noise columns (K/L) |
| Startup Newsletters | 48 | Name, Country, Contact, Focus, Subscribe link | Links hidden behind "Link" display text (extracted via xlsx hyperlink targets); 2 missing links; 3 links are LinkedIn newsletters; 3 Fullstack newsletters share one domain |
| Coworking Spaces | 49 | Name, Country, City, Suburb, Contact, $/Desk, Focus, Website | 4 missing website; cost filled on only 13 rows; multi-campus chains (Stone & Chalk ×3, Tank Stream Labs ×6, Spacecubed brands ×3, cirque ×2) |
| Student Societies | 477 | Active, Name, University, Contact, Role, Email, Website | Very thin: 242 Facebook-only links, 212 no link at all, 18 emails, 17 named contacts; only 22 rows marked Active; broken header row (a university name occupies a header cell); ~416 rows are general-interest clubs (maths, esports, anime), not startup societies |
| Workshop Hosts | 11 | Submitter, Topic, Host Name, LinkedIn, Email, Attended?, Comments | Personal emails throughout; two header rows; 1 duplicate host (May Samali ×2); topics are personal development / coaching, not market entry |
| Podcasts | 2 | Name, Country, Contact, Focus, Link | Only 2 rows |

**Intra-sheet duplicates found (17 dedupe-key collisions):** May Samali (Workshop Hosts, genuine duplicate), ANU Mathematics Society + Impact Consulting Group (Societies, genuine duplicates), and domain-level groupings that are *campuses/brands of one org*, not errors: Stone & Chalk (3 campuses), Tank Stream Labs (6 hubs), Spacecubed brands (FLUX/Fern/Riff), CreativeCubes.Co (2), cirque (2), WorkLife (2), CORE Innovation Hub (2), I2N (3 accelerator streams + 1 newsletter), UTS programs (2), Fullstack newsletters (3, one domain).

## 2. MES relevance assessment

Cross-checked (read-only) against live MES production data on 2026-07-03: `investors` 447 rows (267 angel / 145 vc / 20 grant / 12 venture_debt / 3 accelerator), `innovation_ecosystem` 124, `community_members` 134, `service_providers` 95, `content_items` 141, `events` 192.

### High value

1. **VCs tab (219 people across 117 distinct funds)** — the strongest asset. Overlap with `investors`:
   - **Fund level:** 38 exact + 12 near-name matches (AirTree→AirTree Ventures, SquarePeg Capital→Square Peg Capital, Blacknova→Black Nova VC, …) = **50 of 117 funds already exist; 67 are new** (≈40 AU/NZ — e.g. XV Capital, GD1, MOVAC, Icehouse Ventures, NZGCP, Kilara Capital, 1835i, OneVentures*, Potentia, Reinventure; ≈25 US funds noted as ANZ-active — Base10, Battery, Lightspeed, Peak XV, M12…). (*OneVentures exists as "1v (oneventures)" — a fuzzy match the normalizer must catch.)
   - **Person level:** only 17 of 218 people match existing `investors` rows by name. The bigger win is **contact enrichment of existing fund rows**: today `investors` has `contact_name` NULL on 446/447 rows, `linkedin_url` NULL on 207, `website` NULL on 197. The sheet provides named partners with real LinkedIn profile URLs (205 of 219) and job titles for the biggest AU funds (Blackbird ×11, Main Sequence ×7, Square Peg ×7, AirTree ×7…).
   - PII note: `investors_public` deliberately excludes `contact_email`/`contact_name`/`linkedin_url`, so person data lands admin/member-side only — no public exposure change.
2. **Accelerators (90; 67 Active)** — maps to `innovation_ecosystem` (which already models accelerators: 53 rows carry the `Accelerator` service tag). ~19 exact/near matches (Startmate, BlueChilli, MAP, Monash Generator, River City Labs, SproutX, Startupbootcamp, muru-D…) plus ~10 more fuzzy matches needing review (Cicada→Cicada Innovations, CSIRO ON Accelerate→On Accelerate, Griffin Accelerator→Griffin Accelerator Program, iAccelerate→iAccelerate Wollongong, Techstars→Techstars Sydney, Innovyz, Plus Eight, Runway HQ). **≈55–60 Active accelerators are genuinely new**, with program metadata MES lacks today: investment amount, cohort timing, sector focus, backing fund.
3. **Coworking Spaces (49 rows ≈ 40 orgs)** — maps to `innovation_ecosystem` (`Co-working` service tag: 23 rows today, only 2 sheet matches — Fishburners, Harbour City Labs). City/suburb granularity (Sydney 18, Melbourne 10, Perth 5, plus regional: Newcastle, Wollongong, Byron Bay, Newman, Shoalhaven) directly supports location pages and the "landing infrastructure" story in reports.
4. **Startup Newsletters (48)** — not directory material, but excellent **ecosystem-monitoring and report-grounding source material**: 47/48 ANZ-focused with working subscribe links, spanning sector niches (What the Health, Funding Climatetech, Talking HealthTech, Fintechfun) and institutional sources (LaunchVic, NZGCP Aspire, CSIRO ON). Best first landing: one curated `content_items` guide (+ KB chunks via the existing content pipeline), not a new table.

### Medium value

5. **Podcasts (2 rows)** — same treatment as newsletters; too few for anything structural. Fold into the same curated guide.

### Low value / recommended exclusions (phase 1)

6. **Student Societies (477)** — weakest fit for a B2B market-entry audience: 87% fail a startup-relevance keyword filter (maths/esports/anime/cultural clubs), 45% have no URL, 51% Facebook-only, contacts are students who churn annually. **Exclude from directories.** Optional later: a single KB/content summary of the ~60 entrepreneurship-focused societies (UNSW Founders, UTS Startups, Melbourne Bioinnovation, StartupLink Unimelb…) as university-channel intelligence.
7. **Workshop Hosts (11)** — personal-development coaches with personal emails; not market-entry mentors (MES archetypes: Trade & Government, International Founder, Active Advisor, Scaled Founder). **Exclude from auto-import.** If any are wanted later, route them through the existing `directory_submissions` mentor funnel one at a time.

## 3. Destination mapping matrix

| Sheet entity | Rows in scope | Destination | Field mapping | Missing/derived fields | Confidence |
|---|---:|---|---|---|---|
| VC **funds** (new, AU/NZ) | ≈40 | `investors` (new rows, `investor_type='vc'`) | name←Fund; sector_focus[]←Sector Focus (split/normalized); location←City; country←Country; linkedin_url←(company page if present) | description, website, slug — **must be enriched before/at promotion** (existing `enrich-investors` edge fn fills `basic_info`/`why_work_with_us` post-insert); check sizes unknown | High |
| VC **funds** (new, US/global ANZ-active) | ≈25 | `investors` (new rows) — second batch | as above + country='US' | as above; decide whether US funds belong in the directory at all | Medium |
| VC **people** at matched funds | ≈100+ | `investors` **enrichment of existing rows** | contact_name←Full Name (most senior person); linkedin_url←LinkedIn; extra people → `details.contacts` jsonb array `{name, title, linkedin, source}` | nothing new required — columns exist and are mostly NULL | High |
| VC people with no fund / angels | ≈29 | review case-by-case → possible `investors` `investor_type='angel'` rows | name, linkedin_url, location | description; verify they actually invest | Low–Med |
| Accelerators (Active) | ≈55–60 new | `innovation_ecosystem` | name; website; location←City/Country (normalized); services=['Accelerator'] (+'Seed Funding' when Investment present); sectors/sector_tags←Focus; description←composed from Focus+Investment+Cohort Timing+Association | `description`, `employees`, `founded` are **NOT NULL** — seed with composed description + `employees='Unknown'`, `founded='Unknown'`, then run existing `enrich-innovation-ecosystem` edge fn | High |
| Accelerators (Inactive/CVC) | 22 | **exclude** (`innovation_ecosystem` has no `is_active` flag; importing dead programs pollutes the directory) | — | — | — |
| Coworking spaces | ≈40 orgs | `innovation_ecosystem` | name (campus rows merged to one org); website; location←City (+Suburb); services=['Co-working']; description←Focus (+cost when present) | same NOT NULL trio as accelerators; multi-campus orgs keep one row, campuses listed in description/experience_tiles | High |
| Newsletters + Podcasts | 50 | `content_items` — one curated guide ("ANZ startup media & newsletters") with sections per category; KB chunks follow automatically via the content fan-out triggers | title/body composed from Name+Focus+Link, grouped by sector | none — fits existing content pipeline; no schema change | High |
| Student societies | 477 | **exclude** phase 1 (optional later: KB summary of ~60 startup societies) | — | — | — |
| Workshop hosts | 11 | **exclude** (manual `directory_submissions` if ever wanted) | — | — | — |

**Assumptions to validate with Stephen:** (a) US funds are wanted in the investor directory (they're gated `member`-visibility in KB anyway); (b) one org row per multi-campus coworking chain; (c) partner names/LinkedIn on fund rows is acceptable — they stay out of `investors_public` by construction.

## 4. Data quality report (validation output)

From `scripts/parse_startmate_sheet.py` against the 2026-07-03 snapshot:

- **Missing websites:** Accelerators 22 (mostly Inactive rows), Coworking 4, Newsletters 2, Societies 212.
- **Placeholder/search links:** 1 LinkedIn search-results URL (VCs), treated as missing → low confidence.
- **Social-only links:** 242 Facebook/Instagram (nearly all Societies), 1 Accelerator.
- **Invalid emails:** 1 (Societies). Workshop-host emails are personal → PII, kept out of the repo.
- **Geography:** VCs 141 AU / 20 NZ / 43 US / 15 unknown; Accelerators 83 ANZ-classifiable; Coworking 48 ANZ; Newsletters 47 ANZ. Unknowns default to low confidence, never dropped silently.
- **Normalization needed:** fund-name variants (AirTree/AirTree Ventures, SquarePeg/Square Peg), location free-text ("Naarm/Melbourne/Australia"), sector focus is comma-separated free text needing mapping onto MES `sector_tags` vocabulary.
- **Confidence distribution (all tabs):** high 317 / medium 47 / low 532 (societies dominate low).

## 5. Proposed ingestion architecture (phase 2 — needs approval)

Reuses the repo's proven pattern: *staging table with review statuses* (`trade_agencies_enrichment_staging`, `events_staging` precedents) → manual review gate doc → COALESCE-protected apply → KB sync happens automatically.

### 5.1 One additive staging table

```sql
-- supabase/migrations/<ts>_create_ecosystem_import_candidates.sql (ADDITIVE ONLY)
CREATE TABLE IF NOT EXISTS ecosystem_import_candidates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id             text NOT NULL,             -- e.g. 'startmate-2026-07'
  source_name          text NOT NULL,             -- 'startmate_community_sheet'
  source_url           text,
  source_tab           text NOT NULL,
  source_row           integer,
  raw                  jsonb NOT NULL,            -- verbatim sheet row (auditability)
  entity_type          text NOT NULL,             -- investor_fund|investor_person|accelerator|coworking_space|newsletter|podcast|...
  proposed_destination text NOT NULL,             -- 'investors'|'innovation_ecosystem'|'content_items'|'none'
  proposed_payload     jsonb NOT NULL,            -- normalized column values for the destination
  dedupe_key           text NOT NULL,
  matched_existing_id  uuid,                      -- fuzzy/exact match found in destination table
  match_note           text,
  confidence           text NOT NULL CHECK (confidence IN ('high','medium','low')),
  validation_flags     text[] NOT NULL DEFAULT '{}',
  status               text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','approved','rejected','duplicate','applied','invalid')),
  review_notes         text,
  reviewed_by          uuid,
  reviewed_at          timestamptz,
  applied_at           timestamptz,
  target_record_id     uuid,                      -- provenance: row created/updated on apply
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, dedupe_key)                   -- idempotent re-runs per batch
);
CREATE INDEX ON ecosystem_import_candidates (status, entity_type);

-- RLS per SEC-02 convention: service-role writes, admin reads/reviews, zero anon access
ALTER TABLE ecosystem_import_candidates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ecosystem_import_candidates FROM anon, authenticated;
CREATE POLICY "Admins read import candidates" ON ecosystem_import_candidates
  FOR SELECT TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins review import candidates" ON ecosystem_import_candidates
  FOR UPDATE TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
GRANT SELECT, UPDATE ON ecosystem_import_candidates TO authenticated; -- gated by the policies above
```

Matches `report_quality_proposals` (admin read+update, service-role insert) and the SEC-02 revoke convention. **No existing RLS policy is touched; public read access is not widened anywhere.**

> Migration-hygiene reminder (docs/migrations.md): the main→prod ledger is in `MIGRATIONS_FAILED` drift — a merged migration does **not** auto-apply. The staging DDL ships as a PR'd migration file that a human applies via `supabase db push`; agents must not `apply_migration` against prod.

### 5.2 Pipeline steps (all dry-run-first)

1. **Parse (exists, this PR):** `python3 scripts/parse_startmate_sheet.py` — xlsx → `data/private/startmate/parsed_startmate_ecosystem.json` + PII-free profile on stdout. No DB access, rerunnable.
2. **Match & payload build (proposed):** `scripts/generate_startmate_candidates.py` — joins parsed JSON against read-only exports of `investors` + `innovation_ecosystem` (name-normalized + pg_trgm-style fuzzy), fills `matched_existing_id`, builds `proposed_payload`, and emits `scripts/startmate_import_blocks/*.sql` INSERT blocks for the staging table only (repo `*_blocks` convention). `--dry-run` default prints counts and writes no files without `--write`.
3. **Stage:** apply the INSERT blocks to `ecosystem_import_candidates` (supervised MCP session or psql by an admin — the trade-agencies Phase-3 precedent). Idempotent via `UNIQUE (batch_id, dedupe_key)` `ON CONFLICT DO NOTHING`.
4. **Review gate:** a staging-review doc like `docs/trade-agencies-staging-review-2026-05-09.md` — summary stats, confidence distribution, flagged duplicates, 10–15 representative diffs. Admin flips `status` to approved/rejected/duplicate (SQL or, later, an AdminSubmissions-style page — see §5.4).
5. **Apply (approved rows only):** per-destination apply script generating SQL that:
   - **new rows** → plain INSERTs (never upsert-overwrite);
   - **enrichment of matched rows** → `COALESCE(existing, new)` per field — only fills NULLs, mirroring the trade-agencies apply rules; extra fund contacts merge into `investors.details.contacts` with `{source:'startmate_community_sheet', batch_id}` attribution;
   - stamps `applied_at` + `target_record_id` back on the candidate row (provenance ledger).
6. **KB / report grounding:** nothing extra to build. `upsert_kb_investor` / `upsert_kb_ecosystem` triggers sync promoted rows into `mes_knowledge_base` (PII-stripped) and the `embed-knowledge` cron embeds them within minutes. Investor rows are `member`-visibility by design. The newsletters guide flows through the content-chunk fan-out the same way. **Raw unreviewed sheet rows are never embedded.**
7. **Post-promotion enrichment:** run existing admin edge fns `enrich-investors` (`only_missing`) and `enrich-innovation-ecosystem` to backfill descriptions/logos from websites.

### 5.3 Validation & dedupe rules (implemented in the parser; enforced again at apply)

- Normalize URLs (https, lowercase host, strip `www.`/trailing slash); reject non-URLs; prefer xlsx hyperlink targets over display text.
- Dedupe key: **website domain** when real (LinkedIn/Facebook domains don't count) else **normalized org name + geography** (suffixes like Ventures/Capital/Partners/Accelerator stripped). Multi-campus chains collapse to one org candidate; campuses preserved in `raw`.
- Person key: normalized full name + fund.
- Cross-table match: exact name → fuzzy normalized name → domain equality against the destination table; matches become *enrichment* candidates, never new rows.
- LinkedIn search URLs / Google search links ⇒ `placeholder_search_link`, confidence low.
- No website + no LinkedIn + no contact ⇒ confidence low. Inactive accelerators ⇒ excluded. Unknown geography ⇒ flagged, never silently dropped.
- Every candidate carries the verbatim `raw` row, source tab + row number, and batch id.

### 5.4 Admin review workflow

First batch: SQL-based review (as with trade agencies), driven from the review-gate doc. If this becomes recurring, a follow-up ticket can add an `AdminImportCandidates` page cloned from `src/pages/AdminSubmissions.tsx` + `useAdminSubmissions.ts` (the RLS above already permits admin SELECT/UPDATE from the client, so the UI needs no policy changes).

### 5.5 Rollback / disable

- Phase 1 (this PR): delete the branch/doc — nothing touched.
- Staging: `DELETE FROM ecosystem_import_candidates WHERE batch_id = 'startmate-2026-07'`; table drop via a rollback file in `supabase/rollback/` (additive table, nothing depends on it).
- Applied new rows: recorded in `target_record_id` → `DELETE ... WHERE id IN (SELECT target_record_id ...)`; KB rows follow automatically via the delete triggers.
- Applied enrichments: COALESCE-only writes mean originals were NULL; reverting = setting those fields back to NULL for the batch's `target_record_id`s.
- Scripts stay dry-run by default; writes require explicit `--write` flags.

## 6. RLS / security impact assessment

- **No changes to existing policies or grants.** One new table, locked per SEC-02 (anon: nothing; authenticated: admin-policy-gated SELECT/UPDATE only; inserts service-role).
- No service-role key in the client or repo; staging inserts run server-side/local (env vars, per `scripts/seed_ireland_country_page.ts` convention).
- PII containment: sheet emails/LinkedIn stay in `data/private/` (gitignored) and in staging `raw` jsonb (admin-only). On promotion, person data goes only to `investors` base-table columns already excluded from `investors_public`; `kb_strip_pii` scrubs anything that leaks into KB content.
- No paid/free gating changes; investor KB visibility stays `member` as-is.

## 7. Open questions for Stephen

1. Include the ~25 US/global funds in the `investors` directory, or ANZ-only for batch 1?
2. VC partner names+LinkedIn onto fund rows (`contact_name`/`details.contacts`) — comfortable with that as member-gated data?
3. Multi-campus coworking chains: one org row (recommended) or one row per campus?
4. Newsletters guide: publish publicly under `/content`, or keep internal as KB-only grounding first?
5. Any appetite for the ~60 startup-relevant student societies as a single KB intelligence note, or drop the tab entirely?
6. Who applies the staging migration + insert blocks to prod (given the migration-drift freeze)?

## 8. Step-by-step implementation plan (after approval)

1. PR the `ecosystem_import_candidates` migration (+ `supabase/rollback/` file). Human applies via CLI. *(Stop-gate: approval of §5.1.)*
2. Add `scripts/generate_startmate_candidates.py` (match + payload + SQL blocks; dry-run default) with self-tests alongside the parser's.
3. Run parse → generate → review dry-run counts → apply INSERT blocks to staging (batch `startmate-2026-07`).
4. Produce the staging-review doc; Stephen reviews/updates statuses.
5. Generate + apply the approved-rows promotion SQL: (a) new AU/NZ funds, (b) fund contact enrichment, (c) new accelerators, (d) coworking orgs. One sub-batch at a time, verifying KB sync after each.
6. Create the newsletters/podcasts curated guide as a normal `content_items` draft for editorial review.
7. Run `enrich-investors` + `enrich-innovation-ecosystem` on the newly inserted rows.
8. Close out: update this doc with applied counts + `automation_runs`-style summary; file follow-up tickets (admin review UI; student-societies KB note) if wanted.
