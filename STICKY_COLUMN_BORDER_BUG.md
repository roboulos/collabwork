# Sticky Column Border Bug

## Problem Description

There is a visual bug with the sticky columns feature in the job table. When scrolling horizontally to the right, a vertical separator line slides away to the left, creating a distracting "slit" or "window" effect where table content can be seen scrolling through the gap.

## Current Implementation

The table has two sticky columns:
1. **Checkbox column** - 40px wide, sticky at `left: 0px`
2. **Company column** - 280px wide, sticky at `left: 40px`

Both columns are implemented using CSS `position: sticky` with appropriate z-index layering.

## The Bug

### What Should Happen
The vertical border line between the sticky columns and the scrolling content should remain **stationary at a fixed screen position** (40px from the left edge) at all times, regardless of horizontal scroll position.

### What Actually Happens
When scrolling horizontally to the right:
1. The vertical border line slides/moves to the left
2. This creates a visible gap or "slit" at the original position (40px from left)
3. Through this gap, you can see the table content scrolling behind the sticky section
4. This is very distracting and breaks the illusion of a proper sticky column

## Why This Is Problematic

The border is currently part of the sticky columns themselves (applied via CSS classes on the table cells), so it moves with the columns as they remain "stuck" in position. However, what we need is:

**A border that exists at the HIGHEST z-index layer and remains absolutely fixed at 40px from the left edge of the viewport/container, independent of any scrolling.**

## Technical Details

### Current Code Location
File: `/Users/sboulos/Desktop/ai_projects/ashleyfrontend/ashleyfrontend/components/job-table-enhanced-v3.tsx`

### Attempted Solutions (That Didn't Work)

1. **Border on sticky cells** (lines 117, 211)
   - Added borders directly to TableHead and TableCell with sticky meta
   - Result: Border moves with the table scroll because it's part of the cell

2. **Absolute positioned overlay** (lines 88-91)
   ```tsx
   <div
     className="pointer-events-none absolute top-0 bottom-0 w-0 border-r-2 border-gray-300 dark:border-gray-600 z-[100]"
     style={{ left: '40px' }}
   />
   ```
   - Still slides away when scrolling
   - Likely because it's inside the scrolling container

3. **Conditional borders based on stickyOffset**
   - Tried adding `border-l-2` to Company column
   - Still moves with the scroll

## Root Cause Analysis

The issue is that the border element is inside the horizontally scrolling container (`<div ref={parentRef} className="h-full overflow-auto relative">`). When horizontal scrolling occurs, everything inside this container (including our "absolute" positioned border) scrolls horizontally.

## What We Need

A solution that creates a vertical line at **exactly 40px from the left edge of the visible viewport/screen** that:

1. Has the **highest possible z-index** (above all table content)
2. Is **completely independent** of the horizontal scroll state
3. Remains **fixed** at the same screen position during horizontal scrolling
4. Only appears when there is horizontal scroll (optional enhancement)
5. Matches the height of the visible table area
6. Respects light/dark mode theming

## Possible Solutions to Try

### Option 1: Fixed Positioning Outside Scroll Container
Move the border element outside the scrolling container and use `position: fixed` relative to the viewport.

### Option 2: Sticky Positioning with Different Parent
Create a wrapper that doesn't scroll horizontally and contains the border as a sticky element.

### Option 3: CSS Pseudo-element on Non-scrolling Parent
Use a `::after` or `::before` pseudo-element on a parent container that doesn't participate in horizontal scrolling.

### Option 4: Separate Overlay Component
Create a separate React component that renders outside the table's scroll context but positions itself correctly.

### Option 5: Canvas or SVG Overlay
Use a canvas element or SVG to draw the line, positioned independently of the table.

## Test Case

To verify the fix:
1. Navigate to the dashboard
2. Toggle Morning Brew view ON
3. Scroll horizontally to the right
4. Observe the vertical line at the 40px mark (between checkbox and Company columns)
5. **Expected**: The vertical line should stay perfectly still at 40px from the left edge
6. **Current (broken)**: The vertical line slides to the left, creating a visible gap

## Visual Description

```
BEFORE SCROLL (Correct):
┌─────────┬──────────────────────┬─────────────────┐
│ ☐       │ Company              │ Job Formula     │
│ Select  │ (Sticky)             │ (Scrolls)       │
└─────────┴──────────────────────┴─────────────────┘
          ↑
          This line should stay here

AFTER SCROLLING RIGHT (Current Bug):
┌─────────┬──────────────────────┬─────────────────┐
│ ☐       │ Company              │ Location        │
│ Select  │ (Sticky)             │ (Scrolls)       │
└─────────┴──────────────────────┴─────────────────┘
     ↑
     Line moved here
     (leaves visible gap)

AFTER SCROLLING RIGHT (Desired):
┌─────────┬──────────────────────┬─────────────────┐
│ ☐       │ Company              │ Location        │
│ Select  │ (Sticky)             │ (Scrolls)       │
└─────────┴──────────────────────┴─────────────────┘
          ↑
          Line stays here (fixed)
```

## Additional Context

- Framework: Next.js 15.5.2 with React 19
- Table library: TanStack Table v8
- Styling: Tailwind CSS with shadcn/ui components
- Virtual scrolling: Using @tanstack/react-virtual for performance
- Dark mode support required

## Priority

**High** - This is a visual bug that significantly impacts user experience and makes the sticky columns feature feel broken or poorly implemented.

## Resolution
**Fixed on 2025-11-19**
- **Solution**: Moved the border element outside the scrolling container (`<div ref={parentRef} ...>`) and into a parent relative container. This ensures the border remains fixed relative to the table viewport while the content scrolls underneath it.
- **Verification**: Verified by running the application locally, scrolling the table horizontally, and confirming the border remains stationary at 40px from the left edge.
