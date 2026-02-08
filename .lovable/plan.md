

# Report UX Polish -- Recommended Improvements

## Overview

Eight targeted improvements to transform the report from "functional document" to "professional intelligence deliverable." Each improvement is independent -- they can be implemented together or selectively.

---

## 1. Section Icons and Visual Anchors

**Problem**: Every section looks identical -- white card, text title, text content. The eye has no visual landmarks when scrolling through a long document.

**Solution**: Add a subtle colored icon next to each section title and a thin accent-colored top border on each card. For example:
- Executive Summary: FileText icon, blue accent
- SWOT Analysis: Target icon, amber accent  
- Competitor Landscape: BarChart3 icon, purple accent
- Service Providers: Building2 icon, green accent
- Mentor Recommendations: Users icon, indigo accent
- Events & Resources: CalendarDays icon, orange accent
- Action Plan: ListChecks icon, emerald accent
- Lead List: Database icon, sky accent

This gives each section a distinct visual identity, making the report feel more structured and easier to navigate at a glance.

**Also update the sidebar** to show the same icons next to each section name, plus highlight the currently active section using the scroll spy hook (which exists but isn't connected).

---

## 2. Active Sidebar with Scroll Spy and Progress

**Problem**: The sidebar exists but doesn't highlight which section you're currently reading. There's also no sense of progress through the report.

**Solution**: 
- Connect the existing `useScrollSpy` hook to `ReportSidebar` to highlight the active section with a left accent bar and bolder text
- Add a thin progress bar at the top of the sidebar showing how far through the report you've read (e.g., "3 of 8 sections")
- Style the active item with a subtle background tint and left border accent

---

## 3. Key Metrics Highlight Cards in Executive Summary

**Problem**: Critical numbers (e.g., "USD 8.48 billion market," "5.1% CAGR," "24% surge in healthcare M&A") are buried inside paragraph text and easy to miss.

**Solution**: Add a dedicated "Key Metrics" row at the top of the Executive Summary section -- 3-4 small stat cards in a horizontal grid showing the most important numbers pulled from the content. These would be visually distinct from the prose text with a slightly different background.

This could be done by:
- Having the AI generate structured key_metrics data alongside the prose content during report generation
- Or parsing the executive summary for bold numbers/percentages as a simpler approach

---

## 4. Separator Between Prose and Match Cards

**Problem**: The match cards (service providers, mentors, events) sit directly below the prose text with no visual separation. It's unclear where the AI analysis ends and the recommendations begin.

**Solution**: Add a labeled divider between the prose content and the match cards grid:
- A horizontal rule with a small label like "Recommended Providers" or "Matched Resources"
- A subtle background color change for the match cards area (e.g., slightly tinted background)
- This makes it immediately clear that the cards are actionable recommendations tied to the section above

---

## 5. Better Match Card Layout

**Problem**: Match cards are small and cramped. The "View Profile" button competes with the tag badges for attention. On desktop, 2 columns feels tight for cards with tags.

**Solution**: 
- Increase card padding from `p-4` to `p-5`
- Move the action buttons below the tags instead of beside them (stack layout instead of side-by-side)
- Add a subtle left border accent using the section's color for visual connection
- Consider showing a brief description/snippet for each match (1-2 lines max) if available from the data

---

## 6. Reading Time and Section Word Count

**Problem**: Users have no sense of how long the report is or how much content each section contains.

**Solution**: 
- Add estimated reading time in the report header (e.g., "12 min read")
- Optionally show a small word count or "quick read" / "detailed" label per section

This is a small detail that significantly increases the perceived professionalism of the report.

---

## 7. "Back to Top" Floating Button

**Problem**: Reports can be very long. Once you scroll past the first few sections, getting back to the top (or to the sidebar navigation) requires a lot of scrolling.

**Solution**: Add a floating "back to top" button that appears after scrolling past the first section. Positioned in the bottom-right corner, subtle, with a smooth scroll animation.

---

## 8. Mobile Table of Contents Drawer

**Problem**: The sidebar is hidden on mobile (`hidden lg:block`). Mobile users have no way to navigate between sections except scrolling.

**Solution**: Add a floating "Contents" button on mobile that opens a bottom sheet / drawer showing the section list. This mirrors the desktop sidebar experience.

---

## Technical Summary

| File | Changes |
|---|---|
| `src/components/report/ReportSection.tsx` | Add section icon + accent top border, add "Recommended" divider before children |
| `src/components/report/ReportSidebar.tsx` | Connect useScrollSpy, add active state styling, add icons, add progress indicator |
| `src/components/report/ReportMatchCard.tsx` | Increase padding, stack layout for actions, add left accent border |
| `src/components/report/ReportHeader.tsx` | Add reading time estimate |
| `src/pages/ReportView.tsx` | Pass section icons config, wire scroll spy, add mobile TOC drawer + back-to-top button |
| `src/pages/SharedReportView.tsx` | Same mobile TOC + back-to-top additions |
| `src/index.css` | Add print styles for new elements, section accent colors |

No new dependencies needed -- everything uses existing Lucide icons, shadcn/ui components (Drawer for mobile TOC), and Tailwind utilities.

