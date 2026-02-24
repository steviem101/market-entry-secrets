# Hero Stats Row — UX Redesign Plan

## Current State Assessment

### What exists today
The hero section has a **static `HeroStatsRow`** at the bottom showing 5 hardcoded counters:
- 500+ Vetted Providers
- 50+ Monthly Events
- 37 Market Reports
- 8 Sectors Covered
- 12+ Countries

These are defined as constants in `heroContent.ts` → `HERO_STATS` and rendered by `HeroStatsRow.tsx`. The only interactivity is an ease-out cubic count-up animation via `useAnimatedCounter` hook triggered on scroll intersection.

### Problems identified
1. **Not persona-aware** — The counters never change when toggling between "International Entry" and "Startup Growth". Both audiences see identical stats that lean heavily toward international entrants.
2. **Hardcoded values** — The numbers don't reflect actual database content. "500+ Vetted Providers" and "50+ Monthly Events" appear inflated or guessed.
3. **Visually plain** — Simple number + label stacked vertically with pipe dividers. No icons, no color, no visual weight hierarchy. They read more like metadata than proof points.
4. **No contextual relevance** — A startup founder doesn't care about "12+ Countries". They want to know about investors and accelerators. A market entrant doesn't care about accelerators; they want events and guides.
5. **No interaction** — Stats are purely decorative. They don't link anywhere or invite exploration.

---

## Recommendations

### R1: Persona-Specific Counter Sets

Show **different counters per journey path** to match the user's intent:

**Startup Growth** persona:
| Counter | DB Source | Icon |
|---------|----------|------|
| Investors | `investors` table — `count(*)` | `TrendingUp` |
| Lead Databases | `leads` table — `count(*)` | `Database` |
| Mentors | `community_members` table — `count(*)` | `Users` |
| Service Providers | `service_providers` table — `count(*)` | `Building2` |
| Accelerators | `investors` table — `count(*) WHERE investor_type = 'accelerator'` | `Rocket` |

**International Entry** persona:
| Counter | DB Source | Icon |
|---------|----------|------|
| Lead Databases | `leads` table — `count(*)` | `Database` |
| Mentors | `community_members` table — `count(*)` | `Users` |
| Events | `events` table — `count(*)` | `Calendar` |
| Market Entry Guides | `content_items` table — `count(*) WHERE content_type = 'guide'` | `BookOpen` |
| Service Providers | `service_providers` table — `count(*)` | `Building2` |

### R2: Live Database Counts via a Dedicated Hook

Create a `useHeroStats` hook that:
- Runs lightweight `SELECT count(*)` queries against the relevant tables on mount
- Caches results with React Query (`staleTime: 5 min`) so re-renders are instant
- Returns a `Record<HeroPersona, StatItem[]>` so the component just reads from the active persona key
- Provides fallback hardcoded values while loading (so counters never show "0")

### R3: Visual Upgrade — Icon Cards with Gradient Accents

Replace the bare number+label stack with **mini stat cards**:

```
┌──────────────────────┐
│  [icon]              │
│  147                 │  ← large animated number
│  Investors           │  ← muted label
└──────────────────────┘
```

Design details:
- Each stat rendered inside a glassmorphic card (`bg-card/60 backdrop-blur border border-border/50`)
- Icon placed above the number in a soft circular gradient background (`bg-gradient-to-br from-primary/15 to-accent/15`)
- Number uses `text-3xl font-bold` with a subtle gradient text fill (`bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80`)
- Label below in `text-xs uppercase tracking-wider text-muted-foreground`
- Cards arranged in a responsive 5-column grid (`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3`)
- On hover: slight scale-up (`hover:scale-[1.03]`), border brightens (`hover:border-primary/30`), shadow deepens

### R4: Animated Persona Transition

When the user toggles persona, the stat cards should:
1. **Fade out + slide down** the current set (200ms)
2. **Swap data** (counter targets, labels, icons)
3. **Fade in + slide up** the new set with staggered delays (50ms apart)
4. **Re-trigger the count-up animation** from 0 to new target values

This creates a satisfying "the platform reshapes to your needs" moment that reinforces the persona-first messaging.

### R5: Clickable Stats (Navigate to Relevant Directory)

Each stat card becomes a link to its respective directory page:
- Investors → `/investors` (only for startup persona, hidden for international — shows events instead)
- Mentors → `/community`
- Events → `/events`
- Service Providers → `/service-providers`
- Lead Databases → `/leads`
- Accelerators → `/investors?type=accelerator`
- Market Entry Guides → `/content?type=guide`

Visual cue: subtle arrow icon on hover, cursor pointer, and a "Browse →" micro-label that fades in.

### R6: Subtle Ambient Animation

- Each card icon gently "breathes" with a slow scale pulse (`animate-pulse` at 3s, scale 1.0–1.05) — very subtle, not distracting
- On viewport entry: count-up animation already exists, keep it (ease-out cubic over 2s)
- Consider a thin gradient shimmer sweep across the card set on initial load (like a "scanning" effect)

---

## Implementation Plan

### Step 1: Create `useHeroStats` Hook
- New file: `src/hooks/useHeroStats.ts`
- Uses Supabase `count` queries for: `service_providers`, `community_members`, `events`, `leads`, `content_items` (where type='guide'), `investors` (all + where type='accelerator')
- Returns `{ stats: Record<HeroPersona, StatConfig[]>, isLoading: boolean }`
- Each `StatConfig`: `{ value: number, fallback: number, suffix: string, label: string, icon: LucideIcon, href: string }`

### Step 2: Update `heroContent.ts`
- Remove the hardcoded `HERO_STATS` array
- Add per-persona stat configuration (labels, icons, hrefs, fallback values, DB table mappings)

### Step 3: Redesign `HeroStatsRow.tsx`
- Accept `activePersona` prop (currently not passed — needs wiring in `HeroSection.tsx`)
- Render the glassmorphic card grid instead of plain text
- Each card uses `useAnimatedCounter` tied to live DB value
- Wrap each card in a `<Link>` to the relevant directory page
- Add entrance/exit transition using CSS transitions keyed to `activePersona`

### Step 4: Wire persona into `HeroSection.tsx`
- Pass `activePersona` to `<HeroStatsRow>`
- Ensure the transition key forces re-mount or re-animation on persona change

### Step 5: Add CSS/Animations
- Add any new keyframe animations to `src/index.css` if needed (shimmer, stagger-in)
- Keep all colors as design system tokens (no hardcoded hex/HSL)

### Step 6: Responsive & Performance
- Cards stack to 2 columns on mobile, 3 on tablet, 5 on desktop
- Count queries are lightweight `SELECT count(*)` — negligible latency
- React Query caching means the DB is hit once per 5 minutes max
- Fallback values show immediately while queries resolve

---

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useHeroStats.ts` | **NEW** — hook for live DB counts |
| `src/components/hero/heroContent.ts` | Remove `HERO_STATS`, add persona stat configs |
| `src/components/hero/HeroStatsRow.tsx` | Full redesign with cards, icons, persona switching |
| `src/components/sections/HeroSection.tsx` | Pass `activePersona` to `HeroStatsRow` |
| `src/index.css` | Add shimmer/stagger keyframes if needed |
