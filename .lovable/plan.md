## Update `/content/how-to-choose-market-entry-strategy-australia` with the expanded guide

### Where the content lives
The article is a single row in `content_items` (slug `how-to-choose-market-entry-strategy-australia`) with one `content_sections` row ("Overview") and one `content_bodies` row containing HTML in `body_text`. The renderer (`ContentBodyRenderer`) sanitises and parses HTML, so the update is a straight `body_text` replacement — no schema or component changes.

### What changes
1. **New migration** `supabase/migrations/<ts>_update_choose_market_entry_strategy_guide.sql` that:
   - Updates `content_bodies.body_text` for the existing row (targeted by `section_id` of the article's Overview section, matched via slug — idempotent, no hardcoded UUIDs).
   - Refreshes `content_items.meta_description` (~155 chars) and bumps `updated_at` / `last_verified_at` to now.
   - Optionally sets `read_time` to a realistic figure (~12 min) given the new length.
2. **Body conversion** — convert the user-supplied prose into semantic HTML:
   - `<h2>` for each numbered section ("Exporting and distribution", "Licensing and franchising", "Remote digital sales", "Local subsidiary (Pty Ltd)", "Joint venture or acquisition", "The cautionary tale…", "The decision framework", "The most common sequence").
   - `<h3>` for the sub-headings ("The margin reality", "What to negotiate…", "Real example: Wendy's…", "Subsidiary vs branch", etc.).
   - Real `<table>` markup for the two comparison tables ("The five modes at a glance", "What it actually costs in 2026", the regulated-sector matrix) instead of the raw text grid.
   - `<ul>` / `<ol>` for the checklists (negotiation points, remote-sales caveats, the two Pty Ltd constraints, the three decision-framework questions, the tiebreakers, the staged sequence).
   - Closing disclaimer wrapped in `<p><em>…</em></p>`.
   - Final CTA paragraph links to `/report-creator` ("Generate a tailored market entry report").
3. **No frontend/component edits.** The existing content detail page already renders HTML tables, headings and lists via `prose` styling. If tables look cramped, we can add a small `.prose table` polish in a follow-up — not in scope here.

### Verification
- Run `supabase migration up` locally (or rely on the merge-to-main auto-apply per repo rules).
- Query the row post-migration to confirm `body_text` length ≈ 10–12k chars and starts with the new intro.
- Load `/content/how-to-choose-market-entry-strategy-australia` in preview: check H2/H3 hierarchy, both tables render, list items render, CTA link works, no console/DOMPurify warnings.
- `npx tsc -p tsconfig.app.json --noEmit` (no code changed, but sanity check).

### Out of scope
- Editorial rewrites of the other 9 seeded guides.
- New images/hero art.
- Table styling tweaks (only if the plain `prose` rendering looks broken after preview).

### Files touched
- `supabase/migrations/<new-timestamp>_update_choose_market_entry_strategy_guide.sql` (new)
