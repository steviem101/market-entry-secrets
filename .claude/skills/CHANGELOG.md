# Skills Library Changelog

Log every skill gap, wrong rule, or contradiction you find here (newest first), so it can be
fixed in a follow-up PR. Format: `- YYYY-MM-DD [skill-name] what was wrong/missing — found while <task>`.

## 2026-07-07 — Wave 1 (MES-113)

- Initial release: 8 P0 skills + index + exam baselines, authored by Fable from live repo/schema
  inspection (see each skill's Evidence section).
- Known caveat: the MES-111 pre-launch audit report (`docs/prelaunch-audit.md`) had not landed at
  authoring time. Pitfalls are grounded in the existing real audits under `docs/audits/` and
  `docs/migrations.md`. When MES-111 lands, fold its findings into Wave 1 pitfalls/exam scenarios
  and log the update here.
- Corrections to root `CLAUDE.md` discovered during authoring (root doc not modified beyond the
  skills pointer; trust the skills where they conflict): report sections now generate in a single
  parallel batch, not batches of 3 (`supabase/functions/generate-report/index.ts:2195`);
  `apify-webhook` and `notion-research-trigger` edge functions no longer exist; `generate-plan`
  calls Anthropic only (no Perplexity); route map omits `/market-entry-questions`,
  `/reset-password`, `/admin/mentors`; `reportSectionConfig.ts` also defines
  `investor_recommendations` (growth) and `setup_compliance` sections.
