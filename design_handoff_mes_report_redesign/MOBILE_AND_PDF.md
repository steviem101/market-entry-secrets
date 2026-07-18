# Mobile & PDF specification

Applies to tickets 15–16 as acceptance criteria. The desktop prototypes (`reference/`) are the 1240px source of truth; this file defines how the same components adapt. One component tree for all three surfaces — never a parallel layout system.

## Mobile (web report)

Breakpoints: `sm` <640, `md` 640–1024, `lg` ≥1024 (desktop = prototype).

1. **Columns collapse.** All 2-col layouts (exec narrative + rail, gov/hubs split, compliance stats + checklist, close body + arriveWith) → single column below `lg`; rail/aside cards render AFTER their narrative.
2. **Card grids.** 3–4-col grids → 1-col below `md`, 2-col on `md`. Ranked "our read" rows keep their grid but drop the meta column into the name cell.
3. **Tables become cards.** Below `md`, competitor and compliance tables re-render as stacked cards: header line (name + tag + logo), then each column as a labeled row (mono label + text). **Never horizontal scroll.** The customer's own row keeps its sky tint and renders first.
4. **Hit targets ≥44px.** The ☆ star gets a 44×44 tap area (visual glyph unchanged); request buttons full-width below `sm`.
5. **Type steps down.** Cover headline 42→30px; section titles 22→19px; hero stat 56→44px; body sizes unchanged (already ≥12.5px). Section padding 64/80 → 32/20; page gutter 24→16px.
6. **Interactions identical.** Stars, request hooks, shortlist strip, confirmations all function the same; shortlist chips wrap.
7. **Acceptance:** both fixtures at 375px and 768px — no horizontal overflow anywhere, every interactive element tappable, tables readable as cards.

## PDF (download)

1. **Same components + print stylesheet.** No second renderer. `@media print` only.
2. **Page breaks:** each numbered section starts a new page (`break-before: page`); cards, table rows, SWOT quadrants, ranked rows are atomic (`break-inside: avoid`). Running footer (customer · date · page/total) via print margin boxes.
3. **Interactive → static:** stars hidden; scan/brief/lead request hooks render as one-line "To request …, contact us or visit your online report" with the report URL; textarea and shortlist strip replaced by "Manage your shortlist online" + link. (The web report stays the canonical, returning-visit surface.)
4. **Links:** card-title links keep text; the profile URL prints in 8px mono under the title (PDF has no hover). Inline body links print styled but without URL expansion.
5. **Identity assets:** preload with 3s timeout → monogram fallback (DECISIONS #6). No broken-image glyphs ever.
6. **Color:** dark cover + sources band print as-is (brand moments); all body sections white. Chips/severity colors preserved (`print-color-adjust: exact`).
7. **Acceptance:** print-to-PDF of both fixtures — no orphaned card halves, footer on every page, hooks reading as static lines, a missing logoUrl showing a monogram.
