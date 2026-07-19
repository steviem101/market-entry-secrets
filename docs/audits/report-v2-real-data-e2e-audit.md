# report_v2 real-data E2E audit — HubSpot report (2026-07-19)

**Trigger:** owner's first production smoke test of the activated report_v2 renderer
(report `d5db4ff6-4f46-4cb2-bdef-a3cabc1abee2`, scale tier, generated 2026-07-18) surfaced
"an incredible amount of bugs". Owner-supplied PDF: 14 pages, sections 00–08.

**Method:** pulled the exact `report_json` from prod (via a temporary share token, reverted
after fetch), installed it as `dev-fixtures/real-report.json`, ran it through
`adaptPipelineReport` with an automated defect scanner (`dev-fixtures/audit.ts`, dev-only),
and reproduced visually at `/dev/report-preview?fixture=real`. Every artefact in the
owner's PDF is reproduced and root-caused. **48 concrete defects + 27 adapter mismatch
logs.** Zero crashes — the renderer's fail-safe hardening held; every defect is a
content/mapping/empty-state problem, not a runtime error.

## Root-cause taxonomy

The defects collapse into three root causes:

**RC1 — the adapter prefers junk fields or passes markdown through raw.**
The pipeline stores BOTH a clean curated `description` AND a raw-scrape
`enriched_description` per provider. The adapter picks `enriched_description`
→ entire scraped web pages (nav links, `## headings`, image markdown, a literal
"# 403 Forbidden" page for TechVisa, testimonial walls) render as card copy. The same
raw text feeds `ourRead[].why`. Exec prose keeps pipeline markdown the tokenizer doesn't
recognise: `---` rules, `> blockquotes`, external `[label](https://…)` links, and
"**Executive Summary**" / "**Your Key Question — Answered**" headings.

**RC2 — structured content exists as prose but maps to nothing, and the renderer
shows the empty scaffolding.** `swot_analysis` (4.1k chars) → empty SWOT quad;
`setup_compliance` (1.7k) → empty table/stats/checklist; competitor strengths/differs/you-row
are not produced by the pipeline → 4-column table with 3 empty columns + empty
gaps/positioning boxes; `first_customers` arrives empty via the tier RPC (visible:false —
silent per-section failure class, §14.5) → completely blank §04 card; `close.arriveWith`,
`exec.heroStat`, `exec.sequence`, `exec.keyQuestionAnswer` unpopulated → empty boxes/rails.

**RC3 — directory/pipeline data quality.** Investor stage tags "N/A (individual entry)" /
"N/A (advisory firm)" and curation notes ("…(ID 22). This entry represents an individual,
not a separate fund.") leak into customer copy. Metric captions are internal slug-style
strings with literal `[n]` citation markers ("Australia-CRM-software market size — 2024
estimate…[1]") and near-duplicate tiles (same stat in AUD and USD). Enrichment stored an
HTTP 403 error page as a provider description.

## Full defect register (48)

| # | ID | Where | Defect |
|---|----|-------|--------|
| 1 | DUP-1 | cover | headline is verbatim prefix of scope paragraph |
| 2 | DUP-2 | cover+exec | scope paragraph repeated verbatim as exec narrative ¶1 |
| 3 | MD-HEAD | exec ¶0 | "**Executive Summary**" heading rendered in body |
| 4 | MD-HR | exec ¶5 | literal `---` rendered |
| 5 | MD-HEAD | exec ¶6 | "**Your Key Question — Answered**" heading rendered in body (duplicates the styled box) |
| 6 | MD-BQ | exec ¶7 | raw blockquote `> "find grants and government funding"` |
| 7 | MD-LINK | exec ¶8 | raw external md link `[Austrade](https://www.austrade.gov.au)` |
| 8–19 | MET-CIT / MET-SLUG | metrics tiles 0–5 | `[n]` citation markers + slug-style captions in all 6 tiles |
| 20 | SWOT-EMPTY | swot | quadrants empty; pipeline `swot_analysis` prose (4108 chars) unmapped → giant blank area |
| 21 | COMP-YOU | competitors.you | customer row entirely empty |
| 22–24 | COMP-COLS | Salesforce/Attio/Creatio rows | strengths + differs columns empty (position only, truncated mid-word ~200 chars) |
| 25 | COMP-GAPS | competitors.gaps | "Market gaps" heading over empty body |
| 26 | COMP-POS | competitors.positioningRead | empty positioning box |
| 27 | ACC-EMPTY | accounts | §04 renders a fully empty section card (first_customers empty via tier RPC — silent section failure) |
| 28–43 | DESC-JUNK / DESC-LONG | providers.all ×8 | raw scraped markdown as card copy (Fullstack, Stone & Chalk, ADAPT, oSpace, NEXTGEN, TechVisa "# 403 Forbidden", Accenture "Page not found", Rippling), up to 1500 chars/card |
| 44–46 | WHY-JUNK | providers.ourRead ×3 | ranked-read "why" built from the same scraped junk |
| 47 | LEAK-INTERNAL | investors | 4× "N/A (individual entry/advisory firm)" tags; "(ID 22)"; "This entry represents an individual…" |
| 48 | KQ-THIN | exec key-question box | box contains only "Key highlights from your matches: …" (answer prose stranded in narrative with raw markdown) |

Adapter mismatch log (27 entries) recorded the RC2 gaps correctly at adapt time — the
telemetry worked; nothing acted on it.

## Improvement plan

### Phase 1 — adapter + renderer hardening — ✅ DONE (2026-07-19)

Shipped from this branch. **48 content defects → 0** (`dev-fixtures/audit.ts` regression
scanner; the 7 residual entries are reclassified as Phase-B structural gaps the renderer
degrades gracefully, not defects). Verified: `tsc`, 827 tests (incl. new SWOT/junk/metric/
exec adapter cases), build, lint clean; all three fixtures + the real HubSpot report render
0 mobile overflow / 0 console errors; §04 suppresses to 14 sections on the real report.
Visual before/after confirmed for providers (clean curated copy, no "403 Forbidden"), exec
(no repeated thesis / `---` / raw links), metrics (no `[n]`/slug captions), competitor
(2-col degrade), and **SWOT (blank → fully populated 4-quadrant)**. Implemented items:
1. **Never use `enriched_description`.** Card copy = curated `description`, markdown-stripped,
   ~260-char cap on sentence boundary; drop obvious error-page text (403/404/"Page not found").
   Same source for `ourRead[].why` (falls back to match_reasons phrasing). Fixes #28–46.
2. **Markdown scrub in `toParagraphs`:** strip `---` rules and heading-only lines
   ("Executive Summary"), unwrap external `[label](url)` links to plain label, convert
   `> quote` lines to styled text. **Extract the "Your Key Question — Answered" subsection**
   out of the narrative into `exec.keyQuestionAnswer`. Fixes #3–7, #48.
3. **De-duplicate cover:** drop narrative ¶1 when it is the cover scope; keep headline short.
   Fixes #1–2.
4. **Metric caption cleanup:** strip `[n]` (fold into the chip via citation index),
   de-slug the leading token phrase, drop near-duplicate tiles (same stat, different
   currency). Fixes #8–19.
5. **SWOT prose parser:** pipeline SWOT prose is heading-structured — parse
   **Strengths/Weaknesses/Opportunities/Threats** blocks into quadrant items. Fixes #20.
6. **Competitor degrade layout:** when strengths/differs are empty for every row, render a
   2-column table (player + position) and omit the you-row verdict cell, empty gaps heading
   and positioning box (R5: no empty containers). Fixes #21–26.
7. **Empty-state suppression across the renderer:** a section whose contract slice is
   entirely empty renders NOTHING (no bare card) — §04 accounts, compliance sub-blocks,
   close "arrive with" rail, SWOT quad. Fixes #27 + the blank-page feel.
8. **Internal-notation filter:** suppress "N/A (…)"-style tags (render no tag), strip
   "(ID nn)" and "This entry represents…" sentences from descriptions. Fixes #47 at the
   render boundary (root fix is Phase 3).

### Phase 2 — adapter extraction upgrades — ✅ DONE (2026-07-19)
- **`parseActionPlan`**: `action_plan` prose → structured phases with grouped sub-blocks
  (`### Phase N — Title (Months X–Y)` + `**Sub-block**` + bullets). The HubSpot report now
  renders 3 phase columns (Foundation / Establish / Launch) with 4/4/3 groups, chips, and
  case-study links — was a single flat blob. Falls back to one flat phase when no headings.
- **`parseComplianceChecklist`**: `setup_compliance` prose → lead intro + an 11-item
  Readiness checklist (`**Lead:** text`, grammar preserved). Contract `checklist.text`
  tightened `string`→`Paragraph`; `ComplianceSection` renders it via `Rich` so bold figures
  ($75,000, 11.5%) show. Exposure table/stats stay Phase-B (renderer suppresses).
- **`close.arriveWith`** derived from the action-plan group titles (grounded decision
  areas); `CloseSection` suppresses the rail/body when absent.
- heroStat: left omitted — `ExecSummarySection` already suppresses it; a non-duplicating
  source is a Phase-B pipeline field (not worth a fragile derivation).
- **Deferred to Phase 3:** surfacing adapter mismatch telemetry to `report_quality` needs a
  client→DB write path (RLS/grants) — belongs with the pipeline work, not a renderer PR.

### Phase 3 — pipeline & data quality (Phase B proper, per-ticket)
- `report_templates`/generate-report: emit contract-structured JSON for SWOT, compliance,
  action plan, competitor verdict columns (you-row, strengths, differs, gaps, positioning),
  first-customer briefs, key-question answer, clean metric captions. This removes the prose
  parsers over time.
- **Tier-RPC over-stripping (found during Phase 1):** `first_customers` in the raw
  `user_reports` row is `visible:true, required_tier:null, 2788 chars`, yet both
  `get_shared_report` and (per the owner's blank §04) `get_tier_gated_report` return it
  stripped/empty for the report's own scale owner. A no-tier-requirement, visible section
  is being removed from an entitled viewer — investigate the RPCs' `v_tier_requirements`
  hardcode for the accounts/first_customers key. This is why §04 was empty; the renderer
  now suppresses it, but the content should reach the viewer.
- Fix the silent `visible:false` section failure for `first_customers` (why it failed on a
  clean scale run) and surface per-section failures in the report UI.
- Enrichment: detect and refuse error-page scrapes (403/404/robots interstitials);
  re-enrich affected providers. Directory steward: replace "N/A (…)" investor stage tags
  with proper values; move curation notes out of customer-facing description fields.
- Cover: pipeline-supplied headline/scope/kicker instead of derivation from exec ¶1.

**Ordering rationale:** Phase 1 turns this exact report from embarrassing to presentable
without touching the pipeline (same data, honest rendering). Phase 2 mines more of the
existing prose. Phase 3 fixes generation so the adapter's derivations become pass-throughs.

**Regression harness:** `dev-fixtures/real-report.json` + `dev-fixtures/audit.ts` — the
defect scan must report 0 for every Phase-1 class before that phase ships. The three
hand-authored fixtures remain the layout/degradation baseline.
