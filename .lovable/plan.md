## Add sidebar sections to the Market Entry Strategy guide

### Problem
The sidebar on `/content/how-to-choose-market-entry-strategy-australia` shows only a single **Overview** entry. That's because the article is stored as one `content_sections` row ("Overview") with one `content_bodies` row containing the whole HTML — the sidebar renders one link per section. The prose already has H2 headings, but they don't create sidebar entries; only `content_sections` rows do.

### Change
Split the existing single-section article into 8 sidebar sections (one per H2), each with its own `content_bodies` row. No component or schema changes — just a data migration.

Sections, in order:

1. `overview` — Overview *(intro + "The five modes at a glance" comparison table)*
2. `exporting-and-distribution` — Exporting and distribution
3. `licensing-and-franchising` — Licensing and franchising
4. `remote-digital-sales` — Remote digital sales
5. `local-subsidiary` — Local subsidiary (Pty Ltd)
6. `joint-venture-or-acquisition` — Joint venture or acquisition
7. `starbucks-cautionary-tale` — The cautionary tale: what Starbucks got wrong
8. `decision-framework` — The decision framework *(includes "The most common sequence", CTA, and the general-advice disclaimer)*

### Execution (one `supabase--insert` call)
- Look up the guide's `content_items.id` by slug and its existing Overview `content_sections` row.
- Update the existing Overview section (keep same `id` so any inbound links survive) to hold section 1's body only; leave its slug as `overview` and set `sort_order = 0`.
- `INSERT` 7 new `content_sections` rows (sort_order 1..7, slugs above) plus one `content_bodies` row per new section carrying the HTML for that H2 block. Strip the `<h2>` from each body (the section title renders it already) and keep the H3/lists/tables/paragraphs beneath.
- Bump `content_items.updated_at` and `last_verified_at`.

### Verification
- Query `content_sections` for the guide to confirm 8 rows in the expected order, each with exactly one `content_bodies` row.
- Reload the page and check the sidebar shows 8 entries, each scrolls to its section, and no content is dropped vs. the current single-page body.

### Out of scope
- No component, styling, or route changes.
- No edits to the other 9 seeded guides.

### Files touched
- Database only (via `supabase--insert`). No source files.
