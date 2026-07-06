# MES-57 — Committed-PII purge runbook

> Companion to the MES-57 PR (audit S3 / backlog T20). The PR removes the
> PII-bearing files from the **working tree** and blocks re-adds via
> `.gitignore`. The **git-history rewrite below is NOT executed** — it needs an
> explicit human go-ahead and a coordinated force-push + re-clone window.
> Until it runs, every clone and the GitHub history still contain the data.

## 1. What was committed, and where

Roughly 600+ unique personal email addresses, 1,200+ personal LinkedIn URLs,
and AI-generated profiling of named individuals, across three groups
(complete machine-readable list: [`mes-57-purge-paths.txt`](./mes-57-purge-paths.txt), 142 paths
including the pre-archive `supabase/migrations/…` twins of archived files):

| Group | Files | PII |
|---|---|---|
| Mentor identification pipeline | `mentor_identification/mes_mentor_candidates*.{csv,xlsx}` (4 CSVs + XLSX), `enrichments*.{json,sql}`, `upload_payload.json`, `upload_preview.csv`, `dedup_sets.json`, `insert_batch_1-12.sql` | Full names + personal/professional emails + LinkedIn URLs + AI scoring/"reasoning" profiling of ~750 real people |
| Import/fix scripts | `scripts/import_investors.sql` (147 emails, 204 LinkedIn), `scripts/fix_csv.py` (35 emails), `scripts/apply_verified_fixes.py` (LinkedIn), `scripts/startmate_import_blocks/01,02,04,05*.sql` (named-person emails + LinkedIn), `data/existing_picks.csv` (~71 LinkedIn) | Personal contact data of investors, founders, coworking/newsletter contacts |
| Applied-migration archive | `supabase/migrations_archive/*enrich_angel_investors*.sql` (56 files incl. pilot), `*import_venture_debt_investors.sql` | Named-individual contact emails written into the `investors` table (also present in history under the pre-archive `supabase/migrations/` paths) |

Also: **`.env` was git-tracked** (S19) — it holds only the public anon key, so
no rotation is forced, but it is untracked in this PR (`git rm --cached`) and
stays ignored.

**Kept deliberately** (org-level contact info, not personal PII): location /
grant-program / event seeds (`info@…` addresses), `startmate_import_blocks/03_accelerator.sql`,
`06_podcast.sql`, `backfill_agency_contacts.sql` and `import_vc_investors_batch1.sql`
(no PII literals), `existing_mentors.json` (anonymised entries), the
`mentor_identification/*.py` tooling, and the VC *fund* data (company-level).

The underlying business data stays in the database (that access is governed by
RLS — see MES-56); this ticket is only about copies in version control.

## 2. What this PR does (safe, no approval needed)

1. `git rm` of the 86 PII-bearing tracked files listed above.
2. `git rm --cached .env` (file stays on disk for local dev; `.gitignore`
   already covers it).
3. `.gitignore` patterns blocking every purged class from being re-added.
4. This runbook + `mes-57-purge-paths.txt`.

⚠️ Tree deletion does **not** remove the data from history. Anyone with a
clone, a fork, or repo read access can still check out an old commit. The
rewrite below is what actually erases it.

## 3. History rewrite — DO NOT RUN without explicit go-ahead

### 3.1 Pre-flight (owner: repo admin)

- [ ] Merge/close every open PR you can; list the rest — they must be rebased
      onto the rewritten history afterwards (`git rebase --onto`).
- [ ] Announce a merge freeze + window (~1h) to everyone with a clone,
      including any CI/automation (Lovable, Supabase branching, Claude
      sessions) that pushes to this repo.
- [ ] Take a full backup: `git clone --mirror git@github.com:steviem101/market-entry-secrets.git mes-backup.git`
      and store it PRIVATELY (it intentionally still contains the PII;
      define a deletion date for the backup itself, see §5).
- [ ] Check for forks (GitHub → Insights → Forks). Rewriting the origin does
      NOT clean forks or GitHub's cached views; if forks exist, contact the
      owners / GitHub Support to garbage-collect cached commits.

### 3.2 Rewrite (git filter-repo; BFG equivalent below)

```bash
# fresh mirror clone (filter-repo refuses non-fresh clones by default)
git clone --mirror git@github.com:steviem101/market-entry-secrets.git mes-rewrite.git
cd mes-rewrite.git

# strip every path in the list from ALL history (fresh copy of the list —
# take it from the MES-57 PR: docs/security/mes-57-purge-paths.txt)
git filter-repo --invert-paths --paths-from-file ../mes-57-purge-paths.txt

# sanity checks BEFORE pushing (both must return nothing):
git log --all --oneline -- mentor_identification/mes_mentor_candidates.csv
git grep -Ei '[a-z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|icloud|proton)' $(git rev-list --all) -- || echo CLEAN

# push the rewrite (filter-repo removes the origin remote on purpose)
git remote add origin git@github.com:steviem101/market-entry-secrets.git
git push origin --force --all
git push origin --force --tags
```

BFG alternative (per-folder, coarser): `bfg --delete-files 'mes_mentor_candidates*' --delete-files 'import_investors.sql' …` — filter-repo with the paths file is preferred because the list is exact and includes the pre-archive `supabase/migrations/…` twins.

Note: the paths file contains BOTH `supabase/migrations_archive/<file>` and
`supabase/migrations/<file>` entries — the archived files lived under
`supabase/migrations/` before the 2026-07-04 re-baseline, and filter-repo does
not follow renames automatically.

### 3.3 Post-rewrite coordination

- [ ] Every collaborator **re-clones** (do not pull into an old clone — it
      re-introduces the old objects): `git clone …` fresh, then reapply any
      local work with `git cherry-pick`/`rebase --onto`.
- [ ] Rebase the surviving open branches onto the rewritten main and
      force-push them (`--force-with-lease`).
- [ ] Ask GitHub Support to run garbage collection / invalidate cached
      commit views for the repository (dangling commits remain reachable by
      SHA on github.com until GC).
- [ ] Re-run the verification scan on a fresh clone:
      `git log --all -- <each purged path>` is empty, and a history-wide
      personal-email regex scan returns nothing.
- [ ] Unfreeze merges; note completion on the MES-57 Notion ticket.

## 4. Where the source data lives now

The mentor/investor ingestion source data must live **outside version
control**: the agreed store is the team's private drive (or `data/private/`,
which is gitignored) — not the repo. Scripts under `mentor_identification/`
and `scripts/` that consumed the purged CSVs read their inputs from a local
path going forward.

## 5. Retention & lawful basis (GDPR note)

- **What**: scraped/professional contact data (names, professional emails,
  LinkedIn URLs) and derived scoring for mentor/investor candidate research.
- **Lawful basis**: legitimate interest (B2B outreach/matching for market-entry
  services) — data is professional-context contact data of business
  practitioners. An LIA should be recorded alongside this note.
- **Retention**: keep source extracts only while the ingestion project is
  active; delete raw extracts within 12 months of collection or on request.
  The §3.1 mirror backup must be deleted once the rewrite is verified
  (target: ≤30 days after the rewrite).
- **Rights**: erasure/objection requests remove the person from the DB tables
  (`community_members`, `investors`, `agency_contacts`) AND from any retained
  source extracts.
- Repo copies are eliminated by this ticket; DB read-exposure is governed by
  RLS (MES-56 / community_members lockdown).
