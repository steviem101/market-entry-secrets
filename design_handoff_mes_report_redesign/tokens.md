# Token mapping — prototype hex → Tailwind

The repo already defines MES brand tokens in `src/index.css` (`--primary: hsl(200 85% 55%)` ≈ #29a3e3). Extend the Tailwind theme with the report-specific aliases below rather than hardcoding hexes in components. If a token already exists in the repo config, use the existing name — this table is the mapping, not a new palette.

```js
// tailwind.config extension
theme: { extend: { colors: {
  report: {
    sky:      "#29a3e3",  // = existing --primary; buttons, accents, customer marks
    action:   "#178fc9",  // links, section labels, button hover
    ink:      "#23272e",  // body headings, dark rules
    surface:  "#171c26",  // cover + sources band background
    bg:       "#f4f6f8",  // page background
    border:   "#e8ecef",  // card borders (inner rules #eef1f4)
    muted:    "#67707e",  // secondary text (captions #8a94a3)
    tint:     "#f2f9fd",  // sky tint fills (border #cfe6f4)
    good:     "#0ea371",  // sourced chips, green accents (confirm tint #e9f7f1 / #b9e4d2 / #0b7a55)
    warn:     "#d97706",  // EST chips, amber (accent #f5b84b, tint #fdf5e7)
    risk:     "#dc2626",  // red severity
  }
}}}
```

Typography (existing families — Plus Jakarta Sans, JetBrains Mono):
- Section label: mono 11px / 700 / tracking .14em / report-action
- Card title: sans 15.5px / 700; ranked-row name 14px / 700
- Body: sans 12.5–13.5px / 400 / leading 1.65–1.75; exec narrative 15–16px
- Mono meta/tags: 8.5–10.5px / 500–700; metric value: sans 32px / 800; hero stat 56px / 800
- Radii: section card `rounded-[14px]` + 3px top accent; inner cards `rounded-xl` (12px); buttons `rounded-lg` (8px); identity slots: person circle 34px, company square 28px `rounded-[7px]`

Spacing rhythm: section padding 64px/80px (`py-16 px-20`), card padding 28px/30px, grid gaps 22px (cards) / 16px (compact grids) / 64px (2-col splits).
