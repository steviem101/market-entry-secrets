## Problem

The hero mockup right of the headline auto-cycles through three views (Report / Providers / Intake). The content wrapper is `p-5 min-h-[320px]` — the third view (Intake, "Your Details / Step 1 of 3") renders taller than the min-height because of the 4 stacked form fields, so every time the cycle lands on it the whole mockup card grows by ~40px and the page below shifts down by one line. This matches what you're seeing.

## Fix

In `src/components/hero/HeroProductMockup.tsx` (line 262), swap the `min-h-[320px]` for a fixed height sized to the tallest view so the card never resizes as views cycle:

- `p-5 min-h-[320px] transition-all…` → `p-5 h-[400px] transition-all…`

No other changes — headline, badges, and view contents stay as they are.

## Verification

Load `/`, let the mockup auto-cycle through all three views, and confirm the card, the floating badges, and every section below the hero stay perfectly still (no line jump when the Intake view is shown).
