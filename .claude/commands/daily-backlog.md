# Daily Backlog

Generate today's prioritized work backlog for MES Platform.

## HARD RULES

1. ONLY project in scope: MES Platform (Supabase ref: `xhziwveaiuhzdoutpgrh`).
2. NEVER include items that would require touching Content Studio (ref: `rcgaviwbsudouvfwzydq`).
3. Read-only. This command writes exactly one file (`daily-backlogs/YYYY-MM-DD.md`) and nothing else.
4. Do not invent items. Every item must be traceable to a concrete source (commit, file:line, issue, PR, gotcha, or Supabase query).
5. Skip any item already in `daily-backlogs/resolved-log.md`.
6. If no qualifying items are found, write a backlog that says so. Do not pad.

## Pre-flight checks

Run silently, fail loudly if any check fails:

1. Confirm we are on a clean git branch, or create one: `backlog/{YYYYMMDD}`.
2. Confirm Supabase MCP is pointed at `xhziwveaiuhzdoutpgrh` (not Content Studio).
3. Read `CLAUDE.md` for project context and known gotchas.
4. Read `daily-backlogs/resolved-log.md` to build the exclusion list.
5. If `daily-backlogs/{today}.md` already exists, ask: overwrite, append, or abort?

## Discovery sources

Run in parallel where possible:

1. **Git log (last 30 days)** — look for patterns like "batch 01", "pilot", "phase 1", "WIP" that imply a natural follow-up (batch 02, full rollout, phase 2, finish).
2. **TODO / FIXME / HACK comments** — grep `src/`, `supabase/functions/`, `supabase/migrations/`.
3. **GitHub open issues** — via `mcp__github__list_issues` on `steviem101/market-entry-secrets`.
4. **GitHub open PRs** — failing CI, unresolved review threads, stale branches.
5. **CLAUDE.md Known Gotchas** — each gotcha is a potential hardening item.
6. **Schema drift** — tables referenced via `(supabase as any).from(...)` that aren't in `src/integrations/supabase/types.ts`.
7. **Edge function health** — functions in `supabase/functions/` missing `verify_jwt` alignment with `config.toml`, missing error handling, or missing structured logging.
8. **Directory coverage gaps** — tables listed in CLAUDE.md §4 with fewer than ~10 rows (via Supabase MCP count query).

## Scoring

For each candidate item:

- **Impact** (1–5): security > revenue > user-facing > internal > nice-to-have.
- **Effort** (S/M/L): S ≤ 1h, M ≤ 4h, L = full day+.
- **Risk** (low/med/high): blast radius if something breaks.
- **Source confidence** (low/med/high): how concrete is the evidence.

Rank by `impact × source_confidence ÷ effort_weight`, breaking ties by low risk first. Flag the top 3 as "recommended for today".

## Output file format

Write `daily-backlogs/{YYYY-MM-DD}.md`:

```
# Daily Backlog — {YYYY-MM-DD}

Generated {ISO timestamp}. Excluded {N} items already in resolved-log.md.

## Recommended for today

1. **{title}** — {source}
   - Why: {rationale}
   - Effort: {S/M/L} · Impact: {1-5} · Risk: {low/med/high}
   - Next step: run `/implement-item` with "item 1"

2. **{title}** — {source}
   ...

3. **{title}** — {source}
   ...

## Full list

4. **{title}** — {source}
   - {short rationale}
   - Effort: {S/M/L} · Impact: {1-5} · Risk: {low/med/high}

5. ...
...
10. ...

## Sources consulted

- Git log: {N} commits scanned, {M} patterns matched
- TODO/FIXME: {N} hits, {M} surfaced
- GitHub issues: {N} open, {M} surfaced
- GitHub PRs: {N} open, {M} surfaced
- Known gotchas: {N}
- Schema drift: {N}
- Edge function audit: {N}
- Directory coverage: {N} tables checked
```

## After writing

Print to chat:

```
Daily backlog written: daily-backlogs/{YYYY-MM-DD}.md

Top 3 recommended:
1. {title}
2. {title}
3. {title}

Reply with an item number (e.g. "item 3") to pass to /implement-item,
or "regenerate" to retry with different weights.
```

Then STOP.

## Failure modes

- **Supabase MCP returns wrong project**: STOP. Do not fall back to git-only discovery.
- **No GitHub access**: note it under "Sources consulted" and proceed with local sources.
- **`resolved-log.md` missing**: create an empty one, proceed.
- **Backlog file for today already exists**: ask before overwriting.
- **Would need to touch Content Studio to assess an item**: drop the item.
