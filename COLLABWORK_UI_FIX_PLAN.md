# ✅ CollabWORK Dashboard UI Fix Playbook (95% Confidence)

## High-Confidence Root Causes (by issue)
- **Row selection jump** – Selection styling in `styles/table-theme.css:150-189` swaps in a pseudo-element and reintroduces a left border, so each click forces the layout engine to recalc the table row box (visible as a ~6px right shift). Virtualizer still assumes 72px rows (`components/job-table-enhanced-v3.tsx:64-75`) and is never told to re-measure each `<tr>`, which amplifies the movement.
- **Toolbar toggle overlap** – Spacing relies on `margin: 0 32px !important` in `.view-toggle` (`styles/table-theme.css:465-517`) while the toolbar cluster (`components/data-table/data-table-toolbar.tsx:97-140`) is a tight flex row that still renders the selection counter (`table.getFilteredSelectedRowModel().rows.length`) inline. On narrow widths the counter text (“0”, or formerly the total records) collides with the switch, and the custom pseudo-thumb conflicts with the Radix thumb so the slider dot disappears.
- **Modal transparency** – The overlay/content combo in `components/ui/dialog.tsx:21-48` uses `bg-black/90`, but the dashboard container keeps rendering under it because the scrim is semi-transparent and the content surface inherits `bg-background` (a translucent HSL). Result: list rows glow through the modal.
- **Table density** – Even after fixing row height in CSS, we still have `TableCell` default `py-2` (`components/ui/table.tsx:84-96`) plus inner wrappers such as `div.group.relative.min-h-[48px].py-2` in multiple column renderers (`components/jobs-columns-v4.tsx:258`, `332`, `519`, etc.). Real row height ends up 64-72px, and virtualization is tuned to 72px, so everything looks bloated.
- **Priority badge aesthetics** – Priority chip is a raw `<span className="badge badge-priority">` (`components/jobs-columns-v4.tsx:970-1006`) that relies on the gradient/glow in `styles/table-theme.css:203-216`. In dark mode it becomes neon and dominates the row.
- **Contrast problems** – Salary & status greens are forced to `#10b981` / `#34d399` (`styles/table-theme.css:659-666`), onsite badge dark mode text barely meets contrast, and the MB status stack mixes grays that drop below 4.5:1.

## Fix Specifications

### 1. Row selection jumping (highest priority)
- Replace the dynamic border/pseudo-element with a non-layout-affecting highlight.
  - Update `.job-row` in `styles/table-theme.css` to drop `border-left` altogether; instead use `box-shadow: inset 3px 0 0 var(--border-selected)` and `outline: 1px solid var(--border-selected)` when `data-selected="true"`.
  - Remove the current `::before` block (181-189) and the priority `::after` gradient; reintroduce the priority accent with `box-shadow: inset 3px 0 0 var(--accent-morningbrew)` layered on top.
- Wire virtualization to real row metrics.
  - Change `estimateSize` to `() => 52` in `components/job-table-enhanced-v3.tsx:67` and store `const measureRow = virtualizer.measureElement;`.
  - Pass `ref={(node) => node && measureRow(node)}` into `<TableRow>` (`components/job-table-enhanced-v3.tsx:169`).
  - Keep the `min-height` guarantee (52px) in CSS, but allow max height to be `auto` so multiline rows do not overflow.

### 2. Toolbar toggle overlap + missing slider dot
- Rebuild the toolbar action cluster.
  - In `components/data-table/data-table-toolbar.tsx:97-140`, wrap the toggle/indicators in `div className="flex items-center gap-3 flex-shrink-0"` and move the selected-count text into its own `span` with `min-w-[136px]` so it never collides.
  - Expose `totalItems` again: `const formattedTotal = totalItems ? 
intlFormat.format(totalItems) : null;` and render `formattedTotal && <span className="text-sm text-muted-foreground flex-shrink-0">{formattedTotal} records</span>` before the switch.
- Simplify the switch styling.
  - Remove the hard-coded pseudo thumb and margins from `.view-toggle` in `styles/table-theme.css:465-517`; rely on flex gap for spacing.
  - Extend `components/ui/switch.tsx` so it accepts an optional `thumbClassName` prop; apply `cn("h-5 w-5 bg-white shadow", thumbClassName)` to the `SwitchPrimitives.Thumb` and set `data-[state=checked]:translate-x-[28px]` for the bigger chassis.
  - Update the toolbar usage to `<Switch className="view-toggle" thumbClassName="view-toggle-thumb" ... />` and drop the manual `<span>` child.

### 3. Modal opacity
- In `components/ui/dialog.tsx`:
  - Switch the overlay class to `"fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm"` so the background is effectively opaque.
  - Give the content a solid surface: `className={cn("fixed ... bg-white/100 dark:bg-slate-950 shadow-2xl", className)}` and add `data-testid="modal-content"` for future snapshot testing.
  - Ensure the modal portal mounts under `document.body` (it already does) and add `aria-modal="true"` for the content element.

### 4. Table density & layout
- Tighten the structural components.
  - Change `TableCell` padding to `px-3 py-1.5` (`components/ui/table.tsx:91`) and add `className="leading-tight"` to reduce vertical rhythm.
  - Audit column renderers: remove redundant `py-2` and lower `min-h` to `min-h-[40px]` for containers at `components/jobs-columns-v4.tsx:263, 321, 402, 628, 702, 871`.
  - Trim the virtualization shell width: replace `min-w-[2000px]` with `min-w-[1600px]` (or compute from active column sizes) so the table fits typical 1440px viewports without horizontal drag.
- Synchronize virtualization defaults.
  - After resizing cells, re-run `virtualizer.measure()` when column widths change (hook into `columnSizing` effect) to prevent stale offsets.

### 5. Priority badge & badge system polish
- Replace raw spans with the design-system `Badge` component.
  - Change the priority badge render at `components/jobs-columns-v4.tsx:970-1006` to `<Badge variant="warning" className="gap-1 px-2 py-0.5 font-semibold text-xs">...` (no glow).
  - Delete the `.badge-priority` block in `styles/table-theme.css:203-216`; introduce a shared `.badge-soft-warning` utility with toned-down background (`#fef3c7` light, `#451a03` dark) and no blur.
- Align other badges: ensure onsite badge dark theme uses `color: #f8fafc` and `background: #1f2937` for 4.5:1 contrast.

### 6. Font & color contrast updates
- Modify the financial palette in `styles/table-theme.css:659-666` to `#047857` (light) / `#4ade80` (dark) and reduce font-weight to 600 so salaries stop glowing.
- Update MB status subtext (`components/jobs-columns-v4.tsx:748-763`) to `text-slate-500 dark:text-slate-300` and ensure italics remain readable.
- Raise default typography contrast by adding `.dark .text-muted-foreground { color: #cbd5f5; }` in CSS and auditing any remaining inline `text-gray-400` usage.

## Implementation Order (do not parallelize row & toolbar work)
1. **Row selection styles + virtualizer hooks** – stop the jump before touching anything else.
2. **Toolbar cluster rebuild** – solve spacing and slider visibility, then verify responsive breakpoints.
3. **Modal overlay/content adjustments** – confirm no background bleed in both themes.
4. **Density pass** – tighten table cells, re-run virtualizer, tune min widths.
5. **Badge & color refinements** – priority chip, onsite badge, salary/muted text colors.
6. **Regression sweep** – dark/light mode snapshots, keyboard selection, virtualization scroll, pagination.

## Validation Checklist
- [ ] `npm run lint` (ESLint across new JSX changes).
- [ ] `npm run test` (if unit tests exist) and `npm run build` to catch TypeScript regressions.
- [ ] Manual QA in Chrome & Safari at 1280px, 1440px, and 1920px view widths.
- [ ] Verify row selection stays fixed while scrolling rapidly (virtualization sanity).
- [ ] Toolbar: switch between views 10x; ensure count badge and toggle never overlap, slider thumb always visible.
- [ ] Modal: open “Add Jobs” dialog, confirm zero bleed-through and focus trap works with keyboard.
- [ ] Accessibility spot check with Chrome DevTools color contrast tool on salary text, onsite badge, MB status badges.

## Additional Notes
- Keep an eye on external CSS imports: `../styles/table-theme.css` is pulled into the table component; once the badge/selection blocks are trimmed, rerun `npm run lint -- --fix` to remove any unused selectors flagged by Tailwind pruning.
- After the density pass, reevaluate `pageSize` defaults (500) – with virtualization tuned correctly, we can bump `estimateSize` dynamically if perf still lags.
