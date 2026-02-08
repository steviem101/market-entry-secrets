

# Events Page Deep Dive: Recommendations

## Current State Assessment

The Events page currently works as a basic directory listing with:
- A hero section with stats (event count + location count)
- Standard directory filters (search, location, type, sector, category)
- A card grid showing all 22 events
- Clicking "View Details" opens a **modal** (not a dedicated page)
- No slug column on the `events` table -- events have no URL-friendly identifiers
- No SEO metadata per event
- No pagination (all 22 events load at once -- fine for now, but won't scale)
- Events are sorted by date ascending, meaning **past events from 2024 appear first** and upcoming events are buried
- None of the 22 events have a logo image populated (`event_logo_url` is null for all)
- The "Contact" button opens a blank `mailto:` link (no actual organizer email stored)

---

## Recommended Improvements (Priority Order)

### 1. Individual Event Detail Pages with Dedicated URLs (High Priority)

**What:** Create `/events/:eventSlug` routes so each event has its own shareable, SEO-friendly URL.

**Why:** Currently events only open in a modal, which means:
- Events cannot be shared via URL or linked to from reports/sectors/locations
- No SEO value -- Google cannot index individual events
- No deep linking from the report generator's "events_resources" section

**Technical changes:**
- Add a `slug` column to the `events` table (generated from title, e.g., "international-mining-and-resources-conference-imarc")
- Run a migration to backfill slugs for all 22 existing events
- Create a `useEventBySlug` hook (following the `useLocationBySlug` pattern)
- Create a new `src/pages/EventDetailPage.tsx` with:
  - Event hero with logo, title, date, location
  - Full description section
  - Organizer details
  - Related events (same category/sector)
  - Sidebar with "Related Service Providers" and "Related Content" from the same sector
  - Bookmark and share buttons
  - Breadcrumb navigation (Events > Event Name)
  - SEO meta tags via react-helmet-async
- Add route `/events/:eventSlug` to App.tsx
- Update `EventCard` "View Details" button to use `<Link>` navigation instead of opening a modal
- Keep the modal as a fallback for embedded contexts (sector pages, location pages)

### 2. Fix Event Sorting -- Upcoming Events First (High Priority)

**What:** Show upcoming/future events before past events, and visually separate them.

**Why:** Currently, events from May 2024 appear first while December 2025 events are at the bottom. Users care about **upcoming** events, not past ones.

**Technical changes:**
- Split events into "Upcoming" and "Past" sections
- Default sort: upcoming events by nearest date first, past events by most recent first
- Add a visual divider or tab between sections
- Optionally add a toggle/tab: "Upcoming" | "Past" | "All"
- Grey out or visually de-emphasize past event cards

### 3. Enrich the Event Data Model (Medium Priority)

**What:** Add new columns to the `events` table to support richer event detail pages.

**New columns to add:**
- `slug` (text, unique) -- URL-friendly identifier
- `website_url` (text) -- Link to the official event page
- `registration_url` (text) -- Direct registration/ticket link
- `organizer_email` (text) -- Actual contact email (currently the "Contact" button is non-functional)
- `organizer_website` (text) -- Organizer's website
- `price` (text) -- Ticket pricing info (e.g., "Free", "$299 Early Bird")
- `is_featured` (boolean) -- For highlighting key events
- `tags` (text[]) -- Additional tags for better filtering
- `image_url` (text) -- Event banner/hero image (separate from logo)

### 4. Add "Featured Events" Carousel at the Top (Medium Priority)

**What:** Display 3-4 featured/upcoming events in a prominent carousel or highlight section above the grid.

**Why:** Draws attention to the most important upcoming events and adds visual interest to the page (currently it jumps straight from hero to a flat grid).

**Technical changes:**
- Use the `is_featured` flag or auto-select the next 3 upcoming events
- Use an Embla carousel (already installed) or a highlight card row
- Each featured card shows a larger image, date countdown, and CTA

### 5. Add "Add to Calendar" Functionality (Medium Priority)

**What:** Let users add events to their Google Calendar, Outlook, or Apple Calendar directly from the event card or detail page.

**Technical changes:**
- Generate `.ics` calendar file download
- Add Google Calendar link (URL-based, no API needed)
- Add an "Add to Calendar" dropdown button on EventCard and EventDetailPage

### 6. Improve Event Card Design (Low Priority)

**What:** Polish the event cards for better visual hierarchy and scannability.

**Current issues:**
- Placeholder avatar images from Unsplash (hardcoded stock photos for organizers)
- Debug `console.log` left in EventCard component
- No visual distinction between upcoming and past events
- Logo area shows generic calendar icon for all events (none have logos)

**Improvements:**
- Remove debug console.log
- Remove the fake organizer avatar (just use initials or icon)
- Add a date badge/ribbon in the corner (e.g., "JUL 25")
- Add visual indicators: "Coming Soon", "Registration Open", "Past Event"
- Show countdown for upcoming events (e.g., "In 14 days")

### 7. Add Pagination or Infinite Scroll (Low Priority -- Future)

**What:** Currently all 22 events load at once. As the event count grows, add pagination.

**Why:** Not urgent at 22 events, but important once the count exceeds 50+.

---

## Technical Implementation Summary

### Database Migration
- Add `slug`, `website_url`, `registration_url`, `organizer_email`, `organizer_website`, `price`, `is_featured`, `tags`, `image_url` columns to `events`
- Backfill `slug` for all 22 existing events
- Add unique index on `slug`

### New Files
- `src/pages/EventDetailPage.tsx` -- Full event detail page
- `src/hooks/useEventBySlug.ts` -- Fetch single event by slug
- `src/components/events/EventDetailHero.tsx` -- Hero section for detail page
- `src/components/events/EventDetailSidebar.tsx` -- Sidebar with related items
- `src/components/events/FeaturedEventsSection.tsx` -- Featured carousel
- `src/components/events/AddToCalendarButton.tsx` -- Calendar integration

### Modified Files
- `src/App.tsx` -- Add `/events/:eventSlug` route
- `src/components/EventCard.tsx` -- Link to detail page, remove debug log, add date badge
- `src/pages/Events.tsx` -- Split upcoming/past, add featured section
- `src/hooks/useEvents.ts` -- Add upcoming/past sorting logic
- `src/integrations/supabase/types.ts` -- Updated types

