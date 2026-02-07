

# Remove Whitespace Below Footer Columns

## Problem
The 4-column footer grid stretches all columns to the height of the tallest one (the Brand column on the left). The 3 right-hand columns -- Quick Links, Resources, and Stay Updated -- are shorter, so they have visible whitespace below their content.

## Fix
Add `items-start` to the grid container on line 48 of `src/components/Footer.tsx`. This aligns all grid children to the top of their row instead of stretching them to fill the full height.

### Change
**File**: `src/components/Footer.tsx`, line 48

Before:
```
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
```

After:
```
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
```

One line, one class addition. No other changes needed.

