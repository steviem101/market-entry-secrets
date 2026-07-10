# Sova → MES gap analysis (MES-146)

Read-only match of the 470-row Sova directory export (`data/sova-directory.csv`,
scraped 2026-07-09) against a 2026-07-10 anon-key snapshot of the MES directory
tables. Produced by `scripts/sova_gap_analysis.py`. **No Supabase writes.**

## Headline counts

| Bucket | Rows | File |
|--------|-----:|------|
| Confident matches | **200** | `matches-confident.csv` |
| Fuzzy / needs review | **112** | `matches-needs-review.csv` |
| Missing from MES | **158** | `missing-from-mes.csv` (Sova column format — import-ready) |
| Total Sova rows | 470 | |

MES side: 993 records across `investors_public` (461), `innovation_ecosystem`
(169), `trade_investment_agencies` (134), `community_members_public` (134),
`service_providers` (95) — RLS-scoped anon reads only.

## Method (repeatable)

1. **Snapshot**: `python3 scripts/sova_gap_analysis.py --fetch --snapshot-dir <dir>`
   pulls the five sources via the Supabase REST API with the public anon key.
   The snapshot is cached outside git (it includes mentor names).
2. **Primary key — root domain**: registrable domain of Sova `Source URL` vs
   every MES `website`/`website_url`/`domain`/`linkedin_url` field. AU public
   suffixes (`com.au`, `org.au`, `gov.au`, state `*.vic.gov.au` etc.) are
   handled explicitly so gov subdomains don't collapse to `gov.au`.
3. **Shared-domain guard**: a domain is a weak signal if it's a
   social/aggregator host (LinkedIn, Eventbrite, …) **or** empirically maps to
   more than one distinct org name on either side (e.g. `business.gov.au` × 11
   Sova rows, `launchvic.org` × 6). 93 domains were flagged shared; matches on
   them can never auto-confirm.
4. **Secondary — normalised names**: lowercase, accent-fold, strip punctuation
   and trailing company suffixes (`pty ltd`, `limited`, `inc`, …); similarity =
   max(SequenceMatcher, token Jaccard, 0.8 × token containment). Containment is
   dampened so "Artesian" vs "Artesian Capital Management" reaches review but
   never auto-confirms.
5. **Buckets**:
   - **Confident**: exact normalised name; or unique domain/full-host match
     with name similarity ≥ 0.55; or name similarity ≥ 0.90 alone.
     (149 domain-backed, 51 exact/near-exact name-only.)
   - **Needs review**: shared-domain matches (53), fuzzy-name-only 0.72–0.90
     (52), domain match with weak name support (7). Columns
     `match_candidate_count` and `chosen_match_reason` support the review.
   - **Missing**: no domain or name candidate anywhere.

## What's missing (the gap)

By Sova category: Funding 52, Advice 46, Connections 44, Programs 16.
By type: Community 44, Expert 22, Grant 17, Government 15, Investor 15,
Competition 12, Tool 9, Accelerator 8, Corporate 6, University 6, other 4.
93 of 158 are National, 19 VIC, 15 NSW.

Interpretation: MES's investor coverage is strong (only 15 of 185 Sova
investors missing). The real gaps are **founder communities, grants, and
government programs** — categories MES has no dedicated directory for
(closest homes: `innovation_ecosystem`, `trade_investment_agencies`).

## Caveats / notes for the follow-up import ticket

- **Program-vs-organisation granularity**: most of the 53 shared-domain review
  rows are Sova *programs* whose *parent org* exists in MES (LaunchVic
  programs, business.gov.au grants, university accelerators). Decide per-row:
  merge into parent, or import as a separate program entry.
- **Mentor matches**: `community_members_public` produced zero confident
  matches (expected — Sova lists orgs/programs, mentors are people). Sova
  "Expert" rows (22 missing) may still be mentor candidates, not org rows.
- **`country_trade_organizations` doesn't exist** in the live DB despite being
  listed in CLAUDE.md §5 — excluded. `events`, `case_studies`, and
  `lead_databases` were deliberately excluded (time-based / non-org content).
- Matching used **live-visible data only** (anon RLS). Records hidden from
  anonymous users would show as false "missing".
- Import must follow the staged workflow in the `directory-data-enrichment`
  skill: staging table + confidence + human diff-review, never a direct bulk
  write. Sector/type mapping to the canonical taxonomy is deferred to that
  ticket (out of scope here per MES-146).

## Reproduce

```sh
python3 scripts/sova_gap_analysis.py --fetch --snapshot-dir /tmp/mes-snapshot
python3 scripts/sova_gap_analysis.py --snapshot-dir /tmp/mes-snapshot
```
