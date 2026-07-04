## Remove the "Start My Report" floating CTA pill from the home page

### What we are removing
The `FloatingCTAButton` component — the fixed bottom-right pill that reads "Start My Report" / "Report" and follows the user as they scroll the homepage.

### Where it lives
- Rendered in `src/pages/Index.tsx` (line 92)
- Component source in `src/components/FloatingCTAButton.tsx`
- Label text configured in `src/config/personaContent.ts` under `floatingCTA`

### What needs to be removed (minimal change)
1. Delete the `<FloatingCTAButton />` JSX line from `src/pages/Index.tsx`.
2. Remove the unused import of `FloatingCTAButton` from `src/pages/Index.tsx`.

### What we should also clean up (optional but tidy)
3. Delete `src/components/FloatingCTAButton.tsx` — it is only consumed by `Index.tsx` and has no other callers.
4. Remove the `floatingCTA` block from `PERSONA_CONTENT` in `src/config/personaContent.ts` (lines 482-486 and 1084 equivalent) so the config does not reference dead UI.

### Things to consider before removing
- **Conversion impact**: This is a persistent scroll-following prompt. Once removed, the only homepage paths to `/report-creator` are the hero CTA, the How It Works section links, and the bottom `CTASection`. The global nav also links to "Report Creator", so the action is never more than one click away.
- **Mobile experience**: On mobile the pill is the only always-visible CTA after the hero scrolls off-screen. Removing it means users must reach the bottom CTA or open the nav.
- **No side effects on other pages**: `FloatingCTAButton` is not imported anywhere except `Index.tsx`, so removal is homepage-only.
- **No build risk**: The component is self-contained (no shared hooks, no CSS modules, no global event listeners beyond its own `window` scroll handler). Removing it is safe.

### Scope
This is a two-file change (`Index.tsx` + optionally `FloatingCTAButton.tsx` and `personaContent.ts`). No database, no routing, no analytics, no dependencies.