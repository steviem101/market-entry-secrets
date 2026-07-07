Plan: Fix ticker headline capitalisation and line break

Two tweaks to the hero:

1. **Title-case every rotating word** in `src/components/hero/heroContent.ts`:
   `Leads, Mentors, Events, Guides, Providers, Investors, Accelerators, Advisors, Service Providers, Grants, Playbooks, Associations`.

2. **Remove the forced line break** in `src/components/hero/HeroHeadline.tsx` — drop the `<br />` between the rotating word and "to enter Australia" so the headline flows on one line when the viewport is wide enough and wraps naturally otherwise. Keep the min-width reservation on the rotating word so layout doesn't jump between short ("Leads") and long ("Service Providers") frames.

No other changes. Ready to build on approval.