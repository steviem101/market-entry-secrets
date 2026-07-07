Lock the headline layout so only the blue rotating word changes; everything else stays static.

## Changes

**1. `src/components/hero/HeroHeadline.tsx`** — restructure to a fixed two-line layout matching the screenshot:
- Line 1: `Find the [RotatingWord]`
- Line 2: `to enter Australia`

Both lines stay put regardless of which word is rotating.

**2. Prevent layout shift on the rotating word** — reserve horizontal space for the longest word ("Accelerators" / "Service Providers") so "Find the" doesn't slide left/right as words swap:
- Wrap `<RotatingText>` in an `inline-block` span with `min-width` sized to the widest word (approx `13ch`), left-aligned so "Find the " stays anchored.

**3. `src/components/RotatingText.tsx`** — no behaviour change; keep the fade transition on just the word.

Result: the "Find the ___" / "to enter Australia" frame is completely static; only the blue word fades in/out in place.
