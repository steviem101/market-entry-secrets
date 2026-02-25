---
name: frontend-design
description: Frontend design system conventions for Market Entry Secrets. Use when creating or modifying React components, pages, layouts, or styles. Ensures consistency with the project's Tailwind + shadcn/ui design tokens, component patterns, and styling rules.
---

# Frontend Design Skill — Market Entry Secrets

Follow these conventions whenever you create or modify frontend components, pages, or styles.

---

## 1. Technology Stack

- **React 18** with TypeScript
- **Vite** build tool
- **Tailwind CSS** with `tailwindcss-animate` and `@tailwindcss/typography` plugins
- **shadcn/ui** (default style, CSS variables enabled, `@/components/ui` alias)
- **Lucide React** for icons
- **react-helmet-async** for SEO `<Helmet>` tags

---

## 2. Color System — HSL Variables Only

All colors are defined as HSL CSS variables in `src/index.css`. **Never use hardcoded hex/rgb colors in components.** Always reference semantic tokens via Tailwind classes.

### Core Tokens

| Token | Light Value | Usage |
|-------|-------------|-------|
| `--primary` | 200 85% 55% | Interactive elements, buttons, links, brand blue |
| `--primary-foreground` | 0 0% 98% | Text on primary backgrounds |
| `--secondary` | 210 20% 95% | Light gray background tint |
| `--muted` | 210 15% 96% | Subtle backgrounds, disabled states |
| `--muted-foreground` | 220 10% 45% | Secondary/helper text |
| `--accent` | 200 75% 65% | Lighter blue for hover states, accents |
| `--destructive` | 0 84.2% 60.2% | Error/warning red |
| `--border` | 210 15% 92% | Borders and dividers |
| `--background` | 0 0% 100% | Page background |
| `--foreground` | 220 15% 15% | Primary text color |
| `--card` | 0 0% 100% | Card backgrounds |

### Rules

- Use Tailwind semantic classes: `bg-primary`, `text-muted-foreground`, `border-border`
- Use opacity modifiers for tints: `bg-primary/10`, `bg-primary/20`, `text-primary/80`
- Dark mode is supported via `.dark` class — the HSL variables swap automatically
- The `--radius` variable is `0.75rem` (maps to `rounded-lg`)

---

## 3. Page Structure

Every page follows this template:

```tsx
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";

const MyPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Page Title | Market Entry Secrets</title>
        <meta name="description" content="..." />
      </Helmet>
      {/* Page content */}
    </Layout>
  );
};
```

- `<Layout>` wraps all pages (provides `<Navigation>` + `<Footer>`)
- Always include `<Helmet>` with `<title>` and `<meta name="description">`
- Use `page-content` class for min-height: `<div className="page-content">`

### Directory Page Pattern

All directory/listing pages follow: **Hero -> Filters -> Results Grid**

```
<HeroSection />         ← Background gradients, title, subtitle, CTA
<FilterBar />           ← Search input, category/location dropdowns
<ResultsGrid />         ← Responsive card grid
```

---

## 4. Layout & Spacing

### Container

```tsx
<div className="container mx-auto px-4">
```

Max width is `1400px` with `2rem` padding (set in `tailwind.config.ts`).

### Responsive Grids

```tsx
// Standard 3-column directory grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 4-column grid for smaller cards
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
```

### Common Spacing

- Card padding: `p-6`
- Input padding: `p-4`
- Section gaps: `gap-6` (grids), `space-y-4` (vertical stacks)
- Tight gaps: `gap-2`
- Section vertical padding: `py-12` or `py-16`

---

## 5. Component Patterns

### Card Pattern

All cards use a consistent structure with hover lift:

```tsx
<div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
  {/* Header: Logo/avatar, title, location */}
  {/* Content: Description, tags, metadata */}
  <div className="mt-auto">
    {/* Footer: Action buttons pushed to bottom */}
  </div>
</div>
```

Key rules:
- `h-full flex flex-col` on the card for uniform grid height
- `mt-auto` on the footer to push actions to the bottom
- `hover:shadow-lg transition-all duration-300 hover:-translate-y-1` for the lift effect
- Use `line-clamp-2` or `line-clamp-3` for truncated text

### Badge/Tag Display

```tsx
<div className="flex flex-wrap gap-2">
  {items.slice(0, 3).map(item => (
    <Badge key={item} variant="secondary">{item}</Badge>
  ))}
  {items.length > 3 && (
    <Badge variant="outline">+{items.length - 3} more</Badge>
  )}
</div>
```

### Modal/Dialog Pattern

```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Sections */}
  </DialogContent>
</Dialog>
```

### Button Conventions

- Primary action: `<Button>` (default variant)
- Secondary action: `<Button variant="outline">`
- Subtle/icon action: `<Button variant="ghost" size="icon">`
- Destructive: `<Button variant="destructive">`
- Small buttons: `size="sm"`
- Link-like: `variant="link"`

---

## 6. Typography

| Element | Classes |
|---------|---------|
| Page title | `text-4xl font-bold text-foreground` |
| Section heading | `text-2xl font-semibold text-foreground` |
| Card title | `text-lg font-semibold text-foreground` |
| Body text | `text-base text-foreground` |
| Secondary text | `text-sm text-muted-foreground` |
| Labels/fine print | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` |

---

## 7. Icon Usage

Use **Lucide React** icons exclusively.

```tsx
import { MapPin, Calendar, ExternalLink } from "lucide-react";

// Inline with text
<MapPin className="w-4 h-4 mr-1" />

// Standalone
<Calendar className="w-6 h-6 flex-shrink-0" />

// Prominent/featured
<ExternalLink className="w-8 h-8 text-primary" />
```

---

## 8. Hover & Interaction States

```tsx
// Card lift
hover:shadow-lg hover:-translate-y-1 transition-all duration-300

// Background highlight
hover:bg-primary/20

// Text color change
hover:text-primary

// Image zoom (inside group)
group-hover:scale-105 transition-transform duration-300

// Focus ring (automatic via shadcn)
focus-visible:ring-2 focus-visible:ring-ring
```

---

## 9. Hero Sections

Hero sections use layered backgrounds:

```tsx
<section className="relative overflow-hidden py-16 md:py-24">
  {/* Base gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background animate-gradient-shift" />

  {/* Accent overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />

  {/* Floating orbs */}
  <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-float" />

  {/* Content */}
  <div className="relative z-10 container mx-auto px-4 text-center">
    <h1 className="text-4xl font-bold">...</h1>
    <p className="text-lg text-muted-foreground mt-4">...</p>
  </div>
</section>
```

---

## 10. Custom Utility Classes

These are defined in `src/index.css` and available globally:

| Class | Purpose |
|-------|---------|
| `gradient-section` | Background gradient (background -> muted -> background) |
| `gradient-overlay` | Subtle primary/accent overlay |
| `soft-shadow` | Primary-tinted soft box shadow |
| `glass` / `glass-strong` | Glassmorphism with backdrop blur |
| `skeleton-pulse` | Loading skeleton animation |
| `nav-link` | Navigation link with hover translate |
| `nav-popped` | Navigation pop-out effect |
| `page-content` | Min-height container (100vh - 64px) |
| `animate-float` | Vertical float (3s loop) |
| `animate-glow` | Glowing pulse (2s loop) |
| `animate-shimmer` | Shimmer loading (2s loop) |
| `animate-gradient-shift` | Gradient position shift (8s loop) |
| `animate-fade-in-up` | Fade + translate up (0.6s, once) |
| `animate-hero-stat-breathe` | Breathing scale (3s loop) |
| `report-prose` | Report typography fine-tuning |

All animations respect `prefers-reduced-motion: reduce`.

---

## 11. Responsive Design

- **Mobile-first**: start with mobile layout, add breakpoints
- **Breakpoints**: `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- **Navigation**: hamburger on mobile (`MobileNavigation`), full nav on desktop (`DesktopNavigation`)
- **Layout flip**: `flex-col md:flex-row` for mobile-column to desktop-row
- **Width**: `w-full sm:w-auto` for full-width mobile buttons
- **Visibility**: `hidden md:block` to show only on tablet+

---

## 12. Form Patterns

Use shadcn's form components with react-hook-form:

```tsx
<FormField
  control={control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input placeholder="..." {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

Input styling: `className="w-full border border-input bg-background"`

---

## 13. Import Aliases

Always use path aliases (configured in `tsconfig.app.json`):

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
```

Never use relative paths like `../../components/ui/button`.

---

## 14. Do NOT

- Use hardcoded hex/rgb colors — always use Tailwind semantic tokens
- Edit `src/integrations/supabase/types.ts` — it's auto-generated
- Use `VITE_*` env vars — Lovable doesn't support them
- Add inline styles when Tailwind classes exist
- Skip the `<Layout>` wrapper on pages
- Skip `<Helmet>` SEO tags on pages
- Use icon libraries other than Lucide React
- Over-engineer — keep components focused and minimal
