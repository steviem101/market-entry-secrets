## Goal

Publish the top 10 market entry questions as an SEO-optimised **hub page + 10 medium-length articles**, all framed for entering the Australian / ANZ market. Reuse the existing `content_items` pipeline so each article ships with FAQ/Article schema, sits inside `/content/:slug`, and is discoverable via the existing directory search.

## Deliverables

### 1. Ten articles seeded into `content_items` (via migration)

One row per question, `content_type = 'guide'`, `status = 'published'`, `featured = false`. Slugs are stable and SEO-targeted:

| # | Slug | Title (H1) |
|---|------|------------|
| 1 | `how-to-choose-market-entry-strategy-australia` | How to choose the right market entry strategy for Australia |
| 2 | `how-to-choose-target-market-australia-nz` | How to decide whether Australia or New Zealand is your first ANZ market |
| 3 | `australia-market-entry-regulatory-compliance` | Regulatory and compliance requirements for entering Australia |
| 4 | `competitor-analysis-australian-market` | How to map competitors and differentiate in the Australian market |
| 5 | `cost-of-entering-australian-market` | What it really costs to enter the Australian market |
| 6 | `distributor-vs-direct-entry-australia` | Distributor, partner, or direct: choosing your ANZ go-to-market model |
| 7 | `how-long-market-entry-australia-takes` | How long market entry into Australia takes and when you'll see returns |
| 8 | `australia-market-entry-risks-mitigation` | The biggest risks of entering the Australian market and how to mitigate them |
| 9 | `control-vs-flexibility-market-entry-anz` | Balancing control and flexibility when entering ANZ |
| 10 | `localising-product-pricing-marketing-australia` | Localising your product, pricing and marketing for Australian buyers |

Each article body (Markdown, 200–300 words) will follow the same template:
- Intro paragraph (the question and why it matters in AU/ANZ)
- 3–4 short H2 sub-sections with AU-specific detail (ASIC, ACCC, FIRB, ATO, Fair Work, Austrade, AUD/NZD costs, distributor examples, timeframes, etc.)
- Closing CTA line linking to `/report-creator`

Each row will include `meta_title`, `meta_description`, `sector_tags` where relevant (e.g. general/cross-sector), and `read_time_minutes` ≈ 3.

### 2. New hub page `/market-entry-questions`

Component: `src/pages/MarketEntryQuestions.tsx`, added to `src/App.tsx` route table.

Structure:
- `<Layout>` wrapper (Navigation + Footer)
- `<Helmet>` sets title, description, canonical, og:title/og:url, and **FAQPage JSON-LD** listing all 10 questions with their short-answer intro paragraph (schema.org allows one FAQPage plus per-article Article schema on the child pages).
- Hero: H1 "The 10 questions every company asks before entering Australia", short subhead, primary CTA to `/report-creator`.
- Question list: 10 cards (question → 2-sentence teaser → "Read full guide" link to `/content/{slug}`).
- Secondary CTA block linking to `/service-providers`, `/mentors`, and `/report-creator`.

### 3. Discoverability

- Add a nav/footer link (Footer "Resources" column) to `/market-entry-questions`.
- Add the hub URL and 10 article URLs to `public/sitemap.xml`.
- Link the hub from the existing `/faq` page ("Looking for detailed answers? See our full market entry guides →").

### 4. SEO details

- Canonical + og:url self-referencing on every new page (via Helmet).
- Article pages already emit Article JSON-LD via `ContentDetail` — verify slugs resolve; no code change expected there.
- All copy in Australian English (organisation, localise, prioritise, etc.).

## Technical notes

- Article seeding uses `supabase--migration` with an `INSERT ... ON CONFLICT (slug) DO NOTHING` block so re-runs are safe.
- No schema changes — `content_items` already has every column needed (title, slug, content_type, meta_title, meta_description, status, featured, sector_tags, read_time_minutes) plus the section/body child rows are optional for guide-type content that renders from a single body field. If a body column isn't present on `content_items` itself, the migration will also insert a matching `content_sections` + `content_bodies` pair per article, mirroring the pattern used by the enrichment pipeline.
- No new dependencies. Uses existing shadcn `Card`, `Button`, `Accordion` primitives, and `react-helmet-async`.
- No changes to auth, RLS, or edge functions.

## Out of scope

- Rewriting the existing `/faq` page.
- Generating og:images for the new pages.
- Translating to other languages.

After you approve, I'll write the article copy, seed the rows via one migration, build the hub page + route, wire the sitemap and footer link, and mark relevant SEO findings fixed.