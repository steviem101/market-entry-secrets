## Goal
The Report Creator v2 (`/report-creator`) was designed in isolation and ships its own font, palette, canvas, and shadow system. The rest of the app uses a single shared design system. This plan re-skins the wizard to use that system without changing UX, copy, or behaviour.

## What's actually misaligned (audit)

| Concern | Report Creator v2 | Rest of app |
|---|---|---|
| Font | `font-rc` = Plus Jakarta Sans (applied on the root wrapper) | System sans (Tailwind default), no `font-rc` |
| Primary blue | `--rc-primary` `198 79% 49%` (#1AA3E0) | `--primary` / `--mes-teal` `200 85% 55%` |
| Heading ink | `--rc-ink` `209 61% 16%` (#102A43, very navy) | `--foreground` / `--mes-ink` `220 15-25% 12-15%` (near‑black) |
| Body copy | `--rc-body`, `--rc-muted` (cool grey-blue) | `--muted-foreground`, `text-foreground` |
| Page canvas | `bg-rc-canvas` (#F5F8FB) | `bg-background` (white) or `bg-mes-bg` |
| Borders/dividers | `border-rc-line` | `border-border` |
| Shadow | bespoke `shadow-rc-pop` | shadcn default shadows |
| Type scale | Pixel values: `text-[12px]`, `text-[13.5px]`, `text-[19px]`, `text-[26px]`, `text-[34px]`, custom tracking | Tailwind scale: `text-sm`, `text-base`, `text-2xl`, `text-4xl` |
| Layout chrome | Renders bare — no `<Layout>` / `<Navigation>` / `<Footer>` | All other pages use `<Layout>` |
| Eyebrows | `CHOOSE YOUR JOURNEY` in `rc-primary` | App pages don't use coloured eyebrows above H1s |

Net effect: it reads like a sibling micro-site (different blue, different headline font weight/face, different background) rather than a page of the same app.

## Approach
Re-skin via tokens — keep all wizard structure, components, props, validation, and pipeline calls exactly as they are. Only swap the styling primitives.

### 1. Token remap (one pass across `src/components/report-creator/v2/*`)
Search-and-replace at the className level:
- `bg-rc-canvas` → `bg-background` (or `bg-mes-bg` for the subtle grey wrapper)
- `text-rc-ink` → `text-foreground`
- `text-rc-body` → `text-foreground/80` (or `text-muted-foreground` where it's truly secondary)
- `text-rc-muted` → `text-muted-foreground`
- `border-rc-line` → `border-border`
- `bg-rc-sky-soft` → `bg-primary/10`
- `bg-rc-sky-tint` → `bg-primary/5`
- `text-rc-primary` → `text-primary`
- `text-rc-primary-700` → `text-primary` (drop the second shade — app system uses one primary)
- `bg-rc-primary` / hover variants → `bg-primary` / `hover:bg-primary/90`
- `ring-rc-sky-soft` → `ring-primary/20`
- `text-rc-success` → `text-mes-success`
- `shadow-rc-pop` → `shadow-md` (or remove on hover-only states)

### 2. Drop the bespoke font
- Remove `font-rc` from `ReportCreatorV2.tsx` and `GeneratingScreenV2.tsx` so the wizard inherits the app's body font.
- Keep the Plus Jakarta Sans `<link>` in `index.html` (used by `font-mono`/other tokens), but no component opts in by default. (If you'd rather keep Plus Jakarta Sans app-wide, see the open question below.)

### 3. Re-scale typography to the app's scale
Replace pixel sizes with Tailwind tokens used on `Index`, `About`, etc.:
- H1 (`text-[26px] sm:text-[34px] font-bold tracking-tight`) → `text-3xl sm:text-4xl font-bold tracking-tight`
- H3 card titles (`text-[19px] font-bold`) → `text-lg font-semibold`
- Body lead (`text-[15px] sm:text-[16px] leading-relaxed`) → `text-base sm:text-lg text-muted-foreground`
- Small captions (`text-[12.5px]`, `text-[13px]`) → `text-xs` / `text-sm`
- Remove the all-caps `text-[12px] tracking-[0.14em]` eyebrow ("CHOOSE YOUR JOURNEY", etc.) — the app doesn't use coloured eyebrows above page H1s. Replace with a plain `text-sm text-muted-foreground` lead-in or delete.

### 4. Wrap the page in `<Layout>`
Update `src/pages/ReportCreatorV2.tsx` to render `<Layout>…</Layout>` so the wizard sits inside the same Navigation + Footer the rest of the site uses, on the same `bg-background`. This is the single biggest visual unification — it removes the "different site" feeling.

### 5. Keep the `--rc-*` tokens defined but unused
Don't delete the `--rc-*` CSS variables or the `font-rc` font family from `index.css` / `tailwind.config.ts` in this pass — they're referenced by `mockPreviewData`, the handoff docs, and the generating screen, and removing them risks build breaks unrelated to branding. They simply stop being applied. A follow-up cleanup PR can prune them once we've confirmed nothing else depends on them.

### 6. Files touched
- `src/pages/ReportCreatorV2.tsx` — add `<Layout>`, drop `font-rc`, swap canvas class
- `src/components/report-creator/v2/PersonaScreen.tsx`
- `src/components/report-creator/v2/StepShell.tsx`
- `src/components/report-creator/v2/Step1Company.tsx`
- `src/components/report-creator/v2/Step2Goals.tsx`
- `src/components/report-creator/v2/Step3Details.tsx`
- `src/components/report-creator/v2/ReviewScreen.tsx`
- `src/components/report-creator/v2/CompanyPicker.tsx`
- `src/components/report-creator/v2/ReportPreview.tsx`
- `src/components/report-creator/v2/primitives.tsx`
- `src/components/report-creator/v2/GeneratingScreenV2.tsx`

### 7. Verification
- Visual walk-through with Playwright: persona screen → step 1 → step 2 → step 3 → review, capture screenshots, compare against `/` and `/pricing` for palette/typography consistency.
- Confirm wizard still validates and submits (no logic touched).
- Confirm AU-English copy unchanged, all accessibility roles intact (radiogroups, checkboxes, hit targets).

## Out of scope
- The generation pipeline, intake schema, mapping shim, and analytics events.
- Copy edits.
- The `/report/:id` rendered report view (separate design surface).

## Open question
Want me to (a) make the wizard match the rest of the app's current system font (proposed default), or (b) adopt Plus Jakarta Sans app-wide as the new body font and align the rest of the app to the wizard? Default in this plan is (a) — smallest blast radius.
