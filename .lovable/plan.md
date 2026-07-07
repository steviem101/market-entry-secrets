Plan: Restore the rotating-database ticker headline

Bring back the original ticker-style hero headline so visitors immediately see the full breadth of Market Entry Secrets' content and databases.

## Headline structure

**Static prefix:** "Find the"
**Rotating word:** cycles through the list below
**Static suffix:** "to enter Australia"

## Ticker word list (in rotation order)

1. leads
2. mentors
3. events
4. guides
5. providers
6. investors
7. accelerators
8. advisors
9. service providers
10. grants
11. playbooks
12. associations

The rotation loops infinitely (no "Secrets" finale like the current `RotatingText` does). Duration ~2500 ms per word so each one is readable.

## What will change

1. **`src/components/hero/heroContent.ts`** — Replace the static two-line headline with a structure: `{ prefix: "Find the", rotatingWords: [...12 words], suffix: "to enter Australia" }`.
2. **`src/components/hero/HeroHeadline.tsx`** — Render prefix + `<RotatingText>` + suffix in a single `<h1>`. The rotating word gets the existing gradient treatment (`bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`) so it visually pops; prefix/suffix stay foreground color.
3. **`src/components/RotatingText.tsx`** — Add an optional `loop` prop (default true) that skips the hardcoded "Secrets" finale so the ticker cycles forever. Keep existing fade+scale transition. Ensure the container is `inline-block` with a `min-w` sized to the longest word ("accelerators" / "service providers") to prevent layout shift when swapping.
4. **Subheadline** — Unchanged copy; still explains the report offering below the ticker.

## Responsive behaviour

- Desktop: `text-5xl` / `text-6xl` — comfortably fits "Find the service providers to enter Australia" on one or two lines depending on breakpoint.
- Mobile: `text-3xl` / `text-4xl` — will wrap naturally; keep line-height loose (`leading-tight`) so wrapped frames look intentional.
- The rotating word reserves min-width equal to the widest word so surrounding text doesn't jump.

## Out of scope

- No changes to CTAs, report mockup, proof strip, nav, or backend.
- No new database queries — the ticker is a static list (these are just category labels, not live counts).

## Next step

Approve and I'll implement, then verify the rotation renders cleanly on desktop and mobile.