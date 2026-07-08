# Doc-freshness loop (MES-124)

A scheduled, **read-only, advisory** check that detects drift between the durable
context docs — root [`CLAUDE.md`](../../CLAUDE.md) and [`.claude/skills/`](../../.claude/skills/README.md) —
and repo ground truth, so session-start context can't silently rot. It is the
follow-up to MES-115 (the CLAUDE.md rewrite).

## What it checks

| Check | Compares | Severity |
|-------|----------|----------|
| `edge-function-inventory` | CLAUDE.md §6 count + named functions vs `supabase/functions/*` | high |
| `secrets` | CLAUDE.md §12 secret names vs `Deno.env.get(...)` in edge code | high (undocumented) / low (unused) |
| `section-config` | CLAUDE.md §7 sections + count vs `reportSectionConfig.ts` `SECTION_ORDER`/`TIER_REQUIREMENTS` | high/medium |
| `migration-baseline` | CLAUDE.md §10 baseline filename vs earliest file in `supabase/migrations/` | high |
| `routes` | top-level route segments in `src/App.tsx` vs mentions in CLAUDE.md | medium |
| `claude-review-age` | CLAUDE.md "Last reviewed:" date vs threshold | medium |
| `skill-freshness` | each skill's "Last verified:" vs its dir's last git change + age threshold | medium/low |

## Layout

- `checks.ts` — **pure** logic (no IO); every check takes gathered facts → `Finding[]`. Unit-tested.
- `checks.test.ts` — colocated `node:test` tests (run by `npm test`).
- `run.ts` — IO wrapper: gathers repo facts (fs + `git log`), runs the checks, prints a
  Markdown digest, and posts a Slack digest if `SLACK_DOC_FRESHNESS_WEBHOOK` is set.

## Run it

```sh
npm run docs:check      # print the digest locally
npm test                # includes scripts/**/*.test.ts
```

## Config (env)

| Var | Default | Purpose |
|-----|---------|---------|
| `DOC_FRESHNESS_CLAUDE_DAYS` | `45` | max age before CLAUDE.md "Last reviewed" is flagged |
| `DOC_FRESHNESS_SKILL_DAYS` | `90` | max age before a skill's "Last verified" is flagged |
| `SLACK_DOC_FRESHNESS_WEBHOOK` | — | Slack incoming-webhook URL; when unset, Slack post is skipped |

## Scheduling

[`.github/workflows/doc-freshness.yml`](../../.github/workflows/doc-freshness.yml) runs it weekly
(Mondays 08:00 UTC) and on manual dispatch. It is **advisory** — it never edits docs, never fails a
build, and is not a merge gate.

## Phase 2 (not built — approval-gated)

Turning findings into a reviewable, Accept/Reject queue that sweeps accepted items into MES Tickets
(mirroring the report-quality loop) requires a `doc_freshness_proposals` table + RLS migration and
an extension of `rq-slack-actions` — all approval-gated (schema/RLS + Slack signing). Tracked
separately; this phase intentionally stops at detect-and-report.
