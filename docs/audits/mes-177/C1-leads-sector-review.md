# MES-177 Phase C1 — Leads sector axis (AUDIT + RECOMMENDATION — awaiting decision)

**Status:** read-only audit + propose→review. No DB writes, no schema change, no frontend change
yet. Proposal CSV: `docs/audits/mes-177/C1-leads-sector-crosswalk-proposal.csv`.

## Audit (live, prod `xhziwveaiuhzdoutpgrh`, 2026-07-14)
- **65 lead databases.** Filter bar already contract-compliant: **tabs = `list_type` (3 values)**,
  **sector = free-text searchable select**, location select. So the bar anatomy is already right —
  the gap is the *vocabulary*, not the layout.
- **`sector` is free-text (26 distinct values); there is NO `sector_tags` column.** Leads is the
  **only directory still off the canonical MES-110 vocabulary** (providers/mentors/events/investors/
  innovation/content/case-studies are all on canonical `sector_tags`).
- **23 of 65 DBs (35%) are "Sector Agnostic"**; the other 42 spread across ~14 industries, heavily
  long-tailed (Technology 11, Financial-cluster 8, then mostly 1-count sectors).

## The ticket's C1 question — resolved by the data
> "after (if) lead sector vocabulary is consolidated to ≤8 groups, revisit pills=sector / dropdown=type."

The 26 free-text values crosswalk to **17 distinct canonical slugs** (+ 2 untagged). **17 » 8 and
long-tailed**, so **pills=sector stays REJECTED** — moving sector to tabs would recreate exactly the
1-count pill sprawl A3 removed from Events. **`list_type` (3 values) stays the tabs axis; sector
stays a searchable select.** The bar layout does not change.

## Recommendation — do the canonical consolidation (the real C1 value), not the pills swap
Bring leads onto the shared vocabulary (the one remaining gap), B3-shaped:
1. **Add `sector_tags text[]` to `lead_databases`** (additive, nullable — schema change).
2. **Backfill from the reviewed crosswalk** (`C1-leads-sector-crosswalk-proposal.csv`): 26 free-text →
   17 canonical slugs; "Sector Agnostic" (23) + "Non-Profit" (1) stay **untagged** (surface under
   "All Sectors", never a facet value). Guarded, id-keyed, fill-only-empty migration (B3 pattern).
3. **Frontend:** switch the leads sector select to canonical `sector_tags` (`sectorLabel` friendly
   labels + `curateValues` + `allowedValues` coercion), identical to the B3 case-study switch. Keep
   free-text `sector` searchable. Drop `getStandardTypes`-style raw-sector display for the friendly map.

Benefits: friendly labels + cross-directory consistency (last directory joins the vocabulary) + a
canonical `sector_tags` leads carry that the report matcher / KB can use later. Cardinality is
unchanged for the layout (still a select), so no UX regression.

## Judgement calls flagged in the CSV (please eyeball)
- **Defence & Space (1)** → `manufacturing` (alt: `government-administration` if it's a defence-agency
  buyer list).
- **Pharmaceuticals (1)** → `hospitals-and-health-care` (alt: `manufacturing` — LinkedIn files pharma
  manufacturing under Manufacturing).
- **Non-Profit (1)** → **untagged** (no clean canonical home; alt: `administrative-and-support-services`).

## Approval gate
This needs sign-off before any code — it's a **schema change + bulk data write + frontend change**
(approval-gated per CLAUDE.md §11). Nothing has been written.

## Decision
- [ ] Confirm: keep `list_type` as tabs, sector as a select — reject pills=sector (17 sectors, long tail)
- [ ] Approve the 26→canonical crosswalk (or amend the 3 flagged rows)
- [ ] Green-light the B3-shaped implementation (add `sector_tags` col + guarded backfill + select switch)
- [ ] (or) Spin C1 out as its own ticket rather than extending MES-177
