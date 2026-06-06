## Problem

`src/components/content/ContentCard.tsx` renders the tile image from `content.thumbnail_url`. The `content_items` table populates `hero_image_url` / `hero_image_alt` instead, so the check fails and the book-icon placeholder shows for every guide. Both Featured and All Guides grids use this same component, so a single fix covers both.

The Supabase queries in `src/hooks/useContent.ts` and `src/hooks/useSectorContent.ts` already use `select('*')`, so `hero_image_url` and `hero_image_alt` are already returned — no query change needed. The generated Supabase types already include both columns, so no type changes needed either.

## Change

In `src/components/content/ContentCard.tsx`:

1. Replace the `content.thumbnail_url` check with `content.hero_image_url` (fall back to `thumbnail_url` for any legacy rows that might still use it).
2. Use `alt={content.hero_image_alt || content.title}` so we get real alt text when present.
3. Add `decoding="async"` alongside the existing `loading="lazy"`.
4. Leave the gradient + book-icon fallback, the aspect/height classes (`h-48` / `h-40`), rounded corners, Featured badge, and attachment badge overlays exactly as they are — the `<img>` sits in the same absolutely-bounded container as before, so overlays remain on top.

No other files need to change. Featured cards (`FeaturedContent`) and the All Guides grid (`ContentGrid`) both render through `ContentCard`, so they both pick up the fix automatically.
