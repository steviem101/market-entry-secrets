

# Expand Industry/Sector to 149 Options with Searchable Combobox

## Overview

Replace the current `Select` dropdown for the "Industry / Sector" field on Step 1 of the Report Creator with a searchable combobox (Popover + Command pattern). The existing 10-item `INDUSTRY_OPTIONS` list will be replaced with the full 149 industries provided.

## What changes for the user

- The Industry / Sector field becomes a **type-to-search** input instead of a plain dropdown
- Clicking the field opens a popover with a search box and a scrollable list of 149 industries
- Typing filters the list in real time (e.g., typing "fin" shows "Financial Services", "FinTech", "Fine Art")
- Selecting an industry closes the popover and displays the chosen value
- A check mark appears next to the currently selected industry
- The field still shows "Select industry" as placeholder when nothing is selected

## Files to change

### 1. `src/components/report-creator/intakeSchema.ts`

- Replace the current 10-item `INDUSTRY_OPTIONS` array with the full 149 industries (alphabetically sorted, matching the provided list exactly)
- No schema validation changes needed -- the Zod schema already accepts any non-empty string

### 2. `src/components/report-creator/IntakeStep1.tsx`

- Import `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`
- Import `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` from `@/components/ui/command`
- Import `Check`, `ChevronsUpDown` icons from `lucide-react`
- Replace the Industry / Sector `Select` component with a Popover + Command combobox:
  - A button trigger styled to match the existing Select fields (same height, border, rounded corners)
  - A popover containing a Command component with search input and scrollable list
  - Selecting an item calls `setValue('industry_sector', value)` and closes the popover
- Add local state `const [industryOpen, setIndustryOpen] = useState(false)` to control the popover

### Component structure (Industry field only)

```text
<Popover open={industryOpen} onOpenChange={setIndustryOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" ...>
      {selectedIndustry || "Select industry"}
      <ChevronsUpDown />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-full p-0">
    <Command>
      <CommandInput placeholder="Search industry..." />
      <CommandList>
        <CommandEmpty>No industry found.</CommandEmpty>
        <CommandGroup>
          {INDUSTRY_OPTIONS.map(industry => (
            <CommandItem onSelect={...}>
              <Check /> {industry}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

## Technical notes

- All 149 industry values are stored as plain strings, so they flow through unchanged to the report generation pipeline and Lemlist matching
- The Zod validation (`z.string().min(1)`) does not restrict to specific values, so expanding the list has zero backend impact
- The `cmdk` library handles fuzzy search natively -- no custom filtering code needed
- The popover width will match the trigger button width using `w-[--radix-popover-trigger-width]` to stay visually consistent
- The other fields (Country, Stage, Employees) remain as standard Select dropdowns since their lists are small (4-10 items)

