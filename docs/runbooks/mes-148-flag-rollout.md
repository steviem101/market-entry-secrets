# MES-148 — report-pipeline flag rollout runbook

> Operator runbook for turning on the three default-off quality flags shipped in MES-148
> Phase 1–2. Each is a **Supabase edge-function secret** read at runtime by `generate-report`
> (`Deno.env.get(...)`) — setting/updating one takes effect on the **next report generation**,
> no redeploy needed. Roll them out **one at a time, golden-validated between each**, so a score
> move is always attributable to a single lever.
>
> Recommended order: `RELEVANCE_AUTHORITATIVE` → `AU_PRESENCE_SIGNAL` → `CLAIMS_VERIFIER_MODE=blocking` (last).

## Prerequisites (shared across all three)

- **Where to set the flag:** Supabase Dashboard → project `xhziwveaiuhzdoutpgrh` → Project Settings →
  Edge Functions → Secrets. (CLI equivalent: `supabase secrets set NAME=value --project-ref xhziwveaiuhzdoutpgrh`.)
  These are `Name → Value` pairs, not credentials.
- **How to validate:** dispatch **Golden Eval** (GitHub → Actions → *Golden Eval* → Run workflow;
  `goldens` empty runs the full 5-golden set). The strict pass/fail gate may show red on unrelated
  judge noise (a lone non-target section −1.0) — **read the section scores from `eval_runs`, not the
  gate colour** (see the query appendix). A golden run costs real research + judge spend and needs
  credit on the eval `ANTHROPIC_API_KEY`.
- **How to read results:** `eval_runs` in the SQL editor
  (`https://supabase.com/dashboard/project/xhziwveaiuhzdoutpgrh/sql/new`) — see the appendix.
- **Rollback is always:** delete the secret (or set it to a disabling value). No migration, no deploy.

---

## 1. `RELEVANCE_AUTHORITATIVE`

**What it does.** Replaces the six scattered per-row union gates in `searchMatches`
(lead-ICP, geo, agency-corridor, state, chamber, immigration) with the single unified
`scoreRelevance`-driven selector (`selectRelevant.ts`). Made faithful to the legacy gate
*order* in #407, so it should be a near-no-op on scores — a clean golden run is now a
meaningful green light (before #407 the count-only shadow could not see ordering divergences).
Values that enable it: `on` / `1` / `true`. Default off = legacy gates.

**Pre-flip validation.**
1. Dispatch Golden Eval (full set, no `money_model`). Confirm **no section mean drops ≥1.0**
   vs `eval/baselines.json`. Because the port is faithful, expect roughly flat scores.
2. For an objective card check, run one golden with **`EVAL_KEEP_ROWS=1`** set on the eval env
   (so the report is not cleaned up), then inspect the persisted `report_json` provider / mentor /
   agency section cards for out-of-market or off-corridor entries. Delete the row afterward.

**Flip.** Set `RELEVANCE_AUTHORITATIVE = on`.

**Post-flip check.** Function logs on the next report show
`relevance selection: AUTHORITATIVE pre-dedupe` and `relevance selection: AUTHORITATIVE post-dedupe immigration`.
Spot-check a live report's matched cards for relevance.

**Rollback.** Delete the secret (or set to any non-enabling value). Legacy gates resume immediately.

---

## 2. `AU_PRESENCE_SIGNAL` (MES-159)

**What it does.** Derives the subject company's existing Australian footprint
(`metadata.au_presence.status` = `none` | `entering` | `established`) and, when `established`,
reweights the report from greenfield entry toward expansion (de-emphasises entity setup, visas,
grants, accelerators, co-working) and adds a grounded "current Australian footprint" line to the
**executive summary only**. **Fail-closed:** `established` requires concrete evidence (an AU address,
`.com.au` domain, a named AU customer/case study, or a directory hit) — a genuine entrant is never
reweighted away from the entry help it needs. Adds ≤1 Firecrawl search + 1 classify call per report
**only when on**. Values that enable it: `on` / `1` / `true`. Default off.

**Pre-flip validation.**
1. Regenerate the **Daon** report (the established Irish multinational that motivated MES-159).
   Confirm `metadata.au_presence.status = established`, the reweighting toward expansion, and a
   footprint line grounded only in found evidence.
2. Regenerate one genuine **entrant** intake; confirm it stays `status = none` with full entry help
   (no false "established").

**Flip.** Set `AU_PRESENCE_SIGNAL = on`.

**Post-flip check.** Inspect `report_json.metadata.au_presence` on new reports. Watch specifically
for false `established` classifications — the safeguard is fail-closed, so any should be rare.

**Rollback.** Delete the secret. Every section prompt returns byte-for-byte to today's wording
(`none` → empty directive).

---

## 3. `CLAIMS_VERIFIER_MODE=blocking` (do this LAST)

**What it actually does — read this before assuming a blast radius.** The claims verifier already
runs in `shadow` mode (default): it heuristically flags unverified numerals/entities and logs +
persists **counts only** — it changes nothing in the report. `blocking` mode adds an *active* pass,
but a **much gentler one than "strip everything flagged"**:

1. Heuristic verify flags candidate items → `flagged` (this is the `unverified_entities` count in
   telemetry — historically ~37–47% of entities, because the heuristic flags any name not found
   verbatim in the evidence corpus, including legitimate reformattings).
2. **One strong-model adjudication call** (`claude-sonnet-4-6`, `VERIFIER_ADJUDICATION_MODEL` override)
   separates true fabrications from benign derivations. **Fail-closed:** only items the judge
   *positively* marks fabricated become `fabricated` (⊆ `flagged`, usually far smaller); if the judge
   is unavailable/unparseable, nothing is treated as fabricated.
3. Sections containing `fabricated` items are **regenerated once** with a corrective note (same model,
   temp 0.2), **capped at 3 sections/report** (`MAX_REGENERATED_SECTIONS`).
4. After the single rewrite, a section whose fabricated items survive (or whose rewrite failed) is
   marked `unverified_facts: true` — **additive metadata, content is never deleted**
   ("regenerate-once-then-soften").
5. **Fail-open everywhere: verification can never fail a report.**

So the real blast radius per report is: 1 adjudication call (only when something is flagged) +
up to 3 section rewrites; no deletions. Numerals are already near-clean in telemetry (0–2 unverified
per report), so figures are well-grounded; the entity heuristic is noisy and adjudication pares it
down. **The one number we don't yet have is `fabricated_count`** — it is only produced in blocking
mode, so a single blocking golden run is required to measure the true regeneration rate.

**Pre-flip validation.**
1. Only after ~10 clean golden runs with the earlier flags on and no grounding regressions.
2. Run one golden with `CLAIMS_VERIFIER_MODE = blocking`. From `eval_runs.verification`, read
   `fabricated_count`, `regenerated_sections`, `unverified_sections`, and the overall/section scores.
   Expect grounding to **rise**; watch for over-regeneration (many sections rewritten) or added latency.

**Flip.** Set `CLAIMS_VERIFIER_MODE = blocking` (exact string; any other value = `shadow`).

**Rollback.** Set to `shadow` or delete the secret.

---

## Appendix — telemetry queries (`eval_runs`)

Per-run overall + per-section scores for a labelled arm:
```sql
select golden_id, overall, sections
from eval_runs
where run_label = '<commit-sha>::money=<model>'   -- or just '<commit-sha>' for a plain arm
order by golden_id;
```

Verifier blast-radius signal (works in shadow; `fabricated_count` populates in blocking):
```sql
select golden_id,
       verification->'totals'          as totals,          -- entities/numerals checked + unverified
       verification->>'flagged_count'   as flagged,
       verification->>'fabricated_count' as fabricated,     -- blocking only
       verification->'regenerated_sections' as regenerated, -- blocking only
       verification->'unverified_sections'  as still_unverified
from eval_runs
where verification is not null
order by created_at desc
limit 20;
```

Compare a candidate arm against the committed baseline: read `eval/baselines.json` for each golden's
per-section dims and diff against the arm's `sections` — the ≥0.5 lift bar for a promotion, and the
≥1.0 drop bar for the merge gate, are computed on the four rubric dims (grounding, specificity,
personalisation, duplication).
