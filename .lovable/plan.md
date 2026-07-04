Three items, three different actions:

## 1. `http:sitemap` — mark fixed (no code change)

The flagged routes are gated user areas that should stay out of the sitemap:
- `/dashboard`, `/member-hub`, `/bookmarks`, `/mentor-connections` — require auth
- `/planner` — doesn't exist in the router

Mark the finding fixed via `seo_chat--update_findings` with an explanation stating these are auth-gated (or non-existent) routes and are intentionally excluded from `public/sitemap.xml`. The scanner surfaces them because they appear in in-app nav; the current sitemap policy is correct.

## 2. `agent_content:semrush_content_suggestions` — skip for now

This is a long-form content-writing task (~1,500–2,500 word market entry services guide at `/content/market-entry-services-australia-guide`). It's better handled either:
- via the app's own report/content pipeline, or
- in a dedicated follow-up turn where you brief the outline / target keywords.

Not doing this now. If you want me to draft it, say the word and I'll come back with a content plan first (outline, target keywords, internal links).

## 3. `lighthouse:*` — Publish, then rescan

Both Lighthouse findings score the last published build, not the current source. Recent changes (shorter titles/descriptions, alt text tweaks, aria-hidden on decorative icons) landed after the last publish.

Steps:
1. Publish the current source.
2. In the SEO & AI search tab, click **Rescan** after publish completes (~1 min).
3. If either Lighthouse finding still fails after the rescan, follow up:
   - **Performance**: identify hero LCP element, defer/lazy-load below-the-fold images, check third-party script blocking.
   - **Accessibility**: audit color contrast tokens in `index.css`, fix any low-contrast pairs.

## What I'll do this turn (after approval)

- Mark `http:sitemap` fixed with the auth-gated explanation.
- Publish the current source so `lighthouse:*` can be re-measured.
- Leave `agent_content:semrush_content_suggestions` alone.