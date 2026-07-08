-- MES-100 spin-off: add a Type axis to innovation_ecosystem so it can adopt the
-- standard DirectoryFilterBar Type tabs (it was the one directory with no
-- type/category column — see docs/handoffs/innovation-ecosystem-type-taxonomy.md).
--
-- Design decisions (operator-confirmed):
--   * MULTI-VALUE `type text[]` — ~65 orgs play more than one role (e.g. Bay City
--     Labs = Incubator + Accelerator + Co-working), so a row can carry several types
--     and surface under every matching tab (array-overlap filter, mirrors the
--     data-driven tab pattern shipped for Leads).
--   * FIVE types — the 4 defined in getStandardTypes.innovationEcosystem
--     (Incubator/Accelerator/Coworking Space/Research Institute) plus "Industry Body"
--     for the ~45 peak-body/association/member-network orgs that fit none of the 4
--     (a quarter of the directory would otherwise be untyped).
--
-- Classification is DETERMINISTIC from existing columns (no LLM, no manual pass):
--   * Accelerator      <- services ∋ Accelerator | Pre-accelerator
--   * Incubator        <- services ∋ Incubator
--   * Coworking Space  <- services ∋ Co-working
--   * Research Institute <- NAME signal only (institute/university/laboratory/CSIRO/
--     CRC/research centre). Deliberately NOT the "Research" *service* — dozens of
--     associations list Research as a service without being an institute. Also NOT a
--     bare "Lab(s)" token: that is common startup-hub branding (Tank Stream Labs,
--     River City Labs, …) and mislabelled 7 hubs as research institutes.
--   * Industry Body    <- services ∋ Policy Advocacy | Industry Association |
--     Member Network, OR name ∋ association/council/alliance/federation/chamber.
-- Rows matching no rule keep type = NULL (9 fuzzy edge cases: VC firms, a venture
-- studio, under-tagged accelerators — left for admin editing, they show under "All").
--
-- Additive + idempotent: nullable column; the backfill only writes rows still at
-- NULL, so re-runs and later manual edits are preserved. No RLS change (public-read
-- directory; the new column inherits the table's existing policies).
-- Reversal: drop the column.

alter table public.innovation_ecosystem
  add column if not exists type text[];

update public.innovation_ecosystem t
set type = nullif(
  array_remove(array[
    case when t.services && array['Accelerator','Pre-accelerator']::text[] then 'Accelerator' end,
    case when t.services && array['Incubator']::text[]                     then 'Incubator' end,
    case when t.services && array['Co-working']::text[]                    then 'Coworking Space' end,
    case when t.name ~* 'institute|universit|laborator|research (centre|center)|csiro|\ycrc\y'
                                                                            then 'Research Institute' end,
    case when t.services && array['Policy Advocacy','Industry Association','Member Network']::text[]
              or t.name ~* '\yassociation\y|\ycouncil\y|\yalliance\y|\yfederation\y|\ychamber\y'
                                                                            then 'Industry Body' end
  ]::text[], null),
  '{}'::text[]
)
where t.type is null;
