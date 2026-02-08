

# Improve Report Typography and Spacing

## The Problem

The report sections look dense and cramped because of two issues:

1. **The Tailwind Typography plugin is installed but not registered.** The `@tailwindcss/typography` package is in `package.json` but is missing from the `plugins` array in `tailwind.config.ts`. This means the `prose` classes on the report content div are doing nothing -- paragraphs, headings, and lists have no spacing applied.

2. **The prose size is set to `prose-sm`**, which even once the plugin works will use a smaller, tighter layout than ideal for long-form report content.

## What will change for the user

- Clear paragraph spacing between blocks of text (roughly 1.25em gaps)
- Headings like "Strengths", "Weaknesses", "Opportunities" get visible top margin to separate them from previous content
- List items get comfortable spacing
- Overall line height increases slightly for easier reading
- The section cards get more generous internal padding
- Spacing between sections increases from 24px to 32px

## Changes

### 1. Register the Typography plugin (`tailwind.config.ts`)

Add `require("@tailwindcss/typography")` to the plugins array alongside the existing `tailwindcss-animate` plugin. This single change will activate all the `prose` classes already on the report content.

### 2. Upgrade prose styling (`ReportSection.tsx`)

- Change `prose-sm` to `prose` (base size) for more comfortable reading at standard body text size
- Add spacing overrides for report-specific needs:
  - `prose-p:mb-4` -- generous paragraph bottom margin
  - `prose-headings:mt-8 prose-headings:mb-3` -- strong visual separation before headings
  - `prose-li:my-1` -- comfortable list item spacing
  - `leading-relaxed` -- slightly more line height

### 3. Increase card padding and section spacing (`ReportSection.tsx`)

- Increase `CardHeader` padding: `pb-3` to `pb-4` with `pt-6 px-6`
- Increase `CardContent` padding: add `px-6 pb-6`
- Bump title from `text-xl` to `text-2xl` for clearer section demarcation

### 4. Increase spacing between sections (`ReportView.tsx` and `SharedReportView.tsx`)

- Change the section container from `space-y-6` (24px) to `space-y-8` (32px) for more breathing room between cards

### 5. Add report-specific prose overrides (`index.css`)

Add a `.report-prose` utility class with fine-tuned spacing for the report context:
- Ensure strong/bold text has slightly different weight styling
- First paragraph after a heading gets no top margin (avoid double-spacing)
- Horizontal rules get generous vertical margin as visual dividers

## Technical details

| File | Change |
|---|---|
| `tailwind.config.ts` | Add `require("@tailwindcss/typography")` to plugins array |
| `src/components/report/ReportSection.tsx` | Upgrade `prose-sm` to `prose`, add spacing modifiers, increase card padding |
| `src/pages/ReportView.tsx` | Change `space-y-6` to `space-y-8` |
| `src/pages/SharedReportView.tsx` | Change `space-y-6` to `space-y-8` |
| `src/index.css` | Add `.report-prose` utility for report-specific fine-tuning |

