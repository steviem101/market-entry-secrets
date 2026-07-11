# Golden-set eval harness (MES-148 Phase 1c)

Frozen intakes replayed through the real `generate-report` pipeline on every
prompt/pipeline change, judge-scored against a fixed rubric, and diffed against
a committed baseline. A section whose mean score drops **≥ 1.0** versus baseline
fails the run.

## Layout

| Path | Purpose |
|------|---------|
| `goldens/*.json` | Frozen intakes (`golden_id`, `description`, `intake` = a `user_intake_forms` insert payload). Three are real frozen prod intakes (Floats, Infact, CreditLogic); two are synthetic corridor/vertical fillers. |
| `judge.ts` | Pure judge logic: prompt builder, reply validation, baseline diff. Unit-tested by `judge.test.ts` under `npm test`. |
| `run-goldens.ts` | Deno runner: insert intake → invoke `generate-report` → poll → judge (pinned Claude Sonnet) → write `eval_runs` → gate vs `baselines.json`. |
| `baselines.json` | Committed per-golden, per-section rubric scores. Updated deliberately via `--update-baseline`, reviewed like code. |

## Rubric

Each section is scored 1–5 on **grounding**, **specificity**, **personalisation**
and **duplication** (`golden-judge-v1`). The judge model is pinned
(`claude-sonnet-4-6`) so score movement measures the pipeline, not the judge.
The runner also records the report's `metadata.verification` totals — the
Phase 1a acceptance target is zero unverified numerals across 10 consecutive
golden runs.

## Environment

Point the runner at a **preview/staging Supabase env, never prod** (it inserts
intakes and burns real Firecrawl/Perplexity/LLM spend — roughly one full report
per golden per run).

| Variable | Meaning |
|----------|---------|
| `EVAL_SUPABASE_URL` / `EVAL_SUPABASE_ANON_KEY` | Target environment |
| `EVAL_SERVICE_ROLE_KEY` | Reads `report_json`, writes `eval_runs` |
| `EVAL_USER_EMAIL` / `EVAL_USER_PASSWORD` | Dedicated eval user in that env (owns the intakes) |
| `ANTHROPIC_API_KEY` | Judge access |
| `RUN_LABEL` (optional) | Stored on `eval_runs` rows (CI passes the git SHA) |

When any variable is missing the runner prints `SKIPPED` and exits 0 — CI stays
green until the secrets are configured (GitHub → Settings → Secrets → Actions).

## Running

```sh
# full run against the configured env
deno run --allow-net --allow-env --allow-read --allow-write eval/run-goldens.ts

# one golden
deno run --allow-net --allow-env --allow-read --allow-write eval/run-goldens.ts --goldens floats-au-startup

# adopt the current scores as the new baseline (then commit baselines.json)
deno run --allow-net --allow-env --allow-read --allow-write eval/run-goldens.ts --update-baseline
```

CI: `.github/workflows/golden-eval.yml` — manual `workflow_dispatch` plus
automatic runs on PRs touching `supabase/functions/generate-report/**`,
report-template migrations, or `eval/**`.

## Constraints & conventions

- `generate-report` allows **5 reports/60min/user** — keep runs ≤5 goldens per
  eval user per hour, or shard eval users.
- Bootstrapping: the committed baseline starts empty; the first successful
  `--update-baseline` run populates it. Until then the gate is inactive.
- Adding a golden: freeze a real intake (strip nothing but `user_id`/`status`;
  intakes carry no personal PII by design — verify before committing) or write a
  synthetic one covering a new corridor/vertical/persona. Aim for the ticket's
  10–20. Low-feedback prod intakes auto-proposed as goldens (Slack approve) is
  Phase 1c follow-up work.
- Judge changes (`RUBRIC_VERSION`, model, prompt) invalidate the baseline —
  bump the version and re-baseline in the same PR.
