## Goal

When a guide body contains a YouTube link (watch URL, youtu.be short URL, shorts, or already-embedded iframe), render it as an inline responsive video player instead of a plain text link. Plain text links open in a new tab (existing behaviour) as a fallback.

## Where

Single file: `src/components/detail/ContentBodyRenderer.tsx`. This is the only component that renders `body_text` HTML for guides/case studies, so changes here cover both the Resources `/content/:slug` pages and case-study pages.

## How

1. **Detect YouTube URLs** with a helper `extractYouTubeId(url)` that recognises:
   - `youtube.com/watch?v=ID`
   - `youtu.be/ID`
   - `youtube.com/embed/ID`
   - `youtube.com/shorts/ID`
   Returns the 11-char video ID or null.

2. **Replace at sanitise time** using a second DOMPurify `afterSanitizeAttributes` hook:
   - For `<A>` tags whose `href` is a YouTube URL **and** whose visible text is the same URL (i.e. a bare auto-linked URL, not a meaningful anchor inside a sentence), replace the anchor with a placeholder token like `<div data-youtube-id="ID"></div>`. This avoids hijacking links that are part of prose ("watch our [intro video](youtube link)").
   - For existing `<IFRAME>` tags pointing at YouTube, allow them through DOMPurify (`ADD_TAGS: ['iframe']`, `ADD_ATTR: ['allow','allowfullscreen','frameborder']`) and normalise to the privacy-enhanced `youtube-nocookie.com/embed/ID` host.

3. **Render placeholders as React components**. Since the non-enhanced path uses `dangerouslySetInnerHTML`, switch that branch to use the existing `html-react-parser` (already a dep, used by `applyEnhancements`) so we can swap `<div data-youtube-id>` for a `<YouTubeEmbed videoId="ID" />` component. Same swap added to the enhanced path's parser options inside `src/lib/case-study/applyEnhancements.tsx`.

4. **`YouTubeEmbed` component** (new, `src/components/detail/YouTubeEmbed.tsx`):
   - Responsive 16:9 wrapper using design-system tokens (`bg-muted`, `rounded-lg`, `overflow-hidden`, `aspect-video`, `my-6`).
   - `<iframe src="https://www.youtube-nocookie.com/embed/{id}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" title="YouTube video player" />`.
   - No autoplay; lazy-loaded so multiple embeds don't tank page perf.

5. **Fallback unchanged**: non-YouTube links keep the existing `target="_blank" rel="noopener noreferrer"` behaviour from the current hook.

## Files

- Edit: `src/components/detail/ContentBodyRenderer.tsx` — register iframe allowance + YouTube detection hook, swap inner-HTML render to parser-based render.
- Edit: `src/lib/case-study/applyEnhancements.tsx` — extend `parserOptions.replace` to swap `div[data-youtube-id]` for `<YouTubeEmbed/>`.
- Add: `src/components/detail/YouTubeEmbed.tsx`.

## Out of scope

- Vimeo, Loom, Wistia (can be added with the same pattern later).
- Click-to-load privacy poster (current approach uses youtube-nocookie which is already cookieless until play).
- Editor UI changes — purely a rendering enhancement on existing `body_text`.
