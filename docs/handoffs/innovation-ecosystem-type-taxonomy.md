# MES-100 spin-off: `innovation_ecosystem` type taxonomy + Type tabs

> Handoff spec spun out of MES-93/MES-100 (directory filter standardization).
> Parked because it needs a product/eng decision on classification before code.
> **Not** bundled with the audience/persona-field gap — that's tracked separately
> (Directories & UX), since it isn't sector-taxonomy work.

## Context

The standard `DirectoryFilterBar` supports data-driven Type tabs — see the shipped
Leads implementation in `src/pages/Leads.tsx` (curated order first, then any novel
`list_type` value appended, so a new value surfaces instead of being silently
dropped). Innovation Ecosystem is the one directory that can't adopt them: its
table has **no type/category column** (verified via SQL, 2026-07).

## Target taxonomy (already defined, not yet backing any data)

`src/utils/sectorMapping.ts` → `getStandardTypes.innovationEcosystem`:

```
['Incubator', 'Accelerator', 'Coworking Space', 'Research Institute']
```

## Work

1. **Schema** — add a `type` (or `org_type`) `text` column to
   `public.innovation_ecosystem`. The migration must be:
   - additive, `add column if not exists`, timestamped **after** the
     `20260704095538_remote_baseline` baseline;
   - named `<timestamp>_snake_name.sql`, committed via PR (auto-applies on merge);
   - **no RLS change** (public-read directory).
2. **Classification / backfill** — product + eng decision on how to populate:
   - (a) admin/manual tagging, (b) derive from `services[]` / name heuristics as an
     interim, or (c) a one-off LLM classification pass.
   - Values should map onto the taxonomy above; unknowns can stay `null`.
3. **Filter wiring** — once the column exists, in `src/pages/InnovationEcosystem.tsx`:
   - add a `type` field to the page's `FilterSpec`;
   - pass `tabs={{ key: 'type', options: typeTabs }}` to `DirectoryFilterBar`,
     deriving `typeTabs` data-driven from live values (mirror `Leads.tsx`);
   - add `type` support to the innovation-ecosystem filter lib.
4. **Types** — after merge, regenerate `src/integrations/supabase/types.ts`
   (never hand-edit) so the new column is typed.

## Out of scope for this PR

Audience/persona fields on more tables (`investors`, `trade_investment_agencies`,
`lead_databases`, `content_items`) — tracked separately under Directories & UX,
not taxonomy.

## References

- MES-93 directory filter audit: `docs/audits/directory-filter-ui-audit.md`
- Shipped data-driven Type-tab pattern: `src/pages/Leads.tsx`
- Parent ticket: MES-100
