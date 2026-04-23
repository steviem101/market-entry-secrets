# Implement Backlog Item

You are implementing an approved item from today's daily backlog.

## HARD RULES (non-negotiable)

1. ONLY project in scope: MES Platform (Supabase ref: `xhziwveaiuhzdoutpgrh`).
2. NEVER touch Content Studio project (ref: `rcgaviwbsudouvfwzydq`).
3. Three phases. Hard stop between each. No phase skipping, ever.
4. No destructive DB ops without explicit confirmation in Phase 2.
5. All data writes use upsert with `ON CONFLICT`. Never `DELETE` without approval.
6. Schema is discovered at runtime from `information_schema.columns`. Never assume columns.
7. If anything is ambiguous, stop and ask. Do not guess.

## Inputs

I will provide:
- Backlog file: `daily-backlogs/YYYY-MM-DD.md`
- Item number(s) to implement: e.g. "item 3" or "items 1 and 4"
- Optional overrides or clarifications

If I have not provided these, ask before starting.

## Pre-flight checks (before Phase 1)

Run silently, fail loudly if any check fails:

1. Confirm we are on a clean git branch, or create one: `feat/{item-slug}-{YYYYMMDD}`
2. Confirm Supabase MCP is pointed at `xhziwveaiuhzdoutpgrh` (not Content Studio)
3. Confirm the backlog file exists and item number is valid
4. Pull latest: `git pull --rebase origin main`
5. Read `CLAUDE.md` for any project-specific rules I may have added

If any check fails, STOP and report.

## Phase 1: Audit (read-only)

Purpose: understand the current state before touching anything.

**No writes. No edits. No migrations. Read and report.**

Deliverables:
- Current state of affected files, tables, edge functions
- Actual schema of relevant tables via `information_schema.columns`
- Existing RLS policies, indexes, triggers on affected tables
- Any related edge functions and their `verify_jwt` setting
- Existing test coverage, if any
- Assumptions from the backlog item that are WRONG based on real state
- Hidden dependencies: other components, pages, or functions that rely on the affected code
- Risk map: what could break, who would notice, how to tell

Output format:

```
Phase 1 Audit: {item title}

Current state
{findings}

Schema reality check
{table}: {actual columns with types and nullability}

Dependencies
{other code touching this}

Assumptions in the backlog that need correcting
{list, or "none"}

Risks
- {risk}: {likelihood} / {blast radius}

Open questions for you
{numbered list, or "none"}
```

Then STOP. Output:

```
Phase 1 complete. Reply "proceed to phase 2" to continue, or answer any open questions first.
```

## Phase 2: Plan and recommendations

Purpose: turn the audit into a concrete, reviewable plan BEFORE any code is written.

Deliverables:

```
Phase 2 Plan: {item title}

Recommended approach
{1 paragraph}

Alternatives considered
- {alt 1}: rejected because {reason}
- {alt 2}: rejected because {reason}

Changes to be made

Schema changes
- {table}: {alter statement in plain English, then the SQL}
- Migration file name: supabase/migrations/{timestamp}_{slug}.sql

Edge function changes
- {function}: {what changes and why}

Frontend changes
- {file}: {what changes and why}

Data backfills (if any)
- {description, batch size, upsert key}

Test plan
- {what to verify, how}

Rollback plan
- {how to undo this if it breaks}

Effort estimate
{S/M/L, actual hours}

Files that will be created, modified, or deleted
CREATE: {list}
MODIFY: {list}
DELETE: {list, must be empty unless explicitly approved}
```

Then STOP. Output:

```
Phase 2 complete. Reply "proceed to phase 3" to implement exactly this plan.
Reply "revise: {instruction}" to adjust the plan.
Reply "stop" to save the plan and exit without coding.
```

## Phase 3: Implementation

**Only enter this phase after explicit "proceed to phase 3".**

Rules for execution:

1. Do EXACTLY what Phase 2 described. No scope creep.
2. If you discover something in Phase 2 was wrong mid-implementation, STOP and escalate. Do not silently adapt.
3. Commit in logical chunks with clear messages: `{track}: {what changed}` (e.g. `data: add leads_deals column to investors`).
4. For schema changes: use `supabase/migrations/` with timestamped files. Never `execute_sql` for DDL.
5. For data imports: upsert only, `slug` as conflict target for investors, confirm conflict target for other tables.
6. For edge functions: deploy after testing locally where possible. Respect existing `verify_jwt` conventions (internal server-to-server = false, user-facing = true).
7. For frontend: no hardcoded lists. Data-driven or config objects.
8. Run any existing linters / type checkers before declaring done.

Output as you go:

```
Step {n}: {action}
{commit hash}: {message}
{what was verified}
```

When complete:

```
Phase 3 complete: {item title}

What was delivered
- {change 1}
- {change 2}

What was verified
- {check 1}: pass/fail
- {check 2}: pass/fail

Known follow-ups (not in scope today)
- {item, or "none"}

Rollback command (if needed)
{git revert hash, or migration down command}

Update daily-backlogs/resolved-log.md with this entry? (Y/N)
```

If I reply Y, append to `daily-backlogs/resolved-log.md`:

```
{YYYY-MM-DD}: {item title} — {1-line summary} — commit {hash}
```

Then STOP. Done.

## Failure modes and how to handle them

- **"tool_use ids must be unique"**: STOP. Tell me to start a new CC session.
- **Supabase MCP returns empty or wrong project**: STOP. Do not fall back to assumptions.
- **Tests fail in Phase 3**: STOP, report, do not force-push or disable tests.
- **Git conflict on rebase**: STOP, ask for guidance.
- **Secrets or keys in diff**: STOP, flag immediately, do not commit.
- **Would need to touch Content Studio project to proceed**: STOP. That is out of scope by definition. Propose an alternative or defer.

## One more rule

You are NOT trying to be clever. You are trying to be predictable. If I read the Phase 2 plan and say yes, Phase 3 should deliver exactly that and nothing else. Novelty shows up as an open question in Phase 1 or a flagged alternative in Phase 2, never as a surprise in Phase 3.
