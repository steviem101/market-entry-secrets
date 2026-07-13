# MES-148 Phase 5 — data-stewardship rollout runbook

> Operator runbook for turning on the Phase 5 "self-improving directory" stack shipped
> inert (PRs #418–#423). Everything below is **default-off** and safe on `main` today; this
> is the sequence to switch it on in production, **one lever at a time, validated between
> each**, so any change in behaviour or spend is attributable to a single step.
>
> Two kinds of lever, rolled out in this order:
> 1. **Matcher runtime flags** (`SERVICE_TERMS_ENABLED`, `FRESHNESS_RANKING_ENABLED`) — edge
>    secrets read by `generate-report` at generation time. No deploy; effect on the **next report**.
> 2. **Nightly loops** (`directory-steward`, `demand-mining`, `directory-discovery`) — each needs a
>    **deploy + env flag + enabled routing row**, is `dry_run`-checkable, and is cron-wired last.
>
> **Recommended order:** `SERVICE_TERMS_ENABLED` → steward → `FRESHNESS_RANKING_ENABLED` →
> demand-mining → discovery. Freshness ranking comes **after** the steward because `data_health`
> is `NULL` (neutral) until the steward scores rows; discovery comes **last** because it spends
> Firecrawl credits and needs demand signals to exist first.

## Prerequisites (shared)

- **Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform) — the only project in scope.
- **Setting an edge secret:** Dashboard → project → Project Settings → Edge Functions → Secrets
  (`Name → Value` pairs, not credentials). CLI equivalent:
  `supabase secrets set NAME=value --project-ref xhziwveaiuhzdoutpgrh`. Matcher flags take effect
  on the next report; loop flags take effect on the next invocation.
- **Deploying a loop function** (not in the `deploy-edge-functions.yml` auto-deploy list):
  `supabase functions deploy <name> --project-ref xhziwveaiuhzdoutpgrh`.
- **Enabling a routing row** (operational data toggle, not schema — safe from the SQL editor):
  `update public.activity_event_routing set enabled = true where event_type = '<event>';`
- **Invoking a loop manually / for a `dry_run`** (the loops authenticate with
  `x-webhook-secret == SLACK_NOTIFY_WEBHOOK_SECRET`, no JWT):
  ```bash
  curl -sS -X POST 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/<name>' \
    -H 'Content-Type: application/json' \
    -H "x-webhook-secret: $SLACK_NOTIFY_WEBHOOK_SECRET" \
    -d '{"dry_run": true}'
  ```
- **Enabled ≠ scheduled.** Setting the flag + routing lets a **manual** POST do real work; the loop
  only runs on its own once its pg_cron job is added (a migration — see §6). This lets you validate a
  live run by hand before automating it.
- **Rollback is always cheap:** unset the env flag (or `set enabled = false` on the routing row).
  The function no-ops. No migration, no redeploy. Unschedule a cron with
  `select cron.unschedule('<jobname>');` (or revert its migration).

---

## 1. `SERVICE_TERMS_ENABLED` (P5-1 — matcher synonym expansion)

**What it does.** Expands each intake goal tag (e.g. `Legal`) to the real directory-cased variants
from `service_terms` (`Legal Services`, `Tax & Legal`, `Employment Law`, …) before the array-overlap
match in `generate-report`. **Additive superset** — it only *adds* candidate matches; the in-memory
scorer still ranks. Returns null (no change) when off, the table is empty, or on any error. Values
that enable it: `on` / `1` / `true`.

**Pre-flip validation.** Dispatch **Golden Eval** (GitHub → Actions → *Golden Eval*, empty `goldens`
= full set). Read section means from `eval_runs` (see appendix), not the gate colour. Expect the
`service_providers` / mentor / investor sections to hold or improve (more grounded matches), no
section mean dropping ≥1.0.

**Flip.** Set `SERVICE_TERMS_ENABLED = on`.

**Post-flip check.** On the next report, function logs show the synonym-expanded match arm firing;
spot-check that provider/mentor cards now include correctly-tagged rows that were previously missed.

**Rollback.** Delete the secret (or set to a non-enabling value). Legacy exact-tag matching resumes.

---

## 2. `directory-steward` (P5-3 — nightly freshness/health pass)

**What it does.** For the stalest rows per directory table it checks source-URL reachability,
writes `last_verified` + `data_health` (metadata only — never content) to the live row, and stages
dead sources as propose-only `directory_steward_staging` rows + a Slack card. Doubly gated:
`DIRECTORY_STEWARD_ENABLED=on` **AND** routing `directory.steward` enabled.

**Deploy.** `supabase functions deploy directory-steward`.

**Dry run (no writes).** POST `{"dry_run": true}` — returns per-table `scored`/`staged` counts and
touches nothing. Confirm it reaches tables and scores without error.

**Flip.** `DIRECTORY_STEWARD_ENABLED = on`; then
`update public.activity_event_routing set enabled = true where event_type = 'directory.steward';`

**Live validation (manual, before cron).** POST `{"batch_size": 15}` once. Then in the SQL editor:
```sql
select count(*) filter (where data_health is not null) as scored, count(*) from public.service_providers;
select loop, status, reviewed, proposed, finished_at from public.automation_runs
  where loop = 'directory-steward' order by started_at desc limit 3;
```
Confirm `data_health` is populating and any dead-source cards look right in `#report-quality`.
Re-run a few times to build up coverage (it pages through the stalest rows each run).

**Schedule.** Add the cron (§6) — suggested **every 6 hours** so it churns through the directory.

**Rollback.** `DIRECTORY_STEWARD_ENABLED` off, or disable the routing row, or unschedule the cron.
`last_verified`/`data_health` already written are harmless (metadata).

---

## 3. `FRESHNESS_RANKING_ENABLED` (P5-2 — matcher freshness tiebreak)

**What it does.** Lets the `generate-report` matcher use `data_health` as a freshness tiebreaker
(higher-health rows preferred). **Inert until the steward has scored rows** — a `NULL` `data_health`
is treated as neutral, so enabling this before §2 has run is a no-op.

**Pre-flip gate.** Only flip once §2's live validation shows a **meaningful fraction** of the ranked
directories carry a non-null `data_health` (re-run the `count(*) filter (...)` query). Otherwise it
does nothing and you've spent a golden run for no signal.

**Pre-flip validation.** Golden Eval, full set. Expect near-flat or slightly-improved section means
(freshness only breaks ties among already-relevant rows); no section mean dropping ≥1.0.

**Flip.** Set `FRESHNESS_RANKING_ENABLED = on`.

**Post-flip check.** On the next report, matched cards should trend toward freshly-verified rows;
confirm no drop in match relevance.

**Rollback.** Delete the secret. Ranking ignores `data_health` again.

---

## 4. `demand-mining` (P5-5 — unmet-demand signals)

**What it does.** Maps recent intake `services_needed` to canonical `service_terms`, counts demand
vs directory supply, and writes ranked unmet-demand gaps to `directory_demand_signals` + a Slack
digest. Read-only upstream (never writes a directory row). Doubly gated: `DEMAND_MINING_ENABLED=on`
**AND** routing `directory.demand` enabled.

**Deploy.** `supabase functions deploy demand-mining`.

**Dry run (no writes, no Slack).** POST `{"dry_run": true}` — returns the computed `signals` array
without persisting or posting. Sanity-check the ranked gaps look plausible for your intake volume.

**Flip.** `DEMAND_MINING_ENABLED = on`; then
`update public.activity_event_routing set enabled = true where event_type = 'directory.demand';`

**Live validation (manual, before cron).** POST `{}` once, then:
```sql
select term_label, demand_count, supply_count, gap_score, status
  from public.directory_demand_signals order by gap_score desc limit 20;
```
Confirm signals persisted and the digest posted. These signals are the discovery agent's queue, so
do this **before** §5.

**Schedule.** Add the cron (§6) — suggested **weekly** (demand shifts slowly).

**Rollback.** `DEMAND_MINING_ENABLED` off / disable routing / unschedule. Drop signal rows if desired.

---

## 5. `directory-discovery` (P5-4 — demand-driven candidate sourcing) — LAST

**What it does.** Reads the top open `directory_demand_signals`, Firecrawl-searches (AU-scoped) for
candidate providers, dedupes against the live directory + open staging, and stages propose-only
`directory_discovery_staging` rows + an informational Slack digest. **Never auto-inserts into a
directory.** Doubly gated: `DIRECTORY_DISCOVERY_ENABLED=on` **AND** routing `directory.discovery`
enabled. Uses the existing `FIRECRAWL_API_KEY`.

> **Cost note.** This is the only loop that spends money (Firecrawl credits). A `dry_run` **still runs
> the searches** (it only skips the DB writes + Slack), so a dry run costs credits — keep `max_signals`
> small when validating. It also no-ops entirely when there are no open demand signals (do §4 first).

**Deploy.** `supabase functions deploy directory-discovery`.

**Dry run (spends credits; no writes).** POST `{"dry_run": true, "max_signals": 1}` — returns a
`candidates` preview. Confirm extraction/dedup look sane (no aggregator/social hosts, nothing already
in the directory).

**Flip.** `DIRECTORY_DISCOVERY_ENABLED = on`; then
`update public.activity_event_routing set enabled = true where event_type = 'directory.discovery';`

**Live validation (manual, before cron).** POST `{"max_signals": 2}` once, then:
```sql
select candidate_name, candidate_domain, term_slug, status, created_at
  from public.directory_discovery_staging order by created_at desc limit 20;
```
Confirm candidates staged, the digest posted, and the targeted signals flipped to `ack`
(`select term_slug, status from public.directory_demand_signals where status = 'ack';`).

**Schedule.** Add the cron (§6) — suggested **weekly**, low `max_signals` (default 3) to bound spend.

**Rollback.** `DIRECTORY_DISCOVERY_ENABLED` off / disable routing / unschedule. Staged rows are
propose-only and never touched the live directory.

---

## 6. Cron wiring (via migration — the PR flow, not ad-hoc SQL)

Schedules live in the DB but must reach prod through a **migration** (merge to `main` auto-applies),
mirroring `20260710200000_stripe_webhook_reconcile_cron.sql`. Add these **only after** the
corresponding loop is deployed, flag-on, routing-on, and manually validated. The cron reads the
guard secret from Vault and sends it as `x-webhook-secret`, so `SLACK_NOTIFY_WEBHOOK_SECRET` must
exist as a Vault secret (`slack_notify_webhook_secret`) — the same one the report-quality crons use.

Template (one `do $$ … $$` block per loop; guard on `pg_cron`, re-schedule by name):
```sql
perform cron.schedule(
  'directory-steward',                      -- job name (also 'demand-mining', 'directory-discovery')
  '15 */6 * * *',                           -- steward: every 6h; demand/discovery: weekly e.g. '30 2 * * 1'
  $cron$
  select net.http_post(
    url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/directory-steward',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $cron$
);
```
Because each loop **self-gates** (env flag + routing row), a cron that fires while a loop is still
disabled simply no-ops — but keep the recommended order so you're never scheduling ahead of a
validated manual run.

---

## 7. Monitoring & success criteria

- **Telemetry:** every run writes `automation_runs` (a `status='running'` row up front, updated to
  `success`/`error`). Watch for `error` rows or `running` rows that never finish:
  ```sql
  select loop, status, reviewed, proposed, error, started_at, finished_at
    from public.automation_runs
    where loop in ('directory-steward','demand-mining','directory-discovery')
    order by started_at desc limit 20;
  ```
- **Slack:** steward dead-source cards, demand digest, and discovery candidate digest all post to the
  `#report-quality` channel (reused routing). A silent channel + `success` runs with `proposed = 0`
  is normal (nothing to surface), not a failure.
- **Reports (matcher flags):** track golden section means in `eval_runs` before/after §1 and §3.
- **Discovery spend:** watch Firecrawl usage after §5; the `per_signal` metadata in `automation_runs`
  shows searches per run. Reduce the cron `max_signals` or frequency if spend is high.

## 8. Rollback summary

| Lever | Disable |
|-------|---------|
| `SERVICE_TERMS_ENABLED` / `FRESHNESS_RANKING_ENABLED` | delete the edge secret |
| steward / demand / discovery loop | unset `*_ENABLED`, or `set enabled = false` on the routing row |
| any cron | `select cron.unschedule('<jobname>');` or revert the cron migration |

No Phase 5 rollback touches schema or requires a redeploy. Staged/signal rows are propose-only and
never modified a live directory row.
