## Plan: Close remaining SEO findings

Three actions, in order.

### 1. Mark `http:sitemap` fixed
Confirmed against `scripts/generate-sitemap.ts` — the flagged routes (`/dashboard`, `/bookmarks`, `/member-hub`, `/mentor-connections`) are auth-gated user areas that shouldn't be indexed, and `/planner` doesn't exist. Call `seo_chat--update_findings` with a one-line explanation. No code change.

### 2. Draft the market-entry-services guide
Create a long-form guide at `/content/market-entry-services-australia-guide` targeting the keyword cluster Semrush suggested.

- Run `semrush--keyword_research` on "market entry services australia" first to ground the H2s / FAQs in real search intent (volume, related terms, question variants).
- Insert as a `content_items` row via `supabase--migration` (or a one-off insert) with:
  - `slug`: `market-entry-services-australia-guide`
  - `content_type`: `guide`
  - `status`: `published`, `featured`: true
  - `category_id`: linked to the "Market Entry" content category
  - `sector_tags`: broad (cross-sector)
- Add `content_sections` + `content_bodies` rows for each H2. Target ~1800 words, structured as:
  1. What "market entry services" actually covers (advisory, legal, tax, recruitment, GTM, distribution)
  2. When to hire an advisor vs DIY
  3. How to choose a provider (checklist)
  4. Typical cost ranges in AUD
  5. AU-specific regulatory touchpoints (ASIC, ATO, Fair Work, ABN/TFN)
  6. Sector-specific notes (fintech, SaaS, healthtech, industrial)
  7. Case-study callouts linking to existing `/case-studies/*` pages
  8. FAQs (answering the People-Also-Ask variants from Semrush)
- All copy in AU English. Internal links to `/service-providers`, `/mentors`, `/report-creator`, `/pricing`.
- Draft the body with the ai-gateway script (`google/gemini-3-flash-preview`) to keep the token spend modest, then hand-edit the intro + FAQs for voice.

### 3. Publish + rescan Lighthouse
Once the guide is live:
- `security--get_scan_results` (fix guard shipped in the last turn — should be clean).
- `preview_ui--publish`.
- Tell you to click **Rescan** in the SEO tab so Lighthouse re-measures against the new build. If perf/a11y still fail, next pass digs into hero LCP (`HeroSection` image + `HeroStatsRow` count-up cost) and low-contrast tokens in `index.css`.

### Notes
- No schema changes — `content_items` / `content_sections` / `content_bodies` already exist.
- No new routes — `/content/:slug` renders it automatically via `ContentDetail`.
- Guide is ~1800 words at Gemini Flash → cheap.
