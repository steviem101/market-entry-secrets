The rotating word ticker currently contains both "Providers" and "Service Providers", which is redundant and risks a third line when the longer phrase appears. The user also wants two new words added.

Changes to `src/components/hero/heroContent.ts` only:

1. **Remove** `"Service Providers"` from `rotatingWords` (the word "Providers" already exists).
2. **Add** `"Conferences"` and `"Communities"` to `rotatingWords`.

The headline layout in `HeroHeadline.tsx` remains unchanged — it already renders on two fixed lines with only the rotating word animating.

New `rotatingWords` array will be:
```text
Leads, Mentors, Events, Guides, Providers, Investors, Accelerators, Advisors, Grants, Playbooks, Associations, Conferences, Communities
```