

## CTA + Social Proof Area — Review & Redesign Ideas

### Current Problems

1. **Too many elements competing on one row**: Primary button, secondary button, AND a trust micro-label all crammed horizontally — causes wrapping and visual clutter
2. **The trust micro-label ("No credit card...") floats awkwardly** next to the buttons, especially at medium breakpoints where it wraps to a third line
3. **Social proof row is disconnected**: Stars + 10 flag circles + text all on one line feels busy — 10 flags is too many, they blur together
4. **Flag circles have low-contrast borders** (`border-primary/15`) making them look washed out
5. **The primary CTA label includes a redundant arrow** — the text already ends with "→" AND there's an ArrowRight icon
6. **No visual hierarchy between the CTA area and social proof** — they blend into one cluttered block

### Redesign Ideas

**Idea A: Stack the trust label under the primary CTA**
Move "No credit card required · Ready in 3 minutes" directly beneath the primary button (not beside it). This keeps the button row to just 2 buttons and puts the trust reassurance right where the eye lands after reading the CTA.

**Idea B: Merge social proof INTO the trust line**
Combine stars + trust text into one compact line: `★★★★★ Trusted by 500+ companies from 12+ countries`. Drop the individual flag circles entirely — they add visual noise without adding real information. The text alone is more impactful.

**Idea C: Reduce flags to 5 + avatar-style overlay**
Keep only 5 flags (the most recognizable markets), make them slightly larger, and use tighter overlap. This reduces visual noise by 50%.

**Idea D: Replace flags with actual company logos or user avatars**
Small grayscale logos of recognizable companies (or generic avatar circles with initials) are more credible than flag emojis. Flags look decorative; logos look like proof.

---

### Recommended Approach: A + B combined

1. **CTA row**: Just the two buttons side by side — nothing else
2. **Trust line**: Directly beneath the primary button: `Shield icon + "No credit card · Ready in 3 min"`
3. **Social proof**: One clean line: `★★★★★ Trusted by 500+ companies from 12+ countries` — no flag circles
4. **Fix duplicate arrow**: Remove the "→" from the CTA label text (the ArrowRight icon already handles this)

### Files to Modify
- `src/components/hero/HeroCTAGroup.tsx` — restructure layout, move trust label below buttons
- `src/components/hero/HeroSocialProof.tsx` — simplify to stars + text only, remove flags
- `src/components/hero/heroContent.ts` — remove trailing "→" from CTA labels

