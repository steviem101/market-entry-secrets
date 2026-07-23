# E0 — Enrichment coverage + KPI baseline (MES-223)

> Read-only audit, 2026-07-23, live prod (`xhziwveaiuhzdoutpgrh`). Epic:
> [`mes-agent-loops-phase3-epic.md`](mes-agent-loops-phase3-epic.md). This file is the
> before-picture every later KPI claim (E7) is measured against. Re-run queries verbatim to
> refresh; do not edit numbers in place.

## 1. Field coverage (% of rows populated), org directory tables

| Table | Rows | website | description | services/focus[] | sector_tags[] | logo |
|---|---|---|---|---|---|---|
| service_providers | 113 | 100 | 100 | 100 | **32.7** | 77.0 |
| investors | 499 | **60.5** | 100 | 87.4 | 90.4 | **11.6** |
| innovation_ecosystem | 217 | 99.5 | 100 | 77.9 | **57.6** | **36.9** |
| trade_investment_agencies | 149 | 99.3 | 100 | **51.0** | **34.9** | **1.3** |
| events | 406 | **68.7** | 100 | 48.8 (tags) | 80.0 | n/a |

(`case_studies` uses a different shape — no std website/services columns; excluded from wave 1.)

## 2. Report-pipeline KPI baseline (last 30 days, n=307 reports)

| KPI | Baseline |
|---|---|
| Avg directory matches per report | **37.2** |
| Avg tables hit per report (of ~10) | 8.0 |
| Avg score_coverage | 87.6 |
| **% reports degraded** | **19.5%** |
| Avg RAG hit rate | 0.96 |

Avg matches per report by table (ascending = weakest first): lemlist_contacts 0.0 · leads 1.3 ·
innovation_ecosystem 3.4 · trade_investment_agencies 3.7 · events 3.7 · community_members 3.8 ·
content_items 4.1 · case_studies 5.1 (96 reports) · investors 6.6 · service_providers 8.8.

## 3. Demand signal status

`directory_demand_signals` is **empty** — demand-mining is flag-gated off and has never run in
production. Consequence for the epic: E6's "demand drives priorities" must either (a) enable the
demand-mining loop first, or (b) aggregate `user_intake_forms` sectors/regions directly as the
demand proxy. **For wave 1 the match-count table above IS the demand evidence** — it comes from
307 real paid/free report generations, which is a truer demand signal than any proxy.

## 4. Ranked enrichment targets (wave 1)

Priority = low match contribution × low field coverage × feasibility (facts-only):

1. **trade_investment_agencies — sector_tags (34.9%) + services (51%)**: worst tag coverage of
   any org table AND only 3.7 matches/report. Array enrichment directly feeds the `.cs.{}`
   matcher. Facts-tier, canonical-taxonomy-validated.
2. **innovation_ecosystem — sector_tags (57.6%) + services (77.9%)**: same logic, 3.4
   matches/report.
3. **service_providers — sector_tags (32.7%)**: services already 100% (explains its top match
   rate 8.8); tags are the residual gap for sector-filtered matching. Cheapest win per row.
4. **investors — website (60.5%)**: 197 investor rows have no website — hurts verification,
   dead-end cards, and steward can't health-check them. Facts-tier.
5. **Logos everywhere — agencies 1.3%, investors 11.6%, ecosystem 36.9%**: pure presentation
   trust; `set_logo_url` is ALREADY a whitelisted auto-approvable action type via logo.dev
   URL construction (`logoUtils` pattern) — likely the fastest visible win in the whole epic.
6. **events — website_url (68.7%)**: perishable; coordinate with content-freshness loop rather
   than a separate enrichment wave.

## 5. E7 success criteria (agreed targets to beat)

- Avg matches per report: 37.2 → **≥45** after two E5 cycles on targets 1–3.
- % degraded reports: 19.5% → **≤12%**.
- agencies/ecosystem per-report match averages: 3.7 / 3.4 → **≥5 each**.
- sector_tags coverage: providers 32.7 / agencies 34.9 / ecosystem 57.6 → **≥85% each**.

If two E5 cycles move none of these, HALT per epic §3 and re-aim.
